import { typeViewerPlugin } from '../vite-plugin';

interface PresetOptions {
  /** Directory to scan for TypeSourceViewer usages. Defaults to cwd (project root). */
  storybookDir?: string;
  /** File extensions to scan */
  extensions?: string[];
}

/**
 * Storybook preset that auto-configures the Vite plugin.
 *
 * Usage in .storybook/main.ts:
 *   addons: ['type-source-viewer/storybook']
 */
export const viteFinal = async (
  config: Record<string, unknown> & { plugins?: unknown[] },
  options: { presetOptions?: PresetOptions },
) => {
  config.plugins = config.plugins ?? [];
  config.plugins.push(
    typeViewerPlugin({
      storybookDir: options.presetOptions?.storybookDir ?? process.cwd(),
      extensions: options.presetOptions?.extensions,
    }),
  );

  return config;
};
