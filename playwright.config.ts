import { defineConfig } from '@playwright/test';

const cwd = globalThis.process.cwd();
const normalizedCwd = cwd.replace(/[\\/]+$/, '');
globalThis.process.env.PLAYWRIGHT_TS_CONFIG = normalizedCwd
  ? `${normalizedCwd}/tsconfig.playwright.json`
  : 'tsconfig.playwright.json';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: {
    headless: false, // 拡張確認は非 headless 推奨
  },
  projects: [
    {
      name: 'chromium-extension',
      use: {
        browserName: 'chromium',
      },
    },
  ],
});
