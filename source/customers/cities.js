// ---------------------------------------------------------------------------------------------
// Android only (buildall.sh, HEAD_SHAPES=1): the city registry (docs/EVERGREEN-GAME-IMPLEMENTATION-HANDOFF.md
// section 6; CITY-CUSTOMER-VARIABILITY.md section 10; owner decision 5 November 2026: "36 cities, neutral").
//
// The handoff's 36 candidate cities, each a record with a stable id. Every record uses the neutral shared
// population table (the game's global heritage weights) at low confidence, and is marked for research and owner
// review: no city has an invented community, style, tattoo or practice table. When a city's researched table
// arrives it replaces only that record's fields and raises TABLE_VERSION.
//
// The coverage group is internal (geographic balance checks only): it never sets rewards, difficulty, prices,
// prestige or the map order. The map lists cities alphabetically in the player's language.
// Names are presentation only; ids never change after release.
// ---------------------------------------------------------------------------------------------
(function (HSC) {
  'use strict';
  // registry version: a career's tour roster records it; a roster from an older registry is migrated once
  const TABLE_VERSION = 2;
  const LANGS = ['en', 'es', 'pt', 'fr', 'de', 'ar', 'ja', 'ko', 'id', 'hi', 'tr', 'ru'];
  // id, coverage group, then the name in each language above (machine-drafted; human review pending)
  const ROWS = [
    ['lagos', 'africa', 'Lagos', 'Lagos', 'Lagos', 'Lagos', 'Lagos', 'لاغوس', 'ラゴス', '라고스', 'Lagos', 'लागोस', 'Lagos', 'Лагос'],
    ['kinshasa', 'africa', 'Kinshasa', 'Kinsasa', 'Kinshasa', 'Kinshasa', 'Kinshasa', 'كينشاسا', 'キンシャサ', '킨샤사', 'Kinshasa', 'किंशासा', 'Kinşasa', 'Киншаса'],
    ['nairobi', 'africa', 'Nairobi', 'Nairobi', 'Nairóbi', 'Nairobi', 'Nairobi', 'نيروبي', 'ナイロビ', '나이로비', 'Nairobi', 'नैरोबी', 'Nairobi', 'Найроби'],
    ['johannesburg', 'africa', 'Johannesburg', 'Johannesburgo', 'Joanesburgo', 'Johannesburg', 'Johannesburg', 'جوهانسبرغ', 'ヨハネスブルグ', '요하네스버그', 'Johannesburg', 'जोहान्सबर्ग', 'Johannesburg', 'Йоханнесбург'],
    ['cairo', 'africa', 'Cairo', 'El Cairo', 'Cairo', 'Le Caire', 'Kairo', 'القاهرة', 'カイロ', '카이로', 'Kairo', 'काहिरा', 'Kahire', 'Каир'],
    ['casablanca', 'africa', 'Casablanca', 'Casablanca', 'Casablanca', 'Casablanca', 'Casablanca', 'الدار البيضاء', 'カサブランカ', '카사블랑카', 'Casablanca', 'कासाब्लांका', 'Kazablanka', 'Касабланка'],
    ['london', 'europe', 'London', 'Londres', 'Londres', 'Londres', 'London', 'لندن', 'ロンドン', '런던', 'London', 'लंदन', 'Londra', 'Лондон'],
    ['paris', 'europe', 'Paris', 'París', 'Paris', 'Paris', 'Paris', 'باريس', 'パリ', '파리', 'Paris', 'पेरिस', 'Paris', 'Париж'],
    ['berlin', 'europe', 'Berlin', 'Berlín', 'Berlim', 'Berlin', 'Berlin', 'برلين', 'ベルリン', '베를린', 'Berlin', 'बर्लिन', 'Berlin', 'Берлин'],
    ['madrid', 'europe', 'Madrid', 'Madrid', 'Madri', 'Madrid', 'Madrid', 'مدريد', 'マドリード', '마드리드', 'Madrid', 'मैड्रिड', 'Madrid', 'Мадрид'],
    ['warsaw', 'europe', 'Warsaw', 'Varsovia', 'Varsóvia', 'Varsovie', 'Warschau', 'وارسو', 'ワルシャワ', '바르샤바', 'Warsawa', 'वारसॉ', 'Varşova', 'Варшава'],
    ['istanbul', 'west-asia', 'Istanbul', 'Estambul', 'Istambul', 'Istanbul', 'Istanbul', 'إسطنبول', 'イスタンブール', '이스탄불', 'Istanbul', 'इस्तांबुल', 'İstanbul', 'Стамбул'],
    ['riyadh', 'west-asia', 'Riyadh', 'Riad', 'Riad', 'Riyad', 'Riad', 'الرياض', 'リヤド', '리야드', 'Riyadh', 'रियाद', 'Riyad', 'Эр-Рияд'],
    ['dubai', 'west-asia', 'Dubai', 'Dubái', 'Dubai', 'Dubaï', 'Dubai', 'دبي', 'ドバイ', '두바이', 'Dubai', 'दुबई', 'Dubai', 'Дубай'],
    ['amman', 'west-asia', 'Amman', 'Amán', 'Amã', 'Amman', 'Amman', 'عمّان', 'アンマン', '암만', 'Amman', 'अम्मान', 'Amman', 'Амман'],
    ['delhi', 'south-asia', 'Delhi', 'Delhi', 'Délhi', 'Delhi', 'Delhi', 'دلهي', 'デリー', '델리', 'Delhi', 'दिल्ली', 'Delhi', 'Дели'],
    ['mumbai', 'south-asia', 'Mumbai', 'Bombay', 'Mumbai', 'Bombay', 'Mumbai', 'مومباي', 'ムンバイ', '뭄바이', 'Mumbai', 'मुंबई', 'Mumbai', 'Мумбаи'],
    ['karachi', 'south-asia', 'Karachi', 'Karachi', 'Karachi', 'Karachi', 'Karatschi', 'كراتشي', 'カラチ', '카라치', 'Karachi', 'कराची', 'Karaçi', 'Карачи'],
    ['dhaka', 'south-asia', 'Dhaka', 'Daca', 'Daca', 'Dacca', 'Dhaka', 'دكا', 'ダッカ', '다카', 'Dhaka', 'ढाका', 'Dakka', 'Дакка'],
    ['colombo', 'south-asia', 'Colombo', 'Colombo', 'Colombo', 'Colombo', 'Colombo', 'كولومبو', 'コロンボ', '콜롬보', 'Kolombo', 'कोलंबो', 'Kolombo', 'Коломбо'],
    ['tokyo', 'east-asia', 'Tokyo', 'Tokio', 'Tóquio', 'Tokyo', 'Tokio', 'طوكيو', '東京', '도쿄', 'Tokyo', 'टोक्यो', 'Tokyo', 'Токио'],
    ['seoul', 'east-asia', 'Seoul', 'Seúl', 'Seul', 'Séoul', 'Seoul', 'سول', 'ソウル', '서울', 'Seoul', 'सियोल', 'Seul', 'Сеул'],
    ['shanghai', 'east-asia', 'Shanghai', 'Shanghái', 'Xangai', 'Shanghai', 'Shanghai', 'شنغهاي', '上海', '상하이', 'Shanghai', 'शंघाई', 'Şanghay', 'Шанхай'],
    ['jakarta', 'east-asia', 'Jakarta', 'Yakarta', 'Jacarta', 'Jakarta', 'Jakarta', 'جاكرتا', 'ジャカルタ', '자카르타', 'Jakarta', 'जकार्ता', 'Cakarta', 'Джакарта'],
    ['manila', 'east-asia', 'Manila', 'Manila', 'Manila', 'Manille', 'Manila', 'مانيلا', 'マニラ', '마닐라', 'Manila', 'मनीला', 'Manila', 'Манила'],
    ['bangkok', 'east-asia', 'Bangkok', 'Bangkok', 'Bangkok', 'Bangkok', 'Bangkok', 'بانكوك', 'バンコク', '방콕', 'Bangkok', 'बैंकॉक', 'Bangkok', 'Бангкок'],
    ['new-york', 'north-america', 'New York', 'Nueva York', 'Nova York', 'New York', 'New York', 'نيويورك', 'ニューヨーク', '뉴욕', 'New York', 'न्यूयॉर्क', 'New York', 'Нью-Йорк'],
    ['los-angeles', 'north-america', 'Los Angeles', 'Los Ángeles', 'Los Angeles', 'Los Angeles', 'Los Angeles', 'لوس أنجلوس', 'ロサンゼルス', '로스앤젤레스', 'Los Angeles', 'लॉस एंजिल्स', 'Los Angeles', 'Лос-Анджелес'],
    ['toronto', 'north-america', 'Toronto', 'Toronto', 'Toronto', 'Toronto', 'Toronto', 'تورونتو', 'トロント', '토론토', 'Toronto', 'टोरंटो', 'Toronto', 'Торонто'],
    ['montreal', 'north-america', 'Montreal', 'Montreal', 'Montreal', 'Montréal', 'Montreal', 'مونتريال', 'モントリオール', '몬트리올', 'Montreal', 'मॉन्ट्रियल', 'Montreal', 'Монреаль'],
    ['mexico-city', 'latin-america', 'Mexico City', 'Ciudad de México', 'Cidade do México', 'Mexico', 'Mexiko-Stadt', 'مكسيكو سيتي', 'メキシコシティ', '멕시코시티', 'Kota Meksiko', 'मेक्सिको सिटी', 'Meksiko', 'Мехико'],
    ['sao-paulo', 'latin-america', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'São Paulo', 'ساو باولو', 'サンパウロ', '상파울루', 'São Paulo', 'साओ पाउलो', 'São Paulo', 'Сан-Паулу'],
    ['buenos-aires', 'latin-america', 'Buenos Aires', 'Buenos Aires', 'Buenos Aires', 'Buenos Aires', 'Buenos Aires', 'بوينس آيرس', 'ブエノスアイレス', '부에노스아이레스', 'Buenos Aires', 'ब्यूनस आयर्स', 'Buenos Aires', 'Буэнос-Айрес'],
    ['kingston', 'latin-america', 'Kingston', 'Kingston', 'Kingston', 'Kingston', 'Kingston', 'كينغستون', 'キングストン', '킹스턴', 'Kingston', 'किंग्स्टन', 'Kingston', 'Кингстон'],
    ['sydney', 'oceania', 'Sydney', 'Sídney', 'Sydney', 'Sydney', 'Sydney', 'سيدني', 'シドニー', '시드니', 'Sydney', 'सिडनी', 'Sidney', 'Сидней'],
    ['auckland', 'oceania', 'Auckland', 'Auckland', 'Auckland', 'Auckland', 'Auckland', 'أوكلاند', 'オークランド', '오클랜드', 'Auckland', 'ऑकलैंड', 'Auckland', 'Окленд'],
  ];
  // the handoff's internal coverage allocation (section 6.2): a registry that breaks it fails validation
  const COVERAGE = { africa: 6, europe: 5, 'west-asia': 4, 'south-asia': 5, 'east-asia': 6, 'north-america': 4, 'latin-america': 4, oceania: 2 };

  // Who comes to each city (owner-directed, 6 November 2026): the city's main group and a strong second group. A city
  // is never uniform: career-catalog.js blends these with the neutral table. Provisional until sourced and reviewed.
  const PEOPLE = {
    lagos: ['west-african', 'east-african'], kinshasa: ['west-african', 'east-african'], nairobi: ['east-african', 'south-asian'], johannesburg: ['east-african', 'north-european'],
    cairo: ['mena', 'east-african'], casablanca: ['mena', 'mediterranean'], london: ['north-european', 'south-asian'], paris: ['mediterranean', 'mena'],
    berlin: ['north-european', 'mena'], madrid: ['mediterranean', 'latino'], warsaw: ['north-european', 'mediterranean'], istanbul: ['mena', 'mediterranean'],
    riyadh: ['mena', 'south-asian'], dubai: ['mena', 'south-asian'], amman: ['mena', 'mediterranean'], delhi: ['south-asian', 'mixed'], mumbai: ['south-asian', 'mixed'],
    karachi: ['south-asian', 'mena'], dhaka: ['south-asian', 'southeast-asian'], colombo: ['south-asian', 'southeast-asian'], tokyo: ['east-asian', 'southeast-asian'],
    seoul: ['east-asian', 'southeast-asian'], shanghai: ['east-asian', 'southeast-asian'], jakarta: ['southeast-asian', 'east-asian'], manila: ['southeast-asian', 'east-asian'],
    bangkok: ['southeast-asian', 'east-asian'], 'new-york': ['mixed', 'latino'], 'los-angeles': ['mixed', 'latino'], toronto: ['mixed', 'south-asian'], montreal: ['mixed', 'mediterranean'],
    'mexico-city': ['latino', 'indigenous-american'], 'sao-paulo': ['latino', 'mixed'], 'buenos-aires': ['mediterranean', 'latino'], kingston: ['west-african', 'mixed'],
    sydney: ['mixed', 'pacific-islander'], auckland: ['pacific-islander', 'north-european'],
  };
  // Local habits (owner-directed, 6 November 2026; provisional until sourced and reviewed): the age mix [young, middle, old],
  // the share of men with facial hair, which haircut families lean up or down, and how much more or less often than the
  // game's base rate men have a visible tattoo or an ear piercing. All are soft weights on residents: a city
  // never fixes a man's age, beard or cut, and no cut is ever ruled out.
  const YOUNG = [0.5, 0.38, 0.12], EVEN = [0.36, 0.42, 0.22], OLDER = [0.26, 0.42, 0.32];
  const FADE = { fade: 1.6, skin: 1.4, temple: 1.3 }, CLASSIC = { classic: 1.5, taper: 1.3, crew: 1.2 }, NEAT = { taper: 1.5, classic: 1.3, trim: 1.2 }, MODERN = { undercut: 1.5, fade: 1.3, taper: 1.2 };
  const HABITS = {
    tokyo: { age: OLDER, beard: 0.3, cuts: NEAT, tattoo: 0.25, ear: 1 }, seoul: { age: OLDER, beard: 0.3, cuts: NEAT, tattoo: 0.3, ear: 1.2 }, jakarta: { age: YOUNG, beard: 0.35, cuts: MODERN, tattoo: 0.4, ear: 0.7 }, manila: { age: YOUNG, beard: 0.3, cuts: MODERN, tattoo: 0.8, ear: 0.9 },
    mumbai: { age: YOUNG, beard: 0.6, cuts: MODERN, tattoo: 0.4, ear: 0.8 }, karachi: { age: YOUNG, beard: 0.7, cuts: NEAT, tattoo: 0.15, ear: 0.3 }, istanbul: { age: EVEN, beard: 0.6, cuts: MODERN, tattoo: 0.6, ear: 0.6 }, cairo: { age: YOUNG, beard: 0.6, cuts: NEAT, tattoo: 0.15, ear: 0.3 },
    lagos: { age: YOUNG, beard: 0.5, cuts: FADE, tattoo: 0.5, ear: 1 }, kingston: { age: EVEN, beard: 0.5, cuts: FADE, tattoo: 1.1, ear: 1.8 }, nairobi: { age: YOUNG, beard: 0.5, cuts: FADE, tattoo: 0.5, ear: 0.9 }, london: { age: EVEN, beard: 0.5, cuts: CLASSIC, tattoo: 1.6, ear: 1.3 },
    berlin: { age: OLDER, beard: 0.55, cuts: CLASSIC, tattoo: 1.8, ear: 1.3 }, madrid: { age: OLDER, beard: 0.55, cuts: CLASSIC, tattoo: 1.3, ear: 1.2 }, 'mexico-city': { age: EVEN, beard: 0.45, cuts: FADE, tattoo: 1.4, ear: 1 }, 'sao-paulo': { age: EVEN, beard: 0.5, cuts: FADE, tattoo: 1.8, ear: 1.5 },
    'new-york': { age: EVEN, beard: 0.5, cuts: FADE, tattoo: 2.2, ear: 1.6 }, auckland: { age: EVEN, beard: 0.5, cuts: CLASSIC, tattoo: 2.2, ear: 1.1 },
  };
  // the 18 cities Career launches with (owner, 6 November 2026); the rest stay here, switched off, for later updates
  const LAUNCH = new Set(['tokyo', 'seoul', 'jakarta', 'manila', 'mumbai', 'karachi', 'istanbul', 'cairo', 'lagos', 'kingston', 'nairobi', 'london', 'berlin', 'madrid', 'mexico-city', 'sao-paulo', 'new-york', 'auckland']);
  // one city record (CITY-CUSTOMER-VARIABILITY.md section 10). A null table means "use the neutral fallback";
  // every fallback field is low confidence and the record stays in research review until sourced.
  function record(row) {
    const [id, group] = row, names = {};
    LANGS.forEach((l, i) => { names[l] = row[2 + i]; });
    return {
      id, group, names, enabled: LAUNCH.has(id),
      geography: 'metro',
      population: null,               // resident community weights: null = the neutral global table
      people: PEOPLE[id] || null,     // the provisional main and second group (see PEOPLE)
      habits: HABITS[id] || null,     // the provisional local age, beard and haircut weights (see HABITS)
      visitor: { share: 0.12, mix: null }, // bounded visitor share; mix null = neutral world table
      ages: null, styles: null, beards: null, practice: null, tattoo: null, motifs: null, piercing: null, culture: null,
      starter: 'universal',           // starter-set and unlock profile: the universal viability floor
      salonRefs: [], sources: [],
      confidence: 'low', review: 'research', tableVersion: TABLE_VERSION,
    };
  }
  const CITIES = ROWS.map(record);

  // reason codes for a record that may not ship (empty list = valid)
  const VISITOR_MAX = 0.4;
  function validateCity(c) {
    const r = [];
    if (!c || typeof c !== 'object') return ['not-a-record'];
    if (typeof c.id !== 'string' || !/^[a-z][a-z0-9-]{1,31}$/.test(c.id)) r.push('id');
    if (!COVERAGE[c.group]) r.push('group');
    if (!c.names || typeof c.names.en !== 'string' || !c.names.en) r.push('name-en');
    for (const l of LANGS) if (!c.names || typeof c.names[l] !== 'string' || !c.names[l].trim()) r.push('name-' + l);
    if (c.population != null) {
      const g = c.population.groups, w = g && Object.values(g);
      if (!w || !w.length || w.some((x) => !(x >= 0)) || Math.abs(w.reduce((a, b) => a + b, 0) - 1) > 1e-6) r.push('population-sum');
      if (!['high', 'medium', 'low'].includes(c.population.confidence)) r.push('population-confidence');
    }
    if (!c.visitor || !(c.visitor.share >= 0 && c.visitor.share <= VISITOR_MAX)) r.push('visitor-share');
    if (c.starter !== 'universal' && typeof c.starter !== 'string') r.push('starter');
    if (!['high', 'medium', 'low'].includes(c.confidence)) r.push('confidence');
    if (!['research', 'cultural', 'owner', 'approved'].includes(c.review)) r.push('review');
    if (!Number.isSafeInteger(c.tableVersion) || c.tableVersion < 1) r.push('table-version');
    // a sourced table must cite its sources; the neutral fallback needs none
    if ((c.population || c.styles || c.tattoo || c.culture) && !(Array.isArray(c.sources) && c.sources.length)) r.push('unsourced-table');
    return r;
  }
  function validateRegistry(list) {
    const r = [], ids = new Set(), count = {};
    for (const c of list) {
      for (const x of validateCity(c)) r.push(c && c.id + ':' + x);
      if (c && ids.has(c.id)) r.push(c.id + ':duplicate');
      if (c) { ids.add(c.id); count[c.group] = (count[c.group] || 0) + 1; }
    }
    if (list.length > 36) r.push('more-than-36');
    for (const [g, n] of Object.entries(COVERAGE)) if ((count[g] || 0) !== n) r.push('coverage:' + g);
    return r;
  }

  HSC.CITIES = CITIES;
  HSC.CITIES_VERSION = TABLE_VERSION;
  HSC.cityRegistry = { TABLE_VERSION, LANGS, COVERAGE, VISITOR_MAX, PEOPLE, validateCity, validateRegistry, record };
  // the city's name in the player's language (English as the fallback; the stable id if unknown)
  HSC.cityName = (id) => {
    const c = CITIES.find((x) => x.id === id);
    if (!c) return id;
    // the language pack's city_<id> (labels-packs.js), then this table by base language, then English
    const l = HSC.lang ? HSC.lang() : 'en';
    return (HSC.tHas && HSC.tHas('city_' + id)) || c.names[l] || c.names[l.split('-')[0]] || c.names.en;
  };
})(globalThis.HSC || (globalThis.HSC = {}));
