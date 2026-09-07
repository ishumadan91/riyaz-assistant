/**
 * Dealing a practice session.
 *
 * Five alankars and two thaats — Bilawal always, paired with one drawn from
 * the enabled pool — crossed into ten sequences and shuffled.
 */

import { ALANKARS, type Alankar } from './alankars.js';
import { DEFAULT_THAAT, OPTIONAL_THAATS, THAATS, type Thaat } from './thaats.js';

export interface SessionItem {
  alankar: Alankar;
  thaat: Thaat;
}

export interface Session {
  items: SessionItem[];
  /** [Bilawal, the paired thaat] — what the header chips show. */
  thaats: Thaat[];
}

export const ALANKARS_PER_SESSION = 5;

/** Fisher–Yates, in place. */
export function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(a: readonly T[]): T {
  return a[Math.floor(Math.random() * a.length)];
}

/**
 * Resolve the pool the paired thaat is drawn from.
 *
 * Falls back to all nine if the stored pool somehow validated to empty — the
 * pairing must always have somewhere to draw from.
 */
export function enabledThaats(enabled: readonly string[]): readonly Thaat[] {
  const on = OPTIONAL_THAATS.filter((t) => enabled.includes(t.key));
  return on.length ? on : OPTIONAL_THAATS;
}

/**
 * Deal a session.
 *
 * The order is shuffled for surprise, then a Bilawal item is swapped into
 * position 0: the student starts on the thaat they know before being asked for
 * one they don't. Everything after that stays a surprise.
 */
/**
 * One random pairing from everything the app has — all 53 alankars and all ten
 * thaats, Bilawal included.
 *
 * Unlimited mode deliberately ignores both the day's deal and the thaat pool:
 * it is the "surprise me" mode, so it draws from the whole book.
 */
export function randomItem(): SessionItem {
  return { alankar: pick(ALANKARS), thaat: pick(THAATS) };
}

export function newSession(enabled: readonly string[]): Session {
  const alankars = shuffle([...ALANKARS]).slice(0, ALANKARS_PER_SESSION);
  const other = pick(enabledThaats(enabled));
  const thaats = [DEFAULT_THAAT, other];

  const items: SessionItem[] = [];
  for (const alankar of alankars) for (const thaat of thaats) items.push({ alankar, thaat });
  shuffle(items);

  const b = items.findIndex((x) => x.thaat.key === DEFAULT_THAAT.key);
  if (b > 0) [items[0], items[b]] = [items[b], items[0]];

  return { items, thaats };
}
