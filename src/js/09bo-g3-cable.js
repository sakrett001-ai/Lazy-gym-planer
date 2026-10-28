/* Тренажёры группы G3: блочные тренажёры и эспандеры.
   g3Tower      — блочная колонна: основание, стойки 7,5×7,5, стек грузов на направляющих, вертикальная
                  направляющая с кареткой блока (регулировка высоты), поворотный блок, ручки-упоры на стойках;
   g3Crossover  — кроссовер: две такие колонны лицом друг к другу, верхняя перемычка;
   g3LatPulldown — тяга верхнего блока: сиденье, валики-упоры для бёдер, колонна со стеком, вылет с блоком;
   g3SeatedRow  — тяга горизонтального блока: длинная скамья, наклонные упоры для стоп, поворотный блок между ними,
                  колонна со стеком, нижний и верхний блоки стека (путь троса — опорная точка cableRun);
   g3Door       — участок стены с дверью и креплением для эспандера (вверху или сбоку на нужной высоте).
   Подвижные части: BIND.g3cable — трос с поворотным кронштейном блока (вилка, ось вращения), сход троса
   по касательной к колесу и подъём выбранных плит стека на величину вытянутого троса; манжета на голеностоп
   (лента 7,5 см, D-кольцо, карабин — E.ankleCuff); BIND.g3towelRoll — валик между локтем и боком (Ø6,5 × 14 см).
   Размеры (см): стойки 7,5×7,5, высота колонн 218–222, колесо блока Ø9 (блоки стека горизонтальной тяги — Ø10), плиты стека 32×14×2,4,
   сиденье тяги верхнего блока 46, скамья горизонтальной тяги 44, дверной проём 80×203. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, M3, toCat, dirCat } = M, { TYPES, BIND } = E;
  const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  /* Узел внутри снаряда: свой сдвиг и разворот, ключи деталей с префиксом; mount '/k' — деталь снаряда без префикса */
  function Sub(b, pre, o = [0, 0, 0], yaw = 0) {
    const R = M3.ry(yaw), P = p => V.add(o, M3.v(R, p)), D = d => M3.v(R, d);
    const mnt = m => m == null || m === 'floor' ? 'floor' : m[0] === '/' ? m.slice(1) : pre + m;
    const op = (opts = {}) => { const r = { ...opts, mount: mnt(opts.mount), axes: (opts.axes || I3).map(D) }; if (opts.up) r.up = D(opts.up); return r; };
    return {
      P, D, pre,
      tube: (k, a, c, size, opts) => b.tube(pre + k, P(a), P(c), size, op(opts)),
      box: (k, c, size, opts) => b.box(pre + k, P(c), size, op(opts)),
      cyl: (k, c, axis, r, len, opts) => b.cyl(pre + k, P(c), D(axis), r, len, op(opts)),
      ball: (k, c, r, opts) => b.ball(pre + k, P(c), r, op(opts)),
      anchor: (k, p) => b.anchor(pre + k, P(p)),
      frame: (k, c, axes = I3) => b.frameAnchor(pre + k, P(c), axes.map(D)),
      raw: (k, v) => { b.anchors[pre + k] = v; return v; }
    };
  }
  const PITCH = 2.6, PLATE = [32, 2.4, 14];
  /* Стек грузов между стойками (в осях узла: стек в плоскости z=0, перед ним — сторона пользователя +Z).
     Нижние плиты неподвижны, верхние (выбранные штырём) поднимаются вместе с верхней плитой — их строит BIND. */
  function stack(t, { x0 = 0, z0 = 0, H, n = 15, sel = 5, base = 'baseM', y0 = 7.5, topY }) {
    t.tube('rodL', [x0 + 10, y0, z0], [x0 + 10, H - 7.5, z0], 1.25, { mount: base, tone: 'chrome', role: 'guide' });
    t.tube('rodR', [x0 - 10, y0, z0], [x0 - 10, H - 7.5, z0], 1.25, { mount: base, tone: 'chrome', role: 'guide' });
    t.box('bump', [x0, y0 + 2, z0], [28, 4, 12], { mount: base, tone: 'rubber', round: .8 });
    const yb = y0 + 4;
    for (let i = 0; i < n - sel; i++) t.box('plate' + i, [x0, yb + i * PITCH + PLATE[1] / 2, z0], PLATE, { mount: 'rodL', tone: 'stack', round: .35 });
    const o = [x0, yb + (n - sel) * PITCH, z0];
    t.frame('stack', o);
    t.raw('stackInfo', { sel, pitch: PITCH, size: PLATE, topY: topY ?? H - 7.5, rod: t.pre + 'rodL', maxLift: (topY ?? H - 7.5) - o[1] - sel * PITCH - 16 });
  }
  /* Блочная колонна в осях узла: стойки и стек при z=0, направляющая каретки при z=11,5, колесо блока при z=25 */
  function tower(t, { H = 218, h = 100, grab = true, n = 15, sel = 5, lowRail = false }) {
    const X = 27, RZ = 11.5, hh = Math.max(20, Math.min(H - 20, h));
    t.tube('baseL', [X + 3, 3.75, -40], [X + 3, 3.75, 34], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseR', [-X - 3, 3.75, -40], [-X - 3, 3.75, 34], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseB', [-X - 3, 3.75, -36], [X + 3, 3.75, -36], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseM', [-X - 3, 3.75, 0], [X + 3, 3.75, 0], [7.5, 7.5], { mount: 'floor' });
    t.tube('baseF', [-X - 3, 3.75, RZ], [X + 3, 3.75, RZ], [7.5, 7.5], { mount: 'floor' });
    for (const [k, x] of [['L', X + 3], ['R', -X - 3]]) for (const [kk, z] of [['F', 34.5], ['B', -40.5]]) t.box('cap' + k + kk, [x, 3.75, z], [8, 7.5, 1.2], { mount: 'base' + k, tone: 'rubber', round: .4 });
    t.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    t.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    t.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    /* подкосы стоек к заднему основанию */
    t.tube('braceL', [X, 7.5, -32], [X, 60, -3.75], [5, 5], { mount: 'baseL', up: [1, 0, 0] });
    t.tube('braceR', [-X, 7.5, -32], [-X, 60, -3.75], [5, 5], { mount: 'baseR', up: [1, 0, 0] });
    stack(t, { H, n, sel });
    /* направляющая каретки и каретка с фиксатором */
    t.tube('rail', [0, 7.5, RZ], [0, H - 7.5, RZ], [7.5, 7.5], { mount: 'baseF', up: [0, 0, 1] });
    t.tube('railTop', [0, H - 3.75, 0], [0, H - 3.75, RZ + 3.75], [7.5, 7.5], { mount: 'top' });
    for (let y = 30; y < H - 20; y += 15) t.box('mark' + y, [0, y, RZ + 3.8], [2.2, 1.2, .4], { mount: 'rail', tone: 'rubber', round: .2 });
    t.box('carriage', [0, hh, RZ], [11, 20, 11], { mount: 'rail', round: 1 });
    t.cyl('pinShaft', [7.5, hh + 5, RZ], [1, 0, 0], 1, 5, { mount: 'carriage', tone: 'chrome' });
    t.ball('pinKnob', [10.8, hh + 5, RZ], 1.8, { mount: 'pinShaft', tone: 'rubber' });
    t.cyl('swivel', [0, hh, RZ + 6.7], [0, 0, 1], 2.6, 2.4, { mount: 'carriage', tone: 'chrome' });
    t.anchor('pulley', [0, hh, 27]);
    t.anchor('swivelPt', [0, hh, RZ + 7.9]);
    /* ручки-упоры на передней грани стоек */
    if (grab) for (const [k, x] of [['L', X], ['R', -X]]) {
      for (const y of [92, 158]) t.tube('grabArm' + k + y, [x, y, 3.75], [x, y, 10], [3, 3], { mount: 'up' + k });
      t.tube('grab' + k, [x, 90, 10], [x, 160, 10], 1.6, { mount: 'grabArm' + k + '92', tone: 'rubber', role: 'grip' });
      t.anchor('grab' + k, [x, 125, 10]);
    }
    t.anchor('railFront', [0, 0, RZ + 3.75]);
    return { H, X, RZ };
  }
  /* Одиночная блочная колонна: лицевая сторона (каретка, блок) смотрит в +Z снаряда */
  TYPES.g3Tower = (s, b) => { tower(Sub(b, ''), s); };
  /* Кроссовер: колонны при x = ±span/2 лицом к центру, верхняя перемычка; hL/hR — высота блоков */
  TYPES.g3Crossover = (s, b) => {
    const span = s.span || 330, H = s.H || 222;
    tower(Sub(b, 'L', [span / 2, 0, 0], -90), { H, h: s.hL ?? s.h ?? 200, grab: false });
    tower(Sub(b, 'R', [-span / 2, 0, 0], 90), { H, h: s.hR ?? s.h ?? 200, grab: false });
    b.tube('bridge', [-span / 2 + 3.75, H - 5, 0], [span / 2 - 3.75, H - 5, 0], [7.5, 10], { mount: 'Ltop' });
    b.anchor('center', [0, 0, 0]);
  };
  /* Тяга верхнего блока. Начало координат — центр сиденья на полу; пользователь смотрит в +Z.
     seatH — верх сиденья; padH, padZ — ось валиков; colZ — плоскость стека; pulley — центр колеса верхнего блока [y, z]. */
  TYPES.g3LatPulldown = (s, b) => {
    const seatH = s.seatH || 46, padH = s.padH || 66, padZ = s.padZ ?? 26, colZ = s.colZ ?? 92, H = s.H || 220, py = s.pulleyY ?? (H - 10.1), pz = s.pulleyZ ?? 18, X = 26;
    b.tube('rail', [0, 3.75, -32], [0, 3.75, colZ + 34], [10, 7.5], { mount: 'floor' });
    b.tube('footB', [-30, 3.75, -28], [30, 3.75, -28], [7.5, 7.5], { mount: 'rail' });
    b.tube('footF', [-X - 4, 3.75, colZ], [X + 4, 3.75, colZ], [7.5, 7.5], { mount: 'rail' });
    b.tube('footF2', [-X - 4, 3.75, colZ + 30], [X + 4, 3.75, colZ + 30], [7.5, 7.5], { mount: 'rail' });
    for (const [k, x] of [['L', X + 4], ['R', -X - 4]]) b.tube('side' + k, [x, 3.75, colZ - 3.75], [x, 3.75, colZ + 33.75], [7.5, 7.5], { mount: 'footF' });
    /* сиденье */
    b.tube('seatPost', [0, 7.5, -4], [0, seatH - 8, -4], [7.5, 7.5], { mount: 'rail', up: [0, 0, 1] });
    b.box('seatPlate', [0, seatH - 7, -2], [30, 2, 30], { mount: 'seatPost' });
    b.box('seat', [0, seatH - 3, 0], [40, 6, 38], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.tube('seatBrace', [0, 7.5, -26], [0, seatH - 9, -6], [5, 5], { mount: 'rail', up: [1, 0, 0] });
    /* валики-упоры для бёдер: стойка перед коленями между голенями, кронштейн назад к оси валиков */
    const postZ = padZ + 22;
    b.tube('padPost', [0, 7.5, postZ], [0, padH + 3, postZ], [6, 6], { mount: 'rail', up: [0, 0, 1] });
    b.tube('padArm', [0, padH, postZ + 3], [0, padH, padZ], [5, 5], { mount: 'padPost' });
    b.cyl('padAxle', [0, padH, padZ], [1, 0, 0], 1.6, 46, { mount: 'padArm', tone: 'chrome' });
    for (const [k, x] of [['L', 13.5], ['R', -13.5]]) b.cyl('roller' + k, [x, padH, padZ], [1, 0, 0], 6.5, 19, { mount: 'padAxle', tone: 'pad', role: 'support' });
    b.box('padPin', [0, padH - 9, postZ + 3.5], [3, 2, 2], { mount: 'padPost', tone: 'rubber', round: .4 });
    /* колонна со стеком и вылетом */
    const t = Sub(b, '', [0, 0, colZ], 0);
    t.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 10], { mount: '/footF', up: [0, 0, 1] });
    t.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 10], { mount: '/footF', up: [0, 0, 1] });
    t.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    for (const [k, x] of [['L', X], ['R', -X]]) t.tube('brace' + k, [x, 7.5, 30], [x, 70, 5], [5, 5], { mount: '/footF2', up: [1, 0, 0] });
    const wr = 4.5, colWheel = [0, H - 10 - wr - .5, -wr];
    stack(t, { H, topY: colWheel[1], base: '/footF' });
    const boomY = H + 5;
    t.tube('boom', [0, boomY, 6], [0, boomY, pz - colZ - 6], [8, 10], { mount: 'top', up: [0, 1, 0] });
    t.box('boomCap', [0, boomY, pz - colZ - 6.6], [8.4, 10.4, 1.2], { mount: 'boom', tone: 'rubber', round: .4 });
    t.tube('boomGusset', [0, H - 4, -3], [0, boomY - 4.5, -26], [4, 4], { mount: 'top', up: [1, 0, 0] });
    /* поворотный кронштейн под концом вылета; колесо блока ставит BIND.g3cable */
    b.cyl('swivel', [0, boomY - 5 - 1.2, pz], [0, 1, 0], 2.6, 2.4, { mount: 'boom', tone: 'chrome' });
    b.anchor('pulley', [0, py, pz]);
    b.anchor('swivelPt', [0, boomY - 5 - 2.4, pz]);
    /* верхний трос вдоль вылета: от колеса блока к колесу на колонне */
    t.box('colWheelMount', [0, H - 7.5 - 1.25, -wr], [6, 2.5, 5], { mount: 'top', round: .4 });
    t.box('colWheelFork', [0, H - 10 - wr / 2 - .5, -wr], [5.2, wr + 2.5, 3], { mount: 'colWheelMount', round: .3 });
    t.cyl('colWheel', colWheel, [1, 0, 0], wr, 2.4, { mount: 'colWheelFork', tone: 'chrome' });
    b.anchor('boomCableA', [0, py + wr, pz]);
    b.anchor('boomCableB', V.add([0, 0, colZ], [0, colWheel[1] + wr, colWheel[2]]));
    b.anchor('seatTop', [0, seatH, 0]);
    b.anchor('pad', [0, padH, padZ]);
  };
  /* Тяга горизонтального блока. Начало координат — сиденье (центр по длине); пользователь смотрит в +Z.
     seatH — верх скамьи; plateZ, plateH — центр упоров для стоп; tilt — наклон упора от вертикали к пользователю. */
  TYPES.g3SeatedRow = (s, b) => {
    const seatH = s.seatH || 44, plateZ = s.plateZ ?? 92, plateH = s.plateH ?? 30, tilt = s.tilt ?? 22, pulleyH = s.pulleyH ?? 40, colZ = s.colZ ?? plateZ + 46, H = s.H || 205, X = 26;
    b.tube('beam', [0, 5, -48], [0, 5, colZ + 6], [10, 10], { mount: 'floor' });
    b.tube('footB', [-28, 3.75, -42], [28, 3.75, -42], [7.5, 7.5], { mount: 'beam' });
    /* длинная скамья */
    b.box('seat', [0, seatH - 3, -12], [32, 6, 64], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.box('seatPlate', [0, seatH - 7, -12], [24, 2, 58], { mount: 'postB' });
    for (const [k, z] of [['B', -36], ['F', 12]]) b.tube('post' + k, [0, 10, z], [0, seatH - 8, z], [6, 6], { mount: 'beam', up: [0, 0, 1] });
    /* упоры для стоп: стойка, поперечина, две наклонные площадки */
    const backZ = plateZ + 8;
    b.tube('platePost', [0, 10, backZ], [0, Math.max(plateH + 20, pulleyH + 9), backZ], [7.5, 7.5], { mount: 'beam', up: [0, 0, 1] });
    b.box('postCap', [0, Math.max(plateH + 20, pulleyH + 9) + .6, backZ], [8, 1.2, 8], { mount: 'platePost', tone: 'rubber', round: .4 });
    b.tube('plateBar', [-24, plateH, backZ - 4], [24, plateH, backZ - 4], [6, 6], { mount: 'platePost' });
    const ny = Math.sin(tilt * Math.PI / 180), nz = -Math.cos(tilt * Math.PI / 180);
    const n = [0, ny, nz], along = [0, -nz, ny];
    for (const [k, x] of [['L', 15], ['R', -15]]) {
      b.box('plate' + k, [x, plateH, plateZ], [15, 2, 30], { axes: [[1, 0, 0], n, along], role: 'support', tone: 'rubber', mount: 'plateBar', round: .6, contact: 'top' });
      b.box('plateLip' + k, V.add(V.add([x, plateH, plateZ], along, -14.2), n, 2.4), [15, 3.6, 1.6], { axes: [[1, 0, 0], n, along], tone: 'rubber', mount: 'plate' + k, round: .4 });
    }
    b.frameAnchor('plateL', [15, plateH, plateZ], [[1, 0, 0], [0, ny, nz], [0, -nz, ny]]);
    b.frameAnchor('plateR', [-15, plateH, plateZ], [[1, 0, 0], [0, ny, nz], [0, -nz, ny]]);
    b.anchor('plateNormal', [0, ny, nz]);
    /* нижний блок между упорами: кронштейн на стойке */
    b.box('pulleyMount', [0, pulleyH, backZ - 4.5], [6, 8, 2], { mount: 'platePost', round: .4 });
    b.cyl('swivel', [0, pulleyH, backZ - 6.7], [0, 0, 1], 2.6, 2.4, { mount: 'pulleyMount', tone: 'chrome' });
    b.anchor('pulley', [0, pulleyH, backZ - 15]);
    b.anchor('swivelPt', [0, pulleyH, backZ - 7.9]);
    /* колонна со стеком */
    const c = Sub(b, '', [0, 0, colZ], 0);
    c.tube('baseM', [-X - 4, 3.75, 0], [X + 4, 3.75, 0], [7.5, 7.5], { mount: '/beam' });
    c.tube('baseF', [-X - 4, 3.75, 26], [X + 4, 3.75, 26], [7.5, 7.5], { mount: 'baseL' });
    for (const [k, x] of [['L', X + 4], ['R', -X - 4]]) c.tube('base' + k, [x, 3.75, -14], [x, 3.75, 30], [7.5, 7.5], { mount: 'baseM' });
    c.tube('upL', [X, 7.5, 0], [X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    c.tube('upR', [-X, 7.5, 0], [-X, H, 0], [7.5, 7.5], { mount: 'baseM', up: [0, 0, 1] });
    c.tube('top', [-X - 3.75, H - 3.75, 0], [X + 3.75, H - 3.75, 0], [7.5, 7.5], { mount: 'upL' });
    for (const [k, x] of [['L', X], ['R', -X]]) c.tube('brace' + k, [x, 7.5, 26], [x, 60, 3.75], [5, 5], { mount: 'base' + k, up: [1, 0, 0] });
    /* Путь троса по блокам рамы (как у селекторных тяг): от поворотного блока у упоров — в стойку упоров через ось поворота,
       внутри стойки вниз, над балкой назад к нижнему блоку перед стеком, вверх перед плитами к верхнему блоку и вниз к верхней
       плите стека. Трос от верхнего блока идёт прямо к плите (1:1): плиты поднимаются ровно на вытянутую длину троса.
       Колёса Ø10; ветви перед стеком — в 2,5 см от плит, ветвь над балкой — в 2 см над ней. */
    const wr = 5, runY = 12.5, upZ = -10, topW = [0, H - 7.5 - 2.5 - wr - .5, upZ + wr], lowW = [0, runY + wr, upZ - wr];
    c.box('topWheelMount', [0, H - 7.5 - 1.25, topW[2]], [6, 2.5, 6], { mount: 'top', round: .4 });
    c.box('topWheelFork', [0, H - 10 - (wr + 1) / 2, topW[2]], [5.2, wr + 1, 3], { mount: 'topWheelMount', round: .3 });
    c.cyl('topWheel', topW, [1, 0, 0], wr, 2.4, { mount: 'topWheelFork', tone: 'chrome' });
    c.box('lowWheelMount', [0, 11, lowW[2]], [6, 2, 8], { mount: '/beam', round: .3 });
    for (const [k, x] of [['L', 1.75], ['R', -1.75]]) c.box('lowWheelPlate' + k, [x, (12 + lowW[1] + 2) / 2, lowW[2]], [.6, lowW[1] + 2 - 12, 6], { mount: 'lowWheelMount', round: .2 });
    c.cyl('lowWheelAxle', lowW, [1, 0, 0], .6, 4.6, { mount: 'lowWheelPlateL', tone: 'chrome' });
    c.cyl('lowWheel', lowW, [1, 0, 0], wr, 2.4, { mount: 'lowWheelAxle', tone: 'chrome' });
    stack(c, { H, topY: topW[1] });
    /* неподвижные ветви троса (BIND.g3line в спецификации): от оси поворота блока до нижнего блока стека и от него к верхнему */
    b.anchors.cableRun = [[0, pulleyH, backZ - 7.9], [0, pulleyH, backZ], [0, runY, backZ], c.P([0, runY, lowW[2]]), c.P([0, lowW[1], upZ]),
      c.P([0, topW[1], upZ]), c.P([0, topW[1] + wr, topW[2]]), c.P([0, topW[1], 0])].map(b.P);
    b.anchor('seatTop', [0, seatH, 0]);
  };
  /* Стена с дверью и креплением для эспандера. Плоскость двери z = 0 (сторона пользователя), стена уходит в +Z.
     anchor: 'top' — лента в притворе над дверью по центру; 'side' — в притворе со стороны замка (+X) на высоте h. */
  TYPES.g3Door = (s, b) => {
    const W = 40, Hd = 203, T = 12, wall = s.wallH || 222, stub = s.stub || 34;
    for (const [k, sx] of [['L', 1], ['R', -1]]) {
      b.box('wall' + k, [sx * (W + 4 + stub / 2), wall / 2, T / 2], [stub, wall, T], { mount: 'floor', tone: 'wall', round: .2 });
      b.box('jamb' + k, [sx * (W + 2), (Hd + 5) / 2, T / 2], [4, Hd + 5, T + .4], { mount: 'wall' + k, tone: 'wood', round: .2 });
      b.box('trim' + k, [sx * (W + 4.5), (Hd + 7) / 2, -.6], [7, Hd + 7, 1.2], { mount: 'jamb' + k, tone: 'wood', round: .3 });
      b.box('stop' + k, [sx * (W - .6), Hd / 2, 8.5], [1.4, Hd, 3], { mount: 'jamb' + k, tone: 'wood', round: .2 });
    }
    b.box('lintel', [0, (Hd + 5 + wall) / 2, T / 2], [2 * W + 8, wall - Hd - 5, T], { mount: 'wallL', tone: 'wall', round: .2 });
    b.box('head', [0, Hd + 2.5, T / 2], [2 * W + 8, 5, T + .4], { mount: 'jambL', tone: 'wood', round: .2 });
    b.box('trimH', [0, Hd + 7, -.6], [2 * W + 16, 7, 1.2], { mount: 'head', tone: 'wood', round: .3 });
    b.box('stopH', [0, Hd - .6, 8.5], [2 * W, 1.4, 3], { mount: 'head', tone: 'wood', round: .2 });
    /* полотно двери (закрыто, открывается от пользователя), петли со стороны −X, ручка со стороны +X */
    b.box('leaf', [0, (Hd - .6) / 2 + .4, 4.9], [2 * W - .8, Hd - 1.2, 4], { mount: 'hinge2', tone: 'wood', round: .3 });
    for (const [i, y] of [[1, 24], [2, 100], [3, 180]]) b.box('hinge' + i, [-W + .1, y, 4.9], [.8, 10, 3], { mount: 'jambR', tone: 'chrome', round: .2 });
    b.cyl('rose', [W - 6, 100, 2.4], [0, 0, 1], 2.8, 1.2, { mount: 'leaf', tone: 'chrome' });
    b.tube('lever', [W - 6, 100, 1.4], [W - 6, 100, -2.6], 1, { mount: 'rose', tone: 'chrome' });
    b.tube('leverH', [W - 6, 100, -2.6], [W - 17, 100, -2.6], 1, { mount: 'lever', tone: 'chrome' });
    /* крепление: лента-петля из притвора, кольцо на конце */
    const side = s.anchor !== 'top', h = s.h ?? 160, out = s.out ?? 7;
    const root = side ? [W - .3, h, 2.9] : [0, Hd - .2, 2.9], loopEnd = side ? [W - 2.5, h, -out] : [0, Hd - out * .55, -out * .8];
    b.tube('strap', root, loopEnd, [2.6, .45], { mount: 'leaf', tone: 'rubber', up: side ? [1, 0, 0] : [0, 1, 0] });
    b.cyl('ring', V.add(loopEnd, [0, 0, -1.2]), side ? [0, 1, 0] : [1, 0, 0], 1.7, .7, { mount: 'strap', tone: 'chrome' });
    b.anchor('anchor', V.add(loopEnd, [0, 0, -1.8]));
  };

  /* Подушка под колени (поролон в чехле): size [ширина, толщина, длина] */
  TYPES.g3Pad = (s, b) => { const [w, t, l] = s.size || [46, 4.5, 30]; b.box('pad', [0, t / 2, 0], [w, t, l], { role: 'support', tone: 'mat', mount: 'floor', round: 1.2, contact: 'top' }); b.anchor('top', [0, t, 0]); };

  /* ---------- Канат в кулаке ----------
     Ветвь каната входит в кулак у одного его края, идёт по оси кулака (линия «мизинец → большой палец», ось z кисти) и
     выходит у другого края к узлу-набалдашнику — так канат держат на самом деле. knob — где узел: 'pinky' — за мизинцем
     (ветвь входит у большого и указательного пальцев: разгибание на верхнем блоке), 'thumb' — за большим пальцем (ветвь
     входит у мизинца: сгибание на нижнем блоке); без knob — со стороны, обращённой от карабина. Если карабин позади края
     входа (ветвь подходит под углом больше 90° к оси кулака), канат огибает кисть снаружи: точка обхода — у края входа,
     за пределом кисти в сторону карабина. Прежде ветвь шла прямо от карабина через центр хвата и узел висел на её
     продолжении: при оси кулака поперёк ветви канат проходил сквозь ладонь и пальцы. */
  const ROPE = { r: 1.3, knobR: 2.1, gap: .3 };
  /* насколько кисть выступает от центра хвата в направлении dir (точки ладони и фаланг с их радиусом) */
  function handReach(R, s, dir) {
    const f = R.frames['hand' + s], g = R['grip' + s], sh = M.handShape(R.hands?.[s] || 'grip', s, R.gripRadius?.[s] ?? 1.4);
    const L = p => V.add(V.add(V.add(f.o, f.x, p[0]), f.y, p[1]), f.z, p[2]), at = (p, r = 0) => V.dot(V.sub(L(p), g), dir) + r;
    let m = -Infinity; const c = sh.palm.c, h = sh.palm.size.map(v => v / 2);
    for (const a of [-1, 1]) for (const b of [-1, 1]) for (const k of [-1, 1]) m = Math.max(m, at([c[0] + a * h[0], c[1] + b * h[1], c[2] + k * h[2]]));
    for (const fg of [...sh.fingers, sh.thumb]) for (const p of fg.pts) m = Math.max(m, at(p, fg.r));
    return m;
  }
  function ropeInFist(R, s, clip, knob, id) {
    const g = R['grip' + s], z = V.unit(R.frames['hand' + s].z), d = V.unit(V.sub(clip, g));
    const k = knob === 'pinky' ? 1 : knob === 'thumb' ? -1 : (V.dot(z, d) >= 0 ? 1 : -1), ez = V.scale(z, k);
    const E = V.add(g, ez, handReach(R, s, ez) + ROPE.gap), K = V.add(g, ez, -(handReach(R, s, V.scale(ez, -1)) + ROPE.knobR + ROPE.gap));
    const pts = [clip, E, K];
    if (V.dot(d, ez) < 0) { const n = V.unit(V.perp(d, ez)); pts.splice(1, 0, V.add(E, n, Math.max(0, handReach(R, s, n)) + ROPE.r + ROPE.gap)); }
    return [{ kind: 'cable', pts, r: ROPE.r, tone: 'rope', role: 'grip', id: id + ':rope' + s, mount: id + ':line' },
      { kind: 'sphere', c: K, r: ROPE.knobR, tone: 'rubber', role: 'frame', id: id + ':knob' + s, mount: id + ':rope' + s }];
  }

  /* ---------- Трос с поворотным блоком и стеком ---------- */
  /* e: from — центр колеса; swivel — точка крепления оси поворота; swivelPart — деталь, к которой крепится ось;
     attach/hands/foot/bend/ext/clip — как в BIND.cable; plane: 'swivel' — колесо в плоскости троса и оси поворота;
     wrap — с какой стороны колеса сходит трос; stack — {o, R, sel, pitch, size, topY, rod, maxLift}; rest — длина троса
     (центр колеса — рукоять) в покое; ratio — передаточное отношение стека (1 — 1:1, 0,5 — 2:1). */
  BIND.g3cable = (e, R) => {
    const id = e.id || 'g3cable', wr = e.wheelR || 4.5;
    /* канат: ветви постоянной длины ropeLen — карабин тем ближе к кистям, чем шире они разведены */
    let clipLen = e.clip;
    if (e.attach === 'rope' && e.ropeLen) { const h = (e.hands || ['L', 'R']), sep = V.dist(R['grip' + h[0]], R['grip' + (h[1] || h[0])]) / 2; clipLen = Math.sqrt(Math.max(16, e.ropeLen * e.ropeLen - sep * sep)); }
    const base = BIND.cable({ ...e, id, mountTo: id + ':forkA', wheelR: wr, clip: clipLen }, R);
    const wheel = base.find(p => p.id === id + ':wheel'), line = base.find(p => p.id === id + ':line');
    const P = wheel.c, S = toCat(e.swivel), clip = line.pts[1], dir = V.unit(V.sub(clip, P)), up = [0, -1, 0];
    const bv = V.unit(V.sub(S, P));
    let A = wheel.axis;
    if (e.plane === 'swivel') { const c1 = V.cross(dir, bv), c2 = V.cross(dir, up); let a = V.add(c1, c2, .12); if (V.len(a) < 1e-4) a = [1, 0, 0]; A = V.unit(a); }
    wheel.axis = A;
    let bp = V.perp(V.sub(S, P), A); if (V.len(bp) < 1e-3) bp = V.perp(V.scale(dir, -1), A); bp = V.unit(bp);
    const w = V.cross(A, bp);
    /* сход троса по касательной к колесу */
    const q = V.perp(V.sub(clip, P), A), d = V.len(q);
    if (d > wr + .1) {
      const u = V.unit(q), u2 = V.cross(A, u), c = wr / d, s = Math.sqrt(1 - c * c);
      const T1 = V.add(P, V.add(V.scale(u, wr * c), u2, wr * s)), T2 = V.add(P, V.add(V.scale(u, wr * c), u2, -wr * s));
      const wrap = e.wrap ? V.unit(dirCat(e.wrap)) : bp;
      line.pts[0] = V.dot(V.sub(T1, P), wrap) >= V.dot(V.sub(T2, P), wrap) ? T1 : T2;
    }
    const out = base.filter(p => p.id !== id + ':strap' && !(e.attach === 'rope' && /:(rope|knob)(L|R)$/.test(p.id)));
    /* канат: ветви по оси кулаков, узлы за краем кулака (ropeInFist); knob — общий или по руке {L, R} */
    if (e.attach === 'rope') for (const s of e.hands || ['L', 'R']) out.push(...ropeInFist(R, s, clip, typeof e.knob === 'object' ? e.knob?.[s] : e.knob, id));
    /* манжета на голеностоп (E.ankleCuff): лента 7,5 см из девяти витков, облегающих голень по её сечению (голень внутри),
       стальное D-кольцо на стороне блока и карабин троса от кольца к концу троса */
    if (e.attach === 'ankle') {
      const s = e.foot || 'L', K = E.ankleCuff(R, s, toCat(e.from)), n = 9;
      for (let i = 0; i < n; i++) {
        const h = K.lo + K.ring + i * (K.hi - K.lo - 2 * K.ring) / (n - 1), t = 1 - h / M.B.sk, pts = [];
        for (let j = 0; j <= 24; j++) pts.push(M.limbPoint(R, 'sk', s, t, K.ang + j / 24 * 2 * Math.PI, K.ring + .15));
        out.push({ kind: 'cable', pts, r: K.ring, tone: 'rubber', role: 'strap', id: id + ':cuff' + i, mount: 'body' });
      }
      /* D-кольцо: дуга наружу и прямая перемычка вдоль голени (замкнуто) */
      const ring = [V.add(K.base, K.axis, -K.dLen / 2)];
      for (let j = 1; j <= 10; j++) { const a = j / 10 * Math.PI; ring.push(V.add(V.add(K.base, K.axis, K.dLen / 2 * Math.cos(a + Math.PI)), K.n, K.dOut * Math.sin(a))); }
      ring.push(ring[0]);
      out.push({ kind: 'cable', pts: ring, r: .3, tone: 'chrome', role: 'frame', id: id + ':dring', mount: 'body' });
      /* карабин: вытянутая петля 6 × 2,2 см от вершины D-кольца к концу троса */
      const u = V.unit(V.sub(clip, K.apex)), w = V.unit(V.cross(u, K.axis)), L = V.dist(clip, K.apex), hook = [];
      for (let j = 0; j <= 16; j++) {
        const a = j / 16 * 2 * Math.PI, along = (1 - Math.cos(a)) / 2 * L, side = Math.sin(a) * 1.1 * Math.min(1, 4 * along / L, 4 * (L - along) / L);
        hook.push(V.add(V.add(K.apex, u, along), w, side));
      }
      out.push({ kind: 'cable', pts: hook, r: .35, tone: 'chrome', role: 'frame', id: id + ':snap', mount: id + ':line' });
    }
    /* прямая рукоять: поворотный крюк от середины рукояти к карабину троса */
    const bar = base.find(p => p.id === id + ':bar');
    if (bar) {
      const mid = V.mix(R['grip' + (e.hands || ['L', 'R'])[0]], R['grip' + (e.hands || ['L', 'R'])[1]], .5);
      out.push({ kind: 'beam', a: mid, b: clip, r: .8, tone: 'chrome', role: 'frame', id: id + ':hook', mount: id + ':line' });
      out.push({ kind: 'sphere', c: clip, r: 1.3, tone: 'chrome', role: 'frame', id: id + ':snap', mount: id + ':line' });
      bar.mount = id + ':hook';
    }
    const fc = V.add(P, bp, wr * .45);
    for (const [k, sg] of [['A', 1], ['B', -1]]) out.push({ kind: 'obox', c: V.add(fc, A, sg * 1.9), x: A, y: bp, z: w, size: [.7, wr * 2.3, wr * 2 + 2.2], round: .3, tone: 'frame', role: 'frame', id: id + ':fork' + k, mount: id + ':bridge' });
    const bc = V.add(P, bp, wr + 1.7);
    out.push({ kind: 'obox', c: bc, x: A, y: bp, z: w, size: [4.5, 2.6, 6], round: .4, tone: 'frame', role: 'frame', id: id + ':bridge', mount: id + ':pin' });
    out.push({ kind: 'beam', a: bc, b: S, r: 1.3, tone: 'chrome', role: 'frame', id: id + ':pin', mount: e.swivelPart });
    /* стек: выбранные плиты поднимаются на длину вытянутого троса */
    if (e.stack) {
      const st = e.stack, hands = e.hands || ['L', 'R'];
      const end = e.attach === 'ankle' ? R['an' + (e.foot || 'L')] : V.mix(R['grip' + hands[0]], R['grip' + (hands[1] || hands[0])], .5);
      const lift = Math.max(0, Math.min(st.maxLift, (V.dist(end, P) - (e.rest || 0)) * (e.ratio ?? 1)));
      const o = toCat(st.o), X = dirCat(M3.col(st.R, 0)), Y = dirCat(M3.col(st.R, 1)), Z = dirCat(M3.col(st.R, 2));
      /* плиты и верхняя плита скользят по обеим направляющим: rides — детали, сквозь которые они проходят по устройству */
      const at = (y) => V.add(o, Y, y + lift), sid = id + ':stk', rides = [e.rodPart, e.rodPart.replace(/L$/, 'R')];
      for (let i = 0; i < st.sel; i++) out.push({ kind: 'obox', c: at(i * st.pitch + st.size[1] / 2), x: X, y: Y, z: Z, size: [...st.size], round: .35, tone: 'stack', role: 'frame', id: sid + i, mount: e.rodPart, rides });
      const topC = at(st.sel * st.pitch + 2);
      out.push({ kind: 'obox', c: topC, x: X, y: Y, z: Z, size: [st.size[0] + 1, 4, st.size[2] + 1], round: .5, tone: 'frame', role: 'frame', id: sid + 'Top', mount: e.rodPart, rides });
      const stemTop = V.add(topC, Y, 8);
      out.push({ kind: 'beam', a: V.add(topC, Y, 2), b: stemTop, r: 1.1, tone: 'chrome', role: 'frame', id: sid + 'Stem', mount: sid + 'Top' });
      out.push({ kind: 'cable', pts: [stemTop, V.add(o, Y, st.topY - st.o[1])], r: .35, tone: 'cable', role: 'cable', id: sid + 'Cable', mount: sid + 'Stem' });
    }
    return out;
  };
  /* Эспандер от крепления (кольцо на двери): обе ветви от одной точки к кольцам стремён рукоятей (E.stirrup, как у
     эспандера под стопами); ветви крепятся к детали mountTo */
  BIND.g3band = (e, R) => {
    const id = e.id || 'band', from = toCat(e.from), out = [];
    for (const s of e.hands || ['L', 'R']) {
      const st = E.stirrup(R['grip' + s], R.frames['hand' + s].z, from, { ...E.BAND_HANDLE, clear: E.clearOfForearm(R, s) });
      out.push({ kind: 'cable', pts: [from, st.apex], r: e.r || .7, tone: 'band', role: 'cable', id: id + ':' + s, mount: e.mountTo });
      out.push(...E.bandHandle(st, id, s));
    }
    return out;
  };
  /* Валик между локтем и боком (свёрнутое полотенце, Ø6,5 × 14 см) во вращениях плеча: лежит вдоль корпуса спереди назад
     у внутренней поверхности плеча над локтем, держится зажатым между плечом и корпусом и следует за плечом */
  BIND.g3towelRoll = (e, R) => {
    const s = e.side || 'R', r = e.r || 3.25, t = e.at ?? .8, ax = M.limbAxes(R, 'ua', s, t), T = R.frames.thorax;
    /* сторона плеча, обращённая к корпусу (по грудной клетке, а не по закрутке плеча: при вращении плеча валик остаётся у бока) */
    const d = V.unit(V.perp(V.scale(T.x, -M.SIGN[s]), ax.axis)), ang = Math.atan2(V.dot(d, ax.lat), V.dot(d, ax.front));
    /* центр валика — у внутренней поверхности плеча над локтем и на back см позади него: предплечье при повороте внутрь
       проходит перед валиком, а не сквозь него */
    const c = V.add(V.add(M.limbPoint(R, 'ua', s, t, ang), d, r - (e.squeeze ?? .3)), T.z, -(e.back ?? 3));
    return [{ kind: 'cyl', c, axis: V.unit(T.z), r, len: e.len || 14, sides: 20, tone: 'towel', role: 'support', id: (e.id || 'towel') + ':roll', mount: 'body' }];
  };
  /* Неподвижный трос между точками (внутри тренажёра: вдоль вылета, к колонне) */
  BIND.g3line = e => [{ kind: 'cable', pts: e.pts.map(toCat), r: e.r || .35, tone: 'cable', role: 'cable', id: e.id || 'g3line', mount: e.mountTo || 'floor' }];
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
