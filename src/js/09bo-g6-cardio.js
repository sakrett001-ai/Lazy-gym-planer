/* Тренажёры группы G6 (кардио): вертикальный велотренажёр, беговая дорожка, гребной тренажёр,
   эллиптический тренажёр, степпер. Размеры (см) — по типовым коммерческим образцам.
   Подвижные части (шатуны, педали, тяги, сиденье, рукоять с цепью) строятся по позе: педаль — под подошвой,
   рукоять — в кисти, сиденье — под тазом. Код выполняется в браузере: чистый JS без зависимостей. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, M3, D2R, toCat, dirCat } = M, { TYPES, BIND } = E;
  const lerp = (a, b, t) => a + (b - a) * t;
  const end = (a, b, k) => V.add(a, V.unit(V.sub(b, a)), k); /* точка на отрезке a→b в k см от a */

  /* ---------- Вертикальный велотренажёр ----------
     Начало координат — на полу под осью каретки, вперёд +Z. Параметры из раскладки позы:
     bbY — высота оси каретки (≈30), saddle [y, z] — верх седла и центр его задней части,
     bar [x, y, z] — середина хвата правой/левой рукой на руле (x — половина ширины хвата). */
  TYPES.uprightBike = (s, b) => {
    const bbY = s.bbY || 30, bb = [0, bbY, 0], sad = s.saddle, bar = s.bar, st = 72 * D2R, sd = [0, Math.sin(st), -Math.cos(st)];
    const onSeatTube = y => [0, y, -(y - bbY) / Math.tan(st)];
    /* основание: две опоры с резиновыми ножками и продольная балка */
    b.tube('stabF', [-28, 3.75, 50], [28, 3.75, 50], [8, 7.5], { mount: 'floor' });
    b.tube('stabR', [-26, 3.75, -50], [26, 3.75, -50], [8, 7.5], { mount: 'floor' });
    for (const [k, z, x] of [['F', 50, 28], ['R', -50, 26]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + 1), 3.75, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.tube('base', [0, 6.5, -50], [0, 6.5, 50], [7, 6], { mount: 'stabR' });
    /* каретка: корпус, ось шатунов; подседельная труба через каретку под углом 72°, стойка к основанию */
    const b0 = onSeatTube(9.5), clampY = sad[0] - 17, clamp = onSeatTube(clampY);
    b.tube('seatTube', b0, clamp, [6, 8], { mount: 'base' });
    b.tube('bbStrut', [0, 9.5, 14], end(bb, [0, 9.5, 14], 2), [6, 6], { mount: 'base' });
    b.cyl('bb', bb, [1, 0, 0], 3.4, 10, { mount: 'seatTube', tone: 'frame' });
    b.cyl('axle', bb, [1, 0, 0], 1.3, 17.4, { mount: 'bb', tone: 'chrome' });
    /* подседельный штырь, салазки и седло */
    const postTop = onSeatTube(sad[0] - 7.2);
    b.tube('seatPost', V.add(clamp, sd, -6), postTop, [3.4, 3.4], { mount: 'seatTube', tone: 'chrome' });
    b.box('clampKnob', V.add(clamp, [0, 0, -4.5]), [3, 3, 3], { mount: 'seatTube', tone: 'rubber', round: 1 });
    const zs0 = Math.min(postTop[2], sad[1] - 6) - 2, zs1 = Math.max(postTop[2], sad[1] + 9) + 2;
    b.tube('slider', [0, sad[0] - 6, zs0], [0, sad[0] - 6, zs1], [4.5, 2.4], { mount: 'seatPost', tone: 'chrome' });
    b.box('saddle', [0, sad[0] - 2.6, sad[1]], [19, 5.2, 15], { mount: 'slider', role: 'support', tone: 'pad', round: 2.2, contact: 'top' });
    b.box('saddle:mid', [0, sad[0] - 2.7, sad[1] + 9.5], [11, 4.8, 6], { mount: 'saddle', role: 'support', tone: 'pad', round: 1.8 });
    b.box('saddle:nose', [0, sad[0] - 2.7, sad[1] + 16.5], [6.5, 4.4, 10], { mount: 'saddle:mid', role: 'support', tone: 'pad', round: 1.6 });
    /* передняя стойка с выносом руля; маховик на вилке перед кареткой */
    const pBot = [0, 9, 47], pTop = [0, bar[1] - 7, bar[2] + 11], postAt = y => V.mix(pBot, pTop, (y - pBot[1]) / (pTop[1] - pBot[1]));
    b.tube('post', pBot, pTop, [7, 8], { mount: 'base' });
    const fw = [0, 36, 29];
    b.cyl('flywheel', fw, [1, 0, 0], 19, 3.6, { mount: 'hub', tone: 'chrome', sides: 40 });
    b.cyl('flywheel:rim', fw, [1, 0, 0], 19.6, 2.4, { mount: 'flywheel', tone: 'rubber', sides: 40 });
    b.cyl('hub', fw, [1, 0, 0], 3.2, 10, { mount: 'forkL', tone: 'frame' });
    for (const sx of [-1, 1]) b.tube('fork' + (sx > 0 ? 'L' : 'R'), [sx * 4.2, fw[1] + 2, postAt(fw[1] + 2)[2] - 2], [sx * 4.2, fw[1], fw[2]], [2.2, 4], { mount: 'post' });
    b.box('guard', V.mix(bb, fw, .5), [2, 9, V.dist(bb, fw) + 9], { axes: [[1, 0, 0], V.cross(V.unit(V.sub(fw, bb)), [1, 0, 0]), V.unit(V.sub(fw, bb))], mount: 'bb', round: 1.2 });
    b.cyl('knob', V.add(postAt(bar[1] - 25), [0, 0, 4.5]), [0, 0, 1], 2.4, 4, { mount: 'post', tone: 'rubber' });
    /* руль: вынос, поперечина с мягкими ручками и «рога» */
    const stem = [0, bar[1], bar[2] + 1];
    b.tube('stem', pTop, stem, [4.5, 4.5], { mount: 'post' });
    b.tube('bar', [-bar[0] - 6, bar[1], bar[2]], [bar[0] + 6, bar[1], bar[2]], 1.6, { mount: 'stem', role: 'grip', tone: 'rubber' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', a = [sx * (bar[0] + 6), bar[1], bar[2]];
      b.tube('horn' + k, a, [sx * (bar[0] + 7), bar[1] + 9, bar[2] + 16], 1.5, { mount: 'bar', tone: 'chrome' });
    }
    b.box('console', [0, bar[1] + 9, bar[2] + 12], [22, 14, 3.5], { axes: [[1, 0, 0], [0, Math.cos(.5), -Math.sin(.5)], [0, Math.sin(.5), Math.cos(.5)]], mount: 'consoleArm', tone: 'rubber', round: 1 });
    b.tube('consoleArm', V.add(pTop, [0, -2, 0]), [0, bar[1] + 6, bar[2] + 13], [3, 3], { mount: 'post' });
    b.anchor('axle', bb); b.anchor('saddleTop', [0, sad[0], sad[1]]);
  };
  /* Шатуны велотренажёра: плечи шатунов в плоскостях x = ±armX, ось педали — к педали под подушечкой стопы */
  BIND.bikeCrank = (e, R) => {
    const A = toCat(e.axle), id = e.id || 'crank', out = [], ax = e.armX || 8.2;
    for (const s of ['L', 'R']) {
      const g = s === 'L' ? 1 : -1, t = R.frames['toes' + s], ped = V.add(R['ball' + s], t.y, M.B.toeSole - 1.3);
      const a0 = [g * ax, A[1], A[2]], a1 = [g * ax, ped[1], ped[2]];
      out.push({ kind: 'beam', a: a0, b: a1, w: 3.6, h: 1.8, up: [1, 0, 0], tone: 'chrome', role: 'linkage', id: id + ':arm' + s, mount: e.mountTo });
      out.push({ kind: 'cyl', c: a0, axis: [1, 0, 0], r: 2.6, len: 1.8, tone: 'chrome', role: 'linkage', id: id + ':boss' + s, mount: id + ':arm' + s });
      out.push({ kind: 'beam', a: [g * (ax + .9), ped[1], ped[2]], b: ped, r: .75, tone: 'chrome', role: 'linkage', id: id + ':spindle' + s, mount: id + ':arm' + s });
      out.push({ kind: 'obox', c: ped, x: t.x, y: t.y, z: t.z, size: [10, 2.4, 9.5], round: .5, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':spindle' + s });
    }
    return out;
  };

  /* ---------- Беговая дорожка ----------
     Лента 150 × 50 см, верх ленты на высоте deckH (≈20), бегущий лицом к +Z. Боковые платформы, задняя
     заглушка, кожух двигателя спереди, стойки к консоли (≈130), боковые поручни (≈100) и передний поручень. */
  TYPES.treadmill = (s, b) => {
    const H = s.deckH || 20, z0 = s.z0 ?? -100, z1 = s.z1 ?? 50, zc = (z0 + z1) / 2, L = z1 - z0;
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R';
      b.box('side' + k, [sx * 30, (4 + H + 1) / 2, zc + 4], [10, H + 1 - 4, L + 16], { mount: 'foot' + k + 'B', role: 'support', round: 1.2 });
      b.box('tread' + k, [sx * 30, H + 1.3, zc - 2], [9, .6, L - 6], { mount: 'side' + k, tone: 'rubber', round: .3 });
      b.box('foot' + k + 'B', [sx * 30, 2, z0 + 2], [8, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
      b.box('foot' + k + 'F', [sx * 30, 2, z1 + 6], [8, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
    }
    b.box('deck', [0, H - 2.5, zc], [50, 3, L], { mount: 'sideL', tone: 'wood', round: .4 });
    b.box('belt', [0, H - .5, zc], [49.6, 1, L + 4], { mount: 'deck', role: 'support', tone: 'rubber', round: .4, contact: 'top' });
    for (const [k, z] of [['B', z0], ['F', z1]]) b.cyl('roller' + k, [0, H - 3.6, z], [1, 0, 0], 3.6, 49.4, { mount: 'sideL', tone: 'chrome' });
    b.box('endCap', [0, H - 6, z0 - 6], [70, 10, 4], { mount: 'sideL', round: 1.5 });
    /* кожух двигателя, стойки, консоль */
    b.box('hood', [0, 12.5, z1 + 22], [72, 25, 32], { mount: 'floor', round: 3 });
    const upB = x => [x * 33, 24, z1 + 30], upT = x => [x * 31, 124, z1 + 16];
    for (const sx of [-1, 1]) b.tube('up' + (sx > 0 ? 'L' : 'R'), upB(sx), upT(sx), [6, 9], { mount: 'hood' });
    const ca = 28 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', [0, 133, z1 + 12], [78, 24, 9], { axes: [[1, 0, 0], cy, cz], mount: 'upL', round: 2 });
    b.box('screen', V.add([0, 134, z1 + 12], cz, -4.7), [42, 15, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    /* поручни: боковые на высоте ≈100 и передний с датчиками пульса */
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', a = V.mix(upB(sx), upT(sx), (100 - 24) / 100), back = [sx * 33, 100, z1 - 32];
      b.tube('rail' + k, a, back, 1.9, { mount: 'up' + k, role: 'grip', tone: 'chrome' });
      b.tube('railEnd' + k, back, [sx * 33, 93, z1 - 38], 1.9, { mount: 'rail' + k, tone: 'rubber' });
    }
    const fy = 112, fz = V.mix(upB(1), upT(1), (fy - 24) / 100)[2] - 6;
    b.tube('frontBar', [-33, fy, fz], [33, fy, fz], 1.7, { mount: 'upL', role: 'grip', tone: 'chrome' });
    for (const sx of [-1, 1]) b.box('pulse' + (sx > 0 ? 'L' : 'R'), [sx * 16, fy, fz], [9, 4.2, 4.2], { mount: 'frontBar', tone: 'rubber', round: 1 });
    b.box('safetyKey', V.add(V.add([0, 133, z1 + 12], cy, -8), cz, -5.2), [4, 3, 1.5], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .5 });
    b.anchor('beltTop', [0, H, zc]);
  };

  /* ---------- Гребной тренажёр (тип «воздушный», как в залах) ----------
     Монорельс вдоль Z, гребец лицом к +Z. railTop — верх рельса (сиденье на ≈9 см выше), plate — центр
     подушечек стоп на упорах [x, y, z], beta — наклон упоров от горизонтали, exit — выход цепи из корпуса маховика. */
  TYPES.rowerErg = (s, b) => {
    const rt = s.railTop || 27, pl = s.plate, beta = (s.beta || 42) * D2R, ex = s.exit, z0 = s.railRear ?? -110, zf = ex[2] + 26;
    const pf = [0, Math.sin(beta), Math.cos(beta)], pn = [0, Math.cos(beta), -Math.sin(beta)];
    /* монорельс, задняя опора, передняя рама под корпусом маховика */
    b.tube('rail', [0, rt - 3, z0], [0, rt - 3, pl[2] + 12], [8, 6], { mount: 'rearPost', tone: 'chrome' });
    b.box('railStop', [0, rt + 1, z0 + 2], [6, 2.5, 3], { mount: 'rail', tone: 'rubber', round: .6 });
    b.tube('rearPost', [0, 0, z0 + 4], [0, rt - 3, z0 + 4], [7, 6], { mount: 'rearFoot' });
    b.tube('rearFoot', [-24, 2, z0 + 4], [24, 2, z0 + 4], [7, 4], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('rearCap' + (sx > 0 ? 'L' : 'R'), [sx * 25, 2, z0 + 4], [3, 4, 8], { mount: 'rearFoot', tone: 'rubber', round: .6 });
    b.tube('frontBeam', [0, rt - 3, pl[2] + 8], [0, 18, zf], [8, 7], { mount: 'rail' });
    b.tube('frontFoot', [-30, 2.5, zf], [30, 2.5, zf], [8, 5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('frontCap' + (sx > 0 ? 'L' : 'R'), [sx * 31, 2.5, zf], [3, 5, 9], { mount: 'frontFoot', tone: 'rubber', round: .6 });
    b.tube('frontLeg', [0, 4, zf], [0, 20, zf], [7, 7], { mount: 'frontFoot' });
    /* упоры для стоп: наклонные площадки с пятками-чашками и ремнями поперёк стопы */
    const pc = V.add(pl, pf, -6);
    b.box('plateBase', V.add(V.add([0, pc[1], pc[2]], pf, 4), pn, -3.2), [38, 3, 30], { axes: [[1, 0, 0], pn, pf], mount: 'plateStrut', round: 1 });
    b.tube('plateStrut', V.add([0, pc[1], pc[2]], pn, -4.5), [0, rt - 2, pc[2] + 9], [6, 6], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', c = V.add([sx * pl[0], pc[1], pc[2]], pn, -.8);
      b.box('plate' + k, c, [13, 1.6, 36], { axes: [[1, 0, 0], pn, pf], mount: 'plateBase', role: 'support', tone: 'rubber', round: .5 });
      b.box('heelCup' + k, V.add(V.add(c, pf, -16.5), pn, 3), [13, 6, 2], { axes: [[1, 0, 0], pn, pf], mount: 'plate' + k, tone: 'frame', round: .8 });
      b.box('strap' + k, V.add(V.add(c, pf, 4), pn, 8.6), [14, .8, 5], { axes: [[1, 0, 0], pn, pf], mount: 'strapPost' + k + 'o', tone: 'band', round: .3 });
      for (const sy of [-1, 1]) b.box('strapPost' + k + (sy > 0 ? 'o' : 'i'), V.add(V.add(V.add(c, pf, 4), pn, 4.6), [sy * 7.4 * sx, 0, 0]), [1.2, 8.4, 4], { axes: [[1, 0, 0], pn, pf], mount: 'plate' + k, tone: 'band', round: .3 });
    }
    /* корпус маховика (вентилятор в решётчатом кожухе), выход цепи, монитор на штанге */
    const fc = [0, ex[1] + 2, ex[2] + 26];
    b.cyl('fan', fc, [1, 0, 0], 27, 30, { mount: 'fanStand', tone: 'stack', sides: 40 });
    for (const sx of [-1, 1]) b.cyl('fanCover' + (sx > 0 ? 'L' : 'R'), [sx * 15.4, fc[1], fc[2]], [1, 0, 0], 22, 1.2, { mount: 'fan', tone: 'rubber', sides: 40 });
    b.box('fanStand', [0, (fc[1] - 26) / 2 + 9, fc[2] - 4], [16, fc[1] - 26 + 2, 18], { mount: 'frontBeam', round: 1.5 });
    b.box('chainGuide', [0, ex[1], ex[2] + 1.5], [10, 7, 5], { mount: 'fan', round: 1.2 });
    b.box('handleHook', [0, ex[1] - 4.4, ex[2] + 1.5], [12, 2, 4], { mount: 'chainGuide', tone: 'chrome', round: .6 });
    const mon = [0, fc[1] + 44, fc[2] - 34];
    b.tube('monArm', [0, fc[1] + 24, fc[2] - 8], mon, [3.2, 3.2], { mount: 'fan', tone: 'chrome' });
    const ma = 25 * D2R, my = [0, Math.cos(ma), Math.sin(ma)], mz = [0, -Math.sin(ma), Math.cos(ma)];
    b.box('monitor', V.add(mon, mz, -1), [20, 16, 4], { axes: [[1, 0, 0], my, mz], mount: 'monArm', tone: 'rubber', round: 1.2 });
    b.anchor('exit', ex);
  };
  /* Сиденье гребного тренажёра: подушка под тазом, каретка с роликами на монорельсе */
  BIND.rowerSeat = (e, R) => {
    const id = e.id || 'seat', top = e.top || 36, rt = e.railTop || 27, z = R.hip[2] + (e.shift || 0), x = R.hip[0];
    const C = (y, dz = 0) => toCat([x, y, 0]).map((v, i) => i === 2 ? z + dz : v);
    return [
      { kind: 'obox', c: C(top - 2.5), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [e.w || 26, 5, e.l || 30], round: 2, tone: 'pad', role: 'support', id: id + ':pad', mount: id + ':car' },
      { kind: 'obox', c: C(rt + 3.5), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [16, 4.2, 20], round: .8, tone: 'frame', role: 'carriage', id: id + ':car', mount: id + ':wheelF' },
      { kind: 'cyl', c: C(rt + 1.4, 7), axis: [1, 0, 0], r: 1.4, len: 12, tone: 'rubber', role: 'carriage', id: id + ':wheelF', mount: e.mountTo },
      { kind: 'cyl', c: C(rt + 1.4, -7), axis: [1, 0, 0], r: 1.4, len: 12, tone: 'rubber', role: 'carriage', id: id + ':wheelB', mount: e.mountTo }
    ];
  };
  /* Рукоять на цепи: прямая рукоять с резиновыми ручками под кистями, цепь от выхода корпуса к середине рукояти */
  BIND.rowerChain = (e, R) => {
    const id = e.id || 'chain', ex = toCat(e.exit), a = R.gripL, c = R.gripR, ax = V.unit(V.sub(a, c)), mid = V.mix(a, c, .5), ext = e.ext || 7;
    const hook = V.add(mid, V.unit(V.sub(ex, mid)), 2.2);
    return [
      { kind: 'beam', a: V.add(a, ax, -5), b: V.add(c, ax, 5), r: 1.5, tone: 'chrome', role: 'frame', id: id + ':bar', mount: id + ':link' },
      { kind: 'beam', a: V.add(a, ax, -5), b: V.add(a, ax, ext), r: 1.8, tone: 'rubber', role: 'grip', id: id + ':handleL', mount: id + ':bar' },
      { kind: 'beam', a: V.add(c, ax, 5), b: V.add(c, ax, -ext), r: 1.8, tone: 'rubber', role: 'grip', id: id + ':handleR', mount: id + ':bar' },
      { kind: 'beam', a: mid, b: hook, r: 1.1, tone: 'chrome', role: 'frame', id: id + ':link', mount: id + ':line' },
      { kind: 'cable', pts: [ex, hook], r: .6, tone: 'cable', role: 'cable', id: id + ':line', mount: e.mountTo }
    ];
  };

  /* ---------- Эллиптический тренажёр (передний привод) ----------
     Маховик и ось шатунов в корпусе у основания передней стойки; длинные тяги педалей: передний конец — на пальце
     шатуна, задний — роликом на направляющей; рукояти качаются на оси стойки и связаны с шатуном тягой.
     Параметры раскладки: axle [y, z], pivot [x, y, z] — оси рукоятей, trackY — верх направляющих роликов. */
  TYPES.elliptical = (s, b) => {
    const A = [0, s.axle[0], s.axle[1]], H = s.pivot, ty = s.trackY || 8, tz0 = s.trackZ[0], tz1 = s.trackZ[1];
    const colB = [0, 8, H[2] + 14], colT = [0, 150, H[2] - 8], colAt = y => V.mix(colB, colT, (y - colB[1]) / (colT[1] - colB[1]));
    /* основание, опоры, направляющие роликов */
    b.tube('base', [0, 4, tz0 - 4], [0, 4, colB[2] + 22], [9, 8], { mount: 'stabR' });
    b.tube('stabF', [-30, 3.5, colB[2] + 18], [30, 3.5, colB[2] + 18], [8, 7], { mount: 'floor' });
    b.tube('stabR', [-32, 3.5, tz0 + 2], [32, 3.5, tz0 + 2], [8, 7], { mount: 'floor' });
    for (const [k, z, x] of [['F', colB[2] + 18, 30], ['R', tz0 + 2, 32]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + 1), 3.5, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.tube('trackX', [-16, 3.5, tz1 - 6], [16, 3.5, tz1 - 6], [7, 7], { mount: 'base' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * s.barX;
      b.tube('track' + k, [x, ty - 3.5, tz0], [x, ty - 3.5, tz1], [6, 7], { mount: 'stabR', tone: 'chrome' });
      b.box('trackEnd' + k, [x, ty + 1, tz0 + 1], [7, 2.5, 2], { mount: 'track' + k, tone: 'rubber', round: .5 });
    }
    /* корпус маховика, ось шатунов, стойка, ось рукоятей, консоль */
    b.box('shroud', [0, 34, A[2] + 3], [13, 60, 52], { mount: 'base', round: 6 });
    b.cyl('axle', A, [1, 0, 0], 2.2, 19, { mount: 'shroud', tone: 'chrome' });
    b.tube('column', colB, colT, [8, 10], { mount: 'base' });
    b.tube('pivotBar', [-H[0] - 3, H[1], H[2]], [H[0] + 3, H[1], H[2]], 2.4, { mount: 'column', tone: 'chrome' });
    for (const sx of [-1, 1]) b.cyl('hub' + (sx > 0 ? 'L' : 'R'), [sx * H[0], H[1], H[2]], [1, 0, 0], 3.4, 6, { mount: 'pivotBar', tone: 'frame' });
    const ca = 30 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', V.add(colT, [0, 6, -3]), [40, 22, 8], { axes: [[1, 0, 0], cy, cz], mount: 'column', round: 2 });
    b.box('screen', V.add(V.add(colT, [0, 6, -3]), cz, -4.2), [24, 14, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    const fy = colT[1] - 22, fz = colAt(fy)[2] - 9;
    b.tube('fixedBar', [-14, fy, fz], [14, fy, fz], 1.6, { mount: 'fixedArm', tone: 'rubber' });
    b.tube('fixedArm', colAt(fy), [0, fy, fz], [4, 4], { mount: 'column' });
    b.anchor('axle', A);
  };
  /* Тяги эллипса по позе: педаль — под стопой, тяга от ролика на направляющей к пальцу шатуна, шатун на оси;
     рукоять — от кисти через ось качания к нижнему рычагу и тяге к тяге педали. */
  BIND.ellipticalLinks = (e, R) => {
    const id = e.id || 'ell', out = [], toI = p => [p[0], M.FLOOR - p[1], p[2]], dI = d => [d[0], -d[1], d[2]];
    const dl = (e.delta || 8) * D2R, A = [0, e.axle[0], e.axle[1]];
    for (const s of ['L', 'R']) {
      /* рамка пальцев стопы лежит на педали (пятка может слегка приподниматься в конце шага) */
      const g = s === 'L' ? 1 : -1, f = R.frames['toes' + s], up = dI(f.y), fw = dI(f.z), side = dI(f.x);
      const sole = V.add(V.add(toI(R['ball' + s]), up, -2), fw, -10);
      const pc = V.add(sole, up, -1.3), ub = V.add(V.scale(fw, Math.cos(dl)), up, Math.sin(dl)), nb = V.add(V.scale(up, Math.cos(dl)), fw, -Math.sin(dl));
      const pb = V.add(pc, nb, -e.standoff), cp = V.add(pb, ub, (1 - e.frac) * e.barLen), rr = V.add(pb, ub, -e.frac * e.barLen);
      const P = p => toCat(p), D = d => dirCat(V.unit(d));
      const ax = [g * e.armX, A[1], A[2]], pin = [g * e.armX, cp[1], cp[2]];
      out.push({ kind: 'beam', a: P(ax), b: P(pin), w: 4, h: 2, up: [1, 0, 0], tone: 'chrome', role: 'linkage', id: id + ':crank' + s, mount: e.mountTo });
      out.push({ kind: 'beam', a: P(V.add(pin, [g * 1, 0, 0])), b: P(cp), r: 1.2, tone: 'chrome', role: 'linkage', id: id + ':pin' + s, mount: id + ':crank' + s });
      out.push({ kind: 'beam', a: P(V.add(rr, ub, -3)), b: P(V.add(cp, ub, 3)), w: 4.5, h: 4, up: D(side), tone: 'frame', role: 'linkage', id: id + ':bar' + s, mount: id + ':pin' + s });
      out.push({ kind: 'cyl', c: P(rr), axis: [1, 0, 0], r: 4, len: 3.4, tone: 'rubber', role: 'linkage', id: id + ':roller' + s, mount: id + ':bar' + s });
      out.push({ kind: 'beam', a: P(V.add(pb, nb, 1.5)), b: P(V.add(pc, nb, -1)), w: 6, h: 6, up: D(fw), tone: 'frame', role: 'linkage', id: id + ':bracket' + s, mount: id + ':bar' + s });
      out.push({ kind: 'obox', c: P(pc), x: D(side), y: D(up), z: D(fw), size: [15, 2.4, 36], round: .8, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':bracket' + s });
      out.push({ kind: 'obox', c: P(V.add(V.add(pc, fw, -17.4), up, 2.4)), x: D(side), y: D(up), z: D(fw), size: [15, 3, 1.4], round: .4, tone: 'frame', role: 'pedal', id: id + ':heelStop' + s, mount: id + ':pedal' + s });
      /* рукоять: положение рычага восстанавливается по кисти G и оси качания H (рукоять жёсткая: G − H
         повёрнут относительно рычага на постоянный угол), ручка повёрнута относительно рычага на bend */
      const H = [g * e.pivot[0], e.pivot[1], e.pivot[2]], G = toI(R['grip' + s]), bd = e.bend * D2R;
      const ga = Math.atan2(e.grip * Math.sin(bd), e.upper + e.grip * Math.cos(bd)), vn = Math.hypot(G[1] - H[1], G[2] - H[2]), vy = (G[1] - H[1]) / vn, vz = (G[2] - H[2]) / vn;
      const u = [0, vy * Math.cos(ga) + vz * Math.sin(ga), vz * Math.cos(ga) - vy * Math.sin(ga)];
      const w = [0, u[1] * Math.cos(bd) - u[2] * Math.sin(bd), u[2] * Math.cos(bd) + u[1] * Math.sin(bd)];
      const E = V.add(H, u, -e.lever), K = V.add(H, u, e.upper);
      out.push({ kind: 'beam', a: P(E), b: P(K), r: 2, tone: 'frame', role: 'linkage', id: id + ':arm' + s, mount: e.mountHub + s });
      out.push({ kind: 'beam', a: P(K), b: P(V.add(G, w, -7)), r: 2, tone: 'frame', role: 'linkage', id: id + ':upright' + s, mount: id + ':arm' + s });
      out.push({ kind: 'beam', a: P(V.add(G, w, -7)), b: P(V.add(G, w, 10)), r: 1.9, tone: 'rubber', role: 'grip', id: id + ':handle' + s, mount: id + ':upright' + s });
      const lb = V.add(V.add(cp, ub, -e.linkAt), [g * 2.3, 0, 0]);
      out.push({ kind: 'beam', a: P(E), b: P(lb), r: 1.3, tone: 'chrome', role: 'linkage', id: id + ':link' + s, mount: id + ':arm' + s });
    }
    return out;
  };

  /* ---------- Степпер (лестница) ----------
     Две педали на длинных рычагах с осью у основания передней стойки; педали держатся горизонтально
     параллельной тягой, ход рычагов гасят цилиндры; боковые поручни на высоте railY, консоль на стойке.
     pivot [x, y, z] — ось рычага левой педали, railZ — задний конец поручней. */
  TYPES.stepper = (s, b) => {
    const pv = s.pivot, ry = s.railY, rx = s.railX || 29, rz = s.railZ, zb = rz - 12;
    b.tube('base', [0, 4, zb], [0, 4, pv[2] + 22], [10, 8], { mount: 'stabR' });
    b.tube('stabF', [-34, 3.5, pv[2] + 18], [34, 3.5, pv[2] + 18], [8, 7], { mount: 'floor' });
    b.tube('stabR', [-34, 3.5, zb + 4], [34, 3.5, zb + 4], [8, 7], { mount: 'floor' });
    for (const [k, z] of [['F', pv[2] + 18], ['R', zb + 4]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * 35, 3.5, z], [3, 7, 9], { mount: 'stab' + k, tone: 'rubber', round: .8 });
    b.box('pivotBlock', [0, pv[1], pv[2] + 4], [12, 16, 14], { mount: 'base', round: 1.5 });
    b.cyl('pivotAxle', [0, pv[1], pv[2]], [1, 0, 0], 2, 2 * pv[0] + 8, { mount: 'pivotBlock', tone: 'chrome' });
    b.cyl('linkAxle', [0, pv[1] + 14, pv[2] + 10 - (pv[1] + 6) * 16 / 134], [1, 0, 0], 1.4, 2 * pv[0] + 6, { mount: 'column', tone: 'chrome' });
    b.tube('dampBase', [-pv[0] - 4, 3.5, zb + 22], [pv[0] + 4, 3.5, zb + 22], [6, 7], { mount: 'base' });
    /* передняя стойка, консоль, поручни */
    const cB = [0, 8, pv[2] + 10], cT = [0, 142, pv[2] - 6];
    b.tube('column', cB, cT, [10, 12], { mount: 'base' });
    const ca = 30 * D2R, cy = [0, Math.cos(ca), -Math.sin(ca)], cz = [0, Math.sin(ca), Math.cos(ca)];
    b.box('console', V.add(cT, [0, 6, -4]), [42, 22, 8], { axes: [[1, 0, 0], cy, cz], mount: 'column', round: 2 });
    b.box('screen', V.add(V.add(cT, [0, 6, -4]), cz, -4.2), [26, 14, .6], { axes: [[1, 0, 0], cy, cz], mount: 'console', tone: 'rubber', round: .3 });
    const fz = V.mix(cB, cT, (ry - cB[1]) / (cT[1] - cB[1]))[2] - 4;
    b.tube('railFront', [-rx, ry, fz], [rx, ry, fz], 2, { mount: 'railCol', tone: 'chrome' });
    b.tube('railCol', V.mix(cB, cT, (ry - cB[1]) / (cT[1] - cB[1])), [0, ry, fz], [5, 5], { mount: 'column' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R';
      b.tube('rail' + k, [sx * rx, ry, fz], [sx * rx, ry, rz], 2, { mount: 'railFront', role: 'grip', tone: 'chrome' });
      b.tube('railPost' + k, [sx * rx, ry, rz], [sx * rx, 4, rz - 10], 2.4, { mount: 'rail' + k, tone: 'chrome' });
      b.box('railFoot' + k, [sx * rx, 2, rz - 11], [6, 4, 8], { mount: 'floor', tone: 'rubber', round: .8 });
      b.box('pulse' + k, [sx * rx, ry, fz + 3 - 14], [4.4, 4.4, 9], { mount: 'rail' + k, tone: 'rubber', round: 1 });
    }
    b.anchor('pivot', pv);
  };
  /* Педали степпера: площадка под стопой (рамка пальцев), рычаг к оси, параллельная тяга, цилиндр-демпфер */
  BIND.stepPedals = (e, R) => {
    const id = e.id || 'step', out = [], toI = p => [p[0], M.FLOOR - p[1], p[2]], dI = d => [d[0], -d[1], d[2]], P = p => toCat(p), D = d => dirCat(V.unit(d));
    for (const s of ['L', 'R']) {
      const g = s === 'L' ? 1 : -1, f = R.frames['toes' + s], up = dI(f.y), fw = dI(f.z), side = dI(f.x);
      const pc = V.add(V.add(V.add(toI(R['ball' + s]), up, -2), fw, -9), up, -1.4);
      const pv = [g * e.pivot[0], e.pivot[1], e.pivot[2]], le = [pv[0], pc[1] - 6, pc[2] + 21], lt = V.add(le, [0, 14, 0]), la = [pv[0], pv[1] + 14, pv[2] - 2];
      out.push({ kind: 'obox', c: P(pc), x: D(side), y: D(up), z: D(fw), size: [17, 2.8, 36], round: .8, tone: 'rubber', role: 'pedal', id: id + ':pedal' + s, mount: id + ':bracket' + s });
      out.push({ kind: 'obox', c: P(V.add(V.add(pc, up, -2.8), [0, 0, 4])), x: [1, 0, 0], y: [0, -1, 0], z: [0, 0, 1], size: [12, 3, 38], round: .6, tone: 'frame', role: 'linkage', id: id + ':bracket' + s, mount: id + ':post' + s });
      out.push({ kind: 'beam', a: P(V.add(le, [0, -2, 0])), b: P(V.add(lt, [0, 2, 0])), w: 4, h: 4, up: [0, 0, 1], tone: 'frame', role: 'linkage', id: id + ':post' + s, mount: id + ':lever' + s });
      out.push({ kind: 'beam', a: P(pv), b: P(le), w: 5, h: 4, up: [1, 0, 0], tone: 'frame', role: 'linkage', id: id + ':lever' + s, mount: e.mountTo });
      out.push({ kind: 'beam', a: P(la), b: P(lt), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':link' + s, mount: id + ':post' + s });
      const db = [pv[0], 7, e.dampZ], dt = V.mix(pv, le, .55), dm = V.mix(db, dt, .55);
      out.push({ kind: 'beam', a: P(db), b: P(dm), r: 2.3, tone: 'stack', role: 'linkage', id: id + ':damper' + s, mount: e.mountDamp });
      out.push({ kind: 'beam', a: P(V.add(dm, V.unit(V.sub(dm, db)), -2)), b: P(V.add(dt, [0, -2, 0])), r: 1, tone: 'chrome', role: 'linkage', id: id + ':rod' + s, mount: id + ':damper' + s });
    }
    return out;
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
