/* Режим тренировки использует тот же журнал, что и карточки плана. */
let workout=null,workoutTimer=0,workoutReturn=null;
const WORKOUT_STORE='podhod.workout.v3';
/* Экран не гаснет, пока открыт режим тренировки (Screen Wake Lock: Chrome; Safari с 16.4; приложение с экрана «Домой» на
   iPhone — с iOS 18.4). Уходя с экрана, страница теряет блокировку — при возвращении она берётся снова. Без поддержки всё
   работает как раньше: экран гаснет по настройкам телефона. */
const ScreenAwake=(()=>{
  let want=false,lock=null,asking=false;
  const free=l=>{try{const p=l.release();if(p&&p.catch)p.catch(()=>{});}catch(e){}};
  async function take(){
    const wl=typeof navigator!=='undefined'&&navigator.wakeLock;
    if(!want||lock||asking||!wl||typeof wl.request!=='function'||document.visibilityState==='hidden')return;
    asking=true;
    try{const l=await wl.request('screen');if(!want){free(l);return;}lock=l;if(l&&l.addEventListener)l.addEventListener('release',()=>{if(lock===l)lock=null;});}
    catch(e){}finally{asking=false;}
  }
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)take();});
  return{on(){want=true;return take();},off(){want=false;const l=lock;lock=null;if(l)free(l);},state:()=>({want,held:!!lock})};
})();
/* удержания с таймером — упражнения на время, кроме кардио (беговая дорожка, прыжки — не удержание) */
const isHold=ex=>ex.kind==='time'&&ex.g!=='cardio';
function workoutQueue(p){
  const q=[];
  for(const b of p.blocks){
    if(b.kind==='list')for(const it of b.items)for(let k=0;k<it.rx.sets;k++)q.push({it,k,n:it.rx.sets,rest:restAfter(it.rx,k),phase:it.rx.static?`Статодинамика · серия ${Math.floor(k/3)+1} из ${it.rx.series}`:'Классика'});
    if(b.kind==='pair')for(let k=0;k<Math.max(b.sets,...b.items.map(it=>it.rx.sets));k++){
      const active=b.items.filter(it=>k<it.rx.sets);active.forEach((it,j)=>q.push({it,k,n:it.rx.sets,rest:j===active.length-1?b.rest:0,phase:`Суперсет ${b.letter} · круг ${k+1}`}));
    }
    if(b.kind==='circuit'){
      const rounds=Math.max(b.rounds,...b.items.map(it=>it.rounds||b.rounds));
      for(let k=0;k<rounds;k++){const active=b.items.filter(it=>k<(it.rounds||b.rounds));active.forEach((it,j)=>q.push({it,k,n:it.rounds||b.rounds,rest:j===active.length-1?b.roundRest:b.rest,phase:`Круг ${k+1} из ${rounds}`}));}
    }
  }
  return q;
}
function workoutStamp(q){return JSON.stringify([todayKey(),S.mode,S.day,S.week,S.format,S.goal,q.map(x=>[x.it.ex.id,x.k,x.n,x.rest,x.it.rx.reps])]);}
function workoutValue(step){return todaySession(step.it.ex.id,false)?.s[step.k]||null;}
function workoutFirstOpen(q,after=-1){for(let j=1;j<=q.length;j++){const i=(after+j)%q.length;if(!workoutValue(q[i]))return i;}return -1;}
function workoutDraftKey(step){return step.it.ex.id+':'+step.k;}
function saveWorkout(){
  if(!workout)return;
  try{localStorage.setItem(WORKOUT_STORE,JSON.stringify({stamp:workout.stamp,index:workout.index,started:workout.started,restUntil:workout.restUntil,restTotal:workout.restTotal,restFrom:workout.restFrom,next:workout.next,last:workout.last,drafts:workout.drafts}));}catch(e){}
}
function workoutCapture(){
  if(!workout||$('#wv-active').hidden)return;
  const step=workout.queue[workout.index];if(!step)return;
  workout.drafts[workoutDraftKey(step)]={kg:$('#wv-kg').value,reps:$('#wv-reps').value};saveWorkout();
}
function startWorkout(id){
  if(!plan?.items?.length)return;
  workoutReturn=document.activeElement;
  const queue=workoutQueue(plan),stamp=workoutStamp(queue);
  let old=null;try{old=JSON.parse(localStorage.getItem(WORKOUT_STORE)||'null');}catch(e){}
  const same=old?.stamp===stamp;
  workout={queue,stamp,index:0,started:same&&Number.isFinite(old.started)?old.started:Date.now(),drafts:same&&old.drafts&&typeof old.drafts==='object'?old.drafts:{},restUntil:0,restTotal:0,restFrom:0,next:-1,last:-1,motion:null,hold:null,restOver:null,sideNote:''};
  const first=workoutFirstOpen(queue);
  if(same){workout.index=Math.max(0,Math.min(queue.length-1,Math.trunc(old.index)||0));workout.restUntil=Number(old.restUntil)||0;workout.restTotal=Number(old.restTotal)||0;workout.restFrom=Number(old.restFrom)||0;workout.next=Number.isInteger(old.next)?old.next:-1;workout.last=Number.isInteger(old.last)?old.last:-1;}
  else workout.index=Math.max(0,first);
  if(id){const i=queue.findIndex(x=>x.it.ex.id===id&&!workoutValue(x));workout.index=i>=0?i:Math.max(0,queue.findIndex(x=>x.it.ex.id===id));workout.restUntil=0;}
  const d=$('#workout-view');if(!d.open)d.showModal();document.documentElement.classList.add('workout-open');stopRest();ScreenAwake.on();
  $('#wv-context').textContent=S.mode==='program'?`${WD_FULL[prog.days[S.day].wd]} · ${prog.days[S.day].name}`:`${GOALS[S.goal].name} · ${FORMATS[S.format].name}`;
  const its=[...new Map(queue.map(x=>[x.it.ex.id,x.it])).values()];
  $('#wv-exercise').innerHTML=its.map(it=>`<option value="${it.ex.id}">${esc(it.label+'. '+it.name)}</option>`).join('');
  if(first<0&&!id)workoutFinish();
  else if(workout.restUntil&&workout.next>=0&&workout.next<queue.length){RestAlarm.unlock();RestAlarm.arm(workout.restUntil,{from:workout.restFrom||undefined});workoutShowRest();}
  else workoutShow(workout.index);
  clearInterval(workoutTimer);workoutTimer=setInterval(workoutTick,250);workoutTick();saveWorkout();$('#wv-close').focus();scheduleMotionLoop();
}
function closeWorkout(){
  if(!workout)return;holdStop();workoutCapture();saveWorkout();disposeMotion(workout.motion);clearInterval(workoutTimer);workoutTimer=0;ScreenAwake.off();
  const d=$('#workout-view');if(d.open)d.close();document.documentElement.classList.remove('workout-open');d.classList.remove('rest-over');workout.restOver=null;
  logRefresh(null);if(workoutReturn?.isConnected)workoutReturn.focus();workoutReturn=null;
}
function workoutShow(index){
  if(!workout)return;
  workout.index=Math.max(0,Math.min(workout.queue.length-1,index));workout.restUntil=0;workout.restFrom=0;workout.next=-1;workout.sideNote='';RestAlarm.cancel();paintRestPhase(false);
  const s=workout.queue[workout.index],it=s.it,ex=it.ex,stored=workoutValue(s),lt=loadType(ex),sg=suggest(it),hold=isHold(ex);
  const prev=sg.prev?.s[s.k]||sg.prev?.s.filter(Boolean).slice(-1)[0];
  $('#wv-active').hidden=false;$('#wv-rest').hidden=true;$('#wv-finish').hidden=true;
  $('#wv-title').textContent=it.name;$('#wv-exercise').value=ex.id;
  $('#wv-set-label').textContent=`${s.phase} · подход ${s.k+1} из ${s.n}`;
  $('#wv-equipment').textContent=it.eqLine;
  $('#wv-target').textContent=it.rx.reps+(ex.kind?'':' повторов');
  $('#wv-previous').textContent=prev?`${prev[0]!=null?fmtKg(prev[0])+' кг × ':''}${prev[1]} ${ex.kind==='time'?'с':ex.kind==='dist'?'м':'повт.'}`:'Первая запись';
  $('#wv-previous-date').textContent=sg.prev?fmtDay(sg.prev.d,true):'';
  $('#wv-set-chips').innerHTML=workout.queue.map((x,i)=>x.it.ex.id===ex.id?`<button type="button" data-wv-index="${i}" class="${workoutValue(x)?'is-done ':''}${i===workout.index?'is-current':''}" aria-label="Подход ${x.k+1}${workoutValue(x)?', выполнен':''}" aria-current="${i===workout.index?'step':'false'}">${workoutValue(x)?'✓ ':''}${x.k+1}</button>`:'').join('');
  $('#wv-unilateral').hidden=!ex.uni;$('#wv-unilateral').textContent=hold?'Обе стороны — в одном подходе: левая, пауза 10 с, правая. Записывается время слабой стороны.':'Выполните обе стороны. Запишите количество повторов для одной стороны.';
  $('#wv-weight-label').hidden=lt==='none';$('#wv-weight-caption').textContent=lt==='extra'?'Доп. вес, кг':lt==='assist'?'Противовес, кг':'Вес, кг';$('#wv-rep-caption').textContent=repLabel(ex);$('#wv-reps').setAttribute('inputmode',ex.kind==='dist'?'decimal':'numeric');
  const draft=workout.drafts[workoutDraftKey(s)],today=todaySession(ex.id,false)?.s||[],last=today.slice(0,s.k).filter(Boolean).slice(-1)[0];
  const planned=planKg(it.rx,s.k);
  $('#wv-kg').value=draft?draft.kg:stored?stored[0]!=null?fmtKg(stored[0]):'':planned!=null?fmtKg(planned):last?.[0]!=null?fmtKg(last[0]):prev?.[0]!=null?fmtKg(prev[0]):'';
  $('#wv-reps').value=draft?draft.reps:stored?String(stored[1]):'';$('#wv-reps').placeholder=it.rx.reps;
  $('#wv-input-hint').textContent=hold?(lt==='extra'?'Доп. вес можно оставить пустым. ':'')+'«Стоп» запишет секунды и начнёт отдых. Секунды можно ввести и вручную.'
    :lt==='extra'?'Дополнительный вес можно оставить пустым. Введите фактический результат.':lt==='none'?'Укажите фактический результат подхода.':'Вес подставлен из последней записи, если она есть. Уточните его и введите результат.';
  $('#wv-error').textContent='';$('#wv-kg').removeAttribute('aria-invalid');$('#wv-reps').removeAttribute('aria-invalid');
  $('#wv-done').textContent=stored?'Сохранить изменения':'Подход выполнен';$('#wv-save-status').textContent=stored?'Этот подход уже записан.':'Запись появится в общем журнале.';
  $('#wv-suggestion').textContent=sg.text;
  holdSetup(s,sg);
  const cue=MOTION_FOCUS[ex.id];$('#wv-setup').textContent=cue?.setup||ex.tech[0];$('#wv-control').textContent=cue?.control||ex.tech[1];$('#wv-breath').textContent=ex.breath;
  disposeMotion(workout.motion);workout.motion={it,f:null,clock:0,paused:reduceMotion,durations:motionDurations(it)};$('#wv-angle').textContent=ex.viewNote||(ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
  $('#wv-motion').textContent=reduceMotion?'Воспроизвести':'Пауза';$('#wv-motion').setAttribute('aria-pressed',String(!reduceMotion));mountWorkoutCameras();
  $('#wv-prev').disabled=workout.index===0;$('#wv-next').disabled=workout.index===workout.queue.length-1;
  saveWorkout();workoutTick();
}
function paintWorkoutMotion(){if(!workout?.motion)return;const F=workout.motion,m=motionFrame(F);F.f.at(m.t,m);if($('#wv-cue').textContent!==m.cue)$('#wv-cue').textContent=m.cue;paintMusclePanel('wv',F,m);paintStressPanel('wv',F,m);}
function strictWorkoutNumber(value){const s=String(value).trim().replace(',','.');return /^\d+(\.\d+)?$/.test(s)?Number(s):null;}
function commitWorkout(e){
  if(e)e.preventDefault();if(!workout||$('#wv-active').hidden)return;
  const step=workout.queue[workout.index],ex=step.it.ex,lt=loadType(ex),kgRaw=$('#wv-kg').value.trim(),reps=strictWorkoutNumber($('#wv-reps').value),kg=lt==='none'?null:kgRaw?strictWorkoutNumber(kgRaw):null;
  let bad=null,msg='';
  if(lt!=='none'&&kgRaw&&kg===null){bad=$('#wv-kg');msg='Введите вес числом, например 12,5.';}
  else if(lt==='kg'&&(kg===null||kg<=0)){bad=$('#wv-kg');msg='Укажите фактический вес снаряда.';}
  else if(reps===null||reps<=0||(!ex.kind&&!Number.isInteger(reps))){bad=$('#wv-reps');msg=ex.kind?'Укажите фактический результат числом больше нуля.':'Укажите целое количество выполненных повторов.';}
  if(bad){$('#wv-error').textContent=msg;bad.setAttribute('aria-invalid','true');bad.focus();return;}
  /* отдых, уже записанный у этого подхода (третье поле), при исправлении сохраняется */
  const already=!!workoutValue(step),session=todaySession(ex.id,true),rest=already?restField(session.s[step.k][2]):null;
  while(session.s.length<step.k)session.s.push(null);
  session.s[step.k]=[kg,Math.round(reps*10)/10];if(rest)session.s[step.k].push(rest);session.target=Math.max(session.target||0,step.n);if(step.it.rx.static)session.fmt='static';delete workout.drafts[workoutDraftKey(step)];
  logTouch(ex.id);logRefresh([ex.id]);workout.last=workout.index;
  if(already){workoutShow(workout.index);$('#wv-save-status').textContent='Изменения сохранены.';return;}
  const next=workoutFirstOpen(workout.queue,workout.index);
  if(next<0){workoutFinish();return;}
  if(step.rest>0){const now=Date.now();workout.next=next;workout.restTotal=step.rest;workout.restFrom=now;workout.restUntil=now+step.rest*1000;RestAlarm.unlock();RestAlarm.arm(workout.restUntil,{from:now});workoutShowRest();}
  else workoutShow(next);
  saveWorkout();
}
/* фактический отдых — от записи подхода до «Перейти к подходу» — третьим полем в запись подхода, после которого отдыхали */
function workoutRestTaken(){
  const sec=restActual(workout.restFrom,Date.now()),step=workout.queue[workout.last];workout.restFrom=0;
  if(!sec||!step)return;
  const v=todaySession(step.it.ex.id,false)?.s[step.k];
  if(Array.isArray(v)){v[2]=sec;logTouch(step.it.ex.id);}
}
function workoutShowRest(){
  holdStop();$('#wv-active').hidden=true;$('#wv-rest').hidden=false;$('#wv-finish').hidden=true;RestAlarm.paintButton($('#wv-sound'));RestAlarm.paintPrefs();
  const next=workout.queue[workout.next];
  $('#wv-next-name').textContent=next.it.name;$('#wv-next-detail').textContent=`${next.phase} · подход ${next.k+1} из ${next.n} · ${next.it.rx.reps}${next.it.ex.kind?'':' повторов'}`;
  $('#wv-rest-note').textContent=workout.sideNote||'Результат сохранён. Переходите дальше, когда будете готовы.';workout.sideNote='';workout.restOver=null;workoutTick();$('#wv-continue').focus();
}
/* отдых закончился: экран меняет цвет (видно с расстояния, телефон на скамье), время считает вверх «+0:25» */
function paintRestPhase(over){
  if(!workout)return;workout.restOver=over;
  $('#workout-view').classList.toggle('rest-over',over);$('#wv-rest-heading').textContent=over?'Пора к подходу':'Отдых';
  $('#wv-rest-over').textContent=over?'сверх отдыха':'';$('#wv-rest-minus').disabled=over;
}
function workoutFinish(){
  workout.restUntil=0;workout.restFrom=0;workout.next=-1;RestAlarm.cancel();holdStop();paintRestPhase(false);$('#wv-active').hidden=true;$('#wv-rest').hidden=true;$('#wv-finish').hidden=false;
  const n=workout.queue.filter(workoutValue).length,its=[...new Map(workout.queue.map(s=>[s.it.ex.id,s.it])).values()];
  $('#wv-finish-text').textContent=`Выполнено ${n} ${plural(n,'подход','подхода','подходов')} в ${its.length} ${plural(its.length,'упражнении','упражнениях','упражнениях')}.`;
  $('#wv-summary').innerHTML=its.map(it=>`<p><span>${esc(it.name)}</span><strong>${workout.queue.filter(s=>s.it.ex.id===it.ex.id&&workoutValue(s)).length} ✓</strong></p>`).join('');saveWorkout();workoutTick();
}
function workoutTick(){
  if(!workout)return;
  const now=Date.now(),n=workout.queue.filter(workoutValue).length;$('#wv-progress').max=workout.queue.length;$('#wv-progress').value=n;$('#wv-progress-label').textContent=`${n} из ${workout.queue.length} подходов`;
  const elapsed=Math.max(0,Math.floor((now-workout.started)/60000));$('#wv-elapsed').textContent=elapsed?`${elapsed} мин с начала`:'';
  if(!$('#wv-rest').hidden){
    const v=restView(workout.restUntil,now);RestAlarm.poll(now);
    if($('#wv-rest-time').textContent!==v.text)$('#wv-rest-time').textContent=v.text;
    if(v.over!==workout.restOver)paintRestPhase(v.over);
  }
  if(workout.hold&&!$('#wv-active').hidden)paintHold(now);
}

/* ---------- таймер удержания (планка, боковая планка, «стульчик», вис, «лодочка») ----------
   «Старт» → 3-2-1 → отсчёт до цели со звуком на нуле → счёт вверх «+7 с»; «Стоп» пишет секунды в поле и отмечает подход,
   как «Подход выполнен». Боковая планка — левая, пауза 10 с, правая в одном подходе; записывается слабая сторона.
   Фазы и времена — по меткам нажатий (holdState в 12a-set-timers.js). */
function holdSetup(s,sg){
  const it=s.it,ex=it.ex;RestAlarm.hush();
  if(!isHold(ex)){workout.hold=null;$('#wv-hold').hidden=true;$('#wv-done').classList.remove('wv-secondary');$('#wv-done').disabled=false;return;}
  const sug=sg.reps[s.k]??sg.reps[sg.reps.length-1],T=holdTarget(it.rx.reps,sug);
  workout.hold={target:T,sides:ex.uni?2:1,h:null,last:null};
  $('#wv-hold').hidden=false;$('#wv-done').classList.add('wv-secondary');RestAlarm.paintButton($('#wv-hold-sound'));
  $('#wv-hold-goal').textContent=T.from==='log'?`Цель ${holdText(T.sec)} — по журналу (план ${it.rx.reps})`:`Цель ${holdText(T.sec)} — нижняя граница плана ${it.rx.reps}`;
  paintHold();
}
function paintHold(now=Date.now()){
  const H=workout?.hold;if(!H)return;
  const st=H.h?holdState(H.h,now):null,two=H.sides===2,sideName=i=>i?'Правая':'Левая';
  let mode,time,btn,cls='';
  if(!st){mode=two?'Левая, затем правая':'Таймер удержания';time=holdText(H.target.sec);btn='Старт';}
  else if(st.phase==='lead'){mode='Приготовьтесь';time=String(st.count);btn='Отмена';cls='is-lead';}
  else if(st.phase==='switch'){mode='Смена стороны';time=String(st.count);btn='Правая — сейчас';cls='is-lead';}
  else if(st.phase==='hold'){mode=(two?sideName(st.side)+' · ':'')+(st.mode==='to'?(two?'до цели':'До цели'):(two?'сверх цели':'Сверх цели'));time=st.mode==='to'?holdText(st.left):holdText(st.over,true);btn='Стоп';cls=st.mode==='over'?'is-over':'is-run';}
  else{mode='Записано';time=holdText(st.value);btn='Старт заново';}
  let sides='';
  if(two&&st){
    const r=st.results;
    sides=st.phase==='done'?`Левая ${holdText(r[0])}, правая ${holdText(r[1])} — записывается слабая сторона: ${holdText(st.value)}`
      :st.phase==='switch'?`Левая ${holdText(r[0])} · правая — через ${st.count} с`:r.length?`Левая ${holdText(r[0])} · правая идёт`:'';
  }
  const box=$('#wv-hold');box.className='wv-hold'+(cls?' '+cls:'');
  if($('#wv-hold-mode').textContent!==mode)$('#wv-hold-mode').textContent=mode;
  /* единица «с» — мельче числа и не моноширинная, иначе «30  с» расползается */
  const tEl=$('#wv-hold-time');if(tEl.textContent!==time){const i=time.lastIndexOf(' ');if(i>0){const u=document.createElement('span');u.className='wv-hold-unit';u.textContent=time.slice(i);tEl.replaceChildren(time.slice(0,i),u);}else tEl.textContent=time;}
  if($('#wv-hold-sides').textContent!==sides){$('#wv-hold-sides').textContent=sides;$('#wv-hold-sides').hidden=!sides;}
  const go=$('#wv-hold-go');if(go.textContent!==btn)go.textContent=btn;
  const running=!!st&&st.phase!=='done';go.classList.toggle('is-stop',running);$('#wv-hold-reset').hidden=!running||st.phase==='lead';$('#wv-done').disabled=running;
  /* вибрация (Android) на «пошли» и на достижении цели — по смене фазы */
  const key=st?st.phase+(st.mode||'')+st.side:'idle';
  if(H.last!==key){if(st?.phase==='hold'&&(st.mode==='over'?H.last===`holdto${st.side}`:/^(lead|switch)/.test(H.last||'')))RestAlarm.buzz(st.mode==='over'?'end':'go');H.last=key;}
}
function holdGo(){
  const H=workout?.hold;if(!H)return;
  const now=Date.now();
  if(!H.h||holdState(H.h,now).phase==='done'){RestAlarm.unlock();H.h=holdNew(now,H.target.sec,H.sides);H.last=null;RestAlarm.cue(holdCues(H.h));$('#wv-error').textContent='';paintHold(now);return;}
  const r=holdPress(H.h,now);
  if(r.action==='cancel'){H.h=null;RestAlarm.hush();}
  else if(r.action==='done'){H.h=r.h;RestAlarm.hush();holdCommit();return;}
  else if(r.h){H.h=r.h;RestAlarm.cue(holdCues(H.h));}
  paintHold(now);
}
/* «Стоп» последней стороны: секунды — в поле подхода, дальше — как «Подход выполнен» */
function holdCommit(){
  const H=workout.hold,st=holdState(H.h,Date.now());paintHold();
  if(!(st.value>0)){H.h=null;paintHold();$('#wv-error').textContent='Таймер остановлен в первую секунду — подход не записан.';return;}
  $('#wv-reps').value=String(st.value);$('#wv-reps').removeAttribute('aria-invalid');
  workout.sideNote=H.sides===2?`Записано ${holdText(st.value)} — время слабой стороны (левая ${holdText(st.results[0])}, правая ${holdText(st.results[1])}).`:'';
  commitWorkout();
}
function holdStop(){if(workout?.hold){workout.hold.h=null;workout.hold.last=null;}RestAlarm.hush();}
function setupWorkout(){
  $('#wv-form').addEventListener('submit',commitWorkout);
  for(const id of ['wv-kg','wv-reps'])$('#'+id).addEventListener('input',()=>{workoutCapture();$('#wv-error').textContent='';$('#'+id).removeAttribute('aria-invalid');});
  $('#wv-exercise').addEventListener('change',e=>{workoutCapture();const i=workout.queue.findIndex(s=>s.it.ex.id===e.target.value&&!workoutValue(s));workoutShow(i>=0?i:workout.queue.findIndex(s=>s.it.ex.id===e.target.value));});
  $('#workout-view').addEventListener('cancel',e=>{e.preventDefault();closeWorkout();});
  /* вернулись на экран: таймеры страницы в фоне редки — обновить отдых и удержание сразу */
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&workout&&$('#workout-view').open)workoutTick();});
  document.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.id==='start-workout'||t.dataset.workout!==undefined){startWorkout(t.dataset.workout);return;}
    if(!workout||!$('#workout-view').open)return;
    if(t.id==='wv-close'||t.id==='wv-finish-close'){closeWorkout();return;}
    if(t.id==='wv-prev'||t.id==='wv-next'){workoutCapture();workoutShow(workout.index+(t.id==='wv-next'?1:-1));return;}
    if(t.dataset.wvIndex!==undefined){workoutCapture();workoutShow(Number(t.dataset.wvIndex));return;}
    if(t.id==='wv-review'){workoutShow(0);return;}
    if(t.id==='wv-undo'){workoutShow(workout.last);return;}
    if(t.id==='wv-continue'){workoutRestTaken();workoutShow(workout.next);return;}
    if(t.id==='wv-hold-go'){holdGo();return;}
    if(t.id==='wv-hold-reset'){holdStop();paintHold();return;}
    if(t.dataset.wvRest){const end=restAdjust(workout.restUntil,Date.now(),Number(t.dataset.wvRest));if(end!==workout.restUntil){workout.restUntil=end;RestAlarm.arm(end,{from:workout.restFrom||undefined});saveWorkout();workoutTick();}return;}
    if(t.id==='wv-motion'){const m=workout.motion;m.paused=!m.paused;t.textContent=m.paused?'Воспроизвести':'Пауза';t.setAttribute('aria-pressed',String(!m.paused));return;}
    if(t.id==='wv-technique'){workoutCapture();if(workout.motion)openMotionItem(workout.motion.it,workout.motion.clock);}
  });
}

function motionCamera(ex){
 const cameras=ex.anim.catalogCameras||ex.anim.cameras||[],saved=motionPrefs.views?.[ex.id];
 return cameras.includes(saved)?saved:ex.anim.catalogRig?'above':ex.anim.camera||ex.anim.view;
}
function cameraButtons(ex,current){
 return (ex.anim.catalogCameras||ex.anim.cameras||[]).map(key=>`<button type="button" data-motion-camera="${key}" aria-pressed="${current===key}">${CAMERA3[key].label}</button>`).join('');
}
function rememberCamera(ex,key){
 if(!(ex.anim.catalogCameras||ex.anim.cameras)?.includes(key))return false;
 motionPrefs.views=Object.assign({},motionPrefs.views,{[ex.id]:key});saveMotionPrefs();return true;
}
function mountDetailCameras(){
 if(!detailMotion)return;
 const F=detailMotion,ex=F.it.ex,a=ex.anim,key=motionCamera(ex),cameras=a.catalogCameras||a.cameras||[];
 disposeMotion(F);
 const m=motionFrame(F),make=camera=>{
  const f=createMotionFigure(a,{primary:ex.pri,has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera,muscles:motionPrefs.muscles});
  f.svg.classList.toggle('show-joints',!!motionPrefs.joints);f.setTrace(!!motionPrefs.trace);f.setVectors(!!motionPrefs.vectors);return f;
 };
 F.f=make(key);$('#mv-stage').replaceChildren(F.f.svg);
 $('#mv-camera-controls').hidden=cameras.length<2;
 $('#mv-cameras').innerHTML=cameraButtons(ex,key);
 $('#mv-view').textContent=CAMERA3[key]?.label||ex.viewNote||(a.view==='front'?'Вид спереди':'Вид сбоку');
 $('#mv-camera-hint').textContent=a.cameraHints?.[key]||'';
 $('#mv-camera-hint').hidden=!a.cameraHints;
 const pair=cameras.length>1&&!!motionPrefs.dual;
 $('#mv-dual').checked=!!motionPrefs.dual;$('#mv-second').hidden=!pair;$('#mv-projections').classList.toggle('is-dual',pair);
 F.extra=null;
 if(pair){
  const other=pairCamera(a,key);F.extra=make(other);$('#mv-second-stage').replaceChildren(F.extra.svg);
  $('#mv-second-label').textContent=CAMERA3[other].label;$('#mv-second-hint').textContent=a.cameraHints?.[other]||'';
 }else $('#mv-second-stage').replaceChildren();
 configureMusclePanel('mv',F.it);configureStressPanel('mv',F);applyFigureView(F);paintMotion(F,true);
}
/* второй ракурс пары: из профиля мышц упражнения, иначе первый другой */
function pairCamera(a,key){const cameras=a.catalogCameras||a.cameras||[],preferred=motionProfile(a)?.pair;return preferred!==key&&cameras.includes(preferred)?preferred:cameras.find(c=>c!==key);}
/* Смена ракурса в разборе: объёмная фигура переключает камеру сама — без новой сцены и пересчёта позы (≈0,2 с на
   компьютере, втрое дольше на слабом телефоне). Плоская запасная схема и смена числа видов пересобирают окно. */
function switchDetailCamera(){
 const F=detailMotion,a=F.it.ex.anim,key=motionCamera(F.it.ex),pair=(a.catalogCameras||a.cameras||[]).length>1&&!!motionPrefs.dual,other=pair?pairCamera(a,key):null;
 if(!F.f?.setCamera||(pair?!F.extra?.setCamera:!!F.extra)||!F.f.setCamera(key)||(pair&&!F.extra.setCamera(other)))return mountDetailCameras();
 pressCamera('#mv-cameras',key);
 $('#mv-view').textContent=CAMERA3[key]?.label||F.it.ex.viewNote||(a.view==='front'?'Вид спереди':'Вид сбоку');
 $('#mv-camera-hint').textContent=a.cameraHints?.[key]||'';
 if(pair){$('#mv-second-label').textContent=CAMERA3[other].label;$('#mv-second-hint').textContent=a.cameraHints?.[other]||'';}
}
function switchWorkoutCamera(){
 const F=workout.motion,ex=F.it.ex,key=motionCamera(ex);
 if(!F.f?.setCamera||!F.f.setCamera(key))return mountWorkoutCameras();
 pressCamera('#wv-cameras',key);$('#wv-angle').textContent=CAMERA3[key]?.label||(ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
}
/* кнопки ракурсов не перерисовываются — фокус остаётся на нажатой */
function pressCamera(sel,key){for(const b of $(sel).querySelectorAll('[data-motion-camera]'))b.setAttribute('aria-pressed',String(b.dataset.motionCamera===key));}
function mountWorkoutCameras(){
 if(!workout?.motion)return;
 const F=workout.motion,ex=F.it.ex,key=motionCamera(ex),m=motionFrame(F);
 disposeMotion(F);F.f=createMotionFigure(ex.anim,{has:F.it.has,ratio:1.15,t:m.t,label:F.it.name,camera:key,muscles:motionPrefs.muscles});F.f.setVectors(!!motionPrefs.vectors);
 $('#wv-stage').replaceChildren(F.f.svg);$('#wv-cameras').innerHTML=cameraButtons(ex,key);$('#wv-cameras').hidden=!(ex.anim.catalogCameras||ex.anim.cameras);
 $('#wv-angle').textContent=CAMERA3[key]?.label||(ex.anim.view==='front'?'Вид спереди':'Вид сбоку');configureMusclePanel('wv',F.it);configureStressPanel('wv',F);paintWorkoutMotion();
}
function setupMotionCameras(){
 $('#mv-cameras').addEventListener('click',e=>{const b=e.target.closest('[data-motion-camera]');if(b&&detailMotion&&rememberCamera(detailMotion.it.ex,b.dataset.motionCamera))switchDetailCamera();});
 $('#wv-cameras').addEventListener('click',e=>{const b=e.target.closest('[data-motion-camera]');if(b&&workout?.motion&&rememberCamera(workout.motion.it.ex,b.dataset.motionCamera))switchWorkoutCamera();});
 $('#mv-dual').addEventListener('change',e=>{motionPrefs.dual=e.target.checked;saveMotionPrefs();mountDetailCameras();});
}
