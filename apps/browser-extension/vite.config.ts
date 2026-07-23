import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  loadEnv(mode, __dirname, 'VITE_');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          popup: resolve(__dirname, 'popup.html'),
          background: resolve(__dirname, 'src/background.ts'),
          'content/capture': resolve(__dirname, 'src/content/capture.ts'),
        },
        output: {
          entryFileNames: (chunk) => {
            if (chunk.name === 'background') return 'background.js';
            if (chunk.name === 'content/capture') return 'content/capture.js';
            return 'assets/[name].js';
          },
        },
      },
    },
    publicDir: 'public',
  };
});
