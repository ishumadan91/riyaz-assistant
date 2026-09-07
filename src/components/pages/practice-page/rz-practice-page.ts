import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '../../templates/practice-template/rz-practice-template.js';
import type { Panel } from '../../templates/practice-template/rz-practice-template.js';
import { Metronome, midBeatIndex } from '../../../audio/metronome.js';
import {
  loadPreferences,
  localStorageAdapter,
  savePreferences,
  type Preferences,
  type RiyazStorage,
} from '../../../data/preferences.js';
import { newSession, type SessionItem } from '../../../data/session.js';
import type { Thaat } from '../../../data/thaats.js';

/** The cycle is fixed at eight beats, heard as 4 + 4. Not a setting. */
const BEATS_PER_CYCLE = 8;

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
  static styles = css`
    :host {
      display: block;
      height: 100%;
    }
    /* The host is the keyboard target when not using globalKeys, so it must be
       focusable — but never show a focus ring for a whole-app container. */
    :host(:focus) {
      outline: none;
    }
  `;

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
    this.deal();
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
  }

  private persist() {
    savePreferences(this.storage, {
      bpm: this.bpm,
      cyclesPerItem: this.cyclesPerItem,
      reveal: this.reveal,
      enabled: this.enabled,
    });
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
    this.sessionStartedAt = Date.now();
    if (this.metro.running) this.metro.resync();
    this.emit('rz-session-start', {
      thaats: session.thaats.map((t) => t.key),
      alankars: [...new Set(session.items.map((i) => i.alankar.n))],
    });
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
    this.reportSequenceComplete(this.index);
    if (this.index >= this.items.length - 1) {
      this.finish();
      return false;
    }
    this.index += 1;
    return true;
  }

  private finish() {
    this.stop();
    this.finished = true;
    this.emit('rz-session-complete', {
      sequences: this.items.length,
      bpm: this.bpm,
      thaats: this.thaats.map((t) => t.key),
      durationMs: Date.now() - this.sessionStartedAt,
    });
  }

  private goto(index: number) {
    if (index < 0 || index >= this.items.length) return;
    // A skip is not practice: no rz-sequence-complete here.
    this.index = index;
    this.finished = false;
    this.beat = 0;
    this.cycle = 0;
    this.metro.resync();
  }

  /* --------------------------------------------------------------- beats */

  private handleBeat(n: number) {
    const total = BEATS_PER_CYCLE * this.cyclesPerItem;
    if (n > 0 && n % total === 0 && !this.advance()) return;
    const into = n % total;
    this.beat = into % BEATS_PER_CYCLE;
    this.cycle = Math.floor(into / BEATS_PER_CYCLE);
  }

  /* ----------------------------------------------------------- transport */

  private play() {
    if (this.finished) this.deal();
    this.metro.bpm = this.bpm;
    this.metro.beatsPerCycle = BEATS_PER_CYCLE;
    this.metro.start();
    this.playing = this.metro.running;
  }

  private stop() {
    this.metro.stop();
    this.playing = false;
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
      default:
        break;
    }
  }

  /* -------------------------------------------------------------- render */

  private setPanel(next: Panel) {
    // One panel at a time, as a single value rather than two booleans that can
    // disagree with each other.
    this.panel = this.panel === next ? null : next;
  }

  render() {
    return html`
      <rz-practice-template
        .items=${this.items}
        .thaats=${this.thaats}
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
        .enabled=${this.enabled}
        @rz-toggle-settings=${() => this.setPanel('settings')}
        @rz-toggle-about=${() => this.setPanel('about')}
        @rz-close-panel=${() => (this.panel = null)}
        @rz-new-session=${() => this.deal()}
        @rz-restart=${() => {
          this.deal();
          this.play();
        }}
        @rz-goto=${(e: CustomEvent<{ index: number }>) => this.goto(e.detail.index)}
        @rz-play-toggle=${() => this.togglePlay()}
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
