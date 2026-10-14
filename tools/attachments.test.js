'use strict';
/* Прикрепления мышц манекена — по анатомии (эталон tools/muscles/fixtures/attachments.json, расчёт tools/muscles/attach.js).
   Падает, если конец какой-то мышцы ушёл со своей кости или места, если у новой мышцы нет эталона, и если известное
   расхождение исправлено, а запись о нём осталась (список «known» должен убывать, а не расти). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const A = require('./muscles/attach.js'), ref = require('./muscles/fixtures/attachments.json');

test('every muscle end matches its anatomical attachment (or a listed known discrepancy)', () => {
  const a = A.audit(ref);
  assert.deepEqual(a.unknown.map(r => r.tag + ' — ' + r.fail.join('; ')), [], 'новые расхождения с анатомией');
  assert.deepEqual(a.orphan, [], 'концы мышц без эталона: добавьте запись в fixtures/attachments.json');
  assert.deepEqual(a.fixed, [], 'расхождение исправлено — уберите его из known');
});

test('every muscle lies on its own side of the body', () => {
  assert.deepEqual(A.sides(), [], 'мышцы не на своей стороне (правая слева или левая справа)');
  /* проверка ловит отражённую мышцу: прямая живота, перенесённая через середину */
  const k = A.bound.findIndex(m => m.name === 'rect_abd_r'), p = A.paths[k].points.map(q => [2 * A.midX - q[0], q[1], q[2]]);
  assert.deepEqual(A.sides([A.bound[k]], [{ points: p }]), ['rect_abd_r']);
});

test('known discrepancies are explained, missing muscles are really missing', () => {
  for (const [k, why] of Object.entries(ref.known)) assert(why.length > 40, 'нужно объяснение: ' + k);
  const parts = new Set(A.bound.map(m => m.part));
  for (const k of Object.keys(ref.missing.list)) assert(!parts.has(k), k + ' уже есть в данных — уберите из missing');
});

test('the audit catches a wrong attachment: a missing end and an end in the wrong place fail', () => {
  /* сам аудит проверяет то, что должен: у большой круглой нет конца на тазе, широчайшая не крепится к середине таза */
  const [missing, moved] = A.audit({ checks: [
    { parts: ['tmaj'], end: { bone: 'pelvis', h: [0, .15] } },
    { parts: ['lat'], end: { bone: 'pelvis', h: [.5, .6] } },
  ], known: {} }).results;
  assert.equal(missing.ok, false); assert.match(missing.fail.join(), /нет конца у tmaj/);
  assert.equal(moved.ok, false); assert.match(moved.fail.join(), /LAT[56]_r h=/);
});
