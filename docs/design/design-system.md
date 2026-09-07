# Design system

Lit web components, organised by Atomic Design, themed entirely with CSS custom
properties.

## Why tokens rather than a stylesheet

The app used to lean on a vendored copy of LWCG's compiled stylesheet — `.btn`,
`.card`, `.badge`, `.steps`. **A document stylesheet does not cross a Shadow DOM
boundary**, so once the markup became components those classes stopped reaching
it. Every component now owns its styles.

**Custom properties do pierce Shadow DOM.** So the components read LWCG's own
token names, and embedding needs no theming work at all: LWCG's `:root` supplies
them and the components inherit. Standalone, `src/styles/tokens.css` supplies the
same names.

That is why **`tokens.css` must not be bundled into the library build**. The
standalone document loads it; a host provides it. `src/embed.ts` imports nothing
but the page for exactly this reason.

## Layers

| Layer | Owns | Examples |
| --- | --- | --- |
| Atoms | One thing, no domain knowledge | `rz-button`, `rz-badge`, `rz-swara` |
| Molecules | A small composite | `rz-notation-line`, `rz-beat-row`, `rz-thaat-pool` |
| Organisms | A region of the screen | `rz-app-header`, `rz-transport-bar` |
| Templates | Layout, no state | `rz-practice-template` |
| Pages | All state, drives the metronome | `rz-practice-page` |

Put a component in the **lowest layer that fits** and compose upward. An organism
reaching for `localStorage` or the metronome is in the wrong layer.

## Data down, events up

Data flows down through reactive `@property()`. Behaviour flows up through
`CustomEvent` dispatched `{ bubbles: true, composed: true }` — `composed` is what
lets an event cross the Shadow DOM boundary. Events are named `rz-*`.

## The prefix is not decoration

Custom element registration is global to the document. `customElements.define`
running twice for the same tag throws `NotSupportedError` and takes the host page
down. Riyāz uses `rz-`; its sibling app uses `et-`. **Never define an `et-*`
element here, and never import from that repo.**
