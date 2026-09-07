import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { base } from '../../../styles/base.js';
import '../../templates/practice-template/rz-practice-template.js';
import type { Panel } from '../../templates/practice-template/rz-practice-template.js';
import { Metronome, midBeatIndex } from '../../../audio/metronome.js';
import {
  loadPreferences,
  localStorageAdapter,
  savePreferences,
  type Preferences,
  type RepeatMode,
  type RiyazStorage,
} from '../../../data/preferences.js';
import { loadDaySession, saveDaySession } from '../../../data/day-session.js';
import { newSession, randomItem, type SessionItem } from '../../../data/session.js';
import type { Thaat } from '../../../data/thaats.js';

/** The cycle is fixed at eight beats, heard as 4 + 4. Not a setting. */
const BEATS_PER_CYCLE = 8;

/**
 * Beats of breathing space before a sequence starts, cued 3 · 2 · 1.
 *
 * Sequences used to begin on the very next beat after the previous one ended,
 * which left no room to read the new alankar before singing it.
 */
const COUNT_IN_BEATS = 3;

/**
 * rz-practice-page — owns all state and drives the metronome.
 *
 * Standalone it persists to localStorage and, with `globalKeys`, listens for
 * keys on the document. Embedded it does neither by default: the host injects
 * a `storage` adapter and keeps its own keyboard.
 *
 * @prop  {RiyazStorage} storage - defaults to localStorage
 * @prop  {boolean} globalKeys - standalone only; see main.ts
 * @fires rz-session-start
 * @fires rz-sequence-complete
 * @fires rz-session-complete
 */
@customElement('rz-practice-page')
export class RzPracticePage extends LitElement {
  static styles = [
    base,
    css`
    :host {
      display: block;
      height: 100%;
    }
    /* The host is the keyboard target when not using globalKeys, so it must be
       focusable — but never show a focus ring for a whole-app container. */
    :host(:focus) {
      outline: none;
    }
  `,
  ];

  /**
   * Where preferences live.
   *
   * Read on the *first update*, not in `connectedCallback`: when a host page
   * has `<rz-practice-page>` in its own markup, the element upgrades while
   * `riyaz.js` is still being imported, so `connectedCallback` runs before the
   * host's next line can assign this. Lit's first update is scheduled as a
   * microtask, which lands after the host's module body — so assigning
   * `.storage` immediately after the import is enough, and the host also
   * catches the first `rz-session-start`.
   *
   * Assigning it later still works: a change re-reads preferences, and re-deals
   * if the thaat pool differs.
   */
  @property({ attribute: false }) storage: RiyazStorage = localStorageAdapter;

  /**
   * Standalone only. When embedded the host owns document-level keys — binding
   * space and the arrows on `document` would hijack them for the whole page.
   */
  @property({ type: Boolean }) globalKeys = false;

  @state() private items: SessionItem[] = [];
  @state() private thaats: Thaat[] = [];
  @state() private index = 0;
  @state() private finished = false;
  @state() private panel: Panel = null;
  @state() private playing = false;
  @state() private beat = 0;
  @state() private cycle = 0;

  @state() private bpm = 72;
  @state() private cyclesPerItem = 2;
  @state() private reveal = false;
  @state() private enabled: string[] = [];
  @state() private repeat: RepeatMode = 'all';
  @state() private unlimited = false;
  /** Beats left in the count-in; 0 once the cycle is running. */
  @state() private countIn = 0;

  private metro = new Metronome();
  private sessionStartedAt = 0;
  private keyTarget: EventTarget | null = null;
  private onKeyDown = (e: KeyboardEvent) => this.handleKey(e);

  connectedCallback() {
    super.connectedCallback();
    this.metro.beatsPerCycle = BEATS_PER_CYCLE;
    this.metro.onBeat = (n) => this.handleBeat(n);

    // The host must be focusable to receive keys when not bound to document.
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    // Bind one target, not both: with a document listener the event would also
    // bubble out of the host and fire the handler twice.
    this.keyTarget = this.globalKeys ? document : this;
    this.keyTarget.addEventListener('keydown', this.onKeyDown as EventListener);
  }

  firstUpdated() {
    this.applyPreferences(loadPreferences(this.storage));
    this.metro.bpm = this.bpm;
    this.metro.strokeFor = (n) => this.strokeFor(n);

    // A refresh should resume today's session, not re-roll it.
    const restored = this.unlimited ? null : loadDaySession(this.storage);
    if (restored) {
      this.items = restored.items;
      this.thaats = restored.thaats;
      this.index = restored.index;
      this.sessionStartedAt = Date.now();
      this.emit('rz-session-start', {
        thaats: restored.thaats.map((t) => t.key),
        alankars: [...new Set(restored.items.map((i) => i.alankar.n))],
        restored: true,
      });
    } else {
      this.deal();
    }
  }

  updated(changed: Map<string, unknown>) {
    // A host that resolves its adapter asynchronously assigns it after the
    // first update. Re-read, and re-deal only if the pool actually changed —
    // silently replacing a session in progress would be worse than ignoring it.
    if (!changed.has('storage') || changed.get('storage') === undefined) return;
    const before = this.enabled.join(',');
    this.applyPreferences(loadPreferences(this.storage));
    this.metro.bpm = this.bpm;
    if (this.enabled.join(',') !== before) this.deal();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.metro.stop();
    this.keyTarget?.removeEventListener('keydown', this.onKeyDown as EventListener);
    this.keyTarget = null;
  }

  private applyPreferences(p: Preferences) {
    this.bpm = p.bpm;
    this.cyclesPerItem = p.cyclesPerItem;
    this.reveal = p.reveal;
    this.enabled = p.enabled;
    this.repeat = p.repeat;
    this.unlimited = p.unlimited;
  }

  private persist() {
    savePreferences(this.storage, {
      bpm: this.bpm,
      cyclesPerItem: this.cyclesPerItem,
      reveal: this.reveal,
      enabled: this.enabled,
      repeat: this.repeat,
      unlimited: this.unlimited,
    });
  }

  /** The day's deal, so a refresh resumes it. Never in unlimited mode: that
      stream is not the day's session and must not overwrite it. */
  private persistSession() {
    if (this.unlimited) return;
    saveDaySession(this.storage, this.items, this.index);
  }

  private emit<T>(name: string, detail?: T) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  /* ------------------------------------------------------------- session */

  private deal() {
    const session = newSession(this.enabled);
    this.items = session.items;
    this.thaats = session.thaats;
    this.index = 0;
    this.finished = false;
    this.beat = 0;
    this.cycle = 0;
    this.countIn = 0;
    this.sessionStartedAt = Date.now();
    this.persistSession();
    if (this.metro.running) this.metro.resync();
    this.emit('rz-session-start', {
      thaats: session.thaats.map((t) => t.key),
      alankars: [...new Set(session.items.map((i) => i.alankar.n))],
      restored: false,
    });
  }

  /** Start an unlimited stream: one random pairing, extended as you go. */
  private startUnlimited() {
    const first = randomItem();
    this.items = [first];
    this.thaats = [first.thaat];
    this.index = 0;
    this.finished = false;
    this.beat = 0;
    this.cycle = 0;
    this.countIn = 0;
    this.sessionStartedAt = Date.now();
    if (this.metro.running) this.metro.resync();
    this.emit('rz-session-start', {
      thaats: [first.thaat.key],
      alankars: [first.alankar.n],
      unlimited: true,
    });
  }

  private appendRandom() {
    this.items = [...this.items, randomItem()];
  }

  /** The sequence the metronome just finished. Never called for a manual skip. */
  private reportSequenceComplete(index: number) {
    const item = this.items[index];
    if (!item) return;
    this.emit('rz-sequence-complete', {
      index,
      alankar: item.alankar.n,
      thaat: item.thaat.key,
      bpm: this.bpm,
      cycles: this.cyclesPerItem,
    });
  }

  /** Returns false when the session has run out. */
  private advance(): boolean {
    // The metronome got through it, so it counts as practice even on repeat.
    this.reportSequenceComplete(this.index);

    // Repeat-one stays put; the beat maths restarts the count-in on its own.
    if (this.repeat === 'one') return true;

    if (this.unlimited) {
      if (this.index >= this.items.length - 1) this.appendRandom();
      this.index += 1;
      return true;
    }
    if (this.index >= this.items.length - 1) {
      this.finish();
      return false;
    }
    this.index += 1;
    this.persistSession();
    return true;
  }

  private finish() {
    this.stop();
    this.finished = true;
    this.persistSession();
    this.emit('rz-session-complete', {
      sequences: this.items.length,
      bpm: this.bpm,
      thaats: this.thaats.map((t) => t.key),
      durationMs: Date.now() - this.sessionStartedAt,
    });
  }

  private goto(index: number) {
    if (index < 0) return;
    if (index >= this.items.length) {
      // Unlimited keeps drawing; a fixed session simply stops at the end.
      if (!this.unlimited) return;
      this.appendRandom();
    }
    // A skip is not practice: no rz-sequence-complete here.
    this.index = index;
    this.finished = false;
    this.beat = 0;
    this.cycle = 0;
    this.countIn = 0;
    this.persistSession();
    // Restart the phase so the new sequence gets its own count-in from sam.
    this.metro.resync();
  }

  /* --------------------------------------------------------------- beats */

  /**
   * Beats the count-in takes. Repeat-one has none: you are drilling the same
   * alankar over and over, so a 3 · 2 · 1 between every pass would interrupt
   * the very thing repeat is for. It loops continuously instead.
   */
  private get countInBeats(): number {
    return this.repeat === 'one' ? 0 : COUNT_IN_BEATS;
  }

  /** Count-in plus the cycles: one sequence's worth of beats. */
  private get beatsPerSequence(): number {
    return this.countInBeats + BEATS_PER_CYCLE * this.cyclesPerItem;
  }

  /**
   * Scheduled ahead of the beat being heard, so this must be derivable from the
   * beat number alone — never from state that only becomes true on arrival.
   */
  private strokeFor(n: number): 'sam' | 'mid' | 'beat' | 'count' {
    const lead = this.countInBeats;
    const into = n % this.beatsPerSequence;
    if (into < lead) return 'count';
    const pos = (into - lead) % BEATS_PER_CYCLE;
    if (pos === 0) return 'sam';
    return pos === midBeatIndex(BEATS_PER_CYCLE) ? 'mid' : 'beat';
  }

  private handleBeat(n: number) {
    const total = this.beatsPerSequence;
    if (n > 0 && n % total === 0 && !this.advance()) return;

    const lead = this.countInBeats;
    const into = n % total;
    if (into < lead) {
      this.countIn = lead - into; // 3, 2, 1
      this.beat = 0;
      this.cycle = 0;
      return;
    }
    this.countIn = 0;
    const p = into - lead;
    this.beat = p % BEATS_PER_CYCLE;
    this.cycle = Math.floor(p / BEATS_PER_CYCLE);
  }

  /* ----------------------------------------------------------- transport */

  private play() {
    if (this.finished) {
      if (this.unlimited) this.startUnlimited();
      else this.deal();
    }
    this.metro.bpm = this.bpm;
    this.metro.beatsPerCycle = BEATS_PER_CYCLE;
    this.metro.start();
    this.playing = this.metro.running;
  }

  private stop() {
    this.metro.stop();
    this.playing = false;
    this.countIn = 0;
  }

  private togglePlay() {
    if (this.metro.running) this.stop();
    else this.play();
  }

  /* ------------------------------------------------------------ keyboard */

  private handleKey(e: KeyboardEvent) {
    // Shadow DOM retargets `e.target` to the host, so it cannot tell whether a
    // field has focus. composedPath()[0] is the real inner element.
    const target = e.composedPath()[0] as HTMLElement | undefined;
    const typing = !!target && /^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName);

    if (e.key === 'Escape') {
      if (this.panel) this.panel = null;
      return;
    }
    if (typing) return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        this.togglePlay();
        return;
      default:
        break;
    }
    switch (e.key) {
      case 'ArrowRight':
        this.goto(this.index + 1);
        break;
      case 'ArrowLeft':
        this.goto(this.index - 1);
        break;
      case 'n':
      case 'N':
        this.deal();
        break;
      case 'r':
      case 'R':
        this.reveal = !this.reveal;
        this.persist();
        break;
      case 'l':
      case 'L':
        this.toggleRepeat();
        break;
      case 'u':
      case 'U':
        this.toggleUnlimited();
        break;
      default:
        break;
    }
  }

  /* -------------------------------------------------------------- render */

  private toggleRepeat() {
    this.repeat = this.repeat === 'one' ? 'all' : 'one';
    this.persist();
    this.countIn = 0;
    // beatsPerSequence changes with the count-in, so the running phase would
    // otherwise land at an arbitrary point of the new cycle. Restart from sam.
    if (this.metro.running) {
      this.beat = 0;
      this.cycle = 0;
      this.metro.resync();
    }
  }

  /**
   * Unlimited is a mode, not a filter: entering it starts a fresh endless
   * stream and leaving it returns to the day's session, which was never
   * overwritten while the stream was running.
   */
  private toggleUnlimited() {
    this.unlimited = !this.unlimited;
    this.persist();
    if (this.unlimited) {
      this.startUnlimited();
      return;
    }
    const restored = loadDaySession(this.storage);
    if (restored) {
      this.items = restored.items;
      this.thaats = restored.thaats;
      this.index = restored.index;
      this.finished = false;
      this.beat = 0;
      this.cycle = 0;
      this.countIn = 0;
      if (this.metro.running) this.metro.resync();
    } else {
      this.deal();
    }
  }

  private setPanel(next: Panel) {
    // One panel at a time, as a single value rather than two booleans that can
    // disagree with each other.
    this.panel = this.panel === next ? null : next;
  }

  render() {
    // The header chips show the session's pair. An unlimited stream has no
    // pair, so it shows the thaat you are actually on instead of accumulating
    // every one drawn so far.
    const current = this.items[this.index];
    const chips = this.unlimited ? (current ? [current.thaat] : []) : this.thaats;
    return html`
      <rz-practice-template
        .items=${this.items}
        .thaats=${chips}
        index=${this.index}
        ?reveal=${this.reveal}
        ?finished=${this.finished}
        panel=${this.panel ?? ''}
        ?playing=${this.playing}
        beats=${BEATS_PER_CYCLE}
        beat=${this.beat}
        midIndex=${midBeatIndex(BEATS_PER_CYCLE)}
        cycle=${this.cycle}
        cyclesPerItem=${this.cyclesPerItem}
        bpm=${this.bpm}
        countIn=${this.countIn}
        repeat=${this.repeat}
        ?unlimited=${this.unlimited}
        .enabled=${this.enabled}
        @rz-toggle-settings=${() => this.setPanel('settings')}
        @rz-toggle-about=${() => this.setPanel('about')}
        @rz-close-panel=${() => (this.panel = null)}
        @rz-new-session=${() => this.deal()}
        @rz-restart=${() => {
          if (this.unlimited) this.startUnlimited();
          else this.deal();
          this.play();
        }}
        @rz-goto=${(e: CustomEvent<{ index: number }>) => this.goto(e.detail.index)}
        @rz-play-toggle=${() => this.togglePlay()}
        @rz-repeat-toggle=${() => this.toggleRepeat()}
        @rz-unlimited-toggle=${() => this.toggleUnlimited()}
        @rz-prev=${() => this.goto(this.index - 1)}
        @rz-next=${() => this.goto(this.index + 1)}
        @rz-tempo-change=${(e: CustomEvent<{ value: number }>) => {
          this.bpm = e.detail.value;
          this.metro.bpm = this.bpm;
          this.persist();
        }}
        @rz-cycles-change=${(e: CustomEvent<{ value: number }>) => {
          this.cyclesPerItem = e.detail.value;
          this.beat = 0;
          this.cycle = 0;
          if (this.metro.running) this.metro.resync();
          this.persist();
        }}
        @rz-reveal-change=${(e: CustomEvent<{ checked: boolean }>) => {
          this.reveal = e.detail.checked;
          this.persist();
        }}
        @rz-thaat-pool-change=${(e: CustomEvent<{ enabled: string[] }>) => {
          this.enabled = e.detail.enabled;
          this.persist();
        }}
      ></rz-practice-template>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rz-practice-page': RzPracticePage;
  }
}
