import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
  throw new Error('Automation requires Node 22.12 or newer.');
}
const envPath = resolve(__dirname, '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);
// Playwright debug logging can expose request headers and credentials.
if (process.env.DEBUG || process.env.PWDEBUG) {
  throw new Error('Disable DEBUG and PWDEBUG before running this suite.');
}

export default defineConfig({
  testDir: './tests',
  timeout: 120_000,
  workers: 1,
  retries: 0,
  fullyParallel: false,
  forbidOnly: true,
  reporter: 'line',
  use: { trace: 'off', screenshot: 'off', video: 'off' },
  projects: [
    { name: 'api', testMatch: 'api/**/*.spec.ts' },
    { name: 'chromium-e2e', testMatch: 'e2e/**/*.spec.ts',
      use: { browserName: 'chromium', acceptDownloads: true,
        baseURL: process.env.WEB_BASE_URL || 'https://virtual-data-room-ten.vercel.app' } },
  ],
});
