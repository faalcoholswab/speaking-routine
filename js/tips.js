/* 학습 팁 — 파트별 한눈에 보는 템플릿, 팁 묶음, 2025 하반기 기출 예제를 보여 줍니다.
   내용은 data/tips-part1.js ~ data/tips-part5.js 의 window.STUDY_TIPS 에서 읽어요.
   기출 문제·실제 답변은 data/mock-05.js, data/mock-05-samples.js 를 그대로 씁니다. */
(() => {
  'use strict';

  const PARTS = [1, 2, 3, 4, 5];
  const EXAM_ID = 'mock-05';
  const CAPTION_MARK = '자막에서 옮김 · 화면 확인 전';
  const SAMPLE_LEVELS = ['IH', 'AL', 'AM'];
  const SAMPLE_CATEGORY = {
    pron: '발음', inton: '억양·강세', stress: '강세', grammar: '문법', vocab: '어휘',
    cohesion: '응집성', relevance: '관련성', completeness: '완성도',
    length: '길이', content: '내용', info: '정보', other: '기타',
  };

  let selectedPart = 1;
  // 펼친 묶음은 파트를 바꿔도 그대로 둬요. 처음에는 첫 묶음만 펼쳐요.
  const openKeys = new Set(['cheat']);

  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[character]));
  }

  function tipsFor(part) {
    const all = window.STUDY_TIPS;
    const entry = all && typeof all === 'object' ? all[part] : null;
    return entry && typeof entry === 'object' ? entry : null;
  }

  function examData() {
    const list = Array.isArray(window.MOCK_EXAMS) ? window.MOCK_EXAMS : [];
    return list.find((item) => item && item.id === EXAM_ID) || null;
  }

  function questionFor(exam, no) {
    if (!exam) return null;
    for (const part of exam.parts || []) {
      const question = (part.questions || []).find((item) => item && item.no === no);
      if (question) return { part, question };
    }
    return null;
  }

  function samplesFor(no) {
    const bank = window.MOCK_SAMPLES && window.MOCK_SAMPLES[EXAM_ID];
    const list = bank && bank.questions ? bank.questions[String(no)] : null;
    if (!Array.isArray(list)) return [];
    return list
      .filter((sample) => sample && typeof sample.text === 'string' && sample.text.trim())
      .slice()
      .sort((a, b) => {
        const ai = SAMPLE_LEVELS.indexOf(a.level);
        const bi = SAMPLE_LEVELS.indexOf(b.level);
        return (ai < 0 ? 9 : ai) - (bi < 0 ? 9 : bi);
      });
  }

  function lineMarkup(line) {
    if (!line || typeof line.en !== 'string' || !line.en.trim()) return '';
    const slot = line.slot ? `<span class="tip-slot">${esc(line.slot)}</span>` : '';
    const src = line.src ? `<span class="tip-src">${esc(line.src)}</span>` : '';
    const check = line.check === 'caption'
      ? `<span class="tip-check" title="영상 자막에서 옮긴 영어라 화면에서 확인하지 않았어요">${CAPTION_MARK}</span>`
      : '';
    const top = slot || src || check ? `<div class="tip-line-top">${slot}${src}${check}</div>` : '';
    const ko = line.ko ? `<p class="tip-ko">${esc(line.ko)}</p>` : '';
    const note = line.note ? `<p class="tip-note">${esc(line.note)}</p>` : '';
    return `<li class="tip-line">${top}<p class="tip-en" lang="en">${esc(line.en)}</p>${ko}${note}</li>`;
  }

  function blockMarkup(block) {
    if (!block || typeof block !== 'object') return '';
    const kind = block.kind === 'ok'
      ? '<span class="tip-kind ok">감점 아님</span>'
      : block.kind === 'warn'
        ? '<span class="tip-kind warn">감점 주의</span>'
        : '';
    const head = block.head || kind
      ? `<p class="tip-head">${block.head ? esc(block.head) : ''}${kind}</p>`
      : '';
    const ask = block.ask ? `<p class="tip-ask"><span>무엇을 묻나</span>${esc(block.ask)}</p>` : '';
    const text = block.text ? `<p class="tip-text">${esc(block.text)}</p>` : '';
    const points = Array.isArray(block.points)
      ? block.points.filter((point) => typeof point === 'string' && point.trim())
      : [];
    const pointList = points.length
      ? `<ul class="tip-points">${points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>`
      : '';
    const lines = Array.isArray(block.lines) ? block.lines.map(lineMarkup).filter(Boolean) : [];
    const lineList = lines.length ? `<ul class="tip-lines">${lines.join('')}</ul>` : '';
    if (!head && !ask && !text && !pointList && !lineList) return '';
    return `<div class="tip-block">${head}${ask}${text}${pointList}${lineList}</div>`;
  }

  function questionMarkup(found, example) {
    const ask = example && example.ask
      ? `<p class="tip-ask"><span>무엇을 묻나</span>${esc(example.ask)}</p>`
      : '';
    if (!found) {
      return `<div class="tip-q-body">${ask}<p class="tip-missing">기출 문제를 불러오지 못했어요.</p></div>`;
    }
    const { part, question } = found;
    if (part.part === 1) {
      return `<div class="tip-q-body">${ask}<p class="tip-passage" lang="en">${esc(question.text || '')}</p></div>`;
    }
    const context = part.context ? `<p class="tip-context">${esc(part.context)}</p>` : '';
    const image = part.part === 2 && question.image
      ? `<img class="tip-img" src="assets/mock/${esc(question.image)}" alt="Part 2 사진" loading="lazy">`
      : part.part === 4 && part.tableImage
        ? `<img class="tip-img" src="assets/mock/${esc(part.tableImage)}" alt="Part 4 표" loading="lazy">`
        : '';
    const promptKo = example && example.promptKo ? `<p class="tip-ko">${esc(example.promptKo)}</p>` : '';
    return `<div class="tip-q-body">${ask}${context}<p class="tip-prompt" lang="en">${esc(question.prompt || '')}</p>${promptKo}${image}</div>`;
  }

  function sampleMarkup(sample) {
    const points = Array.isArray(sample.points) ? sample.points.filter((point) => point && typeof point === 'object') : [];
    const critique = points.length
      ? `<ul class="tip-crit">${points.map((point) => `<li>
          <span class="tip-cat">${esc(SAMPLE_CATEGORY[point.category] || point.category || '지적')}</span>
          ${point.quote ? `<span class="tip-quote">“${esc(point.quote)}”</span>` : ''}
          <span class="tip-crit-note">${esc(point.note || '')}</span>
          ${point.source ? `<span class="tip-src">${esc(point.source)}</span>` : ''}
        </li>`).join('')}</ul>`
      : '<p class="tip-note">지적 없음</p>';
    return `<article class="tip-sample">
      <div class="tip-sample-head">
        <span class="tip-level">${esc(sample.level || '—')}</span>
        <span class="tip-score">${esc(sample.itemScore || '')}</span>
      </div>
      <p class="tip-sample-text" lang="en">${esc(sample.text)}</p>
      ${critique}
    </article>`;
  }

  function exampleMarkup(example) {
    const no = Number(example && example.q);
    if (!Number.isInteger(no)) return '';
    const found = questionFor(examData(), no);
    const partNo = found ? found.part.part : null;
    const model = example.model && typeof example.model === 'object' ? example.model : null;
    const lines = model && Array.isArray(model.lines) ? model.lines.map(lineMarkup).filter(Boolean) : [];
    const modelNote = model && model.note ? `<p class="tip-note">${esc(model.note)}</p>` : '';
    const samples = samplesFor(no);
    return `<article class="tip-example">
      <header class="tip-ex-head">
        <span class="tip-q">Q${no}</span>
        ${partNo ? `<span class="tip-part">Part ${partNo}</span>` : ''}
        <span class="tip-part">2025 하반기 실제기출</span>
      </header>
      ${questionMarkup(found, example)}
      <p class="tip-label">모범 답안</p>
      ${modelNote}
      ${lines.length ? `<ul class="tip-lines">${lines.join('')}</ul>` : '<p class="tip-missing">모범 답안이 아직 없어요.</p>'}
      <p class="tip-label">실제 수험자 답변</p>
      ${samples.length ? `<div class="tip-samples">${samples.map(sampleMarkup).join('')}</div>` : '<p class="tip-missing">실제 답변을 불러오지 못했어요.</p>'}
    </article>`;
  }

  // plan: 14일 계획(js/plan.js)이 주는 표시(오늘 읽을 묶음·'다 읽었어요' 버튼). 계획이 없으면 null.
  function sectionMarkup(section, index, plan) {
    const key = typeof section.key === 'string' && section.key ? section.key : `section-${index}`;
    const title = typeof section.title === 'string' && section.title ? section.title : '팁';
    const blocks = Array.isArray(section.blocks) ? section.blocks.map(blockMarkup).filter(Boolean) : [];
    const examples = Array.isArray(section.examples) ? section.examples.map(exampleMarkup).filter(Boolean) : [];
    const body = `${blocks.join('')}${examples.join('')}`;
    return `<details class="tip-group" data-tip-key="${esc(key)}"${openKeys.has(key) ? ' open' : ''}>
      <summary class="tip-sum"><span class="tip-num">${index + 1}</span><span class="tip-name">${esc(title)}</span>${plan ? plan.badge(key) : ''}</summary>
      <div class="tip-body">${body || '<p class="tip-missing">내용을 채우는 중이에요.</p>'}${plan ? plan.footer(key) : ''}</div>
    </details>`;
  }

  function preparingMarkup(part, text) {
    return `<section class="panel">
      <div class="empty">
        <h2>Part ${part} 팁은 준비 중이에요</h2>
        <p>${esc(text || '조금만 기다려 주세요. 다른 파트 팁은 먼저 볼 수 있어요.')}</p>
      </div>
    </section>`;
  }

  function partMarkup(part, data, plan) {
    const sections = Array.isArray(data.sections)
      ? data.sections.filter((section) => section && typeof section === 'object')
      : [];
    if (!sections.length) return preparingMarkup(part, '팁 내용을 아직 채우는 중이에요.');
    const title = data.title ? `Part ${part} · ${esc(data.title)}` : `Part ${part}`;
    const summary = data.summary ? `<p class="tips-summary">${esc(data.summary)}</p>` : '';
    return `<section class="panel tips-part-head">
        <div class="panel-head"><h2>${title}</h2><span class="tag">${sections.length}묶음</span></div>
        ${summary}
      </section>
      <div class="tips-sections">${sections.map((section, index) => sectionMarkup(section, index, plan)).join('')}</div>`;
  }

  function render() {
    const data = tipsFor(selectedPart);
    const plan = window.StudyPlan && typeof window.StudyPlan.tipsHook === 'function' ? window.StudyPlan.tipsHook(selectedPart) : null;
    const chips = PARTS.map((part) => {
      const active = part === selectedPart;
      return `<button class="chip${active ? ' active' : ''}" type="button" data-action="tips-part" data-part="${part}" aria-pressed="${active}">Part ${part}</button>`;
    }).join('');
    return `<div class="tips-page">
      <section class="page-head">
        <h1>학습 팁</h1>
        <p>파트별 답변 구조와 템플릿을 모았어요. 궁금한 묶음만 펼쳐 보세요.</p>
      </section>
      ${plan ? plan.banner : ''}
      <div class="chip-row tips-parts" role="group" aria-label="파트 선택">${chips}</div>
      ${data ? partMarkup(selectedPart, data, plan) : preparingMarkup(selectedPart)}
    </div>`;
  }

  function setPart(part) {
    const next = Number(part);
    if (!PARTS.includes(next)) return false;
    selectedPart = next;
    return true;
  }

  // 14일 계획에서 "읽기"를 누르면 그 파트로 바꾸고 묶음을 펼쳐 둬요.
  function openSection(part, key) {
    if (!setPart(part) || typeof key !== 'string' || !key) return false;
    openKeys.add(key);
    return true;
  }

  // details 의 열림 상태는 이벤트가 위로 올라오지 않아 캡처 단계에서 받아요.
  document.addEventListener('toggle', (event) => {
    const group = event.target;
    if (!group || !group.classList || !group.classList.contains('tip-group')) return;
    const key = group.dataset.tipKey;
    if (!key) return;
    if (group.open) openKeys.add(key);
    else openKeys.delete(key);
  }, true);

  window.StudyTips = {
    render,
    setPart,
    openSection,
    get part() { return selectedPart; },
  };
})();
