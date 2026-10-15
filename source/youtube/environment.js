// Inserted inside the renderer, where the original Three.js aliases and scene are in scope.
const shippedEnvironment = HSC.geo.environment;
HSC.geo.environment = null;
let environmentTarget = null, environmentDirty = true;
function restoreEnvironment() {
  if (!environmentDirty) return;
  const previous = environmentTarget;
  if (shippedEnvironment) {
    const target = gh(768, 1024, {magFilter: or, minFilter: or, generateMipmaps: false,
      type: Pa, format: lr, colorSpace: Ji, depthBuffer: false});
    const source = new uu(shippedEnvironment, 768, 1024, lr, Pa);
    try {
      source.needsUpdate = true;
      t.initRenderTarget(target);
      t.copyTextureToTexture(source, target.texture);
      environmentTarget = target;
    } catch (error) { target.dispose(); throw error; }
    finally { source.dispose(); }
  } else {
    const generator = new nl(t);
    try { environmentTarget = generator.fromScene(new nw, .04); }
    finally { generator.dispose(); }
  }
  Zt.environment = environmentTarget.texture;
  Zt.environmentIntensity = .4;
  environmentDirty = false;
  previous?.dispose();
  if (previous) HSC.startupTiming.environmentRestores = (HSC.startupTiming.environmentRestores || 0) + 1;
}
restoreEnvironment();
