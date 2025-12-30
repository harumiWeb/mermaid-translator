import { fileURLToPath } from 'url';
import { defineConfig } from '@playwright/test';

const extensionPath = fileURLToPath(new URL('./dist', import.meta.url));

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
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
          ],
        },
      },
    },
  ],
});
