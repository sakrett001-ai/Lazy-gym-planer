/* Инвентарь атласа: параметрические модели снарядов и тренажёров в реальных размерах.
   Каждая деталь знает, к чему она крепится (mount), и свою роль: опора (support), рама (frame),
   хват (grip), свободный снаряд (free), трос (cable). Подвижные части берут положение из позы
   (хват, стопы), поэтому руки и ручки, стопы и платформы не расходятся.

   Размеры (см) — по типовым коммерческим образцам: гриф 220 см / шейка 131 / Ø28 мм, втулки Ø50;
   скамья 44 см до верха подушки, ширина 29; диск 20 кг Ø45; блок Ø9–10; турник Ø32 мм. */
const GymEquipment=((M)=>{
'use strict';
const{V,M3,D2R,toCat,dirCat}=M;
const TONES={frame:'frame',pad:'pad',chrome:'chrome',plate:'plate',rubber:'rubber',cable:'cable',band:'band',mat:'mat',wood:'wood',wall:'wall',stack:'stack'};
/* ---------- Сборщик: локальные координаты снаряда → мир → каталог ---------- */
function Builder(spec){
 const yaw=spec.yaw||0,R=M3.ry(yaw),o=[spec.at?.[0]||0,spec.at?.[1]||0,spec.at?.[2]||0];
 const P=p=>V.add(o,M3.v(R,p)),D=d=>M3.v(R,d),parts=[],anchors={},prefix=spec.id||spec.type;
 const id=k=>prefix+':'+k;
 const add=(k,part,opts={})=>{part.id=id(k);part.mount=opts.mount==null||opts.mount==='floor'?'floor':id(opts.mount);part.role=opts.role||'frame';part.tone=opts.tone||(part.role==='support'?'pad':'frame');if(opts.contact)part.contact=opts.contact;parts.push(part);return part;};
 return{
  P,D,parts,anchors,id,
  /* брус квадратного/прямоугольного сечения или труба (r) */
  tube(k,a,b,size,opts={}){const A=P(a),Bp=P(b);if(typeof size==='number')return add(k,{kind:'beam',a:toCat(A),b:toCat(Bp),r:size},opts);
   const up=D(opts.up||[0,1,0]);return add(k,{kind:'beam',a:toCat(A),b:toCat(Bp),w:size[0],h:size[1],up:dirCat(up)},opts);},
  box(k,c,size,opts={}){const ax=(opts.axes||[[1,0,0],[0,1,0],[0,0,1]]).map(a=>dirCat(D(V.unit(a))));return add(k,{kind:'obox',c:toCat(P(c)),x:ax[0],y:ax[1],z:ax[2],size:[...size],round:opts.round??.6},opts);},
  cyl(k,c,axis,r,len,opts={}){return add(k,{kind:'cyl',c:toCat(P(c)),axis:dirCat(V.unit(D(axis))),r,len,sides:opts.sides||24},opts);},
  ball(k,c,r,opts={}){return add(k,{kind:'sphere',c:toCat(P(c)),r},opts);},
  anchor(k,p){anchors[k]=P(p);return anchors[k];},
  frameAnchor(k,c,axes){anchors[k]={o:P(c),R:M3.cols(...axes.map(a=>V.unit(D(a))))};return anchors[k];}
 };
}
/* Наклонная подушка: центр нижней кромки (шарнир), угол от горизонтали, длина, ширина, толщина.
   Возвращает рамку подушки: y — нормаль к поверхности, z — вдоль подушки от шарнира. */
function padFrame(hinge,angle,dir=1){const a=angle*D2R,z=[0,Math.sin(a),dir*Math.cos(a)],y=[0,Math.cos(a),-dir*Math.sin(a)];return{hinge,z,y,x:V.cross(y,z)};}

/* ---------- Конструкции ---------- */
const TYPES={};
/* Коврик */
TYPES.mat=(s,b)=>{const L=s.len||180,W=s.width||60;b.box('mat',[0,.5,0],[W,1,L],{role:'support',tone:'mat',mount:'floor',round:.4});b.anchor('top',[0,1,0]);};
/* Горизонтальная скамья: ось вдоль Z, ножной конец −Z, головной +Z; верх подушки — height */
TYPES.flatBench=(s,b)=>{
 const H=s.height||44,L=s.len||120,W=s.width||29,T=6,z0=-L/2,z1=L/2;
 b.box('pad',[0,H-T/2,0],[W,T,L],{role:'support',tone:'pad',mount:'beam',round:1.6,contact:'top'});
 b.tube('beam',[0,H-T-3.75,z0+8],[0,H-T-3.75,z1-8],[7.5,7.5],{mount:'legF'});
 for(const[k,z]of [['F',z0+10],['B',z1-10]]){
  b.tube('leg'+k,[0,H-T-7.5,z],[0,6,z],[7.5,7.5],{mount:'foot'+k});
  b.tube('foot'+k,[-24,3.75,z],[24,3.75,z],[7.5,7.5],{mount:'floor',up:[0,1,0]});
  for(const sx of [-1,1])b.box('cap'+k+sx,[sx*24.5,3.75,z],[2,7,7],{mount:'foot'+k,tone:'rubber',round:.5});
 }
 b.anchor('top',[0,H,0]);b.anchor('head',[0,H,z1]);b.anchor('foot',[0,H,z0]);
};
/* Стойки для жима лёжа у головного конца скамьи */
TYPES.benchUprights=(s,b)=>{
 const X=s.halfWidth||56,Z=s.z||0,Hh=s.hook||108,top=Hh+18;
 for(const sx of [-1,1]){
  const k=sx<0?'L':'R';
  b.tube('up'+k,[sx*X,6,Z],[sx*X,top,Z],[5,7.5],{mount:'base'+k});
  b.tube('base'+k,[sx*X,3,Z-28],[sx*X,3,Z+20],[7.5,6],{mount:'floor'});
  b.box('hook'+k,[sx*X,Hh-2,Z-4.5],[4.5,4,6],{mount:'up'+k,tone:'chrome',round:.6});
  b.box('hookLip'+k,[sx*X,Hh+1.5,Z-7.2],[4.5,5,1.2],{mount:'hook'+k,tone:'chrome',round:.4});
 }
 b.tube('brace',[-X,3,Z+16],[X,3,Z+16],[6,6],{mount:'baseL'});
 b.anchor('hook',[0,Hh,Z-4.5]);
};
/* Регулируемая скамья: сиденье и спинка; back — угол спинки от горизонтали, seat — угол сиденья.
   Ось вдоль Z: передний край сиденья −Z, спинка поднимается к +Z. */
TYPES.adjBench=(s,b)=>{
 const H=s.height||45,back=s.back??0,seat=s.seat??0,W=s.width||29,T=6,sl=s.seatLen||36,bl=s.backLen||82,gap=1.5;
 const hingeZ=s.hingeZ??6,hinge=[0,H-T,hingeZ];
 /* сиденье: от шарнира вперёд (−Z), угол seat поднимает передний край */
 const sa=seat*D2R,sz=[0,-Math.sin(sa),-Math.cos(sa)],sy=[0,Math.cos(sa),-Math.sin(sa)];
 const seatC=V.add(V.add(hinge,sz,sl/2+gap),sy,T/2);
 if(s.seatPad!==false)b.box('seat',seatC,[W,T,sl],{axes:[[1,0,0],sy,V.scale(sz,-1)],role:'support',tone:'pad',mount:'seatPlate',round:1.6,contact:'top'});
 const ba=back*D2R,bz=[0,Math.sin(ba),Math.cos(ba)],by=[0,Math.cos(ba),-Math.sin(ba)];
 const backC=V.add(V.add(hinge,bz,bl/2+gap),by,T/2);
 b.box('back',backC,[W,T,bl],{axes:[[1,0,0],by,bz],role:'support',tone:'pad',mount:'backPlate',round:1.6,contact:'top'});
 /* пластины под подушками и рама */
 if(s.seatPad!==false)b.box('seatPlate',V.add(V.add(hinge,sz,sl/2+gap),sy,-1),[W-6,2,sl-4],{axes:[[1,0,0],sy,V.scale(sz,-1)],mount:'post'});
 b.box('backPlate',V.add(V.add(hinge,bz,bl/2+gap),by,-1),[W-6,2,bl-6],{axes:[[1,0,0],by,bz],mount:'strut'});
 b.tube('rail',[0,8,-48],[0,8,58],[7.5,7.5],{mount:'footF'});
 b.tube('post',[0,11.75,hingeZ-12],[0,H-T-2,hingeZ-12],[6,6],{mount:'rail'});
 if(s.seatPad===false)b.box('hingeBlock',[0,H-T-2,hingeZ-6],[10,6,14],{mount:'post'});
 b.tube('footF',[-26,3.75,-48],[26,3.75,-48],[7.5,7.5],{mount:'floor'});
 b.tube('footB',[-26,3.75,58],[26,3.75,58],[7.5,7.5],{mount:'floor'});
 b.tube('railB',[0,8,58],[0,8,50],[7.5,7.5],{mount:'footB'});
 /* опорная стойка спинки: от рамы к середине пластины спинки */
 const strutTop=V.add(V.add(hinge,bz,Math.min(bl*.55,40)),by,-2);
 b.tube('strut',[0,11.75,Math.max(hingeZ+10,Math.min(strutTop[2]+14,50))],strutTop,[5,5],{mount:'rail'});
 b.anchor('hinge',hinge);b.anchor('seatTop',V.add(V.add(hinge,sz,sl/2+gap),sy,T));
 b.frameAnchor('backPad',V.add(hinge,by,T),[[1,0,0],by,bz]);
 b.frameAnchor('seatPad',V.add(hinge,sy,T),[[1,0,0],sy,V.scale(sz,-1)]);
};
/* Силовая рама с турником и J-крюками; фронт рамы −Z… +Z, ширина по X */
TYPES.powerRack=(s,b)=>{
 const X=s.halfWidth||60,D=s.depth||110,H=s.height||232,zf=-D/2,zb=D/2;
 for(const[k,x,z]of [['FL',X,zf],['FR',-X,zf],['BL',X,zb],['BR',-X,zb]]){b.tube('up'+k,[x,0,z],[x,H,z],[7.5,7.5],{mount:'floor'});}
 for(const z of [zf,zb])b.tube('top'+(z<0?'F':'B'),[-X,H-3.75,z],[X,H-3.75,z],[7.5,7.5],{mount:'up'+(z<0?'FL':'BL')});
 for(const x of [X,-X]){const k=x>0?'L':'R';b.tube('side'+k,[x,H-3.75,zf],[x,H-3.75,zb],[7.5,7.5],{mount:'upF'+k});b.tube('base'+k,[x,3.75,zf-18],[x,3.75,zb+18],[7.5,7.5],{mount:'floor'});}
 const pz=zf-(s.barOut??12),py=s.pullH||H-8;
 if(s.pullBar!==false){for(const x of [X,-X])b.tube('pullArm'+(x>0?'L':'R'),[x,py,zf],[x,py,pz],[5,7.5],{mount:'upF'+(x>0?'L':'R')});
  b.tube('pullBar',[-X-3,py,pz],[X+3,py,pz],1.6,{mount:'pullArmL',role:'grip',tone:'chrome'});b.anchor('pullBar',[0,py,pz]);}
 if(s.hook){for(const x of [X,-X]){const k=x>0?'L':'R';b.box('hook'+k,[x,s.hook-2,zf-6],[5,4,6],{mount:'upF'+k,tone:'chrome'});b.box('hookLip'+k,[x,s.hook+1.5,zf-8.6],[5,5,1.2],{mount:'hook'+k,tone:'chrome'});}b.anchor('hook',[0,s.hook,zf-6]);}
 b.anchor('front',[0,0,zf]);
};
/* Машина Смита: направляющие вертикальны, гриф ходит вдоль них */
TYPES.smith=(s,b)=>{
 const X=s.halfWidth||62,H=s.height||228,Z=s.z||0,zb=Z+26;
 for(const x of [X,-X]){const k=x>0?'L':'R';
  b.tube('rod'+k,[x,6,Z],[x,H-8,Z],1.6,{mount:'base'+k,tone:'chrome',role:'guide'});
  b.tube('up'+k,[x+Math.sign(x)*9,0,zb],[x+Math.sign(x)*9,H,zb],[7.5,7.5],{mount:'floor'});
  b.tube('base'+k,[x,3.75,Z-55],[x,3.75,zb+30],[7.5,7.5],{mount:'floor'});
  b.tube('rodTop'+k,[x,H-8,Z],[x+Math.sign(x)*9,H-8,zb],[5,5],{mount:'up'+k});
  b.tube('rodBase'+k,[x,6,Z-5],[x,6,Z+5],[6,6],{mount:'base'+k});
 }
 b.tube('top',[-X-9,H-3.75,zb],[X+9,H-3.75,zb],[7.5,7.5],{mount:'upL'});
 b.anchor('rodL',[X,0,Z]);b.anchor('rodR',[-X,0,Z]);
};
/* «Бабочка» / задние дельты: рычаги вращаются вокруг вертикальных осей, проходящих через плечевые суставы.
   Сиденье в начале координат, подушка (спинка или грудной упор) — плоскостью z = padZ, рама — позади подушки
   с зазором для коленей при посадке лицом к упору. pivot — [x, y, z] осей (над плечами). */
TYPES.pecDeck=(s,b)=>{
 const seatH=s.seatH||48,padZ=s.padZ??18,padY=s.padY||95,padH=s.padH||60,padW=s.padW||30,towerZ=padZ+(s.towerGap||58),pv=s.pivot,H=pv[1]+16;
 b.box('seat',[0,seatH-3,0],[34,6,36],{role:'support',tone:'pad',mount:'seatPlate',round:1.6,contact:'top'});
 b.box('seatPlate',[0,seatH-7,0],[26,2,30],{mount:'seatPost'});
 b.tube('seatPost',[0,7.5,0],[0,seatH-8,0],[6,6],{mount:'base'});
 b.tube('base',[0,3.75,-26],[0,3.75,towerZ+26],[8,7.5],{mount:'floor'});
 b.tube('baseX',[-36,3.75,-22],[36,3.75,-22],[8,7.5],{mount:'base'});
 b.tube('baseB',[-36,3.75,towerZ],[36,3.75,towerZ],[8,7.5],{mount:'base'});
 b.tube('tower',[0,7.5,towerZ],[0,H,towerZ],[10,10],{mount:'base'});
 b.box('pad',[0,padY,padZ+3.5],[padW,padH,7],{role:'support',tone:'pad',mount:'padPlate',round:1.8,contact:'face'});
 b.box('padPlate',[0,padY,padZ+8],[padW-8,padH-8,2],{mount:'padArm'});
 b.tube('padArm',[0,padY,padZ+9],[0,padY,towerZ-5],[6,6],{mount:'tower'});
 b.tube('headArm',[0,H-4,towerZ-5],[0,H-4,pv[2]],[8,8],{mount:'tower'});
 b.tube('head',[-pv[0]-7,H-4,pv[2]],[pv[0]+7,H-4,pv[2]],[8,8],{mount:'headArm'});
 for(const sx of [-1,1]){const k=sx>0?'L':'R';b.cyl('hub'+k,[sx*pv[0],(pv[1]+H-8)/2,pv[2]],[0,1,0],4.2,H-8-pv[1]+.4,{mount:'head'});b.anchor('pivot'+k,[sx*pv[0],pv[1],pv[2]]);}
 b.box('stack',[0,62,towerZ+16],[28,124,14],{mount:'floor',tone:'stack'});
 b.box('stackTop',[0,126,towerZ+16],[30,4,16],{mount:'stack'});
 b.anchor('seatTop',[0,seatH,0]);b.anchor('padFace',[0,padY,padZ]);
};
/* ---------- Подвижные и свободные части: собираются по позе ---------- */
const PLATES={20:[22.5,5.6],15:[22.5,4.4],10:[22.5,3.4],5:[11.5,2.6],2.5:[9.5,1.8],1.25:[8,1.4],c10:[16,3.2],c5:[13,2.6],c2:[10,1.8]};
function barbellPart(c,axis,plates=[20],opts={}){
 /* олимпийский гриф 220 см; короткий (curl) — 120 см, шейка 70, втулки Ø3 */
 const curl=opts.size==='curl';
 return{kind:'barbell',c,axis,len:curl?120:220,inner:curl?35:65.5,shaftR:curl?1.4:1.4,sleeveR:curl?1.6:2.5,plates:plates.map(w=>Array.isArray(w)?w:(PLATES[w]||PLATES[20])),role:'free',tone:'chrome',free:true,id:opts.id||'barbell',mount:opts.mount||'hands'};
}
function dumbbellPart(c,axis,opts={}){return{kind:'dumbbell',c,axis,handle:opts.handle||13.5,headR:opts.headR||7.5,headLen:opts.headLen||7,role:'free',tone:'plate',free:true,id:opts.id||'dumbbell',mount:opts.mount||'hand'};}
const BIND={};
/* Гриф в руках: центр посередине между хватами, ось — линия хватов */
BIND.barbell=(e,R)=>{
 const L=R.gripL,Rr=R.gripR,axis=V.unit(V.sub(L,Rr)),c=e.center?V.add(V.mix(L,Rr,.5),axis,e.offset||0):V.mix(L,Rr,.5);
 const parts=[barbellPart(c,axis,e.plates,{id:e.id||'barbell',size:e.size})];
 return parts;
};
/* Гриф Смита: центр — на оси между направляющими на высоте хвата */
BIND.smithBar=(e,R)=>{
 const rodL=toCat(e.rodL),rodR=toCat(e.rodR),y=(R.gripL[1]+R.gripR[1])/2,c=[(rodL[0]+rodR[0])/2,y,(rodL[2]+rodR[2])/2],axis=V.unit(V.sub(rodL,rodR));
 const bar=barbellPart(c,axis,e.plates||[10],{id:e.id||'smithBar'});bar.free=false;bar.role='guided';bar.mount=(e.id||'smithBar')+':carL';bar.len=e.len||216;bar.inner=e.inner||69;
 const out=[bar];
 for(const[k,rod]of [['L',rodL],['R',rodR]])out.push({kind:'obox',c:[rod[0],y,rod[2]],x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[6,9,7],round:.8,tone:'frame',role:'carriage',id:(e.id||'smithBar')+':car'+k,mount:e.mountTo+':rod'+k});
 return out;
};
BIND.dumbbell=(e,R)=>{
 const s=e.hand,f=R.frames['hand'+s];
 return[dumbbellPart(R['grip'+s],f.z,{id:e.id||'dumbbell'+s,handle:e.handle,headR:e.headR,headLen:e.headLen})];
};
/* Гантель на опоре (пол, скамья): c — центр рукояти во внутренних координатах */
BIND.restingDumbbell=e=>[{...dumbbellPart(toCat(e.c),dirCat(V.unit(e.axis||[1,0,0])),{id:e.id||'dumbbellRest'}),mount:e.on||'floor'}];
/* Рычаг «бабочки»: от оси вниз и наружу к рукояти в руке */
BIND.pecArm=(e,R)=>{
 const s=e.hand,pivot=toCat(e.pivot),grip=R['grip'+s],top=[pivot[0],pivot[1],pivot[2]];
 const hand=R.frames['hand'+s],hAxis=hand.z,handleHalf=9;
 const hTop=V.add(grip,hAxis,V.dot(hAxis,[0,-1,0])>0?handleHalf:-handleHalf),hBot=V.add(grip,hAxis,V.dot(hAxis,[0,-1,0])>0?-handleHalf:handleHalf);
 const elbow=[hTop[0],pivot[1],hTop[2]];
 const id=e.id||'pec'+s;
 return[
  {kind:'beam',a:top,b:elbow,w:5,h:5,up:[0,-1,0],tone:'frame',role:'linkage',id:id+':arm',mount:e.mountTo},
  {kind:'beam',a:elbow,b:hTop,r:2.2,tone:'frame',role:'linkage',id:id+':drop',mount:id+':arm'},
  {kind:'beam',a:hTop,b:hBot,r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':drop'}
 ];
};
/* Гриф на опоре (крюки, стойки): c — центр во внутренних координатах */
BIND.restingBarbell=e=>{const b=barbellPart(toCat(e.c),dirCat(V.unit(e.axis||[1,0,0])),e.plates||[],{id:e.id||'barRest'});b.mount=e.on||'floor';return[b];};
/* Лента/трос: ломаная от точки крепления к хвату */
BIND.band=(e,R)=>{
 const out=[];
 for(const s of e.hands||['L','R']){
  let from=e.fromSole?null:e.fromKey?R[e.fromKey+s]:toCat(e.from);
  let via=(e.via||[]).map(toCat);
  if(e.fromSole){const t=R.frames['toes'+s],g=s==='L'?1:-1,lat=V.scale(t.x,g);from=V.add(V.add(R['ball'+s],t.y,M.B.toeSole-(e.r||.7)),t.z,1.5);via=[V.add(V.add(R['ball'+s],lat,5.6),t.y,-1)];}
  const pts=[from,...via,R['grip'+s]];
  out.push({kind:'cable',pts,r:e.r||.7,tone:'band',role:'cable',id:(e.id||'band')+':'+s,mount:e.fromKey||e.fromSole?'body':'floor'});
  out.push({kind:'beam',a:V.add(R['grip'+s],R.frames['hand'+s].z,6.5),b:V.add(R['grip'+s],R.frames['hand'+s].z,-6.5),r:1.6,tone:'rubber',role:'grip',id:(e.id||'band')+':handle'+s,mount:(e.id||'band')+':'+s});
 }
 return out;
};
/* ---------- Обобщённые подвижные части ---------- */
/* Точка тела: ключ позы ('gripL'), смесь двух ключей или смещение в рамке сегмента (внутренние оси, см) */
function bodyPoint(R,b){
 if(typeof b==='string')return R[b];
 let p=b.mix?V.mix(R[b.mix[0]],R[b.mix[1]],b.mix[2]??.5):R[b.key];
 if(b.off){const f=R.frames[b.frame];p=V.add(V.add(V.add(p,f.x,b.off[0]),f.y,b.off[1]),f.z,b.off[2]);}
 return p;
}
const ortho=(u,a)=>{let w=V.sub(u,V.scale(a,V.dot(u,a)));if(V.len(w)<1e-6)w=V.sub([0,0,1],V.scale(a,a[2]));return V.unit(w);};
/* Рычаг: ось (pivot, axis) неподвижна, конец следует за точкой тела.
   end: roller — валик вдоль оси (голень, бедро), handle — рукоять вдоль оси кисти, pad — подушка, none.
   armAt — положение плеча рычага вдоль оси (например, сбоку от сиденья), иначе — напротив точки. */
BIND.lever=(e,R)=>{
 const P=toCat(e.pivot),A=V.unit(dirCat(e.axis)),T=bodyPoint(R,e.bind),id=e.id||'lever',out=[];
 const d=V.sub(T,P),along=V.dot(d,A),rad=V.sub(d,V.scale(A,along)),rl=V.len(rad),ru=rl>1e-6?V.scale(rad,1/rl):ortho([0,1,0],A);
 const reach=V.add(rad,ru,e.extend||0),armAt=e.armAt??along,a0=V.add(P,A,armAt),a1=V.add(a0,reach),w=e.armW||5;
 out.push({kind:'beam',a:a0,b:a1,w,h:w,up:A,tone:'frame',role:'linkage',id:id+':arm',mount:e.mountTo});
 const c=V.add(V.add(P,A,along+(e.endShift||0)),reach);
 if(e.end==='roller'){
  if(Math.abs(armAt-along)>2)out.push({kind:'beam',a:a1,b:c,r:1.6,tone:'chrome',role:'linkage',id:id+':bar',mount:id+':arm'});
  out.push({kind:'cyl',c,axis:A,r:e.endR||5.5,len:e.endLen||30,tone:'pad',role:'pad',id:id+':roller',mount:Math.abs(armAt-along)>2?id+':bar':id+':arm'});
 }else if(e.end==='pad'){
  const n=e.padNormal?V.unit(dirCat(e.padNormal)):V.scale(ru,-1),z=ortho(A,n),x=V.cross(n,z);
  if(Math.abs(armAt-along)>2)out.push({kind:'beam',a:a1,b:c,r:1.6,tone:'chrome',role:'linkage',id:id+':bar',mount:id+':arm'});
  out.push({kind:'obox',c:V.add(c,n,-(e.padT||6)/2),x,y:n,z,size:[e.padW||28,e.padT||6,e.padL||18],round:1.4,tone:'pad',role:'pad',id:id+':pad',mount:Math.abs(armAt-along)>2?id+':bar':id+':arm'});
 }else if(e.end==='handle'){
  const s=e.hand,hz=R.frames['hand'+s].z,g=R['grip'+s],h=e.endLen||12;
  out.push({kind:'beam',a:a1,b:V.add(g,hz,-h/2),r:2,tone:'frame',role:'linkage',id:id+':drop',mount:id+':arm'});
  out.push({kind:'beam',a:V.add(g,hz,-h/2),b:V.add(g,hz,h/2),r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':drop'});
 }
 return out;
};
/* Каретка на прямой направляющей: положение — проекция точки тела на линию rail.
   parts — детали в рамке каретки: z вдоль направляющей (от rail[0] к rail[1]), y — нормаль up, x = y×z. */
BIND.sled=(e,R)=>{
 const A=toCat(e.rail[0]),Bp=toCat(e.rail[1]),z=V.unit(V.sub(Bp,A)),T=bodyPoint(R,e.bind),id=e.id||'sled';
 const s=Math.max(0,Math.min(V.dist(A,Bp),V.dot(V.sub(T,A),z)+(e.shift||0))),O=V.add(A,z,s);
 const y=ortho(V.unit(dirCat(e.up||[0,1,0])),z),x=V.cross(y,z),L=p=>V.add(V.add(V.add(O,x,p[0]),y,p[1]),z,p[2]);
 return(e.parts||[]).map((p,i)=>{
  const q={...p,id:id+':'+(p.name||i),mount:p.mount?id+':'+p.mount:e.mountTo,tone:p.tone||'frame',role:p.role||'frame'};
  if(p.kind==='obox'){q.c=L(p.c);q.x=x;q.y=y;q.z=z;}
  else if(p.kind==='beam'){q.a=L(p.a);q.b=L(p.b);if(!p.r)q.up=y;}
  else if(p.kind==='cyl'){q.c=L(p.c);const ax=p.axis||[1,0,0];q.axis=V.unit(V.add(V.add(V.scale(x,ax[0]),y,ax[1]),z,ax[2]));}
  delete q.name;return q;
 });
};
/* Трос от блока к рукояти. attach: D (рукоять на кисть), rope (канат, две ветви), bar (прямая рукоять),
   V (V-образная рукоять), ankle (манжета на голеностоп). Колесо блока поворачивается к тросу. */
BIND.cable=(e,R)=>{
 const id=e.id||'cable',pulley=toCat(e.from),hands=e.hands||['L','R'],out=[],wr=e.wheelR||4.5;
 let clip,grips=hands.map(s=>R['grip'+s]);
 const towards=(p,k)=>V.add(p,V.unit(V.sub(pulley,p)),k);
 if(e.attach==='ankle'){const s=e.foot||'L',f=R.frames['sk'+s],an=V.add(R['an'+s],f.y,6);clip=towards(an,7);
  out.push({kind:'cyl',c:an,axis:V.scale(f.y,-1),r:5.2,len:5,tone:'rubber',role:'strap',id:id+':strap',mount:'body'});}
 else if(e.attach==='rope'){
  const mid=V.mix(grips[0],grips[1]??grips[0],.5);clip=towards(mid,e.clip??13);
  hands.forEach((s,i)=>{const g=grips[i],dir=V.unit(V.sub(g,clip));out.push({kind:'cable',pts:[clip,V.add(g,dir,4)],r:1.3,tone:'rope',role:'grip',id:id+':rope'+s,mount:id+':line'});out.push({kind:'sphere',c:V.add(g,dir,5.5),r:2.1,tone:'rubber',role:'frame',id:id+':knob'+s,mount:id+':rope'+s});});
 }else if(e.attach==='bar'){
  const a=grips[0],b=grips[1],ax=V.unit(V.sub(a,b)),ext=e.ext??8,mid=V.mix(a,b,.5);clip=towards(mid,3);
  out.push({kind:'beam',a:V.add(a,ax,ext),b:V.add(b,ax,-ext),r:1.4,tone:'chrome',role:'grip',id:id+':bar',mount:id+':line'});
  if(e.bend){for(const[p,sg]of [[a,1],[b,-1]]){const tip=V.add(V.add(p,ax,sg*ext),V.unit(V.sub(clip,mid)),-e.bend);out.push({kind:'beam',a:V.add(p,ax,sg*ext),b:tip,r:1.4,tone:'chrome',role:'grip',id:id+':bend'+(sg>0?'L':'R'),mount:id+':bar'});}}
 }else if(e.attach==='V'){
  const a=grips[0],b=grips[1]??grips[0],mid=V.mix(a,b,.5);clip=towards(mid,e.clip??11);
  hands.forEach((s,i)=>{const g=grips[i],hz=R.frames['hand'+s].z;out.push({kind:'beam',a:V.add(g,hz,-5.5),b:V.add(g,hz,5.5),r:1.5,tone:'rubber',role:'grip',id:id+':grip'+s,mount:id+':v'+s});
   const far=V.dot(V.sub(V.add(g,hz,5.5),clip),V.sub(V.add(g,hz,5.5),clip))>V.dot(V.sub(V.add(g,hz,-5.5),clip),V.sub(V.add(g,hz,-5.5),clip))?V.add(g,hz,5.5):V.add(g,hz,-5.5);
   out.push({kind:'beam',a:far,b:clip,r:1.3,tone:'chrome',role:'frame',id:id+':v'+s,mount:id+':line'});});
 }else{ /* D-рукоять на каждую кисть (в кроссовере у каждой руки свой трос) */
  const s=hands[0],g=grips[0],hz=R.frames['hand'+s].z,a=V.add(g,hz,-6),b=V.add(g,hz,6);clip=towards(g,e.clip??9);
  out.push({kind:'beam',a,b,r:1.6,tone:'rubber',role:'grip',id:id+':handle',mount:id+':d'});
  out.push({kind:'cable',pts:[a,clip,b],r:.8,tone:'chrome',role:'frame',id:id+':d',mount:id+':line'});
 }
 const dir=V.unit(V.sub(clip,pulley)),colUp=[0,-1,0];let ax=V.cross(dir,colUp);if(V.len(ax)<1e-3)ax=[1,0,0];ax=V.unit(ax);
 const tangent=V.add(pulley,dir,wr*.2);
 out.unshift({kind:'cable',pts:[tangent,clip],r:.35,tone:'cable',role:'cable',id:id+':line',mount:e.mountTo||'floor'});
 out.unshift({kind:'cyl',c:pulley,axis:ax,r:wr,len:2.4,tone:'chrome',role:'frame',id:id+':wheel',mount:e.mountTo||'floor'});
 return out;
};
/* Гиря: рукоять на хвате (одна или две руки), шар висит по гравитации или по линии рук */
BIND.kettlebell=(e,R)=>{
 const hands=e.hands||['L'],grips=hands.map(s=>R['grip'+s]),g=V.mix(grips[0],grips[1]??grips[0],.5);
 const axis=hands.length>1?V.unit(V.sub(grips[0],grips[1])):V.unit(R.frames['hand'+hands[0]].z);
 let down=[0,1,0];if(e.hang==='arm'){const s=hands[0];down=V.unit(V.sub(R['wr'+s],R['el'+s]));}
 down=ortho(down,axis);
 const r=e.r||10.5,c=V.add(g,down,(e.drop||15)+(hands.length>1?2:0));
 return[{kind:'kettlebell',c,grip:g,axis,handleAxis:axis,radius:r,role:'free',tone:'plate',free:true,id:e.id||'kb',mount:'hands'}];
};
/* Ролик для пресса: ось проходит через хваты */
BIND.abWheel=(e,R)=>{
 const a=R.gripL,b=R.gripR,ax=V.unit(V.sub(a,b)),c=V.mix(a,b,.5),id=e.id||'wheel';
 return[{kind:'cyl',c,axis:ax,r:e.r||9,len:5,tone:'rubber',role:'free',free:true,id:id+':wheel',mount:'hands'},
  {kind:'beam',a:V.add(a,ax,6),b:V.add(b,ax,-6),r:1.6,tone:'rubber',role:'grip',id:id+':axle',mount:id+':wheel'}];
};
/* Шатуны велотренажёра: педали под подушечками стоп */
BIND.crank=(e,R)=>{
 const axle=toCat(e.axle),A=V.unit(dirCat(e.axis||[1,0,0])),id=e.id||'crank',out=[];
 for(const s of ['L','R']){
  const t=R.frames['toes'+s],ped=V.add(R['ball'+s],t.y,M.B.toeSole-1.4),off=V.dot(V.sub(ped,axle),A),hub=V.add(axle,A,off*.75);
  out.push({kind:'beam',a:hub,b:V.add(ped,A,-Math.sign(off||1)*3),w:3.2,h:1.6,up:A,tone:'chrome',role:'linkage',id:id+':arm'+s,mount:e.mountTo});
  out.push({kind:'obox',c:ped,x:t.x,y:t.y,z:t.z,size:[10,2.2,9],round:.5,tone:'rubber',role:'pedal',id:id+':pedal'+s,mount:id+':arm'+s});
 }
 return out;
};
/* Подножки/педали эллипса и степпера: платформа под стопой и тяга к оси */
BIND.footPedals=(e,R)=>{
 const id=e.id||'pedals',out=[];
 for(const s of ['L','R']){
  const f=R.frames['foot'+s],t=R.frames['toes'+s],mid=V.mix(R['heel'+s],R['ball'+s],.5),c=V.add(mid,f.y,-(M.B.ankle-1.2)-1.2),under=V.add(c,f.y,-1.4);
  out.push({kind:'obox',c,x:f.x,y:f.y,z:f.z,size:[13,2.4,34],round:.6,tone:'rubber',role:'pedal',id:id+':pedal'+s,mount:id+':arm'+s});
  const pv=toCat(e.pivots[s]);out.push({kind:'beam',a:pv,b:under,w:4,h:3,up:[0,-1,0],tone:'frame',role:'linkage',id:id+':arm'+s,mount:e.mountTo});
 }
 return out;
};
/* Сиденье, скользящее по монорельсу (гребной тренажёр) */
BIND.slideSeat=(e,R)=>{
 const top=e.top||36,z=R.hip[2]+(e.shift||0),c=toCat([0,top-2.5,0]);c[2]=z;c[0]=R.hip[0];
 return[{kind:'obox',c,x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[28,5,32],round:1.4,tone:'pad',role:'support',id:(e.id||'seat')+':pad',mount:e.mountTo},
  {kind:'obox',c:V.add(c,[0,4.5,0]),x:[1,0,0],y:[0,-1,0],z:[0,0,1],size:[14,4,18],round:.6,tone:'frame',role:'carriage',id:(e.id||'seat')+':car',mount:e.mountTo}];
};
/* Полотенце/лента от неподвижной точки (дверная ручка) или из-под стопы к кистям */
BIND.towel=(e,R)=>{
 const out=[],id=e.id||'towel',hands=e.hands||['L','R'];
 let from;
 if(e.underFoot){const s=e.underFoot,t=R.frames['toes'+s],f=R.frames['foot'+s];from=V.add(V.mix(R['ball'+s],R['heel'+s],.3),f.y,-(M.B.ankle-.6)+0);}
 else from=toCat(e.from);
 for(const s of hands){const g=R['grip'+s],hz=R.frames['hand'+s].z;out.push({kind:'cable',pts:[from,V.add(g,hz,s==='L'?-2:2)],r:e.r||1.6,tone:'towel',role:'grip',id:id+':'+s,mount:e.underFoot?'body':(e.mountTo||'floor')});}
 return out;
};
/* ---------- Варианты снаряжения ----------
   optional: 'kb' — деталь видна, если у пользователя есть этот инвентарь; optionalNot: 'kb' — видна, если его нет.
   Так один и тот же хват показывает гирю или гантель в зависимости от выбранного инвентаря. */
function visible(p,has){if(!has)return!p.optionalNot;return(!p.optional||has(p.optional))&&(!p.optionalNot||!has(p.optionalNot));}
/* ---------- Сборка сцены упражнения ---------- */
function staticParts(list){
 const parts=[],anchors={};
 for(const e of list){if(!TYPES[e.type])continue;const b=Builder(e);TYPES[e.type](e,b);parts.push(...b.parts);anchors[e.id||e.type]=b.anchors;}
 return{parts,anchors};
}
const STATIC_CACHE=new Map();
function build(list,R){
 const key=JSON.stringify(list.filter(e=>TYPES[e.type]));
 let st=STATIC_CACHE.get(key);if(!st){st=staticParts(list);STATIC_CACHE.set(key,st);if(STATIC_CACHE.size>64)STATIC_CACHE.delete(STATIC_CACHE.keys().next().value);}
 const out=st.parts.map(p=>({...p}));
 for(const e of list)if(BIND[e.type])for(const p of BIND[e.type](e,R)){if(e.optional)p.optional=e.optional;if(e.optionalNot)p.optionalNot=e.optionalNot;out.push(p);}
 for(const p of out){const src=list.find(e=>p.id&&p.id.startsWith((e.id||e.type)+':'));if(p.optional==null&&src?.optional)p.optional=src.optional;if(p.optionalNot==null&&src?.optionalNot)p.optionalNot=src.optionalNot;}
 return out;
}
function anchors(list){return staticParts(list).anchors;}
/* ---------- Риг упражнения: ключи позы → поза каталога + инвентарь ---------- */
function rig(entry){
 const track=M.makeTrack(entry.keys,{loop:!!entry.loop});
 return t=>{
  if(!Number.isFinite(t)||t<0||t>1)throw Error('Pose must be in [0,1]');
  const k=track(t),q=M.unpack(k.v,k.hands);if(entry.gripRadius)q.gripRadius=entry.gripRadius;
  const R=M.catalogPose(q);R.props=build(entry.equipment||[],R);R.contacts=(entry.contacts||[]).map(c=>({...c}));R.exerciseBasis='mannequin';
  return R;
 };
}
return{TYPES,BIND,Builder,build,anchors,rig,PLATES,padFrame,barbellPart,dumbbellPart,bodyPoint,ortho,visible};
})(typeof Mannequin!=='undefined'?Mannequin:require('./09bm-mannequin.js'));
if(typeof module!=='undefined'&&module.exports){module.exports=GymEquipment;const fs=require('fs'),path=require('path');for(const f of fs.readdirSync(__dirname).filter(f=>/^09bo.*\.js$/.test(f)).sort()){try{require(path.join(__dirname,f));}catch(e){console.error('Инвентарь '+f+': '+e.message);}}}
