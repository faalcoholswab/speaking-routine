/* =========================================================
   음성 선택 — 설정(억양·성별·속도)을 따르는 공부/모의고사 목소리
   - 설정은 window.AppSettings 에서 읽는다. 없으면 기본값(미국식·여성·1.0).
   - 미국식/영국식/섞기, 여성/남성/섞기를 지원하고, 없는 목소리는 가장 가까운 것으로 대체한다.
   - 설정에서 목소리를 직접 고르면(voice.picks) 억양·성별 대신 그 목소리만 쓴다.
     처음 고른 목소리가 모의고사 안내, 두 번째가 질문을 읽는다.
   - 장난감·효과음 목소리(Bad News, Bahh…)와 Eloquence(Eddy, Grandpa…)는 목록에서 뺀다.
   - window.SpeechVoice = { load, all, catalog, hiddenCount, idOf, picked, examPair, study,
                            genderOf, qualityOf, rate, applyRate, status, preview }
   ========================================================= */
(() => {
  'use strict';

  const FEMALE = [
    'samantha', 'ava', 'allie', 'susan', 'zoe', 'karen', 'moira', 'serena',
    'tessa', 'fiona', 'victoria', 'vicki', 'zira', 'hazel', 'aria', 'jenny', 'michelle',
    'sonia', 'libby', 'natasha', 'clara', 'emily', 'olivia', 'amelie', 'joanna',
    'salli', 'kendra', 'kimberly', 'ivy', 'nora', 'female', 'woman', 'kate', 'stephanie',
    'martha', 'matilda', 'catherine', 'isha', 'veena', 'nicky', 'noelle', 'joelle', 'allison',
  ];

  const MALE = [
    'alex', 'daniel', 'tom', 'oliver', 'david', 'mark', 'george', 'james',
    'ryan', 'guy', 'eric', 'christopher', 'aaron', 'adam', 'brian', 'arthur',
    'male', 'man', 'gordon', 'lee', 'rishi', 'jamie', 'nathan', 'evan',
  ];

  // iOS·macOS가 함께 주는 장난감·효과음 목소리와 옛 합성 목소리. 공부용으로 쓰지 않는다.
  const NOVELTY = [
    'albert', 'bad news', 'bahh', 'bells', 'boing', 'bubbles', 'cellos', 'good news',
    'jester', 'organ', 'pipe organ', 'superstar', 'trinoids', 'whisper', 'wobble', 'zarvox',
    'fred', 'junior', 'ralph', 'kathy', 'agnes', 'bruce', 'princess', 'deranged', 'hysterical',
  ];
  // Eloquence는 화면 읽기용 기계음이다. voiceURI에 'eloquence'가 없을 때를 대비해 이름으로도 거른다.
  const ELOQUENCE = ['eddy', 'flo', 'grandma', 'grandpa', 'reed', 'rocko', 'sandy', 'shelley'];
  // 쓸 수는 있지만 오래된 합성음이라 자동 선택에서는 마지막에 고른다.
  const LEGACY = ['vicki', 'victoria'];

  const FEMALE_SET = new Set(FEMALE);
  const MALE_SET = new Set(MALE);
  const NOISE_SET = new Set(NOVELTY.concat(ELOQUENCE));
  const LEGACY_SET = new Set(LEGACY);
  const QUALITY_RANK = { premium: 3, enhanced: 2, default: 1, legacy: 0 };
  const REGIONS = {
    us: '미국', gb: '영국', au: '호주', ie: '아일랜드', in: '인도',
    za: '남아공', nz: '뉴질랜드', ca: '캐나다', sg: '싱가포르',
  };
  const MAX_PICKS = 20;

  const FALLBACK_SETTINGS = { voice: { accent: 'us', gender: 'female', rate: 1, picks: [] }, autoScore: true };
  const ACCENTS = ['us', 'uk', 'mix'];
  const GENDERS = ['female', 'male', 'mix'];
  const PREVIEW_TEXT = 'Hello, this is how I will sound when you practise.';

  let cache = [];
  let hidden = 0;
  let lastStudyName = '';
  let watched = false;

  function normalize(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\b(microsoft|google|apple)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function genderOf(voice) {
    if (!voice) return '';
    const name = normalize(voice.name);
    const first = name.split(/[\s\-_]+/).filter(Boolean)[0] || '';
    if (FEMALE_SET.has(first)) return 'f';
    if (MALE_SET.has(first)) return 'm';
    if (name.includes('us english')) return 'f';
    for (const word of FEMALE_SET) {
      if (word.length > 3 && name.includes(word)) return 'f';
    }
    for (const word of MALE_SET) {
      if (word.length > 3 && name.includes(word)) return 'm';
    }
    return '';
  }

  function langOf(voice) {
    return String((voice && voice.lang) || '').replace(/_/g, '-').toLowerCase();
  }

  // 'us' | 'uk' | 'en' | '' — 영어권 억양을 세 덩어리로 나눈다.
  function accentOf(voice) {
    const lang = langOf(voice);
    if (!lang) return '';
    if (lang.startsWith('en-us')) return 'us';
    if (lang.startsWith('en-gb')) return 'uk';
    if (lang.startsWith('en')) return 'en';
    return '';
  }

  // 화면에 보여 줄 지역 이름. 스코틀랜드(Fiona)는 iOS가 en-scotland 같은 값을 준다.
  function regionOf(voice) {
    const lang = langOf(voice);
    if (/sct|scotland/.test(lang)) return '스코틀랜드';
    const match = lang.match(/^en-([a-z]{2})/);
    return (match && REGIONS[match[1]]) || '기타 영어';
  }

  function isNoise(voice) {
    if (String((voice && voice.voiceURI) || '').toLowerCase().includes('eloquence')) return true;
    return NOISE_SET.has(normalize(voice && voice.name));
  }

  // iOS·macOS는 품질을 이름이 아니라 voiceURI(com.apple.voice.premium.en-US.Zoe 등)에 적는다.
  function qualityOf(voice) {
    if (!voice) return 'default';
    const key = `${voice.voiceURI || ''} ${voice.name || ''}`.toLowerCase();
    if (key.includes('premium')) return 'premium';
    if (key.includes('enhanced') || key.includes('siri')) return 'enhanced';
    if (LEGACY_SET.has(normalize(voice.name))) return 'legacy';
    return 'default';
  }

  function idOf(voice) {
    if (!voice) return '';
    return String(voice.voiceURI || `${voice.name || ''}|${voice.lang || ''}`);
  }

  function readSettings() {
    const api = window.AppSettings;
    if (api && typeof api.get === 'function') {
      try {
        const value = api.get();
        if (value && value.voice) return value;
      } catch (error) {
        /* 설정을 못 읽어도 소리는 나야 한다 */
      }
    }
    return JSON.parse(JSON.stringify(FALLBACK_SETTINGS));
  }

  function wanted() {
    const settings = readSettings();
    const voice = settings.voice || {};
    return {
      accent: ACCENTS.includes(voice.accent) ? voice.accent : 'us',
      gender: GENDERS.includes(voice.gender) ? voice.gender : 'female',
      rate: Number.isFinite(Number(voice.rate)) ? Number(voice.rate) : 1,
      picks: Array.isArray(voice.picks) ? voice.picks.filter((id) => typeof id === 'string').slice(0, MAX_PICKS) : [],
    };
  }

  // 영어 목소리만, 장난감·Eloquence 목소리는 빼고 돌려준다. 뺀 개수는 hidden 에 남긴다.
  function read() {
    if (!('speechSynthesis' in window)) return [];
    try {
      const english = (window.speechSynthesis.getVoices() || []).filter((voice) => accentOf(voice) !== '');
      const clean = english.filter((voice) => !isNoise(voice));
      if (english.length) hidden = english.length - clean.length;
      return clean;
    } catch (error) {
      return [];
    }
  }

  // iPad Safari 는 voiceschanged 를 늦게 보낸다. 한 번만 붙여 두고 목록이 오면 캐시를 갈아 끼운다.
  function watch() {
    if (watched) return;
    watched = true;
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.addEventListener('voiceschanged', () => {
        const list = read();
        if (list.length) cache = list;
      });
    } catch (error) {
      /* addEventListener 미지원 환경 */
    }
  }

  function load() {
    watch();
    return new Promise((resolve) => {
      const now = read();
      if (now.length) {
        cache = now;
        resolve(cache);
        return;
      }
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }
      const synth = window.speechSynthesis;
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        try { synth.removeEventListener('voiceschanged', done); } catch (error) { /* noop */ }
        const list = read();
        if (list.length) cache = list;
        resolve(cache);
      };
      try { synth.addEventListener('voiceschanged', done); } catch (error) { /* noop */ }
      window.setTimeout(done, 1500);
    });
  }

  function all() {
    if (!cache.length) cache = read();
    return cache;
  }

  function voiceRank(voice) {
    return QUALITY_RANK[qualityOf(voice)];
  }

  function bestOf(list) {
    return list.slice().sort((a, b) => voiceRank(b) - voiceRank(a))[0] || null;
  }

  // 가장 좋은 품질 단계의 목소리만 남긴다(프리미엄이 있으면 기본 목소리는 쓰지 않는다).
  function topTier(list) {
    if (!list.length) return list;
    const best = Math.max(...list.map(voiceRank));
    return list.filter((voice) => voiceRank(voice) === best);
  }

  // 설정에서 직접 고른 목소리 중 이 기기에 있는 것. 고른 순서를 지킨다.
  function picked() {
    const ids = wanted().picks;
    if (!ids.length) return [];
    const list = all();
    return ids.map((id) => list.find((voice) => idOf(voice) === id)).filter(Boolean);
  }

  // 설정 화면 목록: 미국 → 영국 → 그 밖, 같은 지역 안에서는 품질 → 이름 순.
  function catalog() {
    const order = { us: 0, uk: 1, en: 2 };
    const ids = wanted().picks;
    return all()
      .map((voice) => ({
        id: idOf(voice),
        name: String(voice.name || '').replace(/\s*\([^)]*\)\s*$/, '') || String(voice.name || ''),
        lang: voice.lang || '',
        region: regionOf(voice),
        gender: genderOf(voice),
        quality: qualityOf(voice),
        pickOrder: ids.indexOf(idOf(voice)),
        voice,
      }))
      .sort((a, b) => (order[accentOf(a.voice)] - order[accentOf(b.voice)])
        || (QUALITY_RANK[b.quality] - QUALITY_RANK[a.quality])
        || a.name.localeCompare(b.name));
  }

  function hiddenCount() {
    if (!cache.length) cache = read();
    return hidden;
  }

  function countByAccent(list) {
    const counts = { us: 0, uk: 0, en: 0 };
    for (const voice of list) {
      const accent = accentOf(voice);
      if (accent) counts[accent] += 1;
    }
    return counts;
  }

  // 설정한 억양을 우선하되, 없으면 가장 가까운 영어 목소리로 내려간다.
  function accentPool(accent) {
    const list = all();
    if (!list.length) return { pool: [], used: accent, fallback: true, reason: '기기에 영어 목소리가 없습니다.' };
    const byUs = list.filter((voice) => accentOf(voice) === 'us');
    const byUk = list.filter((voice) => accentOf(voice) === 'uk');
    const byEn = list.filter((voice) => accentOf(voice) === 'en');
    const order = accent === 'uk'
      ? [[byUk, 'uk'], [byUs, 'us'], [byEn, 'en']]
      : accent === 'mix'
        ? [[byUs.concat(byUk), accent], [byEn, 'en']]
        : [[byUs, 'us'], [byUk, 'uk'], [byEn, 'en']];
    for (const [pool, used] of order) {
      if (pool.length) {
        return {
          pool,
          used,
          fallback: used !== accent && !(accent === 'mix' && used === 'mix'),
          reason: used === accent ? '' : `${label(accent)} 목소리가 없어 ${label(used)}로 대체했습니다.`,
        };
      }
    }
    return { pool: list, used: 'en', fallback: true, reason: '설정한 억양의 목소리가 없어 가까운 영어 목소리로 대체했습니다.' };
  }

  function label(accent) {
    if (accent === 'us') return '미국식';
    if (accent === 'uk') return '영국식';
    if (accent === 'mix') return '섞기';
    return '기타 영어';
  }

  function genderPool(list, gender) {
    if (!list.length) return { pool: [], used: gender, fallback: true, reason: '기기에 영어 목소리가 없습니다.' };
    const females = list.filter((voice) => genderOf(voice) === 'f');
    const males = list.filter((voice) => genderOf(voice) === 'm');
    if (gender === 'female' && females.length) return { pool: females, used: 'female', fallback: false, reason: '' };
    if (gender === 'male' && males.length) return { pool: males, used: 'male', fallback: false, reason: '' };
    if (gender === 'mix' && (females.length || males.length)) {
      const pool = females.concat(males);
      const missing = !females.length ? '여성' : !males.length ? '남성' : '';
      return {
        pool,
        used: missing ? (females.length ? 'female' : 'male') : 'mix',
        fallback: Boolean(missing),
        reason: missing ? `${missing} 목소리가 없어 한 성별로만 재생합니다.` : '',
      };
    }
    if (gender === 'female' && males.length) {
      return { pool: males, used: 'male', fallback: true, reason: '여성 목소리가 없어 남성 목소리로 대체했습니다.' };
    }
    if (gender === 'male' && females.length) {
      return { pool: females, used: 'female', fallback: true, reason: '남성 목소리가 없어 여성 목소리로 대체했습니다.' };
    }
    return { pool: list, used: gender, fallback: true, reason: '설정한 성별의 목소리를 찾지 못해 가까운 목소리로 대체했습니다.' };
  }

  // 두 역할에 서로 다른 목소리를 주려고 할 때 쓴다.
  function pickDistinct(list, avoidName, preferBest) {
    const fresh = list.filter((voice) => voice.name !== avoidName);
    const pool = fresh.length ? fresh : list;
    return preferBest ? bestOf(pool) : pool[Math.floor(Math.random() * pool.length)] || pool[0];
  }

  function examPair() {
    const setting = wanted();
    const chosen = picked();
    if (chosen.length) {
      const narrator = chosen[0];
      const interviewer = chosen[1] || chosen[0];
      return {
        narrator,
        interviewer,
        meta: {
          manual: true,
          rate: setting.rate,
          pair: {
            differentVoice: narrator.name !== interviewer.name,
            differentGender: Boolean(genderOf(narrator) && genderOf(interviewer) && genderOf(narrator) !== genderOf(interviewer)),
          },
        },
      };
    }
    const accent = accentPool(setting.accent);
    const meta = {
      accent: { requested: setting.accent, used: accent.used, fallback: accent.fallback, reason: accent.reason },
      gender: { requested: setting.gender, used: setting.gender, fallback: false, reason: '' },
      rate: setting.rate,
    };
    if (!accent.pool.length) {
      meta.gender = { requested: setting.gender, used: setting.gender, fallback: true, reason: '기기에 영어 목소리가 없습니다.' };
      return { narrator: null, interviewer: null, meta };
    }

    const gender = genderPool(accent.pool, setting.gender);
    meta.gender = { requested: setting.gender, used: gender.used, fallback: gender.fallback, reason: gender.reason };

    const females = gender.pool.filter((voice) => genderOf(voice) === 'f');
    const males = gender.pool.filter((voice) => genderOf(voice) === 'm');
    let narrator = null;
    let interviewer = null;

    if (setting.gender === 'mix' && females.length && males.length) {
      // 섞기: 나레이터와 면접관을 가능하면 다른 성별로.
      const femaleFirst = examinerFlips();
      narrator = bestOf(femaleFirst ? females : males);
      interviewer = bestOf(femaleFirst ? males : females);
    } else {
      narrator = bestOf(gender.pool);
      interviewer = pickDistinct(gender.pool, narrator ? narrator.name : '', true);
    }

    meta.pair = {
      differentVoice: Boolean(narrator && interviewer && narrator.name !== interviewer.name),
      differentGender: Boolean(narrator && interviewer && genderOf(narrator) !== genderOf(interviewer) && genderOf(narrator) && genderOf(interviewer)),
    };
    return { narrator, interviewer, meta };
  }

  // 모의고사 한 판 안에서는 같은 배정이 유지되도록, 판이 바뀔 때만 뒤집는다.
  let examFlip = null;
  function examinerFlips() {
    if (examFlip === null) examFlip = Math.random() < 0.5;
    return examFlip;
  }

  // 공부: 카드마다 성별 랜덤(설정이 섞기일 때), 고정이면 그 성별만. 직전 목소리는 피한다.
  // 직접 고른 목소리가 있으면 그중에서만 돌아가며 읽는다.
  function study() {
    const setting = wanted();
    const chosen = picked();
    if (chosen.length) {
      const fresh = chosen.filter((voice) => voice.name !== lastStudyName);
      const candidates = fresh.length ? fresh : chosen;
      const next = candidates[Math.floor(Math.random() * candidates.length)] || chosen[0];
      lastStudyName = next.name;
      return next;
    }
    const accent = accentPool(setting.accent);
    if (!accent.pool.length) return null;
    const gender = genderPool(accent.pool, setting.gender);
    const pool = gender.pool;
    const female = pool.filter((voice) => genderOf(voice) === 'f');
    const male = pool.filter((voice) => genderOf(voice) === 'm');

    let bucket = pool;
    if (setting.gender === 'mix' && female.length && male.length) {
      bucket = Math.random() < 0.5 ? female : male;
    } else if (setting.gender === 'female' && female.length) {
      bucket = female;
    } else if (setting.gender === 'male' && male.length) {
      bucket = male;
    }
    bucket = topTier(bucket);

    const fresh = bucket.filter((voice) => voice.name !== lastStudyName);
    const candidates = fresh.length ? fresh : bucket;
    const choice = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
    lastStudyName = choice.name;
    return choice;
  }

  function rate() {
    const value = wanted().rate;
    if (!Number.isFinite(value)) return 1;
    return Math.min(2, Math.max(0.5, value));
  }

  function applyRate(utterance) {
    if (!utterance) return utterance;
    try {
      utterance.rate = rate();
    } catch (error) {
      /* rate 를 못 넣어도 재생은 계속 */
    }
    return utterance;
  }

  function status() {
    const setting = wanted();
    const list = all();
    const accent = accentPool(setting.accent);
    const gender = genderPool(accent.pool, setting.gender);
    const counts = countByAccent(list);
    const available = accent.used === 'mix' ? counts.us + counts.uk : counts[accent.used] || 0;
    const chosen = picked();
    return {
      ready: list.length > 0,
      total: list.length,
      hidden,
      counts,
      manual: {
        requested: setting.picks.length,
        found: chosen.length,
        names: chosen.map((voice) => voice.name),
      },
      settings: { accent: setting.accent, gender: setting.gender, rate: setting.rate },
      accent: {
        requested: setting.accent,
        used: accent.used,
        fallback: accent.fallback,
        reason: accent.reason,
        available,
      },
      gender: {
        requested: setting.gender,
        used: gender.used,
        fallback: gender.fallback,
        reason: gender.reason,
        available: gender.pool.length,
      },
      hint: list.length
        ? ''
        : '목소리 목록이 아직 비어 있습니다. 잠시 뒤 다시 확인해 주세요.',
    };
  }

  function preview(text, options) {
    const say = String(text || PREVIEW_TEXT);
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      return Promise.resolve(false);
    }
    const synth = window.speechSynthesis;
    try { synth.cancel(); } catch (error) { /* noop */ }
    let utter;
    try {
      utter = new window.SpeechSynthesisUtterance(say);
    } catch (error) {
      return Promise.resolve(false);
    }
    const chosen = picked();
    const byId = options && options.voiceId ? all().find((item) => idOf(item) === options.voiceId) : null;
    const voice = byId
      || (chosen.length ? chosen[0] : null)
      || ((options && options.gender && options.gender !== 'mix')
        ? pickByGender(accentPool(wanted().accent).pool, options.gender)
        : study());
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang || (wanted().accent === 'uk' ? 'en-GB' : 'en-US');
    }
    utter.rate = options && Number.isFinite(Number(options.rate)) ? Number(options.rate) : rate();
    return new Promise((resolve) => {
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        resolve(ok);
      };
      utter.onend = () => finish(true);
      utter.onerror = () => finish(false);
      try {
        synth.speak(utter);
      } catch (error) {
        finish(false);
      }
    });
  }

  function pickByGender(list, gender) {
    const pool = genderPool(list, gender).pool;
    return pool.length ? bestOf(pool) : null;
  }

  // 설정이 바뀌면 모의고사 배정도 다음 판부터 새로 고른다.
  try {
    window.addEventListener('app-settings-change', () => { examFlip = null; });
  } catch (error) {
    /* noop */
  }

  window.SpeechVoice = {
    load, all, catalog, hiddenCount, idOf, picked, examPair, study,
    genderOf, qualityOf, rate, applyRate, status, preview, accentOf,
  };
})();
