// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-chosen layout (option 2) and theme (Jelly Gold), 5 November 2026):
// the home screen.
// The cutting screen keeps only the cutting itself. Home is the owner-chosen Bottom Dock (docs/UI-OPTIONS.md):
//
//   picture  the player's current barbershop, whole and unzoomed, with no customer (salon.js homePicture)
//   top row  the level badge and its progress, the day streak, the coins and the settings gear
//   play     Quick Play first and Career second (docs/MAIN-MENU-AND-MODE-ROUTING-CONTRACT.md, owner-locked), in thumb reach
//   dock     Modes, Shop, Collection, in that order. Shop holds everything earned or bought: the free bonuses (Gift,
//            daily rewards) as well as Salon and Wardrobe. Collection is the career portfolio.
// The features' own buttons wait out of sight in .hold, so each panel opens exactly as before.
// A returning barber starts here; a first-time player goes straight to the first customer.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f';
  const t = (k) => (HSC.t ? HSC.t(k) : k);
  const I = (n, s) => (HSC.icon ? HSC.icon(n, s) : '');
  // each feature's own button and where it goes on the home screen
  const PLACE = [['#hsc-goals-btn', '.hold'], ['#hsc-set-btn', '.gear'], ['.hsc-rw', '.hold'], ['#hsc-salon-btn', '.hold'], ['#hsc-book-btn', '.hold'], ['#hsc-album-btn', '.hold']];
  const MODE_ICON = { requests: 'orders', free: 'freestyle', fix: 'rescue', beard: 'beards', rush: 'rush' };
  const MODE_WORD = Object.assign({}, MODE_ICON, { free: 'quick_play' });
  const MODE_COLOUR = { requests: 'green', free: 'yellow', fix: 'red', beard: 'orange', rush: 'purple' };
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#fff'}" stroke-width="2.4" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2"'}/></svg>`;
  // what each mode pays, shown on its card: numbers and icons only
  // Truthful minimums/bonuses from economy.js. A trailing + means skill, services or time can add more.
  const REWARD = { requests: () => I('coin') + '24+', free: () => I('coin') + '0', fix: () => I('coin') + '34+', beard: () => I('coin') + '22+', rush: () => I('coin') + '20+' };
  const CSS = `
#hsc-menu-btn{padding:0}
#hsc-menu{position:fixed;inset:0;z-index:29;zoom:var(--hsc-s,1);display:none;pointer-events:auto;touch-action:manipulation;font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,-apple-system,"Segoe UI",sans-serif;color:${K};-webkit-user-select:none;user-select:none;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,#38d1e8,#1679c9 55%,#0d3f86)}
#hsc-menu::before{content:"";position:absolute;inset:-50%;background:repeating-linear-gradient(-35deg,#ffffff12 0 22px,#0000 22px 60px);animation:hsc-pole 14s linear infinite;pointer-events:none}
#hsc-menu::after{content:"";position:absolute;inset:0;background:radial-gradient(60% 40% at 50% 112%,#ffd76a66,#0000);pointer-events:none}
@keyframes hsc-pole{to{transform:translateX(60px)}}
#hsc-menu.open{display:block}
#hsc-menu .hold{display:none}
#hsc-menu .page{position:relative;z-index:1;box-sizing:border-box;height:100%;max-width:600px;margin:0 auto;display:grid;gap:12px;padding:max(12px,env(safe-area-inset-top)) max(12px,env(safe-area-inset-right)) max(14px,env(safe-area-inset-bottom)) max(12px,env(safe-area-inset-left))}
#hsc-menu .page[hidden]{display:none}
/* the game's own sheet also uses .top and .home: pin this grid so nothing outside places its parts */
#hsc-menu .page{grid-template-areas:none;grid-template-columns:minmax(0,1fr);grid-auto-flow:row}
#hsc-menu .page > *{grid-area:auto;margin:0}
#hsc-menu .page.in{animation:hsc-pagein .42s cubic-bezier(.2,1.3,.4,1)}
#hsc-menu .page.back-in{animation:hsc-pageback .42s cubic-bezier(.2,1.3,.4,1)}
@keyframes hsc-pagein{from{transform:translateX(16%) scale(.96);opacity:0}}
@keyframes hsc-pageback{from{transform:translateX(-16%) scale(.96);opacity:0}}
#hsc-menu .home{grid-template-rows:48px minmax(0,1fr) auto auto}
#hsc-menu .modes{grid-template-rows:48px minmax(0,1fr)}
/* ---- jelly: the shared button ---- */
#hsc-menu .j{position:relative;box-sizing:border-box;border:3px solid ${K};border-radius:22px;box-shadow:inset 0 -7px 0 #0003,inset 0 3px 0 #fff6,0 6px 0 ${K},0 10px 14px #0005;cursor:pointer;color:${K};font:inherit;padding:0;transition:transform .32s cubic-bezier(.3,1.8,.5,1),box-shadow .2s}
#hsc-menu .j::before{content:"";position:absolute;left:10%;right:10%;top:5%;height:24%;border-radius:999px;background:linear-gradient(#ffffffc8,#fff0);pointer-events:none}
#hsc-menu .j:active{transform:translateY(5px) scale(1.03,.95);box-shadow:inset 0 -4px 0 #0003,inset 0 3px 0 #fff6,0 1px 0 ${K},0 4px 6px #0005;transition:transform .06s,box-shadow .06s}
#hsc-menu .j:focus-visible{outline:4px solid #4fc3ff;outline-offset:3px}
@media (hover:hover){#hsc-menu .j:hover{filter:brightness(1.06) saturate(1.05)}}
#hsc-menu .c-green{background:linear-gradient(#9cf06c,#36b83a)}#hsc-menu .c-yellow{background:linear-gradient(#ffe682,#ffb21a)}#hsc-menu .c-pink{background:linear-gradient(#ffb8d4,#ff5c98)}#hsc-menu .c-blue{background:linear-gradient(#a8e4ff,#3aa2f2)}#hsc-menu .c-orange{background:linear-gradient(#ffc98a,#ff7d2e)}#hsc-menu .c-mint{background:linear-gradient(#b6f5d8,#2fc68f)}#hsc-menu .c-white{background:linear-gradient(#fff,#dfe8f2)}#hsc-menu .c-purple{background:linear-gradient(#e4b8ff,#9c4ef0)}#hsc-menu .c-red{background:linear-gradient(#ffa59b,#f04436)}
#hsc-menu .hsc-ic{display:block;flex:none}
#hsc-menu .hsc-lbl{display:block;max-width:100%;white-space:nowrap;overflow:hidden;text-align:center;font-weight:900;line-height:1.2}
#hsc-menu .hsc-dot{position:absolute;right:-7px;top:-7px;width:22px;height:22px;z-index:2}
/* ---- top row: everything 48 tall on one centre line ---- */
#hsc-menu .top{display:flex;align-items:center;gap:8px;min-width:0;height:48px}
#hsc-menu .chip{box-sizing:border-box;display:flex;align-items:center;gap:6px;height:44px;flex:none;padding:0 14px 0 6px;border-radius:22px;background:#10223fcc;border:2px solid #ffffff30;color:#fff;font-weight:900;font-size:18px;line-height:1;font-variant-numeric:tabular-nums;white-space:nowrap;unicode-bidi:isolate}
#hsc-menu .chip .hsc-ic{width:32px;height:32px}
#hsc-menu .lvl{box-sizing:border-box;display:flex;align-items:center;gap:8px;height:48px;padding-inline-end:14px;border-radius:24px;background:#10223fcc;border:2px solid #ffffff30;flex:0 1 auto;min-width:0}
#hsc-menu .lvl .lv{width:48px;height:48px;margin:-2px;flex:none}
#hsc-menu .lvl .lv .hsc-ic{width:100%;height:100%}
#hsc-menu .xp{width:clamp(32px,12vw,90px);height:12px;border-radius:6px;background:#ffffff35;overflow:hidden}
#hsc-menu .xp i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a);border-radius:6px;transition:width .6s}
#hsc-menu .coins{margin-inline-start:auto}
#hsc-menu .gear{display:flex}
#hsc-menu .gear .hsc-btn{width:48px;height:48px;border-radius:50%;background:#10223fcc;border:2px solid #ffffff30;box-shadow:none;display:flex;align-items:center;justify-content:center;padding:0}
#hsc-menu .gear .hsc-btn > svg:not(.hsc-ic){display:none}
#hsc-menu .gear .hsc-btn .hsc-ic{width:34px;height:34px}
/* ---- Home: the shop on show, the play cards in thumb reach, the dock ---- */
#hsc-menu.athome{background:#2a2622 center/cover no-repeat}
#hsc-menu.athome::before,#hsc-menu.athome::after{display:none}
#hsc-menu .home{max-width:none}
#hsc-menu .home .top{position:relative}
#hsc-menu .grow{min-height:0}
#hsc-menu .duo{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:12px;width:100%;max-width:640px;margin:0 auto;height:clamp(92px,14vh,132px)}
#hsc-menu .qp,#hsc-menu .hero{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;border:0;border-radius:20px;color:#fff;box-shadow:inset 0 2px 0 #fff5,0 6px 0 var(--edge),0 10px 16px #0005}
#hsc-menu .j.qp::before,#hsc-menu .j.hero::before{display:none}
#hsc-menu .qp{--edge:#c9921a;background:linear-gradient(#ffd55c,#ffb820);color:${K}}
#hsc-menu .hero{--edge:#2f8f3c;background:linear-gradient(#5fd06a,#37ae48)}
#hsc-menu .j.qp:active,#hsc-menu .j.hero:active{box-shadow:inset 0 2px 0 #fff5,0 1px 0 var(--edge)}
#hsc-menu .qp .hsc-lbl{font-size:clamp(19px,5.4vw,26px);white-space:normal;line-height:1.05;text-wrap:balance;padding:0 8px}
#hsc-menu .hero .hsc-lbl{font-size:clamp(23px,6.6vw,32px)}
#hsc-menu .hero .sub{font-size:14px;font-weight:800;opacity:.95;max-width:92%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#hsc-menu .hero .sub:empty{display:none}
#hsc-menu .dock{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));width:calc(100% + 24px + env(safe-area-inset-left) + env(safe-area-inset-right));margin:6px -12px calc(-14px - env(safe-area-inset-bottom));padding:6px 12px calc(8px + env(safe-area-inset-bottom));box-sizing:border-box;background:#fff;box-shadow:0 -3px 0 #d5dde8}
#hsc-menu .dock button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:62px;background:none;border:0;padding:0;font:inherit;color:${K};cursor:pointer;border-radius:14px}
#hsc-menu .dock button:active{background:#eef3fa}
#hsc-menu .dock button:focus-visible{outline:4px solid #4fc3ff}
#hsc-menu .dock .hsc-ic{width:32px;height:32px}
#hsc-menu .dock .hsc-lbl{font-size:14px;width:100%}
#hsc-menu .dock .hsc-dot{right:calc(50% - 26px);top:2px;width:14px;height:14px}
/* ---- the Shop page: free bonuses first, then the two stores ---- */
#hsc-menu .shop{grid-template-rows:48px minmax(0,1fr)}
#hsc-menu .sgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:12px;min-height:0;padding:4px 2px 10px}
#hsc-menu .tile{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;min-height:0;container-type:size}
#hsc-menu .tile .hsc-ic{width:min(46cqw,46cqh,110px);height:auto;aspect-ratio:1}
#hsc-menu .tile .hsc-lbl{font-size:clamp(15px,12cqmin,24px);width:100%}
/* ---- the modes screen ---- */
#hsc-menu .mhead{display:flex;align-items:center;gap:10px;height:48px}
#hsc-menu .back{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center}
#hsc-menu .back .hsc-ic{width:28px;height:28px}
#hsc-menu .title{display:flex;align-items:center;gap:8px;min-width:0;color:#fff;font-weight:900;font-size:clamp(22px,6vw,34px);-webkit-text-stroke:3px ${K};paint-order:stroke fill;text-shadow:0 3px 0 ${K}}
#hsc-menu .title .hsc-ic{width:44px;height:44px}
#hsc-menu .title .hsc-lbl{overflow:visible}
#hsc-menu .mhead .coins{margin-inline-start:auto}
#hsc-menu .mgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(0,1fr);gap:12px;min-height:0;padding:4px 2px 10px}
#hsc-menu .mode{display:grid;grid-template-rows:minmax(0,1fr) auto auto;justify-items:center;align-items:center;row-gap:6px;padding:12px 10px 16px;overflow:hidden;container-type:size}
#hsc-menu .mode .hsc-ic{width:min(48cqw,46cqh,130px);height:auto;aspect-ratio:1;align-self:end;animation:hsc-float 3.2s ease-in-out infinite;filter:drop-shadow(0 5px 4px #0003)}
#hsc-menu .mode:nth-child(2n) .hsc-ic{animation-delay:-1.1s}#hsc-menu .mode:nth-child(3n) .hsc-ic{animation-delay:-2.2s}
@keyframes hsc-float{50%{transform:translateY(-6%) rotate(2deg)}}
#hsc-menu .mode .hsc-lbl{font-size:clamp(14px,13cqmin,32px);width:100%}
#hsc-menu .mode .reward{display:flex;align-items:center;gap:3px;height:clamp(22px,13cqmin,34px);padding:0 10px;border-radius:99px;background:${K};color:#ffe682;font-weight:900;font-size:clamp(12px,9cqmin,20px);font-variant-numeric:tabular-nums;white-space:nowrap}
#hsc-menu .mode .reward .hsc-ic,#hsc-menu .mode .reward svg{width:1.25em;height:1.25em;animation:none;filter:none}
#hsc-menu .mode .hsc-dot{right:8px;top:8px}
#hsc-menu .mode .new{position:absolute;top:9%;left:-14%;width:52%;transform:rotate(-38deg);text-align:center;background:#f04436;color:#fff;font-weight:900;font-size:clamp(10px,7cqmin,15px);padding:2px 0;box-shadow:0 2px 0 ${K};z-index:2}
#hsc-menu .mode .lock{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4%;background:#10223fb8;color:#fff;font-weight:900;font-size:clamp(16px,13cqmin,30px)}
#hsc-menu .mode .lock .hsc-ic{width:min(30cqw,30cqh,64px);height:auto;aspect-ratio:1;animation:none}
#hsc-menu .mode .lock .bar{width:60%;height:clamp(8px,5cqmin,14px);border-radius:99px;background:#ffffff40;overflow:hidden}
#hsc-menu .mode .lock .bar i{display:block;height:100%;background:#ffd34d;border-radius:99px}
#hsc-menu .mode.on{box-shadow:inset 0 -7px 0 #0003,inset 0 3px 0 #fff6,0 0 0 4px #ffd34d,0 6px 0 4px ${K},0 10px 14px #0005}
#hsc-menu .mgrid > *{animation:hsc-popin .5s cubic-bezier(.2,1.5,.4,1) both}
#hsc-menu .mgrid > *:nth-child(2){animation-delay:.04s}#hsc-menu .mgrid > *:nth-child(3){animation-delay:.08s}#hsc-menu .mgrid > *:nth-child(4){animation-delay:.12s}#hsc-menu .mgrid > *:nth-child(5){animation-delay:.16s}#hsc-menu .mgrid > *:nth-child(6){animation-delay:.2s}#hsc-menu .mgrid > *:nth-child(7){animation-delay:.24s}
/* an odd last card fills its row */
#hsc-menu .mgrid .mode:last-child:nth-child(odd){grid-column:1/-1}
/* wide screens (phones on their side, tablets on their side, PC): the play card on the left, the blocks on the right */
@media (orientation:landscape){
  #hsc-menu .page{max-width:1280px}
  #hsc-menu .sgrid{grid-template-columns:repeat(4,minmax(0,1fr))}
  /* a wide screen keeps the shop in view: slim cards and a one-line dock */
  #hsc-menu .duo{height:clamp(68px,17vh,108px);max-width:560px}
  #hsc-menu .dock button{flex-direction:row;gap:8px;height:44px}
  #hsc-menu .dock .hsc-lbl{width:auto}
  #hsc-menu .dock .hsc-ic{width:28px;height:28px}
  #hsc-menu .mgrid{grid-template-columns:repeat(4,minmax(0,1fr))}
  #hsc-menu .mgrid .mode:last-child:nth-child(odd){grid-column:auto}
  #hsc-menu .mgrid .mode:last-child:nth-child(4n+3){grid-column:span 2}
}
@media (prefers-reduced-motion:reduce){#hsc-menu::before,#hsc-menu .page,#hsc-menu .mgrid > *,#hsc-menu .mode .hsc-ic{animation:none!important}}
body.hsc-calm #hsc-menu::before,body.hsc-calm #hsc-menu .mode .hsc-ic{animation:none!important}
body.hsc-reveal #hsc-menu-btn{visibility:hidden}
/* ---- every panel in the same family: navy ink, a jelly-blue backdrop, white-to-blue sheets, the rounded type ---- */
#hsc-goals,#hsc-salon,.hsc-coll-panel,#hsc-set,#hsc-gift,#hsc-panel{font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,-apple-system,"Segoe UI",sans-serif!important}
#hsc-panel{background:#0d3f86b8!important;color:${K}!important}
#hsc-goals .sheet,#hsc-salon .sheet,.hsc-coll-panel .sheet,#hsc-set .sheet,#hsc-panel .hsc-sheet{background:linear-gradient(#ffffff,#e4f3ff)!important;border-color:${K}!important}
#hsc-goals .x,#hsc-salon .x,.hsc-coll-panel .x,#hsc-set .x,#hsc-panel .hsc-x{background:linear-gradient(#fff,#dfe8f2)!important;border-color:${K}!important;box-shadow:inset 0 -4px 0 #0002,inset 0 2px 0 #fff9,0 3px 0 ${K}!important;color:${K}!important}
/* ---- the cutting screen, in the same jelly style (looks only: every control keeps its size and place) ---- */
#hsc-hud .hsc-btn,#hsc-undo,#hsc-cmp,#hsc-newc,.ui .audio-toggle{background:linear-gradient(#fff,#dfe8f2)!important;border:3px solid ${K}!important;box-shadow:inset 0 -5px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important;color:${K}}
#hsc-menu-btn{background:linear-gradient(#ffe682,#ffb21a)!important}
#hsc-undo{background:linear-gradient(#ffa59b,#f04436)!important;color:#fff}
.ui .guard-arc .rung{background:linear-gradient(#fff,#dfe8f2)!important;border:3px solid ${K}!important;box-shadow:inset 0 -4px 0 #0002,inset 0 2px 0 #fff9,0 3px 0 ${K},0 5px 6px #0004!important;color:${K}}
.ui .guard-arc .rung[aria-checked=true]{background:linear-gradient(#ffe682,#ffb21a)!important;box-shadow:inset 0 -5px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important}
.ui .clip-toggle{background:linear-gradient(#fff,#dfe8f2)!important;border:3px solid ${K}!important;box-shadow:inset 0 -7px 0 #0002,inset 0 3px 0 #fff9,0 6px 0 ${K},0 9px 12px #0005!important;color:${K}}
.ui .clip-toggle.on{background:linear-gradient(#a8e4ff,#3aa2f2)!important}
#hsc-hud .hsc-pill{background:#10223fcc!important;border:2px solid #ffffff30!important;box-shadow:0 3px 8px #0004!important;color:#fff}
#hsc-hud .hsc-pill .hsc-combo{color:${K}}
.ui .seal .seal-shape{filter:drop-shadow(0 5px 0 ${K}) drop-shadow(0 8px 6px #0004)}
.ui .seal .seal-shape polygon{stroke:${K}}
/* one icon set in the chair too: the frozen game's own glyphs are hidden and the set's drawn in their place */
.ui .audio-toggle>svg{opacity:0}
.ui .audio-toggle[aria-pressed=true]{background:${HSC.iconCss ? HSC.iconCss('sound') : 'none'} center/66% no-repeat,linear-gradient(#fff,#dfe8f2)!important}
.ui .audio-toggle[aria-pressed=false]{background:${HSC.iconCss ? HSC.iconCss('mute') : 'none'} center/66% no-repeat,linear-gradient(#fff,#dfe8f2)!important}
.ui .ctl.finish.seal>svg{opacity:0}
.ui .ctl.finish.seal,.ui[data-status=cutting] .ctl.finish.seal{border-radius:50%;border:3px solid ${K}!important;box-shadow:inset 0 -5px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important;background:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 12.5l4.6 4.6L19 7.5" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>')}") center/62% no-repeat,linear-gradient(#5fd06a,#2f9e44)!important}
#hsc-hud .hsc-btn:active,#hsc-undo:active,#hsc-cmp:active,#hsc-newc:active,.ui .audio-toggle:active,.ui .guard-arc .rung:active,.ui .clip-toggle:active{box-shadow:inset 0 -3px 0 #0002,inset 0 2px 0 #fff9,0 1px 0 ${K}!important}
/* a feature button that appears in the top row before the home screen takes it in is never shown there */
#hsc-hud .hsc-row .hsc-rw,#hsc-hud .hsc-row #hsc-goals-btn,#hsc-hud .hsc-row #hsc-salon-btn,#hsc-hud .hsc-row #hsc-book-btn,#hsc-hud .hsc-row #hsc-album-btn,#hsc-hud .hsc-row #hsc-set-btn{display:none!important}
`;
  const ui = {
    el: {},
    build(row) {
      const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
      const b = document.createElement('button');
      b.className = 'hsc-btn'; b.id = 'hsc-menu-btn'; b.type = 'button'; b.setAttribute('aria-label', 'Menu');
      b.innerHTML = I('home', 30) + '<span class="hsc-dot" hidden></span>';
      b.addEventListener('click', () => this.open());
      row.insertBefore(b, row.firstChild);
      // the home screen sits above every cutting-screen layer (the panels it opens sit above it)
      const m = document.createElement('div'); m.id = 'hsc-menu';
      m.innerHTML = `<div class="hold"></div>
        <div class="page home" role="dialog" aria-label="Menu">
          <div class="top"><div class="lvl"><span class="lv"></span><div class="xp"><i></i></div></div><div class="chip flame">${I('flame')}<span></span></div><div class="chip coins">${I('coin')}<bdi></bdi></div><div class="gear"></div></div>
          <div class="grow"></div>
          <div class="duo">
            <button class="j qp" type="button" aria-label="Quick Play"><span class="hsc-lbl" data-k="quick_play"></span></button>
            <button class="j hero" type="button" aria-label="Career"><span class="hsc-lbl" data-k="career"></span><span class="sub"></span></button>
            <div class="career"></div>
          </div>
          <nav class="dock">${[['modes', 'modes', 'modes'], ['shop', 'salon', 'shop'], ['collection', 'styles', 'collection']].map(([b, ic, k]) => `<button type="button" data-b="${b}">${I(ic)}<span class="hsc-lbl" data-k="${k}"></span><span class="hsc-dot" hidden></span></button>`).join('')}</nav>
        </div>
        <div class="page shop" hidden role="dialog" aria-label="Shop">
          <div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('salon')}<span class="hsc-lbl" data-k="shop"></span></div><div class="chip coins">${I('coin')}<bdi></bdi></div></div>
          <div class="sgrid">
            <button class="j tile c-pink" type="button" data-s="gift">${I('gift')}<span class="hsc-lbl" data-k="gift"></span><span class="badge" hidden></span><span class="hsc-dot" hidden></span></button>
            <button class="j tile c-yellow" type="button" data-s="daily">${I('daily')}<span class="hsc-lbl" data-k="daily"></span><span class="hsc-dot" hidden></span></button>
            <button class="j tile c-orange" type="button" data-s="salon">${I('salon')}<span class="hsc-lbl" data-k="salon"></span></button>
            <button class="j tile c-blue" type="button" data-s="wardrobe">${I('wardrobe')}<span class="hsc-lbl" data-k="wardrobe"></span></button>
          </div>
        </div>
        <div class="page modes" hidden role="dialog" aria-label="Modes">
          <div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('modes')}<span class="hsc-lbl" data-k="modes"></span></div><div class="chip coins">${I('coin')}<bdi></bdi></div></div>
          <div class="mgrid hsc-same"></div>
        </div>`;
      document.body.appendChild(m);
      // Quick Play and Career are peers: Quick Play is pressure-free play, Career only ever resumes the career
      m.querySelector('.qp').addEventListener('click', () => this.play('free'));
      m.querySelector('.hero').addEventListener('click', () => this.play('career'));
      m.querySelector('[data-b=modes]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); this.view('modes'); });
      m.querySelector('[data-b=shop]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); this.view('shop'); });
      m.querySelector('[data-b=collection]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); if (HSC.portfolio) HSC.portfolio.open(); });
      m.querySelectorAll('.page.modes .back,.page.shop .back').forEach((b) => b.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); this.view('home', true); }));
      // the Shop page: the free bonuses, then the two stores; each opens its own panel as before
      const openBtn = (sel) => { const b = document.querySelector('#hsc-menu .hold ' + sel); if (b) b.click(); };
      m.querySelector('[data-s=gift]').addEventListener('click', (e) => { if (!(HSC.gift && HSC.gift.open()) && HSC.nope) HSC.nope(e.currentTarget); });
      m.querySelector('[data-s=daily]').addEventListener('click', () => openBtn('#hsc-goals-btn'));
      m.querySelector('[data-s=salon]').addEventListener('click', () => openBtn('#hsc-salon-btn'));
      m.querySelector('[data-s=wardrobe]').addEventListener('click', () => openBtn('.hsc-rw'));
      // back (Escape) closes only the top layer: a panel over the home screen handles it first
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('open') && !document.querySelector('#hsc-wshop.open,#hsc-panel.open,#hsc-goals.open,#hsc-salon.open,.hsc-coll-panel.open,#hsc-set.open,#hsc-gift.open')) { if (m.querySelector('.page.home').hidden) this.view('home', true); else this.close(); } });
      addEventListener('resize', () => { if (m.classList.contains('open')) requestAnimationFrame(() => { if (HSC.fitLabels) HSC.fitLabels(m); this.backdrop(); }); });
      Object.assign(this.el, { btn: b, menu: m, row });
      this.tick();
      try { new MutationObserver(() => this.tick()).observe(row, { childList: true }); } catch (e) {}
      setInterval(() => this.tick(), 250);
      // a returning barber starts on the home screen (a first-time player goes straight to the first customer)
      const home = () => {
        const g = globalThis.skinFadeStudio, d = HSC.meta && HSC.meta.data;
        if (!g || !d || !HSC.modes) return setTimeout(home, 250);
        if (d.cuts >= 1 && g.getState().status === 'cutting' && !g.getState().cutStrokeCount) this.open();
      };
      home();
    },
    labels() {
      const m = this.el.menu;
      if (!m) return;
      m.setAttribute('dir', HSC.rtl && HSC.rtl() ? 'rtl' : 'ltr');
      m.querySelectorAll('.hsc-lbl[data-k]').forEach((el) => { el.textContent = t(el.dataset.k); });
      m.querySelector('.hero').setAttribute('aria-label', t('career'));
      m.querySelector('.qp').setAttribute('aria-label', t('quick_play'));
      requestAnimationFrame(() => HSC.fitLabels && HSC.fitLabels(m));
    },
    open() {
      this.el.menu.classList.add('open');
      this.view('home');
      this.refresh();
    },
    // Home shows the shop itself: the same 3D room the player furnishes, drawn wide
    backdrop() {
      const m = this.el.menu, home = !m.querySelector('.page.home').hidden;
      m.classList.toggle('athome', home);
      if (!home) { m.style.backgroundImage = ''; return; }
      const url = HSC.salon && HSC.salon.homePicture ? HSC.salon.homePicture() : null;
      if (url) m.style.backgroundImage = `url("${url}")`; else m.classList.remove('athome'); // no 3D: the theme's own background
    },
    close() { this.el.menu.classList.remove('open'); },
    view(v, back) {
      const m = this.el.menu;
      for (const p of m.querySelectorAll('.page')) {
        const on = p.classList.contains(v);
        p.hidden = !on;
        p.classList.remove('in', 'back-in');
        if (on && m.classList.contains('open')) { void p.offsetWidth; p.classList.add(back ? 'back-in' : 'in'); }
      }
      if (v === 'modes') this.modes();
      this.backdrop();
      if (HSC.careerUI) HSC.careerUI.render(v);
      this.labels();
    },
    async play(mode) {
      const M = HSC.modes;
      const card = this.el.menu.querySelector(mode === 'free' ? '.qp' : '.hero');
      if (mode === 'career' && HSC.careerRun && HSC.careerRun.tooNew()) { this.view('map'); return false; }
      if (!M || !M.unlocked(mode) || (mode === 'career' && !(HSC.careerRun && HSC.careerRun.ready()))) { if (HSC.nope) HSC.nope(card); return false; }
      // Career waits for the player's city choice (the founding city, or the next city after a chapter)
      if (mode === 'career' && HSC.careerRun.needsChoice()) { if (HSC.fx) HSC.fx.play('swish'); this.view('map'); return false; }
      if (!(await M.set(mode))) return false;
      if (HSC.fx) HSC.fx.play('swish');
      this.close();
      if (HSC.salon) HSC.salon.reveal(mode);
      return true;
    },
    modes() {
      const M = HSC.modes, grid = this.el.menu.querySelector('.mgrid');
      if (!M) return;
      const cur = M.current(), lv = HSC.meta.level(), prog = HSC.meta.levelProgress ? HSC.meta.levelProgress() : 0;
      // Quick Play is a Home card, never a Modes tile (its saved id `free` stays in the mode list)
      grid.innerHTML = M.list.filter((k) => k !== 'free').map((k) => {
        const lock = !M.unlocked(k);
        // a locked mode shows how close the barber is: the levels still to go, as a bar
        const need = M.level[k], frac = Math.max(0, Math.min(1, (lv - 1 + prog) / Math.max(1, need - 1)));
        const hot = !lock && HSC.econ && HSC.econ.demand && HSC.econ.demand().includes(k); // this shift's demand bonus
        const reward = REWARD[k]() + (hot ? I('flame') : '');
        return `<button class="j mode c-${MODE_COLOUR[k]}${k === cur ? ' on' : ''}" type="button" data-m="${k}"${lock ? ' aria-disabled="true"' : ''}>${I(MODE_ICON[k])}<span class="hsc-lbl" data-k="${MODE_WORD[k]}"></span><span class="reward">${reward}</span>${!lock && M.isNew && M.isNew(k) ? `<span class="new">${t('new')}</span>` : ''}${lock ? `<span class="lock">${I('lock')}<span>${need}</span><span class="bar"><i style="width:${Math.round(frac * 100)}%"></i></span></span>` : ''}</button>`;
      }).join('');
      grid.querySelectorAll('.mode').forEach((b) => b.addEventListener('click', () => {
        if (b.getAttribute('aria-disabled')) { if (HSC.nope) HSC.nope(b); return; }
        this.play(b.dataset.m);
      }));
    },
    // the live parts of the home screen
    refresh() {
      const d = HSC.meta && HSC.meta.data, m = this.el.menu;
      if (!d) return;
      m.querySelectorAll('.coins bdi').forEach((el) => { el.textContent = HSC.coins ? HSC.coins.get() : d.coins || 0; });
      const streak = HSC.meta.streakNow ? HSC.meta.streakNow() : d.streak || 0;
      m.querySelector('.flame').hidden = !(streak > 0);
      m.querySelector('.flame span').textContent = streak;
      m.querySelector('.xp i').style.width = Math.round((HSC.meta.levelProgress ? HSC.meta.levelProgress() : 0) * 100) + '%';
      // the level badge, and the Shop's free bonuses: the Gift's time left or a dot when ready, a dot for daily rewards
      const lv = m.querySelector('.lvl .lv'), L = HSC.meta.level();
      if (lv.dataset.n !== String(L) && HSC.levelBadge) { lv.dataset.n = String(L); lv.innerHTML = HSC.levelBadge(L); }
      const gb = m.querySelector('[data-s=gift]'), gs = HSC.gift ? HSC.gift.state() : null, gt = gb.querySelector('.badge');
      gb.querySelector('.hsc-dot').hidden = !(gs && gs.ready);
      gt.hidden = !gs || gs.ready || gs.done;
      if (gs && !gs.ready && !gs.done) gt.textContent = Math.floor(gs.left / 60) + ':' + String(gs.left % 60).padStart(2, '0');
      gb.style.opacity = gs && gs.done ? '.55' : '';
      const gd = m.querySelector('.hold #hsc-goals-btn .hsc-dot'), daily = !!(gd && !gd.hidden);
      m.querySelector('[data-s=daily] .hsc-dot').hidden = !daily;
      m.querySelector('[data-b=shop] .hsc-dot').hidden = !((gs && gs.ready) || daily);
    },
    tick() {
      const m = this.el.menu;
      if (m.classList.contains('open') && HSC.fitLabels && [...m.querySelectorAll('.hsc-lbl')].some((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 0.5)) HSC.fitLabels(m);
      // move each feature button into its place as it appears
      for (const [sel, slot] of PLACE) {
        const btn = document.querySelector('#hsc-hud .hsc-row ' + sel);
        if (!btn) continue;
        m.querySelector(slot).appendChild(btn);
      }
      const gear = m.querySelector('.gear .hsc-btn');
      if (gear && !gear.querySelector('.hsc-ic')) gear.insertAdjacentHTML('beforeend', I('gear'));
      // the home button's dot: anything waiting on the home screen
      const gs = HSC.gift ? HSC.gift.state() : null;
      const dot = [...m.querySelectorAll('.hsc-btn .hsc-dot')].some((d) => !d.hidden) || !!(gs && gs.ready);
      this.el.btn.querySelector('.hsc-dot').hidden = !dot;
      if (m.classList.contains('open')) this.refresh();
    },
  };
  // the features put their buttons in the HUD row; once it exists the home screen takes them in
  const boot = () => { const row = document.querySelector('#hsc-hud .hsc-row'); if (row && document.getElementById('hsc-hud')) ui.build(row); else setTimeout(boot, 200); };
  boot();
  // a language change re-renders the open page (career strip, mode cards) in the new language
  addEventListener('hsc-language', () => {
    const m = ui.el.menu;
    if (!m) return;
    ui.labels();
    const pg = m.querySelector('.page:not([hidden])');
    const v = pg && [...pg.classList].find((c) => !['page', 'in', 'back-in'].includes(c));
    if (v === 'modes') ui.modes();
    if (v && HSC.careerUI) HSC.careerUI.render(v);
  });
  // career(): the home screen on the world map (a city must be chosen before the career can seat anyone)
  HSC.menu = { open: () => ui.open(), close: () => ui.close(), view: (v, back) => ui.view(v, back), career: () => { if (!ui.el.menu) return; ui.open(); ui.view('map'); }, play: (m) => ui.play(m) };
  // the Android back button: close the top panel, then the modes screen back to home; from the chair it opens the home
  // screen; on the home screen it is not handled (Android leaves the app as usual)
  HSC.menuBack = function () {
    const m = ui.el.menu;
    if (!m) return false;
    const gift = document.querySelector('#hsc-gift.open');
    if (gift) { gift.classList.remove('open'); return true; }
    for (const sel of ['#hsc-wshop.open .x', '#hsc-goals.open .x', '#hsc-salon.open .x', '.hsc-coll-panel.open .x', '#hsc-set.open .x']) {
      const x = document.querySelector(sel);
      if (x) { x.click(); return true; }
    }
    if (m.classList.contains('open')) {
      if (m.querySelector('.page.home').hidden) { ui.view('home', true); return true; }
      return false;
    }
    ui.open();
    return true;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
