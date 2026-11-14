'use strict';
/* Гиря: поза между ключами. Валидатор смотрит 41 кадр повтора, а приложение проигрывает позу в любой момент: углы
   плеча у руки «прямо вверх по оси корпуса» вырождаются, и между соседними ключами рука может дёрнуться, хотя на
   кадрах валидатора всё ровно (так было в «мельнице» до отвода руки от вертикали — 25 см за 1/800 повтора).
   Здесь — 800 отсчётов повтора у всех упражнений с гирей: ни одна точка руки, ноги и головы и центр шара гири в одной руке
   не сдвигаются за отсчёт больше чем на STEP см (самое быстрое — шар в рывке, 0,74 см; тело — запястье в рывке, 0,46). */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js'), { V } = M;
const EQ = require('../src/js/09bn-equipment.js');
const POSES = require('../src/js/09bp-poses.js');
const N = 800, STEP = 1.5, KEYS = ['wrL', 'elL', 'wrR', 'elR', 'knL', 'knR', 'anL', 'anR', 'head'];
const IDS = Object.keys(POSES).filter(id => (POSES[id].equipment || []).some(q => q.type === 'kettlebell' || q.type === 'g2KbHorns'));
/* и шар гири в одной руке (центр): переворот вокруг кисти — без скачка между отсчётами */
const bell = R => R.props.find(p => p.kind === 'kettlebell' && p.mount === 'hands' && !R.props.some(q => q.id === p.id + ':hornL'))?.c;
const worst = rig => { let prev = null, pb = null, w = { d: 0 }; for (let i = 0; i <= N; i++) { const t = i / N, R = rig(t), b = bell(R); if (prev) { for (const k of KEYS) { const d = V.dist(R[k], prev[k]); if (d > w.d) w = { d, t, k }; } if (b && pb) { const d = V.dist(b, pb); if (d > w.d) w = { d, t, k: 'шар гири' }; } } prev = R; pb = b; } return w; };

test('kettlebell exercises move smoothly between the baked keys', () => {
  assert(IDS.length >= 13, 'kettlebell exercises: ' + IDS.join(' '));
  for (const id of IDS) for (const has of [() => true, () => false]) {
    const w = worst(EQ.rig(EQ.variantEntry(POSES[id], has)));
    assert(w.d < STEP, `${id}: ${w.k} moves ${w.d.toFixed(2)} cm in 1/${N} of a rep at t=${w.t.toFixed(4)}`);
  }
});

test('the smoothness check catches a pose that snaps between two keys', () => {
  const e = POSES.kbwindmill, i = e.keys.findIndex(k => k.t > .3), keys = e.keys.map((k, j) => j === i ? { ...k, v: k.v.map((x, n) => x + (n > 13 && n < 40 ? 40 : 0)) } : k);
  assert(worst(EQ.rig({ ...e, keys })).d > STEP);
});
