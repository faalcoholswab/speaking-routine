/* 모의고사 3 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-03'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '웰컴 투 오크데일 파크 아워 워킹 투어 이즈 어 그레이트 웨이 투 익스플로어 더 뷰티 오브 네이처 애즈 유 팔로우 더 트레일 페이 어텐션 투 더 사운즈 오브 네이처 어라운드 유 얼롱 더 웨이 유 캔 인조이 뷰티풀 트리스 와일드 애니멀스 앤 컬러풀 플라워스 플리즈 스테이 온 더 트레일 앤 테이크 유어 타임 인조잉 더 내추럴 서라운딩스',
    },
    2: {
      pron: '땡큐 포 어텐딩 투데이스 컨퍼런스 아임 히어 투데이 투 톡 어바웃 트래픽 컨제스천 인 아워 씨티 위 해브 플랜스 투 익스팬드 버스 서비시즈 프로모트 카풀링 프로그램스 앤 인크리스 더 넘버 오브 바이크 레인스 디즈 체인지스 윌 헬프 리듀스 트래픽 컨제스천 앤 메이크 잇 이지어 포 피플 투 겟 어라운드 더 씨티',
    },
    3: {
      model: 'This picture was taken inside. I think it\'s a meeting room. The first thing I can see is two women. They are sitting at a long table. On the left, a woman is wearing a yellow sweater. She is looking at the other woman. On the right, a woman is wearing a light blue shirt. She is smiling. There is some food on the table. In the background, I can see a computer.',
      ko: '이 사진은 실내에서 찍혔습니다. 회의실인 것 같습니다. 가장 먼저 보이는 것은 두 여자입니다. 그들은 긴 테이블에 앉아 있습니다. 왼쪽에서는 한 여자가 노란색 스웨터를 입고 있습니다. 그녀는 다른 여자를 보고 있습니다. 오른쪽에서는 한 여자가 하늘색 셔츠를 입고 있습니다. 그녀는 웃고 있습니다. 테이블 위에는 음식이 있습니다. 배경에는 컴퓨터가 보입니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s a meeting room.',
        'The first thing I can see is some people.',
        'They are sitting at the table.',
        'On the left, / In the middle, / On the right, ~',
        'She is wearing a yellow sweater. (색 + 옷)',
        'In the background, I can see ~',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s a library. The first thing I can see is three people. They are standing and talking. On the left, a woman is carrying a black bag. In the middle, a woman is holding something. On the right, a man is holding a green folder. In the background, I can see many books on the shelves. It seems like they are having a good time.',
      ko: '이 사진은 실내에서 찍혔습니다. 도서관인 것 같습니다. 가장 먼저 보이는 것은 세 사람입니다. 그들은 서서 이야기하고 있습니다. 왼쪽에서는 한 여자가 검은 가방을 들고 있습니다. 가운데에서는 한 여자가 무언가를 들고 있습니다. 오른쪽에서는 한 남자가 초록색 폴더를 들고 있습니다. 배경에는 책장에 책이 많이 보입니다. 그들은 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s a library.',
        'The first thing I can see is some people.',
        'They are standing and talking.',
        'On the left, / In the middle, / On the right, ~',
        'She is holding something. (물건 이름을 모를 때)',
        'In the background, I can see ~',
        'It seems like they are having a good time.',
      ],
    },
    5: {
      model: 'I usually listen to music at night because it\'s relaxing. It helps me sleep well.',
      ko: '저는 보통 밤에 음악을 듣습니다. 편안해지기 때문입니다. 잠을 잘 자는 데 도움이 됩니다.',
      patterns: [
        'I usually ~ because it\'s relaxing.',
        'It helps me ~',
      ],
    },
    6: {
      model: 'I would say listening to music with others is more enjoyable because it\'s fun. We can sing together.',
      ko: '저는 다른 사람들과 함께 음악을 듣는 것이 더 즐겁다고 말하겠습니다. 재미있기 때문입니다. 함께 노래할 수 있습니다.',
      patterns: [
        'I would say + 답 + because ~',
        'We can ~ together.',
      ],
    },
    7: {
      model: 'I would say pop music. Here\'s why. First, it\'s fun and exciting, so people feel happy. Second, many people know the songs, so everyone can sing along. They can also dance easily to the strong beat. That\'s why I think pop music is the best for a party.',
      ko: '저는 팝 음악이라고 말하겠습니다. 이유는 이렇습니다. 첫째, 재미있고 신나서 사람들이 행복해집니다. 둘째, 많은 사람들이 그 노래를 알아서 모두 따라 부를 수 있습니다. 강한 비트 덕분에 쉽게 춤출 수도 있습니다. 그래서 저는 팝 음악이 파티에 가장 좋다고 생각합니다.',
      patterns: [
        'I would say + 고른 보기.',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'so I can ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'The first thing is Review Weekly Sales Report. It starts at 10 a.m.',
      ko: '첫 번째 일정은 Review Weekly Sales Report입니다. 오전 10시에 시작합니다.',
      patterns: [
        'The first thing is + 표의 첫 줄.',
        'It starts at + 시각.',
      ],
    },
    9: {
      model: 'Actually, that meeting has been moved to July 24. Sorry about that.',
      ko: '사실 그 회의는 7월 24일로 옮겨졌습니다. 죄송합니다.',
      patterns: [
        'Actually, ~ has been moved to + 날짜.',
        'Sorry about that. (나쁜 소식) / Don\'t worry about that. (좋은 소식)',
      ],
    },
    10: {
      model: 'Sure, there are two. First, from 1 to 2 p.m., there is Analyze Customer Feedback. Second, from 5 to 5:30 p.m., there is a meeting, Customer Feedback Insights.',
      ko: '네, 두 개 있습니다. 첫째, 오후 1시부터 2시까지 "Analyze Customer Feedback"가 있습니다. 둘째, 오후 5시부터 5시 30분까지 "Customer Feedback Insights" 회의가 있습니다.',
      patterns: [
        'Sure, there are two.',
        'First, from ~ to ~, there is + 항목.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I agree that it has become more difficult for parents to raise their children because of smartphones. I will give reasons or examples to support my opinion. First, children spend too much time on their phones. As you know, phones can be very fun. If children play games all day, they can\'t study. Then parents have to tell them to stop again and again. As a result, parents get tired. Second, phones are not always safe for kids. For example, my cousin watched strange videos online. His mother was very worried about it. That\'s why I think it is harder today.',
      ko: '저는 스마트폰 때문에 부모가 아이를 키우기가 더 어려워졌다는 데 동의합니다. 제 의견을 뒷받침할 이유와 예를 말씀드리겠습니다. 첫째, 아이들이 휴대폰에 너무 많은 시간을 씁니다. 아시다시피 휴대폰은 아주 재미있을 수 있습니다. 아이들이 하루 종일 게임을 하면 공부할 수 없습니다. 그러면 부모는 그만하라고 계속 말해야 합니다. 결과적으로 부모는 지칩니다. 둘째, 휴대폰은 아이들에게 항상 안전하지는 않습니다. 예를 들어 제 사촌은 온라인에서 이상한 영상을 봤습니다. 그의 어머니는 그것을 매우 걱정했습니다. 그래서 저는 오늘날 더 어렵다고 생각합니다.',
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
        'For example, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
