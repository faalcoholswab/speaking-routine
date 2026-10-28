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
      model: 'I think this is a picture of a staff lounge in an office. There are three people in this picture. On the left side of the picture, a man is sitting on a sofa and talking to his coworkers. In the middle of the picture, another man is standing and holding a tablet while looking at the others. On the right side of the picture, a woman is holding a cup and listening to them. There is a laptop and a small plant on the table in front of them. In the background, I can see large windows. It seems like they are having a casual meeting.',
      ko: '이 사진은 사무실의 직원 휴게실로 보입니다. 이 사진에는 세 사람이 있습니다. 사진 왼쪽에는 남자가 소파에 앉아 동료들과 이야기하고 있습니다. 가운데에는 또 다른 남자가 서서 태블릿을 들고 다른 사람들을 보고 있습니다. 오른쪽에는 여자가 컵을 들고 그들의 말을 듣고 있습니다. 앞 테이블 위에는 노트북과 작은 화분이 있습니다. 배경에는 큰 창문이 보입니다. 그들은 편한 회의를 하고 있는 것 같습니다.',
      patterns: [
        'I think this is a picture of + 장소',
        'There are three people in this picture.',
        'On the left side of the picture, / In the middle of the picture, / On the right side of the picture,',
        'while -ing',
        'There is/are + 명사',
        'In the background, I can see + 명사',
        'It seems like + 주어 + 동사',
      ],
    },
    4: {
      model: 'I think this picture was taken in the hallway of an office. There are two people in this picture. On the left side of the picture, a man is opening a filing cabinet and looking for a document. On the right side of the picture, a woman is watering a large plant next to a brick wall. There is a wooden floor and a glass door at the end of the hall. It seems like they are busy with their daily tasks.',
      ko: '이 사진은 사무실 복도에서 찍힌 것으로 보입니다. 이 사진에는 두 사람이 있습니다. 사진 왼쪽에는 남자가 서류 캐비닛을 열고 서류를 찾고 있습니다. 오른쪽에는 여자가 벽돌 벽 옆에서 큰 화분에 물을 주고 있습니다. 복도 끝에는 나무 바닥과 유리문이 있습니다. 그들은 일상 업무로 바쁜 것 같습니다.',
      patterns: [
        'I think this picture was taken + 전치사 + 장소',
        'There are two people in this picture.',
        'On the left side of the picture, / On the right side of the picture,',
        'There is/are + 명사',
        'It seems like + 주어 + 동사',
      ],
    },
    5: {
      model: 'I cooked at home about two weeks ago. I made pasta with vegetables for dinner. I prefer cooking by myself because I feel more comfortable and I can focus better. Also, I do not have to waste time waiting for other people.',
      ko: '약 2주 전에 집에서 요리했습니다. 저녁으로 채소 파스타를 만들었습니다. 저는 더 편안하고 더 잘 집중할 수 있어서 혼자 요리하는 것을 선호합니다. 또한 다른 사람들을 기다리느라 시간을 낭비할 필요가 없습니다.',
      patterns: [
        'about two weeks ago (When 과거 경험)',
        'I feel more comfortable and I can focus better.',
        'I don\'t have to waste time waiting for other people.',
      ],
    },
    6: {
      model: 'If I could make a special dinner for someone, I would choose my mother. She always cooks for my family, so I want to say thank you to her. I think it is more fun to do things in a group, so we would cook and eat together. It makes me happy, and I can have a great experience with my family.',
      ko: '누군가를 위해 특별한 저녁을 만들 수 있다면 어머니를 선택하겠습니다. 어머니는 항상 우리 가족을 위해 요리하셔서 감사함을 전하고 싶습니다. 저는 같이 하는 것이 더 재미있다고 생각해서 함께 요리하고 먹을 것입니다. 그것은 저를 행복하게 하고 가족과 좋은 경험을 할 수 있게 합니다.',
      patterns: [
        'I think it\'s more fun to do things in a group.',
        'It makes me happy, and I can have a great experience.',
        'She always ~, so I want to ~',
      ],
    },
    7: {
      model: 'For me, how healthy the meal is matters more. Healthy food is very necessary for me because it is good for my health. Easy meals are faster and I can save time, but I do not want to eat unhealthy food every day. So I usually choose fresh ingredients even though cooking takes longer.',
      ko: '저에게는 음식이 얼마나 건강한지가 더 중요합니다. 건강한 음식은 제 건강에 좋기 때문에 저에게 매우 필요합니다. 간단한 음식은 더 빠르고 시간을 절약할 수 있지만, 매일 건강하지 않은 음식을 먹고 싶지는 않습니다. 그래서 요리에 시간이 더 걸리더라도 보통 신선한 재료를 고릅니다.',
      patterns: [
        'It\'s very necessary for me.',
        'It is good for my health.',
        'It\'s faster, so I can save time.',
        'even though ~',
      ],
    },
    8: {
      model: 'The Photography & Media Festival will be held on April 14 and 15 at the Westbridge Arts Center. The first event is a talk on "A Brief History of Photography" by Maya Chen at 9:00 a.m. on April 14.',
      ko: 'Photography & Media Festival은 4월 14일과 15일 Westbridge Arts Center에서 열립니다. 첫 행사는 4월 14일 오전 9시 Maya Chen의 "A Brief History of Photography" 강연입니다.',
      patterns: [
        'The + 프로그램 + will be held on + 날짜 + at + 장소',
        '진행자 will give a speech on + 주제 + at + 시간',
      ],
    },
    9: {
      model: 'I am sorry but there seems to be a misunderstanding. The festival lasts for two days, April 14 and April 15, not one day.',
      ko: '죄송하지만 오해가 있는 것 같습니다. 축제는 하루가 아니라 4월 14일과 15일, 이틀 동안 열립니다.',
      patterns: [
        'I\'m sorry but there seems to be a misunderstanding. + 올바른 정보',
      ],
    },
    10: {
      model: 'There are two scheduled workshops. First, Emma Lewis will lead a workshop on taking better portraits at 11:00 a.m. on April 15. Second, Ryan Cooper will lead a workshop on editing digital photos at 3:30 p.m. on April 15.',
      ko: '예정된 워크숍은 두 개입니다. 첫째, Emma Lewis가 4월 15일 오전 11시에 인물 사진 잘 찍는 법 워크숍을 진행합니다. 둘째, Ryan Cooper가 4월 15일 오후 3시 30분에 디지털 사진 편집 워크숍을 진행합니다.',
      patterns: [
        'There are two scheduled sessions. First, ~. Second, ~.',
        '진행자 will lead a workshop on + 주제 + at + 시간',
      ],
    },
    11: {
      model: 'I agree that companies should allow employees to listen to music while working. Most of all, employees can work more efficiently and productively because music relieves their stress and they can relax. It can also make a better work environment, so employees can be more satisfied with their jobs. Specifically, when I listen to music at work, I can focus better and I will not be distracted by others. Therefore, I think music at work is good for both employees and companies.',
      ko: '저는 회사가 직원들에게 업무 중 음악 청취를 허용해야 한다는 데 동의합니다. 무엇보다 음악이 스트레스를 풀어주고 쉬게 해주기 때문에 직원들이 더 효율적이고 생산적으로 일할 수 있습니다. 또한 더 나은 업무 환경을 만들어 직원들이 직장에 더 만족할 수 있습니다. 구체적으로, 업무 중 음악을 들으면 더 잘 집중할 수 있고 다른 사람들에게 방해받지 않습니다. 따라서 업무 중 음악은 직원과 회사 모두에게 좋다고 생각합니다.',
      patterns: [
        'I agree that + 제시문',
        'Employees can work more efficiently and productively.',
        'It relieves their stress and they can relax.',
        'It can make a better work environment.',
        'Employees can be more satisfied with their jobs.',
        'They can focus better. / They will not be distracted by others.',
        'Therefore, ~',
      ],
    },
  },
};
