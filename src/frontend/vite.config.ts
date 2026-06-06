import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',

    coverage:{
      provider: 'v8',
      exclude:[
        'node_modules',
        'src/**/*.css',
        'src/**/*.module.css',
        'src/**/*.test.tsx',
        'src/**/*.test.ts',
        'src/**/*.spec.tsx',
        'src/**/*.spec.ts',
        'src/test/**',
        'src/main.tsx',
        '**/index.ts',
        '**/index.tsx',
      ]
    },
  },
})


