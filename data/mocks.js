/* =========================================================
   모의고사 목록 (MOCK_MANIFEST)
   - 배열 순서가 곧 모의고사 화면의 카드 순서입니다.
   - 새 시험은 여기에 한 항목을 더하고 `node tools/sync-mocks.mjs` 를 실행하세요.
     (mock.html 스크립트 태그와 sw.js SHELL 이 그 파일에서 자동으로 채워집니다.)
   - 항목: { id, data, guide?, samples?, tag?, images: [] }
       id      카드/데이터 식별자. data 파일 안 시험의 id 와 같아야 합니다.
       data    시험 데이터 스크립트 경로
       guide   해설 스크립트 경로 (선택)
       samples 등급별 샘플 답변 스크립트 경로 (선택)
       tag     카드 번호 자리에 표시할 배지 글자. 없으면 1부터 차례대로 번호를 씁니다.
       images  Part 2 사진·Part 4 표 이미지 경로 (SHELL 캐시용)
   ========================================================= */
window.MOCK_MANIFEST = [
  {
    id: 'mock-01',
    data: 'data/mock-01.js',
    guide: 'data/mock-01-guide.js',
    images: [
      'assets/mock/mock-01/p2-q3.webp',
      'assets/mock/mock-01/p2-q4.webp',
      'assets/mock/mock-01/p4-table.webp',
    ],
  },
  {
    id: 'mock-02',
    data: 'data/mock-02.js',
    guide: 'data/mock-02-guide.js',
    images: [
      'assets/mock/mock-02/p2-q3.webp',
      'assets/mock/mock-02/p2-q4.webp',
      'assets/mock/mock-02/p4-table.webp',
    ],
  },
  {
    id: 'mock-03',
    data: 'data/mock-03.js',
    guide: 'data/mock-03-guide.js',
    images: [
      'assets/mock/mock-03/p2-q3.webp',
      'assets/mock/mock-03/p2-q4.webp',
      'assets/mock/mock-03/p4-table.webp',
    ],
  },
  {
    id: 'mock-04',
    data: 'data/mock-04.js',
    guide: 'data/mock-04-guide.js',
    images: [
      'assets/mock/mock-04/p2-q3.webp',
      'assets/mock/mock-04/p2-q4.webp',
      'assets/mock/mock-04/p4-table.webp',
    ],
  },
  {
    id: 'mock-05',
    data: 'data/mock-05.js',
    samples: 'data/mock-05-samples.js',
    tag: '기출',
    images: [
      'assets/mock/mock-05/p2-q3.webp',
      'assets/mock/mock-05/p2-q4.webp',
      'assets/mock/mock-05/p4-table.webp',
    ],
  },
];
