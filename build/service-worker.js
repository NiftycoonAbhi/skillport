self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting(); // Activate immediately
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activated!');
});

self.addEventListener('fetch', (event) => {
  // Basic fetch handling (cache-first)
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
