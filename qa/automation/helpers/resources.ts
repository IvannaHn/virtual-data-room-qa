import { randomUUID } from 'node:crypto';
import type { APIRequestContext } from '@playwright/test';
import { call, isUuid } from './api';

export function disposableFolder(client: APIRequestContext, ownerToken: string, roomId: string, testId = 'API_SEC_02', parentId?: string) {
  const name = `QA_${testId}_${randomUUID()}`;
  let createdId: string | undefined;
  return {
    name,
    async create() {
      const result = await call(client, 'POST', '/folders', `Create test folder (review marker ${name} if outcome is unknown)`, ownerToken, {
        name, dataRoomId: roomId, ...(parentId ? { parentId } : {}),
      });
      // Establish provenance before tracking an ID for deletion; never search/delete by name.
      if (result.status === 201 && isUuid(result.body?.id) && result.body?.name === name &&
          result.body?.dataRoomId === roomId && result.body?.parentId === (parentId ?? null)) {
        createdId = result.body.id;
      }
      if (!createdId) {
        throw new Error(`Folder creation was not confirmed (HTTP ${result.status}). Review only test marker ${name}; no automatic search/delete was attempted.`);
      }
      return { id: createdId, result };
    },
    async cleanup() {
      if (!createdId) return;
      try {
        const result = await call(client, 'DELETE', `/folders/${createdId}`, 'Cleanup', ownerToken);
        if (result.status !== 204) throw new Error('Unexpected cleanup status');
      } catch {
        throw new Error(`Cleanup failed. Review test-created folder ID ${createdId} (marker ${name}).`);
      }
    },
  };
}

// Call only for the confirmed disposable folder created by the current test.
export function disposableFolderShare(client: APIRequestContext, ownerToken: string, folderId: string) {
  let shareId: string | undefined;
  let creationAttempted = false;
  let revoked = false;
  return {
    async create(granteeEmail: string, ownerId: string) {
      const before = await call(client, 'GET', `/shares?resourceType=FOLDER&resourceId=${folderId}`,
        'Check disposable folder shares', ownerToken);
      if (before.status !== 200 || !Array.isArray(before.body?.items) ||
          before.body.items.length !== 0 || before.body.nextCursor !== null) {
        throw new Error('Disposable folder must have no existing shares; no share was created or revoked.');
      }
      creationAttempted = true;
      const result = await call(client, 'POST', '/shares', `Create test share for folder ${folderId}`, ownerToken, {
        resourceType: 'FOLDER', resourceId: folderId, mode: 'USER', granteeEmail,
      });
      if (result.status === 201 && isUuid(result.body?.id) && result.body?.resourceId === folderId &&
          result.body?.resourceType === 'FOLDER' && result.body?.mode === 'USER' &&
          result.body?.granteeEmail === granteeEmail.trim().toLowerCase() &&
          result.body?.createdById === ownerId && result.body?.revokedAt === null && result.body?.token === null) {
        shareId = result.body.id;
      }
      if (!shareId) throw new Error(`Share creation unconfirmed (HTTP ${result.status}); review test folder ${folderId}.`);
      return result;
    },
    async cleanup() {
      if (!creationAttempted || revoked) return;
      if (!shareId) throw new Error(`Share outcome unknown; retain test folder ${folderId} for manual review.`);
      try {
        const result = await call(client, 'DELETE', `/shares/${shareId}`, 'Revoke test share', ownerToken);
        if (result.status !== 204) throw new Error('Unexpected revocation status');
        revoked = true;
      } catch {
        throw new Error(`Share cleanup failed; review share ID ${shareId} and test folder ${folderId}.`);
      }
    },
  };
}
