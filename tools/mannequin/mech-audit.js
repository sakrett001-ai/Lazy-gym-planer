'use strict';
/* Аудит механики подвижного инвентаря: кардиотренажёры (шатуны, эллипс, степпер, гребной, дорожка), каретки на направляющих,
   рычаги, «бабочка», машина Смита, Т-гриф на «мине», ролик для пресса. Тросы, блоки, эспандеры и рычажные стеки —
   tools/mannequin/cable-audit.js. Печатает подозрительное, ничего не исправляет.
   node tools/mannequin/mech-audit.js [--only id,id] [--samples 41] [--json file] [--all] [--baked] [--frames]
   --all — все строки (по умолчанию — только с замечаниями), --baked — ключи из src/js/09bp-poses.js, а не из спецификаций,
   --frames — покадровая таблица главной величины узла.

   Всё меряется по нарисованным деталям кадра (props), как их видит зритель, по 41 кадру повторения:
   * жёсткие детали (балки шатунов, рычагов, тяг, рукоятей, осей) не меняют длину за повтор;
   * шатун и кривошип: плечо постоянно, левый и правый в противофазе, педаль поворачивается только вокруг своей оси;
   * эллипс: ролик тяги педали катится по направляющей (высота и сторона), тяга педали и тяга рукояти постоянной длины,
     рычаг рукояти проходит через ось качания, педаль жёстко на тяге; длина шага — ход педали по горизонтали;
   * степпер: рычаг педали и параллельная тяга одной длины, неподвижный конец тяги — на оси тяги рамы, площадка
     горизонтальна, демпфер: корпус и шток постоянной длины (шток уходит в корпус);
   * гребной тренажёр: цепь выходит из направляющей корпуса, путь рукояти — прямая, рукоять поперёк цепи, сиденье на
     монорельсе в пределах его длины, порядок фаз «ноги → корпус → руки»;
   * беговая дорожка: опорная стопа едет назад равномерно — со скоростью ленты, одинаковой для обеих стоп, и не уходит
     с ленты по высоте;
   * каретка на направляющей: точка тела, которая её ведёт, остаётся на линии хода (ход — по оси направляющих), каретка
     не упирается в концы направляющих;
   * рычаг (ось неподвижна): точка тела, которая задаёт угол, идёт по окружности вокруг оси (иначе упор скользит по телу);
   * «бабочка»: плечо рычага и опуск рукояти постоянной длины, хват на окружности вокруг оси; плечевой сустав от оси;
   * машина Смита: хваты на оси грифа, гриф горизонтален и ходит по оси направляющих; крюки грифа;
   * «мина»: крюк V-рукояти на постоянном расстоянии от шарнира, гриф в плоскости оси шарнира;
   * ролик: колесо на опоре, ось горизонтальна, поворот × радиус = путь (по меткам колеса);
   * контакты тела с деталями (стопа на педали, кисть на рукояти, таз на сиденье): точка тела неподвижна в рамке детали;
   * циклические упражнения: кадр 1 совпадает с кадром 0. */
const fs = require('node:fs');
const M = require('../../src/js/09bm-mannequin.js');
const EQ = require('../../src/js/09bn-equipment.js');
const { V } = M;
const I = p => [p[0], M.FLOOR - p[1], p[2]], Id = d => [d[0], -d[1], d[2]];
const DEG = 180 / Math.PI;

/* пороги «подозрительно» */
const LIM = {
  rigid: .1,       // см: жёсткая деталь меняет длину за повтор
  radius: .1,      // см: плечо шатуна или кривошипа
  phase: 1,        // °: шатуны (кривошипы) не в противофазе
  pedalAxis: 1,    // °: педаль поворачивается не вокруг своей оси (ось педали против оси пальца шатуна)
  track: .2,       // см: ролик над направляющей или в ней, сбоку от неё
  join: .2,        // см: конец тяги не на оси, к которой он крепится
  level: 1,        // °: площадка степпера наклоняется (параллельная тяга держит её горизонтально)
  slip: .5,        // см: стопа или кисть сдвигается относительно детали, на которой стоит или которую держит
  slipTrunk: 1,    // см: таз или спина сдвигаются относительно подвижного сиденья или каретки
  belt: .5,        // см: опорная стопа отходит от равномерного хода ленты
  beltSpeed: 2,    // %: скорость ленты под левой и правой стопой
  beltY: .5,       // см: опорная стопа по высоте ленты
  line: .5,        // см: точка тела, которая ведёт каретку, уходит с линии хода
  lever: .5,       // см: точка тела, которая задаёт угол рычага, уходит с окружности вокруг оси
  path: 3,         // см: путь рукояти гребного тренажёра от прямой
  square: 3,       // °: рукоять гребного тренажёра не поперёк цепи
  barAxis: 1,      // см: хват дальше от оси грифа Смита
  floor: .5,       // см: колесо над опорой или в ней
  roll: .5,        // см: поворот колеса × радиус против пути
  close: .05       // см: циклическое упражнение — кадр 1 против кадра 0
};
/* ---------- кадры и детали ---------- */
function sample(entry, n) {
  const ev = EQ.variantEntry(entry), rig = EQ.rig(ev), fr = [];
  for (let i = 0; i < n; i++) { const t = i / (n - 1), R = rig(t), by = new Map(R.props.map(p => [p.id, p])); fr.push({ t, R, get: id => by.get(id) }); }
  return { ev, fr };
}
const range = a => [Math.min(...a), Math.max(...a)], spread = a => Math.max(...a) - Math.min(...a);
const len = p => p.kind === 'beam' ? V.dist(p.a, p.b) : p.kind === 'cable' ? p.pts.slice(1).reduce((s, q, i) => s + V.dist(q, p.pts[i]), 0) : 0;
/* рамка детали во внутренних координатах: у коробки и балки сечением w×h — полная (x, y, z), у трубы и цилиндра — ось */
function frameOf(p) {
  if (p.kind === 'obox') return { o: I(p.c), x: Id(p.x), y: Id(p.y), z: Id(p.z), full: true };
  if (p.kind === 'beam') {
    const a = I(p.a), z = V.unit(V.sub(I(p.b), a));
    if (p.up) { const y = V.unit(V.perp(Id(p.up), z)); return { o: a, x: V.cross(y, z), y, z, full: true }; }
    return { o: a, z, full: false };
  }
  if (p.kind === 'cyl') return { o: I(p.c), z: V.unit(Id(p.axis)), full: false };
  if (p.kind === 'cable') { const a = I(p.pts[0]); return { o: a, z: V.unit(V.sub(I(p.pts[p.pts.length - 1]), a)), full: false }; }
  return null;
}
const local = (F, p) => { const d = V.sub(p, F.o); return F.full ? [V.dot(d, F.x), V.dot(d, F.y), V.dot(d, F.z)] : [V.dot(d, F.z), V.len(V.perp(d, F.z))]; };
/* точка тела контакта: стопа — опора под подушечкой (подошва, M.footFrame), кисть — центр хвата, таз и спина — начало
   рамки таза (седалищные бугры перекатываются по сиденью, когда таз наклоняется, — это не скольжение), верх спины и грудь —
   середина плечевых суставов */
const SOLE = M.B.toeSole;
function bodyPoint(R, body) {
  const m = /^(sole|grip)(L|R)$/.exec(body);
  if (m && m[1] === 'sole') return V.add(I(R['ball' + m[2]]), Id(R.frames['toes' + m[2]].y), SOLE);
  if (m) return I(R['grip' + m[2]]);
  if (body === 'buttocks' || body === 'back') return I(R.hip);
  if (body === 'upperBack' || body === 'chest') return V.mix(I(R.shL), I(R.shR), .5);
  return null;
}
const inWin = (c, t) => !c.when || (t >= c.when[0] - 1e-9 && t <= c.when[1] + 1e-9);
/* деталь контакта: точный id или деталь снаряда (id:…) с опорной ролью, ближайшая к точке тела */
function partOf(f, prop, P) {
  const exact = f.get(prop); if (exact) return exact;
  const cand = f.R.props.filter(p => p.id && p.id.startsWith(prop + ':') && ['grip', 'support', 'pedal', 'pad'].includes(p.role));
  let best = null, bd = Infinity;
  for (const p of cand) { const F = frameOf(p); if (!F) continue; const d = V.dist(F.o, P); if (d < bd) { bd = d; best = p; } }
  return best;
}
/* проскальзывание: точка тела в рамке детали за окно контакта. На коробке (педаль, сиденье, площадка, упор) — в плоскости
   опоры (x, z): по нормали — зазор, его проверяет валидатор (контакты), а таз, наклоняясь, перекатывается по сиденью */
function slipOf(fr, c) {
  const win = fr.filter(f => inWin(c, f.t)); if (win.length < 2) return null;
  const P0 = bodyPoint(win[0].R, c.body); if (!P0) return null;
  const part = partOf(win[0], c.prop, P0); if (!part) return null;
  const pts = win.map(f => { const p = f.get(part.id), F = p && frameOf(p); if (!F) return null; const q = local(F, bodyPoint(f.R, c.body)); return F.full && p.kind === 'obox' ? [q[0], q[2]] : q; }).filter(Boolean);
  let d = 0, at = win[0].t;
  pts.forEach((q, i) => { const x = Math.hypot(...q.map((v, k) => v - pts[0][k])); if (x > d) { d = x; at = win[i].t; } });
  return { body: c.body, part: part.id, dyn: !!part.dyn, d, at };
}
/* жёсткие детали: балки подвижных узлов одной длины во всех кадрах */
function rigidOf(fr, prefixes, skip = () => false) {
  const out = [];
  for (const p of fr[0].R.props.filter(p => p.dyn && p.kind === 'beam' && prefixes.some(s => p.id.startsWith(s)) && !skip(p.id))) {
    const L = fr.map(f => { const q = f.get(p.id); return q ? len(q) : NaN; }).filter(Number.isFinite);
    if (L.length) out.push({ id: p.id, L: range(L), d: spread(L) });
  }
  return out;
}
/* замкнутость цикла: подвижные детали в кадре 1 против кадра 0 */
function closeOf(fr, prefixes) {
  const a = fr[0], b = fr[fr.length - 1]; let d = 0, id = null;
  for (const p of a.R.props.filter(p => p.dyn && prefixes.some(s => p.id.startsWith(s)))) {
    const q = b.get(p.id); if (!q) { d = Infinity; id = p.id; continue; }
    for (const k of ['a', 'b', 'c']) if (p[k]) { const x = V.dist(p[k], q[k]); if (x > d) { d = x; id = p.id; } }
    if (p.pts) p.pts.forEach((v, i) => { const x = V.dist(v, q.pts[i] || v); if (x > d) { d = x; id = p.id; } });
  }
  return { d, id };
}
const ang = (u, v) => Math.acos(Math.max(-1, Math.min(1, V.dot(V.unit(u), V.unit(v))))) * DEG;
const wrap = a => ((a % 360) + 540) % 360 - 180;
const eqOf = (ev, type) => (ev.equipment || []).filter(e => e.type === type);
const flagSlip = (row, slips) => {
  for (const s of slips.filter(Boolean)) {
    const trunk = !/^(sole|grip)/.test(s.body);
    if (trunk && !s.dyn) continue;
    if (s.d > (trunk ? LIM.slipTrunk : LIM.slip)) row.flags.push(`${s.body} сдвигается по ${s.part} на ${s.d.toFixed(2)} см (t=${s.at.toFixed(3)})`);
  }
};
const flagRigid = (row, rig) => { for (const r of rig) if (r.d > LIM.rigid) row.flags.push(`${r.id} меняет длину: ${r.L[0].toFixed(2)}…${r.L[1].toFixed(2)} см`); };

/* ---------- шатуны велотренажёра (BIND.bikeCrank) ---------- */
function auditCrank(id, ev, fr, e) {
  const A = [0, e.axle[1], e.axle[2]], pre = (e.id || 'crank') + ':', row = { id, part: e.id, type: 'шатуны', flags: [] };
  const arm = (f, s) => { const p = f.get(pre + 'arm' + s), b = I(p.b); return { r: Math.hypot(b[1] - A[1], b[2] - A[2]), a: Math.atan2(b[2] - A[2], b[1] - A[1]) * DEG, b }; };
  const L = fr.map(f => arm(f, 'L')), R = fr.map(f => arm(f, 'R'));
  const rs = [...L, ...R].map(q => q.r), rc = e.rc ?? (rs.slice().sort((a, b) => a - b)[rs.length >> 1]);
  row.rc = rc; row.radius = range(rs); row.radiusErr = Math.max(...rs.map(r => Math.abs(r - rc)));
  row.phase = Math.max(...L.map((q, i) => Math.abs(Math.abs(wrap(R[i].a - q.a)) - 180)));
  /* ось педали — ось пальца шатуна (X): педаль вращается только вокруг неё */
  row.pedalAxis = Math.max(...fr.flatMap(f => ['L', 'R'].map(s => ang(Id(f.get(pre + 'pedal' + s).x), [1, 0, 0])).map(a => Math.min(a, 180 - a))));
  /* равномерность вращения: приращение угла за кадр против среднего */
  const da = L.slice(1).map((q, i) => wrap(q.a - L[i].a)), mean = da.reduce((s, x) => s + x, 0) / da.length;
  row.turn = da.reduce((s, x) => s + x, 0); row.uneven = Math.max(...da.map(x => Math.abs(x - mean))) / Math.abs(mean || 1);
  row.slips = (ev.contacts || []).filter(c => /^sole/.test(c.body) && c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre], k => /:arm[LR]$/.test(k));
  row.close = closeOf(fr, [pre]);
  if (row.radiusErr > LIM.radius) row.flags.push(`плечо шатуна ${row.radius[0].toFixed(2)}…${row.radius[1].toFixed(2)} см (номинал ${rc.toFixed(1)})`);
  if (row.phase > LIM.phase) row.flags.push(`шатуны не в противофазе: до ${row.phase.toFixed(1)}°`);
  if (row.pedalAxis > LIM.pedalAxis) row.flags.push(`педаль поворачивается не вокруг оси: до ${row.pedalAxis.toFixed(1)}° от оси пальца`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  if (ev.loop && row.close.d > LIM.close) row.flags.push(`цикл не замкнут: ${row.close.id} ${row.close.d.toFixed(2)} см`);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `шатун L ${L[i].r.toFixed(2)} см ${L[i].a.toFixed(1)}°, R ${R[i].r.toFixed(2)} см ${R[i].a.toFixed(1)}°` }));
  return row;
}

/* ---------- эллипс (BIND.ellipticalLinks) ---------- */
function auditElliptical(id, ev, fr, e) {
  const pre = (e.id || 'ell') + ':', base = eqOf(ev, 'elliptical')[0] || {}, A = [0, e.axle[0], e.axle[1]], row = { id, part: e.id, type: 'эллипс', flags: [] };
  const trackY = (base.trackY ?? 8), rollR = 4;
  const pin = (f, s) => { const b = I(f.get(pre + 'crank' + s).b); return { r: Math.hypot(b[1] - A[1], b[2] - A[2]), a: Math.atan2(b[2] - A[2], b[1] - A[1]) * DEG }; };
  const L = fr.map(f => pin(f, 'L')), R = fr.map(f => pin(f, 'R')), rs = [...L, ...R].map(q => q.r), rc = e.rc ?? rs.slice().sort((a, b) => a - b)[rs.length >> 1];
  row.rc = rc; row.radius = range(rs); row.radiusErr = Math.max(...rs.map(r => Math.abs(r - rc)));
  row.phase = Math.max(...L.map((q, i) => Math.abs(Math.abs(wrap(R[i].a - q.a)) - 180)));
  /* ролик на направляющей: центр на trackY + r, по оси направляющей (x = ±barX) */
  const rol = fr.flatMap(f => ['L', 'R'].map(s => { const c = I(f.get(pre + 'roller' + s).c); return { dy: c[1] - (trackY + rollR), dx: Math.abs(c[0]) - (base.barX ?? Math.abs(c[0])) }; }));
  row.rollerY = range(rol.map(q => q.dy)); row.rollerX = range(rol.map(q => q.dx));
  /* тяга рукояти от нижнего конца рычага к тяге педали; рычаг рукояти — через ось качания */
  const H = s => [(s === 'L' ? 1 : -1) * e.pivot[0], e.pivot[1], e.pivot[2]];
  row.pivotOff = Math.max(...fr.flatMap(f => ['L', 'R'].map(s => { const p = f.get(pre + 'arm' + s), a = I(p.a), b = I(p.b); const h = H(s); return V.len(V.perp(V.sub(h, a), V.unit(V.sub(b, a)))); })));
  /* педаль жёстко на тяге: угол педали к тяге постоянен */
  const pa = fr.flatMap(f => ['L', 'R'].map(s => ang(Id(f.get(pre + 'pedal' + s).z), V.sub(I(f.get(pre + 'bar' + s).b), I(f.get(pre + 'bar' + s).a)))));
  row.pedalBar = spread(pa);
  row.pedalAxis = Math.max(...fr.flatMap(f => ['L', 'R'].map(s => { const a = ang(Id(f.get(pre + 'pedal' + s).x), [1, 0, 0]); return Math.min(a, 180 - a); })));
  /* длина шага: ход центра педали по горизонтали; подъём педали */
  const pz = fr.map(f => I(f.get(pre + 'pedalL').c)[2]), py = fr.map(f => I(f.get(pre + 'pedalL').c)[1]);
  row.stride = spread(pz); row.rise = spread(py);
  row.slips = (ev.contacts || []).filter(c => c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre], k => /:crank[LR]$/.test(k));
  row.close = closeOf(fr, [pre]);
  if (row.radiusErr > LIM.radius) row.flags.push(`плечо кривошипа ${row.radius[0].toFixed(2)}…${row.radius[1].toFixed(2)} см (номинал ${rc.toFixed(1)})`);
  if (row.phase > LIM.phase) row.flags.push(`кривошипы не в противофазе: до ${row.phase.toFixed(1)}°`);
  if (Math.max(-row.rollerY[0], row.rollerY[1]) > LIM.track) row.flags.push(`ролик тяги ${row.rollerY[0] < -LIM.track ? 'в направляющей' : 'над направляющей'}: ${row.rollerY[0].toFixed(2)}…${row.rollerY[1].toFixed(2)} см`);
  if (Math.max(-row.rollerX[0], row.rollerX[1]) > LIM.track) row.flags.push(`ролик сбоку от направляющей: ${row.rollerX[0].toFixed(2)}…${row.rollerX[1].toFixed(2)} см`);
  if (row.pivotOff > LIM.join) row.flags.push(`рычаг рукояти мимо оси качания на ${row.pivotOff.toFixed(2)} см`);
  if (row.pedalBar > LIM.pedalAxis) row.flags.push(`педаль поворачивается относительно тяги на ${row.pedalBar.toFixed(1)}°`);
  if (row.pedalAxis > LIM.pedalAxis) row.flags.push(`педаль наклонена вбок до ${row.pedalAxis.toFixed(1)}° (поворот не вокруг оси шарниров)`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  if (ev.loop && row.close.d > LIM.close) row.flags.push(`цикл не замкнут: ${row.close.id} ${row.close.d.toFixed(2)} см`);
  row.frames = fr.map((f, i) => { const lk = f.get(pre + 'linkL'), ro = I(f.get(pre + 'rollerL').c); return { t: f.t, main: `кривошип L ${L[i].r.toFixed(2)} см ${L[i].a.toFixed(1)}°, R ${R[i].r.toFixed(2)} см; ролик L y ${ro[1].toFixed(2)} z ${ro[2].toFixed(1)}; тяга рукояти L ${len(lk).toFixed(2)} см` }; });
  return row;
}

/* ---------- степпер (BIND.stepPedals) ---------- */
function auditStepper(id, ev, fr, e) {
  const pre = (e.id || 'step') + ':', base = eqOf(ev, 'stepper')[0], row = { id, part: e.id, type: 'степпер', flags: [] };
  const axle = fr[0].get((base.id || 'stepper') + ':linkAxle'), ac = axle ? I(axle.c) : null, az = axle ? V.unit(Id(axle.axis)) : null;
  const S = ['L', 'R'], lv = (f, s) => f.get(pre + 'lever' + s), lk = (f, s) => f.get(pre + 'link' + s);
  row.lever = range(fr.flatMap(f => S.map(s => len(lv(f, s))))); row.link = range(fr.flatMap(f => S.map(s => len(lk(f, s)))));
  /* неподвижный конец тяги — на оси тяги рамы */
  row.linkJoin = ac ? Math.max(...fr.flatMap(f => S.map(s => V.len(V.perp(V.sub(I(lk(f, s).a), ac), az))))) : Infinity;
  /* параллелограмм: тяга параллельна рычагу */
  row.parallel = Math.max(...fr.flatMap(f => S.map(s => { const a = V.sub(I(lv(f, s).b), I(lv(f, s).a)), b = V.sub(I(lk(f, s).b), I(lk(f, s).a)); return ang(a, b); })));
  row.level = Math.max(...fr.flatMap(f => S.map(s => ang(Id(f.get(pre + 'pedal' + s).y), [0, 1, 0])).map(a => Math.min(a, 180 - a))));
  row.stroke = spread(fr.map(f => I(f.get(pre + 'pedalL').c)[1]));
  row.slips = (ev.contacts || []).filter(c => c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre]);
  row.close = closeOf(fr, [pre]);
  if (row.linkJoin > LIM.join) row.flags.push(`неподвижный конец параллельной тяги в ${row.linkJoin.toFixed(1)} см от оси тяги на раме (висит)`);
  if (Math.abs(row.link[0] - row.lever[0]) > LIM.rigid || row.parallel > LIM.level) row.flags.push(`тяга не параллельна рычагу: длина ${row.link.map(v => v.toFixed(2)).join('…')} против ${row.lever.map(v => v.toFixed(2)).join('…')} см, угол до ${row.parallel.toFixed(1)}°`);
  if (row.level > LIM.level) row.flags.push(`площадка наклоняется до ${row.level.toFixed(1)}°`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  if (ev.loop && row.close.d > LIM.close) row.flags.push(`цикл не замкнут: ${row.close.id} ${row.close.d.toFixed(2)} см`);
  row.frames = fr.map(f => ({ t: f.t, main: `рычаг L ${len(lv(f, 'L')).toFixed(2)} см, тяга ${len(lk(f, 'L')).toFixed(2)} см, демпфер ${len(f.get(pre + 'damperL')).toFixed(2)} + шток ${len(f.get(pre + 'rodL')).toFixed(2)} см, педаль y ${I(f.get(pre + 'pedalL').c)[1].toFixed(1)}` }));
  return row;
}

/* ---------- гребной тренажёр (BIND.rowerChain, BIND.rowerSeat) ---------- */
function auditRower(id, ev, fr) {
  const ch = eqOf(ev, 'rowerChain')[0], st = eqOf(ev, 'rowerSeat')[0], erg = eqOf(ev, 'rowerErg')[0], row = { id, part: ch.id, type: 'гребной', flags: [] };
  const cp = (ch.id || 'chain') + ':', sp = (st.id || 'seat') + ':', ex = ch.exit;
  const hook = fr.map(f => I(f.get(cp + 'line').pts[1])), start = fr.map(f => I(f.get(cp + 'line').pts[0]));
  row.exitOff = Math.max(...start.map(p => V.dist(p, ex)));
  /* путь рукояти: от прямой через крайние положения */
  const far = hook.reduce((a, p) => V.dist(p, ex) > V.dist(a, ex) ? p : a), near = hook.reduce((a, p) => V.dist(p, ex) < V.dist(a, ex) ? p : a), u = V.unit(V.sub(far, near));
  row.pathDev = Math.max(...hook.map(p => V.len(V.perp(V.sub(p, near), u))));
  row.chainAng = range(hook.map((p, i) => Math.atan2(p[1] - start[i][1], start[i][2] - p[2]) * DEG));
  row.stroke = V.dist(far, near);
  row.square = Math.max(...fr.map((f, i) => { const b = f.get(cp + 'bar'), ax = V.sub(I(b.b), I(b.a)); return Math.abs(90 - ang(ax, V.sub(hook[i], start[i]))); }));
  row.barTilt = Math.max(...fr.map(f => { const b = f.get(cp + 'bar'), ax = V.unit(V.sub(I(b.b), I(b.a))); return Math.asin(Math.min(1, Math.abs(ax[1]))) * DEG; }));
  /* сиденье на монорельсе: ролики каретки на верхе рельса, сиденье в пределах рельса */
  const rt = st.railTop || erg.railTop || 27, z0 = erg.railRear ?? -110;
  row.seatWheel = range(fr.map(f => { const w = f.get(sp + 'wheelF'); return I(w.c)[1] - w.r - rt; }));
  const sz = fr.map(f => I(f.get(sp + 'pad').c)[2]); row.seatZ = range(sz); row.seatTravel = spread(sz);
  row.seatOut = Math.min(...sz) - (st.l || 30) / 2 - (z0 + 4);
  /* порядок фаз: момент, когда колено, наклон корпуса и локоть прошли половину своего хода */
  const ja = fr.map(f => M.jointAngles(f.R)), knee = ja.map(a => (a.L.knee + a.R.knee) / 2), elbow = ja.map(a => (a.L.elbow + a.R.elbow) / 2);
  const lean = fr.map(f => { const u2 = Id(f.R.chestU); return Math.atan2(u2[2], u2[1]) * DEG; });
  const half = a => { const a0 = a[0], a1 = a[a.length - 1]; for (let i = 0; i < a.length; i++) if (Math.abs(a[i] - a0) >= Math.abs(a1 - a0) / 2) return fr[i].t; return 1; };
  row.order = { legs: half(knee), body: half(lean), arms: half(elbow) };
  row.slips = (ev.contacts || []).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [cp, sp]);
  if (row.exitOff > LIM.join) row.flags.push(`цепь выходит не из направляющей корпуса (${row.exitOff.toFixed(2)} см)`);
  if (row.pathDev > LIM.path) row.flags.push(`путь рукояти в ${row.pathDev.toFixed(1)} см от прямой`);
  if (row.square > LIM.square) row.flags.push(`рукоять не поперёк цепи: до ${row.square.toFixed(1)}°`);
  if (Math.max(-row.seatWheel[0], row.seatWheel[1]) > LIM.track) row.flags.push(`ролики сиденья не на рельсе: ${row.seatWheel.map(v => v.toFixed(2)).join('…')} см`);
  if (row.seatOut < 0) row.flags.push(`сиденье уходит за задний упор рельса на ${(-row.seatOut).toFixed(1)} см`);
  if (!(row.order.legs < row.order.body && row.order.body < row.order.arms)) row.flags.push(`порядок фаз не «ноги → корпус → руки»: ${JSON.stringify(row.order)}`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `рукоять y ${hook[i][1].toFixed(1)} z ${hook[i][2].toFixed(1)}, цепь ${V.dist(hook[i], start[i]).toFixed(1)} см; сиденье z ${sz[i].toFixed(1)}; колено ${knee[i].toFixed(0)}°, корпус ${lean[i].toFixed(0)}°, локоть ${elbow[i].toFixed(0)}°` }));
  return row;
}

/* ---------- беговая дорожка: опорная стопа и лента ---------- */
function auditTreadmill(id, ev, fr) {
  const tm = eqOf(ev, 'treadmill')[0], top = tm.deckH || 20, row = { id, part: tm.id, type: 'дорожка', flags: [], feet: [] };
  for (const c of (ev.contacts || []).filter(c => /:belt$/.test(c.prop) && c.when)) {
    const win = fr.filter(f => inWin(c, f.t)), P = win.map(f => bodyPoint(f.R, c.body)), ts = win.map(f => f.t);
    const n = ts.length, mt = ts.reduce((s, x) => s + x, 0) / n, mz = P.reduce((s, p) => s + p[2], 0) / n;
    const b = ts.reduce((s, x, i) => s + (x - mt) * (P[i][2] - mz), 0) / ts.reduce((s, x) => s + (x - mt) ** 2, 0), a = mz - b * mt;
    const res = P.map((p, i) => p[2] - (a + b * ts[i])), dz = P.slice(1).map((p, i) => (p[2] - P[i][2]) / (ts[i + 1] - ts[i]));
    row.feet.push({ body: c.body, when: c.when, speed: -b, slip: Math.max(...res.map(Math.abs)), y: range(P.map(p => p[1] - top)), vel: range(dz.map(v => -v)), sideways: spread(P.map(p => p[0])) });
  }
  const sp = row.feet.map(q => q.speed);
  row.speed = sp; row.speedDiff = sp.length > 1 ? spread(sp) / (sp.reduce((s, x) => s + x, 0) / sp.length) * 100 : 0;
  for (const q of row.feet) {
    if (q.slip > LIM.belt) row.flags.push(`${q.body}: опорная стопа отходит от равномерного хода ленты на ${q.slip.toFixed(2)} см (скорость стопы ${q.vel[0].toFixed(0)}…${q.vel[1].toFixed(0)} см за цикл при ленте ${q.speed.toFixed(0)})`);
    if (Math.max(Math.abs(q.y[0]), Math.abs(q.y[1])) > LIM.beltY) row.flags.push(`${q.body}: подошва по высоте ленты ${q.y[0].toFixed(2)}…${q.y[1].toFixed(2)} см`);
    if (q.sideways > LIM.belt) row.flags.push(`${q.body}: опорная стопа съезжает вбок на ${q.sideways.toFixed(2)} см`);
  }
  if (row.speedDiff > LIM.beltSpeed) row.flags.push(`лента под стопами с разной скоростью: ${sp.map(v => v.toFixed(1)).join(' / ')} см за цикл`);
  row.frames = fr.map(f => ({ t: f.t, main: ['L', 'R'].map(s => { const p = bodyPoint(f.R, 'sole' + s); return `${s}: z ${p[2].toFixed(2)} y ${(p[1] - top).toFixed(2)}`; }).join(', ') }));
  return row;
}

/* ---------- каретка на направляющей (BIND.g4sled, BIND.sled) ---------- */
function auditSled(id, ev, fr, e) {
  const pre = (e.id || 'sled') + ':', cat = e.type === 'sled', A = cat ? I(M.toCat(e.rail[0])) : e.rail[0], B = cat ? I(M.toCat(e.rail[1])) : e.rail[1];
  const Z = V.unit(V.sub(B, A)), Lr = V.dist(A, B), row = { id, part: e.id, type: 'каретка', flags: [] };
  const T = fr.map(f => I(EQ.bodyPoint(f.R, e.bind))), s = T.map(p => V.dot(V.sub(p, A), Z)), off = T.map(p => V.perp(V.sub(p, A), Z));
  row.angle = Math.asin(Math.max(-1, Math.min(1, Z[1]))) * DEG; row.travel = spread(s); row.s = range(s); row.railLen = Lr;
  row.lineDev = Math.max(...off.map(o => V.dist(o, off[0])));
  row.clamp = s.filter(x => x + (e.shift || 0) <= 0 || x + (e.shift || 0) >= Lr).length;
  row.slips = (ev.contacts || []).filter(c => c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre]);
  if (row.lineDev > LIM.line) row.flags.push(`точка тела уходит с линии хода каретки на ${row.lineDev.toFixed(2)} см`);
  if (row.clamp) row.flags.push(`каретка упирается в конец направляющих в ${row.clamp} кадр.`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `ход ${s[i].toFixed(2)} см, от линии ${V.dist(off[i], off[0]).toFixed(2)} см` }));
  return row;
}

/* ---------- рычаг с неподвижной осью (BIND.g4lever, BIND.lever, BIND.g4link) ---------- */
function auditLever(id, ev, fr, e) {
  const cat = e.type === 'lever', P = cat ? I(M.toCat(e.pivot)) : e.pivot, A = V.unit(e.axis), pre = (e.id || (e.type === 'g4link' ? 'link' : 'lever')) + ':';
  const row = { id, part: e.id, type: e.type === 'g4link' ? 'параллелограмм' : 'рычаг', flags: [] };
  const T = fr.map(f => I(EQ.bodyPoint(f.R, e.bind))), rad = T.map(p => V.len(V.perp(V.sub(p, P), A))), al = T.map(p => V.dot(V.sub(p, P), A));
  const u0 = V.unit(V.perp(V.sub(T[0], P), A)), an = T.map(p => { const u = V.unit(V.perp(V.sub(p, P), A)); return Math.atan2(V.dot(V.cross(u0, u), A), V.dot(u0, u)) * DEG; });
  row.radius = range(rad); row.radiusDev = spread(rad); row.alongDev = spread(al); row.turn = range(an);
  row.slips = (ev.contacts || []).filter(c => c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre]);
  if (Math.hypot(row.radiusDev, row.alongDev) > LIM.lever) row.flags.push(`точка тела уходит с окружности вокруг оси: радиус ${row.radius[0].toFixed(2)}…${row.radius[1].toFixed(2)} см, вдоль оси ${row.alongDev.toFixed(2)} см`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `угол ${an[i].toFixed(1)}°, радиус ${rad[i].toFixed(2)} см` }));
  return row;
}

/* ---------- «бабочка» (BIND.pecArm) ---------- */
function auditPecArm(id, ev, fr, e) {
  const pre = (e.id || 'pec' + e.hand) + ':', s = e.hand, P = I(M.toCat(e.pivot)), row = { id, part: e.id, type: 'рычаг «бабочки»', flags: [] };
  const g = fr.map(f => I(f.R['grip' + s])), sh = fr.map(f => I(f.R['sh' + s]));
  row.gripRadius = range(g.map(p => Math.hypot(p[0] - P[0], p[2] - P[2]))); row.gripY = range(g.map(p => p[1]));
  row.shoulderOff = range(sh.map(p => Math.hypot(p[0] - P[0], p[2] - P[2])));
  row.slips = (ev.contacts || []).filter(c => c.prop === e.id || c.prop.startsWith(pre)).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre]);
  if (spread(row.gripRadius) > LIM.lever) row.flags.push(`хват уходит с окружности вокруг оси: ${row.gripRadius.map(v => v.toFixed(2)).join('…')} см`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `хват r ${Math.hypot(g[i][0] - P[0], g[i][2] - P[2]).toFixed(2)} y ${g[i][1].toFixed(2)}; плечо от оси ${Math.hypot(sh[i][0] - P[0], sh[i][2] - P[2]).toFixed(2)} см` }));
  return row;
}

/* ---------- машина Смита (BIND.smithBar) ---------- */
function auditSmith(id, ev, fr, e) {
  const pre = (e.id || 'smithBar') + ':', row = { id, part: e.id, type: 'Смит', flags: [] };
  const fx = eqOf(ev, 'smith')[0], rodL = fr[0].get((fx.id || 'smith') + ':rodL'), rd = V.unit(V.sub(I(rodL.b), I(rodL.a)));
  row.railAngle = Math.asin(Math.max(-1, Math.min(1, rd[1]))) * DEG;
  const bar = fr.map(f => f.get(e.id || 'smithBar') || f.get(pre + 'bar')), bc = bar.map(b => I(b.c)), ba = bar.map(b => V.unit(Id(b.axis)));
  row.gripAxis = Math.max(...fr.flatMap((f, i) => ['L', 'R'].map(s => V.len(V.perp(V.sub(I(f.R['grip' + s]), bc[i]), ba[i])))));
  row.barTilt = Math.max(...ba.map(a => Math.asin(Math.min(1, Math.abs(a[1]))) * DEG));
  /* центр грифа по оси направляющих: отклонение от прямой по направляющей */
  row.barLine = Math.max(...bc.map(c => V.len(V.perp(V.sub(c, bc[0]), rd))));
  row.travel = spread(bc.map(c => V.dot(c, rd)));
  row.hooks = fr[0].R.props.filter(p => p.id && p.id.startsWith(pre) && /hook/i.test(p.id)).length;
  row.slips = (ev.contacts || []).filter(c => c.prop === e.id).map(c => slipOf(fr, c));
  if (row.gripAxis > LIM.barAxis) row.flags.push(`хват в ${row.gripAxis.toFixed(2)} см от оси грифа`);
  if (row.barTilt > LIM.pedalAxis) row.flags.push(`гриф наклоняется до ${row.barTilt.toFixed(1)}°`);
  if (row.barLine > LIM.line) row.flags.push(`гриф уходит с оси направляющих на ${row.barLine.toFixed(2)} см`);
  if (!row.hooks) row.flags.push('у грифа нет крюков (гриф нельзя повесить на раму)');
  row.frames = fr.map((f, i) => ({ t: f.t, main: `гриф y ${bc[i][1].toFixed(1)}; хваты от оси ${Math.max(...['L', 'R'].map(s => V.len(V.perp(V.sub(I(f.R['grip' + s]), bc[i]), ba[i])))).toFixed(2)} см` }));
  return row;
}

/* ---------- Т-гриф на «мине» (BIND.g1LandmineBar) ---------- */
function auditLandmine(id, ev, fr, e) {
  const pre = (e.id || 'tbar') + ':', P = e.pivot, row = { id, part: e.id, type: '«мина»', flags: [] };
  const hk = fr.map(f => I(f.get(pre + 'hook').c)), sh = fr.map(f => { const b = f.get(pre + 'shaft'); return V.unit(V.sub(I(b.b), I(b.a))); });
  const d = hk.map(p => V.dist(p, P)); row.hookDist = range(d);
  /* шарнир — ось X (щёки вилки): гриф в плоскости x = const */
  row.plane = Math.max(...sh.map(u => Math.asin(Math.min(1, Math.abs(u[0]))) * DEG));
  row.elev = range(sh.map(u => Math.asin(Math.max(-1, Math.min(1, u[1]))) * DEG));
  row.slips = (ev.contacts || []).filter(c => c.prop.startsWith(pre) || c.prop === e.id).map(c => slipOf(fr, c));
  row.rigid = rigidOf(fr, [pre], k => /:cheek/.test(k));
  if (spread(d) > LIM.lever) row.flags.push(`крюк V-рукояти ездит по грифу: ${d.map(v => +v.toFixed(2)).reduce((a, v) => [Math.min(a[0], v), Math.max(a[1], v)], [Infinity, -Infinity]).join('…')} см от шарнира`);
  if (row.plane > LIM.pedalAxis) row.flags.push(`гриф выходит из плоскости шарнира на ${row.plane.toFixed(1)}°`);
  flagSlip(row, row.slips); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `угол грифа ${(Math.asin(sh[i][1]) * DEG).toFixed(1)}°, крюк ${d[i].toFixed(2)} см` }));
  return row;
}

/* ---------- ролик для пресса (BIND.abWheel) ---------- */
function auditWheel(id, ev, fr, e) {
  const pre = (e.id || 'wheel') + ':', r = e.r || 9, row = { id, part: e.id, type: 'колесо', flags: [] };
  const mat = eqOf(ev, 'mat')[0], top = mat ? (mat.at?.[1] || 0) + 1 : 0;
  const w = fr.map(f => f.get(pre + 'wheel')), c = w.map(p => I(p.c)), ax = w.map(p => V.unit(Id(p.axis)));
  row.gap = range(c.map(p => p[1] - r - top)); row.tilt = Math.max(...ax.map(a => Math.asin(Math.min(1, Math.abs(a[1]))) * DEG));
  /* путь — по полу поперёк оси (вперёд = ось × вверх); поворот — по метке колеса (деталь :mark, направление от центра).
     Колесо катится вперёд, нижняя точка неподвижна: поворот вокруг оси (правая тройка) на +путь/радиус */
  const dir = V.unit(V.cross(ax[0], [0, 1, 0])), s = c.map(p => V.dot(V.sub(p, c[0]), dir));
  row.path = spread(s);
  const mk = fr.map(f => f.get(pre + 'mark'));
  if (mk.every(Boolean)) {
    const m = mk.map((p, i) => V.unit(V.perp(V.sub(I(p.c || p.b), c[i]), ax[i])));
    let th = 0; const turn = [0];
    for (let i = 1; i < m.length; i++) { th += Math.atan2(V.dot(V.cross(m[i - 1], m[i]), ax[i]), V.dot(m[i - 1], m[i])); turn.push(th); }
    row.roll = Math.max(...turn.map((a, i) => Math.abs(a * r - s[i])));
    if (row.roll > LIM.roll) row.flags.push(`колесо проскальзывает: поворот × радиус расходится с путём на ${row.roll.toFixed(2)} см (путь ${row.path.toFixed(1)} см)`);
  } else { row.roll = null; row.flags.push(`вращение колеса не изображено (нет метки): колесо едет ${row.path.toFixed(0)} см, не поворачиваясь`); }
  if (Math.max(-row.gap[0], row.gap[1]) > LIM.floor) row.flags.push(`колесо ${row.gap[1] > LIM.floor ? 'над опорой' : 'в опоре'}: ${row.gap.map(v => v.toFixed(2)).join('…')} см`);
  if (row.tilt > LIM.pedalAxis) row.flags.push(`ось колеса наклонена до ${row.tilt.toFixed(1)}°`);
  row.rigid = rigidOf(fr, [pre]); flagRigid(row, row.rigid);
  row.frames = fr.map((f, i) => ({ t: f.t, main: `путь ${s[i].toFixed(1)} см, низ колеса ${(c[i][1] - r - top).toFixed(2)} см` }));
  return row;
}

/* ---------- одно упражнение ---------- */
const AUDIT = { bikeCrank: auditCrank, ellipticalLinks: auditElliptical, stepPedals: auditStepper, g4sled: auditSled, sled: auditSled, g4lever: auditLever, lever: auditLever, g4link: auditLever,
  pecArm: auditPecArm, smithBar: auditSmith, g1LandmineBar: auditLandmine, abWheel: auditWheel };
function relevant(entry) { const eqs = EQ.variantEntry(entry).equipment || []; return eqs.some(e => AUDIT[e.type] || e.type === 'rowerChain' || e.type === 'treadmill'); }
function auditEntry(id, entry, { samples = 41 } = {}) {
  if (!relevant(entry)) return [];
  /* кадры и между ключами позы: при 40 ключах 41 кадр совпал бы с ключами, а стопа и кисть уходят с детали как раз между
     ними (углы суставов интерполируются) — кадров не меньше 4 на промежуток между ключами */
  const nk = (EQ.variantEntry(entry).keys || []).length;
  const { ev, fr } = sample(entry, Math.max(samples, 4 * (nk - 1) + 1)), rows = [];
  for (const e of ev.equipment || []) if (AUDIT[e.type]) rows.push(AUDIT[e.type](id, ev, fr, e));
  if (eqOf(ev, 'rowerChain').length) rows.push(auditRower(id, ev, fr));
  if (eqOf(ev, 'treadmill').length) rows.push(auditTreadmill(id, ev, fr));
  for (const r of rows) { r.loop = !!ev.loop; r.equipment = (ev.equipment || []).map(q => q.type); }
  return rows;
}
function run({ only, samples = 41, baked = false } = {}) {
  let entries;
  if (baked) entries = require('../../src/js/09bp-poses.js');
  else {
    /* спецификации запекаются только у упражнений с подвижным инвентарём из этого аудита */
    const A = require('./author.js'), specs = A.loadSpecs(), ids = Object.keys(specs).filter(id => (!only || only.includes(id)) && relevant({ equipment: specs[id].equipment || [] }));
    entries = A.bakeAll({ only: ids });
  }
  const rows = [];
  for (const [id, e] of Object.entries(entries)) { if ((only && !only.includes(id)) || id.startsWith('_')) continue; rows.push(...auditEntry(id, e, { samples })); }
  return rows;
}
const f1 = v => v == null ? '—' : (+v).toFixed(1), f2 = v => v == null ? '—' : (+v).toFixed(2), rng = (a, k = f2) => `${k(a[0])}…${k(a[1])}`;
const slipTxt = r => (r.slips || []).filter(Boolean).map(s => `${s.body}/${s.part.split(':').pop()} ${f2(s.d)}`).join(', ');
const rigidTxt = r => { const m = (r.rigid || []).reduce((a, q) => q.d > a.d ? q : a, { d: 0, id: '—' }); return `жёсткие детали: max Δ ${f2(m.d)} см (${m.id.split(':').pop()})`; };
function describe(r) {
  const out = [`${r.type} ${r.part || ''}`];
  if (r.type === 'шатуны') out.push(`плечо ${rng(r.radius)} см (номинал ${f1(r.rc)}), противофаза ±${f1(r.phase)}°, ось педали ${f1(r.pedalAxis)}°, неравномерность ${(r.uneven * 100).toFixed(0)}%`);
  if (r.type === 'эллипс') out.push(`кривошип ${rng(r.radius)} см (номинал ${f1(r.rc)}), противофаза ±${f1(r.phase)}°, ролик по высоте ${rng(r.rollerY)} / вбок ${rng(r.rollerX)} см, рычаг мимо оси ${f2(r.pivotOff)} см, педаль к тяге ${f1(r.pedalBar)}°, шаг ${f1(r.stride)} см, подъём ${f1(r.rise)} см`);
  if (r.type === 'степпер') out.push(`рычаг ${rng(r.lever)} см, тяга ${rng(r.link)} см, конец тяги от оси ${f2(r.linkJoin)} см, площадка ${f1(r.level)}°, ход педали ${f1(r.stroke)} см`);
  if (r.type === 'гребной') out.push(`цепь из направляющей ${f2(r.exitOff)} см, путь рукояти от прямой ${f1(r.pathDev)} см, цепь к полу ${rng(r.chainAng, f1)}°, ход ${f1(r.stroke)} см, рукоять к цепи ${f1(r.square)}°, сиденье: ролики ${rng(r.seatWheel)} см, ход ${f1(r.seatTravel)} см, запас рельса ${f1(r.seatOut)} см, фазы ${JSON.stringify(r.order)}`);
  if (r.type === 'дорожка') out.push(r.feet.map(q => `${q.body}: лента ${f1(q.speed)} см/цикл, от равномерного ${f2(q.slip)} см, по высоте ${rng(q.y)} см, вбок ${f2(q.sideways)} см`).join('; '));
  if (r.type === 'каретка') out.push(`направляющие ${f1(r.angle)}° к полу, ход ${f1(r.travel)} см (${rng(r.s, f1)} из ${f1(r.railLen)}), от линии ${f2(r.lineDev)} см`);
  if (r.type === 'рычаг' || r.type === 'параллелограмм') out.push(`поворот ${rng(r.turn, f1)}°, радиус точки тела ${rng(r.radius)} см, вдоль оси ${f2(r.alongDev)} см`);
  if (r.type === 'рычаг «бабочки»') out.push(`хват: радиус ${rng(r.gripRadius)} см, высота ${rng(r.gripY)} см; плечевой сустав от оси ${rng(r.shoulderOff)} см`);
  if (r.type === 'Смит') out.push(`направляющие ${f1(r.railAngle)}° к полу, ход ${f1(r.travel)} см, хват от оси грифа ${f2(r.gripAxis)} см, наклон грифа ${f1(r.barTilt)}°, крюков ${r.hooks}`);
  if (r.type === '«мина»') out.push(`крюк от шарнира ${rng(r.hookDist)} см, из плоскости ${f1(r.plane)}°, угол грифа ${rng(r.elev, f1)}°`);
  if (r.type === 'колесо') out.push(`путь ${f1(r.path)} см, низ колеса ${rng(r.gap)} см, ось ${f1(r.tilt)}°, качение ${r.roll == null ? 'не изображено' : f2(r.roll) + ' см'}`);
  if (r.rigid) out.push(rigidTxt(r));
  if (r.slips && r.slips.some(Boolean)) out.push(`контакты: ${slipTxt(r)} см`);
  if (r.close) out.push(`цикл ${r.loop ? f2(r.close.d) + ' см' : '—'}`);
  return out.join(' | ');
}
if (require.main === module) {
  const arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
  const only = arg('--only')?.split(','), samples = +(arg('--samples') || 41), all = process.argv.includes('--all'), frames = process.argv.includes('--frames');
  const rows = run({ only, samples, baked: process.argv.includes('--baked') });
  const bad = rows.filter(r => r.flags.length);
  for (const r of all ? rows : bad) {
    console.log(`${r.id.padEnd(14)} ${describe(r)}${r.flags.length ? '\n    ⚠ ' + r.flags.join('\n    ⚠ ') : ''}`);
    if (frames) for (const f of r.frames.filter((_, i) => i % 4 === 0)) console.log(`      t=${f.t.toFixed(3).padEnd(6)} ${f.main}`);
  }
  console.log(`\nУпражнений ${new Set(rows.map(r => r.id)).size}, узлов ${rows.length}; с замечаниями ${new Set(bad.map(r => r.id)).size} упражнений (${bad.length} узлов)`);
  if (arg('--json')) fs.writeFileSync(arg('--json'), JSON.stringify(rows.map(r => ({ ...r, frames: undefined })), null, 1));
}
module.exports = { run, auditEntry, relevant, LIM, bodyPoint, frameOf, local };
