// Global Variables
var currentTheme = 'dark';
var currentStory = '';
var currentFontSize = 100;
var isFocusMode = false;
var storyBookmarks = {}; // Per-story bookmarks

// Pagination Variables
var currentPage = 1;
var totalPages = 1;
var linesPerPage = 100;
var storyPages = [];
var isStoryCompleted = false;

// Offline Reading Variables
var isOnline = navigator.onLine;
var serviceWorkerRegistration = null;
var cachedStories = new Set();
var offlineIndicator = null;

// Music Playlist Variables
var musicPlaylist = [
    {
        title: "Tare ami chuye dekhini",
        artist: "MBI FAVORITE",
        url: "https://www.youtube.com/embed/orvJCBTodiY?autoplay=1",
        duration: "4:10",
        icon: "fas fa-star"
    },
    {
        title: "Qusad Einy",
        artist: "Arabic Song",
        url: "https://www.youtube.com/embed/vzvz0LtMrCQ?autoplay=1",
        duration: "4:24",
        icon: "fas fa-music"
    },
    {
        title: "Batman ansak",
        artist: "Arabic Song",
        url: "https://www.youtube.com/embed/kMU97_dBg_U?autoplay=1",
        duration: "3:15",
        icon: "fas fa-music"
    },
    {
        title: "Tumi chaile",
        artist: "Bengala song",
        url: "https://www.youtube.com/embed/5s0Mujwa-r8?autoplay=1",
        duration: "6:14",
        icon: "fas fa-music"
    },
    {
        title: "Meri Duniya Tu",
        artist: "Hindi song",
        url: "https://www.youtube.com/nyRJXc6YqpM?autoplay=1",
        duration: "4:01",
        icon: "fas fa-music"
    },
    {
        title: "Tu",
        artist: "Hindi song",
        url: "https://www.youtube.com/embed/4dkss90fdPc?autoplay=1",
        duration: "2:12",
        icon: "fas fa-music"
    },
    {
        title: "Pal Pal x Jhol",
        artist: "Hindi Mashup",
        url: "https://www.youtube.com/embed/dvawR63DnqE?autoplay=1",
        duration: "4:51",
        icon: "fas fa-music"
    }
];
var currentMusicIndex = 0;
var isPlaylistMode = true;
var autoplayEnabled = true;

// Dynamic Image System - Only 2 images that change per story
var currentBannerImage = '';
var currentReadingImage = '';

// Default fallback images
var defaultImages = {
    banner: 'https://i.postimg.cc/wMDMfnhn/static.png',
    reading: 'https://i.postimg.cc/wMDMfnhn/static.png'
};

// Story Database with metadata including image URLs
var storyDatabase = {
    'bissash.txt': {
        id: 'bissash',
        name: 'বিশ্বাস',
        location: 'Kathora,Shalna,Gazipur',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'A story about trust and faith',
        status: 'available',
        category: 'Romance',
        tags: ['trust', 'faith', 'relationship', 'emotional'],
        banner: 'https://i.postimg.cc/SRhxGb8L/Bissash-wide.png',
        reading: 'https://i.postimg.cc/FKDXWnhy/Bissash-small.png',
        readingTime: 0, // Will be calculated
        wordCount: 0    // Will be calculated
    },
    'Obisaperonontochaya.txt': {
        id: 'Obisaperonontochaya',
        name: 'অভিশাপের অনন্ত ছায়া',
        location: 'Kathora,Shalna,Gazipur',
        writer:'✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'About My Curse',
        status: 'available',
        category: 'Mystry',
        banner: 'https://i.postimg.cc/qMyzHwD1/Obisaperonontochayacover.png',
        reading: 'https://i.postimg.cc/YC7jrFJM/20250918-011638.png',
        readingTime: 0,
        wordCount: 0
    },
    'Valobasha.txt': {
        id: 'Valobasha',
        name: 'ভালোবাসা : এক অন্তহীন মহাবৃত্ত',
        location: 'Kathora,Shalna,Gazipur',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'About love',
        status: 'available',
        category: 'Mystry',
        banner: 'https://i.postimg.cc/gkcPhzjf/Valobashawide.png',
        reading: 'https://i.postimg.cc/sXpRY1pR/Valobashasmall.png',
        readingTime: 0,
        wordCount: 0
    },
    'upcoming.txt': {
        id: 'upcoming',
        name: 'Upcoming Stories',
        location: 'Kathora,Shalna,Gazipur',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'More stories coming soon...',
        status: 'upcoming',
        banner: 'https://i.postimg.cc/wMDMfnhn/static.png',
        reading: 'https://i.postimg.cc/wMDMfnhn/static.png',
        readingTime: 0,
        wordCount: 0
    }
};

// Function to get banner image for a specific story
function getBannerImageForStory(storyId) {
    // Find the story by ID in storyDatabase
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    return storyEntry?.banner || defaultImages.banner;
}

// Function to get reading image for a specific story
function getReadingImageForStory(storyId) {
    // Find the story by ID in storyDatabase
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    return storyEntry?.reading || defaultImages.reading;
}

// Function to load images for current active story (for global access)
function loadStoryImages(storyId) {
    const storyEntry = Object.values(storyDatabase).find(story => story.id === storyId);
    currentBannerImage = storyEntry?.banner || defaultImages.banner;
    currentReadingImage = storyEntry?.reading || defaultImages.reading;
}

// Function to get current banner image
function getCurrentBannerImage() {
    return currentBannerImage || defaultImages.banner;
}

// Function to get current reading image  
function getCurrentReadingImage() {
    return currentReadingImage || defaultImages.reading;
}

// Function to get story metadata by filename
function getStoryMetadata(filename) {
    const metadata = storyDatabase[filename] || {
        id: filename.replace('.txt', ''),
        name: 'Unknown Story',
        location: 'Unknown Location',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'Story description not available',
        status: 'available',
        readingTime: 0,
        wordCount: 0
    };

    // Load images for this story
    loadStoryImages(metadata.id);

    return metadata;
}


// Function to update story metadata
function updateStoryMetadata(filename, updates) {
    if (storyDatabase[filename]) {
        storyDatabase[filename] = { ...storyDatabase[filename], ...updates };
    }
}

// Function to get all stories from database
function getAllStories() {
    return Object.keys(storyDatabase).map(filename => ({
        file: filename,
        ...storyDatabase[filename]
    }));
}

// DOM Elements  
var musicSelector = document.getElementById('musicSelector');
// Removed storyTitle reference - using readerStoryTitle in new UI
var storyContent = document.getElementById('storyContent');
var playPauseBtn = document.getElementById('playPauseBtn');
var themeToggle = document.getElementById('themeToggle');
var logoText = document.querySelector('.logo-text');
var audioPlayer = document.getElementById('audioPlayer');
var youtubeFrame = document.getElementById('youtubeFrame');
var progressBar = document.getElementById('progressBar');
var progressPercentage = document.getElementById('progressPercentage');
var progressFill = document.getElementById('progressFill');

// Modal Elements
var storyModal = document.getElementById('storyModal');
var musicModal = document.getElementById('musicModal');
var storyModalOverlay = document.getElementById('storyModalOverlay');
var musicModalOverlay = document.getElementById('musicModalOverlay');
var closeStoryModal = document.getElementById('closeStoryModal');
var closeMusicModal = document.getElementById('closeMusicModal');

// Startup Screen Elements
var startupScreen = document.getElementById('startupScreen');

// Reading Controls Elements
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

// YouTube Player State
var isYouTubePlaying = false;
var currentYouTubeUrl = '';

// Startup Screen State
var startupDismissed = false;

// Startup Screen Functions
function setupStartupScreen() {
    if (startupScreen) {
        // Use single pointer event to handle both touch and mouse, with once option
        startupScreen.addEventListener('pointerdown', dismissStartupScreen, { once: true });

        // Add keyboard support (Enter or Space to continue)
        document.addEventListener('keydown', function(e) {
            if (!startupDismissed && startupScreen && startupScreen.style.display !== 'none' && 
                (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                dismissStartupScreen(e);
            }
        });
    }
}

function dismissStartupScreen(e) {
    // Prevent double initialization
    if (startupDismissed || !startupScreen) {
        return false;
    }

    // Prevent event propagation and default behavior
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Mark as dismissed
    startupDismissed = true;

    // Add fade-out class for smooth animation
    startupScreen.classList.add('fade-out');

    // Save that user has seen startup
    localStorage.setItem('hasSeenStartup', '1');

    // Remove startup screen after animation completes
    setTimeout(() => {
        if (startupScreen) {
            startupScreen.style.display = 'none';
        }

        // Enable interactions with main content
        document.body.style.overflow = 'auto';

        // Initialize main app functionality
        initializeMainApp();
    }, 800); // Match the CSS animation duration

    return false;
}

// Track if main app is initialized
var mainAppInitialized = false;

function initializeMainApp() {
    // Prevent duplicate initialization
    if (mainAppInitialized) return;
    mainAppInitialized = true;

    // Initialize the main application
    initializeApp();

    // Setup offline indicators
    setupOfflineIndicators();

    // Initialize performance optimizations
    initializePerformanceOptimizations();

    setupEventListeners();
    loadSavedSettings();

    // Initialize secret analytics
    initSecretAnalytics();

    // Setup reading controls outside click handler
    setupReadingControlsOutsideClick();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initially hide scroll on body to prevent background scrolling during startup
    document.body.style.overflow = 'hidden';

    // Initialize offline functionality
    initializeOfflineSupport();

    // Setup startup screen functionality
    setupStartupScreen();

    // Check if user has seen startup screen before (optional - uncomment to skip for returning users)
    const hasSeenStartup = localStorage.getItem('hasSeenStartup');
    if (hasSeenStartup) {
        // Skip startup screen for returning users
        // dismissStartupScreen();
    }

    // Add accessibility support
    if (startupScreen) {
        startupScreen.setAttribute('tabindex', '0');
        startupScreen.setAttribute('role', 'button');
        startupScreen.setAttribute('aria-label', 'Tap to enter Golpo storytelling app');
    }
});

// Function to load story from story card click
function loadStoryFromCard(storyFile) {
    // Switch to reader view
    showReaderView();
    // Load the story
    loadStory(storyFile);
    // Update cover image in reader
    updateReaderCoverImage(storyFile);
}

// Function to load story from suggestion card click
function loadStoryFromSuggestion(storyFile) {
    // Switch to reader view
    showReaderView();
    // Load the story
    loadStory(storyFile);
    // Update cover image in reader
    updateReaderCoverImage(storyFile);
    // Hide story suggestions and show the story
    const storySuggestions = document.getElementById('storySuggestions');
    if (storySuggestions) {
        storySuggestions.style.display = 'none';
    }
}

// Function to create story suggestions HTML
function createStorySuggestions(currentStoryFile) {
    // Get all available stories from database
    const stories = getAllStories();

    // Filter out the current story
    const otherStories = stories.filter(story => story.file !== currentStoryFile);

    if (otherStories.length === 0) return '';

    let suggestionsHTML = `
        <div class="story-end-suggestions">
            <h2 class="suggestions-title english-text">More Stories to Explore</h2>
            <div class="suggestions-grid">
    `;

    otherStories.forEach(story => {
        const statusClass = story.status === 'upcoming' ? 'upcoming' : '';
        // Get reading image for this specific story
        const suggestionImage = getReadingImageForStory(story.id);

        suggestionsHTML += `
            <div class="suggestion-card ${statusClass}" onclick="loadStoryFromSuggestion('${story.file}')">
                <div class="suggestion-cover">
                    <img src="${suggestionImage}" alt="${story.name}" loading="lazy">
                    <div class="suggestion-overlay">
                        <i class="fas fa-${story.status === 'upcoming' ? 'clock' : 'play'}"></i>
                    </div>
                </div>
                <div class="suggestion-content">
                    <h3 class="suggestion-title ${story.file === 'upcoming.txt' ? 'english-text' : ''}">${story.name}</h3>
                    <p class="suggestion-description english-text">${story.description}</p>
                    <div class="suggestion-meta english-text">
                        <span class="author">${story.writer}</span>
                        <span class="status ${story.status}">${story.status === 'upcoming' ? 'Coming Soon' : 'Read Now'}</span>
                    </div>
                </div>
            </div>
        `;
    });

    suggestionsHTML += `
            </div>
        </div>
    `;

    return suggestionsHTML;
}

// New UI Functions
function showReaderView() {
    document.getElementById('libraryView').style.display = 'none';
    document.getElementById('readerView').style.display = 'block';

    // Show reading controls and progress on reader page
    if (progressContainer) {
        progressContainer.style.display = 'flex';
        progressContainer.style.visibility = 'visible';
        progressContainer.style.opacity = '1';
    }
    if (readingControlsDropdown) {
        readingControlsDropdown.style.display = 'inline-block';
        readingControlsDropdown.style.visibility = 'visible';
        readingControlsDropdown.style.opacity = '1';
    }

    // Hide navigation in focus mode
    if (isFocusMode) {
        document.querySelector('.nav-container').style.opacity = '0';
        document.querySelector('.footer').style.opacity = '0';
    }
}

function returnToLibrary() {
    document.getElementById('readerView').style.display = 'none';
    document.getElementById('libraryView').style.display = 'block';

    // Hide reading controls and progress on landing page
    if (progressContainer) {
        progressContainer.style.display = 'none';
        progressContainer.style.visibility = 'hidden';
        progressContainer.style.opacity = '0';
    }
    if (readingControlsDropdown) {
        readingControlsDropdown.style.display = 'none';
        readingControlsDropdown.style.visibility = 'hidden';
        readingControlsDropdown.style.opacity = '0';
        readingControlsDropdown.classList.remove('active');
    }

    // Show navigation again
    document.querySelector('.nav-container').style.opacity = '1';
    if (document.querySelector('.footer')) {
        document.querySelector('.footer').style.opacity = '1';
    }

    // Reset story content
    resetReaderView();
}

// Export to global scope for inline onclick handlers
window.returnToLibrary = returnToLibrary;
window.displayPage = displayPage;

function resetReaderView() {
    // Clear story content
    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.innerHTML = '';
    }

    // Reset progress
    updateReaderProgress(0);

    // Reset story title and details
    const readerStoryTitle = document.getElementById('readerStoryTitle');
    if (readerStoryTitle) {
        readerStoryTitle.textContent = 'Select a Story';
    }

    // Reset reading details
    const readerReadingTime = document.getElementById('readerReadingTime');
    const readerWordCount = document.getElementById('readerWordCount');
    if (readerReadingTime) {
        readerReadingTime.textContent = '~0 min read';
    }
    if (readerWordCount) {
        readerWordCount.textContent = '~0 words';
    }
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

function performGlobalSearch() {
    const query = document.getElementById('globalSearch').value.toLowerCase().trim();
    if (!query) {
        highlightSearchResults([]);
        return;
    }

    // Get story metadata from database for searching
    const allStories = getAllStories();
    const storyMetadata = {};

    allStories.forEach(story => {
        storyMetadata[story.file] = {
            title: story.name,
            description: story.description,
            location: story.location,
            writer: story.writer,
            keywords: [
                story.name.toLowerCase(),
                story.description.toLowerCase(),
                story.location.toLowerCase(),
                story.writer.toLowerCase(),
                'bengali', 'story'
            ]
        };
    });

    // Search through story metadata and content
    const results = Object.keys(storyMetadata).filter(storyFile => {
        const metadata = storyMetadata[storyFile];
        const searchableText = `${metadata.title} ${metadata.description} ${metadata.keywords.join(' ')}`.toLowerCase();

        // Check if query matches title, description, or keywords
        return searchableText.includes(query) || 
               metadata.keywords.some(keyword => keyword.toLowerCase().includes(query));
    });

    // Highlight matching story cards
    highlightSearchResults(results);

    // Show search feedback
    showSearchFeedback(query, results.length);
}

// Function to prompt user to jump to specific page
function promptPageJump() {
    if (!currentStory || totalPages <= 1) return;

    const pageNum = prompt(`Jump to page (1-${totalPages}):`, currentPage);
    if (pageNum) {
        const targetPage = parseInt(pageNum);
        if (targetPage >= 1 && targetPage <= totalPages) {
            displayPage(targetPage);
            showNotification(`Jumped to page ${targetPage}`, 'success', 2000);
        } else {
            showNotification('Invalid page number', 'error', 2000);
        }
    }
}

// Export to global scope
window.promptPageJump = promptPageJump;

function showSearchFeedback(query, resultCount) {
    // Remove existing feedback
    const existingFeedback = document.querySelector('.search-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Add new feedback
    const searchSection = document.getElementById('searchSection');
    const feedback = document.createElement('div');
    feedback.className = 'search-feedback';
    feedback.innerHTML = `
        <p class="english-text">
            ${resultCount > 0 
                ? `Found ${resultCount} story${resultCount > 1 ? 's' : ''} matching "${query}"` 
                : `No stories found matching "${query}"`
            }
        </p>
    `;
    searchSection.appendChild(feedback);

    // Remove feedback after 3 seconds
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.remove();
        }
    }, 3000);
}

function highlightSearchResults(results) {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach(card => {
        const storyFile = card.dataset.story;
        if (results.includes(storyFile)) {
            card.style.border = '2px solid var(--accent-color)';
            card.style.transform = 'translateY(-2px)';
        } else {
            card.style.border = '';
            card.style.transform = '';
            card.style.opacity = results.length > 0 ? '0.5' : '1';
        }
    });

    // Reset after 3 seconds
    setTimeout(() => {
        storyCards.forEach(card => {
            card.style.border = '';
            card.style.transform = '';
            card.style.opacity = '1';
        });
    }, 3000);
}

// Category Filter Function
function filterByCategory(category) {
    const storyCards = document.querySelectorAll('.story-card');
    const filterButtons = document.querySelectorAll('.category-filter-btn');

    // Update active button
    filterButtons.forEach(btn => {
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Filter stories
    storyCards.forEach(card => {
        const storyFile = card.dataset.story;
        const storyData = storyDatabase[storyFile];

        if (category === 'all') {
            card.style.display = '';
            card.style.opacity = '1';
        } else {
            const storyCategory = storyData?.category || '';
            const storyTags = storyData?.tags || [];

            const matches = storyCategory === category || storyTags.includes(category.toLowerCase());

            if (matches) {
                card.style.display = '';
                card.style.opacity = '1';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
            }
        }
    });

    // Show feedback
    const visibleCards = Array.from(storyCards).filter(card => card.style.display !== 'none');
    if (category !== 'all') {
        showNotification(`Showing ${visibleCards.length} ${category} ${visibleCards.length === 1 ? 'story' : 'stories'}`, 'info', 2000);
    }
}

// Export to global scope
window.filterByCategory = filterByCategory;

// Table of Contents Feature
var storyTOC = [];

function toggleTOC() {
    const tocModal = document.getElementById('tocModal');
    if (tocModal) {
        if (tocModal.classList.contains('active')) {
            tocModal.classList.remove('active');
        } else {
            tocModal.classList.add('active');
            generateTOC();
        }
    }
}

function generateTOC() {
    const storyContent = document.getElementById('storyContent');
    const tocContainer = document.getElementById('tocContainer');

    if (!storyContent || !tocContainer) return;

    // Clear existing TOC
    storyTOC = [];
    tocContainer.innerHTML = '';

    // Find all paragraphs that look like headings (shorter lines, possibly numbered)
    const paragraphs = storyContent.querySelectorAll('p');
    let tocItems = [];

    paragraphs.forEach((p, index) => {
        const text = p.textContent.trim();
        const words = text.split(/\s+/).length;

        // Detect potential headings (short lines, numbered sections, or specific patterns)
        const isShortLine = words <= 8 && text.length < 60;
        const isNumbered = /^(\d+\.|অধ্যায়|পর্ব|ভাগ|Chapter|Part)\s*/i.test(text);
        const hasColon = text.includes(':') && words <= 10;

        if ((isShortLine || isNumbered || hasColon) && text.length > 5) {
            const tocItem = {
                text: text,
                index: index,
                element: p
            };
            tocItems.push(tocItem);
            storyTOC.push(tocItem);
        }
    });

    // If we have TOC items, display them
    if (tocItems.length > 0) {
        tocItems.forEach((item, idx) => {
            const tocElement = document.createElement('div');
            tocElement.className = 'toc-item';
            tocElement.innerHTML = `
                <div class="toc-item-number">${idx + 1}</div>
                <div class="toc-item-text">${item.text}</div>
            `;
            tocElement.onclick = () => jumpToSection(item.element);
            tocContainer.appendChild(tocElement);
        });

        // Show TOC button
        const tocBtn = document.getElementById('tocBtn');
        if (tocBtn) tocBtn.style.display = 'flex';
    } else {
        tocContainer.innerHTML = '<p class="toc-empty english-text">No table of contents available for this story.</p>';

        // Hide TOC button if no sections found
        const tocBtn = document.getElementById('tocBtn');
        if (tocBtn) tocBtn.style.display = 'none';
    }
}

function jumpToSection(element) {
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Close TOC modal
        const tocModal = document.getElementById('tocModal');
        if (tocModal) tocModal.classList.remove('active');

        // Highlight the section briefly
        element.style.backgroundColor = 'var(--accent-color)';
        element.style.color = 'white';
        element.style.padding = '0.5rem';
        element.style.borderRadius = '8px';
        element.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            element.style.backgroundColor = '';
            element.style.color = '';
            element.style.padding = '';
        }, 2000);

        showNotification('Jumped to section', 'success', 1500);
    }
}

// Export to global scope
window.toggleTOC = toggleTOC;

// Secret Analytics Dashboard
var analyticsData = {
    totalReadingTime: 0,
    sessionsCount: 0,
    completedStories: [],
    readingHistory: [],
    themeChanges: {},
    categoryViews: {}
};

function initSecretAnalytics() {
    // Load saved analytics data
    const saved = localStorage.getItem('golpoAnalytics');
    if (saved) {
        try {
            analyticsData = JSON.parse(saved);
        } catch (e) {
            console.error('Failed to load analytics:', e);
        }
    }

    // Add click listener specifically for footer elements only
    document.addEventListener('click', function(e) {
        // Only trigger if clicking on footer logo or footer text that contains author name
        const isFooterLogoClick = e.target.classList.contains('footer-logo');

        // Check if clicking on footer text that contains author name
        const isFooterAuthorClick = e.target.closest('.footer-left') && 
                                   (e.target.textContent.includes('MʙɪㅤDᴀʀᴋ') || 
                                    e.target.textContent.includes('MBI'));

        if (isFooterLogoClick || isFooterAuthorClick) {
            e.preventDefault();
            e.stopPropagation();
            openAnalyticsDashboard();
        }
    });
}

function openAnalyticsDashboard() {
    const modal = document.getElementById('analyticsModal');
    if (modal) {
        modal.classList.add('active');
        updateAnalyticsDisplay();
        showNotification('Secret Dashboard Unlocked!', 'success', 2000);
    }
}

function updateAnalyticsDisplay() {
    // Calculate reading speed
    const avgSpeed = calculateAverageReadingSpeed();
    document.getElementById('avgReadingSpeed').textContent = avgSpeed;

    // Calculate average session time
    const avgSession = calculateAverageSessionTime();
    document.getElementById('avgSessionTime').textContent = avgSession;

    // Calculate completion rate
    const completionRate = calculateCompletionRate();
    document.getElementById('completionRate').textContent = completionRate + '%';

    // Get favorite category
    const favCategory = getFavoriteCategory();
    document.getElementById('favCategory').textContent = favCategory;

    // Get current theme
    document.getElementById('favTheme').textContent = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1);

    // Get current font size
    document.getElementById('favFontSize').textContent = currentFontSize + '%';

    // Update timeline
    updateActivityTimeline();
}

function calculateAverageReadingSpeed() {
    if (analyticsData.totalReadingTime === 0) return '0';
    const stats = JSON.parse(localStorage.getItem('golpoStats') || '{}');
    const totalWords = stats.totalWordsRead || 0;
    const speed = Math.round(totalWords / (analyticsData.totalReadingTime / 60));
    return speed > 0 ? speed : '150';
}

function calculateAverageSessionTime() {
    if (analyticsData.sessionsCount === 0) return '0m';
    const avgMinutes = Math.round(analyticsData.totalReadingTime / analyticsData.sessionsCount);
    return avgMinutes > 0 ? avgMinutes + 'm' : '5m';
}

function calculateCompletionRate() {
    const totalStories = Object.keys(storyDatabase).filter(key => key !== 'upcoming.txt').length;
    const completed = analyticsData.completedStories.length;
    return totalStories > 0 ? Math.round((completed / totalStories) * 100) : 0;
}

function getFavoriteCategory() {
    const categories = Object.values(analyticsData.categoryViews);
    if (categories.length === 0) return 'Romance';

    const maxViews = Math.max(...categories);
    const favCat = Object.keys(analyticsData.categoryViews).find(
        key => analyticsData.categoryViews[key] === maxViews
    );
    return favCat || 'Romance';
}

function updateActivityTimeline() {
    const timeline = document.getElementById('analyticsTimeline');
    if (!timeline) return;

    const history = analyticsData.readingHistory.slice(-5).reverse();

    if (history.length === 0) {
        timeline.innerHTML = '<p class="english-text" style="text-align: center; color: var(--text-muted);">No recent activity</p>';
        return;
    }

    timeline.innerHTML = history.map(item => `
        <div class="timeline-item">
            <div class="timeline-time">${formatTimestamp(item.timestamp)}</div>
            <div class="timeline-action">${item.action}</div>
        </div>
    `).join('');
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.round(diffMins / 60)} hours ago`;
    return `${Math.round(diffMins / 1440)} days ago`;
}

function trackAnalyticsEvent(action, details = {}) {
    const event = {
        action: action,
        details: details,
        timestamp: Date.now()
    };

    analyticsData.readingHistory.push(event);

    // Keep only last 50 events
    if (analyticsData.readingHistory.length > 50) {
        analyticsData.readingHistory = analyticsData.readingHistory.slice(-50);
    }

    // Save to localStorage
    localStorage.setItem('golpoAnalytics', JSON.stringify(analyticsData));
}

// Export to global scope
window.openAnalyticsDashboard = openAnalyticsDashboard;

function updateReaderCoverImage(filename) {
    const readerCoverImage = document.getElementById('readerCoverImage');
    if (readerCoverImage && filename) {
        const storyData = getStoryMetadata(filename);
        const readingImage = getReadingImageForStory(storyData.id);

        // Defensive fallback if image is undefined or empty
        if (!readingImage || readingImage === '') {
            console.warn('No reading image found for story:', storyData.id, 'using default');
            readerCoverImage.src = defaultImages.reading;
        } else {
            readerCoverImage.src = readingImage;
        }

        readerCoverImage.alt = storyData.name + ' - Story Photo';
    }
}

// Story navigation functions removed - navigation now only available on last page of story

function updateReaderProgress(percentage) {
    const progressBar = document.getElementById('readerProgressBar');
    const progressText = document.getElementById('readerProgressText');

    if (progressBar) {
        progressBar.style.setProperty('--progress', percentage + '%');
    }
    if (progressText) {
        progressText.textContent = Math.round(percentage) + '%';
    }
}

function continuePreviousReading() {
    // Get last read story from localStorage
    const lastReadingSession = JSON.parse(localStorage.getItem('lastReadingSession') || '{}');
    const lastStory = lastReadingSession.story || Object.keys(storyBookmarks)[0] || 'bissash.txt';

    // Load the story
    loadStoryFromCard(lastStory);

    // Restore both page and scroll position after story loads
    setTimeout(() => {
        // Get saved page from reading session (preferred) or from individual page storage
        const savedPage = lastReadingSession.currentPage || safeStorage.get(`page_${lastStory}`, 1);

        if (savedPage && savedPage > 1) {
            // Navigate to the saved page first
            displayPage(savedPage);
            // Wait longer for page content to render completely
            setTimeout(() => {
                if (lastReadingSession.scrollPosition) {
                    window.scrollTo({
                        top: lastReadingSession.scrollPosition,
                        behavior: 'smooth'
                    });
                }
            }, 800);
        } else {
            // For page 1, just restore scroll position
            if (lastReadingSession.scrollPosition) {
                setTimeout(() => {
                    window.scrollTo({
                        top: lastReadingSession.scrollPosition,
                        behavior: 'smooth'
                    });
                }, 200);
            }
        }
    }, 1000);
}

function saveReadingSession(storyFile, scrollPosition = 0) {
    const readingSession = {
        story: storyFile,
        scrollPosition: scrollPosition,
        currentPage: currentPage || 1,
        timestamp: Date.now()
    };
    localStorage.setItem('lastReadingSession', JSON.stringify(readingSession));
    updateContinueReadingVisibility();
}

function hasRecentReadingSession() {
    const lastSession = JSON.parse(localStorage.getItem('lastReadingSession') || '{}');
    if (!lastSession.timestamp) return false;

    // Consider session recent if within 7 days
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return lastSession.timestamp > weekAgo;
}

function calculateReadingTime(content) {
    // Average reading speed: 200 words per minute
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
}

function updateStoryDetails(filename, content) {
    const readingTime = calculateReadingTime(content);
    const wordCount = content.split(/\s+/).length;

    const readerReadingTime = document.getElementById('readerReadingTime');
    const readerWordCount = document.getElementById('readerWordCount');

    if (readerReadingTime) {
        readerReadingTime.textContent = `~${readingTime} min read`;
    }
    if (readerWordCount) {
        readerWordCount.textContent = `~${wordCount.toLocaleString()} words`;
    }
}

// Track if app is initialized
var appInitialized = false;

// Initialize application
function initializeApp() {
    // Prevent duplicate initialization
    if (appInitialized) return;
    appInitialized = true;

    // Set default theme
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    // Initialize audio player with safety check
    const audioPlayer = document.getElementById('audioPlayer');
    if (audioPlayer) {
        audioPlayer.volume = 0.7;
    }

    // Initialize play/pause button icon
    updatePlayPauseButton(true);

    // Show library view by default
    const libraryView = document.getElementById('libraryView');
    const readerView = document.getElementById('readerView');
    if (libraryView) libraryView.style.display = 'block';
    if (readerView) readerView.style.display = 'none';

    // Initialize continue reading visibility
    updateContinueReadingVisibility();

    // Initialize story grid from HTML data attributes
    initializeStoryGrid();

    // Initialize music system (generate playlist and start autoplay)
    initializeMusicSystem();

    // Setup search input event listener
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce(performGlobalSearch, 300));
        globalSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performGlobalSearch();
            }
        });
    }

    // Initialize advanced visual effects after DOM is fully loaded
    setTimeout(() => {
        try {
            if (typeof initializeAdvancedEffects !== 'undefined') {
                initializeAdvancedEffects();
                console.log('Advanced visual effects initialized');
            }
        } catch (error) {
            console.log('Advanced visual effects not available:', error.message);
        }
    }, 500);
}

// Setup reading progress tracking for reader view
function setupReaderProgress() {
    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    let storyCompleted = false;

    // Create intersection observer for progress tracking
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const paragraphs = Array.from(storyContent.querySelectorAll('p'));
                const visibleIndex = paragraphs.indexOf(entry.target);
                const progress = ((visibleIndex + 1) / paragraphs.length) * 100;
                updateReaderProgress(progress);

                // Also update main nav progress
                const progressPercentage = document.getElementById('progressPercentage');
                const progressFill = document.getElementById('progressFill');
                if (progressPercentage) {
                    progressPercentage.textContent = Math.round(progress) + '%';
                }
                if (progressFill) {
                    progressFill.style.width = progress + '%';
                }

                // Check if story is completed (reached the last paragraph)
                if (progress >= 95 && !storyCompleted && currentStory) {
                    storyCompleted = true;
                    setTimeout(() => {
                        showStoryCompletionSuggestions();
                    }, 1000); // Small delay to ensure smooth experience
                }
            }
        });
    }, { threshold: 0.5 });

    // Observe all paragraphs
    storyContent.querySelectorAll('p').forEach(p => {
        observer.observe(p);
    });
}

// Pagination Functions
function createPagination(content) {
    const lines = content.split('\n').filter(line => line.trim() !== '');
    storyPages = [];

    // Ensure exactly 100 lines per page (no more, no less)
    for (let i = 0; i < lines.length; i += 100) {
        const pageLines = lines.slice(i, i + 100);
        storyPages.push(pageLines.join('\n'));
    }

    totalPages = storyPages.length;
    currentPage = 1;
    isStoryCompleted = false;

    console.log(`Story paginated into ${totalPages} pages with exactly 100 lines per page (except last page: ${lines.length % 100} lines)`);

    return storyPages;
}

function displayPage(pageNumber) {
    if (pageNumber < 1 || pageNumber > totalPages) return;

    currentPage = pageNumber;
    const storyContent = document.getElementById('storyContent');

    if (!storyContent) return;

    // Clear content and show current page
    storyContent.innerHTML = '';

    const pageContent = storyPages[pageNumber - 1];
    const paragraphs = pageContent.split('\n').filter(p => p.trim() !== '');

    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.className = 'bangla-text';
        p.textContent = paragraph.trim();
        storyContent.appendChild(p);
    });

// Volume control removed - YouTube iframes don't support external volume control


    // Add pagination controls
    addPaginationControls();

    // Check if this is the last page and story is completed
    if (pageNumber === totalPages && !isStoryCompleted) {
        isStoryCompleted = true;
        setTimeout(() => {
            showStoryCompletionSuggestions();
        }, 1000);
    }

    // Save current page immediately when changed
    if (currentStory) {
        safeStorage.set(`page_${currentStory}`, currentPage);
        saveReadingSession(currentStory, window.pageYOffset);
    }

    // Update focus exit button progress if in focus mode
    if (isFocusMode) {
        updateFocusExitButtonProgress();
    }

    // Update bookmark button to show correct page info
    updateBookmarkButton();

    // Scroll to top of content
    window.scrollTo({ top: 300, behavior: 'smooth' });
}

function addPaginationControls() {
    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    // Remove existing pagination
    const existingPagination = storyContent.querySelector('.pagination-container');
    if (existingPagination) {
        existingPagination.remove();
    }

    // Create pagination container
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-nav-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i><span>Previous</span>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            displayPage(currentPage - 1);
        }
    };

    // Page info with jump functionality
    const pageInfo = document.createElement('div');
    pageInfo.className = 'page-info';
    pageInfo.innerHTML = `
        <div class="page-current" onclick="promptPageJump()" style="cursor: pointer;" title="Click to jump to page">Page ${currentPage}</div>
        <div class="page-total">of ${totalPages}</div>
        <div class="page-dots">
            ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                    pageNum = i + 1;
                } else {
                    const start = Math.max(1, currentPage - 2);
                    const end = Math.min(totalPages, start + 4);
                    pageNum = start + i;
                    if (pageNum > end) return '';
                }
                return `<div class="page-dot ${pageNum === currentPage ? 'active' : ''}" onclick="displayPage(${pageNum})" title="Go to page ${pageNum}"></div>`;
            }).join('')}
        </div>
    `;

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-nav-btn';
    nextBtn.innerHTML = '<span>Next</span><i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            displayPage(currentPage + 1);
        }
    };

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextBtn);

    storyContent.appendChild(paginationContainer);

    // Add story navigation buttons only on the last page
    if (currentPage === totalPages) {
        addStoryNavigationButtons();
    }
}

function addStoryNavigationButtons() {
    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    // Remove existing story navigation
    const existingStoryNav = storyContent.querySelector('.story-navigation-container');
    if (existingStoryNav) {
        existingStoryNav.remove();
    }

    // Create story navigation container
    const storyNavContainer = document.createElement('div');
    storyNavContainer.className = 'story-navigation-container';
    storyNavContainer.style.cssText = `
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        margin-top: 2rem;
        padding: 1.5rem;
        background: var(--glass-bg);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        border: 1px solid var(--glass-border);
    `;

    // Get current story info for navigation
    const stories = Object.keys(storyDatabase);
    const currentIndex = stories.indexOf(currentStory);

    // Previous story button
    const prevStoryBtn = document.createElement('button');
    prevStoryBtn.className = 'story-nav-btn prev-story-btn';
    prevStoryBtn.innerHTML = '<i class="fas fa-chevron-left"></i><span>Previous Story</span>';
    prevStoryBtn.disabled = currentIndex <= 0;
    prevStoryBtn.style.cssText = `
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 12px 20px;
        border-radius: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        min-width: 150px;
        justify-content: center;
    `;

    if (currentIndex > 0) {
        const prevStoryFile = stories[currentIndex - 1];
        const prevStoryName = getStoryMetadata(prevStoryFile).name;
        prevStoryBtn.onclick = () => loadStoryFromCard(prevStoryFile);
        prevStoryBtn.title = `Load: ${prevStoryName}`;
    }

    // Next story button
    const nextStoryBtn = document.createElement('button');
    nextStoryBtn.className = 'story-nav-btn next-story-btn';
    nextStoryBtn.innerHTML = '<span>Next Story</span><i class="fas fa-chevron-right"></i>';
    nextStoryBtn.disabled = currentIndex >= stories.length - 1;
    nextStoryBtn.style.cssText = `
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--text-primary);
        padding: 12px 20px;
        border-radius: 15px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 500;
        transition: all 0.3s ease;
        backdrop-filter: blur(10px);
        min-width: 150px;
        justify-content: center;
    `;

    if (currentIndex < stories.length - 1) {
        const nextStoryFile = stories[currentIndex + 1];
        const nextStoryName = getStoryMetadata(nextStoryFile).name;
        nextStoryBtn.onclick = () => loadStoryFromCard(nextStoryFile);
        nextStoryBtn.title = `Load: ${nextStoryName}`;
    }

    // Add hover styles
    [prevStoryBtn, nextStoryBtn].forEach(btn => {
        if (!btn.disabled) {
            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'var(--accent-color)';
                btn.style.color = 'white';
                btn.style.transform = 'translateY(-2px)';
                btn.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.3)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'var(--glass-bg)';
                btn.style.color = 'var(--text-primary)';
                btn.style.transform = 'translateY(0)';
                btn.style.boxShadow = 'none';
            });
        } else {
            btn.style.opacity = '0.4';
            btn.style.cursor = 'not-allowed';
        }
    });

    storyNavContainer.appendChild(prevStoryBtn);
    storyNavContainer.appendChild(nextStoryBtn);
    storyContent.appendChild(storyNavContainer);
}

// Function to show suggestions after story completion
function showStoryCompletionSuggestions() {
    const storyContent = document.getElementById('storyContent');
    if (!storyContent || !currentStory) return;

    // Check if suggestions already exist
    if (storyContent.querySelector('.story-end-suggestions')) return;

    const suggestionsHTML = createStorySuggestions(currentStory);
    if (suggestionsHTML) {
        const suggestionsDiv = document.createElement('div');
        suggestionsDiv.innerHTML = suggestionsHTML;

        // Insert suggestions after pagination but before any existing content
        const pagination = storyContent.querySelector('.pagination-container');
        if (pagination) {
            pagination.insertAdjacentElement('afterend', suggestionsDiv.firstElementChild);
        } else {
            storyContent.appendChild(suggestionsDiv.firstElementChild);
        }

        // Add smooth fade-in animation
        const suggestions = storyContent.querySelector('.story-end-suggestions');
        if (suggestions) {
            suggestions.style.opacity = '0';
            suggestions.style.transform = 'translateY(20px)';
            suggestions.style.transition = 'all 0.5s ease';

            setTimeout(() => {
                suggestions.style.opacity = '1';
                suggestions.style.transform = 'translateY(0)';
            }, 100);
        }

        // Show notification about completion
        showNotification('🎉 Story completed! Check out more stories below', 'success');
    }
}

function updateContinueReadingVisibility() {
    const continueReading = document.getElementById('continueReading');
    const hasBookmarks = Object.keys(storyBookmarks).length > 0;
    const hasRecentSession = hasRecentReadingSession();

    if (continueReading) {
        continueReading.style.display = (hasBookmarks || hasRecentSession) ? 'block' : 'none';

        // Update button text based on what's available
        const continueBtn = continueReading.querySelector('.continue-btn span');
        if (continueBtn) {
            if (hasRecentSession) {
                const lastSession = JSON.parse(localStorage.getItem('lastReadingSession') || '{}');
                if (lastSession.story) {
                    const storyName = getStoryDisplayName(lastSession.story);
                    continueBtn.textContent = `Continue "${storyName}"`;
                } else {
                    continueBtn.textContent = 'Continue Reading';
                }
            } else {
                continueBtn.textContent = 'Continue Reading';
            }
        }
    }
}

// Track if event listeners are already set up
var eventListenersInitialized = false;

// Setup all event listeners
function setupEventListeners() {
    // Prevent duplicate initialization
    if (eventListenersInitialized) return;
    eventListenersInitialized = true;

    // New modal-based selection
    if (musicSelector) {
        musicSelector.addEventListener('click', openMusicModal);
    }

    // Modal close events
    if (closeStoryModal) {
        closeStoryModal.addEventListener('click', closeStoryModalFunc);
    }
    if (closeMusicModal) {
        closeMusicModal.addEventListener('click', closeMusicModalFunc);
    }
    if (storyModalOverlay) {
        storyModalOverlay.addEventListener('click', closeStoryModalFunc);
    }
    if (musicModalOverlay) {
        musicModalOverlay.addEventListener('click', closeMusicModalFunc);
    }

    // TOC modal events
    const closeTocModal = document.getElementById('closeTocModal');
    const tocModalOverlay = document.getElementById('tocModalOverlay');
    if (closeTocModal) {
        closeTocModal.addEventListener('click', () => {
            const tocModal = document.getElementById('tocModal');
            if (tocModal) tocModal.classList.remove('active');
        });
    }
    if (tocModalOverlay) {
        tocModalOverlay.addEventListener('click', () => {
            const tocModal = document.getElementById('tocModal');
            if (tocModal) tocModal.classList.remove('active');
        });
    }

    // Analytics modal events
    const closeAnalyticsModal = document.getElementById('closeAnalyticsModal');
    const analyticsModalOverlay = document.getElementById('analyticsModalOverlay');
    if (closeAnalyticsModal) {
        closeAnalyticsModal.addEventListener('click', () => {
            const analyticsModal = document.getElementById('analyticsModal');
            if (analyticsModal) analyticsModal.classList.remove('active');
        });
    }
    if (analyticsModalOverlay) {
        analyticsModalOverlay.addEventListener('click', () => {
            const analyticsModal = document.getElementById('analyticsModal');
            if (analyticsModal) analyticsModal.classList.remove('active');
        });
    }

    // Story and music card clicks
    setupCardListeners();

    // Music controls
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', togglePlayPause);
    }

    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Audio player events
    if (audioPlayer) {
        audioPlayer.addEventListener('loadeddata', onAudioLoaded);
        audioPlayer.addEventListener('error', onAudioError);
        audioPlayer.addEventListener('play', onAudioPlay);
        audioPlayer.addEventListener('pause', onAudioPause);
        audioPlayer.addEventListener('ended', onAudioEnded);
    }

    // Reading controls - single event listener with proper handling
    if (readingControlsBtn) {
        readingControlsBtn.addEventListener('click', toggleReadingControls);
    }

    if (decreaseFontBtn) {
        decreaseFontBtn.addEventListener('click', decreaseFontSize);
    }
    if (increaseFontBtn) {
        increaseFontBtn.addEventListener('click', increaseFontSize);
    }
    if (focusModeBtn) {
        focusModeBtn.addEventListener('click', toggleFocusMode);
    }
    if (scrollTopBtn) {
        scrollTopBtn.addEventListener('click', scrollToTop);
    }

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', toggleBookmark);
    }

    // Focus mode exit button
    var focusExitBtn = document.getElementById('focusExitBtn');
    if (focusExitBtn) {
        focusExitBtn.addEventListener('click', toggleFocusMode);
    }

    // Search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }

    // ESC key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeStoryModalFunc();
            closeMusicModalFunc();
        }
    });

    // Logo click to return to library
    const logo = document.querySelector('.nav-left');
    if (logo) {
        logo.addEventListener('click', returnToLibrary);
    }
}


// Display story content
function displayStory(filename, content) {
    // Save reading session
    saveReadingSession(filename, window.pageYOffset);
    // Get story metadata and update title and logo text
    var storyMetadata = getStoryMetadata(filename);
    var storyName = storyMetadata.name;
    var writerName = storyMetadata.writer;
    var storyLocation = storyMetadata.location;

    // Update reader view elements
    const readerStoryTitle = document.getElementById('readerStoryTitle');
    const readerAuthor = document.getElementById('readerAuthor');

    if (readerStoryTitle) {
        readerStoryTitle.textContent = storyName;
        readerStoryTitle.className = 'story-title-large';
        if (filename !== 'upcoming.txt') {
            readerStoryTitle.style.fontFamily = "'BanglaFont', 'Noto Sans Bengali', sans-serif";
        }
    }

    if (readerAuthor) {
        readerAuthor.innerHTML = `
            <span class="author-info">by ${writerName}</span>
            <span class="location-info">📍 ${storyLocation}</span>
        `;
    }

    // Update browser title and nav logo
    logoText.textContent = storyName + ' by ' + writerName;
    document.title = storyName + ' by ' + writerName;

    // Update story details (reading time, word count)
    updateStoryDetails(filename, content);

    // Update story metadata with calculated values
    const readingTime = calculateReadingTime(content);
    const wordCount = content.split(/\s+/).length;
    updateStoryMetadata(filename, {
        readingTime: readingTime,
        wordCount: wordCount
    });

    // Clear loading state
    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.innerHTML = '';
    }

    // Create pagination from content
    createPagination(content);

    // Display first page
    displayPage(1);

    // Generate Table of Contents
    setTimeout(() => {
        generateTOC();
    }, 500);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save reading session when progress is tracked
    const saveProgressHandler = () => {
        saveReadingSession(filename, window.pageYOffset);
    };
    window.addEventListener('scroll', saveProgressHandler, { passive: true });

    // Update bookmark button state for this story
    updateBookmarkButton();

    // Restore bookmark position for this story
    restoreBookmarkForCurrentStory();

    // Show continue reading button if user has bookmarks
    updateContinueReadingVisibility();
}

// Show loading state
function showLoadingState() {
    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.innerHTML = '<div class="welcome-text"><p><i class="fas fa-spinner fa-spin"></i> Loading story...</p></div>';
    }
}

// Show error message
function showError(message) {
    const storyContent = document.getElementById('storyContent');
    if (storyContent) {
        storyContent.innerHTML = '<div class="welcome-text"><p>❌ ' + message + '</p></div>';
    }
}

// Get story display name
function getStoryDisplayName(filename) {
    const storyData = getStoryMetadata(filename);
    return storyData.name;
}


// Function to create story card HTML for landing page
function createStoryCardHTML(filename) {
    const story = getStoryMetadata(filename);
    const bannerImage = getBannerImageForStory(story.id);

    return `
        <div class="story-card" data-story="${filename}" onclick="window.loadStoryFromCard('${filename}')">
            <div class="story-cover story-cover-wide" style="background-image: url('${bannerImage}'); background-size: cover; background-position: center;">
                <div class="story-status ${story.status}">${story.status === 'upcoming' ? 'Coming Soon' : 'Available'}</div>
            </div>
            <div class="story-info">
                <h3 class="story-title" ${filename !== 'upcoming.txt' ? 'style="font-family: \'BanglaFont\', \'Noto Sans Bengali\', sans-serif;"' : ''}>${story.name}</h3>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                    <span class="author">by ${story.writer}</span>
                    <span class="location">${story.location}</span>
                    ${story.readingTime > 0 ? `<span class="reading-time">~${story.readingTime} min read</span>` : ''}
                </div>
            </div>
        </div>
    `;
}


// Function to initialize story cards from HTML data-stories attribute
function initializeStoryGrid() {
    const storyGrid = document.querySelector('.story-grid');
    if (!storyGrid) return;

    // Check if grid has data-stories attribute with story IDs
    const storyIds = storyGrid.getAttribute('data-stories');

    if (storyIds) {
        // Parse story IDs (comma-separated) and generate cards
        const storyList = storyIds.split(',').map(id => id.trim());
        let cardsHTML = '';

        storyList.forEach(storyId => {
            // Convert story ID to filename if needed
            const filename = storyId.includes('.txt') ? storyId : storyId + '.txt';
            if (storyDatabase[filename]) {
                cardsHTML += createStoryCardHTML(filename);
            }
        });

        storyGrid.innerHTML = cardsHTML;
    } else {
        // Check for individual story containers with data-story-id
        const storyContainers = document.querySelectorAll('[data-story-id]');

        storyContainers.forEach(container => {
            const storyId = container.getAttribute('data-story-id');
            const filename = storyId.includes('.txt') ? storyId : storyId + '.txt';

            if (storyDatabase[filename]) {
                container.innerHTML = createStoryCardHTML(filename);
                container.classList.add('story-card-container');
            }
        });
    }
}



// Track if music system is initialized
var musicSystemInitialized = false;

// Music System Initialization
function initializeMusicSystem() {
    // Prevent duplicate initialization
    if (musicSystemInitialized) return;
    musicSystemInitialized = true;

    // Generate music list dynamically
    generateMusicList();

    // Start autoplay if enabled
    if (autoplayEnabled && musicPlaylist.length > 0) {
        setTimeout(() => {
            startAutoplay();
        }, 2000); // Delay to let the page load completely
    }

    // Setup music modal listeners
    setupMusicModalListeners();
}

// Generate music list HTML dynamically from musicPlaylist array
function generateMusicList() {
    const songList = document.getElementById('songList');
    const playlistCount = document.getElementById('playlistCount');

    if (!songList || !playlistCount) return;

    // Update playlist count
    playlistCount.textContent = `${musicPlaylist.length} songs available`;

    // Generate HTML for each song
    let musicHTML = '';
    musicPlaylist.forEach((song, index) => {
        musicHTML += `
            <div class="song-item music-card" data-music="${song.url}" data-song-index="${index}">
                <div class="song-play-btn">
                    <i class="fas fa-play"></i>
                </div>
                <div class="song-cover">
                    <div class="song-cover-placeholder">
                        <i class="${song.icon}"></i>
                    </div>
                </div>
                <div class="song-details">
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <div class="song-duration">${song.duration}</div>
                <div class="song-options">
                    <i class="fas fa-heart song-like"></i>
                </div>
            </div>
        `;
    });

    songList.innerHTML = musicHTML;
}

// Setup music modal event listeners
function setupMusicModalListeners() {
    // Re-setup card listeners after dynamic generation
    setupCardListeners();
}

// Start autoplay functionality
function startAutoplay() {
    if (!autoplayEnabled || musicPlaylist.length === 0) return;

    // Select a random song from the playlist
    const randomIndex = Math.floor(Math.random() * musicPlaylist.length);
    const randomSong = musicPlaylist[randomIndex];
    currentMusicIndex = randomIndex;

    try {
        // Set the random song source
        setMusicSource(randomSong.url, true);
        updateSelectorText(musicSelector, randomSong.title, 'music');

        // Auto-start playback with proper error handling
        setTimeout(() => {
            if (currentYouTubeUrl && youtubeFrame) {
                // Ensure enablejsapi is present for playlist functionality
                if (!currentYouTubeUrl.includes('enablejsapi')) {
                    const separator = currentYouTubeUrl.includes('?') ? '&' : '?';
                    currentYouTubeUrl += `${separator}enablejsapi=1&origin=${window.location.origin}`;
                }

                youtubeFrame.src = currentYouTubeUrl;
                isYouTubePlaying = true;
                updatePlayPauseButton(false);

                // Set up playlist looping for the random song
                setupYouTubePlaylistLoop();

                showMusicNotification('Auto-playing random song', randomSong.title, { duration: 3000 });
            }
        }, 1000);
    } catch (error) {
        console.error('Autoplay failed:', error);
        showNotification('⚠️ Autoplay failed, please start music manually', 'warning');
    }
}

// Cleanup music system resources
function cleanupMusicSystem() {
    // Remove YouTube event listeners
    if (window.currentYouTubeHandler) {
        window.removeEventListener('message', window.currentYouTubeHandler);
        window.currentYouTubeHandler = null;
    }

    // Clear intervals
    if (window.youtubeCheckInterval) {
        clearInterval(window.youtubeCheckInterval);
        window.youtubeCheckInterval = null;
    }

    // Stop current playback
    if (youtubeFrame) {
        youtubeFrame.src = '';
    }
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }

    // Reset state
    isYouTubePlaying = false;
    currentYouTubeUrl = '';
    updatePlayPauseButton(true);
}

// Toggle autoplay setting
function toggleAutoplay() {
    autoplayEnabled = !autoplayEnabled;
    saveSettings();
    showNotification(`Autoplay ${autoplayEnabled ? 'enabled' : 'disabled'}`, 'info');
    return autoplayEnabled;
}

// Music Player Functions
function togglePlayPause() {
    const audioPlayer = document.getElementById('audioPlayer');
    const youtubeFrame = document.getElementById('youtubeFrame');

    if (!audioPlayer || (!audioPlayer.src && !currentYouTubeUrl)) {
        alert('Please select a music track first.');
        return;
    }

    if (currentYouTubeUrl && youtubeFrame) {
        // Handle YouTube playback
        if (isYouTubePlaying) {
            youtubeFrame.src = '';
            isYouTubePlaying = false;
            updatePlayPauseButton(true);
        } else {
            youtubeFrame.src = currentYouTubeUrl;
            isYouTubePlaying = true;
            updatePlayPauseButton(false);
        }
    } else if (audioPlayer) {
        // Handle regular audio playback
        if (audioPlayer.paused) {
            audioPlayer.play();
        } else {
            audioPlayer.pause();
        }
    }
}


// Music selection now handled by modal system - see setupCardListeners()


function updatePlayPauseButton(paused) {
    var icon = playPauseBtn.querySelector('.icon');
    if (paused) {
        icon.className = 'fas fa-play icon';
    } else {
        icon.className = 'fas fa-pause icon';
    }
}


// Audio Player Event Handlers
function onAudioLoaded() {
}

function onAudioError() {
    // Only show error if it's not from clearing the src
    if (audioPlayer.src && audioPlayer.src !== window.location.href) {
        alert('Failed to load selected music. Please try a different track.');
        // Reset current music selection
        currentYouTubeUrl = '';
        updateSelectorText(musicSelector, 'Select Music', 'music');
    }
}

function onAudioPlay() {
    updatePlayPauseButton(false);
}

function onAudioPause() {
    updatePlayPauseButton(true);
}

function onAudioEnded() {
    updatePlayPauseButton(true);
}

// Theme Functions
function toggleTheme() {
    // Cycle through: light → sepia → dark → dark-sepia → light...
    if (currentTheme === 'light') {
        currentTheme = 'sepia';
    } else if (currentTheme === 'sepia') {
        currentTheme = 'dark';
    } else if (currentTheme === 'dark') {
        currentTheme = 'dark-sepia';
    } else {
        currentTheme = 'light';
    }

    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    saveSettings();

    // Add a subtle animation
    document.body.style.transition = 'all 0.3s ease';
    setTimeout(() => {
        document.body.style.transition = '';
    }, 300);
}

function updateThemeIcon() {
    var icon = themeToggle.querySelector('.icon');
    if (currentTheme === 'dark') {
        icon.className = 'fas fa-moon icon';
    } else if (currentTheme === 'dark-sepia') {
        icon.className = 'fas fa-eye icon';
    } else if (currentTheme === 'sepia') {
        icon.className = 'fas fa-book-open icon';
    } else {
        icon.className = 'fas fa-sun icon';
    }
}

// Enhanced Settings Management
function saveSettings() {
    var settings = {
        theme: currentTheme,
        currentStory: currentStory,
        fontSize: currentFontSize,
        focusMode: isFocusMode,
        bookmarks: storyBookmarks,
        // Enhanced preferences
        currentPage: currentPage,
        currentMusicIndex: currentMusicIndex,
        autoplayEnabled: autoplayEnabled,
        lastCategoryFilter: document.querySelector('.category-filter-btn.active')?.dataset.category || 'all',
        lastVisit: Date.now(),
        readingPreferences: {
            linesPerPage: linesPerPage,
            scrollPosition: window.pageYOffset
        }
    };

    localStorage.setItem('golpoSettings', JSON.stringify(settings));

    // Track settings change in analytics
    if (typeof trackAnalyticsEvent === 'function') {
        trackAnalyticsEvent('Settings saved', { theme: currentTheme, fontSize: currentFontSize });
    }
}

function loadSavedSettings() {
    var savedSettings = localStorage.getItem('golpoSettings') || localStorage.getItem('storyReaderSettings');

    if (!savedSettings) return;

    try {
        var settings = JSON.parse(savedSettings);

        // Restore theme
        if (settings.theme) {
            currentTheme = settings.theme;
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
        }

        // Volume controls were removed - skip volume restoration

        // Music selection now uses modal system - skip automatic restoration

        // Restore reading controls
        if (settings.fontSize) {
            currentFontSize = Math.max(70, Math.min(150, settings.fontSize));
            updateFontSize();
        }

        if (settings.focusMode !== undefined) {
            setFocusMode(Boolean(settings.focusMode));
        }

        // Restore per-story bookmarks
        if (settings.bookmarks) {
            storyBookmarks = settings.bookmarks;
        }
        // Backward compatibility for old single bookmark
        else if (settings.bookmark !== null && settings.bookmark !== undefined) {
            if (currentStory) {
                storyBookmarks[currentStory] = settings.bookmark;
            }
        }

        // Restore enhanced preferences
        if (settings.currentMusicIndex !== undefined) {
            currentMusicIndex = settings.currentMusicIndex;
        }

        if (settings.autoplayEnabled !== undefined) {
            autoplayEnabled = settings.autoplayEnabled;
        }

        if (settings.lastCategoryFilter && settings.lastCategoryFilter !== 'all') {
            // Restore last category filter on page load
            setTimeout(() => {
                filterByCategory(settings.lastCategoryFilter);
            }, 500);
        }

        if (settings.readingPreferences) {
            if (settings.readingPreferences.linesPerPage) {
                linesPerPage = settings.readingPreferences.linesPerPage;
            }
        }

        // Track session start
        if (typeof trackAnalyticsEvent === 'function') {
            const daysSinceLastVisit = settings.lastVisit ? 
                Math.floor((Date.now() - settings.lastVisit) / (1000 * 60 * 60 * 24)) : 0;
            trackAnalyticsEvent('Session started', { 
                daysSinceLastVisit: daysSinceLastVisit,
                theme: currentTheme 
            });
        }

    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        var later = function() {
            clearTimeout(timeout);
            if (typeof func === 'function') {
                try {
                    func(...args);
                } catch (error) {
                }
            }
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced Keyboard Shortcuts System
document.addEventListener('keydown', function(e) {
    // Don't trigger shortcuts when typing in input fields
    const isInputActive = ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName) || 
                          e.target.contentEditable === 'true';

    // Don't trigger if modal is open
    const isModalOpen = document.querySelector('.selection-modal.active');

    if (isInputActive || isModalOpen) return;

    // Music Controls (with Alt modifier for safety)
    if (e.altKey) {
        switch(e.code) {
            case 'KeyM': // Alt + M: Open Music Selector
                e.preventDefault();
                openMusicModal();
                showMusicNotification('Music selector opened', 'Use ↑↓ keys to navigate', {
                    duration: 2000
                });
                break;

            case 'KeyP': // Alt + P: Play/Pause
                e.preventDefault();
                togglePlayPause();
                const playState = isYouTubePlaying || !audioPlayer.paused ? 'Playing' : 'Paused';
                showMusicNotification(`Music ${playState.toLowerCase()}`, getCurrentSongTitle(), {
                    duration: 2000
                });
                break;

            case 'KeyN': // Alt + N: Next Song
                e.preventDefault();
                playNextSong();
                showMusicNotification('Next song', getCurrentSongTitle(), {
                    duration: 2500
                });
                break;

            case 'KeyB': // Alt + B: Previous Song (Back)
                e.preventDefault();
                playPreviousSong();
                showMusicNotification('Previous song', getCurrentSongTitle(), {
                    duration: 2500
                });
                break;
        }
        return;
    }

    // Regular shortcuts (without modifier)
    switch(e.code) {
        case 'Space': // Space: Play/Pause (classic)
            e.preventDefault();
            togglePlayPause();
            break;

        case 'KeyT': // T: Toggle Theme
            e.preventDefault();
            toggleTheme();
            const themeName = currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1).replace('-', ' ');
            showNotification(`Theme changed to ${themeName}`, 'info', 2000);
            break;

        case 'KeyF': // F: Toggle Focus Mode
            e.preventDefault();
            toggleFocusMode();
            const focusState = isFocusMode ? 'enabled' : 'disabled';
            showNotification(`Focus mode ${focusState}`, 'info', 2000, {
                subtitle: isFocusMode ? 'Press F again to exit' : 'Distraction-free reading'
            });
            break;

        case 'KeyB': // B: Toggle Bookmark
            e.preventDefault();
            toggleBookmark();
            break;

        case 'KeyS': // S: Scroll to Top
            e.preventDefault();
            scrollToTop();
            break;

        case 'Escape': // Escape: Close modals or exit focus mode
            e.preventDefault();
            if (isFocusMode) {
                toggleFocusMode();
                showNotification('Focus mode disabled', 'info', 2000);
            } else {
                closeStoryModalFunc();
                closeMusicModalFunc();
            }
            break;

        case 'KeyH': // H: Show help/shortcuts
            e.preventDefault();
            showKeyboardShortcuts();
            break;

        case 'ArrowLeft': // Left Arrow: Previous page (in reader)
            if (currentStory && currentPage > 1) {
                e.preventDefault();
                displayPage(currentPage - 1);
                showNotification(`Page ${currentPage}`, 'info', 1500);
            }
            break;

        case 'ArrowRight': // Right Arrow: Next page (in reader)
            if (currentStory && currentPage < totalPages) {
                e.preventDefault();
                displayPage(currentPage + 1);
                showNotification(`Page ${currentPage}`, 'info', 1500);
            }
            break;

        case 'Home': // Home: First page
            if (currentStory && currentPage > 1) {
                e.preventDefault();
                displayPage(1);
                showNotification('First page', 'info', 1500);
            }
            break;

        case 'End': // End: Last page
            if (currentStory && currentPage < totalPages) {
                e.preventDefault();
                displayPage(totalPages);
                showNotification('Last page', 'info', 1500);
            }
            break;

        case 'Equal': // + key: Increase font size
            if (e.shiftKey) { // Shift + = (which is +)
                e.preventDefault();
                increaseFontSize();
                showNotification(`Font size: ${currentFontSize}%`, 'info', 1500);
            }
            break;

        case 'Minus': // - key: Decrease font size
            e.preventDefault();
            decreaseFontSize();
            showNotification(`Font size: ${currentFontSize}%`, 'info', 1500);
            break;
    }
});

// Function to get current song title for notifications
function getCurrentSongTitle() {
    if (currentMusicIndex >= 0 && currentMusicIndex < musicPlaylist.length) {
        return musicPlaylist[currentMusicIndex].title;
    }
    return 'Unknown';
}

// Function to play previous song
function playPreviousSong() {
    if (!isPlaylistMode || musicPlaylist.length === 0) return;

    // Move to previous song (loop to end if at beginning)
    currentMusicIndex = currentMusicIndex <= 0 ? musicPlaylist.length - 1 : currentMusicIndex - 1;
    const prevSong = musicPlaylist[currentMusicIndex];

    // Update selector text
    updateSelectorText(musicSelector, prevSong.title, 'music');

    // Set previous song source
    setMusicSource(prevSong.url, true);

    // Auto-play the previous song after a brief delay
    setTimeout(() => {
        if (currentYouTubeUrl && youtubeFrame) {
            youtubeFrame.src = currentYouTubeUrl;
            isYouTubePlaying = true;
            updatePlayPauseButton(false);
            setupYouTubePlaylistLoop();
        } else if (audioPlayer && audioPlayer.src) {
            audioPlayer.play();
        }
    }, 1000);
}

// Function to show keyboard shortcuts help
function showKeyboardShortcuts() {
    const shortcuts = `
        <div style="line-height: 1.6; font-size: 13px;">
            <strong><i class="fas fa-music"></i> Music Controls (with Alt):</strong><br>
            Alt + M → Open music selector<br>
            Alt + P → Play/Pause<br>
            Alt + N → Next song<br>
            Alt + B → Previous song<br><br>

            <strong><i class="fas fa-keyboard"></i> General Shortcuts:</strong><br>
            Space → Play/Pause<br>
            T → Toggle theme<br>
            F → Focus mode<br>
            B → Bookmark position<br>
            S → Scroll to top<br>
            H → Show this help<br>
            Esc → Close modals/Exit focus<br><br>

            <strong><i class="fas fa-book-reader"></i> Reading Navigation:</strong><br>
            ← → Previous page<br>
            → → Next page<br>
            Home → First page<br>
            End → Last page<br>
            + → Increase font size<br>
            - → Decrease font size
        </div>
    `;

    showNotification('Keyboard Shortcuts', 'info', 8000, {
        subtitle: shortcuts,
        persistent: false,
        stackable: false
    });
}

// Handle window resize for responsive design
window.addEventListener('resize', debounce(() => {
    // Adjust layout if needed for different screen sizes
    var nav = document.querySelector('.nav-island');
    if (window.innerWidth < 768) {
        nav.classList.add('mobile');
    } else {
        nav.classList.remove('mobile');
    }
}, 250));

// Prevent YouTube playback from stopping when tab/window becomes hidden
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && isYouTubePlaying && youtubeFrame) {
        // Force YouTube to continue playing by sending play command
        try {
            youtubeFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        } catch (e) {
            console.log('Could not send play command to iframe');
        }
    }
    console.log('Visibility changed:', document.visibilityState);
});

// Additional handler to prevent auto-pause
window.addEventListener('blur', () => {
    if (isYouTubePlaying && youtubeFrame && currentYouTubeUrl) {
        // Keep music playing when window loses focus
        setTimeout(() => {
            try {
                youtubeFrame.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            } catch (e) {
                console.log('Could not maintain playback on blur');
            }
        }, 100);
    }
});

// Update reading progress based on story content scroll
function updateReadingProgress() {
    var storyContainer = document.querySelector('.story-container');
    if (!storyContainer || !progressPercentage) return;

    var scrollTop = storyContainer.scrollTop;
    var scrollHeight = storyContainer.scrollHeight;
    var clientHeight = storyContainer.clientHeight;
    var maxScroll = scrollHeight - clientHeight;

    if (maxScroll <= 0) {
        progressPercentage.textContent = '100%';
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        return;
    }

    var scrollPercent = (scrollTop / maxScroll) * 100;
    scrollPercent = Math.max(0, Math.min(100, scrollPercent));

    progressPercentage.textContent = Math.round(scrollPercent) + '%';
    if (progressFill) {
        progressFill.style.width = scrollPercent + '%';
    }
}

// Setup reading progress tracking for story content
function setupReadingProgress() {
    var storyContainer = document.querySelector('.story-container');
    if (storyContainer) {
        storyContainer.addEventListener('scroll', updateReadingProgress);

        // Also update on resize
        window.addEventListener('resize', updateReadingProgress);
        // Initial update
        updateReadingProgress();
    }
}

// Reading Controls Functions
function toggleReadingControls(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }

    if (!readingControlsDropdown) {
        return;
    }

    readingControlsDropdown.classList.toggle('active');
}

// Setup reading controls close on outside click (called once)
function setupReadingControlsOutsideClick() {
    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!readingControlsDropdown) return;

        // Check if click is outside the entire dropdown component
        if (!readingControlsDropdown.contains(e.target)) {
            if (readingControlsDropdown.classList.contains('active')) {
                readingControlsDropdown.classList.remove('active');
            }
        }
    });

    // Stop propagation for clicks inside the menu to keep it open
    // BUT allow input fields and buttons to work normally
    if (readingControlsMenu) {
        readingControlsMenu.addEventListener('click', function(e) {
            // Allow input fields to receive all events
            if (e.target.tagName === 'INPUT' || 
                e.target.id === 'searchInput') {
                return; // Don't stop propagation for input fields
            }
            
            // Don't stop propagation if clicking on buttons
            if (e.target.tagName === 'BUTTON' ||
                e.target.classList.contains('control-btn') ||
                e.target.closest('.control-btn')) {
                return;
            }
            
            // Don't stop propagation if clicking on the search container
            if (e.target.classList.contains('search-container') ||
                e.target.closest('.search-container')) {
                return;
            }
            
            e.stopPropagation();
        });
    }

    // Stop propagation for the button itself to prevent immediate closure
    if (readingControlsBtn) {
        readingControlsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    // Ensure search input can receive focus and keyboard events
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Remove any existing event listeners that might be blocking
        searchInput.addEventListener('focus', function(e) {
            e.stopPropagation();
            this.style.pointerEvents = 'auto';
        }, true);
        
        searchInput.addEventListener('click', function(e) {
            e.stopPropagation();
            this.focus();
        }, true);
        
        // Ensure keyboard events work
        searchInput.addEventListener('keydown', function(e) {
            e.stopPropagation();
        }, true);
        
        searchInput.addEventListener('keyup', function(e) {
            e.stopPropagation();
        }, true);
        
        searchInput.addEventListener('input', function(e) {
            e.stopPropagation();
        }, true);
    }
}

// Modal Functions
function openStoryModal() {
    storyModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeStoryModalFunc() {
    storyModal.classList.remove('active');
    document.body.style.overflow = '';
}

function openMusicModal() {
    musicModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMusicModalFunc() {
    musicModal.classList.remove('active');
    document.body.style.overflow = '';
}

function setupCardListeners() {
    // Story card listeners
    document.querySelectorAll('.story-card').forEach(card => {
        card.addEventListener('click', function() {
            var storyFile = this.dataset.story;
            var titleElement = this.querySelector('.card-title');
            var storyName = titleElement ? titleElement.textContent : 'Unknown Story';

            loadStory(storyFile);
            closeStoryModalFunc();
        });
    });

    // Music card listeners
    document.querySelectorAll('.music-card').forEach(card => {
        card.addEventListener('click', function() {
            var musicUrl = this.dataset.music;
            var titleElement = this.querySelector('.song-title') || this.querySelector('.card-title');
            var musicName = titleElement ? titleElement.textContent : 'Unknown Music';

            setMusicSource(musicUrl);
            updateSelectorText(musicSelector, musicName, 'music');
            closeMusicModalFunc();
        });
    });
}

function updateSelectorText(selector, text, iconType) {
    var textElement = selector.querySelector('.selector-text');
    var iconElement = selector.querySelector('i');

    if (textElement) {
        // Truncate long song names
        const maxLength = 15;
        const displayText = text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        textElement.textContent = displayText;
    }

    if (iconElement) {
        iconElement.className = iconType === 'book' ? 'fas fa-book-open' : 'fas fa-music';
    }

    // Update logo text to show smaller music name
    const logoText = document.querySelector('.logo-text');
    if (logoText && iconType === 'music') {
        logoText.classList.add('music-playing');
        const maxLogoLength = 20;
        const logoDisplayText = text.length > maxLogoLength ? text.substring(0, maxLogoLength) + '...' : text;
        logoText.textContent = logoDisplayText;
    }
}

async function loadStory(filename) {
    if (!filename) {
        showError('No story selected. Please choose a story from the library.');
        return;
    }

    currentStory = filename;
    showLoadingState();

    const maxRetries = 3;
    let retryCount = 0;

    const attemptLoad = async () => {
        try {
            // Check if we're offline and have cached version
            if (!isOnline && cachedStories.has(filename)) {
                showNotification('Loading cached story (offline mode)', 'info');
            }

            const response = await fetch('stories/' + filename);

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Story "${getStoryMetadata(filename).name}" not found`);
                } else if (response.status >= 500) {
                    throw new Error('Server error. Please try again later.');
                } else {
                    throw new Error(`Failed to load story (Error ${response.status})`);
                }
            }

            const content = await response.text();

            if (!content || content.trim().length === 0) {
                throw new Error('Story content is empty');
            }

            displayStory(filename, content);

            // Auto-cache story for offline reading (only when online)
            if (isOnline && !cachedStories.has(filename)) {
                setTimeout(() => cacheStoryForOffline(filename), 1000);
            }

        } catch (error) {
            console.error('Story loading error:', error);

            // Retry mechanism for network errors
            if (retryCount < maxRetries && isOnline && 
                (error.name === 'TypeError' || error.message.includes('Server error'))) {
                retryCount++;
                showNotification(`Retrying... (${retryCount}/${maxRetries})`, 'warning');

                // Exponential backoff delay
                const delay = Math.pow(2, retryCount) * 1000;
                setTimeout(attemptLoad, delay);
                return;
            }

            // Handle specific error types
            if (!isOnline) {
                if (cachedStories.has(filename)) {
                    showError('Unable to load fresh content offline. Using cached version.');
                    // Service worker should handle this automatically
                } else {
                    showError('Story not available offline. Please go online or read a cached story.');
                }
            } else {
                showError(`Failed to load story: ${error.message}`);
            }

            hideLoadingState();
        }
    };

    await attemptLoad();
}

function setMusicSource(url, fromPlaylist = false) {
    if (!url) {
        showNotification('❌ No music URL provided', 'error');
        return;
    }

    try {
        console.log('Setting music source:', url, 'fromPlaylist:', fromPlaylist);

        // Find the song in playlist if not from playlist selection
        if (!fromPlaylist) {
            const playlistIndex = musicPlaylist.findIndex(song => song.url === url);
            if (playlistIndex !== -1) {
                currentMusicIndex = playlistIndex;
                console.log('Updated currentMusicIndex to:', currentMusicIndex);
            }
        }

        // Stop current playback safely
        try {
            if (audioPlayer && audioPlayer.src) {
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
                audioPlayer.src = '';
            }
        } catch (audioError) {
            console.warn('Error stopping audio:', audioError);
        }

        // Clean up YouTube properly
        try {
            if (youtubeFrame) {
                youtubeFrame.src = '';
                isYouTubePlaying = false;
            }
            // Clean up previous intervals
            if (window.youtubeCheckInterval) {
                clearInterval(window.youtubeCheckInterval);
                window.youtubeCheckInterval = null;
            }
        } catch (youtubeError) {
            console.warn('Error stopping YouTube:', youtubeError);
        }

        // Set new music source with error handling
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                // Ensure proper YouTube URL format for API
                let formattedUrl = url;
                if (!url.includes('enablejsapi')) {
                    const separator = url.includes('?') ? '&' : '?';
                    formattedUrl = `${url}${separator}enablejsapi=1&origin=${window.location.origin}&rel=0&controls=1`;
                }

                currentYouTubeUrl = formattedUrl;
                console.log('YouTube URL set:', currentYouTubeUrl);

                // Don't auto-setup loop here - let the calling function decide when to play
                showNotification('YouTube music ready', 'success', 2000);

            } catch (error) {
                showNotification('Failed to set YouTube music', 'error');
                console.error('YouTube setup error:', error);
            }
        } else {
            try {
                audioPlayer.src = url;

                // Remove any existing event listeners to prevent duplicates
                audioPlayer.removeEventListener('ended', playNextSong);

                // Add event handlers
                const errorHandler = () => {
                    showNotification('❌ Failed to load audio track', 'error');
                    audioPlayer.removeEventListener('error', errorHandler);
                };

                const loadHandler = () => {
                    showNotification('Audio track loaded successfully', 'success');
                    audioPlayer.removeEventListener('loadeddata', loadHandler);
                    audioPlayer.removeEventListener('error', errorHandler);
                };

                // Add auto-progression for audio files
                if (isPlaylistMode && musicPlaylist.length > 1) {
                    audioPlayer.addEventListener('ended', playNextSong);
                }

                audioPlayer.addEventListener('error', errorHandler, { once: true });
                audioPlayer.addEventListener('loadeddata', loadHandler, { once: true });

            } catch (error) {
                showNotification('❌ Failed to set audio source', 'error');
                console.error('Audio setup error:', error);
            }
        }

        updatePlayPauseButton(true);

    } catch (error) {
        console.error('Music source setup error:', error);
        showNotification('❌ Failed to change music', 'error');
    }
}

function playNextSong() {
    if (!isPlaylistMode || musicPlaylist.length === 0) {
        console.warn('Cannot play next song: playlist mode disabled or empty playlist');
        return;
    }

    console.log('Playing next song from index:', currentMusicIndex);

    // Move to next song in playlist (loop back to start if at end)
    const oldIndex = currentMusicIndex;
    currentMusicIndex = (currentMusicIndex + 1) % musicPlaylist.length;
    const nextSong = musicPlaylist[currentMusicIndex];

    console.log(`Moving from song ${oldIndex} to ${currentMusicIndex}:`, nextSong.title);

    // Update selector text
    updateSelectorText(musicSelector, nextSong.title, 'music');

    // Set next song source with playlist flag
    setMusicSource(nextSong.url, true);

    // Auto-play the next song with proper timing
    setTimeout(() => {
        try {
            if (currentYouTubeUrl && youtubeFrame) {
                console.log('Starting next YouTube song:', currentYouTubeUrl);

                // Clear any existing frame first
                youtubeFrame.src = '';

                // Small delay to ensure frame is cleared
                setTimeout(() => {
                    youtubeFrame.src = currentYouTubeUrl;
                    isYouTubePlaying = true;
                    updatePlayPauseButton(false);

                    // Track song start time for duration-based fallback
                    window.youtubeSongStartTime = Date.now();

                    // Set up automatic progression for the new song
                    setTimeout(() => {
                        setupYouTubePlaylistLoop();
                    }, 500);
                }, 200);

            } else if (audioPlayer && audioPlayer.src) {
                console.log('Starting next audio track');
                audioPlayer.play();
            }

            // Show notification
            showMusicNotification(
                `Now playing (${currentMusicIndex + 1}/${musicPlaylist.length})`, 
                nextSong.title, 
                { duration: 3000 }
            );

        } catch (error) {
            console.error('Error playing next song:', error);
            showNotification('❌ Failed to play next song', 'error');
        }
    }, 800);
}

// Setup YouTube playlist looping with automatic progression
function setupYouTubePlaylistLoop() {
    if (!youtubeFrame || !isPlaylistMode || musicPlaylist.length <= 1) return;

    // Ensure YouTube URLs have enablejsapi parameter for proper API access
    if (currentYouTubeUrl && !currentYouTubeUrl.includes('enablejsapi')) {
        const separator = currentYouTubeUrl.includes('?') ? '&' : '?';
        currentYouTubeUrl += `${separator}enablejsapi=1&origin=${window.location.origin}&rel=0&controls=1`;
        // Update the frame with the new URL
        if (youtubeFrame.src) {
            youtubeFrame.src = currentYouTubeUrl;
        }
    }

    // Create a robust message listener for YouTube player events
    const messageHandler = (event) => {
        // Whitelist YouTube origins for security
        if (!event.origin.includes('youtube.com') && !event.origin.includes('youtube-nocookie.com')) return;

        try {
            let data;
            // Handle different YouTube message formats
            if (typeof event.data === 'string') {
                // Try to parse JSON messages
                if (event.data.includes('{')) {
                    data = JSON.parse(event.data);
                } else if (event.data.includes('onStateChange')) {
                    // Extract state from string format
                    const match = event.data.match(/info":"?(\d+)"?/);
                    if (match) {
                        data = { info: parseInt(match[1]) };
                    }
                }
            } else if (typeof event.data === 'object') {
                data = event.data;
            }

            if (data && typeof data.info !== 'undefined') {
                console.log('YouTube player state:', data.info);

                // State 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = cued
                if (data.info === 0) {
                    // Video ended, play next song after a brief delay
                    console.log('Video ended, playing next song...');
                    setTimeout(() => {
                        if (isPlaylistMode && musicPlaylist.length > 1) {
                            playNextSong();
                        } else if (musicPlaylist.length === 1) {
                            // Single song - replay it
                            if (youtubeFrame && currentYouTubeUrl) {
                                youtubeFrame.src = '';
                                setTimeout(() => {
                                    youtubeFrame.src = currentYouTubeUrl;
                                    isYouTubePlaying = true;
                                    updatePlayPauseButton(false);
                                }, 200);
                            }
                        }
                    }, 1000);
                } else if (data.info === 1) {
                    // Video is playing
                    isYouTubePlaying = true;
                    updatePlayPauseButton(false);
                } else if (data.info === 2) {
                    // Video is paused - don't update state if tab/window is not visible
                    // This prevents pause on tab switch
                    if (document.visibilityState === 'visible') {
                        isYouTubePlaying = false;
                        updatePlayPauseButton(true);
                    }
                }
            }
        } catch (e) {
            // Not a valid YouTube message, ignore silently
            console.warn('YouTube message parsing error:', e);
        }
    };

    // Clean up existing listener to prevent duplicates
    if (window.currentYouTubeHandler) {
        window.removeEventListener('message', window.currentYouTubeHandler);
    }

    // Add new listener and store reference for cleanup
    window.addEventListener('message', messageHandler);
    window.currentYouTubeHandler = messageHandler;

    // Set up periodic fallback check as backup for auto-progression
    if (window.youtubeCheckInterval) {
        clearInterval(window.youtubeCheckInterval);
    }

    // Track song start time for duration-based fallback
    window.youtubeSongStartTime = Date.now();

    // More aggressive fallback - check every 5 seconds for song completion
    window.youtubeCheckInterval = setInterval(() => {
        if (isYouTubePlaying && isPlaylistMode && musicPlaylist.length > 1) {
            // Check if song should have ended based on duration
            const songDuration = musicPlaylist[currentMusicIndex]?.duration || "4:00";
            const [minutes, seconds] = songDuration.split(':').map(Number);
            const totalSeconds = (minutes * 60) + seconds;
            const elapsedSeconds = (Date.now() - (window.youtubeSongStartTime || 0)) / 1000;

            // If elapsed time exceeds song duration by 5 seconds, force next song
            if (elapsedSeconds > totalSeconds + 5) {
                console.log('Fallback triggered: Song duration exceeded, playing next song');
                playNextSong();
            }
        }
    }, 5000);
}

function updateFontSize() {
    // Use already declared global variable
    if (storyContent) {
        storyContent.style.fontSize = currentFontSize + '%';
    }
    fontSizeDisplay.textContent = currentFontSize + '%';
    saveSettings();
}

function decreaseFontSize() {
    if (currentFontSize > 70) {
        currentFontSize = Math.max(70, currentFontSize - 10);
        updateFontSize();
    }
}

function increaseFontSize() {
    if (currentFontSize < 150) {
        currentFontSize = Math.min(150, currentFontSize + 10);
        updateFontSize();
    }
}

function toggleFocusMode() {
    setFocusMode(!isFocusMode);
    saveSettings();
}

function setFocusMode(enabled) {
    isFocusMode = enabled;
    document.body.classList.toggle('focus-mode', isFocusMode);
    focusModeBtn.classList.toggle('active', isFocusMode);

    var icon = focusModeBtn.querySelector('i');
    var focusExitBtn = document.getElementById('focusExitBtn');

    if (isFocusMode) {
        icon.className = 'fas fa-eye-slash';
        // Show the dedicated exit button with progress
        if (focusExitBtn) {
            focusExitBtn.style.display = 'flex';
            updateFocusExitButtonProgress();
        }
    } else {
        icon.className = 'fas fa-eye';
        // Hide the dedicated exit button
        if (focusExitBtn) {
            focusExitBtn.style.display = 'none';
        }
    }
}

function updateFocusExitButtonProgress() {
    const focusExitBtn = document.getElementById('focusExitBtn');

    if (focusExitBtn && isFocusMode) {
        // Get the current scroll-based progress (1-100% per page) from the main progress indicator
        const progressPercentage = document.getElementById('progressPercentage');
        let progress = 0;

        if (progressPercentage) {
            // Use the same scroll-based progress that's shown in the main nav
            progress = parseInt(progressPercentage.textContent) || 0;
        }

        focusExitBtn.innerHTML = `
            <i class="fas fa-times"></i>
            <span class="progress-text">${progress}%</span>
        `;
    }
}

function scrollToTop() {
    // Always scroll to the very top of the page for maximum visibility
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Show notification that scroll happened
    showNotification('📍 Scrolled to top', 'success');
}

function toggleBookmark() {
    if (!currentStory) {
        showNotification('⚠️ Please load a story first', 'warning');
        return;
    }

    try {
        // Initialize storyBookmarks if it doesn't exist
        if (typeof storyBookmarks === 'undefined') {
            window.storyBookmarks = {};
        }

        var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var existingBookmark = storyBookmarks[currentStory];

        // Normalize legacy bookmarks (just numbers) to new format
        if (existingBookmark && typeof existingBookmark === 'number') {
            existingBookmark = {
                page: currentPage, // Assume legacy bookmark is on current page
                scrollPosition: existingBookmark,
                totalPages: totalPages
            };
            storyBookmarks[currentStory] = existingBookmark; // Save normalized version
        }

        // For paginated content, store both page number and scroll position
        var bookmarkData = {
            page: currentPage,
            scrollPosition: currentScrollTop,
            totalPages: totalPages
        };

        if (existingBookmark && bookmarkBtn && bookmarkBtn.classList.contains('active')) {
            // Check if we're on the same page and close to the bookmarked position
            var isOnSamePage = (existingBookmark.page === currentPage);
            var distanceFromBookmark = isOnSamePage ? Math.abs(currentScrollTop - existingBookmark.scrollPosition) : 1000;

            if (isOnSamePage && distanceFromBookmark <= 50) {
                // We're at the bookmark position, offer to delete it
                delete storyBookmarks[currentStory];
                bookmarkBtn.classList.remove('active');
                bookmarkBtn.title = 'Bookmark Position';
                showNotification('🗑️ Bookmark deleted', 'success');
                saveSettings();
            } else {
                // Go to bookmark if we have one
                goToBookmark();
                showNotification('Jumped to bookmark', 'success');
            }
        } else {
            // Save current position as bookmark for this story
            storyBookmarks[currentStory] = bookmarkData;
            if (bookmarkBtn) {
                bookmarkBtn.classList.add('active');
                bookmarkBtn.title = 'Go to Bookmark';
            }
            showNotification('🔖 Position bookmarked', 'success');
            saveSettings();
        }
    } catch (error) {
        showNotification('❌ Bookmark error', 'error');
    }
}

function goToBookmark() {
    if (!currentStory) return;

    var bookmark = storyBookmarks[currentStory];

    if (bookmark !== null && bookmark !== undefined) {
        // Handle both old format (just scroll position) and new format (page + scroll position)
        if (typeof bookmark === 'number') {
            // Old format - just scroll to position
            window.scrollTo({
                top: bookmark,
                behavior: 'smooth'
            });
        } else if (bookmark.page && bookmark.scrollPosition !== undefined) {
            // New format - navigate to page first, then scroll to position
            if (bookmark.page !== currentPage) {
                // Need to navigate to different page first
                displayPage(bookmark.page);
                // Wait for page to render, then scroll to position
                setTimeout(() => {
                    window.scrollTo({
                        top: bookmark.scrollPosition,
                        behavior: 'smooth'
                    });
                }, 300);
            } else {
                // Same page, just scroll to position
                window.scrollTo({
                    top: bookmark.scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }
}

function updateBookmarkButton() {
    if (!currentStory || !bookmarkBtn) return;

    var bookmark = storyBookmarks[currentStory];
    if (bookmark !== null && bookmark !== undefined) {
        bookmarkBtn.classList.add('active');
        // Show different titles based on whether bookmark is on current page or different page
        if (typeof bookmark === 'object' && bookmark.page !== undefined) {
            if (bookmark.page === currentPage) {
                bookmarkBtn.title = 'Go to Bookmark (this page)';
            } else {
                bookmarkBtn.title = `Go to Bookmark (page ${bookmark.page})`;
            }
        } else {
            bookmarkBtn.title = 'Go to Bookmark';
        }
    } else {
        bookmarkBtn.classList.remove('active');
        bookmarkBtn.title = 'Bookmark Position';
    }
}

function restoreBookmarkForCurrentStory() {
    if (!currentStory) return;

    var bookmark = storyBookmarks[currentStory];
    if (bookmark !== null && bookmark !== undefined) {
        setTimeout(() => {
            var storyContainer = document.querySelector('.story-container');
            if (storyContainer) {
                storyContainer.scrollTop = bookmark;
            }
        }, 100); // Small delay to ensure content is rendered
    }
}


// Helper Functions
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search Functions
function performSearch() {
    var searchTerm = searchInput.value.trim();

    if (!searchTerm) {
        showNotification('⚠️ Please enter a search term', 'warning');
        return;
    }

    if (!currentStory) {
        showNotification('⚠️ Please load a story first', 'warning');
        return;
    }

    // Clear any existing highlights first
    clearPreviousHighlights();

    // Escape search term for safe regex
    var escapedTerm = escapeRegExp(searchTerm);

    var results = [];

    if (storyPages && storyPages.length > 0) {
        // Search across all pages of the story
        storyPages.forEach((pageContent, pageIndex) => {
            const lines = pageContent.split('\n').filter(line => line.trim() !== '');

            lines.forEach((line, lineIndex) => {
                try {
                    var regex = new RegExp(escapedTerm, 'gi');
                    var matches = line.match(regex);

                    if (matches) {
                        // Calculate context around the match
                        const matchIndex = line.toLowerCase().indexOf(searchTerm.toLowerCase());
                        const contextStart = Math.max(0, matchIndex - 30);
                        const contextEnd = Math.min(line.length, matchIndex + searchTerm.length + 30);
                        var context = line.substring(contextStart, contextEnd);

                        results.push({
                            page: pageIndex + 1, // 1-based page number
                            lineInPage: lineIndex,
                            context: context,
                            fullText: line,
                            searchTerm: searchTerm
                        });
                    }
                } catch (error) {
                    console.warn('Search regex error:', error);
                }
            });
        });
    } else {
        // Fallback: search only current page content if pages aren't available
        var storyContent = document.getElementById('storyContent');
        if (!storyContent) {
            showNotification('❌ Story content not found', 'error');
            return;
        }

        var paragraphs = storyContent.querySelectorAll('p');
        paragraphs.forEach((paragraph, index) => {
            var text = paragraph.textContent;
            try {
                var regex = new RegExp(escapedTerm, 'gi');
                var matches = text.match(regex);

                if (matches) {
                    const matchIndex = text.toLowerCase().indexOf(searchTerm.toLowerCase());
                    const contextStart = Math.max(0, matchIndex - 30);
                    const contextEnd = Math.min(text.length, matchIndex + searchTerm.length + 30);
                    var context = text.substring(contextStart, contextEnd);

                    results.push({
                        page: currentPage,
                        paragraph: index,
                        context: context,
                        element: paragraph,
                        searchTerm: searchTerm
                    });
                }
            } catch (error) {
                console.warn('Search regex error:', error);
            }
        });
    }

    // Show notification with results
    if (results.length > 0) {
        showNotification(`🔍 Found ${results.length} match${results.length > 1 ? 'es' : ''} across all pages`, 'success', 3000);

        // If the first result is on a different page, inform user
        if (results[0].page !== currentPage) {
            setTimeout(() => {
                showNotification(`📄 First result is on page ${results[0].page}. Click on a result to navigate.`, 'info', 3000);
            }, 2000);
        }
    } else {
        showNotification(`❌ No matches found for "${searchTerm}"`, 'error', 3000);
    }

    displaySearchResults(results, searchTerm);

    // Highlight matches on current page if any
    highlightCurrentPageMatches(searchTerm, results);
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }

    if (searchResults) {
        searchResults.innerHTML = '';
    }

    clearPreviousHighlights();
    showNotification('🗑️ Search cleared', 'success', 2000);
}

function clearPreviousHighlights() {
    var storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    var highlights = storyContent.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        var parent = highlight.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        }
    });
}

function displaySearchResults(results, searchTerm) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        return;
    }

    var html = '<div class="search-result-item"><strong>' + results.length + ' result(s) found for "' + escapeHtml(searchTerm) + '"</strong></div>';

    // Calculate per-page occurrence indices
    const pageOccurrenceCounts = {};

    results.forEach((result, index) => {
        // Handle both new format (with page numbers) and old format
        var pageInfo = result.page ? `Page ${result.page}: ` : '';

        if (result.page) {
            // Calculate the occurrence index within this specific page
            if (!pageOccurrenceCounts[result.page]) {
                pageOccurrenceCounts[result.page] = 0;
            }
            const pageOccurrenceIndex = pageOccurrenceCounts[result.page];
            pageOccurrenceCounts[result.page]++;

            var clickHandler = `navigateToSearchResult(${result.page}, ${pageOccurrenceIndex})`;
        } else {
            var clickHandler = `scrollToSearchResult(${result.paragraph})`;
        }

        html += '<div class="search-result-item" onclick="' + clickHandler + '">' +
                (index + 1) + '. ' + pageInfo + '...' + escapeHtml(result.context) + '...' +
                '</div>';
    });

    searchResults.innerHTML = html;
}

// Social Sharing System
function shareStory(storyFile) {
    const story = getStoryMetadata(storyFile);
    const shareData = {
        title: `${story.name} - Golpo`,
        text: `Read "${story.name}" by ${story.writer} on Golpo - Bengali Story Platform`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => showNotification('Story shared successfully! 🎉', 'success'))
            .catch(() => copyShareLink(shareData));
    } else {
        copyShareLink(shareData);
    }
}

function copyShareLink(shareData) {
    const link = shareData.url;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Link copied to clipboard! 📋', 'success', 3000);
    }).catch(() => {
        showNotification('Failed to copy link', 'error');
    });
}

// Export to global scope
window.shareStory = shareStory;

function displaySearchResults(results, searchTerm) {
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        return;
    }

    var html = '<div class="search-result-item"><strong>' + results.length + ' result(s) found for "' + escapeHtml(searchTerm) + '"</strong></div>';

    // Calculate per-page occurrence indices
    const pageOccurrenceCounts = {};

    results.forEach((result, index) => {
        // Handle both new format (with page numbers) and old format
        var pageInfo = result.page ? `Page ${result.page}: ` : '';

        if (result.page) {
            // Calculate the occurrence index within this specific page
            if (!pageOccurrenceCounts[result.page]) {
                pageOccurrenceCounts[result.page] = 0;
            }
            const pageOccurrenceIndex = pageOccurrenceCounts[result.page];
            pageOccurrenceCounts[result.page]++;

            var clickHandler = `navigateToSearchResult(${result.page}, ${pageOccurrenceIndex})`;
        } else {
            var clickHandler = `scrollToSearchResult(${result.paragraph})`;
        }

        html += '<div class="search-result-item" onclick="' + clickHandler + '">' +
                (index + 1) + '. ' + pageInfo + '...' + escapeHtml(result.context) + '...' +
                '</div>';
    });

    searchResults.innerHTML = html;
}

function scrollToSearchResult(paragraphIndex) {
    var storyContent = document.getElementById('storyContent');
    if (!storyContent) {
        return;
    }

    var paragraphs = storyContent.querySelectorAll('p');

    if (paragraphs[paragraphIndex]) {
        // First, check if there are highlighted search terms in this paragraph
        const searchHighlight = paragraphs[paragraphIndex].querySelector('.search-highlight');

        if (searchHighlight) {
            // Scroll to the specific highlighted word
            searchHighlight.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        } else {
            // Fallback to scrolling to the paragraph
            paragraphs[paragraphIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }

        // Add temporary visual indicator
        var paragraph = paragraphs[paragraphIndex];
        paragraph.style.border = '2px solid #ff6b6b';
        paragraph.style.borderRadius = '8px';
        paragraph.style.padding = '10px';

        // Remove indicator after 3 seconds
        setTimeout(() => {
            paragraph.style.border = '';
            paragraph.style.borderRadius = '';
            paragraph.style.padding = '';
        }, 3000);

        showNotification('📍 Jumped to search result', 'success');
    } else {
        showNotification('❌ Search result not found', 'error');
    }
}

// Function to highlight matches on the current page
function highlightCurrentPageMatches(searchTerm, allResults) {
    const currentPageResults = allResults.filter(result => result.page === currentPage);

    if (currentPageResults.length === 0) return;

    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    const paragraphs = storyContent.querySelectorAll('p');
    const escapedTerm = escapeRegExp(searchTerm);

    paragraphs.forEach(paragraph => {
        const text = paragraph.textContent;
        try {
            const regex = new RegExp(escapedTerm, 'gi');
            if (text.match(regex)) {
                const highlightedText = text.replace(regex, '<span class="search-highlight" style="background: linear-gradient(45deg, #ff0000, #ff6b6b) !important; color: #ffffff !important; padding: 3px 6px !important; border-radius: 6px !important; font-weight: 900 !important; box-shadow: 0 2px 8px rgba(255, 0, 0, 0.5) !important; border: 2px solid #ffffff !important;">$&</span>');
                paragraph.innerHTML = highlightedText;
            }
        } catch (error) {
            // Skip invalid regex patterns
        }
    });
}

// Function to navigate to a search result on a specific page
function navigateToSearchResult(targetPage, resultIndex) {
    const searchTerm = searchInput.value.trim();
    if (!searchTerm) return;

    // Clear any existing highlights first
    clearPreviousHighlights();

    if (targetPage !== currentPage) {
        // Navigate to the target page first
        displayPage(targetPage);

        // Wait longer for page content to be fully ready, then highlight the search term
        setTimeout(() => {
            waitForStoryContentReady(() => {
                // Additional small delay to ensure DOM is fully rendered
                setTimeout(() => {
                    highlightAndScrollToResult(resultIndex, searchTerm);
                    showNotification(`📍 Jumped to page ${targetPage} search result`, 'success');
                }, 200);
            }, 3000); // Increased timeout
        }, 500); // Initial delay for page navigation
    } else {
        // Same page, highlight and scroll to the specific result
        highlightAndScrollToResult(resultIndex, searchTerm);
        showNotification('📍 Jumped to search result', 'success');
    }
}

// Helper function to wait for story content to be ready
function waitForStoryContentReady(callback, timeout = 3000) {
    const startTime = Date.now();
    let checkCount = 0;

    function checkReady() {
        const storyContent = document.getElementById('storyContent');
        const paragraphs = storyContent ? storyContent.querySelectorAll('p') : [];
        const hasContent = storyContent && paragraphs.length > 0;

        checkCount++;

        if (hasContent && checkCount > 3) { // Ensure multiple checks pass
            // Content is ready and stable, execute callback
            callback();
        } else if (Date.now() - startTime < timeout) {
            // Keep checking with longer intervals for stability
            setTimeout(checkReady, 100);
        } else {
            // Timeout reached, execute callback anyway
            console.warn('Story content readiness check timed out, proceeding anyway');
            callback();
        }
    }

    checkReady();
}

// Helper function to highlight search terms and scroll to specific result
function highlightAndScrollToResult(resultIndex, searchTerm) {
    if (!searchTerm) return;

    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;

    const paragraphs = storyContent.querySelectorAll('p');
    if (paragraphs.length === 0) {
        console.warn('No paragraphs found in story content');
        return;
    }

    const escapedTerm = escapeRegExp(searchTerm);
    let allHighlights = [];
    let matchCount = 0;

    // Highlight all matches and collect them in order
    paragraphs.forEach((paragraph, paragraphIndex) => {
        const text = paragraph.textContent;
        try {
            const regex = new RegExp(escapedTerm, 'gi');
            const matches = text.match(regex);

            if (matches) {
                // Replace text with highlighted version
                const highlightedText = text.replace(regex, '<span class="search-highlight" data-match-index="' + matchCount + '" style="background: linear-gradient(45deg, #ff0000, #ff6b6b) !important; color: #ffffff !important; padding: 3px 6px !important; border-radius: 6px !important; font-weight: 900 !important; box-shadow: 0 2px 8px rgba(255, 0, 0, 0.5) !important; border: 2px solid #ffffff !important;">$&</span>');
                paragraph.innerHTML = highlightedText;

                // Collect highlights from this paragraph
                const paragraphHighlights = paragraph.querySelectorAll('.search-highlight');
                paragraphHighlights.forEach(highlight => {
                    highlight.setAttribute('data-paragraph', paragraphIndex);
                    highlight.setAttribute('data-global-index', allHighlights.length);
                    allHighlights.push(highlight);
                });

                matchCount++;
            }
        } catch (error) {
            console.warn('Regex error:', error);
        }
    });

    console.log(`Found ${allHighlights.length} highlights, looking for index ${resultIndex}`);

    // Scroll to the specific result based on index
    if (allHighlights.length > 0) {
        // Ensure resultIndex is within bounds, default to 0 if invalid
        const safeIndex = Math.max(0, Math.min(resultIndex || 0, allHighlights.length - 1));
        const targetHighlight = allHighlights[safeIndex];

        if (targetHighlight) {
            console.log(`Scrolling to highlight ${safeIndex} of ${allHighlights.length}`);

            // Scroll to the target highlight with proper timing
            setTimeout(() => {
                targetHighlight.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });

                // Add temporary focus indicator to the target highlight
                targetHighlight.style.outline = '4px solid #00ff00 !important';
                targetHighlight.style.outlineOffset = '3px !important';
                targetHighlight.style.zIndex = '1000 !important';

                setTimeout(() => {
                    targetHighlight.style.outline = '';
                    targetHighlight.style.outlineOffset = '';
                    targetHighlight.style.zIndex = '';
                }, 3000);
            }, 100);
        } else {
            console.warn('Target highlight not found');
        }
    } else {
        console.warn('No highlights found for search term:', searchTerm);
        // Fallback: scroll to top of story content
        storyContent.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Export to global scope for inline onclick handlers
window.scrollToSearchResult = scrollToSearchResult;
window.navigateToSearchResult = navigateToSearchResult;

// Function to load story from card click
function loadStoryFromCard(storyFileOrId) {
    // Handle both filename format (e.g., 'bissash.txt') and ID format (e.g., 'bissash')
    let storyFile = storyFileOrId;

    // If it doesn't end with .txt, try to find it in the database by ID
    if (!storyFileOrId.endsWith('.txt')) {
        // Look for story by ID
        const foundStory = Object.keys(storyDatabase).find(filename => {
            return storyDatabase[filename].id === storyFileOrId;
        });

        if (foundStory) {
            storyFile = foundStory;
        } else {
            storyFile = storyFileOrId + '.txt'; // fallback
        }
    }

    // Check if the story exists in the database
    if (storyDatabase[storyFile]) {
        // Switch to reader view first
        showReaderView();
        // Then load the story
        loadStory(storyFile);
        // Update cover image in reader
        updateReaderCoverImage(storyFile);
    } else {
        showNotification('❌ Story not found', 'error');
        console.error('Story not found:', storyFileOrId, 'Tried:', storyFile);
    }
}

// Ensure functions are available globally for HTML onclick handlers immediately
window.loadStoryFromCard = loadStoryFromCard;
window.loadStoryFromSuggestion = loadStoryFromSuggestion;
window.returnToLibrary = returnToLibrary;
window.displayPage = displayPage;
window.scrollToSearchResult = scrollToSearchResult;
window.closeNotification = closeNotification;

// Also ensure they're available immediately after function definition
if (typeof window !== 'undefined') {
    window.loadStoryFromCard = loadStoryFromCard;
    window.loadStoryFromSuggestion = loadStoryFromSuggestion;
}


// Also ensure they're available immediately after function definition
if (typeof window !== 'undefined') {
    window.loadStoryFromCard = loadStoryFromCard;
    window.loadStoryFromSuggestion = loadStoryFromSuggestion;
}

// Ensure all functions are globally available for HTML onclick handlers
window.loadStoryFromCard = loadStoryFromCard;
window.loadStoryFromSuggestion = loadStoryFromSuggestion;
window.returnToLibrary = returnToLibrary;
window.displayPage = displayPage;
window.scrollToSearchResult = scrollToSearchResult;

// === OFFLINE READING SUPPORT ===

// Initialize offline support with service worker
async function initializeOfflineSupport() {
    try {
        // Check if service workers are supported
        if ('serviceWorker' in navigator) {
            // Register service worker
            serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            console.log('Service Worker registered successfully');

            // Listen for service worker updates
            serviceWorkerRegistration.addEventListener('updatefound', () => {
                const newWorker = serviceWorkerRegistration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showNotification('📱 App updated! Refresh for new features', 'success');
                        }
                    });
                }
            });
        }

        // Setup online/offline event listeners
        window.addEventListener('online', handleOnlineStatusChange);
        window.addEventListener('offline', handleOnlineStatusChange);

        // Initialize offline status
        handleOnlineStatusChange();

        // Load cached stories list
        loadCachedStoriesList();

    } catch (error) {
        console.warn('Failed to initialize offline support:', error);
    }
}

// Handle online/offline status changes
function handleOnlineStatusChange() {
    isOnline = navigator.onLine;
    updateOfflineIndicator();

    if (isOnline) {
        showNotification('Back online!', 'success');
    } else {
        showNotification('You\'re offline. Cached stories available', 'warning');
    }
}

// Setup offline indicators in the UI
function setupOfflineIndicators() {
    try {
        // Create offline indicator
        offlineIndicator = document.createElement('div');
        offlineIndicator.id = 'offlineIndicator';
        offlineIndicator.className = 'offline-indicator';
        offlineIndicator.innerHTML = `
            <i class="fas fa-wifi"></i>
            <span class="status-text">Online</span>
        `;

        // Add to navigation
        const navRight = document.querySelector('.nav-right');
        if (navRight) {
            navRight.appendChild(offlineIndicator);
        }

        // Add offline indicator styles if not present
        if (!document.querySelector('#offlineIndicatorStyles')) {
            const style = document.createElement('style');
            style.id = 'offlineIndicatorStyles';
            style.textContent = `
                .offline-indicator {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 10px;
                    border-radius: 15px;
                    font-size: 12px;
                    background: var(--glass-bg);
                    border: 1px solid var(--glass-border);
                    transition: all 0.3s ease;
                    cursor: pointer;
                }

                .offline-indicator.offline {
                    background: rgba(255, 107, 107, 0.2);
                    border-color: rgba(255, 107, 107, 0.4);
                    color: #ff6b6b;
                }

                .offline-indicator.online {
                    background: rgba(76, 175, 80, 0.2);
                    border-color: rgba(76, 175, 80, 0.4);
                    color: #4caf50;
                }

                .offline-indicator:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                @media (max-width: 768px) {
                    .offline-indicator .status-text {
                        display: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add click handler for offline indicator
        offlineIndicator.addEventListener('click', showOfflineStatus);

        // Initial update
        updateOfflineIndicator();

    } catch (error) {
        console.warn('Failed to setup offline indicators:', error);
    }
}

// Update offline indicator appearance
function updateOfflineIndicator() {
    if (!offlineIndicator) return;

    const icon = offlineIndicator.querySelector('i');
    const text = offlineIndicator.querySelector('.status-text');

    if (isOnline) {
        offlineIndicator.className = 'offline-indicator online';
        icon.className = 'fas fa-wifi';
        text.textContent = 'Online';
        offlineIndicator.title = 'Online - All features available';
    } else {
        offlineIndicator.className = 'offline-indicator offline';
        icon.className = 'fas fa-wifi-slash';
        text.textContent = 'Offline';
        offlineIndicator.title = 'Offline - Cached stories available';
    }
}

// Show offline status and cached stories
function showOfflineStatus() {
    const cachedCount = cachedStories.size;
    const totalStories = Object.keys(storyDatabase).length;

    let message = isOnline ? 
        `Online - All ${totalStories} stories available` :
        `Offline - ${cachedCount}/${totalStories} stories cached`;

    if (!isOnline && cachedCount > 0) {
        message += `\n\nCached stories:\n${Array.from(cachedStories).join(', ')}`;
    } else if (!isOnline && cachedCount === 0) {
        message += `\n\nNo stories cached yet. Read stories while online to cache them.`;
    }

    showNotification(message, isOnline ? 'success' : 'warning');
}

// Cache a story for offline reading
async function cacheStoryForOffline(storyFile) {
    if (!serviceWorkerRegistration || !serviceWorkerRegistration.active) {
        console.warn('Service worker not available for caching');
        return false;
    }

    try {
        const storyUrl = `/stories/${storyFile}`;

        // Send message to service worker to cache the story
        const messageChannel = new MessageChannel();
        const response = await new Promise((resolve) => {
            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };

            serviceWorkerRegistration.active.postMessage({
                action: 'CACHE_STORY',
                data: { url: storyUrl }
            }, [messageChannel.port2]);
        });

        if (response.success) {
            cachedStories.add(storyFile);
            saveCachedStoriesList();
            showNotification(`📥 "${getStoryMetadata(storyFile).name}" cached for offline reading`, 'success');
            return true;
        } else {
            throw new Error(response.error);
        }

    } catch (error) {
        console.error('Failed to cache story:', error);
        showNotification('❌ Failed to cache story for offline reading', 'error');
        return false;
    }
}

// Save cached stories list to localStorage
function saveCachedStoriesList() {
    try {
        localStorage.setItem('cachedStories', JSON.stringify(Array.from(cachedStories)));
    } catch (error) {
        console.warn('Failed to save cached stories list:', error);
    }
}

// Load cached stories list from localStorage
function loadCachedStoriesList() {
    try {
        const saved = localStorage.getItem('cachedStories');
        if (saved) {
            cachedStories = new Set(JSON.parse(saved));
        }
    } catch (error) {
        console.warn('Failed to load cached stories list:', error);
        cachedStories = new Set();
    }
}

// === ENHANCED ERROR HANDLING SYSTEM ===

// Global error handler for unhandled errors
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    showNotification('❌ Something went wrong. Please refresh if issues persist.', 'error');
});

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('❌ A background operation failed. App functionality may be limited.', 'warning');
    event.preventDefault(); // Prevent the default browser behavior
});

// Enhanced error recovery utility
function withErrorRecovery(operation, fallback = null, context = 'operation') {
    return async (...args) => {
        try {
            if (typeof operation === 'function') {
                return await operation(...args);
            } else {
                throw new Error('Operation is not a function');
            }
        } catch (error) {
            console.error(`Error in ${context}:`, error);

            if (fallback && typeof fallback === 'function') {
                try {
                    return await fallback(...args);
                } catch (fallbackError) {
                    console.error(`Fallback failed for ${context}:`, fallbackError);
                    showNotification(`❌ ${context} failed and recovery failed`, 'error');
                }
            } else {
                showNotification(`❌ ${context} failed`, 'error');
            }

            return null;
        }
    };
}

// Safe DOM manipulation utility
function safeDOM(operation, element, context = 'DOM operation') {
    try {
        if (!element) {
            console.warn(`${context}: Element not found`);
            return false;
        }

        return operation(element);
    } catch (error) {
        console.error(`${context} error:`, error);
        return false;
    }
}

// Enhanced localStorage with error handling
const safeStorage = {
    get: (key, defaultValue = null) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            console.warn(`Failed to get ${key} from localStorage:`, error);
            return defaultValue;
        }
    },

    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn(`Failed to set ${key} in localStorage:`, error);
            showNotification('⚠️ Failed to save settings', 'warning');
            return false;
        }
    },

    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn(`Failed to remove ${key} from localStorage:`, error);
            return false;
        }
    }
};

// Network status and retry utility
class NetworkManager {
    constructor() {
        this.retryCount = 0;
        this.maxRetries = 3;
        this.baseDelay = 1000;
    }

    async fetchWithRetry(url, options = {}) {
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });

                if (response.ok) {
                    return response;
                }

                if (response.status >= 400 && response.status < 500) {
                    // Client error, don't retry
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                // Server error, retry
                throw new Error(`Server error: ${response.status}`);

            } catch (error) {
                if (attempt === this.maxRetries) {
                    throw error;
                }

                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }

                // Exponential backoff
                const delay = this.baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
}

const networkManager = new NetworkManager();

// Enhanced Professional Notification System
function showNotification(message, type = 'info', duration = 4000, options = {}) {
    try {
        console.log('Showing notification:', message, type);

        // Remove existing notifications if not stackable
        if (!options.stackable) {
            const existingNotifications = document.querySelectorAll('.golpo-notification');
            existingNotifications.forEach(notification => {
                notification.style.animation = 'toastOut 150ms ease-out';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 150);
            });
        }

        const notification = document.createElement('div');
        const notificationId = 'notification-' + Date.now() + Math.random().toString(36).substr(2, 9);
        notification.id = notificationId;
        notification.className = `golpo-notification notification-${type}`;

        // Enhanced notification content with icon and actions
        const icon = getNotificationIcon(type);
        const actionButtons = options.actions ? createActionButtons(options.actions, notificationId) : '';

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
                ${options.subtitle ? `<div class="notification-subtitle">${options.subtitle}</div>` : ''}
            </div>
            ${actionButtons}
            <div class="notification-close" onclick="closeNotification('${notificationId}')">
                <i class="fas fa-times"></i>
            </div>
        `;

        // Create notification stack container if it doesn't exist
        let notificationStack = document.querySelector('.notification-stack');
        if (!notificationStack) {
            notificationStack = document.createElement('div');
            notificationStack.className = 'notification-stack';
            document.body.appendChild(notificationStack);
            console.log('Created notification stack');
        }

        notificationStack.appendChild(notification);
        console.log('Added notification to stack');

        // Force a reflow to ensure the element is rendered
        notification.offsetHeight;

        // Auto-remove after duration (unless persistent)
        if (!options.persistent && duration > 0) {
            setTimeout(() => {
                closeNotification(notificationId);
            }, duration);
        }

        // Add click handler to close (but not for the close button)
        notification.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-close') && !e.target.closest('.notification-action') && !options.persistent) {
                closeNotification(notificationId);
            }
        });

        console.log('Notification created successfully:', notificationId);
        return notificationId;

    } catch (error) {
        console.error('Failed to show notification:', error);
        // Fallback to alert for critical messages
        if (type === 'error') {
            alert(message);
        }
        return null;
    }
}

// Add a test notification function for debugging
function testNotification() {
    console.log('Testing notification...');
    showNotification('🔧 Test notification - System is working!', 'success', 5000);
    console.log('Test notification called');
}

// Test notification on startup complete (removed automatic test)
// You can call testNotification() from the console to test

// Helper function to get notification icons
function getNotificationIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-triangle',
        warning: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle',
        music: 'fas fa-music'
    };
    return icons[type] || icons.info;
}

// Helper function to create action buttons
function createActionButtons(actions, notificationId) {
    if (!actions || actions.length === 0) return '';

    return `<div class="notification-actions">
        ${actions.map(action => 
            `<button class="notification-action" onclick="${action.callback}('${notificationId}')">${action.label}</button>`
        ).join('')}
    </div>`;
}

// Function to close notification
function closeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (notification && notification.parentNode) {
        notification.style.animation = 'toastOut 150ms ease-out';
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.remove();
            }
            // Clean up stack if empty
            const stack = document.querySelector('.notification-stack');
            if (stack && stack.children.length === 0) {
                stack.remove();
            }
        }, 150);
    }
}

// Music-specific notification function
function showMusicNotification(message, songTitle, options = {}) {
    return showNotification(message, 'music', options.duration || 3000, {
        subtitle: songTitle ? `♪ ${songTitle}` : '',
        stackable: options.stackable || false,
        persistent: options.persistent || false,
        ...options
    });
}

// === PERFORMANCE OPTIMIZATION SYSTEM ===

// DOM element cache for frequently accessed elements
const elementCache = new Map();

function getCachedElement(selector, useCache = true) {
    if (!useCache) {
        return document.querySelector(selector);
    }

    if (!elementCache.has(selector)) {
        const element = document.querySelector(selector);
        if (element) {
            elementCache.set(selector, element);
        }
        return element;
    }

    const cached = elementCache.get(selector);

    // Verify element is still in DOM
    if (cached && document.contains(cached)) {
        return cached;
    }

    // Re-cache if element was removed
    const fresh = document.querySelector(selector);
    if (fresh) {
        elementCache.set(selector, fresh);
    } else {
        elementCache.delete(selector);
    }

    return fresh;
}

// Debounce utility for performance
// Already defined above

// Throttle utility for performance
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Performance-optimized scroll handler (updated for per-page progress)
const optimizedScrollHandler = throttle(() => {
    // Update reading progress with cached elements
    try {
        const progressFill = getCachedElement('#progressFill');
        const progressPercentage = getCachedElement('#progressPercentage');

        if (!progressFill || !progressPercentage) return;

        // For paginated content, show progress within current page (1-100% per page)
        if (storyPages.length > 0 && totalPages > 0) {
            // Calculate scroll progress within the current page content
            const storyContent = document.getElementById('storyContent');
            if (storyContent) {
                const contentRect = storyContent.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                const scrollTop = window.pageYOffset;

                // Calculate visible area of story content
                const contentTop = contentRect.top + scrollTop;
                const contentHeight = contentRect.height;
                const contentBottom = contentTop + contentHeight;

                // Calculate how much of the current page content is viewed
                let pageProgress = 0;
                if (scrollTop >= contentTop) {
                    const scrolledIntoContent = scrollTop - contentTop;
                    const maxScrollInContent = Math.max(0, contentHeight - viewportHeight);

                    if (maxScrollInContent > 0) {
                        pageProgress = Math.min(100, (scrolledIntoContent / maxScrollInContent) * 100);
                    } else {
                        pageProgress = scrollTop >= contentBottom - viewportHeight ? 100 : 0;
                    }
                }

                const roundedProgress = Math.round(Math.max(0, Math.min(100, pageProgress)));

                progressFill.style.width = `${roundedProgress}%`;
                progressPercentage.textContent = `${roundedProgress}%`;

                // Update focus exit button progress if in focus mode
                if (isFocusMode) {
                    updateFocusExitButtonProgress();
                }
            }

            // Auto-save current page and scroll position for current story
            if (currentStory) {
                safeStorage.set(`page_${currentStory}`, currentPage);
                // Debounce the reading session save to avoid excessive calls
                if (window.saveSessionTimeout) {
                    clearTimeout(window.saveSessionTimeout);
                }
                window.saveSessionTimeout = setTimeout(() => {
                    saveReadingSession(currentStory, window.pageYOffset);
                }, 1000);
            }
        } else {
            // Fallback to scroll-based progress for non-paginated content
            const scrollTop = window.pageYOffset;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

            if (documentHeight <= 0) return;

            const progress = Math.min(100, Math.max(0, (scrollTop / documentHeight) * 100));
            const roundedProgress = Math.round(progress);

            progressFill.style.width = `${roundedProgress}%`;
            progressPercentage.textContent = `${roundedProgress}%`;

            // Auto-save scroll position for current story
            if (currentStory) {
                safeStorage.set(`scroll_${currentStory}`, scrollTop);
            }
        }
    } catch (error) {
        console.warn('Error in scroll handler:', error);
    }
}, 100);

// Memory management for large content
class ContentManager {
    constructor() {
        this.maxCachedStories = 3;
        this.storyContentCache = new Map();
    }

    cacheStoryContent(storyId, content) {
        if (this.storyContentCache.size >= this.maxCachedStories) {
            const oldestKey = this.storyContentCache.keys().next().value;
            this.storyContentCache.delete(oldestKey);
        }

        this.storyContentCache.set(storyId, {
            content,
            timestamp: Date.now()
        });
    }

    getCachedStoryContent(storyId) {
        const cached = this.storyContentCache.get(storyId);
        if (cached) {
            this.storyContentCache.delete(storyId);
            this.storyContentCache.set(storyId, cached);
            return cached.content;
        }
        return null;
    }

    clearCache() {
        this.storyContentCache.clear();
    }
}

const contentManager = new ContentManager();

// Initialize performance optimizations
function initializePerformanceOptimizations() {
    try {
        // Add optimized event listeners
        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });

        // Optimize resize handling
        const optimizedResizeHandler = debounce(() => {
            elementCache.clear();
            updateResponsiveElements();
        }, 250);

        window.addEventListener('resize', optimizedResizeHandler);

        // Initial setup
        updateResponsiveElements();

        console.log('Performance optimizations initialized');

    } catch (error) {
        console.warn('Failed to initialize performance optimizations:', error);
    }
}

// Update responsive elements
function updateResponsiveElements() {
    try {
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile-optimized');
        } else {
            document.body.classList.remove('mobile-optimized');
        }
    } catch (error) {
        console.warn('Error updating responsive elements:', error);
    }
}

// Cleanup function for memory management
function performCleanup() {
    try {
        contentManager.clearCache();
        elementCache.clear();

        // Clear old scroll positions
        const scrollKeys = Object.keys(localStorage).filter(key => key.startsWith('scroll_'));
        if (scrollKeys.length > 10) {
            scrollKeys.slice(0, -5).forEach(key => localStorage.removeItem(key));
        }

    } catch (error) {
        console.warn('Error during cleanup:', error);
    }
}

// Auto cleanup every 5 minutes
setInterval(performCleanup, 5 * 60 * 1000);

// === ADVANCED VISUAL EFFECTS SYSTEM ===

function initializeAdvancedEffects() {
    try {
        // Initialize magnetic particles
        setupMagneticParticles();

        // Setup 3D card tilt effects
        setup3DCardEffects();

        // Initialize mouse trail effect
        setupMouseTrail();

        // Setup holographic effects
        setupHolographicEffects();

        console.log('Advanced visual effects initialized');
    } catch (error) {
        console.warn('Failed to initialize advanced effects:', error);
    }
}

// Magnetic particle system
function setupMagneticParticles() {
    const particles = document.querySelectorAll('.particle');
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    particles.forEach((particle, index) => {
        // Randomize particle properties
        const size = Math.random() * 10 + 5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';

        // Animate particles with mouse attraction
        setInterval(() => {
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;

            const dx = mouseX - particleX;
            const dy = mouseY - particleY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Magnetic attraction within 200px
            if (distance < 200 && distance > 0) {
                const force = (200 - distance) / 200;
                const angle = Math.atan2(dy, dx);
                const offsetX = Math.cos(angle) * force * 20;
                const offsetY = Math.sin(angle) * force * 20;

                particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 + force * 0.5})`;
                particle.style.opacity = Math.min(1, 0.6 + force * 0.4);
            } else {
                particle.style.transform = 'translate(0, 0) scale(1)';
                particle.style.opacity = '0.6';
            }
        }, 50);
    });
}

// 3D card tilt effect
function setup3DCardEffects() {
    const storyCards = document.querySelectorAll('.story-card');

    storyCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;

            card.style.transform = `
                perspective(1000px)
                translateY(-12px)
                rotateX(${rotateX}deg)
                rotateY(${rotateY}deg)
                scale3d(1.03, 1.03, 1.03)
            `;

            // Update mouse position for holographic effect
            card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) translateY(0) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// Mouse trail effect
function setupMouseTrail() {
    const trail = [];
    const trailLength = 20;

    for (let i = 0; i < trailLength; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, rgba(100, 181, 246, ${1 - i / trailLength}) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            transition: all 0.1s ease;
            box-shadow: 0 0 10px rgba(100, 181, 246, ${1 - i / trailLength});
        `;
        document.body.appendChild(dot);
        trail.push({ element: dot, x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateTrail() {
        let x = mouseX;
        let y = mouseY;

        trail.forEach((dot, index) => {
            dot.element.style.left = x + 'px';
            dot.element.style.top = y + 'px';

            const nextDot = trail[index + 1] || trail[0];
            x += (nextDot.x - x) * 0.5;
            y += (nextDot.y - y) * 0.5;

            dot.x = x;
            dot.y = y;
        });

        requestAnimationFrame(animateTrail);
    }

    animateTrail();
}

// Holographic effects
function setupHolographicEffects() {
    // Add holographic shimmer to navigation
    const navIsland = document.querySelector('.nav-island');
    if (navIsland) {
        navIsland.addEventListener('mousemove', (e) => {
            const rect = navIsland.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;

            navIsland.style.background = `
                radial-gradient(circle at ${x}% ${y}%, 
                    rgba(100, 181, 246, 0.15) 0%, 
                    var(--glass-bg) 50%)
            `;
        });

        navIsland.addEventListener('mouseleave', () => {
            navIsland.style.background = 'var(--glass-bg)';
        });
    }
}

// Smooth scroll with easing
function smoothScrollTo(target, duration = 1000) {
    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Easing function (easeInOutCubic)
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}
