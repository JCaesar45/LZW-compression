const assert = require('assert');

function compress(input) {
  const dict = {};
  let size = 256;
  for (let i = 0; i < 256; i++) dict[String.fromCharCode(i)] = i;
  const out = [];
  let w = '';
  for (const c of input) {
    const wc = w + c;
    if (wc in dict) { w = wc; }
    else { out.push(dict[w]); dict[wc] = size++; w = c; }
  }
  if (w) out.push(dict[w]);
  return out;
}

function decompress(codes) {
  const dict = {};
  let size = 256;
  for (let i = 0; i < 256; i++) dict[i] = String.fromCharCode(i);
  if (!codes.length) return '';
  let w = dict[codes[0]];
  let out = w;
  for (let i = 1; i < codes.length; i++) {
    const k = codes[i];
    let entry;
    if (k in dict) entry = dict[k];
    else if (k === size) entry = w + w[0];
    else throw new Error('Bad code: ' + k);
    out += entry;
    dict[size++] = w + entry[0];
    w = entry;
  }
  return out;
}

// Spec vectors
assert.deepStrictEqual(
  compress('TOBEORNOTTOBEORTOBEORNOT'),
  [84, 79, 66, 69, 79, 82, 78, 79, 84, 256, 258, 260, 265, 259, 261, 263]
);
assert.strictEqual(
  decompress([84, 79, 66, 69, 79, 82, 78, 79, 84, 256, 258, 260, 265, 259, 261, 263]),
  'TOBEORNOTTOBEORTOBEORNOT'
);
assert.deepStrictEqual(compress('0123456789'), [48,49,50,51,52,53,54,55,56,57]);
assert.strictEqual(decompress([48,49,50,51,52,53,54,55,56,57]), '0123456789');
assert.deepStrictEqual(compress('BABAABAAA'), [66, 65, 256, 257, 65, 260]);
assert.strictEqual(decompress([66, 65, 256, 257, 65, 260]), 'BABAABAAA');

// Fuzz
for (let t = 0; t < 5000; t++) {
  const len = 1 + Math.floor(Math.random() * 300);
  let s = '';
  for (let i = 0; i < len; i++) {
    s += String.fromCharCode(32 + Math.floor(Math.random() * 95));
  }
  assert.strictEqual(decompress(compress(s)), s, 'round-trip failed at trial ' + t);
}

console.log('All spec tests passed.');
