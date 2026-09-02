/* GENERATED FILE — do not edit.
   Derived from README.md by scripts/build-about.js; re-run that after
   editing the README sections it draws from. */

var ABOUT_SECTIONS = [
  {
    "title": "Riyāz",
    "html": "<p>A metronome-driven alankar drill for Hindustani vocal riyaz, built on the <strong>LWCG design system</strong>. Each session deals five alankars at random and two thaats — Bilawal always, plus one drawn at random from the thaats you have enabled — crosses them into ten sequences, and shuffles the order. The first sequence is always Bilawal; after that the order is a surprise. The metronome runs <strong>2 cycles of 8 beats</strong> per sequence, then moves on by itself.</p>"
  },
  {
    "title": "Using it",
    "html": "<div class=\"table-scroll\"><table class=\"data-table\"><tbody><tr><td><code class=\"code-inline\">space</code></td><td>play / pause</td></tr><tr><td><code class=\"code-inline\">←</code> <code class=\"code-inline\">→</code></td><td>previous / next sequence (restarts the cycle at sam)</td></tr><tr><td><code class=\"code-inline\">n</code></td><td>new session</td></tr><tr><td><code class=\"code-inline\">r</code></td><td>reveal the upcoming sequences</td></tr><tr><td><code class=\"code-inline\">esc</code></td><td>close settings or about</td></tr></tbody></table></div>\n<p>Upcoming sequences in the sidebar show <code class=\"code-inline\">—</code> to keep the surprise; press <code class=\"code-inline\">r</code> or tick <strong>Settings → reveal</strong> to see them. Click any row to jump to it.</p>\n<p><strong>Settings</strong> and <strong>About</strong> open from the header and drop down beneath it; close either with its Close button, the header button again, or <code class=\"code-inline\">esc</code>.</p>"
  },
  {
    "title": "The cycle",
    "html": "<p>Eight beats are heard as <strong>4 + 4</strong>, so two beats are marked and they sound different from each other, not just louder:</p>\n<div class=\"table-scroll\"><table class=\"data-table\"><thead><tr><th></th><th>Beat</th><th>Sound</th><th>Dot</th></tr></thead><tbody><tr><td><strong>Sam</strong></td><td>1</td><td>bright ringing triangle, 1180 Hz</td><td>large, <code class=\"code-inline\">accent</code></td></tr><tr><td><strong>Divider</strong></td><td>5</td><td>low hollow sine, 520 Hz</td><td>large, <code class=\"code-inline\">primary</code></td></tr><tr><td>Matra</td><td>others</td><td>dry square tick, 720 Hz</td><td>small</td></tr></tbody></table></div>\n<p>The cycle is fixed at eight beats and is not a setting; the divider is simply the half-way beat. A thin rule sits between the halves in the beat row.</p>"
  },
  {
    "title": "Thaats",
    "html": "<p>Bilawal is compulsory and always the first sequence. <strong>Settings → thaats in the pool</strong> ticks the other nine on and off; the randomiser only ever draws the paired thaat from the ticked ones. The last ticked thaat cannot be unticked — the pairing needs somewhere to go.</p>\n<p>Tempo, the thaat pool, cycles per alankar and reveal all persist in <code class=\"code-inline\">localStorage</code> under the key <code class=\"code-inline\">riyaz</code>.</p>"
  },
  {
    "title": "Notation",
    "html": "<p>Data is ASCII (<code class=\"code-inline\">S R G m P D N</code>, <code class=\"code-inline\">S.</code> taar, <code class=\"code-inline\">.N</code> mandra) and renders in Bhatkhande style: komal underlined, teevra madhyam overlined, upper octave dotted above, lower octave dotted below. Each space-separated group renders as one nowrap run, so a phrase never breaks mid-group.</p>"
  },
  {
    "title": "Licence",
    "html": "<p><a href=\"https://github.com/ishumadan91/riyaz-assistant/blob/main/LICENSE\" target=\"_blank\" rel=\"noopener noreferrer\">MIT</a> © Ishu Madan.</p>\n<p><code class=\"code-inline\">vendor/lwcg/styles.css</code> is a compiled Tailwind CSS v4 build of the Learn with Chordial Guy design system; Tailwind CSS is MIT licensed, © Tailwind Labs Inc.</p>\n<p>The alankars themselves are traditional Hindustani practice material and carry no claim of ownership — only this transcription and the app around it are covered by the licence above.</p>"
  }
];
