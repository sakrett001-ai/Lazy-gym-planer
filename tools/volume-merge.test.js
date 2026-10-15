'use strict';
/* Объём разбора: неподвижные детали тренажёра нарисованы объединёнными сетками — по одной на материал; подвижные —
   по сетке на деталь, как раньше. Рамка камер и проверки отрисовки считаются по самим деталям. */
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadModel} = require('./biomechanics-audit');
const model = loadModel(), {catalogVolumeData, muscleColor} = model.get('({catalogVolumeData,muscleColor})');
const anim = id => model.EX.find(e => e.id === id).anim;
const drawn = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
/* сетки инвентаря, которые попадут в кадр (их вызовы отрисовки; тени удваивают) */
function equipmentDraws(view) {
  let n = 0;
  view.scene.traverse(o => { if (o.isMesh && drawn(o) && ['equipment', 'equipment-static'].includes(o.parent?.parent?.name ?? '') || o.userData.merged && drawn(o)) n++; });
  return n;
}

test('static parts are merged by material; moving parts stay separate meshes', async () => {
  const {createCatalogScene, isStaticProp} = await import('../src/volume/scene.mjs'), {checkMerged} = await import('./catalog-render-audit.mjs');
  for (const [id, before, after] of [['latpulluh', 61, 25], ['legpress', 46, 21], ['smithsquat', 20, 11], ['cablefly', 129, 42], ['dbcurl', 10, 10]]) {
    const d = catalogVolumeData(anim(id), .5, 0), view = createCatalogScene(d);
    try {
      const statics = d.props.filter(isStaticProp), parts = new Set();
      view.propNodes().forEach((n, i) => { if (isStaticProp(d.props[i])) n.group.traverse(o => { if (o.isMesh && o.visible) parts.add(o); }); });
      const materials = new Set([...parts].map(o => o.material)), merged = view.staticMeshes();
      assert.equal(merged.length, materials.size, id + ': one merged mesh per material');
      assert.equal(merged.reduce((s, m) => s + m.userData.sources.length, 0), parts.size, id + ': every static mesh is in a merge');
      assert(merged.every(m => m.castShadow && m.receiveShadow), id + ': merged meshes cast and receive shadows like the parts');
      assert([...parts].every(o => !drawn(o)), id + ': the parts themselves are not drawn twice');
      view.propNodes().forEach((n, i) => { if (!isStaticProp(d.props[i])) assert(drawn(n.group), id + ': a moving part is drawn by itself'); });
      assert.deepEqual(checkMerged(view, d), [], id);
      /* сетки инвентаря в кадре: было (каждая деталь — своя) и стало */
      let all = 0; view.propNodes().forEach(n => n.group.traverse(o => { if (o.isMesh && o.visible) all++; }));
      assert.deepEqual([all, equipmentDraws(view)], [before, after], `${id}: ${statics.length} static parts → ${merged.length} merged meshes`);
    } finally { view.dispose(); }
  }
});

test('the merge is kept while static parts are unchanged and rebuilt when one moves', async () => {
  const {createCatalogScene, isStaticProp} = await import('../src/volume/scene.mjs'), {checkMerged} = await import('./catalog-render-audit.mjs');
  const a = anim('latpulluh'), view = createCatalogScene(catalogVolumeData(a, 0, 0));
  try {
    const first = view.staticMeshes()[0];
    for (const t of [.2, .7, 1]) { const d = catalogVolumeData(a, t, 2); view.apply(d, {color:muscleColor, muscles:true}); assert.equal(view.staticMeshes()[0], first, 'kept at ' + t); assert.deepEqual(checkMerged(view, d), []); }
    const d = catalogVolumeData(a, .5, 0), i = d.props.findIndex(isStaticProp), moved = {...d, props:d.props.map((p, k) => k === i ? {...p, ...(p.c ? {c:[p.c[0] + 10, p.c[1], p.c[2]]} : {a:[p.a[0] + 10, p.a[1], p.a[2]], b:[p.b[0] + 10, p.b[1], p.b[2]]})} : p)};
    view.apply(moved, {color:muscleColor, muscles:true});
    assert.notEqual(view.staticMeshes()[0], first, 'rebuilt');
    assert.deepEqual(checkMerged(view, moved), [], 'the drawn merge follows the moved part');
    view.apply(d, {color:muscleColor, muscles:true}); assert.deepEqual(checkMerged(view, d), []);
  } finally { view.dispose(); }
});

test('equipment variants: only visible static parts are merged', async () => {
  const {createCatalogScene} = await import('../src/volume/scene.mjs'), {checkMerged} = await import('./catalog-render-audit.mjs');
  /* жим гантелей: на наклонной скамье или на горизонтальной — разные неподвижные детали */
  const merged = has => { const d = catalogVolumeData(anim('dbpress'), .5, 0, has), view = createCatalogScene(d);
    try {
      assert.deepEqual(checkMerged(view, d), []);
      const ids = new Set(view.staticMeshes().flatMap(m => m.userData.sources.map(o => o.parent.name.split(':').slice(1).join(':'))));
      assert.deepEqual([...ids].sort(), [...d.props.filter(p => !p.dyn).map(p => p.id)].sort(), 'exactly the visible static parts');
      return [...ids].sort().join(' ');
    } finally { view.dispose(); } };
  const incline = merged(k => k === 'incline'), flat = merged(() => false);
  assert.match(incline, /bench:back/); assert.match(flat, /flat:pad/);
  assert.doesNotMatch(incline, /flat:/); assert.doesNotMatch(flat, /bench:/);
});

test('framing and the shadow box are the same as with separate parts', async () => {
  const {createCatalogScene} = await import('../src/volume/scene.mjs');
  for (const id of ['latpulluh', 'legpress', 'cablefly']) {
    const view = createCatalogScene(catalogVolumeData(anim(id), 0, 0));
    try {
      for (let i = 0; i <= 4; i++) { view.apply(catalogVolumeData(anim(id), i / 4, 0), {color:muscleColor}); view.includeBounds(); }
      const merged = JSON.parse(JSON.stringify(view.bounds));
      /* те же детали отдельными сетками: объединение выключено — сетки на виду, объединённые убраны */
      for (const k of Object.keys(view.bounds)) Object.assign(view.bounds[k], {minX:Infinity, maxX:-Infinity, minY:Infinity, maxY:-Infinity});
      const parts = view.scene.getObjectByName('equipment-static-parts'), group = view.scene.getObjectByName('equipment-static');
      parts.visible = true; group.visible = false; for (const m of group.children) m.userData.merged = false; group.traverse(o => { if (o.isMesh) o.visible = false; });
      for (let i = 0; i <= 4; i++) { view.apply(catalogVolumeData(anim(id), i / 4, 0), {color:muscleColor}); view.includeBounds(); }
      assert.deepEqual(JSON.parse(JSON.stringify(view.bounds)), merged, id);
    } finally { view.dispose(); }
  }
});
