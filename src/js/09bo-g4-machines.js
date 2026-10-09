/* Тренажёры группы G4: силовые тренажёры с рычагами и каретками, гравитрон, «капитанский стул», брусья,
   скамья для пресса, гиперэкстензия. Размеры — по типовым коммерческим моделям (см).
   Раскладка каждого тренажёра (высота сиденья, оси рычагов, направляющие) считается в спецификации упражнения
   от положения тела: ось рычага проходит через ось нагружаемого сустава, как в настоящих тренажёрах.
   Внутренние координаты: Y вверх, пол Y = 0, тело смотрит вдоль +Z, левая сторона +X. */
((E) => {
const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
const { V, D2R, toCat, dirCat } = M, { TYPES, BIND } = E;
const unit = V.unit;

/* ---------- Общие узлы ---------- */
/* Подушка на пластине: c — центр подушки, size — [ширина, толщина, длина] по осям axes (y — нормаль),
   пластина под подушкой крепится к mount. */
function pad(b, k, c, size, axes, mount, opts = {}) {
  const n = unit(axes[1]), t = size[1], pt = opts.plateT || 2;
  b.box(k, c, size, { axes, role: 'support', tone: 'pad', mount: k + 'Plate', round: opts.round ?? 1.6, contact: 'top' });
  b.box(k + 'Plate', V.add(c, n, -(t / 2 + pt / 2 - .2)), [size[0] - 4, pt, size[2] - 4], { axes, mount });
  return V.add(c, n, -(t / 2 + pt - .2)); /* точка крепления за пластиной */
}
/* Колонна стека грузов: стойки, направляющие, плиты, верхняя плита; основание на полу.
   c — центр стека на полу [x, 0, z], w — ширина плит, h — высота колонны, along — ось ширины ('x' или 'z'). */
function stack(b, k, c, h, opts = {}) {
  const w = opts.w || 30, d = opts.d || 16, ax = opts.along === 'z' ? [0, 0, 1] : [1, 0, 0], side = opts.along === 'z' ? [1, 0, 0] : [0, 0, 1];
  const P = (u, y, v) => V.add(V.add(V.add(c, ax, u), [0, 1, 0], y), side, v);
  const hw = w / 2 + 7;
  b.tube(k + 'Base', P(-hw - 4, 3.75, 0), P(hw + 4, 3.75, 0), [8, 7.5], { mount: 'floor', up: [0, 1, 0] });
  b.tube(k + 'BaseS', P(0, 3.75, -d), P(0, 3.75, d), [8, 7.5], { mount: k + 'Base' });
  for (const sg of [-1, 1]) b.tube(k + 'Post' + (sg > 0 ? 'A' : 'B'), P(sg * hw, 7.5, 0), P(sg * hw, h, 0), [6, 6], { mount: k + 'Base' });
  b.tube(k + 'Top', P(-hw - 3, h - 3, 0), P(hw + 3, h - 3, 0), [6, 6], { mount: k + 'PostA' });
  const sh = opts.stackH || 62;
  b.box(k + 'Plates', P(0, 7.5 + sh / 2, 0), [w, sh, 12], { axes: [ax, [0, 1, 0], side], mount: k + 'Base', tone: 'stack', round: .4 });
  for (const sg of [-1, 1]) b.tube(k + 'Rod' + (sg > 0 ? 'A' : 'B'), P(sg * (w / 2 - 6), 7.5, 0), P(sg * (w / 2 - 6), h - 6, 0), .9, { mount: k + 'Base', tone: 'chrome', role: 'guide' });
  b.box(k + 'Head', P(0, 7.5 + sh + 2.5, 0), [w - 2, 4, 10], { axes: [ax, [0, 1, 0], side], mount: k + 'Plates', tone: 'chrome', round: .4 });
  b.cyl(k + 'Pulley', P(0, h - 9, 0), side, 4.8, 2.4, { mount: k + 'Top', tone: 'chrome' });
  b.tube(k + 'Cable', P(0, 7.5 + sh + 4.5, 0), P(0, h - 13.5, 0), .35, { mount: k + 'Head', tone: 'cable', role: 'cable' });
}
/* Рукоять-труба с прорезиненным хватом: от a к b, держатель — mount */
function handle(b, k, a, c, r, mount) { b.tube(k, a, c, r || 1.6, { mount, role: 'grip', tone: 'rubber' }); }

/* ---------- Жёсткие подвижные узлы ----------
   Детали задаются в локальной рамке узла и переводятся в каталог. Рамка — правая тройка внутренних осей:
   X, Y, Z (внутренние направления). Виды деталей: beam {a, b, r | w, h, up}, obox {c, size, axes?},
   cyl {c, axis, r, len}, sphere {c, r}. mount — имя детали узла или полный id ('lx:hub'); иначе mountTo. */
function rigid(id, O, X, Y, Z, parts, mountTo) {
  const Lp = p => toCat(V.add(V.add(V.add(O, X, p[0]), Y, p[1]), Z, p[2]));
  const Ld = d => dirCat(unit(V.add(V.add(V.scale(X, d[0]), Y, d[1]), Z, d[2])));
  return parts.map(p => {
    const o = { kind: p.kind, id: id + ':' + p.name, mount: p.mount ? (p.mount.includes(':') || p.mount === 'floor' ? p.mount : id + ':' + p.mount) : mountTo, tone: p.tone || 'frame', role: p.role || 'frame' };
    if (p.kind === 'beam') {
      o.a = Lp(p.a); o.b = Lp(p.b);
      if (p.r) o.r = p.r;
      else { /* сечение: up не должен совпадать с осью балки */
        const dir = unit(V.sub(o.b, o.a)); let up = Ld(p.up || [0, 1, 0]);
        if (Math.abs(V.dot(up, dir)) > .9) { for (const c of [[0, 0, 1], [1, 0, 0], [0, 1, 0]]) { up = Ld(c); if (Math.abs(V.dot(up, dir)) < .9) break; } }
        o.w = p.w; o.h = p.h; o.up = up;
      }
    }
    else if (p.kind === 'obox') { const ax = p.axes || [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; o.c = Lp(p.c); o.x = Ld(ax[0]); o.y = Ld(ax[1]); o.z = Ld(ax[2]); o.size = [...p.size]; o.round = p.round ?? 1; }
    else if (p.kind === 'cyl') { o.c = Lp(p.c); o.axis = Ld(p.axis || [1, 0, 0]); o.r = p.r; o.len = p.len; o.sides = p.sides || 24; }
    else if (p.kind === 'sphere') { o.c = Lp(p.c); o.r = p.r; }
    return o;
  });
}
/* Точка тела во внутренних координатах */
const bodyInt = (R, bind) => { const p = E.bodyPoint(R, bind); return [p[0], M.FLOOR - p[1], p[2]]; };
/* Рычаг: ось (pivot, axis) неподвижна, угол задаёт точка тела bind. Локальная рамка:
   X — вдоль оси, Y — от оси к точке тела (радиус), Z = X × Y (касательная). rot — доворот рамки, град. */
BIND.g4lever = (e, R) => {
  const P = e.pivot, A = unit(e.axis), T = bodyInt(R, e.bind), d = V.sub(T, P);
  let Y = V.sub(d, V.scale(A, V.dot(d, A)));
  Y = V.len(Y) > 1e-6 ? unit(Y) : E.ortho([0, -1, 0], A);
  let Z = V.cross(A, Y);
  if (e.rot) { const a = e.rot * D2R, c = Math.cos(a), s = Math.sin(a), y2 = V.add(V.scale(Y, c), Z, s); Z = V.add(V.scale(Z, c), Y, -s); Y = y2; }
  return rigid(e.id || 'lever', P, A, Y, Z, e.parts || [], e.mountTo);
};
/* Параллелограмм: два параллельных рычага (оси pivot + d0 и pivot + d0 + v) несут площадку, которая движется по дуге
   без поворота. Угол задаёт точка тела bind относительно pivot. carrier — детали площадки во внутренних осях,
   координаты от точки тела на дуге. */
BIND.g4link = (e, R) => {
  const P = e.pivot, A = unit(e.axis), T = bodyInt(R, e.bind), d = V.sub(T, P), rad = V.sub(d, V.scale(A, V.dot(d, A)));
  const rl = V.len(rad), u = unit(rad), Tp = V.add(V.add(P, A, V.dot(d, A)), u, rl);
  const p1 = V.add(P, e.d0), p2 = V.add(p1, e.v), E1 = V.add(p1, u, rl), E2 = V.add(p2, u, rl), w = e.armW || 6, xs = e.armX || [0];
  const parts = [];
  xs.forEach((x, i) => {
    const o = [x, 0, 0];
    parts.push({ name: 'armU' + i, kind: 'beam', a: V.add(p1, o), b: V.add(E1, o), w, h: w, up: [1, 0, 0], mount: e.mountTo });
    parts.push({ name: 'armL' + i, kind: 'beam', a: V.add(p2, o), b: V.add(E2, o), w, h: w, up: [1, 0, 0], mount: e.mountTo2 || e.mountTo });
    parts.push({ name: 'post' + i, kind: 'beam', a: V.add(V.add(E2, o), e.v, .2), b: V.add(V.add(E1, o), e.v, -.2), w: w - 1, h: w - 1, up: [0, 0, 1], mount: 'armU' + i });
  });
  for (const p of e.carrier || []) {
    const q = { ...p };
    if (p.c) q.c = V.add(Tp, p.c);
    if (p.a) { q.a = V.add(Tp, p.a); q.b = V.add(Tp, p.b); }
    parts.push(q);
  }
  return rigid(e.id || 'link', [0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1], parts, e.mountTo);
};
/* Каретка на прямой направляющей rail [от, до]: положение — проекция точки тела + shift.
   Рамка: Z — вдоль направляющей, Y — ближе всего к up, X = Y × Z. */
BIND.g4sled = (e, R) => {
  const A = e.rail[0], B = e.rail[1], Z = unit(V.sub(B, A)), T = bodyInt(R, e.bind);
  const s = Math.max(0, Math.min(V.dist(A, B), V.dot(V.sub(T, A), Z) + (e.shift || 0))), O = V.add(A, Z, s);
  const Y = E.ortho(unit(e.up || [0, 1, 0]), Z), X = V.cross(Y, Z);
  return rigid(e.id || 'sled', O, X, Y, Z, e.parts || [], e.mountTo);
};

/* ---------- Разгибание ног сидя ----------
   s: seatH — верх сиденья; seatZ — [задний, передний] край сиденья; back — {z0 (низ спинки у сиденья), ang (наклон
   от вертикали), len}; pivot — [y, z] оси колен; hubX — сторона рычага (−X — правая); handle — {x, y, z}. */
TYPES.legExtension = (s, b) => {
  const H = s.seatH, [z0, z1] = s.seatZ, T = 7, py = s.pivot[0], pz = s.pivot[1], hx = s.hubX, sx = Math.sign(hx);
  const a = s.back.ang * D2R, up = [0, Math.cos(a), -Math.sin(a)], nb = [0, Math.sin(a), Math.cos(a)];
  /* основание */
  b.tube('base', [0, 3.75, z0 - 32], [0, 3.75, z1 - 4], [8, 7.5], { mount: 'floor' });
  b.tube('baseB', [-34, 3.75, z0 - 26], [34, 3.75, z0 - 26], [8, 7.5], { mount: 'base' });
  b.tube('baseM', [-30, 3.75, z1 - 10], [30, 3.75, z1 - 10], [8, 7.5], { mount: 'base' });
  /* сиденье */
  const seatC = [0, H - T / 2, (z0 + z1) / 2];
  const under = pad(b, 'seat', seatC, [34, T, z1 - z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, (z0 + z1) / 2 - 4], [0, under[1] + .5, (z0 + z1) / 2 - 4], [7.5, 7.5], { mount: 'base' });
  /* спинка: низ у заднего края сиденья, наклон назад */
  const bl = s.back.len || 58, bot = [0, H + 2, s.back.z0], bc = V.add(V.add(bot, up, bl / 2), nb, -T / 2);
  const behind = pad(b, 'back', bc, [32, T, bl], [[1, 0, 0], nb, up], 'backStrut');
  b.tube('backStrut', [0, 7.5, z0 - 22], V.add(behind, nb, -.5), [6, 6], { mount: 'baseB' });
  /* стойка оси рычага сбоку, кулачок (диск) снаружи от рычага */
  b.tube('baseM2', [hx + sx * 7, 3.75, z1 - 10], [hx + sx * 7, 3.75, pz + 6], [7.5, 7.5], { mount: 'baseM' });
  b.tube('pivotPost', [hx + sx * 7, 7.5, pz - 2], [hx + sx * 7, py + 4, pz - 2], [7, 7], { mount: 'baseM2' });
  b.cyl('cam', [hx + sx * 3.5, py, pz], [1, 0, 0], 10, 3, { mount: 'pivotPost', sides: 28 });
  b.cyl('hub', [hx + sx * .5, py, pz], [1, 0, 0], 4.2, 3.4, { mount: 'cam', tone: 'chrome' });
  /* рукояти по бокам сиденья */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', hxp = sg * s.handle.x, hz = s.handle.z - 5;
    b.tube('hArm' + k, [sg * 14, H - T - 1.5, hz], [hxp, H - T - 1.5, hz], [4, 3], { mount: 'seatPlate' });
    b.tube('hPost' + k, [hxp, H - T - 1.5, hz], [hxp, s.handle.y, hz], [3.5, 3.5], { mount: 'hArm' + k });
    handle(b, 'handle' + k, [hxp, s.handle.y, hz], [hxp, s.handle.y, hz + 18], 1.6, 'hPost' + k);
  }
  /* стек грузов позади спинки */
  const sz = z0 - 46;
  stack(b, 'stk', [0, 0, sz], 150, { w: 30 });
  b.tube('stkLink', [0, 3.75, sz + 4], [0, 3.75, z0 - 30], [8, 7.5], { mount: 'stkBaseS' });
  b.anchor('pivot', [hx, py, pz]);
};

/* Наклонная подушка между двумя точками поверхности: from → to вдоль подушки, n — нормаль (вверх от поверхности),
   ширина w, толщина T. Пластина под подушкой крепится к mount. */
function padAlong(b, k, from, to, n, w, T, mount, opts = {}) {
  const z = unit(V.sub(to, from)), y = unit(n), x = unit(V.cross(y, z)), L = V.dist(from, to);
  const c = V.add(V.mix(from, to, .5), y, -T / 2);
  return pad(b, k, c, [w, T, L], [x, y, z], mount, opts);
}
/* ---------- Сгибание ног лёжа: скамья с изломом под тазом ----------
   s: hump [y, z] — линия излома (верх подушек); knee — [y, z] конец бедренной подушки; head — [y, z] конец грудной;
   nTh, nT — нормали подушек; pivot — [y, z] оси колен; hubX — сторона рычага; handle — {x, y, z}. */
TYPES.legCurl = (s, b) => {
  const T = 7, W = 32, H = [0, ...s.hump], Kp = [0, ...s.knee], Hd = [0, ...s.head], nTh = [0, ...s.nTh], nT = [0, ...s.nT];
  const [py, pz] = s.pivot, hx = s.hubX, sx = Math.sign(hx);
  const thB = padAlong(b, 'thighPad', Kp, H, nTh, W, T, 'beamTh');
  const toB = padAlong(b, 'chestPad', V.add(H, [0, 0, 1], .5), Hd, nT, W, T, 'beamT');
  /* балки под подушками и стойки */
  const dTh = unit(V.sub(H, Kp)), dT = unit(V.sub(Hd, H)), nThU = unit(nTh), nTU = unit(nT);
  const thA = V.add(V.add(Kp, dTh, 6), nThU, -T - 2 - 3), thZ = V.add(V.add(H, dTh, -2), nThU, -T - 2 - 3);
  b.tube('beamTh', thA, thZ, [8, 6], { mount: 'hump', up: nThU });
  const tA = V.add(V.add(H, dT, 2), nTU, -T - 2 - 3), tZ = V.add(V.add(Hd, dT, -6), nTU, -T - 2 - 3);
  b.tube('beamT', tA, tZ, [8, 6], { mount: 'hump', up: nTU });
  const hz = H[2] - 2;
  b.tube('hump', [0, 7.5, hz], [0, H[1] - T - 5, hz], [8, 8], { mount: 'base' });
  b.tube('base', [0, 3.75, s.knee[1] > 0 ? Kp[2] + 8 : Kp[2] + 8], [0, 3.75, Hd[2] + 30], [8, 7.5], { mount: 'floor' });
  b.tube('frontLeg', [0, 7.5, Hd[2] - 8], V.add(tZ, nTU, -2.5), [7, 7], { mount: 'base' });
  b.tube('baseF', [-32, 3.75, Hd[2] + 24], [32, 3.75, Hd[2] + 24], [8, 7.5], { mount: 'base' });
  b.tube('baseB', [-30, 3.75, Kp[2] + 12], [hx + sx * 11, 3.75, Kp[2] + 12], [8, 7.5], { mount: 'base' });
  b.tube('rearLeg', [0, 7.5, Kp[2] + 16], V.add(V.add(thA, dTh, 10), nThU, -2.5), [7, 7], { mount: 'baseB' });
  /* ось рычага: стойка от пола сбоку от колен, кулачок снаружи */
  b.tube('baseP', [hx + sx * 7, 3.75, Kp[2] + 12], [hx + sx * 7, 3.75, pz - 6], [7.5, 7.5], { mount: 'baseB' });
  b.tube('pivotUp', [hx + sx * 7, 7.5, pz], [hx + sx * 7, py + 4, pz], [6, 6], { mount: 'baseP' });
  b.cyl('cam', [hx + sx * 3.5, py, pz], [1, 0, 0], 10, 3, { mount: 'pivotUp', sides: 28 });
  b.cyl('hub', [hx + sx * .5, py, pz], [1, 0, 0], 4.2, 3.4, { mount: 'cam', tone: 'chrome' });
  /* рукояти под передним краем грудной подушки: наклонные стойки на поперечине, поперечина — на стойке от основания */
  const ha = unit([0, ...s.handle.ax]), top = [0, s.handle.y + ha[1] * 9, s.handle.z + ha[2] * 9];
  b.tube('hPost', [0, 7.5, top[2]], [0, top[1] + 2, top[2]], [6, 6], { mount: 'base' });
  b.tube('hBar', [-s.handle.x - 2, top[1], top[2]], [s.handle.x + 2, top[1], top[2]], [4, 4], { mount: 'hPost' });
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', g = [sg * s.handle.x, s.handle.y, s.handle.z];
    handle(b, 'handle' + k, V.add(g, ha, 9), V.add(g, ha, -8), 1.6, 'hBar');
  }
  /* стек грузов сбоку у грудной подушки */
  stack(b, 'stk', [hx + sx * 28, 0, (H[2] + Hd[2]) / 2], 140, { along: 'z', w: 30 });
  b.tube('stkLink', [hx + sx * 11, 3.75, Kp[2] + 12], [hx + sx * 11, 3.75, (H[2] + Hd[2]) / 2], [7.5, 7.5], { mount: 'baseB' });
  b.tube('stkLink2', [hx + sx * 11, 3.75, (H[2] + Hd[2]) / 2], [hx + sx * 24, 3.75, (H[2] + Hd[2]) / 2], [7.5, 7.5], { mount: 'stkBase' });
};

/* ---------- Гиперэкстензия 45° ----------
   Рамка от тела: H — середина тазобедренных [y, z]; d — вдоль ног к голове (45°), n — к полу со стороны живота.
   s: plate {c, n, size} — площадка для стоп; roll {u, v} — валики за голенями; pad {u0, u1, v} — упор для бёдер;
   beamV — смещение главной балки под ногами. */
TYPES.hyper45 = (s, b) => {
  const a = (s.ang || 45) * D2R, d = [0, Math.sin(a), Math.cos(a)], n = [0, -Math.cos(a), Math.sin(a)];
  const UV = (x, u, v) => [x, s.H[0] + d[1] * u + n[1] * v, s.H[1] + d[2] * u + n[2] * v];
  const bv = s.beamV, uFloor = (4 - s.H[0] - n[1] * bv) / d[1], uEnd = s.uEnd;
  const rear = UV(0, uFloor, bv), front = UV(0, uEnd, bv);
  b.tube('beam', rear, front, [8, 8], { mount: 'baseB', up: n });
  b.tube('baseB', [-34, 3.75, rear[2]], [34, 3.75, rear[2]], [8, 7.5], { mount: 'floor' });
  b.tube('rail', [0, 3.75, rear[2] - 4], [0, 3.75, front[2] + 4], [8, 7.5], { mount: 'floor' });
  b.tube('frontLeg', [0, 7.5, front[2]], V.add(front, [0, 1, 0], 2), [8, 8], { mount: 'rail' });
  b.tube('baseF', [-34, 3.75, front[2]], [34, 3.75, front[2]], [8, 7.5], { mount: 'rail' });
  /* площадка для стоп на кронштейне от балки */
  const pn = unit([0, ...s.plate.n]), pz = unit(V.cross([1, 0, 0], pn)), pc = [0, ...s.plate.c];
  b.box('plate', V.add(pc, pn, -2), [s.plate.size[0], 4, s.plate.size[1]], { axes: [[1, 0, 0], pn, pz], mount: 'plateArm', tone: 'rubber', round: .6 });
  const pBack = V.add(pc, pn, -4.5), onBeam = UV(0, V.dot(V.sub(pBack, UV(0, 0, 0)), d), bv);
  b.tube('plateArm', V.add(pBack, pn, 1), V.add(onBeam, n, -3), [6, 6], { mount: 'beam' });
  /* валики за голенями: поперечина на балке, боковые стойки снаружи ног, ось с двумя валиками */
  const ru = s.roll.u, rv = s.roll.v, rx = 22;
  b.tube('rollBar', UV(-rx - 3, ru, bv), UV(rx + 3, ru, bv), [6, 6], { mount: 'beam', up: d });
  for (const sg of [1, -1]) b.tube('rollPost' + (sg > 0 ? 'L' : 'R'), UV(sg * rx, ru, bv), UV(sg * rx, ru, rv - 3), [5, 5], { mount: 'rollBar', up: d });
  b.tube('axle', UV(-rx - 2, ru, rv), UV(rx + 2, ru, rv), 1.3, { mount: 'rollPostL', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('roll' + (sg > 0 ? 'L' : 'R'), UV(sg * 9.5, ru, rv), [1, 0, 0], s.roll.r || 5, 16, { mount: 'axle', tone: 'pad', role: 'support' });
  /* упор для бёдер: подушка на стойке от передней части балки */
  const pv = s.pad.v, back = pad(b, 'pad', UV(0, (s.pad.u0 + s.pad.u1) / 2, pv + 3.5), [s.pad.w || 42, 7, s.pad.u0 - s.pad.u1], [[1, 0, 0], V.scale(n, -1), d], 'padPost');
  b.tube('padPost', V.add(back, n, -1), V.add(front, d, -6), [7, 7], { mount: 'beam', up: [1, 0, 0] });
  /* рукояти по бокам упора */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', p0 = V.add(UV(sg * 20, (s.pad.u0 + s.pad.u1) / 2 - 4, pv + 9), [1, 0, 0], 0);
    b.tube('hArm' + k, V.add(p0, [1, 0, 0], -sg * 18), V.add(p0, [1, 0, 0], sg * 6), [4, 3], { mount: 'padPlate' });
    handle(b, 'handle' + k, V.add(p0, [1, 0, 0], sg * 6), V.add(V.add(p0, [1, 0, 0], sg * 6), n, 14), 1.6, 'hArm' + k);
  }
};

/* ---------- Жим ногами 45° ----------
   Направляющие под 45° идут вверх-вперёд (+Z); каретка с платформой — подвижная часть (BIND.g4sled).
   s: seat {c [y, z], ang (подъём переднего края), len}; back {c0 [y, z] — нижняя точка поверхности, ang (от горизонтали),
   len}; rail {a [y, z], b [y, z]} — осевая линия между направляющими; rx — полуширина колеи; handle {x, y, z}. */
TYPES.legPress45 = (s, b) => {
  const rx = s.rx || 28, A = [0, ...s.rail.a], B = [0, ...s.rail.b], d = unit(V.sub(B, A)), nu = [0, d[2], -d[1]];
  const T = 8, W = 40;
  /* основание */
  const zb = s.back.c0[1] - 46, zc = B[2];
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * (rx + 4), 3.75, zb], [sg * (rx + 4), 3.75, zc + 10], [8, 7.5], { mount: 'floor' });
  b.tube('baseC', [0, 3.75, zb], [0, 3.75, A[2] + 10], [8, 7.5], { mount: 'baseX' });
  b.tube('baseX', [-rx - 8, 3.75, A[2] - 4], [rx + 8, 3.75, A[2] - 4], [8, 7.5], { mount: 'baseL' });
  b.tube('baseXB', [-24, 3.75, zb + 4], [24, 3.75, zb + 4], [8, 7.5], { mount: 'baseC' });
  /* направляющие на наклонных балках; нижний конец — на поперечине со стойками, верхний — на колоннах */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * rx, a0 = V.add([x, A[1], A[2]], nu, -6.5), b0 = V.add([x, B[1], B[2]], nu, -6.5);
    b.tube('rb' + k, a0, b0, [8, 8], { mount: 'col' + k, up: nu });
    b.tube('rail' + k, [x, A[1], A[2]], [x, B[1], B[2]], 2.5, { mount: 'rb' + k, tone: 'chrome', role: 'guide' });
    b.tube('col' + k, [sg * (rx + 4), 7.5, b0[2] - 2], [sg * (rx + 4), b0[1] + 4, b0[2] - 2], [8, 8], { mount: 'base' + k });
    b.tube('leg' + k, [sg * (rx + 4), 7.5, a0[2] + 8], V.add(V.add(a0, d, 8), nu, -4), [7, 7], { mount: 'base' + k });
    b.box('stop' + k, V.add(V.add([x, B[1], B[2]], d, -3), nu, 3), [8, 6, 6], { axes: [[1, 0, 0], nu, d], mount: 'rail' + k, tone: 'rubber' });
  }
  b.tube('topX', [-rx - 8, B[1] - 6.5 * nu[1] + 4, B[2] - 2], [rx + 8, B[1] - 6.5 * nu[1] + 4, B[2] - 2], [8, 8], { mount: 'colL' });
  /* сиденье-«ковш» и спинка */
  const sa = s.seat.ang * D2R, sz = [0, Math.sin(sa), Math.cos(sa)], sy = [0, Math.cos(sa), -Math.sin(sa)];
  const sc = [0, ...s.seat.c], sl = s.seat.len || 40;
  const seatB = pad(b, 'seat', V.add(sc, sy, -T / 2), [W, T, sl], [[1, 0, 0], sy, sz], 'seatPost');
  const ba = s.back.ang * D2R, bz = [0, Math.sin(ba), -Math.cos(ba)], by = [0, Math.cos(ba), Math.sin(ba)];
  const bl = s.back.len || 84, bc = V.add(V.add([0, ...s.back.c0], bz, bl / 2), by, -T / 2);
  const backB = pad(b, 'back', bc, [W - 2, T, bl], [[1, 0, 0], by, bz], 'backStrut');
  b.tube('seatPost', [0, 7.5, seatB[2]], V.add(seatB, [0, 1, 0], .5), [8, 8], { mount: 'baseC' });
  b.tube('backStrut', [0, 7.5, zb + 4], V.add(backB, by, .5), [7, 7], { mount: 'baseXB' });
  b.tube('backLink', V.add(seatB, [0, 0, -1], 0), V.add(V.add([0, ...s.back.c0], bz, 10), by, -T - 2.5), [6, 6], { mount: 'seatPost' });
  /* наклонные рукояти по бокам сиденья: ось ручки перпендикулярна предплечью */
  const ha = unit([0, ...s.handle.ax]);
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', g = [sg * s.handle.x, s.handle.y, s.handle.z], lo = V.add(g, ha, -9), hi = V.add(g, ha, 9);
    b.tube('hPost' + k, [sg * (rx + 4), 7.5, lo[2]], [sg * (rx + 4), lo[1], lo[2]], [5, 5], { mount: 'base' + k });
    b.tube('hArm' + k, [sg * (rx + 4), lo[1], lo[2]], [g[0] + sg * 1.5, lo[1], lo[2]], [4, 4], { mount: 'hPost' + k });
    handle(b, 'handle' + k, V.add(lo, [sg, 0, 0], 0), hi, 1.6, 'hArm' + k);
  }
};

/* ---------- Брусья (отдельная стойка) ----------
   s: h — высота оси брусьев, x — полурасстояние между осями, z — [задний, передний] концы. */
TYPES.dipStation = (s, b) => {
  const H = s.h || 120, X = s.x || 28, [z0, z1] = s.z || [-32, 30], r = s.r || 2.2;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [sg * (X + 4), 3.75, z0 - 14], [sg * (X + 4), 3.75, z1 + 14], [8, 7.5], { mount: 'floor' });
    for (const [pk, z] of [['B', z0 + 3], ['F', z1 - 3]]) b.tube('post' + k + pk, [sg * (X + 4), 7.5, z], [sg * (X + 4), H - 3, z], [6, 6], { mount: 'base' + k });
    b.tube('head' + k, [sg * (X + 4), H - 3, z0 + 3], [sg * (X + 4), H - 3, z1 - 3], [6, 4], { mount: 'post' + k + 'B' });
    for (const [pk, z] of [['B', z0 + 3], ['F', z1 - 3]]) b.tube('lug' + k + pk, [sg * (X + 4), H - 1, z], [x, H - 1, z], [5, 3], { mount: 'head' + k });
    b.tube('bar' + k, [x, H, z0], [x, H, z1], r, { mount: 'lug' + k + 'B', role: 'grip', tone: 'chrome' });
  }
  b.tube('baseF', [-X - 8, 3.75, z1 + 10], [X + 8, 3.75, z1 + 10], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-X - 8, 3.75, z0 - 10], [X + 8, 3.75, z0 - 10], [8, 7.5], { mount: 'baseL' });
  b.tube('braceF', [-X - 4, 52, z1 - 3], [X + 4, 52, z1 - 3], [5, 5], { mount: 'postLF' });
};

/* ---------- Гравитрон (подтягивания и брусья с противовесом) ----------
   Пользователь стоит коленями на платформе лицом к башне (+Z). Рычаг платформы вращается вокруг оси в башне.
   s: tz — передняя плоскость башни; pivot [y, z]; pull {y, z, x0, x1} — рукояти подтягиваний (вдоль X);
   dip {y, x, z0} — брусья (вдоль Z до башни); step {y}. */
TYPES.gravitron = (s, b) => {
  const tz = s.tz, X = 30, H = 240, [py, pz] = s.pivot;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [x, 3.75, tz - 30], [x, 3.75, pz + 40], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [x, 7.5, tz], [x, H, tz], [8, 8], { mount: 'base' + k });
    b.tube('upB' + k, [x, 7.5, pz + 34], [x, H - 30, pz + 34], [7, 7], { mount: 'base' + k });
    b.tube('topS' + k, [x, H - 34, tz], [x, H - 34, pz + 34], [6, 6], { mount: 'up' + k });
    /* рукояти подтягиваний: кронштейн от башни назад, рукоять вдоль X */
    const ox = sg * (s.pull.x1 + 2);
    b.tube('pullArm' + k, [x, s.pull.y + 5, tz], [ox, s.pull.y + 5, s.pull.z], [6, 6], { mount: 'up' + k });
    b.tube('pullDrop' + k, [ox, s.pull.y + 5, s.pull.z], [ox, s.pull.y, s.pull.z], [4, 4], { mount: 'pullArm' + k });
    handle(b, 'pull' + k, [sg * s.pull.x0, s.pull.y, s.pull.z], [ox, s.pull.y, s.pull.z], 1.6, 'pullDrop' + k);
    /* брусья: от башни назад */
    b.tube('dipArm' + k, [x, s.dip.y, tz], [sg * s.dip.x, s.dip.y, tz - 6], [5, 5], { mount: 'up' + k });
    b.tube('dip' + k, [sg * s.dip.x, s.dip.y, tz - 6], [sg * s.dip.x, s.dip.y, s.dip.z0], 2.2, { mount: 'dipArm' + k, role: 'grip', tone: 'rubber' });
    /* ступени по бокам платформы */
    b.tube('stepArm' + k, [x, s.step.y - 3, tz], [x, s.step.y - 3, s.step.z0], [5, 5], { mount: 'up' + k });
    b.box('step' + k, [sg * (X - 4), s.step.y - .5, (tz + s.step.z0) / 2 - 8], [18, 3, tz - s.step.z0 - 16], { mount: 'stepArm' + k, tone: 'rubber', round: .5 });
  }
  b.tube('top', [-X - 4, H - 4, tz], [X + 4, H - 4, tz], [8, 8], { mount: 'upL' });
  b.tube('topB', [-X - 3, H - 34, pz + 34], [X + 3, H - 34, pz + 34], [6, 6], { mount: 'upBL' });
  b.tube('baseF', [-X - 4, 3.75, tz - 26], [X + 4, 3.75, tz - 26], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-X - 4, 3.75, pz + 38], [X + 4, 3.75, pz + 38], [8, 7.5], { mount: 'baseL' });
  /* ось рычага платформы: вал между стойками башни */
  /* оси параллелограмма платформы: две поперечные трубы между стойками башни */
  for (const [k, y] of [['U', py], ['D', py + s.linkV]]) {
    b.tube('shaft' + k, [-X, y, pz], [X, y, pz], 2.5, { mount: 'br' + k + 'L', tone: 'chrome' });
    for (const sg of [1, -1]) b.tube('br' + k + (sg > 0 ? 'L' : 'R'), [sg * X, y, tz], [sg * X, y, pz + 34], [6, 6], { mount: 'up' + (sg > 0 ? 'L' : 'R') });
  }
  /* стек грузов в башне за осью */
  stack(b, 'stk', [0, 0, pz + 18], H - 40, { w: 28, stackH: 70 });
};

/* ---------- «Капитанский стул» (станция для подъёма коленей) ----------
   s: back {z — плоскость спинки, y0, y1}; arm {x, y — верх упоров, z0, z1}; handle {x, y, z} — центр вертикальной рукояти. */
TYPES.captainsChair = (s, b) => {
  const T = 7, X = 34, bz = s.back.z, zr = bz - 12, a = s.arm;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * X;
    b.tube('base' + k, [x, 3.75, zr - 30], [x, 3.75, a.z1 + 22], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [x, 7.5, zr], [x, a.y + 30, zr], [8, 8], { mount: 'base' + k });
    b.tube('strut' + k, [x, 7.5, zr - 26], [x, 80, zr - 2], [6, 6], { mount: 'base' + k });
    /* упор для предплечья на кронштейне от стойки */
    b.tube('armBar' + k, [x, a.y - 9, zr], [x, a.y - 9, a.z1 + 4], [6, 6], { mount: 'up' + k });
    b.tube('armLink' + k, [x, a.y - 9, a.z0 + 8], [sg * a.x, a.y - 9, a.z0 + 8], [5, 4], { mount: 'armBar' + k });
    b.tube('armLink2' + k, [x, a.y - 9, a.z1 - 4], [sg * a.x, a.y - 9, a.z1 - 4], [5, 4], { mount: 'armBar' + k });
    pad(b, 'arm' + k, [sg * a.x, a.y - T / 2, (a.z0 + a.z1) / 2], [11, T, a.z1 - a.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'armLink' + k, { round: 1.8 });
    /* вертикальная рукоять на конце упора */
    const h = s.handle;
    b.tube('hBase' + k, [x, a.y - 9, a.z1 + 4], [sg * h.x, a.y - 9, h.z], [4, 4], { mount: 'armBar' + k });
    handle(b, 'handle' + k, [sg * h.x, a.y - 9, h.z], [sg * h.x, h.y + 9, h.z], 1.6, 'hBase' + k);
    /* ступени для подъёма */
    b.tube('stepArm' + k, [x, 34, zr], [x, 34, a.z0 + 14], [5, 5], { mount: 'up' + k });
    b.box('step' + k, [sg * (X + 4), 35.5, a.z0 + 4], [18, 3, 24], { mount: 'stepArm' + k, tone: 'rubber', round: .5 });
  }
  b.tube('baseB', [-X - 4, 3.75, zr - 28], [X + 4, 3.75, zr - 28], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-X - 4, 3.75, a.z1 + 18], [X + 4, 3.75, a.z1 + 18], [8, 7.5], { mount: 'baseL' });
  b.tube('topX', [-X - 4, a.y + 26, zr], [X + 4, a.y + 26, zr], [8, 8], { mount: 'upL' });
  b.tube('midX', [-X, (s.back.y0 + s.back.y1) / 2, zr], [X, (s.back.y0 + s.back.y1) / 2, zr], [6, 6], { mount: 'upL' });
  b.tube('lowX', [-X, s.back.y0 + 4, zr], [X, s.back.y0 + 4, zr], [6, 6], { mount: 'upL' });
  pad(b, 'back', [0, (s.back.y0 + s.back.y1) / 2, bz - T / 2], [34, T, s.back.y1 - s.back.y0], [[1, 0, 0], [0, 0, 1], [0, 1, 0]], 'midX');
};

/* ---------- Сидячий рычажный тренажёр (жим от груди, жим вверх, тяга с упором грудью) ----------
   s: seat {h, z0, z1}; pad {kind 'back' | 'chest', z — плоскость на высоте y0, ang — наклон назад от вертикали, y0, y1, w};
   hub {x, y, z} — оси рычагов (±x); tower {z, h} — башня со стеком (позади спинки или перед упором);
   foot {z, y} — подножка (необязательно). */
TYPES.seatedLever = (s, b) => {
  const T = 7, st = s.seat, pd = s.pad, hb = s.hub, tw = s.tower, TX = hb.x + 9;
  const zLo = Math.min(st.z0, tw.z) - 20, zHi = Math.max(st.z1, tw.z) + 20;
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * 30, 3.75, zLo], [sg * 30, 3.75, zHi], [8, 7.5], { mount: 'floor' });
  b.tube('baseS', [-34, 3.75, (st.z0 + st.z1) / 2], [34, 3.75, (st.z0 + st.z1) / 2], [8, 7.5], { mount: 'baseL' });
  b.tube('baseT', [-TX - 4, 3.75, tw.z], [TX + 4, 3.75, tw.z], [8, 7.5], { mount: 'baseL' });
  /* сиденье */
  const sc = [0, st.h - T / 2, (st.z0 + st.z1) / 2], under = pad(b, 'seat', sc, [38, T, st.z1 - st.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, sc[2]], [0, under[1] + .5, sc[2]], [8, 8], { mount: 'baseS' });
  /* спинка или грудной упор: плоскость z(y) = pd.z + (y − y0)·tan(ang)·dir */
  const a = pd.ang * D2R, dir = pd.kind === 'back' ? -1 : 1, up = [0, Math.cos(a), dir * Math.sin(a)], n = [0, Math.sin(a), -dir * Math.cos(a)];
  const L = pd.y1 - pd.y0, pc = V.add(V.add([0, pd.y0, pd.z], up, L / 2), n, -T / 2);
  const pb = pad(b, 'pad', pc, [pd.w || 34, T, L], [[1, 0, 0], n, up], 'padPost');
  const pp = V.add(pb, n, -.5);
  b.tube('padPost', [0, 7.5, pp[2]], pp, [7, 7], { mount: pd.kind === 'back' ? 'baseB' : 'baseC' });
  if (pd.kind === 'back') b.tube('baseB', [-30, 3.75, pp[2]], [30, 3.75, pp[2]], [8, 7.5], { mount: 'baseL' });
  else b.tube('baseC', [-30, 3.75, pp[2]], [30, 3.75, pp[2]], [8, 7.5], { mount: 'baseL' });
  /* башня: две стойки, верхняя поперечина, консоли к осям рычагов */
  const top = Math.max(tw.h, hb.y + 12);
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('up' + k, [sg * TX, 7.5, tw.z], [sg * TX, top, tw.z], [8, 8], { mount: 'baseT' });
    b.tube('hubArm' + k, [sg * TX, hb.y + 6, tw.z], [sg * TX, hb.y + 6, hb.z], [7, 7], { mount: 'up' + k });
    b.tube('hubDrop' + k, [sg * TX, hb.y + 6, hb.z], [sg * TX, hb.y, hb.z], [6, 6], { mount: 'hubArm' + k });
    b.cyl('hub' + k, [sg * (hb.x + 3), hb.y, hb.z], [1, 0, 0], 5, 9, { mount: 'hubDrop' + k, tone: 'chrome' });
  }
  b.tube('topX', [-TX - 4, top - 4, tw.z], [TX + 4, top - 4, tw.z], [8, 8], { mount: 'upL' });
  /* стек грузов за башней (со стороны от сиденья) */
  const sz = tw.z + (tw.z > st.z1 ? 24 : -24);
  stack(b, 'stk', [0, 0, sz], top - 8, { w: 30 });
  b.tube('stkLink', [0, 3.75, tw.z], [0, 3.75, sz + (sz > tw.z ? -10 : 10)], [8, 7.5], { mount: 'baseT' });
  /* подножка */
  if (s.foot) { b.tube('footBar', [-24, s.foot.y, s.foot.z], [24, s.foot.y, s.foot.z], 2, { mount: 'footPostL', tone: 'chrome' });
    for (const sg of [1, -1]) b.tube('footPost' + (sg > 0 ? 'L' : 'R'), [sg * 26, 3.75, s.foot.z], [sg * 26, s.foot.y + 2, s.foot.z], [5, 5], { mount: 'base' + (sg > 0 ? 'L' : 'R') }); }
};

/* ---------- Тренажёр отведения/приведения бёдер ----------
   Рычаги вращаются вокруг вертикальных осей под тазобедренными суставами. s: seat {c [y, z], ang, len};
   back {c0 [y, z], ang (от вертикали), len}; hub {x, y, z} — оси (±x), y — верх ступиц; handle {x, y, z}. */
TYPES.hipAbductor = (s, b) => {
  const T = 7, W = 40, hb = s.hub;
  const sa = s.seat.ang * D2R, sz = [0, Math.sin(sa), Math.cos(sa)], sy = [0, Math.cos(sa), -Math.sin(sa)], sl = s.seat.len;
  const sc = V.add([0, ...s.seat.c], sy, -T / 2), seatB = pad(b, 'seat', sc, [W, T, sl], [[1, 0, 0], sy, sz], 'hubPlate');
  const ba = s.back.ang * D2R, bz = [0, Math.cos(ba), -Math.sin(ba)], by = [0, Math.sin(ba), Math.cos(ba)], bl = s.back.len;
  const backB = pad(b, 'back', V.add(V.add([0, ...s.back.c0], bz, bl / 2), by, -T / 2), [W - 4, T, bl], [[1, 0, 0], by, bz], 'backStrut');
  /* плита ступиц под сиденьем, центральная стойка, основание */
  b.box('hubPlate', [0, seatB[1] - 1.5, hb.z], [30, 3, 24], { mount: 'post' });
  b.tube('post', [0, 7.5, hb.z - 14], [0, seatB[1] - 3, hb.z - 14], [8, 8], { mount: 'baseC' });
  b.tube('baseC', [0, 3.75, hb.z - 60], [0, 3.75, hb.z + 10], [8, 7.5], { mount: 'baseX' });
  b.tube('baseX', [-36, 3.75, hb.z - 50], [36, 3.75, hb.z - 50], [8, 7.5], { mount: 'floor' });
  b.tube('baseXF', [-30, 3.75, hb.z + 6], [30, 3.75, hb.z + 6], [8, 7.5], { mount: 'baseC' });
  for (const sg of [1, -1]) b.cyl('hub' + (sg > 0 ? 'L' : 'R'), [sg * hb.x, (hb.y - 12 + seatB[1] - 3) / 2, hb.z], [0, 1, 0], 4.2, seatB[1] - 3 - (hb.y - 12), { mount: 'hubPlate', tone: 'chrome' });
  b.tube('backStrut', [0, 7.5, hb.z - 46], V.add(backB, by, .5), [7, 7], { mount: 'baseX' });
  /* рукояти по бокам сиденья */
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R', x = sg * s.handle.x, hz = s.handle.z - 9;
    b.tube('hArm' + k, [sg * 12, seatB[1] - 1, hz], [x, seatB[1] - 1, hz], [4, 3], { mount: 'hubPlate' });
    b.tube('hPost' + k, [x, seatB[1] - 1, hz], [x, s.handle.y, hz], [3.5, 3.5], { mount: 'hArm' + k });
    handle(b, 'handle' + k, [x, s.handle.y, hz], [x, s.handle.y, hz + 18], 1.6, 'hPost' + k);
  }
  /* стек грузов позади спинки */
  stack(b, 'stk', [0, 0, hb.z - 70], 140, { w: 30 });
  b.tube('stkLink', [0, 3.75, hb.z - 60], [0, 3.75, hb.z - 54], [8, 7.5], { mount: 'baseX' });
};

/* ---------- Подъём на носки сидя (рычаг с упором на бёдра) ----------
   s: seat {h, z0, z1}; step {y — верх, z — край под подушечками, w}; pivot [y, z] — ось рычага у пола впереди. */
TYPES.seatedCalf = (s, b) => {
  const T = 7, st = s.seat, sp = s.step, [py, pz] = s.pivot;
  for (const sg of [1, -1]) b.tube('base' + (sg > 0 ? 'L' : 'R'), [sg * 33, 3.75, st.z0 - 10], [sg * 33, 3.75, pz + 14], [8, 7.5], { mount: 'floor' });
  b.tube('baseB', [-37, 3.75, st.z0 - 6], [37, 3.75, st.z0 - 6], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-37, 3.75, pz + 10], [37, 3.75, pz + 10], [8, 7.5], { mount: 'baseL' });
  const sc = [0, st.h - T / 2, (st.z0 + st.z1) / 2], under = pad(b, 'seat', sc, [38, T, st.z1 - st.z0], [[1, 0, 0], [0, 1, 0], [0, 0, 1]], 'seatPost');
  b.tube('seatPost', [0, 7.5, sc[2]], [0, under[1] + .5, sc[2]], [8, 8], { mount: 'baseS' });
  b.tube('baseS', [-33, 3.75, sc[2]], [33, 3.75, sc[2]], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB2', [0, 3.75, st.z0 - 6], [0, 3.75, sp.z + 2], [8, 7.5], { mount: 'baseB' });
  /* ступень: брус с прорезиненным верхом, край — под подушечками стоп */
  b.box('step', [0, sp.y / 2, sp.z + 9], [sp.w || 50, sp.y, 18], { mount: 'floor', tone: 'frame', round: .6 });
  b.box('stepTop', [0, sp.y + .5, sp.z + 9], [(sp.w || 50) - 2, 1, 17], { mount: 'step', tone: 'rubber', round: .3 });
  /* стойки оси рычага */
  for (const sg of [1, -1]) b.tube('pivPost' + (sg > 0 ? 'L' : 'R'), [sg * 37, 7.5, pz], [sg * 37, py + 4, pz], [7, 7], { mount: 'base' + (sg > 0 ? 'L' : 'R') });
  b.tube('axle', [-40, py, pz], [40, py, pz], 2.2, { mount: 'pivPostL', tone: 'chrome' });
};

/* ---------- Подъём на носки стоя (вертикальная каретка с плечевыми упорами) ----------
   s: zr — плоскость направляющих позади тела; rx — полурасстояние между направляющими; step {y, z — край, w}; top. */
TYPES.standingCalf = (s, b) => {
  const zr = s.zr, rx = s.rx || 24, top = s.top || 222, sp = s.step;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('base' + k, [sg * (rx + 10), 3.75, zr - 40], [sg * (rx + 10), 3.75, sp.z + 30], [8, 7.5], { mount: 'floor' });
    b.tube('up' + k, [sg * (rx + 10), 7.5, zr - 6], [sg * (rx + 10), top, zr - 6], [8, 8], { mount: 'base' + k });
    b.tube('rodLo' + k, [sg * (rx + 10), 40, zr - 6], [sg * rx, 40, zr], [5, 5], { mount: 'up' + k });
    b.tube('rodHi' + k, [sg * (rx + 10), top - 10, zr - 6], [sg * rx, top - 10, zr], [5, 5], { mount: 'up' + k });
    b.tube('rod' + k, [sg * rx, 38, zr], [sg * rx, top - 8, zr], 1.6, { mount: 'rodLo' + k, tone: 'chrome', role: 'guide' });
  }
  b.tube('topX', [-rx - 14, top - 4, zr - 6], [rx + 14, top - 4, zr - 6], [8, 8], { mount: 'upL' });
  b.tube('baseB', [-rx - 14, 3.75, zr - 36], [rx + 14, 3.75, zr - 36], [8, 7.5], { mount: 'baseL' });
  b.tube('baseF', [-rx - 14, 3.75, sp.z + 26], [rx + 14, 3.75, sp.z + 26], [8, 7.5], { mount: 'baseL' });
  /* ступень: подушечки стоп на заднем крае, пятки свисают назад */
  b.box('step', [0, sp.y / 2, sp.z + 12], [sp.w || 56, sp.y, 24], { mount: 'floor', round: .6 });
  b.box('stepTop', [0, sp.y + .5, sp.z + 12], [(sp.w || 56) - 2, 1, 23], { mount: 'step', tone: 'rubber', round: .3 });
  /* стек грузов позади направляющих */
  stack(b, 'stk', [0, 0, zr - 30], top - 10, { w: 30 });
};

/* ---------- Гакк-машина ----------
   Направляющие под 45° (вверх-назад); каретка со спинкой и плечевыми упорами — подвижная часть (BIND.g4sled).
   s: rail {a [y, z], b [y, z]} — осевая линия; rx — полуширина колеи; plate {c [y, z], ang (подъём носков), w, l}. */
TYPES.hackSquat = (s, b) => {
  const rx = s.rx || 22, A = [0, ...s.rail.a], B = [0, ...s.rail.b], d = unit(V.sub(B, A)), n = [0, d[2], -d[1]];
  const pl = s.plate, a = pl.ang * D2R, pu = [0, Math.cos(a), -Math.sin(a)], pf = [0, Math.sin(a), Math.cos(a)], pc = [0, ...pl.c];
  const zb = B[2] - 20, zf = pc[2] + pl.l / 2 + 10;
  for (const sg of [1, -1]) {
    const k = sg > 0 ? 'L' : 'R';
    b.tube('base' + k, [sg * (rx + 14), 3.75, zb], [sg * (rx + 14), 3.75, zf], [8, 7.5], { mount: 'floor' });
    const a0 = V.add([sg * rx, A[1], A[2]], n, 6.5), b0 = V.add([sg * rx, B[1], B[2]], n, 6.5);
    b.tube('rb' + k, a0, b0, [8, 8], { mount: 'colLink' + k, up: n });
    b.tube('rail' + k, [sg * rx, A[1], A[2]], [sg * rx, B[1], B[2]], 2.5, { mount: 'rb' + k, tone: 'chrome', role: 'guide' });
    b.tube('col' + k, [sg * (rx + 14), 7.5, b0[2]], [sg * (rx + 14), b0[1] + 4, b0[2]], [8, 8], { mount: 'base' + k });
    b.tube('colLink' + k, [sg * (rx + 14), b0[1], b0[2]], [sg * rx, b0[1], b0[2]], [6, 6], { mount: 'col' + k });
    b.tube('leg' + k, [sg * (rx + 14), 7.5, a0[2] + 4], [sg * (rx + 14), a0[1], a0[2] + 4], [7, 7], { mount: 'base' + k });
    b.tube('legLink' + k, [sg * (rx + 14), a0[1] - 2, a0[2] + 4], [sg * rx, a0[1] - 2, a0[2] + 4], [6, 6], { mount: 'leg' + k });
    b.box('stop' + k, V.add([sg * rx, A[1], A[2]], d, 6), [7, 7, 5], { axes: [[1, 0, 0], n, d], mount: 'rail' + k, tone: 'rubber' });
  }
  b.tube('topX', [-rx - 18, B[1] + 2, B[2] + 4], [rx + 18, B[1] + 2, B[2] + 4], [8, 8], { mount: 'colL' });
  b.tube('baseF', [-rx - 18, 3.75, zf - 4], [rx + 18, 3.75, zf - 4], [8, 7.5], { mount: 'baseL' });
  b.tube('baseB', [-rx - 18, 3.75, zb + 4], [rx + 18, 3.75, zb + 4], [8, 7.5], { mount: 'baseL' });
  /* наклонная площадка для стоп */
  b.box('plate', V.add(pc, pu, -2), [pl.w, 4, pl.l], { axes: [[1, 0, 0], pu, pf], mount: 'plateFrame', tone: 'rubber', round: .5 });
  const under = V.add(pc, pu, -6);
  b.box('plateFrame', under, [pl.w - 6, 4, pl.l - 4], { axes: [[1, 0, 0], pu, pf], mount: 'plateLegF' });
  const lo = V.add(under, pf, -(pl.l / 2 - 6)), hi = V.add(under, pf, pl.l / 2 - 6);
  b.tube('plateLegB', [0, 7.5, lo[2]], V.add(lo, pu, -1.5), [7, 7], { mount: 'plateBase' });
  b.tube('plateLegF', [0, 7.5, hi[2]], V.add(hi, pu, -1.5), [7, 7], { mount: 'plateBase' });
  b.tube('plateBase', [0, 3.75, lo[2] - 8], [0, 3.75, zf - 4], [8, 7.5], { mount: 'baseF' });
};

/* ---------- Скамья для пресса с обратным наклоном ----------
   Доска опускается к головному концу (−Z). s: pad {hi [y, z] — верхний край поверхности, lo [y, z] — нижний},
   knee {c [y, z], r} — валик под коленями; ankle {c [y, z], r} — валик перед голеностопами. */
TYPES.declineBench = (s, b) => {
  const T = 6, W = 30, hi = [0, ...s.pad.hi], lo = [0, ...s.pad.lo], dz = unit(V.sub(hi, lo)), n = [0, dz[2], -dz[1]];
  const under = padAlong(b, 'pad', lo, hi, n, W, T, 'beam');
  const bl = V.add(V.add(lo, dz, 8), n, -T - 2 - 3), bh = V.add(V.add(hi, dz, -4), n, -T - 2 - 3);
  b.tube('beam', bl, bh, [8, 6], { mount: 'legB', up: n });
  b.tube('legB', [0, 7.5, bl[2] + 4], V.add(bl, n, -2.5), [7, 7], { mount: 'baseB' });
  b.tube('baseB', [-26, 3.75, bl[2] + 4], [26, 3.75, bl[2] + 4], [8, 7.5], { mount: 'floor' });
  b.tube('rail', [0, 3.75, bl[2]], [0, 3.75, s.ankle.c[1] + 16], [8, 7.5], { mount: 'baseB' });
  /* стойка у верхнего края: держит доску, валик под коленями и валики перед голеностопами */
  const kc = [0, ...s.knee.c], ac = [0, ...s.ankle.c], pz = Math.max(kc[2], ac[2]) + 14;
  b.tube('post', [0, 7.5, bh[2]], V.add(bh, n, -2.5), [8, 8], { mount: 'rail' });
  b.tube('legPost', [0, 7.5, pz], [0, Math.max(kc[1], ac[1]) + 3, pz], [7, 7], { mount: 'rail' });
  b.tube('baseF', [-26, 3.75, pz], [26, 3.75, pz], [8, 7.5], { mount: 'rail' });
  b.tube('kArm', [0, kc[1], pz], [0, kc[1], kc[2]], [5, 5], { mount: 'legPost' });
  b.tube('kAxle', [-20, kc[1], kc[2]], [20, kc[1], kc[2]], 1.4, { mount: 'kArm', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('knee' + (sg > 0 ? 'L' : 'R'), [sg * 9.5, kc[1], kc[2]], [1, 0, 0], s.knee.r, 15, { mount: 'kAxle', tone: 'pad', role: 'support' });
  b.tube('aArm', [0, ac[1], pz], [0, ac[1], ac[2]], [5, 5], { mount: 'legPost' });
  b.tube('aAxle', [-20, ac[1], ac[2]], [20, ac[1], ac[2]], 1.4, { mount: 'aArm', tone: 'chrome' });
  for (const sg of [1, -1]) b.cyl('ankle' + (sg > 0 ? 'L' : 'R'), [sg * 9.5, ac[1], ac[2]], [1, 0, 0], s.ankle.r, 15, { mount: 'aAxle', tone: 'pad', role: 'support' });
};
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
