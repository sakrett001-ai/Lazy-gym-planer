'use strict';
/* Хваты: семьи на одном инвентаре, переключатель в карточке, выбор хвата пишется в свой план или как замена,
   журнал и подсказки ведутся по хвату отдельно, история показывает другие хваты. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
const m = loadModel({ fullApp: true });
m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
const a = m.get(`({S,EX,EXI,VARIANT_FAMILIES,VARIANT_OF,variantsFor,variantRowHtml,variantHistNote,buildPlan,cardHtml,effEquip,ensureCustoms,ensurePlaces,ensureProtect,
  PLACE_DEFAULTS,openCustom,customOf,LOG})`);
function reset(extra = {}) {
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.S.adapt = null; a.ensurePlaces(a.S);
  Object.assign(a.S, { mode: 'custom', format: 'classic', goal: 'mass', level: 'mid', groups: ['back', 'chest'], seed: 7, protect: [], fav: [], gen: null }, extra);
  a.S.customs = [{ id: 'p1', name: 'Хваты', items: [{ id: 'pullup', sets: 4, kg: [10], note: 'Медленно вниз' }, { id: 'dbcurl' }, { id: 'pushup' }, { id: 'bbbench' }, { id: 'latpull' }, { id: 'cablerow' }, { id: 'pushdown' }, { id: 'cablecurl' }] }];
  a.S.custom = 'p1'; a.ensureCustoms(a.S); a.ensureProtect(a.S); a.openCustom('p1');
  m.get('plan = buildPlan()');
  return m.get('plan');
}
const row = it => a.variantRowHtml(it, a.effEquip(a.S.equip));
const buttons = html => [...html.matchAll(/data-variant="(\w+)"[^>]*aria-pressed="(true|false)"/g)].map(x => x[1] + (x[2] === 'true' ? '*' : ''));

test('families: known exercises on the same equipment, each exercise in one family', () => {
  const seen = new Set();
  for (const f of a.VARIANT_FAMILIES) {
    assert(f.items.length >= 2, f.id);
    const eqs = f.items.map(([id]) => { assert(a.EXI[id], id + ' exists'); assert(!seen.has(id), id + ' in one family'); seen.add(id); return JSON.stringify(a.EXI[id].eq); });
    assert.equal(new Set(eqs).size, 1, f.id + ': one equipment set, the grip is the only difference');
  }
});

test('the card offers the grips you can do here; the chosen one is pressed', () => {
  const p = reset();
  const by = id => p.items.find(it => it.ex.id === id);
  assert.deepEqual(buttons(row(by('pullup'))), ['pullup*', 'chinup']);
  assert.deepEqual(buttons(row(by('dbcurl'))), ['dbcurl*', 'hammer']);
  assert.deepEqual(buttons(row(by('pushup'))), ['pushup*', 'widepush', 'diamond']);
  assert.deepEqual(buttons(row(by('bbbench'))), ['bbbench*', 'closegrip']);
  assert.deepEqual(buttons(row(by('latpull'))), ['latpull*', 'latpullv', 'latpulluh'], 'lat pulldown: wide, V-handle, underhand');
  assert.deepEqual(buttons(row(by('cablerow'))), ['cablerow*', 'cablerowwide'], 'seated row: V-handle, wide bar');
  assert.deepEqual(buttons(row(by('pushdown'))), ['pushdown*', 'ropepushdown'], 'pushdown: straight bar, rope');
  assert.deepEqual(buttons(row(by('cablecurl'))), ['cablecurl*', 'ropecurl'], 'cable curl: straight bar, rope');
  assert(a.cardHtml(by('pullup'), 0).includes('class="c-var"'), 'the switch is in the card');
  /* хват, который уже стоит в другой карточке, не предлагается */
  a.S.customs[0].items.push({ id: 'chinup' }); a.ensureCustoms(a.S); m.get('plan = buildPlan()');
  assert.deepEqual(buttons(row(m.get('plan').items.find(it => it.ex.id === 'pullup'))), [], 'only one grip left — no switch');
});

test('a grip you cannot do here is not offered: equipment, level, protected joints', () => {
  let p = reset({ level: 'beg' });
  assert.deepEqual(buttons(row(p.items.find(it => it.ex.id === 'pushup'))), ['pushup*', 'widepush', 'diamond'], 'all push-ups are level 1–2');
  p = reset({ protect: ['neck'] });
  assert(!p.items.some(it => it.ex.id === 'pullup'), 'pull-ups load the neck and are replaced');
  const E = a.effEquip(a.S.equip);
  assert.deepEqual(plain(a.variantsFor(a.EXI.pullup, E)), [], 'and neither grip is offered');
});

test('switching writes the grip into the custom plan and keeps its dosage; journal and history stay per grip', () => {
  reset();
  const item = a.customOf().items[0];
  item.id = 'chinup'; /* то же, что делает кнопка переключателя в своём плане */
  const p = m.get('plan = buildPlan()');
  const it = p.items.find(x => x.slot === 0);
  assert.equal(it.ex.id, 'chinup');
  assert.deepEqual([it.rx.sets, plain(it.rx.kgPlan), it.rx.coachNote], [4, [10], 'Медленно вниз'], 'sets, weight and note stay with the slot');
  const d = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  a.LOG.data.pullup = [{ d: d(5), s: [[10, 8], [10, 7]] }];
  assert.match(a.variantHistNote(a.EXI.chinup), /Прямой<\/b> · 1 запись.*10×8 · 10×7/, 'history shows the other grip');
  assert.equal(a.variantHistNote(a.EXI.pullup), '', 'nothing logged with the other grip yet');
  a.LOG.data = {};
});

test('in a generated plan the grip is a swap of that slot', () => {
  reset({ groups: ['back', 'biceps'], count: 6 });
  a.S.mode = 'single'; /* reset открывает свой план — здесь нужна собранная тренировка */
  const p = m.get('plan = buildPlan()');
  assert(!p.custom);
  const it = p.items.find(x => a.VARIANT_OF[x.ex.id] && a.variantsFor(x.ex, p.E, new Set(p.items.map(y => y.ex.id))).length);
  assert(it, 'the back day has an exercise with grips: ' + plain(p.items.map(x => x.ex.id)));
  const other = a.variantsFor(it.ex, p.E, new Set(p.items.map(y => y.ex.id))).find(x => x.ex !== it.ex).ex.id;
  const q = m.get(`buildPlan({swaps:{${it.slot}:'${other}'}})`);
  assert.equal(q.items.find(x => x.slot === it.slot).ex.id, other);
});
