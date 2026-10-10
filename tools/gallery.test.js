'use strict';
/* Витрина атласа движений: «Чем работать» для каждого упражнения, фильтры и разделы по группам мышц. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { loadModel } = require('./biomechanics-audit');
const plain = x => JSON.parse(JSON.stringify(x));
const m = loadModel({ fullApp: true });
m.get('renderSetup=()=>{}; logRefresh=()=>{}; LOG.mode="local";');
const a = m.get('({S,EX,EXI,GROUPS,WORK_KINDS,workKind,gallery,galleryList,galleryHtml,ensurePlaces,PLACE_DEFAULTS,effEquip,available})');
function reset(extra = {}) {
  a.S.places = a.PLACE_DEFAULTS.map(p => ({ ...p, equip: p.equip.slice() })); a.S.place = 'gym'; a.ensurePlaces(a.S);
  Object.assign(a.gallery, { kind: 'all', here: false, q: '' }, extra);
}

test('every exercise has exactly one kind; machines, free weights, bands and bodyweight are told apart', () => {
  const kinds = new Set(a.WORK_KINDS.map(k => k.id));
  for (const ex of a.EX) assert(kinds.has(a.workKind(ex)) && a.workKind(ex) !== 'all', ex.id);
  const expect = { latpull: 'mach', cablerow: 'mach', legpress: 'mach', smithincline: 'mach', bbbench: 'free', dbcurl: 'free', kbswing: 'free',
    bandrow: 'band', bandcurl: 'band', pushup: 'body', pullup: 'body', dip: 'body', crunch: 'body' };
  for (const [id, k] of Object.entries(expect)) if (a.EXI[id]) assert.equal(a.workKind(a.EXI[id]), k, id);
  reset();
  const counts = a.WORK_KINDS.filter(k => k.id !== 'all').map(k => a.galleryList(k.id).length);
  assert.equal(counts.reduce((x, y) => x + y, 0), a.EX.length, 'the kinds split the catalogue without overlap');
});

test('filters: kind, only-here, search; sections follow muscle groups', () => {
  reset({ kind: 'band' });
  assert(a.galleryList().length > 0 && a.galleryList().every(ex => a.workKind(ex) === 'band'));
  reset({ here: true }); a.S.place = 'home'; a.ensurePlaces(a.S);
  const E = a.effEquip(a.S.equip), here = a.galleryList();
  assert(here.length > 0 && here.length < a.EX.length && here.every(ex => a.available(ex, E)), 'only what is available at home');
  reset({ q: 'ТЯГА верхнего' });
  assert.deepEqual(plain(a.galleryList().map(ex => ex.id)).sort(), ['latpull', 'latpulluh', 'latpullv'], 'case-insensitive name search');
  reset();
  const html = a.galleryHtml(), order = [...html.matchAll(/id="mv-g-(\w+)"/g)].map(x => x[1]);
  assert.deepEqual(order, plain(a.GROUPS.map(g => g.id).filter(g => a.EX.some(ex => ex.g === g))), 'one section per muscle group, in the usual order');
  assert.equal([...html.matchAll(/data-gallery-open=/g)].length, a.EX.length);
  a.S.place = 'home'; a.ensurePlaces(a.S);
  assert.match(a.galleryHtml(), /class="mv-tile off" data-gallery-open="bbbench"[\s\S]*?Нет в месте «Дом», нужно: штанга/, 'an exercise not available here says what it needs');
  reset({ q: 'zzz' });
  assert.match(a.galleryHtml(), /Ничего не найдено/);
});
