import { defineConfig } from "vite"
import preact from "@preact/preset-vite"
import { resolve } from "path"

export default defineConfig({
  plugins: [preact()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content/main.tsx")
      },
      output: {
        entryFileNames: "[name].js",
        format: "iife"
      }
    },
    outDir: "dist",
    emptyOutDir: true
  }
})
