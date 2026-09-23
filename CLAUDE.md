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
    atoms/      button, badge, card, swara, checkbox, number-field, field-label,
                icon, icon-button
    molecules/  notation-line, beat-row, tempo-control, rail-item,
                thaat-pool, alankar-part, choice-group
    organisms/  app-header, settings-panel, about-sheet, sequence-rail,
                alankar-card, alankar-browser, transport-bar, session-complete
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
- **Start every component's styles with `base`** (`src/styles/base.ts`):
  `static styles = [base, css…]`. `global.css` sets `box-sizing: border-box`
  with a `*` rule, and that does not cross a shadow boundary — without the reset
  a component's internals are `content-box`, so any `width: 100%` element with
  padding overflows its parent by exactly the padding.

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
  keep that ordering. Between two swaras that ordering *is* the tie-break —
  `S.ND` is taar sa — and it is right far more often than not, because a dot
  mid-run is usually a descent from taar sa.

- **`(…)` is a binding fence, not a mark.** It never renders; all it does is
  end the reach of the dots either side of it, so its contents scan as a run of
  their own. That is the only way to write a descent *below* sa mid-phrase:
  `S(.N)(.D)(.P)` is sa and three mandra swaras, where the bare `S.N.D.P`
  reads as three taar ones. Alankars 38, 43, 44, 45 and 46 depend on it. An
  unmatched bracket is rendered rather than guessed at — a visible bracket
  reads as the typo it is, where a silently mis-bound dot looks like notation.
- **Space-separated grouping is deliberate.** Each swara is an inline-block, so
  without the nowrap run a line breaks between any two of them and splits a
  phrase. The grouping lives in the token model, not just in CSS.

Marks are drawn in CSS, never with combining characters: a combining low line
lands wherever the font decides, and a komal swara in the mandra saptak needs a
line *and* a dot below the same letter. Tracking comes from `margin`, not
`letter-spacing`, so each glyph's box is exactly the letter and adjacent komal
rules don't run together.

## Sequence order

Five alankars × two thaats is ten sequences, and `SessionOrder` decides how
they are laid out: `shuffled` (the default), `by-thaat` (all five in Bilawal,
then all five in the pair) and `paired` (each alankar followed by its
counterpart). `orderItems()` owns
all three; **Bilawal is sequence 1 under every one of them**, and only
`shuffled` has to arrange that with a swap.

Unlike the thaat pool, the preference applies **at once**: `reorderSession()`
permutes the ten already dealt rather than dealing again, so the day's session
survives it, and the page keeps the current item under the cursor — a re-lay
that stays on the same alankar must not resync the metronome mid-cycle. A
setting that waited for the next deal read as broken, because picking it
changed nothing on screen.

`reorderSession()` reads the alankars and thaats back out of the items in
first-seen order, which is why it needs no record of the original deal: Bilawal
is sequence 1 of every layout, so it is always the first thaat seen.

## Thaats

All 53 alankars are stored **in Bilawal only**; every other thaat is derived at
render time by substituting the five variable swaras. Adding an alankar means
adding one Bilawal entry.

Bilawal is compulsory and is always sequence 1 — `newSession()` shuffles, then
swaps a Bilawal item into position 0. The other nine
are a user-controlled pool that **can never be empty**; `rz-thaat-pool` refuses
the last untick, because a session with nothing to pair Bilawal against cannot
be dealt.

## The cycle

**The current alankar loops, forever, until Next is pressed.** Nothing advances
on its own, and there is no count-in, so a beat is only ever `n % 8` — the phase
can never shift and sam is always sam. That is why the page no longer overrides
`Metronome.strokeFor`: the metronome's own default already derives sam and the
half-way beat from the beat number.

The hook is still there and still has the rule attached to it: `strokeFor` is
called at **schedule** time, up to LOOKAHEAD ahead of the beat being heard, so
anything overriding it must be derivable from the beat number alone — never
from state that only becomes true when the beat arrives.

`handleBeat` reports `rz-sequence-complete` every time it comes back round to
sam: one cycle sung to the end is the only thing the metronome has left to
report, since it no longer moves anyone on.

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

## Moving on

Only `goto()` changes the alankar — from Next, Prev, a rail click or an arrow
key. A skip is not practice, so it never reports `rz-sequence-complete`.

**Next past the last item finishes the session.** With nothing advancing on its
own it is the only moment left that means "done", so `goto()` calls `finish()`
rather than returning early — that is the one path to `rz-session-complete`.

**unlimited** is a mode, not a filter. Entering it starts a fresh endless stream
(`startUnlimited`), and `goto` appends a `randomItem()` drawn from **all**
alankars and **all** thaats — deliberately ignoring both the day's deal and the
thaat pool, because it is the "surprise me" mode. It never finishes and never
reports `rz-session-complete`. Leaving it restores the day's session, which was
never overwritten: `persistSession()` is a no-op while unlimited.

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

`data/preferences.ts` owns settings only. Beats per cycle is absent on purpose,
and so is cycles per alankar — the alankar loops, so there is no number to set.
A stored copy may still carry `repeat` or `cyclesPerItem` from an older version;
nothing reads them and validation ignores what it does not recognise.
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
  `rz-sequence-complete`, `rz-session-complete`. A cycle only counts as practice
  when the *metronome* sang it through to sam — a manual skip reports nothing.

## Responsive

Three breakpoints, and each exists for a reason:

- **768px** — the rail turns from a sidebar into a horizontal strip.
- **560px** — the phone layout. The header drops the thaat chips so the title
  and the three actions fit on one line (the pair is still on the card's badge
  and against every rail row); the tempo control drops its label, and the rule
  between play and tempo goes, the gap alone carrying the seam. That is what
  lets navigation, the beat row and the metronome share one line instead of the
  transport taking three.

Chrome on a 390×844 phone is 40px of header, 53px of rail and 105px of
transport, leaving ~646px for the notation. If a change pushes the header or
transport onto another row, that budget is what it is eating.

## The transport

Two groups with the beat row between them: **which alankar** on the left (prev,
Next, unlimited), **the metronome** on the right (play, then tempo). Next is the
only control pressed between alankars, so it is the only filled one and the only
`lg`; play is `outline` so it stays findable beside the tempo steppers without
competing. Size and fill are separate props on `rz-icon-button` for exactly this
reason.

## Panels

Settings, About and the alankar browser are mutually exclusive and Escape
closes whichever is open. This is one page state
(`panel: 'settings' | 'about' | 'browse' | null`), not three booleans that can
disagree.

Settings and About drop down beneath the header. The browser is an **overlay**
instead, and is only in the tree while it is open — it is the one thing that
claims the viewport, and an embedded host must not have to live with that the
rest of the time.

## The rail shows everything

There is no reveal toggle and no masking: every dealt sequence is listed, and
`rz-rail-item` has no `masked` state to fall back to. A stored preferences
object may still carry `reveal`; nothing reads it and validation drops it.

## The alankar browser

`rz-alankar-browser` shows all 53 at once, transposed live into one thaat, and
is reached from **Browse all** above the sequence rail (or `a`). It is a
**reference, not navigation**: there is deliberately no "practise this one"
control: an alankar in the list is usually not in today's deal at all, and the
rail beside it already jumps to the ones that are.

`browseThaat` is page state like everything else, seeded from the thaat being
practised each time the list is *opened* — seeding it on every render would
undo the picker the moment it was used.
