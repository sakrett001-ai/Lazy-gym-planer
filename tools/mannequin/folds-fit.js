'use strict';
/* Подгонка складок подмышки (Mannequin.FOLDS, src/js/09bm-mannequin.js).
   node tools/mannequin/folds-fit.js [--iters 700] [--start файл.json] [--out файл.json] [--data набор.json]

   Складки поднимают кожу корпуса над мышцами, идущими с корпуса на плечевую кость. Их оси, высоты и ширины
   подбираются по всем упражнениям каталога (позы t = 0; 0,25; 0,5; 0,75; 1); складок столько, сколько в FOLDS
   (или в --start; с 4.41.0 — три: задняя, передняя и боковая):
   - цель: тела мышц подмышки (широчайшая, большая и малая круглые, подостная, подлопаточная, большая грудная, дельтовидная,
     длинная головка трёхглавой, клювовидно-плечевая, короткая головка двуглавой; этап М2) выходят из кожи не выше 1,5 см,
     и худший выход каждого семейства — не выше 2,5 см, с запасом до допуска проверки мышц (2,6 см; tools/muscles/check.js);
   - кожа в ключевых позах не поднимается над прежней выше, чем на 0,6 см над мышцами под ней (стоя — не выше 1,2 см);
   - стоя ширина груди не растёт (без складок она уже подогнана к ANSUR II), глубина — не больше чем на 0,3 см,
     обхват — не больше ANSUR II (101,7 см) (замеры — tools/mannequin/anthro.js);
   - соседние точки сетки кожи сдвинуты почти одинаково (без зубцов); ось — от точки у корпуса своей стороны к точке
     у плеча ниже центра сустава, высота не больше 5 см, ширина — не больше 8.
   Набор (тела мышц во всех позах) зависит от формы тела (TORSO), поз и данных мышц, но не от складок: --data файл
   сохраняет его при первом прогоне и берёт готовым при следующих (после правки тела файл удалить).
   Метод — Нелдер — Мид; вывод — константы FOLDS и выход мышц по семействам до и после. Прогон — 10–20 минут. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js')); global.Mannequin = M;
const EQ = require(path.join(root, 'src/js/09bn-equipment.js')), SK = require(path.join(root, 'src/js/09bq-skeleton.js'));
const MU = require(path.join(root, 'src/js/09br-muscles.js')), POSES = require(path.join(root, 'src/js/09bp-poses.js'));
const { V, SIGN } = M;
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

/* ---------- подъём кожи: та же формула, что Mannequin.foldLift, но с параметрами-кандидатами ---------- */
const NR = M.catalogPose(M.neutral());
function axes(F, T, U, side, L0) {
  const g = SIGN[side], A = V.add(V.add(V.add(T.o, T.x, g * F.tr[0]), T.y, F.tr[1]), T.z, F.tr[2]);
  const B = V.add(V.add(V.add(U.o, U.x, g * F.ua[0]), U.y, F.ua[1]), U.z, F.ua[2]), ab = V.sub(B, A), L = V.len(ab);
  return { A, d: V.scale(ab, 1 / L), L, k: L0 ? Math.pow(L / L0, F.kv) : 1, F };
}
function lift(set, p) {
  let h = 0;
  for (const ax of set) {
    const A = ax.A, d = ax.d, ox = p[0] - A[0], oy = p[1] - A[1], oz = p[2] - A[2], u = Math.max(0, Math.min(ax.L, ox * d[0] + oy * d[1] + oz * d[2]));
    const e = Math.hypot(ox - d[0] * u, oy - d[1] * u, oz - d[2] * u) / ax.F.s; if (e > 3) continue;
    const v = ax.F.a * ax.k * Math.pow(Math.sin(Math.PI * u / ax.L), M.FOLD_SP) * Math.exp(-e * e); if (v > h) h = v;
  }
  return h;
}
/* подъём кожи — наибольший по складкам обеих сторон, как Mannequin.foldLift: широкая складка одной стороны чуть заходит
   за среднюю линию (4.41.0: на тысячные доли сантиметра); поэтому у каждой стороны — все оси */
const setsFor = (P, T, U, L0) => { const all = []; for (const s of ['L', 'R']) for (const [k, F] of Object.entries(P)) all.push(axes(F, T, U[s], s, L0[k])); return { L: all, R: all }; };
const lengths = P => Object.fromEntries(Object.entries(P).map(([k, F]) => [k, axes(F, NR.frames.thorax, NR.frames.uaL, 'L', 0).L]));

/* ---------- набор: вершины тел мышц снаружи кожи без складок (лопатка — по коже со складками, как в приложении) ---------- */
/* все линии этих мышц: и линии исходных моделей, и достроенные (пучки широчайшей LAT4–LAT6 — 4.32.0, задняя дельта веером —
   4.36.0, большая грудная и подостная веером — 4.37.0); до 4.41.0 подгонка видела только линии исходных моделей */
const WANT = /^(LAT[1-6]|TMAJ|TMIN|INFSP(sup|inf)?|SUBSC|PECM[123][abc]?|DELT[123](med|lat)?|TRIlong|CORB|BICshort)_[lr]$/, PER = 8;
function dataset() {
  /* набор считается несколько минут: --data файл — взять готовый (или сохранить, если файла ещё нет) */
  const cache = arg('--data');
  if (cache && fs.existsSync(cache)) return JSON.parse(fs.readFileSync(cache, 'utf8'));
  const out = build();
  if (cache) fs.writeFileSync(cache, JSON.stringify(out));
  return out;
}
function build() {
  const skel = SK.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
  const md = MU.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin')))), bound = MU.bind(md, skel);
  /* тела мышц — как в приложении (Muscles.surfaceAll: трубки и ленты широких мышц — кольцо ленты зависит от соседних линий) */
  const START = MU.ringStarts(bound), all = new Float64Array(START[bound.length] * MU.SIDES * 3), out = [], fr = f => ({ o: f.o, x: f.x, y: f.y, z: f.z });
  for (const id of Object.keys(POSES).filter(k => !k.startsWith('_'))) {
    const rig = EQ.rig(POSES[id]);
    for (const t of [0, .25, .5, .75, 1]) {
      const R = rig(t), m = SK.frames(R, M.bodyData(R), skel.bones), paths = MU.layoutDrawn(bound, m, 1.5);
      MU.surfaceAll(bound, paths, m, all, null, START);
      M.noFolds(() => {
        const body = M.bodyData(R), cache = M.torsoCache(R), others = [p => M.headSDF(R, p), p => M.neckSDF(R, p)];
        for (const s of ['L', 'R']) for (const k of ['fa', 'th', 'sk']) others.push(p => M.limbSDF(R, k, s, p));
        for (const c of body.caps) others.push(p => V.dist(p, c.c) - c.r);
        const rec = { id, t, T: fr(R.frames.thorax), U: { L: fr(R.frames.uaL), R: fr(R.frames.uaR) }, v: [] };
        paths.forEach((p, i) => {
          const mu = bound[i]; if (!WANT.test(mu.name)) return;
          const side = mu.name.endsWith('_l') ? 'L' : 'R', n = (START[i + 1] - START[i]) * MU.SIDES, buf = all.subarray(START[i] * MU.SIDES * 3), cand = [];
          for (let k = 0; k < n; k++) {
            const q = [buf[k * 3], buf[k * 3 + 1], buf[k * 3 + 2]], it = {};
            const dt = M.torsoSDF(R, q, cache, it), da = M.limbSDF(R, 'ua', side, q);
            let o = M.limbSDF(R, 'ua', side === 'L' ? 'R' : 'L', q); for (const f of others) o = Math.min(o, f(q));
            const d = Math.min(dt, da, o); if (d > .2) cand.push({ m: mu.name, side, d, o, dt, pt: it.ps, da });
          }
          cand.sort((a, b) => b.d - a.d); rec.v.push(...cand.filter(c => c.d > cand[0].d - 1.5).slice(0, PER));
        });
        out.push(rec);
      });
    }
  }
  return out;
}

/* ---------- ключевые позы (выпуклость, гладкость) и замеры стоя ---------- */
const KEY = ['neutral', 'squat:0', 'hang:0', 'ohp:1', 'latraise:1', 'frontraise:1', 'dbfly:0.5', 'pullover:1', 'dip:1', 'pushup:1', 'bbbench:1', 'reversesnow:1', 'latpull:0', 'plank:0', 'ytw:0', 'sideplank:0', 'cablefly:0.5', 'jumpingjack:0.5', 'bbcurl:0', 'deadlift:0'];
let KP = null, ANS = null, CH0 = null;
const keyPoses = () => M.noFolds(() => KEY.map(k => {
  const R = k === 'neutral' ? NR : EQ.rig(POSES[k.split(':')[0]])(+k.split(':')[1]), S = M.surface(R), body = M.bodyData(R), cache = M.torsoCache(R), pts = [], grids = [];
  { const g = []; S.torsoHeights.forEach((h, i) => { if (h < 25) return; const f = M.torsoFrame(R, h); g.push(S.torso[i].map(p => { const e = { p, n: V.unit(V.perp(V.sub(p, f.c), f.y)), s: V.dot(V.sub(p, R.frames.thorax.o), R.frames.thorax.x) > 0 ? 'L' : 'R', w: 1 }; pts.push(e); return e; })); }); grids.push(g); }
  const old = q => M.noFolds(() => { let d = M.torsoSDF(R, q, cache); for (const s of ['L', 'R']) d = Math.min(d, M.limbSDF(R, 'ua', s, q)); for (const c of body.caps) d = Math.min(d, V.dist(q, c.c) - c.r); return d; });
  return { k, T: R.frames.thorax, U: { L: R.frames.uaL, R: R.frames.uaR }, pts, grids, old };
}));
const standing = () => M.noFolds(() => {
  const R = NR, h = R.hip[1] - (M.FLOOR - 128.2), f = M.torsoFrame(R, h), sec = M.sectionAt(h), ring = [];   /* ANSUR II: высота груди 128,2 см */
  for (let i = 0; i < 180; i++) { const a = i / 180 * 2 * Math.PI, side = a <= Math.PI ? 'L' : 'R', ang = a <= Math.PI ? a : 2 * Math.PI - a, p = M.torsoPointIn(R, h, side, ang, 0, f, sec); ring.push({ p, n: V.unit(V.perp(V.sub(p, f.c), f.y)), s: V.dot(V.sub(p, R.frames.thorax.o), R.frames.thorax.x) > 0 ? 'L' : 'R' }); }
  return { ring };
});
function chest(set) {
  const P = ANS.ring.map(e => V.add(e.p, e.n, set ? lift(set[e.s], e.p) : 0)), pts = P.map(p => [p[0], p[2]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
  for (const p of pts) { while (lo.length >= 2 && cr(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (up.length >= 2 && cr(up.at(-2), up.at(-1), p) <= 0) up.pop(); up.push(p); }
  const H = lo.slice(0, -1).concat(up.slice(0, -1)); let per = 0; for (let i = 0; i < H.length; i++) per += Math.hypot(H[i][0] - H[(i + 1) % H.length][0], H[i][1] - H[(i + 1) % H.length][1]);
  const xs = P.map(p => p[0]), zs = P.map(p => p[2]); return { per, br: Math.max(...xs) - Math.min(...xs), dp: Math.max(...zs) - Math.min(...zs) };
}
function prep() { if (!KP) { KP = keyPoses(); ANS = standing(); CH0 = chest(null); } }

/* ---------- цель ---------- */
/* Худший выход семейства: до FAM_MAX — как у всех, выше — штраф FAM_W·(d − FAM_MAX)². До сужения груди к ANSUR II (ширина
   28,5 см без складок) — 2,6 см (сам допуск проверки мышц) и вес 150: с лентами (4.51.0) и колпаком дельтовидной (4.53.0)
   тела мышц у подмышки другие, и при таком весе подгонка меняла выход широчайшей на меньшую «надутость» кожи над мышцами
   в ключевых позах — повторная подгонка даже прежней формы груди давала широчайшую 2,71 см (Y-T-W). Теперь 2,5 см с запасом
   0,1 до допуска (параметры складок округляются, проверка мышц — на своих кадрах) и вес 5000: допуск — условие. */
const FAM_MAX = 2.5, FAM_W = 5000;
/* семейство: линии веера и пучки — вместе со своей мышцей (PECM2a, PECM2c → pecm; DELT3lat → delt; LAT5 → lat) */
const fam = n => n.replace(/_[lr]$/, '').replace(/(med|lat|sup|inf|[abc])$/, '').replace(/\d$/, '').toLowerCase();
function evaluate(D, P) {
  prep();
  const L0 = lengths(P), famMax = {}, famAt = {}; let loss = 0, pen = 0;
  for (const r of D) {
    const set = setsFor(P, r.T, r.U, L0), pm = {};
    for (const v of r.v) {
      const st = set[v.side]; let d = v.o;
      d = Math.min(d, v.pt ? v.dt - lift(st, v.pt) : v.dt);
      d = Math.min(d, v.da);
      const f = fam(v.m); if (!(pm[f] >= d)) pm[f] = d;
    }
    for (const [f, d] of Object.entries(pm)) { if (!(famMax[f] >= d)) { famMax[f] = d; famAt[f] = `${r.id} t=${r.t}`; } loss += Math.max(0, d - 1.5) ** 2; }
  }
  /* худший выход семейства — то, что проверяет npm run muscles:check: выше FAM_MAX штраф круче (4.41.0; без него
     подгонка улучшает сотни умеренных выходов, а худший — тело широчайшей при руке над головой — остаётся на 4 см) */
  for (const d of Object.values(famMax)) loss += FAM_W * Math.max(0, d - FAM_MAX) ** 2;
  const muscleOut = {}; for (const r of D) { const m = { L: 0, R: 0 }; for (const v of r.v) m[v.side] = Math.max(m[v.side], v.d); muscleOut[r.id + ':' + r.t] = m; }
  for (const kp of KP) {
    const set = setsFor(P, kp.T, kp.U, L0), mx = { L: 0, R: 0 };
    for (const e of kp.pts) { e.lift = e.w * lift(set[e.s], e.p); if (e.lift >= .3) mx[e.s] = Math.max(mx[e.s], kp.old(V.add(e.p, e.n, e.lift))); }
    for (const g of kp.grids) for (let i = 0; i < g.length; i++) for (let j = 0; j < g[i].length; j++) {
      const a = g[i][j].lift, b = g[i][(j + 1) % g[i].length].lift, c = i + 1 < g.length ? g[i + 1][j].lift : a;
      pen += 20 * Math.max(0, Math.max(Math.abs(a - b), Math.abs(a - c)) - .8) ** 2;
    }
    for (const s of ['L', 'R']) { const lim = kp.k === 'neutral' ? 1.2 : Math.max(1.2, (muscleOut[kp.k]?.[s] ?? 0) + .6); pen += 50 * Math.max(0, mx[s] - lim) ** 2; }
  }
  { const set = setsFor(P, NR.frames.thorax, { L: NR.frames.uaL, R: NR.frames.uaR }, L0), c = chest(set);
    pen += 5000 * (Math.max(0, c.br - CH0.br) ** 2 + Math.max(0, c.dp - CH0.dp - .3) ** 2 + Math.max(0, c.per - 101.7) ** 2); }
  for (const F of Object.values(P)) {
    pen += 50 * (Math.max(0, F.a - 5) ** 2 + Math.max(0, F.s - 8) ** 2 + Math.max(0, 1.5 - F.s) ** 2 + Math.max(0, F.ua[1] + 3) ** 2 + Math.max(0, 3 - F.tr[0]) ** 2);
    const ax = axes(F, NR.frames.thorax, NR.frames.uaL, 'L', 0), B = V.add(ax.A, ax.d, ax.L);
    M.noFolds(() => { pen += 50 * (Math.max(0, M.torsoSDF(NR, ax.A) + 1) ** 2 + Math.max(0, M.limbSDF(NR, 'ua', 'L', B) + 1) ** 2); });
  }
  return { famMax, famAt, loss, pen, total: loss + pen };
}

/* ---------- Нелдер — Мид ---------- */
function fit(D, start, iters) {
  const keys = []; for (const k of Object.keys(start)) { for (const a of ['tr', 'ua']) for (let i = 0; i < 3; i++) keys.push([k, a, i]); keys.push([k, 'a'], [k, 's'], [k, 'kv']); }
  const get = (P, k) => k.length === 3 ? P[k[0]][k[1]][k[2]] : P[k[0]][k[1]], set = (P, k, v) => { if (k.length === 3) P[k[0]][k[1]][k[2]] = v; else P[k[0]][k[1]] = v; };
  const build = x => { const P = JSON.parse(JSON.stringify(start)); keys.forEach((k, i) => set(P, k, x[i])); return P; };
  const f = x => { const P = build(x); return Object.values(P).some(F => F.a < 0 || F.s < .5) ? 1e9 : evaluate(D, P).total; };
  const n = keys.length, x0 = keys.map(k => get(start, k));
  let S = [x0, ...keys.map((k, i) => { const x = x0.slice(); x[i] += k.length === 2 ? .5 : 1.5; return x; })].map(x => ({ x, f: f(x) }));
  for (let it = 0; it < iters; it++) {
    S.sort((a, b) => a.f - b.f); const c = Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i].x[j] / n;
    const w = S[n], xr = c.map((v, j) => v + (v - w.x[j])), fr = f(xr);
    if (fr < S[0].f) { const xe = c.map((v, j) => v + 2 * (v - w.x[j])), fe = f(xe); S[n] = fe < fr ? { x: xe, f: fe } : { x: xr, f: fr }; }
    else if (fr < S[n - 1].f) S[n] = { x: xr, f: fr };
    else { const xc = c.map((v, j) => v + .5 * (w.x[j] - v)), fc = f(xc); if (fc < w.f) S[n] = { x: xc, f: fc }; else for (let i = 1; i <= n; i++) { S[i].x = S[i].x.map((v, j) => S[0].x[j] + .5 * (v - S[0].x[j])); S[i].f = f(S[i].x); } }
    if (it % 50 === 0) process.stderr.write(`${it} ${S[0].f.toFixed(1)}\n`);
  }
  S.sort((a, b) => a.f - b.f);
  const P = build(S[0].x); for (const F of Object.values(P)) { F.tr = F.tr.map(v => +v.toFixed(1)); F.ua = F.ua.map(v => +v.toFixed(1)); for (const k of ['a', 's', 'kv']) F[k] = +F[k].toFixed(2); }
  return P;
}

if (require.main === module) {
  const start = arg('--start') ? JSON.parse(fs.readFileSync(arg('--start'), 'utf8')) : JSON.parse(JSON.stringify(M.FOLDS));
  const D = dataset(), none = Object.fromEntries(Object.entries(start).map(([k, F]) => [k, { ...F, a: 0 }]));
  const before = evaluate(D, none), P = fit(D, start, +arg('--iters', 700)), after = evaluate(D, P);
  console.log('Выход тел мышц из кожи, см: без складок → со складками');
  for (const [f, d] of Object.entries(after.famMax).sort((a, b) => b[1] - a[1])) console.log(`  ${f.padEnd(8)} ${before.famMax[f].toFixed(2).padStart(5)} → ${d.toFixed(2).padStart(5)}  ${after.famAt[f]}`);
  console.log('const FOLDS=' + JSON.stringify(P));
  if (arg('--out')) fs.writeFileSync(arg('--out'), JSON.stringify(P));
}
module.exports = { evaluate, dataset, lift, axes };
