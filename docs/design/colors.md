# Colours

The palette is the LWCG (Learn with Chordial Guy) one. `src/styles/tokens.css`
is the source of truth; `Design/Colors` in Storybook renders it.

| Token | Value | Used for |
| --- | --- | --- |
| `--color-primary` | Bright Teal `#008080` | Actions; the komal rule, the teevra rule, and the half-way beat |
| `--color-accent` | Warm Coral `#ff6f61` | Sam — and nothing else, so the top of the cycle is unambiguous |
| `--color-heading` | Navy `#003049` | Headings, and the swara glyph itself |
| `--color-text` | Slate `#2e2e2e` | Body text |
| `--color-text-muted` | `#6b7280` | Secondary text; punctuation inside notation |
| `--color-bg` | Sand `#f4f1de` | The app ground |
| `--color-surface` | `#ffffff` | Header, cards, transport bar, rail |
| `--color-surface-muted` | `#f9fafb` | The thaat-scale strip on the alankar card |
| `--color-border` | `#e5e7eb` | Rules, and unlit beat dots |

## Two rules

**Accent is reserved for sam.** The cycle's two marked beats have to read as
different things at a glance; if coral appears elsewhere in the transport that
stops working.

**No raw hex in a component.** Every colour comes through a token, which is
what lets a host restyle the whole app from its own `:root` — see
[design-system.md](design-system.md).
