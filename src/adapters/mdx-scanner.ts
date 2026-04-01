import { readdirSync, readFileSync, statSync } from 'fs';
import { extname, join } from 'path';
import type { ScannerPort } from '../core/ports';
import type { ScanResult } from '../core/types';

const COMPONENT_NAME = 'TypeSourceViewer';
const FUNC_NAME = 'getTypeAsString';

/** Extracts filePath and typeName from <TypeSourceViewer ... /> props. */
function collectFromComponent(fileContent: string, sourceFile: string): ScanResult[] {
  const results: ScanResult[] = [];
  const componentPattern = /<TypeSourceViewer\s[^>]*?>/g;
  const propsPattern =
    /(?<filePath>filePath\s*=\s*["']([^"']+)["'])|(?<typeName>typeName\s*=\s*["']([^"']+)["'])/g;

  const components = [...fileContent.matchAll(componentPattern)].map((m) => m[0]);

  for (const component of components) {
    let filePath = '';
    let typeName = '';
    let match: RegExpExecArray | null;

    while ((match = propsPattern.exec(component)) !== null) {
      if (match.groups?.filePath) {
        filePath = match.groups.filePath.split('"')?.[1] ?? '';
      }
      if (match.groups?.typeName) {
        typeName = match.groups.typeName.split('"')?.[1] ?? '';
      }
    }
    propsPattern.lastIndex = 0;

    if (filePath && typeName) {
      results.push({ filePath, typeName, sourceFile });
    }
  }

  return results;
}

/** Extracts filePath and typeName from getTypeAsString(filePath, typeName) calls. */
function collectFromFunction(fileContent: string, sourceFile: string): ScanResult[] {
  const results: ScanResult[] = [];
  const pattern = /getTypeAsString\(.*?\)/gs;
  const matches = [...fileContent.matchAll(pattern)].map((m) => m[0]);

  for (const match of matches) {
    const args = match.split('(')?.[1]?.slice(0, -1).trim();
    if (!args) continue;

    const [filePath, typeName] = args.split(',').map((s) => s.trim().slice(1, -1));

    if (filePath && typeName) {
      results.push({ filePath, typeName, sourceFile });
    }
  }

  return results;
}

/** Extracts filePath and typeName from CSF story args (e.g. args: { filePath: '...', typeName: '...' }). */
function collectFromCsfArgs(fileContent: string, sourceFile: string): ScanResult[] {
  const results: ScanResult[] = [];
  const argsPattern = /args\s*:\s*\{[^}]*\}/gs;
  const matches = [...fileContent.matchAll(argsPattern)].map((m) => m[0]);

  for (const match of matches) {
    const filePathMatch = match.match(/filePath\s*:\s*['"]([^'"]+)['"]/);
    const typeNameMatch = match.match(/typeName\s*:\s*['"]([^'"]+)['"]/);

    if (filePathMatch?.[1] && typeNameMatch?.[1]) {
      results.push({ filePath: filePathMatch[1], typeName: typeNameMatch[1], sourceFile });
    }
  }

  return results;
}

/** Recursively walks a directory and collects scan results. */
function walkDirectory(dir: string, extensions: string[]): ScanResult[] {
  const results: ScanResult[] = [];

  for (const item of readdirSync(dir)) {
    const itemPath = join(dir, item);
    const stat = statSync(itemPath);

    if (stat.isDirectory()) {
      results.push(...walkDirectory(itemPath, extensions));
      continue;
    }

    if (!extensions.includes(extname(itemPath))) continue;

    const content = readFileSync(itemPath, 'utf8');

    if (content.includes(`<${COMPONENT_NAME}`)) {
      results.push(...collectFromComponent(content, itemPath));
    }
    if (content.includes(`${FUNC_NAME}(`)) {
      results.push(...collectFromFunction(content, itemPath));
    }
    if (content.includes('filePath') && content.includes('typeName')) {
      results.push(...collectFromCsfArgs(content, itemPath));
    }
  }

  return results;
}

/** MDX/TSX scanner implementation of ScannerPort. */
export const createMdxScanner = (): ScannerPort => ({
  scan(directory: string, extensions: string[]): ScanResult[] {
    return walkDirectory(directory, extensions);
  },
});
