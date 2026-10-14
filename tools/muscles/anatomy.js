'use strict';
/* Части мышц, которых нет в исходных моделях, — по анатомии (аудит прикреплений, tools/muscles/README.md).
   node tools/muscles/anatomy.js [вход.json] [выход.json]   (по умолчанию qa/muscles/muscles.json → он же; затем pack.js)
   До 4.34.0 скрипт назывался lat_anatomy.js и достраивал только широчайшую.

   1. Широчайшая спины (4.32.0) — поясничная и подвздошная части.
   В модели руки MoBL-ARMS (MyoSim) нет таза: все три пучка широчайшей (LAT1–LAT3) посажены на грудную клетку и
   начинаются на T7, T10 и T12. По анатомии (OpenStax Anatomy and Physiology 2e, 11.5) широчайшая начинается от
   остистых отростков T7–T12, через пояснично-грудную фасцию — от поясничных позвонков и от гребня подвздошной кости.
   Модель плеча DAS3 (Chadwick и др., 2014, по препаратам Klein Breteler и др., 1999) делит её на шесть пучков:
   три грудных (T8, T10, T12), поясничный (у остистых отростков на высоте L3) и два наружных (в 8 и 10 см от средней
   линии на высоте L2–L3 — до таза DAS3 тоже не доходит: таза в ней нет). Здесь пучки LAT1–LAT3 остаются как есть, а
   три недостающих строятся на костях манекена:
   - LAT4 — поясничный: от вершины остистого отростка L3 (пояснично-грудная фасция крепится к остистым отросткам);
   - LAT5, LAT6 — подвздошные: от заднего отдела гребня подвздошной кости, в 6,5 и 9,5 см от средней линии (кнаружи
     от выпрямителя спины), в самой высокой точке гребня на этом расстоянии.
   Путь от плечевой кости до нижнего угла лопатки — как у LAT3 (те же точки и огибающие тела MoBL-ARMS: широчайшая
   ложится на нижний угол лопатки и огибает плечевую кость к межбугорковой борозде). Объём делится между шестью
   пучками как у DAS3 (volumes.js). Левая сторона — зеркально.

   2. Наружная косая живота (4.34.0) — верхние зубцы, рёбра 5 и 6.
   В модели поясницы MyoSim (MyoBack, по Christophy и др., 2012) шесть пучков наружной косой начинаются на рёбрах 7–11:
   EO1–EO4 — у передних концов рёбер 7–10, EO5–EO6 — сбоку на рёбрах 10–11. По анатомии (Gray's Anatomy, 42-е изд.,
   2020) мышца начинается восемью зубцами от наружных поверхностей рёбер 5–12; верхние зубцы — у хрящей рёбер, между
   зубцами передней зубчатой, и через апоневроз уходят к белой линии. Достраиваются пучки EO7 (ребро 5) и EO8 (ребро 6):
   - начало — наружная поверхность ребра в продолжении линии зубцов EO1–EO4: угол вокруг вертикальной оси груди
     (от средней линии спереди) растёт от ребра к ребру почти на одну величину (≈ 5,6° на ребро), для рёбер 5 и 6 он
     продлевается по прямой, подобранной по EO1–EO4; на ребре — наружная треть вершин в пределах ±5° от этого угла;
   - конец — апоневроз у белой линии, как у EO1–EO4: в 3 см от средней линии (у EO1–EO4 — 3,2–4,3 см), ниже начала
     на столько же, на сколько у EO1–EO4 (волокна идут вниз и к середине под тем же углом, ≈ 45°), на глубине 2 см под
     кожей — поверх хрящей рёбер и лежащей на них прямой мышцы (кожа манекена на 3,5 см впереди хрящей; у EO1–EO4
     концы ниже рёберной дуги, где хрящей нет). Кость — L3, как у EO1–EO4 (тело-посредник брюшной стенки MyoSim).
   Путь — от апоневроза к ребру (как у EO1: сухожилие в начале пути). Сила — как у соседнего пучка EO1 (ребро 7):
   данных о силе верхних зубцов в моделях нет; объём наружной косой (МРТ) делится между восемью пучками (volumes.js).
   Левая сторона — зеркально. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
const G = require('./geometry.js');
const IN = path.resolve(root, process.argv[2] || 'qa/muscles/muscles.json'), OUT = path.resolve(root, process.argv[3] || IN);

const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), skel.bones);
const at = (i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
const index = (name, side = '') => skel.bones.findIndex(b => b.name === name && (b.side || '') === side);
const bone = (name, side = '') => {
  const i = index(name, side), b = skel.bones[i], loc = [], w = [];
  for (let k = 0; k < b.pos.length; k += 3) { const p = [b.pos[k], b.pos[k + 1], b.pos[k + 2]]; loc.push(p); w.push(at(i, p)); }
  return { i, b, loc, w };
};
/* мир → рамка кости (рамки — поворот и сдвиг: обратная — транспонированный поворот) */
const toLocal = (i, p) => { const o = i * 12, d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]); return [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]); };
const round = p => p.map(v => +v.toFixed(3));
const mean = v => [0, 1, 2].map(k => v.reduce((s, p) => s + p[k], 0) / v.length);
const sacrum = bone('sacrum'), midX = sacrum.w.reduce((s, p) => s + p[0], 0) / sacrum.w.length;
const mirror = s => ({ ...s, bone: [s.bone[0].replace(/_R$/, '_L'), s.bone[1] === 'R' ? 'L' : s.bone[1]], p: [-s.p[0], s.p[1], s.p[2]] });
const pair = (name, par, el) => [
  { name: name + '_r', side: 'R', ...par, src: 'анатомия (anatomy.js)', el: el.map(s => ({ s: { ...s, site: `${name}-${s.site}_r` } })) },
  { name: name + '_l', side: 'L', ...par, src: 'анатомия (anatomy.js)', el: el.map(s => ({ s: { ...mirror(s), site: `${name}-${s.site}_l` } })) },
];

const md = JSON.parse(fs.readFileSync(IN, 'utf8'));
md.muscles = md.muscles.filter(mu => !/^(LAT[456]|EO[78])_[rl]$/.test(mu.name));

/* ---------- 1. широчайшая ---------- */
/* вершина остистого отростка L3 — самая задняя точка позвонка (каталог: Z вперёд) */
function spinousTip(name) {
  const b = bone(name); let k = 0;
  b.w.forEach((p, i) => { if (p[2] < b.w[k][2]) k = i; });
  return { bone: [name, ''], p: round(b.loc[k]) };
}
/* гребень подвздошной кости на расстоянии lat от средней линии: самая высокая точка (каталог: Y вниз), из них — задняя */
function crest(lat) {
  const b = bone('pelvis_R', 'R'), cand = b.w.map((p, i) => [p, i]).filter(([p]) => Math.abs(Math.abs(p[0] - midX) - lat) < .5);
  const top = Math.min(...cand.map(([p]) => p[1])), near = cand.filter(([p]) => p[1] < top + 1);
  const [, k] = near.reduce((a, c) => (c[0][2] < a[0][2] ? c : a));
  return { bone: ['pelvis_R', 'R'], p: round(b.loc[k]) };
}
/* точка на нижних рёбрах сзади-сбоку (каталог, см): ближайшая вершина грудной клетки — подвздошные пучки идут по рёбрам
   (у широчайшей там зубцы на рёбрах 9–12), а не напрямую сквозь бок; в отведении руки путь иначе выходит из кожи */
function rib(target) {
  const b = bone('ribcage'); let k = 0, best = Infinity;
  b.w.forEach((p, i) => { const d = Math.hypot(p[0] - target[0], p[1] - target[1], p[2] - target[2]); if (d < best) { best = d; k = i; } });
  return { bone: ['ribcage', ''], p: round(b.loc[k]) };
}
const tmpl = s => md.muscles.find(mu => mu.name === 'LAT3_' + s);
/* путь у плечевой кости — как у LAT3; поясничный пучок ложится и на нижний угол лопатки (точка P3), подвздошные идут
   по боковой поверхности груди прямо к подмышке, мимо лопатки (нижние наружные волокна образуют заднюю подмышечную складку) */
const head = (s, scapula) => { const el = tmpl(s).el, k = el.findIndex(e => e.s && e.s.bone[0] === 'scapula'); return JSON.parse(JSON.stringify(el.slice(0, scapula ? k + 1 : k))); };
/* параметры — DAS3 (сила Н, оптимальная длина волокон и свободного сухожилия, см): lat_dorsi_4…6 */
const LAT = [
  ['LAT4', spinousTip('L3'), { fmax: 96, L0: 32.06, LT: 12 }, true, null],
  ['LAT5', crest(6.5), { fmax: 88, L0: 31.29, LT: 7.2 }, false, rib([midX - 11.5, 63, -4.5])],
  ['LAT6', crest(9.5), { fmax: 105, L0: 34.02, LT: 6.9 }, false, rib([midX - 13, 61, -1])],
];
for (const [name, origin, par, scap, via] of LAT) {
  const r = { name: name + '_r', side: 'R', ...par, src: 'анатомия (anatomy.js)', el: [...head('r', scap), ...(via ? [{ s: { ...via, site: name + '-rib_r' } }] : []), { s: { ...origin, site: name + '-origin_r' } }] };
  const l = { name: name + '_l', side: 'L', ...par, src: 'анатомия (anatomy.js)', el: [...head('l', scap), ...(via ? [{ s: { ...mirror(via), site: name + '-rib_l' } }] : []), { s: { ...mirror(origin), site: name + '-origin_l' } }] };
  md.muscles.push(r, l);
  console.log(name, 'начало', origin.bone.join(''), origin.p.join(' '));
}
console.log('широчайшая: пучков', md.muscles.filter(mu => /^LAT\d_r$/.test(mu.name)).length);

/* ---------- 2. наружная косая: верхние зубцы ---------- */
{
  const rc = bone('ribcage'), n = rc.w.length, par = Array.from({ length: n }, (_, i) => i);
  const find = x => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
  for (let i = 0; i < rc.b.idx.length; i += 3) for (const [a, c] of [[rc.b.idx[i], rc.b.idx[i + 1]], [rc.b.idx[i + 1], rc.b.idx[i + 2]]]) { const ra = find(a), rb = find(c); if (ra !== rb) par[ra] = rb; }
  const comp = new Map(); for (let i = 0; i < n; i++) { const r = find(i); (comp.get(r) || comp.set(r, []).get(r)).push(i); }
  /* рёбра правой стороны — компоненты сетки грудной клетки (грудина с хрящами — одна большая компонента), сверху вниз */
  const ribs = [...comp.values()].filter(c => c.length < 200 && mean(c.map(i => rc.w[i]))[0] < midX).sort((a, c) => mean(a.map(i => rc.w[i]))[1] - mean(c.map(i => rc.w[i]))[1]);
  if (ribs.length !== 12) throw Error('рёбер справа: ' + ribs.length);
  const zc = mean(rc.w)[2], ang = p => Math.atan2(-(p[0] - midX), p[2] - zc) * 180 / Math.PI, rad = p => Math.hypot(p[0] - midX, p[2] - zc);
  const ribOf = p => { let best = Infinity, k = -1; ribs.forEach((c, j) => { for (const i of c) { const d = Math.hypot(...[0, 1, 2].map(t => rc.w[i][t] - p[t])); if (d < best) { best = d; k = j; } } }); return k + 1; };
  /* EO1–EO4 MyoSim (правые): конец на ребре и конец у апоневроза — в мире */
  const world = s => at(index(s.bone[0], s.bone[1] || ''), s.p);
  const eo = [1, 2, 3, 4].map(k => {
    const el = md.muscles.find(mu => mu.name === `EO${k}_r`).el.map(e => e.s), onRib = el.find(s => s.bone[0] === 'ribcage'), front = el.find(s => s.bone[0] === 'L3');
    const r = world(onRib), f = world(front);
    return { k, rib: ribOf(r), a: ang(r), drop: (f[1] - r[1]) / (Math.abs(r[0] - midX) - Math.abs(f[0] - midX)), r, f };
  });
  const mr = eo.reduce((s, e) => s + e.rib, 0) / 4, ma = eo.reduce((s, e) => s + e.a, 0) / 4;
  const slope = eo.reduce((s, e) => s + (e.rib - mr) * (e.a - ma), 0) / eo.reduce((s, e) => s + (e.rib - mr) ** 2, 0);
  const drop = eo.reduce((s, e) => s + e.drop, 0) / 4;
  console.log('EO1–EO4: рёбра', eo.map(e => e.rib).join(', '), '; угол', eo.map(e => e.a.toFixed(0) + '°').join(', '), `(+${slope.toFixed(1)}° на ребро); спуск ${drop.toFixed(2)} см на см к середине`);
  if (eo.map(e => e.rib).join() !== '7,8,9,10') throw Error('EO1–EO4 не на рёбрах 7–10');
  const sdf = G.skinSDF(R), skinZ = (x, y) => { for (let z = 30; z > -10; z -= .05) if (sdf([x, y, z]) < 0) return z; throw Error('нет кожи спереди'); };
  const L3 = index('L3'), src = md.muscles.find(mu => mu.name === 'EO1_r');
  for (const [name, r] of [['EO7', 5], ['EO8', 6]]) {
    const a = ma + slope * (r - mr), cand = ribs[r - 1].filter(i => Math.abs(ang(rc.w[i]) - a) < 5).sort((i, j) => rad(rc.w[j]) - rad(rc.w[i]));
    const outer = cand.slice(0, Math.max(1, Math.round(cand.length / 3)));
    const o = mean(outer.map(i => rc.w[i])), oLoc = mean(outer.map(i => rc.loc[i]));
    const x = midX - 3, y = o[1] + drop * (Math.abs(o[0] - midX) - 3), f = [x, y, skinZ(x, y) - 2];
    md.muscles.push(...pair(name, { fmax: src.fmax, L0: src.L0, LT: src.LT }, [
      { bone: ['L3', ''], p: round(toLocal(L3, f)), site: 'aponeurosis' },
      { bone: ['ribcage', ''], p: round(oLoc), site: 'rib' + r },
    ]));
    console.log(`${name}: ребро ${r}, угол ${a.toFixed(1)}° (вершин ${outer.length}), начало ${o.map(v => v.toFixed(1)).join(' ')} → апоневроз ${f.map(v => v.toFixed(1)).join(' ')}`);
  }
}
fs.writeFileSync(OUT, JSON.stringify(md));
console.log('→', path.relative(root, OUT));
