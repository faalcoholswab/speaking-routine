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
      model: 'This picture was taken inside. I think it\'s a restaurant. The first thing I can see is some people. On the left, a waiter is serving a plate of food. He is wearing a white shirt and a dark vest. In the middle, a man in a dark sweater is smiling. On the right, a woman has long dark hair. There is a glass of red wine on the table. In the background, I can see other people. It seems like they are having a good time.',
      ko: '이 사진은 실내에서 찍혔습니다. 식당인 것 같습니다. 가장 먼저 보이는 것은 몇 사람입니다. 왼쪽에서는 웨이터가 음식 한 접시를 내오고 있습니다. 그는 흰 셔츠와 어두운 조끼를 입고 있습니다. 가운데에서는 어두운 스웨터를 입은 남자가 웃고 있습니다. 오른쪽에서는 한 여자가 길고 어두운 머리입니다. 테이블 위에는 레드와인 한 잔이 있습니다. 배경에는 다른 사람들이 보입니다. 그들은 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'I think it\'s a restaurant.',
        'The first thing I can see is some people.',
        'On the left, / In the middle, / On the right, ~',
        'She has long dark hair.',
        'He is wearing a white shirt. (색 + 옷)',
        'In the background, I can see ~',
        'It seems like they are having a good time.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s an elevator. The first thing I can see is a woman. She has long blond hair. She is wearing a white blouse. She is holding the elevator door and carrying a folder. Behind her, a man in a dark jacket is holding a coffee cup. They are both smiling. On the right, I can see the number 5. It seems like they are going to work.',
      ko: '이 사진은 실내에서 찍혔습니다. 엘리베이터인 것 같습니다. 가장 먼저 보이는 것은 한 여자입니다. 그녀는 긴 금발입니다. 그녀는 흰 블라우스를 입고 있습니다. 그녀는 엘리베이터 문을 잡고 폴더를 들고 있습니다. 그녀 뒤에서 어두운 재킷을 입은 남자가 커피잔을 들고 있습니다. 두 사람 모두 웃고 있습니다. 오른쪽에는 숫자 5가 보입니다. 그들은 출근하는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'I think it\'s an elevator.',
        'The first thing I can see is a woman.',
        'She has long blond hair.',
        'She is wearing a white blouse. (색 + 옷)',
        'She is carrying a folder.',
        'Behind her, ~',
        'It seems like they are going to work.',
      ],
    },
    5: {
      model: 'The last time was last Christmas, and I spent it with my family. We cooked dinner together at my parents\' house, and it was a lot of fun.',
      ko: '마지막은 지난 크리스마스였고, 저는 가족과 함께 보냈습니다. 우리는 부모님 집에서 함께 저녁을 요리했고 정말 즐거웠습니다.',
      patterns: [
        'The last time was + 시점, and I spent it with + 사람. (질문을 받기)',
        'We ~ together, and it was a lot of fun.',
      ],
    },
    6: {
      model: 'I prefer visiting my family because it\'s fun. I don\'t see them often, so I want to spend time with them.',
      ko: '저는 가족을 찾아가는 것을 더 좋아합니다. 재미있기 때문입니다. 자주 만나지 못해서 함께 시간을 보내고 싶습니다.',
      patterns: [
        'I prefer ~ because it\'s fun.',
        'so I want to ~',
      ],
    },
    7: {
      model: 'I would say cooking and eating traditional food. Here\'s why. First, it\'s fun to cook together with my family. Second, the food is delicious, so everyone is happy. We can also talk a lot and share stories. That\'s why I think it\'s the best way to spend a holiday.',
      ko: '저는 전통 음식을 만들어 먹는 것이라고 말하겠습니다. 이유는 이렇습니다. 첫째, 가족과 함께 요리하는 것이 재미있습니다. 둘째, 음식이 맛있어서 모두가 행복합니다. 이야기도 많이 나누고 추억도 공유할 수 있습니다. 그래서 저는 그것이 명절을 보내는 가장 좋은 방법이라고 생각합니다.',
      patterns: [
        'I would say + 답 + because ~',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'so I can ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'The last interview is at 11:30 a.m. The candidate is Brian Cho.',
      ko: '마지막 면접은 오전 11시 30분입니다. 지원자는 Brian Cho입니다.',
      patterns: [
        'The last interview is at + 시각.',
        'It\'s + 값. (표의 값만)',
      ],
    },
    9: {
      model: 'Actually, John\'s interview has been moved to March 16.',
      ko: '사실 John의 면접은 3월 16일로 옮겨졌습니다.',
      patterns: [
        'Actually, ~ has been moved to + 날짜.',
      ],
    },
    10: {
      model: 'Sure, there are two. First, at 9 a.m., there is James Miller from Sales. He has seven years of experience. Second, at 11 a.m., there is Emily Davis from Design. She has ten years of experience.',
      ko: '네, 두 명 있습니다. 첫째, 오전 9시에 영업 부서의 James Miller가 있습니다. 그는 경력이 7년입니다. 둘째, 오전 11시에 디자인 부서의 Emily Davis가 있습니다. 그녀는 경력이 10년입니다.',
      patterns: [
        'Sure, there are two.',
        'First, at ~, there is + 이름 + from + 부서.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I agree that people need to have some boring time occasionally. I will give specific reasons or examples to support my opinion. First, it will be good for our minds. As you know, we use our phones all day. If we have some quiet time, we can relax. Then we can think about new ideas. As a result, it will be beneficial for our work. Second, boring time helps me feel better. In my case, when I was in college, I sat in a park without my phone. I felt calm and happy. That\'s why I think we need boring time.',
      ko: '저는 사람들에게 가끔 지루한 시간이 필요하다는 데 동의합니다. 제 의견을 뒷받침할 구체적인 이유와 예를 말씀드리겠습니다. 첫째, 우리 마음에 좋습니다. 아시다시피 우리는 하루 종일 휴대폰을 씁니다. 조용한 시간이 있으면 긴장을 풀 수 있습니다. 그러면 새로운 아이디어를 생각할 수 있습니다. 결과적으로 우리 일에도 이로울 것입니다. 둘째, 지루한 시간은 제 기분을 좋게 해 줍니다. 제 경우에는 대학생 때 휴대폰 없이 공원에 앉아 있었습니다. 마음이 차분해지고 행복했습니다. 그래서 저는 지루한 시간이 필요하다고 생각합니다.',
      patterns: [
        'I agree that + 제시문. / No, I don\'t think + 제시문.',
        'I will give reasons or examples to support my opinion.',
        'First, it will be good for + 대상.',
        'As you know, ~',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Then + 결과 한 번 더.',
        'As a result, it will be beneficial for ~',
        'Second, ~',
        'In my case, when I was in college, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
