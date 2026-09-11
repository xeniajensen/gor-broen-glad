const CACHE = "broven-v4";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  const isHtml = e.request.mode === "navigate" || e.request.destination === "document" || e.request.destination === "iframe" || /\.html$|\/$/.test(new URL(e.request.url).pathname);
  const put = res => { if (res.ok && sameOrigin) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; };
  if (isHtml) {
    // network first so updates show immediately; cache only as offline fallback
    e.respondWith(fetch(e.request).then(put).catch(() => caches.match(e.request)));
  } else {
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(put)));
  }
});
