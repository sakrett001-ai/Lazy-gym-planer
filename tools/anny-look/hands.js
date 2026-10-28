'use strict';
/* Пальцы кожи Anny по хвату: таблица поз для приложения (AnnySkin.digitPose). Шаг сборки между build.py и pack.js:
   node tools/anny-look/hands.js [qa/anny-look/anny.json] — дописывает в него hands[s].grip (строка на радиус ручки RADII) и
   hands[s].fist. Сборка детерминирована (перебор по сетке, без случайности): тот же вход — те же числа.

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
const { V } = M, { R3, flexRot } = A._digit;
const RADII = [1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4];
const PRESS = .25;            // см: мякоть подушечки сминается на 2–3 мм (кожа уходит в ручку не глубже)
const FIST = [88, 100, 75];
const ALPHA = 60;            // °: поворот пясти большого пальца от стойки — не больше (ладонное отведение до 50° и сгибание до 40°: AAOS 1965)
const sq = x => x * x, INF = Infinity;

/* данные из anny.json (вход pack.js) — те же числа, что даёт AnnySkin.decode */
function fromJson(src) { return { nv: src.v.length / 3, pos: Float32Array.from(src.v), wi: Uint8Array.from(src.wi), ww: Float32Array.from(src.ww, x => x / 255), frames: src.frames, hands: src.hands }; }

/* точки кожи фаланг (относительно своего сустава) и ладонь — в координатах рамки кисти стойки */
function meshRig(d, s) {
  const rig = A.digitRig(d, s), g = rig.g, hf = M.catalogPose(M.neutral()).frames['hand' + s];
  const loc = v => { const t = [d.pos[v * 3] - hf.o[0], d.pos[v * 3 + 1] - hf.o[1], d.pos[v * 3 + 2] - hf.o[2]]; return [V.dot(t, hf.x), V.dot(t, hf.y), V.dot(t, hf.z)]; };
  const seg = {}, palm = [];
  for (let v = 0; v < d.nv; v++) {
    let b = 0; for (let k = 1; k < 4; k++) if (d.ww[v * 4 + k] > d.ww[v * 4 + b]) b = k;
    const n = d.frames[d.wi[v * 4 + b]]; if (!n.endsWith(s)) continue;
    if (/^f\d\d/.test(n)) (seg[n] || (seg[n] = [])).push(loc(v));
    else if (n === 'hand' + s && d.ww[v * 4 + b] > .8) palm.push(loc(v));
  }
  const pick = (a, n) => a.length <= n ? a : Array.from({ length: n }, (_, i) => a[Math.floor(i * a.length / n)]);
  const segs = rig.digits.map((dg, f) => dg.segs.map((sg, k) => {
    const all = (seg[`f${f}${k}${s}`] || []).map(p => V.sub(p, dg.j[k]));
    const rad = all.map(p => V.len(V.perp(p, sg.y))).sort((a, b) => a - b);
    return { all: pick(all, 24), pad: pick(all.filter(p => V.dot(p, sg.z) > 0), 16), rho: rad.length ? rad[rad.length >> 1] : .8 };
  }));
  const field = new Map(), key = (v, w) => Math.round(v * 2) + ',' + Math.round(w * 2);
  for (const p of palm) { const u = -g * p[0], k = key(-p[1], p[2]), c = field.get(k); if (!c) field.set(k, [u, u]); else { c[0] = Math.max(c[0], u); c[1] = Math.min(c[1], u); } }
  const vEnd = Math.min(...rig.digits.slice(1).map(dg => -dg.j[0][1])) - 1.5;
  const sdPalm = p => { const v = -p[1]; if (v < 1 || v > vEnd) return INF; const c = field.get(key(v, p[2])); if (!c) return INF; const u = -g * p[0]; return u < c[1] - .5 ? INF : u - c[0]; };
  return { rig, segs, sdPalm, g };
}
const step = (P, dg, k, R) => k ? { Q: R3.mul(P.Q, R), o: V.add(P.o, R3.ap(P.Q, V.sub(dg.j[k], dg.j[k - 1]))) } : { Q: R, o: dg.j[0] };
const at = (T, q) => V.add(T.o, R3.ap(T.Q, q));
const range = (a, b, st) => { const o = []; for (let x = a; x <= b + 1e-9; x += st) o.push(+x.toFixed(6)); return o; };
const barSd = bar => bar ? p => Math.hypot(p[0] - bar.c[0], p[1] - bar.c[1]) - bar.r : () => INF;

/* палец f = 1…4: углы [МФС, ПМФС, ДМФС] */
function solveFinger(mr, f, bar) {
  const dg = mr.rig.digits[f], S = mr.segs[f], lim = A.DIG.lim.finger, sdBar = barSd(bar);
  const cost = (T, k, t) => {
    const sg = S[k]; let mb = INF, mp = INF;
    for (const q of sg.all) { const p = at(T, q), b = sdBar(p); if (b < mb) mb = b; if (k) { const v = mr.sdPalm(p); if (v < mp) mp = v; } }
    let c = 100 * (sq(Math.max(0, -mb - PRESS)) + sq(Math.max(0, -mp - PRESS)));
    if (bar) { let gs = 0; for (const q of sg.pad) { const p = at(T, q); gs += sq(Math.max(0, Math.min(sdBar(p), k ? mr.sdPalm(p) : INF))); } c += sg.pad.length ? gs / sg.pad.length : 0; }
    else c += sq((t - FIST[k]) / 20);
    return c;
  };
  let best = null;
  const search = (lo, hi, st) => {
    const vals = k => range(Math.max(lim[k][0], lo[k]), Math.min(lim[k][1], hi[k]), st);
    for (const t0 of vals(0)) {
      const T0 = step(null, dg, 0, flexRot(dg, 0, t0)), c0 = cost(T0, 0, t0); if (best && c0 >= best.c) continue;
      for (const t1 of vals(1)) {
        const T1 = step(T0, dg, 1, flexRot(dg, 1, t1)), c1 = c0 + cost(T1, 1, t1); if (best && c1 >= best.c) continue;
        for (const t2 of vals(2)) { const c = c1 + cost(step(T1, dg, 2, flexRot(dg, 2, t2)), 2, t2); if (!best || c < best.c) best = { c, t: [t0, t1, t2] }; }
      }
    }
  };
  search([0, 0, 0], [999, 999, 999], 6);
  const t = best.t; search(t.map(x => x - 6), t.map(x => x + 6), 1.5);
  return best;
}

/* большой палец: поворот пясти R0 и углы [пястно-фаланговый, межфаланговый]; fingers — позы пальцев 1…4 (цепочки) */
function solveThumb(mr, bar, fingers) {
  const rig = mr.rig, dg = rig.digits[0], S = mr.segs[0], lim = A.DIG.lim.thumb, j0 = dg.j[0], y0 = dg.segs[0].y, a0 = dg.segs[0].a;
  const caps = [];
  for (let i = 0; i < 3; i++) { const fd = rig.digits[i + 1], T = fingers[i]; for (let k = 0; k < 3; k++) caps.push({ A: T[k].o, B: k < 2 ? T[k + 1].o : at(T[2], V.add(V.sub(fd.j[3], fd.j[2]), fd.segs[2].y, -mr.segs[i + 1][2].rho)), r: mr.segs[i + 1][k].rho }); }
  const segD = (p, A_, B) => { const ab = V.sub(B, A_), l2 = V.dot(ab, ab), k = l2 < 1e-9 ? 0 : Math.max(0, Math.min(1, V.dot(V.sub(p, A_), ab) / l2)); return V.dist(p, V.add(A_, ab, k)); };
  const sdFing = p => { let m = INF; for (const c of caps) { const v = segD(p, c.A, c.B) - c.r; if (v < m) m = v; } return m; };
  const sdBar = barSd(bar), center = rig.grip;
  /* цель — снаружи средних фаланг указательного и среднего (ближе к указательному и к их дистальным суставам), на толщину
     фаланги и большого пальца по тыльной нормали фаланги; кончик большого — не дальше линии проксимальных межфаланговых
     суставов (дальний край кулака): иначе он торчит из кулака */
  const mid = i => V.mix(fingers[i][1].o, fingers[i][2].o, .6), m = V.mix(mid(0), mid(1), .35);
  const back = i => V.scale(R3.ap(fingers[i][1].Q, rig.digits[i + 1].segs[1].z), -1), out = V.unit(V.mix(back(0), back(1), .35));
  const target = V.add(m, out, mr.segs[1][1].rho + S[2].rho), edge = Math.max(...fingers.map(T => -T[1].o[1]));
  const tipQ = S[2].all.reduce((b, q) => V.dot(q, dg.segs[2].y) > V.dot(b, dg.segs[2].y) ? q : b, S[2].all[0]);
  const e1 = V.unit(V.perp(a0, y0)), e2 = V.cross(y0, e1), L0 = V.dist(dg.j[1], j0);
  const aim = (al, be) => {
    const dir = V.add(V.scale(y0, Math.cos(al * Math.PI / 180)), V.add(V.scale(e1, Math.cos(be * Math.PI / 180)), e2, Math.sin(be * Math.PI / 180)), Math.sin(al * Math.PI / 180));
    /* ось сгибания — вдоль ручки (z кисти без составляющей вдоль пясти); знак — ладонной стороной (a × y) к оси ручки */
    let x = V.unit(V.perp([0, 0, 1], dir)); const mcp = V.add(j0, dir, L0);
    if (V.dot(V.cross(x, dir), [center[0] - mcp[0], center[1] - mcp[1], 0]) < 0) x = V.scale(x, -1);
    return R3.frame(y0, a0, dir, x);
  };
  const segCost = (T, k) => {
    const sg = S[k]; let mb = INF, mf = INF, mp = INF;
    for (const q of sg.all) { const p = at(T, q), b = sdBar(p), f = sdFing(p); if (b < mb) mb = b; if (f < mf) mf = f; if (k) { const v = mr.sdPalm(p); if (v < mp) mp = v; } }
    let c = 100 * (sq(Math.max(0, -mb - PRESS)) + sq(Math.max(0, -mf - PRESS)) + sq(Math.max(0, -mp - PRESS)));
    if (k && sg.pad.length) { let gs = 0; for (const q of sg.pad) { const p = at(T, q); gs += sq(Math.max(0, Math.min(sdBar(p), sdFing(p)))); } c += gs / sg.pad.length; }
    return c;
  };
  const padCenter = T => { let c = [0, 0, 0]; for (const q of S[2].pad) c = V.add(c, at(T, q), 1 / S[2].pad.length); return c; };
  let best = null;
  const search = (als, bes, t1s, t2s) => {
    for (const al of als) for (const be of (al ? bes : [0])) {
      const R0 = aim(al, be), T0 = step(null, dg, 0, R0), c0 = segCost(T0, 0) + .002 * al; if (best && c0 >= best.c) continue;
      for (const t1 of t1s) {
        const T1 = step(T0, dg, 1, flexRot(dg, 1, t1)), c1 = c0 + segCost(T1, 1); if (best && c1 >= best.c) continue;
        for (const t2 of t2s) {
          const T2 = step(T1, dg, 2, flexRot(dg, 2, t2)), pc = padCenter(T2), tip = at(T2, tipQ);
          const c = c1 + segCost(T2, 2) + .3 * V.dot(V.sub(pc, target), V.sub(pc, target)) + 2 * sq(Math.max(0, -tip[1] - edge));
          if (!best || c < best.c) best = { c, al, be, t: [t1, t2], R0 };
        }
      }
    }
  };
  search(range(0, ALPHA, 10), range(0, 345, 15), range(lim[1][0], lim[1][1], 10), range(lim[2][0], lim[2][1], 10));
  const b = best, cl = (x, k) => Math.max(lim[k][0], Math.min(lim[k][1], x));
  search(range(Math.max(0, b.al - 6), Math.min(ALPHA, b.al + 6), 3), range(b.be - 9, b.be + 9, 4.5), range(cl(b.t[0] - 6, 1), cl(b.t[0] + 6, 1), 2), range(cl(b.t[1] - 6, 2), cl(b.t[1] + 6, 2), 2));
  return { ...best, target };
}

/* строка таблицы: углы пальцев и большого (округлены — так они лягут в файл) */
const r2 = x => Math.round(x * 100) / 100, r5 = x => Math.round(x * 1e5) / 1e5;
function solveHand(mr, mode, r) {
  const bar = mode === 'grip' ? { c: mr.rig.grip, r } : null;
  const f = [1, 2, 3, 4].map(i => solveFinger(mr, i, bar).t.map(r2));
  const fingers = f.map((t, i) => { const dg = mr.rig.digits[i + 1]; let T = null; const out = []; for (let k = 0; k < 3; k++) { T = step(T, dg, k, flexRot(dg, k, t[k])); out.push(T); } return out; });
  const th = solveThumb(mr, bar, fingers);
  return { ...(bar ? { r } : {}), f, th: { q: R3.quat(th.R0).map(r5), t: th.t.map(r2) } };
}
function table(d, log = () => {}) {
  const out = {};
  for (const s of ['L', 'R']) {
    const mr = meshRig(d, s), t0 = Date.now();
    out[s] = { grip: RADII.map(r => solveHand(mr, 'grip', r)), fist: solveHand(mr, 'fist') };
    log(`${s}: ${((Date.now() - t0) / 1000).toFixed(1)} с`);
  }
  return out;
}
module.exports = { RADII, PRESS, FIST, fromJson, meshRig, solveFinger, solveThumb, solveHand, table };
if (require.main === module) {
  const file = path.resolve(root, process.argv[2] || 'qa/anny-look/anny.json'), src = JSON.parse(fs.readFileSync(file, 'utf8'));
  const T = table(fromJson(src), m => process.stderr.write(m + '\n'));
  for (const s of ['L', 'R']) Object.assign(src.hands[s], T[s]);
  fs.writeFileSync(file, JSON.stringify(src));
  const row = T.L.grip.find(x => x.r === 1.4);
  console.log(`${path.relative(root, file)}: пальцы по хвату — ${RADII.length} радиусов ручки и кулак на сторону; r = 1,4: пальцы ${row.f.map(t => t.map(Math.round).join('/')).join(', ')}, большой ${row.th.t.map(Math.round).join('/')}`);
}
