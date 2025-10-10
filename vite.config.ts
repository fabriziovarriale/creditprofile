import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5175,
    fs: {
      // Permetti l'accesso ai file di node_modules per PDF.js worker
      allow: ['..'],
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: 'public',
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
  define: {
    global: 'globalThis',
  },
  assetsInclude: ['**/*.worker.mjs'], // Includi i worker come asset
}));
