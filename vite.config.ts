/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { contentPlugin } from './scripts/vite-content-plugin.ts'

// The production security headers live in vercel.json. `vite preview` sends the same ones, so the built site
// (and the end-to-end tests run against it) is exercised under the real Content-Security-Policy.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: { source: string; headers: { key: string; value: string }[] }[]
}
const securityHeaders = Object.fromEntries(
  (vercel.headers.find((h) => h.source === '/(.*)')?.headers ?? []).map((h) => [h.key, h.value]),
)

export default defineConfig({
  plugins: [contentPlugin(), react(), tailwindcss()],
  preview: { headers: securityHeaders },
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
