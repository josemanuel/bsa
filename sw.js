/* BSA Manager — Service Worker (caché local básica para uso offline / instalación) */
const CACHE = "bsa-manager-v1.3";
const ASSETS = [
  "./",
  "./index.html",
  "./ayuda.html",
  "./manifest.webmanifest",
  "./lib/pdf.min.js",
  "./lib/pdf.worker.min.js",
  "./lib/chart.umd.min.js",
  "./docs/logo_sespa.png",
  "./docs/flujograma_bsa.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req).then((res) => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
