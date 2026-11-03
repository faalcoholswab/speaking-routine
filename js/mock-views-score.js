/* 모의고사 — 점수·리포트 화면과 문제 화면 마크업 */
(() => {
  'use strict';

  const { esc, KIND_LABEL, SILENT_FEEDBACK } = window.MockCommon;

  const CLOCK_SLOT = '<div class="ex-clock-slot"></div>';

  function clockText(ms) {
    const total = Math.ceil(Math.max(0, ms) / 1000);
    const two = (value) => String(value).padStart(2, '0');
    return `${two(Math.floor(total / 3600))}:${two(Math.floor((total % 3600) / 60))}:${two(total % 60)}`;
  }

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

  function buildPracticeList(exam) {
    return exam.parts.flatMap((part) => part.questions.map((q) => ({ part, q })));
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
      ${CLOCK_SLOT}
      <p class="ex-note-sm">${part.readingSeconds}초 동안 표를 읽습니다. 이어서 3개 질문이 재생됩니다.</p>
    </div>`;
  }

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

  function scoreArc(estimate, levelFromScaled, autoScoreEnabled) {
    const scaled = estimate && Number.isFinite(Number(estimate.scaled))
      ? Math.max(0, Math.min(200, Math.round(Number(estimate.scaled))))
      : null;
    const level = estimate && estimate.level ? estimate.level : (scaled === null ? '—' : levelFromScaled(scaled));
    const pct = scaled === null ? 0 : (scaled / 200) * 100;
    const label = scaled === null ? (autoScoreEnabled() ? '채점 중' : '채점 꺼짐') : `${scaled}점 ${level}`;
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

  function renderQCard(item, result, scoring, noteStar, autoScoreEnabled, sampleAnswersMarkup, modelText, sampleCompareMarkup) {
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
      <div class="qcard-body">${renderScoreBody(part, q, result, `qa-audio-${q.no}`, scoring, autoScoreEnabled, sampleAnswersMarkup, modelText, sampleCompareMarkup)}</div>
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

  function metricsLine(metrics) {
    if (!metrics || !Number.isFinite(Number(metrics.speechSec))) return '';
    const seconds = Math.max(0, Math.round(Number(metrics.speechSec)));
    const pauses = Array.isArray(metrics.longPauses) ? metrics.longPauses.length : 0;
    return `말한 시간 ${seconds}초 · 긴 쉼 ${pauses}회`;
  }

  function renderScoreBody(part, q, result, audioId, scoring, autoScoreEnabled, sampleAnswersMarkup, modelText, sampleCompareMarkup) {
    if (!result) {
      if (!autoScoreEnabled()) {
        return `<div class="qa-section">
          <p class="qa-label">녹음</p>
          <div class="qcard-audio" id="${audioId}"><span class="qa-empty">내 녹음 불러오는 중…</span></div>
          <p class="qa-metrics" id="qa-metrics-${q.no}"></p>
          <p class="qa-empty">자동 채점이 꺼져 있어 점수는 계산하지 않았어요. 설정에서 켜면 다음 녹음부터 채점해요.</p>
        </div>
        ${sampleAnswersMarkup(q.no)}`;
      }
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
      ${sampleCompareMarkup(part, q, result)}
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
        ? `<details class="qa-answer"><summary>전체 정답 보기</summary><p>${esc(q.answerKey)}</p></details>`
        : '';
      if (!chips && !answer) return '';
      return `<div class="qa-section">${chips ? `<p class="qa-label">정답 정보</p><div class="coverage">${chips}</div>` : ''}${answer}</div>`;
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

  window.MockScoreViews = Object.freeze({
    CLOCK_SLOT,
    clockText,
    listenBlock,
    stepper,
    buildPracticeList,
    introMarkup,
    readingMarkup,
    buildPlan,
    scoreArc,
    partAverages,
    renderPartBar,
    insightCard,
    fallbackInsights,
    answered,
    allQuestions,
    findQuestion,
    renderQCard,
    metricsLine,
    renderScoreBody,
    originalFact,
    escapeRegExp,
    highlightMissed,
  });
})();
