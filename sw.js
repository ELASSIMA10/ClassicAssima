const CACHE_NAME = 'classic-el-assima-v10';
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
  
  if (event.request.headers.get('range') && (url.pathname.endsWith('.mp3') || url.pathname.endsWith('.mp4'))) {
    event.respondWith(handleRangeRequest(event.request));
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});

async function handleRangeRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request.url);
  
  if (!cachedResponse) {
    return fetch(request);
  }

  const rangeHeader = request.headers.get('range');
  const rangeMatch = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
  const pos = Number(rangeMatch[1]);
  const end = rangeMatch[2] ? Number(rangeMatch[2]) : undefined;
  
  const buffer = await cachedResponse.arrayBuffer();
  const totalLength = buffer.byteLength;
  const effectiveEnd = end !== undefined ? end : totalLength - 1;
  const chunk = buffer.slice(pos, effectiveEnd + 1);

  return new Response(chunk, {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': cachedResponse.headers.get('Content-Type'),
      'Content-Range': `bytes ${pos}-${effectiveEnd}/${totalLength}`,
      'Content-Length': chunk.byteLength,
      'Accept-Ranges': 'bytes'
    }
  });
}
