"""Лист для владельца (шаг 1): манекен 4.61.0 против Anny подтянутой, голова и шея, «Скелет» в Anny, таблицы.
Заодно пишет итоговые JSON: параметры Anny, посадку скелета (патч к рамкам) и таблицы.

python3 tools/skin-anny/look_sheet.py --work W --fit W/joint.json --out W/look-sheet.png --result tools/skin-anny/result
"""
import argparse, json, os, subprocess, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ROOT = os.path.abspath(os.path.join(HERE, '../..'))
import norms, spine, checks
import fit_joint as FJ
from register import MannequinSkin

ap = argparse.ArgumentParser()
ap.add_argument('--work', required=True); ap.add_argument('--fit', required=True); ap.add_argument('--out', required=True)
ap.add_argument('--result', default=os.path.join(HERE, 'result'))
a = ap.parse_args(); W = a.work
model = FJ.Model(W); ref = model.ref['values']
fit = json.load(open(a.fit)); v = np.array(fit['v'], float)
model.body.setup_groin(model.anny(v)[0])
r, D = model.resid(v, detail=True)
x = D['x']; pm = D['pm']; pm0 = model.p.measures({})
V = D['V']; Fall = model.body.faces
f1 = lambda v_, d=1: '—' if v_ is None else f'{v_:.{d}f}'.replace('.', ',').replace('-', '−')

# ---------------------------------------------------------------- манекен 4.61.0: те же замеры по его коже
mann = MannequinSkin(ROOT, W, 'm461look')
LM0 = checks.landmarks_all(model.base)
lm_keys = list(FJ.TRUNK_LM + FJ.LIMB_LM + FJ.HEAD_LM)
P0 = np.array([LM0[k][0] for k in lm_keys])
def fib(n):
    i = np.arange(n) + .5; ph = np.arccos(1 - 2 * i / n); th = np.pi * (1 + 5 ** .5) * i
    return np.stack([np.cos(th) * np.sin(ph), np.cos(ph), np.sin(th) * np.sin(ph)], 1)
ans = mann.run(P0, []); d0 = -np.array([p['d'] for p in ans['points']])
D1 = fib(256)
r1 = [{'o': p.tolist(), 'd': dd.tolist(), 'kind': 'exit', 'max': float(min(15, 1.5 * max(d_, .2) + 1))} for p, d_ in zip(P0, d0) for dd in D1]
a1 = mann.run([], r1)['rays']; mt = []
for j in range(len(P0)):
    ts = [rr['t'] for rr in a1[j * 256:(j + 1) * 256] if rr]
    mt.append(min(ts) if (ts and d0[j] > 0) else d0[j])
tis0 = dict(zip(lm_keys, mt))
# место для столбов спины у манекена 4.61.0 (лучи сзади на тех же уровнях, пол — кости 4.61.0)
posed0 = {b['name'] + b['side']: b['P'] for b in model.base.bones}
trunk0 = checks.bone_mesh({k: (posed0[k], model.F[k]) for k in posed0}, ('thoracic', 'ribcage'))
tips0 = {f'T{k}': posed0[f'thoracic{k}'][np.argmin(posed0[f'thoracic{k}'][:, 2])] for k in range(3, 11)}
rays, meta = [], []
for k, tip in tips0.items():
    for line, xx in [('spinous', 0.0)] + list(norms.ROOM_LINES.items()):
        rays.append({'o': [xx, float(tip[1] + 1.0), -60.0], 'd': [0, 0, 1.0], 'kind': 'enter', 'max': 80}); meta.append((k, line))
rt = mann.run([], rays)['rays']; room0 = {}
offs = [np.array([dx, dy, 0]) for dx in (-.5, 0, .5) for dy in (-1.5, -.75, 0, .75, 1.5)]
for (k, line), rr, ray in zip(meta, rt, rays):
    if rr is None: room0.setdefault(k, {})[line] = None; continue
    ps = np.array(ray['o']) + np.array([0, 0, rr['t']]); dep = checks.floor_hit(trunk0, ps, [0, 0, 1.0], offs)
    room0.setdefault(k, {})[line] = {'depth': dep, 'room': None if dep is None else dep - checks.interp(norms.BK_DEPTH, model.h0[k])}
man_anthro = {rr['key']: rr['value'] for rr in model.man['anthro']}

# ---------------------------------------------------------------- кадры
mesh = {'pos': np.round(V, 2).ravel().tolist(), 'idx': Fall.ravel().tolist()}
skin = D['skin']
bo, BP, bd = checks.bones_out(skin, model.base, D['posed'], step=1)
marks = [{'p': p.round(2).tolist(), 'r': .45, 'color': '#ff3b30'} for p in BP[bd < 0][::2]]
def bones_list(posed, skip_hands=True):
    out = []
    for b in model.base.bones:
        if skip_hands and b['seg'] in ('finger', 'thumb'): continue
        out.append({'pos': np.round(posed[b['name'] + b['side']], 3).ravel().tolist(), 'idx': model.F[b['name'] + b['side']].ravel().tolist()})
    return out
bl = bones_list(D['posed'])
PW, PH = 400, 760
C = [0, 87.5, 1.5]; full = 112
row_m = [{'label': f'манекен 4.61.0 · {n}', 'cam': c, 'center': C, 'span': full, 'body': 'mannequin', 'w': PW, 'h': PH}
         for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'), ('angle', 'три четверти'))]
row_a = [{'label': f'Anny подтянутая · {n}', 'cam': c, 'center': C, 'span': full, 'body': 'mesh', 'mesh': mesh, 'w': PW, 'h': PH}
         for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'), ('angle', 'три четверти'))]
HC = [0, 161, 1.0]; hs = 34
row_h = [{'label': f'голова и шея · {n}', 'cam': c, 'center': HC, 'span': hs, 'body': 'mesh', 'mesh': mesh, 'w': 400, 'h': 460}
         for c, n in (('front', 'спереди'), ('side', 'сбоку'), ('back', 'сзади'))] + \
        [{'label': 'череп MyoSim в голове · сбоку', 'cam': 'side', 'center': HC, 'span': hs, 'body': 'mesh', 'mesh': mesh, 'ghost': True, 'bones': bl, 'marks': marks, 'w': 400, 'h': 460}]
G = lambda **k: {'body': 'mesh', 'mesh': mesh, 'ghost': True, 'bones': bl, 'marks': marks, **k}
row_s = [G(label='«Скелет» в Anny · сбоку', cam='side', center=C, span=full, w=PW, h=PH),
         G(label='«Скелет» в Anny · сзади', cam='back', center=C, span=full, w=PW, h=PH),
         G(label='верх спины и лопатки · сзади', cam='back', center=[0, 133, -6], span=46, w=400, h=PH // 2 + 80),
         G(label='верх спины · сзади-сбоку', cam='rear', center=[0, 133, -6], span=46, w=400, h=PH // 2 + 80)]

# ---------------------------------------------------------------- таблицы
def zc(val, k):
    p25, p50, p75 = ref[k]
    if val is None: return 'dim'
    return 'ok' if p25 <= val <= p75 else ('warn' if abs(val - p50) <= 1.349 * (p75 - p25) else 'bad')
m = D['m']
SKH = {'cervicaleheight': ('cervicale', 'Высота C7 (остистый)*'), 'suprasternaleheight': ('jugular', 'Высота яремной вырезки*'),
       'tenthribheight': ('tenthrib', 'Высота 10-го ребра*'), 'iliocristaleheight': ('iliocristale', 'Высота гребня таза*')}
rows = ''
NAMES = {'stature': 'Рост', 'crotchheight': 'Высота промежности', 'chestcircumference': 'Обхват груди', 'chestbreadth': 'Ширина груди',
         'chestdepth': 'Глубина груди', 'waistcircumference': 'Обхват талии', 'waistbreadth': 'Ширина талии', 'waistdepth': 'Глубина талии',
         'buttockcircumference': 'Обхват ягодиц', 'buttockdepth': 'Глубина ягодиц', 'hipbreadth': 'Ширина бёдер', 'bideltoidbreadth': 'Ширина по дельтам',
         'shouldercircumference': 'Обхват плеч', 'bicepscircumferenceflexed': 'Обхват плеча', 'forearmcircumferenceflexed': 'Обхват предплечья',
         'neckcircumference': 'Обхват шеи', 'neckcircumferencebase': 'Обхват основания шеи', 'wristcircumference': 'Обхват запястья',
         'thighcircumference': 'Обхват бедра', 'lowerthighcircumference': 'Обхват над коленом', 'calfcircumference': 'Обхват голени',
         'anklecircumference': 'Обхват над лодыжками', 'headcircumference': 'Обхват головы', 'headlength': 'Длина головы', 'headbreadth': 'Ширина головы',
         'footlength': 'Длина стопы', 'footbreadthhorizontal': 'Ширина стопы', 'weightkg': 'Масса, кг (Anny — объём × 1,04)'}
ins_m = ins_a = tot = 0; hit = 0
for k, (t_, w_) in norms.ANSUR_TONED.items():
    p25, p50, p75 = ref[k]; tgt = norms.ansur_target(ref, k); mv = man_anthro.get(k); av = m[k]; tot += 1
    ins_m += (mv is not None and p25 <= mv <= p75); ins_a += p25 <= av <= p75
    near = abs(av - tgt) <= .25 * (p75 - p25) + .1; hit += near
    rows += (f"<tr><td>{NAMES.get(k, k)}</td><td>{f1(p50)} <span class='small'>({f1(p25)}–{f1(p75)})</span></td><td>{f1(tgt)} <span class='small'>{norms.TONED_NOTE[t_]}</span></td>"
             f"<td class='{zc(mv, k)}'>{f1(mv)}</td><td class='{zc(av, k)}'>{f1(av)}{' ✓' if near else ''}</td></tr>")
for k, (mk, nm) in SKH.items():
    rows += f"<tr><td>{nm}</td><td>{f1(ref[k][1])} <span class='small'>({f1(ref[k][0])}–{f1(ref[k][2])})</span></td><td>—</td><td class='{zc(pm0[mk], k)}'>{f1(pm0[mk])}</td><td class='{zc(pm[mk], k)}'>{f1(pm[mk])}</td></tr>"
t_ansur = (f"<table><tr><th>Замер</th><th>ANSUR II медиана (p25–p75)</th><th>цель «подтянутый»</th><th>манекен 4.61.0</th><th>Anny подтянутая</th></tr>{rows}</table>"
           f"<p class='small'>В средней половине людей: манекен {ins_m} из {tot}, Anny {ins_a} из {tot}; ✓ — у цели (± четверть межквартильного размаха): {hit} из {tot}. "
           f"* — по костным точкам: у манекена — скелет 4.61.0, у Anny — скелет в новой посадке. Зелёный — p25–p75, жёлтый — до 1 IQR от медианы, красный — дальше. "
           f"Anny: фенотип {', '.join(f'{k} {v_:.2f}' for k, v_ in D['phen'].items())}; пол мужской, 27 лет; пах — форма «bulge» −1 и сглаживание.</p>")

def cls(val, lo, hi):
    if val is None: return 'dim'
    return 'ok' if lo <= val <= hi else ('warn' if lo - .5 <= val <= hi + .5 else 'bad')
rows = ''
for k in lm_keys:
    lo, hi, src, nm = checks.norm_of(k)
    rows += f"<tr><td>{nm}</td><td>{f1(lo)}–{f1(hi)} <span class='small'>{src}</span></td><td class='{cls(tis0[k], lo, hi)}'>{f1(tis0[k])}</td><td class='{cls(D['tissue'][k], lo, hi)}'>{f1(D['tissue'][k])}</td></tr>"
in0 = sum(1 for k in lm_keys if checks.norm_of(k)[0] <= tis0[k] <= checks.norm_of(k)[1]); in1 = sum(1 for k in lm_keys if checks.norm_of(k)[0] <= D['tissue'][k] <= checks.norm_of(k)[1])
t_tis = (f"<table><tr><th>Ориентир (левая сторона)</th><th>норма, см (источник)</th><th>манекен 4.61.0</th><th>Anny + новая посадка</th></tr>{rows}</table>"
         f"<p class='small'>Толщина мягких тканей от точки кости до кожи (ближайшее расстояние; минус — кость снаружи). В норме: манекен {in0} из {len(lm_keys)}, "
         f"Anny {in1} из {len(lm_keys)}. Источники — внизу листа; own — без числа из литературы (по анатомии слоёв).</p>")

tg = model.tg
ANG = [('PI', 'Угол наклона таза PI (морфология)', 'V05', None), ('PT', 'Наклон таза PT', 'LH16/V05', 'PT'), ('SS', 'Наклон крестца SS', 'LH16/V05', 'SS'),
       ('LL', 'Поясничный лордоз L1–S1', 'LH16/V05', 'LL'), ('TK', 'Грудной кифоз T4–T12', 'V05', 'TK'), ('TK_T1T12', 'Грудной кифоз T1–T12', '—', None),
       ('T1slope', 'Наклон T1 (T1 slope)', 'K10/C18', 'T1slope'), ('CL', 'Шейный лордоз C2–C7', 'C18/H97', 'CL'), ('SVA', 'SVA: C7 впереди S1, см', 'D15', 'SVA'),
       ('cSVA', 'cSVA: C2 впереди C7, см', 'C18/H97', 'cSVA')]
LIT_SD = {'PT': 6.1, 'SS': 8.4, 'LL': 10.3, 'TK': 10.0, 'T1slope': 7.0, 'CL': 10.8, 'SVA': 2.5, 'cSVA': 1.06}   # СКО из источников (в подгонке допуски строже)
rows = ''
for k, nm, src, tk in ANG:
    if tk:
        mu = tg[tk][0]; sd = LIT_SD[tk]; nrm = f"{f1(mu)} ± {f1(sd)}"; c0 = 'ok' if abs(pm0[k] - mu) <= sd else ('warn' if abs(pm0[k] - mu) <= 2 * sd else 'bad'); c1 = 'ok' if abs(pm[k] - mu) <= sd else ('warn' if abs(pm[k] - mu) <= 2 * sd else 'bad')
    elif k == 'PI':
        nrm = '52,6 ± 10,4'; c0 = c1 = 'ok' if abs(pm[k] - 52.6) <= 10.4 else 'warn'
    else:
        nrm = '—'; c0 = c1 = 'dim'
    rows += f"<tr><td>{nm}</td><td>{nrm} <span class='small'>{src}</span></td><td class='{c0}'>{f1(pm0[k])}</td><td class='{c1}'>{f1(pm[k])}</td></tr>"
rows += f"<tr><td>Сустав атлант — затылок (блок C2 + атлас к черепу), °</td><td>0 <span class='small'>конгруэнтен, как в HAT</span></td><td class='bad'>{f1(-27.77)}</td><td class='{'ok' if abs(pm['close_a']) < .5 else 'bad'}'>{f1(pm['close_a'])}</td></tr>"
for k, nm in (('lvl_jugular', 'Уровень яремной вырезки (позвонки)'), ('lvl_xiphoid', 'Уровень мечевидного отростка'), ('lvl_tenthrib', 'Уровень 10-го ребра'), ('lvl_crest', 'Уровень гребней таза')):
    rows += f"<tr><td>{nm}</td><td><span class='small'>{ {'lvl_jugular': 'T2–T3 (M12)', 'lvl_xiphoid': 'T9–T10 (K16, M12)', 'lvl_tenthrib': 'L2–L3 стоя (лёжа L1/L2, K16)', 'lvl_crest': 'L4–L5'}[k]}</span></td><td>{pm0[k]}</td><td>{pm[k]}</td></tr>"
# краниовертебральный угол: от вершины остистого C7 к уху (точка уха COCO у Anny — середина уха, ≈ 1 см позади козелка)
from anny.keypoints import _load_keypoint_data
from anny.paths import get_anny_root_dir
KW, _ = _load_keypoint_data(model.body.m, get_anny_root_dir() / 'data' / 'keypoints' / 'coco.pth', labels=['left_ear', 'left_eye'])
ear, eye = (KW.cpu().numpy().astype(float) @ V)
c7 = D['posed']['cervical'][model.p.cerv_owner == 'C7']; c7t = c7[np.argmin(c7[:, 2])]
cva = float(np.degrees(np.arctan2(ear[1] - c7t[1], ear[2] - c7t[2])))
eyeear = float(np.degrees(np.arctan2(eye[1] - ear[1], eye[2] - ear[2])))
rows += f"<tr><td>Краниовертебральный угол (C7 — ухо к горизонтали), °</td><td>≥ 48–50 <span class='small'>GS08</span></td><td>—</td><td class='{'ok' if cva >= 48 else 'warn'}'>{f1(cva)}</td></tr>"
rows += f"<tr><td>Линия «ухо — глаз» Anny к горизонтали (плюс — глаз выше уха), °</td><td>—</td><td>—</td><td>{f1(eyeear)}</td></tr>"
rows += f"<tr><td>Индекс Халлера (поперечник / от грудины до позвонка, внутри)</td><td>≈ 2,5 <span class='small'>H87</span></td><td>{f1(pm0.get('haller'), 2)}</td><td>{f1(pm.get('haller'), 2)}</td></tr>"
for lvl in ('T4', 'T6', 'T8'):
    rows += f"<tr><td>Грудная клетка: грудина — остистый {lvl}, см</td><td>—</td><td>{f1(pm0['ap'].get(lvl))}</td><td>{f1(pm['ap'].get(lvl))}</td></tr>"
t_ang = (f"<table><tr><th>Позвоночник и таз</th><th>норма (источник)</th><th>скелет 4.61.0</th><th>новая посадка</th></tr>{rows}</table>"
         f"<p class='small'>Углы — по замыкательным пластинкам полных сеток MyoSim (tools/skin-anny/endplates.py; S1 — линия верхнего контура, как на боковом снимке). "
         f"PT, SS и LL — нормы по PI таза MyoSim (LH16: PT = 0,44·PI − 11°, LL = 0,54·PI + 27,6°), разброс — V05. Зелёный — в пределах 1 СКО, жёлтый — 2 СКО.</p>")

rows = ''
for k in tips0:
    def g(R_, line, f='room'):
        e = (R_.get(k) or {}).get(line); return None if not e or e.get(f) is None else e[f]
    rr = [g(room0, 'longissimus'), g(D['room'], 'longissimus'), g(room0, 'iliocostalis'), g(D['room'], 'iliocostalis'),
          g(room0, 'spinous', 'depth'), g(D['room'], 'spinous', 'depth')]
    cl = lambda v_: 'dim' if v_ is None else ('ok' if v_ >= norms.ROOM_MIN else ('warn' if v_ >= norms.ROOM_MIN - .5 else 'bad'))
    rows += f"<tr><td>{k}</td><td class='{cl(rr[0])}'>{f1(rr[0])}</td><td class='{cl(rr[1])}'>{f1(rr[1])}</td><td>{f1(rr[2])}</td><td>{f1(rr[3])}</td><td>{f1(rr[4])}</td><td>{f1(rr[5])}</td></tr>"
sc = D['scap']
t_room = (f"<table><tr><th>Уровень</th><th>длиннейшая: манекен 4.61.0</th><th>Anny</th><th>подвздошно-рёберная: 4.61.0</th><th>Anny</th>"
          f"<th>над остистым: 4.61.0</th><th>Anny</th></tr>{rows}</table>"
          f"<p class='small'>Место для столба, см: от кожи до кости (луч вперёд в 3,5 и 6,5 см от средней линии, пол — дуги, поперечные отростки, рёбра), минус слой "
          f"над столбом (трапециевидная, ромбовидные, подкожный слой — BK.depth). Нужно не меньше {f1(norms.ROOM_MIN)} у длиннейшей (столько было в 4.61.0: при "
          f"этом в спину помещается 87 % её объёма по МРТ, R26). Над остистым — толщина тканей по средней линии (S18: 0,4–1,5). Лопатка (Anny): ткани над задней "
          f"поверхностью не тоньше {f1(sc['post_min'])} см, тоньше 1,4 см (S14) — {f1(100 * sc['lt14'], 0)} % задней поверхности.</p>")
rel = checks.relief(skin, D['LM'])
t_rel = "<table><tr><th>Рельеф кожи Anny, см</th><th>значение</th></tr>" + ''.join(
    f"<tr><td>{nm}</td><td>{f1(rel.get(k))}</td></tr>" for k, nm in (('jugular_notch', 'яремная ямка (глубина)'), ('supraclavicular', 'надключичная ямка (глубина)'),
                                                                    ('furrow_T9', 'борозда позвоночника у T9'), ('furrow_T6', 'борозда у T6'), ('scap_T6', 'лопатка выступает у T6'))) + "</table>"

# посадка скелета: что изменено
d_ = x['d']; e_ = x['e']
rows = f"<tr><td>Наклон таза вокруг оси тазобедренных (плюс — вперёд)</td><td>{f1(x['pt'])}°</td></tr>"
rows += ''.join(f"<tr><td>Клин диска {n} (плюс — сгибание)</td><td>{f1(val)}°</td></tr>" for n, val in zip(spine.DISC_L, d_))
rows += f"<tr><td>Рёбра вниз в рёберно-позвоночных суставах (выдох; рёбра 1–10 — доля 0,4…1)</td><td>{f1(x['rib'])}°</td></tr>"
rows += ''.join(f"<tr><td>Клин диска {n}</td><td>{f1(val)}°</td></tr>" for n, val in zip(spine.DISC_C, e_))
rows += f"<tr><td>Череп и нижняя челюсть вокруг ямок атласа (плюс — лицом вниз)</td><td>{f1(x['sk'])}°</td></tr>"
Tth = model.p.transforms(x)['thorax']; t1c = spine.T_apply(Tth, model.p.E['thoracic1'][0][None])[0] - model.p.E['thoracic1'][0]
rows += f"<tr><td>Грудной блок в итоге: наклон / сдвиг верхней пластинки T1 (вверх, вперёд), см</td><td>{f1(np.degrees(np.arctan2(Tth[2, 1], Tth[1, 1])))}° / {f1(t1c[1])}, {f1(t1c[2])}</td></tr>"
for k, nm in (('neckPivot', 'Центр диска C7/T1 (B.neckPivot), мир'), ('lumbarPivot', 'Центр диска L5/S1 (B.lumbarPivot)'), ('thoracicPivot', 'Центр диска L2/L3 (B.thoracicPivot)')):
    rows += f"<tr><td>{nm}</td><td>{f1(pm0[k][1])}, {f1(pm0[k][2])} → {f1(pm[k][1])}, {f1(pm[k][2])}</td></tr>"
t_pose = f"<table><tr><th>Посадка скелета (кости не меняются)</th><th>значение</th></tr>{rows}</table>"

src_html = '<ul class="small">' + ''.join(f'<li><b>{k}</b> — {v_}</li>' for k, v_ in norms.SOURCES.items()) + '</ul>'
spec = {'title': 'Кожа Anny (шаг 1): лист на одобрение внешнего вида',
        'sub': ['Слева направо: спереди, сбоку, сзади, три четверти. Материал и свет — сцены приложения (вид «Манекен»), камеры ортографические, масштаб в ряду одинаковый.',
                'Anny 0.6.1 (код Apache 2.0; сетка, формы и риг — MakeHuman/MPFB2, CC0): подтянутое телосложение в пределах ANSUR II, суставы рига — на наших суставах, '
                'посадка скелета MyoSim — по нормам осанки (кости те же). Код приложения не менялся.'],
        'rows': [{'title': 'Манекен 4.61.0 (сейчас в приложении)', 'panels': row_m},
                 {'title': 'Anny подтянутая (предлагается)', 'panels': row_a},
                 {'title': 'Голова и шея крупно; справа — череп MyoSim внутри головы Anny', 'panels': row_h},
                 {'title': 'Вид «Скелет» внутри Anny подтянутой (новая посадка); красные точки — кости снаружи кожи', 'panels': row_s}],
        'blocks': [{'title': 'ANSUR II: манекен 4.61.0 и Anny подтянутая', 'html': t_ansur},
                   {'title': 'Мягкие ткани над костными ориентирами, см', 'html': t_tis},
                   {'title': 'Позвоночник и таз (скелет), углы и уровни', 'html': t_ang},
                   {'title': 'Место для мышц спины, лопатка, рельеф', 'html': t_room + t_rel},
                   {'title': 'Что изменено в посадке скелета', 'html': t_pose},
                   {'title': 'Источники', 'html': src_html}]}
sp = os.path.join(W, 'look-spec.json'); json.dump(spec, open(sp, 'w'))
subprocess.run(['node', os.path.join(HERE, 'render.mjs'), '--spec', sp, '--out', a.out, '--w', str(PW), '--h', str(PH), '--width', '1700',
                '--html', os.path.join(W, 'look-sheet.html')], check=True, cwd=ROOT)

# ---------------------------------------------------------------- итоговые JSON
os.makedirs(a.result, exist_ok=True)
L = model.body.idx
json.dump({'anny': '0.6.1', 'gender': 'male (0)', 'age': '27 лет (шкала MakeHuman)', 'phenotype': D['phen'],
           'local_changes': {k: round(v_, 4) for k, v_ in D['local'].items() if abs(v_) > 1e-4}, 'bulge-incr': -1.0,
           'groin_smooth': 'лапласово, 40 итераций, |x| < 7,5 см, высота 73,5–95,5 см, только перед (z > −2)',
           'rig_pose': {k: (np.round(np.asarray(v_, float), 3).tolist()) for k, v_ in D['q'].items()},
           'rig_joints_rest_m': {s: {k: np.round(p_, 5).tolist() for k, p_ in D['piv'][s].items()} for s in 'LR'},
           'note': 'координаты суставов — в покое Anny (м, Z вверх, лицо к −Y); поза рига — градусы, сдвиг t — см (мир манекена)'},
          open(os.path.join(a.result, 'anny-toned.json'), 'w'), indent=1, ensure_ascii=False)
T = model.p.transforms(x); _, Ts = model.p.rib_points(x)
patch = {'params': {k: (np.round(np.asarray(v_, float), 3).tolist()) for k, v_ in x.items()}, 'param_names': {
    'pt': 'наклон таза вокруг оси тазобедренных, °', 'd': spine.DISC_L, 'rib': 'рёбра вниз, ° (рёбра 1–10: доля 0,4…1)', 'e': spine.DISC_C,
    'sk': 'череп и челюсть вокруг середины ямок атласа, °'},
    'frames_neutral_world_cm': {k: np.round(T[k], 5).tolist() for k in T},
    'sternum_after_ribs': np.round(Ts, 5).tolist(),
    'girdle_shift_cm': np.round(model.p.pose(x)[2], 4).tolist(),
    'pivots': {k: {'4.61.0': np.round(pm0[k], 3).tolist(), 'new': np.round(pm[k], 3).tolist()} for k in ('neckPivot', 'lumbarPivot', 'thoracicPivot')},
    'note': 'Мировые координаты нейтральной стойки (см; Y вверх, +Z вперёд, +X влево). Ключ — часть скелета: pelvis (таз и крестец), L5…L1, thorax '
            '(T1–T12, грудная клетка; рёбра — ещё поворот rib), C7…C3, C2 (блок C2 + атлас), D67…D23 (диски шеи), skull (череп, нижняя челюсть, подъязычная).'}
json.dump(patch, open(os.path.join(a.result, 'posture-patch.json'), 'w'), indent=1, ensure_ascii=False)
json.dump({'ansur': {k: {'p25_p50_p75': ref[k], 'target': norms.ansur_target(ref, k), 'mannequin_461': man_anthro.get(k), 'anny_toned': float(m[k])} for k in norms.ANSUR_TONED},
           'skeleton_heights': {k: {'ansur': ref[k], '461': float(pm0[mk]), 'new': float(pm[mk])} for k, (mk, _) in SKH.items()},
           'tissue': {k: {'norm': checks.norm_of(k)[:3], 'mannequin_461': float(tis0[k]), 'anny_new': float(D['tissue'][k])} for k in lm_keys},
           'spine': {k: {'461': (float(pm0[k]) if isinstance(pm0[k], (int, float)) else pm0[k]), 'new': (float(pm[k]) if isinstance(pm[k], (int, float)) else pm[k])}
                     for k in ('PI', 'PT', 'SS', 'LL', 'TK', 'TK_T1T12', 'T1slope', 'CL', 'SVA', 'cSVA', 'lvl_jugular', 'lvl_xiphoid', 'lvl_tenthrib', 'lvl_crest', 'haller')},
           'room': {k: {'mannequin_461': room0.get(k), 'anny_new': D['room'].get(k)} for k in tips0},
           'scapula': sc, 'relief': rel,
           'bones_out_over_03': {k: round(v_['out_max'], 2) for k, v_ in bo.items() if v_['out_max'] > .3}},
          open(os.path.join(a.result, 'tables.json'), 'w'), indent=1, ensure_ascii=False, default=float)
print('лист:', a.out)
