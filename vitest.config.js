import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      exclude: [
        'vitest.config.js',
        'webpack.config.cjs',
        'build/**',
        'scripts/**',
        'tests/**',
        'coverage/**',
        'src/cli.js',
        'src/index.js',
        'src/mount.js',
        'src/view.js',
        'src/render/html.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
