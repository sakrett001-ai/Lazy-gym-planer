function catalogVectors(anim){
 if(anim.hold||(anim.keys?.length>2&&!anim.vectors))return[];
 const rig=anim.catalogRig||anim.rig3d,poses=Array.from({length:41},(_,i)=>rig(i/40)),a=poses[0],b=poses.at(-1),out=[];
 for(const key of ['sh','hip','elL','elR','gripL','gripR','knL','knR','anL','anR']){
  const delta=V3.sub(b[key],a[key]);if(Math.hypot(...delta)>10)out.push({a:a[key],b:b[key],key,points:poses.map(R=>R[key])});
 }return out;
}
// A movement arrow belongs to the current joint and reverses on the return phase.
function catalogVectorFrame(v,t,index,pose){
 if(index===1||index===3)return null;
 const points=v.points,i=Math.round(t*(points.length-1)),lo=Math.max(0,i-1),hi=Math.min(points.length-1,i+1);
 const delta=V3.sub(points[hi],points[lo]),size=Math.hypot(...delta);if(size<.001)return null;
 const distance=Math.min(28,Math.max(12,Math.hypot(...V3.sub(v.b,v.a))*.3)),a=pose[v.key],sign=index===2?-1:1;
 return{a,b:V3.add(a,delta,sign*distance/size),key:v.key};
}
function catalogVectorGroup(svg,anim,camera){
 const g=el('g',{class:'motion-vec','aria-hidden':'true',display:'none'},svg),id='vec-arrow-'+(++vecSerial),defs=el('defs',{},g),project=camera3(camera),vectors=catalogVectors(anim);
 for(const kind of ['limb','core']){const m=el('marker',{id:id+'-'+kind,viewBox:'0 0 10 10',refX:7,refY:5,markerWidth:5,markerHeight:5,orient:'auto'},defs);el('path',{d:'M0,0 L10,5 L0,10 Z',class:'vec-head vec-'+kind},m);}
 const nodes=vectors.map(v=>{const kind=/^(sh|hip)$/.test(v.key)?'core':'limb';return el('path',{class:'vec-line vec-'+kind,'data-vector':v.key,'marker-end':`url(#${id}-${kind})`},g);});
 const toggle=show=>g.setAttribute('display',show?'inline':'none');
 toggle.bounds=vectors.flatMap(v=>v.points.flatMap((p,i)=>[0,2].flatMap(index=>{const q=catalogVectorFrame(v,i/(v.points.length-1),index,{[v.key]:p});return q?[project(q.a),project(q.b)]:[];})));
 toggle.at=(t,frame,R)=>vectors.forEach((v,i)=>{const q=catalogVectorFrame(v,t,frame?.index||0,R),node=nodes[i];node.setAttribute('display',q?'inline':'none');if(q){const a=project(q.a),b=project(q.b);node.setAttribute('d',`M${f1(a[0])},${f1(a[1])} L${f1(b[0])},${f1(b[1])}`);}});
 return toggle;
}
function createMotionFigure(anim,opts){
 if(!window.GymVolume||!anim.catalogRig)return buildFigure(anim,opts);
 let f=window.GymVolume.create({...opts,data:(t,index,coarse)=>catalogVolumeData(anim,t,index,opts.has,coarse),color:muscleColor,joints:motionPrefs.joints,
  trace:Array.from({length:41},(_,i)=>anim.catalogRig(i/40).gripL),vectors:catalogVectors(anim),vectorFrame:catalogVectorFrame});
 if(!f){
  f=buildFigure(anim,opts);const svg=f.svg,root=document.createElement('div');root.className='volume-figure';root.setAttribute('role','img');root.setAttribute('aria-label',opts.label);root.dataset.renderer='svg';root.dataset.camera=opts.camera||'above';root.append(svg);f.svg=root;
  const at=f.at;f.at=(t,frame)=>{at(t,frame);root.dataset.pose=String(t);root.dataset.phase=String(frame?.index||0);};
  const setJoints=show=>svg.classList.toggle('show-joints',!!show);f.setJoints=setJoints;setJoints(motionPrefs.joints);f.at(opts.t||0);
 }
 f.setTrace(motionPrefs.trace);f.setVectors(motionPrefs.vectors);return f;
}
function disposeMotion(F){F?.f?.dispose?.();F?.extra?.dispose?.();}
function selectMuscleRegion(prefix,id){
 const F=prefix==='mv'?detailMotion:workout?.motion;if(!F)return;
 const p=motionProfile(F.it.ex.anim);if(id!=='all'&&!p.regions[id]?.visible)return;
 motionPrefs.regions={...motionPrefs.regions,[F.it.ex.id]:id};saveMotionPrefs();
 for(const f of [F.f,F.extra].filter(Boolean))f.setRegion?.(id);
}
