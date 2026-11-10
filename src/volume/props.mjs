import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/* Детали инвентаря нового формата (GymEquipment): beam, obox, cyl, sphere, barbell(len), dumbbell(handle), cable,
   prism — плоский выпуклый контур pts (см, в осях u, v) толщиной len вдоль w с центром c (кулачок рычажного тренажёра). */
const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100],direction=p=>[p[0],-p[1],p[2]],vec=p=>new THREE.Vector3(...p);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],len=a=>Math.hypot(...a),unit=a=>{const l=len(a)||1;return a.map(v=>v/l);};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const NEW_KINDS=new Set(['beam','obox','cyl','sphere','cable','prism']);
export const isNewProp=s=>NEW_KINDS.has(s.kind)||(s.kind==='barbell'&&s.len)||(s.kind==='dumbbell'&&s.handle)||(s.kind==='kettlebell'&&s.handleAxis);
export function propKey(s){return s.kind+(s.kind==='barbell'?JSON.stringify(s.plates||[]):'')+(s.kind==='cable'?':'+s.pts.length+(s.joints?':j':'')+(s.flat?':f':''):'')+(s.kind==='beam'?(s.r?':r':':w'):'')+(s.kind==='cyl'?':'+(s.sides||24):'')+(s.kind==='prism'?':'+prismKey(s):'');}
const prismKey=s=>s.pts.length+':'+s.len+':'+s.pts.reduce((a,q)=>a+q[0]*1.7+q[1]*2.3,0).toFixed(3);
/* контур в плоскости XY (м), выдавлен на len по Z симметрично: знак оси w не важен, ориентацию задают u, v */
function prismGeometry(s){const sh=new THREE.Shape(s.pts.map(q=>new THREE.Vector2(q[0]/100,q[1]/100)));const g=new THREE.ExtrudeGeometry(sh,{depth:s.len/100,bevelEnabled:false,curveSegments:1});g.translate(0,0,-s.len/200);g.computeVertexNormals();return g;}
function basisQ(x,y,z){const X=unit(direction(x)),Y=unit(direction(y)),Z=cross(X,Y);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(X),vec(Y),vec(Z)));}
const UP=new THREE.Vector3(0,1,0);
function alignY(o,a,b){const d=sub(b,a),l=len(d);o.visible=l>1e-4;if(!o.visible)return 0;o.position.fromArray(world(add(a,d,.5)));o.quaternion.setFromUnitVectors(UP,vec(unit(direction(d))));return l;}
/* коробка с настоящим радиусом скругления (см), без растяжения геометрии */
const sizeKey=s=>s.size.map(v=>v.toFixed(2)).join(',')+':'+(s.round??.6);
function boxGeometry(s){const[a,b,c]=s.size.map(v=>Math.max(.05,v)/100),r=Math.min((s.round??.6)/100,Math.min(a,b,c)*.45);return new RoundedBoxGeometry(a,b,c,r>.004?3:1,Math.max(1e-4,r));}
export function createPropNode(parent,s,mats,mesh){
 const g=new THREE.Group();g.name='prop-'+s.kind+(s.id?':'+s.id:'');parent.add(g);const m=mats[s.tone]||mats.frame||mats.steel;
 if(s.kind==='beam'){if(s.r)mesh(g,new THREE.CylinderGeometry(1,1,1,16),m,'beam');else mesh(g,new RoundedBoxGeometry(1,1,1,2,.08),m,'beam');}
 else if(s.kind==='obox'){const o=mesh(g,boxGeometry(s),m,'box');o.userData.size=sizeKey(s);}
 else if(s.kind==='cyl')mesh(g,new THREE.CylinderGeometry(1,1,1,s.sides||24),m,'cyl');
 else if(s.kind==='sphere')mesh(g,new THREE.SphereGeometry(1,18,12),m,'sphere');
 else if(s.kind==='prism')mesh(g,prismGeometry(s),m,'prism');
 else if(s.kind==='cable'){
  /* лента эспандера (09bo-band.js): круглая — отрезки-цилиндры радиуса rs и сферы в изломах (joints), без щелей на сгибах;
     плоская (flat: [ширина, толщина], nrm — нормаль ленты по отрезкам) — отрезки-пластины */
  for(let i=1;i<s.pts.length;i++)mesh(g,s.flat?new THREE.BoxGeometry(1,1,1):new THREE.CylinderGeometry(1,1,1,s.joints?12:8),m,'cable');
  if(s.joints&&!s.flat)for(let i=1;i<s.pts.length-1;i++)mesh(g,new THREE.SphereGeometry(1,12,8),m,'joint');
 }
 else if(s.kind==='barbell'){
  mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'shaft');
  for(const sign of [-1,1]){
   mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'sleeve').userData.sign=sign;
   mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'collar').userData.sign=sign;
   (s.plates||[]).forEach((p,i)=>{const o=mesh(g,new THREE.CylinderGeometry(1,1,1,32),mats.plate,'plate');o.userData={sign,i};});
  }
 }else if(s.kind==='kettlebell'){
  /* шар Ø21, срезанный плоским дном Ø14 (s.bottom — от центра до дна), П-образная рукоять: локальные оси — x вдоль
     рукояти, y вверх к рукояти. Тело — одно тело вращения: дуга шара от верха до окружности дна и плоское дно. */
  const R0=s.radius||10.5,bt=(s.bottom??7.83*R0/10.5)/R0,end=Math.acos(-bt),prof=[];
  for(let i=0;i<=24;i++){const a=end*i/24;prof.push(new THREE.Vector2(Math.sin(a),Math.cos(a)));}
  prof.push(new THREE.Vector2(0,-bt));
  mesh(g,new THREE.LatheGeometry(prof.reverse(),32),mats.plate,'bell');
  const hu=(s.handleUp??15.6*(s.radius||10.5)/10.5)/(s.radius||10.5)*10.5,pts=[[-7.2,6.5],[-9.2,hu-4.6],[-8.4,hu-1],[-5,hu],[5,hu],[8.4,hu-1],[9.2,hu-4.6],[7.2,6.5]].map(([x,y])=>new THREE.Vector3(x/10.5,y/10.5,0));
  mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.16,10,false),mats.plate,'handle');
 }else if(s.kind==='dumbbell'){
  mesh(g,new THREE.CylinderGeometry(1,1,1,14),mats.chrome,'handle');
  for(const sign of [-1,1]){mesh(g,new THREE.CylinderGeometry(1,1,1,6),mats.plate,'head').userData.sign=sign;mesh(g,new THREE.CylinderGeometry(1,1,1,14),mats.chrome,'inner').userData.sign=sign;}
 }
 return{group:g,kind:s.kind,key:propKey(s)};
}
export function updatePropNode(node,s){
 const g=node.group,ch=g.children;g.visible=true;
 if(s.kind==='beam'){
  const o=ch[0],l=alignY(o,s.a,s.b);
  if(s.r)o.scale.set(s.r/100,l/100,s.r/100);
  else{const y=unit(sub(s.b,s.a));let z=sub(s.up||[0,-1,0],y.map(v=>v*dot(s.up||[0,-1,0],y)));if(len(z)<1e-6)z=Math.abs(y[2])<.9?sub([0,0,1],y.map(v=>v*y[2])):sub([1,0,0],y.map(v=>v*y[0]));z=unit(z);const x=cross(y,z);
   o.quaternion.copy(basisQ(x,y,z));o.scale.set(s.w/100,l/100,s.h/100);}
 }else if(s.kind==='obox'){const o=ch[0],k=sizeKey(s);if(o.userData.size!==k){o.geometry.dispose();o.geometry=boxGeometry(s);o.userData.size=k;}o.position.fromArray(world(s.c));o.quaternion.copy(basisQ(s.x,s.y,s.z));o.scale.set(1,1,1);}
 else if(s.kind==='cyl'){const o=ch[0];o.position.fromArray(world(s.c));o.quaternion.setFromUnitVectors(UP,vec(unit(direction(s.axis))));o.scale.set(s.r/100,s.len/100,s.r/100);}
 else if(s.kind==='sphere'){const o=ch[0];o.position.fromArray(world(s.c));o.scale.setScalar(s.r/100);}
 else if(s.kind==='prism'){const o=ch[0];o.position.fromArray(world(s.c));o.quaternion.copy(basisQ(s.u,s.v,s.w));}
 else if(s.kind==='cable'){
  const n=s.pts.length-1;
  for(let i=1;i<=n;i++){const o=ch[i-1],l=alignY(o,s.pts[i-1],s.pts[i]),r=s.rs?s.rs[i-1]:s.r;
   if(s.flat&&l>1e-4){const y=unit(sub(s.pts[i],s.pts[i-1])),nz=s.nrm?.[i-1]||[0,-1,0],z=unit(sub(nz,y.map(v=>v*dot(nz,y)))),x=cross(y,z);o.quaternion.copy(basisQ(x,y,z));o.scale.set(s.flat[0]/100,l/100,s.flat[1]/100);}
   else o.scale.set(r/100,l/100,r/100);}
  if(s.joints&&!s.flat)for(let i=1;i<n;i++){const o=ch[n+i-1],r=s.rs?Math.max(s.rs[i-1],s.rs[i]):s.r;o.position.fromArray(world(s.pts[i]));o.scale.setScalar(r/100);}
 }
 else if(s.kind==='barbell'){
  const ax=unit(s.axis),c=s.c,q=new THREE.Quaternion().setFromUnitVectors(UP,vec(unit(direction(ax))));
  for(const o of ch){
   o.quaternion.copy(q);const sign=o.userData.sign;
   if(o.name==='shaft'){o.position.fromArray(world(c));o.scale.set(s.shaftR/100,2*s.inner/100,s.shaftR/100);}
   else if(o.name==='collar'){o.position.fromArray(world(add(c,ax,sign*(s.inner+1))));o.scale.set(3.6/100,2/100,3.6/100);}
   else if(o.name==='sleeve'){const a=s.inner+2,b=s.len/2;o.position.fromArray(world(add(c,ax,sign*(a+b)/2)));o.scale.set(s.sleeveR/100,(b-a)/100,s.sleeveR/100);}
   else if(o.name==='plate'){let at=s.inner+2.4;for(let i=0;i<o.userData.i;i++)at+=s.plates[i][1]+.3;const[r,th]=s.plates[o.userData.i];o.position.fromArray(world(add(c,ax,sign*(at+th/2))));o.scale.set(r/100,th/100,r/100);}
  }
 }else if(s.kind==='kettlebell'){
  const up=unit(sub(s.grip,s.c)),x=unit(s.handleAxis),z=cross(x,up);
  g.position.fromArray(world(s.c));g.quaternion.copy(basisQ(x,up,z));g.scale.setScalar(s.radius/100);
 }else if(s.kind==='dumbbell'){
  const ax=unit(s.axis),c=s.c,q=new THREE.Quaternion().setFromUnitVectors(UP,vec(unit(direction(ax))));
  for(const o of ch){
   o.quaternion.copy(q);const sign=o.userData.sign;
   if(o.name==='handle'){o.position.fromArray(world(c));o.scale.set(1.6/100,(s.handle+2)/100,1.6/100);}
   else if(o.name==='inner'){o.position.fromArray(world(add(c,ax,sign*(s.handle/2+.6))));o.scale.set(2.6/100,1.2/100,2.6/100);}
   else{o.position.fromArray(world(add(c,ax,sign*(s.handle/2+1.2+s.headLen/2))));o.scale.set(s.headR/100,s.headLen/100,s.headR/100);}
  }
 }
}
