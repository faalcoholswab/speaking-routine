/* 학습 팁 — Part 3. 근거: 파트별 강의 3편, 2025 하반기 실제기출(mock-05). */
window.STUDY_TIPS = window.STUDY_TIPS || {};
window.STUDY_TIPS[3] = {
  part: 3,
  title: '질문에 답하기',
  summary: '전화 인터뷰 세 문항입니다. 5·6번은 15초에 두 문장, 7번은 30초에 다섯에서 여섯 문장으로, 고른 답과 because 이유를 말합니다.',
  sections: [
    {
      key: 'cheat',
      title: '한눈에 보는 템플릿',
      blocks: [
        {
          head: '5번 · 15초 — 질문을 I로 받아 한 문장 + 이유',
          lines: [
            { en: 'Well, I usually cook once a week,', ko: '저는 보통 일주일에 한 번 요리하고,', slot: '답' },
            { en: "and I usually cook alone because it's easy and convenient.", ko: '쉽고 편리해서 보통 혼자 요리해요.', slot: '이유', note: '7~8초만 말하고 끝나도 괜찮아요. 묻지 않은 내용은 덧붙이지 않아요.' },
          ],
        },
        {
          head: '6번 · 15초 — why가 붙는 질문',
          lines: [
            { en: "I would say pizza, because it's delicious and convenient.", ko: '피자라고 할게요, 맛있고 편리하거든요.', slot: '답', note: 'I would say 뒤에는 명사·동명사·문장 무엇이든 와요. I think 뒤에는 주어와 동사가 필요해요.' },
            { en: 'So I can save time.', ko: '그래서 시간을 아낄 수 있어요.', slot: '결과', note: '여유가 있을 때만 붙여요.' },
          ],
        },
        {
          head: '7번 · 30초 — 선택지 고르기, 5~6문장',
          lines: [
            { en: 'I would prefer watching videos.', ko: '저는 영상 보는 쪽을 고를게요.', slot: '선택' },
            { en: "Here's why.", ko: '이유는 이래요.', slot: '신호' },
            { en: 'First, I can watch videos online anytime, anywhere.', ko: '첫째, 언제 어디서든 온라인으로 볼 수 있어요.', slot: '이유' },
            { en: 'So I can save time.', ko: '그래서 시간을 아낄 수 있어요.', slot: '결과', note: '이유에서 멈추지 말고 그래서 어떻게 되는지까지 말해요.' },
            { en: "Also, it's fun and entertaining, so I can get rid of stress.", ko: '또 재미있어서 스트레스를 풀 수 있어요.', slot: '이유 2', note: '선택이에요.' },
            { en: "That's why I think so.", ko: '그래서 그렇게 생각해요.', slot: '마무리' },
          ],
        },
        {
          head: '바꿔 끼우는 재료',
          points: [
            '빈도 표현: every day · once a week · twice or three times a week · once a month · once a year.',
            "이유 형용사: It's easy · convenient · fast · practical · efficient · effective / fun · enjoyable · satisfying · relaxing · refreshing.",
            '내 상황 문장: I am a senior in college and very busy with my school work.',
            '실제 취향보다 이유를 대기 쉬운 보기를 골라요.',
          ],
        },
      ],
    },
    {
      key: 'structure',
      title: '답변 구조·시간',
      blocks: [
        {
          head: '준비 3초, 15초 · 15초 · 30초',
          text: '5번과 6번은 15초, 7번은 30초입니다. 준비 3초는 숨 고르고 질문의 동사를 한 번 보는 시간입니다. 화면 위에는 상황이 뜨고, 질문은 전화 인터뷰처럼 이어집니다.',
        },
        {
          head: '15초는 두 문장',
          text: '답 한 문장과 이유 한 문장이면 충분해요. 7~8초만 말하고 멈춰도 돼요. I would say 뒤에 답의 핵심 단어를 붙여도 되고, 질문의 모든 단어를 되풀이할 필요는 없어요.',
        },
        {
          head: '30초는 다섯에서 여섯 문장',
          points: [
            '고른 보기를 말하기 → Here’s why. → 이유 → 그래서 생기는 결과 → That’s why I think so.',
            '25초쯤 끝나도 돼요. 단어 수보다 질문에 맞는 답과 이유를 분명하게 전해요.',
            '이유는 하나여도 됩니다. 두 개를 말할 때는 하나에만 한두 문장을 더 붙이세요.',
          ],
        },
      ],
    },
    {
      key: 'template',
      title: '템플릿',
      blocks: [
        {
          head: '15초 — 받아 말하기 + because',
          text: '질문의 you를 I로 내립니다. do는 빼도 되고, I do cook처럼 강조해도 틀린 문장은 아닙니다. 이유를 안 물었으면 첫 문장에서 끝내도 되지만, 이 앱은 because가 있는 답이 더 안정적으로 만점이 됩니다.',
          lines: [
            { en: 'I usually cook alone.', ko: '보통 혼자 요리한다.', slot: '받아 말하기', note: '질문의 you cook를 I cook로 내립니다.', src: '강의 3편 6:43', check: 'caption' },
            { en: "I usually cook every day and I usually cook alone because it's convenient.", ko: '매일, 그리고 혼자 요리한다. 편리해서.', slot: '15초 완성', note: '자막은 everyday로도 적혀 있습니다. 말할 때는 every day 두 단어가 분명합니다.', src: '강의 3편 8:02', check: 'caption' },
          ],
        },
        {
          head: '막히면 I would say, 고르기는 I would prefer',
          text: 'I think 뒤에는 주어와 동사가 와야 해서 I think pasta처럼 명사만 붙이면 어색합니다. I would say 뒤에는 명사, -ing, 형용사, 문장이 다 올 수 있습니다. 또박또박 읽으면 거들먹거리니 짧게 붙여 말하세요. 앱 채점은 I would say, I’d say, I would prefer를 의견 표현으로 알아봅니다. I’ll say만 쓰면 그 칸에 안 들어갈 수 있습니다.',
          lines: [
            { en: 'I would say pizza.', ko: '피자라고 하겠다.', slot: '만능 시작', note: '자막 14:30은 I would say, 14:53 시연은 I’ll say입니다. 앱에서는 I would say로 말하세요.', src: '강의 3편 14:30', check: 'caption' },
            { en: "I would say pizza because it's delicious and convenient.", ko: '피자라고 하겠다. 맛있고 편리해서.', slot: '15초 완성', note: '강의 시연은 빠르게 I’ll say로 들리지만, 앱 채점은 I would say(또는 I’d say)만 알아봅니다. 그래서 I would say로 바꿔 적었습니다.', src: '강의 3편 14:53', check: 'caption' },
            { en: 'I would prefer', ko: '~을 더 고르겠다.', slot: '선택', note: '뒤에 고른 보기를 붙입니다. 강의에서 watching videos는 I’ll say 뒤에 따로 나옵니다.', src: '강의 3편 15:53', check: 'caption' },
          ],
        },
        {
          head: '30초 — 이유 틀',
          text: '파트 5용으로 이유를 선언하는 문장은 전화 통화에서 외운 티가 납니다. 넣지 마세요.',
          lines: [
            { en: "Here's why.", ko: '이유는 이렇다.', slot: '이유 시작', src: '강의 3편 16:25', check: 'caption' },
            { en: 'first of all', ko: '무엇보다', slot: '이유 시작', note: 'first, firstly, above all, most of all 중에서 하나만 쓰면 됩니다.', src: '강의 3편 21:38', check: 'caption' },
            { en: "It's fast and convenient.", ko: '빠르고 편리하다.', slot: '이유', src: '강의 3편 21:47', check: 'caption' },
            { en: "That's why I think so.", ko: '그래서 그렇게 생각한다.', slot: '마무리', note: '없어도 됩니다. 넣으면 답이 끝난 느낌이 납니다.', src: '강의 3편 16:55', check: 'caption' },
          ],
        },
      ],
    },
    {
      key: 'phrases',
      title: '만능 문장',
      blocks: [
        {
          head: '빈도는 통째로 외우기',
          text: '얼마나 자주 하냐는 질문에서 생각하는 시간을 없앱니다. 숫자만 갈아 끼우세요.',
          lines: [
            { en: 'every day', ko: '매일', slot: '빈도', src: '강의 3편 4:50', check: 'caption' },
            { en: 'once a week', ko: '일주일에 한 번', slot: '빈도', src: '강의 3편 4:46', check: 'caption' },
            { en: 'twice or three times a week', ko: '일주일에 두세 번', slot: '빈도', src: '강의 3편 4:33', check: 'caption' },
            { en: 'once a month', ko: '한 달에 한 번', slot: '빈도', src: '강의 3편 5:27', check: 'caption' },
            { en: 'once a year', ko: '일 년에 한 번', slot: '빈도', src: '강의 3편 5:28', check: 'caption' },
            { en: 'every hour', ko: '매시간', slot: '빈도', src: '강의 3편 4:56', check: 'caption' },
          ],
        },
        {
          head: '이유는 It’s + 형용사',
          text: '한 단어로 끝내면 외운 티가 납니다. 두 개를 and로 이어 천천히 말하세요. 형용사에서 멈추지 말고, 그래서 무엇이 좋은지 한 문장을 더 붙일 수 있습니다.',
          lines: [
            { en: "It's easy.", ko: '쉽다.', slot: '이유', src: '강의 3편 7:08', check: 'caption' },
            { en: "It's convenient.", ko: '편리하다.', slot: '이유', src: '강의 3편 6:38', check: 'caption' },
            { en: "It's fast.", ko: '빠르다.', slot: '이유', src: '강의 3편 7:11', check: 'caption' },
            { en: "It's practical.", ko: '실용적이다.', slot: '이유', src: '강의 3편 7:12', check: 'caption' },
            { en: "It's efficient.", ko: '효율적이다.', slot: '이유', src: '강의 3편 7:14', check: 'caption' },
            { en: "It's effective.", ko: '효과적이다.', slot: '이유', src: '강의 3편 7:16', check: 'caption' },
            { en: "It's fun.", ko: '재미있다.', slot: '경험', src: '강의 3편 7:19', check: 'caption' },
            { en: "It's relaxing.", ko: '마음이 놓인다.', slot: '경험', src: '강의 3편 7:26', check: 'caption' },
            { en: "It's easy and convenient.", ko: '쉽고 편리하다.', slot: '이유 두 개', src: '강의 3편 7:48', check: 'caption' },
            { en: "It's fun and enjoyable so I can relieve my stress.", ko: '재미있어서 스트레스가 풀린다.', slot: '그래서', note: '이유 다음에 so로 결과를 붙입니다.', src: '강의 3편 23:53', check: 'caption' },
          ],
        },
        {
          head: '내 사정 한 문장',
          text: '바쁨, 시간 없음처럼 누구에게나 붙일 수 있는 이유를 하나만 준비해 두면 소재가 바뀌어도 쓸 수 있습니다.',
          lines: [
            { en: "I'm a senior in college and very busy with my school work.", ko: '대학 4학년이라 공부로 바쁘다.', slot: '내 사정', src: '강의 3편 26:09', check: 'caption' },
            { en: "I don't have much time to cook.", ko: '요리할 시간이 별로 없다.', slot: '내 사정', src: '강의 3편 26:27', check: 'caption' },
          ],
        },
      ],
    },
    {
      key: 'types',
      title: '기출 유형별 대답 팁',
      blocks: [
        {
          head: '언제 마지막으로 했나',
          ask: 'When was the last time you ~ ? 경험의 시점과, 왜 했는지를 함께 묻습니다.',
          text: 'last time과 질문의 동사를 그대로 받아 시점을 말하고, because로 이유를 붙이세요. 무엇을 줬는지는 안 물어봐도 짧은 한 단어는 괜찮지만, 안 물어본 이야기를 길게 만들다 틀리면 문법 칸이 내려갑니다.',
          lines: [
            { en: 'The last time I gave someone a gift was last month.', ko: '마지막으로 선물을 준 것은 지난달이다.', slot: '언제', src: '자체 작성', check: 'self' },
          ],
        },
        {
          head: '보통 그렇게 하나',
          ask: 'Do you usually ~ ? 습관을 묻고, 고르라면 왜 그쪽인지도 묻습니다.',
          text: 'usually와 질문의 동사·목적어를 되받으세요. which가 없는 이 질문에서는 I would say만으로는 관련성이 약합니다.',
          lines: [
            { en: 'I usually buy gifts online because it is fast and convenient.', ko: '보통 선물은 온라인으로 산다. 빠르고 편리해서.', slot: '습관+이유', src: '자체 작성', check: 'self' },
          ],
        },
        {
          head: '얼마나 자주 하나',
          ask: 'How often? 또는 일주일에 몇 번인가.',
          text: '빈도 덩어리 하나를 문장에 넣으면 됩니다. 빈도는 외운 말을 그대로 쓰고, 이유는 물었을 때만 붙이세요.',
          lines: [
            { en: 'I cook once a week because it is convenient.', ko: '일주일에 한 번 요리한다. 편리해서.', slot: '빈도+이유', note: 'once a week는 강의 문장이고, 앞의 I cook은 질문 동사에 맞춰 붙인 예시입니다.', src: '자체 작성', check: 'self' },
          ],
        },
        {
          head: '무엇을 가장 좋아하나, 그리고 왜',
          ask: '가장 좋아하는 것, 또는 why / why not.',
          text: '6번은 5번과 소재가 겹치고 거의 항상 why가 붙습니다. 이름만 말하고 끝내지 말고 because와 형용사를 붙이세요.',
          lines: [
            { en: "I would say pizza because it's delicious and convenient.", ko: '피자라고 하겠다. 맛있고 편리해서.', slot: '선호+이유', note: '강의 시연은 I’ll say로 들리지만, 앱 채점은 I would say(또는 I’d say)만 알아봅니다.', src: '강의 3편 14:53', check: 'caption' },
          ],
        },
        {
          head: '보기 중 고르기',
          ask: 'Which would you prefer? 두세 개 중에서 하나를 고르고 이유를 말합니다. 무엇이 가장 중요한지도 이 틀입니다.',
          text: '진짜 내 이야기가 어려우면 말이 쉬운 쪽을 고르세요. 답이 남과 겹쳐도 됩니다. 보기를 한 번 읽고, 고른 쪽을 말한 뒤 이유를 붙이세요.',
          lines: [
            { en: 'I would prefer to give a book.', ko: '책을 주겠다.', slot: '선택', src: '자체 작성', check: 'self' },
            { en: "Here's why.", ko: '이유는 이렇다.', slot: '이유 시작', src: '강의 3편 16:25', check: 'caption' },
            { en: "That's why I think so.", ko: '그래서 그렇게 생각한다.', slot: '마무리', src: '강의 3편 16:55', check: 'caption' },
          ],
        },
      ],
    },
    {
      key: 'scoring',
      title: '감점 아님 · 감점 주의',
      blocks: [
        {
          head: '15초가 남거나 30초를 25초에 끝내는 것',
          kind: 'ok',
          text: '질문과 이유를 두 문장으로 말했으면 나머지를 채우지 않아도 됩니다. 단어만 던진 답은 여기에 해당하지 않습니다.',
        },
        {
          head: '이유를 하나만 말하는 것',
          kind: 'ok',
          text: '이유 두 개를 나열하지 않아도 됩니다. 하나면 그 이유의 결과까지 한 문장 붙이세요.',
        },
        {
          head: '쉬운 보기를 고르는 것',
          kind: 'ok',
          text: '내 진짜 이야기가 말로 어려우면 쉬운 쪽으로 갑니다. 다른 사람과 답이 같아도 감점이 아닙니다.',
        },
        {
          head: '질문 단어를 전부 반복하지 않는 것',
          kind: 'ok',
          text: 'I would say 뒤에 핵심 답을 붙여도 돼요. 질문 단어를 그대로 반복하기보다 묻는 내용에 맞게 답해요.',
        },
        {
          head: '이유를 빠뜨리거나 비교를 겹치는 것',
          kind: 'warn',
          text: 'why를 물었으면 이유가 드러나게 답해요. because는 쉬운 연결 표현이에요. more cheaper처럼 비교를 겹치지 않고, online 앞에 on이나 hair·glasses 앞에 a를 붙이지 않도록 해요.',
        },
        {
          head: '안 물어본 말을 길게 지어내는 것',
          kind: 'warn',
          text: '선물 이름처럼 짧은 덧붙임은 괜찮습니다. 묻지 않은 이야기를 길게 만들다 문법 오류가 나면 문법 칸이 내려갑니다.',
        },
        {
          head: '파트 5 문장으로 시간을 채우는 것',
          kind: 'warn',
          text: 'I will give you some reasons and details to support my opinion.은 전화 인터뷰에 어울리지 않습니다.',
        },
      ],
    },
    {
      key: 'examples',
      title: '2025 하반기 기출 예제',
      examples: [
        {
          q: 5,
          ask: '마지막으로 선물을 준 때와 그 이유. 15초, 두 문장.',
          model: {
            note: 'last time으로 시점을 받고, because로 이유를 붙입니다. 준 물건은 짧게만 넣었습니다.',
            lines: [
              { en: 'The last time I gave someone a gift was last month.', slot: '언제', src: '자체 작성', check: 'self' },
              { en: 'I gave my friend a book because it was his birthday.', slot: '이유', src: '자체 작성', check: 'self' },
            ],
          },
        },
        {
          q: 6,
          ask: '가게와 온라인 중 어디를 고르나. 15초, 두 문장.',
          model: {
            note: '온라인 쪽을 고르고, that one으로 고르라는 말까지 받습니다. because 뒤에 형용사 두 개입니다.',
            lines: [
              { en: 'I usually buy gifts online because it is fast and convenient.', slot: '선택+이유', src: '자체 작성', check: 'self' },
              { en: 'I choose that one, and I do not go to a store.', slot: '고른 쪽', src: '자체 작성', check: 'self' },
            ],
          },
        },
        {
          q: 7,
          ask: '사탕과 책 중 무엇을 줄까. 30초, 여섯 문장.',
          model: {
            note: '책을 고르고 Here’s why로 이유를 엽니다. 편리하다는 말에서 끝내지 않고, 오래 읽는다는 결과까지 말합니다.',
            lines: [
              { en: 'I would prefer to give this type of gift, a book, and I choose that one, not some candy.', slot: '선택', src: '자체 작성', check: 'self' },
              { en: "Here's why.", slot: '이유 시작', src: '자체 작성', check: 'self' },
              { en: 'First of all, a book is useful and relaxing.', slot: '이유', src: '자체 작성', check: 'self' },
              { en: 'My friend can read the book for a long time, so it is a good gift.', slot: '그래서', src: '자체 작성', check: 'self' },
              { en: 'It is also easy to choose a book that matches the person.', slot: '이유', src: '자체 작성', check: 'self' },
              { en: "That's why I think so.", slot: '마무리', src: '자체 작성', check: 'self' },
            ],
          },
        },
      ],
    },
  ],
};
