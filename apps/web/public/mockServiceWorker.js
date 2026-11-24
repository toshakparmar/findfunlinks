/*
 * Mock Service Worker Stub / Self-Unregister Script
 * Automatically unregisters any lingering service workers from previous local projects.
 */
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => {
        clients.forEach((client) => {
          if (client.url && 'navigate' in client) {
            client.navigate(client.url);
          }
        });
      }),
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through all requests directly to network
  event.respondWith(fetch(event.request));
});
