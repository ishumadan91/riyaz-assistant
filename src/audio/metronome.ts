/**
 * Lookahead-scheduled Web Audio metronome.
 *
 * Two clocks, deliberately: clicks are scheduled ahead on the *audio* clock by
 * a `setInterval` poll, and the visual beat is released separately by a
 * `requestAnimationFrame` drain so the dot lights exactly when the click is
 * heard. Driving the UI straight from the interval reintroduces audible
 * jitter — that split is the whole design. Do not "simplify" it.
 */

export type Stroke = 'sam' | 'mid' | 'beat' | 'count';

/**
 * An 8-beat cycle is heard as 4 + 4, so the half-way beat is marked too —
 * beat 1 and beat 5 of eight. Returns -1 for odd or very short cycles, which
 * have no half-way beat and must render no divider.
 */
export function midBeatIndex(beatsPerCycle: number): number {
  return beatsPerCycle >= 4 && beatsPerCycle % 2 === 0 ? beatsPerCycle / 2 : -1;
}

/**
 * Three strokes, different in colour as well as loudness: `mid` must be
 * unmistakably not-sam, or the 4 + 4 division is inaudible.
 */
const STROKES: Record<Stroke, { type: OscillatorType; from: number; to: number; dur: number; gain: number }> = {
  sam: { type: 'triangle', from: 1180, to: 640, dur: 0.11, gain: 0.9 },
  mid: { type: 'sine', from: 520, to: 300, dur: 0.13, gain: 0.8 },
  beat: { type: 'square', from: 720, to: 520, dur: 0.055, gain: 0.4 },
  // The count-in. High and thin so it reads as preparation rather than as part
  // of the cycle — it must never be mistaken for sam.
  count: { type: 'sine', from: 1560, to: 1180, dur: 0.07, gain: 0.55 },
};

/** Lazily created: browsers block audio until a user gesture, so the context
    must be born inside a click handler. */
let ctx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  const Ctor =
    typeof window !== 'undefined'
      ? window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      : undefined;
  // No Web Audio (Storybook's docs renderer, a non-browser DOM): stay silent
  // rather than throwing.
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  // Safari rejects resume() when it judges the call non-gesture-initiated, and
  // an unhandled rejection there can abort scheduling.
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
  return ctx;
}

export class Metronome {
  bpm = 72;
  beatsPerCycle = 8;
  volume = 0.5;
  /** Called on the rAF drain, at the moment the beat is heard. */
  onBeat: (absoluteBeat: number) => void = () => {};

  /**
   * Which stroke an absolute beat gets. The page overrides this so a count-in
   * can sound different from the cycle.
   *
   * Must be pure and deterministic: it is called at *schedule* time, up to
   * LOOKAHEAD ahead of the beat being heard, so it cannot read state that will
   * only be true once the beat arrives.
   */
  strokeFor: (absoluteBeat: number) => Stroke = (n) => {
    const pos = n % this.beatsPerCycle;
    if (pos === 0) return 'sam';
    return pos === midBeatIndex(this.beatsPerCycle) ? 'mid' : 'beat';
  };

  running = false;

  /** Seconds scheduled in advance of the audio clock. */
  private readonly LOOKAHEAD = 0.12;
  /** Scheduler poll, ms. */
  private readonly TICK = 25;

  private beat = 0;
  private nextTime = 0;
  private queue: { t: number; n: number }[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private raf = 0;

  start(): void {
    if (this.running) return;
    const c = audioContext();
    if (!c) return;
    this.running = true;
    this.beat = 0;
    this.queue = [];
    this.nextTime = c.currentTime + 0.06;
    this.timer = setInterval(() => this.schedule(), this.TICK);
    this.schedule();
    this.drain();
  }

  stop(): void {
    this.running = false;
    if (this.timer !== null) clearInterval(this.timer);
    cancelAnimationFrame(this.raf);
    this.timer = null;
    this.raf = 0;
    this.queue = [];
  }

  /**
   * Restart the beat phase from sam. Used when skipping to another sequence —
   * without it the beat grid drifts out of phase with what is displayed.
   */
  resync(): void {
    if (!this.running) return;
    const c = audioContext();
    if (!c) return;
    this.beat = 0;
    this.queue = [];
    this.nextTime = c.currentTime + 0.03;
    this.schedule();
  }

  private schedule(): void {
    const c = audioContext();
    if (!c) return;
    const spb = 60 / this.bpm;
    while (this.nextTime < c.currentTime + this.LOOKAHEAD) {
      this.click(c, this.nextTime, this.strokeFor(this.beat));
      this.queue.push({ t: this.nextTime, n: this.beat });
      this.beat += 1;
      this.nextTime += spb;
    }
  }

  private drain(): void {
    this.raf = requestAnimationFrame(() => {
      if (!this.running) return;
      const c = audioContext();
      if (!c) return;
      const now = c.currentTime;
      while (this.queue.length && this.queue[0].t <= now) {
        const b = this.queue.shift()!;
        this.onBeat(b.n);
      }
      this.drain();
    });
  }

  private click(c: AudioContext, t: number, kind: Stroke): void {
    const s = STROKES[kind];
    const osc = c.createOscillator();
    const gain = c.createGain();

    osc.type = s.type;
    osc.frequency.setValueAtTime(s.from, t);
    osc.frequency.exponentialRampToValueAtTime(s.to, t + s.dur);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(this.volume * s.gain, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + s.dur + 0.02);
  }
}
