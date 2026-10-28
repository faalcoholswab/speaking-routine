/* 스피킹 루틴 — 오프라인 앱 셸 (network-first) */
const CACHE = 'speaking-routine-v33';
const SHELL = [
  './',
  './index.html',
  './mock.html',
  './manifest.webmanifest',
  './css/style.css',
  './css/mock.css',
  './js/app.js',
  './js/pron-guide.js',
  './js/voice.js',
  './js/mock.js',
  './data/part3.js',
  './data/part5.js',
  './data/mock-01.js',
  './data/mock-01-guide.js',
  './data/mock-02.js',
  './data/mock-02-guide.js',
  './data/mock-03.js',
  './data/mock-03-guide.js',
  './assets/mock/mock-03/p2-q3.webp',
  './assets/mock/mock-03/p2-q4.webp',
  './assets/mock/mock-03/p4-table.webp',
  './assets/mock/mock-02/p2-q3.webp',
  './assets/mock/mock-02/p2-q4.webp',
  './assets/mock/mock-02/p4-table.webp',
  './assets/mock/mock-01/p2-q3.webp',
  './assets/mock/mock-01/p2-q4.webp',
  './assets/mock/mock-01/p4-table.webp',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then((results) => {
        const failed = results.filter((result) => result.status === 'rejected');
        if (failed.length) console.warn('App shell entries failed to cache:', failed.length);
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE && key.startsWith('speaking-routine-'))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    const scopeRoot = new URL('./', self.location).pathname;
    const indexPage = new URL('./index.html', self.location).pathname;
    const mockPage = new URL('./mock.html', self.location).pathname;

    let target = null;
    if (url.pathname === mockPage) target = './mock.html';
    else if (url.pathname === scopeRoot || url.pathname === indexPage) target = './index.html';

    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && target) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then((cache) => cache.put(target, copy)));
          }
          return response;
        })
        .catch(() => caches.match(target || './index.html').then((hit) => hit || new Response(
          '<!doctype html><meta charset="utf-8"><title>오프라인</title><p>오프라인 상태이고 저장된 페이지가 없습니다. 인터넷에 연결한 뒤 다시 열어 주세요.</p>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        )))
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request).then((hit) => hit || new Response('Offline', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })))
  );
});
