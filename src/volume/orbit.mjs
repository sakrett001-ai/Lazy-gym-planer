/* Свободная камера сцены разбора и экрана тренировки: математика без three.js и без DOM (проверки — tools/orbit.test.js;
   жесты — controls.mjs, камера фигуры — main.mjs).
   Камера вращается вокруг середины рамки всего движения C — центра коробки, охватывающей тело и инвентарь во всех фазах
   повторения, а не текущую позу: человек не уходит из кадра ни в одной фазе. Положение камеры:
     камера = C + d·B + ox·R + oy·U,  взгляд — вдоль −B,
   где R, U, B — оси «вправо», «вверх», «к зрителю» по углам yaw (вокруг вертикали) и pitch (над горизонтом),
   d — расстояние до плоскости через C, (ox, oy) — сдвиг кадра в этой плоскости. Поворот меняет только оси: точка C
   остаётся на том же месте экрана. Приближение — угол обзора (zoom), а не наезд камеры: тело не режется ближней
   плоскостью, перспектива не искажается, а приближение к точке под пальцем или курсором точное.
   Предустановки (above, angle, side, front, back, rear) — те же углы, что у ортографических камер карточек (scene.mjs).
   Кадр предустановки подбирается по точкам всех фаз, как ортографический (поля FRAME_PAD), но с перспективой: для точки
   в осях предустановки (x, y; z — к зрителю) и камеры в (cx, cy, D) условие «в кадре» — |x − cx| ≤ (D − z)·t, где t —
   тангенс половины угла обзора, делённый на поля. Отсюда D·t ≥ (A + B)/2 и cx = (A − B)/2 при A(t) = max(x + t·z),
   B(t) = max(−x + t·z) по всем точкам (так же по вертикали). A и B выпуклы по t, поэтому их значения на сетке FIT_GRID
   с линейной интерполяцией между узлами — с запасом: все точки остаются в кадре. Сетка нужна по горизонтали (тангенс
   зависит от пропорций сцены); по вертикали угол обзора постоянный — одно значение. */
/* вертикальный угол обзора интерактивных сцен, градусы. 0 — прежний «чертёжный» ортографический вид (одна константа) */
export const PERSPECTIVE_FOV=28;
/* поля кадра — как у ортографических камер разбора (scene.resize) */
export const FRAME_PAD=1.13;
/* крупный план — до ×4 к кадру предустановки; отдаление — до «всё движение в кадре при любом повороте», не меньше ZOOM_FLOOR */
export const ZOOM_MAX=4,ZOOM_FLOOR=.3;
/* наклон камеры, градусы: не ниже 8° под горизонтом и не выше почти отвесного взгляда сверху; камера не ближе FLOOR_CLEAR м к полу */
export const PITCH_MIN=-8,PITCH_MAX=85,FLOOR_CLEAR=.25;
/* тангенс по горизонтали — в долях вертикального: пропорции сцены от 0,6 до 3,4 (шире — с запасом по последнему узлу) */
export const FIT_GRID=[.6,.8,1,1.25,1.6,2,2.6,3.4];
/* переход к предустановке, мс; поворот и приближение клавишами — короткий переход */
export const PRESET_MS=400,KEY_MS=160;
/* шаги клавиатуры: поворот и наклон (градусы), приближение (раз) */
export const KEY_YAW=15,KEY_PITCH=10,KEY_ZOOM=1.25;
const D2R=Math.PI/180,ORTHO_DIST=12,MIN_DIST=.3;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v));
/* угол в [−π, π) */
export const wrapAngle=a=>{a=(a+Math.PI)%(2*Math.PI);if(a<0)a+=2*Math.PI;return a-Math.PI;};
export const viewOptions=(o={})=>({fov:o.fov??PERSPECTIVE_FOV,pad:o.pad??FRAME_PAD,settings:o.settings});

/* оси камеры: R — вправо, U — вверх, B — к зрителю (камера смотрит вдоль −B), как у lookAt three.js с верхом по оси Y */
export function axes(yaw,pitch){
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 return{right:[cy,0,sy],up:[sy*sp,cp,-cy*sp],back:[-sy*cp,sp,cy*cp]};
}
/* углы предустановки (scene.mjs: [yaw, elev] в градусах, elev < 0 — сверху) — в радианы; pitch > 0 — камера выше */
export function presetAngles(settings,id){const s=settings[id];return{yaw:wrapAngle(s[0]*D2R),pitch:-s[1]*D2R};}
export const boxCenter=b=>[(b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2];
const boxHalf=b=>[(b[3]-b[0])/2,(b[4]-b[1])/2,(b[5]-b[2])/2];
export const boxRadius=b=>Math.hypot(...boxHalf(b));

/* Сбор рамки по точкам всех фаз (scene.includeBounds передаёт каждую точку): коробка в мире и по каждой предустановке —
   прямоугольник на экране (r) и значения A, B на сетке (x — по горизонтали, y — по вертикали). Округление — наружу
   (на 0,1 мм): кадр остаётся с запасом. */
export function frameCollector(settings,o={}){
 const{fov,pad}=viewOptions(o),ty=fov>0?Math.tan(fov*D2R/2)/pad:0,grid=ty?FIT_GRID.map(k=>k*ty):[],n=grid.length;
 const cams=Object.keys(settings).map(id=>{const p=presetAngles(settings,id),a=axes(p.yaw,p.pitch);return{id,R:a.right,U:a.up,B:a.back,r:[Infinity,-Infinity,Infinity,-Infinity],x:new Array(2*n).fill(-Infinity),y:ty?[-Infinity,-Infinity]:[]};});
 const box=[Infinity,Infinity,Infinity,-Infinity,-Infinity,-Infinity];let count=0;
 function add(px,py,pz){
  if(!Number.isFinite(px)||!Number.isFinite(py)||!Number.isFinite(pz))return;
  count++;
  if(px<box[0])box[0]=px;if(py<box[1])box[1]=py;if(pz<box[2])box[2]=pz;if(px>box[3])box[3]=px;if(py>box[4])box[4]=py;if(pz>box[5])box[5]=pz;
  for(const c of cams){
   const x=c.R[0]*px+c.R[2]*pz,y=c.U[0]*px+c.U[1]*py+c.U[2]*pz,z=c.B[0]*px+c.B[1]*py+c.B[2]*pz,r=c.r;
   if(x<r[0])r[0]=x;if(x>r[1])r[1]=x;if(y<r[2])r[2]=y;if(y>r[3])r[3]=y;
   for(let i=0;i<n;i++){const t=grid[i],a=x+t*z,b=t*z-x;if(a>c.x[i])c.x[i]=a;if(b>c.x[n+i])c.x[n+i]=b;}
   if(ty){const a=y+ty*z,b=ty*z-y;if(a>c.y[0])c.y[0]=a;if(b>c.y[1])c.y[1]=b;}
  }
 }
 function data(){
  if(!count)return null;
  const up=v=>Math.ceil(v*1e4)/1e4,down=v=>Math.floor(v*1e4)/1e4;
  return{fov,pad,box:[...box.slice(0,3).map(down),...box.slice(3).map(up)],
   cams:Object.fromEntries(cams.map(c=>[c.id,{r:[down(c.r[0]),up(c.r[1]),down(c.r[2]),up(c.r[3])],x:c.x.map(up),y:c.y.map(up)}]))};
 }
 return{add,data,get count(){return count;}};
}
/* рамка из памяти годится: тот же угол обзора и поля, все предустановки, конечные числа */
export function validFrame(f,o={}){
 const{fov,pad,settings}=viewOptions(o),n=fov>0?FIT_GRID.length:0,fin=a=>Array.isArray(a)&&a.every(Number.isFinite);
 if(!f||typeof f!=='object'||f.fov!==fov||f.pad!==pad||!fin(f.box)||f.box.length!==6||!f.cams)return false;
 return Object.keys(settings).every(id=>{const c=f.cams[id];return c&&fin(c.r)&&c.r.length===4&&fin(c.x)&&c.x.length===2*n&&fin(c.y)&&c.y.length===(n?2:0);});
}
/* A и B по горизонтали при тангенсе t: линейно между узлами сетки (с запасом — функции выпуклые); ниже первого узла —
   между t = 0 (прямоугольник r) и первым узлом; выше последнего — последний узел (более широкий кадр тем более вмещает) */
function fitAt(c,t,ty){
 const g=FIT_GRID.map(k=>k*ty),n=g.length,A=i=>c.x[i],B=i=>c.x[n+i];
 if(t>=g[n-1])return[A(n-1),B(n-1),g[n-1]];
 if(t<=g[0]){const u=t/g[0];return[c.r[1]+(A(0)-c.r[1])*u,-c.r[0]+(B(0)+c.r[0])*u,t];}
 let i=0;while(t>g[i+1])i++;
 const u=(t-g[i])/(g[i+1]-g[i]);return[A(i)+(A(i+1)-A(i))*u,B(i)+(B(i+1)-B(i))*u,t];
}
/* Кадр предустановки id для сцены с пропорциями aspect (ширина/высота): положение камеры в виде {yaw, pitch, d, s, ox, oy,
   zoom}; s — половина высоты кадра в плоскости C без приближения; px, py — сдвиг кадра самой предустановки (граница
   сдвига его не обрезает). Ортографический вид (fov 0) — прежняя рамка scene.resize. */
export function presetView(frame,id,aspect,o={}){
 const{fov,pad,settings}=viewOptions(o),{yaw,pitch}=presetAngles(settings,id),a=axes(yaw,pitch),c=frame.cams[id],C=boxCenter(frame.box);
 aspect=aspect>0?aspect:1;
 let cx,cy,d,s;
 if(fov>0){
  const th=Math.tan(fov*D2R/2),ty=th/pad,[Ax,Bx,tx]=fitAt(c,ty*aspect,ty);
  const D=Math.max((Ax+Bx)/(2*tx),(c.y[0]+c.y[1])/(2*ty));
  cx=(Ax-Bx)/2;cy=(c.y[0]-c.y[1])/2;d=Math.max(MIN_DIST,D-dot(a.back,C));s=d*th;
 }else{
  const r=c.r;cx=(r[0]+r[1])/2;cy=(r[2]+r[3])/2;let w=Math.max(1e-3,(r[1]-r[0])*pad),h=Math.max(1e-3,(r[3]-r[2])*pad);
  if(w/h<aspect)w=h*aspect;else h=w/aspect;s=h/2;d=ORTHO_DIST+boxRadius(frame.box);
 }
 const ox=cx-dot(a.right,C),oy=cy-dot(a.up,C);
 return{yaw,pitch,d,s,ox,oy,zoom:1,px:ox,py:oy};
}
/* камера в мире: положение, оси, проекция (перспектива — угол и zoom; ортографическая — половины кадра) */
export function cameraPose(frame,v,aspect,o={}){
 const{fov}=viewOptions(o),a=axes(v.yaw,v.pitch),C=boxCenter(frame.box),r=boxRadius(frame.box);
 const position=[0,1,2].map(i=>C[i]+v.d*a.back[i]+v.ox*a.right[i]+v.oy*a.up[i]);
 const pose={...a,position,zoom:v.zoom,far:v.d+r+20};
 if(fov>0)return{...pose,fov,near:Math.max(.05,(v.d-r)*.5)};
 return{...pose,half:[v.s*aspect,v.s],near:.01};
}
/* точка мира — в доли половины кадра (−1…1 — в кадре) и глубину; для проверок и подписей */
export function projectPoint(frame,v,aspect,p,o={}){
 const pose=cameraPose(frame,v,aspect,o),q=[p[0]-pose.position[0],p[1]-pose.position[1],p[2]-pose.position[2]];
 const x=dot(pose.right,q),y=dot(pose.up,q),depth=-dot(pose.back,q);
 if(pose.fov){const th=Math.tan(pose.fov*D2R/2)/v.zoom;return[x/(depth*th*aspect),y/(depth*th),depth];}
 return[x*v.zoom/pose.half[0],y*v.zoom/pose.half[1],depth];
}
/* Границы для положения v: приближение (zMin — всё движение в кадре при любом повороте: шар вокруг коробки движения),
   наклон (не под пол), полуразмеры коробки по осям экрана (ex, ey — для границы сдвига) */
export function viewLimits(frame,v,aspect,o={}){
 const{fov,pad}=viewOptions(o),C=boxCenter(frame.box),h=boxHalf(frame.box),r=Math.max(1e-3,Math.hypot(...h)),a=axes(v.yaw,v.pitch),narrow=Math.min(1,aspect>0?aspect:1);
 const ex=Math.abs(a.right[0])*h[0]+Math.abs(a.right[2])*h[2],ey=Math.abs(a.up[0])*h[0]+Math.abs(a.up[1])*h[1]+Math.abs(a.up[2])*h[2];
 let fit,floor=0;
 if(fov>0){
  const th=Math.tan(fov*D2R/2);fit=v.d>r*1.01?th*narrow*Math.sqrt(v.d*v.d-r*r)/(pad*r):ZOOM_FLOOR;
  /* высота камеры ≈ C.y + d·sin(pitch) + oy */
  floor=Math.asin(clamp((FLOOR_CLEAR-C[1]-v.oy)/v.d,-1,1));
 }else fit=v.s*narrow/(pad*r);
 return{zMin:Math.min(1,Math.max(ZOOM_FLOOR,fit)),zMax:ZOOM_MAX,ex,ey,pitchMin:Math.max(PITCH_MIN*D2R,floor),pitchMax:PITCH_MAX*D2R};
}
/* граница сдвига: в кадре остаётся часть коробки движения; чем крупнее план, тем дальше можно сдвинуть (до края коробки) */
export const panReach=zoom=>Math.max(.3,1-.7/zoom);
/* Сдвиг не уводит дальше границы L, но и не прыгает назад, если уже за ней (граница сменилась поворотом); shrink < 1 —
   отдаление: допуск сжимается вместе с масштабом, кадр плавно возвращается к фигуре */
export function limitOffset(prev,next,L,shrink=1){const cap=Math.max(L,Math.abs(prev)*shrink);return Math.abs(next)<=cap?next:Math.sign(next)*cap;}
/* поворот на dyaw, наклон на dpitch (радианы); наклон — в границах (уже вышедший за них не прыгает назад) */
export function rotateView(v,dyaw,dpitch,lim){
 const lo=Math.min(lim.pitchMin,v.pitch),hi=Math.max(lim.pitchMax,v.pitch);
 return{...v,yaw:wrapAngle(v.yaw+dyaw),pitch:clamp(v.pitch+dpitch,lo,hi)};
}
/* сдвиг кадра на (nx, ny) долей половины кадра (вправо, вверх): точка под пальцем идёт за пальцем */
export function panView(v,nx,ny,aspect,lim){
 const k=panReach(v.zoom),hw=v.s*aspect/v.zoom,hh=v.s/v.zoom;
 return{...v,ox:limitOffset(v.ox,v.ox-nx*hw,Math.max(lim.ex*k,Math.abs(v.px))),oy:limitOffset(v.oy,v.oy-ny*hh,Math.max(lim.ey*k,Math.abs(v.py)))};
}
/* приближение в factor раз к точке (nx, ny) кадра: она остаётся под курсором (точно — в плоскости C) */
export function zoomView(v,factor,nx,ny,aspect,lim){
 const z=clamp(v.zoom*factor,Math.min(lim.zMin,v.zoom),Math.max(lim.zMax,v.zoom));
 if(Math.abs(z-v.zoom)<1e-9)return v;
 const q=1/v.zoom-1/z,k=panReach(z),shrink=Math.min(1,z/v.zoom);
 return{...v,zoom:z,ox:limitOffset(v.ox,v.ox+nx*v.s*aspect*q,Math.max(lim.ex*k,Math.abs(v.px)),shrink),oy:limitOffset(v.oy,v.oy+ny*v.s*q,Math.max(lim.ey*k,Math.abs(v.py)),shrink)};
}
/* плавный переход a → b, u — доля времени 0…1 (ускорение и замедление): поворот — коротким путём, приближение — по логарифму */
export const ease=u=>u<.5?4*u*u*u:1-Math.pow(2-2*u,3)/2;
export function blendView(a,b,u){
 if(u>=1)return b;if(u<=0)return a;
 const e=ease(u),l=(x,y)=>x+(y-x)*e;
 return{yaw:wrapAngle(a.yaw+wrapAngle(b.yaw-a.yaw)*e),pitch:l(a.pitch,b.pitch),d:l(a.d,b.d),s:l(a.s,b.s),ox:l(a.ox,b.ox),oy:l(a.oy,b.oy),
  zoom:Math.exp(l(Math.log(a.zoom),Math.log(b.zoom))),px:b.px,py:b.py};
}
/* тот же ракурс (углы), тот же вид целиком */
export const sameAngles=(a,b,eps=1e-4)=>Math.abs(wrapAngle(a.yaw-b.yaw))<eps&&Math.abs(a.pitch-b.pitch)<eps;
export const sameView=(a,b,eps=1e-6)=>sameAngles(a,b,eps)&&['d','s','ox','oy','zoom'].every(k=>Math.abs(a[k]-b[k])<eps);
/* перетаскивание на px точек — угол поворота (полоборота на ширину сцены, но не быстрее, чем на 320 точек) */
export const dragAngle=(px,size)=>px*Math.PI/Math.max(320,size||0);
