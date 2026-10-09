'use strict';
/* Запекание поз: спецификации упражнений → ключи (упакованные углы) → src/js/09bp-poses.js
   node tools/mannequin/author.js [--only id,id] [--check] */
const fs = require('node:fs'), path = require('node:path');
const M = require('../../src/js/09bm-mannequin.js');
const { ctx } = require('./compose.js');
const DIR = path.join(__dirname, 'exercises');
function loadSpecs() {
  const all = {};
  for (const f of fs.readdirSync(DIR).filter(f => f.endsWith('.js')).sort()) {
    let mod;
    try { mod = require(path.join(DIR, f)); } catch (e) { console.error('Спецификации ' + f + ' не загрузились: ' + e.message); continue; }
    for (const [id, spec] of Object.entries(mod)) { if (all[id]) throw Error('Повтор упражнения ' + id + ' в ' + f); all[id] = { ...spec, file: f }; }
  }
  return all;
}
const round = (v, k) => Math.round(v * k) / k;
function bakeOne(id, spec) {
  const C = ctx(spec.equipment || []), ts = spec.keys || [0, .25, .5, .75, 1];
  const keys = ts.map(t => {
    let q;
    try { q = spec.pose(t, C); } catch (e) { e.message = `${id} t=${t}: ${e.message}`; throw e; }
    const v = M.pack(q).map((x, i) => i >= 3 && i < 7 ? round(x, 1e5) : round(x, 100));
    return { t, v, hands: { L: q.hands?.L || 'relaxed', R: q.hands?.R || 'relaxed' } };
  });
  const out = { keys, equipment: spec.equipment || [], contacts: spec.contacts || [] };
  if (spec.gripRadius) out.gripRadius = spec.gripRadius;
  if (spec.dynamic) out.dynamic = spec.dynamic;
  if (spec.laterality) out.laterality = spec.laterality;
  return out;
}
function bakeAll({ only } = {}) {
  const specs = loadSpecs(), out = {};
  for (const [id, spec] of Object.entries(specs)) if (!only || only.includes(id)) out[id] = bakeOne(id, spec);
  return out;
}
function write(entries, file = path.join(__dirname, '../../src/js/09bp-poses.js')) {
  const body = Object.entries(entries).filter(([id]) => !id.startsWith('_')).map(([id, e]) => JSON.stringify(id) + ':' + JSON.stringify(e)).join(',\n');
  fs.writeFileSync(file, `/* Сгенерировано tools/mannequin/author.js — не править вручную. Ключи поз манекена и инвентарь упражнений. */\nconst CATALOG_POSES={\n${body}\n};\nif(typeof module!=='undefined'&&module.exports)module.exports=CATALOG_POSES;\n`);
  return file;
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(',');
  const entries = bakeAll({ only });
  if (!only) console.log('Записано:', write(entries), Object.keys(entries).length, 'упражнений');
  else console.log(JSON.stringify(Object.keys(entries)));
}
module.exports = { loadSpecs, bakeOne, bakeAll, write };
