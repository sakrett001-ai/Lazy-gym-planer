'use strict';
/* Эталон пропорций манекена из антропометрического обследования армии США ANSUR II (2012).
   node tools/mannequin/anthro-ref.js <ANSUR_II_MALE_Public.csv> [выход.json]
   Берёт мужчин ростом 170–180 см и массой 72–84 кг (как манекен: 175 см, 78 кг) и записывает квартили
   каждого замера (мм → см). Исходные таблицы в репозиторий не кладём: они большие и есть в открытом доступе
   (https://www.openlab.psu.edu/ansur2/); в репозитории — только сводка tools/mannequin/anthro-ansur2.json. */
const fs = require('node:fs'), path = require('node:path');
const src = process.argv[2];
if (!src) { console.error('укажите путь к ANSUR_II_MALE_Public.csv'); process.exit(1); }
const out = path.resolve(process.argv[3] || path.join(__dirname, 'anthro-ansur2.json'));
const lines = fs.readFileSync(src, 'latin1').split(/\r?\n/).filter(Boolean);
const head = lines[0].split(',').map(s => s.trim()), rows = lines.slice(1).map(l => l.split(','));
const col = k => head.indexOf(k);
const FILTER = { stature: [1700, 1800], weightkg: [720, 840] }; /* мм; масса — в десятых долях кг */
const sub = rows.filter(r => Object.entries(FILTER).every(([k, [a, b]]) => { const v = +r[col(k)]; return v >= a && v <= b; }));
const META = new Set(['subjectid', 'Gender', 'Date', 'Installation', 'Component', 'Branch', 'PrimaryMOS', 'SubjectsBirthLocation',
  'SubjectNumericRace', 'Ethnicity', 'DODRace', 'Age', 'Heightin', 'Weightlbs', 'WritingPreference']);
const q = (v, p) => { const i = (v.length - 1) * p, lo = Math.floor(i); return v[lo] + (v[Math.min(lo + 1, v.length - 1)] - v[lo]) * (i - lo); };
const values = {};
for (const k of head) {
  if (META.has(k)) continue;
  /* мм → см; масса записана в десятых долях кг → кг: делитель один и тот же */
  const v = sub.map(r => +r[col(k)]).filter(Number.isFinite).sort((a, b) => a - b);
  values[k] = [.25, .5, .75].map(p => +(q(v, p) / 10).toFixed(1));
}
const ages = sub.map(r => +r[col('Age')]).sort((a, b) => a - b);
const json = JSON.stringify({
  source: 'ANSUR II (2012 Anthropometric Survey of U.S. Army Personnel), мужчины; данные правительства США, опубликованы для свободного использования',
  citation: 'Gordon C.C., Blackwell C.L., Bradtmiller B. et al. 2012 Anthropometric Survey of U.S. Army Personnel: Methods and Summary Statistics. NATICK/TR-15/007, 2014',
  url: 'https://www.openlab.psu.edu/ansur2/',
  filter: 'рост 170–180 см, масса 72–84 кг', n: sub.length, ageMedian: q(ages, .5),
  units: 'см (масса — кг)', quartiles: 'p25, p50, p75', values
}, null, 1).replace(/\[\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)\s+\]/g, '[$1, $2, $3]'); /* квартили — в одну строку */
fs.writeFileSync(out, json + '\n');
console.log(`${path.relative(process.cwd(), out)}: ${sub.length} человек, ${Object.keys(values).length} замеров`);
