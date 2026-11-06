/* =========================================================
   모의고사 — 여러 파일이 함께 쓰는 작은 공용 값
   (js/mock.js 를 여러 파일로 나눌 때 첫 번째로 불러옵니다)
   ========================================================= */
(() => {
  'use strict';

  // HTML 문자열에 넣을 값은 항상 이 함수로 이스케이프합니다.
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (ch) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]
  ));

  const KIND_LABEL = {
    1: '지문 읽기',
    2: '그림 묘사',
    3: '인터뷰',
    4: '정보 활용',
    5: '의견 말하기',
  };

  const SILENT_FEEDBACK = '말소리가 감지되지 않았어요. 마이크를 확인해 주세요';
  const PART_GUIDANCE = {
    1: '다 읽고 시간이 남으면 다시 읽지 말고 기다려요. 잘못 읽은 부분만 살짝 고치고 이어 가도 돼요.',
    2: '준비 45초·응답 30초예요. 짧은 8~10문장을 연습하되, 한 명만 자세히 묘사해도 돼요. 두 문항에 같은 틀을 써도 되고, 끝에 3초가 남거나 마지막 문장이 잘리는 것 자체는 감점 사유가 아니에요.',
  };

  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  // 시험 시간을 그대로 두는 것이 기본. 로컬(사설망)에서만 ?speed= 로 배속 검증한다.
  const LOCAL_ENV = /^(localhost|127\.0\.0\.1|\[::1\]|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})$/;
  const SPEED = LOCAL_ENV.test(location.hostname)
    ? Math.max(1, Math.min(60, Number(new URLSearchParams(location.search).get('speed')) || 1))
    : 1;

  window.MockCommon = Object.freeze({ esc, KIND_LABEL, SILENT_FEEDBACK, PART_GUIDANCE, synth, LOCAL_ENV, SPEED });
})();
