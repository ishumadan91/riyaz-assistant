/* Thaats — the ten parent scales.
   Alankar data is written in Bilawal (all shuddha swaras), so transposing to
   another thaat is a per-swara substitution:
     komal  -> lowercase r g d n
     teevra -> uppercase M (shuddha madhyam is lowercase m in the source) */

const THAATS = [
  { key: 'bilawal',  name: 'Bilawal',  map: {} },
  { key: 'kafi',     name: 'Kafi',     map: { G: 'g', N: 'n' } },
  { key: 'khamaj',   name: 'Khamaj',   map: { N: 'n' } },
  { key: 'bhairav',  name: 'Bhairav',  map: { R: 'r', D: 'd' } },
  { key: 'asavari',  name: 'Asavari',  map: { G: 'g', D: 'd', N: 'n' } },
  { key: 'bhairavi', name: 'Bhairavi', map: { R: 'r', G: 'g', D: 'd', N: 'n' } },
  { key: 'kalyan',   name: 'Kalyan',   map: { m: 'M' } },
  { key: 'marwa',    name: 'Marwa',    map: { R: 'r', m: 'M' } },
  { key: 'poorvi',   name: 'Poorvi',   map: { R: 'r', m: 'M', D: 'd' } },
  { key: 'todi',     name: 'Todi',     map: { R: 'r', G: 'g', m: 'M', D: 'd' } }
];

const DEFAULT_THAAT = THAATS[0]; // Bilawal — always in the pool, never optional

/* The nine the student can switch on and off. */
const OPTIONAL_THAATS = THAATS.filter(function (t) { return t.key !== DEFAULT_THAAT.key; });

function thaatByKey(key) {
  return THAATS.find(function (t) { return t.key === key; }) || DEFAULT_THAAT;
}

/* Rewrite a Bilawal notation string into the given thaat. Only the five
   variable swaras are touched; S, P and all punctuation pass through. */
function transpose(text, thaat) {
  var map = thaat.map;
  var out = '';
  for (var i = 0; i < text.length; i++) {
    var c = text[i];
    out += Object.prototype.hasOwnProperty.call(map, c) ? map[c] : c;
  }
  return out;
}

/* The thaat's own scale, for the header strip. */
function thaatScale(thaat) {
  return transpose('S R G m P D N S.', thaat);
}
