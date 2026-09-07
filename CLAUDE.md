# Riyāz

Alankar practice for Hindustani vocal riyaz. Lit + TypeScript web components,
Atomic Design, Vite, Storybook. Runs standalone on GitHub Pages and embeds into
the LWCG Django app as `<rz-practice-page>`.

## Commands

| | |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | typecheck + standalone build to `dist/` |
| `npm run build:lib` | typecheck + single-file embed bundle to `dist-lib/riyaz.js` |
| `npm run typecheck` | `tsc --noEmit` — the only gate; there is no test runner |
| `npm run storybook` | component workbench on :6006 |
| `npm run about` | regenerate `src/data/about.ts` from README.md |

## Architecture

```
src/
  styles/       tokens.css (source of truth), global.css, colors.stories.ts
  data/         thaats.ts, alankars.ts, notation.ts, session.ts,
                preferences.ts, about.ts (GENERATED)
  audio/        metronome.ts
  components/
    atoms/      button, badge, card, swara, checkbox, number-field, field-label
    molecules/  notation-line, beat-row, tempo-control, rail-item,
                thaat-pool, alankar-part
    organisms/  app-header, settings-panel, about-sheet, sequence-rail,
                alankar-card, transport-bar, session-complete
    templates/  practice-template   (layout, no state)
    pages/      practice-page       (owns state, drives the metronome)
  main.ts       standalone entry — sets globalKeys, focuses the page
  embed.ts      library entry — registration + types only
```

## Conventions (read before adding components)

- Tag `rz-<name>`, class `Rz<Name>`, files `rz-<name>.ts` + `rz-<name>.stories.ts`.
- **Tokens only.** No raw hex anywhere in a component.
- Data down via `@property()`; behaviour up via `CustomEvent` with
  `{ bubbles: true, composed: true }` — `composed` is what crosses the shadow
  boundary. Name events `rz-*`.
- **Pages own state. Templates and organisms are presentational.** An organism
  reaching for storage or the metronome is in the wrong layer.
- Side-effect imports of child components use the `.js` path, required by
  `moduleResolution: bundler`.
- `HTMLElementTagNameMap` declaration at the bottom of every component.
- `useDefineForClassFields` must stay `false` — with it true, class field
  initialisers clobber Lit's accessors and every `@property` stops reacting.

### The prefix is load-bearing

Element registration is global to the document. Defining a tag twice throws
`NotSupportedError` and takes the host page down. Riyāz is `rz-`; the sibling
ear-training app is `et-`. Never define an `et-*` element here, never import
from that repo.

## Notation

`data/notation.ts` parses ASCII into a token model; `rz-notation-line` renders
it. Three things are load-bearing:

- **Case carries the accidental.** After `transpose()`, lowercase `r g d n` are
  komal and `M` is teevra — but lowercase `m` is *shuddha* madhyam and is
  neither. The letter is uppercased for display only. Lose this and every
  non-Bilawal thaat renders wrong.
- **A dot binds to the swara it touches.** `S.` is taar, `.N` is mandra. The
  parser consumes a trailing dot before it can be mistaken for a leading one;
  keep that ordering.
- **Space-separated grouping is deliberate.** Each swara is an inline-block, so
  without the nowrap run a line breaks between any two of them and splits a
  phrase. The grouping lives in the token model, not just in CSS.

Marks are drawn in CSS, never with combining characters: a combining low line
lands wherever the font decides, and a komal swara in the mandra saptak needs a
line *and* a dot below the same letter. Tracking comes from `margin`, not
`letter-spacing`, so each glyph's box is exactly the letter and adjacent komal
rules don't run together.

## Thaats

All 53 alankars are stored **in Bilawal only**; every other thaat is derived at
render time by substituting the five variable swaras. Adding an alankar means
adding one Bilawal entry.

Bilawal is compulsory and is always sequence 1 — `newSession()` shuffles, then
swaps a Bilawal item into position 0. The rest stay a surprise. The other nine
are a user-controlled pool that **can never be empty**; `rz-thaat-pool` refuses
the last untick, because a session with nothing to pair Bilawal against cannot
be dealt.

## The cycle

Each sequence is preceded by a **3-beat count-in** (`COUNT_IN_BEATS`) on its own
stroke, so a sequence is `COUNT_IN_BEATS + 8 × cyclesPerItem` beats long and all
the beat maths runs off `beatsPerSequence`, not the cycle length. The count
stroke is high and thin so it can never be mistaken for sam.

`Metronome.strokeFor` is the hook that makes this possible: the page decides
each beat's stroke. It is called at **schedule** time, up to LOOKAHEAD ahead of
the beat being heard, so it must be derivable from the beat number alone —
never from state that only becomes true when the beat arrives.

Eight beats, fixed — not a setting. Heard as 4 + 4, so two beats are marked and
they differ in timbre as well as loudness: sam is a bright triangle and takes
`--color-accent`; the half-way beat is a low sine and takes `--color-primary`.
`midBeatIndex()` returns -1 for odd or short cycles, which must render no
divider.

## The metronome

Two clocks, deliberately. Clicks are scheduled `LOOKAHEAD = 0.12s` ahead on the
**audio** clock by a `setInterval` poll; the visual beat is released separately
by a `requestAnimationFrame` drain, so the dot lights exactly when the click is
heard. Driving the UI from the interval reintroduces audible jitter — that split
is the whole design. Do not "simplify" it.

`resync()` restarts the beat phase from sam, used when skipping sequences;
without it the grid drifts out of phase with what is displayed.

The context is created lazily (browsers block audio until a gesture) and
`resume()`'s rejection is swallowed — Safari rejects it when it judges the call
non-gesture-initiated, and an unhandled rejection there can abort scheduling.
With no Web Audio at all it stays silent rather than throwing.

## Modes

`repeat` and `unlimited` are preferences, and both change what `advance()` does.

- **repeat-one** stays on the current sequence. It still reports
  `rz-sequence-complete` — the metronome did get through it, so it was practice —
  and the beat maths restarts the count-in on its own.
- **unlimited** is a mode, not a filter. Entering it starts a fresh endless
  stream (`startUnlimited`), and `advance`/`goto` append a `randomItem()` drawn
  from **all** alankars and **all** thaats — deliberately ignoring both the day's
  deal and the thaat pool, because it is the "surprise me" mode. It never
  finishes and never reports `rz-session-complete`. Leaving it restores the day's
  session, which was never overwritten: `persistSession()` is a no-op while
  unlimited.

## The day's session

`data/day-session.ts` keeps the dealt session under `riyaz:session` until **local**
midnight — `todayKey()` is deliberately not UTC, because midnight means the
student's midnight. A refresh resumes the same ten at the same position; the next
day deals new material; "New session" overrides it on demand.

Only the deal is stored (alankar number + thaat key + index), never the alankar
bodies, so a stored session survives edits to `alankars.ts`. Anything that no
longer resolves invalidates the whole stored session rather than being patched
around.

## Preferences

`data/preferences.ts` owns settings only. Beats per cycle is absent on purpose.
Everything is **validated on read**: stored values are user-editable and outlive
schema changes, so a stale thaat key must never reach the randomiser and the
pool must never validate to empty.

## Embedding

`rz-practice-page` is the whole contract.

- **Theming is free.** Custom properties pierce Shadow DOM, so the components
  read LWCG's own token names and the host's `:root` supplies them. This is why
  `tokens.css` must never be bundled into the library build, and why `embed.ts`
  imports nothing but the page.
- **Storage is injected.** `.storage` takes a `RiyazStorage` and defaults to
  localStorage, so the app stays standalone-runnable with no configuration. The
  interface is synchronous, mirroring localStorage: a server-backed adapter must
  hydrate its cache before assignment and write through asynchronously.
- **Preferences are read on the first update, not in `connectedCallback`.** When
  a host has `<rz-practice-page>` in its own markup the element upgrades *during*
  the `import`, so `connectedCallback` runs before the host's next line can
  assign `.storage`. Lit's first update is a microtask, which lands after the
  host's module body. Assigning `.storage` later still works — a change re-reads
  preferences and re-deals only if the pool differs.
- **Keys never bind to `document` unless asked.** `globalKeys` is standalone-only;
  binding space and the arrows on the document would hijack them for the host
  page. Exactly one target is bound, never both, or handlers fire twice. The
  "am I typing?" check uses `composedPath()[0]`, because Shadow DOM retargets
  `event.target` to the host.
- **The page must not claim the viewport.** `rz-practice-template` fills its host
  with `height: 100%`; the `100dvh` frame lives in `global.css`, which only the
  standalone build loads.
- **Events report, the host computes.** `rz-session-start`,
  `rz-sequence-complete`, `rz-session-complete`. A sequence only counts as
  complete when the *metronome* advanced past it — a manual skip is not practice.

## Panels

Settings and About are mutually exclusive and Escape closes whichever is open.
This is one page state (`panel: 'settings' | 'about' | null`), not two booleans
that can disagree.
