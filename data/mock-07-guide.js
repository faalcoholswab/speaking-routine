/* 모의고사 7 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-07'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '스타팅 디스 오텀 오크우드 컬처럴 소사이어티 윌 호스트 먼슬리 렉처스 딜리버드 바이 페이머스 오써즈 키 띰즈 인클루드 인핸싱 라이팅 테크닉스 매니징 퍼서널 파이낸시즈 와이즐리 앤 프랙티싱 헬씨 라이프스타일 초이시즈 이프 유 아 인터레스티드 인 어텐딩 플리즈 사인 업 위드 더 볼런티어 앳 디 인포메이션 카운터',
    },
    2: {
      pron: '웰컴 투 디 오프닝 오브 더 뉴 리버사이드 피트니스 센터 위 아 딜라이티드 투 쇼케이스 아워 모던 퍼실리티즈 모스트 오브 위치 윌 오픈 얼리 넥스트 위크 멤버스 캔 테이크 어드밴티지 오브 컴플리멘터리 피트니스 어세스먼츠 스페이셔스 라커 룸스 앤 그룹 엑서사이즈 클래시즈 펄더모어 게스트스 캔 유즈 디 인도어 스위밍 풀 쓰루아웃 더 데이',
    },
    3: {
      model: 'This picture was taken outside. I think it\'s a walkway along a river. The first thing I can see is some people. On the left, a man is walking a dog on a leash. He is wearing a red hat and a dark coat. The dog is brown and white. On the right, a woman is wearing a white dress and carrying a white tote bag. There are green benches and trees. In the background, I can see some boats and tall buildings. It seems like they are having a good time.',
      ko: '이 사진은 밖에서 찍혔습니다. 강을 따라 난 산책로인 것 같습니다. 가장 먼저 보이는 것은 몇 사람입니다. 왼쪽에서는 한 남자가 목줄 맨 개를 산책시키고 있습니다. 그는 빨간 모자와 어두운 코트를 입고 있습니다. 개는 갈색과 흰색입니다. 오른쪽에서는 한 여자가 흰색 드레스를 입고 흰색 토트백을 들고 있습니다. 초록색 벤치와 나무들이 있습니다. 배경에는 배와 높은 건물들이 보입니다. 그들은 즐거운 시간을 보내고 있는 것 같습니다.',
      patterns: [
        'This picture was taken outside. / inside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s a walkway.',
        'The first thing I can see is some people.',
        'On the left, / On the right, ~',
        'In the background, I can see ~',
      ],
    },
    4: {
      model: 'This picture was taken outside. I think it\'s an outdoor market. The first thing I can see is some people. Many people are walking through the market. On the left, a woman is picking some fruit. She is wearing a black shirt and carrying a white tote bag. There are fruit and vegetable stands, price signs, and a wooden crate. A woman in a navy top is carrying a brown shoulder bag. On the right, I can see a bread stand. It seems like they are busy.',
      ko: '이 사진은 밖에서 찍혔습니다. 야외 시장인 것 같습니다. 가장 먼저 보이는 것은 몇 사람입니다. 많은 사람들이 시장을 걸어가고 있습니다. 왼쪽에서는 한 여자가 과일을 고르고 있습니다. 그녀는 검은 셔츠를 입고 흰색 토트백을 들고 있습니다. 과일과 채소 좌판, 가격표, 나무 상자가 있습니다. 남색 옷을 입은 한 여자가 갈색 어깨가방을 메고 있습니다. 오른쪽에는 빵 좌판이 보입니다. 그들은 바빠 보입니다.',
      patterns: [
        'This picture was taken outside. / inside.',
        'They are standing or sitting. / They are standing in line. / They are sitting at the table.',
        'She has long brown hair.',
        'In the foreground, / In the background, / In the middle, / On the left, / On the right, / Next to her, ~',
        'It seems like they are busy working.',
        'I think it\'s an outdoor market.',
        'The first thing I can see is some people.',
        'On the left, / On the right, ~',
        'It seems like they are busy.',
      ],
    },
    5: {
      model: 'I spend more time outside these days than when I was younger because it\'s relaxing. It helps me feel better.',
      ko: '저는 어릴 때보다 요즘 밖에서 더 많은 시간을 보냅니다. 마음이 놓이기 때문입니다. 기분이 좋아지는 데 도움이 됩니다.',
      patterns: [
        'I spend more time ~ because it\'s relaxing.',
        'It helps me ~',
      ],
    },
    6: {
      model: 'The name of the nearest park from my house is Oak Park, and I visit there twice a week because it\'s close.',
      ko: '집에서 가장 가까운 공원 이름은 오크 파크이고, 가깝기 때문에 일주일에 두 번 갑니다.',
      patterns: [
        'The name of the nearest ~ is ~.',
        'I visit there twice a week because it\'s close.',
      ],
    },
    7: {
      model: 'I would say relaxing in a local park. Here\'s why. First, it\'s relaxing and easy, so I can feel better outside. Second, it\'s convenient. I don\'t have much time, so I don\'t need a long trip. That\'s why I think relaxing in a local park is the best.',
      ko: '저는 동네 공원에서 쉬는 것이라고 말하겠습니다. 이유는 이렇습니다. 첫째, 편하고 마음이 놓여서 밖에서 기분이 좋아집니다. 둘째, 편리합니다. 시간이 많지 않아서 긴 여행이 필요 없습니다. 그래서 저는 동네 공원에서 쉬는 것이 가장 좋다고 생각합니다.',
      patterns: [
        'I would say + 고른 보기.',
        'Here\'s why.',
        'First, ~ / Second, ~',
        'I don\'t have much time, so ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'The park is open from 7 a.m. to 7 p.m. The entrance fee is 10 dollars.',
      ko: '공원은 오전 7시부터 오후 7시까지 엽니다. 입장료는 10달러입니다.',
      patterns: [
        'It is open from ~ to ~.',
        'The entrance fee is ~.',
      ],
    },
    9: {
      model: 'Actually, the Echo Canyon Route is 8.5 kilometers long, not 12 kilometers.',
      ko: '사실 에코 캐니언 루트는 12킬로미터가 아니라 8.5킬로미터입니다.',
      patterns: [
        'Actually, ~ is ~, not ~.',
        'It is ~ kilometers long, not ~.',
      ],
    },
    10: {
      model: 'Sure, there are two advanced routes. First, there is the Wildwood Route. It is 14 kilometers. Second, there is the Summit Route. It is 11.5 kilometers.',
      ko: '네, 상급 루트가 두 개 있습니다. 첫째, 와일드우드 루트가 있습니다. 14킬로미터입니다. 둘째, 서밋 루트가 있습니다. 11.5킬로미터입니다.',
      patterns: [
        'Sure, there are two.',
        'First, there is ~. It is ~.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I agree that practice can help you become a successful speaker. I will give some reasons or examples to support my opinion. First, practice will be good for our speaking. As you know, a successful speaker needs clear words and a calm voice. If we practice every day, we can speak more slowly and clearly. Then people can understand us better. As a result, it will be beneficial for school and work. Second, practice helped me a lot. In my case, when I was in college, I was very nervous about speaking in class. I practiced short talks every week with a friend. I made fewer mistakes, and I felt more confident. That\'s why I think so.',
      ko: '저는 연습이 성공적인 발표자가 되는 데 도움이 된다는 데 동의합니다. 제 의견을 뒷받침할 몇 가지 이유와 예를 말씀드리겠습니다. 첫째, 연습은 말하기에 좋습니다. 아시다시피 말을 잘하는 사람에게는 분명한 말과 차분한 목소리가 필요합니다. 매일 연습하면 더 천천히, 더 분명하게 말할 수 있습니다. 그러면 사람들이 우리를 더 잘 이해합니다. 결과적으로 학교와 일에도 이로울 것입니다. 둘째, 연습은 저에게 큰 도움이 되었습니다. 제 경우에는 대학생일 때 수업에서 말하는 것이 매우 긴장되었습니다. 매주 친구와 짧은 발표를 연습했습니다. 실수가 줄었고 더 자신감이 생겼습니다. 그래서 그렇게 생각합니다.',
      patterns: [
        'I agree that + 제시문.',
        'I will give some reasons or examples to support my opinion.',
        'First, ~ / If ~, we can ~. / Then ~ / As a result, ~',
        'If + 주어 + 동사, 주어 + can + 동사.',
        'Eventually, it will be beneficial.',
        'In my case, when I was in college, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
