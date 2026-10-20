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

/* Колено (аудит анатомии 4.53.0, находка 9; volumes.js, QUAD_TENDON): путь прямой и широких мышц бедра идёт через
   надколенник к бугристости большеберцовой кости, и дистальное сухожилие не короче надколенника, связки надколенника и
   сухожилия над надколенником по препаратам — брюшко кончается выше надколенника и в глубоком сгибании колена не ложится на
   него «клювом» (до правки у медиальной и промежуточной широких сухожилие было 2,8 см — брюшко заходило за первую точку на
   надколеннике на 7 см). Связка надколенника в пути модели — в пределах препаратов (Andrikoula и др., 2006: 38–49 мм). */
test('quadriceps: the distal tendon covers the patella, the patellar ligament and the quadriceps tendon by dissections', () => {
  const A = require('./muscles/fixtures/anatomy.json'), { QUAD_TENDON } = require('./muscles/volumes.js');
  const EQ = require('../src/js/09bn-equipment.js');
  for (const f of fs.readdirSync(path.join(__dirname, '../src/js')).filter(f => /^09bo.*\.js$/.test(f)).sort()) require('../src/js/' + f);
  const POSES = require('../src/js/09bp-poses.js'), d3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const first = i => md.muscles[i].el.findIndex(e => e.s && e.s.bone[0] === 'patella');
  const lines = Object.keys(QUAD_TENDON).flatMap(b => ['_r', '_l'].map(s => md.muscles.findIndex(m => m.name === b + s)));
  assert.equal(lines.length, 8); assert(lines.every(i => i >= 0 && first(i) > 0), 'four quadriceps parts on both sides reach the patella');
  const { m } = pose();
  for (const i of lines) {
    const mu = md.muscles[i], s = Muscles.place(bound[i], m).slice(first(i)).map(e => e.s), q = QUAD_TENDON[mu.name.replace(/_[rl]$/, '')];
    const seg = s.slice(1).reduce((a, p, j) => a + d3(p, s[j]), 0), lig = d3(s.at(-1), s.at(-2));
    assert(lig >= A.quadtendon.ligament[0] && lig <= A.quadtendon.ligament[1], `${mu.name}: patellar ligament ${lig.toFixed(1)} cm`);
    assert(mu.t1 >= seg + q - .06, `${mu.name}: distal tendon ${mu.t1} cm, patella and ligament ${seg.toFixed(1)} + above the patella ${q}`);
  }
  /* глубокое сгибание колена: брюшко кончается выше первой точки на надколеннике не меньше чем на 1 см (связка в позе
     манекена чуть длиннее — до 1,1 см) */
  for (const [id, t] of [['squat', 1], ['seatedcalf', .5], ['legpress', 1], ['hacksquat', 1], ['legext', 0]]) {
    const R = EQ.rig(POSES[id])(t), fr = L.Skeleton.frames(R, L.M.bodyData(R), skel.bones);
    for (const i of lines) {
      const p = Muscles.drawn(bound[i], fr, .5), site = Muscles.place(bound[i], fr)[first(i)].s, cum = [0];
      for (let j = 1; j < p.points.length; j++) cum.push(cum[j - 1] + d3(p.points[j], p.points[j - 1]));
      const k = p.points.reduce((b, x, j) => d3(x, site) < d3(p.points[b], site) ? j : b, 0), b = Muscles.body(bound[i], p.length);
      assert(d3(p.points[k], site) < .01, 'the patella point lies on the drawn path');
      assert(cum[k] - (b.t0 + b.lb) >= 1, `${id} t=${t} ${bound[i].name}: belly ends ${(cum[k] - b.t0 - b.lb).toFixed(1)} cm above the patella`);
    }
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

/* ---------- ленты: широкие плоские мышцы (Muscles.ribbon, FANS) ----------
   Соседние линии одной плоской мышцы рисуются не трубками, а полосами пласта между швами с соседями (README, «Ленты»).
   Проверяется: какие мышцы — ленты и порядок их линий по началам; объём (площадь многоугольника сечения против площади
   трубки, той же, что по МРТ); нет щелей между соседними полосами; нет перекрута; под кожей; в костях не глубже трубок. */
const EQR = require('../src/js/09bn-equipment.js'), POSES_R = require('../src/js/09bp-poses.js');
const RSTART = Muscles.ringStarts(bound), RSIDES = Muscles.SIDES, RBUF = new Float64Array(RSTART[bound.length] * RSIDES * 3);
const RIBBON_POSES = [['neutral', 0], ['ohp', 1], ['pullup', 0], ['ytw', 0], ['latraise', 1], ['latpull', .5], ['bbbench', .5], ['pushup', 0], ['deadlift', 0], ['cablewood', 1], ['hipthrust', 1]];
const rPose = (id, t) => { const R = id === 'neutral' ? L.M.catalogPose(L.M.neutral()) : EQR.rig(POSES_R[id])(t); return { R, m: L.Skeleton.frames(R, L.M.bodyData(R), skel.bones) }; };
const rSub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], rDot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const rCross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const rUnit = a => { const l = Math.hypot(...a) || 1; return a.map(x => x / l); };
/* вершина j кольца r мышцы i в буфере pos */
const rV = (pos, i, r, j) => { const v = ((RSTART[i] + r) * RSIDES + j) * 3; return [pos[v], pos[v + 1], pos[v + 2]]; };
const rMid = (pos, i, r, j0, j1) => rV(pos, i, r, j0).map((x, k) => (x + rV(pos, i, r, j1)[k]) / 2);
/* многоугольник кольца в плоскости поперёк касательной: точки (2D) и подписанная площадь */
function rRing(pos, i, r, T) {
  const e1 = rUnit(rCross(T, Math.abs(T[0]) < .9 ? [1, 0, 0] : [0, 1, 0])), e2 = rCross(T, e1), P = [];
  for (let j = 0; j < RSIDES; j++) { const v = rV(pos, i, r, j); P.push([rDot(v, e1), rDot(v, e2)]); }
  let A = 0; for (let j = 0; j < RSIDES; j++) { const a = P[j], b = P[(j + 1) % RSIDES]; A += a[0] * b[1] - a[1] * b[0]; }
  return { P, A: A / 2, e1, e2 };
}
function rInside(p, ring) {
  const x = [rDot(p, ring.e1), rDot(p, ring.e2)], P = ring.P; let inside = false, best = Infinity;
  for (let j = 0, l = P.length - 1; j < P.length; l = j++) {
    const a = P[j], b = P[l]; if ((a[1] > x[1]) !== (b[1] > x[1]) && x[0] < (b[0] - a[0]) * (x[1] - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
    const ab = [b[0] - a[0], b[1] - a[1]], u = Math.max(0, Math.min(1, ((x[0] - a[0]) * ab[0] + (x[1] - a[1]) * ab[1]) / (ab[0] * ab[0] + ab[1] * ab[1] || 1)));
    best = Math.min(best, Math.hypot(x[0] - a[0] - ab[0] * u, x[1] - a[1] - ab[1] * u));
  }
  return inside ? 0 : best;
}
/* показатели лент кадра: объём по линиям (∫ площади многоугольника и трубки по длине), щели у швов, перекрут, обход колец */
function ribbonStats(pos, fans = bound.fans) {
  const out = [];
  for (const fan of fans) {
    const st = { key: fan.key, side: fan.side, lines: [], shared: 0, seams: 0, hole: 0, holeAt: '', twist: 1, twistAt: '', flips: 0 };
    for (let k = 0; k < fan.K; k++) {
      const i = fan.lines[k], rev = fan.rev[k]; let vd = 0, vn = 0, prev = null, prevN = null;
      for (let r = 0; r < fan.n; r++) {
        const q = rev ? fan.n - 1 - r : r, ri = Muscles.ribbonRing(fan, k, q), ring = rRing(pos, i, r, rUnit(ri.t));
        /* обход кольца — как у трубки (Muscles.surface): от нормали к w = N × t своей линии */
        if (ring.A * (rev ? -1 : 1) > 0) st.flips++;
        if (prev) { const ds = Math.abs(ri.s - prev.s); vd += (Math.abs(ring.A) + prev.A) / 2 * ds; vn += (ri.area + prev.area) / 2 * ds; }
        prev = { s: ri.s, A: Math.abs(ring.A), area: ri.area };
        const N = rUnit(rSub(rV(pos, i, r, 0), rV(pos, i, r, 4)));
        if (prevN && rDot(N, prevN) < st.twist) { st.twist = rDot(N, prevN); st.twistAt = `${bound[i].name} r${r}`; }
        prevN = N;
      }
      st.lines.push({ name: bound[i].name, drawn: vd, tube: vn });
    }
    for (let k = 0; k + 1 < fan.K; k++) for (let q = 0; q < fan.n; q++) {
      const a = fan.lines[k], b = fan.lines[k + 1], ra = fan.rev[k] ? fan.n - 1 - q : q, rb = fan.rev[k + 1] ? fan.n - 1 - q : q;
      /* правый шов полосы k (вершины 1–3, у линии с путём против u — 7–5) и левый полосы k+1 */
      const jR = fan.rev[k] ? [7, 5] : [1, 3], jL = fan.rev[k + 1] ? [1, 3] : [7, 5];
      st.seams++;
      if (Math.hypot(...rSub(rV(pos, a, ra, jR[0]), rV(pos, b, rb, jL[0]))) < 1e-9 && Math.hypot(...rSub(rV(pos, a, ra, jR[1]), rV(pos, b, rb, jL[1]))) < 1e-9) { st.shared++; continue; }
      /* шов не общий (линии сошлись или перекрестились — у полосы своя кромка): точки между центрами двух линий — в сечении
         одной из полос */
      const Ca = rMid(pos, a, ra, 0, 4), Cb = rMid(pos, b, rb, 0, 4);
      const pa = rRing(pos, a, ra, rUnit(Muscles.ribbonRing(fan, k, q).t)), pb = rRing(pos, b, rb, rUnit(Muscles.ribbonRing(fan, k + 1, q).t));
      for (const l of [.1, .3, .5, .7, .9]) {
        const p = Ca.map((x, j) => x + (Cb[j] - x) * l), d = Math.min(rInside(p, pa), rInside(p, pb));
        if (d > st.hole) { st.hole = d; st.holeAt = `${bound[a].name}–${bound[b].name} q${q}`; }
      }
    }
    out.push(st);
  }
  return out;
}

test('ribbons: broad flat muscles are drawn as ribbons of neighbouring lines, in the order of their origins', () => {
  /* какие мышцы — ленты (README, «Ленты»: Gray's Anatomy, OpenStax A&P 2e — плоские, веерные, четырёхугольные пласты) */
  /* задняя дельтовидная — трубки: её линии у головки плеча при отведении и руке над головой перекрещиваются (README);
     передняя зубчатая и наружная косая (ленты 4.51.0–4.53.0) с этапа Б — стенки по поверхности тела (тесты стенок ниже) */
  /* большая и средняя ягодичные с этапа В — пласты у сустава (стенки, тесты ниже) */
  const EXPECT = { pecmaj: 7, lat: 6, trap: 13, infsp: 3, rhomb: 4 };
  for (const side of ['R', 'L']) assert.deepEqual(Object.fromEntries(bound.fans.filter(f => f.side === side).map(f => [f.key, f.K])), EXPECT, side);
  const seen = new Set();
  for (const fan of bound.fans) {
    for (const i of fan.lines) {
      assert(!seen.has(i), `${bound[i].name} in two ribbons`); seen.add(i);
      assert.equal(bound[i].side, fan.side); assert.equal(Muscles.ringCount(bound[i]), fan.n, 'common ring count');
    }
    /* левая лента — зеркало правой */
    const twin = bound.fans.find(f => f.key === fan.key && f.side !== fan.side);
    assert.deepEqual(twin.lines.map(i => bound[i].name.replace(/_[rl]$/, '')), fan.lines.map(i => bound[i].name.replace(/_[rl]$/, '')));
  }
  /* порядок линий — по началам вдоль кости: ближайшее к началу линии начало другой линии той же мышцы — у соседа по ленте
     (начало — конец пути с другой стороны от кости, где волокна сходятся); у верхних зубцов передней зубчатой (рёбра 1–2)
     начала собраны в пучок — там сосед не дальше ближайшего больше чем на 1 см */
  const { m } = rPose('neutral', 0), paths = Muscles.layoutDrawn(bound, m, 1.5);
  for (const fan of bound.fans) {
    const O = fan.lines.map((i, k) => { const p = paths[i].points; return fan.rev[k] ? p[0] : p[p.length - 1]; });
    O.forEach((o, k) => {
      let best = Infinity, at = -1; O.forEach((p, j) => { if (j !== k) { const d = Math.hypot(...rSub(o, p)); if (d < best) { best = d; at = j; } } });
      const nb = Math.min(...[k - 1, k + 1].filter(j => j >= 0 && j < O.length).map(j => Math.hypot(...rSub(o, O[j]))));
      assert(nb <= best + 1, `${fan.key}${fan.side}: nearest origin to ${bound[fan.lines[k]].name} is ${bound[fan.lines[at]].name}, ${best.toFixed(1)} cm (neighbour ${nb.toFixed(1)})`);
    });
  }
});

test('ribbons keep the MRI volume of every part: cross-section polygons have the area of the tube section', () => {
  let worstFan = 0, worstLine = 0, at = '';
  for (const [id, t] of RIBBON_POSES) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const st of ribbonStats(RBUF)) {
      const d = st.lines.reduce((s, l) => s + l.drawn, 0), n = st.lines.reduce((s, l) => s + l.tube, 0);
      if (Math.abs(d / n - 1) > worstFan) worstFan = Math.abs(d / n - 1);
      assert(Math.abs(d / n - 1) < .03, `${st.key}${st.side} in ${id} t=${t}: ribbon volume ×${(d / n).toFixed(3)} of the tube volume`);
      for (const l of st.lines) if (Math.abs(l.drawn / l.tube - 1) > worstLine) { worstLine = Math.abs(l.drawn / l.tube - 1); at = `${l.name} ${id} t=${t}`; }
    }
  }
  /* у отдельной линии — до 12 % (сейчас до 6 % — зубцы наружной косой): где линии перекрещиваются
     или сходятся в пучок, полоса со своей кромкой перекрывает соседку; лента целиком — в пределах 3 % (сейчас до 2 %) */
  assert(worstLine < .12, `line volume off by ${(worstLine * 100).toFixed(0)} % (${at})`);
  /* площадь трубки по длине — объём части по МРТ (Muscles.body): та же сумма по кольцам на линиях лент даёт объём v с
     точностью выборки колец */
  const { m } = rPose('neutral', 0), paths = Muscles.layoutDrawn(bound, m, 1.5); Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART);
  for (const st of ribbonStats(RBUF)) {
    const fan = bound.fans.find(f => f.key === st.key && f.side === st.side), v = fan.lines.reduce((s, i) => s + bound[i].v, 0), n = st.lines.reduce((s, l) => s + l.tube, 0);
    assert(Math.abs(n / v - 1) < .12, `${st.key}${st.side}: ring sampling of the tube area ${n.toFixed(0)} vs MRI ${v.toFixed(0)} cm³`);
  }
});

test('ribbons: no gaps between neighbouring strips, no twist, rings wound like tubes — neutral and with the arm overhead', () => {
  for (const [id, t] of RIBBON_POSES) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const st of ribbonStats(RBUF)) {
      const where = `${st.key}${st.side} in ${id} t=${t}`;
      /* общие швы — те же вершины у обеих полос; где шов не общий, между линиями нет непокрытого места больше 7 мм */
      assert(st.hole <= .7, `${where}: gap ${st.hole.toFixed(2)} cm between strips (${st.holeAt})`);
      assert(st.twist > 0, `${where}: the strip turns over between rings (${st.twistAt}, cos ${st.twist.toFixed(2)})`);
    }
  }
  /* в нейтральной позе швы большей частью общие (у широчайшей и трапециевидной; наружная косая и зубчатая — стенки, у них
     швы общие всегда — тест стенок) */
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const share = Object.fromEntries(ribbonStats(RBUF).filter(s => s.side === 'R').map(s => [s.key, s.shared / s.seams]));
  for (const k of ['lat', 'trap']) assert(share[k] > .5, `${k}: shared seams ${(share[k] * 100).toFixed(0)} %`);
  /* отрицательные: полоса, сдвинутая с шва на 1,5 см, — щель; перевёрнутое кольцо — перекрут и обход наизнанку */
  const lat = bound.fans.find(f => f.key === 'lat' && f.side === 'R'), i = lat.lines[2], copy = RBUF.slice();
  for (let r = 0; r < lat.n; r++) for (let j = 0; j < RSIDES; j++) { const v = ((RSTART[i] + r) * RSIDES + j) * 3; copy[v + 1] += 1.5; copy[v] += 1.5; }
  const bad = ribbonStats(copy, [lat])[0];
  assert(bad.hole > .7 || bad.shared < ribbonStats(RBUF, [lat])[0].shared, 'a strip moved off its seams is not detected');
  const flip = RBUF.slice(), r0 = 5;
  for (let j = 0; j < RSIDES; j++) for (let c = 0; c < 3; c++) flip[((RSTART[i] + r0) * RSIDES + j) * 3 + c] = RBUF[((RSTART[i] + r0) * RSIDES + (RSIDES - j) % RSIDES) * 3 + c];
  for (let c = 0; c < 3; c++) { flip[((RSTART[i] + r0) * RSIDES) * 3 + c] = RBUF[((RSTART[i] + r0) * RSIDES + 4) * 3 + c]; flip[((RSTART[i] + r0) * RSIDES + 4) * 3 + c] = RBUF[((RSTART[i] + r0) * RSIDES) * 3 + c]; }
  const f = ribbonStats(flip, [lat])[0];
  assert(f.twist < 0 && f.flips > 0, 'a ring turned over is not detected');
});

/* Освещение ленты: изнанка (сторона от кожи) — с нормалями лицевой стороны (её видно только сквозь прозрачный силуэт кожи —
   шея и затылок со стороны головы, — и там широкая изнанка, обращённая к полу, рисовалась тёмным клином); своя кромка внутри
   ленты лежит на соседней полосе — её нормаль средняя у двух полос, без бокового блика (иначе — тёмные «ступеньки») */
test('ribbons: the deep side is lit like the outer side, own edges inside a ribbon by the mean normal of the two strips', () => {
  const NOR = new Float64Array(RBUF.length), near = (a, b) => rDot(rUnit(a), rUnit(b)) > .999;
  const nV = (i, r, j) => { const v = ((RSTART[i] + r) * RSIDES + j) * 3; return [NOR[v], NOR[v + 1], NOR[v + 2]]; };
  for (const [id, t] of [['neutral', 0], ['pushup', 1], ['latraise', 1], ['ohp', 1]]) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, NOR, RSTART);
    for (const fan of bound.fans) {
      const where = `${fan.key}${fan.side} in ${id} t=${t}`;
      /* лицевая сторона — по коже с весом доли пути u: у начала на туловище направление к коже надёжнее (у плеча кожа
         нейтральной позы поворачивается вместе с плечевой костью) */
      let vote = 0, rings = 0, toSkin = 0;
      for (let k = 0; k < fan.K; k++) for (let q = 0; q < fan.n; q++) { const ri = Muscles.ribbonRing(fan, k, q); if (ri.skin) vote += q * rDot(ri.n, ri.skin); }
      const so = vote < 0 ? -1 : 1;
      for (let k = 0; k < fan.K; k++) {
        const i = fan.lines[k], rev = fan.rev[k];
        for (let r = 0; r < fan.n; r++) {
          const q = rev ? fan.n - 1 - r : r, ri = Muscles.ribbonRing(fan, k, q), N = ri.n.map(x => x * so);
          /* верх и низ полосы в центре — одна нормаль, лицевой стороны */
          assert(near(nV(i, r, 0), N) && near(nV(i, r, 4), N), `${where}: ${bound[i].name} ring ${r}: the deep side is not lit like the outer one`);
          if (ri.skin && q >= fan.n / 2) { rings++; if (rDot(N, ri.skin) > 0) toSkin++; }
          /* своя кромка к соседу: вершины кромки — по средней нормали двух полос */
          for (const [bit, j, verts] of [[2, k + 1, rev ? [7, 6, 5] : [1, 2, 3]], [1, k - 1, rev ? [1, 2, 3] : [7, 6, 5]]]) {
            if (!(ri.own & bit) || j < 0 || j >= fan.K) continue;
            const nb = Muscles.ribbonRing(fan, j, q).n, g = rDot(ri.n, nb) < 0 ? -1 : 1, M = ri.n.map((x, c) => (x + g * nb[c]) * so);
            if (Math.hypot(...M) < 1e-6) continue;
            for (const v of verts) assert(near(nV(i, r, v), M), `${where}: ${bound[i].name} ring ${r}: own edge vertex ${v} not lit by the mean normal`);
          }
        }
      }
      /* лицевая сторона смотрит к коже у колец половины ленты на туловище */
      if (rings) assert(toSkin / rings > .8, `${where}: lit side faces the skin in ${(100 * toSkin / rings).toFixed(0)} % of rings`);
    }
  }
});

/* Под кожей и в костях — не хуже трубок: тело ленты не выше BODY_LIMIT (1 см, этап Г; было 2,6) над кожей (вся проверка —
   npm run muscles:check, исключения для широчайшей больше нет), а вершины тела ленты в костях (дальше 2 см от концов пути)
   глубже 0,5 см — не чаще, чем у трубок тех же линий (Muscles.surface), с запасом 2 процентных пункта, и не глубже их
   больше чем на 0,3 см */
test('ribbons stay under the skin and do not go into bones deeper than the tubes they replace', () => {
  const G = require('./muscles/geometry.js'), pbs = G.prepareBones(skel), TUBE = new Float64Array(RBUF.length), { BODY_LIMIT } = require('./muscles/check.js');
  const fam = {};
  for (const id of ['ohp', 'pullup', 'ytw', 'latpull', 'bbbench', 'deadlift', 'hipthrust']) for (const t of [0, .5, 1]) {
    const { R, m } = rPose(id, t), paths = Muscles.layoutDrawn(bound, m, 1.5), pose = G.poseBones(pbs, m), sdf = G.skinSDF(R);
    Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART);
    for (const fan of bound.fans) for (const i of fan.lines) {
      Muscles.surface(bound[i], paths[i], m, TUBE, null, RSTART[i] * RSIDES);
      const out = G.skinOutPoints(sdf, RBUF.subarray(RSTART[i] * RSIDES * 3, RSTART[i + 1] * RSIDES * 3), R).out;
      assert(out <= BODY_LIMIT, `${bound[i].name} in ${id} t=${t}: ${out.toFixed(2)} cm above the skin`);
      const f = fam[fan.key] || (fam[fan.key] = { rib: [0, 0, 0], tube: [0, 0, 0] }), a = paths[i].points[0], b = paths[i].points.at(-1);
      for (const [buf, acc] of [[RBUF, f.rib], [TUBE, f.tube]]) for (let v = RSTART[i] * RSIDES; v < RSTART[i + 1] * RSIDES; v++) {
        const p = [buf[v * 3], buf[v * 3 + 1], buf[v * 3 + 2]];
        if (Math.hypot(...rSub(p, a)) < 2 || Math.hypot(...rSub(p, b)) < 2) continue;
        acc[0]++;
        for (let bi = 0; bi < pbs.length; bi++) {
          const w = pose[bi]; if (p[0] < w.lo[0] || p[0] > w.hi[0] || p[1] < w.lo[1] || p[1] > w.hi[1] || p[2] < w.lo[2] || p[2] > w.hi[2]) continue;
          const q = w.inv(p); if (!G.insideBone(pbs[bi], q)) continue;
          const d = pbs[bi].near(q); if (d > .5) acc[1]++; acc[2] = Math.max(acc[2], d); break;
        }
      }
    }
  }
  for (const [k, f] of Object.entries(fam)) {
    const r = f.rib[1] / f.rib[0], tb = f.tube[1] / f.tube[0];
    assert(r <= tb + .02, `${k}: ${(r * 100).toFixed(1)} % of vertices deeper than 5 mm in bones (tubes ${(tb * 100).toFixed(1)} %)`);
    assert(f.rib[2] <= f.tube[2] + .3, `${k}: ${f.rib[2].toFixed(2)} cm deep in a bone (tubes ${f.tube[2].toFixed(2)})`);
  }
});

/* ---------- колпак дельтовидной (Muscles.capSurface, tools/muscles/README.md, «Колпак дельтовидной») ----------
   Позы с крайними положениями плеча: рука вниз, в сторону (90°), вперёд (90°), над головой (жим, вис), назад (отжимания на
   брусьях), разведение лёжа (жим лёжа внизу), наружная ротация, подъём плеч, тяга в наклоне, пуловер, «Y-T-W». */
const CAP_POSES = [['neutral', 0], ['latraise', 1], ['frontraise', 1], ['ohp', 1], ['pullup', 0], ['dip', 1], ['bbbench', 1], ['cableextrot', 1],
  ['shrug', 1], ['bbrow', 0], ['bbrow', 1], ['pullover', 0], ['ytw', 0], ['reversefly', 1], ['facepull', 1], ['chinup', 0]];
/* Гладкость тела части i по готовой сетке (как рисуется): излом волокна — наибольший угол между соседними отрезками линии
   вершины снаружи (0) и на кости (4) у колец 2…n−3 (отрезки короче 5 мм — сухожилие у конца, не в счёт); выступ — насколько
   наружная вершина (0, 1, 7) дальше от центра сустава H, чем самая дальняя из четырёх соседних (по кольцу и вдоль), см */
function capSmooth(pos, i, H) {
  const n = Muscles.ringCount(bound[i]), rad = p => Math.hypot(p[0] - H[0], p[1] - H[1], p[2] - H[2]);
  let kink = 0, kinkAt = '', bump = 0, bumpAt = '';
  for (const j of [0, 4]) for (let r = 2; r < n - 2; r++) {
    const u = rSub(rV(pos, i, r, j), rV(pos, i, r - 1, j)), w = rSub(rV(pos, i, r + 1, j), rV(pos, i, r, j)), lu = Math.hypot(...u), lw = Math.hypot(...w);
    if (lu < .5 || lw < .5) continue;
    const g = Math.acos(Math.max(-1, Math.min(1, rDot(u, w) / (lu * lw)))) * 180 / Math.PI;
    if (g > kink) { kink = g; kinkAt = `r${r} j${j}`; }
  }
  for (let r = 1; r < n - 1; r++) for (const j of [0, 1, 7]) {
    const b = rad(rV(pos, i, r, j)) - Math.max(rad(rV(pos, i, r - 1, j)), rad(rV(pos, i, r + 1, j)), rad(rV(pos, i, r, (j + 1) % 8)), rad(rV(pos, i, r, (j + 7) % 8)));
    if (b > bump) { bump = b; bumpAt = `r${r} j${j}`; }
  }
  return { kink, kinkAt, bump, bumpAt };
}
/* общие вершины соседних частей в строке q колпака: сколько вершин кольца части k совпадает с вершинами кольца части k+1 */
function capShared(pos, cap, k, q) {
  const n = cap.n, a = cap.lines[k], b = cap.lines[k + 1], ra = cap.rev[k] ? n - 1 - q : q, rb = cap.rev[k + 1] ? n - 1 - q : q;
  let same = 0;
  for (let j = 0; j < 8; j++) { const p = rV(pos, a, ra, j); for (let jj = 0; jj < 8; jj++) if (Math.hypot(...rSub(p, rV(pos, b, rb, jj))) < 1e-9) { same++; break; } }
  return same;
}
/* угол кромки у края колпака (вершина середины крайнего шва между наружной и внутренней вершинами), там, где край толще 1 мм */
function capTip(pos, cap) {
  let tip = 180, at = '';
  for (const [k, side] of [[0, 'border0'], [cap.K - 1, 'borderK']]) {
    const i = cap.lines[k], n = cap.n;
    for (let r = 1; r < n - 1; r++) for (const [jt, jm, jb] of [[1, 2, 3], [7, 6, 5]]) {
      const m = rV(pos, i, r, jm), u = rSub(rV(pos, i, r, jt), m), w = rSub(rV(pos, i, r, jb), m), lu = Math.hypot(...u), lw = Math.hypot(...w);
      if (lu < .05 || lw < .05) continue;
      /* только у края колпака: середина шва вынесена в сторону от линии наружу — внутрь (у шва между частями — на ней) */
      const t = rSub(rV(pos, i, r, jt), rV(pos, i, r, jb)), off = Math.hypot(...rCross(rSub(m, rV(pos, i, r, jb)), t)) / (Math.hypot(...t) || 1);
      if (off < .01) continue;
      const g = Math.acos(Math.max(-1, Math.min(1, rDot(u, w) / (lu * lw)))) * 180 / Math.PI;
      if (g < tip) { tip = g; at = `${bound[i].name} r${r}`; }
    }
  }
  return { tip, at };
}
const capH = (cap, m) => { const o = cap.hum * 12; return [m[o + 3], m[o + 7], m[o + 11]]; };

test('deltoid cap: the five parts are one sheet over the humeral head — neighbouring parts share their seams', () => {
  assert.equal(bound.caps.length, 2, 'a cap on each side');
  for (const cap of bound.caps) {
    assert.deepEqual(cap.lines.map(i => bound[i].name.replace(/_[rl]$/, '')), ['DELT1', 'DELT2', 'DELT3lat', 'DELT3', 'DELT3med'], 'parts from front to back');
    for (const i of cap.lines) assert.equal(Muscles.ringCount(bound[i]), cap.n, `${bound[i].name}: one row of the cap per ring`);
  }
  for (const [id, t] of CAP_POSES) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const cap of bound.caps) for (let k = 0; k + 1 < cap.K; k++) for (let q = 0; q < cap.n; q++) {
      const s = capShared(RBUF, cap, k, q);
      assert(s >= 3, `${id} t=${t}: ${bound[cap.lines[k]].name} and ${bound[cap.lines[k + 1]].name} share ${s} of 3 seam vertices in row ${q}`);
    }
  }
});

/* Пороги. Излом волокна ≤ 80°: волокно огибает головку (радиус ≈ 3 см, с толщиной — до 5–6 см) с шагом колец 1–2,5 см —
   это 20–45° на кольцо, в наружной ротации пучок ещё закручивается вокруг плеча; у трубок 4.52 изломы у промежуточных точек
   путей — 94–129°, у 10 % поз каталога — больше 140° («звезда» шипов). Выступ ≤ 0,6 см: наружная вершина не торчит над
   соседями (шип); на гладком колпаке — до 0,5 см у начала средней части, где сходятся швы. Угол кромки у края колпака
   ≥ 60°: край скруглён (у сплющенных трубок — 42°, «лезвие»). */
test('deltoid cap: smooth in extreme shoulder positions — no hooks along the fibres, no spikes, rounded edges', () => {
  for (const [id, t] of CAP_POSES) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const cap of bound.caps) {
      const H = capH(cap, m);
      for (const i of cap.lines) {
        const s = capSmooth(RBUF, i, H);
        assert(s.kink <= 80, `${id} t=${t} ${bound[i].name}: fibre bends by ${s.kink.toFixed(0)}° (${s.kinkAt})`);
        assert(s.bump <= .6, `${id} t=${t} ${bound[i].name}: a vertex sticks out by ${s.bump.toFixed(2)} cm (${s.bumpAt})`);
      }
      const e = capTip(RBUF, cap);
      assert(e.tip >= 60, `${id} t=${t}: edge of the cap ${e.tip.toFixed(0)}° (${e.at})`);
    }
  }
});

test('negative: a spike, a fold, a torn seam and a razor edge in the deltoid cap are detected', () => {
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const cap = bound.caps[0], H = capH(cap, m), i = cap.lines[1], at = (r, j) => ((RSTART[i] + r) * RSIDES + j) * 3;
  const ok = capSmooth(RBUF, i, H);
  assert(ok.kink <= 80 && ok.bump <= .6, 'the drawn cap passes');
  /* шип: наружная вершина средней части отодвинута от центра сустава на 2 см */
  const spike = RBUF.slice(), v = at(10, 0), d = rUnit(rSub(rV(RBUF, i, 10, 0), H));
  for (let k = 0; k < 3; k++) spike[v + k] += 2 * d[k];
  assert(capSmooth(spike, i, H).bump > .6, 'spike caught');
  /* складка: два соседних кольца поменялись местами — волокно идёт назад */
  const fold = RBUF.slice();
  for (let j = 0; j < 8; j++) for (let k = 0; k < 3; k++) { const a = at(9, j) + k, b = at(10, j) + k; [fold[a], fold[b]] = [fold[b], fold[a]]; }
  assert(capSmooth(fold, i, H).kink > 80, 'fold caught');
  /* разрыв: шов средней части сдвинут на 5 мм — у соседки его вершин больше нет */
  const torn = RBUF.slice();
  for (const j of [1, 2, 3, 5, 6, 7]) torn[at(10, j)] += .5;
  assert(capShared(torn, cap, 0, cap.rev[1] ? cap.n - 1 - 10 : 10) < 3 || capShared(torn, cap, 1, cap.rev[1] ? cap.n - 1 - 10 : 10) < 3, 'torn seam caught');
  /* лезвие: кромка края колпака вынесена на 3 см */
  const razor = RBUF.slice(), e = cap.lines[0];
  for (let r = 1; r < cap.n - 1; r++) for (const [jt, jm, jb] of [[1, 2, 3], [7, 6, 5]]) {
    const m0 = rV(razor, e, r, jm), mid = rV(razor, e, r, jt).map((x, k) => (x + rV(razor, e, r, jb)[k]) / 2), dir = rUnit(rSub(m0, mid)), w = ((RSTART[e] + r) * RSIDES + jm) * 3;
    if (Math.hypot(...rSub(m0, mid)) > .01) for (let k = 0; k < 3; k++) razor[w + k] += 3 * dir[k];
  }
  assert(capTip(razor, cap).tip < 60, 'razor edge caught');
});

/* Объём частей — по замкнутой сетке (кольца и торцы): в нейтральной позе колпак держит не меньше 3/4 объёма по МРТ (трубки
   4.52 — 0,79: у концов сухожилия, нить короче пути с промежуточными точками) и доли частей — как у препаратов Gómez et al.
   (2022): передняя / средняя / задняя 17,5 / 53,4 / 29,1 % ± 3 пункта (у колпака доли смещаются на швах); левая — зеркало
   правой */
test('deltoid cap keeps the volume and the part shares of the dissections', () => {
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const tri = (a, b, c) => rDot(a, rCross(b, c)) / 6;
  const vol = i => {
    const n = Muscles.ringCount(bound[i]), cen = r => [0, 1, 2].map(k => { let s = 0; for (let j = 0; j < 8; j++) s += rV(RBUF, i, r, j)[k]; return s / 8; });
    let v = 0;
    for (let r = 0; r + 1 < n; r++) for (let j = 0; j < 8; j++) { const a = rV(RBUF, i, r, j), b = rV(RBUF, i, r, (j + 1) % 8), c = rV(RBUF, i, r + 1, (j + 1) % 8), d = rV(RBUF, i, r + 1, j); v += tri(a, b, c) + tri(a, c, d); }
    const c0 = cen(0), c1 = cen(n - 1);
    for (let j = 0; j < 8; j++) v += tri(c0, rV(RBUF, i, 0, (j + 1) % 8), rV(RBUF, i, 0, j)) + tri(c1, rV(RBUF, i, n - 1, j), rV(RBUF, i, n - 1, (j + 1) % 8));
    return Math.abs(v);
  };
  const tot = {};
  for (const cap of bound.caps) {
    const by = { delt1: 0, delt2: 0, delt3: 0 }; let drawn = 0, mri = 0;
    for (const i of cap.lines) { const v = vol(i); by[bound[i].part] += v; drawn += v; mri += bound[i].v; }
    assert(drawn >= .75 * mri && drawn <= 1.05 * mri, `${cap.side}: ${drawn.toFixed(0)} cm³ drawn, ${mri.toFixed(0)} by MRI`);
    for (const [k, ref] of [['delt1', .175], ['delt2', .534], ['delt3', .291]]) assert(Math.abs(by[k] / drawn - ref) <= .03, `${cap.side} ${k}: ${(100 * by[k] / drawn).toFixed(1)} % (dissections ${ref * 100} %)`);
    tot[cap.side] = drawn;
  }
  assert(Math.abs(tot.R - tot.L) <= .01 * tot.R, `left ${tot.L.toFixed(1)} vs right ${tot.R.toFixed(1)} cm³`);
});

/* Геометрия на позах каталога (вся проверка — npm run muscles:check): несколько упражнений с крайними положениями
   рук, ног и туловища — путь не глубже 2 см в костях и не выше 2,2 см над кожей, тело мышцы — не выше BODY_LIMIT (1 см, этап Г;
   обоснование — в check.js; исключений нет). */
test('muscle paths stay out of bones and under the skin in catalog poses', () => {
  const { run, EXCEPT, BODY_LIMIT } = require('./muscles/check.js');
  const { fam } = run(['bbbench', 'squat', 'latpull', 'deadlift', 'dbcurl', 'crunch'], [0, .5, 1]);
  for (const [k, f] of Object.entries(fam)) {
    assert(f.bone <= 2, `${k}: ${f.bone.toFixed(2)} cm inside a bone (${f.boneAt})`);
    assert(f.skin <= (EXCEPT.skin[k] ?? 2.2), `${k}: ${f.skin.toFixed(2)} cm above the skin (${f.skinAt})`);
    assert(f.body <= (EXCEPT.body[k] ?? BODY_LIMIT), `${k}: muscle body ${f.body.toFixed(2)} cm above the skin (${f.bodyAt})`);
  }
  /* полная проверка (npm run muscles:check) — с тем же допуском, исключений тела нет */
  const pkg = require('../package.json').scripts['muscles:check'];
  assert.equal(+pkg.match(/--max-body (\S+)/)[1], BODY_LIMIT, 'npm run muscles:check uses BODY_LIMIT');
  assert.deepEqual(EXCEPT.body, {}, 'no body exceptions');
});

/* Отрицательная: тело мышцы, вынесенное за кожу на 1,5 см, допуском тела ловится (а прежним 2,6 — нет). Трубка (плечелучевая),
   лента (широчайшая) и колпак (средняя часть дельтовидной) в нейтральной позе сдвигаются целиком по нормали кожи у своей
   верхней вершины — так, что она на 1,5 см над кожей; мера — та же, что у npm run muscles:check (G.skinOutPoints). */
test('negative: a muscle body moved 1.5 cm out of the skin is caught by the body tolerance', () => {
  const G = require('./muscles/geometry.js'), { BODY_LIMIT } = require('./muscles/check.js');
  const { R, m } = rPose('neutral', 0), sdf = G.skinSDF(R);
  Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  for (const name of ['BRD_r', 'LAT3_r', 'DELT2_l']) {
    const i = bound.findIndex(b => b.name === name), a = RSTART[i] * RSIDES * 3, z = RSTART[i + 1] * RSIDES * 3;
    const ok = G.skinOutPoints(sdf, RBUF.subarray(a, z), R);
    assert(ok.out <= BODY_LIMIT, `${name} as drawn: ${ok.out.toFixed(2)} cm`);
    const p = [RBUF[a + ok.at * 3], RBUF[a + ok.at * 3 + 1], RBUF[a + ok.at * 3 + 2]], h = .05;
    const g = rUnit([0, 1, 2].map(k => { const q = p.slice(), w = p.slice(); q[k] += h; w[k] -= h; return sdf(q) - sdf(w); }));
    const moved = RBUF.slice(a, z), d = 1.5 - ok.out;
    for (let v = 0; v < moved.length; v += 3) for (let k = 0; k < 3; k++) moved[v + k] += g[k] * d;
    const bad = G.skinOutPoints(sdf, moved, R).out;
    assert(bad > BODY_LIMIT && bad >= 1.3, `${name} moved 1.5 cm out: ${bad.toFixed(2)} cm is not caught`);
    assert(bad < 2.6, `${name}: ${bad.toFixed(2)} cm — the old tolerance would have caught it too`);
  }
});

/* ---------- кожа кадра (этап Г, Muscles.skinPart; README, «Тело мышцы между костью и кожей») ----------
   Части кожи, посчитанные по матрицам костей, — та же кожа, что у манекена и проверок (G.skinSDF): у точек не дальше 3 см от
   кожи части конечности, шея, голова и «шапки» суставов — до 0,1 мм; корпус (сдвиг надплечий — неподвижная точка до 0,3 мм,
   сечения и рамки поясницы — по таблицам кадра) — в среднем до 0,2 мм, больше 1 мм — не чаще 2 % точек, наибольшее — до 1 см
   (точки снаружи кожи над поднятыми надплечьями; сейчас — в среднем 0,05 мм, 0,47 % и 0,64 см). */
test('frame skin: Muscles.skinPart equals the mannequin skin of the checks near the body surface in poses', () => {
  const G = require('./muscles/geometry.js'), S = bound.skin;
  assert(S, 'frame skin is bound (skp in the data)');
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const st = Array.from({ length: 23 }, () => ({ n: 0, sum: 0, big: 0, max: 0, at: '' }));
  for (const [id, t] of [['neutral', 0], ['shrug', 1], ['ytw', 0], ['dbcurl', 1], ['squat', 1], ['bicycle', .5], ['ohp', 1], ['deadlift', 0]]) {
    const { R, m } = rPose(id, t), sdf = G.skinSDF(R), surf = L.M.surface(R), pts = [];
    Muscles.skinFrame(S, m);
    const rows = [...surf.torso, ...Object.values(surf.limbs).flat(), ...surf.neck];
    for (const row of rows) for (let k = 0; k < row.length; k += 3) pts.push(row[k]);
    for (const c of L.M.bodyData(R).caps) for (let k = 0; k < 12; k++) { const u = [rnd() - .5, rnd() - .5, rnd() - .5], l = Math.hypot(...u); pts.push(c.c.map((x, j) => x + u[j] / l * c.r)); }
    for (const p0 of pts) {
      const p = p0.map(x => x + (rnd() - .5) * 6);
      for (let code = 0; code < 23; code++) {
        const ref = sdf.parts[code](p); if (!(Math.abs(ref) <= 3)) continue;
        const e = Math.abs(Muscles.skinPart(S, m, code, p[0], p[1], p[2]) - ref), s = st[code];
        s.n++; s.sum += e; if (e > .1) s.big++; if (e > s.max) { s.max = e; s.at = `${id} t=${t} (${p.map(x => x.toFixed(1)).join(', ')})`; }
      }
    }
  }
  for (let code = 1; code < 23; code++) assert(st[code].n > 100 && st[code].max < .01, `skin part ${code}: ${st[code].max.toFixed(4)} cm off the mannequin skin (${st[code].at}), ${st[code].n} points`);
  const T = st[0];
  assert(T.n > 2000 && T.sum / T.n < .02 && T.big <= .02 * T.n && T.max < 1, `torso skin: mean ${(T.sum / T.n * 10).toFixed(2)} mm, ${(100 * T.big / T.n).toFixed(2)} % > 1 mm, max ${T.max.toFixed(2)} cm (${T.at}), ${T.n} points`);
});

/* Память кожи по фазе (этап Г; Muscles.surfaceAll с memo, слой мышц сцены): запись ленты кадр не меняет; кадр из своей ленты —
   тот же до округления Int16 (вершин дальше 1 мм — не больше 0,1 %: у переключений ветвей — кромка ленты на продолжении шва
   или поперёк — округление может дать и больше); кадр между лентами соседних фаз (здесь — через 1/32 повторения: дальше
   друг от друга слой мышц ленты не смешивает, PHASE_SPAN в src/volume/muscles.mjs) близок к точному расчёту: вершин дальше
   5 мм в среднем по кадрам — не больше 0,1 %, в худшем кадре — не больше 0,5 % (сейчас 0,03 и 0,27 %: это кольца, у которых
   сама точная поверхность переключает ветвь — надостная в тяге верхнего блока прыгает на 3,6 см за 1/512 повторения, а по
   памяти переходит между лентами плавно; линейное смешение самих вершин соседних кадров дало бы до 5,9 %), и не выше допуска
   тела над кожей; лента чужого упражнения даёт другой кадр (память действительно читается) */
test('phase memory: recording keeps the frame, frames from tapes stay close to the exact ones and under the skin', () => {
  const G = require('./muscles/geometry.js'), { BODY_LIMIT } = require('./muscles/check.js'), Q = 32, ref = new Float64Array(RBUF.length);
  assert(bound.tapeN > 20000, `tape of ${bound.tapeN} numbers`);
  const frac = (a, c, d) => { let k = 0, n = 0; for (let v = 0; v < a.length; v += 3) { n++; if (Math.max(Math.abs(a[v] - c[v]), Math.abs(a[v + 1] - c[v + 1]), Math.abs(a[v + 2] - c[v + 2])) > d) k++; } return k / n; };
  let same = 0, mid = 0, midAt = '', midSum = 0, midN = 0, out = -9, outAt = '', other = null;
  for (const id of ['latpull', 'squat']) {
    const tapes = [];
    for (let i = 0; i <= Q; i++) {
      const { m } = rPose(id, i / Q), paths = Muscles.layoutDrawn(bound, m, 1.5), tape = new Int16Array(bound.tapeN);
      Muscles.surfaceAll(bound, paths, m, ref, null, RSTART);
      Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART, { rec: tape });
      assert.equal(frac(RBUF, ref, 0), 0, `${id} t=${i / Q}: recording changed the frame`);
      Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART, { a: tape, b: tape, w: 0 });
      same = Math.max(same, frac(RBUF, ref, .1)); tapes.push(tape);
    }
    if (!other) other = tapes;
    else {
      const { m } = rPose(id, .5), paths = Muscles.layoutDrawn(bound, m, 1.5);
      Muscles.surfaceAll(bound, paths, m, ref, null, RSTART);
      Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART, { a: other[Q / 2], b: other[Q / 2], w: 0 });
      assert(frac(RBUF, ref, .5) > .01, 'a tape of another exercise gives the same frame — the tape is not read');
    }
    for (let i = 0; i < Q; i += 2) {
      const t = (i + .5) / Q, { R, m } = rPose(id, t), paths = Muscles.layoutDrawn(bound, m, 1.5), sdf = G.skinSDF(R);
      Muscles.surfaceAll(bound, paths, m, ref, null, RSTART);
      Muscles.surfaceAll(bound, paths, m, RBUF, null, RSTART, { a: tapes[i], b: tapes[i + 1], w: .5 });
      const f = frac(RBUF, ref, .5); midSum += f; midN++; if (f > mid) { mid = f; midAt = `${id} t=${t}`; }
      for (let k = 0; k < bound.length; k++) {
        if (bound[k].wall) continue;
        const o = G.skinOutPoints(sdf, RBUF.subarray(RSTART[k] * RSIDES * 3, RSTART[k + 1] * RSIDES * 3), R).out;
        if (o > out) { out = o; outAt = `${bound[k].name} ${id} t=${t}`; }
      }
    }
  }
  assert(same <= .001, `frames from their own tape: ${(100 * same).toFixed(3)} % of vertices off by more than 1 mm`);
  assert(midSum / midN <= .001 && mid <= .005, `frames between tapes: ${(100 * midSum / midN).toFixed(3)} % of vertices off by more than 5 mm on average, ${(100 * mid).toFixed(3)} % at worst (${midAt})`);
  assert(out <= BODY_LIMIT, `frames between tapes: muscle body ${out.toFixed(2)} cm above the skin (${outAt})`);
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

/* ---------- стенки: прямая, наружная и внутренняя косые живота, передняя зубчатая, малая грудная (Muscles.wallSurface,
   tools/muscles/walls.js, README, «Стенки») ----------
   Позы: стоя, скручивания (лёжа, на блоке, «велосипед» — с поворотом), наклон в сторону, «дровосек», рука над головой,
   отжимания, жим лёжа, тяга сверху, пуловер, «Y-T-W», шраги, тяга к лицу, становая, «лодочка», «супермен». */
const WB = require('./muscles/walls.js'), WCX = WB.context(L.M, L.Skeleton, Muscles, skel), WSH = { R: WB.ribShell(WCX, 'R'), L: WB.ribShell(WCX, 'L') };
const WALL_POSES = [['neutral', 0], ['crunch', 1], ['cablecrunch', 1], ['bicycle', 0], ['bicycle', .5], ['sidebend', 1], ['cablewood', 0], ['cablewood', 1], ['ohp', 1],
  ['pushup', 0], ['bbbench', .5], ['latpull', .5], ['pullover', 0], ['ytw', 0], ['shrug', 1], ['facepull', 0], ['deadlift', 0], ['hollow', .5], ['superman', 1]];
const WALL_KEYS = { rectabd: 1, eo: 8, io: 6, serrant: 12, pecmin: 4 };
/* этап В: спина (столбы выпрямителя, многораздельные, квадратная поясницы) и таз (ягодичные) — число полос; у длиннейшей в столбе и
   грудная, и поясничная части, у ягодичных по 2–3 полосы на линию модели */
const BACK_KEYS = { mf: 25, spinalis: 4, ltpt: 26, il: 12, ql: 18 }, HIP_KEYS = { glmax: 7, glmed: 6, glmin: 3 }, ALL_WALLS = { ...WALL_KEYS, ...BACK_KEYS, ...HIP_KEYS };
const WALL_PARTS_OF = { ltpt: ['ltpt', 'ltpl'] }, partsOf = key => WALL_PARTS_OF[key] || [key];
/* кольцо строки q полосы k стенки (у второй, третьей… полосы линии — после колец предыдущих, строки змейкой) */
const wRing = (w, k, q) => w.r0[k] + (w.dir[k] ? w.n - 1 - q : q);
const WRI = skel.bones.findIndex(b => b.name === 'ribcage');
/* глубина точки в грудной клетке: насколько точка ближе к оси оболочки рёбер (наружная поверхность рёбер и межрёберных — мелкая
   сетка walls.js, 0,5° × 0,25 см), чем сама оболочка, см (≤ 0 — снаружи); −∞ — рёбер на этом азимуте и высоте нет */
function ribDepth(m, S, p) {
  const o = WRI * 12, d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]), q = [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]);
  const ch = WB.chartOf(S, q); if (ch.th < 0 || ch.th > 180) return -Infinity;
  const rs = WB.shellFine(S, ch.th, ch.y); return rs > 0 ? rs - ch.r : -Infinity;
}
/* показатели стенки по готовой сетке (как рисуется): общие швы соседних полос (у шва три общие вершины) и перекрут (нормаль
   кольца — верх минус низ середины — разворачивается между соседними кольцами). Обход колец (знак площади сечения), как у лент,
   здесь не проверяется: строки полос косые к самим полосам (зубцы входят друг в друга на 2–3 см вдоль волокон — у края полосы
   сечение вырождается в щель, и знак его площади не определён) */
function wallStats(pos, wall) {
  const st = { seams: 0, shared: 0, twist: 1, twistAt: '' };
  for (let k = 0; k < wall.K; k++) {
    const i = wall.lines[k]; let prevN = null;
    for (let q = 0; q < wall.n; q++) {
      const r = wRing(wall, k, q);
      /* кольцо тоньше 1 мм посередине (пласт, сжатый между кожей и рёбрами до 0,3 своей толщины, — у рёберной дуги при
         скручивании с поворотом) — направление «верх минус низ» не определено: не в счёт */
      const D = rSub(rV(pos, i, r, 0), rV(pos, i, r, 4)); if (Math.hypot(...D) < .1) { prevN = null; continue; }
      const N = rUnit(D);
      if (prevN && rDot(N, prevN) < st.twist) { st.twist = rDot(N, prevN); st.twistAt = `${bound[i].name} r${r}`; }
      prevN = N;
    }
  }
  for (let k = 0; k + 1 < wall.K; k++) for (let q = 0; q < wall.n; q++) {
    const a = wall.lines[k], b = wall.lines[k + 1], ra = wRing(wall, k, q), rb = wRing(wall, k + 1, q); let same = 0; st.seams++;
    for (let j = 0; j < RSIDES; j++) { const p = rV(pos, a, ra, j); for (let l = 0; l < RSIDES; l++) if (Math.hypot(...rSub(p, rV(pos, b, rb, l))) < 1e-9) { same++; break; } }
    if (same >= 3) st.shared++;
  }
  return st;
}
/* объём стенки по узлам кадра (wall.P — опорная поверхность, wall.TH — толщина): по полосам и строкам — четырёхугольники
   между строками q и q + 1 × средняя толщина углов (независимо от расчёта в walls.js) */
function wallVolume(wall) {
  const { P, TH, rows, K, n } = wall, pt = v => [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]];
  return Array.from({ length: K }, (_, k) => Array.from({ length: n - 1 }, (_, q) => {
    let V = 0;
    for (const [e0, e1] of [[0, 1], [1, 2]]) {
      const a = rows[(k * n + q) * 3 + e0], b = rows[(k * n + q) * 3 + e1], c = rows[(k * n + q + 1) * 3 + e1], d = rows[(k * n + q + 1) * 3 + e0];
      V += .5 * Math.hypot(...rCross(rSub(pt(c), pt(a)), rSub(pt(d), pt(b)))) * (TH[a] + TH[b] + TH[c] + TH[d]) / 4;
    }
    return V;
  }));
}

test('walls: abdominal wall, serratus anterior and pectoralis minor are sheets of their lines, both sides mirrored', () => {
  for (const side of ['R', 'L']) assert.deepEqual(Object.fromEntries(bound.walls.filter(w => w.side === side).map(w => [w.key, w.K])), ALL_WALLS, side);
  const inFans = new Set((bound.fans || []).flatMap(f => f.lines));
  for (const w of bound.walls) for (const i of new Set(w.lines)) {
    assert(partsOf(w.key).includes(bound[i].part), `${bound[i].name}: part ${bound[i].part} in wall ${w.key}`); assert.equal(bound[i].side, w.side);
    /* у линии — n колец на каждую свою полосу */
    assert(!inFans.has(i), `${bound[i].name}: also a ribbon`); assert.equal(Muscles.ringCount(bound[i]), w.n * w.lines.filter(j => j === i).length, 'common ring count');
  }
  /* все линии этих мышц — в стенках (трубок от них не осталось) */
  const wallParts = new Set(Object.keys(ALL_WALLS).flatMap(partsOf));
  for (const mu of bound) if (wallParts.has(mu.part)) assert(mu.wall, `${mu.name}: not in a wall`);
  /* левая — зеркало правой: узлы в рамке таза (x → −x) в нейтральной позе; узлы скольжения (передняя зубчатая, малая грудная)
     лежат на оболочке рёбер своей стороны, а грудная клетка MyoSim несимметрична (|R − L| оболочки: медиана 0,1 мм, 95 % — до
     0,9 мм) — у них до 2 мм */
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const o = skel.bones.findIndex(b => b.name === 'sacrum') * 12, loc = (w, v) => { const d = [0, 1, 2].map(r => w.P[v * 3 + r] - m[o + r * 4 + 3]); return [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); };
  for (const key of Object.keys(ALL_WALLS)) {
    const R = bound.walls.find(w => w.key === key && w.side === 'R'), Lw = bound.walls.find(w => w.key === key && w.side === 'L');
    assert.deepEqual(Lw.lines.map(i => bound[i].name.replace(/_l$/, '')), R.lines.map(i => bound[i].name.replace(/_r$/, '')));
    for (let v = 0; v < R.N; v++) {
      const a = loc(R, v), b = loc(Lw, v), d = Math.hypot(a[0] + b[0], a[1] - b[1], a[2] - b[2]);
      assert(d < (R.kind[v] === 3 ? .2 : .05), `${key}: node ${v} of the left side is not the mirror of the right (${d.toFixed(3)} cm)`);
    }
  }
});

/* Объём — МРТ (volumes.js), у прямой — и доли частей между перемычками по массам препаратов (Brown et al., 2011, Spine 36:
   355–362: снизу вверх 34,4 / 30,9 / 19,3 / 15,3 %); толщина — с УЗИ мужчин (Lim, 2013, J Korean Soc Phys Ther 25:
   405–410): прямая в 4 см от пупка — 11,7–11,9 мм, наружная косая — 5,5–5,9 мм */
test('walls keep the MRI volume, the rectus part shares of the dissections and the ultrasound thickness', () => {
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const neutral = {};
  for (const w of bound.walls) {
    const V = wallVolume(w), drawn = V.flat().reduce((a, b) => a + b, 0), mri = [...new Set(w.lines)].reduce((s, i) => s + bound[i].v, 0);
    neutral[w.key + w.side] = drawn;
    /* столбы выпрямителя и многораздельные (этап В) заполняют всё место между огибающей костей и кожей, но объём МРТ в него не
       помещается (walls.js, BK; README, «Спина»): у них — не меньше BACK_FILL от МРТ и не больше МРТ */
    const lo = BACK_FILL[w.key];
    if (lo) assert(drawn / mri > lo && drawn / mri < 1.04, `${w.key}${w.side}: ${drawn.toFixed(0)} cm³ drawn, MRI ${mri.toFixed(0)} (at least ×${lo})`);
    else assert(Math.abs(drawn / mri - 1) < .04, `${w.key}${w.side}: ${drawn.toFixed(0)} cm³ drawn, MRI ${mri.toFixed(0)}`);
  }
  /* прямая: части между перемычками (строки 0–7 — лобок–пупок, 8–12, 13–17, 18–21 — выше мечевидного) */
  const ra = bound.walls.find(w => w.key === 'rectabd' && w.side === 'R'), V = wallVolume(ra)[0], SEG = q => (q < 7 ? 0 : q < 12 ? 1 : q < 17 ? 2 : 3);
  const part = [0, 0, 0, 0]; V.forEach((v, q) => { part[SEG(q)] += v; });
  const tot = part.reduce((a, b) => a + b, 0);
  [.344, .309, .193, .153].forEach((s, k) => assert(Math.abs(part[k] / tot - s) < .03, `rectus part ${k}: ${(100 * part[k] / tot).toFixed(1)} % (Brown ${(100 * s).toFixed(1)} %)`));
  /* толщина прямой в 4 см выше и ниже пупка (h 20 и 12): сечение — линза (у белой линии 0,7, посередине 1, у наружного края
     0,55 толщины середины); средняя по ширине — как у УЗИ (±15 %), значение УЗИ — между краем и серединой (датчик — в 2–3 см
     от средней линии) */
  const H0 = rPose('neutral', 0).R.frames.pelvis.o[1], hOf = q => H0 - ra.P[ra.rows[q * 3 + 1] * 3 + 1];
  for (const h of [12, 20]) {
    let best = 0; for (let q = 1; q < ra.n; q++) if (Math.abs(hOf(q) - h) < Math.abs(hOf(best) - h)) best = q;
    const th = [0, 1, 2].map(e => ra.TH[ra.rows[best * 3 + e]]), mean = th.reduce((a, b) => a + b, 0) / 3;
    assert(Math.abs(mean / 1.18 - 1) < .15 && Math.min(...th) < 1.18 && Math.max(...th) > 1.18, `rectus at h ${h}: ${th.map(x => x.toFixed(2)).join(' / ')} cm (ultrasound 1.17–1.19)`);
  }
  const eo = bound.walls.find(w => w.key === 'eo' && w.side === 'R'), eoMax = Math.max(...eo.TH);
  assert(eoMax > .43 && eoMax < .71, `external oblique belly ${eoMax.toFixed(2)} cm (ultrasound 0.55–0.59)`);
  /* в позах объём части сохраняется: σ — нейтральная площадь к нынешней (в пределах WALL_SIG — до 25 %). Большая ягодичная в
     глубоком сгибании бедра (становая внизу, присед, мах гирей, «велосипед») — до 30 % тоньше: кожа манекена между ягодицей и
     бедром прижимает пласт к суставу, и низ пласта не ближе 6,5 см к центру головки бедра (Muscles, WALL_HIPCORE) — иначе он
     уходил бы в сустав и седалищный бугор и выворачивался (README, «Ягодичные») */
  const VOL_LO = { glmax: .68 };
  for (const [id, t] of WALL_POSES) {
    const { m: mm } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, mm, 1.5), mm, RBUF, null, RSTART);
    for (const w of bound.walls) { const d = wallVolume(w).flat().reduce((a, b) => a + b, 0) / neutral[w.key + w.side], lo = VOL_LO[w.key] || .75; assert(d > lo && d < 1.25, `${w.key}${w.side} in ${id} t=${t}: volume ×${d.toFixed(2)}`); }
  }
});

test('walls: shared seams and no twist — in twists, crunches and with the arm overhead', () => {
  const { m } = rPose('neutral', 0);
  for (const [id, t] of WALL_POSES) {
    const { m: mm } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, mm, 1.5), mm, RBUF, null, RSTART);
    for (const w of bound.walls) {
      const st = wallStats(RBUF, w), where = `${w.key}${w.side} in ${id} t=${t}`;
      assert.equal(st.shared, st.seams, `${where}: ${st.seams - st.shared} seams not shared`);
      assert(st.twist > 0, `${where}: the sheet turns over between rings (${st.twistAt}, cos ${st.twist.toFixed(2)})`);
    }
    /* зигзаг передней зубчатой и наружной косой: кончики зубцов D5…D9 и E5…E8 — одни точки у обеих стенок (зубцы входят друг
       в друга без щели и нахлёста); верхняя строка наружной косой — D5 E5 D6 … D9, у зубчатой — D9 E8 D8 … D5 */
    for (const side of ['R', 'L']) {
      const sa = bound.walls.find(w => w.key === 'serrant' && w.side === side), eo = bound.walls.find(w => w.key === 'eo' && w.side === side);
      for (let c = 0; c <= 8; c++) {
        const a = [0, 1, 2].map(j => eo.P[c * 3 + j]), b = [0, 1, 2].map(j => sa.P[(8 - c) * 3 + j]), d = Math.hypot(...rSub(a, b));
        /* справа — одни числа (до округления данных), слева кончики наружной косой — зеркало, зубчатая — на оболочке своей
           стороны (несимметрия рёбер): до 0,5 мм */
        assert(d < (side === 'R' ? .01 : .05), `${side} ${id} t=${t}: zigzag node ${c} of the serratus and the external oblique apart by ${d.toFixed(3)} cm`);
      }
    }
  }
  /* отрицательные: полоса, сдвинутая на 1 см, — швы не общие; перевёрнутое кольцо (верх и низ местами) — перекрут */
  Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const eo = bound.walls.find(w => w.key === 'eo' && w.side === 'R'), i = eo.lines[3], copy = RBUF.slice();
  for (let r = 0; r < eo.n; r++) for (let j = 0; j < RSIDES; j++) copy[((RSTART[i] + r) * RSIDES + j) * 3] += 1;
  assert(wallStats(copy, eo).shared < wallStats(RBUF, eo).shared, 'a strip moved off its seams is not detected');
  const flip = RBUF.slice(), r0 = 6;
  for (let j = 0; j < RSIDES; j++) for (let c = 0; c < 3; c++) flip[((RSTART[i] + r0) * RSIDES + j) * 3 + c] = RBUF[((RSTART[i] + r0) * RSIDES + (RSIDES - j + 4) % RSIDES) * 3 + c];
  assert(wallStats(flip, eo).twist < 0, 'a ring turned over is not detected');
});

/* Снаружи рёбер, под кожей, не в чужих костях. Пути этих мышц (хорды MyoBack и DAS3) — большей частью внутри грудной клетки
   (README, «Стенки»), тела-трубки шли за ними; пласт лежит на рёбрах: вершин глубже 3 мм под оболочкой рёбер — не больше
   0,1 %, глубже 6 мм — нет; над кожей — не выше 0,5 см (трубки и ленты — до 2,6); в чужих костях — не глубже 0,8 см
   (как межрёберные пласты, SHEET_LIMIT) */
const WALL_LIMIT = { rib: .3, ribShare: .001, ribMax: .6, skin: .5, bone: .8 };
/* доля объёма МРТ, которая помещается в столбы спины (место между огибающей костей и кожей манекена): многораздельные — желоб у
   остистых отростков (вершины отростков — 2 см под кожей, крестец — 1 см), длиннейшая и подвздошно-рёберная — до поперечных
   отростков, углов рёбер и квадратной поясницы */
const BACK_FILL = { mf: .5, ltpt: .8, il: .85 };
function wallBody(id, t, pos = null) {
  const G = require('./muscles/geometry.js'), pbs = wallBody.pbs || (wallBody.pbs = G.prepareBones(skel));
  const { R, m } = rPose(id, t), sdf = G.skinSDF(R), pose = G.poseBones(pbs, m);
  if (!pos) { Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART); pos = RBUF; }
  const out = {};
  for (const w of bound.walls) {
    if (!WALL_KEYS[w.key]) continue;
    const f = out[w.key] || (out[w.key] = { n: 0, deep: 0, rib: 0, ribAt: '', skin: -Infinity, skinAt: '', bone: 0, boneAt: '' }), S = WSH[w.side];
    for (const i of w.lines) {
      const sub = pos.subarray(RSTART[i] * RSIDES * 3, RSTART[i + 1] * RSIDES * 3), so = G.skinOutPoints(sdf, sub, R);
      if (so.out > f.skin) { f.skin = so.out; f.skinAt = bound[i].name; }
      for (let k = 0; k < sub.length; k += 3) {
        const p = [sub[k], sub[k + 1], sub[k + 2]], d = ribDepth(m, S, p);
        if (d > -Infinity) { f.n++; if (d > WALL_LIMIT.rib) f.deep++; if (d > f.rib) { f.rib = d; f.ribAt = bound[i].name; } }
        for (let bi = 0; bi < pbs.length; bi++) {
          if (bi === WRI) continue;
          const b = pose[bi]; if (p[0] < b.lo[0] || p[0] > b.hi[0] || p[1] < b.lo[1] || p[1] > b.hi[1] || p[2] < b.lo[2] || p[2] > b.hi[2]) continue;
          const q = b.inv(p); if (G.insideBone(pbs[bi], q)) { const dd = pbs[bi].near(q); if (dd > f.bone) { f.bone = dd; f.boneAt = `${bound[i].name} in ${pbs[bi].name}${pbs[bi].side || ''}`; } }
        }
      }
    }
  }
  return out;
}
test('walls lie on the ribs, not inside the ribcage, under the skin and out of other bones', () => {
  for (const [id, t] of WALL_POSES) for (const [key, f] of Object.entries(wallBody(id, t))) {
    const where = `${key} in ${id} t=${t}`;
    assert(f.deep <= WALL_LIMIT.ribShare * f.n, `${where}: ${(100 * f.deep / f.n).toFixed(2)} % of vertices deeper than 3 mm in the ribcage`);
    assert(f.rib <= WALL_LIMIT.ribMax, `${where}: ${f.rib.toFixed(2)} cm inside the ribcage (${f.ribAt})`);
    assert(f.skin <= WALL_LIMIT.skin, `${where}: ${f.skin.toFixed(2)} cm above the skin (${f.skinAt})`);
    assert(f.bone <= WALL_LIMIT.bone, `${where}: ${f.bone.toFixed(2)} cm deep in a bone (${f.boneAt})`);
  }
  /* отрицательные: передняя зубчатая, вдавленная на 1,5 см к оси грудной клетки, — в рёбрах; вынесенная на 1,5 см наружу — над
     кожей */
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const sa = bound.walls.find(w => w.key === 'serrant' && w.side === 'R'), o = WRI * 12, zc = WSH.R.zc;
  const axis = p => { const d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]), q = [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); return rUnit([0, 1, 2].map(r => m[o + r * 4] * q[0] + m[o + r * 4 + 2] * (q[2] - zc))); };
  for (const [D, check] of [[-1.5, f => f.rib > WALL_LIMIT.ribMax], [1.5, f => f.skin > WALL_LIMIT.skin]]) {
    const copy = RBUF.slice();
    for (const i of sa.lines) for (let v = RSTART[i] * RSIDES; v < RSTART[i + 1] * RSIDES; v++) { const a = axis([copy[v * 3], copy[v * 3 + 1], copy[v * 3 + 2]]); for (let j = 0; j < 3; j++) copy[v * 3 + j] += D * a[j]; }
    assert(check(wallBody('neutral', 0, copy).serrant), `serratus moved ${D} cm along the ribcage radius is not detected`);
  }
});

/* ---------- этап В: спина и таз (README, «Спина», «Ягодичные», «Пол лент спины») ----------
   Позы: стоя, становая (низ и верх), гиперэкстензия, «супермен», присед (середина и низ), выпад, ягодичный мост, тяга бедром,
   скручивания на блоке, присед с гирей у груди, мах гирей, присед на одной ноге, тяги (сверху, к поясу, в наклоне, Т-гриф),
   тяга к лицу, «велосипед», наклон в сторону, «дровосек». */
const COVER = require('./muscles/cover.js');
const BACK_POSES = [['neutral', 0], ['deadlift', 0], ['deadlift', 1], ['hyper', 1], ['superman', 1], ['squat', .5], ['squat', 1], ['lunge', 1], ['bridge', 1],
  ['hipthrust', 1], ['cablecrunch', 1], ['goblet', 1], ['kbswing', 0], ['pistolbox', 1], ['latpull', 0], ['latpull', 1], ['cablerow', 1], ['bbrow', 1],
  ['tbarrow', 1], ['facepull', 1], ['bicycle', .5], ['sidebend', 1], ['cablewood', 0]];
/* части столбов выпрямителя, многораздельных и квадратной поясницы (не считаются «широкими» мышцами над лопаткой) */
const ES_PARTS = new Set(['mf', 'spinalis', 'ltpt', 'ltpl', 'il', 'ql']);
/* тело стенок спины и таза кадра: над кожей и в костях — у столбов спины и в грудной клетке (они лежат на рёбрах и поперечных
   отростках, а не в них), у ягодичных — в тазе и бедре, на которых лежат */
function backBody(id, t, pos = null) {
  const G = require('./muscles/geometry.js'), pbs = wallBody.pbs || (wallBody.pbs = G.prepareBones(skel));
  const { R, m } = rPose(id, t), sdf = G.skinSDF(R), pose = G.poseBones(pbs, m);
  if (!pos) { Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART); pos = RBUF; }
  const out = {};
  for (const w of bound.walls) {
    if (!BACK_KEYS[w.key] && !HIP_KEYS[w.key]) continue;
    const f = out[w.key] || (out[w.key] = { skin: -Infinity, skinAt: '', bone: 0, boneAt: '' });
    for (const i of new Set(w.lines)) {
      const sub = pos.subarray(RSTART[i] * RSIDES * 3, RSTART[i + 1] * RSIDES * 3), so = G.skinOutPoints(sdf, sub, R);
      if (so.out > f.skin) { f.skin = so.out; f.skinAt = bound[i].name; }
      for (let k = 0; k < sub.length; k += 3) {
        const p = [sub[k], sub[k + 1], sub[k + 2]];
        for (let bi = 0; bi < pbs.length; bi++) {
          const b = pose[bi]; if (p[0] < b.lo[0] || p[0] > b.hi[0] || p[1] < b.lo[1] || p[1] > b.hi[1] || p[2] < b.lo[2] || p[2] > b.hi[2]) continue;
          const q = b.inv(p); if (G.insideBone(pbs[bi], q)) { const dd = pbs[bi].near(q); if (dd > f.bone) { f.bone = dd; f.boneAt = `${bound[i].name} in ${pbs[bi].name}${pbs[bi].side || ''}`; } }
        }
      }
    }
  }
  return out;
}
test('back and hip walls: under the skin and out of the bones they lie on (the erector on the ribs, not in them)', () => {
  for (const [id, t] of BACK_POSES) for (const [key, f] of Object.entries(backBody(id, t))) {
    const where = `${key} in ${id} t=${t}`;
    assert(f.skin <= WALL_LIMIT.skin, `${where}: ${f.skin.toFixed(2)} cm above the skin (${f.skinAt})`);
    assert(f.bone <= WALL_LIMIT.bone, `${where}: ${f.bone.toFixed(2)} cm deep in a bone (${f.boneAt})`);
  }
  /* отрицательные: большая ягодичная, вынесенная на 2 см назад, — над кожей; столбы, вдавленные на 3 см вперёд, — в костях */
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  /* каталог: z — вперёд */
  const fwd = [0, 0, 1];
  for (const [keys, D, check] of [[['glmax'], -2, f => f.glmax.skin > WALL_LIMIT.skin], [['ltpt', 'il'], 3, f => f.ltpt.bone > WALL_LIMIT.bone || f.il.bone > WALL_LIMIT.bone]]) {
    const copy = RBUF.slice();
    for (const w of bound.walls.filter(w => keys.includes(w.key))) for (const i of new Set(w.lines)) for (let v = RSTART[i] * RSIDES; v < RSTART[i + 1] * RSIDES; v++) for (let j = 0; j < 3; j++) copy[v * 3 + j] += D * fwd[j];
    assert(check(backBody('neutral', 0, copy)), `${keys.join(', ')} moved ${D} cm along the body axis is not detected`);
  }
});
/* общее для покрытия: тела кадра в RBUF, коробки мышц (без частей skip) */
const M0 = rPose('neutral', 0).m;
function coverCtx(id, t, skip = null) {
  const G = require('./muscles/geometry.js'), { R, m } = rPose(id, t);
  Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  return { skel, bound, start: RSTART, pos: RBUF, sides: RSIDES, m, m0: M0, sdf: G.skinSDF(R), MB: COVER.muscleBoxes(bound, RSTART, RBUF, RSIDES, skip && (mu => skip.has(mu.part))) };
}
/* Лопатка в тягах: у медиального края и корня ости её закрывают трапециевидная, ромбовидные и широчайшая (Gray's: лопатка лежит
   под ними, сквозь мышцы её край только прощупывается). Луч из задней поверхности кости наружу до кожи — по пути хоть одна из
   широких мышц (столбы выпрямителя не в счёт: они глубже лопатки). До этапа В открыто 8–48 % точек (тяга к поясу и Т-гриф —
   48 %, тяга сверху в конце — 14 %, к лицу — 9 %, в наклоне — 8 %); теперь — 0. Руки над головой (тяга сверху в начале,
   подтягивания) — вне проверки: лопатка поворачивается вверх, её край выходит из-под широчайшей к подмышке (README). */
test('back muscles cover the shoulder blade in rows: no bare medial border or spine root', () => {
  for (const [id, t] of [['cablerow', 1], ['bbrow', 1], ['tbarrow', 1], ['facepull', 1], ['latpull', 1], ['ytw', 0], ['neutral', 0]]) {
    const r = COVER.scapulaCover(coverCtx(id, t, ES_PARTS));
    assert(r.open <= .02 * r.n, `${id} t=${t}: ${r.open} of ${r.n} points of the shoulder blade are bare`);
  }
  /* отрицательная: без трапециевидной, ромбовидных и широчайшей лопатка открыта */
  const r = COVER.scapulaCover(coverCtx('cablerow', 1, new Set([...ES_PARTS, 'trapsup', 'trapmid', 'trapinf', 'rhomb', 'lat'])));
  assert(r.open > .5 * r.n, `without the broad back muscles only ${r.open} of ${r.n} points are bare`);
});
/* Позвонки сбоку от остистых отростков (дуги, поперечные отростки L1–L5 и T8–T12, задняя поверхность крестца): их закрывают
   многораздельные и столбы выпрямителя — на луче назад до кожи одна из них есть не меньше чем у 97 % точек (первой — у 94 % и
   больше: где трапециевидная в приседе толще, её низ ниже верха длиннейшей, но длиннейшая под ней на месте), открыто не больше
   2 % (до этапа В — 14 % открыто, первыми были широчайшая и трапециевидная у четверти точек) */
test('the erector spinae and multifidus cover the vertebrae beside the spinous processes without gaps', () => {
  for (const [id, t] of [['neutral', 0], ['deadlift', 0], ['hyper', 1], ['superman', 1], ['squat', 1], ['cablecrunch', 1], ['bicycle', .5], ['sidebend', 1], ['kbswing', 0]]) {
    const r = COVER.spineCover(coverCtx(id, t), ES_PARTS), first = Object.entries(r.by).reduce((s, [k, v]) => s + (ES_PARTS.has(k) ? v : 0), 0);
    assert(r.open <= .02 * r.n, `${id} t=${t}: ${r.open} of ${r.n} vertebral points are bare`);
    assert(r.deep >= .97 * r.n, `${id} t=${t}: the erector and multifidus lie over ${r.deep} of ${r.n} points`);
    assert(first >= .94 * r.n, `${id} t=${t}: the erector and multifidus are the first muscle at ${first} of ${r.n} points (${JSON.stringify(r.by)})`);
  }
  const r = COVER.spineCover(coverCtx('neutral', 0, ES_PARTS), ES_PARTS);
  assert(r.open > .25 * r.n && r.deep === 0, `without the erector and multifidus only ${r.open} of ${r.n} vertebral points are bare`);
});
/* Ягодичные без складок: в глубоком приседе, выпадах, становой, мосту, махе гирей верх большой ягодичной выворачивается не больше
   чем у 1 % четырёхугольников сетки (один из 140 — у верхнего края в глубоком выпаде в сторону), у средней — нигде в передней
   части, которая лежит под кожей (Gray's: передняя треть не закрыта большой ягодичной; столбцы 0–5 из 12), а под большой
   ягодичной — не больше 12 % (README, «Ягодичные»: у вертела в глубоком сгибании); малая — под средней. Низ (глубокая сторона, на
   средней ягодичной и костях) у большой — не больше чем у 7 % (9 из 140 в глубоком выпаде в сторону; до сглаживания сдвига на толщину и ограничения у сустава — до
   24 %) */
const FOLD_LIMIT = { glmax: { top: .01, front: 0, bottom: .07 }, glmed: { top: .12, front: 6, bottom: .12 }, glmin: { top: .05, front: 0, bottom: .1 } };
test('gluteal sheets without crumples in deep squats, lunges, deadlifts and bridges', () => {
  for (const [id, t] of [['neutral', 0], ['squat', .5], ['squat', 1], ['goblet', 1], ['lunge', 1], ['deadlift', 0], ['deadlift', 1], ['bridge', 1], ['hipthrust', 1],
    ['kbswing', 0], ['pistolbox', 1], ['cablecrunch', 1], ['bulgarian', 1], ['sidelunge', 0]]) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const w of bound.walls.filter(w => HIP_KEYS[w.key])) {
      const f = COVER.wallFolds(w), lim = FOLD_LIMIT[w.key], where = `${w.key}${w.side} in ${id} t=${t}`;
      assert(f.top <= lim.top * f.quads, `${where}: the outer surface folds over in ${f.top} of ${f.quads} quads (${f.at})`);
      assert(!f.topQ.some(([, c]) => c < lim.front), `${where}: the subcutaneous front part folds over (${f.at})`);
      assert(f.bottom <= lim.bottom * f.quads, `${where}: the deep surface folds in ${f.bottom} of ${f.quads} quads (${f.at})`);
    }
  }
  /* отрицательные: строка узлов, сдвинутая за следующую вдоль волокон, — верх вывернут; сдвиг на толщину наружу у узла — низ */
  const { m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const w = bound.walls.find(w => w.key === 'glmax' && w.side === 'R'), C2 = 2 * w.K + 1, q = 5;
  const bad = { ...w, P: Float64Array.from(w.P) };
  for (let c = 0; c < C2; c++) for (let j = 0; j < 3; j++) bad.P[(q * C2 + c) * 3 + j] = w.P[((q + 2) * C2 + c) * 3 + j] + (w.P[((q + 2) * C2 + c) * 3 + j] - w.P[((q + 1) * C2 + c) * 3 + j]);
  assert(COVER.wallFolds(bad).top > 0, 'a row of nodes pushed past its neighbour is not detected');
  /* низ строки q (верх — опорный, низ = P − OF) — за низом строки q + 2 */
  const flip = { ...w, OF: Float64Array.from(w.OF || w.NR.map((x, k) => x * w.TH[(k / 3) | 0])) }, bot = (v, j) => w.P[v * 3 + j] - flip.OF[v * 3 + j];
  for (let c = 0; c < C2; c++) for (let j = 0; j < 3; j++) { const a = (q + 1) * C2 + c, b = (q + 2) * C2 + c, v = q * C2 + c; flip.OF[v * 3 + j] = w.P[v * 3 + j] - (2 * bot(b, j) - bot(a, j)); }
  assert(COVER.wallFolds(flip).bottom > 0, 'a deep surface folded back along the fibres is not detected');
});

/* Прямая: белая линия по ширине у молодых мужчин (Rath et al., 1996, Surg Radiol Anat 18: 281–288): выше пупка до 10 мм, у
   пупка до 27 мм, ниже до 9 мм; перемычки — борозды снаружи (Gray's: сращены с передней стенкой влагалища) */
test('rectus abdominis: linea alba as wide as in Rath 1996, tendinous intersections are grooves', () => {
  const { R, m } = rPose('neutral', 0); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
  const G = require('./muscles/geometry.js'), sdf = G.skinSDF(R), H0 = R.frames.pelvis.o[1];
  const rr = bound.walls.find(w => w.key === 'rectabd' && w.side === 'R'), rl = bound.walls.find(w => w.key === 'rectabd' && w.side === 'L');
  const node = (w, v) => [0, 1, 2].map(j => w.P[v * 3 + j]), hOf = q => H0 - rr.P[rr.rows[q * 3] * 3 + 1];
  const gapAt = h => { let best = 0; for (let q = 1; q < rr.n; q++) if (Math.abs(hOf(q) - h) < Math.abs(hOf(best) - h)) best = q; return Math.hypot(...rSub(node(rr, rr.rows[best * 3]), node(rl, rl.rows[best * 3]))); };
  for (const [h, lo, hi] of [[16, 2.2, 3.0], [27, .8, 1.2], [8, .7, 1.1]]) { const g = gapAt(h); assert(g > lo && g < hi, `linea alba ${g.toFixed(2)} cm wide at h ${h}`); }
  /* перемычки (строки 7, 12, 17): верх середины глубже под кожей, чем посередине соседних частей, на 2 мм и больше */
  const i = rr.lines[0], depth = q => -sdf(rV(RBUF, i, q, 0));
  for (const q of [7, 12, 17]) { const g = depth(q) - (depth(q - 2) + depth(q + 2)) / 2; assert(g > .2, `intersection at ring ${q}: groove ${g.toFixed(2)} cm`); }
});

/* Нижний край большой грудной — выпуклая дуга (Gray's: нижний край — передняя подмышечная складка, мышца закруглена книзу), а
   не прямая хорда: в проекции спереди (рамка грудной клетки) кромка нижней линии ниже хорды между её концами на 0,8 см и
   больше (до этапа Б — ломаная: −0,4…+0,1 см в нейтральной позе, жиме лёжа и отжиманиях) */
test('pectoralis major: the lower border is a convex arc below its chord', () => {
  const o = WRI * 12;
  for (const [id, t] of [['neutral', 0], ['bbbench', .5], ['pushup', .5], ['ohp', .5], ['latpull', .5]]) {
    const { m } = rPose(id, t); Muscles.surfaceAll(bound, Muscles.layoutDrawn(bound, m, 1.5), m, RBUF, null, RSTART);
    for (const nm of ['PECM3b_r', 'PECM3b_l']) {
      const i = bound.findIndex(b => b.name === nm), n = Muscles.ringCount(bound[i]);
      const V = r => { const p = rV(RBUF, i, r, 2), d = [0, 1, 2].map(c => p[c] - m[o + c * 4 + 3]); return [0, 1].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); };
      const A = V(1), B = V(n - 2); let below = -Infinity;
      for (let r = 2; r < n - 2; r++) { const p = V(r), u = (p[0] - A[0]) / (B[0] - A[0]); if (u > 0 && u < 1) below = Math.max(below, A[1] + (B[1] - A[1]) * u - p[1]); }
      assert(below >= .8, `${nm} in ${id} t=${t}: lower border ${below.toFixed(2)} cm below its chord`);
    }
  }
});
