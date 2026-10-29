/* =========================================================
   기기 안 음성 인식 — Whisper(ONNX) + onnxruntime-web
   - 외부 호출 없음: 모델·wasm 모두 same-origin에서 받습니다.
   - 브라우저(window.SpeakingSTT, Worker)와 Node(module.exports)에서 같은 엔진을 씁니다.

   계약
   - SpeakingSTT.isSupported(): WebAssembly + Worker 사용 가능 여부
   - ensureModel(onProgress?): 모델·세션 준비. onProgress({phase, file?, loaded, total})
   - transcribe(blob|File|Float32Array, {language:'en'})
       → {text, model, backend, ms, seconds}
   - status() → {ready, loading, error, model, backend, progress}
   - 모델 파일: models/whisper-tiny.en/ (SHELL 아님, 첫 사용 때 Cache Storage에 저장)
   - 워커: js/stt-worker.js (module). 경로는 이 스크립트 위치 기준 상대 경로입니다.
   ========================================================= */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.SpeakingSTT = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MODEL_ID = 'whisper-tiny.en';
  const N_FFT = 400;
  const HOP = 160;
  const SR = 16000;
  const N_SAMPLES = 480000;   // 30초
  const N_FRAMES = 3000;
  const N_MELS = 80;
  const N_BINS = 201;

  /* ---------------- WAV ---------------- */
  function isWav(buffer) {
    const view = new Uint8Array(buffer);
    return view.length > 12 && view[0] === 0x52 && view[1] === 0x49 && view[2] === 0x46 && view[3] === 0x46;
  }

  function pcmFromWav(buffer) {
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);
    let offset = 12;
    let format = null;
    let data = null;
    while (offset + 8 <= view.byteLength) {
      const id = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
      const size = view.getUint32(offset + 4, true);
      const body = offset + 8;
      if (id === 'fmt ') {
        format = {
          format: view.getUint16(body, true),
          channels: view.getUint16(body + 2, true),
          rate: view.getUint32(body + 4, true),
          bits: view.getUint16(body + 14, true),
        };
      } else if (id === 'data') {
        data = { start: body, size: Math.min(size, view.byteLength - body) };
      }
      offset = body + size + (size % 2);
    }
    if (!format || !data) throw new Error('WAV 형식을 읽지 못했습니다.');
    const channels = format.channels || 1;
    const bits = format.bits || 16;
    const frames = Math.floor(data.size / (bits / 8) / channels);
    const out = new Float32Array(frames);
    for (let i = 0; i < frames; i += 1) {
      let sum = 0;
      for (let c = 0; c < channels; c += 1) {
        const at = data.start + (i * channels + c) * (bits / 8);
        if (bits === 16) sum += view.getInt16(at, true) / 32768;
        else if (bits === 32) sum += view.getFloat32(at, true);
        else if (bits === 8) sum += (view.getUint8(at) - 128) / 128;
      }
      out[i] = sum / channels;
    }
    return { samples: out, rate: format.rate };
  }

  /* ---------------- 멜 필터 ---------------- */
  function hzToMel(hz) {
    const fSp = 200 / 3;
    const minLogHz = 1000;
    const minLogMel = minLogHz / fSp;
    const logstep = Math.log(6.4) / 27;
    return hz >= minLogHz ? minLogMel + Math.log(hz / minLogHz) / logstep : hz / fSp;
  }
  function melToHz(mel) {
    const fSp = 200 / 3;
    const minLogHz = 1000;
    const minLogMel = minLogHz / fSp;
    const logstep = Math.log(6.4) / 27;
    return mel >= minLogMel ? minLogHz * Math.exp(logstep * (mel - minLogMel)) : fSp * mel;
  }

  function melFilters(nMels, nFft, sampleRate) {
    const nBins = 1 + nFft / 2;
    const freqs = new Float64Array(nBins);
    for (let i = 0; i < nBins; i += 1) freqs[i] = (i * sampleRate) / nFft;
    const mels = new Float64Array(nMels + 2);
    const lo = hzToMel(0);
    const hi = hzToMel(sampleRate / 2);
    for (let i = 0; i < nMels + 2; i += 1) mels[i] = melToHz(lo + ((hi - lo) * i) / (nMels + 1));
    const weights = new Float32Array(nMels * nBins);
    for (let m = 0; m < nMels; m += 1) {
      const lower = mels[m + 1] - mels[m] || 1e-9;
      const upper = mels[m + 2] - mels[m + 1] || 1e-9;
      const norm = 2 / (mels[m + 2] - mels[m] || 1e-9);
      for (let k = 0; k < nBins; k += 1) {
        const up = (freqs[k] - mels[m]) / lower;
        const down = (mels[m + 2] - freqs[k]) / upper;
        weights[m * nBins + k] = Math.max(0, Math.min(up, down)) * norm;
      }
    }
    return weights;
  }

  const FILTERS = melFilters(N_MELS, N_FFT, SR);
  const WINDOW = new Float64Array(N_FFT);
  for (let i = 0; i < N_FFT; i += 1) WINDOW[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N_FFT);
  const COS = new Float64Array(N_BINS * N_FFT);
  const SIN = new Float64Array(N_BINS * N_FFT);
  for (let k = 0; k < N_BINS; k += 1) {
    for (let n = 0; n < N_FFT; n += 1) {
      COS[k * N_FFT + n] = Math.cos((2 * Math.PI * k * n) / N_FFT);
      SIN[k * N_FFT + n] = -Math.sin((2 * Math.PI * k * n) / N_FFT);
    }
  }

  function logMel(samples) {
    const n = Math.min(samples.length, N_SAMPLES);
    const padded = new Float64Array(N_SAMPLES + 400);
    for (let i = 0; i < 200; i += 1) padded[i] = samples[200 - i] || 0;
    padded.set(samples.subarray(0, n), 200);
    for (let i = 0; i < 200; i += 1) {
      const from = N_SAMPLES - 2 - i;
      padded[200 + N_SAMPLES + i] = from >= 0 && from < samples.length ? samples[from] : 0;
    }

    const out = new Float32Array(N_MELS * N_FRAMES);
    const frame = new Float64Array(N_FFT);
    const power = new Float64Array(N_BINS);
    let silent = null;

    for (let t = 0; t < N_FRAMES; t += 1) {
      const base = t * HOP;
      let energy = 0;
      for (let i = 0; i < N_FFT; i += 1) {
        const v = padded[base + i] * WINDOW[i];
        frame[i] = v;
        energy += v * v;
      }
      if (energy === 0 && silent) {
        for (let m = 0; m < N_MELS; m += 1) out[m * N_FRAMES + t] = silent[m];
        continue;
      }
      for (let k = 0; k < N_BINS; k += 1) {
        let re = 0;
        let im = 0;
        const off = k * N_FFT;
        for (let i = 0; i < N_FFT; i += 1) {
          const v = frame[i];
          re += v * COS[off + i];
          im += v * SIN[off + i];
        }
        power[k] = re * re + im * im;
      }
      for (let m = 0; m < N_MELS; m += 1) {
        let acc = 0;
        const off = m * N_BINS;
        for (let k = 0; k < N_BINS; k += 1) acc += FILTERS[off + k] * power[k];
        out[m * N_FRAMES + t] = acc;
      }
      if (energy === 0) {
        silent = new Float32Array(N_MELS);
        for (let m = 0; m < N_MELS; m += 1) silent[m] = out[m * N_FRAMES + t];
      }
    }

    let max = -Infinity;
    for (let i = 0; i < out.length; i += 1) {
      const v = Math.log10(Math.max(out[i], 1e-10));
      out[i] = v;
      if (v > max) max = v;
    }
    for (let i = 0; i < out.length; i += 1) out[i] = (Math.max(out[i], max - 8) + 4) / 4;
    return out;
  }

  /* ---------------- 토크나이저 (디코드 전용) ---------------- */
  const BYTE_DECODER = (() => {
    const bytes = [];
    for (let i = 33; i <= 126; i += 1) bytes.push(i);
    for (let i = 161; i <= 172; i += 1) bytes.push(i);
    for (let i = 174; i <= 255; i += 1) bytes.push(i);
    const chars = bytes.slice();
    let extra = 0;
    for (let b = 0; b < 256; b += 1) {
      if (!bytes.includes(b)) { bytes.push(b); chars.push(256 + extra); extra += 1; }
    }
    const map = new Map();
    for (let i = 0; i < bytes.length; i += 1) map.set(String.fromCharCode(chars[i]), bytes[i]);
    return map;
  })();

  function makeDecoder(vocab, added) {
    const table = new Map();
    for (const [token, id] of Object.entries(vocab)) table.set(id, token);
    for (const [token, id] of Object.entries(added || {})) table.set(id, token);
    const utf8 = [];
    return function decode(ids) {
      utf8.length = 0;
      for (const id of ids) {
        const token = table.get(id);
        if (!token || token.startsWith('<|')) continue;
        for (const ch of token) {
          const byte = BYTE_DECODER.get(ch);
          if (byte !== undefined) utf8.push(byte);
        }
      }
      if (typeof TextDecoder !== 'undefined') return new TextDecoder().decode(Uint8Array.from(utf8));
      return '';
    };
  }

  /* ---------------- 엔진 ---------------- */
  async function fetchJson(fetchBinary, url) {
    const buffer = await fetchBinary(url);
    const text = new TextDecoder().decode(new Uint8Array(buffer));
    return JSON.parse(text);
  }

  async function createEngine(options) {
    const ort = options.ort;
    const base = String(options.modelBase || 'models/whisper-tiny.en/').replace(/\/?$/, '/');
    const fetchBinary = options.fetchBinary || (async (url) => (await fetch(url)).arrayBuffer());
    const onProgress = options.onProgress || (() => {});
    const sessionOptions = { executionProviders: ['wasm'], graphOptimizationLevel: 'all' };

    const [config, generation, vocab, added, preprocessor] = await Promise.all([
      fetchJson(fetchBinary, `${base}config.json`),
      fetchJson(fetchBinary, `${base}generation_config.json`),
      fetchJson(fetchBinary, `${base}vocab.json`),
      fetchJson(fetchBinary, `${base}added_tokens.json`).catch(() => ({})),
      fetchJson(fetchBinary, `${base}preprocessor_config.json`).catch(() => ({})),
    ]);

    const files = ['onnx/encoder_model_quantized.onnx', 'onnx/decoder_model_quantized.onnx', 'onnx/decoder_with_past_model_quantized.onnx'];
    const sessions = {};
    let loaded = 0;
    for (const file of files) {
      onProgress({ phase: 'download', file, loaded, total: files.length });
      const buffer = await fetchBinary(`${base}${file}`);
      loaded += 1;
      onProgress({ phase: 'download', file, loaded, total: files.length });
      sessions[file] = buffer;
    }

    onProgress({ phase: 'init', loaded, total: files.length });
    const encoder = await ort.InferenceSession.create(sessions[files[0]], sessionOptions);
    const decoder = await ort.InferenceSession.create(sessions[files[1]], sessionOptions);
    const decoderPast = await ort.InferenceSession.create(sessions[files[2]], sessionOptions);
    onProgress({ phase: 'ready', loaded, total: files.length });

    const decodeTokens = makeDecoder(vocab, added);
    const layers = Number(config.decoder_layers) || 4;
    const heads = Number(config.decoder_attention_heads) || 6;
    const dim = Math.round(Number(config.d_model) / heads) || 64;
    const eos = Number(generation.eos_token_id ?? config.eos_token_id ?? 50256);
    const start = Number(generation.decoder_start_token_id ?? config.decoder_start_token_id ?? 50257);
    const noTimestamps = Number(generation.no_timestamps_token_id ?? 50362);
    const forced = Array.isArray(generation.forced_decoder_ids) ? generation.forced_decoder_ids : [];
    const suppress = new Set((generation.suppress_tokens || []).map(Number));
    const beginSuppress = new Set((generation.begin_suppress_tokens || []).map(Number));
    const vocabSize = Number(config.vocab_size) || 51864;
    const maxTokens = 224;

    const pastNames = [];
    const firstNames = ['logits'];
    for (let l = 0; l < layers; l += 1) {
      pastNames.push(`present.${l}.decoder.key`, `present.${l}.decoder.value`);
      firstNames.push(`present.${l}.decoder.key`, `present.${l}.decoder.value`, `present.${l}.encoder.key`, `present.${l}.encoder.value`);
    }

    function emptyPast() {
      const past = {};
      for (let l = 0; l < layers; l += 1) {
        past[`past_key_values.${l}.decoder.key`] = new ort.Tensor('float32', new Float32Array(0), [1, heads, 0, dim]);
        past[`past_key_values.${l}.decoder.value`] = new ort.Tensor('float32', new Float32Array(0), [1, heads, 0, dim]);
        past[`past_key_values.${l}.encoder.key`] = new ort.Tensor('float32', new Float32Array(0), [1, heads, 0, dim]);
        past[`past_key_values.${l}.encoder.value`] = new ort.Tensor('float32', new Float32Array(0), [1, heads, 0, dim]);
      }
      return past;
    }

    function cloneTensor(t) {
      return new ort.Tensor('float32', new Float32Array(t.data), t.dims);
    }

    async function transcribeChunk(samples) {
      const t0 = Date.now();
      const mel = logMel(samples);
      const encoderOut = await encoder.run(
        { input_features: new ort.Tensor('float32', mel, [1, N_MELS, N_FRAMES]) },
        ['last_hidden_state'],
      );
      const hidden = encoderOut.last_hidden_state;

      const prompt = [start];
      for (const pair of forced) if (Array.isArray(pair)) prompt.push(Number(pair[1]));
      if (!prompt.includes(noTimestamps)) prompt.push(noTimestamps);

      const ids = BigInt64Array.from(prompt.map((v) => BigInt(v)));
      let result = await decoder.run(
        { input_ids: new ort.Tensor('int64', ids, [1, ids.length]), encoder_hidden_states: hidden },
        firstNames,
      );

      let past = emptyPast();
      for (let l = 0; l < layers; l += 1) {
        past[`past_key_values.${l}.decoder.key`] = cloneTensor(result[`present.${l}.decoder.key`]);
        past[`past_key_values.${l}.decoder.value`] = cloneTensor(result[`present.${l}.decoder.value`]);
        // cross-attention K/V는 첫 패스 결과를 그대로 이어 씁니다. (별도 출력이 없으면 아래에서 계산)
      }
      const crossFromFirst = {};
      for (let l = 0; l < layers; l += 1) {
        const ek = result[`present.${l}.encoder.key`];
        const ev = result[`present.${l}.encoder.value`];
        if (ek) crossFromFirst[l] = [cloneTensor(ek), cloneTensor(ev)];
      }

      const tokens = [];
      let logits = result.logits;
      let position = logits.dims[1] - 1;
      for (let step = 0; step < maxTokens; step += 1) {
        const data = logits.data;
        const base = position * vocabSize;
        let best = 0;
        let bestValue = -Infinity;
        for (let v = 0; v < vocabSize; v += 1) {
          if (suppress.has(v) || (step === 0 && beginSuppress.has(v))) continue;
          const value = data[base + v];
          if (value > bestValue) { bestValue = value; best = v; }
        }
        if (best === eos) break;
        tokens.push(best);

        const feeds = {
          input_ids: new ort.Tensor('int64', BigInt64Array.from([BigInt(best)]), [1, 1]),
          ...past,
        };
        if (Object.keys(crossFromFirst).length) {
          for (const [l, pair] of Object.entries(crossFromFirst)) {
            feeds[`past_key_values.${l}.encoder.key`] = pair[0];
            feeds[`past_key_values.${l}.encoder.value`] = pair[1];
          }
        }
        result = await decoderPast.run(feeds, ['logits', ...pastNames]);
        for (let l = 0; l < layers; l += 1) {
          past[`past_key_values.${l}.decoder.key`] = cloneTensor(result[`present.${l}.decoder.key`]);
          past[`past_key_values.${l}.decoder.value`] = cloneTensor(result[`present.${l}.decoder.value`]);
        }
        logits = result.logits;
        position = logits.dims[1] - 1;
      }

      return { text: decodeTokens(tokens).trim(), ms: Date.now() - t0, tokens: tokens.length };
    }

    // 30초 고정 분할 대신 26~30초 사이에서 가장 조용한 지점(20ms)을 잘라 문장이 끊기지 않게 합니다.
    function findCut(samples, start) {
      const remaining = samples.length - start;
      if (remaining <= N_SAMPLES) return samples.length;
      const from = start + Math.round(26 * SR);
      const to = Math.min(start + N_SAMPLES, samples.length - 320);
      let bestAt = to;
      let bestEnergy = Infinity;
      for (let at = from; at <= to; at += 160) {
        let energy = 0;
        for (let i = at; i < at + 320; i += 1) energy += samples[i] * samples[i];
        if (energy < bestEnergy) { bestEnergy = energy; bestAt = at; }
      }
      const cut = Math.min(bestAt + 160, start + N_SAMPLES);
      if (samples.length - cut < SR) return samples.length;
      return cut;
    }

    // 말이 없는 입력(무음·지속 잡음)은 인식기를 돌리지 않습니다. Whisper는 무음에서
    // "you" 같은 문장을 만들어 내기 때문입니다. 판정은 AudioMetrics와 같은 기준을 씁니다.
    function hasSpeech(samples) {
      const metrics = typeof globalThis !== 'undefined' ? globalThis.AudioMetrics : null;
      if (metrics && typeof metrics.analyze === 'function') {
        try {
          const result = metrics.analyze(samples, SR);
          return { ok: result.speechSec >= 0.5, speechSec: result.speechSec };
        } catch (error) { /* 아래 자체 판정으로 */ }
      }
      const frame = 320;
      const frames = Math.floor(samples.length / frame);
      if (!frames) return { ok: false, speechSec: 0 };
      const rms = new Float32Array(frames);
      for (let f = 0; f < frames; f += 1) {
        let sum = 0;
        for (let i = f * frame; i < (f + 1) * frame; i += 1) sum += samples[i] * samples[i];
        rms[f] = Math.sqrt(sum / frame);
      }
      const sorted = Float32Array.from(rms).sort();
      const at = (ratio) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.floor(sorted.length * ratio)))];
      const noise = at(0.2);
      const loud = at(0.95);
      if (loud < Math.max(0.0025, noise * 2) * 1.15) return { ok: false, speechSec: 0 };
      let voiced = 0;
      for (let f = 0; f < frames; f += 1) if (rms[f] > Math.max(0.0025, noise * 2)) voiced += 1;
      return { ok: (voiced * frame) / SR >= 0.5, speechSec: (voiced * frame) / SR };
    }

    async function transcribe(samples) {
      if (!samples || !samples.length) {
        return { text: '', model: MODEL_ID, backend: 'wasm', ms: 0, seconds: 0, speechSec: 0 };
      }
      const gate = hasSpeech(samples);
      if (!gate.ok) {
        return { text: '', model: MODEL_ID, backend: 'wasm', ms: 0, seconds: samples.length / SR, speechSec: gate.speechSec, silent: true };
      }
      const t0 = Date.now();
      const chunks = [];
      let start = 0;
      while (start < samples.length) {
        const end = findCut(samples, start);
        chunks.push(samples.subarray(start, end));
        start = end;
      }
      const parts = [];
      for (const chunk of chunks) {
        const out = await transcribeChunk(chunk);
        if (out.text) parts.push(out.text);
      }
      return {
        text: parts.join(' ').replace(/\s+/g, ' ').trim(),
        model: MODEL_ID,
        backend: 'wasm',
        ms: Date.now() - t0,
        seconds: samples.length / SR,
        speechSec: gate.speechSec,
        segments: chunks.map((chunk) => Number((chunk.length / SR).toFixed(2))),
      };
    }

    return { transcribe, model: MODEL_ID, backend: 'wasm', config: { layers, heads, dim, sampleRate: SR } };
  }

  /* ---------------- 브라우저 API ---------------- */
  const state = { ready: false, loading: false, error: null, worker: null, model: MODEL_ID, backend: 'wasm', progress: null };
  const pending = new Map();
  let nextId = 1;
  let levelCb = null;

  // 이 스크립트의 위치를 기준으로 worker·모델 경로를 잡습니다. (페이지가 하위 폴더여도 동작)
  const SELF = (typeof document !== 'undefined' && document.currentScript && document.currentScript.src)
    ? document.currentScript.src
    : (typeof location !== 'undefined' ? location.href : '');

  function scriptUrl(relative) {
    try { return new URL(relative, SELF).href; } catch (error) { return relative; }
  }

  function hasWorker() {
    return typeof Worker !== 'undefined' && typeof window !== 'undefined';
  }

  function createWorker() {
    const worker = new Worker(scriptUrl('stt-worker.js'), { type: 'module' });
    worker.onmessage = (event) => {
      const data = event.data || {};
      if (data.type === 'progress') {
        state.progress = data;
        if (window.SpeakingSTT && window.SpeakingSTT._onProgress) window.SpeakingSTT._onProgress(data);
        return;
      }
      if (data.type === 'ready') { state.ready = true; state.loading = false; state.error = null; return; }
      if (data.type === 'error' && data.id === undefined) { state.loading = false; state.error = data.message || 'init failed'; return; }
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      if (data.type === 'result') entry.resolve(data.result);
      else entry.reject(new Error(data.message || 'transcribe failed'));
    };
    worker.onerror = (event) => {
      state.loading = false;
      state.error = (event && event.message) || 'worker error';
    };
    return worker;
  }

  function ensureModel(onProgress) {
    if (onProgress) window.SpeakingSTT._onProgress = onProgress;
    if (state.ready) return Promise.resolve({ model: state.model, backend: state.backend });
    if (!state.worker) {
      state.worker = createWorker();
      const worker = state.worker;
      const started = new Promise((resolve, reject) => {
        const onReady = (event) => {
          const data = event.data || {};
          if (data.type === 'ready') { worker.removeEventListener('message', onReady); resolve(data); }
          else if (data.type === 'error') { worker.removeEventListener('message', onReady); reject(new Error(data.message || 'model load failed')); }
        };
        worker.addEventListener('message', onReady);
      });
      state.loading = true;
      const base = scriptUrl('../models/whisper-tiny.en/');
      const vendor = scriptUrl('../vendor/ort/');
      state.worker.postMessage({ type: 'init', modelBase: base, vendorBase: vendor });
      state.readyPromise = started.then((data) => {
        state.ready = true;
        state.loading = false;
        state.backend = (data && data.backend) || 'wasm';
        return { model: state.model, backend: state.backend };
      }).catch((error) => {
        state.loading = false;
        state.error = error.message;
        try { state.worker.terminate(); } catch (terminateError) { /* noop */ }
        state.worker = null;
        state.readyPromise = null;
        throw error;
      });
    }
    return state.readyPromise;
  }

  async function decodeToPcm(blob) {
    const buffer = blob instanceof ArrayBuffer ? blob : await blob.arrayBuffer();
    if (isWav(buffer)) {
      const { samples, rate } = pcmFromWav(buffer);
      if (rate === SR) return samples;
      return resampleLinear(samples, rate, SR);
    }
    const Ctx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
    if (!Ctx) throw new Error('이 브라우저에서는 녹음 파일을 읽지 못했습니다.');
    // 먼저 원래 샘플레이트로 디코드한 뒤 16kHz로 다시 렌더링합니다.
    let decoded = null;
    try {
      const tmp = new Ctx(1, 1, 48000);
      decoded = await tmp.decodeAudioData(buffer.slice(0));
    } catch (error) {
      const tmp = new Ctx(1, 1, 44100);
      decoded = await tmp.decodeAudioData(buffer.slice(0));
    }
    const length = Math.max(1, Math.ceil((decoded.length / decoded.sampleRate) * SR));
    const offline = new Ctx(1, length, SR);
    const source = offline.createBufferSource();
    const mono = offline.createBuffer(1, decoded.length, decoded.sampleRate);
    const target = mono.getChannelData(0);
    for (let c = 0; c < decoded.numberOfChannels; c += 1) {
      const data = decoded.getChannelData(c);
      for (let i = 0; i < data.length; i += 1) target[i] += data[i] / decoded.numberOfChannels;
    }
    source.buffer = mono;
    source.connect(offline.destination);
    source.start(0);
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0).slice();
  }

  function resampleLinear(samples, from, to) {
    if (from === to) return samples;
    const ratio = from / to;
    const length = Math.max(1, Math.floor(samples.length / ratio));
    const out = new Float32Array(length);
    for (let i = 0; i < length; i += 1) {
      const at = i * ratio;
      const i0 = Math.floor(at);
      const i1 = Math.min(samples.length - 1, i0 + 1);
      const frac = at - i0;
      out[i] = samples[i0] * (1 - frac) + samples[i1] * frac;
    }
    return out;
  }

  function transcribe(input, opts) {
    const options = opts || {};
    return ensureModel().then(async () => {
      const pcm = input instanceof Float32Array ? input : await decodeToPcm(input);
      if (!pcm.length) {
        return { text: '', model: state.model, backend: state.backend, ms: 0, seconds: 0 };
      }
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        const copy = pcm.slice();
        state.worker.postMessage({ type: 'transcribe', id, pcm: copy, language: options.language || 'en' }, [copy.buffer]);
      });
    });
  }

  const api = {
    isSupported() {
      return typeof WebAssembly === 'object' && hasWorker();
    },
    ensureModel,
    transcribe,
    status() {
      return { ready: state.ready, loading: state.loading, error: state.error, model: state.model, backend: state.backend, progress: state.progress };
    },
    _onProgress: null,
    _decodeToPcm: decodeToPcm,
    _createEngine: createEngine,
    _pcmFromWav: pcmFromWav,
    _logMel: logMel,
    _modelId: MODEL_ID,
  };
  return api;
});
