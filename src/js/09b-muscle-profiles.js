/* Учебные мышечные зоны. Числа управляют яркостью, не измеряют силу или ЭМГ.
   Источники описывают технику/состав мышц; кривые — явно условная иллюстрация.
   Узлы кривых: t=0, .5, 1. Общие края исключают скачки в паузах и на развороте. */
const MUSCLE_ROLES={primary:'Основная',support:'Вспомогательная',stabilizer:'Стабилизатор'};
const MUSCLE_BANDS=['Нейтрально','Слабое участие','Заметное участие','Сильное участие'];
const MUSCLE_PROFILES={
 bbbench:{pair:'above',curveBasis:'illustrative',
  sources:[['Мышцы в жиме лёжа — исследование','https://pubmed.ncbi.nlm.nih.gov/25799093/']],
  notes:{concentric:'Грудные, трицепс и передняя дельта участвуют в жиме. Корпус сохраняет опору.',
   eccentric:'Грудные, трицепс и передняя дельта контролируют опускание. Корпус сохраняет опору.',
   end:'Нижняя точка: мышцы продолжают удерживать нагрузку во время паузы.',
   start:'Верхняя точка: сохраняйте хват и устойчивое положение корпуса.'},
  muscles:{
   chest:{role:'primary',concentric:[.35,.86,.65],eccentric:[.35,.59,.65]},
   triceps:{role:'support',concentric:[.42,.72,.45],eccentric:[.42,.51,.45]},
   delt_f:{role:'support',concentric:[.32,.64,.50],eccentric:[.32,.46,.50]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 latpull:{pair:'back',curveBasis:'illustrative',
  sources:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],
   ['Мышцы в тяге верхнего блока — исследование','https://pubmed.ncbi.nlm.nih.gov/15228624/']],
  notes:{concentric:'Широчайшие и сгибатели локтя участвуют в тяге; мышцы корпуса удерживают положение.',
   eccentric:'Мышцы спины и сгибатели локтя контролируют возврат рукояти вверх.',
   end:'Рукоять у груди: мышцы удерживают положение, корпус не раскачивается.',
   start:'Руки вверху: сохраняйте хват и положение корпуса перед следующей тягой.'},
  muscles:{
   lats:{role:'primary',concentric:[.36,.86,.72],eccentric:[.36,.61,.72]},
   biceps:{role:'support',concentric:[.30,.68,.57],eccentric:[.30,.49,.57]},
   midback:{role:'support',concentric:[.32,.61,.65],eccentric:[.32,.48,.65]},
   abs:{role:'stabilizer',concentric:[.32,.35,.35],eccentric:[.32,.35,.35]}
  }},
 squat:{pair:'back',curveBasis:'illustrative',
  sources:[['Мышцы и моменты суставов в приседе — исследование','https://pubmed.ncbi.nlm.nih.gov/33136769/']],
  notes:{concentric:'Квадрицепс разгибает колени, ягодичные — тазобедренные суставы. Корпус сохраняет устойчивость.',
   eccentric:'Квадрицепс и ягодичные контролируют опускание. Мышцы корпуса удерживают спину.',
   end:'Нижняя точка: удерживайте напряжение корпуса и опору всей стопой.',
   start:'Верхняя точка: сохраните опору и подготовьтесь к следующему повторению.'},
  muscles:{
   quads:{role:'primary',concentric:[.34,.88,.72],eccentric:[.34,.64,.72]},
   glutes:{role:'primary',concentric:[.32,.82,.67],eccentric:[.32,.59,.67]},
   hams:{role:'support',concentric:[.28,.43,.40],eccentric:[.28,.37,.40]},
   abs:{role:'stabilizer',concentric:[.36,.43,.43],eccentric:[.36,.43,.43]},
   lowback:{role:'stabilizer',concentric:[.36,.46,.46],eccentric:[.36,.46,.46]}
  }},
 /* Прицельно на приводящие и манжету: фазы — по ходу движения и рычагу, состав — по ЭМГ из источников */
 cableadduct:{pair:'above',curveBasis:'illustrative',
  sources:[['Сведение бедра против резины и другие упражнения на приводящие: ЭМГ — Serner и др., 2014','https://doi.org/10.1136/bjsports-2012-091746']],
  notes:{concentric:'Приводящие сводят ногу к опорной и чуть за неё. Корпус и таз неподвижны.',
   eccentric:'Приводящие сдерживают возврат ноги в отведение под тягой троса.',
   end:'Нога за средней линией: приводящие удерживают её перед опорной стопой.',
   start:'Нога в отведении: приводящие растянуты, трос натянут.'},
  muscles:{
   adductors:{role:'primary',concentric:[.36,.86,.70],eccentric:[.36,.62,.70]},
   obliques:{role:'stabilizer',concentric:[.30,.36,.36],eccentric:[.30,.36,.36]}
  }},
 copenhagen:{pair:'above',curveBasis:'illustrative',
  sources:[['Копенгагенское упражнение и другие упражнения на приводящие: ЭМГ — Serner и др., 2014','https://doi.org/10.1136/bjsports-2012-091746'],
   ['Копенгагенское упражнение: рост эксцентрической силы приводящих — Ishøi и др., 2016','https://doi.org/10.1111/sms.12585']],
  notes:{concentric:'Приводящие верхней ноги поднимают таз до прямой линии, нижние подтягивают ногу к скамье. Косые держат корпус.',
   eccentric:'Приводящие верхней ноги тормозят опускание таза — уступающая работа под весом тела.',
   end:'Верхняя точка: тело прямое, приводящие держат его на опоре голеностопом.',
   start:'Нижняя точка: таз опущен наполовину, приводящие верхней ноги растянуты под нагрузкой.'},
  muscles:{
   adductors:{role:'primary',concentric:[.62,.92,.80],eccentric:[.62,.78,.80]},
   obliques:{role:'support',concentric:[.40,.58,.52],eccentric:[.40,.50,.52]}
  }},
 copenhagenknee:{pair:'above',curveBasis:'illustrative',
  sources:[['Копенгагенское упражнение и другие упражнения на приводящие: ЭМГ — Serner и др., 2014','https://doi.org/10.1136/bjsports-2012-091746'],
   ['Ступени копенгагенского упражнения от опоры коленом — Polglass и др., 2019','https://doi.org/10.1136/bmjsem-2019-000570']],
  notes:{concentric:'Приводящие верхней ноги поднимают таз до прямой линии от плеч до колена, нижние подтягивают согнутую ногу к скамье. Косые держат корпус.',
   eccentric:'Приводящие тормозят опускание таза; рычаг короче, чем с опорой голеностопом.',
   end:'Верхняя точка: тело прямое, опора — колено и голень на скамье.',
   start:'Нижняя точка: таз опущен наполовину, нижнее колено на полу, приводящие растянуты.'},
  muscles:{
   adductors:{role:'primary',concentric:[.48,.78,.66],eccentric:[.48,.64,.66]},
   obliques:{role:'support',concentric:[.36,.52,.46],eccentric:[.36,.45,.46]}
  }},
 cableextrot:{pair:'back',curveBasis:'illustrative',
  sources:[['Мышцы манжеты и дельтовидная в упражнениях на наружную ротацию: ЭМГ — Reinold и др., 2004','https://doi.org/10.2519/jospt.2004.34.7.385']],
  notes:{concentric:'Подостная и малая круглая поворачивают плечо наружу, задняя дельта помогает. Локоть у бока.',
   eccentric:'Наружные ротаторы сдерживают возврат кисти к животу под тягой троса.',
   end:'Плечо развёрнуто наружу: манжета удерживает положение, локоть не отходит от валика.',
   start:'Кисть у живота: трос натянут, плечо повёрнуто внутрь.'},
  muscles:{
   cuff:{role:'primary',concentric:[.34,.80,.72],eccentric:[.34,.58,.72]},
   delt_r:{role:'support',concentric:[.26,.52,.50],eccentric:[.26,.42,.50]}
  }},
 bandextrot:{pair:'back',curveBasis:'illustrative',
  sources:[['Мышцы манжеты и дельтовидная в упражнениях на наружную ротацию: ЭМГ — Reinold и др., 2004','https://doi.org/10.2519/jospt.2004.34.7.385']],
  notes:{concentric:'Подостная и малая круглая поворачивают плечо наружу; лента тянет сильнее к концу движения.',
   eccentric:'Наружные ротаторы сдерживают возврат кисти к животу, лента не дёргает руку.',
   end:'Плечо развёрнуто наружу — лента натянута сильнее всего.',
   start:'Кисть у живота: лента едва натянута.'},
  muscles:{
   cuff:{role:'primary',concentric:[.26,.70,.86],eccentric:[.26,.56,.86]},
   delt_r:{role:'support',concentric:[.22,.46,.60],eccentric:[.22,.38,.60]}
  }},
 /* Скандинавские сгибания — уступающий акцент (этап А аудита анатомии 4.53.0): поза при t 0→1 — толчок руками от пола и
    возврат вверх, главная работа задней поверхности бедра — медленное опускание 1→0, ярче всего в его середине и ниже, где
    рычаг корпуса длиннее (ЭМГ и фМРТ — Bourne и др., 2017: полусухожильная работает сильнее всех). Узлы: t=0 — внизу,
    t=1 — корпус вертикален. */
 nordic:{pair:'back',curveBasis:'illustrative',
  sources:[['«Нордические» сгибания и другие упражнения на заднюю поверхность бедра: ЭМГ и фМРТ — Bourne и др., 2017','https://doi.org/10.1136/bjsports-2015-095739']],
  notes:{concentric:'Подъём: ладони отталкиваются от пола, задняя поверхность бедра помогает вернуть корпус.',
   eccentric:'Опускание: задняя поверхность бедра медленно тормозит корпус — главная, уступающая работа.',
   end:'Верхняя точка: корпус прямой от колен до головы, таз не сгибается.',
   start:'Нижняя точка: ладони принимают вес, задняя поверхность бедра растянута под нагрузкой.'},
  muscles:{
   hams:{role:'primary',concentric:[.70,.56,.40],eccentric:[.70,.92,.40]},
   glutes:{role:'support',concentric:[.46,.48,.44],eccentric:[.46,.52,.44]},
   calves:{role:'support',concentric:[.34,.36,.30],eccentric:[.34,.50,.30]}
  }}
};
/* DEMO собран до модулей 04 и 04b: упражнения оттуда ищутся в EX */
for(const[id,profile]of Object.entries(MUSCLE_PROFILES))(DEMO[id]||EX.find(ex=>ex.id===id)).anim.muscleProfile=profile;

function muscleFrame(anim,t,index=0){
 const profile=motionProfile(anim);
 if(!profile)return null;
 t=Math.max(0,Math.min(1,Number.isFinite(t)?t:0));
 const phase=index===1?'end':index===3?'start':((index===0)!==!!anim.eccFirst?'concentric':'eccentric');
 const curve=phase==='concentric'?'concentric':'eccentric',values={};
 for(const[id,m]of Object.entries(profile.muscles)){
  const knots=m[curve],i=t<.5?0:1,q=(t-i*.5)*2,e=q*q*(3-2*q);
  values[id]=knots[i]+(knots[i+1]-knots[i])*e;
 }
 for(const[id,r]of Object.entries(profile.regions||{}))values[id]=values[r.parent]*r.factor;
 return{phase,values,note:profile.notes[phase]};
}
function muscleBand(v){return v<.12?0:v<.45?1:v<.72?2:3;}
/* Шкала участия: цвет тела → жёлтый → янтарный → оранжевый. Красный оставлен для отметок нагрузки на суставы. */
const MUSCLE_STOPS=[[0,[174,184,200]],[.15,[233,210,106]],[.45,[245,184,46]],[.75,[242,138,31]],[1,[234,106,14]]];
function muscleColor(v){
 const x=Math.max(0,Math.min(1,Number.isFinite(v)?v:0));let i=0;while(i<MUSCLE_STOPS.length-2&&x>MUSCLE_STOPS[i+1][0])i++;
 const[a,ca]=MUSCLE_STOPS[i],[b,cb]=MUSCLE_STOPS[i+1],q=(x-a)/(b-a);
 return '#'+ca.map((c,k)=>Math.round(c+(cb[k]-c)*q).toString(16).padStart(2,'0')).join('');
}

/* Поверхности в координатах скелета: передняя/задняя сторона, не пятна на экране.
   Тело остаётся схематичным; плечевой пояс и вращение плеча требуют полноценной модели. */
function muscleSurfaces(R,profile){
 const faces=[],has=id=>Object.prototype.hasOwnProperty.call(profile.muscles,id);
 function patch(id,side,rows,point,normal,anchor){
  if(!has(id))return;
  const slices=6;
  for(let r=0;r<rows.length-1;r++)for(let k=0;k<slices;k++){
   const [h0,a0,b0]=rows[r],[h1,a1,b1]=rows[r+1],q0=k/slices,q1=(k+1)/slices;
   const a=a0+(b0-a0)*q0,b=a0+(b0-a0)*q1,c=a1+(b1-a1)*q1,d=a1+(b1-a1)*q0;
   faces.push({id,side,points:[point(h0,a),point(h0,b),point(h1,c),point(h1,d)],
    normal:normal((h0+h1)/2,(a+b+c+d)/4),anchor});
  }
 }
 const rings=[[-5,12,8],[9,13,9],[23,12,8],[40,19,11],[49,19,9]];
 function radius(h){
  const i=Math.max(0,Math.min(rings.length-2,rings.findIndex(r=>r[0]>=h)-1)),a=rings[i],b=rings[i+1],q=Math.max(0,Math.min(1,(h-a[0])/(b[0]-a[0])));
  return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];
 }
 for(const[side,sign]of [['L',-1],['R',1]]){
  const torsoPoint=(h,a)=>{const[w,d]=radius(h);return V3.add(V3.add(V3.add(R.hip,R.u,h),[sign,0,0],w*Math.sin(a)),R.n,d*Math.cos(a));};
  const torsoNormal=(h,a)=>{const[w,d]=radius(h);return V3.unit(V3.add([sign*Math.sin(a)/w,0,0],R.n,Math.cos(a)/d));};
  const torsoAnchor=V3.add(R.hip,R.u,30.25),pelvisAnchor=V3.add(R.hip,R.u,2);
  patch('chest',side,[[31,.13,.90],[39,.09,1.20],[47,.20,1.12]],torsoPoint,torsoNormal,torsoAnchor);
  patch('abs',side,[[13,.08,.53],[21,.08,.51],[29,.08,.40]],torsoPoint,torsoNormal,torsoAnchor);
  patch('lats',side,[[12,1.65,2.90],[25,1.12,2.85],[39,1.02,2.46]],torsoPoint,torsoNormal,torsoAnchor);
  patch('midback',side,[[34,2.48,3.03],[42,2.22,3.03],[48,2.53,3.03]],torsoPoint,torsoNormal,torsoAnchor);
  patch('lowback',side,[[12,2.62,3.02],[21,2.70,3.02],[30,2.75,3.02]],torsoPoint,torsoNormal,torsoAnchor);
  patch('glutes',side,[[-4,1.62,2.98],[3,1.45,3.04],[9,1.90,3.00]],torsoPoint,torsoNormal,pelvisAnchor);
  function onLimb(id,a,b,width,rows,front){
   const delta=V3.sub(b,a),axis=V3.unit(delta);
   let n=V3.add(front,axis,-V3.dot(front,axis));
   if(Math.hypot(...n)<.01)n=V3.add(R.u,axis,-V3.dot(R.u,axis));
   n=V3.unit(n);const lateral=V3.unit(V3.cross(axis,n));
   const radial=(t,angle)=>V3.add(V3.add([0,0,0],n,Math.cos(angle)),lateral,Math.sin(angle));
   const point=(t,angle)=>V3.add(V3.add(a,delta,t),radial(t,angle),width*(.94-.28*t)*.5);
   patch(id,side,rows,point,radial,V3.add(a,delta,.5));
  }
  const sh=R['sh'+side],elbow=R['el'+side],hip=R['hip'+side],knee=R['kn'+side];
  onLimb('delt_f',sh,elbow,10,[[.02,-.72,.72],[.16,-1.05,1.05],[.30,-.62,.62]],R.n);
  onLimb('biceps',sh,elbow,10,[[.29,-.62,.62],[.56,-.80,.80],[.84,-.38,.38]],R.n);
  onLimb('triceps',sh,elbow,10,[[.24,1.55,4.73],[.55,1.32,4.96],[.88,2.34,3.94]],R.n);
  const thighFront=V3.cross([1,0,0],V3.unit(V3.sub(knee,hip)));
  onLimb('quads',hip,knee,13,[[.13,-1.43,1.43],[.44,-1.62,1.62],[.84,-1.02,1.02]],thighFront);
  onLimb('hams',hip,knee,13,[[.22,1.72,4.56],[.53,1.62,4.66],[.83,2.10,4.18]],thighFront);
 }
 return faces;
}
function visibleMuscleSurfaces(R,profile,camera){
 const project=camera3(camera);
 return muscleSurfaces(R,profile).filter(face=>project(face.normal)[2]>.035);
}
/* Общий контур вместо сетки цветных четырёхугольников: меньше узлов SVG и швов. */
function muscleContours(faces){
 const groups=new Map(),key=p=>p.map(v=>v.toFixed(6)).join(',');
 for(const face of faces){
  const id=face.id+':'+face.side;
  if(!groups.has(id))groups.set(id,{face,edges:new Map()});
  const {edges}=groups.get(id);
  for(let i=0;i<face.points.length;i++){
   const a=face.points[i],b=face.points[(i+1)%face.points.length],ka=key(a),kb=key(b),edge=[ka,kb].sort().join('|');
   if(edges.has(edge))edges.delete(edge);else edges.set(edge,{a,b,ka,kb});
  }
 }
 const contours=[];
 for(const {face,edges}of groups.values())while(edges.size){
  const [firstKey,first]=edges.entries().next().value;
  edges.delete(firstKey);const points=[first.a,first.b];let end=first.kb;
  while(end!==first.ka){
   const entry=[...edges].find(([,e])=>e.ka===end||e.kb===end);if(!entry)break;
   const[k,e]=entry;edges.delete(k);const forward=e.ka===end;points.push(forward?e.b:e.a);end=forward?e.kb:e.ka;
  }
  if(end===first.ka)points.pop();
  if(points.length>=3)contours.push({...face,points});
 }
 return contours;
}
