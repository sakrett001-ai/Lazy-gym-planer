'use strict';
/* Эспандеры: общая модель ленты (src/js/09bo-band.js) и её аудит (tools/mannequin/cable-audit.js, auditBand) по запечённым
   позам (src/js/09bp-poses.js), по кадрам повтора и между ключами позы.
   * у шести упражнений с лентой нет замечаний: лента одна и непрерывна, без изломов вне огибания, не проходит сквозь тело
     и инвентарь, в любой фазе натянута и растянута не больше трёх длин покоя, под подошвой не скользит, ветви натянуты
     одинаково;
   * физика: длина ленты — сумма отрезков, у ленты в кольце растяжение одно, у куска под стопами — 1; сечение по сохранению
     объёма (r0/√λ); огибание края подошвы — по дуге цилиндра (расчёт путей мышц, Muscles.wrap);
   * аудит ловит то, что должен: провисание, растяжение сверх паспорта, разрыв, излом, ленту сквозь тело, скольжение под
     подошвой, разное натяжение ветвей; у рукояти — ленту не у кольца стремени, ленту под углом к стремени больше
     atan(половина рукояти / высота вершины) (лямка тянет за один конец), стремя или ленту сквозь предплечье;
   * модель покрывает типы лент: трубку с рукоятями, длинную петлю и мини-петлю (петля вокруг голеней). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const POSES = require('../src/js/09bp-poses.js');
const EQ = require('../src/js/09bn-equipment.js');
const M = require('../src/js/09bm-mannequin.js'), { V } = M;
const { auditBand, auditEntry, bandFlags, BAND_LIM } = require('./mannequin/cable-audit.js');

const IDS = { bandlatraise: 'tube48', bandcurl: 'tube48', bandpushdown: 'tube48', bandfacepull: 'tube36', bandextrot: 'tube36', bandrow: 'tube36',
  /* дома с эспандером: трубка над дверью, трубка у низа двери на манжете (стоя и сидя), мини-петля на голенях и на бёдрах */
  bandlatpull: 'tube36', bandadduct: 'tube36', bandabduct: 'mini12', bandbridge: 'mini12', bandlegext: 'tube48',
  /* заход 2: трубка под спиной лёжа (жим на полу) и трубка из кольца позади вокруг боков (сведение рук у двери) */
  bandfloorpress: 'tube36', bandfly: 'tube48' };
const frames = (entry, n = 41, edit) => { const rig = EQ.rig(EQ.variantEntry(entry, () => false)); return Array.from({ length: n }, (_, i) => { const t = i / (n - 1), R = rig(t); if (edit) edit(R, t); return { t, R }; }); };
const band = (R, id = 'band') => R.props.filter(p => p.band && p.band.id === id);
const audit = (id, edit, entry = POSES[id]) => auditBand(id, 'band', frames(entry, 41, edit));
const has = (r, re) => r.flags.some(f => re.test(f));

test('bands: thirteen exercises — one continuous band, taut, within the passport stretch, no slip, no flags', () => {
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
    const mod = EQ.band.MODELS[b.model], lamMax = Math.max(...b.pieces.map(p => p.lam));
    /* круглая трубка — радиус r0/√λ; плоская петля — ширина и толщина w0/√λ, h0/√λ */
    if (mod.shape === 'round') assert(Math.abs(Math.min(...ps.flatMap(p => p.rs)) - mod.r0 / Math.sqrt(lamMax)) < 1e-9, `${id}: радиус r0/√λ`);
    else for (const p of ps) assert(Math.abs(p.flat[0] - mod.w0 / Math.sqrt(Math.max(1, lamMax))) < 1e-9 && Math.abs(p.flat[1] - mod.h0 / Math.sqrt(Math.max(1, lamMax))) < 1e-9, `${id}: сечение петли по объёму`);
    for (const pin of b.pins) {
      /* под спиной (лёжа на ленте) — отдельная проверка ниже */
      if (pin.torso) continue;
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

test('bands: the audit catches slack, over-stretch, a break, a kink, a band through the body, slip under the sole, unequal pull, a stirrup turned away from the band', () => {
  const base = POSES.bandcurl, withRest = rest => ({ ...base, equipment: base.equipment.map(e => e.type === 'band' ? { ...e, rest } : e) });
  assert(has(audit('bandcurl', null, withRest(300)), /провисает/), 'длинная лента провисает');
  assert(has(audit('bandcurl', null, withRest(70)), /больше паспортного предела/), 'короткая лента растянута сверх паспорта');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:R'); p.pts = p.pts.map((q, i) => i === 0 ? V.add(q, [0, 0, 2]) : q); }), /разорвана/), 'разрыв');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:L'); const i = Math.floor(p.pts.length / 2); p.pts = p.pts.map((q, j) => j === i ? V.add(q, [8, 0, 0]) : q); }), /излом/), 'излом');
  assert(has(audit('bandcurl', R => { const p = band(R).find(q => q.id === 'band:L'); p.pts = p.pts.map((q, j) => j === p.pts.length - 2 ? V.mix(R.hip, R.sh, .5) : q); }), /сквозь/), 'сквозь тело');
  assert(has(audit('bandcurl', (R, t) => { for (const p of band(R)) p.band = { ...p.band, pins: p.band.pins.map(q => ({ ...q, med: V.add(q.med, [0, 0, 2 * t]) })) }; }), /скользит/), 'скольжение под подошвой');
  assert(has(audit('bandcurl', R => { const ps = band(R), b = ps[0].band, nb = { ...b, pieces: b.pieces.map((p, k) => k === 0 ? { ...p, lam: p.lam * 1.4 } : p) }; for (const p of ps) p.band = nb; }), /по-разному/), 'разное натяжение');
  /* рукоять: стремя развёрнуто от ленты (вершина на другой стороне рукояти), лента не у кольца, стремя в предплечье */
  const strap = (R, s) => R.props.find(p => p.id === 'band:strap' + s);
  assert(has(audit('bandcurl', R => { const p = strap(R, 'L'), m = V.mix(p.pts[0], p.pts[4], .5); p.pts = p.pts.map((q, i) => i === 0 || i === 4 ? q : V.sub(V.scale(m, 2), q)); }), /уходит от стремени/), 'стремя против ленты');
  assert(has(audit('bandcurl', R => { const p = strap(R, 'R'); p.pts = p.pts.map((q, i) => i === 2 ? V.add(q, [0, 0, .5]) : q); }), /не у кольца стремени/), 'лента не у кольца');
  assert(has(audit('bandcurl', R => { const p = strap(R, 'L'); p.pts = p.pts.map((q, i) => i === 2 ? V.mix(R.elL, R.wrL, .7) : q); }), /сквозь предплечье/), 'стремя в предплечье');
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

test('bands: the ankle strap — both ends of the tube clip onto the D-ring of one strap round the left shin', () => {
  for (const { R } of frames(POSES.bandadduct, 11)) {
    const P = id => R.props.find(p => p.id === id), ends = ['band:L', 'band:L2'].map(id => P(id).pts.at(-1));
    const snaps = ['band:L:snap', 'band:L:snap2'].map(P);
    assert(P('band:L:dring') && snaps.every(Boolean), 'D-кольцо и два карабина');
    /* дальний конец карабина — конец ветви ленты; карабины начинаются у вершины одного D-кольца */
    snaps.forEach((s, k) => assert(V.dist(s.pts[8], ends[k]) < .01, `ветвь ${k + 1} — на своём карабине`));
    assert(V.dist(snaps[0].pts[0], snaps[1].pts[0]) < .01, 'оба карабина на одном кольце');
    for (let i = 0; i < 9; i++) for (const q of P('band:L:cuff' + i).pts) assert(Math.abs(M.limbSDF(R, 'sk', 'L', q) - .75) < .3, 'виток манжеты лежит на голени');
  }
});

/* узел torso: лёжа на ленте (жим на полу) — лента поперёк спины под лопатками прижата весом тела; стоя у двери (сведение рук) —
   лента из кольца позади огибает бок корпуса под мышкой со скольжением */
const height = p => M.FLOOR - p[1];
test('bands: lying on the band — under the shoulder blades it lies unloaded on the floor, does not slip, wraps the side of the chest, misses the upper arm and the shoulder blade', () => {
  for (const { R } of frames(POSES.bandfloorpress, 21)) {
    const ps = band(R), b = ps[0].band;
    assert.equal(b.pins.length, 2, 'две опоры — по краям спины');
    assert(b.pins.every(p => p.torso), 'опоры — под спиной');
    assert(!b.pieces[1].loaded && Math.abs(b.pieces[1].lam - 1) < 1e-9, 'кусок под спиной лежит без растяжения');
    /* под спиной лента на полу: центр — на радиус над полом (вдавлена в коврик весом тела) */
    for (const pin of b.pins) assert(Math.abs(height(pin.med) - .5) < 1e-6, 'место схода с пола — на полу');
    /* лопатка: задняя поверхность тела лопатки (16 точек у медиального края и корня ости) выше ленты под спиной */
    for (const s of M.SIDES) {
      const S = R.frames['sp' + s], g = s === 'L' ? 1 : -1;
      const low = Math.min(...M.GIRDLE.back.map(f0 => height(V.add(V.add(V.add(S.o, S.x, -g * f0[0]), S.y, f0[1]), S.z, f0[2]))));
      assert(low > 1.5, `лопатка ${s} над лентой: ${low.toFixed(2)} см над полом`);
    }
    /* плечо: лента мимо (плечо внизу лежит на коврике, лента поднимается от бока корпуса к кисти над ним) */
    for (const p of ps) for (const q of p.pts) for (const s of M.SIDES) assert(M.limbSDF(R, 'ua', s, q) > 0, 'лента мимо плеча');
    /* огибание бока: точки ленты от пола к кисти лежат на дуге вокруг угла корпуса — ни одна не глубже 0,6 см в коже */
    const cache = M.torsoCache(R);
    for (const p of ps) for (let i = 1; i < p.pts.length; i++) for (let k = 0; k <= 8; k++) {
      const q = V.mix(p.pts[i - 1], p.pts[i], k / 8); if (M.SIDES.some(s => V.dist(q, R['grip' + s]) < 9)) continue;
      assert(M.torsoSDF(R, q, cache) > -.6, 'лента не в корпусе');
    }
  }
  const row = auditEntry('bandfloorpress', POSES.bandfloorpress).find(r => r.type === 'лента-модель');
  assert(row.slip.length === 2 && row.slip.every(d => d < 1e-6), 'под спиной лента не скользит: ' + row.slip);
  /* без огибания корпуса (концы на полу под спиной, лента прямо к кистям) — лента сквозь бок корпуса */
  const z = band(frames(POSES.bandfloorpress, 2)[0].R)[0].band.pins[0].med[2];
  const straight = { ...POSES.bandfloorpress, equipment: POSES.bandfloorpress.equipment.map(e => e.type !== 'band' ? e : { ...e, route: [{ handle: 'L' }, { clip: [-7, .5, z], mountTo: 'mat' }, { clip: [7, .5, z], mountTo: 'mat' }, { handle: 'R' }] }) };
  assert(has(auditBand('bandfloorpress', 'band', frames(straight, 11)), /сквозь корпус/), 'прямая лента проходит сквозь корпус');
});

test('bands: at the door (fly) — the band from the ring behind slides round the side of the chest under the arm only when the hands meet in front', () => {
  const fs = frames(POSES.bandfly, 11), L = R => R.props.find(p => p.id === 'band:L').pts;
  /* отход ленты от прямой «кольцо → рукоять» и наименьший зазор до кожи корпуса */
  const off = R => { const P = L(R), a = P[0], u = V.unit(V.sub(P.at(-1), a)); return Math.max(...P.map(q => V.len(V.perp(V.sub(q, a), u)))); };
  const gap = R => { const c = M.torsoCache(R), P = L(R); let m = Infinity; for (let i = 1; i < P.length; i++) for (let k = 0; k <= 20; k++) m = Math.min(m, M.torsoSDF(R, V.mix(P[i - 1], P[i], k / 20), c)); return m; };
  /* в начале (руки разведены) лента идёт прямо и далеко от корпуса; в конце огибает бок: уходит от прямой и лежит на коже */
  assert(off(fs[0].R) < 1 && gap(fs[0].R) > 5, `в начале — прямо: отход ${off(fs[0].R).toFixed(2)}, зазор ${gap(fs[0].R).toFixed(1)}`);
  assert(off(fs[10].R) > 3 && gap(fs[10].R) < 1.5 && gap(fs[10].R) > -1, `в конце — вокруг бока: отход ${off(fs[10].R).toFixed(2)}, зазор ${gap(fs[10].R).toFixed(2)}`);
  for (const { R } of fs) {
    const b = band(R)[0].band;
    assert(b.slide && b.pieces.length === 1 && !b.pins.length, 'в кольце и у бока лента скользит — один кусок');
  }
});
