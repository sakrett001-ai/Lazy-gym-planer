import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

/* Детали инвентаря нового формата (GymEquipment): beam, obox, cyl, sphere, barbell(len), dumbbell(handle), cable. */
const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100],direction=p=>[p[0],-p[1],p[2]],vec=p=>new THREE.Vector3(...p);
const sub=(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add=(a,b,k=1)=>[a[0]+b[0]*k,a[1]+b[1]*k,a[2]+b[2]*k],len=a=>Math.hypot(...a),unit=a=>{const l=len(a)||1;return a.map(v=>v/l);};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const NEW_KINDS=new Set(['beam','obox','cyl','sphere','cable']);
export const isNewProp=s=>NEW_KINDS.has(s.kind)||(s.kind==='barbell'&&s.len)||(s.kind==='dumbbell'&&s.handle);
export function propKey(s){return s.kind+(s.kind==='barbell'?JSON.stringify(s.plates||[]):'')+(s.kind==='cable'?':'+s.pts.length:'')+(s.kind==='beam'?(s.r?':r':':w'):'')+(s.kind==='cyl'?':'+(s.sides||24):'');}
function basisQ(x,y,z){const X=unit(direction(x)),Y=unit(direction(y)),Z=cross(X,Y);return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(X),vec(Y),vec(Z)));}
const UP=new THREE.Vector3(0,1,0);
function alignY(o,a,b){const d=sub(b,a),l=len(d);o.visible=l>1e-4;if(!o.visible)return 0;o.position.fromArray(world(add(a,d,.5)));o.quaternion.setFromUnitVectors(UP,vec(unit(direction(d))));return l;}
export function createPropNode(parent,s,mats,mesh){
 const g=new THREE.Group();g.name='prop-'+s.kind+(s.id?':'+s.id:'');parent.add(g);const m=mats[s.tone]||mats.frame||mats.steel;
 if(s.kind==='beam'){if(s.r)mesh(g,new THREE.CylinderGeometry(1,1,1,16),m,'beam');else mesh(g,new RoundedBoxGeometry(1,1,1,2,.08),m,'beam');}
 else if(s.kind==='obox')mesh(g,new RoundedBoxGeometry(1,1,1,3,.08),m,'box');
 else if(s.kind==='cyl')mesh(g,new THREE.CylinderGeometry(1,1,1,s.sides||24),m,'cyl');
 else if(s.kind==='sphere')mesh(g,new THREE.SphereGeometry(1,18,12),m,'sphere');
 else if(s.kind==='cable')for(let i=1;i<s.pts.length;i++)mesh(g,new THREE.CylinderGeometry(1,1,1,8),m,'cable');
 else if(s.kind==='barbell'){
  mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'shaft');
  for(const sign of [-1,1]){
   mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'sleeve').userData.sign=sign;
   mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.chrome,'collar').userData.sign=sign;
   (s.plates||[]).forEach((p,i)=>{const o=mesh(g,new THREE.CylinderGeometry(1,1,1,32),mats.plate,'plate');o.userData={sign,i};});
  }
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
  else{const y=unit(sub(s.b,s.a));let z=sub(s.up||[0,-1,0],y.map(v=>v*dot(s.up||[0,-1,0],y)));if(len(z)<1e-6)z=Math.abs(y[2])<.9?[0,0,1]:[1,0,0];z=unit(z);const x=cross(y,z);
   o.quaternion.copy(basisQ(x,y,z));o.scale.set(s.w/100,l/100,s.h/100);}
 }else if(s.kind==='obox'){const o=ch[0];o.position.fromArray(world(s.c));o.quaternion.copy(basisQ(s.x,s.y,s.z));o.scale.set(...s.size.map(v=>v/100));}
 else if(s.kind==='cyl'){const o=ch[0];o.position.fromArray(world(s.c));o.quaternion.setFromUnitVectors(UP,vec(unit(direction(s.axis))));o.scale.set(s.r/100,s.len/100,s.r/100);}
 else if(s.kind==='sphere'){const o=ch[0];o.position.fromArray(world(s.c));o.scale.setScalar(s.r/100);}
 else if(s.kind==='cable'){for(let i=1;i<s.pts.length;i++){const o=ch[i-1],l=alignY(o,s.pts[i-1],s.pts[i]);o.scale.set(s.r/100,l/100,s.r/100);}}
 else if(s.kind==='barbell'){
  const ax=unit(s.axis),c=s.c,q=new THREE.Quaternion().setFromUnitVectors(UP,vec(unit(direction(ax))));
  for(const o of ch){
   o.quaternion.copy(q);const sign=o.userData.sign;
   if(o.name==='shaft'){o.position.fromArray(world(c));o.scale.set(s.shaftR/100,2*s.inner/100,s.shaftR/100);}
   else if(o.name==='collar'){o.position.fromArray(world(add(c,ax,sign*(s.inner+1))));o.scale.set(3.6/100,2/100,3.6/100);}
   else if(o.name==='sleeve'){const a=s.inner+2,b=s.len/2;o.position.fromArray(world(add(c,ax,sign*(a+b)/2)));o.scale.set(s.sleeveR/100,(b-a)/100,s.sleeveR/100);}
   else if(o.name==='plate'){let at=s.inner+2.4;for(let i=0;i<o.userData.i;i++)at+=s.plates[i][1]+.3;const[r,th]=s.plates[o.userData.i];o.position.fromArray(world(add(c,ax,sign*(at+th/2))));o.scale.set(r/100,th/100,r/100);}
  }
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
