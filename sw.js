// Service Worker for Golpo App - Lightweight v3.1.0
const CACHE_VERSION = 'v3.1.0';
const STATIC_CACHE = `golpo-static-${CACHE_VERSION}`;
const STORIES_CACHE = `golpo-stories-${CACHE_VERSION}`;

// Detect base path dynamically
const SW_URL = new URL(self.location.href);
let BASE_PATH = SW_URL.pathname.substring(0, SW_URL.pathname.lastIndexOf('/') + 1);
if (!BASE_PATH.endsWith('/')) BASE_PATH += '/';
if (!BASE_PATH.startsWith('/')) BASE_PATH = '/' + BASE_PATH;

// For PWA, also handle root scope
const isRootScope = BASE_PATH === '/' || BASE_PATH === './';

// Only cache essential files (minimal footprint)
const CORE_FILES = [
    BASE_PATH,
    BASE_PATH + 'index.html',
    BASE_PATH + 'style.css',
    BASE_PATH + 'script.js',
    BASE_PATH + 'animations.css',
    BASE_PATH + 'manifest.json',
    BASE_PATH + 'songs.json',
    BASE_PATH + 'stories.json'
];

// Max cached stories (text files only, small)
const MAX_CACHED_STORIES = 5;

// Install event - cache only essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            return cache.addAll(CORE_FILES).catch(() => Promise.resolve());
        }).then(() => self.skipWaiting())
    );
});

// Activate event - aggressive cleanup of old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Delete ALL old caches and image caches
                    if (!cacheName.includes(CACHE_VERSION) || 
                        cacheName.includes('images') || 
                        cacheName.includes('dynamic')) {
                        console.log('SW: Deleting cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - minimal caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (request.method !== 'GET') return;

    // Story text files - cache limited number
    if (url.pathname.endsWith('.txt') && url.pathname.includes('/stories/')) {
        event.respondWith(handleStoryRequest(request));
        return;
    }

    // Navigation requests (HTML pages) - serve index.html for story routes
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // Core files only - network first with cache fallback
    if (url.origin === location.origin) {
        event.respondWith(handleCoreRequest(request));
        return;
    }

    // External resources - NO caching (fonts/CDN load fresh)
    // This prevents storage bloat from external resources
});

// Handle story requests with limited caching
async function handleStoryRequest(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            // Cache story but limit total cached stories
            const cache = await caches.open(STORIES_CACHE);
            await limitCacheSize(cache, MAX_CACHED_STORIES);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        // Offline - try cache
        const cache = await caches.open(STORIES_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
    }
    return new Response('Story not available', { status: 404 });
}

// Handle navigation requests - serve index.html for all routes
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            return networkResponse;
        }
    } catch (error) {
        // Network failed, serve cached index.html
    }
    
    // Serve index.html from cache for client-side routing
    const cache = await caches.open(STATIC_CACHE);
    const indexUrl = new URL(BASE_PATH + 'index.html', self.location.origin);
    const cachedIndex = await cache.match(indexUrl);
    
    if (cachedIndex) {
        return cachedIndex;
    }
    
    // Fallback: try to fetch index.html
    try {
        const indexResponse = await fetch(indexUrl);
        if (indexResponse && indexResponse.ok) {
            cache.put(indexUrl, indexResponse.clone());
            return indexResponse;
        }
    } catch (error) {
        // Nothing we can do
    }
    
    return new Response('Not available offline', { status: 404 });
}

// Handle core requests - network first, only cache allowlisted files
async function handleCoreRequest(request) {
    const url = new URL(request.url);
    const isCoreFile = CORE_FILES.some(file => 
        url.pathname === file || url.pathname.endsWith(file.replace(BASE_PATH, '/'))
    );
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            // Only cache if it's a core file (prevents unbounded cache growth)
            if (isCoreFile) {
                const cache = await caches.open(STATIC_CACHE);
                cache.put(request, networkResponse.clone());
            }
            return networkResponse;
        }
    } catch (error) {
        // Offline fallback
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
    }
    return new Response('Not available offline', { status: 404 });
}

// Limit cache size to prevent storage bloat
async function limitCacheSize(cache, maxItems) {
    const keys = await cache.keys();
    if (keys.length >= maxItems) {
        // Delete oldest entries
        const deleteCount = keys.length - maxItems + 1;
        for (let i = 0; i < deleteCount; i++) {
            await cache.delete(keys[i]);
        }
    }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
    const { action } = event.data || {};
    
    switch (action) {
        case 'CLEAR_ALL_CACHES':
            caches.keys().then(names => {
                Promise.all(names.map(name => caches.delete(name)))
                    .then(() => {
                        if (event.ports[0]) {
                            event.ports[0].postMessage({ success: true });
                        }
                    });
            });
            break;
            
        case 'GET_CACHE_SIZE':
            getCacheSize().then(size => {
                if (event.ports[0]) {
                    event.ports[0].postMessage({ size });
                }
            });
            break;
            
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
    }
});

// Get approximate cache size
async function getCacheSize() {
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        totalSize += keys.length;
    }
    
    return totalSize;
}
