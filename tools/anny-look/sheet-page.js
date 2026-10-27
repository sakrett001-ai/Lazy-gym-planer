/* Страница листа «было / стало» (tools/anny-look/sheet.mjs): кадры сцены приложения в студии вида «Манекен». */
window.Sheet = {
  render(panels, entries, cams) {
    const THREE = window.THREE;
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
      const cam = view.cameras[p.cam];
      if (cams && cams[i]) { [cam.left, cam.right, cam.top, cam.bottom] = cams[i]; cam.updateProjectionMatrix(); view.apply(dataFor(p.t), look); }
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
      view.studio(renderer); view.scene.updateMatrixWorld(true); view.fitShadow();
      renderer.render(view.scene, cam);
      out.push({ url: renderer.domElement.toDataURL('image/png'), cam: [cam.left, cam.right, cam.top, cam.bottom] });
      view.dispose();
    });
    renderer.dispose();
    return out;
  }
};
