const CACHE_NAME = 'cnic-search-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192x192.png',
    '/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap'
];

// Install event: Cache essential files
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('Cache open failed:', err);
                // Skip waiting to ensure the new service worker activates
                self.skipWaiting();
            })
    );
});

// Fetch event: Serve cached content or fetch from network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.log('Serving from cache:', event.request.url);
                    return response;
                }
                console.log('Fetching from network:', event.request.url);
                return fetch(event.request)
                    .catch(err => {
                        console.error('Fetch failed:', err);
                        if (event.request.mode === 'navigate') {
                            console.log('Falling back to index.html');
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

// Activate event: Clean up old caches and claim clients
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            ).then(() => {
                console.log('Cache cleanup completed');
                // Claim clients to ensure the new service worker takes control
                return self.clients.claim();
            });
        })
    );
});