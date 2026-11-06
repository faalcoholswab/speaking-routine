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
      model: 'This picture was taken inside. I think it\'s a living room. The first thing I can see is a man and a girl. On the right, the man is sitting on a green sofa and smiling. The girl is sitting on the floor and playing with a small dog. On the left, there is a table with many presents on it. I can also see a wooden floor. In the background, I can see large windows. It seems like they are having a good time.',
      ko: '이 사진은 실내에서 찍혔습니다. 거실인 것 같습니다. 가장 먼저 보이는 것은 남자와 여자아이입니다. 오른쪽에서는 남자가 초록색 소파에 앉아 웃고 있습니다. 여자아이는 바닥에 앉아 작은 개와 놀고 있습니다. 왼쪽에는 선물이 많이 놓인 테이블이 있습니다. 나무 바닥도 보입니다. 배경에는 큰 창문들이 보입니다. 그들은 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s a living room.',
        'The first thing I can see is some people.',
        'On the left, / In the middle, / On the right, ~',
        'In the background, I can see ~',
        'It seems like they are having a good time.',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s a supermarket. First, I can see three people. On the left, a man is working. He is wearing a blue vest. In the middle, a woman is holding a card. On the right, a man is putting a pineapple in a bag. He is wearing a blue hat. There are many snacks on the counter. It seems like they are paying for food.',
      ko: '이 사진은 실내에서 찍혔습니다. 슈퍼마켓인 것 같습니다. 먼저 세 사람이 보입니다. 왼쪽에서는 한 남자가 일하고 있습니다. 그는 파란색 조끼를 입고 있습니다. 가운데에서는 한 여자가 카드를 들고 있습니다. 오른쪽에서는 한 남자가 파인애플을 봉투에 넣고 있습니다. 그는 파란색 모자를 쓰고 있습니다. 계산대 위에는 과자가 많이 있습니다. 그들은 음식값을 내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'The first thing I can see is some people.',
        'It seems like they are busy working.',
        'I think it\'s a supermarket.',
        'First, I can see some people.',
        'On the left, / In the middle, / On the right, ~',
        'He is wearing a blue vest. (색 + 옷)',
        'It seems like they are paying for food.',
      ],
    },
    5: {
      model: 'I usually clean my home. I clean it alone because I live alone.',
      ko: '저는 보통 제 집을 청소합니다. 혼자 살아서 혼자 청소합니다.',
      patterns: [
        'I usually + 질문 동사 (질문을 I로 받기)',
        'I ~ alone because I live alone.',
      ],
    },
    6: {
      model: 'I prefer cleaning alone because it\'s fast. I can do it in my own way.',
      ko: '저는 혼자 청소하는 것을 더 좋아합니다. 빠르기 때문입니다. 제 방식대로 할 수 있습니다.',
      patterns: [
        'I prefer ~ because it\'s fast.',
        'I can ~ (결과 한 줄 더)',
      ],
    },
    7: {
      model: 'I would say online reviews. Here\'s why. First, they are easy to find, so I can save time. Second, other people tell the truth, so I can trust them. Ads are not always honest, but reviews are real. That\'s why I always check online reviews before I buy cleaning products.',
      ko: '저는 온라인 후기라고 말하겠습니다. 이유는 이렇습니다. 첫째, 찾기 쉬워서 시간을 아낄 수 있습니다. 둘째, 다른 사람들이 사실대로 말해 주어서 믿을 수 있습니다. 광고는 항상 솔직하지는 않지만 후기는 진짜입니다. 그래서 저는 청소용품을 사기 전에 항상 온라인 후기를 확인합니다.',
      patterns: [
        'I would say + 답 + because ~',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'so I can ~',
        'That\'s why I ~',
      ],
    },
    8: {
      model: 'It will be held on Saturday, May 24 at Digital Innovation Park. The first session starts at 10 a.m. It\'s a Live AI Ambient Sound Performance at the Cyber Stage.',
      ko: '행사는 5월 24일 토요일 Digital Innovation Park에서 열립니다. 첫 세션은 오전 10시에 시작합니다. Cyber Stage에서 하는 Live AI Ambient Sound Performance입니다.',
      patterns: [
        'It will be held on + 날짜 + at + 장소.',
        'It starts at + 시각.',
        'It\'s + 값. (전치사 없이 표의 값만)',
      ],
    },
    9: {
      model: 'You don\'t need a taxi. You can take the shuttle bus. It runs between Central Station and the Festival Site.',
      ko: '택시는 필요 없습니다. 셔틀버스를 타시면 됩니다. Central Station과 Festival Site 사이를 운행합니다.',
      patterns: [
        'It\'s + 값. (표 아래 안내문의 값을 그대로)',
        'You can take ~',
      ],
    },
    10: {
      model: 'Sure, there are two. First, from 10:30 to 11:30 a.m., there is a seminar, Eco Smart Home Tech, at the Tech Pavilion. Second, from 1:30 to 2:30 p.m., there is a seminar, Smart Space Design Tips, at the Glass Lab.',
      ko: '네, 두 개 있습니다. 첫째, 오전 10시 30분부터 11시 30분까지 Tech Pavilion에서 "Eco Smart Home Tech" 세미나가 있습니다. 둘째, 오후 1시 30분부터 2시 30분까지 Glass Lab에서 "Smart Space Design Tips" 세미나가 있습니다.',
      patterns: [
        'Sure, there are two.',
        'First, from ~ to ~, there is + 제목 + at + 장소.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I agree that hard work and practice are more important than natural talent for becoming a good cook. I will give reasons or examples to support my opinion. First, anyone can learn to cook. As you know, cooking is a skill. If people practice every day, they can get better. Then they can cook delicious food. As a result, they can make their family happy. Second, I am a good example. In my case, I burned food a lot at first. But I practiced for one year, and now I can cook for my family. That\'s why I think practice is more important.',
      ko: '저는 좋은 요리사가 되는 데 노력과 연습이 타고난 재능보다 더 중요하다는 데 동의합니다. 제 의견을 뒷받침할 이유와 예를 말씀드리겠습니다. 첫째, 누구나 요리를 배울 수 있습니다. 아시다시피 요리는 기술입니다. 매일 연습하면 더 나아질 수 있습니다. 그러면 맛있는 음식을 만들 수 있습니다. 결과적으로 가족을 행복하게 해 줄 수 있습니다. 둘째, 제가 좋은 예입니다. 제 경우에는 처음에 음식을 자주 태웠습니다. 하지만 1년 동안 연습했고, 이제 가족을 위해 요리할 수 있습니다. 그래서 저는 연습이 더 중요하다고 생각합니다.',
      patterns: [
        'I agree that + 제시문. / No, I don\'t think + 제시문.',
        'I will give reasons or examples to support my opinion.',
        'First, ~ ',
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
