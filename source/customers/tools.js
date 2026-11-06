// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the clipper is the game's only tool, in every mode (owner decision,
// 6 November 2026). Its guards 0-4 do every job on hair, beards and brows; the cut itself stays in the frozen engine.
// This file names the guards for screen readers and tells the career which beard lengths the guards can leave.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  function arc() {
    const el = document.querySelector('.guard-arc');
    if (!el) return;
    const say = (node, key, args) => (HSC.setSpoken ? HSC.setSpoken(node, key, args) : node.setAttribute('aria-label', key));
    say(el, 'arc_clipper');
    el.querySelectorAll('.rung').forEach((b) => { const g = +b.textContent; say(b, 'a_guard', { g, mm: HSC.GUARD_MM ? HSC.GUARD_MM[g] : g }); });
  }
  HSC.relabelArc = arc;
  addEventListener('hsc-language', arc);
  new MutationObserver(() => { const el = document.querySelector('.guard-arc'); if (el && !el.dataset.hscSeen) { el.dataset.hscSeen = '1'; arc(); } }).observe(document.documentElement, { childList: true, subtree: true });
  // the skin under the jaw and chin faces away from every camera angle, so the blade clears that far past the touch
  HSC.beardDepth = 0.6;
  // on a beard, guard 0 shaves to the skin, so any beard can be taken off completely
  HSC.toolBeard = (g) => (+g === 0 ? 0 : HSC.GUARD_LEVEL[g]);
  // the beard lengths the guards leave: the career director offers only beard requests these can reach
  HSC.beardReach = () => [...new Set(Object.keys(HSC.GUARD_LEVEL || {}).map(HSC.toolBeard))].sort((a, b) => a - b);
})(globalThis.HSC || (globalThis.HSC = {}));
