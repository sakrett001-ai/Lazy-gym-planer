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
  const parts = new Set([...A.bound.map(m => m.part), ...A.SHEETS.map(s => s.part)]);
  for (const k of Object.keys(ref.missing.list)) assert(!parts.has(k), k + ' уже есть в данных — уберите из missing');
  /* межрёберные (4.40.0) — уже не в списке отсутствующих: их проверяет раздел sheets эталона */
  assert(!('intercostals' in ref.missing.list), 'межрёберные есть в данных — уберите из missing');
});

/* Межрёберные мышцы (4.40.0) — пласты: 11 промежутков, наружные и внутренние, с каждой стороны; все проверки эталона
   (края на своих рёбрах, концы у ориентиров, стороны) — в норме, в том числе в общем аудите выше */
test('intercostal sheets: every space on both sides, edges on their own ribs, ends at the anatomical landmarks', () => {
  assert.equal(A.SHEETS.length, 44);
  const r = A.sheetAudit(ref);
  assert(r.results.length >= 7, 'проверок пластов ' + r.results.length);
  assert.deepEqual(r.results.filter(x => !x.ok).map(x => x.tag + ' — ' + x.fail.join('; ')), []);
  assert.deepEqual(r.orphan, []);
});

test('the sheet audit catches a sheet on the wrong ribs, on the wrong side, or stopping short', () => {
  const copy = A.SHEETS.map(s => JSON.parse(JSON.stringify(s)));
  const by = n => copy.find(s => s.name === n);
  /* наружный пласт 5-го промежутка — на месте 6-го (сдвиг на ребро вниз) */
  Object.assign(by('ICe5_r'), { a: by('ICe6_r').a, b: by('ICe6_r').b });
  /* внутренний 4-го слева — отражён на правую сторону */
  const m = by('ICi4_l'); m.a = m.a.map(p => [-p[0], p[1], p[2]]); m.b = m.b.map(p => [-p[0], p[1], p[2]]);
  /* внутренний 3-го справа — обрезан спереди на треть (не доходит до грудины) */
  const c = by('ICi3_r'), k = Math.round(c.a.length * 2 / 3); c.a = c.a.slice(0, k); c.b = c.b.slice(0, k); c.t = c.t.slice(0, k);
  const res = A.sheetAudit(ref, copy).results, failed = res.filter(x => !x.ok).flatMap(x => x.fail).join('\n');
  assert.match(failed, /ICe5_r: верх: \d+ у ребра 6/, 'сдвиг на ребро не найден');
  assert.match(failed, /ICi4_l за средней линией/, 'пласт на чужой стороне не найден');
  assert.match(failed, /ICi3_r: промежуток впереди открыт/, 'укороченный пласт не найден');
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
