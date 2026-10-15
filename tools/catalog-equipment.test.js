const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadModel}=require('./biomechanics-audit');
const {checkClip,checkFrame}=require('./biomech/validator2.js');
/* Инвентарь атласа на манекене: хваты на настоящих рукоятях, неподвижные рамы, направляющие Смита,
   собранные тренажёры, опоры без проникновения. Общие правила — в validator2, здесь — смысл конкретных снарядов. */
const model=loadModel(),POSES=model.get('CATALOG_POSES'),EQ=model.get('GymEquipment');
const pose=(id,t)=>model.EX.find(e=>e.id===id).anim.catalogRig(t);
const issues=(id,rules,samples=21)=>{const e=POSES[id];return checkClip(EQ.rig(e),e,{samples}).filter(i=>rules.includes(i.rule)&&i.severity==='error');};
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));

test('parallel bars support both palms for the whole dip and assisted dip',()=>{
 for(const id of ['dip','assistdip'])assert.deepEqual(issues(id,['contact','penetration','mount']),[],id);
});
test('hanging bars stay in place while both hands hold them',()=>{
 for(const id of ['pullup','chinup','hang','hangknee','legraise']){
  const a=pose(id,0),b=pose(id,1),still=R=>R.props.filter(p=>!p.dyn&&!p.free);
  assert(still(a).length>4,id+' has a frame');assert.deepEqual(still(a),still(b),id+' frame does not move');
  assert.deepEqual(issues(id,['contact','mount','floor']),[],id);
 }
});
test('the Smith bar travels only along its guide rods',()=>{
 for(const id of ['smithsquat','smithbench','smithincline','smithohp']){
  const bar=t=>pose(id,t).props.find(p=>p.kind==='barbell'),c0=bar(0).c;let moved=0;
  for(let i=0;i<=20;i++){const c=bar(i/20).c;assert(Math.abs(c[0]-c0[0])<1e-6&&Math.abs(c[2]-c0[2])<1e-6,id+' bar leaves the guide line');moved=Math.max(moved,Math.abs(c[1]-c0[1]));}
  assert(moved>15,id+' bar travels vertically');
  assert.deepEqual(issues(id,['contact','mount','equipment']),[],id);
 }
});
test('lever machines are assembled: arms ride their hubs and handles meet the palms',()=>{
 for(const id of ['pecdeck','reversefly','chestpressm','shoulderpressm','leverrowm','legext','legcurl','abduction','adduction','seatedcalf'])
  assert.deepEqual(issues(id,['contact','mount','equipment','penetration']),[],id);
});
test('decline bench rollers hold the legs without penetrating thigh or shin',()=>{
 for(const id of ['declinebb','declinecrunch'])assert.deepEqual(issues(id,['contact','penetration']),[],id);
});
test('hanging motions keep the shoes above the ground throughout the clip',()=>{
 for(const id of ['hang','hangknee','legraise','pullup','chinup'])for(let i=0;i<=100;i++){
  const R=pose(id,i/100);for(const side of ['L','R'])for(const key of ['an','heel','toe'])assert(R[key+side][1]+3<186,id+' '+key+' shoe must clear the ground');
 }
});
test('negative: a misplaced handle and a detached crossmember fail the validator',()=>{
 const e=POSES.dip,R=EQ.rig(e)(.5);
 const moved={...R,props:R.props.map(p=>p.id==='dp:barL'&&p.a?{...p,a:p.a.map((v,i)=>i===0?v+15:v),b:p.b.map((v,i)=>i===0?v+15:v)}:p)};
 assert(checkFrame(moved,e).issues.some(i=>i.rule==='contact'&&i.detail.includes('gripL')),'handle moved away from the palm');
 const s=POSES.smithsquat,S=EQ.rig(s)(.5),cross=S.props.find(p=>!p.dyn&&p.kind==='beam'&&p.mount&&p.mount!=='floor');
 const broken={...S,props:S.props.map(p=>p===cross?{...p,a:p.a.map((v,i)=>i===2?v+30:v),b:p.b.map((v,i)=>i===2?v+30:v)}:p)};
 assert(checkFrame(broken,s).issues.some(i=>i.rule==='mount'),'detached part must fail');
});
/* Поза под вариант инвентаря (4.43.0): хват гоблета зависит от снаряда — гантель лежит верхним диском в ладонях
   («чашка»), гиря — в кулаках за рога. До 4.43.0 гантель лежала на кулаках, стоявших по бокам рукояти в 2–3 см от неё:
   касание было, но сверху рука проходила мимо гантели. */
test('goblet: the dumbbell rests in both palms under its top head, the kettlebell in fists on the horns',()=>{
 const e=POSES.goblet,anim=model.EX.find(x=>x.id==='goblet').anim,forHas=model.get('catalogAnimFor');
 assert(e.variants&&e.variants.kb,'goblet has a kettlebell pose');
 const none=()=>false,kb=k=>k==='kb';
 assert.equal(EQ.variantOf(e,none),null);assert.equal(EQ.variantOf(e,kb),'kb');assert.equal(EQ.variantOf(e),'kb','without has every optional item is present, as in visible()');
 for(const[has,label]of [[none,'dumbbell'],[kb,'kettlebell']]){
  const ev=EQ.variantEntry(e,has);
  assert.deepEqual(checkClip(EQ.rig(ev),{...ev,has},{samples:21}).filter(i=>['contact','penetration','rom'].includes(i.rule)),[],label);
 }
 const palm=(R,s)=>{const f=R.frames['hand'+s],g=s==='L'?1:-1;return f.o.map((v,i)=>v-g*1.8*f.x[i]-5.6*f.y[i]);};
 const toAxis=(p,a,b)=>{const ab=b.map((v,i)=>v-a[i]),ap=p.map((v,i)=>v-a[i]),k=Math.max(0,Math.min(1,ap.reduce((s,v,i)=>s+v*ab[i],0)/ab.reduce((s,v)=>s+v*v,0)));return dist(p,a.map((v,i)=>v+k*ab[i]));};
 for(let i=0;i<=20;i++){
  const t=i/20,R=anim.catalogRig(t),K=forHas(anim,kb).catalogRig(t);
  assert.deepEqual([R.hands.L,R.hands.R],['flat','flat'],'dumbbell: open palms');
  assert.deepEqual([K.hands.L,K.hands.R],['grip','grip'],'kettlebell: fists');
  const h=R.props.find(p=>p.id==='cup:handle');
  for(const s of ['L','R'])assert(toAxis(palm(R,s),h.a,h.b)<6.5,`t=${t}: ${s} palm by the dumbbell handle (${toAxis(palm(R,s),h.a,h.b).toFixed(1)} cm)`);
 }
 assert.equal(forHas(anim,none),anim,'no kettlebell — the default pose');
});
