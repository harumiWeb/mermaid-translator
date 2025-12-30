import http from 'http';
import os from 'os';
import { fileURLToPath } from 'url';
import { chromium, expect, test as base, type Page } from '@playwright/test';
import { mkdtemp, readFile, rm } from 'fs/promises';

let server: http.Server | null = null;
let fixtureUrl = '';
const extensionPath = fileURLToPath(new URL('../../dist', import.meta.url));

const test = base.extend<{ page: Page }>({
  page: async (_args, use) => {
    const tmpRoot = os.tmpdir().replace(/[\\/]+$/, '');
    const userDataDir = await mkdtemp(`${tmpRoot}/mermaid-translator-e2e-`);
    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    const page = await context.newPage();

    try {
      await use(page);
    } finally {
      await page.close();
      await context.close();
      await rm(userDataDir, { recursive: true, force: true });
    }
  },
});

test.beforeAll(async () => {
  const fixturePath = fileURLToPath(
    new URL('../fixtures/mermaid.html', import.meta.url)
  );
  const fixtureHtml = await readFile(fixturePath, 'utf-8');

  server = http.createServer((req, res) => {
    const url = req.url ?? '/';
    if (url === '/favicon.ico') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (url === '/' || url === '/mermaid.html') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(fixtureHtml);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  });

  await new Promise<void>((resolve) => {
    server?.listen(0, '127.0.0.1', () => {
      resolve();
    });
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to start fixture server');
  }
  fixtureUrl = `http://127.0.0.1:${address.port}/mermaid.html`;
});

test.afterAll(async () => {
  if (!server) {
    return;
  }

  await new Promise<void>((resolve) => {
    server?.close(() => {
      resolve();
    });
  });
  server = null;
});

type ErrorTracker = {
  assertNoErrors: () => void;
};

function getActionButton(page: Page) {
  return page
    .locator('[data-mermaid-selection-renderer="root"]')
    .locator('button[aria-label="Render Mermaid"]');
}

function getCloseButton(page: Page) {
  return page
    .locator('[data-mermaid-selection-renderer="root"]')
    .locator('button[aria-label="Close"]');
}

async function waitForActionButton(page: Page): Promise<void> {
  await page.waitForFunction(() => {
    const host = document.querySelector(
      '[data-mermaid-selection-renderer="root"]'
    );
    const shadow = host?.shadowRoot;
    if (!shadow) {
      return false;
    }
    return Boolean(shadow.querySelector('button[aria-label="Render Mermaid"]'));
  });
}

function trackPageErrors(page: Page): ErrorTracker {
  const errors: string[] = [];

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  return {
    assertNoErrors: () => {
      expect(errors, 'Unexpected console/page errors').toEqual([]);
    },
  };
}

async function selectAllText(page: Page, selector: string): Promise<void> {
  await page.evaluate((targetSelector) => {
    const element = document.querySelector(targetSelector);
    if (!(element instanceof HTMLTextAreaElement)) {
      return;
    }

    element.focus();
    element.selectionStart = 0;
    element.selectionEnd = element.value.length;
    document.dispatchEvent(new Event('selectionchange'));
  }, selector);
}

async function selectSubstring(
  page: Page,
  selector: string,
  text: string
): Promise<void> {
  await page.evaluate(
    ({ targetSelector, targetText }) => {
      const element = document.querySelector(targetSelector);
      if (!(element instanceof HTMLTextAreaElement)) {
        return;
      }

      const startIndex = element.value.indexOf(targetText);
      if (startIndex === -1) {
        return;
      }

      element.focus();
      element.selectionStart = startIndex;
      element.selectionEnd = startIndex + targetText.length;
      document.dispatchEvent(new Event('selectionchange'));
    },
    { targetSelector: selector, targetText: text }
  );
}

async function openPopupFromSelection(page: Page): Promise<void> {
  await selectAllText(page, '#mermaid-source');
  await waitForActionButton(page);
  const actionButton = getActionButton(page);
  await expect(actionButton).toBeVisible();
  await actionButton.click();
  await expect(getCloseButton(page)).toBeVisible();
}

test('mermaid selection shows action button and popup opens', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await page.goto(fixtureUrl);

  await selectAllText(page, '#mermaid-source');

  await waitForActionButton(page);
  const actionButton = getActionButton(page);
  await expect(actionButton).toBeVisible();
  await actionButton.click();

  await expect(getCloseButton(page)).toBeVisible();
  errors.assertNoErrors();
});

test('mermaid selection alone does not open popup', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto(fixtureUrl);

  await selectAllText(page, '#mermaid-source');

  await waitForActionButton(page);
  await expect(getActionButton(page)).toBeVisible();
  await expect(getCloseButton(page)).toHaveCount(0);
  errors.assertNoErrors();
});

test('non-mermaid selection does not show action button', async ({ page }) => {
  const errors = trackPageErrors(page);
  await page.goto(fixtureUrl);

  await selectSubstring(page, '#mermaid-source', 'Start');

  await expect(getActionButton(page)).toHaveCount(0);
  errors.assertNoErrors();
});

test('popup dismisses on outside click or selection change', async ({
  page,
}) => {
  const errors = trackPageErrors(page);
  await page.goto(fixtureUrl);

  await openPopupFromSelection(page);

  const viewport = page.viewportSize();
  if (!viewport) {
    throw new Error('Viewport is not available');
  }

  await page.mouse.click(viewport.width - 2, viewport.height - 2);
  await expect(getCloseButton(page)).toHaveCount(0);

  await openPopupFromSelection(page);
  await selectSubstring(page, '#mermaid-source', 'Start');
  await expect(getCloseButton(page)).toHaveCount(0);
  errors.assertNoErrors();
});
