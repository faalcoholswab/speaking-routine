/* =========================================================
   음성 선택 — 설정에서 고른 목소리 하나로 학습 문장과 모의고사(안내·질문)를 모두 읽는다
   - 설정은 window.AppSettings 의 voice.pick(목소리 id)과 voice.rate 를 읽는다.
     고르지 않았거나 이 기기에 없으면 미국 → 영국 → 호주 순으로 품질이 가장 좋은 목소리를 자동으로 쓴다.
   - 미국·영국·호주 목소리만 쓴다. 장난감·효과음 목소리(Bad News, Bahh…)와 Eloquence(Eddy, Grandpa…)는 뺀다.
   - 'iPad 기본 목소리'(device:en-US 등)는 voice 를 비워 두고 언어만 정해 읽는다. Safari 목록에 없는
     고품질·프리미엄 목소리도 iPad 설정에서 그 언어의 목소리로 골라 두면 그 목소리로 읽는다(기기마다 확인 필요).
     이런 목소리는 utterance.voice 에 넣으면 안 되므로 재생하는 쪽은 항상 use(utterance, voice)를 쓴다.
   - window.SpeechVoice = { load, all, catalog, hiddenCount, idOf, current, auto, examPair, study, use,
                            genderOf, qualityOf, accentOf, rate, applyRate, status, preview }
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
  // 시험 대비용으로 쓰는 지역과 그 순서. 스코틀랜드(Fiona)는 en-GB 계열이지만 regionOf 에서 따로 갈라져 빠진다.
  const REGION_ORDER = ['미국', '영국', '호주'];
  // WebKit은 getVoices()에 기본 설치 목소리만 넣지만, voice 없이 lang 만 주면
  // AVSpeechSynthesisVoice voiceWithLanguage: 로 기기가 정한 그 언어의 목소리를 쓴다.
  const DEVICE_VOICES = [['en-US', '미국'], ['en-GB', '영국'], ['en-AU', '호주']].map(([lang, region]) => Object.freeze({
    name: `iPad 기본 목소리(${region})`,
    lang,
    voiceURI: `device:${lang}`,
    deviceDefault: true,
  }));

  const FALLBACK_SETTINGS = { voice: { rate: 1, pick: '' }, autoScore: true };
  const PREVIEW_TEXT = 'Hello, this is how I will sound when you practise.';
  // 듣기를 눌렀는데 이 시간 안에 읽기 시작하지 않으면 이 기기에서 소리가 나지 않는 목소리로 본다.
  const PREVIEW_START_MS = 3000;

  let cache = [];
  let hidden = 0;
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
    if (!voice || voice.deviceDefault) return '';
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
    const voice = readSettings().voice || {};
    return {
      rate: Number.isFinite(Number(voice.rate)) ? Number(voice.rate) : 1,
      pick: typeof voice.pick === 'string' ? voice.pick : '',
    };
  }

  // 미국·영국·호주 목소리만, 장난감·Eloquence 목소리는 빼고 돌려준다. 뺀 영어 목소리 개수는 hidden 에 남긴다.
  function read() {
    if (!('speechSynthesis' in window)) return [];
    try {
      const english = (window.speechSynthesis.getVoices() || []).filter((voice) => accentOf(voice) !== '');
      const clean = english.filter((voice) => !isNoise(voice) && REGION_ORDER.includes(regionOf(voice)));
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

  function hiddenCount() {
    if (!cache.length) cache = read();
    return hidden;
  }

  // 미국 → 영국 → 호주, 같은 지역 안에서는 품질 → 이름 순.
  function compare(a, b) {
    return (REGION_ORDER.indexOf(regionOf(a)) - REGION_ORDER.indexOf(regionOf(b)))
      || (QUALITY_RANK[qualityOf(b)] - QUALITY_RANK[qualityOf(a)])
      || String(a.name || '').localeCompare(String(b.name || ''));
  }

  function findById(id) {
    if (!id) return null;
    return DEVICE_VOICES.find((voice) => voice.voiceURI === id) || all().find((voice) => idOf(voice) === id) || null;
  }

  // 설정에서 고른 목소리. 이 기기에 없으면 null.
  // iPad 기본 목소리는 목록이 비어 있어도(목소리를 아직 못 받았어도) 쓸 수 있다.
  function chosen() {
    return findById(wanted().pick);
  }

  // 고르지 않았을 때 쓸 목소리: 미국 → 영국 → 호주 중 품질이 가장 좋고, 같은 품질이면 여성 목소리를 먼저.
  function autoVoice() {
    const list = all().slice().sort(compare);
    const best = list[0];
    if (!best) return null;
    const sameTier = list.filter((voice) => regionOf(voice) === regionOf(best) && qualityOf(voice) === qualityOf(best));
    return sameTier.find((voice) => genderOf(voice) === 'f') || best;
  }

  function current() {
    return chosen() || autoVoice();
  }

  // 재생할 문장에 목소리를 입힌다. iPad 기본 목소리는 voice 를 비워 두고 언어만 정한다.
  function use(utterance, voice) {
    if (!utterance || !voice) return utterance;
    if (voice.deviceDefault) {
      utterance.lang = voice.lang;
      return utterance;
    }
    utterance.voice = voice;
    utterance.lang = voice.lang || utterance.lang;
    return utterance;
  }

  // 설정 화면 목록: iPad 기본 목소리 3개 → 미국 → 영국 → 호주.
  function catalog() {
    const pick = wanted().pick;
    const row = (voice, device) => ({
      id: idOf(voice),
      name: device ? 'iPad 기본 목소리' : (String(voice.name || '').replace(/\s*\([^)]*\)\s*$/, '') || String(voice.name || '')),
      lang: voice.lang || '',
      region: regionOf(voice),
      gender: genderOf(voice),
      quality: device ? 'device' : qualityOf(voice),
      selected: idOf(voice) === pick,
      voice,
    });
    return DEVICE_VOICES.map((voice) => row(voice, true))
      .concat(all().slice().sort(compare).map((voice) => row(voice, false)));
  }

  // 모의고사 안내·질문 모두 같은 목소리. meta.manual 은 설정에서 직접 고른 목소리인지.
  function examPair() {
    const voice = current();
    return { narrator: voice, interviewer: voice, meta: { manual: Boolean(chosen()), rate: wanted().rate } };
  }

  function study() {
    return current();
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
    const list = all();
    const pick = wanted().pick;
    const picked = chosen();
    const voice = picked || autoVoice();
    return {
      ready: list.length > 0,
      total: list.length,
      hidden,
      manual: Boolean(picked),
      missing: Boolean(pick && !picked),
      name: voice ? voice.name : '',
      hint: list.length ? '' : '목소리 목록이 아직 비어 있습니다. 잠시 뒤 다시 확인해 주세요.',
    };
  }

  // 미리 듣기. {started, ended} 로 끝난다. started=false 면 이 기기에서 소리가 나지 않은 것이다.
  function preview(text, options) {
    const say = String(text || PREVIEW_TEXT);
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      return Promise.resolve({ started: false, ended: false });
    }
    const synth = window.speechSynthesis;
    try { synth.cancel(); } catch (error) { /* noop */ }
    let utter;
    try {
      utter = new window.SpeechSynthesisUtterance(say);
    } catch (error) {
      return Promise.resolve({ started: false, ended: false });
    }
    const voice = (options && options.voiceId ? findById(options.voiceId) : null) || current();
    utter.lang = 'en-US';
    use(utter, voice);
    utter.rate = options && Number.isFinite(Number(options.rate)) ? Number(options.rate) : rate();
    return new Promise((resolve) => {
      let started = false;
      let done = false;
      const finish = (ended) => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        resolve({ started, ended });
      };
      const timer = window.setTimeout(() => { if (!started) finish(false); }, PREVIEW_START_MS);
      utter.onstart = () => { started = true; };
      utter.onend = () => finish(true);
      utter.onerror = () => finish(false);
      try {
        synth.speak(utter);
      } catch (error) {
        finish(false);
      }
    });
  }

  window.SpeechVoice = {
    load, all, catalog, hiddenCount, idOf, current, auto: autoVoice, examPair, study, use,
    genderOf, qualityOf, accentOf, rate, applyRate, status, preview,
  };
})();
