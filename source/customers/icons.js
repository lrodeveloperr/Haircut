// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner-chosen Jelly Gold theme, 5 November 2026): the menu icon set.
// One vector set instead of emoji, so every phone and the PC show the same picture, sharp at any size, and each
// picture shows what it opens. All icons share one 48-unit grid: a 3-unit margin, the same 2.6 ink outline, the
// same light from the top left, and each is optically centred on (24, 24).
// HSC.icon(name, size) returns the SVG; `daily` draws today's date.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const K = '#10223f'; // ink
  const S = `stroke="${K}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
  const ICON = {
    // the barber's coins
    coin: () => `<circle cx="24" cy="24" r="19" fill="#ffc21a" ${S}/><circle cx="24" cy="24" r="12.5" fill="#ffd95e" stroke="#c98a12" stroke-width="2.4"/><path d="M19 17.5a9 9 0 0 1 11-2" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`,
    // days in a row
    flame: () => `<path d="M24 4.5c1.5 7.6 11.5 11.3 11.5 22.3a11.5 11.5 0 0 1-23 0c0-5.2 2.4-8.5 5.3-11.2.4 3.7 2 5.6 3.9 6.4-1.2-6.2-.1-12.2 2.3-17.5z" fill="#ff7a2f" ${S}/><path d="M24 22.5c3.2 3.4 5.4 5.6 5.4 9a5.4 5.4 0 0 1-10.8 0c0-3.4 2.4-5.8 5.4-9z" fill="#ffe14d"/>`,
    // settings
    gear: () => `<path d="M20.6 4.5h6.8l1 5.1 3.7 1.6 4.3-2.9 4.8 4.8-2.9 4.3 1.6 3.7 5.1 1v6.8l-5.1 1-1.6 3.7 2.9 4.3-4.8 4.8-4.3-2.9-3.7 1.6-1 5.1h-6.8l-1-5.1-3.7-1.6-4.3 2.9-4.8-4.8 2.9-4.3-1.6-3.7-5.1-1v-6.8l5.1-1 1.6-3.7-2.9-4.3 4.8-4.8 4.3 2.9 3.7-1.6z" fill="#c6d0dc" ${S}/><circle cx="24" cy="24" r="6.5" fill="#fff" ${S}/>`,
    // play
    play: () => `<path d="M16 9.6v28.8a2 2 0 0 0 3 1.72l24-14.4a2 2 0 0 0 0-3.44l-24-14.4A2 2 0 0 0 16 9.6z" fill="#fff" ${S}/>`,
    back: () => `<path d="M29 10L15 24l14 14" fill="none" stroke="${K}" stroke-width="5.4" stroke-linecap="round" stroke-linejoin="round"/>`,
    home: () => `<path d="M7 22.5L24 8l17 14.5" fill="none" ${S} stroke-width="3.4"/><path d="M11.5 20v19.5h25V20" fill="#ffc21a" ${S}/><path d="M20 39.5v-10h8v10" fill="#fff6e6" ${S}/>`,
    lock: () => `<rect x="10" y="21" width="28" height="21" rx="5" fill="#ffc21a" ${S}/><path d="M16 21v-5a8 8 0 0 1 16 0v5" fill="none" ${S} stroke-width="3.4"/><circle cx="24" cy="30" r="2.6" fill="${K}"/><path d="M24 31v4.5" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>`,
    // the modes: a fan of three mode cards, the front one with scissors
    modes: () => `<rect x="7" y="10" width="20" height="28" rx="4" fill="#3aa2f2" ${S} transform="rotate(-16 17 24)"/><rect x="21" y="10" width="20" height="28" rx="4" fill="#ff5c98" ${S} transform="rotate(16 31 24)"/><rect x="14" y="8" width="20" height="30" rx="4" fill="#fff" ${S}/><circle cx="20" cy="30" r="3.2" fill="none" stroke="${K}" stroke-width="2.4"/><circle cx="28" cy="30" r="3.2" fill="none" stroke="${K}" stroke-width="2.4"/><path d="M21.6 27.4L27.5 14M26.4 27.4L20.5 14" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`,
    // today's challenge: a calendar page with today's date and a star
    daily: (n) => `<rect x="6" y="9" width="36" height="33" rx="5" fill="#fff" ${S}/><path d="M6 14a5 5 0 0 1 5-5h26a5 5 0 0 1 5 5v5H6z" fill="#f04436" ${S}/><path d="M15 5v8M33 5v8" stroke="${K}" stroke-width="3" stroke-linecap="round"/><text x="24" y="37.2" text-anchor="middle" font-family="Arial Rounded MT Bold,Nunito,system-ui,sans-serif" font-weight="900" font-size="${n > 9 ? 16 : 18}" fill="${K}">${n}</text><path d="M38 31.5l1.9 3.8 4.2.6-3 3 .7 4.2-3.8-2-3.8 2 .7-4.2-3-3 4.2-.6z" fill="#ffc21a" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>`,
    // the world map: a folded map with a pin
    map: () => `<path d="M5 12l11-4 16 4 11-4v28l-11 4-16-4-11 4z" fill="#b6f5d8" ${S}/><path d="M16 8v28M32 12v28" stroke="${K}" stroke-width="2.4"/><path d="M24 4.5a7.5 7.5 0 0 1 7.5 7.5c0 5.6-7.5 13-7.5 13s-7.5-7.4-7.5-13A7.5 7.5 0 0 1 24 4.5z" fill="#f04436" ${S}/><circle cx="24" cy="12" r="2.8" fill="#fff"/>`,
    // the play-time gift
    gift: () => `<rect x="7" y="20" width="34" height="21" rx="3" fill="#ff5c98" ${S}/><rect x="5" y="14" width="38" height="8" rx="3" fill="#ff8ab4" ${S}/><path d="M24 14v27" stroke="${K}" stroke-width="2.6"/><path d="M21 14v27h6V14z" fill="#ffd95e" ${S}/><path d="M24 14c-3-6.5-11-7.5-11-2.5 0 2.8 5 2.5 11 2.5zM24 14c3-6.5 11-7.5 11-2.5 0 2.8-5 2.5-11 2.5z" fill="#ffd95e" ${S}/>`,
    // the wardrobe: a barber cape on a hanger
    wardrobe: () => `<path d="M24 11.5a3.2 3.2 0 1 1 3.2-3.2" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/><path d="M24 11.5v2.2L8 22.5h32L24 13.7" fill="none" ${S}/><path d="M9 22.5h30l3.5 18.5H5.5z" fill="#3aa2f2" ${S}/><path d="M14 22.5l-2 18.5M22 22.5l-1 18.5M30 22.5l1 18.5" stroke="#a8e4ff" stroke-width="2.6"/><path d="M18 22.5a6 6 0 0 0 12 0" fill="#fff" ${S}/>`,
    // the salon: the barber chair
    salon: () => `<path d="M14 6h20a3 3 0 0 1 3 3v14H11V9a3 3 0 0 1 3-3z" fill="#f04436" ${S}/><path d="M16 10.5h16" stroke="#ff9f93" stroke-width="2.6" stroke-linecap="round"/><rect x="7" y="22" width="34" height="8" rx="3" fill="#ff7d6e" ${S}/><path d="M4.5 19v9M43.5 19v9" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M24 30v7" stroke="${K}" stroke-width="5.4" stroke-linecap="round"/><path d="M24 30v7" stroke="#c6d0dc" stroke-width="2.4" stroke-linecap="round"/><path d="M13 42h22" stroke="${K}" stroke-width="5.4" stroke-linecap="round"/><path d="M13 42h22" stroke="#c6d0dc" stroke-width="2.4" stroke-linecap="round"/>`,
    // styles: an open lookbook of haircuts
    styles: () => `<path d="M4 11c6.5-3 13-2.6 20 1.6v28c-7-4-13.5-4.4-20-1.6z" fill="#fff" ${S}/><path d="M44 11c-6.5-3-13-2.6-20 1.6v28c7-4 13.5-4.4 20-1.6z" fill="#fff" ${S}/><circle cx="14" cy="25" r="5.2" fill="#e2b48d"/><path d="M8.6 24.5c0-4.6 2.4-7 5.4-7s5.4 2.4 5.4 7c-1.6-1.4-3.4-2-5.4-2s-3.8.6-5.4 2z" fill="#4a2f19"/><circle cx="34" cy="25" r="5.2" fill="#c48a5e"/><path d="M28.6 23.5c0-3.4 2.4-5 5.4-5s5.4 1.6 5.4 5c-1.6-.6-3.4-.9-5.4-.9s-3.8.3-5.4.9z" fill="#1d1712"/><path d="M28.6 26.2h10.8" stroke="#1d1712" stroke-width="1.6" opacity=".5"/>`,
    // regulars: a photo of a customer with a heart
    regulars: () => `<rect x="6" y="6" width="32" height="32" rx="4" fill="#fff" ${S}/><rect x="10" y="10" width="24" height="20" rx="2" fill="#a8e4ff"/><circle cx="22" cy="19" r="4.6" fill="#e2b48d" stroke="${K}" stroke-width="2"/><path d="M14 30c.8-4.6 4-7 8-7s7.2 2.4 8 7z" fill="#3aa2f2" stroke="${K}" stroke-width="2" stroke-linejoin="round"/><path d="M35 44s-9-5.4-9-11a4.5 4.5 0 0 1 9-1.6 4.5 4.5 0 0 1 9 1.6c0 5.6-9 11-9 11z" fill="#ff5c98" ${S}/>`,
    // orders: a customer thinking of the cut he wants
    orders: () => `<circle cx="17" cy="31" r="11" fill="#e2b48d" ${S}/><path d="M6.2 28.5c.4-6.8 5-10.5 10.8-10.5s10.4 3.7 10.8 10.5c-2.8-3-6.6-4.6-10.8-4.6s-8 1.6-10.8 4.6z" fill="#4a2f19" ${S}/><circle cx="13.5" cy="32" r="1.6" fill="${K}"/><circle cx="20.5" cy="32" r="1.6" fill="${K}"/><path d="M14 36.6c2 1.2 4 1.2 6 0" fill="none" stroke="${K}" stroke-width="2" stroke-linecap="round"/><circle cx="29.5" cy="18" r="2.2" fill="#fff" stroke="${K}" stroke-width="2"/><rect x="27" y="3" width="18" height="15" rx="6" fill="#fff" ${S}/><circle cx="36" cy="11.5" r="3.6" fill="#e2b48d"/><path d="M32.2 11c0-3 1.7-4.6 3.8-4.6s3.8 1.6 3.8 4.6c-1.1-1-2.4-1.4-3.8-1.4s-2.7.4-3.8 1.4z" fill="#4a2f19"/>`,
    // freestyle: the clipper with sparkles
    freestyle: () => `<g transform="rotate(20 24 26)"><rect x="16" y="16" width="16" height="27" rx="6" fill="#ffc21a" ${S}/><path d="M15 17v-7h18v7" fill="#c6d0dc" ${S}/><path d="M18 10V6.5M22 10V6.5M26 10V6.5M30 10V6.5" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="31" r="2.6" fill="#36b83a" stroke="${K}" stroke-width="1.8"/></g><path d="M7 9l1.4 3.6L12 14l-3.6 1.4L7 19l-1.4-3.6L2 14l3.6-1.4zM41 31l1.2 2.8L45 35l-2.8 1.2L41 39l-1.2-2.8L37 35l2.8-1.2z" fill="#ffd95e" stroke="${K}" stroke-width="1.8" stroke-linejoin="round"/>`,
    // rescue: a botched cut with a plaster on it
    rescue: () => `<circle cx="24" cy="28" r="15" fill="#e2b48d" ${S}/><path d="M9 26.5c0-10 6.6-15.5 15-15.5s15 5.5 15 15.5l-4.2-3.5-2.6 4-3.4-5.5-3 6.5-3.4-6.5-3 5-2.7-4z" fill="#4a2f19" ${S}/><g transform="rotate(-30 31 14)"><rect x="21" y="9.5" width="20" height="9" rx="4.5" fill="#ffd9a8" ${S}/><rect x="28" y="9.5" width="6" height="9" fill="#f2b880" stroke="${K}" stroke-width="2"/></g><circle cx="19" cy="31" r="1.8" fill="${K}"/><circle cx="29" cy="31" r="1.8" fill="${K}"/><path d="M20 37.5c2.6-1.6 5.4-1.6 8 0" fill="none" stroke="${K}" stroke-width="2.4" stroke-linecap="round"/>`,
    // beards: a man with a full beard
    beards: () => `<circle cx="24" cy="21" r="14" fill="#e2b48d" ${S}/><path d="M10 19c0 16 6.4 25 14 25s14-9 14-25c-3 5.6-7.6 8-14 8s-11-2.4-14-8z" fill="#5a3b1f" ${S}/><path d="M18.5 31c1.8 1.4 3.6 2 5.5 2s3.7-.6 5.5-2" fill="none" stroke="#e2b48d" stroke-width="2.6" stroke-linecap="round"/><path d="M10.5 15c1-6.6 6.4-10 13.5-10s12.5 3.4 13.5 10c-4-2.6-8.6-3.6-13.5-3.6S14.5 12.4 10.5 15z" fill="#5a3b1f" ${S}/><circle cx="18.5" cy="20" r="1.8" fill="${K}"/><circle cx="29.5" cy="20" r="1.8" fill="${K}"/>`,
    // relax: a rolled hot towel, steaming
    relax: () => `<path d="M10 25h26a8 8 0 0 1 0 16H10a8 8 0 0 1 0-16z" fill="#fff" ${S}/><circle cx="36" cy="33" r="8" fill="#e8f6ff" ${S}/><path d="M36 33m-1.6 0a1.6 1.6 0 1 1 3.2 0a3.6 3.6 0 1 1-7.2 0a5.4 5.4 0 1 1 10.8 0" fill="none" stroke="#3aa2f2" stroke-width="2.2" stroke-linecap="round"/><path d="M10 30.5h20M10 35.5h18" stroke="#a8e4ff" stroke-width="2.4" stroke-linecap="round"/><path d="M14 20c-3.4-4.2 3.4-6.2 0-11.5M24 20c-3.4-4.2 3.4-6.2 0-11.5" fill="none" stroke="${K}" stroke-width="2.6" stroke-linecap="round"/>`,
    // rush: a stopwatch with a lightning bolt
    rush: () => `<circle cx="24" cy="27" r="16" fill="#fff" ${S}/><path d="M19.5 4.5h9M24 4.5v6.5M37.5 12.5l3-3" stroke="${K}" stroke-width="3" stroke-linecap="round"/><path d="M26 15l-7.5 14H24l-3 10.5L30.5 24H25l3-9z" fill="#ffc21a" stroke="${K}" stroke-width="2.2" stroke-linejoin="round"/>`,
    // the level medal (the number is drawn over it)
    medal: () => `<path d="M15 3h8l3 12h-8zM33 3h-8l-3 12h8z" fill="#3aa2f2" ${S}/><circle cx="24" cy="29" r="15" fill="#ffc21a" ${S}/><circle cx="24" cy="29" r="10.5" fill="#ffd95e" stroke="#c98a12" stroke-width="2"/>`,
    // a video: the ad badge on video buttons
    video: () => `<rect x="5" y="10" width="38" height="27" rx="6" fill="#fff" ${S}/><path d="M20 17v13l11-6.5z" fill="${K}"/><path d="M16 42h16" stroke="${K}" stroke-width="3" stroke-linecap="round"/>`,
    tick: () => `<path d="M10 25l9 9 19-19" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
  };
  // measured shifts that put each drawing's centre on the grid centre (the play arrow on its visual weight)
  const NUDGE = { flame: [0, 2.6], gear: [0, -1.5], play: [-5, 0], back: [1.5, 0], lock: [0, -1], daily: [-1.1, 0], gift: [0, -0.7], wardrobe: [0, 0.9], styles: [0, -0.8], regulars: [-1, -1], orders: [-1.5, 1.5], freestyle: [0.5, -0.8], rescue: [-1.5, 0], beards: [0, -0.5], medal: [0, 0.5], video: [0, -2], tick: [0, -0.5], relax: [1, -0.8] };
  HSC.icon = function (name, size) {
    const f = ICON[name];
    if (!f) return '';
    const body = name === 'daily' ? f(new Date().getDate()) : f(), n = NUDGE[name];
    return `<svg class="hsc-ic hsc-ic-${name}" viewBox="0 0 48 48"${size ? ` width="${size}" height="${size}"` : ''} aria-hidden="true">${n ? `<g transform="translate(${n[0]} ${n[1]})">${body}</g>` : body}</svg>`;
  };
  HSC.ICON_NAMES = Object.keys(ICON);
})(globalThis.HSC || (globalThis.HSC = {}));
