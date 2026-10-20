'use strict';
/* Геометрия мышц на позах каталога: путь мышцы не идёт сквозь кости и не выходит из кожи.
   node tools/muscles/check.js all|id,id [0,0.5,1] [--json выход] [--max-bone см] [--max-skin см]
   Позы — запечённые (src/js/09bp-poses.js, то, что видит приложение); упражнения делятся между потоками по ядрам.
   Для каждой мышцы и каждой позы: наибольшая глубина пути внутри чужой или своей кости (см, по ближайшему треугольнику;
   1,5 см у начала и прикрепления не считаются — там мышца лежит на кости) и наибольший выход за кожу (см; кисти и
   стопы — вне проверки, у них своя форма) — у линии пути и у тела мышцы (вершины Muscles.surfaceAll — трубки, этап М2,
   ленты широких плоских мышц и колпак дельтовидной).
   Межрёберные мышцы (4.40.0) — пласты (sheets): тело пласта — вершины Muscles.sheetMesh — не выше кожи (--max-body) и
   не глубже --max-bone в чужих костях (своя кость, грудная клетка, — не в счёт).
   Печатает худшие семейства мышц и упражнения.
   С --max-bone / --max-skin / --max-body — проверка для npm run check: код выхода 1 при превышении (кроме известных исключений,
   см. EXCEPT ниже). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const M = require(path.join(root, 'src/js/09bm-mannequin.js')), EQ = require(path.join(root, 'src/js/09bn-equipment.js'));
const Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js')), Muscles = require(path.join(root, 'src/js/09br-muscles.js'));
const POSES = require(path.join(root, 'src/js/09bp-poses.js'));
const { Worker, isMainThread, parentPort, workerData } = require('node:worker_threads'), os = require('node:os');
const G = require('./geometry.js');

const args = process.argv.slice(2), flag = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
const md = Muscles.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/muscles.bin'))));
const bound = Muscles.bind(md, skel), pbs = G.prepareBones(skel);
/* вершины тел всех мышц кадра (трубки и ленты — Muscles.surfaceAll, как в приложении): у ленты кольцо полосы зависит от
   соседних линий, поэтому кадр считается целиком, а проверяется по мышцам */
const START = Muscles.ringStarts(bound), SURF = new Float64Array(START[bound.length] * Muscles.SIDES * 3);
/* Пласты (межрёберные, формат 3): жёсткие, в рамке своей кости — вершины сетки (Muscles.sheetMesh) считаются один раз.
   В кадре проверяется выход тела пласта из кожи и глубина в чужих костях (своя кость — грудная клетка — не в счёт: края
   пласта нарочно заходят под рёбра на 1,5 мм) */
const SHEETS = (md.sheets || []).map(sh => {
  const i = skel.bones.findIndex(b => b.name === sh.bone[0] && (b.side || '') === (sh.bone[1] || '')), m = Muscles.sheetMesh(sh);
  return { sh, i, pos: m.pos, n: m.n };
});
/* Пласт лежит на уровне рёбер — строже, чем трубки: тело пласта не выходит из кожи вовсе (во всех позах каталога —
   глубже 7,9 мм под кожей; до формы груди 4.41.0 — 3,7 мм) и не глубже 0,8 см в чужих костях. Единственная чужая кость рядом — ключица: в нейтральной
   стойке и в части поз (тяга лёжа на столе, «Y-T-W» лёжа) она ложится на рёбра 1–3 спереди — сами рёбра у манекена заходят
   в неё до 0,46 см, пласт в щели между ними — до 0,66 см; там он закрыт ключицей и не виден. */
const SHEET_LIMIT = { body: 0, bone: .8 }, SHEET_PARTS = new Set(SHEETS.map(S => S.sh.part));
function sheetCheck(S, m, pose, sdf, R) {
  const o = S.i * 12, w = new Float64Array(S.n * 3);
  for (let v = 0; v < S.n; v++) for (let r = 0; r < 3; r++) w[v * 3 + r] = m[o + r * 4] * S.pos[v * 3] + m[o + r * 4 + 1] * S.pos[v * 3 + 1] + m[o + r * 4 + 2] * S.pos[v * 3 + 2] + m[o + r * 4 + 3];
  const out = G.skinOutPoints(sdf, w, R, S.n);
  let depth = 0, deepAt = '';
  for (let v = 0; v < S.n; v++) {
    const p = [w[v * 3], w[v * 3 + 1], w[v * 3 + 2]];
    for (let bi = 0; bi < pbs.length; bi++) {
      if (bi === S.i) continue;
      const b = pose[bi]; if (p[0] < b.lo[0] || p[0] > b.hi[0] || p[1] < b.lo[1] || p[1] > b.hi[1] || p[2] < b.lo[2] || p[2] > b.hi[2]) continue;
      const q = b.inv(p); if (G.insideBone(pbs[bi], q)) { const d = pbs[bi].near(q); if (d > depth) { depth = d; deepAt = pbs[bi].name + (pbs[bi].side || ''); } }
    }
  }
  return { out: out.out, depth, deepAt };
}

/* Стенки (этап Б: прямая, наружная и внутренняя косые живота, передняя зубчатая, малая грудная — Muscles.wallSurface,
   README, «Стенки»): тело — пласт на рёбрах и под кожей, строже трубок и лент. Пути этих мышц (линии действия MyoBack и DAS3)
   на 40–90 % лежат внутри грудной клетки — их глубина в костях проверяется, как у всех путей (--max-bone), а тело стенки:
   - снаружи рёбер: вершин глубже 3 мм под оболочкой рёбер (наружная поверхность рёбер и межрёберных, мелкая сетка
     walls.js) — не больше 0,1 % по семейству, глубже 6 мм — ни одной (по каталогу: 0 % и 0,26 см; тела-трубки до
     этапа Б — 39–87 % и 3,6–8,2 см);
   - над кожей — не выше 0,5 см (по каталогу — до 0,35; трубки и ленты — до 2,6);
   - в чужих костях (кроме грудной клетки — на ней пласт лежит) — не глубже 0,8 см, как межрёберные пласты. */
const WB = require('./walls.js'), WRIB = skel.bones.findIndex(b => b.name === 'ribcage');
const WALL_PARTS = new Set((bound.walls || []).map(w => w.key));
const WSH = WALL_PARTS.size ? (() => { const C = WB.context(M, Skeleton, Muscles, skel); return { R: WB.ribShell(C, 'R'), L: WB.ribShell(C, 'L') }; })() : null;
const WALL_LIMIT = { body: .5, rib: .3, ribShare: .001, ribMax: .6, bone: .8 };
/* тело стенки кадра (вершины мышцы i в SURF): доля и глубина в грудной клетке, глубина в чужих костях */
function wallCheck(i, m, pose, f, at) {
  const mu = bound[i], S = WSH[mu.side === 'L' ? 'L' : 'R'], o = WRIB * 12;
  for (let v = START[i] * Muscles.SIDES; v < START[i + 1] * Muscles.SIDES; v++) {
    const p = [SURF[v * 3], SURF[v * 3 + 1], SURF[v * 3 + 2]], d = [0, 1, 2].map(r => p[r] - m[o + r * 4 + 3]);
    const ch = WB.chartOf(S, [0, 1, 2].map(c => m[o + c] * d[0] + m[o + 4 + c] * d[1] + m[o + 8 + c] * d[2]));
    if (ch.th >= 0 && ch.th <= 180) {
      const rs = WB.shellFine(S, ch.th, ch.y);
      if (rs > 0) { f.ribN++; const dd = rs - ch.r; if (dd > WALL_LIMIT.rib) f.ribDeep++; if (dd > f.rib) { f.rib = dd; f.ribAt = `${at} ${mu.name}`; } }
    }
    for (let bi = 0; bi < pbs.length; bi++) {
      if (bi === WRIB) continue;
      const b = pose[bi]; if (p[0] < b.lo[0] || p[0] > b.hi[0] || p[1] < b.lo[1] || p[1] > b.hi[1] || p[2] < b.lo[2] || p[2] > b.hi[2]) continue;
      const q = b.inv(p); if (G.insideBone(pbs[bi], q)) { const dd = pbs[bi].near(q); if (dd > f.wbone) { f.wbone = dd; f.wboneAt = `${at} ${mu.name} в ${pbs[bi].name}${pbs[bi].side || ''}`; } }
    }
  }
}

/* Известные исключения (tools/muscles/README.md, «Кожа»). С 4.28.0 кожа поднимается над складками подмышки
   (Mannequin.FOLDS): линии всех мышц — в допуске. Подъём ограничен замерами стоящей фигуры (ANSUR II: ширина груди
   не растёт) — полностью тела мышц складки не прячут: при руке над головой или далеко в сторону тело широчайшей выходит
   из кожи сбоку груди до 3,1 см (линии MoBL-ARMS идут от рёбер к плечу по воздуху, тело — трубка, а не пласт). Задняя
   часть дельтовидной (с 4.36.0 — 29 % объёма мышцы по препаратам вместо 10 % у MoBL-ARMS, три трубки вдоль ости
   лопатки вместо пласта) при руке над головой и в разведении — до 2,7 см: у «шапки» плеча.
   4.41.0 (форма груди по ANSUR II, третья складка и подгонка складок по всем линиям мышц): широчайшая 3,8 → 3,1,
   задняя дельта 3,1 → 2,7; сняты исключения большой грудной (3,3 → 2,4: верх груди под ключицами полнее) и прямой
   мышцы живота в предельном скручивании (3,1 → 2,4: живот над пупком глубже).
   Ленты (Muscles.ribbon): широкие плоские мышцы — пласт между соседними линиями толщиной по объёму, а не трубки; тело
   широчайшей — до 2,1 см над кожей (было 3,1): исключение снято.
   Колпак дельтовидной (Muscles.capSurface, README, «Колпак дельтовидной»): пять частей — один пласт над головкой плеча,
   толщина откладывается от головки и диафиза, а не от линии действия; тело задней части — до 2,0 см над кожей (было 2,7):
   исключение снято, исключений нет. */
const EXCEPT = { skin: {}, body: {} };

/* только пласты (быстро — для тестов): по каждому пласту худший выход из кожи и глубина в чужих костях по позам */
function sheetRun(ids, ts, sheets = SHEETS) {
  const out = {};
  for (const id of ids) {
    const rig = EQ.rig(POSES[id]);
    for (const t of ts) {
      const R = rig(t), m = Skeleton.frames(R, M.bodyData(R), skel.bones), sdf = G.skinSDF(R), pose = G.poseBones(pbs, m);
      for (const S of sheets) {
        const c = sheetCheck(S, m, pose, sdf, R), o = out[S.sh.name] || (out[S.sh.name] = { skin: -Infinity, skinAt: '', bone: 0, boneAt: '' });
        if (c.out > o.skin) { o.skin = c.out; o.skinAt = `${id} t=${t}`; }
        if (c.depth > o.bone) { o.bone = c.depth; o.boneAt = `${id} t=${t} в ${c.deepAt}`; }
      }
    }
  }
  return out;
}
function run(ids, ts) {
  const list = (ids || Object.keys(POSES)).filter(k => !k.startsWith('_') && POSES[k]);
  const fam = {}, byEx = {};
  for (const id of list) {
    const rig = EQ.rig(POSES[id]);
    for (const t of ts) {
      const R = rig(t), body = M.bodyData(R), m = Skeleton.frames(R, body, skel.bones), sdf = G.skinSDF(R);
      const paths = Muscles.layout(bound, m, .5), drawn = Muscles.layoutDrawn(bound, m, 1.5), pose = G.poseBones(pbs, m);
      Muscles.surfaceAll(bound, drawn, m, SURF, null, START);
      paths.forEach((p, i) => {
        const mu = bound[i], b = G.boneRun(pbs, m, p.points, 1.5, .5, pose), s = G.skinOut(sdf, p.points, R);
        /* тело мышцы (этап М2): вершины поверхности — те же, что рисует приложение */
        const v = G.skinOutPoints(sdf, SURF.subarray(START[i] * Muscles.SIDES * 3, START[i + 1] * Muscles.SIDES * 3), R);
        const f = fam[mu.part] || (fam[mu.part] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', body: -Infinity, bodyAt: '', n: 0 });
        if (mu.wall && WSH) { if (!('ribN' in f)) Object.assign(f, { ribN: 0, ribDeep: 0, rib: 0, ribAt: '', wbone: 0, wboneAt: '' }); wallCheck(i, m, pose, f, `${id} t=${t}`); }
        if (b.depth > f.bone) { f.bone = b.depth; f.boneAt = `${id} t=${t} ${mu.name} в ${b.deepAt}`; }
        if (s > f.skin) { f.skin = s; f.skinAt = `${id} t=${t} ${mu.name}`; }
        if (v.out > f.body) { f.body = v.out; f.bodyAt = `${id} t=${t} ${mu.name}`; }
        const e = byEx[id] || (byEx[id] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', body: -Infinity, bodyAt: '' });
        if (v.out > e.body) { e.body = v.out; e.bodyAt = `${mu.name} t=${t}`; }
        if (b.depth > e.bone) { e.bone = b.depth; e.boneAt = `${mu.name} t=${t} в ${b.deepAt}`; }
        if (s > e.skin) { e.skin = s; e.skinAt = `${mu.name} t=${t}`; }
      });
      for (const S of SHEETS) {
        const c = sheetCheck(S, m, pose, sdf, R), sh = S.sh;
        const f = fam[sh.part] || (fam[sh.part] = { bone: 0, boneAt: '', skin: -Infinity, skinAt: '', body: -Infinity, bodyAt: '', n: 0 });
        if (c.depth > f.bone) { f.bone = c.depth; f.boneAt = `${id} t=${t} ${sh.name} в ${c.deepAt}`; }
        if (c.out > f.body) { f.body = c.out; f.bodyAt = `${id} t=${t} ${sh.name}`; }
        const e = byEx[id];
        if (c.out > e.body) { e.body = c.out; e.bodyAt = `${sh.name} t=${t}`; }
        if (c.depth > e.bone) { e.bone = c.depth; e.boneAt = `${sh.name} t=${t} в ${c.deepAt}`; }
      }
    }
  }
  return { fam, byEx, n: list.length };
}
/* сведение результатов потоков: по семействам — худшее */
function merge(parts) {
  const fam = {}, byEx = {}; let n = 0;
  for (const r of parts) {
    n += r.n; Object.assign(byEx, r.byEx);
    for (const [k, f] of Object.entries(r.fam)) {
      if (!fam[k]) { fam[k] = { ...f }; continue; }
      const g = fam[k];
      if (f.bone > g.bone) { g.bone = f.bone; g.boneAt = f.boneAt; }
      if (f.skin > g.skin) { g.skin = f.skin; g.skinAt = f.skinAt; }
      if (f.body > g.body) { g.body = f.body; g.bodyAt = f.bodyAt; }
      /* стенки: вершины у рёбер — сумма по потокам, глубины — худшие */
      if ('ribN' in f) {
        if (!('ribN' in g)) Object.assign(g, { ribN: 0, ribDeep: 0, rib: 0, ribAt: '', wbone: 0, wboneAt: '' });
        g.ribN += f.ribN; g.ribDeep += f.ribDeep;
        if (f.rib > g.rib) { g.rib = f.rib; g.ribAt = f.ribAt; }
        if (f.wbone > g.wbone) { g.wbone = f.wbone; g.wboneAt = f.wboneAt; }
      }
    }
  }
  return { fam, byEx, n };
}
async function runParallel(ids, ts, threads = Math.max(1, Math.min(4, os.cpus().length))) {
  const list = (ids || Object.keys(POSES)).filter(k => !k.startsWith('_') && POSES[k]);
  const chunks = Array.from({ length: Math.min(threads, list.length) }, (_, i) => list.filter((_, j) => j % threads === i));
  if (chunks.length < 2) return run(list, ts);
  return merge(await Promise.all(chunks.map(c => new Promise((ok, fail) => {
    const w = new Worker(__filename, { workerData: { ids: c, ts } }); w.once('message', ok); w.once('error', fail);
  }))));
}
module.exports = { run, runParallel, sheetRun, EXCEPT, SHEETS, SHEET_LIMIT, WALL_LIMIT };

if (!isMainThread) parentPort.postMessage(run(workerData.ids, workerData.ts));
else if (require.main === module) (async () => {
  const ids = args[0] && args[0] !== 'all' ? args[0].split(',') : null;
  const ts = (args[1] && !args[1].startsWith('--') ? args[1] : '0,0.5,1').split(',').map(Number);
  const t0 = Date.now(), { fam, byEx, n } = await runParallel(ids, ts);
  const rows = Object.entries(fam).sort((a, b) => Math.max(b[1].bone, b[1].skin, b[1].body) - Math.max(a[1].bone, a[1].skin, a[1].body));
  for (const [k, f] of rows) console.log(`${k.padEnd(9)} ${(md.parts[k] || '').padEnd(40)} кость ${f.bone.toFixed(2).padStart(5)}  кожа ${f.skin.toFixed(2).padStart(5)}  тело ${f.body.toFixed(2).padStart(5)}   ${f.bone > .8 ? f.boneAt : ''} ${f.skin > 1 ? '| кожа: ' + f.skinAt : ''} ${f.body > 1 ? '| тело: ' + f.bodyAt : ''}`);
  for (const [k, f] of rows) if ('ribN' in f) console.log(`стенка ${k.padEnd(8)} в грудной клетке глубже ${WALL_LIMIT.rib * 10} мм — ${(100 * f.ribDeep / Math.max(1, f.ribN)).toFixed(3)} % вершин у рёбер, наибольшая глубина ${f.rib.toFixed(2)} см (${f.ribAt}); тело над кожей ${f.body.toFixed(2)} см; в чужих костях ${f.wbone.toFixed(2)} см ${f.wboneAt}`);
  console.log(`\n${n} упражнений × ${ts.length} поз, ${((Date.now() - t0) / 1000).toFixed(0)} с`);
  if (flag('--json')) { const f = path.resolve(root, flag('--json')); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify({ fam, byEx }, null, 1)); }
  const maxBone = flag('--max-bone') != null ? +flag('--max-bone') : null, maxSkin = flag('--max-skin') != null ? +flag('--max-skin') : null;
  const maxBody = flag('--max-body') != null ? +flag('--max-body') : null;
  const bad = [];
  for (const [k, f] of rows) {
    if (maxBone != null && f.bone > maxBone) bad.push(`${k}: в кости на ${f.bone.toFixed(1)} см (${f.boneAt})`);
    const sheet = SHEET_PARTS.has(k), lim = EXCEPT.skin[k] ?? maxSkin, limBody = sheet && maxBody != null ? Math.min(maxBody, SHEET_LIMIT.body) : EXCEPT.body[k] ?? maxBody;
    if (sheet && maxBone != null && f.bone > SHEET_LIMIT.bone) bad.push(`${k}: пласт в чужой кости на ${f.bone.toFixed(2)} см (${f.boneAt})`);
    if (lim != null && f.skin > lim) bad.push(`${k}: над кожей на ${f.skin.toFixed(1)} см (${f.skinAt})`);
    if (limBody != null && f.body > limBody) bad.push(`${k}: тело над кожей на ${f.body.toFixed(1)} см (${f.bodyAt})`);
    if (WALL_PARTS.has(k) && 'ribN' in f && (maxBone != null || maxBody != null)) {
      if (f.ribDeep > WALL_LIMIT.ribShare * f.ribN) bad.push(`${k}: ${(100 * f.ribDeep / f.ribN).toFixed(2)} % вершин стенки глубже ${WALL_LIMIT.rib * 10} мм в грудной клетке`);
      if (f.rib > WALL_LIMIT.ribMax) bad.push(`${k}: стенка в грудной клетке на ${f.rib.toFixed(2)} см (${f.ribAt})`);
      if (f.body > WALL_LIMIT.body) bad.push(`${k}: стенка над кожей на ${f.body.toFixed(2)} см (${f.bodyAt})`);
      if (f.wbone > WALL_LIMIT.bone) bad.push(`${k}: стенка в чужой кости на ${f.wbone.toFixed(2)} см (${f.wboneAt})`);
    }
  }
  if (bad.length) { console.error('\nМышцы вне допусков:\n' + bad.join('\n')); process.exit(1); }
  if (maxBone != null || maxSkin != null) console.log(`Мышцы в допусках: путь в кости не глубже ${maxBone} см и над кожей не выше ${maxSkin} см, тело мышцы над кожей не выше ${maxBody} см (исключения — EXCEPT); пласты (межрёберные) — под кожей, в чужих костях не глубже ${SHEET_LIMIT.bone} см; стенки — снаружи рёбер (глубже ${WALL_LIMIT.rib * 10} мм — не больше ${WALL_LIMIT.ribShare * 100} % вершин, не глубже ${WALL_LIMIT.ribMax} см), над кожей не выше ${WALL_LIMIT.body} см, в чужих костях не глубже ${WALL_LIMIT.bone} см.`);
})();
