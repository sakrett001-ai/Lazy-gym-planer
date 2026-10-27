'use strict';
/* Листы для владельца (кожа Anny, «было / стало»): node tools/anny-look/specs.js <папка> — пишет spec-*.json для sheet.mjs.
   1 — стойка с четырёх сторон; 2a…2c — по два упражнения из каждой группы каталога в фазах 0 / 0,5 / 1;
   3 — крупно: подмышка при руке вверх, пах в глубоком приседе, колено и локоть в полном сгибе, спина на скамье, голова. */
const fs = require('node:fs'), path = require('node:path');
const dir = path.resolve(process.argv[2] || 'qa/anny-look');
const GROUPS = [['Жимы', ['bbbench', 'chestpressm']], ['Тяги', ['bbrow', 'latpull']], ['Ноги', ['squat', 'lunge']], ['Пресс', ['crunch', 'hangknee']],
  ['Плечи', ['ohp', 'latraise']], ['Руки', ['bbcurl', 'pushdown']], ['На полу', ['pushup', 'bridge']]];
const sub = ['Вид «Манекен», свет и материал приложения. Слева — 4.61.0 (процедурная кожа), справа — сетка подтянутой Anny, которая гнётся по суставам манекена.',
  'Скелет, мышцы, кинематика, проверки и вид «Анатомия» — без изменений; меняется только видимая форма тела.'];
const specs = {};
specs['1-stance'] = { title: 'Кожа Anny: стойка с четырёх сторон', sub, rows: [{ title: 'Нейтральная стойка', panels: ['front', 'side', 'back', 'angle'].map(cam => ({ id: 'stance', t: 0, cam, w: 300, h: 520, label: { front: 'спереди', side: 'сбоку', back: 'сзади', angle: 'три четверти' }[cam] })) }] };
const parts = [GROUPS.slice(0, 3), GROUPS.slice(3, 5), GROUPS.slice(5)];
parts.forEach((gs, k) => {
  specs['2' + 'abc'[k] + '-exercises'] = { title: `Кожа Anny: упражнения по группам (${k + 1} из 3), фазы 0 / 0,5 / 1`, sub,
    rows: gs.flatMap(([g, ids]) => ids.map(id => ({ title: `${g}: ${id}`, panels: [0, .5, 1].map(t => ({ id, t, cam: 'angle', w: 290, h: 300, label: `t = ${String(t).replace('.', ',')}` })) }))) };
});
const Z = (id, t, cam, focus, span, label) => ({ id, t, cam, focus, span, w: 300, h: 300, label });
specs['3-closeups'] = { title: 'Кожа Anny: крупные планы', sub, rows: [
  { title: 'Подмышка при руке вверх', panels: [Z('latpull', 0, 'front', 'shL', .42, 'тяга верхнего блока, t = 0, спереди'), Z('ohp', 0, 'back', 'shR', .42, 'жим стоя, t = 0, сзади'), Z('pullup', 0, 'angle', 'shL', .45, 'подтягивания, t = 0')] },
  { title: 'Пах в глубоком приседе', panels: [Z('squat', 1, 'front', 'hip', .5, 'присед, низ, спереди'), Z('squat', 1, 'angle', 'hipL', .5, 'присед, низ, три четверти'), Z('goblet', 1, 'front', 'hip', .5, 'гоблет-присед, низ')] },
  { title: 'Колено и локоть в полном сгибе', panels: [Z('squat', 1, 'side', 'knL', .4, 'колено: присед, низ'), Z('legcurl', 1, 'side', 'knL', .4, 'колено: сгибание ног'), Z('bbcurl', 1, 'side', 'elL', .38, 'локоть: подъём штанги, верх')] },
  { title: 'Спина на скамье, голова и лицо', panels: [Z('bbbench', 1, 'side', 'hipL', .9, 'жим лёжа, низ, сбоку'), Z('stance', 0, 'front', 'head', .3, 'голова спереди'), Z('stance', 0, 'side', 'head', .3, 'голова сбоку')] }
] };
fs.mkdirSync(dir, { recursive: true });
for (const [k, s] of Object.entries(specs)) fs.writeFileSync(path.join(dir, `spec-${k}.json`), JSON.stringify(s));
console.log(Object.keys(specs).map(k => path.join(dir, `spec-${k}.json`)).join('\n'));
