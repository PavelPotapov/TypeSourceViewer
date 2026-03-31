import type { Plugin } from 'vite';
import { parseTypeFromContent } from '../core/parser';
import { createNodeFileReader } from '../adapters/node-file-reader';
import { createMdxScanner } from '../adapters/mdx-scanner';
import type { TypeMap } from '../core/types';

const VIRTUAL_MODULE_ID = 'virtual:type-strings';
const RESOLVED_ID = '\0' + VIRTUAL_MODULE_ID;
const DEFAULT_EXTENSIONS = ['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx'];

interface TypeViewerPluginOptions {
  /** Directory containing Storybook files to scan */
  storybookDir: string;
  /** File extensions to scan. Defaults to common web extensions. */
  extensions?: string[];
}

/**
 * Vite plugin for TypeSourceViewer.
 *
 * Provides a virtual module `virtual:type-strings` containing all extracted types.
 * Supports HMR — when .ts files change, the virtual module is invalidated.
 */
export function typeViewerPlugin(options: TypeViewerPluginOptions): Plugin {
  const { storybookDir, extensions = DEFAULT_EXTENSIONS } = options;

  const generateTypeMap = (): TypeMap => {
    const fileReader = createNodeFileReader();
    const scanner = createMdxScanner();
    const usages = scanner.scan(storybookDir, extensions);
    const typeMap: TypeMap = {};

    for (const { filePath, typeName } of usages) {
      if (!fileReader.exists(filePath)) continue;

      const key = `${filePath}$$$${typeName}`;
      const content = fileReader.read(filePath);
      const definition = parseTypeFromContent(content, typeName);

      if (definition) {
        typeMap[key] = definition;
      }
    }

    return typeMap;
  };

  return {
    name: 'vite-plugin-type-viewer',

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_ID;
    },

    load(id) {
      if (id === RESOLVED_ID) {
        return `export default ${JSON.stringify(generateTypeMap())}`;
      }
    },

    configureServer(server) {
      server.watcher.on('change', (file) => {
        if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({ type: 'full-reload' });
          }
        }
      });
    },
  };
}
