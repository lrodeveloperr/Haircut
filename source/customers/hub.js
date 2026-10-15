// ---------------------------------------------------------------------------------------------
// Completion screen: after the reveal spin only the finished customer (in the robe they came in with)
// and the next customer, docked against the next button, are left on screen; the top buttons hide (a replay button may take the top-left corner).
// The next customer is a real 3D render; a chime plays
// as the reveal lands, and the gown is brushed off. Also: the streak flame in the top bar.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  const M = () => HSC.meta;
  const INK = '#2a1d15';

  // ---------------- next customer: a real render ----------------
  // The game's own thumbnail() renders the head with any hair grid. For a snapshot the next customer is
  // put on the head for one synchronous render, then the current customer is put back.
  const shots = new Map();
  function snapshot(person, profileId) {
    const key = JSON.stringify([person.seed, !!person.vip, person.beard.style, profileId]);
    if (shots.has(key)) return shots.get(key);
    const v = HSC.view, g = globalThis.skinFadeStudio, W = HSC.walkIns;
    if (!v || !v.thumbnail || !g || !W) return null;
    const s = g.getState();
    const prof = W.list.find((w) => w.id === profileId) || W.list.find((w) => w.contour === 'even');
    let url = null;
    HSC.snapshotting = true;
    try {
      HSC.setPerson(person);
      HSC.setBeard(HSC.beardStartFor(person));
      // their own hair colour (the game sets it only for the customer in the chair)
      if (v.setAppearance) v.setAppearance(person.hair.colour);
      url = v.thumbnail(W.build(prof), 160, 4, { size: 240, headOnly: true });
    } catch (e) {
      console.error('customers: snapshot failed', e);
    } finally {
      try { HSC.setPerson(s.look.person); HSC.setBeard(s.beard); if (v.setAppearance) v.setAppearance(s.look.colour != null ? s.look.colour : 1); } catch (e) {}
      HSC.snapshotting = false;
    }
    if (url) shots.set(key, url);
    if (shots.size > 12) shots.delete(shots.keys().next().value);
    return url;
  }

  // ---------------- reveal sound ----------------
  // synthesised (no audio files): a soft whoosh as the camera spins, a bright bell chime when it lands
  const sfx = { ctx: null, out: null, noise: null };
  const view = () => { try { return globalThis.skinFadeStudio.getView(); } catch (e) { return null; } };
  const audible = () => { const v = view(); return !!(v && v.audio && !v.paused); };
  function ac() {
    if (!sfx.ctx) {
      const C = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!C) return null;
      sfx.ctx = new C();
      sfx.out = sfx.ctx.createGain();
      sfx.out.connect(sfx.ctx.destination);
    }
    if (sfx.ctx.state === 'suspended') sfx.ctx.resume().catch(() => {});
    const v = view();
    sfx.out.gain.value = 0.55 * (v && typeof v.volume === 'number' ? v.volume : 1);
    return sfx.ctx;
  }
  function whoosh() {
    if (!audible()) return;
    const c = ac();
    if (!c) return;
    const t = c.currentTime;
    if (!sfx.noise) {
      sfx.noise = c.createBuffer(1, Math.round(c.sampleRate * 1.2), c.sampleRate);
      const d = sfx.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), gn = c.createGain();
    src.buffer = sfx.noise;
    bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(420, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.75);
    gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(0.22, t + 0.3); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.05);
    src.connect(bp).connect(gn).connect(sfx.out);
    src.start(t); src.stop(t + 1.1);
  }
  function chime(levelUp) {
    if (!audible()) return;
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + 0.02;
    const notes = levelUp ? [1046.5, 1318.5, 1568, 2093, 2637] : [1046.5, 1318.5, 1568, 2093];
    notes.forEach((f, i) => {
      const t = t0 + i * 0.075;
      for (const [mul, amp] of [[1, 0.16], [2.76, 0.045], [5.4, 0.015]]) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = f * mul;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(amp, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3 / mul + 0.25);
        o.connect(g).connect(sfx.out);
        o.start(t); o.stop(t + 1.6);
      }
    });
    // a little sparkle on top
    for (let k = 0; k < 6; k++) {
      const t = t0 + 0.28 + k * 0.06 + Math.random() * 0.03;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = 3200 + Math.random() * 2600;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.03, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(sfx.out);
      o.start(t); o.stop(t + 0.15);
    }
  }

  // ---------------- UI ----------------
  const ICON = {
    replay: '<svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="translate(0 1.5)"><path d="M12 5A7 7 0 1 1 5 12"/><path d="M8.4 5L12.6 1.9V8.1Z" fill="currentColor" stroke-width="1.6"/></g></svg>',
    play: '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',
    tick: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    star: '<svg viewBox="0 0 24 24" width="40" height="40"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffc83d" stroke="#2a1d15" stroke-width="2" stroke-linejoin="round"/></svg>',
    flame: '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-6 1-9.5z" fill="#ff8a3d" stroke="#2a1d15" stroke-width="2" stroke-linejoin="round"/></svg>',
    crown: '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M3 18l1.5-11 5 5L12 4l2.5 8 5-5L21 18z" fill="#ffc83d" stroke="#2a1d15" stroke-width="2" stroke-linejoin="round"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    spark: '<svg viewBox="0 0 24 24" width="26" height="26"><path d="M12 1.5l2.2 7.3 7.3 2.2-7.3 2.2L12 20.5l-2.2-7.3L2.5 11l7.3-2.2z" fill="#fff6e6" stroke="#2a1d15" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    gown: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M9 3h6l1 2 5 3-2 13H5L3 8l5-3z"/></svg>',
    clipper: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M8 3h8a2 2 0 0 1 2 2v12H6V5a2 2 0 0 1 2-2z"/><path d="M5 17h14v3H5z"/></svg>',
  };
  const CSS = `
#hsc-hub{position:fixed;inset:0;z-index:19;pointer-events:none;font-family:"DM Sans",system-ui,-apple-system,"Segoe UI",sans-serif;color:${INK};opacity:0;transition:opacity .35s}
#hsc-hub.show{opacity:1}
#hsc-hub.show .hsc-hit{pointer-events:auto}
@keyframes hsc-pop{0%{transform:scale(1)}40%{transform:scale(1.25)}100%{transform:scale(1)}}
.hsc-next{position:absolute;width:92px;height:92px;border-radius:20px;border:3px solid ${INK};background:radial-gradient(circle at 50% 35%,#fff6e6,#e4d2b4);overflow:visible}
.hsc-next img{width:100%;height:100%;border-radius:17px;display:block;object-fit:cover}
#hsc-dock{position:fixed;display:none;border-radius:30px;background:#fff6e6;border:3px solid ${INK};box-shadow:0 4px 0 ${INK};pointer-events:none}
#hsc-dock.show{display:block;animation:hsc-in .3s ease-out}
@keyframes hsc-in{from{opacity:0;transform:translateY(8px)}}
.hsc-hint{position:absolute;color:${INK};animation:hsc-nudge 1s ease-in-out infinite}
@keyframes hsc-nudge{50%{transform:translateX(4px)}}
.hsc-new{position:absolute;right:-12px;top:-12px;animation:hsc-spin 2.4s linear infinite}
@keyframes hsc-spin{to{transform:rotate(360deg)}}
.hsc-flag{position:absolute;left:-8px;top:-10px}
.hsc-crown{position:absolute;left:50%;top:-20px;transform:translateX(-50%) rotate(-6deg)}
/* replay this customer: the cream of the next row with an ink outline; the video badge in the next
   button's yellow marks that it plays a video. The arrow is centred in its own box. */
.hsc-replay{position:absolute;width:76px;height:76px;border-radius:50%;padding:0;display:flex;align-items:center;justify-content:center;background:#fff6e6;color:${INK};border:3px solid ${INK};box-shadow:0 4px 0 ${INK};cursor:pointer;animation:hsc-rbreathe 1.3s ease-in-out infinite}
.hsc-replay>svg{display:block;width:44%;height:44%;flex:none}
.hsc-replay .hsc-ad{position:absolute;right:-8px;bottom:-6px;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#ffb627;color:${INK};border:2.5px solid ${INK}}
.hsc-replay .hsc-ad svg{display:block}
.hsc-replay:disabled{animation:none;opacity:.6;cursor:default}
.hsc-replay:not(:disabled):active{transform:translateY(3px);box-shadow:0 1px 0 ${INK}}
@keyframes hsc-rbreathe{50%{transform:scale(1.05)}}
.hsc-replay[hidden]{display:none}
/* in the top-left corner: the same size as the other top-row buttons */
.hsc-replay.top{border-width:3px;box-shadow:0 3px 0 ${INK};animation:none}
.hsc-replay.top>svg{width:50%;height:50%}
.hsc-replay.top .hsc-ad{width:24px;height:24px;right:-8px;bottom:-7px;border-width:2px}
.hsc-replay.top .hsc-ad svg{width:16px;height:16px}
@media (prefers-reduced-motion:reduce){.hsc-replay{animation:none}}
body.hsc-reveal #hsc-hud,body.hsc-spin #hsc-hud{opacity:0;pointer-events:none;visibility:hidden}
#hsc-hub .hsc-next.hsc-hit{cursor:pointer}
body.hsc-reveal #hsc-hud *{pointer-events:none}
body.hsc-reveal .ui .top{visibility:hidden}
.hsc-streak[hidden],#hsc-hub [hidden]{display:none}
`;

  const st = { job: null, round: null, el: {}, built: false };

  function build() {
    if (st.built || !document.body) return;
    st.built = true;
    const style = document.createElement('style');
    style.textContent = CSS + TUT_CSS;
    document.head.appendChild(style);
    const hub = document.createElement('div');
    hub.id = 'hsc-hub';
    hub.innerHTML = `
      <div class="hsc-next hsc-hit" aria-hidden="true"><img alt=""></div>
      <span class="hsc-hint" aria-hidden="true">${ICON.chev}</span>
      <button class="hsc-replay hsc-hit" type="button" aria-label="Watch a video to cut this customer again">${ICON.replay}<span class="hsc-ad">${HSC.AD_ICON ? HSC.AD_ICON(22) : ''}</span></button>
`;
    document.body.appendChild(hub);
    st.el = {
      hub,
      next: hub.querySelector('.hsc-next'), nextImg: hub.querySelector('.hsc-next img'), hint: hub.querySelector('.hsc-hint'),
      replay: hub.querySelector('.hsc-replay'),
    };
    st.el.replay.addEventListener('click', replay);
    // the next customer's picture is part of the next button
    st.el.next.addEventListener('click', () => { const b = document.querySelector('.training-continue'); if (b && !b.disabled) b.click(); });
    // a mouse or touch press does not leave a top button focused (Space / Enter stay with the game)
    document.addEventListener('click', (e) => { const a = document.activeElement; if (e.detail > 0 && a && a.tagName === 'BUTTON' && !a.closest('#hsc-panel')) setTimeout(() => a.blur(), 0); }, true);
    // the dock sits under the game's next button (inside the game root, before its HUD), so the next
    // customer and the next button read as one control
    const dock = document.createElement('div');
    dock.id = 'hsc-dock';
    const game = document.getElementById('game'), hud = document.getElementById('hud');
    if (game) game.insertBefore(dock, hud && hud.parentNode === game ? hud : null); else document.body.appendChild(dock);
    st.el.dock = dock;
    // the first tap anywhere lets the reveal sounds play later
    document.addEventListener('pointerdown', () => { if (audible()) ac(); }, true);
    // the next button hides the hub at once
    document.addEventListener('click', (e) => { if (e.target && e.target.closest && e.target.closest('.training-continue')) leaveReveal(); }, true);
    setInterval(tick, 150);
  }
  function streakChip() {
    const row = document.querySelector('#hsc-hud .hsc-row');
    if (!row) return;
    let chip = row.querySelector('.hsc-streak');
    if (!chip) {
      chip = document.createElement('div');
      chip.className = 'hsc-pill hsc-streak';
      chip.innerHTML = `${ICON.flame}<span></span>`;
      row.appendChild(chip);
    }
    const n = M() && M().data ? (M().streakNow ? M().streakNow() : M().data.streak) : 0;
    chip.hidden = n < 1;
    chip.querySelector('span').textContent = n;
    chip.setAttribute('aria-label', 'Days in a row: ' + n);
  }

  HSC.onHaircutDone = function (state) {
    if (!M() || !M().data) return;
    build();
    const info = M().onFinish(state);
    st.round = { job: state.jobId, info, shown: false };
    render();
    streakChip();
    HSC.brushClippings && HSC.brushClippings();
    whoosh();
  };

  function render() {
    if (!st.built || !st.round) return;
    const d = M().data;
    // next customer
    const q = d.queue && st.round.info && d.queue.job === st.round.info.job ? d.queue.person : null;
    st.el.next.hidden = !q;
    if (q) {
      const want = st.round.shown || st.round.ready, url = want ? snapshot(q, d.queue.profile) : null;
      if (url) st.el.nextImg.src = url;
      // no picture (the render failed): no card, never an older customer's picture
      else if (want) { st.el.next.hidden = true; return; }
      st.el.next.querySelectorAll('.hsc-new,.hsc-flag,.hsc-crown').forEach((n) => n.remove());
      if (q.vip) st.el.next.insertAdjacentHTML('beforeend', `<span class="hsc-crown">${ICON.crown}</span>`);
      const isNew = st.round.info.levelUp || q.daily;
      if (isNew) st.el.next.insertAdjacentHTML('beforeend', `<span class="hsc-new">${ICON.spark}</span>`);
      if (q.daily) st.el.next.insertAdjacentHTML('beforeend', `<span class="hsc-flag">${ICON.flame}</span>`);
    }
  }

  // one video, then the same customer walks back in with the hair they came with
  async function replay() {
    const g = globalThis.skinFadeStudio, b = st.el.replay, r = st.round;
    if (!g || !g.replay || b.disabled || !r || r.left || g.getState().status !== 'reveal') return;
    b.disabled = true;
    const ok = HSC.watchVideo ? await HSC.watchVideo('replay-customer') : false;
    const job = r.job, here = () => g.getState().status === 'reveal' && g.getState().jobId === job;
    if (ok && here()) {
      leaveReveal();
      // the game can stay paused for a while after the video (the platform resumes it): the replay is paid
      // for, so it waits until the game takes it, unless the player has moved on
      let done = false;
      const until = Date.now() + 120000;
      while (!done && here() && Date.now() < until) {
        done = await g.replay();
        if (!done) await new Promise((res) => setTimeout(res, 150));
      }
      if (!done && here()) r.left = false;
    } else if (!ok) HSC.nope && HSC.nope(b);
    b.disabled = false;
  }

  // the next customer docks right against the game's next button
  function layout() {
    const arrow = document.querySelector('.training-continue');
    if (!arrow) return;
    const r = arrow.getBoundingClientRect();
    if (!r.width) return;
    // worked out in screen pixels at the UI scale S; the hub layer is drawn at S, so its positions are divided
    // by S (the dock lives in the unscaled game root)
    const S = HSC.S || 1, px = (v) => v / S + 'px';
    const card = Math.round(Math.max(72 * S, Math.min(100 * S, r.height * 1.12))), gap = 22 * S, pad = 8 * S;
    const cx = r.left - gap - card, cy = r.top + r.height / 2 - card / 2;
    Object.assign(st.el.next.style, { left: px(cx), top: px(cy), width: px(card), height: px(card) });
    Object.assign(st.el.hint.style, { left: px(r.left - gap), top: px(r.top + r.height / 2 - 11 * S) });
    const top = Math.min(cy, r.top) - pad, bottom = Math.max(cy + card, r.bottom) + pad;
    Object.assign(st.el.dock.style, { left: cx - pad + 'px', top: top + 'px', width: r.right + pad - (cx - pad) + 'px', height: bottom - top + 'px', borderRadius: 30 * S + 'px', borderWidth: Math.max(2, 3 * S) + 'px' });
    // replay sits level with the next button, in the far corner from it
    const rb = st.el.replay;
    let size = Math.round(Math.max(64 * S, Math.min(80 * S, r.height)));
    rb.hidden = !(HSC.canVideo && HSC.canVideo());
    const vw = innerWidth, onLeft = (cx + r.right) / 2 > vw / 2, dockL = cx - pad, dockR = r.right + pad;
    const midY = r.top + r.height / 2 - size / 2, sp = 16 * S, edgeMin = 12 * S;
    let rx, ry, side, stacked = false;
    if (innerHeight >= innerWidth) {
      // portrait: the mirror image of the next row, as far from its edge as the row is from the other edge;
      // too narrow to sit beside the row: above it, on the same side
      const gap2 = Math.max(18 * S, onLeft ? vw - dockR : dockL);
      rx = onLeft ? gap2 : vw - gap2 - size;
      const clash = onLeft ? rx + size + 10 * S > dockL : rx - 10 * S < dockR;
      ry = midY;
      side = onLeft ? 'left' : 'right';
      if (clash) stacked = true;
    } else {
      // landscape: the row sits beside the customer; replay joins it on its outer side (never over the
      // customer), or sits right above its outer end when there is no room beside it
      const outerLeft = (dockL + dockR) / 2 < vw / 2;
      const beside = outerLeft ? dockL - sp - size >= edgeMin : dockR + sp + size <= vw - edgeMin;
      if (beside) { rx = outerLeft ? dockL - sp - size : dockR + sp; ry = midY; }
      else stacked = true;
      side = 'left';
    }
    // no room beside the next row: the top-left corner instead (the top buttons are hidden on this screen),
    // lined up with where the sound button sits
    if (stacked) {
      const a = document.querySelector('.ui .top');
      const ar = a ? a.getBoundingClientRect() : null;
      rx = ar && ar.width ? ar.left : 12 * S;
      ry = ar && ar.height ? ar.top : 12 * S;
      side = 'left';
      size = 48 * S;
    }
    rb.classList.toggle('top', stacked);
    const gapPx = side === 'left' ? rx : vw - rx - size;
    side = `max(${gapPx / S}px, env(safe-area-inset-${side}))`;
    const onLeftSide = stacked || innerHeight < innerWidth ? true : onLeft;
    Object.assign(rb.style, { left: onLeftSide ? side : 'auto', right: onLeftSide ? 'auto' : side, top: px(ry), width: px(size), height: px(size) });
  }

  // a short pause on input after a screen goes away: the second tap of a double tap would land on what
  // appears under the finger (the clipper button sits where next was)
  let settleT = 0;
  HSC.settle = () => { document.body.classList.add('hsc-settle'); clearTimeout(settleT); settleT = setTimeout(() => document.body.classList.remove('hsc-settle'), 450); };

  // the player left the reveal
  function leaveReveal() {
    const r = st.round;
    if (!r || r.left) return;
    r.left = true;
    HSC.settle();
    st.el.hub && st.el.hub.classList.remove('show');
    st.el.dock && st.el.dock.classList.remove('show');
    document.body.classList.remove('hsc-reveal');
  }

  function tick() {
    const g = globalThis.skinFadeStudio;
    if (!g || !M() || !M().data) return;
    const s = g.getState(), v = g.getView();
    if (st.job !== s.jobId) {
      if (st.round && st.round.job !== s.jobId) { leaveReveal(); st.round = null; }
      st.job = s.jobId;
      streakChip();
    }
    const q0 = M().data.queue;
    if (s.status === 'reveal' && !st.round && (!q0 || q0.job !== s.jobId + 1) && !HSC.otherTab) {
      // a reload during the reveal, and the haircut never reached the progress save (the tab closed between
      // the two saves): count it now, so the next customer is chosen and shown
      HSC.onHaircutDone(s);
    }
    if (s.status === 'reveal' && !st.round) {
      // a reload during the reveal
      const cuts = M().data.cuts, q = M().data.queue;
      const levelUp = cuts > 0 && M().levelOf(cuts) > M().levelOf(cuts - 1) && !!q && q.job === s.jobId + 1;
      st.round = { job: s.jobId, info: { levelUp, job: s.jobId + 1 }, shown: false };
      render();
    }
    document.body.classList.toggle('hsc-spin', s.status === 'reveal' && !v.revealComplete);
    const show = s.status === 'reveal' && v.revealComplete && st.round && st.round.job === s.jobId && !st.round.left;
    if (show && !st.el.hub.classList.contains('show')) {
      // render the next customer now that the spin has stopped, then show everything
      st.round.ready = true;
      render();
      st.round.shown = true;
      st.el.hub.classList.add('show');
      st.el.dock.classList.add('show');
      document.body.classList.add('hsc-reveal');
      chime(!!(st.round.info && st.round.info.levelUp));
    }
    if (!show && st.el.hub.classList.contains('show')) { st.el.hub.classList.remove('show'); st.el.dock.classList.remove('show'); document.body.classList.remove('hsc-reveal'); }
    if (show) layout();
  }

  // ---------------- first-time "turn the customer" hint ----------------
  // One layout on every screen: the turn icon beside a dotted arc, the hand sweeping along it, the group
  // centred above the head. Only the arc scales with the head (60% of its width, it shows the motion over
  // the head); the icon and the hand keep the size of the game's other buttons and hints. The whole hint
  // ends just above the top of the hair and keeps clear of the top buttons.
  // Geometry at arc scale k, relative to the anchor (the arc's left end), in px:
  //   arc box   x -8k..132k, y -30k..10k (ends at y 0, top of the curve at -18k)
  //   icon 38px x -8k-50..-8k-12, y -26..12          hand 44x48 from (-10,-6), sweeping 118k to the right
  HSC.tutSpinLayout = function (head0, vw0) {
    // the hint is drawn at the UI scale: lay it out in its own (scaled) pixels, hand back screen pixels
    const S = HSC.S || 1;
    const head = { x: head0.x / S, top: head0.top / S, left: head0.left / S, right: head0.right / S }, vw = vw0 / S;
    const out = spinLayout(head, vw, S);
    return { left: out.left * S, top: out.top * S, k: out.k };
  };
  function spinLayout(head, vw, S) {
    const W = head.right - head.left;
    const hairTop = head.top - 0.11 * W; // the scalp top from the game, plus the hair standing on it
    const gap = 8;
    const tops = [...document.querySelectorAll('.ui .top > *, .ui .top button, #hsc-hud .hsc-row')]
      .map((e) => e.getBoundingClientRect()).map((r) => ({ left: r.left / S, right: r.right / S, top: r.top / S, bottom: r.bottom / S, width: r.width })).filter((r) => r.width && r.top < 160);
    const place = (k) => {
      const gl = -8 * k - 50, gr = Math.max(132 * k, 118 * k + 34);
      const left = Math.max(8 - gl, Math.min(vw - 8 - gr, head.x - (gl + 132 * k) / 2));
      const top = hairTop - gap - 42;
      const box = { l: left + gl, t: top + Math.min(-26, -20 * k), r: left + gr };
      const limit = Math.max(8, ...tops.filter((r) => r.right > box.l && r.left < box.r).map((r) => r.bottom + 6));
      return { left, top, k, fits: box.t >= limit, room: top - limit, below: limit + Math.max(26, 20 * k) };
    };
    let k = Math.max(0.6, Math.min(2.6, (0.6 * W) / 140));
    let p = place(k);
    // too little room for a tall curve: flatten (shrink) the arc, the icon and hand stay
    if (!p.fits && p.room > 26) { k = Math.max(0.6, Math.min(k, p.room / 20)); p = place(k); }
    // no room above the head at all (tiny screens): just below the top buttons, never under them
    if (!p.fits) p = Object.assign({}, p, { top: p.below });
    return { left: p.left, top: p.top, k };
  }
  const TUT_CSS = `
.tutorial.tut-spin .tut-path{left:calc(-8px * var(--k,1));top:calc(-30px * var(--k,1));width:calc(140px * var(--k,1));height:calc(40px * var(--k,1))}
.tutorial.tut-spin .tut-trail{vector-effect:non-scaling-stroke}
.tutorial.tut-spin .tut-tool{left:calc(-8px * var(--k,1) - 50px);top:-26px}
.tutorial.tut-spin .tut-hand{animation-name:hsc-across}
@keyframes hsc-across{0%,12%{transform:translateX(0);opacity:0}20%{opacity:1}80%{transform:translateX(calc(118px * var(--k,1)));opacity:1}100%{transform:translateX(calc(118px * var(--k,1)));opacity:0}}`;

  HSC.tutStyle = function (h) {
    const S = HSC.S || 1;
    if (S === 1 || !h) return h;
    const o = Object.assign({}, h);
    for (const k of ['left', 'top']) if (typeof o[k] === 'string' && o[k].endsWith('px')) o[k] = parseFloat(o[k]) / S + 'px';
    return o;
  };

  HSC.hubInit = function () {
    build();
    streakChip();
  };
})(globalThis.HSC || (globalThis.HSC = {}));
