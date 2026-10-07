#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
const{loadModel}=require('./biomechanics-audit');
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function auditCatalog(model,{samples=101}={}){
 const {EX,get}=model,{catalogVolumeData,muscleFrame,REGION_META,MUSCLE_REGIONS,CATALOG_SOURCES,camera3}=get('({catalogVolumeData,muscleFrame,REGION_META,MUSCLE_REGIONS,CATALOG_SOURCES,camera3})');
 const failures=[],stats={exercises:EX.length,poses:0,cameraPoses:0,regionFrames:0,reconstructed:0,authored:0};
 const seen=new Set(),check=(ok,id,rule,t)=>{if(!ok&&!seen.has(id+rule)){seen.add(id+rule);failures.push({exercise:id,rule,t});}};
 for(const ex of EX){
  const a=ex.anim,p=a.catalogProfile;check(typeof a.catalogRig==='function',ex.id,'rig',0);check(p?.curveBasis==='illustrative',ex.id,'profile-basis',0);
  const first=a.catalogRig(0);stats[first.basis==='reconstructed'?'reconstructed':'authored']++;
  const source=CATALOG_SOURCES.get(ex.id),sourceIndices=new Set(first.props.map(s=>s.sourceIndex));
  if(first.basis==='reconstructed')for(let i=0;i<(source.props||[]).length;i++)check(sourceIndices.has(i),ex.id,'equipment-coverage:'+i,0);
  for(const id of ex.pri)check(p.muscles[id]?.role==='primary',ex.id,'primary:'+id,0);
  for(const id of Object.keys(p.muscles))for(const[key]of MUSCLE_REGIONS[id])check(!!p.regions[key],ex.id,'required-region:'+key,0);
  for(let i=0;i<samples;i++){
   const t=i/(samples-1),R=a.catalogRig(t);stats.poses++;
   for(const [key,v]of Object.entries(R))if(Array.isArray(v)&&typeof v[0]==='number')check(v.length===3&&v.every(Number.isFinite),ex.id,'finite:'+key,t);
   for(const s of ['L','R'])for(const[x,y,l]of [['sh','el',30],['el','wr',27],['hip','kn',43],['kn','an',42]])check(Math.abs(distance(R[x+s],R[y+s])-l)<1e-4,ex.id,'bone:'+x+s+'-'+y+s,t);
   for(const prop of R.props)for(const[k,v]of Object.entries(prop))if(Array.isArray(v))check(v.every(Number.isFinite),ex.id,'prop-finite:'+prop.kind+':'+k,t);
   for(const camera of a.catalogCameras){const project=camera3(camera);for(const key of ['head','gripL','gripR','anL','anR'])check(project(R[key]).every(Number.isFinite),ex.id,'camera:'+camera,t);stats.cameraPoses++;}
   if(i%10===0||i===samples-1){
    const data=catalogVolumeData(a,t,0);for(const f of data.surfaces)check(REGION_META[f.id]?.visible&&f.points.every(p=>p.length===3&&p.every(Number.isFinite)),ex.id,'region:'+f.id,t);
    for(const[id,r]of Object.entries(p.regions))check(!r.visible||data.surfaces.some(f=>f.id===id),ex.id,'region-coverage:'+id,t);
   }
   for(const index of [0,1,2,3]){
    const state=muscleFrame(a,t,index);for(const[id,v]of Object.entries(state.values))check(Number.isFinite(v)&&v>=0&&v<=1,ex.id,'brightness:'+id,t);stats.regionFrames++;
   }
  }
  for(const t of [0,1]){const l=muscleFrame(a,t,0).values,r=muscleFrame(a,t,2).values;check(Object.keys(l).every(k=>l[k]===r[k]),ex.id,'phase-continuity',t);}
 }
 return{stats,failures};
}
if(require.main===module){const result=auditCatalog(loadModel());fs.mkdirSync(path.join(__dirname,'../docs'),{recursive:true});fs.writeFileSync(path.join(__dirname,'../docs/catalog-audit.json'),JSON.stringify(result,null,2)+'\n');console.log(`Catalog: ${result.stats.exercises} exercises, ${result.stats.poses} poses, ${result.stats.cameraPoses} projections, ${result.failures.length} errors.`);for(const f of result.failures)console.error(f);if(result.failures.length)process.exitCode=1;}
module.exports={auditCatalog};
