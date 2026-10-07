const{test}=require('node:test'),assert=require('node:assert/strict');
const{loadModel}=require('./biomechanics-audit');
const model=loadModel(),api=model.get('({catalogLimbPoint,catalogTorsoPoint})');
const ids=['rollout','nordic','superman','cablecrunch'];
const exercise=id=>model.EX.find(ex=>ex.id===id);
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function supportsStable(pose,first){
 return ['knL','knR','anL','anR'].every(key=>distance(pose[key],first[key])<1e-8);
}
function wheelOnFloor(pose){
 const wheel=pose.props.find(p=>p.kind==='wheel');
 return wheel&&Math.abs(wheel.c[1]+wheel.radius-186)<1e-8;
}
function bodyFloorViolations(R){
 const violations=[];
 for(const side of ['L','R']){
  for(const[kind,root,end]of [['ua','sh','el'],['fa','el','wr'],['th','hip','kn'],['sh','kn','an']]){
   for(let row=0;row<=10;row++)for(let col=0;col<16;col++){
    const p=api.catalogLimbPoint(R,R[root+side],R[end+side],kind,row/10,col*Math.PI/8);
    if(p[1]>186.00001)violations.push(kind+side);
   }
  }
  if(R['kn'+side][1]+5.2>186.00001)violations.push('knee'+side);
  if(Math.max(R['heel'+side][1],R['toe'+side][1])+2.75>186.00001)violations.push('shoe'+side);
 }
 for(const h of [0,10,18,21,31,40,47,52])for(let col=0;col<24;col++){
  if(api.catalogTorsoPoint(R,h,col*Math.PI/12)[1]>186.00001)violations.push('torso');
 }
 return [...new Set(violations)];
}
test('kneeling exercises keep their knees and ankles fixed throughout the whole repetition',()=>{
 for(const id of ['rollout','nordic','cablecrunch']){
  const rig=exercise(id).anim.catalogRig,first=rig(0);
  for(let i=0;i<=100;i++)assert(supportsStable(rig(i/100),first),id+' support moved at '+i/100);
  const broken=rig(.5);broken.knL[2]+=.5;
  assert.equal(supportsStable(broken,first),false,id+' moving a support must fail');
 }
});
test('rollout wheel stays on the floor while both palms remain on the axle',()=>{
 const rig=exercise('rollout').anim.catalogRig;let previous;
 for(let i=0;i<=100;i++){
  const R=rig(i/100),wheel=R.props.find(p=>p.kind==='wheel');assert(wheelOnFloor(R));
  for(const side of ['L','R'])assert(Math.hypot(R['grip'+side][1]-wheel.c[1],R['grip'+side][2]-wheel.c[2])<1e-8);
  if(previous)assert(wheel.c[2]>previous[2],'wheel should roll forward throughout extension');previous=wheel.c;
 }
 const broken=rig(.5);broken.props.find(p=>p.kind==='wheel').c[1]-=1;
 assert.equal(wheelOnFloor(broken),false,'a floating roller must fail');
});
test('ground motion surfaces clear the floor, not just their joint centres',()=>{
 for(const id of ids){
  const rig=exercise(id).anim.catalogRig;
  for(let i=0;i<=20;i++)assert.deepEqual(bodyFloorViolations(rig(i/20)),[],id+' clips at '+i/20);
  const broken=rig(.5);broken.toeL[1]=192;
  assert(bodyFloorViolations(broken).includes('shoeL'),'a foot directed into the floor must fail');
 }
});
test('ground rigs preserve limb lengths and remain continuous at intermediate poses',()=>{
 for(const id of ids){
  const rig=exercise(id).anim.catalogRig;let previous;
  for(let i=0;i<=100;i++){
   const R=rig(i/100);
   for(const side of ['L','R'])for(const[a,b,length]of [['sh','el',30],['el','wr',27],['hip','kn',43],['kn','an',42]]){
    assert(Math.abs(distance(R[a+side],R[b+side])-length)<1e-8,id+' changed '+a+'–'+b);
   }
   if(previous)for(const key of ['hip','head','elL','wrL','knL','anL','toeL'])assert(distance(R[key],previous[key])<2.5,id+' jumps at '+key);
   previous=R;
  }
 }
});
test('superman lifts both arms and legs while the pelvis stays supported',()=>{
 const rig=exercise('superman').anim.catalogRig,rest=rig(0),raised=rig(1);
 assert.deepEqual(raised.hip,rest.hip);
 for(const side of ['L','R'])for(const key of ['wr','an','toe'])assert(raised[key+side][1]<rest[key+side][1]-5,key+' must move away from the floor');
});
test('Nordic curl bends at the anchored knees without folding at the hips',()=>{
 const rig=exercise('nordic').anim.catalogRig;
 for(let i=0;i<=100;i++){
  const R=rig(i/100);
  for(const side of ['L','R'])assert(Math.abs(distance(R['kn'+side],R.sh)-Math.hypot(43+52,11))<1e-8);
 }
});
