const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit'),{auditCatalog}=require('./catalog-audit');
const model=loadModel(),api=model.get('({catalogProps,catalogVolumeData,muscleFrame,catalogMuscleSurfaces})');
test('every catalog motion has a continuous spatial skeleton, five cameras and complete region coverage',()=>{const r=auditCatalog(model);assert.deepEqual(r.failures,[]);assert.equal(r.stats.poses,146*101);assert.equal(r.stats.cameraPoses,146*101*5);});
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
const M=model.get('Mannequin'),seg=(p,a,b)=>{const ab=b.map((v,i)=>v-a[i]),t=Math.max(0,Math.min(1,p.reduce((s,v,i)=>s+(v-a[i])*ab[i],0)/ab.reduce((s,v)=>s+v*v,0)));return Math.hypot(...p.map((v,i)=>v-a[i]-ab[i]*t));};
test('kettlebell swings keep both palms on one shared handle with fixed arm lengths',()=>{
 const ex=model.EX.find(e=>e.id==='kbswing');
 for(let i=0;i<=100;i++){
  const R=ex.anim.catalogRig(i/100),kb=R.props.find(p=>p.kind==='kettlebell');assert(kb&&kb.handleAxis,'kettlebell with a handle');
  /* ручка гири: отрезок вдоль handleAxis над центром шара; обе кисти на ней, ладони по разные стороны от середины */
  const up=kb.grip.map((v,k)=>v-kb.c[k]),n=Math.hypot(...up),u=up.map(v=>v/n),ax=kb.handleAxis,k=kb.radius/10.5,a=kb.c.map((v,j)=>v+ax[j]*-5*k+u[j]*15.6*k),b=kb.c.map((v,j)=>v+ax[j]*5*k+u[j]*15.6*k);
  for(const side of ['L','R'])assert(seg(R['grip'+side],a,b)<2.6,'kbswing:'+side+' at '+i/100+' holds the handle');
  assert(Math.hypot(...R.gripL.map((v,j)=>v-R.gripR[j]))>4,'two palms side by side, not merged');
  for(const side of ['L','R'])assert(Math.abs(Math.hypot(...R['sh'+side].map((v,j)=>v-R['el'+side][j]))-M.B.ua)<1e-6&&Math.abs(Math.hypot(...R['el'+side].map((v,j)=>v-R['wr'+side][j]))-M.B.fa)<1e-6);
 }
});
test('ab-wheel rollouts retain one wheel and a short axle held by both palms',()=>{
 const ex=model.EX.find(e=>e.id==='rollout');
 for(let i=0;i<=40;i++){
  const R=ex.anim.catalogRig(i/40),wheels=R.props.filter(p=>p.id==='wheel:wheel'),axle=R.props.find(p=>p.id==='wheel:axle');
  assert.equal(wheels.length,1);assert(!R.props.some(p=>p.kind==='barbell'));assert(axle);
  assert(wheels[0].r>=8&&wheels[0].r<=10,'ab wheel diameter 16–20 cm');assert(Math.hypot(...axle.a.map((v,k)=>v-axle.b[k]))<50,'roller handle must not have a full barbell span');
  for(const side of ['L','R'])assert(seg(R['grip'+side],axle.a,axle.b)<2.5,'both palms hold the wheel axle');
 }
});
test('deep heads remain in the tree without being drawn over the skin',()=>{
 const ex=model.EX.find(e=>e.id==='squat'),data=api.catalogVolumeData(ex.anim,.5,0);assert(data.regions.quad_deep);assert.equal(data.regions.quad_deep.visible,false);assert(!data.surfaces.some(s=>s.id==='quad_deep'));
});
/* положение участка мышцы в осях сегмента манекена: front — вперёд от оси кости, lat — наружу */
function regionOffset(d,id,side,kind){
 const R=d.pose,F=R.frames[kind+side],[ja,jb]={ua:['sh','el'],th:['hip','kn'],sk:['kn','an']}[kind],A=R[ja+side],B=R[jb+side];
 const pts=d.surfaces.filter(f=>f.id===id&&f.side===side).flatMap(f=>f.points);if(!pts.length)return null;
 const c=[0,1,2].map(k=>pts.reduce((s,p)=>s+p[k],0)/pts.length),ab=B.map((v,i)=>v-A[i]),t=c.reduce((s,v,i)=>s+(v-A[i])*ab[i],0)/ab.reduce((s,v)=>s+v*v,0),off=c.map((v,i)=>v-A[i]-ab[i]*t);
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);return{c,front:dot(off,F.z),lat:dot(off,F.x)*M.SIGN[side]};
}
test('medial and lateral leg and arm regions are mirrored anatomically on both sides',()=>{
 for(const[id,regions,kind]of [['squat',[['quad_lateral',1],['quad_medial',-1]],'th'],['calfraise',[['calf_lateral',1],['calf_medial',-1]],'sk'],['bbcurl',[['bi_long',1],['bi_short',-1]],'ua']]){
  const d=api.catalogVolumeData(model.EX.find(e=>e.id===id).anim,0,0);
  for(const side of ['L','R'])for(const[r,sign]of regions){const o=regionOffset(d,r,side,kind);assert(o,id+':'+r+':'+side);assert(o.lat*sign>1.5,id+':'+r+':'+side+' lies on the '+(sign>0?'lateral':'medial')+' side');}
  const L=regionOffset(d,regions[0][0],'L',kind),R=regionOffset(d,regions[0][0],'R',kind);assert(Math.abs(L.lat-R.lat)<.5&&Math.abs(L.front-R.front)<.5,id+' mirrored');
 }
 const calf=api.catalogVolumeData(model.EX.find(e=>e.id==='calfraise').anim,0,0);for(const side of ['L','R'])assert(regionOffset(calf,'calf_lateral',side,'sk').front<-3,'calves on the back of the shank');
});
test('quadriceps stay on the front of a deeply flexed thigh without flipping sides',()=>{
 const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
 for(const id of ['goblet','airsquat','bulgarian','deadlift','smithsquat','pistolbox','bike']){
  const ex=model.EX.find(e=>e.id===id);let previous;
  for(let i=0;i<=40;i++){
   const d=api.catalogVolumeData(ex.anim,i/40,0),centers={};
   for(const side of ['L','R']){
    const o=regionOffset(d,'quad_rectus',side,'th');assert(o,id+' has an anterior thigh region');
    assert(o.front>3,id+':'+side+' at '+i/40+' must remain on the anterior thigh');
    if(previous){const travel=Math.max(distance(d.pose['hip'+side],previous.pose['hip'+side]),distance(d.pose['kn'+side],previous.pose['kn'+side]));assert(distance(o.c,previous.centers[side])<travel+3,id+':'+side+' region must not jump across the leg');}
    centers[side]=o.c;
   }
   previous={pose:d.pose,centers};
  }
 }
});
test('bench press frame stays fixed while the bar moves, and both palms hold the shaft',()=>{
 const ex=model.EX.find(e=>e.id==='bbbench'),a=ex.anim.catalogRig(0),b=ex.anim.catalogRig(1),fixed=R=>R.props.filter(p=>!p.dyn&&!p.free);
 assert(fixed(a).length>5);assert.deepEqual(fixed(a),fixed(b));
 const bar=R=>R.props.find(p=>p.kind==='barbell');assert.notDeepEqual(bar(a).c,bar(b).c);
 for(let i=0;i<=100;i++){const R=ex.anim.catalogRig(i/100),p=bar(R),h=p.inner,A=p.c.map((v,k)=>v-p.axis[k]*h),B=p.c.map((v,k)=>v+p.axis[k]*h);for(const side of ['L','R'])assert(seg(R['grip'+side],A,B)<2,'palm '+side+' on the shaft at '+i/100);}
});
test('isometric holds keep a constant profile, and invalid catalog positions are rejected',()=>{
 const ex=model.EX.find(e=>e.id==='plank');assert.deepEqual(api.muscleFrame(ex.anim,0,0).values,api.muscleFrame(ex.anim,1,2).values);for(const t of [-.1,1.1,NaN])assert.throws(()=>ex.anim.catalogRig(t),/Pose must/);
});
