'use strict';
/* Механика подвижного инвентаря (tools/mannequin/mech-audit.js) по запечённым позам (src/js/09bp-poses.js): кадры повтора
   и между ключами позы, всё — по нарисованным деталям.
   * у всех узлов нет замечаний аудита: жёсткие детали постоянной длины, шатуны и кривошипы с постоянным плечом и
     в противофазе, ролик на направляющей, тяги на своих осях, стопа и кисть не скользят по детали, каретка ведётся по
     линии направляющих, рычаг — по окружности вокруг оси, цикл замкнут;
   * паспортные величины класса: шатун велотренажёра 170–175 мм, шаг эллипса 51 см (20″), направляющие гакк-машины и
     жима ногами 45°, Смит вертикальный, у грифа Смита крюки;
   * каждый подвижный тип инвентаря в каталоге либо проверяется здесь, либо записан ниже с причиной — новый тип без
     аудита не пройдёт. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const POSES = require('../src/js/09bp-poses.js');
const EQ = require('../src/js/09bn-equipment.js');
const { auditEntry, relevant, LIM } = require('./mannequin/mech-audit.js');

const rows = Object.entries(POSES).filter(([id, e]) => !id.startsWith('_') && relevant(e)).flatMap(([id, e]) => auditEntry(id, e));
const of = (id, type) => rows.filter(r => r.id === id && (!type || r.type === type));
const one = (id, type) => { const r = of(id, type); assert.equal(r.length, 1, `${id}: один узел ${type || ''}`); return r[0]; };
const slip = r => Math.max(0, ...(r.slips || []).filter(Boolean).map(s => s.d));

test('mech: every moving mechanism passes the audit (no flags)', () => {
  assert(rows.length >= 30, `узлов ${rows.length}`);
  const bad = rows.filter(r => r.flags.length).map(r => `${r.id} ${r.type} ${r.part}: ${r.flags.join('; ')}`);
  assert.deepEqual(bad, []);
});

test('mech: bike — rigid 175 mm cranks in counter-phase, pedals turn about their spindles, feet stay on the pedals', () => {
  const r = one('bike', 'шатуны');
  assert(r.rc >= 17 && r.rc <= 17.5, `шатун ${r.rc} см`);
  assert(r.radiusErr <= .01 && r.phase <= .1 && r.pedalAxis <= .1, `плечо ±${r.radiusErr}, противофаза ${r.phase}°, ось педали ${r.pedalAxis}°`);
  assert(slip(r) <= .2, `стопа по педали ${slip(r)} см`);
  assert(r.loop && r.close.d <= LIM.close);
});

test('mech: elliptical — crank, pedal bar on the roller track, handle four-bar; 20-inch stride', () => {
  const r = one('elliptical', 'эллипс');
  assert(r.radiusErr <= .01 && r.phase <= .1, `кривошип ±${r.radiusErr}, противофаза ${r.phase}°`);
  assert(Math.max(-r.rollerY[0], r.rollerY[1], -r.rollerX[0], r.rollerX[1]) <= .01, 'ролик на направляющей');
  assert(r.pivotOff <= .01 && r.pedalBar <= .1 && r.pedalAxis <= .1, 'рычаг рукояти на оси, педаль жёстко на тяге');
  assert(r.rigid.every(q => q.d <= .01), 'тяги постоянной длины');
  /* Life Fitness Club Series+, Prime Front-Drive Elliptical: шаг 20″ = 51 см */
  assert(r.stride >= 50 && r.stride <= 52.5, `шаг ${r.stride} см`);
  assert(slip(r) <= .3, `стопа или кисть по детали ${slip(r)} см`);
});

test('mech: stepper — parallelogram on the frame axle, level pedals, damper rod strokes inside its body', () => {
  const r = one('stairs', 'степпер');
  assert(r.linkJoin <= .01, `конец тяги от оси ${r.linkJoin} см`);
  assert(r.lever[1] - r.lever[0] <= .01 && r.link[1] - r.link[0] <= .01 && Math.abs(r.link[0] - r.lever[0]) <= .01 && r.parallel <= .1, 'параллелограмм');
  assert(r.level <= .1, `площадка ${r.level}°`);
  assert(r.damperStroke >= 5, `ход штока ${r.damperStroke} см — демпфер поперёк хода`);
  assert(slip(r) <= .2);
});

test('mech: treadmill — the stance foot rides the belt evenly at one belt speed', () => {
  const r = one('treadmill', 'дорожка');
  assert.equal(r.feet.length, 2);
  for (const q of r.feet) assert(q.slip <= LIM.belt && Math.max(Math.abs(q.y[0]), Math.abs(q.y[1])) <= LIM.beltY, `${q.body}: ${q.slip} см`);
  assert(r.speedDiff <= LIM.beltSpeed);
});

test('mech: rower — chain from the housing guide, straight handle path, seat on the monorail, legs → body → arms', () => {
  const r = one('rower', 'гребной');
  assert(r.exitOff <= .01 && r.pathDev <= 1 && r.square <= 1, `путь рукояти ${r.pathDev} см`);
  assert(Math.max(-r.seatWheel[0], r.seatWheel[1]) <= .01 && r.seatOut > 0, 'сиденье на рельсе');
  assert(r.order.legs < r.order.body && r.order.body < r.order.arms, JSON.stringify(r.order));
  assert(r.rigid.every(q => q.d <= .01), 'рукоять жёсткая');
});

test('mech: sleds run along their rails at the real angle; the body point stays on the line of travel', () => {
  const angle = { hacksquat: 45, legpress: 45, legpresshigh: 45, legpresslow: 45, lpcalf: 45, standcalf: 90 };
  for (const [id, a] of Object.entries(angle)) {
    const r = one(id, 'каретка');
    assert(Math.abs(r.angle - a) <= .1, `${id}: ${r.angle}°`);
    assert(r.lineDev <= .1 && !r.clamp, `${id}: от линии ${r.lineDev} см, упоров ${r.clamp}`);
  }
});

test('mech: Smith — vertical rails, bar on the rail axis and in the hands, hooks for the catches', () => {
  for (const id of ['smithsquat', 'smithbench', 'smithincline', 'smithohp']) {
    const r = one(id, 'Смит');
    assert(Math.abs(r.railAngle - 90) <= .01 && r.barTilt <= .01 && r.barLine <= .01, id);
    assert(r.gripAxis <= LIM.barAxis && r.hooks === 2, `${id}: хват ${r.gripAxis} см, крюков ${r.hooks}`);
  }
});

test('mech: levers turn about real axes; pec deck arms are rigid; landmine hook stays put; ab wheel rolls without slip', () => {
  for (const r of rows.filter(r => r.type === 'рычаг' || r.type === 'параллелограмм')) assert(r.radiusDev <= LIM.lever && r.alongDev <= LIM.leverAlong, `${r.id} ${r.part}: радиус ±${r.radiusDev}, вдоль оси ${r.alongDev} см`);
  for (const r of rows.filter(r => r.type === 'рычаг «бабочки»')) assert(r.gripRadius[1] - r.gripRadius[0] <= .1 && r.rigid.every(q => q.d <= .01), `${r.id} ${r.part}`);
  const lm = one('tbarrow', '«мина»');
  assert(lm.hookDist[1] - lm.hookDist[0] <= .2 && lm.plane <= .1);
  const w = one('rollout', 'колесо');
  assert(w.roll != null && w.roll <= .1 && w.path > 50, `качение ${w.roll} см на пути ${w.path}`);
  assert(Math.max(-w.gap[0], w.gap[1]) <= LIM.floor);
});

/* подвижные типы инвентаря (BIND), которые не входят в этот аудит, — с причиной */
const ELSEWHERE = {
  cable: 'тросы — cable-audit.js', g3cable: 'тросы — cable-audit.js', g3line: 'тросы — cable-audit.js', band: 'эспандеры — cable-audit.js',
  g3band: 'эспандеры — cable-audit.js', g4camCable: 'рычажные стеки — cable-audit.js, lever-stacks.test.js',
  barbell: 'свободный снаряд в руках (hand-holds, holds-audit.js)', dumbbell: 'свободный снаряд в руках', kettlebell: 'свободный снаряд в руках',
  g2CupDumbbell: 'свободный снаряд в руках', g2KbHorns: 'свободный снаряд в руках', g1BarPad: 'подушка на грифе в руках',
  restingBarbell: 'неподвижный гриф на опоре', restingDumbbell: 'неподвижная гантель на опоре',
  g3towelRoll: 'валик полотенца у тела', homeTowel: 'полотенце в руках', homeTowelFoot: 'полотенце в руках и под стопой', towel: 'полотенце в руках',
  rowerSeat: 'вместе с rowerChain (узел «гребной»)'
};
const AUDITED = ['bikeCrank', 'ellipticalLinks', 'stepPedals', 'rowerChain', 'g4sled', 'sled', 'g4lever', 'lever', 'g4link', 'pecArm', 'smithBar', 'g1LandmineBar', 'abWheel'];
test('mech: every moving equipment type in the catalog is audited here or listed with a reason', () => {
  const used = new Set(Object.entries(POSES).filter(([id]) => !id.startsWith('_')).flatMap(([, e]) => (e.equipment || []).map(q => q.type)).filter(t => EQ.BIND[t]));
  const missing = [...used].filter(t => !AUDITED.includes(t) && !ELSEWHERE[t]);
  assert.deepEqual(missing, [], 'подвижный тип без аудита');
  for (const t of AUDITED) if (used.has(t)) assert(rows.some(r => r.equipment.includes(t)), `${t}: нет строк аудита`);
});
