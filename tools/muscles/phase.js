'use strict';
/* Цвет по фазам против работы мышц (аудит анатомии 4.53.0, находка 8; этап А). В «Анатомии» с «Мышцами по фазам» мышца
   горит по учебному профилю упражнения (src/js/09b-muscle-profiles.js, 09d-catalog-muscles.js; цвет части —
   muscleTint в src/volume/muscles.mjs). Правило: основные мышцы в рабочей (концентрической) фазе укорачиваются и горят
   ярче всего. Здесь для каждого упражнения каталога считаются:
   - длина каждой части мышцы (сумма её линий, стороны раздельно) в начале и в конце рабочей фазы — те же пути, что
     рисует приложение (Muscles.layout на запечённой позе); рабочая фаза — t 0→1, у eccFirst — 1→0;
   - яркость той же части в середине рабочей фазы и в середине возврата — значение, которое muscleTint переводит в цвет
     (та же функция, цвет — тождественный).
   node tools/muscles/phase.js [id,id] [--all] — печатает противоречия (яркая часть удлиняется в рабочей фазе; сильно
   укорачивается, а горит цветом покоя); проверка — tools/muscle-phase.test.js. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js')), Muscles = require(path.join(root, 'src/js/09br-muscles.js'));
const { loadModel } = require(path.join(root, 'tools/biomechanics-audit.js'));

const read = f => zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data', f)));
const skel = Skeleton.decode(read('skeleton.bin')), md = Muscles.decode(read('muscles.bin')), bound = Muscles.bind(md, skel);
/* ключ части: семейство мышцы (pack.js, PARTS) и сторона; линии одной части в одном упражнении горят одинаково */
const KEYS = [...new Set(bound.map(mu => mu.part + '|' + mu.side))];
const FIRST = Object.fromEntries(KEYS.map(k => [k, bound.find(mu => mu.part + '|' + mu.side === k)]));
function lengths(R) {
  const P = Muscles.layout(bound, Skeleton.frames(R, M.bodyData(R), skel.bones)), out = {};
  bound.forEach((mu, i) => { const k = mu.part + '|' + mu.side; out[k] = (out[k] || 0) + P[i].length; });
  return out;
}
let MODEL = null;
function model() {
  if (!MODEL) { const m = loadModel({ fullApp: true }); MODEL = { m, ...m.get('({muscleFrame,catalogSideValues,motionProfile,EXI:Object.fromEntries(EX.map(e=>[e.id,e]))})') }; }
  return MODEL;
}
/* яркость частей в середине фазы index (0 — t 0→1, 2 — t 1→0): значение, которое muscleTint отдаёт в цвет; часть без
   цвета (не в профиле, без группы) — null */
function brightness(anim, index, tint) {
  const { muscleFrame, catalogSideValues, motionProfile } = model(), p = motionProfile(anim), s = muscleFrame(anim, .5, index);
  const look = { phases: true, values: s.values, sideValues: catalogSideValues(p, s.values), regions: p.regions }, out = {};
  for (const k of KEYS) { const v = tint(FIRST[k], null, look, x => x); out[k] = typeof v === 'number' ? v : null; }
  return out;
}
/* одно упражнение: по частям — длина в начале рабочей фазы, изменение за рабочую фазу (см и доля), яркость в рабочей
   фазе и в возврате, группы части. samples — промежуточные кадры для наибольшего хода внутри фазы */
async function measure(id, { samples = 2 } = {}) {
  const { muscleTint } = await import(path.join(root, 'src/volume/muscles.mjs'));
  const { EXI } = model(), ex = EXI[id], a = ex.anim, rig = a.catalogRig;
  const ecc = !!a.eccFirst, conIndex = ecc ? 2 : 0;
  const ts = Array.from({ length: samples + 1 }, (_, i) => i / samples), L = ts.map(t => lengths(rig(t)));
  const start = ecc ? L.at(-1) : L[0], end = ecc ? L[0] : L.at(-1);
  const con = brightness(a, conIndex, muscleTint), back = brightness(a, 2 - conIndex, muscleTint);
  const parts = {};
  for (const k of KEYS) {
    const d = end[k] - start[k], ls = L.map(x => x[k]);
    parts[k] = { part: k.split('|')[0], side: k.split('|')[1], groups: FIRST[k].group || [], L: start[k], d, rel: d / start[k],
      range: Math.max(...ls) - Math.min(...ls), con: con[k], back: back[k] };
  }
  const p = model().motionProfile(a);
  for (const q of Object.values(parts)) q.roles = q.groups.map(g => p?.muscles[g]?.role).filter(Boolean);
  return { id, ecc, hold: !!a.hold, loop: !!a.loop, cyclic: !!p?.cyclic, parts };
}
/* стороны одной части с одинаковым ходом и яркостью — одной строкой */
function merged(rows) {
  const out = [];
  for (const q of rows) {
    const twin = out.find(o => o.part === q.part && o.side !== q.side && o.side.length === 1 && Math.abs(o.d - q.d) < .2 && o.con === q.con);
    if (twin) twin.side = 'LR'; else out.push({ ...q });
  }
  return out;
}
const ids = () => Object.keys(model().EXI);
module.exports = { measure, ids, model, KEYS };

if (require.main === module) (async () => {
  const args = process.argv.slice(2), list = args.find(a => !a.startsWith('--'));
  const pick = list ? list.split(',') : ids(), all = args.includes('--all'), f = x => (x >= 0 ? '+' : '') + x.toFixed(1);
  for (const id of pick) {
    const r = await measure(id);
    const rows = Object.values(r.parts).filter(q => all || (q.con !== null && q.con >= .45 && q.d > 1 && q.rel > .03) || (q.d < -1.5 && q.rel < -.08 && (q.con === null || q.con < .35)));
    if (!rows.length) continue;
    console.log(`${id}${r.ecc ? ' (eccFirst)' : ''}${r.hold ? ' удержание' : ''}${r.cyclic || r.loop ? ' цикл' : ''}`);
    for (const q of merged(rows.sort((a, b) => b.rel - a.rel)))
      console.log(`  ${q.part.padEnd(9)} ${q.side.padEnd(2)} ${q.groups.join('+').padEnd(18)} ${(q.roles.join('/') || '—').padEnd(10)} рабочая фаза ${f(q.d)} см (${f(q.rel * 100)} %)  яркость ${q.con === null ? '—' : q.con.toFixed(2)} / возврат ${q.back === null ? '—' : q.back.toFixed(2)}`);
  }
})();
