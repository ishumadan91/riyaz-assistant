/**
 * The ten thaats — Hindustani music's parent scales.
 *
 * Alankar data is stored in Bilawal only (all shuddha swaras), so transposing
 * to another thaat is a per-swara character substitution. That is why adding
 * an alankar means adding exactly one Bilawal entry rather than ten.
 *
 * The case of the substituted letter carries the accidental, and the notation
 * parser depends on it:
 *   lowercase `r g d n` → komal
 *   uppercase `M`       → teevra madhyam
 *   lowercase `m`       → *shuddha* madhyam, which is neither
 */

export interface Thaat {
  key: string;
  name: string;
  /** Bilawal swara → this thaat's variant. Absent means unchanged. */
  map: Readonly<Record<string, string>>;
}

export const THAATS: readonly Thaat[] = [
  { key: 'bilawal', name: 'Bilawal', map: {} },
  { key: 'kafi', name: 'Kafi', map: { G: 'g', N: 'n' } },
  { key: 'khamaj', name: 'Khamaj', map: { N: 'n' } },
  { key: 'bhairav', name: 'Bhairav', map: { R: 'r', D: 'd' } },
  { key: 'asavari', name: 'Asavari', map: { G: 'g', D: 'd', N: 'n' } },
  { key: 'bhairavi', name: 'Bhairavi', map: { R: 'r', G: 'g', D: 'd', N: 'n' } },
  { key: 'kalyan', name: 'Kalyan', map: { m: 'M' } },
  { key: 'marwa', name: 'Marwa', map: { R: 'r', m: 'M' } },
  { key: 'poorvi', name: 'Poorvi', map: { R: 'r', m: 'M', D: 'd' } },
  { key: 'todi', name: 'Todi', map: { R: 'r', G: 'g', m: 'M', D: 'd' } },
] as const;

/** Bilawal — always in the pool, always the first sequence of a session. */
export const DEFAULT_THAAT: Thaat = THAATS[0];

/** The nine the student can switch on and off. */
export const OPTIONAL_THAATS: readonly Thaat[] = THAATS.filter(
  (t) => t.key !== DEFAULT_THAAT.key,
);

export function thaatByKey(key: string): Thaat {
  return THAATS.find((t) => t.key === key) ?? DEFAULT_THAAT;
}

/**
 * Rewrite a Bilawal notation string into the given thaat. Only the five
 * variable swaras are touched; S, P and all punctuation pass through.
 *
 * A single pass, deliberately: no substitution produces a character that is
 * another substitution's key (`M` is not `m`), so there is nothing to chain.
 */
export function transpose(text: string, thaat: Thaat): string {
  let out = '';
  for (const c of text) out += thaat.map[c] ?? c;
  return out;
}

/** The thaat's own scale, for the header strip on the alankar card. */
export function thaatScale(thaat: Thaat): string {
  return transpose('S R G m P D N S.', thaat);
}
