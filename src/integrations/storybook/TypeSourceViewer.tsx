import { Source } from '@storybook/blocks';
import type { SourceProps } from '@storybook/blocks';

interface TypeSourceViewerProps extends Omit<SourceProps, 'code'> {
  /**
   * Path to the source .ts file
   * @example "./packages/ui-kit/src/components/Table/types.ts"
   */
  filePath: string;
  /**
   * Type name to display
   * @example "TableConfig"
   */
  typeName: string;
  /**
   * Return value as string instead of rendering
   */
  asString?: boolean;
  /**
   * Code to prepend before the type definition
   */
  preSource?: string;
  /**
   * Code to append after the type definition
   */
  postSource?: string;
}

/**
 * Renders a TypeScript type definition from a source file.
 * Data is loaded from the virtual module or JSON generated at build time.
 */
export const TypeSourceViewer = ({
  filePath,
  typeName,
  asString,
  preSource,
  postSource,
  ...rest
}: TypeSourceViewerProps) => {
  if (!filePath || !typeName) {
    return null;
  }

  // TODO: replace with import from virtual:type-strings
  const allTypes: Record<string, string> = {};

  const key = `${filePath}$$$${typeName}`;
  const type = allTypes[key] ?? '';
  const finalTypeSource = `${preSource ?? ''}${type}${postSource ?? ''}`;

  if (asString) {
    return finalTypeSource as unknown as JSX.Element;
  }

  return <Source language="tsx" code={finalTypeSource} {...rest} />;
};
