/* =========================================================
   음성 특징 — 16kHz 모노 PCM에서 말 구간·쉼·음높이를 계산합니다.
   순수 함수라 브라우저(window.AudioMetrics)와 Node(module.exports)에서 같게 동작합니다.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.AudioMetrics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FRAME_SEC = 0.02;
  const PAUSE_SEC = 0.6;
  const LONG_PAUSE_SEC = 2;
  const MIN_F0 = 75;
  const MAX_F0 = 400;

  function percentile(values, ratio) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * ratio)));
    return sorted[index];
  }

  function frameRms(samples, start, size) {
    let sum = 0;
    const end = Math.min(samples.length, start + size);
    for (let i = start; i < end; i += 1) sum += samples[i] * samples[i];
    const count = Math.max(1, end - start);
    return Math.sqrt(sum / count);
  }

  function detectSpeech(samples, frameSize, frameCount, rms) {
    const sorted = [...rms].sort((a, b) => a - b);
    const at = (ratio) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * ratio)))] || 0;
    const noise = at(0.2);
    const loud = at(0.95);
    // 잡음 바닥 대비 +6dB 이상 큰 프레임만 말로 봅니다.
    const threshold = Math.max(0.0025, noise * 2);
    // 크기 변화가 거의 없으면(6dB 미만) 말이 아니라 지속음·잡음입니다.
    const dynamicDb = 20 * Math.log10((loud + 1e-6) / (noise + 1e-6));
    const silent = dynamicDb < 6 || loud <= threshold * 1.15;
    const voiced = silent ? rms.map(() => false) : rms.map((value) => value > threshold);

    // 60ms보다 짧은 끊김은 메우고, 100ms보다 짧은 소리는 버립니다.
    const minRun = Math.round(0.06 / FRAME_SEC);
    const maxGap = Math.round(0.1 / FRAME_SEC);
    for (let pass = 0; pass < 2; pass += 1) {
      let i = 0;
      while (i < voiced.length) {
        if (voiced[i]) { i += 1; continue; }
        let j = i;
        while (j < voiced.length && !voiced[j]) j += 1;
        const gap = j - i;
        const before = i > 0 && voiced[i - 1];
        const after = j < voiced.length && voiced[j];
        if (before && after && gap <= maxGap) for (let k = i; k < j; k += 1) voiced[k] = true;
        i = j;
      }
    }
    for (let i = 0; i < voiced.length;) {
      if (!voiced[i]) { i += 1; continue; }
      let j = i;
      while (j < voiced.length && voiced[j]) j += 1;
      if (j - i < minRun) for (let k = i; k < j; k += 1) voiced[k] = false;
      i = j;
    }
    return { voiced, threshold };
  }

  function runs(voiced, frameSec) {
    const out = [];
    for (let i = 0; i < voiced.length;) {
      if (!voiced[i]) { i += 1; continue; }
      let j = i;
      while (j < voiced.length && voiced[j]) j += 1;
      out.push({ start: i * frameSec, end: j * frameSec, dur: (j - i) * frameSec });
      i = j;
    }
    return out;
  }

  function estimatePitch(samples, sampleRate, start, size, minLag, maxLag) {
    // 정규화 자기상관 — 유성 구간에서만 호출합니다.
    let best = 0;
    let bestScore = 0;
    let energy = 0;
    for (let i = 0; i < size; i += 1) energy += samples[start + i] * samples[start + i];
    if (energy < 1e-7) return 0;
    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let sum = 0;
      let norm = 0;
      for (let i = 0; i < size - lag; i += 1) {
        const a = samples[start + i];
        const b = samples[start + i + lag];
        sum += a * b;
        norm += b * b;
      }
      const score = norm > 0 ? sum / Math.sqrt(energy * norm) : 0;
      if (score > bestScore) { bestScore = score; best = lag; }
    }
    if (bestScore < 0.3 || !best) return 0;
    // 자기상관은 두 배 주기를 고르기 쉬워서, 절반 지점이 비슷하면 그쪽을 씁니다.
    return sampleRate / best;
  }

  function analyze(samples, sampleRate) {
    const rate = Number(sampleRate) || 16000;
    const input = samples instanceof Float32Array ? samples : new Float32Array(samples || []);
    const frameSize = Math.round(FRAME_SEC * rate);
    const frameCount = Math.floor(input.length / frameSize);
    if (!frameCount) {
      return { speechSec: 0, firstSpeechSec: 0, pauses: [], longPauses: [], pauseRatio: 0, pitchMedianHz: 0, pitchRangeSt: 0, durationSec: 0 };
    }

    const rms = new Float32Array(frameCount);
    for (let i = 0; i < frameCount; i += 1) rms[i] = frameRms(input, i * frameSize, frameSize);
    const { voiced } = detectSpeech(input, frameSize, frameCount, rms);
    const spans = runs(voiced, FRAME_SEC);

    const speechSec = spans.reduce((sum, span) => sum + span.dur, 0);
    const firstSpeechSec = spans.length ? spans[0].start : 0;
    const pauses = [];
    for (let i = 1; i < spans.length; i += 1) {
      const gap = spans[i].start - spans[i - 1].end;
      if (gap >= PAUSE_SEC) pauses.push({ start: Number(spans[i - 1].end.toFixed(2)), end: Number(spans[i].start.toFixed(2)), dur: Number(gap.toFixed(2)) });
    }
    const longPauses = pauses.filter((pause) => pause.dur >= LONG_PAUSE_SEC);
    const span = spans.length ? spans[spans.length - 1].end - spans[0].start : 0;
    const pauseRatio = span > 0 ? Math.max(0, Math.min(1, (span - speechSec) / span)) : 0;

    // 음높이: 유성 프레임을 40ms 간격으로 표본
    const minLag = Math.floor(rate / MAX_F0);
    const maxLag = Math.ceil(rate / MIN_F0);
    const window = Math.round(0.04 * rate);
    const pitches = [];
    const step = 2;
    for (let f = 0; f < frameCount; f += step) {
      if (!voiced[f]) continue;
      const start = f * frameSize;
      if (start + window + maxLag >= input.length) break;
      const f0 = estimatePitch(input, rate, start, window, minLag, maxLag);
      if (f0 > MIN_F0 && f0 < MAX_F0) pitches.push(f0);
    }
    const pitchMedianHz = pitches.length ? Math.round(percentile(pitches, 0.5)) : 0;
    let pitchRangeSt = 0;
    if (pitches.length >= 4) {
      const low = percentile(pitches, 0.1);
      const high = percentile(pitches, 0.9);
      if (low > 0 && high > low) pitchRangeSt = Number((12 * Math.log2(high / low)).toFixed(1));
    }

    return {
      durationSec: Number((input.length / rate).toFixed(2)),
      speechSec: Number(speechSec.toFixed(2)),
      firstSpeechSec: Number(firstSpeechSec.toFixed(2)),
      pauses,
      longPauses,
      pauseRatio: Number(pauseRatio.toFixed(3)),
      pitchMedianHz,
      pitchRangeSt,
      voicedRatio: Number((speechSec / (input.length / rate || 1)).toFixed(3)),
    };
  }

  return { analyze, FRAME_SEC, PAUSE_SEC, LONG_PAUSE_SEC };
});
