/** Result of parsing a single type definition */
export interface TypeDeclaration {
  /** Full type definition as a string */
  definition: string;
  /** Type name */
  typeName: string;
  /** Whether it's a `type` alias or an `interface` */
  kind: 'type' | 'interface';
}

/** A usage of TypeSourceViewer found during file scanning */
export interface ScanResult {
  /** Path to the source .ts file containing the type */
  filePath: string;
  /** Name of the type */
  typeName: string;
  /** File where the usage was found (e.g. an MDX file) */
  sourceFile: string;
}

/** Map of extracted types: key "filePath$$$typeName" → definition string */
export interface TypeMap {
  [key: string]: string;
}

/** Options for the parser */
export interface ParseOptions {
  /** Normalize line endings (\r\n → \n). Defaults to true. */
  normalizeNewlines?: boolean;
}
