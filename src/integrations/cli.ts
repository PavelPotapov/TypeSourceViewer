import { parseTypeFromContent } from '../core/parser';
import { createNodeFileReader } from '../adapters/node-file-reader';
import { createMdxScanner } from '../adapters/mdx-scanner';
import { createJsonWriter } from '../adapters/json-writer';
import type { TypeMap } from '../core/types';

const DEFAULT_EXTENSIONS = ['.md', '.mdx', '.js', '.jsx', '.ts', '.tsx'];

interface GenerateOptions {
  storybookDir: string;
  output: string;
  extensions?: string[];
}

/**
 * Scans files in storybookDir for TypeSourceViewer usages,
 * extracts the referenced types, and writes them to an output JSON file.
 */
export function generate(options: GenerateOptions): void {
  const { storybookDir, output, extensions = DEFAULT_EXTENSIONS } = options;

  const fileReader = createNodeFileReader();
  const scanner = createMdxScanner();
  const writer = createJsonWriter();

  const usages = scanner.scan(storybookDir, extensions);
  const typeMap: TypeMap = {};

  for (const { filePath, typeName } of usages) {
    const key = `${filePath}$$$${typeName}`;

    if (!fileReader.exists(filePath)) {
      console.error(`File not found: ${filePath}`);
      continue;
    }

    const content = fileReader.read(filePath);
    const definition = parseTypeFromContent(content, typeName);

    if (definition) {
      typeMap[key] = definition;
      console.log(`Extracted: ${typeName}`);
    } else {
      console.error(`Type "${typeName}" not found in ${filePath}`);
    }
  }

  writer.write(output, typeMap);
  console.log(`Types written to ${output}`);
}
