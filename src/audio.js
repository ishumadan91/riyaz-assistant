/* Audio: a lookahead-scheduled metronome. */

var AudioHub = (function () {
  var ctx = null;
  return {
    ctx: function () {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
  };
})();

/* ---------------------------------------------------------------- metronome */
/* Clicks are scheduled ahead of time on the audio clock; the visual beat is
   released later by a rAF loop so the dot lights exactly when you hear it. */
/* An 8-beat cycle is heard as 4 + 4, so the half-way beat is marked too —
   beat 1 and beat 5 of eight. Odd or very short cycles have no divider. */
function midBeatIndex(beatsPerCycle) {
  return (beatsPerCycle >= 4 && beatsPerCycle % 2 === 0) ? beatsPerCycle / 2 : -1;
}

function Metronome() {
  this.bpm = 72;
  this.beatsPerCycle = 8;
  this.volume = 0.5;
  this.onBeat = function () {};
  this.running = false;

  this._beat = 0;          // absolute beat index since start()
  this._nextTime = 0;
  this._queue = [];
  this._timer = null;
  this._raf = null;
  this.LOOKAHEAD = 0.12;   // seconds scheduled in advance
  this.TICK = 25;          // scheduler poll, ms
}

Metronome.prototype.start = function () {
  if (this.running) return;
  var ctx = AudioHub.ctx();
  this.running = true;
  this._beat = 0;
  this._queue = [];
  this._nextTime = ctx.currentTime + 0.06;
  var self = this;
  this._timer = setInterval(function () { self._schedule(); }, this.TICK);
  this._schedule();
  this._drain();
};

Metronome.prototype.stop = function () {
  this.running = false;
  clearInterval(this._timer);
  cancelAnimationFrame(this._raf);
  this._timer = this._raf = null;
  this._queue = [];
};

/* Restart the beat phase from sam — used when you skip to another sequence. */
Metronome.prototype.resync = function () {
  if (!this.running) return;
  var ctx = AudioHub.ctx();
  this._beat = 0;
  this._queue = [];
  this._nextTime = ctx.currentTime + 0.03;
  this._schedule();
};

Metronome.prototype._schedule = function () {
  var ctx = AudioHub.ctx();
  var spb = 60 / this.bpm;
  var mid = midBeatIndex(this.beatsPerCycle);
  while (this._nextTime < ctx.currentTime + this.LOOKAHEAD) {
    var pos = this._beat % this.beatsPerCycle;
    this._click(this._nextTime, pos === 0 ? 'sam' : (pos === mid ? 'mid' : 'beat'));
    this._queue.push({ t: this._nextTime, n: this._beat });
    this._beat++;
    this._nextTime += spb;
  }
};

Metronome.prototype._drain = function () {
  var self = this;
  this._raf = requestAnimationFrame(function () {
    if (!self.running) return;
    var now = AudioHub.ctx().currentTime;
    while (self._queue.length && self._queue[0].t <= now) {
      var b = self._queue.shift();
      self.onBeat(b.n);
    }
    self._drain();
  });
};

/* Three strokes, deliberately different in colour as well as loudness:
     sam  — bright ringing triangle, the top of the cycle
     mid  — low hollow sine, the half-way beat; unmistakably not sam
     beat — dry, quiet square tick */
var STROKES = {
  sam:  { type: 'triangle', from: 1180, to: 640, dur: 0.11,  gain: 0.90 },
  mid:  { type: 'sine',     from: 520,  to: 300, dur: 0.13,  gain: 0.80 },
  beat: { type: 'square',   from: 720,  to: 520, dur: 0.055, gain: 0.40 }
};

Metronome.prototype._click = function (t, kind) {
  var ctx = AudioHub.ctx();
  var s = STROKES[kind] || STROKES.beat;
  var osc = ctx.createOscillator();
  var gain = ctx.createGain();

  osc.type = s.type;
  osc.frequency.setValueAtTime(s.from, t);
  osc.frequency.exponentialRampToValueAtTime(s.to, t + s.dur);

  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(this.volume * s.gain, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + s.dur);

  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + s.dur + 0.02);
};
