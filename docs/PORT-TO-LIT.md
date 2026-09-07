# Port Riyāz to the Lit + TypeScript component standard

## What this is

Riyāz today is six classic `<script>` files sharing globals (`state`, `metro`,
`$`, `renderNotation`) against ids in a single `index.html`, styled by a
vendored copy of the LWCG stylesheet. It works, but it cannot be embedded in
another page: the globals collide, the id lookups assume it owns the document,
and the keyboard handler binds to `document`.

This document specifies rewriting it to the same standard as its sibling app
**ear-training**: a **Lit + TypeScript** component library organised by
**Atomic Design**, themed with **design tokens**, bundled with **Vite**,
documented in **Storybook**.

There are two goals, and they are served by the same work:

1. **One coding standard across both apps**, so moving between them costs
   nothing.
2. **Riyāz becomes embeddable** in the LWCG Django app as a custom element,
   with its practice data persisted server-side instead of in `localStorage`.

Do both in one pass. Doing the port first and the embedding contract later
means rewriting the same state layer twice.

---

## Two constraints that shape everything

Read these before designing anything. Both are consequences of the app one day
running inside a host page that also runs ear-training.

### 1. Riyāz gets its own tag prefix: `rz-`

Adopt ear-training's *conventions*, **not** its *namespace*. Custom element
registration is global to the document — `customElements.define('et-button')`
running twice from two bundles throws `NotSupportedError` and takes the host
page down with it.

- Tag `rz-<name>` (kebab-case), class `Rz<Name>` (PascalCase), file
  `rz-<name>.ts`.
- Never define an `et-*` element in this repo.
- Never import from the ear-training repo. If a component is genuinely worth
  sharing, that is a separate future decision about a shared package — not
  something to reach for mid-port.

### 2. The vendored LWCG stylesheet goes away

This is the largest practical change and the easiest to underestimate.

Today the markup leans on LWCG classes — `.btn`, `.card`, `.badge`, `.steps`,
`.choice-item`, `.tree-nav`, `.two-column-layout`, `.empty-state`,
`.input-field`, `.form-group`, `.markdown-body`. **A document stylesheet does
not cross a Shadow DOM boundary**, so once these become Lit components those
classes stop reaching them.

Each component therefore owns its own styles, written **from tokens only**.
Delete `vendor/lwcg/styles.css` and `styles.css` at the end of the port.

The compensating win: **CSS custom properties *do* pierce Shadow DOM.** Keep
using the LWCG token names the app already uses — `--color-primary`,
`--color-accent`, `--color-heading`, `--color-surface`, `--color-border`,
`--color-text-muted`, `--font-mono` — and embedding in LWCG needs no theming
work at all. LWCG's own `:root` supplies them and the components inherit. In
standalone mode `src/styles/tokens.css` supplies the same names.

Consequence: **`tokens.css` must not be bundled into the library build.**
Standalone loads it; the host provides it when embedded.

---

## Target stack

Match ear-training exactly.

### `package.json`

```json
{
  "name": "riyaz-assistant",
  "version": "1.0.0",
  "description": "Alankar practice app — Lit web components, atomic design",
  "type": "module",
  "license": "ISC",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "build:lib": "tsc --noEmit && vite build --mode lib",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "about": "node scripts/build-about.js",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "dependencies": {
    "lit": "^3.2.1"
  },
  "devDependencies": {
    "@storybook/addon-essentials": "^8.4.7",
    "@storybook/web-components": "^8.4.7",
    "@storybook/web-components-vite": "^8.4.7",
    "storybook": "^8.4.7",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

### `tsconfig.json`

Copy verbatim — `experimentalDecorators` and `useDefineForClassFields: false`
are both required by Lit's decorators, and `strict` + `noUnusedLocals` +
`noUnusedParameters` are the standard being adopted.

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2021", "DOM", "DOM.Iterable"],
    "useDefineForClassFields": false,
    "experimentalDecorators": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src", "src/**/*.stories.ts", ".storybook"]
}
```

### `vite.config.ts`

Two modes: the standalone GitHub Pages app, and a single-file library bundle
for embedding.

```ts
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  if (mode === 'lib') {
    return {
      // One self-contained ESM file. Lit is deliberately NOT externalised —
      // the host (a Django app with no bundler) cannot resolve bare imports.
      build: {
        lib: {
          entry: 'src/embed.ts',
          formats: ['es'],
          fileName: () => 'riyaz.js',
        },
        outDir: 'dist-lib',
        emptyOutDir: true,
      },
    };
  }

  return {
    // Served from a project-pages subpath, so built asset URLs carry it.
    base: '/riyaz-assistant/',
    root: 'src',
    publicDir: '../public',
    build: { outDir: '../dist', emptyOutDir: true },
    server: { open: true },
  };
});
```

Move `index.html` to `src/index.html` and `favicon.svg` to `public/favicon.svg`
to match the `root: 'src'` layout.

### `.storybook/main.ts` and `.storybook/preview.ts`

```ts
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|ts)'],
  addons: ['@storybook/addon-essentials'],
  framework: { name: '@storybook/web-components-vite', options: {} },
  core: { disableTelemetry: true },
};
export default config;
```

```ts
// .storybook/preview.ts
import type { Preview } from '@storybook/web-components';
import '../src/styles/tokens.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    backgrounds: {
      default: 'sand',
      values: [
        { name: 'sand', value: '#f4f1de' },
        { name: 'surface', value: '#ffffff' },
        { name: 'navy', value: '#003049' },
      ],
    },
    options: {
      storySort: {
        order: ['Design', ['Colors'], 'Atoms', 'Molecules', 'Organisms', 'Templates', 'Pages'],
      },
    },
  },
};
export default preview;
```

---

## Target file layout

```
src/
  styles/       tokens.css (source of truth), global.css, colors.stories.ts
  data/         thaats.ts      — THAATS, transpose(), thaatScale()
                alankars.ts    — ALANKAR_GROUPS, ALANKARS, the av() builder
                notation.ts    — parseNotation() → tokens (pure, no DOM)
                about.ts       — GENERATED from README.md
                preferences.ts — settings + the storage adapter
                session.ts     — newSession(), shuffle(), pick()
  audio/        metronome.ts   — lookahead-scheduled Web Audio metronome
  components/
    atoms/      rz-button, rz-badge, rz-card, rz-swara, rz-checkbox,
                rz-number-field, rz-field-label
    molecules/  rz-notation-line, rz-beat-row, rz-tempo-control,
                rz-rail-item, rz-thaat-pool, rz-alankar-part
    organisms/  rz-app-header, rz-settings-panel, rz-about-sheet,
                rz-sequence-rail, rz-alankar-card, rz-transport-bar,
                rz-session-complete
    templates/  rz-practice-template   (layout, no state)
    pages/      rz-practice-page       (owns state, wires events)
  main.ts       standalone entry (imports the page, enables global keys)
  embed.ts      library entry (imports the page, exports types only)
  index.html    Vite root document
docs/design/    colors.md, design-system.md
```

---

## Conventions

These are the rules to follow for every component. They are the ear-training
rules with the prefix changed.

- Tag `rz-<name>`; class `Rz<Name>`; files `rz-<name>.ts` +
  co-located `rz-<name>.stories.ts`.
- **Tokens only** — no raw hex, no hard-coded colour. Pull from `tokens.css`
  (`var(--color-*)`, `var(--space-*)`, `var(--radius-*)`, `var(--font-*)`).
- Data flows **down** via reactive `@property()`. Behaviour flows **up** via
  `CustomEvent` dispatched with `{ bubbles: true, composed: true }` (composed
  is what lets it cross the Shadow DOM boundary). Name events `rz-<something>`.
- **Pages own state. Templates and organisms are presentational.** An organism
  that reaches for `localStorage` or the metronome is in the wrong layer.
- Import child components via side-effect imports of their `.js` path
  (`import '../../atoms/button/rz-button.js';`) — the `.js` extension is
  required by `moduleResolution: bundler`.
- Add the `HTMLElementTagNameMap` declaration at the bottom of every component.
- Put a component in the **lowest atomic layer that fits** and compose upward.
- Every component gets a `*.stories.ts` covering its meaningful states.

### Component template

```ts
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * rz-<name> — <one-line purpose>.
 *
 * @prop  {Type} <prop> - <description>
 * @fires rz-<event> - CustomEvent<<detail>> when <trigger>
 */
@customElement('rz-<name>')
export class Rz<Name> extends LitElement {
  static styles = css`
    :host { display: block; }
    /* tokens only */
  `;

  @property({ type: String }) value = '';

  render() {
    return html``;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-<name>': Rz<Name>;
  }
}
```

### Story template

```ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './rz-<name>.js';

const meta: Meta = {
  title: '<Layer>/<Human Name>',
  component: 'rz-<name>',
  tags: ['autodocs'],
  argTypes: {},
  args: {},
  render: (args) => html`<rz-<name> .value=${args.value}></rz-<name>>`,
};
export default meta;

type Story = StoryObj;
export const Default: Story = {};
```

---

## Component inventory

Derived from the current `index.html`. Build bottom-up.

| Current markup | Becomes | Layer | Notes |
| --- | --- | --- | --- |
| `.btn` (7 uses) | `rz-button` | atom | variants `primary` / `secondary` / `outline` / `link`, sizes `sm` / `md` |
| `.badge` | `rz-badge` | atom | tones `primary` / `secondary` |
| `.card` + `.card-title-row` | `rz-card` | atom | slots: `title`, `badges`, default body |
| `.sw` span from `swaraSpan()` | `rz-swara` | atom | one glyph + its marks — see Notation below |
| `.choice-item` | `rz-checkbox` | atom | fires `rz-checkbox-change` |
| `#bpm`, `#cpi` `.input-field` | `rz-number-field` | atom | clamps to `min`/`max`, fires `rz-number-change` |
| `.field-label` | `rz-field-label` | atom | |
| a `.riyaz-line` | `rz-notation-line` | molecule | renders parsed tokens into `rz-swara` |
| `#beatDots` `.steps` | `rz-beat-row` | molecule | props `beats`, `current`, `midIndex` |
| Tempo − / input / + cluster | `rz-tempo-control` | molecule | fires `rz-tempo-change` |
| a `.riyaz-slot` in `#rail` | `rz-rail-item` | molecule | props `n`, `label`, `active`, `done`, `hidden` |
| `#thaatPool` grid | `rz-thaat-pool` | molecule | enforces the never-empty rule locally, fires `rz-thaat-pool-change` |
| a `.riyaz-part` | `rz-alankar-part` | molecule | label + its lines, `centred` and `dense` flags |
| `.riyaz-header` | `rz-app-header` | organism | title, session thaat chips, three buttons |
| `#drawer` | `rz-settings-panel` | organism | |
| `#about` | `rz-about-sheet` | organism | |
| `#rail` `<nav>` | `rz-sequence-rail` | organism | fires `rz-goto` |
| `#stageInner` card | `rz-alankar-card` | organism | |
| `.riyaz-transport` | `rz-transport-bar` | organism | fires `rz-play-toggle`, `rz-prev`, `rz-next`, `rz-tempo-change` |
| `#done` `.empty-state` | `rz-session-complete` | organism | fires `rz-restart` |
| `.riyaz-shell` + `.riyaz-main` | `rz-practice-template` | template | layout only, no state |
| everything in `app.js` | `rz-practice-page` | page | owns state, drives the metronome |

---

## The data layer

Port `thaats.js` and `alankars.js` to TypeScript nearly verbatim — they are
already pure data with pure functions. Add types (`Thaat`, `Alankar`,
`AlankarPart`) and `export` them. Nothing else changes.

### `notation.ts` — the one real redesign

`renderNotation()` currently returns an **HTML string** that gets `innerHTML`'d.
Lit templates do not take HTML strings, and building one would defeat the point.
Split it in two:

```ts
export type Saptak = 'mandra' | 'madhya' | 'taar';

export type NotationToken =
  | { kind: 'swara'; letter: string; komal: boolean; teevra: boolean; saptak: Saptak }
  | { kind: 'punct'; text: string };

/** One space-separated run, rendered `white-space: nowrap` so phrases
    never break mid-group. */
export interface NotationGroup {
  tokens: NotationToken[];
}

/** Parse an ASCII notation line into groups of tokens. Pure — no DOM. */
export function parseNotation(text: string): NotationGroup[];
```

`rz-notation-line` takes `.groups` and renders each token as `<rz-swara>` or a
muted punctuation span.

Three things in the current parser are load-bearing and must survive:

- **Case carries the accidental.** After `transpose()`, lowercase `r g d n` mean
  komal and `M` means teevra — while lowercase `m` is *shuddha* madhyam and is
  neither. The letter is uppercased **for display only**; the case of the source
  character is the data. Losing this makes every non-Bilawal thaat render wrong.
- **A dot binds to the swara it touches.** `S.` is taar (dot after), `.N` is
  mandra (dot before). The current loop consumes a trailing dot before it can be
  mistaken for a leading one; keep that ordering.
- **Space-separated grouping is deliberate.** Each swara is an inline-block, so
  without the nowrap group a line can break between any two of them and split a
  phrase. Preserve the grouping in the token model, not just in CSS.

### `rz-swara`

Keep Riyāz's existing visual treatment — komal is an underline in
`var(--color-primary)`, teevra an overline, taar a dot above, mandra a dot below
— but restructure it as a component with a property API:

```ts
@property({ type: String })  letter = '';
@property({ type: Boolean }) komal = false;
@property({ type: Boolean }) teevra = false;
@property({ type: String })  saptak: Saptak = 'madhya';
```

**Marks are drawn in CSS, never with combining characters.** A combining low
line under "N" lands wherever the font decides, and a komal swara in the mandra
saptak needs a line *and* a dot below the same letter, which combining marks
collide on. Tracking comes from `margin`, not `letter-spacing`, so each swara's
box is exactly its glyph and the rules hug the letter.

### `about.ts`

`scripts/build-about.js` stays — the README-derived About panel is a good
pattern and CI already guards it. Three changes:

1. Emit `src/data/about.ts` instead of `src/about.js`.
2. Emit `export const ABOUT_SECTIONS: AboutSection[] = …` instead of a
   `var` global. Keep the "GENERATED FILE — do not edit" banner.
3. Update the path in `.github/workflows/about-sync.yml`.

The section bodies are HTML strings, so `rz-about-sheet` renders them with
`unsafeHTML` from `lit/directives/unsafe-html.js`. That is safe **only**
because the content is generated at build time from this repo's own README —
add a comment saying so, or the next reader will reasonably flag it.

---

## The metronome

`src/audio/metronome.ts` is a near-verbatim port of `audio.js` into a class.
Do not "simplify" the scheduler.

What is load-bearing:

- **Lookahead scheduling on the audio clock.** Clicks are scheduled
  `LOOKAHEAD = 0.12s` ahead by a `setInterval` poll, and the *visual* beat is
  released separately by a `requestAnimationFrame` drain so the dot lights
  exactly when the click is heard. Driving the UI straight from `setInterval`
  reintroduces audible jitter — that split is the whole design.
- **`resync()` restarts the beat phase from sam**, used when skipping to another
  sequence. Without it the beat grid drifts out of phase with the displayed
  sequence.
- **The three strokes differ in timbre, not just loudness** — `sam` a bright
  ringing triangle, `mid` a low hollow sine, `beat` a dry square tick. `mid`
  must stay unmistakably not-sam.
- **`midBeatIndex()` returns -1 for odd or short cycles.** An 8-beat cycle is
  heard as 4 + 4; a 5-beat cycle has no half-way beat and must render no divider.

Fix while porting: `AudioHub.ctx()` calls `ctx.resume()` without catching.
**Safari rejects `resume()` when it judges the call non-gesture-initiated**, and
an unhandled rejection there can abort scheduling. Swallow the rejection:

```ts
if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
```

Also return silently when Web Audio is unavailable, so a non-browser DOM
(Storybook's docs renderer, any future test) doesn't throw.

Browsers block audio until a user gesture, so the first sound must originate
inside a click handler — keep construction lazy.

---

## The embedding contract

This is what makes the port worth doing now rather than later. The LWCG Django
app will mount `<rz-practice-page>` directly and own the data.

### Storage adapter

`preferences.ts` currently talks to `localStorage` directly. Invert it:

```ts
export interface RiyazStorage {
  get(key: string): unknown | null;
  set(key: string, value: unknown): void;
}

/** Default adapter. Every access is wrapped — Safari in private mode throws
    rather than returning null. Losing persistence is fine; taking the app
    down with it is not. */
export const localStorageAdapter: RiyazStorage = { /* … */ };
```

`rz-practice-page` exposes it as a property, defaulting to local storage:

```ts
@property({ attribute: false }) storage: RiyazStorage = localStorageAdapter;
```

**The app must stay standalone-runnable.** With no adapter injected it behaves
exactly as it does today. That keeps the GitHub Pages build alive and keeps this
repo independently developable.

The interface is deliberately **synchronous**, mirroring `localStorage`, because
the page reads preferences in `connectedCallback`. A server-backed adapter
therefore has to hydrate its cache *before* assigning `.storage` and write
through asynchronously. Note that requirement in the JSDoc.

**Validate everything on read.** Stored values are user-editable and outlive
schema changes, so each field falls back to its default if unrecognised — a
stale `thaat` key must resolve to a real thaat, and the enabled pool must never
validate to empty.

### Events for streak tracking

The host computes streaks; this app only reports what happened. That split means
adding a new metric later touches nothing in this repo.

Emit from `rz-practice-page`, all `bubbles: true, composed: true`:

| Event | Detail | Fires when |
| --- | --- | --- |
| `rz-session-start` | `{ thaats: string[]; alankars: number[] }` | a new session is dealt |
| `rz-sequence-complete` | `{ index: number; alankar: number; thaat: string; bpm: number; cycles: number }` | the metronome advances past a sequence |
| `rz-session-complete` | `{ sequences: number; bpm: number; thaats: string[]; durationMs: number }` | the tenth sequence finishes |

Only count a sequence complete when the **metronome** advanced past it — not
when the user skipped with Next. A skip is not practice.

### Keyboard handling must not bind to `document`

`app.js` binds `keydown` on `document`. Inside LWCG that would hijack space and
arrow keys for the whole host page.

Bind on the component host instead, and gate document-level binding behind an
explicit opt-in that only the standalone entry sets:

```ts
/** Standalone only. When embedded the host owns document-level keys. */
@property({ type: Boolean }) globalKeys = false;
```

`main.ts` sets `globalKeys` and focuses the page; `embed.ts` does not.

### The shell must not claim the viewport

`.riyaz-shell` is `height: 100dvh`. A component that sizes itself to the
viewport cannot sit inside a host layout.

Follow ear-training's split: `rz-practice-template` fills its host
(`height: 100%`), and the `100dvh` frame lives in `global.css` targeting the
page element — a file only the standalone build loads.

```css
/* global.css — standalone only */
rz-practice-page {
  display: block;
  height: 100dvh;
}
```

### `embed.ts`

```ts
// Library entry. Registers rz-practice-page and re-exports the types a host
// needs to type its adapter and event listeners. No side effects beyond
// element registration — no tokens, no global.css.
import './components/pages/practice-page/rz-practice-page.js';

export type { RiyazStorage } from './data/preferences.js';
export type { Thaat } from './data/thaats.js';
```

---

## Gotchas

Things that will bite if you are not deliberate about them.

- **`innerHTML` is gone.** Every `$('x').innerHTML = …` in `app.js` becomes a
  returned Lit template. The rail, the thaat pool, the beat dots, the parts and
  the notation are all built this way today.
- **Imperative show/hide is gone.** `$('done').hidden = true` becomes a reactive
  `@state()` the template branches on with `nothing`.
- **`document.getElementById` does not cross Shadow DOM.** If you find yourself
  needing it, the state is in the wrong layer — lift it to the page.
- **Storybook renders components without `tokens.css` unless `preview.ts`
  imports it.** The config above does; don't drop it or every story renders
  unstyled.
- **`useDefineForClassFields` must be `false`.** With it true, class field
  initialisers clobber Lit's accessors and every `@property` silently stops
  reacting.
- **Do not externalise `lit` in the lib build.** The host has no bundler and
  cannot resolve a bare `lit` import.
- **One panel at a time.** Settings and About are mutually exclusive today, and
  Escape closes whichever is open. Keep that as page state (`panel: 'settings' |
  'about' | null`) rather than two independent booleans, which is what made the
  original need a `PANELS` table.
- **The thaat pool can never empty.** The pairing needs somewhere to draw from.
  The current code refuses the last untick and shows an error; keep that
  behaviour in `rz-thaat-pool`.
- **The first sequence is always Bilawal.** `newSession()` deliberately swaps a
  Bilawal item into position 0 after shuffling. The rest stay a surprise.

---

## Migration order

Work bottom-up on a branch. Each phase should typecheck before the next starts.

1. **Tooling.** `package.json`, `tsconfig.json`, `vite.config.ts`,
   `.storybook/`. Move `index.html` → `src/index.html`, `favicon.svg` →
   `public/`. `npm install`. Nothing renders yet.
2. **Tokens.** `src/styles/tokens.css` with the LWCG token names the app already
   uses, plus the spacing / radius / shadow / type scales. Add
   `colors.stories.ts` so the palette is visible in Storybook.
3. **Data layer.** `thaats.ts`, `alankars.ts`, `notation.ts`, `session.ts`,
   `preferences.ts` (with the adapter). All pure, all typed, no DOM. Update
   `scripts/build-about.js` to emit `src/data/about.ts`.
4. **Audio.** `metronome.ts`, with the `resume()` fix.
5. **Atoms**, then **molecules**, each with a story. `rz-swara` and
   `rz-notation-line` first — they are the highest-risk pair and everything
   visual depends on them looking right.
6. **Organisms**, then `rz-practice-template`.
7. **`rz-practice-page`** — port `app.js`'s state and wiring last, now that
   everything it drives exists.
8. **Entries.** `main.ts` (standalone, `globalKeys`), `embed.ts` (library).
9. **Delete** `styles.css`, `vendor/lwcg/`, and the six old `src/*.js` files.
10. **CI.** `pages.yml` must now build rather than serve the repo root:
    checkout → `setup-node@v4` → `npm ci` → `npm run build` → upload `dist`.
    Update the `about-sync.yml` path.
11. **`CLAUDE.md`** — rewrite it in ear-training's shape: Commands table,
    Architecture tree, Conventions, then a section per load-bearing domain
    decision (notation, thaats, the cycle, the metronome, preferences,
    embedding). Fold the "why" notes from this document into it, since this
    document is a one-off and `CLAUDE.md` is what future sessions read.

## Verification

There is no test runner in either repo, so the gates are:

- `npm run typecheck` — clean, with `strict` and both `noUnused*` on.
- `npm run storybook` — every component renders in its meaningful states.
- `npm run dev` — full session runs: play, the beat row tracks the metronome,
  sequences advance on the cycle, prev/next/skip resync from sam, tempo and
  cycles-per-alankar persist across reload, the thaat pool refuses to empty,
  reveal toggles the rail, Escape closes panels, the tenth sequence finishes.
- `npm run build:lib` — produces a single `dist-lib/riyaz.js` with no bare
  imports left in it (`grep -n "from \"lit\"" dist-lib/riyaz.js` finds nothing).
