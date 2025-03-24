const CACHE_NAME = "travelerscomm-pwa-cache-v1";
const urlsToCache = ["/", "/index.html", "/static/js/bundle.js"];

// Install Service Worker & Cache Files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate Event - Clean Up Old Caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of all pages
});

// Fetch Event - Serve From Cache, Fallback to Network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          console.error(
            "Fetch failed; returning cached resource:",
            event.request.url
          );
        })
      );
    })
  );
});
