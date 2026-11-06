/* 모의고사 1 — 해설 데이터
   ※ 원작자 허가 확인됨 (수정·배포 가능). */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-01'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '헬로우 에브리원. 잇츠 어 플레저 투 스픽 앳 투데이즈 커뮤니티 포럼. 애즈 어 트랜스포테이션 리포터 포 시티 레이디오, 아이브 런드 하우 트래픽 업데이츠 어펙트 아워 데일리 루틴즈. 릴라이어블 리포트 헬프 커뮤터즈 츄즈 데어 라우츠, 어보이드 딜레이즈, 앤 어라이브 앳 데어 데스티네이션즈 온 타임. 댓츠 와이 프로바이딩 클리어 앤 애큐럿 인포메이션 이즈 쏘 임포턴트.',
    },
    2: {
      pron: '웰컴 투 아워 가이디드 워킹 투어 오브 더 리버사이드 디스트릭트, 워너브 더 타운즈 페이버릿 네이버후즈. 얼롱 더 웨이, 율 디스커버 히스토릭 빌딩즈, 컬러풀 뮤럴즈, 앤 어 라이블리 샤핑 스트리트. 이프 유 니드 어시스턴스 오어 우드 라이크 투 런 모어 어바웃 어 파티큘러 로케이션, 플리즈 애스크 유어 투어 가이드. 위 호프 유 해브 어 원더풀 비짓.',
    },
    3: {
      model: 'This picture was taken inside. I think it\'s an office. The first thing I can see is three people. On the left, a man is sitting and talking. In the middle, another man is standing and holding a tablet. On the right, a woman is holding a cup. There is a laptop and a plant on the table. In the background, I can see large windows. It seems like they are having a meeting.',
      ko: '이 사진은 실내에서 찍혔습니다. 사무실인 것 같습니다. 가장 먼저 보이는 것은 세 사람입니다. 왼쪽에서는 한 남자가 앉아서 이야기하고 있습니다. 가운데에서는 다른 남자가 서서 태블릿을 들고 있습니다. 오른쪽에서는 한 여자가 컵을 들고 있습니다. 테이블 위에 노트북과 식물이 있습니다. 배경에는 큰 창문들이 보입니다. 그들은 회의를 하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s an office.',
        'The first thing I can see is some people.',
        'On the left, / In the middle, / On the right, ~',
        'In the background, I can see ~',
        'It seems like they are having a meeting.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s an office. First, I can see two people. On the left, a man is opening a cabinet and looking for something. On the right, a woman is watering a big plant. I can also see a brick wall and a wooden floor. In the background, I can see a glass door. It seems like they are busy working.',
      ko: '이 사진은 실내에서 찍혔습니다. 사무실인 것 같습니다. 먼저 두 사람이 보입니다. 왼쪽에서는 한 남자가 캐비닛을 열고 무언가를 찾고 있습니다. 오른쪽에서는 한 여자가 큰 화분에 물을 주고 있습니다. 벽돌 벽과 나무 바닥도 보입니다. 배경에는 유리문이 보입니다. 그들은 바쁘게 일하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'The first thing I can see is some people.',
        'I think it\'s an office.',
        'First, I can see some people.',
        'On the left, / In the middle, / On the right, ~',
        'In the background, I can see ~',
        'It seems like they are busy working. / having a good time.',
      ],
    },
    5: {
      model: 'I cooked dinner at home yesterday. I prefer cooking by myself because it\'s easy and convenient.',
      ko: '저는 어제 집에서 저녁을 요리했습니다. 쉽고 편리해서 혼자 요리하는 것을 더 좋아합니다.',
      patterns: [
        'I cooked ~ yesterday. (질문을 I로 받기)',
        'I prefer cooking by myself because it\'s easy and convenient.',
      ],
    },
    6: {
      model: 'I would say my mother because she always cooks for me. So I want to make a special dinner for her.',
      ko: '저는 어머니를 고르겠습니다. 어머니가 항상 저를 위해 요리해 주시기 때문입니다. 그래서 어머니께 특별한 저녁을 만들어 드리고 싶습니다.',
      patterns: [
        'I would say + 답 + because ~',
        'so I want to ~',
      ],
    },
    7: {
      model: 'I would prefer a healthy meal. Here\'s why. First, healthy food is good for my health. Also, it makes me feel strong and happy, so I can work better. Easy meals are fast, but I don\'t want to eat unhealthy food every day. That\'s why I think so.',
      ko: '저는 건강한 음식을 더 선택하겠습니다. 이유는 이렇습니다. 첫째, 건강한 음식은 제 건강에 좋습니다. 또한 몸이 튼튼해지고 기분이 좋아져서 일을 더 잘할 수 있습니다. 쉬운 음식은 빠르지만, 저는 매일 건강에 나쁜 음식을 먹고 싶지 않습니다. 그래서 저는 그렇게 생각합니다.',
      patterns: [
        'I would prefer + 보기.',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'so I can ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'It will be held at the Westbridge Arts Center. The first talk is \'A Brief History of Photography\' by Maya Chen. It starts at 9 a.m. on April 14.',
      ko: '행사는 Westbridge Arts Center에서 열립니다. 첫 강연은 Maya Chen의 "A Brief History of Photography"입니다. 4월 14일 오전 9시에 시작합니다.',
      patterns: [
        'It will be held at + 장소.',
        'The first session is + 세션명 + by + 발표자.',
        'It starts at + 시각.',
      ],
    },
    9: {
      model: 'Actually, it lasts for two days, April 14 and April 15.',
      ko: '사실 행사는 이틀 동안 열립니다. 4월 14일과 15일입니다.',
      patterns: [
        'Actually, + 틀린 부분만 바로잡기.',
      ],
    },
    10: {
      model: 'Sure, there are two. First, at 11 a.m. on April 15, there is a workshop, Taking Better Portraits, by Emma Lewis. Second, at 3:30 p.m., there is a workshop, Editing Digital Photos, by Ryan Cooper.',
      ko: '네, 두 개 있습니다. 첫째, 4월 15일 오전 11시에 Emma Lewis의 워크숍 "Taking Better Portraits"가 있습니다. 둘째, 오후 3시 30분에 Ryan Cooper의 워크숍 "Editing Digital Photos"가 있습니다.',
      patterns: [
        'Sure. There are two.',
        'First, from ~ to ~, there is + 제목 + by + 발표자.',
        'First, at/from ~, there is + 제목 + by + 발표자.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I agree that companies should allow employees to listen to music while working. I will give reasons or examples to support my opinion. First, it will be good for the workers. As you know, work can be stressful. If workers listen to music, they can relax. Then they can work faster. As a result, it will be beneficial for the company. Second, music helps me focus. In my case, when I was in college, I always listened to music when I studied. It made me happy, and I could study longer. That\'s why I think companies should allow it.',
      ko: '저는 회사가 직원들에게 일하면서 음악을 듣도록 허용해야 한다는 데 동의합니다. 제 의견을 뒷받침할 이유와 예를 말씀드리겠습니다. 첫째, 직원들에게 좋습니다. 아시다시피 일은 스트레스가 될 수 있습니다. 직원들이 음악을 들으면 긴장을 풀 수 있습니다. 그러면 더 빨리 일할 수 있습니다. 결과적으로 회사에도 이로울 것입니다. 둘째, 음악은 제가 집중하는 데 도움이 됩니다. 제 경우에는 대학생 때 공부할 때 항상 음악을 들었습니다. 음악 덕분에 행복했고 더 오래 공부할 수 있었습니다. 그래서 저는 회사가 허용해야 한다고 생각합니다.',
      patterns: [
        'I agree that + 제시문. / No, I don\'t think + 제시문.',
        'I will give reasons or examples to support my opinion.',
        'First, it will be good for + 대상.',
        'As you know, ~',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Eventually, it will be beneficial.',
        'Then + 결과 한 번 더.',
        'As a result, it will be beneficial for ~',
        'Second, ~',
        'In my case, when I was in college, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
