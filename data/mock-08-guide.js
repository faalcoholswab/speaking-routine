/* 모의고사 8 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-08'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '웰컴 투 더 헤리티지 아트 뮤지엄 에브리원 아이드 라이크 투 리뷰 어 퓨 이센셜 가이드라인즈 플리즈 컨펌 댓 유어 헤비 코츠 라지 백팩스 앤 엄브렐러즈 아 세이플리 스토어드 인 더 라커스 미드웨이 쓰루 더 투어 컴플리멘터리 브로슈어즈 앤 포스트카드즈 윌 비 프로바이디드 투 올 비지터스 이프 유 리콰이어 에니 헬프 듀링 유어 비짓 플리즈 필 프리 투 어프로치 에니 오브 아워 뮤지엄 가이드즈',
    },
    2: {
      pron: '더 메인 토픽 오브 투데이스 브리핑 이즈 아워 프로포절 포 익스텐디드 위켄드 오퍼레이팅 아워즈 땡스 투 더 플래닝 팀 위 나우 해브 어 클리어러 언더스탠딩 오브 왓 커뮤니티 멤버스 익스펙트 프롬 어스 위 컬렉티드 디스 데이타 바이 컨덕팅 유저 인터뷰즈 리뷰잉 서제스천 박스즈 앤 애널라이징 퍼실리티 유시지 레이츠 마이 팀메이트 데이비드 밀러 윌 프리젠트 더 스퍼시픽 디테일즈',
    },
    3: {
      model: 'This picture was taken outside. I think it\'s an airport. The first thing I can see is two people. A man is lifting a black suitcase onto a luggage cart. He is wearing a white sweater and sunglasses and carrying a black backpack. A woman is holding a silver suitcase. She has blond hair and is wearing a striped sweater. A black car has the trunk open. In the background, I can see the departures area. It seems like they are going on a trip.',
      ko: '이 사진은 밖에서 찍혔습니다. 공항인 것 같습니다. 가장 먼저 보이는 것은 두 사람입니다. 한 남자가 검은 여행 가방을 카트 위에 올리고 있습니다. 그는 흰색 스웨터와 선글라스를 착용하고 검은 배낭을 메고 있습니다. 한 여자가 은색 여행 가방을 들고 있습니다. 그녀는 금발이고 줄무늬 스웨터를 입고 있습니다. 검은 차는 트렁크가 열려 있습니다. 배경에는 출발장 구역이 보입니다. 그들은 여행을 떠나는 것 같습니다.',
      patterns: [
        'This picture was taken outside. / inside.',
        'I think it\'s an airport.',
        'The first thing I can see is two people.',
        'He is wearing ~ and carrying ~.',
        'In the background, I can see ~',
      ],
    },
    4: {
      model: 'This picture was taken inside. I think it\'s a laboratory. The first thing I can see is two people. They are sitting at a desk and wearing white lab coats. On the left, a man in blue gloves is looking into a microscope. There are some test tubes on the desk. On the right, a woman is talking on the phone. I can see a computer screen with images. In the background, there are shelves with bottles. It seems like they are busy working.',
      ko: '이 사진은 실내에서 찍혔습니다. 실험실인 것 같습니다. 가장 먼저 보이는 것은 두 사람입니다. 그들은 책상에 앉아 흰색 실험 가운을 입고 있습니다. 왼쪽에서는 파란 장갑을 낀 남자가 현미경을 들여다보고 있습니다. 책상 위에는 시험관이 있습니다. 오른쪽에서는 한 여자가 전화 통화를 하고 있습니다. 이미지가 나온 컴퓨터 화면이 보입니다. 배경에는 병이 놓인 선반이 있습니다. 그들은 바쁘게 일하고 있는 것 같습니다.',
      patterns: [
        'This picture was taken inside. / outside.',
        'I think it\'s a laboratory.',
        'The first thing I can see is two people.',
        'On the left, / On the right, ~',
        'It seems like they are busy working.',
      ],
    },
    5: {
      model: 'The last time I took a train was last weekend, and I traveled with my sister. We had a great time.',
      ko: '마지막으로 기차를 탄 것은 지난 주말이었고, 동생과 함께 갔습니다. 정말 즐거웠습니다.',
      patterns: [
        'The last time was ~, and I traveled with ~.',
        'We had a great time.',
      ],
    },
    6: {
      model: 'I usually book my train tickets online because it\'s easy and convenient. I don\'t buy them at the station.',
      ko: '저는 보통 기차표를 온라인으로 예매합니다. 쉽고 편리하기 때문입니다. 역에서 사지 않습니다.',
      patterns: [
        'I usually ~ because it\'s easy and convenient.',
        'I don\'t ~ at the station.',
      ],
    },
    7: {
      model: 'I would say yes. It is a good idea to subscribe to online notifications about train delays. Here\'s why. First, if my train is late, I can know early and change my plan. Second, it\'s convenient, so I don\'t have to wait at the station. That\'s why I think so.',
      ko: '저는 그렇다고 말하겠습니다. 기차 지연에 대한 온라인 알림을 받는 것은 좋은 생각입니다. 이유는 이렇습니다. 첫째, 기차가 늦으면 미리 알고 계획을 바꿀 수 있습니다. 둘째, 편리해서 역에서 기다리지 않아도 됩니다. 그래서 저는 그렇게 생각합니다.',
      patterns: [
        'I would say yes. / I would say no.',
        'Here\'s why.',
        'First, if ~, I can ~. / Second, ~',
        'That\'s why I think so.',
      ],
    },
    8: {
      model: 'The interviews will be held at Conference Room B. The last interview ends at 12 p.m.',
      ko: '면접은 회의실 B에서 열립니다. 마지막 면접은 오후 12시에 끝납니다.',
      patterns: [
        'It will be held at ~.',
        'The last interview ends at ~.',
      ],
    },
    9: {
      model: 'Actually, the 10:30 interview with David Ross has been canceled. Sorry about that.',
      ko: '사실 David Ross의 10시 30분 면접은 취소되었습니다. 죄송합니다.',
      patterns: [
        'Actually, ~ has been canceled.',
        'Sorry about that.',
      ],
    },
    10: {
      model: 'Sure, there are two. First, from 9:00 to 9:30 a.m., there is Sarah Jenkins, a UX Designer from Tech Innovators. Second, from 11:00 to 11:30 a.m., there is Brian Miller, a Database Admin from Tech Innovators.',
      ko: '네, 두 명 있습니다. 첫째, 오전 9시부터 9시 30분까지 테크 이노베이터스 출신의 UX 디자이너 Sarah Jenkins가 있습니다. 둘째, 오전 11시부터 11시 30분까지 테크 이노베이터스 출신의 데이터베이스 관리자 Brian Miller가 있습니다.',
      patterns: [
        'Sure, there are two.',
        'First, from ~ to ~, there is + 이름.',
        'Second, ~ (첫째와 같은 틀)',
      ],
    },
    11: {
      model: 'I would rather take several short trips over the year. I will give some reasons or examples to support my opinion. First, short trips will be good for our minds. As you know, work can be very tiring. If we take a short trip a few times a year, we can relax before we get too tired. Then we can come back and focus better. As a result, it will be beneficial for our work. Second, several short trips are easier to plan. In my case, when I was in college, I waited all year for one long vacation. Later I took several short trips with my friends, and I felt fresh. That\'s why I think so.',
      ko: '저는 일 년 동안 짧은 여행을 여러 번 가는 쪽을 택하겠습니다. 제 의견을 뒷받침할 몇 가지 이유와 예를 말씀드리겠습니다. 첫째, 짧은 여행은 마음에 좋습니다. 아시다시피 일은 매우 지칠 수 있습니다. 일 년에 몇 번 짧게 떠나면 너무 지치기 전에 쉴 수 있습니다. 그러면 돌아와서 더 잘 집중할 수 있습니다. 결과적으로 일에도 이로울 것입니다. 둘째, 짧은 여행 여러 번은 계획을 세우기가 더 쉽습니다. 제 경우에는 대학생일 때 긴 휴가 한 번을 위해 일 년을 기다렸습니다. 나중에는 친구들과 짧은 여행을 여러 번 갔고, 기분이 새로워졌습니다. 그래서 그렇게 생각합니다.',
      patterns: [
        'I would rather ~ than ~.',
        'I will give some reasons or examples to support my opinion.',
        'First, ~ / If ~, we can ~. / Then ~ / As a result, ~',
        'In my case, when I was in college, ~',
        'That\'s why I think ~',
      ],
    },
  },
};
