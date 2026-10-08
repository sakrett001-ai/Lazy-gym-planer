import * as THREE from 'three';
import {createCatalogScene} from '../../../src/volume/scene.mjs';
/* Контактные листы: одна WebGL-сцена на ячейку, рендер в общий холст */
function dataFor(rig,t,has){const R=rig(t);return{exerciseId:'lab',pose:R,body:Mannequin.bodyData(R),surfaces:[],values:{},regions:{},props:R.props.filter(p=>!p.optional||!has||has(p.optional)),torsoRings:[],limbProfiles:{}};}
window.Lab={
 sheet(specs,entries,{w=380,h=300,cols=4,title='',light=true}={}){
  const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(w,h);renderer.setPixelRatio(1);
  const head=title?34:0,lab=22,rows=Math.ceil(specs.length/cols),canvas=document.createElement('canvas');canvas.width=cols*w;canvas.height=head+rows*(h+lab);
  const ctx=canvas.getContext('2d');ctx.fillStyle='#0b1018';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.font='15px sans-serif';
  if(title){ctx.fillStyle='#e6eefa';ctx.font='bold 18px sans-serif';ctx.fillText(title,10,23);ctx.font='14px sans-serif';}
  specs.forEach((s,i)=>{
   const rig=GymEquipment.rig(entries[s.id]),x=(i%cols)*w,y=head+Math.floor(i/cols)*(h+lab);
   const view=createCatalogScene(dataFor(rig,s.t));
   if(light){view.scene.background=new THREE.Color('#e4e9ef');view.scene.traverse(o=>{if(o.name==='floor')o.material.color.set('#c9d1db');if(o.isGridHelper){o.material.color.set('#aab4c0');}});const a=view.scene.children.find(o=>o.isAmbientLight);if(a)a.intensity=.75;}
   for(let k=0;k<=8;k++){view.apply(dataFor(rig,k/8),{muscles:false,joints:!!s.joints,color:()=>'#a7b3c6'});view.includeBounds();}
   view.resize(w,h);view.apply(dataFor(rig,s.t),{muscles:false,joints:!!s.joints,color:()=>'#a7b3c6'});
   renderer.render(view.scene,view.cameras[s.cam]);ctx.drawImage(renderer.domElement,x,y+lab);
   ctx.fillStyle='#cbd7ec';ctx.fillText(`${s.label||s.id} · t=${s.t} · ${s.cam}`,x+8,y+16);view.dispose();
  });
  renderer.dispose();return canvas.toDataURL('image/png');
 }
};
