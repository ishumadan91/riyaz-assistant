/**
 * Notation parsing — ASCII in, tokens out. Pure: no DOM, no HTML.
 *
 * The old implementation returned an HTML string for `innerHTML`. Lit templates
 * do not take HTML strings, so parsing and rendering are now split: this module
 * produces a token model and `rz-notation-line` renders it into `rz-swara`.
 */

export type Saptak = 'mandra' | 'madhya' | 'taar';

export type NotationToken =
  | {
      kind: 'swara';
      /** Uppercase, for display. The accidental lives in the flags below. */
      letter: string;
      komal: boolean;
      teevra: boolean;
      saptak: Saptak;
    }
  | { kind: 'punct'; text: string };

/**
 * One space-separated run, rendered `white-space: nowrap`.
 *
 * The grouping is deliberate and lives in the model rather than only in CSS:
 * each swara renders as its own inline-block, so without the run a line can
 * break between any two of them and split a phrase mid-group.
 */
export interface NotationGroup {
  tokens: NotationToken[];
}

/** Lowercase letters that mean komal. `m` is absent: it is shuddha madhyam. */
const KOMAL = 'rgdn';
const SWARA = 'SRGmPDNrgdnM';

const isSwara = (c: string | undefined): boolean => !!c && SWARA.includes(c);

function swara(c: string, saptak: Saptak): NotationToken {
  return {
    kind: 'swara',
    // Case carried the accidental; it has been read, so display uppercase.
    letter: c.toUpperCase(),
    komal: KOMAL.includes(c),
    teevra: c === 'M',
    saptak,
  };
}

function parseGroup(text: string): NotationToken[] {
  const tokens: NotationToken[] = [];
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    // A dot bound to the swara *before* it is taar, and the swara branch below
    // consumes it. So any dot reaching here belongs to the swara that follows.
    if (c === '.' && isSwara(text[i + 1])) {
      tokens.push(swara(text[i + 1], 'mandra'));
      i += 2;
      continue;
    }
    if (isSwara(c)) {
      const taar = text[i + 1] === '.';
      tokens.push(swara(c, taar ? 'taar' : 'madhya'));
      i += taar ? 2 : 1;
      continue;
    }
    tokens.push({ kind: 'punct', text: c });
    i += 1;
  }

  return tokens;
}

/**
 * Parse an ASCII notation line into groups of tokens.
 *
 * Splitting on spaces first is safe for the dot rules: a space always
 * separates, so a dot never binds across a group boundary.
 */
export function parseNotation(text: string): NotationGroup[] {
  return text
    .split(' ')
    .filter((seg) => seg.length > 0)
    .map((seg) => ({ tokens: parseGroup(seg) }));
}
