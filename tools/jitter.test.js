'use strict';
/* Виляния по каталогу (tools/anny-look/jitter.js; кадр — 1/60 с самой быстрой половины повтора, как в плеере): заметные рывки
   суставов, ход туда-обратно, кулак, едущий по жёсткой ручке, ладонь над опорой между ключами и дрожание кожи Anny при
   спокойных костях не растут и не появляются заново — числа в tools/anny-look/fixtures/jitter.json только убывают (как
   fixtures/folds.json; запись — node tools/anny-look/jitter.js all --record после правок, где числа убыли).
   Кожа меряется по всему каталогу дольше минуты, поэтому здесь — у упражнений с записанной кожей и исправленных в 4.102
   (опоры с окном контакта: копенгагенская планка, тяга под столом, жимы лёжа на полу, ходьба с гантелями); весь каталог с
   кожей — node tools/anny-look/jitter.js all --check. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const J = require('./anny-look/jitter.js');
const FIX = JSON.parse(require('node:fs').readFileSync(J.FIX_FILE, 'utf8'));

test('catalog wobble: joint jerks, back-and-forth, fists sliding along a rigid handle, palms lifting off between keys — not above the record', () => {
  const rows = J.run({ skin: false }), bad = J.regressions(rows, FIX, { skin: false });
  assert.deepEqual(bad, [], bad.join('\n'));
  /* исправленное в 4.102: кулаки на жёстком грифе и рукояти блока не едут (было 1,3–9,8 см) */
  const slip = (id, has = 'всё') => Math.max(...rows.find(r => r.id === id && r.has === has).grip.map(g => g.range));
  for (const id of ['bbcurl', 'skull', 'preacher', 'latpull', 'pushdown', 'hangknee', 'legraise']) assert(slip(id) < J.NOTICE.grip, `${id}: fist slides ${slip(id).toFixed(2)} cm along the handle`);
});

test('skin wobble: supports with a contact window fade in and out, the skin does not jump onto them', () => {
  const ids = [...new Set(Object.keys(FIX).filter(k => /\|кожа/.test(k)).map(k => k.split('|')[0]).concat(['copenhagenknee', 'tablerow', 'bandfloorpress', 'kbfloorpress', 'farmer']))];
  const rows = J.run({ ids }), bad = J.regressions(rows, FIX);
  assert.deepEqual(bad, [], bad.join('\n'));
  for (const id of ['copenhagenknee', 'tablerow', 'bandfloorpress', 'kbfloorpress', 'farmer']) { const r = rows.find(x => x.id === id && x.has === 'всё'); assert(r.skin.jit < J.NOTICE.skin, `${id}: skin ${r.skin.jit.toFixed(2)} cm per frame (${r.skin.cause})`); }
});
