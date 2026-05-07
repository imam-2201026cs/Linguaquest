/**
 * LinguaQuest Service Worker
 * Strategies:
 *  - App shell (JS/CSS/HTML) → Cache First, fallback network
 *  - API calls (/api/*) → Network First, fallback cache
 *  - Images & fonts → Stale While Revalidate
 *  - puter.js CDN → Cache First (long-lived)
 */

const CACHE_VERSION = 'v1';
const SHELL_CACHE = `lq-shell-${CACHE_VERSION}`;
const API_CACHE = `lq-api-${CACHE_VERSION}`;
const ASSET_CACHE = `lq-assets-${CACHE_VERSION}`;

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
];

const NEVER_CACHE = [
  '/api/auth/',
];

// ── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_URLS).catch(() => {}))
  );
});

// ── Activate – purge old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => ![SHELL_CACHE, API_CACHE, ASSET_CACHE].includes(k))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and cross-origin (except fonts/cdn)
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Never cache auth routes
  if (NEVER_CACHE.some((p) => url.pathname.startsWith(p))) return;

  // puter.js CDN → Cache First
  if (url.hostname === 'js.puter.com' || url.hostname === 'api.puter.com') {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // Google Fonts → Cache First
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // API calls → Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  // Images → Stale While Revalidate
  if (/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // JS / CSS / HTML → Cache First (Vite hashed assets are immutable)
  if (/\.(js|css|woff2?|ttf)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, SHELL_CACHE));
    return;
  }

  // HTML navigation → Network First, fallback to index.html (SPA)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      networkFirst(request, SHELL_CACHE).catch(() =>
        caches.match('/index.html')
      )
    );
    return;
  }

  // Default → Network First
  event.respondWith(networkFirst(request, SHELL_CACHE));
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'LinguaQuest';
  const options = {
    body: data.body || 'Time for your daily English practice! 🎯',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: 'linguaquest-reminder',
    renotify: true,
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Start Practice' },
      { action: 'dismiss', title: 'Later' },
    ],
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((wins) => {
      const existing = wins.find((w) => w.url === targetUrl && 'focus' in w);
      if (existing) return existing.focus();
      return clients.openWindow(targetUrl);
    })
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-progress') {
    event.waitUntil(syncProgress());
  }
});

async function syncProgress() {
  // Placeholder — extend to sync offline XP/progress when back online
  console.log('[SW] Background sync: progress');
}

// ── Strategy helpers ──────────────────────────────────────────────────────────

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('Offline and no cache available');
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
  return cached || fetchPromise;
}
