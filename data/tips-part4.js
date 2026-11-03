/* 학습 팁 — Part 4. 근거: 파트별 강의 4편, 2025 하반기 실제기출(mock-05). */
window.STUDY_TIPS = window.STUDY_TIPS || {};
window.STUDY_TIPS[4] = {
  part: 4,
  title: '표 보고 답하기',
  summary: '표는 답하는 동안 화면에 남아 있고, 질문 세 개(8·9·10번)는 소리로만 나옵니다. 묻는 칸의 날짜·시간·이름을 틀리지 않게 읽으면 됩니다.',
  sections: [
    {
      key: 'structure',
      title: '답변 구조·시간',
      blocks: [
        {
          head: '시험이 어떻게 흘러가나',
          text: '파트 3과 시간은 같고, 다른 점은 표와 듣기입니다. 질문이 화면에 남지 않아서, 놓치면 답을 못 합니다.',
          points: [
            '질문 3개. 준비 3초, 답은 8·9번 15초, 10번 30초.',
            '10번 질문은 두 번 들려줍니다.',
            '표를 읽을 시간은 45초. 답하는 동안에도 표는 꺼지지 않습니다.',
            '화면 위 번호가 8로 바뀌는 순간이 시작입니다. 앞의 안내가 긴 날이 더 위험합니다.',
          ],
        },
        {
          head: '45초에 표를 읽는 법',
          text: '눈으로만 훑지 말고, 속으로 입을 움직여 읽으세요. 발음을 한 번 해 보게 되고, 사람·장소 이름이 듣기에 나오면 더 잘 기억납니다.',
          points: [
            '표 맨 위 행사 이름은 보통 문제로 안 나옵니다. 8번은 장소·시간·날짜·가격 중 한두 가지가 전형입니다.',
            '가격이 회원/비회원처럼 두 칸이면 함정으로 자주 나옵니다.',
            '같은 단어가 여러 줄에 반복되면 10번 후보입니다. 강연 제목은 해석하지 않아도 됩니다.',
          ],
        },
        {
          head: '남는 시간',
          text: '8·9번은 칸 하나만 읽으면 5~7초가 남고, 10번도 20초쯤에 끝나도 됩니다. 남는 시간에 가만히 있어도 감점이 아닙니다. 같은 말을 다시 붙이지 마세요.',
        },
        {
          head: '손가락으로 칸 짚기',
          text: '답이 두 칸인 날이 많습니다. 필기하지 말고, 듣는 동안 그 두 칸에 손가락을 대고 기다리세요. 시험이 빨리 넘어가서 눈을 떼면 칸을 잃습니다.',
          points: [
            '소거법: 8·9번에서 이미 말한 구역은 10번에 다시 안 나오는 경우가 많습니다. 10번을 놓쳐도 남은 줄을 읽으세요.',
          ],
        },
      ],
    },
    {
      key: 'template',
      title: '템플릿',
      blocks: [
        {
          head: '8번 — 장소·날짜·시간·이름',
          text: '질문 동사가 will be held, take place, 현재형(Where does it take place?) 중 무엇이어도 같은 뼈대로 받습니다. 전치사는 고민하지 말고 be 뒤에 붙여 외우세요. 장소 at(넓으면 in), 날짜 on, 시간 범위 from ~ to ~, 시작만 있으면 at.',
          lines: [
            {
              en: 'It will be held at.',
              ko: '~에서 열립니다. 뒤에 장소나 날짜를 붙입니다.',
              slot: '8번 뼈대',
              note: '또박또박 끊지 말고 it will be를 이어서 말하세요. t는 약하게 넘어갑니다.',
              src: '강의 4편 24:17',
              check: 'caption',
            },
            {
              en: 'It starts at 8 a.m.',
              ko: '8시에 시작합니다.',
              slot: '시작 시각',
              note: '듣기가 What time does it start?처럼 현재형인 날이 많습니다. 현재형으로 연습하세요.',
              src: '강의 4편 24:31',
              check: 'caption',
            },
            {
              en: 'The first session is',
              ko: '첫 순서는 ~입니다. 뒤에 표의 제목을 붙입니다.',
              slot: '첫 순서',
              src: '강의 4편 9:30',
              check: 'caption',
            },
          ],
        },
        {
          head: '9번 — 틀린 정보 고치기',
          text: '상대가 틀린 사실을 확인합니다. 신호는 right?, correct?, I heard that, I was told, Can you confirm입니다. Yes/No를 외우지 말고 Actually로 들어가 틀린 칸만 다시 읽으세요.',
          lines: [
            {
              en: 'Actually,',
              ko: '사실은. 정정 문장의 첫 단어.',
              slot: '정정 시작',
              note: 'Yes로 시작하지 마세요. 이 앱은 고치는 문제에서 Yes로 열고 부정을 안 하면 한 단계를 깎습니다.',
              src: '강의 4편 26:37',
              check: 'caption',
            },
            {
              en: 'has been canceled',
              ko: '취소되었습니다.',
              slot: '취소',
              note: '취소선이 그어진 줄은 그 줄을 읽어 주면 됩니다. is canceled를 써도 정보 점수가 떨어지지는 않습니다. 현재완료를 우선 쓰세요.',
              src: '강의 4편 32:19',
              check: 'caption',
            },
          ],
        },
        {
          head: '10번 — 같은 종류를 전부',
          text: 'Could you give me all the details? 뒤에 핵심 단어가 옵니다. 그 단어가 들어간 줄을 표 순서대로 읽으세요. 사람을 주어로 바꾸는 문장(Linda will talk about ~)은 점수가 더 나오지는 않고, 시험장에서 더듬게 만듭니다.',
          lines: [
            {
              en: 'Sure. There are two.',
              ko: '네, 두 개 있습니다.',
              slot: '개수',
              note: '뒤에 session 같은 말은 억지로 붙이지 않아도 됩니다. 못 들었으면 Sure. Let me check.로 시간을 버세요.',
              src: '강의 4편 29:02',
              check: 'caption',
            },
            {
              en: 'First, at 9:30 a.m., there is David Miller.',
              ko: '첫째, 오전 9시 30분에 David Miller가 있습니다.',
              slot: '첫째 줄',
              note: '순서는 시간, there is, 제목이나 이름. 강연자 앞에는 by를 붙이면 더 분명합니다. 둘째 줄은 Second로 같은 틀.',
              src: '강의 4편 35:12',
              check: 'caption',
            },
          ],
        },
      ],
    },
    {
      key: 'phrases',
      title: '만능 문장',
      blocks: [
        {
          head: '못 들었을 때 — 값만',
          text: '뭐가 뭔지 모르겠으면 It\'s 뒤에 들은 값만 붙이세요. 장소도 전치사 없이 이름만 붙여도 됩니다. 값이 여러 개면 여러 개 다 붙이세요. 다만 질문이 두 가지를 물으면, 값 하나만으로는 이 앱 만점이 안 됩니다. 둘 다 말해야 합니다.',
          lines: [
            {
              en: "It's 8 a.m.",
              ko: '8시입니다.',
              slot: '값만',
              note: '자막은 it\'s 8 at AM으로 들립니다. at는 빼고 It\'s 8 a.m.이라고 말하세요. 끝의 a.m.을 빼도 이 앱은 감점하지 않습니다. 말해 주면 더 분명합니다.',
              src: '강의 4편 25:28',
              check: 'caption',
            },
            {
              en: "It's at conference room B.",
              ko: '회의실 B입니다.',
              slot: '장소만',
              src: '강의 4편 30:32',
              check: 'caption',
            },
          ],
        },
        {
          head: '시간·날짜 읽는 말',
          text: '시작만 있으면 at, 줄에 시작과 끝이 있으면 from ~ to ~. 앞의 from은 빼도 됩니다. 12시간제를 쓰고, 날짜는 on + 월 + 서수(10th, 21st)입니다.',
          lines: [
            {
              en: 'from 10:30 to 12 p.m.',
              ko: '10시 30분부터 오후 12시까지.',
              slot: '시간 범위',
              src: '강의 4편 21:32',
              check: 'caption',
            },
            {
              en: 'on October 10th',
              ko: '10월 10일에.',
              slot: '날짜',
              src: '강의 4편 3:43',
              check: 'caption',
            },
            {
              en: 'on October 21st at 9 a.m.',
              ko: '10월 21일 오전 9시에.',
              slot: '날짜+시각',
              src: '강의 4편 30:35',
              check: 'caption',
            },
          ],
        },
        {
          head: '듣고 받는 말, 좋은 소식',
          lines: [
            {
              en: 'Sure.',
              ko: '네.',
              slot: '10번 시작',
              src: '강의 4편 18:24',
              check: 'caption',
            },
            {
              en: 'Sure. Let me check.',
              ko: '네, 확인해 볼게요.',
              slot: '못 들었을 때',
              src: '강의 4편 18:28',
              check: 'caption',
            },
            {
              en: "Don't worry about that.",
              ko: '그건 걱정하지 마세요.',
              slot: '좋은 소식',
              note: '준비물이 제공되는 것처럼 상대가 걱정할 필요가 없을 때.',
              src: '강의 4편 32:40',
              check: 'caption',
            },
            {
              en: "That's it. Thank you.",
              ko: '이상입니다. 감사합니다.',
              slot: '마무리',
              note: '넣어도 되고 빼도 됩니다. 점수는 정보에서 납니다.',
              src: '강의 4편 29:05',
              check: 'caption',
            },
          ],
        },
      ],
    },
    {
      key: 'types',
      title: '기출 유형별 대답 팁',
      blocks: [
        {
          head: '행사·컨퍼런스 일정표',
          ask: '날짜, 장소, 시간, 순서 제목, 강연자 중 한두 가지. 행사 주제만 바뀌고 표 모양은 비슷합니다.',
          text: '가장 자주 나오는 표입니다. 8번은 표 위쪽(장소, 첫 줄)에 있는 날이 많습니다.',
          lines: [
            {
              en: 'It will be held at.',
              ko: '장소·날짜를 이 뼈대 뒤에 붙입니다.',
              slot: '8번 뼈대',
              src: '강의 4편 24:17',
              check: 'caption',
            },
          ],
        },
        {
          head: '교육·커뮤니티 프로그램 표',
          ask: '준비물, 아이 시간, 밤에만 듣는 강좌처럼 표마다 함정 이야기가 다릅니다.',
          text: '뼈대는 행사 표와 같습니다. 이야기가 다르니, 질문이 가리키는 조건(밤, 아이, 준비물)에 맞는 줄만 읽으세요.',
          lines: [
            {
              en: 'The first session is',
              ko: '첫 순서는 ~입니다.',
              slot: '순서 제목',
              src: '강의 4편 24:56',
              check: 'caption',
            },
          ],
        },
        {
          head: '면접 일정표',
          ask: '취소된 줄, 같은 회사나 직무가 두 번, 경력 조건으로 걸러 10번을 만듭니다.',
          text: '취소선이 보이면 9번 후보입니다. 10번은 조건에 맞는 줄만, 표에 있는 순서대로.',
          lines: [
            {
              en: 'has been canceled',
              ko: '취소되었습니다. Actually 뒤에 그 사람이나 일정을 붙입니다.',
              slot: '취소',
              src: '강의 4편 32:19',
              check: 'caption',
            },
          ],
        },
        {
          head: '8번 공식',
          ask: '어디인지, 언제인지, 첫 순서가 무엇인지처럼 표 위쪽의 한두 값.',
          text: '질문의 동사를 따라가지 말고 It will be held at/on, 또는 It starts at으로 받습니다. 시간을 안 물었으면 빼도 만점입니다. 같은 줄의 맞는 시간을 더 읽어도 감점이 아닙니다.',
          lines: [
            {
              en: 'It starts at 8 a.m.',
              ko: '8시에 시작합니다.',
              slot: '시각',
              src: '강의 4편 24:31',
              check: 'caption',
            },
          ],
        },
        {
          head: '9번 공식 — 정정',
          ask: '상대가 아는 정보가 맞는지 확인. 대개 가격, 시간, 사람, 취소가 틀려 있습니다.',
          text: 'Actually 뒤에 틀린 칸만 고쳐서 읽으세요. 확신이 없으면 그 항목의 두 값(회원/비회원 가격처럼)을 다 읽으세요. 가격은 표의 숫자를 그대로, dollars의 끝 s까지. 자막의 등록비 숫자는 흔들려 여기 문장으로 넣지 않았습니다.',
          lines: [
            {
              en: 'Actually,',
              ko: '사실은.',
              slot: '정정 시작',
              src: '강의 4편 26:37',
              check: 'caption',
            },
          ],
        },
        {
          head: '10번 공식 — 해당 줄 전부',
          ask: '관심 있는 종류(demonstration 등)의 세부 사항을 모두.',
          text: 'Sure로 받고, 개수를 말한 뒤 First / Second로 표를 위에서 아래로 읽습니다. 날짜, 시작·끝 시간, 제목을 한 줄도 빼지 마세요. 제목 가운데 콜론(:)은 소리 내어 읽지 않아도 됩니다.',
          lines: [
            {
              en: 'Sure. There are two.',
              ko: '네, 두 개 있습니다.',
              slot: '개수',
              src: '강의 4편 29:02',
              check: 'caption',
            },
          ],
        },
      ],
    },
    {
      key: 'scoring',
      title: '감점 아님 · 감점 주의',
      blocks: [
        {
          head: '남는 시간, 말 고치기',
          kind: 'ok',
          text: '일찍 끝내고 가만히 있는 것, be동사를 틀린 것, 말이 꼬여 Sorry, actually로 다시 말하는 것은 정보 점수에서 깎이지 않습니다.',
        },
        {
          head: 'a.m. / p.m.을 빼도 됨',
          kind: 'ok',
          text: '8시처럼 숫자만 말해도 이 앱은 그 시각을 인정합니다. 오전·오후가 헷갈리는 줄이면 a.m.이나 p.m.을 붙이는 편이 안전합니다.',
        },
        {
          head: '같은 줄·표 안의 값을 더 읽기',
          kind: 'ok',
          text: '질문이 시간을 안 물어도, 그 행사의 맞는 시간을 덧붙여도 감점이 아닙니다. 표에 실제로 있는 다른 칸을 맞게 더 읽어도 감점이 아닙니다. 제목의 콜론은 읽지 않아도 됩니다.',
        },
        {
          head: '정보가 틀림',
          kind: 'warn',
          text: '날짜·시간·이름을 다른 숫자로 말하면 영어가 좋아도 한 단계가 깎입니다. 2025년 하반기 8번에서 6시를 9시로 말한 답이 여기에 해당합니다. 표에 없는 시간은 말하지 마세요.',
        },
        {
          head: '정정 문제에서 Yes로 열기',
          kind: 'warn',
          text: '상대의 말이 틀렸는데 Yes, that is correct로 시작하면, 뒤에 사실을 맞게 말해도 이 앱은 한 단계를 깎습니다. Actually로 고친 값을 말하세요.',
        },
        {
          head: '10번에서 줄을 빼먹기',
          kind: 'warn',
          text: 'all the details는 조건에 맞는 줄을 전부입니다. 날짜·시간·제목 중 빠진 것이 많으면 만점이 안 됩니다. 값 하나만 말하는 구조(It\'s 8 a.m.)는 못 들었을 때의 구조이지, 두 가지를 물은 8번의 만점 답은 아닙니다.',
        },
      ],
    },
    {
      key: 'examples',
      title: '2025 하반기 기출 예제',
      examples: [
        {
          q: 8,
          ask: '영화 상영 날짜와 영화 제목을 함께 묻는 8번',
          model: {
            note: '날짜와 제목이 둘 다 있어야 합니다. 시간은 안 물었지만, 같은 줄의 6시–8시를 맞게 붙였습니다.',
            lines: [
              {
                en: 'The movie showing will be held on June 18th.',
                ko: '영화 상영은 6월 18일에 있습니다.',
                slot: '8번 뼈대',
                src: '자체 작성',
                check: 'self',
              },
              {
                en: "The movie is A Butterfly's Crossing, from 6 to 8 p.m.",
                ko: '영화는 A Butterfly\'s Crossing이고, 오후 6시부터 8시까지입니다.',
                slot: '제목과 같은 줄 시간',
                src: '자체 작성',
                check: 'self',
              },
            ],
          },
        },
        {
          q: 9,
          ask: '틀린 날짜를 확인하라는 9번 정정',
          model: {
            note: 'Yes로 열지 않습니다. 고친 날짜를 말하고, 틀린 날짜는 not으로 붙입니다. 시간은 선택입니다.',
            lines: [
              {
                en: 'Actually, the community food festival is on June 22nd, not June 28th.',
                ko: '사실은 커뮤니티 푸드 페스티벌이 6월 22일입니다. 28일이 아닙니다.',
                slot: '정정',
                src: '자체 작성',
                check: 'self',
              },
              {
                en: 'It is from 11 a.m. to 8:30 p.m.',
                ko: '오전 11시부터 오후 8시 30분까지입니다.',
                slot: '같은 줄 시간',
                src: '자체 작성',
                check: 'self',
              },
            ],
          },
        },
        {
          q: 10,
          ask: 'demonstration이 들어간 줄을 모두 읽는 10번',
          model: {
            note: '6월 demonstration은 두 줄입니다. 음악 공연이나 영화 줄은 넣지 않습니다.',
            lines: [
              {
                en: 'Sure.',
                ko: '네.',
                slot: '시작',
                src: '자체 작성',
                check: 'self',
              },
              {
                en: 'There are two demonstrations.',
                ko: '데몬스트레이션이 두 개 있습니다.',
                slot: '개수',
                src: '자체 작성',
                check: 'self',
              },
              {
                en: 'First, on June 3rd, from 10 a.m. to noon, there is Caring for Fruit Trees.',
                ko: '첫째, 6월 3일 오전 10시부터 정오까지 Caring for Fruit Trees가 있습니다.',
                slot: '첫째 줄',
                src: '자체 작성',
                check: 'self',
              },
              {
                en: 'Second, on June 14th, from 2:30 to 4 p.m., there is Planting Native Grasses.',
                ko: '둘째, 6월 14일 오후 2시 30분부터 4시까지 Planting Native Grasses가 있습니다.',
                slot: '둘째 줄',
                src: '자체 작성',
                check: 'self',
              },
            ],
          },
        },
      ],
    },
  ],
};
