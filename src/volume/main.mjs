import * as THREE from 'three';
import {createCatalogScene,world} from './scene.mjs';

export function createVolumeFigure(options){
 if(typeof window.WebGLRenderingContext==='undefined')return null;
 const root=document.createElement('div');root.className='fig volume-figure';root.setAttribute('role','img');root.setAttribute('aria-label',options.label);root.dataset.camera=options.camera||'above';
 let renderer;
 if(typeof window.WebGLRenderingContext!=='undefined')try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));}catch(e){renderer=null;}
 if(!renderer)return null;root.dataset.renderer='webgl';
 const data=(t,index)=>options.data(t,index,false);
 const scene=createCatalogScene(data(0,0)),cameras=scene.cameras;root.append(renderer.domElement);let disposed=false,lastT=options.t||0,lastIndex=0,camera=options.camera||'above',selected='all',muscles=options.muscles!==false,joints=!!options.joints;
 if(!cameras[camera])throw Error('Unknown volume camera '+camera);
 const apply=(t,index)=>scene.apply(data(t,index),{color:options.color,selected,muscles,joints});
 const trace=new THREE.Line(new THREE.BufferGeometry().setFromPoints(options.trace.map(p=>new THREE.Vector3(...world(p)))),new THREE.LineBasicMaterial({color:'#b4c3d9',transparent:true,opacity:.7}));trace.visible=false;scene.scene.add(trace);
 const vectors=new THREE.Group();vectors.name='movement-vectors';vectors.visible=false;scene.scene.add(vectors);
 for(const v of options.vectors){const a=new THREE.Vector3(...world(v.a)),b=new THREE.Vector3(...world(v.b)),d=b.clone().sub(a);vectors.add(new THREE.ArrowHelper(d.clone().normalize(),a,d.length(),/^(sh|hip)$/.test(v.key)?0x77a9d3:0xe97155,.075,.035));}
 // Fit actual rendered geometry over the whole motion, including optional equipment.
 for(let i=0;i<=24;i++){apply(i/24,0);scene.includeBounds();}apply(lastT,0);
 function draw(){if(disposed)return;renderer.render(scene.scene,cameras[camera]);}
 function resize(){if(disposed)return;const rect=root.getBoundingClientRect(),w=Math.max(1,Math.min(1100,rect.width||620)),h=Math.max(1,Math.round(rect.height||w/(options.ratio||1.15)));renderer.setSize(w,h);scene.resize(w,h);draw();}
 function at(t,frame){lastT=t;lastIndex=frame?.index||0;apply(t,lastIndex);root.dataset.pose=String(t);root.dataset.phase=String(lastIndex);draw();}
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(root);resize();
 const setMuscles=show=>{muscles=!!show;at(lastT,{index:lastIndex});};
 const setRegion=id=>{selected=id;at(lastT,{index:lastIndex});};
 const setJoints=show=>{joints=!!show;at(lastT,{index:lastIndex});};
 at(lastT,{index:lastIndex});
 return{svg:root,at,camera,setMuscles,setRegion,setJoints,setTrace(show){trace.visible=!!show;draw();},setVectors(show){vectors.visible=!!show;draw();},dispose(){if(disposed)return;disposed=true;observer?.disconnect();scene.dispose();renderer.dispose?.();renderer.forceContextLoss?.();}};
}
window.GymVolume={create:createVolumeFigure};
