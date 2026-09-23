/**
 * Dealing a practice session.
 *
 * Five alankars and two thaats — Bilawal always, paired with one drawn from
 * the enabled pool — crossed into ten sequences and laid out in one of three
 * orders. Bilawal is sequence 1 whichever is chosen.
 */

import { ALANKARS, type Alankar } from './alankars.js';
import { DEFAULT_THAAT, OPTIONAL_THAATS, THAATS, type Thaat } from './thaats.js';

export interface SessionItem {
  alankar: Alankar;
  thaat: Thaat;
}

/**
 * How the ten dealt sequences are laid out.
 *
 *   - `shuffled` — the order they were randomised into. The default.
 *   - `by-thaat` — all five in Bilawal, then the same five in the paired
 *     thaat. Learn the shape first, then move it.
 *   - `paired`   — each alankar in Bilawal followed immediately by its
 *     counterpart, so the transposition is heard back to back.
 *
 * Bilawal is sequence 1 under all three; only `shuffled` has to arrange that
 * deliberately.
 */
export type SessionOrder = 'shuffled' | 'by-thaat' | 'paired';

export const DEFAULT_ORDER: SessionOrder = 'shuffled';

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
 * One random pairing from everything the app has — all 53 alankars and all ten
 * thaats, Bilawal included.
 *
 * Unlimited mode deliberately ignores both the day's deal and the thaat pool:
 * it is the "surprise me" mode, so it draws from the whole book.
 */
export function randomItem(): SessionItem {
  return { alankar: pick(ALANKARS), thaat: pick(THAATS) };
}

/**
 * Deal a session: five alankars, two thaats, crossed and laid out as `order`
 * asks.
 */
export function newSession(
  enabled: readonly string[],
  order: SessionOrder = DEFAULT_ORDER,
): Session {
  const alankars = shuffle([...ALANKARS]).slice(0, ALANKARS_PER_SESSION);
  const other = pick(enabledThaats(enabled));
  const thaats = [DEFAULT_THAAT, other];

  return { items: orderItems(alankars, thaats, order), thaats };
}

/**
 * Re-lay an existing deal in a different order.
 *
 * A permutation of the ten sequences already dealt — the same five alankars
 * and the same two thaats — so changing the order costs the day's session
 * nothing and can be applied the moment it is picked.
 *
 * Returns null for anything that is not a clean cross of alankars and thaats:
 * an unlimited stream has no shape to impose an order on, and neither has a
 * stored session from some other version.
 */
export function reorderSession(
  items: readonly SessionItem[],
  order: SessionOrder,
): SessionItem[] | null {
  const alankars: Alankar[] = [];
  const thaats: Thaat[] = [];
  for (const item of items) {
    if (!alankars.some((a) => a.n === item.alankar.n)) alankars.push(item.alankar);
    if (!thaats.some((t) => t.key === item.thaat.key)) thaats.push(item.thaat);
  }
  // First-seen order puts Bilawal first, because it is sequence 1 of every
  // layout — so the re-lay keeps it there without having to look for it.
  if (items.length !== alankars.length * thaats.length) return null;
  return orderItems(alankars, thaats, order);
}

/**
 * Cross the alankars with the two thaats into the ten sequences, in the
 * requested order.
 *
 * `thaats` arrives as [Bilawal, the paired thaat] and the order is preserved,
 * so every layout starts on the thaat the student knows.
 */
function orderItems(
  alankars: readonly Alankar[],
  thaats: readonly Thaat[],
  order: SessionOrder,
): SessionItem[] {
  if (order === 'by-thaat') {
    const items: SessionItem[] = [];
    for (const thaat of thaats) for (const alankar of alankars) items.push({ alankar, thaat });
    return items;
  }

  const items: SessionItem[] = [];
  for (const alankar of alankars) for (const thaat of thaats) items.push({ alankar, thaat });
  // `paired` is already the pairing order the cross produces.
  if (order === 'paired') return items;

  shuffle(items);
  // Bilawal is compulsory and is always sequence 1: the student starts on the
  // thaat they know before being asked for one they don't.
  const b = items.findIndex((x) => x.thaat.key === DEFAULT_THAAT.key);
  if (b > 0) [items[0], items[b]] = [items[b], items[0]];
  return items;
}
