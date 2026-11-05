// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): neutral sponsorship-ready slots (docs/EVERGREEN-GAME-IMPLEMENTATION-
// HANDOFF.md section 8; implementation plan 3.9). Empty by design: no sponsor exists, so every slot resolves to
// nothing and the normal city and salon art shows; there is never a blank billboard. A real campaign is external
// work and needs written rights. Sponsorship can never change payouts, customers, difficulty, requests or career
// progress: this module has no way to reach them. No URL, tracking or external link can be configured.
//   line(city)    a small `presented by` name under the city title (the city name stays primary)
//   panel(city)   one wall/sign panel in the city salon
//   shelf(city)   one product/tool display shelf
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const BLOCKED = ['alcohol', 'tobacco', 'gambling', 'adult'];
  const KEYS = ['name', 'category', 'rightsRef'];
  // a campaign record is valid only with a name, a category allowed for this audience and a written-rights reference
  function validate(c) {
    const r = [];
    if (!c || typeof c !== 'object') return ['not-a-record'];
    if (typeof c.name !== 'string' || !c.name.trim() || c.name.length > 32) r.push('name');
    if (typeof c.category !== 'string' || BLOCKED.includes(c.category)) r.push('category');
    if (typeof c.rightsRef !== 'string' || !c.rightsRef) r.push('rights');
    for (const k of Object.keys(c)) if (!KEYS.includes(k)) r.push('field:' + k); // no url, tracker or link field exists
    if (/https?:|www\.|\.[a-z]{2,}\//i.test(String(c.name))) r.push('link');
    return r;
  }
  const slots = new Map(); // city id -> campaign; empty in this build
  const get = (city) => slots.get(city) || null;
  HSC.sponsor = {
    validate,
    set(city, c) { if (validate(c).length) return false; slots.set(city, c); return true; }, // tests and future config only
    clear: () => slots.clear(),
    line: (city) => { const c = get(city); return c ? c.name : null; },
    panel: (city) => { const c = get(city); return c ? c.name : null; },
    shelf: (city) => { const c = get(city); return c ? c.name : null; },
  };
})(globalThis.HSC || (globalThis.HSC = {}));
