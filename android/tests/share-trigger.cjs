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
  hubInitializations: 0,
  AndroidHost: { shareGame(payload) { shared.push(payload); } },
  skinFadeStudio: {
    getState() { return { status: 'reveal', hair: haircut }; },
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
  assert.equal(button.style.left, 'auto');
  assert.equal(button.style.right, 'max(12px, env(safe-area-inset-right))');
  assert.equal(button.style.top, 'max(12px, env(safe-area-inset-top))');
  assert.equal(button.style.visibility, 'visible');

  await button.click();
  assert.deepEqual(thumbnailCalls.map(call => call.yaw), [180, 90, 0, -90],
    'the shared card renders front, right, back and left in that order');
  for (const call of thumbnailCalls) {
    assert.equal(call.hair, haircut, 'all four views use the exact finished haircut');
    assert.equal(call.elevation, 8);
    assert.equal(call.options.headOnly, false);
    assert.equal(call.options.size, 640);
  }
  assert.deepEqual(shared, ['data:image/jpeg;base64,c2hhcmU=']);
  const composed = drawCalls.filter(call => call.length === 9);
  assert.equal(composed.length, 8, 'four backgrounds and four complete customer renders are composed');
  const hero = composed[1];
  const portraits = [composed[3], composed[5], composed[7]];
  assert(hero[8] > portraits[0][8], 'the direct-back hero is taller than each supporting portrait');
  const heroPanelHeight = hero[6] / .16;
  const supportHeight = 1920 - heroPanelHeight;
  const heroRatio = hero[6] / heroPanelHeight;
  assert(Math.abs(heroRatio - .16) < .002, 'the hero uses the intended proportional top breathing room');
  for (const portrait of portraits) {
    const supportRatio = (portrait[6] - heroPanelHeight) / supportHeight;
    assert(Math.abs(supportRatio - heroRatio) < .002,
      'every supporting head uses the same proportional top breathing room as the hero');
    const bottom = portrait[6] + portrait[8];
    assert(bottom >= 1919 && bottom <= 1924,
      'each supporting cape reaches the lower edge without a dead strip');
  }
  assert.equal(button.disabled, false);
  assert.equal(button.classList.contains('busy'), false);

  context.HSC.hubInit();
  assert.equal(hub.children.filter(child => child.className.includes('hsc-native-share')).length, 1,
    'reinitialization does not duplicate the control');
  console.log('PASS: right-edge completion control shares one four-angle image through Android.');
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
