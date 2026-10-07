const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit'),{auditCatalog}=require('./catalog-audit');
const model=loadModel(),api=model.get('({catalogProps,catalogVolumeData,muscleFrame,catalogMuscleSurfaces})');
test('every catalog motion has a continuous spatial skeleton, five cameras and complete region coverage',()=>{const r=auditCatalog(model);assert.deepEqual(r.failures,[]);assert.equal(r.stats.poses,139*101);assert.equal(r.stats.cameraPoses,139*101*5);});
test('negative: a bone changed only in the new catalog model is detected',()=>{
 const ex=model.EX.find(e=>e.id==='kbswing'),anim={...ex.anim,catalogRig:t=>{const R=ex.anim.catalogRig(t);if(t>.35&&t<.41)R.wrL[1]+=5;return R;}};
 const r=auditCatalog({...model,EX:[{...ex,anim}]});assert(r.failures.some(f=>f.rule==='bone:elL-wrL'));
});
test('unknown equipment attachment and kind fail instead of silently disappearing',()=>{
 const R=model.EX[0].anim.catalogRig(0);
 assert.throws(()=>api.catalogProps({view:'side',props:[{k:'db',at:'missing'}]},{},R),/Unknown equipment attachment/);
 assert.throws(()=>api.catalogProps({view:'side',props:[{k:'future-missing'}]},{},R),/Unmapped equipment kind/);
});
test('negative: missing chest region cannot pass the catalog coverage audit',()=>{
 const ex=model.EX.find(e=>e.id==='bbbench'),p=ex.anim.catalogProfile,regions={...p.regions};delete regions.pec_clavicular;
 const invalid={...ex,anim:{...ex.anim,catalogProfile:{...p,regions}}};
 const r=auditCatalog({...model,EX:[invalid]});assert(r.failures.some(f=>f.rule==='required-region:pec_clavicular'));
});
test('single-hand rows distinguish the moving and supporting arm',()=>{
 const ex=model.EX.find(e=>e.id==='dbrow'),a=api.catalogVolumeData(ex.anim,.5,0),b=api.catalogVolumeData(ex.anim,.5,2);
 assert.notEqual(a.sideValues.L.bi_long,b.sideValues.L.bi_long);assert.equal(a.sideValues.R.bi_long,b.sideValues.R.bi_long);
});
test('kettlebell swings keep both palms on a shared handle with fixed arm lengths',()=>{
 const ex=model.EX.find(e=>e.id==='kbswing');for(let i=0;i<=100;i++){const R=ex.anim.catalogRig(i/100),p=R.props.find(p=>p.kind==='kettlebell');assert(Math.abs(R.gripL[1]-p.grip[1])<1e-8);assert(Math.abs(R.gripR[2]-p.grip[2])<1e-8);assert.equal(R.gripL[0],-5);assert.equal(R.gripR[0],5);}
});
test('ab-wheel rollouts retain one wheel and a short axle held by both palms',()=>{
 const ex=model.EX.find(e=>e.id==='rollout');
 for(let i=0;i<=40;i++){
  const R=ex.anim.catalogRig(i/40),wheels=R.props.filter(p=>p.kind==='wheel'),axle=R.props.find(p=>p.kind==='line'&&p.tone==='bar');
  assert.equal(wheels.length,1);assert(!R.props.some(p=>p.kind==='barbell'));assert(axle);
  assert.equal(wheels[0].radius,8);assert(Math.hypot(...axle.a.map((v,k)=>v-axle.b[k]))<50,'roller handle must not have a full barbell span');
  for(const side of ['L','R'])for(const k of [1,2])assert(Math.abs(R['grip'+side][k]-wheels[0].c[k])<1e-8,'both palms hold the wheel axle');
 }
});
test('deep heads remain in the tree without being drawn over the skin',()=>{
 const ex=model.EX.find(e=>e.id==='squat'),data=api.catalogVolumeData(ex.anim,.5,0);assert(data.regions.quad_deep);assert.equal(data.regions.quad_deep.visible,false);assert(!data.surfaces.some(s=>s.id==='quad_deep'));
});
test('medial and lateral leg regions are mirrored anatomically on both sides',()=>{
 for(const [ex,ids]of [[model.EX.find(e=>e.id==='squat'),['quad_lateral','quad_medial']],[model.EX.find(e=>e.pri.includes('calves')),['calf_lateral','calf_medial']]]){
 const d=api.catalogVolumeData(ex.anim,0,0);
 for(const[side,sign]of [['L',-1],['R',1]])for(const id of ids){const out=id.endsWith('lateral');
  const pts=d.surfaces.filter(s=>s.side===side&&s.id===id).flatMap(s=>s.points),a=d.pose[(id.startsWith('quad')?'hip':'kn')+side],b=d.pose[(id.startsWith('quad')?'kn':'an')+side],v=b.map((n,i)=>n-a[i]),l2=v.reduce((s,n)=>s+n*n,0);
  const x=pts.reduce((s,p)=>{const t=p.reduce((n,q,i)=>n+(q-a[i])*v[i],0)/l2;return s+p[0]-a[0]-v[0]*t;},0)/pts.length;
  assert(pts.length,id);assert.equal(x*sign>0,out,id+':'+side);
 }
 }
});
test('quadriceps stay on the front of a deeply flexed thigh without flipping sides',()=>{
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(const id of ['goblet','airsquat','bulgarian','deadlift','smithsquat','pistolbox','bike']){
  const ex=model.EX.find(e=>e.id===id);let previous;
  for(let i=0;i<=40;i++){
   const d=api.catalogVolumeData(ex.anim,i/40,0),centers={};
   for(const side of ['L','R']){
    const points=d.surfaces.filter(f=>f.id==='quad_rectus'&&f.side===side).flatMap(f=>f.points),hip=d.pose['hip'+side],knee=d.pose['kn'+side];
    assert(points.length,id+' has an anterior thigh region');
    const center=[0,1,2].map(k=>points.reduce((s,p)=>s+p[k],0)/points.length),axis=knee.map((v,k)=>v-hip[k]),lateral=d.pose.x;
    const anterior=[lateral[1]*axis[2]-lateral[2]*axis[1],lateral[2]*axis[0]-lateral[0]*axis[2],lateral[0]*axis[1]-lateral[1]*axis[0]];
    const frontDistance=center.reduce((s,v,k)=>s+(v-hip[k])*anterior[k],0)/Math.hypot(...anterior);
    assert(frontDistance>3,id+':'+side+' at '+i/40+' must remain on the anterior thigh');
    if(previous){
     const jointTravel=Math.max(distance(hip,previous.pose['hip'+side]),distance(knee,previous.pose['kn'+side]));
     assert(distance(center,previous.centers[side])<jointTravel+3,id+':'+side+' region must not jump across the leg');
    }
    centers[side]=center;
   }
   previous={pose:d.pose,centers};
  }
 }
});
test('bench rack geometry stays fixed while the bar moves, and the palms meet the shaft',()=>{
 const ex=model.EX.find(e=>e.id==='bbbench'),a=ex.anim.catalogRig(0),b=ex.anim.catalogRig(1),fixed=R=>R.props.filter(p=>p.kind!=='barbell');
 assert.deepEqual(fixed(a),fixed(b));assert.notDeepEqual(a.bar,b.bar);
 for(let i=0;i<=100;i++){const R=ex.anim.catalogRig(i/100);for(const side of ['L','R'])assert(Math.hypot(R['grip'+side][1]-R.bar[1],R['grip'+side][2]-R.bar[2])<1e-7);}
});
test('isometric holds keep a constant profile, and invalid catalog positions are rejected',()=>{
 const ex=model.EX.find(e=>e.id==='plank');assert.deepEqual(api.muscleFrame(ex.anim,0,0).values,api.muscleFrame(ex.anim,1,2).values);for(const t of [-.1,1.1,NaN])assert.throws(()=>ex.anim.catalogRig(t),/Pose must/);
});
