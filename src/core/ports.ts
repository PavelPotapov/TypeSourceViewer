import type { ScanResult, TypeMap } from './types';

/** Порт для чтения файлов */
export interface FileReaderPort {
  read(filePath: string): string;
  exists(filePath: string): boolean;
}

/** Порт для сканирования файлов на использование TypeSourceViewer */
export interface ScannerPort {
  scan(directory: string, extensions: string[]): ScanResult[];
}

/** Порт для записи результатов */
export interface OutputWriterPort {
  write(outputPath: string, data: TypeMap): void;
}
