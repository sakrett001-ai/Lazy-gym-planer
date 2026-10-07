const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadModel}=require('./biomechanics-audit');
const model=loadModel({fullApp:true});
const {muscleFrame,muscleSurfaces,visibleMuscleSurfaces,motionFrame,muscleColor}=model.get('({muscleFrame,muscleSurfaces,visibleMuscleSurfaces,motionFrame,muscleColor})');
const pilot=model.EX.filter(ex=>ex.anim.muscleProfile);
test('three original hand-authored profiles remain intact alongside the catalog',()=>{
 assert.deepEqual(Array.from(pilot,ex=>ex.id).sort(),['bbbench','latpull','squat']);
 for(const ex of pilot){
  const p=ex.anim.muscleProfile;
  assert.equal(p.curveBasis,'illustrative');assert(p.sources.length>0);
  assert(ex.anim.cameras.includes(p.pair));
  for(const id of ex.pri)assert.equal(p.muscles[id].role,'primary');
 }
 const unsupported=model.EX.find(ex=>ex.id==='deadlift');
 assert.equal(unsupported.anim.muscleProfile,undefined);
 assert.equal(unsupported.anim.catalogProfile.muscles.lowback.role,'primary');
 assert(muscleFrame(unsupported.anim,.5,0).values.lowback>0);
});
test('lowering remains active and differs from lifting at the same pose',()=>{
 for(const ex of pilot){
  const first=muscleFrame(ex.anim,.5,0),second=muscleFrame(ex.anim,.5,2),primary=ex.pri[0];
  assert.notEqual(first.phase,second.phase);
  assert(first.values[primary]>0);assert(second.values[primary]>0);
  assert.notEqual(first.values[primary],second.values[primary]);
  const concentric=first.phase==='concentric'?first:second;
  const eccentric=first.phase==='eccentric'?first:second;
  assert(concentric.values[primary]>eccentric.values[primary]);
 }
});
test('all phase turns and long holds preserve brightness without flashes',()=>{
 for(const ex of pilot)for(const t of [0,1]){
  const pause=muscleFrame(ex.anim,t,t===1?1:3);
  for(const index of [0,2]){
   const exact=muscleFrame(ex.anim,t,index),near=muscleFrame(ex.anim,t===0?1e-5:1-1e-5,index);
   for(const id of Object.keys(pause.values)){
    assert.equal(exact.values[id],pause.values[id]);
    assert(Math.abs(near.values[id]-pause.values[id])<1e-7);
   }
  }
  const F={it:{ex},durations:[2000,1000,3000,1000],clock:t===1?2400:6400};
  const frame=motionFrame(F);assert.equal(frame.t,t);
  assert.deepEqual(muscleFrame(ex.anim,frame.t,frame.index).values,pause.values);
 }
});
test('scrubbing, playback speed and zero-duration pauses use the same phase model',()=>{
 for(const ex of pilot){
  const F={it:{ex},durations:[3000,0,1000,0],clock:1500},a=motionFrame(F);
  F.clock=3500;const b=motionFrame(F);
  assert(Math.abs(a.t-b.t)<1e-12);assert.equal(a.index,0);assert.equal(b.index,2);
  const state=muscleFrame(ex.anim,b.t,b.index);F.paused=true;
  assert.deepEqual(muscleFrame(ex.anim,motionFrame(F).t,motionFrame(F).index),state);
 }
});
test('curves and colors stay finite and continuous across a dense sweep',()=>{
 for(const ex of pilot)for(const index of [0,2]){
  let previous;
  for(let i=0;i<=1000;i++){
   const state=muscleFrame(ex.anim,i/1000,index);
   for(const[id,v]of Object.entries(state.values)){
    assert(Number.isFinite(v)&&v>=0&&v<=1);assert.match(muscleColor(v),/^#[0-9a-f]{6}$/);
    if(previous)assert(Math.abs(v-previous[id])<.003);
   }
   previous=state.values;
  }
 }
});
test('surfaces follow the skeleton and cannot alter the pose or contacts',()=>{
 for(const ex of pilot)for(const t of [0,.25,.5,.75,1]){
  const R=ex.anim.rig3d(t),before=JSON.stringify(R),faces=muscleSurfaces(R,ex.anim.muscleProfile);
  assert.equal(JSON.stringify(R),before);
  const ids=new Set(faces.map(f=>f.id));
  for(const id of Object.keys(ex.anim.muscleProfile.muscles))assert(ids.has(id));
  for(const face of faces){
   assert(face.points.every(p=>p.length===3&&p.every(Number.isFinite)));
   assert(Math.abs(Math.hypot(...face.normal)-1)<1e-8);
  }
 }
});
test('rear torso muscles disappear in front views and appear in their own rear view',()=>{
 const lat=pilot.find(ex=>ex.id==='latpull'),R=lat.anim.rig3d(.5),p=lat.anim.muscleProfile;
 const front=visibleMuscleSurfaces(R,p,'front'),back=visibleMuscleSurfaces(R,p,'back');
 assert(!front.some(f=>f.id==='midback'));assert(back.some(f=>f.id==='midback'));
 assert(back.some(f=>f.id==='lats'));assert(!back.some(f=>f.id==='abs'));
 const bench=pilot.find(ex=>ex.id==='bbbench');
 assert(visibleMuscleSurfaces(bench.anim.rig3d(.5),bench.anim.muscleProfile,'above').some(f=>f.id==='chest'));
});
