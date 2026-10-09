/* ---------- Проигрыватель движений: карточки и увеличенный разбор ---------- */
let figs = [], rafId = 0, io = null;
const reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const motionPrefs = (() => {try {return Object.assign({speed:.5,joints:true,trace:false,vectors:true,muscles:true},JSON.parse(localStorage.getItem('podhod.motion.v2') || '{}'));}catch(e){return {speed:.5,joints:true,trace:false,vectors:true,muscles:true};}})();
if (![.25,.5,1].includes(+motionPrefs.speed)) motionPrefs.speed = .5;
if(typeof motionPrefs.muscles!=='boolean')motionPrefs.muscles=true;
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
function motionFrame(F) {
  const d = F.durations, total = d.reduce((a,b)=>a+b,0) || 4000;
  let x = ((F.clock%total)+total)%total, index = 0;
  while (index<3 && x>=d[index]) {x-=d[index];index++;}
  const q = d[index] ? Math.min(1,x/d[index]) : 0;
  const eased = .5-.5*Math.cos(Math.PI*q);
  let t = index===0 ? eased : index===1 ? 1 : index===2 ? 1-eased : 0;
  if (F.it.ex.anim.hold) t=0;
  /* замкнутый цикл (педали, бег, «велосипед»): фаза идёт по кругу без возврата назад */
  if (F.it.ex.anim.loop) {const p=((F.clock%total)+total)%total/total;t=p;index=p<.5?0:2;}
  const a = F.it.ex.anim;
  let labels = a.eccFirst ? ['Опускание','Нижняя точка','Подъём','Верхняя точка'] : ['Рабочая фаза','Конечная точка','Возврат','Исходное положение'];
  if (F.it.ex.id === 'kbswing') labels=['Мах вперёд','Верхняя точка','Замах назад','Исходное положение'];
  if (F.it.ex.id === 'deadlift') labels=['Подъём','Верхняя точка','Опускание','Исходное положение'];
  return {t,index,label:a.hold?'Удержание':labels[index],cue:a.hold?a.cues[0]:a.cues[(index<2)!==!!a.eccFirst?0:1],progress:((F.clock%total)+total)%total/total,total};
}
function paintMotion(F, detailed=false) {
  const m = motionFrame(F); F.f.at(m.t,m);if(F.extra)F.extra.at(m.t,m);
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
  paintMusclePanel('mv',F,m);
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
function changeMusclePreference(show){
 motionPrefs.muscles=!!show;saveMotionPrefs();
 for(const F of [...figs,detailMotion,workout?.motion].filter(Boolean)){
  for(const f of [F.f,F.extra].filter(Boolean))f.setMuscles?.(motionPrefs.muscles);
  const note=F.btn?.closest('.motion-tile').querySelector('.muscle-tile-note');if(note)note.hidden=!motionPrefs.muscles;
 }
 if(detailMotion){configureMusclePanel('mv',detailMotion.it);paintMotion(detailMotion,true);}
 if(workout?.motion){configureMusclePanel('wv',workout.motion.it);paintWorkoutMotion();}
}
function scheduleMotionLoop() {
  cancelAnimationFrame(rafId); lastMotionNow=null;
  const loop = now => {
    const dt = lastMotionNow===null ? 0 : Math.min(80,now-lastMotionNow); lastMotionNow=now;
    if (!document.hidden) {
      if (detailMotion) {if (!detailMotion.paused) {detailMotion.clock+=dt*Number(motionPrefs.speed);paintMotion(detailMotion,true);}}
      else if(workout && $('#workout-view').open){const F=workout.motion;if(F && !F.paused && !$('#wv-active').hidden){F.clock+=dt;paintWorkoutMotion();}}
      else for (const F of figs) if (F.vis && !F.paused) {F.clock+=dt;paintMotion(F);}
    }
    rafId=requestAnimationFrame(loop);
  };
  rafId=requestAnimationFrame(loop);
}
function mountFigures() {
  figs=[];
  const flat=plan.blocks.flatMap(b=>b.items);
  document.querySelectorAll('[data-fig]').forEach(btn=>{
    const it=flat[+btn.dataset.fig];
    try {
      const f=buildFigure(it.ex.anim,{primary:it.ex.pri,has:it.has,ratio:1,t:0,label:it.name,muscles:motionPrefs.muscles});
      btn.prepend(f.svg);
      const F={btn,it,f,vis:true,paused:reduceMotion,clock:0,durations:motionDurations(it)};
      figs.push(F);paintMotion(F);
      if(motionProfile(it.ex.anim)){const note=document.createElement('p');note.className='muscle-tile-note';note.textContent='Цвет — учебная схема';note.hidden=!motionPrefs.muscles;btn.closest('.motion-tile').appendChild(note);}
      const pause=btn.closest('.motion-tile').querySelector('[data-motion-pause]');
      if(pause){pause.textContent=F.paused?'Пуск':'Пауза';pause.setAttribute('aria-pressed',String(!F.paused));pause.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${it.name}`);}
    } catch(e) {console.error('Демонстрация',it.ex.id,e);}
  });
  if ('IntersectionObserver' in window) {
    io=new IntersectionObserver(es=>{for(const e of es){const F=figs.find(x=>x.btn===e.target);if(F)F.vis=e.isIntersecting;}},{rootMargin:'80px'});
    figs.forEach(F=>io.observe(F.btn));
  }
  scheduleMotionLoop();
}
function stopFigures() {
  if(workout && $('#workout-view').open)closeWorkout();
  if(detailMotion) closeMotion();
  cancelAnimationFrame(rafId);if(io)io.disconnect();io=null;figs=[];
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
  $('#mv-view').textContent=it.ex.viewNote||(it.ex.anim.view==='front'?'Вид спереди':'Вид сбоку');
  $('#mv-speed').value=String(motionPrefs.speed);$('#mv-joints').checked=!!motionPrefs.joints;$('#mv-trace').checked=!!motionPrefs.trace;$('#mv-vectors').checked=!!motionPrefs.vectors;
  $('#mv-tempo').textContent=it.ex.anim.hold?'Удерживайте положение и дышите ровно.':it.ex.anim.timing||it.ex.g==='cardio'||it.ex.kind?'Ритм показан схематично. Замедление помогает разобрать движение.':`Темп задания: ${it.rx.tempo}. Скорость просмотра не меняет задание.`;
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
function openMotion(idx) {
  const F=figs.find(f=>+f.btn.dataset.fig===Number(idx));
  openMotionItem(F?F.it:previewItem(EX[0].id),F?F.clock:0);
}
function openMotionItem(it,clock=0){
  detailReturn=document.activeElement;
  selectMotion(it,clock);
  const d=$('#motion-view');if(!d.open)d.showModal();
  document.documentElement.classList.add('motion-open');
  $('#mv-close').focus();scheduleMotionLoop();
}
function closeMotion() {
  const d=$('#motion-view');disposeMotion(detailMotion);detailMotion=null;
  if(d&&d.open)d.close();
  document.documentElement.classList.remove('motion-open');
  if(detailReturn&&detailReturn.isConnected)detailReturn.focus();
  detailReturn=null;
}
function setupMotionViewer() {
  $('#mv-exercise').innerHTML=GROUPS.map(g=>`<optgroup label="${esc(g.name)}">${EX.filter(ex=>ex.g===g.id).map(ex=>`<option value="${ex.id}">${esc(ex.name)}</option>`).join('')}</optgroup>`).join('');

  document.addEventListener('click',e=>{
    const t=e.target.closest('button');if(!t)return;
    if(t.dataset.motionPause!==undefined){const F=figs.find(f=>+f.btn.dataset.fig===+t.dataset.motionPause);if(F){F.paused=!F.paused;t.textContent=F.paused?'Пуск':'Пауза';t.setAttribute('aria-pressed',String(!F.paused));t.setAttribute('aria-label',`${F.paused?'Воспроизвести':'Приостановить'} демонстрацию: ${F.it.name}`);}return;}
    if(t.id==='motion-atlas'){openMotion(figs[0]?figs[0].btn.dataset.fig:-1);return;}
    if(t.id==='mv-close'){closeMotion();return;}
    if(!detailMotion)return;
    if(t.id==='mv-play'){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}
    if(t.dataset.mvStep){const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Math.max(0,Math.min(m.total-1,(m.progress+Number(t.dataset.mvStep))*m.total));paintMotion(detailMotion,true);}
    if(t.dataset.mvPose){const d=detailMotion.durations;detailMotion.paused=true;detailMotion.clock=({start:0,middle:d[0]*.5,end:d[0]+d[1]*.5,return:d[0]+d[1]+d[2]*.5})[t.dataset.mvPose];paintMotion(detailMotion,true);}
    if(t.dataset.mvNav){const i=EX.findIndex(x=>x.id===detailMotion.it.ex.id);selectMotion(previewItem(EX[(i+Number(t.dataset.mvNav)+EX.length)%EX.length].id));}
  });
  $('#mv-progress').addEventListener('input',e=>{if(!detailMotion)return;const m=motionFrame(detailMotion);detailMotion.paused=true;detailMotion.clock=Number(e.target.value)/1000*(m.total-1);paintMotion(detailMotion,true);});
  $('#mv-speed').addEventListener('change',e=>{motionPrefs.speed=Number(e.target.value);saveMotionPrefs();});
  $('#mv-exercise').addEventListener('change',e=>selectMotion(previewItem(e.target.value)));
  $('#mv-joints').addEventListener('change',e=>{motionPrefs.joints=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean)){f.svg.classList.toggle('show-joints',e.target.checked);f.setJoints?.(e.target.checked);}saveMotionPrefs();});
  $('#mv-vectors').addEventListener('change',e=>{motionPrefs.vectors=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setVectors(e.target.checked);saveMotionPrefs();});
  $('#mv-trace').addEventListener('change',e=>{motionPrefs.trace=e.target.checked;if(detailMotion)for(const f of [detailMotion.f,detailMotion.extra].filter(Boolean))f.setTrace(e.target.checked);saveMotionPrefs();});
  $('#mv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  $('#wv-muscle-toggle').addEventListener('change',e=>changeMusclePreference(e.target.checked));
  for(const prefix of ['mv','wv'])$('#'+prefix+'-region').addEventListener('change',e=>selectMuscleRegion(prefix,e.target.value));
  $('#motion-view').addEventListener('cancel',e=>{e.preventDefault();closeMotion();});
  $('#motion-view').addEventListener('close',()=>{disposeMotion(detailMotion);detailMotion=null;document.documentElement.classList.remove('motion-open');});
  $('#motion-view').addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','BUTTON','TEXTAREA'].includes(e.target.tagName)){e.preventDefault();if(detailMotion){detailMotion.paused=!detailMotion.paused;paintMotion(detailMotion,true);}}});
}


/* ---------- таймер отдыха ---------- */
const T = {left:0, total:0, id:0};
function startRest(sec, label) {
  if (!sec) return;
  T.total = sec; T.left = sec; T.end = Date.now() + sec * 1000;
  $('#t-label').textContent = label || 'Отдых';
  $('#timer').hidden = false; $('#timer').classList.remove('over');
  clearInterval(T.id); clearTimeout(T.id); tick(); T.id = setInterval(tick, 250);
}
function tick() {
  T.left = Math.max(0, Math.round((T.end - Date.now()) / 1000));
  const m = Math.floor(T.left / 60), s = T.left % 60;
  $('#t-time').textContent = `${m}:${String(s).padStart(2, '0')}`;
  $('#t-bar').style.width = (T.total ? (1 - T.left / T.total) * 100 : 100) + '%';
  if (T.left <= 0) {
    clearInterval(T.id);
    $('#timer').classList.add('over'); $('#t-label').textContent = 'Пора к следующему подходу';
    T.id = setTimeout(() => { $('#timer').hidden = true; }, 5000);
  }
}
function adjustRest(d) { if ($('#timer').hidden) return; T.end += d * 1000; T.total = Math.max(1, T.total + d); clearTimeout(T.id); clearInterval(T.id); $('#timer').classList.remove('over'); tick(); T.id = setInterval(tick, 250); }
function stopRest() { clearInterval(T.id); clearTimeout(T.id); $('#timer').hidden = true; }

/* ---------- текст для копирования ---------- */
function blocksText(p) {
  const lines = [];
  for (const b of p.blocks) {
    if (b.kind === 'pair') lines.push(b.items.length > 1 ? `Суперсет ${b.letter}: ${b.sets} ${plural(b.sets, 'круг', 'круга', 'кругов')}, отдых ${fmtRest(b.rest)} после пары` : `${b.letter}:`);
    if (b.kind === 'circuit') lines.push(`Круг × ${b.rounds}: переход ${fmtRest(b.rest)}, отдых после круга ${fmtRest(b.roundRest)}`);
    for (const it of b.items) {
      const r = it.rx;
      const side = r.uni ? ' на сторону' : '';
      lines.push(r.circ ? `${it.label}. ${it.name} — ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}` : `${it.label}. ${it.name} — ${r.sets} × ${r.reps}${r.unit ? ' ' + r.unit : ''}${side}${b.kind === 'list' ? `, отдых ${fmtRest(r.rest)}` : ''}`);
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
function regen(resetSwaps = true) { if (resetSwaps) swaps = {}; done = {}; saveSettings(); renderSetup(); renderPlan(); }
document.addEventListener('click', e => {
  const t = e.target.closest('button, summary');
  if (!t) return;
  if (t.dataset.set) { S[t.dataset.set] = t.dataset.v; if (t.dataset.set === 'mode') S.day = 0; return regen(); }
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
    const lvlMax = S.level === 'beg' ? 2 : 3;
    const tried = new Set((swaps.__tried && swaps.__tried[swapKey() + ':' + slot]) || []);
    /* ближайшие по смыслу: то же движение и те же мышцы — первыми */
    let alts = EX.filter(ex => !inPlan.has(ex.id) && available(ex, plan.E) && ex.lvl <= lvlMax && (ex.g === cur.g || PATTERN[ex.id] === PATTERN[cur.id]))
      .sort((a, b) => analogScore(cur, b) - analogScore(cur, a));
    const msgEl = t.querySelector('span');
    if (!alts.length) { msgEl.textContent = 'Замены нет'; setTimeout(() => { msgEl.textContent = 'Заменить'; }, 1800); return; }
    tried.add(cur.id);
    let next = alts.find(ex => !tried.has(ex.id));
    if (!next) { tried.clear(); tried.add(cur.id); next = alts[0]; }
    swaps.__tried = swaps.__tried || {};
    swaps.__tried[swapKey() + ':' + slot] = [...tried];
    const k = swapKey();
    swaps[k] = swaps[k] || {};
    swaps[k][slot] = next.id;
    done = {};
    renderPlan();
    const card = document.querySelector(`.card[data-slot="${slot}"]`);
    if (card) { card.classList.add('flash'); card.scrollIntoView({block:'nearest', behavior:reduceMotion ? 'auto' : 'smooth'}); }
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
  if (t.id === 'e-toggle') { eqOpen = !eqOpen; renderSetup(); return; }
  if (t.id === 't-minus') return adjustRest(-15);
  if (t.id === 't-plus') return adjustRest(15);
  if (t.id === 't-skip') return stopRest();
});
