/* Инвентарь группы G2 (гантели и гири).
   g2Step — степ-платформа для подъёмов на носки: 90x35 см, высота 15 см, резиновое покрытие, две опоры.
   g2CupDumbbell — гантель, которую держат двумя ладонями под верхним диском (гоблет, разгибание из-за головы,
   пуловер): ось гантели — по нормали ладоней, внутренняя грань верхнего диска лежит на ладонях.
   g2KbHorns — гиря двумя руками «за рога» (гоблет): хваты на дужках рукояти, шар под рукоятью.
   g2FistDumbbell — гантель вертикально у груди, верхний диск лежит на кулаках (гоблет, та же поза кистей, что и с гирей). */
((E) => {
  const M = typeof Mannequin !== 'undefined' ? Mannequin : require('./09bm-mannequin.js');
  const { V } = M, { TYPES, BIND } = E;
  /* Степ-платформа: верх на высоте height, длина len по X, глубина depth по Z */
  TYPES.g2Step = (s, b) => {
    const H = s.height || 15, L = s.len || 90, D = s.depth || 35;
    b.box('top', [0, H - .6, 0], [L - 2, 1.2, D - 2], { role: 'support', tone: 'rubber', mount: 'deck', round: .5, contact: 'top' });
    b.box('deck', [0, H - 3.2, 0], [L, 4, D], { mount: 'riserL', round: 1 });
    for (const sx of [-1, 1]) b.box('riser' + (sx > 0 ? 'L' : 'R'), [sx * (L / 2 - 9), (H - 5.2) / 2, 0], [16, H - 5.2, D - 3], { mount: 'floor', round: .8 });
    b.anchor('top', [0, H, 0]); b.anchor('edgeB', [0, H, -D / 2]); b.anchor('edgeF', [0, H, D / 2]);
  };
  /* Гантель в ладонях: ладони (hands) под внутренней гранью верхнего диска.
     axis: 'palms' — по средней нормали ладоней (по умолчанию), 'gravity' — вертикально. */
  BIND.g2CupDumbbell = (e, R) => {
    const hs = e.hands || ['L', 'R'], id = e.id || 'cup';
    const pal = hs.map(s => { const f = R.frames['hand' + s], g = s === 'L' ? 1 : -1; return { p: V.add(V.add(f.o, f.x, -g * 1.8), f.y, -5.6), n: V.scale(f.x, -g) }; });
    let n = V.unit(pal.reduce((a, q) => V.add(a, q.n), [0, 0, 0]));
    if (e.axis === 'gravity') n = [0, -1, 0];
    const P0 = V.scale(pal.reduce((a, q) => V.add(a, q.p), [0, 0, 0]), 1 / pal.length);
    const lift = Math.max(...pal.map(q => V.dot(V.sub(q.p, P0), n)));
    const H = e.handle || 13.5, hr = e.headR || 7.5, hl = e.headLen || 7;
    const face = V.add(P0, n, lift + (e.gap ?? .15)), c = V.add(face, n, -(H / 2 + 1.2));
    const at = k => V.add(c, n, k);
    return [
      { kind: 'cyl', c: at(H / 2 + 1.2 + hl / 2), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':top', mount: 'hands' },
      { kind: 'cyl', c: at(H / 2 + .6), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarT', mount: id + ':top' },
      { kind: 'beam', a: at(-(H / 2 + .6)), b: at(H / 2 + .6), r: 1.6, tone: 'chrome', role: 'grip', id: id + ':handle', mount: id + ':collarT' },
      { kind: 'cyl', c: at(-(H / 2 + .6)), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'grip', id: id + ':collarB', mount: id + ':handle' },
      { kind: 'cyl', c: at(-(H / 2 + 1.2 + hl / 2)), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':bottom', mount: id + ':collarB' }
    ];
  };
  /* Гиря «за рога» двумя руками (гоблет): дужки рукояти — в кулаках. Ось «вверх» гири — средняя линия больших пальцев,
     центры хватов — на дужках (±8,65 см от оси, 10,5 см над центром шара при Ø21), шар ниже рукояти.
     Дужки — короткие участки рукояти (role grip): на них проверяется хват. */
  BIND.g2KbHorns = (e, R) => {
    const id = e.id || 'kb', k = (e.r || 10.5) / 10.5, gL = R.gripL, gR = R.gripR, ax = V.unit(V.sub(gL, gR)), mid = V.mix(gL, gR, .5);
    const th = V.add(R.frames.handL.z, R.frames.handR.z), up = V.unit(V.perp(V.len(V.perp(th, ax)) > .2 ? th : [0, -1, 0], ax));
    const c = V.add(mid, up, -10.5 * k), L = (a, u) => V.add(V.add(c, ax, a * k), up, u * k);
    const horn = sg => ({ kind: 'beam', a: L(sg * 8.1, 6.9), b: L(sg * 9.1, 13.4), r: 1.7, tone: 'plate', role: 'grip', id: id + ':horn' + (sg > 0 ? 'L' : 'R'), mount: id });
    return [{ kind: 'kettlebell', c, grip: L(0, 15.6), axis: ax, handleAxis: ax, radius: 10.5 * k, role: 'free', tone: 'plate', free: true, id, mount: 'hands' }, horn(1), horn(-1)];
  };
  /* Гантель верхним диском на кулаках (гоблет): кулаки по бокам рукояти, ось — средняя линия больших пальцев,
     внутренняя грань верхнего диска лежит на указательных пальцах, рукоять и нижний диск — ниже кулаков. */
  BIND.g2FistDumbbell = (e, R) => {
    const id = e.id || 'gdb', gL = R.gripL, gR = R.gripR, mid = V.mix(gL, gR, .5);
    const n = V.unit(V.add(R.frames.handL.z, R.frames.handR.z)), H = e.handle || 13.5, hr = e.headR || 7.5, hl = e.headLen || 7;
    const face = V.add(mid, n, e.lift ?? 4.7), c = V.add(face, n, -(H / 2 + 1.2)), at = k => V.add(c, n, k);
    return [
      { kind: 'cyl', c: at(H / 2 + 1.2 + hl / 2), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':top', mount: 'hands' },
      { kind: 'cyl', c: at(H / 2 + .6), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'weight', id: id + ':collarT', mount: id + ':top' },
      { kind: 'beam', a: at(-(H / 2 + .6)), b: at(H / 2 + .6), r: 1.6, tone: 'chrome', role: 'weight', id: id + ':handle', mount: id + ':collarT' },
      { kind: 'cyl', c: at(-(H / 2 + .6)), axis: n, r: 2.6, len: 1.2, sides: 14, tone: 'chrome', role: 'weight', id: id + ':collarB', mount: id + ':handle' },
      { kind: 'cyl', c: at(-(H / 2 + 1.2 + hl / 2)), axis: n, r: hr, len: hl, sides: 6, tone: 'plate', role: 'weight', id: id + ':bottom', mount: id + ':collarB' }
    ];
  };
})(typeof GymEquipment !== 'undefined' ? GymEquipment : require('./09bn-equipment.js'));
