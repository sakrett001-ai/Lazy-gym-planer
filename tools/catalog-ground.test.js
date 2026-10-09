const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit');
const{checkClip}=require('./biomech/validator2.js');
/* Упражнения с опорой на пол и колени на манекене атласа: опоры неподвижны, тело не проходит сквозь пол,
   сегменты не меняют длину, движение без рывков. Допуски — в сантиметрах. */
const model=loadModel(),M=model.get('Mannequin'),POSES=model.get('CATALOG_POSES'),EQ=model.get('GymEquipment');
const exercise=id=>model.EX.find(ex=>ex.id===id);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const ids=['rollout','nordic','superman','cablecrunch','kneepush','birddog','plank'];
function supportsDrift(rig,keys){let worst=0;const first=rig(0);for(let i=0;i<=100;i++){const R=rig(i/100);for(const k of keys)worst=Math.max(worst,distance(R[k],first[k]));}return worst;}

test('kneeling exercises keep their knees and ankles in place throughout the repetition',()=>{
 for(const id of ['rollout','nordic','cablecrunch']){
  const rig=exercise(id).anim.catalogRig;
  assert(supportsDrift(rig,['knL','knR','anL','anR'])<1.2,id+' support moved');
  const broken=t=>{const R=rig(t);if(t>=.5)R.knL=R.knL.map((v,i)=>i===2?v+5:v);return R;};
  assert(supportsDrift(broken,['knL','knR','anL','anR'])>=5,id+' moving a support must fail');
 }
});
test('rollout wheel stays on the floor, rolls out smoothly, and both palms hold the axle',()=>{
 const rig=exercise('rollout').anim.catalogRig,start=rig(0).props.find(p=>p.id==='wheel:wheel').c;let previous,far=0;
 for(let i=0;i<=50;i++){
  const R=rig(i/50),wheel=R.props.find(p=>p.id==='wheel:wheel'),axle=R.props.find(p=>p.id==='wheel:axle');
  assert(wheel&&axle,'one wheel with an axle');
  /* опора колеса — верх коврика (если он есть) или пол */
  const mat=R.props.find(p=>p.tone==='mat'),top=mat?Math.min(...[-1,1].map(k=>mat.c[1]+k*mat.size[1]/2)):186;
  assert(Math.abs(wheel.c[1]+wheel.r-top)<.6,'wheel touches the support at '+i/50);
  const mid=axle.a.map((v,k)=>(v+axle.b[k])/2);
  for(const side of ['L','R'])assert(distance(R['grip'+side],mid)<14,'palm '+side+' on the axle');
  if(previous)assert(distance(wheel.c,previous)<8,'wheel rolls without jumps');previous=wheel.c;
  far=Math.max(far,Math.hypot(wheel.c[0]-start[0],wheel.c[2]-start[2]));
 }
 assert(far>40,'the wheel rolls out far from the knees');
});
test('ground motion surfaces clear the floor and declared supports touch it (validator)',()=>{
 for(const id of ids){
  const e=POSES[id],issues=checkClip(EQ.rig(e),e,{samples:21});
  assert.deepEqual(issues.filter(i=>['floor','contact','penetration'].includes(i.rule)&&i.severity==='error'),[],id);
 }
});
test('ground rigs preserve limb lengths and move without jumps',()=>{
 const B=M.B;
 for(const id of ids){
  const rig=exercise(id).anim.catalogRig;let previous;
  for(let i=0;i<=100;i++){
   const R=rig(i/100);
   for(const side of ['L','R'])for(const[a,b,length]of [['sh','el',B.ua],['el','wr',B.fa],['hip','kn',B.th],['kn','an',B.sk]])
    assert(Math.abs(distance(R[a+side],R[b+side])-length)<1e-6,id+' changed '+a+'–'+b);
   /* скачок: больше 5,5 см за 1 % повторения (порог валидатора — 14 см за 1/40) */
   if(previous)for(const key of ['hip','head','elL','wrL','knL','anL','toeL'])assert(distance(R[key],previous[key])<5.5,id+' jumps at '+key+' '+i/100);
   previous=R;
  }
 }
});
test('superman lifts both arms and legs while the pelvis stays supported',()=>{
 const rig=exercise('superman').anim.catalogRig,rest=rig(0),raised=rig(1);
 assert(distance(raised.hip,rest.hip)<3,'pelvis stays on the mat');
 for(const side of ['L','R'])for(const key of ['wr','an','toe'])assert(raised[key+side][1]<rest[key+side][1]-5,key+side+' must move away from the floor');
});
test('Nordic curl bends at the anchored knees without folding at the hips',()=>{
 const rig=exercise('nordic').anim.catalogRig,first=rig(0),span=side=>distance(first['kn'+side],first.sh);
 for(let i=0;i<=100;i++){const R=rig(i/100);for(const side of ['L','R'])assert(Math.abs(distance(R['kn'+side],R.sh)-span(side))<2,'knee–shoulder line stays straight at '+i/100);}
 assert(Math.abs(rig(0).head[1]-rig(1).head[1])>40,'the body travels between upright and the floor');
});
