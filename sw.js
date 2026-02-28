// ─── Sample Stock System — Service Worker ─────────────────────────────────────
// Strategy: Cache-first for static assets, network-first for API calls
// Version bump this string to force cache refresh on deploy
const CACHE_NAME = 'stock-system-v1';
const RUNTIME_CACHE = 'stock-runtime-v1';

// Assets to pre-cache on install (Vite will inject hashed filenames via vite-plugin-pwa)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

// External CDN origins to cache at runtime
const CACHEABLE_ORIGINS = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://api.qrserver.com',
];

// ── Install: pre-cache shell ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: cache-first for static, network-first for navigation ───────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http schemes
  if (!request.url.startsWith('http')) return;

  // Navigation requests → serve index.html (SPA fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Camera/media requests → always network (never cache)
  if (url.pathname.includes('mediaDevices') || request.headers.get('accept')?.includes('video')) {
    return;
  }

  // Runtime cacheable: fonts + QR images
  const isRuntimeCacheable = CACHEABLE_ORIGINS.some(o => request.url.startsWith(o));
  if (isRuntimeCacheable) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // Static assets (JS, CSS, images) → cache-first
  if (
    url.origin === self.location.origin &&
    (request.destination === 'script' ||
     request.destination === 'style' ||
     request.destination === 'image' ||
     request.destination === 'font' ||
     url.pathname.endsWith('.js') ||
     url.pathname.endsWith('.css'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }
});

// ── Message: handle SKIP_WAITING from the app's update banner ─────────────────
// FIX #4: Without this, reg.waiting.postMessage({type:'SKIP_WAITING'}) is silently ignored
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Push notifications (future-ready) ────────────────────────────────────────self.addEventListener('push', (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || 'Stock Alert', {
    body: data.body || 'Check your inventory',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'stock-alert',
    data: { url: data.url || '/' },
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  );
});
