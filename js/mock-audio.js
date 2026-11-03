/* 모의고사 — 효과음·음성 읽기 */
(() => {
  'use strict';

  const { synth, SPEED } = window.MockCommon;

  let audioCtx = null;
  let beepSleepTimer = 0;
  let examVoices = { narrator: null, interviewer: null };
  // 자동 목소리는 안내·문제가 바뀔 때마다 새로 고른다. 같은 문제 안에서는 같은 목소리로 읽는다.
  let voiceKey = '';
  let skipResolve = null;

  // ---------- 소리 ----------
  // 시험장 효과음처럼 또렷한 단음. go: 준비·응답 시작, end: 응답·시험 끝.
  const BEEPS = {
    go: { freq: 1000, seconds: 0.45, level: 0.4 },
    end: { freq: 760, seconds: 0.7, level: 0.35 },
  };
  let audioUnlocked = false;
  // 마지막으로 소리가 난 때. 한동안 조용했다가 말을 시작하면 iPad(특히 블루투스 이어폰)가 앞부분을 잘라 먹는다.
  let lastSoundAt = 0;
  const WAKE_AFTER_MS = 1500;
  const WAKE_LEAD_MS = 350;
  // stopSpeech 가 부를 때마다 늘린다. 출력을 깨우는 동안 멈추거나 넘어가면 그 말은 읽지 않는다.
  let speechEpoch = 0;

  function audio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    return audioCtx;
  }

  // 계속 켜 두면 다른 앱 소리를 들은 뒤 iPad에서 지직거릴 수 있어, 울린 뒤에는 장치를 쉬게 한다.
  function sleepAudioSoon() {
    window.clearTimeout(beepSleepTimer);
    beepSleepTimer = window.setTimeout(() => {
      if (audioCtx && audioCtx.state === 'running') audioCtx.suspend().catch(() => {});
    }, 1200);
  }

  // iPad Safari는 화면을 누른 순간에 한 번 소리 장치를 열어 둬야, 질문이 끝난 뒤처럼
  // 화면을 누르지 않은 때에도 삐 소리를 낼 수 있다. 첫 터치에서 소리 없는 아주 짧은 소리를 튼다.
  function unlockAudio() {
    if (audioUnlocked) return;
    const ctx = audio();
    if (!ctx) return;
    audioUnlocked = true;
    try {
      if (ctx.state !== 'running') ctx.resume().catch(() => {});
      const source = ctx.createBufferSource();
      source.buffer = ctx.createBuffer(1, 1, 22050);
      source.connect(ctx.destination);
      source.start(0);
    } catch (error) { /* noop */ }
    // 음성 읽기도 화면을 누른 순간에 한 번 열어 둔다. 말을 시작하기 전에 출력을 깨우느라 잠깐 기다려도 막히지 않게.
    try {
      if (synth && !synth.speaking && !synth.pending) synth.speak(new window.SpeechSynthesisUtterance(''));
    } catch (error) { /* noop */ }
    sleepAudioSoon();
  }

  async function beep(kind) {
    const ctx = audio();
    if (!ctx) return;
    const tone = BEEPS[kind] || BEEPS.go;
    try {
      // 쉬고 있던 장치는 완전히 깨어난 뒤에 울린다. 깨우지 못하면 조용히 넘어간다.
      if (ctx.state !== 'running') await ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      const end = now + tone.seconds;
      osc.type = 'sine';
      osc.frequency.value = tone.freq;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(tone.level, now + 0.012);
      gain.gain.setValueAtTime(tone.level, end - 0.04);
      gain.gain.linearRampToValueAtTime(0, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(end + 0.02);
      lastSoundAt = Date.now() + tone.seconds * 1000;
    } catch (error) { /* noop */ }
    sleepAudioSoon();
  }

  // 한동안 소리가 없었다면 소리 없는 짧은 소리로 출력을 깨우고 잠깐 기다린다.
  async function wakeOutput() {
    if (Date.now() - lastSoundAt < WAKE_AFTER_MS) return;
    const ctx = audio();
    if (ctx) {
      try {
        if (ctx.state !== 'running') await ctx.resume();
        const source = ctx.createBufferSource();
        source.buffer = ctx.createBuffer(1, Math.round(ctx.sampleRate * ((WAKE_LEAD_MS + 150) / 1000)), ctx.sampleRate);
        source.connect(ctx.destination);
        source.start(0);
      } catch (error) { /* noop */ }
    }
    await new Promise((resolve) => window.setTimeout(resolve, WAKE_LEAD_MS));
    sleepAudioSoon();
  }

  function voicesFor(key) {
    if (!window.SpeechVoice || key === voiceKey) return;
    voiceKey = key;
    examVoices = window.SpeechVoice.examPair();
  }

  async function speak(text, role) {
    if (!synth || !text || SPEED > 1) return false;
    let speaking = false;
    try { speaking = Boolean(synth.speaking || synth.pending); } catch (error) { /* noop */ }
    if (!speaking) {
      const epoch = speechEpoch;
      await wakeOutput();
      if (epoch !== speechEpoch) return false;
    }
    return speakNow(text, role);
  }

  function speakNow(text, role) {
    return new Promise((resolve) => {
      let busy = false;
      try { busy = Boolean(synth.speaking || synth.pending); } catch (error) { /* noop */ }
      if (busy) {
        // iOS는 cancel 직후 speak를 버리는 경우가 있어 한 박자 쉰다.
        try { synth.cancel(); } catch (error) { /* noop */ }
      }

      const utter = new window.SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      // 설정의 기본 속도를 쓴다. 모의고사 안내·면접관 모두 같은 값.
      const spokenRate = window.SpeechVoice && typeof window.SpeechVoice.rate === 'function'
        ? window.SpeechVoice.rate()
        : 1;
      utter.rate = Math.min(2, Math.max(0.5, Number(spokenRate) || 1));
      utter.pitch = 1;
      const voice = role === 'interviewer' ? examVoices.interviewer : examVoices.narrator;
      if (voice) window.SpeechVoice.use(utter, voice);

      const words = String(text).trim().split(/\s+/).length;
      const limit = (words / (150 * utter.rate)) * 60000 + 3500;
      let done = false;
      let started = false;
      let timer = 0;

      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        lastSoundAt = Date.now();
        resolve(started);
      };

      utter.onstart = () => { started = true; };
      utter.onend = finish;
      utter.onerror = finish;
      timer = window.setTimeout(finish, limit);

      try {
        if (busy) window.setTimeout(() => { try { synth.speak(utter); } catch (error) { finish(); } }, 90);
        else synth.speak(utter);
      } catch (error) {
        finish();
      }
    });
  }

  function stopSpeech() {
    speechEpoch += 1;
    if (!synth) return;
    try { synth.cancel(); } catch (error) { /* noop */ }
  }

  function fireSkip() {
    const fn = skipResolve;
    skipResolve = null;
    if (fn) fn();
  }

  // mock.js가 이 파일 밖의 자리에서 쓰던 상태. 대입만 하고 값은 바꾸지 않는다.
  function clearVoiceKey() {
    voiceKey = '';
  }

  function assignExamVoices() {
    examVoices = window.SpeechVoice.examPair();
  }

  function setSkipResolve(fn) {
    skipResolve = fn;
  }

  window.MockAudio = Object.freeze({
    audio,
    sleepAudioSoon,
    unlockAudio,
    beep,
    wakeOutput,
    voicesFor,
    speak,
    speakNow,
    stopSpeech,
    fireSkip,
    clearVoiceKey,
    assignExamVoices,
    setSkipResolve,
  });
})();
