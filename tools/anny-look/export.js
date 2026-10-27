'use strict';
/* Кожа Anny «только внешний вид»: данные манекена для скриптов на Python (fit.py, build.py). Код приложения не меняет.
   node tools/anny-look/export.js [--out qa/anny-look/mannequin.json]
   Нейтральная стойка манекена (Mannequin.neutral): центры суставов, рамки сегментов (каталог: см, Y вниз, пол 186 — так их
   отдаёт catalogPose), суставы пальцев расслабленной кисти и процедурная кожа плотными сетками по частям — корпус
   (h, сторона, угол сечения), конечности (t, угол), шея, голова, «шапки» суставов, кисти, стопы. У каждой точки кожи —
   знаковое расстояние до остальных частей (точка внутри другой части — не на видимой коже). Всё — координаты авторинга
   (см, Y вверх, пол 0, лицо к +Z, левая сторона +X), как у tools/skin-anny. */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const out = path.resolve(root, arg('--out', 'qa/anny-look/mannequin.json'));
const { V, FLOOR, SIDES } = M;
const W = p => [p[0], FLOOR - p[1], p[2]];           /* каталог → авторинг (то же отражение и обратно) */
const r3 = v => Math.round(v * 1000) / 1000;
const R = M.catalogPose(M.neutral()), body = M.bodyData(R), cache = M.torsoCache(R);

/* знаковое расстояние до каждой части процедурной кожи (каталог) */
const PARTS = ['torso', 'neck', 'head', ...SIDES.flatMap(s => ['ua', 'fa', 'th', 'sk'].map(k => k + s)), ...body.caps.map(c => 'cap-' + c.key)];
function partSDF(name, p) {
  if (name === 'torso') return M.torsoSDF(R, p, cache);
  if (name === 'neck') return M.neckSDF(R, p);
  if (name === 'head') return M.headSDF(R, p);
  if (name.startsWith('cap-')) { const c = body.caps.find(c => 'cap-' + c.key === name.slice(4) || c.key === name.slice(4)); return V.dist(p, c.c) - c.r; }
  return M.limbSDF(R, name.slice(0, 2), name.slice(2), p);
}
/* видимость: точка части не лежит глубже 1 мм внутри другой части (кожа — объединение форм) */
function hidden(own, p) { for (const n of PARTS) if (n !== own && partSDF(n, p) < -.1) return 1; return 0; }

const grids = [];
function grid(name, part, addr, rows) { grids.push({ name, part, addr, rows: rows.length, cols: rows[0].length, pts: rows.flat().map(p => W(p).map(r3)), hid: rows.flat().map(p => hidden(part, p)) }); }

/* корпус: h с шагом 0,5 см, угол сечения ang ∈ [0, π] от передней линии через бок к спине — 97 столбцов на сторону */
const TH = []; for (let h = M.TORSO[0][0]; h <= M.TORSO.at(-1)[0] + 1e-9; h += .5) TH.push(+h.toFixed(2)); if (TH.at(-1) < M.TORSO.at(-1)[0]) TH.push(M.TORSO.at(-1)[0]);
const ANG = Array.from({ length: 97 }, (_, i) => i / 96 * Math.PI);
for (const s of SIDES) grid('torso' + s, 'torso', { side: s, h: TH, ang: ANG }, TH.map(h => { const row = M.torsoRow(R, h, s); return ANG.map(a => row(a)); }));
/* конечности: t с шагом 0,02, угол — 48 столбцов (0 — спереди, π/2 — латерально) */
const T = Array.from({ length: 51 }, (_, i) => i / 50), LA = Array.from({ length: 49 }, (_, i) => i / 48 * 2 * Math.PI);
for (const s of SIDES) for (const k of ['ua', 'fa', 'th', 'sk']) grid(k + s, k + s, { side: s, kind: k, t: T, ang: LA }, T.map(t => { const row = M.limbRow(R, k, s, t); return LA.map(a => row(a)); }));
/* шея */
const NT = Array.from({ length: 21 }, (_, i) => i / 20);
grid('neck', 'neck', { t: NT, ang: LA }, NT.map(t => LA.map(a => M.neckPoint(R, t, a))));
/* «шапки» суставов: сфера, полярный угол от оси y рамки плеча (у плечевой — к суставу), азимут */
const PO = Array.from({ length: 25 }, (_, i) => i / 24 * Math.PI), AZ = Array.from({ length: 49 }, (_, i) => i / 48 * 2 * Math.PI);
for (const c of body.caps) {
  const s = c.key.slice(-1), ua = R.frames['ua' + s], g = M.SIGN[s], lat = V.scale(ua.x, g);
  grid('cap-' + c.key, 'cap-' + c.key, { key: c.key, c: W(c.c).map(r3), r: c.r, polar: PO, az: AZ },
    PO.map(po => AZ.map(az => V.add(c.c, V.add(V.add(V.scale(ua.y, Math.cos(po)), ua.z, Math.sin(po) * Math.cos(az)), lat, Math.sin(po) * Math.sin(az)), c.r))));
}
/* голова: сетка Mannequin.headMesh в рамке головы */
const HM = M.headMesh(), headPts = HM.pts.map(p => M.headWorld(R, p));
const head = { pts: headPts.map(p => W(p).map(r3)), idx: HM.idx, hid: headPts.map(p => hidden('head', p)) };

/* кисть: расслабленная (как у нейтральной стойки), фаланги — как в Skeleton (суставы на долях 0, 0,47, 0,76, 1 длины пальца,
   большой палец — по точкам пути); всё в мире */
const FINGER_LEN = [8.0, 8.8, 8.2, 6.6];
function pathAt(pts, s) { let acc = 0; for (let i = 1; i < pts.length; i++) { const l = V.dist(pts[i - 1], pts[i]); if (acc + l >= s || i === pts.length - 1) return V.mix(pts[i - 1], pts[i], l < 1e-9 ? 0 : Math.min(1, (s - acc) / l)); acc += l; } return pts.at(-1); }
const hands = {};
for (const s of SIDES) {
  const hf = R.frames['hand' + s], L = p => V.add(V.add(V.add(hf.o, hf.x, p[0]), hf.y, p[1]), hf.z, p[2]), sh = M.handShape(R.hands?.[s] || 'relaxed', s, 1.4);
  const fingers = sh.fingers.map((f, i) => { let tot = 0; for (let k = 1; k < f.pts.length; k++) tot += V.dist(f.pts[k - 1], f.pts[k]); const Lf = Math.min(FINGER_LEN[i], tot); return [0, .47, .76, 1].map(q => W(L(pathAt(f.pts, q * Lf))).map(r3)); });
  const p = sh.thumb.pts, tj = p.length >= 4 ? p.slice(0, 4) : [p[0], p[1], V.mix(p[1], p[2], .55), p[2]];
  const palm = []; const pc = sh.palm.c, ps = sh.palm.size;
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 10; j++) for (const k of [-.5, .5]) palm.push(W(L([pc[0] + k * ps[0], pc[1] + (j / 10 - .5) * ps[1], pc[2] + (i / 6 - .5) * ps[2]])).map(r3));
  hands[s] = { fingers, thumb: tj.map(q => W(L(q)).map(r3)), palm, fingerR: sh.fingers.map(f => f.r) };
}
/* стопа: кольца заднего отдела (в мире) и пальцы */
const feet = {};
for (const s of SIDES) { const F = body.feet[s]; feet[s] = { rows: F.rows.map(r => r.map(p => W(p).map(r3))), toes: F.shape.toes.map(t => ({ pts: t.pts.map(p => W(V.add(V.add(V.add(F.toes.o, F.toes.x, p[0]), F.toes.y, p[1]), F.toes.z, p[2])).map(r3)), r: t.r })) }; }

const joints = {}; for (const [k, v] of Object.entries(R)) if (Array.isArray(v) && v.length === 3 && typeof v[0] === 'number') joints[k] = W(v).map(r3);
const frames = {}; for (const [k, f] of Object.entries(R.frames)) frames[k] = { o: W(f.o).map(r3), x: [f.x[0], -f.x[1], f.x[2]], y: [f.y[0], -f.y[1], f.y[2]], z: [f.z[0], -f.z[1], f.z[2]] };
const pkg = JSON.parse(fs.readFileSync(root + '/package.json', 'utf8'));
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ version: pkg.version, joints, frames, B: { lumbar: M.B.lumbar, thoracic: M.B.thoracic, lumbarPivot: M.B.lumbarPivot, thoracicPivot: M.B.thoracicPivot, neckPivot: M.B.neckPivot, headJoint: M.B.headJoint, c7: M.B.c7 },
  TORSO_BLEND: M.TORSO_BLEND, TORSO_BLEND_FRONT: M.TORSO_BLEND_FRONT, FRONT_W: M.FRONT_W, FRONT_H: M.FRONT_H, grids, head, hands, feet }));
console.log(path.relative(root, out), pkg.version, 'сеток', grids.length, 'точек', grids.reduce((s, g) => s + g.pts.length, 0));
