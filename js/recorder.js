/* =========================================================
   문항 녹음 — MediaRecorder + IndexedDB
   저장 위치: IndexedDB 'speaking-routine-audio' / store 'clips'
   키: `${attemptId}:${no}` · 값: {attemptId, no, blob, mime, seconds, createdAt}
   마이크가 없거나 거부되어도 앱은 계속 동작합니다(모든 함수가 조용히 null/false).

   계약
   - isSupported(): API 존재 여부 (권한 상태와 무관)
   - requestPermission(): Promise<boolean> — 거부/미지원이면 false, 예외 없음
   - start({attemptId, no}): Promise<void> — 이미 녹음 중이면 이전 녹음을 먼저 저장
   - stop(): Promise<{attemptId, no, blob, mime, seconds}|null> — 0.2초 미만이면 null
   - cancel(): 녹음을 버리고 장치를 닫음
   - onLevel(cb): 구독 해제 함수 반환, 값은 0~1 RMS
   - get(attemptId, no) / list(attemptId) / remove(attemptId, no)
   - prune(maxAttempts=10): 최근 N회 응시분만 남김 · clear(): 전체 삭제
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SpeakingRecorder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DB_NAME = 'speaking-routine-audio';
  const DB_VERSION = 1;
  const STORE = 'clips';
  const MAX_SECONDS = 120;

  const state = {
    stream: null,
    recorder: null,
    chunks: [],
    context: null,
    analyser: null,
    meterTimer: 0,
    listeners: new Set(),
    startedAt: 0,
    current: null,
    permission: 'unknown',   // unknown | granted | denied | unsupported
    lastError: '',
  };

  function supported() {
    return typeof navigator !== 'undefined'
      && !!navigator.mediaDevices
      && typeof navigator.mediaDevices.getUserMedia === 'function'
      && typeof window !== 'undefined'
      && typeof window.MediaRecorder === 'function';
  }

  /* ---------------- IndexedDB ---------------- */
  let dbPromise = null;
  function openDb() {
    if (!dbPromise) {
      dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') { reject(new Error('IndexedDB를 사용할 수 없습니다.')); return; }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(STORE)) {
            const store = db.createObjectStore(STORE, { keyPath: 'key' });
            store.createIndex('attempt', 'attemptId', { unique: false });
            store.createIndex('created', 'createdAt', { unique: false });
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('IndexedDB 오류'));
      });
    }
    return dbPromise;
  }

  function tx(mode, run) {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE, mode);
      const store = transaction.objectStore(STORE);
      let result;
      try { result = run(store); } catch (error) { reject(error); return; }
      transaction.oncomplete = () => resolve(result && result.__request ? result.__request.result : result);
      transaction.onerror = () => reject(transaction.error || new Error('IndexedDB 오류'));
      transaction.onabort = () => reject(transaction.error || new Error('IndexedDB 취소'));
    }));
  }

  function keyOf(attemptId, no) {
    return `${attemptId}:${no}`;
  }

  async function putClip(record) {
    await tx('readwrite', (store) => store.put(record));
    return record;
  }

  async function getClip(attemptId, no) {
    if (attemptId === undefined || no === undefined) return null;
    try {
      const record = await tx('readonly', (store) => ({ __request: store.get(keyOf(attemptId, no)) }));
      return record || null;
    } catch (error) {
      return null;
    }
  }

  async function listClips(attemptId) {
    if (attemptId === undefined) return [];
    try {
      return await tx('readonly', (store) => {
        const index = store.index('attempt');
        return new Promise((resolve, reject) => {
          const request = index.getAll(IDBKeyRange.only(String(attemptId)));
          request.onsuccess = () => resolve(request.result || []);
          request.onerror = () => reject(request.error);
        });
      });
    } catch (error) {
      return [];
    }
  }

  async function allClips() {
    try {
      return await tx('readonly', (store) => ({ __request: store.getAll() }));
    } catch (error) {
      return [];
    }
  }

  async function deleteClip(attemptId, no) {
    try {
      await tx('readwrite', (store) => store.delete(keyOf(attemptId, no)));
      return true;
    } catch (error) {
      return false;
    }
  }

  async function prune(maxAttempts) {
    const keep = Math.max(1, Number(maxAttempts) || 10);
    const clips = await allClips();
    const attempts = new Map();
    for (const clip of clips) {
      const at = attempts.get(clip.attemptId) || 0;
      attempts.set(clip.attemptId, Math.max(at, clip.createdAt || 0));
    }
    const ordered = [...attempts.entries()].sort((a, b) => b[1] - a[1]);
    const drop = new Set(ordered.slice(keep).map(([id]) => id));
    if (!drop.size) return 0;
    await tx('readwrite', (store) => {
      for (const clip of clips) if (drop.has(clip.attemptId)) store.delete(clip.key);
    });
    return drop.size;
  }

  async function clear() {
    try {
      await tx('readwrite', (store) => store.clear());
      return true;
    } catch (error) {
      return false;
    }
  }

  /* ---------------- 레벨 미터 ---------------- */
  function emitLevel(value) {
    for (const listener of state.listeners) {
      try { listener(value); } catch (error) { /* noop */ }
    }
  }

  function startMeter(stream) {
    stopMeter();
    state.stream = stream;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    try {
      state.context = new Ctx();
      const source = state.context.createMediaStreamSource(stream);
      state.analyser = state.context.createAnalyser();
      state.analyser.fftSize = 1024;
      state.analyser.smoothingTimeConstant = 0.6;
      source.connect(state.analyser);
      const buffer = new Float32Array(state.analyser.fftSize);
      state.meterTimer = window.setInterval(() => {
        if (!state.analyser) return;
        state.analyser.getFloatTimeDomainData(buffer);
        let sum = 0;
        for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
        emitLevel(Math.min(1, Math.sqrt(sum / buffer.length) * 4));
      }, 80);
    } catch (error) {
      state.lastError = error.message || '';
    }
  }

  function stopMeter() {
    if (state.meterTimer) { window.clearInterval(state.meterTimer); state.meterTimer = 0; }
    state.analyser = null;
    if (state.context) {
      try { state.context.close(); } catch (error) { /* noop */ }
      state.context = null;
    }
  }

  function releaseStream() {
    if (!state.stream) return;
    for (const track of state.stream.getTracks()) {
      try { track.stop(); } catch (error) { /* noop */ }
    }
    state.stream = null;
  }

  async function openMic() {
    if (!supported()) {
      state.permission = 'unsupported';
      return null;
    }
    if (state.stream && state.stream.getAudioTracks().some((track) => track.readyState === 'live')) return state.stream;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      state.permission = 'granted';
      state.lastError = '';
      startMeter(stream);
      return stream;
    } catch (error) {
      state.permission = 'denied';
      state.lastError = error && error.message ? error.message : '마이크를 열 수 없습니다.';
      return null;
    }
  }

  async function requestPermission() {
    const stream = await openMic();
    return Boolean(stream);
  }

  function pickMime() {
    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/ogg;codecs=opus',
    ];
    if (typeof MediaRecorder === 'undefined' || typeof MediaRecorder.isTypeSupported !== 'function') return '';
    for (const type of candidates) if (MediaRecorder.isTypeSupported(type)) return type;
    return '';
  }

  async function start(options) {
    const opts = options || {};
    if (state.recorder) await stop();
    const stream = await openMic();
    if (!stream) throw new Error(state.lastError || '마이크를 사용할 수 없습니다.');
    const attemptId = String(opts.attemptId || 'local');
    const no = Number(opts.no) || 1;
    const mime = pickMime();
    const recorder = mime ? new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: 32000 }) : new MediaRecorder(stream);
    state.recorder = recorder;
    state.chunks = [];
    state.startedAt = Date.now();
    state.current = { attemptId, no, mime: recorder.mimeType || mime || 'audio/webm' };

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size) state.chunks.push(event.data);
    };
    recorder.start(1000);
    await new Promise((resolve) => {
      if (recorder.state === 'recording') { resolve(); return; }
      recorder.onstart = () => resolve();
      window.setTimeout(resolve, 400);
    });
  }

  function finish() {
    return new Promise((resolve) => {
      const recorder = state.recorder;
      if (!recorder) { resolve(null); return; }
      const done = async () => {
        const current = state.current || {};
        const seconds = Math.max(0, (Date.now() - state.startedAt) / 1000);
        const blob = new Blob(state.chunks, { type: current.mime || 'audio/webm' });
        state.recorder = null;
        state.current = null;
        state.chunks = [];
        if (!blob.size || seconds < 0.2) { resolve(null); return; }
        const record = {
          key: keyOf(current.attemptId, current.no),
          attemptId: String(current.attemptId),
          no: Number(current.no),
          blob,
          mime: blob.type || current.mime || 'audio/webm',
          seconds: Number(seconds.toFixed(2)),
          createdAt: Date.now(),
        };
        await putClip(record).catch(() => {});
        resolve(record);
      };
      if (recorder.state === 'inactive') { done(); return; }
      recorder.onstop = done;
      try { recorder.stop(); } catch (error) { done(); }
    });
  }

  async function stop() {
    const result = await finish();
    releaseStream();
    stopMeter();
    return result && result.blob ? result : null;
  }

  async function cancel() {
    const recorder = state.recorder;
    state.chunks = [];
    state.current = null;
    state.recorder = null;
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.onstop = null; recorder.stop(); } catch (error) { /* noop */ }
    }
    releaseStream();
    stopMeter();
  }

  function onLevel(callback) {
    if (typeof callback !== 'function') return () => {};
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
  }

  return {
    isSupported: supported,
    requestPermission,
    start,
    stop,
    cancel,
    onLevel,
    get: getClip,
    list: listClips,
    remove: deleteClip,
    prune,
    clear,
    status() {
      return {
        supported: supported(),
        recording: Boolean(state.recorder && state.recorder.state === 'recording'),
        permission: state.permission,
        error: state.lastError,
        seconds: state.recorder ? (Date.now() - state.startedAt) / 1000 : 0,
      };
    },
    maxSeconds: MAX_SECONDS,
  };
});
