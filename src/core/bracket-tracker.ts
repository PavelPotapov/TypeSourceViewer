/**
 * State machine for tracking bracket nesting and string literals.
 * Tracks { }, < >, ( ) depth while ignoring brackets inside strings.
 */
export interface BracketState {
  braces: number; // { }
  angles: number; // < >
  parens: number; // ( )
  inString: boolean;
  stringChar: string; // ' or " or `
}

export const createBracketState = (): BracketState => ({
  braces: 0,
  angles: 0,
  parens: 0,
  inString: false,
  stringChar: '',
});

export const isBalanced = (state: BracketState): boolean =>
  state.braces === 0 && state.angles === 0 && state.parens === 0;

/**
 * Advances the state machine by one character.
 * Returns true if the character was consumed as part of a string literal
 * (meaning it should not be interpreted as syntax).
 */
export function processChar(state: BracketState, ch: string, prevCh: string): boolean {
  // --- String literal handling ---
  if (!state.inString && (ch === "'" || ch === '"' || ch === '`')) {
    state.inString = true;
    state.stringChar = ch;
    return true;
  }

  if (state.inString) {
    if (ch === state.stringChar && prevCh !== '\\') {
      state.inString = false;
    }
    return true;
  }

  // --- Bracket tracking ---
  switch (ch) {
    case '{':
      state.braces++;
      break;
    case '}':
      state.braces--;
      break;
    case '<':
      state.angles++;
      break;
    case '>':
      // Distinguish '=>' (arrow) from '>' (closing angle bracket)
      if (prevCh !== '=' && state.angles > 0) {
        state.angles--;
      }
      break;
    case '(':
      state.parens++;
      break;
    case ')':
      state.parens--;
      break;
  }

  return false;
}
