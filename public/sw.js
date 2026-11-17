// ACL-ADLC Markdown Studio Service Worker
const CACHE_NAME = 'acl-studio-pwa-v1';

const STATIC_ASSETS = [
  '/',
  '/markdown.html',
  '/manifest.json',
  '/vo-icon.svg',
  '/velocityone-studio-logo.png',
  '/greenfield.svg',
  '/brownfield.svg',
  '/markdown/css/base.css',
  '/markdown/css/dashboard.css',
  '/markdown/css/editor.css',
  '/markdown/css/layout.css',
  '/markdown/css/modals.css',
  '/markdown/css/tree.css',
  '/markdown/css/working-tree.css',
  '/markdown/css/mobile-pwa.css',
  '/markdown/js/state.js?v=9',
  '/markdown/js/telemetry.js?v=9',
  '/markdown/js/storage-api.js?v=10',
  '/markdown/js/gmail.js?v=10',
  '/markdown/js/tree.js?v=10',
  '/markdown/js/editor-preview.js?v=9',
  '/markdown/js/workflow-modal.js?v=9',
  '/markdown/js/drawer.js?v=9',
  '/markdown/js/dashboard.js?v=9',
  '/markdown/js/working-tree.js?v=9',
  '/markdown/js/agents.js?v=9',
  '/markdown/js/app.js?v=9',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[PWA SW] Pre-caching partial failure (assets will be cached on demand):', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Network-First for API requests (/api/*) and HTML navigation
  if (url.pathname.startsWith('/api/') || req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200 && req.method === 'GET') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => {
          return caches.match(req).then((cached) => {
            if (cached) return cached;
            if (req.mode === 'navigate') {
              return caches.match('/markdown.html');
            }
          });
        })
    );
    return;
  }

  // Cache-First for static fonts, scripts, and stylesheets
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200 && req.method === 'GET') {
            const clone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return networkRes;
        })
        .catch((err) => {
          // If offline and request is an image or script, fail quietly
          return cached;
        });
    })
  );
});
