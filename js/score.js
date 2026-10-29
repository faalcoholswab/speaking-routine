/* =========================================================
   토익스피킹 기준 채점 — 규칙 기반 추정 (기기 안, 결정적)
   브라우저(window.SpeakingScore)와 Node(module.exports) 모두에서 동작합니다.
   음성 인식 문장과 시험 데이터만 보며, 답변 id·문장을 코드에 두지 않습니다.

   계약
   - gradeAttempt({exam, responses, metrics, delivery})
     exam:      data/mock-0N.js 의 시험 객체 (parts[].questions[]) 또는 {questions:[]}
     responses: [{no, text}] | {[no]: {text}} | {[no]: '문장'}
     metrics:   {[no]: {speechSec, firstSpeechSec, pauses, longPauses, pauseRatio,
                        pitchMedianHz, pitchRangeSt, delivery}} · 문항별
     delivery:  '좋음' | '보통' | '아쉬움' (전 문항 공통값, metrics의 값이 우선)
   - 반환: {version, questions: {[no]: {no, score, max, criteria, feedback[], missedWords?,
            covered?, wrongFacts?, text, words, type}}, estimate: {scaled, level, pct},
            partAverages, criteriaAvg, strengths[], weaknesses[]}
   - criteria 값은 그 문항에 적용되는 기준만 숫자(0~3/0~5), 나머지는 null 입니다.
     (Part 1에 grammar 칩을 0으로 보여 주지 않도록 화면에서 null을 걸러 주세요.)
   - 점수는 추정치입니다. 화면에 항상 "추정"이라고 표시하세요.
   ========================================================= */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SpeakingScore = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const VERSION = 'v34';

  /* ---------------- 어휘 ---------------- */
  const STOPWORDS = new Set(('a an the and or but if so because as of to in on at for with from by about into over after before ' +
    'is am are was were be been being do does did doing have has had having i me my mine you your yours he him his she her hers ' +
    'it its we us our they them their this that these those there here what which who whom when where why how not no yes ' +
    'can could will would shall should may might must just very really also too than then now ' +
    'um uh er ah oh hmm like well ok okay please sorry').split(/\s+/));

  const QUESTION_WORDS = new Set('what when where why how who which whose do does did is are was were can could would should will have has had'.split(' '));

  const SYNONYMS = {
    couch: ['sofa'], sofa: ['couch'], photo: ['picture', 'photograph'], picture: ['photo', 'image'],
    shop: ['store'], store: ['shop'], kid: ['child'], children: ['kids'], man: ['gentleman'],
    woman: ['lady'], big: ['large'], large: ['big'], bag: ['sack'], cart: ['trolley'],
    checkout: ['counter', 'register'], cashier: ['clerk'], folder: ['file'], hallway: ['corridor', 'hall'],
  };

  const NUMBER_WORDS = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
    eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
    eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70,
    eighty: 80, ninety: 90, hundred: 100,
  };
  const MONTHS = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9,
    october: 10, november: 11, december: 12, jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
    sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
  };
  const WEEKDAYS = new Set('monday tuesday wednesday thursday friday saturday sunday'.split(' '));

  const FILLERS = new Set(['um', 'uh', 'er', 'ah', 'hmm', 'mm', 'eh']);

  /* ---------------- 텍스트 도구 ---------------- */
  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[^a-z0-9':\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);
  }

  function contentWords(tokens) {
    const out = [];
    for (const token of tokens) {
      const bare = token.replace(/'s$/, '');
      if (bare.length < 2 || STOPWORDS.has(bare) || QUESTION_WORDS.has(bare)) continue;
      out.push(bare);
    }
    return out;
  }

  function uniqueContentTokens(tokens) {
    return [...new Set(contentWords(tokens))];
  }

  // 지시문에 공통으로 나오는 낱말은 '주제' 신호가 아니므로 관련성 계산에서 뺍니다.
  const TOPIC_SKIP = new Set(('think prefer usually choose chose chosen explain option options provided give reason reasons example examples support ' +
    'agree disagree statement following say says tell describe detail much many like want need thing things kind person people ' +
    'question answer response time first second next part').split(/\s+/));

  function stem(word) {
    let w = word;
    if (w.length > 4 && w.endsWith('ies')) return `${w.slice(0, -3)}y`;
    if (w.length > 5 && w.endsWith('ing')) { w = w.slice(0, -3); return /(\w)\1$/.test(w) ? w.slice(0, -1) : w; }
    if (w.length > 4 && w.endsWith('ed')) { w = w.slice(0, -2); return /(\w)\1$/.test(w) ? w.slice(0, -1) : w; }
    if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    if (w.length > 5 && w.endsWith('ly')) return w.slice(0, -2);
    return w;
  }

  function stemSet(tokens) {
    const set = new Set();
    for (const token of tokens) {
      const bare = token.replace(/'s$/, '');
      set.add(bare);
      set.add(stem(bare));
    }
    return set;
  }

  function topicWords(tokens) {
    const out = [];
    for (const word of contentWords(tokens)) if (!TOPIC_SKIP.has(word) && !TOPIC_SKIP.has(stem(word))) out.push(word);
    return out;
  }

  function overlapRatio(referenceTokens, tokens) {
    const ref = [...new Set(topicWords(referenceTokens).map(stem))];
    if (!ref.length) return 0;
    const have = stemSet(tokens);
    let hit = 0;
    for (const word of ref) {
      if (have.has(word) || (SYNONYMS[word] || []).some((alt) => have.has(stem(alt)))) hit += 1;
    }
    return hit / ref.length;
  }

  function wordsHit(element, tokens) {
    const words = contentWords(tokenize(element));
    if (!words.length) return 0;
    const have = stemSet(tokens);
    let hit = 0;
    for (const word of words) {
      if (have.has(word) || have.has(stem(word)) || (SYNONYMS[word] || []).some((alt) => have.has(alt) || have.has(stem(alt)))) hit += 1;
    }
    return hit / words.length;
  }

  /* ---------------- 숫자·시각·날짜 정규화 ---------------- */
  function numberFromWords(words) {
    let total = 0;
    let current = 0;
    let seen = false;
    for (const word of words) {
      if (word === 'and') continue;
      const value = NUMBER_WORDS[word];
      if (value === undefined) return null;
      seen = true;
      if (value === 100) { current = (current || 1) * 100; }
      else if (value >= 20) { current += value; }
      else { current += value; }
    }
    total = current;
    return seen ? total : null;
  }

  const MONTH_NAMES = {
    january: 'jan', february: 'feb', march: 'mar', april: 'apr', may: 'may', june: 'jun', july: 'jul',
    august: 'aug', september: 'sep', october: 'oct', november: 'nov', december: 'dec',
    jan: 'jan', feb: 'feb', mar: 'mar', apr: 'apr', jun: 'jun', jul: 'jul', aug: 'aug', sep: 'sep',
    sept: 'sep', oct: 'oct', nov: 'nov', dec: 'dec',
  };
  const HOUR_WORDS = 'one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve';
  const MINUTE_WORDS = 'oh five|oh-five|five|ten|fifteen|twenty five|twenty-five|twenty|thirty five|thirty-five|thirty|forty five|forty-five|forty|fifty five|fifty-five|fifty';
  const MONTH_PATTERN = 'january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec';

  function normalizeDigraphs(text) {
    // 말로 쓴 숫자·시각·날짜를 비교 가능한 표기("9:30am", "apr 14", "2 days")로 바꿉니다.
    let s = ` ${String(text || '').toLowerCase()} `;
    s = s.replace(/[\u2018\u2019]/g, "'");
    // 대괄호는 화면의 발음 표기([eighdeenth], [gardigan])입니다. 점수 계산에서는 글자만 남깁니다.
    s = s.replace(/[[\]]/g, ' ');

    // 1) 범위: 끝 시각의 오전/오후를 시작 시각에 넘깁니다.
    //    시작 시(時)가 끝보다 이르거나 같으면 같은 오전·오후, 늦으면 반대입니다.
    //    "2:30 to 4 p.m." → 2:30pm–4:00pm, "11 to 8:30 p.m." → 11:00am–8:30pm
    s = s.replace(/(?<![\d:.])(\d{1,2})(?::(\d{2}))?\s*(?:-|\u2013|to|until|and)\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/g,
      (all, h1, m1, h2, m2, ap) => {
        // 12시는 12시간제에서 가장 이른 시각(0)으로 비교합니다.
        const start = Number(h1) === 12 ? 0 : Number(h1);
        const end = Number(h2) === 12 ? 0 : Number(h2);
        const startAp = start <= end ? ap : (ap === 'p' ? 'a' : 'p');
        return ` ${Number(h1)}:${m1 || '00'}${startAp}m ${Number(h2)}:${m2 || '00'}${ap}m `;
      });

    // 1-1) 정오가 낀 범위: "10 to noon" → 10:00am–12:00pm, "noon to 1:30 p.m." → 12:00pm–1:30pm
    s = s.replace(/(?<![\d:.])(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?\s*(?:-|\u2013|to|until)\s*noon\b/g,
      (all, h, m, ap) => ` ${Number(h)}:${m || '00'}${ap}m 12:00pm `);
    s = s.replace(/(?<![\d:.])(\d{1,2})(?::(\d{2}))?\s*(?:-|\u2013|to|until)\s*noon\b/g,
      (all, h, m) => ` ${Number(h)}:${m || '00'}am 12:00pm `);
    s = s.replace(/\bnoon\s*(?:-|\u2013|to|until)\s*(\d{1,2})(?::(\d{2}))?\s*([ap])\.?\s*m\.?/g,
      (all, h, m, ap) => ` 12:00pm ${Number(h)}:${m || '00'}${ap}m `);
    s = s.replace(/\bnoon\b/g, ' 12:00pm ');

    // 2) 숫자로 쓴 시각
    s = s.replace(/(?<![\d:.])(\d{1,2})[:.](\d{2})\s*([ap])\.?\s*m\.?/g, (all, h, m, ap) => ` ${Number(h)}:${m}${ap}m `);
    s = s.replace(/(?<![\d:.])(\d{1,2})\s*([ap])\.?\s*m\.?\b/g, (all, h, ap) => ` ${Number(h)}:00${ap}m `);
    // 인식기가 콜론을 빠뜨린 "330 PM" / "1130 AM" → "3:30pm" / "11:30am"
    s = s.replace(/(?<![\d:.])(\d{3,4})\s*([ap])\.?\s*m\.?\b/g, (all, digits, ap) => {
      const h = Number(digits.slice(0, -2));
      const m = digits.slice(-2);
      if (h < 0 || h > 12 || Number(m) > 59) return all;
      return ` ${h}:${m}${ap}m `;
    });

    // 3) 말로 쓴 시각 ("nine thirty a.m.")
    const minuteOf = (word) => (word ? numberFromWords(word.replace(/-/g, ' ').split(' ')) : 0) || 0;
    s = s.replace(new RegExp(`\\b(${HOUR_WORDS})(?:\\s+(${MINUTE_WORDS}))?\\s+([ap])\\.?\\s*m\\.?`, 'g'),
      (all, hour, minute, ap) => ` ${NUMBER_WORDS[hour]}:${String(minuteOf(minute)).padStart(2, '0')}${ap}m `);

    // 4) 말로 쓴 범위: "between one and two p.m."
    s = s.replace(new RegExp(`\\b(${HOUR_WORDS})\\s*(?:-|\\u2013|to|until|and)\\s*(\\d{1,2}):(\\d{2})(am|pm)\\b`, 'g'),
      (all, h1, h2, m2, ap) => ` ${NUMBER_WORDS[h1]}:00${ap} ${h2}:${m2}${ap} `);

    // 5) "nine in the morning"
    s = s.replace(new RegExp(`\\b(${HOUR_WORDS}|\\d{1,2})\\s+in\\s+(?:the\\s+)?(morning|afternoon|evening|night)\\b`, 'g'),
      (all, hour, part) => {
        const h = NUMBER_WORDS[hour] !== undefined ? NUMBER_WORDS[hour] : Number(hour);
        const pm = part !== 'morning';
        return ` ${pm && h < 12 ? h + 12 : h}:00${pm ? 'pm' : 'am'} `;
      });

    // 5) 날짜 ("april fourteenth", "april 14", "july twenty-fourth")
    s = s.replace(new RegExp(`\\b(${MONTH_PATTERN})\\s+([a-z-]+|\\d{1,2}(?:st|nd|rd|th)?)\\b`, 'g'), (all, monthWord, dayWord) => {
      const month = MONTH_NAMES[monthWord];
      if (!month) return all;
      const day = ordinalWordToNumber(dayWord);
      return day && day >= 1 && day <= 31 ? ` ${month} ${day} ` : all;
    });

    // 6) 남은 숫자 단어 → 숫자 ("two days" → "2 days")
    s = s.replace(/\b(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g,
      (word) => String(NUMBER_WORDS[word]));

    // 7) 같은 답변 안에서 앞에 오전/오후가 나왔으면 뒤의 "10:30"도 같은 것으로 봅니다.
    //    ("starts at 10:00 a.m. It lasts until 10:30")
    let lastMeridiem = '';
    s = s.replace(/\b(\d{1,2}):(\d{2})(am|pm)?\b/g, (all, h, m, meridiem) => {
      if (meridiem) { lastMeridiem = meridiem; return all; }
      return lastMeridiem ? `${h}:${m}${lastMeridiem}` : all;
    });

    s = s.replace(/[^a-z0-9:'\s]/g, ' ').replace(/\s+/g, ' ').trim();
    return s;
  }


  function editDistance(a, b) {
    const rows = [];
    for (let i = 0; i <= a.length; i += 1) rows[i] = [i];
    for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
    for (let i = 1; i <= a.length; i += 1) {
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      }
    }
    return rows[a.length][b.length];
  }

  function ordinalWordToNumber(word) {
    const clean = String(word).replace(/-/g, ' ').trim();
    const direct = NUMBER_WORDS[clean];
    if (direct !== undefined) return direct;
    const m = clean.match(/^([a-z]+)\s+(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|thirtieth|thirtieth|forty|fifty)$/);
    if (m) {
      const base = NUMBER_WORDS[m[1]];
      const ord = ordinalWordToNumber(m[2]);
      if (base !== undefined && ord !== undefined) return base + ord;
    }
    const map = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10, eleventh: 11, twelfth: 12, thirteenth: 13, fourteenth: 14, fifteenth: 15, sixteenth: 16, seventeenth: 17, eighteenth: 18, nineteenth: 19, twentieth: 20, thirtieth: 30 };
    if (map[clean] !== undefined) return map[clean];
    const digits = clean.match(/^(\d{1,2})(st|nd|rd|th)?$/);
    if (digits) return Number(digits[1]);
    // 음성 인식이 서수 철자를 조금 틀린 경우("eighdeenth")는 가장 가까운 서수로 봅니다.
    let closest = null;
    let closestDistance = 3;
    for (const [word, value] of Object.entries(map)) {
      const distance = editDistance(clean.replace(/\s+/g, ''), word);
      if (distance < closestDistance) { closestDistance = distance; closest = value; }
    }
    if (closest !== null) return closest;
    if (/^twenty[\s-]/.test(clean)) {
      const rest = ordinalWordToNumber(clean.replace(/^twenty[\s-]/, ''));
      return rest ? 20 + rest : null;
    }
    return null;
  }

  function extractTimes(normalized) {
    const out = new Set();
    const re = /\b(\d{1,2}):(\d{2})(am|pm)\b/g;
    let m;
    while ((m = re.exec(normalized))) out.add(`${Number(m[1])}:${m[2]}${m[3]}`);
    return out;
  }

  function extractDates(normalized) {
    const out = new Set();
    // 월 이름은 전체 이름/약어 모두 받습니다. ("april 14", "apr 14", "june 18th")
    const re = /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+(\d{1,2})(?:st|nd|rd|th)?\b/g;
    let m;
    while ((m = re.exec(normalized))) out.add(`${m[1].slice(0, 3)} ${Number(m[2])}`);
    // 월 없이 서수만 쓴 날짜("not the 28th")는 문장에 월이 하나뿐이면 그 월을 씁니다.
    const monthSet = new Set([...out].filter((value) => /^[a-z]{3} \d+$/.test(value)).map((value) => value.split(' ')[0]));
    if (monthSet.size === 1) {
      const month = [...monthSet][0];
      const bare = /\b(?:the\s+)?(\d{1,2})(?:st|nd|rd|th)\b/g;
      while ((m = bare.exec(normalized))) out.add(`${month} ${Number(m[1])}`);
    }
    const re2 = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g;
    while ((m = re2.exec(normalized))) out.add(m[1]);
    const iso = /\b(\d{4})-(\d{2})-(\d{2})\b/g;
    while ((m = iso.exec(normalized))) out.add(`${['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'][Number(m[2]) - 1]} ${Number(m[3])}`);
    return out;
  }

  /* ---------------- 사실 추출 (Part 4) ---------------- */
  // 제목·고유명사 비교용 표기: 소문자, 따옴표·아포스트로피 제거, 앞 관사(A/An/The) 제거.
  function plainText(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/["'“”‘’]/g, '')
      .replace(/^(?:a|an|the)\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function extractFacts(question) {
    const key = String(question.answerKey || '');
    // "not June 28"처럼 부정된 날짜는 기대 사실로 넣지 않습니다.
    const positive = key.replace(/\b(?:not|never|isn't|is not|wasn't|was not)\s+(?:on\s+)?(?:the\s+)?(?:[A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?|\d{1,2}(?:st|nd|rd|th))\b/gi, ' ');
    const norm = normalizeDigraphs(positive);
    const facts = [];
    const seen = new Set();
    const push = (type, value) => {
      const id = `${type}:${value}`;
      if (!value || seen.has(id)) return;
      seen.add(id);
      facts.push({ type, value });
    };

    for (const time of extractTimes(norm)) push('time', time);
    for (const date of extractDates(norm)) push('date', date);

    // 따옴표 제목 — 따옴표 종류와 무관하게 같은 값으로 맞춥니다.
    const quoted = key.match(/['"“”]([^'"“”]{3,60})['"“”]/g) || [];
    for (const raw of quoted) push('title', plainText(raw.replace(/^['"“”]|['"“”]$/g, '')));

    // 고유명사 덩어리 (사람·장소·작품 제목). 아포스트로피가 있어도 한 덩어리로 봅니다.
    const proper = key.match(/\b(?:[A-Z][A-Za-z'\u2019]{2,})(?:\s+(?:of|the|and|for)?\s*[A-Z][A-Za-z'\u2019]{2,})+\b/g) || [];
    for (const raw of proper) {
      const value = plainText(raw);
      if (/^(this|that|it|there|no|yes)\b/.test(value)) continue;
      if (facts.some((f) => f.type === 'title' && (value.includes(f.value) || f.value.includes(value)))) continue;
      push('name', value);
    }

    // 수량: "two workshops", "two days"
    const counts = norm.match(/\b(\d{1,2})\s+([a-z]{3,})\b/g) || [];
    for (const raw of counts) {
      const m = raw.match(/^(\d{1,2})\s+([a-z]{3,})$/);
      if (!m) continue;
      if (['am', 'pm', 'minutes', 'seconds', 'hours', 'and', 'the', 'for', 'with', 'from', 'you', 'your'].includes(m[2])) continue;
      push('count', `${Number(m[1])} ${m[2]}`);
    }

    return facts;
  }

  function matchFacts(facts, text) {
    const norm = normalizeDigraphs(text);
    const times = extractTimes(norm);
    const dates = extractDates(norm);
    const padded = ` ${norm} `;
    // 제목·고유명사는 따옴표·아포스트로피·앞 관사를 뺀 표기로 비교합니다.
    const plain = ` ${plainText(norm)} `;
    const matched = [];
    const missed = [];
    for (const fact of facts) {
      let hit = false;
      if (fact.type === 'time') hit = times.has(fact.value);
      else if (fact.type === 'date') hit = dates.has(fact.value);
      else if (fact.type === 'count') {
        const m = fact.value.match(/^(\d+)\s+(.+)$/);
        const singular = m[2].replace(/s$/, '');
        // "2 workshops"는 "2 scheduled workshops"처럼 사이에 수식어가 있어도 인정합니다.
        const re = new RegExp(`\\b${m[1]}\\s+(?:[a-z]+\\s+){0,2}(?:${m[2]}|${singular})\\b`);
        hit = re.test(norm);
      } else hit = plain.includes(` ${fact.value} `) || plain.includes(fact.value);
      (hit ? matched : missed).push(fact);
    }
    return { matched, missed, norm, times, dates };
  }

  /* ---------------- 문법·어휘 신호 ---------------- */
  const GRAMMAR_PATTERNS = [
    [/\bthere (is|was) (many|three|two|several|people|some)\b/g, 'there is + 복수'],
    [/\bi am agree\b/g, 'I am agree'],
    [/\bmore (better|easier|faster|bigger|cheaper)\b/g, 'more + 비교급'],
    [/\bpeople (is|was)\b/g, 'people is'],
    [/\b(he|she|it) (don't|doesn't|do)\b/g, 'he/she + do'],
    [/\b(he|she|it) (have|go|do|make|take|like|want|need|think|say|live|work)\b/g, '3인칭 단수 불일치'],
    [/\b(i|we|they|you) (has|is|was|does)\b/g, '주어-동사 불일치'],
    // "a man is sitting", "the woman is holding" 같은 정상 문장은 잡지 않습니다.
    [/\b(people|they) (is|was)\b/g, '복수 주어 + is'],
    // "two workshops"는 정상. 단수형이 온 경우만 오류입니다. ("people"은 이미 복수라 제외)
    [/\b(two|three|many|several|some) (workshop|seminar|day|item|thing|person)\b/g, '복수형 누락'],
    [/\b(is|are|was|were) (stand|sit|wear|hold|look|talk|move|walk|make|take|go|come)\b/g, 'be + 동사원형'],
  ];

  function grammarIssues(text) {
    const lower = ` ${String(text || '').toLowerCase()} `;
    const issues = [];
    for (const [re, label] of GRAMMAR_PATTERNS) {
      if (!label) continue;
      re.lastIndex = 0;
      if (re.test(lower)) issues.push(label);
    }
    return issues;
  }

  function fillerCount(tokens) {
    let n = 0;
    for (const token of tokens) if (FILLERS.has(token)) n += 1;
    return n;
  }

  const REASON_MARKERS = ['because', 'so that', 'that is why', "that's why", 'since', 'for example', 'for instance', 'such as', 'therefore', 'thus', 'as a result'];
  const OPINION_MARKERS = ['i think', 'i believe', 'in my opinion', 'in my view', 'i agree', 'i disagree', 'i feel', 'for me'];
  const CONCLUSION_MARKERS = ['therefore', 'in conclusion', 'for these reasons', 'that is why', "that's why", 'so i think', 'to sum up'];
  const TEMPLATE_PHRASES = [
    'this is a very important issue', 'this is very important', 'there are several reasons for my opinion',
    'have a positive influence on our lives', 'have a positive effect on our lives', 'it is something that we should consider',
    'in my case', 'i have had a similar experience', 'i had a similar experience', 'through that experience',
    'we should consider the advantages and disadvantages', 'both positive and negative effects',
    'many people think', 'it is a common belief', 'plays an important role in our lives',
  ];

  function markerCount(text, markers) {
    const lower = ` ${String(text || '').toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ')} `;
    let n = 0;
    for (const marker of markers) if (lower.includes(` ${marker} `) || lower.includes(` ${marker},`) || lower.includes(`${marker} `)) n += 1;
    return n;
  }

  function templateHits(text) {
    const lower = ` ${String(text || '').toLowerCase().replace(/[^a-z' ]/g, ' ').replace(/\s+/g, ' ')} `;
    let n = 0;
    for (const phrase of TEMPLATE_PHRASES) if (lower.includes(` ${phrase} `)) n += 1;
    return n;
  }

  /* ---------------- 정렬 (Part 1) ---------------- */
  function align(referenceTokens, spokenTokens) {
    const n = referenceTokens.length;
    const m = spokenTokens.length;
    const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
    for (let i = 0; i <= n; i++) dp[i][0] = i;
    for (let j = 0; j <= m; j++) dp[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const cost = referenceTokens[i - 1] === spokenTokens[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
      }
    }
    let i = n, j = m;
    let matches = 0, substitutions = 0, deletions = 0, insertions = 0;
    const missed = [];
    let lastMatchIndex = -1;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + (referenceTokens[i - 1] === spokenTokens[j - 1] ? 0 : 1)) {
        if (referenceTokens[i - 1] === spokenTokens[j - 1]) { matches += 1; if (lastMatchIndex < 0) lastMatchIndex = i - 1; }
        else { substitutions += 1; missed.push(referenceTokens[i - 1]); }
        i -= 1; j -= 1;
      } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) { deletions += 1; missed.push(referenceTokens[i - 1]); i -= 1; }
      else { insertions += 1; j -= 1; }
    }
    return { matches, substitutions, deletions, insertions, missed: missed.reverse(), lastMatchIndex };
  }

  /* ---------------- 점수 규칙 ---------------- */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const round = Math.round;

  function deliveryScore(delivery) {
    if (typeof delivery === 'number') return clamp(delivery, 0, 2);
    if (delivery === '좋음' || delivery === 'good') return 2;
    if (delivery === '아쉬움' || delivery === 'weak') return 0;
    return 1; // 보통 또는 미측정
  }

  // 자유 발화(Q3~Q11)의 발음·억양. 음성 특징이 없으면 null — 화면에서 "—"로 표시하고
  // 평균·강점·보완점 계산에서 빠집니다.
  function deliveryCriteria(metrics, words) {
    const m = metrics || {};
    const speechSec = Number(m.speechSec) || 0;
    const pitch = Number.isFinite(m.pitchRangeSt) ? Number(m.pitchRangeSt) : null;
    const longPauses = Array.isArray(m.longPauses) ? m.longPauses.length : 0;
    if (!speechSec && pitch === null) return { pron: null, inton: null };

    const wpm = speechSec > 0 ? (words / speechSec) * 60 : 0;
    let pron = 3;
    if (wpm && (wpm < 70 || wpm > 200)) pron -= 1;
    if (wpm && wpm < 40) pron -= 1;

    let inton = 3;
    if (pitch !== null && pitch < 4) inton -= 1;
    if (longPauses >= 2) inton -= 1;
    return { pron: clamp(pron, 0, 3), inton: clamp(inton, 0, 3), wpm: round(wpm) };
  }

  function readingScore(question, text, metrics) {
    const refTokens = tokenize(question.text || question.prompt || '');
    const said = tokenize(text);
    if (!said.length) return { score: 0, criteria: { pron: 0, inton: 0 }, missed: refTokens, acc: 0, coverage: 0 };
    const alignResult = align(refTokens, said);
    const acc = refTokens.length ? alignResult.matches / refTokens.length : 0;
    const coverage = refTokens.length ? (alignResult.lastMatchIndex + 1) / refTokens.length : 0;

    let pron = acc >= 0.95 ? 3 : acc >= 0.85 ? 2 : acc >= 0.55 ? 1 : 0;
    if (coverage < 0.45) pron = Math.min(pron, 1);
    if (coverage < 0.25) pron = 0;

    const words = said.length;
    const seconds = Math.max(5, (metrics && metrics.speechSec) || question.responseSeconds || 45);
    const wpm = (words / seconds) * 60;
    const pitchRange = metrics && Number.isFinite(metrics.pitchRangeSt) ? metrics.pitchRangeSt : null;
    const longPauses = metrics && Array.isArray(metrics.longPauses) ? metrics.longPauses.length : 0;

    let inton = 3;
    if (pitchRange !== null && pitchRange < 4) inton -= 1;
    if (wpm > 0 && (wpm < 90 || wpm > 190)) inton -= 1;
    if (longPauses >= 2) inton -= 1;
    inton = clamp(inton, 0, 3);
    if (pron <= 1) inton = Math.min(inton, 2);

    const score = clamp(round(0.6 * pron + 0.4 * inton), 0, 3);
    return { score, criteria: { pron, inton }, missed: alignResult.missed, acc, coverage, wpm: round(wpm) };
  }

  function pictureScore(question, text, tokens, metrics) {
    const words = tokens.length;
    const voice = deliveryCriteria(metrics, words);
    if (words < 8) return { score: 0, criteria: { ...voice, grammar: 0, vocab: 1, cohesion: 0 }, covered: [] };
    const elements = Array.isArray(question.keyElements) ? question.keyElements : [];
    const covered = [];
    for (const element of elements) if (wordsHit(element, tokens) >= 0.6) covered.push(element);
    const ratio = elements.length ? covered.length / elements.length : 0;

    const lenScore = words >= 45 ? 3 : words >= 27 ? 2 : 1;
    const covScore = ratio >= 0.6 ? 3 : ratio >= 0.35 ? 2 : ratio > 0.1 ? 1 : 0;
    let score = clamp(round(0.5 * lenScore + 0.5 * covScore), 0, 3);
    if (words < 12) score = Math.min(score, 1);
    if (ratio === 0 && words < 20) score = 0;

    const issues = grammarIssues(text);
    const grammar = clamp(3 - Math.min(3, issues.length), 0, 3);
    const vocab = clamp(round(1 + ([...new Set(contentWords(tokens))].length / Math.max(8, words)) * 4), 0, 3);
    const structure = /\bthere (is|are)\b/.test(text.toLowerCase()) ? 1 : 0;
    const cohesion = clamp(1 + (/\b(in the (background|foreground|middle)|on the (left|right)|next to|behind|in front of)\b/i.test(text) ? 1 : 0) + structure, 0, 3);
    return { score, criteria: { ...voice, grammar, vocab, cohesion }, covered };
  }

  function interviewScore(question, text, tokens, metrics) {
    const words = tokens.length;
    const promptTokens = tokenize(question.prompt || '');
    const relevance = overlapRatio(promptTokens, tokens);

    const parts = String(question.prompt || '').split('?').map((p) => p.trim()).filter((p) => p.length > 3 && topicWords(tokenize(p)).length > 0);
    let answered = 0;
    for (const part of parts) if (overlapRatio(tokenize(part), tokens) >= 0.2) answered += 1;
    const partsAnswered = parts.length ? answered / parts.length : relevance > 0 ? 1 : 0;

    const seconds = question.responseSeconds || 15;
    const target = (seconds / 15) * 25;
    const ratio = words / target;
    // 30초 문항(Q7)은 "고르고 이유 설명" 두 부분이라 25초 기준보다 짧게 말해도 완성도가 높습니다.
    const fullRatio = seconds >= 30 ? 0.82 : 0.9;
    let score;
    if (words < 9) score = 0;
    else if (ratio >= fullRatio && partsAnswered >= 0.5) score = 3;
    else if (ratio >= 0.65) score = 2;
    else if (ratio >= 0.25) score = 1;
    else score = 0;

    if (relevance < 0.12) score = Math.min(score, 1);
    else if (relevance < 0.2 && score > 2) score = 2;
    if (score === 2 && partsAnswered < 0.5) score = Math.min(score, 1);

    const delivery = deliveryScore(metrics && metrics.delivery);
    if (delivery === 0 && score > 2) score = 2;

    const reasons = markerCount(text, REASON_MARKERS);
    const issues = grammarIssues(text);
    const voice = deliveryCriteria(metrics, words);
    return {
      score, criteria: {
        ...voice, grammar: clamp(3 - Math.min(3, issues.length), 0, 3),
        vocab: clamp(3 - Math.max(0, 2 - Math.round(words / 12)), 0, 3),
        cohesion: clamp(1 + (reasons ? 1 : 0) + (words >= 20 ? 1 : 0), 0, 3),
        relevance: clamp(round(relevance * 3), 0, 3),
        completeness: clamp(round(partsAnswered * 3), 0, 3),
      }, relevance, partsAnswered,
    };
  }

  function knownValues(question) {
    // 답안·표·상황 설명에 이미 있는 시각·날짜는 '틀린 정보'가 아닙니다.
    const chunks = [question.answerKey, question.context, question.prompt];
    if (Array.isArray(question.table)) for (const row of question.table) if (Array.isArray(row)) chunks.push(...row);
    const times = new Set();
    const dates = new Set();
    for (const chunk of chunks) {
      if (!chunk) continue;
      const norm = normalizeDigraphs(chunk);
      for (const t of extractTimes(norm)) times.add(t);
      for (const d of extractDates(norm)) dates.add(d);
    }
    return { times, dates };
  }

  // 질문이 묻는 행사의 표 시간. 답안의 날짜로 표 행을 찾아 그 행의 시간만 기대값으로 봅니다.
  // Q8 IH의 "9 to 8 p.m."처럼 같은 표의 다른 행에 있는 시각을 말해도, 이 행사의 시간이 아니면 틀린 값입니다.
  function expectedEventTimes(question) {
    const rows = Array.isArray(question.table) ? question.table.filter(Array.isArray) : [];
    if (!rows.length) return new Set();
    const keyDates = extractDates(normalizeDigraphs(question.answerKey || ''));
    const times = new Set();
    // 표는 같은 날짜의 둘째 행부터 날짜 칸이 비어 있습니다. 앞 행의 날짜를 이어 받습니다.
    let current = new Set();
    for (const row of rows) {
      const rowNorm = normalizeDigraphs(row.join(' '));
      const rowDates = extractDates(rowNorm);
      if (rowDates.size) current = rowDates;
      if (![...current].some((date) => keyDates.has(date))) continue;
      for (const time of extractTimes(rowNorm)) times.add(time);
    }
    return times;
  }

  function infoScore(question, text, tokens, metrics) {
    const words = tokens.length;
    const facts = extractFacts(question);
    const match = matchFacts(facts, text);
    const known = knownValues(question);

    const extraTimes = [...match.times].filter((t) => !known.times.has(t));
    const extraDates = [...match.dates].filter((d) => !known.dates.has(d));
    const eventTimes = expectedEventTimes(question);
    const wrongTimes = eventTimes.size ? [...match.times].filter((t) => !eventTimes.has(t)) : [];

    // 표에 있는 시각이지만 이 문항의 답이 아닌 값을 말해도 틀린 정보입니다.
    const prompt = String(question.prompt || '').toLowerCase();
    const correction = /\b(someone told me|i heard|is it true|confirm|supposed to be)\b/.test(prompt);
    const affirmative = /^(yes|yeah|that's correct|that is correct|correct|right|sure)\b/.test(String(text).toLowerCase().trim());
    const negates = /\b(no|not|isn't|is not|wasn't|actually|instead|but|moved|changed)\b/.test(String(text).toLowerCase());
    const wrong = extraTimes.length > 0 || extraDates.length > 0 || wrongTimes.length > 0
      || (correction && affirmative && !negates);

    let score;
    if (words < 5) score = 0;
    else {
      const ratio = facts.length ? match.matched.length / facts.length : 0;
      score = ratio >= 0.8 ? 3 : ratio >= 0.4 ? 2 : ratio > 0.1 ? 1 : 0;
    }
    // 고유명사는 음성 인식이 자주 깨뜨립니다("Emma Lewis" → "MLUIS").
    // 사실이 4개 이상이고 3개 이상 맞으며, 빠진 것이 이름·제목뿐이고 틀린 사실이 없으면 3점.
    const onlyNamesMissed = match.missed.length > 0
      && match.missed.every((fact) => fact.type === 'name' || fact.type === 'title');
    const matchRatio = facts.length ? match.matched.length / facts.length : 0;
    if (score === 2 && !wrong && facts.length >= 4 && match.matched.length >= 3 && matchRatio >= 0.7 && onlyNamesMissed) score = 3;
    if (wrong) score = words >= 12 ? 1 : Math.min(score, 1);
    const delivery = deliveryScore(metrics && metrics.delivery);
    if (delivery === 0 && score > 2) score = 2;

    const issues = grammarIssues(text);
    const voice = deliveryCriteria(metrics, words);
    return {
      score,
      criteria: {
        ...voice, grammar: clamp(3 - Math.min(3, issues.length), 0, 3),
        vocab: clamp(3 - Math.max(0, 2 - Math.round(words / 12)), 0, 3),
        cohesion: clamp(1 + (match.matched.length ? 1 : 0) + (words >= 18 ? 1 : 0), 0, 3),
        relevance: clamp(round((facts.length ? match.matched.length / facts.length : 0) * 3), 0, 3),
        completeness: clamp(round((facts.length ? match.matched.length / facts.length : 0) * 3), 0, 3),
      },
      covered: match.matched.map((f) => f.value),
      wrongFacts: wrong ? [...new Set([...extraTimes, ...extraDates, ...wrongTimes])] : [],
    };
  }

  function opinionScore(question, text, tokens, metrics) {
    const words = tokens.length;
    const promptTokens = tokenize(question.prompt || '');
    const relevance = overlapRatio(promptTokens, tokens);
    const templates = templateHits(text);
    const opinions = markerCount(text, OPINION_MARKERS);
    const reasons = markerCount(text, REASON_MARKERS);
    const concludes = markerCount(text, CONCLUSION_MARKERS);

    const ratio = words / 100;
    let score = ratio >= 1.15 ? 5 : ratio >= 0.92 ? 4 : ratio >= 0.7 ? 3 : ratio >= 0.4 ? 2 : ratio >= 0.15 ? 1 : 0;

    if (words < 12) score = Math.min(score, 1);
    if (relevance < 0.15) score = templates >= 2 ? Math.min(score, 2) : Math.min(score, 1);
    else if (relevance < 0.25) score = Math.min(score, 3);
    if (templates >= 3) score = Math.min(score, 2);
    else if (templates >= 1 && relevance < 0.2) score = Math.min(score, 2);
    if (opinions === 0 && reasons === 0 && score > 2) score = 2;
    // 60초 문항에서 70단어 안팎이어도 결론과 높은 관련성이 있으면 상위 점수로 봅니다.
    // (공식 모범 답안이 70~82단어 — 길이만으로 3점에 묶이지 않게)
    if (score >= 3 && score < 5 && words >= 62 && concludes >= 1 && reasons >= 1 && relevance >= 0.8) score += 1;

    const delivery = deliveryScore(metrics && metrics.delivery);
    if (delivery === 0 && score > 3) score = 3;

    const issues = grammarIssues(text);
    const voice = deliveryCriteria(metrics, words);
    return {
      score: clamp(score, 0, 5),
      criteria: {
        ...voice, grammar: clamp(3 - Math.min(3, issues.length), 0, 3),
        vocab: clamp(3 - Math.max(0, 2 - Math.round(words / 25)), 0, 3),
        cohesion: clamp(1 + (reasons ? 1 : 0) + (concludes ? 1 : 0), 0, 3),
        relevance: clamp(round(relevance * 3), 0, 3),
        completeness: clamp(round(Math.min(1, ratio) * 3), 0, 3),
      },
      relevance, templates,
    };
  }

  /* ---------------- 등급 ---------------- */
  const LEVELS = [
    [200, 'AH'], [180, 'AM'], [160, 'AL'], [140, 'IH'], [130, 'IM3'], [120, 'IM2'],
    [110, 'IM1'], [90, 'IL'], [60, 'NH'], [40, 'NM'], [0, 'NL'],
  ];

  function levelFor(scaled) {
    for (const [min, level] of LEVELS) if (scaled >= min) return level;
    return 'NL';
  }

  function typeOf(question) {
    if (question.type) return question.type;
    const no = Number(question.no);
    if (no <= 2) return 'read-aloud';
    if (no <= 4) return 'picture-description';
    if (no <= 7) return 'interview';
    if (no <= 10) return 'information-response';
    return 'opinion';
  }

  function flattenQuestions(exam) {
    if (!exam) return [];
    const out = [];
    if (Array.isArray(exam.questions)) out.push(...exam.questions);
    if (Array.isArray(exam.parts)) {
      for (const part of exam.parts) {
        if (!Array.isArray(part.questions)) continue;
        for (const question of part.questions) {
          // Part 4 표·상황 설명은 문항이 아니라 파트에 있습니다. 채점에서도 볼 수 있게 붙여 둡니다.
          out.push({
            ...question,
            part: question.part ?? part.part,
            table: question.table ?? part.table,
            context: question.context ?? part.context,
          });
        }
      }
    }
    return out.sort((a, b) => Number(a.no) - Number(b.no));
  }

  function responseText(response) {
    if (response === null || response === undefined) return '';
    if (typeof response === 'string') return response;
    return String(response.text || response.transcript || '');
  }

  function normalizeResponses(responses) {
    const map = new Map();
    if (Array.isArray(responses)) {
      for (const item of responses) if (item && item.no !== undefined) map.set(Number(item.no), item);
    } else if (responses && typeof responses === 'object') {
      for (const [no, item] of Object.entries(responses)) map.set(Number(no), item);
    }
    return map;
  }

  function normalizeMetrics(metrics) {
    if (!metrics) return new Map();
    if (Array.isArray(metrics)) {
      const map = new Map();
      for (const item of metrics) if (item && item.no !== undefined) map.set(Number(item.no), item);
      return map;
    }
    const map = new Map();
    for (const [no, item] of Object.entries(metrics)) if (item && typeof item === 'object') map.set(Number(no), item);
    return map;
  }

  function gradeQuestion({ exam, no, text, words, metrics, delivery }) {
    const questions = flattenQuestions(exam);
    const question = questions.find((q) => Number(q.no) === Number(no));
    if (!question) throw new Error(`question not found: ${no}`);
    const type = typeOf(question);
    const content = String(text || '');
    const tokens = tokenize(content);
    const m = { ...(metrics || {}) };
    if (delivery !== undefined) m.delivery = delivery;
    const wc = Number(words) || tokens.length;

    let result;
    if (type === 'read-aloud') result = readingScore(question, content, m);
    else if (type === 'picture-description') result = pictureScore(question, content, tokens, m);
    else if (type === 'interview') result = interviewScore(question, content, tokens, m);
    else if (type === 'information-response') result = infoScore(question, content, tokens, m);
    else result = opinionScore(question, content, tokens, m);

    const max = Number(question.no) === 11 || type === 'opinion' ? 5 : 3;
    const criteria = {};
    for (const key of ['pron', 'inton', 'grammar', 'vocab', 'cohesion', 'relevance', 'completeness']) {
      criteria[key] = result.criteria && result.criteria[key] !== undefined ? result.criteria[key] : null;
    }

    const feedback = [];
    if (result.missed && result.missed.length) feedback.push(`놓친 단어 ${result.missed.length}개: ${result.missed.slice(0, 5).join(', ')}`);
    if (result.acc !== undefined) feedback.push(`지문 일치율 ${Math.round(result.acc * 100)}%, 끝까지 읽은 비율 ${Math.round((result.coverage || 0) * 100)}%`);
    if (result.wpm) feedback.push(`말 속도 분당 ${result.wpm}단어`);
    if (result.covered && result.covered.length) feedback.push(`핵심 요소 ${result.covered.length}개 언급`);
    if (result.wrongFacts && result.wrongFacts.length) feedback.push(`표에 없는 정보: ${result.wrongFacts.slice(0, 3).join(', ')}`);
    if (result.relevance !== undefined) feedback.push(`질문 관련성 ${Math.round(result.relevance * 100)}%`);
    if (result.partsAnswered !== undefined && result.partsAnswered < 1) feedback.push('질문의 일부만 답했습니다');
    const issues = grammarIssues(content);
    if (issues.length) feedback.push(`문법: ${[...new Set(issues)].slice(0, 3).join(', ')}`);

    return {
      no: Number(question.no), score: clamp(Number(result.score) || 0, 0, max), max,
      criteria, feedback: feedback.slice(0, 4), type,
      missedWords: result.missed, covered: result.covered, wrongFacts: result.wrongFacts,
      text: content, words: wc,
    };
  }

  function gradeAttempt({ exam, responses, metrics, delivery }) {
    const questions = flattenQuestions(exam);
    const responseMap = normalizeResponses(responses);
    const metricMap = normalizeMetrics(metrics);
    const per = {};
    let weighted = 0;
    let weightSum = 0;
    const partScores = {};

    for (const question of questions) {
      const no = Number(question.no);
      const item = responseMap.get(no);
      const text = responseText(item);
      const m = metricMap.get(no) || (metricMap.size === 0 ? {} : {});
      if (delivery !== undefined) m.delivery = delivery;
      const graded = gradeQuestion({ exam, no, text, words: m.words, metrics: m, delivery });
      per[no] = graded;
      const weight = no === 11 ? 2 : 1;
      weighted += (graded.score / graded.max) * weight;
      weightSum += weight;
      const part = question.part || (no <= 2 ? 1 : no <= 4 ? 2 : no <= 7 ? 3 : no <= 10 ? 4 : 5);
      (partScores[part] || (partScores[part] = [])).push(graded.score / graded.max);
    }

    const pct = weightSum ? weighted / weightSum : 0;
    const scaled = 10 * round(20 * pct);
    const partAverages = {};
    for (const [part, list] of Object.entries(partScores)) partAverages[part] = list.reduce((a, b) => a + b, 0) / list.length;

    const criteriaAvg = {};
    for (const key of ['pron', 'inton', 'grammar', 'vocab', 'cohesion', 'relevance', 'completeness']) {
      const values = Object.values(per).map((q) => q.criteria[key]).filter((v) => v !== null && v !== undefined);
      criteriaAvg[key] = values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
    }
    const ranked = Object.entries(criteriaAvg).filter(([, v]) => v !== null).sort((a, b) => b[1] - a[1]);
    const strengths = ranked.slice(0, 2).map(([k]) => k);
    const weaknesses = ranked.slice(-2).reverse().map(([k]) => k);

    return {
      version: VERSION,
      questions: per,
      estimate: { scaled, level: levelFor(scaled), pct },
      partAverages, criteriaAvg, strengths, weaknesses,
    };
  }

  return {
    version: VERSION,
    gradeAttempt,
    gradeQuestion,
    levelFor,
    // 시험·도구용 내부 함수 (앱 화면에서는 쓰지 않음)
    _internals: { tokenize, contentWords, overlapRatio, normalizeDigraphs, extractFacts, matchFacts, extractTimes, extractDates, expectedEventTimes, align, grammarIssues, templateHits, markerCount },
  };
});
