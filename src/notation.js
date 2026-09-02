/* Turns an ASCII notation line into Bhatkhande-style marked swaras:
     komal   -> underlined letter          (r g d n)
     teevra  -> overlined M                (M)
     taar    -> dot above the letter       (S.)
     mandra  -> dot below the letter       (.N)
   Everything else — spaces, commas, hyphens, slashes, bars — passes through
   as muted punctuation so the phrasing of the original stays visible. */

var KOMAL = 'rgdn';
var SWARA = 'SRGmPDNrgdnM';

function isSwara(c) { return c && SWARA.indexOf(c) !== -1; }

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function swaraSpan(c, octave) {
  var cls = ['sw'];
  if (KOMAL.indexOf(c) !== -1) cls.push('komal');
  else if (c === 'M') cls.push('teevra');
  if (octave) cls.push(octave);
  return '<span class="' + cls.join(' ') + '">' + c.toUpperCase() + '</span>';
}

/* Each swara is an inline-block, so a line could otherwise break between any
   two of them and split a phrase mid-group. Render each space-separated group
   as one nowrap run, so lines only ever break where the notation has a space. */
function renderNotation(text) {
  return text.split(/( +)/).map(function (seg) {
    if (seg === '' ) return '';
    if (seg.charAt(0) === ' ') return seg;
    return '<span class="riyaz-grp">' + renderGroup(seg) + '</span>';
  }).join('');
}

function renderGroup(text) {
  var html = '';
  var i = 0;
  while (i < text.length) {
    var c = text[i];

    // A dot bound to the swara before it is taar and was already consumed,
    // so any dot reaching here belongs to the swara that follows it.
    if (c === '.' && isSwara(text[i + 1])) {
      html += swaraSpan(text[i + 1], 'mandra');
      i += 2;
      continue;
    }
    if (isSwara(c)) {
      var taar = text[i + 1] === '.';
      html += swaraSpan(c, taar ? 'taar' : '');
      i += taar ? 2 : 1;
      continue;
    }
    html += c === ' ' ? ' ' : '<span class="pn">' + esc(c) + '</span>';
    i++;
  }
  return html;
}
