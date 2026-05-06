const CACHE_NAME = 'classic-el-assima-v5';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './images.png',
  './bg.jpeg',
  './Medina d\'alger.mp3',
  './El Assima - Defra دفرة - Abdelghani Yaddaden.mp3',
  './أرفد صباطك و أمشي - EL ASSIMA.mp3',
  './El Assima – بالاتحاد عاليين.mp4'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force le nouveau SW à s'activer immédiatement
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Permet au SW de prendre le contrôle des pages immédiatement
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
