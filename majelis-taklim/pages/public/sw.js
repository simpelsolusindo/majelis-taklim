// ============================================================
// Majelis Taklim - Service Worker
// Versi cache: update string ini untuk force refresh semua klien
// ============================================================

const CACHE_VERSION = 'mt-v1.0.0';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// File yang SELALU di-cache saat install (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Lateef:wght@200;300;400;500;600;700;800&family=Scheherazade+New:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap',
];

// Prefix API yang boleh di-cache (read-only, data lambat berubah)
const CACHEABLE_API_PREFIXES = [
  '/api/bacaan',
  '/api/jadwal',
  '/api/pengumuman',
];

// ============================================================
// INSTALL — cache semua static assets
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())   // langsung aktif tanpa tunggu tab lama tutup
  );
});

// ============================================================
// ACTIVATE — hapus cache versi lama
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — strategi per tipe request
// ============================================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Skip non-GET dan chrome-extension
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // 2. API cacheable → Network-First dengan fallback cache
  if (CACHEABLE_API_PREFIXES.some(p => url.pathname.startsWith(p))) {
    event.respondWith(networkFirstAPI(request));
    return;
  }

  // 3. API lain (login, POST, dll) → langsung network, jangan cache
  if (url.pathname.startsWith('/api/')) return;

  // 4. Static assets & halaman → Cache-First dengan fallback network
  event.respondWith(cacheFirstStatic(request));
});

// Network-First: coba network, simpan ke cache, jika gagal pakai cache
async function networkFirstAPI(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ error: 'Anda sedang offline. Data mungkin belum tersedia.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// Cache-First: pakai cache jika ada, jika tidak ambil dari network dan simpan
async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Fallback ke index.html untuk SPA routing
    const fallback = await caches.match('/index.html');
    return fallback || new Response('Offline', { status: 503 });
  }
}

// ============================================================
// PUSH NOTIFICATION
// ============================================================
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'Majelis Taklim', {
      body: data.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: data.tag || 'mt-notif',
      data: { url: data.url || '/' },
      actions: [
        { action: 'open', title: 'Buka' },
        { action: 'close', title: 'Tutup' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'close') return;
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      const url = event.notification.data?.url || '/';
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// ============================================================
// BACKGROUND SYNC (untuk absensi/iuran offline)
// ============================================================
self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Ambil data pending dari IndexedDB (implementasi di app)
  // Kirim ulang ke server saat online kembali
  const allClients = await clients.matchAll();
  allClients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}
