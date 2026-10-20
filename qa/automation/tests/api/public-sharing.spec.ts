import { test, expect, type APIRequestContext } from '@playwright/test';
import { call, configuration, isUuid, login, newClient } from '../../helpers/api';
import { disposableFolder } from '../../helpers/resources';

test('API-SEC-05 — Public Link Scope and Revocation', async () => {
  const config = configuration();
  const clients: APIRequestContext[] = [];
  let parent: ReturnType<typeof disposableFolder> | undefined;
  let sibling: ReturnType<typeof disposableFolder> | undefined;
  let owner: APIRequestContext | undefined;
  let ownerToken: string | undefined;
  let parentId: string | undefined;
  let shareId: string | undefined;
  let shareAttempted = false;
  let revokeAttempted = false;
  let revoked = false;
  let testFailed = false;
  const folders: { id: string; name: string }[] = [];

  const revoke = async () => {
    if (!shareAttempted || revoked) return;
    if (!shareId || !owner || !ownerToken) {
      throw new Error(`Public share outcome unknown; retain test parent ${parentId} for review.`);
    }
    if (revokeAttempted) throw new Error(`Revocation not retried; review share ${shareId}, parent ${parentId}.`);
    revokeAttempted = true;
    const response = await call(owner, 'DELETE', `/shares/${shareId}`,
      `Revoke test share ${shareId} for parent ${parentId}`, ownerToken);
    if (response.status !== 204) {
      throw new Error(`Revocation HTTP ${response.status}; review share ${shareId}, parent ${parentId}.`);
    }
    revoked = true;
  };
  try {
    owner = await newClient(config.baseURL); clients.push(owner);
    const anonymous = await newClient(config.baseURL); clients.push(anonymous);
    ownerToken = await login(owner, config.a);
    const identity = await call(owner, 'GET', '/auth/me', 'Owner identity', ownerToken);
    expect(identity.status).toBe(200);
    expect(isUuid(identity.body?.id), 'Owner identity must be valid').toBe(true);
    const room = await call(owner, 'GET', `/data-rooms/${config.roomId}`, 'Owner room', ownerToken);
    expect(room.status).toBe(200);
    expect(room.body?.id === config.roomId && room.body?.accessLevel === 'OWNER',
      'A must own the designated room').toBe(true);

    parent = disposableFolder(owner, ownerToken, config.roomId, 'API_SEC_05_PARENT');
    parentId = (await parent.create()).id; // Helper requires 201 and matching metadata.
    folders.push({ id: parentId, name: parent.name });
    const child = disposableFolder(owner, ownerToken, config.roomId, 'API_SEC_05_CHILD', parentId);
    const childId = (await child.create()).id;
    folders.push({ id: childId, name: child.name });
    sibling = disposableFolder(owner, ownerToken, config.roomId, 'API_SEC_05_SIBLING');
    const siblingId = (await sibling.create()).id;
    folders.push({ id: siblingId, name: sibling.name });

    const noValues = (body: unknown, values: string[]) => {
      const serialized = JSON.stringify(body) ?? '';
      expect(values.every(value => !serialized.includes(value)),
        'Response must not expose known out-of-scope metadata or secrets').toBe(true);
    };
    const privateValues = [config.roomId, ...folders.flatMap(folder => [folder.id, folder.name])];
    const denied = (response: Awaited<ReturnType<typeof call>>, status: number, secret?: string) => {
      expect(response.status).toBe(status);
      expect(response.body?.statusCode === status, 'Expected API error contract').toBe(true);
      noValues(response.body, [...privateValues, ...(secret ? [secret] : [])]);
      expect(['id', 'name', 'resourceId', 'resourceName', 'dataRoomId', 'items', 'folders', 'token']
        .every(key => !Object.prototype.hasOwnProperty.call(response.body, key)),
      'Denial must not expose resource fields').toBe(true);
    };
    const checkContents = (response: Awaited<ReturnType<typeof call>>, id: string) => {
      expect(response.status).toBe(200);
      const items = response.body?.items;
      expect(Array.isArray(items) && response.body.nextCursor === null &&
        (id === parentId
          ? items.length === 1 && items[0]?.type === 'folder' && items[0]?.id === childId &&
            items[0]?.name === child.name && items[0]?.parentId === parentId
          : items.length === 0), 'Contents must match only the disposable fixture').toBe(true);
    };
    const verifyOwner = async () => {
      for (const folder of folders) {
        checkContents(await call(owner!, 'GET', `/folders/${folder.id}/contents`, 'Owner contents', ownerToken), folder.id);
        const crumbs = await call(owner!, 'GET', `/folders/${folder.id}/breadcrumbs`, 'Owner breadcrumbs', ownerToken);
        expect(crumbs.status).toBe(200);
        const current = Array.isArray(crumbs.body?.folders) ? crumbs.body.folders.at(-1) : undefined;
        expect(crumbs.body?.accessLevel === 'OWNER' && crumbs.body?.dataRoomId === config.roomId &&
          current?.id === folder.id && current?.name === folder.name, 'Owner state must remain unchanged').toBe(true);
      }
    };
    await verifyOwner();
    for (const folder of folders) {
      denied(await call(anonymous, 'GET', `/folders/${folder.id}/contents`, 'Anonymous private read'), 401);
    }
    const before = await call(owner, 'GET', `/shares?resourceType=FOLDER&resourceId=${parentId}`,
      'Initial parent shares', ownerToken);
    expect(before.status).toBe(200);
    expect(Array.isArray(before.body?.items) && before.body.items.length === 0 && before.body.nextCursor === null,
      'New parent must have no existing shares').toBe(true);
    shareAttempted = true;
    const created = await call(owner, 'POST', '/shares', `Create public share for test parent ${parentId}`, ownerToken,
      { resourceType: 'FOLDER', resourceId: parentId, mode: 'PUBLIC_LINK' });
    // Track only the matching new grant, before token assertions, so failures can still revoke it.
    if (created.status === 201 && isUuid(created.body?.id) && created.body?.resourceId === parentId &&
        created.body?.resourceType === 'FOLDER' && created.body?.mode === 'PUBLIC_LINK' &&
        created.body?.createdById === identity.body.id && created.body?.granteeEmail === null &&
        created.body?.revokedAt === null) shareId = created.body.id;
    if (!shareId) throw new Error(`Public share creation unconfirmed (HTTP ${created.status}); review parent ${parentId}.`);
    expect(typeof created.body?.token === 'string' && created.body.token.length > 0,
      'Public share must return a token').toBe(true);
    const publicToken: string = created.body.token;
    const base = `/public/${encodeURIComponent(publicToken)}`;
    const summary = await call(anonymous, 'GET', base, 'Public summary');
    expect(summary.status).toBe(200);
    expect(summary.body?.resourceType === 'FOLDER' && summary.body?.resourceId === parentId &&
      summary.body?.resourceName === parent.name && summary.body?.dataRoomId === config.roomId,
    'Public summary must identify only the shared folder').toBe(true);
    // dataRoomId is deliberately included by the public summary contract.
    noValues(summary.body, [siblingId, sibling.name, publicToken, ownerToken]);
    for (const id of [parentId, childId]) {
      const response = await call(anonymous, 'GET', `${base}/folders/${id}/contents`, 'Public allowed contents');
      checkContents(response, id);
      noValues(response.body, [siblingId, sibling.name, publicToken, ownerToken]);
    }
    // Same supported folder endpoint as the successful controls, with a real outside ID.
    denied(await call(anonymous, 'GET', `${base}/folders/${siblingId}/contents`, 'Public sibling scope denial'), 404, publicToken);
    // Supported room-root route; folder tokens cannot expand their scope to the room.
    denied(await call(anonymous, 'GET', `${base}/contents`, 'Public room-root denial'), 404, publicToken);
    await revoke();
    for (const path of [base, `${base}/folders/${parentId}/contents`, `${base}/folders/${childId}/contents`]) {
      denied(await call(anonymous, 'GET', path, 'Revoked public link'), 410, publicToken);
    }
    await verifyOwner();
  } catch (error) {
    testFailed = true;
    throw error;
  } finally {
    const cleanupErrors: unknown[] = [];
    try {
      await revoke();
      await parent?.cleanup(); // Also removes the test child, never an unrelated root.
    } catch (error) { cleanupErrors.push(error); }
    // Sibling has no share; its independent cleanup is safe even if parent revocation failed.
    try { await sibling?.cleanup(); } catch (error) { cleanupErrors.push(error); }
    for (const error of cleanupErrors) {
      console.warn(error instanceof Error ? error.message : 'Disposable resource cleanup failed.');
    }
    const disposal = await Promise.allSettled(clients.map(client => client.dispose()));
    if (disposal.some(result => result.status === 'rejected')) {
      const error = new Error('Request context disposal failed; details suppressed.');
      cleanupErrors.push(error); console.warn(error.message);
    }
    if (!testFailed && cleanupErrors.length) throw cleanupErrors[0];
  }
});
