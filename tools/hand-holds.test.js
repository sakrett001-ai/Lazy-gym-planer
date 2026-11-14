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
  const BAND = { bandlatraise: ['L', 'R'], bandcurl: ['L', 'R'], bandpushdown: ['L', 'R'], bandfacepull: ['L', 'R'], bandextrot: ['R'], bandrow: ['L', 'R'], bandlatpull: ['L', 'R'], bandfloorpress: ['L', 'R'], bandfly: ['L', 'R'] };
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

test('kettlebell in one hand: the bell hangs, flies along the arm or rests on the back of the forearm — never through the arm', () => {
  const { auditEntry } = require('./mannequin/holds-audit.js');
  const bell = (id, e = POSES[id]) => auditEntry(id, e, { samples: N }).filter(r => r.kind === 'гиря');
  const want = { kbswing1: 'висит, по руке', kbclean: 'висит, по руке, на предплечье', kbpress: 'на предплечье', kbfrontsquat: 'на предплечье', kbrow: 'висит, по руке', kbfloorpress: 'на предплечье' };
  /* этап 2: у «мельницы» есть предупреждение по задней поверхности бедра (правая нога внизу) — к хвату оно не относится,
     поэтому у них валидатор — по правилам хвата и подвижности руки */
  const want2 = { kbsnatch: 'по руке, висит, на предплечье', kbsllift: 'висит', kbwindmill: 'на предплечье' };
  const arm = i => i.rule !== 'rom' || /плечо|локоть|предплечье|запястье/.test(i.detail);
  for (const [id, pos] of Object.entries({ ...want, ...want2 })) {
    const rows = bell(id);
    assert.equal(rows.length, 1, id + ': one kettlebell row');
    assert.deepEqual(rows[0].flags, [], id);
    assert.deepEqual(rows[0].pos.split(', ').sort(), pos.split(', ').sort(), id + ': bell positions');
    assert.deepEqual(want[id] ? bad(POSES[id]) : bad(POSES[id]).filter(arm), [], id + ': validator');
  }
  /* farmer's walk with kettlebells: both bells hang */
  assert.deepEqual(auditEntry('farmer', POSES.farmer, { samples: N }).filter(r => r.kind === 'гиря').map(r => [r.pos, r.flags.length]), [['висит', 0], ['висит', 0]]);
  /* the audit catches what it must: without the rest on the forearm the bell of the rack hangs through the arm;
     a bell flying «along the arm» of a pressing arm stands above the handle with no support */
  const swap = (id, o) => ({ ...POSES[id], equipment: POSES[id].equipment.map(q => q.type === 'kettlebell' ? { ...q, ...o } : q) });
  /* (жим лёжа: с глубоким хватом шар «рэка» без опоры уходит уже в корпус, а не в руку — это ловится тем же правилом) */
  assert(bell('kbfloorpress', swap('kbfloorpress', { rest: false }))[0].flags.some(f => /шар гири в (предплечье|кисть|плечо)/.test(f)), 'bell through the forearm');
  assert(bell('kbfrontsquat', swap('kbfrontsquat', { rest: false }))[0].flags.some(f => /шар гири в (предплечье|кисть|плечо|корпус)/.test(f)), 'rack bell through the body');
  assert(bell('kbpress', swap('kbpress', { rest: false, hang: 'arm' }))[0].flags.some(f => /выше рукояти без опоры/.test(f)), 'bell above the handle');
  /* …and a bell lying on the palm side of the forearm: the ball of the press mirrored from the back of the forearm to the
     palm side and moved onto the forearm until it touches (0,2 cm) */
  EQ.BIND.kbPalmSide = (e, R) => EQ.BIND.kettlebell(e, R).map(p => {
    const back = V.scale(R.frames.handL.x, M.SIGN.L), d = V.sub(p.c, p.grip), c = V.add(p.grip, V.sub(d, V.scale(back, 2 * V.dot(d, back))));
    const ab = V.sub(R.elL, R.wrL), axis = V.add(R.wrL, ab, M.clamp(V.dot(V.sub(c, R.wrL), ab) / V.dot(ab, ab), 0, 1));
    return { ...p, c: V.add(c, V.unit(V.sub(axis, c)), M.limbSDF(R, 'fa', 'L', c) - p.radius + .2) };
  });
  try {
    const flags = bell('kbpress', swap('kbpress', { type: 'kbPalmSide' }))[0].flags;
    assert(flags.some(f => /на ладонной стороне предплечья/.test(f)), 'bell on the palm side: ' + JSON.stringify(flags));
  } finally { delete EQ.BIND.kbPalmSide; }
  /* the handle sits on the bell at the height of a competition kettlebell: 28.2 cm tall, Ø 21 */
  const kb = EQ.rig(POSES.kbdeadlift)(0).props.find(p => p.kind === 'kettlebell');
  assert(Math.abs(kb.handleUp + EQ.KB.handleR + kb.bottom - 28.2) < .05 && kb.radius === 10.5);
  /* flat base Ø 14: the sphere is cut at √(r² − 7²) below its centre */
  assert(Math.abs(kb.radius ** 2 - kb.bottom ** 2 - 49) < .2);
  assert(Math.abs(M.FLOOR - kb.c[1] - kb.bottom) < .3, 'the bell of the deadlift stands on the floor at the start');
});

test('kettlebell turn (snatch, clean): the bell goes round the hand outside, frame by frame of the player, both ways', () => {
  const { auditEntry, LIM } = require('./mannequin/holds-audit.js');
  const row = (id, e) => auditEntry(id, e, { samples: N }).find(r => r.kind === 'гиря');
  for (const id of ['kbsnatch', 'kbclean']) {
    const e = POSES[id], kb = e.equipment.find(q => q.type === 'kettlebell');
    assert.equal(kb.hang, 'turn', id + ': the bell turns round the hand (BIND.kettlebell, hang turn)');
    assert(e.keys.every(k => Number.isFinite(k.bell?.L)), id + ': every key carries the bell angle');
    /* the bell angle grows monotonically: along the arm in the swing, over the back of the hand, onto the forearm */
    for (let i = 1; i < e.keys.length; i++) assert(e.keys[i].bell.L >= e.keys[i - 1].bell.L - 1e-9, `${id}: bell angle monotone at t=${e.keys[i].t}`);
    const r = row(id, e), b = r.player;
    assert.deepEqual(r.flags, [], id);
    /* the player: up, hold at the top, the drop played back, the pause — 60 frames a second (anim.timing of the catalog) */
    assert(b && b.frames > 140, id + ': player frames ' + b?.frames);
    assert(Math.abs(b.jump) <= LIM.bellJump && b.sweep <= LIM.bellBody && b.swing <= LIM.bellSwing, `${id}: ${JSON.stringify(b)}`);
  }
  /* the audit catches what was wrong in 4.102.0 (the bell placed frame by frame, without history: on the drop it snapped
     through the arm in one frame — snatch 99° at 69 % of the rep, the path through the arm 13.3 cm; clean 148°, the bell
     lying on top of the hanging forearm at 72 %): the same frame-by-frame model on today's poses — a hanging bell resting
     on the forearm where it hits it */
  const swap = (id, o) => ({ ...POSES[id], equipment: POSES[id].equipment.map(q => q.type === 'kettlebell' ? { ...q, ...o } : q) });
  const old = row('kbsnatch', swap('kbsnatch', { hang: 'gravity', rest: true })).flags;
  assert(old.some(f => /скачок шара/.test(f)) && old.some(f => /проходит сквозь руку/.test(f)), 'snatch, frame-by-frame bell: ' + JSON.stringify(old));
  assert(row('kbclean', swap('kbclean', { hang: 'gravity', rest: true })).flags.some(f => /скачок шара/.test(f)), 'clean, frame-by-frame bell');
  /* …a bell lying on the back of the forearm the whole rep (also on the hanging arm in the swing): against the pendulum */
  for (const id of ['kbsnatch', 'kbclean']) {
    const on = { ...POSES[id], keys: POSES[id].keys.map(k => ({ ...k, bell: { L: 150 } })) };
    assert(row(id, on).flags.some(f => /против маятника/.test(f)), id + ': bell resting on a hanging arm');
    /* …and a step in the angle between two keys: a jump */
    const step = { ...POSES[id], keys: POSES[id].keys.map(k => ({ ...k, bell: { L: k.t < .7 ? 0 : 150 } })) };
    assert(row(id, step).flags.some(f => /скачок шара/.test(f)), id + ': bell snapping round the handle');
  }
  /* the swing along the arm is a swing (hang arm: the arm and the bell are one chain), not «against the pendulum» */
  assert.equal(row('kbswing1', POSES.kbswing1).player.swing, 0);
});

test('kettlebell turn: the timing the audit plays is the timing of the catalog (anim.timing)', () => {
  const { loadModel } = require('./biomechanics-audit'), m = loadModel({ fullApp: true });
  m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
  const { EXI } = m.get('({EXI})');
  for (const id of ['kbsnatch', 'kbclean', 'kbswing1']) assert(Array.isArray(EXI[id].anim.timing) && EXI[id].anim.timing.length === 4, id);
});
