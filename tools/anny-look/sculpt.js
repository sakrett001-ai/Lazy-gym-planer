'use strict';
/* Позы для корректирующих форм кожи Anny (correctives.py): матрицы скиннинга рамок манекена (AnnySkin.skinMats) и углы
   суставов (Mannequin.jointAngles) в позах «сустав в конце амплитуды». Только чтение кода приложения.
   node tools/anny-look/sculpt.js <frames.json> <out.json>   (frames.json — список имён рамок, как у build.py) */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), A = require(root + '/src/js/09bs-anny.js');
const frames = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
/* позы: обе стороны сразу (формы левой и правой стороны — отдельные, их области не пересекаются) */
const POSES = {
  /* руки над головой — отведение в плоскости лопатки (тяги сверху, жимы над головой, подтягивания) */
  armsUp: q => { for (const s of M.SIDES) { q[s].shoulder = [20, 160, 0]; q[s].elbow = 10; } },
  /* руки в стороны на уровне плеч */
  armsSide: q => { for (const s of M.SIDES) { q[s].shoulder = [0, 90, 0]; q[s].elbow = 6; } },
  /* локоть в полном сгибе (сгибание на бицепс, верх) */
  elbows: q => { for (const s of M.SIDES) { q[s].elbow = 145; q[s].pron = -60; } },
  /* колено в полном сгибе при бедре в стойке (сгибание ног) */
  knees: q => { for (const s of M.SIDES) { q[s].knee = 140; } },
  /* бедро в глубоком сгибании, колено согнуто (присед, «велосипед», подъём коленей) */
  hips: q => { for (const s of M.SIDES) { q[s].hip = [120, 8, 10]; q[s].knee = 90; } }
};
const out = {};
for (const [name, set] of Object.entries(POSES)) {
  const q = M.neutral(); set(q); const R = M.catalogPose(q), S = A.skinMats(R, { frames }), J = M.jointAngles(R);
  const joints = {}; for (const s of M.SIDES) for (const k of ['sh', 'el', 'hip', 'kn']) joints[k + s] = R[k + s];
  out[name] = { S: Array.from(S, v => Math.round(v * 1e9) / 1e9), angles: { L: J.L, R: J.R }, joints };
}
fs.writeFileSync(process.argv[3], JSON.stringify(out));
