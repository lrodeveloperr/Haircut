// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): menus use the shortest natural text that removes uncertainty; the
// cutting screen stays visual-first. Language is chosen from the saved preference or the initialized host client,
// never from browser globals on a hosted game. The text itself lives in labels-packs.js (HSC.LABEL_PACKS, loaded
// just before this file): one flat pack per tag of the locked 40-language catalogue
// (GLOBAL-LANGUAGE-AND-TEXT-CONTRACT.md section 2). A key a pack lacks reads English; the release gate
// (android/tests/i18n.cjs) requires zero missing keys.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const T = HSC.LABEL_PACKS || { en: {} };
  const LANGUAGE_OPTIONS = HSC.LABEL_LANGUAGES || [['en', 'English']];
  for (const [tag] of LANGUAGE_OPTIONS) if (!T[tag]) T[tag] = {};
  // the lower-case form of each canonical tag, for matching host and saved values case-insensitively
  const LOWER = new Map(Object.keys(T).map((t) => [t.toLowerCase(), t]));
  // locale routing (language contract section 3): every Spanish region (and the old saved `es`) to es-419, every
  // Portuguese one (and `pt`) to pt-BR; Chinese to Simplified or Traditional by region or script; Norwegian
  // (`no`, `nb`, `nn`) to Bokmål; the legacy tags `iw` (Hebrew), `in` (Indonesian) and `tl` (Tagalog) to he, id, fil.
  const route = (raw) => {
    const base = raw.split('-')[0];
    if (base === 'es') return 'es-419';
    if (base === 'pt') return 'pt-BR';
    if (base === 'zh') return /hant|-tw|-hk|-mo/.test(raw) ? 'zh-Hant' : 'zh-Hans';
    if (base === 'no' || base === 'nb' || base === 'nn') return 'nb';
    if (base === 'iw') return 'he';
    if (base === 'in') return 'id';
    if (base === 'tl' || base === 'fil') return 'fil';
    return null;
  };
  const resolve = (value) => {
    const raw = String(value || '').trim().replace(/_/g, '-').toLowerCase();
    const routed = route(raw);
    if (routed) return T[routed] ? routed : 'en';
    return LOWER.get(raw) || LOWER.get(raw.split('-')[0]) || 'en';
  };
  // packs are keyed by their canonical tag (document language, number formatting); right-to-left set
  const TAG = {};
  const RTL = new Set(HSC.LABEL_RTL || ['ar', 'he', 'fa', 'ur']);
  let lang = resolve(document.documentElement.lang || 'en'), manual = false;
  const sync = () => {
    const saved = HSC.meta && HSC.meta.data && HSC.meta.data.settings && HSC.meta.data.settings.lang;
    const host = HSC.meta && HSC.meta.client && HSC.meta.client.language;
    const next = resolve(saved || host || document.documentElement.lang || 'en');
    if (!manual && next !== lang) lang = next;
    document.documentElement.lang = TAG[lang] || lang;
    document.documentElement.dir = RTL.has(lang) ? 'rtl' : 'ltr';
    return lang;
  };
  HSC.lang = () => sync();
  HSC.setLang = (value, persist = true) => {
    const next = resolve(value);
    if (!T[next]) return false;
    manual = true; lang = next;
    if (persist && HSC.meta && HSC.meta.data) {
      HSC.meta.data.settings = Object.assign({}, HSC.meta.data.settings || {}, { lang: next });
      HSC.meta.save();
    }
    sync();
    retext();
    dispatchEvent(new CustomEvent('hsc-language', { detail: { language: next } }));
    return true;
  };
  HSC.rtl = () => RTL.has(sync());
  HSC.langTag = () => TAG[sync()] || sync();
  // numbers in the chosen language (not the device's), e.g. 1,800 / 1.800 / ١٬٨٠٠
  const nf = new Map();
  HSC.num = (n) => { const tag = HSC.langTag(); if (!nf.has(tag)) { try { nf.set(tag, new Intl.NumberFormat(tag)); } catch (e) { nf.set(tag, new Intl.NumberFormat('en')); } } return nf.get(tag).format(n); };
  HSC.t = (k) => { const l = sync(); return (T[l] && T[l][k]) || T.en[k] || ''; };
  // the chosen pack's own text for a key, or '' when only English has it (for callers with their own fallback)
  HSC.tHas = (k) => { const l = sync(); return (T[l] && T[l][k]) || ''; };
  // a counted message: the pack's plural form for n ("key#one", "key#few"...; the bare key is "other"), with {n}
  // written as a number in the chosen language and any further {name} placeholders from args
  const pr = new Map();
  HSC.tn = (k, n, args) => {
    const l = sync(), tag = HSC.langTag();
    if (!pr.has(tag)) { try { pr.set(tag, new Intl.PluralRules(tag)); } catch (e) { pr.set(tag, new Intl.PluralRules('en')); } }
    const cat = pr.get(tag).select(n), p = T[l] || {};
    let out = p[k + '#' + cat] || p[k] || (cat === 'one' && l === 'en' && T.en[k + '#one']) || T.en[k] || '';
    out = out.replace(/\{n\}/g, HSC.num(n));
    for (const [a, v] of Object.entries(args || {})) out = out.split('{' + a + '}').join(typeof v === 'number' ? HSC.num(v) : v);
    return out;
  };
  // shrink compact menu labels only as far as 12 px; supported translations must remain readable
  // labels inside a `.hsc-same` group then all take the smallest size any of them needed, so a row of buttons
  // keeps one text size and one baseline
  HSC.fitLabels = function (root) {
    const els = [...(root || document).querySelectorAll('.hsc-lbl')].filter((el) => el.offsetParent);
    for (const el of els) {
      el.style.fontSize = '';
      let s = parseFloat(getComputedStyle(el).fontSize) || 14;
      let guard = 40;
      while (el.scrollWidth > el.clientWidth + 0.5 && s > 12 && guard--) { s -= 0.5; el.style.fontSize = s + 'px'; }
    }
    const groups = new Map();
    for (const el of els) { const g = el.closest('.hsc-same'); if (g) { if (!groups.has(g)) groups.set(g, []); groups.get(g).push(el); } }
    for (const list of groups.values()) {
      const min = Math.min(...list.map((el) => parseFloat(getComputedStyle(el).fontSize) || 14));
      for (const el of list) el.style.fontSize = min + 'px';
    }
  };
  HSC.languageOptions = LANGUAGE_OPTIONS.map((x) => x.slice());

  // ---- one pass that puts the whole interface in the current language ----
  // Every module's visible labels carry their key (.hsc-lbl[data-k], [data-t]); the spoken names of controls,
  // including the engine's and the frozen wardrobe's, are matched from their English source and translated here,
  // so a language change reaches every surface at once without touching frozen code.
  const EN2K = new Map();
  for (const [k, v] of Object.entries(T.en)) if (typeof v === 'string' && v && !v.includes('{')) EN2K.set(v, k);
  const PATTERNS = [
    [/^Guard (\d+), ([\d.]+) millimetres$/, 'a_guard', (m) => ({ g: m[1], mm: HSC.num(+m[2]) })],
  ];
  function spoken(src) {
    if (EN2K.has(src)) return HSC.t(EN2K.get(src));
    for (const [re, k, args] of PATTERNS) { const m = src.match(re); if (m) { let out = HSC.t(k); for (const [a, v] of Object.entries(args(m))) out = out.replace('{' + a + '}', v); return out; } }
    return null;
  }
  function ariaOne(el) {
    const cur = el.getAttribute('aria-label');
    if (!cur) return;
    // the English source: kept when first seen, replaced when the page writes a new English label
    if (cur !== el.dataset.hscAt && (EN2K.has(cur) || PATTERNS.some(([re]) => re.test(cur)))) el.dataset.hscA = cur;
    const src = el.dataset.hscA;
    if (!src) return;
    const out = spoken(src);
    if (out && out !== cur) { el.dataset.hscAt = out; el.setAttribute('aria-label', out); }
    else if (out) el.dataset.hscAt = out;
  }
  function retext(root) {
    const r = root || document;
    r.querySelectorAll('.hsc-lbl[data-k]').forEach((e) => { const v = HSC.t(e.dataset.k); if (v && e.textContent !== v) e.textContent = v; });
    r.querySelectorAll('[aria-label]').forEach(ariaOne);
    document.querySelectorAll('#hsc-menu,#hsc-set,#hsc-salon,.hsc-coll-panel').forEach((el) => el.setAttribute('dir', HSC.rtl() ? 'rtl' : 'ltr'));
    if (HSC.fitLabels) requestAnimationFrame(() => HSC.fitLabels(document));
  }
  HSC.retext = retext;
  // a module that writes its own spoken label registers the English source, so the translator keeps it
  HSC.setSpoken = (el, key, args) => {
    let en = T.en[key] || key, out = HSC.t(key) || en;
    // numbers read in the chosen language (4,5 mm in German); the English source keeps plain digits
    for (const [a, v] of Object.entries(args || {})) { en = en.replace('{' + a + '}', v); out = out.replace('{' + a + '}', typeof v === 'number' ? HSC.num(v) : v); }
    el.dataset.hscA = en; el.dataset.hscAt = out;
    if (el.getAttribute('aria-label') !== out) el.setAttribute('aria-label', out);
  };
  let queued = false;
  const later = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; document.querySelectorAll('[aria-label]').forEach(ariaOne); }); };
  new MutationObserver((list) => { for (const m of list) if (m.type === 'childList' ? m.addedNodes.length : m.attributeName === 'aria-label') { later(); return; } })
    .observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['aria-label'] });
  HSC.LABELS = T;
})(globalThis.HSC || (globalThis.HSC = {}));
