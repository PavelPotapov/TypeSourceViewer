// Core public API
export { parseTypeFromContent } from './parser';
export { findDeclarationStart, getDeclarationPrefixLength } from './find-declaration';
export type {
  TypeDeclaration,
  ScanResult,
  TypeMap,
  ParseOptions,
} from './types';
export type {
  FileReaderPort,
  ScannerPort,
  OutputWriterPort,
} from './ports';
