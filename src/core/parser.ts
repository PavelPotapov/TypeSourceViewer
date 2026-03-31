import { createBracketState, isBalanced, processChar } from './bracket-tracker';
import { findDeclarationStart, getDeclarationPrefixLength } from './find-declaration';
import type { ParseOptions } from './types';

const normalizeNewlines = (str: string): string => str.replaceAll('\r\n', '\n');

/**
 * Skips whitespace starting from `pos` and returns the index of the next non-whitespace char.
 */
const skipWhitespace = (content: string, pos: number): number => {
  while (pos < content.length && /\s/.test(content[pos])) pos++;
  return pos;
};

/** Characters that signal the type body continues after brackets are balanced. */
const CONTINUATION_TOKENS = new Set(['&', '|', '?']);

/**
 * Checks whether the type definition continues after the current position.
 * This handles cases like intersection (&), union (|), arrow (=>),
 * conditional (?), function params after generic, extends, etc.
 *
 * Returns the new cursor position if the type continues, or -1 if it ends.
 */
function getContinuationOffset(content: string, endIndex: number): number {
  const lookAhead = skipWhitespace(content, endIndex);
  const ch = content[lookAhead];
  const ch2 = content[lookAhead + 1];

  // & (intersection) or | (union) or ? (conditional)
  if (CONTINUATION_TOKENS.has(ch)) {
    return lookAhead + 1;
  }

  // => (arrow function return type)
  if (ch === '=' && ch2 === '>') {
    return lookAhead + 2;
  }

  // ( — function params after generic <T>
  // { — object body after generic params or extends
  if (ch === '(' || ch === '{') {
    return endIndex; // don't skip the bracket, let main loop handle it
  }

  // = (but not =>) — haven't reached the body yet (generic default)
  if (ch === '=' && ch2 !== '>') {
    return endIndex;
  }

  // extends — interface extends clause
  if (content.substring(lookAhead, lookAhead + 7) === 'extends') {
    return lookAhead + 7;
  }

  // [] — array suffix
  if (ch === '[' && ch2 === ']') {
    return lookAhead + 2;
  }

  // ; — consume the semicolon and stop
  if (ch === ';') {
    return -(lookAhead + 1); // negative = final position (stop after consuming)
  }

  // Anything else — type is done
  return -endIndex;
}

/**
 * Extracts a type or interface definition from file content as a string.
 *
 * Works like a simple scanner/tokenizer: tracks bracket nesting { } < > ( ),
 * respects string literals, and uses look-ahead to decide whether the type
 * continues after brackets are balanced (intersection, union, arrow, conditional, etc.).
 *
 * Handles:
 * - Object types:     `type A = { ... }`
 * - Generics:         `Omit<B, 'x'>`, `Pick<B, 'y'>`, `Map<K, V>`
 * - Intersections:    `A & B & { ... }`
 * - Unions:           `'a' | 'b' | C`
 * - Functions:        `(arg: string) => void`
 * - Arrow vs generic: `=>` is not confused with `>`
 * - String literals:  brackets inside strings are ignored
 * - Interfaces:       `interface A extends B { ... }`
 * - Generic defaults: `type A<T extends X = {}, K = keyof T>`
 * - Mapped types, tuples, template literals, recursive types
 * - JSDoc inside type bodies is preserved
 * - Does not capture the next declaration in the file
 *
 * @param content - TypeScript file content
 * @param typeName - Name of the type to extract
 * @param options - Parsing options
 * @returns The type definition string, or undefined if not found
 */
export function parseTypeFromContent(
  content: string,
  typeName: string,
  options: ParseOptions = {},
): string | undefined {
  const startIndex = findDeclarationStart(content, typeName);
  if (startIndex === -1) return undefined;

  const isInterface = content.startsWith(`interface ${typeName}`, startIndex);
  let cursor = startIndex + getDeclarationPrefixLength(content, startIndex, typeName);

  const state = createBracketState();
  let foundEquals = isInterface; // interfaces don't need '='
  let foundBody = false;

  while (cursor < content.length) {
    const ch = content[cursor];
    const prevCh = cursor > 0 ? content[cursor - 1] : '';

    // String literals — brackets inside strings don't count
    if (processChar(state, ch, prevCh)) {
      cursor++;
      continue;
    }

    // Wait for '=' to separate generic params from the type body
    if (!foundEquals && ch === '=') {
      foundEquals = true;
      cursor++;
      continue;
    }

    // Track when we've entered the actual type body
    if (ch === '{' || (ch === '(' && foundEquals)) {
      foundBody = true;
    }

    cursor++;

    // Semicolon with all brackets closed — definite end
    if (ch === ';' && isBalanced(state)) {
      break;
    }

    // Brackets are balanced after having entered the body — check if type continues
    if (foundBody && isBalanced(state)) {
      const offset = getContinuationOffset(content, cursor);

      if (offset >= 0) {
        // Type continues
        cursor = offset;
        foundBody = false;
        continue;
      }

      // Type ends — offset is negative, absolute value is final position
      cursor = -offset;
      break;
    }
  }

  const definition = content.substring(startIndex, cursor).trim();

  return options.normalizeNewlines !== false ? normalizeNewlines(definition) : definition;
}
