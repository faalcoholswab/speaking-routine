/* =========================================================
   v36 — 설정 화면
   음성 · 기록 관리 · 저장 공간 · 자동 채점
   저장은 window.AppSettings(js/settings.js)가 있으면 그쪽에,
   없으면 같은 키에 직접 저장한다.
   ========================================================= */
(() => {
  'use strict';

  const DEFAULTS = {
    voice: { rate: 1, pick: '' },
    autoScore: true,
  };
  const KEYS = {
    settings: 'speaking-routine-app-settings-v1',
    study: 'speaking-routine-pwa-v1',
    legacyStudy: 'speaking-routine-v1',
    mock: 'speaking-routine-mock-v1',
    notes: 'speaking-routine-notes-v1',
  };
  const AUDIO_DB = 'speaking-routine-audio';
  const STT_CACHE_PREFIX = 'speaking-routine-stt-';
  const VOICE_SAMPLE = 'In this part of the test, you will read aloud the text on the screen.';
  const TABS = [
    ['voice', '음성'],
    ['records', '기록 관리'],
    ['storage', '저장 공간'],
    ['auto', '자동 채점'],
  ];

  let host = null;
  let sheet = null;
  let lastFocus = null;
  let tab = 'voice';
  let pendingReset = '';
  let summaryCache = null;
  let storageCache = null;
  let summaryLoading = false;
  let storageLoading = false;
  let statusLine = '';
  let statusWarn = false;
  let local = null;
  // 목소리 목록을 그린 순서. 버튼의 data-value 는 이 배열의 위치다.
  let voiceRows = [];

  /* ---------------- 설정값 ---------------- */
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(base, patch) {
    const next = clone(base);
    if (!patch || typeof patch !== 'object') return next;
    if (Number.isFinite(Number(patch.rate))) next.voice.rate = clampRate(patch.rate);
    if (patch.voice && typeof patch.voice === 'object') {
      if (Number.isFinite(Number(patch.voice.rate))) next.voice.rate = clampRate(patch.voice.rate);
      if (typeof patch.voice.pick === 'string') next.voice.pick = patch.voice.pick.slice(0, 200);
    }
    if (typeof patch.autoScore === 'boolean') next.autoScore = patch.autoScore;
    if (typeof patch.rate === 'number') next.voice.rate = clampRate(patch.rate);
    return next;
  }

  function clampRate(value) {
    return Math.round(Math.min(1.5, Math.max(0.5, Number(value) || 1)) * 100) / 100;
  }

  function settingsApi() {
    return window.AppSettings && typeof window.AppSettings.get === 'function' ? window.AppSettings : null;
  }

  function current() {
    const api = settingsApi();
    if (api) {
      try { return merge(DEFAULTS, api.get() || {}); } catch (error) { /* noop */ }
    }
    if (!local) {
      local = clone(DEFAULTS);
      try {
        const raw = localStorage.getItem(KEYS.settings);
        if (raw) local = merge(local, JSON.parse(raw));
      } catch (error) { /* noop */ }
    }
    return local;
  }

  function save(patch) {
    const api = settingsApi();
    if (api) {
      try { api.set(patch); return; } catch (error) { /* fall through */ }
    }
    local = merge(current(), patch);
    try { localStorage.setItem(KEYS.settings, JSON.stringify(local)); } catch (error) { /* noop */ }
  }

  function autoScoreOn() {
    return current().autoScore !== false;
  }

  /* ---------------- 음성 ---------------- */
  function voiceApi() {
    return window.SpeechVoice && typeof window.SpeechVoice.catalog === 'function' ? window.SpeechVoice : null;
  }

  function voiceStatus() {
    const api = voiceApi();
    if (!api) return { tone: 'warn', text: '이 브라우저에서는 음성 재생을 지원하지 않아요.' };
    const info = api.status();
    const silentNote = info.silent.length ? ` ${info.silent.join(', ')}는 이 기기에서 소리가 나지 않아 자동에서 빼고 있어요.` : '';
    if (info.manual) return { tone: 'ok', text: `지금 쓰는 목소리: ${info.name}` };
    return { tone: info.silent.length ? 'warn' : 'ok', text: `지금 쓰는 목소리: 자동 (문제마다 미국·영국·호주 중 하나)${silentNote}` };
  }

  function pickVoice(index) {
    const row = voiceRows[Number(index)];
    if (!row) return;
    save({ voice: { pick: row.id } });
    statusLine = '';
    statusWarn = false;
    paint();
  }

  async function hearVoice(index) {
    const row = voiceRows[Number(index)];
    const api = voiceApi();
    if (!row || !api || row.auto) return;
    const result = await api.preview(VOICE_SAMPLE, { voiceId: row.id, rate: current().voice.rate });
    if (!result.started && host) {
      statusLine = `iPad 기본 목소리(${row.region}): 이 기기에서 소리가 나지 않았어요. 다른 목소리를 골라 주세요.`;
      statusWarn = true;
      paint();
    }
  }

  /* ---------------- 기록 ---------------- */
  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  async function countRecordings() {
    if (!('indexedDB' in window)) return 0;
    return new Promise((resolve) => {
      let request;
      try {
        request = window.indexedDB.open(AUDIO_DB);
      } catch (error) {
        resolve(0);
        return;
      }
      request.onerror = () => resolve(0);
      request.onblocked = () => resolve(0);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('clips')) {
          db.close();
          resolve(0);
          return;
        }
        try {
          const tx = db.transaction('clips', 'readonly');
          const count = tx.objectStore('clips').count();
          count.onsuccess = () => {
            const value = Number(count.result) || 0;
            db.close();
            resolve(value);
          };
          count.onerror = () => { db.close(); resolve(0); };
        } catch (error) {
          db.close();
          resolve(0);
        }
      };
    });
  }

  async function summary() {
    if (window.AppData && typeof window.AppData.summary === 'function') {
      try { return await window.AppData.summary(); } catch (error) { /* fallback */ }
    }
    const study = readJSON(KEYS.study) || readJSON(KEYS.legacyStudy) || {};
    const history = Array.isArray(study.history) ? study.history : [];
    const mock = readJSON(KEYS.mock) || {};
    const notes = readJSON(KEYS.notes) || {};
    const noteList = Array.isArray(notes) ? notes : (Array.isArray(notes.items) ? notes.items : []);
    return {
      study: {
        sessions: history.length,
        sentences: history.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0),
        practiced: study.progress && typeof study.progress === 'object' ? Object.keys(study.progress).length : 0,
      },
      mock: { attempts: Array.isArray(mock.attempts) ? mock.attempts.length : 0 },
      notes: { count: noteList.length },
      recordings: { count: await countRecordings() },
    };
  }

  function deleteAudioDb() {
    if (!('indexedDB' in window)) return Promise.resolve(true);
    return new Promise((resolve) => {
      let request;
      try { request = window.indexedDB.deleteDatabase(AUDIO_DB); } catch (error) { resolve(false); return; }
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
      request.onblocked = () => resolve(false);
    });
  }

  async function resetKind(kind) {
    if (window.AppData && typeof window.AppData.reset === 'function') {
      return window.AppData.reset(kind);
    }
    const removal = [];
    if (kind === 'all' || kind === 'study') removal.push(KEYS.study, KEYS.legacyStudy);
    if (kind === 'all' || kind === 'mock') removal.push(KEYS.mock);
    if (kind === 'all' || kind === 'notes') removal.push(KEYS.notes);
    removal.forEach((key) => { try { localStorage.removeItem(key); } catch (error) { /* noop */ } });
    if (kind === 'all' || kind === 'recordings') await deleteAudioDb();
    return { ok: true, reload: true };
  }

  function exportBackup() {
    if (window.AppData && typeof window.AppData.export === 'function') {
      window.AppData.export();
      statusLine = '백업 파일을 내려받았어요.';
      paint();
      return;
    }
    const payload = {
      app: 'speaking-routine',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: readJSON(KEYS.study) || readJSON(KEYS.legacyStudy),
      mock: readJSON(KEYS.mock) || undefined,
      notes: readJSON(KEYS.notes) || undefined,
      appSettings: settingsApi() ? settingsApi().export() : current(),
    };
    if (!payload.mock) delete payload.mock;
    if (!payload.notes) delete payload.notes;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `speaking-routine-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    statusLine = '백업 파일을 내려받았어요.';
    paint();
  }

  async function importBackup(file) {
    if (!file) return;
    if (window.AppData && typeof window.AppData.import === 'function') {
      await window.AppData.import(file);
      summaryCache = null;
      statusLine = '백업을 가져왔어요.';
      paint();
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      statusLine = '파일이 너무 커요. 5MB 이하 백업만 가져올 수 있어요.';
      paint();
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      const data = parsed && parsed.data ? parsed.data : parsed;
      if (!data || typeof data !== 'object') throw new Error('invalid');
      if (!window.confirm('현재 기록을 이 파일의 기록으로 바꿀까요?')) return;
      try { localStorage.setItem(KEYS.study, JSON.stringify(data)); } catch (error) { /* noop */ }
      if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'mock')) {
        try {
          if (parsed.mock) localStorage.setItem(KEYS.mock, JSON.stringify(parsed.mock));
          else localStorage.removeItem(KEYS.mock);
        } catch (error) { /* noop */ }
      }
      if (parsed && Object.prototype.hasOwnProperty.call(parsed, 'notes')) {
        try {
          if (parsed.notes) localStorage.setItem(KEYS.notes, JSON.stringify(parsed.notes));
          else localStorage.removeItem(KEYS.notes);
        } catch (error) { /* noop */ }
      }
      if (parsed && parsed.appSettings && settingsApi() && typeof settingsApi().import === 'function') {
        try { settingsApi().import(parsed.appSettings); } catch (error) { /* noop */ }
      }
      window.location.reload();
    } catch (error) {
      statusLine = '올바른 백업 파일이 아니에요.';
      paint();
    }
  }

  /* ---------------- 저장 공간 ---------------- */
  async function collectStorage() {
    const out = { usage: null, quota: null, persisted: null, caches: [], recordings: 0 };
    if (navigator.storage && typeof navigator.storage.estimate === 'function') {
      try {
        const estimate = await navigator.storage.estimate();
        out.usage = Number(estimate.usage) || 0;
        out.quota = Number(estimate.quota) || 0;
      } catch (error) { /* noop */ }
    }
    if (navigator.storage && typeof navigator.storage.persisted === 'function') {
      try { out.persisted = await navigator.storage.persisted(); } catch (error) { /* noop */ }
    }
    if (window.caches && typeof caches.keys === 'function') {
      try {
        for (const key of await caches.keys()) {
          if (!key.startsWith(STT_CACHE_PREFIX)) continue;
          let bytes = 0;
          try {
            const cache = await caches.open(key);
            for (const request of await cache.keys()) {
              const response = await cache.match(request);
              if (!response) continue;
              try {
                const blob = await response.blob();
                bytes += blob.size || 0;
              } catch (error) { /* noop */ }
            }
          } catch (error) { /* noop */ }
          out.caches.push({ key, bytes });
        }
      } catch (error) { /* noop */ }
    }
    out.recordings = (await summary()).recordings.count;
    return out;
  }

  function bytesText(value) {
    const bytes = Number(value) || 0;
    if (!bytes) return '0MB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async function deleteModels() {
    if (!window.caches) return 0;
    let removed = 0;
    try {
      for (const key of await caches.keys()) {
        if (!key.startsWith(STT_CACHE_PREFIX)) continue;
        if (await caches.delete(key)) removed += 1;
      }
    } catch (error) { /* noop */ }
    storageCache = null;
    statusLine = removed
      ? '음성 인식 모델을 지웠어요. 다음 채점 때 다시 내려받아요.'
      : '지울 음성 인식 모델이 없어요.';
    paint();
    loadStorage();
    return removed;
  }

  async function requestPersist() {
    if (!navigator.storage || typeof navigator.storage.persist !== 'function') {
      statusLine = '이 브라우저는 저장 공간 유지를 지원하지 않아요.';
      paint();
      return;
    }
    let granted = false;
    try { granted = await navigator.storage.persist(); } catch (error) { granted = false; }
    statusLine = granted
      ? '이 사이트의 저장 공간을 유지하도록 허용됐어요.'
      : '브라우저가 저장 공간 유지를 허용하지 않았어요. 공간이 부족하면 기록이 지워질 수 있어요.';
    storageCache = null;
    paint();
    loadStorage();
  }

  async function loadStorage() {
    if (storageLoading) return;
    storageLoading = true;
    storageCache = null;
    try {
      const info = await collectStorage();
      if (host) storageCache = info;
      if (host && tab === 'storage') paint();
    } finally {
      storageLoading = false;
    }
  }

  /* ---------------- 화면 ---------------- */
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (ch) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
    ));
  }

  // 목소리 하나를 고른다: 자동(문제마다 셋 중 하나) 또는 iPad 기본 목소리(미국·영국·호주).
  function sectionVoice() {
    const pref = current().voice;
    const status = voiceStatus();
    const api = voiceApi();
    const rows = api ? api.catalog() : [];
    voiceRows = [{ auto: true, id: '', name: '자동', selected: !rows.some((row) => row.selected) }].concat(rows);

    const items = voiceRows.map((row, index) => {
      const meta = row.auto
        ? '문제마다(학습은 문장마다) 미국·영국·호주 목소리 중 하나로 바꿔 읽어요'
        : `${row.region} · iPad 설정에서 고른 목소리로 읽어요${row.silent ? ' · 이 기기에서 소리가 나지 않았어요' : ''}`;
      const hear = row.auto
        ? ''
        : `<button class="st-btn ghost small" type="button" data-si="hear-voice" data-value="${index}" aria-label="${esc(row.region)} 목소리 듣기">듣기</button>`;
      return `<li>
        <button class="st-check" type="button" role="radio" aria-checked="${row.selected ? 'true' : 'false'}" aria-label="${esc(row.auto ? '자동' : `${row.name} ${row.region}`)}" data-si="pick-voice" data-value="${index}"></button>
        <div class="st-list-main">
          <p class="st-list-title">${esc(row.auto ? '자동' : `${row.name}(${row.region})`)}</p>
          <p class="st-list-meta">${esc(meta)}</p>
        </div>
        ${hear}
      </li>`;
    }).join('');

    return `<section class="st-card">
      <h3 class="st-h3">목소리</h3>
      <p class="st-desc">학습 문장과 모의고사 안내·질문을 읽을 목소리예요. 미국·영국·호주 목소리는 iPad 설정의 음성 목록에서 지역마다 고른 목소리로 바뀌어요.</p>
      <p class="st-note ${status.tone}">${esc(status.text)}</p>
      <ul class="st-list st-voices" role="radiogroup" aria-label="목소리">${items}</ul>
    </section>
    <section class="st-card">
      <div class="st-row">
        <div class="st-row-main">
          <p class="st-row-title">기본 속도</p>
          <p class="st-row-desc">학습 문장과 모의고사 안내 음성의 속도예요. 학습 화면에서 1×가 아닌 속도를 골랐다면 그 값이 우선해요.</p>
        </div>
        <div class="st-slider">
          <input type="range" min="0.5" max="1.5" step="0.05" value="${pref.rate}" data-si-input="rate" aria-label="기본 속도">
          <output data-si-rate>${pref.rate.toFixed(2)}×</output>
        </div>
      </div>
    </section>`;
  }


  function sectionRecords() {
    const data = summaryCache;
    if (!data) {
      loadSummary();
      return `<section class="st-card"><h3 class="st-h3">기록 관리</h3><p class="st-desc">기록 개수를 세는 중이에요…</p></section>`;
    }
    const confirm = (kind, label, count) => {
      const particle = /(회|개|부)$/.test(count) ? '를' : '을';
      return pendingReset === kind
      ? `<div class="st-confirm">
           <p>${esc(label)} ${count}${particle} 지울까요? 되돌릴 수 없어요.</p>
           <div class="st-actions">
             <button class="st-btn ghost small" type="button" data-si="backup">먼저 백업</button>
             <button class="st-btn danger small" type="button" data-si="reset-confirm" data-kind="${kind}">지우기</button>
             <button class="st-btn ghost small" type="button" data-si="reset-cancel">취소</button>
           </div>
         </div>`
      : '';
    };
    return `<section class="st-card">
      <h3 class="st-h3">백업</h3>
      <p class="st-desc">기록은 이 브라우저에만 저장돼요. 지우기 전에 백업 파일로 내려받아 두세요.</p>
      <div class="st-actions">
        <button class="st-btn" type="button" data-si="backup">백업 내려받기</button>
        <button class="st-btn ghost" type="button" data-si="import">백업 가져오기</button>
      </div>
    </section>
    <section class="st-card">
      <h3 class="st-h3">지우기</h3>
      <p class="st-desc">항목을 골라서 지울 수 있어요. 지운 기록은 되돌릴 수 없어요.</p>
      <ul class="st-list">
        ${resetRow('study', '학습 기록', `${data.study.sessions}회 · ${data.study.sentences}문장 · 이해도 표시 ${data.study.practiced}문장`, confirm('study', '학습 기록', `${data.study.sessions}회`))}
        ${resetRow('mock', '모의고사 기록', `${data.mock.attempts}회 응시`, confirm('mock', '모의고사 기록', `${data.mock.attempts}회`))}
        ${resetRow('notes', '마이노트', `${data.notes.count}문항`, confirm('notes', '마이노트', `${data.notes.count}문항`))}
        ${resetRow('recordings', '녹음', `${data.recordings.count}개`, confirm('recordings', '녹음', `${data.recordings.count}개`))}
      </ul>
    </section>
    <section class="st-card">
      <h3 class="st-h3">전체 초기화</h3>
      <p class="st-desc">학습·모의고사 기록, 마이노트, 녹음을 모두 지워요.</p>
      <div class="st-actions">
        <button class="st-btn danger" type="button" data-si="reset" data-kind="all">전체 지우기</button>
      </div>
      ${confirm('all', '학습·모의고사·마이노트·녹음', '전부')}
    </section>`;
  }

  function resetRow(kind, title, meta, confirmMarkup) {
    return `<li>
      <div class="st-list-main">
        <p class="st-list-title">${esc(title)}</p>
        <p class="st-list-meta">${esc(meta)}</p>
        ${confirmMarkup}
      </div>
      <span class="st-list-val"></span>
      <button class="st-btn ghost small" type="button" data-si="reset" data-kind="${kind}">지우기</button>
    </li>`;
  }

  function sectionStorage() {
    if (!storageCache) {
      loadStorage();
      return `<section class="st-card"><h3 class="st-h3">저장 공간</h3><p class="st-desc">사용량을 확인하는 중이에요…</p></section>`;
    }
    const info = storageCache;
    const cached = info.caches.reduce((sum, item) => sum + item.bytes, 0);
    const hasModels = info.caches.length > 0;
    const persisted = info.persisted === null ? '확인할 수 없음' : (info.persisted ? '유지 허용됨' : '유지 요청 안 함');
    return `<section class="st-card">
      <h3 class="st-h3">브라우저 저장 공간</h3>
      <dl class="st-kv">
        <dt>전체 사용량</dt><dd>${info.usage === null ? '확인할 수 없음' : bytesText(info.usage)}</dd>
        <dt>사용 가능 한도</dt><dd>${info.quota === null ? '확인할 수 없음' : bytesText(info.quota)}</dd>
        <dt>녹음</dt><dd>${info.recordings}개 (IndexedDB)</dd>
        <dt>저장 유지</dt><dd>${persisted}</dd>
      </dl>
      <div class="st-actions">
        <button class="st-btn ghost" type="button" data-si="persist">저장 공간 유지 요청</button>
      </div>
    </section>
    <section class="st-card">
      <h3 class="st-h3">음성 인식 모델</h3>
      <p class="st-desc">처음 채점할 때 기기 안으로 내려받아요. 지우면 다음 채점 때 다시 받아요.</p>
      <ul class="st-list">
        <li>
          <div class="st-list-main">
            <p class="st-list-title">${hasModels ? '저장된 모델' : '저장된 모델 없음'}</p>
            <p class="st-list-meta">${hasModels ? info.caches.map((item) => `${esc(item.key)} · ${bytesText(item.bytes)}`).join('<br>') : '아직 음성 인식 모델을 받지 않았어요.'}</p>
          </div>
          <span class="st-list-val">${hasModels ? bytesText(cached) : '—'}</span>
          <button class="st-btn danger small" type="button" data-si="delete-models"${hasModels ? '' : ' disabled'}>모델 지우기</button>
        </li>
      </ul>
    </section>`;
  }

  function sectionAuto() {
    const on = autoScoreOn();
    return `<section class="st-card">
      <h3 class="st-h3">자동 채점</h3>
      <div class="st-row">
        <div class="st-row-main">
          <p class="st-row-title">녹음 뒤 기기 안에서 채점</p>
          <p class="st-row-desc">끄면 음성 인식 모델을 받지도 불러오지도 않아요. 녹음, 다시 듣기, 말한 시간과 쉼, 자기평가, 마이노트는 그대로 써요.</p>
        </div>
        <div class="st-row-side">
          <button class="st-switch" type="button" role="switch" aria-checked="${on ? 'true' : 'false'}" aria-label="자동 채점" data-si="toggle-auto"></button>
        </div>
      </div>
      <p class="st-note">${on ? '지금은 자동 채점이 켜져 있어요.' : '지금은 자동 채점이 꺼져 있어요. 이미 저장된 점수는 그대로 남아 있어요.'}</p>
    </section>`;
  }

  function bodyMarkup() {
    if (tab === 'voice') return sectionVoice();
    if (tab === 'records') return sectionRecords();
    if (tab === 'storage') return sectionStorage();
    if (tab === 'auto') return sectionAuto();
    return sectionVoice();
  }

  function paint() {
    if (!sheet) return;
    const active = document.activeElement;
    const focusKey = active && active.getAttribute ? active.getAttribute('data-si') : '';
    const focusValue = active && active.getAttribute ? active.getAttribute('data-value') : '';
    sheet.innerHTML = `<header class="st-head">
        <h2 class="st-title" id="st-title">설정</h2>
        <button class="st-close" type="button" data-si="close" aria-label="설정 닫기">×</button>
      </header>
      <nav class="st-tabs" role="tablist" aria-label="설정 항목">
        ${TABS.map(([key, label]) => `<button class="st-tab" role="tab" type="button" data-si-tab="${key}" aria-selected="${tab === key ? 'true' : 'false'}">${label}</button>`).join('')}
      </nav>
      <div class="st-body" id="st-body" tabindex="-1">
        <div class="st-status" role="status" aria-live="polite"${statusLine ? '' : ' hidden'} style="margin:0 0 12px;font-size:13px;line-height:1.5;color:${statusWarn ? '#8a4620' : 'var(--g700)'}">${esc(statusLine)}</div>
        ${bodyMarkup()}
        <input type="file" accept="application/json,.json" data-si-import hidden>
      </div>`;
    if (statusLine) {
      window.setTimeout(() => {
        statusLine = '';
        statusWarn = false;
        const status = sheet && sheet.querySelector('.st-status');
        if (status) status.hidden = true;
      }, 5000);
    }
    if (focusKey) {
      const target = sheet.querySelector(`[data-si="${focusKey}"][data-value="${focusValue}"]`) || sheet.querySelector(`[data-si="${focusKey}"]`);
      if (target) target.focus();
    }
  }

  async function loadSummary() {
    if (summaryLoading) return;
    summaryLoading = true;
    try {
      const data = await summary();
      summaryCache = data;
      if (host && tab === 'records') paint();
    } finally {
      summaryLoading = false;
    }
  }

  function open(startTab) {
    if (host) {
      if (startTab) { tab = startTab; paint(); }
      return;
    }
    lastFocus = document.activeElement;
    tab = startTab || 'voice';
    pendingReset = '';
    statusLine = '';
    summaryCache = null;
    storageCache = null;
    host = document.createElement('div');
    host.className = 'st-overlay';
    host.setAttribute('data-settings-overlay', '');
    sheet = document.createElement('div');
    sheet.className = 'st-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.setAttribute('aria-modal', 'true');
    sheet.setAttribute('aria-labelledby', 'st-title');
    host.appendChild(sheet);
    document.body.appendChild(host);
    document.body.style.overflow = 'hidden';
    paint();
    if (window.SpeechVoice && typeof window.SpeechVoice.load === 'function') {
      window.SpeechVoice.load().then(() => { if (host && tab === 'voice') paint(); }).catch(() => {});
    }
    const closeButton = sheet.querySelector('[data-si="close"]');
    if (closeButton) closeButton.focus();
  }

  function close() {
    if (!host) return;
    host.remove();
    host = null;
    sheet = null;
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    lastFocus = null;
  }

  function onOverlayClick(event) {
    if (event.target === host) close();
  }

  async function handleReset(kind) {
    const result = await resetKind(kind);
    summaryCache = null;
    pendingReset = '';
    if (result && result.failed) {
      statusLine = '일부 기록을 지우지 못했어요. 잠시 뒤 다시 시도해 주세요.';
      paint();
      return;
    }
    statusLine = '기록을 지웠어요.';
    paint();
    loadSummary();
    if (result && result.reload) window.location.reload();
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('[data-settings-open]');
    if (opener) {
      event.preventDefault();
      open(opener.getAttribute('data-settings-tab') || 'voice');
      return;
    }
    if (!host) return;
    if (event.target === host) { close(); return; }

    const tabButton = event.target.closest('[data-si-tab]');
    if (tabButton) {
      event.preventDefault();
      tab = tabButton.getAttribute('data-si-tab') || 'voice';
      pendingReset = '';
      statusLine = '';
      paint();
      if (tab === 'records' && !summaryCache) loadSummary();
      if (tab === 'storage') loadStorage();
      return;
    }

    const target = event.target.closest('[data-si]');
    if (!target) return;
    const action = target.getAttribute('data-si');
    const kind = target.getAttribute('data-kind') || '';
    const value = target.getAttribute('data-value') || '';

    if (action === 'close') { close(); return; }
    if (action === 'pick-voice') { pickVoice(value); return; }
    if (action === 'hear-voice') { hearVoice(value); return; }
    if (action === 'backup') { exportBackup(); return; }
    if (action === 'import') {
      const file = sheet.querySelector('[data-si-import]');
      if (file) file.click();
      return;
    }
    if (action === 'reset') { pendingReset = kind; paint(); return; }
    if (action === 'reset-cancel') { pendingReset = ''; paint(); return; }
    if (action === 'reset-confirm') { handleReset(kind); return; }
    if (action === 'delete-models') { deleteModels(); return; }
    if (action === 'persist') { requestPersist(); return; }
    if (action === 'toggle-auto') {
      const next = !autoScoreOn();
      save({ autoScore: next });
      statusLine = next
        ? '자동 채점을 켰어요. 다음 녹음부터 기기 안에서 채점해요.'
        : '자동 채점을 껐어요. 녹음과 자기평가는 그대로 써요.';
      paint();
      return;
    }
  });

  document.addEventListener('input', (event) => {
    const input = event.target.closest('[data-si-input="rate"]');
    if (!input || !host) return;
    const value = clampRate(input.value);
    save({ voice: { rate: value } });
    const output = sheet.querySelector('[data-si-rate]');
    if (output) output.textContent = `${value.toFixed(2)}×`;
  });

  document.addEventListener('change', (event) => {
    const input = event.target.closest('[data-si-import]');
    if (!input || !host || !input.files || !input.files[0]) return;
    importBackup(input.files[0]);
  });

  document.addEventListener('keydown', (event) => {
    if (!host) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = [...sheet.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter((node) => !node.disabled && node.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (window.AppSettings && typeof window.AppSettings.subscribe === 'function') {
    try {
      window.AppSettings.subscribe(() => {
        if (host && (tab === 'voice' || tab === 'auto')) paint();
      });
    } catch (error) { /* noop */ }
  }

  window.SettingsUI = {
    open,
    close,
    isOpen: () => Boolean(host),
  };
})();
