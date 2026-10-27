/* ---------- «Анатомия» вне разбора: экран тренировки и карточки плана (этап 2) — правила без страницы ----------
   Здесь — только расчёты (их проверяет tools/anatomy-cards.test.js без браузера): какой вид фигуры показать, с какой
   частотой обновлять кости и мышцы и когда отступить на манекен, какие неподвижные кадры карточек отпустить из памяти.
   Файл грузится раньше 12-motion-player.js (его постоянные нужны при запуске). Отрисовка — в 12-motion-player.js
   (карточки) и 14-workout-mode.js (тренировка). */

/* Ступени скорости. Кадр «Анатомии» — расчёт позы, костей, путей и тел мышц и отрисовка — ≈8 мс процессора на
   компьютере и втрое дольше на бюджетном телефоне. Часы движения идут каждый кадр экрана; кости и мышцы обновляются с
   частотой ступени. Если медиана времени кадра за окно (ANATOMY_PACE.window кадров) выше бюджета ступени — ступень ниже:
   30 → 15 → 10 кадров в секунду, ниже десяти — манекен с подписью «… не успевает — показан манекен». Выбор человека при
   этом не сбрасывается: при следующем открытии экрана (или при новом выборе вида) — снова попытка с 30 кадров.
   Бюджет ступени — три четверти главного потока на её частоте (load: 1000 / fps × 0,75), но не дольше 50 мс (cap: дольше —
   уже «длинная задача», страница заметно медленнее отвечает на нажатия): 30 кадров — до 25 мс на кадр, 15 и 10 — до 50 мс
   (у 10 кадров запас нужен двум анимируемым карточкам: бюджет делится между ними).
   Почему три четверти, а не половина: замер владельца (П8, 15.10.2026; Samsung Galaxy S22 Ultra, Android 16, Chrome 150,
   сборка 4.49.0) — «Анатомия» в разборе обновляется через кадр и стоит 20–23 мс главного потока (медиана; 95 % —
   23–27 мс), а экран при этом держит 52–58 кадров в секунду и разбор не подтормаживает. С бюджетом 16,7 мс такой
   телефон без нужды опускался бы на 15 кадров.
   Замеры стенда (Chromium 390 px, время процессора, медиана трёх прогонов; docs/roadmap.md, пункт 3): кадр карточки
   ×1 (телефон среднего класса) — 8,5–11,5 мс → 30 кадров; ×3 (бюджетный) — 32–34 мс → 15 кадров; экран тренировки
   ×1 — 9,5–14 мс (30 кадров), ×3 — 30–40 мс (15).
   Кадры дольше 0,25 с не считаются (пауза, сборка сцены или шейдеров, вкладка в фоне), первые warmup кадров — тоже. */
/* Ступень выше — после двух окон подряд с медианой ниже up × бюджета той ступени (запас против качелей: вниз при 25 мс,
   назад к 30 кадрам — ниже 20 мс). Так первый круг повторения (матрицы костей ещё не в памяти, кадр дороже) и разовая
   заминка (сборка мусора, соседняя вкладка) не оставляют анимацию на 10 кадрах навсегда.
   Откат на манекен — окончательный до следующего открытия, поэтому решается только по «тёплым» кадрам (cold: false —
   матрицы костей фазы взяты из памяти): если и с памятью кадр дольше 50 мс. Холодные кадры первого круга лишь опускают
   ступень (до 10 кадров в секунду), чтобы не занять весь главный поток. */
const ANATOMY_PACE={load:.75,cap:50,window:12,warmup:3,outlier:250,up:.8,steps:[30,15,10]};
function anatomyBudget(fps,active=1,P=ANATOMY_PACE){return Math.min(1000/fps*P.load,P.cap??Infinity)/Math.max(1,active);}
function anatomyPace(P=ANATOMY_PACE){
  const S={step:0,fallback:false,samples:[],skip:P.warmup,upRun:0,
    get fps(){return P.steps[Math.min(S.step,P.steps.length-1)];},
    get frameMs(){return 1000/S.fps;},
    /* время кадра (мс), число анимируемых фигур и «холодный» ли кадр; ответ — 'down' (ступень ниже), 'up' (выше),
       'fallback' (манекен) или null */
    sample(ms,active=1,cold=false){
      if(S.fallback||!(ms>=0)||ms>P.outlier)return null;
      if(S.skip>0){S.skip--;return null;}
      if(cold&&S.step>=P.steps.length-1)return null;
      S.samples.push(ms);if(S.samples.length<P.window)return null;
      const sorted=S.samples.slice().sort((a,b)=>a-b),median=sorted[sorted.length>>1];S.samples.length=0;S.last=median;
      if(median>anatomyBudget(S.fps,active,P)){
        S.upRun=0;
        if(S.step<P.steps.length-1){S.step++;S.skip=1;return 'down';}
        S.fallback=true;return 'fallback';
      }
      if(S.step>0&&median<P.up*anatomyBudget(P.steps[S.step-1],active,P)){if(++S.upRun>=2){S.step--;S.upRun=0;S.skip=1;return 'up';}}
      else S.upRun=0;
      return null;
    },
    /* новые фигуры в кадре (другая карточка, другое упражнение): первые кадры не считаются, ступень та же */
    settle(){S.samples.length=0;S.skip=Math.max(S.skip,P.warmup);S.upRun=0;},
    reset(){S.step=0;S.fallback=false;S.samples.length=0;S.skip=P.warmup;S.upRun=0;S.last=undefined;}};
  return S;
}

/* Вид фигуры, который можно показать сейчас. pref — выбор человека ('anatomy' | 'skeleton' | 'mannequin');
   able — есть объёмная графика (WebGL) и манекен каталога; state — данные костей и мышц: 'ready' | 'loading' | 'error';
   slow — сработал откат по скорости. Ответ: {view, note, wait} — wait: показан манекен, пока грузятся данные. */
const FIGURE_NOTES={loading:'Загружаем кости и мышцы — пока показан манекен.',error:'Не удалось загрузить кости и мышцы — показан манекен. Проверьте связь.',
  slowPhone:'Телефон не успевает — показан манекен',slowComputer:'Компьютер не успевает — показан манекен'};
function figureViewFor(pref,{able=true,state='ready',slow=false,coarse=true}={}){
  const want=['anatomy','skeleton','mannequin'].includes(pref)?pref:'anatomy';
  if(want==='mannequin'||!able)return{view:'mannequin',note:'',wait:false};
  if(slow)return{view:'mannequin',note:coarse?FIGURE_NOTES.slowPhone:FIGURE_NOTES.slowComputer,wait:false};
  if(state==='error')return{view:'mannequin',note:FIGURE_NOTES.error,wait:false};
  if(state!=='ready')return{view:'mannequin',note:FIGURE_NOTES.loading,wait:true};
  return{view:want,note:'',wait:false};
}
/* Вид «Манекен» в карточках плана и миниатюрах витрины: кожа Anny (src/js/09bs-anny.js) кадром общего рендерера
   (view 'skin'), как в разборе и на экране тренировки. SVG-манекен, как раньше, — без объёмной графики, пока данные
   кожи грузятся (wait), если не загрузились и после отката по скорости; подписи нет: это тот же «Манекен». */
function skinViewFor({able=true,state='ready',slow=false}={}){
  if(!able||slow||state==='error')return{view:'mannequin',note:'',wait:false};
  if(state!=='ready')return{view:'mannequin',note:'',wait:true};
  return{view:'skin',note:'',wait:false};
}

/* Неподвижные кадры карточек плана живут в холстах карточек (≈ ширина × высота × 4 байта: 260 × 260 точек — 0,27 МБ).
   Отпускается кадр карточки, ушедшей дальше двух экранов (far: false), и, если кадров больше limit, — давно не
   виденные (seenAt) из тех, что не у экрана (near: false). Вернувшись к экрану, карточка рисует кадр заново в простое,
   а до того показывает SVG-манекен. Ответ — номера карточек (id), чьи кадры отпустить. */
const CARD_STILLS={limit:12,far:'200% 0px'};
function stillsToFree(cards,limit=CARD_STILLS.limit){
  const held=cards.filter(c=>c.has),out=new Set(held.filter(c=>!c.far).map(c=>c.id));
  let left=held.length-out.size;
  for(const c of held.filter(c=>!out.has(c.id)&&!c.near).sort((a,b)=>a.seenAt-b.seenAt)){if(left<=limit)break;out.add(c.id);left--;}
  return [...out];
}

/* холст карточки — в точках экрана, не больше чем ×2 к размеру на странице (на телефоне ×2,6–3 не видно, а кадр
   втрое дороже); null — карточка не на странице */
const CARD_DPR=2;
function cardCanvasSize(w,h,dpr=1){
  if(!(w>0&&h>0))return null;const k=Math.min(CARD_DPR,Math.max(1,dpr||1));
  return{width:Math.round(w*k),height:Math.round(h*k)};
}

/* ---------- Миниатюры витрины атласа в «Анатомии» (этап 3) — правила без страницы ----------
   Рисует их тот же общий рендерер, что карточки плана (GymVolume.cards), — неподвижный кадр той же фазы, что у
   SVG-миниатюры, тем же ракурсом «Под углом»; рамка — по телу в показанной позе (человек крупнее, тренажёр может уйти за
   край, как в карточках). Готовый кадр хранится сжатым (WebP, где браузер его не умеет, — JPEG; 7–12 КБ вместо 0,4 МБ
   холста) — в памяти страницы и в Cache Storage между сеансами. Отрисовка и очередь — в 13e-gallery-anatomy.js.
   Почему не заранее при сборке: 151 упражнение × варианты инвентаря × размеры — 2–5 МБ в сборке (и ещё раз в каждом
   офлайн-файле, base64), сборка зависела бы от Chromium с WebGL, а кадры пришлось бы перерисовывать при каждой правке
   поз, костей и мышц. На телефоне миниатюра рисуется один раз и дальше берётся из кеша; ключ кеша содержит номер
   сборки (PODHOD_BUILD — хеш всех исходников, поз и данных костей и мышц), поэтому новая версия сама рисует новые кадры. */
const GALLERY_THUMBS={
  step:40,max:320,dpr:2,               /* холст: точки экрана, не больше ×2, ступенями по 40 точек (меньше разных ключей) */
  near:'25% 0px 60% 0px',              /* «у экрана и чуть ниже»: четверть экрана сверху, 0,6 экрана снизу */
  quiet:160,                           /* мс после прокрутки без новых кадров: при листании поток не тратится на пролетающее */
  memory:3<<20,                        /* сжатые кадры в памяти страницы — до 3 МБ (≈300 миниатюр), дальше — давно не виденные */
  cacheMax:600,cacheKeep:450,          /* записей в Cache Storage одной сборки: больше 600 — остаются 450 свежих */
  window:3,warmup:1,visibleMs:90,svgMs:400,  /* скорость: медиана самой длинной задачи миниатюры за три последние (thumbPace);
                                       первая миниатюра (сборка шейдеров) не считается */
  quality:.82,camera:'angle'
};
/* размер холста миниатюры (квадрат, точки экрана) по её ширине на странице; 0 — миниатюры нет на странице */
function thumbCanvasSize(cssWidth,dpr=1,G=GALLERY_THUMBS){
  if(!(cssWidth>0))return 0;
  const px=cssWidth*Math.min(G.dpr,Math.max(1,dpr||1));
  return Math.min(G.max,Math.max(G.step,Math.ceil(px/G.step)*G.step));
}
/* ключ готового кадра: сборка, вид, тема, упражнение и его инвентарь (он задаёт вариант и видимые детали), фаза,
   ракурс, размер */
function thumbCacheKey({build='',view,theme,id,equip='',t,camera=GALLERY_THUMBS.camera,size}){
  return ['t1',build,view,theme,id,equip,t,camera,size].join('|');
}
/* Cache Storage: одна корзина на сборку и место приложения (scope); корзины прежних сборок удаляются */
const THUMB_CACHE_PREFIX='podhod-thumbs@';
function thumbCacheName(scope,build){return THUMB_CACHE_PREFIX+scope+':'+build;}
function thumbCachesStale(names,scope,build){
  const mine=THUMB_CACHE_PREFIX+scope+':',now=mine+build;
  return names.filter(n=>typeof n==='string'&&n.startsWith(mine)&&n!==now);
}
/* записи корзины по порядку добавления: больше cacheMax — удалить старые, оставить cacheKeep последних */
function thumbCacheTrim(keys,G=GALLERY_THUMBS){return keys.length>G.cacheMax?keys.slice(0,keys.length-G.cacheKeep):[];}
/* сжатые кадры в памяти: больше limit байт — отпустить давно не виденные (seenAt), кроме тех, что у экрана (near) */
function thumbsToDrop(entries,limit=GALLERY_THUMBS.memory){
  let total=entries.reduce((s,e)=>s+(e.bytes||0),0);const out=[];
  for(const e of entries.filter(e=>!e.near).sort((a,b)=>a.seenAt-b.seenAt)){if(total<=limit)break;out.push(e.key);total-=e.bytes||0;}
  return out;
}
/* следующая миниатюра для отрисовки: сначала видимые, потом ближние сверху вниз; only — только видимые */
function thumbNext(tiles,only=false){
  let best=null;
  for(const c of tiles){if(only&&!c.visible)continue;if(!best||(c.visible&&!best.visible)||(c.visible===best.visible&&c.top<best.top))best=c;}
  return best;
}
/* Скорость витрины. У миниатюры две задачи — сборка сцены и кадр (поза, кости, мышцы, отрисовка, копия); мерило —
   самая длинная из них. Медиана за window миниатюр выше visibleMs — рисуются только видимые (без запаса ниже экрана),
   выше svgMs — витрина возвращается к SVG-манекену с подписью «… не успевает — показан манекен», как карточки. Обратно
   к запасу — когда медиана ниже 0,7 × visibleMs. Решение живёт до закрытия витрины. */
function thumbPace(G=GALLERY_THUMBS){
  const S={mode:'near',samples:[],last:null,skip:G.warmup,
    sample(ms){
      if(S.mode==='svg'||!(ms>=0))return null;
      if(S.skip>0){S.skip--;return null;}
      S.samples.push(ms);if(S.samples.length<G.window)return null;
      const s=S.samples.slice().sort((a,b)=>a-b),m=s[s.length>>1];S.last=m;S.samples.length=0;
      const next=m>G.svgMs?'svg':m>G.visibleMs||(S.mode==='visible'&&m>G.visibleMs*.7)?'visible':'near';
      if(next===S.mode)return null;S.mode=next;return next;
    },
    reset(){S.mode='near';S.samples.length=0;S.last=null;S.skip=G.warmup;}};
  return S;
}
/* вид миниатюр: как у карточек (figureViewFor); render — рисовать ли новые кадры. Пока грузятся кости и мышцы, вид —
   выбранный (готовые кадры из памяти и кеша показываются), а новые не рисуются */
function thumbViewFor(pref,{able=true,state='ready',slow=false,coarse=true}={}){
  if(pref==='mannequin'){const c=skinViewFor({able,state,slow});return{view:c.wait?'skin':c.view,render:c.view==='skin',note:'',wait:c.wait};}
  const c=figureViewFor(pref,{able,state,slow,coarse}),want=['anatomy','skeleton','mannequin'].includes(pref)?pref:'anatomy';
  return{view:c.wait?want:c.view,render:c.view!=='mannequin',note:c.wait?'':c.note,wait:c.wait};
}
