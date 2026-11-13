'use strict';
/* Виляния по всему каталогу (вид «Манекен»): что дёргается или ходит туда-обратно при плавном движении, насколько и почему.
   node tools/anny-look/jitter.js [all|id,id] [--n 61] [--bake] [--no-skin] [--json файл] [--top 60] [--all-rows]
   Время — как в плеере (12-motion-player.js, motionFrame): повтор 0 → 1 с косинусным разгоном q → t = ½ − ½·cos(πq), на рабочую
   фазу по умолчанию (темп 3-0-1-0) — 1 с, поэтому кадр — 1/60 с этой фазы: N = 61 кадр от t = 0 до 1. Без удержания в концах
   плеер сразу идёт обратно: кадры за концами — зеркальные (P(−1) = P(1)). Замкнутые циклы (loop) — по кругу, 3,2 с на оборот:
   N = 192 кадра, кадры за концами — с другого конца. Упражнения-удержания (одна поза) не меряются. Инвентарь — «всё» и, если
   у упражнения есть варианты позы или необязательный инвентарь, «ничего» (как palms.js).
   Замеры (см, мировые координаты каталога — так смотрит неподвижная камера):
   * сустав — рывок: у головы, основания шеи, таза, плечевых, локтевых, лучезапястных, коленных, голеностопных суставов и центров
     хвата ускорение кадра a(i) = (P(i−1) + P(i+1)) / 2 − P(i) (половина второй разности) и его выброс против соседей через кадр
     |a(i) − (a(i−2) + a(i+2)) / 2|: у плавного движения, даже быстрого (взмах рук 70 см за треть секунды — ускорение до 1 см
     за кадр), ускорение меняется плавно и выброс — сотые доли сантиметра; излом скорости или обрыв ускорения дают выброс.
     Причина — стык ключей позы (кусочная интерполяция углов), конец повтора (разворот без торможения) или середина участка;
   * сустав — обратный ход: путь кадра против направления движения на ±4 кадра (только где сустав за 8 кадров сместился
     больше 0,4 см — естественный разворот туда не попадает), сумма по повтору;
   * кожа — дрожание смещения вершины кожи Anny (как в шейдере: формы, рамка закрутки плеча, опоры, пол) относительно её
     главной рамки, жёстко идущей за костью: вторая разность (P − Pрамки). Кость кожу так не трясёт: это правила кожи. Причина
     в кадре — вторая разность весов форм, снятой закрутки плеча, сила опор, смена режима кисти, прижатие к полу;
   * ладонь на опоре между ключами — зазор ладони (кисть 'flat') до опоры по всем кадрам (palms.js: деталь, пол или тело);
   * хват двумя руками одного жёсткого снаряда — размах расстояния между центрами хвата кулаков (гриф, рукоять, гиря за рога)
     за повтор: на жёстком снаряде оно постоянно, иначе кисти едут по ручке.
   Порог «заметно» (NOTICE) — на телефоне, кадр 1/60 с: рывок сустава 0,3 см (по каталогу: медиана наибольшего рывка упражнения —
   0,08, 75-й процентиль — 0,13; 0,3 — вдвое выше 75-го процентиля), обратный ход 0,3 см, кожа 0,3 см за кадр при костях < 0,1
   (или 0,6 при любых костях; владелец увидел «виляние» плеча в жиме гири одной рукой — 1,54 см за кадр шкалы wobble.js, 121 кадр
   на повтор, на этой шкале — больше; 0,5–0,8 у жимов — исправлено в 4.99), ладонь — 0,5 см над опорой (palms.js, AIR), кулак
   по ручке — 0,5 см (полтолщины пальца: заметно, что кисть сместилась относительно дисков).
   Регресс: tools/jitter.test.js — заметное по каталогу не растёт (fixtures/jitter.json, «только убывают», как folds.json;
   запись — --record). */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), A = require(root + '/src/js/09bs-anny.js');
const CMP = require('./compare.js'), W = require('./wobble.js');
const { V } = M;
const NOTICE = { joint: .3, back: .3, skin: .3, boneQuiet: .1, palm: .5, grip: .5 };
const JOINTS = ['head', 'neckBase', 'hip', 'shL', 'shR', 'elL', 'elR', 'wrL', 'wrR', 'knL', 'knR', 'anL', 'anR', 'gripL', 'gripR'];
const JNAME = { head: 'голова', neckBase: 'основание шеи', hip: 'таз', shL: 'плечо L', shR: 'плечо R', elL: 'локоть L', elR: 'локоть R', wrL: 'запястье L', wrR: 'запястье R',
  knL: 'колено L', knR: 'колено R', anL: 'голеностоп L', anR: 'голеностоп R', gripL: 'хват L', gripR: 'хват R' };
const SKIP_ZONES = new Set(['полость']);
const ease = q => .5 - .5 * Math.cos(Math.PI * q);
/* длительности фаз как в плеере (motionDurations, темп по умолчанию): кадры — 1/60 с самой быстрой половины повтора */
let APP = null;
function appModel() {
  if (APP) return APP;
  const { loadModel } = require(root + '/tools/biomechanics-audit'), m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  return APP = m.get('({EXI,motionDurations})');
}
function durations(id) { const { EXI, motionDurations } = appModel(), ex = EXI[id]; return ex ? { d: motionDurations({ ex, rx: {} }), hold: !!ex.anim.hold } : { d: [1000, 0, 1000, 0], hold: false }; }
/* моменты кадров повтора и индекс соседа за концами */
function timeline(entry, id, n) {
  const { d } = durations(id);
  if (entry.loop) { const N = n || Math.max(24, Math.round(d.reduce((a, b) => a + b, 0) / 1000 * 60)), ts = Array.from({ length: N }, (_, i) => i / N); return { ts, at: i => ((i % N) + N) % N, loop: true, sec: N / 60 }; }
  const half = Math.min(...[d[0], d[2]].filter(x => x > 0)) || 1000, N = n || Math.max(13, Math.round(half / 1000 * 60) + 1), ts = Array.from({ length: N }, (_, i) => ease(i / (N - 1)));
  return { ts, at: i => i < 0 ? -i : i > N - 1 ? 2 * (N - 1) - i : i, loop: false, sec: (N - 1) / 60 };
}
const d2 = (a, b, c) => Math.hypot(b[0] - (a[0] + c[0]) / 2, b[1] - (a[1] + c[1]) / 2, b[2] - (a[2] + c[2]) / 2);
/* ближайший ключ позы к моменту t */
function nearKey(entry, t) { let best = null; for (const k of entry.keys || []) { const kt = k.t ?? k[0] ?? k; if (typeof kt !== 'number') continue; if (!best || Math.abs(kt - t) < Math.abs(best - t)) best = kt; } return best; }
/* ручка в кулаке: деталь снаряда из контакта кисти (балка, цилиндр, гриф — не трос, канат, лента, полотенце), ближайшая к центру
   хвата в первом кадре, где кисть держит; положение центра хвата вдоль её оси — по кадрам */
const SOFT = /cable|rope|band|towel/;
function handleOf(entry, R, s) {
  const k = (entry.contacts || []).find(c => c.body === 'grip' + s && !c.when); if (!k) return null;
  const parts = (R.props || []).filter(p => (p.id === k.prop || p.id?.startsWith(k.prop + ':')) && !SOFT.test(p.tone || '') && !p.cable && ((p.a && p.b) || (p.c && p.axis)));
  let best = null;
  for (const p of parts) { const ax = axisOf(p), dd = V.len(V.perp(V.sub(R['grip' + s], ax.o), ax.u)); if (!best || dd < best.dd) best = { id: p.id, dd }; }
  return best && best.dd < 4 ? best.id : null;
}
function axisOf(p) { return p.a && p.b ? { o: p.a, u: V.unit(V.sub(p.b, p.a)) } : { o: p.c, u: V.unit(p.axis) }; }
function measure(id, entry, { d, zones, n, skin = true, has, hn }) {
  if (durations(id).hold) return null;
  const rig = EQ.rig(entry), T = timeline(entry, id, n), N = T.ts.length;
  const Rs = T.ts.map(t => rig(t));
  /* удержание — одна поза */
  if (JOINTS.every(k => Rs.every(R => !R[k] || V.dist(R[k], Rs[0][k]) < 1e-6))) return null;
  const P = k => i => Rs[T.at(i)][k];
  const out = { id, has: hn, loop: T.loop, n: N, joints: [], skin: null, palms: [], grip: null };
  /* суставы: дрожание и обратный ход */
  for (const k of JOINTS) {
    if (!Rs[0][k]) continue;
    const p = P(k); let best = { j: 0, i: 0 }, acc = 0, back = 0, backMax = 0, run = 0;
    /* ускорение кадра (половина второй разности, вектор) и рывок — его выброс против соседей через кадр: у плавного движения
       ускорение меняется плавно (даже у быстрого), у излома скорости или обрыва ускорения — выброс */
    const a2 = i => { const x = p(i - 1), y = p(i), z = p(i + 1); return [(x[0] + z[0]) / 2 - y[0], (x[1] + z[1]) / 2 - y[1], (x[2] + z[2]) / 2 - y[2]]; };
    for (let i = 0; i < N; i++) {
      acc = Math.max(acc, V.len(a2(i)));
      const u0 = a2(i - 2), u1 = a2(i), u2 = a2(i + 2), j = Math.hypot(u1[0] - (u0[0] + u2[0]) / 2, u1[1] - (u0[1] + u2[1]) / 2, u1[2] - (u0[2] + u2[2]) / 2);
      if (j > best.j) best = { j, i };
      const u = V.sub(p(i + 4), p(i - 4)), L = V.len(u);
      if (L > .4) { const s = V.dot(V.sub(p(i + 1), p(i)), V.scale(u, 1 / L)); if (s < 0) { back -= s; run -= s; backMax = Math.max(backMax, run); } else run = 0; } else run = 0;
    }
    const t = T.ts[best.i], key = nearKey(entry, t), dt = T.loop ? 1 / N : Math.max(T.ts[Math.min(N - 1, best.i + 1)] - T.ts[best.i], T.ts[best.i] - T.ts[Math.max(0, best.i - 1)]);
    const end = !T.loop && (best.i === 0 || best.i === N - 1);
    const cause = end ? 'конец повтора: скорость в ' + (best.i === 0 ? 't = 0' : 't = 1') + ' не нулевая' : key != null && Math.abs(key - t) <= dt * 1.01 ? `стык ключей (t = ${+key.toFixed(4)})` : 'внутри участка между ключами';
    out.joints.push({ k, jit: best.j, acc, t, cause, back, backRun: backMax });
  }
  /* кулак едет по ручке: размах положения центра хвата вдоль оси ручки (у жёсткой ручки кисть стоит на месте) */
  out.grip = [];
  for (const s of M.SIDES) {
    const i0 = Rs.findIndex(R => /^(grip|deep)$/.test(R.hands?.[s] || '')); if (i0 < 0) continue;
    const hid = handleOf(entry, Rs[i0], s); if (!hid) continue;
    let lo = Infinity, hi = -Infinity, off = 0;
    for (const R of Rs) { if (!/^(grip|deep)$/.test(R.hands?.[s] || '')) continue; const p = (R.props || []).find(q => q.id === hid); if (!p) continue; const ax = axisOf(p), x = V.dot(V.sub(R['grip' + s], ax.o), ax.u); lo = Math.min(lo, x); hi = Math.max(hi, x); off = Math.max(off, V.len(V.perp(V.sub(R['grip' + s], ax.o), ax.u))); }
    if (hi > lo) out.grip.push({ side: s, prop: hid, range: hi - lo, off });
  }
  /* ладони на опоре по всем кадрам */
  const flatSides = M.SIDES.filter(s => Rs.some(R => R.hands?.[s] === 'flat'));
  /* кожа: смещение вершины относительно жёсткой главной рамки */
  if (skin) {
    const props = R => (R.props || []).filter(p => EQ.visible(p, has));
    const off = new Array(3), info = new Array(3);
    const frameOf = i => {
      const R = Rs[T.at(i)], S = A.skinMats(R, d), Q = A.skin(R, { d, props: props(R), mats: { S, DQ: A.dualQuats(S, d.frames.length) } }), o = new Float32Array(d.nv * 3);
      for (let v = 0; v < d.nv; v++) {
        const f = d.wi[v * 4] * 12, x = d.pos[v * 3], y = d.pos[v * 3 + 1], z = d.pos[v * 3 + 2];
        o[v * 3] = Q[v * 3] - (S[f] * x + S[f + 1] * y + S[f + 2] * z + S[f + 3]);
        o[v * 3 + 1] = Q[v * 3 + 1] - (S[f + 4] * x + S[f + 5] * y + S[f + 6] * z + S[f + 7]);
        o[v * 3 + 2] = Q[v * 3 + 2] - (S[f + 8] * x + S[f + 9] * y + S[f + 10] * z + S[f + 11]);
      }
      const cw = A.correctiveWeights(R, d), sup = A.supports(R, d, props(R), cw);
      const floorV = new Uint8Array(0);
      return { o, Q, cw, roll: { L: W.rollOffOf(R, 'L'), R: W.rollOffOf(R, 'R') }, sup: sup.list.map(s => s.body + '>' + s.prop + ':' + s.gap.toFixed(2)), supN: sup.n, supS: Array.from({ length: sup.n }, (_, k) => sup.u[k * A.SUP.LEN + 19]), hands: { ...R.hands }, floorV };
    };
    /* по три кадра подряд */
    let a = frameOf(-1), b = frameOf(0), best = { j: 0, v: -1, i: 0 }, zoneMax = {};
    for (let i = 0; i < N; i++) {
      const c = frameOf(i + 1);
      for (let v = 0; v < d.nv; v++) {
        const z = zones[v]; if (SKIP_ZONES.has(z)) continue;
        const j = Math.hypot(b.o[v * 3] - (a.o[v * 3] + c.o[v * 3]) / 2, b.o[v * 3 + 1] - (a.o[v * 3 + 1] + c.o[v * 3 + 1]) / 2, b.o[v * 3 + 2] - (a.o[v * 3 + 2] + c.o[v * 3 + 2]) / 2);
        if (j > (zoneMax[z]?.j || 0)) zoneMax[z] = { j, i, v };
        if (j > best.j) best = { j, v, i, A: a, B: b, C: c };
      }
      a = b; b = c;
    }
    if (best.v >= 0) {
      const { A: fa, B: fb, C: fc } = best, v = best.v, fr = d.frames[d.wi[v * 4]];
      const dd = (x, y, z) => Math.abs(y - (x + z) / 2);
      let shape = { w: 0, k: -1 }; fb.cw.forEach((w, k) => { const x = dd(fa.cw[k], w, fc.cw[k]); if (x > shape.w) shape = { w: x, k }; });
      const roll = Math.max(...M.SIDES.map(s => dd(fa.roll[s], fb.roll[s], fc.roll[s])));
      const supJ = Math.max(0, ...fb.supS.map((s, k) => dd(fa.supS[k] ?? 0, s, fc.supS[k] ?? 0)), fa.supN !== fb.supN || fb.supN !== fc.supN ? 1 : 0);
      const handSwitch = M.SIDES.filter(s => fa.hands[s] !== fb.hands[s] || fb.hands[s] !== fc.hands[s]).map(s => `${s}: ${fa.hands[s]} → ${fc.hands[s]}`);
      const atFloor = [fa, fb, fc].some(f => f.Q[v * 3 + 1] >= M.FLOOR - 1e-4);
      const boneJ = Math.max(...out.joints.filter(x => Math.abs(x.t - T.ts[best.i]) < .05).map(x => x.jit), 0);
      const causes = [];
      if (handSwitch.length) causes.push('смена режима кисти ' + handSwitch.join(', '));
      if (shape.w > .02) causes.push(`вес формы ${d.correctives[shape.k].name || d.correctives[shape.k].angle} Δ² ${shape.w.toFixed(3)}`);
      if (roll > .5) causes.push(`снятая закрутка плеча Δ² ${roll.toFixed(1)}°`);
      if (supJ > .02) causes.push(`опора ${fb.sup.join(', ') || '—'} (сила Δ² ${supJ.toFixed(2)})`);
      if (atFloor) causes.push('прижатие к полу');
      out.skin = { jit: best.j, t: T.ts[best.i], zone: zones[v], frame: fr, v, bone: boneJ, cause: causes.join('; ') || 'смешение рамок (кость дрожит: ' + boneJ.toFixed(3) + ')',
        zones: Object.fromEntries(Object.entries(zoneMax).map(([z, x]) => [z, +x.j.toFixed(3)])) };
    }
  }
  /* ладонь, которая должна лежать на опоре: заявлен контакт ладони в этот момент или в ближайших ключах слева и справа она
     лежит (зазор ≤ порога) — между ключами она не должна подниматься; раскрытая кисть в переносе (ключи в воздухе) — не опора */
  if (flatSides.length) {
    const P2 = require('./palms.js'), gapAt = (R, s) => { const Q = A.skin(R, { d, floor: false, props: (R.props || []).filter(p => EQ.visible(p, has)) }); return P2.palmOf(R, Q, P2.vertexNormals(d, Q), d, s, entry, has); };
    const keyTs = (entry.keys || []).map(k => k.t).filter(t => typeof t === 'number').sort((a, b) => a - b);
    for (const s of flatSides) {
      const keyGap = new Map(keyTs.map(t => { const R = rig(t); return [t, R.hands?.[s] === 'flat' ? gapAt(R, s).gap : Infinity]; }));
      const declared = t => (entry.contacts || []).some(c => c.body === 'palm' + s && (!c.when || (t >= c.when[0] - 1e-6 && t <= c.when[1] + 1e-6)));
      let worst = null;
      for (let i = 0; i < N; i++) {
        const R = Rs[i], t = T.ts[i]; if (R.hands?.[s] !== 'flat') continue;
        const k0 = [...keyTs].reverse().find(k => k <= t + 1e-9), k1 = keyTs.find(k => k >= t - 1e-9);
        const onKeys = k0 != null && k1 != null && keyGap.get(k0) <= NOTICE.palm && keyGap.get(k1) <= NOTICE.palm;
        if (!declared(t) && !onKeys) continue;
        const o = gapAt(R, s);
        if (!worst || o.gap > worst.gap) worst = { side: s, gap: o.gap, t, on: o.on === 'тело' ? 'тело ' + o.bodyFrame : o.on, declared: declared(t), keys: [k0, k1].map(k => keyGap.get(k)) };
      }
      if (worst) out.palms.push(worst);
    }
  }
  return out;
}
function run({ ids = null, n = null, skin = true, d = CMP.loadAnny(), POSES = CMP.loadPoses(), log = () => {} } = {}) {
  const zones = CMP.zonesOf(d), rows = [];
  for (const id of ids || Object.keys(POSES)) {
    if (!POSES[id] || id.startsWith('_')) continue;
    for (const [hn, has] of [['всё', () => true], ['ничего', () => false]]) {
      const e = EQ.variantEntry(POSES[id], has);
      if (hn === 'ничего' && e === EQ.variantEntry(POSES[id], () => true) && !(e.equipment || []).some(q => q.optional || q.optionalNot)) continue;
      const r = measure(id, e, { d, zones, n, skin, has, hn }); if (r) rows.push(r);
    }
    log(id);
  }
  return rows;
}
/* строки таблицы «упражнение — что — величина — причина», по убыванию запаса над порогом */
function table(rows, { all = false } = {}) {
  const out = [];
  for (const r of rows) {
    const tag = r.id + (r.has === 'ничего' ? ' (без доп. инвентаря)' : '');
    for (const j of r.joints) {
      if (all || j.jit >= NOTICE.joint) out.push({ id: r.id, has: r.has, tag, what: `${JNAME[j.k]}: рывок`, val: j.jit, lim: NOTICE.joint, t: j.t, cause: j.cause });
      if (all || j.backRun >= NOTICE.back) out.push({ id: r.id, has: r.has, tag, what: `${JNAME[j.k]}: туда-обратно`, val: j.backRun, lim: NOTICE.back, t: j.t, cause: `обратный ход за повтор ${j.back.toFixed(2)} см` });
    }
    if (r.skin && (all || (r.skin.jit >= NOTICE.skin && r.skin.bone < NOTICE.boneQuiet) || r.skin.jit >= 2 * NOTICE.skin))
      out.push({ id: r.id, has: r.has, tag, what: `кожа (${r.skin.zone}): дрожание`, val: r.skin.jit, lim: NOTICE.skin, t: r.skin.t, cause: r.skin.cause + ` (кости ${r.skin.bone.toFixed(2)})` });
    for (const p of r.palms) if (all || p.gap > NOTICE.palm) out.push({ id: r.id, has: r.has, tag, what: `ладонь ${p.side}: над опорой`, val: p.gap, lim: NOTICE.palm, t: p.t, cause: `зазор до опоры (${p.on}); ${p.declared ? 'контакт заявлен' : 'в ключах лежит'}, в ключах ${p.keys.map(x => x == null || !isFinite(x) ? '—' : x.toFixed(2)).join(' и ')} см` });
    for (const g of r.grip || []) if (all || g.range > NOTICE.grip) out.push({ id: r.id, has: r.has, tag, what: `кулак ${g.side} едет по ручке (${g.prop})`, val: g.range, lim: NOTICE.grip, t: null, cause: `центр хвата ходит вдоль оси ручки; до оси — до ${g.off.toFixed(1)} см` });
  }
  return out.sort((a, b) => b.val / b.lim - a.val / a.lim);
}
/* ключ строки таблицы и запись/сверка с fixtures/jitter.json: заметное не растёт (допуск FIX_TOL), нового заметного нет */
const FIX_FILE = path.join(__dirname, 'fixtures/jitter.json'), FIX_TOL = .02;
const rowKey = x => `${x.id}|${x.has}|${x.what}`;
function record(rows) { const out = {}; for (const x of table(rows)) out[rowKey(x)] = +x.val.toFixed(3); return out; }
function regressions(rows, fix = JSON.parse(fs.readFileSync(FIX_FILE, 'utf8')), { skin = true } = {}) {
  const bad = [];
  for (const x of table(rows)) {
    if (!skin && /^кожа/.test(x.what)) continue;
    const k = rowKey(x), was = fix[k];
    if (was == null) bad.push(`${k}: ${x.val.toFixed(2)} см — новое заметное (порог ${x.lim}; ${x.cause})`);
    else if (x.val > was + FIX_TOL) bad.push(`${k}: ${x.val.toFixed(2)} см при записанных ${was} (${x.cause})`);
  }
  return bad;
}
const fmt = x => `${x.tag.padEnd(34)} ${x.what.padEnd(34)} ${x.val.toFixed(2).padStart(6)} см (порог ${x.lim})${x.t != null ? ` t=${x.t.toFixed(3)}` : ''} | ${x.cause}`;
module.exports = { NOTICE, JOINTS, timeline, durations, measure, run, table, fmt, record, regressions, rowKey, FIX_FILE, FIX_TOL };
if (require.main === module) {
  const arg = (k, def) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : def; };
  const ids = process.argv[2] && process.argv[2] !== 'all' && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : null;
  const POSES = process.argv.includes('--bake') ? { ...CMP.loadPoses(), ...require(root + '/tools/mannequin/author.js').bakeAll({ only: ids }) } : CMP.loadPoses();
  const rows = run({ ids, n: arg('--n') ? +arg('--n') : null, skin: !process.argv.includes('--no-skin'), POSES, log: process.argv.includes('--quiet') ? () => {} : () => process.stderr.write('.') });
  process.stderr.write('\n');
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows));
  /* --record — записать заметное в fixtures/jitter.json (только после правок, где числа убыли); --check — сверить */
  if (process.argv.includes('--record')) { fs.writeFileSync(FIX_FILE, JSON.stringify(record(rows), null, 1) + '\n'); console.log('записано: ' + FIX_FILE); }
  if (process.argv.includes('--check')) { const bad = regressions(rows, undefined, { skin: !process.argv.includes('--no-skin') }); for (const b of bad) console.log('РЕГРЕСС ' + b); if (bad.length) process.exitCode = 1; }
  const t = table(rows, { all: process.argv.includes('--all-rows') });
  for (const x of t.slice(0, +arg('--top', 60))) console.log(fmt(x));
  console.log(`упражнений-вариантов: ${rows.length}; заметного: ${table(rows).length}`);
}
