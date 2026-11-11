'use strict';
/* Пальцы кожи Anny по хвату: таблица поз для приложения (AnnySkin.digitPose). Шаг сборки между build.py и pack.js:
   node tools/anny-look/hands.js [qa/anny-look/anny.json] — дописывает в него hands[s].grip (строка на радиус ручки RADII),
   hands[s].fist, hands[s].flat (большой палец ладони на опоре) и hands[s].deep (глубокий хват гири, M.B.deep). Сборка детерминирована (перебор по сетке, без случайности): тот же вход — те же числа.

   Риг пальцев — Anny (build.py digit_rig: суставы и оси костей в рамке кисти стойки); поворот фаланги — вокруг оси сгибания её
   сустава (AnnySkin.digitRig), углы — в пределах суставов (AnnySkin.DIG.lim, источники — там же). Ручка — как у процедурной
   кисти (M.handShape 'grip'): цилиндр радиуса r вдоль оси z кисти через центр хвата B.grip (holds-audit проверяет, что ручка
   снаряда там и есть: ось — в 2 см от центра хвата, под углом до 30° к оси кулака). Препятствия — ручка, ладонь Anny (высота
   ладонной поверхности над сеткой 0,5 см, от запястья до линии в 1,5 см перед пястно-фаланговыми суставами) и для большого
   пальца — фаланги указательного, среднего и безымянного (капсулы по кости, радиус — медиана расстояния кожи до кости).
   Точки кожи фаланги — вершины, у которых она главная рамка (до 24; ладонная сторона — до 16, «подушечки»).

   Палец (хват): перебор углов трёх суставов (шаг 6°, затем 1,5° вокруг лучшего); стоимость фаланги — проникание глубже
   PRESS в ручку или ладонь (×100, квадрат) плюс средний квадрат зазора подушечек до ручки или ладони: фаланги ложатся на
   ручку, кончики — на неё или на ладонь. Кулак: без ручки, к углам FIST (МФС около 90°, ПМФС около 100°, ДМФС — пока
   кончик не встанет на ладонь), проникание в ладонь — так же.
   Большой палец: направление пясти — конус до 80° вокруг стойки (шаг 10° и 15°, уточнение 3° и 4,5°), разворот — ось
   сгибания вдоль ручки, ладонной стороной к ней; сгибание пястно-фалангового и межфалангового суставов (шаг 10°, уточнение
   2°). Стоимость — проникание в ручку, ладонь и пальцы, зазор подушечек основной и концевой фаланг до ручки или пальцев, и
   расстояние центра подушечки концевой фаланги до цели: снаружи средних фаланг указательного и среднего пальцев (кольцо
   замыкается поверх пальцев, как в силовом хвате, Napier 1956), плюс слабая тяга к меньшему повороту пясти. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), A = require(root + '/src/js/09bs-anny.js');
const { V } = M, { R3, flexRot } = A._digit, CK = require('./check.js');
const RADII = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4];
const PRESS = .25;            // см: мякоть подушечки сминается на 2–3 мм (кожа уходит в ручку не глубже)
const TRUE_PRESS = .3;        // см: то же по всем вершинам пальца после скиннинга (проверка tools/anny-look/holds.js — 0,5)
const FIST = [88, 100, 75];
const THUMB_GAPS = [0, .2, .4, .6, .8];   // см: зазоры большого пальца до пальцев и ладони, из которых выбирается по складкам
const W_PREV = .2, W_COUPLE = .5, COUPLE = 2 / 3;   // тяга к соседней строке таблицы и сцепление ДМФС с ПМФС
const ALPHA = 80;            // °: конус направлений пясти большого пальца вокруг стойки (перебор); анатомический предел — ниже
/* концевая фаланга большого пальца — поперёк средних фаланг пальцев, к локтевой стороне (не меньше 30° от направления пальцев),
   как в силовом хвате (Napier 1956): вдоль пальцев она торчит кончиком из кулака */
const W_ULNAR = 4, ULNAR = .5, ROLLS = [-50, -25, 0, 25, 50];   // ° разворота пясти вокруг её оси (перебор)
const TIP_REACH = 2.8;       // см: кончик большого пальца от поверхности ручки (проверка holds.js — 3,2)
const PALMAR_ABD = 70;       // °: ладонное отведение пясти большого пальца (угол с плоскостью ладони) — не больше (AAOS 1965: 0–70°)
const sq = x => x * x, INF = Infinity;

/* данные из anny.json (вход pack.js) — те же числа, что даёт AnnySkin.decode */
function fromJson(src) { return { nv: src.v.length / 3, nf: src.f.length / 3, pos: Float32Array.from(src.v), idx: Uint32Array.from(src.f), wi: Uint8Array.from(src.wi), ww: Float32Array.from(src.ww, x => x / 255), frames: src.frames, hands: src.hands }; }

/* точки кожи фаланг (относительно своего сустава) и ладонь — в координатах рамки кисти стойки */
function meshRig(d, s) {
  const rig = A.digitRig(d, s), g = rig.g, hf = M.catalogPose(M.neutral()).frames['hand' + s];
  const loc = v => { const t = [d.pos[v * 3] - hf.o[0], d.pos[v * 3 + 1] - hf.o[1], d.pos[v * 3 + 2] - hf.o[2]]; return [V.dot(t, hf.x), V.dot(t, hf.y), V.dot(t, hf.z)]; };
  const seg = {}, palm = [], verts = [], vdigit = [];
  for (let v = 0; v < d.nv; v++) {
    let b = 0; for (let k = 1; k < 4; k++) if (d.ww[v * 4 + k] > d.ww[v * 4 + b]) b = k;
    const n = d.frames[d.wi[v * 4 + b]]; if (!n.endsWith(s)) continue;
    if (/^f\d\d/.test(n)) { (seg[n] || (seg[n] = [])).push(loc(v)); verts.push(v); vdigit.push(+n[1]); }
    else if (n === 'hand' + s && d.ww[v * 4 + b] > .8) palm.push(loc(v));
  }
  const pick = (a, n) => a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor(i * a.length / n)]);
  const segs = rig.digits.map((dg, f) => dg.segs.map((sg, k) => {
    const all = (seg[`f${f}${k}${s}`] || []).map(p => V.sub(p, dg.j[k]));
    const rad = all.map(p => V.len(V.perp(p, sg.y))).sort((a, b) => a - b);
    return { all: pick(all, 24), pad: pick(all.filter(p => V.dot(p, sg.z) > 0), 16), rho: rad.length ? rad[rad.length >> 1] : .8, rmax: rad.length ? rad[Math.floor(rad.length * .9)] : 1 };
  }));
  const field = new Map(), key = (v, w) => Math.round(v * 2) + ',' + Math.round(w * 2);
  for (const p of palm) { const u = -g * p[0], k = key(-p[1], p[2]), c = field.get(k); if (!c) field.set(k, [u, u]); else { c[0] = Math.max(c[0], u); c[1] = Math.min(c[1], u); } }
  const vEnd = Math.min(...rig.digits.slice(1).map(dg => -dg.j[0][1])) - 1.5;
  const sdPalm = p => { const v = -p[1]; if (v < 1 || v > vEnd) return INF; const c = field.get(key(v, p[2])); if (!c) return INF; const u = -g * p[0]; return u < c[1] - .5 ? INF : u - c[0]; };
  return { rig, segs, sdPalm, g, s, verts, vdigit };
}
const step = (P, dg, k, R) => k ? { Q: R3.mul(P.Q, R), o: V.add(P.o, R3.ap(P.Q, V.sub(dg.j[k], dg.j[k - 1]))) } : { Q: R, o: dg.j[0] };
const at = (T, q) => V.add(T.o, R3.ap(T.Q, q));
const range = (a, b, st) => { const o = []; for (let x = a; x <= b + 1e-9; x += st) o.push(+x.toFixed(6)); return o; };
/* расстояние до оси ручки: вдоль z кисти через центр хвата (bar.a нет) или вдоль bar.a (глубокий хват гири, M.B.deep) */
const barDist = (bar, p) => bar.a ? V.len(V.perp(V.sub(p, bar.c), bar.a)) : Math.hypot(p[0] - bar.c[0], p[1] - bar.c[1]);
const barSd = bar => bar ? bar.sd || (p => barDist(bar, p) - bar.r) : () => INF;
/* ручка режима: grip — радиуса r вдоль z через центр хвата; deep — радиуса r вдоль M.B.deep.a через M.B.deep.c */
const barOf = (mr, mode, r) => mode === 'grip' ? { c: mr.rig.grip, r } : mode === 'deep' ? { c: [-mr.g * M.B.deep.c[0], M.B.deep.c[1], M.B.deep.c[2]], a: V.unit(M.B.deep.a), r } : null;

/* палец f = 1…4: углы [МФС, ПМФС, ДМФС] */
function solveFinger(mr, f, bar, press = PRESS, prev = null, lim = A.DIG.lim.finger) {
  const dg = mr.rig.digits[f], S = mr.segs[f], sdBar = barSd(bar);
  const cost = (T, k, t) => {
    const sg = S[k]; let mb = INF, mp = INF;
    for (const q of sg.all) { const p = at(T, q), b = sdBar(p); if (b < mb) mb = b; if (k) { const v = mr.sdPalm(p); if (v < mp) mp = v; } }
    let c = 100 * (sq(Math.max(0, -mb - press)) + sq(Math.max(0, -mp - PRESS)));
    if (bar) { let gs = 0; for (const q of sg.pad) { const p = at(T, q); gs += sq(Math.max(0, Math.min(sdBar(p), k ? mr.sdPalm(p) : INF))); } c += sg.pad.length ? gs / sg.pad.length : 0; }
    else c += sq((t - FIST[k]) / 20);
    if (prev) c += W_PREV * sq((t - prev[k]) / 20);
    return c;
  };
  /* сцепление межфаланговых суставов: ДМФС ≈ 2/3 ПМФС (Rijpkema, Girard 1991) — слабо, только выбирает среди равных */
  const couple = (t1, t2) => W_COUPLE * sq((t2 - COUPLE * t1) / 30);
  let best = null;
  const search = (lo, hi, st) => {
    const vals = k => range(Math.max(lim[k][0], lo[k]), Math.min(lim[k][1], hi[k]), st);
    for (const t0 of vals(0)) {
      const T0 = step(null, dg, 0, flexRot(dg, 0, t0)), c0 = cost(T0, 0, t0); if (best && c0 >= best.c) continue;
      for (const t1 of vals(1)) {
        const T1 = step(T0, dg, 1, flexRot(dg, 1, t1)), c1 = c0 + cost(T1, 1, t1); if (best && c1 >= best.c) continue;
        for (const t2 of vals(2)) { const c = c1 + cost(step(T1, dg, 2, flexRot(dg, 2, t2)), 2, t2) + couple(t1, t2); if (!best || c < best.c) best = { c, t: [t0, t1, t2] }; }
      }
    }
  };
  search([0, 0, 0], [999, 999, 999], 6);
  const t = best.t; search(t.map(x => x - 6), t.map(x => x + 6), 1.5);
  return best;
}

/* большой палец: поворот пясти R0 и углы [пястно-фаланговый, межфаланговый]; fingers — позы пальцев 1…4 (цепочки) */
function solveThumb(mr, bar, fingers, press = PRESS, prev = null, gapF = 0) {
  const rig = mr.rig, dg = rig.digits[0], S = mr.segs[0], lim = A.DIG.lim.thumb, j0 = dg.j[0], y0 = dg.segs[0].y, a0 = dg.segs[0].a;
  const caps = [];
  for (let i = 0; i < 3; i++) { const fd = rig.digits[i + 1], T = fingers[i]; for (let k = 0; k < 3; k++) caps.push({ A: T[k].o, B: k < 2 ? T[k + 1].o : at(T[2], V.add(V.sub(fd.j[3], fd.j[2]), fd.segs[2].y, -mr.segs[i + 1][2].rho)), r: mr.segs[i + 1][k].rmax + gapF }); }
  /* промежутки между соседними пальцами (указательный — средний — безымянный) по средним и концевым фалангам — тоже препятствие:
     пальцы Anny в кулаке стоят на 2–3 см друг от друга, и большой палец уходил в щель между ними, торча из неё кончиком */
  for (let i = 0; i < 2; i++) for (let k = 1; k < 3; k++) { const a = caps[i * 3 + k], b = caps[(i + 1) * 3 + k]; caps.push({ A: V.mix(a.A, a.B, .5), B: V.mix(b.A, b.B, .5), r: Math.min(a.r, b.r) }); }
  const segD = (p, A_, B) => { const ab = V.sub(B, A_), l2 = V.dot(ab, ab), k = l2 < 1e-9 ? 0 : Math.max(0, Math.min(1, V.dot(V.sub(p, A_), ab) / l2)); return V.dist(p, V.add(A_, ab, k)); };
  const sdFing = p => { let m = INF; for (const c of caps) { const v = segD(p, c.A, c.B) - c.r; if (v < m) m = v; } return m; };
  const sdBar = barSd(bar), center = bar ? bar.c : rig.grip, barAx = bar?.a || [0, 0, 1];
  /* цель — снаружи средних фаланг указательного и среднего (ближе к указательному и к их дистальным суставам), на толщину
     фаланги и большого пальца по тыльной нормали фаланги; кончик большого — не дальше линии проксимальных межфаланговых
     суставов (дальний край кулака): иначе он торчит из кулака */
  const mid = i => V.mix(fingers[i][1].o, fingers[i][2].o, .6), m = V.mix(mid(0), mid(1), .35);
  const back = i => V.scale(R3.ap(fingers[i][1].Q, rig.digits[i + 1].segs[1].z), -1), out = V.unit(V.mix(back(0), back(1), .35));
  const target = V.add(m, out, mr.segs[1][1].rho + S[2].rho), edge = Math.max(...fingers.map(T => -T[1].o[1]));
  const tipQ = S[2].all.reduce((b, q) => V.dot(q, dg.segs[2].y) > V.dot(b, dg.segs[2].y) ? q : b, S[2].all[0]);
  const e1 = V.unit(V.perp(a0, y0)), e2 = V.cross(y0, e1), L0 = V.dist(dg.j[1], j0);
  const aim = (al, be, ro = 0) => {
    const dir = V.add(V.scale(y0, Math.cos(al * Math.PI / 180)), V.add(V.scale(e1, Math.cos(be * Math.PI / 180)), e2, Math.sin(be * Math.PI / 180)), Math.sin(al * Math.PI / 180));
    /* ось сгибания — вдоль ручки (z кисти без составляющей вдоль пясти); знак — ладонной стороной (a × y) к оси ручки */
    let x = V.unit(V.perp(barAx, dir)); const mcp = V.add(j0, dir, L0);
    if (V.dot(V.cross(x, dir), V.perp(V.sub(center, mcp), barAx)) < 0) x = V.scale(x, -1);
    /* разворот вокруг пясти на ro: ось сгибания наискось к ручке — палец ложится поперёк пальцев, а не в плоскости кольца */
    if (ro) x = R3.ap(R3.axis(dir, ro * Math.PI / 180), x);
    return R3.frame(y0, a0, dir, x);
  };
  const segCost = (T, k) => {
    const sg = S[k]; let mb = INF, mf = INF, mp = INF;
    for (const q of sg.all) { const p = at(T, q), b = sdBar(p), f = sdFing(p); if (b < mb) mb = b; if (f < mf) mf = f; if (k) { const v = mr.sdPalm(p) - gapF; if (v < mp) mp = v; } }
    let c = 100 * (sq(Math.max(0, -mb - press)) + sq(Math.max(0, -mf - PRESS)) + sq(Math.max(0, -mp - PRESS)));
    if (k && sg.pad.length) { let gs = 0; for (const q of sg.pad) { const p = at(T, q); gs += sq(Math.max(0, Math.min(sdBar(p), sdFing(p)))); } c += gs / sg.pad.length; }
    return c;
  };
  const padCenter = T => { let c = [0, 0, 0]; for (const q of S[2].pad) c = V.add(c, at(T, q), 1 / S[2].pad.length); return c; };
  /* кончик большого пальца — середина дальней трети концевой фаланги (как в holds.js); не дальше TIP_REACH от поверхности
     ручки: лежит на пальцах, а не торчит из кулака */
  const L2 = V.dot(V.sub(dg.j[3], dg.j[2]), dg.segs[2].y), tipPts = S[2].all.filter(q => V.dot(q, dg.segs[2].y) > .67 * L2);
  const tipGap = T => { if (!bar || !tipPts.length) return 0; let c = [0, 0, 0]; for (const q of tipPts) c = V.add(c, at(T, q), 1 / tipPts.length); return barDist(bar, c) - bar.r; };
  let best = null;
  const search = (als, bes, t1s, t2s, ros) => {
    for (const al of als) for (const be of (al ? bes : [0])) for (const ro of ros) {
      const R0 = aim(al, be, ro), T0 = step(null, dg, 0, R0), dir = R3.ap(R0, y0);
      if (Math.asin(Math.max(-1, Math.min(1, -rig.g * dir[0]))) * 180 / Math.PI > PALMAR_ABD) continue;
      const c0 = segCost(T0, 0) + .002 * al + (prev ? W_PREV * sq(V.angle(dir, prev.dir) / 20) : 0); if (best && c0 >= best.c) continue;
      for (const t1 of t1s) {
        const T1 = step(T0, dg, 1, flexRot(dg, 1, t1)), c1 = c0 + segCost(T1, 1) + (prev ? W_PREV * sq((t1 - prev.t[0]) / 20) : 0); if (best && c1 >= best.c) continue;
        for (const t2 of t2s) {
          const T2 = step(T1, dg, 2, flexRot(dg, 2, t2)), pc = padCenter(T2), tip = at(T2, tipQ);
          const c = c1 + segCost(T2, 2) + .3 * V.dot(V.sub(pc, target), V.sub(pc, target)) + 2 * sq(Math.max(0, -tip[1] - edge)) + 10 * sq(Math.max(0, tipGap(T2) - TIP_REACH)) + W_ULNAR * sq(Math.max(0, V.unit(V.sub(tip, T2.o))[2] + ULNAR)) + (prev ? W_PREV * sq((t2 - prev.t[1]) / 20) : 0);
          if (!best || c < best.c) best = { c, al, be, ro, t: [t1, t2], R0, dir, miss: V.dist(pc, target) };
        }
      }
    }
  };
  search(range(0, ALPHA, 10), range(0, 330, 30), range(lim[1][0], lim[1][1], 10), range(lim[2][0], lim[2][1], 10), ROLLS);
  const b = best, cl = (x, k) => Math.max(lim[k][0], Math.min(lim[k][1], x));
  search(range(Math.max(0, b.al - 6), Math.min(ALPHA, b.al + 6), 3), range(b.be - 15, b.be + 15, 7.5), range(cl(b.t[0] - 6, 1), cl(b.t[0] + 6, 1), 2), range(cl(b.t[1] - 6, 2), cl(b.t[1] + 6, 2), 2), [b.ro - 8, b.ro, b.ro + 8]);
  return { ...best, target };
}

/* строка таблицы: углы пальцев и большого (округлены — так они лягут в файл) */
const r2 = x => Math.round(x * 100) / 100, r5 = x => Math.round(x * 1e5) / 1e5;
function solveHand(mr, mode, r, d = null, prev = null) {
  const bar = barOf(mr, mode, r), clr = [0, 0, 0, 0, 0], bindThumb = { q: [0, 0, 0, 1], t: mr.rig.digits[0].bind.slice(1).map(r2) };
  /* пальцы: подбор, затем проверка настоящим скиннингом (двойные кватернионы, веса у суставов): точки решения — не все
     вершины, и кожа у сгибов смешивается соседними фалангами; где кожа пальца ушла в ручку глубже TRUE_PRESS — палец ставится
     с запасом на недостачу и подбирается заново */
  let f = null;
  for (let it = 0; it < 6; it++) {
    f = [1, 2, 3, 4].map(i => solveFinger(mr, i, bar, PRESS - clr[i], prev?.f[i - 1]).t.map(r2));
    if (!bar || !d) break;
    const gap = trueGaps(d, mr, { r, f, th: bindThumb }, r, mode);
    let ok = true; for (let i = 1; i < 5; i++) { const lack = -gap[i] - TRUE_PRESS; if (lack > .01) { clr[i] += lack + .02; ok = false; } }
    if (ok) break;
  }
  const fingers = f.map((t, i) => { const dg = mr.rig.digits[i + 1]; let T = null; const out = []; for (let k = 0; k < 3; k++) { T = step(T, dg, k, flexRot(dg, k, t[k])); out.push(T); } return out; });
  /* большой палец: зазор до кожи пальцев и ладони (капсулы — по 90-му перцентилю расстояния кожи до кости) подбирается по
     складкам кожи кисти — пересечениям треугольников большого пальца с остальной кистью (как в check.js): меньше складок,
     при равенстве — меньший зазор; затем — та же проверка глубины в ручке */
  let row = null;
  for (let it = 0; it < 4; it++) {
    let th = null, bestF = INF;
    for (const gapF of d ? THUMB_GAPS : [0]) {
      const c = solveThumb(mr, bar, fingers, PRESS - clr[0], prev?.thumb, gapF);
      const trial = { ...(bar ? { r } : {}), f, th: { q: R3.quat(c.R0).map(r5), t: c.t.map(r2) } }, nf = d ? handFolds(d, mr, mode, trial, 'thumb').thumb : 0;
      /* выбор: складки плюс квадрат промаха подушечки мимо цели (см²) — кольцо поверх пальцев важнее нескольких складок */
      const sel = nf + c.miss * c.miss;
      if (sel < bestF) { bestF = sel; th = c; }
      if (!nf) break;
    }
    row = { ...(bar ? { r } : {}), f, th: { q: R3.quat(th.R0).map(r5), t: th.t.map(r2) } };
    Object.defineProperty(row, 'thumb', { value: { dir: th.dir, t: th.t }, enumerable: false });
    if (!bar || !d) break;
    const lack = -trueGaps(d, mr, row, r, mode)[0] - TRUE_PRESS; if (lack <= .01) break;
    clr[0] += lack + .02;
  }
  return row;
}
/* наименьший зазор кожи каждого пальца (0 — большой) до ручки радиуса r при позе row — скиннингом приложения (AnnySkin.skin)
   в стойке с этой кистью в хвате; координаты — рамка кисти стойки */
function trueGaps(d, mr, row, r, mode = 'grip') {
  const s = mr.s, bar = CUP.has(mode) ? cupBodies(mr, mode).bar : barOf(mr, mode, r), dd = { ...d, hands: { ...d.hands, [s]: { ...d.hands[s], [mode]: mode === 'grip' ? [{ ...row, r }] : { ...row, r } } }, _digits: new Map() };
  const R0 = M.catalogPose(M.neutral()), hf = R0.frames['hand' + s]; R0.hands = { ...R0.hands, [s]: mode }; R0.gripRadius = { ...R0.gripRadius, [s]: r };
  const P = A.skin(R0, { d: dd, only: mr.verts, floor: false, corr: d.correctives ? d.correctives.map(() => 0) : [] }), out = [INF, INF, INF, INF, INF];
  mr.verts.forEach((v, k) => { const t = [P[k * 3] - hf.o[0], P[k * 3 + 1] - hf.o[1], P[k * 3 + 2] - hf.o[2]], x = V.dot(t, hf.x), y = V.dot(t, hf.y), f = mr.vdigit[k], p = [x, y, V.dot(t, hf.z)], gp = bar.sd ? bar.sd(p) : barDist(bar, p) - r; if (gp < out[f]) out[f] = gp; });
  return out;
}
/* Ладонь на опоре: пальцы прямые (DIG.flat), большой — в плоскости ладони, отведён к лучевой стороне. В стойке (поза покоя
   рига, перенесённая build.py на расслабленную кисть манекена) основная фаланга большого пальца уже проходит в возвышение
   большого пальца (складки стойки), и простой поворот пясти к процедурному направлению 'flat' их умножал (отжимания:
   складок «большой палец — ладонь» 40 на кисть против 11 у 4.63.0). Поэтому направление пясти (конус до 30° вокруг
   процедурного 'flat') и разворот подушечки (−60…60° от ладонной стороны) подбираются по числу складок кожи кисти — пар
   пересекающихся треугольников, близких в стойке (как в check.js) — при скиннинге приложения; при равенстве — ближе к
   процедурному направлению и к подушечке, обращённой к опоре. */
function solveFlat(mr, d) {
  const rig = mr.rig, dg = rig.digits[0], g = rig.g, y0 = dg.segs[0].y, a0 = dg.segs[0].a;
  const base = V.unit([-g * .2, -5.3, 3.6]), e1 = V.unit(V.perp([-g, 0, 0], base)), e2 = V.cross(base, e1);
  let best = null;
  for (const al of [0, 10, 20, 30]) for (const be of (al ? range(0, 315, 45) : [0])) {
    const c = Math.cos(al * Math.PI / 180), sn = Math.sin(al * Math.PI / 180), dir = V.unit(V.add(V.scale(base, c), V.add(V.scale(e1, Math.cos(be * Math.PI / 180)), e2, Math.sin(be * Math.PI / 180)), sn));
    const p0 = V.unit(V.perp([-g, 0, 0], dir)), p1 = V.cross(dir, p0);
    for (const ps of [-60, -30, 0, 30, 60]) {
      const pal = V.add(V.scale(p0, Math.cos(ps * Math.PI / 180)), p1, Math.sin(ps * Math.PI / 180)), R0 = R3.frame(y0, a0, dir, V.cross(dir, pal));
      const row = { th: { q: R3.quat(R0).map(r5), t: [5, 5] } }, n = handFolds(d, mr, 'flat', row, 'thumb').thumb, cost = n + .02 * al + .01 * Math.abs(ps);
      if (!best || cost < best.cost) best = { cost, n, row };
    }
  }
  return best.row;
}
/* складки кожи кисти стороны mr.s в стойке с этой кистью в режиме mode и позой row (как в check.js: треугольники ближе 5 см
   в стойке, без общих вершин, пересекаются) */
function handFolds(d, mr, mode, row, detail = false) {
  const s = mr.s, dd = { ...d, hands: { ...d.hands, [s]: { ...d.hands[s], [mode]: mode === 'grip' ? [row] : row } }, _digits: new Map() };
  const R0 = M.catalogPose(M.neutral()); R0.hands = { ...R0.hands, [s]: mode }; if (mode === 'grip') R0.gripRadius = { ...R0.gripRadius, [s]: row.r };
  const H = mr.handTris || (mr.handTris = handTriangles(d, s)), P = A.skin(R0, { d: dd, only: H.verts, floor: false, corr: [] }), pos = new Map(H.verts.map((v, k) => [v, k]));
  const at = v => { const k = pos.get(v) * 3; return [P[k], P[k + 1], P[k + 2]]; }, tri = t => [at(d.idx[t * 3]), at(d.idx[t * 3 + 1]), at(d.idx[t * 3 + 2])];
  const grid = new Map(), cell = 2;
  for (const t of H.tris) { const T = tri(t), lo = [0, 1, 2].map(i => Math.floor(Math.min(T[0][i], T[1][i], T[2][i]) / cell)), hi = [0, 1, 2].map(i => Math.floor(Math.max(T[0][i], T[1][i], T[2][i]) / cell)); for (let i = lo[0]; i <= hi[0]; i++) for (let j = lo[1]; j <= hi[1]; j++) for (let k = lo[2]; k <= hi[2]; k++) { const key = i + ',' + j + ',' + k; let a = grid.get(key); if (!a) grid.set(key, a = []); a.push(t); } }
  const seen = new Set(); let n = 0, thumb = 0;
  for (const list of grid.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j], key = a < b ? a * d.nf + b : b * d.nf + a; if (seen.has(key)) continue; seen.add(key);
    const va = [d.idx[a * 3], d.idx[a * 3 + 1], d.idx[a * 3 + 2]], vb = [d.idx[b * 3], d.idx[b * 3 + 1], d.idx[b * 3 + 2]]; if (va.some(v => vb.includes(v))) continue;
    if (detail === 'thumb' && H.digit[a] !== 0 && H.digit[b] !== 0) continue;
    if (V.dist(H.cen[a], H.cen[b]) > 5) continue;
    if (CK.triTri(tri(a), tri(b))) { n++; const da = H.digit[a], db = H.digit[b]; if ((da === 0) !== (db === 0)) thumb++; }
  }
  return detail ? { n, thumb } : n;
}
/* треугольники кисти (все вершины — кисть, фаланги или дистальное предплечье этой стороны), их вершины и центры в стойке */
function handTriangles(d, s) {
  const inHand = v => { const n = d.frames[d.wi[v * 4]]; return n.endsWith(s) && (n === 'hand' + s || n === 'fd' + s || /^f\d\d/.test(n)); };
  const tris = [], vs = new Set(), cen = {}, digit = {};
  for (let t = 0; t < d.nf; t++) {
    const a = d.idx[t * 3], b = d.idx[t * 3 + 1], c = d.idx[t * 3 + 2]; if (!inHand(a) || !inHand(b) || !inHand(c)) continue; tris.push(t); vs.add(a).add(b).add(c);
    cen[t] = [0, 1, 2].map(i => (d.pos[a * 3 + i] + d.pos[b * 3 + i] + d.pos[c * 3 + i]) / 3);
    const m = /^f(\d)\d/.exec(d.frames[d.wi[a * 4]]); digit[t] = m ? +m[1] : -1;   // -1 — ладонь
  }
  return { tris, verts: [...vs].sort((x, y) => x - y), cen, digit };
}
/* ---------- хват «чашей» (кисть 'cup' и 'cupring', Mannequin.cupDisk) ----------
   Диск гантели в рамке кисти — один на режим (M.cupDisk: середина внутренней грани c, ось n): верхний диск — цилиндр радиуса
   CUP_R (шестигранник 7,5 по вершинам и 6,5 по граням — между ними) длиной 7 см от грани вдоль n, втулка — радиус 2,6 и
   1,2 см под гранью, рукоять — радиус 1,6 ниже (размеры — BIND.g2CupDumbbell). Пальцы — как в хвате (solveFinger):
   проникание фаланг в диск, рукоять и ладонь плюс зазор подушечек до диска или ладони — пальцы ложатся на диск и
   обхватывают его край. Большой палец (solveCupThumb) — к своей цели: у 'cup' (гоблет) — на край диска снаружи,
   у 'cupring' — вокруг рукояти; препятствия — диск, рукоять, ладонь и пальцы. */
const CUP = new Set(['cup', 'cupring']), CUP_R = 7.0, CUP_LEN = 7, CUP_COLLAR = [2.6, 1.2], CUP_HANDLE = 1.6;
/* пределы пальцев «чаши» — меньше анатомических: при МФС 80–90° или ПМФС 60–90° кожа Anny у сгиба пальца складывается сама
   в себя (складки кисти в стойке: 3 у ладони на опоре, 21–37 при МФС 90°, 11–36 при ПМФС 60–90°); при 60/50/35 — 3–4.
   Чаша — не кулак: пальцы лежат на диске и через его край, а не сжаты */
const CUP_LIM = [[0, 60], [0, 50], [0, 35]], CUP_THUMB_SLACK = 4, CUP_THUMB_TRIES = 300;
/* большой палец «чаши»: складок кисти — не больше, чем у ладони на опоре, + CUP_FOLD_EXTRA (у левой кисти Anny без лишней
   складки большой палец не встаёт к диску — остаётся в плоскости ладони и торчит «шипом»), вывернутых треугольников — не больше
   (а если такой позы нет — на CUP_FOLD_EXTRA больше; итог проверяет tools/anny-look/check.js по крайним позам) */
const CUP_FOLD_EXTRA = 1;
const sdCylAx = (p, c, n, r, a0, a1) => { const t = V.sub(p, c), a = V.dot(t, n), rd = V.len(V.sub(t, V.scale(n, a))), dx = rd - r, m = (a0 + a1) / 2, h = (a1 - a0) / 2, dy = Math.abs(a - m) - h; return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)); };
function cupBodies(mr, mode) {
  const L = M.cupDisk(mr.s, mode), c = L.c, n = L.n;
  const disk = p => sdCylAx(p, c, n, CUP_R, 0, CUP_LEN), collar = p => sdCylAx(p, c, n, CUP_COLLAR[0], -CUP_COLLAR[1], 0), handle = p => sdCylAx(p, c, n, CUP_HANDLE, -15, -CUP_COLLAR[1]);
  const sd = p => Math.min(disk(p), collar(p), handle(p));
  return { c, n, disk, collar, handle, sd, bar: { sd, c, r: 0 }, target: mode === 'cupring' ? p => Math.min(handle(p), collar(p)) : disk };
}
function solveCupThumb(mr, body, fingers, prev = null) {
  const rig = mr.rig, dg = rig.digits[0], S = mr.segs[0], lim = A.DIG.lim.thumb, j0 = dg.j[0], y0 = dg.segs[0].y, a0 = dg.segs[0].a;
  const caps = [];
  for (let i = 0; i < 4; i++) { const fd = rig.digits[i + 1], T = fingers[i]; for (let k = 0; k < 3; k++) caps.push({ A: T[k].o, B: k < 2 ? T[k + 1].o : at(T[2], V.add(V.sub(fd.j[3], fd.j[2]), fd.segs[2].y, -mr.segs[i + 1][2].rho)), r: mr.segs[i + 1][k].rmax }); }
  const segD = (p, A_, B) => { const ab = V.sub(B, A_), l2 = V.dot(ab, ab), k = l2 < 1e-9 ? 0 : Math.max(0, Math.min(1, V.dot(V.sub(p, A_), ab) / l2)); return V.dist(p, V.add(A_, ab, k)); };
  const sdFing = p => { let m = INF; for (const c of caps) { const v = segD(p, c.A, c.B) - c.r; if (v < m) m = v; } return m; };
  const e1 = V.unit(V.perp(a0, y0)), e2 = V.cross(y0, e1);
  const aim = (al, be, ro) => {
    const dir = V.add(V.scale(y0, Math.cos(al * Math.PI / 180)), V.add(V.scale(e1, Math.cos(be * Math.PI / 180)), e2, Math.sin(be * Math.PI / 180)), Math.sin(al * Math.PI / 180));
    let x = V.unit(V.perp(a0, dir)); if (ro) x = R3.ap(R3.axis(dir, ro * Math.PI / 180), x);
    return R3.frame(y0, a0, dir, x);
  };
  const segCost = (T, k) => {
    const sg = S[k]; let mb = INF, mf = INF, mp = INF;
    for (const q of sg.all) { const p = at(T, q), b = body.sd(p), f = sdFing(p); if (b < mb) mb = b; if (f < mf) mf = f; if (k) { const v = mr.sdPalm(p); if (v < mp) mp = v; } }
    let c = 100 * (sq(Math.max(0, -mb - PRESS)) + sq(Math.max(0, -mf - PRESS)) + sq(Math.max(0, -mp - PRESS)));
    if (k && sg.pad.length) { let gs = 0; for (const q of sg.pad) { const p = at(T, q); gs += sq(Math.max(0, body.target(p))); } c += gs / sg.pad.length; }
    return c;
  };
  const L2 = V.dot(V.sub(dg.j[3], dg.j[2]), dg.segs[2].y), tipPts = S[2].all.filter(q => V.dot(q, dg.segs[2].y) > .67 * L2);
  const tipGap = T => { let c = [0, 0, 0]; for (const q of tipPts) c = V.add(c, at(T, q), 1 / tipPts.length); return body.target(c); };
  let best = null, keep = null;
  const search = (als, bes, t1s, t2s, ros) => {
    for (const al of als) for (const be of (al ? bes : [0])) for (const ro of ros) {
      const R0 = aim(al, be, ro), T0 = step(null, dg, 0, R0), dir = R3.ap(R0, y0);
      if (Math.asin(Math.max(-1, Math.min(1, -rig.g * dir[0]))) * 180 / Math.PI > PALMAR_ABD) continue;
      const c0 = segCost(T0, 0) + .002 * al + (prev ? W_PREV * sq(V.angle(dir, prev.dir) / 20) : 0); if (!keep && best && c0 >= best.c) continue;
      for (const t1 of t1s) {
        const T1 = step(T0, dg, 1, flexRot(dg, 1, t1)), c1 = c0 + segCost(T1, 1); if (!keep && best && c1 >= best.c) continue;
        for (const t2 of t2s) { const T2 = step(T1, dg, 2, flexRot(dg, 2, t2)), c = c1 + segCost(T2, 2) + sq(Math.max(0, tipGap(T2) - .6)); if (keep) keep.push({ c, t: [t1, t2], R0, dir }); if (!best || c < best.c) best = { c, al, be, ro, t: [t1, t2], R0, dir }; }
      }
    }
  };
  search(range(0, ALPHA, 10), range(0, 330, 30), range(lim[1][0], lim[1][1], 10), range(lim[2][0], lim[2][1], 10), ROLLS);
  const b = best, cl = (x, k) => Math.max(lim[k][0], Math.min(lim[k][1], x));
  search(range(Math.max(0, b.al - 6), Math.min(ALPHA, b.al + 6), 3), range(b.be - 15, b.be + 15, 7.5), range(cl(b.t[0] - 6, 1), cl(b.t[0] + 6, 1), 2), range(cl(b.t[1] - 6, 2), cl(b.t[1] + 6, 2), 2), [b.ro - 8, b.ro, b.ro + 8]);
  /* варианты для выбора по складкам: широкий перебор с запоминанием (стоимость не больше лучшей + CUP_THUMB_SLACK) */
  keep = []; const b2 = best;
  search(range(0, ALPHA, 10), range(0, 330, 30), range(lim[1][0], lim[1][1], 10), range(lim[2][0], lim[2][1], 10), ROLLS);
  return { best: b2, list: keep.filter(k => k.c <= b2.c + CUP_THUMB_SLACK).sort((x, y) => x.c - y.c) };
}
/* складки и вывернутые треугольники стойки с обеими кистями в режиме mode и строкой row (как check.js: вся сетка) */
function stanceFolds(d, mode, rows) {
  const dd = { ...d, hands: { L: { ...d.hands.L, [mode]: rows.L }, R: { ...d.hands.R, [mode]: rows.R } }, _digits: new Map() };
  const R0 = M.catalogPose(M.neutral()); R0.hands = { L: mode, R: mode };
  const f = CK.folds(dd, R0, A.skin(R0, { d: dd, floor: false, sup: null, corr: d.correctives.map(() => 0) })); return { inverted: f.inverted, folds: f.folds };
}
function solveCup(mr, mode, d = null) {
  const body = cupBodies(mr, mode), clr = [0, 0, 0, 0, 0], bindThumb = { q: [0, 0, 0, 1], t: mr.rig.digits[0].bind.slice(1).map(r2) };
  let f = null;
  for (let it = 0; it < 6; it++) {
    f = [1, 2, 3, 4].map(i => solveFinger(mr, i, body.bar, PRESS - clr[i], null, CUP_LIM).t.map(r2));
    if (!d) break;
    const gap = trueGaps(d, mr, { f, th: bindThumb }, 0, mode);
    let ok = true; for (let i = 1; i < 5; i++) { const lack = -gap[i] - TRUE_PRESS; if (lack > .01) { clr[i] += lack + .02; ok = false; } }
    if (ok) break;
  }
  const fingers = f.map((t, i) => { const dg = mr.rig.digits[i + 1]; let T = null; const out = []; for (let k = 0; k < 3; k++) { T = step(T, dg, k, flexRot(dg, k, t[k])); out.push(T); } return out; });
  const th = solveCupThumb(mr, body, fingers), rowOf = c => ({ f, th: { q: R3.quat(c.R0).map(r5), t: c.t.map(r2) } });
  if (!d) return rowOf(th.best);
  /* большой палец — первый из вариантов, у которого кисть не складывается сильнее, чем ладонь на опоре (строка flat): счёт
     складок кожи кисти (handFolds), как при подборе хвата */
  const base = handFolds(d, mr, 'flat', d.hands[mr.s].flat), inv0 = handInverted(d, mr, 'flat', d.hands[mr.s].flat);
  for (const extra of [0, CUP_FOLD_EXTRA]) for (const c of th.list.slice(0, CUP_THUMB_TRIES)) { const row = rowOf(c); if (handFolds(d, mr, mode, row) <= base + CUP_FOLD_EXTRA && handInverted(d, mr, mode, row) <= inv0 + extra) return row; }
  return { f, th: d.hands[mr.s].flat.th };
}
/* большой палец «чаши», не нашедший позы без лишних складок (остался в плоскости ладони, как на опоре), — зеркальная поза
   другой кисти, если и с ней кисть складывается не больше (сетка Anny слева и справа чуть разная) */
function cupMirror(d, T) {
  const mirror = q => [q[0], -q[1], -q[2], q[3]];
  for (const m of CUP) for (const s of ['L', 'R']) {
    const o = s === 'L' ? 'R' : 'L', row = T[s][m]; if (row.th.q.join() !== T[s].flat.th.q.join() || T[o][m].th.q.join() === T[o].flat.th.q.join()) continue;
    const dd = { ...d, hands: { ...d.hands, [s]: { ...d.hands[s], ...T[s] } } }, mr = meshRig(dd, s), cand = { f: row.f, th: { q: mirror(T[o][m].th.q), t: T[o][m].th.t } };
    if (handFolds(dd, mr, m, cand) <= handFolds(dd, mr, 'flat', T[s].flat) + CUP_FOLD_EXTRA && handInverted(dd, mr, m, cand) <= handInverted(dd, mr, 'flat', T[s].flat) + CUP_FOLD_EXTRA) T[s][m] = cand;
  }
}
/* вывернутые треугольники кожи кисти стороны mr.s в стойке с этой кистью (как check.js: нормаль в кадре против нормали
   стойки, повёрнутой смешанным поворотом вершины) */
function handInverted(d, mr, mode, row) {
  const s = mr.s, dd = { ...d, hands: { ...d.hands, [s]: { ...d.hands[s], [mode]: mode === 'grip' ? [row] : row } }, _digits: new Map() };
  const R0 = M.catalogPose(M.neutral()); R0.hands = { ...R0.hands, [s]: mode }; if (mode === 'grip') R0.gripRadius = { ...R0.gripRadius, [s]: row.r };
  const H = mr.handTris || (mr.handTris = handTriangles(d, s)), P = A.skin(R0, { d: dd, only: H.verts, floor: false, corr: [] }), pos = new Map(H.verts.map((v, k) => [v, k]));
  const S = A.skinMats(R0, dd), DQ = A.dualQuats(S, dd.frames.length);
  const rotate = (q, p) => { const [x, y, z, w] = q, cx = y * p[2] - z * p[1] + w * p[0], cy = z * p[0] - x * p[2] + w * p[1], cz = x * p[1] - y * p[0] + w * p[2]; return [p[0] + 2 * (y * cz - z * cy), p[1] + 2 * (z * cx - x * cz), p[2] + 2 * (x * cy - y * cx)]; };
  const at = v => { const k = pos.get(v) * 3; return [P[k], P[k + 1], P[k + 2]]; }, at0 = v => [d.pos[v * 3], d.pos[v * 3 + 1], d.pos[v * 3 + 2]];
  let n = 0;
  for (const t of H.tris) {
    const a = d.idx[t * 3], b = d.idx[t * 3 + 1], c = d.idx[t * 3 + 2], n0 = V.cross(V.sub(at0(b), at0(a)), V.sub(at0(c), at0(a))), n1 = V.cross(V.sub(at(b), at(a)), V.sub(at(c), at(a)));
    const l0 = V.len(n0), l1 = V.len(n1); if (l0 < 1e-9 || l1 < 1e-9) continue;
    if (V.dot(rotate(A.blendRot(dd, DQ, a), n0), n1) / (l0 * l1) < -.2) n++;
  }
  return n;
}
function table(d, log = () => {}) {
  const out = {};
  for (const s of ['L', 'R']) {
    const mr = meshRig(d, s), t0 = Date.now();
    /* радиусы — по возрастанию, с тягой к предыдущей строке (W_PREV): таблица гладкая, между строками — линейно */
    const grip = []; for (const r of RADII) grip.push(solveHand(mr, 'grip', r, d, grip[grip.length - 1] || null));
    /* глубокий хват гири (M.B.deep): ручка гири — радиус KB.handleR = 1,7 */
    out[s] = { grip, fist: solveHand(mr, 'fist', 0, d), flat: solveFlat(mr, d), deep: solveHand(mr, 'deep', 1.7, d) };
    const dd = { ...d, hands: { ...d.hands, [s]: { ...d.hands[s], flat: out[s].flat } } };
    for (const m of CUP) out[s][m] = solveCup(mr, m, dd);
    log(`${s}: ${((Date.now() - t0) / 1000).toFixed(1)} с`);
  }
  cupMirror(d, out);
  return out;
}
module.exports = { CUP, cupBodies, solveCup, cupPaths, cupMirror, handInverted, PALMAR_ABD, RADII, PRESS, TRUE_PRESS, FIST, trueGaps, solveFlat, handFolds, fromJson, meshRig, solveFinger, solveThumb, solveHand, table };
/* пути пальцев кожи Anny в режимах «чаши» (левая кисть, [ладоннее, вдоль кисти, к большому пальцу]) — для процедурной кисти
   (B.cup[mode].paths в 09bm-mannequin.js): node tools/anny-look/hands.js --paths */
function cupPaths(d) {
  const out = {};
  for (const mode of CUP) {
    const P = A.digitPose(d, 'L', mode), rig = A.digitRig(d, 'L');
    out[mode] = rig.digits.map((dg, f) => { const T = P.T[f], pts = [0, 1, 2].map(k => T[k].o); pts.push(V.add(T[2].o, R3.ap(T[2].Q, V.sub(dg.j[3], dg.j[2])))); return pts.map(p => [-p[0], -p[1], p[2]].map(v => Math.round(v * 10) / 10)); });
  }
  return out;
}
if (require.main === module && process.argv.includes('--paths')) {
  const zlib = require('node:zlib'), d = A.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/anny.bin'))));
  for (const [m, p] of Object.entries(cupPaths(d))) console.log(m, JSON.stringify(p));
} else if (require.main === module) {
  const file = path.resolve(root, process.argv[2] || 'qa/anny-look/anny.json'), src = JSON.parse(fs.readFileSync(file, 'utf8'));
  const T = table(fromJson(src), m => process.stderr.write(m + '\n'));
  for (const s of ['L', 'R']) Object.assign(src.hands[s], T[s]);
  fs.writeFileSync(file, JSON.stringify(src));
  const row = T.L.grip.find(x => x.r === 1.4);
  console.log(`${path.relative(root, file)}: пальцы по хвату — ${RADII.length} радиусов ручки и кулак на сторону; r = 1,4: пальцы ${row.f.map(t => t.map(Math.round).join('/')).join(', ')}, большой ${row.th.t.map(Math.round).join('/')}`);
}
