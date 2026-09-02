/* Session logic: pick five alankars and two thaats, cross them into ten
   sequences, shuffle for surprise, and let the metronome walk through them. */

var $ = function (id) { return document.getElementById(id); };

var state = {
  items: [],          // [{ alankar, thaat }]
  index: 0,
  thaats: [],
  beatsPerCycle: 8,     // fixed: an 8-beat cycle, heard as 4 + 4. Not a setting.
  cyclesPerItem: 2,
  bpm: 72,
  reveal: false,
  finished: false,
  enabled: OPTIONAL_THAATS.map(function (t) { return t.key; })  // thaat pool
};

var metro = new Metronome();

/* ------------------------------------------------------------------ store */
function load() {
  try {
    var s = JSON.parse(localStorage.getItem('riyaz') || '{}');
    if (s.bpm) state.bpm = s.bpm;
    if (s.cyclesPerItem) state.cyclesPerItem = s.cyclesPerItem;
    if (typeof s.reveal === 'boolean') state.reveal = s.reveal;
    if (Array.isArray(s.enabled)) {
      // drop anything no longer a thaat, and never allow an empty pool
      var keep = s.enabled.filter(function (k) {
        return OPTIONAL_THAATS.some(function (t) { return t.key === k; });
      });
      if (keep.length) state.enabled = keep;
    }
  } catch (e) { /* private mode, blocked storage — defaults are fine */ }
}
function save() {
  try {
    localStorage.setItem('riyaz', JSON.stringify({
      bpm: state.bpm, cyclesPerItem: state.cyclesPerItem,
      reveal: state.reveal, enabled: state.enabled
    }));
  } catch (e) {}
}

/* ---------------------------------------------------------------- session */
function shuffle(a) {
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

/* The thaats the randomiser may draw the second one from. Falls back to the
   full set if the stored pool somehow emptied. */
function enabledThaats() {
  var on = OPTIONAL_THAATS.filter(function (t) { return state.enabled.indexOf(t.key) !== -1; });
  return on.length ? on : OPTIONAL_THAATS;
}

function newSession() {
  var alankars = shuffle(ALANKARS.slice()).slice(0, 5);
  var other = pick(enabledThaats());
  var thaats = [DEFAULT_THAAT, other];

  var items = [];
  alankars.forEach(function (a) {
    thaats.forEach(function (t) { items.push({ alankar: a, thaat: t }); });
  });
  shuffle(items);

  // The first sequence always sits in Bilawal; the rest stay a surprise.
  var b = items.findIndex(function (x) { return x.thaat.key === DEFAULT_THAAT.key; });
  if (b > 0) { var t0 = items[0]; items[0] = items[b]; items[b] = t0; }

  state.items = items;
  state.thaats = thaats;
  state.index = 0;
  state.finished = false;

  $('done').hidden = true;
  $('stageInner').hidden = false;
  renderChips();
  renderRail();
  renderItem(false);
  if (metro.running) metro.resync();
  paintBeat(0, 0);
}

/* ----------------------------------------------------------------- render */
function renderThaatPool() {
  $('thaatPool').innerHTML = OPTIONAL_THAATS.map(function (t) {
    var on = state.enabled.indexOf(t.key) !== -1;
    return '<label class="choice-item" for="th-' + t.key + '">' +
      '<input type="checkbox" id="th-' + t.key + '" data-thaat="' + t.key + '"' +
      (on ? ' checked' : '') + '>' +
      '<span class="choice-item__label">' + t.name + '</span></label>';
  }).join('');
}

function renderChips() {
  $('thaatChips').innerHTML = state.thaats.map(function (t, i) {
    return '<span class="badge ' + (i === 0 ? 'badge-primary' : 'badge-secondary') + '">' +
      t.name + '</span>';
  }).join('');
}

function renderRail() {
  $('rail').innerHTML = state.items.map(function (it, i) {
    var cur = i === state.index;
    var upcoming = !state.reveal && i > state.index;
    var cls = 'tree-nav__item riyaz-slot' +
      (cur ? ' is-active' : '') + (i < state.index ? ' is-done' : '');
    var label = upcoming ? '&mdash;' : it.alankar.n + ' &middot; ' + it.thaat.name;
    return '<button type="button" class="' + cls + '" data-i="' + i + '"' +
      (cur ? ' aria-current="true"' : '') + ' title="Sequence ' + (i + 1) + '">' +
      '<span class="riyaz-slot__n">' + (i + 1) + '</span><span>' + label + '</span></button>';
  }).join('');
}

function renderItem(animate) {
  var it = state.items[state.index];
  if (!it) return;
  var a = it.alankar, t = it.thaat;

  $('posLabel').textContent = 'Sequence ' + (state.index + 1) + ' of ' + state.items.length;
  $('groupLabel').textContent = a.group + (a.note ? ' · ' + a.note : '');
  $('alankarNo').textContent = a.n;
  $('thaatBadge').textContent = t.name;
  $('thaatBadge').className = 'badge ' +
    (t.key === DEFAULT_THAAT.key ? 'badge-primary' : 'badge-secondary');
  $('scaleLine').innerHTML = '<span class="field-label">Thaat scale</span>' +
    '<span class="riyaz-scale">' + renderNotation(thaatScale(t)) + '</span>';

  var long = a.parts.reduce(function (n, p) { return n + p.lines.length; }, 0) > 6;
  $('parts').innerHTML = a.parts.map(function (p) {
    var lines = p.lines.map(function (l) {
      return '<div class="riyaz-line">' + renderNotation(transpose(l, t)) + '</div>';
    }).join('');
    return '<section class="riyaz-part' + (p.align === 'center' ? ' is-centred' : '') + '">' +
      (p.label ? '<p class="field-label">' + p.label + '</p>' : '') +
      '<div class="riyaz-lines' + (long ? ' is-dense' : '') + '">' + lines + '</div></section>';
  }).join('');

  renderRail();
}

/* -------------------------------------------------------------- beat grid */
function buildBeatUI() {
  var mid = midBeatIndex(state.beatsPerCycle);
  var html = '';
  for (var i = 0; i < state.beatsPerCycle; i++) {
    if (i === mid) html += '<li class="steps__line" aria-hidden="true"></li>';
    html += '<li class="steps__step' +
      (i === 0 ? ' is-sam' : (i === mid ? ' is-mid' : '')) + '" data-b="' + i + '">' +
      '<span class="steps__dot"></span></li>';
  }
  $('beatDots').innerHTML = html;
}

function paintBeat(beat, cycle) {
  var dots = $('beatDots').querySelectorAll('.steps__step');
  for (var i = 0; i < dots.length; i++) {
    dots[i].classList.toggle('is-current', i === beat);
    dots[i].classList.toggle('is-done', i < beat);
  }
  $('cycleBadge').textContent =
    'Cycle ' + (cycle + 1) + ' of ' + state.cyclesPerItem;
}

metro.onBeat = function (n) {
  var total = state.beatsPerCycle * state.cyclesPerItem;
  if (n > 0 && n % total === 0 && !advance()) return;
  var into = n % total;
  paintBeat(into % state.beatsPerCycle, Math.floor(into / state.beatsPerCycle));
};

/* Returns false when the session has run out. */
function advance() {
  if (state.index >= state.items.length - 1) {
    finish();
    return false;
  }
  state.index++;
  renderItem(true);
  return true;
}

function finish() {
  stop();
  state.finished = true;
  $('stageInner').hidden = true;
  $('done').hidden = false;
}

function goto(i) {
  if (i < 0 || i >= state.items.length) return;
  state.index = i;
  state.finished = false;
  $('done').hidden = true;
  $('stageInner').hidden = false;
  renderItem(true);
  metro.resync();
  paintBeat(0, 0);
}

/* -------------------------------------------------------------- transport */
function play() {
  if (state.finished) newSession();
  metro.bpm = state.bpm;
  metro.beatsPerCycle = state.beatsPerCycle;
  metro.start();
  $('playIco').textContent = 'Pause';
  $('playBtn').setAttribute('aria-label', 'Pause');
}
function stop() {
  metro.stop();
  $('playIco').textContent = 'Play';
  $('playBtn').setAttribute('aria-label', 'Play');
}
function togglePlay() { metro.running ? stop() : play(); }

/* One panel at a time: opening either closes the other. */
var PANELS = {
  settings: { panel: 'drawer', trigger: 'moreBtn',  close: 'closeSettings' },
  about:    { panel: 'about',  trigger: 'aboutBtn', close: 'closeAbout' }
};

function setPanel(name, open) {
  Object.keys(PANELS).forEach(function (k) {
    var p = PANELS[k];
    var isOpen = open && k === name;
    $(p.panel).hidden = !isOpen;
    $(p.trigger).setAttribute('aria-expanded', String(isOpen));
  });
  var p = PANELS[name];
  if (open) $(p.close).focus(); else $(p.trigger).focus();
}

function closePanels() {
  Object.keys(PANELS).forEach(function (k) {
    if (!$(PANELS[k].panel).hidden) setPanel(k, false);
  });
}

function anyPanelOpen() {
  return Object.keys(PANELS).some(function (k) { return !$(PANELS[k].panel).hidden; });
}

function renderAbout() {
  $('aboutBody').innerHTML = ABOUT_SECTIONS.map(function (s) {
    return '<h3>' + s.title + '</h3>' + s.html;
  }).join('');
}

/* ------------------------------------------------------------------ wiring */
function setBpm(v) {
  state.bpm = Math.max(30, Math.min(180, v || 72));
  metro.bpm = state.bpm;
  $('bpm').value = state.bpm;
  save();
}

function initControls() {
  $('bpm').value = state.bpm;
  $('cpi').value = state.cyclesPerItem;
  $('revealChk').checked = state.reveal;
  renderThaatPool();

  $('bpm').addEventListener('change', function () { setBpm(+this.value); });
  $('bpmDown').addEventListener('click', function () { setBpm(state.bpm - 2); });
  $('bpmUp').addEventListener('click', function () { setBpm(state.bpm + 2); });

  $('cpi').addEventListener('change', function () {
    state.cyclesPerItem = Math.max(1, Math.min(8, +this.value || 2));
    this.value = state.cyclesPerItem;
    buildBeatUI(); paintBeat(0, 0);
    if (metro.running) metro.resync();
    save();
  });

  // Keep at least one optional thaat ticked — the pairing needs somewhere to go.
  $('thaatPool').addEventListener('change', function (e) {
    var box = e.target.closest('input[data-thaat]');
    if (!box) return;
    var next = state.enabled.filter(function (k) { return k !== box.dataset.thaat; });
    if (box.checked) next.push(box.dataset.thaat);
    if (!next.length) {
      box.checked = true;                 // refuse to empty the pool
      $('thaatError').hidden = false;
      return;
    }
    $('thaatError').hidden = true;
    state.enabled = next;
    save();
  });

  $('revealChk').addEventListener('change', function () {
    state.reveal = this.checked;
    renderRail();
    save();
  });

  renderAbout();
  Object.keys(PANELS).forEach(function (k) {
    var p = PANELS[k];
    $(p.trigger).addEventListener('click', function () { setPanel(k, $(p.panel).hidden); });
    $(p.close).addEventListener('click', function () { setPanel(k, false); });
  });

  $('playBtn').addEventListener('click', togglePlay);
  $('nextBtn').addEventListener('click', function () { goto(state.index + 1); });
  $('prevBtn').addEventListener('click', function () { goto(state.index - 1); });
  $('newBtn').addEventListener('click', newSession);
  $('againBtn').addEventListener('click', function () { newSession(); play(); });

  $('rail').addEventListener('click', function (e) {
    var b = e.target.closest('.riyaz-slot');
    if (b) goto(+b.dataset.i);
  });

  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) {
      if (e.key === 'Escape' && anyPanelOpen()) closePanels();
      return;
    }
    if (e.key === 'Escape') { if (anyPanelOpen()) closePanels(); return; }
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    else if (e.key === 'ArrowRight') goto(state.index + 1);
    else if (e.key === 'ArrowLeft') goto(state.index - 1);
    else if (e.key === 'n' || e.key === 'N') newSession();
    else if (e.key === 'r' || e.key === 'R') {
      $('revealChk').checked = !$('revealChk').checked;
      $('revealChk').dispatchEvent(new Event('change'));
    }
  });
}

load();
initControls();
buildBeatUI();
newSession();
paintBeat(0, 0);
