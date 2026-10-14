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
const GROUPS = new Set(['chest', 'delt_f', 'delt_s', 'delt_r', 'biceps', 'triceps', 'forearms', 'abs', 'obliques', 'traps', 'midback', 'lats', 'lowback', 'glutes', 'quads', 'hams', 'calves',
  'adductors', 'hipflex', 'serratus', 'cuff']);
const pose = (set = {}) => {
  const q = L.M.neutral(); for (const s of ['L', 'R']) { q[s].shoulder = [0, 0, 0]; q[s].elbow = 0; }
  for (const [k, v] of Object.entries(set)) { const p = k.split('.'); let o = q; for (let i = 0; i < p.length - 1; i++) o = o[p[i]]; o[p.at(-1)] = v; }
  const R = L.M.catalogPose(q); return { R, m: L.Skeleton.frames(R, L.M.bodyData(R), skel.bones) };
};
const lengths = set => { const { m } = pose(set); return new Map(Muscles.layout(bound, m).map((p, i) => [bound[i].name, p.length])); };

test('muscle data: every muscle sits on existing bones, has an anatomical name and app groups, both sides', () => {
  assert.equal(md.muscles.length, 530);   /* 4.32.0: +6 — поясничный и подвздошные пучки широчайшей; 4.34.0: +4 — верхние зубцы наружной косой;
                                              4.35.0: +42 — мышцы шеи, остистая (anatomy.js), гребенчатая (gait2392_import.py);
                                              4.36.0: +4 — задняя часть дельтовидной веером (anatomy.js, раздел 5);
                                              4.37.0: +12 — большая грудная и подостная веером (раздел 6) */
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
   - туловище: у манекена два шарнира поясницы (L5/S1 и L2/L3), у MyoSim — пять уровней L5/S1…L1/L2. С 4.26.0 шарниры
     стоят на высоте и глубине суставов MyoSim, а позвонки L4–L2 делят поворот грудного шарнира по уровням так же, как
     MyoSim (до 4.26.0 шарниры стояли на 10 и 24 см по центру корпуса: при наклоне разгибатели менялись вдвое сильнее,
     а пучки большой поясничной и нижние пучки косых — в другую сторону). Остаток — косые мышцы живота: в MyoSim их
     концы на теле-посреднике «Abdomen» (поворачивается на 0,64 сгибания поясницы сверх L5, в наклоне и повороте — только
     с L5), у манекена — на позвонке L3. Наружные косые при наклоне вперёд укорачиваются на 40 % меньше, нижние пучки
     внутренних при наклоне вбок — слабее, при повороте пучки IO4–IO5 меняют длину вдвое сильнее, EO5–EO6 — слабее. */
const EXPECT = {
  elbow: { near: 1 }, pron: { near: .85 }, wrist_flex: { near: .85 }, wrist_dev: { near: .9 },
  sh_abd: { near: .55, flips: ['BIClong'] }, sh_flex: { near: .6, flips: ['INFSP'] }, sh_rot: { near: 1 },
  hip_flex: { near: 1 }, hip_abd: { near: 1 }, hip_rot: { near: 1 }, knee: { near: 1 }, ankle: { near: .8 }, subtalar: { near: .55 },
  trunk_flex: { near: .9, ratio: [.9, 1.15] }, trunk_bend: { near: .95, ratio: [.9, 1.15] }, trunk_rot: { near: .75, ratio: [.65, 1] },
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
   передней зубчатой укорачиваются, а ромбовидные, поднимающая лопатку и малая грудная (поворачивают вниз) удлиняются.
   Подъём лопатки у манекена идёт с поворотом суставной впадиной вверх (нижний угол уходит наружу на 2–2,6 см), поэтому
   нижние пучки большой ромбовидной (с 4.34.0 — от T4–T5 к краю лопатки у нижнего угла; поворачивают вниз) в нём не
   укорачиваются — при подъёме проверяются малая и верхние пучки большой, а ромбовидные в целом (tools/muscles/README.md). */
test('shoulder-blade muscles from DAS3 shorten in the movements they produce', () => {
  const base = lengths(), d = set => { const l = lengths(set); return n => l.get(n) - base.get(n); };
  const all = re => [...base.keys()].filter(n => re.test(n) && n.endsWith('_r'));
  const upper = /^(trap_clav_\d|trap_scap_[1-5])_r$/, middle = /^trap_scap_[6-8]_r$/, lower = /^trap_scap(_9|10|11)_r$/;
  const rhomb = all(/^rhomboid/), up = d({ 'R.girdle': [25, 0] }), sum = rhomb.reduce((s, n) => s + up(n), 0);
  assert.equal(rhomb.length, 5);
  assert(sum < -2, `elevation: rhomboids as a whole should shorten, change by ${sum.toFixed(2)} cm`);
  const cases = [
    ['elevation', { 'R.girdle': [25, 0] }, [upper, /^lev_scap/, /^rhomboid_[1-3]_r$/], [lower, /^pect_min/]],
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

/* Мышцы шеи (4.35.0, anatomy.js): эталона длины нет — проверяется функция (Neumann D. A., 2017, гл. 10):
   грудино-ключично-сосцевидная сгибает шею, наклоняет её в свою сторону и поворачивает голову в противоположную;
   ременные разгибают, наклоняют и поворачивают в свою сторону; передняя и средняя лестничные сгибают, все лестничные
   наклоняют в свою сторону; поднимающая лопатку — разгибает. С 4.38.0 ось нижнего шарнира шеи проходит через тела
   позвонков (у диска C7–T1; до этого — у остистого отростка C7, и ременная мышца шеи при разгибании удлинялась).
   Грудино-ключично-сосцевидная сгибает нижний отдел шеи, а на уровне атлантозатылочного сустава у неё плечо
   разгибателя (Vasavada, Li, Delp, Spine 1998, 23: 412–422). Грудинно-затылочная часть (SCM1, к верхней выйной линии)
   проходит позади оси головы дальше всех: при разгибании шеи целиком (половина — внизу, половина — в суставе головы) она
   укорачивается на 0,6 см, ключично-сосцевидная с прикреплением ниже по отростку (SCM4) — почти не меняется (+0,1 см).
   В разгибании удлинение проверяется у SCM2 и SCM3; в сгибании укорачиваются все четыре части. Гребенчатая сгибает и
   приводит бедро; остистая разгибает грудной отдел — у манекена он жёсткий до L2/L3, ход есть только у пучка от L2. */
test('neck muscles, pectineus and spinalis shorten in the movements they produce', () => {
  const base = lengths(), d = set => { const l = lengths(set); return n => l.get(n) - base.get(n); };
  const all = re => [...base.keys()].filter(n => re.test(n));
  const cases = [
    ['neck flexion', { neck: [40, 0, 0] }, [/^SCM\d_r$/, /^SCAL(ant|med)\d_r$/], [/^SPL(cap|cerv)\d_r$/, /^lev_scap_\d_r$/]],
    ['neck extension', { neck: [-40, 0, 0] }, [/^SPL(cap|cerv)\d_r$/, /^lev_scap_\d_r$/], [/^SCM[23]_r$/, /^SCAL(ant|med)\d_r$/]],
    ['neck bend right', { neck: [0, 30, 0] }, [/^SCM\d_r$/, /^SPL(cap|cerv)\d_r$/, /^SCAL(ant|med|post)\d_r$/], [/^SCM\d_l$/, /^SCAL(ant|med|post)\d_l$/]],
    ['head turn left', { neck: [0, 0, 50] }, [/^SCM\d_r$/, /^SPL(cap|cerv)\d_l$/], [/^SCM\d_l$/, /^SPLcap\d_r$/]],
    ['hip flexion', { 'R.hip': [40, 0, 0] }, [/^pect_r$/], []],
    ['hip adduction', { 'R.hip': [0, -15, 0] }, [/^pect_r$/], []],
    ['trunk extension', { thoracic: [-20, 0, 0] }, [/^SPIN1_[rl]$/], []],
    ['trunk flexion', { thoracic: [30, 0, 0] }, [], [/^SPIN1_[rl]$/]],
  ];
  for (const [label, set, shorten, lengthen] of cases) {
    const dl = d(set);
    for (const re of shorten) { assert(all(re).length, `${label}: ${re}`); for (const n of all(re)) assert(dl(n) < -.2, `${label}: ${n} should shorten, changes by ${dl(n).toFixed(2)} cm`); }
    for (const re of lengthen) { assert(all(re).length, `${label}: ${re}`); for (const n of all(re)) assert(dl(n) > .2, `${label}: ${n} should lengthen, changes by ${dl(n).toFixed(2)} cm`); }
  }
});

/* Объём (этап М2, tools/muscles/volumes.js): мышца целиком — по МРТ (Riem et al., 2026; мужчины), пересчитанной на рост ×
   массу манекена; между линиями одной мышцы — как в исходной модели. Сумма объёмов линий мышцы равна МРТ с точностью
   округления данных (0,1 см³ на линию); у каждой линии — объём, сухожилия короче пути. */
test('muscle volumes: each MRI muscle is split over its lines, totals equal the MRI volume scaled to the mannequin', () => {
  const A = require('./muscles/fixtures/anatomy.json'), { GROUPS } = require('./muscles/volumes.js');
  const k = L.M.B.stature * L.M.B.mass / (A.mri.height * A.mri.mass);
  assert.equal(Object.keys(A.mri.male).length, 70);
  for (const [g, re] of GROUPS) for (const side of ['_r', '_l']) {
    const lines = md.muscles.filter(m => m.name.endsWith(side) && re.test(m.name.replace(/_[rl]$/, '')));
    assert(lines.length, `${g}: no lines`);
    const v = lines.reduce((s, m) => s + m.v, 0);
    assert(Math.abs(v - A.mri.male[g] * k) <= .06 * lines.length + .1, `${g}${side}: ${v.toFixed(1)} vs MRI ${(A.mri.male[g] * k).toFixed(1)} cm³`);
  }
  /* мышцы шеи (4.35.0) — по МРТ Zheng и др. (2013): доля от общего объёма мышц шеи, сумма двух сторон пополам */
  const { NECK, SPINALIS } = require('./muscles/volumes.js'), kn = L.M.B.stature * L.M.B.mass / (A.neck.height * A.neck.mass);
  for (const [g, re] of NECK) for (const side of ['_r', '_l']) {
    const lines = md.muscles.filter(m => m.name.endsWith(side) && re.test(m.name.replace(/_[rl]$/, '')));
    const v = lines.reduce((s, m) => s + m.v, 0), V = A.neck.percent[g] / 100 * A.neck.total / 2 * kn;
    assert(lines.length && Math.abs(v - V) <= .06 * lines.length + .1, `${g}${side}: ${v.toFixed(1)} vs MRI ${V.toFixed(1)} cm³`);
  }
  /* доли частей по препаратам (4.36.0, volumes.js, PART_SHARE): задняя часть дельтовидной — 29,1 % (Gómez и др., 2022),
     длинная головка двуглавой — 51 % (Murray и др., 2000) */
  const share = (all, part) => { const a = md.muscles.filter(m => m.name.endsWith('_r') && all.test(m.name)), b = a.filter(m => part.test(m.name)); return b.reduce((s, m) => s + m.v, 0) / a.reduce((s, m) => s + m.v, 0); };
  assert(Math.abs(share(/^DELT/, /^DELT3/) - .291) < .005, `posterior deltoid ${share(/^DELT/, /^DELT3/)}`);
  assert(Math.abs(share(/^BIC/, /^BIClong/) - .512) < .005, `biceps long head ${share(/^BIC/, /^BIClong/)}`);
  /* сухожилие — у своей кости при любом порядке точек пути (BELLY, at): путь задней части дельтовидной идёт от лопатки —
     сухожилие у плеча (в конце); пучки EO2–EO4 идут от рёбер — апоневроз у белой линии (в конце) */
  for (const n of ['DELT3_r', 'DELT3med_r', 'DELT3lat_r', 'EO2_r', 'EO3_r', 'EO4_r']) {
    const m = md.muscles.find(x => x.name === n); assert(m.t1 > 3 * m.t0, `${n}: tendon at the start (${m.t0}) instead of the end (${m.t1})`);
  }
  /* веер (4.37.0, volumes.js, FAN): линия, добавленная к линии модели, кончается там же, где она (у плеча), и объём
     части делится между её линиями поровну */
  const { FAN } = require('./muscles/volumes.js');
  for (const [n, p] of Object.entries(FAN)) for (const s of ['_r', '_l']) {
    const a = md.muscles.find(m => m.name === n + s), b = md.muscles.find(m => m.name === p + s);
    assert(a && b, `${n}${s}: no line`);
    assert.deepEqual(a.el[0], b.el[0], `${n}${s}: must end at the same insertion as ${p}`);
    assert(Math.abs(a.v - b.v) <= .1, `${n}${s}: volume ${a.v} vs ${b.v}`);
  }
  /* остистая — 7,3 % выпрямителя (Delp и др., 2001: поперечник × длина волокон) */
  assert(Math.abs(SPINALIS - .073) < .002, `spinalis share ${SPINALIS}`);
  const es = md.muscles.filter(m => m.name.endsWith('_r') && /^(IL_|LTpT_|LTpL_|SPIN\d_)/.test(m.name)), sp = es.filter(m => /^SPIN/.test(m.name));
  assert(Math.abs(sp.reduce((s, m) => s + m.v, 0) / es.reduce((s, m) => s + m.v, 0) - SPINALIS) < .005, 'spinalis volume share');
  for (const m of md.muscles) {
    assert(m.v > 0 && m.t0 >= 0 && m.t1 >= 0 && m.t0 + m.t1 < m.l0, `${m.name}: v ${m.v}, tendons ${m.t0} + ${m.t1}, path ${m.l0}`);
    assert(m.sk && m.sk.length === Muscles.SKIN_U.length, `${m.name}: skin samples`);
  }
  /* правая и левая — одного объёма */
  for (const m of md.muscles.filter(x => x.name.endsWith('_r'))) {
    const l = md.muscles.find(x => x.name === m.name.replace(/_r$/, '_l'));
    assert(Math.abs(m.v - l.v) < .15, `${m.name}: ${m.v} vs ${l.v}`);
  }
});

/* Исходные модели согласуются с МРТ — независимая проверка данных: у модели ног Rajagopal объёмы взяты из МРТ
   Handsfield et al. (2014) для человека 170 см, 75 кг (сила = 60 Н/см² · объём / длина волокон); пересчитанные обратно,
   они совпадают с МРТ Riem et al. в пределах 30 % (медиана — в 10 %). У MoBL-ARMS и DAS3 удельное напряжение не
   задано явно: отношение F · Lopt к объёму по МРТ у мышц руки и плечевого пояса — одно и то же (35–90 Н/см², медиана
   50–65), то есть распределение сил по мышцам в моделях согласуется с объёмами. */
test('source muscle models agree with the MRI volumes (independent check of the data)', () => {
  const A = require('./muscles/fixtures/anatomy.json'), P = require('./muscles/fixtures/params.json'), { GROUPS, source } = require('./muscles/volumes.js');
  const ratios = [], sigma = [];
  for (const [g, re] of GROUPS) {
    const lines = [...new Set(md.muscles.map(m => m.name.replace(/_[rl]$/, '')).filter(n => re.test(n)))];
    const src = lines.map(n => [n, source(n)]).filter(([, p]) => p);
    if (src.length !== lines.length || g === 'Psoas major') continue;
    const fl = src.reduce((s, [, p]) => s + p[0] * p[1], 0);
    if (src.every(([n]) => P.rajagopal2016[n + '_r'])) {
      const r = fl / 60 / (A.mri.male[g] * 170 * 75 / (A.mri.height * A.mri.mass)); ratios.push(r);
      assert(r > .7 && r < 1.3, `${g}: Rajagopal ${(fl / 60).toFixed(0)} cm³ vs MRI, ratio ${r.toFixed(2)}`);
    } else {
      const sg = fl / (A.mri.male[g] * L.M.B.stature * L.M.B.mass / (A.mri.height * A.mri.mass)); sigma.push(sg);
      /* нижняя граница 34: широчайшая с 4.32.0 делится по шести пучкам DAS3 (MoBL-ARMS — три пучка без таза), у DAS3 она
         34,8 Н/см² (README, «Объём»); у остальных мышц руки и пояса — от 35 */
      assert(sg > 34 && sg < 90, `${g}: F·Lopt / V = ${sg.toFixed(1)} N/cm²`);
    }
  }
  const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
  assert(ratios.length >= 25 && med(ratios) > .9 && med(ratios) < 1.1, `legs: ${ratios.length} muscles, median ${med(ratios).toFixed(2)}`);
  assert(sigma.length >= 25 && med(sigma) > 50 && med(sigma) < 65, `arm and shoulder girdle: ${sigma.length} muscles, median ${med(sigma).toFixed(1)} N/cm²`);
});

/* Толщина: сухожилия не растягиваются, объём брюшка постоянен — при укорочении мышца утолщается. Площадь сечения вдоль
   брюшка (веретено) в сумме даёт объём; у кожи сечение сплющивается с той же площадью. */
test('muscle thickness: constant belly volume, thicker when shorter, flattened under the skin with the same area', () => {
  const bic = bound.find(m => m.name === 'BIClong_r');
  const vol = L0 => { const b = Muscles.body(bic, L0); let v = 0; const n = 2000; for (let i = 0; i < n; i++) { const s = b.t0 + b.lb * (i + .5) / n, r = Muscles.radiusAt(b, s); v += Math.PI * r * r * b.lb / n; } return { v, b }; };
  for (const f of [.85, 1, 1.15]) {
    const { v, b } = vol(bic.l0 * f);
    assert(Math.abs(v - bic.v) / bic.v < .04, `length ×${f}: belly volume ${v.toFixed(1)} vs ${bic.v}`);
    assert(Math.abs(b.t0 - bic.t0) < 1e-9, 'tendon at the start does not stretch');
  }
  const short = Muscles.body(bic, bic.l0 * .85), long = Muscles.body(bic, bic.l0 * 1.15);
  assert(short.area > long.area * 1.3, `shorter is thicker: ${short.area.toFixed(1)} vs ${long.area.toFixed(1)} cm²`);
  for (const [r, d] of [[2, 5], [2, 2], [2, .9], [3, -1]]) {
    const s = Muscles.section(r, { d });
    assert(Math.abs(s.ao * s.aw - r * r) < 1e-9, `area kept (r ${r}, depth ${d})`);
    assert(s.ao >= Muscles.FLAT * r - 1e-9 && s.ao <= r + 1e-9, 'not thinner than FLAT·r');
    assert(s.ao - s.shift <= d - Muscles.SKIN_GAP + 1e-9, `outer edge under the skin with the gap (r ${r}, depth ${d})`);
  }
  /* в кадре: подъём штанги на бицепс — к верху движения длинная головка двуглавой короче и толще */
  const EQ = require('../src/js/09bn-equipment.js'), P = require('../src/js/09bp-poses.js'), rig = EQ.rig(P.bbcurl);
  const area = t => { const R = rig(t), m = L.Skeleton.frames(R, L.M.bodyData(R), skel.bones), p = Muscles.drawn(bic, m, 1.5); return Muscles.body(bic, p.length).area; };
  assert(area(1) > area(0) * 1.2, `biceps at the top ${area(1).toFixed(1)} vs bottom ${area(0).toFixed(1)} cm²`);
});

/* Геометрия на позах каталога (вся проверка — npm run muscles:check): несколько упражнений с крайними положениями
   рук, ног и туловища — путь не глубже 2 см в костях и не выше 2,2 см над кожей (исключения — подмышечные складки). */
test('muscle paths stay out of bones and under the skin in catalog poses', () => {
  const { run, EXCEPT } = require('./muscles/check.js');
  const { fam } = run(['bbbench', 'squat', 'latpull', 'deadlift', 'dbcurl', 'crunch'], [0, .5, 1]);
  for (const [k, f] of Object.entries(fam)) {
    assert(f.bone <= 2, `${k}: ${f.bone.toFixed(2)} cm inside a bone (${f.boneAt})`);
    assert(f.skin <= (EXCEPT.skin[k] ?? 2.2), `${k}: ${f.skin.toFixed(2)} cm above the skin (${f.skinAt})`);
    assert(f.body <= (EXCEPT.body[k] ?? 2.6), `${k}: muscle body ${f.body.toFixed(2)} cm above the skin (${f.bodyAt})`);
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
