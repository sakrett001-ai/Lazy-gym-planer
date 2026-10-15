/* ---------- Проигрыватель движений: карточки и увеличенный разбор ---------- */
let figs = [], rafId = 0, io = null;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionPrefs = (() => {try {return Object.assign({speed:.5,joints:true,trace:false,vectors:false,muscles:true,view:'anatomy'},JSON.parse(localStorage.getItem('podhod.motion.v2') || '{}'));}catch(e){return {speed:.5,joints:true,trace:false,vectors:false,muscles:true,view:'anatomy'};}})();
/* с 4.29.0 векторы движения по умолчанию выключены (мешали разглядывать технику); сохранённое «включено» прежних версий
   было значением по умолчанию — выключаем один раз, дальше выбор человека запоминается как раньше */
if (motionPrefs.vectorsV !== 2) { motionPrefs.vectors = false; motionPrefs.vectorsV = 2; try { localStorage.setItem('podhod.motion.v2', JSON.stringify(motionPrefs)); } catch (e) {} }
if (![.25,.5,1].includes(+motionPrefs.speed)) motionPrefs.speed = .5;
if(typeof motionPrefs.muscles!=='boolean')motionPrefs.muscles=true;
if(typeof motionPrefs.stress!=='boolean')motionPrefs.stress=true;
/* с 4.30.0 основной вид разбора — «Анатомия» (кости и мышцы в почти невидимом силуэте); прежние флажки «Скелет» и
   «Анатомия мышц» заменены выбором вида — один раз ставим анатомию, дальше выбор человека запоминается */
if (motionPrefs.viewV !== 1) { motionPrefs.view = 'anatomy'; motionPrefs.viewV = 1; delete motionPrefs.skeleton; delete motionPrefs.anatomy; try { localStorage.setItem('podhod.motion.v2', JSON.stringify(motionPrefs)); } catch (e) {} }
let detailMotion = null, detailReturn = null, lastMotionNow = null;
function saveMotionPrefs() {try {localStorage.setItem('podhod.motion.v2',JSON.stringify(motionPrefs));}catch(e){}}
function motionDurations(it) {
  const a = it.ex.anim;
  if (a.timing) return a.timing.map(x=>x*1000);
  if (a.hold) return [3000,0,3000,0];
  if (a.period || it.ex.kind || it.ex.g === 'cardio') {const p = a.period || 3200;return [p*.45,p*.05,p*.45,p*.05];}
  const parsed = String(it.rx.tempo || '3-0-1-0').split('-').map(x=>x==='X'?.6:Number(x));
  const q = parsed.length===4 && parsed.every(Number.isFinite) ? parsed : [3,0,1,0];
  return (a.eccFirst ? q : [q[2],q[3],q[0],q[1]]).map(x=>Math.max(0,x)*1000);
}
function motionFrame(F, clock=F.clock) {
  const d = F.durations, total = d.reduce((a,b)=>a+b,0) || 4000;
  let x = ((clock%total)+total)%total, index = 0;
  while (index<3 && x>=d[index]) {x-=d[index];index++;}
  const q = d[index] ? Math.min(1,x/d[index]) : 0;
  const eased = .5-.5*Math.cos(Math.PI*q);
  let t = index===0 ? eased : index===1 ? 1 : index===2 ? 1-eased : 0;
  if (F.it.ex.anim.hold) t=0;
  /* замкнутый цикл (педали, бег, «велосипед»): фаза идёт по кругу без возврата назад */
  if (F.it.ex.anim.loop) {const p=((clock%total)+total)%total/total;t=p;index=p<.5?0:2;}
  /* статодинамика: только рабочая часть амплитуды, без выпрямления и без провала */
  const part=F.it.rx&&F.it.rx.partial;if(part&&!F.it.ex.anim.loop&&!F.it.ex.anim.hold)t=part[0]+(part[1]-part[0])*t;
  const a = F.it.ex.anim;
  let labels = a.eccFirst ? ['Опускание','Нижняя точка','Подъём','Верхняя точка'] : ['Рабочая фаза','Конечная точка','Возврат','Исходное положение'];
  if (F.it.ex.id === 'kbswing') labels=['Мах вперёд','Верхняя точка','Замах назад','Исходное положение'];
  if (F.it.ex.id === 'deadlift') labels=['Подъём','Верхняя точка','Опускание','Исходное положение'];
  return {t,index,label:a.hold?'Удержание':labels[index],cue:a.hold?a.cues[0]:a.cues[(index<2)!==!!a.eccFirst?0:1],progress:((clock%total)+total)%total/total,total};
}
/* Часы рисунка карточки — по сетке ≈30 кадров в секунду, целое число кадров на повторение: каждый круг проходит те же
   фазы, и готовые кадры берутся из памяти (FIGURE_FRAMES, 07-rigs-core.js). Кадр отстаёт от точного времени
   не больше чем на полкадра (≤17 мс); сами часы идут без округления. */
const CARD_GRID_MS=1000/30;
function cardClock(F){
  const total=F.durations.reduce((a,b)=>a+b,0)||4000,n=Math.max(1,Math.round(total/CARD_GRID_MS)),step=total/n;
  return (((Math.round(F.clock/step))%n)+n)%n*step;
}
function paintMotion(F, detailed=false) {
  const m = motionFrame(F, detailed ? F.clock : cardClock(F)); F.f.at(m.t,m);if(F.extra)F.extra.at(m.t,m);
  if (!detailed) {
    const cap = F.btn.closest('.motion-tile').querySelector('.motion-caption');
    if (cap && cap.textContent!==m.label) cap.textContent=m.label;
    return;
  }
  $('#mv-phase').textContent=m.label; $('#mv-cue').textContent=m.cue;
  $('#mv-progress').value=String(Math.round(m.progress*1000));
  $('#mv-progress').setAttribute('aria-valuetext',`${m.label}, ${Math.round(m.progress*100)}% повторения`);
  $('#mv-play').textContent=F.paused?'Воспроизвести':'Пауза';
  $('#mv-play').setAttribute('aria-label',F.paused?'Воспроизвести движение':'Приостановить движение');
  $('#mv-play').setAttribute('aria-pressed',String(!F.paused));
  $('#mv-position').textContent=`${Math.round(m.progress*100)}% повторения`;
  paintMusclePanel('mv',F,m);paintStressPanel('mv',F,m);
}
function configureMusclePanel(prefix,it){
 const profile=motionProfile(it.ex.anim),toggle=$('#'+prefix+'-muscle-toggle'),panel=$('#'+prefix+'-muscle-panel');
 toggle.checked=!!profile&&!!motionPrefs.muscles;toggle.disabled=!profile;
 $('#'+prefix+'-muscle-availability').hidden=!!profile;
 panel.hidden=!profile||!motionPrefs.muscles;
 if(!profile){$('#'+prefix+'-muscle-list').replaceChildren();return;}
 const rows=[];
 for(const[id,m]of Object.entries(profile.muscles)){
  rows.push(`<li data-muscle-row="${id}"><span class="muscle-swatch" aria-hidden="true"></span><span class="muscle-row-copy"><strong>${esc(MUSCLE_NAMES[id])}</strong><span>${MUSCLE_ROLES[m.role]}</span></span><span class="muscle-level"></span></li>`);
  for(const[key,r]of Object.entries(profile.regions||{}).filter(([,r])=>r.parent===id&&r.id!==id)){
   if(key===id)continue;
   rows.push(`<li class="muscle-region-row" data-muscle-row="${key}" data-deep="${!r.visible}"><span class="muscle-swatch" aria-hidden="true"></span><span class="muscle-row-copy"><span>${esc(r.label)}</span><small>${r.profileBasis==='shared-group'?'Общий профиль группы':'Учебный региональный акцент'}</small></span><span class="muscle-level"></span></li>`);
  }
 }
 $('#'+prefix+'-muscle-list').innerHTML=rows.join('');
 const region=$('#'+prefix+'-region');region.innerHTML='<option value="all">Все области</option>'+Object.entries(profile.regions||{}).filter(([,r])=>r.visible).map(([id,r])=>`<option value="${id}">${esc(r.label)}</option>`).join('');
 const saved=motionPrefs.regions?.[it.ex.id]||'all';region.value=profile.regions?.[saved]?.visible?saved:'all';
 const F=prefix==='mv'?detailMotion:workout?.motion;for(const f of [F?.f,F?.extra].filter(Boolean))f.setRegion?.(region.value);
}
function paintMusclePanel(prefix,F,m){
 const panel=$('#'+prefix+'-muscle-panel');if(panel.hidden)return;
 const state=muscleFrame(F.it.ex.anim,m.t,m.index);if(!state)return;
 const note=$('#'+prefix+'-muscle-note');if(note.textContent!==state.note)note.textContent=state.note;
 for(const row of panel.querySelectorAll('[data-muscle-row]')){
  const v=state.values[row.dataset.muscleRow],level=row.querySelector('.muscle-level'),text=row.dataset.deep==='true'?'Глубже':MUSCLE_BANDS[muscleBand(v)];
  row.querySelector('.muscle-swatch').style.backgroundColor=muscleColor(v);
  if(level.textContent!==text)level.textContent=text;
 }
}
/* ---------- нагрузка на суставы: панель с подсказками и красные отрезки шкалы повторения ---------- */
function stressTrack(F){
 const ex=F.it.ex;if(!jointStress(ex).rules.length)return '';
 const N=160,total=F.durations.reduce((a,b)=>a+b,0)||4000,on=[];
 for(let i=0;i<=N;i++){const m=motionFrame({...F,clock:i/N*total*.9999});on.push(jointStressAt(ex,m.t,m.index).length>0);}
 if(!on.some(Boolean))return '';
 const stops=[],pct=i=>(i/N*100).toFixed(2)+'%';let start=0;
 for(let i=1;i<=N+1;i++)if(i>N||on[i]!==on[start]){stops.push(`${on[start]?'var(--hot)':'var(--line)'} ${pct(start)} ${pct(Math.min(i,N))}`);start=i;}
 return `linear-gradient(90deg,${stops.join(',')})`;
}
function configureStressPanel(prefix,F){
 const panel=$('#'+prefix+'-stress-panel');if(!panel||!F)return;
 const rules=jointStress(F.it.ex).rules,toggle=$('#'+prefix+'-stress-toggle'),track=$('#'+prefix+'-stress-track');
 if(toggle){toggle.checked=!!motionPrefs.stress;toggle.disabled=!rules.length;}
 /* без пиковых нагрузок переключатель серый — подпись объясняет почему */
 const none=$('#'+prefix+'-stress-none');if(none)none.hidden=!!rules.length;
 panel.hidden=!rules.length||!motionPrefs.stress;
 $('#'+prefix+'-stress-list').innerHTML=rules.map(r=>`<li data-stress-row="${r.id}"><span class="stress-dot" aria-hidden="true"></span><span><b>${esc(r.zone)}.</b> ${esc(r.what)} <em>${esc(r.tip)}</em></span></li>`).join('');
 if(track){const g=motionPrefs.stress?stressTrack(F):'';track.hidden=!g;track.style.background=g;}
}
function paintStressPanel(prefix,F,m){
 const panel=$('#'+prefix+'-stress-panel');if(!panel||panel.hidden)return;
 const now=new Set(jointStressAt(F.it.ex,m.t,m.index).map(x=>x.rule.id));
 for(const row of panel.querySelectorAll('[data-stress-row]'))row.classList.toggle('on',now.has(row.dataset.stressRow));
}
function changeStressPreference(show){
 motionPrefs.stress=!!show;saveMotionPrefs();
 for(const F of [...figs,detailMotion,workout?.motion].filter(Boolean))for(const f of [F.f,F.extra].filter(Boolean))f.setStress?.(motionPrefs.stress);
 for(const line of document.querySelectorAll('.c-joints'))line.hidden=!motionPrefs.stress;
 if(detailMotion){configureStressPanel('mv',detailMotion);paintMotion(detailMotion,true);}
 if(workout?.motion){configureStressPanel('wv',workout.motion);paintWorkoutMotion();}
}
function changeMusclePreference(show){
 motionPrefs.muscles=!!show;saveMotionPrefs();
 for(const F of [...figs,detailMotion,workout?.motion].filter(Boolean)){
  for(const f of [F.f,F.extra].filter(Boolean))f.setMuscles?.(motionPrefs.muscles);
  const note=F.btn?.closest('.motion-tile').querySelector('.muscle-tile-note');if(note)note.hidden=!motionPrefs.muscles;
 }
 if(detailMotion){configureMusclePanel('mv',detailMotion.it);paintMotion(detailMotion,true);const note=$('#mv-figure-note'),text=figureNote(figureView(),detailMotion);if(!note.hidden&&!$('#mv-figure').hasAttribute('aria-busy')&&text)note.textContent=text;}
 if(workout?.motion){configureMusclePanel('wv',workout.motion.it);paintWorkoutMotion();}
}
function scheduleMotionLoop() {
  cancelAnimationFrame(rafId); lastMotionNow=null;
  const loop = now => {
    const dt = lastMotionNow===null ? 0 : Math.min(80,now-lastMotionNow); lastMotionNow=now;
    if (!document.hidden) {
      /* кости и мышцы считаются заново в каждом кадре (≈8 мс на компьютере, на телефоне втрое дольше): «Анатомия» и
         «Скелет» рисуются через кадр, как карточки, — часы идут каждый кадр, движение не замедляется */
      if (detailMotion) {if (!detailMotion.paused) {detailMotion.clock+=dt*Number(motionPrefs.speed);detailMotion.since=(detailMotion.since||0)+dt;
        if(figureView()==='mannequin'||detailMotion.since>=CARD_FRAME_MS){detailMotion.since=0;paintMotion(detailMotion,true);}}}
      else if(gallery.on){/* витрина атласа закрывает план: карточки за ней не анимируются */}
      else if(workout && $('#workout-view').open){const F=workout.motion;if(F && !F.paused && !$('#wv-active').hidden){F.clock+=dt;paintWorkoutMotion();}}
      else for (const F of figs) if (F.f && F.vis && !F.paused && F.active!==false) {
        /* карточки и атлас — 30 кадров в секунду: часы идут каждый кадр, рисунок — через кадр */
        F.clock+=dt;F.since=(F.since||0)+dt;
        if(F.since>=CARD_FRAME_MS){F.since=0;paintMotion(F);}
      }
    }
    rafId=requestAnimationFrame(loop);
  };
  rafId=requestAnimationFrame(loop);
}
/* Карточки плана. Рисунок строится, когда карточка подходит к экрану; двигаются только те, на которые смотрят:
   на телефоне — одна (самая видимая или та, где только что нажали «Пуск»), на широком экране — две,
   и ещё та, что под мышью или в фокусе. Остальные стоят в текущей фазе; пауза пользователя не трогается. */
const CARD_FRAME_MS=30, CARD_NEAR='400px 0px';
let ioSeen=null;
function activeCardCount(){return window.innerWidth>=900?2:1;}
function pickActiveCards(){
  const cards=figs.filter(F=>F.card&&F.f);
  const mid=window.innerHeight/2,dist=F=>{const r=F.btn.getBoundingClientRect();return Math.abs(r.top+r.height/2-mid);};
  /* порядок: под мышью или в фокусе, потом последняя нажатая «Пуск» (пока видна хотя бы наполовину),
     потом самая видимая и ближе к середине экрана */
  const pick=F=>F.seen>=.4?F.pick||0:0;
  const order=cards.filter(F=>!F.paused&&(F.seen>0||F.hover)).sort((a,b)=>(b.hover|0)-(a.hover|0)||pick(b)-pick(a)||Math.round(b.seen*5)-Math.round(a.seen*5)||dist(a)-dist(b));
  const on=new Set(order.slice(0,activeCardCount()+(order[0]?.hover?1:0)));
  let k=0;for(const F of figs)if(F.card){const was=F.active;F.active=on.has(F);if(F.active&&!was)F.since=CARD_FRAME_MS/2*(k++%2);}
}
function buildCardFigure(F){
  if(F.f||F.failed)return;
  try {
    /* начатую заранее рамку досчитать, а не начинать заново */
    if(F.job){F.job.step(41);F.job=null;}
    F.f=buildFigure(F.it.ex.anim,{primary:F.it.ex.pri,has:F.it.has,ratio:1,t:0,label:F.it.name,muscles:motionPrefs.muscles,frameCache:true});
    F.btn.prepend(F.f.svg);paintMotion(F);
  } catch(e) {F.failed=true;console.error('Демонстрация',F.it.ex.id,e);}
}
/* Рамки ещё не построенных карточек досчитываются заранее, по два положения за раз: в простое, а если простоя
   нет (идёт анимация на слабом телефоне) — не реже чем раз в четверть секунды. Тогда при прокрутке карточка
   строится сразу, без долгой паузы. */
let framePrefetchGen=0;
function prefetchCardFrames(){
  const gen=++framePrefetchGen,queue=figs.filter(F=>F.card);let F=null;
  const idle=window.requestIdleCallback?cb=>requestIdleCallback(cb,{timeout:200}):cb=>setTimeout(()=>{const end=performance.now()+8;cb({timeRemaining:()=>Math.max(0,end-performance.now())});},40);
  const work=deadline=>{
    if(gen!==framePrefetchGen)return;
    do {
      if(!F||!F.job){
        F=queue.shift();if(!F)return;
        if(F.f||F.failed){F=null;continue;}
        try{F.job=figureFrameJob(F.it.ex.anim,{has:F.it.has,ratio:1});}catch(e){F.job=null;}
        if(!F.job||F.job.done){F.job=null;continue;}
      }
      /* без простоя (сработал таймаут) — кусок побольше: шесть положений ≈ 3 мс на компьютере */
      if(F.job.step(deadline.didTimeout?6:2))F.job=null;
    } while(deadline.timeRemaining()>3);
    idle(work);
  };
  idle(work);
}
let mountedKit=null;
function mountFigures() {
  figs=[];
  /* инвентарь места сменился: готовые кадры карточек прежнего набора больше не понадобятся */
  const kit=S.place+':'+(S.equip||[]).slice().sort().join(',');if(mountedKit!==null&&kit!==mountedKit)figureFramesReset();mountedKit=kit;
  const flat=plan.blocks.flatMap(b=>b.items);
  document.querySelectorAll('[data-fig]').forEach(btn=>{
    const it=flat[+btn.dataset.fig];if(!it)return;
    const F={btn,it,f:null,card:true,vis:false,seen:0,active:false,paused:reduceMotion,clock:0,durations:motionDurations(it)};
    figs.push(F);
    const tile=btn.closest('.motion-tile');
    if(motionProfile(it.ex.anim)){const note=document.createElement('p');note.className='muscle-tile-note';note.textContent='Цвет — учебная схема';note.hidden=!motionPrefs.muscles;tile.appendChild(note);}
    const pause=tile.querySelector('[data-motion-pause]');
    if(pause){pause.textContent=F.paused?'Пуск':'Пауза';pause.setAttribute('aria-pressed',String(!F.paused));pause.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${it.name}`);}
    const hover=on=>e=>{if(e.pointerType&&e.pointerType!=='mouse')return;F.hover=on;pickActiveCards();};
    tile.addEventListener('pointerenter',hover(true));tile.addEventListener('pointerleave',hover(false));
    btn.addEventListener('focus',()=>{F.hover=true;pickActiveCards();});btn.addEventListener('blur',()=>{F.hover=false;pickActiveCards();});
  });
  if ('IntersectionObserver' in window) {
    const byBtn=new Map(figs.map(F=>[F.btn,F]));
    io=new IntersectionObserver(es=>{for(const e of es){const F=byBtn.get(e.target);if(!F)continue;F.vis=e.isIntersecting;if(F.vis)buildCardFigure(F);}pickActiveCards();},{rootMargin:CARD_NEAR});
    ioSeen=new IntersectionObserver(es=>{for(const e of es){const F=byBtn.get(e.target);if(F)F.seen=e.isIntersecting?e.intersectionRatio:0;}pickActiveCards();},{threshold:[0,.2,.4,.6,.8,1]});
    for(const F of figs){io.observe(F.btn);ioSeen.observe(F.btn);}
    prefetchCardFrames();
  } else for(const F of figs){F.vis=true;F.active=true;buildCardFigure(F);}
  scheduleMotionLoop();
}
function stopFigures() {
  if(workout && $('#workout-view').open)closeWorkout();
  if(detailMotion) closeMotion();
  cancelAnimationFrame(rafId);framePrefetchGen++;if(io)io.disconnect();if(ioSeen)ioSeen.disconnect();io=ioSeen=null;for(const F of figs)disposeMotion(F);figs=[];
}
function previewItem(id) {
  const ex=EXI[id];let E=effEquip(S.equip);
  if(!available(ex,E)) E=effEquip(EQUIP.map(e=>e.id));
  return {ex,name:exName(ex,E),rx:prescribe(ex,S.mode==='program'?WEEKS[S.week-1]:null,E),has:propHas(ex,E),eqLine:equipLine(ex,E)};
}
function selectMotion(it, clock=0) {
  disposeMotion(detailMotion);
  detailMotion={it,f:null,clock,paused:true,durations:motionDurations(it)};
  $('#mv-title').textContent=it.name;
  $('#mv-exercise').value=it.ex.id;
  $('#mv-tools').innerHTML=`${favButton(it.ex.id,true)}<button type="button" class="btn-ghost" data-cp-add="${it.ex.id}">+ В свой план</button><p class="cp-msg" hidden><span></span> <button type="button" class="link" data-cp-go="1">Открыть план →</button></p>`;
  $('#mv-view').textContent=it.ex.viewNote||(it.ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
  $('#mv-speed').value=String(motionPrefs.speed);$('#mv-joints').checked=!!motionPrefs.joints;$('#mv-trace').checked=!!motionPrefs.trace;$('#mv-vectors').checked=!!motionPrefs.vectors;
  $('#mv-tempo').textContent=it.ex.anim.hold?'Удерживайте положение и дышите ровно.':it.ex.anim.timing||it.ex.g==='cardio'||it.ex.kind?'Ритм показан схематично. Замедление помогает разобрать движение.':it.rx.static?`Статодинамика: темп ${it.rx.tempo} без пауз, показана рабочая часть амплитуды — без выпрямления до конца и без расслабления внизу.`:`Темп задания: ${it.rx.tempo}. Скорость просмотра не меняет задание.`;
  const level={};it.ex.pri.forEach(m=>level[m]=1);it.ex.sec.forEach(m=>{if(!level[m])level[m]=.38;});
  $('#mv-muscles').innerHTML=muscleMapSvg(level,{labels:true,aria:'Основные и вспомогательные мышцы'});
  $('#mv-primary').textContent=it.ex.pri.map(m=>MUSCLE_NAMES[m]).join(', ');
  $('#mv-secondary').textContent=it.ex.sec.length?it.ex.sec.map(m=>MUSCLE_NAMES[m]).join(', '):'—';
  $('#mv-steps').innerHTML=it.ex.tech.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-errors').innerHTML=it.ex.err.map(x=>`<li>${esc(x)}</li>`).join('');
  $('#mv-breath').textContent=it.ex.breath;
  $('#mv-note').textContent=it.ex.note||'';
  const links=[...(SOURCES_BY_EX[it.ex.id]||[]),...(motionProfile(it.ex.anim)?.sources||[])];
  const src=links.filter((v,i)=>links.findIndex(x=>x[1]===v[1])===i).map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`);
  $('#mv-sources').innerHTML=src.length?`<p class="mv-muscle-label">Подробнее о технике</p>${src.join('')}`:'';
  mountDetailCameras();
}
/* Вид фигуры в подробном разборе (с 4.30.0 по умолчанию — «Анатомия»):
   · «Анатомия» — кости и мышцы объёмом (толщина — по объёму на МРТ) внутри почти невидимого силуэта кожи; цвет мышц —
     как у областей манекена: с «Мышцами по фазам» — участие в текущей фазе, без них — основные и вспомогательные;
   · «Скелет» — только кости в том же силуэте;
   · «Манекен» — прежний манекен с подсветкой мышечных областей.
   Кости (≈220 КБ) и мышцы (≈38 КБ) грузятся один раз — заранее, в простое после первого экрана (setupMotionViewer), или
   при первом открытии разбора; пока они грузятся, показан манекен. Без объёмной графики доступен только манекен. */
const FIGURE_VIEWS=['anatomy','skeleton','mannequin'];
const figureView=()=>FIGURE_VIEWS.includes(motionPrefs.view)?motionPrefs.view:'anatomy';
function anatomyLevel(ex){const level={};ex.pri.forEach(m=>level[m]=1);ex.sec.forEach(m=>{if(!level[m])level[m]=.38;});return level;}
function figureNote(view,F){
  if(view==='skeleton')return 'Кости — по открытым моделям MyoSim, источники — в «О демонстрациях». Мышцы в этом виде скрыты.';
  if(view!=='anatomy')return '';
  return 'Кости и мышцы — по открытым моделям, толщина мышц — по МРТ; источники — в «О демонстрациях». '+(motionPrefs.muscles&&F&&motionProfile(F.it.ex.anim)
    ?'Цвет мышцы — её участие в этой фазе: чем оранжевее, тем сильнее.':'Цветом — мышцы упражнения: основные ярче, вспомогательные бледнее.');
}
function applyFigureView(F=detailMotion){
  const group=$('#mv-figure'),note=$('#mv-figure-note');if(!group)return;
  const list=F?[F.f,F.extra].filter(Boolean):[],able=list.length>0&&list.every(f=>typeof f.setLayers==='function');
  const view=able?figureView():'mannequin';
  for(const b of group.querySelectorAll('[data-mv-figure]')){const off=!able&&b.dataset.mvFigure!=='mannequin';b.disabled=off;b.title=off?'Нужна объёмная графика (WebGL)':'';b.setAttribute('aria-pressed',String(b.dataset.mvFigure===view));}
  const say=text=>{note.textContent=text;note.hidden=!text;};
  if(view==='mannequin'){for(const f of list)f.setLayers?.(null,null);say('');return;}
  const put=()=>{for(const f of list)f.setLayers(Skeleton.data,view==='anatomy'?{skeleton:Skeleton.data,muscles:Muscles.data,level:anatomyLevel(F.it.ex)}:null);say(figureNote(view,F));};
  const need=view==='anatomy'?[Skeleton,Muscles]:[Skeleton];
  if(need.every(x=>x.data)){put();return;}
  for(const f of list)f.setLayers(null,null);
  group.setAttribute('aria-busy','true');say(view==='anatomy'?'Загружаем кости и мышцы…':'Загружаем кости…');
  Promise.all(need.map(x=>x.load())).then(()=>{
    group.removeAttribute('aria-busy');if(detailMotion!==F||figureView()!==view)return;put();
  },()=>{
    /* выбор не сбрасывается: при следующем открытии разбора загрузка повторится */
    group.removeAttribute('aria-busy');if(detailMotion!==F||figureView()!==view)return;
    for(const b of group.querySelectorAll('[data-mv-figure]'))b.setAttribute('aria-pressed',String(b.dataset.mvFigure==='mannequin'));
    say('Не удалось загрузить кости и мышцы — показан манекен. Проверьте связь и выберите вид ещё раз.');
  });
}
function openMotion(idx) {
  const F=figs.find(f=>+f.btn.dataset.fig===Number(idx));
  openMotionItem(F?F.it:previewItem(EX[0].id),F?F.clock:0);
}
function openMotionItem(it,clock=0){
  detailReturn=document.activeElement;
  showDetail();selectMotion(it,clock);
  const d=$('#motion-view');if(!d.open)d.showModal();
  document.documentElement.classList.add('motion-open');
  $('#mv-close').focus();scheduleMotionLoop();
}
function closeMotion() {
  const d=$('#motion-view');disposeMotion(detailMotion);detailMotion=null;closeGallery();
  if(d&&d.open)d.close();
  document.documentElement.classList.remove('motion-open');
  if(detailReturn&&detailReturn.isConnected)detailReturn.focus();
  detailReturn=null;
}
function setupMotionViewer() {
  window.addEventListener('resize',()=>pickActiveCards(),{passive:true});
  $('#mv-exercise').innerHTML=GROUPS.map(g=>`<optgroup label="${esc(g.name)}">${EX.filter(ex=>ex.g===g.id).map(ex=>`<option value="${ex.id}">${esc(ex.name)}</option>`).join('')}</optgroup>`).join('');

  document.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.motionPause!==undefined){const F=figs.find(f=>+f.btn.dataset.fig===+t.dataset.motionPause);if(F){F.paused=!F.paused;if(F.card){F.pick=performance.now();pickActiveCards();}t.textContent=F.paused?'Пуск':'Пауза';t.setAttribute('aria-pressed',String(!F.paused));t.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${F.it.name}`);}return;}
    if(t.id==='motion-atlas'){openGallery();return;}
    if(t.id==='mv-close'){closeMotion();return;}
    if(!detailMotion)return;
    if(t.dataset.mvFigure){if(t.dataset.mvFigure!==figureView()||t.getAttribute('aria-pressed')!=='true'){motionPrefs.view=t.dataset.mvFigure;saveMotionPrefs();applyFigureView();}return;}
    if(t.id==='mv-play'){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}
    if(t.dataset.mvStep){const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Math.max(0,Math.min(m.total-1,(m.progress+Number(t.dataset.mvStep))*m.total));paintMotion(detailMotion,true);}
    if(t.dataset.mvPose){const d=detailMotion.durations;detailMotion.paused=true;detailMotion.clock=({start:0,middle:d[0]*.5,end:d[0]+d[1]*.5,return:d[0]+d[1]+d[2]*.5})[t.dataset.mvPose];paintMotion(detailMotion,true);}
    /* соседние упражнения — в том же порядке, что в списке (по группам мышц) */
    if(t.dataset.mvNav){const ids=[...$('#mv-exercise').options].map(o=>o.value),i=ids.indexOf(detailMotion.it.ex.id);selectMotion(previewItem(ids[(i+Number(t.dataset.mvNav)+ids.length)%ids.length]));}
  });
  $('#mv-progress').addEventListener('input',e=>{if(!detailMotion)return;const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Number(e.target.value)/1000*(m.total-1);paintMotion(detailMotion,true);});
  $('#mv-speed').addEventListener('change',e=>{motionPrefs.speed=Number(e.target.value);saveMotionPrefs();});
  $('#mv-exercise').addEventListener('change',e=>selectMotion(previewItem(e.target.value)));
  $('#mv-joints').addEventListener('change',e=>{motionPrefs.joints=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean)){f.svg.classList.toggle('show-joints',e.target.checked);f.setJoints?.(e.target.checked);}saveMotionPrefs();});
  $('#mv-vectors').addEventListener('change',e=>{motionPrefs.vectors=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setVectors(e.target.checked);saveMotionPrefs();});
  $('#mv-trace').addEventListener('change',e=>{motionPrefs.trace=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setTrace(e.target.checked);saveMotionPrefs();});
  $('#mv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  $('#wv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  for(const prefix of ['mv','wv'])$('#'+prefix+'-stress-toggle').addEventListener('change',e=>changeStressPreference(e.target.checked));
  for(const prefix of ['mv','wv'])$('#'+prefix+'-region').addEventListener('change',e=>selectMuscleRegion(prefix,e.target.value));
  $('#motion-view').addEventListener('cancel',e=>{e.preventDefault();closeMotion();});
  $('#motion-view').addEventListener('close',()=>{disposeMotion(detailMotion);detailMotion=null;closeGallery();document.documentElement.classList.remove('motion-open');});
  /* объёмная графика грузится после первого экрана (build.js): если разбор или тренировка открыты раньше, показывается
     плоская схема, а с приходом объёма та же фаза перерисовывается в нём */
  window.addEventListener('gym-volume',()=>{
    if(detailMotion&&!gallery.on)mountDetailCameras();if(workout?.motion&&$('#workout-view').open)mountWorkoutCameras();
    /* сетка головы (≈55 мс на компьютере) одна на все упражнения: готовится в простое, а не при первом открытии разбора */
    const idle=window.requestIdleCallback||(f=>setTimeout(f,2000));idle(()=>{try{Mannequin.headMesh();}catch(e){}},{timeout:6000});
    /* кости и мышцы для вида «Анатомия» — тоже заранее: первое открытие разбора сразу показывает анатомию */
    if(figureView()!=='mannequin')idle(()=>{Skeleton.load().catch(()=>{});if(figureView()==='anatomy')Muscles.load().catch(()=>{});},{timeout:8000});
  });
  $('#motion-view').addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();if(detailMotion){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}}});
}


/* ---------- таймер отдыха в плане ----------
   Время — по меткам (restView в 12a-set-timers.js). После нуля таймер считает вверх «+0:25» и повторяет сигнал (если
   выбран «настойчивый»), пока не отмечен следующий подход или не нажато «Готово»; уходит через 5 с после последнего сигнала. */
const T = {left:0, total:0, id:0, end:0, from:0, label:''};
function startRest(sec, label) {
  if (!sec) return;
  T.total = sec; T.left = sec; T.from = Date.now(); T.end = T.from + sec * 1000; T.label = label || 'Отдых';
  $('#t-label').textContent = T.label;
  $('#timer').hidden = false; $('#timer').classList.remove('over');
  RestAlarm.unlock(); RestAlarm.arm(T.end, {from:T.from}); RestAlarm.paintButton($('#t-sound'));
  clearInterval(T.id); clearTimeout(T.id); tick(); T.id = setInterval(tick, 250);
}
function tick() {
  const now = Date.now(), v = restView(T.end, now);
  T.left = v.left;
  $('#t-time').textContent = v.text;
  $('#t-bar').style.width = (T.total ? (1 - v.left / T.total) * 100 : 100) + '%';
  RestAlarm.poll(now);
  $('#timer').classList.toggle('over', v.over); $('#t-minus').disabled = v.over;
  const label = v.over ? 'Пора к следующему подходу · сверх отдыха' : T.label;
  if ($('#t-label').textContent !== label) $('#t-label').textContent = label;
  if (v.over && now >= Math.max(T.end, RestAlarm.lastAt()) + 5000) stopRest();
}
function adjustRest(d) {
  if ($('#timer').hidden) return;
  const now = Date.now(), end = restAdjust(T.end, now, d);
  if (end === T.end) return;
  T.total = Math.max(1, T.total + Math.round((end - T.end) / 1000)); T.end = end;
  RestAlarm.arm(T.end, {from:T.from}); clearTimeout(T.id); clearInterval(T.id); tick(); T.id = setInterval(tick, 250);
}
function stopRest() { clearInterval(T.id); clearTimeout(T.id); RestAlarm.cancel(); $('#timer').hidden = true; $('#t-minus').disabled = false; }

/* ---------- текст для копирования ---------- */
function blocksText(p) {
  const lines = [];
  for (const b of p.blocks) {
    if (b.kind === 'pair') lines.push(b.items.length > 1 ? `Суперсет ${b.letter}: ${b.sets} ${plural(b.sets, 'круг', 'круга', 'кругов')}, отдых ${fmtRest(b.rest)} после пары` : `${b.letter}:`);
    if (b.kind === 'circuit') lines.push(`Круг × ${b.rounds}: переход ${fmtRest(b.rest)}, отдых после круга ${fmtRest(b.roundRest)}`);
    for (const it of b.items) {
      const r = it.rx;
      const side = r.uni ? ' на сторону' : '';
      if (r.static) { const kgS = r.kgPlan && loadType(it.ex) !== 'none' ? `, ${planKgText(r.kgPlan)} кг` : ''; lines.push(`${it.label}. ${it.name} — ${r.series} × 3 × ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}, темп ${r.tempo} без расслабления, отдых ${fmtRest(r.rest)}${r.series > 1 ? `, между сериями ${fmtRest(r.seriesRest)}` : ''}${kgS}`); if (r.coachNote) lines.push(`   Заметка: ${r.coachNote.replace(/\n+/g, ' ')}`); continue; }
      const kg = r.kgPlan && loadType(it.ex) !== 'none' ? `, ${planKgText(r.kgPlan)} кг` : '';
      lines.push(r.circ ? `${it.label}. ${it.name} — ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}${kg}` : `${it.label}. ${it.name} — ${r.sets} × ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}${kg}${b.kind === 'list' ? `, отдых ${fmtRest(r.rest)}` : ''}`);
      if (r.coachNote) lines.push(`   Заметка: ${r.coachNote.replace(/\n+/g, ' ')}`);
    }
  }
  return lines;
}
function planText() {
  const G = GOALS[S.goal];
  if (S.mode === 'program' && prog) {
    const out = [`${SPLITS[prog.split].name}, ${S.days} ${plural(S.days, 'тренировка', 'тренировки', 'тренировок')} в неделю — ${G.name.toLowerCase()}`,
      `Неделя ${S.week} из 4: ${prog.week.name.toLowerCase()}. ${prog.week.note}`];
    for (const d of prog.days) {
      out.push('', `${WD_FULL[d.wd]} — ${d.name}${d.plan.items ? `, ≈${d.plan.minutes} мин` : ''}`);
      if (d.plan.items) out.push(...blocksText(d.plan)); else out.push('нет упражнений с выбранным оборудованием');
    }
    return out.join('\n');
  }
  return [`${titleFor()} — ${G.name.toLowerCase()}, ${FORMATS[S.format].name.toLowerCase()}, ≈${plan.minutes} мин`, ''].concat(blocksText(plan)).join('\n');
}

/* ---------- события ---------- */
/* место тренировок: название и источник программы */
document.addEventListener('change', e => {
  if (e.target.id === 'place-name') { const v = e.target.value.trim().slice(0, 24); if (v) placeOf().name = v; saveSettings(); renderSetup(); return; }
  if (e.target.id === 'place-adapt') { S.adapt = e.target.value || null; ensurePlaces(S); return regen(); }
});
const swapKey = () => S.mode === 'program' ? 'd' + S.day : 's';
function regen(resetSwaps = true) { if (resetSwaps) swaps = S.swaps = {}; done = {}; saveSettings(); renderSetup(); renderPlan(); }
document.addEventListener('click', e => {
  const t = e.target.closest('button, summary');
  if (!t) return;
  if (t.dataset.set) {
    const k = t.dataset.set, prev = S.mode; S[k] = t.dataset.v;
    if (k === 'mode') { S.day = 0; switchModeSettings(prev); } else storePlanSetting(k);
    return regen();
  }
  if (t.dataset.days) { S.days = +t.dataset.days; S.split = DEFAULT_SPLIT[S.days]; S.day = 0; return regen(); }
  if (t.dataset.split) { S.split = t.dataset.split; S.day = 0; return regen(); }
  if (t.dataset.week) { S.week = +t.dataset.week; done = {}; saveSettings(); renderPlan(); return; }
  if (t.dataset.day !== undefined) {
    S.day = +t.dataset.day; done = {}; saveSettings(); renderPlan();
    const dh = $('.day-head'); if (dh) dh.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'});
    return;
  }
  if (t.id === 'count-minus') { S.count = Math.max(3, S.count - 1); return regen(); }
  if (t.id === 'count-plus') { S.count = Math.min(10, S.count + 1); return regen(); }
  if (t.dataset.g) { const g = t.dataset.g; S.groups = S.groups.includes(g) ? S.groups.filter(x => x !== g) : S.groups.concat(g); S.groups.sort((a, b) => GROUPS.findIndex(x => x.id === a) - GROUPS.findIndex(x => x.id === b)); return regen(); }
  if (t.dataset.gp) { S.groups = GROUP_PRESETS.find(p => p.id === t.dataset.gp).g.slice(); return regen(); }
  if (t.dataset.e) { eqOpen = true; const id = t.dataset.e; setPlaceEquip(S.equip.includes(id) ? S.equip.filter(x => x !== id) : S.equip.concat(id)); return regen(); }
  if (t.dataset.ep) { setPlaceEquip(EQUIP_PRESETS.find(p => p.id === t.dataset.ep).eq); return regen(); }
  if (t.dataset.place) { S.place = t.dataset.place; ensurePlaces(S); placeDel = false; return regen(); }
  if (t.dataset.placeAdd !== undefined) {
    const id = 'p' + Date.now().toString(36);
    S.places.push({id, name:'Место ' + (S.places.length + 1), equip:[]});
    S.place = id; ensurePlaces(S); eqOpen = true; placeDel = false; regen();
    const inp = $('#place-name'); if (inp) { inp.focus(); inp.select(); }
    return;
  }
  if (t.dataset.placeDel !== undefined) {
    if (!placeDel) { placeDel = true; return renderSetup(); }
    S.places = S.places.filter(p => p.id !== S.place); placeDel = false; ensurePlaces(S); return regen();
  }
  if (t.id === 'reroll') { S.seed = (S.seed * 48271 + 11) % 2147483647; regen(); $('#plan').scrollIntoView({behavior:reduceMotion ? 'auto' : 'smooth', block:'start'}); return; }
  if (t.id === 'copy') {
    const txt = planText(), msg = $('#copy-msg');
    const fallback = () => { msg.innerHTML = 'Скопировать автоматически не удалось. Выделите текст:<textarea readonly rows="6"></textarea>'; const ta = msg.querySelector('textarea'); ta.value = txt; ta.focus(); ta.select(); };
    try { navigator.clipboard.writeText(txt).then(() => { msg.textContent = 'Скопировано — можно вставить в заметки или мессенджер.'; }, fallback); } catch (err) { fallback(); }
    return;
  }
  if (t.dataset.swap !== undefined) {
    const slot = +t.dataset.swap;
    const cur = plan.items.find(it => it.slot === slot).ex;
    const inPlan = new Set(plan.items.map(it => it.ex.id));
    const lvlMax = S.level === 'beg' || S.goal === 'gentle' ? 2 : 3;
    const tried = new Set((swaps.__tried && swaps.__tried[swapKey() + ':' + slot]) || []);
    /* ближайшие по смыслу: то же движение и те же мышцы — первыми */
    if (S.mode === 'custom') for (const it of customOf().items) inPlan.add(it.id);
    let alts = EX.filter(ex => !inPlan.has(ex.id) && available(ex, plan.E) && ex.lvl <= lvlMax && (ex.g === cur.g || PATTERN[ex.id] === PATTERN[cur.id]) && (S.format !== 'static' || staticOk(ex)) && fitsBody(ex))
      .sort((a, b) => analogScore(cur, b) - analogScore(cur, a));
    const msgEl = t.querySelector('span');
    if (!alts.length) { msgEl.textContent = 'Замены нет'; setTimeout(() => { msgEl.textContent = 'Заменить'; }, 1800); return; }
    tried.add(cur.id);
    let next = alts.find(ex => !tried.has(ex.id));
    if (!next) { tried.clear(); tried.add(cur.id); next = alts[0]; }
    swaps.__tried = swaps.__tried || {};
    swaps.__tried[swapKey() + ':' + slot] = [...tried];
    /* в своём плане замена записывается в сам план; правка подходов и отдыха остаётся */
    if (S.mode === 'custom') { const item = customOf().items[slot]; if (item) { item.id = next.id; saveSettings(); } }
    else { const k = swapKey(); swaps[k] = swaps[k] || {}; swaps[k][slot] = next.id; }
    done = {};
    saveSettings(); renderPlan();
    const card = document.querySelector(`.card[data-slot="${slot}"]`);
    if (card) { card.classList.add('flash'); card.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'}); }
    return;
  }
  /* порядок упражнений: ↑ ↓ на карточке (в своём плане — свои кнопки, 11d-custom.js) */
  if (t.dataset.move !== undefined) {
    const slot = +t.dataset.move, d = +t.dataset.d;
    if (!movePlanItem(slot, d)) return;
    saveSettings(); renderPlan();
    const card = document.querySelector(`.card[data-slot="${slot}"]`);
    if (card) {
      card.classList.add('flash'); card.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'});
      const b = card.querySelector(`[data-move][data-d="${d}"]:not([disabled])`) || card.querySelector('[data-move]:not([disabled])'); if (b) b.focus({preventScroll:true});
    }
    return;
  }
  if (t.dataset.round !== undefined) {
    const k = +t.dataset.round, cur = done.__rounds || 0;
    done.__rounds = cur === k + 1 ? k : k + 1;
    t.parentElement.querySelectorAll('.set').forEach((b, i) => b.classList.toggle('done', i < done.__rounds));
    const b = plan.blocks[0];
    if (done.__rounds > cur && done.__rounds < b.rounds) startRest(b.roundRest, `Отдых после круга ${done.__rounds}`);
    return;
  }
  if (t.dataset.fig !== undefined) {openMotion(t.dataset.fig);return;}
  if (t.id === 'e-toggle' || t.id === 'e-toggle-top') {
    eqOpen = !eqOpen; renderSetup();
    /* свернули снизу длинного списка — вернуть взгляд к заголовку раздела */
    if (!eqOpen && t.id === 'e-toggle') { const h = $('.e-head'); if (h && h.getBoundingClientRect().top < 0) h.scrollIntoView({block:'start', behavior:reduceMotion ? 'auto' : 'smooth'}); }
    return;
  }
  if (t.id === 't-minus') return adjustRest(-15);
  if (t.id === 't-plus') return adjustRest(15);
  if (t.id === 't-skip') return stopRest();
});
