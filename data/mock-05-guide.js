/* 모의고사 5 — 해설 데이터 (AI 작성 해설, claude/argon-guide05 브랜치에서 검토·수정됨) */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-05'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '웰컴 투 투데이즈 미팅 오브 더 보드 오브 디렉터즈 포 거스먼 인코퍼레이티드. 아워 매니지먼트 팀 윌 비긴 바이 기빙 프라젝트 업데이츠, 위치 윌 테이크 어바웃 포티파이브 미닛츠. 애프터 댓, 아일 인트로듀스 아워 뉴 엠플로이이즈, 프로포즈 버짓 어저스트먼츠, 앤 익스플레인 퓨처 웍. 앳 눈, 위 윌 테이크 어 브레이크 포 런치.',
    },
    2: {
      pron: '땡큐 포 리쓰닝 투 디스 트래픽 리포트 온 채널 세븐틴 레이디오. 이프 유 워 플래닝 투 드라이브 다운타운 투데이, 유 메이 원트 투 리컨시더. 데어 아 롱거 딜레이즈 댄 유주얼 듀 투 언 이벤트 앳 더 컨벤션 센터. 인스테드, 컨시더 스피딩 업 유어 커뮤트 투 더 시티 센터 바이 테이킹 더 버스, 바이시클링, 오어 라이딩 더 트레인.',
    },
    3: {
      model: 'This picture was taken inside. I think it\'s a hotel lobby. First, I can see three people at the front desk. On the left, a man with glasses is standing and holding a backpack and some books in his hand. In the middle, a woman with curly hair is wearing red clothes and talking on the phone. On the right, a receptionist behind the counter is also talking on the phone. In the background, I can see some chairs. It seems like they are checking in.',
      ko: '이 사진은 실내에서 찍혔습니다. 호텔 로비인 것 같습니다. 먼저 프런트 데스크에 있는 세 사람이 보입니다. 왼쪽에서는 안경을 쓴 남자가 서서 손에 배낭과 책 몇 권을 들고 있습니다. 가운데에서는 곱슬머리를 한 여자가 빨간 옷을 입고 전화 통화를 하고 있습니다. 오른쪽에서는 카운터 뒤의 접수원도 전화 통화를 하고 있습니다. 배경에는 의자들이 보입니다. 그들은 체크인을 하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing at the front desk.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'I think it\'s a hotel lobby.',
        'The first thing I can see is some people.',
        'On the left, / In the middle, / On the right, ~',
        'She is wearing red clothes. (색 + 옷)',
        'She is talking on the phone.',
        'In the background, I can see ~',
        'It seems like they are checking in. / It seems like they are busy.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s an office. First, I can see two women near a large copy machine. In the middle, a woman is standing and putting paper into a yellow envelope, and there is a stack of yellow envelopes next to her. On the right, another woman is bending over to load paper into a paper tray that is pulled out. On the left, there is a blue trash can next to the machine. In the background, I can see glass walls. It seems like they are busy working.',
      ko: '이 사진은 실내에서 찍혔습니다. 사무실인 것 같습니다. 먼저 큰 복사기 근처에 있는 두 여자가 보입니다. 가운데에서는 한 여자가 서서 노란 봉투에 종이를 넣고 있고, 옆에는 노란 봉투 더미가 있습니다. 오른쪽에서는 다른 여자가 몸을 숙여 빠져나와 있는 용지함에 종이를 넣고 있습니다. 왼쪽에는 기계 옆에 파란색 쓰레기통이 있습니다. 배경에는 유리벽들이 보입니다. 그들은 바쁘게 일하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are working in an office.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'The first thing I can see is some people.',
        'I think it\'s an office.',
        'First, I can see two women near a large copy machine.',
        'On the left, / In the middle, / On the right, ~',
        'She is holding a yellow envelope. / She is putting paper into an envelope.',
        'In the background, I can see ~',
        'It seems like they are busy working.',
      ],
    },
    5: {
      model: 'The last time I gave someone a gift was last month. I gave a gift to my friend because it was her birthday. She really liked it.',
      ko: '제가 누군가에게 마지막으로 선물을 준 것은 지난달이었습니다. 친구의 생일이어서 친구에게 선물을 주었습니다. 친구가 정말 좋아했습니다.',
      patterns: [
        'The last time I gave someone a gift was + 시점. (질문을 I로 받기)',
        'I gave a gift to my friend because it was her birthday.',
        'She really liked it. / We had a great time.',
      ],
    },
    6: {
      model: 'I usually buy gifts online because it is very easy and convenient. Also, it is cheaper than going to a store, and there are many options to choose from.',
      ko: '저는 보통 온라인으로 선물을 삽니다. 매우 쉽고 편리하기 때문입니다. 또한 매장에 가는 것보다 저렴하고, 고를 수 있는 선택지도 많습니다.',
      patterns: [
        'I usually buy gifts online because ~',
        'It is very easy and convenient.',
        'It is cheaper than going to a store.',
        'There are many options to choose from.',
      ],
    },
    7: {
      model: 'I would prefer to give some candy. Here\'s why. First, candy is sweet and delicious, so everyone likes it. When people eat sweet things, they can feel happy and relieve their stress. Second, candy is much cheaper than a book. Honestly, books are a little expensive these days, so buying candy is better for my budget. That\'s why I think so.',
      ko: '저는 사탕을 선물하는 쪽을 더 선택하겠습니다. 이유는 이렇습니다. 첫째, 사탕은 달콤하고 맛있어서 누구나 좋아합니다. 사람들이 단것을 먹으면 기분이 좋아지고 스트레스도 풀 수 있습니다. 둘째, 사탕은 책보다 훨씬 저렴합니다. 솔직히 요즘 책은 조금 비싸서 사탕을 사는 것이 제 예산에 더 맞습니다. 그래서 그렇게 생각합니다.',
      patterns: [
        'I would prefer to give + 보기.',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'They can feel happy and relieve their stress.',
        'Second, ~ is much cheaper than ~.',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'The movie showing will be held on June 18 from 6:00 p.m. to 8:00 p.m., and the movie is \'A Butterfly\'s Crossing.\'',
      ko: '영화 상영은 6월 18일 오후 6시부터 8시까지 열리며, 상영작은 "A Butterfly\'s Crossing"입니다.',
      patterns: [
        'It will be held on + 날짜.',
        'It is from + 시작 시각 + to + 종료 시각.',
        'The movie is + 영화 제목.',
      ],
    },
    9: {
      model: 'Actually, the Community Food Festival will be held on June 22, not June 28. It runs from 11:00 a.m. to 8:30 p.m.',
      ko: '사실 Community Food Festival은 6월 28일이 아니라 6월 22일에 열립니다. 오전 11시부터 오후 8시 30분까지 진행됩니다.',
      patterns: [
        'Actually, + 틀린 부분만 바로잡기.',
        'I\'m sorry, but you have the wrong information.',
        'It will be held on + 맞는 날짜, not + 틀린 날짜.',
      ],
    },
    10: {
      model: 'Sure, there are two demonstrations scheduled in June. First, on June 3, from 10:00 a.m. to noon, there is a demonstration on Caring for Fruit Trees. Second, on June 14, from 2:30 p.m. to 4:00 p.m., there is a demonstration on Planting Native Grasses. That\'s it. Thank you.',
      ko: '네, 6월에 예정된 시연 행사는 두 개 있습니다. 첫째, 6월 3일 오전 10시부터 정오까지 "Caring for Fruit Trees" 시연이 있습니다. 둘째, 6월 14일 오후 2시 30분부터 4시까지 "Planting Native Grasses" 시연이 있습니다. 이상입니다. 감사합니다.',
      patterns: [
        'Sure. There are two.',
        'First, on + 날짜, from + 시작 시각 + to + 종료 시각, there is + 행사명.',
        'Second, ~ (첫째와 같은 틀)',
        'That\'s it. Thank you.',
      ],
    },
    11: {
      model: 'I think teachers who assign homework each day are better. I will give reasons or examples to support my opinion. First, it is very helpful for students. As you know, students can easily forget what they learned in class. If teachers assign homework every day, students can review their lessons regularly. Then they can understand the subjects better. As a result, it will be beneficial for their grades. Second, daily homework builds good study habits. In my case, when I was in high school, my teacher gave us homework every day. At first, it was hard, but it helped me study steadily and get good grades. That\'s why I think assigning homework each day is better.',
      ko: '저는 매일 숙제를 내주는 선생님이 더 좋다고 생각합니다. 제 의견을 뒷받침할 이유와 예를 말씀드리겠습니다. 첫째, 학생들에게 매우 도움이 됩니다. 아시다시피 학생들은 수업 시간에 배운 내용을 쉽게 잊어버릴 수 있습니다. 선생님이 매일 숙제를 내주면 학생들은 배운 내용을 규칙적으로 복습할 수 있습니다. 그러면 과목을 더 잘 이해할 수 있습니다. 결과적으로 성적에도 이로울 것입니다. 둘째, 매일 하는 숙제는 좋은 공부 습관을 만들어 줍니다. 제 경우에는 고등학생 때 선생님이 매일 숙제를 내주셨습니다. 처음에는 힘들었지만, 꾸준히 공부하고 좋은 성적을 받는 데 도움이 되었습니다. 그래서 저는 매일 숙제를 내주는 것이 더 좋다고 생각합니다.',
      patterns: [
        'I think teachers who assign homework each day are better.',
        'I will give reasons or examples to support my opinion.',
        'First, it is very helpful for + 대상.',
        'As you know, ~',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Eventually, it will be beneficial.',
        'Then + 결과 한 번 더.',
        'As a result, it will be beneficial for ~',
        'Second, ~',
        'In my case, when I was in high school, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
