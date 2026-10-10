const SOURCES_BY_EX = {
  kbswing:[['Мах гирей — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/']],
  cablerow:[['Горизонтальная тяга — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']],
  cablerowwide:[['Горизонтальная тяга — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/'],['Узкий и широкий хват в горизонтальной тяге — Padovan и др., 2025','https://jhk.termedia.pl/High-Density-Surface-Electromyography-Excitation-of-Prime-Movers-in-the-Narrow-vs,209550,0,2.html']],
  pushup:[['Отжимания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/']],
  airsquat:[['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  squat:[['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/']],
  bridge:[['Ягодичный мост — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']],
  hipthrust:[['Hip thrust — Contreras, Cronin, Schoenfeld','https://bretcontreras.com/wp-content/uploads/Barbell-Hip-Thrust.pdf']],
  latpull:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/']],
  latpullv:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],['Хват в тяге верхнего блока — Lusk и др., 2010','https://doi.org/10.1519/JSC.0b013e3181ddb0ab']],
  latpulluh:[['Тяга верхнего блока — ACE','https://www.acefitness.org/resources/everyone/exercise-library/158/seated-lat-pulldown/'],['Хват в тяге верхнего блока — Lusk и др., 2010','https://doi.org/10.1519/JSC.0b013e3181ddb0ab']],
  bulgarian:[['Болгарский выпад — Human Kinetics','https://us.humankinetics.com/blogs/excerpt/building-strength-for-soccer-with-the-rear-foot-elevated-split-squat']],
  ropepushdown:[['Лучшие упражнения на трицепс — ACE, 2011','https://acefitness.org/certifiednewsarticle/1562/ace-sponsored-research-best-triceps-exercises/']],
  ropecurl:[['Бицепс и плечелучевая при разном хвате — Kleiber и др., 2015','https://doi.org/10.3389/fphys.2015.00215']],
  chinup:[['Подтягивания обратным хватом — ACE','https://www.acefitness.org/resources/everyone/exercise-library/190/chin-ups/']]
};
const MOTION_SOURCES = [
  ['Мах гирей — NSCA','https://www.nsca.com/education/articles/kinetic-select/two-arm-kettlebell-swing/'],
  ['Горизонтальная тяга — ACE','https://www.acefitness.org/resources/everyone/exercise-library/48/seated-row/']
];

/* Контакт с опорой задаётся на всём движении, включая промежуточные позы. */
for(const id of ['pushup','diamond']){
  const handX=id==='pushup'?139:131;
  const sample=t=>{
    const a=71.7+(84.5-71.7)*t,f=a+90,toe=[15,182.5],ankle=add(toe,dir(f),-FL.toe);
    return {hip:add(ankle,dir(a),85),torso:a,leg:{a:[a+180,a+180],f},arm:{ik:[handX,182],b:'back',hA:90}};
  };
  fixMotion(id,{sample});
}
const bridgeTopKnee=ik2([58,176],[146,180],FL.torso+FL.th,FL.sh,'up')[0];
const bridgeTopAngle=angOf(sub([58,176],bridgeTopKnee));
fixMotion('bridge',{sample(t){
  const a=-90+(bridgeTopAngle+90)*t;
  return {hip:hipFromSh([58,176],a),torso:a,head:-90-a,arm:{a:[101,90],hA:90},leg:{ik:[146,180],b:'up',f:90}};
}});
const thrustTopKnee=ik2([74,128],[166,180],FL.torso+FL.th,FL.sh,'up')[0];
const thrustTopAngle=angOf(sub([74,128],thrustTopKnee));
fixMotion('hipthrust',{sample(t){
  const a=-55+(thrustTopAngle+55)*t;
  return {hip:hipFromSh([74,128],a),torso:a,head:18+10*t,arm:{tf:[2,13.5],hA:a+90,b:'up'},leg:{ik:[166,180],b:'up',f:90}};
}});
fixMotion('squat',{sample(t){
  const a=8+36*t,hip=[98-53*Math.sin(a*D2R)+10*Math.cos(a*D2R),97+49*t];
  const bar=add(add(hip,dir(a),53),[Math.cos(a*D2R),Math.sin(a*D2R)],-10);
  return Object.assign({hip,torso:a,arm:{ik:add(bar,[-1,0],3.5),b:'down',hA:90}},legsAt(98));
}});
// Kneeling support rests on the top of the bench, with a full-length thigh.
for(const P of [DEMO.dbrow.anim.A,DEMO.dbrow.anim.B]){
  P.legF={a:[angOf([Math.sqrt(43*43-32*32),32]),270],f:270};
  P.armF={ik:[122,134],b:'back',hA:90};
}
// Stationary holds use one stable support pose instead of a subtle rocking loop.
DEMO.plank.anim.sample=()=>({hip:add([5,171],dir(81.6),85),torso:81.6,leg:{a:[261.6,261.6],fr:-90},arm:{a:[180,90],hA:90}});
const MOTION_FOCUS={
 pushup:{setup:'Ладони на полу, корпус собран.',control:'Ладони и носки сохраняют опору; таз движется вместе с грудью.'},
 diamond:{setup:'Поставьте ладони близко под грудью.',control:'Сохраняйте линию корпуса и ведите локти вдоль него.'},
 squat:{setup:'Устойчиво поставьте стопы и удерживайте гриф на спине.',control:'Сгибайте таз и колени согласованно; опора всей стопой.'},
 goblet:{setup:'Держите снаряд перед грудью, близко к телу.',control:'Выбирайте глубину, на которой сохраняете опору и контроль корпуса.'},
 airsquat:{setup:'Стопы устойчивы, колени направлены в сторону носков.',control:'Таз и колени сгибаются вместе; пятки остаются на полу.'},
 lunge:{setup:'Передняя стопа на полу, задняя — на носке.',control:'Опускайтесь между стопами, сохраняя равновесие. Выполните обе стороны.'},
 bridge:{setup:'Лягте на спину, согните колени и поставьте стопы на пол.',control:'Плечи и стопы сохраняют опору, таз поднимается без переразгибания спины.'},
 hipthrust:{setup:'Верх спины опирается на край скамьи, стопы устойчивы.',control:'Движется таз; опора спиной сохраняется. Завершайте подъём без прогиба.'},
 dbrow:{setup:'Колено и ладонь опираются на скамью.',control:'Локоть движется к тазу; опорная рука и корпус сохраняют положение.'},
 ropepushdown:{setup:'Локти прижаты к бокам, канат в ладонях, узлы под мизинцами.',control:'Плечи неподвижны; внизу концы каната расходятся к бёдрам.'},
 ropecurl:{setup:'Лицом к нижнему блоку, канат в ладонях, большие пальцы вверх.',control:'Локти у корпуса, кисти — продолжение предплечий; корпус не отклоняется.'},
 cablerowwide:{setup:'Стопы на упорах, колени слегка согнуты, хват сверху шире плеч.',control:'Локти в стороны и назад, гриф к нижней части груди; корпус отклоняется не больше чем на 10–15°.'},
 latpullv:{setup:'Бёдра под валиками, ладони на V-рукояти смотрят друг на друга.',control:'Локти вниз вдоль корпуса, рукоять перед лицом к груди; корпус не раскачивается.'},
 latpulluh:{setup:'Бёдра под валиками, хват снизу примерно на ширине плеч.',control:'Локти вниз вдоль корпуса, рукоять перед лицом к груди; корпус не раскачивается.'},
 bbrow:{setup:'Наклоните корпус и удерживайте его положение.',control:'Движение создаёт тяга руками; корпус не подбрасывает штангу.'},
 deadlift:{setup:'Снаряд близко к ногам, руки прямые.',control:'Разгибайте таз и колени согласованно, сохраняйте снаряд близко к телу.'},
 rdl:{setup:'Снаряд в прямых руках, колени немного согнуты.',control:'Отводите таз назад; глубину ограничивает контроль спины.'},
 kbswing:{setup:'Стопы устойчивы, руки удерживают гирю.',control:'Разгибание таза задаёт мах; локти остаются разогнутыми.'},
 plank:{setup:'Предплечья и носки образуют опору.',control:'Сохраняйте положение таза и грудной клетки, продолжайте дышать.'},
 latraise:{setup:'Гантели у бёдер, локти слегка согнуты.',control:'Руки движутся по дуге; корпус сохраняет положение.'}
};
DEMO.pushup.anim.cues=['Оттолкните пол, поднимая корпус как единое целое.','Опускайте грудную клетку и таз вместе, сохраняя опору ладонями и носками.'];
DEMO.pushup.tech[1]='Сгибайте локти и опускайте грудь, сохраняя устойчивую опору и контроль корпуса. Подберите доступную амплитуду без провисания таза.';
DEMO.diamond.anim.cues=['Разгибайте руки и поднимайте корпус без провисания таза.','Сгибайте локти, сохраняя положение ладоней и линию корпуса.'];
DEMO.bridge.anim.cues=['Поднимите таз, сохраняя опору плечами и стопами.','Плавно опустите таз в исходное положение.'];
DEMO.hipthrust.anim.cues=['Разогните таз до линии корпуса и бёдер без переразгибания.','Плавно опустите таз, сохраняя опору спиной на скамью.'];
DEMO.goblet.tech[2]='Опуститесь до глубины, на которой сохраняются устойчивая опора и контроль спины, затем поднимитесь.';
DEMO.goblet.anim.cues=['Поднимитесь, удерживая стопы на полу и контролируя корпус.','Согните колени и таз, сохраняя снаряд близко к груди.'];
DEMO.lunge.tech[2]='Переднее колено движется в направлении носка. Сохраняя равновесие, поднимитесь в исходное положение.';
DEMO.lunge.anim.cues=['Поднимитесь с опорой на переднюю стопу; затем выполните другую сторону.','Опуститесь между стопами, сохраняя равновесие.'];
MOTION_SOURCES.push(
 ['Отжимания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/41/push-up/'],
 ['Приседания — ACE','https://www.acefitness.org/resources/everyone/exercise-library/135/bodyweight-squat/'],
 ['Ягодичный мост — ACE','https://www.acefitness.org/resources/everyone/exercise-library/49/glute-bridge/']
);
