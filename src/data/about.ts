/* GENERATED FILE — do not edit.
   Derived from README.md by scripts/build-about.js; re-run that after
   editing the README sections it draws from. CI checks it is in sync. */

export interface AboutSection {
  title: string;
  /** Build-time HTML from this repo's own README — see rz-about-sheet. */
  html: string;
}

export const ABOUT_SECTIONS: AboutSection[] = [
  {
    "title": "Riyāz",
    "html": "<p>A metronome-driven alankar drill for Hindustani vocal riyaz, built on the <strong>LWCG design system</strong>. Each session deals five alankars at random and two thaats — Bilawal always, plus one drawn at random from the thaats you have enabled — crosses them into ten sequences, and shuffles the order. The first sequence is always Bilawal; after that the order is a surprise. The metronome runs <strong>2 cycles of 8 beats</strong> per sequence, then moves on by itself.</p>"
  },
  {
    "title": "Using it",
    "html": "<div class=\"table-scroll\"><table class=\"data-table\"><tbody><tr><td><code class=\"code-inline\">space</code></td><td>start / stop the metronome</td></tr><tr><td><code class=\"code-inline\">←</code> <code class=\"code-inline\">→</code></td><td>previous / next alankar (restarts the cycle at sam)</td></tr><tr><td><code class=\"code-inline\">n</code></td><td>new session</td></tr><tr><td><code class=\"code-inline\">r</code></td><td>reveal the upcoming sequences</td></tr><tr><td><code class=\"code-inline\">u</code></td><td>unlimited mode</td></tr><tr><td><code class=\"code-inline\">esc</code></td><td>close settings or about</td></tr></tbody></table></div>\n<p>The transport has two halves. On the left is <strong>which alankar</strong> — previous, the big <strong>Next</strong>, and the unlimited toggle. On the right is <strong>the metronome</strong> — play, then tempo. Nothing moves on by itself: the alankar loops until you press Next, which is why Next is the one filled control and play is small beside the tempo steppers.</p>\n<p>Upcoming sequences in the sidebar show <code class=\"code-inline\">—</code> to keep the surprise; press <code class=\"code-inline\">r</code> or tick <strong>Settings → reveal</strong> to see them. Click any row to jump to it.</p>\n<p><strong>Settings</strong> and <strong>About</strong> open from the header and drop down beneath it; close either with its Close button, the header button again, or <code class=\"code-inline\">esc</code>.</p>"
  },
  {
    "title": "The cycle",
    "html": "<p>The current alankar <strong>loops continuously</strong> — one unbroken eight, from sam, until you move on. There is no count-in and no cycle counter: you are drilling one thing, and anything between the passes would interrupt exactly what the loop is for.</p>\n<p>Eight beats are heard as <strong>4 + 4</strong>, so two beats are marked and they sound different from each other, not just louder:</p>\n<div class=\"table-scroll\"><table class=\"data-table\"><thead><tr><th></th><th>Beat</th><th>Sound</th><th>Dot</th></tr></thead><tbody><tr><td><strong>Sam</strong></td><td>1</td><td>bright ringing triangle, 1180 Hz</td><td>large, <code class=\"code-inline\">accent</code></td></tr><tr><td><strong>Divider</strong></td><td>5</td><td>low hollow sine, 520 Hz</td><td>large, <code class=\"code-inline\">primary</code></td></tr><tr><td>Matra</td><td>others</td><td>dry square tick, 720 Hz</td><td>small</td></tr></tbody></table></div>\n<p>The cycle is fixed at eight beats and is not a setting; the divider is simply the half-way beat. A thin rule sits between the halves in the beat row.</p>"
  },
  {
    "title": "Moving on",
    "html": "<p><strong>Next</strong> is the only thing that changes the alankar, and pressing it on the last of the ten finishes the session — with nothing advancing on its own, that is the one remaining moment that means \"done\".</p>\n<p><strong>Unlimited</strong> ∞ — instead of the day's ten, keep drawing: every Next deals a fresh pairing from *all* 53 alankars and *all* ten thaats, ignoring both the day's session and the thaat pool. It never ends and never reports a finished session. Turning it off returns you to the day's session exactly where you left it — the stream never overwrites it.</p>"
  },
  {
    "title": "Thaats",
    "html": "<p>Bilawal is compulsory and always the first sequence. <strong>Settings → thaats in the pool</strong> ticks the other nine on and off; the randomiser only ever draws the paired thaat from the ticked ones. The last ticked thaat cannot be unticked — the pairing needs somewhere to go.</p>\n<p>Tempo, the thaat pool, reveal and unlimited persist in <code class=\"code-inline\">localStorage</code> under the key <code class=\"code-inline\">riyaz</code>.</p>\n<p><strong>The day's session is kept until midnight.</strong> Refreshing resumes the same ten sequences at the same position rather than re-rolling them, so a reload mid-riyaz costs nothing. Tomorrow deals new material, and <strong>New session</strong> overrides it whenever you want a different set today. It is stored under <code class=\"code-inline\">riyaz:session</code> against a local calendar date, so \"midnight\" means yours.</p>"
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
