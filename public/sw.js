/**
 * PWA service worker — BUILD_ID is replaced during `vite build`.
 * Network-first for HTML/navigation so deploys are not stuck behind stale cache.
 */
const BUILD_ID = '__BUILD_ID__';
const CACHE_STATIC = `rasid-static-${BUILD_ID}`;

const PRECACHE_URLS = ['/manifest.json', '/icon.svg'];

const ALWAYS_NETWORK = (pathname) =>
  pathname === '/sw.js' ||
  pathname === '/index.html' ||
  pathname === '/' ||
  pathname.startsWith('/src/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC).then((cache) => cache.addAll(PRECACHE_URLS)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_STATIC && key.startsWith('rasid-'))
          .map((key) => caches.delete(key)),
      ),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  if (ALWAYS_NETWORK(url.pathname)) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match('/index.html');
        return cached ?? Response.error();
      }),
    );
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ??
          fetch(event.request).then((response) => {
            if (response?.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ??
        fetch(event.request).then((response) => {
          if (response?.status === 200 && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_STATIC).then((cache) => cache.put(event.request, copy));
          }
          return response;
        }),
    ),
  );
});
