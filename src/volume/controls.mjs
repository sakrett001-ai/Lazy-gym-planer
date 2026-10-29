/* Жесты свободной камеры на сцене (камера — orbit.mjs, фигура — main.mjs). Здесь — только разбор событий:
   · мышь: перетаскивание — поворот и наклон; правая кнопка или Shift + перетаскивание — сдвиг кадра; колесо — приближение
     к точке под курсором (на границе приближения колесо листает страницу, как обычно); двойной щелчок — вернуть ракурс;
   · касание: карточка разбора листается — у сцены touch-action: pan-y (CSS). Палец, начавший движение вбок, вращает
     сцену, и раз поворот начат, тот же палец вверх-вниз наклоняет камеру; палец, начавший движение вверх-вниз, листает
     страницу. Два пальца: щипок — приближение к точке между пальцами, сдвиг — перемещение кадра. Двойное касание —
     вернуть ракурс. Пока идёт свой жест (поворот или два пальца), страница не листается (touchmove.preventDefault);
   · клавиатура (сцена фокусируема): стрелки — поворот и наклон, +/− — приближение, 0 — вернуть ракурс.
   h: start() — жест начат (переход камеры останавливается), rotate(dx, dy) и pan(dx, dy) — в точках экрана,
   zoom(factor, x, y) — x, y от левого верхнего угла сцены, true — масштаб сменился; reset(), key(действие). */
const SLOP=8,TAP_MS=300,TAP_GAP=350,TAP_DIST=30;
const KEYS={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down','+':'in','=':'in','-':'out','_':'out','0':'reset'};
export function attachOrbit(el,h){
 const touches=new Map();let mode=null,mouse=null,pinch=null,lastTap=null,lastType='';
 const box=()=>el.getBoundingClientRect();
 const pair=()=>{const[a,b]=[...touches.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,dist:Math.hypot(a.x-b.x,a.y-b.y)};};
 function down(e){
  lastType=e.pointerType;
  if(e.pointerType==='mouse'){
   if(e.button!==0&&e.button!==2)return;
   mouse={id:e.pointerId,x:e.clientX,y:e.clientY,pan:e.button===2};
   try{el.setPointerCapture(e.pointerId);}catch(x){}
   el.dataset.drag='';h.start();return;
  }
  touches.set(e.pointerId,{x:e.clientX,y:e.clientY,x0:e.clientX,y0:e.clientY,t0:e.timeStamp});
  if(touches.size===1)mode='wait';
  else if(touches.size===2&&mode!=='done'){mode='pinch';pinch=pair();h.start();}
 }
 function move(e){
  if(e.pointerType==='mouse'){
   if(!mouse||e.pointerId!==mouse.id)return;
   const dx=e.clientX-mouse.x,dy=e.clientY-mouse.y;mouse.x=e.clientX;mouse.y=e.clientY;
   if(dx||dy){if(mouse.pan||e.shiftKey)h.pan(dx,dy);else h.rotate(dx,dy);}
   return;
  }
  const t=touches.get(e.pointerId);if(!t)return;
  const px=t.x,py=t.y;t.x=e.clientX;t.y=e.clientY;
  if(mode==='wait'){
   const dx=t.x-t.x0,dy=t.y-t.y0;if(Math.hypot(dx,dy)<SLOP)return;
   /* вбок — поворот (уже пройденный путь — сразу), вверх-вниз — листание: жест отдаётся странице */
   if(Math.abs(dx)>Math.abs(dy)){mode='rotate';h.start();h.rotate(dx,dy);}else mode='scroll';
   return;
  }
  if(mode==='rotate'&&touches.size===1)h.rotate(t.x-px,t.y-py);
  else if(mode==='pinch'&&touches.size===2){
   const p=pair(),r=box();
   if(p.dist>0&&pinch.dist>0)h.zoom(p.dist/pinch.dist,p.x-r.left,p.y-r.top);
   h.pan(p.x-pinch.x,p.y-pinch.y);pinch=p;
  }
 }
 function up(e){
  if(e.pointerType==='mouse'){if(mouse&&e.pointerId===mouse.id){mouse=null;delete el.dataset.drag;}return;}
  const t=touches.get(e.pointerId);if(!t)return;touches.delete(e.pointerId);
  /* касание без движения: второе подряд рядом с первым — вернуть ракурс */
  if(e.type==='pointerup'&&mode==='wait'&&!touches.size&&e.timeStamp-t.t0<TAP_MS){
   if(lastTap&&e.timeStamp-lastTap.t<TAP_GAP&&Math.hypot(t.x-lastTap.x,t.y-lastTap.y)<TAP_DIST){lastTap=null;h.start();h.reset();}
   else lastTap={t:e.timeStamp,x:t.x,y:t.y};
  }
  /* один из двух пальцев поднят: оставшийся не вращает до нового касания */
  if(!touches.size){mode=null;pinch=null;}else if(mode==='pinch'||mode==='rotate')mode='done';
 }
 /* свой жест — страница не листается; жест, отданный странице (вверх-вниз), не трогаем */
 const guard=e=>{if(e.cancelable&&(e.touches.length>=2||mode==='rotate'||mode==='pinch'||mode==='done'))e.preventDefault();};
 function wheel(e){
  const d=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?400:1),r=box();
  /* щипок на тачпаде приходит колесом с Ctrl — страницу браузер при этом не масштабирует */
  const used=d!==0&&h.zoom(Math.exp(-d*(e.ctrlKey?.01:.0015)),e.clientX-r.left,e.clientY-r.top);
  if(used||e.ctrlKey)e.preventDefault();
 }
 const dbl=e=>{if(lastType!=='mouse')return;e.preventDefault();h.start();h.reset();};
 const menu=e=>e.preventDefault();
 function key(e){
  if(e.altKey||e.ctrlKey||e.metaKey)return;const a=KEYS[e.key];if(!a)return;
  e.preventDefault();h.key(a);
 }
 const on=[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',up],['dblclick',dbl],['contextmenu',menu],['keydown',key]];
 for(const[t,f]of on)el.addEventListener(t,f);
 el.addEventListener('touchmove',guard,{passive:false});el.addEventListener('wheel',wheel,{passive:false});
 return()=>{for(const[t,f]of on)el.removeEventListener(t,f);el.removeEventListener('touchmove',guard,{passive:false});el.removeEventListener('wheel',wheel,{passive:false});touches.clear();mouse=null;};
}
