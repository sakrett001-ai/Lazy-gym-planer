/* Catalog coordinates: centimetres, Y down. Reconstructed depth is an educational
   model, not measured motion capture. Original animation descriptors remain intact
   for the independent regression audit. All cameras use the same world pose. */
const CATALOG_CAMERAS=['above','angle','side','front','back'];
const CATALOG_RINGS=[[0,12.5,10,10],[10,13,11.5,8],[18,13.3636363636,12.2272727273,8],[21,13.5,12.5,8],[31,16.3,12.5,9],[40,18.2,12.5,10],[47,17.8,12,10],[52,15.8,8.5,10]];
function catalogCenter(R,h){
 const u=R.chestU||R.u;
 return h>18&&R.waist?V3.add(R.waist,u,h-18):V3.add(R.hip,R.u,h);
}
function catalogSection(h){
 if(h<=0)return CATALOG_RINGS[0].slice(1);
 for(let i=1;i<CATALOG_RINGS.length;i++)if(h<=CATALOG_RINGS[i][0]){
  const a=CATALOG_RINGS[i-1],b=CATALOG_RINGS[i],q=(h-a[0])/(b[0]-a[0]);return a.slice(1).map((v,k)=>v+(b[k+1]-v)*q);
 }
 return CATALOG_RINGS.at(-1).slice(1);
}
function catalogTorsoPoint(R,h,angle,extra=0){
 const[w,a,b]=catalogSection(h),n=R.chestN||R.n,x=R.x||V3.unit(V3.cross(R.n,R.u)),s=Math.cos(angle);
 return V3.add(V3.add(catalogCenter(R,h),x,w*Math.sin(angle)),n,(s>=0?a:b)*s+extra*s);
}
function catalogSource(ex){const a={...ex.anim};delete a.catalogRig;delete a.catalogProfile;prepAnim(a);return a;}
function catalogLegacyPose(a,t){return solvePose(a,poseAt(a,t),a._C);}
function catalogPlanarRig(ex,source){
 return t=>{
  const P=poseAt(source,t),J=solvePose(source,P,source._C),front=source.view==='front';
  const map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]],vector=p=>front?[p[0],p[1],0]:[0,p[1],p[0]];
  const hip=map(front?J.c:J.hip),u=vector(J.u),n=front?[0,0,1]:vector(J.n),x=V3.unit(V3.cross(n,u));
  const sh=map(front?J.neck:J.sh),R={hip,sh,u,n,x,head:map(J.head),headU:vector(dir(J.upperTa??J.ta)),headN:front?n:vector(dir((J.upperTa??J.ta)+90)),props:[],contacts:[],basis:'reconstructed'};
  if(J.waist){R.waist=map(J.waist);R.chestU=vector(J.chestU);R.chestN=vector(J.chestN);}
  R.headU=V3.unit(V3.sub(R.head,R.sh));R.headN=V3.unit(V3.cross(R.headU,R.x));
  for(const[s,old,sign]of [['L',front?'L':'N',-1],['R',front?'R':'F',1]]){
   R['sh'+s]=front?map(J['sh'+old]):V3.add(sh,x,sign*19);
   R['hip'+s]=front?map(J['hip'+old]):V3.add(hip,x,sign*11);
   for(const part of ['el','wr','hand','grip','kn','an','toe','heel']){
    const p=J[part+old];if(p)R[part+s]=front?map(p):V3.add(map(p),x,sign*(/^(kn|an|toe|heel)$/.test(part)?11:19));
   }
   if(front){
    for(const[part,root,mid,end,l1,l2]of [['arm','sh','el','wr',FL.ua,FL.fa],['leg','hip','kn','an',FL.th,FL.sh]]){
     const spec=P[part+s]||P[part],v=spec?.v;
     if(v){R[mid+s][2]=R[root+s][2]+v[0][2]*l1;R[end+s][2]=R[mid+s][2]+v[1][2]*l2;}
    }
    const d=V3.unit(V3.sub(R['wr'+s],R['el'+s]));
    R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
    R['toe'+s][2]=R['an'+s][2]+10;R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);
   }
  }
  R.props=catalogProps(source,J,R);return R;
 };
}
function catalogRef(source,J,R,ref,off){
 const front=source.view==='front',map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]];
 let p;
 if(Array.isArray(ref))p=map(ref);
 else if(ref==='grips')p=V3.add(R.gripL,R.gripR).map(v=>v/2);
 else if(ref==='tf')p=R.hip;
 else{
  const key=front?ref:String(ref).replace(/N$/,'L').replace(/F$/,'R');p=R[key];
  if(!p&&J[ref])p=map(J[ref]);
 }
 if(!p)throw Error('Unknown equipment attachment: '+ref);
 if(off)p=V3.add(p,front?[off[0],off[1],0]:[0,off[1],off[0]]);
 return [...p];
}
function catalogProps(source,J,R){
 const out=[],front=source.view==='front',map=p=>front?[p[0]-100,p[1],80]:[0,p[1],p[0]],ref=(name,off)=>catalogRef(source,J,R,name,off);
 const tone=s=>/mat/.test(s.cls||'')?'mat':/pad/.test(s.cls||'')?'pad':/band/.test(s.cls||'')?'band':/cable/.test(s.cls||'')?'cable':'steel';
 for(const[sidx,s]of (source.props||[]).entries()){
  const before=out.length;
  if(s.k==='rect'){
   if(/mat/.test(s.cls||''))out.push(box3(-75,75,186,187,-5,205,'mat'));
   else if(front){const z=s.h>20?65:80;out.push(box3(s.x-100,s.x+s.w-100,s.y,s.y+s.h,z-(s.h>20?6:15),z+(s.h>20?5:20),tone(s)));}
   else out.push(box3(s.h>50?-45:-16,s.h>50?45:16,s.y,s.y+s.h,s.x,s.x+s.w,tone(s)));
  }else if(s.k==='line'){
   for(let i=1;i<s.pts.length;i++){
    const a=map(s.pts[i-1]),b=map(s.pts[i]),pad=/pad/.test(s.cls||'');
    if(pad)out.push({kind:'panel',a,b,width:front?8:30,thickness:s.w||8,tone:'pad',support:s.support});
    else if(!front&&Math.abs(a[1]-b[1])>25){
     const half=/rail/.test(s.cls||'')?56:13;
     for(const sign of [-1,1])out.push({kind:'line',a:V3.add(a,[1,0,0],sign*half),b:V3.add(b,[1,0,0],sign*half),width:s.w||4,tone:tone(s)});
    }else out.push({kind:'line',a,b,width:s.w||4,tone:tone(s)});
   }
  }else if(s.k==='circle')out.push({kind:'wheel',c:map(s.c),radius:s.r||6,axis:front?[0,0,1]:[1,0,0],tone:tone(s)});
  else if(s.k==='db')out.push({kind:'dumbbell',c:ref(s.at||'gripN',s.off),axis:[1,0,0],optional:s.if});
  else if(s.k==='plate'){
   const c=s.tf?V3.add(V3.add(R.hip,R.u,s.tf[0]),R.n,s.tf[1]):ref(s.at||'grips',s.off);
   out.push({kind:/^grips$/.test(s.at||'grips')?'barbell':'weight',c,axis:[1,0,0],radius:s.r||16,optional:s.if});
  }else if(s.k==='kb'){
   const grip=ref(s.at||'grips'),d=s.down?[0,1,0]:V3.unit(V3.sub(R.handL,R.wrL));
   out.push({kind:'kettlebell',c:V3.add(grip,d,s.dist||11),grip,axis:[1,0,0],radius:8.5,optional:s.if});
  }else if(['cable','band','barcable'].includes(s.k)){
   const a=Array.isArray(s.from)?map(s.from):ref(s.from,s.foff),b=ref(s.k==='barcable'?'grips':s.at,s.off);
   out.push({kind:'line',a,b,width:s.k==='band'?2.2:1.4,tone:s.k==='band'&&!s.cls?'band':'cable',optional:s.if});
   if(s.k!=='band')out.push({kind:'wheel',c:a,radius:4.5,axis:front?[0,0,1]:[1,0,0],tone:'steel'});
   if(s.handle)out.push({kind:'line',a:V3.add(b,[1,0,0],-5),b:V3.add(b,[1,0,0],5),width:2.6,tone:'bar'});
  }else if(s.k==='seg')out.push({kind:'line',a:ref(s.a,s.aoff),b:ref(s.b,s.boff),width:s.w||4,tone:tone(s)});
  else if(s.k==='fbar'){
   const c=V3.add(R.gripL,R.gripR).map(v=>v/2),axis=V3.unit(V3.sub(R.gripR,R.gripL));
   if(s.plates)out.push({kind:'barbell',c,axis});
   else out.push({kind:'line',a:V3.add(R.gripL,axis,-(s.ext||12)),b:V3.add(R.gripR,axis,s.ext||12),width:s.w||3.6,tone:'bar'});
  }else if(s.k==='roller'){
   const p=map(PROPS.roller.geom(s,J));out.push({kind:'roller',c:p,radius:s.r||6.5,axis:[1,0,0],tone:'pad'});
   if(s.pivot)out.push({kind:'line',a:map(s.pivot),b:p,width:3.5,tone:'steel'});
  }else if(s.k==='platform'){
   const p=PROPS.platform.geom(s,J);out.push({kind:'panel',a:map(p[0]),b:map(p[1]),width:65,thickness:5,tone:'steel'});
  }else throw Error('Unmapped equipment kind: '+s.k);
  for(let i=before;i<out.length;i++){out[i].sourceIndex=sidx;if(s.if)out[i].optional=s.if;}
 }
 return out;
}
function catalogProneRig(source){
 return t=>{
  const J=catalogLegacyPose(source,t),R={hip:[0,172,108],sh:[0,172,56],u:[0,0,-1],n:[0,1,0],x:[1,0,0],head:[0,170,41],headU:[0,0,-1],headN:[0,1,0],props:[],contacts:[],basis:'authored'};
  for(const[s,sign]of [['L',-1],['R',1]]){
   R['hip'+s]=[sign*9,172,108];R['sh'+s]=[sign*19,172,59];
   for(const[root,joint,end,l1,l2]of [['sh','el','wr',30,27],['hip','kn','an',43,42]]){
    const jr=root==='sh'?J['sh'+s]:J['hip'+s],m=J[joint+s],e=J[end+s];
    const d1=V3.unit([m[0]-jr[0],0,m[1]-jr[1]]),d2=V3.unit([e[0]-m[0],0,e[1]-m[1]]);
    R[joint+s]=V3.add(R[root+s],d1,l1);R[end+s]=V3.add(R[joint+s],d2,l2);
   }
   const d=V3.unit(V3.sub(R['wr'+s],R['el'+s]));R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
   R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
  }return R;
 };
}
function catalogWidePushRig(source,archer=false){
 return t=>{
  const J=catalogLegacyPose(source,t),R=body3([archer?20*t:0,J.hip[1]+4,J.hip[0]],J.ta),xShift=R.hip[0];
  for(const[s,old,sign]of [['L','N',-1],['R','F',1]]){
   arm3(R,s,[sign*44,182,139],[sign*.6,0,-1],[0,0,1]);
   const ankle=[sign*11,J['an'+old][1],J['an'+old][0]];
   leg3(R,s,ankle,[0,1,-1]);R['heel'+s]=[sign*11,J['heel'+old][1],J['heel'+old][0]];R['toe'+s]=[sign*11,J['toe'+old][1],J['toe'+old][0]];
  }
  R.contacts=[{key:'wrL',kind:'support'},{key:'wrR',kind:'support'},{key:'toeL',kind:'support'},{key:'toeR',kind:'support'}];R.basis='authored';return R;
 };
}
function catalogFlyRig(t){
 const R=body3([0,126,112],-90),angle=(-8+88*t)*D2R;
 for(const[s,sign]of [['L',-1],['R',1]]){
  const wr=V3.add(R['sh'+s],[sign*Math.sin(angle),-Math.cos(angle),0],54);
  arm3(R,s,wr,[sign,0,.2],[0,-1,0]);leg3(R,s,[sign*16,180,166],[0,-1,0]);R.props.push({kind:'dumbbell',c:R['grip'+s]});
 }
 R.props.push(...bench3(28,150,136,15));R.basis='authored';return R;
}
function catalogSharedGripRig(rig,id){
 return t=>{
  const R=rig(t),d=V3.unit(V3.sub(R.gripL,R.wrL)),center=V3.add(R.wrL,R.wrR).map(v=>v/2),root=R.sh;
  const delta=[0,center[1]-root[1],center[2]-root[2]],reach=Math.sqrt((FL.ua+FL.fa-.02)**2-14**2),scale=Math.min(1,reach/(Math.hypot(...delta)||1));
  center[1]=root[1]+delta[1]*scale;center[2]=root[2]+delta[2]*scale;
  for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*5,center[1],center[2]],V3.sub(R['el'+s],R['sh'+s]),d);
  const grip=V3.add(R.gripL,R.gripR).map(v=>v/2);
  for(const p of R.props)if(['kettlebell','dumbbell'].includes(p.kind)){
   if(p.kind==='kettlebell'){const direction=id==='goblet'?[0,1,0]:d;p.grip=grip;p.c=V3.add(grip,direction,id==='goblet'?9:11);}
   else p.c=[...grip];
  }
  R.sharedGrip=grip;R.basis='authored';return R;
 };
}
function catalogBenchRig(t){
 const R=benchRig(t),bar=[...R.bar];
 // The thicker torso has a 12.5 cm anterior contour; the shaft touches its surface.
 bar[1]-=3.9*t;
 for(const[s,sign]of [['L',-1],['R',1]])arm3(R,s,[sign*34,bar[1]+3.5,bar[2]],[sign*.8,.6,.45],[0,-1,0]);
 R.bar=bar;R.props=R.props.slice(0,5).concat({kind:'barbell',c:bar});return R;
}
const CATALOG_SOURCES=new Map();
for(const ex of EX){
 const source=catalogSource(ex);CATALOG_SOURCES.set(ex.id,source);
 let rig=source.rig3d||catalogPlanarRig(ex,source);
 if(['ytw','reversesnow'].includes(ex.id))rig=catalogProneRig(source);
 if(['widepush','archer'].includes(ex.id))rig=catalogWidePushRig(CATALOG_SOURCES.get('pushup'),ex.id==='archer');
 if(ex.id==='dbfly')rig=catalogFlyRig;
 if(ex.id==='bbbench')rig=catalogBenchRig;
 if(['kbswing','goblet'].includes(ex.id))rig=catalogSharedGripRig(rig,ex.id);
 ex.anim.catalogRig=t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const R=rig(t);R.x??=V3.unit(V3.cross(R.n,R.u));R.basis??=source.rig3d?'authored':'reconstructed';
  if(ex.id==='bbbench'){
   const z=R.sh[2]-16,y=R.sh[1]-58;
   for(const sign of [-1,1])R.props.push({kind:'line',a:[sign*56,186,z],b:[sign*56,y-10,z],width:5,tone:'steel'},box3(sign*56-5,sign*56+5,180,186,z-18,z+18,'steel'),{kind:'line',a:[sign*56,y,z],b:[sign*56,y,z+12],width:4,tone:'bar'});
  }
  if(ex.id==='inclinebb')for(const pad of R.props.filter(p=>p.kind==='panel'&&p.tone==='pad')){
   pad.a=V3.add(pad.a,R.n,-1.5);pad.b=V3.add(V3.add(pad.b,R.n,-1.5),R.u,15);
  }
  return R;
 };
 ex.anim.catalogCameras=[...CATALOG_CAMERAS];
 ex.anim.catalogId=ex.id;
}
