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
    // cancel()이 불릴 때마다 올립니다. 마이크 권한 창이 떠 있는 동안 취소되면, 나중에 끝난 start()가 스스로 물러나게 합니다.
    cancelCount: 0,
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
        request.onsuccess = () => {
          const db = request.result;
          db.onversionchange = () => {
            db.close();
            dbPromise = null;
          };
          db.onclose = () => {
            dbPromise = null;
          };
          resolve(db);
        };
        request.onerror = () => {
          dbPromise = null;
          reject(request.error || new Error('IndexedDB 오류'));
        };
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
    const temp = new Map();
    for (const clip of clips) {
      const id = String(clip.attemptId || '');
      const map = id === 'mic-test' || id.startsWith('practice-') || id.startsWith('retake-') ? temp : attempts;
      const at = map.get(id) || 0;
      map.set(id, Math.max(at, clip.createdAt || 0));
    }
    const ordered = [...attempts.entries()].sort((a, b) => b[1] - a[1]);
    const orderedTemp = [...temp.entries()].filter(([id]) => id !== 'mic-test').sort((a, b) => b[1] - a[1]);
    const drop = new Set([
      ...ordered.slice(keep).map(([id]) => id),
      ...orderedTemp.slice(1).map(([id]) => id),
      ...(temp.has('mic-test') ? ['mic-test'] : []),
    ]);
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

  // iPad Safari: 마이크를 쓰는 동안만 녹음용 세션으로 두고, 끝나면 재생용으로 되돌린다.
  // 되돌리지 않으면 이후 음성이 통화 모드로 작게(블루투스는 지직거리며) 나온다. WebKit 버그 218012.
  function setSession(type) {
    try {
      if (typeof navigator !== 'undefined' && navigator.audioSession && navigator.audioSession.type !== type) {
        navigator.audioSession.type = type;
      }
    } catch (error) { /* audioSession 미지원 브라우저 */ }
  }

  function releaseStream() {
    if (!state.stream) return;
    for (const track of state.stream.getTracks()) {
      try { track.stop(); } catch (error) { /* noop */ }
    }
    state.stream = null;
    setSession('playback');
  }

  async function openMic() {
    if (!supported()) {
      state.permission = 'unsupported';
      return null;
    }
    if (state.stream && state.stream.getAudioTracks().some((track) => track.readyState === 'live')) return state.stream;
    const cancelAtOpen = state.cancelCount;
    setSession('play-and-record');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
      });
      if (state.cancelCount !== cancelAtOpen) {
        // 권한 창이 떠 있는 동안 화면을 나갔습니다(마이크 점검 화면 등). 늦게 도착한 스트림은 켜 두지 않고 바로 끕니다.
        for (const track of stream.getTracks()) {
          try { track.stop(); } catch (error) { /* noop */ }
        }
        setSession('playback');
        state.lastError = '녹음이 취소되었습니다.';
        return null;
      }
      state.permission = 'granted';
      state.lastError = '';
      startMeter(stream);
      return stream;
    } catch (error) {
      setSession('playback');
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
    const cancelAtStart = state.cancelCount;
    if (state.recorder) await stop();
    const stream = await openMic();
    if (!stream) throw new Error(state.lastError || '마이크를 사용할 수 없습니다.');
    if (state.cancelCount !== cancelAtStart) {
      // 기다리는 사이 시험이 중단됐습니다. 방금 켠 마이크를 되돌려 놓고 녹음하지 않습니다.
      releaseStream();
      stopMeter();
      throw new Error('녹음이 취소되었습니다.');
    }
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
      let settled = false;
      let timer = 0;
      const done = async () => {
        if (settled) return;
        settled = true;
        if (timer) window.clearTimeout(timer);
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
      recorder.onerror = done;
      timer = window.setTimeout(done, 1500);
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
    state.cancelCount += 1;
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
