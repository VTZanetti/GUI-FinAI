/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET ?? 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    build: {
      sourcemap: false,
      chunkSizeWarningLimit: 900
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      css: false,
      exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
      coverage: {
        provider: 'v8',
        include: ['src/api/**', 'src/stores/**', 'src/utils/**', 'src/composables/**'],
        exclude: ['src/api/mocks/**', 'src/main.ts', 'src/**/*.d.ts', 'src/api/endpoints.ts'],
        thresholds: {
          // Meta por camada (docs/07-resiliencia-portainer.md §5.3):
          // utils/api/mappers/retry/stores ≥ 90% · services ≥ 80%
          'src/utils/**': { lines: 90, functions: 80, statements: 90, branches: 70 },
          'src/stores/**': { lines: 90, functions: 80, statements: 90, branches: 70 },
          'src/composables/**': { lines: 80, functions: 80, statements: 80, branches: 70 },
          'src/api/retry.ts': { lines: 90, functions: 90, statements: 90, branches: 80 },
          'src/api/mappers.ts': { lines: 90, functions: 90, statements: 90, branches: 80 },
          'src/api/error.ts': { lines: 80, functions: 80, statements: 80, branches: 70 },
          'src/api/errorService.ts': { lines: 80, functions: 80, statements: 80, branches: 70 },
          'src/api/services/**': { lines: 80, functions: 80, statements: 80, branches: 60 }
        }
      }
    }
  }
})
