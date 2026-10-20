/* Anatomical parts and teaching regions are deliberately distinct. Deep muscles
   have an entry but no patch painted on top of the skin. Colour curves are authored
   illustrations; identical head profiles do not pretend to measure head-specific EMG. */
const MUSCLE_REGIONS={
 chest:[['pec_clavicular','Ключичная часть грудной','anatomical'],['pec_sternal','Средняя область грудной','teaching'],['pec_costal','Нижняя область грудной','teaching'],['pec_minor','Малая грудная · глубже','deep']],
 triceps:[['tri_long','Длинная головка трицепса','anatomical'],['tri_lateral','Латеральная головка трицепса','anatomical'],['tri_medial','Медиальная головка трицепса · глубже','deep']],
 biceps:[['bi_long','Длинная головка бицепса','anatomical'],['bi_short','Короткая головка бицепса','anatomical']],
 delt_f:[['delt_f','Передняя часть дельтовидной','anatomical']],delt_s:[['delt_s','Средняя часть дельтовидной','anatomical']],delt_r:[['delt_r','Задняя часть дельтовидной','anatomical']],
 quads:[['quad_rectus','Прямая мышца бедра','anatomical'],['quad_lateral','Латеральная широкая мышца','anatomical'],['quad_medial','Медиальная широкая мышца','anatomical'],['quad_deep','Промежуточная широкая · глубже','deep']],
 hams:[['ham_lateral','Двуглавая мышца бедра, длинная головка','anatomical'],['ham_medial','Медиальная область заднего бедра','teaching'],['ham_short','Короткая головка двуглавой бедра · глубже','deep']],
 calves:[['calf_medial','Медиальная головка икроножной','anatomical'],['calf_lateral','Латеральная головка икроножной','anatomical'],['soleus','Камбаловидная · глубже','deep']],
 glutes:[['glute_max','Большая ягодичная','anatomical'],['glute_lateral','Боковая ягодичная область','teaching']],
 traps:[['trap_upper','Верхняя область трапециевидной','teaching'],['trap_mid','Средняя область трапециевидной','teaching'],['trap_lower','Нижняя область трапециевидной','teaching'],['lev_scap','Поднимающая лопатку · глубже','deep']],
 lats:[['lats','Широчайшие · общий профиль','group']],midback:[['midback','Межлопаточная область · общий профиль','group']],
 lowback:[['lowback','Разгибатели спины · общий профиль','group']],abs:[['abs','Прямая мышца живота','anatomical']],
 obliques:[['obl_ext','Наружная косая мышца живота','anatomical'],['obl_int','Внутренняя косая мышца живота · глубже','deep']],
 forearms:[['forearm_flex','Сгибатели запястья и пальцев','anatomical'],['forearm_ext','Разгибатели запястья и пальцев','anatomical'],['brachiorad','Плечелучевая мышца','anatomical']],
 adductors:[['adductors','Приводящие мышцы бедра · общий профиль','group']],hipflex:[['hipflex','Подвздошно-поясничная · глубже','deep']],
 serratus:[['serratus','Передняя зубчатая','anatomical']],
 cuff:[['cuff_ext','Подостная и малая круглая · глубже','deep'],['cuff_int','Подлопаточная · глубже','deep'],['cuff_sup','Надостная · глубже','deep']]
};
const REGION_META=Object.fromEntries(Object.entries(MUSCLE_REGIONS).flatMap(([parent,rows])=>rows.map(([id,label,kind])=>[id,{id,parent,label,kind,visible:kind!=='deep'}])));
const REGION_ANATOMY_SOURCES=[['Анатомия мышц плечевого пояса — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-5-muscles-of-the-pectoral-girdle-and-upper-limbs'],['Анатомия мышц ног — OpenStax','https://openstax.org/books/anatomy-and-physiology-2e/pages/11-6-appendicular-muscles-of-the-pelvic-girdle-and-lower-limbs']];
function motionProfile(anim){return anim.catalogProfile||anim.muscleProfile;}
/* ключичная часть большой грудной сгибает плечо — ярче в наклонных жимах и подъёме перед собой; в тягах сверху
   (плечо разгибается и приводится) работают грудинно-рёберные части, ключичная почти молчит */
const INCLINE_CHEST=new Set(['dbincline','smithincline','inclinebb','declinepush','cablelowfly','frontraise']);
const PULL_CHEST=new Set(['latpull','latpullv','latpulluh','assistpull','pullup','chinup','pullover']);
const LOWER_CHEST=new Set(['declinebb','dip','assistdip']);
/* Стороны упражнений на одну сторону: upper — руки и плечевой пояс, lower — ноги, regions — отдельные области корпуса
   (косые мышцы: наклон в сторону — одна сторона целиком, поворот — наружная косая одной стороны с внутренней другой).
   Этап А аудита анатомии 4.53.0 (стороны — по длинам мышц в позе, tools/muscles/phase.js):
   - копенгагенская планка: рабочая — верхняя нога на скамье (левая; её приводящие укорачиваются, когда таз поднимается,
     и держат тело — Serner и др., 2014; Ishøi и др., 2016); у нижней ноги в позе манекена бедро при подъёме отводится
     (к скамье она не подтягивается — поза на ревью), её приводящие удлиняются — цвет покоя;
   - наклон в сторону: гантель в правой руке, работают косые левой стороны — сдерживают наклон и возвращают корпус
     (OpenStax A&P 2e, 11.4: наклон корпуса в сторону — косые своей стороны);
   - «дровосек» сверху вниз: корпус поворачивается вправо — наружная косая левой стороны и внутренняя правой (Gray's
     Anatomy; OpenStax A&P 2e, 11.4: наружная косая поворачивает корпус в противоположную сторону, внутренняя — в свою). */
const CATALOG_LATERALITY={dbrow:{upper:'L'},cablelat:{upper:'R'},concentration:{upper:'L'},kickback:{upper:'L'},archer:{upper:'R'},bulgarian:{lower:'L'},stepup:{lower:'L'},lunge:{lower:'L'},revlunge:{lower:'L'},sidelunge:{lower:'R'},pistolbox:{lower:'L'},sllift:{lower:'L'},glutebridge1:{lower:'L'},glutekick:{lower:'L'},cablekickback:{lower:'L'},calf1:{lower:'L'},cableadduct:{lower:'L'},cableextrot:{upper:'R'},bandextrot:{upper:'R'},
 copenhagen:{lower:'L'},copenhagenknee:{lower:'L'},sidebend:{regions:{obl_ext:'L',obl_int:'L'}},cablewood:{regions:{obl_ext:'L',obl_int:'R'}}};
function catalogSideValues(profile,values){
 const sides={L:{...values},R:{...values}},lower=new Set(['quads','hams','calves','glutes','adductors','hipflex']),lat=profile.laterality||{};
 for(const[part,active]of Object.entries(lat))if(part!=='regions')for(const[id,r]of Object.entries(profile.regions)){
  const applies=part==='lower'?lower.has(r.parent):!lower.has(r.parent)&&!['abs','obliques','lowback','traps'].includes(r.parent);
  if(applies)sides[active==='L'?'R':'L'][id]=.28;
 }
 for(const[id,active]of Object.entries(lat.regions||{}))if(profile.regions[id])sides[active==='L'?'R':'L'][id]=.28;
 return sides;
}
/* Учебные акценты частей мышц (этап А аудита анатомии 4.53.0: цвет по фазам против длины мышц — tools/muscles/phase.js,
   проверка — tools/muscle-phase.test.js): доля значения группы у области в упражнении; без записи — 1. */
const SQUAT_LIKE=new Set('squat goblet airsquat smithsquat hacksquat legpress legpresshigh legpresslow lunge revlunge bulgarian stepup pistolbox sidelunge wallsit jumpsquat thruster'.split(' '));
const PULL_DOWN=new Set(['latpull','latpullv','latpulluh','assistpull','pullup','chinup']);
const EXT_ROT=new Set(['cableextrot','bandextrot']);
const REGION_FACTORS={
 /* прямая бедра в приседаниях, выпадах и жиме ногами работает слабее широких: двусуставная, в разгибании колена с
    разгибанием бедра длина почти не меняется (ЭМГ: Escamilla и др., 1998) */
 quad_rectus:id=>SQUAT_LIKE.has(id)?.65:1,
 /* короткая головка двуглавой бедра — односуставной сгибатель колена: разгибание бедра её не нагружает (фМРТ: Bourne и др.,
    2017), в приседаниях и тягах она удлиняется */
 ham_short:id=>id==='legcurl'||id==='nordic'?1:.3,
 /* шраги поднимают лопатку верхняя часть трапециевидной и поднимающая лопатку, нижняя часть — опускатель (Neumann, 2017;
    ЭМГ — Pizzari и др., 2014); в тягах сверху и подтягиваниях лопатку опускает нижняя часть (ЭМГ — Youdas и др., 2010),
    верхняя при этом удлиняется */
 trap_upper:id=>PULL_DOWN.has(id)?.35:1,
 trap_mid:id=>id==='shrug'?.6:PULL_DOWN.has(id)?.8:1,
 trap_lower:id=>id==='shrug'?.25:1,
 lev_scap:id=>id==='shrug'?1:.5,
 /* предплечье: сгибание запястий — сгибатели, разгибатели растягиваются, плечелучевая запястье не пересекает (OpenStax A&P 2e,
    11.5); «молот» — плечелучевая сгибает локоть (ЭМГ — Boland и др., 2008), мышцы кисти держат рукоять */
 forearm_flex:id=>id==='hammer'?.6:1,
 forearm_ext:id=>id==='wristcurl'?.3:id==='hammer'?.6:1,
 brachiorad:id=>id==='wristcurl'?.3:1,
 /* манжета: наружу плечо поворачивают подостная и малая круглая, надостная помогает (ЭМГ — Reinold и др., 2004),
    подлопаточная — внутренний ротатор (OpenStax A&P 2e, 11.5) и растягивается */
 cuff_int:id=>EXT_ROT.has(id)?.25:id==='ytw'?.3:1,
 cuff_sup:id=>EXT_ROT.has(id)?.6:id==='ytw'?.9:1,
 /* малая грудная плечо не сгибает — опускает и выводит вперёд лопатку (OpenStax A&P 2e, 11.5): в подъёме рук вперёд
    лопатка поворачивается вверх и малая грудная растягивается; руку поднимает ключичная часть большой грудной */
 pec_minor:id=>id==='frontraise'?.3:1
};
/* Источники акцентов — к источникам упражнения в разборе (тем, чьи области меняются) */
const REGION_SOURCES={
 rectus:['Широкие и прямая мышцы бедра в приседаниях и жиме ногами: ЭМГ — Escamilla и др., 1998','https://doi.org/10.1097/00005768-199804000-00014'],
 hamShort:['Короткая головка двуглавой бедра в разгибании бедра: фМРТ — Bourne и др., 2017','https://doi.org/10.1136/bjsports-2015-095739'],
 shrug:['Трапециевидная в шрагах: ЭМГ — Pizzari и др., 2014','https://doi.org/10.1016/j.clinbiomech.2013.11.011'],
 pull:['Нижняя часть трапециевидной в подтягиваниях: ЭМГ — Youdas и др., 2010','https://doi.org/10.1519/JSC.0b013e3181f1598c'],
 brd:['Плечелучевая в сгибании локтя: ЭМГ — Boland и др., 2008','https://doi.org/10.1016/j.jhsa.2008.07.019'],
 cuff:['Мышцы манжеты и дельтовидная в упражнениях на наружную ротацию: ЭМГ — Reinold и др., 2004','https://doi.org/10.2519/jospt.2004.34.7.385']
};
const regionSources=(id,muscles)=>[
 ...(SQUAT_LIKE.has(id)&&muscles.quads?[REGION_SOURCES.rectus]:[]),...(muscles.hams&&id!=='legcurl'&&id!=='nordic'?[REGION_SOURCES.hamShort]:[]),
 ...(id==='shrug'?[REGION_SOURCES.shrug]:[]),...(PULL_DOWN.has(id)?[REGION_SOURCES.pull]:[]),...(id==='hammer'?[REGION_SOURCES.brd]:[]),
 ...(EXT_ROT.has(id)||id==='ytw'?[REGION_SOURCES.cuff]:[])];
/* Группы, которых нет в составе упражнения, но которые по ЭМГ участвуют: нижняя часть трапециевидной опускает лопатку в тягах
   сверху и подтягиваниях (Youdas и др., 2010) — в профиле как вспомогательная, в составе упражнения (pri/sec) не меняется */
const PROFILE_EXTRA={traps:PULL_DOWN};
for(const ex of EX){
 const base=ex.anim.muscleProfile,hold=ex.anim.hold,cyclic=ex.g==='cardio'||!!ex.kind,muscles=base?JSON.parse(JSON.stringify(base.muscles)):{};
 const extra=Object.entries(PROFILE_EXTRA).filter(([id,set])=>set.has(ex.id)&&!ex.pri.includes(id)&&!ex.sec.includes(id)).map(([id])=>[id,'support']);
 for(const[id,role]of [...ex.pri.map(id=>[id,'primary']),...ex.sec.filter(id=>!ex.pri.includes(id)).map(id=>[id,'support']),...extra])if(!muscles[id]){
  const stabilizer=['abs','obliques','lowback','forearms','cuff'].includes(id)&&role!=='primary';
  const start=role==='primary'?.42:.30,end=role==='primary'?.62:.44;
  const c=hold?[.58,.58,.58]:stabilizer?[.34,.37,.34]:[start,role==='primary'?.83:.60,end];
  muscles[id]={role:stabilizer?'stabilizer':role,concentric:c,eccentric:hold?[...c]:stabilizer?[...c]:[start,role==='primary'?.62:.46,end]};
 }
 const regions={};
 for(const[parent,m]of Object.entries(muscles)){
  const factors=MUSCLE_REGIONS[parent].map(([id])=>REGION_FACTORS[id]?REGION_FACTORS[id](ex.id):parent==='chest'?(INCLINE_CHEST.has(ex.id)?{pec_clavicular:1,pec_sternal:.80,pec_costal:.68}[id]:LOWER_CHEST.has(ex.id)?{pec_clavicular:.70,pec_sternal:.90,pec_costal:1}[id]:PULL_CHEST.has(ex.id)?{pec_clavicular:.35,pec_sternal:.90,pec_costal:1}[id]:{pec_clavicular:.80,pec_sternal:1,pec_costal:.88}[id]):1);
  /* области группы с разной долей — учебный региональный акцент, иначе общий профиль группы */
  const basis=factors.some(f=>f!==factors[0])?'illustrative-regional':'shared-group';
  MUSCLE_REGIONS[parent].forEach(([id,label,kind],i)=>{regions[id]={parent,label,kind,role:m.role,factor:factors[i],visible:kind!=='deep',profileBasis:basis};});
 }
 const names=ex.pri.map(id=>MUSCLE_NAMES[id]).join(', ');
 const notes=base?base.notes:{concentric:hold?'Удержание: мышцы сохраняют положение.':cyclic?'Циклическое движение: цвет показывает учебное распределение акцентов.':names+' участвуют в рабочей фазе.',eccentric:cyclic?'Продолжение цикла: вовлечённость меняется плавно.':'Мышцы контролируют возврат.',end:'Конечная точка: сохраняйте контроль и опору.',start:'Исходное положение: подготовьтесь к следующему повторению.'};
 ex.anim.catalogProfile={curveBasis:'illustrative',muscles,regions,notes,pair:ex.pri.some(id=>['lats','midback','lowback','glutes','hams','traps'].includes(id))?'back':'above',sources:[...(base?.sources||[]),...regionSources(ex.id,muscles),...REGION_ANATOMY_SOURCES],cyclic,hold,laterality:CATALOG_LATERALITY[ex.id]};
}
const CATALOG_LIMB_PROFILES={ua:[[0,5.4,5.5],[.18,7.2,6.8],[.45,6.8,6.4],[.78,5.2,4.7],[1,4.2,4]],fa:[[0,4.4,4.4],[.22,5.7,5.2],[.45,4.9,4.7],[.76,3.5,3.3],[1,2.6,2.7]],th:[[0,9.1,9],[.25,8.8,8.2],[.6,7.1,6.5],[1,5.2,5]],sh:[[0,5,5],[.27,5.7,5.7],[.57,4.4,4],[1,2.8,3]]};
function catalogLimbRadius(kind,t){
 const p=CATALOG_LIMB_PROFILES[kind];for(let i=1;i<p.length;i++)if(t<=p[i][0]){const a=p[i-1],b=p[i],q=(t-a[0])/(b[0]-a[0]);return[a[1]+(b[1]-a[1])*q,a[2]+(b[2]-a[2])*q];}return p.at(-1).slice(1);
}
function catalogLimbFrame(R,a,b,front=R.n){
 const z=V3.unit(V3.sub(b,a));let x=V3.sub(front,z.map(v=>v*V3.dot(front,z)));
 if(Math.hypot(...x)<1e-5)x=V3.cross(z,Math.abs(z[0])<.8?[1,0,0]:[0,0,1]);x=V3.unit(x);return{x,y:V3.unit(V3.cross(z,x)),z};
}
// Leg fronts follow the sagittal limb plane, even when a bent thigh passes the
// torso's forward normal. Projecting R.n alone would flip front/back at that point.
function catalogLimbFront(R,a,b,kind){return kind==='th'||kind==='sh'?V3.cross(R.x,V3.sub(b,a)):R.n;}
function catalogLimbPoint(R,a,b,kind,t,angle,extra=0){
 const f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),[r1,r2]=catalogLimbRadius(kind,t),c=V3.add(a,V3.sub(b,a),t);
 return V3.add(V3.add(c,f.x,(r1+extra)*Math.cos(angle)),f.y,(r2+extra)*Math.sin(angle));
}
function catalogMuscleSurfaces(R,profile,{coarse=false}={}){
 const faces=[],limbRows=coarse?5:10,limbCols=coarse?8:16,torsoCols=coarse?12:24;
 function clip(poly,key,bound,greater){
  const result=[];for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length],inside=v=>greater?v[key]>=bound-1e-10:v[key]<=bound+1e-10,ia=inside(a),ib=inside(b);
   if(ia)result.push(a);
   if(ia!==ib){const t=(bound-a[key])/(b[key]-a[key]);result.push({h:a.h+(b.h-a.h)*t,a:a.a+(b.a-a.a)*t,p:V3.add(a.p,V3.sub(b.p,a.p),t)});}
  }return result;
 }
 function patch(id,side,lo,hi,a0,a1,point){
  if(!profile.regions[id]?.visible)return;
  const heights=point.torso?CATALOG_RINGS.map(r=>r[0]):Array.from({length:limbRows+1},(_,i)=>i/limbRows),step=2*Math.PI/(point.torso?torsoCols:limbCols);
  for(let r=1;r<heights.length;r++)if(heights[r]>=lo&&heights[r-1]<=hi)for(let c=Math.floor(a0/step);c<Math.ceil(a1/step);c++){
   const corners=[[heights[r-1],c*step],[heights[r-1],(c+1)*step],[heights[r],c*step],[heights[r],(c+1)*step]].map(([h,a])=>({h,a,p:point(h,a)}));
   for(const ix of point.angleSign<0?[[0,1,3],[0,3,2]]:[[0,1,2],[1,3,2]]){
    let poly=ix.map(i=>corners[i]);const normal=V3.unit(V3.cross(V3.sub(poly[1].p,poly[0].p),V3.sub(poly[2].p,poly[0].p))).map(v=>v*(point.normalSign||1));
    for(const[key,bound,greater]of [['h',lo,true],['h',hi,false],['a',a0,true],['a',a1,false]]){poly=clip(poly,key,bound,greater);if(poly.length<3)break;}
    for(let i=1;i<poly.length-1;i++){
     const tri=[poly[0].p,poly[i].p,poly[i+1].p];if(Math.hypot(...V3.cross(V3.sub(tri[1],tri[0]),V3.sub(tri[2],tri[0])))<1e-8)continue;
     const points=tri.map(p=>V3.add(p,normal,.15));points.push(points[2]);faces.push({id,parent:profile.regions[id].parent,side,points,normal});
    }
   }
  }
 }
 for(const[side,sign]of [['L',-1],['R',1]]){
  const torso=(h,a)=>catalogTorsoPoint(R,h,sign*a);
  torso.normalSign=-sign;torso.angleSign=sign;torso.torso=true;
  for(const[id,lo,hi,a,b]of [['pec_clavicular',42,48,.08,1.08],['pec_sternal',33,41,.08,1.2],['pec_costal',27,32,.10,1.0],['abs',12,26,.05,.53],['obl_ext',10,29,.56,1.34],['lats',11,38,1.55,2.65],['midback',33,47,2.66,3.08],['lowback',11,30,2.72,3.08],['glute_max',0,9,1.64,3.04],['glute_lateral',2,10,1.13,1.63],['trap_upper',43,51,2.20,3.07],['trap_mid',38,43,2.31,2.66],['trap_lower',30,33,2.66,3.08]])patch(id,side,lo,hi,a,b,torso);
  const limb=(root,end,kind)=>{
   const a=R[root+side],b=R[end+side],f=catalogLimbFrame(R,a,b,catalogLimbFront(R,a,b,kind)),outward=V3.dot(f.y,R.x)*sign,orientation=Math.abs(outward)>.001?Math.sign(outward):sign;
   const point=(t,a)=>catalogLimbPoint(R,R[root+side],R[end+side],kind,t,a*orientation);point.normalSign=orientation;point.angleSign=orientation;return point;
  };
  for(const[id,lo,hi,a,b]of [['delt_f',.02,.30,-.70,.70],['delt_s',.02,.32,.73,1.76],['delt_r',.02,.30,1.80,2.75],['bi_long',.33,.84,.04,.80],['bi_short',.33,.84,-.80,-.04],['tri_long',.28,.86,2.46,3.91],['tri_lateral',.27,.85,1.68,2.42]])patch(id,side,lo,hi,a,b,limb('sh','el','ua'));
  patch('forearm_flex',side,.15,.78,-1.25,1.25,limb('el','wr','fa'));
  for(const[id,lo,hi,a,b]of [['quad_rectus',.15,.80,-.44,.44],['quad_lateral',.12,.82,.48,1.48],['quad_medial',.44,.91,-1.38,-.48],['ham_lateral',.16,.82,1.67,2.71],['ham_medial',.18,.84,2.77,4.45]])patch(id,side,lo,hi,a,b,limb('hip','kn','th'));
  patch('calf_lateral',side,.12,.59,2.08,3.12,limb('kn','an','sh'));patch('calf_medial',side,.12,.59,3.18,4.21,limb('kn','an','sh'));
 }
 return faces;
}
/* Мышечные зоны на манекене: те же учебные области, но на поверхности нового тела.
   Корпус: h — высота вдоль оси корпуса от середины тазобедренных суставов, угол от передней линии к боку и спине.
   Конечности: t — доля сегмента, угол от передней поверхности к латеральной. Дельты лежат на «шапке» плеча. */
/* нижняя область трапециевидной — между разгибателями спины (до 24) и межлопаточной областью (от 33), медиальнее
   широчайших: восходящая часть идёт от остистых отростков Th6–Th12 к основанию ости лопатки (OpenStax A&P 2e, 11.5) */
const MANNEQUIN_TORSO_PATCHES=[['pec_clavicular',43,51.8,.06,1.12],['pec_sternal',34,43,.06,1.22],['pec_costal',29,34,.08,1.02],['abs',3,29,.04,.5],['obl_ext',3,28,.56,1.36],
 ['lats',13,40.2,1.52,2.62],['serratus',28,39,1.24,1.5],['midback',33,51.8,2.62,3.1],['lowback',3,24,2.7,3.1],['glute_max',-5.3,4,1.72,3.1],['glute_lateral',-3.5,7,1.16,1.7],['trap_upper',50.8,59.8,2.05,3.1],['trap_mid',40.2,50.8,2.3,2.68],
 ['trap_lower',24,33,2.62,3.1]];
const MANNEQUIN_LIMB_PATCHES={
 ua:[['bi_long',.33,.84,.05,.8],['bi_short',.33,.84,-.8,-.05],['tri_long',.3,.86,2.5,3.9],['tri_lateral',.3,.85,1.7,2.45]],
 /* предплечье (угол 0 — ладонная сторона, +π/2 — лучевая, Mannequin.limbAxes): сгибатели — ладонная и локтевая стороны,
    плечелучевая — лучевая сторона верхних двух третей, разгибатели — тыльная сторона (OpenStax A&P 2e, 11.5) */
 fa:[['forearm_flex',.12,.76,-1.9,.7],['brachiorad',.05,.62,.75,1.65],['forearm_ext',.12,.76,1.7,4.35]],
 th:[['quad_rectus',.15,.8,-.44,.44],['quad_lateral',.12,.82,.48,1.48],['quad_medial',.44,.91,-1.38,-.48],['ham_lateral',.16,.82,1.67,2.71],['ham_medial',.18,.84,2.77,4.45],
  /* приводящие: внутренняя поверхность бедра — широко вверху (длинная, короткая, большая приводящие), узко ниже, до колена (тонкая, большая) */
  ['adductors',.04,.42,-1.8,-.5],['adductors',.42,.86,-1.8,-1.42]],
 sk:[['calf_lateral',.1,.56,2.05,3.12],['calf_medial',.1,.56,3.16,4.22]]
};
const MANNEQUIN_DELTS=[['delt_f',-.75,.75],['delt_s',.8,1.75],['delt_r',1.8,2.75]];
function mannequinMuscleSurfaces(R,profile,{coarse=false}={}){
 const faces=[],V=Mannequin.V,lift=.25;
 /* row(u) возвращает точку ряда (v, e): сечение ряда считается один раз — и для вершин, и для центров граней */
 const grid=(id,side,rows,cols,row)=>{
  if(!profile.regions[id]?.visible)return;
  const P=[];for(let r=0;r<=rows;r++){const at=row(r/rows);P.push([]);for(let c=0;c<=cols;c++)P[r].push(at(c/cols,lift));}
  for(let r=0;r<rows;r++){const at=row((r+.5)/rows);for(let c=0;c<cols;c++){
   const pts=[P[r][c],P[r][c+1],P[r+1][c+1],P[r+1][c]],mid=at((c+.5)/cols,0),out=at((c+.5)/cols,1);
   faces.push({id,parent:profile.regions[id].parent,side,points:pts,normal:V.unit(V.sub(out,mid)),anchor:mid});
  }}
 };
 const step=coarse?2:1;
 for(const side of ['L','R']){
  for(const[id,h0,h1,a0,a1]of MANNEQUIN_TORSO_PATCHES)grid(id,side,Math.max(1,Math.round((h1-h0)/(2.5*step))),Math.max(2,Math.round((a1-a0)/(.13*step))),u=>{const at=Mannequin.torsoRow(R,h0+(h1-h0)*u,side);return(v,e)=>at(a0+(a1-a0)*v,e);});
  for(const[kind,list]of Object.entries(MANNEQUIN_LIMB_PATCHES))for(const[id,t0,t1,a0,a1]of list)
   grid(id,side,Math.max(1,Math.round((t1-t0)/(.06*step))),Math.max(2,Math.round((a1-a0)/(.2*step))),u=>{const at=Mannequin.limbRow(R,kind,side,t0+(t1-t0)*u);return(v,e)=>at(a0+(a1-a0)*v,e);});
  /* дельтовидная: сектор «шапки» плечевого сустава, от верха вниз на ~95° */
  const ua=R.frames['ua'+side],g=side==='L'?1:-1,cap=V.add(V.add(R['sh'+side],ua.y,Mannequin.SH_CAP[0]),ua.x,g*Mannequin.SH_CAP[1]),lat=V.scale(ua.x,g),r=Mannequin.CAPS.sh;
  for(const[id,a0,a1]of MANNEQUIN_DELTS)grid(id,side,coarse?3:5,coarse?3:6,u=>(v,e)=>{
   const polar=(.18+.85*u)*Math.PI/2*1.05,az=a0+(a1-a0)*v,dir=V.add(V.add(V.scale(ua.y,Math.cos(polar)),ua.z,Math.sin(polar)*Math.cos(az)),lat,Math.sin(polar)*Math.sin(az));
   return V.add(cap,dir,r+e);
  });
 }
 return faces;
}
/* анимация каталога под инвентарь показа: если хват зависит от необязательного снаряда (catalogVariants), берётся его поза —
   выбор тот же, что у видимости деталей (GymEquipment.variantOf); копия запоминается, чтобы кеши фигуры не путались */
function catalogAnimFor(anim,has){
 const vs=anim&&anim.catalogVariants;if(!vs)return anim;
 const v=Object.keys(vs).find(k=>!has||has(k));if(!v)return anim;
 const memo=anim.catalogVariantAnims||(anim.catalogVariantAnims={});
 return memo[v]||(memo[v]={...anim,catalogRig:vs[v],catalogVariants:null,catalogVariantAnims:null,catalogVariant:v});
}
function catalogFigureAnim(anim){
 return {...anim,noGround:anim.catalogBasis==='mannequin'?false:anim.noGround,rig3d:anim.catalogRig,muscleProfile:anim.catalogProfile,camera:'above',cameras:anim.catalogCameras,sample:t=>({spatialT:t}),catalogRig:null};
}
/* lean — для вида «Анатомия»/«Скелет»: области манекена скрыты, их поверхности не нужны */
function catalogVolumeData(anim,t,index,has,coarse=false,lean=false){
 const R=anim.catalogRig(t),state=muscleFrame(anim,t,index),profile=motionProfile(anim);
 if(R.frames)return{exerciseId:anim.catalogId,pose:R,body:Mannequin.bodyData(R),stress:jointStressPoints(anim,R,t,index),surfaces:lean?[]:mannequinMuscleSurfaces(R,profile,{coarse}),values:state.values,sideValues:catalogSideValues(profile,state.values),regions:profile.regions,props:R.props.filter(s=>GymEquipment.visible(s,has)),torsoRings:[],limbProfiles:{}};
 return{exerciseId:anim.catalogId,pose:R,surfaces:catalogMuscleSurfaces(R,profile,{coarse}),values:state.values,sideValues:catalogSideValues(profile,state.values),regions:profile.regions,props:R.props.filter(s=>!s.optional||!has||has(s.optional)),torsoRings:CATALOG_RINGS,limbProfiles:CATALOG_LIMB_PROFILES};
}
