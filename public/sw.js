/* Haritech PWA service worker.
   Strategy summary:
   - app-navigations: network first, fall back to the last cached page, then '/'
     (so a phone without signal still opens the app shell)
   - hashed build assets (/assets/*) and images: cache first, they never change
   - everything same-origin: stale-while-revalidate
   - Google Fonts: cache first across visits (offline typography)
   - Supabase and other cross-origin calls: never cached (live data)  */
const VERSION = 'haritech-pwa-20261110';
const SHELL = VERSION + '-shell';
const RUNTIME = VERSION + '-runtime';
const FONTS = VERSION + '-fonts';

// Pages pre-cached at install so the app opens even on first offline launch.
const PRECACHE_ROUTES = ['/', '/haritech', '/haritech/services', '/haritech/request-quote'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.allSettled(
        PRECACHE_ROUTES.map((route) => cache.add(new Request(route, { cache: 'reload' })))
      );
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key !== SHELL && key !== RUNTIME && key !== FONTS) await caches.delete(key);
      }
      await self.clients.claim();
    })()
  );
});

/* Keeps a cache from growing forever. */
const trimCache = async (name, max) => {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  for (const key of keys.slice(0, keys.length - max)) await cache.delete(key);
};

/** Cache-first, filling from the network on the way past. */
const cacheFirst = (request, cacheName, maxEntries) =>
  (async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const cache = await caches.open(cacheName);
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) {
        await cache.put(request, response.clone());
        void trimCache(cacheName, maxEntries);
      }
      return response;
    } catch {
      return cached || Response.error();
    }
  })();

/** Network first with cached fallback — good for live pages, bad for nothing. */
const networkFirstPage = (request) =>
  (async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok) {
        const cache = await caches.open(SHELL);
        await cache.put(request, response.clone());
        void trimCache(SHELL, 16);
      }
      return response;
    } catch {
      const cachedPage = (await caches.match(request)) || (await caches.match('/'));
      return cachedPage || Response.error();
    }
  })();

/** Serve cached immediately, refresh quietly in the background. */
const staleWhileRevalidate = (request) =>
  (async () => {
    const cached = await caches.match(request);
    const network = fetch(request)
      .then((response) => {
        if (response && response.ok) {
          caches.open(SHELL).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => null);
    return cached || (await network) || Response.error();
  })();

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    // Fonts get a cache-first lane; every other third-party call (Supabase API,
    // analytics) stays live so the site never serves stale business data.
    if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
      event.respondWith(cacheFirst(request, FONTS, 40));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.pathname.startsWith('/assets/') || /\.(png|jpe?g|webp|svg|ico|css|woff2?)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, RUNTIME, 150));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
