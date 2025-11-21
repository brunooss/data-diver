/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      include: [
        'src/lib/**',
        'src/app/actions.ts'
      ],
      exclude: [
        '**/node_modules/**',
        'next.config.ts',
        'postcss.config.mjs',
        'tailwind.config.ts',
      ]
    }
  },
  // This is a workaround for the following issue:
  // https://github.com/vitest-dev/vitest/issues/4513
  // It's required for the tests to run correctly.
  resolve: {
    alias: {
      'react/jsx-dev-runtime': 'react/jsx-dev-runtime.js',
    },
  },
});
