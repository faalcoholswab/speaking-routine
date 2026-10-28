/* 모의고사 2 — 해설 데이터
   ※ Part 1은 발음 가이드 + 한글 발음 표기 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-02'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '웰컴 투 썬브룩 팜 비포어 유 스타트 더 투어 렛츠 고 오버 더 스케줄 윌 비긴 바이 익스플로링 더 그라운드 웨어 위 그로우 애플스 스트로베리스 앤 펌킨스 애프터 댓 윌 비짓 더 팜 애니멀스 더 투어 윌 엔드 앳 더 컨트리 마킷 위치 오퍼스 베리어스 로컬 프로덕츠 데어라 이즈 플렌티 투 씨 쏘 플리즈 팔로우 미',
    },
    2: {
      pron: '어코딩 투 어 리슨트 어나운스먼트 프롬 더 씨티 더 크레스트뷰 아트 인스티튜트 이즈 씨킹 데디케이티드 볼런티어스 더 뮤지엄 윌 오픈 어 뉴 스컬프처 가든 넥스트 오텀 앤 이스페셜리 니즈 피플 위드 날리지 오브 플랜팅 앤 케어링 포 트리스 플라워스 앤 아더 플랜츠 에니원 인터레스티드 슈드 비짓 더 인스티튜츠 오피셜 웹사이트 포 모어 디테일스',
    },
    3: {
      model: 'I think this picture was taken in a living room. On the right side of the picture, a man is sitting on a green couch and smiling. Next to him, a girl is sitting on the floor and playing with a small dog. On the left side of the picture, there is a wooden table with many wrapped presents on it. In the background, I can see large windows and a radiator. It seems like they are enjoying a quiet time at home.',
      ko: '이 사진은 거실에서 찍힌 것으로 보입니다. 사진 오른쪽에는 남자가 초록색 소파에 앉아 웃고 있습니다. 그의 옆에는 여자아이가 바닥에 앉아 작은 개와 놀고 있습니다. 사진 왼쪽에는 포장된 선물이 많이 놓인 나무 테이블이 있습니다. 배경에는 큰 창문과 라디에이터가 보입니다. 그들은 집에서 조용한 시간을 보내는 것 같습니다.',
      patterns: [
        'I think this picture was taken + 전치사 + 장소',
        'On the right side of the picture, ~',
        'Next to him, ~',
        'On the left side of the picture, there is ~',
        'In the background, I can see ~',
        'It seems like + 주어 + 동사',
      ],
    },
    4: {
      model: 'I think this picture was taken at a supermarket checkout. On the left side of the picture, a cashier in a blue vest is standing behind the counter and scanning items. On the right side, a woman in a hijab is holding a card, and a man in a blue beanie is putting a pineapple into a paper bag. There are many snacks on the conveyor belt, and a shopping cart is next to them. It seems like they are paying for their groceries.',
      ko: '이 사진은 슈퍼마켓 계산대에서 찍힌 것으로 보입니다. 사진 왼쪽에는 파란 조끼를 입은 계산원이 카운터 뒤에 서서 물건을 계산하고 있습니다. 오른쪽에는 히잡을 쓴 여자가 카드를 들고 있고, 파란 비니를 쓴 남자가 파인애플을 종이봉투에 담고 있습니다. 컨베이어 벨트 위에는 과자가 많이 있고, 옆에 쇼핑 카트가 있습니다. 그들은 장을 계산하는 것 같습니다.',
      patterns: [
        'I think this picture was taken + 전치사 + 장소',
        'On the left side of the picture, ~',
        'On the right side, ~',
        'There are + 명사',
        'It seems like + 주어 + 동사',
      ],
    },
    5: {
      model: 'Usually, I clean my home by myself on weekends. I live alone, so I do all the cleaning, such as vacuuming and doing the dishes. It takes about an hour, but I do not mind because it makes me feel refreshed. Sometimes I play music while I clean, so it is more fun.',
      ko: '보통 저는 주말에 혼자 집을 청소합니다. 혼자 살아서 청소기 돌리기, 설거지 같은 모든 청소를 제가 합니다. 한 시간 정도 걸리지만 기분이 상쾌해져서 괜찮습니다. 가끔 음악을 틀면서 청소해서 더 재미있습니다.',
      patterns: [
        'Usually, I ~',
        'I live alone, so I ~',
        'It takes about ~, but I do not mind because ~',
        'so it is more fun',
      ],
    },
    6: {
      model: 'I prefer cleaning alone. When I clean by myself, I feel more comfortable and I can focus better. Also, I do not have to waste time waiting for other people. However, when my family cleans together, we can finish the whole house much faster.',
      ko: '저는 혼자 청소하는 것을 선호합니다. 혼자 청소하면 더 편안하고 더 잘 집중할 수 있습니다. 또한 다른 사람을 기다리느라 시간을 낭비할 필요가 없습니다. 하지만 가족이 함께 청소하면 집 전체를 훨씬 빨리 끝낼 수 있습니다.',
      patterns: [
        'I prefer ~',
        'I feel more comfortable and I can focus better.',
        'I don\'t have to waste time waiting for other people.',
        'However, ~',
      ],
    },
    7: {
      model: 'I usually get information from online reviews. Before I buy a new cleaning product, I read reviews on shopping websites. It is more reliable, so the information is more trustworthy. I also ask my friends for recommendations when I need something specific.',
      ko: '저는 보통 온라인 후기에서 정보를 얻습니다. 새 청소용품을 사기 전에 쇼핑 사이트의 후기를 읽습니다. 더 믿을 만해서 정보가 더 신뢰가 갑니다. 특정한 것이 필요할 때는 친구들에게 추천도 물어봅니다.',
      patterns: [
        'I usually get information from ~',
        'Before I buy ~, I ~',
        'It\'s more reliable, so the information is more trustworthy.',
        'I also ~ when ~',
      ],
    },
    8: {
      model: 'The Future Green Tech Expo will be held on Saturday, May 24 at Digital Innovation Park. The first session starts at 10:00 a.m., and it is a Live AI Ambient Sound Performance at the Cyber Stage.',
      ko: 'Future Green Tech Expo는 5월 24일 토요일 Digital Innovation Park에서 열립니다. 첫 세션은 오전 10시에 시작하고, Cyber Stage에서 열리는 Live AI Ambient Sound Performance입니다.',
      patterns: [
        'The + 프로그램 + will be held on + 날짜 + at + 장소',
        'The first session starts at + 시간',
      ],
    },
    9: {
      model: 'You do not need to take a taxi. A shuttle bus runs between Central Station and the Festival Site, so you can take the shuttle bus from the station.',
      ko: '택시를 탈 필요가 없습니다. 셔틀버스가 Central Station과 Festival Site 사이를 운행하므로 역에서 셔틀버스를 타시면 됩니다.',
      patterns: [
        'You do not need to ~',
        'A shuttle bus runs between A and B, so you can ~',
      ],
    },
    10: {
      model: 'There are two scheduled seminars. First, the Seminar on Eco Smart Home Tech is from 10:30 to 11:30 a.m. at the Tech Pavilion. Second, the Seminar on Smart Space Design Tips is from 1:30 to 2:30 p.m. at the Glass Lab.',
      ko: '예정된 세미나는 두 개입니다. 첫째, Eco Smart Home Tech 세미나는 오전 10시 30분부터 11시 30분까지 Tech Pavilion에서 열립니다. 둘째, Smart Space Design Tips 세미나는 오후 1시 30분부터 2시 30분까지 Glass Lab에서 열립니다.',
      patterns: [
        'There are two scheduled sessions. First, ~. Second, ~.',
        'A seminar on + 주제 + is from + 시간 + at + 장소',
      ],
    },
    11: {
      model: 'I agree that hard work and practice are more important than natural talent for becoming a good cook. Most of all, cooking is a skill, so anyone can improve by practicing every day. For example, I used to burn food, but after practicing for a year, I can cook for my family. Of course, natural talent helps, but without practice it does not last. Therefore, I believe effort matters more.',
      ko: '저는 좋은 요리사가 되는 데 노력과 연습이 타고난 재능보다 더 중요하다는 데 동의합니다. 무엇보다 요리는 기술이라서 매일 연습하면 누구나 발전할 수 있습니다. 예를 들어 저는 예전에 음식을 태웠지만 1년 연습한 후에는 가족을 위해 요리할 수 있습니다. 물론 타고난 재능도 도움이 되지만 연습이 없으면 오래가지 않습니다. 따라서 노력이 더 중요하다고 생각합니다.',
      patterns: [
        'I agree that + 제시문',
        'Most of all, ~',
        'For example, ~',
        'Of course, ~',
        'Therefore, ~',
      ],
    },
  },
};
