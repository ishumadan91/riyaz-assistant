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
    "html": "<p>A metronome-driven alankar drill for Hindustani vocal riyaz, built on the <strong>LWCG design system</strong>. Each session deals five alankars at random and two thaats — Bilawal always, plus one drawn at random from the thaats you have enabled — and crosses them into ten sequences. The first sequence is always Bilawal, and <strong>Settings → sequence order</strong> decides how the rest are laid out. The metronome loops the current alankar in <strong>cycles of 8 beats</strong> until you press Next; nothing moves on by itself.</p>"
  },
  {
    "title": "Using it",
    "html": "<div class=\"table-scroll\"><table class=\"data-table\"><tbody><tr><td><code class=\"code-inline\">space</code></td><td>start / stop the metronome</td></tr><tr><td><code class=\"code-inline\">←</code> <code class=\"code-inline\">→</code></td><td>previous / next alankar (restarts the cycle at sam)</td></tr><tr><td><code class=\"code-inline\">n</code></td><td>new session</td></tr><tr><td><code class=\"code-inline\">u</code></td><td>unlimited mode</td></tr><tr><td><code class=\"code-inline\">a</code></td><td>browse every alankar</td></tr><tr><td><code class=\"code-inline\">esc</code></td><td>close settings, about, or the alankar list</td></tr></tbody></table></div>\n<p>The transport has two halves. On the left is <strong>which alankar</strong> — previous, the big <strong>Next</strong>, and the unlimited toggle. On the right is <strong>the metronome</strong> — play, then tempo. Nothing moves on by itself: the alankar loops until you press Next, which is why Next is the one filled control and play is small beside the tempo steppers.</p>\n<p>The sidebar lists every sequence in the session — done, current and upcoming. Click any row to jump to it.</p>\n<p><strong>Browse all</strong> — above the sequence list — opens every alankar at once in one scrolling modal, grouped the way the book groups them, with a thaat picker at the top that transposes all 53 on the spot. It opens on whichever thaat you are practising. It is a reference, not a way to get around: there is no \"practise this one\" button, because the list would otherwise give away which five the day dealt.</p>\n<p><strong>Settings</strong> and <strong>About</strong> open from the header and drop down beneath it; close either with its Close button, the header button again, or <code class=\"code-inline\">esc</code>.</p>"
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
    "title": "Sequence order",
    "html": "<p>Five alankars crossed with two thaats makes ten sequences, and <strong>Settings → sequence order</strong> decides how they are laid out:</p>\n<div class=\"table-scroll\"><table class=\"data-table\"><tbody><tr><td><strong>Shuffled</strong></td><td>the order they were randomised into — the default</td></tr><tr><td><strong>By thaat</strong></td><td>all five in Bilawal, then the same five in the paired thaat</td></tr><tr><td><strong>Paired</strong></td><td>each alankar in Bilawal, then straight into its counterpart</td></tr></tbody></table></div>\n<p>Bilawal is sequence 1 under all three. Changing it re-lays the session you are already in, straight away — it is the same five alankars and the same two thaats rearranged, not new material, and you stay on the sequence you were practising.</p>"
  },
  {
    "title": "Thaats",
    "html": "<p>Bilawal is compulsory and always the first sequence. <strong>Settings → thaats in the pool</strong> ticks the other nine on and off; the randomiser only ever draws the paired thaat from the ticked ones. The last ticked thaat cannot be unticked — the pairing needs somewhere to go.</p>\n<p>Tempo, the thaat pool, unlimited and the sequence order persist in <code class=\"code-inline\">localStorage</code> under the key <code class=\"code-inline\">riyaz</code>.</p>\n<p><strong>The day's session is kept until midnight.</strong> Refreshing resumes the same ten sequences at the same position rather than re-rolling them, so a reload mid-riyaz costs nothing. Tomorrow deals new material, and <strong>New session</strong> overrides it whenever you want a different set today. It is stored under <code class=\"code-inline\">riyaz:session</code> against a local calendar date, so \"midnight\" means yours.</p>"
  },
  {
    "title": "Notation",
    "html": "<p>Data is ASCII (<code class=\"code-inline\">S R G m P D N</code>, <code class=\"code-inline\">S.</code> taar, <code class=\"code-inline\">.N</code> mandra) and renders in Bhatkhande style: komal underlined, teevra madhyam overlined, upper octave dotted above, lower octave dotted below. Each space-separated group renders as one nowrap run, so a phrase never breaks mid-group.</p>\n<p>A dot between two swaras is genuinely ambiguous — in <code class=\"code-inline\">S.ND</code> it could be the taar of S or the mandra of N. Unmarked, it always binds <strong>backwards</strong>, which is right nearly every time: <code class=\"code-inline\">S.NDPmGRS</code> is a descent from taar sa. Where it is not, <strong>brackets</strong> say which swara the dot belongs to, and are never rendered:</p>\n<div class=\"table-scroll\"><table class=\"data-table\"><tbody><tr><td><code class=\"code-inline\">.P.D.N</code></td><td>a dot with nothing behind it is unambiguous — all three are mandra</td></tr><tr><td><code class=\"code-inline\">PDNS.</code></td><td>a dot at the end is unambiguous — only the last S is taar</td></tr><tr><td><code class=\"code-inline\">S(.N)(.D)(.P)</code></td><td>sa, then three mandra swaras — bare <code class=\"code-inline\">S.N.D.P</code> would read as three taar ones</td></tr><tr><td><code class=\"code-inline\">(S.)NDP</code></td><td>spells out a taar S the scan would have reached anyway</td></tr></tbody></table></div>\n<p>Brackets never span a space: a space already separates, so there is nothing inside one for them to do.</p>"
  },
  {
    "title": "Licence",
    "html": "<p><a href=\"https://github.com/ishumadan91/riyaz-assistant/blob/main/LICENSE\" target=\"_blank\" rel=\"noopener noreferrer\">MIT</a> © Ishu Madan.</p>\n<p><code class=\"code-inline\">vendor/lwcg/styles.css</code> is a compiled Tailwind CSS v4 build of the Learn with Chordial Guy design system; Tailwind CSS is MIT licensed, © Tailwind Labs Inc.</p>\n<p>The alankars themselves are traditional Hindustani practice material and carry no claim of ownership — only this transcription and the app around it are covered by the licence above.</p>"
  }
];
