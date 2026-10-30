/* =========================================================
   앱 설정 저장소 — 음성(고른 목소리·속도)과 자동 채점
   window.AppSettings 계약 (Muse 설정 화면과 공유):
     KEY, DEFAULTS, load(), get(), set(patch), subscribe(fn),
     reset(), export(), import(value), persisted
   - 저장은 localStorage 하나만 쓴다. 못 쓰면 메모리 상태로 동작하고 persisted=false.
   - 값은 항상 검증·보정한 뒤 보관한다(모르는 값은 기본값).
   ========================================================= */
(() => {
  'use strict';

  const KEY = 'speaking-routine-app-settings-v1';

  const DEFAULTS = {
    voice: { rate: 1, pick: '' },
    autoScore: true,
  };

  const RATE_MIN = 0.5;
  const RATE_MAX = 2;
  const EVENT = 'app-settings-change';

  let storage = null;
  let storageChecked = false;
  let persisted = true;
  let loaded = false;
  let state = copy(DEFAULTS);

  const listeners = new Set();

  function copy(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function detectStorage() {
    if (storageChecked) return storage;
    storageChecked = true;
    try {
      const probe = '__sr_settings_probe__';
      window.localStorage.setItem(probe, '1');
      window.localStorage.removeItem(probe);
      storage = window.localStorage;
    } catch (error) {
      storage = null;
    }
    return storage;
  }

  function fixRate(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULTS.voice.rate;
    const clamped = Math.min(RATE_MAX, Math.max(RATE_MIN, number));
    return Math.round(clamped * 100) / 100;
  }

  // 고른 목소리의 id(voiceURI 또는 device:en-GB 같은 iPad 기본 목소리). 기기에 없으면 재생 때 자동으로 고른다.
  // v39~v41 은 여러 개를 고르는 picks 배열이었다. 그때 값은 첫 번째 목소리로 옮긴다.
  function fixPick(value, legacyPicks) {
    const ok = (id) => typeof id === 'string' && id.length > 0 && id.length <= 200;
    if (ok(value)) return value;
    if (typeof value === 'string') return '';
    if (Array.isArray(legacyPicks)) return legacyPicks.find(ok) || '';
    return '';
  }

  function fixAutoScore(value) {
    return typeof value === 'boolean' ? value : DEFAULTS.autoScore;
  }

  // 어떤 모양이 들어와도 항상 같은 구조로 만든다 (예전 백업·깨진 값 대비).
  function normalize(raw) {
    const base = copy(DEFAULTS);
    if (!raw || typeof raw !== 'object') return base;
    const voice = raw.voice && typeof raw.voice === 'object' ? raw.voice : {};
    base.voice.rate = fixRate(voice.rate);
    base.voice.pick = fixPick(voice.pick, voice.picks);
    base.autoScore = fixAutoScore(raw.autoScore);
    return base;
  }

  function merge(base, patch) {
    const out = copy(base);
    if (!patch || typeof patch !== 'object') return out;
    const voice = patch.voice;
    if (voice && typeof voice === 'object') {
      if ('rate' in voice) out.voice.rate = voice.rate;
      if ('pick' in voice) out.voice.pick = voice.pick;
    }
    if ('autoScore' in patch) out.autoScore = patch.autoScore;
    return out;
  }

  function write() {
    const store = detectStorage();
    if (!store) {
      persisted = false;
      return false;
    }
    try {
      store.setItem(KEY, JSON.stringify(state));
      persisted = true;
      return true;
    } catch (error) {
      persisted = false;
      return false;
    }
  }

  function emit(source) {
    const snapshot = copy(state);
    for (const fn of Array.from(listeners)) {
      try {
        fn(copy(snapshot), { source });
      } catch (error) {
        /* 구독자 오류가 저장을 막지 않게 한다 */
      }
    }
    try {
      window.dispatchEvent(new window.CustomEvent(EVENT, { detail: copy(snapshot) }));
    } catch (error) {
      /* CustomEvent 미지원 환경은 무시 */
    }
  }

  function load() {
    const store = detectStorage();
    if (!store) {
      // 저장소가 없으면 이미 메모리에 있는 값을 그대로 쓴다 (set→load 순서에서 값이 날아가지 않게).
      if (!loaded) state = normalize(null);
      loaded = true;
      persisted = false;
      return copy(state);
    }
    try {
      const raw = store.getItem(KEY);
      state = normalize(raw ? JSON.parse(raw) : null);
      persisted = true;
    } catch (error) {
      state = normalize(null);
      persisted = false;
    }
    loaded = true;
    return copy(state);
  }

  function get() {
    if (!loaded) load();
    return copy(state);
  }

  function set(patch) {
    if (!loaded) load();
    state = normalize(merge(state, patch));
    write();
    emit('set');
    return copy(state);
  }

  function reset() {
    state = normalize(null);
    loaded = true;
    write();
    emit('reset');
    return copy(state);
  }

  function exportSettings() {
    if (!loaded) load();
    return copy(state);
  }

  function pickSettings(value) {
    if (!value || typeof value !== 'object') return null;
    if ('voice' in value || 'autoScore' in value) return value;
    if (value.settings && typeof value.settings === 'object') return value.settings;
    return null;
  }

  // 예전 백업(v35 이하)에는 설정이 아예 없다. 그때는 기본값으로 채우고 오류를 내지 않는다.
  function importSettings(value) {
    const incoming = pickSettings(value);
    state = normalize(merge(normalize(null), incoming || {}));
    loaded = true;
    write();
    emit('import');
    return copy(state);
  }

  function subscribe(fn) {
    if (typeof fn !== 'function') return () => {};
    listeners.add(fn);
    return () => listeners.delete(fn);
  }

  // 다른 탭에서 값을 바꾼 경우에도 화면이 따라가게 한다.
  try {
    window.addEventListener('storage', (event) => {
      if (!event || event.key !== KEY) return;
      try {
        state = normalize(event.newValue ? JSON.parse(event.newValue) : null);
      } catch (error) {
        state = normalize(null);
      }
      loaded = true;
      persisted = true;
      emit('storage');
    });
  } catch (error) {
    /* 리스너를 못 붙여도 저장 기능은 동작한다 */
  }

  window.AppSettings = {
    KEY,
    DEFAULTS: copy(DEFAULTS),
    load,
    get,
    set,
    subscribe,
    reset,
    export: exportSettings,
    import: importSettings,
    get persisted() {
      if (!loaded) load();
      return persisted;
    },
    get available() {
      return Boolean(detectStorage());
    },
  };
})();
