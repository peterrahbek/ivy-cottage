// Caches the game so it works offline once it has been opened.
// Bump CACHE whenever a file changes, or phones keep the old version.
const CACHE = "ivy-cottage-v12";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png",
  "./js/util.js", "./js/tools.js", "./js/scenes.js", "./js/scenes2.js", "./js/scenes3.js", "./js/scenes4.js", "./js/scenes5.js", "./js/scenes6.js", "./js/scenes8.js",
  "./js/data.js", "./js/house.js", "./js/cafe.js", "./js/audio.js", "./js/engine.js", "./js/main.js",
];
// how long to wait for the network before falling back to the cached copy
const PATIENCE = 2500;

// Fetch past the browser's HTTP cache (GitHub Pages lets it keep files for
// ten minutes), so a new version arrives as one consistent set of files.
const fresh = (url) => fetch(new Request(url, { cache: "no-cache", credentials: "same-origin" }));

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(ASSETS.map((u) => fresh(u).then((r) => { if (r.ok) return c.put(u, r); }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network first so updates show up, but never wait more than PATIENCE on a
// weak connection when a cached copy exists. Only page loads fall back to
// index.html; any other missing file is reported as missing.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const isPage = req.mode === "navigate";
  const net = fresh(req.url);
  // keep a copy of whatever arrives (cloned before the page reads it)
  e.waitUntil(net.then((r) => {
    const copy = r.ok ? r.clone() : null;
    return copy && caches.open(CACHE).then((c) => c.put(req, copy));
  }).catch(() => {}));
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true, cacheName: CACHE });
    if (cached) {
      const slow = new Promise((res) => setTimeout(() => res(cached), PATIENCE));
      return Promise.race([net.then((r) => (r.ok ? r : cached), () => cached), slow]);
    }
    try {
      return await net;
    } catch (_) {
      if (!isPage) return Response.error();
      return (await caches.match("./index.html", { cacheName: CACHE })) || (await caches.match("./", { cacheName: CACHE })) || Response.error();
    }
  })());
});
