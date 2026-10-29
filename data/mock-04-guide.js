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
      model: 'This picture shows a rainy day on a street lined with shops. In the center, a man in a yellow and black vest and a cap is holding a blue umbrella and a cardboard box while writing on the box. On the left, a man with glasses, a helmet, and a dark raincoat is sitting on a motorbike and holding a black umbrella. On the right, a man in a dark jacket and jeans is holding a navy umbrella and looking at his phone. The road is wet, and motorcycles are parked in front.',
      ko: '이 사진은 상점들이 늘어선 거리의 비 오는 날을 보여 줍니다. 가운데에는 노란색과 검은색 조끼를 입고 모자를 쓴 남자가 파란 우산과 종이 상자를 들고 상자 위에 무언가를 적고 있습니다. 왼쪽에는 안경을 쓰고 헬멧과 어두운 우비를 입은 남자가 오토바이에 앉아 검은 우산을 들고 있습니다. 오른쪽에는 어두운 재킷과 청바지를 입은 남자가 남색 우산을 들고 휴대전화를 보고 있습니다. 길은 젖어 있고, 앞쪽에는 오토바이들이 세워져 있습니다.',
      patterns: [
        'This picture shows + 장소/상황',
        'In the center, a man is holding ~ while ~ing',
        'On the left, ~ / On the right, ~',
        'The road is wet.',
      ],
    },
    4: {
      model: 'This picture shows a library. On the left, there are tall bookshelves full of books. A woman with long brown hair is wearing a green cardigan and a floral blouse. She is holding an open book and smiling. Beside her, a man in a denim jacket and a gray T-shirt is smiling and pointing at the book. A black camera hangs in front of him. On the right, there is a large window, and trees can be seen outside. There are also lights on the ceiling.',
      ko: '이 사진은 도서관을 보여 줍니다. 왼쪽에는 책이 가득 꽂힌 높은 책장들이 있습니다. 긴 갈색 머리의 여자가 초록색 카디건과 꽃무늬 블라우스를 입고 있습니다. 그녀는 펼친 책을 들고 웃고 있습니다. 옆에서 데님 재킷과 회색 티셔츠를 입은 남자가 웃으며 책을 가리키고 있습니다. 그의 몸 앞에는 검은 카메라가 걸려 있습니다. 오른쪽에는 큰 창문이 있고 밖에 나무가 보입니다. 천장에는 조명들도 있습니다.',
      patterns: [
        'This picture shows + 장소',
        'On the left, there are + 복수 명사',
        'A woman with long brown hair is wearing ~',
        'Beside her, a man is ~ing',
        'On the right, there is + 단수 명사',
      ],
    },
    5: {
      model: 'Yes, I really enjoy cooking outdoors because it feels relaxing and fun. I like getting fresh air while I prepare food, and everything seems to taste better outside. It is also a great way to spend time with my family or friends on a nice day.',
      ko: '네, 저는 야외에서 요리하는 것을 정말 좋아합니다. 편안하고 재미있기 때문입니다. 음식을 준비하면서 맑은 공기를 마실 수 있고, 밖에서는 모든 음식이 더 맛있게 느껴집니다. 좋은 날에 가족이나 친구들과 시간을 보내는 좋은 방법이기도 합니다.',
      patterns: [
        'Yes, I really enjoy ~ because ~',
        'I like getting fresh air while I ~',
        'It is also a great way to spend time with ~',
      ],
    },
    6: {
      model: 'The most delicious food I have cooked outdoors is grilled chicken with vegetables. I marinated the chicken in garlic and soy sauce, so it was juicy and flavorful. I last had it two weeks ago, when I cooked dinner in a park with some close friends.',
      ko: '제가 야외에서 요리해 본 것 중 가장 맛있는 음식은 채소를 곁들인 구운 닭고기입니다. 닭고기를 마늘과 간장에 재워 두어서 촉촉하고 맛이 좋았습니다. 마지막으로 먹은 것은 2주 전으로, 친한 친구들과 공원에서 저녁을 요리했을 때였습니다.',
      patterns: [
        'The most delicious food I have cooked outdoors is ~',
        'I marinated ~ in ~, so it was ~',
        'I last had it + 시간, when I ~',
      ],
    },
    7: {
      model: 'I think cooking indoors is easier because the kitchen has all the tools I need. The temperature is comfortable, and I do not have to worry about wind or rain. However, I still prefer cooking outdoors sometimes because the fresh air and casual atmosphere make the experience more enjoyable.',
      ko: '저는 실내에서 요리하는 것이 더 쉽다고 생각합니다. 부엌에는 필요한 도구가 모두 있기 때문입니다. 온도도 쾌적하고 바람이나 비를 걱정할 필요가 없습니다. 하지만 저는 가끔 야외에서 요리하는 것을 여전히 더 좋아합니다. 맑은 공기와 편안한 분위기가 경험을 더 즐겁게 만들어 주기 때문입니다.',
      patterns: [
        'I think + 선택지 + is easier because ~',
        'I do not have to worry about ~',
        'However, I still prefer ~ because ~',
      ],
    },
    8: {
      model: 'The Swimming Coaches Association\'s 25th annual conference will be held on Saturday, August 15. Registration begins at 8:00 A.M. and is scheduled to continue until 9:00 A.M.',
      ko: 'Swimming Coaches Association 제25회 연례 회의는 8월 15일 토요일에 열립니다. 등록은 오전 8시에 시작해서 오전 9시까지 이어질 예정입니다.',
      patterns: [
        'The conference will be held on + 날짜',
        'Registration begins at + 시간',
        'It is scheduled to continue until + 시간',
      ],
    },
    9: {
      model: 'No, the lunch with Henry Patton, the swim champion, has been canceled. It was scheduled from 12:00 P.M. to 1:00 P.M., so it will not take place.',
      ko: '아니요, 수영 챔피언 Henry Patton과의 점심은 취소되었습니다. 오후 12시부터 오후 1시까지 예정되어 있었지만 열리지 않습니다.',
      patterns: [
        'No, ~ has been canceled.',
        'It was scheduled from ~ to ~',
        'so it will not take place.',
      ],
    },
    10: {
      model: 'There are two sessions specifically for beginners. Laura Davis will present the discussion, Teaching Beginning Swimmers, from 1:00 P.M. to 3:00 P.M. Robert Miller will lead the workshop, Training Exercises for Beginners, from 4:00 P.M. to 6:00 P.M.',
      ko: '초보자를 위한 세션이 두 개 있습니다. Laura Davis가 오후 1시부터 3시까지 \'Teaching Beginning Swimmers\' 토론을 진행합니다. Robert Miller가 오후 4시부터 6시까지 \'Training Exercises for Beginners\' 워크숍을 진행합니다.',
      patterns: [
        'There are two sessions specifically for beginners.',
        'A will present ~ from ~ to ~',
        'B will lead the workshop, ~, from ~ to ~',
      ],
    },
    11: {
      model: 'No, I do not think most students can do their best work if they wait until right before the deadline. Good schoolwork usually takes time for planning, research, writing, and checking mistakes. Starting early also gives students a chance to ask questions when they do not understand something. If they wait too long, they may feel rushed and stressed, and they may overlook important details. Although some students can finish an assignment quickly, beginning earlier usually leads to clearer thinking and better results.',
      ko: '아니요, 저는 대부분의 학생들이 마감 직전까지 숙제를 미루면 최선의 결과를 낼 수 없다고 생각합니다. 좋은 숙제는 보통 계획, 조사, 작성, 오류 확인을 위한 시간이 필요합니다. 일찍 시작하면 이해가 안 되는 부분이 있을 때 질문할 기회도 생깁니다. 너무 늦게 시작하면 쫓기고 스트레스를 받아 중요한 세부 사항을 놓칠 수 있습니다. 물론 어떤 학생들은 과제를 빨리 끝낼 수 있지만, 일찍 시작하는 것이 보통 더 명확한 사고와 더 좋은 결과로 이어집니다.',
      patterns: [
        'I do not think + 주어 + can ~ if ~',
        'Good schoolwork usually takes time for ~',
        'Starting early also gives students a chance to ~',
        'Although ~, ~',
      ],
    },
  },
};
