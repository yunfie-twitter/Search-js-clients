const CACHE_NAME = 'search-v4';
const STATIC_CACHE = 'search-static-v4';
const DYNAMIC_CACHE = 'search-dynamic-v4';
const IMAGE_CACHE = 'search-image-v4';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (![STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE].includes(k)) {
            return caches.delete(k); // 古いキャッシュ(v3等)を強制削除
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // 1. HTML Navigation (index.html): 常に Network First (最新のJSを読み込むため)
  if (request.mode === 'navigate' || url.pathname === '/') {
    e.respondWith(
      fetch(request)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          return networkRes;
        })
        .catch(() => caches.match(request)) // オフライン時のみキャッシュを返す
    );
    return;
  }

  // 2. API requests: Network First, fallback to cache
  if (url.pathname.startsWith('/api/') || url.hostname === 'api.search.com') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          if (!res || res.status !== 200) return res;
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // 3. Images: Stale While Revalidate
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
    e.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const clone = networkRes.clone();
            caches.open(IMAGE_CACHE).then((c) => c.put(request, clone));
          }
          return networkRes;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // 4. Static assets (JS, CSS, fonts, etc.): Cache First, then Network
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((networkRes) => {
        if (!networkRes || networkRes.status !== 200 || networkRes.type !== 'basic') {
          return networkRes;
        }
        const clone = networkRes.clone();
        caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
        return networkRes;
      }).catch(() => {
        // Optional offline fallback
      });
    })
  );
});
