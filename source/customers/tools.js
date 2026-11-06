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
  // the beard lengths the guards leave: the career director offers only beard requests these can reach
  HSC.beardReach = () => [...new Set(Object.values(HSC.GUARD_LEVEL || {}))].sort((a, b) => a - b);
})(globalThis.HSC || (globalThis.HSC = {}));
