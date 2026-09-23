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
  type RiyazStorage,
} from '../../../data/preferences.js';
import { loadDaySession, saveDaySession } from '../../../data/day-session.js';
import {
  DEFAULT_ORDER,
  newSession,
  randomItem,
  reorderSession,
  type SessionItem,
  type SessionOrder,
} from '../../../data/session.js';
import { DEFAULT_THAAT, type Thaat } from '../../../data/thaats.js';

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

  @state() private bpm = 72;
  @state() private enabled: string[] = [];
  @state() private unlimited = false;
  @state() private order: SessionOrder = DEFAULT_ORDER;
  /** Which thaat the alankar list is shown in. View state, so it is not
      persisted — it is set from whatever is being practised when the list
      opens, which is the answer wanted nine times in ten. */
  @state() private browseThaat = DEFAULT_THAAT.key;

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
    this.enabled = p.enabled;
    this.unlimited = p.unlimited;
    this.order = p.order;
  }

  private persist() {
    savePreferences(this.storage, {
      bpm: this.bpm,
      enabled: this.enabled,
      unlimited: this.unlimited,
      order: this.order,
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
    const session = newSession(this.enabled, this.order);
    this.items = session.items;
    this.thaats = session.thaats;
    this.index = 0;
    this.finished = false;
    this.beat = 0;
    this.sessionStartedAt = Date.now();
    this.persistSession();
    if (this.metro.running) this.metro.resync();
    this.emit('rz-session-start', {
      thaats: session.thaats.map((t) => t.key),
      alankars: [...new Set(session.items.map((i) => i.alankar.n))],
      restored: false,
    });
  }

  /**
   * Re-lay the deal already on screen, keeping the student on the sequence
   * they were on.
   *
   * The same five alankars and the same two thaats, rearranged — not new
   * material, so the day's session survives it. Applied the moment the order
   * is picked: a setting that only took effect on some later deal looked
   * broken, because picking it changed nothing you could see.
   */
  private applyOrder() {
    // An unlimited stream is drawn one at a time and has no layout to impose.
    if (this.unlimited) return;
    const items = reorderSession(this.items, this.order);
    if (!items) return;

    const current = this.items[this.index];
    this.items = items;
    const at = current
      ? items.findIndex(
          (i) => i.alankar.n === current.alankar.n && i.thaat.key === current.thaat.key,
        )
      : -1;
    this.index = at >= 0 ? at : 0;
    this.persistSession();
    // Only a move to a *different* alankar restarts the phase; staying on the
    // same one through a re-lay must not interrupt the cycle being sung.
    if (at < 0) {
      this.beat = 0;
      if (this.metro.running) this.metro.resync();
    }
  }

  /** Start an unlimited stream: one random pairing, extended as you go. */
  private startUnlimited() {
    const first = randomItem();
    this.items = [first];
    this.thaats = [first.thaat];
    this.index = 0;
    this.finished = false;
    this.beat = 0;
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

  /**
   * One cycle of the current alankar, sung to the end.
   *
   * The metronome no longer moves anyone on, so this is the only thing it
   * reports: a host counts cycles to know how much practice happened. Never
   * called for a manual skip — that is not practice.
   */
  private reportSequenceComplete(index: number) {
    const item = this.items[index];
    if (!item) return;
    this.emit('rz-sequence-complete', {
      index,
      alankar: item.alankar.n,
      thaat: item.thaat.key,
      bpm: this.bpm,
    });
  }

  private finish() {
    // Next is pressable from the completion screen too; the session only ends
    // once, and rz-session-complete is only reported once.
    if (this.finished) return;
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
      // Unlimited keeps drawing. A fixed session ends here instead: with
      // nothing advancing on its own, Next off the last alankar is the only
      // moment left that means "done with this one".
      if (!this.unlimited) {
        this.finish();
        return;
      }
      this.appendRandom();
    }
    // A skip is not practice: no rz-sequence-complete here.
    this.index = index;
    this.finished = false;
    this.beat = 0;
    this.persistSession();
    // Restart the phase so the new alankar starts from sam.
    this.metro.resync();
  }

  /* --------------------------------------------------------------- beats */

  /**
   * The alankar loops until Next is pressed, so a beat is only ever its
   * position in the cycle — one unbroken eight, never a phase that shifts.
   * `Metronome.strokeFor` already derives sam and the half-way beat from that,
   * which is why the page no longer overrides it.
   */
  private handleBeat(n: number) {
    // Back at sam: the cycle just gone was sung to the end.
    if (n > 0 && n % BEATS_PER_CYCLE === 0) this.reportSequenceComplete(this.index);
    this.beat = n % BEATS_PER_CYCLE;
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
      case 'u':
      case 'U':
        this.toggleUnlimited();
        break;
      case 'a':
      case 'A':
        this.openBrowse();
        break;
      default:
        break;
    }
  }

  /* -------------------------------------------------------------- render */

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
      if (this.metro.running) this.metro.resync();
    } else {
      this.deal();
    }
  }

  /**
   * Open the alankar list on the thaat being practised — a list of all 53 in
   * Todi is not what someone drilling in Kafi asked for. Only on the way *in*:
   * reselecting inside the list must not be undone by a re-render.
   */
  private openBrowse() {
    if (this.panel !== 'browse') {
      this.browseThaat = this.items[this.index]?.thaat.key ?? DEFAULT_THAAT.key;
    }
    this.setPanel('browse');
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
        ?finished=${this.finished}
        panel=${this.panel ?? ''}
        ?playing=${this.playing}
        beats=${BEATS_PER_CYCLE}
        beat=${this.beat}
        midIndex=${midBeatIndex(BEATS_PER_CYCLE)}
        bpm=${this.bpm}
        ?unlimited=${this.unlimited}
        .enabled=${this.enabled}
        order=${this.order}
        browseThaat=${this.browseThaat}
        @rz-toggle-settings=${() => this.setPanel('settings')}
        @rz-toggle-browse=${() => this.openBrowse()}
        @rz-browse-thaat-change=${(e: CustomEvent<{ key: string }>) =>
          (this.browseThaat = e.detail.key)}
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
        @rz-unlimited-toggle=${() => this.toggleUnlimited()}
        @rz-prev=${() => this.goto(this.index - 1)}
        @rz-next=${() => this.goto(this.index + 1)}
        @rz-tempo-change=${(e: CustomEvent<{ value: number }>) => {
          this.bpm = e.detail.value;
          this.metro.bpm = this.bpm;
          this.persist();
        }}
        @rz-thaat-pool-change=${(e: CustomEvent<{ enabled: string[] }>) => {
          this.enabled = e.detail.enabled;
          this.persist();
        }}
        @rz-order-change=${(e: CustomEvent<{ order: SessionOrder }>) => {
          this.order = e.detail.order;
          this.persist();
          this.applyOrder();
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
