/* One spatial skeleton per movement. Cameras only project the same pose. */
const V3={
 add:(a,b,k=1)=>a.map((v,i)=>v+b[i]*k),sub:(a,b)=>a.map((v,i)=>v-b[i]),
 dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),unit:a=>{const n=Math.hypot(...a)||1;return a.map(v=>v/n);},
 cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]
};
const up3=a=>[0,-Math.cos(a*D2R),Math.sin(a*D2R)];
const forward3=a=>[0,Math.sin(a*D2R),Math.cos(a*D2R)];
function joint3(root,target,a,b,hint){
 const delta=V3.sub(target,root),distance=Math.hypot(...delta),axis=V3.unit(delta);
 const d=Math.max(Math.abs(a-b)+1e-6,Math.min(a+b-1e-6,distance));
 let bend=V3.sub(hint,axis.map(v=>v*V3.dot(hint,axis)));
 if(Math.hypot(...bend)<1e-6)bend=V3.cross(axis,[0,0,1]);
 bend=V3.unit(bend);
 const along=(a*a+d*d-b*b)/(2*d),height=Math.sqrt(Math.max(0,a*a-along*along));
 return [V3.add(V3.add(root,axis,along),bend,height),V3.add(root,axis,d)];
}
function body3(hip,angle,headOffset=0,hipWidth=11){
 const u=up3(angle),n=forward3(angle),sh=V3.add(hip,u,FL.torso),headU=up3(angle+headOffset);
 const R={hip,sh,u,n,headU,headN:forward3(angle+headOffset),head:V3.add(sh,headU,FL.neck),angle,props:[],contacts:[]};
 for(const [s,sign]of [['L',-1],['R',1]]){R['hip'+s]=V3.add(hip,[sign,0,0],hipWidth);R['sh'+s]=V3.add(sh,[sign,0,0],19);}
 return R;
}
function arm3(R,s,wr,hint,handDir){
 [R['el'+s],R['wr'+s]]=joint3(R['sh'+s],wr,FL.ua,FL.fa,hint);
 const d=handDir||V3.unit(V3.sub(R['wr'+s],R['el'+s]));
 R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
}
/* Высота висящего грифа следует из положения плеч и длины рук.
   Независимая анимация грифа могла задавать кистям недостижимую точку. */
function hangingBar3(R,halfGrip,z){
 const reach=FL.ua+FL.fa-.01,dx=halfGrip-19,dz=z-R.sh[2];
 const drop=Math.sqrt(Math.max(0,reach*reach-dx*dx-dz*dz));
 return [0,R.sh[1]+drop+3.5,z];
}
function leg3(R,s,ankle,hint,footDir=[0,0,1]){
 [R['kn'+s],R['an'+s]]=joint3(R['hip'+s],ankle,FL.th,FL.sh,hint);
 R['heel'+s]=V3.add(R['an'+s],footDir,-4);R['toe'+s]=V3.add(R['an'+s],footDir,13);
}
const box3=(x0,x1,y0,y1,z0,z1,tone='pad')=>({kind:'box',lo:[x0,y0,z0],hi:[x1,y1,z1],tone});
function bench3(z0,z1,top,half=34){
 return [box3(-half,half,top,top+7,z0,z1),...[-1,1].flatMap(s=>[z0+9,z1-9].map(z=>({kind:'line',a:[s*(half-7),top+7,z],b:[s*(half-7),186,z],width:3.5,tone:'steel'})))];
}
function pulldownRig(t){
 const R=body3([0,132,80],-12),barY=30+61*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*43,barY+3.5,85],[sign*.5,1,0],[0,-1,0]);
  const root=R['hip'+s],knee=[sign*11,138,80+Math.sqrt(FL.th**2-6**2)];
  R['kn'+s]=knee;R['an'+s]=V3.add(knee,[0,1,0],FL.sh);
  R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
 }
 R.props=[...bench3(61,101,140,29),box3(-32,32,122,128,102,114),
  {kind:'line',a:[66,-8,146],b:[66,186,146],width:4,tone:'steel'},
  {kind:'line',a:[66,-8,146],b:[0,-8,85],width:4,tone:'steel'},
  {kind:'line',a:[0,-8,85],b:[0,barY,85],width:1.5,tone:'cable'},
  {kind:'line',a:[-56,barY,85],b:[56,barY,85],width:3.3,tone:'bar'}];
 R.bar=[0,barY,85];return R;
}
function bulgarianRig(t){
 const R=body3([0,103.5+35*t,94-7*t],10+8*t,0,12);
 leg3(R,'L',[-12,180,126],[0,0,1]);
 leg3(R,'R',[12,136,36],[0,1,0],[0,0,-1]);
 for(const [s,sign]of [['L',-1],['R',1]]){
  const d=V3.unit([sign*.1,1,0]);R['el'+s]=V3.add(R['sh'+s],d,30);R['wr'+s]=V3.add(R['el'+s],d,27);
  R['grip'+s]=V3.add(R['wr'+s],d,3.5);R['hand'+s]=V3.add(R['wr'+s],d,7);
  R.props.push({kind:'dumbbell',c:R['grip'+s],optional:'db'});
 }
 R.props.push(...bench3(15,49,140,29));
 R.contacts=[{p:[-12,184,132],label:'Передняя стопа'},{p:[12,140,29],label:'Задняя стопа'}];return R;
}
const chinStartY3=25.5+Math.sqrt(56.95**2-(95-(80+up3(-6)[2]*52))**2-2**2)-up3(-6)[1]*52;
function chinupRig(t){
 const R=body3([0,chinStartY3+(79-chinStartY3)*t,80],-6,0,10);
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*17,25.5,95],[0,1,0],[0,-1,0]);
  R['kn'+s]=V3.add(R['hip'+s],[0,1,0],43);R['an'+s]=V3.add(R['kn'+s],[0,1,0],42);
  R['heel'+s]=V3.add(R['an'+s],[0,0,1],-4);R['toe'+s]=V3.add(R['an'+s],[0,0,1],13);
 }
 R.bar=[0,22,95];R.props=[{kind:'line',a:[-56,22,95],b:[56,22,95],width:4,tone:'bar'},...[-1,1].map(s=>({kind:'line',a:[s*52,8,95],b:[s*52,22,95],width:3,tone:'steel'}))];return R;
}
const thrustAngle3=-Math.atan2(83,10)/D2R;
const thrustTopHip3=V3.add(V3.add([0,138,80],up3(thrustAngle3),-40),forward3(thrustAngle3),10);
const thrustFootZ3=V3.add(thrustTopHip3,up3(thrustAngle3),-43)[2];
function thrustRig(t){
 const angle=-43+(thrustAngle3+43)*t,u=up3(angle),n=forward3(angle),contact=[0,138,80];
 const hip=V3.add(V3.add(contact,u,-40),n,10),R=body3(hip,angle,8,13);
 const bar=V3.add(V3.add(hip,u,2),n,12);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,thrustFootZ3],[0,-1,0]);
  const grip=V3.add(bar,[sign,0,0],29);
  arm3(R,s,V3.add(grip,n,-3.5),[sign,0,0],n);
 }
 R.bar=bar;R.backContact=V3.add(V3.add(hip,u,40),n,-10);
 R.props=[...bench3(18,80,138,40),{kind:'barbell',c:bar}];
 R.contacts=[{p:contact,label:'Опора спиной'},{p:[-13,184,thrustFootZ3+5],label:'Стопы'}];return R;
}
const CAMERA3={front:{label:'Спереди',yaw:0,elevation:0},side:{label:'Сбоку',yaw:90,elevation:0},angle:{label:'Под углом',yaw:55,elevation:-15},
 back:{label:'Сзади',yaw:180,elevation:0},above:{label:'Сверху под углом',yaw:35,elevation:-55},rear:{label:'Сзади под углом',yaw:235,elevation:-15}};
function camera3(key){
 const C=CAMERA3[key]||CAMERA3.side,sy=Math.sin(C.yaw*D2R),cy=Math.cos(C.yaw*D2R),se=Math.sin(C.elevation*D2R),ce=Math.cos(C.elevation*D2R);
 return p=>{const depth=-p[0]*sy+p[2]*cy;return [p[0]*cy+p[2]*sy,p[1]*ce-depth*se,depth*ce+p[1]*se];};
}
/* Projected segments may shorten. Only the spatial bone lengths are anatomical. */
function spatialPose(anim,t){
 const R=anim.rig3d(t),project=camera3(anim.camera||'side'),J={view:'spatial'};
 for(const[k,v]of Object.entries(R))if(Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))J[k]=project(v).slice(0,2);
 J.sh=project(R.sh).slice(0,2);J.hip=project(R.hip).slice(0,2);return J;
}
function buildSpatialFigure(anim,opts={}){
 const camera=opts.camera||anim.camera||'side',project=camera3(camera),paletteRoot=el('svg',{}),palette=athletePalette(paletteRoot);
 const svg=el('svg',{class:'fig spatial-figure',role:'img','aria-label':`${opts.label||''} — ${CAMERA3[camera].label}`});
 svg.appendChild(paletteRoot.firstChild);
 const ground=el('g',{'aria-hidden':'true'},svg),trace=el('path',{class:'motion-trace',display:'none','aria-hidden':'true'},svg),scene=el('g',{},svg),dots=el('g',{class:'rig-dots','aria-hidden':'true'},svg);
 const tones={steel:'#77869b',pad:'#73849a',bar:'#a7b6ca',cable:'#8192a9'};
 const allBounds=[],tracePts=[];let records=[];
 function queue(tag,attrs,points,offset=0){
  const pts=points.map(project),depth=pts.reduce((s,p)=>s+p[2],0)/pts.length+offset;
  allBounds.push(...pts);records.push({tag,attrs,depth});
 }
 const path2=p=>'M'+p.map(q=>`${f1(q[0])},${f1(q[1])}`).join('L')+'Z';
 function face(points,fill,extra={}){queue('path',{d:path2(points.map(project)),fill,...extra},points);}
 function silhouette(points,fill,attrs={}){
  const p=points.map(project).sort((a,b)=>a[0]-b[0]||a[1]-b[1]),cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);
  const half=ps=>{const h=[];for(const q of ps){while(h.length>1&&cross(h[h.length-2],h[h.length-1],q)<=0)h.pop();h.push(q);}return h;};
  const a=half(p),b=half([...p].reverse());a.pop();b.pop();
  queue('path',{d:closedSpline(a.concat(b).map(v=>v.slice(0,2))),fill,...attrs},points);
 }
 function line3(a,b,width,fill,offset=0,attrs={}){const p=project(a),q=project(b);queue('line',{x1:f1(p[0]),y1:f1(p[1]),x2:f1(q[0]),y2:f1(q[1]),stroke:fill,'stroke-width':width,'stroke-linecap':'round',...attrs},[a,b],offset);}
 function limb(a,b,width,kind,fill){
  const p=project(a),q=project(b);
  if(Math.hypot(q[0]-p[0],q[1]-p[1])<1.5){
   queue('ellipse',{cx:f1((p[0]+q[0])/2),cy:f1((p[1]+q[1])/2+(kind==='ft'?2.5:0)),rx:kind==='ft'?5:width/2,ry:kind==='ft'?3.5:width/2,fill},[a,b]);
  }else queue('path',{d:bonePath(p,q,width,kind),fill},[a,b]);
 }
 function box(s){
  const p=(x,y,z)=>[s[x?'hi':'lo'][0],s[y?'hi':'lo'][1],s[z?'hi':'lo'][2]];
  const faces=[[p(0,0,0),p(1,0,0),p(1,0,1),p(0,0,1)],[p(0,0,0),p(0,0,1),p(0,1,1),p(0,1,0)], [p(1,0,0),p(1,1,0),p(1,1,1),p(1,0,1)],[p(0,0,1),p(1,0,1),p(1,1,1),p(0,1,1)],[p(0,0,0),p(0,1,0),p(1,1,0),p(1,0,0)]];
  faces.forEach((v,i)=>face(v,['#8192a8','#56677d','#65758a','#708097','#617186'][i]));
 }
 function circle3(c,r,axis,count=48){
  axis=V3.unit(axis);const a=V3.unit(V3.cross(axis,Math.abs(axis[1])<.8?[0,1,0]:[0,0,1])),b=V3.cross(axis,a);
  return Array.from({length:count},(_,i)=>V3.add(V3.add(c,a,r*Math.cos(i*Math.PI*2/count)),b,r*Math.sin(i*Math.PI*2/count)));
 }
 function disc(c,r,outline=false,axis=[1,0,0],attrs={}){
  const p=circle3(c,r,axis);
  /* сбоку блин — полупрозрачный диск: не закрывает атлета и не читается как кольцо вокруг головы */
  face(p,outline?'#36465e':'#36465e',{stroke:outline?'#7f90ad':'#25344a','stroke-width':outline?1.2:1,'stroke-opacity':outline?.7:1,'fill-opacity':outline?.38:1,...attrs});
  const q=project(c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:2.5,fill:'#a6b5ca'},[c],1);
 }
 const TONE3={frame:'#5f708a',pad:'#46566e',chrome:'#b7c4d6',plate:'#3b4c66',rubber:'#2f3a4b',cable:'#8a9ab0',band:'#6d9dc6',mat:'#2f3d52',wood:'#8a755e',wall:'#4a586c',stack:'#56667e',rope:'#b8a07a',towel:'#c9cfd8'};
 const shade=(hex,k)=>{const n=parseInt(hex.slice(1),16),c=[n>>16,n>>8&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*k))));return'#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');};
 const facing=d=>{const a=project([0,0,0]),b=project(d);return b[2]-a[2];};
 function obox(c,ax,size,tone,attrs={}){
  const h=size.map(v=>v/2),P=(i,j,k)=>V3.add(V3.add(V3.add(c,ax[0],i*h[0]),ax[1],j*h[1]),ax[2],k*h[2]),base=TONE3[tone]||TONE3.frame;
  for(let a=0;a<3;a++)for(const sg of [-1,1]){
   const n=ax[a].map(v=>v*sg);if(facing(n)<=1e-6)continue;
   const b=(a+1)%3,cc=(a+2)%3,q=(u,v)=>{const idx=[0,0,0];idx[a]=sg;idx[b]=u;idx[cc]=v;return P(...idx);};
   face([q(-1,-1),q(1,-1),q(1,1),q(-1,1)],shade(base,.78+.32*Math.abs(project(n)[1]-project([0,0,0])[1]<0?.9:.55)),attrs);
  }
 }
 function cylinder(c,axis,r,len,tone,attrs={}){
  axis=V3.unit(axis);const a=V3.add(c,axis,-len/2),b=V3.add(c,axis,len/2),ca=circle3(a,r,axis,20),cb=circle3(b,r,axis,20),base=TONE3[tone]||TONE3.frame;
  silhouette(ca.concat(cb),shade(base,.85),attrs);const end=facing(axis)>0?cb:ca;face(end,shade(base,1.08),attrs);
 }
 function prop(s){
  if(s.optional&&opts.has&&!opts.has(s.optional))return;
  if(s.optionalNot&&(!opts.has||opts.has(s.optionalNot)))return;
  if(s.kind==='beam')line3(s.a,s.b,s.r?2*s.r:Math.max(s.w,s.h),TONE3[s.tone]||TONE3.frame,0,{'data-prop':s.id||'beam'});
  else if(s.kind==='obox')obox(s.c,[s.x,s.y,s.z].map(V3.unit),s.size,s.tone,{'data-prop':s.id||'box'});
  else if(s.kind==='cyl')cylinder(s.c,s.axis,s.r,s.len,s.tone,{'data-prop':s.id||'cyl'});
  else if(s.kind==='sphere'){const q=project(s.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(s.r),fill:TONE3[s.tone]||TONE3.frame},[s.c]);}
  else if(s.kind==='cable')for(let i=1;i<s.pts.length;i++)line3(s.pts[i-1],s.pts[i],Math.max(1,2*s.r),TONE3[s.tone]||TONE3.cable,0,{'data-prop':s.id||'cable'});
  else if(s.kind==='barbell'&&s.len){
   const ax=V3.unit(s.axis);line3(V3.add(s.c,ax,-s.inner),V3.add(s.c,ax,s.inner),2*s.shaftR,TONE3.chrome,0,{'data-prop':'barbell','data-part':'shaft'});
   for(const sg of [-1,1]){line3(V3.add(s.c,ax,sg*(s.inner+2)),V3.add(s.c,ax,sg*s.len/2),2*s.sleeveR,TONE3.chrome,0,{'data-prop':'barbell','data-part':'sleeve'});
    let at=s.inner+2.4;for(const[r,th]of s.plates){cylinder(V3.add(s.c,ax,sg*(at+th/2)),ax,r,th,'plate',{'data-prop':'barbell','data-part':'plate'});at+=th+.3;}}
  }else if(s.kind==='dumbbell'&&s.handle){
   const ax=V3.unit(s.axis);line3(V3.add(s.c,ax,-s.handle/2-1),V3.add(s.c,ax,s.handle/2+1),3.2,TONE3.chrome,0,{'data-prop':'dumbbell','data-part':'shaft'});
   for(const sg of [-1,1])cylinder(V3.add(s.c,ax,sg*(s.handle/2+1.2+s.headLen/2)),ax,s.headR,s.headLen,'plate',{'data-prop':'dumbbell','data-part':'plate'});
  }
  else if(s.kind==='kettlebell'&&s.handleAxis){
   const q=project(s.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(s.radius),fill:TONE3.plate,'data-prop':'kettlebell'},[s.c]);
   const up=V3.unit(V3.sub(s.grip,s.c)),ax=V3.unit(s.handleAxis),P=(x,y)=>V3.add(V3.add(s.c,ax,x*s.radius/10.5),up,y*s.radius/10.5);
   const pts=[P(-7.2,6.5),P(-9,12),P(-5,15.6),P(5,15.6),P(9,12),P(7.2,6.5)].map(project);
   queue('path',{d:'M'+pts.map(p=>f1(p[0])+','+f1(p[1])).join('L'),fill:'none',stroke:TONE3.plate,'stroke-width':3.2,'stroke-linejoin':'round','data-prop':'kettlebell'},[s.grip],.5);
  }
  else if(s.kind==='box')box(s);
  else if(s.kind==='line')line3(s.a,s.b,s.width,tones[s.tone]||tones.steel);
  else if(s.kind==='dumbbell'){
   const axis=V3.unit(s.axis||[1,0,0]);
   line3(V3.add(s.c,axis,-12),V3.add(s.c,axis,12),3,tones.bar,0,{'data-prop':'dumbbell','data-part':'shaft'});
   for(const sign of [-1,1])disc(V3.add(s.c,axis,sign*9),6,false,axis,{'data-prop':'dumbbell','data-part':'plate'});
  }else if(s.kind==='barbell'){
   const axis=V3.unit(s.axis||[1,0,0]);
   line3(V3.add(s.c,axis,-61),V3.add(s.c,axis,61),3.4,tones.bar,0,{'data-prop':'barbell','data-part':'shaft'});
   line3(V3.add(s.c,axis,-19),V3.add(s.c,axis,19),8,'#ac8a61',1);
   for(const sign of [-1,1])disc(V3.add(s.c,axis,sign*48),s.radius||17,camera==='side',axis,{'data-prop':'barbell','data-part':'plate'});
  }else if(s.kind==='panel'){
   const axis=[1,0,0],normal=V3.unit(V3.cross(axis,V3.sub(s.b,s.a))),corners=[V3.add(s.a,axis,-s.width/2),V3.add(s.a,axis,s.width/2),V3.add(s.b,axis,s.width/2),V3.add(s.b,axis,-s.width/2)];
   const lower=corners.map(p=>V3.add(p,normal,s.thickness/2));face(corners,'#53677f');for(let i=0;i<4;i++)face([corners[i],corners[(i+1)%4],lower[(i+1)%4],lower[i]],'#35475f');
  }else if(['wheel','roller','weight'].includes(s.kind)){
   const axis=V3.unit(s.axis||[1,0,0]),r=s.radius||6;
   if(s.kind==='roller'){
    const ends=[-18,18].map(offset=>circle3(V3.add(s.c,axis,offset),r,axis,24));
    for(const points of ends)face(points,'#35475f',{'data-prop':'roller','data-part':'end'});
    for(let i=0;i<24;i++)face([ends[0][i],ends[0][(i+1)%24],ends[1][(i+1)%24],ends[1][i]],'#435570',{'data-prop':'roller','data-part':'wall'});
   }else face(circle3(s.c,r,axis,24),'#45607f');
  }else if(s.kind==='kettlebell'){
   const c=project(s.c);queue('circle',{cx:c[0],cy:c[1],r:s.radius||8.5,fill:'#304a6a',stroke:'#607691','stroke-width':1},[s.c]);
   const d=V3.unit(V3.sub(s.c,s.grip)),points=[V3.add(V3.add(s.grip,[1,0,0],-5.5),d,3),s.grip,V3.add(V3.add(s.grip,[1,0,0],5.5),d,3)],p=points.map(project);
   queue('path',{d:`M${p[0][0]},${p[0][1]} Q${p[1][0]},${p[1][1]} ${p[2][0]},${p[2][1]}`,fill:'none',stroke:'#b4c6dc','stroke-width':2.4},points);
  }else throw Error('Unknown spatial equipment kind: '+s.kind);
 }
 /* Манекен: силуэты сегментов строятся из той же поверхности, что и объёмная сцена */
 function mannequinBody(R,boundsOnly){
  const B=Mannequin.bodyData(R),H=B.torsoHeights,every=(rows,k)=>rows.filter((_,i)=>i%k===0||i===rows.length-1);
  const L=(f,p)=>[f.o[0]+f.x[0]*p[0]+f.y[0]*p[1]+f.z[0]*p[2],f.o[1]+f.x[1]*p[0]+f.y[1]*p[1]+f.z[1]*p[2],f.o[2]+f.x[2]*p[0]+f.y[2]*p[1]+f.z[2]*p[2]];
  if(boundsOnly){for(const row of B.torso)allBounds.push(...row.map(project));for(const rows of Object.values(B.limbs))for(const row of every(rows,3))allBounds.push(...row.map(project));allBounds.push(project(V3.add(R.head,R.headU,12)));return;}
  const part=(lo,hi)=>B.torso.filter((_,i)=>H[i]>=lo&&H[i]<=hi).flat();
  silhouette(part(-9,10),palette.shorts,{'data-part':'pelvis'});silhouette(part(8,26),palette.kit,{'data-part':'waist'});silhouette(part(23,56),palette.kit,{'data-part':'chest'});
  silhouette(B.neck.flat(),palette.skin,{'data-part':'neck'});
  for(const s of ['R','L']){
   const skin=palette[s==='R'?'far':'skin'];
   for(const k of ['th','sk','ua','fa'])silhouette(every(B.limbs[k+s],2).flatMap(r=>r.filter((_,j)=>j%2===0)),skin,{'data-limb':k+s});
   silhouette(B.limbs['th'+s].slice(0,3).flat(),palette.shorts,{'data-limb':'shorts'+s});
   for(const c of B.caps.filter(c=>c.key.endsWith(s))){const q=project(c.c);queue('circle',{cx:f1(q[0]),cy:f1(q[1]),r:f1(c.r),fill:skin},[c.c]);}
   const h=B.hands[s],hand=[...h.shape.fingers.flatMap(f=>f.pts),...h.shape.thumb.pts];
   for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5])hand.push([h.shape.palm.c[0]+dx*h.shape.palm.size[0],h.shape.palm.c[1]+dy*h.shape.palm.size[1],h.shape.palm.c[2]+dz*h.shape.palm.size[2]]);
   silhouette(hand.map(p=>L(h.frame,p)),skin,{'data-limb':'hand'+s});
   for(const k of ['rear','toes']){const f=B.feet[s][k],sp=B.shoe[k],pts=[];for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5])pts.push(L(f,[sp.c[0]+dx*sp.size[0],sp.c[1]+dy*sp.size[1],sp.c[2]+dz*sp.size[2]]));silhouette(pts,palette.shoe,{'data-limb':'shoe'+s});}
  }
  const hf=R.frames.head,head=[];
  for(let i=0;i<16;i++)for(let j=1;j<8;j++){const th=i/16*2*Math.PI,ph=j/8*Math.PI,d=[Math.sin(ph)*Math.cos(th)*B.head.radii[0],Math.cos(ph)*B.head.radii[1],Math.sin(ph)*Math.sin(th)*B.head.radii[2]];head.push(L({o:R.head,x:hf.x,y:hf.y,z:hf.z},d));}
  silhouette(head,palette.skin,{'data-part':'head'});
  face([L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[-1.2,0,9.4]),L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[0,-2.6,10.6]),L({o:R.head,x:hf.x,y:hf.y,z:hf.z},[1.2,0,9.4])],'#a3b3cb');
 }
 function body(R,boundsOnly=false){
  if(R.frames)return mannequinBody(R,boundsOnly);
  const surfaceLimb=(a,b,kind,fill,key,shorts=false)=>{
   if(boundsOnly){
    if(shorts)return;
    const r=Math.max(...CATALOG_LIMB_PROFILES[kind].flatMap(p=>p.slice(1)));
    for(const p of [a,b])for(const x of [-r,r])for(const y of [-r,r])for(const z of [-r,r])allBounds.push(project([p[0]+x,p[1]+y,p[2]+z]));
    return;
   }
   const heights=shorts?[0,.0725,.145]:[0,.2,.4,.6,.8,1],f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),delta=V3.sub(b,a);
   const points=heights.flatMap(t=>{
    const [u,v]=catalogLimbRadius(kind,t),r1=u+(shorts?.2:0),r2=v+(shorts?.2:0),c=V3.add(a,delta,t);
    return Array.from({length:8},(_,i)=>{const x=r1*Math.cos(i*Math.PI/4),y=r2*Math.sin(i*Math.PI/4);return c.map((n,k)=>n+f.x[k]*x+f.y[k]*y);});
   });
   silhouette(points,fill,{'data-limb':key});
  };
  for(const s of ['R','L']){
   const skin=palette[s==='R'?'far':'skin'];
   if(R.basis){
    for(const[kind,a,b]of [['th','hip','kn'],['sh','kn','an'],['ua','sh','el'],['fa','el','wr']])surfaceLimb(R[a+s],R[b+s],kind,skin,kind+s);
    surfaceLimb(R['hip'+s],R['kn'+s],'th',palette.shorts,'shorts'+s,true);
   }else{
    limb(R['hip'+s],R['kn'+s],13,'th',skin);limb(R['kn'+s],R['an'+s],10.5,'sh',skin);
    limb(R['sh'+s],R['el'+s],10,'ua',skin);limb(R['el'+s],R['wr'+s],8.5,'fa',skin);
    limb(R['hip'+s],V3.add(R['hip'+s],V3.unit(V3.sub(R['kn'+s],R['hip'+s])),18),14,'th',palette.shorts);
   }
   limb(R['heel'+s],R['toe'+s],6,'ft',palette.shoe);
   limb(R['wr'+s],R['hand'+s],7,'hd',skin);
  }
  const ring=(h,w,d)=>Array.from({length:12},(_,i)=>V3.add(V3.add(V3.add(R.hip,R.u,h),[1,0,0],w*Math.cos(i*Math.PI/6)),R.n,d*Math.sin(i*Math.PI/6)));
  const rings=R.basis?CATALOG_RINGS.map(([h])=>Array.from({length:24},(_,i)=>catalogTorsoPoint(R,h,i*Math.PI/12))):[ring(-5,12,8),ring(9,13,9),ring(23,12,8),ring(40,19,11),ring(49,19,9)];
  silhouette(rings.slice(1).flat(),palette.kit);silhouette(rings.slice(0,2).flat(),palette.shorts);
  line3(V3.add(R.sh,R.u,-2),R.head,8.5,'#95a6bd');
  const h=project(R.head),hu=project(V3.add(R.head,R.headU)),a=Math.atan2(hu[0]-h[0],-(hu[1]-h[1]))/D2R;
  queue('ellipse',{cx:f1(h[0]),cy:f1(h[1]),rx:8.5,ry:10,transform:`rotate(${f1(a)} ${f1(h[0])} ${f1(h[1])})`,fill:palette.skin},[R.head],1);
  const nose=[V3.add(V3.add(R.head,R.headN,8),R.headU,2),V3.add(R.head,R.headN,11),V3.add(V3.add(R.head,R.headN,8),R.headU,-3)];
  face(nose,'#a3b3cb');
 }
 function compile(t,index=0,withMuscles=true){
  records=[];const R=anim.rig3d(t);body(R,!withMuscles);
  const muscles=muscleFrame(anim,t,index);
  const sideValues=muscles&&anim.muscleProfile?.regions?catalogSideValues(anim.muscleProfile,muscles.values):null;
  const facingCam=f=>{const a=project([0,0,0]),b=project(f.normal);return b[2]-a[2]>.035;};
  const surfaces=!muscles||!withMuscles?[]:anim.muscleProfile?.regions?(R.frames?mannequinMuscleSurfaces(R,anim.muscleProfile,{coarse:true}).filter(facingCam):catalogMuscleSurfaces(R,anim.muscleProfile,{coarse:true}).filter(f=>project(f.normal)[2]>.035)):visibleMuscleSurfaces(R,anim.muscleProfile,camera);
  if(muscles&&withMuscles)for(const zone of muscleContours(surfaces)){
   const value=sideValues?.[zone.side]?.[zone.id]??muscles.values[zone.id],fill=muscleColor(value);
   queue('path',{d:closedSpline(zone.points.map(p=>project(p).slice(0,2))),fill,class:'muscle-zone','data-muscle':zone.id,'data-side':zone.side,
    'data-role':(anim.muscleProfile.regions?.[zone.id]||anim.muscleProfile.muscles[zone.id]).role,'data-band':muscleBand(value),
    stroke:fill,'stroke-width':.25,'stroke-linejoin':'round','aria-hidden':'true'},zone.points);
   /* Слой связан с глубиной своего сегмента: не проступает сквозь ближнюю руку/реквизит. */
   if(zone.anchor)records[records.length-1].depth=project(zone.anchor)[2]+.15;
  }
  R.props.forEach(prop);return{R,muscles,records:records.sort((a,b)=>a.depth-b.depth)};
 }
 // Bounds include equipment, every sampled pose, and the floor; camera stays still.
 for(let i=0;i<=40;i++){compile(i/40,0,false);tracePts.push(project(anim.rig3d(i/40).gripL));}
 const setVectors=anim.catalogId?catalogVectorGroup(svg,anim,camera):vectorGroup(svg,anim,camera);
 if(setVectors.bounds)allBounds.push(...setVectors.bounds);
 let floorCorners=[[-76,187,0],[76,187,0],[76,187,195],[-76,187,195]];
 if(anim.rig3d(0).frames){
  /* пол под всей сценой манекена: суставы по фазам и детали инвентаря */
  const xs=[],zs=[],add=p=>{if(p&&p.length===3){xs.push(p[0]);zs.push(p[2]);}};
  for(let i=0;i<=4;i++){const R=anim.rig3d(i/4);for(const k of ['hip','head','anL','anR','toeL','toeR','heelL','heelR','gripL','gripR','knL','knR'])add(R[k]);
   for(const q of R.props){if(!GymEquipment.visible(q,opts.has))continue;for(const k of ['a','b','c'])add(q[k]);if(q.pts)q.pts.forEach(add);if(q.size&&q.c){const r=Math.max(...q.size)/2;add(V3.add(q.c,[r,0,r]));add(V3.add(q.c,[-r,0,-r]));}}}
  const x0=Math.min(...xs)-18,x1=Math.max(...xs)+18,z0=Math.min(...zs)-18,z1=Math.max(...zs)+18;
  floorCorners=[[x0,186.5,z0],[x1,186.5,z0],[x1,186.5,z1],[x0,186.5,z1]];
 }
 if(!anim.noGround)allBounds.push(...floorCorners.map(project));
 let minX=Math.min(...allBounds.map(p=>p[0]))-13,maxX=Math.max(...allBounds.map(p=>p[0]))+13,minY=Math.min(...allBounds.map(p=>p[1]))-16,maxY=Math.max(...allBounds.map(p=>p[1]))+10;
 const ratio=opts.ratio||1.15,cx=(minX+maxX)/2,cy=(minY+maxY)/2;let w=maxX-minX,h=maxY-minY;
 if(w/h<ratio)w=h*ratio;else h=w/ratio;
 svg.setAttribute('viewBox',`${f1(cx-w/2)} ${f1(cy-h/2)} ${f1(w)} ${f1(h)}`);
 if(!anim.noGround){
  el('path',{d:path2(floorCorners.map(project)),class:'spatial-floor'},ground);
  const fx0=floorCorners[0][0]+6,fx1=floorCorners[1][0]-6,fz0=floorCorners[0][2],fz1=floorCorners[2][2];
  for(let z=Math.ceil(fz0/50)*50;z<fz1;z+=50){const a=project([fx0,187,z]),b=project([fx1,187,z]);el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],class:'spatial-grid'},ground);}
 }
 trace.setAttribute('d',tracePts.map((p,i)=>`${i?'L':'M'}${f1(p[0])},${f1(p[1])}`).join(' '));
 let nodes=[],jointNodes=[],selectedRegion='all';
 function at(t,frame){
  const {R,muscles,records}=compile(t,frame?.index||0);
  records.forEach((s,i)=>{let node=nodes[i];if(!node||node.tagName!==s.tag){const replacement=el(s.tag,{});if(node)node.replaceWith(replacement);else scene.appendChild(replacement);node=nodes[i]=replacement;}for(const attr of [...node.attributes])if(!(attr.name in s.attrs))node.removeAttribute(attr.name);for(const[k,v]of Object.entries(s.attrs))node.setAttribute(k,v);});
  for(let i=records.length;i<nodes.length;i++)nodes[i].remove();nodes.length=records.length;
  const names=['shL','elL','wrL','hipL','knL','anL','shR','elR','wrR','hipR','knR','anR'];
  names.forEach((name,i)=>{const p=project(R[name]),node=jointNodes[i]||(jointNodes[i]=el('circle',{r:2.1,class:'joint-dot'},dots));node.setAttribute('cx',f1(p[0]));node.setAttribute('cy',f1(p[1]));});
  svg.dataset.pose=String(t);if(muscles)svg.dataset.musclePhase=muscles.phase;allBounds.length=0;setRegion(selectedRegion);
  setVectors?.at?.(t,frame,R);
 }
 const setTrace=show=>trace.setAttribute('display',show?'inline':'none');
 const setMuscles=show=>svg.classList.toggle('show-muscles',!!show&&!!anim.muscleProfile);
 const setRegion=id=>{selectedRegion=id;for(const node of svg.querySelectorAll('[data-muscle]'))node.style.opacity=id==='all'||node.dataset.muscle===id?'1':'.12';};
 setMuscles(opts.muscles);at(opts.t||0);return{svg,at,setTrace,setVectors,setMuscles,setRegion,camera};
}

function spatialExercise(id,rig,camera,cameras,hints){
 const a=DEMO[id].anim;a.rig3d=rig;a.camera=camera;a.view=camera;a.cameras=cameras;a.cameraHints=hints;
 a.sample=t=>({spatialT:t});delete a._C;delete a._normalized;
}
spatialExercise('latpull',pulldownRig,'front',['front','back','side'],{
 front:'Следите за симметрией: локти опускаются по сторонам корпуса, хват не меняется.',
 back:'Видны широчайшие и середина спины. Локти опускаются симметрично, корпус не раскачивается.',
 side:'Рукоять проходит перед лицом к верхней части груди. Наклон корпуса остаётся небольшим.'
});
spatialExercise('bulgarian',bulgarianRig,'side',['side','angle'],{
 side:'Заднее колено опускается к полу; подъём задней стопы остаётся на скамье.',
 angle:'Стопы стоят на двух линиях. Переднее колено направлено в сторону носка, таз сохраняет положение.'
});
spatialExercise('hipthrust',thrustRig,'side',['side','angle'],{
 side:'Опора — нижняя часть лопаток. Диски показаны контуром, чтобы не скрывать таз и положение грифа.',
 angle:'Видны обе стопы, положение коленей и хват. Гриф с подкладкой лежит на сгибе бёдер.'
});
spatialExercise('chinup',chinupRig,'side',['side','front'],{
 side:'Локти движутся вниз перед корпусом. Кисти сохраняют хват, тело поднимается без раскачивания.',
 front:'Хват примерно на ширине плеч, ладонями к себе. Руки работают симметрично; движение локтей вперёд видно сбоку.'
});
