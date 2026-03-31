/**
 * Finds the start index of a `type Name` or `interface Name` declaration.
 * Returns -1 if not found.
 */
export function findDeclarationStart(content: string, typeName: string): number {
  const typeIndex = content.indexOf(`type ${typeName}`);
  const interfaceIndex = content.indexOf(`interface ${typeName}`);

  if (typeIndex === -1 && interfaceIndex === -1) return -1;
  if (typeIndex === -1) return interfaceIndex;
  if (interfaceIndex === -1) return typeIndex;
  return Math.min(typeIndex, interfaceIndex);
}

/**
 * Returns the length of the keyword + type name prefix
 * (`type Name` or `interface Name`), so parsing can continue after it.
 */
export function getDeclarationPrefixLength(
  content: string,
  startIndex: number,
  typeName: string,
): number {
  if (content.startsWith(`interface ${typeName}`, startIndex)) {
    return `interface ${typeName}`.length;
  }
  return `type ${typeName}`.length;
}
