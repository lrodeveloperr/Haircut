// Inserted in the Android renderer closure. No changes to the tool, camera or drawing loop.
// Grip projection suggests placement within a bounded finger-clearance envelope.
// The teeth and cutter retain their common ray hit.
let androidTouchId = null, androidTouchGap = null, androidTouchRawGap = null;
// A 48px contact envelope plus 12px blade clearance; never return to the rejected72px gap.
const androidBoundGap = gap => Math.max(36,Math.min(48,Number.isFinite(gap)?gap:36));
function androidProject(point) {
  const r = e.getBoundingClientRect(), p = point.clone().project(ze);
  return {x:r.left+O.x+(p.x+1)*O.width/2, y:r.top+O.y+(1-p.y)*O.height/2};
}
function androidGripGap(point, normal) {
  // Same orthonormal basis used by z() to orient the rendered clipper.
  const up = new b().copy(Pi).addScaledVector(normal,-Pi.dot(normal)).normalize();
  const along = up.clone().multiplyScalar(-.9).addScaledVector(normal,.42).normalize();
  const across = new b().crossVectors(normal,up).normalize();
  const outward = new b().crossVectors(across,along).normalize();
  const base = point.clone().addScaledVector(normal,.012);
  const teeth = androidProject(base.clone().addScaledVector(along,-.012*uo.modelScale).addScaledVector(outward,-.004*uo.modelScale));
  const grip = androidProject(base.clone().addScaledVector(along,1.1*uo.modelScale).addScaledVector(outward,.09*uo.modelScale));
  return grip.y-teeth.y;
}
function androidResetTouchTarget() { androidTouchId=null; androidTouchGap=null; androidTouchRawGap=null; }
function androidTouchTarget(event) {
  const x=event.clientX, y=event.clientY;
  if(event.pointerType!=='touch')return {x,y,gap:0};
  const stroke=event.pointerId!=null;
  if(stroke&&androidTouchId===event.pointerId&&androidTouchGap!=null)return {x,y:y-androidTouchGap,gap:androidTouchGap,rawGap:androidTouchRawGap};
  P();L();
  const previous=w, centerNormal=ze.position.clone().sub(_a).normalize();
  const fallback=androidGripGap(_a,centerNormal);
  let rawGap=fallback,gap=androidBoundGap(rawGap);
  try {
    // Probe only when a stroke begins. No extra raycasts or changing clearance during a stroke.
    if(j(x,y))rawGap=androidGripGap(w.point,w.normal);
    gap=androidBoundGap(rawGap);
    if(j(x,y-gap)) {
      const refined=androidGripGap(w.point,w.normal);
      if(Number.isFinite(refined)){rawGap=refined;gap=androidBoundGap(rawGap);}
    }
  } finally { w=previous; }
  if(stroke){androidTouchId=event.pointerId;androidTouchGap=gap;androidTouchRawGap=rawGap;}
  return {x,y:y-gap,gap,rawGap};
}
function androidClipperScreen() {
  // Read the actual last rendered transform; do not synthesize a pose or request another ray.
  i.updateWorldMatrix(true,false);
  const project=(x,y,z)=>androidProject(new b(x,y,z).applyMatrix4(i.matrixWorld));
  return {visible:i.visible,teeth:project(0,-.012,-.004),grip:project(0,1.1,.09),tip:project(0,2.25,.02),
    target:w?androidProject(w.point):null,gap:androidTouchGap,rawGap:androidTouchRawGap};
}
