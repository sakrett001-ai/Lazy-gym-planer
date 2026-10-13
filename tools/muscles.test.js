'use strict';
/* Мышцы: расчёт путей совпадает с MuJoCo на родной модели MyoSim (эталон — tools/muscles/mujoco_ref.py). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const Muscles = require('../src/js/09br-muscles.js');

const ref = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'muscles/fixtures/mujoco-paths.json.gz'))));
const toEl = e => e[0] === 's' ? { s: e[1] } : { w: { t: e[0], c: e[1], m: e[2], r: e[3], side: e[4] } };

test('path lengths equal MuJoCo for every MyoSim tendon in four poses (wrapping round spheres and cylinders)', () => {
  let worst = { d: 0 }, wrapped = 0, n = 0;
  for (const [k, pose] of ref.poses.entries()) for (const t of pose) {
    const el = t.path.map(toEl), L = Muscles.path(el).length, d = Math.abs(L - t.length);
    n++; if (el.some(e => e.w)) wrapped++;
    if (d > worst.d) worst = { d, name: t.name, pose: k, L, ref: t.length };
  }
  assert(n >= 1600 && wrapped > 300, `${n} paths, ${wrapped} with wrapping objects`);
  assert(worst.d < 2e-6, `largest difference ${(worst.d * 1000).toFixed(4)} mm (${worst.name}, pose ${worst.pose}: ${worst.L} vs ${worst.ref})`);
});

test('drawn points follow the wrapping surface and sum to the path length', () => {
  let worst = 0;
  for (const t of ref.poses[2]) {
    const el = t.path.map(toEl), p = Muscles.path(el, .002);
    let L = 0; for (let i = 1; i < p.points.length; i++) L += Math.hypot(...[0, 1, 2].map(k => p.points[i][k] - p.points[i - 1][k]));
    /* ломаная по дуге чуть короче дуги: хорда шага 2 мм на радиусе ≥ 5 мм */
    worst = Math.max(worst, (p.length - L) / p.length);
    assert(L <= p.length + 1e-9, `${t.name}: polyline longer than the path`);
  }
  assert(worst < .002, `polyline shorter than the path by ${(worst * 100).toFixed(3)} %`);
});

/* ---------- данные приложения: src/data/muscles.bin ---------- */
const L = require('./muscles/sweeplib.js');
const skel = L.skeleton(), md = L.muscles(), bound = Muscles.bind(md, skel);
const GROUPS = new Set(['chest', 'delt_f', 'delt_s', 'delt_r', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'traps', 'midback', 'lats', 'lowback', 'glutes', 'quads', 'hams', 'calves']);
const pose = (set = {}) => {
  const q = L.M.neutral(); for (const s of ['L', 'R']) { q[s].shoulder = [0, 0, 0]; q[s].elbow = 0; }
  for (const [k, v] of Object.entries(set)) { const p = k.split('.'); let o = q; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p.at(-1)] = v; }
  const R = L.M.catalogPose(q); return { R, m: L.Skeleton.frames(R, L.M.bodyData(R), skel.bones) };
};
const lengths = set => { const { m } = pose(set); return new Map(Muscles.layout(bound, m).map((p, i) => [bound[i].name, p.length])); };

test('muscle data: every muscle sits on existing bones, has an anatomical name and app groups, both sides', () => {
  assert.equal(md.muscles.length, 462);
  for (const mu of md.muscles) {
    assert(md.parts[mu.part], `${mu.name}: part ${mu.part}`);
    for (const g of mu.group) assert(GROUPS.has(g), `${mu.name}: unknown group ${g}`);
  }
  const names = new Set(md.muscles.map(m => m.name));
  for (const n of names) if (/_r$/.test(n)) assert(names.has(n.replace(/_r$/, '_l')), `${n} without a left twin`);
  /* в нейтральной позе левая и правая мышцы одной длины (левая рука и мышцы лопатки — зеркальные копии правых) */
  const len = lengths();
  let worst = 0;
  for (const [n, v] of len) if (n.endsWith('_r')) worst = Math.max(worst, Math.abs(v - len.get(n.replace(/_r$/, '_l'))));
  assert(worst < .05, `left and right differ by ${worst.toFixed(3)} cm`);
  /* выделение в разборе: у каждой группы приложения есть мышцы */
  const used = new Set(md.muscles.flatMap(m => m.group));
  for (const g of GROUPS) assert(used.has(g), `no muscle in group ${g}`);
});

/* Функция мышц после переноса на манекен — против MyoSim (MuJoCo, fixtures/sweeps.json.gz): тот же сустав
   поворачивается на тот же угол, ход длины каждой мышцы, пересекающей сустав, сравнивается с эталоном.
   Допуск хода — 0,5 см или 30 % (манекен на 3 % выше моделей, кости подогнаны под ANSUR II).
   Известные расхождения (README, «Мышцы») записаны здесь же:
   - плечо: лопатка манекена ходит за рукой по своему ритму, не по связям MoBL, — у длинной головки двуглавой при
     отведении и подостной при сгибании направление хода другое, у мышц, начинающихся на лопатке, размах отличается;
   - пронация: ось вращения лучевой кости у манекена проходит через центр запястья — размах меньше (×0,5);
   - туловище: шарниры поясницы манекена стоят в центре корпуса, а не в телах позвонков (≈6 см кзади), — при наклоне
     вперёд разгибатели меняют длину вдвое сильнее, а мышцы, лежащие между осью манекена и настоящей осью (пучки большой
     поясничной от поперечных отростков L1–L3, нижние пучки косых мышц живота), — в другую сторону. */
const EXPECT = {
  elbow: { near: 1 }, pron: { near: .85 }, wrist_flex: { near: .85 }, wrist_dev: { near: .9 },
  sh_abd: { near: .55, flips: ['BIClong'] }, sh_flex: { near: .6, flips: ['INFSP'] }, sh_rot: { near: 1 },
  hip_flex: { near: 1 }, hip_abd: { near: 1 }, hip_rot: { near: 1 }, knee: { near: 1 }, ankle: { near: .8 }, subtalar: { near: .55 },
  trunk_flex: { ratio: [1.6, 2.5], flips: /^(Ps_L[1-3]_TP|EO[56]|IO[3-5])_[rl]$/ }, trunk_bend: { near: .85, ratio: [.85, 1.4] }, trunk_rot: { near: .6, ratio: [.85, 1.5] },
};
test('after the transfer every limb muscle lengthens and shortens like in MyoSim (moment-arm signs and size)', () => {
  const res = L.compareAll(undefined, skel, md);
  assert.deepEqual(res.map(s => s.key).sort(), Object.keys(EXPECT).sort());
  for (const sw of res) {
    const e = EXPECT[sw.key], flips = sw.rows.filter(r => r.flip).map(r => r.name);
    const allowed = n => e.flips instanceof RegExp ? e.flips.test(n) : (e.flips || []).includes(n);
    assert.deepEqual(flips.filter(n => !allowed(n)), [], `${sw.key}: wrong direction of length change`);
    const jumps = sw.rows.filter(r => r.jump > L.JUMP).map(r => `${r.name} ${r.jump.toFixed(2)}`);
    assert.deepEqual(jumps, [], `${sw.key}: path jumps over a wrapping surface`);
    if (e.near) {
      const near = sw.rows.filter(r => Math.abs(r.db - r.da) <= Math.max(.5, .3 * Math.abs(r.da))).length / sw.rows.length;
      assert(near >= e.near, `${sw.key}: only ${(near * 100).toFixed(0)} % of ${sw.rows.length} muscles within tolerance`);
    }
    if (e.ratio) {
      const r = L.median(sw.rows.filter(x => Math.abs(x.da) > .5).map(x => x.ratio));
      assert(r >= e.ratio[0] && r <= e.ratio[1], `${sw.key}: median ratio ${r.toFixed(2)}`);
    }
  }
});

/* Мышцы лопатки (DAS3): эталона длины нет (OpenSim здесь не запускается), проверяется функция — какие мышцы
   укорачиваются при движениях лопатки (Neumann D. A. Kinesiology of the Musculoskeletal System, 3-е изд., 2017, гл. 5):
   поднимают — верхняя часть трапециевидной, поднимающая лопатку, ромбовидные; опускают — нижняя часть трапециевидной и
   малая грудная; протракция — передняя зубчатая и малая грудная; ретракция — средняя часть трапециевидной и ромбовидные;
   рука вверх (лопатка поворачивается суставной впадиной вверх) — верхняя и нижняя части трапециевидной и нижние зубцы
   передней зубчатой укорачиваются, а ромбовидные, поднимающая лопатку и малая грудная (поворачивают вниз) удлиняются. */
test('shoulder-blade muscles from DAS3 shorten in the movements they produce', () => {
  const base = lengths(), d = set => { const l = lengths(set); return n => l.get(n) - base.get(n); };
  const all = re => [...base.keys()].filter(n => re.test(n) && n.endsWith('_r'));
  const upper = /^(trap_clav_\d|trap_scap_[1-5])_r$/, middle = /^trap_scap_[6-8]_r$/, lower = /^trap_scap(_9|10|11)_r$/;
  const cases = [
    ['elevation', { 'R.girdle': [25, 0] }, [upper, /^lev_scap/, /^rhomboid/], [lower, /^pect_min/]],
    ['depression', { 'R.girdle': [-10, 0] }, [lower, /^pect_min/], [upper, /^lev_scap/]],
    ['protraction', { 'R.girdle': [0, 25] }, [/^serr_ant/, /^pect_min/], [middle, /^rhomboid/]],
    ['retraction', { 'R.girdle': [0, -20] }, [middle, /^rhomboid/], [/^serr_ant/, /^pect_min/]],
    ['arm up 120°', { 'R.shoulder': [0, 120, 0], 'R.girdle': [12, -12] }, [/^trap_clav/, /^trap_scap_[12]_r/, lower, /^serr_ant_[1-4]_r/], [/^rhomboid/, /^lev_scap/, /^pect_min/]],
  ];
  for (const [label, set, shorten, lengthen] of cases) {
    const dl = d(set);
    for (const re of shorten) for (const n of all(re)) assert(dl(n) < -.2, `${label}: ${n} should shorten, changes by ${dl(n).toFixed(2)} cm`);
    for (const re of lengthen) for (const n of all(re)) assert(dl(n) > .2, `${label}: ${n} should lengthen, changes by ${dl(n).toFixed(2)} cm`);
  }
});

/* Геометрия на позах каталога (вся проверка — npm run muscles:check): несколько упражнений с крайними положениями
   рук, ног и туловища — путь не глубже 2 см в костях и не выше 2,2 см над кожей (исключения — подмышечные складки). */
test('muscle paths stay out of bones and under the skin in catalog poses', () => {
  const { run, EXCEPT } = require('./muscles/check.js');
  const { fam } = run(['bbbench', 'squat', 'latpull', 'deadlift', 'dbcurl', 'crunch'], [0, .5, 1]);
  for (const [k, f] of Object.entries(fam)) {
    assert(f.bone <= 2, `${k}: ${f.bone.toFixed(2)} cm inside a bone (${f.boneAt})`);
    assert(f.skin <= (EXCEPT.skin[k] ?? 2.2), `${k}: ${f.skin.toFixed(2)} cm above the skin (${f.skinAt})`);
  }
});

/* проверки ловят порчу данных: перенесённое прикрепление меняет направление хода, точка в кости — глубину */
test('negative: a moved insertion and a path through bone are detected', () => {
  const copy = JSON.parse(JSON.stringify(md)), bic = copy.muscles.find(m => m.name === 'BIClong_r');
  /* прикрепление двуглавой — за локоть (8 см кзади по лучевой кости), путь — прямой от лопатки: при сгибании мышца
     удлиняется, как разгибатель */
  const last = bic.el.at(-1).s; last.p = [last.p[0], last.p[1], -8];
  bic.el = [bic.el[0], bic.el.at(-1)];
  const elbow = L.compareAll(undefined, skel, copy).find(s => s.key === 'elbow');
  assert(elbow.rows.find(r => r.name === 'BIClong').flip, 'moved biceps insertion is not reported');
  const G = require('./muscles/geometry.js'), pbs = G.prepareBones(skel), { m } = pose();
  const fi = skel.bones.findIndex(b => b.name === 'femur' && b.side === 'R'), o = fi * 12;
  const at = p => [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]);
  const through = G.boneRun(pbs, m, [at([-6, -10, 0]), at([6, -10, 0])]);
  assert(through.depth > .8 && through.deepAt === 'femurR', `a path across the femur shaft: depth ${through.depth.toFixed(2)} in ${through.deepAt}`);
});
