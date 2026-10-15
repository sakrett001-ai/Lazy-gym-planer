'use strict';
/* Хваты: кисть держит снаряд так, как у живого человека, — ручка в кулаке, ладонь на снаряде, трос мимо кисти.
   Найдено аудитом хватов (tools/mannequin/holds-audit.js) после жалобы владельца на гоблет («рука мимо гантели»):
   кулаки без гантелей сжаты вокруг невидимой рукояти, канат идёт поперёк кулака сквозь ладонь, лента эспандера и стремя
   D-рукояти — сквозь пальцы, рукоять гири — под пальцами, свободная ладонь висит над коленом. Здесь — каждый исправленный хват. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const M = require('../src/js/09bm-mannequin.js');
const EQ = require('../src/js/09bn-equipment.js');
const POSES = require('../src/js/09bp-poses.js');
const { checkClip, collider } = require('./biomech/validator2.js');
const { V } = M;
const none = () => false, N = 21, ts = Array.from({ length: N }, (_, i) => i / (N - 1));
const RULES = ['contact', 'hold', 'cable', 'penetration', 'rom'];
const bad = (e, has) => checkClip(EQ.rig(e), { ...e, has }, { samples: N }).filter(i => RULES.includes(i.rule));
const segDist = (p, a, b) => { const ab = V.sub(b, a), k = M.clamp(V.dot(V.sub(p, a), ab) / V.dot(ab, ab), 0, 1); return V.dist(p, V.add(a, ab, k)); };
const angleTo = (a, b) => { const x = V.angle(a, b); return Math.min(x, 180 - x); };

test('optional dumbbells: without them the hands hang relaxed, with them the fists hold the handles', () => {
  for (const [id, sides] of [['sllift', ['R']], ['stepup', ['L', 'R']], ['bulgarian', ['L', 'R']], ['lunge', ['L', 'R']], ['revlunge', ['L', 'R']], ['calfraise', ['L', 'R']]]) {
    const e = POSES[id], db = k => k === 'db';
    assert(e.variants?.db, id + ': the dumbbell pose is a variant');
    assert.equal(EQ.variantOf(e, none), null); assert.equal(EQ.variantOf(e, db), 'db');
    const bare = EQ.rig(EQ.variantEntry(e, none)), held = EQ.rig(EQ.variantEntry(e, db));
    for (const t of ts) {
      const A = bare(t), B = held(t);
      for (const s of sides) {
        assert.equal(A.hands[s], 'relaxed', `${id} t=${t}: no dumbbell — no clenched fist round an invisible handle`);
        assert.equal(B.hands[s], 'grip', `${id} t=${t}: the dumbbell is held in the fist`);
      }
      /* тело в вариантах одно и то же — меняются только кисти (метки нагрузки и равновесие совпадают) */
      for (const k of ['hip', 'shL', 'elL', 'wrR', 'knL', 'anR', 'head']) assert(V.dist(A[k], B[k]) < 1e-9, `${id} t=${t}: ${k} the same in both variants`);
    }
    assert.deepEqual(bad({ ...EQ.variantEntry(e, none), contacts: e.contacts.map(c => ({ ...c, optional: true })) }, none), [], id + ' without dumbbells');
    assert.deepEqual(bad(EQ.variantEntry(e, db), db), [], id + ' with dumbbells');
  }
});

test('ropes run through each fist along its axis, the knob sits past the fist edge', () => {
  /* где узел каната: 'pinky' — за мизинцем (ветвь входит у большого пальца), 'thumb' — за большим пальцем */
  const KNOB = { ropepushdown: 'pinky', ropecurl: 'thumb', facepull: 'pinky', cablecrunch: 'thumb', cableohext: 'pinky', cablewood: 'pinky', pullthrough: 'thumb' };
  for (const [id, knob] of Object.entries(KNOB)) {
    const e = POSES[id], rig = EQ.rig(e);
    assert.equal(e.equipment.find(q => q.attach === 'rope').knob, knob, id);
    for (const t of ts) {
      const R = rig(t);
      for (const s of ['L', 'R']) {
        const g = R['grip' + s], z = V.unit(R.frames['hand' + s].z), rope = R.props.find(p => p.id === 'cab:rope' + s), ball = R.props.find(p => p.id === 'cab:knob' + s);
        /* отрезок каната через центр хвата идёт по оси кулака */
        const i = rope.pts.findIndex((p, j) => j > 0 && segDist(g, rope.pts[j - 1], p) < .05);
        assert(i > 0, `${id} t=${t} ${s}: the rope passes through the centre of the fist`);
        assert(angleTo(z, V.sub(rope.pts[i], rope.pts[i - 1])) < 1, `${id} t=${t} ${s}: the rope lies along the fist, not across it`);
        /* узел — за краем кулака на своей стороне (мизинец — против оси z кисти) */
        const along = V.dot(V.sub(ball.c, g), z);
        assert(knob === 'pinky' ? along < -5 : along > 5, `${id} t=${t} ${s}: knob past the ${knob} edge (${along.toFixed(1)} cm)`);
      }
    }
    assert.deepEqual(bad(e), [], id);
  }
});

test('kettlebell swing: the handle runs through the centres of both fists', () => {
  const e = POSES.kbswing, rig = EQ.rig(e);
  for (const t of ts) {
    const R = rig(t), h = R.props.filter(p => p.kind === 'kettlebell').flatMap(collider).find(c => c.part === 'handle');
    for (const s of ['L', 'R']) assert(segDist(R['grip' + s], ...h.axis) < .3, `kbswing t=${t} ${s}: handle in the fist (${segDist(R['grip' + s], ...h.axis).toFixed(2)} cm)`);
  }
  assert.deepEqual(bad(e), []);
});

test('D-handles and band handles: the stirrup goes round the hand, the cable and the band clip onto its ring', () => {
  const D = { cablefly: ['L', 'R'], cablelowfly: ['L', 'R'], cablelat: ['R'], cableextrot: ['R'] };
  const BAND = { bandlatraise: ['L', 'R'], bandcurl: ['L', 'R'], bandpushdown: ['L', 'R'], bandfacepull: ['L', 'R'], bandextrot: ['R'], bandrow: ['L', 'R'] };
  for (const [id, sides] of Object.entries({ ...D, ...BAND })) {
    const e = POSES[id], rig = EQ.rig(e);
    for (const t of ts) {
      const R = rig(t);
      for (const s of sides) {
        const g = R['grip' + s], z = V.unit(R.frames['hand' + s].z);
        const frame = D[id] ? R.props.find(p => p.id === (sides.length > 1 ? 'cab' + s : 'cab') + ':d') : R.props.find(p => p.id === 'band:strap' + s);
        const line = D[id] ? R.props.find(p => p.id === (sides.length > 1 ? 'cab' + s : 'cab') + ':line') : R.props.find(p => p.id === 'band:' + s);
        const ring = frame.pts[2];
        /* кольцо стремени — поперёк рукояти, трос или лента приходит именно к нему */
        assert(Math.abs(V.dot(V.unit(V.sub(ring, g)), z)) < .02, `${id} t=${t} ${s}: the ring stands across the handle`);
        assert(V.dist(D[id] ? line.pts.at(-1) : line.pts.at(-1), ring) < .01, `${id} t=${t} ${s}: the cable ends at the ring`);
      }
    }
    /* стремя, трос и лента не проходят сквозь кисть и запястье (validator2, правило cable у хвата) */
    assert.deepEqual(bad(e), [], id);
  }
});

test('concentration curl: the free palm rests on the right thigh above the knee', () => {
  const rig = EQ.rig(POSES.concentration);
  for (const t of ts) {
    const R = rig(t), f = R.frames.handR, n = V.scale(f.x, 1), palm = V.add(V.add(f.o, f.x, 1.7), f.y, -5.6), gap = M.limbSDF(R, 'th', 'R', palm);
    assert.equal(R.hands.R, 'flat');
    assert(gap < 1 && gap > -1.5, `t=${t}: palm on the thigh (${gap.toFixed(1)} cm)`);
    assert(n[1] > .8, `t=${t}: palm faces down onto the thigh`);
  }
});
