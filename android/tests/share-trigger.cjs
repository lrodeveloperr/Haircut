'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

class Element {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.className = '';
    this.attributes = {};
    this.listeners = {};
    this.innerHTML = '';
    this.textContent = '';
    this.hidden = false;
    this.disabled = false;
    this.style = {};
    this.classList = {
      contains: name => this.className.split(/\s+/).includes(name),
      add: (...names) => { this.className = [...new Set([...this.className.split(/\s+/).filter(Boolean), ...names])].join(' '); },
      remove: (...names) => { this.className = this.className.split(/\s+/).filter(name => name && !names.includes(name)).join(' '); },
      toggle: (name, force) => {
        const has = this.classList.contains(name), add = force == null ? !has : !!force;
        if (add) this.classList.add(name); else this.classList.remove(name);
        return add;
      },
    };
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  addEventListener(name, fn) { this.listeners[name] = fn; }
  appendChild(child) { this.children.push(child); return child; }
  querySelector(selector) {
    const wanted = selector.startsWith('.') ? selector.slice(1) : selector;
    return this.children.find(child => child.className.split(/\s+/).includes(wanted)) || null;
  }
  click() { return this.listeners.click?.(); }
  getBoundingClientRect() { return this.rect || { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
}

const drawCalls = [];
const canvasContext = {
  beginPath() {}, moveTo() {}, lineTo() {}, rect() {}, quadraticCurveTo() {}, closePath() {}, clip() {},
  save() {}, restore() {}, fillRect() {}, drawImage(...args) { drawCalls.push(args); },
  bezierCurveTo() {}, stroke() {}, arc() {}, fill() {},
  getImageData(x, y, width, height) { return { data: new Uint8ClampedArray(width * height * 4) }; },
  putImageData() {},
  createLinearGradient() { return { addColorStop() {} }; },
  createRadialGradient() { return { addColorStop() {} }; },
  translate() {}, rotate() {}, fillText() {}, strokeText() {}, measureText() { return { width: 100 }; },
};
const hub = new Element('div');
hub.className = 'show';
const replay = new Element('button');
replay.className = 'hsc-replay';
hub.appendChild(replay);
const head = new Element('head');
const haircut = { cells: [1, 2, 3] };
const thumbnailCalls = [];
const shared = [];
const context = {
  console,
  setInterval() {},
  hubInitializations: 0,
  AndroidHost: { shareGame(payload) { shared.push(payload); } },
  skinFadeStudio: {
    getState() { return { status: 'reveal', hair: haircut, startHair: { cells: [9] } }; },
    getView() { return { revealComplete: true }; },
  },
  HSC: {
    hubInit() { context.hubInitializations++; },
    view: {
      thumbnail(hair, yaw, elevation, options) {
        thumbnailCalls.push({ hair, yaw, elevation, options });
        return 'data:image/png;base64,aGVsbG8=';
      },
    },
  },
  document: {
    head,
    createElement(tag) {
      if (tag !== 'canvas') return new Element(tag);
      return {
        width: 0, height: 0,
        getContext() { return canvasContext; },
        toDataURL(type, quality) {
          assert.equal(type, 'image/jpeg');
          assert.equal(quality, .9);
          return 'data:image/jpeg;base64,c2hhcmU=';
        },
      };
    },
    querySelector(selector) { return selector === '#hsc-hub' ? hub : null; },
  },
  Image: class {
    constructor() { this.naturalWidth = 2; this.naturalHeight = 2; }
    set src(value) { this._src = value; queueMicrotask(() => this.onload?.()); }
    get src() { return this._src; }
  },
  innerWidth: 390,
  innerHeight: 844,
  requestAnimationFrame(fn) { fn(); return 1; },
  addEventListener() {},
  MutationObserver: class { observe() {} disconnect() {} },
  Promise,
  queueMicrotask,
};
context.globalThis = context;

(async () => {
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../share.js'), 'utf8'), context);
  context.HSC.hubInit();

  const button = hub.querySelector('.hsc-native-share');
  assert(button, 'one native share control is installed');
  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.attributes['aria-label'], 'Share haircut');
  assert.equal(button.textContent, '', 'the visible control is icon-only');
  assert.equal(button.style.visibility, 'visible');

  await button.click();
  assert.deepEqual(thumbnailCalls.map(call => call.yaw), [50, 50], 'the flyer shows before and after in the same pose');
  assert.equal(thumbnailCalls[1].hair, haircut, 'the after is the exact finished haircut');
  assert.notEqual(thumbnailCalls[0].hair, haircut, 'the before is the hair he came in with');
  for (const call of thumbnailCalls) { assert.equal(call.elevation, 8); assert.equal(call.options.headOnly, false); assert.equal(call.options.size, 1024); }
  assert.deepEqual(shared, ['data:image/jpeg;base64,c2hhcmU=']);
  assert.equal(button.disabled, false);
  assert.equal(button.classList.contains('busy'), false);

  context.HSC.hubInit();
  assert.equal(hub.children.filter(child => child.className.includes('hsc-native-share')).length, 1,
    'reinitialization does not duplicate the control');
  // the name on the flyer is the name on Google Play, in every language that has its own listing
  const source = fs.readFileSync(path.resolve(__dirname, '../share.js'), 'utf8');
  const listing = path.resolve(__dirname, '../store-listing');
  for (const [lang, folder] of Object.entries({ en: 'en-US', ar: 'ar', de: 'de-DE', es: 'es-419', fr: 'fr-FR', hi: 'hi-IN', id: 'id', ja: 'ja-JP', ko: 'ko-KR', pt: 'pt-BR' })) {
    const name = fs.readFileSync(path.join(listing, folder, 'title.txt'), 'utf8').trim();
    assert(source.includes(`${lang}: '${name}'`), `flyer name for ${lang} matches the store title`);
  }
  console.log('PASS: the completion control shares one before-and-after flyer through Android.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
