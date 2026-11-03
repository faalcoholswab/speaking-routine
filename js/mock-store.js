/* 모의고사 — 응시 기록 저장, 응시 잠금, 점수·요약 보조 */
(() => {
  'use strict';

  const { SILENT_FEEDBACK } = window.MockCommon;

  const STORE_KEY = 'speaking-routine-mock-v1';
  const MOCK_LOCK_KEY = 'speaking-routine-mock-lock';
  const LOCK_TTL = 30000;
  const LOCK_BEAT = 10000;

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

  let lockTimer = 0;

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

  function fallbackInsights(scores, items) {
    const labels = {
      pron: '발음', inton: '억양·강세', grammar: '문법', vocab: '어휘',
      cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    };
    const totals = {};
    items.forEach((item) => {
      const result = scores[item.q.no];
      // 녹음이 없거나 말소리가 없던 문항은 강점·보완점 계산에서 뺀다.
      if (!answered(result)) return;
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
    const strong = entries.filter((entry) => entry.value >= 1.5).slice(0, take);
    return {
      strengths: strong.map((entry) => `${entry.label} ${entry.value.toFixed(1)}`),
      weaknesses: entries.filter((entry) => !strong.includes(entry)).slice(-take).reverse().map((entry) => `${entry.label} ${entry.value.toFixed(1)}`),
    };
  }

  // 실제로 말한 답변이 채점된 문항인지. 녹음 없음·말소리 없음·채점 불가는 아니다.
  function answered(result) {
    return Boolean(result && result.criteria && !result.noRecording && !result.silent && !result.unavailable && !result.pending
      && String(result.text || '').trim());
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

  window.MockStore = Object.freeze({
    isSilentMetrics,
    silentResult,
    uid,
    fmtClock,
    normalizeSummary,
    loadStore,
    upsertAttempt,
    holdExamLock,
    releaseExamLock,
    formatWhen,
    estimateSeconds,
    deliveryFor,
    normalizeScore,
    normalizeProgress,
    buildResponses,
    fallbackSummary,
    levelFromScaled,
  });
})();
