import fs from 'node:fs';
import {createRequire} from 'node:module';
import * as THREE from 'three';
import {createCatalogScene,world} from '../src/volume/scene.mjs';
const require=createRequire(import.meta.url),{loadModel}=require('./biomechanics-audit.js');
const dist=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
const vector=p=>new THREE.Vector3(...p);
const normalWorld=p=>vector([p[0],-p[1],p[2]]).normalize();
function checkRegions(view,data){
 const failures=[],groups=new Map(),ray=new THREE.Raycaster();
 for(const f of data.surfaces){const key=f.id+':'+f.side;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
 for(const[key,faces]of groups){
  const region=view.regionMeshes.get(key),i=Math.floor(faces.length/2),face=faces[i],attr=region.geometry.attributes.position;
  if(attr.count!==faces.length*6){failures.push('drawn-region-count:'+key);continue;}
  const center=new THREE.Vector3();for(let j=0;j<3;j++)center.add(new THREE.Vector3().fromBufferAttribute(attr,i*6+j).applyMatrix4(region.matrixWorld).multiplyScalar(1/3));
  const parent=face.parent,kind=['quads','hams'].includes(parent)?'th':parent==='calves'?'sh':parent==='forearms'?'fa':['biceps','triceps','delt_f','delt_s','delt_r'].includes(parent)?'ua':null,target=kind?view.parts[kind+face.side].mesh:view.body,n=normalWorld(face.normal);
  ray.set(center.clone().addScaledVector(n,.01),n.clone().negate());const hit=ray.intersectObject(target,false)[0];
  if(!hit||Math.abs(hit.distance-.0115)>.0008)failures.push('drawn-region-skin:'+key);
 }return failures;
}
export function checkDrawnSupports(view,data){
 if(!['bbbench','dbfly','inclinebb','chestrowdb'].includes(data.exerciseId))return[];
 const failures=[],R=data.pose,padIndices=data.props.flatMap((p,i)=>p.tone==='pad'&&['box','panel'].includes(p.kind)?[i]:[]),pads=padIndices.map(i=>view.propNodes()[i].group.children[0]),ray=new THREE.Raycaster();
 const tests=data.exerciseId==='chestrowdb'?[['chest',R.hip.map((v,i)=>v+(R.chestU||R.u)[i]*36),(R.chestN||R.n),view.body,.003]]:[['head',R.head,R.headN.map(v=>-v),view.head,.003],['back',R.hip.map((v,i)=>v+(R.chestU||R.u)[i]*40),R.n.map(v=>-v),view.body,.0055]];
 for(const[name,center,direction,body,tolerance]of tests){
  ray.set(vector(world(center)),normalWorld(direction));const skin=ray.intersectObject(body,false)[0],pad=ray.intersectObjects(pads,false)[0];
  if(!skin||!pad||Math.abs(skin.distance-pad.distance)>tolerance)failures.push('drawn-support:'+name);
 }
 return failures;
}
export function checkDrawnScene(view,data,{cameras=true}={}){
 const failures=[],R=data.pose;
 for(const side of ['L','R'])for(const kind of ['ua','fa','th','sh']){
  const p=view.parts[kind+side],attr=p.mesh.geometry.attributes.position;
  for(const[row,key]of [[0,p.a],[10,p.b]]){
   const center=[0,0,0];for(let c=0;c<16;c++){const q=new THREE.Vector3().fromBufferAttribute(attr,row*17+c).applyMatrix4(p.mesh.matrixWorld);for(let k=0;k<3;k++)center[k]+=q.getComponent(k)/16;}
   if(dist(center,world(R[key]))>1e-5)failures.push('drawn-bone:'+kind+side+':'+key);
  }
 }
 for(const side of ['L','R']){
  const palm=view.parts['hand'+side].mesh.getObjectByName('palm'+side),point=palm.getWorldPosition(new THREE.Vector3()).toArray();
  if(dist(point,world(R['grip'+side]))>1e-5)failures.push('drawn-palm:'+side);
 }
 for(const[node,i]of view.propNodes().map((n,i)=>[n,i])){
  const s=data.props[i];let expected;
  if(s.kind==='box')expected=s.lo.map((v,k)=>(v+s.hi[k])/2);
  else if(s.kind==='panel'||s.kind==='line')expected=s.a.map((v,k)=>(v+s.b[k])/2);
  else expected=s.c;
  const p=node.group.children[0].getWorldPosition(new THREE.Vector3()).toArray();if(dist(p,world(expected))>1e-5)failures.push('drawn-prop:'+i+':'+s.kind);
 }
 if(cameras)for(const [id,c]of Object.entries(view.cameras))view.scene.traverse(o=>{
  if(!o.isMesh||o.name==='floor'||!visible(o))return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
   const p=new THREE.Vector3(x,y,z).applyMatrix4(o.matrixWorld).project(c);
   if(![p.x,p.y,p.z].every(Number.isFinite)||Math.abs(p.x)>1.002||Math.abs(p.y)>1.002)failures.push('crop:'+id+':'+o.name);
  }
 });
 failures.push(...checkRegions(view,data),...checkDrawnSupports(view,data));return [...new Set(failures)];
}
export function auditDrawnCatalog(model,{only=null}={}){
 const {catalogVolumeData,muscleColor}=model.get('({catalogVolumeData,muscleColor})'),failures=[],stats={exercises:0,drawnPoses:0,cameraPoses:0};
 for(const ex of model.EX){
  if(only&&!only.includes(ex.id))continue;
  const data=t=>catalogVolumeData(ex.anim,t,0),view=createCatalogScene(data(0));stats.exercises++;
  try{
   for(let i=0;i<=24;i++){view.apply(data(i/24),{color:muscleColor,muscles:true});view.includeBounds();}
   for(const[w,h]of [[900,650],[360,300]]){
    view.resize(w,h);
    for(let i=0;i<=10;i++){
     const t=i/10,d=data(t);view.apply(d,{color:muscleColor,muscles:true});stats.drawnPoses++;stats.cameraPoses+=5;
     for(const rule of checkDrawnScene(view,d))if(!failures.some(f=>f.exercise===ex.id&&f.rule===rule))failures.push({exercise:ex.id,rule,t,width:w,height:h});
    }
   }
  }finally{view.dispose();}
 }
 return{stats,failures};
}
if(process.argv[1]===new URL(import.meta.url).pathname){const r=auditDrawnCatalog(loadModel());fs.writeFileSync(new URL('../docs/catalog-render-audit.json',import.meta.url),JSON.stringify(r,null,2)+'\n');console.log(`Drawn catalog: ${r.stats.exercises} exercises, ${r.stats.drawnPoses} poses, ${r.stats.cameraPoses} cameras; ${r.failures.length} errors.`);for(const f of r.failures.slice(0,20))console.error(f);if(r.failures.length)process.exitCode=1;}
