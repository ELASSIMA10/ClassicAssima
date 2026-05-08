const CACHE_NAME = 'classic-el-assima-offline-v23';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest_v23.json',
  './images.png',
  './bg.jpeg',
  './icon_v21.jpeg',
  // Ajout des chansons pour le mode hors-ligne
  "./Medina d'alger.mp3",
  "./El Assima - Men Matar l’Matar ( Album Classic ) - El Assima.mp3",
  "./El Assima - Defra دفرة - Abdelghani Yaddaden.mp3",
  "./أرفد صباطك و أمشي - EL ASSIMA.mp3",
  "./El Assima – بالاتحاد عاليين.mp4"
];

self.addEventListener('install', event => {
  self.skipWaiting();
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
      self.clients.claim(),
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
  if (event.request.headers.get('range')) {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request.url);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
