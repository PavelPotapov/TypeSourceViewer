import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';
import { typeViewerPlugin } from '../src/integrations/vite-plugin';

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.@(ts|tsx)', '../stories/**/*.mdx'],
  addons: ['@storybook/addon-essentials'],
  framework: '@storybook/react-vite',
  viteFinal: async (config) => {
    config.plugins = config.plugins ?? [];
    config.plugins.push(
      typeViewerPlugin({
        storybookDir: resolve(process.cwd(), 'stories'),
      }),
    );
    return config;
  },
};

export default config;
