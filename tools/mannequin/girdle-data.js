'use strict';
/* Данные плечевого пояса манекена (Mannequin.GIRDLE, Mannequin.RIB_ENV в src/js/09bm-mannequin.js) — из костей
   src/data/skeleton.bin (MyoSim, перенесённые на манекен tools/skeleton): node tools/mannequin/girdle-data.js [--json]
   печатает константы; tools/mannequin.test.js сверяет их с костями.

   Ориентиры правой лопатки и ключицы — в рамке ключицы покоя (начало — грудино-ключичный сустав, оси грудной клетки), см:
   - ac — акромиально-ключичный сустав (конец ключицы, её точка у лопатки — «clavphant» MoBL);
   - aa — акромиальный угол: задне-латеральная вершина акромиона (у ac в пределах 5 см — наибольшее «латерально + назад»);
   - ts — trigonum spinae, медиальный конец ости: вершина медиального края на продолжении гребня ости (прямая по 20 %
     самых задних вершин латеральнее ts);
   - ai — нижний угол (самая нижняя вершина);
   ISB (Wu et al., 2005): оси лопатки — по ts, ai, aa; ключицы — грудино-ключичный → ac.
   front — передняя (рёберная) поверхность тела лопатки: вершины с нормалью к рёбрам (cos ≥ 0,35 с нормалью плоскости
   вперёд) дальше 3,5 см от центра плечевого сустава и ac и медиальнее акромиона на 2,5 см; 40 точек, равномерно (выбор
   самых удалённых друг от друга).
   Оболочка рёбер — наибольший радиус вершин грудной клетки от оси (x = 0, z = zc; zc — средняя глубина вершин) по слою
   1 см и сектору 5° (как оболочка у стенок мышц), обе стороны — общей таблицей (наибольшее из левой и правой):
   строки — высота y0…y1 (рамка грудной клетки), столбцы — сектор a0…a1 (сектор k — азимут 5k° от передней линии,
   36 — прямо назад), миллиметры; 0 — рёбер нет. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const SK = require(path.join(root, 'src/js/09bq-skeleton.js'));
const SC = [-2, 28.5, 4];
const Y0 = 2, Y1 = 36, A0 = 6, A1 = 36;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = a => Math.hypot(a[0], a[1], a[2]), unit = a => { const l = len(a); return [a[0] / l, a[1] / l, a[2] / l]; };
const r2 = v => Math.round(v * 100) / 100;
function girdleData(bones = SK.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin')))).bones) {
  const sc = bones.find(b => b.name === 'scapula' && b.side === 'R'), rib = bones.find(b => b.name === 'ribcage');
  const V = []; for (let i = 0; i < sc.pos.length; i += 3) V.push([sc.pos[i], sc.pos[i + 1], sc.pos[i + 2]]);
  const ac = sc.ac[0].slice(), gl = sc.gl[0].slice(), ai = sc.ia[0].slice();
  /* плоскость лопатки: нормаль назад, оси в плоскости — u латерально (у правой −x), v вверх */
  const c = V.reduce((a, p) => [a[0] + p[0] / V.length, a[1] + p[1] / V.length, a[2] + p[2] / V.length], [0, 0, 0]);
  let n = unit(sc.nrm[0]); if (n[2] > 0) n = n.map(x => -x);
  let v = sub([0, 1, 0], n.map(x => x * n[1])); v = unit(v); let u = cross(v, n); if (u[0] > 0) u = u.map(x => -x);
  const U = V.map(p => dot(sub(p, c), u)), Vv = V.map(p => dot(sub(p, c), v)), W = V.map(p => dot(sub(p, c), n));
  /* нормали вершин — по треугольникам, наружу */
  const N = V.map(() => [0, 0, 0]);
  for (let i = 0; i < sc.idx.length; i += 3) { const a = sc.idx[i], b = sc.idx[i + 1], d = sc.idx[i + 2], fn = cross(sub(V[b], V[a]), sub(V[d], V[a])); for (const k of [a, b, d]) for (let j = 0; j < 3; j++) N[k][j] += fn[j]; }
  const out = N.reduce((s, m, i) => s + dot(m, sub(V[i], c)), 0) < 0 ? -1 : 1;
  for (let i = 0; i < N.length; i++) N[i] = unit(N[i]).map(x => x * out);
  /* акромиальный угол */
  let aa = -1; V.forEach((p, i) => { if (len(sub(p, ac)) < 5 && (aa < 0 || U[i] + .8 * W[i] > U[aa] + .8 * W[aa])) aa = i; });
  /* гребень ости: 20 % самых задних вершин латеральнее… (прямая v = k·u + b по МНК) */
  const wq = W.slice().sort((a, b) => a - b)[Math.floor(.8 * W.length)];
  const band = V.map((_, i) => i).filter(i => W[i] > wq && U[i] < U[aa] - 1);
  const mu = band.reduce((s, i) => s + U[i], 0) / band.length, mv = band.reduce((s, i) => s + Vv[i], 0) / band.length;
  const k = band.reduce((s, i) => s + (U[i] - mu) * (Vv[i] - mv), 0) / band.reduce((s, i) => s + (U[i] - mu) ** 2, 0), b0 = mv - k * mu;
  const uq = U.slice().sort((a, b) => a - b)[Math.floor(.12 * U.length)], umin = Math.min(...U);
  let ts = -1, best = Infinity; V.forEach((_, i) => { if (U[i] < uq) { const f = Math.abs(Vv[i] - (k * U[i] + b0)) + .3 * (U[i] - umin); if (f < best) { best = f; ts = i; } } });
  /* передняя поверхность тела лопатки */
  const fwd = n.map(x => -x), frontAll = V.filter((p, i) => len(sub(p, gl)) > 3.5 && len(sub(p, ac)) > 3.5 && U[i] < U[aa] - 2.5 && dot(N[i], fwd) > .35);
  const sel = [frontAll.reduce((m, p, i) => p[1] < frontAll[m][1] ? i : m, 0)];
  while (sel.length < 40) { let bi = -1, bd = -1; frontAll.forEach((p, i) => { const d = Math.min(...sel.map(j => len(sub(p, frontAll[j])))); if (d > bd) { bd = d; bi = i; } }); sel.push(bi); }
  /* оболочка рёбер */
  let zc = 0; for (let i = 2; i < rib.pos.length; i += 3) zc += rib.pos[i]; zc /= rib.pos.length / 3;
  const ny = Y1 - Y0 + 1, na = A1 - A0 + 1, env = new Array(ny * na).fill(0);
  for (let i = 0; i < rib.pos.length; i += 3) {
    const x = rib.pos[i], y = Math.round(rib.pos[i + 1]), z = rib.pos[i + 2] - zc, a = Math.abs(Math.round(Math.atan2(x, z) * 36 / Math.PI));
    if (y < Y0 || y > Y1 || a < A0 || a > A1) continue;
    const j = (y - Y0) * na + (a - A0), r = Math.round(Math.hypot(x, z) * 10); if (r > env[j]) env[j] = r;
  }
  return {
    GIRDLE: { ac: ac.map(r2), ts: V[ts].map(r2), ai: ai.map(r2), aa: V[aa].map(r2), front: sel.map(i => frontAll[i].map(r2)) },
    RIB_ENV: { zc: r2(zc), y0: Y0, y1: Y1, a0: A0, a1: A1, mm: env.join(' ') }
  };
}
module.exports = { girdleData };
if (require.main === module) {
  const d = girdleData();
  if (process.argv.includes('--json')) console.log(JSON.stringify(d));
  else {
    const G = d.GIRDLE, s = p => '[' + p.join(',') + ']';
    console.log(`const GIRDLE={ac:${s(G.ac)},ts:${s(G.ts)},ai:${s(G.ai)},aa:${s(G.aa)},\n front:[${G.front.map(s).join(',')}]};`);
    console.log(`const RIB_ENV={zc:${d.RIB_ENV.zc},y0:${d.RIB_ENV.y0},y1:${d.RIB_ENV.y1},a0:${d.RIB_ENV.a0},a1:${d.RIB_ENV.a1},mm:'${d.RIB_ENV.mm}'};`);
  }
}
