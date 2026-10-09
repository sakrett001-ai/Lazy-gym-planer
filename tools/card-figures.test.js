'use strict';
/* Карточки плана: рамка кадра SVG-фигуры считается один раз (и по частям, в простое) и хранится между запусками
   той же сборки; рисунок от этого не меняется. В движении — только карточка, на которую смотрят, 30 кадров в секунду. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
/* счётчики id градиентов и стрелок растут с каждой фигурой — для сравнения разметки их убираем */
const norm = s => s.replace(/athlete-\d+-/g, 'athlete-N-').replace(/vec-arrow-\d+-/g, 'vec-arrow-N-');

function svgModel({ stored = null, build = 'build-a' } = {}) {
  const dom = new JSDOM('<html><body></body></html>', { runScripts: 'outside-only', url: 'https://lazy-gym.test/' });
  if (stored) dom.window.localStorage.setItem('podhod.frames.v1', stored);
  dom.window.PODHOD_BUILD = build;
  const dir = path.join(__dirname, '../src/js'), files = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && parseInt(f) < 11).sort();
  dom.window.eval(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') +
    '\nwindow.api={EX,buildFigure,figureFrameJob,SPATIAL_FRAMES,spatialFrameGet,spatialFramesFlush,Mannequin};');
  return dom;
}
const markup = (fig, ts) => ts.map(t => { fig.at(t, { index: t < .5 ? 0 : 2 }); return norm(fig.svg.outerHTML); });
/* видимая разметка без учёта порядка атрибутов: узел, переиспользованный под другую деталь, хранит свой порядок,
   а погасшие метки суставов остаются скрытыми узлами */
const canon = node => node.nodeType === 3 ? node.nodeValue : node.nodeType !== 1 || node.getAttribute('display') === 'none' ? '' :
  `<${node.tagName} ${[...node.attributes].map(a => a.name + '=' + norm(a.value)).sort().join(' ')}>${[...node.childNodes].map(canon).join('')}</${node.tagName}>`;
const drawing = (fig, t) => { fig.at(t, { index: t < .5 ? 0 : 2 }); return canon(fig.svg); };

test('framing points are exactly the surface rows the frame was computed from', () => {
  const dom = svgModel();
  try {
    const { EX, Mannequin } = dom.window.api;
    for (const [id, t] of [['squat', .4], ['bbbench', .9], ['latpull', 0], ['pushup', .6]]) {
      const R = EX.find(e => e.id === id).anim.catalogRig(t), S = Mannequin.surface(R), B = Mannequin.boundsSurface(R);
      assert.deepEqual(plain(B.torso), plain(S.torso), id + ' torso');
      for (const k of Object.keys(S.limbs))
        assert.deepEqual(plain(B.limbs[k]), plain(S.limbs[k].filter((_, i) => i % 3 === 0 || i === S.limbs[k].length - 1)), id + ' ' + k);
    }
  } finally { dom.window.close(); }
});

test('the frame is computed once per exercise, camera and proportion; the drawing is the same', () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, SPATIAL_FRAMES } = dom.window.api;
    for (const id of ['bbbench', 'squat', 'latpull', 'pushup', 'dbcurl']) {
      const ex = EX.find(e => e.id === id), before = SPATIAL_FRAMES.size;
      const a = buildFigure(ex.anim, { ratio: 1, t: 0, muscles: true });
      assert.equal(SPATIAL_FRAMES.size, before + 1, id + ' frame stored');
      const b = buildFigure(ex.anim, { ratio: 1, t: 0, muscles: true });
      assert.equal(SPATIAL_FRAMES.size, before + 1, id + ' second figure reuses the frame');
      assert.deepEqual(markup(b, [0, .37, .8, 1]), markup(a, [0, .37, .8, 1]), id + ' same drawing');
      /* кадр после проигрывания (атрибуты обновляются только изменившиеся) — тот же, что у новой фигуры в этой фазе */
      const fresh = buildFigure(ex.anim, { ratio: 1, t: .8, muscles: true });
      assert.equal(drawing(fresh, .8), drawing(a, .8), id + ' incremental update equals a fresh drawing');
      buildFigure(ex.anim, { ratio: 1.25, t: 0 }); buildFigure(ex.anim, { ratio: 1, t: 0, camera: 'front' });
      assert.equal(SPATIAL_FRAMES.size, before + 3, id + ' proportion and camera have their own frames');
    }
  } finally { dom.window.close(); }
});

test('a frame computed in small steps equals the frame of a full build', () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, figureFrameJob, SPATIAL_FRAMES } = dom.window.api;
    for (const id of ['squat', 'cablefly', 'hipthrust']) {
      const ex = EX.find(e => e.id === id);
      buildFigure(ex.anim, { ratio: 1, t: 0 });
      const key = [...SPATIAL_FRAMES.keys()].find(k => k.startsWith(id + '|')), full = plain(SPATIAL_FRAMES.get(key));
      SPATIAL_FRAMES.clear();
      const job = figureFrameJob(ex.anim, { ratio: 1 });
      assert.equal(job.done, false);
      let steps = 1; while (!job.step(3)) steps++;
      assert.equal(steps, 14, '41 positions by three');
      assert.deepEqual(plain(SPATIAL_FRAMES.get(key)), full, id);
      assert.equal(figureFrameJob(ex.anim, { ratio: 1 }).done, true, 'known frame is not recomputed');
    }
  } finally { dom.window.close(); }
});

test('frames survive a restart of the same build and are dropped for another build', () => {
  const first = svgModel();
  let stored, key, drawing;
  try {
    const { EX, buildFigure, SPATIAL_FRAMES, spatialFramesFlush } = first.window.api;
    const fig = buildFigure(EX.find(e => e.id === 'squat').anim, { ratio: 1, t: 0, muscles: true });
    drawing = markup(fig, [0, .5]);
    key = [...SPATIAL_FRAMES.keys()][0];
    spatialFramesFlush();
    stored = first.window.localStorage.getItem('podhod.frames.v1');
    assert.equal(JSON.parse(stored).build, 'build-a');
  } finally { first.window.close(); }
  const again = svgModel({ stored });
  try {
    const { EX, buildFigure, SPATIAL_FRAMES, spatialFrameGet } = again.window.api;
    assert(spatialFrameGet(key), 'frame restored');
    const size = SPATIAL_FRAMES.size;
    const fig = buildFigure(EX.find(e => e.id === 'squat').anim, { ratio: 1, t: 0, muscles: true });
    assert.equal(SPATIAL_FRAMES.size, size, 'nothing recomputed');
    assert.deepEqual(markup(fig, [0, .5]), drawing, 'same drawing from the stored frame');
  } finally { again.window.close(); }
  const broken = svgModel({ stored: JSON.stringify({ build: 'build-a', frames: { [key]: { viewBox: 1 } } }) });
  try { assert.equal(broken.window.api.spatialFrameGet(key), null, 'a damaged record is ignored'); }
  finally { broken.window.close(); }
  const other = svgModel({ stored, build: 'build-b' });
  try { assert.equal(other.window.api.spatialFrameGet(key), null, 'another build ignores old frames'); }
  finally { other.window.close(); }
});

function cards() {
  const m = loadModel({ fullApp: true });
  m.get(`innerWidth=390;innerHeight=800;
    figs=[-100,300,800].map((top,i)=>({card:true,f:{at(){}},seen:0,paused:false,clock:0,durations:[1000,0,1000,0],
      btn:{getBoundingClientRect:()=>({top,height:300})}}));`);
  return { m, active: () => plain(m.get('figs.map(F=>!!F.active)')) };
}
test('only the card being looked at moves: one on a phone, two on a wide screen', () => {
  const { m, active } = cards();
  m.get('figs[0].seen=.6;figs[1].seen=1;figs[2].seen=0;pickActiveCards()');
  assert.deepEqual(active(), [false, true, false], 'the most visible card');
  m.get('innerWidth=1280;pickActiveCards()');
  assert.deepEqual(active(), [true, true, false], 'two on a wide screen');
  m.get('innerWidth=390;figs[1].paused=true;pickActiveCards()');
  assert.deepEqual(active(), [true, false, false], 'a paused card gives its turn to the next one');
  m.get('figs[1].paused=false;figs[0].seen=1;figs[1].seen=1;pickActiveCards()');
  assert.deepEqual(active(), [false, true, false], 'equally visible: the one nearer the middle of the screen');
  m.get('figs[0].pick=5;pickActiveCards()');
  assert.deepEqual(active(), [true, false, false], 'the card just started with «Play» wins');
  m.get('figs[0].seen=.2;pickActiveCards()');
  assert.deepEqual(active(), [false, true, false], '…but not once it has mostly scrolled away');
  m.get('figs[0].seen=1;figs[2].hover=true;pickActiveCards()');
  assert.deepEqual(active(), [true, false, true], 'the card under the mouse moves too');
  m.get('figs[2].hover=false;figs[0].f=null;pickActiveCards()');
  assert.deepEqual(active(), [false, true, false], 'a card without a built figure never counts');
});
test('cards are painted at 30 frames per second while their clock runs every frame', () => {
  const { m } = cards();
  m.get(`figs[1].seen=1;pickActiveCards();for(const F of figs)F.vis=true;
    window.__paints=[0,0,0];paintMotion=F=>{window.__paints[figs.indexOf(F)]++;};
    requestAnimationFrame=cb=>{window.__raf=cb;return 1;};scheduleMotionLoop();
    for(let k=0;k<=60;k++)window.__raf(k*1000/60);`);
  const [paints, clock] = plain(m.get('[window.__paints,figs.map(F=>Math.round(F.clock))]'));
  assert.deepEqual([paints[0], paints[2]], [0, 0], 'cards out of focus stand still');
  assert(paints[1] >= 29 && paints[1] <= 31, 'about 30 paints in a second: ' + paints[1]);
  assert.equal(clock[1], 1000, 'the motion keeps real time');
});
