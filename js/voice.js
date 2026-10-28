/* =========================================================
   음성 선택 — 공부(랜덤 성별) / 모의고사(역할 고정)
   미국식(en-US)만 사용합니다.
   ========================================================= */
(() => {
  'use strict';

  const FEMALE = [
    'samantha', 'ava', 'allie', 'susan', 'zoe', 'kathy', 'karen', 'moira', 'serena',
    'tessa', 'fiona', 'victoria', 'zira', 'hazel', 'aria', 'jenny', 'michelle',
    'sonia', 'libby', 'natasha', 'clara', 'emily', 'olivia', 'amelie', 'joanna',
    'salli', 'kendra', 'kimberly', 'ivy', 'nora', 'female', 'woman',
  ];

  const MALE = [
    'alex', 'daniel', 'fred', 'tom', 'oliver', 'david', 'mark', 'george', 'james',
    'ryan', 'guy', 'eric', 'christopher', 'aaron', 'adam', 'brian', 'arthur',
    'male', 'man',
  ];

  const FEMALE_SET = new Set(FEMALE);
  const MALE_SET = new Set(MALE);

  let cache = [];
  let lastStudyName = '';

  function normalize(name) {
    return String(name || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/\b(microsoft|google|apple)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function genderOf(voice) {
    if (!voice) return '';
    const name = normalize(voice.name);
    const first = name.split(/[\s\-_]+/).filter(Boolean)[0] || '';
    if (FEMALE_SET.has(first)) return 'f';
    if (MALE_SET.has(first)) return 'm';
    if (name.includes('us english')) return 'f';
    for (const word of FEMALE_SET) {
      if (word.length > 3 && name.includes(word)) return 'f';
    }
    for (const word of MALE_SET) {
      if (word.length > 3 && name.includes(word)) return 'm';
    }
    return '';
  }

  function usOnly(list) {
    const us = list.filter((voice) => /^en[-_]us\b/i.test(voice.lang || ''));
    if (us.length) return us;
    return list.filter((voice) => /^en\b/i.test(voice.lang || ''));
  }

  function read() {
    if (!('speechSynthesis' in window)) return [];
    try {
      return usOnly(window.speechSynthesis.getVoices() || []);
    } catch (error) {
      return [];
    }
  }

  function load() {
    return new Promise((resolve) => {
      const now = read();
      if (now.length) {
        cache = now;
        resolve(cache);
        return;
      }
      if (!('speechSynthesis' in window)) {
        resolve([]);
        return;
      }
      const synth = window.speechSynthesis;
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        try { synth.removeEventListener('voiceschanged', done); } catch (error) { /* noop */ }
        cache = read();
        resolve(cache);
      };
      try { synth.addEventListener('voiceschanged', done); } catch (error) { /* noop */ }
      window.setTimeout(done, 1200);
    });
  }

  function all() {
    if (!cache.length) cache = read();
    return cache;
  }

  function voiceRank(voice) {
    const name = normalize(voice.name);
    if (name.includes('premium')) return 3;
    if (name.includes('enhanced')) return 2;
    return 1;
  }

  function bestOf(list) {
    return list.slice().sort((a, b) => voiceRank(b) - voiceRank(a))[0] || null;
  }

  // 한 목소리로 통일: 나레이터·면접관 모두 여성(en-US). Enhanced/Premium을 우선한다.
  function examPair() {
    const list = all();
    if (!list.length) return { narrator: null, interviewer: null };
    const females = list.filter((voice) => genderOf(voice) === 'f');
    const picked = bestOf(females.length ? females : list);
    return { narrator: picked, interviewer: picked };
  }

  // 공부: 카드마다 성별 랜덤, 직전 목소리 회피.
  function study() {
    const list = all();
    if (!list.length) return null;
    const fresh = list.filter((voice) => voice.name !== lastStudyName);
    const pool = fresh.length ? fresh : list;
    const female = pool.filter((voice) => genderOf(voice) === 'f');
    const male = pool.filter((voice) => genderOf(voice) === 'm');

    let bucket = null;
    if (female.length && male.length) bucket = Math.random() < 0.5 ? female : male;
    else if (female.length) bucket = female;
    else if (male.length) bucket = male;
    else bucket = pool;

    const picked = bucket[Math.floor(Math.random() * bucket.length)] || pool[0];
    lastStudyName = picked.name;
    return picked;
  }

  window.SpeechVoice = { load, all, examPair, study, genderOf };
})();
