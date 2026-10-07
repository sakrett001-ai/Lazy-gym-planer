import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const add=(a,b,k=1)=>a.map((v,i)=>v+b[i]*k),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a);
const unit=a=>{const l=len(a);if(l<1e-8)throw Error('Degenerate scene direction');return a.map(v=>v/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100];
const direction=p=>[p[0],-p[1],p[2]],vec=p=>new THREE.Vector3(...p);
const CAMERA_SETTINGS={above:[35,-55],angle:[55,-15],side:[90,0],front:[0,0],back:[180,0]};
function frame(a,b,reference){
 const z=unit(sub(b,a));let x=sub(reference,z.map(v=>v*dot(reference,z)));
 if(len(x)<1e-5)x=cross(z,Math.abs(z[0])<.8?[1,0,0]:[0,0,1]);x=unit(x);return{x,y:unit(cross(z,x)),z};
}
function quaternion(x,y,z){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(x),vec(y),vec(z)));}
function material(color,shine=24){return new THREE.MeshPhongMaterial({color,shininess:shine,specular:0x3d4553,side:THREE.DoubleSide});}
function mesh(parent,g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function grid(rows,cols){
 const g=new THREE.BufferGeometry(),indices=[];g.setAttribute('position',new THREE.BufferAttribute(new Float32Array((rows+1)*(cols+1)*3),3));
 for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const a=r*(cols+1)+c,b=a+1,d=a+cols+1;indices.push(a,d,b,b,d,d+1);}
 g.setIndex(indices);return g;
}
function updateGrid(g,rows,cols,point){const p=g.attributes.position;let i=0;for(let r=0;r<=rows;r++)for(let c=0;c<=cols;c++){const q=world(point(r/rows,c/cols));p.setXYZ(i++,...q);}p.needsUpdate=true;g.computeVertexNormals();g.computeBoundingSphere();g.computeBoundingBox();}
function torsoCenter(R,h){return h>18&&R.waist?add(R.waist,R.chestU||R.u,h-18):add(R.hip,R.u,h);}
function radius(profile,t){for(let i=1;i<profile.length;i++)if(t<=profile[i][0]){const a=profile[i-1],b=profile[i],q=(t-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];}return profile.at(-1).slice(1);}
function placeSphere(o,p,scale){o.position.fromArray(world(p));o.scale.set(...scale.map(v=>v/100));}
function placeBeam(o,a,b,width){
 const d=sub(b,a),l=len(d);o.visible=l>1e-5;if(!o.visible)return;
 o.position.fromArray(world(add(a,b).map(v=>v/2)));o.scale.set(width/200,l/100,width/200);
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec(direction(unit(d))));
}
export function createCatalogScene(first,{coarse=false}={}){
 const limbRows=coarse?5:10,limbCols=coarse?8:16,torsoCols=coarse?12:24;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#101722');
 const skin=material('#9aaac1'),joint=material('#8c9fb9'),shorts=material('#43526d',12),sole=material('#283549',12);
 const mats={steel:material('#425570',62),bar:material('#bbc9db',105),pad:material('#35445c',10),plate:material('#263e5c',44),cable:material('#74859b'),band:material('#709ec4'),mat:material('#1a293b',5)};
 scene.add(new THREE.AmbientLight(0xd9e7ff,.60));const light=new THREE.DirectionalLight(0xf6f3ea,.70);light.position.set(-2,5,3);scene.add(light);const rim=new THREE.DirectionalLight(0xa9c4ff,.25);rim.position.set(3,2,-4);scene.add(rim);
 const floor=mesh(scene,new THREE.PlaneGeometry(12,12),material('#0d1622',5),'floor');floor.rotation.x=-Math.PI/2;floor.position.y=-.014;floor.castShadow=false;
 const floorGrid=new THREE.GridHelper(5,20,0x2b3a50,0x2b3a50);floorGrid.position.set(0,-.01,1);floorGrid.material.transparent=true;floorGrid.material.opacity=.40;scene.add(floorGrid);
 const body=mesh(scene,grid(first.torsoRings.length-1,torsoCols),skin,'torso');
 const head=mesh(scene,new THREE.SphereGeometry(1,18,12),skin,'head');const nose=mesh(scene,new THREE.SphereGeometry(1,10,8),joint,'nose');const neck=mesh(scene,new THREE.CylinderGeometry(1,1,1,12),skin,'neck');
 const parts={},dots=new THREE.Group();dots.name='joint-dots';scene.add(dots);const dotMat=new THREE.MeshBasicMaterial({color:'#e2f1ff',depthTest:false});
 for(const side of ['L','R']){
  for(const[kind,a,b]of [['ua','sh','el'],['fa','el','wr'],['th','hip','kn'],['sh','kn','an']])parts[kind+side]={a:a+side,b:b+side,mesh:mesh(scene,grid(limbRows,limbCols),skin,kind+side)};
  for(const[name,r]of [['sh',6.4],['el',4.3],['kn',5.2]])parts[name+'-joint'+side]={r,mesh:mesh(scene,new THREE.SphereGeometry(1,14,10),joint,name+'-joint'+side)};
  const hand=new THREE.Group();hand.name='hand'+side;scene.add(hand);
  const palm=mesh(hand,new THREE.SphereGeometry(1,14,10),skin,'palm'+side);palm.scale.set(.039,.034,.026);
  for(let f=0;f<4;f++){
   const points=Array.from({length:10},(_,i)=>{const a=-2+i/9*4.65;return new THREE.Vector3((f-1.5)*.017,.021*Math.cos(a),.021*Math.sin(a));});
   mesh(hand,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),12,.0065,5,false),skin,'finger');
  }
  const thumbSign=side==='L'?-1:1,thumbPoints=[[thumbSign*.028,-.018,-.017],[thumbSign*.043,.010,-.020],[thumbSign*.031,.023,.004]].map(p=>vec(p));
  mesh(hand,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(thumbPoints),8,.008,6,false),skin,'thumb');
  const shoe=mesh(scene,new RoundedBoxGeometry(1,1,1,2,.04),sole,'shoe'+side);parts['hand'+side]={mesh:hand};parts['shoe'+side]={mesh:shoe};
  const thighShorts=mesh(scene,grid(2,16),shorts,'shorts'+side);parts['shorts'+side]={mesh:thighShorts};
  for(const key of ['sh','el','wr','hip','kn','an']){const d=mesh(dots,new THREE.SphereGeometry(.021,8,6),dotMat,key+side);parts['dot'+key+side]={mesh:d};}
 }
 const regionMeshes=new Map(),regionsGroup=new THREE.Group();regionsGroup.name='regions';scene.add(regionsGroup);
 const equipment=new THREE.Group();equipment.name='equipment';scene.add(equipment);let propNodes=[],lastData,options={};
 function propNode(s,i){
  const g=new THREE.Group();g.name='prop-'+i+'-'+s.kind;equipment.add(g);const m=mats[s.tone]||mats.steel;
  if(s.kind==='box'||s.kind==='panel')mesh(g,new RoundedBoxGeometry(1,1,1,2,.012),m,'pad');
  else if(s.kind==='line')mesh(g,new THREE.CylinderGeometry(1,1,1,12),m,'beam');
  else if(['wheel','roller','weight'].includes(s.kind))mesh(g,new THREE.CylinderGeometry(1,1,1,18),s.kind==='weight'?mats.plate:m,'cylinder');
  else if(['barbell','dumbbell'].includes(s.kind)){
   mesh(g,new THREE.CylinderGeometry(1,1,1,18),mats.bar,'shaft');
   for(const sign of [-1,1]){const p=mesh(g,new THREE.CylinderGeometry(1,1,1,20),mats.plate,'plate');p.userData.sign=sign;const c=mesh(g,new THREE.CylinderGeometry(1,1,1,12),mats.bar,'collar');c.userData.sign=sign;if(s.kind==='barbell'){const sleeve=mesh(g,new THREE.CylinderGeometry(1,1,1,16),mats.bar,'sleeve');sleeve.userData.sign=sign;}}
  }else if(s.kind==='kettlebell'){
   const ball=mesh(g,new THREE.SphereGeometry(1,18,12),mats.plate,'kettlebell-body');
   const points=Array.from({length:13},(_,i)=>new THREE.Vector3(-.055+i/12*.11,.042*Math.sin(Math.PI*i/12),0));
   mesh(g,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),14,.008,7,false),mats.bar,'kettlebell-handle');
  }else throw Error('Unknown scene prop '+s.kind);
  return{group:g,kind:s.kind};
 }
 function updateProp(node,s){
  const g=node.group,c=s.c,axis=s.axis||[1,0,0];g.visible=true;
  if(s.kind==='box'){
   const o=g.children[0],size=sub(s.hi,s.lo);o.position.fromArray(world(add(s.lo,s.hi).map(v=>v/2)));o.scale.set(...size.map(v=>Math.max(.002,v/100)));
  }else if(s.kind==='line')placeBeam(g.children[0],s.a,s.b,s.width);
  else if(s.kind==='panel'){
   const o=g.children[0],f=frame(s.a,s.b,[1,0,0]);o.position.fromArray(world(add(s.a,s.b).map(v=>v/2)));o.quaternion.copy(quaternion(direction(f.x),direction(f.y),direction(f.z).map(v=>-v)));o.scale.set(s.width/100,s.thickness/100,len(sub(s.b,s.a))/100);
  }else if(['wheel','roller','weight'].includes(s.kind)){
   const o=g.children[0];o.position.fromArray(world(c));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec(direction(unit(axis))));const r=(s.radius||6)/100;o.scale.set(r,s.kind==='roller'?.36:.055,r);
  }else if(['barbell','dumbbell'].includes(s.kind)){
   const big=s.kind==='barbell',half=big?61:12,plateAt=big?48:9,r=big?(s.radius||17):6;
   const shaft=g.children[0];placeBeam(shaft,add(c,axis,-half),add(c,axis,half),big?2.8:2.4);
   for(const o of g.children.slice(1)){
    if(o.name==='sleeve'){placeBeam(o,add(c,axis,34*o.userData.sign),add(c,axis,61*o.userData.sign),5);continue;}
    const collar=o.name==='collar',at=plateAt+(collar?3:0);o.position.fromArray(world(add(c,axis,at*o.userData.sign)));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),vec(direction(unit(axis))));o.scale.set((collar?3.5:r)/100,collar?.018:(big?.050:.035),(collar?3.5:r)/100);
   }
  }else if(s.kind==='kettlebell'){
   placeSphere(g.children[0],c,[s.radius||8.5,s.radius||8.5,s.radius||8.5]);
   const h=g.children[1],d=unit(sub(c,s.grip)),x=[1,0,0],z=unit(cross(x,d));h.position.fromArray(world(add(s.grip,d,3)));h.quaternion.copy(quaternion(direction(x),direction(d).map(v=>-v),direction(z)));
  }
 }
 function apply(data,nextOptions={}){
  lastData=data;options={...options,...nextOptions};const R=data.pose;
  updateGrid(body.geometry,data.torsoRings.length-1,torsoCols,(t,q)=>{
   const i=Math.min(data.torsoRings.length-2,Math.floor(t*(data.torsoRings.length-1))),f=t*(data.torsoRings.length-1)-i,a=data.torsoRings[i],b=data.torsoRings[i+1],h=a[0]+(b[0]-a[0])*f,w=a[1]+(b[1]-a[1])*f,ant=a[2]+(b[2]-a[2])*f,post=a[3]+(b[3]-a[3])*f,angle=q*Math.PI*2,s=Math.cos(angle);
   return add(add(torsoCenter(R,h),R.x,w*Math.sin(angle)),R.chestN||R.n,(s>=0?ant:post)*s);
  });
  placeSphere(head,R.head,[8.8,12.3,10]);const hu=direction(R.headU),hn=direction(R.headN),hx=unit(cross(hu,hn));head.quaternion.copy(quaternion(hx,hu,hn));
  placeSphere(nose,add(R.head,R.headN,9.5),[1.7,2,3]);placeBeam(neck,add(R.sh,R.chestU||R.u,-2),R.head,8.5);
  for(const side of ['L','R']){
   for(const kind of ['ua','fa','th','sh']){
    const p=parts[kind+side],a=R[p.a],b=R[p.b],f=frame(a,b,R.n),prof=data.limbProfiles[kind];
    updateGrid(p.mesh.geometry,limbRows,limbCols,(t,q)=>{const[r1,r2]=radius(prof,t),theta=q*Math.PI*2;return add(add(add(a,sub(b,a),t),f.x,r1*Math.cos(theta)),f.y,r2*Math.sin(theta));});
   }
   for(const name of ['sh','el','kn']){const p=parts[name+'-joint'+side];placeSphere(p.mesh,R[name+side],[p.r,p.r,p.r]);}
   const hand=parts['hand'+side].mesh;hand.position.fromArray(world(R['grip'+side]));const d=unit(sub(R['grip'+side],R['wr'+side])),axis=[1,0,0];let z=cross(axis,d);if(len(z)<.01)z=cross(axis,[0,1,0]);z=unit(z);hand.quaternion.copy(quaternion(direction(axis),direction(unit(cross(z,axis))),direction(z).map(v=>-v)));
   const a=R['heel'+side],b=R['toe'+side],shoe=parts['shoe'+side].mesh;placeBeam(shoe,a,b,8);shoe.scale.x=.095;shoe.scale.z=.055;
   const ta=R['hip'+side],tb=R['kn'+side],f=frame(ta,tb,R.n);updateGrid(parts['shorts'+side].mesh.geometry,2,16,(t,q)=>{const u=t*.145,[r1,r2]=radius(data.limbProfiles.th,u),angle=q*Math.PI*2;return add(add(add(ta,sub(tb,ta),u),f.x,(r1+.2)*Math.cos(angle)),f.y,(r2+.2)*Math.sin(angle));});
   for(const name of ['sh','el','wr','hip','kn','an'])parts['dot'+name+side].mesh.position.fromArray(world(R[name+side]));
  }
  dots.visible=!!options.joints;
  const groups=new Map();for(const f of data.surfaces){const key=f.id+':'+f.side;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
  for(const[key,faces]of groups){
   let o=regionMeshes.get(key);if(!o){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(faces.length*6*3),3));const m=material('#a7b3c6');m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;o=mesh(regionsGroup,g,m,key);o.userData={region:faces[0].id,side:faces[0].side};regionMeshes.set(key,o);}
   if(o.geometry.attributes.position.count!==faces.length*6){o.geometry.dispose();o.geometry=new THREE.BufferGeometry();o.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(faces.length*6*3),3));}
   let i=0;const p=o.geometry.attributes.position;for(const f of faces)for(const j of [0,1,2,0,2,3])p.setXYZ(i++,...world(f.points[j]));p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();o.geometry.computeBoundingBox();
   const id=faces[0].id,side=faces[0].side,active=options.muscles!==false&&(!options.selected||options.selected==='all'||options.selected===id||options.selected===faces[0].parent);o.visible=options.muscles!==false;o.material.color.set(active?options.color(data.sideValues?.[side]?.[id]??data.values[id]??.28):'#9aaac1');
  }
  if(propNodes.length!==data.props.length||propNodes.some((n,i)=>n.kind!==data.props[i].kind)){
   equipment.traverse(o=>o.geometry?.dispose());equipment.clear();propNodes=data.props.map(propNode);
  }
  data.props.forEach((s,i)=>updateProp(propNodes[i],s));scene.updateMatrixWorld(true);
 }
 const cameras=Object.fromEntries(Object.entries(CAMERA_SETTINGS).map(([id,[yaw,elev]])=>{
  const y=yaw*Math.PI/180,e=elev*Math.PI/180,eye=[-Math.sin(y)*Math.cos(e),-Math.sin(e),Math.cos(y)*Math.cos(e)];
  const c=new THREE.OrthographicCamera(-1,1,1,-1,.01,30);c.position.fromArray(eye.map(v=>v*8));c.lookAt(0,0,0);c.updateMatrixWorld(true);return[id,c];
 }));
 const bounds=Object.fromEntries(Object.keys(cameras).map(id=>[id,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}]));
 function includeBounds(){
  scene.traverse(o=>{if(!o.isMesh||!o.visible||o===floor||o.parent===dots)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
   for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){
    const p=vec([x,y,z]).applyMatrix4(o.matrixWorld);for(const[id,c]of Object.entries(cameras)){const q=p.clone().applyMatrix4(c.matrixWorldInverse),e=bounds[id];e.minX=Math.min(e.minX,q.x);e.maxX=Math.max(e.maxX,q.x);e.minY=Math.min(e.minY,q.y);e.maxY=Math.max(e.maxY,q.y);}
   }
  });
 }
 function resize(width,height){
  for(const[id,c]of Object.entries(cameras)){
   const b=bounds[id],cx=(b.minX+b.maxX)/2,cy=(b.minY+b.maxY)/2;let w=(b.maxX-b.minX)*1.13,h=(b.maxY-b.minY)*1.13;
   const ratio=width/height;if(w/h<ratio)w=h*ratio;else h=w/ratio;c.left=cx-w/2;c.right=cx+w/2;c.top=cy+h/2;c.bottom=cy-h/2;c.updateProjectionMatrix();
  }
 }
 apply(first,{color:()=> '#a7b3c6'});
 return{scene,cameras,apply,includeBounds,resize,bounds,regionMeshes,parts,body,head,propNodes:()=>propNodes,
  dispose(){const materials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material))materials.add(m);});for(const m of materials)m.dispose();}};
}
