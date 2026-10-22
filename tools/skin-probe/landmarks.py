"""Костные ориентиры скелета манекена (MyoSim) и нормы толщины мягких тканей над ними.

Скелет — выгрузка tools/skin-probe/mannequin.js (см, Y вверх, пол 0, +Z — вперёд, +X — левая сторона).
Ориентир — точка кости, которая прощупывается через кожу; её находит правило по сетке кости (как anthro.js находит
акромион, C7, яремную вырезку, вертел, лодыжку, шиловидный отросток). Одно и то же правило — для 4.61.0 и ветки осанки.

Нормы (см, «от кости до кожи», взрослые мужчины с ИМТ ≈ 23–27):
  [S18] Störchle et al., 2018, Sci Rep 8: 16268 — подкожный слой по УЗИ у молодых мужчин: по 8 стандартным точкам
        2,9–10,2 мм, по 216 точкам 1,9–6,1 мм; плюс кожа 1,5–2,5 мм. Для ориентиров, над которыми только кожа и подкожный
        слой (акромион, ключица, остистые отростки, локтевой отросток, надмыщелки, надколенник, гребень большеберцовой,
        лодыжки, шиловидные отростки), — 0,3–1,2 см;
  [L21] Lemon et al., 2021 — над грудиной у мужчин 1,8 ± 0,9 см (КТ; цитата из tools/skeleton/build_bones.py ветки осанки);
  [S14] Seol et al., Ann Rehabil Med 2014; 38: 72–76 — от кожи до ромбовидной 14 ± 2 мм (ИМТ 23–25), 18 ± 3 мм (ИМТ ≥ 25);
  [DG06] De Greef et al., Forensic Sci Int 2006 — лицо: надпереносье у мужчин ≈ 5–6 мм;
  [ор] ориентир без отдельного источника (по анатомии слоёв); требует проверки по литературе на следующем шаге.
"""
import numpy as np

SUBQ = (0.3, 1.2, 'S18')
NORMS = {
    'C7': (0.4, 1.2, 'S18'), 'T1': (0.4, 1.2, 'S18'), 'T2': (0.4, 1.2, 'S18'), 'T3': (0.4, 1.2, 'S18'),
    'jugular': (0.3, 1.2, 'ор'), 'sternum': (0.9, 2.7, 'L21'),
    'acromion': (0.3, 1.0, 'S18'), 'clavicle': SUBQ, 'scapSpine': (1.2, 2.1, 'S14'), 'supAngle': (1.4, 3.0, 'ор'),
    'infAngle': (1.0, 2.5, 'ор'),
    'iliacCrest': (0.5, 2.5, 'ор'), 'ASIS': (0.5, 2.0, 'ор'), 'PSIS': (0.5, 2.0, 'ор'), 'sacrum': (0.4, 1.5, 'ор'),
    'trochanter': (1.5, 4.0, 'ор'), 'patella': SUBQ, 'tibialCrest': (0.2, 0.9, 'S18'), 'fibulaHead': (0.5, 1.5, 'ор'),
    'latMalleolus': (0.2, 0.9, 'S18'), 'medMalleolus': (0.2, 0.9, 'S18'),
    'olecranon': SUBQ, 'latEpicondyle': SUBQ, 'medEpicondyle': SUBQ, 'radialStyloid': (0.2, 0.9, 'S18'),
    'ulnarStyloid': (0.2, 0.9, 'S18'),
    'vertex': (0.5, 0.8, 'ор'), 'glabella': (0.45, 0.7, 'DG06'),
}
NAMES = {
    'C7': 'Остистый C7', 'T1': 'Остистый T1', 'T2': 'Остистый T2', 'T3': 'Остистый T3', 'jugular': 'Яремная вырезка',
    'sternum': 'Тело грудины', 'acromion': 'Акромион', 'clavicle': 'Ключица (середина)', 'scapSpine': 'Ость лопатки',
    'supAngle': 'Верхний угол лопатки', 'infAngle': 'Нижний угол лопатки', 'iliacCrest': 'Гребень подвздошной (верх)',
    'ASIS': 'Передняя верхняя ость (SIAS)', 'PSIS': 'Задняя верхняя ость (SIPS)', 'sacrum': 'Крестец (срединный гребень)',
    'trochanter': 'Большой вертел', 'patella': 'Надколенник', 'tibialCrest': 'Гребень большеберцовой (середина)',
    'fibulaHead': 'Головка малоберцовой', 'latMalleolus': 'Наружная лодыжка', 'medMalleolus': 'Внутренняя лодыжка',
    'olecranon': 'Локтевой отросток', 'latEpicondyle': 'Наружный надмыщелок', 'medEpicondyle': 'Внутренний надмыщелок',
    'radialStyloid': 'Шиловидный лучевой', 'ulnarStyloid': 'Шиловидный локтевой', 'vertex': 'Темя (свод черепа)',
    'glabella': 'Надпереносье',
}
SEG_OF = {
    'pelvis': ['pelvis_L', 'pelvis_R', 'sacrum', 'L1', 'L2', 'L3', 'L4', 'L5'],
    'thorax': ['thoracic%d' % i for i in range(1, 13)] + ['ribcage'],
    'neck': ['cervical', 'skull', 'jaw', 'hyoid', 'thyroid', 'cricoid'] + ['trachea%d' % i for i in range(1, 7)],
    'girdle': ['clavicle', 'scapula'], 'ua': ['humerus'],
    'fa': ['ulna', 'radius', 'lunate', 'scaphoid', 'pisiform', 'triquetrum', 'capitate', 'trapezium', 'trapezoid', 'hamate',
           '1mc', '2mc', '3mc', '4mc', '5mc', 'thumbprox', 'thumbdist'] + ['%d%s' % (k, s) for k in range(2, 6) for s in ('proxph', 'midph', 'distph')],
    'th': ['femur', 'patella'], 'sk': ['tibia', 'fibula', 'talus', 'foot', 'toes'],
}
SIDED = ('girdle', 'ua', 'fa', 'th', 'sk')


def segment(name, side):
    for s, names in SEG_OF.items():
        if name in names:
            if s in SIDED:
                return s + (side or ('L' if name.endswith('_L') else 'R'))
            return s
    return None


class Skeleton:
    def __init__(self, data):
        self.d = data
        self.bones = []
        for b in data['bones']:
            P = np.array(b['pos'], dtype=np.float64).reshape(-1, 3)
            F = np.array(b['idx'], dtype=np.int64).reshape(-1, 3)
            self.bones.append({'name': b['name'], 'side': b['side'], 'seg': segment(b['name'], b['side']), 'P': P, 'F': F, 'kind': b['seg']})
        self.J = {k: np.array(v) for k, v in data['joints'].items()}

    def bone(self, name, side=''):
        for b in self.bones:
            if b['name'] == name and b['side'] == side:
                return b['P']
        raise KeyError(name + side)

    def landmarks(self):
        """{ключ: (точка, сегмент)}; парные — с суффиксом L / R"""
        out = {}
        cerv = self.bone('cervical')
        low = cerv[cerv[:, 1] < cerv[:, 1].min() + 3]
        out['C7'] = (low[np.argmin(low[:, 2])], 'neck')
        for i in range(1, 13):
            P = self.bone('thoracic%d' % i)
            out['T%d' % i] = (P[np.argmin(P[:, 2])], 'thorax')
        rib = self.bone('ribcage'); zc = rib[:, 2].mean()
        strip = rib[(np.abs(rib[:, 0]) < 1.5) & (rib[:, 2] > zc)]
        out['jugular'] = (strip[np.argmax(strip[:, 1])], 'thorax')
        y0, y1 = strip[:, 1].min(), strip[:, 1].max(); ym = y1 - .5 * (y1 - y0)
        band = strip[np.abs(strip[:, 1] - ym) < 1.0]
        out['sternum'] = (band[np.argmax(band[:, 2])], 'thorax')
        sk = self.bone('skull')
        out['vertex'] = (sk[np.argmax(sk[:, 1])], 'neck')
        up = sk[sk[:, 1] > sk[:, 1].max() - 9]
        out['glabella'] = (up[np.argmax(up[:, 2])], 'neck')
        sac = self.bone('sacrum')
        out['sacrum'] = (sac[np.argmin(sac[:, 2])], 'pelvis')
        for s, g in (('L', 1), ('R', -1)):
            lat = lambda P: g * P[:, 0]
            sc = self.bone('scapula', s)
            top = sc[lat(sc) > lat(sc).max() - 2]
            out['acromion' + s] = (top[np.argmax(top[:, 1])], 'girdle' + s)
            out['scapSpine' + s] = (sc[np.argmin(sc[:, 2])], 'girdle' + s)
            out['infAngle' + s] = (sc[np.argmin(sc[:, 1])], 'girdle' + s)
            med = sc[lat(sc) < lat(sc).min() + 3]
            out['supAngle' + s] = (med[np.argmax(med[:, 1])], 'girdle' + s)
            cl = self.bone('clavicle', s); a, b = lat(cl).min(), lat(cl).max()
            midc = cl[(lat(cl) > a + (b - a) / 3) & (lat(cl) < a + 2 * (b - a) / 3)]
            out['clavicle' + s] = (midc[np.argmax(midc[:, 1] + .5 * midc[:, 2])], 'girdle' + s)
            pel = self.bone('pelvis_' + s, s); hipY = self.J['hip' + s][1]
            out['iliacCrest' + s] = (pel[np.argmax(pel[:, 1])], 'pelvis')
            hi = pel[pel[:, 1] > hipY + 2]
            out['ASIS' + s] = (hi[np.argmax(hi[:, 2])], 'pelvis')
            hi4 = pel[pel[:, 1] > hipY + 4]
            out['PSIS' + s] = (hi4[np.argmin(hi4[:, 2])], 'pelvis')
            fem = self.bone('femur', s)
            out['trochanter' + s] = (fem[np.argmax(lat(fem))], 'th' + s)
            pat = self.bone('patella', s)
            out['patella' + s] = (pat[np.argmax(pat[:, 2])], 'th' + s)
            tib = self.bone('tibia', s); kn, an = self.J['kn' + s], self.J['an' + s]
            mid = tib[np.abs(tib[:, 1] - (kn[1] + an[1]) / 2) < 2]
            out['tibialCrest' + s] = (mid[np.argmax(mid[:, 2])], 'sk' + s)
            low = tib[tib[:, 1] < tib[:, 1].min() + 3]
            out['medMalleolus' + s] = (low[np.argmin(lat(low))], 'sk' + s)
            fib = self.bone('fibula', s)
            lowf = fib[fib[:, 1] < fib[:, 1].min() + 2]
            out['latMalleolus' + s] = (lowf[np.argmax(lat(lowf))], 'sk' + s)
            topf = fib[fib[:, 1] > fib[:, 1].max() - 3]
            out['fibulaHead' + s] = (topf[np.argmax(lat(topf))], 'sk' + s)
            ul = self.bone('ulna', s); el = self.J['el' + s]
            prox = ul[ul[:, 1] > el[1] - 3]
            out['olecranon' + s] = (prox[np.argmin(prox[:, 2])], 'fa' + s)
            hu = self.bone('humerus', s); dist = hu[hu[:, 1] < el[1] + 3]
            out['latEpicondyle' + s] = (dist[np.argmax(lat(dist))], 'ua' + s)
            out['medEpicondyle' + s] = (dist[np.argmin(lat(dist))], 'ua' + s)
            rad = self.bone('radius', s)
            out['radialStyloid' + s] = (rad[np.argmin(rad[:, 1])], 'fa' + s)
            out['ulnarStyloid' + s] = (ul[np.argmin(ul[:, 1])], 'fa' + s)
        return out


def norm_of(key):
    base = key[:-1] if key[-1] in 'LR' and key[:-1] in NORMS else key
    return NORMS[base], NAMES[base]
