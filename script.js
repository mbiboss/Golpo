(function initializeBasePath() {
    const htmlElement = document.documentElement;
    const configuredPath = htmlElement.getAttribute('data-base-path');
    let appRoot = configuredPath || '/';
    if (!appRoot.endsWith('/')) {
        appRoot = appRoot + '/';
    }
    const baseTag = document.createElement('base');
    baseTag.href = appRoot;
    document.head.insertBefore(baseTag, document.head.firstChild);

    const basePath = (function getBasePath() {
        const baseElement = document.querySelector('base');
        if (baseElement && baseElement.href) {
            const base = new URL(baseElement.href);
            return base.pathname;
        }
        return appRoot;
    })();

    const manifestLink = document.createElement('link');
    manifestLink.rel = 'manifest';
    manifestLink.href = basePath + 'manifest.json';
    document.head.appendChild(manifestLink);

    const favicon32 = document.createElement('link');
    favicon32.rel = 'icon';
    favicon32.type = 'image/png';
    favicon32.sizes = '32x32';
    favicon32.href = '/assets/logo.png';
    document.head.appendChild(favicon32);

    const favicon16 = document.createElement('link');
    favicon16.rel = 'icon';
    favicon16.type = 'image/png';
    favicon16.sizes = '16x16';
    favicon16.href = '/assets/logo.png';
    document.head.appendChild(favicon16);

    const shortcutIcon = document.createElement('link');
    shortcutIcon.rel = 'shortcut icon';
    shortcutIcon.href = '/assets/logo.png';
    document.head.appendChild(shortcutIcon);
})();

function getBasePath() {
    const baseElement = document.querySelector('base');
    if (baseElement && baseElement.href) {
        const base = new URL(baseElement.href);
        return base.pathname;
    }
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const src = scripts[i].src;
        if (src && src.includes('script.js')) {
            try {
                const scriptUrl = new URL(src);
                const scriptPath = scriptUrl.pathname;
                return scriptPath.substring(0, scriptPath.lastIndexOf('/') + 1);
            } catch (e) {}
        }
    }
    let pathname = window.location.pathname;
    if (pathname.endsWith('/index.html')) {
        return pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }
    if (pathname.endsWith('/')) {
        return pathname;
    }
    const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
    if (lastSegment.includes('.')) {
        return pathname.substring(0, pathname.lastIndexOf('/') + 1);
    }
    return pathname + '/';
}

const BASE_PATH = getBasePath();

var splashScreenDismissed = false;
var currentTheme = 'dark';
var currentStory = '';
var currentFontSize = 100;
var isFocusMode = false;
var storyBookmarks = {};
var isAutoScrolling = false;
var autoScrollSpeed = 3;
var autoScrollInterval = null;
var currentPage = 1;
var totalPages = 1;
var linesPerPage = 100;
var storyPages = [];
var storyPageWeights = [];
var isStoryCompleted = false;
var isOnline = navigator.onLine;
var serviceWorkerRegistration = null;
var cachedStories = new Set();
var offlineIndicator = null;
var musicPlaylist = [];
var currentMusicIndex = 0;
var isPlaylistMode = true;
var autoplayEnabled = true;
var currentBannerImage = '';
var currentReadingImage = '';
var defaultImages = {
    banner: 'https://i.postimg.cc/wMDMfnhn/static.png',
    reading: 'https://i.postimg.cc/wMDMfnhn/static.png'
};
var storyDatabase = {};
var slugToFilename = {};
var isYouTubePlaying = false;
var currentYouTubeUrl = '';
var mainAppInitialized = false;
var favoriteStories = [];
var deferredPrompt = null;
var footerTapCount = 0;
var footerTapTimeout = null;

function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notificationContainer');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span class="notification-text">${message}</span>
    `;

    container.appendChild(notification);

    if (typeof addNotificationToHistory === 'function') {
        addNotificationToHistory(message, type);
    }

    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Global click particles effect for entire website
(function initGlobalClickParticles() {
    const globalClickContainer = document.getElementById('globalClickParticles');
    if (!globalClickContainer) return;
    
    function createClickParticles(x, y) {
        const particleCount = 8;
        const colors = ['#a855f7', '#ec4899', '#6366f1'];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'click-particle';
            
            const angle = (i / particleCount) * Math.PI * 2;
            const velocity = 80 + Math.random() * 60;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.setProperty('--vx', vx + 'px');
            particle.style.setProperty('--vy', vy + 'px');
            particle.style.animation = 'clickBurst 0.8s ease-out forwards';
            
            globalClickContainer.appendChild(particle);
            
            setTimeout(() => particle.remove(), 800);
        }
    }
    
    document.addEventListener('click', (e) => {
        createClickParticles(e.clientX, e.clientY);
    });
    
    document.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        createClickParticles(touch.clientX, touch.clientY);
    });
})();

// Ambient background particles
(function initAmbientParticles() {
    const ambientParticles = document.getElementById('ambientParticles');
    if (!ambientParticles) return;
    
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'ambient-particle';
        const startX = Math.random() * 100;
        const randomDrift = (Math.random() - 0.5) * 150;
        particle.style.left = `${startX}%`;
        particle.style.bottom = '-20px';
        particle.style.setProperty('--tx', `${randomDrift}px`);
        particle.style.animationDelay = `${Math.random() * 8}s`;
        particle.style.animationDuration = `${10 + Math.random() * 6}s`;
        ambientParticles.appendChild(particle);
    }
})();

(function initSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (!splashScreen) return;

    const particlesContainer = document.getElementById('splashParticles');

    // Create flowing particles on splash screen
    if (particlesContainer) {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            const startX = Math.random() * 100;
            const randomDrift = (Math.random() - 0.5) * 100;
            particle.style.left = `${startX}%`;
            particle.style.setProperty('--tx', `${randomDrift}px`);
            particle.style.animationDelay = `${Math.random() * 6}s`;
            particle.style.animationDuration = `${5 + Math.random() * 3}s`;
            particlesContainer.appendChild(particle);
        }
    }

    function hideSplashScreen() {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            splashScreenDismissed = true;
            if (autoplayEnabled && musicPlaylist.length > 0) {
                setTimeout(() => startAutoplay(), 1000);
            }
        }, 1000);
    }

    splashScreen.addEventListener('click', hideSplashScreen);
    splashScreen.addEventListener('touchstart', hideSplashScreen);
})();

async function loadMusicPlaylist() {
    try {
        const response = await fetch('songs.json');
        if (response.ok) {
            musicPlaylist = await response.json();
            console.log('Music playlist loaded:', musicPlaylist.length, 'songs');
        }
    } catch (error) {
        console.error('Error loading music playlist:', error);
    }
}

async function loadStoryDatabase() {
    try {
        const response = await fetch('stories.json');
        if (response.ok) {
            storyDatabase = await response.json();
            console.log('Story database loaded:', Object.keys(storyDatabase).length, 'stories');
            detectStoryParts();
            buildSlugLookup();
        }
    } catch (error) {
        console.error('Error loading story database:', error);
    }
}

async function loadAppSettings() {
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            const settings = await response.json();
            
            if (settings.autoplay_enabled !== undefined) {
                autoplayEnabled = settings.autoplay_enabled;
                console.log('Autoplay setting loaded from server:', autoplayEnabled);
            }
            
            if (settings.default_theme) {
                currentTheme = settings.default_theme;
                document.body.setAttribute('data-theme', currentTheme);
                const icons = { dark: 'fa-moon', light: 'fa-sun', sepia: 'fa-book', 'dark-sepia': 'fa-adjust' };
                if (themeToggle) {
                    themeToggle.innerHTML = `<i class="fas ${icons[currentTheme]}"></i>`;
                }
            }
            
            if (settings.default_font_size) {
                currentFontSize = parseInt(settings.default_font_size);
            }
            
            if (settings.enable_animations !== undefined) {
                if (!settings.enable_animations) {
                    document.body.classList.add('no-animations');
                }
            }
            
            return settings;
        }
    } catch (error) {
        console.error('Error loading app settings:', error);
        const localSetting = localStorage.getItem('golpoAutoplayMusic');
        if (localSetting !== null) {
            autoplayEnabled = JSON.parse(localSetting);
        }
    }
}

function buildSlugLookup() {
    slugToFilename = {};
    Object.keys(storyDatabase).forEach(filename => {
        const story = storyDatabase[filename];
        if (story.id) {
            slugToFilename[story.id] = filename;
        }
    });
}

function getFilenameFromSlug(slug) {
    return slugToFilename[slug] || null;
}

function getSlugFromFilename(filename) {
    const story = storyDatabase[filename];
    return story ? story.id : null;
}

function detectStoryParts() {
    const storyGroups = {};
    const allFiles = Object.keys(storyDatabase);

    allFiles.forEach(filename => {
        const match = filename.match(/^(.+?)[-_]?(\d+)\.txt$/);
        if (match) {
            const baseName = match[1];
            const partNumber = parseInt(match[2]);
            if (!storyGroups[baseName]) storyGroups[baseName] = [];
            storyGroups[baseName].push({ filename, partNumber });
            const baseFile = baseName + '.txt';
            if (allFiles.includes(baseFile) && !storyGroups[baseName].find(p => p.filename === baseFile)) {
                storyGroups[baseName].push({ filename: baseFile, partNumber: 1 });
            }
        } else if (filename.match(/^(.+?)\.txt$/)) {
            const baseName = filename.replace('.txt', '');
            const numberedFiles = allFiles.filter(f => f.match(new RegExp(`^${baseName}[-_]?(\\d+)\\.txt$`)));
            if (numberedFiles.length > 0) {
                if (!storyGroups[baseName]) storyGroups[baseName] = [];
                if (!storyGroups[baseName].find(p => p.filename === filename)) {
                    storyGroups[baseName].push({ filename, partNumber: 1 });
                }
                numberedFiles.forEach(f => {
                    const numMatch = f.match(/^.+?[-_]?(\d+)\.txt$/);
                    if (numMatch && !storyGroups[baseName].find(p => p.filename === f)) {
                        storyGroups[baseName].push({ filename: f, partNumber: parseInt(numMatch[1]) });
                    }
                });
            }
        }
    });

    Object.keys(storyGroups).forEach(baseName => {
        const parts = storyGroups[baseName];
        if (parts.length > 1) {
            parts.sort((a, b) => a.partNumber - b.partNumber);
            const totalParts = parts.length;
            const seriesName = baseName.charAt(0).toUpperCase() + baseName.slice(1) + '-Series';
            parts.forEach((part, index) => {
                const story = storyDatabase[part.filename];
                story.partOf = seriesName;
                story.partNumber = part.partNumber;
                story.totalParts = totalParts;
                if (index > 0) story.previousPart = parts[index - 1].filename;
                if (index < parts.length - 1) story.nextPart = parts[index + 1].filename;
            });
        }
    });
}

function getBannerImageForStory(storyId) {
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    return storyEntry?.banner || defaultImages.banner;
}

function getReadingImageForStory(storyId) {
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    return storyEntry?.reading || defaultImages.reading;
}

function loadStoryImages(storyId) {
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    currentBannerImage = storyEntry?.banner || defaultImages.banner;
    currentReadingImage = storyEntry?.reading || defaultImages.reading;
}

function getStoryMetadata(filename) {
    const metadata = storyDatabase[filename] || {
        id: filename.replace('.txt', ''),
        name: 'Unknown Story',
        location: 'Unknown Location',
        writer: 'MBI Dark',
        description: 'Story description not available',
        status: 'available',
        readingTime: 0,
        wordCount: 0
    };
    loadStoryImages(metadata.id);
    return metadata;
}

function getAllStories() {
    return Object.keys(storyDatabase).map(filename => ({
        file: filename,
        ...storyDatabase[filename]
    }));
}

var musicSelector = document.getElementById('musicSelector');
var storyContent = document.getElementById('storyContent');
var playPauseBtn = document.getElementById('playPauseBtn');
var themeToggle = document.getElementById('themeToggle');
var audioPlayer = document.getElementById('audioPlayer');
var youtubeFrame = document.getElementById('youtubeFrame');
var progressFill = document.getElementById('progressFill');
var progressPercentage = document.getElementById('progressPercentage');
var progressContainer = document.getElementById('progressContainer');
var storyModal = document.getElementById('storyModal');
var musicModal = document.getElementById('musicModal');
var readingControlsDropdown = document.getElementById('readingControlsDropdown');
var readingControlsBtn = document.getElementById('readingControlsBtn');
var readingControlsMenu = document.getElementById('readingControlsMenu');
var decreaseFontBtn = document.getElementById('decreaseFontBtn');
var increaseFontBtn = document.getElementById('increaseFontBtn');
var fontSizeDisplay = document.getElementById('fontSizeDisplay');
var focusModeBtn = document.getElementById('focusModeBtn');
var scrollTopBtn = document.getElementById('scrollTopBtn');
var bookmarkBtn = document.getElementById('bookmarkBtn');
var searchInput = document.getElementById('searchInput');
var searchBtn = document.getElementById('searchBtn');
var clearSearchBtn = document.getElementById('clearSearchBtn');
var searchResults = document.getElementById('searchResults');
var autoScrollBtn = document.getElementById('autoScrollBtn');
var autoScrollControls = document.getElementById('autoScrollControls');
var scrollSpeedSlider = document.getElementById('scrollSpeedSlider');

function initializeMainApp() {
    if (mainAppInitialized) return;
    mainAppInitialized = true;
    initializeApp();
    setupOfflineIndicators();
    initializePerformanceOptimizations();
    setupEventListeners();
    loadSavedSettings();
    initSecretAnalytics();
    initializeFavoritesData();
    setupReadingControlsOutsideClick();
    initializeNavbar();
    initializeAboutPage();
    initializeAdminDashboard();
    initializeSecretTrigger();
    initializeHeroImages();

    const sharedStoryId = sessionStorage.getItem('loadSharedStory');
    if (sharedStoryId) {
        sessionStorage.removeItem('loadSharedStory');
        const storyFile = Object.keys(storyDatabase).find(filename => storyDatabase[filename].id === sharedStoryId);
        if (storyFile) {
            setTimeout(() => loadStoryFromCard(storyFile), 500);
        }
    }
}

var heroImageInterval = null;
var heroStoryImages = [];

function initializeHeroImages() {
    heroStoryImages = Object.values(storyDatabase)
        .filter(story => story.banner && story.status !== 'upcoming')
        .map(story => story.banner);

    if (heroStoryImages.length === 0) {
        heroStoryImages = [defaultImages.banner];
    }

    shuffleArray(heroStoryImages);

    const heroCard1 = document.querySelector('.hc-1');
    const heroCard2 = document.querySelector('.hc-2');
    const heroCard3 = document.querySelector('.hc-3');
    const heroImg1 = document.getElementById('heroImg1');
    const heroImg2 = document.getElementById('heroImg2');
    const heroImg3 = document.getElementById('heroImg3');

    if (heroImg1 && heroImg2 && heroImg3) {
        // Preload first set of images
        heroImg1.src = heroStoryImages[0] || defaultImages.banner;
        heroImg2.src = heroStoryImages[1 % heroStoryImages.length] || defaultImages.banner;
        heroImg3.src = heroStoryImages[2 % heroStoryImages.length] || defaultImages.banner;

        heroImg1.onerror = function() { this.src = defaultImages.banner; };
        heroImg2.onerror = function() { this.src = defaultImages.banner; };
        heroImg3.onerror = function() { this.src = defaultImages.banner; };

        let currentIndex = 0;
        
        // Preload next images
        function preloadNextImages(index) {
            const nextIndex1 = (index + 1) % heroStoryImages.length;
            const nextIndex2 = (index + 2) % heroStoryImages.length;
            const nextIndex3 = (index + 3) % heroStoryImages.length;
            
            const img1 = new Image();
            const img2 = new Image();
            const img3 = new Image();
            img1.src = heroStoryImages[nextIndex1];
            img2.src = heroStoryImages[nextIndex2];
            img3.src = heroStoryImages[nextIndex3];
        }
        
        // Preload first set
        preloadNextImages(currentIndex);
        
        heroImageInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % heroStoryImages.length;
            const nextIndex1 = currentIndex;
            const nextIndex2 = (currentIndex + 1) % heroStoryImages.length;
            const nextIndex3 = (currentIndex + 2) % heroStoryImages.length;

            // Preload next set while transitioning
            preloadNextImages(currentIndex);

            if (heroCard1) {
                requestAnimationFrame(() => {
                    heroCard1.classList.add('swipe-out');
                });
            }

            setTimeout(() => {
                requestAnimationFrame(() => {
                    heroImg1.src = heroStoryImages[nextIndex1];
                    heroImg2.src = heroStoryImages[nextIndex2];
                    heroImg3.src = heroStoryImages[nextIndex3];
                    if (heroCard1) heroCard1.classList.remove('swipe-out');
                });
            }, 600);
        }, 4000);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initializeNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });
}

function initializeAboutPage() {
    const aboutBtn = document.getElementById('aboutBtn');
    if (aboutBtn) {
        aboutBtn.addEventListener('click', toggleAbout);
    }

    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', handleNavBrandClick);
    }

    const offlineStoriesBtn = document.getElementById('offlineStoriesBtn');
    if (offlineStoriesBtn) {
        offlineStoriesBtn.addEventListener('click', showOfflineStoriesModal);
    }

    const closeOfflineStoriesModal = document.getElementById('closeOfflineStoriesModal');
    const offlineStoriesModalOverlay = document.getElementById('offlineStoriesModalOverlay');
    if (closeOfflineStoriesModal) {
        closeOfflineStoriesModal.addEventListener('click', hideOfflineStoriesModal);
    }
    if (offlineStoriesModalOverlay) {
        offlineStoriesModalOverlay.addEventListener('click', hideOfflineStoriesModal);
    }

    const downloadAllStoriesBtn = document.getElementById('downloadAllStoriesBtn');
    if (downloadAllStoriesBtn) {
        downloadAllStoriesBtn.addEventListener('click', downloadAllStories);
    }

    const clearOfflineStoriesBtn = document.getElementById('clearOfflineStoriesBtn');
    if (clearOfflineStoriesBtn) {
        clearOfflineStoriesBtn.addEventListener('click', clearOfflineStories);
    }

    updateOfflineBadge();
}

function showAbout() {
    const aboutView = document.getElementById('aboutView');
    const libraryView = document.getElementById('libraryView');
    const readerView = document.getElementById('readerView');
    const footer = document.querySelector('.site-footer');

    if (aboutView) {
        aboutView.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    if (libraryView) {
        libraryView.style.display = 'none';
    }

    if (readerView) {
        readerView.style.display = 'none';
    }

    if (footer) {
        footer.style.display = 'none';
    }

    // Update browser history
    if (window.history.state?.view !== 'about') {
        window.history.pushState({ view: 'about' }, '', BASE_PATH + 'about');
    }
}

function toggleAbout() {
    const aboutView = document.getElementById('aboutView');
    
    if (aboutView && aboutView.style.display === 'block') {
        closeAbout();
    } else {
        showAbout();
    }
}

function handleNavBrandClick() {
    const aboutView = document.getElementById('aboutView');
    const readerView = document.getElementById('readerView');
    
    // If About page is open, close it and return to library
    if (aboutView && aboutView.style.display === 'block') {
        closeAbout();
    }
    // If Reader view is open, return to library
    else if (readerView && readerView.style.display !== 'none' && readerView.style.display !== '') {
        returnToLibrary();
    }
    // Otherwise, just ensure we're on the library view
    else {
        const libraryView = document.getElementById('libraryView');
        if (libraryView) {
            libraryView.style.display = 'block';
        }
        if (window.history.state?.view !== 'library') {
            window.history.pushState({ view: 'library' }, '', BASE_PATH);
        }
    }
}

function closeAbout() {
    const aboutView = document.getElementById('aboutView');
    const libraryView = document.getElementById('libraryView');
    const footer = document.querySelector('.site-footer');

    if (aboutView) {
        aboutView.style.display = 'none';
        document.body.style.overflow = '';
    }

    if (libraryView) {
        libraryView.style.display = 'block';
    }

    if (footer) {
        footer.style.display = '';
    }

    // Update browser history to library view
    if (window.history.state?.view !== 'library') {
        window.history.pushState({ view: 'library' }, '', BASE_PATH);
    }
}
window.closeAbout = closeAbout;

function showOfflineStoriesModal() {
    const modal = document.getElementById('offlineStoriesModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        updateOfflineStoriesDisplay();
    }
}

function hideOfflineStoriesModal() {
    const modal = document.getElementById('offlineStoriesModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

async function updateOfflineStoriesDisplay() {
    const offlineCount = await getOfflineStoriesCount();
    const totalCount = Object.keys(storyDatabase).filter(f => storyDatabase[f].status !== 'upcoming').length;
    
    document.getElementById('offlineStoriesCount').textContent = offlineCount;
    document.getElementById('totalStoriesCount').textContent = totalCount;
    
    const offlineStories = await getOfflineStoriesList();
    const offlineStoriesItems = document.getElementById('offlineStoriesItems');
    
    if (offlineStories.length === 0) {
        offlineStoriesItems.innerHTML = '<p class="empty-msg">No stories available offline yet</p>';
    } else {
        offlineStoriesItems.innerHTML = offlineStories.map(filename => {
            const story = storyDatabase[filename];
            return `
                <div class="offline-story-item">
                    <i class="fas fa-check-circle"></i>
                    <span>${story ? story.name : filename}</span>
                </div>
            `;
        }).join('');
    }
}

async function getOfflineStoriesCount() {
    try {
        const cache = await caches.open('golpo-stories-v3.0.0');
        const keys = await cache.keys();
        const storyKeys = keys.filter(req => req.url.includes('/stories/') && req.url.endsWith('.txt'));
        return storyKeys.length;
    } catch (error) {
        console.error('Error getting offline stories count:', error);
        return 0;
    }
}

async function getOfflineStoriesList() {
    try {
        const cache = await caches.open('golpo-stories-v3.0.0');
        const keys = await cache.keys();
        const storyKeys = keys.filter(req => req.url.includes('/stories/') && req.url.endsWith('.txt'));
        return storyKeys.map(req => {
            const url = new URL(req.url);
            return url.pathname.split('/').pop();
        });
    } catch (error) {
        console.error('Error getting offline stories list:', error);
        return [];
    }
}

async function updateOfflineBadge() {
    const count = await getOfflineStoriesCount();
    const badge = document.getElementById('offlineBadge');
    if (badge) {
        badge.textContent = count;
    }
}

async function downloadAllStories() {
    const downloadBtn = document.getElementById('downloadAllStoriesBtn');
    const originalText = downloadBtn.innerHTML;
    
    try {
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Downloading...</span>';
        downloadBtn.disabled = true;
        
        const cache = await caches.open('golpo-stories-v3.0.0');
        const availableStories = Object.keys(storyDatabase).filter(f => storyDatabase[f].status !== 'upcoming');
        
        let successCount = 0;
        for (const filename of availableStories) {
            try {
                const response = await fetch(`stories/${filename}`);
                if (response.ok) {
                    await cache.put(`stories/${filename}`, response.clone());
                    successCount++;
                }
            } catch (error) {
                console.error(`Error downloading ${filename}:`, error);
            }
        }
        
        showNotification(`Downloaded ${successCount} of ${availableStories.length} stories for offline use`, 'success');
        await updateOfflineStoriesDisplay();
        await updateOfflineBadge();
        
    } catch (error) {
        console.error('Error downloading stories:', error);
        showNotification('Failed to download stories', 'error');
    } finally {
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    }
}

async function clearOfflineStories() {
    if (!confirm('Are you sure you want to clear all offline stories?')) {
        return;
    }
    
    try {
        const cache = await caches.open('golpo-stories-v3.0.0');
        const keys = await cache.keys();
        const storyKeys = keys.filter(req => req.url.includes('/stories/') && req.url.endsWith('.txt'));
        
        for (const key of storyKeys) {
            await cache.delete(key);
        }
        
        showNotification('Offline stories cleared successfully', 'success');
        await updateOfflineStoriesDisplay();
        await updateOfflineBadge();
        
    } catch (error) {
        console.error('Error clearing offline stories:', error);
        showNotification('Failed to clear offline stories', 'error');
    }
}

let adminStoryDatabase = {};
let adminSongsDatabase = [];
let currentAdminPassword = null;

function getAdminHeaders() {
    return {
        'Content-Type': 'application/json',
        'X-Admin-Password': currentAdminPassword || ADMIN_PASSWORD
    };
}

function initializeAdminDashboard() {
    const adminDashboard = document.getElementById('adminDashboard');
    const closeBtn = document.getElementById('closeAdminDashboard');
    const overlay = document.getElementById('adminDashboardOverlay');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeAdminDashboard);
    }
    if (overlay) {
        overlay.addEventListener('click', closeAdminDashboard);
    }

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const panelId = tab.dataset.tab + 'Panel';
            const panel = document.getElementById(panelId);
            if (panel) panel.classList.add('active');
            if (tab.dataset.tab === 'songs') refreshAdminSongs();
        });
    });

    const addStoryForm = document.getElementById('addStoryForm');
    if (addStoryForm) {
        addStoryForm.addEventListener('submit', handleAddStory);
    }

    const editStoryForm = document.getElementById('editStoryForm');
    if (editStoryForm) {
        editStoryForm.addEventListener('submit', handleEditStory);
    }

    const addSongForm = document.getElementById('addSongForm');
    if (addSongForm) {
        addSongForm.addEventListener('submit', handleAddSong);
    }

    const editSongForm = document.getElementById('editSongForm');
    if (editSongForm) {
        editSongForm.addEventListener('submit', handleEditSong);
    }

    const editCloseBtn = document.getElementById('closeEditStoryModal');
    const editOverlay = document.getElementById('editStoryModalOverlay');
    if (editCloseBtn) editCloseBtn.addEventListener('click', closeEditStoryModal);
    if (editOverlay) editOverlay.addEventListener('click', closeEditStoryModal);

    const editSongCloseBtn = document.getElementById('closeEditSongModal');
    const editSongOverlay = document.getElementById('editSongModalOverlay');
    if (editSongCloseBtn) editSongCloseBtn.addEventListener('click', closeEditSongModal);
    if (editSongOverlay) editSongOverlay.addEventListener('click', closeEditSongModal);

    const editIsPublic = document.getElementById('editIsPublic');
    if (editIsPublic) {
        editIsPublic.addEventListener('change', (e) => {
            document.getElementById('visibilityLabel').textContent = e.target.checked ? 'Public' : 'Hidden';
        });
    }

    const editSongIsPublic = document.getElementById('editSongIsPublic');
    if (editSongIsPublic) {
        editSongIsPublic.addEventListener('change', (e) => {
            document.getElementById('songVisibilityLabel').textContent = e.target.checked ? 'Public' : 'Hidden';
        });
    }

    loadAdminSettings();
}

async function loadAdminSettings() {
    const defaultSettings = {
        autoplay_enabled: autoplayEnabled || true,
        default_theme: currentTheme || 'dark',
        default_font_size: currentFontSize || 100,
        enable_animations: !document.body.classList.contains('no-animations'),
        reading_time_tracking: true
    };
    
    let settings = defaultSettings;
    
    try {
        const response = await fetch('/api/settings');
        if (response.ok) {
            settings = await response.json();
        } else {
            console.warn('API unavailable, using default settings');
        }
    } catch (error) {
        console.warn('API unavailable, using default settings:', error);
    }
    
    const autoplayMusicSetting = document.getElementById('autoplayMusicSetting');
    if (autoplayMusicSetting) {
        autoplayMusicSetting.checked = settings.autoplay_enabled || false;
        autoplayMusicSetting.addEventListener('change', async (e) => {
            await updateSetting('autoplay_enabled', e.target.checked);
        });
    }
    
    const defaultThemeSetting = document.getElementById('defaultThemeSetting');
    if (defaultThemeSetting) {
        defaultThemeSetting.value = settings.default_theme || 'dark';
        defaultThemeSetting.addEventListener('change', async (e) => {
            await updateSetting('default_theme', e.target.value);
        });
    }
    
    const defaultFontSizeSetting = document.getElementById('defaultFontSizeSetting');
    if (defaultFontSizeSetting) {
        defaultFontSizeSetting.value = settings.default_font_size || 100;
        const fontSizeValue = document.getElementById('defaultFontSizeValue');
        if (fontSizeValue) fontSizeValue.textContent = `${settings.default_font_size || 100}%`;
        
        defaultFontSizeSetting.addEventListener('input', (e) => {
            if (fontSizeValue) fontSizeValue.textContent = `${e.target.value}%`;
        });
        
        defaultFontSizeSetting.addEventListener('change', async (e) => {
            await updateSetting('default_font_size', e.target.value);
        });
    }
    
    const enableAnimationsSetting = document.getElementById('enableAnimationsSetting');
    if (enableAnimationsSetting) {
        enableAnimationsSetting.checked = settings.enable_animations !== false;
        enableAnimationsSetting.addEventListener('change', async (e) => {
            await updateSetting('enable_animations', e.target.checked);
        });
    }
    
    const readingTimeTracking = document.getElementById('readingTimeTracking');
    if (readingTimeTracking) {
        readingTimeTracking.checked = settings.reading_time_tracking !== false;
        readingTimeTracking.addEventListener('change', async (e) => {
            await updateSetting('reading_time_tracking', e.target.checked);
        });
    }
}

async function updateSetting(key, value) {
    try {
        const response = await fetch(`/api/settings/${key}`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ value })
        });
        
        if (response.ok) {
            showNotification(`Setting updated successfully`, 'success');
            if (key === 'autoplay_enabled') {
                autoplayEnabled = value;
                localStorage.setItem('golpoAutoplayMusic', JSON.stringify(value));
            } else if (key === 'default_theme') {
                currentTheme = value;
                document.body.setAttribute('data-theme', value);
            } else if (key === 'default_font_size') {
                currentFontSize = parseInt(value);
            }
        } else {
            throw new Error('Failed to update setting');
        }
    } catch (error) {
        console.error('Error updating setting:', error);
        showNotification('Failed to update setting', 'error');
    }
}

async function changeAdminPasswordFromPanel() {
    const currentPassword = document.getElementById('currentPasswordAdmin').value;
    const newPassword = document.getElementById('newPasswordAdmin').value;
    const confirmPassword = document.getElementById('confirmPasswordAdmin').value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/settings/password/change', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        if (response.ok) {
            showNotification('Password changed successfully! Please remember your new password.', 'success');
            document.getElementById('currentPasswordAdmin').value = '';
            document.getElementById('newPasswordAdmin').value = '';
            document.getElementById('confirmPasswordAdmin').value = '';
        } else {
            const data = await response.json();
            showNotification(data.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification('Failed to change password', 'error');
    }
}
window.changeAdminPasswordFromPanel = changeAdminPasswordFromPanel;

function showAdminDashboard() {
    const modal = document.getElementById('adminDashboard');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        refreshAdminStories();
        showNotification('Admin Dashboard opened', 'info');
    }
}

function closeAdminDashboard() {
    const modal = document.getElementById('adminDashboard');
    const overlay = document.getElementById('adminDashboardOverlay');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    if (overlay) {
        overlay.style.display = 'none';
    }
}

async function refreshAdminStories() {
    const list = document.getElementById('adminStoriesList');
    if (!list) return;

    try {
        const response = await fetch('/api/stories');
        if (!response.ok) throw new Error('Failed to fetch stories');
        adminStoryDatabase = await response.json();
    } catch (error) {
        console.warn('API unavailable, using local story database:', error);
        adminStoryDatabase = storyDatabase;
    }

    try {
        const stories = Object.keys(adminStoryDatabase).map(filename => ({
            file: filename,
            ...adminStoryDatabase[filename]
        }));

        list.innerHTML = stories.map((story, index) => `
            <div class="admin-story-item ${story.isPublic === false ? 'hidden-story' : ''}" data-filename="${story.file}" data-index="${index}">
                <div class="admin-item-drag-handle" data-type="story" data-id="${story.file}">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="admin-reorder-controls">
                    <button class="reorder-btn" onclick="reorderStory('${story.file}', 'up')" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="reorder-btn" onclick="reorderStory('${story.file}', 'down')" title="Move Down" ${index === stories.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <img src="${story.reading || story.banner || defaultImages.reading}" alt="${story.name}">
                <div class="admin-story-info">
                    <h5>${story.name}</h5>
                    <span>${story.category || 'Uncategorized'} - ${story.status || 'available'}</span>
                    <span class="visibility-badge ${story.isPublic === false ? 'hidden' : 'public'}">${story.isPublic === false ? 'Hidden' : 'Public'}</span>
                </div>
                <div class="admin-story-actions">
                    <button onclick="toggleStoryVisibility('${story.file}', ${story.isPublic !== false})" title="${story.isPublic === false ? 'Publish' : 'Hide'}">
                        <i class="fas fa-${story.isPublic === false ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button onclick="editStory('${story.file}')" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete" onclick="confirmDeleteStory('${story.file}')" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        initAdminDragAndDrop('story');
        if (adminStoryDatabase === storyDatabase) {
            showNotification('Loaded stories from local data', 'info');
        }
    } catch (error) {
        console.error('Error displaying stories:', error);
        showNotification('Failed to load stories', 'error');
    }
}
window.refreshAdminStories = refreshAdminStories;

async function toggleStoryVisibility(filename, currentlyPublic) {
    try {
        const response = await fetch(`/api/stories/${filename}/visibility`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ isPublic: !currentlyPublic })
        });
        if (!response.ok) throw new Error('Failed to update visibility');
        showNotification(`Story ${currentlyPublic ? 'hidden' : 'published'} successfully`, 'success');
        refreshAdminStories();
        loadStoryDatabase();
    } catch (error) {
        console.error('Error updating visibility:', error);
        showNotification('Failed to update visibility', 'error');
    }
}
window.toggleStoryVisibility = toggleStoryVisibility;

async function reorderStory(filename, direction) {
    try {
        const response = await fetch(`/api/stories/${filename}/reorder`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ direction })
        });
        if (!response.ok) throw new Error('Failed to reorder story');
        showNotification(`Story moved ${direction}`, 'success');
        refreshAdminStories();
        loadStoryDatabase();
    } catch (error) {
        console.error('Error reordering story:', error);
        showNotification('Failed to reorder story', 'error');
    }
}
window.reorderStory = reorderStory;

async function reorderSong(id, direction) {
    try {
        const response = await fetch(`/api/songs/${id}/reorder`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ direction })
        });
        if (!response.ok) throw new Error('Failed to reorder song');
        showNotification(`Song moved ${direction}`, 'success');
        refreshAdminSongs();
    } catch (error) {
        console.error('Error reordering song:', error);
        showNotification('Failed to reorder song', 'error');
    }
}
window.reorderSong = reorderSong;

function initAdminDragAndDrop(type) {
    const listId = type === 'story' ? 'adminStoriesList' : 'adminSongsList';
    const list = document.getElementById(listId);
    if (!list) return;

    const itemClass = type === 'story' ? '.admin-story-item' : '.admin-song-item';
    const items = list.querySelectorAll(itemClass);
    
    let draggedItem = null;
    let draggedOverItem = null;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;

    items.forEach(item => {
        const handle = item.querySelector('.admin-item-drag-handle');
        if (!handle) return;

        handle.addEventListener('touchstart', (e) => {
            draggedItem = item;
            startY = e.touches[0].clientY;
            item.classList.add('dragging');
            isDragging = true;
            e.preventDefault();
        }, { passive: false });

        handle.addEventListener('mousedown', (e) => {
            draggedItem = item;
            startY = e.clientY;
            item.classList.add('dragging');
            isDragging = true;
            e.preventDefault();
        });
    });

    const handleMove = (clientY) => {
        if (!isDragging || !draggedItem) return;
        
        currentY = clientY;
        const deltaY = currentY - startY;
        
        draggedItem.style.transform = `translateY(${deltaY}px) scale(1.02)`;
        draggedItem.style.zIndex = '1000';

        const items = list.querySelectorAll(itemClass);
        draggedOverItem = null;
        
        items.forEach(item => {
            if (item === draggedItem) return;
            item.classList.remove('drag-over');
            
            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            
            if (currentY >= rect.top && currentY <= rect.bottom) {
                item.classList.add('drag-over');
                draggedOverItem = item;
            }
        });
    };

    const handleEnd = async () => {
        if (!isDragging || !draggedItem) return;

        if (draggedOverItem && draggedOverItem !== draggedItem) {
            const allItems = Array.from(list.querySelectorAll(itemClass));
            const draggedIndex = allItems.indexOf(draggedItem);
            const targetIndex = allItems.indexOf(draggedOverItem);
            
            if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
                const moveCount = Math.abs(targetIndex - draggedIndex);
                const direction = targetIndex < draggedIndex ? 'up' : 'down';
                
                // Move item multiple times to reach target position
                if (type === 'story') {
                    const filename = draggedItem.dataset.filename;
                    for (let i = 0; i < moveCount; i++) {
                        await reorderStory(filename, direction);
                    }
                } else {
                    const id = parseInt(draggedItem.dataset.id);
                    for (let i = 0; i < moveCount; i++) {
                        await reorderSong(id, direction);
                    }
                }
            }
        }

        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem.style.transform = '';
            draggedItem.style.zIndex = '';
        }

        const items = list.querySelectorAll(itemClass);
        items.forEach(item => item.classList.remove('drag-over'));

        draggedItem = null;
        draggedOverItem = null;
        isDragging = false;
        startY = 0;
        currentY = 0;
    };

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            handleMove(e.touches[0].clientY);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            handleMove(e.clientY);
        }
    });

    document.addEventListener('touchend', handleEnd);
    document.addEventListener('mouseup', handleEnd);
}
window.initAdminDragAndDrop = initAdminDragAndDrop;

async function editStory(filename) {
    const story = adminStoryDatabase[filename] || storyDatabase[filename];
    if (!story) return;

    document.getElementById('editFilename').value = filename;
    document.getElementById('editName').value = story.name || '';
    document.getElementById('editCategory').value = story.category || 'Romance';
    document.getElementById('editStatus').value = story.status || 'available';
    document.getElementById('editDescription').value = story.description || '';
    document.getElementById('editBanner').value = story.banner || '';
    document.getElementById('editReading').value = story.reading || '';

    const isPublicCheckbox = document.getElementById('editIsPublic');
    if (isPublicCheckbox) {
        isPublicCheckbox.checked = story.isPublic !== false;
        document.getElementById('visibilityLabel').textContent = story.isPublic !== false ? 'Public' : 'Hidden';
    }

    // Load story content
    const editContentTextarea = document.getElementById('editContent');
    if (editContentTextarea) {
        editContentTextarea.value = 'Loading...';
        try {
            const response = await fetch(`/api/stories/${filename}/content`);
            if (response.ok) {
                const data = await response.json();
                editContentTextarea.value = data.content || '';
            } else {
                editContentTextarea.value = '';
                showNotification('Could not load story content', 'warning');
            }
        } catch (error) {
            console.error('Error loading story content:', error);
            editContentTextarea.value = '';
            showNotification('Failed to load story content', 'error');
        }
    }

    const modal = document.getElementById('editStoryModal');
    if (modal) modal.classList.add('show');
}
window.editStory = editStory;

function closeEditStoryModal() {
    const modal = document.getElementById('editStoryModal');
    if (modal) modal.classList.remove('show');
}

async function handleAddStory(e) {
    e.preventDefault();
    const form = e.target;

    const storyData = {
        id: form.id.value,
        name: form.name.value,
        category: form.category.value,
        description: form.description.value,
        banner: form.banner.value,
        reading: form.reading.value,
        content: form.content.value,
        status: 'available'
    };

    try {
        const response = await fetch('/api/stories', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(storyData)
        });

        if (!response.ok) throw new Error('Failed to create story');

        showNotification('Story created successfully!', 'success');
        form.reset();
        refreshAdminStories();
        loadStoryDatabase();
    } catch (error) {
        console.error('Error creating story:', error);
        showNotification('Failed to create story', 'error');
    }
}

async function handleEditStory(e) {
    e.preventDefault();
    const form = e.target;
    const filename = form.filename.value;

    const storyData = {
        name: form.name.value,
        category: form.category.value,
        status: form.status.value,
        description: form.description.value,
        banner: form.banner.value,
        reading: form.reading.value,
        isPublic: form.isPublic.checked,
        content: form.content.value
    };

    try {
        const response = await fetch(`/api/stories/${filename}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(storyData)
        });

        if (!response.ok) throw new Error('Failed to update story');

        closeEditStoryModal();
        refreshAdminStories();
        loadStoryDatabase();
        showNotification('Story updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating story:', error);
        showNotification('Failed to update story', 'error');
    }
}

async function confirmDeleteStory(filename) {
    const storyName = adminStoryDatabase[filename]?.name || storyDatabase[filename]?.name || filename;
    if (confirm(`Are you sure you want to delete "${storyName}"?`)) {
        try {
            const response = await fetch(`/api/stories/${filename}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });

            if (!response.ok) throw new Error('Failed to delete story');

            refreshAdminStories();
            loadStoryDatabase();
            showNotification('Story deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting story:', error);
            showNotification('Failed to delete story', 'error');
        }
    }
}
window.confirmDeleteStory = confirmDeleteStory;

function deleteCurrentStory() {
    const filename = document.getElementById('editFilename').value;
    if (filename) {
        confirmDeleteStory(filename);
        closeEditStoryModal();
    }
}
window.deleteCurrentStory = deleteCurrentStory;

async function refreshAdminSongs() {
    const list = document.getElementById('adminSongsList');
    if (!list) return;

    try {
        const response = await fetch('/api/songs');
        if (!response.ok) throw new Error('Failed to fetch songs');
        adminSongsDatabase = await response.json();
    } catch (error) {
        console.warn('API unavailable, using local music playlist:', error);
        adminSongsDatabase = musicPlaylist.map((song, index) => ({
            id: index,
            ...song
        }));
    }

    try {
        list.innerHTML = adminSongsDatabase.map((song, index) => `
            <div class="admin-song-item ${song.isPublic === false ? 'hidden-song' : ''}" data-id="${song.id}" data-index="${index}">
                <div class="admin-item-drag-handle" data-type="song" data-id="${song.id}">
                    <i class="fas fa-grip-vertical"></i>
                </div>
                <div class="admin-reorder-controls">
                    <button class="reorder-btn" onclick="reorderSong(${song.id}, 'up')" title="Move Up" ${index === 0 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-up"></i>
                    </button>
                    <button class="reorder-btn" onclick="reorderSong(${song.id}, 'down')" title="Move Down" ${index === adminSongsDatabase.length - 1 ? 'disabled' : ''}>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="admin-song-icon"><i class="${song.icon || 'fas fa-music'}"></i></div>
                <div class="admin-song-info">
                    <h5>${song.title}</h5>
                    <span>${song.artist || 'Unknown Artist'} - ${song.duration || 'N/A'}</span>
                    <span class="visibility-badge ${song.isPublic === false ? 'hidden' : 'public'}">${song.isPublic === false ? 'Hidden' : 'Public'}</span>
                </div>
                <div class="admin-song-actions">
                    <button onclick="toggleSongVisibility(${song.id}, ${song.isPublic !== false})" title="${song.isPublic === false ? 'Publish' : 'Hide'}">
                        <i class="fas fa-${song.isPublic === false ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button onclick="editSong(${song.id})" title="Edit"><i class="fas fa-edit"></i></button>
                    <button class="delete" onclick="confirmDeleteSong(${song.id})" title="Delete"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');
        initAdminDragAndDrop('song');
        if (adminSongsDatabase === musicPlaylist) {
            showNotification('Loaded songs from local data', 'info');
        }
    } catch (error) {
        console.error('Error displaying songs:', error);
        showNotification('Failed to load songs', 'error');
    }
}
window.refreshAdminSongs = refreshAdminSongs;

async function toggleSongVisibility(id, currentlyPublic) {
    try {
        const response = await fetch(`/api/songs/${id}/visibility`, {
            method: 'PATCH',
            headers: getAdminHeaders(),
            body: JSON.stringify({ isPublic: !currentlyPublic })
        });
        if (!response.ok) throw new Error('Failed to update visibility');
        showNotification(`Song ${currentlyPublic ? 'hidden' : 'published'} successfully`, 'success');
        refreshAdminSongs();
    } catch (error) {
        console.error('Error updating visibility:', error);
        showNotification('Failed to update visibility', 'error');
    }
}
window.toggleSongVisibility = toggleSongVisibility;

function editSong(id) {
    const song = adminSongsDatabase.find(s => s.id === id);
    if (!song) return;

    document.getElementById('editSongId').value = id;
    document.getElementById('editSongTitle').value = song.title || '';
    document.getElementById('editSongArtist').value = song.artist || '';
    document.getElementById('editSongDuration').value = song.duration || '';
    document.getElementById('editSongUrl').value = song.url || '';
    document.getElementById('editSongIcon').value = song.icon || 'fas fa-music';

    const isPublicCheckbox = document.getElementById('editSongIsPublic');
    if (isPublicCheckbox) {
        isPublicCheckbox.checked = song.isPublic !== false;
        document.getElementById('songVisibilityLabel').textContent = song.isPublic !== false ? 'Public' : 'Hidden';
    }

    const modal = document.getElementById('editSongModal');
    if (modal) modal.classList.add('show');
}
window.editSong = editSong;

function closeEditSongModal() {
    const modal = document.getElementById('editSongModal');
    if (modal) modal.classList.remove('show');
}
window.closeEditSongModal = closeEditSongModal;

async function handleAddSong(e) {
    e.preventDefault();
    const form = e.target;

    const songData = {
        title: form.title.value,
        artist: form.artist.value,
        url: form.url.value,
        duration: form.duration.value,
        icon: form.icon.value
    };

    try {
        const response = await fetch('/api/songs', {
            method: 'POST',
            headers: getAdminHeaders(),
            body: JSON.stringify(songData)
        });

        if (!response.ok) throw new Error('Failed to add song');

        showNotification('Song added successfully!', 'success');
        form.reset();
        refreshAdminSongs();
    } catch (error) {
        console.error('Error adding song:', error);
        showNotification('Failed to add song', 'error');
    }
}

async function handleEditSong(e) {
    e.preventDefault();
    const form = e.target;
    const id = form.id.value;

    const songData = {
        title: form.title.value,
        artist: form.artist.value,
        url: form.url.value,
        duration: form.duration.value,
        icon: form.icon.value,
        isPublic: form.isPublic.checked
    };

    try {
        const response = await fetch(`/api/songs/${id}`, {
            method: 'PUT',
            headers: getAdminHeaders(),
            body: JSON.stringify(songData)
        });

        if (!response.ok) throw new Error('Failed to update song');

        closeEditSongModal();
        refreshAdminSongs();
        showNotification('Song updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating song:', error);
        showNotification('Failed to update song', 'error');
    }
}

async function confirmDeleteSong(id) {
    const song = adminSongsDatabase.find(s => s.id === id);
    const songName = song?.title || 'this song';
    if (confirm(`Are you sure you want to delete "${songName}"?`)) {
        try {
            const response = await fetch(`/api/songs/${id}`, {
                method: 'DELETE',
                headers: getAdminHeaders()
            });

            if (!response.ok) throw new Error('Failed to delete song');

            refreshAdminSongs();
            showNotification('Song deleted successfully!', 'success');
        } catch (error) {
            console.error('Error deleting song:', error);
            showNotification('Failed to delete song', 'error');
        }
    }
}
window.confirmDeleteSong = confirmDeleteSong;

function deleteCurrentSong() {
    const id = document.getElementById('editSongId').value;
    if (id) {
        confirmDeleteSong(parseInt(id));
        closeEditSongModal();
    }
}
window.deleteCurrentSong = deleteCurrentSong;

function clearAllData() {
    if (confirm('This will clear all local data including favorites, bookmarks, and settings. Continue?')) {
        localStorage.clear();
        sessionStorage.clear();
        showNotification('All data cleared', 'success');
        setTimeout(() => location.reload(), 1000);
    }
}
window.clearAllData = clearAllData;

function exportData() {
    const data = {
        favorites: favoriteStories,
        bookmarks: storyBookmarks,
        theme: currentTheme,
        fontSize: currentFontSize,
        stories: storyDatabase
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'golpo-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported', 'success');
}
window.exportData = exportData;

const ADMIN_PASSWORD = 'DARK Host.02';

let passwordModalMode = 'login';
let passwordModalCallback = null;

function initializePasswordModal() {
    const modal = document.getElementById('passwordModal');
    const overlay = document.getElementById('passwordModalOverlay');
    const closeBtn = document.getElementById('closePasswordModal');
    const cancelBtn = document.getElementById('passwordCancelBtn');
    const form = document.getElementById('passwordForm');

    if (closeBtn) closeBtn.addEventListener('click', closePasswordModal);
    if (overlay) overlay.addEventListener('click', closePasswordModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closePasswordModal);

    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handlePasswordSubmit();
        });
    }
}

function showPasswordModal(mode = 'login', callback = null) {
    passwordModalMode = mode;
    passwordModalCallback = callback;

    const modal = document.getElementById('passwordModal');
    const title = document.getElementById('passwordModalTitle');
    const currentGroup = document.getElementById('currentPasswordGroup');
    const passwordGroup = document.getElementById('passwordGroup');
    const passwordLabel = document.getElementById('passwordLabel');
    const confirmGroup = document.getElementById('confirmPasswordGroup');
    const submitText = document.getElementById('passwordSubmitText');
    const submitBtn = document.getElementById('passwordSubmitBtn');
    const errorDiv = document.getElementById('passwordError');

    document.getElementById('currentPasswordInput').value = '';
    document.getElementById('passwordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    errorDiv.textContent = '';

    document.querySelectorAll('.password-toggle').forEach(btn => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        const icon = btn.querySelector('i');
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    });

    if (mode === 'login') {
        title.textContent = 'Admin Login';
        currentGroup.style.display = 'none';
        passwordGroup.style.display = 'block';
        passwordLabel.textContent = 'Password';
        confirmGroup.style.display = 'none';
        submitText.textContent = 'Login';
        submitBtn.querySelector('i').className = 'fas fa-sign-in-alt';
    } else if (mode === 'change') {
        title.textContent = 'Change Password';
        currentGroup.style.display = 'block';
        passwordGroup.style.display = 'block';
        passwordLabel.textContent = 'New Password';
        confirmGroup.style.display = 'block';
        submitText.textContent = 'Change Password';
        submitBtn.querySelector('i').className = 'fas fa-key';
    }

    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        if (mode === 'login') {
            document.getElementById('passwordInput').focus();
        } else {
            document.getElementById('currentPasswordInput').focus();
        }
    }, 100);
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('show');
    document.body.style.overflow = '';
    passwordModalCallback = null;
}

function handlePasswordSubmit() {
    const errorDiv = document.getElementById('passwordError');
    errorDiv.textContent = '';

    if (passwordModalMode === 'login') {
        const password = document.getElementById('passwordInput').value;
        if (password === ADMIN_PASSWORD) {
            closePasswordModal();
            showAdminDashboard();
        } else {
            errorDiv.textContent = 'Incorrect password';
            document.getElementById('passwordInput').focus();
        }
    } else if (passwordModalMode === 'change') {
        const currentPassword = document.getElementById('currentPasswordInput').value;
        const newPassword = document.getElementById('passwordInput').value;
        const confirmPassword = document.getElementById('confirmPasswordInput').value;

        if (currentPassword !== ADMIN_PASSWORD) {
            errorDiv.textContent = 'Current password is incorrect';
            document.getElementById('currentPasswordInput').focus();
            return;
        }

        if (!newPassword) {
            errorDiv.textContent = 'Please enter a new password';
            document.getElementById('passwordInput').focus();
            return;
        }

        if (newPassword !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            document.getElementById('confirmPasswordInput').focus();
            return;
        }

        closePasswordModal();
        showNotification('Password changed successfully (requires code update)', 'success');
    }
}

function changeAdminPassword() {
    showPasswordModal('change');
}
window.changeAdminPassword = changeAdminPassword;

function initializeSecretTrigger() {
    const footerLogo = document.getElementById('footerLogo');
    if (footerLogo) {
        footerLogo.addEventListener('click', showAnalyticsDashboard);
        
        let longPressTimer = null;
        let longPressTriggered = false;
        
        footerLogo.addEventListener('touchstart', (e) => {
            longPressTriggered = false;
            longPressTimer = setTimeout(() => {
                longPressTriggered = true;
                navigator.vibrate && navigator.vibrate(50);
                promptAdminPassword();
            }, 800);
        }, { passive: true });
        
        footerLogo.addEventListener('touchend', (e) => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
            if (longPressTriggered) {
                e.preventDefault();
            }
        });
        
        footerLogo.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
        
        footerLogo.addEventListener('touchcancel', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        }, { passive: true });
    }

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            promptAdminPassword();
        }
    });

    initializePasswordModal();
    initializeMobileAdminAccess();
}

function initializeMobileAdminAccess() {
}

function promptAdminPassword() {
    showPasswordModal('login');
}

function cleanupStorage() {
    try {
        localStorage.removeItem('golpoAnalytics');
        localStorage.removeItem('golpoStats');
        localStorage.removeItem('golpoNotificationHistory');

        const recentlyRead = JSON.parse(localStorage.getItem('golpoRecentlyRead') || '[]');
        if (recentlyRead.length > 5) {
            localStorage.setItem('golpoRecentlyRead', JSON.stringify(recentlyRead.slice(-5)));
        }

        const recentSongs = JSON.parse(localStorage.getItem('golpoRecentlySongs') || '[]');
        if (recentSongs.length > 5) {
            localStorage.setItem('golpoRecentlySongs', JSON.stringify(recentSongs.slice(-5)));
        }

        const favorites = JSON.parse(localStorage.getItem('golpoFavorites') || '[]');
        if (favorites.length > 10) {
            localStorage.setItem('golpoFavorites', JSON.stringify(favorites.slice(-10)));
        }

        console.log('Storage cleanup completed');
    } catch (e) {
        console.log('Storage cleanup error:', e);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    cleanupStorage();

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }

    await Promise.all([loadMusicPlaylist(), loadStoryDatabase(), loadAppSettings()]);
    initializeOfflineSupport();
    initializePWAInstall();
    initializeMainApp();

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.display = 'flex';
        navbar.style.visibility = 'visible';
        navbar.style.opacity = '1';
    }

    let storyFile = null;
    const pathname = window.location.pathname;
    const pathSegments = pathname.split('/').filter(s => s);
    const basePath = BASE_PATH.split('/').filter(s => s);
    const relevantSegments = pathSegments.slice(basePath.length);

    if (relevantSegments.length > 0) {
        const slug = decodeURIComponent(relevantSegments[0]);
        storyFile = getFilenameFromSlug(slug);
        if (!storyFile) {
            const potentialFilename = slug.endsWith('.txt') ? slug : slug + '.txt';
            if (storyDatabase[potentialFilename]) {
                storyFile = potentialFilename;
            }
        }
    }

    if (!storyFile) {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedStoryId = urlParams.get('story');
        if (sharedStoryId) {
            storyFile = getFilenameFromSlug(sharedStoryId) ||
                       Object.keys(storyDatabase).find(filename => storyDatabase[filename].id === sharedStoryId);
            if (storyFile) {
                const slug = getSlugFromFilename(storyFile);
                if (slug) {
                    window.history.replaceState({ view: 'reader', slug: slug }, '', BASE_PATH + encodeURIComponent(slug));
                }
            }
        }
    }

    if (!storyFile && !window.history.state) {
        window.history.replaceState({ view: 'library' }, '', BASE_PATH);
    }

    if (storyFile) {
        setTimeout(() => loadStoryFromCard(storyFile), 500);
    }
});

window.addEventListener('popstate', function(event) {
    const readerView = document.getElementById('readerView');
    const libraryView = document.getElementById('libraryView');
    const aboutView = document.getElementById('aboutView');
    if (!readerView || !libraryView) return;

    const viewState = event.state?.view || 'library';

    // Handle About view
    if (viewState === 'about') {
        if (aboutView) {
            const footer = document.querySelector('.site-footer');
            aboutView.style.display = 'block';
            libraryView.style.display = 'none';
            readerView.style.display = 'none';
            document.body.style.overflow = 'hidden';
            if (footer) footer.style.display = 'none';
        }
        return;
    }

    // Handle closing About view
    if (aboutView && aboutView.style.display === 'block') {
        const footer = document.querySelector('.site-footer');
        aboutView.style.display = 'none';
        document.body.style.overflow = '';
        if (footer) footer.style.display = '';
    }

    const isInReaderView = readerView.style.display !== 'none' && readerView.style.display !== '';
    const shouldShowLibrary = viewState === 'library';

    if (isInReaderView && shouldShowLibrary) {
        if (currentStory) stopReadingTimer(currentStory);
        readerView.style.display = 'none';
        libraryView.style.display = 'block';

        if (progressContainer) {
            progressContainer.classList.remove('visible');
        }
        if (readingControlsDropdown) {
            readingControlsDropdown.style.display = 'none';
            readingControlsDropdown.classList.remove('active');
        }

        const navbar = document.querySelector('.navbar');
        const footer = document.querySelector('.site-footer');
        if (navbar) navbar.style.opacity = '1';
        if (footer) footer.style.opacity = '1';

        resetReaderView();
    }
});

function loadStoryFromCard(storyFile) {
    const story = storyDatabase[storyFile];
    const slug = getSlugFromFilename(storyFile);
    if (slug) {
        window.history.pushState({ view: 'reader', slug: slug }, '', BASE_PATH + encodeURIComponent(slug));
    }
    showReaderView();
    loadStory(storyFile);
    updateReaderCoverImage(storyFile);
    if (story) {
        addActivityToLog('Started reading', story.name);
    }
}

function loadStoryFromSuggestion(storyFile) {
    const slug = getSlugFromFilename(storyFile);
    if (slug) {
        window.history.pushState({ view: 'reader', slug: slug }, '', BASE_PATH + encodeURIComponent(slug));
    }
    showReaderView();
    loadStory(storyFile);
    updateReaderCoverImage(storyFile);
    const storySuggestions = document.getElementById('storySuggestions');
    if (storySuggestions) storySuggestions.style.display = 'none';
}

function showReaderView() {
    document.getElementById('libraryView').style.display = 'none';
    document.getElementById('readerView').style.display = 'block';
    document.body.classList.add('reader-mode');

    if (progressContainer) {
        progressContainer.classList.add('visible');
    }
    if (readingControlsDropdown) {
        readingControlsDropdown.style.display = 'block';
    }

    if (isFocusMode) {
        document.body.classList.add('focus-mode');
    }

    window.scrollTo(0, 0);
}

function returnToLibrary() {
    stopReadingTimer(currentStory);
    document.getElementById('readerView').style.display = 'none';
    document.getElementById('libraryView').style.display = 'block';

    if (window.history.state?.view === 'reader') {
        window.history.back();
    } else {
        window.history.replaceState({ view: 'library' }, '', BASE_PATH);
    }

    if (progressContainer) {
        progressContainer.classList.remove('visible');
    }
    if (readingControlsDropdown) {
        readingControlsDropdown.style.display = 'none';
        readingControlsDropdown.classList.remove('active');
    }

    document.body.classList.remove('focus-mode');
    document.body.classList.remove('reader-mode');
    const navbar = document.querySelector('.navbar');
    const footer = document.querySelector('.site-footer');
    if (navbar) navbar.style.opacity = '1';
    if (footer) footer.style.opacity = '1';

    resetReaderView();
}

window.returnToLibrary = returnToLibrary;

function resetReaderView() {
    currentStory = '';
    const storyContent = document.getElementById('storyContent');
    if (storyContent) storyContent.innerHTML = '';
    updateReaderProgress(0);

    const readerStoryTitle = document.getElementById('readerStoryTitle');
    if (readerStoryTitle) readerStoryTitle.textContent = 'Select a Story';

    const readerReadingTime = document.getElementById('readerReadingTime');
    const readerWordCount = document.getElementById('readerWordCount');
    if (readerReadingTime) readerReadingTime.innerHTML = '<i class="fas fa-clock"></i> ~0 min';
    if (readerWordCount) readerWordCount.innerHTML = '<i class="fas fa-file-word"></i> ~0 words';

    const navTitle = document.querySelector('.nav-title');
    if (navTitle) navTitle.textContent = 'Golpo';

    document.title = 'Golpo by MBI Dark';
}

function toggleSearch() {
    const searchSection = document.getElementById('searchSection');
    if (searchSection.style.display === 'none' || searchSection.style.display === '') {
        searchSection.style.display = 'block';
        document.getElementById('globalSearch').focus();
    } else {
        searchSection.style.display = 'none';
        document.getElementById('globalSearch').value = '';
    }
}
window.toggleSearch = toggleSearch;

function performGlobalSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase().trim();
    if (!query) {
        highlightSearchResults([]);
        return;
    }

    const allStories = getAllStories();
    const results = allStories.filter(story => {
        const searchText = `${story.name} ${story.description} ${story.category} ${(story.tags || []).join(' ')}`.toLowerCase();
        return searchText.includes(query);
    }).map(s => s.file);

    highlightSearchResults(results);
    showNotification(`Found ${results.length} stories`, results.length > 0 ? 'success' : 'warning');
}
window.performGlobalSearch = performGlobalSearch;

function highlightSearchResults(results) {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        const storyFile = card.dataset.story;
        if (results.length === 0) {
            card.style.opacity = '1';
            card.style.transform = '';
        } else if (results.includes(storyFile)) {
            card.style.opacity = '1';
            card.style.transform = 'scale(1.02)';
        } else {
            card.style.opacity = '0.4';
            card.style.transform = '';
        }
    });

    setTimeout(() => {
        storyCards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = '';
        });
    }, 3000);
}

function filterByCategory(category) {
    const storyCards = document.querySelectorAll('.story-card');
    const pills = document.querySelectorAll('.pill');

    pills.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    const seriesView = document.getElementById('seriesView');
    const storyGrid = document.getElementById('storyGrid');
    const noStoriesMessage = document.getElementById('noStoriesMessage');

    if (category === 'series') {
        if (storyGrid) storyGrid.style.display = 'none';
        if (seriesView) {
            seriesView.style.display = 'block';
            generateSeriesView();
        }
        if (noStoriesMessage) noStoriesMessage.style.display = 'none';
        return;
    } else {
        if (storyGrid) storyGrid.style.display = '';
        if (seriesView) seriesView.style.display = 'none';
    }

    let visibleCount = 0;
    storyCards.forEach(card => {
        const storyFile = card.dataset.story;
        const filename = storyFile.endsWith('.txt') ? storyFile : storyFile + '.txt';
        const storyData = storyDatabase[filename];

        let show = false;
        if (category === 'all') {
            show = true;
        } else if (category === 'favorites') {
            show = favoriteStories.includes(filename);
        } else {
            const storyCategory = storyData?.category || '';
            const storyTags = storyData?.tags || [];
            show = storyCategory === category || storyTags.includes(category.toLowerCase());
        }

        card.style.display = show ? '' : 'none';
        if (show) visibleCount++;
    });

    if (noStoriesMessage) {
        noStoriesMessage.style.display = visibleCount === 0 ? 'block' : 'none';
    }
    if (storyGrid && visibleCount > 0) {
        storyGrid.style.display = '';
    }
}
window.filterByCategory = filterByCategory;

function generateSeriesView() {
    const seriesView = document.getElementById('seriesView');
    if (!seriesView) return;

    const seriesGroups = {};
    Object.keys(storyDatabase).forEach(filename => {
        const story = storyDatabase[filename];
        if (story.partOf) {
            if (!seriesGroups[story.partOf]) {
                seriesGroups[story.partOf] = [];
            }
            seriesGroups[story.partOf].push({ filename, ...story });
        }
    });

    if (Object.keys(seriesGroups).length === 0) {
        seriesView.innerHTML = '<div class="no-stories"><i class="fas fa-list-ol"></i><h3>No Series Found</h3><p>No multi-part stories available yet</p></div>';
        return;
    }

    let html = '<div class="series-grid">';
    Object.keys(seriesGroups).forEach(seriesName => {
        const parts = seriesGroups[seriesName].sort((a, b) => a.partNumber - b.partNumber);
        const firstPart = parts[0];
        html += `
            <div class="series-card">
                <div class="series-cover">
                    <img src="${firstPart.banner || defaultImages.banner}" alt="${seriesName}">
                    <div class="series-badge">${parts.length} Parts</div>
                </div>
                <div class="series-info">
                    <h3>${seriesName.replace('-Series', '')}</h3>
                    <div class="series-parts">
                        ${parts.map(p => `
                            <button class="part-btn" onclick="loadStoryFromCard('${p.filename}')">
                                Part ${p.partNumber}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    seriesView.innerHTML = html;
}

function initializeApp() {
    generateStoryCards();
    populateMusicModal();
    checkContinueReading();
}

function generateStoryCards() {
    const storyGrid = document.getElementById('storyGrid');
    if (!storyGrid) return;

    const stories = getAllStories();
    storyGrid.innerHTML = stories.map(story => {
        const isUpcoming = story.status === 'upcoming';
        const isFavorite = favoriteStories.includes(story.file);

        return `
            <div class="story-card ${isUpcoming ? 'upcoming' : ''}" data-story="${story.file}" onclick="loadStoryFromCard('${story.file}')">
                <button class="story-card-favorite ${isFavorite ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite('${story.file}')">
                    <i class="fas fa-star"></i>
                </button>
                <div class="story-card-image">
                    <img src="${story.banner || defaultImages.banner}" alt="${story.name}" loading="lazy">
                    <div class="story-card-overlay"></div>
                    <span class="story-card-badge">${story.category || 'Story'}</span>
                </div>
                <div class="story-card-content">
                    <h3 class="story-card-title">${story.name}</h3>
                    <p class="story-card-desc">${story.description || ''}</p>
                    <div class="story-card-meta">
                        <span><i class="fas fa-user"></i> ${story.writer || 'MBI Dark'}</span>
                        ${story.partOf ? `<span><i class="fas fa-layer-group"></i> Part ${story.partNumber}/${story.totalParts}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function toggleFavorite(filename) {
    const index = favoriteStories.indexOf(filename);
    if (index > -1) {
        favoriteStories.splice(index, 1);
        showNotification('Removed from favorites', 'info');
    } else {
        favoriteStories.push(filename);
        showNotification('Added to favorites', 'success');
    }
    localStorage.setItem('golpoFavorites', JSON.stringify(favoriteStories));

    const card = document.querySelector(`.story-card[data-story="${filename}"] .story-card-favorite`);
    if (card) card.classList.toggle('active', favoriteStories.includes(filename));

    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn && currentStory === filename) {
        favoriteBtn.classList.toggle('active', favoriteStories.includes(filename));
    }
}
window.toggleFavorite = toggleFavorite;

function toggleCurrentStoryFavorite() {
    if (currentStory) {
        toggleFavorite(currentStory);
    }
}
window.toggleCurrentStoryFavorite = toggleCurrentStoryFavorite;

function populateMusicModal() {
    const songList = document.getElementById('songList');
    const playlistCount = document.getElementById('playlistCount');
    if (!songList) return;

    if (musicPlaylist.length === 0) {
        songList.innerHTML = '<p class="empty-msg">No songs available</p>';
        if (playlistCount) playlistCount.textContent = 'No songs';
        return;
    }

    if (playlistCount) playlistCount.textContent = `${musicPlaylist.length} songs available`;

    songList.innerHTML = musicPlaylist.map((song, index) => `
        <div class="song-item ${index === currentMusicIndex ? 'active' : ''}" onclick="selectSong(${index})">
            <div class="song-icon"><i class="fas fa-music"></i></div>
            <div class="song-info">
                <div class="song-name">${song.title || 'Unknown Song'}</div>
                <div class="song-artist">${song.artist || 'Unknown Artist'}</div>
            </div>
        </div>
    `).join('');
}

function selectSong(index) {
    currentMusicIndex = index;
    const song = musicPlaylist[index];
    if (song && song.url) {
        playYouTubeMusic(song.url);
        closeMusicModal();
        addToRecentlySongs(song.title);
        addActivityToLog('Played song', song.title);
        showNotification(`Now playing: ${song.title}`, 'success');
    }
    populateMusicModal();
}
window.selectSong = selectSong;

function checkContinueReading() {
    const lastRead = localStorage.getItem('golpoLastRead');
    if (lastRead && storyDatabase[lastRead]) {
        const continueReading = document.getElementById('continueReading');
        if (continueReading) {
            continueReading.style.display = 'block';
        }
    }
}

function continuePreviousReading() {
    const lastRead = localStorage.getItem('golpoLastRead');
    if (lastRead && storyDatabase[lastRead]) {
        loadStoryFromCard(lastRead);
    }
}
window.continuePreviousReading = continuePreviousReading;

async function loadStory(storyFile) {
    currentStory = storyFile;
    const metadata = getStoryMetadata(storyFile);

    const readerStoryTitle = document.getElementById('readerStoryTitle');
    const readerAuthor = document.getElementById('readerAuthor');

    if (readerStoryTitle) readerStoryTitle.textContent = metadata.name;
    if (readerAuthor) readerAuthor.textContent = `by ${metadata.writer}`;

    document.title = `${metadata.name} - Golpo`;
    localStorage.setItem('golpoLastRead', storyFile);

    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.classList.toggle('active', favoriteStories.includes(storyFile));
    }

    if (bookmarkBtn) {
        const hasBookmark = storyBookmarks[storyFile] !== undefined;
        bookmarkBtn.classList.toggle('active', hasBookmark);
    }

    try {
        const response = await fetch(`stories/${storyFile}`);
        if (!response.ok) throw new Error('Story not found');

        const text = await response.text();
        const words = text.split(/\s+/).length;
        const readingTime = Math.ceil(words / 200);

        const readerReadingTime = document.getElementById('readerReadingTime');
        const readerWordCount = document.getElementById('readerWordCount');
        if (readerReadingTime) readerReadingTime.innerHTML = `<i class="fas fa-clock"></i> ~${readingTime} min`;
        if (readerWordCount) readerWordCount.innerHTML = `<i class="fas fa-file-word"></i> ~${words.toLocaleString()} words`;

        paginateStory(text);

        const savedBookmark = storyBookmarks[storyFile];
        const savedPage = localStorage.getItem(`page_${storyFile}`);

        if (savedBookmark && savedBookmark.page) {
            displayPage(savedBookmark.page);
            setTimeout(() => {
                if (savedBookmark.position) {
                    window.scrollTo({ top: savedBookmark.position, behavior: 'smooth' });
                }
            }, 100);
        } else if (savedPage) {
            displayPage(parseInt(savedPage));
        } else {
            displayPage(1);
        }

        startReadingTimer(storyFile);

        const nextPart = metadata.nextPart;
        const nextPartPreview = document.getElementById('nextPartPreview');
        if (nextPart && nextPartPreview) {
            const nextMetadata = getStoryMetadata(nextPart);
            document.getElementById('nextPartCoverImage').src = nextMetadata.reading || nextMetadata.banner || defaultImages.reading;
            nextPartPreview.style.display = 'flex';
        } else if (nextPartPreview) {
            nextPartPreview.style.display = 'none';
        }

        addToRecentlyRead(storyFile);

    } catch (error) {
        console.error('Error loading story:', error);
        showNotification('Failed to load story', 'error');
        const storyContent = document.getElementById('storyContent');
        if (storyContent) {
            storyContent.innerHTML = '<p class="error-msg">Failed to load story. Please try again.</p>';
        }
    }
}

function loadNextPart() {
    const metadata = getStoryMetadata(currentStory);
    if (metadata.nextPart) {
        loadStoryFromCard(metadata.nextPart);
    }
}
window.loadNextPart = loadNextPart;

function updateReaderCoverImage(storyFile) {
    const metadata = getStoryMetadata(storyFile);
    const coverImg = document.getElementById('readerCoverImage');
    if (coverImg) {
        coverImg.src = metadata.reading || metadata.banner || defaultImages.reading;
    }
}

function paginateStory(text) {
    const lines = text.split('\n');
    storyPages = [];
    storyPageWeights = [];

    for (let i = 0; i < lines.length; i += linesPerPage) {
        storyPages.push(lines.slice(i, i + linesPerPage).join('\n'));
    }

    totalPages = storyPages.length;
    currentPage = 1;

    const totalChars = storyPages.reduce((sum, page) => sum + page.length, 0);
    storyPageWeights = storyPages.map(page => totalChars > 0 ? page.length / totalChars : 1 / totalPages);

    const savedPage = localStorage.getItem(`page_${currentStory}`);
    if (savedPage) {
        currentPage = Math.min(parseInt(savedPage), totalPages);
    }
}

function processStoryLinks(text) {
    const socialMediaPatterns = {
        facebook: /facebook\.com/i,
        youtube: /youtube\.com|youtu\.be/i,
        discord: /discord\.com|discord\.gg/i,
        whatsapp: /wa\.me|whatsapp\.com/i,
        instagram: /instagram\.com/i,
        twitter: /twitter\.com|x\.com/i,
        telegram: /t\.me|telegram\.org/i,
        tiktok: /tiktok\.com/i,
        linkedin: /linkedin\.com/i,
        github: /github\.com/i
    };

    const socialIcons = {
        facebook: '<i class="fab fa-facebook-f"></i>',
        youtube: '<i class="fab fa-youtube"></i>',
        discord: '<i class="fab fa-discord"></i>',
        whatsapp: '<i class="fab fa-whatsapp"></i>',
        instagram: '<i class="fab fa-instagram"></i>',
        twitter: '<i class="fab fa-twitter"></i>',
        telegram: '<i class="fab fa-telegram"></i>',
        tiktok: '<i class="fab fa-tiktok"></i>',
        linkedin: '<i class="fab fa-linkedin-in"></i>',
        github: '<i class="fab fa-github"></i>'
    };

    const socialColors = {
        facebook: '#1877f2',
        youtube: '#ff0000',
        discord: '#5865f2',
        whatsapp: '#25d366',
        instagram: '#e4405f',
        twitter: '#1da1f2',
        telegram: '#0088cc',
        tiktok: '#000000',
        linkedin: '#0077b5',
        github: '#333333'
    };

    const urlRegex = /https?:\/\/[^\s<>"']+/g;

    return text.replace(urlRegex, (url) => {
        let socialType = null;
        for (const [type, pattern] of Object.entries(socialMediaPatterns)) {
            if (pattern.test(url)) {
                socialType = type;
                break;
            }
        }

        if (socialType) {
            return `<a href="${url}" target="_blank" class="story-link-btn social-link-btn" style="background: ${socialColors[socialType]};">${socialIcons[socialType]}</a>`;
        } else {
            return `<a href="${url}" target="_blank" class="story-link-btn"><i class="fas fa-external-link-alt"></i> Link</a>`;
        }
    });
}

function displayPage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) return;

    currentPage = pageNum;
    localStorage.setItem(`page_${currentStory}`, currentPage);

    // Show page transition overlay
    showPageTransitionOverlay(pageNum);

    const content = storyPages[currentPage - 1] || '';
    const storyContentEl = document.getElementById('storyContent');

    if (storyContentEl) {
        // Add exit animation
        storyContentEl.classList.add('page-transition-exit');

        setTimeout(() => {
            const paragraphs = content.split('\n\n').filter(p => p.trim());
            storyContentEl.innerHTML = paragraphs.map(p => {
                const processedText = processStoryLinks(p.replace(/\n/g, '<br>'));
                return `<p>${processedText}</p>`;
            }).join('');

            if (totalPages > 1) {
                storyContentEl.innerHTML += `
                    <div class="pagination-container">
                        <button class="page-btn" onclick="displayPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
                            <i class="fas fa-chevron-left"></i> Previous
                        </button>
                        <span class="page-indicator">Page ${currentPage} of ${totalPages}</span>
                        <button class="page-btn" onclick="displayPage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
                            Next <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                `;
            }

            if (currentPage === totalPages) {
                storyContentEl.innerHTML += createStorySuggestions(currentStory);
            }

            // Remove exit animation and add enter animation
            storyContentEl.classList.remove('page-transition-exit');
            storyContentEl.classList.add('page-transition-enter');

            // Remove enter animation after it completes
            setTimeout(() => {
                storyContentEl.classList.remove('page-transition-enter');
            }, 500);

            setupScrollProgressTracking();
        }, 300);
    }

    updateFullStoryProgress();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showPageTransitionOverlay(pageNum) {
    const overlay = document.getElementById('pageTransitionOverlay');
    const pageNumberText = document.getElementById('pageNumberText');
    const pageInfoText = document.getElementById('pageInfoText');
    
    if (overlay && pageNumberText && pageInfoText) {
        pageNumberText.textContent = `Page ${pageNum}`;
        pageInfoText.textContent = `of ${totalPages}`;
        
        overlay.classList.add('active');
        
        setTimeout(() => {
            overlay.classList.remove('active');
        }, 800);
    }
}
window.displayPage = displayPage;

function setupScrollProgressTracking() {
    const storyContentEl = document.getElementById('storyContent');
    if (!storyContentEl) return;

    const updateScrollProgress = () => {
        updateFullStoryProgress();
    };

    window.removeEventListener('scroll', window._scrollProgressHandler);
    window._scrollProgressHandler = updateScrollProgress;
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
}

function updateFullStoryProgress() {
    const storyContentEl = document.getElementById('storyContent');
    if (!storyContentEl || totalPages === 0) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 1;

    let completedWeight = 0;
    for (let i = 0; i < currentPage - 1; i++) {
        completedWeight += storyPageWeights[i] || (1 / totalPages);
    }

    const currentPageWeight = storyPageWeights[currentPage - 1] || (1 / totalPages);
    const progressPercent = Math.min((completedWeight + currentPageWeight * scrollPercent) * 100, 100);

    updateReaderProgress(progressPercent);
}

function createStorySuggestions(currentStoryFile) {
    const stories = getAllStories().filter(s => s.file !== currentStoryFile && s.status !== 'upcoming');
    if (stories.length === 0) return '';

    const shuffled = [...stories].sort(() => Math.random() - 0.5);
    const suggestions = shuffled.slice(0, 4);
    return `
        <div class="story-suggestions">
            <h3 class="suggestions-title"><i class="fas fa-book-open"></i> More Stories</h3>
            <div class="suggestions-grid">
                ${suggestions.map(story => `
                    <button class="suggestion-card" onclick="loadStoryFromSuggestion('${story.file}')">
                        <div class="suggestion-card-image">
                            <img src="${story.reading || story.banner || defaultImages.reading}" alt="${story.name}" onerror="this.src='${defaultImages.reading}'">
                        </div>
                        <div class="suggestion-card-content">
                            <h4>${story.name}</h4>
                            <p>${story.category || 'Story'}</p>
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function updateReaderProgress(percent) {
    if (progressFill) {
        progressFill.style.width = `${percent}%`;
    }
    if (progressPercentage) {
        progressPercentage.textContent = `${Math.round(percent)}%`;
    }

    const focusExitBtn = document.getElementById('focusExitBtn');
    if (focusExitBtn) {
        focusExitBtn.querySelector('.progress-text').textContent = `${Math.round(percent)}%`;
    }
}

function setupEventListeners() {
    if (musicSelector) {
        musicSelector.addEventListener('click', openMusicModal);
    }

    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', cycleTheme);
    }

    if (readingControlsBtn) {
        readingControlsBtn.addEventListener('click', toggleReadingControls);
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', () => changeFontSize(-10));
    }

    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', () => changeFontSize(10));
    }

    if (focusModeBtn) {
        focusModeBtn.addEventListener('click', toggleFocusMode);
    }

    if (autoScrollBtn) {
        autoScrollBtn.addEventListener('click', toggleAutoScroll);
    }

    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', toggleBookmark);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', searchInStory);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchInStory();
        });
    }

    if (scrollSpeedSlider) {
        scrollSpeedSlider.addEventListener('input', (e) => {
            autoScrollSpeed = parseInt(e.target.value);
            if (isAutoScrolling) {
                stopAutoScroll();
                startAutoScroll();
            }
        });
    }

    setupModalClosers();
    setupSwipeNavigation();
    setupKeyboardShortcuts();
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input or textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Theme toggle: T
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            cycleTheme();
        }

        // Focus mode: F
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            const readerView = document.getElementById('readerView');
            if (readerView && readerView.style.display !== 'none') {
                toggleFocusMode();
            }
        }

        // Escape to exit focus mode
        if (e.key === 'Escape') {
            if (isFocusMode) {
                e.preventDefault();
                toggleFocusMode();
            }
        }

        // Arrow keys for page navigation (only in reader view)
        const readerView = document.getElementById('readerView');
        if (readerView && readerView.style.display !== 'none') {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                if (currentPage > 1) {
                    displayPage(currentPage - 1);
                }
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                if (currentPage < totalPages) {
                    displayPage(currentPage + 1);
                }
            }
        }

        // Toggle bookmark: B
        if (e.key === 'b' || e.key === 'B') {
            e.preventDefault();
            if (currentStory) {
                toggleBookmark();
            }
        }

        // Auto scroll: A
        if (e.key === 'a' || e.key === 'A') {
            e.preventDefault();
            if (currentStory) {
                toggleAutoScroll();
            }
        }

        // Font size: + and -
        if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            changeFontSize(10);
        }
        if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            changeFontSize(-10);
        }

        // Scroll to top: Home
        if (e.key === 'Home') {
            e.preventDefault();
            scrollToTop();
        }

        // Return to library: Backspace or Escape (if not in focus mode)
        if (e.key === 'Backspace' && !isFocusMode) {
            const readerView = document.getElementById('readerView');
            if (readerView && readerView.style.display !== 'none') {
                e.preventDefault();
                returnToLibrary();
            }
        }

        // Play/Pause music: Space (only if not scrolling)
        if (e.key === ' ' && e.target === document.body) {
            e.preventDefault();
            togglePlayPause();
        }

        // Admin dashboard: Ctrl+Shift+M
        if (e.ctrlKey && e.shiftKey && e.key === 'M') {
            e.preventDefault();
            promptAdminPassword();
        }
    });
}

function setupModalClosers() {
    const modals = [
        { modal: 'musicModal', close: 'closeMusicModal', overlay: 'musicModalOverlay' },
        { modal: 'storyModal', close: 'closeStoryModal', overlay: 'storyModalOverlay' },
        { modal: 'statsModal', close: 'closeStatsModal', overlay: 'statsModalOverlay' },
        { modal: 'tocModal', close: 'closeTocModal', overlay: 'tocModalOverlay' },
        { modal: 'analyticsModal', close: 'closeAnalyticsModal', overlay: 'analyticsModalOverlay' }
    ];

    modals.forEach(({ modal, close, overlay }) => {
        const modalEl = document.getElementById(modal);
        const closeBtn = document.getElementById(close);
        const overlayEl = document.getElementById(overlay);

        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
        if (overlayEl) overlayEl.addEventListener('click', () => closeModal(modal));
    });
}

function openMusicModal() {
    const modal = document.getElementById('musicModal');
    if (modal) modal.classList.add('show');
}

function closeMusicModal() {
    closeModal('musicModal');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

function toggleReadingControls() {
    if (readingControlsDropdown) {
        readingControlsDropdown.classList.toggle('active');
    }
}

function setupReadingControlsOutsideClick() {
    document.addEventListener('click', (e) => {
        if (readingControlsDropdown && !readingControlsDropdown.contains(e.target)) {
            readingControlsDropdown.classList.remove('active');
        }
    });
}

function changeFontSize(delta) {
    currentFontSize = Math.max(50, Math.min(200, currentFontSize + delta));
    if (fontSizeDisplay) fontSizeDisplay.textContent = `${currentFontSize}%`;

    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.style.fontSize = `${currentFontSize}%`;
    }

    localStorage.setItem('golpoFontSize', currentFontSize);
}

function toggleFocusMode() {
    isFocusMode = !isFocusMode;
    document.body.classList.toggle('focus-mode', isFocusMode);

    const focusExitBtn = document.getElementById('focusExitBtn');
    const focusAutoScrollBtn = document.getElementById('focusAutoScrollBtn');

    if (focusExitBtn) {
        focusExitBtn.style.display = isFocusMode ? 'flex' : 'none';
    }

    if (focusAutoScrollBtn) {
        focusAutoScrollBtn.style.display = isFocusMode ? 'flex' : 'none';
        focusAutoScrollBtn.classList.toggle('active', isAutoScrolling);
    }

    if (focusModeBtn) {
        focusModeBtn.classList.toggle('active', isFocusMode);
    }

    showNotification(isFocusMode ? 'Focus mode enabled' : 'Focus mode disabled', 'info');
}

document.getElementById('focusExitBtn')?.addEventListener('click', toggleFocusMode);

document.getElementById('focusAutoScrollBtn')?.addEventListener('click', () => {
    toggleAutoScroll();
});

document.getElementById('autoScrollCloseBtn')?.addEventListener('click', () => {
    if (isAutoScrolling) {
        stopAutoScroll();
        const focusAutoScrollBtn = document.getElementById('focusAutoScrollBtn');
        if (focusAutoScrollBtn) {
            focusAutoScrollBtn.classList.remove('active');
        }
        const autoScrollCloseBtn = document.getElementById('autoScrollCloseBtn');
        if (autoScrollCloseBtn) {
            autoScrollCloseBtn.classList.remove('show');
        }
        showNotification('Auto-scroll stopped', 'info');
    }
});

function toggleAutoScroll() {
    if (isAutoScrolling) {
        stopAutoScroll();
    } else {
        startAutoScroll();
    }

    // Update focus mode auto-scroll button state
    const focusAutoScrollBtn = document.getElementById('focusAutoScrollBtn');
    if (focusAutoScrollBtn) {
        focusAutoScrollBtn.classList.toggle('active', isAutoScrolling);
    }

    // Update auto-scroll close button visibility
    const autoScrollCloseBtn = document.getElementById('autoScrollCloseBtn');
    if (autoScrollCloseBtn) {
        if (isAutoScrolling) {
            autoScrollCloseBtn.classList.add('show');
        } else {
            autoScrollCloseBtn.classList.remove('show');
        }
    }

    // Show notification
    if (isAutoScrolling) {
        showNotification('Auto-scroll enabled', 'success');
    } else {
        showNotification('Auto-scroll disabled', 'info');
    }
}

let lastScrollTop = 0;
let scrollTimeout = null;
let isManualScrolling = false;

function startAutoScroll() {
    isAutoScrolling = true;
    if (autoScrollBtn) autoScrollBtn.classList.add('active');
    if (autoScrollControls) autoScrollControls.style.display = 'block';

    const speed = 11 - autoScrollSpeed;
    autoScrollInterval = setInterval(() => {
        if (!isManualScrolling) {
            window.scrollBy(0, 1);
            lastScrollTop = window.scrollY;
        }
    }, speed * 10);

    // Add manual scroll detection
    window.addEventListener('wheel', handleManualScroll, { passive: true });
    window.addEventListener('touchmove', handleManualScroll, { passive: true });
}

function handleManualScroll() {
    if (!isAutoScrolling) return;

    isManualScrolling = true;

    // Clear existing timeout
    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
    }

    // Resume auto-scroll after user stops scrolling for 1 second
    scrollTimeout = setTimeout(() => {
        isManualScrolling = false;
        lastScrollTop = window.scrollY;
    }, 1000);
}

function stopAutoScroll() {
    isAutoScrolling = false;
    isManualScrolling = false;

    if (autoScrollBtn) autoScrollBtn.classList.remove('active');

    // Also update focus mode button
    const focusAutoScrollBtn = document.getElementById('focusAutoScrollBtn');
    if (focusAutoScrollBtn) {
        focusAutoScrollBtn.classList.remove('active');
    }

    if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        autoScrollInterval = null;
    }

    if (scrollTimeout) {
        clearTimeout(scrollTimeout);
        scrollTimeout = null;
    }

    // Remove event listeners
    window.removeEventListener('wheel', handleManualScroll);
    window.removeEventListener('touchmove', handleManualScroll);
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleBookmark() {
    if (!currentStory) return;

    const currentScrollPos = window.scrollY;
    const bookmark = storyBookmarks[currentStory];

    if (bookmark) {
        const bookmarkPos = bookmark.position;
        const threshold = 100;
        const isAtBookmark = Math.abs(currentScrollPos - bookmarkPos) < threshold;

        if (isAtBookmark) {
            delete storyBookmarks[currentStory];
            localStorage.setItem('golpoBookmarks', JSON.stringify(storyBookmarks));
            if (bookmarkBtn) bookmarkBtn.classList.remove('active');
            showNotification('Bookmark removed', 'info');
        } else {
            window.scrollTo({ top: bookmarkPos, behavior: 'smooth' });
            showNotification('Scrolled to bookmark', 'info');
        }
    } else {
        storyBookmarks[currentStory] = { position: currentScrollPos, page: currentPage };
        localStorage.setItem('golpoBookmarks', JSON.stringify(storyBookmarks));
        if (bookmarkBtn) bookmarkBtn.classList.add('active');
        showNotification('Bookmark saved', 'success');
    }
}

function searchInStory() {
    const query = searchInput?.value.trim();
    if (!query) return;

    const searchResultsContainer = document.getElementById('searchResults');
    if (!searchResultsContainer) return;

    // Clear previous highlights and results
    clearSearch();

    // Search across all pages
    const regex = new RegExp(query, 'gi');
    const matches = [];

    storyPages.forEach((pageContent, pageIndex) => {
        const pageNumber = pageIndex + 1;
        const lines = pageContent.split('\n');

        lines.forEach((line, lineIndex) => {
            if (regex.test(line)) {
                matches.push({
                    page: pageNumber,
                    lineIndex: lineIndex,
                    text: line.trim()
                });
            }
        });
    });

    if (matches.length === 0) {
        showNotification('No matches found', 'warning');
        searchResultsContainer.innerHTML = '<p style="color: var(--text-muted); padding: 10px;">No results found</p>';
        return;
    }

    // Display search results
    searchResultsContainer.innerHTML = matches.slice(0, 20).map((match, index) => {
        const highlightedText = match.text.replace(
            new RegExp(`(${query})`, 'gi'),
            '<mark style="background: rgba(168, 85, 247, 0.3); padding: 2px 4px; border-radius: 3px;">$1</mark>'
        );

        return `
            <div class="search-result-item" onclick="jumpToSearchResult(${match.page}, ${index})" style="padding: 10px; margin: 5px 0; background: var(--bg-tertiary); border-radius: 8px; cursor: pointer; border: 1px solid var(--border-color); transition: all 0.2s;">
                <div style="font-size: 0.75rem; color: var(--accent-primary); margin-bottom: 4px;">
                    <i class="fas fa-file-alt"></i> Page ${match.page}
                </div>
                <div style="font-size: 0.9rem; line-height: 1.5;">
                    ${highlightedText}
                </div>
            </div>
        `;
    }).join('');

    // Add CSS for hover effect
    const style = document.createElement('style');
    style.textContent = `
        .search-result-item:hover {
            border-color: var(--accent-primary) !important;
            transform: translateX(4px);
        }
    `;
    if (!document.getElementById('search-result-style')) {
        style.id = 'search-result-style';
        document.head.appendChild(style);
    }

    // Store matches for navigation
    window.currentSearchMatches = matches;

    showNotification(`Found ${matches.length} matches${matches.length > 20 ? ' (showing first 20)' : ''}`, 'success');
}

function jumpToSearchResult(pageNumber, matchIndex) {
    displayPage(pageNumber);

    setTimeout(() => {
        const match = window.currentSearchMatches[matchIndex];
        if (match) {
            // Highlight the text on the current page
            const storyContent = document.getElementById('storyContent');
            if (storyContent) {
                const paragraphs = storyContent.querySelectorAll('p');
                paragraphs.forEach(p => {
                    if (p.textContent.includes(match.text)) {
                        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        p.style.background = 'rgba(168, 85, 247, 0.1)';
                        p.style.borderLeft = '3px solid var(--accent-primary)';
                        p.style.paddingLeft = '10px';
                        p.style.transition = 'all 0.3s';

                        setTimeout(() => {
                            p.style.background = '';
                            p.style.borderLeft = '';
                            p.style.paddingLeft = '';
                        }, 2000);
                    }
                });
            }
        }
    }, 300);
}
window.jumpToSearchResult = jumpToSearchResult;

function clearSearch() {
    if (searchInput) searchInput.value = '';

    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.querySelectorAll('.highlight').forEach(el => {
            el.outerHTML = el.textContent;
        });
    }

    const searchResultsContainer = document.getElementById('searchResults');
    if (searchResultsContainer) {
        searchResultsContainer.innerHTML = '';
    }

    window.currentSearchMatches = [];
}

function setupSwipeNavigation() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;

    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    storyContent.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    storyContent.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;

        // Only trigger page navigation if horizontal swipe is more significant than vertical
        if (Math.abs(diffX) < 50) return;
        if (Math.abs(diffY) > Math.abs(diffX)) return; // Vertical swipe, ignore

        // Horizontal swipe detected
        if (diffX > 0 && currentPage < totalPages) {
            displayPage(currentPage + 1);
        } else if (diffX < 0 && currentPage > 1) {
            displayPage(currentPage - 1);
        }
    }
}

function togglePlayPause() {
    if (isYouTubePlaying) {
        pauseYouTubeMusic();
    } else {
        if (currentYouTubeUrl) {
            playYouTubeMusic(currentYouTubeUrl);
        } else if (musicPlaylist.length > 0) {
            selectSong(0);
        } else {
            openMusicModal();
        }
    }
}

function playYouTubeMusic(url) {
    const videoId = extractYouTubeId(url);
    if (!videoId) return;

    currentYouTubeUrl = url;

    if (youtubeFrame) {
        youtubeFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;

        // Set up listener for when video ends
        if (!window.youtubeMessageListener) {
            window.youtubeMessageListener = true;
            window.addEventListener('message', (event) => {
                if (event.data && typeof event.data === 'string') {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.event === 'onStateChange' && data.info === 0) {
                            // Video ended (state 0), play next song
                            playNextSong();
                        }
                    } catch (e) {}
                }
            });
        }
    }

    isYouTubePlaying = true;
    updatePlayButton(true);
}

function playNextSong() {
    if (musicPlaylist.length === 0) return;

    currentMusicIndex = (currentMusicIndex + 1) % musicPlaylist.length;
    const nextSong = musicPlaylist[currentMusicIndex];

    if (nextSong && nextSong.url) {
        playYouTubeMusic(nextSong.url);
        showNotification(`Now playing: ${nextSong.title}`, 'info', 2000);
        populateMusicModal(); // Update active state in music list
    }
}

function pauseYouTubeMusic() {
    if (youtubeFrame) {
        youtubeFrame.src = '';
    }
    isYouTubePlaying = false;
    updatePlayButton(false);
}

function updatePlayButton(playing) {
    if (playPauseBtn) {
        playPauseBtn.innerHTML = playing ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        playPauseBtn.classList.toggle('playing', playing);
    }
}

function extractYouTubeId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function startAutoplay() {
    if (musicPlaylist.length > 0 && !isYouTubePlaying) {
        const randomIndex = Math.floor(Math.random() * musicPlaylist.length);
        currentMusicIndex = randomIndex;
        const song = musicPlaylist[randomIndex];
        if (song && song.url) {
            playYouTubeMusic(song.url);
            showNotification(`Now playing: ${song.title}`, 'success', 3000);
        }
    }
}

function shufflePlaylist() {
    if (musicPlaylist.length === 0) return;
    const randomIndex = Math.floor(Math.random() * musicPlaylist.length);
    selectSong(randomIndex);
    showNotification('Playing random song', 'success');
}
window.shufflePlaylist = shufflePlaylist;

function cycleTheme() {
    const themes = ['dark', 'light', 'sepia', 'dark-sepia'];
    const currentIndex = themes.indexOf(currentTheme);
    currentTheme = themes[(currentIndex + 1) % themes.length];

    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('golpoTheme', currentTheme);

    const icons = { dark: 'fa-moon', light: 'fa-sun', sepia: 'fa-book', 'dark-sepia': 'fa-adjust' };
    if (themeToggle) {
        themeToggle.innerHTML = `<i class="fas ${icons[currentTheme]}"></i>`;
    }

    const themeNames = { dark: 'Dark', light: 'Light', sepia: 'Sepia', 'dark-sepia': 'Dark Sepia' };
    showNotification(`Theme: ${themeNames[currentTheme]} (Press T to change)`, 'info', 2000);
}

function loadSavedSettings() {
    const savedTheme = localStorage.getItem('golpoTheme');
    if (savedTheme) {
        currentTheme = savedTheme;
        document.body.setAttribute('data-theme', currentTheme);
        const icons = { dark: 'fa-moon', light: 'fa-sun', sepia: 'fa-book', 'dark-sepia': 'fa-adjust' };
        if (themeToggle) {
            themeToggle.innerHTML = `<i class="fas ${icons[currentTheme]}"></i>`;
        }
    }

    const savedFontSize = localStorage.getItem('golpoFontSize');
    if (savedFontSize) {
        currentFontSize = parseInt(savedFontSize);
        if (fontSizeDisplay) fontSizeDisplay.textContent = `${currentFontSize}%`;
    }

    const savedBookmarks = localStorage.getItem('golpoBookmarks');
    if (savedBookmarks) {
        storyBookmarks = JSON.parse(savedBookmarks);
    }
}

function initializeFavoritesData() {
    const saved = localStorage.getItem('golpoFavorites');
    if (saved) {
        favoriteStories = JSON.parse(saved);
    }
}

function addToRecentlyRead(storyFile) {
    let recent = JSON.parse(localStorage.getItem('golpoRecentlyRead') || '[]');
    recent = recent.filter(f => f !== storyFile);
    recent.push(storyFile);
    if (recent.length > 5) recent = recent.slice(-5);
    localStorage.setItem('golpoRecentlyRead', JSON.stringify(recent));
}

var readingTimers = {};

function startReadingTimer(storyFile) {
    if (readingTimers[storyFile]) return;
    readingTimers[storyFile] = Date.now();
}

function stopReadingTimer(storyFile) {
    if (!readingTimers[storyFile]) return;
    const duration = Date.now() - readingTimers[storyFile];
    delete readingTimers[storyFile];

    let totalTime = parseInt(localStorage.getItem('golpoTotalReadingTime') || '0');
    totalTime += duration;
    localStorage.setItem('golpoTotalReadingTime', totalTime);

    if (typeof saveStoryReadingTime === 'function') {
        saveStoryReadingTime(storyFile, duration);
    }
}

function shareCurrentStory() {
    if (!currentStory) return;

    const metadata = getStoryMetadata(currentStory);
    const slug = getSlugFromFilename(currentStory);
    const url = window.location.origin + BASE_PATH + (slug || currentStory.replace('.txt', ''));

    navigator.clipboard.writeText(url).then(() => {
        showNotification('Link copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy link', 'error');
    });
}
window.shareCurrentStory = shareCurrentStory;

function toggleTOC() {
    const modal = document.getElementById('tocModal');
    if (modal) modal.classList.add('show');
}
window.toggleTOC = toggleTOC;

var recentNotifications = [];
var activityLog = [];

function addNotificationToHistory(message, type) {
    const notification = {
        message,
        type,
        timestamp: Date.now()
    };
    recentNotifications.unshift(notification);
    if (recentNotifications.length > 10) recentNotifications = recentNotifications.slice(0, 10);
    localStorage.setItem('golpoRecentNotifications', JSON.stringify(recentNotifications));
}

function addActivityToLog(action, details) {
    const activity = {
        action,
        details,
        timestamp: Date.now()
    };
    activityLog.unshift(activity);
    if (activityLog.length > 20) activityLog = activityLog.slice(0, 20);
    localStorage.setItem('golpoActivityLog', JSON.stringify(activityLog));
}

function addToRecentlySongs(songTitle) {
    let recentSongs = JSON.parse(localStorage.getItem('golpoRecentlySongs') || '[]');
    recentSongs = recentSongs.filter(s => s !== songTitle);
    recentSongs.unshift(songTitle);
    if (recentSongs.length > 10) recentSongs = recentSongs.slice(0, 10);
    localStorage.setItem('golpoRecentlySongs', JSON.stringify(recentSongs));
}

function saveStoryReadingTime(storyFile, duration) {
    let readingTimes = JSON.parse(localStorage.getItem('golpoStoryReadingTimes') || '{}');
    readingTimes[storyFile] = (readingTimes[storyFile] || 0) + duration;
    localStorage.setItem('golpoStoryReadingTimes', JSON.stringify(readingTimes));
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

function initSecretAnalytics() {
    recentNotifications = JSON.parse(localStorage.getItem('golpoRecentNotifications') || '[]');
    activityLog = JSON.parse(localStorage.getItem('golpoActivityLog') || '[]');
    updateAnalyticsDisplay();
}

function updateAnalyticsDisplay() {
    const favoritesList = document.getElementById('favoriteStoriesList');
    const recentSongsList = document.getElementById('recentlyPlayedSongsList');
    const readingTimeList = document.getElementById('readingTimeList');
    const activityTimeline = document.getElementById('activityTimeline');
    const notificationsList = document.getElementById('recentNotificationsList');

    if (favoritesList) {
        if (favoriteStories.length > 0) {
            favoritesList.innerHTML = favoriteStories.map(f => {
                const story = storyDatabase[f];
                return story ? `
                    <div class="analytics-item">
                        <div class="analytics-item-icon"><i class="fas fa-star"></i></div>
                        <div class="analytics-item-content">
                            <div class="analytics-item-title">${story.name}</div>
                            <div class="analytics-item-meta">${story.category || 'Story'}</div>
                        </div>
                    </div>
                ` : '';
            }).join('');
        } else {
            favoritesList.innerHTML = '<p class="empty-msg">No favorites yet</p>';
        }
    }

    if (recentSongsList) {
        const recentSongs = JSON.parse(localStorage.getItem('golpoRecentlySongs') || '[]');
        if (recentSongs.length > 0) {
            recentSongsList.innerHTML = recentSongs.slice(0, 5).map(songTitle => `
                <div class="analytics-item">
                    <div class="analytics-item-icon"><i class="fas fa-music"></i></div>
                    <div class="analytics-item-content">
                        <div class="analytics-item-title">${songTitle}</div>
                    </div>
                </div>
            `).join('');
        } else {
            recentSongsList.innerHTML = '<p class="empty-msg">No songs played yet</p>';
        }
    }

    if (readingTimeList) {
        const readingTimes = JSON.parse(localStorage.getItem('golpoStoryReadingTimes') || '{}');
        const sortedStories = Object.entries(readingTimes).sort((a, b) => b[1] - a[1]).slice(0, 5);
        if (sortedStories.length > 0) {
            readingTimeList.innerHTML = sortedStories.map(([file, time]) => {
                const story = storyDatabase[file];
                return story ? `
                    <div class="analytics-item">
                        <div class="analytics-item-icon"><i class="fas fa-book-reader"></i></div>
                        <div class="analytics-item-content">
                            <div class="analytics-item-title">${story.name}</div>
                        </div>
                        <div class="analytics-item-value">${formatDuration(time)}</div>
                    </div>
                ` : '';
            }).join('');
        } else {
            readingTimeList.innerHTML = '<p class="empty-msg">No reading data yet</p>';
        }
    }

    if (activityTimeline) {
        if (activityLog.length > 0) {
            activityTimeline.innerHTML = activityLog.slice(0, 8).map(activity => `
                <div class="analytics-item">
                    <div class="analytics-item-content">
                        <div class="analytics-item-title">${activity.action}</div>
                        <div class="analytics-item-meta">${activity.details} - ${formatTimeAgo(activity.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            activityTimeline.innerHTML = '<p class="empty-msg">No activity yet</p>';
        }
    }

    if (notificationsList) {
        if (recentNotifications.length > 0) {
            const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
            notificationsList.innerHTML = recentNotifications.slice(0, 5).map(n => `
                <div class="analytics-item">
                    <div class="analytics-item-icon"><i class="fas ${iconMap[n.type] || 'fa-bell'}"></i></div>
                    <div class="analytics-item-content">
                        <div class="analytics-item-title">${n.message}</div>
                        <div class="analytics-item-meta">${formatTimeAgo(n.timestamp)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            notificationsList.innerHTML = '<p class="empty-msg">No notifications yet</p>';
        }
    }
}

function showAnalyticsDashboard() {
    updateAnalyticsDisplay();
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.classList.add('show');
        showNotification('Analytics dashboard opened', 'info');
    }
}
window.showAnalyticsDashboard = showAnalyticsDashboard;

function initializeOfflineSupport() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(reg => {
                serviceWorkerRegistration = reg;
                console.log('Service Worker registered');
            })
            .catch(err => console.log('SW registration failed:', err));
    }
}

function setupOfflineIndicators() {
    const indicator = document.getElementById('offlineIndicator');
    if (!indicator) return;

    const indicatorText = document.getElementById('offlineIndicatorText');
    const indicatorIcon = indicator.querySelector('i');

    function updateIndicator(online) {
        if (online) {
            indicator.classList.remove('offline');
            indicator.classList.add('online');
            if (indicatorText) indicatorText.textContent = 'Online';
            if (indicatorIcon) {
                indicatorIcon.className = 'fas fa-wifi';
            }
        } else {
            indicator.classList.remove('online');
            indicator.classList.add('offline');
            if (indicatorText) indicatorText.textContent = 'Offline';
            if (indicatorIcon) {
                indicatorIcon.className = 'fas fa-wifi-slash';
            }
        }
        
        indicator.classList.add('show');
        
        // Hide after 3 seconds if online, keep visible if offline
        setTimeout(() => {
            if (online) {
                indicator.classList.remove('show');
            }
        }, 3000);
    }

    // Initial state
    updateIndicator(navigator.onLine);

    // Listen for online/offline events
    window.addEventListener('online', () => {
        isOnline = true;
        updateIndicator(true);
        showNotification('You are back online', 'success');
    });

    window.addEventListener('offline', () => {
        isOnline = false;
        updateIndicator(false);
        showNotification('You are offline', 'warning');
    });
}

function initializePerformanceOptimizations() {
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.story-card').forEach(card => observer.observe(card));
    }
}

function initializePWAInstall() {
    const popup = document.getElementById('pwaInstallPopup');
    const installBtn = document.getElementById('pwaInstallBtn');
    const closeBtn = document.getElementById('pwaCloseBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;

        setTimeout(() => {
            if (popup && !localStorage.getItem('pwaInstallDismissed')) {
                popup.classList.add('show');
            }
        }, 5000);
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    showNotification('App installed successfully!', 'success');
                }
                deferredPrompt = null;
                if (popup) popup.classList.remove('show');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (popup) popup.classList.remove('show');
            localStorage.setItem('pwaInstallDismissed', 'true');
        });
    }

    window.addEventListener('appinstalled', () => {
        showNotification('Golpo has been installed!', 'success');
        if (popup) popup.classList.remove('show');
    });
}

window.loadStoryFromCard = loadStoryFromCard;
window.loadStoryFromSuggestion = loadStoryFromSuggestion;

let scrollAnimationObserver = null;

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    if (!scrollAnimationObserver) {
        scrollAnimationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, observerOptions);
    }

    document.querySelectorAll('.story-card').forEach((card, i) => {
        if (!card.classList.contains('revealed') && !card.classList.contains('reveal')) {
            card.style.transitionDelay = `${i * 0.1}s`;
            card.classList.add('reveal');
            scrollAnimationObserver.observe(card);
        }
    });

    document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-scale').forEach(el => {
        if (!el.classList.contains('revealed')) {
            scrollAnimationObserver.observe(el);
        }
    });
}
window.initScrollAnimations = initScrollAnimations;

function initCardHoverEffects() {
    const cards = document.querySelectorAll('.story-card');

    cards.forEach(card => {
        if (card.dataset.hoverInitialized) return;
        card.dataset.hoverInitialized = 'true';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
window.initCardHoverEffects = initCardHoverEffects;

document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCardHoverEffects();
});