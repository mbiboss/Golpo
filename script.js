// Global Variables
var currentTheme = 'dark';
var currentStory = '';
var currentFontSize = 100;
var isFocusMode = false;
var storyBookmarks = {}; // Per-story bookmarks

// Offline Reading Variables
var isOnline = navigator.onLine;
var serviceWorkerRegistration = null;
var cachedStories = new Set();
var offlineIndicator = null;

// Dynamic Image System - Only 2 images that change per story
var currentBannerImage = '';
var currentReadingImage = '';

// Story Image Mapping - Maps story IDs to their image URLs
var storyImageMap = {
    'bissash': {
        banner: 'https://i.postimg.cc/SRhxGb8L/Bissash-wide.png',
        reading: 'https://i.postimg.cc/FKDXWnhy/Bissash-small.png'
    },
    'Obisaperonontochaya': {
        banner:'https://i.postimg.cc/wMDMfnhn/static.png',
        reading:'https://i.postimg.cc/wMDMfnhn/static.png'
    },
    'upcoming': {
        banner: 'https://i.postimg.cc/wMDMfnhn/static.png',
        reading: 'https://i.postimg.cc/wMDMfnhn/static.png'
    }
};

// Default fallback images
var defaultImages = {
    banner: 'https://i.postimg.cc/wMDMfnhn/static.png',
    reading: 'https://i.postimg.cc/wMDMfnhn/static.png'
};

// Story Database with metadata (no hardcoded image URLs)
var storyDatabase = {
    'bissash.txt': {
        id: 'bissash',
        name: 'বিশ্বাস',
        location: 'ঢাকা, বাংলাদেশ',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'A story about trust and faith',
        status: 'available',
        readingTime: 0, // Will be calculated
        wordCount: 0    // Will be calculated
    },
    'Obisaperonontochaya.txt': {
        id: 'Obisaperonontochaya',
        bame: 'অভিশাপের অনন্ত ছায়া',
        location: 'Dhaka',
        writer:'✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'My curse',
        status: 'available',
        readingTime: 0,
        wordCount: 0
    },
    'upcoming.txt': {
        id: 'upcoming',
        name: 'Upcoming Stories',
        location: 'বিভিন্ন স্থান',
        writer: '✿ㅤ"MʙɪㅤDᴀʀᴋ"',
        description: 'More stories coming soon...',
        status: 'upcoming',
        readingTime: 0,
        wordCount: 0
    }
};

// Function to get banner image for a specific story
function getBannerImageForStory(storyId) {
    const images = storyImageMap[storyId] || defaultImages;
    return images.banner || defaultImages.banner;
}

// Function to get reading image for a specific story
function getReadingImageForStory(storyId) {
    const images = storyImageMap[storyId] || defaultImages;
    return images.reading || defaultImages.reading;
}

// Function to load images for current active story (for global access)
function loadStoryImages(storyId) {
    const images = storyImageMap[storyId] || defaultImages;
    currentBannerImage = images.banner;
    currentReadingImage = images.reading;
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

function initializeMainApp() {
    // Initialize the main application
    initializeApp();
    
    // Setup offline indicators
    setupOfflineIndicators();
    
    // Initialize performance optimizations
    initializePerformanceOptimizations();
    
    setupEventListeners();
    loadSavedSettings();
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

// Function to load story from suggestion card click
function loadStoryFromSuggestion(storyFile) {
    // Switch to reader view
    showReaderView();
    // Load the story
    loadStory(storyFile);
    // Update cover image in reader
    updateReaderCoverImage(storyFile);
    // Update navigation buttons
    updateStoryNavigation(storyFile);
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
            <h2 class="suggestions-title english-text">📚 More Stories to Read</h2>
            <div class="suggestions-grid">
    `;
    
    otherStories.forEach(story => {
        const statusClass = story.status === 'upcoming' ? 'upcoming' : '';
        // Get reading image for this specific story
        const suggestionImage = getReadingImageForStory(story.id);
        
        suggestionsHTML += `
            <div class="suggestion-card ${statusClass}" onclick="loadStoryFromSuggestion('${story.file}')">
                <div class="suggestion-cover" style="background-image: url('${suggestionImage}'); background-size: cover; background-position: center; width: 80px; height: 80px; border-radius: 8px; margin-right: 15px;"></div>
                <div class="suggestion-content">
                    <div class="suggestion-icon">${story.status === 'upcoming' ? '🚀' : '📖'}</div>
                    <h3 class="suggestion-title ${story.file === 'upcoming.txt' ? 'english-text' : ''}">${story.name}</h3>
                    <p class="suggestion-description english-text">${story.description}</p>
                    <div class="suggestion-meta english-text">
                        <span class="author">by ${story.writer}</span>
                        <span class="location">📍 ${story.location}</span>
                        <span class="status ${story.status}">${story.status === 'upcoming' ? 'Coming Soon' : 'Available'}</span>
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
function loadStoryFromCard(storyFile) {
    // Switch to reader view
    showReaderView();
    // Load the story
    loadStory(storyFile);
    // Update cover image in reader
    updateReaderCoverImage(storyFile);
    // Update navigation buttons
    updateStoryNavigation(storyFile);
}

function showReaderView() {
    document.getElementById('libraryView').style.display = 'none';
    document.getElementById('readerView').style.display = 'block';
    
    // Hide navigation in focus mode
    if (isFocusMode) {
        document.querySelector('.nav-container').style.opacity = '0';
        document.querySelector('.footer').style.opacity = '0';
    }
}

function returnToLibrary() {
    document.getElementById('readerView').style.display = 'none';
    document.getElementById('libraryView').style.display = 'block';
    
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

function updateStoryNavigation(currentStoryFile) {
    const stories = Object.keys(storyDatabase);
    const currentIndex = stories.indexOf(currentStoryFile);
    
    const prevBtn = document.getElementById('prevStoryBtn');
    const nextBtn = document.getElementById('nextStoryBtn');
    
    if (prevBtn && nextBtn) {
        // Enable/disable based on position
        prevBtn.disabled = currentIndex <= 0;
        nextBtn.disabled = currentIndex >= stories.length - 1;
        
        // Store current story info
        prevBtn.dataset.story = currentIndex > 0 ? stories[currentIndex - 1] : '';
        nextBtn.dataset.story = currentIndex < stories.length - 1 ? stories[currentIndex + 1] : '';
    }
}

function loadPreviousStory() {
    const prevBtn = document.getElementById('prevStoryBtn');
    const storyFile = prevBtn.dataset.story;
    if (storyFile && !prevBtn.disabled) {
        loadStoryFromCard(storyFile);
    }
}

function loadNextStory() {
    const nextBtn = document.getElementById('nextStoryBtn');
    const storyFile = nextBtn.dataset.story;
    if (storyFile && !nextBtn.disabled) {
        loadStoryFromCard(storyFile);
    }
}

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
    
    // Restore scroll position after story loads
    setTimeout(() => {
        if (lastReadingSession.scrollPosition) {
            window.scrollTo({
                top: lastReadingSession.scrollPosition,
                behavior: 'smooth'
            });
        }
    }, 500);
}

function saveReadingSession(storyFile, scrollPosition = 0) {
    const readingSession = {
        story: storyFile,
        scrollPosition: scrollPosition,
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

// Initialize application
function initializeApp() {
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
}

// Setup reading progress tracking for reader view
function setupReaderProgress() {
    const storyContent = document.getElementById('storyContent');
    if (!storyContent) return;
    
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
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all paragraphs
    storyContent.querySelectorAll('p').forEach(p => {
        observer.observe(p);
    });
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

// Setup all event listeners
function setupEventListeners() {
    // New modal-based selection
    musicSelector.addEventListener('click', openMusicModal);
    
    // Modal close events
    closeStoryModal.addEventListener('click', closeStoryModalFunc);
    closeMusicModal.addEventListener('click', closeMusicModalFunc);
    storyModalOverlay.addEventListener('click', closeStoryModalFunc);
    musicModalOverlay.addEventListener('click', closeMusicModalFunc);
    
    // Story and music card clicks
    setupCardListeners();
    
    // Music controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Audio player events
    audioPlayer.addEventListener('loadeddata', onAudioLoaded);
    audioPlayer.addEventListener('error', onAudioError);
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('ended', onAudioEnded);
    
    // Reading controls
    readingControlsBtn.addEventListener('click', toggleReadingControls);
    decreaseFontBtn.addEventListener('click', decreaseFontSize);
    increaseFontBtn.addEventListener('click', increaseFontSize);
    focusModeBtn.addEventListener('click', toggleFocusMode);
    scrollTopBtn.addEventListener('click', scrollToTop);
    
    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', toggleBookmark);
    } else {
    }
    
    // Focus mode exit button
    var focusExitBtn = document.getElementById('focusExitBtn');
    if (focusExitBtn) {
        focusExitBtn.addEventListener('click', toggleFocusMode);
    }
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    } else {
    }
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
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
    
    // Process and display content
    var paragraphs = content.split('\n').filter(function(p) { return p.trim() !== ''; });
    
    if (storyContent) {
        paragraphs.forEach(paragraph => {
            var p = document.createElement('p');
            p.className = 'bangla-text';
            p.textContent = paragraph.trim();
            storyContent.appendChild(p);
        });
    }
    
    // Add story suggestions at the end
    if (storyContent) {
        var suggestionsHTML = createStorySuggestions(filename);
        if (suggestionsHTML) {
            var suggestionsDiv = document.createElement('div');
            suggestionsDiv.innerHTML = suggestionsHTML;
            storyContent.appendChild(suggestionsDiv.firstElementChild);
        }
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Setup reading progress tracking for reader view
    setupReaderProgress();
    
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
        storyContent.innerHTML = '<div class="welcome-text"><p>Loading story... 📖</p></div>';
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
        <div class="story-card" data-story="${filename}" onclick="loadStoryFromCard('${filename}')">
            <div class="story-cover story-cover-wide" style="background-image: url('${bannerImage}'); background-size: cover; background-position: center;">
                <div class="story-status ${story.status}">${story.status === 'upcoming' ? 'Coming Soon' : 'Available'}</div>
            </div>
            <div class="story-info">
                <h3 class="story-title" ${filename !== 'upcoming.txt' ? 'style="font-family: \'BanglaFont\', \'Noto Sans Bengali\', sans-serif;"' : ''}>${story.name}</h3>
                <p class="story-description">${story.description}</p>
                <div class="story-meta">
                    <span class="author">by ${story.writer}</span>
                    <span class="location">📍 ${story.location}</span>
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

// Settings Management
function saveSettings() {
    var settings = {
        theme: currentTheme,
        currentStory: currentStory,
        fontSize: currentFontSize,
        focusMode: isFocusMode,
        bookmarks: storyBookmarks
    };
    
    localStorage.setItem('golpoSettings', JSON.stringify(settings));
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
        
        // Story selection now handled by modal system
        
    } catch (error) {
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

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Space bar to toggle play/pause (when not in input fields)
    if (e.code === 'Space' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        e.preventDefault();
        togglePlayPause();
    }
    
    // T key to toggle theme
    if (e.code === 'KeyT' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) {
        toggleTheme();
    }
});

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
function toggleReadingControls() {
    readingControlsDropdown.classList.toggle('active');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!readingControlsDropdown.contains(e.target)) {
        readingControlsDropdown.classList.remove('active');
    }
});

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
        textElement.textContent = text;
    }
    
    if (iconElement) {
        iconElement.className = iconType === 'book' ? 'fas fa-book-open' : 'fas fa-music';
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
                showNotification('📖 Loading cached story (offline mode)', 'info');
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
                showNotification(`⏳ Retrying... (${retryCount}/${maxRetries})`, 'warning');
                
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

function setMusicSource(url) {
    if (!url) {
        showNotification('❌ No music URL provided', 'error');
        return;
    }
    
    try {
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
        
        try {
            if (currentYouTubeUrl && youtubeFrame) {
                youtubeFrame.src = '';
                isYouTubePlaying = false;
                currentYouTubeUrl = '';
            }
        } catch (youtubeError) {
            console.warn('Error stopping YouTube:', youtubeError);
        }
        
        // Set new music source with error handling
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            try {
                currentYouTubeUrl = url;
                showNotification('🎵 YouTube music selected', 'success');
            } catch (error) {
                showNotification('❌ Failed to set YouTube music', 'error');
                console.error('YouTube setup error:', error);
            }
        } else {
            try {
                audioPlayer.src = url;
                
                // Add one-time error handler for this track
                const errorHandler = () => {
                    showNotification('❌ Failed to load audio track', 'error');
                    audioPlayer.removeEventListener('error', errorHandler);
                };
                
                const loadHandler = () => {
                    showNotification('🎵 Audio track loaded successfully', 'success');
                    audioPlayer.removeEventListener('loadeddata', loadHandler);
                    audioPlayer.removeEventListener('error', errorHandler);
                };
                
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
        // Show the dedicated exit button
        if (focusExitBtn) {
            focusExitBtn.style.display = 'flex';
        }
    } else {
        icon.className = 'fas fa-eye';
        // Hide the dedicated exit button
        if (focusExitBtn) {
            focusExitBtn.style.display = 'none';
        }
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
        
        // Use window scroll position instead of container scroll
        var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var existingBookmark = storyBookmarks[currentStory];
        
        
        if (existingBookmark !== null && existingBookmark !== undefined && bookmarkBtn && bookmarkBtn.classList.contains('active')) {
            // Check if we're close to the bookmarked position (within 50 pixels)
            var distanceFromBookmark = Math.abs(currentScrollTop - existingBookmark);
            
            if (distanceFromBookmark <= 50) {
                // We're at the bookmark position, offer to delete it
                delete storyBookmarks[currentStory];
                bookmarkBtn.classList.remove('active');
                bookmarkBtn.title = 'Bookmark Position';
                showNotification('🗑️ Bookmark deleted', 'success');
                saveSettings();
            } else {
                // Go to bookmark if we have one
                goToBookmark();
                showNotification('📖 Jumped to bookmark', 'success');
            }
        } else {
            // Save current position as bookmark for this story
            storyBookmarks[currentStory] = currentScrollTop;
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
        // Use window scroll instead of container scroll
        window.scrollTo({
            top: bookmark,
            behavior: 'smooth'
        });
    }
}

function updateBookmarkButton() {
    if (!currentStory) return;
    
    var bookmark = storyBookmarks[currentStory];
    if (bookmark !== null && bookmark !== undefined) {
        bookmarkBtn.classList.add('active');
        bookmarkBtn.title = 'Go to Bookmark';
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

function showNotification(message) {
    // Create notification element
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        padding: 10px 15px;
        color: var(--text-primary);
        font-size: 14px;
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
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
    
    // Escape search term for safe regex
    var escapedTerm = escapeRegExp(searchTerm);
    
    clearPreviousHighlights();
    var storyContent = document.getElementById('storyContent');
    
    if (!storyContent) {
        showNotification('❌ Story content not found', 'error');
        return;
    }
    
    var paragraphs = storyContent.querySelectorAll('p');
    var results = [];
    
    paragraphs.forEach((paragraph, index) => {
        var text = paragraph.textContent;
        try {
            var regex = new RegExp(escapedTerm, 'gi');
            var matches = text.match(regex);
        
            if (matches) {
                // Highlight the text with ultra-visible styling
                var highlightedText = text.replace(regex, '<span class="search-highlight" style="background: linear-gradient(45deg, #ff0000, #ff6b6b) !important; color: #ffffff !important; padding: 3px 6px !important; border-radius: 6px !important; font-weight: 900 !important; box-shadow: 0 2px 8px rgba(255, 0, 0, 0.5) !important; border: 2px solid #ffffff !important;">$&</span>');
                paragraph.innerHTML = highlightedText;
                
                // Add to results
                var context = text.substring(Math.max(0, text.toLowerCase().indexOf(searchTerm.toLowerCase()) - 20), 
                                           text.toLowerCase().indexOf(searchTerm.toLowerCase()) + searchTerm.length + 20);
                results.push({
                    paragraph: index,
                    context: context,
                    element: paragraph
                });
            }
        } catch (error) {
            // Skip invalid regex patterns
        }
    });
    
    // Show notification with results
    if (results.length > 0) {
        showNotification(`🔍 Found ${results.length} matches highlighted in red`, 'success');
        
        // Don't auto-scroll so user can see all highlights
        // Just show the search results list for navigation
    } else {
        showNotification(`❌ No matches found for "${searchTerm}"`, 'error');
    }
    
    displaySearchResults(results, searchTerm);
}

function clearSearch() {
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (searchResults) {
        searchResults.innerHTML = '';
    }
    
    clearPreviousHighlights();
    showNotification('🗑️ Search cleared', 'success');
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
    
    results.forEach((result, index) => {
        html += '<div class="search-result-item" onclick="scrollToSearchResult(' + result.paragraph + ')">' +
                (index + 1) + '. ...' + escapeHtml(result.context) + '...' +
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
        paragraphs[paragraphIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
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

// Export to global scope for inline onclick handlers
window.scrollToSearchResult = scrollToSearchResult;

// Handle visibility change (pause music when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audioPlayer.paused) {
        // Optionally pause music when tab is not visible
        // audioPlayer.pause();
    }
});

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
        showNotification('🌐 Back online!', 'success');
    } else {
        showNotification('📴 You\'re offline. Cached stories available', 'warning');
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
        `🌐 Online - All ${totalStories} stories available` :
        `📴 Offline - ${cachedCount}/${totalStories} stories cached`;
    
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

// Enhanced notification system
function showNotification(message, type = 'info', duration = 4000) {
    try {
        // Remove existing notifications to prevent spam
        const existingNotifications = document.querySelectorAll('.golpo-notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        const notification = document.createElement('div');
        notification.className = `golpo-notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles if not present
        if (!document.querySelector('#notificationStyles')) {
            const style = document.createElement('style');
            style.id = 'notificationStyles';
            style.textContent = `
                .golpo-notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    z-index: 10000;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    max-width: 350px;
                    word-wrap: break-word;
                    animation: slideInRight 0.3s ease-out;
                }
                
                .notification-success {
                    background: rgba(76, 175, 80, 0.9);
                    color: white;
                }
                
                .notification-error {
                    background: rgba(244, 67, 54, 0.9);
                    color: white;
                }
                
                .notification-warning {
                    background: rgba(255, 152, 0, 0.9);
                    color: white;
                }
                
                .notification-info {
                    background: rgba(33, 150, 243, 0.9);
                    color: white;
                }
                
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @media (max-width: 768px) {
                    .golpo-notification {
                        top: 70px;
                        left: 20px;
                        right: 20px;
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
        
    } catch (error) {
        console.error('Failed to show notification:', error);
        // Fallback to alert for critical messages
        if (type === 'error') {
            alert(message);
        }
    }
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
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

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

// Performance-optimized scroll handler
const optimizedScrollHandler = throttle(() => {
    // Update reading progress with cached elements
    try {
        const storyContent = getCachedElement('#storyContent');
        const progressFill = getCachedElement('#progressFill');
        const progressPercentage = getCachedElement('#progressPercentage');
        
        if (!storyContent || !progressFill || !progressPercentage) return;
        
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
