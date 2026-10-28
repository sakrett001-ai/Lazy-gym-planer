'use strict';
/* Входы сборки кожи Anny (build.py пишет их в заголовок src/data/anny.bin, tools/anny.test.js сверяет):
   files — sha256 файлов, из которых собрана сетка (подгонка, сборка, одобренные параметры Anny);
   stance — sha256 нейтральной стойки манекена: рамки сегментов и суставы пальцев расслабленной кисти (стойка — поза
   «в покое» скиннинга: сменилась стойка — сетку нужно собрать заново).
   node tools/anny-look/inputs.js — печатает {files, stance}. */
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '../..');
const FILES = ['tools/anny-look/fit.json', 'tools/anny-look/build.py', 'tools/anny-look/anny_look.py', 'tools/anny-look/correctives.py', 'tools/anny-look/common.py',
  'tools/anny-look/sculpt.js', 'tools/anny-look/compare.js', 'tools/anny-look/hands.js', 'tools/anny-look/export.js', 'tools/skin-anny/anny_pose.py', 'tools/skin-anny/anny_body.py', 'tools/skin-anny/result/anny-toned.json', 'tools/anny-look/look.json'];
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
function filesHash(read = f => fs.readFileSync(path.join(root, f))) { return sha(Buffer.concat(FILES.flatMap(f => [Buffer.from(f + '\n'), read(f)]))); }
function stanceHash(M = require(root + '/src/js/09bm-mannequin.js')) {
  const R = M.catalogPose(M.neutral()), r = v => Math.round(v * 1e4) / 1e4, out = {};
  for (const [k, f] of Object.entries(R.frames)) out[k] = [f.o, f.x, f.y, f.z].map(a => a.map(r));
  for (const s of M.SIDES) { const h = M.handShape('relaxed', s, 1.4); out['hand-' + s] = [...h.fingers, h.thumb].map(f => f.pts.map(p => p.map(r))); }
  return sha(JSON.stringify(out));
}
module.exports = { FILES, filesHash, stanceHash, inputs: () => ({ files: filesHash(), stance: stanceHash() }) };
if (require.main === module) console.log(JSON.stringify(module.exports.inputs()));
