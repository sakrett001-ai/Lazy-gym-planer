/* Инвентарь группы G1 (штанга, стойки, скамьи): станции для жима на наклонной скамье и скамье с обратным
   наклоном, скамья Скотта, «мина» (Т-гриф на шарнире) с V-рукоятью, подушка на гриф для ягодичного моста.
   Размеры — по типовым коммерческим образцам (см): подушки толщиной 6–7, профиль рамы 5–8,
   стойки 7,5×5, J-крюки как в силовой раме; гриф 220 см / шейка 131 / Ø2,8, втулки Ø5. */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V, D2R } = M, { TYPES, BIND } = E;

  /* Стойка с J-крюком: вертикальная труба 5×7,5 от опоры до крюка, крюк смотрит к -Z (к атлету) */
  function upright(b, k, x, z, base, top, hook, mount) {
    b.tube('up' + k, [x, base, z], [x, top, z], [5, 7.5], { mount });
    b.box('hook' + k, [x, hook - 2, z - 6.2], [4.5, 4, 5], { mount: 'up' + k, tone: 'chrome', round: .6 });
    b.box('hookLip' + k, [x, hook + 1.5, z - 8.3], [4.5, 5, 1.2], { mount: 'hook' + k, tone: 'chrome', round: .4 });
  }

  /* Станция для жима на наклонной скамье (олимпийская наклонная скамья).
     Локально: сиденье спереди (-Z), спинка поднимается к +Z под углом back°, атлет сидит лицом к -Z.
     seatH — высота сиденья у шарнира, back — угол спинки, seat — подъём передней кромки сиденья,
     hook — высота крюков, upZ — положение стоек по Z (за верхним краем спинки), halfWidth — полуширина стоек. */
  TYPES.g1InclineRack = (s, b) => {
    const H = s.seatH || 47, a = (s.back ?? 38) * D2R, sa = (s.seat ?? 12) * D2R, T = 6, W = s.width || 30, bl = s.backLen || 82, sl = s.seatLen || 34;
    const hz = s.hingeZ ?? 0, hinge = [0, H - T, hz], X = s.halfWidth || 56, upZ = s.upZ ?? 62, hookH = s.hook || 130;
    /* подушки и пластины под ними */
    const bz = [0, Math.sin(a), Math.cos(a)], by = [0, Math.cos(a), -Math.sin(a)], sz = [0, Math.sin(sa), -Math.cos(sa)], sy = [0, Math.cos(sa), Math.sin(sa)];
    const backC = V.add(V.add(hinge, bz, bl / 2 + 1.5), by, T / 2), seatC = V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, T / 2);
    b.box('back', backC, [W, T, bl], { axes: [[1, 0, 0], by, bz], role: 'support', tone: 'pad', mount: 'backPlate', round: 1.6, contact: 'top' });
    b.box('backPlate', V.add(V.add(hinge, bz, bl / 2 + 1.5), by, -1), [W - 6, 2, bl - 6], { axes: [[1, 0, 0], by, bz], mount: 'spine' });
    b.box('seat', seatC, [W + 2, T, sl], { axes: [[1, 0, 0], sy, V.scale(sz, -1)], role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.6, contact: 'top' });
    b.box('seatPlate', V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, -1), [W - 6, 2, sl - 4], { axes: [[1, 0, 0], sy, V.scale(sz, -1)], mount: 'seatPost' });
    /* рама: продольная балка по полу, стойка сиденья, наклонный хребет под спинкой, подкос */
    b.tube('rail', [0, 3.75, -50], [0, 3.75, upZ + 4], [8, 7.5], { mount: 'floor' });
    b.tube('footF', [-30, 3.75, -50], [30, 3.75, -50], [7.5, 7.5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('capF' + (sx < 0 ? 'R' : 'L'), [sx * 30.5, 3.75, -50], [2, 7, 7], { mount: 'footF', tone: 'rubber', round: .5 });
    const plateC = V.add(V.add(hinge, sz, sl / 2 + 1.5), sy, -1), postZ = plateC[2];
    b.tube('seatPost', [0, 7.5, postZ], [0, plateC[1] - 1.2, postZ], [7, 7], { mount: 'rail' });
    const spineA = V.add(hinge, by, -3.5), spineB = V.add(V.add(hinge, bz, bl - 8), by, -3.5);
    b.tube('spine', spineA, spineB, [6, 6], { mount: 'hingeBlock', up: by });
    b.box('hingeBlock', [0, H - T - 3.5, (postZ + hz + 6) / 2], [10, 7, hz + 6 - postZ + 7], { mount: 'seatPost' });
    const strutTop = V.add(V.add(hinge, bz, bl * .62), by, -5.5);
    b.tube('strut', [0, 7.5, strutTop[2] + 4], strutTop, [6, 6], { mount: 'rail' });
    /* стойки с J-крюками за спинкой, основание — поперечина на полу */
    b.tube('baseB', [-X - 4, 3.75, upZ], [X + 4, 3.75, upZ], [7.5, 7.5], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * X;
      upright(b, k, x, upZ, 7.5, hookH + 16, hookH, 'baseB');
      b.tube('foot' + k, [x, 3.75, upZ - 26], [x, 3.75, upZ + 22], [7.5, 6], { mount: 'baseB' });
    }
    /* поперечина между стойками и тяга к подкосу спинки */
    const yb = Math.min(H + 4, hookH - 30), sTop = V.add(V.add(hinge, bz, bl * .62), by, -5.5);
    b.tube('braceX', [-X, yb, upZ], [X, yb, upZ], [5, 5], { mount: 'upL' });
    const zLink = Math.min(sTop[2] + 1, upZ - 3);
    b.tube('link', [0, yb, upZ], [0, yb, zLink], [5, 5], { mount: 'braceX' });
    b.tube('linkPost', [0, 7.5, zLink], [0, yb, zLink], [5, 5], { mount: 'rail' });
    b.anchor('hinge', hinge);
    b.frameAnchor('backPad', V.add(hinge, by, T), [[1, 0, 0], by, bz]);
    b.frameAnchor('seatPad', V.add(hinge, sy, T), [[1, 0, 0], sy, V.scale(sz, -1)]);
    b.anchor('hook', [0, hookH, upZ - 6.2]);
  };

  /* Станция для жима на скамье с обратным наклоном.
     Локально: голова к +Z (нижний конец), таз у -Z (верхний конец); подушка опускается к голове под углом decline°.
     hipH — высота верха подушки у тазового конца; валик под коленями (knee) и валики перед голенями (ankle) —
     на стойке ног спереди; стойки с крюками у головного конца. */
  TYPES.g1DeclineRack = (s, b) => {
    const a = (s.decline ?? 16) * D2R, T = 6, W = s.width || 29, L = s.padLen || 96, z0 = s.padZ0 ?? -18, hipH = s.hipH || 62;
    const dir = [0, -Math.sin(a), Math.cos(a)], nrm = [0, Math.cos(a), Math.sin(a)], top0 = [0, hipH, z0];
    const padC = V.add(V.add(top0, dir, L / 2), nrm, -T / 2);
    b.box('pad', padC, [W, T, L], { axes: [[1, 0, 0], nrm, dir], role: 'support', tone: 'pad', mount: 'padPlate', round: 1.6, contact: 'top' });
    b.box('padPlate', V.add(V.add(top0, dir, L / 2), nrm, -T - 1), [W - 6, 2, L - 6], { axes: [[1, 0, 0], nrm, dir], mount: 'spine' });
    /* наклонная балка под подушкой и две опоры */
    const sp0 = V.add(V.add(top0, dir, 6), nrm, -T - 2 - 3.5), sp1 = V.add(V.add(top0, dir, L - 10), nrm, -T - 2 - 3.5);
    b.tube('spine', sp0, sp1, [7, 7], { mount: 'legHi', up: nrm });
    b.tube('legHi', [0, 7.5, sp0[2] + 2], V.add(sp0, nrm, -2), [7, 7], { mount: 'rail' });
    b.tube('legLo', [0, 7.5, sp1[2] - 2], V.add(sp1, nrm, -2), [7, 7], { mount: 'rail' });
    const kz = s.kneeZ ?? -60, ky = s.kneeY ?? 70, az = s.ankleZ ?? -72, ay = s.ankleY ?? 30, upZ = s.upZ ?? 70, X = s.halfWidth || 56, hookH = s.hook || 108;
    b.tube('rail', [0, 3.75, Math.min(kz, az) - 12], [0, 3.75, Math.max(upZ, sp1[2] + 2) + 4], [8, 7.5], { mount: 'floor' });
    b.tube('footF', [-30, 3.75, Math.min(kz, az) - 12], [30, 3.75, Math.min(kz, az) - 12], [7.5, 7.5], { mount: 'floor' });
    for (const sx of [-1, 1]) b.box('capF' + (sx < 0 ? 'R' : 'L'), [sx * 30.5, 3.75, Math.min(kz, az) - 12], [2, 7, 7], { mount: 'footF', tone: 'rubber', round: .5 });
    /* стойка ног: от рамы к валику под коленями; ниже и впереди — валики перед голенями */
    const legBase = [0, 7.5, Math.min(kz, az) - 6];
    b.tube('legPost', legBase, [0, ky - 2, kz], [6, 6], { mount: 'rail' });
    b.cyl('kneeAxle', [0, ky, kz], [1, 0, 0], 1.5, 38, { mount: 'legPost', tone: 'chrome' });
    /* валики называются по знаку X (лёжа на спине левая нога атлета — на −X) */
    for (const sx of [-1, 1]) b.cyl('knee' + (sx > 0 ? 'Xp' : 'Xn'), [sx * 10, ky, kz], [1, 0, 0], s.kneeR || 5.5, 16, { mount: 'kneeAxle', role: 'support', tone: 'pad' });
    const ankleArmTop = V.mix(legBase, [0, ky - 2, kz], (ay - legBase[1]) / (ky - 2 - legBase[1]));
    b.tube('ankleArm', ankleArmTop, [0, ay, az], [5, 5], { mount: 'legPost' });
    b.cyl('ankleAxle', [0, ay, az], [1, 0, 0], 1.5, 36, { mount: 'ankleArm', tone: 'chrome' });
    for (const sx of [-1, 1]) b.cyl('ankle' + (sx > 0 ? 'Xp' : 'Xn'), [sx * 10, ay, az], [1, 0, 0], s.ankleR || 5, 15, { mount: 'ankleAxle', role: 'support', tone: 'pad' });
    /* стойки с крюками у головного конца */
    b.tube('baseB', [-X - 4, 3.75, upZ], [X + 4, 3.75, upZ], [7.5, 7.5], { mount: 'rail' });
    for (const sx of [-1, 1]) {
      const k = sx > 0 ? 'L' : 'R', x = sx * X;
      upright(b, k, x, upZ, 7.5, hookH + 16, hookH, 'baseB');
      b.tube('foot' + k, [x, 3.75, upZ - 26], [x, 3.75, upZ + 22], [7.5, 6], { mount: 'baseB' });
    }
    b.frameAnchor('pad', top0, [[1, 0, 0], nrm, dir]);
    b.anchor('knee', [0, ky, kz]); b.anchor('ankle', [0, ay, az]); b.anchor('hook', [0, hookH, upZ - 6.2]);
  };

  /* Скамья Скотта: сиденье на стойке и наклонный упор для плеч.
     Локально: атлет сидит лицом к +Z; верхняя кромка упора — на высоте padTop в точке padZ, упор опускается вперёд
     под углом slope° к горизонту. Длина упора вдоль наклона padLen, ширина padW. */
  TYPES.g1Preacher = (s, b) => {
    const seatH = s.seatH || 60, padTop = s.padTop || 108, pz = s.padZ ?? 20, sl = (s.slope ?? 45) * D2R, PL = s.padLen || 36, PW = s.padW || 62, T = 7;
    const down = [0, -Math.sin(sl), Math.cos(sl)], nrm = [0, Math.cos(sl), Math.sin(sl)], edge = [0, padTop, pz];
    const padC = V.add(V.add(edge, down, PL / 2), nrm, -T / 2);
    b.box('pad', padC, [PW, T, PL], { axes: [[1, 0, 0], nrm, down], role: 'support', tone: 'pad', mount: 'padPlate', round: 2.2, contact: 'top' });
    /* валик верхней кромки (под подмышками) */
    b.cyl('roll', V.add(edge, nrm, -3.2), [1, 0, 0], 3.4, PW - 4, { mount: 'padPlate', role: 'support', tone: 'pad' });
    b.box('padPlate', V.add(V.add(edge, down, PL / 2), nrm, -T - 1), [PW - 8, 2, PL - 4], { axes: [[1, 0, 0], nrm, down], mount: 'padArm' });
    /* опорная колонна позади упора (со стороны от атлета) */
    const under = V.add(V.add(edge, down, PL * .55), nrm, -T - 2), colZ = under[2] + 10;
    b.tube('padArm', V.add(under, nrm, -1.5), [0, under[1] - 12, colZ], [6, 6], { mount: 'column' });
    b.tube('column', [0, 7.5, colZ], [0, under[1] - 9, colZ], [8, 8], { mount: 'base' });
    b.tube('base', [0, 3.75, -32], [0, 3.75, colZ + 28], [8, 7.5], { mount: 'floor' });
    b.tube('baseF', [-34, 3.75, colZ + 22], [34, 3.75, colZ + 22], [7.5, 7.5], { mount: 'base' });
    b.tube('baseB', [-30, 3.75, -28], [30, 3.75, -28], [7.5, 7.5], { mount: 'base' });
    for (const [k, z, x] of [['F', colZ + 22, 34], ['B', -28, 30]]) for (const sx of [-1, 1]) b.box('cap' + k + (sx > 0 ? 'L' : 'R'), [sx * (x + .5), 3.75, z], [2, 7, 7], { mount: 'base' + k, tone: 'rubber', round: .5 });
    /* сиденье */
    const sz = s.seatZ ?? -6;
    b.box('seat', [0, seatH - 3, sz], [34, 6, 28], { role: 'support', tone: 'pad', mount: 'seatPlate', round: 1.8, contact: 'top' });
    b.box('seatPlate', [0, seatH - 7, sz], [26, 2, 22], { mount: 'seatPost' });
    b.tube('seatPost', [0, 7.5, sz], [0, seatH - 8, sz], [6, 6], { mount: 'base' });
    b.frameAnchor('pad', edge, [[1, 0, 0], nrm, down]);
    b.anchor('seatTop', [0, seatH, 0]);
  };

  /* «Мина»: опорная плита на полу и шарнир со стаканом для конца грифа (стакан вращается вместе с грифом) */
  TYPES.g1Landmine = (s, b) => {
    b.box('plate', [0, 1, 0], [42, 2, 42], { mount: 'floor', round: .5 });
    /* две щеки вилки и ось между ними; стакан грифа вращается на оси между щеками */
    for (const sx of [-1, 1]) b.box('yoke' + (sx > 0 ? 'L' : 'R'), [sx * 5.6, 6.5, 0], [2, 11, 10], { mount: 'plate', round: .5 });
    b.cyl('pin', [0, 8, 0], [1, 0, 0], 1.4, 15, { mount: 'yokeL', tone: 'chrome' });
    b.anchor('pivot', [0, 8, 0]);
  };

  /* Т-гриф на «мине»: гриф от шарнира (pivot) через крюк V-рукояти над кистями; блины на дальней втулке.
     hookAt — расстояние от шарнира до крюка рукояти вдоль грифа; V-рукоять — две параллельные ручки вдоль грифа
     (нейтральный хват) на 9 см ниже грифа. */
  BIND.g1LandmineBar = (e, R) => {
    const id = e.id || 'tbar', P = M.toCat(e.pivot), up = [0, -1, 0];
    const H = V.mix(R.gripL, R.gripR, .5), drop = e.drop ?? 9, T = V.add(H, up, drop), d = V.unit(V.sub(T, P)), at = k => V.add(P, d, k);
    const out = [];
    const mount = e.mountTo || 'floor';
    out.push({ kind: 'beam', a: at(-4), b: at(26), r: 3.4, tone: 'frame', role: 'linkage', id: id + ':sleeve', mount });
    out.push({ kind: 'beam', a: at(26), b: at(40), r: 2.5, tone: 'chrome', role: 'linkage', id: id + ':sleeveN', mount: id + ':sleeve' });
    out.push({ kind: 'cyl', c: at(41), axis: d, r: 2.4, len: 2, tone: 'chrome', role: 'linkage', id: id + ':collarN', mount: id + ':sleeveN' });
    const shaftEnd = 41 + 131;
    out.push({ kind: 'beam', a: at(41), b: at(shaftEnd), r: 1.4, tone: 'chrome', role: 'linkage', id: id + ':shaft', mount: id + ':sleeveN' });
    out.push({ kind: 'cyl', c: at(shaftEnd + 1), axis: d, r: 2.4, len: 2, tone: 'chrome', role: 'linkage', id: id + ':collarF', mount: id + ':shaft' });
    out.push({ kind: 'beam', a: at(shaftEnd + 2), b: at(216), r: 2.5, tone: 'chrome', role: 'linkage', id: id + ':sleeveF', mount: id + ':collarF' });
    let k = shaftEnd + 2.6;
    (e.plates || [[16.5, 3.2], [16.5, 3.2]]).forEach((p, i) => { out.push({ kind: 'cyl', c: at(k + p[1] / 2), axis: d, r: p[0], len: p[1], sides: 32, tone: 'plate', role: 'linkage', id: id + ':plate' + i, mount: id + ':sleeveF' }); k += p[1] + .3; });
    out.push({ kind: 'cyl', c: at(k + 1.5), axis: d, r: 3.4, len: 3, tone: 'rubber', role: 'linkage', id: id + ':clamp', mount: id + ':sleeveF' });
    /* V-рукоять: крюк охватывает гриф, от него две щеки вниз к ручкам */
    out.push({ kind: 'obox', c: V.add(T, up, -.4), x: V.unit(V.cross(d, up)), y: V.scale(up, -1), z: d, size: [5, 4.4, 7], round: .8, tone: 'frame', role: 'linkage', id: id + ':hook', mount: id + ':shaft' });
    for (const s of ['L', 'R']) {
      const g = R['grip' + s], hz = R.frames['hand' + s].z, ax = V.dot(hz, d) >= 0 ? hz : V.scale(hz, -1);
      const a0 = V.add(g, ax, -6.5), a1 = V.add(g, ax, 6.5);
      out.push({ kind: 'beam', a: a0, b: a1, r: 1.6, tone: 'rubber', role: 'grip', id: id + ':grip' + s, mount: id + ':cheek' + s });
      out.push({ kind: 'beam', a: V.add(a1, ax, .5), b: V.add(T, d, 3), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':cheek' + s, mount: id + ':hook' });
      out.push({ kind: 'beam', a: V.add(a0, ax, -.5), b: V.add(T, d, -3), r: 1.1, tone: 'chrome', role: 'linkage', id: id + ':cheekB' + s, mount: id + ':hook' });
    }
    return out;
  };

  /* Подушка на гриф для ягодичного моста: поролоновый цилиндр Ø10 × 40 по центру грифа */
  BIND.g1BarPad = (e, R) => {
    const L = R.gripL, Rr = R.gripR, axis = V.unit(V.sub(L, Rr)), c = V.mix(L, Rr, .5);
    return [{ kind: 'cyl', c, axis, r: e.r || 5, len: e.len || 40, sides: 20, tone: 'pad', role: 'pad', id: (e.id || 'barPad') + ':foam', mount: e.mountTo || 'bar' }];
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
