/* =========================================================
   14일 완성 프로그램 — 계획 계산과 저장 (window.PlanCore)
   - 화면(DOM)을 쓰지 않아요. index.html(계획 화면)과 mock.html(모의고사 활동 기록) 모두 불러오고,
     tools/plan-check.mjs · tools/plan-core.test.mjs 가 같은 코드로 배정과 규칙을 검사해요.
   - 저장 키: speaking-routine-plan-v1. 학습(speaking-routine-pwa-v1)·모의고사·마이노트 기록은
     읽기만 하고 절대 쓰지 않아요.
   - 계획을 시작할 때 그날의 배정(문장 id·팁·시험)을 통째로 저장해요(value.plan). 진행 중인 계획은
     이 저장본으로만 계산해서, 나중에 문장·팁 파일이나 data/plan14.js 가 바뀌어도 날짜별 분량이 섞이지 않아요.
   ========================================================= */
(() => {
  'use strict';

  const KEY = 'speaking-routine-plan-v1';
  const VERSION = 1;
  const DAY_MS = 24 * 60 * 60 * 1000;
  const PART_KEYS = ['part2', 'part3', 'part4', 'part5'];
  const FUNCTIONS = ['의견 시작', '이유', '예시', '연결', '결론'];
  const QUESTION_NOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // 학습 팁 묶음의 단계. 일정은 이 순서대로만 올라가요(tools/plan-check.mjs 가 검사).
  const TIP_LEVELS = ['structure', 'cheat', 'template', 'phrases', 'types', 'scoring', 'examples'];
  // 학습 팁의 '2025 하반기 기출 예제'가 쓰는 시험 (js/tips.js 의 EXAM_ID 와 같아요).
  const TIP_EXAMPLE_EXAM = 'mock-05';

  // 분량 추정(분). 계획 화면 아래 '분량은 이렇게 셌어요'에 같은 기준을 적어 둬요.
  const MINUTES = {
    sentence: 0.75, // 새 문장 1개: 읽고 뜻 확인 → 한 번 듣고 따라 말하기 → 평가 ≈ 45초
    scene: { part2: 3, part4: 2 }, // 사진 30초·표 15~30초로 답한 뒤 모범 답안을 소리 내어 읽기
    review: 0.5, // 복습·누적 점검 1장(한국어 먼저) ≈ 30초
    reviewBudget: 15, // 하루 복습 최대 30장 × 30초
    mockRun: 18, // 시험 12분(모든 회차 708초) + 마이크 점검·결과 확인 6분
    guide: 15, // 해설 11문항 ≈ 문항당 1분 20초
    guideSamples: 5, // 등급별 실제 답변까지 있는 시험은 5분 더
    retake: 2, // 마이노트 1문항 다시 풀기(문항 타이머)
  };
  const TIP_READ = { koCharsPerMin: 500, enWordsPerMin: 120, min: 2 };
  // block: 카드 세션 한 번의 최대 장수(할 일을 고르게 나눠요) · review: 하루 복습 최대 장수
  // reviewTopUp: 돌아온 문장이 이보다 적으면 약한 문장·알아요 문장으로 채워요 · notes: 마이노트 문항 수
  const CAPS = { block: 12, review: 30, reviewTopUp: 8, notes: 3 };
  const TASK_ORDER = ['review', 'check', 'notes', 'tips', 'p3', 'p5', 'extra', 'scene', 'mock', 'guide'];
  const TIP_SKIP_KEYS = ['key', 'kind', 'check', 'slot', 'src', 'level', 'itemScore', 'category', 'q'];

  // ---------- 날짜 ----------
  // 공부한 날은 새벽 4시에 바뀌어요. 밤늦게 이어 한 공부는 시작한 저녁의 날로 세요.
  // 오늘·밀림·앞섬·완주 예정일·완료한 날짜를 모두 이 기준(studyDate) 하나로 셉니다.
  const DAY_START_HOUR = 4;

  function dateKey(ms) {
    const date = new Date(ms);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function studyDate(ms) {
    const date = new Date(ms);
    date.setHours(date.getHours() - DAY_START_HOUR);
    return dateKey(date.getTime());
  }

  function keyToDate(key) {
    const [y, m, d] = String(key).split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  // 달력 날짜 차이(서머타임이 있어도 반올림으로 하루 단위를 지켜요).
  function daysBetween(fromKey, toKey) {
    return Math.round((keyToDate(toKey) - keyToDate(fromKey)) / DAY_MS);
  }

  function addDays(key, count) {
    const date = keyToDate(key);
    date.setDate(date.getDate() + count);
    return dateKey(date.getTime());
  }

  // 그 공부한 날의 마지막 순간(다음 날 새벽 4시 직전).
  function studyDayEnd(ms) {
    const date = keyToDate(studyDate(ms));
    date.setDate(date.getDate() + 1);
    date.setHours(DAY_START_HOUR, 0, 0, 0);
    return date.getTime() - 1;
  }

  // 1일 차 날짜. 새벽 4시 뒤에 시작하면 지금 공부한 날이고, 자정~새벽 4시에 시작하면 곧 올 새벽 4시에 시작하는 날이에요
  // (시작하자마자 하루 밀리지 않게). 그 전에 한 일은 1일 차를 미리 한 것이에요. 어느 쪽이든 시작한 순간의 달력 날짜예요.
  function planStartDate(ms) {
    return dateKey(ms);
  }

  function iso(ms) {
    return new Date(ms).toISOString();
  }

  // 저장값의 시각은 모두 toISOString() 형식이에요.
  function isIso(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && !Number.isNaN(Date.parse(value));
  }

  function isDateKey(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(keyToDate(value).getTime());
  }

  // ---------- 콘텐츠 ----------
  function textOf(value, out) {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach((item) => textOf(item, out));
    else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([key, item]) => {
        if (!TIP_SKIP_KEYS.includes(key)) textOf(item, out);
      });
    }
    return out;
  }

  // 팁 묶음 읽는 시간: 한국어 설명은 분당 500자, 영어 예문은 소리 내어 분당 120단어로 셌어요.
  function tipMinutes(section, win) {
    const strings = textOf(section.blocks || [], []);
    textOf(section.examples || [], strings);
    const bank = win.MOCK_SAMPLES && win.MOCK_SAMPLES[TIP_EXAMPLE_EXAM];
    (Array.isArray(section.examples) ? section.examples : []).forEach((example) => {
      const list = bank && bank.questions ? bank.questions[String(example && example.q)] : null;
      textOf(list || [], strings);
    });
    const ko = strings.filter((text) => /[가-힣]/.test(text)).join('').length;
    const en = strings.filter((text) => !/[가-힣]/.test(text)).join(' ').split(/\s+/).filter(Boolean).length;
    return Math.max(TIP_READ.min, Math.round(ko / TIP_READ.koCharsPerMin + en / TIP_READ.enWordsPerMin));
  }

  // js/app.js getData() 와 같은 조건으로 문장을 골라요. 그래야 계획의 문장 수와 학습 화면의 문장 수가 같아요.
  function readContent(win) {
    const raw = win.SENTENCES && typeof win.SENTENCES === 'object' ? win.SENTENCES : {};
    const cards = {};
    PART_KEYS.forEach((key) => {
      cards[key] = (Array.isArray(raw[key]) ? raw[key] : [])
        .filter((item) => item && typeof item.id === 'string' && item.id && typeof item.en === 'string' && typeof item.ko === 'string')
        .map((item) => ({
          id: item.id,
          part: key,
          topic: typeof item.topic === 'string' && item.topic ? item.topic : '기타',
          fn: typeof item.function === 'string' ? item.function.trim() : '',
        }));
    });
    const tips = {};
    const allTips = win.STUDY_TIPS && typeof win.STUDY_TIPS === 'object' ? win.STUDY_TIPS : {};
    [1, 2, 3, 4, 5].forEach((part) => {
      const sections = allTips[part] && Array.isArray(allTips[part].sections) ? allTips[part].sections : [];
      tips[part] = sections
        .map((section, index) => (section && typeof section === 'object' ? {
          part,
          key: typeof section.key === 'string' && section.key ? section.key : `section-${index}`,
          title: typeof section.title === 'string' && section.title ? section.title : '팁',
          index,
          minutes: tipMinutes(section, win),
        } : null))
        .filter(Boolean);
    });
    const manifest = Array.isArray(win.MOCK_MANIFEST)
      ? win.MOCK_MANIFEST.filter((entry) => entry && typeof entry.id === 'string' && entry.id).map((entry) => entry.id)
      : [];
    const exams = Array.isArray(win.MOCK_EXAMS) ? win.MOCK_EXAMS.filter(Boolean) : [];
    const samples = win.MOCK_SAMPLES && typeof win.MOCK_SAMPLES === 'object' ? win.MOCK_SAMPLES : {};
    return { cards, tips, manifest, exams, samples };
  }

  function isGeneric(card) {
    return card.part === 'part5' && FUNCTIONS.includes(card.topic);
  }

  function examTitle(content, examId) {
    const exam = content.exams.find((item) => item.id === examId);
    if (exam && exam.title) return exam.title;
    // Part 2·4 장면 카드의 topic은 모의고사 이름이에요(tools/build-study-scenes.mjs).
    const scene = content.cards.part2.concat(content.cards.part4)
      .find((card) => card.id.startsWith(`p2-${examId}-`) || card.id.startsWith(`p4-${examId}-`));
    if (scene && scene.topic !== '기타') return scene.topic;
    const number = Number((examId.match(/(\d+)$/) || [])[1]);
    return number ? `모의고사 ${number}` : examId;
  }

  function cardMinutes(cards) {
    return cards.reduce((sum, card) => sum + (card.part === 'part2'
      ? MINUTES.scene.part2
      : card.part === 'part4' ? MINUTES.scene.part4 : MINUTES.sentence), 0);
  }

  function joinNames(names, limit = 4) {
    return names.length > limit ? `${names.slice(0, limit).join('·')} 외 ${names.length - limit}` : names.join('·');
  }

  // ---------- 계획 만들기 ----------
  // def 는 둘 중 하나예요.
  //  - data/plan14.js: 주제·기능 이름을 지금 콘텐츠의 문장 id로 풀어요. 어느 날에도 없는 문장은 마지막 새 문장 날에 붙여요.
  //  - 저장본(freeze 결과, frozen: true): 시작할 때 고정한 id를 그대로 써요. 그 뒤에 없어진 문장·팁만 빠져요.
  // 한 문장·팁·시험은 한 날에만 들어가요.
  function build(def, win) {
    const content = readContent(win);
    const frozen = Boolean(def && def.frozen);
    const problems = [];
    const cardDay = new Map();
    const tipDay = new Map();
    const examDay = new Map();
    const allCards = PART_KEYS.flatMap((key) => content.cards[key]);
    const byId = new Map(allCards.map((card) => [card.id, card]));
    const tipIndex = new Map();
    [1, 2, 3, 4, 5].forEach((part) => content.tips[part].forEach((tip) => tipIndex.set(`${part}:${tip.key}`, tip)));
    const titles = new Map(content.manifest.map((exam) => [exam, examTitle(content, exam)]));
    const titleOf = (exam) => titles.get(exam) || examTitle(content, exam);
    const list = (value) => (Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []);
    const topicsOf = (cards) => [...new Set(cards.map((card) => card.topic))];
    const fnRank = (card) => FUNCTIONS.indexOf(card.fn) < 0 ? FUNCTIONS.length : FUNCTIONS.indexOf(card.fn);

    const take = (cards, day) => cards.filter((card) => {
      if (cardDay.has(card.id)) {
        problems.push(`${card.id}: ${cardDay.get(card.id)}일 차와 ${day}일 차에 함께 들어 있어요`);
        return false;
      }
      cardDay.set(card.id, day);
      return true;
    });

    const days = (Array.isArray(def && def.days) ? def.days : []).map((spec, index) => {
      const n = index + 1;
      const tasks = [];
      const fixed = (slot) => list(spec.cards && spec.cards[slot]).map((id) => byId.get(id)).filter(Boolean);
      const cardTask = (slot, cards, extra) => {
        if (cards.length) tasks.push({ id: `d${n}-${slot}`, slot, kind: 'cards', day: n, ids: cards.map((card) => card.id), minutes: cardMinutes(cards), ...extra });
      };

      const sections = list(spec.tips).map((key) => {
        const tip = tipIndex.get(key);
        if (!tip) {
          if (!frozen) problems.push(`${n}일 차 팁 ${key}: 학습 팁에 없는 묶음이에요`);
          return null;
        }
        if (tipDay.has(key)) {
          problems.push(`팁 ${key}: ${tipDay.get(key)}일 차와 ${n}일 차에 함께 들어 있어요`);
          return null;
        }
        tipDay.set(key, n);
        return tip;
      }).filter(Boolean);
      if (sections.length) {
        tasks.push({ id: `d${n}-tips`, slot: 'tips', kind: 'tips', day: n, sections, minutes: sections.reduce((sum, tip) => sum + tip.minutes, 0) });
      }

      // Part 3: data/plan14.js 에 적은 주제 순서대로(답변 틀 → 이유 → …), 주제 안은 파일 순서예요.
      const p3Topics = list(spec.p3);
      if (!frozen) {
        p3Topics.forEach((topic) => {
          if (!content.cards.part3.some((card) => card.topic === topic)) problems.push(`${n}일 차 Part 3 주제 '${topic}': 문장이 없어요`);
        });
      }
      const p3 = take(frozen ? fixed('p3') : p3Topics.flatMap((topic) => content.cards.part3.filter((card) => card.topic === topic)), n);
      cardTask('p3', p3, { part: 'part3', names: topicsOf(p3) });

      // Part 5: 소재 없는 기능 문장을 먼저, 그다음 소재별 문장을 소재마다 의견→이유→예시→연결→결론 순서로요.
      const fnNames = list(spec.p5fn);
      const p5Topics = list(spec.p5);
      if (!frozen) {
        fnNames.forEach((name) => {
          if (!content.cards.part5.some((card) => isGeneric(card) && card.fn === name)) problems.push(`${n}일 차 Part 5 기능 '${name}': 문장이 없어요`);
        });
        p5Topics.forEach((topic) => {
          if (!content.cards.part5.some((card) => !isGeneric(card) && card.topic === topic)) problems.push(`${n}일 차 Part 5 소재 '${topic}': 문장이 없어요`);
        });
      }
      const p5 = take(frozen ? fixed('p5') : fnNames.flatMap((name) => content.cards.part5.filter((card) => isGeneric(card) && card.fn === name))
        .concat(p5Topics.flatMap((topic) => content.cards.part5
          .filter((card) => !isGeneric(card) && card.topic === topic)
          .map((card, order) => ({ card, order }))
          .sort((a, b) => fnRank(a.card) - fnRank(b.card) || a.order - b.order)
          .map((item) => item.card))), n);
      cardTask('p5', p5, { part: 'part5', names: topicsOf(p5) });

      if (typeof spec.scenes === 'string' && spec.scenes) {
        const exam = spec.scenes;
        const scenes = take(frozen ? fixed('scene') : content.cards.part2.filter((card) => card.id.startsWith(`p2-${exam}-`))
          .concat(content.cards.part4.filter((card) => card.id.startsWith(`p4-${exam}-`))), n);
        if (!scenes.length && !frozen) problems.push(`${n}일 차 장면 카드 ${exam}: 카드가 없어요`);
        cardTask('scene', scenes, {
          part: 'scene',
          exam,
          examTitle: titleOf(exam),
          split: { part2: scenes.filter((card) => card.part === 'part2').length, part4: scenes.filter((card) => card.part === 'part4').length },
        });
      }
      if (frozen) {
        const extra = take(fixed('extra'), n);
        cardTask('extra', extra, { part: 'extra', names: [] });
      }

      if (spec.mock && typeof spec.mock.exam === 'string') {
        const exam = spec.mock.exam;
        const mode = spec.mock.mode === 'practice' ? 'practice' : 'exam';
        if (examDay.has(exam)) problems.push(`모의고사 ${exam}: ${examDay.get(exam)}일 차와 ${n}일 차에 함께 들어 있어요`);
        else {
          examDay.set(exam, n);
          if (!frozen && content.manifest.length && !content.manifest.includes(exam)) problems.push(`${n}일 차 모의고사 ${exam}: 모의고사 목록에 없어요`);
          const title = titleOf(exam);
          tasks.push({ id: `d${n}-mock`, slot: 'mock', kind: 'mock', day: n, exam, mode, examTitle: title, minutes: MINUTES.mockRun });
          tasks.push({ id: `d${n}-guide`, slot: 'guide', kind: 'guide', day: n, exam, mode, examTitle: title, minutes: MINUTES.guide + (content.samples[exam] ? MINUTES.guideSamples : 0) });
        }
      }

      if (spec.notes) tasks.push({ id: `d${n}-notes`, slot: 'notes', kind: 'notes', day: n, window: true, target: CAPS.notes, minutes: CAPS.notes * MINUTES.retake });
      const checkSize = Math.max(0, Math.min(50, Math.round(Number(spec.check) || 0)));
      if (checkSize) tasks.push({ id: `d${n}-check`, slot: 'check', kind: 'check', day: n, window: true, size: checkSize, minutes: Math.ceil(checkSize * MINUTES.review) });
      // 복습은 2일 차부터 매일 있어요. 1일 차는 처음 보는 문장뿐이라 돌아올 문장이 없어요
      // (계획 전부터 남은 복습은 2일 차 복습에 함께 들어와요).
      if (n > 1) tasks.push({ id: `d${n}-review`, slot: 'review', kind: 'review', day: n, window: true, minutes: MINUTES.reviewBudget });

      return {
        n,
        theme: typeof spec.theme === 'string' ? spec.theme : `${n}일 차`,
        focus: typeof spec.focus === 'string' ? spec.focus : '',
        tasks,
      };
    });

    // 일정표에 없는 문장은 빠뜨리지 않고 마지막 새 문장 날에 붙여요(콘텐츠가 늘었을 때 대비).
    // 저장본으로 만드는 진행 중 계획에는 붙이지 않아요: 시작할 때의 배정을 그대로 지켜요.
    const leftCards = frozen ? [] : allCards.filter((card) => !cardDay.has(card.id));
    if (leftCards.length && days.length) {
      const lastStudy = days.slice().reverse().find((day) => day.tasks.some((task) => task.slot === 'p3' || task.slot === 'p5')) || days[days.length - 1];
      leftCards.forEach((card) => cardDay.set(card.id, lastStudy.n));
      lastStudy.tasks.push({ id: `d${lastStudy.n}-extra`, slot: 'extra', kind: 'cards', day: lastStudy.n, part: 'extra', ids: leftCards.map((card) => card.id), names: [], minutes: cardMinutes(leftCards) });
    }

    days.forEach((day) => {
      day.tasks.sort((a, b) => TASK_ORDER.indexOf(a.slot) - TASK_ORDER.indexOf(b.slot));
      day.minutes = Math.round(day.tasks.reduce((sum, task) => sum + task.minutes, 0));
    });

    const planCards = allCards.filter((card) => cardDay.has(card.id));
    const coverage = {
      cards: {
        total: frozen ? planCards.length : allCards.length,
        assigned: planCards.length,
        byPart: Object.fromEntries(PART_KEYS.map((key) => [key, { total: content.cards[key].length, assigned: content.cards[key].filter((card) => cardDay.has(card.id)).length }])),
      },
      tips: { total: frozen ? tipDay.size : tipIndex.size, assigned: tipDay.size },
      exams: { total: frozen ? examDay.size : content.manifest.length || examDay.size, assigned: examDay.size, questions: examDay.size * QUESTION_NOS.length },
    };
    return {
      id: (def && def.id) || 'plan',
      title: (def && def.title) || '14일 계획',
      frozen,
      days,
      coverage,
      problems,
      cardDay,
      tipDay,
      examDay,
      titles,
      exists: new Set(byId.keys()),
    };
  }

  // 진행 중 계획으로 저장할 배정(문장 id까지). build(저장본) 이 같은 계획을 다시 만들어요.
  function freeze(plan) {
    return {
      id: plan.id,
      title: plan.title,
      frozen: true,
      days: plan.days.map((day) => {
        const out = { theme: day.theme, focus: day.focus, tips: [], cards: {} };
        day.tasks.forEach((task) => {
          if (task.kind === 'tips') out.tips = task.sections.map((tip) => `${tip.part}:${tip.key}`);
          if (task.kind === 'cards') out.cards[task.slot] = task.ids.slice();
          if (task.slot === 'scene') out.scenes = task.exam;
          if (task.kind === 'mock') out.mock = { exam: task.exam, mode: task.mode };
          if (task.kind === 'notes') out.notes = true;
          if (task.kind === 'check') out.check = task.size;
        });
        return out;
      }),
    };
  }

  // ---------- 저장값 검사 ----------
  // 가져오기와 읽기 모두 같은 검사를 거쳐요. 형식이 하나라도 다르면 통째로 받지 않아요(고쳐 쓰지 않아요).
  const PATTERN = {
    run: /^[a-z0-9]{6,40}$/,
    def: /^[A-Za-z0-9_.-]{1,40}$/,
    card: /^[A-Za-z0-9_.-]{1,60}$/,
    tip: /^[1-5]:[A-Za-z0-9_-]{1,40}$/,
    exam: /^[A-Za-z0-9_-]{1,40}$/,
    mock: /^(guide|practice):[A-Za-z0-9_-]{1,40}:([1-9]|1[01])$/,
    note: /^[A-Za-z0-9_-]{1,40}:([1-9]|1[01])$/,
    day: /^([1-9]|[12][0-9]|3[01])$/,
  };
  const ACTIVE_KEYS = ['run', 'def', 'startedAt', 'startDate', 'plan', 'days', 'tips', 'mock', 'retakes', 'reviews', 'checks', 'notes'];

  function isPlain(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function hasKeys(value, required, optional = []) {
    return isPlain(value)
      && required.every((key) => Object.prototype.hasOwnProperty.call(value, key))
      && Object.keys(value).every((key) => required.includes(key) || optional.includes(key));
  }

  function isText(value, max) {
    return typeof value === 'string' && value.length <= max;
  }

  function isList(value, pattern, max) {
    return Array.isArray(value) && value.length <= max && value.every((item) => typeof item === 'string' && pattern.test(item))
      && new Set(value).size === value.length;
  }

  function isTimeMap(value, pattern, max) {
    return isPlain(value) && Object.keys(value).length <= max && Object.entries(value).every(([key, item]) => pattern.test(key) && isIso(item));
  }

  function isDayMap(value, check) {
    return isPlain(value) && Object.entries(value).every(([key, item]) => PATTERN.day.test(key) && check(item));
  }

  function validSnapshot(plan) {
    if (!hasKeys(plan, ['id', 'title', 'frozen', 'days']) || !PATTERN.def.test(plan.id) || !isText(plan.title, 80) || plan.frozen !== true) return false;
    if (!Array.isArray(plan.days) || !plan.days.length || plan.days.length > 31) return false;
    const seen = new Set();
    return plan.days.every((day) => hasKeys(day, ['theme', 'focus', 'tips', 'cards'], ['scenes', 'mock', 'notes', 'check'])
      && isText(day.theme, 80) && isText(day.focus, 400) && isList(day.tips, PATTERN.tip, 40)
      && hasKeys(day.cards, [], ['p3', 'p5', 'scene', 'extra'])
      && Object.values(day.cards).every((ids) => isList(ids, PATTERN.card, 1500) && ids.every((id) => !seen.has(id) && seen.add(id)))
      && (day.scenes === undefined || PATTERN.exam.test(day.scenes))
      && (day.mock === undefined || (hasKeys(day.mock, ['exam', 'mode']) && PATTERN.exam.test(day.mock.exam) && ['exam', 'practice'].includes(day.mock.mode)))
      && (day.notes === undefined || typeof day.notes === 'boolean')
      && (day.check === undefined || (Number.isInteger(day.check) && day.check >= 0 && day.check <= 50)));
  }

  function validArchive(archive) {
    return Array.isArray(archive) && archive.length <= 10 && archive.every((item) => hasKeys(item, ['startedAt', 'endedAt', 'days', 'finished'])
      && isIso(item.startedAt) && isIso(item.endedAt) && Number.isInteger(item.days) && item.days >= 0 && item.days <= 31
      && typeof item.finished === 'boolean');
  }

  // 올바르면 복사본을, 아니면 null 을 돌려줘요.
  function validate(raw) {
    if (!hasKeys(raw, ['version', 'active', 'archive'], ACTIVE_KEYS.concat('finishedAt'))) return null;
    if (raw.version !== VERSION || typeof raw.active !== 'boolean' || !validArchive(raw.archive)) return null;
    if (!raw.active) return Object.keys(raw).length === 3 ? JSON.parse(JSON.stringify(raw)) : null;
    const ok = hasKeys(raw, ['version', 'active', 'archive'].concat(ACTIVE_KEYS), ['finishedAt'])
      && PATTERN.run.test(raw.run) && PATTERN.def.test(raw.def) && isIso(raw.startedAt) && isDateKey(raw.startDate)
      && validSnapshot(raw.plan)
      && isTimeMap(raw.days, PATTERN.day, 31)
      && isTimeMap(raw.tips, PATTERN.tip, 200)
      && isTimeMap(raw.mock, PATTERN.mock, 400)
      && Array.isArray(raw.retakes) && raw.retakes.length <= 200
      && raw.retakes.every((item) => hasKeys(item, ['examId', 'no', 'at']) && PATTERN.exam.test(item.examId)
        && Number.isInteger(item.no) && item.no >= 1 && item.no <= 11 && isIso(item.at))
      && isDayMap(raw.reviews, (item) => hasKeys(item, ['at', 'ids']) && isIso(item.at) && isList(item.ids, PATTERN.card, CAPS.review))
      && isDayMap(raw.checks, (item) => hasKeys(item, ['at', 'ids']) && isIso(item.at) && isList(item.ids, PATTERN.card, 50))
      && isDayMap(raw.notes, (item) => hasKeys(item, ['at', 'items'], ['skipped']) && isIso(item.at)
        && isList(item.items, PATTERN.note, CAPS.notes) && (item.skipped === undefined || isIso(item.skipped)))
      && (raw.finishedAt === undefined || isIso(raw.finishedAt));
    return ok ? JSON.parse(JSON.stringify(raw)) : null;
  }

  // ---------- 저장 ----------
  function storage() {
    try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch (error) { return null; }
  }

  function read() {
    const store = storage();
    if (!store) return { status: 'error', value: null };
    let raw = null;
    try { raw = store.getItem(KEY); } catch (error) { return { status: 'error', value: null }; }
    if (!raw) return { status: 'empty', value: null };
    try {
      const value = validate(JSON.parse(raw));
      return value ? { status: 'ok', value } : { status: 'error', value: null };
    } catch (error) {
      return { status: 'error', value: null };
    }
  }

  // null = 지우기. 형식이 맞지 않으면 쓰지 않고 실패를 돌려줘요. locked() 안에서만 불러요.
  function put(value) {
    const store = storage();
    if (!store) return { ok: false };
    try {
      if (value === null) {
        store.removeItem(KEY);
        return { ok: true };
      }
      const next = validate(value);
      if (!next) return { ok: false, error: 'invalid' };
      store.setItem(KEY, JSON.stringify(next));
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String((error && error.message) || error) };
    }
  }

  function current() {
    const result = read();
    return result.value && result.value.active ? result.value : null;
  }

  // 같은 기기의 여러 탭(학습 화면·모의고사 화면)이 동시에 쓰면 한쪽 기록이 덮일 수 있어요.
  // 계획 키에 쓰는 일은 모두(시작·그만두기·가져오기·지우기·활동 기록) 이 줄을 거쳐요.
  // Web Locks 가 있으면 읽고-고치고-쓰기를 하나씩 차례로 해요. 없으면 바로 해요.
  function locked(task) {
    const locks = typeof navigator !== 'undefined' && navigator.locks && typeof navigator.locks.request === 'function' ? navigator.locks : null;
    if (locks) return locks.request(KEY, () => task());
    try {
      return Promise.resolve(task());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  // 가져오기·전체 지우기: 계획 키를 통째로 바꿔요(null = 지우기).
  function write(value) {
    return locked(() => put(value));
  }

  // 진행 중인 계획에만 써요. run 을 주면 그 계획(다시 시작하기 전의 계획이 아닌지)일 때만 써요.
  function change(run, fn) {
    return locked(() => {
      const value = current();
      if (!value || (run && value.run !== run)) return { ok: false, skipped: true };
      const next = fn(value);
      return next ? put(next) : { ok: true, unchanged: true };
    });
  }

  function newRun(nowMs) {
    return `${Math.floor(nowMs).toString(36)}${Math.random().toString(36).slice(2, 8).padEnd(6, '0')}`;
  }

  function freshRun(nowMs, archive, defId, snapshot) {
    return {
      version: VERSION,
      active: true,
      archive: archive || [],
      run: newRun(nowMs),
      def: defId,
      startedAt: iso(nowMs),
      startDate: planStartDate(nowMs),
      plan: snapshot,
      days: {},
      tips: {},
      mock: {},
      retakes: [],
      reviews: {},
      checks: {},
      notes: {},
    };
  }

  function archived(value, nowMs) {
    const archive = value && Array.isArray(value.archive) ? value.archive.slice() : [];
    if (value && value.active) {
      archive.unshift({
        startedAt: value.startedAt,
        endedAt: iso(nowMs),
        days: Object.keys(value.days || {}).length,
        finished: Boolean(value.finishedAt),
      });
    }
    return archive.slice(0, 10);
  }

  // 새로 시작·다시 시작: 지금 진행 중인 계획은 요약만 남기고, 오늘(자정~새벽 4시면 그날 아침)을 1일 차로 새로 세요(새 run).
  // snapshot = freeze(build(data/plan14.js)). 계획 키가 깨져 있었다면 그 키만 새로 써요.
  function start(nowMs, defId, snapshot) {
    return locked(() => {
      const value = freshRun(nowMs, archived(read().value, nowMs), defId, snapshot);
      const result = put(value);
      return result.ok ? { ok: true, value } : result;
    });
  }

  function stop(nowMs) {
    return locked(() => put({ version: VERSION, active: false, archive: archived(read().value, nowMs) }));
  }

  // 시작 전 미리 보기: 지금 시작한다고 가정한 계획(저장하지 않아요).
  function preview(nowMs, defId, snapshot) {
    return freshRun(nowMs, [], defId, snapshot);
  }

  function markTip(run, part, key, nowMs) {
    return change(run, (value) => {
      const id = `${part}:${key}`;
      if (!PATTERN.tip.test(id) || value.tips[id]) return null;
      value.tips[id] = iso(nowMs);
      return value;
    });
  }

  // 그날 복습(reviews)·누적 점검(checks) 목록을 처음 열 때 고정해요. 이미 있으면 그대로 둬요.
  function freezeSet(run, kind, day, ids, nowMs) {
    return change(run, (value) => {
      if (!['reviews', 'checks'].includes(kind) || value[kind][day]) return null;
      value[kind][day] = { at: iso(nowMs), ids: ids.slice(0, kind === 'reviews' ? CAPS.review : 50) };
      return value;
    });
  }

  function freezeNotes(run, day, items, nowMs) {
    return change(run, (value) => {
      if (value.notes[day]) return null;
      value.notes[day] = { at: iso(nowMs), items: items.slice(0, CAPS.notes) };
      return value;
    });
  }

  function skipNotes(run, day, nowMs) {
    return change(run, (value) => {
      const entry = value.notes[day] || { at: iso(nowMs), items: [] };
      if (entry.skipped) return null;
      value.notes[day] = { ...entry, skipped: iso(nowMs) };
      return value;
    });
  }

  // 화면을 그리다 '지금 하는 날'이 기록으로 다 끝난 것을 알게 되면 그 날의 완료를 남겨요.
  // done = { 날: 완료 시각 }. 시각은 그리는 때가 아니라 그 날 마지막 할 일을 실제로 끝낸 때예요(evaluate 가 기록에서 셈).
  function latch(run, done) {
    return change(run, (value) => {
      const fresh = Object.keys(done).filter((n) => PATTERN.day.test(n) && isIso(done[n]) && !value.days[n]);
      if (!fresh.length) return null;
      fresh.forEach((n) => { value.days[n] = done[n]; });
      const last = value.plan.days.length;
      if (!value.finishedAt && value.plan.days.every((day, index) => value.days[index + 1])) value.finishedAt = value.days[last];
      return value;
    });
  }

  // 하루를 끝낸 평가를 실행 취소하면(at = 되돌린 평가 시각) 그 시각에 끝난 날부터 완료를 되돌려 '오늘'도 그 날로 돌아가요.
  // 그 밖의 완료 기록은 그대로예요(한 번 끝난 날은 끝난 채로).
  function revert(at) {
    return change(null, (value) => {
      const hit = Object.keys(value.days).map(Number).filter((n) => value.days[n] === at);
      if (!hit.length) return null;
      const from = Math.min(...hit);
      Object.keys(value.days).map(Number).filter((n) => n >= from).forEach((n) => { delete value.days[n]; });
      delete value.finishedAt;
      return value;
    });
  }

  // 모의고사 기록만 지울 때: 계획에 남은 해설 확인·연습 타이머·마이노트 다시 풀기 기록도 지워요.
  // 끝난 날은 끝난 채로 두고, 실전 시험 완료는 모의고사 기록에서 읽으므로 함께 다시 열려요.
  function forgetMock() {
    return change(null, (value) => {
      if (!Object.keys(value.mock).length && !value.retakes.length) return null;
      value.mock = {};
      value.retakes = [];
      return value;
    });
  }

  // mock.html 이 부르는 활동 기록. run 은 그 활동을 시작할 때의 계획이에요(그새 다시 시작했으면 쓰지 않아요).
  //   kind: 'guide'(해설 '읽고 말해 봤어요') · 'practice'(연습 모드 문항 타이머 끝) · 'retake'(마이노트 다시 풀기 끝)
  //   mock 에는 해설 확인·연습 타이머를 처음 끝낸 시각만 남겨요(하루를 끝낸 시각이 나중 연습으로 밀리지 않게).
  //   해설은 notBefore(그 시험을 끝낸 시각)보다 이른 확인만 새 확인으로 바꿔요. 시험 전 확인은 계획에 세지 않아요.
  //   retakes 에는 연습 타이머·다시 풀기를 할 때마다 남겨요(마이노트 문항은 고른 뒤의 기록으로 세요).
  function logMock(kind, examId, no, run, notBefore = 0) {
    const number = Math.round(Number(no));
    if (!['guide', 'practice', 'retake'].includes(kind) || typeof examId !== 'string' || !PATTERN.exam.test(examId)
      || !(number >= 1 && number <= 11) || typeof run !== 'string' || !run) return Promise.resolve({ ok: false });
    return change(run, (value) => {
      const at = new Date().toISOString();
      const key = `${kind}:${examId}:${number}`;
      if (kind === 'guide') {
        if (Date.parse(value.mock[key] || '') >= notBefore) return null;
        value.mock[key] = at;
        return value;
      }
      if (kind === 'practice' && !value.mock[key]) value.mock[key] = at;
      value.retakes = value.retakes.concat({ examId, no: number, at }).slice(-200);
      return value;
    });
  }

  // ---------- 진행 계산 ----------
  // 문장 카드는 학습 기록(progress.lastSeen)으로 세요. 평가를 되돌리면 기록이 돌아가서 완료도 함께 풀려요.
  function seenSince(progress, id, sinceMs) {
    const entry = progress[id];
    if (!entry) return false;
    const at = Date.parse(entry.lastSeen);
    return Number.isFinite(at) && at >= sinceMs;
  }

  // 여러 기록 시각 중 가장 늦은 것(ms). 할 일을 끝낸 시각으로 써요.
  function latest(times) {
    const list = times.map((value) => (typeof value === 'number' ? value : Date.parse(value))).filter(Number.isFinite);
    return list.length ? Math.max(...list) : 0;
  }

  function lastSeen(progress, ids) {
    return latest(ids.map((id) => (progress[id] ? progress[id].lastSeen : '')));
  }

  function hash(text) {
    let value = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      value ^= text.charCodeAt(index);
      value = Math.imul(value, 16777619);
    }
    return value >>> 0;
  }

  function ranked(ids, seed) {
    return ids.map((id) => ({ id, rank: hash(`${seed}|${id}`) })).sort((a, b) => a.rank - b.rank).map((item) => item.id);
  }

  // 앞선 날의 문장(Part 3·5·추가) 중 이번 계획에서 '알아요'로 넘긴 것. 알아요는 복습 큐에서 빠져 다시 오지 않아요.
  function knownEarlier(plan, day, value, ctx) {
    const startMs = Date.parse(value.startedAt);
    return plan.days
      .filter((item) => item.n < day)
      .flatMap((item) => item.tasks.filter((task) => task.kind === 'cards' && task.part !== 'scene'))
      .flatMap((task) => task.ids)
      .filter((id) => ctx.progress[id] && ctx.progress[id].status === 'known' && !ctx.queue[id] && seenSince(ctx.progress, id, startMs));
  }

  // 그날 복습할 목록: 오늘(공부한 날, 새벽 4시까지) 끝날 때까지 돌아오는 문장(오래된 것부터), 하루 최대 30장.
  // 돌아온 문장이 8장보다 적으면 아직 안 돌아온 약한 문장(몰라요·애매해요), 그다음 앞선 날의 알아요 문장으로 8장까지 채워요.
  function reviewPick(plan, task, value, ctx) {
    const end = studyDayEnd(ctx.now);
    const when = (entry) => Date.parse(entry.nextReview || entry.addedAt) || 0;
    const queued = Object.entries(ctx.queue || {}).filter(([id, entry]) => plan.exists.has(id) && isPlain(entry));
    const due = queued.filter(([, entry]) => when(entry) <= end).sort((a, b) => when(a[1]) - when(b[1])).map(([id]) => id);
    const ids = due.slice(0, CAPS.review);
    if (ids.length < CAPS.reviewTopUp) {
      const weak = queued.filter(([, entry]) => when(entry) > end).sort((a, b) => when(a[1]) - when(b[1])).map(([id]) => id);
      const known = ranked(knownEarlier(plan, task.day, value, ctx), `${value.run}|${task.day}|review`);
      for (const id of weak.concat(known)) {
        if (ids.length >= CAPS.reviewTopUp) break;
        if (!ids.includes(id)) ids.push(id);
      }
    }
    return { ids, due: due.length };
  }

  // 누적 점검 후보: 앞선 날의 알아요 문장에서 정해진 수만큼(계획마다 같은 순서로 섞어서).
  function checkPick(plan, task, value, ctx) {
    return ranked(knownEarlier(plan, task.day, value, ctx), `${value.run}|${task.day}|check`).slice(0, task.size);
  }

  // 마이노트에서 그날 다시 풀 문항: 전날 본 모의고사의 문항을 먼저, 그다음 최근에 모인 순서로 최대 3개.
  function notesPick(plan, task, notes) {
    const prev = plan.days[task.day - 2];
    const prevMock = prev ? prev.tasks.find((item) => item.kind === 'mock') : null;
    const keys = (Array.isArray(notes) ? notes : [])
      .filter((note) => isPlain(note) && typeof note.examId === 'string' && PATTERN.note.test(`${note.examId}:${note.no}`))
      .sort((a, b) => Number(Boolean(prevMock) && b.examId === prevMock.exam) - Number(Boolean(prevMock) && a.examId === prevMock.exam)
        || String(b.addedAt || '').localeCompare(String(a.addedAt || '')))
      .map((note) => `${note.examId}:${note.no}`);
    return [...new Set(keys)].slice(0, task.target);
  }

  // 마이노트 문항을 고른 뒤 처음 끝낸 시각(연습 타이머나 다시 풀기). 아직이면 0.
  function noteDoneAt(value, key, sinceMs) {
    const [examId, no] = key.split(':');
    const times = value.retakes.filter((item) => item.examId === examId && item.no === Number(no))
      .map((item) => Date.parse(item.at)).filter((at) => at >= sinceMs);
    return times.length ? Math.min(...times) : 0;
  }

  // 모의고사 할 일을 끝낸 시각(ms). 아직이면 0. task = { exam, mode }.
  //  실전: 계획을 시작한 뒤에 시작해서 11문항을 끝까지 본 첫 회차(중간에 그만두면 저장되지 않아요).
  //  연습: 그런 회차, 또는 11문항 모두 문항 타이머를 끝까지 실행한 때 중 이른 쪽.
  function attemptAt(value, task, attempts) {
    const sinceMs = Date.parse(value.startedAt);
    const times = (attempts || []).filter((item) => isPlain(item) && item.examId === task.exam && !item.single
      && Number(item.total) >= QUESTION_NOS.length && Date.parse(item.at) >= sinceMs)
      .map((item) => Date.parse(item.finishedAt)).filter(Number.isFinite);
    if (task.mode === 'practice') {
      const timers = QUESTION_NOS.map((no) => Date.parse(value.mock[`practice:${task.exam}:${no}`] || ''));
      if (timers.every(Number.isFinite)) times.push(Math.max(...timers));
    }
    return times.length ? Math.min(...times) : 0;
  }

  // 해설 '읽고 말해 봤어요' 중 그 시험을 끝낸 뒤(after)에 누른 문항 번호. 시험 전 확인은 계획에 세지 않아요.
  function guideNos(value, exam, after) {
    if (!after) return [];
    return QUESTION_NOS.filter((no) => Date.parse(value.mock[`guide:${exam}:${no}`] || '') >= after);
  }

  function frozenProgress(entry, ctx, plan) {
    const at = Date.parse(entry.at);
    const ids = entry.ids.filter((id) => plan.exists.has(id));
    const count = ids.filter((id) => seenSince(ctx.progress, id, at)).length;
    const done = count >= ids.length;
    return {
      count,
      total: ids.length,
      done,
      frozen: true,
      left: ids.filter((id) => !seenSince(ctx.progress, id, at)),
      at: done ? (ids.length ? lastSeen(ctx.progress, ids) : at) : 0,
    };
  }

  // 할 일 하나의 진행. at 은 할 일을 끝낸 시각(ms, 기록에서 셈)이에요. 비어 있어서 완료인 것처럼 기록이 없으면 0.
  // live 는 복습·누적 점검·마이노트를 지금 열 수 있는지예요: '지금 하는 날'(첫 번째로 안 끝난 날)일 때만.
  // 아니면 pending 으로만 보여 줘요. 앞날을 끝낸 그날에도 바로 열려서, 하루에 여러 날을 끝낼 수 있어요.
  function measure(plan, task, value, ctx, live) {
    const startMs = Date.parse(value.startedAt);
    switch (task.kind) {
      case 'cards': {
        const count = task.ids.filter((id) => seenSince(ctx.progress, id, startMs)).length;
        const done = count >= task.ids.length;
        return { count, total: task.ids.length, done, at: done ? lastSeen(ctx.progress, task.ids) : 0 };
      }
      case 'tips': {
        const times = task.sections.map((tip) => value.tips[`${tip.part}:${tip.key}`]).filter(Boolean);
        const done = times.length >= task.sections.length;
        return { count: times.length, total: task.sections.length, done, at: done ? latest(times) : 0 };
      }
      case 'mock': {
        const at = attemptAt(value, task, ctx.attempts);
        if (task.mode === 'exam') return { count: at ? 1 : 0, total: 1, done: Boolean(at), at };
        // 연습: 11문항 모두 문항 타이머를 끝까지 실행하면 완료. 실전 시험으로 끝까지 봤어도 완료예요.
        const count = at ? QUESTION_NOS.length : QUESTION_NOS.filter((no) => value.mock[`practice:${task.exam}:${no}`]).length;
        return { count, total: QUESTION_NOS.length, done: Boolean(at), at };
      }
      case 'guide': {
        // 해설에는 모범 답안이 있어서 같은 날 모의고사를 끝내야 열려요. 그 전에 누른 확인은 세지 않아요.
        const after = attemptAt(value, task, ctx.attempts);
        const nos = guideNos(value, task.exam, after);
        const done = nos.length >= QUESTION_NOS.length;
        return { count: nos.length, total: QUESTION_NOS.length, done, locked: !after, at: done ? latest(nos.map((no) => value.mock[`guide:${task.exam}:${no}`])) : 0 };
      }
      case 'review': {
        if (value.reviews[task.day]) return frozenProgress(value.reviews[task.day], ctx, plan);
        if (!live) return { count: 0, total: 0, done: false, pending: true };
        const pick = reviewPick(plan, task, value, ctx);
        return { count: 0, total: pick.ids.length, done: false, pick: pick.ids, due: pick.due };
      }
      case 'check': {
        if (value.checks[task.day]) return frozenProgress(value.checks[task.day], ctx, plan);
        if (!live) return { count: 0, total: 0, done: false, pending: true };
        const pick = checkPick(plan, task, value, ctx);
        // 점검할 알아요 문장이 하나도 없으면 비어 있는 동안만 완료로 쳐요(저장하지 않아요).
        return { count: 0, total: pick.length, done: pick.length === 0, empty: pick.length === 0, pick };
      }
      case 'notes': {
        const entry = value.notes[task.day];
        if (entry) {
          const since = Date.parse(entry.at);
          const times = entry.items.map((key) => noteDoneAt(value, key, since));
          const items = entry.items.map((key, index) => ({ key, done: Boolean(times[index]) }));
          const count = items.filter((item) => item.done).length;
          const finished = count >= items.length;
          const at = entry.skipped ? Date.parse(entry.skipped) : finished ? latest(times.concat(since)) : 0;
          return { count, total: items.length, done: Boolean(entry.skipped) || finished, skipped: Boolean(entry.skipped), frozen: true, items, at };
        }
        if (!live) return { count: 0, total: 0, done: false, pending: true };
        // 마이노트가 비어 있으면 비어 있는 동안만 완료로 쳐요(저장하지 않아요).
        if (!ctx.notes.length) return { count: 0, total: 0, done: true, empty: true };
        const pick = notesPick(plan, task, ctx.notes);
        return { count: 0, total: pick.length, done: false, pick };
      }
      default:
        return { count: 0, total: 0, done: false };
    }
  }

  // 저장된 진행(value)과 지금의 학습·모의고사·마이노트 기록(ctx)으로 날짜별 진행을 계산해요.
  //  - 문장·팁·모의고사처럼 내용이 정해진 할 일은 언제 해도(앞당겨도) 기록으로 완료가 보여요. 따로 저장하지 않아요.
  //  - 날은 1일 차부터 차례로 끝나요. '지금 하는 날'의 할 일이 모두 끝났을 때만 그 날의 완료를 남겨요(latch).
  //    한 날을 끝내면 다음 날이 곧바로 '지금 하는 날'이 돼서, 같은 날 여러 날을 이어서 끝낼 수 있어요.
  //    완료 시각은 그 날 할 일 중 마지막으로 끝낸 것의 기록 시각이에요(어느 화면에서 했든, 언제 다시 그리든 같아요).
  //    한 번 끝난 날은 그 뒤 기록이 바뀌어도 끝난 채로 남아요(그 날을 끝낸 평가를 실행 취소한 때만 revert).
  function evaluate(plan, value, ctx) {
    const days = { ...value.days };
    const fresh = {};
    for (const day of plan.days) {
      if (days[day.n]) continue;
      const working = { ...value, days };
      // 여기까지 온 날은 첫 번째로 안 끝난 날('지금 하는 날')이에요.
      const progress = day.tasks.map((task) => measure(plan, task, working, ctx, true));
      if (!progress.every((item) => item.done)) break;
      const at = Math.max(Date.parse(value.startedAt), ...progress.map((item) => item.at || 0));
      days[day.n] = iso(Math.min(at, ctx.now));
      fresh[day.n] = days[day.n];
    }
    return { latch: fresh, view: describe(plan, { ...value, days }, ctx) };
  }

  // 화면에 그릴 값: 날짜별 상태, 오늘의 할 일, 일정(밀림·앞섬), 전체 진행. 날짜는 모두 공부한 날(새벽 4시 기준)이에요.
  function describe(plan, value, ctx) {
    const today = studyDate(ctx.now);
    const startMs = Date.parse(value.startedAt);
    const focus = plan.days.find((day) => !value.days[day.n]) || null;
    const completedToday = plan.days.some((day) => value.days[day.n] && studyDate(Date.parse(value.days[day.n])) === today);
    // 자정~새벽 4시에 시작한 그 밤에는 1일 차 날짜가 아직 오지 않았어요. 일정은 1일 차 날짜부터 세요.
    const beforeStart = today < value.startDate;
    const due = daysBetween(value.startDate, today) + 1; // 오늘까지 예정된 날 수(시작 전 밤에는 0)
    const expected = Math.max(1, due);
    const remaining = plan.days.filter((day) => !value.days[day.n]).length;
    const base = beforeStart ? value.startDate : completedToday ? addDays(today, 1) : today;
    let order = 0;

    const days = plan.days.map((day) => {
      const completedAt = value.days[day.n] || '';
      const isFocus = Boolean(focus && focus.n === day.n);
      const open = isFocus;
      const tasks = day.tasks.map((task) => {
        const progress = measure(plan, task, value, ctx, open);
        return { ...task, done: Boolean(completedAt) || progress.done, progress };
      });
      const date = completedAt ? studyDate(Date.parse(completedAt)) : addDays(base, order);
      if (!completedAt) order += 1;
      const left = tasks.filter((task) => !task.done);
      return {
        n: day.n,
        theme: day.theme,
        focus: day.focus,
        minutes: day.minutes,
        tasks,
        status: completedAt ? 'done' : isFocus ? 'current' : 'upcoming',
        open,
        completedAt,
        date,
        leftMinutes: Math.round(left.reduce((sum, task) => sum + remainingMinutes(task), 0)),
      };
    });

    const cardIds = [...plan.cardDay.keys()];
    const tips = days.flatMap((day) => day.tasks.filter((task) => task.kind === 'tips').flatMap((task) => task.sections));
    const doneOf = (kind) => days.flatMap((day) => day.tasks.filter((task) => task.kind === kind));
    return {
      run: value.run,
      today,
      startDate: value.startDate,
      startedAt: value.startedAt,
      finishedAt: value.finishedAt || '',
      days,
      current: focus ? focus.n : null,
      completedToday,
      beforeStart,
      expected,
      // 오늘 하루를 다 마쳤다면 다음 날은 내일 몫이라, 앞섬·늦음을 내일 기준으로 셉니다.
      // (시작 전 밤에 1일 차를 다 끝냈다면 1일 차 날짜보다 먼저 끝낸 것이라 하루 앞서요.)
      ahead: focus ? focus.n - (completedToday ? due + 1 : expected) : 0,
      // 다 끝냈으면 끝낸 날이에요. 자정~새벽 4시에 시작한 그 밤에 다 끝냈다면 공부한 날이 시작일 하루 전이라, 시작일로 보여 줘요.
      finishDate: remaining ? addDays(base, remaining - 1)
        : [value.finishedAt ? studyDate(Date.parse(value.finishedAt)) : today, value.startDate].sort().pop(),
      totals: {
        cards: { done: cardIds.filter((id) => seenSince(ctx.progress, id, startMs)).length, total: cardIds.length },
        tips: { done: tips.filter((tip) => value.tips[`${tip.part}:${tip.key}`]).length, total: tips.length },
        mocks: { done: doneOf('mock').filter((task) => task.done).length, total: doneOf('mock').length },
        guides: { done: doneOf('guide').filter((task) => task.done).length, total: doneOf('guide').length },
        days: { done: days.filter((day) => day.status === 'done').length, total: days.length },
      },
    };
  }

  function remainingMinutes(task) {
    if (task.done) return 0;
    const progress = task.progress || {};
    const share = (count, total) => (total ? task.minutes * (1 - count / total) : task.minutes);
    switch (task.kind) {
      case 'review':
      case 'check':
        return progress.pending ? task.minutes : Math.ceil(((progress.total || 0) - (progress.count || 0)) * MINUTES.review);
      case 'notes':
        return progress.pending ? task.minutes : ((progress.total || 0) - (progress.count || 0)) * MINUTES.retake;
      default:
        return share(progress.count || 0, progress.total || 0);
    }
  }

  // ---------- 카드 세션 ----------
  // 할 일 하나를 12장 이하 세션으로 고르게 나눠요: 39장 → 10·10·10·9.
  function blocks(total) {
    if (total <= 0) return [];
    const count = Math.ceil(total / CAPS.block);
    const base = Math.floor(total / count);
    return Array.from({ length: count }, (_, index) => base + (index < total % count ? 1 : 0));
  }

  function blockSize(left) {
    return blocks(left)[0] || 0;
  }

  // 지금 시작할 카드: 남은 카드에서 다음 세션 한 번 분량. 다 끝난 할 일은 처음부터 다시 연습해요.
  // 복습·누적 점검은 고정된 목록에서 남은 것을, 아직 고정 전이면 오늘 고를 목록(pick)에서 꺼내요.
  function sessionIds(plan, task, value, ctx) {
    const startMs = Date.parse(value.startedAt);
    let pool = [];
    if (task.kind === 'cards') {
      const left = task.ids.filter((id) => !seenSince(ctx.progress, id, startMs));
      pool = left.length ? left : task.ids;
    } else if (task.kind === 'review' || task.kind === 'check') {
      const progress = measure(plan, task, value, ctx, true);
      pool = progress.frozen ? progress.left : (progress.pick || []);
    }
    return pool.slice(0, blockSize(pool.length));
  }

  function findTask(plan, id) {
    for (const day of plan.days) {
      const task = day.tasks.find((item) => item.id === id);
      if (task) return task;
    }
    return null;
  }

  window.PlanCore = Object.freeze({
    KEY,
    VERSION,
    MINUTES,
    CAPS,
    QUESTION_NOS,
    TIP_LEVELS,
    TIP_EXAMPLE_EXAM,
    build,
    freeze,
    validate,
    read,
    write,
    current,
    start,
    stop,
    preview,
    markTip,
    freezeSet,
    freezeNotes,
    skipNotes,
    latch,
    revert,
    forgetMock,
    logMock,
    attemptAt,
    guideNos,
    evaluate,
    measure,
    reviewPick,
    checkPick,
    notesPick,
    blocks,
    blockSize,
    sessionIds,
    findTask,
    studyDate,
    planStartDate,
    addDays,
    daysBetween,
    joinNames,
  });
})();
