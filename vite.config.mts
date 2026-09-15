import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const rootDir = import.meta.dirname;

export default defineConfig({
  root: path.resolve(rootDir, "src/renderer"),
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src/renderer"),
    },
  },
  build: {
    outDir: path.resolve(rootDir, "dist/renderer"),
    emptyOutDir: true,
  },
});
