import { test, expect, type APIRequestContext } from '@playwright/test';
import { call, configuration, isUuid, login, newClient } from '../../helpers/api';
import { disposableFolder, disposableFolderShare } from '../../helpers/resources';

test('API-SEC-04 — Folder Sharing Inheritance and Revocation', async () => {
  const config = configuration();
  const clients: APIRequestContext[] = [];
  let parent: ReturnType<typeof disposableFolder> | undefined;
  let share: ReturnType<typeof disposableFolderShare> | undefined;
  const folders: { id: string; name: string }[] = [];
  let testFailed = false;
  let revocationAttempted = false;
  let revocationSucceeded = false;
  try {
    const owner = await newClient(config.baseURL); clients.push(owner);
    const viewer = await newClient(config.baseURL); clients.push(viewer);
    const ownerToken = await login(owner, config.a);
    const viewerToken = await login(viewer, config.b);
    const a = await call(owner, 'GET', '/auth/me', 'Owner identity', ownerToken);
    const b = await call(viewer, 'GET', '/auth/me', 'Viewer identity', viewerToken);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(isUuid(a.body?.id) && isUuid(b.body?.id) && a.body.id !== b.body.id &&
      typeof b.body?.email === 'string' && b.body.email.toLowerCase() === config.b.email.toLowerCase(),
    'Distinct identities and designated recipient are required').toBe(true);
    const room = await call(owner, 'GET', `/data-rooms/${config.roomId}`, 'Owner room', ownerToken);
    expect(room.status).toBe(200);
    expect(room.body?.id === config.roomId && room.body?.accessLevel === 'OWNER',
      'A must own the designated room').toBe(true);
    expectDenial(await call(viewer, 'GET', `/data-rooms/${config.roomId}`, 'Unshared room', viewerToken),
      404, [config.roomId]);

    parent = disposableFolder(owner, ownerToken, config.roomId, 'API_SEC_04_PARENT');
    const parentResult = await parent.create();
    expect(parentResult.result.status).toBe(201);
    folders.push({ id: parentResult.id, name: parent.name });
    const createChild = async (marker: string) => {
      const child = disposableFolder(owner, ownerToken, config.roomId, marker, parentResult.id);
      const created = await child.create();
      // Helper validates exact name, room and parent before returning the ID.
      folders.push({ id: created.id, name: child.name });
      expect(created.result.status).toBe(201);
    };
    await createChild('API_SEC_04_BEFORE');
    const privateValues = () => [config.roomId, ...folders.flatMap(folder => [folder.id, folder.name])];
    const verifyRead = async (client: APIRequestContext, token: string, level: 'OWNER' | 'VIEWER') => {
      for (const folder of folders) {
        const contents = await call(client, 'GET', `/folders/${folder.id}/contents`, `${level} contents`, token);
        expect(contents.status).toBe(200);
        const expectedChildren = folder.id === parentResult.id ? folders.slice(1) : [];
        expect(Array.isArray(contents.body?.items) && contents.body.nextCursor === null &&
          contents.body.items.length === expectedChildren.length &&
          expectedChildren.every(child => contents.body.items.some((item: { id?: string; name?: string }) =>
            item.id === child.id && item.name === child.name)),
        'Contents must match the test-created tree').toBe(true);
        const crumbs = await call(client, 'GET', `/folders/${folder.id}/breadcrumbs`, `${level} breadcrumbs`, token);
        expect(crumbs.status).toBe(200);
        const current = Array.isArray(crumbs.body?.folders) ? crumbs.body.folders.at(-1) : undefined;
        expect(crumbs.body?.accessLevel === level && crumbs.body?.dataRoomId === config.roomId &&
          current?.id === folder.id && current?.name === folder.name,
        'Fresh breadcrumbs must confirm identity and expected access level').toBe(true);
      }
    };
    const verifyDenied = async () => {
      for (const folder of folders) {
        for (const endpoint of ['contents', 'breadcrumbs']) {
          expectDenial(await call(viewer, 'GET', `/folders/${folder.id}/${endpoint}`,
            'Denied folder read', viewerToken), 404, privateValues());
        }
      }
    };
    await verifyRead(owner, ownerToken, 'OWNER');
    await verifyDenied();
    share = disposableFolderShare(owner, ownerToken, parentResult.id);
    expect((await share.create(config.b.email, a.body.id)).status).toBe(201);
    await verifyRead(viewer, viewerToken, 'VIEWER');
    await createChild('API_SEC_04_AFTER');
    // No child shares are created. Verify neither descendant has a direct grant.
    for (const child of folders.slice(1)) {
      const grants = await call(owner, 'GET', `/shares?resourceType=FOLDER&resourceId=${child.id}`,
        'No direct child grant', ownerToken);
      expect(grants.status).toBe(200);
      expect(Array.isArray(grants.body?.items) && grants.body.items.length === 0 &&
        grants.body.nextCursor === null, 'Descendant access must not depend on a direct share').toBe(true);
    }
    await verifyRead(viewer, viewerToken, 'VIEWER');
    revocationAttempted = true;
    await share.cleanup(); // Asserts 204 and records revocation to avoid a second DELETE.
    revocationSucceeded = true;
    await verifyDenied();
    await verifyRead(owner, ownerToken, 'OWNER');
  } catch (error) {
    testFailed = true;
    throw error;
  } finally {
    let cleanupError: unknown;
    try {
      if (revocationAttempted && !revocationSucceeded) {
        throw new Error('Revocation failed; no automatic retry. Retain the test tree for controlled review.');
      }
      await share?.cleanup();
      // Recursive deletion targets only the confirmed new parent; child IDs are never guessed.
      await parent?.cleanup();
    } catch (error) {
      cleanupError = error;
      console.warn(error instanceof Error ? error.message : 'Test tree cleanup failed.');
      console.warn(`Confirmed test folder IDs for review: ${folders.map(folder => folder.id).join(', ') || 'none'}`);
    }
    const disposal = await Promise.allSettled(clients.map(client => client.dispose()));
    const disposalFailed = disposal.some(result => result.status === 'rejected');
    if (disposalFailed) console.warn('Request context disposal failed; details suppressed.');
    if (!testFailed) {
      if (cleanupError) throw cleanupError;
      if (disposalFailed) throw new Error('Request context disposal failed.');
    }
  }
});

function expectDenial(response: Awaited<ReturnType<typeof call>>, status: number, privateValues: string[]) {
  expect(response.status).toBe(status);
  expect(response.body?.statusCode === status, 'Denial must have the expected API error contract').toBe(true);
  const serialized = JSON.stringify(response.body) ?? '';
  expect(privateValues.every(value => !serialized.includes(value)),
    'Denial must not expose known private resource metadata').toBe(true);
  expect(['id', 'name', 'dataRoomId', 'parentId', 'items', 'folders', 'accessLevel', 'createdAt']
    .every(key => !Object.prototype.hasOwnProperty.call(response.body, key)),
  'Denial must not contain resource fields').toBe(true);
}

test('API-SEC-02 — Cross-Account Folder Authorization', async () => {
  const config = configuration();
  const clients: APIRequestContext[] = [];
  let folder: ReturnType<typeof disposableFolder> | undefined;
  let testFailed = false;
  try {
    const owner = await newClient(config.baseURL); clients.push(owner);
    const other = await newClient(config.baseURL); clients.push(other);
    const anonymous = await newClient(config.baseURL); clients.push(anonymous);
    const ownerToken = await login(owner, config.a);
    const otherToken = await login(other, config.b);

    const a = await call(owner, 'GET', '/auth/me', 'Owner identity', ownerToken);
    const b = await call(other, 'GET', '/auth/me', 'Other identity', otherToken);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(isUuid(a.body?.id) && isUuid(b.body?.id) && a.body.id !== b.body.id,
      'Authenticated identities must be distinct').toBe(true);

    const room = await call(owner, 'GET', `/data-rooms/${config.roomId}`, 'Owner room', ownerToken);
    expect(room.status).toBe(200);
    expect(room.body?.id === config.roomId && room.body?.accessLevel === 'OWNER',
      'Designated room must be owned by Account A').toBe(true);
    const otherRoom = await call(other, 'GET', `/data-rooms/${config.roomId}`, 'Unshared room precondition', otherToken);
    expectDenial(otherRoom, 404, [config.roomId]);

    folder = disposableFolder(owner, ownerToken, config.roomId);
    const { id, result } = await folder.create();
    expect(result.status).toBe(201);
    expect(result.body?.name === folder.name && result.body?.dataRoomId === config.roomId && result.body?.parentId === null,
      'Created folder must match the test fixture').toBe(true);

    const path = `/folders/${id}/contents`;
    const contents = await call(owner, 'GET', path, 'Owner read', ownerToken);
    expect(contents.status).toBe(200);
    expect(Array.isArray(contents.body?.items) && contents.body.items.length === 0,
      'New folder must be empty').toBe(true);
    const privateValues = [id, config.roomId, folder.name];
    expectDenial(await call(anonymous, 'GET', path, 'Anonymous read'), 401, privateValues);
    expectDenial(await call(other, 'GET', path, 'Cross-account read', otherToken), 404, privateValues);

    const ownerName = `${folder.name}_owner`;
    const ownerRename = await call(owner, 'PATCH', `/folders/${id}`, 'Owner rename', ownerToken,
      { name: ownerName });
    expect(ownerRename.status).toBe(200);
    expect(ownerRename.body?.id === id && ownerRename.body?.name === ownerName &&
      ownerRename.body?.dataRoomId === config.roomId && ownerRename.body?.parentId === null &&
      ownerRename.body?.createdAt === result.body.createdAt &&
      typeof ownerRename.body?.createdAt === 'string',
    'Owner rename must return the same folder with its updated name').toBe(true);
    const renamed = await call(owner, 'GET', `/folders/${id}/breadcrumbs`, 'Verify owner rename', ownerToken);
    expect(renamed.status).toBe(200);
    const renamedFolder = Array.isArray(renamed.body?.folders) ? renamed.body.folders.at(-1) : undefined;
    expect(renamed.body?.dataRoomId === config.roomId && renamed.body?.accessLevel === 'OWNER' &&
      renamedFolder?.id === id && renamedFolder?.name === ownerName,
    'Fresh read must confirm successful owner rename and unchanged ownership').toBe(true);

    const rename = await call(other, 'PATCH', `/folders/${id}`, 'Cross-account rename', otherToken,
      { name: `${folder.name}_unauthorized` });
    expectDenial(rename, 404, [...privateValues, ownerName]);

    // There is no GET /folders/:id. Breadcrumbs expose the current folder name.
    const after = await call(owner, 'GET', `/folders/${id}/breadcrumbs`, 'Verify unchanged folder', ownerToken);
    expect(after.status).toBe(200);
    const current = Array.isArray(after.body?.folders) ? after.body.folders.at(-1) : undefined;
    expect(after.body?.dataRoomId === config.roomId && after.body?.accessLevel === 'OWNER' &&
      current?.id === id && current?.name === ownerName,
    'Denied rename must leave the original folder identity and name unchanged').toBe(true);
  } catch (error) {
    testFailed = true;
    throw error;
  } finally {
    let cleanupError: unknown;
    try { await folder?.cleanup(); }
    catch (error) {
      cleanupError = error;
      // The resource helper emits only a controlled message with the test ID/marker.
      console.warn(error instanceof Error ? error.message : 'Test folder cleanup failed.');
    }
    const disposal = await Promise.allSettled(clients.map(client => client.dispose()));
    const disposalFailed = disposal.some(result => result.status === 'rejected');
    if (disposalFailed) console.warn('Request context disposal failed; details suppressed.');
    // Never replace the original assertion/request failure with a teardown failure.
    if (!testFailed) {
      if (cleanupError) throw cleanupError;
      if (disposalFailed) throw new Error('Request context disposal failed.');
    }
  }
});

test('API-SEC-03 — Viewer Cannot Mutate Shared Folder', async () => {
  const config = configuration();
  const clients: APIRequestContext[] = [];
  let folder: ReturnType<typeof disposableFolder> | undefined;
  let share: ReturnType<typeof disposableFolderShare> | undefined;
  let testFailed = false;
  try {
    const owner = await newClient(config.baseURL); clients.push(owner);
    const viewer = await newClient(config.baseURL); clients.push(viewer);
    const ownerToken = await login(owner, config.a);
    const viewerToken = await login(viewer, config.b);
    const a = await call(owner, 'GET', '/auth/me', 'Owner identity', ownerToken);
    const b = await call(viewer, 'GET', '/auth/me', 'Viewer identity', viewerToken);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect(isUuid(a.body?.id) && isUuid(b.body?.id) && a.body.id !== b.body.id &&
      typeof b.body?.email === 'string' && b.body.email.toLowerCase() === config.b.email.toLowerCase(),
    'Authenticated identities must be distinct and the recipient must match Account B').toBe(true);
    const room = await call(owner, 'GET', `/data-rooms/${config.roomId}`, 'Owner room', ownerToken);
    expect(room.status).toBe(200);
    expect(room.body?.id === config.roomId && room.body?.accessLevel === 'OWNER',
      'Designated room must belong to A').toBe(true);
    expectDenial(await call(viewer, 'GET', `/data-rooms/${config.roomId}`, 'Unshared room', viewerToken),
      404, [config.roomId]);

    folder = disposableFolder(owner, ownerToken, config.roomId, 'API_SEC_03');
    const { id } = await folder.create();
    const path = `/folders/${id}`;
    const ownerName = `${folder.name}_owner`;
    const privateValues = [id, config.roomId, folder.name, ownerName];
    expectDenial(await call(viewer, 'GET', `${path}/contents`, 'Before sharing', viewerToken), 404, privateValues);
    share = disposableFolderShare(owner, ownerToken, id);
    expect((await share.create(config.b.email, a.body.id)).status).toBe(201);

    // Fresh successful reads prevent testing a recipient whose grant is absent/revoked.
    const verifyViewer = async (name: string) => {
      const contents = await call(viewer, 'GET', `${path}/contents`, 'Viewer contents', viewerToken);
      expect(contents.status).toBe(200);
      expect(Array.isArray(contents.body?.items) && contents.body.items.length === 0 &&
        contents.body.nextCursor === null, 'Viewer must read the empty shared folder').toBe(true);
      const crumbs = await call(viewer, 'GET', `${path}/breadcrumbs`, 'Viewer grant', viewerToken);
      expect(crumbs.status).toBe(200);
      const current = Array.isArray(crumbs.body?.folders) ? crumbs.body.folders.at(-1) : undefined;
      expect(crumbs.body?.accessLevel === 'VIEWER' && current?.id === id && current?.name === name,
        'Account B must have active VIEWER access to this folder').toBe(true);
    };
    const verifyOwner = async () => {
      const crumbs = await call(owner, 'GET', `${path}/breadcrumbs`, 'Owner folder state', ownerToken);
      expect(crumbs.status).toBe(200);
      const current = Array.isArray(crumbs.body?.folders) ? crumbs.body.folders.at(-1) : undefined;
      expect(crumbs.body?.accessLevel === 'OWNER' && crumbs.body?.dataRoomId === config.roomId &&
        current?.id === id && current?.name === ownerName,
      'Folder identity, owner-established name and room ownership must be unchanged').toBe(true);
      const contents = await call(owner, 'GET', `${path}/contents`, 'Owner contents', ownerToken);
      expect(contents.status).toBe(200);
      expect(Array.isArray(contents.body?.items) && contents.body.items.length === 0 &&
        contents.body.nextCursor === null, 'Folder contents must remain empty').toBe(true);
    };
    await verifyViewer(folder.name);
    const renamed = await call(owner, 'PATCH', path, 'Owner rename positive control', ownerToken, { name: ownerName });
    expect(renamed.status).toBe(200);
    expect(renamed.body?.id === id && renamed.body?.name === ownerName &&
      renamed.body?.dataRoomId === config.roomId && renamed.body?.parentId === null,
    'Owner PATCH must update only the disposable folder name').toBe(true);
    await verifyOwner();
    await verifyViewer(ownerName);
    expectDenial(await call(viewer, 'PATCH', path, 'Denied viewer rename', viewerToken,
      { name: `${folder.name}_unauthorized` }), 404, privateValues);
    await verifyOwner();
    await verifyViewer(ownerName);
    expectDenial(await call(viewer, 'DELETE', path, 'Denied viewer delete', viewerToken), 404, privateValues);
    await verifyOwner();
  } catch (error) {
    testFailed = true;
    throw error;
  } finally {
    let cleanupError: unknown;
    try {
      // Revoke first: deleting the folder would prevent later share revocation.
      await share?.cleanup();
      await folder?.cleanup();
    } catch (error) {
      cleanupError = error;
      console.warn(error instanceof Error ? error.message : 'Test resource cleanup failed.');
    }
    const disposal = await Promise.allSettled(clients.map(client => client.dispose()));
    const disposalFailed = disposal.some(result => result.status === 'rejected');
    if (disposalFailed) console.warn('Request context disposal failed; details suppressed.');
    if (!testFailed) {
      if (cleanupError) throw cleanupError;
      if (disposalFailed) throw new Error('Request context disposal failed.');
    }
  }
});
