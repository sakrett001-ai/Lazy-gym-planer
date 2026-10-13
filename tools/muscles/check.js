'use strict';
/* Геометрия мышц на позах каталога: путь мышцы не идёт сквозь кости и не выходит из кожи.
   node tools/muscles/check.js all|id,id [0,0.5,1] [--json выход] [--max-bone см] [--max-skin см]
   Позы — запечённые (src/js/09bp-poses.js, то, что видит приложение); упражнения делятся между потоками по ядрам.
   Для каждой мышцы и каждой позы: наибольшая глубина пути внутри чужой или своей кости (см, по ближайшему треугольнику;
   1,5 см у начала и прикрепления не считаются — там мышца лежит на кости) и наибольший выход за кожу (см; кисти и
   стопы — вне проверки, у них своя форма). Печатает худшие семейства мышц и упражнения.
   С --max-bone / --max-skin — проверка для npm run check: код выхода 1 при превышении (кроме известных исключений,
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
const bound = Muscles.bind(md, skel), pbs = G.prepareBones(skel);

/* Известные исключения (README, «Мышцы»): широчайшая и большая круглая при руке, отведённой или поднятой, проходят
   в задней подмышечной складке, большая грудная — в передней; манекен складок не строит (кожа плеча и туловища — отдельные
   формы), и линия оказывается над кожей подмышки до 4 и 3 см. */
const EXCEPT = { skin: { lat: 4, tmaj: 4, pecm2: 3 } };

function run(ids, ts) {
  const list = (ids || Object.keys(POSES)).filter(k => !k.startsWith('_') && POSES[k]);
  const fam = {}, byEx = {};
  for (const id of list) {
    const rig = EQ.rig(POSES[id]);
    for (const t of ts) {
      const R = rig(t), body = M.bodyData(R), m = Skeleton.frames(R, body, skel.bones), sdf = G.skinSDF(R);
      const paths = Muscles.layout(bound, m, .5), pose = G.poseBones(pbs, m);
      paths.forEach((p, i) => {
        const mu = bound[i], b = G.boneRun(pbs, m, p.points, 1.5, .5, pose), s = G.skinOut(sdf, p.points, R);
        const f = fam[mu.part] || (fam[mu.part] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', n: 0 });
        if (b.depth > f.bone) { f.bone = b.depth; f.boneAt = `${id} t=${t} ${mu.name} в ${b.deepAt}`; }
        if (s > f.skin) { f.skin = s; f.skinAt = `${id} t=${t} ${mu.name}`; }
        const e = byEx[id] || (byEx[id] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '' });
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
  const rows = Object.entries(fam).sort((a, b) => Math.max(b[1].bone, b[1].skin) - Math.max(a[1].bone, a[1].skin));
  for (const [k, f] of rows) console.log(`${k.padEnd(9)} ${(md.parts[k] || '').padEnd(40)} кость ${f.bone.toFixed(2).padStart(5)}  кожа ${f.skin.toFixed(2).padStart(5)}   ${f.bone > .8 ? f.boneAt : ''} ${f.skin > 1 ? '| кожа: ' + f.skinAt : ''}`);
  console.log(`\n${n} упражнений × ${ts.length} поз, ${((Date.now() - t0) / 1000).toFixed(0)} с`);
  if (flag('--json')) { const f = path.resolve(root, flag('--json')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify({ fam, byEx }, null, 1)); }
  const maxBone = flag('--max-bone') != null ? +flag('--max-bone') : null, maxSkin = flag('--max-skin') != null ? +flag('--max-skin') : null;
  const bad = [];
  for (const [k, f] of rows) {
    if (maxBone != null && f.bone > maxBone) bad.push(`${k}: в кости на ${f.bone.toFixed(1)} см (${f.boneAt})`);
    const lim = EXCEPT.skin[k] ?? maxSkin;
    if (lim != null && f.skin > lim) bad.push(`${k}: над кожей на ${f.skin.toFixed(1)} см (${f.skinAt})`);
  }
  if (bad.length) { console.error('\nМышцы вне допусков:\n' + bad.join('\n')); process.exit(1); }
  if (maxBone != null || maxSkin != null) console.log(`Мышцы в допусках: в кости не глубже ${maxBone} см, над кожей не выше ${maxSkin} см (исключения — EXCEPT).`);
})();
