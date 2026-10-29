'use strict';
/* Рычажные тренажёры G4: передача «рычаг → привод → блоки → стек» (src/js/09bo-g4-lever.js). Эталоны этапа 1 — разгибание
   (legext) и сгибание ног лёжа (legcurl); этап 2 — гравитрон (assistpull, assistdip: подвижный блок на плечах, без кулачка),
   подъём на носки стоя (standcalf: каретка, без кулачка), жимы и тяга сидя (chestpressm, shoulderpressm, leverrowm: кулачок на
   общем валу рычагов и подвижный блок 1:2 в колонне), отведение и приведение (abduction, adduction: кулачок на оси левого
   рычага, рычаги связаны зубчатыми секторами, хвост к колонне). По запечённым позам (src/js/09bp-poses.js), 41 кадр повтора;
   всё меряется по нарисованным деталям (tools/mannequin/cable-audit.js, auditLever):
   * длина троса (путь по кулачку и блокам + трос стека) постоянна, трос касателен к кулачку и колёсам, профиль кулачка —
     по одну сторону от прямой схода, точки касания на ободе;
   * кулачок (точка, подвижный блок, проушина каретки) движется вместе с рычагом или кареткой, колёса блоков стоят на месте;
   * подъём верхней плиты равен k·∫p dφ (у каретки — k·∫p ds), в нижней точке хода плиты висят на 1 см, не упираются
     в maxLift; трос не проходит сквозь раму;
   * момент тренажёра против кривой силы главного сустава (tools/mannequin/strength-curves.js) и проверка энергией: весь стек
     по паспорту тренажёра этого класса даёт момент в пределах силы среднего мужчины (где у кривой есть сила в Н·м). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const POSES = require('../src/js/09bp-poses.js');
const EQ = require('../src/js/09bn-equipment.js');
const { auditLever, LEVER_LIM: L } = require('./mannequin/cable-audit.js');
const CURVES = require('./mannequin/strength-curves.js');
const RHO_MIN = 4.5, G = 9.81;
/* ход стека за повтор, см: [от, до]. Ход ограничен физикой: Δh = τ/(m·g)·Δφ — при силе всего стека в пределах силы человека
   и малом повороте рычага (жимы 20–35°, отведение 36°) плиты проходят 4–20 см; у кулачковых машин этапа 1 — 20–45 */
const TRAVEL = {
  legext: [20, 45], legcurl: [20, 45], assistpull: [20, 45], assistdip: [10, 45], standcalf: [8, 45],
  chestpressm: [10, 45], shoulderpressm: [15, 45], leverrowm: [12, 45], abduction: [7, 45], adduction: [4, 45]
};
const IDS = Object.keys(TRAVEL);
const rows = Object.fromEntries(IDS.map(id => [id, auditLever(id, POSES[id])]));
const trOf = id => POSES[id].equipment.find(e => e.type === 'g4camCable');
const camsOf = id => EQ.leverStack.drivesOf(trOf(id)).filter(d => (d.kind || 'cam') === 'cam').map(d => d.cam);

test('lever stacks: the cable keeps its length, runs tangent to the cam and wheels, the drive moves with the lever or carriage', () => {
  for (const id of IDS) {
    assert.equal(rows[id].length, 1, id + ': один узел передачи');
    const r = rows[id][0];
    assert.deepEqual(r.flags, [], id);
    assert(r.length[1] - r.length[0] <= L.length, `${id}: длина троса ${r.length.map(v => v.toFixed(3)).join('…')}`);
    assert(r.tan <= L.tangentCos && r.rim <= L.onRim && r.onProf <= L.onRim && r.side <= L.side, `${id}: касание`);
    assert(r.rigid <= L.rigid && r.rigidCm <= L.onRim, `${id}: привод сдвигается относительно рычага (${r.rigid}°, ${r.rigidCm} см)`);
    assert(r.wheelOff <= L.onRim && r.dropJoin <= L.onRim, `${id}: колесо блока сдвинуто или трос не доходит до стека`);
    assert(r.clear.d >= -L.clear, `${id}: трос сквозь ${r.clear.id}`);
  }
});

test('lever stacks: the stack rises by k·∫p dφ, hangs 1 cm at the bottom of its travel, never hits the top', () => {
  for (const id of IDS) {
    const r = rows[id][0], dh = r.liftMax - r.liftMin;
    assert(r.liftErr <= L.lift, `${id}: подъём против k·∫p dφ ${r.liftErr}`);
    assert(r.liftMin >= L.hover[0] && r.liftMin <= L.hover[1], `${id}: в нижней точке ${r.liftMin}`);
    assert(r.liftMax < r.maxLift, `${id}: max ${r.liftMax} из ${r.maxLift}`);
    assert(dh >= TRAVEL[id][0] && dh <= TRAVEL[id][1], `${id}: подъём за повтор ${dh.toFixed(1)} см`);
  }
});

test('lever stacks: every cam is a convex chain of arcs no tighter than the smallest pulley (Ø9)', () => {
  for (const id of IDS) for (const cam of camsOf(id)) {
    const arcs = cam.arcs;
    for (let i = 0; i < arcs.length; i++) {
      const a = arcs[i];
      assert(a.r >= RHO_MIN - 1e-3 && a.a1 > a.a0, `${id}: дуга ${i} r=${a.r}`);
      if (i) {
        const b = arcs[i - 1], end = [b.c[0] + b.r * Math.cos(b.a1), b.c[1] + b.r * Math.sin(b.a1)], start = [a.c[0] + a.r * Math.cos(a.a0), a.c[1] + a.r * Math.sin(a.a0)];
        assert(Math.abs(a.a0 - b.a1) < 1e-5 && Math.hypot(end[0] - start[0], end[1] - start[1]) < 2e-3, `${id}: стык дуг ${i - 1}/${i}`);
      }
    }
  }
});

test('lever stacks: machine torque against the human strength curve', () => {
  /* сгибание лёжа: кривая Onishi (пик 25°, 0,835 при 82,5°) плавная — кулачок повторяет её почти точно */
  const c = rows.legcurl[0];
  assert(Math.abs(c.peakMachine - c.peakTarget) <= 5 && Math.abs(c.ratioMachine - c.ratioTarget) <= .02 && c.maxDev <= .02, `legcurl: пик ${c.peakMachine}/${c.peakTarget}, min/max ${c.ratioMachine}/${c.ratioTarget}, max ${c.maxDev}`);
  /* разгибание: пик Lanza/Folland & Morris (65°) острее, чем позволяет выпуклый кулачок с прямым тросом (в пике p″ ≥ ρmin − p),
     поэтому подбор выбирает монотонный спад: все дуги — на пределе ρmin (самый крутой спад), момент от 85° к 9° падает
     до 0,30 пика (у человека — 0,24). Отклонение записано как предел: не должно расти. */
  const x = rows.legext[0], arcs = camsOf('legext')[0].arcs;
  assert(arcs.every(a => a.r <= RHO_MIN + .05), 'legext: дуги не на пределе ρmin — спад не самый крутой');
  assert(x.peakMachine >= 80 && x.ratioMachine <= .31 && x.rms <= .095 && x.maxDev <= .17, `legext: пик ${x.peakMachine}, min/max ${x.ratioMachine}, RMS ${x.rms}, max ${x.maxDev}`);
  /* жим от груди: рычаг поворачивается всего на 19°, а кривая разгибания локтя (Bober 2002) поднимается от 0,69 при 110°
     к пику при 64° и спадает к 0,80 при 35°. Подъём кулачок даёт, спад за 7° после пика — нет (p″ ≥ ρmin − p: при p ≈ 19 см
     момент за 0,12 рад может упасть не больше чем на 1 %), поэтому ближайшая допустимая кривая — монотонный рост до конца
     жима. Записано как предел: не должно расти. */
  const cp = rows.chestpressm[0];
  assert(cp.rms <= .08 && cp.maxDev <= .21 && cp.ratioMachine >= .77, `chestpressm: RMS ${cp.rms}, max ${cp.maxDev}, min/max ${cp.ratioMachine}`);
  /* жим вверх (подъём плеча, Timmons 2005 + Aronis 2026) и тяга (разгибание плеча, Bober 2002): кривые монотонно спадают
     по ходу — кулачок повторяет их с точностью до нескольких процентов */
  for (const [id, rms, max] of [['shoulderpressm', .03, .07], ['leverrowm', .045, .08], ['abduction', .015, .025], ['adduction', .015, .02]]) {
    const r = rows[id][0];
    assert(r.rms <= rms && r.maxDev <= max, `${id}: RMS ${r.rms}, max ${r.maxDev}`);
  }
});

test('lever stacks: the gravitron assists evenly, the calf carriage pulls the cable straight', () => {
  /* гравитрон: сила помощи у площадки F = m·g·dh/dy (энергия) почти постоянна по ходу: подвижный блок на плече, обе ветви
     почти вертикальны — F = 2T·RA/r независимо от угла */
  for (const id of ['assistpull', 'assistdip']) {
    const rig = EQ.rig(POSES[id]), n = 41, y = [], h = [];
    for (let i = 0; i < n; i++) { const R = rig(i / (n - 1)), pad = R.props.find(p => p.id === 'gvPad:pad'); y.push(M.FLOOR - pad.c[1]); h.push(rows[id][0].frames[i].lift); }
    /* подъём плит против высоты площадки — прямая: наклон — доля веса стека, которой помогает противовес */
    const my = y.reduce((a, b) => a + b) / n, mh = h.reduce((a, b) => a + b) / n;
    const c = -y.reduce((s, v, i) => s + (v - my) * (h[i] - mh), 0) / y.reduce((s, v) => s + (v - my) ** 2, 0), res = Math.max(...y.map((v, i) => Math.abs(h[i] - (mh - c * (v - my)))));
    assert(c > .45 && c < .56 && res < .5, `${id}: помощь у площадки ${c.toFixed(3)} веса стека, отход от прямой ${res.toFixed(2)} см`);
  }
  /* каретка: трос идёт вдоль направляющей, сила на плечах равна весу стека во всех кадрах */
  assert(rows.standcalf[0].p[0] > .999, `standcalf: трос под углом к направляющей (${rows.standcalf[0].p[0]})`);
});

test('lever stacks: energy — the whole passport stack gives a torque within an average man\'s strength', () => {
  for (const id of IDS) {
    const r = rows[id][0], tr = trOf(id), k = tr.ratio ?? 1, fr = r.frames;
    /* m·g·Δh = ∫ m·g·k·p dφ по кадрам: подъём верхней плиты сходится с работой (у каретки и блока — с ходом) */
    const lift = (Math.max(...fr.map(f => f.lift)) - Math.min(...fr.map(f => f.lift))) / 100, energy = tr.kg * G * lift;
    const calc = (Math.max(...fr.map(f => f.calc)) - Math.min(...fr.map(f => f.calc))) / 100 * tr.kg * G;
    assert(Math.abs(calc - energy) / energy < .01, `${id}: k·∫p dφ ${calc.toFixed(1)} Дж против m·g·Δh ${energy.toFixed(1)} Дж`);
    /* сила человека — только там, где ось рычага совпадает с осью сустава (колено, бедро): у жимов и тяги момент на оси
       рычага не равен моменту в суставе */
    const curve = CURVES[tr.curve];
    if (!curve || !(curve.nmPerKg || curve.nm) || !['legext', 'legcurl', 'abduction', 'adduction'].includes(id)) continue;
    /* пиковый момент всего стека против силы на том же угле: у колена — две ноги на одном рычаге; у отведения и приведения
       моменты обеих ног складываются на оси кулачка (каждой — половина) */
    const iPk = fr.findIndex(f => f.norm === 1), legs = 2, tau = tr.kg * G * k * fr[iPk].p / 100 / (id === 'abduction' || id === 'adduction' ? 2 : 1);
    const cap1 = curve.nmPerKg ? curve.nmPerKg * M.B.mass * curve.f(fr[iPk].knee) : curve.nm * curve.f(fr[iPk].knee) / curve.f(curve.nmAt);
    const cap = id === 'abduction' || id === 'adduction' ? cap1 : legs * cap1;
    assert(tau / cap >= .3 && tau / cap <= 1, `${id}: ${tau.toFixed(0)} Н·м = ${(100 * tau / cap).toFixed(0)} % силы (${cap.toFixed(0)} Н·м)`);
  }
});
