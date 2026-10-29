'use strict';
/* Подбор профиля кулачка рычажного тренажёра по кривой «угол — момент» сустава (только сборка, в приложение не попадает).
   Профиль задаётся опорной функцией h(ψ) — плечом троса, когда нормаль к профилю в точке схода смотрит под углом ψ в рамке
   рычага. У выпуклого профиля радиус кривизны ρ = h + h″ ≥ 0; берём ρ постоянным на K равных отрезках ψ и не меньше ρmin
   (трос не изгибается круче, чем на самом малом блоке, Ø9 см): h(ψ) = a·cos(ψ−ψa) + b·sin(ψ−ψa) + Σ ρ_k·G_k(ψ) — линейна
   по (a, b, ρ), профиль — цепочка дуг с общими касательными. Неизвестные подбираются неотрицательными наименьшими
   квадратами (Lawson–Hanson): плечо в точке схода на каждом кадре повтора = масштаб × кривая силы; ρ_k − ρmin ≥ 0;
   h ≥ hmin на всём профиле (трос не касается ступицы); сглаживание соседних ρ. Угол точки схода зависит от самого профиля
   (касательная к первому блоку на конечном расстоянии), поэтому подбор повторяется: профиль → точки схода по общей геометрии
   узла (GymEquipment.leverStack.state, как в приложении) → профиль, пока углы не перестанут меняться.
   Ограничение физики: в точке пика плеча p″ ≥ ρmin − p (радианы), т. е. момент не может спадать от пика быстрее, чем
   (p − ρmin)·cos Δφ + ρmin. Острый пик кривой силы выпуклым кулачком с прямым тросом не воспроизводится — подбор находит
   ближайшую допустимую кривую, отклонение печатается (tools/lever-stacks.test.js, cable-audit.js). */
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const LS = EQ.leverStack, D2R = Math.PI / 180;

/* Lawson–Hanson NNLS: min ‖Ax − b‖, x ≥ 0 */
function nnls(A, b, maxIt = 3 * A[0].length) {
  const m = A.length, n = A[0].length, x = new Array(n).fill(0), P = new Set();
  const resid = () => b.map((bi, i) => { let s = bi; for (let j = 0; j < n; j++) s -= A[i][j] * x[j]; return s; });
  const grad = () => { const r = resid(), g = new Array(n).fill(0); for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) g[j] += A[i][j] * r[i]; return g; };
  const lsq = idx => {
    const k = idx.length, N = Array.from({ length: k }, () => new Array(k).fill(0)), v = new Array(k).fill(0);
    for (let i = 0; i < m; i++) for (let a = 0; a < k; a++) { const ia = A[i][idx[a]]; if (!ia) continue; v[a] += ia * b[i]; for (let c = 0; c < k; c++) N[a][c] += ia * A[i][idx[c]]; }
    for (let a = 0; a < k; a++) N[a][a] += 1e-10;
    for (let c = 0; c < k; c++) {
      let p = c; for (let r = c + 1; r < k; r++) if (Math.abs(N[r][c]) > Math.abs(N[p][c])) p = r;
      [N[c], N[p]] = [N[p], N[c]]; [v[c], v[p]] = [v[p], v[c]];
      for (let r = 0; r < k; r++) if (r !== c) { const f = N[r][c] / N[c][c]; if (!f) continue; for (let q = c; q < k; q++) N[r][q] -= f * N[c][q]; v[r] -= f * v[c]; }
    }
    return v.map((vi, a) => vi / N[a][a]);
  };
  for (let it = 0; it < maxIt; it++) {
    const w = grad(); let j = -1, best = 1e-9;
    for (let q = 0; q < n; q++) if (!P.has(q) && w[q] > best) { best = w[q]; j = q; }
    if (j < 0) break;
    P.add(j);
    for (let guard = 0; guard < 4 * n; guard++) {
      const idx = [...P], z = lsq(idx);
      if (z.every(v => v > 0)) { idx.forEach((q, a) => { x[q] = z[a]; }); break; }
      let al = Infinity; idx.forEach((q, a) => { if (z[a] <= 0) al = Math.min(al, x[q] / (x[q] - z[a])); });
      idx.forEach((q, a) => { x[q] += al * (z[a] - x[q]); if (x[q] < 1e-12) { x[q] = 0; P.delete(q); } });
    }
  }
  return x;
}
/* строка базиса h(ψ): [cos(ψ−ψa), sin(ψ−ψa), G_1..G_K], G_k = ∫ по отрезку k (до ψ) sin(ψ−u) du */
function basisRow(ps, psa, w, K) {
  const row = [Math.cos(ps - psa), Math.sin(ps - psa)];
  for (let k = 0; k < K; k++) { const u0 = psa + k * w, u1 = Math.min(psa + (k + 1) * w, ps); row.push(u1 <= u0 ? 0 : Math.cos(ps - u1) - Math.cos(ps - u0)); }
  return row;
}
/* опорная функция → цепочка дуг: контакт в начале x0 = h·n + h′·t, дальше центр дуги C_k = x − ρ_k·n, конец — C_k + ρ_k·n */
function arcsFrom({ psa, w, K, a, b, rho }) {
  const n = ps => [Math.cos(ps), Math.sin(ps)], t = ps => [-Math.sin(ps), Math.cos(ps)], r4 = v => Math.round(v * 1e4) / 1e4, r6 = v => Math.round(v * 1e6) / 1e6;
  let x = [a * n(psa)[0] + b * t(psa)[0], a * n(psa)[1] + b * t(psa)[1]];
  const arcs = [];
  for (let k = 0; k < K; k++) {
    const a0 = psa + k * w, a1 = a0 + w, c = [x[0] - rho[k] * n(a0)[0], x[1] - rho[k] * n(a0)[1]];
    arcs.push({ c: c.map(r4), r: r4(rho[k]), a0: r6(a0), a1: r6(a1) });
    x = [c[0] + rho[k] * n(a1)[0], c[1] + rho[k] * n(a1)[1]];
  }
  return arcs;
}
const CURVES = require('./strength-curves.js');
const kneeOf = R => { const a = M.jointAngles(R); return (a.L.knee + a.R.knee) / 2; };
/* e — привод без кулачка (pivot, axis, bind, plane, route); poses — кадры повторения (bakedPoses); curve — кривая
   силы (strength-curves.js; угол главного сустава кривой — curve.joint, CURVES.angleOf); sense — направление огибания
   кулачка; scale — плечо на пике целевой кривой, см. */
function design(e, poses, { curve, sense, scale, rhoMin = 4.5, hMin = 5, K = 16, margin = 32 * D2R, anchorMargin = 24 * D2R, lam = .2, wHub = 30, iters = 20 }) {
  const knees = poses.map(R => CURVES.angleOf(curve, R)), fmax = Math.max(...knees.map(curve.f)), y = knees.map(th => scale * curve.f(th) / fmax);
  const at = (cam, R) => LS.driveState({ ...e, kind: 'cam', cam }, R);
  /* начальный профиль — круг радиуса scale вокруг оси */
  let cam = { arcs: [{ c: [0, 0], r: scale, a0: -4 * Math.PI, a1: 4 * Math.PI }], anchor: 0, sense }, ps = poses.map(R => at(cam, R).psi), par;
  for (let it = 0; it < iters; it++) {
    const psa = Math.min(...ps) - margin, psb = Math.max(...ps) + margin, w = (psb - psa) / K;
    /* h ≥ hmin там, где трос лежит на кулачке: от зажима до точки схода в конце повтора (за концом хода трос кулачка не
       касается — там контур замыкает ступица) */
    const dir0 = Math.sign(ps[ps.length - 1] - ps[0]) || 1, anc = ps[0] - dir0 * anchorMargin, h0 = Math.min(anc, ...ps) - 3 * D2R, h1 = Math.max(anc, ...ps) + 3 * D2R;
    const hubPs = []; for (let a = h0; a <= h1 + 1e-9; a += 3 * D2R) hubPs.push(a);
    const nv = 4 + K + hubPs.length, rows = [], rhs = [];
    const put = (row, scaleRow, slack, target) => {
      const r = new Array(nv).fill(0);
      r[0] = row[0] * scaleRow; r[1] = -row[0] * scaleRow; r[2] = row[1] * scaleRow; r[3] = -row[1] * scaleRow;
      let g = 0; for (let k = 0; k < K; k++) { r[4 + k] = row[2 + k] * scaleRow; g += row[2 + k]; }
      if (slack != null) r[4 + K + slack] = -scaleRow;
      rows.push(r); rhs.push((target - rhoMin * g) * scaleRow);
    };
    ps.forEach((p, i) => put(basisRow(p, psa, w, K), 1, null, y[i]));
    hubPs.forEach((p, j) => put(basisRow(p, psa, w, K), wHub, j, hMin));
    for (let k = 0; k + 1 < K; k++) { const r = new Array(nv).fill(0); r[4 + k] = -lam; r[5 + k] = lam; rows.push(r); rhs.push(0); }
    const x = nnls(rows, rhs);
    par = { psa, w, K, a: x[0] - x[1], b: x[2] - x[3], rho: x.slice(4, 4 + K).map(q => q + rhoMin) };
    const arcs = arcsFrom(par), dir = Math.sign(ps[ps.length - 1] - ps[0]) || 1;
    cam = { arcs, anchor: Math.round((ps[0] - dir * anchorMargin) * 1e6) / 1e6, sense };
    const nps = poses.map(R => at(cam, R).psi), d = Math.max(...nps.map((p, i) => Math.abs(p - ps[i])));
    ps = nps; if (d < 1e-5) break;
  }
  /* отчёт: плечо и нормированный момент по кадрам */
  const S = poses.map(R => at(cam, R)), p = S.map(s => s.momentArm), pm = Math.max(...p), tn = knees.map(th => curve.f(th) / fmax);
  return { cam, rho: par.rho, knees, p, pn: p.map(v => v / pm), tn, viol: Math.max(...S.map(s => s.viol)), L: S.map(s => s.L) };
}
module.exports = { design, nnls, arcsFrom, kneeOf };
