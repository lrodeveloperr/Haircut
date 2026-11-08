// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-chosen layout (option 2) and theme (Jelly Gold), 5 November 2026):
// the home screen.
// The cutting screen keeps only the cutting itself. Home is the owner-chosen Bottom Dock (docs/UI-OPTIONS.md):
//
//   picture  the player's current barbershop, whole and unzoomed, with no customer (salon.js homePicture)
//   top row  the level badge and its progress on the left, the coins on the right
//   play     Quick Play first and Career second (docs/MAIN-MENU-AND-MODE-ROUTING-CONTRACT.md, owner-locked), in thumb reach
//   dock     Modes, Shop, Collection, Settings. Shop (shop.js) is one screen of five tabs; Collection is the customers
//            the barber has really worked with.
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
  const PLACE = [['#hsc-set-btn', '.hold'], ['.hsc-rw', '.hold'], ['#hsc-salon-btn', '.hold']];
  // the panels that open over the home screen, and every layer that covers the chair
  const PANELS = '#hsc-salon.open,#hsc-set.open,#hsc-panel.open';
  const COVERS = '#hsc-menu.open,#hsc-reveal.on,' + PANELS;
  // The game reads its keys (guard, turn, clipper, finish, next) on the window and only stops for its own pause. While a
  // screen covers the chair, or a form control (the language list, the shop name) has focus, no key reaches it: the
  // haircut behind the home screen never changes. Stopped on the document, so the screens' own controls still get
  // every key first (Tab, typing, a list's arrows, Enter or Space on a button); Escape stays with the screens' back.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') return;
    const el = e.target, form = el && el.closest && el.closest('input,select,textarea,[contenteditable]:not([contenteditable=false])');
    if (form || document.querySelector(COVERS)) e.stopPropagation();
  });
  const MODE_ICON = { requests: 'orders', free: 'freestyle', fix: 'rescue', beard: 'beards', rush: 'rush' };
  const MODE_WORD = Object.assign({}, MODE_ICON, { free: 'quick_play' });
  const MODE_LINE = { requests: 'm_requests', fix: 'm_fix', beard: 'm_beard', rush: 'm_rush' };
  const MODE_COLOUR = { requests: 'green', free: 'yellow', fix: 'red', beard: 'orange', rush: 'purple' };
  const STAR = (on) => `<svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="${on ? '#ffc21a' : 'none'}" stroke="${on ? K : '#fff'}" stroke-width="2.4" stroke-linejoin="round"${on ? '' : ' stroke-dasharray="2.6 2.2"'}/></svg>`;
  // what each mode pays, shown on its card: numbers and icons only
  // Truthful minimums from economy.js. A trailing + means skill or time can add more.
  const REWARD = { requests: () => I('coin') + '24+', fix: () => I('coin') + '30', beard: () => I('coin') + '28', rush: () => I('coin') + '11+' };
  const CSS = `
#hsc-menu-btn{padding:0}
/* this layer is zoomed by the UI scale, and inside a zoom env(), vw and vh are zoomed too: each is divided back by
   the scale so an inset or a share of the screen stays its true size on every screen. --sl/--sr/--st/--sb are the
   page's side, top and bottom margins: 12 px (14 at the bottom) or the device's safe-area inset, whichever is larger */
#hsc-menu{--sl:max(12px,calc(env(safe-area-inset-left) / var(--hsc-s,1)));--sr:max(12px,calc(env(safe-area-inset-right) / var(--hsc-s,1)));--st:max(12px,calc(env(safe-area-inset-top) / var(--hsc-s,1)));--ib:calc(env(safe-area-inset-bottom) / var(--hsc-s,1));--sb:max(14px,var(--ib));--vw:calc(1vw / var(--hsc-s,1));--vh:calc(1vh / var(--hsc-s,1))}
#hsc-menu{position:fixed;inset:0;z-index:29;zoom:var(--hsc-s,1);display:none;pointer-events:auto;touch-action:manipulation;font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,-apple-system,"Segoe UI",sans-serif;color:${K};-webkit-user-select:none;user-select:none;overflow:hidden;background:radial-gradient(120% 90% at 50% 0%,#38d1e8,#1679c9 55%,#0d3f86)}
#hsc-menu::before{content:"";position:absolute;inset:-50%;background:repeating-linear-gradient(-35deg,#ffffff12 0 22px,#0000 22px 60px);animation:hsc-pole 14s linear infinite;pointer-events:none}
#hsc-menu::after{content:"";position:absolute;inset:0;background:radial-gradient(60% 40% at 50% 112%,#ffd76a66,#0000);pointer-events:none}
@keyframes hsc-pole{to{transform:translateX(60px)}}
#hsc-menu.open{display:block}
#hsc-menu .hold{display:none}
#hsc-menu .page{position:relative;z-index:1;box-sizing:border-box;height:100%;max-width:600px;margin:0 auto;display:grid;gap:12px;padding:var(--st) var(--sr) var(--sb) var(--sl)}
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
#hsc-menu .xp{width:clamp(32px,calc(12 * var(--vw)),90px);height:12px;border-radius:6px;background:#ffffff35;overflow:hidden}
#hsc-menu .xp i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a);border-radius:6px;transition:width .6s}
#hsc-menu .coins{margin-inline-start:auto}
/* ---- Home: the shop on show, the play cards in thumb reach, the dock ---- */
#hsc-menu.athome{background:#2a2622 center/cover no-repeat}
#hsc-menu.athome::before,#hsc-menu.athome::after{display:none}
#hsc-menu .home{max-width:none}
#hsc-menu .home .top{position:relative}
#hsc-menu .grow{min-height:0}
#hsc-menu .duo{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:12px;width:100%;max-width:640px;margin:0 auto;height:clamp(92px,calc(14 * var(--vh)),132px)}
#hsc-menu .qp,#hsc-menu .hero{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:0;border:0;border-radius:20px;color:#fff;box-shadow:inset 0 2px 0 #fff5,0 6px 0 var(--edge),0 10px 16px #0005}
#hsc-menu .j.qp::before,#hsc-menu .j.hero::before{display:none}
#hsc-menu .qp{--edge:#c9921a;background:linear-gradient(#ffd55c,#ffb820);color:${K}}
#hsc-menu .hero{--edge:#2f8f3c;background:linear-gradient(#5fd06a,#37ae48)}
#hsc-menu .j.qp:active,#hsc-menu .j.hero:active{box-shadow:inset 0 2px 0 #fff5,0 1px 0 var(--edge)}
#hsc-menu .qp .hsc-lbl{font-size:clamp(19px,calc(5.4 * var(--vw)),26px);white-space:normal;line-height:1.05;text-wrap:balance;padding:0 8px}
#hsc-menu .hero .hsc-lbl{font-size:clamp(23px,calc(6.6 * var(--vw)),32px)}
/* the Career line (a city, or 'Choose your city') takes a second line in a long language (Tamil) instead of an ellipsis */
#hsc-menu .hero .sub{font-size:14px;font-weight:800;opacity:.95;max-width:92%;white-space:normal;text-wrap:balance;line-height:1.1;overflow:hidden}
#hsc-menu .hero .sub:empty{display:none}
/* the dock runs edge to edge under the page's own margins (the safe-area insets included), and its buttons stay
   inside them: clear of a notch at the sides and 8 px above the gesture bar. Its four columns are equal unless a
   label needs more (German's 'Einstellungen'): that column takes its word's width and the others share the rest;
   only if the four words together are too wide do they step down (to 12 px, dockFit()) and then wrap */
#hsc-menu .dock{display:grid;grid-template-columns:repeat(4,1fr);width:calc(100% + var(--sl) + var(--sr));margin:6px calc(-1 * var(--sr)) calc(-1 * var(--sb)) calc(-1 * var(--sl));padding:6px var(--sr) calc(8px + var(--ib)) var(--sl);box-sizing:border-box;background:#fff;box-shadow:0 -3px 0 #d5dde8}
#hsc-menu .dock button{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;height:62px;background:none;border:0;padding:0;font:inherit;color:${K};cursor:pointer;border-radius:14px}
#hsc-menu .dock button:active{background:#eef3fa}
#hsc-menu .dock button:focus-visible{outline:4px solid #4fc3ff}
#hsc-menu .dock .hsc-ic{width:32px;height:32px}
#hsc-menu .dock .hsc-lbl{font-size:14px;width:100%}
#hsc-menu .dock.wrap .hsc-lbl{white-space:normal;line-height:1.05;overflow-wrap:anywhere}
#hsc-menu .dock .hsc-dot{right:calc(50% - 26px);top:2px;width:14px;height:14px}
/* ---- the modes screen ---- */
#hsc-menu .mhead{display:flex;align-items:center;gap:10px;height:48px}
/* the back button keeps its 48 px beside a long title (Croatian 'Načini igre'): the title shrinks instead */
#hsc-menu .back{flex:none;width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center}
#hsc-menu .back .hsc-ic{width:28px;height:28px}
/* right to left (Arabic, Hebrew, Persian, Urdu): Back points right, and a reward reads as written ('24+', '+5') */
#hsc-menu[dir=rtl] .back .hsc-ic{transform:scaleX(-1)}
#hsc-menu .mode .reward{direction:ltr;unicode-bidi:isolate}
#hsc-menu .title{display:flex;align-items:center;gap:8px;min-width:0;color:#fff;font-weight:900;font-size:clamp(22px,calc(6 * var(--vw)),34px);-webkit-text-stroke:3px ${K};paint-order:stroke fill;text-shadow:0 3px 0 ${K}}
#hsc-menu .title .hsc-ic{width:44px;height:44px}
#hsc-menu .title .hsc-lbl{overflow:visible;min-width:0}
#hsc-menu .mhead .coins{margin-inline-start:auto}
#hsc-menu .mgrid{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(0,1fr);gap:12px;min-height:0;padding:4px 2px 10px}
#hsc-menu .mode{display:flex;align-items:center;gap:12px;padding:8px 14px;overflow:hidden;text-align:start;border-radius:22px}
#hsc-menu .mode .ico{flex:none;width:84px;height:84px;max-height:100%;border-radius:20px;background:#ffffff66;display:flex;align-items:center;justify-content:center}
#hsc-menu .mode .ico .hsc-ic{width:58px;height:58px}
#hsc-menu .mode .tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
#hsc-menu .mode .hsc-lbl{font-size:clamp(20px,calc(7 * var(--vw)),28px);text-align:start}
#hsc-menu .mode .ln{font-size:15px;font-weight:800;line-height:1.15;overflow-wrap:break-word;hyphens:auto}
#hsc-menu .mode .reward{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:62px;padding:6px 8px;border-radius:16px;background:${K};color:#ffe682;font-weight:900;font-size:17px;font-variant-numeric:tabular-nums}
#hsc-menu .mode .reward .hsc-ic{width:24px;height:24px}
#hsc-menu .mode .reward em{font-style:normal;font-size:13px;color:#9cf06c}
#hsc-menu .mode .lock{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;align-items:center;gap:8px;height:34px;box-sizing:border-box;padding:0 12px;border-radius:0 0 inherit inherit;background:#10223fd9;color:#fff;font-weight:900;font-size:15px;font-variant-numeric:tabular-nums}
#hsc-menu .mode .lock .hsc-ic{width:22px;height:22px;flex:none}
#hsc-menu .mode .lock .lb{flex:1;height:10px;border-radius:5px;background:#ffffff40;overflow:hidden}
#hsc-menu .mode .lock .lb i{display:block;height:100%;background:linear-gradient(#b5ff7a,#46c43a)}
#hsc-menu .mgrid > *{animation:hsc-popin .5s cubic-bezier(.2,1.5,.4,1) both}
#hsc-menu .mgrid > *:nth-child(2){animation-delay:.04s}#hsc-menu .mgrid > *:nth-child(3){animation-delay:.08s}#hsc-menu .mgrid > *:nth-child(4){animation-delay:.12s}
/* wide screens (phones on their side, tablets on their side, PC): the play card on the left, the blocks on the right */
@media (orientation:landscape){
  #hsc-menu .page{max-width:1280px}
  /* Home is the shop on show: it fills any screen, so the dock spans the whole width on wide and ultra-wide ones */
  #hsc-menu .page.home{max-width:none}
  /* a wide screen keeps the shop in view: slim cards and a one-line dock */
  #hsc-menu .duo{height:clamp(68px,calc(17 * var(--vh)),108px);max-width:560px}
  #hsc-menu .dock button{flex-direction:row;gap:8px;height:44px}
  #hsc-menu .dock .hsc-lbl{width:auto}
  #hsc-menu .dock .hsc-ic{width:28px;height:28px}
  #hsc-menu .mgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media (prefers-reduced-motion:reduce){#hsc-menu::before,#hsc-menu .page,#hsc-menu .mgrid > *{animation:none!important}}
body.hsc-reveal #hsc-menu-btn{visibility:hidden}
/* ---- every panel in the same family: navy ink, a jelly-blue backdrop, white-to-blue sheets, the rounded type ---- */
#hsc-salon,#hsc-set,#hsc-panel{font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,-apple-system,"Segoe UI",sans-serif!important}
#hsc-panel{background:#0d3f86b8!important;color:${K}!important}
#hsc-salon .sheet,#hsc-panel .hsc-sheet{background:linear-gradient(#ffffff,#e4f3ff)!important;border-color:${K}!important}
#hsc-salon .x,#hsc-panel .hsc-x{background:linear-gradient(#fff,#dfe8f2)!important;border-color:${K}!important;box-shadow:inset 0 -4px 0 #0002,inset 0 2px 0 #fff9,0 3px 0 ${K}!important;color:${K}!important}
/* ---- the cutting screen, in the same jelly style (looks only: every control keeps its size and place) ---- */
#hsc-hud .hsc-btn,#hsc-undo,.ui .audio-toggle{background:linear-gradient(#fff,#dfe8f2)!important;border:3px solid ${K}!important;box-shadow:inset 0 -5px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important;color:${K}}
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
#hsc-hud .hsc-btn:active,#hsc-undo:active,.ui .audio-toggle:active,.ui .guard-arc .rung:active,.ui .clip-toggle:active{box-shadow:inset 0 -3px 0 #0002,inset 0 2px 0 #fff9,0 1px 0 ${K}!important}
/* the order bubble and the result, in the same style: the frozen game's cream and brown stop at the cutting screen */
#hsc-req,#hsc-dock,#hsc-score .tip,.hsc-toast{background:linear-gradient(#fff,#e4f3ff)!important;border-color:${K}!important;box-shadow:inset 0 -4px 0 #0001,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important}
#hsc-req,#hsc-score,#hsc-rush,.hsc-toast,#hsc-hub{font-family:"Arial Rounded MT Bold","Nunito","Baloo 2",system-ui,-apple-system,"Segoe UI",sans-serif!important}
#hsc-req::after,#hsc-req::before{background:linear-gradient(#fff,#e4f3ff)!important}
#hsc-req img,.hsc-next{background:radial-gradient(circle at 50% 35%,#fff,#bcd3e8)!important}
.hsc-next{border-color:${K}!important}
.ui .training-continue,.ui .continue{background:linear-gradient(#ffe682,#ffb21a)!important;border:3px solid ${K}!important;box-shadow:inset 0 -7px 0 #0002,inset 0 3px 0 #fff9,0 5px 0 ${K},0 8px 10px #0005!important;color:${K}!important}
.ui .training-continue:not(:disabled):active,.ui .continue:not(:disabled):active{box-shadow:inset 0 -3px 0 #0002,inset 0 2px 0 #fff9,0 1px 0 ${K}!important}
#hsc-score .x3{box-shadow:inset 0 -4px 0 #0002,inset 0 2px 0 #fff9,0 4px 0 ${K},0 6px 8px #0004!important}
/* a feature button that appears in the top row before the home screen takes it in is never shown there */
#hsc-hud .hsc-row .hsc-rw,#hsc-hud .hsc-row #hsc-salon-btn,#hsc-hud .hsc-row #hsc-set-btn{display:none!important}
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
          <div class="top"><div class="lvl"><span class="lv"></span><div class="xp"><i></i></div></div><div class="chip coins">${I('coin')}<bdi></bdi></div></div>
          <div class="grow"></div>
          <div class="duo">
            <button class="j qp" type="button" aria-label="Quick Play"><span class="hsc-lbl" data-k="quick_play"></span></button>
            <button class="j hero" type="button" aria-label="Career"><span class="hsc-lbl" data-k="career"></span><span class="sub"></span></button>
          </div>
          <nav class="dock">${[['modes', 'modes', 'modes'], ['shop', 'salon', 'shop'], ['collection', 'styles', 'collection'], ['settings', 'gear', 'settings']].map(([b, ic, k]) => `<button type="button" data-b="${b}">${I(ic)}<span class="hsc-lbl" data-k="${k}"></span><span class="hsc-dot" hidden></span></button>`).join('')}</nav>
        </div>
        <div class="page shop" hidden role="dialog" aria-label="Shop">
          <div class="mhead"><button class="j c-white back" type="button" aria-label="Back">${I('back')}</button><div class="title">${I('salon')}<span class="hsc-lbl" data-k="shop"></span></div><div class="chip coins">${I('coin')}<bdi></bdi></div></div>
          <div class="hsc-stabs" role="tablist"></div><div class="sbody"></div>
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
      m.querySelector('[data-b=shop]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); if (HSC.shop) HSC.shop.enter(); });
      // the coin counter is the way to more coins
      m.querySelectorAll('.coins').forEach((c) => { c.style.cursor = 'pointer'; c.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); if (HSC.shop) HSC.shop.go('coins'); }); });
      m.querySelector('[data-b=settings]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); if (HSC.settings) HSC.settings.open(); });
      m.querySelector('[data-b=collection]').addEventListener('click', () => { if (HSC.fx) HSC.fx.play('swish'); if (HSC.collection) HSC.collection.open(); });
      m.querySelectorAll('.page.modes .back,.page.shop .back').forEach((b) => b.addEventListener('click', () => { if (HSC.fx) HSC.fx.play('back'); this.view('home', true); }));
      // back (Escape) closes only the top layer: a panel over the home screen handles it itself. Decided before any
      // panel's own handler runs (capture), so the Escape that closes a panel never also closes the home screen
      addEventListener('keydown', (e) => { if (e.key === 'Escape' && m.classList.contains('open') && !document.querySelector(PANELS)) { if (m.querySelector('.page.home').hidden) this.view('home', true); else this.close(); } }, true);
      addEventListener('resize', () => { if (m.classList.contains('open')) requestAnimationFrame(() => { this.fit(); this.backdrop(); }); });
      Object.assign(this.el, { btn: b, menu: m, row });
      this.tick();
      try { new MutationObserver(() => this.tick()).observe(row, { childList: true }); } catch (e) {}
      setInterval(() => this.tick(), 250);
      // a new player meets Home once, after the first customer: Career and the modes are found from here
      const firstHome = () => {
        const g = globalThis.skinFadeStudio, d = HSC.meta && HSC.meta.data, s = g && g.getState();
        if (d && d.homeSeen) return;
        if (d && d.cuts >= 1 && s && s.status === 'cutting' && !s.cutStrokeCount) { d.homeSeen = true; HSC.meta.save(); this.open(); return; }
        setTimeout(firstHome, 400);
      };
      firstHome();
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
      requestAnimationFrame(() => this.fit());
    },
    // every label whole: each one steps its type down (labels.js), then the dock's four together
    fit() {
      const m = this.el.menu;
      if (HSC.fitLabels) HSC.fitLabels(m);
      this.dockFit();
    },
    dockFit() {
      const d = this.el.menu && this.el.menu.querySelector('.page.home .dock');
      if (!d || !d.offsetParent) return;
      const ls = [...d.querySelectorAll('.hsc-lbl')], over = () => d.scrollWidth > d.clientWidth + 0.5;
      d.classList.remove('wrap');
      if (!over()) return;
      // one size for all four, so the dock keeps one baseline
      let s = Math.min(...ls.map((l) => parseFloat(getComputedStyle(l).fontSize) || 14)), guard = 40;
      ls.forEach((l) => (l.style.fontSize = s + 'px'));
      while (over() && s > 12 && guard--) { s = Math.max(12, s - 0.5); ls.forEach((l) => (l.style.fontSize = s + 'px')); }
      if (over()) d.classList.add('wrap');
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
      // Quick Play is a Home card, never a Modes tile (its saved id `free` stays in the mode list)
      grid.innerHTML = M.list.filter((k) => k !== 'free').map((k) => {
        const lock = !M.unlocked(k);
        // a locked mode stays readable, and shows how close the barber is: customers done out of customers needed, as a bar
        const goal = HSC.meta.cutsFor(M.level[k]), cuts = HSC.meta.data.cuts;
        const hot = !lock && HSC.econ && HSC.econ.demandMatch && HSC.econ.demandMatch(k); // this shift's demand bonus, while it can still pay
        // a mode in demand shows its bonus, so the player can see why to go there
        const eco = HSC.economy && HSC.economy.CONFIG, fee = eco && eco.fee[k], bonus = hot && fee ? Math.min(eco.demand.max, Math.round((fee[0] - fee[1]) * eco.demand.share)) : 0;
        return `<button class="j mode c-${MODE_COLOUR[k]}" type="button" data-m="${k}"${lock ? ' aria-disabled="true"' : ''}><span class="ico">${I(MODE_ICON[k])}</span><span class="tx"><span class="hsc-lbl" data-k="${MODE_WORD[k]}"></span><span class="ln">${t(MODE_LINE[k])}</span></span><span class="reward">${REWARD[k]()}${hot && bonus ? `<em>+${bonus}</em>` : ''}</span>${lock ? `<span class="lock">${I('lock')}<span class="lb"><i style="width:${Math.round(100 * Math.min(1, cuts / goal))}%"></i></span><b>${HSC.num ? HSC.num(cuts) : cuts}/${HSC.num ? HSC.num(goal) : goal}</b></span>` : ''}</button>`;
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
      m.querySelectorAll('.coins bdi').forEach((el) => { const n = HSC.coins ? HSC.coins.get() : d.coins || 0; el.textContent = HSC.num ? HSC.num(n) : n; });
      m.querySelector('.xp i').style.width = Math.round((HSC.meta.levelProgress ? HSC.meta.levelProgress() : 0) * 100) + '%';
      // the level badge, and the Shop's dot when something free is waiting
      const lv = m.querySelector('.lvl .lv'), L = HSC.meta.level();
      if (lv.dataset.n !== String(L) && HSC.levelBadge) { lv.dataset.n = String(L); lv.innerHTML = HSC.levelBadge(L); }
      m.querySelector('[data-b=shop] .hsc-dot').hidden = !(HSC.shop && HSC.shop.dot());
      if (HSC.shop) HSC.shop.tick();
    },
    tick() {
      const m = this.el.menu;
      if (m.classList.contains('open') && HSC.fitLabels && [...m.querySelectorAll('.hsc-lbl')].some((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 0.5)) HSC.fitLabels(m);
      // the dock as a whole (after a language change, say): fitLabels() above sees only one label at a time
      if (m.classList.contains('open')) { const d = m.querySelector('.page.home .dock'); if (d && d.offsetParent && d.scrollWidth > d.clientWidth + 0.5) this.dockFit(); }
      // move each feature button into its place as it appears
      for (const [sel, slot] of PLACE) {
        const btn = document.querySelector('#hsc-hud .hsc-row ' + sel);
        if (!btn) continue;
        m.querySelector(slot).appendChild(btn);
      }
      // the home button's dot: anything waiting on the home screen
      this.el.btn.querySelector('.hsc-dot').hidden = !(HSC.shop && HSC.shop.dot());
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
  // a haircut is under way: the customer in the chair has been touched
  const inProgress = () => {
    const g = globalThis.skinFadeStudio, s = g && g.getState();
    if (!s || s.status !== 'cutting') return false;
    if (s.cutStrokeCount > 0) return true;
    const moved = (a, b) => Array.isArray(a) && Array.isArray(b) && a.some((v, i) => v !== b[i]);
    return moved(s.hair, s.startHair) || moved(s.beard, s.startBeard);
  };
  // the Android back button: the Open splash goes first, then the top panel, then the modes screen back to home; from
  // the chair it opens the home screen. On the home screen it goes back to a haircut under way (touch has no other way
  // back to it); with nothing under way it is not handled (Android leaves the app as usual)
  HSC.menuBack = function () {
    const m = ui.el.menu;
    if (!m) return false;
    // the splash covers everything: back only lets it go (the haircut it opens on stays)
    const splash = document.querySelector('#hsc-reveal.on');
    if (splash) { if (!splash.classList.contains('out')) splash.click(); return true; }
    for (const sel of ['#hsc-salon.open .x', '#hsc-set.open .x']) {
      const x = document.querySelector(sel);
      if (x) { x.click(); return true; }
    }
    if (m.classList.contains('open')) {
      if (m.querySelector('.page.home').hidden) { ui.view('home', true); return true; }
      if (inProgress()) { if (HSC.fx) HSC.fx.play('back'); ui.close(); return true; }
      return false;
    }
    // the reveal spin plays out first: the result and the next customer are settled only when it lands
    const g = globalThis.skinFadeStudio;
    if (g && g.getState().status === 'reveal' && !g.getView().revealComplete) return true;
    ui.open();
    return true;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
