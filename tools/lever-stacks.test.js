'use strict';
/* Рычажные тренажёры G4: передача «рычаг → кулачок → блоки → стек» (src/js/09bo-g4-lever.js), эталоны — разгибание (legext)
   и сгибание ног лёжа (legcurl). По запечённым позам (src/js/09bp-poses.js), 41 кадр повтора; всё меряется по нарисованным
   деталям (tools/mannequin/cable-audit.js, auditLever):
   * длина троса (путь по кулачку и блокам + трос стека) постоянна, трос касателен к кулачку и колёсам, профиль кулачка —
     по одну сторону от прямой схода, точки касания на ободе;
   * кулачок поворачивается вместе с рычагом, колёса блоков стоят на месте;
   * подъём верхней плиты равен k·∫p dφ (плечо троса p — от оси рычага до прямой схода, φ — угол рычага), в начале повтора
     плиты висят на 1 см, не ложатся и не упираются в maxLift; трос не проходит сквозь раму;
   * момент тренажёра против кривой силы сустава (tools/mannequin/strength-curves.js) и проверка энергией: весь стек
     по паспорту тренажёра этого класса даёт момент в пределах силы среднего мужчины. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const POSES = require('../src/js/09bp-poses.js');
const { auditLever, LEVER_LIM: L } = require('./mannequin/cable-audit.js');
const CURVES = require('./mannequin/strength-curves.js');
const IDS = ['legext', 'legcurl'], RHO_MIN = 4.5, G = 9.81;
const rows = Object.fromEntries(IDS.map(id => [id, auditLever(id, POSES[id])]));
const trOf = id => POSES[id].equipment.find(e => e.type === 'g4camCable');

test('lever stacks: the cable keeps its length, runs tangent to the cam and wheels, the cam turns with the lever', () => {
  for (const id of IDS) {
    assert.equal(rows[id].length, 1, id + ': один узел передачи');
    const r = rows[id][0];
    assert.deepEqual(r.flags, [], id);
    assert(r.length[1] - r.length[0] <= L.length, `${id}: длина троса ${r.length.map(v => v.toFixed(3)).join('…')}`);
    assert(r.tan <= L.tangentCos && r.rim <= L.onRim && r.onProf <= L.onRim && r.side <= L.side, `${id}: касание`);
    assert(r.rigid <= L.rigid, `${id}: кулачок проворачивается на ${r.rigid}°`);
    assert(r.wheelOff <= L.onRim, `${id}: колесо блока сдвинуто`);
    assert(r.clear.d >= -L.clear, `${id}: трос сквозь ${r.clear.id}`);
  }
});

test('lever stacks: the stack rises by k·∫p dφ, hangs 1 cm at the start, never lies down or hits the top', () => {
  for (const id of IDS) {
    const r = rows[id][0], dh = r.liftMax - r.liftStart;
    assert(r.liftErr <= L.lift, `${id}: подъём против k·∫p dφ ${r.liftErr}`);
    assert(r.liftStart >= L.hover[0] && r.liftStart <= L.hover[1], `${id}: в начале ${r.liftStart}`);
    assert(r.liftMin >= .5 && r.liftMax < r.maxLift, `${id}: min ${r.liftMin}, max ${r.liftMax} из ${r.maxLift}`);
    /* практичный ход стека за повтор — 20–45 см */
    assert(dh >= 20 && dh <= 45, `${id}: подъём за повтор ${dh.toFixed(1)} см`);
  }
});

test('lever stacks: the cam is a convex chain of arcs no tighter than the smallest pulley (Ø9)', () => {
  for (const id of IDS) {
    const arcs = trOf(id).cam.arcs;
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
  const x = rows.legext[0], arcs = trOf('legext').cam.arcs;
  assert(arcs.every(a => a.r <= RHO_MIN + .05), 'legext: дуги не на пределе ρmin — спад не самый крутой');
  assert(x.peakMachine >= 80 && x.ratioMachine <= .31 && x.rms <= .095 && x.maxDev <= .17, `legext: пик ${x.peakMachine}, min/max ${x.ratioMachine}, RMS ${x.rms}, max ${x.maxDev}`);
});

test('lever stacks: energy — the whole passport stack gives a torque within an average man\'s strength', () => {
  for (const id of IDS) {
    const r = rows[id][0], tr = trOf(id), curve = CURVES[tr.curve], k = tr.ratio ?? 1;
    /* m·g·Δh = ∫τ dφ по кадрам (τ = m·g·k·p) */
    const fr = r.frames, work = fr.slice(1).reduce((s, f, i) => s + tr.kg * G * k * (f.p + fr[i].p) / 200 * Math.abs(phiOf(r, i + 1) - phiOf(r, i)), 0);
    const lift = (fr[fr.length - 1].lift - fr[0].lift) / 100, energy = tr.kg * G * lift;
    assert(Math.abs(work - energy) / energy < .01, `${id}: ∫τ dφ ${work.toFixed(1)} Дж против m·g·Δh ${energy.toFixed(1)} Дж`);
    /* пиковый момент всего стека против силы двух ног на том же угле (Н·м/кг × масса манекена × кривая) */
    const iPk = fr.findIndex(f => f.norm === 1), tau = tr.kg * G * k * fr[iPk].p / 100, cap = 2 * curve.nmPerKg * M.B.mass * curve.f(fr[iPk].knee);
    assert(tau / cap >= .3 && tau / cap <= 1, `${id}: ${tau.toFixed(0)} Н·м = ${(100 * tau / cap).toFixed(0)} % силы (${cap.toFixed(0)} Н·м)`);
  }
});
/* угол рычага кадра i (рад) — по плечу троса и подъёму: dφ = dh / (k·p) ненадёжен у малых p, поэтому — из запечённого рига */
const EQ = require('../src/js/09bn-equipment.js'), PHI = new Map();
function phiOf(r, i) {
  if (!PHI.has(r.id)) {
    const tr = trOf(r.id), rig = EQ.rig(POSES[r.id]), n = r.frames.length;
    PHI.set(r.id, Array.from({ length: n }, (_, j) => EQ.leverStack.leverAngle(tr, rig(j / (n - 1)))));
  }
  return PHI.get(r.id)[i];
}
