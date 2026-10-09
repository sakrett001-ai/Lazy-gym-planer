/* Ground exercises need fixed support joints. Interpolating a hip and solving
   toward a fixed ankle can send the knee through the floor between keyframes. */
function catalogKneelingLegs(R){
 for(const[s,sign]of [['L',-1],['R',1]]){
  R['kn'+s]=[sign*11,180.5,96];
  R['an'+s]=[sign*11,178.5,96-Math.sqrt(FL.sh**2-2**2)];
  // A plantar-flexed foot extends behind the ankle, not vertically into the mat.
  R['toe'+s]=V3.add(R['an'+s],[0,0,-1],13);
  R['heel'+s]=V3.add(R['an'+s],[0,0,-1],-4);
 }
 R.contacts=['knL','knR','anL','anR'].map(key=>({key,kind:'support'}));
}
function catalogRolloutGroundRig(t){
 const thigh=20+40*t,hip=V3.add([0,180.5,96],up3(thigh),FL.th),R=body3(hip,65+19*t);
 catalogKneelingLegs(R);
 // The wheel rolls on the floor (186 cm), and the shoulders determine its
 // reachable forward position. Both hands remain on its short horizontal axle.
 const wheelY=178,wristY=wheelY-3.5,reach=56.8;
 const wheelZ=R.sh[2]+Math.sqrt(reach**2-(wristY-R.sh[1])**2);
 for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*19,wristY,wheelZ],[0,-1,1],[0,1,0]);
 const axis=[1,0,0],center=[0,wheelY,wheelZ];
 R.props=[{kind:'wheel',c:center,axis,radius:8,tone:'plate'},
  {kind:'line',a:[-22,wheelY,wheelZ],b:[22,wheelY,wheelZ],width:3,tone:'bar',equipmentRole:'grip'}];
 R.basis='authored';return R;
}
function catalogNordicGroundRig(t){
 const angle=58*t,hip=V3.add([0,180.5,96],up3(angle),FL.th),R=body3(hip,angle);
 catalogKneelingLegs(R);
 const endShoulder=V3.add([0,180.5,96],up3(58),FL.th+FL.torso),endReach=V3.sub([0,181.5,198],endShoulder);
 for(const[s,sign]of [['L',-1],['R',1]]){
  const wr=V3.add(R['sh'+s],[0,30+(endReach[1]-30)*t,28+(endReach[2]-28)*t]);
  arm3(R,s,wr,[0,1,-1],[0,0,1]);
 }
 const z=R.anL[2];
 R.props=[{kind:'roller',c:[0,171.5,z],radius:4,axis:[1,0,0],tone:'pad'},
  {kind:'line',a:[-23,171.5,z],b:[23,171.5,z],width:3,tone:'steel'},
  ...[-1,1].map(sign=>({kind:'line',a:[sign*23,171.5,z],b:[sign*23,186,z],width:4,tone:'steel'}))];
 R.basis='authored';return R;
}
function catalogSupermanGroundRig(t){
 const R=body3([0,173.2,100],90-12*t),arm=up3(90-12*t),leg=[0,-Math.sin(7*t*D2R),-Math.cos(7*t*D2R)];
 for(const s of ['L','R']){
  R['el'+s]=V3.add(R['sh'+s],arm,FL.ua);R['wr'+s]=V3.add(R['el'+s],arm,FL.fa);
  R['grip'+s]=V3.add(R['wr'+s],arm,3.5);R['hand'+s]=V3.add(R['wr'+s],arm,7);
  R['kn'+s]=V3.add(R['hip'+s],leg,FL.th);R['an'+s]=V3.add(R['kn'+s],leg,FL.sh);
  R['heel'+s]=V3.add(R['an'+s],leg,-4);R['toe'+s]=V3.add(R['an'+s],leg,13);
 }
 R.contacts=[{key:'hip',kind:'support'}];R.basis='authored';return R;
}
const CATALOG_GROUND_RIGS={rollout:catalogRolloutGroundRig,nordic:catalogNordicGroundRig,superman:catalogSupermanGroundRig};
for(const ex of EX){
 /* упражнения на манекене уже стоят на своих опорах (tools/mannequin) — старые плоские риги их не подменяют */
 if(ex.anim.catalogBasis==='mannequin')continue;
 const rig=CATALOG_GROUND_RIGS[ex.id];
 if(rig)ex.anim.catalogRig=t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const R=rig(t);R.x=[1,0,0];return R;
 };
 if(ex.id==='cablecrunch'){
  const original=ex.anim.catalogRig;
  ex.anim.catalogRig=t=>{
   const R=original(t);
   for(const s of ['L','R']){
    R['heel'+s]=V3.add(R['an'+s],[0,0,-1],-4);
    R['toe'+s]=V3.add(R['an'+s],[0,0,-1],13);
   }
   R.contacts=['knL','knR','anL','anR'].map(key=>({key,kind:'support'}));return R;
  };
 }
}
