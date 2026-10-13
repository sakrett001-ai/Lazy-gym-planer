'use strict';
/* Кости манекена в нейтральной позе — в рамке грудной клетки (см; X влево, Y вверх, Z вперёд; начало — рамка кости ribcage).
   Для каждой кости: вершины в этой рамке и матрица «рамка грудной клетки → рамка кости» (3×4 по строкам).
   Нужно для посадки мышц других моделей (tools/muscles/das3_import.py): их кости совмещаются с нашими в одной рамке,
   а точки прикрепления потом переводятся в рамку своей кости.
   node tools/muscles/neutral.js кость,кость… > выход.json */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
const { inverse } = require('./geometry.js');

const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const want = new Set((process.argv[2] || '').split(',').filter(Boolean));
const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), skel.bones);
const key = b => b.name + (b.side || '');
const ri = skel.bones.findIndex(b => b.name === 'ribcage'), toRib = inverse(m, ri);
const apply = (i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
const out = {};
skel.bones.forEach((b, i) => {
  if (want.size && !want.has(key(b))) return;
  const v = [], toBone = inverse(m, i);
  for (let k = 0; k < b.pos.length; k += 3) v.push(toRib(apply(i, [b.pos[k], b.pos[k + 1], b.pos[k + 2]])).map(x => +x.toFixed(3)));
  /* «рамка грудной клетки → рамка кости» — по образам начала и базисных векторов */
  const ribToWorld = p => apply(ri, p), o = toBone(ribToWorld([0, 0, 0]));
  const cols = [[1, 0, 0], [0, 1, 0], [0, 0, 1]].map(e => toBone(ribToWorld(e)).map((x, r) => x - o[r]));
  out[key(b)] = { v, f: Array.from(b.idx), T: [0, 1, 2].map(r => [cols[0][r], cols[1][r], cols[2][r], o[r]].map(x => +x.toFixed(6))),
    meta: Object.fromEntries(['gl', 'ac', 'ia'].filter(k => b[k]).map(k => [k, b[k]])) };
});
process.stdout.write(JSON.stringify(out));
