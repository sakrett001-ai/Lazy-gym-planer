'use strict';
/* Расхождение кожи Anny с процедурной кожей 4.61.0 в нейтральной стойке, по зонам (для README и отчёта):
   среднее |d|, 95 % и 99 % |d|, наибольшее |d| и средний знак (+ — Anny снаружи процедурной). Отход — как в check.js
   (до ближайшей поверхности частей своей зоны, compare.js). node tools/anny-look/stance-table.js [--md] */
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const CMP = require('./compare.js'), A = require(root + '/src/js/09bs-anny.js'), M = require(root + '/src/js/09bm-mannequin.js');
function table(d = CMP.loadAnny()) {
  const zones = CMP.zonesOf(d), R = M.catalogPose(M.neutral()), body = M.bodyData(R);
  const verts = []; for (let v = 0; v < d.nv; v++) if (zones[v] !== 'полость') verts.push(v);
  const P = A.skin(R, { d, floor: false, only: verts, hands: body.hands }), dist = CMP.distances(d, P, R, zones, verts, body), by = {};
  verts.forEach((v, k) => (by[zones[v]] ||= []).push(dist[k]));
  const out = {};
  for (const z of CMP.ZONES) {
    const a = by[z]; if (!a) continue; const s = a.map(Math.abs).sort((x, y) => x - y), n = s.length, q = f => s[Math.min(n - 1, Math.floor(n * f))];
    out[z] = { n, mean: s.reduce((x, y) => x + y, 0) / n, p95: q(.95), p99: q(.99), max: s[n - 1], signed: a.reduce((x, y) => x + y, 0) / n };
  }
  return out;
}
module.exports = { table };
if (require.main === module) {
  const t = table(), md = process.argv.includes('--md'), f = x => x.toFixed(2);
  if (md) { console.log('| зона | вершин | среднее | 95 % | 99 % | наибольшее | знак |\n|---|---:|---:|---:|---:|---:|---:|'); for (const [z, r] of Object.entries(t)) console.log(`| ${z} | ${r.n} | ${f(r.mean)} | ${f(r.p95)} | ${f(r.p99)} | ${f(r.max)} | ${r.signed >= 0 ? '+' : '−'}${f(Math.abs(r.signed))} |`); }
  else for (const [z, r] of Object.entries(t)) console.log(`${z.padEnd(12)} ${String(r.n).padStart(5)}  ${f(r.mean)} / ${f(r.p95)} / ${f(r.p99)} / ${f(r.max)}  ${r.signed >= 0 ? '+' : '-'}${f(Math.abs(r.signed))}`);
}
