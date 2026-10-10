'use strict';
/* Группа G4: силовые тренажёры, турник, брусья, гравитрон.
   Ось Z — вперёд от тела (куда смотрит лицо в исходной позе), X — влево, Y — вверх, см.
   Каждая раскладка тренажёра вычисляется от позы (once): оси рычагов — через оси нагружаемых суставов,
   направляющие — вдоль линии движения, подушки — по поверхности тела. */
const { ctx } = require('../compose.js');
const S = ['L', 'R'], C_SIGN = { L: 1, R: -1 };
const once = f => { let v; return () => v ?? (v = f()); };
const D2R = Math.PI / 180;
const V3 = (p, d, k) => [p[0] + d[0] * k, p[1] + d[1] * k, p[2] + d[2] * k];
const dirA = deg => [0, Math.sin(deg * D2R), Math.cos(deg * D2R)]; /* направление в плоскости YZ: 0° — вперёд (+Z), 90° — вверх */

/* ================= Разгибание ног ================= */
const LX = once(() => {
  const C = ctx([]), { V } = C, q = C.base(), lean = 12;
  const up = [0, Math.cos(lean * D2R), -Math.sin(lean * D2R)], nb = [0, Math.sin(lean * D2R), Math.cos(lean * D2R)];
  C.root(q, [0, 62, 0], up, nb);
  q.lumbar = [3, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-4, 0, 0];
  for (const s of S) { q[s].hip = [90 - lean, 0, 0]; q[s].knee = 85; q[s].ankle = [4, 0]; }
  const seatH = 50, backZ = -24;
  for (let i = 0; i < 3; i++) { C.restOn(q, 'buttocks', [0, seatH, 0], [0, 1, 0], -1.3); C.restOn(q, 'back', [0, seatH, backZ], nb, -1.0); }
  const f = C.fk(q), K = V.mix(f.P.knL, f.P.knR, .5);
  /* валик — на нижней трети голеней спереди: 9 см над голеностопом, 7,4 см перед осью голени */
  const off = [0, 9, 7.4], rR = Math.hypot(C.M.B.sk - off[1], off[2]);
  const hubX = 27;
  const machine = { type: 'legExtension', id: 'lx', seatH, seatZ: [backZ - 4, K[2] - 9], back: { z0: backZ - 1.5, ang: lean, len: 60 }, pivot: [K[1], K[2]], hubX, handle: { x: 23, y: seatH + 3, z: f.P.hipL[2] - 2 } };
  return { q, K, off, rR, hubX, machine, f };
});

/* ================= Сгибание ног лёжа ================= */
/* Лёжа на животе головой к +Z. Бедренная подушка поднимается к тазу на α, грудная опускается к голове на β:
   тазобедренные согнуты на α+β, поясница не переразгибается. Ось рычага — через центры коленных суставов. */
const LC = once(() => {
  const C = ctx([]), { V } = C, q = C.base(), al = 8, be = 16;
  const up = [0, -Math.sin(be * D2R), Math.cos(be * D2R)], nT = [0, Math.cos(be * D2R), Math.sin(be * D2R)];
  C.root(q, [0, 74, 0], up, V.scale(nT, -1));
  q.lumbar = [2, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [-22, 0, 0];
  for (const s of S) { q[s].hip = [al + be, 0, 0]; q[s].knee = 6; q[s].ankle = [6, 0]; }
  const f = C.fk(q), K = V.mix(f.P.knL, f.P.knR, .5);
  const nTh = [0, Math.cos(al * D2R), -Math.sin(al * D2R)];
  const low = (name, n) => Math.min(...C.region(q, name).map(p => V.dot(p, n)));
  const oTh = Math.min(low('thL', nTh), low('thR', nTh)) + 1.2, oT = low('chest', nT) + 1.2;
  /* линия излома: пересечение плоскостей подушек (в плоскости YZ) */
  const det = nTh[1] * nT[2] - nTh[2] * nT[1], hy = (oTh * nT[2] - nTh[2] * oT) / det, hz = (nTh[1] * oT - oTh * nT[1]) / det;
  const onTh = z => (oTh - nTh[2] * z) / nTh[1], onT = z => (oT - nT[2] * z) / nT[1];
  const kz = K[2] + 4, headZ = f.P.ghL[2] + 2;
  const hubX = 27;
  const machine = { type: 'legCurl', id: 'lc', hump: [hy, hz], knee: [onTh(kz), kz], head: [onT(headZ), headZ], nTh: nTh.slice(1), nT: nT.slice(1), pivot: [K[1], K[2]], hubX,
    handle: { x: 20, y: f.P.ghL[1] - 40, z: f.P.ghL[2] + 20, ax: [1, .5] } };
  const off = [0, 7, -8.2], rR = Math.hypot(C.M.B.sk - off[1], off[2]);
  return { q, K, off, rR, hubX, machine };
});

/* ================= Гиперэкстензия 45° ================= */
/* t=0 — тело прямой линией под 45°, t=1 — наклон через тазобедренные суставы. Ноги неподвижны: таз вращается
   вокруг оси тазобедренных суставов, стопы и голени возвращаются на место обратной кинематикой. */
const HY = once(() => {
  const C = ctx([]), { V, M } = C, q = C.base(), a = 45 * D2R;
  const d = [0, Math.sin(a), Math.cos(a)], n = [0, -Math.cos(a), Math.sin(a)];
  C.root(q, [0, 100, 0], d, n);
  q.neck = [-6, 0, 0];
  for (const s of S) { q[s].hip = [0, 3, 0]; q[s].knee = 6; q[s].ankle = [4, 0]; }
  const f = C.fk(q), H = [0, 100, 0];
  const U = p => V.dot(V.sub(p, H), d), W = p => V.dot(V.sub(p, H), n);
  /* площадка для стоп — по плоскости подошв */
  const soles = S.flatMap(s => M.solePoints(f, s).map(o => o.p)), pn = C.M.M3.col(f.F.footL.R, 1);
  const off = Math.min(...soles.map(p => V.dot(p, pn)));
  const solesC = V.mix(V.mix(f.P.heelL, f.P.heelR, .5), V.mix(f.P.ballL, f.P.ballR, .5), .5);
  const plateC = V.add(solesC, pn, off - V.dot(solesC, pn));
  /* валики: на 9 см выше голеностопа, сзади голени */
  const an = V.mix(f.P.anL, f.P.anR, .5), rollU = U(an) + 10;
  const shinPts = ['skL', 'skR'].flatMap(k => C.region(q, k)).filter(p => Math.abs(U(p) - rollU) < 3);
  const rollV = Math.min(...shinPts.map(W)) - 5 + .8;
  /* упор: передняя поверхность бёдер от 7 до 30 см ниже оси тазобедренных */
  const thPts = ['thL', 'thR'].flatMap(k => C.region(q, k)).filter(p => U(p) < -6 && U(p) > -32);
  const padV = Math.max(...thPts.map(W)) - 1.0;
  const machine = { type: 'hyper45', id: 'hy', H: [100, 0], ang: 45, beamV: 36, uEnd: -46,
    plate: { c: plateC.slice(1), n: pn.slice(1), size: [44, 34] }, roll: { u: rollU, v: rollV, r: 5 }, pad: { u0: -7, u1: -31, v: padV, w: 42 } };
  return { q, f, H, d, n, machine, feet: S.map(s => ({ o: f.P['an' + s], R: f.F['foot' + s].R })) };
});

/* ================= Жим ногами 45° (и подъём на носки в нём) ================= */
/* Спинка 28° к горизонту, сиденье-«ковш» с подъёмом переднего края 18°. Платформа на 25° круче перпендикуляра
   к направляющим: внизу колени ~90°, голеностоп в норме, поясница прижата. Каретка с платформой следует за стопами. */
const LP = once(() => {
  const C = ctx([]), { V, M } = C, q = C.base(), be = 28 * D2R, si = 18 * D2R, g = -25 * D2R, h = 8, yr = 32;
  const H = [0, 50, 0], d = [0, Math.SQRT1_2, Math.SQRT1_2], nu = [0, Math.SQRT1_2, -Math.SQRT1_2];
  const up = [0, Math.sin(be), -Math.cos(be)], fw = [0, Math.cos(be), Math.sin(be)];
  C.root(q, H, up, fw);
  q.lumbar = [0, 0, 0]; q.thoracic = [0, 0, 0];
  for (const s of S) { q[s].hip = [80, 6, 6]; q[s].knee = 40; }
  const low = (name, n) => Math.min(...C.region(q, name).map(p => V.dot(p, n)));
  const nS = [0, Math.cos(si), -Math.sin(si)], oS = low('buttocks', nS) + 1.3, oB = low('back', fw) + 1.0;
  /* линия стыка сиденья и спинки */
  const det = nS[1] * fw[2] - nS[2] * fw[1], jy = (oS * fw[2] - nS[2] * oB) / det, jz = (nS[1] * oB - oS * fw[1]) / det;
  C.neckTo(q, 'headBack', [0, jy, jz], fw, -.6);
  /* платформа: нормаль pn (к телу), направление «вверх по платформе» pf */
  const pn = V.add(V.scale(d, -Math.cos(g)), nu, -Math.sin(g)), pf = V.add(V.scale(nu, Math.cos(g)), d, -Math.sin(g));
  const R0 = V.add(H, nu, -yr), loc = p => [p[0], V.dot(V.sub(p, R0), nu), V.dot(V.sub(p, R0), d)];
  const rail = { a: V.add(R0, d, -10).slice(1), b: V.add(R0, d, 186).slice(1) };
  const machine = { type: 'legPress45', id: 'lp', rx: 28, seat: { c: [jy + Math.cos(si) * 0 + Math.sin(si) * 21, jz + Math.cos(si) * 21], ang: 18, len: 40 },
    back: { c0: [jy, jz], ang: 28, len: 86 }, rail, handle: { x: 26, y: H[1] + 6, z: H[2] + 16, ax: [1, 0] } };
  return { q, H, d, nu, pn, pf, h, R0, loc, machine, solve: null };
});
/* подъём на носки: подушечки в 3 см от нижнего края платформы (центр платформы на 26 см выше подушечек) */
const LPC_H = 8 - 30 * Math.cos(25 * D2R);
/* стопа на платформе: support — точка под подушечкой на поверхности платформы */
function lpFoot(C, q, L, s, sup, heel = 0, allowShort = false) {
  const { V } = C, lat = C.latP(q, s), fdir = V.unit(V.add(L.pf, lat, .14));
  return C.foot(q, s, sup, 0, V.unit(V.add(L.nu, lat, .2)), { up: L.pn, forward: fdir, heel, allowShort });
}
/* детали каретки в её рамке (X, Y — от направляющих, Z — вдоль них); ball — середина подушечек стоп в рамке,
   pc — смещение центра платформы от подушечек вдоль платформы */
function lpSled(L, pc, h = L.h) {
  const pnl = [0, L.pn[1] * L.nu[1] + L.pn[2] * L.nu[2], L.pn[1] * L.d[1] + L.pn[2] * L.d[2]];
  const pfl = [0, L.pf[1] * L.nu[1] + L.pf[2] * L.nu[2], L.pf[1] * L.d[1] + L.pf[2] * L.d[2]];
  const ballY = 32 + h + 2 * pnl[1], sup = [0, ballY - 2 * pnl[1], -2 * pnl[2]];
  const P = (a, b, x = 0) => [x, sup[1] + pfl[1] * a + pnl[1] * b, sup[2] + pfl[2] * a + pnl[2] * b];
  const ax = [[1, 0, 0], pnl, pfl], lowEdge = P(pc - 29, -6), hiEdge = P(pc + 29, -6);
  const parts = [
    { name: 'plate', kind: 'obox', c: P(pc, -2), size: [74, 4, 58], axes: ax, tone: 'rubber', mount: 'deck', round: .5 },
    { name: 'deck', kind: 'obox', c: P(pc, -6), size: [66, 4, 54], axes: ax, mount: 'carL', round: .4 }
  ];
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * 28;
    parts.push({ name: 'car' + k, kind: 'obox', c: [x, 5, lowEdge[2] + 34], size: [8, 6, 80], mount: 'lp:rail' + k, round: .6 });
    parts.push({ name: 'strut' + k, kind: 'beam', a: [x, 7, lowEdge[2] + 1], b: [x, lowEdge[1] + 1, lowEdge[2] + 1], w: 6, h: 6, mount: 'car' + k });
    parts.push({ name: 'brace' + k, kind: 'beam', a: [x, 7, lowEdge[2] + 52], b: [x, hiEdge[1] - 2, hiEdge[2] + 1], w: 6, h: 6, mount: 'car' + k });
    parts.push({ name: 'horn' + k, kind: 'cyl', c: [sg * 45, 18, lowEdge[2] + 62], axis: [1, 0, 0], r: 2.5, len: 26, tone: 'chrome', mount: 'hornBar' });
    parts.push({ name: 'disc' + k, kind: 'cyl', c: [sg * 42.6, 18, lowEdge[2] + 62], axis: [1, 0, 0], r: 22.5, len: 5.6, tone: 'plate', mount: 'horn' + k, sides: 32 });
    parts.push({ name: 'disc2' + k, kind: 'cyl', c: [sg * 48.4, 18, lowEdge[2] + 62], axis: [1, 0, 0], r: 22.5, len: 5.6, tone: 'plate', mount: 'disc' + k, sides: 32 });
  }
  parts.push({ name: 'hornBar', kind: 'beam', a: [-32, 18, lowEdge[2] + 62], b: [32, 18, lowEdge[2] + 62], w: 6, h: 6, mount: 'hornPostL' });
  for (const sg of [1, -1]) parts.push({ name: 'hornPost' + (sg > 0 ? 'L' : 'R'), kind: 'beam', a: [sg * 28, 7, lowEdge[2] + 62], b: [sg * 28, 21, lowEdge[2] + 62], w: 6, h: 6, mount: 'car' + (sg > 0 ? 'L' : 'R') });
  return parts;
}
/* жим ногами со стопами, сдвинутыми вдоль платформы на shift см (+ — к верхнему краю); kTop, kBot — угол в колене
   в верхней и нижней точке. Подушечки уходят от поверхности направляющих на shift·cos 25°, вдоль направляющих —
   на shift·sin 25° (это поглощает положение платформы, которое подбирается по углу в колене). */
function lpFeetSpec(shift, kTop, kBot) {
  const h = 8 + shift * Math.cos(25 * D2R), pc = -4 - shift;
  const stroke = once(() => {
    const C = ctx([]), L = LP(), q = C.M.clone(L.q), { V } = C;
    const sup = sp => V.add(V.add(V.add(L.H, L.d, sp), L.nu, h), C.latP(q, 'L'), 13);
    const at = k => C.solve1D(x => { lpFoot(C, q, L, 'L', sup(x), 0, true); return q.L.knee - k; }, 40, 130);
    return [at(kTop), at(kBot)];
  });
  return {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = LP(); return [L.machine, { type: 'g4sled', id: 'sled', rail: [V3(L.R0, L.d, -10), V3(L.R0, L.d, 186)], up: L.nu, bind: { mix: ['ballL', 'ballR'] }, mountTo: 'lp:railL', parts: lpSled(L, pc, h) }]; })(),
    contacts: [{ body: 'buttocks', prop: 'lp:seat' }, { body: 'back', prop: 'lp:back' }, { body: 'soleL', prop: 'sled:plate' }, { body: 'soleR', prop: 'sled:plate' },
      { body: 'gripL', prop: 'lp:handleL' }, { body: 'gripR', prop: 'lp:handleR' }],
    pose(t, C) {
      const { V } = C, L = LP(), e = C.ease(t), q = C.M.clone(L.q), [s0, s1] = stroke(), sp = C.lerp(s0, s1, e);
      for (const s of S) lpFoot(C, q, L, s, V.add(V.add(V.add(L.H, L.d, sp), L.nu, h), C.latP(q, s), 13));
      for (const s of S) {
        q[s].girdle = [-2, -4];
        const m = L.machine.handle, g = [C.M.SIGN[s] * m.x, m.y, m.z], lat = C.lat(q, s), T = C.axes(q);
        C.grip(q, s, g, [0, ...m.ax], V.unit(V.add(V.add(V.scale(lat, .5), T.z, -1), T.y, -.5)));
      }
      return q;
    }
  };
}

/* ================= Турник силовой рамы ================= */
/* Перекладина Ø3,2 на высоте 228 см, вынесена на 12 см перед передними стойками (z = −67). */
const BAR = [0, 228, -67], RACK = { type: 'powerRack', id: 'rack', pullH: 228 };
/* таз отклонён назад на угол a (град) у тела, смотрящего вдоль face (±1 по Z) */
const tiltBack = (C, q, a, face) => { const r = a * D2R; return C.root(q, q.root.p, [0, Math.cos(r), -face * Math.sin(r)], [0, Math.sin(r), face * Math.cos(r)]); };
/* Вис: тело строится от плеч, затем таз и корпус смещаются вдоль Z так, чтобы общий центр масс был под перекладиной.
   face — куда смотрит тело (±1 по Z), grip — 'over' (прямой) или 'under' (обратный), w — полуширина хвата. */
function hangPose(C, q, { face = 1, grip = 'over', w = 30, drop = 60, pole }) {
  const { V } = C;
  const place = dz => {
    C.rootAtShoulders(q, [0, BAR[1] - Math.sqrt(drop * drop - dz * dz), BAR[2] + dz]);
    for (const s of S) {
      const lat = C.lat(q, s), th = grip === 'over' ? V.scale(lat, -1) : lat;
      C.grip(q, s, V.add(BAR, lat, w), th, pole ? pole(q, s, lat) : V.unit(V.add(V.add([0, -1, 0], lat, 1.0), [0, 0, face], .25)));
    }
  };
  const dz = C.solve1D(z => { place(z); return C.com(q)[2] - BAR[2]; }, -22, 22);
  place(dz);
  return q;
}

/* ================= Брусья ================= */
const DIP = { type: 'dipStation', id: 'dp', h: 120, x: 28, z: [-32, 30] };
/* Упор на брусьях: наклон корпуса lean, высота плеч над осью брусьев sh; положение вдоль Z — центр масс над кистями. */
function dipPose(C, { lean, sh, hip, knee, lumbar = 0, thor = 0, neck = 0, girdle = [0, 0], elbowOut = .25, bars = { h: 120, x: 28 } }) {
  const { V } = C, q = C.base(), a = lean * D2R;
  C.root(q, [0, 120, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thor, 0, 0]; q.neck = [neck, 0, 0];
  for (const s of S) { q[s].hip = [hip, 4, 6]; q[s].knee = knee; q[s].ankle = [-25, 0]; q[s].girdle = [...girdle]; }
  const place = (z, allowShort) => {
    C.rootAtShoulders(q, [0, bars.h + sh, z]);
    for (const s of S) { const lat = C.lat(q, s); C.grip(q, s, [C.M.SIGN[s] * bars.x, bars.h, 0], [0, 0, 1], V.unit(V.add(V.add([0, 0, -1], lat, elbowOut), [0, 1, 0], .2)), { allowShort }); }
  };
  const z = C.solve1D(z => { place(z, true); return C.com(q)[2]; }, -30, 30);
  place(z);
  return q;
}

/* ================= Гравитрон ================= */
/* Ось рычага платформы в башне на середине хода колен: платформа идёт почти вертикально, колени — по дуге R=80. */
const GV = (() => {
  /* виртуальная ось (через неё проходит дуга точки контакта колен); реальные оси параллелограмма смещены на d0 */
  const P = [0, 92, 84], r = 86, tz = 48, d0 = [0, -12, 0], v = [0, -16, 0];
  const at = phi => [0, P[1] + r * Math.sin(phi), P[2] - r * Math.cos(phi)];
  return { P, r, tz, d0, v, at, pull: { y: 228, z: 2, x0: 20, x1: 44 }, dip: { y: 122, x: 28, z0: -30 }, step: { y: 46, z0: -18 } };
})();
/* Колени на горизонтальной платформе (угол параллелограмма phi); бёдра под углом thigh (град от вертикали,
   + — таз позади колен), корпус наклонён на lean вперёд. */
function gvKneel(C, phi, { thigh = 0, lean = 0, lumbar = 0, thor = 0, neck = 0 }) {
  const { V } = C, q = C.base(), a = lean * D2R, th = thigh * D2R, u = [0, 1, 0];
  C.root(q, [0, 120, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thor, 0, 0]; q.neck = [neck, 0, 0];
  const c = GV.at(phi), K = V.add(V.add(c, [1, 0, 0], 8.8), u, 5.4);
  C.rootAtHip(q, 'L', V.add(K, [0, Math.cos(th), -Math.sin(th)], C.M.B.th));
  for (const s of S) C.kneel(q, s, V.add(c, [1, 0, 0], C.M.SIGN[s] * 8.8), [0, 0, -1], u, { toes: 'flat', plantar: 40 });
  return q;
}
/* хват на брусьях гравитрона — под плечами в верхнем положении */
const GV_DIPZ = () => -6;
const GV_EQ = () => [{ type: 'gravitron', id: 'gv', tz: GV.tz, pivot: [GV.P[1] + GV.d0[1], GV.P[2] + GV.d0[2]], linkV: GV.v[1], pull: GV.pull, dip: GV.dip, step: GV.step },
  { type: 'g4link', id: 'gvPad', pivot: GV.P, axis: [1, 0, 0], d0: GV.d0, v: GV.v, armX: [-12, 12], mountTo: 'gv:shaftU', mountTo2: 'gv:shaftD', bind: { mix: ['knL', 'knR'], frame: 'skL', off: [0, 0, 5.4] },
    carrier: [
      { name: 'pad', kind: 'obox', c: [0, -3.5, -12], size: [40, 7, 40], tone: 'pad', role: 'support', mount: 'plate', round: 1.6 },
      { name: 'plate', kind: 'obox', c: [0, -8, -12], size: [34, 2, 36], mount: 'frame' },
      { name: 'frame', kind: 'beam', a: [-13, -11, 2], b: [13, -11, 2], w: 6, h: 6, mount: 'post0' },
      { name: 'frameB', kind: 'beam', a: [0, -11, 2], b: [0, -11, -26], w: 6, h: 4, mount: 'frame' }
    ] }];

/* ================= «Капитанский стул» ================= */
/* Предплечья на упорах (верх 128 см), плечо вертикально, кисти на вертикальных рукоятях. Грудная клетка прижата
   к спинке; при подъёме коленей таз подкручивается назад, поясница сгибается. */
const CAP = once(() => {
  const C = ctx([]), { V } = C, q = C.base(), padY = 142, ex = 22, ez = 4;
  for (const s of S) q[s].girdle = [14, 0];
  const E = s => [C.M.SIGN[s] * ex, padY + 3.9, ez];
  C.rootAtShoulders(q, [0, padY + 3.9 + C.M.B.ua, ez]);
  const backZ = Math.min(...C.region(q, 'upperBack').map(p => p[2])) + 1.0;
  const machine = { type: 'captainsChair', id: 'cc', back: { z: backZ, y0: 96, y1: 164 }, arm: { x: ex, y: padY, z0: ez - 10, z1: ez + 30 },
    handle: { x: ex - 2.6, y: padY + 3.9, z: ez + 35 } };
  return { q, E, padY, ex, ez, backZ, machine };
});

/* ================= Сидячие рычажные тренажёры ================= */
/* Сидя, спиной к спинке (facing 'back') или грудью к упору ('chest'); стопы на полу. */
function seatedOn(C, { seatH, lean = 0, padZ, facing = 'back', lumbar = 0, thor = 0, neck = 0, knee = 88, footFwd = 6 }) {
  const { V } = C, q = C.base(), a = lean * D2R;
  C.root(q, [0, seatH + 12, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]);
  q.lumbar = [lumbar, 0, 0]; q.thoracic = [thor, 0, 0]; q.neck = [neck, 0, 0];
  for (const s of S) { q[s].hip = [88 - lean, 7, 5]; q[s].knee = knee; }
  const n = facing === 'back' ? [0, Math.sin(a), Math.cos(a)] : [0, -Math.sin(a), -Math.cos(a)], region = facing === 'back' ? 'back' : 'chest';
  for (let i = 0; i < 3; i++) { C.restOn(q, 'buttocks', [0, seatH, 0], [0, 1, 0], -1.3); C.restOn(q, region, [0, seatH + 40, padZ], n, -1.0); }
  for (const s of S) { const f = C.fk(q), kn = f.P['kn' + s], lat = C.latP(q, s); C.foot(q, s, V.add([kn[0], 0, kn[2] + footFwd], lat, 3), 0, V.unit(V.add([0, 0, 1], lat, .3)), { forward: V.unit(V.add([0, 0, 1], lat, .2)) }); }
  return q;
}
/* Плоскость упора через точку (y, z) с наклоном ang назад от вертикали */
const padAt = (padZ, y0, ang, kind, seatH) => padZ + (y0 - seatH - 40) * Math.tan(ang * D2R) * (kind === 'back' ? -1 : 1);
/* Рычаг с рукоятью: ось X через pivot, рукоять в точке хвата grip; kind 'x' — горизонтальная рукоять вдоль X
   (прямой хват), 'r' — вдоль радиуса (нейтральный хват). */
function handleLever(id, side, pivot, grip, kind, mountTo, beta = 0) {
  const R = Math.hypot(grip[1] - pivot[1], grip[2] - pivot[2]), ag = grip[0] - pivot[0], sg = Math.sign(ag) || 1;
  const parts = [{ name: 'hub', kind: 'cyl', c: [0, 0, 0], axis: [1, 0, 0], r: 5.5, len: 6, mount: mountTo }];
  if (kind === 'x') {
    parts.push({ name: 'arm', kind: 'beam', a: [0, 0, 0], b: [0, R + 2.5, 0], w: 5, h: 7, up: [0, 0, 1], mount: 'hub' });
    parts.push({ name: 'stub', kind: 'beam', a: [0, R, 0], b: [ag - sg * 7, R, 0], r: 2, mount: 'arm', tone: 'chrome' });
    parts.push({ name: 'handle', kind: 'beam', a: [ag - sg * 7, R, 0], b: [ag + sg * 6, R, 0], r: 1.6, mount: 'stub', tone: 'rubber', role: 'grip' });
  } else if (kind === 'rt') {
    const b = beta * D2R, top = [R - 8 * Math.cos(b), -8 * Math.sin(b)], bot = [R + 7 * Math.cos(b), 7 * Math.sin(b)];
    parts.push({ name: 'arm', kind: 'beam', a: [0, 0, 0], b: [0, top[0] + 2, top[1]], w: 5, h: 7, up: [0, 0, 1], mount: 'hub' });
    parts.push({ name: 'stub', kind: 'beam', a: [0, ...top], b: [ag, ...top], r: 2, mount: 'arm', tone: 'chrome' });
    parts.push({ name: 'handle', kind: 'beam', a: [ag, ...top], b: [ag, ...bot], r: 1.6, mount: 'stub', tone: 'rubber', role: 'grip' });
  } else {
    parts.push({ name: 'arm', kind: 'beam', a: [0, 0, 0], b: [0, R + 10, 0], w: 5, h: 7, up: [0, 0, 1], mount: 'hub' });
    parts.push({ name: 'stub', kind: 'beam', a: [0, R + 8, 0], b: [ag, R + 8, 0], r: 2, mount: 'arm', tone: 'chrome' });
    parts.push({ name: 'handle', kind: 'beam', a: [ag, R + 8, 0], b: [ag, R - 7, 0], r: 1.6, mount: 'stub', tone: 'rubber', role: 'grip' });
  }
  return { type: 'g4lever', id: id + side, pivot, axis: [1, 0, 0], bind: 'grip' + side, mountTo, parts };
}
/* направление большого пальца на рукояти рычага (к оси, с доворотом beta в плоскости рычага) */
const leverThumb = (P, g, beta) => { const Y = [0, g[1] - P[1], g[2] - P[2]], l = Math.hypot(Y[1], Y[2]), y = [0, Y[1] / l, Y[2] / l], z = [0, -y[2], y[1]], b = beta * D2R;
  return [0, -(y[1] * Math.cos(b) + z[1] * Math.sin(b)), -(y[2] * Math.cos(b) + z[2] * Math.sin(b))]; };
/* точка на дуге рычага: угол th от направления «вниз» (0) к +Z (+) */
const arcPt = (P, R, th, x) => [x, P[1] - R * Math.cos(th), P[2] + R * Math.sin(th)];
/* центр дуги радиуса R через точки a, b (в плоскости YZ), выше хорды */
const arcCenter = (a, b, R, pref = [1, 0]) => { const m = [(a[1] + b[1]) / 2, (a[2] + b[2]) / 2], d = [b[1] - a[1], b[2] - a[2]], L = Math.hypot(...d), h = Math.sqrt(R * R - L * L / 4);
  let n = [d[1] / L, -d[0] / L]; if (n[0] * pref[0] + n[1] * pref[1] < 0) n = [-n[0], -n[1]]; return [m[0] + n[0] * h, m[1] + n[1] * h]; };
const arcAng = (P, p) => Math.atan2(p[2] - P[2], -(p[1] - P[1]));

/* Жим от груди сидя: спинка 10° назад, оси рычагов над серединой траектории кисти (R = 88 см) — рукояти идут
   вперёд почти горизонтально. Рукояти горизонтальные (прямой хват) на уровне середины груди. */
const CPM = once(() => {
  const C = ctx([]), { V } = C, seatH = 46, lean = 10, padZ = -16;
  const q = seatedOn(C, { seatH, lean, padZ, facing: 'back', lumbar: 2, neck: -4 }), f = C.fk(q);
  const gh = V.mix(f.P.ghL, f.P.ghR, .5), front = C.chestPoint(q, 34);
  const R = 88, hx = 28, ys = gh[1] - 10, zs = gh[2] + 32, ze = gh[2] + 61, zm = (zs + ze) / 2, P = [38, ys + Math.sqrt(R * R - (ze - zm) ** 2), zm];
  const th0 = arcAng(P, [0, ys, zs]), th1 = arcAng(P, [0, ys, ze]);
  const machine = { type: 'seatedLever', id: 'cp', front, seat: { h: seatH, z0: padZ - 14, z1: padZ + 30 }, pad: { kind: 'back', z: padAt(padZ, seatH + 4, lean, 'back', seatH), ang: lean, y0: seatH + 4, y1: seatH + 74 },
    hub: { x: P[0], y: P[1], z: P[2] }, tower: { z: padZ - 34, h: P[1] + 14 } };
  return { q, P, R, hx, th0, th1, machine };
});

/* Жим сидя в тренажёре: спинка почти вертикальна (6°), оси рычагов позади спинки на уровне выше плеч —
   рукояти идут вверх и чуть назад, как при жиме над головой. */
const SPM = once(() => {
  const C = ctx([]), { V } = C, seatH = 46, lean = 6, padZ = -14;
  const q = seatedOn(C, { seatH, lean, padZ, facing: 'back', lumbar: 0, neck: -2 }), f = C.fk(q);
  const gh = V.mix(f.P.ghL, f.P.ghR, .5);
  const R = 72, hx = SPM_T.hx, A0 = [0, gh[1] + SPM_T.y0, gh[2] + SPM_T.z0], A1 = [0, gh[1] + SPM_T.y1, gh[2] + SPM_T.z1], P = [42, ...arcCenter(A0, A1, R, [0, -1])];
  const th0 = arcAng(P, A0), th1 = arcAng(P, A1);
  const machine = { type: 'seatedLever', id: 'sp', seat: { h: seatH, z0: padZ - 14, z1: padZ + 30 }, pad: { kind: 'back', z: padAt(padZ, seatH + 4, lean, 'back', seatH), ang: lean, y0: seatH + 4, y1: seatH + 74 },
    hub: { x: P[0], y: P[1], z: P[2] }, tower: { z: P[2] - 6, h: P[1] + 40 } };
  return { q, P, R, hx, th0, th1, machine, gh };
});
const SPM_T = { hx: 34, y0: 18, z0: 4, y1: 61, z1: -2 };

/* Рычажная тяга с упором грудью: сидя, грудь на вертикальном упоре, оси рычагов над головой,
   рукояти вертикальные (нейтральный хват), идут по дуге назад-вниз к поясу. */
const LRM = once(() => {
  const C = ctx([]), { V } = C, seatH = 48, lean = -6, padZ = 20;
  const q = seatedOn(C, { seatH, lean, padZ, facing: 'chest', lumbar: 0, neck: -6, footFwd: 10 }), f = C.fk(q);
  const gh = V.mix(f.P.ghL, f.P.ghR, .5), T = LRM_T;
  const R = 100, hx = T.hx, A0 = [0, gh[1] + T.y0, gh[2] + T.z0], A1 = [0, gh[1] + T.y1, gh[2] + T.z1], P = [44, ...arcCenter(A0, A1, R, [1, 0])];
  const th0 = arcAng(P, A0), th1 = arcAng(P, A1), py = padZ + (seatH + 6 - seatH - 40) * Math.tan(-lean * D2R);
  const machine = { type: 'seatedLever', id: 'lr', seat: { h: seatH, z0: -24, z1: padZ - 8 }, pad: { kind: 'chest', z: padAt(padZ, seatH + 22, -lean, 'chest', seatH), ang: -lean, y0: seatH + 22, y1: seatH + 66, w: 30 },
    hub: { x: P[0], y: P[1], z: P[2] }, tower: { z: padZ + 62, h: P[1] + 14 } };
  return { q, P, R, hx, th0, th1, machine, gh };
});
const LRM_T = { hx: 22, y0: -9, z0: 63, y1: -20, z1: 8, beta: 14 };

/* ================= Отведение и приведение бёдер ================= */
/* Сиденье с подъёмом переднего края 10°, спинка 16° назад. Нога целиком поворачивается вокруг вертикальной оси
   через центр тазобедренного сустава (горизонтальное отведение согнутого бедра) — так устроены рычаги тренажёра. */
const HA = once(() => {
  const C = ctx([]), { V, M } = C, q = C.base(), lean = 16 * D2R, si = 10 * D2R, seatH = 56;
  C.root(q, [0, 68, 0], [0, Math.cos(lean), -Math.sin(lean)], [0, Math.sin(lean), Math.cos(lean)]);
  q.lumbar = [2, 0, 0]; q.neck = [-2, 0, 0];
  for (const s of S) { q[s].hip = [76, 0, 0]; q[s].knee = 84; q[s].ankle = [2, 0]; }
  const nS = [0, Math.cos(si), -Math.sin(si)], nB = [0, Math.sin(lean), Math.cos(lean)];
  for (let i = 0; i < 3; i++) { C.restOn(q, 'buttocks', [0, seatH, 0], nS, -1.4); C.restOn(q, 'back', [0, seatH, -22], nB, -1.0); }
  const f = C.fk(q), hip = { L: f.P.hipL, R: f.P.hipR }, K = { L: f.P.knL, R: f.P.knR };
  const feet = Object.fromEntries(S.map(s => [s, { o: f.P['an' + s], R: f.F['foot' + s].R, toesR: f.F['toes' + s].R }]));
  const low = (name, n) => Math.min(...C.region(q, name).map(p => V.dot(p, n)));
  const oS = low('buttocks', nS) + 1.4, oB = low('back', nB) + 1.0;
  const det = nS[1] * nB[2] - nS[2] * nB[1], jy = (oS * nB[2] - nS[2] * oB) / det, jz = (nS[1] * oB - oS * nB[1]) / det;
  const hubY = jy - 24;
  const machine = { type: 'hipAbductor', id: 'ha', seat: { c: [jy + Math.sin(si) * 22, jz + Math.cos(si) * 22], ang: 10, len: 42 }, back: { c0: [jy, jz], ang: 16, len: 62 },
    hub: { x: 8.8, y: hubY, z: hip.L[2] }, handle: { x: 25, y: jy + 2, z: hip.L[2] + 2 } };
  return { q, f, hip, K, feet, hubY, machine };
});
function haPose(C, a) {
  const { V } = C, L = HA(), q = haLegs(C, L, a);
  for (const s of S) {
    q[s].girdle = [-2, -2];
    const m = L.machine.handle, lat = C.lat(q, s);
    C.grip(q, s, [C.M.SIGN[s] * m.x, m.y, m.z - 9 + 9.5], [0, 0, 1], V.unit(V.add(V.add(lat, [0, 0, -1], .25), [0, -1, 0], .1)));
  }
  return q;
}
/* поворот точки вокруг вертикальной оси через p0 на угол a (град) */
const rotY = (p, p0, a) => { const c = Math.cos(a * D2R), s = Math.sin(a * D2R), x = p[0] - p0[0], z = p[2] - p0[2]; return [p0[0] + c * x + s * z, p[1], p0[2] - s * x + c * z]; };
/* нога, повёрнутая наружу на угол a вокруг вертикали через тазобедренный сустав */
function haLegs(C, L, a) {
  const { M } = C, q = C.M.clone(L.q);
  for (const s of S) {
    const g = M.SIGN[s] * a, h = L.hip[s], ft = L.feet[s], Ry = M.M3.ry(g);
    const o = rotY(ft.o, h, g), R = M.M3.mul(Ry, ft.R), toesR = M.M3.mul(Ry, ft.toesR);
    const kd = C.V.unit(C.V.sub(rotY(L.K[s], h, g), h));
    M.solveLeg(q, s, { o, R, toesR }, C.V.add([0, 1, 0], kd, .2));
  }
  return q;
}
/* рычаг на вертикальной оси: подушка снаружи (out) или изнутри (in) колена, подножка под стопой */
function haLever(L, s, side) {
  const { V } = require('../../../src/js/09bm-mannequin.js'), g = s === 'L' ? 1 : -1, h = L.hip[s], P = [h[0], L.hubY, h[2]];
  const K = L.K[s], rk = Math.hypot(K[0] - P[0], K[2] - P[2]), ak = K[1] - P[1];
  const ball = L.f.P['ball' + s], rb = Math.hypot(ball[0] - P[0], ball[2] - P[2]), ab = ball[1] - 2 - P[1];
  /* касательная Z = вверх × радиус: у левой ноги смотрит наружу (+X), у правой — внутрь */
  const tOut = g, sd = side === 'out' ? tOut : -tOut, tp = sd * (5.8 + 3.5 - 1.2), tpost = sd * (5.8 + 7 + 2.5);
  return { type: 'g4lever', id: 'ha' + s, pivot: P, axis: [0, 1, 0], mountTo: 'ha:hub' + s, bind: 'kn' + s,
    parts: [
      { name: 'hub', kind: 'cyl', c: [-3, 0, 0], axis: [1, 0, 0], r: 5, len: 7, mount: 'ha:hub' + s },
      { name: 'arm', kind: 'beam', a: [-3, 0, 0], b: [-3, rk - 2, tpost], w: 5, h: 5, up: [1, 0, 0], mount: 'hub' },
      { name: 'post', kind: 'beam', a: [ab - 6, rk - 2, tpost], b: [ak + 7, rk - 2, tpost], w: 4.5, h: 4.5, up: [0, 1, 0], mount: 'arm' },
      /* подушка у колена; нижний край выше сиденья (сиденье кончается под бедром) */
      { name: 'padPlate', kind: 'obox', c: [ak + 1.5, rk, sd * (5.8 + 7 - .2 - 1.2)], size: [12, 18, 2], mount: 'post' },
      { name: 'pad', kind: 'obox', c: [ak + 1.5, rk, tp], size: [14, 20, 7], tone: 'pad', role: 'pad', mount: 'padPlate', round: 1.8 },
      { name: 'pegArm', kind: 'beam', a: [ab - 5, rk - 2, tpost], b: [ab - 5, rb, 0], w: 3, h: 3, up: [1, 0, 0], mount: 'post' },
      { name: 'peg', kind: 'obox', c: [ab - 2.4, rb - 1, 0], size: [3, 16, 11], tone: 'rubber', mount: 'pegArm', round: .5 }
    ] };
}

/* ================= Подъём на носки сидя ================= */
/* Таз на сиденье неподвижен, подушечки стоп на краю ступени; при подъёме пяток колени поднимаются, упор на бёдрах
   идёт за ними на рычаге. Ось рычага — впереди у пола, на равном расстоянии от точки контакта в крайних положениях. */
/* рукояти на рычаге: смещение по нормали подушки u (вверх — отрицательное), вдоль подушки v0…v1 */
const SCF_H = { u: -25, v: -13, x: 23 };
const SCF = once(() => {
  const C = ctx([]), { V, M } = C, q = C.base(), seatH = 50;
  C.root(q, [0, 60, 0], [0, 1, 0], [0, 0, 1]);
  q.lumbar = [0, 0, 0]; q.thoracic = [4, 0, 0]; q.neck = [6, 0, 0];
  for (const s of S) { q[s].hip = [86, 5, 4]; q[s].knee = 86; }
  C.restOn(q, 'buttocks', [0, seatH, 0], [0, 1, 0], -1.3);
  const f = C.fk(q), stepY = 13, ballZ = V.mix(f.P.knL, f.P.knR, .5)[2] + 12;
  const sup = s => [C.M.SIGN[s] * 11, stepY, ballZ];
  const legs = (qq, heel) => { for (const s of S) C.foot(qq, s, sup(s), 0, V.unit(V.add([0, .3, 1], C.latP(qq, s), .12)), { forward: V.unit(V.add([0, 0, 1], C.latP(qq, s), .1)), heel }); return qq; };
  const off = [0, 8, 5.7], bindAt = heel => { const qq = legs(C.M.clone(q), heel), R = C.M.catalogPose(qq); return C.EQ.bodyPoint ? (p => [p[0], C.M.FLOOR - p[1], p[2]])(C.EQ.bodyPoint(R, { mix: ['knL', 'knR'], frame: 'thL', off })) : null; };
  const H0 = -16, H1 = 32, b0 = bindAt(H0), b1 = bindAt(H1), mid = V.mix(b0, b1, .5), d = V.unit(V.sub(b1, b0)), n = [0, d[2], -d[1]];
  /* ось на серединном перпендикуляре к пути точки контакта, на 46 см впереди неё */
  const nn = n[2] < 0 ? V.scale(n, -1) : n, k = 46 / nn[2], P = V.add(mid, nn, k);
  const machine = { type: 'seatedCalf', id: 'sc', seat: { h: seatH, z0: f.P.hipL[2] - 20, z1: f.P.hipL[2] + 22 }, step: { y: stepY, z: ballZ - 1.5, w: 50 }, pivot: [P[1], P[2]] };
  return { q, legs, off, P, R: V.dist(P, b0), b0, H0, H1, machine };
});

/* ================= Подъём на носки стоя ================= */
/* Подушечки на заднем крае ступени (пятки свисают), колени почти прямые; таз и корпус ставятся так, чтобы колено
   было ~5°, а общий центр масс — над подушечками. Плечевые упоры на вертикальной каретке идут вверх с телом. */
const SCS = { step: { y: 12, z: 0, w: 56 }, zr: -30, ballZ: 2.5 };
function scsPose(C, heel, shZ = null) {
  const { V } = C, q = C.base();
  C.root(q, [0, 106, -4], [0, 1, 0], [0, 0, 1]);
  q.lumbar = [-2, 0, 0]; q.neck = [-2, 0, 0];
  for (const s of S) { q[s].hip = [2, 4, 4]; q[s].girdle = [6, 0]; }
  const legs = () => { for (const s of S) C.foot(q, s, [C.M.SIGN[s] * 11, SCS.step.y, SCS.ballZ], 0, V.unit(V.add([0, 0, 1], C.latP(q, s), .1)), { forward: V.unit(V.add([0, 0, 1], C.latP(q, s), .08)), heel, allowShort: true }); };
  for (let i = 0; i < 4; i++) {
    const y = C.solve1D(y => { q.root.p[1] = y; legs(); return q.L.knee - 5; }, 80, 130); q.root.p[1] = y; legs();
    /* в исходном положении центр масс над подушечками; дальше плечи остаются под упорами (каретка вертикальна) */
    const f = C.fk(q), dz = shZ == null ? SCS.ballZ - 1 - C.com(q)[2] : shZ - (f.P.ghL[2] + f.P.ghR[2]) / 2; q.root.p[2] += dz;
  }
  legs();
  return q;
}
/* рукояти на каретке: вперёд от плеч dz, ниже плеч dy, ось — вверх с наклоном назад */
const SCS_HD = { x: 26, dz: 28, dy: -12 };
const SCS_Z = once(() => { const C = ctx([]), f = C.fk(scsPose(C, 0)); return (f.P.ghL[2] + f.P.ghR[2]) / 2; });
/* профиль верха плеч: наибольшая высота поверхности корпуса над полосой |x| ≈ x0 (до h = 50 — зона упора) */
function shoulderTopAt(C, q, x0, hMax = 53.8) {
  const R = C.M.catalogPose(q); let best = -Infinity;
  for (let h = 36; h <= hMax; h += .5) for (let a = 0; a < 2 * Math.PI; a += Math.PI / 32) for (const s of S) { const p = C.M.torsoPoint(R, h, s, a); if (Math.abs(Math.abs(p[0]) - x0) < 1.5) best = Math.max(best, C.M.FLOOR - p[1]); }
  /* верх плеча — и корпус, и начало плечевой кости (дельтовидная), на которые ложится упор */
  for (let t = 0; t <= .2; t += .05) for (let a = 0; a < 2 * Math.PI; a += Math.PI / 32) for (const s of S) { const p = C.M.limbPoint(R, 'ua', s, t, a); if (Math.abs(Math.abs(p[0]) - x0) < 1.5) best = Math.max(best, C.M.FLOOR - p[1]); }
  return best;
}
const SCS_L = once(() => {
  const C = ctx([]), { V } = C, q = scsPose(C, 0), f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5);
  /* упор наклонён по трапециевидной: прямая через верх плеч на |x| = 9 и 16 см */
  /* наклон — по верху плеч от |x| = 9 до 19,5 см (наружный край упора над дельтовидной), высота — в середине упора (|x| = 12,5) */
  const y9 = shoulderTopAt(C, q, 9, 56.8), yOut = shoulderTopAt(C, q, 19.5);
  const th = Math.atan2(y9 - yOut, 10.5), yc = y9 + (yOut - y9) * 3.5 / 10.5 - gh[1];
  return { dz: gh[2] - SCS.zr, padZ: yc - 1.0, th };
});

/* ================= Гакк-машина ================= */
/* Спина и таз на каретке под 45°, ноги вынесены вперёд (линия таз–стопа 55° от вертикали), площадка с подъёмом
   носков 20°: вверху колени ~18°, внизу ~95°, пятки не отрываются. Каретка следует за тазом по направляющим. */
const HK = once(() => {
  const C = ctx([]), { V } = C, A = 45 * D2R, d = [0, Math.sin(A), -Math.cos(A)], nb = [0, Math.cos(A), Math.sin(A)], al = 20 * D2R, be = 55 * D2R;
  const pu = [0, Math.cos(al), -Math.sin(al)], pf = [0, Math.sin(al), Math.cos(al)];
  const H0 = [0, 64, 0], sup = V.add(H0, [0, -Math.cos(be), Math.sin(be)], 80);
  const body = u => { const q = C.base(); C.root(q, V.add(H0, d, u), d, nb); q.lumbar = [-2, 0, 0]; q.neck = [12, 0, 0];
    for (const s of S) { const lat = C.latP(q, s); C.foot(q, s, V.add(sup, lat, 13), 0, V.unit(V.add(pf, lat, .2)), { up: pu, forward: V.unit(V.add(pf, lat, .12)), allowShort: true }); }
    return q; };
  const knee = u => body(u).L.knee, u0 = C.solve1D(u => 18 - knee(u), -40, 40), u1 = C.solve1D(u => 95 - knee(u), -80, 40);
  /* плоскость спинки и упоры: по телу в верхнем положении; направляющие — на 30 см позади оси таза */
  const q0 = body(u0), back = Math.min(...C.region(q0, 'back').map(p => V.dot(p, nb))) + 1.0, hip0 = V.add(H0, d, u0);
  const R0 = V.add(H0, nb, -30), yBack = -(back - V.dot(R0, nb));
  const rail = { a: V.add(R0, d, -30).slice(1), b: V.add(R0, d, 175).slice(1) };
  return { C, d, nb, pu, pf, H0, sup, body, u0, u1, R0, yBack, rail, machine: { type: 'hackSquat', id: 'hk', rx: 22, rail, plate: { c: V.add(sup, pf, -6).slice(1), ang: 20, w: 70, l: 46 } } };
});

/* Детали каретки гакк-машины в её рамке: X — вбок, Y — от тела к направляющим, Z — вдоль направляющих вверх.
   Начало — проекция середины тазобедренных суставов на ось направляющих (таз в Y = −30, Z = 0). */
const HK_SLED = once(() => {
  const L = HK(), C = L.C, { V } = C, q = L.body(L.u0), f = C.fk(q), hip = V.mix(f.P.hipL, f.P.hipR, .5);
  const loc = p => [p[0], -V.dot(V.sub(p, hip), L.nb) - 30, V.dot(V.sub(p, hip), L.d)];
  /* верх плеч по оси d над полосами |x| ≈ 9 и 16 (по зоне упора, до h = 50…53): упор наклонён по трапециевидной */
  const R = C.M.catalogPose(q);
  const topAt = (x0, hMax) => { let best = null; for (let h = 36; h <= hMax; h += .5) for (let a = 0; a < 2 * Math.PI; a += Math.PI / 32) for (const s of S) { const p = C.M.torsoPoint(R, h, s, a), l = loc([p[0], C.M.FLOOR - p[1], p[2]]); if (Math.abs(Math.abs(l[0]) - x0) < 1.5 && (!best || l[2] > best[2])) best = l; } return best; };
  const t9 = topAt(9, 56.8), t16 = topAt(16, 53.8), th = Math.atan2(t9[2] - t16[2], 7), top = (t9[2] + t16[2]) / 2, ySh = (t9[1] + t16[1]) / 2;
  const gh = loc(V.mix(f.P.ghL, f.P.ghR, .5)), yb = L.yBack, zs = top - 1.0, parts = [];
  parts.push({ name: 'back', kind: 'obox', c: [0, yb + 3.5, (zs - 18 - 16) / 2], size: [32, 7, zs - 18 + 16], tone: 'pad', role: 'support', mount: 'plate', round: 1.8 });
  parts.push({ name: 'plate', kind: 'obox', c: [0, yb + 8, (zs - 18 - 16) / 2], size: [26, 2, zs - 18 + 12], mount: 'frame' });
  parts.push({ name: 'frame', kind: 'beam', a: [0, yb + 10, -12], b: [0, yb + 10, zs + 10], w: 8, h: 4, up: [0, 1, 0], mount: 'strutLo' });
  for (const [k, z] of [['Lo', 0], ['Hi', 40]]) {
    /* поперечины каретки — со стороны спинки (−y), чтобы не задевать балки направляющих за рельсами */
    parts.push({ name: 'cross' + k, kind: 'beam', a: [-22, -4.5, z], b: [22, -4.5, z], w: 6, h: 4, mount: 'car' + k + 'L' });
    parts.push({ name: 'strut' + k, kind: 'beam', a: [0, -4.5, z], b: [0, yb + 11, z], w: 6, h: 6, mount: 'cross' + k });
    for (const g of [1, -1]) parts.push({ name: 'car' + k + (g > 0 ? 'L' : 'R'), kind: 'obox', c: [g * 22, 0, z], size: [7, 7, 16], mount: 'hk:rail' + (g > 0 ? 'L' : 'R') });
  }
  const hl = Math.hypot(.4, .9), ha = [0, .4 / hl, .9 / hl], topZ = zs + 10;
  for (const g of [1, -1]) {
    const k = g > 0 ? 'L' : 'R', hc = [g * 26, gh[1] - 28, gh[2] - 12];
    parts.push({ name: 'arm' + k, kind: 'beam', a: [g * 26, yb + 10, topZ], b: [g * 26, hc[1] - 6, topZ], w: 5, h: 6, mount: 'top' });
    const ax = [g * Math.cos(th), 0, -Math.sin(th)], nn = [g * Math.sin(th), 0, Math.cos(th)], pc = [g * 12.5 + nn[0] * 3.5, ySh, zs + nn[2] * 3.5];
    parts.push({ name: 'sh' + k, kind: 'obox', c: pc, size: [14, 7, 15], axes: [ax, nn, [0, 1, 0]], tone: 'pad', role: 'support', mount: 'shPlate' + k, round: 2 });
    parts.push({ name: 'shPlate' + k, kind: 'obox', c: [pc[0] + nn[0] * 4.4, ySh, pc[2] + nn[2] * 4.4], size: [11, 2, 13], axes: [ax, nn, [0, 1, 0]], mount: 'shArm' + k });
    parts.push({ name: 'shArm' + k, kind: 'beam', a: [g * 26, ySh, topZ], b: [pc[0] + nn[0] * 5.2, ySh, pc[2] + nn[2] * 5.2], w: 4, h: 4, mount: 'arm' + k });
    parts.push({ name: 'hDrop' + k, kind: 'beam', a: [g * 26, hc[1] + ha[1] * 9, topZ], b: [g * 26, hc[1] + ha[1] * 9, hc[2] + ha[2] * 9], w: 3.5, h: 3.5, mount: 'arm' + k });
    parts.push({ name: 'handle' + k, kind: 'beam', a: [g * 26, hc[1] + ha[1] * 9, hc[2] + ha[2] * 9], b: [g * 26, hc[1] - ha[1] * 8, hc[2] - ha[2] * 8], r: 1.6, tone: 'rubber', role: 'grip', mount: 'hDrop' + k });
    parts.push({ name: 'horn' + k, kind: 'cyl', c: [g * 40, -4.5, 40], axis: [1, 0, 0], r: 2.5, len: 24, tone: 'chrome', mount: 'hornBar' });
    parts.push({ name: 'disc' + k, kind: 'cyl', c: [g * 37.5, -4.5, 40], axis: [1, 0, 0], r: 22.5, len: 5.6, tone: 'plate', mount: 'horn' + k, sides: 32 });
  }
  parts.push({ name: 'top', kind: 'beam', a: [-27, yb + 10, topZ], b: [27, yb + 10, topZ], w: 6, h: 6, mount: 'frame' });
  parts.push({ name: 'hornBar', kind: 'beam', a: [-28, -4.5, 40], b: [28, -4.5, 40], w: 6, h: 4, mount: 'strutHi' });
  return { parts, gh };
});

/* ================= Скамья для пресса с обратным наклоном ================= */
/* Лёжа на спине головой вниз (наклон 22°), колени согнуты через валик, голеностопы под валиками.
   Таз неподвижен; скручивание — сгибанием грудного и поясничного отделов, поясница остаётся на доске. */
const DCL = once(() => {
  const C = ctx([]), { V } = C, q = C.base(), de = 22 * D2R;
  const up = [0, -Math.sin(de), -Math.cos(de)], fwd = [0, Math.cos(de), -Math.sin(de)];
  C.root(q, [0, 70, 0], up, fwd);
  for (const s of S) { q[s].hip = [72, 4, 4]; q[s].knee = 100; q[s].ankle = [-10, 0]; }
  const f = C.fk(q);
  /* доска: плоскость под спиной и ягодицами */
  const n = fwd, o = Math.min(...C.region(q, 'back').map(p => V.dot(p, n))) + 1.2;
  const onPad = z => { /* точка плоскости с заданным z на средней линии */ const y = (o - n[2] * z) / n[1]; return [0, y, z]; };
  const hipZ = f.P.hipL[2], hiZ = hipZ + 10, loZ = f.P.ghL[2] - 40;
  /* валик под коленями: со стороны подколенной ямки; валик перед голеностопами: спереди голени над стопой */
  const R = C.M.catalogPose(q), fr = k => { const F = R.frames[k]; return { y: [F.y[0], -F.y[1], F.y[2]], z: [F.z[0], -F.z[1], F.z[2]] }; };
  const K = V.mix(f.P.knL, f.P.knR, .5), back = V.unit(V.scale(V.add(fr('thL').z, fr('skL').z), -1));
  const legPts = ['thL', 'skL'].flatMap(k => C.region(q, k)), clear = c => Math.min(...legPts.map(p => Math.hypot(p[1] - c[1], p[2] - c[2])));
  const kd = C.solve1D(d => clear(V.add(K, back, d)) - (6 - 1.0), 4, 30), kc = V.add(K, back, kd);
  const A = V.mix(f.P.anL, f.P.anR, .5), sk = fr('skL'), ac = V.add(V.add(A, sk.y, 9), sk.z, 2.9 + 5 - .8);
  const machine = { type: 'declineBench', id: 'db', pad: { hi: onPad(hiZ).slice(1), lo: onPad(loZ).slice(1) }, knee: { c: kc.slice(1), r: 6 }, ankle: { c: ac.slice(1), r: 5 } };
  return { q, machine };
});

module.exports = {

  /* Скручивания на скамье для пресса с обратным наклоном: руки скрещены на груди. t=0 — корпус на доске (не ложась
     полностью: лопатки едва касаются), t=1 — грудная клетка подкручена к тазу, лопатки оторваны. */
  declinecrunch: {
    keys: [0, .25, .5, .75, 1],
    equipment: [DCL().machine],
    contacts: [{ body: 'buttocks', prop: 'db:pad' }, { body: 'back', prop: 'db:pad' }, { body: 'kneeL', prop: 'db:kneeL' }, { body: 'kneeR', prop: 'db:kneeR' },
      { body: 'skL', prop: 'db:ankleL' }, { body: 'skR', prop: 'db:ankleR' }],
    pose(t, C) {
      const { V, M } = C, L = DCL(), e = C.ease(t), q = C.M.clone(L.q);
      q.lumbar = [C.lerp(2, 16, e), 0, 0]; q.thoracic = [C.lerp(4, 30, e), 0, 0]; q.neck = [C.lerp(8, 18, e), 0, 0];
      for (const s of S) q[s].girdle = [0, 10];
      const T = C.axes(q, 'thorax');
      const wr = { L: V.add(V.add(V.add(T.o, T.x, -7), T.y, 16.2), T.z, 15.5), R: V.add(V.add(V.add(T.o, T.x, 7), T.y, 10), T.z, 22.5) };
      for (const s of S) C.armTo(q, s, wr[s], V.unit(V.add(V.scale(T.y, -1), T.x, M.SIGN[s] * 1.1)), { pron: 60, mode: 'relaxed' });
      return q;
    }
  },

  /* Приседания в гакк-машине (eccFirst): t=0 — верх, колени ~18°; t=1 — низ, колени ~95°. Спина и таз прижаты
     к каретке, плечи под упорами, стопы на наклонной площадке на ширине плеч. */
  hacksquat: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = HK(); return [L.machine, { type: 'g4sled', id: 'hkSled', rail: [[0, ...L.rail.a], [0, ...L.rail.b]], up: V3([0, 0, 0], L.nb, -1), bind: { mix: ['hipL', 'hipR'] }, mountTo: 'hk:railL', parts: HK_SLED().parts }]; })(),
    contacts: [{ body: 'back', prop: 'hkSled:back' }, { body: 'upperBack', prop: 'hkSled:shL' }, { body: 'upperBack', prop: 'hkSled:shR' }, { body: 'soleL', prop: 'hk:plate' }, { body: 'soleR', prop: 'hk:plate' },
      { body: 'gripL', prop: 'hkSled:handleL' }, { body: 'gripR', prop: 'hkSled:handleR' }],
    pose(t, C) {
      const { V } = C, L = HK(), e = C.ease(t), q = L.body(C.lerp(L.u0, L.u1, e)), f = C.fk(q), hip = V.mix(f.P.hipL, f.P.hipR, .5), G = HK_SLED().gh;
      for (const s of S) {
        const lat = C.lat(q, s), g = V.add(V.add(V.add(hip, [C.M.SIGN[s] * 26, 0, 0], 1), L.nb, -(G[1] - 28 + 30)), L.d, G[2] - 12);
        C.grip(q, s, g, V.unit(V.add(V.scale(L.d, .9), L.nb, -.4)), V.unit(V.add(V.add(V.scale(L.d, -1), lat, .3), L.nb, .3)));
      }
      return q;
    }
  },

  /* Подъём на носки стоя в тренажёре: плечи под упорами, ноги почти прямые, корпус вертикально.
     t=0 — пятки опущены ниже ступени, t=1 — подъём на носки максимально высоко; каретка идёт вверх вместе с плечами. */
  standcalf: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => {
      const L = SCS_L(), y = -L.dz, z = L.padZ, rx = 24, c = Math.cos(L.th), sn = Math.sin(L.th);
      return [{ type: 'standingCalf', id: 'cs', zr: SCS.zr, rx, step: SCS.step },
        { type: 'g4sled', id: 'csSled', rail: [[0, 38, SCS.zr], [0, 214, SCS.zr]], up: [0, 0, -1], bind: { mix: ['shL', 'shR'] }, mountTo: 'cs:rodL',
          parts: [
            ...[1, -1].flatMap(g => { const k = g > 0 ? 'L' : 'R', ax = [g * c, 0, -sn], n = [g * sn, 0, c], pc = [g * 12.5 + n[0] * 3.5, y, z + n[2] * 3.5], top = z + 12;
              const hl = Math.hypot(.4, .9), ha = [0, .4 / hl, .9 / hl], hc = [g * SCS_HD.x, y - SCS_HD.dz, SCS_HD.dy];
              return [
              { name: 'car' + k, kind: 'obox', c: [g * rx, 0, top - 4], size: [6, 7, 16], mount: 'cs:rod' + k },
              { name: 'arm' + k, kind: 'beam', a: [g * rx, 0, top], b: [g * rx, y - SCS_HD.dz - 6, top], w: 5, h: 6, mount: 'car' + k },
              { name: 'pad' + k, kind: 'obox', c: pc, size: [14, 7, 17], axes: [ax, n, [0, 1, 0]], tone: 'pad', role: 'support', mount: 'padPlate' + k, round: 2 },
              { name: 'padPlate' + k, kind: 'obox', c: [pc[0] + n[0] * 4.4, y, pc[2] + n[2] * 4.4], size: [11, 2, 14], axes: [ax, n, [0, 1, 0]], mount: 'padArm' + k },
              { name: 'padArm' + k, kind: 'beam', a: [g * rx, y, top], b: [pc[0] + n[0] * 5.2, y, pc[2] + n[2] * 5.2], w: 4, h: 4, mount: 'arm' + k },
              { name: 'hDrop' + k, kind: 'beam', a: [g * SCS_HD.x, hc[1] + ha[1] * 9, top], b: [g * SCS_HD.x, hc[1] + ha[1] * 9, hc[2] + ha[2] * 9], w: 3.5, h: 3.5, mount: 'arm' + k },
              { name: 'handle' + k, kind: 'beam', a: [g * SCS_HD.x, hc[1] + ha[1] * 9, hc[2] + ha[2] * 9], b: [g * SCS_HD.x, hc[1] - ha[1] * 8, hc[2] - ha[2] * 8], r: 1.6, tone: 'rubber', role: 'grip', mount: 'hDrop' + k }
            ]; }),
            { name: 'cross', kind: 'beam', a: [-rx, 0, z + 12], b: [rx, 0, z + 12], w: 6, h: 6, mount: 'carL' }
          ] }];
    })(),
    contacts: [{ body: 'soleL', prop: 'cs:stepTop' }, { body: 'soleR', prop: 'cs:stepTop' }, { body: 'upperBack', prop: 'csSled:padL' }, { body: 'upperBack', prop: 'csSled:padR' },
      { body: 'gripL', prop: 'csSled:handleL' }, { body: 'gripR', prop: 'csSled:handleR' }],
    pose(t, C) {
      const { V } = C, L = SCS_L(), e = C.ease(t), q = scsPose(C, C.lerp(-6.5, 30, e), SCS_Z()), f = C.fk(q), gh = V.mix(f.P.ghL, f.P.ghR, .5);
      for (const s of S) {
        const lat = C.lat(q, s), g = [C.M.SIGN[s] * SCS_HD.x, gh[1] + SCS_HD.dy, gh[2] + SCS_HD.dz];
        C.grip(q, s, g, V.unit([0, .9, -.4]), V.unit(V.add(V.add([0, -1, 0], lat, .3), [0, 0, 1], .3)));
      }
      return q;
    }
  },

  /* Подъём на носки сидя: подушечки на краю ступени, упор рычага на бёдрах над коленями.
     t=0 — пятки опущены ниже ступени (растяжение), t=1 — подъём на носки до упора. */
  seatedcalf: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => {
      const L = SCF(), r = L.R, C0 = ctx([]), { V } = C0;
      /* ориентация подушки в рамке рычага по исходной позе: нормаль — вниз, на бёдра */
      const Y = V.unit([0, L.b0[1] - L.P[1], L.b0[2] - L.P[2]]), Z = V.cross([1, 0, 0], Y), down = [0, -1, 0];
      const nl = [0, V.dot(down, Y), V.dot(down, Z)], tl = [0, -nl[2], nl[1]];
      const at = (u, v) => [0, r + nl[1] * u + tl[1] * v, nl[2] * u + tl[2] * v];
      return [L.machine, { type: 'g4lever', id: 'scArm', pivot: L.P, axis: [1, 0, 0], mountTo: 'sc:axle', bind: { mix: ['knL', 'knR'], frame: 'thL', off: L.off },
        parts: [
          { name: 'pad', kind: 'obox', c: at(-3.5, 0), size: [44, 7, 16], axes: [[1, 0, 0], nl, tl], tone: 'pad', role: 'support', mount: 'padPlate', round: 2 },
          { name: 'padPlate', kind: 'obox', c: at(-8, 0), size: [40, 2, 13], axes: [[1, 0, 0], nl, tl], mount: 'crossbar' },
          { name: 'crossbar', kind: 'beam', a: [-29, ...at(-11, 0).slice(1)], b: [29, ...at(-11, 0).slice(1)], w: 6, h: 6, mount: 'armL' },
          ...[1, -1].flatMap(g => { const k = g > 0 ? 'L' : 'R', far = [0, r * .45, 0], A = at(-11, 0), H = at(SCF_H.u, SCF_H.v);
            const lam = Math.max(.3, Math.min(1, (A[1] * H[1] + A[2] * H[2]) / (A[1] * A[1] + A[2] * A[2]))), onArm = [0, A[1] * lam, A[2] * lam]; return [
            { name: 'arm' + k, kind: 'beam', a: [g * 29, 0, 0], b: [g * 29, ...at(-11, 0).slice(1)], w: 5, h: 7, up: [0, 0, 1], mount: 'hub' + k },
            { name: 'hub' + k, kind: 'cyl', c: [g * 29, 0, 0], axis: [1, 0, 0], r: 4.5, len: 6, mount: 'sc:axle' },
            { name: 'horn' + k, kind: 'cyl', c: [g * 42.5, ...at(-11, 0).slice(1)], axis: [1, 0, 0], r: 2.5, len: 21, tone: 'chrome', mount: 'arm' + k },
            { name: 'disc' + k, kind: 'cyl', c: [g * 42, ...at(-11, 0).slice(1)], axis: [1, 0, 0], r: 16, len: 3.2, tone: 'plate', mount: 'horn' + k, sides: 28 },
            { name: 'hPost' + k, kind: 'beam', a: [g * 29, ...onArm.slice(1)], b: [g * 29, ...H.slice(1)], w: 3, h: 3, up: [0, 0, 1], mount: 'arm' + k },
            { name: 'handle' + k, kind: 'beam', a: [g * 30.5, ...at(SCF_H.u, SCF_H.v).slice(1)], b: [g * 15, ...at(SCF_H.u, SCF_H.v).slice(1)], r: 1.6, tone: 'rubber', role: 'grip', mount: 'hPost' + k }
          ]; })
        ] }];
    })(),
    contacts: [{ body: 'buttocks', prop: 'sc:seat' }, { body: 'soleL', prop: 'sc:stepTop' }, { body: 'soleR', prop: 'sc:stepTop' }, { body: 'thL', prop: 'scArm:pad' }, { body: 'thR', prop: 'scArm:pad' },
      { body: 'gripL', prop: 'scArm:handleL' }, { body: 'gripR', prop: 'scArm:handleR' }],
    pose(t, C) {
      const { V } = C, L = SCF(), e = C.ease(t), q = L.legs(C.M.clone(L.q), C.lerp(L.H0, L.H1, e));
      /* рукояти на рычаге: точку хвата берём из текущего положения рычага */
      const R = C.M.catalogPose(q), b = C.EQ.bodyPoint(R, { mix: ['knL', 'knR'], frame: 'thL', off: L.off }), T = [b[0], C.M.FLOOR - b[1], b[2]];
      const Y = V.unit([0, T[1] - L.P[1], T[2] - L.P[2]]), Z = V.cross([1, 0, 0], Y);
      const Y0 = V.unit([0, L.b0[1] - L.P[1], L.b0[2] - L.P[2]]), Z0 = V.cross([1, 0, 0], Y0), down = [0, -1, 0];
      const nl = [V.dot(down, Y0), V.dot(down, Z0)], tl = [-nl[1], nl[0]];
      const loc = (u, v) => V.add(V.add(L.P, Y, L.R + nl[0] * u + tl[0] * v), Z, nl[1] * u + tl[1] * v);
      for (const s of S) {
        q[s].girdle = [0, 4];
        const a = loc(SCF_H.u, SCF_H.v), g = [C.M.SIGN[s] * SCF_H.x, a[1], a[2]], lat = C.lat(q, s);
        C.grip(q, s, g, V.scale(lat, -1), V.unit(V.add(V.add(lat, [0, -1, 0], .8), [0, 0, -1], .4)));
      }
      return q;
    }
  },

  /* Разведение ног в тренажёре: подушки снаружи коленей. t=0 — колени почти сведены, t=1 — разведены (~38°).
     Корпус неподвижен, спина у спинки, руки на рукоятях. */
  abduction: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = HA(); return [L.machine, haLever(L, 'L', 'out'), haLever(L, 'R', 'out')]; })(),
    contacts: [{ body: 'buttocks', prop: 'ha:seat' }, { body: 'back', prop: 'ha:back' }, { body: 'kneeL', prop: 'haL:pad' }, { body: 'kneeR', prop: 'haR:pad' },
      { body: 'soleL', prop: 'haL:peg' }, { body: 'soleR', prop: 'haR:peg' }, { body: 'gripL', prop: 'ha:handleL' }, { body: 'gripR', prop: 'ha:handleR' }],
    pose(t, C) { return haPose(C, C.lerp(2, 38, C.ease(t))); }
  },

  /* Сведение ног в тренажёре: подушки с внутренней стороны коленей. t=0 — ноги разведены до растяжения (~36°),
     t=1 — колени сведены до касания подушек. */
  adduction: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = HA(); return [L.machine, haLever(L, 'L', 'in'), haLever(L, 'R', 'in')]; })(),
    contacts: [{ body: 'buttocks', prop: 'ha:seat' }, { body: 'back', prop: 'ha:back' }, { body: 'kneeL', prop: 'haL:pad' }, { body: 'kneeR', prop: 'haR:pad' },
      { body: 'soleL', prop: 'haL:peg' }, { body: 'soleR', prop: 'haR:peg' }, { body: 'gripL', prop: 'ha:handleL' }, { body: 'gripR', prop: 'ha:handleR' }],
    pose(t, C) { return haPose(C, C.lerp(36, 12, C.ease(t))); }
  },

  /* Рычажная тяга к поясу с упором грудью: t=0 — руки вытянуты вперёд, лопатки разведены; t=1 — кисти у пояса,
     локти назад вдоль корпуса, лопатки сведены. Грудь не отрывается от упора. */
  leverrowm: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = LRM(); return [L.machine, ...S.map(s => handleLever('lr', s, [C_SIGN[s] * L.P[0], L.P[1], L.P[2]], [C_SIGN[s] * L.hx, ...arcPt(L.P, L.R, L.th0, 0).slice(1)], 'rt', 'lr:hub' + s, LRM_T.beta))]; })(),
    contacts: [{ body: 'buttocks', prop: 'lr:seat' }, { body: 'chest', prop: 'lr:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' },
      { body: 'gripL', prop: 'lrL:handle' }, { body: 'gripR', prop: 'lrR:handle' }],
    pose(t, C) {
      const { V } = C, L = LRM(), e = C.ease(t), q = C.M.clone(L.q), th = C.lerp(L.th0, L.th1, e);
      for (const s of S) {
        q[s].girdle = [C.lerp(-2, 2, e), C.lerp(14, -16, e)];
        const lat = C.lat(q, s), g = arcPt(L.P, L.R, th, C.M.SIGN[s] * L.hx);
        C.grip(q, s, g, leverThumb(L.P, g, LRM_T.beta), V.unit(V.add(V.add(V.scale(lat, C.lerp(.6, .3, e)), [0, -1, 0], C.lerp(1, .4, e)), [0, 0, -1], C.lerp(0, 1, e))));
      }
      return q;
    }
  },

  /* Жим сидя в тренажёре: t=0 — рукояти на уровне ушей, t=1 — руки почти выпрямлены вверх.
     Поясница прижата к спинке, рычаги ходят по дуге вокруг осей позади спинки. */
  shoulderpressm: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = SPM(); return [L.machine, ...S.map(s => handleLever('sp', s, [C_SIGN[s] * L.P[0], L.P[1], L.P[2]], [C_SIGN[s] * L.hx, ...arcPt(L.P, L.R, L.th0, 0).slice(1)], 'x', 'sp:hub' + s))]; })(),
    contacts: [{ body: 'buttocks', prop: 'sp:seat' }, { body: 'back', prop: 'sp:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' },
      { body: 'gripL', prop: 'spL:handle' }, { body: 'gripR', prop: 'spR:handle' }],
    pose(t, C) {
      const { V } = C, L = SPM(), e = C.ease(t), q = C.M.clone(L.q), th = C.lerp(L.th0, L.th1, e);
      for (const s of S) {
        q[s].girdle = [C.lerp(4, 9, e), C.lerp(0, 3, e)];
        const lat = C.lat(q, s), g = arcPt(L.P, L.R, th, C.M.SIGN[s] * L.hx);
        const pole = V.unit(V.add(V.add(V.scale(lat, C.lerp(.5, 1, e)), [0, -1, 0], C.lerp(1, .3, e)), [0, 0, 1], C.lerp(.6, .3, e)));
        C.grip(q, s, g, V.scale(lat, -1), pole, { wristExt: C.lerp(10, 2, e) });
      }
      return q;
    }
  },

  /* Жим от груди в тренажёре: t=0 — рукояти у груди, локти чуть за линией корпуса; t=1 — руки почти выпрямлены.
     Лопатки и поясница прижаты к спинке. Рычаги идут по дуге вокруг верхних осей. */
  chestpressm: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = CPM(); return [L.machine, ...S.map(s => handleLever('cp', s, [C_SIGN[s] * L.P[0], L.P[1], L.P[2]], [C_SIGN[s] * L.hx, ...arcPt(L.P, L.R, L.th0, 0).slice(1)], 'r', 'cp:hub' + s))]; })(),
    contacts: [{ body: 'buttocks', prop: 'cp:seat' }, { body: 'back', prop: 'cp:pad' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' },
      { body: 'gripL', prop: 'cpL:handle' }, { body: 'gripR', prop: 'cpR:handle' }],
    pose(t, C) {
      const { V } = C, L = CPM(), e = C.ease(t), q = C.M.clone(L.q), th = C.lerp(L.th0, L.th1, e);
      for (const s of S) {
        q[s].girdle = [C.lerp(0, 3, e), C.lerp(-8, 6, e)];
        const lat = C.lat(q, s), g = arcPt(L.P, L.R, th, C.M.SIGN[s] * L.hx);
        C.grip(q, s, g, V.unit(V.sub([C.M.SIGN[s] * L.hx, L.P[1], L.P[2]], g)), V.unit(V.add(V.add(lat, [0, 0, -1], C.lerp(.6, .2, e)), [0, -1, 0], C.lerp(.5, 1, e))), { wristExt: 8 });
      }
      return q;
    }
  },

  /* Подъём коленей в упоре на локтях («капитанский стул»): t=0 — ноги свисают (стопы над полом), t=1 — колени у груди,
     таз подкручен. Спина у спинки, предплечья на упорах, кисти на рукоятях. */
  captainraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [CAP().machine],
    contacts: [{ body: 'upperBack', prop: 'cc:back' }, { body: 'faL', prop: 'cc:armL' }, { body: 'faR', prop: 'cc:armR' }, { body: 'gripL', prop: 'cc:handleL' }, { body: 'gripR', prop: 'cc:handleR' }],
    pose(t, C) {
      const { V } = C, L = CAP(), e = C.ease(t), q = C.base(), fl = C.lerp(0, 26, e), a = -fl * .85 * D2R;
      C.root(q, [0, 110, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
      q.lumbar = [fl * .7, 0, 0]; q.thoracic = [fl * .15, 0, 0]; q.neck = [C.lerp(0, 6, e), 0, 0];
      for (const s of S) { q[s].girdle = [14, 0]; q[s].hip = [C.lerp(6, 100, e), 5, 5]; q[s].knee = C.lerp(10, 112, e); q[s].ankle = [C.lerp(-20, -10, e), 0]; }
      C.rootAtShoulders(q, [0, L.padY + 3.9 + C.M.B.ua, L.ez]);
      const dz = L.backZ - (Math.min(...C.region(q, 'upperBack').map(p => p[2])) + 1.0);
      q.root.p = V.add(q.root.p, [0, 0, dz]);
      for (const s of S) {
        const lat = C.lat(q, s), m = L.machine.handle;
        C.grip(q, s, [C.M.SIGN[s] * m.x, m.y, m.z], [0, 1, 0], V.unit(V.add([0, -1, 0], [0, 0, -1], .2)));
      }
      return q;
    }
  },

  /* Подтягивания в гравитроне: колени на платформе-противовесе, хват сверху чуть шире плеч.
     t=0 — вис на почти прямых руках, t=1 — подбородок над рукоятями; платформа поднимается вместе с коленями. */
  assistpull: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: GV_EQ(),
    contacts: [{ body: 'kneeL', prop: 'gvPad:pad' }, { body: 'kneeR', prop: 'gvPad:pad' }, { body: 'gripL', prop: 'gv:pullL' }, { body: 'gripR', prop: 'gv:pullR' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), g = GV.pull;
      const body = phi => gvKneel(C, phi, { thigh: C.lerp(2, 6, e), lean: C.lerp(0, -6, e), lumbar: -2, thor: C.lerp(0, -8, e), neck: C.lerp(0, -12, e) });
      const shY = phi => { const f = C.fk(body(phi)); return (f.P.ghL[1] + f.P.ghR[1]) / 2; };
      const target = C.lerp(g.y - 62.6, g.y - 16, e), phi = C.solve1D(p => shY(p) - target, -40 * D2R, 40 * D2R);
      const q = body(phi);
      for (const s of S) {
        q[s].girdle = [C.lerp(18, -6, e), C.lerp(4, -10, e)];
        const lat = C.lat(q, s);
        C.grip(q, s, [C.M.SIGN[s] * 30, g.y, g.z], V.scale(lat, -1), V.unit(V.add(V.add([0, -1, 0], lat, 1), [0, 0, 1], .2)));
      }
      return q;
    }
  },

  /* Отжимания на брусьях в гравитроне (eccFirst): t=0 — упор на прямых руках, t=1 — локти ~90° назад.
     Колени на платформе, корпус слегка наклонён вперёд. */
  assistdip: {
    keys: [0, .25, .5, .75, 1],
    equipment: GV_EQ(),
    contacts: [{ body: 'kneeL', prop: 'gvPad:pad' }, { body: 'kneeR', prop: 'gvPad:pad' }, { body: 'gripL', prop: 'gv:dipL' }, { body: 'gripR', prop: 'gv:dipR' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), d = GV.dip;
      const body = phi => gvKneel(C, phi, { thigh: C.lerp(-2, -10, e), lean: C.lerp(6, 22, e), lumbar: 2, thor: C.lerp(2, 6, e), neck: C.lerp(-6, -14, e) });
      const shY = phi => { const f = C.fk(body(phi)); return (f.P.ghL[1] + f.P.ghR[1]) / 2; };
      const target = C.lerp(d.y + 60, d.y + 34, e), phi = C.solve1D(p => shY(p) - target, -40 * D2R, 40 * D2R);
      const q = body(phi), gz = GV_DIPZ();
      for (const s of S) {
        q[s].girdle = [C.lerp(-6, 6, e), C.lerp(4, -6, e)];
        const lat = C.lat(q, s);
        C.grip(q, s, [C.M.SIGN[s] * d.x, d.y, gz], [0, 0, 1], V.unit(V.add(V.add([0, 0, -1], lat, .25), [0, 1, 0], .2)));
      }
      return q;
    }
  },

  /* Отжимания на брусьях (eccFirst): t=0 — упор на прямых руках, t=1 — плечо параллельно полу, локти ~90° и назад.
     Корпус слегка наклонён вперёд, колени согнуты, стопы позади и далеко от пола. */
  dip: {
    keys: [0, .25, .5, .75, 1],
    equipment: [DIP],
    contacts: [{ body: 'gripL', prop: 'dp:barL' }, { body: 'gripR', prop: 'dp:barR' }],
    pose(t, C) {
      const e = C.ease(t);
      return dipPose(C, { lean: C.lerp(12, 30, e), sh: C.lerp(60.5, 34, e), hip: C.lerp(16, 26, e), knee: C.lerp(70, 80, e), lumbar: 2, thor: C.lerp(2, 6, e), neck: C.lerp(-8, -16, e), girdle: [C.lerp(-6, 6, e), C.lerp(4, -6, e)] });
    }
  },

  /* Подтягивания обратным хватом на ширине плеч: t=0 — вис на прямых руках, t=1 — подбородок над перекладиной,
     локти внизу перед корпусом. Ноги слегка согнуты, стопы далеко от пола. */
  chinup: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [RACK],
    contacts: [{ body: 'gripL', prop: 'rack:pullBar' }, { body: 'gripR', prop: 'rack:pullBar' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base();
      C.root(q, [0, 100, BAR[2] - 2], [0, 1, 0], [0, 0, 1]);
      tiltBack(C, q, 4 * Math.sin(Math.PI * e), 1);
      q.thoracic = [C.lerp(0, -8, e), 0, 0]; q.lumbar = [C.lerp(-2, -3, e), 0, 0]; q.neck = [C.lerp(0, -6, e), 0, 0];
      for (const s of S) { q[s].hip = [C.lerp(14, 22, e), 3, 4]; q[s].knee = C.lerp(48, 56, e); q[s].ankle = [-28, 0]; q[s].girdle = [C.lerp(24, -6, e), C.lerp(6, -8, e)]; }
      const y = C.lerp(BAR[1] - 61.5, BAR[1] - 16, e), z = BAR[2] + C.lerp(-1, -7, e) - 7 * Math.sin(Math.PI * e);
      C.rootAtShoulders(q, [0, y, z]);
      for (const s of S) {
        const lat = C.lat(q, s);
        C.grip(q, s, V.add(BAR, lat, 16.5), lat, V.unit(V.add(V.add([0, 0, 1], lat, C.lerp(-.2, 0, e)), [0, -1, 0], e)));
      }
      return q;
    }
  },

  /* Вис на турнике хватом сверху (удержание): активный вис — лопатки опущены, корпус ровный, стопы над полом. */
  hang: {
    keys: [0, 1],
    equipment: [RACK],
    contacts: [{ body: 'gripL', prop: 'rack:pullBar' }, { body: 'gripR', prop: 'rack:pullBar' }],
    pose(t, C) {
      const q = C.base();
      C.root(q, [0, 100, BAR[2] - 2], [0, 1, 0], [0, 0, 1]);
      q.lumbar = [-2, 0, 0]; q.neck = [-2, 0, 0];
      for (const s of S) { q[s].hip = [6, 3, 4]; q[s].knee = 14; q[s].ankle = [-25, 0]; q[s].girdle = [10, 2]; }
      return hangPose(C, q, { face: 1, grip: 'over', w: 29, drop: 62.2 });
    }
  },

  /* Подъём ног в висе: лицом от рамы, ноги почти прямые поднимаются до горизонтали с подкручиванием таза.
     t=0 — вис, t=1 — ноги на уровне таза. Корпус отклоняется назад так, чтобы центр масс оставался под перекладиной. */
  legraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [RACK],
    contacts: [{ body: 'gripL', prop: 'rack:pullBar' }, { body: 'gripR', prop: 'rack:pullBar' }],
    pose(t, C) {
      const e = C.ease(t), q = C.base();
      C.root(q, [0, 100, BAR[2]], [0, 1, 0], [0, 0, -1]);
      tiltBack(C, q, C.lerp(0, 32, e), -1);
      q.lumbar = [C.lerp(-2, 20, e), 0, 0]; q.thoracic = [C.lerp(0, 10, e), 0, 0]; q.neck = [C.lerp(-2, 8, e), 0, 0];
      for (const s of S) { q[s].hip = [C.lerp(4, 62, e), 3, 3]; q[s].knee = C.lerp(8, 10, e); q[s].ankle = [C.lerp(-25, -20, e), 0]; q[s].girdle = [C.lerp(10, 16, e), 4]; }
      return hangPose(C, q, { face: -1, grip: 'over', w: 29, drop: 62 });
    }
  },

  /* Подъём коленей в висе: колени к груди, таз подкручен. t=0 — вис, t=1 — колени у груди. */
  hangknee: {
    keys: [0, .25, .5, .75, 1],
    equipment: [RACK],
    contacts: [{ body: 'gripL', prop: 'rack:pullBar' }, { body: 'gripR', prop: 'rack:pullBar' }],
    pose(t, C) {
      const e = C.ease(t), q = C.base();
      C.root(q, [0, 100, BAR[2]], [0, 1, 0], [0, 0, -1]);
      tiltBack(C, q, C.lerp(0, 42, e), -1);
      q.lumbar = [C.lerp(-2, 24, e), 0, 0]; q.thoracic = [C.lerp(0, 12, e), 0, 0]; q.neck = [C.lerp(-2, 10, e), 0, 0];
      for (const s of S) { q[s].hip = [C.lerp(6, 92, e), 4, 4]; q[s].knee = C.lerp(14, 112, e); q[s].ankle = [C.lerp(-25, -15, e), 0]; q[s].girdle = [C.lerp(10, 16, e), 4]; }
      return hangPose(C, q, { face: -1, grip: 'over', w: 29, drop: 62 });
    }
  },

  /* Подъём на носки в тренажёре для жима ногами: подушечки стоп на нижнем крае платформы, колени почти прямые (~8°),
     работает голеностоп. t=0 — пятки опущены ниже края (растяжение), t=1 — платформа выжата носками. */
  lpcalf: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => { const L = LP(); return [L.machine, { type: 'g4sled', id: 'sled', rail: [V3(L.R0, L.d, -10), V3(L.R0, L.d, 186)], up: L.nu, bind: { mix: ['ballL', 'ballR'] }, mountTo: 'lp:railL', parts: lpSled(L, 26, LPC_H) }]; })(),
    contacts: [{ body: 'buttocks', prop: 'lp:seat' }, { body: 'back', prop: 'lp:back' }, { body: 'soleL', prop: 'sled:plate' }, { body: 'soleR', prop: 'sled:plate' },
      { body: 'gripL', prop: 'lp:handleL' }, { body: 'gripR', prop: 'lp:handleR' }],
    pose(t, C) {
      const { V } = C, L = LP(), e = C.ease(t), q = C.M.clone(L.q), heel = C.lerp(-12, 30, e);
      for (const s of S) {
        const sup = sp => V.add(V.add(V.add(L.H, L.d, sp), L.nu, LPC_H), C.latP(q, s), 12);
        const sp = C.solve1D(x => { lpFoot(C, q, L, s, sup(x), heel, true); return q[s].knee - 8; }, 60, 110);
        lpFoot(C, q, L, s, sup(sp), heel);
      }
      for (const s of S) {
        q[s].girdle = [-2, -4];
        const m = L.machine.handle, g = [C.M.SIGN[s] * m.x, m.y, m.z], lat = C.lat(q, s), T = C.axes(q);
        C.grip(q, s, g, [0, ...m.ax], V.unit(V.add(V.add(V.scale(lat, .5), T.z, -1), T.y, -.5)));
      }
      return q;
    }
  },

  /* Жим ногами 45° (eccFirst): t=0 — верх, колени не выпрямлены до конца (~18°); t=1 — низ, колени ~90°.
     Стопы на ширине плеч, носки чуть наружу, колени по линии носков; спина и таз прижаты, руки на рукоятях. */
  /* Положение платформы вверху и внизу — по углу в колене: 20° (колени не выпрямлены до конца) и 88°. */
  legpress: lpFeetSpec(0, 20, 88),

  /* Жим ногами со стопами выше и ниже на той же платформе: стопы сдвинуты вдоль платформы, ширина и разворот те же.
     Положение платформы в верхней и нижней точке подбирается по углу в колене. Стопы высоко — колено сгибается
     меньше, бедро больше; глубину ограничивает сгибание бедра (таз не должен отрываться от сиденья), а вверху
     колени остаются чуть согнутыми — иначе натягивается задняя поверхность бедра. Стопы низко — колено сгибается
     больше, голень наклоняется к платформе; глубину ограничивает голеностоп (пятки не отрываются). */
  legpresshigh: lpFeetSpec(9, 30, 80),
  legpresslow: lpFeetSpec(-10, 18, 96),

  /* Гиперэкстензия 45°: упор чуть ниже паховой складки, валики за голенями, руки скрещены на груди.
     t=0 — тело прямой линией (без переразгибания), t=1 — нижняя точка наклона. */
  hyper: {
    keys: [0, .25, .5, .75, 1],
    equipment: [HY().machine],
    contacts: [{ body: 'soleL', prop: 'hy:plate' }, { body: 'soleR', prop: 'hy:plate' }, { body: 'thL', prop: 'hy:pad' }, { body: 'thR', prop: 'hy:pad' },
      { body: 'skL', prop: 'hy:rollL' }, { body: 'skR', prop: 'hy:rollR' }],
    pose(t, C) {
      const { V, M } = C, L = HY(), e = C.ease(t), q = C.M.clone(L.q), ph = C.lerp(0, 70, e) * C.D2R;
      const up = V.add(V.scale(L.d, Math.cos(ph)), L.n, Math.sin(ph)), fwd = V.add(V.scale(L.n, Math.cos(ph)), L.d, -Math.sin(ph));
      C.root(q, L.H, up, fwd);
      q.lumbar = [C.lerp(-1, 13, e), 0, 0]; q.thoracic = [C.lerp(0, 8, e), 0, 0]; q.neck = [C.lerp(-8, 12, e), 0, 0];
      L.feet.forEach((ft, i) => { const s = S[i]; M.solveLeg(q, s, ft, V.unit(V.add(L.n, C.latP(q, s), .1))); });
      /* руки скрещены на груди: кисти у противоположных плеч, правое предплечье поверх левого */
      for (const s of S) q[s].girdle = [0, 10];
      const T = C.axes(q, 'thorax');
      const wr = { L: V.add(V.add(V.add(T.o, T.x, -7), T.y, 16.2), T.z, 15.5), R: V.add(V.add(V.add(T.o, T.x, 7), T.y, 10), T.z, 22.5) };
      for (const s of S) C.armTo(q, s, wr[s], V.unit(V.add(V.scale(T.y, -1), T.x, M.SIGN[s] * 1.1)), { pron: 60, mode: 'relaxed' });
      return q;
    }
  },

  /* Сгибание ног лёжа. t=0 — ноги почти прямые, валик над пятками; t=1 — пятки подтянуты к ягодицам (~125°). */
  legcurl: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: (() => {
      const L = LC(), r = L.rR, ax = -L.hubX;
      return [L.machine, { type: 'g4lever', id: 'lcArm', pivot: [L.hubX, L.K[1], L.K[2]], axis: [1, 0, 0], mountTo: 'lc:hub',
        bind: { mix: ['anL', 'anR'], frame: 'skL', off: L.off },
        parts: [
          { name: 'arm', kind: 'beam', a: [-1, -4, 0], b: [-1, r + 3, 0], w: 4, h: 7, up: [0, 0, 1] },
          { name: 'bar', kind: 'beam', a: [-1, r, 0], b: [ax + 16, r, 0], r: 1.6, mount: 'arm', tone: 'chrome' },
          { name: 'roller', kind: 'cyl', c: [ax, r, 0], axis: [1, 0, 0], r: 5.5, len: 36, mount: 'bar', tone: 'pad', role: 'pad' }
        ] }];
    })(),
    contacts: [{ body: 'thL', prop: 'lc:thighPad' }, { body: 'thR', prop: 'lc:thighPad' }, { body: 'chest', prop: 'lc:chestPad' },
      { body: 'skL', prop: 'lcArm:roller' }, { body: 'skR', prop: 'lcArm:roller' }, { body: 'gripL', prop: 'lc:handleL' }, { body: 'gripR', prop: 'lc:handleR' }],
    pose(t, C) {
      const { V } = C, L = LC(), e = C.ease(t), q = C.M.clone(L.q);
      for (const s of S) { q[s].knee = C.lerp(6, 124, e); q[s].ankle = [C.lerp(6, 2, e), 0]; q[s].girdle = [0, 8]; }
      for (const s of S) {
        const m = L.machine.handle, g = [C.M.SIGN[s] * m.x, m.y, m.z], lat = C.lat(q, s);
        C.grip(q, s, g, V.unit([0, ...m.ax]), V.unit(V.add([0, 0, -1], lat, .3)));
      }
      return q;
    }
  },
  /* Разгибание ног сидя. t=0 — колени согнуты ~85°, валик на нижней трети голеней; t=1 — ноги почти прямые. */
  legext: {
    keys: [0, .25, .5, .75, 1],
    equipment: (() => {
      const L = LX(), r = L.rR, ax = -L.hubX;
      return [L.machine, { type: 'g4lever', id: 'lxArm', pivot: [L.hubX, L.K[1], L.K[2]], axis: [1, 0, 0], mountTo: 'lx:hub',
        bind: { mix: ['anL', 'anR'], frame: 'skL', off: L.off },
        parts: [
          { name: 'arm', kind: 'beam', a: [-1, -4, 0], b: [-1, r + 3, 0], w: 4, h: 7, up: [0, 0, 1] },
          { name: 'bar', kind: 'beam', a: [-1, r, 0], b: [ax + 16, r, 0], r: 1.6, mount: 'arm', tone: 'chrome' },
          { name: 'roller', kind: 'cyl', c: [ax, r, 0], axis: [1, 0, 0], r: 5.5, len: 36, mount: 'bar', tone: 'pad', role: 'pad' }
        ] }];
    })(),
    contacts: [{ body: 'buttocks', prop: 'lx:seat' }, { body: 'back', prop: 'lx:back' }, { body: 'shinL', prop: 'lxArm:roller' }, { body: 'shinR', prop: 'lxArm:roller' },
      { body: 'gripL', prop: 'lx:handleL' }, { body: 'gripR', prop: 'lx:handleR' }],
    pose(t, C) {
      const { V } = C, L = LX(), e = C.ease(t), q = C.M.clone(L.q);
      for (const s of S) { q[s].knee = C.lerp(85, 9, e); q[s].ankle = [C.lerp(4, 10, e), 0]; q[s].girdle = [-2, -4]; }
      for (const s of S) {
        const m = L.machine.handle, g = [C.M.SIGN[s] * m.x, m.y, m.z + 5], lat = C.lat(q, s);
        C.grip(q, s, g, [0, 0, 1], V.unit(V.add(V.add(lat, [0, 0, -1], .25), [0, -1, 0], .1)));
      }
      return q;
    }
  }
};
