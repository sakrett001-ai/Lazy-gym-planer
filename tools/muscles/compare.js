'use strict';
/* Сверка мышц на манекене с родной моделью MyoSim: те же развороты суставов (tools/muscles/fixtures/sweeps.json.gz),
   ход длины каждой мышцы, пересекающей сустав. Совпасть должны направление (мышца укорачивается или удлиняется)
   и размах — с поправкой на рост манекена.
   node tools/muscles/compare.js [--json выход] [--show имя,имя] */
const fs = require('node:fs'), path = require('node:path');
const { compareAll, median, JUMP, root } = require('./sweeplib.js');
const args = process.argv.slice(2), flag = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const show = (flag('--show') || '').split(',').filter(Boolean);

const report = compareAll().map(sw => {
  const { rows } = sw, flips = rows.filter(r => r.flip), jumps = rows.filter(r => r.jump > JUMP);
  const near = rows.filter(r => Math.abs(r.db - r.da) <= Math.max(.5, .3 * Math.abs(r.da)));
  const ratios = rows.filter(r => Math.abs(r.da) > .5).map(r => r.ratio);
  for (const r of rows) if (show.includes(r.name)) console.log(sw.key, r.name, r.a.map(x => x.toFixed(1)).join(' '), '|', r.b.map(x => x.toFixed(1)).join(' '));
  console.log(`${sw.key.padEnd(11)} мышц ${String(rows.length).padStart(3)}  знак не совпал ${String(flips.length).padStart(2)}  скачков ${String(jumps.length).padStart(2)}  `
    + `в допуске ${near.length}/${rows.length}  размах ×${median(ratios).toFixed(2)}  ${flips.slice(0, 3).map(r => `${r.name} ${r.da.toFixed(2)}/${r.db.toFixed(2)}`).join(', ')}`
    + `${jumps.length ? ' | скачки: ' + jumps.slice(0, 4).map(r => r.name + ' ' + r.jump.toFixed(2)).join(', ') : ''}`);
  return { ...sw, flips: flips.map(r => r.name), jumps: jumps.map(r => r.name), near: near.length, ratioMedian: median(ratios) };
});
if (flag('--json')) fs.writeFileSync(path.resolve(root, flag('--json')), JSON.stringify(report, null, 1));
