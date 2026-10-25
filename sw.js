// Service worker: caches only the app shell. Study files (Cloudinary), Firebase data and auth are NEVER cached.
const V = "avcoe-v1", SHELL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
const LIBS = ["cdnjs.cloudflare.com", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET") return;
  // App pages: network first (so updates arrive), cache as offline fallback
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("./index.html"))));
    return;
  }
  // Static libraries/fonts: cache first
  if (LIBS.includes(u.hostname)) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })));
  }
  // everything else (Firebase, Cloudinary files) goes straight to network, not cached
});
