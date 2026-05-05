const CACHE_NAME = 'classic-el-assima-v2';
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
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
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
