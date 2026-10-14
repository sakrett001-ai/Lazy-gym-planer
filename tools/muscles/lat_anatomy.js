'use strict';
/* Широчайшая спины — недостающие поясничная и подвздошная части (аудит 4.31.0, tools/muscles/README.md).
   node tools/muscles/lat_anatomy.js [вход.json] [выход.json]   (по умолчанию qa/muscles/muscles.json → он же; затем pack.js)

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
   пучками как у DAS3 (volumes.js). Левая сторона — зеркально. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
const IN = path.resolve(root, process.argv[2] || 'qa/muscles/muscles.json'), OUT = path.resolve(root, process.argv[3] || IN);

const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const R = M.catalogPose(M.neutral()), m = Skeleton.frames(R, M.bodyData(R), skel.bones);
const at = (i, p) => { const o = i * 12; return [0, 1, 2].map(r => m[o + r * 4] * p[0] + m[o + r * 4 + 1] * p[1] + m[o + r * 4 + 2] * p[2] + m[o + r * 4 + 3]); };
const bone = (name, side = '') => {
  const i = skel.bones.findIndex(b => b.name === name && (b.side || '') === side), b = skel.bones[i], loc = [], w = [];
  for (let k = 0; k < b.pos.length; k += 3) { const p = [b.pos[k], b.pos[k + 1], b.pos[k + 2]]; loc.push(p); w.push(at(i, p)); }
  return { loc, w };
};
const round = p => p.map(v => +v.toFixed(3));
const sacrum = bone('sacrum'), midX = sacrum.w.reduce((s, p) => s + p[0], 0) / sacrum.w.length;

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

const md = JSON.parse(fs.readFileSync(IN, 'utf8'));
md.muscles = md.muscles.filter(mu => !/^LAT[456]_[rl]$/.test(mu.name));
const tmpl = s => md.muscles.find(mu => mu.name === 'LAT3_' + s);
/* путь у плечевой кости — как у LAT3; поясничный пучок ложится и на нижний угол лопатки (точка P3), подвздошные идут
   по боковой поверхности груди прямо к подмышке, мимо лопатки (нижние наружные волокна образуют заднюю подмышечную складку) */
const head = (s, scapula) => { const el = tmpl(s).el, k = el.findIndex(e => e.s && e.s.bone[0] === 'scapula'); return JSON.parse(JSON.stringify(el.slice(0, scapula ? k + 1 : k))); };
/* параметры — DAS3 (сила Н, оптимальная длина волокон и свободного сухожилия, см): lat_dorsi_4…6 */
const NEW = [
  ['LAT4', spinousTip('L3'), { fmax: 96, L0: 32.06, LT: 12 }, true, null],
  ['LAT5', crest(6.5), { fmax: 88, L0: 31.29, LT: 7.2 }, false, rib([midX - 11.5, 63, -4.5])],
  ['LAT6', crest(9.5), { fmax: 105, L0: 34.02, LT: 6.9 }, false, rib([midX - 13, 61, -1])],
];
const mirror = s => ({ ...s, bone: [s.bone[0].replace(/_R$/, '_L'), s.bone[1] === 'R' ? 'L' : s.bone[1]], p: [-s.p[0], s.p[1], s.p[2]] });
for (const [name, origin, par, scap, via] of NEW) {
  const r = { name: name + '_r', side: 'R', ...par, src: 'анатомия (lat_anatomy.js)', el: [...head('r', scap), ...(via ? [{ s: { ...via, site: name + '-rib_r' } }] : []), { s: { ...origin, site: name + '-origin_r' } }] };
  const l = { name: name + '_l', side: 'L', ...par, src: 'анатомия (lat_anatomy.js)', el: [...head('l', scap), ...(via ? [{ s: { ...mirror(via), site: name + '-rib_l' } }] : []), { s: { ...mirror(origin), site: name + '-origin_l' } }] };
  md.muscles.push(r, l);
  console.log(name, 'начало', origin.bone.join(''), origin.p.join(' '));
}
fs.writeFileSync(OUT, JSON.stringify(md));
console.log('широчайшая: пучков', md.muscles.filter(mu => /^LAT\d_r$/.test(mu.name)).length, '→', path.relative(root, OUT));
