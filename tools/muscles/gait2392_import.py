"""Гребенчатая мышца (pectineus) — из модели нижней конечности Gait2392 (Delp и др., 1990; Thelen, Seth, Anderson, Delp;
   opensim-org/opensim-models, коммит d9b05d4, Models/Gait2392_Simbody; лицензия CC BY 3.0). В MyoSim (ноги — Rajagopal
   и др., 2016) гребенчатой нет.
   OSIM_MODELS=/путь/к/opensim-models python3 tools/muscles/gait2392_import.py [вход.json] [выход.json]
   (по умолчанию qa/muscles/muscles.json → он же; нужны Models/Gait2392_Simbody/gait2392_millard2012muscle.osim и
   Geometry/pelvis.vtp, Geometry/femur_r.vtp)

   Как переносятся точки — как в das3_import.py: правая половина таза и правое бедро Gait2392 совмещаются с костями
   манекена по поверхности (ICP, подобие: поворот, сдвиг, один масштаб), точки пути переносятся преобразованием своей
   кости и переводятся в её рамку; точка дальше 1 см от поверхности кости ставится на поверхность. Левая сторона —
   зеркально. Параметры (сила, длина волокон, свободного сухожилия) — как в модели."""
import os, sys, json, subprocess
import xml.etree.ElementTree as ET
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(os.path.join(HERE, '../..'))
sys.path.insert(0, HERE)
from das3_import import load_vtp, icp, surf_samples, closest_on_mesh, SNAP  # noqa: E402

OSM = os.environ.get('OSIM_MODELS', os.path.join(ROOT, '../opensim-models'))
IN = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'qa/muscles/muscles.json')
OUT = sys.argv[2] if len(sys.argv) > 2 else IN
MUSCLES = ('pect_r',)
BODY = {'pelvis': ('pelvis.vtp', 'pelvis_RR', ['pelvis_R', 'R']), 'femur_r': ('femur_r.vtp', 'femurR', ['femur', 'R'])}


def O2M(v):
    """OpenSim (x вперёд, y вверх, z вправо; м) → манекен (X влево, Y вверх, Z вперёд; см)"""
    v = np.asarray(v, float); return np.stack([-v[..., 2], v[..., 1], v[..., 0]], -1) * 100


def main():
    t = ET.parse(os.path.join(OSM, 'Models/Gait2392_Simbody/gait2392_millard2012muscle.osim')).getroot()
    muscles = []
    for e in t.iter('Millard2012EquilibriumMuscle'):
        if e.get('name') not in MUSCLES: continue
        pts = [(p.findtext('socket_parent_frame').split('/')[-1], O2M(np.array(p.findtext('location').split(), float))) for p in e.iter('PathPoint')]
        muscles.append({'name': e.get('name'), 'fmax': float(e.findtext('max_isometric_force')), 'L0': float(e.findtext('optimal_fiber_length')) * 100,
                        'LT': float(e.findtext('tendon_slack_length')) * 100, 'pts': pts})
    assert [m['name'] for m in muscles] == list(MUSCLES), muscles
    keys = [b[1] for b in BODY.values()]
    ours = json.loads(subprocess.run(['node', os.path.join(HERE, 'neutral.js'), ','.join(keys)], capture_output=True, check=True, text=True).stdout)
    XF = {}
    for body, (mesh, key, _) in BODY.items():
        v, f = load_vtp(os.path.join(OSM, 'Geometry', mesh)); v = O2M(v)
        ov, of = np.array(ours[key]['v']), np.array(ours[key]['f']).reshape(-1, 3)
        src, dst = surf_samples(v, f, 3000), surf_samples(ov, of, 4000)
        A, tt, res = icp(src, dst, np.eye(3), dst.mean(0) - src.mean(0), 'sim')
        XF[body] = (A, tt, ov, of, key)
        print(f'{body}: масштаб {np.cbrt(np.linalg.det(A)):.3f}, поворот {np.degrees(np.arccos(np.clip((np.trace(A / np.cbrt(np.linalg.det(A))) - 1) / 2, -1, 1))):.1f}°, невязка {res}')
    out = []
    for mu in muscles:
        el = []
        for k, (body, p) in enumerate(mu['pts']):
            A, tt, ov, of, key = XF[body]; x = A @ p + tt
            q_s, dist = closest_on_mesh(ov, of, x); snap = 0.0
            if dist > SNAP: x, snap = q_s, dist
            T = np.array(ours[key]['T']); q = T[:, :3] @ x + T[:, 3]
            el.append({'s': {'bone': BODY[body][2], 'p': np.round(q, 3).tolist(), 'site': f"{mu['name'][:-2]}-P{k + 1}_r", **({'snap': round(snap, 2)} if snap else {})}})
            print(f"  {mu['name']} P{k + 1}: {body} → {key}, до поверхности {dist:.2f} см{' (поставлена на поверхность)' if snap else ''}")
        out.append({'name': mu['name'], 'side': 'R', 'fmax': round(mu['fmax'], 2), 'L0': round(mu['L0'], 3), 'LT': round(mu['LT'], 3), 'src': 'Gait2392', 'el': el})
    def mirror(s):
        b, sd = s['bone']; return {**s, 'bone': [b.replace('_R', '_L'), 'L'], 'p': [-s['p'][0], s['p'][1], s['p'][2]], 'site': s['site'][:-2] + '_l'}
    left = [{**mu, 'name': mu['name'][:-2] + '_l', 'side': 'L', 'el': [{'s': mirror(e['s'])} for e in mu['el']]} for mu in out]
    md = json.load(open(IN, encoding='utf-8'))
    md['muscles'] = [m for m in md['muscles'] if m.get('src') != 'Gait2392'] + out + left
    if 'Gait2392' not in md['source']:
        md['source'] += '; Gait2392 (Delp и др., 1990; CC BY 3.0): гребенчатая'
    json.dump(md, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False)
    print('мышц Gait2392', len(out) + len(left), '→', OUT)


if __name__ == '__main__':
    main()
