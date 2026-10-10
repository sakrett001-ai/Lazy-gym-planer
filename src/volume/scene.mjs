import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createMannequinBody} from './body.mjs';
import {createSkeletonLayer} from './skeleton.mjs';
import {isNewProp,propKey,createPropNode,updatePropNode} from './props.mjs';

const add=(a,b,k=1)=>a.map((v,i)=>v+b[i]*k),sub=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a);
const unit=a=>{const l=len(a);if(l<1e-8)throw Error('Degenerate scene direction');return a.map(v=>v/l);};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const world=p=>[p[0]/100,(186-p[1])/100,p[2]/100];
const direction=p=>[p[0],-p[1],p[2]],vec=p=>new THREE.Vector3(...p);
const CAMERA_SETTINGS={above:[35,-55],angle:[55,-15],side:[90,0],front:[0,0],back:[180,0],rear:[235,-15]};
function frame(a,b,reference){
 const z=unit(sub(b,a));let x=sub(reference,z.map(v=>v*dot(reference,z)));
 if(len(x)<1e-5)x=cross(z,Math.abs(z[0])<.8?[1,0,0]:[0,0,1]);x=unit(x);return{x,y:unit(cross(z,x)),z};
}
function quaternion(x,y,z){return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(vec(x),vec(y),vec(z)));}
/* Студийный свет и материалы. Материалы физические (roughness/metalness): матовый манекен, порошковая краска рамы,
   хром грифа, резина блинов, винил подушек. Свет — три источника и небо: ключевой тёплый сверху-слева с мягкой тенью,
   холодный заполняющий, контровой сзади, отделяющий силуэт от фона. Тон — Khronos PBR Neutral: цвета мышц не уплывают;
   у него глубокий «носок» в тенях, поэтому тёмные материалы заданы светлее, чем выглядят в кадре. */
function material(color,{roughness=.6,metalness=0}={}){return new THREE.MeshStandardMaterial({color,roughness,metalness,side:THREE.DoubleSide});}
function mesh(parent,g,m,name){const o=new THREE.Mesh(g,m);o.name=name;o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
export const STUDIO={
 background:['#1b2636','#0b1119'],           /* фон: центр и края виньетки */
 floor:['#44536b','#111925'],                /* пол: световое пятно под сценой и края */
 hemi:[0xe4ecf7,0x3a4252,2.1],              /* небо, земля, сила */
 key:[0xfff1e0,1.9,[-2.2,5.2,3.2]],          /* ключевой: цвет, сила, направление (откуда светит) */
 fill:[0xbcd2ff,.9,[3.4,1.6,2.4]],
 rim:[0xd8e6ff,1.5,[1.2,3.2,-4.6]],
 environment:0,                              /* отражения студии на металле (PMREM). Выключены: на программном GL кадр в 10–20 раз дороже,
                                                на телефонах не измерено; металл держится на бликах трёх источников */
 shadow:'pcf',                               /* 'soft' | 'pcf' | false */
 exposure:.93,                               /* на 7 % тише: сверху освещённые мышцы не выцветают */
 muscleGlow:.28                              /* собственное свечение мышц: держит цвет в тени, не пересвечивает на свету */
};
/* радиальная растяжка пола без DOM: светлое пятно под сценой, к краям — в цвет фона */
function radialTexture(inner,outer,size=128){
 const a=new THREE.Color(inner),b=new THREE.Color(outer),data=new Uint8Array(size*size*4),c=new THREE.Color();
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const r=Math.min(1,Math.hypot(x/(size-1)-.5,y/(size-1)-.5)*2),k=r*r*(3-2*r);c.copy(a).lerp(b,k);
  const i=(y*size+x)*4;data[i]=Math.round(c.r*255);data[i+1]=Math.round(c.g*255);data[i+2]=Math.round(c.b*255);data[i+3]=255;
 }
 const t=new THREE.DataTexture(data,size,size);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;
}
/* сетка пола гаснет к краям, а не обрывается */
function fadingGrid(size,divisions,color,center){
 const pts=[],cols=[],h=size/2,step=size/divisions,c=new THREE.Color(color),fade=(x,z)=>Math.max(0,1-Math.hypot(x,z)/h)**1.6;
 for(let i=0;i<=divisions;i++){const v=-h+i*step;for(let j=0;j<divisions;j++){const u0=-h+j*step,u1=u0+step;
  pts.push(v,0,u0,v,0,u1,u0,0,v,u1,0,v);for(const[x,z]of [[v,u0],[v,u1],[u0,v],[u1,v]])cols.push(c.r,c.g,c.b,fade(x,z));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setAttribute('color',new THREE.Float32BufferAttribute(cols,4));
 const lines=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true,transparent:true,opacity:.55,depthWrite:false}));lines.name='floor-grid';lines.position.set(...center);return lines;
}
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
// Closed fingers must follow the handle's axis, rather than the world's X axis.
// A neutral-grip dumbbell and a dip rail have different axes from a barbell.
function gripAxis(R,side,props){
 const grip=R['grip'+side],candidates=[];
 for(const p of props){
  let center,axis,half,priority=0;
  if(['dumbbell','barbell'].includes(p.kind)){center=p.c;axis=p.axis||[1,0,0];half=p.kind==='dumbbell'?6:40;priority=1;}
  else if(p.kind==='kettlebell'&&p.grip){center=p.grip;axis=p.axis||[1,0,0];half=8;priority=1;}
  else if(p.kind==='line'&&p.equipmentRole==='grip'&&(!p.side||p.side===side)){
   center=add(p.a,p.b).map(v=>v/2);axis=sub(p.b,p.a);half=len(axis)/2;priority=2;
  }else continue;
  if(len(axis)<1e-8)continue;axis=unit(axis);const delta=sub(grip,center),along=dot(delta,axis),distance=len(sub(delta,axis.map(v=>v*along)));
  if(Math.abs(along)<=half+2&&distance<5)candidates.push({axis,distance,priority});
 }
 candidates.sort((a,b)=>b.priority-a.priority||a.distance-b.distance);
 const d=unit(sub(grip,R['wr'+side]));
 if(candidates.length)return candidates[0].axis;
 // For an empty hand, preserve the wrist direction and the body's lateral frame.
 let x=sub(R.x,d.map(v=>v*dot(R.x,d)));
 if(len(x)<1e-5)x=cross(d,Math.abs(d[0])<.8?[1,0,0]:[0,0,1]);
 return unit(x);
}
function placeHand(hand,R,side,props){
 const grip=R['grip'+side],axis=gripAxis(R,side,props),d=unit(sub(grip,R['wr'+side]));
 let y=sub(d,axis.map(v=>v*dot(d,axis)));
 if(len(y)<1e-5)y=cross(axis,Math.abs(axis[1])<.8?[0,1,0]:[0,0,1]);
 y=unit(y);const z=unit(cross(axis,y));
 hand.position.fromArray(world(grip));hand.quaternion.copy(quaternion(direction(axis),direction(y),direction(z).map(v=>-v)));
}
export function createCatalogScene(first,{coarse=false}={}){
 const limbRows=coarse?5:10,limbCols=coarse?8:16,torsoCols=coarse?12:24;
 const scene=new THREE.Scene();scene.background=new THREE.Color(STUDIO.background[1]);
 /* манекен — матовый «скульптурный» пластик: светлее прежнего, чтобы жёлто-оранжевые мышцы и тени читались */
 const skin=material('#a0adc0',{roughness:.62}),joint=material('#96a4b8',{roughness:.6}),shorts=material('#46546d',{roughness:.86}),sole=material('#323c4c',{roughness:.78});
 const mats={steel:material('#6a7fa2',{roughness:.42,metalness:.25}),bar:material('#d3dbe6',{roughness:.26,metalness:.5}),pad:material('#3c4a62',{roughness:.66}),plate:material('#3d506b',{roughness:.5,metalness:.15}),
  cable:material('#8494aa',{roughness:.35,metalness:.4}),band:material('#6f9fc7',{roughness:.7}),mat:material('#2a3a52',{roughness:.95}),
  frame:material('#7186a7',{roughness:.45,metalness:.25}),chrome:material('#dde4ee',{roughness:.24,metalness:.5}),rubber:material('#2b3341',{roughness:.95}),wood:material('#7a6450',{roughness:.78}),
  wall:material('#2a3546',{roughness:.92}),stack:material('#53668a',{roughness:.4,metalness:.3}),rope:material('#b8a07a',{roughness:.92}),towel:material('#c9cfd8',{roughness:1})};
 const hemi=new THREE.HemisphereLight(STUDIO.hemi[0],STUDIO.hemi[1],STUDIO.hemi[2]);scene.add(hemi);
 const light=(color,power,dir)=>{const l=new THREE.DirectionalLight(color,power);l.position.set(...dir);scene.add(l);scene.add(l.target);return l;};
 const key=light(...STUDIO.key),fill=light(...STUDIO.fill),rim=light(...STUDIO.rim);key.name='key-light';fill.name='fill-light';rim.name='rim-light';
 const floorTexture=radialTexture(...STUDIO.floor);
 const floor=mesh(scene,new THREE.PlaneGeometry(12,12),new THREE.MeshStandardMaterial({map:floorTexture,roughness:.94,metalness:0}),'floor');floor.rotation.x=-Math.PI/2;floor.position.y=-.014;floor.castShadow=false;floor.position.z=.6;
 const floorGrid=fadingGrid(5,20,0x485b76,[0,-.01,1]);scene.add(floorGrid);
 const mannequin=first.body?createMannequinBody(scene,first,{skin,joint,sole,mesh}):null;
 const parts=mannequin?mannequin.parts:{};let body=mannequin?mannequin.parts.torso.mesh:null,head=mannequin?mannequin.parts.head.mesh:null,nose,neck,dots;
 /* режим «Скелет»: кости внутри, кожа полупрозрачная и не отбрасывает тень на кости; мышцы по фазам скрыты */
 const skeletonLayer=createSkeletonLayer(scene);let ghosted=false;
 function ghost(on){
  if(on!==ghosted){ghosted=on;for(const m of [skin,joint,sole]){m.transparent=on;m.opacity=on?.22:1;m.depthWrite=!on;m.needsUpdate=true;}}
  if(mannequin)mannequin.group.traverse(o=>{if(o.isMesh)o.castShadow=!on;});
 }
 if(!mannequin){
 body=mesh(scene,grid(first.torsoRings.length-1,torsoCols),skin,'torso');
 head=mesh(scene,new THREE.SphereGeometry(1,18,12),skin,'head');nose=mesh(scene,new THREE.SphereGeometry(1,10,8),joint,'nose');neck=mesh(scene,new THREE.CylinderGeometry(1,1,1,12),skin,'neck');
 dots=new THREE.Group();dots.name='joint-dots';scene.add(dots);const dotMat=new THREE.MeshBasicMaterial({color:'#e2f1ff',depthTest:false,toneMapped:false});
 for(const side of ['L','R']){
  for(const[kind,a,b]of [['ua','sh','el'],['fa','el','wr'],['th','hip','kn'],['sh','kn','an']])parts[kind+side]={a:a+side,b:b+side,mesh:mesh(scene,grid(limbRows,limbCols),skin,kind+side)};
  for(const[name,r]of [['sh',6.4],['el',4.3],['wr',2.7],['kn',5.2]])parts[name+'-joint'+side]={r,mesh:mesh(scene,new THREE.SphereGeometry(1,14,10),joint,name+'-joint'+side)};
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
 }
 const regionMeshes=new Map(),regionsGroup=new THREE.Group();regionsGroup.name='regions';scene.add(regionsGroup);
 const equipment=new THREE.Group();equipment.name='equipment';scene.add(equipment);let propNodes=[],lastData,options={};
 /* метки нагрузки на суставы: красный ореол с ядром, видны сквозь тело и снаряд */
 const stressGroup=new THREE.Group();stressGroup.name='joint-stress';scene.add(stressGroup);
 const stressGeo=new THREE.SphereGeometry(1,18,12),stressHalo=new THREE.MeshBasicMaterial({color:'#ff3b30',transparent:true,opacity:.36,depthTest:false,depthWrite:false,toneMapped:false}),stressCore=new THREE.MeshBasicMaterial({color:'#ff453a',depthTest:false,depthWrite:false,toneMapped:false});
 const stressMarks=[],calm=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
 function stressMark(i){
  while(stressMarks.length<=i){const g=new THREE.Group();g.name='stress-mark';const halo=new THREE.Mesh(stressGeo,stressHalo),core=new THREE.Mesh(stressGeo,stressCore);halo.renderOrder=20;core.renderOrder=21;core.scale.setScalar(.03);g.add(halo,core);stressGroup.add(g);stressMarks.push(g);}
  return stressMarks[i];
 }
 function applyStress(marks){
  const pulse=calm?1:1+.18*Math.sin((typeof performance!=='undefined'?performance.now():0)/170);
  marks.forEach((m,i)=>{const g=stressMark(i);g.visible=true;g.position.fromArray(world(m.p));g.children[0].scale.setScalar(.078*pulse);});
  for(let i=marks.length;i<stressMarks.length;i++)stressMarks[i].visible=false;
 }
 function propNode(s,i){
  if(isNewProp(s))return createPropNode(equipment,s,mats,mesh);
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
  return{group:g,kind:s.kind,key:s.kind};
 }
 function updateProp(node,s){
  if(isNewProp(s))return updatePropNode(node,s);
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
  if(mannequin)mannequin.apply(data,options);
  const skeletonOn=!!(mannequin&&options.skeleton&&data.body);
  if(skeletonOn)skeletonLayer.update(options.skeleton,R,data.body);else skeletonLayer.hide();
  if(mannequin&&(skeletonOn||ghosted))ghost(skeletonOn);
  if(!mannequin){
  updateGrid(body.geometry,data.torsoRings.length-1,torsoCols,(t,q)=>{
   const i=Math.min(data.torsoRings.length-2,Math.floor(t*(data.torsoRings.length-1))),f=t*(data.torsoRings.length-1)-i,a=data.torsoRings[i],b=data.torsoRings[i+1],h=a[0]+(b[0]-a[0])*f,w=a[1]+(b[1]-a[1])*f,ant=a[2]+(b[2]-a[2])*f,post=a[3]+(b[3]-a[3])*f,angle=q*Math.PI*2,s=Math.cos(angle);
   return add(add(torsoCenter(R,h),R.x,w*Math.sin(angle)),R.chestN||R.n,(s>=0?ant:post)*s);
  });
  placeSphere(head,R.head,[8.8,12.3,10]);const hu=direction(R.headU),hn=direction(R.headN),hx=unit(cross(hu,hn));head.quaternion.copy(quaternion(hx,hu,hn));
  placeSphere(nose,add(R.head,R.headN,9.5),[1.7,2,3]);placeBeam(neck,add(R.sh,R.chestU||R.u,-2),R.head,8.5);
  for(const side of ['L','R']){
   for(const kind of ['ua','fa','th','sh']){
    const p=parts[kind+side],a=R[p.a],b=R[p.b],f=frame(a,b,kind==='th'||kind==='sh'?cross(R.x,sub(b,a)):R.n),prof=data.limbProfiles[kind];
    updateGrid(p.mesh.geometry,limbRows,limbCols,(t,q)=>{const[r1,r2]=radius(prof,t),theta=q*Math.PI*2;return add(add(add(a,sub(b,a),t),f.x,r1*Math.cos(theta)),f.y,r2*Math.sin(theta));});
   }
   for(const name of ['sh','el','wr','kn']){const p=parts[name+'-joint'+side];placeSphere(p.mesh,R[name+side],[p.r,p.r,p.r]);}
   placeHand(parts['hand'+side].mesh,R,side,data.props);
   const a=R['heel'+side],b=R['toe'+side],shoe=parts['shoe'+side].mesh;placeBeam(shoe,a,b,8);shoe.scale.x=.095;shoe.scale.z=.055;
   const ta=R['hip'+side],tb=R['kn'+side],f=frame(ta,tb,cross(R.x,sub(tb,ta)));updateGrid(parts['shorts'+side].mesh.geometry,2,16,(t,q)=>{const u=t*.145,[r1,r2]=radius(data.limbProfiles.th,u),angle=q*Math.PI*2;return add(add(add(ta,sub(tb,ta),u),f.x,(r1+.2)*Math.cos(angle)),f.y,(r2+.2)*Math.sin(angle));});
   for(const name of ['sh','el','wr','hip','kn','an'])parts['dot'+name+side].mesh.position.fromArray(world(R[name+side]));
  }
  dots.visible=!!options.joints;
  }
  const groups=new Map();for(const f of data.surfaces){const key=f.id+':'+f.side;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(f);}
  for(const[key,faces]of groups){
   let o=regionMeshes.get(key);if(!o){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(faces.length*6*3),3));const m=material('#a7b3c6',{roughness:.82});m.polygonOffset=true;m.polygonOffsetFactor=-1;m.polygonOffsetUnits=-1;o=mesh(regionsGroup,g,m,key);o.receiveShadow=false;o.userData={region:faces[0].id,side:faces[0].side};regionMeshes.set(key,o);}
   if(o.geometry.attributes.position.count!==faces.length*6){o.geometry.dispose();o.geometry=new THREE.BufferGeometry();o.geometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(faces.length*6*3),3));}
   let i=0;const p=o.geometry.attributes.position;for(const f of faces)for(const j of [0,1,2,0,2,3])p.setXYZ(i++,...world(f.points[j]));p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();o.geometry.computeBoundingBox();
   const id=faces[0].id,side=faces[0].side,muscles=options.muscles!==false&&!skeletonOn,active=muscles&&(!options.selected||options.selected==='all'||options.selected===id||options.selected===faces[0].parent);o.visible=muscles;o.material.color.set(active?options.color(data.sideValues?.[side]?.[id]??data.values[id]??.28):'#a0adc0');
   /* собственное свечение участка: жёлтый и оранжевый в тени не уходят в коричневый */
   if(active)o.material.emissive.copy(o.material.color).multiplyScalar(STUDIO.muscleGlow);else o.material.emissive.setRGB(0,0,0);
  }
  if(propNodes.length!==data.props.length||propNodes.some((n,i)=>n.key!==(isNewProp(data.props[i])?propKey(data.props[i]):data.props[i].kind))){
   equipment.traverse(o=>o.geometry?.dispose());equipment.clear();propNodes=data.props.map(propNode);
  }
  data.props.forEach((s,i)=>updateProp(propNodes[i],s));applyStress(options.stress?data.stress||[]:[]);scene.updateMatrixWorld(true);
 }
 const cameras=Object.fromEntries(Object.entries(CAMERA_SETTINGS).map(([id,[yaw,elev]])=>{
  const y=yaw*Math.PI/180,e=elev*Math.PI/180,eye=[-Math.sin(y)*Math.cos(e),-Math.sin(e),Math.cos(y)*Math.cos(e)];
  const c=new THREE.OrthographicCamera(-1,1,1,-1,.01,30);c.position.fromArray(eye.map(v=>v*8));c.lookAt(0,0,0);c.updateMatrixWorld(true);return[id,c];
 }));
 const bounds=Object.fromEntries(Object.keys(cameras).map(id=>[id,{minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity}]));
 function includeBounds(){
  scene.traverse(o=>{if(!o.isMesh||!o.visible||o===floor||o.name==='dot-ring'||o.parent===dots||o.parent?.name==='joint-dots'||o.parent?.parent===stressGroup)return;if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();const b=o.geometry.boundingBox;
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
 /* Студия для настоящего рендерера: тон, мягкие тени, отражения, фон. Без WebGL (тесты, аудит) сцена остаётся той же,
    только без этих эффектов. Тень отбрасывают все; принимают пол и инвентарь — на теле тень не перекрывает цвет мышц. */
 let studioTextures=[],metalEnv=null;
 function studio(renderer){
  if(!renderer?.isWebGLRenderer)return false;studioRenderer=renderer;
  renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=STUDIO.exposure;renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.shadowMap.enabled=!!STUDIO.shadow;renderer.shadowMap.type=STUDIO.shadow==='soft'?THREE.PCFSoftShadowMap:THREE.PCFShadowMap;
  if(STUDIO.environment)try{
   const pmrem=new THREE.PMREMGenerator(renderer),env=new RoomEnvironment(),rt=pmrem.fromScene(env,.04);studioTextures.push(rt);env.dispose?.();pmrem.dispose();
   metalEnv=rt.texture;for(const m of Object.values(mats))if(m.metalness>=.3){m.envMap=metalEnv;m.envMapIntensity=STUDIO.environment;m.needsUpdate=true;}
  }catch(e){metalEnv=null;}
  if(typeof document!=='undefined'){
   const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d');
   if(g){const grad=g.createRadialGradient(128,112,10,128,128,190);grad.addColorStop(0,STUDIO.background[0]);grad.addColorStop(1,STUDIO.background[1]);g.fillStyle=grad;g.fillRect(0,0,256,256);
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;scene.background=t;studioTextures.push(t);}
  }
  key.castShadow=!!STUDIO.shadow;key.shadow.mapSize.set(1024,1024);key.shadow.bias=-.0004;key.shadow.normalBias=.02;key.shadow.radius=4;
  /* тело тень отбрасывает, но не принимает (манекен и мышцы — при создании, здесь — запасная фигура без манекена) */
  if(!mannequin)for(const p of Object.values(parts))p?.mesh?.traverse?.(o=>{if(o.isMesh)o.receiveShadow=false;});
  /* точки суставов — разметка, а не предметы: тени не отбрасывают */
  scene.getObjectByName('joint-dots')?.traverse(o=>{o.castShadow=false;o.receiveShadow=false;});
  fitShadow();return true;
 }
 /* тени можно выключить на ходу (слабая графика): материалы пересобираются без теневого кода */
 let studioRenderer=null;
 function setShadows(on){
  if(!studioRenderer)return;on=!!on&&!!STUDIO.shadow;if(studioRenderer.shadowMap.enabled===on)return;
  studioRenderer.shadowMap.enabled=on;key.castShadow=on;scene.traverse(o=>{if(o.material)for(const m of [].concat(o.material))m.needsUpdate=true;});
 }
 /* теневая камера ключевого света охватывает всю сцену со всеми фазами (по рамке камер) с запасом */
 function fitShadow(){
  const box=new THREE.Box3();scene.traverse(o=>{if(!o.isMesh||!o.visible||o===floor||o.name==='dot-ring'||o.parent===dots||o.parent?.name==='joint-dots'||o.parent?.parent===stressGroup)return;box.expandByObject(o);});
  if(box.isEmpty())box.set(new THREE.Vector3(-1,0,-1),new THREE.Vector3(1,2,2));
  box.expandByScalar(.7);const center=box.getCenter(new THREE.Vector3()),r=box.getSize(new THREE.Vector3()).length()/2;
  for(const l of [key,fill,rim]){l.target.position.copy(center);l.position.copy(center).add(l.userData.dir||(l.userData.dir=l.position.clone().normalize().multiplyScalar(8)));l.target.updateMatrixWorld();}
  const cam=key.shadow.camera;cam.left=-r;cam.right=r;cam.top=r;cam.bottom=-r;cam.near=.1;cam.far=8+r*2;cam.updateProjectionMatrix();key.shadow.needsUpdate=true;
 }
 apply(first,{color:()=> '#a7b3c6'});
 return{scene,cameras,apply,includeBounds,resize,bounds,regionMeshes,parts,body,head,mannequin,skeleton:skeletonLayer,propNodes:()=>propNodes,studio,fitShadow,setShadows,
  dispose(){const materials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of [].concat(o.material)){materials.add(m);m.map?.dispose();}});for(const m of materials)m.dispose();for(const t of studioTextures)t.dispose();studioTextures=[];}};
}
