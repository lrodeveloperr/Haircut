// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1; owner decision 5 November 2026): menus carry one-word labels next to
// their icons; the cutting screen stays wordless. Every label is one word in every language, and fitLabels() shrinks
// a label until it fits its button, so no layout changes with the language. Right-to-left languages mirror the menus.
// Languages: the ten store-listing languages plus Turkish and Russian, picked from the phone's language.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  if (!HSC.PHENOTYPES) return;
  const T = {
    en: { play: 'Play', modes: 'Modes', daily: 'Daily', gift: 'Gift', wardrobe: 'Wardrobe', salon: 'Salon', styles: 'Styles', regulars: 'Regulars', orders: 'Orders', freestyle: 'Freestyle', rescue: 'Rescue', beards: 'Beards', relax: 'Relax', rush: 'Rush', event: 'Event', new: 'New' },
    es: { play: 'Jugar', modes: 'Modos', daily: 'Diario', gift: 'Regalo', wardrobe: 'Armario', salon: 'Salón', styles: 'Estilos', regulars: 'Habituales', orders: 'Pedidos', freestyle: 'Libre', rescue: 'Rescate', beards: 'Barbas', relax: 'Relax', rush: 'Prisa', event: 'Evento', new: 'Nuevo' },
    pt: { play: 'Jogar', modes: 'Modos', daily: 'Diário', gift: 'Presente', wardrobe: 'Armário', salon: 'Salão', styles: 'Estilos', regulars: 'Fregueses', orders: 'Pedidos', freestyle: 'Livre', rescue: 'Resgate', beards: 'Barbas', relax: 'Relaxar', rush: 'Correria', event: 'Evento', new: 'Novo' },
    fr: { play: 'Jouer', modes: 'Modes', daily: 'Défi', gift: 'Cadeau', wardrobe: 'Vestiaire', salon: 'Salon', styles: 'Styles', regulars: 'Habitués', orders: 'Commandes', freestyle: 'Libre', rescue: 'Sauvetage', beards: 'Barbes', relax: 'Détente', rush: 'Rush', event: 'Événement', new: 'Nouveau' },
    de: { play: 'Spielen', modes: 'Modi', daily: 'Täglich', gift: 'Geschenk', wardrobe: 'Garderobe', salon: 'Salon', styles: 'Frisuren', regulars: 'Stammkunden', orders: 'Aufträge', freestyle: 'Freestyle', rescue: 'Rettung', beards: 'Bärte', relax: 'Entspannen', rush: 'Ansturm', event: 'Event', new: 'Neu' },
    ar: { play: 'العب', modes: 'الأنماط', daily: 'يومي', gift: 'هدية', wardrobe: 'الخزانة', salon: 'الصالون', styles: 'القصات', regulars: 'المعتادون', orders: 'الطلبات', freestyle: 'حر', rescue: 'إنقاذ', beards: 'اللحى', relax: 'استرخاء', rush: 'زحمة', event: 'حدث', new: 'جديد' },
    ja: { play: 'プレイ', modes: 'モード', daily: 'デイリー', gift: 'ギフト', wardrobe: '衣装', salon: 'サロン', styles: 'スタイル', regulars: '常連', orders: '注文', freestyle: 'フリー', rescue: '救出', beards: 'ひげ', relax: 'リラックス', rush: 'ラッシュ', event: 'イベント', new: '新着' },
    ko: { play: '플레이', modes: '모드', daily: '일일', gift: '선물', wardrobe: '옷장', salon: '살롱', styles: '스타일', regulars: '단골', orders: '주문', freestyle: '자유', rescue: '구조', beards: '수염', relax: '휴식', rush: '러시', event: '이벤트', new: '신규' },
    id: { play: 'Main', modes: 'Mode', daily: 'Harian', gift: 'Hadiah', wardrobe: 'Lemari', salon: 'Salon', styles: 'Gaya', regulars: 'Langganan', orders: 'Pesanan', freestyle: 'Bebas', rescue: 'Perbaiki', beards: 'Jenggot', relax: 'Santai', rush: 'Kilat', event: 'Acara', new: 'Baru' },
    hi: { play: 'खेलें', modes: 'मोड', daily: 'दैनिक', gift: 'उपहार', wardrobe: 'अलमारी', salon: 'सैलून', styles: 'स्टाइल', regulars: 'नियमित', orders: 'ऑर्डर', freestyle: 'फ्रीस्टाइल', rescue: 'बचाव', beards: 'दाढ़ी', relax: 'आराम', rush: 'रश', event: 'इवेंट', new: 'नया' },
    tr: { play: 'Oyna', modes: 'Modlar', daily: 'Günlük', gift: 'Hediye', wardrobe: 'Gardırop', salon: 'Salon', styles: 'Stiller', regulars: 'Müdavimler', orders: 'Siparişler', freestyle: 'Serbest', rescue: 'Kurtarma', beards: 'Sakallar', relax: 'Rahatla', rush: 'Acele', event: 'Etkinlik', new: 'Yeni' },
    ru: { play: 'Играть', modes: 'Режимы', daily: 'День', gift: 'Подарок', wardrobe: 'Гардероб', salon: 'Салон', styles: 'Стрижки', regulars: 'Постоянные', orders: 'Заказы', freestyle: 'Фристайл', rescue: 'Спасение', beards: 'Бороды', relax: 'Релакс', rush: 'Спешка', event: 'Событие', new: 'Новое' },
  };
  const pick = () => {
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'en']);
    for (const l of langs) { const k = String(l).toLowerCase().slice(0, 2); if (T[k]) return k; }
    return 'en';
  };
  let lang = pick();
  HSC.lang = () => lang;
  HSC.setLang = (l) => { if (T[l]) lang = l; };
  HSC.rtl = () => lang === 'ar';
  HSC.t = (k) => (T[lang] && T[lang][k]) || T.en[k] || '';
  // shrink every label in `root` until it fits its box (from its CSS size down to 9 px); never wraps
  // labels inside a `.hsc-same` group then all take the smallest size any of them needed, so a row of buttons
  // keeps one text size and one baseline
  HSC.fitLabels = function (root) {
    const els = [...(root || document).querySelectorAll('.hsc-lbl')].filter((el) => el.offsetParent);
    for (const el of els) {
      el.style.fontSize = '';
      let s = parseFloat(getComputedStyle(el).fontSize) || 14;
      let guard = 40;
      while (el.scrollWidth > el.clientWidth + 0.5 && s > 9 && guard--) { s -= 0.5; el.style.fontSize = s + 'px'; }
    }
    const groups = new Map();
    for (const el of els) { const g = el.closest('.hsc-same'); if (g) { if (!groups.has(g)) groups.set(g, []); groups.get(g).push(el); } }
    for (const list of groups.values()) {
      const min = Math.min(...list.map((el) => parseFloat(getComputedStyle(el).fontSize) || 14));
      for (const el of list) el.style.fontSize = min + 'px';
    }
  };
  HSC.LABELS = T;
})(globalThis.HSC || (globalThis.HSC = {}));
