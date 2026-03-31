import { readFileSync, existsSync } from 'fs';
import path from 'path';
import type { FileReaderPort } from '../core/ports';

/** Normalizes file path for cross-platform compatibility. */
const normalizePath = (filePath: string): string => {
  const separator = filePath.includes('/') ? '/' : '\\';
  const parts = filePath.split(separator);
  return path.join(...parts);
};

/** Node.js implementation of FileReaderPort using fs. */
export const createNodeFileReader = (): FileReaderPort => ({
  read(filePath: string): string {
    return readFileSync(normalizePath(filePath), 'utf8');
  },
  exists(filePath: string): boolean {
    return existsSync(normalizePath(filePath));
  },
});
