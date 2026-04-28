const CACHE_NAME = 'rotina-bebe-v2';
const APP_SHELL = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png', '/icons/apple-touch-icon.png'];

const shouldCacheResponse = (response) => response && response.ok && response.type !== 'opaque';

const cacheResponse = async (request, response) => {
  if (!shouldCacheResponse(response)) return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('rotina-bebe-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const { request } = event;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await cacheResponse('/index.html', response);
          return response;
        })
        .catch(async () => (await caches.match('/index.html')) || Response.error())
    );
    return;
  }

  if (['script', 'style', 'worker'].includes(request.destination)) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          await cacheResponse(request, response);
          return response;
        })
        .catch(async () => (await caches.match(request)) || Response.error())
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).then(async (response) => {
        await cacheResponse(request, response);
        return response;
      });
    })
  );
});
