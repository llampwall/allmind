// AllMind Service Worker - PWA Cache Strategy
const CACHE_VERSION = 'allmind-cache-v1';

// Static assets to cache (app shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  'https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/react-router-dom@5.3.4/umd/react-router-dom.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.error('[SW] Cache addAll failed:', err);
        // Continue installation even if some assets fail to cache
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((e) => console.warn(`[SW] Failed to cache: ${url}`, e))
          )
        );
      });
    }).then(() => {
      console.log('[SW] Install complete, skipping waiting');
      return self.skipWaiting(); // Activate immediately
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_VERSION) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Activation complete, claiming clients');
      return self.clients.claim(); // Take control immediately
    })
  );
});

// Fetch event - cache-first for assets, network-only for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-only for API calls (no offline support for data)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline - API unavailable' }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' },
          }
        );
      })
    );
    return;
  }

  // Cache-first for static assets (app shell)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, fetch update in background
        event.waitUntil(
          fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_VERSION).then((cache) => {
                cache.put(request, networkResponse.clone());
              });
            }
          }).catch(() => {
            // Ignore network errors when updating cache
          })
        );
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((networkResponse) => {
        // Cache successful GET responses for HTML/JS/CSS/images
        if (
          request.method === 'GET' &&
          networkResponse &&
          networkResponse.status === 200 &&
          (
            request.url.includes('.html') ||
            request.url.includes('.js') ||
            request.url.includes('.css') ||
            request.url.includes('.png') ||
            request.url.includes('.jpg') ||
            request.url.includes('.svg') ||
            request.url.includes('.woff') ||
            request.url.includes('unpkg.com') ||
            request.url.includes('cdn.') ||
            request.url.includes('fonts.googleapis.com')
          )
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_VERSION).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline fallback - return cached index.html for navigation requests
        if (request.mode === 'navigate') {
          return caches.match('/index.html').then((cachedIndex) => {
            return cachedIndex || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
            });
          });
        }
        throw new Error('Network request failed and no cache available');
      });
    })
  );
});

// Message event - allow cache updates from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing cache');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }).then(() => {
        console.log('[SW] Cache cleared');
      })
    );
  }
});

console.log('[SW] Service worker loaded');
