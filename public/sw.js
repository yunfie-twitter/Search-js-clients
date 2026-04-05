const CACHE     = 'search-v2';
const STATIC    = [
  '/',
  '/index.html',
];

// インストール時に静的リソースをキャッシュ
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // API リクエスト: Network First、失敗時はキャッシュ
  if (url.pathname.startsWith('/api/') || url.hostname !== self.location.hostname) {
    e.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 静的リソース: Cache First
  e.respondWith(
    caches.match(request).then((cached) =>
      cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      })
    )
  );
});
