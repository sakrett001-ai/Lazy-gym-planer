'use strict';
/* Проба кожи (шаг 0): данные манекена для скриптов на Python. Код приложения не меняет и только читает.
   node tools/skin-probe/mannequin.js export --root <копия репозитория> --out bones.json
     нейтральная стойка: центры суставов, кости скелета в мировых координатах (см, Y вверх, пол 0, +Z — вперёд,
     +X — левая сторона, как в docs/mannequin-authoring.md) и замеры anthro.js этой копии;
   node tools/skin-probe/mannequin.js query --root <копия> --in q.json --out a.json
     кожа манекена этой копии в нейтральной стойке (те же формы, что у валидатора и tools/skeleton/fit.js):
     знаковое расстояние в точках (минус — внутри) и первая точка входа луча в кожу.
   --root нужен, чтобы сравнить 4.61.0 и ветку осанки одним скриптом. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const mode = process.argv[2], root = path.resolve(arg('--root', path.resolve(__dirname, '../..')));
const M = require(root + '/src/js/09bm-mannequin.js'), SK = require(root + '/src/js/09bq-skeleton.js');
const { FLOOR } = M;
const W = p => [p[0], FLOOR - p[1], p[2]];            /* каталог → координаты авторинга */
const C = p => [p[0], FLOOR - p[1], p[2]];            /* обратно (то же отражение) */
const R = M.catalogPose(M.neutral()), body = M.bodyData(R), cache = M.torsoCache(R);

/* кожа — как в tools/skeleton/fit.js: корпус, голова, шея, конечности, «шапки» суставов */
function sdfCat(p) {
  let d = Math.min(M.torsoSDF(R, p, cache), M.headSDF(R, p), M.neckSDF(R, p));
  for (const s of ['L', 'R']) for (const k of ['ua', 'fa', 'th', 'sk']) d = Math.min(d, M.limbSDF(R, k, s, p));
  for (const c of body.caps) d = Math.min(d, M.V.dist(p, c.c) - c.r);
  return d;
}
const sdf = p => sdfCat(C(p));
/* та же кожа по частям: какая форма ближе (для подписи в отчёте) */
function nearestPart(pw) {
  const p = C(pw), parts = { torso: M.torsoSDF(R, p, cache), head: M.headSDF(R, p), neck: M.neckSDF(R, p) };
  for (const s of ['L', 'R']) for (const k of ['ua', 'fa', 'th', 'sk']) parts[k + s] = M.limbSDF(R, k, s, p);
  for (const c of body.caps) parts['cap-' + c.key] = M.V.dist(p, c.c) - c.r;
  return Object.entries(parts).sort((a, b) => a[1] - b[1])[0][0];
}

if (mode === 'export') {
  const skel = SK.decode(zlib.gunzipSync(fs.readFileSync(root + '/src/data/skeleton.bin')));
  const mats = SK.frames(R, body, skel.bones);
  const bones = skel.bones.map((b, i) => {
    const w = SK.worldPoints(b, mats, i), pos = [];
    for (let j = 0; j < w.length; j += 3) pos.push(...W([w[j], w[j + 1], w[j + 2]]).map(v => +v.toFixed(3)));
    return { name: b.name, side: b.side || '', seg: b.seg, pos, idx: Array.from(b.idx) };
  });
  const joints = {};
  for (const [k, v] of Object.entries(R)) if (Array.isArray(v) && v.length === 3 && typeof v[0] === 'number') joints[k] = W(v);
  const frames = {};
  for (const [k, f] of Object.entries(R.frames)) frames[k] = { o: W(f.o || f.c), x: [f.x[0], -f.x[1], f.x[2]], y: [f.y[0], -f.y[1], f.y[2]], z: [f.z[0], -f.z[1], f.z[2]] };
  let anthro = null;
  try { anthro = require(root + '/tools/mannequin/anthro.js').report(); } catch (e) { anthro = { error: String(e) }; }
  const pkg = JSON.parse(fs.readFileSync(root + '/package.json', 'utf8'));
  fs.writeFileSync(arg('--out'), JSON.stringify({ root, version: pkg.version, joints, frames, B: { neckPivot: M.B.neckPivot, headJoint: M.B.headJoint }, bones, anthro }));
  console.log(arg('--out'), bones.length, 'костей,', pkg.version);
} else if (mode === 'query') {
  const q = JSON.parse(fs.readFileSync(arg('--in'), 'utf8')), out = { points: [], rays: [] };
  for (const p of q.points || []) out.points.push({ d: sdf(p), part: nearestPart(p) });
  /* луч: из точки o по направлению d (единичному) до первого входа в кожу (снаружи → внутрь) или выхода (изнутри → наружу);
     шаг 1 мм, затем деление пополам */
  for (const r of q.rays || []) {
    const at = t => [r.o[0] + r.d[0] * t, r.o[1] + r.d[1] * t, r.o[2] + r.d[2] * t];
    const want = r.kind === 'exit' ? 1 : -1;      /* exit: из тела наружу; enter: снаружи внутрь */
    let prev = sdf(at(0)), hit = null;
    for (let t = .1; t <= (r.max || 40); t += .1) {
      const v = sdf(at(t));
      if (Math.sign(v) === want && Math.sign(prev) !== want) { let a = t - .1, b = t; for (let k = 0; k < 30; k++) { const m = (a + b) / 2; if (Math.sign(sdf(at(m))) === want) b = m; else a = m; } hit = (a + b) / 2; break; }
      prev = v;
    }
    out.rays.push(hit == null ? null : { t: hit, p: at(hit) });
  }
  fs.writeFileSync(arg('--out'), JSON.stringify(out));
  console.log(arg('--out'), out.points.length, 'точек,', out.rays.length, 'лучей');
} else {
  console.error('режим: export | query'); process.exit(2);
}
