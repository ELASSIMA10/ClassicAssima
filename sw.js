const CACHE_NAME = 'classic-el-assima-v13';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './images.png',
  './bg.jpeg'
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
  const url = new URL(event.request.url);
  
  // Si c'est une requête de Range (souvent pour l'audio/vidéo), 
  // on laisse le navigateur gérer directement sans passer par le cache.
  // Cela évite les problèmes de mémoire et les erreurs de buffer sur mobile.
  if (event.request.headers.get('range')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Pour les fichiers média, si on n'a pas de réponse en cache, on fait un fetch normal
        return response || fetch(event.request);
      })
  );
});
