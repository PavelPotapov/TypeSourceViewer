import { writeFileSync } from 'fs';
import type { OutputWriterPort } from '../core/ports';
import type { TypeMap } from '../core/types';

/** JSON file implementation of OutputWriterPort. */
export const createJsonWriter = (): OutputWriterPort => ({
  write(outputPath: string, data: TypeMap): void {
    writeFileSync(outputPath, JSON.stringify(data));
  },
});
