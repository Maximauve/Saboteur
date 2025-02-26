import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr' ;

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8080,
  },
  resolve: {
    alias: {
      // eslint-disable-next-line @typescript-eslint/naming-convention -- Special case for alias configuration
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  plugins: [
    react(),
    svgr()
  ],
});
