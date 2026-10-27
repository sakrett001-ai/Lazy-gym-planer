'use strict';
/* Позы для корректирующих форм кожи Anny (correctives.py): матрицы скиннинга рамок манекена (AnnySkin.skinMats) и углы
   суставов (Mannequin.jointAngles) в позах «сустав в конце амплитуды». Только чтение кода приложения.
   node tools/anny-look/sculpt.js <frames.json> <out.json>   (frames.json — список имён рамок, как у build.py)
   node tools/anny-look/sculpt.js --sdf <поза> <in.json> <out.json> — знаковое расстояние до процедурной кожи позы и его
     градиент в точках (in.json: {points: [[x,y,z]…] (каталог), side: 'L'|'R', parts: ['torso','ua',…]} — части по
     compare.js: sdf.part) для форм «к процедурной коже» (correctives.py, conform) */
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const M = require(root + '/src/js/09bm-mannequin.js'), A = require(root + '/src/js/09bs-anny.js');
/* позы: обе стороны сразу (формы левой и правой стороны — отдельные, их области не пересекаются) */
const POSES = {
  /* руки над головой — отведение в плоскости лопатки (тяги сверху, жимы над головой, подтягивания) */
  armsUp: q => { for (const s of M.SIDES) { q[s].shoulder = [20, 160, 0]; q[s].elbow = 10; } },
  /* руки прямо вверх, конец амплитуды (разгибания из-за головы, «прыжки с разведением», пуловер, «супермен»: 167–176°) */
  armsOverhead: q => { for (const s of M.SIDES) { q[s].shoulder = [20, 176, 0]; q[s].elbow = 5; } },
  /* руки в стороны на уровне плеч */
  armsSide: q => { for (const s of M.SIDES) { q[s].shoulder = [0, 90, 0]; q[s].elbow = 6; } },
  /* локоть в полном сгибе (сгибание на бицепс, верх) */
  elbows: q => { for (const s of M.SIDES) { q[s].elbow = 145; q[s].pron = -60; } },
  /* колено в полном сгибе при бедре в стойке (сгибание ног) */
  knees: q => { for (const s of M.SIDES) { q[s].knee = 140; } },
  /* бедро в глубоком сгибании, колено согнуто (присед, «велосипед», подъём коленей) */
  hips: q => { for (const s of M.SIDES) { q[s].hip = [120, 8, 10]; q[s].knee = 90; } }
};
const poseR = name => { const q = M.neutral(); POSES[name](q); return M.catalogPose(q); };
module.exports = { POSES, poseR };
if (require.main === module) {
  if (process.argv[2] === '--sdf') {
    const CMP = require('./compare.js'), R = poseR(process.argv[3]), inp = JSON.parse(fs.readFileSync(process.argv[4], 'utf8'));
    const sdf = CMP.proceduralSDF(R), f = p => Math.min(...inp.parts.map(k => sdf.part(k, inp.side, p))), h = .05;
    const d = [], g = [];
    for (const p of inp.points) {
      const v = f(p), gr = [0, 1, 2].map(i => { const a = p.slice(), b = p.slice(); a[i] += h; b[i] -= h; return (f(a) - f(b)) / (2 * h); }), l = Math.hypot(...gr) || 1;
      d.push(Math.round(v * 1e4) / 1e4); g.push(gr.map(x => Math.round(x / l * 1e6) / 1e6));
    }
    fs.writeFileSync(process.argv[5], JSON.stringify({ d, g }));
  } else {
    const frames = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
    const out = {};
    for (const name of Object.keys(POSES)) {
      const R = poseR(name), S = A.skinMats(R, { frames }), J = M.jointAngles(R);
      const joints = {}; for (const s of M.SIDES) for (const k of ['sh', 'el', 'hip', 'kn']) joints[k + s] = R[k + s];
      out[name] = { S: Array.from(S, v => Math.round(v * 1e9) / 1e9), angles: { L: J.L, R: J.R }, joints };
    }
    fs.writeFileSync(process.argv[3], JSON.stringify(out));
  }
}
