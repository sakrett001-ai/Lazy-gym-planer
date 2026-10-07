const {test}=require('node:test');
const assert=require('node:assert/strict');
const {loadModel}=require('./biomechanics-audit');

test('eccentric-first movements show lowering instructions on descent and lifting instructions on ascent',()=>{
 const model=loadModel({fullApp:true}),motionFrame=model.get('motionFrame');
 const cases=[
  ['pushup',/^Опускайте грудную/,/^Оттолкните пол/],
  ['diamond',/^Сгибайте локти/,/^Разгибайте руки/],
  ['goblet',/^Согните колени/,/^Поднимитесь/],
  ['lunge',/^Опуститесь/,/^Поднимитесь/],
  ['bulgarian',/^Опускайте таз/,/^Поднимайтесь/],
  ['smithbench',/^Опускайте гриф/,/^Выжимайте вверх/],
  ['assistdip',/^Опускайтесь/,/^Выжимайте себя/],
  ['hacksquat',/^Опускайтесь/,/^Выжимайте вверх/],
  ['pullthrough',/^Отводите таз/,/^Выпрямляйтесь/]
 ];
 for(const[id,lowering,lifting]of cases){
  const ex=model.EX.find(ex=>ex.id===id),F={it:{ex},clock:1000,durations:[3000,200,1000,200]};
  const down=motionFrame(F);assert.equal(down.label,'Опускание',id);assert.match(down.cue,lowering,id);
  F.clock=3700;const up=motionFrame(F);assert.equal(up.label,'Подъём',id);assert.match(up.cue,lifting,id);
 }
});
