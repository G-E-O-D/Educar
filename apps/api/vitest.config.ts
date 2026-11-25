import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // version-data.ts es un artefacto generado, no lógica propia
      exclude: ['src/version-data.ts'],
    },
  },
});
