'use strict';
/* Аудит тросов, блоков и эспандеров: как трос и лента идут от блока (крепления) к рукояти во всех упражнениях с тросом,
   блоком и лентой, по кадрам повторения. Печатает подозрительное, ничего не исправляет.
   node tools/mannequin/cable-audit.js [--only id,id] [--samples 41] [--json file] [--all] [--baked] [--frames]
   --all — все упражнения (по умолчанию — только с замечаниями), --baked — ключи из src/js/09bp-poses.js, а не из
   спецификаций, --frames — покадровая таблица (угол троса, высота кисти, подъём стека).

   Трос на блоке (BIND.g3cable), по кадрам:
   * угол троса к полу (+ — от колеса вверх к рукояти) и к линии тяги (направлению хода рукояти или голеностопа:
     0° — трос вдоль хода, 90° — поперёк);
   * высота кисти (середины хвата) или голеностопа над осью блока;
   * путь рукояти: у упражнений, где по технике рукоять идёт вдоль троса (тяги, тяга к лицу, протяжка, разгибания),
     — отклонение от прямой «рукоять → блок» в конце тяги и поворот троса за повтор; у дуговых (разводки, подъёмы,
     сгибания) — выход троса из плоскости движения (плоскость пути рукояти по методу главных компонент);
   * подъём стека: (расстояние рукоять — колесо − rest) × ratio. В растяжке (трос короче всего) плиты висят на 0,5–3 см
     над остальными: трос натянут, плиты не стучат; посреди повтора подъём не уходит в 0 (плиты не ложатся) и не
     упирается в maxLift;
   * передаточное отношение и проводка: при 2:1 (ratio 0,5) на верхней плите стека нарисован подвижный блок, при 1:1 —
     нет; трос от блока доходит до стека (цепочка тросов от колеса или оси поворота блока через колёса тренажёра
     к тросу верхней плиты).
   Эспандер (BIND.band, BIND.g3band), по кадрам и по каждой ветви: длина ветви, угол ленты к полу и к линии тяги,
   высота кисти над точкой, откуда лента идёт к кисти; длина в растяжке — наименьшая за повтор (лента не сжимается
   посреди повтора), растяжение max/min не больше 3 (паспортный предел латексных лент), путь кисти вдоль ленты —
   как у троса. */
const fs = require('node:fs');
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const { V, M3 } = M;
const fromCat = p => [p[0], M.FLOOR - p[1], p[2]], dirFromCat = d => [d[0], -d[1], d[2]];

/* ход рукояти по технике: line — вдоль троса (к блоку и от блока), arc — по дуге (трос в плоскости движения),
   hold — кисти неподвижны относительно головы (движется корпус) */
const KIND = {
  latpull: 'line', latpullv: 'line', latpulluh: 'line', cablerow: 'line', cablerowwide: 'line', facepull: 'line', pullthrough: 'line',
  pushdown: 'arc', ropepushdown: 'arc', straightpull: 'arc', cableohext: 'arc', cablecurl: 'arc', ropecurl: 'arc',
  cablefly: 'arc', cablelowfly: 'arc', cablelat: 'arc', cablewood: 'arc', cablecrunch: 'hold',
  glutekick: 'arc', cablekickback: 'arc', cableadduct: 'arc', cableextrot: 'arc',
  bandlatraise: 'arc', bandcurl: 'arc', bandpushdown: 'arc', bandfacepull: 'line', bandextrot: 'arc', bandrow: 'line'
};
/* пороги «подозрительно» (повод посмотреть глазами) */
const LIM = {
  hoverMin: .5, hoverMax: 3,  // см: подъём стека в растяжке
  lineDev: 3,                 // см: путь рукояти дальше от прямой «рукоять → блок»
  lineSwing: 15,              // °: трос поворачивается за повтор (рукоять идёт не вдоль троса). У прямого хода остаётся
                              //    поворот у самого блока: карабин в 11–13 см от кисти к центру колеса, трос сходит
                              //    по касательной — asin(r/d), до 12° в растяжке тяги сидя (cablerow, d = 22 см)
  lineMove: 15,               // °: трос под углом к ходу рукояти
  moving: .5,                 // доля наибольшей скорости: углы к ходу — в кадрах быстрее (у краёв повтора ход мал,
                              //    а между ключами позы кисть идёт по дуге интерполяции углов)
  arcPlane: 20,               // °: трос выходит из плоскости движения
  bandShrink: 1,              // см: ветвь ленты короче, чем в растяжке
  bandStretch: 3,             // раз: растяжение ленты max/min — TheraBand (Performance Health), инструкция к лентам: «не
                              //    растягивать больше чем в 3 раза от длины в покое»; в растяжке лента не короче длины покоя
  wristDev: 12,               // °: локтевое или лучевое отклонение запястья на рукояти (у тяги сидя после правки — 3–6°)
  join: 2                     // см: концы тросов в цепочке
};
const deg = r => r * 180 / Math.PI;
const angleLine = (a, b) => { const x = deg(Math.acos(Math.max(-1, Math.min(1, Math.abs(V.dot(V.unit(a), V.unit(b))))))); return x; };
const elev = d => deg(Math.asin(Math.max(-1, Math.min(1, V.unit(d)[1]))));
/* главные оси облака точек: [ось наибольшего разброса, …, нормаль плоскости] (степенной метод по ковариации) */
function pca(pts) {
  const c = pts.reduce((a, p) => V.add(a, p), [0, 0, 0]).map(v => v / pts.length), C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of pts) { const d = V.sub(p, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j]; }
  const mul = (A, v) => A.map(r => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]), axes = [];
  let A = C.map(r => [...r]);
  for (let k = 0; k < 2; k++) {
    let v = V.unit([1, .7 + k, .3 - k]);
    for (let i = 0; i < 80; i++) { const w = mul(A, v); if (V.len(w) < 1e-12) break; v = V.unit(w); }
    const l = V.dot(v, mul(A, v)); axes.push(v);
    A = A.map((r, i) => r.map((x, j) => x - l * v[i] * v[j]));
  }
  axes.push(V.unit(V.cross(axes[0], axes[1])));
  return { c, axes };
}
const lineDist = (p, a, u) => V.len(V.perp(V.sub(p, a), u));
/* цепочка тросов: от колеса блока (или оси поворота) через колёса тренажёра к тросу верхней плиты стека */
function routeOf(props, e, P, S) {
  const id = e.id, cables = props.filter(p => p.kind === 'cable' && p.role === 'cable' && p.id !== id + ':line' && !/:(L|R)$/.test(p.id))
    .map(p => ({ id: p.id, pts: p.pts.map(fromCat) }));
  const wheels = props.filter(p => p.kind === 'cyl' && /wheel/i.test(p.id)).map(p => ({ id: p.id, c: fromCat(p.c), r: p.r }));
  const ends = c => [c.pts[0], c.pts[c.pts.length - 1]];
  const onRim = (p, w) => Math.abs(V.dist(p, w.c) - w.r) < LIM.join + .5 && V.dist(p, w.c) < w.r + LIM.join + .5;
  const joined = (a, b) => ends(a).some(p => ends(b).some(q => V.dist(p, q) < LIM.join || wheels.some(w => onRim(p, w) && onRim(q, w))));
  const start = cables.filter(c => ends(c).some(p => V.dist(p, S) < LIM.join + .5 || Math.abs(V.dist(p, P) - (e.wheelR || 4.5)) < LIM.join));
  const seen = new Set(start.map(c => c.id)), queue = [...start];
  while (queue.length) { const a = queue.shift(); for (const b of cables) if (!seen.has(b.id) && joined(a, b)) { seen.add(b.id); queue.push(b); } }
  const stk = id + ':stkCable';
  return { ok: seen.has(stk), chain: [...seen], hasStack: cables.some(c => c.id === stk) };
}

/* ---------- одно упражнение ---------- */
function auditEntry(id, entry, { samples = 41 } = {}) {
  const ev = EQ.variantEntry(entry), rig = EQ.rig(ev), eqs = (ev.equipment || []);
  const cablesEq = eqs.filter(e => e.type === 'g3cable'), bandsEq = eqs.filter(e => e.type === 'g3band' || e.type === 'band');
  if (!cablesEq.length && !bandsEq.length) return [];
  const frames = [];
  for (let i = 0; i < samples; i++) { const t = i / (samples - 1), R = rig(t); frames.push({ t, R }); }
  const kind = KIND[id] || '—', rows = [];
  /* кисть на рукояти: отклонение и сгибание запястья по кадрам (Mannequin.jointAngles, как в валидаторе) — рукоять, не
     повёрнутая вслед за предплечьем, выворачивает запястье */
  const ja = frames.map(({ R }) => M.jointAngles(R));
  const wristOf = hs => {
    const dev = hs.flatMap(s => ja.map(a => a[s].wristDev)), flex = hs.flatMap(s => ja.map(a => a[s].wristFlex));
    return { dev: [Math.min(...dev), Math.max(...dev)], flex: [Math.min(...flex), Math.max(...flex)] };
  };
  for (const e of cablesEq) {
    const hands = e.hands || ['L', 'R'], P = fromCat(frames[0].R.props.find(p => p.id === e.id + ':wheel').c), S = e.swivel;
    const st = e.stack, ratio = e.ratio ?? 1, Y = st ? M3.col(st.R, 1) : [0, 1, 0];
    const fr = frames.map(({ t, R }) => {
      const line = R.props.find(p => p.id === e.id + ':line'), T = fromCat(line.pts[0]), K = fromCat(line.pts[1]);
      const end = fromCat(e.attach === 'ankle' ? R['an' + (e.foot || 'L')] : V.mix(R['grip' + hands[0]], R['grip' + (hands[1] || hands[0])], .5));
      const d = V.dist(end, P), raw = st ? (d - (e.rest || 0)) * ratio : null;
      const top = R.props.find(p => p.id === e.id + ':stkTop'), drawn = top ? V.dot(V.sub(fromCat(top.c), V.add(st.o, Y, st.sel * st.pitch + 2)), Y) : null;
      return { t, T, K, end, dir: V.sub(K, T), d, raw, drawn };
    });
    /* ход рукояти: центральная разность по кадрам */
    fr.forEach((f, i) => { const a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)]; f.v = V.sub(b.end, a.end); });
    const vmax = Math.max(...fr.map(f => V.len(f.v))), moving = fr.filter(f => V.len(f.v) > LIM.moving * vmax);
    const row = { id, kind, part: e.id, type: 'трос', attach: e.attach || 'D', ratio, rest: e.rest, frames: [] };
    if (e.attach !== 'ankle') row.wrist = wristOf(hands);
    row.floorAng = [Math.min(...fr.map(f => elev(f.dir))), Math.max(...fr.map(f => elev(f.dir)))];
    row.moveAng = Math.max(...moving.map(f => angleLine(f.dir, f.v)));
    row.moveAngMid = angleLine(fr[Math.floor(fr.length / 2)].dir, fr[Math.floor(fr.length / 2)].v);
    row.height = [Math.min(...fr.map(f => f.end[1] - P[1])), Math.max(...fr.map(f => f.end[1] - P[1]))];
    row.span = [Math.min(...fr.map(f => f.d)), Math.max(...fr.map(f => f.d))];
    /* растяжка — кадр, где рукоять ближе всего к блоку; конец тяги — дальше всего */
    const near = fr.reduce((a, f) => f.d < a.d ? f : a), far = fr.reduce((a, f) => f.d > a.d ? f : a);
    row.stretchT = near.t; row.farT = far.t;
    const u = V.unit(V.sub(far.end, far.T));
    row.lineDev = Math.max(...fr.map(f => lineDist(f.end, far.T, u)));
    row.swing = Math.max(...fr.map(f => angleLine(f.dir, far.dir)));
    const pl = pca(fr.map(f => f.end)), n = pl.axes[2];
    row.pathSpread = Math.max(...fr.map(f => Math.abs(V.dot(V.sub(f.end, pl.c), n))));
    row.planeAng = Math.max(...moving.map(f => deg(Math.asin(Math.min(1, Math.abs(V.dot(V.unit(f.dir), n)))))));
    if (st) {
      const raws = fr.map(f => f.raw);
      row.liftMin = Math.min(...raws); row.liftMinT = fr[raws.indexOf(row.liftMin)].t; row.liftMax = Math.max(...raws); row.maxLift = st.maxLift;
      row.liftAtStretch = near.raw;
      row.lying = fr.filter(f => f.raw <= 0).map(f => f.t);
      row.drawnMax = Math.max(...fr.map(f => f.drawn ?? 0));
      const R0 = frames[0].R, props = R0.props;
      row.floating = props.some(p => p.id === e.id + ':stkFloat');
      row.route = routeOf(props, e, P, S);
    }
    row.frames = fr.map(f => ({ t: +f.t.toFixed(3), floor: +elev(f.dir).toFixed(1), move: V.len(f.v) > LIM.moving * vmax ? +angleLine(f.dir, f.v).toFixed(1) : null, h: +(f.end[1] - P[1]).toFixed(1), lift: f.raw != null ? +f.raw.toFixed(2) : null }));
    row.flags = flagsOf(row);
    rows.push(row);
  }
  for (const e of bandsEq) {
    /* две ветви от одной точки крепления (дверь): ход — по середине кистей, как у каната (концы ленты расходятся, и каждая
       кисть идёт к своей ветви под углом); у ветвей — длина и растяжение */
    const hands = e.hands || ['L', 'R'], shared = e.type === 'g3band' && hands.length > 1;
    const branch = (R, s) => {
      const b = R.props.find(p => p.id === (e.id || 'band') + ':' + s), pts = b.pts.map(fromCat);
      let L = 0; for (let i = 1; i < pts.length; i++) L += V.dist(pts[i - 1], pts[i]);
      return { A: pts[pts.length - 2], K: pts[pts.length - 1], L, end: fromCat(R['grip' + s]) };
    };
    for (const s of shared ? [...hands, 'mid'] : hands) {
      const fr = frames.map(({ t, R }) => {
        if (s !== 'mid') { const b = branch(R, s); return { t, ...b, dir: V.sub(b.K, b.A) }; }
        const a = branch(R, hands[0]), b = branch(R, hands[1]), K = V.mix(a.K, b.K, .5);
        return { t, A: a.A, K, L: (a.L + b.L) / 2, end: V.mix(a.end, b.end, .5), dir: V.sub(K, a.A) };
      });
      fr.forEach((f, i) => { const a = fr[Math.max(0, i - 1)], b = fr[Math.min(fr.length - 1, i + 1)]; f.v = V.sub(b.end, a.end); });
      const vmax = Math.max(...fr.map(f => V.len(f.v))), moving = fr.filter(f => V.len(f.v) > LIM.moving * vmax);
      const row = { id, kind: shared && s !== 'mid' ? 'ветвь' : kind, part: (e.id || 'band') + ':' + s, type: 'лента', side: s };
      row.wrist = wristOf(s === 'mid' ? hands : [s]);
      row.floorAng = [Math.min(...fr.map(f => elev(f.dir))), Math.max(...fr.map(f => elev(f.dir)))];
      row.moveAng = Math.max(...moving.map(f => angleLine(f.dir, f.v)));
      row.moveAngMid = angleLine(fr[Math.floor(fr.length / 2)].dir, fr[Math.floor(fr.length / 2)].v);
      row.height = [Math.min(...fr.map(f => f.end[1] - f.A[1])), Math.max(...fr.map(f => f.end[1] - f.A[1]))];
      const Ls = fr.map(f => f.L), near = fr.reduce((a, f) => f.L < a.L ? f : a), far = fr.reduce((a, f) => f.L > a.L ? f : a);
      row.len = [Math.min(...Ls), Math.max(...Ls)]; row.stretchT = near.t; row.farT = far.t;
      /* растяжка — исходное положение (t=0 или t=1, где лента короче); сжатие — ветвь короче, чем в растяжке */
      const start = fr[0].L <= fr[fr.length - 1].L ? fr[0] : fr[fr.length - 1];
      row.startT = start.t; row.shrink = start.L - near.L;
      row.ratioLen = row.len[1] / row.len[0];
      const u = V.unit(V.sub(far.end, far.A));
      row.lineDev = Math.max(...fr.map(f => lineDist(f.end, far.A, u)));
      row.swing = Math.max(...fr.map(f => angleLine(f.dir, far.dir)));
      const pl = pca(fr.map(f => f.end)), n = pl.axes[2];
      row.planeAng = Math.max(...moving.map(f => deg(Math.asin(Math.min(1, Math.abs(V.dot(V.unit(f.dir), n)))))));
      row.frames = fr.map(f => ({ t: +f.t.toFixed(3), floor: +elev(f.dir).toFixed(1), move: V.len(f.v) > LIM.moving * vmax ? +angleLine(f.dir, f.v).toFixed(1) : null, h: +(f.end[1] - f.A[1]).toFixed(1), len: +f.L.toFixed(1) }));
      row.flags = flagsOf(row);
      rows.push(row);
    }
  }
  return rows;
}
function flagsOf(r) {
  const f = [];
  if (r.kind === 'line') {
    if (r.lineDev > LIM.lineDev) f.push(`путь рукояти в ${r.lineDev.toFixed(1)} см от прямой «рукоять → ${r.type === 'трос' ? 'блок' : 'крепление'}»`);
    if (r.swing > LIM.lineSwing) f.push(`${r.type} поворачивается за повтор на ${r.swing.toFixed(0)}°`);
    if (r.moveAng > LIM.lineMove) f.push(`${r.type} под ${r.moveAng.toFixed(0)}° к ходу рукояти`);
  }
  if (r.kind === 'arc' && r.planeAng > LIM.arcPlane) f.push(`${r.type} выходит из плоскости движения на ${r.planeAng.toFixed(0)}°`);
  if (r.wrist && Math.max(-r.wrist.dev[0], r.wrist.dev[1]) > LIM.wristDev) f.push(`запястье отклонено до ${Math.max(-r.wrist.dev[0], r.wrist.dev[1]).toFixed(0)}° (рукоять не по предплечью?)`);
  if (r.type === 'трос' && r.liftMin != null) {
    if (r.liftAtStretch < LIM.hoverMin || r.liftAtStretch > LIM.hoverMax) f.push(`стек в растяжке (t=${r.stretchT.toFixed(3)}) на ${r.liftAtStretch.toFixed(1)} см над плитами (норма ${LIM.hoverMin}–${LIM.hoverMax})`);
    if (r.lying.length) f.push(`стек лежит на плитах в ${r.lying.length} кадр. (t=${r.lying[0].toFixed(3)}…${r.lying[r.lying.length - 1].toFixed(3)})`);
    if (r.liftMax > r.maxLift) f.push(`стек упирается в maxLift ${r.maxLift} (нужно ${r.liftMax.toFixed(0)})`);
    if (r.ratio < 1 && !r.floating) f.push(`ratio ${r.ratio} (2:1), а подвижного блока на стеке нет`);
    if (r.ratio === 1 && r.floating) f.push('ratio 1 (1:1), а на стеке подвижный блок');
    if (!r.route.ok) f.push('трос от блока не доходит до стека');
  }
  if (r.type === 'лента') {
    if (r.shrink > LIM.bandShrink) f.push(`лента короче, чем в растяжке, на ${r.shrink.toFixed(1)} см (сжимается или провисает)`);
    if (r.ratioLen > LIM.bandStretch) f.push(`растяжение ленты ×${r.ratioLen.toFixed(1)}`);
  }
  return f;
}
function run({ only, samples = 41, baked = false } = {}) {
  const entries = baked ? require('../../src/js/09bp-poses.js') : require('./author.js').bakeAll({ only });
  const rows = [];
  for (const [id, e] of Object.entries(entries)) { if ((only && !only.includes(id)) || id.startsWith('_')) continue; rows.push(...auditEntry(id, e, { samples })); }
  return rows;
}
const f1 = v => v == null ? '—' : (+v).toFixed(1), f0 = v => v == null ? '—' : (+v).toFixed(0), rng = (a, k = f0) => `${k(a[0])}…${k(a[1])}`;
function describe(r) {
  const out = [`${r.type} ${r.part} [${r.kind}]`, `к полу ${rng(r.floorAng)}°`, `к ходу ≤${f0(r.moveAng)}° (середина ${f0(r.moveAngMid)}°)`,
    `${r.type === 'трос' ? (r.attach === 'ankle' ? 'голеностоп' : 'кисть') + ' над осью блока' : 'кисть над креплением'} ${rng(r.height)} см`,
    r.kind === 'line' ? `от прямой ${f1(r.lineDev)} см, поворот ${f0(r.swing)}°` : `из плоскости ${f0(r.planeAng)}°`,
    r.wrist ? `запястье: отклонение ${rng(r.wrist.dev)}°, сгибание ${rng(r.wrist.flex)}°` : ''].filter(Boolean);
  if (r.type === 'трос') {
    out.push(`рукоять—колесо ${rng(r.span)} см`);
    if (r.liftMin != null) out.push(`ratio ${r.ratio}${r.floating ? ' (подвижный блок)' : ''}, rest ${r.rest}, стек: в растяжке ${f1(r.liftAtStretch)} см @${r.stretchT.toFixed(3)}, min ${f1(r.liftMin)} @${r.liftMinT.toFixed(3)}, max ${f1(r.liftMax)} из ${r.maxLift}`, `проводка ${r.route.ok ? 'до стека' : 'обрыв'} (${r.route.chain.join(', ') || '—'})`);
  } else out.push(`длина ${rng(r.len, f1)} см (×${r.ratioLen.toFixed(2)}), растяжка @${r.startT}`);
  return out.join(' | ');
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), all = process.argv.includes('--all'), frames = process.argv.includes('--frames');
  const rows = run({ only, samples, baked: process.argv.includes('--baked') });
  const bad = rows.filter(r => r.flags.length);
  for (const r of all ? rows : bad) {
    console.log(`${r.id.padEnd(14)} ${describe(r)}${r.flags.length ? '\n    ⚠ ' + r.flags.join('; ') : ''}`);
    if (frames) for (const f of r.frames.filter((_, i) => i % 5 === 0)) console.log(`      t=${f.t.toFixed(3).padEnd(6)} к полу ${f1(f.floor).padStart(6)}°  к ходу ${f.move == null ? '   —' : f1(f.move).padStart(5)}°  высота ${f1(f.h).padStart(6)} см${f.lift != null ? `  стек ${f1(f.lift).padStart(6)} см` : ''}${f.len != null ? `  длина ${f1(f.len).padStart(6)} см` : ''}`);
  }
  console.log(`\nУпражнений ${new Set(rows.map(r => r.id)).size}; тросов ${rows.filter(r => r.type === 'трос').length}, ветвей ленты ${rows.filter(r => r.type === 'лента').length}; с замечаниями ${new Set(bad.map(r => r.id)).size} упражнений (${bad.length} строк)`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows, null, 1));
}
module.exports = { run, auditEntry, KIND, LIM };
