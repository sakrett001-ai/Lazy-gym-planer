'use strict';
/* Насколько кости выходят из кожи (те же формы тела, что у валидатора): node tools/skeleton/fit.js all|id,id [0,0.5,1] [--max см]
   Печатает по костям наибольший выход наружу и долю вершин снаружи, затем упражнения с выходом больше 1,5 см.
   С --max — проверка для npm run check: код выхода 1, если хоть одна кость выходит из кожи дальше заданного. */
const path = require('node:path'), fs = require('node:fs'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), EQ = require(root + '/src/js/09bn-equipment.js'), { bakeAll } = require(root + '/tools/mannequin/author.js');
const Skeleton = require(root + '/src/js/09bq-skeleton.js');
const { bones } = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(root + '/src/data/skeleton.bin')));
const all = bakeAll({ only: process.argv[2] && process.argv[2] !== 'all' ? process.argv[2].split(',') : null });
const ids = Object.keys(all).filter(k => !k.startsWith('_')), ts = (process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : '0,0.5,1').split(',').map(Number);
const LIMIT = process.argv.includes('--max') ? +process.argv[process.argv.indexOf('--max') + 1] : null;
const agg = {}, worst = {};
for (const id of ids) {
  const rig = EQ.rig(all[id]);
  for (const t of ts) {
    const R = rig(t), body = M.bodyData(R), cache = M.torsoCache(R), m = Skeleton.frames(R, body, bones);
    const neck = p => M.neckSDF(R, p); /* шея — по профилю сетки, а не капсулой */
    const sdf = p => { let d = Math.min(M.torsoSDF(R, p, cache), M.headSDF(R, p), neck(p)); for (const s of ['L', 'R']) for (const k of ['ua', 'fa', 'th', 'sk']) d = Math.min(d, M.limbSDF(R, k, s, p)); for (const c of body.caps) d = Math.min(d, M.V.dist(p, c.c) - c.r); return d; };
    bones.forEach((b, i) => {
      if (['finger', 'thumb', 'hand', 'foot', 'toes'].includes(b.seg)) return; /* кисти и стопы — другие формы кожи, проверяются отдельно */
      const w = Skeleton.worldPoints(b, m, i), key = b.name + (b.side || ''); let mx = 0, out = 0;
      for (let j = 0; j < w.length; j += 3) { const d = sdf([w[j], w[j + 1], w[j + 2]]); if (d > 0) out++; if (d > mx) mx = d; }
      const a = agg[key] || (agg[key] = { mx: 0, out: 0, n: 0, where: '' }); if (mx > a.mx) { a.mx = mx; a.where = `${id} t=${t}`; } a.out += out; a.n += w.length / 3;
      if (mx > 1.5) worst[id] = Math.max(worst[id] || 0, mx);
    });
  }
}
for (const [k, a] of Object.entries(agg).sort((a, b) => b[1].mx - a[1].mx))
  console.log(k.padEnd(14), 'наружу до', a.mx.toFixed(1).padStart(5), 'см  вершин снаружи', (100 * a.out / a.n).toFixed(0).padStart(3) + '%', ' ', a.where);
const w = Object.entries(worst).sort((a, b) => b[1] - a[1]);
console.log(`\nупражнений, где кость выходит больше чем на 1,5 см: ${w.length} из ${ids.length}`);
console.log(w.slice(0, 25).map(([k, v]) => k + ' ' + v.toFixed(1)).join(', '));
if (LIMIT != null) {
  const bad = Object.entries(agg).filter(([, a]) => a.mx > LIMIT);
  if (bad.length) { console.error(`\nКости выходят из кожи дальше ${LIMIT} см: ` + bad.map(([k, a]) => `${k} ${a.mx.toFixed(1)} (${a.where})`).join(', ')); process.exit(1); }
  console.log(`\nКости внутри кожи: выход не больше ${LIMIT} см во всех ${ids.length} упражнениях.`);
}
