import { fileURLToPath } from 'url';
import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

const rootUrl = new URL('./', import.meta.url);
const popupRootUrl = new URL('src/popup/', rootUrl);
const popupRoot = fileURLToPath(popupRootUrl);

export default defineConfig({
  root: popupRoot,
  base: './',
  plugins: [preact()],
  esbuild: {
    charset: 'ascii',
  },
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL('index.html', popupRootUrl)),
      },
    },
    outDir: fileURLToPath(new URL('dist/popup', rootUrl)),
    emptyOutDir: false,
  },
});
