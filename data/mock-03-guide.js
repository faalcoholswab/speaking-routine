/* 모의고사 3 — 해설 데이터 */
window.MOCK_GUIDES = window.MOCK_GUIDES || {};

window.MOCK_GUIDES['mock-03'] = {
  status: 'applied',
  questions: {
    1: {
      pron: '웰컴 투 오크데일 파크 아워 워킹 투어 이즈 어 그레이트 웨이 투 익스플로어 더 뷰티 오브 네이처 애즈 유 팔로우 더 트레일 페이 어텐션 투 더 사운즈 오브 네이처 어라운드 유 얼롱 더 웨이 유 캔 인조이 뷰티풀 트리스 와일드 애니멀스 앤 컬러풀 플라워스 플리즈 스테이 온 더 트레일 앤 테이크 유어 타임 인조잉 더 내추럴 서라운딩스',
    },
    2: {
      pron: '땡큐 포 어텐딩 투데이스 컨퍼런스 아임 히어 투데이 투 톡 어바웃 트래픽 컨제스천 인 아워 씨티 위 해브 플랜스 투 익스팬드 버스 서비시스 프로모트 카풀링 프로그램스 앤 인크리스 더 넘버 오브 바이크 레인스 디즈 체인지스 윌 헬프 리듀스 트래픽 컨제스천 앤 메이크 잇 이지어 포 피플 투 겟 어라운드 더 씨티',
    },
    3: {
      model: 'I think this picture was taken in a meeting room. Two women are sitting across a long table. On the left side of the picture, a woman in a yellow sweater is resting her chin on her hand and looking at the other woman. On the right side, a woman in a light blue shirt is holding a pen and talking. There is a monitor in the background, and a plate of cookies and a salad container are on the table. It seems like they are having a casual meeting.',
      ko: '이 사진은 회의실에서 찍힌 것으로 보입니다. 두 여자가 긴 테이블을 사이에 두고 앉아 있습니다. 사진 왼쪽에는 노란 스웨터를 입은 여자가 턱을 손에 괸 채 다른 여자를 보고 있습니다. 오른쪽에는 하늘색 셔츠를 입은 여자가 펜을 들고 이야기하고 있습니다. 배경에는 모니터가 있고, 테이블 위에는 쿠키 접시와 샐러드 용기가 있습니다. 그들은 편안한 회의를 하는 것 같습니다.',
      patterns: [
        'I think this picture was taken + 전치사 + 장소',
        'Two women are sitting across a long table.',
        'On the left side of the picture, ~ / On the right side, ~',
        'There is/are + 명사',
        'It seems like + 주어 + 동사',
      ],
    },
    4: {
      model: 'I think this picture was taken in a library. There are three people standing between tall bookshelves. On the left, a woman with a black tote bag is looking at the others. In the middle, a woman is holding a laptop. On the right, a man is holding a green folder. The shelves are full of books, and the floor is wooden. It seems like they are discussing a project.',
      ko: '이 사진은 도서관에서 찍힌 것으로 보입니다. 세 사람이 높은 책장 사이에 서 있습니다. 왼쪽에는 검은 토트백을 든 여자가 다른 사람들을 보고 있습니다. 가운데에는 여자가 노트북을 들고 있습니다. 오른쪽에는 남자가 초록색 폴더를 들고 있습니다. 책장은 책으로 가득 차 있고 바닥은 나무입니다. 그들은 프로젝트를 논의하는 것 같습니다.',
      patterns: [
        'I think this picture was taken + 전치사 + 장소',
        'There are + 인원 + standing between ~',
        'On the left, ~ / In the middle, ~ / On the right, ~',
        'It seems like + 주어 + 동사',
      ],
    },
    5: {
      model: 'I usually listen to music at night. After work, I feel stressed, so I listen to soft music before I go to bed. It helps me relax and sleep better. That is why I prefer listening at night.',
      ko: '저는 보통 밤에 음악을 듣습니다. 퇴근 후에는 스트레스를 받아서 자기 전에 잔잔한 음악을 듣습니다. 그것은 제가 긴장을 풀고 더 잘 자도록 도와줍니다. 그래서 저는 밤에 듣는 것을 선호합니다.',
      patterns: [
        'I usually ~ at night.',
        'After work, I feel stressed, so I ~',
        'It helps me relax.',
        'That is why I prefer ~',
      ],
    },
    6: {
      model: 'I prefer listening to music by myself. When I listen alone, I can focus on the music and enjoy it more. Also, I do not have to worry about other people\'s tastes. However, at parties, listening with others is more fun.',
      ko: '저는 혼자 음악을 듣는 것을 선호합니다. 혼자 들으면 음악에 집중할 수 있고 더 즐길 수 있습니다. 또한 다른 사람들의 취향을 걱정할 필요가 없습니다. 하지만 파티에서는 다른 사람들과 함께 듣는 것이 더 재미있습니다.',
      patterns: [
        'I prefer ~',
        'When I ~, I can focus better.',
        'I don\'t have to worry about ~',
        'However, ~',
      ],
    },
    7: {
      model: 'I think pop music is best for a party. Pop songs have strong beats, so people can dance easily. Also, most people already know the songs, so everyone can sing along. That is why I would choose pop music for a party.',
      ko: '저는 파티에는 팝 음악이 가장 좋다고 생각합니다. 팝 음악은 비트가 강해서 사람들이 쉽게 춤출 수 있습니다. 또한 대부분의 사람들이 그 노래를 이미 알아서 다 같이 따라 부를 수 있습니다. 그래서 파티에는 팝 음악을 선택하겠습니다.',
      patterns: [
        'I think + 선택지 + is best for ~',
        'Pop songs have strong beats, so ~',
        'Also, most people already know ~',
        'That is why I would choose ~',
      ],
    },
    8: {
      model: 'The first item on your schedule is "Review Weekly Sales Report," and it starts at 10:00 a.m. It lasts until 10:30, so you have thirty minutes to review the report before your next meeting.',
      ko: '일정의 첫 번째 항목은 "Review Weekly Sales Report"이고, 오전 10시에 시작합니다.',
      patterns: [
        'The first item on your schedule is ~',
        'It starts at + 시간',
      ],
    },
    9: {
      model: 'That meeting was scheduled from 4:00 to 5:00 p.m., but it has been moved to July 24. So it is not on your July 21 schedule.',
      ko: '그 회의는 오후 4시부터 5시로 예정되어 있었지만 7월 24일로 옮겨졌습니다. 그래서 7월 21일 일정에는 없습니다.',
      patterns: [
        'It was scheduled ~, but it has been moved to ~',
        'So it is not on your schedule.',
      ],
    },
    10: {
      model: 'There are two items related to customer feedback. First, from 1:00 to 2:00 p.m., you analyze customer feedback. Second, from 5:00 to 5:30 p.m., you have a meeting on customer feedback insights.',
      ko: '고객 피드백과 관련된 항목은 두 개입니다. 첫째, 오후 1시부터 2시까지 고객 피드백을 분석합니다. 둘째, 오후 5시부터 5시 30분까지 고객 피드백 인사이트 회의가 있습니다.',
      patterns: [
        'There are two items related to ~. First, ~. Second, ~.',
        'From + 시간 + to + 시간, you ~',
      ],
    },
    11: {
      model: 'I agree that it has become more difficult for parents to raise their children because of smartphones. Most of all, children spend too much time on their phones, so parents cannot control what they see. For example, my cousin\'s children watch videos for hours instead of studying. Of course, smartphones are useful for learning, but parents need to set limits. Therefore, I think it is harder to raise children today.',
      ko: '저는 스마트폰 때문에 부모가 아이를 키우기가 더 어려워졌다는 데 동의합니다. 무엇보다 아이들이 휴대폰에 너무 많은 시간을 써서 부모가 무엇을 보는지 통제할 수 없습니다. 예를 들어 사촌의 아이들은 공부 대신 몇 시간씩 영상을 봅니다. 물론 스마트폰은 학습에 유용하지만 부모가 한계를 정해야 합니다. 따라서 오늘날 아이를 키우는 것이 더 어렵다고 생각합니다.',
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
