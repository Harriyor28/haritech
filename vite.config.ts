import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Stale tsc-emitted .js files sit next to every .ts/.tsx source; Vite's default
  // order resolves ".js" first, so edits to the TypeScript sources were being
  // ignored at runtime. Prefer the TypeScript sources.
  resolve: {
    extensions: ['.mts', '.ts', '.tsx', '.mjs', '.js', '.jsx', '.json']
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false
  }
});