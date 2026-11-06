/* =========================================================
   모의고사 — 실전 타이머 + 음성 안내
   ========================================================= */
(() => {
  'use strict';

  const { esc, KIND_LABEL, synth, LOCAL_ENV, SPEED } = window.MockCommon;
  const {
    beep, voicesFor, speak, stopSpeech, fireSkip, unlockAudio,
    clearVoiceKey, assignExamVoices, setSkipResolve,
  } = window.MockAudio;
  const {
    isSilentMetrics, silentResult, uid, fmtClock, normalizeSummary, loadStore, upsertAttempt, holdExamLock, releaseExamLock,
    formatWhen, estimateSeconds, deliveryFor, normalizeScore, normalizeProgress, buildResponses, fallbackSummary, levelFromScaled,
  } = window.MockStore;
  const {
    CLOCK_SLOT, clockText, listenBlock, stepper, buildPracticeList, introMarkup, readingMarkup, buildPlan, partAverages,
    renderPartBar, insightCard, fallbackInsights, answered, allQuestions, findQuestion, metricsLine, originalFact,
    highlightMissed,
  } = window.MockScoreViews;
  const { keyElementsMarkup, answerTipsMarkup, modelBlock, pronGuideMarkup } = window.MockGuideViews;

  const EXAMS = Array.isArray(window.MOCK_EXAMS) ? window.MOCK_EXAMS.filter(Boolean) : [];
  let currentExam = EXAMS[0] || null;
  const ABORT = { abort: true };

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

  let runToken = 0;
  let attempt = null;
  let els = null;
  let mode = 'exam';
  let selectedMode = 'exam';
  let practiceList = [];
  let practiceIndex = 0;
  let starting = false;

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

  function autoScoreEnabled() {
    try {
      if (window.AppSettings && typeof window.AppSettings.get === 'function') {
        return window.AppSettings.get().autoScore !== false;
      }
    } catch (error) { /* noop */ }
    return true;
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

  // ---------- 소리 ----------

  document.addEventListener('pointerdown', unlockAudio, true);
  document.addEventListener('keydown', unlockAudio, true);

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

  // 녹음을 시작하는 사이 시험이 중단된 경우(마이크 권한 창이 떠 있는 동안 나가기 등) 쓰는 정리 함수입니다.
  // 저장하지 않고 바로 끄므로 중단한 시험에 녹음이 남지 않습니다.
  function cancelRecording() {
    recordingNo = 0;
    if (window.SpeakingRecorder && typeof window.SpeakingRecorder.cancel === 'function') {
      try { window.SpeakingRecorder.cancel(); } catch (error) { /* noop */ }
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
    dropExamHistory();
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
      <span class="ex-card-num ex-notes-num" aria-hidden="true">${starIcon(false)}</span>
      <span class="ex-card-body">
        <span class="ex-card-title">마이노트 <b>${noteCount}문항</b></span>
        <span class="ex-card-meta">${noteCount ? '자동 저장·직접 추가한 문항을 다시 풀어요.' : '채점 후 약한 문항이 자동으로 모여요.'}</span>
      </span>
      <span class="ex-card-cta">보기</span>
    </button>`;

    // 카드 목록은 data/mocks.js 의 MOCK_MANIFEST 순서를 따른다 (없으면 v36의 기본 4개).
    // 제목은 시험 title, 번호 자리는 manifest 의 tag(예: 기출) 또는 차례 번호.
    const fallbackSlots = [
      { id: 'mock-01' },
      { id: 'mock-02' },
      { id: 'mock-03' },
      { id: 'mock-05', tag: '기출' },
    ];
    const manifestSlots = Array.isArray(window.MOCK_MANIFEST)
      ? window.MOCK_MANIFEST.filter((item) => item && item.id)
      : [];
    const slots = (manifestSlots.length ? manifestSlots : fallbackSlots).map((slot, index) => {
      const exam = EXAMS.find((item) => item.id === slot.id);
      const on = Boolean(exam);
      const title = (on && exam.title) || slot.label || `모의고사 ${index + 1}`;
      const badge = slot.tag || String(index + 1);
      const meta = on
        ? `Part 1~5 · ${exam.parts.reduce((n, p) => n + p.questions.length, 0)}문항 · 약 ${Math.round(estimateSeconds(exam) / 60)}분`
        : '다음 영상으로 준비 중';
      return `
        <button class="ex-card ${on ? 'on' : 'off'}" ${on ? `data-act="intro" data-exam="${esc(slot.id)}"` : 'disabled'} type="button">
          <span class="ex-card-num${slot.tag ? ' text' : ''}">${esc(badge)}</span>
          <span class="ex-card-body">
            <span class="ex-card-title">${esc(title)}</span>
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
    const clock = els.stage.querySelector('.ex-clock');
    if (clock) clock.remove();
  }

  // 실제 시험 화면처럼 문제(글·그림·표) 바로 아래에 남은 시간을 보여 준다. 그림 위에 겹치지 않는다.
  // 생김새도 시험 화면을 따른다: 검은 머리줄의 PREPARATION TIME / RESPONSE TIME, 아래 칸에 00:00:45.
  function clockFor(label, kind) {
    const slot = els.stage.querySelector('.ex-clock-slot') || els.stage.querySelector('.ex-q') || els.stage.firstElementChild || els.stage;
    let clock = els.stage.querySelector('.ex-clock');
    if (!clock) {
      clock = document.createElement('div');
      clock.innerHTML = '<span class="ex-clock-label"></span><span class="ex-clock-time"></span>';
      clock.setAttribute('role', 'timer');
      slot.appendChild(clock);
      if (clock.offsetParent && typeof clock.scrollIntoView === 'function') clock.scrollIntoView({ block: 'nearest' });
    }
    const respond = kind === 'respond';
    clock.className = `ex-clock ${respond ? 'respond' : 'prep'}`;
    clock.setAttribute('aria-label', `${label} 시간`);
    clock.querySelector('.ex-clock-label').textContent = respond ? 'RESPONSE TIME' : 'PREPARATION TIME';
    return clock;
  }

  function countdown(seconds, label, token, dockKind) {
    return new Promise((resolve, reject) => {
      const total = (Math.max(1, seconds) * 1000) / SPEED;
      const start = Date.now();
      const recording = dockKind === 'respond' && recordingNo > 0;
      els.dock.className = dockClasses(dockKind === 'respond' ? (recording ? 'respond rec' : 'respond') : 'prep');
      els.phase.textContent = recording ? '녹음 중' : label;
      const clock = clockFor(label, dockKind);
      const clockTime = clock.querySelector('.ex-clock-time');

      const paint = (left) => {
        const width = `${((Math.max(0, left) / total) * 100).toFixed(1)}%`;
        const hurry = left <= 3000 && total >= 6000;
        els.time.textContent = String(Math.ceil(Math.max(0, left) / 1000));
        els.fill.style.width = width;
        els.dock.classList.toggle('hurry', hurry);
        // 시간을 배속으로 줄인 검증(?speed=)에서도 화면에는 실제 시험 시간을 보여 준다.
        clockTime.textContent = clockText(left * SPEED);
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

  function questionMarkup(part, q, phase, forceText) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
      ${stepper(part, q.no)}
    </div>`;

    // 타이머(CLOCK_SLOT)는 실제 시험처럼 글·그림·표 바로 아래에 둔다.
    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>${CLOCK_SLOT}`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
        <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
      </figure>${CLOCK_SLOT}`;
    } else if (part.part === 3) {
      // 실제 시험처럼 상황 지문과 질문을 함께 보여준다.
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>${CLOCK_SLOT}`;
    } else if (part.part === 4) {
      // 음성이 없거나 실제로 재생되지 않으면 질문을 화면에 노출한다.
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        ${(synth && !forceText) ? '' : `<p class="ex-prompt">${esc(q.prompt)}</p>`}
        ${listenBlock(q, phase)}${CLOCK_SLOT}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>${CLOCK_SLOT}`;
    }

    const guidance = window.MockCommon.PART_GUIDANCE[part.part];
    return `<div class="ex-q">${head}${body}${guidance ? `<p class="ex-note-sm">${esc(guidance)}</p>` : ''}</div>`;
  }

  // ---------- 연습 모드 ----------

  function practiceMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
      ${stepper(part, q.no, true)}
    </div>`;

    let body = '';
    if (part.part === 1) {
      body = `<p class="ex-text">${esc(q.text)}</p>${CLOCK_SLOT}`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure">
          <img src="assets/mock/${esc(q.image)}" alt="묘사할 그림">
        </figure>${CLOCK_SLOT}`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>${CLOCK_SLOT}
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide">
          <img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기">
        </figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>${CLOCK_SLOT}
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>${CLOCK_SLOT}
        <div class="ex-actions ex-actions-left">
          <button class="ex-btn ghost sm" data-act="play-q" type="button">질문 듣기</button>
        </div>`;
    }

    const resultMarkup = practiceScores[q.no] ? renderPracticeResult(part, q, practiceScores[q.no]) : '';
    const guidance = window.MockCommon.PART_GUIDANCE[part.part];
    return `<div class="ex-q">${partBar(part.part)}${head}${body}${guidance ? `<p class="ex-note-sm">${esc(guidance)}</p>` : ''}${resultMarkup}</div>`;
  }

  // ---------- 해설 모드 ----------
  function guideEntry(q) {
    const guide = guideFor();
    return guide && guide.questions ? guide.questions[q.no] || null : null;
  }

  // ---------- v35: 등급별 실제 답변 ----------

  function sampleExamId() {
    return (attempt && attempt.examId) || (currentExam && currentExam.id) || '';
  }

  function activeExam() {
    return currentExam || (EXAMS || []).find((item) => item.id === sampleExamId()) || null;
  }

  function guideMarkup(part, q) {
    const head = `<div class="ex-q-head">
      <span class="ex-q-no">Question ${q.no} of ${totalQuestions()}</span>
      <span class="ex-q-kind">${esc(KIND_LABEL[part.part] || '')}</span>
      ${noteStar(q.no)}
    </div>${stepper(part, q.no, true)}`;

    const entry = guideEntry(q);
    const samples = samplesFor(q.no);
    // 가이드가 없는 시험(mock-05)은 '준비 중입니다' 대신 등급별 답변만 보여 준다.
    const model = entry || !samples.length ? modelBlock(entry) : '';
    let body = '';

    if (part.part === 1) {
      const pron = pronGuideMarkup(q.text, entry && entry.pron);
      body = pron
        ? `<section class="gd-block"><h3 class="gd-title">발음 가이드</h3>${pron}</section>`
        : `<section class="gd-block"><h3 class="gd-title">지문</h3><p class="gd-model">${esc(q.text || '')}</p></section>`;
    } else if (part.part === 2) {
      body = `<figure class="ex-figure"><img src="assets/mock/${esc(q.image)}" alt="묘사할 그림"></figure>
        ${keyElementsMarkup(q)}${model}`;
    } else if (part.part === 3) {
      body = `${part.context ? `<div class="ex-context">${esc(part.context)}</div>` : ''}
        <p class="ex-prompt">${esc(q.prompt)}</p>${model}`;
    } else if (part.part === 4) {
      body = `<figure class="ex-figure wide"><img src="assets/mock/${esc(part.tableImage)}" alt="행사 일정표" tabindex="0" role="button" aria-label="일정표 확대해서 보기"></figure>
        <p class="ex-prompt">${esc(q.prompt)}</p>${model}`;
    } else {
      body = `<p class="ex-prompt">${esc(q.prompt)}</p>${model}`;
    }

    return `<div class="ex-q">${partBar(part.part)}${head}${body}${answerTipsMarkup(q.no)}${sampleAnswersMarkup(q.no)}</div>`;
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
    voicesFor(`p-${item.q.no}`);
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
    // 응답 녹음 중에 다른 문항으로 넘어가면 타이머가 중단되어 stopRecording()이 실행되지 않으므로 여기서 끕니다.
    cancelRecording();
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
    clearVoiceKey();
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
        if (token !== runToken) { cancelRecording(); return; }
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
        if (token !== runToken) { cancelRecording(); return; }
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
    if (!autoScoreEnabled()) {
      const rec = await getRecording(practiceAttemptId, q.no);
      if (!rec) return { skipped: true, noRecording: true };
      const metrics = await analyzeRecording(rec.blob || rec);
      return { skipped: true, metrics };
    }
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
    if (result.skipped) {
      if (result.noRecording) {
        return `<section class="practice-score notice" id="practice-score-${q.no}">
          <h3>녹음이 없어요</h3>
          <p>녹음이 저장되지 않아 이번 답변은 남기지 못했어요. 자동 채점도 꺼져 있어요.</p>
        </section>`;
      }
      return `<section class="practice-score notice" id="practice-score-${q.no}">
        <h3>자동 채점이 꺼져 있어요</h3>
        <p>녹음과 자기평가는 그대로 남겼어요. 설정에서 자동 채점을 켜면 다음 녹음부터 점수를 계산해요.</p>
        <div class="qcard-audio" id="practice-audio-${q.no}"><span class="qa-empty">내 녹음 불러오는 중…</span></div>
        ${metricsLine(result.metrics) ? `<p class="qa-metrics">${metricsLine(result.metrics)}</p>` : ''}
        <div class="qa-tools"><button class="ex-btn ghost sm" type="button" data-settings-open>설정 열기</button></div>
        ${sampleAnswersMarkup(q.no)}
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
      ${sampleAnswersMarkup(q.no)}
    </section>`;
  }

  // ---------- 진행 ----------

  function runIntro(step, token) {
    const part = step.part;
    setChrome(part.part, 0);
    voicesFor(`intro-${part.part}`);
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
        setSkipResolve(null);
        const left = MIN_VISIBLE - (Date.now() - startedAt);
        if (left > 0) timer = window.setTimeout(resolve, left);
        else resolve();
      };
      setSkipResolve(() => { stopSpeech(); if (timer) window.clearTimeout(timer); done(); });
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
    voicesFor(`q-${q.no}`);

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
      if (token !== runToken) { cancelRecording(); throw ABORT; }
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
    if (token !== runToken) { cancelRecording(); throw ABORT; }
    await countdown(q.responseSeconds, '응답', token, 'respond');
    await stopRecording();
  }

  async function startExam() {
    const exam = currentExam;
    if (!exam || starting) return;
    starting = true;

    try {
      clearVoiceKey();
      if (window.SpeechVoice) assignExamVoices();
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
    pushExamHistory();
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
    dropExamHistory();
    stopSpeech();
    attempt.seconds = Math.round((Date.now() - attempt.startedAt) / 1000);
    attempt.finishedAt = new Date().toISOString();
    attempt.saved = upsertAttempt(attempt);
    const canScore = autoScoreEnabled() && recordingEnabled && (TEST_AUDIO || recorderSupported()) && scoreModulesReady();
    scoring.token += 1;
    scoring = {
      running: canScore,
      done: false,
      error: canScore ? null : (!autoScoreEnabled() ? 'auto-score-off' : (recordingEnabled && recorderSupported() ? 'unavailable' : 'no-recording')),
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

  const QUIT_CONFIRM = '응시를 중단할까요? 지금까지의 기록은 저장되지 않습니다.';

  function abortExam() {
    runToken += 1;
    releaseExamLock();
    stopSpeech();
    attempt = null;
    paintHome();
  }

  function quitExam() {
    if (!attempt) return;
    if (!window.confirm(QUIT_CONFIRM)) return;
    abortExam();
  }

  // 시험 중 뒤로 가기(iPad 밀어서 뒤로 포함)가 바로 페이지를 떠나지 않도록 기록 한 칸을 끼워 둔다.
  let examHistory = false;

  function pushExamHistory() {
    try {
      history.pushState({ exGuard: true }, '');
      examHistory = true;
    } catch (error) { /* noop */ }
  }

  function dropExamHistory() {
    if (!examHistory) return;
    examHistory = false;
    if (history.state && history.state.exGuard) history.back();
  }

  window.addEventListener('popstate', () => {
    if (!examHistory) return;
    examHistory = false;
    if (!attempt || attempt.finishedAt) return;
    if (window.confirm(QUIT_CONFIRM)) abortExam();
    else pushExamHistory();
  });

  // ---------- 결과 ----------
  function paintDone() {
    document.body.classList.remove('ex-locked');
    if (!attempt) return;
    const exam = currentExam;
    document.title = `${exam.title} 완료 · 스피킹 루틴`;
    const hasScores = Boolean(attempt.scores && Object.keys(attempt.scores).length);
    if (scoring.running || hasScores || attempt.summary || !autoScoreEnabled()) paintReport();
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
    const answeredCount = items.filter((item) => answered(scores[item.q.no])).length;
    const noAnswerNote = '녹음된 답변이 없어 판단하지 않았어요.';
    const insightEmpty = (kind) => {
      if (!autoScoreEnabled()) return `자동 채점을 켜면 ${kind}을 계산해요.`;
      if (scoring.error === 'no-recording') return noAnswerNote;
      if (scoring.error) return `채점하지 못해 ${kind}을 계산하지 않았어요.`;
      if (!scoring.done) return `채점이 끝나면 ${kind}이 표시돼요.`;
      if (!answeredCount) return noAnswerNote;
      return kind === '강점' ? '아직 뚜렷한 강점이 없어요. 핵심과 이유가 있으면 짧아도 충분해요. 길이보다 질문에 맞는 답과 이유를 분명하게 말하는 데 집중해 보세요.' : '눈에 띄는 보완점이 없어요.';
    };

    root.innerHTML = `
      <div class="ex-done ex-report">
        <div class="ex-wrap">
          <div class="report-head">
            <h1 class="ex-h1" tabindex="-1">${esc(exam.title)} 완료</h1>
            <p class="ex-sub">${autoScoreEnabled() ? '기기 안에서 계산한 추정 결과예요. 자기평가는 그대로 남겨 두었어요.' : '자동 채점이 꺼져 있어 점수 없이 녹음과 자기평가만 남겼어요.'}</p>
            <p class="report-meta">${attempt.total}문항 · ${fmtClock(attempt.seconds)} · 5파트 · 자기평가 ${rated}/${attempt.total}${attempt.saved === false ? ' · 저장하지 못했어요' : ''}</p>
            <div class="ex-actions report-actions">
              <button class="ex-btn ghost sm" data-act="retry" type="button">다시 보기</button>
              <a class="ex-btn ghost sm" href="index.html">학습으로 돌아가기</a>
            </div>
          </div>
          ${scoringBanner()}
          <div class="report-hero">
            ${scoreArc(estimate)}
            <div class="report-side">
              <h2 class="report-title">Part별 평균</h2>
              <div class="part-bars">${parts.map(renderPartBar).join('')}</div>
              <p class="ex-note-sm">Part 2의 문항 점수는 소수점 없는 0~3점 척도예요. 연습 목표 2.6은 문항 점수가 아니라 평균 목표예요. 앱 추정치와 실제 채점은 다를 수 있어요.</p>
            </div>
          </div>
          <div class="insights">
            ${insightCard('강점', answeredCount ? insight.strengths || [] : [], insightEmpty('강점'))}
            ${insightCard('보완점', answeredCount ? insight.weaknesses || [] : [], insightEmpty('보완점'))}
          </div>
          <div class="qcards">${items.map((item) => renderQCard(item, scores[item.q.no])).join('')}</div>
          <p class="report-disclaimer">${autoScoreEnabled() ? '기기 안에서 음성 인식으로 계산한 추정치예요. 실제 ETS 채점과 다를 수 있어요.' : '자동 채점이 꺼져 있어 점수는 계산하지 않았어요. 녹음과 자기평가는 기기에만 저장돼요.'}</p>
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
      if (scoring.error === 'auto-score-off') {
        return `<div class="scoring-banner error">
          <div class="scoring-label">자동 채점이 꺼져 있어요</div>
          <p class="scoring-sub">녹음과 자기평가는 그대로 남아 있어요. 점수가 필요하면 설정에서 자동 채점을 켜 주세요.</p>
          <button class="ex-btn ghost sm" type="button" data-settings-open>설정 열기</button>
        </div>`;
      }
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

  function questionByNo(no, exam = currentExam) {
    return findQuestion(exam, no);
  }

  // 글꼴마다 모양이 다른 ★ 문자 대신 같은 SVG를 쓴다. 채움만 바꿔 켜짐/꺼짐을 보인다.
  function starIcon(on) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2.8l2.8 5.7 6.3.9-4.55 4.43 1.07 6.27L12 17.15 6.38 20.1l1.07-6.27L2.9 9.4l6.3-.9z" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`;
  }

  function noteStar(no) {
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    const on = NOTES ? NOTES.has(examId, no) : false;
    return `<button class="note-star" type="button" data-act="note-toggle" data-no="${no}" aria-pressed="${on}" aria-label="${on ? '마이노트에서 빼기' : '마이노트에 추가'}" title="마이노트">${starIcon(on)}</button>`;
  }

  function paintStar(no) {
    const examId = (attempt && attempt.examId) || (currentExam && currentExam.id) || 'mock-01';
    const on = NOTES ? NOTES.has(examId, no) : false;
    root.querySelectorAll(`[data-act="note-toggle"][data-no="${no}"]`).forEach((button) => {
      button.setAttribute('aria-pressed', on ? 'true' : 'false');
      button.setAttribute('aria-label', on ? '마이노트에서 빼기' : '마이노트에 추가');
      button.innerHTML = starIcon(on);
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
      const metricSlot = document.getElementById(`qa-metrics-${item.q.no}`);
      if (metricSlot && !autoScoreEnabled()) {
        const metrics = await analyzeRecording(blob);
        metricSlot.textContent = metricsLine(metrics);
      }
    }
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
        <button class="note-remove" type="button" data-act="note-remove" data-exam="${esc(item.examId)}" data-no="${item.no}" aria-label="마이노트에서 빼기" title="빼기">${starIcon(true)}</button>
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
    if (record && !autoScoreEnabled()) {
      releaseExamLock();
      retake = { item, prevScore, skipped: true };
      paintRetakeResult(item, prevScore, null, 'autoScoreOff');
      return;
    }
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
      : '채점을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';    root.innerHTML = `
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
            : (error === 'autoScoreOff'
              ? `<div class="score-status">
                   <p>자동 채점이 꺼져 있어 점수는 계산하지 않았어요.</p>
                   <div class="qcard-audio" id="qa-audio-${q.no}"><span class="qa-empty">내 녹음 불러오는 중…</span></div>
                   <p class="qa-metrics" id="qa-metrics-${q.no}"></p>
                 </div>`
              : `<div class="score-status"><p>${errorText}</p></div>`)}
          <p class="report-disclaimer">${autoScoreEnabled() ? '기기 안에서 음성 인식으로 계산한 추정치예요. 실제 ETS 채점과 다를 수 있어요.' : '자동 채점이 꺼져 있어 점수는 계산하지 않았어요. 녹음과 자기평가는 기기에만 저장돼요.'}</p>
          <div class="ex-actions">
            <button class="ex-btn" data-act="retake-again" type="button">한 번 더</button>
            <button class="ex-btn ghost" data-act="retake-home" type="button">모의고사 홈</button>
          </div>
        </div>
      </div>`;
    paintRatings();
    if (result || error === 'autoScoreOff') loadReportAudio(attempt.id, [item]);
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

  // ---------- 모듈 연결: 인자가 바뀐 함수를 예전 모양으로 감싼다 ----------
  function samplesFor(no) {
    return window.MockGuideViews.samplesFor(no, sampleExamId());
  }

  function sampleAnswersMarkup(no) {
    return window.MockGuideViews.sampleAnswersMarkup(no, sampleExamId());
  }

  function sampleCompareMarkup(part, q, result) {
    return window.MockGuideViews.sampleCompareMarkup(part, q, result, sampleExamId(), activeExam(), originalFact, highlightMissed);
  }

  function scoreArc(estimate) {
    return window.MockScoreViews.scoreArc(estimate, levelFromScaled, autoScoreEnabled);
  }

  function renderScoreBody(part, q, result, audioId) {
    return window.MockScoreViews.renderScoreBody(part, q, result, audioId, scoring, autoScoreEnabled, sampleAnswersMarkup, modelText, sampleCompareMarkup);
  }

  function renderQCard(item, result) {
    return window.MockScoreViews.renderQCard(item, result, scoring, noteStar, autoScoreEnabled, sampleAnswersMarkup, modelText, sampleCompareMarkup);
  }

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
      cancelRecording();
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
      cancelRecording();
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
    if (act === 'cmp-level') {
      event.preventDefault();
      const group = target.closest('.sm-compare');
      if (!group) return;
      const level = target.dataset.level || '';
      group.querySelectorAll('[data-act="cmp-level"]').forEach((button) => {
        button.setAttribute('aria-pressed', button.dataset.level === level ? 'true' : 'false');
      });
      group.querySelectorAll('.sm-cmp-panel').forEach((panel) => {
        panel.hidden = panel.dataset.level !== level;
      });
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

  // 설정 화면에서 음성·자동 채점을 바꾸면 다음 재생부터 반영한다.
  if (window.AppSettings && typeof window.AppSettings.subscribe === 'function') {
    try {
      window.AppSettings.subscribe((value) => {
        if (window.SpeechVoice) {
          clearVoiceKey();
          assignExamVoices();
        }
        if (value && value.autoScore === false && document.querySelector('.scoring-banner')) paintDone();
      });
    } catch (error) { /* noop */ }
  }

  // mock.html로 바로 들어와도 오프라인 셸이 등록되게 한다.
  if (/^https?:$/.test(location.protocol) && window.isSecureContext && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
})();
