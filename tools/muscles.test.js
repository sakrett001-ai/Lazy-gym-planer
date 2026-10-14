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
                                              4.37.0: +12 — большая грудная и подостная веером (раздел 6);
                                              4.40.0: + межрёберные — не трубки, а 44 пласта (md.sheets, раздел 7), число мышц-трубок прежнее */
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

/* ---------- межрёберные мышцы — пласты (4.40.0, tools/muscles/intercostals.js; данные формата 3 — sheets) ---------- */
const IC = require('./muscles/intercostals.js'), RCAGE = IC.ribcage(skel);
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/* часть сетки грудной клетки у точки (рамка грудной клетки): номер ребра стороны s или 0 — грудина с хрящами */
const ribAt = (s, p) => { let best = Infinity, k = -1; RCAGE.P.forEach((q, i) => { const d = Math.hypot(...sub3(q, p)); if (d < best) { best = d; k = i; } }); return { part: RCAGE.label[s][k], d: best }; };
/* расстояние от вертикальной оси грудной клетки */
const radial = p => Math.hypot(p[0], p[2] - RCAGE.zc);

test('intercostal sheets: 11 spaces × 2 layers × 2 sides, anatomical names, no app group, closed mesh facing outward', () => {
  assert.equal(md.version, 3);
  assert.equal(md.sheets.length, 44);   /* 4.40.0: + межрёберные — 11 промежутков × наружные и внутренние × 2 стороны */
  assert.equal(md.parts.icext, 'Наружные межрёберные'); assert.equal(md.parts.icint, 'Внутренние межрёберные');
  const names = new Set(md.sheets.map(s => s.name));
  for (const s of ['r', 'l']) for (let k = 1; k <= 11; k++) for (const l of ['e', 'i']) assert(names.has(`IC${l}${k}_${s}`), `нет IC${l}${k}_${s}`);
  for (const sh of md.sheets) {
    assert.equal(sh.part, sh.name[2] === 'e' ? 'icext' : 'icint');
    assert.deepEqual(sh.group, [], `${sh.name}: межрёберные не входят в группы приложения`);
    assert.deepEqual(sh.bone, ['ribcage', '']);
    assert(sh.a.length >= 4 && sh.a.length === sh.b.length && sh.a.length === sh.t.length, `${sh.name}: точек ${sh.a.length}`);
    const m = Muscles.sheetMesh(sh), N = Muscles.sheetNormals(sh);
    assert.equal(m.n, 4 * sh.a.length + 8); assert(m.idx.every(i => i >= 0 && i < m.n) && m.idx.length % 3 === 0);
    /* нормаль наружной поверхности смотрит от оси грудной клетки (внутренняя поверхность — вглубь) */
    sh.a.forEach((p, i) => { const q = [(p[0] + sh.b[i][0]) / 2, 0, (p[2] + sh.b[i][2]) / 2 - RCAGE.zc]; assert(dot3(N[i], q) > 0, `${sh.name}: нормаль ${i} внутрь`); });
    /* обход треугольников наружной поверхности согласован с нормалью */
    const [i0, i1, i2] = m.idx, v = k => [m.pos[k * 3], m.pos[k * 3 + 1], m.pos[k * 3 + 2]], f = [v(i1), v(i2)].map(q => sub3(q, v(i0)));
    assert(dot3([f[0][1] * f[1][2] - f[0][2] * f[1][1], f[0][2] * f[1][0] - f[0][0] * f[1][2], f[0][0] * f[1][1] - f[0][1] * f[1][0]], N[0]) > 0, `${sh.name}: обход наизнанку`);
  }
});

/* Пласт промежутка k — между рёбрами k и k+1: у верхнего края ближе всего ребро k (или его хрящ), у нижнего — k+1, верхний
   край выше нижнего; больше половины точек краёв — у костных рёбер; пласт на уровне рёбер — не снаружи от них и не глубже
   внутренних поверхностей рёбер (не в полости груди) */
test('each intercostal sheet lies between its own ribs, at the level of the ribs', () => {
  for (const sh of md.sheets) {
    const s = sh.side, k = sh.space; let bony = 0;
    sh.a.forEach((a, i) => {
      const b = sh.b[i], A = ribAt(s, a), B = ribAt(s, b);
      assert(A.part === k || A.part === 0, `${sh.name} ${i}: верхний край у ребра ${A.part}`);
      assert(B.part === k + 1 || B.part === 0, `${sh.name} ${i}: нижний край у ребра ${B.part}`);
      assert(a[1] > b[1], `${sh.name} ${i}: верхний край ниже нижнего`);
      if (A.part === k && B.part === k + 1) bony++;
    });
    assert(bony > sh.a.length / 2, `${sh.name}: у костных рёбер ${bony} из ${sh.a.length}`);
    /* уровень рёбер: вершины пласта — между наружной и внутренней поверхностью соседних рёбер (по расстоянию от оси, с запасом 1 мм
       снаружи и 3 мм внутри — у края ребра сетка грубая) */
    const m = Muscles.sheetMesh(sh);
    for (let v = 0; v < m.n; v++) {
      const q = [m.pos[v * 3], m.pos[v * 3 + 1], m.pos[v * 3 + 2]], near = RCAGE.P.filter(p => Math.hypot(...sub3(p, q)) < 2.5).map(radial);
      assert(near.length, `${sh.name}: вершина ${v} вдали от рёбер`);
      const r = radial(q);
      assert(r <= Math.max(...near) + .1, `${sh.name}: вершина ${v} снаружи рёбер на ${(r - Math.max(...near)).toFixed(2)} см`);
      assert(r >= Math.min(...near) - .3, `${sh.name}: вершина ${v} глубже рёбер на ${(Math.min(...near) - r).toFixed(2)} см`);
    }
  }
});

/* Толщина — по УЗИ здоровых мужчин (Yoshida и др., 2019): спереди у грудины (там только внутренние) — в пределах средних по
   промежуткам 1,97–2,79 мм, сбоку оба слоя вместе — 3,03–3,68 мм, сзади (от угла ребра к позвоночнику — только наружные) —
   4,25–4,85 мм; сбоку наружные — 60 % (отношение масс слоёв у препаратов: Wilson и др., 2001 — 52,5 и 34,4 г) */
test('intercostal thickness follows the ultrasound data and the layer split by mass', () => {
  const Ax = require('./muscles/fixtures/anatomy.json').intercostal, range = o => { const v = Object.values(o).map(x => x[0] / 10); return [Math.min(...v), Math.max(...v)]; };
  const ANT = range(Ax.yoshida2019.anterior), LAT = range(Ax.yoshida2019.lateral), POST = range(Ax.yoshida2019.posterior);
  const LM = IC.landmarks(skel, RCAGE), fExt = Ax.wilson2001.external / (Ax.wilson2001.external + Ax.wilson2001.internal);
  const az = (sh, i) => IC.azimuth(RCAGE, sh.side, [(sh.a[i][0] + sh.b[i][0]) / 2, 0, (sh.a[i][2] + sh.b[i][2]) / 2]);
  /* толщина слоя в азимуте th — по точкам пласта (линейно между точками, шаг ≈ 1 см: у излома профиля на 90° — до 3 %
     доли), 0 вне его */
  const tAt = (sh, th) => { const z = sh.a.map((_, i) => az(sh, i)); for (let i = 1; i < z.length; i++) if ((z[i - 1] - th) * (z[i] - th) <= 0) { const u = z[i - 1] === z[i] ? 0 : (th - z[i - 1]) / (z[i] - z[i - 1]); return sh.t[i - 1] + (sh.t[i] - sh.t[i - 1]) * u; } return 0; };
  let lateral = 0, front = 0, back = 0;
  for (const s of ['r', 'l']) for (let k = 1; k <= 11; k++) {
    const e = md.sheets.find(x => x.name === `ICe${k}_${s}`), n = md.sheets.find(x => x.name === `ICi${k}_${s}`), S = s.toUpperCase();
    for (const sh of [e, n]) for (const t of sh.t) assert(t >= 0 && t <= POST[1] + 1e-9, `${sh.name}: толщина ${t}`);
    const angle = Math.min(LM[S][k - 1].th.angle, LM[S][k].th.angle);
    /* сбоку (90°): вместе — как по УЗИ, доля наружных — по массам */
    const te = tAt(e, 90), ti = tAt(n, 90);
    if (te > 0 && ti > 0) { lateral++; assert(te + ti >= LAT[0] - 1e-3 && te + ti <= LAT[1] + 1e-3, `ICe/ICi${k}_${s}: сбоку ${(10 * (te + ti)).toFixed(2)} мм`); assert(Math.abs(te / (te + ti) - fExt) < .035, `${k}_${s}: доля наружных ${te / (te + ti)}`); }
    /* сзади от угла ребра — только наружные, толщина как сзади по УЗИ */
    e.t.forEach((t, i) => { if (az(e, i) > angle + 1 && i > 0) { back++; assert(t >= POST[0] - 1e-3 && t <= POST[1] + 1e-3, `ICe${k}_${s} ${i}: сзади ${(10 * t).toFixed(2)} мм`); } });
    n.t.forEach((t, i) => assert(!(az(n, i) > angle + 1), `ICi${k}_${s}: внутренние за углом ребра`));
    /* спереди, где наружных нет (дальше рёберно-хрящевых соединений), — окологрудинная часть внутренних */
    const eFront = az(e, e.a.length - 1);
    n.t.forEach((t, i) => { if (az(n, i) < eFront - 1) { front++; assert(t >= ANT[0] - 1e-3 && t <= ANT[1] + 1e-3, `ICi${k}_${s} ${i}: спереди ${(10 * t).toFixed(2)} мм`); } });
  }
  assert(lateral >= 16 && back >= 40 && front >= 30, `проверено: сбоку ${lateral}, сзади ${back}, спереди ${front}`);
  /* Независимая сверка — масса слоёв у препаратов (Wilson и др., 2001; 5 препаратов старше 65–70 лет): наружные и внутренние
     в промежутках 2, 4, 6, 8 обеих сторон от углов рёбер до рёберно-хрящевых соединений — 52,5 и 34,4 г, окологрудинная часть
     внутренних в промежутках 2–5 — 16,5 г. Нарисованные пласты (толщина по УЗИ молодых мужчин, плотность мышцы 1,06 г/см³)
     тяжелее или такие же (наружные ×1,75, внутренние ×1,38, окологрудинные ×1,0) — как у мышц шеи, где масса пожилого
     препарата (Borst) меньше объёма по МРТ в 1,25–1,5 раза (README, «Объём»); допуск ×0,8–2,5; ошибка в единицах (мм вместо
     см) дала бы ×10 или ×0,1 */
  const mid = (sh, i) => sh.a[i].map((v, j) => (v + sh.b[i][j]) / 2);
  const mass = (sh, lo, hi) => { let v = 0; for (let i = 1; i < sh.a.length; i++) { const m = (az(sh, i) + az(sh, i - 1)) / 2; if (m < lo || m > hi) continue;
    const w = (Math.hypot(...sub3(sh.a[i], sh.b[i])) + Math.hypot(...sub3(sh.a[i - 1], sh.b[i - 1]))) / 2 - .3; v += w * Math.hypot(...sub3(mid(sh, i), mid(sh, i - 1))) * (sh.t[i] + sh.t[i - 1]) / 2; } return 1.06 * v; };
  let me = 0, mi = 0, mp = 0;
  for (const S of ['R', 'L']) {
    const s = S.toLowerCase(), L = k => ({ angle: Math.min(LM[S][k - 1].th.angle, LM[S][k].th.angle), ccj: (LM[S][k - 1].th.ccj + LM[S][k].th.ccj) / 2 }), sh = n => md.sheets.find(x => x.name === `${n}_${s}`);
    for (const k of Ax.wilson2001.spaces) { me += mass(sh('ICe' + k), L(k).ccj, L(k).angle); mi += mass(sh('ICi' + k), L(k).ccj, L(k).angle); }
    for (const k of [2, 3, 4, 5]) mp += mass(sh('ICi' + k), -1, L(k).ccj);
  }
  for (const [label, m, w] of [['наружные', me, Ax.wilson2001.external], ['внутренние', mi, Ax.wilson2001.internal], ['окологрудинные', mp, Ax.wilson2001.parasternal]])
    assert(m / w >= .8 && m / w <= 2.5, `${label}: ${m.toFixed(1)} г против ${w} г у препаратов (×${(m / w).toFixed(2)})`);
});

/* левая и правая стороны — зеркальные: края левого пласта, отражённые через среднюю линию, лежат у краёв правого — по
   медиане не дальше 1,5 мм, у 90 % точек — не дальше 4,5 мм, везде — не дальше 1 см; длина пласта и толщина — те же. Рёбра
   5 и 8 в сетке скелета (MyoSim) слева и справа немного различаются (88 и 93 вершины, до 5 мм), и углы рёбер 8 — на 2°:
   концы пластов там расходятся сильнее середины */
test('left and right intercostal sheets are mirror images', () => {
  const len = sh => sh.a.reduce((s, p, i) => i ? s + Math.hypot(...sub3([(p[0] + sh.b[i][0]) / 2, (p[1] + sh.b[i][1]) / 2, (p[2] + sh.b[i][2]) / 2], [(sh.a[i - 1][0] + sh.b[i - 1][0]) / 2, (sh.a[i - 1][1] + sh.b[i - 1][1]) / 2, (sh.a[i - 1][2] + sh.b[i - 1][2]) / 2])) : 0, 0);
  const segDist = (p, P) => { let d = Infinity; for (let i = 1; i < P.length; i++) { const a = P[i - 1], ab = sub3(P[i], a), u = Math.max(0, Math.min(1, dot3(sub3(p, a), ab) / (dot3(ab, ab) || 1))); d = Math.min(d, Math.hypot(...sub3(p, [a[0] + ab[0] * u, a[1] + ab[1] * u, a[2] + ab[2] * u]))); } return d; };
  for (const r of md.sheets.filter(s => s.side === 'R')) {
    const l = md.sheets.find(s => s.name === r.name.replace(/_r$/, '_l')), mir = P => P.map(p => [-p[0], p[1], p[2]]);
    for (const k of ['a', 'b']) {
      const L = mir(l[k]), d = r[k].map(p => segDist(p, L)).sort((x, y) => x - y), q = f => d[Math.floor(f * (d.length - 1))];
      assert(q(.5) <= .15 && q(.9) <= .45 && q(1) <= 1, `${r.name}: край ${k} слева дальше: медиана ${q(.5).toFixed(2)}, 90 % — ${q(.9).toFixed(2)}, наибольшее ${q(1).toFixed(2)} см`);
    }
    assert(Math.abs(len(r) - len(l)) / len(r) < .05, `${r.name}: длина ${len(r).toFixed(1)} и ${len(l).toFixed(1)} см`);
    assert(Math.abs(Math.max(...r.t) - Math.max(...l.t)) < .01, `${r.name}: толщина`);
  }
});

/* Пласт — жёсткий, в рамке грудной клетки; кожа же вокруг груди меняется с позой (складки подмышки, наклоны). Во всех позах
   проверки (вся проверка — npm run muscles:check) — рука над головой (жим стоя, подтягивания, вис, «звёздочка») и
   скручивания (велосипед, дровосек, боковая планка, скручивания): пласт под кожей и почти не заходит в чужие кости (ключица
   ложится на рёбра 1–3 спереди — README). Отрицательная проверка: пласт, вынесенный наружу на 4 и 5 см, ловится. */
test('intercostal sheets stay under the skin and out of other bones with the arm overhead and in twists', () => {
  const C = require('./muscles/check.js');
  const r = C.sheetRun(['ohp', 'pullup', 'hang', 'jumpingjack', 'bicycle', 'cablewood', 'sideplank', 'crunch'], [0, .25, .5, .75, 1]);
  assert.equal(Object.keys(r).length, 44);
  for (const [n, o] of Object.entries(r)) {
    assert(o.skin <= C.SHEET_LIMIT.body, `${n}: над кожей на ${o.skin.toFixed(2)} см (${o.skinAt})`);
    assert(o.bone <= C.SHEET_LIMIT.bone, `${n}: в кости на ${o.bone.toFixed(2)} см (${o.boneAt})`);
  }
  /* С формой груди 4.41.0 мягкие ткани над 6-м межреберьем толще: не меньше 3,0 см (было 2,2). У людей толщина грудной
     стенки от кожи до плевры в 4–5-м межреберье по передней подмышечной линии — 3,4 см (2,8–4,0), по средней — 4,0 см (КТ,
     метаанализ: Laan D. V. et al., Injury 47: 797–804, 2016), вместе с межрёберными мышцами и рёбрами. Поэтому пласт,
     вынесенный на 4 см, выходит из кожи на 0,7 см — проверка его ловит (допуск SHEET_LIMIT.body — 0); на 5 см — больше 1 см. */
  const S = C.SHEETS.find(x => x.sh.name === 'ICe6_r'), N = Muscles.sheetNormals(S.sh);
  const moved = D => { const out = { ...S, pos: S.pos.slice() }; for (let v = 0; v < out.n; v++) { const i = Math.min(N.length - 1, (v < 4 * N.length ? v % (2 * N.length) : 0) >> 1); for (let j = 0; j < 3; j++) out.pos[v * 3 + j] += D * N[i][j]; } return C.sheetRun(['ohp'], [0], [out]).ICe6_r.skin; };
  assert(moved(4) > C.SHEET_LIMIT.body, 'пласт, вынесенный на 4 см, проверка не ловит');
  assert(moved(5) > 1, 'пласт снаружи кожи не найден');
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
