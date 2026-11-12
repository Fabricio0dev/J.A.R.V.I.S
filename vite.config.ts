import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/J.A.R.V.I.S/' : '/',
  server: { port: 5173 },
  build: { sourcemap: false, target: 'es2022' },
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], css: true }
}));