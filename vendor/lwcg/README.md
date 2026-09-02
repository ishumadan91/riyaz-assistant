# LWCG design system — vendored

`styles.css` is copied verbatim from the Learn with Chordial Guy design bundle
(Django + Tailwind CSS v4). Do not edit it here — re-copy it when the design
system changes.

It is a *compiled* Tailwind build, so it contains only the utilities LWCG itself
uses. Before reaching for a utility class, check it exists:

    grep -o '\.your-class[,{]' vendor/lwcg/styles.css

Anything the system has no vocabulary for (swara notation, the beat row) lives
in `../../styles.css` and is built from LWCG tokens only — no new colours.

Tailwind CSS is MIT licensed, © Tailwind Labs Inc.
