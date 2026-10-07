import * as THREE from 'three';
import {createCatalogScene,world} from './scene.mjs';

let rendererUnavailable=false;
const fittedBounds=new Map();
export function createVolumeFigure(options){
 if(rendererUnavailable)return null;
 if(typeof window.WebGL2RenderingContext==='undefined'){rendererUnavailable=true;return null;}
 const root=document.createElement('div');root.className='fig volume-figure';root.setAttribute('role','img');root.setAttribute('aria-label',options.label);root.dataset.camera=options.camera||'above';
 const canvas=document.createElement('canvas'),attributes={antialias:true,alpha:false,powerPreference:'low-power'};
 let renderer,context;
 try{context=canvas.getContext('webgl2',attributes);if(context){renderer=new THREE.WebGLRenderer({canvas,context,...attributes});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));}}catch(e){renderer=null;}
 if(!renderer){rendererUnavailable=true;context?.getExtension('WEBGL_lose_context')?.loseContext();return null;}root.dataset.renderer='webgl';
 const data=(t,index)=>options.data(t,index,false),initial=data(0,0);
 const scene=createCatalogScene(initial),cameras=scene.cameras;root.append(renderer.domElement);let disposed=false,lastT=options.t||0,lastIndex=0,camera=options.camera||'above',selected='all',muscles=options.muscles!==false,joints=!!options.joints;
 if(!cameras[camera])throw Error('Unknown volume camera '+camera);
 let updateVectors=()=>{};
 const apply=(t,index)=>{const d=data(t,index);scene.apply(d,{color:options.color,selected,muscles,joints});updateVectors(t,index,d.pose);};
 const trace=new THREE.Line(new THREE.BufferGeometry().setFromPoints(options.trace.map(p=>new THREE.Vector3(...world(p)))),new THREE.LineBasicMaterial({color:'#b4c3d9',transparent:true,opacity:.7}));trace.visible=false;scene.scene.add(trace);
 const vectors=new THREE.Group();vectors.name='movement-vectors';vectors.visible=false;scene.scene.add(vectors);
 for(const v of options.vectors){const a=new THREE.Vector3(...world(v.a)),b=new THREE.Vector3(...world(v.b)),d=b.clone().sub(a);vectors.add(new THREE.ArrowHelper(d.clone().normalize(),a,d.length(),/^(sh|hip)$/.test(v.key)?0x77a9d3:0xe97155,.075,.035));}
 updateVectors=(t,index,pose)=>{options.vectors.forEach((v,i)=>{const q=options.vectorFrame?options.vectorFrame(v,t,index,pose):v,arrow=vectors.children[i];arrow.visible=!!q;if(!q)return;const a=new THREE.Vector3(...world(q.a)),b=new THREE.Vector3(...world(q.b)),d=b.sub(a);arrow.position.copy(a);arrow.setDirection(d.clone().normalize());arrow.setLength(d.length(),.06,.03);});vectors.updateMatrixWorld(true);};
 // Camera changes reuse the full-motion fit for this exercise/equipment combination.
 const fitKey=JSON.stringify([initial.exerciseId,initial.props,options.vectors]),savedBounds=fittedBounds.get(fitKey);
 if(savedBounds)for(const key of Object.keys(scene.bounds))Object.assign(scene.bounds[key],savedBounds[key]);
 else{
  for(let i=0;i<=24;i++){apply(i/24,0);scene.includeBounds();}
  fittedBounds.set(fitKey,Object.fromEntries(Object.entries(scene.bounds).map(([key,value])=>[key,{...value}])));
  if(fittedBounds.size>256)fittedBounds.delete(fittedBounds.keys().next().value);
 }
 apply(lastT,0);
 function draw(){if(disposed)return;renderer.render(scene.scene,cameras[camera]);}
 function resize(){if(disposed)return;const rect=root.getBoundingClientRect(),w=Math.max(1,Math.min(1100,rect.width||620)),h=Math.max(1,Math.round(rect.height||w/(options.ratio||1.15)));renderer.setSize(w,h);scene.resize(w,h);draw();}
 function at(t,frame){if(disposed)return;lastT=t;lastIndex=frame?.index||0;apply(t,lastIndex);root.dataset.pose=String(t);root.dataset.phase=String(lastIndex);draw();}
 // Three restores its GPU resources first; paused views also need a fresh frame.
 const restore=()=>{if(!disposed){apply(lastT,lastIndex);resize();}};
 canvas.addEventListener('webglcontextrestored',restore);
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(resize):null;observer?.observe(root);resize();
 const setMuscles=show=>{muscles=!!show;at(lastT,{index:lastIndex});};
 const setRegion=id=>{selected=id;at(lastT,{index:lastIndex});};
 const setJoints=show=>{joints=!!show;at(lastT,{index:lastIndex});};
 at(lastT,{index:lastIndex});
 return{svg:root,at,camera,setMuscles,setRegion,setJoints,setTrace(show){trace.visible=!!show;draw();},setVectors(show){vectors.visible=!!show;draw();},dispose(){if(disposed)return;disposed=true;canvas.removeEventListener('webglcontextrestored',restore);observer?.disconnect();scene.dispose();renderer.dispose?.();renderer.forceContextLoss?.();}};
}
window.GymVolume={create:createVolumeFigure};
