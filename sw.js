
// Service Worker for Golpo App - Enhanced Offline Reading Support
const CACHE_VERSION = 'v1.3.0';
const STATIC_CACHE = `golpo-static-${CACHE_VERSION}`;
const STORIES_CACHE = `golpo-stories-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `golpo-dynamic-${CACHE_VERSION}`;
const IMAGES_CACHE = `golpo-images-${CACHE_VERSION}`;

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

// External resources to cache
const EXTERNAL_RESOURCES = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Cache timeout duration (24 hours)
const CACHE_TIMEOUT = 24 * 60 * 60 * 1000;

// Install event - cache core files and external resources
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        Promise.all([
            // Cache core application files
            caches.open(STATIC_CACHE).then((cache) => {
                console.log('[SW] Caching core files');
                return cache.addAll(CORE_FILES).catch((error) => {
                    console.warn('[SW] Failed to cache some core files:', error);
                    // Don't fail the entire install if some files can't be cached
                    return Promise.resolve();
                });
            }),
            // Cache external resources
            caches.open(DYNAMIC_CACHE).then((cache) => {
                console.log('[SW] Caching external resources');
                return Promise.all(
                    EXTERNAL_RESOURCES.map(url => 
                        cache.add(url).catch(err => {
                            console.warn('[SW] Failed to cache external resource:', url, err);
                        })
                    )
                );
            }),
            // Initialize other caches
            caches.open(STORIES_CACHE),
            caches.open(IMAGES_CACHE)
        ]).then(() => {
            console.log('[SW] Installation complete');
            // Force activation of new service worker
            return self.skipWaiting();
        })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete caches that don't match current version
                        if (!cacheName.includes(CACHE_VERSION)) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Take control of all pages immediately
            self.clients.claim()
        ]).then(() => {
            console.log('[SW] Activation complete');
        })
    );
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle story text files - Network first, then cache
    if (url.pathname.endsWith('.txt') && url.pathname.includes('/stories/')) {
        event.respondWith(handleStoryRequest(request));
        return;
    }

    // Handle images - Cache first, then network
    if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(url.pathname)) {
        event.respondWith(handleImageRequest(request));
        return;
    }

    // Handle fonts - Cache first
    if (request.destination === 'font' || /\.(woff|woff2|ttf|otf|eot)$/i.test(url.pathname)) {
        event.respondWith(handleFontRequest(request));
        return;
    }

    // Handle core app files - Cache first with network update
    if (CORE_FILES.some(file => url.pathname === file || url.pathname.endsWith(file))) {
        event.respondWith(handleCoreFileRequest(request));
        return;
    }

    // Handle external resources (fonts, CDNs) - Stale-while-revalidate
    if (url.origin !== location.origin) {
        event.respondWith(handleExternalRequest(request));
        return;
    }

    // Handle other same-origin requests - Network first, then cache
    if (url.origin === location.origin) {
        event.respondWith(handleDynamicRequest(request));
        return;
    }
});

// Network-first strategy for stories (fresh content preferred)
async function handleStoryRequest(request) {
    const cache = await caches.open(STORIES_CACHE);
    
    try {
        // Try network first for fresh content
        const networkResponse = await fetchWithTimeout(request, 5000);
        
        if (networkResponse && networkResponse.ok) {
            // Cache the fresh story with timestamp
            const responseToCache = networkResponse.clone();
            await cacheWithMetadata(cache, request, responseToCache);
            return networkResponse;
        }
        
        // If network fails, try cache
        const cachedResponse = await getCachedResponse(cache, request);
        if (cachedResponse) {
            console.log('[SW] Serving story from cache:', request.url);
            return cachedResponse;
        }
        
        return createErrorResponse('Story not available offline');
        
    } catch (error) {
        // Network failed, try cache
        const cachedResponse = await getCachedResponse(cache, request);
        
        if (cachedResponse) {
            console.log('[SW] Network failed, serving story from cache:', request.url);
            return cachedResponse;
        }
        
        return createErrorResponse('Story not available offline');
    }
}

// Cache-first strategy for core files with background update
async function handleCoreFileRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached response immediately
    if (cachedResponse) {
        // Update cache in background
        fetchAndCache(cache, request).catch(() => {});
        return cachedResponse;
    }
    
    // If not in cache, fetch from network
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return createErrorResponse('App files not available offline');
    }
}

// Cache-first strategy for images
async function handleImageRequest(request) {
    const cache = await caches.open(IMAGES_CACHE);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return createPlaceholderImageResponse();
    }
}

// Cache-first strategy for fonts
async function handleFontRequest(request) {
    const cache = await caches.open(STATIC_CACHE);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return new Response('Font not available', { status: 404 });
    }
}

// Stale-while-revalidate strategy for external resources
async function handleExternalRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Return cached response and update in background
    if (cachedResponse) {
        fetchAndCache(cache, request).catch(() => {});
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return cachedResponse || new Response('Resource not available', { status: 404 });
    }
}

// Network-first strategy for dynamic content
async function handleDynamicRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await cache.match(request);
        return cachedResponse || createErrorResponse('Content not available');
    }
}

// Utility: Fetch with timeout
async function fetchWithTimeout(request, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Utility: Cache with metadata
async function cacheWithMetadata(cache, request, response) {
    const metadata = {
        timestamp: Date.now(),
        url: request.url
    };
    
    const headers = new Headers(response.headers);
    headers.set('X-Cache-Timestamp', metadata.timestamp.toString());
    
    const modifiedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: headers
    });
    
    await cache.put(request, modifiedResponse);
}

// Utility: Get cached response with freshness check
async function getCachedResponse(cache, request) {
    const response = await cache.match(request);
    
    if (!response) return null;
    
    // Check cache freshness
    const timestamp = response.headers.get('X-Cache-Timestamp');
    if (timestamp) {
        const age = Date.now() - parseInt(timestamp);
        if (age > CACHE_TIMEOUT) {
            console.log('[SW] Cached response is stale:', request.url);
            // Still return it, but it's marked as stale
        }
    }
    
    return response;
}

// Utility: Fetch and cache in background
async function fetchAndCache(cache, request) {
    try {
        const response = await fetch(request);
        if (response && response.ok) {
            await cache.put(request, response.clone());
        }
    } catch (error) {
        console.warn('[SW] Background fetch failed:', request.url, error);
    }
}

// Create error response
function createErrorResponse(message) {
    return new Response(
        JSON.stringify({ error: message }), 
        { 
            status: 404, 
            headers: { 'Content-Type': 'application/json' } 
        }
    );
}

// Create placeholder image response (1x1 transparent PNG)
function createPlaceholderImageResponse() {
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
        headers: { 
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000'
        }
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

        case 'CLEAR_ALL_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            });
            break;

        case 'GET_CACHE_SIZE':
            getCacheSize().then((size) => {
                event.ports[0].postMessage({ size });
            });
            break;

        case 'SKIP_WAITING':
            self.skipWaiting();
            event.ports[0].postMessage({ success: true });
            break;
    }
});

// Manually cache a story
async function cacheStory(url) {
    const cache = await caches.open(STORIES_CACHE);
    const response = await fetch(url);
    
    if (response.ok) {
        await cacheWithMetadata(cache, new Request(url), response);
        console.log('[SW] Story cached successfully:', url);
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
    console.log('[SW] Stories cache cleared');
}

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
    console.log('[SW] All caches cleared');
}

// Get total cache size (estimate)
async function getCacheSize() {
    let totalSize = 0;
    const cacheNames = await caches.keys();
    
    for (const name of cacheNames) {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalSize += blob.size;
            }
        }
    }
    
    return totalSize;
}

// Periodic cache cleanup (run on activation)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        cleanupOldCaches().then(() => {
            console.log('[SW] Cache cleanup complete');
        })
    );
});

async function cleanupOldCaches() {
    const cache = await caches.open(STORIES_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
        const response = await cache.match(request);
        const timestamp = response.headers.get('X-Cache-Timestamp');
        
        if (timestamp) {
            const age = Date.now() - parseInt(timestamp);
            // Remove entries older than 30 days
            if (age > 30 * 24 * 60 * 60 * 1000) {
                await cache.delete(request);
                console.log('[SW] Removed old cache entry:', request.url);
            }
        }
    }
}

console.log('[SW] Service Worker loaded - Version:', CACHE_VERSION);
