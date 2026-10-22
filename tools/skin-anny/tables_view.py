"""Сечения Anny и таблиц кожи манекена рядом (кожа Anny, шаг 2): проверка tables_fit.py глазами.

python3 tools/skin-anny/tables_view.py --fit W2/joint2.json --base W2/m-new.json --out W2/tables-view.png [--tables W2/tables-fit.json]
Серым — всё сечение Anny, чёрным — точки, по которым подгонялась строка; красным — кривая манекена (подгонка или --tables),
синим пунктиром — прежняя (4.61.0); оранжевым — кости скелета у сечения. Вид сверху (корпус, голова) и вдоль оси (конечности,
шея): по горизонтали — вбок (наружу), по вертикали — вперёд.
"""
import argparse, json, os, sys, warnings
import numpy as np
warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
import tables_fit as TF

HEAD_461 = None   # прежние строки головы — из манекена 4.61.0 (сечения лица; свод — эллипсоид)


def curve(params, kind):
    th = np.linspace(0, 2 * np.pi, 361); u, v = np.cos(th), np.sin(th)
    if kind == 'torso':
        w, a, b, nb, nf = params; r = TF.ellipse_radius(u, v, a, b, w, w, nb, nf)
    elif kind == 'limb':
        rf, rb, rl, rm = params; r = TF.ellipse_radius(u, v, rf, rb, rl, rm)
    elif kind == 'neck':
        rf, rb, rl = params; r = TF.ellipse_radius(u, v, rf, rb, rl, rl)
    elif kind == 'head':
        w, zc, zf, zb, nf, nb = params; r = TF.ellipse_radius(u, v, zf - zc, zc - zb, w, w, nb, nf); return r * v, r * u + zc
    return r * v, r * u


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fit', required=True); ap.add_argument('--base', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--tables'); ap.add_argument('--chest-depth', type=float)
    ap.add_argument('--only', help='только панели, чьи подписи начинаются с этих слов (через запятую)'); ap.add_argument('--cols', type=int, default=9)
    a = ap.parse_args()
    F = TF.Fitter(a.fit, a.base); T = TF.fit_all(F, a.chest_depth)
    if a.tables: T.update({k: v for k, v in json.load(open(a.tables)).items() if k in ('TORSO', 'LIMBS', 'NECK', 'HEAD_ROWS')})
    panels = []
    for row in T['TORSO']: panels.append(('torso', f'корпус h {row[0]}', row, [row[0]] + TF.profile_at(TF.TORSO_461, row[0])))
    for k in ('ua', 'fa', 'th', 'sk'):
        for row, old in zip(T['LIMBS'][k], TF.LIMBS_461[k]): panels.append(('limb', f'{k} t {row[0]}', row, old, k))
    for row, old in zip(T['NECK'], TF.NECK_461): panels.append(('neck', f'шея t {row[0]}', row, old, 'neck'))
    for row in T.get('HEAD_ROWS', []):
        if row: panels.append(('head', f'голова y {row[0]}', row, None))
    if a.only: panels = [p for p in panels if p[1].startswith(tuple(a.only.split(',')))]
    n = len(panels); cols = min(a.cols, n); rows = (n + cols - 1) // cols
    fig, axs = plt.subplots(rows, cols, figsize=(cols * 3.0, rows * 3.0), squeeze=False)
    for ax_, p in zip(axs.ravel(), panels):
        kind, title, row, old = p[:4]
        if kind == 'torso':
            y = TF.HIP_Y + row[0]; allP = F.section(np.array([0, y, 0.]), np.array([0, 1., 0]))
            selP = F.debug_sel.get(('torso', row[0]), np.zeros((0, 3)))
            ax_.plot(allP[:, 0], allP[:, 2], '.', ms=1, color='#bbb'); ax_.plot(selP[:, 0], selP[:, 2], '.', ms=1.5, color='k')
            B = F.bones_near(TF.TORSO_BONES, np.array([0, y, 0.]), np.array([0, 1., 0])); ax_.plot(B[:, 0], B[:, 2], '.', ms=1, color='#d80')
            x, z = curve(row[1:], 'torso'); ax_.plot(x, z, 'r-', lw=1); ax_.plot(-x, z, 'r-', lw=1)
            x, z = curve(old[1:], 'torso'); ax_.plot(x, z, 'b--', lw=.8)
        elif kind == 'head':
            P = F.debug_sel.get(('head', row[0]))
            hc = np.array(F.J['head']); allP = F.section(hc + [0, row[0], 0], np.array([0, 1., 0])) - hc
            ax_.plot(allP[:, 0], allP[:, 2], '.', ms=1, color='#bbb')
            if P is not None: ax_.plot(P[:, 0], P[:, 2], '.', ms=1.5, color='k')
            B = F.bones_near(('skull', 'jaw'), hc + [0, row[0], 0], np.array([0, 1., 0]), .6) - hc; ax_.plot(B[:, 0], B[:, 2], '.', ms=1, color='#d80')
            x, z = curve(row[1:], 'head'); ax_.plot(x, z, 'r-', lw=1)
        else:
            sel = F.debug_sel.get((p[4], row[0]))
            if sel is None: continue
            lx, ly, bx, by, allx, ally = sel
            ax_.plot(ally, allx, '.', ms=1, color='#bbb'); ax_.plot(ly, lx, '.', ms=1.5, color='k'); ax_.plot(by, bx, '.', ms=1, color='#d80')
            x, z = curve(row[1:], kind); ax_.plot(x, z, 'r-', lw=1)
            x, z = curve(old[1:], kind); ax_.plot(x, z, 'b--', lw=.8)
            lim = 16 if p[4] in ('th', 'neck') else 11; ax_.set_xlim(-lim, lim); ax_.set_ylim(-lim, lim)
        ax_.set_title(title, fontsize=8); ax_.set_aspect('equal'); ax_.tick_params(labelsize=6); ax_.grid(alpha=.3)
    for ax_ in axs.ravel()[n:]: ax_.axis('off')
    fig.tight_layout(); fig.savefig(a.out, dpi=80)
    print(a.out)


if __name__ == '__main__':
    main()
