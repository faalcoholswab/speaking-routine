/* =========================================================
   모의고사 — 실전 타이머 + 음성 안내
   ========================================================= */
(() => {
  'use strict';

  const EXAMS = Array.isArray(window.MOCK_EXAMS) ? window.MOCK_EXAMS.filter(Boolean) : [];
  let currentExam = EXAMS[0] || null;
  const STORE_KEY = 'speaking-routine-mock-v1';
  const MOCK_LOCK_KEY = 'speaking-routine-mock-lock';
  const LOCK_TTL = 30000;
  const LOCK_BEAT = 10000;
  const ABORT = { abort: true };

  const KIND_LABEL = {
    1: '지문 읽기',
    2: '그림 묘사',
    3: '인터뷰',
    4: '정보 활용',
    5: '의견 말하기',
  };

  const SILENT_FEEDBACK = '말소리가 감지되지 않았어요. 마이크를 확인해 주세요';

  function isSilentMetrics(metrics) {
    return Boolean(metrics && Number.isFinite(Number(metrics.speechSec)) && Number(metrics.speechSec) < 1);
  }

  function silentResult(q) {
    const max = Number(q && q.no) === 11 ? 5 : 3;
    const result = normalizeScore({
      score: 0,
      max,
      criteria: {},
      feedback: [SILENT_FEEDBACK],
      text: '',
      missedWords: [],
      covered: [],
      wrongFacts: [],
      silent: true,
    }, q);
    if (result) result.silent = true;
    return result;
  }

  const MODE_HINT = {
    exam: '실제 시험처럼 타이머가 자동으로 진행됩니다.',
    practice: '타이머 없이 문항을 넘겨보고, 필요할 때만 그 문항을 타이머로 풀 수 있습니다.',
    guide: '문항별 모범 답안과 발음 가이드를 봅니다.',
  };

  const MODE_START = {
    exam: '응시 시작',
    practice: '연습 시작',
    guide: '해설 보기',
  };

  const root = document.getElementById('ex-root');
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  // 시험 시간을 그대로 두는 것이 기본. 로컬(사설망)에서만 ?speed= 로 배속 검증한다.
  const LOCAL_ENV = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;
  const SPEED = LOCAL_ENV.test(location.hostname)
    ? Math.max(1, Math.min(60, Number(new URLSearchParams(location.search).get('speed')) || 1))
    : 1;

  let runToken = 0;
  let examVoices = { narrator: null, interviewer: null };
  let skipResolve = null;
  let attempt = null;
  let els = null;
  let audioCtx = null;
  let mode = 'exam';
  let selectedMode = 'exam';
  let practiceList = [];
  let practiceIndex = 0;
  let starting = false;
  let lockTimer = 0;

  // ---------- v34: 녹음·채점·마이노트 ----------
  const NOTES = window.MockNotes || null;
  const TEST_AUDIO = LOCAL_ENV.test(location.hostname)
    ? (() => {
      try {
        return new URLSearchParams(location.search).get('testAudio') || '';
      } catch (error) {
        return '';
      }
    })()
    : '';
  const testAudioBlobs = new Map();

  function testAudioUrl(no) {
    if (!TEST_AUDIO) return '';
    const folder = TEST_AUDIO.replace(/\/+$/, '');
    try {
      return new URL(`${folder}/q${no}.wav`, location.href).href;
    } catch (error) {
      return '';
    }
  }

  function testAudioKey(attemptId, no) {
    return `${attemptId}:${no}`;
  }
  let recordingEnabled = false;
  let recordingNo = 0;
  let practiceAttemptId = '';
  let practiceScores = {};
  let practiceScoreToken = 0;
  let micOpts = null;
  let mic = { ready: false, state: 'unknown', testing: false, testId: '', testUrl: '', testBlob: null, timer: 0, unsub: null };
  let scoring = { running: false, done: false, error: null, results: {}, raw: {}, summary: null, token: 0 };
  let retake = null;
  let reportAudioUrls = [];

  function recorderSupported() {
    const rec = window.SpeakingRecorder;
    if (!rec) return false;
    try {
      const flag = typeof rec.isSupported === 'function' ? rec.isSupported() : rec.isSupported;
      return flag !== false;
    } catch (error) {
      return false;
    }
  }

  function scoreModulesReady() {
    if (!window.SpeakingSTT || !window.SpeakingScore) return false;
    try {
      if (typeof window.SpeakingSTT.isSupported === 'function' && !window.SpeakingSTT.isSupported()) return false;
    } catch (error) {
      return false;
    }
    return true;
  }

  function cleanupMic() {
    if (mic.timer) {
      window.clearInterval(mic.timer);
      mic.timer = 0;
    }
    if (mic.unsub) {
      try { mic.unsub(); } catch (error) { /* noop */ }
      mic.unsub = null;
    }
    if (mic.testUrl) {
      try { URL.revokeObjectURL(mic.testUrl); } catch (error) { /* noop */ }
      mic.testUrl = '';
    }
    mic.testBlob = null;
    mic.testing = false;
    if (window.SpeakingRecorder && typeof window.SpeakingRecorder.cancel === 'function') {
      try { window.SpeakingRecorder.cancel(); } catch (error) { /* noop */ }
    }
  }

  function revokeReportAudio() {
    reportAudioUrls.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch (error) { /* noop */ }
    });
    reportAudioUrls = [];
  }

  function totalQuestions(exam = currentExam) {
    return exam ? exam.parts.reduce((sum, part) => sum + part.questions.length, 0) : 0;
  }

  function guideFor(exam = currentExam) {
    return (window.MOCK_GUIDES && exam && window.MOCK_GUIDES[exam.id]) || null;
  }

  // ---------- 유틸 ----------
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  function uid() {
    return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  }

  function fmtClock(seconds) {
    const total = Math.max(0, Math.round(seconds));
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  }

  function normalizeResult(value) {
    if (!value || typeof value !== 'object') return null;
    const criteria = {};
    if (value.criteria && typeof value.criteria === 'object' && !Array.isArray(value.criteria)) {
      Object.entries(value.criteria).forEach(([key, val]) => {
        if (val === null || val === undefined || val === '') return;
        const number = Number(val);
        if (Number.isFinite(number) && /^[a-z]{3,14}$/.test(key)) criteria[key] = Math.max(0, Math.min(5, number));
      });
    }
    const feedback = (Array.isArray(value.feedback) ? value.feedback : (typeof value.feedback === 'string' ? value.feedback.split('\n') : []))
      .filter((line) => typeof line === 'string' && line.trim())
      .slice(0, 6)
      .map((line) => line.trim().slice(0, 500));
    const words = (list) => (Array.isArray(list) ? list : [])
      .map((item) => (typeof item === 'string' ? item : (item && (item.word || item.w || item.text)) || ''))
      .filter(Boolean)
      .slice(0, 80);
    const score = Number(value.score);
    const max = Number(value.max);
    return {
      score: Number.isFinite(score) ? Math.max(0, Math.round(score * 10) / 10) : 0,
      max: Number.isFinite(max) && max > 0 ? Math.max(1, Math.round(max)) : 3,
      criteria,
      feedback,
      text: typeof value.text === 'string' ? value.text.slice(0, 2000) : '',
      missedWords: words(value.missedWords),
      covered: words(value.covered),
      wrongFacts: words(value.wrongFacts),
      noRecording: Boolean(value.noRecording),
      unavailable: Boolean(value.unavailable),
      pending: Boolean(value.pending),
      silent: Boolean(value.silent),
    };
  }

  function normalizeSummary(value) {
    if (!value || typeof value !== 'object') return null;
    const estimate = value.estimate && typeof value.estimate === 'object' ? value.estimate : null;
    const list = (items) => (Array.isArray(items) ? items : [])
      .map((item) => (typeof item === 'string' ? item : (item && (item.text || item.label)) || ''))
      .filter(Boolean)
      .slice(0, 4)
      .map((item) => item.slice(0, 300));
    const toAverage = (item) => {
      const value2 = item && typeof item === 'object' ? (item.avg ?? item.score ?? item.value) : item;
      const number = Number(value2);
      return Number.isFinite(number) ? Math.round(number * 100) / 100 : null;
    };
    let averages = null;
    if (Array.isArray(value.partAverages)) {
      averages = value.partAverages.slice(0, 5).map(toAverage);
    } else if (value.partAverages && typeof value.partAverages === 'object') {
      averages = [1, 2, 3, 4, 5].map((part) => toAverage(
        value.partAverages[part] ?? value.partAverages[`part${part}`] ?? value.partAverages[String(part)]
      ));
    }
    return {
      estimate: estimate ? {
        scaled: Math.max(0, Math.min(200, Math.round(Number(estimate.scaled) || 0))),
        level: typeof estimate.level === 'string' ? estimate.level.slice(0, 8) : '',
      } : null,
      partAverages: averages,
      strengths: list(value.strengths),
      weaknesses: list(value.weaknesses),
    };
  }

  function normalizeAttempt(entry) {
    const next = {
      id: typeof entry.id === 'string' && entry.id ? entry.id.slice(0, 40) : uid(),
      examId: typeof entry.examId === 'string' && entry.examId ? entry.examId.slice(0, 40) : 'mock-01',
      at: typeof entry.at === 'string' && !Number.isNaN(Date.parse(entry.at)) ? entry.at : new Date().toISOString(),
      seconds: Math.max(0, Math.min(86400, Math.round(Number(entry.seconds) || 0))),
      total: Math.max(0, Math.min(99, Math.round(Number(entry.total) || 0))),
      ratings: entry.ratings && typeof entry.ratings === 'object' && !Array.isArray(entry.ratings)
        ? entry.ratings
        : {},
    };
    if (typeof entry.finishedAt === 'string' && !Number.isNaN(Date.parse(entry.finishedAt))) next.finishedAt = entry.finishedAt;
    if (entry.single && typeof entry.single === 'object') {
      const no = Math.round(Number(entry.single.no));
      if (Number.isFinite(no) && no >= 1 && no <= 11) next.single = { no };
    }
    if (entry.scores && typeof entry.scores === 'object' && !Array.isArray(entry.scores)) {
      const scores = {};
      Object.entries(entry.scores).forEach(([key, value]) => {
        const no = Number(key);
        if (!Number.isInteger(no) || no < 1 || no > 11) return;
        const result = normalizeResult(value);
        if (result) scores[no] = result;
      });
      if (Object.keys(scores).length) next.scores = scores;
    }
    const estimate = entry.estimate && typeof entry.estimate === 'object' ? entry.estimate : null;
    if (estimate) {
      next.estimate = {
        scaled: Math.max(0, Math.min(200, Math.round(Number(estimate.scaled) || 0))),
        level: typeof estimate.level === 'string' ? estimate.level.slice(0, 8) : '',
      };
    }
    const summary = normalizeSummary(entry.summary);
    if (summary) next.summary = summary;
    return next;
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      const data = raw ? JSON.parse(raw) : null;
      if (!data || !Array.isArray(data.attempts)) return { attempts: [] };
      return {
        attempts: data.attempts
          .filter((entry) => entry && typeof entry === 'object')
          .map(normalizeAttempt)
          .slice(0, 50),
      };
    } catch (error) {
      return { attempts: [] };
    }
  }

  function saveStore(store) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (error) {
      return false;
    }
  }

  function upsertAttempt(entry) {
    const store = loadStore();
    const index = store.attempts.findIndex((item) => item.id === entry.id);
    if (index >= 0) store.attempts[index] = entry;
    else store.attempts.unshift(entry);
    store.attempts = store.attempts.slice(0, 50);
    return saveStore(store);
  }

  // ---------- 응시 잠금 ----------
  // 응시 중 다른 탭에서 기록 초기화/가져오기를 하지 못하게 한다.
  function holdExamLock() {
    const write = () => {
      try { localStorage.setItem(MOCK_LOCK_KEY, JSON.stringify({ at: Date.now() })); } catch (error) { /* noop */ }
    };
    write();
    window.clearInterval(lockTimer);
    lockTimer = window.setInterval(write, LOCK_BEAT);
  }

  function releaseExamLock() {
    if (lockTimer) {
      window.clearInterval(lockTimer);
      lockTimer = 0;
    }
    try { localStorage.removeItem(MOCK_LOCK_KEY); } catch (error) { /* noop */ }
  }

  // ---------- 소리 ----------
  function beep(kind) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioCtx = audioCtx || new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;
      osc.type = 'sine';
      osc.frequency.value = kind === 'end' ? 620 : 840;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (kind === 'end' ? 0.5 : 0.22));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + (kind === 'end' ? 0.55 : 0.26));
    } catch (error) { /* noop */ }
  }

  function speak(text, role) {
    return new Promise((resolve) => {
      if (!synth || !text || SPEED > 1) { resolve(false); return; }
      let busy = false;
      try { busy = Boolean(synth.speaking || synth.pending); } catch (error) { /* noop */ }
      if (busy) {
        // iOS는 cancel 직후 speak를 버리는 경우가 있어 한 박자 쉰다.
        try { synth.cancel(); } catch (error) { /* noop */ }
      }

      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      utter.rate = role === 'interviewer' ? 0.88 : 0.92;
      utter.pitch = 1;
      const voice = role === 'interviewer' ? examVoices.interviewer : examVoices.narrator;
      if (voice) utter.voice = voice;

      const words = String(text).trim().split(/\s+/).length;
      const limit = (words / (150 * utter.rate)) * 60000 + 3500;
      let done = false;
      let started = false;
      let timer = 0;

      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        resolve(started);
      };

      utter.onstart = () => { started = true; };
      utter.onend = finish;
      utter.onerror = finish;
      timer = window.setTimeout(finish, limit);

      try {
        if (busy) window.setTimeout(() => { try { synth.speak(utter); } catch (error) { finish(); } }, 90);
        else synth.speak(utter);
      } catch (error) {
        finish();
      }
    });
  }

  function stopSpeech() {
    if (!synth) return;
    try { synth.cancel(); } catch (error) { /* noop */ }
  }

  function fireSkip() {
    const fn = skipResolve;
    skipResolve = null;
    if (fn) fn();
  }

  // ---------- v34: 녹음 ----------
  async function startRecording(no) {
    if (!recordingEnabled) return false;
    const attemptId = attempt && attempt.id ? attempt.id : (mode === 'practice' ? practiceAttemptId : '');
    if (!attemptId) return false;
    if (TEST_AUDIO) {
      const url = testAudioUrl(no);
      if (!url) return false;
      try {
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) throw new Error(`test audio ${response.status}`);
        const blob = await response.blob();
        if (!(blob instanceof Blob) || !blob.size) throw new Error('empty test audio');
        testAudioBlobs.set(testAudioKey(attemptId, no), { blob, mime: blob.type || 'audio/wav', seconds: 0 });
        recordingNo = no;
        return true;
      } catch (error) {
        recordingNo = 0;
        return false;
      }
    }
    if (!recorderSupported()) return false;
    try {
      await window.SpeakingRecorder.start({ attemptId, no });
      recordingNo = no;
      return true;
    } catch (error) {
      recordingNo = 0;
      return false;
    }
  }

  async function stopRecording() {
    if (!recordingNo) return null;
    if (TEST_AUDIO) {
      recordingNo = 0;
      return null;
    }
    recordingNo = 0;
    try {
      return await window.SpeakingRecorder.stop();
    } catch (error) {
      return null;
    }
  }

  async function getRecording(attemptId, no) {
    if (!attemptId) return null;
    if (TEST_AUDIO) {
      return testAudioBlobs.get(testAudioKey(attemptId, no)) || null;
    }
    if (!window.SpeakingRecorder || typeof window.SpeakingRecorder.get !== 'function') return null;
    try {
      const record = await window.SpeakingRecorder.get(attemptId, no);
      if (!record) return null;
      if (record instanceof Blob) return record.size ? { blob: record } : null;
      if (record.blob instanceof Blob && record.blob.size) return record;
      return null;
    } catch (error) {
      return null;
    }
  }

  async function analyzeRecording(blob) {
    const metrics = window.AudioMetrics;
    if (!metrics || typeof metrics.analyze !== 'function' || !(blob instanceof Blob)) return null;
    const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    const Live = window.AudioContext || window.webkitAudioContext;
    const Ctx = Offline || Live;
    if (!Ctx) return null;
    let ctx = null;
    try {
      const arrayBuffer = await blob.arrayBuffer();
      ctx = Offline ? new Offline(1, 1, 44100) : new Live();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      const data = decoded.getChannelData(0);
      const result = metrics.analyze(data, decoded.sampleRate);
      if (result && Number.isFinite(Number(result.durationSec))) return result;
      return null;
    } catch (error) {
      return null;
    } finally {
      if (ctx && typeof ctx.close === 'function') {
        try { ctx.close(); } catch (error) { /* noop */ }
      }
    }
  }

  // ---------- 홈 ----------
  function paintHome() {
    document.body.classList.remove('ex-locked');
    releaseExamLock();
    stopSpeech();
    cleanupMic();
    revokeReportAudio();
    scoring.token += 1;
    scoring = { running: false, done: false, error: null, results: {}, raw: {}, summary: null, token: scoring.token };
    runToken += 1;
    attempt = null;
    document.title = '모의고사 · 스피킹 루틴';

    const store = loadStore();
    const noteCount = NOTES ? NOTES.count() : 0;
    const notesCard = `<button class="ex-card ex-notes-card" type="button" data-act="notes">
      <span class="ex-card-num ex-notes-num" aria-hidden="true">☆</span>
      <span class="ex-card-body">
        <span class="ex-card-title">마이노트 <b>${noteCount}문항</b></span>
        <span class="ex-card-meta">${noteCount ? '자동 저장·직접 추가한 문항을 다시 풀어요.' : '채점 후 약한 문항이 자동으로 모여요.'}</span>
      </span>
      <span class="ex-card-cta">보기</span>
    </button>`;

    const slots = [
      { id: 'mock-01', label: '모의고사 1' },
      { id: 'mock-02', label: '모의고사 2' },
      { id: 'mock-03', label: '모의고사 3' },
    ].map((slot, index) => {
      const exam = EXAMS.find((item) => item.id === slot.id);
      const on = Boolean(exam);
      const meta = on
        ? `Part 1~5 · ${exam.parts.reduce((n, p) => n + p.questions.length, 0)}문항 · 약 ${Math.round(estimateSeconds(exam) / 60)}분`
        : '다음 영상으로 준비 중';
      return `
        <button class="ex-card ${on ? 'on' : 'off'}" ${on ? `data-act="intro" data-exam="${esc(slot.id)}"` : 'disabled'} type="button">
          <span class="ex-card-num">${index + 1}</span>
          <span class="ex-card-body">
            <span class="ex-card-title">${esc(slot.label)}</span>
            <span class="ex-card-meta">${esc(meta)}</span>
          </span>
          <span class="ex-card-cta">${on ? '응시하기' : '준비 중'}</span>
        </button>`;
    }).join('');

    const recent = store.attempts.slice(0, 3);
    const historyMarkup = recent.length
      ? `<div class="ex-history">
           <p class="ex-history-title">최근 응시</p>
           <ul>${recent.map((item) => (
             `<li><span>${esc(formatWhen(item.at))}</span><b>${fmtClock(item.seconds)}</b><i>${item.total}문항</i></li>`
           )).join('')}</ul>
         </div>`
      : '<p class="ex-last">아직 응시 기록이 없습니다.</p>';

    root.innerHTML = `
      <div class="ex-home">
        <div class="ex-wrap">
          <a class="ex-back" href="index.html">← 스피킹 루틴</a>
          <div class="ex-home-head">
            <h1 class="ex-h1">모의고사</h1>
            <p class="ex-sub">실제 시험과 같은 순서·시간으로 Part 1~5를 한 번에 연습합니다.</p>
          </div>
          <div class="ex-cards">${slots}${notesCard}</div>
          ${historyMarkup}
          <p class="ex-note">
            Part 3은 질문이 화면에 표시되고, Part 4 질문은 음성으로만 재생됩니다.<br>
            타이머는 자동으로 넘어가며, 녹음과 채점은 기기 안에서만 처리됩니다.
          </p>
        </div>
      </div>`;
  }

  function formatWhen(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString('ko-KR', {
      month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  }

  function estimateSeconds(exam) {
    let seconds = 0;
    exam.parts.forEach((part) => {
      if (part.readingSeconds) seconds += part.readingSeconds;
      part.questions.forEach((q) => {
        seconds += q.prepSeconds + q.responseSeconds;
      });
    });
    return seconds + 90;
  }

  // ---------- 시험 소개 ----------
  function paintIntro(examId) {
    document.body.classList.remove('ex-locked');
    const exam = EXAMS.find((item) => item.id === examId) || currentExam || EXAMS[0];
    if (!exam) return;
    currentExam = exam;
    stopSpeech();
    cleanupMic();
    revokeReportAudio();
    scoring.token += 1;
    scoring.running = false;
    runToken += 1;

    root.innerHTML = `
      <div class="ex-home">
        <div class="ex-wrap">
          <a class="ex-back" href="#" data-act="home">← 모의고사 목록</a>
          <div class="ex-home-head">
            <h1 class="ex-h1">${esc(exam.title)}</h1>
            <p class="ex-sub">${esc(exam.subtitle)}</p>
          </div>

          <div class="ex-stats">
            <div class="ex-stat"><b>5</b><span>파트</span></div>
            <div class="ex-stat"><b>${totalQuestions()}</b><span>문항</span></div>
            <div class="ex-stat"><b>${Math.round(estimateSeconds(exam) / 60)}분</b><span>예상 소요</span></div>
          </div>

          <div class="ex-directions">
            <p><strong>Part 1</strong> 지문 읽기 · 2문항</p>
            <p><strong>Part 2</strong> 그림 묘사 · 2문항</p>
            <p><strong>Part 3</strong> 인터뷰 · 3문항</p>
            <p><strong>Part 4</strong> 정보 활용 · 3문항</p>
            <p><strong>Part 5</strong> 의견 말하기 · 1문항</p>
          </div>

          <p class="ex-hint">
            Part 3은 질문이 화면에 표시되고, Part 4 질문은 음성으로만 재생됩니다. 이어폰을 권장합니다.<br>
            중간에 멈출 수 없고, 종료 후 문항별 자기평가와 추정 채점이 기록됩니다.
          </p>

          <div class="ex-seg" role="group" aria-label="진행 방식">
            <button type="button" data-act="mode" data-mode="exam" aria-pressed="${selectedMode === 'exam' ? 'true' : 'false'}">실전 시험</button>
            <button type="button" data-act="mode" data-mode="practice" aria-pressed="${selectedMode === 'practice' ? 'true' : 'false'}">연습</button>
            <button type="button" data-act="mode" data-mode="guide" aria-pressed="${selectedMode === 'guide' ? 'true' : 'false'}">해설</button>
          </div>
          <p class="ex-hint" id="ex-mode-hint">${MODE_HINT[selectedMode]}</p>

          <div class="ex-actions">
            <button class="ex-btn" data-act="start" type="button">${MODE_START[selectedMode]}</button>
          </div>
        </div>
      </div>`;

    document.title = `${exam.title} · 스피킹 루틴`;
  }

  // ---------- v34: 마이크 점검 ----------
  function micMarkup(opts) {
    const startLabel = opts.mode === 'retake'
      ? '다시 풀기 시작'
      : (opts.mode === 'practice' ? '연습 시작' : '응시 시작');
    return `<div class="ex-home ex-mic-page">
      <div class="ex-wrap">
        <button class="ex-back" type="button" data-act="mic-back">← ${opts.mode === 'retake' ? '마이노트' : '모의고사 소개'}</button>
        <div class="ex-home-head">
          <h1 class="ex-h1" tabindex="-1">마이크 점검</h1>
          <p class="ex-sub">녹음은 기기 안에서만 처리되고 밖으로 나가지 않아요. 3초 테스트로 소리를 확인해 주세요.</p>
        </div>
        <section class="mic-panel" aria-label="마이크 점검">
          <div class="mic-state" id="mic-state" role="status" aria-live="polite">마이크를 확인하고 있어요…</div>
          <div class="mic-meter" id="mic-meter" aria-hidden="true">${'<i></i>'.repeat(12)}</div>
          <div class="mic-actions">
            <button class="ex-btn ghost" data-act="mic-test" id="mic-test" type="button">3초 테스트 녹음</button>
            <span class="mic-count" id="mic-count" aria-live="polite"></span>
          </div>
          <audio id="mic-audio" class="mic-audio" controls preload="metadata" hidden aria-label="테스트 녹음"></audio>
          <p class="mic-hint">테스트가 어려우면 녹음 없이 진행할 수 있어요. 그 경우 자기평가만 저장됩니다.</p>
        </section>
        <div class="ex-actions mic-primary">
          <button class="ex-btn" data-act="mic-start" id="mic-start" type="button" disabled>${startLabel}</button>
          ${opts.mode === 'retake' ? '' : '<button class="ex-btn ghost" data-act="mic-skip" type="button">녹음 없이 진행</button>'}
        </div>
      </div>
    </div>`;
  }

  function setMicState(text, kind) {
    const el = document.getElementById('mic-state');
    if (!el) return;
    el.textContent = text;
    el.className = `mic-state${kind ? ` ${kind}` : ''}`;
  }

  function paintMeter(level) {
    const el = document.getElementById('mic-meter');
    if (!el) return;
    const number = Number(level);
    const value = Number.isFinite(number)
      ? (number > 1 ? Math.min(1, number / 100) : Math.min(1, Math.max(0, number)))
      : 0;
    const active = Math.round(value * el.children.length);
    Array.from(el.children).forEach((bar, index) => {
      bar.classList.toggle('on', index < active);
    });
  }

  async function initMicCheck() {
    const startBtn = document.getElementById('mic-start');
    const testBtn = document.getElementById('mic-test');
    if (TEST_AUDIO) {
      mic.ready = true;
      mic.state = 'test';
      setMicState('테스트 오디오로 진행합니다. 시작을 누르면 시험이 시작됩니다.', 'ok');
      if (testBtn) testBtn.hidden = true;
      if (startBtn) startBtn.disabled = false;
      return;
    }
    if (!recorderSupported()) {
      mic.ready = false;
      mic.state = 'unsupported';
      setMicState('이 브라우저에서는 녹음을 지원하지 않아요. 녹음 없이 진행할 수 있어요.', 'warn');
      if (testBtn) testBtn.hidden = true;
      if (startBtn) startBtn.disabled = true;
      return;
    }
    setMicState('마이크 권한을 확인하고 있어요…', '');
    try {
      const ok = await window.SpeakingRecorder.requestPermission();
      if (ok === false) throw new Error('denied');
      if (!scoreModulesReady()) {
        mic.ready = false;
        mic.state = 'no-score';
        setMicState('채점 기능을 불러오지 못했어요. 녹음 없이 진행할 수 있어요.', 'warn');
        if (startBtn) startBtn.disabled = true;
        if (testBtn) testBtn.hidden = true;
        return;
      }
      mic.ready = true;
      mic.state = 'ready';
      setMicState('마이크가 준비됐어요. 3초 테스트로 소리를 확인해 보세요.', 'ok');
      if (startBtn) startBtn.disabled = false;
      if (testBtn) testBtn.hidden = false;
      if (typeof window.SpeakingRecorder.onLevel === 'function') {
        const unsub = window.SpeakingRecorder.onLevel((level) => paintMeter(level));
        if (typeof unsub === 'function') mic.unsub = unsub;
      }
    } catch (error) {
      mic.ready = false;
      mic.state = 'denied';
      setMicState('마이크를 사용할 수 없어요. 녹음 없이 진행할 수 있어요.', 'warn');
      if (testBtn) testBtn.hidden = true;
      if (startBtn) startBtn.disabled = true;
    }
  }

  function openMicCheck(opts) {
    micOpts = opts || { mode: 'exam' };
    cleanupMic();
    stopSpeech();
    runToken += 1;
    attempt = null;
    mic.ready = false;
    mic.state = 'unknown';
    document.body.classList.remove('ex-locked');
    document.title = '마이크 점검 · 스피킹 루틴';
    root.innerHTML = micMarkup(micOpts);
    const title = root.querySelector('.ex-h1');
    if (title) title.focus();
    initMicCheck();
  }

  async function startMicTest() {
    if (mic.testing || !mic.ready) return;
    if (TEST_AUDIO) {
      setMicState('테스트 오디오 모드에서는 테스트 녹음을 건너뜁니다.', 'ok');
      return;
    }
    mic.testing = true;
    const id = 'mic-test';
    mic.testId = id;
    const btn = document.getElementById('mic-test');
    if (btn) btn.disabled = true;
    try {
      await window.SpeakingRecorder.start({ attemptId: id, no: 1 });
    } catch (error) {
      mic.testing = false;
      if (btn) btn.disabled = false;
      setMicState('녹음을 시작하지 못했어요. 다시 시도하거나 녹음 없이 진행하세요.', 'warn');
      return;
    }
    let left = 3;
    setMicState('녹음 중… 3초', 'rec');
    mic.timer = window.setInterval(() => {
      left -= 1;
      if (left > 0) {
        setMicState(`녹음 중… ${left}초`, 'rec');
        return;
      }
      window.clearInterval(mic.timer);
      mic.timer = 0;
      finishMicTest();
    }, 1000);
  }

  async function finishMicTest() {
    const id = mic.testId;
    let record = null;
    try {
      record = await window.SpeakingRecorder.stop();
    } catch (error) {
      record = null;
    }
    let blob = record && (record.blob || record);
    if (!(blob instanceof Blob) && id && window.SpeakingRecorder.get) {
      try {
        const got = await window.SpeakingRecorder.get(id, 1);
        blob = got && (got.blob || got);
      } catch (error) {
        blob = null;
      }
    }
    mic.testing = false;
    const btn = document.getElementById('mic-test');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '다시 테스트';
    }
    if (!(blob instanceof Blob) || !blob.size) {
      setMicState('테스트 녹음을 불러오지 못했어요. 다시 시도하거나 녹음 없이 진행하세요.', 'warn');
      return;
    }
    mic.testBlob = blob;
    if (mic.testUrl) {
      try { URL.revokeObjectURL(mic.testUrl); } catch (error) { /* noop */ }
    }
    mic.testUrl = URL.createObjectURL(blob);
    const audio = document.getElementById('mic-audio');
    if (audio) {
      audio.src = mic.testUrl;
      audio.hidden = false;
    }
    setMicState('테스트 녹음이 준비됐어요. 재생해서 잘 들리는지 확인하세요.', 'ok');
  }

  function finishMic(record) {
    const opts = micOpts || { mode: 'exam' };
    recordingEnabled = Boolean(record) && (TEST_AUDIO ? true : recorderSupported());
    mic.ready = recordingEnabled;
    cleanupMic();
    if (opts.mode === 'retake') {
      if (recordingEnabled) startNoteRetakeNow(opts.item, opts.prevScore);
      else paintNotes();
      return;
    }
    if (opts.mode === 'practice') startPractice('practice');
    else startExam();
  }

  // ---------- 시험 화면 ----------
  function mountShell(kind) {
    mode = kind === 'guide' ? 'guide' : (kind === 'practice' ? 'practice' : 'exam');
    document.body.classList.add('ex-locked');
    const paged = mode !== 'exam';

    let dockMarkup;
    if (!paged) {
      dockMarkup = `<footer class="ex-dock idle" id="ex-dock">
          <div class="ex-dock-in">
            <span class="ex-phase" id="ex-phase">대기</span>
            <span class="ex-time" id="ex-time">--</span>
            <span class="ex-track"><span id="ex-fill" style="width:0%"></span></span>
          </div>
        </footer>`;
    } else {
      const middle = mode === 'practice'
        ? `<button class="ex-timer-btn" data-act="ptimer" type="button">
             <span class="ex-phase" id="ex-phase">타이머</span>
             <span class="ex-time" id="ex-time">--</span>
           </button>`
        : `<span class="ex-timer-btn static">
             <span class="ex-phase" id="ex-phase">해설</span>
             <span class="ex-time" id="ex-time" hidden>--</span>
           </span>`;
      dockMarkup = `<footer class="ex-dock idle practice" id="ex-dock">
          <span class="ex-track ex-track-top"><span id="ex-fill" style="width:0%"></span></span>
          <div class="ex-dock-in ex-practice-in">
            <button class="ex-nav" data-act="prev" type="button">← 이전</button>
            ${middle}
            <button class="ex-nav" data-act="next" type="button">다음 →</button>
          </div>
        </footer>`;
    }

    root.innerHTML = `
      <header class="ex-top">
        <div class="ex-top-l">
          <span class="ex-tag">${esc((currentExam && currentExam.title) || '모의고사')}</span>
          <span class="ex-tag part" id="ex-part">Part 1</span>
        </div>
        <span class="ex-count" id="ex-count" aria-live="polite">0 / ${totalQuestions()}</span>
        <div class="ex-top-r">
          <button class="ex-quit" data-act="${paged ? 'leave' : 'quit'}" type="button">${paged ? '나가기' : '그만두기'}</button>
        </div>
      </header>
      <div class="ex-bar"><span id="ex-bar-fill" style="width:0%"></span></div>
      <section class="ex-stage"><div class="ex-stage-in" id="ex-stage"></div></section>
      ${dockMarkup}`;

    els = {
      part: document.getElementById('ex-part'),
      count: document.getElementById('ex-count'),
      bar: document.getElementById('ex-bar-fill'),
      stage: document.getElementById('ex-stage'),
      dock: document.getElementById('ex-dock'),
      phase: document.getElementById('ex-phase'),
      time: document.getElementById('ex-time'),
      fill: document.getElementById('ex-fill'),
    };
  }

  function mountExam() {
    mountShell('exam');
  }

  function setChrome(partNo, questionNo) {
    if (!els) return;
    els.part.textContent = `Part ${partNo}`;
    if (questionNo) {
      if (attempt && attempt.single) {
        els.count.textContent = `Q${questionNo}`;
        els.bar.style.width = '100%';
      } else {
        els.count.textContent = `Q${questionNo} / ${totalQuestions()}`;
        els.bar.style.width = `${Math.round((questionNo / totalQuestions()) * 100)}%`;
      }
    } else {
      els.count.textContent = `Part ${partNo}`;
    }
    els.stage.scrollTop = 0;
  }

  function dockClasses(extra) {
    const parts = ['ex-dock'];
    if (mode !== 'exam') parts.push('practice');
    if (extra) parts.push(extra);
    return parts.join(' ');
  }

  function dockIdle(label) {
    if (!els) return;
    els.dock.className = dockClasses('idle');
    els.phase.textContent = label || '대기';
    els.time.textContent = '--';
    els.fill.style.width = '0%';
  }

  function countdown(seconds, label, token, dockKind) {
    return new Promise((resolve, reject) => {
      const total = (Math.max(1, seconds) * 1000) / SPEED;
      const start = Date.now();
      els.dock.className = dockClasses(dockKind === 'respond' ? 'respond' : 'prep');
      els.phase.textContent = label;

      const paint = (left) => {
        els.time.textContent = String(Math.ceil(Math.max(0, left) / 1000));
        els.fill.style.width = `${((Math.max(0, left) / total) * 100).toFixed(1)}%`;
        els.dock.classList.toggle('hurry', left <= 3000 && total >= 6000);
      };

      paint(total);
      const id = window.setInterval(() => {
        if (token !== runToken || !els) {
          window.clearInterval(id);
          reject(ABORT);
          return;
        }
        const left = total - (Date.now() - start);
        paint(left);
        if (left <= 0) {
          window.clearInterval(id);
          resolve();
        }
      }, 100);
    });
  }

  function wait(ms, token) {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => {
        if (token !== runToken) reject(ABORT);
        else resolve();
      }, ms);
    });
  }

  // ---------- 문제 화면 ----------
  function listenBlock(q, phase) {
    const times = q.heardTwice ? '두 번 재생됩니다.' : '한 번만 재생됩니다.';
    if (phase === 'respond') {
      return `<div class="ex-listen"><span>답변 중입니다. 질문은 다시 나오지 않습니다.</span></div>`;
    }
    const label = phase === 'replay' ? '질문을 다시 들려줍니다.' : '질문이 재생됩니다.';
    return `<div class="ex-listen">
      <span class="ex-wave"><i></i><i></i><i></i><i></i><i></i></span>
      <span>${label} ${times}</span>
    </div>`;
  }

  // 같은 지문·표가 계속 보이는 파트에서 현재 문항을 눈으로 구분할 수 있게 한다.
  function stepper(part, currentNo, clickable) {
    if (!part.questions || part.questions.length < 2) return '';
    return `<div class="ex-stepper">${part.questions.map((item) => {
      const on = item.no === currentNo;
      const cls = `ex-step${on ? ' on' : ''}`;
      const current = on ? 'step' : 'false';
      if (!clickable) return `<span class="${cls}" aria-current="${current}">${item.no}</span>`;
      return `<button class="${cls}" type="button" data-act="jump" data-no="${item.no}" aria-current="${current}" aria-label="Question ${item.no}로 이동">${item.no}</button>`;
    }).join('')}</div>`;
  }

  function questionMarkup(part, q, phase, forceText) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
    </div>${stepper(part, q.no)}`;

    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
        <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
      </figure>`;
    } else if (part.part === 3) {
      // 실제 시험처럼 상황 지문과 질문을 함께 보여준다.
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>`;
    } else if (part.part === 4) {
      // 음성이 없거나 실제로 재생되지 않으면 질문을 화면에 노출한다.
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        ${(synth && !forceText) ? '' : `<p class="ex-prompt">${esc(q.prompt)}</p>`}
        ${listenBlock(q, phase)}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>`;
    }

    return `<div class="ex-q">${head}${body}</div>`;
  }

  // ---------- 연습 모드 ----------
  function buildPracticeList(exam) {
    return exam.parts.flatMap((part) => part.questions.map((q) => ({ part, q })));
  }

  function practiceMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
    </div>${stepper(part, q.no, true)}`;

    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
          <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
        </figure>`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    }

    const resultMarkup = practiceScores[q.no] ? renderPracticeResult(part, q, practiceScores[q.no]) : '';
    return `<div class="ex-q">${partBar(part.part)}${head}${body}${resultMarkup}</div>`;
  }

  // ---------- 해설 모드 ----------
  function guideEntry(q) {
    const guide = guideFor();
    return guide && guide.questions ? guide.questions[q.no] || null : null;
  }

  function keyElementsMarkup(q) {
    if (!Array.isArray(q.keyElements) || !q.keyElements.length) return '';
    return `<section class="gd-block">
      <h3 class="gd-title">핵심 요소</h3>
      <div class="ex-chips">${q.keyElements.map((item) => `<span class="ex-chip">${esc(item)}</span>`).join('')}</div>
    </section>`;
  }

  function modelBlock(entry) {
    if (!entry || !entry.model) {
      return `<section class="gd-block"><h3 class="gd-title">모범 답안</h3><p class="ex-note-sm">준비 중입니다.</p></section>`;
    }
    const patterns = Array.isArray(entry.patterns) && entry.patterns.length
      ? `<section class="gd-block">
           <h3 class="gd-title">사용한 만능문장</h3>
           <ul class="gd-patterns">${entry.patterns.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
         </section>`
      : '';
    return `<section class="gd-block">
        <h3 class="gd-title">모범 답안</h3>
        <p class="gd-model">${esc(entry.model)}</p>
        ${entry.ko ? `<p class="gd-ko">${esc(entry.ko)}</p>` : ''}
      </section>${patterns}`;
  }

  function renderEnglishMarks(text, points) {
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

  function renderPronMarks(pron, points) {
    const ranges = [];
    points.forEach((point) => {
      if (!point.ko) return;
      let from = 0;
      while (from <= pron.length - point.ko.length) {
        const start = pron.indexOf(point.ko, from);
        if (start < 0) return;
        const end = start + point.ko.length;
        if (!ranges.some((range) => start < range.end && end > range.start)) {
          ranges.push({ start, end, tag: point.tag, num: point.num });
          return;
        }
        from = start + 1;
      }
    });
    ranges.sort((a, b) => a.start - b.start);
    let html = '';
    let cursor = 0;
    ranges.forEach((range) => {
      html += esc(pron.slice(cursor, range.start));
      html += `<mark class="pg-ko pg-${esc(range.tag)}"><span class="pg-word">${esc(pron.slice(range.start, range.end))}</span><sup class="pg-num" aria-hidden="true">${range.num}</sup></mark>`;
      cursor = range.end;
    });
    return html + esc(pron.slice(cursor));
  }

  function pronGuideMarkup(text, pron) {
    if (!window.PRON_GUIDE || !text) return '';
    const built = window.PRON_GUIDE.build({ en: text });
    const points = (built && built.points) || [];
    if (!points.length) return '';
    const used = new Set(points.map((point) => point.tag));
    const legend = Object.entries(window.PRON_GUIDE.TAGS)
      .filter(([key]) => used.has(key))
      .map(([key, tag]) => `<span class="pg-chip pg-${esc(key)}">${esc(tag.label)}</span>`)
      .join('');
    const flow = built.flow && built.flow.chunked
      ? `<div class="pg-flow">
           <div class="pg-flow-head"><span class="pg-flow-badge">${esc(built.flow.partBadge || 'TS 억양·호흡')}</span><span class="pg-flow-label">억양 · 끊어 읽기</span></div>
           <p class="pg-flow-chunk">${esc(built.flow.chunked)}</p>
           <p class="pg-flow-tip">${esc(built.flow.tip || '')}</p>
         </div>`
      : '';
    const items = points.map((point) => `<li class="pg-item"><span class="pg-idx">${point.num}</span><span class="pg-text"><b>${esc(point.word)}</b> <span class="pg-ipa">${esc(point.ipa)}</span><span class="pg-tip">${esc(point.tip)}</span></span></li>`).join('');
    const englishLine = `<div class="pg-line"><p class="pg-line-label">영어 발음 표시</p><p class="pg-annotated-line">${renderEnglishMarks(text, points)}</p></div>`;
    const koreanLine = pron
      ? `<div class="pg-line"><p class="pg-line-label">한글 발음</p><p class="pg-plain-pron">${renderPronMarks(pron, points)}</p></div>`
      : '';
    return `<div class="pg-legend">${legend}</div>${englishLine}${koreanLine}${flow}<ol class="pg-list">${items}</ol>`;
  }

  function guideMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
      ${noteStar(q.no)}
    </div>${stepper(part, q.no, true)}`;

    const entry = guideEntry(q);
    let body = '';

    if (part.part === 1) {
      body = `<section class="gd-block"><h3 class="gd-title">발음 가이드</h3>${pronGuideMarkup(q.text, entry && entry.pron)}</section>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure"><img src="assets/mock/${esc(q.image)}" alt="묘사할 그림"></figure>
        ${keyElementsMarkup(q)}${modelBlock(entry)}`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide"><img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기"></figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>${modelBlock(entry)}`;
    }

    return `<div class="ex-q">${partBar(part.part)}${head}${body}</div>`;
  }

  function partBar(current) {
    const exam = currentExam;
    if (!exam) return '';
    return `<div class="ex-partbar">${exam.parts.map((part) => (
      `<button type="button" data-act="part" data-part="${part.part}" aria-pressed="${part.part === current ? 'true' : 'false'}" class="${part.part === current ? 'on' : ''}">Part ${part.part}</button>`
    )).join('')}</div>`;
  }

  function paintPractice() {
    const item = practiceList[practiceIndex];
    if (!item || !els) return;
    revokeReportAudio();
    setChrome(item.part.part, item.q.no);
    els.stage.innerHTML = mode === 'guide'
      ? guideMarkup(item.part, item.q)
      : practiceMarkup(item.part, item.q);
    dockIdle(mode === 'guide' ? '해설' : '타이머');

    const prev = els.dock.querySelector('[data-act="prev"]');
    const next = els.dock.querySelector('[data-act="next"]');
    if (prev) prev.disabled = practiceIndex === 0;
    if (next) next.disabled = practiceIndex === practiceList.length - 1;
    const result = practiceScores[item.q.no];
    const pending = Boolean(result && result.pending);
    const timerButton = els.dock.querySelector('[data-act="ptimer"]');
    if (timerButton) timerButton.disabled = pending;
    if (result && !pending && mode === 'practice') loadPracticeAudio(item.q.no);
  }

  function goPractice(delta) {
    const target = practiceIndex + delta;
    if (target < 0 || target >= practiceList.length) return;
    runToken += 1;
    stopSpeech();
    practiceIndex = target;
    paintPractice();
  }

  function startPractice(kind) {
    const exam = currentExam;
    if (!exam) return;
    const target = kind === 'guide' ? 'guide' : 'practice';
    runToken += 1;
    stopSpeech();
    cleanupMic();
    revokeReportAudio();
    testAudioBlobs.clear();
    recordingNo = 0;
    practiceScoreToken += 1;
    practiceScores = {};
    practiceAttemptId = `practice-${uid()}`;
    if (target === 'guide') recordingEnabled = false;
    attempt = null;
    practiceList = buildPracticeList(exam);
    practiceIndex = 0;
    mountShell(target);
    document.title = target === 'guide'
      ? `${exam.title} 해설 · 스피킹 루틴`
      : `${exam.title} 연습 · 스피킹 루틴`;
    if (target === 'practice') beep('go');
    if (window.SpeechVoice) {
      window.SpeechVoice.load().then(() => { examVoices = window.SpeechVoice.examPair(); });
    }
    paintPractice();
  }

  function playPracticeQuestion() {
    const item = practiceList[practiceIndex];
    if (!item) return;
    const { part, q } = item;
    if (part.part === 5) {
      speak(q.prompt, 'interviewer');
      return;
    }
    if (part.part !== 3 && part.part !== 4) return;
    const token = runToken;
    speak(q.prompt, 'interviewer').then(() => {
      if (!q.heardTwice || token !== runToken) return;
      window.setTimeout(() => {
        if (token !== runToken) return;
        speak(q.prompt, 'interviewer');
      }, 700);
    });
  }

  async function runPracticeTimer() {
    const item = practiceList[practiceIndex];
    if (!item) return;
    const { part, q } = item;
    const audioOnly = part.part === 3 || part.part === 4;
    const token = ++runToken;

    try {
      if (audioOnly) {
        await speak(q.prompt, 'interviewer');
        if (q.heardTwice) {
          await wait(800, token);
          await speak(q.prompt, 'interviewer');
        }
        if (token !== runToken) return;
        els.stage.innerHTML = practiceMarkup(part, q);
        await countdown(q.prepSeconds, '준비', token);
        if (token !== runToken) return;
        beep('go');
        await startRecording(q.no);
        await countdown(q.responseSeconds, '응답', token, 'respond');
        await stopRecording();
      } else {
        if (part.cues && part.cues.prep) await speak(part.cues.prep, 'narrator');
        if (token !== runToken) return;
        await countdown(q.prepSeconds, '준비', token);
        if (token !== runToken) return;
        if (part.cues && part.cues.start) await speak(part.cues.start, 'narrator');
        if (token !== runToken) return;
        await startRecording(q.no);
        await countdown(q.responseSeconds, '응답', token, 'respond');
        await stopRecording();
      }
      if (token !== runToken) return;
      beep('end');
      dockIdle('타이머');
      if (recordingEnabled && (TEST_AUDIO || recorderSupported())) {
        practiceScores[q.no] = { pending: true };
        paintPractice();
        const result = await scorePracticeItem(part, q);
        practiceScores[q.no] = result || { unavailable: true };
        if (token === runToken) paintPractice();
      }
    } catch (error) {
      if (error !== ABORT) console.error(error);
    }
  }

  function deliveryFor(metrics) {
    if (!metrics || typeof metrics !== 'object') return '보통';
    return metrics.delivery || metrics.deliveryLevel || '보통';
  }

  function normalizeScore(value, q) {
    const result = normalizeResult(value);
    if (!result) return null;
    if (!value || !Number.isFinite(Number(value.max))) result.max = q && Number(q.no) === 11 ? 5 : 3;
    return result;
  }

  function updatePracticeStatus(no, progress) {
    const el = document.getElementById('practice-status');
    if (!el) return;
    const p = normalizeProgress(progress);
    const step = Math.round(p * 100);
    el.textContent = step > 0 && step < 100
      ? `음성 인식 모델 준비 중… ${step}%`
      : (step >= 100 ? '음성을 인식하고 있어요…' : '음성을 인식하고 있어요…');
  }

  async function scorePracticeItem(part, q) {
    if (!scoreModulesReady()) return { unavailable: true };
    const rec = await getRecording(practiceAttemptId, q.no);
    if (!rec) return { noRecording: true };
    try {
      const metrics = await analyzeRecording(rec.blob || rec);
      if (isSilentMetrics(metrics)) {
        const silent = silentResult(q);
        if (!silent) return { unavailable: true };
        autoNote(part, q, silent);
        return silent;
      }
      const stt = window.SpeakingSTT;
      await stt.ensureModel((progress) => updatePracticeStatus(q.no, progress));
      const tr = await stt.transcribe(rec.blob || rec);
      const text = String((typeof tr === 'string' ? tr : (tr && tr.text)) || '').trim();
      const words = tr && Array.isArray(tr.words) ? tr.words : undefined;
      const value = window.SpeakingScore.gradeQuestion({
        exam: currentExam,
        no: q.no,
        text,
        words: Array.isArray(words) ? words.length : undefined,
        metrics,
        delivery: deliveryFor(metrics),
      });
      const result = normalizeScore(value, q);
      if (!result) return { unavailable: true };
      if (!result.text) result.text = text;
      autoNote(part, q, result);
      return result;
    } catch (error) {
      return { unavailable: true };
    }
  }

  async function loadPracticeAudio(no) {
    if (!practiceAttemptId) return;
    const rec = await getRecording(practiceAttemptId, no);
    const el = document.getElementById(`practice-audio-${no}`);
    if (!el) return;
    if (!rec) {
      el.innerHTML = '<span class="qa-empty">녹음 없음</span>';
      return;
    }
    const blob = rec.blob || rec;
    if (!(blob instanceof Blob) || !blob.size) {
      el.innerHTML = '<span class="qa-empty">녹음 없음</span>';
      return;
    }
    const url = URL.createObjectURL(blob);
    reportAudioUrls.push(url);
    el.innerHTML = `<audio controls preload="none" src="${url}" aria-label="내 녹음"></audio>`;
  }

  function renderPracticeResult(part, q, result) {
    if (!result) return '';
    if (result.pending) {
      return `<section class="practice-score pending" aria-live="polite">
        <h3>채점 중…</h3>
        <p id="practice-status">음성을 준비하고 있어요…</p>
      </section>`;
    }
    if (result.unavailable || result.noRecording) {
      return `<section class="practice-score notice">
        <h3>${result.noRecording ? '녹음이 없어요' : '채점을 사용할 수 없어요'}</h3>
        <p>${result.noRecording ? '녹음 없이 진행해서 이번 답변은 채점하지 못했어요.' : '이번 답변은 채점하지 못했어요. 타이머를 다시 실행해 보세요.'}</p>
      </section>`;
    }
    const max = result.max || (part.part === 5 ? 5 : 3);
    return `<section class="practice-score" id="practice-score-${q.no}">
      <div class="qcard-head">
        <span class="qcard-no">Q${q.no}</span>
        <span class="qcard-kind">${esc(KIND_LABEL[part.part] || '')}</span>
        <span class="qcard-score">${result.score}/${max}</span>
        ${noteStar(q.no)}
      </div>
      ${renderScoreBody(part, q, result, `practice-audio-${q.no}`)}
    </section>`;
  }

  function introMarkup(part) {
    const first = part.questions[0] ? part.questions[0].no : part.part;
    const last = part.questions.length ? part.questions[part.questions.length - 1].no : part.part;
    return `<div class="ex-intro">
      <span class="ex-tag part">Part ${part.part}</span>
      <h1 class="ex-h1 ex-intro-title">Question ${first}–${last}: ${esc(part.label)}</h1>
      <p class="ex-sub">${part.questions.length}문항</p>
      <div class="ex-directions">
        <b class="ex-directions-label">Directions</b>
        <span class="en">${esc(part.directions)}</span>
      </div>
      <div class="ex-actions">
        <button class="ex-btn ghost sm" data-act="skip" type="button">건너뛰기</button>
      </div>
    </div>`;
  }

  function readingMarkup(part) {
    return `<div class="ex-q">
      <div class="ex-q-head">
        <span class="ex-q-no">Reading</span>
        <span class="ex-q-kind">정보 읽기</span>
      </div>
      <figure class="ex-figure wide">
        <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
      </figure>
      <p class="ex-note-sm">${part.readingSeconds}초 동안 표를 읽습니다. 이어서 3개 질문이 재생됩니다.</p>
    </div>`;
  }

  // ---------- 진행 ----------
  function buildPlan(exam) {
    const plan = [];
    exam.parts.forEach((part) => {
      plan.push({ kind: 'intro', part });
      // 파트 3은 안내문 다음에 상황 지문을 따로 한 번 보여준다.
      if (part.part === 3 && part.context) plan.push({ kind: 'context', part });
      if (part.readingSeconds) plan.push({ kind: 'reading', part });
      part.questions.forEach((q) => plan.push({ kind: 'question', part, q }));
    });
    return plan;
  }

  function runIntro(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = introMarkup(part);
    dockIdle('안내');

    // iOS가 cancel 직후 발화를 버리면 onerror로 즉시 끝난다.
    // 낭독이 끝나더라도 최소 4초는 안내문을 보여준다.
    const MIN_VISIBLE = Math.max(600, 4000 / SPEED);
    return new Promise((resolve) => {
      const startedAt = Date.now();
      let settled = false;
      let timer = 0;
      const done = () => {
        if (settled) return;
        settled = true;
        skipResolve = null;
        const left = MIN_VISIBLE - (Date.now() - startedAt);
        if (left > 0) timer = window.setTimeout(resolve, left);
        else resolve();
      };
      skipResolve = () => { stopSpeech(); if (timer) window.clearTimeout(timer); done(); };
      speak(part.directions, 'narrator').then(done);
      if (token !== runToken) done();
    });
  }

  async function runContext(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = `<div class="ex-q">
      <div class="ex-q-head">
        <span class="ex-q-no">Situation</span>
        <span class="ex-q-kind">Part ${part.part}</span>
      </div>
      <div class="ex-context">${esc(part.context)}</div>
    </div>`;
    dockIdle('상황');
    // 낭독 없이 읽을 시간만 준다. 실제 시험에서도 상황 지문은 조용히 표시된다.
    await wait(Math.max(300, 3500 / SPEED), token);
  }

  async function runReading(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    els.stage.innerHTML = readingMarkup(part);
    await countdown(part.readingSeconds, '읽기', token);
  }

  async function runQuestion(step, token) {
    const part = step.part;
    const q = step.q;
    const audioOnly = part.part === 3 || part.part === 4;

    setChrome(part.part, q.no);

    if (audioOnly) {
      // Part 3은 질문이 화면에 있고, Part 4는 표만 보이므로 상태 문구를 갱신한다.
      const live = part.part === 4;
      els.stage.innerHTML = questionMarkup(part, q, 'listen');
      dockIdle('질문 듣기');
      const played = await speak(q.prompt, 'interviewer');
      let voiced = played;

      if (q.heardTwice) {
        await wait(900, token);
        voiced = await speak(q.prompt, 'interviewer') || voiced;
        if (live && voiced) els.stage.innerHTML = questionMarkup(part, q, 'replay');
      }

      if (token !== runToken) throw ABORT;

      // 질문 오디오가 끝난 뒤 삑 소리와 함께 준비 화면으로 넘어간다.
      beep('go');
      await wait(200, token);
      if (live) {
        els.stage.innerHTML = questionMarkup(part, q, 'prep', !voiced);
        if (!voiced) dockIdle('질문 표시');
      }
      await countdown(q.prepSeconds, '준비', token);

      if (token !== runToken) throw ABORT;
      beep('go');
      await wait(200, token);
      if (live) els.stage.innerHTML = questionMarkup(part, q, 'respond', !voiced);
      await startRecording(q.no);
      await countdown(q.responseSeconds, '응답', token, 'respond');
      await stopRecording();
      return;
    }

    els.stage.innerHTML = questionMarkup(part, q, 'prep');
    if (part.cues && part.cues.prep) await speak(part.cues.prep, 'narrator');
    if (token !== runToken) throw ABORT;

    await countdown(q.prepSeconds, '준비', token);
    if (token !== runToken) throw ABORT;

    if (part.cues && part.cues.start) await speak(part.cues.start, 'narrator');
    if (token !== runToken) throw ABORT;

    // 안내 음성이 끝난 뒤 삑 소리와 함께 응답 화면으로 전환한다.
    beep('go');
    await wait(200, token);
    els.stage.innerHTML = questionMarkup(part, q, 'respond');
    await startRecording(q.no);
    await countdown(q.responseSeconds, '응답', token, 'respond');
    await stopRecording();
  }

  async function startExam() {
    const exam = currentExam;
    if (!exam || starting) return;
    starting = true;

    try {
      if (window.SpeechVoice) {
        await window.SpeechVoice.load();
        examVoices = window.SpeechVoice.examPair();
      }
    } finally {
      starting = false;
    }
    beep('go');

    cleanupMic();
    revokeReportAudio();
    testAudioBlobs.clear();
    recordingNo = 0;
    scoring.token += 1;
    scoring = { running: false, done: false, error: null, results: {}, raw: {}, summary: null, token: scoring.token };

    const token = ++runToken;
    attempt = {
      id: uid(),
      examId: exam.id,
      at: new Date().toISOString(),
      startedAt: Date.now(),
      seconds: 0,
      total: totalQuestions(),
      ratings: {},
    };

    mountExam();
    holdExamLock();
    document.title = `${exam.title} · 진행 중`;

    try {
      const plan = buildPlan(exam);
      for (const step of plan) {
        if (token !== runToken) return;
        if (step.kind === 'intro') { await runIntro(step, token); await wait(350, token); }
        else if (step.kind === 'context') await runContext(step, token);
        else if (step.kind === 'reading') await runReading(step, token);
        else await runQuestion(step, token);
      }
      if (token !== runToken) return;
      finishExam();
    } catch (error) {
      if (error !== ABORT) console.error(error);
    }
  }

  function finishExam() {
    if (!attempt) return;
    runToken += 1;
    releaseExamLock();
    stopSpeech();
    attempt.seconds = Math.round((Date.now() - attempt.startedAt) / 1000);
    attempt.finishedAt = new Date().toISOString();
    attempt.saved = upsertAttempt(attempt);
    const canScore = recordingEnabled && (TEST_AUDIO || recorderSupported()) && scoreModulesReady();
    scoring.token += 1;
    scoring = {
      running: canScore,
      done: false,
      error: canScore ? null : (recordingEnabled && recorderSupported() ? 'unavailable' : 'no-recording'),
      results: {},
      raw: {},
      summary: null,
      token: scoring.token,
    };
    beep('end');
    paintDone();
    const heading = root.querySelector('.ex-h1');
    if (heading) heading.focus();
    if (canScore) runScoring(attempt);
    if (!TEST_AUDIO && window.SpeakingRecorder && typeof window.SpeakingRecorder.prune === 'function') {
      try {
        const pruned = window.SpeakingRecorder.prune(10);
        if (pruned && typeof pruned.catch === 'function') pruned.catch(() => {});
      } catch (error) { /* noop */ }
    }
  }

  function quitExam() {
    if (!attempt) return;
    const ok = window.confirm('응시를 중단할까요? 지금까지의 기록은 저장되지 않습니다.');
    if (!ok) return;
    runToken += 1;
    releaseExamLock();
    stopSpeech();
    attempt = null;
    paintHome();
  }

  // ---------- 결과 ----------
  function paintDone() {
    document.body.classList.remove('ex-locked');
    if (!attempt) return;
    const exam = currentExam;
    document.title = `${exam.title} 완료 · 스피킹 루틴`;
    const hasScores = Boolean(attempt.scores && Object.keys(attempt.scores).length);
    if (scoring.running || hasScores || attempt.summary) paintReport();
    else paintLegacyDone();
    paintRatings();
  }

  function paintLegacyDone() {
    const exam = currentExam;
    const rows = exam.parts.flatMap((part) => part.questions.map((q) => `
      <div class="ex-row">
        <span class="ex-row-no">Q${q.no}</span>
        <span class="ex-row-label">${esc(KIND_LABEL[part.part] || '')}</span>
        <span class="ex-ratings" data-no="${q.no}">
          <button type="button" data-act="rate" data-no="${q.no}" data-value="good" aria-pressed="false">좋음</button>
          <button type="button" data-act="rate" data-no="${q.no}" data-value="ok" aria-pressed="false">보통</button>
          <button type="button" data-act="rate" data-no="${q.no}" data-value="weak" aria-pressed="false">아쉬움</button>
        </span>
      </div>`)).join('');

    const previous = loadStore().attempts.find((item) => item.id !== attempt.id);
    const delta = previous ? (attempt.seconds || 0) - (previous.seconds || 0) : null;
    const prevLine = previous
      ? `<p class="ex-compare">지난 응시 ${esc(formatWhen(previous.at))} · ${fmtClock(previous.seconds)}${
        delta === null || !attempt.seconds || !previous.seconds
          ? ''
          : ` · <b>${delta <= 0 ? '지난 응시보다 ' + fmtClock(Math.abs(delta)) + ' 빠름' : '지난 응시보다 ' + fmtClock(delta) + ' 느림'}</b>`
      }</p>`
      : '';

    const canRetry = recordingEnabled && (TEST_AUDIO || recorderSupported()) && scoreModulesReady();
    const statusText = (!recordingEnabled || scoring.error === 'no-recording')
      ? '녹음 없이 진행해서 자기평가만 저장됩니다.'
      : (scoring.error
        ? '채점을 마치지 못했어요. 자기평가만 저장됩니다.'
        : (!scoreModulesReady() ? '채점 모듈을 불러오지 못했어요. 자기평가만 저장됩니다.' : '녹음이 준비되어 있어요.'));
    const status = `<div class="score-status">
      <p>${statusText}</p>
      ${canRetry ? `<button class="ex-btn ghost sm" data-act="score-now" type="button">${scoring.error ? '다시 채점' : '채점하기'}</button>` : ''}
    </div>`;

    root.innerHTML = `
      <div class="ex-done">
        <div class="ex-wrap">
          <div class="ex-done-head">
            <h1 class="ex-h1" tabindex="-1">${esc(exam.title)} 완료</h1>
            <p class="ex-sub">소요 시간은 지난 응시와 비교되고, 문항별 자기평가는 이 기기에 남습니다.</p>
          </div>

          <div class="ex-stats">
            <div class="ex-stat"><b>${attempt.total}</b><span>문항</span></div>
            <div class="ex-stat"><b>${fmtClock(attempt.seconds)}</b><span>소요 시간</span></div>
            <div class="ex-stat"><b>5</b><span>파트</span></div>
          </div>
          ${prevLine}
          ${status}

          <div class="ex-review">${rows}</div>

          <p class="ex-note" id="ex-save-state">${attempt.saved === false
            ? '기록을 저장하지 못했습니다. 저장 공간을 확인해 주세요.'
            : '자기평가는 이 기기에만 저장됩니다.'}</p>

          <div class="ex-actions">
            <button class="ex-btn" data-act="retry" type="button">다시 보기</button>
            <a class="ex-btn ghost" href="index.html">학습으로 돌아가기</a>
          </div>
        </div>
      </div>`;
  }

  function paintReport() {
    revokeReportAudio();
    const active = document.activeElement;
    const restoreAct = active && active.getAttribute ? active.getAttribute('data-act') : '';
    const restoreNo = active && active.getAttribute ? active.getAttribute('data-no') : '';
    const exam = currentExam;
    const items = allQuestions(exam);
    const scores = attempt.scores || {};
    const summary = attempt.summary || null;
    const estimate = attempt.estimate || (summary && summary.estimate) || null;
    const parts = partAverages(attempt, summary, items);
    const insight = (summary && ((summary.strengths && summary.strengths.length) || (summary.weaknesses && summary.weaknesses.length)))
      ? summary
      : fallbackInsights(scores, items);
    const rated = Object.keys(attempt.ratings || {}).length;

    root.innerHTML = `
      <div class="ex-done ex-report">
        <div class="ex-wrap">
          <div class="report-head">
            <h1 class="ex-h1" tabindex="-1">${esc(exam.title)} 완료</h1>
            <p class="ex-sub">기기 안에서 계산한 추정 결과예요. 자기평가는 그대로 남겨 두었어요.</p>
            <p class="report-meta">${attempt.total}문항 · ${fmtClock(attempt.seconds)} · 5파트 · 자기평가 ${rated}/${attempt.total}${attempt.saved === false ? ' · 저장하지 못했어요' : ''}</p>
          </div>
          ${scoringBanner()}
          <div class="report-hero">
            ${scoreArc(estimate)}
            <div class="report-side">
              <h2 class="report-title">Part별 평균</h2>
              <div class="part-bars">${parts.map(renderPartBar).join('')}</div>
            </div>
          </div>
          <div class="insights">
            ${insightCard('강점', insight.strengths || [], '아직 강점을 계산하는 중이에요.')}
            ${insightCard('보완점', insight.weaknesses || [], '채점이 끝나면 보완점이 표시됩니다.')}
          </div>
          <div class="qcards">${items.map((item) => renderQCard(item, scores[item.q.no])).join('')}</div>
          <p class="report-disclaimer">기기 안에서 음성 인식으로 계산한 추정치예요. 실제 ETS 채점과 다를 수 있어요.</p>
          <div class="ex-actions">
            <button class="ex-btn" data-act="retry" type="button">다시 보기</button>
            <a class="ex-btn ghost" href="index.html">학습으로 돌아가기</a>
          </div>
        </div>
      </div>`;

    loadReportAudio(attempt.id, items);
    if (restoreAct === 'rate' || restoreAct === 'note-toggle' || restoreAct === 'speak-model') {
      const restored = restoreNo
        ? root.querySelector(`[data-act="${restoreAct}"][data-no="${restoreNo}"]`)
        : root.querySelector(`[data-act="${restoreAct}"]`);
      if (restored) restored.focus();
    }
  }

  function scoringBanner() {
    const total = attempt.total || totalQuestions();
    const scored = Object.keys(attempt.scores || {}).length;
    if (scoring.running) {
      const pct = total ? Math.round((scored / total) * 100) : 0;
      return `<div class="scoring-banner" id="scoring-banner" role="status" aria-live="polite">
        <div class="scoring-label" id="scoring-label">${scored ? `음성 인식 중 Q${scored} / ${total}` : '음성 인식 모델 준비 중…'}</div>
        <div class="scoring-track"><i id="scoring-fill" style="width:${pct}%"></i></div>
        <p class="scoring-sub" id="scoring-sub">${scored ? '문항이 끝나는 대로 카드에 점수가 채워져요.' : '처음 한 번만 모델을 준비해요.'}</p>
      </div>`;
    }
    if (scoring.error) {
      const text = scoring.error === 'no-recording'
        ? '녹음이 없어 채점하지 못했어요. 자기평가만 저장됩니다.'
        : '채점을 불러오지 못했어요. 자기평가만 저장됩니다.';
      const retry = recordingEnabled && scoreModulesReady()
        ? '<button class="ex-btn ghost sm" data-act="score-now" type="button">다시 채점</button>'
        : '';
      return `<div class="scoring-banner error">
        <div class="scoring-label">채점을 마치지 못했어요</div>
        <p class="scoring-sub">${text}</p>${retry}
      </div>`;
    }
    if (scoring.done) {
      return '<div class="scoring-banner done"><div class="scoring-label">채점 완료</div><p class="scoring-sub">추정 점수는 참고용이에요.</p></div>';
    }
    return '';
  }

  function scoreArc(estimate) {
    const scaled = estimate && Number.isFinite(Number(estimate.scaled))
      ? Math.max(0, Math.min(200, Math.round(Number(estimate.scaled))))
      : null;
    const level = estimate && estimate.level ? estimate.level : (scaled === null ? '—' : levelFromScaled(scaled));
    const pct = scaled === null ? 0 : (scaled / 200) * 100;
    const label = scaled === null ? '채점 중' : `${scaled}점 ${level}`;
    const arcLength = 276.46;
    const dash = (arcLength * pct / 100).toFixed(1);
    return `<div class="score-arc" role="img" aria-label="추정 점수 ${label}">
      <svg viewBox="0 0 220 132" aria-hidden="true">
        <path class="arc-bg" d="M 22 116 A 88 88 0 0 1 198 116" />
        <path class="arc-fg" d="M 22 116 A 88 88 0 0 1 198 116" stroke-dasharray="${dash} ${arcLength}" />
      </svg>
      <div class="arc-copy">
        <strong>${scaled === null ? '—' : scaled}</strong>
        <span>${scaled === null ? '채점 중' : level}</span>
        <small>추정 / 200</small>
      </div>
    </div>`;
  }

  function partAverages(current, summary, items) {
    const raw = summary && summary.partAverages;
    const pick = (part) => {
      if (Array.isArray(raw)) return raw[part - 1];
      if (raw && typeof raw === 'object') return raw[part] ?? raw[`part${part}`] ?? raw[String(part)];
      return null;
    };
    return [1, 2, 3, 4, 5].map((part) => {
      const max = part === 5 ? 5 : 3;
      const picked = pick(part);
      let avg = picked === null || picked === undefined || picked === '' ? NaN : Number(picked);
      if (!Number.isFinite(avg)) {
        const values = items
          .filter((item) => item.part.part === part && current.scores && current.scores[item.q.no])
          .map((item) => Number(current.scores[item.q.no].score))
          .filter((value) => Number.isFinite(value));
        avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      }
      return { part, avg, max };
    });
  }

  function renderPartBar(row) {
    const pct = row.avg === null ? 0 : Math.max(0, Math.min(100, (row.avg / row.max) * 100));
    return `<div class="part-bar">
      <span class="part-name">Part ${row.part}</span>
      <span class="part-track"><i style="width:${pct}%"></i></span>
      <span class="part-val">${row.avg === null ? '—' : row.avg.toFixed(1)} / ${row.max}</span>
    </div>`;
  }

  function insightCard(title, items, empty) {
    const labels = {
      pron: '발음', inton: '억양·강세', grammar: '문법', vocab: '어휘',
      cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    };
    const human = (item) => {
      const key = String(item || '');
      if (!labels[key]) return item;
      const label = labels[key];
      const code = label.charCodeAt(label.length - 1);
      const batchim = code >= 0xAC00 && code <= 0xD7A3 && (code - 0xAC00) % 28 !== 0;
      return title === '강점'
        ? `${label}${batchim ? '이' : '가'} 안정적이에요`
        : `${label}${batchim ? '을' : '를'} 보완해 보세요`;
    };
    const list = Array.isArray(items) ? items.filter(Boolean).slice(0, 2) : [];
    return `<section class="insight">
      <h2>${title}</h2>
      ${list.length ? `<ul>${list.map((item) => `<li>${esc(human(item))}</li>`).join('')}</ul>` : `<p class="qa-empty">${esc(empty)}</p>`}
    </section>`;
  }

  function fallbackInsights(scores, items) {
    const labels = {
      pron: '발음', inton: '억양·강세', grammar: '문법', vocab: '어휘',
      cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    };
    const totals = {};
    items.forEach((item) => {
      const result = scores[item.q.no];
      if (!result || !result.criteria) return;
      Object.entries(result.criteria).forEach(([key, value]) => {
        if (!labels[key] || value === null || value === undefined || value === '') return;
        const number = Number(value);
        if (!Number.isFinite(number)) return;
        if (!totals[key]) totals[key] = { total: 0, count: 0 };
        totals[key].total += number;
        totals[key].count += 1;
      });
    });
    const entries = Object.entries(totals)
      .map(([key, value]) => ({ label: labels[key], value: value.total / value.count }))
      .sort((a, b) => b.value - a.value);
    if (!entries.length) return { strengths: [], weaknesses: [] };
    const take = entries.length >= 4 ? 2 : 1;
    return {
      strengths: entries.slice(0, take).map((entry) => `${entry.label} ${entry.value.toFixed(1)}`),
      weaknesses: entries.slice(-take).reverse().map((entry) => `${entry.label} ${entry.value.toFixed(1)}`),
    };
  }

  function allQuestions(exam) {
    if (!exam) return [];
    return exam.parts.flatMap((part) => part.questions.map((q) => ({ part, q })));
  }

  function findQuestion(exam, no) {
    if (!exam) return null;
    for (const part of exam.parts) {
      const q = part.questions.find((item) => item.no === Number(no));
      if (q) return { part, q };
    }
    return null;
  }

  function questionByNo(no, exam = currentExam) {
    return findQuestion(exam, no);
  }

  function renderQCard(item, result) {
    const part = item.part;
    const q = item.q;
    const max = part.part === 5 ? 5 : 3;
    const score = result && !result.pending && !result.noRecording && !result.unavailable && Number.isFinite(Number(result.score))
      ? result.score
      : null;
    return `<article class="qcard${result ? ' scored' : ''}" id="qcard-${q.no}" data-no="${q.no}">
      <div class="qcard-head">
        <span class="qcard-no">Q${q.no}</span>
        <span class="qcard-kind">${esc(KIND_LABEL[part.part] || '')}</span>
        <span class="qcard-score">${score === null ? '—' : `${score}/${max}`}</span>
        ${noteStar(q.no)}
      </div>
      <div class="qcard-body">${renderScoreBody(part, q, result, `qa-audio-${q.no}`)}</div>
      <div class="qcard-foot">
        <span class="qcard-foot-label">내 평가</span>
        ${ratingButtons(q.no)}
      </div>
    </article>`;
  }

  function ratingButtons(no) {
    return `<span class="ex-ratings" data-no="${no}">
      <button type="button" data-act="rate" data-no="${no}" data-value="good" aria-pressed="false">좋음</button>
      <button type="button" data-act="rate" data-no="${no}" data-value="ok" aria-pressed="false">보통</button>
      <button type="button" data-act="rate" data-no="${no}" data-value="weak" aria-pressed="false">아쉬움</button>
    </span>`;
  }

  function renderScoreBody(part, q, result, audioId) {
    if (!result) {
      const message = scoring.running
        ? '채점 중…'
        : (scoring.error === 'no-recording' ? '녹음이 없어 채점하지 못했어요.' : '채점 결과가 없어요.');
      return `<p class="qa-empty">${message}</p>`;
    }
    if (result.pending) return '<p class="qa-empty">채점 중…</p>';
    if (result.noRecording) return '<p class="qa-empty">녹음이 없어 이 문항은 채점하지 못했어요.</p>';
    if (result.unavailable) return '<p class="qa-empty">채점 모듈을 불러오지 못해 이 문항은 채점하지 못했어요.</p>';
    if (result.silent) {
      return `<div class="qa-section silent">
        <p class="qa-label">녹음 확인</p>
        <p class="qa-text">${SILENT_FEEDBACK}</p>
      </div>
      <div class="qa-tools">
        <div class="qcard-audio" id="${audioId}"><span class="qa-empty">내 녹음 불러오는 중…</span></div>
      </div>`;
    }

    const criteria = renderCriteria(result, part);
    const text = result.text || '';
    const display = part.part === 1 ? highlightMissed(text, result.missedWords) : esc(text);
    const missed = part.part === 1 && Array.isArray(result.missedWords) && result.missedWords.length
      ? renderMissed(result.missedWords)
      : '';
    const coverage = renderCoverage(part, q, result);
    const feedback = Array.isArray(result.feedback) && result.feedback.length
      ? `<div class="qa-section"><p class="qa-label">피드백</p><ul class="qa-feedback">${result.feedback.slice(0, 4).map((line) => `<li>${esc(line)}</li>`).join('')}</ul></div>`
      : '';
    const model = modelText(part, q);

    return `${criteria}
      <div class="qa-section">
        <p class="qa-label">내 답변</p>
        <p class="qa-text">${display || '<span class="qa-empty">인식된 문장이 없어요.</span>'}</p>
      </div>
      ${missed}
      ${coverage}
      ${feedback}
      <div class="qa-tools">
        <div class="qcard-audio" id="${audioId}"><span class="qa-empty">내 녹음 불러오는 중…</span></div>
        ${model ? `<button class="ex-btn ghost sm" type="button" data-act="speak-model" data-no="${q.no}">모범 답안 듣기</button>` : ''}
      </div>`;
  }

  function renderCriteria(result, part) {
    const labels = {
      pron: '발음', inton: '억양·강세', grammar: '문법', vocab: '어휘',
      cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    };
    const order = ['pron', 'inton', 'grammar', 'vocab', 'cohesion', 'relevance', 'completeness'];
    const allowed = part.part === 1
      ? ['pron', 'inton']
      : (part.part === 2
        ? ['pron', 'inton', 'grammar', 'vocab', 'cohesion']
        : order);
    const max = 3;
    const criteria = result.criteria || {};
    const chips = order
      .filter((key) => allowed.includes(key))
      .map((key) => {
        const raw = criteria[key];
        if (raw === null || raw === undefined || raw === '') {
          return `<span class="crit na">${labels[key]} <b>—</b></span>`;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) {
          return `<span class="crit na">${labels[key]} <b>—</b></span>`;
        }
        const ratio = value / max;
        const cls = ratio >= 0.8 ? 'good' : (ratio >= 0.5 ? 'mid' : 'low');
        return `<span class="crit ${cls}">${labels[key]} <b>${value}</b></span>`;
      });
    return chips.length ? `<div class="criteria">${chips.join('')}</div>` : '';
  }

  function factKey(value) {
    let text = String(value || '').toLowerCase().replace(/[’']/g, "'");
    text = text
      .replace(/\b(january|jan)\b/g, 'jan')
      .replace(/\b(february|feb)\b/g, 'feb')
      .replace(/\b(march|mar)\b/g, 'mar')
      .replace(/\b(april|apr)\b/g, 'apr')
      .replace(/\b(may)\b/g, 'may')
      .replace(/\b(june|jun)\b/g, 'jun')
      .replace(/\b(july|jul)\b/g, 'jul')
      .replace(/\b(august|aug)\b/g, 'aug')
      .replace(/\b(september|sept|sep)\b/g, 'sep')
      .replace(/\b(october|oct)\b/g, 'oct')
      .replace(/\b(november|nov)\b/g, 'nov')
      .replace(/\b(december|dec)\b/g, 'dec')
      .replace(/\ba\.?m\.?\b/g, 'am')
      .replace(/\bp\.?m\.?\b/g, 'pm');
    return text.replace(/[^a-z0-9]/g, '');
  }

  function factCandidates(part, q) {
    const out = [];
    const add = (text, source) => {
      const original = String(text || '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^[\s"'“”‘’]+|[\s"'“”‘’]+$/g, '')
        .replace(/[:;]+$/, '')
        .trim();
      if (!original) return;
      const key = factKey(original);
      if (!key) return;
      out.push({ original, key, source });
    };
    const addNgrams = (text, source, max) => {
      const words = String(text || '').split(/\s+/).filter(Boolean);
      for (let size = 1; size <= max; size += 1) {
        for (let start = 0; start + size <= words.length; start += 1) {
          add(words.slice(start, start + size).join(' '), source);
        }
      }
    };
    if (q.answerKey) addNgrams(q.answerKey, 'answer', 6);
    const rows = part && Array.isArray(part.table) ? part.table : [];
    rows.forEach((row) => {
      if (!Array.isArray(row)) return;
      row.forEach((cell) => {
        if (!cell) return;
        add(cell, 'table');
        addNgrams(cell, 'table', 5);
      });
    });
    return out;
  }

  function originalFact(value, part, q, candidates) {
    const raw = String(value || '').trim();
    const key = factKey(raw);
    if (!key) return raw;
    const list = candidates || factCandidates(part, q);
    const exact = list.filter((item) => item.key === key);
    if (exact.length) {
      exact.sort((a, b) => a.original.length - b.original.length || (a.source === 'table' ? -1 : 1));
      return exact[0].original;
    }
    if (key.length >= 3) {
      const partial = list.filter((item) => item.key.length >= 3 && (item.key.includes(key) || key.includes(item.key)));
      if (partial.length) {
        partial.sort((a, b) => Math.abs(a.original.length - raw.length) - Math.abs(b.original.length - raw.length)
          || (a.source === 'table' ? -1 : 1));
        return partial[0].original;
      }
    }
    return raw;
  }

  function renderCoverage(part, q, result) {
    const normalize = (value) => String(value || '').trim().toLowerCase();
    if (part.part === 2) {
      const elements = Array.isArray(q.keyElements) ? q.keyElements : [];
      if (!elements.length) return '';
      const covered = new Set((Array.isArray(result.covered) ? result.covered : []).map(normalize));
      const chips = elements.map((element) => {
        const key = normalize(element);
        const hit = covered.has(key) || Array.from(covered).some((item) => item.includes(key) || key.includes(item));
        return `<span class="coverage-chip ${hit ? 'ok' : 'miss'}">${esc(element)} <b>${hit ? '✓' : '—'}</b></span>`;
      }).join('');
      return `<div class="qa-section"><p class="qa-label">핵심 요소</p><div class="coverage">${chips}</div></div>`;
    }
    if (part.part === 4) {
      const covered = Array.isArray(result.covered) ? result.covered : [];
      const wrong = Array.isArray(result.wrongFacts) ? result.wrongFacts : [];
      const candidates = factCandidates(part, q);
      const chips = covered.map((item) => `<span class="coverage-chip ok">${esc(originalFact(item, part, q, candidates))} <b>✓</b></span>`)
        .concat(wrong.map((item) => `<span class="coverage-chip wrong">${esc(originalFact(item, part, q, candidates))} <b>✗</b></span>`))
        .join('');
      const answer = q.answerKey
        ? `<details class="qa-answer"><summary>정답 정보</summary><p>${esc(q.answerKey)}</p></details>`
        : '';
      if (!chips && !answer) return '';
      return `<div class="qa-section"><p class="qa-label">정답 정보</p>${chips ? `<div class="coverage">${chips}</div>` : ''}${answer}</div>`;
    }
    return '';
  }

  function renderMissed(missed) {
    const stop = new Set([
      'a', 'an', 'the', 'to', 'of', 'and', 'in', 'on', 'at', 'it', 'is', 'are', 'was', 'were',
      'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our', 'their', 'for',
      'with', 'as', 'that', 'this', 'be', 'been', 'do', 'does', 'did', 'so', 'but', 'or', 'if',
      'from', 'by', 'not', 'have', 'has', 'had', 'will', 'would', 'can', 'could', 'should',
      'may', 'might', 'me', 'him', 'us', 'them', 'its', 'there', 'here', 'what', 'when',
      'where', 'who', 'how', 'why', 'all', 'just', 'very', 'too', 'also', 'than', 'then',
      'into', 'over', 'under', 'about', 'up', 'down', 'out', 'off', 'no', 'yes',
    ]);
    const content = missed.filter((word) => {
      const key = String(word).trim().toLowerCase().replace(/[^a-z']/g, '');
      return key.length > 3 && !stop.has(key);
    });
    const list = (content.length ? content : missed).slice(0, 8);
    return `<div class="qa-section missed">
      <p class="qa-label">놓친 단어 <span>${missed.length}개 중 ${list.length}개</span></p>
      <div class="missed-list">${list.map((word) => `<button class="missed-word" type="button" data-act="speak-word" data-word="${esc(word)}">${esc(word)}<span aria-hidden="true"> ▶</span></button>`).join('')}</div>
    </div>`;
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightMissed(text, missed) {
    const words = (Array.isArray(missed) ? missed : [])
      .map((word) => String(word || '').trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    if (!words.length || !text) return esc(text || '');
    const pattern = new RegExp(`\\b(${words.map(escapeRegExp).join('|')})\\b`, 'gi');
    let out = '';
    let last = 0;
    let match = pattern.exec(text);
    while (match) {
      out += esc(text.slice(last, match.index));
      out += `<mark class="missed">${esc(match[0])}</mark>`;
      last = match.index + match[0].length;
      if (pattern.lastIndex === match.index) pattern.lastIndex += 1;
      match = pattern.exec(text);
    }
    return out + esc(text.slice(last));
  }

  function noteStar(no) {
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    const on = NOTES ? NOTES.has(examId, no) : false;
    return `<button class="note-star" type="button" data-act="note-toggle" data-no="${no}" aria-pressed="${on}" aria-label="${on ? '마이노트에서 빼기' : '마이노트에 추가'}" title="마이노트">${on ? '★' : '☆'}</button>`;
  }

  function paintStar(no) {
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    const on = NOTES ? NOTES.has(examId, no) : false;
    root.querySelectorAll(`[data-act="note-toggle"][data-no="${no}"]`).forEach((button) => {
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.setAttribute('aria-label', on ? '마이노트에서 빼기' : '마이노트에 추가');
      button.textContent = on ? '★' : '☆';
    });
  }

  function toggleNote(no) {
    if (!NOTES) return;
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    if (NOTES.has(examId, no)) {
      NOTES.remove(examId, no);
    } else {
      const result = attempt && attempt.scores
        ? attempt.scores[no]
        : (practiceScores[no] && !practiceScores[no].pending ? practiceScores[no] : null);
      NOTES.add({ examId, no, source: 'manual', lastScore: result && Number.isFinite(Number(result.score)) ? result.score : null });
    }
    paintStar(no);
  }

  function autoNote(part, q, result) {
    if (!NOTES || !result || result.pending || result.unavailable || result.noRecording) return;
    const score = Number(result.score);
    if (!Number.isFinite(score)) return;
    const threshold = part.part === 5 ? 2 : 1;
    if (score > threshold) return;
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    NOTES.add({ examId, no: q.no, source: 'auto', lastScore: score });
    paintStar(q.no);
  }

  function modelText(part, q) {
    if (part.part === 1) return q.text || '';
    const entry = guideEntry(q);
    return entry && entry.model ? entry.model : '';
  }

  function speakModel(no) {
    const found = questionByNo(no);
    if (!found) return;
    const text = modelText(found.part, found.q);
    if (text) speak(text, 'narrator');
  }

  async function loadReportAudio(attemptId, items) {
    for (const item of items) {
      const record = await getRecording(attemptId, item.q.no);
      const slot = document.getElementById(`qa-audio-${item.q.no}`);
      if (!slot) continue;
      if (!record) {
        slot.innerHTML = '<span class="qa-empty">녹음 없음</span>';
        continue;
      }
      const blob = record.blob || record;
      if (!(blob instanceof Blob) || !blob.size) {
        slot.innerHTML = '<span class="qa-empty">녹음 없음</span>';
        continue;
      }
      const url = URL.createObjectURL(blob);
      reportAudioUrls.push(url);
      slot.innerHTML = `<audio controls preload="none" src="${url}" aria-label="내 녹음"></audio>`;
    }
  }

  function normalizeProgress(value) {
    if (typeof value === 'number') {
      return Math.max(0, Math.min(1, value > 1 ? value / 100 : value));
    }
    if (value && typeof value === 'object') {
      if (Number.isFinite(Number(value.progress))) {
        const number = Number(value.progress);
        return Math.max(0, Math.min(1, number > 1 ? number / 100 : number));
      }
      if (Number.isFinite(Number(value.percent))) {
        return Math.max(0, Math.min(1, Number(value.percent) / 100));
      }
      if (Number.isFinite(Number(value.loaded)) && Number.isFinite(Number(value.total)) && Number(value.total) > 0) {
        return Math.max(0, Math.min(1, Number(value.loaded) / Number(value.total)));
      }
    }
    return 0;
  }

  function updateScoring(kind, progress, current, total) {
    const label = document.getElementById('scoring-label');
    const fill = document.getElementById('scoring-fill');
    const sub = document.getElementById('scoring-sub');
    if (!label) return;
    if (kind === 'model') {
      const pct = Math.round(normalizeProgress(progress) * 100);
      label.textContent = pct > 0 ? `음성 인식 모델 준비 중… ${pct}%` : '음성 인식 모델 준비 중…';
      if (fill) fill.style.width = `${pct}%`;
      if (sub) sub.textContent = '처음 한 번만 내려받아 기기에 저장해요.';
      return;
    }
    const pct = total ? Math.round((current / total) * 100) : 0;
    label.textContent = `음성 인식 중 Q${current} / ${total}`;
    if (fill) fill.style.width = `${pct}%`;
    if (sub) sub.textContent = '문항이 끝나는 대로 카드에 점수가 채워져요.';
  }

  function updateScoreCard(no) {
    if (!attempt || !attempt.scores || !attempt.scores[no]) return;
    const card = document.getElementById(`qcard-${no}`);
    const found = questionByNo(no);
    if (!card || !found) return;
    const body = card.querySelector('.qcard-body');
    if (body) body.innerHTML = renderScoreBody(found.part, found.q, attempt.scores[no], `qa-audio-${no}`);
    const score = card.querySelector('.qcard-score');
    const result = attempt.scores[no];
    if (score) {
      score.textContent = result.pending || result.noRecording || result.unavailable
        ? '—'
        : `${result.score}/${result.max}`;
    }
    card.classList.add('scored');
    paintStar(no);
  }

  async function runScoring(current) {
    if (!current) return;
    const stt = window.SpeakingSTT;
    const scorer = window.SpeakingScore;
    if (!stt || !scorer) {
      scoring.running = false;
      scoring.error = 'unavailable';
      paintDone();
      return;
    }
    const token = ++scoring.token;
    const exam = currentExam;
    const items = allQuestions(exam);
    scoring.results = {};
    scoring.raw = {};
    try {
      await stt.ensureModel((progress) => {
        if (token !== scoring.token) return;
        updateScoring('model', progress);
      });
      for (let index = 0; index < items.length; index += 1) {
        if (token !== scoring.token || attempt !== current) return;
        const item = items[index];
        const q = item.q;
        updateScoring('question', 0, index + 1, items.length);
        const record = await getRecording(current.id, q.no);
        if (!record || !(record.blob instanceof Blob) || !record.blob.size) {
          const missing = {
            score: 0,
            max: item.part.part === 5 ? 5 : 3,
            criteria: {},
            feedback: ['녹음이 없어 이 문항은 채점하지 못했어요.'],
            text: '',
            missedWords: [],
            covered: [],
            wrongFacts: [],
            noRecording: true,
          };
          current.scores = Object.assign({}, current.scores, { [q.no]: missing });
          scoring.results[q.no] = missing;
          current.saved = upsertAttempt(current);
          updateScoreCard(q.no);
          continue;
        }
        const metrics = await analyzeRecording(record.blob);
        if (isSilentMetrics(metrics)) {
          const silent = silentResult(q);
          if (!silent) throw new Error('채점 결과를 만들지 못했어요.');
          current.scores = Object.assign({}, current.scores, { [q.no]: silent });
          scoring.results[q.no] = silent;
          scoring.raw[q.no] = { text: '', words: undefined, metrics };
          current.saved = upsertAttempt(current);
          autoNote(item.part, q, silent);
          updateScoreCard(q.no);
          continue;
        }
        const tr = await stt.transcribe(record.blob);
        const text = String((typeof tr === 'string' ? tr : (tr && tr.text)) || '').trim();
        const words = tr && Array.isArray(tr.words) ? tr.words : undefined;
        const value = scorer.gradeQuestion({
          exam,
          no: q.no,
          text,
          words: Array.isArray(words) ? words.length : undefined,
          metrics,
          delivery: deliveryFor(metrics),
        });
        const result = normalizeScore(value, q);
        if (!result) throw new Error('채점 결과를 만들지 못했어요.');
        if (!result.text) result.text = text;
        current.scores = Object.assign({}, current.scores, { [q.no]: result });
        scoring.results[q.no] = result;
        scoring.raw[q.no] = { text, words, metrics };
        current.saved = upsertAttempt(current);
        autoNote(item.part, q, result);
        updateScoreCard(q.no);
      }
      if (token !== scoring.token || attempt !== current) return;
      const metricsMap = {};
      Object.keys(scoring.raw).forEach((key) => {
        if (scoring.raw[key] && scoring.raw[key].metrics) metricsMap[key] = scoring.raw[key].metrics;
      });
      let rawSummary = null;
      try {
        rawSummary = scorer.gradeAttempt({
          exam,
          responses: buildResponses(items, scoring.raw),
          metrics: metricsMap,
          delivery: '보통',
        });
      } catch (error) {
        rawSummary = null;
      }
      const fallback = fallbackSummary(current.scores || {}, items);
      const estimate = (rawSummary && rawSummary.estimate) || fallback.estimate;
      const rawParts = rawSummary && rawSummary.partAverages;
      const partPoints = [1, 2, 3, 4, 5].map((part) => {
        const value = rawParts && (rawParts[part] ?? rawParts[String(part)] ?? rawParts[`part${part}`]);
        const number = Number(value);
        return Number.isFinite(number) ? number * (part === 5 ? 5 : 3) : null;
      });
      const useRawParts = partPoints.some((value) => value !== null);
      current.estimate = estimate;
      current.summary = normalizeSummary({
        estimate,
        partAverages: useRawParts ? partPoints : fallback.partAverages,
        strengths: (rawSummary && rawSummary.strengths) || fallback.strengths,
        weaknesses: (rawSummary && rawSummary.weaknesses) || fallback.weaknesses,
      }) || {
        estimate,
        partAverages: fallback.partAverages,
        strengths: fallback.strengths,
        weaknesses: fallback.weaknesses,
      };
      current.saved = upsertAttempt(current);
      if (token !== scoring.token || attempt !== current) return;
      scoring.running = false;
      scoring.done = true;
      paintDone();
    } catch (error) {
      if (token !== scoring.token || attempt !== current) return;
      scoring.running = false;
      scoring.error = (error && error.message) || 'score-failed';
      paintDone();
    }
  }

  function buildResponses(items, raw) {
    const responses = {};
    items.forEach((item) => {
      const entry = raw[item.q.no];
      if (!entry) return;
      responses[item.q.no] = { no: item.q.no, text: entry.text, words: entry.words, metrics: entry.metrics };
    });
    return responses;
  }

  function estimateFromScores(scores, items) {
    let sum = 0;
    items.forEach((item) => {
      const result = scores[item.q.no];
      const max = item.part.part === 5 ? 5 : 3;
      const score = result && Number.isFinite(Number(result.score)) ? Number(result.score) : 0;
      sum += item.part.part === 5 ? 2 * (score / max) : score / max;
    });
    const pct = sum / 12;
    const scaled = Math.max(0, Math.min(200, 10 * Math.round(20 * pct)));
    return { scaled, level: levelFromScaled(scaled) };
  }

  function fallbackSummary(scores, items) {
    const parts = [1, 2, 3, 4, 5].map((part) => {
      const values = items
        .filter((item) => item.part.part === part && scores[item.q.no])
        .map((item) => Number(scores[item.q.no].score))
        .filter((value) => Number.isFinite(value));
      const avg = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
      return { part, avg, max: part === 5 ? 5 : 3 };
    });
    const insights = fallbackInsights(scores, items);
    return {
      estimate: estimateFromScores(scores, items),
      partAverages: parts.map((row) => row.avg),
      strengths: insights.strengths,
      weaknesses: insights.weaknesses,
    };
  }

  function levelFromScaled(scaled) {
    if (scaled >= 200) return 'AH';
    if (scaled >= 180) return 'AM';
    if (scaled >= 160) return 'AL';
    if (scaled >= 140) return 'IH';
    if (scaled >= 130) return 'IM3';
    if (scaled >= 120) return 'IM2';
    if (scaled >= 110) return 'IM1';
    if (scaled >= 90) return 'IL';
    if (scaled >= 60) return 'NH';
    if (scaled >= 40) return 'NM';
    return 'NL';
  }

  // ---------- v34: 마이노트 ----------
  function paintNotes() {
    document.body.classList.remove('ex-locked');
    cleanupMic();
    stopSpeech();
    revokeReportAudio();
    scoring.token += 1;
    scoring.running = false;
    runToken += 1;
    attempt = null;
    const items = NOTES ? NOTES.list() : [];
    document.title = '마이노트 · 스피킹 루틴';

    root.innerHTML = `
      <div class="ex-home notes-page">
        <div class="ex-wrap">
          <button class="ex-back" type="button" data-act="home">← 모의고사 목록</button>
          <div class="ex-home-head">
            <h1 class="ex-h1" tabindex="-1">마이노트</h1>
            <p class="ex-sub">자동으로 모인 약점 문항과 직접 저장한 문항을 다시 풀어요. ${items.length}문항</p>
          </div>
          ${items.length
            ? `<ul class="note-list">${items.map(noteRow).join('')}</ul>`
            : `<div class="score-status note-empty">
                 <p>아직 마이노트가 없어요. 채점 후 점수가 낮은 문항이 자동으로 모여요.</p>
                 <button class="ex-btn ghost sm" type="button" data-act="home">모의고사 보기</button>
               </div>`}
        </div>
      </div>`;

    const heading = root.querySelector('.ex-h1');
    if (heading) heading.focus();
  }

  function noteRow(item) {
    const exam = EXAMS.find((entry) => entry.id === item.examId);
    const found = exam ? findQuestion(exam, item.no) : null;
    const max = found && found.part.part === 5 ? 5 : 3;
    const score = item.lastScore === null || item.lastScore === undefined
      ? '점수 없음'
      : `최근 ${item.lastScore}/${max}`;
    const label = found ? KIND_LABEL[found.part.part] || '' : '문항 정보 없음';
    const prompt = found ? (found.q.prompt || found.q.text || '') : '';
    return `<li class="note-row">
      <div class="note-row-main">
        <p class="note-row-title"><b>Q${item.no}</b> <span>${esc(label)}</span>
          <i class="mini ${item.source === 'manual' ? 'manual' : 'auto'}">${item.source === 'manual' ? '직접' : '자동'}</i>
        </p>
        <p class="note-row-prompt">${esc(prompt.slice(0, 90))}</p>
        <p class="note-row-meta">${esc(exam ? exam.title : item.examId)} · ${esc(formatWhen(item.addedAt))} · ${score}</p>
      </div>
      <div class="note-actions">
        ${found ? `<button class="ex-btn ghost sm" type="button" data-act="note-retake" data-exam="${esc(item.examId)}" data-no="${item.no}">다시 풀기</button>` : ''}
        <button class="note-remove" type="button" data-act="note-remove" data-exam="${esc(item.examId)}" data-no="${item.no}" aria-label="마이노트에서 빼기" title="빼기">★</button>
      </div>
    </li>`;
  }

  function startNoteRetake(examId, no) {
    const exam = EXAMS.find((entry) => entry.id === examId);
    if (!exam) return;
    currentExam = exam;
    const found = findQuestion(exam, no);
    if (!found) return;
    const note = NOTES ? NOTES.find(examId, no) : null;
    const prevScore = note ? note.lastScore : null;
    retake = { item: found, prevScore };
    if (recordingEnabled && (mic.ready || TEST_AUDIO)) startNoteRetakeNow(found, prevScore);
    else openMicCheck({ mode: 'retake', item: found, prevScore });
  }

  async function startNoteRetakeNow(item, prevScore) {
    const exam = currentExam;
    const { part, q } = item;
    cleanupMic();
    revokeReportAudio();
    testAudioBlobs.clear();
    recordingNo = 0;
    scoring.token += 1;
    scoring = { running: false, done: false, error: null, results: {}, raw: {}, summary: null, token: scoring.token };
    attempt = {
      id: uid(),
      examId: exam.id,
      at: new Date().toISOString(),
      startedAt: Date.now(),
      seconds: 0,
      total: 1,
      ratings: {},
      single: { no: q.no },
    };
    mountExam();
    holdExamLock();
    document.title = `${exam.title} 다시 풀기 · 스피킹 루틴`;
    setChrome(part.part, q.no);
    const token = ++runToken;
    try {
      await runQuestion({ part, q }, token);
      if (token !== runToken) return;
      await finishRetake(item, prevScore);
    } catch (error) {
      if (error !== ABORT) console.error(error);
    }
  }

  async function finishRetake(item, prevScore) {
    const exam = currentExam;
    const { part, q } = item;
    attempt.finishedAt = new Date().toISOString();
    attempt.seconds = Math.round((Date.now() - attempt.startedAt) / 1000);
    const record = await getRecording(attempt.id, q.no);
    if (!record || !scoreModulesReady()) {
      releaseExamLock();
      paintRetakeResult(item, prevScore, null, record ? 'unavailable' : 'noRecording');
      return;
    }
    const metrics = await analyzeRecording(record.blob);
    if (isSilentMetrics(metrics)) {
      const silent = silentResult(q);
      if (!silent) {
        releaseExamLock();
        paintRetakeResult(item, prevScore, null, 'unavailable');
        return;
      }
      attempt.scores = { [q.no]: silent };
      if (NOTES) NOTES.updateScore(exam.id, q.no, silent.score);
      autoNote(part, q, silent);
      releaseExamLock();
      retake = { item, prevScore: silent.score };
      paintRetakeResult(item, prevScore, silent, null);
      return;
    }
    els.stage.innerHTML = `<div class="practice-score pending"><h3>채점 중…</h3><p id="retake-status">음성 인식 모델 준비 중…</p></div>`;
    dockIdle('채점');
    try {
      const stt = window.SpeakingSTT;
      await stt.ensureModel((progress) => {
        const el = document.getElementById('retake-status');
        if (!el) return;
        const pct = Math.round(normalizeProgress(progress) * 100);
        el.textContent = pct > 0 ? `음성 인식 모델 준비 중… ${pct}%` : '음성 인식 모델 준비 중…';
      });
      const tr = await stt.transcribe(record.blob);
      const text = String((typeof tr === 'string' ? tr : (tr && tr.text)) || '').trim();
      const words = tr && Array.isArray(tr.words) ? tr.words : undefined;
      const value = window.SpeakingScore.gradeQuestion({
        exam,
        no: q.no,
        text,
        words: Array.isArray(words) ? words.length : undefined,
        metrics,
        delivery: deliveryFor(metrics),
      });
      const result = normalizeScore(value, q);
      if (!result) throw new Error('채점 결과를 만들지 못했어요.');
      if (!result.text) result.text = text;
      attempt.scores = { [q.no]: result };
      if (NOTES) NOTES.updateScore(exam.id, q.no, result.score);
      autoNote(part, q, result);
      releaseExamLock();
      retake = { item, prevScore: result.score };
      beep('end');
      paintRetakeResult(item, prevScore, result, null);
    } catch (error) {
      releaseExamLock();
      paintRetakeResult(item, prevScore, null, 'unavailable');
    }
  }

  function paintRetakeResult(item, prevScore, result, error) {
    document.body.classList.remove('ex-locked');
    document.title = `${currentExam.title} 다시 풀기 결과 · 스피킹 루틴`;
    const { part, q } = item;
    const max = part.part === 5 ? 5 : 3;
    const before = prevScore === null || prevScore === undefined ? '기록 없음' : `${prevScore}/${max}`;
    const after = result ? `${result.score}/${max}` : '—';
    const errorText = error === 'noRecording'
      ? '녹음이 없어 채점하지 못했어요.'
      : '채점을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
    root.innerHTML = `
      <div class="ex-home retake-page">
        <div class="ex-wrap">
          <button class="ex-back" type="button" data-act="retake-notes">← 마이노트</button>
          <div class="ex-home-head">
            <h1 class="ex-h1" tabindex="-1">다시 풀기 결과</h1>
            <p class="ex-sub">Q${q.no} · ${esc(KIND_LABEL[part.part] || '')}</p>
          </div>
          <div class="retake-compare">
            <span>이전 ${before}</span><b aria-hidden="true">→</b><strong>이번 ${after}</strong>
          </div>
          ${result
            ? renderQCard(item, result)
            : `<div class="score-status"><p>${errorText}</p></div>`}
          <p class="report-disclaimer">기기 안에서 음성 인식으로 계산한 추정치예요. 실제 ETS 채점과 다를 수 있어요.</p>
          <div class="ex-actions">
            <button class="ex-btn" data-act="retake-again" type="button">한 번 더</button>
            <button class="ex-btn ghost" data-act="retake-home" type="button">모의고사 홈</button>
          </div>
        </div>
      </div>`;
    paintRatings();
    if (result) loadReportAudio(attempt.id, [item]);
    const heading = root.querySelector('.ex-h1');
    if (heading) heading.focus();
  }

  function paintRatings() {
    if (!attempt) return;
    root.querySelectorAll('[data-act="rate"]').forEach((button) => {
      const on = attempt.ratings[button.dataset.no] === button.dataset.value;
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.classList.toggle('o', on && button.dataset.value === 'good');
      button.classList.toggle('w', on && button.dataset.value === 'weak');
    });
  }

  function rateQuestion(no, value) {
    if (!attempt) return;
    if (attempt.ratings[no] === value) delete attempt.ratings[no];
    else attempt.ratings[no] = value;
    const saved = attempt.single ? true : upsertAttempt(attempt);
    paintRatings();
    const label = document.getElementById('ex-save-state');
    if (label) {
      label.textContent = saved
        ? '자기평가를 저장했습니다.'
        : '저장하지 못했습니다. 저장 공간을 확인해 주세요.';
    }
  }

  let lightboxClose = null;

  function openLightbox(src, alt) {
    if (document.querySelector('.ex-lightbox')) return;
    const returnFocus = document.activeElement;
    const shell = document.querySelector('.ex-shell');

    const box = document.createElement('div');
    box.className = 'ex-lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', alt || '확대 보기');
    box.innerHTML = `<img src="${esc(src)}" alt="${esc(alt || '')}">
      <button class="ex-lightbox-close" type="button">닫기</button>
      <span class="ex-lightbox-note">바깥을 누르거나 Esc로 닫습니다</span>`;

    const close = () => {
      box.remove();
      lightboxClose = null;
      if (shell) {
        shell.inert = false;
        shell.removeAttribute('aria-hidden');
      }
      if (returnFocus && typeof returnFocus.focus === 'function') returnFocus.focus();
    };
    lightboxClose = close;

    box.addEventListener('click', (event) => {
      if (event.target.closest('.ex-lightbox-close') || !event.target.closest('img')) close();
    });

    if (shell) {
      shell.inert = true;
      shell.setAttribute('aria-hidden', 'true');
    }
    document.body.appendChild(box);
    box.querySelector('.ex-lightbox-close').focus();
  }

  function closeLightbox() {
    if (lightboxClose) lightboxClose();
  }

  // ---------- 이벤트 ----------
  root.addEventListener('click', (event) => {
    const zoomTarget = event.target.closest('.ex-figure.wide img');
    if (zoomTarget) {
      event.preventDefault();
      openLightbox(zoomTarget.currentSrc || zoomTarget.src, zoomTarget.alt);
      return;
    }

    const target = event.target.closest('[data-act]');
    if (!target) return;
    const act = target.dataset.act;

    if (act === 'intro') {
      event.preventDefault();
      paintIntro(target.dataset.exam);
      return;
    }
    if (act === 'home') {
      event.preventDefault();
      paintHome();
      return;
    }
    if (act === 'mode') {
      event.preventDefault();
      const next = target.dataset.mode;
      selectedMode = MODE_HINT[next] ? next : 'exam';
      root.querySelectorAll('[data-act="mode"]').forEach((button) => {
        button.setAttribute('aria-pressed', button.dataset.mode === selectedMode ? 'true' : 'false');
      });
      const startButton = root.querySelector('[data-act="start"]');
      const hint = document.getElementById('ex-mode-hint');
      if (startButton) startButton.textContent = MODE_START[selectedMode];
      if (hint) hint.textContent = MODE_HINT[selectedMode];
      return;
    }
    if (act === 'start') {
      event.preventDefault();
      if (selectedMode === 'guide') startPractice('guide');
      else openMicCheck({ mode: selectedMode });
      return;
    }
    if (act === 'jump') {
      event.preventDefault();
      const no = Number(target.dataset.no);
      const index = practiceList.findIndex((item) => item.q.no === no);
      if (index < 0) return;
      runToken += 1;
      stopSpeech();
      practiceIndex = index;
      paintPractice();
      return;
    }
    if (act === 'prev') {
      event.preventDefault();
      goPractice(-1);
      return;
    }
    if (act === 'next') {
      event.preventDefault();
      goPractice(1);
      return;
    }
    if (act === 'part') {
      event.preventDefault();
      const partNo = Number(target.dataset.part);
      const index = practiceList.findIndex((item) => item.part.part === partNo);
      if (index < 0) return;
      runToken += 1;
      stopSpeech();
      practiceIndex = index;
      paintPractice();
      return;
    }
    if (act === 'ptimer') {
      event.preventDefault();
      runPracticeTimer();
      return;
    }
    if (act === 'play-q') {
      event.preventDefault();
      playPracticeQuestion();
      return;
    }
    if (act === 'leave') {
      event.preventDefault();
      runToken += 1;
      stopSpeech();
      attempt = null;
      paintHome();
      return;
    }
    if (act === 'skip') {
      event.preventDefault();
      fireSkip();
      return;
    }
    if (act === 'quit') {
      event.preventDefault();
      quitExam();
      return;
    }
    if (act === 'retry') {
      event.preventDefault();
      paintIntro();
      return;
    }
    if (act === 'rate') {
      event.preventDefault();
      rateQuestion(target.dataset.no, target.dataset.value);
      return;
    }
    if (act === 'notes') {
      event.preventDefault();
      paintNotes();
      return;
    }
    if (act === 'note-toggle') {
      event.preventDefault();
      toggleNote(Number(target.dataset.no));
      return;
    }
    if (act === 'note-retake') {
      event.preventDefault();
      startNoteRetake(target.dataset.exam, Number(target.dataset.no));
      return;
    }
    if (act === 'note-remove') {
      event.preventDefault();
      if (NOTES) NOTES.remove(target.dataset.exam, Number(target.dataset.no));
      paintNotes();
      return;
    }
    if (act === 'mic-test') {
      event.preventDefault();
      startMicTest();
      return;
    }
    if (act === 'mic-start') {
      event.preventDefault();
      if (mic.ready) finishMic(true);
      return;
    }
    if (act === 'mic-skip') {
      event.preventDefault();
      finishMic(false);
      return;
    }
    if (act === 'mic-back') {
      event.preventDefault();
      cleanupMic();
      if (micOpts && micOpts.mode === 'retake') paintNotes();
      else paintIntro();
      return;
    }
    if (act === 'speak-model') {
      event.preventDefault();
      speakModel(Number(target.dataset.no));
      return;
    }
    if (act === 'speak-word') {
      event.preventDefault();
      speak(target.dataset.word || '', 'narrator');
      return;
    }
    if (act === 'score-now') {
      event.preventDefault();
      if (attempt) {
        scoring.error = null;
        scoring.running = true;
        paintDone();
        runScoring(attempt);
      }
      return;
    }
    if (act === 'retake-again') {
      event.preventDefault();
      if (!retake) return;
      if (recordingEnabled) startNoteRetakeNow(retake.item, retake.prevScore);
      else openMicCheck({ mode: 'retake', item: retake.item, prevScore: retake.prevScore });
      return;
    }
    if (act === 'retake-notes') {
      event.preventDefault();
      paintNotes();
      return;
    }
    if (act === 'retake-home') {
      event.preventDefault();
      paintHome();
      return;
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeLightbox();
      return;
    }
    const zoomTarget = event.target.closest && event.target.closest('.ex-figure.wide img');
    if (zoomTarget && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openLightbox(zoomTarget.currentSrc || zoomTarget.src, zoomTarget.alt);
    }
  });

  window.addEventListener('pagehide', () => {
    releaseExamLock();
  });

  window.addEventListener('beforeunload', (event) => {
    if (!attempt || attempt.finishedAt) return;
    event.preventDefault();
    event.returnValue = '';
  });

  if (window.SpeechVoice) window.SpeechVoice.load().then(() => paintHome());
  else paintHome();

  // mock.html로 바로 들어와도 오프라인 셸이 등록되게 한다.
  if (/^https?:$/.test(location.protocol) && window.isSecureContext && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
