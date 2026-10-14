'use strict';
/* Общее для сверки мышц с MyoSim (compare.js, tools/muscles.test.js): эталонные развороты суставов MuJoCo
   (fixtures/sweeps.json.gz, tools/muscles/sweeps.py) и те же развороты на манекене — длины мышц по данным приложения
   (src/data/muscles.bin) и сравнение хода длины с эталоном. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
const Muscles = require(path.join(root, 'src/js/09br-muscles.js'));

const skeleton = () => Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const muscles = () => Muscles.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin'))));
const reference = () => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures/sweeps.json.gz'))).toString('utf8'));
const JUMP = 1.5;       /* скачок: на одном шаге ход длины расходится с эталоном больше чем на 1,5 см (путь перескочил огибающее тело) */

/* Поза манекена для угла разворота. Остальные суставы — в нуле (руки вдоль тела без сгибания, ноги прямые).
   Поясница манекена — два шарнира (поясничный и грудопоясничный): угол туловища делим между ними поровну.
   У MoBL подъём плеча ведёт за собой ключицу (связи модели): к 120° плечевой сустав поднимается на 3,6 см и уходит
   назад на 3,5 см — у манекена то же даёт пояс [поднимание 0,1·θ; протракция −0,1·θ]. */
function sweepPose(sw, a) {
  const q = M.neutral();
  for (const s of ['L', 'R']) { q[s].shoulder = [0, 0, 0]; q[s].elbow = 0; q[s].hip = [0, 0, 0]; }
  if (sw.path.startsWith('lumbar.')) { const k = +sw.path.split('.')[1]; q.lumbar[k] = a / 2; q.thoracic[k] = a / 2; }
  else { const k = sw.path.split('.'); let o = q; for (let i = 0; i < k.length - 1; i++) o = o[k[i]]; o[k.at(-1)] = a; }
  if (sw.key === 'sh_abd' || sw.key === 'sh_flex') q.R.girdle = [.1 * a, -.1 * a];
  return q;
}
/* мышца манекена для имени MyoSim: правая рука у нас с «_r». У трёх мышц туловища в MyoSim точки не на своей стороне
   (build_muscles.py, SIDE_FIX; у нас отражены): сравнивается мышца, лежащая на той же стороне тела — rect_abd_r MyoSim
   (лежит слева) с нашей левой и наоборот, LTpT_T12_l MyoSim (копия правой) — с нашей правой */
const PHYSICAL = { rect_abd_r: 'rect_abd_l', rect_abd_l: 'rect_abd_r', LTpT_T12_l: 'LTpT_T12_r' };
function ourIndex(bound) {
  const at = new Map(bound.map((m, i) => [m.name, i]));
  return n => { n = PHYSICAL[n] || n; return at.has(n) ? at.get(n) : at.get(n + '_r'); };
}
/* все развороты: для каждой мышцы эталона — ход длины у MyoSim (a) и у манекена (b), см */
function compareAll(ref = reference(), skel = skeleton(), md = muscles()) {
  const bound = Muscles.bind(md, skel), find = ourIndex(bound);
  return ref.sweeps.map(sw => {
    const ours = sw.angles.map(a => { const R = M.catalogPose(sweepPose(sw, a)); return Muscles.layout(bound, Skeleton.frames(R, M.bodyData(R), skel.bones)).map(p => p.length); });
    const rows = [];
    for (const [name, a] of Object.entries(sw.rows)) {
      const i = find(name); if (i === undefined) continue;
      const b = ours.map(r => r[i]);
      let jump = 0; for (let j = 1; j < a.length; j++) jump = Math.max(jump, Math.abs((b[j] - b[j - 1]) - (a[j] - a[j - 1])));
      const da = a.at(-1) - a[0], db = b.at(-1) - b[0];
      rows.push({ name, a, b, da, db, jump, flip: Math.abs(da) > .5 && Math.sign(da) !== Math.sign(db), ratio: db / da });
    }
    return { key: sw.key, path: sw.path, angles: sw.angles, rows };
  });
}
const median = v => { const s = [...v].sort((x, y) => x - y); return s.length ? s[s.length >> 1] : NaN; };
module.exports = { M, Skeleton, Muscles, skeleton, muscles, reference, sweepPose, compareAll, median, JUMP, root };
