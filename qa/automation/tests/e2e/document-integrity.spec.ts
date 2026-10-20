import { test, expect, chromium, type Browser, type BrowserContext, type APIRequestContext } from '@playwright/test';
import { createHash, randomUUID } from 'node:crypto';
import { call, configuration, isUuid, newClient } from '../../helpers/api';
import { integrityPdf } from '../../fixtures/pdf';

test('E2E-01 — Owner Uploads and Retrieves an Intact PDF', async ({ baseURL }) => {
  const config = configuration();
  const web = new URL(baseURL!);
  if (!['http:', 'https:'].includes(web.protocol) || web.username || web.password ||
      web.pathname !== '/' || web.search || web.hash) throw new Error('WEB_BASE_URL must be an HTTP(S) origin.');
  if (!['localhost', '127.0.0.1', '[::1]'].includes(web.hostname) && process.env.ALLOW_REMOTE_API !== 'true') {
    throw new Error('Remote browser execution requires explicit approval and ALLOW_REMOTE_API=true.');
  }
  const folderName = `QA_E2E_01_${randomUUID()}`;
  const fileName = 'qa-integrity.pdf';
  const fixture = integrityPdf();
  const hash = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let api: APIRequestContext | undefined;
  let token: string | undefined;
  let folderId: string | undefined;
  let fileId: string | undefined;
  let failed = false;
  let stage = 'initialization';
  type UploadStage = 'file-input' | 'upload-intent' | 'storage-put' | 'upload-complete' | 'completion-json' | 'file-row';
  const diagnostics: Record<UploadStage, { observed: boolean; status?: number;
    requestStarted?: boolean; responseReceived?: boolean; correlationMatched?: boolean;
    failure?: 'timeout' | 'request-failed' | 'parse-failed' }> = {
    'file-input': { observed: false },
    'upload-intent': { observed: false, requestStarted: false, responseReceived: false, correlationMatched: false },
    'storage-put': { observed: false, requestStarted: false, responseReceived: false },
    'upload-complete': { observed: false, requestStarted: false, responseReceived: false, correlationMatched: false },
    'completion-json': { observed: false }, 'file-row': { observed: false },
  };
  let removeUploadObservers = () => {};
  try {
    // Manage context explicitly: no automatic failure DOM snapshot containing account data.
    browser = await chromium.launch();
    context = await browser.newContext({ acceptDownloads: true, baseURL: web.origin });
    const page = await context.newPage();
    page.setDefaultTimeout(20_000);
    const matches = (response: import('@playwright/test').Response, path: string, method: string) => {
      const url = new URL(response.url());
      return url.origin === config.baseURL && url.pathname === path && response.request().method() === method;
    };
    stage = 'UI login';
    await page.goto('/login');
    await page.getByLabel('Email', { exact: true }).fill(config.a.email);
    await page.getByLabel('Password', { exact: true }).fill(config.a.password);
    const [loginResponse] = await Promise.all([
      page.waitForResponse(response => matches(response, '/auth/login', 'POST')),
      page.getByRole('button', { name: 'Sign in', exact: true }).click(),
    ]);
    expect(loginResponse.status()).toBe(200);
    const loginBody = await loginResponse.json();
    expect(typeof loginBody?.accessToken === 'string' && loginBody.accessToken.length > 0,
      'UI login must provide an authentication token').toBe(true);
    token = loginBody.accessToken;
    await page.getByRole('button', { name: 'Sign out', exact: true }).waitFor();
    api = await newClient(config.baseURL);
    stage = 'room ownership precondition';
    const room = await call(api, 'GET', `/data-rooms/${config.roomId}`, stage, token);
    expect(room.status).toBe(200);
    expect(room.body?.id === config.roomId && room.body?.accessLevel === 'OWNER', 'A must own the room').toBe(true);
    await page.goto(`/room/${config.roomId}`);
    await page.getByRole('main').getByRole('button', { name: 'New folder', exact: true }).first().click();
    const dialog = page.getByRole('dialog', { name: 'New folder', exact: true });
    await dialog.getByLabel('Folder name', { exact: true }).fill(folderName);
    stage = 'disposable UI folder creation';
    // Settle both operations so a received creation response is tracked even if clicking fails.
    const creation = await Promise.allSettled([
      page.waitForResponse(response => matches(response, '/folders', 'POST')),
      dialog.getByRole('button', { name: 'Create', exact: true }).click(),
    ]);
    if (creation[0].status !== 'fulfilled') throw new Error('Creation outcome unknown');
    const response = creation[0].value;
    const body = await response.json();
    if (response.status() === 201 && isUuid(body?.id) && body.name === folderName &&
        body.dataRoomId === config.roomId && body.parentId === null) folderId = body.id;
    expect(Boolean(folderId), 'Creation must confirm the exact disposable folder').toBe(true);
    expect(creation[1].status === 'fulfilled', 'Create action must complete').toBe(true);
    await dialog.waitFor({ state: 'hidden' });
    await page.getByRole('row').filter({ has: page.getByText(folderName, { exact: true }) }).click();
    await page.waitForURL(url => url.pathname === `/folder/${folderId}`);
    stage = 'file-input';
    let intendedFileId: string | undefined;
    let storageUrl: string | undefined;
    let intentParsing: Promise<void> = Promise.resolve();
    // Keep potential early events in memory so parsing the intent cannot race storage events.
    const network: { url: string; method: string; status?: number; failed: boolean; started?: boolean }[] = [];
    const updateNetworkDiagnostics = () => {
      for (const event of network) {
        const url = new URL(event.url);
        const target: UploadStage | undefined = event.method === 'PUT' && event.url === storageUrl
          ? 'storage-put'
          : event.method === 'POST' && url.origin === config.baseURL &&
              /^\/files\/[^/]+\/complete$/.test(url.pathname) ? 'upload-complete' : undefined;
        if (target) {
          if (event.started) diagnostics[target].requestStarted = true;
          if (event.status !== undefined) {
            diagnostics[target].observed = true;
            diagnostics[target].responseReceived = true;
            diagnostics[target].status = event.status;
          }
          if (target === 'upload-complete' && intendedFileId && url.pathname === `/files/${intendedFileId}/complete`) {
            diagnostics[target].correlationMatched = true;
          }
          if (event.failed) diagnostics[target].failure = 'request-failed';
        }
      }
    };
    const onResponse = (response: import('@playwright/test').Response) => {
      network.push({ url: response.url(), method: response.request().method(), status: response.status(), failed: false });
      if (matches(response, '/files/upload-intent', 'POST')) {
        diagnostics['upload-intent'].observed = true;
        diagnostics['upload-intent'].responseReceived = true;
        diagnostics['upload-intent'].status = response.status();
        // Match our generated fixture and folder, not unrelated background activity.
        let input;
        try { input = response.request().postDataJSON(); }
        catch { diagnostics['upload-intent'].failure = 'parse-failed'; return; }
        if (input?.folderId !== folderId || input?.dataRoomId !== config.roomId || input?.name !== fileName) return;
        diagnostics['upload-intent'].correlationMatched = true;
        intentParsing = (async () => {
          try {
            const intent = await response.json();
            if (isUuid(intent?.fileId)) intendedFileId = intent.fileId;
            if (typeof intent?.uploadUrl === 'string') storageUrl = intent.uploadUrl;
            updateNetworkDiagnostics();
          } catch { diagnostics['upload-intent'].failure = 'parse-failed'; }
        })();
      }
      updateNetworkDiagnostics();
    };
    const onRequestFailed = (request: import('@playwright/test').Request) => {
      network.push({ url: request.url(), method: request.method(), failed: true });
      const url = new URL(request.url());
      if (url.origin === config.baseURL && url.pathname === '/files/upload-intent' && request.method() === 'POST') {
        diagnostics['upload-intent'].failure = 'request-failed';
      }
      updateNetworkDiagnostics();
    };
    const onRequest = (request: import('@playwright/test').Request) => {
      network.push({ url: request.url(), method: request.method(), failed: false, started: true });
      const url = new URL(request.url());
      if (url.origin === config.baseURL && url.pathname === '/files/upload-intent' && request.method() === 'POST') {
        diagnostics['upload-intent'].requestStarted = true;
        try {
          const input = request.postDataJSON();
          if (input?.folderId === folderId && input?.dataRoomId === config.roomId && input?.name === fileName) {
            diagnostics['upload-intent'].correlationMatched = true;
          }
        } catch { diagnostics['upload-intent'].failure = 'parse-failed'; }
      }
      updateNetworkDiagnostics();
    };
    page.on('request', onRequest);
    page.on('response', onResponse);
    page.on('requestfailed', onRequestFailed);
    removeUploadObservers = () => {
      page.off('request', onRequest);
      page.off('response', onResponse);
      page.off('requestfailed', onRequestFailed);
    };
    let operationFailed = false;
    const recordOperationFailure = (operation: UploadStage, error: unknown): never => {
      // Report the rejected operation, not the earliest missing network observation.
      if (!operationFailed) { stage = operation; operationFailed = true; }
      throw error;
    };
    const completionWait = page.waitForResponse(async response => {
      if (new URL(response.url()).origin !== config.baseURL ||
          !/^\/files\/[^/]+\/complete$/.test(new URL(response.url()).pathname) ||
          response.request().method() !== 'POST') return false;
      await intentParsing;
      return intendedFileId !== undefined && new URL(response.url()).pathname === `/files/${intendedFileId}/complete`;
    }, { timeout: 40_000 });
    const [completed] = await Promise.all([
      completionWait.catch(error => recordOperationFailure('upload-complete', error)),
      page.locator('input[type="file"]').setInputFiles({ name: fileName, mimeType: 'application/pdf', buffer: fixture })
        .then(() => {
          diagnostics['file-input'].observed = true;
          if (!operationFailed) stage = 'upload-complete';
        })
        .catch(error => recordOperationFailure('file-input', error)),
    ]);
    stage = 'upload-complete';
    expect(completed.status(), 'Upload completion must succeed').toBe(201);
    stage = 'completion-json';
    const uploaded = await completed.json().catch(() => {
      diagnostics['completion-json'].failure = 'parse-failed';
      throw new Error('Completion JSON parsing failed');
    });
    diagnostics['completion-json'].observed = true;
    expect(isUuid(uploaded?.id) && uploaded?.folderId === folderId && uploaded?.name === fileName,
      'Uploaded PDF must belong to the disposable folder').toBe(true);
    expect(uploaded.id === intendedFileId, 'Completion must match the observed upload intent').toBe(true);
    fileId = uploaded.id;
    stage = 'file-row';
    const row = page.getByRole('row').filter({ has: page.getByText(fileName, { exact: true }) });
    await row.waitFor();
    diagnostics['file-row'].observed = true;
    removeUploadObservers();
    stage = 'refresh persistence';
    await page.reload();
    await page.waitForURL(url => url.pathname === `/folder/${folderId}`);
    await row.waitFor();
    await row.click();
    await page.waitForURL(url => url.pathname === `/file/${fileId}`);
    stage = 'viewer shell';
    await page.getByText(fileName, { exact: true }).waitFor();
    await page.locator('object[type="application/pdf"]').waitFor({ state: 'attached' });
    // Inspect only a boolean: do not put the signed object URL in assertion output.
    expect(await page.locator('object[type="application/pdf"]').evaluate(element =>
      Boolean(element.getAttribute('data'))), 'Viewer must have a preview source').toBe(true);
    stage = 'download integrity';
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download', exact: true }).click(),
    ]);
    expect((await download.failure()) === null, 'Download must complete').toBe(true);
    expect(download.suggestedFilename() === fileName, 'Downloaded filename must match').toBe(true);
    const stream = await download.createReadStream();
    if (!stream) throw new Error('No download stream');
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    expect(hash(Buffer.concat(chunks)) === hash(fixture), 'Downloaded SHA-256 must match fixture').toBe(true);
    await download.delete();
  } catch (error) {
    failed = true;
    if (Object.prototype.hasOwnProperty.call(diagnostics, stage)) {
      const entry = diagnostics[stage as UploadStage];
      const timedOut = error instanceof Error && error.name === 'TimeoutError';
      if (!entry.failure && timedOut) entry.failure = 'timeout';
      // Only the allowlisted structure is emitted, never raw browser/network data.
      console.warn(JSON.stringify({ stage, ...(timedOut ? { timeoutOperation: stage } : {}), upload: diagnostics }));
    }
    // Boolean/status assertion errors are safe; browser errors may contain signed URLs or DOM data.
    if (error instanceof Error && 'matcherResult' in error) throw error;
    throw new Error(`E2E-01 failed during ${stage}; sensitive browser details suppressed. Test marker ${folderName}.`);
  } finally {
    removeUploadObservers();
    const errors: Error[] = [];
    // Stop browser uploads before recursive API cleanup; never search by name.
    try { await context?.close(); } catch { errors.push(new Error('Browser context cleanup failed.')); }
    try { await browser?.close(); } catch { errors.push(new Error('Browser cleanup failed.')); }
    if (folderId && api && token) {
      try {
        const deleted = await call(api, 'DELETE', `/folders/${folderId}`, 'Disposable folder cleanup', token);
        if (deleted.status !== 204) throw new Error('Cleanup denied');
      } catch { errors.push(new Error(`Cleanup failed; review test folder ${folderId}${fileId ? ` and file ${fileId}` : ''}.`)); }
    } else if (stage === 'disposable UI folder creation') {
      console.warn(`Folder creation outcome unconfirmed; review marker ${folderName}. No name-based deletion attempted.`);
    }
    try { await api?.dispose(); } catch { errors.push(new Error('API context cleanup failed.')); }
    for (const error of errors) console.warn(error.message);
    if (!failed && errors.length) throw errors[0];
  }
});
