/* Насколько кости выходят из кожи: node tools/skeleton/fit.js all|id,id [0,0.5,1] [qa/skeleton/bones.json] */
const path=require('node:path'),R0=path.resolve(__dirname,'../..')+'/';
const M=require(R0+'src/js/09bm-mannequin.js'),EQ=require(R0+'src/js/09bn-equipment.js'),{bakeAll}=require(R0+'tools/mannequin/author.js');
const SK=require('./skeleton.js'),{bones}=require(path.resolve(R0,process.argv[4]||'qa/skeleton/bones.json'));
const ids=process.argv[2]==='all'?Object.keys(require(R0+'tools/mannequin/author.js').bakeAll({})).filter(k=>!k.startsWith('_')):(process.argv[2]||'squat').split(','),ts=(process.argv[3]||'0,0.5,1').split(',').map(Number);
const all=bakeAll({only:ids});const worst={};
const agg={};
for(const id of ids){const rig=EQ.rig(all[id]);
 for(const t of ts){const R=rig(t),body=M.bodyData(R),cache=M.torsoCache(R);
  const sdf=p=>{let d=M.torsoSDF(R,p,cache);d=Math.min(d,M.headSDF(R,p));for(const s of ['L','R'])for(const k of ['ua','fa','th','sk'])d=Math.min(d,M.limbSDF(R,k,s,p));
   for(const c of body.caps)d=Math.min(d,V(p,c.c)-c.r);
   {const a=R.frames.neck.o,b=R.frames.head.o,ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],t=Math.max(0,Math.min(1,((p[0]-a[0])*ab[0]+(p[1]-a[1])*ab[1]+(p[2]-a[2])*ab[2])/(ab[0]**2+ab[1]**2+ab[2]**2))),c=[a[0]+ab[0]*t,a[1]+ab[1]*t,a[2]+ab[2]*t];d=Math.min(d,V(p,c)-5.4);}
   return d;};
  const V=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);
  for(const {bone,pos} of SK.place(R,body,bones)){
   if(['finger','thumb','hand','foot','toes'].includes(bone.seg))continue;
   const key=bone.name+(bone.side||'');let mx=0,out=0;const n=pos.length/3;
   for(let i=0;i<n;i++){const d=sdf([pos[3*i],pos[3*i+1],pos[3*i+2]]);if(d>0)out++;if(d>mx)mx=d;}
   if(mx>1.5){worst[id]=Math.max(worst[id]||0,mx);}const a=agg[key]||(agg[key]={mx:0,out:0,n:0,where:''});if(mx>a.mx){a.mx=mx;a.where=id+' t='+t;}a.out+=out;a.n+=n;
  }}}
const rows=Object.entries(agg).sort((a,b)=>b[1].mx-a[1].mx);
for(const [k,a] of rows)console.log(k.padEnd(14),'наружу до',a.mx.toFixed(1).padStart(5),'см  вершин снаружи',(100*a.out/a.n).toFixed(0).padStart(3)+'%',' ',a.where);

const w=Object.entries(worst).sort((a,b)=>b[1]-a[1]);console.log('\nупражнений, где кость выходит больше чем на 1,5 см:',w.length,'из',ids.length);console.log(w.slice(0,25).map(([k,v])=>k+' '+v.toFixed(1)).join(', '));
