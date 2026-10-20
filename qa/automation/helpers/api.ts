import { request, type APIRequestContext } from '@playwright/test';

export const isUuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

function required(name: string): string {
  const value = process.env[name];
  if (!value?.trim()) throw new Error(`Missing configuration: ${name}`);
  return value;
}

export function configuration() {
  let url: URL;
  try { url = new URL(required('API_BASE_URL')); }
  catch { throw new Error('API_BASE_URL must be a valid HTTP(S) origin.'); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password ||
      url.search || url.hash || url.pathname !== '/') {
    throw new Error('API_BASE_URL must be an HTTP(S) origin without credentials, path or query.');
  }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local && process.env.ALLOW_REMOTE_API !== 'true') {
    throw new Error('Remote API execution is disabled. Obtain approval before enabling ALLOW_REMOTE_API.');
  }
  const roomId = required('TEST_ROOM_ID').trim();
  if (!isUuid(roomId)) throw new Error('TEST_ROOM_ID must be a valid UUID.');
  const a = { email: required('ACCOUNT_A_EMAIL').trim(), password: required('ACCOUNT_A_PASSWORD') };
  const b = { email: required('ACCOUNT_B_EMAIL').trim(), password: required('ACCOUNT_B_PASSWORD') };
  if (a.email.toLowerCase() === b.email.toLowerCase()) {
    throw new Error('Account A and Account B must be different designated test accounts.');
  }
  return { baseURL: url.origin, roomId, a, b };
}

export function newClient(baseURL: string) {
  return request.newContext({ baseURL, timeout: 10_000, maxRedirects: 0 });
}

// Do not expose raw response bodies, request errors, credentials or headers in reports.
export async function call(
  client: APIRequestContext, method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string, label: string, token?: string, data?: object,
): Promise<{ status: number; body: any }> {
  try {
    const response = await client.fetch(path, {
      method, data, headers: token ? { Authorization: `Bearer ${token}` } : {},
      failOnStatusCode: false,
    });
    const status = response.status();
    let body: any;
    try { body = await response.json(); } catch { body = undefined; }
    await response.dispose();
    return { status, body };
  } catch {
    throw new Error(`${label}: request failed (details suppressed to protect secrets).`);
  }
}

export async function login(client: APIRequestContext, credentials: { email: string; password: string }) {
  const response = await call(client, 'POST', '/auth/login', 'Login', undefined, credentials);
  if (response.status !== 200 || typeof response.body?.accessToken !== 'string' || !response.body.accessToken) {
    throw new Error(`Login failed or returned an invalid token response (HTTP ${response.status}).`);
  }
  return response.body.accessToken as string;
}
