"""Подставить таблицы кожи (tables_fit.py) в манекен src/js/09bm-mannequin.js: TORSO, LIMBS, NECK, HEAD_VAULT и строки лица.

python3 tools/skin-anny/tables_apply.py W2/tables-fit.json [--top 11.9] [--dry]
Меняются только числа в строках таблиц; комментарии к ним правятся отдельно. Строки головы: свод выше y 2,2 — эллипсоид
HEAD_VAULT (высота макушки — --top: от неё зависит рост манекена, B.head[1]), ниже — сечения лица; пропущенные строки
(контур не найден) — линейно между соседними.
"""
import argparse, json, os, re
import numpy as np
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../..'))
MQ = os.path.join(ROOT, 'src/js/09bm-mannequin.js')


def num(v):
    v = round(float(v), 2); return ('%g' % v)


def row(r): return '[' + ','.join(num(v) for v in r) + ']'


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('tables'); ap.add_argument('--top', type=float, default=11.9); ap.add_argument('--dry', action='store_true')
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
    # голова: сетка радиусов, нос — в сетке (частей лица нет), уши и проверочные точки лица — по Anny
    G = T['HEAD_R']; top = a.top
    s, n = re.subn(r"const HEAD_R=Object\.freeze\(\{[^}]*\}\);", lambda m: "const HEAD_R=Object.freeze({nLat:%d,nLon:%d,u:'%s'});" % (G['nLat'], G['nLon'], G['u']), s, count=1); assert n == 1, 'HEAD_R'
    i0_ = s.index('const HEAD_PARTS=['); i1_ = s.index('];', i0_) + 2
    s = s[:i0_] + 'const HEAD_PARTS=[];   // нос и губы — в сетке HEAD_R' + s[i1_:]
    X = T['head_extra']; e = X['ear_c']
    s, n = re.subn(r'const HEAD_EAR=\{c:\[[-\d.,]+\]', lambda m: f'const HEAD_EAR={{c:[7.9,{num(e[1])},{num(e[2])}]', s, count=1); assert n == 1
    t, pg, mn, gl = X['nose_tip'], X['pogonion'], X['menton'], X['glabella']
    pts = [t, [-.8, t[1] - .6, t[2] - .8], [.8, t[1] - .6, t[2] - .8], pg, mn, gl]
    s, n = re.subn(r'for\(const t of \[\[0,-3,11\.7\].*?\]\]\)', lambda m: 'for(const t of [' + ','.join(row([0 if abs(v) < 1e-9 else v for v in p_]) for p_ in pts) + '])', s, count=1)
    if n != 1:
        s, n = re.subn(r'(/\* выступающие точки лица:[^*]*\*/ ?\n? ?)for\(const t of \[.*?\]\]\)', lambda m: m.group(1) + 'for(const t of [' + ','.join(row(p_) for p_ in pts) + '])', s, count=1, flags=re.S)
    assert n == 1, 'headSamples'
    s, n = re.subn(r'head:\[([\d.]+),([\d.]+),([\d.]+)\],', lambda m: f'head:[{m.group(1)},{num(top)},{m.group(3)}],', s, count=1); assert n == 1
    if a.dry: print(body); print(lb); return
    open(MQ, 'w').write(s); print('записано:', MQ)


if __name__ == '__main__':
    import sys; sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); main()
