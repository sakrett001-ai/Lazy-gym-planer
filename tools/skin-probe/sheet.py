"""Контактный лист пробы кожи: ряды кадров (render.mjs) и таблицы под ними.

python3 tools/skin-probe/sheet.py --work <папка с результатами> --out contact-sheet.png
Берёт: fit.json (+ -verts/-faces.npy) — Anny после подгонки; m461.json / mpost.json — выгрузки манекена;
reg-461.json / reg-post.json (+ -bones.json) — вписывание скелетов.
"""
import argparse, json, os, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
ap = argparse.ArgumentParser(); ap.add_argument('--work', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--fit', default='fit.json')
a = ap.parse_args(); W = a.work
J = lambda f: json.load(open(os.path.join(W, f)))
REF = json.load(open(os.path.join(ROOT, 'tools/mannequin/anthro-ansur2.json')))['values']
fit = J(a.fit); fb = os.path.join(W, a.fit.replace('.json', ''))
V = np.load(fb + '-verts.npy'); F = np.load(fb + '-faces.npy')
m461 = J('m461.json'); mpost = J('mpost.json'); r461 = J('reg-461.json'); rpost = J('reg-post.json')
b461 = J('reg-461-bones.json'); bpost = J('reg-post-bones.json')
mesh = {'pos': np.round(V, 2).ravel().tolist(), 'idx': F.ravel().tolist()}

def bones_of(B, key='segments', skip=('finger', 'thumb')):
    return [{'pos': b['pos'], 'idx': b['idx']} for b in B[key] if not any(k in b['name'] for k in ('proxph', 'midph', 'distph', 'thumb'))]

def red_marks(reg, B, key='segments', lim=.0):
    """вершины костей снаружи кожи Anny — красные точки (из анализа: кости с выходом)"""
    import trimesh
    sk = trimesh.Trimesh(V, F, process=False); pq = trimesh.proximity.ProximityQuery(sk)
    marks = []
    for b in B[key]:
        if b['name'] in ('foot', 'toes', 'talus') or any(k in b['name'] for k in ('ph', 'mc', 'thumb', 'lunate', 'scaphoid', 'pisiform', 'triquetrum', 'capitate', 'trapez', 'hamate')):
            continue
        P = np.array(b['pos']).reshape(-1, 3)[::3]
        d = np.concatenate([pq.signed_distance(P[i:i + 1500]) for i in range(0, len(P), 1500)])
        for p in P[d < lim]:
            marks.append({'p': p.round(2).tolist(), 'r': .45, 'color': '#ff3b30'})
    return marks

C = [0, 88, 2]; full = 120
row_m = [{'label': f'манекен 4.61.0 · {n}', 'cam': c, 'center': C, 'span': full, 'body': 'mannequin'} for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'), ('angle', 'три четверти'))]
row_a = [{'label': f'Anny под ANSUR II · {n}', 'cam': c, 'center': C, 'span': full, 'body': 'mesh', 'mesh': mesh} for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'), ('angle', 'три четверти'))]

def skel_row(reg, B, title):
    marks = red_marks(reg, B)
    bl = bones_of(B)
    P = lambda **k: {'body': 'mesh', 'mesh': mesh, 'ghost': True, 'bones': bl, 'marks': marks, **k}
    return [P(label=f'{title} · сбоку', cam='side', center=C, span=full),
            P(label=f'{title} · сзади', cam='back', center=C, span=full),
            P(label='шея и верх спины · сбоку', cam='side', center=[0, 140, -2], span=42),
            P(label='лопатки · сзади', cam='back', center=[0, 134, -6], span=46),
            P(label='верх спины · сзади-сбоку', cam='rear', center=[0, 136, -6], span=46)]

def mann_row(B, root_label, mann_body):
    return None

rows = [
    {'title': 'Наш манекен 4.61.0 (кожа приложения, вид «Манекен»)', 'panels': row_m},
    {'title': 'Anny под ANSUR II — тот же материал, стойка манекена, одинаковые камеры и масштаб', 'panels': row_a},
    {'title': 'Скелет 4.61.0 в Anny (вписан по ориентирам, сдвиги по сегментам)', 'note': 'Полупрозрачная кожа Anny, кости MyoSim; красные точки — вершины костей снаружи кожи Anny.', 'panels': skel_row(r461, b461, 'скелет 4.61.0')},
    {'title': 'Скелет с осанкой (ветка feat/anatomy-posture, 9f13c1f) в Anny', 'panels': skel_row(rpost, bpost, 'скелет с осанкой')},
]

# ---------------- таблицы ----------------
def cls(v, lo, hi):
    if v is None: return 'dim'
    return 'ok' if lo <= v <= hi else ('warn' if lo - .5 <= v <= hi + .5 else 'bad')
def f1(v, d=1): return '—' if v is None else f'{v:.{d}f}'.replace('.', ',')

NAMES = {'stature': 'Рост', 'crotchheight': 'Высота промежности', 'cervicaleheight': 'Высота C7*', 'acromialheight': 'Высота акромиона*',
         'suprasternaleheight': 'Высота яремной вырезки*', 'iliocristaleheight': 'Высота гребня таза*', 'trochanterionheight': 'Высота вертела*',
         'kneeheightmidpatella': 'Высота середины надколенника*', 'lateralmalleolusheight': 'Высота наружной лодыжки*', 'wristheight': 'Высота запястья*',
         'biacromialbreadth': 'Ширина по акромионам*', 'bicristalbreadth': 'Ширина таза по гребням*',
         'chestcircumference': 'Обхват груди', 'chestbreadth': 'Ширина груди', 'chestdepth': 'Глубина груди', 'waistcircumference': 'Обхват талии',
         'waistbreadth': 'Ширина талии', 'waistdepth': 'Глубина талии', 'buttockcircumference': 'Обхват ягодиц', 'buttockdepth': 'Глубина ягодиц',
         'hipbreadth': 'Ширина бёдер', 'bideltoidbreadth': 'Ширина по дельтам', 'shouldercircumference': 'Обхват плеч', 'neckcircumference': 'Обхват шеи',
         'neckcircumferencebase': 'Обхват основания шеи', 'bicepscircumferenceflexed': 'Обхват плеча', 'forearmcircumferenceflexed': 'Обхват предплечья',
         'wristcircumference': 'Обхват запястья', 'thighcircumference': 'Обхват бедра', 'lowerthighcircumference': 'Обхват над коленом',
         'calfcircumference': 'Обхват голени', 'anklecircumference': 'Обхват над лодыжками', 'headcircumference': 'Обхват головы', 'headlength': 'Длина головы',
         'headbreadth': 'Ширина головы', 'footlength': 'Длина стопы', 'footbreadthhorizontal': 'Ширина стопы', 'weightkg': 'Масса, кг (Anny — объём × 1,04)'}
man = {r['key']: r['value'] for r in m461['anthro']}
am = dict(fit['measures'])
# высоты и ширины по костным точкам у Anny — по вписанному скелету 4.61.0 (те же точки, что anthro.js у манекена)
L = r461['anny_segments']['landmarks']; segs = r461['shift_segments']
def lmh(k): return L[k]['p'][1]
am['cervicaleheight'] = lmh('C7'); am['acromialheight'] = lmh('acromionL'); am['suprasternaleheight'] = lmh('jugular')
am['iliocristaleheight'] = lmh('iliacCrestL'); am['trochanterionheight'] = None; am['kneeheightmidpatella'] = None
am['lateralmalleolusheight'] = lmh('latMalleolusL'); am['wristheight'] = lmh('radialStyloidL')
am['biacromialbreadth'] = 2 * (L['acromionL']['p'][0] + .5); am['bicristalbreadth'] = None
order = ['stature', 'crotchheight', 'cervicaleheight', 'acromialheight', 'suprasternaleheight', 'iliocristaleheight', 'lateralmalleolusheight', 'wristheight',
         'biacromialbreadth', 'bideltoidbreadth', 'chestcircumference', 'chestbreadth', 'chestdepth', 'waistcircumference', 'waistbreadth', 'waistdepth',
         'buttockcircumference', 'buttockdepth', 'hipbreadth', 'shouldercircumference', 'neckcircumference', 'neckcircumferencebase',
         'bicepscircumferenceflexed', 'forearmcircumferenceflexed', 'wristcircumference', 'thighcircumference', 'lowerthighcircumference',
         'calfcircumference', 'anklecircumference', 'headcircumference', 'headlength', 'headbreadth', 'footlength', 'footbreadthhorizontal', 'weightkg']
def zc(v, k):
    p25, p50, p75 = REF[k]
    if v is None: return 'dim'
    return 'ok' if p25 <= v <= p75 else ('warn' if abs(v - p50) <= 1.349 * (p75 - p25) else 'bad')
rows_html = ''.join(f"<tr><td>{NAMES.get(k, k)}</td><td>{f1(REF[k][1])} <span class='small'>({f1(REF[k][0])}–{f1(REF[k][2])})</span></td><td class='{zc(man.get(k), k)}'>{f1(man.get(k))}</td><td class='{zc(am.get(k), k)}'>{f1(am.get(k))}</td></tr>" for k in order)
ins = sum(1 for k in order if am.get(k) is not None and REF[k][0] <= am[k] <= REF[k][2]); tot = sum(1 for k in order if am.get(k) is not None)
insm = sum(1 for k in order if man.get(k) is not None and REF[k][0] <= man[k] <= REF[k][2])
t_ansur = f"<table><tr><th>Замер</th><th>ANSUR II медиана (p25–p75)</th><th>манекен 4.61.0</th><th>Anny после подгонки</th></tr>{rows_html}</table><p class='small'>В средней половине людей: манекен {insm} из {len(order)}, Anny {ins} из {tot}. Зелёный — p25–p75, жёлтый — до 1 IQR от медианы, красный — дальше. * — по костным точкам: у манекена anthro.js, у Anny — точки вписанного скелета 4.61.0. Anny: фенотип {', '.join(f'{k} {v:.2f}' for k, v in fit['phen'].items())}; возраст 27 лет (шкала MakeHuman), пол мужской.</p>"

def lm_rows(keys):
    out = ''
    for k in keys:
        a0 = r461['mannequin']['landmarks'][k]; lo, hi = a0['lo'], a0['hi']
        vals = [r461['mannequin']['landmarks'][k]['depth'], r461['anny_segments']['landmarks'][k]['depth'], rpost['mannequin']['landmarks'][k]['depth'], rpost['anny_segments']['landmarks'][k]['depth']]
        out += f"<tr><td>{a0['name']}</td><td>{f1(lo)}–{f1(hi)} <span class='small'>{a0['src']}</span></td>" + ''.join(f"<td class='{cls(v, lo, hi)}'>{f1(v)}</td>" for v in vals) + '</tr>'
    return out
LMK = ['C7', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'jugular', 'sternum', 'acromionL', 'clavicleL', 'scapSpineL', 'supAngleL', 'infAngleL',
       'iliacCrestL', 'ASISL', 'PSISL', 'sacrum', 'trochanterL', 'patellaL', 'tibialCrestL', 'fibulaHeadL', 'latMalleolusL', 'medMalleolusL', 'olecranonL',
       'latEpicondyleL', 'medEpicondyleL', 'radialStyloidL', 'ulnarStyloidL', 'vertex', 'glabella']
t_lm = f"<table><tr><th>Ориентир (левая сторона)</th><th>норма, см</th><th>манекен 4.61.0 + скелет 4.61.0</th><th>Anny + скелет 4.61.0</th><th>манекен ветки осанки + её скелет</th><th>Anny + скелет с осанкой</th></tr>{lm_rows(LMK)}</table>" \
       "<p class='small'>Толщина мягких тканей — от точки кости до кожи (ближайшее расстояние), минус — кость снаружи кожи. Источники: S18 — Störchle 2018 (УЗИ, подкожный слой + кожа), L21 — Lemon 2021 (КТ, над грудиной 1,8 ± 0,9), S14 — Seol 2014 (УЗИ, до ромбовидной 14–18 мм), DG06 — De Greef 2006 (лицо), ор — ориентир по анатомии слоёв, без отдельного источника (проверить на следующем шаге). Anny — после вписывания по сегментам.</p>"

def shift_rows(reg):
    S = reg['shift_segments']; names = {'pelvis': 'таз', 'thorax': 'грудная клетка', 'neck': 'шея и голова', 'girdleL': 'пояс (ключица, лопатка)', 'uaL': 'плечо', 'faL': 'предплечье', 'thL': 'бедро', 'skL': 'голень'}
    return ''.join(f"<td>{f1(S[k][0])} / {f1(S[k][1])} / {f1(S[k][2])}</td>" for k in names), ''.join(f'<th>{v}</th>' for v in names.values())
s1, hdr = shift_rows(r461); s2, _ = shift_rows(rpost)
t_shift = f"<table><tr><th>Сдвиг сегмента, см (наружу / вверх / вперёд)</th>{hdr}</tr><tr><td>скелет 4.61.0</td>{s1}</tr><tr><td>скелет с осанкой</td>{s2}</tr></table><p class='small'>Сдвиги, при которых ориентиры ближе всего к норме (цена: 2 см сдвига = 0,3 см выхода из нормы; разрыв сустава 1 см — тоже). Сдвиг целиком: 4.61.0 {r461['shift_global']['pelvis'][1]:+.1f} вверх, {r461['shift_global']['pelvis'][2]:+.1f} вперёд; осанка {rpost['shift_global']['pelvis'][1]:+.1f}, {rpost['shift_global']['pelvis'][2]:+.1f}.</p>".replace('.', ',')

def back_rows():
    out = ''
    for line, need, nm in (('spinous', None, 'над остистыми'), ('longissimus', (2.2, 3.7), 'длиннейшая (3,5 см от средней линии)'), ('iliocostalis', None, 'подвздошно-рёберная (6,5 см)')):
        for h in ('39', '45', '51', '57'):
            def g(reg, col):
                v = reg[col]['back'].get(line, {}).get(h); return None if not v else v['depth']
            def rm(reg, col):
                v = reg[col]['back'].get(line, {}).get(h); return None if not v or v['room'] is None else v['room']
            vals = [g(r461, 'mannequin'), g(r461, 'anny_segments'), g(rpost, 'mannequin'), g(rpost, 'anny_segments')]
            rooms = [rm(r461, 'mannequin'), rm(r461, 'anny_segments'), rm(rpost, 'mannequin'), rm(rpost, 'anny_segments')]
            lo, hi = need if need else (0, 99)
            out += f"<tr><td>{nm}, h {h}</td>" + ''.join(f"<td>{f1(v)} <span class='{cls(r, lo, hi) if need else 'dim'}'>({f1(r)})</span></td>" for v, r in zip(vals, rooms)) + '</tr>'
    return out
t_back = f"<table><tr><th>Спина: от кости до кожи (в скобках — место для столба: минус слой над ним, BK.depth ветки осанки)</th><th>манекен 4.61.0</th><th>Anny + 4.61.0</th><th>манекен осанки</th><th>Anny + осанка</th></tr>{back_rows()}</table>" \
         "<p class='small'>h — высота над тазобедренными суставами (39–57 см ≈ T10–T3). Луч — горизонтально вперёд от кожи спины; кость — ближайшая в окрестности ±0,5 см по ширине и ±1,5 см по высоте (как backFloor в walls.js). Длиннейшей в 4.61.0 хватало 2,2–3,7 см места (README мышц ветки осанки); на ветке осанки осталось 1,0–1,4.</p>"

def other_rows():
    def sc(reg, col): s = reg[col]['scapula']['L']; return s
    rows = ''
    for k, nm in (('min_depth', 'лопатка: наименьшая глубина, см'), ('lt10', 'лопатка: доля вершин мельче 1 см'), ('lt14', 'лопатка: доля мельче 1,4 см (Seol: 14 ± 2 мм)')):
        vals = [sc(r461, 'mannequin')[k], sc(r461, 'anny_segments')[k], sc(rpost, 'mannequin')[k], sc(rpost, 'anny_segments')[k]]
        rows += f"<tr><td>{nm}</td>" + ''.join(f"<td>{f1(v * (100 if k != 'min_depth' else 1), 1 if k == 'min_depth' else 0)}{'' if k == 'min_depth' else ' %'}</td>" for v in vals) + '</tr>'
    for h in ('27', '33', '39'):
        vals = [(reg[col]['lateral'].get(h) or {}).get('depth') for reg, col in ((r461, 'mannequin'), (r461, 'anny_segments'), (rpost, 'mannequin'), (rpost, 'anny_segments'))]
        rows += f"<tr><td>рёбра сбоку, h {h}: до кожи, см</td>" + ''.join(f'<td>{f1(v)}</td>' for v in vals) + '</tr>'
    for h in ('44', '50'):
        vals = [(reg[col]['front'].get(h) or {}).get('depth') for reg, col in ((r461, 'mannequin'), (r461, 'anny_segments'), (rpost, 'mannequin'), (rpost, 'anny_segments'))]
        rows += f"<tr><td>грудина спереди, h {h}: до кожи, см (норма 0,9–2,7)</td>" + ''.join(f"<td class='{cls(v, .9, 2.7)}'>{f1(v)}</td>" for v in vals) + '</tr>'
    def outb(reg, col):
        o = sorted(((v['out_max'], k) for k, v in reg[col]['bones'].items() if v['out_max'] > .3 and not k.endswith('R')), reverse=True)[:6]
        return ', '.join(f"{k} {f1(v)}" for v, k in o) or 'нет'
    rows += '<tr><td>кости снаружи кожи (больше 0,3 см), см</td>' + ''.join(f"<td style='white-space:normal'>{outb(reg, col)}</td>" for reg, col in ((r461, 'mannequin'), (r461, 'anny_segments'), (rpost, 'mannequin'), (rpost, 'anny_segments'))) + '</tr>'
    return rows
t_other = f"<table><tr><th>Лопатка, рёбра, грудина, выход костей</th><th>манекен 4.61.0</th><th>Anny + 4.61.0</th><th>манекен осанки</th><th>Anny + осанка</th></tr>{other_rows()}</table>"

def relief_rows():
    out = ''
    names = {'furrow32': 'борозда позвоночника, h 32 (поясница)', 'furrow42': 'борозда позвоночника, h 42 (T9–T10)', 'furrow50': 'борозда позвоночника, h 50 (T6–T7)',
             'scap42': 'лопатка выступает (h 42)', 'scap50': 'лопатка выступает (h 50)', 'jugular_notch': 'яремная ямка (глубина)', 'supraclavicular': 'надключичная ямка (глубина)'}
    for k, nm in names.items():
        vals = [r461['mannequin']['relief_summary'].get(k), r461['anny_raw']['relief_summary'].get(k)]
        out += f"<tr><td>{nm}</td>" + ''.join(f"<td class='{'ok' if (v or 0) >= .3 else 'bad'}'>{f1(v)}</td>" for v in vals) + '</tr>'
    return out
t_relief = f"<table><tr><th>Рельеф кожи, см (плюс — есть)</th><th>манекен 4.61.0</th><th>Anny</th></tr>{relief_rows()}</table><p class='small'>Борозда — насколько кожа у средней линии ближе к телу, чем над столбами выпрямителя (2,5–4,5 см от линии); лопатка — насколько кожа в 6–11 см от средней линии выступает назад относительно кожи в 4 см; ямки — глубина профиля кожи под хордой (по средней линии у вырезки; по линии середины ключицы над ней).</p>"

spec = {'title': 'Проба кожи (шаг 0): Anny под ANSUR II и скелет манекена внутри неё',
        'sub': ['Anny 0.6.1 (NAVER LABS Europe; код Apache 2.0, сетка и формы — MakeHuman/MPFB2 CC0). Подгонка по медианам ANSUR II (мужчины 170–180 см, 72–84 кг) теми же уровнями, что anthro.js; стойка — нейтральная стойка манекена через риг Anny.',
                'Кожа манекена и Anny — один материал и свет сцены приложения (src/volume/scene.mjs); камеры ортографические, масштаб в ряду одинаковый. Скелеты — MyoSim из src/data/skeleton.bin: 4.61.0 и ветка осанки (9f13c1f).'],
        'rows': rows, 'blocks': [{'title': 'ANSUR II: манекен против Anny', 'html': t_ansur}, {'title': 'Мягкие ткани над ориентирами, см', 'html': t_lm},
                                 {'title': 'Где Anny и скелет не согласуются: сдвиги сегментов при вписывании', 'html': t_shift},
                                 {'title': 'Место для мышц спины', 'html': t_back}, {'title': 'Лопатка, рёбра, грудина, кости снаружи', 'html': t_other},
                                 {'title': 'Рельеф', 'html': t_relief}]}
sp = os.path.join(W, 'sheet-spec.json'); json.dump(spec, open(sp, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render.mjs'), '--spec', sp, '--out', a.out, '--w', '300', '--h', '470', '--width', '1900', '--html', os.path.join(W, 'sheet.html')], check=True, cwd=ROOT)
