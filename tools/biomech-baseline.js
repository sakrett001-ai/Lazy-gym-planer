#!/usr/bin/env node
'use strict';
/* Прогон биомеханического валидатора по текущему объёмному каталогу (ex.anim.catalogRig).
   node tools/biomech-baseline.js [--samples 41] [--json docs/biomech-baseline.json] [--only id,id] */
const fs = require('node:fs'), path = require('node:path');
const { loadModel } = require('./biomechanics-audit');
const { checkClip } = require('./biomech/validator');

function run({ samples = 41, only = null } = {}) {
  const { EX } = loadModel();
  const report = [];
  for (const ex of EX) {
    if (only && !only.includes(ex.id)) continue;
    const issues = checkClip(t => ex.anim.catalogRig(t), { samples });
    report.push({ id: ex.id, name: ex.name, eq: ex.eq.flat(), basis: ex.anim.catalogRig(0).basis, issues });
  }
  return report;
}
function summarize(report) {
  const byRule = {}, errors = report.filter(r => r.issues.some(i => i.severity === 'error')), warnOnly = report.filter(r => r.issues.length && !r.issues.some(i => i.severity === 'error'));
  for (const r of report) for (const rule of new Set(r.issues.filter(i => i.severity === 'error').map(i => i.rule))) byRule[rule] = (byRule[rule] || 0) + 1;
  return { exercises: report.length, withErrors: errors.length, warningsOnly: warnOnly.length, clean: report.length - errors.length - warnOnly.length, errorsByRule: byRule };
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), out = arg('--json');
  const report = run({ samples, only }), sum = summarize(report);
  if (out) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.writeFileSync(out, JSON.stringify({ summary: sum, report }, null, 1) + '\n'); }
  console.log(`Упражнений: ${sum.exercises}; с грубыми ошибками: ${sum.withErrors}; только предупреждения: ${sum.warningsOnly}; чисто: ${sum.clean}`);
  console.log('Грубые ошибки по правилам (сколько упражнений):', sum.errorsByRule);
  if (only || process.argv.includes('--verbose')) for (const r of report) {
    console.log(`\n${r.id} — ${r.name} [${r.basis}]`);
    for (const i of r.issues) console.log(`  ${(i.severity === 'error' ? 'ОШИБКА' : 'предупр').padEnd(8)} ${i.rule.padEnd(18)} t=${i.t} ×${i.frames} ${i.detail}${i.depth != null && i.rule !== 'rom' ? ' (' + i.depth + ' ' + i.unit + ')' : ''}`);
  }
}
module.exports = { run, summarize };
