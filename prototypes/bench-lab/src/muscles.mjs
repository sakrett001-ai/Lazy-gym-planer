import {smooth} from './model.mjs';
/* Regions describe educational surface zones, not independently isolatable muscles. */
export const MUSCLE_TREE = Object.freeze({
  pectoralis_major:{label:'Большая грудная',regions:{
    pec_clavicular:{label:'Грудные · верх',anatomy:'Ключичная часть',scope:'region'},
    pec_sternal:{label:'Грудные · середина',anatomy:'Средняя область грудино-рёберной части',scope:'region'},
    pec_costal:{label:'Грудные · низ',anatomy:'Нижняя область грудино-рёберной части',scope:'region'}}},
  deltoid:{label:'Дельтовидная',regions:{delt_anterior:{label:'Передняя дельта',anatomy:'Передняя часть',scope:'region'},
    delt_middle:{label:'Средняя дельта',scope:'not-profiled'},delt_posterior:{label:'Задняя дельта',scope:'not-profiled'}}},
  triceps_brachii:{label:'Трёхглавая',regions:{triceps_long:{label:'Длинная головка',scope:'shared-group-profile'},
    triceps_lateral:{label:'Латеральная головка',scope:'shared-group-profile'},triceps_medial:{label:'Медиальная головка',scope:'deep-not-drawn'}}}
});
export const SOURCES = Object.freeze([
  {url:'https://pubmed.ncbi.nlm.nih.gov/33049982/',label:'Rodríguez-Ridao et al., 2020',supports:'Различия региональной ЭМГ между наклонами; не численные кривые цвета.'},
  {url:'https://pubmed.ncbi.nlm.nih.gov/25799093/',label:'Lauver et al., 2016',supports:'Региональные различия по участкам повторения; результаты зависят от условий опыта.'}
]);
export const REGIONS = Object.freeze([
  {id:'pec_clavicular',label:'Грудные · верх',role:'Основная',detail:'Ключичная часть. Наклон 30° смещает учебный акцент в её сторону.'},
  {id:'pec_sternal',label:'Грудные · середина',role:'Основная',detail:'Средняя область грудино-рёберной части. Работает вместе с другими областями груди.'},
  {id:'pec_costal',label:'Грудные · низ',role:'Основная',detail:'Нижняя область грудино-рёберной части. Граница на модели условная.'},
  {id:'delt_anterior',label:'Передняя дельта',role:'Помощник',detail:'При наклоне меняется распределение работы груди и плеча.'},
  {id:'triceps',label:'Трицепс',role:'Помощник',detail:'Общий профиль: длинная и латеральная головки окрашены вместе. Отдельные кривые головок ещё не заданы.'}
]);
const profile=(top,middle,bottom)=>({concentric:[top,middle,bottom],eccentric:[top,middle*.76,bottom]});
export const PROFILES = {
  flat:{basis:'illustrative',sources:SOURCES.map(s=>s.url),regions:{
    pec_clavicular:profile(.30,.64,.50),pec_sternal:profile(.38,.93,.72),pec_costal:profile(.36,.87,.68),
    delt_anterior:profile(.30,.58,.47),triceps:profile(.50,.74,.42)}},
  incline:{basis:'illustrative',sources:SOURCES.map(s=>s.url),regions:{
    pec_clavicular:profile(.38,.94,.73),pec_sternal:profile(.34,.74,.59),pec_costal:profile(.29,.58,.47),
    delt_anterior:profile(.35,.76,.60),triceps:profile(.50,.74,.42)}}
};
export function muscleValues(frame,variant='flat',profiles=PROFILES){
  const p=profiles[variant];if(!p)throw Error('Missing muscle profile');
  if(!['eccentric','concentric','holdBottom','holdTop'].includes(frame.phase))throw Error('Unknown phase');
  const t=frame.depth;if(!Number.isFinite(t)||t<0||t>1)throw Error('Invalid muscle position');
  const curve=frame.phase==='eccentric'?'eccentric':'concentric',i=t<.5?0:1,q=smooth((t-i*.5)*2);
  return Object.fromEntries(REGIONS.map(r=>{const a=p.regions[r.id]?.[curve];if(!a)throw Error('Missing region curve');return[r.id,a[i]+(a[i+1]-a[i])*q];}));
}
export function band(v){return v<.45?'Ниже':v<.72?'Средняя':'Выше';}
export function color(v){
  if(!Number.isFinite(v)||v<0||v>1)throw Error('Invalid brightness');
  const stops=[[152,166,185],[239,176,93],[241,93,66]],x=v*2,i=Math.min(1,Math.floor(x)),q=x-i;
  return '#'+stops[i].map((c,k)=>Math.round(c+(stops[i+1][k]-c)*q).toString(16).padStart(2,'0')).join('');
}
