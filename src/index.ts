// Main entry — re-exports core public API
export { parseTypeFromContent } from './core/parser';
export { findDeclarationStart, getDeclarationPrefixLength } from './core/find-declaration';
export type {
  TypeDeclaration,
  ScanResult,
  TypeMap,
  ParseOptions,
} from './core/types';
export type {
  FileReaderPort,
  ScannerPort,
  OutputWriterPort,
} from './core/ports';
