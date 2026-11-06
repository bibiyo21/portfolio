/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { contentPlugin } from './scripts/vite-content-plugin.ts'

export default defineConfig({
  plugins: [contentPlugin(), react(), tailwindcss()],
  build: { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 800 },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
    css: false,
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    outputFile: { junit: './test-results/junit.xml' },
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: ['src/lib/**', 'src/hooks/**', 'src/components/**', 'api/**'],
      exclude: ['src/test/**', '**/*.test.*'],
    },
  },
})
