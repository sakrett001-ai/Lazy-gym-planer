/* ===================== ДЕМОНСТРАЦИИ v2 ===================== */
const MOTION_VERSION = '3.1';
const DEMO = Object.fromEntries(EX.map(ex => [ex.id, ex]));
function fixMotion(id, patch) { Object.assign(DEMO[id].anim, patch); }
fixMotion('bbrow', {
  A:Object.assign({hip:[85,104], torso:55, arm:{a:[180,180],hA:180}}, legsAt(100)),
  B:Object.assign({hip:[85,104], torso:55, arm:{ik:add(add([85,104],dir(55),20),[Math.cos(55*D2R),Math.sin(55*D2R)],16), b:'back',hA:180}}, legsAt(100))
});
// Use one coordinate system at both ends, so the wrist actually travels.
DEMO.bbrow.anim.A.arm = {ik:add(add([85,104],dir(55),52),[0,1],56.8),b:'back',hA:180};
const dbRow = DEMO.dbrow.anim;
dbRow.A.armN = {ik:add(add(dbRow.A.hip,dir(dbRow.A.torso),52),[0,1],56.8), b:'back',hA:180};
dbRow.B.armN = {ik:add(add(dbRow.B.hip,dir(dbRow.B.torso),16),[Math.cos(70*D2R),Math.sin(70*D2R)],13), b:'back',hA:180};
for (const id of ['cablerow','bandrow']) {
  const a = DEMO[id].anim, hip = a.A.hip, shoulder = add(hip,dir(0),52);
  a.A.torso = a.B.torso = 0;
  a.A.arm = {ik:add(shoulder,[52,22]),b:'back',hA:90};
  a.B.arm = {ik:add(shoulder,[14,26]),b:'back',hA:90};
}
fixMotion('deadlift', {sample(t) {
  const angle = 65*(1-t), shoulder = [100,105*(1-t)+43.1*t];
  return Object.assign({hip:add(shoulder,dir(angle),-52),torso:angle,arm:{a:[180,180],hA:180}},legsAt(100));
}});
fixMotion('rdl', {sample(t) {
  const a = (178.63-33.63*t)*D2R, hip = [100-83.65*Math.sin(a),180+83.65*Math.cos(a)];
  const torso = Math.asin(Math.min(.99,(100-hip[0])/52))/D2R;
  return Object.assign({hip,torso,arm:{a:[180,180],hA:180}},legsAt(100));
}});
fixMotion('kbswing', {sample(t) {
  const h = 1-(1-t)*(1-t), a = 207-117*t;
  return Object.assign({hip:[64+34*h,112-15.7*h],torso:60*(1-h),arm:{a:[a,a]}},legsAt(100));
}, timing:[.7,.08,1.2,.12]});
for (const id of ['crunch','declinecrunch']) {
  const a = DEMO[id].anim;
  a.A.flex = 0; a.B.flex = id === 'crunch' ? 34 : 40;
  a.B.torso = a.A.torso; a.B.head = 8;
}
for (const id of ['latraise','bandlatraise','cablelat','dbpress']) DEMO[id].anim.planarArms = true;
for (const id of ['pullup','chinup']) {
  const a = DEMO[id].anim, half = id === 'pullup' ? 34 : 15;
  a.A.c = [100,128]; a.B.c = [100,83];
  for (const P of [a.A,a.B]) {
    P.armR = {ik:[100+half,25.5],b:'fwd',hA:0};
    P.armL = {ik:[100-half,25.5],b:'back',hA:0};
  }
}
// A rigid handle and a fixed grip width for the front-view pulldown.
for (const [P,y] of [[DEMO.latpull.anim.A,30.5],[DEMO.latpull.anim.B,91]]) {
  P.armR = {ik:[143,y],b:'fwd',hA:0}; P.armL = {ik:[57,y],b:'back',hA:0};
}
// Keep the Smith bar on its rail, independent of wrist rotation.
const smith = DEMO.smithincline.anim;
smith.props = smith.props.map(p => p.k === 'plate' ? Object.assign({},p,{at:'grips'}) : p);
for (const P of [smith.A,smith.B]) {P.arm.ik[0] = 86; P.arm.hA = 0;}
// When landing from the jump, hands travel around the shoulder instead of
// through it. Interpolate arm angles for that transition, keeping the later
// ground-contact targets for the squat-to-plank transition.
const burpee = DEMO.burpee.anim;
const burpeeFrames = burpee.keys;
const burpeeArms = burpeeFrames.slice(0,2).map(P=>{
  const J=solveSide(P,null);return [angOf(sub(J.elN,J.sh)),angOf(sub(J.wrN,J.elN))];
});
burpeeArms[1]=burpeeArms[1].map((a,i)=>a<burpeeArms[0][i]?a+360:a);
burpee.sample=t=>{
  const x=Math.min(3-1e-9,Math.max(0,t*3)),i=Math.floor(x),q=x-i;
  const P=lerpSpec(burpeeFrames[i],burpeeFrames[i+1],q);
  if(i===0)P.arm={a:burpeeArms[0].map((a,j)=>a+(burpeeArms[1][j]-a)*q),hA:180*q};
  return P;
};
const eccFirst = new Set('pushup diamond dip bbbench dbbench dbincline smithincline dbfly hyper pikepush skull benchdip ohext bulgarian rdl squat goblet airsquat lunge legpress smithsquat inclinebb declinebb closegrip pullover declinepush goodmorning rollout'.split(' '));
const isometric = new Set(['plank','sideplank','hang']);
const MOTION_CUES = {
  bbrow:['Локти ведут снаряд к поясу. Корпус сохраняет положение.','Опускайте штангу подконтрольно, постепенно разгибая руки.'],
  dbrow:['Ведите локоть назад. Таз и грудная клетка не разворачиваются.','Верните гантель под плечо. Опора на скамью сохраняется.'],
  cablerow:['Тяните рукоять к животу, ведите локти назад.','Разгибайте руки с контролем, сохраняйте положение корпуса.'],
  bandrow:['Согните локти и подтяните ленту к поясу.','Верните руки вперёд без рывка и раскачивания корпуса.'],
  kbswing:['Разгибание таза сообщает гире движение. Руки остаются длинными.','Встречайте гирю отведением таза назад; не приседайте за ней.'],
  deadlift:['Отталкивайте пол ногами. Руки прямые, гриф движется вдоль ног.','Сначала отведите таз назад, затем сгибайте колени.'],
  rdl:['Таз назад, колени мягкие. Руки удерживают снаряд без сгибания.','Разогните таз, сохраняя контроль спины и прямые руки.'],
  crunch:['Приближайте рёбра к тазу, постепенно отрывая лопатки.','Разверните грудную клетку обратно, без броска на пол.'],
  declinecrunch:['Скручивайте грудную клетку к тазу; не садитесь целиком.','Плавно вернитесь на скамью, сохраняя контроль корпуса.'],
  latraise:['Ведите локти через стороны до уровня плеч.','Опускайте руки по дуге, без раскачивания.'],
  bandlatraise:['Поднимайте локти через стороны; плечи не тяните к ушам.','Плавно уменьшайте натяжение ленты.'],
  dbpress:['Выжмите гантели над головой без помощи поясницей.','Опускайте гантели подконтрольно к исходному положению.'],
  pullup:['Тяните корпус к неподвижной перекладине, направляя локти вниз.','Опускайтесь с контролем; кисти сохраняют хват.'],
  chinup:['Подтягивайте корпус к перекладине без раскачивания.','Плавно разгибайте руки, сохраняя хват.'],
  squat:['Сгибайте колени и тазобедренные суставы, опирайтесь всей стопой.','Разгибайте ноги и таз согласованно, без рывка корпусом.']
};
for (const ex of EX) {
  ex.anim.eccFirst = eccFirst.has(ex.id);
  ex.anim.hold = isometric.has(ex.id);
  ex.anim.cues = MOTION_CUES[ex.id] || [ex.tech[1] || ex.tech[0],ex.tech[ex.tech.length-1]];
}
/* Подсказки по фазам: [рабочая фаза (усилие), возврат]. Для удержаний — одна реплика. Для кардио — [разгон, приземление/возврат]. */
