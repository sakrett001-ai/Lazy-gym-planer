"""Параметры мышц из исходных моделей OpenSim → tools/muscles/fixtures/params.json (для объёма мышц, этап М2).
   python3 tools/muscles/osim_params.py RAJAGOPAL.osim MOBL.osim DAS3.osim

   Из каждой мышцы берутся: наибольшая изометрическая сила F (Н), оптимальная длина волокон Lopt и длина
   ненапряжённого сухожилия Lts (см), угол перистости при оптимальной длине (°). Модели:
   - Rajagopal et al., 2016 (ноги; объёмы мышц — по МРТ Handsfield et al., 2014; F = 60 Н/см² · V / Lopt) —
     opensim-models, Models/Rajagopal/Rajagopal2016.osim (коммит d9b05d4);
   - MoBL-ARMS (рука; Holzbaur et al., 2005; Saul et al., 2015) — MoBL_ARMS_J.osim из stanfordnmbl/osim-rl
     (коммит 610b95c);
   - DAS3 (мышцы лопатки; Chadwick et al., 2014) — dasproject/DAS3, model/das3.osim (коммит d6f2ff0).
   У поясницы (модель поясничного отдела, MyoBack) исходной модели в открытом доступе нет: берутся силы из MyoSim,
   см. volumes.js."""
import sys, json, os
import xml.etree.ElementTree as ET

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'fixtures', 'params.json')


def muscles(path):
    out = {}
    for el in ET.parse(path).getroot().iter():
        if 'Muscle' not in el.tag or not el.get('name') or el.get('name') == 'default' or el.find('max_isometric_force') is None:
            continue
        g = lambda k: float(el.find(k).text) if el.find(k) is not None else 0.0
        out[el.get('name')] = [round(g('max_isometric_force'), 2), round(g('optimal_fiber_length') * 100, 3),
                               round(g('tendon_slack_length') * 100, 3), round(g('pennation_angle_at_optimal') * 57.29578, 2)]
    return out


if __name__ == '__main__':
    raj, mobl, das3 = sys.argv[1:4]
    data = {'fields': ['F, Н', 'Lopt, см', 'Lts, см', 'перистость, °'],
            'rajagopal2016': {k: v for k, v in muscles(raj).items() if k.endswith('_r')},
            'mobl': muscles(mobl),
            'das3': muscles(das3)}
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
    print(OUT, {k: len(v) for k, v in data.items() if k != 'fields'})
