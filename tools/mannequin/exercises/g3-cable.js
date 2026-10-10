'use strict';
/* Группа G3: блочные тренажёры и эспандеры. Ось Z — направление взгляда (тело смотрит в +Z), X — поперёк, Y — вверх, см.
   Тренажёры — src/js/09bo-g3-cable.js: блочная колонна (g3Tower), кроссовер (g3Crossover), тяга верхнего блока
   (g3LatPulldown), тяга горизонтального блока (g3SeatedRow), дверь с креплением ленты (g3Door).
   Трос (BIND.g3cable) идёт от колеса блока к рукояти; положение блока выбрано так, чтобы трос проходил мимо тела.
   rest — длина троса (центр колеса — рукоять) в исходном положении: от неё считается подъём плит стека. */
const { ctx } = require('../compose.js');
const EQ = require('../../../src/js/09bn-equipment.js');
const S = ['L', 'R'];
const once = f => { let v; return () => v ?? (v = f()); };
const r1 = v => Math.round(v * 10) / 10;
const rp = p => p.map(r1);

/* Трос на блоке снаряда: колесо, ось поворота кронштейна, стек грузов (anchors снаряда; pre — префикс колонны кроссовера) */
function cable(eq, pre, opts) {
  const A = EQ.anchors([eq])[eq.id], st = A[pre + 'stack'], info = A[pre + 'stackInfo'];
  return {
    type: 'g3cable', from: rp(A[pre + 'pulley']), swivel: rp(A[pre + 'swivelPt']), swivelPart: eq.id + ':' + pre + 'swivel', rodPart: eq.id + ':' + info.rod,
    stack: { o: rp(st.o), R: st.R.map(v => Math.round(v * 1e4) / 1e4), sel: info.sel, pitch: info.pitch, size: info.size, topY: r1(info.topY), maxLift: r1(info.maxLift) },
    ratio: .5, ...opts
  };
}
const pulleyOf = (eq, pre = '') => EQ.anchors([eq])[eq.id][pre + 'pulley'];

/* Стойка: таз в точке root, наклон корпуса вперёд lean (град, в тазобедренных), разворот yaw (0 — взгляд в +Z).
   feet: {L: [x, z, yawDeg], R: …} — точка под подушечкой стопы и разворот носка. */
function stand(C, q, { root, lean = 0, yaw = 0, feet, heel = {} }) {
  const { V } = C, a = lean * C.D2R, y = yaw * C.D2R, F = [Math.sin(y), 0, Math.cos(y)];
  C.root(q, root, V.add(V.scale([0, 1, 0], Math.cos(a)), F, Math.sin(a)), V.add(V.scale([0, 1, 0], -Math.sin(a)), F, Math.cos(a)));
  placeFeet(C, q, feet, heel);
  return q;
}
function placeFeet(C, q, feet, heel = {}) {
  const { V } = C;
  for (const s of S) {
    const [x, z, yd, h = heel[s] || 0] = feet[s], d = [Math.sin(yd * C.D2R), 0, Math.cos(yd * C.D2R)];
    const pole = V.unit(V.add(d, C.latP(q, s), .12));
    C.foot(q, s, [x, 0, z], 0, pole, { forward: d, heel: h });
  }
}
/* Центр масс над серединой стоп: сдвиг таза по горизонтали (стопы остаются на месте) */
function balance(C, q, feet, { shift = [0, 0], resolve } = {}) {
  const tx = (feet.L[0] + feet.R[0]) / 2 + shift[0], tz = (feet.L[1] + feet.R[1]) / 2 - 7 + shift[1];
  C.balanceOver(q, [tx, 0, tz], { resolve: resolve || (qq => placeFeet(C, qq, feet)) });
  return q;
}
/* Колено на опоре, пальцы подогнуты: подушечки и пальцы на опоре, стопа почти вертикальна (носок вперёд на gamma) */
function kneelTucked(C, q, s, contact, gamma = 14, floorY = contact[1]) {
  const { V, M } = C, K = V.add(contact, [0, 5.4, 0]), g = gamma * C.D2R;
  const y = [0, Math.sin(g), Math.cos(g)], z = [0, -Math.cos(g), Math.sin(g)], R = M.M3.cols(V.cross(y, z), y, z);
  const ankle = zs => V.sub(V.add([contact[0], floorY, zs], [0, 2, 0]), M.M3.v(R, M.B.ball));
  const zs = C.solve1D(zz => V.dist(ankle(zz), K) - M.B.sk, contact[2] - 70, contact[2] - 15);
  const r = M.solveLeg(q, s, { o: ankle(zs), R, toesR: M.M3.I() }, [0, -1, 0]);
  if (r.reachError > .1) throw Error('kneelTucked: reach ' + r.reachError.toFixed(1));
  return zs;
}
/* Повернуть готовую позу целиком вокруг вертикали через начало координат (поза строится лицом к +Z, затем разворачивается) */
function turn(C, q, deg) {
  const { M } = C, R = M.M3.ry(deg);
  q.root.p = M.M3.v(R, q.root.p); q.root.q = M.Q.fromM3(M.M3.mul(R, M.Q.toM3(q.root.q)));
  return q;
}
/* Центр хвата по положению локтя и направлению предплечья: запястье на 27 см, центр хвата на 8 см дальше и 2,6 см в сторону ладони */
function gripFrom(C, el, fore, palm) { const { V } = C; return V.add(V.add(el, fore, 27 + 8), palm, 2.6); }
/* Хват жёсткой рукояти с заданным положением локтя: цель хвата уточняется, пока локоть не встанет на место */
function gripAtElbow(C, q, s, el, fore, palm, thumb, pole, opts = {}) {
  const { V } = C;
  let g = gripFrom(C, el, fore, palm);
  for (let i = 0; i < 4; i++) {
    C.grip(q, s, g, thumb, pole, opts);
    const d = V.sub(el, C.fk(q).P['el' + s]);
    if (V.len(d) < .15) break;
    g = V.add(g, d);
  }
  return g;
}

/* ---------- Разгибание рук на верхнем блоке (прямая рукоять) ---------- */
const PD_TOWER = { type: 'g3Tower', id: 'col', h: 196, at: [0, 0, 70], yaw: 180 };
const PD_FEET = { L: [11, 15, 8], R: [-11, 15, -8] };
const PD = once(() => {
  const C = ctx([PD_TOWER]), q = C.base();
  stand(C, q, { root: [0, 87.6, 0], lean: 12, feet: PD_FEET });
  q.lumbar = [-2, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-6, 0, 0];
  for (const s of S) { q[s].girdle = [-2, 2]; q[s].shoulder = [-4, 8, 0]; q[s].elbow = 60; }
  balance(C, q, PD_FEET, { shift: [0, 2] });
  return { q };
});

/* ---------- Сгибание рук на нижнем блоке ---------- */
const CC_TOWER = { type: 'g3Tower', id: 'col', h: 20, at: [0, 0, 78], yaw: 180 };
const CC_FEET = { L: [11, 14, 8], R: [-11, 14, -8] };
const CC = once(() => {
  const C = ctx([CC_TOWER]), q = C.base();
  stand(C, q, { root: [0, 88.1, 0], lean: 3, feet: CC_FEET });
  q.lumbar = [-3, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [6, 0, 0];
  for (const s of S) { q[s].girdle = [-2, -2]; q[s].shoulder = [4, 8, 0]; q[s].elbow = 60; }
  balance(C, q, CC_FEET, { shift: [0, 0] });
  return { q };
});
/* ---------- Тяга каната к лицу ---------- */
const FP_TOWER = { type: 'g3Tower', id: 'col', h: 166, at: [0, 0, 128], yaw: 180 };
const FP_FEET = { L: [13, 12, 8], R: [-13, 12, -8] };
const FP = once(() => {
  const C = ctx([FP_TOWER]), q = C.base();
  stand(C, q, { root: [0, 88.1, 0], lean: 2, feet: FP_FEET });
  q.lumbar = [-2, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [0, 0, 0];
  balance(C, q, FP_FEET, { shift: [0, 1] });
  return { q };
});
/* направление между двумя единичными векторами (сферическая интерполяция) */
function slerpDir(V, a, b, t) { const d = Math.max(-1, Math.min(1, V.dot(a, b))), th = Math.acos(d); if (th < 1e-4) return a; const s = Math.sin(th); return V.add(V.scale(a, Math.sin((1 - t) * th) / s), b, Math.sin(t * th) / s); }
/* ---------- Пуловер на блоке прямыми руками ---------- */
const SP_TOWER = { type: 'g3Tower', id: 'col', h: 200, at: [0, 0, 135], yaw: 180 };
const SP_FEET = { L: [13, 16, 8], R: [-13, 16, -8] };
const SP = once(() => {
  const C = ctx([SP_TOWER]), q = C.base();
  stand(C, q, { root: [0, 87.6, 0], lean: 21, feet: SP_FEET });
  q.lumbar = [-4, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-14, 0, 0];
  balance(C, q, SP_FEET, { shift: [0, 3] });
  return { q };
});

/* ---------- Отведение руки на нижнем блоке: колонна слева, работает правая рука ---------- */
const CL_TOWER = { type: 'g3Tower', id: 'col', h: 20, at: [66, 0, 18], yaw: -90 };
const CL_FEET = { L: [12, 13, 6], R: [-12, 13, -6] };
const CL = once(() => {
  const C = ctx([CL_TOWER]), q = C.base();
  stand(C, q, { root: [0, 88.5, 0], lean: 2, feet: CL_FEET });
  q.lumbar = [-2, 0, 0]; q.neck = [2, 0, -6];
  balance(C, q, CL_FEET);
  return { q };
});
/* ---------- Скручивания на блоке стоя на коленях ---------- */
const CR_TOWER = { type: 'g3Tower', id: 'col', h: 202, at: [0, 0, 96], yaw: 180 };
const CR_MAT = { type: 'g3Pad', id: 'mat', size: [48, 4.5, 30], at: [0, 0, -4] };
const CR = once(() => {
  const C = ctx([CR_TOWER, CR_MAT]), { V } = C, q = C.base(), a = 30 * C.D2R, b = 20 * C.D2R;
  C.root(q, [0, 50, 0], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  const K = s => [C.M.SIGN[s] * 10.5, 4.5 + 5.4, 0];
  C.rootAtHip(q, 'L', V.add(K('L'), [-1.7, Math.cos(b) * (C.M.B.th - .04), -Math.sin(b) * (C.M.B.th - .04)]));
  for (const s of S) kneelTucked(C, q, s, [C.M.SIGN[s] * 10.5, 4.5, 0], 10.5, 0);
  return { q };
});
/* ---------- Отведение ноги назад на нижнем блоке (работает левая нога; руки на ручках колонны) ---------- */
function kickLayout({ lean, tower, footR, root, kneeR }) {
  const C = ctx([tower]), { V } = C, q = C.base(), a = lean * C.D2R;
  C.root(q, root, [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [-4, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-18, 0, 0];
  C.foot(q, 'R', footR, 0, V.unit([-.1, 0, 1]), { forward: V.unit([-.1, 0, 1]) });
  return { q, C };
}
const GK_TOWER = { type: 'g3Tower', id: 'col', h: 20, at: [4, 0, 96], yaw: 180 };
const KB_TOWER = { type: 'g3Tower', id: 'col', h: 20, at: [4, 0, 88], yaw: 180 };
/* ---------- Разгибание рук с канатом из-за головы: спиной к блоку, блок выше головы ---------- */
const OH_TOWER = { type: 'g3Tower', id: 'col', h: 186, at: [0, 0, -118], yaw: 0 };
const OH_FEET = { L: [12, 40, 6], R: [-12, -22, -6, 18] };
const OH = once(() => {
  const C = ctx([OH_TOWER]), q = C.base();
  stand(C, q, { root: [0, 84.2, 4], lean: 24, feet: OH_FEET });
  q.lumbar = [-4, 0, 0]; q.thoracic = [-2, 0, 0]; q.neck = [-8, 0, 0];
  balance(C, q, OH_FEET, { shift: [0, 4] });
  return { q };
});
/* ---------- «Дровосек»: колонна слева, верхний блок, тяга к правому колену ---------- */
const WD_TOWER = { type: 'g3Tower', id: 'col', h: 202, at: [122, 0, 50], yaw: -90 };
const WD_FEET = { L: [27, 12, 18], R: [-27, 12, -18] };
/* ---------- Протяжка между ног: спиной к нижнему блоку ---------- */
const PT_TOWER = { type: 'g3Tower', id: 'col', h: 20, at: [0, 0, -122], yaw: 0 };
const PT_FEET = { L: [33, 16, 20], R: [-33, 16, -20] };

/* ---------- Кроссовер: сведение рук (верхние блоки) и сведение снизу (нижние блоки) ---------- */
const XO_HI = { type: 'g3Crossover', id: 'xo', span: 330, hL: 200, hR: 200 };
const XO_LO = { type: 'g3Crossover', id: 'xo', span: 330, hL: 20, hR: 20 };
const XF_FEET = { L: [11, 58, 6], R: [-12, 8, -10, 14] };
const XF = once(() => {
  const C = ctx([XO_HI]), q = C.base();
  stand(C, q, { root: [0, 85.3, 30], lean: 17, feet: XF_FEET, heel: { R: 14 } });
  q.lumbar = [-4, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-12, 0, 0];
  balance(C, q, XF_FEET, { shift: [0, 4], resolve: qq => placeFeet(C, qq, XF_FEET, { R: 14 }) });
  return { q };
});
const LF_FEET = { L: [11, 56, 6], R: [-12, 8, -10, 18] };
const LF = once(() => {
  const C = ctx([XO_LO]), q = C.base();
  stand(C, q, { root: [0, 84.7, 30], lean: 9, feet: LF_FEET, heel: { R: 18 } });
  q.lumbar = [-4, 0, 0]; q.thoracic = [0, 0, 0]; q.neck = [-4, 0, 0];
  balance(C, q, LF_FEET, { shift: [0, 3], resolve: qq => placeFeet(C, qq, LF_FEET, { R: 18 }) });
  return { q };
});

/* ---------- Тяга верхнего блока: раскладка тренажёра считается по посадке ---------- */
function latSeat(C, lean) {
  const { V } = C, q = C.base(), a = lean * C.D2R;
  C.root(q, [0, 56, -6], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]);
  q.lumbar = [-3, 0, 0]; q.thoracic = [-2, 0, 0]; q.neck = [-2, 0, 0];
  for (const s of S) { q[s].hip = [90 - lean, 7, 6]; q[s].knee = 92; }
  C.restOn(q, 'buttocks', [0, 46, 0], [0, 1, 0], -1.4);
  for (const s of S) { const f = C.fk(q), kn = f.P['kn' + s], lat = C.latP(q, s); C.foot(q, s, V.add([kn[0], 0, kn[2] + 10], lat, 3), 0, V.unit(V.add([0, .3, 1], lat, .25)), { forward: V.unit(V.add([0, 0, 1], lat, .15)) }); }
  return q;
}
const LP = once(() => {
  const C = ctx([]), { V } = C, q = latSeat(C, 8), f = C.fk(q);
  /* валики: над бёдрами на 70 % длины бедра, с поджатием 1 см */
  const th = V.mix(f.P.hipL, f.P.knL, .68), padH = th[1] + 7.6 + 6.5 - 1, padZ = th[2];
  const chest = C.chestPoint(q, 43), barZ = chest[2] + 4.5;
  return { padH, padZ, barZ, chest };
});
const LP_EQ = once(() => { const L = LP(); return { type: 'g3LatPulldown', id: 'lat', seatH: 46, padH: r1(L.padH), padZ: r1(L.padZ), pulleyZ: r1(L.barZ + 3) }; });
/* ---------- Тяга горизонтального блока ---------- */
const ROW_EQ = { type: 'g3SeatedRow', id: 'row', seatH: 44, plateZ: 86, plateH: 31, tilt: 28, pulleyH: 52 };
function rowBody(C, lean, hipZ) {
  const { V, M } = C, q = C.base(), a = lean * C.D2R;
  C.root(q, [0, 54, hipZ], [0, Math.cos(a), Math.sin(a)], [0, -Math.sin(a), Math.cos(a)]);
  q.lumbar = [lean > 0 ? lean * .3 : lean * .2, 0, 0]; q.thoracic = [lean > 0 ? lean * .2 : 0, 0, 0];
  for (const s of S) { q[s].hip = [80 + lean * .5, 6, 4]; q[s].knee = 20; }
  const n = C.point('row', 'plateNormal');
  for (let i = 0; i < 3; i++) {
    C.restOn(q, 'buttocks', [0, 44, 0], [0, 1, 0], -1.4);
    for (const s of S) {
      const pf = C.frame('row', 'plate' + s), along = M.M3.col(pf.R, 2), sup = V.add(V.add(pf.o, along, 4), n, 1);
      C.foot(q, s, sup, 0, V.unit(V.add([0, 1, 0], C.latP(q, s), .3)), { up: n, forward: along });
    }
  }
  return q;
}
const ROW = once(() => {
  const C = ctx([ROW_EQ]), { V, M } = C, n = C.point('row', 'plateNormal');
  /* таз ставится так, чтобы колени были согнуты на ~20° при стопах на упорах */
  const reach = hz => { const q = C.base(); C.root(q, [0, 52.7, hz], [0, 1, 0], [0, 0, 1]); const f = C.fk(q), pf = C.frame('row', 'plateL'), along = M.M3.col(pf.R, 2), ff = M.footFrame(V.add(V.add(pf.o, along, 4), n, 1), 0, { up: n, forward: along }); return V.dist(f.P.hipL, ff.o) - (M.B.th + M.B.sk - 2); };
  return { hipZ: C.solve1D(hz => -reach(hz), -30, 20) };
});

/* ---------- Эспандеры ---------- */
const BAND_FEET = { L: [10.5, 13, 7], R: [-10.5, 13, -7] };
const BAND = once(() => {
  const C = ctx([]), q = C.base();
  stand(C, q, { root: [0, 88.5, 0], lean: 1, feet: BAND_FEET });
  q.lumbar = [-2, 0, 0]; q.neck = [2, 0, 0];
  balance(C, q, BAND_FEET);
  return { q };
});
/* Дверь стоит при x > 0, пользователь смотрит в +X (ни одна из камер атласа не смотрит со стороны +X — дверь не заслоняет тело).
   Позы строятся лицом к +Z (дверь при z > 0) и поворачиваются на 90° вокруг вертикали. */
const DOOR_TOP = { type: 'g3Door', id: 'door', anchor: 'top', at: [72, 0, 0], yaw: 90 };
const DOOR_SIDE = { type: 'g3Door', id: 'door', anchor: 'side', h: 165, at: [112, 0, 37.5], yaw: 90 };
const BPD_FEET = { L: [11, 14, 8], R: [-11, 14, -8] };
const BPD = once(() => {
  const C = ctx([]), q = C.base();
  stand(C, q, { root: [0, 87.6, 0], lean: 10, feet: BPD_FEET });
  q.lumbar = [-2, 0, 0]; q.thoracic = [2, 0, 0]; q.neck = [-6, 0, 0];
  balance(C, q, BPD_FEET, { shift: [0, 2] });
  return { q };
});
const BFP_FEET = { L: [13, 12, 8], R: [-13, 12, -8] };
const BFP = once(() => {
  const C = ctx([]), q = C.base();
  stand(C, q, { root: [0, 88.1, 0], lean: 2, feet: BFP_FEET });
  q.lumbar = [-2, 0, 0];
  balance(C, q, BFP_FEET, { shift: [0, 1] });
  return { q };
});

module.exports = {

  /* Стоя на середине ленты (лента из-под подошв). t=0 — кисти у бёдер; t=1 — руки через стороны до уровня плеч, локти слегка согнуты. */
  bandlatraise: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'band', id: 'band', fromSole: true, r: .7 }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'band:handleL' }, { body: 'gripR', prop: 'band:handleR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(BAND().q);
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s);
        const d0 = V.unit(V.add(V.add([0, -1, 0], lat, .2), T.z, .14)), d1 = V.unit(V.add(V.add(lat, [0, 1, 0], .04), T.z, .3));
        const g = V.add(gh, slerpDir(V, d0, d1, e), 60);
        C.hold(q, s, g, V.unit(V.mix(V.add([0, 0, -1], lat, .5), V.add([0, 1, -.6], lat, .2), e)), { pron: C.lerp(5, 25, e) });
        q[s].girdle = [C.lerp(0, 8, e), C.lerp(4, 6, e)];
        C.hold(q, s, g, V.unit(V.mix(V.add([0, 0, -1], lat, .5), V.add([0, 1, -.6], lat, .2), e)), { pron: C.lerp(5, 25, e) });
      }
      return q;
    }
  },

  /* Стоя на ленте, хват снизу, локти прижаты к бокам. t=0 — руки выпрямлены; t=1 — кисти у плеч. */
  bandcurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [{ type: 'band', id: 'band', fromSole: true, r: .7 }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'band:handleL' }, { body: 'gripR', prop: 'band:handleR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(BAND().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], up = [0, 1, 0], fwd = [0, 0, 1];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.08, .16, e)), lat, .1)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(18, 135, e) * C.D2R, fore = V.unit(V.add(V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi)), lat, .06));
        const wr = V.add(el, fore, C.M.B.fa);
        C.hold(q, s, V.add(V.add(wr, fore, 8), V.add(V.scale(up, Math.sin(phi)), fwd, Math.cos(phi)), 2.6), V.unit(V.add(V.add(V.sub(el, V.mix(gh, wr, .5)), [0, 0, -1], 4), lat, -1)), { pron: C.lerp(-75, -80, e) });
      }
      return q;
    }
  },

  /* Лента закреплена в притворе над дверью. Локти прижаты к бокам. t=0 — локти согнуты под 90°; t=1 — руки разогнуты вниз. */
  bandpushdown: {
    keys: [0, .25, .5, .75, 1],
    equipment: [DOOR_TOP, { type: 'g3band', id: 'band', from: rp(EQ.anchors([DOOR_TOP]).door.anchor), mountTo: 'door:ring', r: .7 }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'band:handleL' }, { body: 'gripR', prop: 'band:handleR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(BPD().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], fwd = [0, 0, 1];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.1, .15, e)), lat, .1)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(88, 6, e) * C.D2R, fore = V.unit(V.add(V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi)), lat, -.1));
        const wr = V.add(el, fore, C.M.B.fa), palm = V.add(V.scale(down, Math.sin(phi)), fwd, -Math.cos(phi));
        C.hold(q, s, V.add(V.add(wr, fore, 8), palm, 2.6), V.unit(V.add(V.add(V.sub(el, V.mix(gh, wr, .5)), [0, 0, -1], 4), lat, 2)), { pron: C.lerp(40, 20, e) });
      }
      return turn(C, q, 90);
    }
  },

  /* Лента закреплена в притворе двери на уровне лица. t=0 — руки вытянуты к креплению; t=1 — кисти у лица, локти высоко в стороны, концы ленты разведены. */
  bandfacepull: {
    keys: [0, .25, .5, .75, 1],
    equipment: [DOOR_SIDE, { type: 'g3band', id: 'band', from: rp(EQ.anchors([DOOR_SIDE]).door.anchor), mountTo: 'door:ring', r: .7 }],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'band:handleL' }, { body: 'gripR', prop: 'band:handleR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(BFP().q);
      for (const s of S) q[s].girdle = [C.lerp(4, 6, e), C.lerp(16, -16, e)];
      q.neck = [C.lerp(-4, 2, e), 0, 0];
      const f = C.fk(q), head = f.P.head, ghm = V.mix(f.P.ghL, f.P.ghR, .5);
      const g0 = [0, ghm[1] + 9, ghm[2] + 53], g1 = [0, head[1] + 1, head[2] + 5];
      const mid = V.add(V.mix(g0, g1, e), [0, 1, 0], 4 * Math.sin(Math.PI * e)), half = C.lerp(7, 18, e);
      for (const s of S) {
        const lat = C.lat(q, s), g = V.add(mid, lat, half);
        const pole = V.unit(V.add(V.add(lat, [0, 1, 0], C.lerp(-.6, .25, e)), [0, 0, -1], C.lerp(-.2, .35, e)));
        C.hold(q, s, g, pole, { pron: C.lerp(70, 5, e), flex: C.lerp(0, -10, e) });
      }
      return turn(C, q, 90);
    }
  },

  /* Сидя, бёдра под валиками, широкий хват сверху, корпус отклонён на ~12°. t=0 — руки выпрямлены вверх; t=1 — гриф у верха груди, локти вниз. */
  latpull: {
    keys: [0, .25, .5, .75, 1],
    get equipment() { const E = LP_EQ(), A = EQ.anchors([E]).lat; return [E, cable(E, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 19, bend: 8, wrap: [0, 0, -1], rest: 45 }), { type: 'g3line', id: 'boomCable', pts: [rp(A.boomCableA), rp(A.boomCableB)] }]; },
    contacts: [{ body: 'buttocks', prop: 'lat:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = latSeat(C, 8), L = LP();
      for (const s of S) q[s].girdle = [C.lerp(28, -4, e), C.lerp(4, -12, e)];
      q.neck = [C.lerp(-10, -6, e), 0, 0];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), top = gm[1] + 55, bot = L.chest[1] + 1.5;
      const y = C.lerp(top, bot, e), z = L.barZ;
      for (const s of S) {
        const lat = C.lat(q, s), g = [C.M.SIGN[s] * 40, y, z];
        const pole = V.unit(V.add(V.add(lat, [0, -1, 0], .5), [0, 0, -1], .45));
        C.grip(q, s, g, [-C.M.SIGN[s], 0, 0], pole, { wristExt: 6 });
      }
      return q;
    }
  },

  /* Тяга верхнего блока узкой V-рукоятью: ладони смотрят друг на друга, кисти у середины тела. t=0 — руки вытянуты
     вверх, t=1 — рукоять у грудины, локти опущены вниз-вперёд вдоль корпуса, лопатки опущены и сведены. Корпус
     отклонён назад чуть больше, чем при широком хвате. Большой палец смотрит назад, к лицу (нейтральный хват над головой). */
  latpullv: {
    keys: [0, .25, .5, .75, 1],
    get equipment() { const E = LP_EQ(), A = EQ.anchors([E]).lat; return [E, cable(E, '', { id: 'cab', attach: 'V', hands: ['L', 'R'], clip: 11, wrap: [0, 0, -1], rest: 53 }), { type: 'g3line', id: 'boomCable', pts: [rp(A.boomCableA), rp(A.boomCableB)] }]; },
    contacts: [{ body: 'buttocks', prop: 'lat:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = latSeat(C, C.lerp(8, 12, e)), L = LP();
      for (const s of S) q[s].girdle = [C.lerp(28, -6, e), C.lerp(4, -10, e)];
      q.neck = [C.lerp(-10, -4, e), 0, 0];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), top = gm[1] + 59, bot = L.chest[1] + 3;
      const y = C.lerp(top, bot, e), z = L.barZ + C.lerp(0, 1.5, e);
      for (const s of S) {
        const lat = C.lat(q, s), g = [C.M.SIGN[s] * 6.5, y, z];
        const pole = V.unit(V.add(V.add(lat, [0, 0, 1], C.lerp(.9, 1.1, e)), [0, -1, 0], C.lerp(.2, .9, e)));
        C.grip(q, s, g, V.unit([-C.M.SIGN[s] * .1, C.lerp(.35, .05, e), -1]), pole, { wristExt: 4 });
      }
      return q;
    }
  },

  /* Тяга верхнего блока обратным хватом на ширине плеч: ладони к себе, большие пальцы наружу. t=0 — руки вытянуты,
     t=1 — гриф у верхней части груди, локти внизу перед корпусом. Рукоять та же, что в широком хвате (≈118 см). */
  latpulluh: {
    keys: [0, .25, .5, .75, 1],
    get equipment() { const E = LP_EQ(), A = EQ.anchors([E]).lat; return [E, cable(E, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 43, bend: 8, wrap: [0, 0, -1], rest: 47 }), { type: 'g3line', id: 'boomCable', pts: [rp(A.boomCableA), rp(A.boomCableB)] }]; },
    contacts: [{ body: 'buttocks', prop: 'lat:seat' }, { body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = latSeat(C, C.lerp(8, 13, e)), L = LP();
      for (const s of S) q[s].girdle = [C.lerp(28, -4, e), C.lerp(4, -12, e)];
      q.neck = [C.lerp(-10, -6, e), 0, 0];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), top = gm[1] + 60, bot = L.chest[1] + 6;
      const y = C.lerp(top, bot, e), z = L.barZ + C.lerp(0, 7, e);
      for (const s of S) {
        const lat = C.lat(q, s), g = [C.M.SIGN[s] * 16, y, z];
        const pole = V.unit(V.add(V.add([0, 0, 1], lat, C.lerp(-.15, .1, e)), [0, -1, 0], C.lerp(.1, .7, e)));
        C.grip(q, s, g, [C.M.SIGN[s], 0, 0], pole, { wristExt: 2 });
      }
      return q;
    }
  },

  /* Сидя на скамье, стопы на упорах, колени слегка согнуты, V-рукоять. t=0 — руки вытянуты, корпус чуть наклонён вперёд;
     t=1 — рукоять у живота, лопатки сведены, корпус отклонён назад на ~10°, спина нейтральна. */
  cablerow: {
    keys: [0, .25, .5, .75, 1],
    equipment: [ROW_EQ, cable(ROW_EQ, '', { id: 'cab', attach: 'V', hands: ['L', 'R'], wrap: [0, 1, 0], rest: 33 })],
    contacts: [{ body: 'buttocks', prop: 'row:seat' }, { body: 'soleL', prop: 'row:plateL' }, { body: 'soleR', prop: 'row:plateR' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = rowBody(C, C.lerp(7, -10, e), ROW().hipZ);
      for (const s of S) q[s].girdle = [C.lerp(4, -2, e), C.lerp(18, -16, e)];
      q.neck = [C.lerp(-8, 4, e), 0, 0];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), belly = C.chestPoint(q, 14);
      const g0 = [0, gm[1] - 14, gm[2] + 58], g1 = [0, belly[1] + 2, belly[2] + 11];
      const mid = V.add(V.mix(g0, g1, e), [0, 1, 0], 3 * Math.sin(Math.PI * e));
      for (const s of S) {
        const lat = C.lat(q, s), g = V.add(mid, [C.M.SIGN[s], 0, 0], 6.5);
        const pole = V.unit(V.mix(V.add(V.add([0, -1, 0], lat, .4), [0, 0, -.2], 1), V.add([0, -.2, -1], lat, .6), e));
        C.grip(q, s, g, V.unit([C.M.SIGN[s] * -.12, 1, .1]), pole, { wristExt: 4 });
      }
      return q;
    }
  },

  /* Тяга горизонтального блока широкой прямой рукоятью (гриф 90 см) хватом сверху, кисти шире плеч. t=0 — руки
     вытянуты, лопатки разведены, корпус чуть наклонён вперёд; t=1 — гриф у нижней части груди, локти разведены
     в стороны и уведены назад, лопатки сведены, корпус отклонён назад. */
  cablerowwide: {
    keys: [0, .25, .5, .75, 1],
    equipment: [ROW_EQ, cable(ROW_EQ, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 14, wrap: [0, 1, 0], rest: 33 })],
    contacts: [{ body: 'buttocks', prop: 'row:seat' }, { body: 'soleL', prop: 'row:plateL' }, { body: 'soleR', prop: 'row:plateR' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.5, R: 1.5 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = rowBody(C, C.lerp(7, -8, e), ROW().hipZ);
      for (const s of S) q[s].girdle = [C.lerp(4, 0, e), C.lerp(18, -16, e)];
      q.neck = [C.lerp(-8, 4, e), 0, 0];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), lo = C.chestPoint(q, 28);
      const g0 = [0, gm[1] - 12, gm[2] + 60], g1 = [0, lo[1], lo[2] + 9];
      const mid = V.add(V.mix(g0, g1, e), [0, 1, 0], 3 * Math.sin(Math.PI * e));
      for (const s of S) {
        const lat = C.lat(q, s), g = V.add(mid, [C.M.SIGN[s], 0, 0], 31);
        const pole = V.unit(V.mix(V.add(V.add([0, -1, 0], lat, .8), [0, 0, -.2], 1), V.add(V.add([0, -.3, -1], lat, 1.2), [0, 0, 0], 1), e));
        C.grip(q, s, g, [-C.M.SIGN[s], 0, 0], pole, { wristExt: 4 });
      }
      return q;
    }
  },

  /* Шаг вперёд от линии блоков, корпус чуть наклонён, у каждой руки свой трос и D-рукоять.
     t=0 — руки разведены в стороны, локти мягко согнуты; t=1 — рукояти сведены по дуге вниз-вперёд перед грудью. */
  cablefly: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [XO_HI, cable(XO_HI, 'L', { id: 'cabL', attach: 'D', hands: ['L'], plane: 'swivel', clip: 11, rest: 87 }), cable(XO_HI, 'R', { id: 'cabR', attach: 'D', hands: ['R'], plane: 'swivel', clip: 11, rest: 87 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'cabL' }, { body: 'gripR', prop: 'cabR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(XF().q);
      for (const s of S) q[s].girdle = [C.lerp(6, 2, e), C.lerp(-14, 12, e)];
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), fwd = T.z, up = T.y;
        const d0 = V.unit(V.add(V.add(V.scale(lat, .94), fwd, .05), up, .2)), d1 = V.unit(V.add(V.add(V.scale(fwd, .9), up, -.3), lat, -.19));
        const g = V.add(gh, slerpDir(V, d0, d1, e), 61.5);
        const pole = V.unit(V.mix(V.add(V.scale(fwd, -1), up, .25), V.add(V.add(lat, up, -.12), fwd, -.65), e));
        C.hold(q, s, g, pole, { pron: C.lerp(60, 25, e) });
      }
      return q;
    }
  },

  /* Нижние блоки кроссовера, шаг вперёд, корпус чуть наклонён. t=0 — руки внизу и в стороны; t=1 — сведены по дуге снизу вверх до уровня плеч. */
  cablelowfly: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [XO_LO, cable(XO_LO, 'L', { id: 'cabL', attach: 'D', hands: ['L'], plane: 'swivel', clip: 11, rest: 108 }), cable(XO_LO, 'R', { id: 'cabR', attach: 'D', hands: ['R'], plane: 'swivel', clip: 11, rest: 108 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'cabL' }, { body: 'gripR', prop: 'cabR' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(LF().q);
      for (const s of S) q[s].girdle = [C.lerp(-4, 6, e), C.lerp(-10, 12, e)];
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), fwd = T.z, up = T.y;
        const d0 = V.unit(V.add(V.add(V.scale(lat, .6), fwd, .12), up, -.8)), d1 = V.unit(V.add(V.add(V.scale(fwd, .97), up, .02), lat, -.25));
        const g = V.add(gh, slerpDir(V, d0, d1, e), 61.5);
        const pole = V.unit(V.add(V.add(V.scale(fwd, -.6), up, -1), lat, .6));
        C.hold(q, s, g, pole, { pron: C.lerp(-50, -20, e) });
      }
      return q;
    }
  },

  /* Правая рука с D-рукоятью: t=0 — кисть перед левым бедром, трос натянут поперёк тела; t=1 — рука отведена до уровня плеча.
     Левая рука держится за ручку на стойке колонны. */
  cablelat: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [CL_TOWER, cable(CL_TOWER, '', { id: 'cab', attach: 'D', hands: ['R'], rest: 77 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'col:grabL' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(CL().q), grab = C.point('col', 'grabL');
      q.R.girdle = [C.lerp(0, 8, e), C.lerp(6, 2, e)];
      const f = C.fk(q), gh = f.P.ghR;
      C.grip(q, 'L', [grab[0], 128, grab[2]], [0, 1, 0], V.unit([.4, -1, -.3]));
      const d0 = V.unit(V.sub([4, 86, 34], gh)), d1 = V.unit([-.92, .04, .4]), d = slerpDir(V, d0, d1, e);
      const g = V.add(gh, d, 60);
      C.hold(q, 'R', g, V.unit(V.mix([-1, -.3, -.4], [-.1, .5, -1], e)), { pron: C.lerp(10, 45, e) });
      return q;
    }
  },

  /* На коленях лицом к верхнему блоку, канат у лба. t=0 — корпус почти прямой; t=1 — позвоночник скручен, локти к бёдрам. Таз неподвижен. */
  cablecrunch: {
    keys: [0, .25, .5, .75, 1],
    equipment: [CR_TOWER, CR_MAT, cable(CR_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 97 })],
    contacts: [{ body: 'kneeL', prop: 'mat' }, { body: 'kneeR', prop: 'mat' }, { body: 'footL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(CR().q);
      q.lumbar = [C.lerp(2, 36, e), 0, 0]; q.thoracic = [C.lerp(4, 34, e), 0, 0]; q.neck = [C.lerp(4, 24, e), 0, 0];
      for (const s of S) q[s].girdle = [C.lerp(10, 4, e), 10];
      const f = C.fk(q), H = C.axes(q, 'head'), head = f.P.head, T = C.axes(q, 'thorax');
      for (const s of S) {
        const g = V.add(V.add(V.add(head, H.x, C.M.SIGN[s] * 12.5), H.z, 3), H.y, 1.5);
        const pole = V.unit(V.add(V.add(V.scale(T.y, -1), T.z, .7), C.lat(q, s), .4));
        C.hold(q, s, g, pole, { pron: 20, flex: -10 });
      }
      return q;
    }
  },

  /* Работает левая нога, манжета на голеностопе, руки на ручках колонны, корпус наклонён вперёд.
     t=0 — нога под тазом, колено согнуто, стопа над полом; t=1 — бедро отведено назад до полного разгибания. */
  glutekick: {
    keys: [0, .25, .5, .75, 1],
    equipment: [GK_TOWER, cable(GK_TOWER, '', { id: 'cab', attach: 'ankle', foot: 'L', rest: 70 })],
    contacts: [{ body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'col:grabR' }, { body: 'gripR', prop: 'col:grabL' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = kickLayout({ lean: 30, tower: GK_TOWER, footR: [-11, 0, 26], root: [0, 86.1, 10] }), q = L.q;
      const f = C.fk(q), hip = f.P.hipL, a = C.lerp(22, -40, e) * C.D2R, k = (C.lerp(64, 22, e) + 20 * Math.sin(Math.PI * e)) * C.D2R;
      const th = [0, -Math.cos(a), Math.sin(a)], an = V.add(V.add(hip, th, C.M.B.th), [0, -Math.cos(a - k), Math.sin(a - k)], C.M.B.sk);
      C.legTo(q, 'L', V.add(an, [1.5, 0, 0], 1), V.unit([.05, -.2, 1]), { dorsi: C.lerp(4, -22, e) });
      for (const s of S) { const gp = C.point('col', s === 'L' ? 'grabR' : 'grabL'); C.grip(q, s, [gp[0], 112, gp[2]], [0, 1, 0], V.unit(V.add([0, -1, 0], C.lat(q, s), .8))); }
      return q;
    }
  },

  /* Прямая нога отводится назад (работает левая), лёгкий наклон, руки на стойке; стопа не касается пола. */
  cablekickback: {
    keys: [0, .25, .5, .75, 1],
    equipment: [KB_TOWER, cable(KB_TOWER, '', { id: 'cab', attach: 'ankle', foot: 'L', rest: 89 })],
    contacts: [{ body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'col:grabR' }, { body: 'gripR', prop: 'col:grabL' }],
    gripRadius: { L: 1.6, R: 1.6 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), L = kickLayout({ lean: 16, tower: KB_TOWER, footR: [-11, 0, 24], root: [0, 88.5, 8] }), q = L.q;
      q.neck = [-8, 0, 0];
      const f = C.fk(q), hip = f.P.hipL, a = C.lerp(-15, -34, e) * C.D2R, k = C.lerp(24, 3, e) * C.D2R;
      const th = [0, -Math.cos(a), Math.sin(a)], an = V.add(V.add(hip, th, C.M.B.th), [0, -Math.cos(a - k), Math.sin(a - k)], C.M.B.sk);
      C.legTo(q, 'L', V.add(an, [1.5, 0, 0], 1), V.unit([.05, -.2, 1]), { dorsi: C.lerp(6, -6, e) });
      for (const s of S) { const gp = C.point('col', s === 'L' ? 'grabR' : 'grabL'); C.grip(q, s, [gp[0], 128, gp[2]], [0, 1, 0], V.unit(V.add([0, -1, 0], C.lat(q, s), .8))); }
      return q;
    }
  },

  /* Спиной к блоку, шаг вперёд, корпус наклонён, локти у ушей. t=0 — канат за головой; t=1 — руки выпрямлены вперёд-вверх, концы разведены. */
  cableohext: {
    keys: [0, .25, .5, .75, 1],
    equipment: [OH_TOWER, cable(OH_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 95 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(OH().q);
      for (const s of S) q[s].girdle = [26, 6];
      const f = C.fk(q), T = C.axes(q, 'thorax');
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s);
        const ua = V.unit(V.add(V.add(T.y, T.z, .42), lat, .05)), el = V.add(gh, ua, C.M.B.ua);
        const bend = C.lerp(132, 8, e) * C.D2R, back = V.unit(V.cross(ua, [1, 0, 0]));
        const fore = V.unit(V.add(V.add(V.scale(ua, Math.cos(bend)), back, Math.sin(bend)), lat, C.lerp(-.16, -.06, e)));
        const g = V.add(V.add(el, fore, 34), lat, C.lerp(-1.5, 0, e));
        C.hold(q, s, g, V.unit(V.add(ua, V.scale(fore, -1), .3)), { pron: C.lerp(10, 30, e) });
      }
      return q;
    }
  },

  /* Колонна слева, верхний блок; канат двумя руками. t=0 — руки вверху у блока, корпус развёрнут к нему;
     t=1 — руки у правого колена, корпус и таз развёрнуты вправо, руки почти прямые. */
  cablewood: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [WD_TOWER, cable(WD_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, plane: 'swivel', rest: 57 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'footR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base(), P = pulleyOf(WD_TOWER), sc = [0, 138, 6];
      /* направление рук: от блока к правому колену; корпус и таз поворачиваются вслед за руками */
      const d0 = V.unit(V.sub(P, sc)), d1 = V.unit(V.sub([-22, 50, 40], sc)), d = slerpDir(V, d0, d1, e), psi = Math.atan2(d[0], d[2]) / C.D2R;
      const rot = psi * .92, feet = { L: [27, 12, C.lerp(18, -22, e)], R: [-27, 12, C.lerp(26, -16, e)] }, heel = { L: C.lerp(0, 30, e), R: C.lerp(30, 0, e) };
      stand(C, q, { root: [C.lerp(6, -6, e), C.lerp(86.6, 82.1, e), C.lerp(4, -1, e)], yaw: rot * .4, lean: C.lerp(3, 27, e), feet, heel });
      q.lumbar = [C.lerp(-2, 6, e), C.lerp(2, -4, e), rot * .12]; q.thoracic = [C.lerp(-4, 12, e), C.lerp(4, -6, e), rot * .48]; q.neck = [C.lerp(-16, 14, e), 0, C.lerp(6, -8, e)];
      placeFeet(C, q, feet, heel);
      for (const s of S) q[s].girdle = [C.lerp(16, 2, e), 10];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5), T = C.axes(q, 'thorax'), across = V.unit(V.perp(T.x, d));
      const handAt = R => S.map(s => V.add(V.add(gm, d, R), across, (s === 'L' ? 1 : -1) * 4.5));
      const Rr = C.solve1D(R => Math.max(...S.map((s, i) => V.dist(handAt(R)[i], f.P['gh' + s]))) - 59, 10, 75), hands = handAt(Rr);
      S.forEach((s, i) => {
        const gh = f.P['gh' + s], pole = V.unit(V.perp(V.add(V.scale(T.y, -1), C.lat(q, s), .9), V.unit(V.sub(hands[i], gh))));
        C.hold(q, s, hands[i], pole, { pron: C.lerp(30, 40, e) });
      });
      return q;
    }
  },

  /* Спиной к нижнему блоку, канат между ног. t=0 — стоя прямо, кисти у паха; t=1 — наклон с отведением таза назад, колени мягкие, спина прямая. */
  pullthrough: {
    keys: [0, .25, .5, .75, 1],
    equipment: [PT_TOWER, cable(PT_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 98 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.base();
      stand(C, q, { root: [0, C.lerp(86.6, 79.4, e), C.lerp(2, -16, e)], lean: C.lerp(2, 62, e), feet: PT_FEET });
      q.lumbar = [C.lerp(-2, 2, e), 0, 0]; q.thoracic = [C.lerp(0, 6, e), 0, 0]; q.neck = [C.lerp(2, -24, e), 0, 0];
      balance(C, q, PT_FEET, { shift: [0, C.lerp(0, -4, e)] });
      for (const s of S) q[s].girdle = [C.lerp(-4, 4, e), C.lerp(2, 8, e)];
      const f = C.fk(q), gm = V.mix(f.P.ghL, f.P.ghR, .5);
      const target = V.mix([0, 72, f.P.hipL[2] + 21], [0, 41, f.P.knL[2] - 9], e);
      for (const s of S) {
        const lat = C.lat(q, s), gh = f.P['gh' + s], g0 = V.add(target, lat, 3), g = V.add(gh, V.unit(V.sub(g0, gh)), Math.min(61, V.dist(g0, gh)));
        C.hold(q, s, g, V.unit(V.add([0, 0, -1], lat, C.lerp(1.5, .3, e))), { pron: 0, allowShort: true });
      }
      return q;
    }
  },

  /* t=0 — руки выпрямлены, рукоять у бёдер (хват снизу); t=1 — рукоять у груди, локти у корпуса. */
  cablecurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [CC_TOWER, cable(CC_TOWER, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 11, rest: 62 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(CC().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], up = [0, 1, 0], fwd = [0, 0, 1];
        q[s].girdle = [-2, C.lerp(-2, 2, e)];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.1, .2, e)), lat, .06)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(16, 128, e) * C.D2R, fore = V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi)), palm = V.add(V.scale(up, Math.sin(phi)), fwd, Math.cos(phi));
        const g = gripFrom(C, el, fore, palm); g[0] = C.M.SIGN[s] * 21.5;
        const pole = V.unit(V.add(V.add(V.sub(el, V.mix(gh, g, .45)), [0, 0, -1], 6), lat, -2.5));
        const thumb = V.unit(V.add([C.M.SIGN[s], 0, 0], V.cross(fore, [1, 0, 0]), C.lerp(0, .14, e)));
        C.grip(q, s, g, thumb, pole, { wristExt: -4 });
      }
      return q;
    }
  },

  /* Сгибание рук на нижнем блоке с канатом — «молот»: ладони друг к другу, большие пальцы вверх, узлы каната над кистями.
     t=0 — руки выпрямлены, кисти перед бёдрами; t=1 — кисти у груди, локти у корпуса. */
  ropecurl: {
    keys: [0, .25, .5, .75, 1],
    equipment: [CC_TOWER, cable(CC_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 62 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(CC().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], fwd = [0, 0, 1];
        q[s].girdle = [-2, C.lerp(-2, 2, e)];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.1, .2, e)), lat, .12)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(16, 128, e) * C.D2R, fore = V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi));
        const g = V.add(el, fore, 27 + 7); g[0] = C.M.SIGN[s] * C.lerp(16, 12, e);
        const pole = V.unit(V.add(V.add(V.sub(el, V.mix(gh, g, .45)), [0, 0, -1], 6), lat, -2.5));
        C.hold(q, s, g, pole, { pron: 0 });
      }
      return q;
    }
  },

  /* t=0 — руки вытянуты к блоку, канат перед лицом; t=1 — кисти у ушей, локти высоко в стороны. */
  facepull: {
    keys: [0, .25, .5, .75, 1],
    equipment: [FP_TOWER, cable(FP_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 39 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(FP().q), P = pulleyOf(FP_TOWER);
      for (const s of S) q[s].girdle = [C.lerp(4, 6, e), C.lerp(16, -16, e)];
      q.neck = [C.lerp(-4, 2, e), 0, 0];
      const f = C.fk(q), head = f.P.head, ghm = V.mix(f.P.ghL, f.P.ghR, .5);
      const g0 = [0, ghm[1] + 9, ghm[2] + 53], g1 = [0, head[1] + 1, head[2] + 4];
      const mid = V.add(V.mix(g0, g1, e), [0, 1, 0], 4 * Math.sin(Math.PI * e)), half = C.lerp(5.5, 17.5, e);
      const clip = V.add(mid, V.unit(V.sub(P, mid)), Math.sqrt(26 * 26 - half * half));
      for (const s of S) {
        const lat = C.lat(q, s), g = V.add(mid, lat, half);
        const pole = V.unit(V.add(V.add(lat, [0, 1, 0], C.lerp(-.6, .25, e)), [0, 0, -1], C.lerp(-.2, .35, e)));
        C.hold(q, s, g, pole, { pron: C.lerp(70, 5, e), flex: C.lerp(0, -10, e) });
      }
      return q;
    }
  },

  /* t=0 — прямые руки на уровне головы; t=1 — рукоять у бёдер, лопатки опущены. */
  straightpull: {
    keys: [0, .2, .4, .6, .8, 1],
    equipment: [SP_TOWER, cable(SP_TOWER, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 12, rest: 39 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(SP().q);
      for (const s of S) q[s].girdle = [C.lerp(14, -4, e), C.lerp(8, -6, e)];
      const f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), a = C.lerp(32, -90, e) * C.D2R;
        const g = V.add(V.add(gh, [0, Math.sin(a), Math.cos(a)], 61.5), lat, 1); g[0] = C.M.SIGN[s] * 19;
        const pole = V.unit(V.add(V.add(lat, [0, -1, 0], .6), [0, 0, -1], .3));
        C.grip(q, s, g, [-C.M.SIGN[s], 0, 0], pole, { wristExt: 4 });
      }
      return q;
    }
  },
  /* t=0 — локти согнуты под 90°, рукоять на уровне низа груди; t=1 — руки выпрямлены, рукоять у бёдер. */
  pushdown: {
    keys: [0, .25, .5, .75, 1],
    equipment: [PD_TOWER, cable(PD_TOWER, '', { id: 'cab', attach: 'bar', hands: ['L', 'R'], ext: 11, rest: 89 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(PD().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], fwd = [0, 0, 1];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.1, .16, e)), lat, .1)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(88, 6, e) * C.D2R, fore = V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi)), palm = V.add(V.scale(down, Math.sin(phi)), fwd, -Math.cos(phi));
        const g = gripFrom(C, el, fore, palm); g[0] = C.M.SIGN[s] * 13.5;
        const pole = V.unit(V.add(V.add(V.sub(el, V.mix(gh, g, .45)), [0, 0, -1], 4), lat, 2));
        C.grip(q, s, g, [-C.M.SIGN[s], 0, 0], pole, { wristExt: 6 });
      }
      return q;
    }
  },

  /* Разгибание рук на верхнем блоке с канатом: нейтральный хват (ладони друг к другу), узлы каната под мизинцами.
     t=0 — локти согнуты под 90°, кисти у низа груди, концы каната почти вместе; t=1 — руки выпрямлены, концы каната
     разведены к бёдрам, предплечья чуть повёрнуты ладонями назад. Локти у корпуса всю амплитуду. */
  ropepushdown: {
    keys: [0, .25, .5, .75, 1],
    equipment: [PD_TOWER, cable(PD_TOWER, '', { id: 'cab', attach: 'rope', hands: ['L', 'R'], ropeLen: 26, rest: 89 })],
    contacts: [{ body: 'soleL', prop: 'floor' }, { body: 'soleR', prop: 'floor' }, { body: 'gripL', prop: 'cab' }, { body: 'gripR', prop: 'cab' }],
    gripRadius: { L: 1.3, R: 1.3 },
    pose(t, C) {
      const { V } = C, e = C.ease(t), q = C.M.clone(PD().q), f = C.fk(q);
      for (const s of S) {
        const gh = f.P['gh' + s], lat = C.lat(q, s), down = [0, -1, 0], fwd = [0, 0, 1];
        const ua = V.unit(V.add(V.add(down, fwd, C.lerp(.1, .16, e)), lat, .1)), el = V.add(gh, ua, C.M.B.ua);
        const phi = C.lerp(88, 6, e) * C.D2R, fore = V.add(V.scale(down, Math.cos(phi)), fwd, Math.sin(phi));
        const g = V.add(el, fore, 27 + 7); g[0] = C.M.SIGN[s] * C.lerp(6, 16, e);
        const pole = V.unit(V.add(V.add(V.sub(el, V.mix(gh, g, .45)), [0, 0, -1], 4), lat, 2));
        C.hold(q, s, g, pole, { pron: C.lerp(5, 30, e) });
      }
      return q;
    }
  }
};
