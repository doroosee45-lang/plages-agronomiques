import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ICI = path.dirname(fileURLToPath(import.meta.url));          // …/plages-agronomiques/frontend
const BACKEND = path.resolve(ICI, '..', 'backend');                // …/plages-agronomiques/backend

export default defineConfig({
  root: ICI,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.VITE_PORT || 3000),
    allowedHosts: true,
    // Le référentiel commun est dans backend/shared : Vite doit pouvoir le lire.
    fs: { allow: [path.resolve(ICI, '..')] },
    proxy: {
      // Toutes les requêtes /api sont transmises au backend Express
      '/api': { target: `http://127.0.0.1:${process.env.PORT || 4000}`, changeOrigin: true }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(ICI, 'src'),
      '@shared': path.resolve(BACKEND, 'shared')
    }
  },
  build: {
    outDir: path.resolve(ICI, 'dist'),
    emptyOutDir: true,
    sourcemap: false
  }
});
