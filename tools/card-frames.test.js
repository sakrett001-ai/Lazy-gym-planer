'use strict';
/* Карточки плана: готовые кадры SVG запоминаются (FIGURE_FRAMES): со второго круга повторения кадр берётся из памяти,
   рисунок тот же, что у кадра, посчитанного заново. Ключи, вытеснение по объёму, сброс, сетка часов карточки. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs'), path = require('path');
const { JSDOM } = require('jsdom');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
const norm = s => s.replace(/athlete-\d+-/g, 'athlete-N-').replace(/vec-arrow-\d+-/g, 'vec-arrow-N-');
/* видимая разметка без учёта порядка атрибутов (как в card-figures.test.js) */
const canon = node => node.nodeType === 3 ? node.nodeValue : node.nodeType !== 1 || node.getAttribute('display') === 'none' ? '' :
  `<${node.tagName} ${[...node.attributes].map(a => a.name + '=' + norm(a.value)).sort().join(' ')}>${[...node.childNodes].map(canon).join('')}</${node.tagName}>`;

function svgModel() {
  const dom = new JSDOM('<html lang="ru"><body></body></html>', { runScripts: 'outside-only', url: 'https://lazy-gym.test/' });
  const dir = path.join(__dirname, '../src/js'), files = fs.readdirSync(dir).filter(f => /^\d.*\.js$/.test(f) && parseInt(f) < 11).sort();
  dom.window.eval(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n') +
    '\nwindow.api={EX,buildFigure,FIGURE_FRAMES,FIGURE_FRAMES_LIMIT,figureFramesReset,bytes:()=>figureFramesBytes};');
  return dom;
}
/* фазы одного круга повторения (как у карточки: подъём, пауза, опускание) */
const PHASES = [[0, 0], [.13, 0], [.5, 0], [.91, 0], [1, 1], [.77, 2], [.3, 2], [0, 3]];
const play = (fig, phases = PHASES) => phases.map(([t, index]) => { fig.at(t, { index, t }); return canon(fig.svg); });

test('a cached frame draws exactly what a freshly computed frame draws, in every phase and on later circles', () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, FIGURE_FRAMES } = dom.window.api;
    for (const id of ['latpulluh', 'squat', 'goblet', 'plank', 'bike', 'hipthrust']) {
      const anim = EX.find(e => e.id === id).anim;
      const cached = buildFigure(anim, { ratio: 1, t: 0, muscles: true, frameCache: true });
      const first = play(cached), sizes = [...FIGURE_FRAMES.values()].map(s => s.frames.size);
      const second = play(cached);
      assert.deepEqual([...FIGURE_FRAMES.values()].map(s => s.frames.size), sizes, id + ': the second circle computes nothing new');
      const fresh = buildFigure(anim, { ratio: 1, t: 0, muscles: true });
      const reference = play(fresh);
      assert.deepEqual(first, reference, id + ': first circle = fresh figure');
      assert.deepEqual(second, reference, id + ': circle from memory = fresh figure');
      /* кадр в новой фигуре из памяти — как у новой фигуры без памяти (градиенты атлета — свои у каждой фигуры) */
      for (const [t, index] of [[.5, 0], [.77, 2]]) {
        const a = buildFigure(anim, { ratio: 1, t, muscles: true, frameCache: true }), b = buildFigure(anim, { ratio: 1, t, muscles: true });
        a.at(t, { index }); b.at(t, { index });
        assert.equal(norm(a.svg.outerHTML), norm(b.svg.outerHTML), id + ' at ' + t);
        assert.notEqual(a.svg.querySelector('defs linearGradient').id, b.svg.querySelector('defs linearGradient').id);
        assert(!a.svg.outerHTML.includes('\u0001'), 'colour marks never reach the drawing');
      }
    }
  } finally { dom.window.close(); }
});

test('keys: exercise, camera, proportion, visible equipment and pose variant; phase inside a set', () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, FIGURE_FRAMES } = dom.window.api, anim = id => EX.find(e => e.id === id).anim;
    buildFigure(anim('squat'), { ratio: 1, t: 0, frameCache: true });
    buildFigure(anim('squat'), { ratio: 1, t: 0, frameCache: true });
    assert.equal(FIGURE_FRAMES.size, 1, 'two cards of one exercise share a set');
    buildFigure(anim('squat'), { ratio: 1, t: 0, camera: 'front', frameCache: true });
    buildFigure(anim('squat'), { ratio: 1.25, t: 0, frameCache: true });
    assert.equal(FIGURE_FRAMES.size, 3, 'camera and proportion');
    /* гоблет: гиря (кулаки за рожки) или гантель (ладони под диском) — разные позы и разный инвентарь */
    buildFigure(anim('goblet'), { ratio: 1, t: 0, frameCache: true, has: k => k === 'kb' });
    buildFigure(anim('goblet'), { ratio: 1, t: 0, frameCache: true, has: k => k === 'db' });
    const keys = [...FIGURE_FRAMES.keys()].filter(k => k.startsWith('goblet|'));
    assert.equal(keys.length, 2, 'equipment variant'); assert(keys.some(k => k.endsWith('|kb')) && keys.some(k => k.endsWith('|')), keys.join(' '));
    const set = FIGURE_FRAMES.get([...FIGURE_FRAMES.keys()][0]);
    assert.deepEqual([...set.frames.keys()], ['0|0'], 'frame key — phase t and index');
    buildFigure(anim('squat'), { ratio: 1, t: 0 }); buildFigure(anim('pushup'), { ratio: 1, t: 0, still: true, frameCache: true });
    assert.equal(FIGURE_FRAMES.size, 5, 'figures without frameCache and still thumbnails do not store frames');
  } finally { dom.window.close(); }
});

test('memory: unchanged records are shared, sets leave by age, an oversized set keeps its first frames', () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, FIGURE_FRAMES, FIGURE_FRAMES_LIMIT, bytes } = dom.window.api, anim = id => EX.find(e => e.id === id).anim;
    const f = buildFigure(anim('latpulluh'), { ratio: 1, t: 0, frameCache: true });
    for (let k = 1; k <= 30; k++) f.at(k / 30, { index: 0 });
    const set = [...FIGURE_FRAMES.values()][0], frames = [...set.frames.values()];
    const shared = frames[frames.length - 1].records.filter(r => frames[frames.length - 2].records.includes(r)).length;
    assert(shared >= 20, 'machine parts are stored once: ' + shared);
    const perFrame = set.bytes / set.frames.size;
    assert(perFrame > 5e3 && perFrame < 60e3, 'estimate per frame ' + Math.round(perFrame));
    assert.equal(bytes(), set.bytes);
    /* предел объёма: третий набор вытесняет давно не показанный */
    const g = buildFigure(anim('squat'), { ratio: 1, t: 0, frameCache: true });
    for (let k = 1; k <= 30; k++) g.at(k / 30, { index: 0 });
    const squat = [...FIGURE_FRAMES.values()][1].bytes;
    f.at(.5, { index: 0 });            /* тягу снова показали — она свежее приседа */
    FIGURE_FRAMES_LIMIT.bytes = Math.round(set.bytes + squat * 1.5);
    const h = buildFigure(anim('pushup'), { ratio: 1, t: 0, frameCache: true });
    for (let k = 1; k <= 30; k++) h.at(k / 30, { index: 0 });
    const ids = [...FIGURE_FRAMES.keys()].map(k => k.split('|')[0]);
    assert(!ids.includes('squat') && ids.includes('latpulluh') && ids.includes('pushup'), ids.join(' '));
    assert(bytes() <= FIGURE_FRAMES_LIMIT.bytes);
    assert.equal(bytes(), [...FIGURE_FRAMES.values()].reduce((s, x) => s + x.bytes, 0), 'the counter matches the sets');
    /* один набор больше предела: первые кадры остаются, новые не запоминаются, рисунок верный */
    FIGURE_FRAMES_LIMIT.bytes = Math.round(perFrame * 10);
    dom.window.api.figureFramesReset();
    const big = buildFigure(anim('cablefly'), { ratio: 1, t: 0, frameCache: true }), ref = buildFigure(anim('cablefly'), { ratio: 1, t: 0 });
    for (let k = 1; k <= 40; k++) { big.at(k / 40, { index: 0 }); ref.at(k / 40, { index: 0 }); assert.equal(canon(big.svg), canon(ref.svg)); }
    const only = [...FIGURE_FRAMES.values()][0];
    assert(only.frames.size >= 5 && only.frames.size < 15 && only.frames.has('0|0'), 'first frames kept: ' + only.frames.size);
    FIGURE_FRAMES_LIMIT.frames = 3; dom.window.api.figureFramesReset(); FIGURE_FRAMES_LIMIT.bytes = 8 << 20;
    const few = buildFigure(anim('pushup'), { ratio: 1, t: 0, frameCache: true });
    for (let k = 1; k <= 10; k++) few.at(k / 10, { index: 0 });
    assert.equal([...FIGURE_FRAMES.values()][0].frames.size, 3, 'frame count limit');
  } finally { dom.window.close(); }
});

test('reset: theme, page language, explicit reset; stress marks follow the switch with frames from memory', async () => {
  const dom = svgModel();
  try {
    const { EX, buildFigure, FIGURE_FRAMES, figureFramesReset } = dom.window.api, anim = EX.find(e => e.id === 'squat').anim;
    const f = buildFigure(anim, { ratio: 1, t: 0, frameCache: true, stress: true });
    assert.equal(FIGURE_FRAMES.size, 1);
    dom.window.document.documentElement.setAttribute('data-theme', 'dark'); await new Promise(r => setTimeout(r, 0));
    assert.equal(FIGURE_FRAMES.size, 0, 'theme');
    f.at(.6, { index: 0 }); assert.equal(FIGURE_FRAMES.size, 1);
    dom.window.document.documentElement.setAttribute('lang', 'en'); await new Promise(r => setTimeout(r, 0));
    assert.equal(FIGURE_FRAMES.size, 0, 'language');
    f.at(.6, { index: 0 }); figureFramesReset(); assert.equal(FIGURE_FRAMES.size, 0, 'explicit');
    /* метки нагрузки: кадр из памяти, показ — по переключателю */
    const fresh = buildFigure(anim, { ratio: 1, t: .95, stress: true }); fresh.at(.95, { index: 0 });
    f.at(.95, { index: 0 }); f.setStress(false);
    assert.equal(f.svg.querySelectorAll('.stress-mark:not([display])').length, 0, 'hidden');
    f.setStress(true); assert.equal(canon(f.svg), canon(fresh.svg), 'shown again from memory');
    assert(f.svg.querySelectorAll('.stress-mark:not([display])').length > 0, 'squat has stress marks at the bottom');
  } finally { dom.window.close(); }
});

test('card clock: a fixed ~30 fps grid per repetition, the same phases every circle, less than half a frame off', () => {
  const m = loadModel({ fullApp: true });
  m.get(`window.__F={it:{ex:{id:'squat',anim:{cues:['a','b']}},rx:{}},durations:[3000,0,1000,0],clock:0};`);
  const at = clock => plain(m.get(`__F.clock=${clock};(()=>{const c=cardClock(__F),f=motionFrame(__F,c);return[c,f.t,f.index];})()`));
  const step = 4000 / 120;
  for (const c of [0, 15, 16.9, 17, 1234.5, 3999, 2777.7]) {
    const [q, t, index] = at(c), [q2, t2, index2] = at(c + 4000 * 3);
    assert.deepEqual([q2, t2, index2], [q, t, index], 'same phase on a later circle: ' + c);
    const d = ((c - q) % 4000 + 4000) % 4000, off = Math.min(d, 4000 - d);
    assert(off <= step / 2 + 1e-9, 'offset ' + off);
  }
  assert.equal(new Set(Array.from({ length: 2000 }, (_, i) => at(i * 7.3)[1])).size <= 120, true, 'at most 120 distinct frames per 4 s repetition');
  /* подробный разбор — по точным часам */
  m.get(`__F.clock=1234.5`);
  assert.equal(m.get('motionFrame(__F).progress'), 1234.5 / 4000);
});
