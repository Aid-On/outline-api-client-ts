import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: 'demo',
  plugins: [react()],
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      'outline-api-client': path.resolve(__dirname, './src/index.ts'),
      'undici': path.resolve(__dirname, './demo/src/browser-fetch.ts'),
    },
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  server: {
    port: 3000,
    open: true,
  },
});