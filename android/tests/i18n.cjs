'use strict';
// Language-pack release gate (docs/GLOBAL-LANGUAGE-AND-TEXT-CONTRACT.md sections 2, 6 and 8): every one of the 40
// packs in source/customers/labels-packs.js has every English key, no empty string, no untranslated English copy
// (outside an explicit allow-list), the same placeholders as English, and fits its catalogue length budget (warning).
// Usage: node android/tests/i18n.cjs [path/to/catalog.json]   (I18N_CATALOG also accepted; budgets are optional)
//        I18N_STRICT=0 prints the report without failing (for translators' drafts).
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const file = path.resolve(__dirname, '../../source/customers/labels-packs.js');
const ctx = { HSC: {} }; ctx.globalThis = ctx; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const { LABEL_PACKS: P, LABEL_LANGUAGES: LANGS } = ctx.HSC;
const TAGS = ['en', 'ar', 'ca', 'hr', 'cs', 'da', 'nl', 'fi', 'fr', 'de', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nb', 'pl', 'pt-BR', 'ro', 'ru', 'zh-Hans', 'sk', 'es-419', 'sv', 'th', 'zh-Hant', 'tr', 'vi', 'hi', 'bn', 'ur', 'ta', 'fil', 'uk', 'fa', 'sw', 'ha', 'yo', 'he'];
const catPath = process.argv[2] || process.env.I18N_CATALOG || path.join(__dirname, 'fixtures/i18n-catalog.json');
const catalog = catPath && fs.existsSync(catPath) ? JSON.parse(fs.readFileSync(catPath, 'utf8')) : [];
const MAX = new Map(catalog.filter((r) => r.max && r.max.chars).map((r) => [r.key, r.max.chars]));
// English is legitimately identical in another language for proper nouns, units and shared loanwords. Keys whose
// value is a proper noun (cities) are allowed everywhere; the rest are allowed only per language and key.
const SAME_KEY = /^(city_|c_)/;
const SAME = new Set([
  'mm', // the SI symbol in every Latin-script pack
  'fr:a_menu', 'fr:collection', 'de:shop', 'de:a_shop', 'id:a_menu', 'pt-BR:a_menu', 'es-419:a_menu', 'it:a_menu', 'ro:a_menu', 'ca:a_menu',
  'fr:salon', 'fr:styles', 'fr:modes', 'fr:rush', 'fr:classic', 'fr:a_salon', 'fr:a_modes',
  'de:salon', 'de:freestyle', 'de:event', 'de:tour', 'de:hand', 'de:name', 'de:a_salon', 'de:shopname', 'de:shop_name',
  'id:salon', 'id:a_salon', 'id:mm',
  'tr:salon', 'tr:a_salon',
  'nl:salon', 'nl:hand', 'nl:modes', 'nl:a_modes', 'nl:a_salon', 'nl:tour', 'nl:event', 'nl:name',
  'da:salon', 'da:a_salon', 'nb:salon', 'nb:a_salon', 'sv:salon', 'sv:a_salon', 'ro:salon', 'ro:a_salon',
  'ca:salon', 'it:salon', 'it:tour', 'fil:salon', 'ms:salon', 'ms:a_salon', 'sw:salon',
  // native words spelled like English, and loanwords local games use (checked in the 7 November 2026 review)
  'ca:modes', 'ca:a_modes', 'hr:salon', 'hr:a_salon', 'cs:salon', 'cs:a_salon', 'pl:salon', 'pl:a_salon', 'nl:open', 'sv:hand', 'ro:decor',
  'cs:a_menu', 'da:a_menu', 'nl:a_menu', 'ms:a_menu', 'pl:a_menu', 'sk:a_menu', 'vi:a_menu', 'ha:a_menu', 'fil:a_menu',
  'da:event', 'nb:event', 'sv:event', 'id:event', 'fil:event',
  'da:shopname', 'nl:shopname', 'nb:shopname', 'sv:shopname', 'it:home', 'it:privacy',
  // Filipino games keep these English words (Taglish), as Filipino players expect
  'fil:home', 'fil:coins', 'fil:a_coins', 'fil:career', 'fil:privacy',
]);
const ph = (s) => [...new Set(String(s).match(/\{[a-z]+\}/g) || [])].sort().join(',');
const strict = process.env.I18N_STRICT !== '0';
const errors = [], warns = [], rows = [];
const en = P.en || {};
const keys = Object.keys(en).filter((k) => !k.includes('#'));
// the catalogue tags and the selector agree
for (const t of TAGS) if (!P[t]) errors.push(`pack missing: ${t}`);
for (const t of Object.keys(P)) if (!TAGS.includes(t)) errors.push(`pack not in the locked catalogue: ${t}`);
if (!LANGS || LANGS.map((x) => x[0]).join() !== TAGS.join()) errors.push('LABEL_LANGUAGES does not list the 40 tags in catalogue order');
for (const k of keys) if (typeof en[k] !== 'string' || !en[k].trim()) errors.push(`en:${k} empty`);
for (const t of TAGS) {
  const p = P[t] || {};
  let have = 0;
  const missing = [];
  for (const k of keys) {
    const v = p[k];
    if (v == null) { missing.push(k); continue; }
    have++;
    if (typeof v !== 'string' || !v.trim()) { errors.push(`${t}:${k} empty`); continue; }
    if (t !== 'en' && v === en[k] && !SAME_KEY.test(k) && !SAME.has(k) && !SAME.has(t + ':' + k) && !/^[\d\s{}.,:/+-]*$/.test(v)) errors.push(`${t}:${k} is the English text "${v}"`);
    if (ph(v) !== ph(en[k])) errors.push(`${t}:${k} placeholders ${ph(v) || '-'} != English ${ph(en[k]) || '-'}`);
    const max = MAX.get(k);
    if (max && [...v].length > max) warns.push(`${t}:${k} ${[...v].length} > ${max} chars: "${v}"`);
  }
  // plural forms: only under an English key, with its placeholders
  for (const k of Object.keys(p).filter((x) => x.includes('#'))) {
    const [b, c] = k.split('#');
    if (!(b in en) || !['zero', 'one', 'two', 'few', 'many', 'other'].includes(c)) errors.push(`${t}:${k} is not a plural form of an English key`);
    else {
      // a singular, dual or zero form may spell the number out ('one fade', Arabic dual): only {n} may be left out
      const need = ph(en[b]).split(',').filter((x) => x && !(['zero', 'one', 'two'].includes(c) && x === '{n}')).join(',');
      const have = ph(p[k]).split(',').filter((x) => x && !(['zero', 'one', 'two'].includes(c) && x === '{n}')).join(',');
      if (need !== have) errors.push(`${t}:${k} placeholders differ from English`);
    }
  }
  for (const k of Object.keys(p)) if (!k.includes('#') && !(k in en)) errors.push(`${t}:${k} is not an English key`);
  if (missing.length) errors.push(`${t}: ${missing.length} missing key(s)${missing.length <= 12 ? ': ' + missing.join(', ') : ''}`);
  rows.push([t, have, keys.length]);
}
console.log('coverage (' + keys.length + ' keys):');
for (const [t, have, n] of rows) console.log(`  ${t.padEnd(8)} ${String(have).padStart(4)}/${n}  ${((100 * have) / n).toFixed(0).padStart(3)}%`);
for (const w of warns) console.log('warn: ' + w);
for (const e of errors) console.log('fail: ' + e);
console.log(`${errors.length} failure(s), ${warns.length} warning(s)${catalog.length ? '' : ' (no catalogue: length budgets not checked)'}`);
if (errors.length && strict) process.exit(1);
