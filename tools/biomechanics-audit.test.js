const {test} = require('node:test');
const assert = require('node:assert/strict');
const {loadModel, auditModel} = require('./biomechanics-audit');
const model = loadModel();
function corrupted(id, mutate) {
  return {...model, EX:model.EX.filter(ex => ex.id === id).map(ex => ({...ex, anim:{...ex.anim,
    rig3d:t => {const R = ex.anim.rig3d(t); mutate(R,t); return R;}}}))};
}
function detects(id, mutate, rule) {
  const r = auditModel(corrupted(id,mutate));
  assert(r.failures.some(f => f.rule === rule), JSON.stringify(r.failures));
}
test('all poses and cameras satisfy declared geometry and contact constraints', () => {
  const r = auditModel(model);
  assert.equal(r.stats.exercises,139);
  assert.equal(r.stats.poses,139*101);
  assert.equal(r.stats.cameraPoses,29*101);
  assert.equal(r.stats.muscleProfiles,3);
  assert.equal(r.stats.musclePoses,3*101);
  assert.deepEqual(r.failures,[]);
  assert(r.warnings.some(f => f.exercise === 'invrow' && f.rule.startsWith('projected-elbow')));
});
test('detects a transient hand leaving the bar between the old audit keyframes', () => {
  detects('bbrow',(R,t) => {if(t >= .37 && t <= .39) R.gripL[1] += 10;},'grip:L');
});
test('detects changed anatomical bone length', () => {
  detects('deadlift',R => {R.wrR[1] += 10;},'bone:elR-wrR');
});
test('detects a sliding support even when limb lengths remain valid', () => {
  detects('lunge',(R,t) => {R.toeR[2] += 8*t;},'anchor:toeR');
});
test('detects a stationary support that floats above the floor', () => {
  detects('lunge',R => {R.toeR[1] -= 10;},'ground:toeR');
});
test('detects a bench that does not support the head', () => {
  detects('bbbench',R => {R.head[2] -= 25;},'bench-support:head');
});
test('detects an overhead-press elbow behind the shoulder plane', () => {
  detects('ohp',R => {R.elL = R.shL.map((v,i) => v - R.n[i]*20);},'press-elbow:L');
});
test('nonfinite coordinates are failures', () => {
  detects('latpull',R => {R.elR[0] = NaN;},'finite:elR');
});
test('invalid sampling options fail clearly', () => {
  assert.throws(() => auditModel(model,{samples:1}),/samples/);
  assert.throws(() => auditModel(model,{only:'front'}),/only/);
});
test('detects an out-of-range muscle curve instead of hiding it with color clamping', () => {
  const ex=model.EX.find(e=>e.id==='squat'),p=ex.anim.muscleProfile;
  const anim={...ex.anim,muscleProfile:{...p,muscles:{...p.muscles,quads:{...p.muscles.quads,concentric:[.34,1.5,.72]}}}};
  const r=auditModel({...model,EX:[{...ex,anim}]});
  assert(r.failures.some(f=>f.rule==='muscle-curve:quads'));
});
test('detects a missing camera rather than silently accepting the fallback projection', () => {
  const ex=model.EX.find(e=>e.id==='bbbench');
  const r=auditModel({...model,EX:[{...ex,anim:{...ex.anim,cameras:['missing-camera']}}]});
  assert(r.failures.some(f=>f.rule==='camera-defined:missing-camera'));
});
