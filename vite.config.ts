/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves this project at https://<user>.github.io/Chrono-Sports/,
// so production assets must be requested from that subpath. Dev/preview stay at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Chrono-Sports/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
