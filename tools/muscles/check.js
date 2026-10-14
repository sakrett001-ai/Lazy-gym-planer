'use strict';
/* Геометрия мышц на позах каталога: путь мышцы не идёт сквозь кости и не выходит из кожи.
   node tools/muscles/check.js all|id,id [0,0.5,1] [--json выход] [--max-bone см] [--max-skin см]
   Позы — запечённые (src/js/09bp-poses.js, то, что видит приложение); упражнения делятся между потоками по ядрам.
   Для каждой мышцы и каждой позы: наибольшая глубина пути внутри чужой или своей кости (см, по ближайшему треугольнику;
   1,5 см у начала и прикрепления не считаются — там мышца лежит на кости) и наибольший выход за кожу (см; кисти и
   стопы — вне проверки, у них своя форма) — у линии пути и у тела мышцы (вершины Muscles.surface, этап М2).
   Печатает худшие семейства мышц и упражнения.
   С --max-bone / --max-skin / --max-body — проверка для npm run check: код выхода 1 при превышении (кроме известных исключений,
   см. EXCEPT ниже). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js')), EQ = require(path.join(root, 'src/js/09bn-equipment.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js')), Muscles = require(path.join(root, 'src/js/09br-muscles.js'));
const POSES = require(path.join(root, 'src/js/09bp-poses.js'));
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads'), os = require('node:os');
const G = require('./geometry.js');

const args = process.argv.slice(2), flag = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const md = Muscles.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin'))));
const bound = Muscles.bind(md, skel), pbs = G.prepareBones(skel), SURF = new Float64Array(64 * 16 * 3);

/* Известные исключения (tools/muscles/README.md, «Кожа»). С 4.28.0 кожа поднимается над складками подмышки
   (Mannequin.FOLDS): линии всех мышц — в допуске. Подъём ограничен замерами стоящей фигуры (ANSUR II: ширина груди
   не растёт) — полностью тела мышц складки не прячут: при руке над головой или далеко в сторону тело широчайшей выходит
   из кожи до 3,8 см (с 4.32.0 её объём разделён на шесть пучков), грудинной части большой грудной и подостной — до 3,3 см. Прямая мышца живота в предельном
   скручивании (≈70°) — хорда над вогнутым животом — до 3,1 см. */
const EXCEPT = { skin: {}, body: { lat: 3.9, pecm2: 3.5, infsp: 3.5, rectabd: 3.2 } };

function run(ids, ts) {
  const list = (ids || Object.keys(POSES)).filter(k => !k.startsWith('_') && POSES[k]);
  const fam = {}, byEx = {};
  for (const id of list) {
    const rig = EQ.rig(POSES[id]);
    for (const t of ts) {
      const R = rig(t), body = M.bodyData(R), m = Skeleton.frames(R, body, skel.bones), sdf = G.skinSDF(R);
      const paths = Muscles.layout(bound, m, .5), drawn = Muscles.layoutDrawn(bound, m, 1.5), pose = G.poseBones(pbs, m);
      paths.forEach((p, i) => {
        const mu = bound[i], b = G.boneRun(pbs, m, p.points, 1.5, .5, pose), s = G.skinOut(sdf, p.points, R);
        /* тело мышцы (этап М2): вершины поверхности — те же, что рисует приложение */
        const nr = Muscles.surface(mu, drawn[i], m, SURF, null, 0), v = G.skinOutPoints(sdf, SURF, R, nr * Muscles.SIDES);
        const f = fam[mu.part] || (fam[mu.part] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', body: -Infinity, bodyAt: '', n: 0 });
        if (b.depth > f.bone) { f.bone = b.depth; f.boneAt = `${id} t=${t} ${mu.name} в ${b.deepAt}`; }
        if (s > f.skin) { f.skin = s; f.skinAt = `${id} t=${t} ${mu.name}`; }
        if (v.out > f.body) { f.body = v.out; f.bodyAt = `${id} t=${t} ${mu.name}`; }
        const e = byEx[id] || (byEx[id] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', body: -Infinity, bodyAt: '' });
        if (v.out > e.body) { e.body = v.out; e.bodyAt = `${mu.name} t=${t}`; }
        if (b.depth > e.bone) { e.bone = b.depth; e.boneAt = `${mu.name} t=${t} в ${b.deepAt}`; }
        if (s > e.skin) { e.skin = s; e.skinAt = `${mu.name} t=${t}`; }
      });
    }
  }
  return { fam, byEx, n: list.length };
}
/* сведение результатов потоков: по семействам — худшее */
function merge(parts) {
  const fam = {}, byEx = {}; let n = 0;
  for (const r of parts) {
    n += r.n; Object.assign(byEx, r.byEx);
    for (const [k, f] of Object.entries(r.fam)) {
      const g = fam[k] || (fam[k] = { ...f });
      if (f.bone > g.bone) { g.bone = f.bone; g.boneAt = f.boneAt; }
      if (f.skin > g.skin) { g.skin = f.skin; g.skinAt = f.skinAt; }
      if (f.body > g.body) { g.body = f.body; g.bodyAt = f.bodyAt; }
    }
  }
  return { fam, byEx, n };
}
async function runParallel(ids, ts, threads = Math.max(1, Math.min(4, os.cpus().length))) {
  const list = (ids || Object.keys(POSES)).filter(k => !k.startsWith('_') && POSES[k]);
  const chunks = Array.from({ length: Math.min(threads, list.length) }, (_, i) => list.filter((_, j) => j % threads === i));
  if (chunks.length < 2) return run(list, ts);
  return merge(await Promise.all(chunks.map(c => new Promise((ok, fail) => {
    const w = new Worker(__filename, { workerData: { ids: c, ts } }); w.once('message', ok); w.once('error', fail);
  }))));
}
module.exports = { run, runParallel, EXCEPT };

if (!isMainThread) parentPort.postMessage(run(workerData.ids, workerData.ts));
else if (require.main === module) (async () => {
  const ids = args[0] && args[0] !== 'all' ? args[0].split(',') : null;
  const ts = (args[1] && !args[1].startsWith('--') ? args[1] : '0,0.5,1').split(',').map(Number);
  const t0 = Date.now(), { fam, byEx, n } = await runParallel(ids, ts);
  const rows = Object.entries(fam).sort((a, b) => Math.max(b[1].bone, b[1].skin, b[1].body) - Math.max(a[1].bone, a[1].skin, a[1].body));
  for (const [k, f] of rows) console.log(`${k.padEnd(9)} ${(md.parts[k] || '').padEnd(40)} кость ${f.bone.toFixed(2).padStart(5)}  кожа ${f.skin.toFixed(2).padStart(5)}  тело ${f.body.toFixed(2).padStart(5)}   ${f.bone > .8 ? f.boneAt : ''} ${f.skin > 1 ? '| кожа: ' + f.skinAt : ''} ${f.body > 1 ? '| тело: ' + f.bodyAt : ''}`);
  console.log(`\n${n} упражнений × ${ts.length} поз, ${((Date.now() - t0) / 1000).toFixed(0)} с`);
  if (flag('--json')) { const f = path.resolve(root, flag('--json')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify({ fam, byEx }, null, 1)); }
  const maxBone = flag('--max-bone') != null ? +flag('--max-bone') : null, maxSkin = flag('--max-skin') != null ? +flag('--max-skin') : null;
  const maxBody = flag('--max-body') != null ? +flag('--max-body') : null;
  const bad = [];
  for (const [k, f] of rows) {
    if (maxBone != null && f.bone > maxBone) bad.push(`${k}: в кости на ${f.bone.toFixed(1)} см (${f.boneAt})`);
    const lim = EXCEPT.skin[k] ?? maxSkin, limBody = EXCEPT.body[k] ?? maxBody;
    if (lim != null && f.skin > lim) bad.push(`${k}: над кожей на ${f.skin.toFixed(1)} см (${f.skinAt})`);
    if (limBody != null && f.body > limBody) bad.push(`${k}: тело над кожей на ${f.body.toFixed(1)} см (${f.bodyAt})`);
  }
  if (bad.length) { console.error('\nМышцы вне допусков:\n' + bad.join('\n')); process.exit(1); }
  if (maxBone != null || maxSkin != null) console.log(`Мышцы в допусках: путь в кости не глубже ${maxBone} см и над кожей не выше ${maxSkin} см, тело мышцы над кожей не выше ${maxBody} см (исключения — EXCEPT).`);
})();
