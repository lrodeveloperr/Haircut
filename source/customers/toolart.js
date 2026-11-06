// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; plan Wave 4): the new tools' models as data, so one description feeds
// both the 3D model in the barber's hand (the game's own three.js classes, services.js and tools.js) and the tray
// picture (a physically lit product shot, shop3d.js). Semi-realistic like the customers: turned glass, metal and
// plastic under the same materials as the clipper, never flat art. The tip (y 0) touches the customer.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const M = {
    chrome: { color: '#d7dce0', metalness: 1, roughness: 0.2 }, steel: { color: '#9aa1a7', metalness: 1, roughness: 0.32 },
    foilMesh: { color: '#c9cdd2', metalness: 1, roughness: 0.42 }, black: { color: '#1b1c1e', metalness: 0.1, roughness: 0.42, clearcoat: 0.5 },
    graphite: { color: '#33373b', metalness: 0.5, roughness: 0.4, clearcoat: 0.4 }, rubber: { color: '#141414', roughness: 0.9 },
    bluePlastic: { color: '#2f6fb0', roughness: 0.32, clearcoat: 0.6 }, water: { color: '#bfe3f5', roughness: 0.04, transparent: true, opacity: 0.42, clearcoat: 1 },
    soap: { color: '#efe7d2', roughness: 0.5, clearcoat: 0.2 }, paper: { color: '#b98c52', roughness: 0.8 },
    pumpWhite: { color: '#f2efe8', roughness: 0.36, clearcoat: 0.5 }, cream: { color: '#fbfaf6', roughness: 0.6 },
    amber: { color: '#8a4a12', roughness: 0.08, transparent: true, opacity: 0.72, clearcoat: 1 }, oil: { color: '#d9962a', roughness: 0.12, transparent: true, opacity: 0.85 },
    tin: { color: '#2a4638', metalness: 0.7, roughness: 0.32 }, balm: { color: '#d8c79a', roughness: 0.42, clearcoat: 0.3 },
    towel: { color: '#dfe9ee', roughness: 1, sheen: 1, sheenRoughness: 0.9, sheenColor: '#ffffff' }, towelFold: { color: '#c9d8e0', roughness: 1, sheen: 1, sheenColor: '#ffffff' },
    alum: { color: '#f3f1ee', roughness: 0.22, transparent: true, opacity: 0.86, clearcoat: 0.8 }, wood: { color: '#6b3f22', roughness: 0.45, clearcoat: 0.6 },
    silver: { color: '#b7bcc1', metalness: 0.8, roughness: 0.3, clearcoat: 0.4 }, brass: { color: '#c9a24a', metalness: 1, roughness: 0.28 },
    skin: { color: '#c58d68', roughness: 0.55, sheen: 0.6, sheenColor: '#ffb59a' }, cotton: { color: '#f4f1ea', roughness: 1, sheen: 1, sheenColor: '#ffffff' },
    towelHot: { color: '#f2e2cc', roughness: 1, sheen: 1, sheenRoughness: 0.9, sheenColor: '#fff2dd' }, towelEdge: { color: '#c98f5a', roughness: 1, sheen: 1, sheenColor: '#ffe2c2' },
    glass: { color: '#fff6c8', roughness: 0.05, transparent: true, opacity: 0.42, clearcoat: 1 }, lemon: { color: '#f2d64e', roughness: 0.2, transparent: true, opacity: 0.85 },
    tinBlue: { color: '#2d4a7a', metalness: 0.6, roughness: 0.3 }, pomade: { color: '#d9cfb5', roughness: 0.3, clearcoat: 1 }, foam: { color: '#ffffff', roughness: 0.6 },
    knot: { color: '#4a3a2c', roughness: 1 }, flame: { color: '#ffb02e', emissive: '#ff7a10', emissiveIntensity: 1.6, roughness: 0.6, transparent: true, opacity: 0.92 },
  };
  // profile helpers for the lathe: a ball, a round-ended finger, a ring (a circle swept round the axis)
  const ball = (r, y = 0) => Array.from({ length: 13 }, (_, i) => { const a = -Math.PI / 2 + (i / 12) * Math.PI; return [Math.max(0.001, Math.cos(a) * r), y + Math.sin(a) * r]; });
  const finger = (r, l) => [...ball(r).slice(0, 7), ...ball(r, l).slice(6)];
  const ring = (R, r) => Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return [R + Math.cos(a) * r, Math.sin(a) * r]; });
  const teeth = (n, w, y, m) => Array.from({ length: n }, (_, i) => ({ box: [w / (n * 1.8), 0.1, 0.05], m, at: [-w / 2 + (w * (i + 0.5)) / n, y, 0.06] }));
  const ART = {
    // a dry foil shaver: a broad slightly domed foil head over a slim graphite body
    foil: [
      { lathe: [[0.2, 0], [0.235, 0.14], [0.25, 0.5], [0.245, 1.05], [0.2, 1.4], [0.001, 1.46]], m: 'graphite', at: [0, 0.34, 0], scale: [1.1, 1, 0.66] },
      { box: [0.56, 0.16, 0.26], m: 'black', at: [0, 0.26, 0] },
      { box: [0.54, 0.14, 0.2], m: 'chrome', at: [0, 0.14, 0] },
      { lathe: [[0.001, 0], [0.09, 0.006], [0.1, 0.05], [0.09, 0.09], [0.001, 0.1]], m: 'foilMesh', at: [-0.14, 0.03, 0], rot: [0, 0, 0], scale: [1.35, 0.7, 1.05] },
      { lathe: [[0.001, 0], [0.09, 0.006], [0.1, 0.05], [0.09, 0.09], [0.001, 0.1]], m: 'foilMesh', at: [0.14, 0.03, 0], scale: [1.35, 0.7, 1.05] },
      { box: [0.09, 0.14, 0.03], m: 'chrome', at: [0, 1.05, 0.15] },
    ],
    // a trigger spray bottle: clear water in a turned body, blue head and nozzle
    spray: [
      { lathe: [[0.001, 0.32], [0.27, 0.33], [0.3, 0.42], [0.3, 1.18], [0.22, 1.36], [0.13, 1.44], [0.001, 1.45]], m: 'water', at: [0, 0, 0] },
      { lathe: [[0.001, 0.36], [0.26, 0.37], [0.27, 0.95], [0.001, 0.97]], m: 'water', at: [0, 0, 0] },
      { lathe: [[0.15, 1.42], [0.16, 1.56], [0.001, 1.58]], m: 'bluePlastic', at: [0, 0, 0] },
      { box: [0.14, 0.2, 0.56], m: 'bluePlastic', at: [0, 1.66, 0.1] },
      { box: [0.09, 0.09, 0.14], m: 'black', at: [0, 1.66, 0.42] },
      { box: [0.06, 0.34, 0.08], m: 'bluePlastic', at: [0, 1.42, 0.3], rot: [0.3, 0, 0] },
    ],
    // a shaving-soap stick, half unwrapped
    shavingSoap: [
      { lathe: [[0.001, 0], [0.13, 0.006], [0.2, 0.05], [0.205, 0.5], [0.001, 0.51]], m: 'soap', at: [0, 0, 0] },
      { lathe: [[0.215, 0.42], [0.22, 1.25], [0.001, 1.26]], m: 'paper', at: [0, 0, 0] },
    ],
    // a shaving-cream pump bottle with a real head and spout
    shavingCream: [
      { lathe: [[0.001, 0], [0.3, 0.01], [0.32, 0.06], [0.32, 1.08], [0.24, 1.22], [0.11, 1.28], [0.001, 1.29]], m: 'pumpWhite', at: [0, 0, 0] },
      { lathe: [[0.05, 1.28], [0.05, 1.48], [0.001, 1.49]], m: 'chrome', at: [0, 0, 0] },
      { box: [0.2, 0.09, 0.48], m: 'black', at: [0, 1.52, 0.1] },
      { box: [0.33, 0.42, 0.012], m: 'bluePlastic', at: [0, 0.6, 0.325] },
    ],
    // beard oil: an amber dropper bottle
    beardOil: [
      { lathe: [[0.001, 0], [0.17, 0.01], [0.19, 0.06], [0.19, 0.62], [0.11, 0.76], [0.08, 0.8], [0.001, 0.81]], m: 'amber', at: [0, 0, 0] },
      { lathe: [[0.001, 0.05], [0.16, 0.06], [0.165, 0.54], [0.001, 0.56]], m: 'oil', at: [0, 0, 0] },
      { lathe: [[0.09, 0.78], [0.1, 0.92], [0.001, 0.93]], m: 'black', at: [0, 0, 0] },
      { lathe: [[0.05, 0.92], [0.075, 1.08], [0.05, 1.22], [0.001, 1.23]], m: 'rubber', at: [0, 0, 0] },
    ],
    // beard balm: a low green tin, lid off, the balm surface finger-worn
    beardBalm: [
      { lathe: [[0.001, 0], [0.42, 0.005], [0.43, 0.03], [0.43, 0.24], [0.41, 0.25], [0.001, 0.25]], m: 'tin', at: [0, 0.08, 0] },
      { lathe: [[0.001, 0], [0.39, 0], [0.39, 0.03], [0.22, 0.04], [0.001, 0.015]], m: 'balm', at: [0, 0.31, 0] },
    ],
    // the cold towel: folded, cool blue-white, a damp sheen
    coldTowel: [
      { box: [0.9, 0.11, 0.62], m: 'towel', at: [0, 0.07, 0] },
      { box: [0.86, 0.11, 0.58], m: 'towelFold', at: [0, 0.19, 0.01] },
      { box: [0.82, 0.1, 0.54], m: 'towel', at: [0, 0.3, 0] },
    ],
    // the tray pictures of the tools that have their own hand model elsewhere: the same materials and the same light,
    // so the whole tray reads as one set. These draw the picture only; the models in the hand stay as they are.
    clipper: [
      { lathe: [[0.3, 0], [0.35, 0.14], [0.37, 0.55], [0.34, 1.02], [0.25, 1.34], [0.001, 1.42]], m: 'black', at: [0, 0.24, 0], scale: [1, 1, 0.62] },
      { box: [0.76, 0.18, 0.24], m: 'graphite', at: [0, 0.22, 0] },
      { box: [0.74, 0.07, 0.14], m: 'chrome', at: [0, 0.1, 0] },
      ...teeth(14, 0.72, 0.03, 'steel'),
      { box: [0.13, 0.26, 0.03], m: 'chrome', at: [0, 0.82, 0.24] },
      { box: [0.08, 0.3, 0.05], m: 'chrome', at: [0.31, 0.55, 0.1], rot: [0, 0, -0.1] },
    ],
    trimmer: [
      { lathe: [[0.2, 0], [0.23, 0.14], [0.25, 0.55], [0.23, 1.1], [0.16, 1.36], [0.001, 1.42]], m: 'black', at: [0, 0.2, 0], scale: [1, 1, 0.7] },
      { box: [0.62, 0.12, 0.18], m: 'black', at: [0, 0.18, 0] },
      { box: [0.6, 0.06, 0.1], m: 'chrome', at: [0, 0.09, 0] },
      ...teeth(12, 0.58, 0.03, 'steel'),
      { box: [0.1, 0.2, 0.03], m: 'chrome', at: [0, 0.82, 0.17] },
    ],
    beard: [
      { lathe: [[0.26, 0], [0.29, 0.1], [0.3, 0.45], [0.28, 0.95], [0.22, 1.25], [0.001, 1.32]], m: 'silver', at: [0, 0.3, 0], scale: [1, 1, 0.62] },
      { box: [0.6, 0.22, 0.16], m: 'black', at: [0, 0.19, 0] },
      { box: [0.56, 0.05, 0.12], m: 'chrome', at: [0, 0.07, 0] },
      ...teeth(14, 0.56, 0.0, 'graphite'),
      { box: [0.12, 0.12, 0.03], m: 'black', at: [0, 0.85, 0.2] },
    ],
    scissors: [
      { lathe: [[0.001, 0], [0.05, 0.08], [0.085, 0.5], [0.09, 1.06], [0.001, 1.08]], m: 'chrome', at: [-0.09, 0, 0], rot: [0, 0, -0.14], scale: [1, 1, 0.2] },
      { lathe: [[0.001, 0], [0.05, 0.08], [0.085, 0.5], [0.09, 1.06], [0.001, 1.08]], m: 'steel', at: [0.09, 0, 0.02], rot: [0, 0, 0.14], scale: [1, 1, 0.2] },
      { lathe: ball(0.055), m: 'brass', at: [0, 1.02, 0.05], scale: [1, 1, 0.6] },
      { box: [0.07, 0.44, 0.04], m: 'steel', at: [-0.13, 1.26, 0], rot: [0, 0, 0.32] },
      { box: [0.07, 0.44, 0.04], m: 'steel', at: [0.13, 1.26, 0], rot: [0, 0, -0.32] },
      { lathe: ring(0.17, 0.042), m: 'black', at: [-0.3, 1.62, 0], rot: [Math.PI / 2, 0, 0] },
      { lathe: ring(0.17, 0.042), m: 'black', at: [0.3, 1.62, 0], rot: [Math.PI / 2, 0, 0] },
    ],
    razor: [
      { box: [0.24, 1.0, 0.018], m: 'chrome', at: [-0.04, 0.5, 0] },
      { box: [0.05, 1.0, 0.03], m: 'steel', at: [0.09, 0.5, 0] },
      { lathe: ball(0.05), m: 'brass', at: [0.05, 1.02, 0.03], scale: [1, 1, 0.5] },
      { box: [0.2, 1.16, 0.07], m: 'wood', at: [0.3, 1.5, -0.03], rot: [0, 0, -0.62] },
    ],
    towel: [
      { lathe: [[0.001, 0], [0.27, 0.005], [0.31, 0.04], [0.31, 1.26], [0.27, 1.295], [0.001, 1.3]], m: 'towelHot', at: [-0.65, 0.33, 0], rot: [0, 0, -Math.PI / 2] },
      { lathe: ring(0.2, 0.012), m: 'towelEdge', at: [0.66, 0.33, 0], rot: [0, 0, -Math.PI / 2] },
      { lathe: ring(0.1, 0.012), m: 'towelEdge', at: [0.66, 0.33, 0], rot: [0, 0, -Math.PI / 2] },
      { box: [1.3, 0.05, 0.3], m: 'towelHot', at: [0, 0.03, 0.2] },
    ],
    massage: [
      { lathe: ball(0.5), m: 'skin', at: [0, 0.5, 0], scale: [0.95, 1.05, 0.34] },
      { lathe: finger(0.08, 0.46), m: 'skin', at: [-0.33, 0.98, 0], rot: [0, 0, 0.1] },
      { lathe: finger(0.085, 0.56), m: 'skin', at: [-0.11, 1.03, 0], rot: [0, 0, 0.03] },
      { lathe: finger(0.085, 0.54), m: 'skin', at: [0.11, 1.03, 0], rot: [0, 0, -0.03] },
      { lathe: finger(0.075, 0.4), m: 'skin', at: [0.33, 0.96, 0], rot: [0, 0, -0.12] },
      { lathe: finger(0.095, 0.44), m: 'skin', at: [-0.46, 0.34, 0.02], rot: [0, 0, 0.92] },
    ],
    talc: [
      { lathe: [[0.001, 0], [0.32, 0.04], [0.3, 0.32], [0.16, 0.45], [0.001, 0.46]], m: 'cotton', at: [0, 0, 0], scale: [1, 1, 0.55] },
      { lathe: [[0.13, 0], [0.11, 0.6], [0.14, 1.1], [0.001, 1.14]], m: 'wood', at: [0, 0.44, 0] },
    ],
    pomade: [
      { lathe: [[0.001, 0], [0.42, 0.005], [0.43, 0.03], [0.43, 0.24], [0.41, 0.25], [0.001, 0.25]], m: 'tinBlue', at: [0, 0.08, 0] },
      { lathe: [[0.001, 0], [0.39, 0], [0.39, 0.03], [0.2, 0.05], [0.001, 0.02]], m: 'pomade', at: [0, 0.31, 0] },
    ],
    threading: [
      { lathe: [[0.001, 0], [0.34, 0.005], [0.35, 0.05], [0.33, 0.09], [0.001, 0.09]], m: 'wood', at: [0, 0, 0] },
      { lathe: [[0.2, 0.08], [0.25, 0.14], [0.26, 0.7], [0.25, 0.92], [0.2, 0.98]], m: 'cotton', at: [0, 0, 0] },
      { lathe: [[0.001, 0.97], [0.33, 0.97], [0.35, 1.01], [0.34, 1.05], [0.001, 1.06]], m: 'wood', at: [0, 0, 0] },
      { box: [0.012, 1.0, 0.012], m: 'cotton', at: [0.5, 0.48, 0.16], rot: [0, 0, 0.42] },
    ],
    singe: [
      { lathe: [[0.022, 0], [0.022, 1.1], [0.001, 1.12]], m: 'chrome', at: [0, 0.5, 0] },
      { lathe: [[0.07, 0], [0.075, 0.42], [0.001, 0.44]], m: 'wood', at: [0, 0.14, 0] },
      { lathe: ball(0.1), m: 'cotton', at: [0, 1.62, 0], scale: [1, 1.2, 1] },
      { lathe: [[0.001, 0], [0.13, 0.1], [0.14, 0.24], [0.06, 0.52], [0.001, 0.74]], m: 'flame', at: [0, 1.66, 0] },
    ],
    nose: [
      { lathe: [[0.001, 0], [0.14, 0.04], [0.12, 0.94], [0.08, 1.06], [0.07, 1.22], [0.001, 1.24]], m: 'black', at: [0, 0, 0] },
      { lathe: [[0.075, 0], [0.075, 0.15], [0.001, 0.17]], m: 'chrome', at: [0, 1.2, 0] },
      { box: [0.07, 0.14, 0.03], m: 'chrome', at: [0, 0.68, 0.12] },
    ],
    lather: [
      { lathe: [[0.001, 0], [0.18, 0.02], [0.15, 0.14], [0.17, 0.5], [0.14, 0.64], [0.001, 0.64]], m: 'black', at: [0, 0, 0] },
      { lathe: [[0.13, 0], [0.2, 0.2], [0.24, 0.42], [0.18, 0.58], [0.001, 0.62]], m: 'knot', at: [0, 0.62, 0] },
      { lathe: ball(0.26), m: 'foam', at: [0, 1.2, 0], scale: [1.05, 0.62, 1.05] },
    ],
    aftershave: [
      { lathe: [[0.001, 0], [0.27, 0.01], [0.28, 0.06], [0.27, 0.6], [0.14, 0.86], [0.1, 0.92], [0.001, 0.93]], m: 'glass', at: [0, 0, 0] },
      { lathe: [[0.001, 0.04], [0.24, 0.05], [0.245, 0.5], [0.001, 0.52]], m: 'lemon', at: [0, 0, 0] },
      { lathe: [[0.001, 0], [0.11, 0.01], [0.11, 0.24], [0.001, 0.25]], m: 'brass', at: [0, 0.9, 0] },
    ],
    // an alum block: a translucent mineral bar
    alum: [
      { box: [0.5, 0.26, 0.3], m: 'alum', at: [0, 0.14, 0] },
      { box: [0.44, 0.04, 0.24], m: 'alum', at: [0, 0.3, 0] },
    ],
  };
  // C: { Group, Mesh, Lathe(points, segments), Box(w, h, d), Phys(options), V2(x, y) }
  HSC.toolArtBuild = function (key, C) {
    const parts = ART[key];
    if (!parts) return null;
    const g = new C.Group(), mats = {};
    for (const p of parts) {
      const geo = p.lathe ? new C.Lathe(p.lathe.map((q) => new C.V2(q[0], q[1])), 32) : new C.Box(p.box[0], p.box[1], p.box[2]);
      const m = mats[p.m] || (mats[p.m] = new C.Phys(M[p.m]));
      const o = new C.Mesh(geo, m);
      o.position.set(p.at[0], p.at[1], p.at[2]);
      if (p.scale) o.scale.set(p.scale[0], p.scale[1], p.scale[2]);
      if (p.rot) o.rotation.set(p.rot[0], p.rot[1], p.rot[2]);
      g.add(o);
    }
    return g;
  };
  HSC.toolArtKeys = Object.keys(ART);
})(globalThis.HSC || (globalThis.HSC = {}));
