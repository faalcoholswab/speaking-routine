/* =========================================================
   모의고사 — 마이노트 저장소
   키: speaking-routine-notes-v1
   항목: {examId, no, addedAt, lastScore, source}
   ========================================================= */
(() => {
  'use strict';

  const KEY = 'speaking-routine-notes-v1';
  const LIMIT = 500;
  const MAX_NO = 11;

  function isDate(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
  }

  function normalize(item) {
    if (!item || typeof item !== 'object') return null;
    const no = Math.round(Number(item.no));
    if (!Number.isFinite(no) || no < 1 || no > MAX_NO) return null;
    const score = Number(item.lastScore);
    return {
      examId: typeof item.examId === 'string' && item.examId ? item.examId.slice(0, 40) : 'mock-01',
      no,
      addedAt: isDate(item.addedAt) ? item.addedAt : new Date().toISOString(),
      lastScore: Number.isFinite(score) ? score : null,
      source: item.source === 'manual' ? 'manual' : 'auto',
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      const list = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : []);
      return list.map(normalize).filter(Boolean).slice(0, LIMIT);
    } catch (error) {
      return [];
    }
  }

  function save(items) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ version: 1, items: items.slice(0, LIMIT) }));
      return true;
    } catch (error) {
      return false;
    }
  }

  function list() {
    return load().sort((a, b) => String(b.addedAt).localeCompare(String(a.addedAt)));
  }

  function find(examId, no) {
    const key = typeof examId === 'string' && examId ? examId : 'mock-01';
    return load().find((item) => item.examId === key && item.no === Number(no)) || null;
  }

  function has(examId, no) {
    return Boolean(find(examId, no));
  }

  function add(input) {
    if (!input || typeof input !== 'object') return false;
    const examId = typeof input.examId === 'string' && input.examId ? input.examId.slice(0, 40) : 'mock-01';
    const no = Math.round(Number(input.no));
    if (!Number.isFinite(no) || no < 1 || no > MAX_NO) return false;
    const items = load();
    const index = items.findIndex((item) => item.examId === examId && item.no === no);
    const score = Number(input.lastScore);
    if (index >= 0) {
      const current = items[index];
      if (Number.isFinite(score)) current.lastScore = score;
      if (input.source === 'manual' || current.source === 'manual') current.source = 'manual';
      return save(items);
    }
    const next = normalize({
      examId,
      no,
      addedAt: new Date().toISOString(),
      lastScore: Number.isFinite(score) ? score : null,
      source: input.source === 'manual' ? 'manual' : 'auto',
    });
    if (!next) return false;
    items.unshift(next);
    return save(items);
  }

  function remove(examId, no) {
    const key = typeof examId === 'string' && examId ? examId : 'mock-01';
    const items = load();
    const next = items.filter((item) => !(item.examId === key && item.no === Number(no)));
    if (next.length === items.length) return false;
    return save(next);
  }

  function toggle(input) {
    const examId = input && input.examId ? input.examId : 'mock-01';
    const no = input && input.no;
    if (has(examId, no)) {
      remove(examId, no);
      return { added: false };
    }
    add(input);
    return { added: true };
  }

  function updateScore(examId, no, score) {
    const key = typeof examId === 'string' && examId ? examId : 'mock-01';
    const value = Number(score);
    if (!Number.isFinite(value)) return false;
    const items = load();
    const item = items.find((entry) => entry.examId === key && entry.no === Number(no));
    if (!item) return false;
    item.lastScore = value;
    return save(items);
  }

  function count() {
    return load().length;
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
      return true;
    } catch (error) {
      return false;
    }
  }

  window.MockNotes = { KEY, list, has, find, add, remove, toggle, updateScore, count, clear };
})();
