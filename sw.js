// Service Worker for Golpo App - Offline Reading Support
const CACHE_NAME = 'golpo-v1.2.0';
const STATIC_CACHE = 'golpo-static-v1.2.0';
const STORIES_CACHE = 'golpo-stories-v1.2.0';

// Core app files to cache
const CORE_FILES = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/assets/logo.png',
    '/assets/English_font.otf',
    '/assets/Bangla_font.ttf'
];

// Install event - cache core files
self.addEventListener('install', (event) => {
    event.waitUntil(
        Promise.all([
            // Cache core application files
            caches.open(STATIC_CACHE).then((cache) => {
                return cache.addAll(CORE_FILES).catch((error) => {
                    console.warn('Failed to cache some core files:', error);
                    // Don't fail the entire install if some files can't be cached
                    return Promise.resolve();
                });
            }),
            // Cache stories separately
            caches.open(STORIES_CACHE)
        ]).then(() => {
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== STORIES_CACHE && 
                            cacheName !== CACHE_NAME) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ])
    );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle story text files
    if (url.pathname.endsWith('.txt') && url.pathname.includes('/stories/')) {
        event.respondWith(handleStoryRequest(request));
        return;
    }

    // Handle core app files
    if (CORE_FILES.some(file => url.pathname === file || url.pathname.endsWith(file))) {
        event.respondWith(handleCoreFileRequest(request));
        return;
    }

    // Handle other requests (images, fonts, etc.)
    if (url.origin === location.origin) {
        event.respondWith(handleAssetRequest(request));
        return;
    }

    // For external requests (fonts, CDNs), try network first, then cache
    event.respondWith(
        fetch(request).catch(() => {
            return caches.match(request);
        })
    );
});

// Handle story file requests with caching
async function handleStoryRequest(request) {
    const cache = await caches.open(STORIES_CACHE);
    
    try {
        // Try network first for fresh content
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache the fresh story
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        // If network fails, try cache
        return await cache.match(request) || createErrorResponse('Story not available offline');
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        return createErrorResponse('Story not available offline');
    }
}

// Handle core app files with cache-first strategy
async function handleCoreFileRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return createErrorResponse('App files not available offline');
    }
}

// Handle asset requests (images, fonts)
async function handleAssetRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    
    try {
        // Try cache first for assets
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // If not in cache, try network
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
        
    } catch (error) {
        // Return a placeholder or error response for failed assets
        if (request.url.includes('.png') || request.url.includes('.jpg') || request.url.includes('.jpeg')) {
            return createPlaceholderImageResponse();
        }
        return new Response('Asset not available', { status: 404 });
    }
}

// Create error response for failed requests
function createErrorResponse(message) {
    return new Response(
        JSON.stringify({ error: message }), 
        { 
            status: 404, 
            headers: { 'Content-Type': 'application/json' } 
        }
    );
}

// Create placeholder image response
function createPlaceholderImageResponse() {
    // Simple 1x1 transparent pixel as placeholder
    const pixels = new Uint8Array([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4,
        0x89, 0x00, 0x00, 0x00, 0x0B, 0x49, 0x44, 0x41,
        0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00,
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE,
        0x42, 0x60, 0x82
    ]);
    
    return new Response(pixels, {
        status: 200,
        headers: { 'Content-Type': 'image/png' }
    });
}

// Message handling for cache management
self.addEventListener('message', (event) => {
    const { action, data } = event.data;
    
    switch (action) {
        case 'CACHE_STORY':
            cacheStory(data.url).then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch((error) => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CHECK_CACHE':
            checkCacheStatus(data.url).then((cached) => {
                event.ports[0].postMessage({ cached });
            });
            break;
            
        case 'CLEAR_CACHE':
            clearStoriesCache().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;
    }
});

// Manually cache a story
async function cacheStory(url) {
    const cache = await caches.open(STORIES_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
        await cache.put(url, response);
    } else {
        throw new Error('Failed to fetch story for caching');
    }
}

// Check if story is cached
async function checkCacheStatus(url) {
    const cache = await caches.open(STORIES_CACHE);
    const response = await cache.match(url);
    return !!response;
}

// Clear stories cache
async function clearStoriesCache() {
    const cache = await caches.open(STORIES_CACHE);
    const keys = await cache.keys();
    await Promise.all(keys.map(key => cache.delete(key)));
}
