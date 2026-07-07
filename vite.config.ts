/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project at https://<user>.github.io/Chrono-Sports/,
// so assets must resolve under that subpath. Unconditional so dev, preview,
// and production all serve from the same path (vite redirects / for you).
export default defineConfig({
  base: '/Chrono-Sports/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
