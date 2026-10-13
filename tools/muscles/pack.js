'use strict';
/* Упаковка мышц для приложения: qa/muscles/muscles.json (build_muscles.py + das3_import.py) → src/data/muscles.bin.
   node tools/muscles/pack.js [вход.json] [выход.bin]
   Формат: gzip от JSON {version, source, parts:{ключ: название}, muscles:[{name, side, part, group:[…], el}]}.
   el — как во входном файле (точки и огибающие тела в рамках костей скелета), координаты округлены до 0,1 мм;
   служебные поля (имена сайтов MuJoCo, сила, длины волокон) не берутся. group — группы мышц приложения
   (MUSCLE_NAMES в 00-engine.js): по ним в разборе подсвечиваются мышцы упражнения; part — анатомическое название. */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const input = path.resolve(root, process.argv[2] || 'qa/muscles/muscles.json');
const output = path.resolve(root, process.argv[3] || 'src/data/muscles.bin');

/* семейство мышцы по имени модели → [ключ, русское название, группы приложения]. Порядок важен: первое совпадение */
const PARTS = [
  [/^DELT1$/, 'delt1', 'Дельтовидная, передняя часть', ['delt_f']],
  [/^DELT2$/, 'delt2', 'Дельтовидная, средняя часть', ['delt_s']],
  [/^DELT3$/, 'delt3', 'Дельтовидная, задняя часть', ['delt_r']],
  [/^SUPSP$/, 'supsp', 'Надостная', []], [/^INFSP$/, 'infsp', 'Подостная', []], [/^SUBSC$/, 'subsc', 'Подлопаточная', []],
  [/^TMIN$/, 'tmin', 'Малая круглая', []], [/^TMAJ$/, 'tmaj', 'Большая круглая', ['lats']],
  [/^PECM1$/, 'pecm1', 'Большая грудная, ключичная часть', ['chest']],
  [/^PECM2$/, 'pecm2', 'Большая грудная, грудинная часть', ['chest']],
  [/^PECM3$/, 'pecm3', 'Большая грудная, рёберная часть', ['chest']],
  [/^pect_min/, 'pecmin', 'Малая грудная', ['chest']],
  [/^LAT\d$/, 'lat', 'Широчайшая спины', ['lats']],
  [/^CORB$/, 'corb', 'Клювовидно-плечевая', []],
  [/^TRIlong$/, 'trilong', 'Трёхглавая плеча, длинная головка', ['triceps']],
  [/^TRIlat$/, 'trilat', 'Трёхглавая плеча, латеральная головка', ['triceps']],
  [/^TRImed$/, 'trimed', 'Трёхглавая плеча, медиальная головка', ['triceps']],
  [/^ANC$/, 'anc', 'Локтевая', ['triceps']],
  [/^BIClong$/, 'biclong', 'Двуглавая плеча, длинная головка', ['biceps']],
  [/^BICshort$/, 'bicshort', 'Двуглавая плеча, короткая головка', ['biceps']],
  [/^BRA$/, 'bra', 'Плечевая', ['biceps']],
  [/^BRD$/, 'brd', 'Плечелучевая', ['forearms']],
  [/^SUP$/, 'sup', 'Супинатор', ['forearms']], [/^PT$/, 'pt', 'Круглый пронатор', ['forearms']], [/^PQ$/, 'pq', 'Квадратный пронатор', ['forearms']],
  [/^ECRL$/, 'ecrl', 'Длинный лучевой разгибатель запястья', ['forearms']],
  [/^ECRB$/, 'ecrb', 'Короткий лучевой разгибатель запястья', ['forearms']],
  [/^ECU$/, 'ecu', 'Локтевой разгибатель запястья', ['forearms']],
  [/^FCR$/, 'fcr', 'Лучевой сгибатель запястья', ['forearms']],
  [/^FCU$/, 'fcu', 'Локтевой сгибатель запястья', ['forearms']],
  [/^PL$/, 'pl', 'Длинная ладонная', ['forearms']],
  [/^FDS\d$/, 'fds', 'Поверхностный сгибатель пальцев', ['forearms']],
  [/^FDP\d$/, 'fdp', 'Глубокий сгибатель пальцев', ['forearms']],
  [/^EDC\d$/, 'edc', 'Разгибатель пальцев', ['forearms']],
  [/^EDM$/, 'edm', 'Разгибатель мизинца', ['forearms']],
  [/^EIP$/, 'eip', 'Разгибатель указательного пальца', ['forearms']],
  [/^EPL$/, 'epl', 'Длинный разгибатель большого пальца', ['forearms']],
  [/^EPB$/, 'epb', 'Короткий разгибатель большого пальца', ['forearms']],
  [/^FPL$/, 'fpl', 'Длинный сгибатель большого пальца', ['forearms']],
  [/^APL$/, 'apl', 'Длинная мышца, отводящая большой палец', ['forearms']],
  [/^rect_abd$/, 'rectabd', 'Прямая живота', ['abs']],
  [/^EO\d$/, 'eo', 'Наружная косая живота', ['obliques']],
  [/^IO\d$/, 'io', 'Внутренняя косая живота', ['obliques']],
  [/^IL_/, 'il', 'Подвздошно-рёберная', ['lowback']],
  [/^LTpT_/, 'ltpt', 'Длиннейшая, грудная часть', ['lowback']],
  [/^LTpL_/, 'ltpl', 'Длиннейшая, поясничная часть', ['lowback']],
  [/^MF_/, 'mf', 'Многораздельные', ['lowback']],
  [/^QL_/, 'ql', 'Квадратная поясницы', ['lowback']],
  [/^(Ps_|psoas$)/, 'psoas', 'Большая поясничная', []],
  [/^iliacus$/, 'iliacus', 'Подвздошная', []],
  [/^glmax\d$/, 'glmax', 'Большая ягодичная', ['glutes']],
  [/^glmed\d$/, 'glmed', 'Средняя ягодичная', ['glutes']],
  [/^glmin\d$/, 'glmin', 'Малая ягодичная', ['glutes']],
  [/^tfl$/, 'tfl', 'Напрягатель широкой фасции', []], [/^piri$/, 'piri', 'Грушевидная', []],
  [/^recfem$/, 'recfem', 'Прямая бедра', ['quads']],
  [/^vasmed$/, 'vasmed', 'Медиальная широкая бедра', ['quads']],
  [/^vaslat$/, 'vaslat', 'Латеральная широкая бедра', ['quads']],
  [/^vasint$/, 'vasint', 'Промежуточная широкая бедра', ['quads']],
  [/^bflh$/, 'bflh', 'Двуглавая бедра, длинная головка', ['hams']],
  [/^bfsh$/, 'bfsh', 'Двуглавая бедра, короткая головка', ['hams']],
  [/^semimem$/, 'semimem', 'Полуперепончатая', ['hams']], [/^semiten$/, 'semiten', 'Полусухожильная', ['hams']],
  [/^addbrev$/, 'addbrev', 'Короткая приводящая', []], [/^addlong$/, 'addlong', 'Длинная приводящая', []],
  [/^addmag/, 'addmag', 'Большая приводящая', []], [/^grac$/, 'grac', 'Тонкая', []], [/^sart$/, 'sart', 'Портняжная', []],
  [/^gasmed$/, 'gasmed', 'Икроножная, медиальная головка', ['calves']],
  [/^gaslat$/, 'gaslat', 'Икроножная, латеральная головка', ['calves']],
  [/^soleus$/, 'soleus', 'Камбаловидная', ['calves']],
  [/^tibant$/, 'tibant', 'Передняя большеберцовая', []], [/^tibpost$/, 'tibpost', 'Задняя большеберцовая', []],
  [/^perbrev$/, 'perbrev', 'Короткая малоберцовая', []], [/^perlong$/, 'perlong', 'Длинная малоберцовая', []],
  [/^edl$/, 'edl', 'Длинный разгибатель пальцев', []], [/^ehl$/, 'ehl', 'Длинный разгибатель большого пальца стопы', []],
  [/^fdl$/, 'fdl', 'Длинный сгибатель пальцев', []], [/^fhl$/, 'fhl', 'Длинный сгибатель большого пальца стопы', []],
  /* трапециевидная DAS3 по уровню начала: к ключице и от C6–C7 — верхняя (нисходящая) часть, от Th2–Th4 — средняя
     (поперечная; в приложении — и «середина спины»), от Th6–Th9 — нижняя (восходящая) */
  [/^trap_clav_|^trap_scap_[1-5]$/, 'trapsup', 'Трапециевидная, верхняя часть', ['traps']],
  [/^trap_scap_[6-8]$/, 'trapmid', 'Трапециевидная, средняя часть', ['traps', 'midback']],
  [/^trap_scap(_9|1\d)$/, 'trapinf', 'Трапециевидная, нижняя часть', ['traps']],
  [/^rhomboid_/, 'rhomb', 'Ромбовидные', ['midback']],
  [/^lev_scap_/, 'levscap', 'Поднимающая лопатку', []],
  [/^serr_ant/, 'serrant', 'Передняя зубчатая', []],
];

function pack(src) {
  const r2 = v => v.map(x => Math.round(x * 100) / 100), pt = s => ({ bone: s.bone, p: r2(s.p) });
  const parts = {}, muscles = src.muscles.map(m => {
    const base = m.name.replace(/_[rl]$/, ''), hit = PARTS.find(([re]) => re.test(base));
    if (!hit) throw Error('мышца без семейства: ' + m.name);
    const [, part, title, group] = hit; parts[part] = title;
    const el = m.el.map(e => {
      if (e.s) return { s: pt(e.s) };
      const w = e.w, o = { t: w.t, bone: w.bone, c: r2(w.c) };
      if (w.t === 'e') o.B = w.B.map(x => Math.round(x * 1000) / 1000);
      else { o.a = w.a.map(x => Math.round(x * 1e4) / 1e4); o.r = Math.round(w.r * 100) / 100; }
      o.side = w.side ? pt(w.side) : null;
      return { w: o };
    });
    return { name: m.name, side: m.side, part, group, el };
  });
  return { version: 1, source: src.source, parts, muscles };
}
if (require.main === module) {
  const out = pack(JSON.parse(fs.readFileSync(input, 'utf8')));
  const raw = Buffer.from(JSON.stringify(out), 'utf8'), gz = zlib.gzipSync(raw, { level: 9 });
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, gz);
  console.log(`${path.relative(root, output)}: мышц ${out.muscles.length}, семейств ${Object.keys(out.parts).length}, ${(raw.length / 1024).toFixed(0)} КБ → gzip ${(gz.length / 1024).toFixed(0)} КБ`);
}
module.exports = { pack, PARTS };
