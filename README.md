# Riyāz — alankar practice

**[Open the app →](https://ishumadan91.github.io/riyaz-assistant/)**

A metronome-driven alankar drill for Hindustani vocal riyaz, built on the
**LWCG design system**. Each session deals five alankars at random and two
thaats — Bilawal always, plus one drawn at random from the thaats you have
enabled — crosses them into ten sequences, and shuffles the order. The first
sequence is always Bilawal; after that the order is a surprise. The metronome
runs **2 cycles of 8 beats** per sequence, then moves on by itself.

## Running it

It runs at **[ishumadan91.github.io/riyaz-assistant](https://ishumadan91.github.io/riyaz-assistant/)**.

To run it locally, open `index.html` — double-click it, no build step and no
server. Plain scripts, no modules, so `file://` is fine.

## Using it

| | |
|---|---|
| `space` | play / pause |
| `←` `→` | previous / next sequence (restarts the cycle at sam) |
| `n` | new session |
| `r` | reveal the upcoming sequences |
| `esc` | close settings |

Upcoming sequences in the sidebar show `—` to keep the surprise; press `r` or
tick **Settings → reveal** to see them. Click any row to jump to it.

**Settings** opens from the header and drops down beneath it; close it with the
Close button, the header button again, or `esc`.

## The cycle

Eight beats are heard as **4 + 4**, so two beats are marked and they sound
different from each other, not just louder:

| | Beat | Sound | Dot |
|---|---|---|---|
| **Sam** | 1 | bright ringing triangle, 1180 Hz | large, `accent` |
| **Divider** | 5 | low hollow sine, 520 Hz | large, `primary` |
| Matra | others | dry square tick, 720 Hz | small |

The cycle is fixed at eight beats and is not a setting; the divider is simply
the half-way beat. A thin rule sits between the halves in the beat row.

## Thaats

Bilawal is compulsory and always the first sequence. **Settings → thaats in the
pool** ticks the other nine on and off; the randomiser only ever draws the
paired thaat from the ticked ones. The last ticked thaat cannot be unticked —
the pairing needs somewhere to go.

Tempo, the thaat pool, cycles per alankar and reveal all persist in
`localStorage` under the key `riyaz`.

## Design system

The UI is built from the **LWCG (Learn with Chordial Guy)** design system —
Django + Tailwind CSS v4. `vendor/lwcg/styles.css` is copied verbatim from that
system's design bundle; re-copy it when the system changes rather than editing
it here.

Components used: `card` `card-title-row` `card-title` `card-lead` `card-badges`
`badge` `btn` (`primary` `outline` `secondary` `small` `link`) `two-column-layout`
`tree-nav` `steps` `note-line` `field-label` `form-group` `input-field`
`form-row-2` `form-hint` `choice-group` `choice-item` `empty-state`.

The step indicator (`steps` / `steps__dot` / `is-current` / `is-done`) is reused
as the beat row — sam is the one place that takes `accent`.

### Two rules when editing the styling

1. **`styles.css` is unlayered; the whole design system sits inside Tailwind's
   `@layer`.** Unlayered CSS wins over *every* layered rule no matter the
   specificity, so a stray `color` or `background` in this file silently kills a
   component's own states. (`.riyaz-slot` setting `color`/`background` is exactly
   what stopped `.tree-nav__item.is-active` from ever showing.) Declare only
   properties the system does not own, and scope overrides under a `riyaz-*`
   ancestor.
2. **`vendor/lwcg/styles.css` is a *compiled* Tailwind build**, so it contains
   only the utilities LWCG itself uses — `grid-cols-2`, for instance, is not in
   it. Check before using one:

   ```
   grep -o '\.your-class[,{]' vendor/lwcg/styles.css
   ```

Everything the system has no vocabulary for — the app shell, swara notation,
the beat row's sam accent — lives in `styles.css` and uses LWCG tokens only
(`--color-primary`, `--color-accent`, …). There are no raw hex colours in it.

## Notation

Data is ASCII (`S R G m P D N`, `S.` taar, `.N` mandra) and renders in
Bhatkhande style: komal underlined, teevra madhyam overlined, upper octave
dotted above, lower octave dotted below. Each space-separated group renders as
one nowrap run, so a phrase never breaks mid-group.

## Files

```
index.html          markup, built from LWCG components
styles.css          the thin app layer (shell, notation, beat row)
vendor/lwcg/        the design system, copied verbatim — do not edit
src/alankars.js     the 53 alankars, from Notion, all in Bilawal
src/thaats.js       the ten thaats + Bilawal→thaat transposition
src/notation.js     ASCII notation → marked swaras
src/audio.js        metronome — lookahead-scheduled, three strokes
src/app.js          session generation, sequencing, UI wiring
```

## Data

`src/alankars.js` is transcribed from the Notion page **Alankars**
(_Learnings / Ragas & songs_) — all 53, across its 9 groups. They are stored in
Bilawal only; every other thaat is derived at render time by swapping the five
variable swaras, so adding an alankar means adding one Bilawal entry.

## Licence

[MIT](LICENSE) © Ishu Madan.

`vendor/lwcg/styles.css` is a compiled Tailwind CSS v4 build of the Learn with
Chordial Guy design system; Tailwind CSS is MIT licensed, © Tailwind Labs Inc.

The alankars themselves are traditional Hindustani practice material and carry
no claim of ownership — only this transcription and the app around it are
covered by the licence above.
