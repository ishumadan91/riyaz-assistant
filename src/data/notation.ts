/**
 * Notation parsing — ASCII in, tokens out. Pure: no DOM, no HTML.
 *
 * The old implementation returned an HTML string for `innerHTML`. Lit templates
 * do not take HTML strings, so parsing and rendering are now split: this module
 * produces a token model and `rz-notation-line` renders it into `rz-swara`.
 *
 * A dot binds to the swara it touches: `S.` is taar, `.N` is mandra. Between
 * two swaras that is genuinely ambiguous — in `S.ND` the dot could be the taar
 * of S or the mandra of N, and only the person writing the phrase knows which.
 * The scan resolves it backwards, so an unmarked dot is always the taar of the
 * swara before it. That is right far more often than not: `S.NDPmGRS` is a
 * descent from taar sa.
 *
 * Where it is *not* right, brackets say so — see `(`/`)` below.
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

/**
 * Index of the `)` closing the `(` at `open`, or -1 if there is none.
 * Counts depth, so a nested pair does not close the outer one early.
 */
function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++;
    else if (text[i] === ')' && --depth === 0) return i;
  }
  return -1;
}

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

/**
 * Scan one run, appending to `tokens`.
 *
 * `(…)` is a **binding fence**, not a mark: it is never rendered, and all it
 * does is end the reach of the dots on either side of it. Its contents are
 * scanned as a run of their own, so a dot first in the brackets has no swara
 * behind it to bind to and a swara last in them has no dot ahead to claim —
 * which is exactly what makes `S(.N)(.D)(.P)` read as sa and three mandra
 * swaras where the bare `S.N.D.P` would read as three taar ones. `(S.)ND`
 * forces the binding the other way, spelling out a taar S the scan would have
 * reached anyway.
 *
 * Brackets never span a space: `parseNotation` splits on spaces first, and a
 * space already separates, so there is nothing inside one for a fence to do.
 */
function parseRun(text: string, tokens: NotationToken[]): void {
  let i = 0;

  while (i < text.length) {
    const c = text[i];

    if (c === '(') {
      const close = closingParen(text, i);
      if (close !== -1) {
        parseRun(text.slice(i + 1, close), tokens);
        i = close + 1;
        continue;
      }
      // Unmatched: fall through and render the bracket. A stray one is a typo
      // in the data, and a visible bracket says so — far better than silently
      // binding a dot the wrong way, which looks like real notation.
    }

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
}

function parseGroup(text: string): NotationToken[] {
  const tokens: NotationToken[] = [];
  parseRun(text, tokens);
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
