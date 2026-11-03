/* Страница листа «было / стало» (tools/anny-look/sheet.mjs): кадры сцены приложения в студии вида «Манекен». */
window.Sheet = {
  render(panels, entries, cams, method) {
    const THREE = window.THREE; window.ANNY_METHOD = method || 'dq';
    if (window.ANNY_RAW && window.AnnySkin && !AnnySkin.data) AnnySkin.data = AnnySkin.decode(Uint8Array.from(atob(window.ANNY_RAW), c => c.charCodeAt(0)));
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1);
    const out = [];
    panels.forEach((p, i) => {
      const w = p.w || 300, h = p.h || 360; renderer.setSize(w, h);
      const has = p.has == null || p.has === 'all' ? () => true : p.has === 'none' ? () => false : (k => p.has.split('+').includes(k));
      const rig = p.id === 'stance' ? (() => { const R = Mannequin.catalogPose(Mannequin.neutral()); return () => R; })() : GymEquipment.rig(GymEquipment.variantEntry(entries[p.id], has));
      const dataFor = t => { const R = rig(t); return { exerciseId: p.id, pose: R, body: Mannequin.bodyData(R), surfaces: [], values: {}, regions: {}, props: (R.props || []).filter(q => GymEquipment.visible(q, has)), torsoRings: [], limbProfiles: {} }; };
      const view = createCatalogScene(dataFor(p.t));
      const look = { muscles: false, joints: false, stress: false, color: () => '#a7b3c6' };
      let cam = view.cameras[p.cam];
      /* p.look — кисть крупно по её собственным осям (рамка hand стороны p.side, по умолчанию L): 'palm' — с ладони, 'back' —
         с тыла, 'thumb' — вдоль ручки со стороны большого пальца, 'pinky' — со стороны мизинца, 'tips' — с кончиков пальцев;
         верх кадра — к запястью, центр — центр хвата, ширина — p.span (м) */
      if (p.look) {
        const s = p.side || 'L', R = rig(p.t), hf = R.frames['hand' + s], g = s === 'L' ? 1 : -1;
        const dirs = { palm: [-g, 0, 0], back: [g, 0, 0], thumb: [0, 0, 1], pinky: [0, 0, -1], tips: [0, -1, 0] }, l = Array.isArray(p.look) ? p.look : dirs[p.look];
        const W = v => new THREE.Vector3(hf.x[0] * v[0] + hf.y[0] * v[1] + hf.z[0] * v[2], -(hf.x[1] * v[0] + hf.y[1] * v[1] + hf.z[1] * v[2]), hf.x[2] * v[0] + hf.y[2] * v[1] + hf.z[2] * v[2]).normalize();
        const c = R['grip' + s], at = new THREE.Vector3(c[0] / 100, (186 - c[1]) / 100, c[2] / 100), span = p.span || .25, hh = span * h / w / 2;
        /* камера в p.near м от центра хвата (по умолчанию 0,09): диски и стойки дальше по ручке — за ней, не заслоняют кисть */
        cam = new THREE.OrthographicCamera(-span / 2, span / 2, hh, -hh, 0, 30);
        cam.up.copy(W(Math.abs(l[1]) > .9 ? [g, 0, 0] : [0, 1, 0])); cam.position.copy(at).addScaledVector(W(l), p.near || .09); cam.lookAt(at); cam.updateMatrixWorld(true);
        view.apply(dataFor(p.t), look);
      } else if (cams && cams[i]) { [cam.left, cam.right, cam.top, cam.bottom] = cams[i]; cam.updateProjectionMatrix(); view.apply(dataFor(p.t), look); }
      else {
        if (p.focus) {
          view.apply(dataFor(p.t), look);
          const R = rig(p.t), f = R[p.focus], q = new THREE.Vector3(f[0] / 100, (186 - f[1]) / 100, f[2] / 100).applyMatrix4(cam.matrixWorldInverse), span = p.span || .5, hh = span * h / w / 2;
          cam.left = q.x - span / 2; cam.right = q.x + span / 2; cam.top = q.y + hh; cam.bottom = q.y - hh; cam.updateProjectionMatrix();
        } else {
          for (let k = 0; k <= 12; k++) { view.apply(dataFor(p.id === 'stance' ? 0 : k / 12), look); view.includeBounds(); }
          view.resize(w, h); view.apply(dataFor(p.t), look);
        }
      }
      /* отладка: p.weights — регулярное выражение имён рамок; вершины окрашены долей веса этих рамок (синий 0 → красный 1) */
      if (p.weights && view.anny?.mesh && AnnySkin.data) {
        const d = AnnySkin.data, re = new RegExp(p.weights), a = view.anny.mesh.geometry.attributes.annyColor;
        for (let v = 0; v < d.nv; v++) { let w = 0; for (let k = 0; k < 4; k++) if (re.test(d.frames[d.wi[v * 4 + k]])) w += d.ww[v * 4 + k];
          const c = w <= 0 ? null : [Math.round(255 * Math.min(1, 2 * w)), Math.round(255 * (1 - Math.abs(2 * w - 1))), Math.round(255 * Math.max(0, 1 - 2 * w))];
          if (c) { a.array.set([...c, 255], v * 4); } else a.array.set([0, 0, 0, 0], v * 4); }
        a.needsUpdate = true;
      }
      /* отладка: p.marks === 'inverted' — вершины вывернутых треугольников (как tools/anny-look/check.js) красным */
      if (p.marks === 'inverted' && view.anny?.mesh && AnnySkin.data) {
        const d = AnnySkin.data, R = rig(p.t), P = AnnySkin.skin(R, { d }), S = AnnySkin.skinMats(R, d), DQ = AnnySkin.dualQuats(S, d.frames.length), a = view.anny.mesh.geometry.attributes.annyColor, V = Mannequin.V;
        const rot = v => { let x = 0, y = 0, z = 0, w = 0, r0 = -1; for (let j = 0; j < 4; j++) { const wt = d.ww[v * 4 + j]; if (!wt) continue; const o = d.wi[v * 4 + j] * 8; let s = wt; if (r0 < 0) r0 = o; else if (DQ[o] * DQ[r0] + DQ[o + 1] * DQ[r0 + 1] + DQ[o + 2] * DQ[r0 + 2] + DQ[o + 3] * DQ[r0 + 3] < 0) s = -wt; x += s * DQ[o]; y += s * DQ[o + 1]; z += s * DQ[o + 2]; w += s * DQ[o + 3]; } const l = Math.hypot(x, y, z, w); return [x / l, y / l, z / l, w / l]; };
        const rotate = (q, p) => { const [x, y, z, w] = q, cx = y * p[2] - z * p[1] + w * p[0], cy = z * p[0] - x * p[2] + w * p[1], cz = x * p[1] - y * p[0] + w * p[2]; return [p[0] + 2 * (y * cz - z * cy), p[1] + 2 * (z * cx - x * cz), p[2] + 2 * (x * cy - y * cx)]; };
        const at = (Q, i) => [Q[i * 3], Q[i * 3 + 1], Q[i * 3 + 2]], nrm = (Q, a, b, c) => V.cross(V.sub(at(Q, b), at(Q, a)), V.sub(at(Q, c), at(Q, a)));
        a.array.fill(0);
        for (let t = 0; t < d.nf; t++) { const i0 = d.idx[t * 3], i1 = d.idx[t * 3 + 1], i2 = d.idx[t * 3 + 2], n0 = nrm(d.pos, i0, i1, i2), n1 = nrm(P, i0, i1, i2), l0 = V.len(n0), l1 = V.len(n1); if (l0 < 1e-9 || l1 < 1e-9) continue; if (V.dot(rotate(rot(i0), n0), n1) / (l0 * l1) < -.2) for (const v of [i0, i1, i2]) a.array.set([255, 30, 30, 255], v * 4); }
        a.needsUpdate = true;
      }
      /* отладка: p.marks === 'crease' — вершины рёбер с изломом сверх стойки больше p.crease° (по умолчанию 25; как
         tools/anny-look/tails.js): жёлтым, больше 40° — красным */
      if (p.marks === 'crease' && view.anny?.mesh && AnnySkin.data) {
        const d = AnnySkin.data, R = rig(p.t), P = AnnySkin.skin(R, { d }), a = view.anny.mesh.geometry.attributes.annyColor, V = Mannequin.V, lim = p.crease || 25;
        const fn = (Q, t) => { const i = d.idx[t * 3] * 3, j = d.idx[t * 3 + 1] * 3, k = d.idx[t * 3 + 2] * 3; return V.unit(V.cross([Q[j] - Q[i], Q[j + 1] - Q[i + 1], Q[j + 2] - Q[i + 2]], [Q[k] - Q[i], Q[k + 1] - Q[i + 1], Q[k + 2] - Q[i + 2]])); };
        const ang = (Q, s, t) => Math.acos(Math.max(-1, Math.min(1, V.dot(fn(Q, s), fn(Q, t))))) * 180 / Math.PI;
        const m = new Map(); a.array.fill(0);
        for (let t = 0; t < d.nf; t++) for (let k = 0; k < 3; k++) { const u = d.idx[t * 3 + k], w = d.idx[t * 3 + (k + 1) % 3], key = Math.min(u, w) * 65536 + Math.max(u, w), e = m.get(key); if (e == null) m.set(key, t); else { const c = ang(P, e, t) - ang(d.pos, e, t); if (c > lim) for (const v of [u, w]) a.array.set(c > 40 ? [255, 40, 40, 255] : [255, 210, 40, 255], v * 4); } }
        a.needsUpdate = true;
      }
      view.studio(renderer); view.scene.updateMatrixWorld(true); view.fitShadow();
      renderer.render(view.scene, cam);
      out.push({ url: renderer.domElement.toDataURL('image/png'), cam: [cam.left, cam.right, cam.top, cam.bottom] });
      view.dispose();
    });
    renderer.dispose();
    return out;
  }
};
