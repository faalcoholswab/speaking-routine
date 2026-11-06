/* 모의고사 4 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-04'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '아임 아너드 투 인트로듀스 에이드리언 벤튼 원 오브 더 모스트 익사이팅 아티스츠 워킹 투데이 미스터 벤튼 이즈 노운 포 컴바이닝 컬러 셰이프 앤드 라이트 인투 스터닝 웍스 오브 아트 힐 톡 어바웃 히즈 레이티스트 프로젝트 위드아웃 펄더 딜레이 플리즈 웰컴 미스터 에이드리언 벤튼 투 더 스테이지',
    },
    2: {
      pron: '인 로컬 뉴스 더 그랜드뷰 호텔 체인 윌 오픈 어 뉴 호텔 인 서머필드 컨스트럭션 온 더 라지스트 호텔 인 디 에어리어 이즈 플랜드 투 비긴 디스 서머 더 호텔 윌 오퍼 컨퍼런스 룸스 투 레스토랑스 앤드 엑서사이즈 퍼실리티즈',
    },
    3: {
      model: 'This picture was taken outside. I think it\'s a street. The first thing I can see is some people. It is raining, so they have umbrellas. In the middle, a man is wearing a yellow vest and holding a box. On the left, a man is sitting on a motorbike. He is holding a black umbrella. On the right, a man is looking at his phone. In the background, I can see many shops and motorbikes. It seems like they are busy working.',
      ko: '이 사진은 야외에서 찍혔습니다. 길거리인 것 같습니다. 가장 먼저 보이는 것은 몇 사람입니다. 비가 오고 있어서 그들은 우산을 쓰고 있습니다. 가운데에서는 한 남자가 노란색 조끼를 입고 상자를 들고 있습니다. 왼쪽에서는 한 남자가 오토바이에 앉아 있습니다. 그는 검은 우산을 들고 있습니다. 오른쪽에서는 한 남자가 휴대폰을 보고 있습니다. 배경에는 가게와 오토바이가 많이 보입니다. 그들은 바쁘게 일하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'I think it\'s a street.',
        'The first thing I can see is some people.',
        'On the left, / In the middle, / On the right, ~',
        'He is wearing a yellow vest. (색 + 옷)',
        'He is holding something. (물건 이름을 모를 때)',
        'In the background, I can see ~',
        'It seems like they are busy working. / having a good time.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s a library. First, I can see two people. A woman is holding an open book. She is wearing a green cardigan. Next to her, a man is wearing a blue jacket. He is pointing at the book. In the background, I can see tall bookshelves and a big window. It seems like they are having a good time.',
      ko: '이 사진은 실내에서 찍혔습니다. 도서관인 것 같습니다. 먼저 두 사람이 보입니다. 한 여자가 펼친 책을 들고 있습니다. 그녀는 초록색 카디건을 입고 있습니다. 그녀 옆에서 한 남자가 파란색 재킷을 입고 있습니다. 그는 책을 가리키고 있습니다. 배경에는 높은 책장과 큰 창문이 보입니다. 그들은 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'The first thing I can see is some people.',
        'It seems like they are busy working.',
        'I think it\'s a library.',
        'First, I can see some people.',
        'She is wearing a green cardigan. (색 + 옷)',
        'Next to her, ~',
        'In the background, I can see ~',
        'It seems like they are having a good time.',
      ],
    },
    5: {
      model: 'Yes, I enjoy cooking outdoors because it\'s fun and relaxing. I can also enjoy fresh air.',
      ko: '네, 저는 야외에서 요리하는 것을 즐깁니다. 재미있고 편안하기 때문입니다. 맑은 공기도 즐길 수 있습니다.',
      patterns: [
        'Yes, I + 질문 동사 + because it\'s fun and relaxing.',
        'I can also ~',
      ],
    },
    6: {
      model: 'The most delicious food is grilled chicken because it\'s juicy and tasty. I last had it two weeks ago at a park.',
      ko: '가장 맛있는 음식은 구운 닭고기입니다. 촉촉하고 맛있기 때문입니다. 마지막으로 먹은 것은 2주 전 공원에서였습니다.',
      patterns: [
        'The most delicious food is + 음식 + because it\'s ~.',
        'I last had it + 시간.',
      ],
    },
    7: {
      model: 'I would say cooking indoors. Here\'s why. First, it\'s easy because I have everything in the kitchen. Second, I don\'t worry about the weather, like rain or wind. It\'s also fast and convenient, so I can save time. That\'s why I think cooking indoors is easier.',
      ko: '저는 실내 요리라고 말하겠습니다. 이유는 이렇습니다. 첫째, 부엌에 모든 것이 있어서 쉽습니다. 둘째, 비나 바람 같은 날씨를 걱정하지 않아도 됩니다. 또한 빠르고 편리해서 시간을 아낄 수 있습니다. 그래서 저는 실내 요리가 더 쉽다고 생각합니다.',
      patterns: [
        'I would say + 답 + because ~',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'It\'s fast and convenient, so I can ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'It will be held on Saturday, August 15. Registration starts at 8 a.m.',
      ko: '행사는 8월 15일 토요일에 열립니다. 등록은 오전 8시에 시작합니다.',
      patterns: [
        'It will be held on + 날짜.',
        'Registration starts at + 시각.',
      ],
    },
    9: {
      model: 'Actually, the lunch with Henry Patton has been canceled.',
      ko: '사실 Henry Patton과의 점심은 취소되었습니다.',
      patterns: [
        'Actually, ~ has been canceled.',
      ],
    },
    10: {
      model: 'Sure, there are two. First, from 1 to 3 p.m., there is a discussion, Teaching Beginning Swimmers, by Laura Davis. Second, from 4 to 6 p.m., there is a workshop, Training Exercises for Beginners, by Robert Miller.',
      ko: '네, 두 개 있습니다. 첫째, 오후 1시부터 3시까지 Laura Davis의 토론 "Teaching Beginning Swimmers"가 있습니다. 둘째, 오후 4시부터 6시까지 Robert Miller의 워크숍 "Training Exercises for Beginners"가 있습니다.',
      patterns: [
        'Sure. There are two.',
        'First, from ~ to ~, there is + 제목 + by + 발표자.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'No, I don\'t think it\'s possible for students to do well on their schoolwork if they start working right before the deadline. I will give reasons or examples to support my opinion. First, good work needs time. As you know, students need time to plan and check. If they start late, they can\'t fix mistakes. Then they have to hurry. As a result, their work will not be good. Second, they feel a lot of stress. In my case, when I was in college, I started a report late. I felt stressed, and my grade was low. That\'s why I think students should start early.',
      ko: '아니요, 저는 학생들이 마감 직전에 작업을 시작하면 숙제를 잘 해내기 어렵다고 생각합니다. 제 의견을 뒷받침할 이유와 예를 말씀드리겠습니다. 첫째, 좋은 결과물에는 시간이 필요합니다. 아시다시피 학생들은 계획하고 확인할 시간이 필요합니다. 늦게 시작하면 실수를 고칠 수 없습니다. 그러면 서둘러야 합니다. 결과적으로 결과물이 좋지 않을 것입니다. 둘째, 스트레스를 많이 받습니다. 제 경우에는 대학생 때 보고서를 늦게 시작했습니다. 스트레스를 받았고 성적도 낮았습니다. 그래서 저는 학생들이 일찍 시작해야 한다고 생각합니다.',
      patterns: [
        'I agree that + 제시문. / No, I don\'t think + 제시문.',
        'I will give reasons or examples to support my opinion.',
        'First, ~',
        'As you know, ~',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Eventually, it will be beneficial.',
        'Then + 결과 한 번 더.',
        'As a result, ~',
        'Second, ~',
        'In my case, when I was in college, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
