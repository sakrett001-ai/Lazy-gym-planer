/* Домашние предметы группы G5b: стена, дверь в проёме с ручкой, обеденный стол, стул, степ-платформа,
   диван (упор для пяток), сложенный коврик-подушка. Размеры — типовые бытовые (см):
   стена — 240 высотой, 12 толщиной; межкомнатная дверь 80×200, ручка-рычаг на высоте 100;
   стол — столешница 120×75×3, верх на 75, ножки 5×5; стул — сиденье 44×42 на высоте 45, спинка до 90;
   степ-платформа 80×32, высота 17; диван — сиденье 45, опоры 13.
   Локальные оси каждого предмета: x — ширина, y — вверх, z — к человеку (лицевая сторона предмета смотрит в +z).
   Полотенце у двери охватывает шейку ручки и идёт к кистям; концы свисают из кулаков. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, toCat } = M, { TYPES, BIND } = E;

  /* Сцена скругляет рёбра коробок пропорционально размеру (~8 %); у больших панелей (стена, дверное полотно)
     углы выглядели бы овальными. Угловые вставки чуть тоньше панели закрывают скругление — углы прямые. */
  function squareCorners(b, k, cx, W, H, T, tone, y0 = 0, zc = -T / 2) {
    const cw = Math.min(W / 2, Math.max(4, .1 * W)), ch = Math.min(H / 2, Math.max(4, .1 * H));
    for (const [n, sx, sy] of [['BL', 1, 0], ['BR', -1, 0], ['TL', 1, 1], ['TR', -1, 1]])
      b.box(k + 'Corner' + n, [cx + sx * (W / 2 - cw / 2), y0 + (sy ? H - ch / 2 : ch / 2), zc], [cw, ch, T - .3], { tone, mount: k, round: .2 });
  }
  /* Стена: лицевая плоскость z = 0, тело стены z ∈ [−t, 0]; внизу деревянный плинтус */
  TYPES.homeWall = (s, b) => {
    const W = s.w || 180, H = s.h || 240, T = s.t || 12;
    b.box('panel', [0, H / 2, -T / 2], [W, H, T], { role: 'support', tone: 'wall', mount: 'floor', round: .3, contact: 'face' });
    squareCorners(b, 'panel', 0, W, H, T, 'wall');
    if (s.skirt !== false) b.box('skirt', [0, 3.5, .6], [W, 7, 1.2], { tone: 'wood', mount: 'panel', round: .2 });
    b.anchor('face', [0, 0, 0]);
  };

  /* Дверь в проёме: стена с проёмом, дверная коробка, наличники, полотно, упорная планка (притвор),
     петли и ручки-рычаги с обеих сторон. Дверь открывается от человека: притвор со стороны человека,
     поэтому при тяге полотно прижимается к коробке. side: +1 — ручка у края +x (локально). */
  TYPES.homeDoor = (s, b) => {
    const W = s.w || 220, H = s.h || 240, T = s.t || 12, dw = s.dw || 80, dh = s.dh || 200, hh = s.handleH || 100, sg = s.side || 1;
    const jt = 2.5, gap = .3, ow = dw / 2 + gap + jt, oh = dh + gap + jt;
    /* стена по обе стороны проёма и надпроёмная часть */
    for (const k of [1, -1]) b.box('wall' + (k > 0 ? 'L' : 'R'), [k * (ow + (W / 2 - ow) / 2), H / 2, -T / 2], [W / 2 - ow, H, T], { role: 'support', tone: 'wall', mount: 'floor', round: .3 });
    b.box('header', [0, (oh + H) / 2, -T / 2], [2 * ow, H - oh, T], { tone: 'wall', mount: 'wallL', round: .1 });
    squareCorners(b, 'header', 0, 2 * ow, H - oh, T, 'wall', oh);
    /* коробка */
    for (const k of [1, -1]) b.box('jamb' + (k > 0 ? 'L' : 'R'), [k * (dw / 2 + gap + jt / 2), oh / 2, -T / 2], [jt, oh, T], { tone: 'wood', mount: 'wall' + (k > 0 ? 'L' : 'R'), round: .2 });
    b.box('jambTop', [0, dh + gap + jt / 2, -T / 2], [2 * ow, jt, T], { tone: 'wood', mount: 'header', round: .2 });
    /* притвор (упорная планка) со стороны человека: z ∈ [−4, −2.5] */
    for (const k of [1, -1]) b.box('stop' + (k > 0 ? 'L' : 'R'), [k * (dw / 2 + gap - .7), dh / 2, -3.25], [1.4, dh, 1.5], { tone: 'wood', mount: 'jamb' + (k > 0 ? 'L' : 'R'), round: .2 });
    b.box('stopTop', [0, dh + gap - .7, -3.25], [dw + 2 * gap, 1.4, 1.5], { tone: 'wood', mount: 'jambTop', round: .2 });
    /* наличники */
    for (const k of [1, -1]) b.box('casing' + (k > 0 ? 'L' : 'R'), [k * (ow + 2.5), (oh + 6) / 2, .75], [7, oh + 6, 1.5], { tone: 'wood', mount: 'wall' + (k > 0 ? 'L' : 'R'), round: .3 });
    b.box('casingTop', [0, oh + 3, .75], [2 * ow + 12, 6, 1.5], { tone: 'wood', mount: 'header', round: .3 });
    /* полотно 4 см: z ∈ [−8, −4], зазор у пола 1 см; висит на петлях у края −sg */
    const leafZ = -6;
    b.box('leaf', [0, (dh + 1) / 2, leafZ], [dw, dh - 1, 4], { tone: 'wood', mount: 'hingeB', round: .3 });
    squareCorners(b, 'leaf', 0, dw, dh - 1, 4, 'wood', 1, leafZ);
    for (const k of [1, -1]) squareCorners(b, 'wall' + (k > 0 ? 'L' : 'R'), k * (ow + (W / 2 - ow) / 2), W / 2 - ow, H, T, 'wall');
    for (const [k, y] of [['B', 22], ['T', dh - 22]]) b.cyl('hinge' + k, [-sg * (dw / 2 + gap / 2), y, -8.6], [0, 1, 0], .8, 10, { tone: 'chrome', mount: 'jamb' + (sg > 0 ? 'R' : 'L') });
    /* ручки: розетка, шейка, рычаг к петлям; со стороны человека и с обратной */
    const hx = sg * (dw / 2 - 6);
    for (const [k, face, dir] of [['', -4, 1], ['Back', -8, -1]]) {
      b.cyl('rose' + k, [hx, hh, face + dir * .6], [0, 0, 1], 2.8, 1.2, { tone: 'chrome', mount: 'leaf' });
      b.cyl('neck' + k, [hx, hh, face + dir * 3.6], [0, 0, 1], 1.0, 5.2, { tone: 'chrome', mount: 'rose' + k });
      b.tube('lever' + k, [hx + sg * .6, hh, face + dir * 6.4], [hx - sg * 11.5, hh, face + dir * 7.4], 1.1, { tone: 'chrome', mount: 'neck' + k, role: 'grip' });
    }
    b.anchor('handle', [hx, hh, -4 + 3.4]);
    b.anchor('face', [0, 0, 0]);
  };

  /* Обеденный стол: столешница L×W×T, верх на высоте H; ножки 5×5 у углов; царги только по торцам,
     чтобы под длинным краем было свободно (тяга под столом за длинный край). */
  TYPES.homeTable = (s, b) => {
    const H = s.h || 75, L = s.len || 120, W = s.width || 75, T = s.t || 3, inset = 4, leg = 5;
    b.box('top', [0, H - T / 2, 0], [L, T, W], { role: 'support', tone: 'wood', mount: 'apronL', round: .5, contact: 'top' });
    const lx = L / 2 - inset - leg / 2, lz = W / 2 - inset - leg / 2;
    for (const [k, x, z] of [['FL', lx, lz], ['FR', -lx, lz], ['BL', lx, -lz], ['BR', -lx, -lz]]) b.tube('leg' + k, [x, 0, z], [x, H - T, z], [leg, leg], { tone: 'wood', mount: 'floor' });
    for (const k of [1, -1]) b.box('apron' + (k > 0 ? 'L' : 'R'), [k * lx, H - T - 4.5, 0], [2.5, 9, 2 * lz - leg], { tone: 'wood', mount: 'leg' + (k > 0 ? 'FL' : 'FR'), round: .3 });
    b.anchor('edgeF', [0, H, W / 2]);
    b.anchor('top', [0, H, 0]);
  };

  /* Стул: сиденье sw×sd×st, верх на seatH; передний край сиденья — +z; ножки 4×4, царги под сиденьем,
     задние ножки продолжаются в стойки спинки до высоты back. */
  TYPES.homeChair = (s, b) => {
    const H = s.seatH || 45, sw = s.sw || 44, sd = s.sd || 42, st = s.st || 3, back = s.back || 90, leg = 4;
    const lx = sw / 2 - 2.5 - leg / 2, zf = sd / 2 - 3 - leg / 2, zb = -(sd / 2 - 1 - leg / 2), ay = H - st;
    b.box('seat', [0, H - st / 2, 0], [sw, st, sd], { role: 'support', tone: 'wood', mount: 'apronF', round: .6, contact: 'top' });
    for (const [k, x] of [['L', lx], ['R', -lx]]) {
      b.tube('legF' + k, [x, 0, zf], [x, ay, zf], [leg, leg], { tone: 'wood', mount: 'floor' });
      b.tube('legB' + k, [x, 0, zb], [x, back, zb], [leg, leg], { tone: 'wood', mount: 'floor' });
      b.box('apron' + k, [x, ay - 3.5, (zf + zb) / 2], [2, 7, zf - zb - leg], { tone: 'wood', mount: 'legF' + k, round: .2 });
    }
    b.box('apronF', [0, ay - 3.5, zf], [2 * lx - leg, 7, 2], { tone: 'wood', mount: 'legFL', round: .2 });
    b.box('apronB', [0, ay - 3.5, zb], [2 * lx - leg, 7, 2], { tone: 'wood', mount: 'legBL', round: .2 });
    b.box('backRest', [0, back - 12, zb], [2 * lx - leg, 18, 2], { tone: 'wood', mount: 'legBL', round: .4 });
    b.box('backRail', [0, H + 12, zb], [2 * lx - leg, 5, 2], { tone: 'wood', mount: 'legBL', round: .3 });
    b.anchor('seatFront', [0, H, sd / 2]);
    b.anchor('seat', [0, H, 0]);
  };

  /* Степ-платформа: дека с резиновым покрытием на двух опорах по краям; верх на высоте h */
  TYPES.homeStep = (s, b) => {
    const H = s.h || 17, L = s.len || 80, D = s.depth || 32;
    b.box('top', [0, H - .4, 0], [L - 1, .8, D - 1], { role: 'support', tone: 'mat', mount: 'deck', round: .3, contact: 'top' });
    b.box('deck', [0, H - .8 - 2, 0], [L, 4, D], { tone: 'frame', mount: 'riserL', round: .8 });
    for (const k of [1, -1]) b.box('riser' + (k > 0 ? 'L' : 'R'), [k * (L / 2 - 8), (H - 4.8) / 2, 0], [14, H - 4.8, D - 2], { tone: 'frame', mount: 'floor', round: .6 });
    b.anchor('top', [0, H, 0]);
  };

  /* Диван: лицевая сторона z = 0, глубина d; низ каркаса на высоте опор (под него заводят пятки) */
  TYPES.homeSofa = (s, b) => {
    const W = s.w || 180, D = s.d || 88, hb = s.legH || 13, seat = s.seatH || 45, back = s.backH || 84, arm = s.armH || 62, aw = 16;
    for (const [k, x, z] of [['FL', W / 2 - 9, -7], ['FR', -(W / 2 - 9), -7], ['BL', W / 2 - 9, -D + 7], ['BR', -(W / 2 - 9), -D + 7]]) b.box('foot' + k, [x, hb / 2, z], [5, hb, 5], { tone: 'wood', mount: 'floor', round: .8 });
    b.box('base', [0, hb + (seat - 7 - hb) / 2, -D / 2], [W, seat - 7 - hb, D], { role: 'support', tone: 'pad', mount: 'footFL', round: 2 });
    b.box('cushion', [0, seat - 3.5, -D / 2 + 4], [W - 2 * aw, 7, D - 8], { role: 'support', tone: 'pad', mount: 'base', round: 2.5 });
    for (const k of [1, -1]) b.box('arm' + (k > 0 ? 'L' : 'R'), [k * (W / 2 - aw / 2), (seat - 7 + arm) / 2, -D / 2], [aw, arm - seat + 7, D], { tone: 'pad', mount: 'base', round: 3 });
    b.box('back', [0, (seat - 7 + back) / 2, -D + 10], [W - 2 * aw, back - seat + 7, 20], { tone: 'pad', mount: 'base', round: 3 });
    b.anchor('front', [0, hb, 0]);
  };

  /* Мягкая подушка / сложенный коврик на полу */
  TYPES.homeCushion = (s, b) => {
    const t = s.t || 4, w = s.w || 50, l = s.len || 60;
    b.box('pad', [0, t / 2, 0], [w, t, l], { role: 'support', tone: s.tone || 'pad', mount: 'floor', round: Math.min(1.5, t / 2 - .2) });
    b.anchor('top', [0, t, 0]);
  };

  /* Полотенце, охватывающее неподвижную точку (шейку дверной ручки): петля вокруг оси axis,
     две ветви к кистям и концы, свисающие из кулаков. Координаты from/axis — внутренние (Y вверх). */
  BIND.homeTowel = (e, R) => {
    const id = e.id || 'towel', r = e.r || 1.5, out = [], P = toCat(e.from), ax = V.unit([e.axis?.[0] ?? 0, -(e.axis?.[1] ?? 0), e.axis?.[2] ?? 1]);
    const hands = e.hands || ['L', 'R'], mid = V.mix(R.gripL, R.gripR, .5), toMid = V.unit(V.sub(mid, P));
    const side = V.unit(V.sub(R.gripL, R.gripR)), rr = (e.around || 1.0) + r;
    /* петля вокруг шейки: верхняя дуга (перекинута через шейку) */
    const up = V.unit(V.perp([0, -1, 0], ax)), sideAx = V.unit(V.cross(ax, up));
    const loop = []; for (let i = 0; i <= 8; i++) { const a = Math.PI * i / 8; loop.push(V.add(V.add(P, sideAx, Math.cos(a) * rr), up, Math.sin(a) * rr)); }
    out.push({ kind: 'cable', pts: loop, r, tone: 'towel', role: 'grip', id: id + ':loop', mount: e.mountTo || 'floor' });
    for (const s of hands) {
      const g = R['grip' + s], hz = R.frames['hand' + s].z, start = V.add(P, sideAx, (s === 'L' ? 1 : -1) * (V.dot(side, sideAx) >= 0 ? 1 : -1) * rr);
      const into = V.dot(V.sub(start, g), hz) >= 0 ? 1 : -1, entry = V.add(g, hz, into * 3.2), exit = V.add(g, hz, -into * 4.2);
      const down = [0, 1, 0], tail = V.add(V.add(exit, hz, -into * 2.5), down, e.tail ?? 9);
      out.push({ kind: 'cable', pts: [start, entry, exit, tail], r, tone: 'towel', role: 'grip', id: id + ':' + s, mount: id + ':loop' });
    }
    return out;
  };

  /* Полотенце под стопой: середина под подошвой поперёк стопы, ветви поднимаются по сторонам стопы к кистям. */
  BIND.homeTowelFoot = (e, R) => {
    const id = e.id || 'towel', s = e.foot || 'R', r = e.r || 1.4, out = [], f = R.frames['foot' + s], t = R.frames['toes' + s];
    const g = M.SIGN[s], lat = V.scale(f.x, g); /* f.x в каталоге — левая сторона тела */
    const c = V.add(V.add(R['an' + s], f.z, e.at ?? 5), f.y, -(M.B.ankle + r - .4));
    const hw = 5.4 + r, a = V.add(c, lat, -hw), bb = V.add(c, lat, hw);
    out.push({ kind: 'cable', pts: [a, c, bb], r, tone: 'towel', role: 'grip', id: id + ':under', mount: 'body' });
    for (const h of e.hands || ['L', 'R']) {
      const gr = R['grip' + h], hz = R.frames['hand' + h].z, from = V.dot(V.sub(a, bb), V.sub(R['grip' + h], c)) > 0 ? a : bb;
      const into = V.dot(V.sub(from, gr), hz) >= 0 ? 1 : -1, entry = V.add(gr, hz, into * 3.2), exit = V.add(gr, hz, -into * 4.2);
      const rise = V.add(from, f.y, 3);
      out.push({ kind: 'cable', pts: [from, rise, entry, exit, V.add(V.add(exit, hz, -into * 2), [0, 1, 0], e.tail ?? 8)], r, tone: 'towel', role: 'grip', id: id + ':' + h, mount: id + ':under' });
    }
    return out;
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
