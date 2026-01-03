import { fileURLToPath } from 'url';
import preact from '@preact/preset-vite';
import { mkdir, copyFile, readFile, writeFile } from 'fs/promises';
import { defineConfig } from 'vite';

const rootUrl = new URL('./', import.meta.url);
const distDir = fileURLToPath(new URL('dist', rootUrl));
const distContentDir = fileURLToPath(new URL('dist/content', rootUrl));
const contentEntry = fileURLToPath(new URL('src/content/main.tsx', rootUrl));
const manifestPath = fileURLToPath(new URL('manifest.json', rootUrl));
const iconPath = fileURLToPath(
  new URL('public/icons/mermaid-icon.svg', rootUrl)
);
const externalIconPath = fileURLToPath(
  new URL('public/icons/external-link-icon.svg', rootUrl)
);
const splitWindowIconPath = fileURLToPath(
  new URL('public/icons/split-window.svg', rootUrl)
);
const icon48Path = fileURLToPath(new URL('public/icons/icon48.png', rootUrl));
const closeIconPath = fileURLToPath(new URL('public/icons/close.svg', rootUrl));
const sunIconPath = fileURLToPath(new URL('public/icons/sun.svg', rootUrl));
const moonIconPath = fileURLToPath(new URL('public/icons/moon.svg', rootUrl));
const licensePath = fileURLToPath(new URL('LICENSE', rootUrl));
const thirdPartyLicensesPath = fileURLToPath(
  new URL('THIRD_PARTY_LICENSES.md', rootUrl)
);
const noticePath = fileURLToPath(new URL('NOTICE.md', rootUrl));
const contentScriptPath = fileURLToPath(
  new URL('dist/content/main.js', rootUrl)
);

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    async closeBundle() {
      await mkdir(distDir, { recursive: true });
      await mkdir(distContentDir, { recursive: true });
      await mkdir(fileURLToPath(new URL('dist/icons', rootUrl)), {
        recursive: true,
      });

      await copyFile(
        manifestPath,
        fileURLToPath(new URL('dist/manifest.json', rootUrl))
      );
      await copyFile(
        iconPath,
        fileURLToPath(new URL('dist/icons/mermaid-icon.svg', rootUrl))
      );
      await copyFile(
        externalIconPath,
        fileURLToPath(new URL('dist/icons/external-link-icon.svg', rootUrl))
      );
      await copyFile(
        splitWindowIconPath,
        fileURLToPath(new URL('dist/icons/split-window.svg', rootUrl))
      );
      await copyFile(
        icon48Path,
        fileURLToPath(new URL('dist/icons/icon48.png', rootUrl))
      );
      await copyFile(
        closeIconPath,
        fileURLToPath(new URL('dist/icons/close.svg', rootUrl))
      );
      await copyFile(
        sunIconPath,
        fileURLToPath(new URL('dist/icons/sun.svg', rootUrl))
      );
      await copyFile(
        moonIconPath,
        fileURLToPath(new URL('dist/icons/moon.svg', rootUrl))
      );
      await copyFile(
        licensePath,
        fileURLToPath(new URL('dist/LICENSE', rootUrl))
      );
      await copyFile(
        thirdPartyLicensesPath,
        fileURLToPath(new URL('dist/THIRD_PARTY_LICENSES.md', rootUrl))
      );
      await copyFile(
        noticePath,
        fileURLToPath(new URL('dist/NOTICE.md', rootUrl))
      );

      const raw = await readFile(contentScriptPath);
      let text = raw.toString('utf8');
      if (text.charCodeAt(0) === 0xfeff) {
        text = text.slice(1);
      }
      await writeFile(contentScriptPath, text, 'utf8');
    },
  };
}

export default defineConfig({
  plugins: [preact(), copyStaticFiles()],
  esbuild: {
    charset: 'ascii',
  },
  build: {
    rollupOptions: {
      input: {
        'content/main': contentEntry,
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
