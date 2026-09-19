const CACHE_NAME = "maran-portfolio-v1.0.5";

const CORE_ASSETS = [
  "/",
  "index.html",
  "style/style.css",
  "script/script.js",
  "manifest.json",
  "assert/project_image/MM-logo.png"
];

// Install new service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );

  // IMPORTANT:
  // Don't skipWaiting here.
  // New SW should wait until user clicks Refresh.
});

// Activate and remove old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Fetch
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Only handle your own website
  if (url.origin !== self.location.origin) return;

  // HTML → Network first
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put("/index.html", responseClone);
          });

          return response;
        })
        .catch(() => {
          return caches.match("/index.html");
        })
    );

    return;
  }

  // CSS / JS / images → Cache first
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((response) => {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
      );
    })
  );
});