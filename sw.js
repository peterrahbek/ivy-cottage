// Caches the game so it works offline once it has been opened.
// Bump CACHE whenever a file changes, or phones keep the old version.
const CACHE = "ivy-cottage-v2";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png",
  "./js/util.js", "./js/tools.js", "./js/scenes.js", "./js/scenes2.js", "./js/scenes3.js", "./js/data.js",
  "./js/house.js", "./js/audio.js", "./js/engine.js", "./js/main.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first, so a new version shows up as soon as there is a connection;
// the cache answers when offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && new URL(e.request.url).origin === location.origin) {
          const copy = r.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html")))
  );
});
