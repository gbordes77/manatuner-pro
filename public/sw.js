// SW Killer - This service worker replaces any old SW, clears caches, and unregisters itself
// Deploy this to fix browsers stuck on old cached versions

self.addEventListener('install', () => {
  // Take control immediately, don't wait for old SW
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  event.waitUntil(
    (async () => {
      // 1. Clear ALL caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((name) => {
          console.log(`[SW Killer] Deleting cache: ${name}`);
          return caches.delete(name);
        })
      );
      console.log('[SW Killer] All caches cleared');

      // 2. Unregister this service worker
      await self.registration.unregister();
      console.log('[SW Killer] Service Worker unregistered');

      // 3. Force reload all open tabs/windows
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        console.log('[SW Killer] Reloading client:', client.url);
        client.navigate(client.url);
      });
    })()
  );
});

// Intercept all fetch requests and pass them through to network
// This ensures no caching happens during the brief time this SW is active
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
