/**
 * Practice preferences, and where they are kept.
 *
 * Only settings persist. The dealt session is deliberately not stored: each
 * visit deals a fresh one, which is the point of the app.
 *
 * Beats per cycle is absent on purpose — the cycle is fixed at eight and is
 * not a setting. So is how many cycles an alankar gets: it loops until you
 * press Next, so there is no number to set.
 *
 * Stored copies from older versions may still carry `repeat` and
 * `cyclesPerItem`. Nothing reads them, and validation ignores what it does not
 * recognise, so they age out harmlessly.
 */

import { OPTIONAL_THAATS } from './thaats.js';

const STORAGE_KEY = 'riyaz';

export const BPM_MIN = 30;
export const BPM_MAX = 180;

/**
 * Where settings are kept.
 *
 * The app defaults to localStorage and runs standalone with no configuration.
 * A host embedding `rz-practice-page` can supply its own backend instead — a
 * server-backed one, so a student's settings follow them across devices.
 *
 * Deliberately **synchronous**, mirroring localStorage: the page reads
 * preferences in `connectedCallback` and has nowhere to await. A server-backed
 * adapter must therefore hydrate its cache *before* it is assigned to
 * `.storage`, and write through asynchronously.
 */
export interface RiyazStorage {
  get(key: string): unknown | null;
  set(key: string, value: unknown): void;
}

/**
 * The default backend.
 *
 * Every access is wrapped: localStorage throws rather than returning null in
 * some browsers — Safari in private mode is the classic case. Losing
 * persistence is acceptable; taking the app down with it is not.
 */
export const localStorageAdapter: RiyazStorage = {
  get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

export interface Preferences {
  bpm: number;
  reveal: boolean;
  /** Keys of the optional thaats in the pool. Never empty. */
  enabled: string[];
  /** Draw endless random pairings instead of the day's ten. */
  unlimited: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  bpm: 72,
  reveal: false,
  enabled: OPTIONAL_THAATS.map((t) => t.key),
  unlimited: false,
};

function clampInt(v: unknown, min: number, max: number, fallback: number): number {
  const n = typeof v === 'number' ? Math.round(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/**
 * Read stored preferences, validating every field.
 *
 * Stored values are user-editable and outlive schema changes, so anything
 * unrecognised falls back to its default. Two cases matter: a thaat key that no
 * longer exists must not reach the randomiser, and the pool must never validate
 * to empty — a session with nothing to pair Bilawal against cannot be dealt.
 */
export function loadPreferences(storage: RiyazStorage): Preferences {
  let raw: unknown = null;
  try {
    raw = storage.get(STORAGE_KEY);
  } catch {
    /* storage disabled or the host errored — defaults are fine */
  }
  if (!raw || typeof raw !== 'object') return { ...DEFAULT_PREFERENCES };
  const stored = raw as Partial<Record<keyof Preferences, unknown>>;

  const enabled = Array.isArray(stored.enabled)
    ? stored.enabled.filter(
        (k): k is string => typeof k === 'string' && OPTIONAL_THAATS.some((t) => t.key === k),
      )
    : [];

  return {
    bpm: clampInt(stored.bpm, BPM_MIN, BPM_MAX, DEFAULT_PREFERENCES.bpm),
    reveal: typeof stored.reveal === 'boolean' ? stored.reveal : DEFAULT_PREFERENCES.reveal,
    enabled: enabled.length ? enabled : [...DEFAULT_PREFERENCES.enabled],
    unlimited:
      typeof stored.unlimited === 'boolean' ? stored.unlimited : DEFAULT_PREFERENCES.unlimited,
  };
}

/** Persist preferences. Silently a no-op where storage is unavailable. */
export function savePreferences(storage: RiyazStorage, preferences: Preferences): void {
  try {
    storage.set(STORAGE_KEY, preferences);
  } catch {
    /* storage full, disabled, blocked, or the host errored — session works on */
  }
}
