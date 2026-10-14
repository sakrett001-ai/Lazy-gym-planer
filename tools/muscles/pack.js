'use strict';
/* Упаковка мышц для приложения: qa/muscles/muscles.json (build_muscles.py + das3_import.py) → src/data/muscles.bin.
   node tools/muscles/pack.js [вход.json] [выход.bin]
   Формат: gzip от JSON {version, source, parts:{ключ: название}, muscles:[{name, side, part, group:[…], el, v, t0, t1, l0, sk}],
   sheets:[{name, side, part, group, bone, space, a, b, t}]}. Формат 3 (4.39.0) — с пластами sheets (межрёберные мышцы:
   края наружной поверхности a, b в рамке кости bone и толщина t, см; сетку строит Muscles.sheetMesh); читатели формата 2
   поле sheets пропускают.
   el — как во входном файле (точки и огибающие тела в рамках костей скелета), координаты округлены до 0,1 мм;
   служебные поля (имена сайтов MuJoCo, сила, длины волокон) не берутся. group — группы мышц приложения
   (MUSCLE_NAMES в 00-engine.js): по ним в разборе подсвечиваются мышцы упражнения; part — анатомическое название.
   v, t0, t1, l0, sk, x0 — объём брюшка, сухожилия, длина пути для рисования и кожа над брюшком в нейтральной позе,
   продление пути вдоль кости до начала брюшка (этап М2, volumes.js). */
const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib');
const root = path.resolve(__dirname, '../..');
const input = path.resolve(root, process.argv[2] || 'qa/muscles/muscles.json');
const output = path.resolve(root, process.argv[3] || 'src/data/muscles.bin');

/* семейство мышцы по имени модели → [ключ, русское название, группы приложения]. Порядок важен: первое совпадение */
const PARTS = [
  [/^DELT1$/, 'delt1', 'Дельтовидная, передняя часть', ['delt_f']],
  [/^DELT2$/, 'delt2', 'Дельтовидная, средняя часть', ['delt_s']],
  [/^DELT3(med|lat)?$/, 'delt3', 'Дельтовидная, задняя часть', ['delt_r']],
  [/^SUPSP$/, 'supsp', 'Надостная', ['cuff']], [/^INFSP(sup|inf)?$/, 'infsp', 'Подостная', ['cuff']], [/^SUBSC$/, 'subsc', 'Подлопаточная', ['cuff']],
  [/^TMIN$/, 'tmin', 'Малая круглая', ['cuff']], [/^TMAJ$/, 'tmaj', 'Большая круглая', ['lats']],
  [/^PECM1b?$/, 'pecm1', 'Большая грудная, ключичная часть', ['chest']],
  [/^PECM2[ac]?$/, 'pecm2', 'Большая грудная, грудинная часть', ['chest']],
  [/^PECM3b?$/, 'pecm3', 'Большая грудная, рёберная часть', ['chest']],
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
  [/^SPIN\d$/, 'spinalis', 'Остистая', ['lowback']],
  [/^MF_/, 'mf', 'Многораздельные', ['lowback']],
  [/^QL_/, 'ql', 'Квадратная поясницы', ['lowback']],
  [/^(Ps_|psoas$)/, 'psoas', 'Большая поясничная', ['hipflex']],
  [/^iliacus$/, 'iliacus', 'Подвздошная', ['hipflex']],
  [/^glmax\d$/, 'glmax', 'Большая ягодичная', ['glutes']],
  [/^glmed\d$/, 'glmed', 'Средняя ягодичная', ['glutes']],
  [/^glmin\d$/, 'glmin', 'Малая ягодичная', ['glutes']],
  [/^tfl$/, 'tfl', 'Напрягатель широкой фасции', ['hipflex']], [/^piri$/, 'piri', 'Грушевидная', []],
  [/^recfem$/, 'recfem', 'Прямая бедра', ['quads', 'hipflex']],
  [/^vasmed$/, 'vasmed', 'Медиальная широкая бедра', ['quads']],
  [/^vaslat$/, 'vaslat', 'Латеральная широкая бедра', ['quads']],
  [/^vasint$/, 'vasint', 'Промежуточная широкая бедра', ['quads']],
  [/^bflh$/, 'bflh', 'Двуглавая бедра, длинная головка', ['hams']],
  [/^bfsh$/, 'bfsh', 'Двуглавая бедра, короткая головка', ['hams']],
  [/^semimem$/, 'semimem', 'Полуперепончатая', ['hams']], [/^semiten$/, 'semiten', 'Полусухожильная', ['hams']],
  [/^addbrev$/, 'addbrev', 'Короткая приводящая', ['adductors']], [/^addlong$/, 'addlong', 'Длинная приводящая', ['adductors']],
  [/^addmag/, 'addmag', 'Большая приводящая', ['adductors']], [/^pect$/, 'pectineus', 'Гребенчатая', ['adductors', 'hipflex']], [/^grac$/, 'grac', 'Тонкая', ['adductors']], [/^sart$/, 'sart', 'Портняжная', ['hipflex']],
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
  /* мышцы шеи (4.35.0, anatomy.js) — без группы приложения: упражнений на шею в каталоге нет */
  [/^SCM\d$/, 'scm', 'Грудино-ключично-сосцевидная', []],
  [/^SPLcap\d$/, 'splcap', 'Ременная мышца головы', []], [/^SPLcerv\d$/, 'splcerv', 'Ременная мышца шеи', []],
  [/^SCALant\d$/, 'scalant', 'Передняя лестничная', []], [/^SCALmed\d$/, 'scalmed', 'Средняя лестничная', []],
  [/^SCALpost\d$/, 'scalpost', 'Задняя лестничная', []],
  [/^serr_ant/, 'serrant', 'Передняя зубчатая', ['serratus']],
  /* межрёберные (4.39.0, anatomy.js, раздел 7; intercostals.js) — пласты (sheets), без группы приложения, как мышцы шеи */
  [/^ICe\d+$/, 'icext', 'Наружные межрёберные', []], [/^ICi\d+$/, 'icint', 'Внутренние межрёберные', []],
];

/* объём и сухожилия (этап М2, volumes.js): длины путей — в нейтральной позе манекена, по тем же данным, что в приложении */
function withVolumes(out) {
  const M = require(path.join(root, 'src/js/09bm-mannequin.js')), Skeleton = require(path.join(root, 'src/js/09bq-skeleton.js'));
  const Muscles = require(path.join(root, 'src/js/09br-muscles.js')), { volumes } = require('./volumes.js');
  const skel = Skeleton.decode(zlib.gunzipSync(fs.readFileSync(path.join(root, 'src/data/skeleton.bin'))));
  const { ORIGIN } = require('./volumes.js');
  /* продление пути вдоль кости до начала брюшка (volumes.js, ORIGIN): та же радиальная координата, уровень — по анатомии */
  for (const m of out.muscles) {
    const y = ORIGIN[m.name.replace(/_[rl]$/, '')], p0 = m.el[0].s.p;
    if (y !== undefined && y > p0[1] + 1) m.x0 = [p0[0], y, p0[2]];
  }
  const R = M.catalogPose(M.neutral()), bound = Muscles.bind(out, skel), paths = Muscles.layoutDrawn(bound, Skeleton.frames(R, M.bodyData(R), skel.bones));
  const lengths = {}, fmax = {};
  out.muscles.forEach((m, i) => { lengths[m.name] = paths[i].length; fmax[m.name] = m.fmax; });
  /* кости концов пути — чтобы сухожилие рисовалось у своей кости при любом порядке точек (volumes.js, BELLY: at) */
  const ends = Object.fromEntries(out.muscles.map(m => { const ss = m.el.filter(e => e.s).map(e => e.s.bone[0]); return [m.name, [ss[0], ss.at(-1)]]; }));
  const vol = volumes(out.muscles.map(m => m.name), fmax, lengths, { stature: M.B.stature, mass: M.B.mass }, ends);
  const r1 = x => Math.round(x * 10) / 10;
  for (const m of out.muscles) { const v = vol[m.name]; m.v = r1(v.v); m.t0 = r1(v.t0); m.t1 = r1(v.t1); m.l0 = r1(lengths[m.name]); delete m.fmax; }
  /* кожа над брюшком (Muscles.SKIN_U): глубина пути под кожей d (см), направление к коже o — перпендикуляр к пути,
     в рамке кости начала (первая половина брюшка) или конца пути (вторая), и радиус кривизны кожи поперёк мышцы ρ (см):
     по ним мышца у кожи сплющивается и изгибается вдоль неё */
  /* кожа над мышцей — без складок подмышки (Mannequin.FOLDS): сплющивание у кожи считается по основной форме тела,
     складки только добавляют места над мышцами */
  const G = require('./geometry.js'), frames = Skeleton.frames(R, M.bodyData(R), skel.bones), sdf0 = M.noFolds(() => G.skinSDF(R)), sdf = p => M.noFolds(() => sdf0(p)), fine = Muscles.layoutDrawn(bound, frames, .5);
  const unit = v => { const n = Math.hypot(...v) || 1; return v.map(x => x / n); };
  out.muscles.forEach((m, i) => {
    const pts = fine[i].points, cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1], pts[k][2] - pts[k - 1][2]));
    const L = cum.at(-1), lb = L - m.t0 - m.t1, bones = [bound[i].el[0].s.i, bound[i].el.at(-1).s.i];
    m.sk = Muscles.SKIN_U.map(u => {
      const s = m.t0 + u * lb; let k = 1; while (k < pts.length - 1 && cum[k] < s) k++;
      const a = pts[k - 1], b = pts[k], w = cum[k] > cum[k - 1] ? (s - cum[k - 1]) / (cum[k] - cum[k - 1]) : 0;
      const p = a.map((x, j) => x + (b[j] - x) * w), t = unit(b.map((x, j) => x - a[j])), h = 1.5;   /* шаг 1,5 см — направление к коже сглажено по окрестности (у плеча кожа — стык частей) */
      const g = unit([0, 1, 2].map(j => { const q = p.slice(), r = p.slice(); q[j] += h; r[j] -= h; return sdf(q) - sdf(r); }));
      const gt = g[0] * t[0] + g[1] * t[1] + g[2] * t[2], o = unit(g.map((x, j) => x - gt * t[j])), inv = G.inverse(frames, bones[u < .5 ? 0 : 1]);
      const lo = unit(inv(o).map((x, j) => x - inv([0, 0, 0])[j]));
      /* радиус кривизны кожи поперёк мышцы (вдоль w = o × t) у ближайшей точки кожи q: f(q ± h·w) ≈ h²/(2ρ) */
      const d = -sdf(p), q = p.map((x, j) => x + o[j] * d), wv = unit([o[1] * t[2] - o[2] * t[1], o[2] * t[0] - o[0] * t[2], o[0] * t[1] - o[1] * t[0]]), hw = 2;
      const k2 = (sdf(q.map((x, j) => x + wv[j] * hw)) + sdf(q.map((x, j) => x - wv[j] * hw)) - 2 * sdf(q)) / (hw * hw);
      const rho = k2 > 1 / 200 ? Math.min(200, Math.max(3, 1 / k2)) : 200;
      return [r1(d), ...lo.map(x => Math.round(x * 100) / 100), Math.round(rho)];
    });
  });
  return out;
}
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
    return { name: m.name, side: m.side, part, group, el, fmax: m.fmax };
  });
  /* пласты (формат 3): края наружной поверхности в рамке кости — до 0,1 мм, толщина — до 0,01 мм */
  const sheets = (src.sheets || []).map(s => {
    const hit = PARTS.find(([re]) => re.test(s.name.replace(/_[rl]$/, '')));
    if (!hit) throw Error('пласт без семейства: ' + s.name);
    const [, part, title, group] = hit; parts[part] = title;
    return { name: s.name, side: s.side, part, group, bone: s.bone, space: s.space, a: s.a.map(r2), b: s.b.map(r2), t: s.t.map(x => Math.round(x * 1e3) / 1e3) };
  });
  return withVolumes({ version: 3, source: src.source, parts, muscles, sheets });
}
if (require.main === module) {
  const out = pack(JSON.parse(fs.readFileSync(input, 'utf8')));
  const raw = Buffer.from(JSON.stringify(out), 'utf8'), gz = zlib.gzipSync(raw, { level: 9 });
  fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, gz);
  console.log(`${path.relative(root, output)}: мышц ${out.muscles.length}, семейств ${Object.keys(out.parts).length}, ${(raw.length / 1024).toFixed(0)} КБ → gzip ${(gz.length / 1024).toFixed(0)} КБ`);
}
module.exports = { pack, PARTS };
