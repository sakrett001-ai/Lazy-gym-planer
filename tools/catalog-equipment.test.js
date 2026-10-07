const {test}=require('node:test'),assert=require('node:assert/strict');
const {loadModel}=require('./biomechanics-audit');
const model=loadModel(),pose=(id,t)=>model.EX.find(e=>e.id===id).anim.catalogRig(t);
const sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),dist=(a,b)=>Math.hypot(...sub(a,b));
function pointSegment(p,a,b){const d=sub(b,a),t=Math.max(0,Math.min(1,dot(sub(p,a),d)/(dot(d,d)||1)));return dist(p,a.map((v,i)=>v+t*d[i]));}
function gripErrors(R){
 const errors=[];
 for(const side of ['L','R']){
  const p=R['grip'+side],grips=R.props.filter(q=>q.equipmentRole==='grip'&&(!q.side||q.side===side));
  if(!grips.some(q=>q.kind==='line'?pointSegment(p,q.a,q.b)<1e-6:q.kind==='barbell'&&Math.hypot(p[1]-q.c[1],p[2]-q.c[2])<1e-6))errors.push(side);
 }
 return errors;
}
function crossmemberErrors(R){
 const beams=R.props.filter(p=>p.kind==='line'&&p.tone==='steel'),errors=[];
 for(const p of beams.filter(p=>p.equipmentRole==='crossmember'))for(const end of [p.a,p.b])if(!beams.some(q=>q!==p&&pointSegment(end,q.a,q.b)<1e-6))errors.push(end);
 return errors;
}
test('parallel bars support both palms for the whole dip and assisted dip',()=>{
 for(const id of ['dip','assistdip'])for(let i=0;i<=40;i++){
  const R=pose(id,i/40),rails=R.props.filter(p=>p.equipmentRole==='grip');
  assert.equal(rails.length,2);assert.deepEqual(gripErrors(R),[]);
  for(const rail of rails){
   assert.equal(rail.a[0],rail.b[0]);assert.equal(rail.a[1],rail.b[1]);
   for(const end of [rail.a,rail.b])assert(R.props.some(q=>q.kind==='line'&&dist(q.a,end)<1e-6&&q.b[1]===186),'each end has a floor support');
   const side=rail.side,d=sub(R['grip'+side],R['wr'+side]);assert(Math.abs(dot(d,sub(rail.b,rail.a)))<1e-7,'palm closes across the rail, not along it');
  }
  if(id==='assistdip'){
   const pad=R.props.find(p=>p.equipmentRole==='knee-support');
   for(const side of ['L','R']){const knee=R['kn'+side];assert(Math.abs(pad.lo[1]-knee[1]-5.2)<1e-6);assert(knee[2]>pad.lo[2]&&knee[2]<pad.hi[2]);}
  }
 }
});
test('hanging crossbars run across both hands and remain stationary',()=>{
 for(const id of ['hang','hangknee','legraise']){
  const first=pose(id,0);for(let i=0;i<=40;i++){
   const R=pose(id,i/40),bar=R.props.find(p=>p.equipmentRole==='grip');
   assert.deepEqual(gripErrors(R),[]);assert.deepEqual(R.props,first.props);
   assert.equal(bar.a[1],bar.b[1]);assert.equal(bar.a[2],bar.b[2]);assert(bar.a[0]<R.gripL[0]&&bar.b[0]>R.gripR[0]);
  }
 }
});
test('Smith guides and crossmembers are connected, and the held bar has one fixed track',()=>{
 for(const id of ['smithincline','smithbench','smithsquat','smithohp']){
  const first=pose(id,0),guides=first.props.filter(p=>p.equipmentRole==='guide');assert.equal(guides.length,2);
  for(let i=0;i<=40;i++){
   const R=pose(id,i/40),bar=R.props.find(p=>p.kind==='barbell');assert.deepEqual(gripErrors(R),[]);assert.deepEqual(crossmemberErrors(R),[]);
   assert.deepEqual(R.props.filter(p=>['guide','crossmember'].includes(p.equipmentRole)),first.props.filter(p=>['guide','crossmember'].includes(p.equipmentRole)));
   assert.equal(bar.c[2],guides[0].a[2]);assert.equal(bar.c[2],guides[1].a[2]);
  }
 }
});
test('pec deck and reverse fly frames hold a supported seat and linked hand controls',()=>{
 for(const id of ['pecdeck','reversefly'])for(let i=0;i<=40;i++){
  const R=pose(id,i/40),seat=R.props.find(p=>p.equipmentRole==='seat');
  assert.deepEqual(gripErrors(R),[]);assert.deepEqual(crossmemberErrors(R),[]);
  assert.equal(seat.lo[1],R.hip[1]+10,'seat touches the lower pelvis rather than cutting through its centre');
  assert(R.props.some(p=>p.kind==='line'&&p.a[1]===seat.hi[1]&&p.b[1]===186),'seat has a post to the floor');
  assert(!R.props.some(p=>p.kind==='dumbbell'),'machine controls are linked handles, not free weights');
  const links=R.props.filter(p=>p.equipmentRole==='linkage');assert.equal(links.length,4);
  for(const link of links)assert(Math.abs(dist(link.a,link.b)-55)<1e-8,'mechanical links cannot stretch with the hand trajectory');
  for(const side of ['L','R']){
   const [a,b]=links.filter(p=>p.side===side);assert(dist(a.b,b.a)<1e-8,'hinge joins both rigid links');
   assert(R.props.some(p=>p!==b&&p.equipmentRole!=='linkage'&&p.kind==='line'&&(dist(p.a,b.b)<1e-8||dist(p.b,b.b)<1e-8)),'link ends on the actual handle or pad');
  }
 }
});
test('decline bench restraints span both legs and connect to the bench frame',()=>{
 const R=pose('declinebb',.5),rollers=R.props.filter(p=>p.equipmentRole==='leg-restraint');assert.equal(rollers.length,2);
 for(const roller of rollers){
  assert.equal(roller.kind,'roller');assert.deepEqual(Array.from(roller.axis),[1,0,0]);
  for(const sign of [-1,1]){const end=[sign*18,roller.c[1],roller.c[2]];assert(R.props.some(p=>p.kind==='line'&&(dist(p.a,end)<1e-6||dist(p.b,end)<1e-6)),'roller ends have structural attachments');}
 }
 for(const side of ['L','R']){assert(Math.abs(R['kn'+side][0])<18);assert(Math.abs(R['an'+side][0])<18);}
});
function restraintClearance(R){
 const radius=model.get('catalogLimbRadius');let min=Infinity;
 for(const p of R.props.filter(p=>p.equipmentRole==='leg-restraint'))for(const side of ['L','R'])for(const[k,a,b]of [['th','hip','kn'],['sh','kn','an']])for(let i=0;i<=100;i++){
  const t=i/100,joint=R[a+side].map((v,j)=>v+(R[b+side][j]-v)*t);
  min=Math.min(min,Math.hypot(joint[1]-p.c[1],joint[2]-p.c[2])-Math.max(...radius(k,t))-p.radius);
 }
 return min;
}
test('decline rollers contact the leg surface without penetrating either thigh or calf',()=>{
 const R=pose('declinebb',.5);assert(restraintClearance(R)>-1e-8);
 const upper=R.props.find(p=>p.equipmentRole==='leg-restraint');
 assert(Math.abs(dist([R.knL[0],upper.c[1],upper.c[2]],R.knL)-upper.radius-5.2)<1e-8,'upper restraint touches the knee contour');
 // Reinstating the old side-view circle must be rejected, even if its width is correct.
 upper.c=[0,R.knL[1]+9,R.knL[2]+1];assert(restraintClearance(R)<-5);
});
test('hanging motions use one placement with shoes above the ground throughout the clip',()=>{
 for(const id of ['hang','hangknee','legraise','pullup','chinup'])for(let i=0;i<=100;i++){
  const R=pose(id,i/100);for(const side of ['L','R'])for(const key of ['an','heel','toe'])assert(R[key+side][1]+5.8<186,id+' '+key+' shoe must clear the ground');
 }
});
test('negative: misplaced grips and disconnected machine crossmembers fail the semantic checks',()=>{
 const R=pose('dip',.5);R.props.find(p=>p.equipmentRole==='grip'&&p.side==='L').a[0]+=20;assert(gripErrors(R).includes('L'));
 const smith=pose('smithincline',.5),cross=smith.props.find(p=>p.equipmentRole==='crossmember');cross.a[2]+=20;cross.b[2]+=20;assert.equal(crossmemberErrors(smith).length,2);
 const hang=pose('hangknee',.5),bar=hang.props.find(p=>p.equipmentRole==='grip');bar.a=[0,bar.a[1],70];bar.b=[0,bar.b[1],130];assert.equal(gripErrors(hang).length,2,'old longitudinal bar must fail');
});
test('incline bench segmented braces retain the same lateral planes at every joint',()=>{
 for(const id of ['dbincline','smithincline','inclinebb']){
  const R=pose(id,.5),sources=model.get('CATALOG_SOURCES').get(id).props;
  for(const [idx,s]of sources.entries())if(s.k==='line'&&s.pts.length>2){
   const parts=R.props.filter(p=>p.sourceIndex===idx&&p.kind==='line');
   assert(parts.every(p=>Math.abs(p.a[0])===13&&p.a[0]===p.b[0]),'short terminal segment must stay attached to both side braces');
  }
 }
 const R=pose('smithohp',.5),bracket=R.props.find(p=>p.equipmentRole==='backrest-bracket'),back=R.props.find(p=>p.sourceIndex===0),seat=R.props.find(p=>p.equipmentRole==='seat');
 const inside=(p,b)=>p.every((v,i)=>v>=b.lo[i]&&v<=b.hi[i]);
 assert(inside(bracket.a,back));assert(inside(bracket.b,seat));
});
