/**
 * The day's dealt session, persisted until local midnight.
 *
 * A refresh should not re-roll what you were practising — but the next day
 * should be new material. "New session" overrides it deliberately.
 *
 * Only the *deal* is stored (which alankar, which thaat, and where you were),
 * never the alankar bodies: those live in `alankars.ts` and are resolved on
 * read, so a stored session survives edits to the data.
 */

import { ALANKARS } from './alankars.js';
import { THAATS, type Thaat } from './thaats.js';
import type { RiyazStorage } from './preferences.js';
import type { SessionItem } from './session.js';

const SESSION_KEY = 'riyaz:session';

interface StoredSession {
  /** Local calendar date, so the session expires at the user's own midnight. */
  date: string;
  items: { n: number; thaat: string }[];
  index: number;
}

/** Local date key. Deliberately not ISO/UTC: midnight means the user's midnight. */
export function todayKey(now: Date = new Date()): string {
  const pad = (v: number) => String(v).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function saveDaySession(
  storage: RiyazStorage,
  items: SessionItem[],
  index: number,
): void {
  try {
    const payload: StoredSession = {
      date: todayKey(),
      items: items.map((i) => ({ n: i.alankar.n, thaat: i.thaat.key })),
      index,
    };
    storage.set(SESSION_KEY, payload);
  } catch {
    /* storage unavailable — the session just won't survive a refresh */
  }
}

/**
 * Restore today's session, or null to deal a fresh one.
 *
 * Returns null for anything unrecognised as well as for a stale date: an
 * alankar number or thaat key that no longer exists must never reach the app.
 */
export function loadDaySession(
  storage: RiyazStorage,
): { items: SessionItem[]; thaats: Thaat[]; index: number } | null {
  let raw: unknown = null;
  try {
    raw = storage.get(SESSION_KEY);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const stored = raw as Partial<StoredSession>;
  if (stored.date !== todayKey()) return null;
  if (!Array.isArray(stored.items) || stored.items.length === 0) return null;

  const items: SessionItem[] = [];
  for (const entry of stored.items) {
    const alankar = ALANKARS.find((a) => a.n === entry?.n);
    const thaat = THAATS.find((t) => t.key === entry?.thaat);
    if (!alankar || !thaat) return null;
    items.push({ alankar, thaat });
  }

  // The header chips show the session's distinct thaats, in first-seen order.
  const thaats: Thaat[] = [];
  for (const i of items) if (!thaats.some((t) => t.key === i.thaat.key)) thaats.push(i.thaat);

  const index =
    typeof stored.index === 'number' && stored.index >= 0 && stored.index < items.length
      ? Math.floor(stored.index)
      : 0;

  return { items, thaats, index };
}
