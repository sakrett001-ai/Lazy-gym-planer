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
