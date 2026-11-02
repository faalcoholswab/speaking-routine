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
      model: 'This picture shows a busy restaurant with warm lighting. In the center-left, a young waiter with short brown hair is serving a plate of vegetables with both hands. He\'s wearing a white shirt, a dark vest, and a dark tie. A smiling man in a dark sweater and a woman with long dark wavy hair and a black top are looking at the plate. On the table are glasses of red wine, water, flowers, white plates, forks, knives, a basket of bread, and a table number card. Other people are dining in the background.',
      ko: '이 사진은 따뜻한 조명이 비치는 분주한 식당을 보여 줍니다. 중앙 왼쪽에서 짧은 갈색 머리의 젊은 웨이터가 흰 셔츠와 어두운 조끼, 어두운 넥타이를 입고 두 손으로 채소 요리 한 접시를 서빙하고 있습니다. 테이블에서는 어두운 스웨터를 입은 웃는 남자와 검은 상의를 입고 길고 어두운 곱슬머리를 한 여자가 그 접시를 바라보고 있습니다. 테이블 위에는 레드와인 잔, 물, 꽃, 흰 접시, 포크, 나이프, 빵 바구니, 테이블 번호 카드가 있습니다. 배경에서는 다른 사람들이 식사하고 있습니다.',
      patterns: [
        'This picture shows + 장소',
        'In the center-left, a young waiter is serving ~ with both hands.',
        'On the table are + 복수 명사',
        'In the background, other people are ~ing',
      ],
    },
    4: {
      model: 'This picture shows an elevator in an office building. A smiling woman with wavy blond hair is wearing a white blouse and black pants. She\'s holding the elevator door open with her right hand and carrying a black folder in her left hand. Inside the elevator, a smiling man with short dark hair is holding a coffee cup. He\'s wearing a dark suit jacket and a light blue shirt. On the wall to the right, a floor display shows an up arrow and the number 5, with two round buttons below it.',
      ko: '이 사진은 사무용 건물의 엘리베이터를 보여 줍니다. 웨이브 진 금발의 웃는 여자가 흰 블라우스와 검은 바지를 입고 있습니다. 그녀는 오른손으로 엘리베이터 문을 잡아 열어 두고 왼손에는 검은 폴더를 들고 있습니다. 엘리베이터 안에서는 짧은 어두운 머리의 웃는 남자가 커피 잔을 들고 있습니다. 그는 어두운 정장 재킷과 밝은 파란색 셔츠를 입고 있습니다. 오른쪽 벽에는 위쪽 화살표와 숫자 5를 보여 주는 층 표시기가 있고, 그 아래에 둥근 버튼 두 개가 있습니다.',
      patterns: [
        'This picture shows + 장소',
        'A woman with wavy blond hair is wearing ~',
        'She is holding ~ with her right hand and ~ in her left hand.',
        'On the wall to the right, ~ shows ~',
      ],
    },
    5: {
      model: 'The last time I spent a traditional holiday with someone was last Christmas. I celebrated with my parents and my younger sister at my parents\' home. We cooked dinner together, exchanged gifts, and talked about what we\'d done that year.',
      ko: '제가 누군가와 전통 명절을 보낸 마지막 때는 지난 크리스마스였습니다. 부모님 집에서 부모님과 여동생과 함께 보냈습니다. 우리는 함께 저녁을 요리하고 선물을 주고받으며 그해에 했던 일들에 대해 이야기했습니다.',
      patterns: [
        'The last time I spent ~ was + 시점',
        'I celebrated with ~',
        'We cooked dinner together and talked about ~',
      ],
    },
    6: {
      model: 'I prefer to visit my family on traditional holidays because we don\'t get to see each other very often. It\'s a good opportunity to catch up and enjoy a meal together. Spending that time with them makes the holiday feel more special.',
      ko: '저는 전통 명절에 가족을 만나러 가는 것을 선호합니다. 서로 자주 만나지 못하기 때문입니다. 함께 근황을 나누고 식사를 즐길 수 있는 좋은 기회입니다. 가족과 그 시간을 보내면 명절이 더 특별하게 느껴집니다.',
      patterns: [
        'I prefer to visit my family on traditional holidays because ~',
        'It is a good opportunity to ~',
        'Spending that time with them makes ~ feel more special.',
      ],
    },
    7: {
      model: 'I usually choose "Cooking and eating traditional food" because it gives everyone a chance to spend time together. We prepare different dishes and share family recipes. I especially enjoy hearing my parents\' stories while we cook, and the meal always makes the holiday feel special.',
      ko: '저는 보통 "전통 음식을 만들어 먹기"를 선택합니다. 모든 사람이 함께 시간을 보낼 기회가 되기 때문입니다. 우리는 여러 가지 음식을 만들고 가족의 레시피를 나눕니다. 저는 특히 요리하면서 부모님의 이야기를 듣는 것을 좋아하고, 그 식사는 항상 명절을 특별하게 느껴지게 합니다.',
      patterns: [
        'I usually choose + 선택지 + because ~',
        'It gives everyone a chance to ~',
        'I especially enjoy ~ while we ~',
      ],
    },
    8: {
      model: 'The last interview is scheduled for 11:30 AM, and the candidate is Brian Cho. He is interviewing for the IT department and has four years of experience.',
      ko: '마지막 면접은 오전 11시 30분으로 예정되어 있고, 지원자는 Brian Cho입니다. 그는 IT 부서에 지원했고 경력은 4년입니다.',
      patterns: [
        'The last interview is scheduled for + 시간, and the candidate is ~',
        'He is interviewing for + 부서 + and has ~ years of experience.',
      ],
    },
    9: {
      model: 'Actually, John Doe\'s interview is no longer scheduled for March 12. His 10:30 AM interview for the HR department has been moved to March 16. He has five years of experience.',
      ko: '사실 John Doe의 면접은 더 이상 3월 12일로 예정되어 있지 않습니다. 오전 10시 30분 HR 부서 면접은 3월 16일로 옮겨졌습니다. 그는 경력이 5년입니다.',
      patterns: [
        'Actually, ~ is no longer scheduled for + 날짜',
        'His interview has been moved to + 날짜',
      ],
    },
    10: {
      model: 'There are two candidates with at least six years of experience. James Miller has seven years in Sales, and his interview is at 9:00 AM. Emily Davis has ten years in Design, and her interview is at 11:00 AM.',
      ko: '경력이 6년 이상인 지원자는 두 명입니다. James Miller는 영업 부서에서 7년의 경력이 있고 면접은 오전 9시입니다. Emily Davis는 디자인 부서에서 10년의 경력이 있고 면접은 오전 11시입니다.',
      patterns: [
        'There are two candidates with at least six years of experience.',
        'A has seven years in Sales, and his interview is at + 시간',
        'B has ten years in Design, and her interview is at + 시간',
      ],
    },
    11: {
      model: 'I agree that people need some boring time occasionally. First, having nothing exciting to do gives our minds a break from constant information and busy schedules. For example, I sometimes sit quietly without checking my phone, and I feel calmer afterward. Second, boredom can encourage creativity. When we aren\'t distracted by entertainment, we may think of new ideas or notice problems we want to solve. So, although boredom can be uncomfortable, a little of it can be surprisingly useful.',
      ko: '저는 사람들에게 가끔 지루한 시간이 필요하다는 데 동의합니다. 첫째, 흥미로운 일이 아무것도 없으면 끊임없는 정보와 바쁜 일정에서 우리의 정신이 잠시 쉴 수 있습니다. 예를 들어 저는 가끔 휴대전화를 확인하지 않고 조용히 앉아 있는데, 그러고 나면 마음이 더 차분해집니다. 둘째, 지루함은 창의성을 자극할 수 있습니다. 오락에 방해받지 않을 때 우리는 새로운 아이디어를 떠올리거나 해결하고 싶은 문제를 발견할 수 있습니다. 그래서 지루함이 불편할 수 있지만, 조금의 지루함은 놀랄 만큼 유용할 수 있습니다.',
      patterns: [
        'I agree that + 제시문',
        'First, ~ / Second, ~',
        'For example, ~',
        'So, although ~, ~',
      ],
    },
  },
};
