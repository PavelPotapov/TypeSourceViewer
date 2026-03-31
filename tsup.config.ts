import { defineConfig } from 'tsup';

export default defineConfig([
  // Core + adapters (Node.js)
  {
    entry: {
      index: 'src/index.ts',
      'integrations/vite-plugin': 'src/integrations/vite-plugin.ts',
      'integrations/cli': 'src/integrations/cli.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    external: ['vite', 'fs', 'path'],
  },
  // Storybook integration (React)
  {
    entry: {
      'integrations/storybook/index': 'src/integrations/storybook/index.ts',
      'integrations/storybook/preset': 'src/integrations/storybook/preset.ts',
    },
    format: ['esm'],
    dts: true,
    external: ['@storybook/blocks', '@storybook/types', 'react', 'react/jsx-runtime', 'virtual:type-strings', 'vite'],
  },
]);
