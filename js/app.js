(() => {
  'use strict';

  const STORAGE_KEY = 'speaking-routine-pwa-v1';
  const LEGACY_STORAGE_KEY = 'speaking-routine-v1';
  const MOCK_STORAGE_KEY = 'speaking-routine-mock-v1';
  const MOCK_LOCK_KEY = 'speaking-routine-mock-lock';
  const MOCK_STORE_VERSION = 1;
  const LOCK_KEY = 'speaking-routine-session-lock';
  const LOCK_TTL = 20000;
  const TAB_ID = uid();
  let lockTimer = 0;
  const STATE_VERSION = 1;
  const MAX_COUNT = 50;
  const MAX_HISTORY = 2000;
  const REVIEW_PAGE_SIZE = 8;
  const HISTORY_PAGE_SIZE = 8;
  const ROUTES = ['home', 'study', 'review', 'records'];
  const PART_KEYS = ['part3', 'part5'];
  const SPEEDS = [0.7, 0.85, 1, 1.15];

  const PART_INFO = {
    part3: {
      label: 'Part 3',
      title: '일상 주제',
      desc: '일상적인 질문에 자연스럽게 답하는 문장을 연습해요.',
    },
    part5: {
      label: 'Part 5',
      title: '의견 말하기',
      desc: '의견을 말하고 이유와 예시를 붙이는 문장을 연습해요.',
    },
  };

  const RANGE_INFO = {
    all: { label: '전체 문장', hint: '선택한 파트와 주제의 문장을 모두 보여드려요.' },
    new: { label: '안 본 문장', hint: '아직 한 번도 연습하지 않은 문장만 골라요.' },
    review: { label: '복습 필요', hint: '몰라요·애매해요로 남겨 둔 문장만 골라요.' },
  };

  const MODE_INFO = {
    'en-first': {
      label: '영어 먼저',
      desc: '영어 문장을 보고 뜻을 먼저 떠올려요.',
      icon: 'Aa',
      short: '영어 → 한국어',
    },
    'ko-first': {
      label: '한국어 먼저',
      desc: '한국어 뜻을 보고 영어로 말해 봐요.',
      icon: '가',
      short: '한국어 → 영어',
    },
    both: {
      label: '영어 + 한국어',
      desc: '영어 문장과 뜻을 한 번에 보며 연결해요.',
      icon: 'A가',
      short: '영어 + 한국어',
    },
    listen: {
      label: '듣고 따라 말하기',
      desc: '영어 문장을 듣고 소리 내어 따라 말해요.',
      icon: '▶',
      short: '듣기 → 따라 말하기',
    },
  };

  // listen은 과거 기록 표시용으로만 남기고, 새 선택지는 3개로 줄입니다.
  const MODE_ORDER = ['en-first', 'ko-first', 'both'];

  const STATUS_INFO = {
    unknown: { label: '몰라요', icon: 'refresh' },
    confused: { label: '애매해요', icon: 'help' },
    known: { label: '알아요', icon: 'check' },
  };

  const ROUTE_INFO = {
    home: { label: '홈', title: '홈' },
    study: { label: '학습하기', title: '학습하기' },
    review: { label: '복습하기', title: '복습하기' },
    records: { label: '학습 기록', title: '학습 기록' },
  };

  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

  const ICONS = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-6h6v6"/>',
    files: '<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/>',
    repeat: '<path d="M17 2l4 4-4 4M3 11V9a3 3 0 0 1 3-3h15M7 22l-4-4 4-4M21 13v2a3 3 0 0 1-3 3H3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    message: '<path d="M20 15a4 4 0 0 1-4 4H9l-5 3v-7a4 4 0 0 1-2-3.5V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    leaf: '<path d="M20 4C10 4 4 9 4 16c0 2 1 4 3 4 7 0 12-6 13-16Z"/><path d="M4 20c3-4 7-7 12-9"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    volume: '<path d="M11 5 6 9H3v6h3l5 4Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6a8 8 0 0 1 0 12"/>',
    eye: '<path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    refresh: '<path d="M20 11a8 8 0 1 0 1 4"/><path d="M20 4v7h-7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4 2c-.9.7-1.6 1.2-1.6 2.5"/><path d="M12 17h.01"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
    upload: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14"/>',
    book: '<path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 0-4 0Z"/><path d="M4 4v16"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    alert: '<path d="M12 3 2 21h20Z"/><path d="M12 9v5M12 18h.01"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  };

  function getData() {
    const raw = window.SENTENCES && typeof window.SENTENCES === 'object' ? window.SENTENCES : {};
    const data = {};
    PART_KEYS.forEach((key) => {
      const source = Array.isArray(raw[key]) ? raw[key] : [];
      data[key] = source
        .filter((item) => item && typeof item.id === 'string' && item.id && typeof item.en === 'string' && typeof item.ko === 'string')
        .map((item) => ({
          id: item.id,
          en: item.en,
          ko: item.ko,
          pron: typeof item.pron === 'string' ? item.pron : '',
          topic: typeof item.topic === 'string' && item.topic ? item.topic : '기타',
          keys: Array.isArray(item.keys)
            ? item.keys
                .filter((key) => key && typeof key.en === 'string')
                .map((key) => ({ en: key.en, ko: typeof key.ko === 'string' ? key.ko : '' }))
            : [],
          part: key,
        }));
    });
    return data;
  }

  const DATA = getData();
  const SENTENCES = PART_KEYS.flatMap((key) => DATA[key]);
  const BY_ID = new Map(SENTENCES.map((sentence) => [sentence.id, sentence]));

  const app = document.querySelector('#app');
  const crumb = document.querySelector('#crumb-current');
  const streakText = document.querySelector('#streak-text');
  const fileInput = document.querySelector('#import-file');
  const toastEl = document.querySelector('#toast');

  const speechSupported = 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
  let storageWarned = false;
  let toastTimer = 0;
  let liveTimer = 0;
  let speaking = false;
  let speechToken = 0;

  const liveRegion = document.createElement('div');
  liveRegion.className = 'sr-only';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  document.body.appendChild(liveRegion);

  let state = loadState();

  const study = {
    parts: new Set(state.settings.parts),
    topic: 'all',
    range: 'all',
    count: state.settings.count,
    mode: state.settings.mode,
    autoPlay: Boolean(state.settings.autoPlay),
  };

  let session = null;
  let suspendedSession = null;
  let reviewFilter = 'all';
  let reviewVisible = REVIEW_PAGE_SIZE;
  let historyVisible = HISTORY_PAGE_SIZE;

  function defaultState() {
    return {
      version: STATE_VERSION,
      progress: {},
      queue: {},
      history: [],
      streak: { current: 0, best: 0, lastDate: '' },
      settings: { count: 10, mode: 'en-first', speed: 1, autoPlay: false, parts: PART_KEYS.slice() },
    };
  }

  function loadState() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    } catch (error) {
      storageWarned = true;
      return defaultState();
    }
    if (!raw) return defaultState();
    try {
      const next = normalizeState(JSON.parse(raw));
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch (error) { /* noop */ }
      return next;
    } catch (error) {
      console.warn('저장된 학습 기록을 읽지 못했습니다.', error);
      return defaultState();
    }
  }

  function normalizeState(input) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid state');
    if (input.data && typeof input.data === 'object') input = input.data;
    if (input.ratings || input.sessions) return migrateLegacy(input);

    const next = defaultState();

    if (input.progress && typeof input.progress === 'object') {
      Object.entries(input.progress).forEach(([id, value]) => {
        if (!BY_ID.has(id) || !value || !STATUS_INFO[value.status]) return;
        next.progress[id] = {
          status: value.status,
          attempts: Math.max(1, toInt(value.attempts, 1)),
          lastSeen: validDate(value.lastSeen) ? value.lastSeen : new Date().toISOString(),
        };
      });
    }

    if (input.queue && typeof input.queue === 'object') {
      Object.entries(input.queue).forEach(([id, value]) => {
        if (!BY_ID.has(id) || !value || !['unknown', 'confused'].includes(value.status)) return;
        const addedAt = validDate(value.addedAt) ? value.addedAt : new Date().toISOString();
        next.queue[id] = {
          status: value.status,
          addedAt,
          updatedAt: validDate(value.updatedAt) ? value.updatedAt : addedAt,
        };
      });
    }

    if (Array.isArray(input.history)) {
      next.history = input.history
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null;
          const known = Math.max(0, toInt(entry.known ?? entry.results?.known, 0));
          const confused = Math.max(0, toInt(entry.confused ?? entry.results?.confused, 0));
          const unknown = Math.max(0, toInt(entry.unknown ?? entry.results?.unknown, 0));
          let total = Math.max(0, toInt(entry.total, 0));
          if (!total) total = known + confused + unknown;
          if (!total) return null;
          const parts = Array.isArray(entry.parts)
            ? entry.parts.filter((part) => PART_KEYS.includes(part))
            : [];
          return {
            id: typeof entry.id === 'string' && entry.id ? entry.id : uid(),
            at: validDate(entry.at) ? entry.at : new Date().toISOString(),
            mode: MODE_INFO[entry.mode] ? entry.mode : 'en-first',
            source: entry.source === 'review' ? 'review' : 'study',
            total,
            known,
            confused,
            unknown,
            parts,
            partial: Boolean(entry.partial),
          };
        })
        .filter(Boolean)
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, MAX_HISTORY);
    }

    if (input.streak && typeof input.streak === 'object') {
      next.streak.current = Math.max(0, toInt(input.streak.current, 0));
      next.streak.best = Math.max(next.streak.current, Math.max(0, toInt(input.streak.best, 0)));
      next.streak.lastDate = validDateKey(input.streak.lastDate) ? input.streak.lastDate : '';
    }

    if (input.settings && typeof input.settings === 'object') {
      const parts = Array.isArray(input.settings.parts)
        ? input.settings.parts.filter((part) => PART_KEYS.includes(part))
        : [];
      next.settings.parts = parts.length ? [...new Set(parts)] : PART_KEYS.slice();
      next.settings.count = clamp(toInt(input.settings.count, 10), 1, MAX_COUNT);
      if (input.settings.mode === 'listen') {
        next.settings.mode = 'ko-first';
        next.settings.autoPlay = true;
      } else {
        next.settings.mode = MODE_ORDER.includes(input.settings.mode) ? input.settings.mode : 'en-first';
        next.settings.autoPlay = Boolean(input.settings.autoPlay);
      }
      next.settings.speed = SPEEDS.includes(Number(input.settings.speed)) ? Number(input.settings.speed) : 1;
    }

    return next;
  }

  function migrateLegacy(input) {
    const next = defaultState();
    const ratings = input.ratings && typeof input.ratings === 'object' ? input.ratings : {};
    Object.entries(ratings).forEach(([id, value]) => {
      if (!BY_ID.has(id) || !value || !STATUS_INFO[value.status]) return;
      const at = legacyDate(value.updated);
      next.progress[id] = { status: value.status, attempts: 1, lastSeen: at };
      if (value.status !== 'known') {
        next.queue[id] = { status: value.status, addedAt: at, updatedAt: at };
      }
    });

    const sessions = Array.isArray(input.sessions) ? input.sessions : [];
    next.history = sessions
      .map((entry) => {
        if (!entry || typeof entry !== 'object') return null;
        const known = Math.max(0, toInt(entry.known, 0));
        const confused = Math.max(0, toInt(entry.confused, 0));
        const unknown = Math.max(0, toInt(entry.unknown, 0));
        const total = Math.max(0, toInt(entry.total, 0)) || known + confused + unknown;
        if (!total) return null;
        return {
          id: uid(),
          at: legacyDate(entry.date),
          mode: 'en-first',
          source: 'study',
          total,
          known,
          confused,
          unknown,
          parts: Array.isArray(entry.parts) ? entry.parts.filter((part) => PART_KEYS.includes(part)) : [],
          partial: false,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.at.localeCompare(a.at));

    next.streak.current = Math.max(0, toInt(input.streak, 0));
    next.streak.best = next.streak.current;
    next.streak.lastDate = validDateKey(input.lastStudy) ? input.lastStudy : '';
    next.settings.count = clamp(toInt(input.goal, 10), 1, MAX_COUNT);
    return next;
  }

  function legacyDate(value) {
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return new Date(`${value}T12:00:00`).toISOString();
    }
    return validDate(value) ? value : new Date().toISOString();
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      if (!storageWarned) {
        storageWarned = true;
        toast('브라우저 저장 공간을 사용할 수 없어 기록이 유지되지 않을 수 있어요.');
      }
    }
    updateChrome();
  }

  function readSessionLock() {
    try {
      const raw = localStorage.getItem(LOCK_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function writeSessionLock() {
    try {
      localStorage.setItem(LOCK_KEY, JSON.stringify({ tab: TAB_ID, at: Date.now() }));
    } catch (error) {
      /* 저장소를 쓸 수 없으면 잠금은 건너뜁니다. */
    }
  }

  function heartbeatSessionLock() {
    const lock = readSessionLock();
    if (!lock || lock.tab === TAB_ID) {
      writeSessionLock();
      return;
    }
    if (lockTimer) {
      window.clearInterval(lockTimer);
      lockTimer = 0;
    }
  }

  function acquireSessionLock() {
    const lock = readSessionLock();
    const fresh = lock && lock.tab !== TAB_ID && Date.now() - Number(lock.at || 0) < LOCK_TTL;
    if (fresh) return false;
    writeSessionLock();
    if (!lockTimer) lockTimer = window.setInterval(heartbeatSessionLock, 5000);
    return true;
  }

  function otherSessionLockActive() {
    const lock = readSessionLock();
    if (lock && lock.tab !== TAB_ID && Date.now() - Number(lock.at || 0) < LOCK_TTL) return true;
    // 모의고사 탭이 응시 중이면 그쪽 기록도 보호한다.
    try {
      const raw = localStorage.getItem(MOCK_LOCK_KEY);
      if (!raw) return false;
      const mockLock = JSON.parse(raw);
      return Boolean(mockLock && Date.now() - Number(mockLock.at || 0) < LOCK_TTL);
    } catch (error) {
      return false;
    }
  }

  function releaseSessionLock() {
    if (lockTimer) {
      window.clearInterval(lockTimer);
      lockTimer = 0;
    }
    const lock = readSessionLock();
    if (lock && lock.tab === TAB_ID) {
      try { localStorage.removeItem(LOCK_KEY); } catch (error) { /* noop */ }
    }
  }

  function syncSettingsFromStudy() {
    state.settings.parts = [...study.parts];
    state.settings.count = clamp(study.count, 1, MAX_COUNT);
    state.settings.mode = study.mode;
    state.settings.autoPlay = Boolean(study.autoPlay);
  }

  function resetStudyFromState() {
    study.parts = new Set(state.settings.parts);
    study.topic = 'all';
    study.range = 'all';
    study.count = state.settings.count;
    study.mode = state.settings.mode;
    study.autoPlay = Boolean(state.settings.autoPlay);
  }

  function uid() {
    return `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function toInt(value, fallback) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.round(number) : fallback;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function validDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  }

  function validDateKey(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
  }

  function dateKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function previousDayKey() {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }

  function todayKey() {
    return dateKey(new Date());
  }

  function effectiveStreak() {
    const last = state.streak.lastDate;
    if (!last) return 0;
    if (last === todayKey() || last === previousDayKey()) return Math.max(0, state.streak.current);
    return 0;
  }

  function weekSnapshot() {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - offset);
      const key = dateKey(date);
      const total = state.history.reduce((sum, entry) => {
        const entryDate = new Date(entry.at);
        return sum + (dateKey(entryDate) === key ? entry.total : 0);
      }, 0);
      days.push({ key, total, label: WEEKDAYS[date.getDay()], date: date.getDate() });
    }
    return days;
  }

  function formatHistoryDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '날짜 없음';
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (dateKey(date) === todayKey()) return `오늘 ${time}`;
    if (dateKey(date) === previousDayKey()) return `어제 ${time}`;
    return `${date.getMonth() + 1}월 ${date.getDate()}일 ${time}`;
  }

  function prettyToday() {
    return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  }

  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[character]));
  }

  function guideData(card) {
    if (!window.PRON_GUIDE) return { points: [], flow: null };
    try {
      const built = window.PRON_GUIDE.build(card) || {};
      return { points: built.points || [], flow: built.flow || null };
    } catch (error) {
      return { points: [], flow: null };
    }
  }

  function renderEnglish(text, points) {
    if (!points.length) return esc(text);
    const byIndex = new Map();
    points.forEach((point) => {
      if (Number.isInteger(point.index) && !byIndex.has(point.index)) byIndex.set(point.index, point);
    });
    let tokenIndex = 0;
    return String(text).split(/([A-Za-z]+(?:[-'][A-Za-z]+)*)/).map((chunk) => {
      if (!/^[A-Za-z]/.test(chunk)) return esc(chunk);
      const index = tokenIndex;
      tokenIndex += 1;
      const point = byIndex.get(index);
      if (!point) return esc(chunk);
      return `<mark class="pg-mark pg-${esc(point.tag)}"><span class="pg-word">${esc(chunk)}</span><sup class="pg-num" aria-hidden="true">${point.num}</sup></mark>`;
    }).join('');
  }

  function findKoStart(text, ko, ranges) {
    const free = (start, end) => !ranges.some((range) => start < range.end && end > range.start);
    const isLeft = (idx) => idx === 0 || text[idx - 1] === ' ';
    const isRight = (end) => end === text.length || text[end] === ' ';

    for (let mode = 0; mode < 3; mode += 1) {
      let from = 0;
      while (from <= text.length - ko.length) {
        const start = text.indexOf(ko, from);
        if (start < 0) break;
        const end = start + ko.length;
        const okBoundary = mode === 0
          ? isLeft(start) && isRight(end)
          : mode === 1
            ? isLeft(start) || isRight(end)
            : true;
        if (okBoundary && free(start, end)) return start;
        from = start + 1;
      }
    }
    return -1;
  }

  function renderPron(text, points) {
    if (!text) return esc('발음 가이드가 준비되지 않았어요.');
    const ranges = [];
    points.forEach((point) => {
      if (!point.ko) return;
      const start = findKoStart(text, point.ko, ranges);
      if (start < 0) return;
      ranges.push({ start, end: start + point.ko.length, tag: point.tag, num: point.num });
    });
    ranges.sort((a, b) => a.start - b.start);
    let html = '';
    let cursor = 0;
    ranges.forEach((range) => {
      html += esc(text.slice(cursor, range.start));
      html += `<mark class="pg-ko pg-${esc(range.tag)}"><span class="pg-word">${esc(text.slice(range.start, range.end))}</span><sup class="pg-num" aria-hidden="true">${range.num}</sup></mark>`;
      cursor = range.end;
    });
    return html + esc(text.slice(cursor));
  }

  function renderGuide(points, flow) {
    if (!points.length || !window.PRON_GUIDE) return '';
    const usedTags = new Set(points.map((point) => point.tag));
    const legend = Object.entries(window.PRON_GUIDE.TAGS)
      .filter(([key]) => usedTags.has(key))
      .map(([key, tag]) => `<span class="pg-chip pg-${esc(key)}">${esc(tag.label)}</span>`)
      .join('');
    const flowMarkup = flow && flow.chunked
      ? `<div class="pg-flow"><div class="pg-flow-head"><span class="pg-flow-badge">${esc(flow.partBadge || 'TS 억양·호흡')}</span><span class="pg-flow-label">억양 · 끊어 읽기</span></div><p class="pg-flow-chunk">${esc(flow.chunked)}</p><p class="pg-flow-tip">${esc(flow.tip || '')}</p></div>`
      : '';
    const items = points.map((point) => `<li class="pg-item"><span class="pg-idx">${point.num}</span><span class="pg-text"><b>${esc(point.word)}</b>${point.ipa ? ` <span class="pg-ipa">${esc(point.ipa)}</span>` : ''}<span class="pg-tip">${esc(point.tip)}</span></span></li>`).join('');
    return `<div class="pg-legend" role="group" aria-label="발음 태그 범례">${legend}</div><details class="pg-details"><summary>발음 포인트 · 억양 보기</summary>${flowMarkup}<ol class="pg-list" role="list" aria-label="발음 포인트">${items}</ol></details>`;
  }

  function icon(name) {
    return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.files}</svg>`;
  }

  function hydrateIcons(root = document) {
    root.querySelectorAll('[data-ic]').forEach((element) => {
      element.innerHTML = icon(element.dataset.ic);
      element.removeAttribute('data-ic');
    });
  }

  function routeFromHash() {
    const match = location.hash.match(/^#\/(home|study|review|records)\/?$/);
    return match ? match[1] : 'home';
  }

  function updateChrome() {
    const route = routeFromHash();
    const inSession = session && session.kind === route && !session.done;
    const done = session && session.kind === route && session.done;

    document.querySelectorAll('.tab').forEach((tab) => {
      const active = tab.dataset.route === route;
      tab.classList.toggle('active', active);
      if (active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    });

    let crumbLabel = ROUTE_INFO[route].label;
    if (inSession) crumbLabel = route === 'review' ? '복습 중' : '학습 중';
    else if (done) crumbLabel = '학습 완료';
    if (crumb) crumb.textContent = crumbLabel;

    const streak = effectiveStreak();
    if (streakText) streakText.textContent = streak ? `${streak}일 연속` : '오늘부터 시작';

    let pageTitle = ROUTE_INFO[route].title;
    if (inSession) pageTitle = route === 'review' ? '복습 중' : '학습 중';
    else if (done) pageTitle = '학습 완료';
    document.title = route === 'home' && !inSession && !done
      ? '스피킹 루틴 · 토익스피킹 문장 연습'
      : `${pageTitle} · 스피킹 루틴`;
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function announce(message) {
    liveRegion.textContent = '';
    window.clearTimeout(liveTimer);
    liveTimer = window.setTimeout(() => {
      liveRegion.textContent = message;
    }, 30);
  }

  function focusElement(selector, preventScroll = false) {
    const element = typeof selector === 'string' ? app.querySelector(selector) : selector;
    if (!element) return null;
    if (!element.hasAttribute('tabindex') && !['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
      element.setAttribute('tabindex', '-1');
    }
    try {
      element.focus({ preventScroll });
    } catch (error) {
      element.focus();
    }
    return element;
  }

  function focusHeading() {
    const heading = app.querySelector('h1');
    if (!heading) return;
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    try {
      heading.focus({ preventScroll: true });
    } catch (error) {
      heading.focus();
    }
  }

  function scrollTop() {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }

  function queueEntries() {
    return Object.entries(state.queue)
      .map(([id, value]) => ({ sentence: BY_ID.get(id), ...value }))
      .filter((entry) => entry.sentence)
      .sort((a, b) => a.addedAt.localeCompare(b.addedAt));
  }

  function partTopics() {
    const topics = [];
    PART_KEYS.forEach((key) => {
      if (!study.parts.has(key)) return;
      DATA[key].forEach((sentence) => {
        if (!topics.includes(sentence.topic)) topics.push(sentence.topic);
      });
    });
    return topics;
  }

  function basePool() {
    return SENTENCES.filter((sentence) => study.parts.has(sentence.part)
      && (study.topic === 'all' || sentence.topic === study.topic));
  }

  function eligiblePool() {
    const pool = basePool();
    if (study.range === 'new') return pool.filter((sentence) => !state.progress[sentence.id]);
    if (study.range === 'review') return pool.filter((sentence) => Boolean(state.queue[sentence.id]));
    return pool;
  }

  function rangeCounts() {
    const pool = basePool();
    return {
      all: pool.length,
      new: pool.filter((sentence) => !state.progress[sentence.id]).length,
      review: pool.filter((sentence) => Boolean(state.queue[sentence.id])).length,
    };
  }

  function studySnapshot() {
    const eligible = eligiblePool();
    const actual = Math.min(clamp(study.count || 0, 0, MAX_COUNT), eligible.length);
    const partLabel = PART_KEYS.filter((key) => study.parts.has(key)).map((key) => PART_INFO[key].label).join(' + ');
    return {
      eligible,
      actual,
      partLabel,
      mode: MODE_INFO[study.mode] || MODE_INFO['en-first'],
    };
  }

  function summaryMarkup() {
    const snapshot = studySnapshot();
    if (!snapshot.eligible.length) {
      return '<strong>조건에 맞는 문장이 없어요</strong><span>파트나 학습 범위를 바꿔 주세요.</span>';
    }
    if (!snapshot.actual) {
      return '<strong>문장 수를 입력해 주세요</strong><span>1~50문장 사이로 설정할 수 있어요.</span>';
    }
    const topic = study.topic === 'all' ? '전체 주제' : study.topic;
    const limited = snapshot.actual < study.count ? ' (가능한 문장 모두)' : '';
    return `<strong>${snapshot.actual}문장${limited}</strong><span>${esc(snapshot.partLabel)} · ${esc(topic)} · ${esc(snapshot.mode.label)}</span>`;
  }

  function syncStudySummary() {
    const summary = app.querySelector('#study-summary');
    if (summary) summary.innerHTML = summaryMarkup();
    const start = app.querySelector('[data-action="start-study"]');
    const snapshot = studySnapshot();
    if (start) start.disabled = !snapshot.actual;
    app.querySelectorAll('.count-tile').forEach((tile) => {
      const selected = Number(tile.dataset.count) === Number(study.count);
      tile.classList.toggle('selected', selected);
      tile.setAttribute('aria-pressed', String(selected));
    });
  }

  function badgeMarkup(status) {
    if (!status || !STATUS_INFO[status]) return '<span class="badge">새 문장</span>';
    return `<span class="badge ${status}">${STATUS_INFO[status].label}</span>`;
  }

  function pageHead(eyebrow, title, text) {
    return `<section class="page-head"><div class="eyebrow">${esc(eyebrow)}</div><h1>${title}</h1><p>${esc(text)}</p></section>`;
  }

  function emptyMarkup({ iconName = 'check', title, text, action }) {
    return `<div class="empty"><div class="done-icon">${icon(iconName)}</div><h2>${esc(title)}</h2><p>${esc(text)}</p>${action || ''}</div>`;
  }

  function viewHome() {
    const queueCount = queueEntries().length;
    const week = weekSnapshot().reduce((sum, day) => sum + day.total, 0);
    const totalPracticed = state.history.reduce((sum, entry) => sum + entry.total, 0);
    const totalSessions = state.history.length;
    const totalSentences = SENTENCES.length;

    return `${pageHead('TODAY · ' + prettyToday(), '오늘도 한 문장씩,<br>영어로 말해 볼까요?', '토익스피킹 파트 3·5의 핵심 문장을 내 속도에 맞춰 연습해요.')}
      <div class="summary-bar">
        <span><strong>이번 주 ${week}문장</strong> · ${effectiveStreak() ? `${effectiveStreak()}일 연속` : '오늘부터 시작'}</span>
        <span class="tag">Part 3 · Part 5</span>
      </div>
      <section class="home-cards" aria-label="학습 메뉴">
        <a class="home-card dark" href="#/study">
          <div class="hc-top">
            <div class="hc-icon">${icon('message')}</div>
            <div>
              <div class="eyebrow">DAILY PRACTICE</div>
              <h2>오늘의 문장 연습 <span class="count-chip">${state.settings.count}문장</span></h2>
              <p class="hc-desc">파트와 주제를 고르고, 지금 기억에 남는 문장부터 소리 내어 연습해요.</p>
            </div>
          </div>
          <div class="hc-foot"><span>Part 3 · Part 5 · ${totalSentences}문장</span>${icon('chevronRight')}</div>
        </a>
        <a class="home-card" href="#/review">
          <div class="hc-top">
            <div class="hc-icon">${icon('repeat')}</div>
            <div>
              <div class="eyebrow">SMART REVIEW</div>
              <h2>복습하기 ${queueCount ? `<span class="count-chip">${queueCount}</span>` : ''}</h2>
              <p class="hc-desc">${queueCount ? '몰라요·애매해요로 남긴 문장을 다시 만나며 내 것으로 만들어요.' : '지금은 복습할 문장이 없어요. 새 문장을 연습하면 여기에 쌓여요.'}</p>
            </div>
          </div>
          <div class="hc-foot"><span>복습 큐 ${queueCount}문장</span>${icon('chevronRight')}</div>
        </a>
        <a class="home-card" href="#/records">
          <div class="hc-top">
            <div class="hc-icon">${icon('chart')}</div>
            <div>
              <div class="eyebrow">MY RECORD</div>
              <h2>학습 기록</h2>
              <p class="hc-desc">쌓인 문장과 최근 7일의 흐름을 보며 나만의 루틴을 확인해요.</p>
            </div>
          </div>
          <div class="hc-foot"><span>누적 ${totalPracticed}문장 · ${totalSessions}회</span>${icon('chevronRight')}</div>
        </a>
      </section>`;
  }

  function viewStudy() {
    const snapshot = studySnapshot();
    const counts = rangeCounts();
    const topics = partTopics();
    const selectedParts = PART_KEYS.filter((key) => study.parts.has(key));
    const partTag = selectedParts.length === PART_KEYS.length ? 'Part 3 + 5' : selectedParts.map((key) => PART_INFO[key].label).join(' · ');

    const partCards = PART_KEYS.map((key) => {
      const selected = study.parts.has(key);
      const topicCount = new Set(DATA[key].map((sentence) => sentence.topic)).size;
      return `<button class="part-card ${selected ? 'selected' : ''}" type="button" data-action="toggle-part" data-part="${key}" aria-pressed="${selected}">
        <span class="pc-top"><span class="eyebrow">TOEIC SPEAKING</span><span class="checkbox" aria-hidden="true">${selected ? icon('check') : ''}</span></span>
        <span class="pc-title">${PART_INFO[key].label} · ${PART_INFO[key].title}</span>
        <span class="pc-desc">${PART_INFO[key].desc}</span>
        <span class="pc-count"><strong>${DATA[key].length}</strong>문장 · ${topicCount}개 주제</span>
      </button>`;
    }).join('');

    const countTiles = [5, 10, 15, 20].map((count) => {
      const selected = Number(study.count) === count;
      return `<button class="count-tile ${selected ? 'selected' : ''}" type="button" data-action="set-count" data-count="${count}" aria-pressed="${selected}">
        <span class="num">${count}</span><span class="unit">문장</span>
        <span class="sub">약 ${Math.max(3, Math.round(count * 1.5))}분</span>
      </button>`;
    }).join('');

    const modeCards = MODE_ORDER.map((key) => {
      const mode = MODE_INFO[key];
      const selected = study.mode === key;
      return `<button class="mode-card ${selected ? 'selected' : ''}" type="button" data-action="set-mode" data-mode="${key}" aria-pressed="${selected}">
        <span class="mode-icon ${mode.icon.length > 1 ? 'small' : ''}" aria-hidden="true">${mode.icon}</span>
        <span class="mode-copy"><span class="mode-title">${mode.label}</span><span class="mode-desc">${mode.desc}</span></span>
        <span class="mode-check" aria-hidden="true">${icon('check')}</span>
      </button>`;
    }).join('');

    const topicOptions = ['<option value="all">전체 주제</option>']
      .concat(topics.map((topic) => `<option value="${esc(topic)}" ${study.topic === topic ? 'selected' : ''}>${esc(topic)}</option>`))
      .join('');

    const rangeChips = Object.entries(RANGE_INFO).map(([key, info]) => {
      const selected = study.range === key;
      return `<button class="chip ${selected ? 'active' : ''}" type="button" data-action="set-range" data-range="${key}" aria-pressed="${selected}">${info.label} <b>${counts[key]}</b></button>`;
    }).join('');

    return `<div class="study-page">${pageHead('STUDY', '내게 맞는 문장으로<br>가볍게 시작해요.', '파트, 주제, 범위를 고르면 지금 연습할 문장만 모아 드려요.')}
      <div class="study-grid">
      <section class="panel">
        <div class="panel-head"><h2>1. 파트와 범위</h2><span class="tag">${partTag}</span></div>
        <div class="part-list">${partCards}</div>
        <div class="custom">
          <label for="topic-filter">주제</label>
          <div class="custom-row"><select id="topic-filter">${topicOptions}</select></div>
        </div>
        <div class="custom">
          <label>학습 범위</label>
          <div class="chip-row" role="group" aria-label="학습 범위">${rangeChips}</div>
          <p class="help">${RANGE_INFO[study.range].hint}</p>
        </div>
        <p class="panel-note" aria-live="polite">조건에 맞는 문장 <strong>${snapshot.eligible.length}개</strong>${snapshot.eligible.length ? '를 찾았어요.' : '가 없어요. 범위를 넓혀 보세요.'}</p>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>2. 학습량</h2><span class="tag">최대 ${MAX_COUNT}문장</span></div>
        <div class="count-grid">${countTiles}</div>
        <div class="custom">
          <label for="custom-count">직접 입력</label>
          <div class="custom-row">
            <input id="custom-count" type="number" inputmode="numeric" min="1" max="${MAX_COUNT}" step="1" value="${study.count || ''}">
            <span class="unit">문장</span>
            <span class="hint">1~${MAX_COUNT}문장</span>
          </div>
          <p class="help">입력한 수만큼 무작위로 문장을 골라요. 조건에 맞는 문장이 적으면 그만큼만 연습해요.</p>
        </div>
      </section>
      <section class="panel">
        <div class="panel-head"><h2>3. 표시 방식</h2><span class="tag">${esc(MODE_INFO[study.mode].label)}</span></div>
        <div class="mode-list">${modeCards}</div>
        <label class="toggle-row" for="auto-play">
          <input id="auto-play" type="checkbox" ${study.autoPlay ? 'checked' : ''}>
          <span>카드가 바뀔 때 영어 자동 재생</span>
        </label>
        <p class="panel-note">방식을 고른 뒤 아래에서 연습을 시작하세요. 자동 재생은 한국어 먼저·영어+한국어에서도 쓸 수 있어요.</p>
      </section>
      </div>
      <div class="summary-bar study-start">
        <div class="start-copy" id="study-summary" aria-live="polite">${summaryMarkup()}</div>
        <button class="btn-primary" type="button" data-action="start-study" ${snapshot.actual ? '' : 'disabled'}>연습 시작 ${icon('arrowRight')}</button>
      </div>
    </div>`;
  }

  function viewSession() {
    const s = session;
    const card = s.sentences[s.index];
    if (!card) return '';

    const total = s.sentences.length;
    const progress = Math.round((s.index / total) * 100);
    const status = state.queue[card.id]?.status || state.progress[card.id]?.status || '';
    const isKoFirst = s.mode === 'ko-first' || s.mode === 'listen';
    const isBoth = s.mode === 'both';
    const primary = isKoFirst ? card.ko : card.en;
    const secondary = isKoFirst ? card.en : card.ko;
    const primaryClass = isKoFirst ? 'fc-main ko' : 'fc-main';
    const subLabel = isKoFirst ? '영어 문장' : '뜻';
    const subClass = isKoFirst ? 'sub-text en' : 'sub-text';
    const guide = guideData(card);
    const points = guide.points;
    const primaryHtml = esc(primary);
    const secondaryHtml = esc(secondary);
    const revealLabel = isKoFirst ? '영어 문장 확인하기' : '뜻 확인하기';
    const revealHint = isBoth ? '' : ' · <kbd>R</kbd> 정답';
    const parts = PART_KEYS.filter((key) => s.sentences.some((sentence) => sentence.part === key));
    const partLabel = parts.map((part) => PART_INFO[part].label).join(' + ');
    const sourceLabel = s.source === 'review' ? '복습' : partLabel;

    const speedOptions = SPEEDS.map((speed) => `<option value="${speed}" ${Number(state.settings.speed) === speed ? 'selected' : ''}>${speed}×</option>`).join('');
    const primaryLang = isKoFirst ? '' : ' lang="en"';
    const secondaryLang = isKoFirst ? ' lang="en"' : '';

    return `<h1 class="sr-only">${s.source === 'review' ? '문장 복습' : '문장 학습'}</h1>
      <section class="session-bar" aria-label="학습 세션 정보">
        <div class="chips"><span>${esc(sourceLabel)}</span><span>${esc(MODE_INFO[s.mode].label)}</span><span>${s.index + 1} / ${total}</span></div>
        <button type="button" data-action="finish-session">${icon('x')} 학습 마치기</button>
      </section>
      <div class="session-meta">
        <div class="l">${icon('book')}<span>${esc(card.topic)}</span><span class="dot" aria-hidden="true"></span><span>${esc(sourceLabel)}</span></div>
        <div class="pos"><strong>${s.index + 1}</strong> / ${total}</div>
      </div>
      <div class="progress" role="progressbar" aria-label="학습 진행률" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}"><i style="width:${progress}%"></i></div>
      <div class="session-layout">
        <div class="session-main">
          <section class="flash" aria-label="연습 문장">
            <article class="flash-card" id="flash-card" tabindex="-1" aria-labelledby="sentence-main">
              <div class="fc-body">
                <div class="fc-label">
                  <span class="lbl">${icon('files')} ${PART_INFO[card.part].label} · ${esc(card.topic)}</span>
                  ${badgeMarkup(status)}
                </div>
                <h2 class="${primaryClass}" id="sentence-main"${primaryLang}>${primaryHtml}</h2>
                ${(isBoth || s.revealed)
                  ? `<div class="fc-sub" id="answer" tabindex="-1"><p class="sub-label">${subLabel}</p><p class="${subClass}"${secondaryLang}>${secondaryHtml}</p></div>`
                  : `<button class="reveal-btn" type="button" data-action="reveal" aria-expanded="false">${icon('eye')} ${revealLabel}</button>`}
              </div>
              <div class="fc-tools">
                <div class="tools-row">
                  <button class="play-btn" type="button" data-action="speak" ${speechSupported ? '' : 'disabled title="이 브라우저에서는 음성 재생을 지원하지 않아요"'}>${icon('play')} <span>영어 듣기</span></button>
                  <label class="speed"><span>속도</span><select id="speed-select" aria-label="음성 재생 속도">${speedOptions}</select></label>
                </div>
                <button class="toggle" type="button" data-action="toggle-pron" aria-expanded="${Boolean(s.pronOpen)}">발음 가이드 ${icon('chevronDown')}</button>
                ${s.pronOpen ? `<div class="pron-box" role="note">
                  <div class="pg-line">
                    <p class="pg-line-label">영어 발음 표시</p>
                    <p class="pg-annotated-line" lang="en">${renderEnglish(card.en, points)}</p>
                  </div>
                  <div class="pg-line">
                    <p class="pg-line-label">한글 발음</p>
                    <p class="pg-plain-pron">${esc(card.pron || '발음 가이드가 준비되지 않았어요.')}</p>
                  </div>
                  ${renderGuide(points, guide.flow)}
                </div>` : ''}
              </div>
              <div class="fc-keys">
                <button class="keys-toggle" type="button" data-action="toggle-keys" aria-expanded="${Boolean(s.keysOpen)}">
                  <span class="l">${icon('book')} 핵심 표현 ${card.keys.length}</span>
                  <span class="r">${s.keysOpen ? '접기' : '보기'} ${icon('chevronDown')}</span>
                </button>
                ${s.keysOpen ? `<ul class="key-list">${card.keys.map((key) => `<li><b>${esc(key.en)}</b><span>${esc(key.ko)}</span></li>`).join('') || '<li><span>핵심 표현이 없어요.</span></li>'}</ul>` : ''}
              </div>
            </article>
          </section>
        </div>
        <aside class="session-side" aria-label="문장 평가">
          <div class="rate-panel">
            <div class="rate-head"><span>이 문장, 얼마나 익숙했나요?</span></div>
            <div class="rate-row" role="group" aria-label="문장 이해도 평가">
              ${Object.entries(STATUS_INFO).map(([key, info]) => `<button class="rate-btn ${key}" type="button" data-action="rate" data-rating="${key}" aria-keyshortcuts="${key === 'unknown' ? '1' : key === 'confused' ? '2' : '3'}">${icon(info.icon)} ${info.label}</button>`).join('')}
            </div>
            <p class="kbd-hint"><kbd>1</kbd>·<kbd>2</kbd>·<kbd>3</kbd> 평가${revealHint} · <kbd>P</kbd> 듣기 · <kbd>U</kbd> 취소</p>
            ${s.lastRated ? `<button class="undo-btn" type="button" data-action="undo-rate">${icon('refresh')} 방금 '${esc(STATUS_INFO[s.lastRated.status].label)}'로 기록 · 실행 취소</button>` : ''}
            <p class="rate-note">결과에 따라 복습 큐가 바뀌어요. 잘못 눌렀다면 바로 취소할 수 있어요.</p>
          </div>
        </aside>
      </div>`;
  }

  function viewDone() {
    const s = session;
    const queueCount = queueEntries().length;
    const title = s.partial ? '여기까지 연습했어요' : s.source === 'review' ? '복습을 마쳤어요' : '오늘의 학습을 마쳤어요';
    const copy = s.partial
      ? `${s.rated}문장의 결과를 저장했어요. 다음에 이어서 가볍게 이어가요.`
      : `${s.rated}문장을 끝까지 연습했어요. ${queueCount ? `복습 큐에 ${queueCount}문장이 기다리고 있어요.` : '복습 큐가 비어 있어요. 멋져요!'}`;
    const primary = s.source === 'review' && queueCount
      ? `<button class="btn-primary" type="button" data-action="restart">${icon('repeat')} 복습 더 하기</button>`
      : s.source === 'study' && queueCount
        ? `<a class="btn-primary" href="#/review">${icon('repeat')} 복습하러 가기</a>`
        : `<button class="btn-primary" type="button" data-action="restart">${icon('refresh')} 한 번 더 연습</button>`;

    return `<h1 class="sr-only">학습 완료</h1>
      <section class="panel done-card">
        <div class="done-icon">${icon('check')}</div>
        <h2 tabindex="-1">${title}</h2>
        <p>${copy}</p>
        <div class="result-grid">
          <div class="known"><b>${s.results.known}</b>알아요</div>
          <div class="confused"><b>${s.results.confused}</b>애매해요</div>
          <div class="unknown"><b>${s.results.unknown}</b>몰라요</div>
        </div>
        ${s.lastRated ? `<button class="undo-btn" type="button" data-action="undo-rate">${icon('refresh')} 방금 '${esc(STATUS_INFO[s.lastRated.status].label)}'로 기록 · 실행 취소</button>` : ''}
      </section>
      <div class="btn-col">
        ${primary}
        <button class="btn-secondary" type="button" data-action="go" data-route="records">${icon('chart')} 학습 기록 보기</button>
        <button class="btn-secondary" type="button" data-action="go" data-route="home">${icon('home')} 홈으로</button>
      </div>`;
  }

  function viewReview() {
    const all = queueEntries();
    const filtered = reviewFilter === 'all' ? all : all.filter((entry) => entry.status === reviewFilter);
    const visible = filtered.slice(0, reviewVisible);
    const counts = {
      all: all.length,
      unknown: all.filter((entry) => entry.status === 'unknown').length,
      confused: all.filter((entry) => entry.status === 'confused').length,
    };

    const chips = [
      ['all', '전체', counts.all],
      ['unknown', '몰라요', counts.unknown],
      ['confused', '애매해요', counts.confused],
    ].map(([key, label, count]) => `<button class="chip ${reviewFilter === key ? 'active' : ''}" type="button" data-action="review-filter" data-filter="${key}" aria-pressed="${reviewFilter === key}">${label} <b>${count}</b></button>`).join('');

    let body = '';
    if (!all.length) {
      body = emptyMarkup({
        iconName: 'check',
        title: '복습할 문장이 없어요',
        text: '문장을 연습하면서 몰라요나 애매해요를 선택하면 이곳에 모여요.',
        action: '<a class="btn-primary" href="#/study">새 문장 학습하기</a>',
      });
    } else if (!filtered.length) {
      body = emptyMarkup({
        iconName: 'check',
        title: '이 상태의 문장은 없어요',
        text: '다른 상태를 골라 복습 큐를 확인해 보세요.',
        action: '<button class="btn-secondary" type="button" data-action="review-filter" data-filter="all">전체 보기</button>',
      });
    } else {
      body = `<ul class="review-list" id="review-list">
        ${visible.map((entry) => `<li class="review-item">
          <div class="meta"><span class="mini">${esc(PART_INFO[entry.sentence.part].label)}</span><span class="mini ${entry.status}">${STATUS_INFO[entry.status].label}</span><span class="mini">${esc(entry.sentence.topic)}</span></div>
          <p class="en" lang="en">${esc(entry.sentence.en)}</p>
          <p class="ko">${esc(entry.sentence.ko)}</p>
        </li>`).join('')}
      </ul>
      ${filtered.length > visible.length ? `<button class="btn-secondary more-btn" type="button" data-action="more-review">${filtered.length - visible.length}문장 더 보기</button>` : ''}`;
    }

    return `${pageHead('REVIEW', '다시 보면<br>더 오래 남아요.', '몰라요·애매해요로 남긴 문장을 우선으로 짧게 반복해요.')}
      <div class="summary-bar">
        <span><strong>복습 대기 ${counts.all}문장</strong> · 몰라요 ${counts.unknown} · 애매해요 ${counts.confused}</span>
        <span class="tag">자동으로 모여요</span>
      </div>
      <section class="panel">
        <div class="panel-head"><h2>복습 큐</h2><span class="tag">${filtered.length}문장</span></div>
        <div class="chip-row" role="group" aria-label="복습 상태 필터">${chips}</div>
        ${body}
        ${filtered.length ? `<div class="panel-foot"><span class="hint">오래 전에 남긴 문장부터 시작해요.</span><button class="btn-primary" type="button" data-action="start-review">복습 시작 ${icon('arrowRight')}</button></div>` : ''}
      </section>`;
  }

  function viewRecords() {
    const totalSentences = state.history.reduce((sum, entry) => sum + entry.total, 0);
    const week = weekSnapshot();
    const weekTotal = week.reduce((sum, day) => sum + day.total, 0);
    const maxWeek = Math.max(1, ...week.map((day) => day.total));
    const queueCount = queueEntries().length;
    const distribution = { known: 0, confused: 0, unknown: 0 };
    Object.values(state.progress).forEach((entry) => {
      if (distribution[entry.status] !== undefined) distribution[entry.status] += 1;
    });
    const practiced = Object.keys(state.progress).length;
    const history = state.history;
    const visibleHistory = history.slice(0, historyVisible);

    const weekBars = week.map((day) => `<div class="col ${day.key === todayKey() ? 'today' : ''}">
      <span class="n">${day.total || '-'}</span>
      <div class="bar" style="height:${day.total ? Math.max(8, Math.round((day.total / maxWeek) * 108)) : 4}px"></div>
      <span class="d">${day.label}</span>
    </div>`).join('');

    const stack = practiced
      ? ['known', 'confused', 'unknown'].map((status) => `<i class="${status}" style="width:${(distribution[status] / practiced) * 100}%"></i>`).join('')
      : '';

    const partRows = PART_KEYS.map((key) => {
      const practicedPart = Object.keys(state.progress).filter((id) => BY_ID.get(id)?.part === key).length;
      const total = DATA[key].length || 1;
      const percent = Math.round((practicedPart / total) * 100);
      return `<div class="part-row"><span>${PART_INFO[key].label}</span><div class="track"><i style="width:${percent}%"></i></div><span class="val">${practicedPart} / ${DATA[key].length}</span></div>`;
    }).join('');

    const historyItems = visibleHistory.map((entry) => {
      const resultChips = ['known', 'confused', 'unknown']
        .filter((status) => entry[status] > 0)
        .map((status) => `<span class="mini ${status}">${STATUS_INFO[status].label} ${entry[status]}</span>`)
        .join('');
      const source = entry.source === 'review' ? '복습' : '학습';
      return `<li>
        <div><div class="t">${formatHistoryDate(entry.at)}</div><div class="s">${source} · ${MODE_INFO[entry.mode].label} · ${entry.total}문장${entry.partial ? ' (중간 저장)' : ''}</div></div>
        <div class="res">${resultChips}</div>
      </li>`;
    }).join('');

    return `${pageHead('MY RECORD', '조금씩 쌓인<br>나의 스피킹 루틴', '완벽함보다 반복이 중요해요. 쌓인 기록을 보며 다음 한 걸음을 정해요.')}
      <section class="stat-grid" aria-label="학습 요약">
        <div class="stat dark"><div class="k">${icon('leaf')} 연속 학습</div><div class="v">${effectiveStreak()}<small>일</small></div></div>
        <div class="stat"><div class="k">${icon('files')} 누적 문장</div><div class="v">${totalSentences}<small>문장</small></div></div>
        <div class="stat"><div class="k">${icon('calendar')} 최근 7일</div><div class="v">${weekTotal}<small>문장</small></div></div>
        <div class="stat"><div class="k">${icon('repeat')} 복습 대기</div><div class="v">${queueCount}<small>문장</small></div></div>
      </section>
      <div class="records-grid">
      <section class="panel">
        <h2 class="section-title">최근 7일 <span>학습 문장 수</span></h2>
        <div class="week" role="img" aria-label="최근 7일 학습 문장 수: ${week.map((day) => `${day.label}요일 ${day.total}문장`).join(', ')}">${weekBars}</div>
      </section>
      <section class="panel">
        <h2 class="section-title">문장 이해도 <span>${practiced}문장 기준</span></h2>
        <div class="stack" aria-hidden="true">${stack}</div>
        <div class="legend">
          <div><b>${distribution.known}</b>알아요</div>
          <div><b>${distribution.confused}</b>애매해요</div>
          <div><b>${distribution.unknown}</b>몰라요</div>
        </div>
        ${practiced ? '' : '<p class="panel-note">문장을 연습하고 이해도를 표시하면 이곳에 쌓여요.</p>'}
      </section>
      <section class="panel">
        <h2 class="section-title">파트별 진행 <span>연습한 문장</span></h2>
        ${partRows}
      </section>
      <section class="panel">
        <h2 class="section-title">최근 학습 <span>${history.length}회</span></h2>
        ${history.length
          ? `<ul class="history">${historyItems}</ul>${history.length > visibleHistory.length ? `<button class="btn-secondary more-btn" type="button" data-action="more-history">이전 기록 더 보기</button>` : ''}`
          : '<p class="panel-note">아직 학습 기록이 없어요. 첫 문장을 연습하면 여기에 기록돼요.</p>'}
      </section>
      <section class="panel span-2">
        <h2 class="section-title">데이터 관리 <span>이 브라우저에 저장</span></h2>
        <p class="panel-note">기록은 이 브라우저에만 저장돼요. 백업 파일로 내보내거나 다른 브라우저로 옮길 수 있어요.</p>
        <div class="data-actions">
          <button class="btn-secondary" type="button" data-action="export">${icon('download')} 내보내기</button>
          <button class="btn-secondary" type="button" data-action="import">${icon('upload')} 가져오기</button>
          <button class="btn-secondary btn-danger" type="button" data-action="reset">${icon('trash')} 기록 초기화</button>
        </div>
      </section>
      </div>`;
  }

  function viewDataError() {
    return `${pageHead('DATA', '문장을 불러오지 못했어요.', 'data/part3.js와 data/part5.js가 같은 폴더 구조에 있는지 확인해 주세요.')}
      <section class="panel">
        ${emptyMarkup({ iconName: 'alert', title: '문장 데이터가 비어 있어요', text: '데이터 파일을 불러온 뒤 페이지를 새로고침해 주세요.' })}
      </section>`;
  }

  function render() {
    if (!app) return;
    let html = '';
    if (!SENTENCES.length) html = viewDataError();
    else if (session && session.kind === routeFromHash()) html = session.done ? viewDone() : viewSession();
    else if (routeFromHash() === 'home') html = viewHome();
    else if (routeFromHash() === 'study') html = viewStudy();
    else if (routeFromHash() === 'review') html = viewReview();
    else html = viewRecords();

    app.innerHTML = html;
    document.body.classList.toggle('in-session', Boolean(session && !session.done && session.kind === routeFromHash()));
    hydrateIcons(app);
    updateChrome();
    if (session && !session.done && session.kind === routeFromHash()) {
      syncSpeechButton();
      maybeAutoPlay();
    }
  }

  function makeSession(kind, source, sentences, mode) {
    return {
      id: uid(),
      kind,
      source,
      mode,
      sentences,
      index: 0,
      results: { known: 0, confused: 0, unknown: 0 },
      rated: 0,
      revealed: false,
      pronOpen: false,
      keysOpen: false,
      autoPlay: Boolean(state.settings.autoPlay),
      lastRated: null,
      done: false,
      partial: false,
      saved: false,
      lockedUntil: 0,
      startedAt: new Date().toISOString(),
    };
  }

  function startStudySession() {
    const snapshot = studySnapshot();
    if (!snapshot.eligible.length) {
      toast('조건에 맞는 문장이 없어요. 파트나 범위를 바꿔 주세요.');
      return;
    }
    if (!snapshot.actual) {
      toast('연습할 문장 수를 1문장 이상 입력해 주세요.');
      return;
    }
    if (!acquireSessionLock()) {
      toast('다른 탭에서 학습 중이에요. 그 탭을 마친 뒤 다시 시도해 주세요.');
      return;
    }
    suspendedSession = null;

    stopSpeech();
    const cards = shuffle(snapshot.eligible.slice()).slice(0, snapshot.actual);
    syncSettingsFromStudy();
    persist();
    session = makeSession('study', 'study', cards, study.mode);
    render();
    scrollTop();
    focusElement('.flash-card');
    announce(`${cards.length}문장 학습을 시작합니다.`);
  }

  function startReviewSession(filter) {
    const entries = queueEntries().filter((entry) => filter === 'all' || entry.status === filter);
    if (!entries.length) {
      toast('복습할 문장이 없어요.');
      return false;
    }
    if (!acquireSessionLock()) {
      toast('다른 탭에서 학습 중이에요. 그 탭을 마친 뒤 다시 시도해 주세요.');
      return false;
    }
    suspendedSession = null;
    stopSpeech();
    const cards = entries.map((entry) => entry.sentence);
    session = makeSession('review', 'review', cards, 'ko-first');
    session.filter = filter;
    if (routeFromHash() !== 'review') {
      location.hash = '#/review';
    }
    render();
    scrollTop();
    focusElement('.flash-card');
    announce(`${cards.length}문장 복습을 시작합니다.`);
    return true;
  }

  function shuffle(list) {
    for (let index = list.length - 1; index > 0; index -= 1) {
      const random = Math.floor(Math.random() * (index + 1));
      [list[index], list[random]] = [list[random], list[index]];
    }
    return list;
  }

  function rateCurrent(status) {
    if (!session || session.done || !STATUS_INFO[status]) return;
    if (Date.now() < (session.lockedUntil || 0)) return;
    const card = session.sentences[session.index];
    if (!card) return;

    session.lockedUntil = Date.now() + 650;
    const now = new Date().toISOString();
    const previous = state.progress[card.id];
    const resultsBefore = { ...session.results };
    const ratedBefore = session.rated;
    const indexBefore = session.index;
    const prevProgress = previous ? { ...previous } : null;
    const prevQueue = state.queue[card.id] ? { ...state.queue[card.id] } : null;

    session.lastRated = {
      cardId: card.id,
      status,
      index: indexBefore,
      results: resultsBefore,
      rated: ratedBefore,
      prevProgress,
      prevQueue,
    };

    state.progress[card.id] = {
      status,
      attempts: (previous?.attempts || 0) + 1,
      lastSeen: now,
    };

    if (status === 'known') {
      delete state.queue[card.id];
    } else {
      const existing = state.queue[card.id];
      state.queue[card.id] = {
        status,
        addedAt: existing?.addedAt || now,
        updatedAt: now,
      };
    }

    session.results[status] += 1;
    session.rated += 1;
    session.index += 1;
    session.revealed = false;
    session.pronOpen = false;
    session.keysOpen = false;
    stopSpeech();

    if (session.index >= session.sentences.length) {
      finishSession(false);
      return;
    }

    session.autoPlay = Boolean(state.settings.autoPlay);
    persist();
    render();
    focusElement('.flash-card');
    announce(`${session.index + 1}번째 문장입니다. ${STATUS_INFO[status].label}로 기록했습니다.`);
    maybeAutoPlay();
  }

  function undoRate() {
    if (!session || !session.lastRated) return;
    if (!acquireSessionLock()) {
      toast('다른 탭에서 학습 중이라 되돌릴 수 없어요.');
      return;
    }
    const last = session.lastRated;

    if (session.done) {
      state.history = state.history.filter((entry) => entry.id !== session.id);
      if (session.prevStreak) state.streak = { ...session.prevStreak };
      session.done = false;
      session.saved = false;
      session.partial = false;
    }

    if (last.prevProgress) state.progress[last.cardId] = { ...last.prevProgress };
    else delete state.progress[last.cardId];

    if (last.prevQueue) state.queue[last.cardId] = { ...last.prevQueue };
    else delete state.queue[last.cardId];

    session.results = { ...last.results };
    session.rated = last.rated;
    session.index = last.index;
    session.revealed = false;
    session.pronOpen = false;
    session.keysOpen = false;
    session.autoPlay = false;
    session.lastRated = null;
    session.lockedUntil = 0;

    stopSpeech();
    persist();
    render();
    scrollTop();
    focusElement('.flash-card');
    announce('방금 기록을 취소했습니다.');
  }

  function finishSession(early) {
    if (!session || session.done) return;
    const s = session;
    if (!s.rated) {
      session = null;
      releaseSessionLock();
      render();
      focusHeading();
      toast('기록한 문장이 없어 연습을 종료했어요.');
      return;
    }

    stopSpeech();
    suspendedSession = null;
    s.done = true;
    s.partial = Boolean(early && s.rated < s.sentences.length);
    if (!s.saved) {
      recordSession(s);
      s.saved = true;
    }
    persist();
    releaseSessionLock();
    render();
    scrollTop();
    announce(`${s.rated}문장 연습을 완료했습니다.`);
    const heading = app.querySelector('.done-card h2');
    if (heading) window.requestAnimationFrame(() => heading.focus());
  }

  function recordSession(s) {
    const now = new Date().toISOString();
    const today = todayKey();
    s.prevStreak = { ...state.streak };
    const streak = state.streak;

    if (streak.lastDate === today) {
      streak.current = Math.max(1, streak.current);
    } else if (streak.lastDate === previousDayKey()) {
      streak.current = Math.max(1, streak.current) + 1;
    } else {
      streak.current = 1;
    }
    streak.lastDate = today;
    streak.best = Math.max(streak.best, streak.current);

    state.history.unshift({
      id: s.id,
      at: now,
      mode: s.mode,
      source: s.source,
      total: s.rated,
      known: s.results.known,
      confused: s.results.confused,
      unknown: s.results.unknown,
      parts: PART_KEYS.filter((key) => s.sentences.some((sentence) => sentence.part === key)),
      partial: s.partial,
    });
    state.history = state.history.slice(0, MAX_HISTORY);
  }

  function saveAbandonedSession() {
    if (!session || session.done || session.saved || !session.rated) return false;
    session.partial = true;
    recordSession(session);
    session.saved = true;
    persist();
    return true;
  }

  function finishEarly() {
    if (!session || session.done) return;
    if (!session.rated) {
      session = null;
      releaseSessionLock();
      render();
      focusHeading();
      toast('연습을 종료했어요.');
      return;
    }
    if (!window.confirm('지금까지의 결과를 저장하고 학습을 마칠까요?')) return;
    finishSession(true);
  }

  function restartSession() {
    const source = session?.source;
    const filter = session?.filter || 'all';
    stopSpeech();
    session = null;
    releaseSessionLock();
    if (source === 'review') {
      const filterAvailable = queueEntries().some((entry) => filter === 'all' || entry.status === filter);
      if (!startReviewSession(filterAvailable ? filter : 'all')) {
        render();
        focusHeading();
      }
      return;
    }
    startStudySession();
  }

  function playCurrent() {
    if (!session || session.done) return;
    const card = session.sentences[session.index];
    if (!card) return;

    if (!speechSupported) {
      toast('이 브라우저에서는 음성 재생을 지원하지 않아요.');
      return;
    }
    if (speaking) {
      stopSpeech();
      return;
    }

    const token = ++speechToken;
    speaking = true;
    syncSpeechButton();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(card.en);
    utterance.lang = 'en-US';
    utterance.rate = Number(state.settings.speed) || 1;
    if (!session.voiceFor || session.voiceFor.index !== session.index) {
      session.voiceFor = { index: session.index, voice: window.SpeechVoice ? window.SpeechVoice.study() : null };
    }
    const voice = session.voiceFor.voice;
    if (voice) utterance.voice = voice;

    utterance.onend = () => {
      if (token !== speechToken) return;
      speaking = false;
      syncSpeechButton();
    };
    utterance.onerror = (error) => {
      if (token !== speechToken) return;
      speaking = false;
      syncSpeechButton();
      if (!['interrupted', 'canceled'].includes(error?.error)) {
        toast('음성을 재생하지 못했어요. 브라우저의 음성 설정을 확인해 주세요.');
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      if (token === speechToken) {
        speaking = false;
        syncSpeechButton();
        toast('음성을 재생하지 못했어요. 브라우저의 음성 설정을 확인해 주세요.');
      }
    }
  }

  function stopSpeech() {
    speechToken += 1;
    speaking = false;
    if (speechSupported) {
      try { window.speechSynthesis.cancel(); } catch (error) { /* noop */ }
    }
    syncSpeechButton();
  }

  function maybeAutoPlay() {
    if (!session || session.done || !session.autoPlay || !speechSupported) return;
    session.autoPlay = false;
    playCurrent();
  }

  function syncSpeechButton() {
    const button = app.querySelector('[data-action="speak"]');
    if (!button) return;
    button.classList.toggle('playing', speaking);
    button.innerHTML = `${icon(speaking ? 'pause' : 'play')} <span>${speaking ? '멈추기' : '영어 듣기'}</span>`;
  }

  function sanitizeMockStore(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value) || !Array.isArray(value.attempts)) return null;
    const attempts = value.attempts
      .slice(0, 50)
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => {
        const at = typeof entry.at === 'string' && !Number.isNaN(Date.parse(entry.at))
          ? entry.at
          : new Date().toISOString();
        const ratings = {};
        if (entry.ratings && typeof entry.ratings === 'object' && !Array.isArray(entry.ratings)) {
          Object.entries(entry.ratings).forEach(([key, val]) => {
            if (/^\d{1,2}$/.test(key) && ['good', 'ok', 'weak'].includes(val)) ratings[key] = val;
          });
        }
        return {
          id: typeof entry.id === 'string' && entry.id ? entry.id.slice(0, 40) : uid(),
          examId: typeof entry.examId === 'string' && entry.examId ? entry.examId.slice(0, 40) : 'mock-01',
          at,
          seconds: clamp(toInt(entry.seconds, 0), 0, 86400),
          total: clamp(toInt(entry.total, 0), 0, 99),
          ratings,
        };
      });
    return { attempts };
  }

  function readMockStore() {
    let raw = null;
    try {
      raw = localStorage.getItem(MOCK_STORAGE_KEY);
    } catch (error) {
      return { status: 'error', value: null };
    }
    if (!raw) return { status: 'empty', value: { attempts: [] } };
    try {
      const value = sanitizeMockStore(JSON.parse(raw));
      return value ? { status: 'ok', value } : { status: 'error', value: null };
    } catch (error) {
      return { status: 'error', value: null };
    }
  }

  // null = 삭제. 실패를 호출부가 알 수 있게 결과를 돌려준다.
  function writeMockStore(value) {
    try {
      if (value === null) {
        localStorage.removeItem(MOCK_STORAGE_KEY);
        return { ok: true };
      }
      const next = sanitizeMockStore(value);
      if (!next) return { ok: false, error: 'invalid' };
      if (!next.attempts.length) {
        localStorage.removeItem(MOCK_STORAGE_KEY);
        return { ok: true };
      }
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error) };
    }
  }

  function exportData() {
    const mock = readMockStore();
    const payload = {
      app: 'speaking-routine',
      version: STATE_VERSION,
      exportedAt: new Date().toISOString(),
      data: state,
      mockVersion: MOCK_STORE_VERSION,
    };
    if (mock.status === 'error') {
      payload.mockStatus = 'error';
    } else {
      payload.mockStatus = mock.status;
      payload.mock = mock.value;
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `speaking-routine-${todayKey()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(mock.status === 'error'
      ? '학습 기록을 내보냈어요. 모의고사 기록은 읽지 못해 제외했습니다.'
      : '학습 기록을 내보냈어요.');
  }

  async function importData(file) {
    if (otherSessionLockActive()) {
      toast('다른 탭에서 학습 중이에요. 그 탭을 마친 뒤 다시 시도해 주세요.');
      if (fileInput) fileInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast('파일이 너무 커요. 5MB 이하 백업만 가져올 수 있어요.');
      if (fileInput) fileInput.value = '';
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      const candidate = parsed && typeof parsed === 'object' && parsed.data ? parsed.data : parsed;
      const recognizable = candidate && typeof candidate === 'object'
        && ['progress', 'queue', 'history', 'ratings', 'sessions'].some((key) => key in candidate);
      if (!recognizable) throw new Error('Unrecognized backup');

      // 이 파일이 모의고사 기록을 담고 있는지 먼저 판별한다.
      const hasMock = Object.prototype.hasOwnProperty.call(parsed, 'mock');
      const mockNotice = hasMock ? ' 모의고사 기록도 함께 바뀝니다.' : ' 모의고사 기록은 유지됩니다.';

      const next = normalizeState(parsed);
      if (!window.confirm(`현재 기록을 가져온 파일의 기록으로 바꿀까요?${mockNotice}`)) return;
      state = next;

      let mockFailed = false;
      if (hasMock) {
        const written = writeMockStore(parsed.mock);
        mockFailed = !written.ok;
      }
      session = null;
      suspendedSession = null;
      releaseSessionLock();
      resetStudyFromState();
      reviewFilter = 'all';
      persist();
      render();
      focusHeading();
      toast(mockFailed
        ? '학습 기록을 가져왔어요. 모의고사 기록은 형식이 맞지 않아 기존 기록을 유지했습니다.'
        : '학습 기록을 가져왔어요.');
    } catch (error) {
      toast('올바른 학습 기록 파일이 아니에요.');
    } finally {
      if (fileInput) fileInput.value = '';
    }
  }

  function resetData() {
    if (otherSessionLockActive()) {
      toast('다른 탭에서 학습 중이에요. 그 탭을 마친 뒤 다시 시도해 주세요.');
      return;
    }
    if (!window.confirm('모든 학습 기록과 모의고사 기록을 삭제할까요? 이 작업은 되돌릴 수 없어요.')) return;
    state = defaultState();
    const cleared = writeMockStore(null);
    session = null;
    suspendedSession = null;
    releaseSessionLock();
    resetStudyFromState();
    reviewFilter = 'all';
    persist();
    render();
    focusHeading();
    toast(cleared.ok
      ? '학습 기록을 초기화했어요.'
      : '학습 기록은 초기화했지만 모의고사 기록을 삭제하지 못했어요.');
  }

  function handleAction(action, target) {
    switch (action) {
      case 'toggle-part': {
        const part = target.dataset.part;
        if (!PART_KEYS.includes(part)) return;
        if (study.parts.has(part)) {
          if (study.parts.size === 1) {
            toast('파트는 한 개 이상 선택해 주세요.');
            return;
          }
          study.parts.delete(part);
        } else {
          study.parts.add(part);
        }
        if (study.topic !== 'all' && !partTopics().includes(study.topic)) study.topic = 'all';
        syncSettingsFromStudy();
        persist();
        render();
        focusElement(`[data-action="toggle-part"][data-part="${part}"]`);
        break;
      }
      case 'set-range':
        if (!RANGE_INFO[target.dataset.range]) return;
        study.range = target.dataset.range;
        render();
        focusElement(`[data-action="set-range"][data-range="${study.range}"]`);
        break;
      case 'set-count':
        study.count = clamp(toInt(target.dataset.count, 10), 1, MAX_COUNT);
        syncSettingsFromStudy();
        persist();
        render();
        focusElement(`[data-action="set-count"][data-count="${study.count}"]`);
        break;
      case 'set-mode':
        if (!MODE_INFO[target.dataset.mode]) return;
        study.mode = target.dataset.mode;
        syncSettingsFromStudy();
        persist();
        render();
        focusElement(`[data-action="set-mode"][data-mode="${study.mode}"]`);
        break;
      case 'start-study':
        startStudySession();
        break;
      case 'start-review':
        startReviewSession(reviewFilter);
        break;
      case 'finish-session':
        finishEarly();
        break;
      case 'reveal':
        if (!session || session.done) return;
        session.revealed = true;
        session.autoPlay = false;
        render();
        focusElement('#answer');
        announce('정답을 표시했습니다.');
        break;
      case 'toggle-pron':
        if (!session || session.done) return;
        session.pronOpen = !session.pronOpen;
        render();
        focusElement('[data-action="toggle-pron"]');
        break;
      case 'toggle-keys':
        if (!session || session.done) return;
        session.keysOpen = !session.keysOpen;
        render();
        focusElement('[data-action="toggle-keys"]');
        break;
      case 'speak':
        playCurrent();
        break;
      case 'rate':
        rateCurrent(target.dataset.rating);
        break;
      case 'undo-rate':
        undoRate();
        break;
      case 'review-filter':
        if (!['all', 'unknown', 'confused'].includes(target.dataset.filter)) return;
        reviewFilter = target.dataset.filter;
        reviewVisible = REVIEW_PAGE_SIZE;
        render();
        focusElement(`[data-action="review-filter"][data-filter="${reviewFilter}"]`);
        break;
      case 'more-review':
        reviewVisible += REVIEW_PAGE_SIZE;
        render();
        if (!focusElement('[data-action="more-review"]', true)) focusHeading();
        break;
      case 'more-history':
        historyVisible += HISTORY_PAGE_SIZE;
        render();
        if (!focusElement('[data-action="more-history"]', true)) focusHeading();
        break;
      case 'restart':
        restartSession();
        break;
      case 'go': {
        const route = target.dataset.route;
        if (!ROUTES.includes(route)) return;
        location.hash = `#/${route}`;
        break;
      }
      case 'export':
        exportData();
        break;
      case 'import':
        fileInput?.click();
        break;
      case 'reset':
        resetData();
        break;
      default:
        break;
    }
  }

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('.tab');
    if (!tab) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const route = tab.dataset.route;
    const current = routeFromHash();

    // 모의고사 탭은 별도 페이지다. 세션을 저장한 뒤 이동한다.
    const href = tab.getAttribute('href') || '';
    if (href.startsWith('mock.html')) {
      if (!session || session.done || session.kind !== current) return;
      event.preventDefault();
      if (!window.confirm('지금까지의 결과를 저장하고 모의고사로 이동할까요?')) return;
      saveAbandonedSession();
      stopSpeech();
      session = null;
      suspendedSession = null;
      releaseSessionLock();
      window.location.href = href;
      return;
    }

    if (!ROUTES.includes(route)) return;

    if (route !== current) {
      if (session && !session.done && session.kind === current) {
        if (!window.confirm('지금까지의 결과를 저장하고 이동할까요?')) {
          event.preventDefault();
          return;
        }
        saveAbandonedSession();
      }
      return;
    }

    if (!session || !session.done || session.kind !== route) return;
    event.preventDefault();
    stopSpeech();
    session = null;
    suspendedSession = null;
    releaseSessionLock();
    render();
    scrollTop();
    focusHeading();
  });

  document.addEventListener('click', (event) => {
    const brand = event.target.closest('.brand');
    if (!brand) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const route = routeFromHash();
    if (!session || session.done || session.kind !== route) return;
    if (!window.confirm('지금까지의 결과를 저장하고 이동할까요?')) {
      event.preventDefault();
      return;
    }
    saveAbandonedSession();
  });

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action]');
    if (!target || target.disabled) return;
    event.preventDefault();
    handleAction(target.dataset.action, target);
  });

  document.addEventListener('change', (event) => {
    const target = event.target;
    if (target.id === 'topic-filter') {
      study.topic = target.value;
      if (study.topic !== 'all' && !partTopics().includes(study.topic)) study.topic = 'all';
      render();
      focusElement('#topic-filter');
      return;
    }
    if (target.id === 'auto-play') {
      study.autoPlay = target.checked;
      syncSettingsFromStudy();
      persist();
      return;
    }
    if (target.id === 'speed-select') {
      const speed = Number(target.value);
      state.settings.speed = SPEEDS.includes(speed) ? speed : 1;
      persist();
      return;
    }
    if (target.id === 'custom-count') {
      const value = clamp(toInt(target.value, 0), 0, MAX_COUNT);
      study.count = value;
      target.value = value ? String(value) : '';
      syncStudySummary();
      return;
    }
    if (target === fileInput && fileInput?.files?.[0]) {
      importData(fileInput.files[0]);
    }
  });

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (target.id !== 'custom-count') return;
    const value = clamp(toInt(target.value, 0), 0, MAX_COUNT);
    study.count = value;
    syncStudySummary();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      stopSpeech();
      return;
    }
    if (event.target.id === 'custom-count' && event.key === 'Enter') {
      event.preventDefault();
      startStudySession();
      return;
    }

    const route = routeFromHash();
    const key = (event.key || '').toLowerCase();
    if (!session || session.kind !== route) return;
    if (event.target.closest('input, select, textarea, [contenteditable="true"]')) return;
    if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;

    if (event.code === 'KeyU' || key === 'u') {
      if (!session.lastRated) return;
      event.preventDefault();
      undoRate();
      return;
    }
    if (session.done) return;

    const isActivationKey = event.key === 'Enter' || event.code === 'Space' || event.code === 'NumpadEnter';
    if (isActivationKey && event.target.closest('button, a')) return;

    const keysByCode = {
      Digit1: 'unknown', Numpad1: 'unknown',
      Digit2: 'confused', Numpad2: 'confused',
      Digit3: 'known', Numpad3: 'known',
    };
    const keysByKey = { '1': 'unknown', '2': 'confused', '3': 'known' };
    const status = keysByCode[event.code] || keysByKey[event.key];
    if (status) {
      event.preventDefault();
      rateCurrent(status);
      return;
    }
    if (event.code === 'KeyR' || key === 'r') {
      event.preventDefault();
      if (!session.revealed && session.mode !== 'both') {
        session.revealed = true;
        session.autoPlay = false;
        render();
        focusElement('#answer');
        announce('정답을 표시했습니다.');
      }
      return;
    }
    if (event.code === 'KeyP' || key === 'p') {
      event.preventDefault();
      playCurrent();
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      if (!session.revealed && session.mode !== 'both') {
        session.revealed = true;
        session.autoPlay = false;
        render();
        focusElement('#answer');
        announce('정답을 표시했습니다.');
      }
    }
  });

  window.addEventListener('hashchange', () => {
    const raw = location.hash;
    if (raw && !/^#\/(home|study|review|records)\/?$/.test(raw)) {
      history.replaceState(null, '', '#/home');
    }
    const route = routeFromHash();
    if (session && session.kind !== route) {
      stopSpeech();
      if (!session.done && session.rated && !session.saved) suspendedSession = session;
      session = null;
      releaseSessionLock();
    }
    if (!session && suspendedSession && suspendedSession.kind === route) {
      const resumed = suspendedSession;
      suspendedSession = null;
      if (acquireSessionLock()) session = resumed;
      else toast('다른 탭에서 학습 중이에요. 그 탭을 마친 뒤 다시 시도해 주세요.');
    }
    if (route === 'review') reviewVisible = REVIEW_PAGE_SIZE;
    if (route === 'records') historyVisible = HISTORY_PAGE_SIZE;
    render();
    scrollTop();
    focusHeading();
  });

  window.addEventListener('beforeunload', (event) => {
    if (!session || session.done || !session.rated) return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('pagehide', () => {
    releaseSessionLock();
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (session && !session.done && !acquireSessionLock()) {
      session = null;
      toast('다른 탭에서 학습이 시작되어 이 세션은 종료됐어요.');
    }
    render();
    focusHeading();
  });

  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    if (session && !session.done) return;
    if (!event.newValue) {
      state = defaultState();
      resetStudyFromState();
      reviewFilter = 'all';
      render();
      return;
    }
    try {
      state = normalizeState(JSON.parse(event.newValue));
    } catch (error) {
      return;
    }
    resetStudyFromState();
    render();
  });

  if (/^https?:$/.test(location.protocol)) {
    if (!window.isSecureContext) {
      try {
        if (!sessionStorage.getItem('sw-insecure-warned')) {
          sessionStorage.setItem('sw-insecure-warned', '1');
          window.setTimeout(() => toast('오프라인 저장은 HTTPS에서만 동작해요.'), 800);
        }
      } catch (error) { /* noop */ }
    } else if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  hydrateIcons(document);
  if (window.SpeechVoice) window.SpeechVoice.load();
  if (!/^#\/(home|study|review|records)\/?$/.test(location.hash)) {
    history.replaceState(null, '', '#/home');
  }
  render();
  if (storageWarned) {
    window.setTimeout(() => toast('브라우저 저장 공간을 사용할 수 없어 기록이 유지되지 않을 수 있어요.'), 500);
  }
})();
