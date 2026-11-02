window.SENTENCES = window.SENTENCES || {};
// 표의 값만 바꿔 끼우는 답변 틀입니다. 8번은 장소·시간, 9번은 Actually로 정정, 10번은 표 순서대로 읽어요.
window.SENTENCES.part4 = [
  { id: "p4-001", topic: "장소·시간", en: "It will be held at the City Convention Center on October 10th.", ko: "10월 10일에 시티 컨벤션 센터에서 열립니다.", pron: "이릴 비 헬드 앳더 시티 컨벤션 센터 온 악토버 텐쓰", keys: [ { en: "It will be held at + 장소", ko: "~에서 열립니다" }, { en: "on + 날짜", ko: "~일에" } ] },
  { id: "p4-002", topic: "장소·시간", en: "It will be held at the Grand Hotel on May 3rd.", ko: "5월 3일에 그랜드 호텔에서 열립니다.", pron: "이릴 비 헬드 앳더 그랜드 호텔 온 메이 써드", keys: [ { en: "be held at", ko: "~에서 열리다 (take place를 물어도 같은 답)" } ] },
  { id: "p4-003", topic: "장소·시간", en: "The first session is registration and breakfast from 8 to 9 a.m.", ko: "첫 번째 세션은 오전 8시부터 9시까지 하는 등록과 아침 식사입니다.", pron: "더 퍼스트 세션 이즈 레지스트레이션 앤 브렉퍼스트 프롬 에잇 투 나인 에이엠", keys: [ { en: "The first session is", ko: "첫 번째 세션은 ~입니다" }, { en: "from 8 to 9 a.m.", ko: "오전 8시부터 9시까지 (a.m.은 빠뜨려도 괜찮아요)" } ] },
  { id: "p4-004", topic: "장소·시간", en: "It starts at 9 a.m.", ko: "오전 9시에 시작합니다.", pron: "잇 스타츠 앳 나인 에이엠", keys: [ { en: "It starts at + 시각", ko: "~시에 시작합니다 (시작 시각만 있을 때 at)" } ] },
  { id: "p4-005", topic: "장소·시간", en: "It's at Conference Room B on October 21st.", ko: "10월 21일에 B 회의실에서 합니다.", pron: "잇츠 앳 컨퍼런스 룸 비 온 악토버 트웬티퍼스트", keys: [ { en: "It's at + 장소", ko: "~에서 합니다" } ] },
  { id: "p4-006", topic: "장소·시간", en: "It's 8 a.m.", ko: "오전 8시입니다.", pron: "잇츠 에잇 에이엠", keys: [ { en: "It's + 값", ko: "표의 값만 말하는 답 (전치사 없이, 답이 여럿이면 모두)" } ] },
  { id: "p4-007", topic: "정정", en: "Actually, it has been canceled.", ko: "사실 그것은 취소되었습니다.", pron: "액추얼리 잇 해즈 빈 캔슬드", keys: [ { en: "Actually,", ko: "사실은 (No 없이 바로 바로잡아요)" }, { en: "has been canceled", ko: "취소되었다" } ] },
  { id: "p4-008", topic: "정정", en: "Actually, the lunch meeting has been canceled.", ko: "사실 점심 회의는 취소되었습니다.", pron: "액추얼리 더 런치 미팅 해즈 빈 캔슬드", keys: [ { en: "lunch meeting", ko: "점심 회의" } ] },
  { id: "p4-009", topic: "정정", en: "Actually, the interview at 11 a.m. has been canceled.", ko: "사실 오전 11시 면접은 취소되었습니다.", pron: "액추얼리 디 인터뷰 앳 일레븐 에이엠 해즈 빈 캔슬드", keys: [ { en: "the interview at 11 a.m.", ko: "오전 11시 면접" } ] },
  { id: "p4-010", topic: "정정", en: "Actually, the registration fee is 60 dollars for members.", ko: "사실 등록비는 회원의 경우 60달러입니다.", pron: "액추얼리 더 레지스트레이션 피 이즈 식스티 달러즈 포 멤버즈", keys: [ { en: "registration fee", ko: "등록비" }, { en: "for members", ko: "회원은" } ] },
  { id: "p4-011", topic: "정정", en: "The registration fee is 30 dollars for nonmembers and 20 dollars for members.", ko: "등록비는 비회원 30달러, 회원 20달러입니다.", pron: "더 레지스트레이션 피 이즈 써티 달러즈 포 넌멤버즈 앤 트웬티 달러즈 포 멤버즈", keys: [ { en: "for nonmembers", ko: "비회원은 (헷갈리면 두 값을 다 읽어요)" } ] },
  { id: "p4-012", topic: "응대", en: "Don't worry about that.", ko: "그건 걱정하지 않으셔도 됩니다.", pron: "돈 워리 어바웃 댓", keys: [ { en: "Don't worry about that.", ko: "좋은 소식을 전할 때" } ] },
  { id: "p4-013", topic: "응대", en: "Sorry about that.", ko: "그 점은 죄송합니다.", pron: "쏘리 어바웃 댓", keys: [ { en: "Sorry about that.", ko: "나쁜 소식을 전할 때" } ] },
  { id: "p4-014", topic: "목록 안내", en: "Sure. Let me check.", ko: "네, 확인해 볼게요.", pron: "슈어 렛미 첵", keys: [ { en: "Let me check.", ko: "확인해 볼게요 (질문을 놓쳤을 때)" } ] },
  { id: "p4-015", topic: "목록 안내", en: "Sure, there are two.", ko: "네, 두 개 있습니다.", pron: "슈어 데어라 투", keys: [ { en: "there are two", ko: "두 개 있습니다 (뒤에 session은 붙이지 않아요)" } ] },
  { id: "p4-016", topic: "목록 안내", en: "First, from 10 to 11, there is a workshop on time management by Sarah Kim.", ko: "첫째, 10시부터 11시까지 Sarah Kim의 시간 관리 워크숍이 있습니다.", pron: "퍼스트 프롬 텐 투 일레븐 데어리즈 어 웍샵 온 타임 매니지먼트 바이 새라 킴", keys: [ { en: "First, from A to B, there is", ko: "첫째, A부터 B까지 ~이 있습니다 (표 순서대로)" }, { en: "by + 발표자", ko: "~가 진행하는" } ] },
  { id: "p4-017", topic: "목록 안내", en: "Second, from 2 to 3, there is a lecture on online marketing by David Lee.", ko: "둘째, 2시부터 3시까지 David Lee의 온라인 마케팅 강연이 있습니다.", pron: "세컨드 프롬 투 투 쓰리 데어리즈 어 렉쳐 온 온라인 마케팅 바이 데이비드 리", keys: [ { en: "Second,", ko: "둘째 (첫째와 같은 틀)" } ] },
  { id: "p4-018", topic: "목록 안내", en: "First, at 9:30 a.m., there is Emma Brown for the sales manager position.", ko: "첫째, 오전 9시 30분에 영업 관리자 자리에 지원한 Emma Brown이 있습니다.", pron: "퍼스트 앳 나인써티 에이엠 데어리즈 엠마 브라운 포 더 세일즈 매니저 퍼지션", keys: [ { en: "for the ~ position", ko: "~ 자리에 지원한" } ] },
  { id: "p4-019", topic: "목록 안내", en: "That's it. Thank you.", ko: "이상입니다. 감사합니다.", pron: "댓츠 잇 땡큐", keys: [ { en: "That's it.", ko: "이상입니다 (넣지 않아도 돼요)" } ] },
  { id: "p4-020", topic: "목록 안내", en: "That will be all. Thank you.", ko: "이게 전부입니다. 감사합니다.", pron: "댓 윌 비 올 땡큐", keys: [ { en: "That will be all.", ko: "이게 전부입니다" } ] },
];
