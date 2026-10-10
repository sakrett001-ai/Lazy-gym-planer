import * as THREE from 'three';
import {createCatalogScene} from '../../src/volume/scene.mjs';
function dataFor(rig,t,has){const R=rig(t);return{exerciseId:'lab',pose:R,body:Mannequin.bodyData(R),surfaces:[],values:{},regions:{},props:R.props.filter(p=>GymEquipment.visible(p,has)),torsoRings:[],limbProfiles:{}};}
const W=p=>[p[0]/100,(186-p[1])/100,p[2]/100];
function addBones(view,R,body,opacity){
 const group=new THREE.Group();group.name='skeleton';view.scene.add(group);
 const mat=new THREE.MeshStandardMaterial({color:'#efe4cc',roughness:.62,metalness:0,side:THREE.DoubleSide});
 for(const {bone,pos} of Skeleton.place(R,body,window.BONES.bones)){
  const g=new THREE.BufferGeometry(),p=new Float32Array(pos.length);for(let i=0;i<pos.length;i+=3){const w=W([pos[i],pos[i+1],pos[i+2]]);p[i]=w[0];p[i+1]=w[1];p[i+2]=w[2];}
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setIndex(bone.side==='L'&&false?bone.f:bone.f);g.computeVertexNormals();
  const m=new THREE.Mesh(g,mat);m.castShadow=true;group.add(m);
 }
 const man=view.scene.getObjectByName('mannequin');
 if(man)man.traverse(o=>{if(o.isMesh){o.material=o.material.clone();o.material.transparent=true;o.material.opacity=opacity;o.material.depthWrite=false;o.castShadow=false;o.renderOrder=5;}});
}
window.Lab={
 sheet(specs,entries,{w=380,h=300,cols=4,has=null,opacity=.22,focus=null,span=.6}={}){
  const hasFn=has==null||has==='all'?()=>true:has==='none'?()=>false:(k=>has.split('+').includes(k));
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(w,h);renderer.setPixelRatio(1);
  const lab=22,rows=Math.ceil(specs.length/cols),canvas=document.createElement('canvas');canvas.width=cols*w;canvas.height=rows*(h+lab);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1018';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='15px sans-serif';
  specs.forEach((s,i)=>{
   const rig=GymEquipment.rig(entries[s.id]),x=(i%cols)*w,y=Math.floor(i/cols)*(h+lab);
   const view=createCatalogScene(dataFor(rig,s.t,hasFn));
   view.scene.background=new THREE.Color('#e4e9ef');view.scene.traverse(o=>{if(o.name==='floor')o.material.color.set('#c9d1db');});
   for(let k=0;k<=8;k++){view.apply(dataFor(rig,k/8,hasFn),{muscles:false,joints:false,color:()=>'#a7b3c6'});view.includeBounds();}
   view.resize(w,h);const d=dataFor(rig,s.t,hasFn);view.apply(d,{muscles:false,joints:false,color:()=>'#b9c6da'});
   addBones(view,d.pose,d.body,s.opacity??opacity);
   const cam=view.cameras[s.cam],saved=focus&&cam.isOrthographicCamera?[cam.left,cam.right,cam.top,cam.bottom]:null;
   if(saved){const R=d.pose,f=R[focus],q=new THREE.Vector3(...W(f)).applyMatrix4(cam.matrixWorldInverse),hh=span*h/w/2;cam.left=q.x-span/2;cam.right=q.x+span/2;cam.top=q.y+hh;cam.bottom=q.y-hh;cam.updateProjectionMatrix();}
   renderer.render(view.scene,cam);ctx.drawImage(renderer.domElement,x,y+lab);
   if(saved){[cam.left,cam.right,cam.top,cam.bottom]=saved;cam.updateProjectionMatrix();}
   ctx.fillStyle='#cbd7ec';ctx.fillText(`${s.label||s.id} · t=${s.t} · ${s.cam}`,x+8,y+16);view.dispose();
  });
  renderer.dispose();return canvas.toDataURL('image/png');
 }
};
