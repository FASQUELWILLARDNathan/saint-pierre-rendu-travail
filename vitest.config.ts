import { fileURLToPath } from 'node:url'
import path from 'path'
import { defineConfig, configDefaults } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    setupFiles: [
      './tests/setup/global.setup.ts',
      './tests/setup/backend.setup.ts',
      './tests/setup/frontend.setup.ts',
    ],
    resolveSnapshotPath: (testPath, snapExtension) =>
      testPath.replace(/\.(test|spec)\.(ts|tsx|js)$/, `.spec${snapExtension}`),
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      thresholds: {
        lines: 30,
        functions: 40,
        branches: 55,
        statements: 30,
      },
      include: [
        'src/composables/**/*.ts',
        'src/stores/**/*.ts',
        'backend/jwt-manager.ts',
        'backend/middleware/auth.ts',
        'backend/routes/auth.ts',
      ],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/**',
        'tests/**',
        '**/__tests__/**',
        'src/main.ts',
        'backend/server.ts',
      ],
    },
    include: [
      'tests/unit/**/*.{test,spec}.{ts,tsx}',
      'tests/integration/**/*.{test,spec}.{ts,tsx}',
      'src/**/*.{test,spec}.{ts,tsx}',
      'backend/**/*.{test,spec}.{ts,tsx}',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@backend': path.resolve(__dirname, './backend'),
    },
  },
})
