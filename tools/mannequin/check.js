'use strict';
/* Проверка запечённых поз: node tools/mannequin/check.js [--only id,id] [--samples 41] [--json file] [--quiet]
   Код выхода 1, если есть ошибки. */
const fs = require('node:fs');
const EQ = require('../../src/js/09bn-equipment.js');
const { checkClip } = require('../biomech/validator2.js');
const { bakeAll } = require('./author.js');
function run({ only, samples = 41, entries } = {}) {
  entries = entries || bakeAll({ only });
  const report = [];
  for (const [id, e] of Object.entries(entries)) {
    if (only && !only.includes(id)) continue;
    const t0 = Date.now(), rig = EQ.rig(e), issues = checkClip(rig, e, { samples });
    /* вариант без необязательного инвентаря (например, гантели вместо гири) */
    const optional = (e.equipment || []).some(q => q.optional || q.optionalNot);
    if (optional) for (const i of checkClip(rig, { ...e, has: () => false, contacts: (e.contacts || []).map(c => ({ ...c, optional: true })) }, { samples })) if (!issues.some(j => j.rule === i.rule && j.detail === i.detail)) issues.push({ ...i, detail: i.detail + ' [без доп. инвентаря]' });
    report.push({ id, issues, ms: Date.now() - t0 });
  }
  return report;
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), quiet = process.argv.includes('--quiet');
  const report = run({ only, samples });
  let errors = 0, warns = 0;
  for (const r of report) {
    const e = r.issues.filter(i => i.severity === 'error'), w = r.issues.filter(i => i.severity !== 'error');
    errors += e.length ? 1 : 0; warns += w.length && !e.length ? 1 : 0;
    if (quiet && !e.length) continue;
    console.log(`\n${r.id}: ошибок ${e.length}, предупреждений ${w.length} (${r.ms} мс)`);
    for (const i of [...e, ...w]) console.log(`  ${(i.severity === 'error' ? 'ОШИБКА' : 'предупр').padEnd(8)} ${i.rule.padEnd(15)} t=${String(i.t).padEnd(5)} ×${String(i.frames).padEnd(3)} ${i.detail}${i.depth != null ? ` (${i.depth} ${i.unit || 'см'})` : ''}`);
  }
  console.log(`\nИтого: ${report.length} упражнений; с ошибками ${errors}; только предупреждения ${warns}; чисто ${report.length - errors - warns}`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(report, null, 1));
  process.exitCode = errors ? 1 : 0;
}
module.exports = { run };
