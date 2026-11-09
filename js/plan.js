/* =========================================================
   14일 완성 프로그램 — 화면 (window.StudyPlan)
   - #/plan 화면, 홈 카드, 학습 팁·학습 완료 화면에 붙는 계획 표시를 그려요.
   - 계산·저장은 js/plan-core.js(PlanCore), 날짜별 분량은 data/plan14.js 에 있어요.
     진행 중인 계획은 시작할 때 저장한 배정(value.plan)으로만 그려요.
   - 학습 기록은 window.AppData(js/app.js)로 읽기만 하고, 세션 시작·토스트·다시 그리기도 그쪽에 맡겨요.
   ========================================================= */
(() => {
  'use strict';

  const Core = window.PlanCore;
  const DEF = window.STUDY_PLAN_14;
  const MOCK_KEY = 'speaking-routine-mock-v1';
  const NOTES_KEY = 'speaking-routine-notes-v1';
  const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
  const MODE_LABEL = { exam: '실전 시험', practice: '연습' };

  let fresh = null;
  let running = null;
  let pendingTip = null;
  const openDays = new Set();

  function esc(value = '') {
    return String(value).replace(/[&<>'"]/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }[character]));
  }

  // 시작 전 미리 보기·새로 시작할 때는 data/plan14.js, 진행 중에는 저장해 둔 배정으로 만들어요.
  function freshPlan() {
    if (!fresh) fresh = Core.build(DEF, window);
    return fresh;
  }

  function planOf(value) {
    if (!running || running.run !== value.run) running = { run: value.run, plan: Core.build(value.plan, window) };
    return running.plan;
  }

  function bridge() {
    return window.AppData || null;
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function route() {
    const match = location.hash.match(/^#\/([a-z]+)\/?$/);
    return match ? match[1] : 'home';
  }

  // 지금의 학습·모의고사·마이노트 기록(읽기 전용).
  function context(now = Date.now()) {
    const api = bridge();
    const state = api && typeof api.studyState === 'function' ? api.studyState() : null;
    const mock = readJSON(MOCK_KEY);
    const notes = readJSON(NOTES_KEY);
    const items = notes ? (Array.isArray(notes) ? notes : (Array.isArray(notes.items) ? notes.items : [])) : [];
    return {
      now,
      progress: (state && state.progress) || {},
      queue: (state && state.queue) || {},
      attempts: mock && Array.isArray(mock.attempts) ? mock.attempts : [],
      notes: items.filter((item) => item && typeof item === 'object'),
    };
  }

  // 진행 중인 계획을 지금 기록으로 계산해요. '지금 하는 날'이 기록으로 다 끝났으면 그 날의 완료만 남겨요
  // (완료 시각은 그 날 마지막 할 일을 끝낸 기록 시각이에요).
  function snapshot() {
    const value = Core.current();
    if (!value) return null;
    const plan = planOf(value);
    if (!plan.days.length) return null;
    const result = Core.evaluate(plan, value, context());
    if (Object.keys(result.latch).length) Core.latch(value.run, result.latch);
    return { ...result.view, plan, value };
  }

  function previewView() {
    const now = Date.now();
    const plan = freshPlan();
    const value = Core.preview(now, DEF.id, Core.freeze(plan));
    return { ...Core.evaluate(plan, value, context(now)).view, plan, value, preview: true };
  }

  // ---------- 글자 ----------
  function dateLabel(key, today) {
    if (!key) return '';
    if (key === today) return '오늘';
    if (key === Core.addDays(today, 1)) return '내일';
    if (key === Core.addDays(today, -1)) return '어제';
    const [y, m, d] = key.split('-').map(Number);
    return `${m}월 ${d}일 (${WEEKDAYS[new Date(y, m - 1, d).getDay()]})`;
  }

  function shortDate(key) {
    const [, m, d] = String(key).split('-').map(Number);
    return `${m}월 ${d}일`;
  }

  function minutes(value) {
    return `약 ${Math.max(1, Math.round(value))}분`;
  }

  // 같은 제목끼리 묶어 짧게: '답변 구조·시간 (Part 1·2·3·4·5)'
  function tipList(sections) {
    const groups = [];
    sections.forEach((tip) => {
      const group = groups.find((item) => item.title === tip.title);
      if (group) group.parts.push(tip.part);
      else groups.push({ title: tip.title, parts: [tip.part] });
    });
    return groups.map((group) => `${group.title} (Part ${group.parts.join('·')})`).join(', ');
  }

  // 12장 이하로 고르게 나눈 세션: '12장씩 5번' · '10·10·10·9장'
  function splitText(total) {
    const sizes = Core.blocks(total);
    if (sizes.length < 2) return '';
    return sizes.every((size) => size === sizes[0]) ? `${sizes[0]}장씩 ${sizes.length}번` : `${sizes.join('·')}장`;
  }

  function mockHref(exam, mode, no) {
    return `mock.html#plan=1&exam=${encodeURIComponent(exam)}&mode=${encodeURIComponent(mode)}${no ? `&no=${no}` : ''}`;
  }

  function dayOfExam(plan, exam) {
    const day = plan.days.find((item) => item.tasks.some((task) => task.kind === 'mock' && task.exam === exam));
    return day ? day.n : 0;
  }

  function mockDone(view, exam) {
    return view.days.some((day) => day.tasks.some((task) => task.kind === 'mock' && task.exam === exam && task.done));
  }

  // ---------- 할 일 하나 ----------
  // 화면에 보일 제목·분량·진행과 시작 방법. 복습·누적 점검·마이노트는 '지금 하는 날'에만 열리고,
  // 앞날을 끝낸 공부한 날(새벽 4시까지)에는 다음 날 열려요(day.open).
  function describeTask(task, day, view) {
    const p = task.progress || {};
    const live = day.open && !view.preview;
    const later = day.status === 'current' && !day.open && !view.preview ? '내일 열려요' : '';
    const started = !view.preview;
    const info = { title: '', meta: [], note: '', action: null, items: null, skip: false, label: '' };
    const count = (done, total, unit) => `${done}/${total}${unit}`;
    const R = Core.MINUTES.review;
    switch (task.kind) {
      case 'review': {
        info.title = '오늘 복습 · 한국어 보고 영어로';
        if (task.done) info.meta.push(p.total ? `${p.total}문장 복습했어요` : '복습할 문장이 없었어요');
        else if (!live) info.meta.push(later || `몰라요·애매해요로 돌아오는 문장 · 하루 최대 ${Core.CAPS.review}문장`, minutes(task.minutes));
        else if (p.frozen) {
          info.meta.push(count(p.count, p.total, '문장'), minutes(p.left.length * R));
          info.action = { type: 'button', label: `이어서 ${Core.blockSize(p.left.length)}문장` };
        } else if (p.total) {
          info.meta.push(`${p.total}문장`, splitText(p.total), minutes(p.total * R));
          info.action = { type: 'button', label: '복습 시작' };
          if (p.due > p.total) info.note = `돌아온 ${p.due}문장 중 오래된 ${p.total}개를 오늘 해요. 나머지는 내일 복습이나 복습하기에 남아요.`;
          else if (p.due < p.total) info.note = `오늘 돌아온 문장이 ${p.due}개뿐이라, 약한 문장과 앞에서 알아요로 넘긴 문장을 더해 ${p.total}개를 복습해요.`;
        } else {
          info.meta.push('오늘 복습할 문장이 없어요');
          info.action = { type: 'button', label: '확인했어요' };
        }
        break;
      }
      case 'check': {
        info.title = '누적 점검 · 알아요 문장 다시 말하기';
        const range = day.n > 2 ? `1~${day.n - 1}일 차` : '1일 차';
        if (p.empty) info.meta.push('점검할 알아요 문장이 아직 없어요');
        else if (task.done) info.meta.push(p.frozen ? `${p.total}문장 점검했어요` : '점검할 알아요 문장이 없었어요');
        else if (!live) info.meta.push(later || `${range}에 알아요로 넘긴 문장 ${task.size}개`, minutes(task.minutes));
        else if (p.frozen) {
          info.meta.push(count(p.count, p.total, '문장'), minutes(p.left.length * R));
          info.action = { type: 'button', label: `이어서 ${Core.blockSize(p.left.length)}문장` };
        } else {
          info.meta.push(`${range}에 알아요로 넘긴 문장 ${p.total}개`, minutes(p.total * R));
          info.action = { type: 'button', label: '점검 시작' };
        }
        if (!task.done) info.note = '알아요로 넘긴 문장은 복습에 다시 오지 않아요. 한국어만 보고 영어로 말해 보고, 막히면 몰라요를 눌러 복습으로 보내요.';
        break;
      }
      case 'notes': {
        info.title = '마이노트 다시 풀기';
        if (p.skipped) {
          info.meta.push('오늘은 건너뛰었어요');
          info.label = '건너뜀';
        } else if (p.empty) info.meta.push('마이노트가 비어 있어요 · 채점에서 약했던 문항이 모이면 그날 다시 풀어요');
        else if (task.done) info.meta.push(p.total ? `약점 문항 ${p.total}개를 다시 풀었어요` : '마이노트가 비어 있었어요');
        else if (!live) info.meta.push(later || `앞 모의고사에서 약했던 문항 최대 ${task.target}개`, minutes(task.minutes));
        else if (p.frozen) {
          info.meta.push(count(p.count, p.total, '문항'), minutes((p.total - p.count) * Core.MINUTES.retake));
          info.items = p.items.map((item) => {
            const [exam, no] = item.key.split(':');
            return { label: `${view.plan.titles.get(exam) || exam} Q${no}`, done: item.done, href: mockHref(exam, 'practice', Number(no)) };
          });
          const next = info.items.find((item) => !item.done);
          info.action = { type: 'link', href: next.href, label: `${next.label} 연습하기` };
          info.skip = true;
          info.note = '연습 모드에서 그 문항 타이머를 끝까지 실행하면 돼요. 마이크가 없으면 "녹음 없이 진행"을 눌러요. 마이노트의 다시 풀기로 채점까지 받아도 돼요.';
        } else {
          info.meta.push(`약점 문항 ${p.total}개`, minutes(p.total * Core.MINUTES.retake));
          info.action = { type: 'button', label: '다시 풀 문항 보기' };
          info.skip = true;
        }
        break;
      }
      case 'tips': {
        info.title = `학습 팁 · ${task.sections.length}묶음`;
        info.meta.push(tipList(task.sections));
        info.meta.push(task.done ? '모두 읽고 말해 봤어요' : (started && p.count ? count(p.count, p.total, '묶음 확인') : minutes(task.minutes)));
        if (started) info.action = { type: 'button', label: task.done ? '다시 보기' : (p.count ? '이어 읽기' : '읽기') };
        // 실제기출 뒤의 팁(기출 유형·감점 기준·예제)에는 그 시험의 문항과 답이 나와요.
        const realDay = dayOfExam(view.plan, Core.TIP_EXAMPLE_EXAM);
        if (!task.done && started && task.day > realDay && !mockDone(view, Core.TIP_EXAMPLE_EXAM)) {
          info.note = `이 날 팁에는 ${realDay}일 차 실제기출의 문항과 모범 답안이 나와요. 그 시험을 먼저 보세요.`;
        }
        break;
      }
      case 'cards': {
        const total = task.ids.length;
        const left = total - (p.count || 0);
        if (task.part === 'scene') {
          info.title = `사진·표 카드 · ${task.examTitle}`;
          info.meta.push(`Part 2 ${task.split.part2}장 · Part 4 ${task.split.part4}장`, '문제 보고 답하기');
          if (!task.done && started && !mockDone(view, task.exam)) info.note = '이 카드에 같은 시험의 모범 답안이 있어요. 시험을 먼저 풀어 보세요.';
        } else {
          info.title = task.part === 'extra' ? '추가 문장' : `${task.part === 'part3' ? 'Part 3' : 'Part 5'} 문장 · ${Core.joinNames(task.names)}`;
          info.meta.push(`${total}문장`);
          if (!task.done && !p.count && splitText(total)) info.meta.push(splitText(total));
        }
        if (task.done) info.meta.push('완료');
        else if (started && p.count) info.meta.push(count(p.count, total, ''), minutes(task.minutes * (left / total)));
        else info.meta.push(minutes(task.minutes));
        if (started) info.action = { type: 'button', label: task.done ? '다시 연습' : (p.count ? `이어서 ${Core.blockSize(left)}장` : '시작') };
        break;
      }
      case 'mock': {
        info.title = `모의고사 · ${task.examTitle} ${MODE_LABEL[task.mode]}`;
        if (task.mode === 'exam') {
          info.meta.push('11문항 · 실제 시험 시간', task.done ? '완료' : minutes(task.minutes));
          if (!task.done) info.note = '타이머가 자동으로 넘어가요. 11문항을 끝까지 응시하면 완료돼요.';
        } else {
          info.meta.push(task.done ? '11문항 완료' : `문항마다 타이머로 답하기 · ${count(p.count || 0, 11, '문항')}`);
          if (!task.done) {
            info.meta.push(minutes(task.minutes));
            info.note = '연습 모드에서 11문항 모두 문항 타이머를 끝까지 실행하면 완료돼요. 녹음 없이 진행해도 돼요.';
          }
        }
        if (started) {
          const label = task.done ? '다시 보기' : (task.mode === 'exam' ? '응시하기' : (p.count ? '이어서 연습' : '연습하기'));
          info.action = { type: 'link', href: mockHref(task.exam, task.mode), label };
        }
        break;
      }
      case 'guide': {
        info.title = `해설 · ${task.examTitle}`;
        // 해설에는 그 시험의 모범 답안이 있어서, 같은 날 모의고사를 끝내기 전에는 열지 않아요(확인도 세지 않아요).
        if (!task.done && p.locked) {
          info.meta.push('문항별 모범 답안 · 11문항', minutes(task.minutes));
          if (started) info.note = '해설에 이 시험의 모범 답안이 있어요. 모의고사를 먼저 끝내면 열려요.';
          break;
        }
        info.meta.push(task.done ? '11문항 확인했어요' : `문항별 모범 답안 · ${count(p.count || 0, 11, '문항 확인')}`);
        if (!task.done) {
          info.meta.push(minutes(task.minutes * (1 - (p.count || 0) / 11)));
          info.note = '문항마다 모범 답안을 읽고 소리 내어 말해 본 뒤 "읽고 말해 봤어요"를 누르면 다음 문항으로 넘어가요.';
        }
        if (started) info.action = { type: 'link', href: mockHref(task.exam, 'guide'), label: task.done ? '다시 보기' : (p.count ? '이어서 보기' : '해설 보기') };
        break;
      }
      default:
        break;
    }
    info.meta = info.meta.filter(Boolean);
    return info;
  }

  function actionMarkup(task, info, primary) {
    if (!info.action) return '';
    const cls = primary ? 'btn-primary' : 'btn-secondary pt-go';
    const label = `${info.title} ${info.action.label}`;
    const arrow = primary ? ' <i data-ic="arrowRight"></i>' : '';
    if (info.action.type === 'link') {
      return `<a class="${cls}" href="${esc(info.action.href)}" aria-label="${esc(label)}">${esc(info.action.label)}${arrow}</a>`;
    }
    return `<button class="${cls}" type="button" data-action="plan-start" data-task="${esc(task.id)}" aria-label="${esc(label)}">${esc(info.action.label)}${arrow}</button>`;
  }

  function taskMarkup(task, day, view, index) {
    const info = describeTask(task, day, view);
    const doing = !task.done && !view.preview && Boolean(task.progress.count || task.progress.frozen);
    const status = info.label || (task.done ? '완료' : doing ? '하는 중' : '할 일');
    const mark = info.label ? '–' : task.done ? '<i data-ic="check"></i>' : index + 1;
    const items = info.items
      ? `<ul class="pt-items">${info.items.map((item) => `<li class="${item.done ? 'is-done' : ''}">${esc(item.label)} · ${item.done ? '완료' : '남음'}</li>`).join('')}</ul>`
      : '';
    const extra = info.skip
      ? `<button class="btn-secondary pt-skip" type="button" data-action="plan-notes-skip" data-day="${day.n}">오늘은 건너뛰기</button>`
      : '';
    return `<li class="plan-task${info.label ? ' is-skipped' : task.done ? ' is-done' : doing ? ' is-doing' : ''}">
      <span class="pt-mark" aria-hidden="true">${mark}</span>
      <div class="pt-main">
        <p class="pt-title">${esc(info.title)}<span class="sr-only"> · ${status}</span></p>
        <p class="pt-meta">${info.meta.map(esc).join(' · ')}</p>
        ${items}
        ${info.note ? `<p class="pt-note">${esc(info.note)}</p>` : ''}
      </div>
      ${info.action || extra ? `<div class="pt-actions">${actionMarkup(task, info, false)}${extra}</div>` : ''}
    </li>`;
  }

  function nextTask(day, view) {
    if (!day) return null;
    const task = day.tasks.find((item) => !item.done && describeTask(item, day, view).action);
    return task ? { task, info: describeTask(task, day, view) } : null;
  }

  // ---------- 날 ----------
  function dayCounts(day) {
    const cards = day.tasks.filter((task) => task.kind === 'cards');
    const sentences = cards.filter((task) => task.part !== 'scene').reduce((sum, task) => sum + task.ids.length, 0);
    const scenes = cards.filter((task) => task.part === 'scene').reduce((sum, task) => sum + task.ids.length, 0);
    const tips = day.tasks.filter((task) => task.kind === 'tips').reduce((sum, task) => sum + task.sections.length, 0);
    const mock = day.tasks.find((task) => task.kind === 'mock');
    const check = day.tasks.find((task) => task.kind === 'check');
    return [
      sentences ? `새 문장 ${sentences}` : '',
      scenes ? `사진·표 ${scenes}` : '',
      tips ? `팁 ${tips}묶음` : '',
      mock ? `${mock.examTitle} ${mock.mode === 'exam' ? '실전' : '연습'}·해설` : '',
      day.tasks.some((task) => task.kind === 'notes') ? '마이노트' : '',
      check ? `누적 점검 ${check.size}` : '',
    ].filter(Boolean).join(' · ');
  }

  function dayStateText(day, view) {
    if (day.status === 'done') return '완료';
    if (view.preview) return day.n === 1 ? '첫날' : '예정';
    if (day.status === 'current') return view.completedToday || view.beforeStart ? '다음' : '오늘';
    return '예정';
  }

  // 자정~새벽 4시에 시작한 밤에 끝낸 날은 공부한 날(새벽 4시 기준)이 시작일 하루 전이에요.
  // '오늘'·'어제'로 보이는 동안은 그대로 두고, 날짜로 보일 때는 시작일보다 앞선 날짜 대신 시작일(그 밤의 달력 날짜)을 보여 줘요.
  function doneDate(day, view) {
    return day.date < view.startDate && day.date < Core.addDays(view.today, -1) ? view.startDate : day.date;
  }

  function dayMarkup(day, view) {
    const dateText = day.status === 'done' ? `${dateLabel(doneDate(day, view), view.today)} 완료` : dateLabel(day.date, view.today);
    return `<li><details class="plan-day is-${day.status}" data-plan-day="${day.n}"${openDays.has(day.n) ? ' open' : ''}>
      <summary class="pd-sum">
        <span class="pd-no" aria-hidden="true">${day.status === 'done' ? '<i data-ic="check"></i>' : day.n}</span>
        <span class="pd-main">
          <span class="pd-title">${day.n}일 차 · ${esc(day.theme)}</span>
          <span class="pd-meta">${esc(dateText)} · 약 ${day.minutes}분</span>
          <span class="pd-meta">${esc(dayCounts(day))}</span>
        </span>
        <span class="pd-state">${dayStateText(day, view)}</span>
      </summary>
      <div class="pd-body">
        ${day.focus ? `<p class="pd-focus">${esc(day.focus)}</p>` : ''}
        <ol class="plan-tasks compact">${day.tasks.map((task, index) => taskMarkup(task, day, view, index)).join('')}</ol>
      </div>
    </details></li>`;
  }

  function average(view) {
    return Math.round(view.days.reduce((sum, day) => sum + day.minutes, 0) / view.days.length);
  }

  function daysPanel(view) {
    return `<section class="panel plan-days" aria-labelledby="plan-days-title">
      <div class="panel-head"><h2 id="plan-days-title">14일 일정</h2><span class="tag">하루 평균 약 ${average(view)}분</span></div>
      <ol class="plan-day-list">${view.days.map((day) => dayMarkup(day, view)).join('')}</ol>
    </section>`;
  }

  // ---------- 진행 ----------
  function bar(label, done, total, unit) {
    const percent = total ? Math.round((done / total) * 100) : 0;
    return `<div class="part-row plan-row"><span>${esc(label)}</span><div class="track" aria-hidden="true"><i style="width:${percent}%"></i></div><span class="val">${done} / ${total}${unit}</span></div>`;
  }

  function progressPanel(view) {
    const t = view.totals;
    return `<section class="panel plan-progress" aria-labelledby="plan-progress-title">
      <h2 class="section-title" id="plan-progress-title">전체 진행 <span>${t.days.done} / ${t.days.total}일 완료</span></h2>
      ${bar('문장 카드', t.cards.done, t.cards.total, '')}
      ${bar('학습 팁', t.tips.done, t.tips.total, '묶음')}
      ${bar('모의고사', t.mocks.done, t.mocks.total, '회')}
      ${bar('해설', t.guides.done, t.guides.total, '회')}
    </section>`;
  }

  function scheduleText(view) {
    if (view.finishedAt) return '14일 계획 완주';
    if (view.completedToday && view.ahead <= 0) return view.ahead < 0 ? `오늘 분량은 마쳤어요 · 예정보다 ${-view.ahead}일 늦어요` : '오늘 분량을 마쳤어요';
    if (view.ahead > 0) return `예정보다 ${view.ahead}일 앞서요`;
    if (view.ahead < 0) return `예정보다 ${-view.ahead}일 늦어요 · 멈춘 날부터 이어서 해요`;
    return '계획대로 진행 중';
  }

  // 안내 글의 날짜·개수는 일정표에서 읽어요(일정표를 바꿔도 글이 어긋나지 않게).
  function howPanel(view, open) {
    const M = Core.MINUTES;
    const C = Core.CAPS;
    const days = view.days;
    const has = (day, slot) => day.tasks.some((task) => task.slot === slot);
    const lastNew = Math.max(...days.filter((day) => has(day, 'p3') || has(day, 'p5') || has(day, 'extra')).map((day) => day.n));
    const mocks = days.flatMap((day) => day.tasks.filter((task) => task.kind === 'mock').map((task) => ({ n: day.n, mode: task.mode })));
    const join = (list) => list.map((item) => item.n).join('·');
    const checks = days.filter((day) => has(day, 'check')).map((day) => day.n).join('·');
    const by = view.plan.coverage.cards.byPart;
    return `<details class="panel plan-how"${open ? ' open' : ''}>
      <summary class="plan-how-sum"><h2>이렇게 진행해요</h2></summary>
      <div class="plan-how-body">
        <ul class="plan-points">
          <li><b>하루 순서</b> 복습 → (누적 점검·마이노트) → 학습 팁 → 새 문장 → 사진·표 카드 → 모의고사 → 해설. 순서대로 하면 배운 틀을 바로 써 봐요.</li>
          <li><b>새 문장은 ${lastNew}일 차까지</b> Part 3 ${by.part3.assigned}개·Part 5 ${by.part5.assigned}개를 주제와 기능별로 나눴어요. 한 번에 ${C.block}장 이하로 나눠 해요. ${lastNew + 1}~${days.length}일 차는 새 문장 없이 실전과 약점 점검만 해요.</li>
          <li><b>모의고사</b> ${join(mocks.filter((item) => item.mode === 'practice'))}일 차는 연습 모드, ${join(mocks.filter((item) => item.mode === 'exam'))}일 차는 실전 시험이에요(${dayOfExam(view.plan, Core.TIP_EXAMPLE_EXAM)}일 차는 2025 하반기 실제기출). 해설은 같은 날 보고, 그 시험의 사진·표 카드는 다음 날 다시 답해요.</li>
          <li><b>오래 남기기</b> 몰라요·애매해요는 다음 날부터 복습으로 돌아와요(하루 최대 ${C.review}문장). 돌아온 문장이 적은 날은 약한 문장과 알아요 문장을 더해 ${C.reviewTopUp}문장은 복습해요. 알아요로 넘긴 문장은 ${checks}일 차 누적 점검에서 다시 말해 봐요. 채점에서 약했던 문항은 모의고사 다음 날 마이노트로 다시 풀어요.</li>
        </ul>
        <p class="plan-sub">완료는 이렇게 세요</p>
        <ul class="plan-points">
          <li>문장·카드: 계획을 시작한 뒤 한 번 이상 평가하면(학습하기·복습하기에서 해도 돼요). 평가를 되돌리면 다시 할 일로 돌아가요. 하루를 끝낸 평가를 되돌리면 그 날도 다시 열려요.</li>
          <li>학습 팁·해설: 묶음·문항마다 읽고 소리 내어 말해 본 뒤 '읽고 말해 봤어요'를 누르면. 해설은 같은 날 모의고사를 끝낸 뒤에 세요.</li>
          <li>모의고사: 실전은 11문항을 끝까지 응시하면, 연습은 11문항 모두 문항 타이머를 끝까지 실행하면</li>
          <li>복습·누적 점검: 그날 처음 열 때 정한 문장을 모두 평가하면 · 마이노트: 그날 고른 문항(최대 ${C.notes}개)을 연습 타이머나 다시 풀기로 끝내면. 마이노트가 비어 있으면 완료, 건너뛰면 '건너뜀'으로 남아요.</li>
        </ul>
        <p class="plan-sub">하루를 놓치거나 미리 할 때</p>
        <ul class="plan-points">
          <li>놓친 날은 건너뛰지 않아요. 다음에 열면 멈춘 날부터 이어서 하고, 남은 날이 하루씩 뒤로 밀려요.</li>
          <li>앞으로 할 날의 문장·팁·모의고사는 미리 해도 돼요. 복습·누적 점검·마이노트는 그날이 되어야 열려요. 날은 1일 차부터 차례로, 하루에 한 날씩 끝나요.</li>
          <li>날짜는 새벽 4시에 바뀌어요. 밤늦게 이어서 한 공부는 시작한 날의 공부로 세요.</li>
          <li>자정부터 새벽 4시 사이에 계획을 시작하면 1일 차는 그날 새벽 4시부터예요. 그 전에 한 문장·팁·모의고사는 1일 차를 미리 한 것으로 세요.</li>
          <li>다시 시작하면 1일 차부터 다시 진행하고 완료 표시만 처음부터 다시 세요. 학습·모의고사 기록, 복습 큐, 마이노트는 그대로예요.</li>
        </ul>
        <p class="plan-sub">분량은 이렇게 셌어요</p>
        <p class="plan-hint">새 문장 45초, 복습·점검 ${Math.round(M.review * 60)}초(복습은 하루 최대 ${C.review}문장 = ${M.reviewBudget}분), 사진 카드 ${M.scene.part2}분·표 카드 ${M.scene.part4}분, 학습 팁은 글 길이(한국어 분당 500자·영어 분당 120단어), 모의고사 ${M.mockRun}분(시험 12분+점검·결과), 해설 ${M.guide}분(등급별 실제 답변이 있으면 ${M.guide + M.guideSamples}분), 마이노트 1문항 ${M.retake}분.</p>
      </div>
    </details>`;
  }

  function archiveText(archive) {
    if (!archive.length) return '';
    const last = archive[0];
    return `<p class="plan-hint">지난 계획 ${archive.length}회 · 가장 최근 ${shortDate(Core.planStartDate(Date.parse(last.startedAt)))} 시작, ${last.finished ? '완주' : last.days ? `${last.days}일 차까지 진행` : '마친 날 없음'}</p>`;
  }

  function managePanel(view) {
    return `<section class="panel plan-manage" aria-labelledby="plan-manage-title">
      <h2 class="section-title" id="plan-manage-title">계획 관리 <span>${shortDate(view.startDate)} 시작</span></h2>
      <p class="plan-hint">다시 시작하면 1일 차부터 다시 진행하고, 완료 표시만 처음부터 다시 세요. 학습·모의고사 기록, 복습 큐, 마이노트는 그대로 남아요.</p>
      ${archiveText(view.value.archive)}
      <div class="plan-manage-actions">
        <button class="btn-secondary" type="button" data-action="plan-restart"><i data-ic="refresh"></i> 처음부터 다시 시작</button>
        <button class="btn-secondary btn-danger" type="button" data-action="plan-stop"><i data-ic="x"></i> 계획 그만두기</button>
      </div>
    </section>`;
  }

  // ---------- 화면 ----------
  function pageHead(plan) {
    const c = plan.coverage;
    return `<section class="page-head"><div class="eyebrow">${esc(DEF.title)}</div><h1>14일 동안 모든 문장과<br>모의고사를 끝까지</h1>
      <p>문장 카드 ${c.cards.total}개 · 학습 팁 ${c.tips.total}묶음 · 모의고사 ${c.exams.assigned}회(${c.exams.questions}문항)와 해설을 14일로 나눴어요.</p></section>`;
  }

  // 건너뛴 마이노트는 하루를 마치는 데는 들어가지만 '완료'로 세지 않고 따로 보여요.
  function dayCount(day) {
    const skipped = day.tasks.filter((task) => task.done && task.progress && task.progress.skipped).length;
    const done = day.tasks.filter((task) => task.done).length - skipped;
    return { resolved: done + skipped, text: `${done}/${day.tasks.length} 완료${skipped ? ` · 건너뜀 ${skipped}` : ''}` };
  }

  function todayPanel(view) {
    const day = view.days[view.current - 1];
    const next = nextTask(day, view);
    const heading = view.completedToday || view.beforeStart ? `내일 할 일 미리 하기 · ${day.n}일 차` : `오늘의 프로그램 · ${day.n}일 차`;
    let lead = day.focus;
    if (view.completedToday) lead = '오늘 분량을 마쳤어요. 여기서 쉬어도 되고, 내일 몫의 문장·팁·모의고사는 미리 해도 좋아요. 복습·누적 점검·마이노트는 내일 열려요.';
    else if (view.beforeStart) lead = '1일 차는 새벽 4시에 시작해요. 그 전에 하는 문장·팁·모의고사는 1일 차를 미리 하는 거라, 다 못 끝내도 밀리지 않아요.';
    return `<section class="panel plan-today" aria-labelledby="plan-today-title">
      <div class="panel-head"><h2 id="plan-today-title">${esc(heading)}</h2><span class="tag">${esc(dayCount(day).text)}</span></div>
      <p class="plan-theme"><b>${esc(day.theme)}</b> · ${esc(minutes(day.leftMinutes))} 남음</p>
      ${lead ? `<p class="plan-lead">${esc(lead)}</p>` : ''}
      ${next ? `<div class="plan-next">
        <div class="pn-copy"><span class="pn-label">다음 할 일</span><strong>${esc(next.info.title)}</strong><span>${next.info.meta.map(esc).join(' · ')}</span></div>
        ${actionMarkup(next.task, next.info, true)}
      </div>` : ''}
      <ol class="plan-tasks">${day.tasks.map((task, index) => taskMarkup(task, day, view, index)).join('')}</ol>
    </section>`;
  }

  function finishedPanel(view) {
    const end = view.finishedAt ? Core.studyDate(Date.parse(view.finishedAt)) : view.today;
    const spent = Core.daysBetween(view.startDate, end) + 1;
    const late = spent - view.days.length;
    return `<section class="panel plan-finished done-card" aria-labelledby="plan-finished-title">
      <div class="done-icon"><i data-ic="check"></i></div>
      <h2 id="plan-finished-title" tabindex="-1">14일 계획을 끝까지 마쳤어요</h2>
      <p>${shortDate(view.startDate)}에 시작해 ${shortDate(end)}에 마쳤어요 · ${spent}일 걸렸어요${late > 0 ? ` (예정보다 ${late}일 더)` : late < 0 ? ` (예정보다 ${-late}일 빨리)` : ''}</p>
      <p>복습은 계속 이어가요. 몰라요·애매해요 문장은 예정일마다 복습하기에 돌아와요.</p>
      <div class="plan-finished-actions">
        <a class="btn-primary" href="#/review"><i data-ic="repeat"></i> 복습하기</a>
        <button class="btn-secondary" type="button" data-action="plan-restart"><i data-ic="refresh"></i> 처음부터 다시 시작</button>
      </div>
    </section>`;
  }

  function startPanel(view) {
    const last = view.days[view.days.length - 1];
    const range = (list) => `${Math.min(...list.map((day) => day.minutes))}~${Math.max(...list.map((day) => day.minutes))}분`;
    const newDays = view.days.filter((day) => day.tasks.some((task) => task.slot === 'p3' || task.slot === 'p5'));
    const restDays = view.days.filter((day) => !newDays.includes(day));
    const stored = Core.read().value;
    return `<section class="panel plan-start" aria-labelledby="plan-start-title">
      <h2 id="plan-start-title">오늘 시작하면 ${esc(dateLabel(last.date, view.today))}에 끝나요</h2>
      <ul class="plan-points">
        <li><b>하루 약 ${average(view)}분</b> 새 문장이 있는 1~${newDays.length}일 차는 ${range(newDays)}, 실전 주간인 ${newDays.length + 1}~${view.days.length}일 차는 ${range(restDays)}이에요.</li>
        <li><b>오늘 할 일만 따라가면 돼요</b> 각 할 일의 시작 버튼이 맞는 문장 세트·팁 묶음·모의고사와 모드를 바로 열어요.</li>
        <li><b>기록은 그대로</b> 계획은 지금까지의 학습·모의고사 기록을 지우거나 바꾸지 않아요. 계획을 시작한 뒤의 활동만 세요.</li>
      </ul>
      ${archiveText(stored ? stored.archive : [])}
      <div class="plan-start-cta">
        <button class="btn-primary" type="button" data-action="plan-begin">오늘부터 시작하기 <i data-ic="arrowRight"></i></button>
      </div>
    </section>`;
  }

  function render() {
    if (!Core || !DEF || !freshPlan().days.length) {
      return '<section class="page-head"><h1>14일 계획을 불러오지 못했어요</h1><p>데이터 파일을 확인한 뒤 새로고침해 주세요.</p></section>';
    }
    const view = snapshot();
    if (!view) {
      const preview = previewView();
      return `<div class="plan-page">${pageHead(preview.plan)}
        <div class="plan-grid">
          <div class="plan-col">${startPanel(preview)}${howPanel(preview, true)}</div>
          <div class="plan-col">${daysPanel(preview)}</div>
        </div>
      </div>`;
    }
    if (!view.current) {
      return `<div class="plan-page">${pageHead(view.plan)}
        <div class="plan-grid">
          <div class="plan-col">${finishedPanel(view)}${progressPanel(view)}</div>
          <div class="plan-col">${daysPanel(view)}${managePanel(view)}</div>
        </div>
      </div>`;
    }
    const day = view.days[view.current - 1];
    return `<div class="plan-page">${pageHead(view.plan)}
      <div class="summary-bar plan-status" role="status">
        <span><strong>${day.n}일 차 / ${view.days.length}</strong> · ${esc(scheduleText(view))}</span>
        <span class="tag">완주 예정 ${esc(shortDate(view.finishDate))}</span>
      </div>
      <div class="plan-grid">
        <div class="plan-col">${todayPanel(view)}${howPanel(view, false)}</div>
        <div class="plan-col">${progressPanel(view)}${daysPanel(view)}${managePanel(view)}</div>
      </div>
    </div>`;
  }

  // 홈 맨 위 카드: 오늘 무엇을 하면 되는지 한눈에.
  function homeMarkup() {
    if (!Core || !DEF || !freshPlan().days.length) return '';
    const view = snapshot();
    if (!view) {
      const c = freshPlan().coverage;
      return `<section class="panel plan-home" aria-labelledby="plan-home-title">
        <div class="ph-copy">
          <p class="eyebrow">${esc(DEF.title)}</p>
          <h2 id="plan-home-title">14일이면 모든 문장·팁·모의고사를 한 번씩 끝내요</h2>
          <p class="ph-desc">하루 약 ${average(previewView())}분 · 문장 카드 ${c.cards.total}개 · 학습 팁 ${c.tips.total}묶음 · 모의고사 ${c.exams.assigned}회와 해설</p>
        </div>
        <div class="ph-actions"><a class="btn-primary" href="#/plan">계획 살펴보기 <i data-ic="arrowRight"></i></a></div>
      </section>`;
    }
    if (!view.current) {
      return `<section class="panel plan-home" aria-labelledby="plan-home-title">
        <div class="ph-copy">
          <p class="eyebrow">${esc(DEF.title)} · 완주</p>
          <h2 id="plan-home-title">14일 계획을 끝까지 마쳤어요</h2>
          <p class="ph-desc">복습은 계속 이어가요. 몰라요·애매해요 문장은 예정일마다 돌아와요.</p>
        </div>
        <div class="ph-actions"><a class="btn-secondary" href="#/plan">결과 보기 <i data-ic="chevronRight"></i></a></div>
      </section>`;
    }
    const day = view.days[view.current - 1];
    const tally = dayCount(day);
    const next = nextTask(day, view);
    const percent = Math.round((tally.resolved / day.tasks.length) * 100);
    const early = view.completedToday || view.beforeStart;
    let title = `오늘의 프로그램 ${tally.text}`;
    if (view.completedToday) title = '오늘 분량을 마쳤어요';
    else if (view.beforeStart) title = '1일 차는 새벽 4시에 시작해요';
    return `<section class="panel plan-home is-active" aria-labelledby="plan-home-title">
      <div class="ph-copy">
        <p class="eyebrow">${esc(DEF.title)} · ${day.n}일 차${early ? ' 미리 하기' : ''}</p>
        <h2 id="plan-home-title">${esc(title)}</h2>
        <p class="ph-desc">${esc(day.theme)} · ${esc(scheduleText(view))} · ${esc(minutes(day.leftMinutes))} 남음</p>
        <div class="plan-bar" role="progressbar" aria-label="${day.n}일 차 진행" aria-valuemin="0" aria-valuemax="${day.tasks.length}" aria-valuenow="${tally.resolved}" aria-valuetext="${esc(tally.text)}"><i style="width:${percent}%"></i></div>
      </div>
      ${next ? `<div class="plan-next">
        <div class="pn-copy"><span class="pn-label">${early ? '내일 할 일' : '다음 할 일'}</span><strong>${esc(next.info.title)}</strong><span>${next.info.meta.map(esc).join(' · ')}</span></div>
        ${actionMarkup(next.task, next.info, true)}
      </div>` : ''}
      <a class="ph-link" href="#/plan">14일 일정 전체 보기 <i data-ic="chevronRight"></i></a>
    </section>`;
  }

  // ---------- 학습 팁 화면 연결 ----------
  // js/tips.js 가 그릴 때 한 번 불러요: 위쪽 안내 줄, 묶음 제목 옆 표시, 묶음 끝 '읽고 말해 봤어요' 버튼.
  function tipsHook(part) {
    if (!Core || !DEF) return null;
    const view = snapshot();
    if (!view) return null;
    const tips = view.value.tips;
    const day = view.current ? view.days[view.current - 1] : null;
    const task = day ? day.tasks.find((item) => item.kind === 'tips') : null;
    const dayOf = (key) => view.plan.tipDay.get(`${part}:${key}`);
    let banner = '';
    if (task) {
      const read = task.sections.filter((tip) => tips[`${tip.part}:${tip.key}`]).length;
      banner = `<section class="plan-tipbar" aria-label="14일 계획 학습 팁">
        <div class="ptb-copy"><strong>${day.n}일 차 학습 팁 · ${read}/${task.sections.length} 확인</strong><span>${esc(tipList(task.sections))}</span></div>
        <a class="btn-secondary" href="#/plan" id="plan-tip-back">계획으로</a>
      </section>`;
    }
    return {
      banner,
      badge(key) {
        const n = dayOf(key);
        if (!n) return '';
        if (tips[`${part}:${key}`]) return '<span class="tip-plan is-read"><span class="sr-only">14일 계획 · </span>확인</span>';
        if (day && n === day.n) return '<span class="tip-plan is-today"><span class="sr-only">14일 계획 · </span>오늘</span>';
        return `<span class="tip-plan"><span class="sr-only">14일 계획 · </span>${n}일 차</span>`;
      },
      footer(key) {
        const n = dayOf(key);
        if (!n) return '';
        if (tips[`${part}:${key}`]) return `<p class="tip-plan-foot is-read"><i data-ic="check"></i> 읽고 말해 봤어요 · 14일 계획 ${n}일 차 팁</p>`;
        return `<div class="tip-plan-foot">
          <button class="btn-secondary" type="button" data-action="plan-tip-read" data-part="${part}" data-key="${esc(key)}" data-run="${esc(view.run)}"><i data-ic="check"></i> 읽고 말해 봤어요</button>
          <span>예문을 소리 내어 말해 본 뒤 눌러요 · 14일 계획 ${n}일 차 팁</span>
        </div>`;
      },
    };
  }

  function focusTip(part, key) {
    const group = document.querySelector(`.tip-group[data-tip-key="${CSS.escape(key)}"]`);
    if (!group || !window.StudyTips || window.StudyTips.part !== part) return;
    group.open = true;
    group.scrollIntoView({ block: 'start', behavior: 'auto' });
    const summary = group.querySelector('summary');
    if (summary) {
      try { summary.focus({ preventScroll: true }); } catch (error) { summary.focus(); }
    }
  }

  function openTip(tip) {
    window.StudyTips.openSection(tip.part, tip.key);
    if (route() === 'tips') {
      bridge().refresh();
      focusTip(tip.part, tip.key);
      return;
    }
    pendingTip = tip;
    location.hash = '#/tips';
  }

  // ---------- 학습 완료 화면 연결 ----------
  function doneMarkup(info) {
    const back = (primary) => `<a class="${primary ? 'btn-primary' : 'btn-secondary'}" href="#/plan"><i data-ic="calendar"></i> 14일 계획으로</a>`;
    const view = snapshot();
    const task = view && info && info.run === view.run ? Core.findTask(view.plan, info.taskId) : null;
    if (!task) return back(true);
    const day = view.days[task.day - 1];
    const live = day.tasks.find((item) => item.id === task.id);
    const progress = live.progress;
    let more = '';
    if (!live.done && task.kind === 'cards') {
      const left = task.ids.length - progress.count;
      more = `${left}문장 남았어요 · 이어서 ${Core.blockSize(left)}장`;
    } else if (!live.done && progress.frozen && progress.left.length) {
      more = `${task.kind === 'review' ? '복습' : '점검'} 이어서 ${Core.blockSize(progress.left.length)}문장`;
    }
    const finishedDay = day.status === 'done' && Date.now() - Date.parse(day.completedAt) < 5000;
    const note = finishedDay ? `<p class="plan-done-note" role="status">${day.n}일 차를 모두 마쳤어요!</p>` : '';
    if (more) {
      return `${note}<button class="btn-primary" type="button" data-action="plan-start" data-task="${esc(task.id)}">${esc(more)} <i data-ic="arrowRight"></i></button>${back(false)}`;
    }
    return `${note}${back(true)}`;
  }

  // ---------- 계획 기록 저장 확인 ----------
  // 계획에 쓰는 일은 저장된 것을 확인한 뒤에만 다음으로 넘어가요. 저장하지 못하면 넘어가지 않고 알려서 다시 누를 수 있게 해요.
  const settle = (promise) => promise.catch(() => ({ ok: false }));

  function saved(api, result, target) {
    if (result && result.ok) return true;
    if (target) target.disabled = false;
    if (result && result.skipped) {
      // 그사이 다른 탭에서 계획을 다시 시작했거나 그만둔 경우예요.
      api.refresh();
      api.toast('계획이 바뀌어서 이 기록은 남기지 않았어요.');
    } else {
      api.toast('브라우저 저장 공간을 쓸 수 없어 저장하지 못했어요. 다시 시도해 주세요.');
    }
    return false;
  }

  // ---------- 할 일 시작 ----------
  function startTask(task, view) {
    const api = bridge();
    const ctx = context();
    const day = view.days[task.day - 1];
    const base = { taskId: task.id, label: `14일 계획 · ${task.day}일 차`, run: view.run, sceneMode: 'answer' };
    if (task.kind === 'tips') {
      const tip = task.sections.find((item) => !view.value.tips[`${item.part}:${item.key}`]) || task.sections[0];
      openTip(tip);
      return;
    }
    if (task.kind === 'cards') {
      api.startCards({ ...base, ids: Core.sessionIds(view.plan, task, view.value, ctx), kind: 'study' });
      return;
    }
    // 복습·누적 점검·마이노트는 '지금 하는 날'에, 앞날을 끝낸 공부한 날이 지나야 열려요. 처음 여는 순간 그날 목록을 정해 둬요.
    if (!day.open) return;
    const progress = Core.measure(view.plan, task, view.value, ctx, true);
    if (task.kind === 'notes') {
      settle(Core.freezeNotes(view.run, task.day, progress.pick, ctx.now)).then((result) => {
        if (saved(api, result)) api.refresh();
      });
      return;
    }
    const startReview = () => api.startCards({ ...base, ids: Core.sessionIds(view.plan, task, view.value, ctx), kind: 'review', mode: 'ko-first' });
    if (progress.frozen) {
      startReview();
      return;
    }
    // 그날 목록이 저장된 뒤에만 시작해요. 저장되지 않은 목록으로 복습하면 그 평가를 계획이 세지 못해요.
    settle(Core.freezeSet(view.run, task.kind === 'review' ? 'reviews' : 'checks', task.day, progress.pick, ctx.now)).then((result) => {
      if (!saved(api, result)) return;
      if (progress.pick.length) startReview();
      else api.refresh();
    });
  }

  function focusAfterRender(selector) {
    const element = document.querySelector(selector);
    if (!element) return;
    if (!element.hasAttribute('tabindex') && !['A', 'BUTTON'].includes(element.tagName)) element.setAttribute('tabindex', '-1');
    try { element.focus({ preventScroll: false }); } catch (error) { element.focus(); }
  }

  // done: '…시작했어요.' · today: 1일 차 안내(자정~새벽 4시에 시작하면 1일 차는 새벽 4시부터라 그렇게 알려요).
  function begin(api, done, today) {
    const now = Date.now();
    settle(Core.start(now, DEF.id, Core.freeze(freshPlan()))).then((result) => {
      if (!result.ok) {
        api.refresh();
        api.toast('브라우저 저장 공간을 쓸 수 없어 계획을 시작하지 못했어요.');
        return;
      }
      openDays.clear();
      if (route() !== 'plan') location.hash = '#/plan';
      else {
        api.refresh();
        window.scrollTo({ top: 0, behavior: 'auto' });
        focusAfterRender('#plan-today-title');
      }
      api.toast(`${done} ${result.value.startDate > Core.studyDate(now) ? '1일 차는 새벽 4시에 시작해요.' : today}`);
    });
  }

  function handle(action, target) {
    if (!action || !action.startsWith('plan-')) return false;
    const api = bridge();
    if (!api || !Core || !DEF) return true;
    switch (action) {
      case 'plan-begin':
        if (Core.current()) return true;
        target.disabled = true;
        begin(api, '14일 계획을 시작했어요.', '오늘은 1일 차예요.');
        return true;
      case 'plan-restart':
        if (window.confirm('14일 계획을 처음부터 다시 시작할까요? 1일 차부터 다시 진행하고 완료 표시만 새로 세요. 학습·모의고사 기록과 마이노트는 그대로 남아요.')) {
          begin(api, '14일 계획을 다시 시작했어요.', '오늘이 1일 차예요.');
        }
        return true;
      case 'plan-stop':
        if (!window.confirm('14일 계획을 그만둘까요? 진행 표시는 지난 계획으로 남고, 학습·모의고사 기록은 그대로예요.')) return true;
        settle(Core.stop(Date.now())).then((result) => {
          if (!saved(api, result)) return;
          openDays.clear();
          api.refresh();
          window.scrollTo({ top: 0, behavior: 'auto' });
          focusAfterRender('h1');
          api.toast('14일 계획을 그만뒀어요. 언제든 다시 시작할 수 있어요.');
        });
        return true;
      case 'plan-start': {
        const view = snapshot();
        const task = view ? Core.findTask(view.plan, target.dataset.task) : null;
        if (task) startTask(task, view);
        return true;
      }
      case 'plan-notes-skip': {
        const view = snapshot();
        const n = Number(target.dataset.day);
        if (!view || view.current !== n || !view.days[n - 1].open) return true;
        if (!window.confirm('오늘 마이노트 다시 풀기를 건너뛸까요? 이 날은 "건너뜀"으로 남고 다음 할 일로 넘어가요.')) return true;
        settle(Core.skipNotes(view.run, n, Date.now())).then((result) => {
          if (!saved(api, result)) return;
          api.refresh();
          api.toast('오늘 마이노트는 건너뛰었어요.');
        });
        return true;
      }
      case 'plan-tip-read': {
        const part = Number(target.dataset.part);
        const key = target.dataset.key || '';
        target.disabled = true;
        settle(Core.markTip(target.dataset.run, part, key, Date.now())).then((result) => {
          if (!saved(api, result, target)) return;
          const view = snapshot();
          const n = view ? view.plan.tipDay.get(`${part}:${key}`) : 0;
          const task = n ? view.days[n - 1].tasks.find((item) => item.kind === 'tips') : null;
          const next = task ? task.sections.find((tip) => !view.value.tips[`${tip.part}:${tip.key}`]) : null;
          if (next) {
            window.StudyTips.openSection(next.part, next.key);
            api.refresh();
            focusTip(next.part, next.key);
            api.announce(`확인했어요. 다음 묶음: Part ${next.part} ${next.title}`);
            return;
          }
          api.refresh();
          const tipBack = document.querySelector('#plan-tip-back');
          if (tipBack) tipBack.focus();
          if (n) api.toast(`${n}일 차 학습 팁을 모두 확인했어요.`);
        });
        return true;
      }
      default:
        return true;
    }
  }

  // 다른 탭(모의고사 화면 등)에서 계획·모의고사·마이노트가 바뀌면 계획이 보이는 화면만 다시 그려요.
  window.addEventListener('storage', (event) => {
    if (![Core && Core.KEY, MOCK_KEY, NOTES_KEY].includes(event.key)) return;
    if (!['plan', 'home', 'tips'].includes(route())) return;
    const api = bridge();
    if (api && typeof api.refresh === 'function') api.refresh();
  });

  // 계획에서 학습 팁으로 넘어갈 때: 앱이 화면을 그리고 맨 위로 올린 다음, 읽을 묶음으로 내려가요.
  window.addEventListener('hashchange', () => {
    if (!pendingTip) return;
    const tip = pendingTip;
    pendingTip = null;
    if (route() !== 'tips') return;
    window.setTimeout(() => focusTip(tip.part, tip.key), 0);
  });

  document.addEventListener('toggle', (event) => {
    const day = event.target;
    if (!day || !day.classList || !day.classList.contains('plan-day')) return;
    const n = Number(day.dataset.planDay);
    if (day.open) openDays.add(n);
    else openDays.delete(n);
  }, true);

  window.StudyPlan = {
    render,
    homeMarkup,
    tipsHook,
    doneMarkup,
    handle,
  };
})();
