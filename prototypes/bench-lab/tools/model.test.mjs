import test from 'node:test';
import assert from 'node:assert/strict';
import {makePose,sampleCycle,V} from '../src/model.mjs';
import {PROFILES,muscleValues,MUSCLE_TREE} from '../src/muscles.mjs';
import {createScene} from '../src/scene.mjs';
import {audit} from './audit.mjs';
const rules=report=>report.errors.map(e=>e.rule);
const broken=(mutation,sceneCheck=false)=>audit({samples:21,sceneCheck,poseFactory:(t,v)=>{const p=makePose(t,v);mutation(p,t,v);return p;}});
test('world geometry, drawn contacts and four cameras pass the audit',()=>{
  const report=audit();assert.deepEqual(report.errors,[]);assert.equal(report.stats.poses,202);assert.equal(report.stats.cameraPoses,336);
});
test('rejects invalid positions and unknown variant',()=>{for(const n of [NaN,Infinity,-.01,1.01])assert.throws(()=>makePose(n));assert.throws(()=>makePose(.5,'unknown'));assert.throws(()=>sampleCycle(Infinity));});
test('negative: altered limb length is detected',()=>assert(rules(broken(p=>{p.joints.elbowL[0]+=.03;})).some(r=>r.startsWith('bone:'))));
test('negative: palm detached from shaft is detected',()=>assert(rules(broken(p=>{p.joints.gripR[2]+=.04;})).includes('grip:R')));
test('negative: support drift during the repetition is detected',()=>assert(rules(broken((p,t)=>{p.joints.ankleL[0]+=.03*t;})).includes('foot-drift:L')));
test('negative: bench on the wrong side of the torso is detected',()=>assert(rules(broken(p=>{p.equipment.bench.n=p.equipment.bench.n.map(v=>-v);})).includes('bench-side')));
test('negative: a bench contact gap is detected',()=>assert(rules(broken(p=>{p.equipment.bench.top=V.add(p.equipment.bench.top,p.n,-.05);})).includes('bench-contact:scapulaL')));
test('negative: wrong incline is detected',()=>assert(rules(broken(p=>{p.equipment.bench.u=[0,0,-1];})).includes('bench-angle')));
test('negative: a plate entering the floor is detected',()=>assert(rules(broken(p=>{p.equipment.bar.plateCenters[0][1]=.1;})).includes('plate-floor')));
test('negative: inconsistent axial rotation is detected',()=>assert(rules(broken(p=>{p.frames.forearmL.x=[0,0,0];})).includes('rotation:forearmL')));
test('negative: missing chest region is detected',()=>{const profiles=structuredClone(PROFILES);delete profiles.flat.regions.pec_costal;assert(rules(audit({samples:21,sceneCheck:false,profiles})).includes('muscle-curve:pec_costal'));});
test('negative: an invented measured basis is detected',()=>{const profiles=structuredClone(PROFILES);profiles.flat.basis='measured';assert(rules(audit({samples:21,sceneCheck:false,profiles})).includes('muscle-basis'));});
test('negative: a flash at a phase turn is detected',()=>{const profiles=structuredClone(PROFILES);profiles.flat.regions.pec_sternal.eccentric[2]-=.1;assert(rules(audit({samples:21,sceneCheck:false,profiles})).includes('muscle-turn:pec_sternal'));});
test('phase position and colours remain continuous at all four turns',()=>{
  for(const variant of ['flat','incline'])for(const boundary of [0,.44,.5,.88,1]){
    const left=sampleCycle(boundary===0?1:boundary-1e-8),right=sampleCycle(boundary===1?0:boundary+1e-8);
    assert(Math.abs(left.depth-right.depth)<1e-6);
    const a=muscleValues(left,variant),b=muscleValues(right,variant);for(const id of Object.keys(a))assert(Math.abs(a[id]-b[id])<1e-6);
  }
});
test('regional emphasis changes, and other pectoral regions remain involved',()=>{
  const f=muscleValues({phase:'concentric',depth:.5},'flat'),i=muscleValues({phase:'concentric',depth:.5},'incline');
  assert(i.pec_clavicular>f.pec_clavicular);assert(i.pec_sternal<f.pec_sternal);assert(i.pec_costal<f.pec_costal);
  assert(Object.values(i).every(v=>v>0));assert.equal(MUSCLE_TREE.triceps_brachii.regions.triceps_medial.scope,'deep-not-drawn');
});
test('negative: rendered hand offset is detected even with correct model coordinates',()=>{
  const report=audit({samples:21,sceneFactory:()=>{const view=createScene(),apply=view.apply;view.apply=(...args)=>{apply(...args);view.rigGroups.handL.position.z+=.04;view.scene.updateMatrixWorld(true);};return view;}});
  assert(rules(report).includes('rendered-grip:L'));
});
test('negative: rendered pad behind the body is detected even with correct declared contacts',()=>{
  const report=audit({samples:21,sceneFactory:()=>{const view=createScene(),apply=view.apply;view.apply=(p,...args)=>{apply(p,...args);view.scene.getObjectByName('backrest').position.addScaledVector({x:p.n[0],y:p.n[1],z:p.n[2]},.20);view.scene.updateMatrixWorld(true);};return view;}});
  assert(rules(report).includes('rendered-pad-contact:scapulaL'));
});
test('negative: camera cropping is detected',()=>{
  const report=audit({samples:21,sceneFactory:()=>{const view=createScene(),resize=view.resize;view.resize=(...args)=>{resize(...args);const c=view.cameras.iso;c.zoom=3;c.updateProjectionMatrix();};return view;}});
  assert(rules(report).includes('camera-crop:iso'));
});
