'use strict';
/* Эспандеры: общая модель ленты (src/js/09bo-band.js) и её аудит (tools/mannequin/cable-audit.js, auditBand) по запечённым
   позам (src/js/09bp-poses.js), по кадрам повтора и между ключами позы.
   * у шести упражнений с лентой нет замечаний: лента одна и непрерывна, без изломов вне огибания, не проходит сквозь тело
     и инвентарь, в любой фазе натянута и растянута не больше трёх длин покоя, под подошвой не скользит, ветви натянуты
     одинаково;
   * физика: длина ленты — сумма отрезков, у ленты в кольце растяжение одно, у куска под стопами — 1; сечение по сохранению
     объёма (r0/√λ); огибание края подошвы — по дуге цилиндра (расчёт путей мышц, Muscles.wrap);
   * аудит ловит то, что должен: провисание, растяжение сверх паспорта, разрыв, излом, ленту сквозь тело, скольжение под
     подошвой, разное натяжение ветвей;
   * модель покрывает типы лент: трубку с рукоятями, длинную петлю и мини-петлю (петля вокруг голеней). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const POSES = require('../src/js/09bp-poses.js');
const EQ = require('../src/js/09bn-equipment.js');
const M = require('../src/js/09bm-mannequin.js'), { V } = M;
const { auditBand, auditEntry, bandFlags, BAND_LIM } = require('./mannequin/cable-audit.js');

const IDS = { bandlatraise: 'tube48', bandcurl: 'tube48', bandpushdown: 'tube48', bandfacepull: 'tube36', bandextrot: 'tube36', bandrow: 'tube36' };
const frames = (entry, n = 41, edit) => { const rig = EQ.rig(EQ.variantEntry(entry, () => false)); return Array.from({ length: n }, (_, i) => { const t = i / (n - 1), R = rig(t); if (edit) edit(R, t); return { t, R }; }); };
const band = (R, id = 'band') => R.props.filter(p => p.band && p.band.id === id);
const audit = (id, edit, entry = POSES[id]) => auditBand(id, 'band', frames(entry, 41, edit));
const has = (r, re) => r.flags.some(f => re.test(f));

test('bands: six exercises — one continuous band, taut, within the passport stretch, no slip, no flags', () => {
  for (const [id, model] of Object.entries(IDS)) {
    const rows = auditEntry(id, POSES[id]), m = rows.find(r => r.type === 'лента-модель');
    assert(m, `${id}: строка ленты`);
    assert.equal(m.model, model, `${id}: модель ${m.model}`);
    assert.deepEqual(rows.filter(r => r.flags.length).map(r => `${r.part}: ${r.flags.join('; ')}`), [], id);
    assert(m.join <= BAND_LIM.join && m.kink.a <= BAND_LIM.kink, `${id}: стык ${m.join}, излом ${m.kink.a}`);
    m.lam.forEach(([lo, hi], k) => { if (m.loaded[k]) assert(lo >= 1 && hi <= 3, `${id}: кусок ${k + 1} ×${lo}…${hi}`); else assert(Math.abs(lo - 1) < 1e-9 && Math.abs(hi - 1) < 1e-9, `${id}: кусок под стопами лежит`); });
  }
});

test('bands: physics — length is the sum of segments, one stretch through the ring, section by volume, edge wrap on its cylinder', () => {
  for (const id of Object.keys(IDS)) for (const { R } of frames(POSES[id], 11)) {
    const ps = band(R), b = ps[0].band;
    const L = ps.reduce((a, p) => a + p.pts.slice(1).reduce((s, q, i) => s + V.dist(p.pts[i], q), 0), 0);
    assert(Math.abs(L - b.L) < 1e-6, `${id}: длина ${L} против ${b.L}`);
    assert(Math.abs(b.pieces.reduce((a, p) => a + p.L, 0) - b.L) < 1e-6, `${id}: куски`);
    assert(Math.abs(b.pieces.filter(p => p.loaded).reduce((a, p) => a + p.L0, 0) + b.pieces.filter(p => !p.loaded).reduce((a, p) => a + p.L, 0) - b.rest) < 1e-6, `${id}: длина покоя распределена целиком`);
    if (b.slide) assert.equal(b.pieces.length, 1, `${id}: в кольце лента скользит — один кусок`);
    const r0 = EQ.band.MODELS[b.model].r0, lamMax = Math.max(...b.pieces.map(p => p.lam));
    assert(Math.abs(Math.min(...ps.flatMap(p => p.rs)) - r0 / Math.sqrt(lamMax)) < 1e-9, `${id}: радиус r0/√λ`);
    for (const pin of b.pins) {
      /* место под подошвой — в рамке стопы неподвижно (опора без скольжения) */
      const F = pin.foot, loc = p => [V.dot(V.sub(p, F.o), F.x), V.dot(V.sub(p, F.o), F.y), V.dot(V.sub(p, F.o), F.z)];
      const med = loc(pin.med);
      /* стоя лента поднята на пол (сдвиг вверх по полу, стопа чуть наклонена) — сечение в пределах 0,5 см */
      assert(Math.abs(med[2] - (id === 'bandrow' ? 11 : 6)) < .5, `${id}: сечение под подошвой ${med[2]}`);
    }
  }
  /* огибание края подошвы — дуга на цилиндре радиуса 1,6 + r вокруг оси стопы (Muscles.wrap) */
  const R = frames(POSES.bandcurl, 3)[1].R, b = band(R)[0].band, o = EQ.band.soleOf(R, 'L', 6, .5), ax = V.unit(o.axis);
  const L = band(R).find(p => p.id === 'band:L'), arc = L.pts.filter(p => Math.abs(V.len(V.perp(V.sub(p, o.c), ax)) - o.r) < 1e-6);
  assert(arc.length >= 5, `точек на дуге края ${arc.length}`);
  void b;
});

test('bands: the audit catches slack, over-stretch, a break, a kink, a band through the body, slip under the sole, unequal pull', () => {
  const base = POSES.bandcurl, withRest = rest => ({ ...base, equipment: base.equipment.map(e => e.type === 'band' ? { ...e, rest } : e) });
  assert(has(audit('bandcurl', null, withRest(300)), /провисает/), 'длинная лента провисает');
  assert(has(audit('bandcurl', null, withRest(70)), /больше паспортного предела/), 'короткая лента растянута сверх паспорта');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:R'); p.pts = p.pts.map((q, i) => i === 0 ? V.add(q, [0, 0, 2]) : q); }), /разорвана/), 'разрыв');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:L'); const i = Math.floor(p.pts.length / 2); p.pts = p.pts.map((q, j) => j === i ? V.add(q, [8, 0, 0]) : q); }), /излом/), 'излом');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:L'); p.pts = p.pts.map((q, j) => j === p.pts.length - 2 ? V.mix(R.hip, R.sh, .5) : q); }), /сквозь/), 'сквозь тело');
  assert(has(audit('bandcurl', (R, t) => { for (const p of band(R)) p.band = { ...p.band, pins: p.band.pins.map(q => ({ ...q, med: V.add(q.med, [0, 0, 2 * t]) })) }; }), /скользит/), 'скольжение под подошвой');
  assert(has(audit('bandcurl', R => { const ps = band(R), b = ps[0].band, nb = { ...b, pieces: b.pieces.map((p, k) => k === 0 ? { ...p, lam: p.lam * 1.4 } : p) }; for (const p of ps) p.band = nb; }), /по-разному/), 'разное натяжение');
  /* нормальная поза — без замечаний */
  assert.deepEqual(audit('bandcurl').flags, []);
  assert.deepEqual(bandFlags({ lam: [[1, 2]], loaded: [true], max: 3, join: 0, kink: { a: 0 }, body: { d: 0 }, gear: { d: 0 }, slip: [], pull: 0, frames: [] }), []);
});

test('bands: the model covers a tube, a long loop and a mini loop (round and flat section, closed loop round the shins)', () => {
  const R = EQ.rig(POSES.airsquat || POSES.bandcurl)(0);
  for (const [model, at] of [['mini12', .85], ['loop41', .5]]) {
    const out = EQ.band.path({ type: 'band', id: 'mb', model, closed: true, route: [{ limb: 'sk', side: 'L', at }, { limb: 'sk', side: 'R', at }] }, R), p = out.parts[0], b = p.band;
    assert(b.closed && V.dist(p.pts[0], p.pts.at(-1)) < 1e-9, `${model}: петля замкнута`);
    const L = p.pts.slice(1).reduce((s, q, i) => s + V.dist(p.pts[i], q), 0);
    assert(Math.abs(L - b.L) < 1e-6, `${model}: длина`);
    const m = EQ.band.MODELS[model], k = 1 / Math.sqrt(Math.max(1, b.L / m.rest));
    assert(Math.abs(p.flat[0] - m.w0 * k) < 1e-9 && Math.abs(p.flat[1] - m.h0 * k) < 1e-9, `${model}: плоское сечение по объёму`);
    /* петля огибает обе голени снаружи: каждая точка не ближе радиуса голени к оси (не проходит сквозь ногу) */
    for (const s of ['L', 'R']) for (const q of p.pts) assert(M.limbSDF(R, 'sk', s, q) > -.5, `${model}: петля снаружи голени ${s}`);
  }
  assert.equal(EQ.band.MODELS.tube48.rest, 121.9);
  assert.equal(EQ.band.MODELS.loop41.rest, 208.3);
});
