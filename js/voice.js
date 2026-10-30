/* =========================================================
   음성 선택 — iPad 기본 목소리(미국·영국·호주) 중 하나, 또는 자동(문제마다 셋 중 하나)
   - iPad Safari는 내려받은 고품질·프리미엄 목소리를 getVoices()에 넣지 않는다(WebKit은 기본 설치 목소리만 준다).
     대신 voice 를 비우고 lang 만 주면 AVSpeechSynthesisVoice voiceWithLanguage: 로 iPad 설정에서 그 언어에
     고른 목소리(고품질 포함)로 읽는다. 그래서 목소리는 'device:en-US' 같은 언어 자리만 고른다.
     이 목소리는 utterance.voice 에 넣으면 안 되므로 재생하는 쪽은 항상 use(utterance, voice)를 쓴다.
   - 설정은 window.AppSettings 의 voice.pick('' = 자동)과 voice.rate 를 읽는다.
   - 자동: study()·examPair() 를 부를 때마다 셋 중 하나를 고른다(직전 목소리는 피한다).
     학습은 문장마다, 모의고사는 mock.js 가 안내·문제가 바뀔 때마다 부른다.
     어떤 지역이 이 기기에서 소리를 내지 않으면(3초 안에 시작하지 않으면) 이 페이지에서는 다시 고르지 않는다.
   - iPad Safari는 마이크를 한 번 쓰면 페이지 소리를 통화 모드로 두어 소리가 작아지고(블루투스는 지직거림) 돌아오지 않는다
     (WebKit 버그 218012). navigator.audioSession 이 있으면 평소·다시 돌아왔을 때 'playback' 으로 둔다.
     녹음 중에는 recorder.js 가 'play-and-record' 로 바꿨다가 되돌린다.
   - window.SpeechVoice = { load, catalog, idOf, current, examPair, study, use, rate, applyRate, status, preview }
   ========================================================= */
(() => {
  'use strict';

  const DEVICE_VOICES = [['en-US', '미국'], ['en-GB', '영국'], ['en-AU', '호주']].map(([lang, region]) => Object.freeze({
    name: `iPad 기본 목소리(${region})`,
    region,
    lang,
    voiceURI: `device:${lang}`,
    deviceDefault: true,
  }));

  const FALLBACK_SETTINGS = { voice: { rate: 1, pick: '' }, autoScore: true };
  const PREVIEW_TEXT = 'Hello, this is how I will sound when you practise.';
  // 이 시간 안에 읽기 시작하지 않으면 이 기기에서 소리가 나지 않는 목소리로 본다.
  const START_MS = 3000;

  const silent = new Set();
  let lastAuto = '';

  function idOf(voice) {
    return voice ? String(voice.voiceURI || '') : '';
  }

  function findById(id) {
    return DEVICE_VOICES.find((voice) => voice.voiceURI === id) || null;
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

  // 목록을 따로 받을 필요가 없다. 예전 호출부를 위해 남겨 둔다.
  function load() {
    return Promise.resolve(DEVICE_VOICES.slice());
  }

  // 설정에서 고른 목소리. 자동이면 null.
  function chosen() {
    return findById(wanted().pick);
  }

  // 자동: 소리가 나는 지역 중에서 직전과 다른 하나.
  function nextAuto() {
    const working = DEVICE_VOICES.filter((voice) => !silent.has(voice.voiceURI));
    const pool = working.length ? working : DEVICE_VOICES;
    const fresh = pool.filter((voice) => voice.voiceURI !== lastAuto);
    const candidates = fresh.length ? fresh : pool;
    const voice = candidates[Math.floor(Math.random() * candidates.length)] || pool[0];
    lastAuto = voice.voiceURI;
    return voice;
  }

  // 지금 고정된 목소리(자동이면 null). 화면 표시용.
  function current() {
    return chosen();
  }

  // 부를 때마다(자동이면) 새로 고른다. 안내와 질문은 같은 목소리로 읽는다.
  function examPair() {
    const voice = chosen() || nextAuto();
    return { narrator: voice, interviewer: voice, meta: { manual: Boolean(chosen()), rate: wanted().rate } };
  }

  function study() {
    return chosen() || nextAuto();
  }

  // 읽기 시작하는지 지켜본다. 시작하면 소리 나는 목소리, 시간 안에 시작하지 않으면 소리 안 나는 목소리로 적는다.
  function watchStart(utterance, voice) {
    if (!utterance || typeof utterance.addEventListener !== 'function') return;
    let settled = false;
    const timer = window.setTimeout(() => {
      if (!settled) silent.add(voice.voiceURI);
      settled = true;
    }, START_MS);
    const ok = () => {
      settled = true;
      window.clearTimeout(timer);
      silent.delete(voice.voiceURI);
    };
    utterance.addEventListener('start', ok);
    utterance.addEventListener('end', ok);
    utterance.addEventListener('error', (event) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      // 다음 문장으로 넘어가며 끊은 것은 고장으로 보지 않는다.
      const reason = event && event.error;
      if (reason !== 'interrupted' && reason !== 'canceled') silent.add(voice.voiceURI);
    });
  }

  // 재생할 문장에 목소리를 입힌다. iPad 기본 목소리는 voice 를 비워 두고 언어만 정한다.
  function use(utterance, voice) {
    if (!utterance || !voice) return utterance;
    if (voice.deviceDefault) {
      utterance.lang = voice.lang;
      watchStart(utterance, voice);
      return utterance;
    }
    utterance.voice = voice;
    utterance.lang = voice.lang || utterance.lang;
    return utterance;
  }

  // 설정 화면 목록: 미국 → 영국 → 호주.
  function catalog() {
    const pick = wanted().pick;
    return DEVICE_VOICES.map((voice) => ({
      id: voice.voiceURI,
      name: 'iPad 기본 목소리',
      region: voice.region,
      lang: voice.lang,
      selected: voice.voiceURI === pick,
      silent: silent.has(voice.voiceURI),
      voice,
    }));
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
    const picked = chosen();
    return {
      manual: Boolean(picked),
      name: picked ? picked.name : '자동',
      silent: DEVICE_VOICES.filter((voice) => silent.has(voice.voiceURI)).map((voice) => voice.name),
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
    const voice = (options && options.voiceId ? findById(options.voiceId) : null) || study();
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
      const timer = window.setTimeout(() => { if (!started) finish(false); }, START_MS);
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

  // 녹음 중(recorder.js 가 play-and-record 로 둔 동안)에는 건드리지 않는다.
  function preferPlayback() {
    try {
      const session = navigator.audioSession;
      if (session && session.type !== 'playback' && session.type !== 'play-and-record') session.type = 'playback';
    } catch (error) {
      /* audioSession 미지원 브라우저 */
    }
  }

  preferPlayback();
  try {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') preferPlayback(); });
    window.addEventListener('pageshow', preferPlayback);
  } catch (error) {
    /* noop */
  }

  window.SpeechVoice = {
    load, catalog, idOf, current, examPair, study, use, rate, applyRate, status, preview,
  };
})();
