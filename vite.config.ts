import { fileURLToPath } from 'url';
import preact from '@preact/preset-vite';
import { mkdir, copyFile, readFile, writeFile } from 'fs/promises';
import { defineConfig } from 'vite';

const rootUrl = new URL('./', import.meta.url);
const distDir = fileURLToPath(new URL('dist', rootUrl));
const distContentDir = fileURLToPath(new URL('dist/content', rootUrl));
const contentEntry = fileURLToPath(new URL('src/content/main.tsx', rootUrl));
const manifestPath = fileURLToPath(new URL('manifest.json', rootUrl));
const stylePath = fileURLToPath(new URL('src/content/style.css', rootUrl));
const iconPath = fileURLToPath(new URL('public/mermaid-icon.svg', rootUrl));
const contentScriptPath = fileURLToPath(
  new URL('dist/content/main.js', rootUrl)
);

function copyStaticFiles() {
  return {
    name: 'copy-static-files',
    async closeBundle() {
      await mkdir(distDir, { recursive: true });
      await mkdir(distContentDir, { recursive: true });

      await copyFile(
        manifestPath,
        fileURLToPath(new URL('dist/manifest.json', rootUrl))
      );
      await copyFile(
        stylePath,
        fileURLToPath(new URL('dist/content/style.css', rootUrl))
      );
      await copyFile(
        iconPath,
        fileURLToPath(new URL('dist/mermaid-icon.svg', rootUrl))
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
