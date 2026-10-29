/* Whisper 추론 전용 Web Worker (module). 모델·wasm은 same-origin에서만 받습니다. */
import * as ort from '../vendor/ort/ort.min.mjs';
import '../js/audio-metrics.js';
import '../js/stt.js';

const provider = () => 'wasm';

let engine = null;
let initError = null;
const CACHE_NAME = 'speaking-routine-stt-v34';

async function openCache() {
  try {
    if (typeof caches === 'undefined') return null;
    return await caches.open(CACHE_NAME);
  } catch (error) {
    return null;
  }
}

self.onmessage = async (event) => {
  const data = event.data || {};

  if (data.type === 'init') {
    try {
      const cache = await openCache();
      const wasmUrl = new URL('ort-wasm-simd-threaded.wasm', data.vendorBase).href;
      const glueUrl = new URL('ort-wasm-simd-threaded.mjs', data.vendorBase).href;
      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      ort.env.wasm.proxy = false;
      ort.env.wasm.wasmPaths = data.vendorBase;
      // instantiateStreaming의 MIME 의존을 피하려고 wasm 바이트를 직접 넣습니다.
      const wasmResponse = await fetch(wasmUrl);
      if (!wasmResponse.ok) throw new Error(`wasm ${wasmResponse.status}`);
      ort.env.wasm.wasmBinary = await wasmResponse.arrayBuffer();
      void glueUrl;

      const fetchBinary = async (url) => {
        if (cache) {
          const hit = await cache.match(url);
          if (hit) return hit.arrayBuffer();
        }
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${url} ${response.status}`);
        if (cache) {
          const copy = response.clone();
          cache.put(url, copy).catch(() => {});
        }
        return response.arrayBuffer();
      };

      engine = await globalThis.SpeakingSTT._createEngine({
        ort,
        modelBase: data.modelBase,
        fetchBinary,
        onProgress: (progress) => self.postMessage({ type: 'progress', ...progress }),
      });
      self.postMessage({ type: 'ready', backend: engine.backend || provider() });
    } catch (error) {
      initError = error && error.message ? error.message : String(error);
      self.postMessage({ type: 'error', message: initError });
    }
    return;
  }

  if (data.type === 'transcribe') {
    const id = data.id;
    try {
      if (!engine) throw new Error(initError || 'model is not ready');
      const result = await engine.transcribe(data.pcm);
      self.postMessage({ type: 'result', id, result });
    } catch (error) {
      self.postMessage({ type: 'error', id, message: error && error.message ? error.message : String(error) });
    }
  }
};


