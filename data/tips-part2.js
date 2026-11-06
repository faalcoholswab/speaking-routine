/* 학습 팁 — Part 2. 근거: 파트별 강의 2편, 2025 하반기 실제기출(mock-05). */
window.STUDY_TIPS = window.STUDY_TIPS || {};
window.STUDY_TIPS[2] = {
  part: 2,
  title: '사진 묘사',
  summary: '평범한 사진과 낯선 사진에 같은 순서를 씁니다. 30초에 짧은 문장 8~10개, 쉬운 말로 보이는 것을 말하면 됩니다.',
  sections: [
    {
      key: 'structure',
      title: '답변 구조·시간',
      blocks: [
        {
          head: '두 문항, 준비 45초 · 답변 30초',
          text: '한 장은 사무실·길거리처럼 무난한 사진, 다른 한 장은 공항·실험실처럼 낯선 장소일 수 있습니다. 두 장에 같은 순서를 써도 됩니다.',
        },
        {
          head: '순서',
          points: [
            '장소 → 사람 → 서 있거나 앉은 자세 → 하는 일 → 머리와 옷 → 배경 → 분위기.',
            '사람은 한 명만 자세히 말해도 됩니다. 위치 말은 한 사진에 한두 개면 충분합니다.',
            '30초에 짧은 문장 8~10개를 연습해요. 단어 수를 채우기보다 사진에 맞는 내용을 쉬운 말로 전해요.',
          ],
        },
        {
          head: '시간이 잘리거나 남아도',
          text: '마지막 문장이 잘리거나 3초쯤 남는 것 자체는 감점 사유가 아니에요. 숨을 고르는 쉼도 괜찮아요. 사진에 맞는 내용을 알아듣기 쉽게 말해요.',
        },
      ],
    },
    {
      key: 'template',
      title: '템플릿',
      blocks: [
        {
          head: '1. 장소',
          text: '실내인지 실외인지만 먼저 말합니다. 더 구체적으로 말하려면 전치사 없이 it’s a + 장소로 끝내세요. 전치사를 끼우면 버벅입니다. 슬라이드의 indside는 inside의 오타입니다.',
          lines: [
            { en: 'This picture was taken outside.', ko: '이 사진은 밖에서 찍혔다.', slot: '장소', src: '강의 2편 0:00', check: 'screen' },
            { en: 'This picture was taken outdoors.', ko: '이 사진은 야외에서 찍혔다.', slot: '장소', note: 'outside 대신 써도 됩니다.', src: '강의 2편 0:00', check: 'screen' },
            { en: 'This picture was taken indoors.', ko: '이 사진은 실내에서 찍혔다.', slot: '장소', src: '강의 2편 0:00', check: 'screen' },
            { en: 'This picture was taken inside.', ko: '이 사진은 안에서 찍혔다.', slot: '장소', note: '화면 슬라이드에는 indside로 오타가 나 있습니다. 말할 때는 inside입니다.', src: '강의 2편 4:12', check: 'caption' },
            { en: "I think it's an office.", ko: '사무실인 것 같다.', slot: '구체적 장소', note: 'in이나 at을 넣지 않습니다.', src: '강의 2편 4:53', check: 'caption' },
            { en: "I think it's a street.", ko: '길인 것 같다.', slot: '구체적 장소', src: '강의 2편 4:56', check: 'caption' },
          ],
        },
        {
          head: '2. 사람, 3. 자세와 하는 일',
          text: '직업 이름을 몰라도 a man, a woman, some people이면 돼요. 모르는 물건은 something으로 넘어가고, 보이는 자세나 동작을 쉬운 말로 설명해요. 정해진 핵심 어휘를 꼭 말할 필요는 없어요.',
          lines: [
            { en: 'First, I can see some people.', ko: '먼저 몇 사람이 보인다.', slot: '사람', src: '강의 2편 0:00', check: 'screen' },
            { en: 'The first thing I can see is some people.', ko: '가장 먼저 보이는 것은 몇 사람이다.', slot: '사람', src: '강의 2편 0:00', check: 'screen' },
            { en: 'They are standing or sitting.', ko: '서 있거나 앉아 있다.', slot: '자세', src: '강의 2편 0:00', check: 'screen' },
            { en: 'They are sitting at the table and working.', ko: '탁자에 앉아 일하고 있다.', slot: '자세·하는 일', src: '강의 2편 0:00', check: 'screen' },
            { en: 'He is holding something.', ko: '무언가를 들고 있다.', slot: '하는 일', note: '이름이 생각 안 날 때. 크게 보이는 물건은 이름으로 말하세요.', src: '강의 2편 18:14', check: 'caption' },
            { en: 'She is using something.', ko: '무언가를 사용하고 있다.', slot: '하는 일', src: '강의 2편 18:14', check: 'caption' },
          ],
        },
        {
          head: '4. 머리와 옷, 5. 배경, 6. 분위기',
          text: '머리는 have로 말합니다. with를 쓰면 be동사를 빼먹기 쉽습니다. hair 앞에는 a를 붙이지 않습니다. 옷은 색 + clothes. 스웨터처럼 어려운 이름은 피하세요. 몸에 걸친 것은 wearing으로 통일하면 됩니다.',
          lines: [
            { en: 'She has long brown hair.', ko: '긴 갈색 머리다.', slot: '머리', note: '화면에는 She/he, short/long으로 바꿔 끼우라고 되어 있습니다.', src: '강의 2편 0:00', check: 'screen' },
            { en: 'He has short brown hair.', ko: '짧은 갈색 머리다.', slot: '머리', src: '강의 2편 0:00', check: 'screen' },
            { en: "She's wearing white clothes.", ko: '흰옷을 입고 있다.', slot: '옷', note: '화면 틀은 wearing + 색 + clothes입니다. 색 이름 white는 말로 나온 예시입니다.', src: '강의 2편 8:37', check: 'caption' },
            { en: 'In the background, I can see some trees.', ko: '뒤에 나무 몇 그루가 보인다.', slot: '배경', src: '강의 2편 0:00', check: 'screen' },
            { en: 'In the background, I can see some windows.', ko: '뒤에 창문이 보인다.', slot: '배경', src: '강의 2편 0:00', check: 'screen' },
            { en: 'It seems like they are having a good time.', ko: '즐거운 시간인 것 같다.', slot: '분위기', src: '강의 2편 0:00', check: 'screen' },
            { en: 'It looks like they are busy working.', ko: '바빠 보인다.', slot: '분위기', src: '강의 2편 0:00', check: 'screen' },
          ],
        },
      ],
    },
    {
      key: 'phrases',
      title: '만능 문장',
      blocks: [
        {
          head: '위치는 다섯 개면 충분',
          text: '앞쪽을 말할 때만 in을 꼭 붙입니다. in the front가 아니라 in the foreground. 오른쪽에서 두 번째처럼 잘게 나누지 마세요.',
          lines: [
            { en: 'in the background', ko: '뒤에', slot: '위치', src: '강의 2편 16:33', check: 'caption' },
            { en: 'in the middle', ko: '가운데에', slot: '위치', note: 'middle 뒤에 side를 붙이지 않습니다.', src: '강의 2편 16:35', check: 'caption' },
            { en: 'on the left', ko: '왼쪽에', slot: '위치', src: '강의 2편 16:35', check: 'caption' },
            { en: 'on the right', ko: '오른쪽에', slot: '위치', src: '강의 2편 16:37', check: 'caption' },
            { en: 'next to her', ko: '그 여자 옆에', slot: '위치', src: '강의 2편 16:38', check: 'caption' },
            { en: 'in the foreground', ko: '앞쪽에', slot: '위치', note: 'in을 빼면 어색합니다.', src: '강의 2편 16:30', check: 'caption' },
          ],
        },
        {
          head: '막히면 이 문장으로 시간 채우기',
          text: '가방을 메든 들든 동사는 하나로 통일할 수 있습니다. 목적어가 bag인지는 자막이 불명확해 여기에는 something만 적었습니다.',
          lines: [
            { en: 'She is carrying something.', ko: '무언가를 들고 있다.', slot: '소지품', src: '강의 2편 18:43', check: 'caption' },
            { en: 'It seems like they are busy working.', ko: '바빠 일하는 것 같다.', slot: '분위기', src: '강의 2편 10:13', check: 'caption' },
          ],
        },
        {
          head: '발음만 미리 붙이기',
          points: [
            'wearing의 r을 살리세요. 웰링처럼 들리면 안 됩니다.',
            'clothes 끝은 생략되어 close처럼 들려도 괜찮습니다.',
            'blond는 bl을 붙이고 모음을 굵게. hair 앞에는 a를 붙이지 않습니다.',
          ],
        },
      ],
    },
    {
      key: 'types',
      title: '기출 유형별 대답 팁',
      blocks: [
        {
          head: '무난한 장면 — 사무실, 길, 줄',
          ask: '사람들이 앉거나 서서 일하는, 자주 나오는 사진.',
          text: '장소만 바꾸고 순서는 같습니다. 사무실이면 inside, 길이면 outside.',
          lines: [
            { en: 'This picture was taken inside.', ko: '안에서 찍혔다.', slot: '장소', src: '강의 2편 4:12', check: 'caption' },
            { en: "I think it's an office.", ko: '사무실인 것 같다.', slot: '구체적 장소', src: '강의 2편 4:53', check: 'caption' },
            { en: 'They are sitting at the table and working.', ko: '탁자에 앉아 일한다.', slot: '자세·하는 일', src: '강의 2편 0:00', check: 'screen' },
          ],
        },
        {
          head: '낯선 장면 — 공항, 실험실, 공사',
          ask: '준비하지 않은 장소. 얼지 말고 같은 순서로 말합니다.',
          text: '직업 이름이 생각 안 나면 a man, working으로 충분합니다. 이름이 불명확한 도구는 빼고 다른 문장으로 채우세요.',
          lines: [
            { en: 'This picture was taken outside.', ko: '밖에서 찍혔다.', slot: '장소', src: '강의 2편 0:00', check: 'screen' },
            { en: 'First, I can see some people.', ko: '몇 사람이 보인다.', slot: '사람', src: '강의 2편 0:00', check: 'screen' },
            { en: 'He is holding something.', ko: '무언가를 들고 있다.', slot: '하는 일', src: '강의 2편 18:14', check: 'caption' },
          ],
        },
      ],
    },
    {
      key: 'scoring',
      title: '감점 아님 · 감점 주의',
      blocks: [
        {
          head: '잘리거나 3초쯤 남는 것',
          kind: 'ok',
          text: '사진에 맞는 내용을 전했다면 시간을 딱 맞출 필요는 없어요. 잘리거나 시간이 남는 것 자체는 감점 사유가 아니에요.',
        },
        {
          head: '배경이나 마무리 문장을 빼는 것',
          kind: 'ok',
          text: '배경이나 마무리 문장은 선택이에요. 빼는 것 자체는 감점 사유가 아니고, 보이는 사람과 동작부터 설명하면 돼요.',
        },
        {
          head: '전치사 없이 장소를 말하는 것',
          kind: 'ok',
          text: "I think it's an office처럼 of나 in 없이 끝내도 됩니다. outdoors, indoors를 써도 감점이 아닙니다.",
        },
        {
          head: '단어 하나를 틀리거나 고쳐 말하는 것',
          kind: 'ok',
          text: '색을 잘못 말해도 고치지 않고 넘어가도 됩니다. 고치려면 I mean 뒤에 맞는 말을 짧게 붙이세요.',
        },
        {
          head: '사진과 관계없는 말만 하는 것',
          kind: 'warn',
          text: '사진과 관계있는 사람이나 동작을 쉬운 말로 설명해요. 특정 장소나 물건 이름을 외워서 꼭 넣을 필요는 없어요.',
        },
        {
          head: '모르는 물건은 something으로',
          kind: 'ok',
          text: '물건 이름이 떠오르지 않으면 something으로 넘어가도 돼요. 아는 단어로 자세나 동작을 이어 설명해요.',
        },
        {
          head: 'and만 반복하고 is를 빼는 것',
          kind: 'warn',
          text: 'They are standing처럼 are·is를 빠뜨리지 마세요. 위치를 오른쪽에서 두 번째처럼 잘게 나누지 마세요.',
        },
      ],
    },
    {
      key: 'examples',
      title: '2025 하반기 기출 예제',
      examples: [
        {
          q: 3,
          ask: '호텔 프론트. 세 사람이 서 있는 실내 사진.',
          model: {
            note: '틀 순서 그대로 10문장입니다. 호텔 데스크, 안경 쓴 남자, 곱슬머리, 빨간 옷, 의자를 쉬운 말로 넣었습니다.',
            lines: [
              { en: 'This picture was taken inside.', slot: '장소', src: '자체 작성', check: 'self' },
              { en: "I think it's a hotel front desk.", slot: '구체적 장소', src: '자체 작성', check: 'self' },
              { en: 'First, I can see three people.', slot: '사람', src: '자체 작성', check: 'self' },
              { en: 'They are standing.', slot: '자세', src: '자체 작성', check: 'self' },
              { en: 'A man with glasses is holding a backpack and some books in his hand.', slot: '하는 일', src: '자체 작성', check: 'self' },
              { en: 'A woman with curly hair is talking on the phone.', slot: '하는 일', src: '자체 작성', check: 'self' },
              { en: 'Another woman is wearing red clothes.', slot: '옷', src: '자체 작성', check: 'self' },
              { en: 'A receptionist is standing behind the counter.', slot: '사람', src: '자체 작성', check: 'self' },
              { en: 'In the background, I can see some chairs.', slot: '배경', src: '자체 작성', check: 'self' },
              { en: 'It seems like they are busy.', slot: '분위기', src: '자체 작성', check: 'self' },
            ],
          },
        },
        {
          q: 4,
          ask: '사무실. 두 여자가 복사기 앞에서 일하는 사진.',
          model: {
            note: 'workplace처럼 넓게만 말하지 않고 office, copy machine, yellow envelope를 넣었습니다. printer보다 copy machine이 이 사진에 맞습니다.',
            lines: [
              { en: 'This picture was taken inside.', slot: '장소', src: '자체 작성', check: 'self' },
              { en: "I think it's an office.", slot: '구체적 장소', src: '자체 작성', check: 'self' },
              { en: 'First, I can see two women.', slot: '사람', src: '자체 작성', check: 'self' },
              { en: 'They are working.', slot: '하는 일', src: '자체 작성', check: 'self' },
              { en: 'One woman is bending over to load paper.', slot: '하는 일', src: '자체 작성', check: 'self' },
              { en: 'The paper tray is pulled out of a large copy machine.', slot: '하는 일', src: '자체 작성', check: 'self' },
              { en: 'She has short brown hair, and she is wearing blue clothes.', slot: '머리·옷', src: '자체 작성', check: 'self' },
              { en: 'The other woman is holding a yellow envelope, and there is a stack of yellow envelopes.', slot: '소지품', src: '자체 작성', check: 'self' },
              { en: 'In the background, I can see glass walls and a blue trash can.', slot: '배경', src: '자체 작성', check: 'self' },
              { en: 'It seems like they are busy working.', slot: '분위기', src: '자체 작성', check: 'self' },
            ],
          },
        },
      ],
    },
  ],
};
