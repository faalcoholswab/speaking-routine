/* 모의고사 — 해설 모드와 등급별 답변 화면 */
(() => {
  'use strict';

  const { esc } = window.MockCommon;

  function keyElementsMarkup(q) {
    if (!Array.isArray(q.keyElements) || !q.keyElements.length) return '';
    return `<section class="gd-block">
      <h3 class="gd-title">핵심 요소</h3>
      <div class="ex-chips">${q.keyElements.map((item) => `<span class="ex-chip">${esc(item)}</span>`).join('')}</div>
    </section>`;
  }

  // ---------- v35: 등급별 실제 답변 ----------
  const SAMPLE_LEVELS = ['IH', 'AL', 'AM'];
  const SAMPLE_CATEGORY = {
    pron: '발음', inton: '억양·강세', stress: '강세', grammar: '문법', vocab: '어휘',
    cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    length: '길이', content: '내용', info: '정보', other: '기타',
  };
  const CMP_OPINION = ['i think', 'i believe', 'in my opinion', 'for me'];
  const CMP_REASON = ['because', 'since', 'so that', 'that is why', "that's why"];
  const CMP_EXAMPLE = ['for example', 'for instance', 'such as'];

  function samplesFor(no, examId) {
    const bank = window.MOCK_SAMPLES && window.MOCK_SAMPLES[examId];
    const list = bank && bank.questions ? bank.questions[no] : null;
    if (!Array.isArray(list)) return [];
    return list
      .filter((item) => item && typeof item.text === 'string' && item.text.trim())
      .slice()
      .sort((a, b) => {
        const ai = SAMPLE_LEVELS.indexOf(a.level);
        const bi = SAMPLE_LEVELS.indexOf(b.level);
        return (ai < 0 ? 9 : ai) - (bi < 0 ? 9 : bi);
      });
  }

  function tokensOf(text) {
    const internals = window.SpeakingScore && window.SpeakingScore._internals;
    if (internals && typeof internals.tokenize === 'function') {
      try { return internals.tokenize(text); } catch (error) { /* noop */ }
    }
    return String(text || '').split(/\s+/).filter(Boolean);
  }

  function markerHas(text, markers) {
    const internals = window.SpeakingScore && window.SpeakingScore._internals;
    if (internals && typeof internals.markerCount === 'function') {
      try { return internals.markerCount(text, markers) > 0; } catch (error) { /* noop */ }
    }
    const lower = ` ${String(text || '').toLowerCase()} `;
    return markers.some((marker) => lower.includes(` ${marker} `) || lower.includes(` ${marker},`));
  }

  function gradeSampleText(no, text, exam) {
    const api = window.SpeakingScore;
    if (!api || typeof api.gradeQuestion !== 'function' || !exam) return null;
    try { return api.gradeQuestion({ exam, no, text }); } catch (error) { return null; }
  }

  function escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function markSampleText(text, points, suspects) {
    const source = String(text || '');
    const ranges = [];
    (Array.isArray(points) ? points : []).forEach((point) => {
      const quote = String((point && point.quote) || '').trim();
      if (!quote) return;
      const at = source.toLowerCase().indexOf(quote.toLowerCase());
      if (at < 0) return;
      const end = at + quote.length;
      if (ranges.some((range) => at < range.end && end > range.start)) return;
      ranges.push({ start: at, end });
    });
    ranges.sort((a, b) => a.start - b.start);
    const words = (Array.isArray(suspects) ? suspects : [])
      .map((word) => String(word || '').trim())
      .filter((word) => word && !/\s/.test(word));
    const annotate = (plain) => {
      let html = esc(plain);
      words.forEach((word) => {
        const pattern = new RegExp(`\\b(${escapeRegExp(word)})\\b`, 'gi');
        html = html.replace(pattern, '<span class="sm-suspect" title="자막 인식 의심">$1</span>');
      });
      return html;
    };
    let out = '';
    let cursor = 0;
    ranges.forEach((range) => {
      out += annotate(source.slice(cursor, range.start));
      out += `<mark class="sm-quote">${annotate(source.slice(range.start, range.end))}</mark>`;
      cursor = range.end;
    });
    return out + annotate(source.slice(cursor));
  }

  function sampleItemMarkup(sample) {
    const points = Array.isArray(sample.points) ? sample.points : [];
    const caption = sample.textSource === 'caption'
      ? '<span class="sm-chip">자막에서 옮김</span>'
      : '';
    const suspects = Array.isArray(sample.captionSuspect) ? sample.captionSuspect.filter(Boolean) : [];
    const inlineSuspects = suspects.filter((word) => !/\s/.test(String(word).trim()));
    const suspectNote = suspects.length
      ? `<p class="sm-note">${inlineSuspects.length ? '점선 표시와 아래 목록은 자막 인식이 의심되는 부분이에요. ' : ''}자막 인식 의심: ${esc(suspects.join(' / '))}</p>`
      : '';
    const list = points.length
      ? `<ul class="sm-points">${points.map((point) => `
        <li>
          <span class="sm-cat">${esc(SAMPLE_CATEGORY[point.category] || point.category || '지적')}</span>
          ${point.quote ? `<span class="sm-point-quote">“${esc(point.quote)}”</span>` : ''}
          <span class="sm-point-note">${esc(point.note || '')}</span>
          <span class="sm-source ${point.source === 'ETS' ? 'ets' : (point.source === '해설' ? 'guide' : 'unknown')}">${esc(point.source || '출처 미상')}</span>
        </li>`).join('')}</ul>`
      : '<p class="sm-note">지적 없음</p>';
    return `<details class="sm-item"${sample.level === 'IH' ? ' open' : ''}>
      <summary class="sm-sum">
        <span class="sm-badge">${esc(sample.level || '—')}</span>
        <span class="sm-score">${esc(sample.itemScore || '판정 미상')}</span>
        <span class="sm-meta">${tokensOf(sample.text).length}단어</span>
        ${caption}
      </summary>
      <div class="sm-body">
        <p class="sm-text">${markSampleText(sample.text, points, suspects)}</p>
        ${suspectNote}
        ${list}
      </div>
    </details>`;
  }

  function sampleAnswersMarkup(no, examId) {
    const list = samplesFor(no, examId);
    if (!list.length) return '';
    const bank = window.MOCK_SAMPLES[examId];
    const note = bank && bank.note ? `<p class="sm-intro">${esc(bank.note)}</p>` : '';
    return `<section class="gd-block sm-block">
      <h3 class="gd-title">등급별 실제 답변</h3>
      ${note}
      <div class="sm-list">${list.map(sampleItemMarkup).join('')}</div>
    </section>`;
  }

  function compareChip(text, state) {
    const mark = state === 'ok' ? '✓' : (state === 'wrong' ? '✗' : '—');
    return `<span class="coverage-chip ${state}">${esc(text)} <b>${mark}</b></span>`;
  }

  function compareStat(label, value) {
    return `<span class="sm-stat">${esc(label)} <b>${esc(value)}</b></span>`;
  }

  function comparisonMarkup(part, q, text, result, exam, originalFact) {
    const internals = (window.SpeakingScore && window.SpeakingScore._internals) || {};
    const tokens = tokensOf(text);
    const rows = [];

    if (part.part === 1) {
      let missed = Array.isArray(result && result.missedWords) ? result.missedWords : [];
      if (!result && internals.align && internals.tokenize) {
        try { missed = internals.align(internals.tokenize(q.text || ''), tokens).missed || []; } catch (error) { missed = []; }
      }
      rows.push(`<div class="sm-cmp-row"><span class="sm-cmp-label">지문 읽기</span><div class="sm-stats">
        ${compareStat('놓친 단어', `${missed.length}개`)}
        ${compareStat('읽은 단어', `${tokens.length}개`)}
      </div></div>`);
    } else if (part.part === 2) {
      const elements = Array.isArray(q.keyElements) ? q.keyElements : [];
      const graded = gradeSampleText(q.no, text, exam);
      const covered = new Set((result && Array.isArray(result.covered) && result.covered.length
        ? result.covered
        : (graded && graded.covered) || []));
      const chips = elements.map((element) => compareChip(element, covered.has(element) ? 'ok' : 'miss'));
      if (chips.length) rows.push(`<div class="sm-cmp-row"><span class="sm-cmp-label">핵심 요소</span><div class="coverage">${chips.join('')}</div></div>`);
    } else if (part.part === 4) {
      const facts = internals.extractFacts ? internals.extractFacts(q) : [];
      let matched = [];
      let missed = [];
      try {
        const found = internals.matchFacts(facts, text);
        matched = found.matched;
        missed = found.missed;
      } catch (error) { /* noop */ }
      const graded = result ? null : gradeSampleText(q.no, text, exam);
      const wrong = (result && Array.isArray(result.wrongFacts) ? result.wrongFacts : [])
        .concat((graded && Array.isArray(graded.wrongFacts) ? graded.wrongFacts : []));
      const chips = matched.map((fact) => compareChip(originalFact(fact.value, part, q), 'ok'))
        .concat(wrong.map((value) => compareChip(originalFact(value, part, q), 'wrong')))
        .concat(missed.map((fact) => compareChip(originalFact(fact.value, part, q), 'miss')));
      if (chips.length) rows.push(`<div class="sm-cmp-row"><span class="sm-cmp-label">사실 비교</span><div class="coverage">${chips.join('')}</div></div>`);
    } else {
      let relevance = 0;
      if (internals.overlapRatio && internals.tokenize) {
        try { relevance = internals.overlapRatio(internals.tokenize(q.prompt || ''), tokens); } catch (error) { relevance = 0; }
      }
      const marks = [
        ['의견', markerHas(text, CMP_OPINION)],
        ['이유', markerHas(text, CMP_REASON)],
        ['예시', markerHas(text, CMP_EXAMPLE)],
      ].map(([label, on]) => `<span class="coverage-chip ${on ? 'ok' : 'miss'}">${label} <b>${on ? '✓' : '—'}</b></span>`).join('');
      rows.push(`<div class="sm-cmp-row"><span class="sm-cmp-label">말하기</span><div class="sm-stats">
        ${compareStat('단어 수', `${tokens.length} (길이보다 핵심과 근거가 중요해요)`)}
        ${compareStat('질문 관련 표현', `${Math.round(relevance * 100)}%`)}
      </div></div>
      <div class="sm-cmp-row"><span class="sm-cmp-label">표현</span><div class="coverage">${marks}</div></div>`);
    }
    return rows.join('');
  }

  function sampleCompareMarkup(part, q, result, examId, exam, originalFact, highlightMissed) {
    const list = samplesFor(q.no, examId);
    if (!list.length) return '';
    const myText = String((result && result.text) || '');
    const selected = list.some((sample) => sample.level === 'IH') ? 'IH' : list[0].level;
    const tabs = list.map((sample) => `<button class="sm-tab" type="button" data-act="cmp-level" data-level="${esc(sample.level || '')}" aria-pressed="${(sample.level || '') === selected ? 'true' : 'false'}">${esc(sample.level || '—')}</button>`).join('');
    const panels = list.map((sample) => {
      const level = sample.level || '';
      const myDisplay = part.part === 1
        ? highlightMissed(myText, (result && result.missedWords) || [])
        : esc(myText);
      return `<div class="sm-cmp-panel" data-level="${esc(level)}"${level === selected ? '' : ' hidden'}>
        <div class="sm-cmp-grid">
          <div class="sm-cmp-col">
            <p class="sm-cmp-title">내 답변</p>
            <p class="sm-cmp-text">${myDisplay || '<span class="qa-empty">인식된 문장이 없어요.</span>'}</p>
            ${comparisonMarkup(part, q, myText, result, exam, originalFact)}
          </div>
          <div class="sm-cmp-col sample">
            <p class="sm-cmp-title">${esc(level || '—')} 답변 <span>${esc(sample.itemScore || '')}</span></p>
            <p class="sm-cmp-text">${markSampleText(sample.text, sample.points, sample.captionSuspect)}</p>
            ${comparisonMarkup(part, q, sample.text, null, exam, originalFact)}
          </div>
        </div>
      </div>`;
    }).join('');
    return `<section class="qa-section sm-compare">
      <p class="qa-label">등급별 답변과 비교</p>
      <div class="sm-tabs" role="group" aria-label="비교할 등급 선택">${tabs}</div>
      <div class="sm-cmp-panels">${panels}</div>
      <p class="sm-note">비교는 화면 표시용이에요. 점수는 위 채점 결과를 따릅니다.</p>
    </section>`;
  }

  // 문항 번호별 답변 요령. 같은 번호는 어느 세트에서나 같은 유형이라 세트와 상관없이 보여 줍니다.
  const PART2_TIPS = {
    frames: [
      'This picture was taken outside. / inside.',
      'The first thing I can see is some people.',
      'They are standing or sitting.',
      'She has long brown hair.',
      'She is wearing white clothes.',
      'In the background, I can see some trees and buildings.',
      'It seems like they are busy working.',
    ],
    notes: [
      '장소 → 사람 → 자세·동작 → 외모 → 배경 → 마무리 순서는 연습용 틀이에요. 사진에 맞는 표현만 골라 쓰고, 배경·마무리는 생략해도 돼요. 두 문항에 같은 틀을 써도 돼요.',
      '30초에 8~10문장이면 충분해요. 끝에 몇 초 남거나 마지막 문장이 잘려도 감점되지 않아요.',
      '사람은 한 명만 자세히 묘사해도 돼요. 위치 표현(on the left, in the middle 등)은 한두 번이면 충분해요.',
      '구체적인 장소가 떠오르지 않으면 실내(inside)·실외(outside)만 말해도 돼요. 물건 이름을 모르면 something으로, 옷은 색 + clothes로 넘어가요.',
    ],
  };
  const PART3_SHORT_TIPS = {
    frames: [
      "I would say + 답 + because it's + 형용사.",
      "It's easy / convenient / fast / fun / relaxing.",
      "Well, I usually cook every day and I usually cook alone because it's convenient.",
      'The last time I + 과거동사 + was + 시점 + because ~.',
      "I usually + 동사 + once or twice a week because it's practical and efficient.",
      'So I can save time and money. / So I can relieve my stress.',
      "I'm very busy with my work these days, so I prefer ~.",
    ],
    notes: [
      '질문의 you를 I로 바꾼 답 한 문장, because + 형용사로 이유 한 문장이면 충분해요. 시간이 남아도 감점되지 않아요.',
      'I think 뒤에는 주어와 동사가 와야 해요. 단어 하나로 답할 때는 I would say를 써요.',
      '묻지 않은 내용까지 말할 필요는 없어요.',
    ],
  };
  const ANSWER_TIPS = {
    1: {
      notes: [
        '다 읽고 시간이 남으면 처음부터 다시 읽지 말고 그대로 기다려요. 남은 시간은 감점되지 않아요.',
        '단어를 잘못 읽었으면 그 부분만 다시 고쳐 읽고 이어 가면 돼요.',
        '끊어 읽는 위치는 채점 항목이 아니에요. 단어마다 끊지만 않으면 숨이 찰 때 쉬어도 괜찮아요.',
      ],
    },
    3: PART2_TIPS,
    5: PART3_SHORT_TIPS,
    7: {
      frames: [
        'I would prefer + 보기. / I would say + 기준 + is the most important.',
        "Here's why.",
        'First, ~ / First of all, ~ / Above all, ~',
        "It's easy and convenient, so I can save time.",
        "It's fun and relaxing, so I can relieve my stress.",
        "It's affordable and practical for my daily life.",
        'Also, I can ~ anytime, anywhere.',
        'When I choose ~, I always check ~ first.',
        "That's why I think so.",
      ],
      notes: [
        '보기 하나를 고르고 이유 하나를 1~2문장으로 풀어 주면 돼요. 25초쯤에 끝나도 감점되지 않아요.',
        '이유에서 멈추지 말고 그래서 어떻게 되는지(so I can ~)까지 말해 보세요.',
        '내 이야기로 답하기 어려우면 이유를 대기 쉬운 보기를 고르세요. 외운 티가 나는 긴 서론은 빼요.',
      ],
    },
    8: {
      frames: [
        'It will be held at + 장소 + on + 날짜.',
        'The first session is + 세션명.',
        'It starts at + 시각.',
        "It's + 값.",
      ],
      notes: [
        "무엇을 묻는지 헷갈리면 It's 뒤에 표의 값만 붙여도 돼요(예: It's 8 a.m.). 답이 여러 개면 모두 말해요.",
        'a.m.·p.m.이나 요일은 빠뜨려도 감점되지 않아요. 답하고 시간이 남으면 그대로 기다려도 돼요.',
        '질문을 들으며 답이 될 칸을 손가락으로 짚어 두면 덜 헤매요. 답이 두 개면 두 칸을 짚어 둬요.',
      ],
    },
    9: {
      frames: [
        'Actually, ~ has been canceled.',
        'Actually, + 표에 적힌 값.',
        'Sorry about that. / Don\'t worry about that.',
      ],
      notes: [
        'No로 시작하지 않아도 돼요. 질문자가 틀리게 말한 부분만 표대로 바로잡아요. 맞게 말했다면 맞다고 답해요.',
        '확신이 없으면 옆 칸까지 함께 읽어도 돼요(예: 비회원 가격과 회원 가격을 모두).',
      ],
    },
    10: {
      frames: [
        'Sure, there are two.',
        'First, from ~ to ~, there is + 제목 + by + 발표자.',
        'Second, from ~ to ~, there is ~ by ~.',
        "That's it. Thank you.",
      ],
      notes: [
        '표에 적힌 순서(시간 → 제목 → 발표자)대로 읽으면 어순을 고민하지 않아도 돼요. 사람을 주어로 바꿔 말할 필요는 없어요.',
        '10번 질문은 두 번 들려줘요. 8·9번에서 답한 줄은 보통 다시 나오지 않으니 남은 줄에서 찾아요.',
        '질문을 놓쳤으면 Sure. Let me check.로 시작해요. 마지막 인사는 넣지 않아도 돼요.',
      ],
    },
    11: {
      frames: [
        'I think / I believe + 문제 문장 그대로.',
        'I will give reasons and examples to support my opinion.',
        'First of all, it can increase work efficiency. / It will be good for the environment.',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Then + 결과 한 번 더.',
        'As a result, / Eventually, it will be beneficial.',
        'For example, in my case, when I was in college / high school, ~',
        'When it comes to ~,',
        "That's why I think ~ is the better choice.",
      ],
      notes: [
        '첫 문장은 질문 문장을 그대로 받아 내 입장으로 말해요.',
        '이유만 나열하지 말고, 이유마다 if 문장·경험·주변 사람의 말로 근거를 붙여요.',
        '60초에 10~12문장이면 충분해요. 결론 문장은 없어도 되고, 마지막 문장이 잘려도 감점되지 않아요.',
      ],
    },
  };
  ANSWER_TIPS[2] = ANSWER_TIPS[1];
  ANSWER_TIPS[4] = PART2_TIPS;
  ANSWER_TIPS[6] = PART3_SHORT_TIPS;

  function answerTipsMarkup(no) {
    const tips = ANSWER_TIPS[no];
    if (!tips) return '';
    const frames = tips.frames
      ? `<ul class="gd-patterns">${tips.frames.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`
      : '';
    return `<section class="gd-block">
        <h3 class="gd-title">답변 요령</h3>
        ${frames}
        <ul class="gd-tips">${tips.notes.map((item) => `<li>${esc(item)}</li>`).join('')}</ul>
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
           ${built.flow.note ? `<p class="pg-flow-note">${esc(built.flow.note)}</p>` : ''}
         </div>`
      : '';
    const items = points.map((point) => `<li class="pg-item"><span class="pg-idx">${point.num}</span><span class="pg-text"><b>${esc(point.word)}</b> <span class="pg-ipa">${esc(point.ipa)}</span><span class="pg-tip">${esc(point.tip)}</span></span></li>`).join('');
    const englishLine = `<div class="pg-line"><p class="pg-line-label">영어 발음 표시</p><p class="pg-annotated-line">${renderEnglishMarks(text, points)}</p></div>`;
    const koreanLine = pron
      ? `<div class="pg-line"><p class="pg-line-label">한글 발음</p><p class="pg-plain-pron">${renderPronMarks(pron, points)}</p></div>`
      : '';
    const marksLegend = `<span class="pg-marks-legend">${esc(window.PRON_GUIDE.MARKS_LEGEND || '/ 끊어 읽기 · ↗ 올림 · → 유지 · ↘ 내림')}</span>`;
    return `<div class="pg-legend">${legend}${marksLegend}</div>${englishLine}${koreanLine}${flow}<ol class="pg-list">${items}</ol>`;
  }

  window.MockGuideViews = Object.freeze({
    keyElementsMarkup,
    samplesFor,
    sampleAnswersMarkup,
    sampleCompareMarkup,
    answerTipsMarkup,
    modelBlock,
    pronGuideMarkup,
  });
})();
