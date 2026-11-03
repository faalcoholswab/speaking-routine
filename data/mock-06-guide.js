/* 모의고사 6 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-06'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '유어 리스닝 투 채널 포티 트래픽 리포트 데어 아 딜레이즈 온 루트 포틴 리빙스턴 스트리트 앤 애플우드 애비뉴 디스 모닝 인 어디션 커뮤터스 슈드 비 어웨어 댓 웍 컨티뉴스 온 파워 라인스 스루아웃 디 에어리어 디스 메이 코즈 썸 브리프 로드 클로저스 비포 유 드라이브 홈 프롬 웍 디스 이브닝 튠 인 어게인 포 언 업데이트 온 로컬 로드 컨디션스',
    },
    2: {
      pron: '웰컴 투 투데이스 투어 오브 더 히스토릭 밀턴우드 홀 디스 하우스 워즈 디자인드 앤 빌트 모어 댄 투 센추리스 어고 바이 데이비스 밀턴우드 어 페이머스 아키텍트 스루아웃 더 투어 아일 포인트 아웃 앤 익스플레인 매니 인터레스팅 디테일즈 어바웃 더 디자인 애프터 더 투어 필 프리 투 익스플로어 디 아웃도어 가든스 릴랙스 바이 더 파운틴 오어 비짓 더 기프트 샵',
    },
    3: {
      model: 'This picture was taken inside. I think it\'s a restaurant. First, I can see some people. They are standing or sitting near the table. On the left, a waiter is standing and holding a plate of food. He has short brown hair, and he is wearing a uniform. On the table, I can see some glasses. In the background, I can see other customers. It seems like they\'re having a good time.',
      ko: '이 사진은 실내에서 찍혔습니다. 식당인 것 같습니다. 먼저 몇 사람이 보입니다. 테이블 근처에 서 있거나 앉아 있습니다. 왼쪽에서는 웨이터가 서서 음식 접시를 들고 있습니다. 짧은 갈색 머리이고, 유니폼을 입고 있습니다. 테이블 위에는 잔이 몇 개 보입니다. 뒤쪽에는 다른 손님들이 보입니다. 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside.',
        'I think it\'s a restaurant.',
        'First, I can see some people. They are standing or sitting near the table.',
        'On the left, a waiter is standing and holding ~.',
        'It seems like they\'re having a good time.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s an office. First, I can see two people, and they are standing. In the foreground, a woman is standing and holding the elevator. She has long blond hair, and she is wearing a white shirt. In the background, I can see a man. He is holding a cup of coffee. It seems like they\'re busy.',
      ko: '이 사진은 실내에서 찍혔습니다. 사무실인 것 같습니다. 먼저 두 사람이 보이고, 둘 다 서 있습니다. 앞쪽에서는 한 여자가 서서 엘리베이터를 잡고 있습니다. 긴 금발에 흰 셔츠를 입고 있습니다. 뒤쪽에는 한 남자가 보이고, 커피 한 잔을 들고 있습니다. 바빠 보입니다.',
      patterns: [
        'This picture was taken inside. I think it\'s an office.',
        'I think it\'s inside the building.',
        'First, I can see two people, and they are standing.',
        'In the foreground, a woman is standing and holding the elevator.',
        'She has long blond hair, and she is wearing a white shirt.',
        'It seems like they\'re busy.',
      ],
    },
    5: {
      model: 'The last time I spent a traditional holiday with someone was last week, and it was my family. I had a great time.',
      ko: '누군가와 전통 명절을 보낸 마지막은 지난주였고, 가족이었습니다. 정말 좋은 시간이었습니다.',
      patterns: [
        'The last time I spent a traditional holiday with someone was last week.',
        'And it was my family.',
        'I\'d say last week with my family.',
        'I had a great time.',
      ],
    },
    6: {
      model: 'I prefer to stay at home because I\'m a senior in college and I\'m always tired. I want to relax at home.',
      ko: '집에 있는 쪽을 더 좋아합니다. 대학교 4학년이라 항상 피곤하기 때문입니다. 집에서 쉬고 싶습니다.',
      patterns: [
        'I prefer to stay at home because I\'m a senior in college and I\'m always tired.',
        'I want to relax at home.',
        'I\'d say visit my family because it\'s fun and entertaining.',
      ],
    },
    7: {
      model: 'I\'d say cooking and eating traditional food. Here\'s why. It\'s very fun and entertaining to me. Actually, I like cooking. I mean, I love cooking. We can have a great time, so I can get rid of my stress. That\'s why I think so.',
      ko: '전통 음식을 만들어 먹는 쪽이라고 하겠습니다. 이유는 이렇습니다. 저한테는 정말 재미있고 즐겁습니다. 사실 요리를 좋아합니다. 아니, 요리를 아주 좋아합니다. 함께 좋은 시간을 보낼 수 있어서, 스트레스를 풀 수 있습니다. 그래서 그렇게 생각합니다.',
      patterns: [
        'I\'d say cooking and eating traditional food.',
        'Here\'s why. It\'s very fun and entertaining to me.',
        'Actually, I like cooking. I mean, I love cooking.',
        'Actually, I\'m a foodie. I mean, I love food.',
        'We can have a great time, so I can get rid of my stress.',
      ],
    },
    8: {
      model: 'The last interview is at 11:30 a.m., and the candidate is Brian Cho.',
      ko: '마지막 면접은 오전 11시 30분이고, 지원자는 Brian Cho입니다.',
      patterns: [
        'The last interview is at 11:30 a.m.',
        'The candidate is Brian Cho.',
        'It is 11:30 a.m., and it\'s Brian Cho.',
      ],
    },
    9: {
      model: 'Actually, at 10:30 a.m., John Doe\'s interview has been moved to March 16.',
      ko: '사실 오전 10시 30분 John Doe의 면접은 3월 16일로 옮겨졌습니다.',
      patterns: [
        'Actually, ~ has been moved to March 16.',
        'Don\'t worry about that.',
        'I\'m sorry about that.',
      ],
    },
    10: {
      model: 'Sure, there are two. First, at 9 a.m., there is James Miller for the sales department. He has 7 years of experience. Second, at 11 a.m., there is Emily Davis for the design department. She has 10 years of experience. That\'s it. Thank you.',
      ko: '네, 두 명입니다. 첫째, 오전 9시에 영업 부서의 James Miller가 있습니다. 경력은 7년입니다. 둘째, 오전 11시에 디자인 부서의 Emily Davis가 있습니다. 경력은 10년입니다. 이상입니다. 감사합니다.',
      patterns: [
        'Sure, there are two.',
        'First, at 9 a.m., there is James Miller for the sales department.',
        'He has 7 years of experience.',
        'Second, at 11 a.m., there is Emily Davis for the design department.',
        'That\'s it. Thank you.',
      ],
    },
    11: {
      model: 'I agree with the statement. People need to have some boring time occasionally. I will give some reasons or examples to support my opinion. First, it can increase work efficiency. If we have some boring time, we can relax and recharge our batteries. Then you can focus on your work better. As a result, it will be very beneficial. Second, it is essential when it comes to creativity. Actually, when I was in college, I had many team projects. At that time, I was very busy and stressed out. So, I took a break. I came up with some new ideas. I could solve problems easily. It was very helpful for our team\'s success. That\'s why I think so.',
      ko: '그 말에 동의합니다. 사람들은 가끔 지루한 시간이 필요합니다. 제 의견을 뒷받침할 이유나 예를 들겠습니다. 첫째, 일의 효율을 높일 수 있습니다. 지루한 시간이 있으면 쉬고 에너지를 충전할 수 있습니다. 그러면 일에 더 잘 집중할 수 있습니다. 결과적으로 아주 이롭습니다. 둘째, 창의성에는 꼭 필요합니다. 사실 대학 때 팀 과제가 많았습니다. 그때 매우 바쁘고 스트레스가 심했습니다. 그래서 쉬었습니다. 새로운 아이디어가 떠올랐고, 문제를 쉽게 풀 수 있었습니다. 우리 팀이 잘되는 데 큰 도움이 되었습니다. 그래서 그렇게 생각합니다.',
      patterns: [
        'I agree with the statement. People need to have some boring time occasionally.',
        'I will give some reasons or examples to support my opinion.',
        'If we have some boring time, we can relax and recharge our batteries.',
        'As a result, it will be very beneficial.',
        'Actually, when I was in college, I had many team projects.',
      ],
    },
  },
};
