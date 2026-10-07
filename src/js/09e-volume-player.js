function catalogVectors(anim){
 if(anim.hold||(anim.keys?.length>2&&!anim.vectors))return[];
 const a=anim.catalogRig(anim.eccFirst?1:0),b=anim.catalogRig(anim.eccFirst?0:1),out=[];
 for(const key of ['sh','hip','elL','elR','gripL','gripR','knL','knR','anL','anR']){
  const delta=V3.sub(b[key],a[key]);if(Math.hypot(...delta)>10)out.push({a:a[key],b:b[key],key});
 }return out;
}
function createMotionFigure(anim,opts){
 if(!window.GymVolume||!anim.catalogRig)return buildFigure(anim,opts);
 let f=window.GymVolume.create({...opts,data:(t,index,coarse)=>catalogVolumeData(anim,t,index,opts.has,coarse),color:muscleColor,joints:motionPrefs.joints,
  trace:Array.from({length:41},(_,i)=>anim.catalogRig(i/40).gripL),vectors:catalogVectors(anim)});
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
