"""Подставить таблицы кожи (tables_fit.py) в манекен src/js/09bm-mannequin.js: TORSO, TORSO_DR, LIMBS, NECK.

python3 tools/skin-anny/tables_apply.py W2/tables-fit.json [--dry]
Меняются только числа в строках таблиц; комментарии к ним правятся отдельно.
Голова не подставляется: сетка радиусов головы Anny (tables_fit.py, HEAD_R) — с низким подбородком (поза головы Anny шага 1:
от яремной вырезки до подбородка 6,5 см) и с лицом длиннее лица черепа MyoSim; голова манекена — прежняя (4.61.0), до сетки
Anny как видимой кожи (README, «План встраивания», п. 4).
"""
import argparse, json, os, re
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..'))
MQ = os.path.join(ROOT, 'src/js/09bm-mannequin.js')


def num(v):
    v = round(float(v), 2); return ('%g' % v)


def row(r): return '[' + ','.join(num(v) for v in r) + ']'


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('tables'); ap.add_argument('--dry', action='store_true')
    a = ap.parse_args(); T = json.load(open(a.tables)); s = open(MQ).read()
    # TORSO: по 6 строк в ряд
    rows = [row(r) for r in T['TORSO']]
    body = ',\n '.join(','.join(rows[i:i + 6]) for i in range(0, len(rows), 6))
    s, n = re.subn(r'const TORSO=Object\.freeze\(\[.*?\]\.map\(r=>Object\.freeze\(r\)\)\);', lambda m: 'const TORSO=Object.freeze([' + body + '].map(r=>Object.freeze(r)));', s, count=1, flags=re.S); assert n == 1
    # LIMBS
    L = T['LIMBS']; lb = ',\n'.join(f' {k}:[' + ','.join(row(r) for r in L[k]) + ']' for k in ('ua', 'fa', 'th', 'sk'))
    s, n = re.subn(r'const LIMBS=\{\n.*?\n\};', lambda m: 'const LIMBS={\n' + lb + '\n};', s, count=1, flags=re.S); assert n == 1
    # NECK
    s, n = re.subn(r'const NECK=\[.*?\],NECK_BLEND', lambda m: 'const NECK=[' + ','.join(row(r) for r in T['NECK']) + '],NECK_BLEND', s, count=1); assert n == 1
    # радиальные поправки корпуса
    D = T['TORSO_DR']; mm = ' '.join(str(int(round(v * 100))) for r in D['dr'] for v in r)
    s, n = re.subn(r'const TORSO_DR=Object\.freeze\(\{[^}]*\}\);', lambda m: 'const TORSO_DR=Object.freeze({n:%d,h:[%s],\n u:\'%s\'});' % (D['n'], ','.join(num(h) for h in D['h']), mm), s, count=1); assert n == 1, 'TORSO_DR'
    if a.dry: print(body); print(lb); return
    open(MQ, 'w').write(s); print('записано:', MQ)


if __name__ == '__main__':
    import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); main()
