/* ---------- Пространственные риги 3.3: жим лёжа, присед, становая, жим стоя ---------- */
/* Жим лёжа: скамья вдоль Z, голова к малым Z. Корпус лежит (угол -90: «вверх» тела = +Z). */
const benchTop3=136;
function benchRig(t){
 const angle=-90,hipY=benchTop3-10;
 const R=body3([0,hipY,112],angle,0,12);
 /* корпус лежит вдоль скамьи (−Z к голове): таз в середине, голова на скамье, не за краем */
 /* гриф: вверху над плечами, внизу на нижней части груди — на 16 ближе к тазу (+Z); локти уходят вниз-к тазу */
 const barZ=R.sh[2]+4+16*t;
 const topY=R.sh[1]-Math.sqrt(Math.max(0,(FL.ua+FL.fa-1)**2-(R.sh[2]-barZ)**2));
 const y=topY+(hipY-10-topY)*t;
 for(const [s,sign]of [['L',-1],['R',1]]){
  arm3(R,s,[sign*34,y+3,barZ],[sign*.8,.6,.45],[0,-1,0]);  /* локти: наружу, вниз под скамью и к тазу (~60° к корпусу) */
  leg3(R,s,[sign*16,180,166],[0,-1,0],[0,0,1]);
 }
 const bar=[0,y,barZ];
 R.bar=bar;
 R.props=[...bench3(28,150,benchTop3,15),{kind:'barbell',c:bar},
  {kind:'line',a:[-40,topY-6,R.sh[2]-8],b:[-40,benchTop3+7,R.sh[2]-8],width:4,tone:'steel'},{kind:'line',a:[40,topY-6,R.sh[2]-8],b:[40,benchTop3+7,R.sh[2]-8],width:4,tone:'steel'},
  {kind:'line',a:[-40,topY+6,R.sh[2]-8],b:[-40,topY+6,R.sh[2]+2],width:3,tone:'steel'},{kind:'line',a:[40,topY+6,R.sh[2]-8],b:[40,topY+6,R.sh[2]+2],width:3,tone:'steel'}];
 R.contacts=[{p:[0,benchTop3,R.sh[2]],label:'Лопатки на скамье'},{p:[-16,184,166],label:'Стопы на полу'}];
 return R;
}
/* Присед со штангой на спине, стопы чуть шире плеч, носки развёрнуты. */
function squatRig(t){
 const angle=2+42*t, hipY=97+49*t, hipZ=98-28*t;
 const R=body3([0,hipY,hipZ],angle,-8*t,12);
 const bar=V3.add(V3.add(R.sh,R.u,1),R.n,-8);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*18,180,98],[sign*.35,0,1],[sign*.3,0,1]);
  /* хват за гриф на трапециях */
  const grip=V3.add(bar,[sign,0,0],33);
  arm3(R,s,V3.add(grip,R.n,-3.5),[sign*.3,1,-.6],R.n);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-18,184,98],label:'Вся стопа на полу'}];
 return R;
}
/* Становая тяга: гриф у голеней, движение вверх вдоль ног. */
function deadliftRig(t){
 const a0=62,a1=-2, angle=a0+(a1-a0)*t;
 /* опорные стопы неподвижны; таз идёт вверх и вперёд */
 const hip=[0,116-19*t,78+20*t];
 const R=body3(hip,angle,8-8*t,12);
 const bar=hangingBar3(R,25,103);  /* кисти остаются на грифе, руки выпрямлены */
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*13,180,100],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*25,bar[1]-3.5,bar[2]],[0,0,-1],[0,1,0]);
 }
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-13,184,100],label:'Середина стопы под грифом'}];
 return R;
}
/* Жим штанги стоя: гриф от ключиц вертикально над головой, голова уходит назад и возвращается. */
function ohpRig(t){
 const R=body3([0,97,98],-2,t<.5?-12*(1-t*2):0,12);
 const chestZ=R.sh[2]+8;
 const topY=R.sh[1]-Math.sqrt(Math.max(0,(FL.ua+FL.fa-1)**2-(chestZ-R.sh[2])**2));
 const lowY=R.sh[1]+2;
 const y=lowY+(topY-lowY)*t;
 /* в нижней трети гриф обходит голову: вперёд, затем назад над макушкой */
 const z=chestZ-(chestZ-R.sh[2]+2)*Math.max(0,(t-.45)/.55);
 for(const [s,sign]of [['L',-1],['R',1]]){
  leg3(R,s,[sign*11,180,98],[0,0,1],[0,0,1]);
  arm3(R,s,[sign*33,y+3,z],[sign*.6,.55,.45],[0,-1,0]);  /* локти под грифом и чуть впереди, не за спиной */
 }
 const bar=[0,y,z];
 R.bar=bar;R.props=[{kind:'barbell',c:bar}];
 R.contacts=[{p:[-11,184,98],label:'Стопы на ширине таза'}];
 return R;
}
spatialExercise('bbbench',benchRig,'side',['side','front','above'],{
 side:'Гриф опускается на нижнюю часть груди и уходит вверх и чуть к голове. Таз не отрывается от скамьи.',
 front:'Хват чуть шире плеч, предплечья в нижней точке почти вертикальны, локти не расходятся под 90°.',
 above:'Видны грудь, плечи и симметрия рук. Траекторию грифа относительно груди проверяйте также сбоку.'
});
spatialExercise('squat',squatRig,'side',['side','front','back'],{
 side:'Таз уходит назад одновременно со сгибанием коленей, гриф движется по вертикали над серединой стопы.',
 front:'Колени идут по направлению носков, не заваливаясь внутрь. Стопы чуть шире плеч, пятки на полу.',
 back:'Видны ягодичные и задняя поверхность бёдер. Таз не смещается в сторону; опора сохраняется на обеих стопах.'
});
spatialExercise('deadlift',deadliftRig,'side',['side','front'],{
 side:'Гриф движется вдоль голеней по вертикали; плечи немного впереди грифа в старте, спина прямая.',
 front:'Хват чуть шире ног, руки висят вертикально, стопы на ширине таза под грифом.'
});
spatialExercise('ohp',ohpRig,'side',['side','front'],{
 side:'Гриф уходит от ключиц вертикально вверх, голова отклоняется назад и возвращается под гриф.',
 front:'Хват чуть шире плеч, локти под грифом; корпус не отклоняется в стороны.'
});
