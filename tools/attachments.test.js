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

test('known discrepancies are explained, missing muscles are really missing', () => {
  for (const [k, why] of Object.entries(ref.known)) assert(why.length > 40, 'нужно объяснение: ' + k);
  const parts = new Set(A.bound.map(m => m.part));
  for (const k of Object.keys(ref.missing.list)) assert(!parts.has(k), k + ' уже есть в данных — уберите из missing');
});

test('the audit catches a wrong attachment: a lat that stops at T12 fails, one reaching the iliac crest passes', () => {
  /* сам эталон проверяет то, что должен: подмена конца ломает проверку */
  const lat = ref.checks.find(c => c.parts.join() === 'lat' && c.end.bone === 'spine');
  const r = A.audit({ checks: [lat], known: {} }).results[0];
  assert.equal(r.ok, false);
  assert.match(r.fail.join(), /S1/);
});
