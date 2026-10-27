import * as THREE from 'three';
import {createCatalogScene,GHOST} from '../../src/volume/scene.mjs';
/* Кадры пробы кожи: та же студия, что у объёмной сцены приложения (свет, тон, материал кожи манекена),
   ортокамеры с одинаковым масштабом для всех ячеек ряда. Тело — либо манекен приложения в нейтральной стойке,
   либо готовая сетка (Anny) с тем же материалом кожи. Кости — готовые сетки в мировых координатах (см). */
const cm=v=>v/100;
/* полупрозрачная кожа — копия ghostMaterial() из src/volume/scene.mjs (там функция не экспортируется) */
function ghostMaterial(){
 const m=new THREE.MeshStandardMaterial({color:GHOST.color,roughness:.7,metalness:0,transparent:true,depthWrite:false,side:THREE.DoubleSide});
 const f=v=>v.toFixed(4);
 m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
   vec3 ghostView=isOrthographic?vec3(0.,0.,1.):normalize(vViewPosition);
   float ghostRim=pow(1.-clamp(abs(dot(normalize(normal),ghostView)),0.,1.),${f(GHOST.power)});
   gl_FragColor=vec4(outgoingLight,${f(GHOST.core)}+${f(GHOST.rim-GHOST.core)}*ghostRim);`);};
 m.forceSinglePass=true;return m;
}
function meshFrom(pos,idx,material,name){
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(Float32Array.from(pos,cm),3));g.setIndex(idx);g.computeVertexNormals();
 const o=new THREE.Mesh(g,material);o.name=name;o.castShadow=true;o.receiveShadow=false;o.frustumCulled=false;return o;
}
const CAMS={front:[0,0],side:[90,0],back:[180,0],angle:[55,-15],rear:[235,-15],sideR:[-90,0]};
window.Probe={
 render(panels,{w=360,h=560}={}){
  const R=Mannequin.catalogPose(Mannequin.neutral());
  const data={exerciseId:'probe',pose:R,body:Mannequin.bodyData(R),surfaces:[],values:{},regions:{},props:[],torsoRings:[],limbProfiles:{}};
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(1);
  const out=[];
  for(const p of panels){
   const pw=p.w||w,ph=p.h||h;renderer.setSize(pw,ph);
   const view=createCatalogScene(data);view.studio(renderer);
   const skin=view.mannequin.parts.torso.mesh.material;
   const extra=new THREE.Group();extra.name='probe';view.scene.add(extra);
   if(p.body!=='mannequin')view.mannequin.group.visible=false;
   const ghost=p.ghost?ghostMaterial():null;
   if(p.mesh){
    const o=meshFrom(p.mesh.pos,p.mesh.idx,ghost||skin,'anny');extra.add(o);
    if(ghost){const depth=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,transparent:true,side:THREE.DoubleSide,forceSinglePass:true});const t=new THREE.Mesh(o.geometry,depth);t.renderOrder=GHOST.order;o.renderOrder=GHOST.order+1;o.castShadow=false;extra.add(t);}
   }
   if(p.body==='mannequin'&&ghost)view.mannequin.group.traverse(o=>{if(o.isMesh){o.material=ghost;o.castShadow=false;o.renderOrder=GHOST.order+1;}});
   if(p.bones){const bm=new THREE.MeshStandardMaterial({color:'#ece2cb',roughness:.62,metalness:0});
    for(const b of p.bones){const o=meshFrom(b.pos,b.idx,b.color?new THREE.MeshStandardMaterial({color:b.color,roughness:.6}):bm,'bone');extra.add(o);}}
   if(p.marks){const g=new THREE.SphereGeometry(1,12,8);
    for(const m of p.marks){const o=new THREE.Mesh(g,new THREE.MeshBasicMaterial({color:m.color||'#ff3b30',depthTest:!m.onTop,toneMapped:false}));o.position.set(cm(m.p[0]),cm(m.p[1]),cm(m.p[2]));o.scale.setScalar(cm(m.r||.8));o.renderOrder=30;extra.add(o);}}
   view.scene.updateMatrixWorld(true);view.fitShadow();
   /* камера: направление как у приложения, кадр — центр c (см) и ширина span (см) */
   const [yaw,elev]=CAMS[p.cam].map(v=>v*Math.PI/180),eye=[-Math.sin(yaw)*Math.cos(elev),-Math.sin(elev),Math.cos(yaw)*Math.cos(elev)];
   const c=new THREE.Vector3(...p.center.map(cm)),cam=new THREE.OrthographicCamera(-1,1,1,-1,.01,40);
   cam.position.copy(c).add(new THREE.Vector3(...eye).multiplyScalar(10));cam.lookAt(c);
   const sw=cm(p.span),sh=sw*ph/pw;cam.left=-sw/2;cam.right=sw/2;cam.top=sh/2;cam.bottom=-sh/2;cam.updateProjectionMatrix();
   renderer.render(view.scene,cam);out.push(renderer.domElement.toDataURL('image/png'));
   extra.traverse(o=>{o.geometry?.dispose();});view.dispose();
  }
  renderer.dispose();return out;
 }
};
