// Global Variables
var currentTheme = 'sepia';
var currentStory = '';
var currentFontSize = 100;
var isFocusMode = false;
var storyBookmarks = {}; // Per-story bookmarks

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

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadSavedSettings();
});

// Function to load story from suggestion card click
function loadStoryFromSuggestion(storyFile) {
    loadStory(storyFile);
    // Hide story suggestions and show the story
    const storySuggestions = document.getElementById('storySuggestions');
    if (storySuggestions) {
        storySuggestions.style.display = 'none';
    }
}

// Function to create story suggestions HTML
function createStorySuggestions(currentStoryFile) {
    // List of all available stories
    const stories = [
        { file: 'bissash.txt', title: 'বিশ্বাস', description: 'A story about trust and faith', status: 'available' },
        { file: 'upcoming.txt', title: 'Upcoming Stories', description: 'More stories coming soon...', status: 'upcoming' }
    ];
    
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
        suggestionsHTML += `
            <div class="suggestion-card ${statusClass}" onclick="loadStoryFromSuggestion('${story.file}')">
                <div class="suggestion-icon">${story.status === 'upcoming' ? '🚀' : '📖'}</div>
                <h3 class="suggestion-title ${story.file === 'upcoming.txt' ? 'english-text' : ''}">${story.title}</h3>
                <p class="suggestion-description english-text">${story.description}</p>
                <div class="suggestion-meta english-text">
                    <span class="author">by ✿ㅤ"MʙɪㅤDᴀʀᴋ"</span>
                    <span class="status ${story.status}">${story.status === 'upcoming' ? 'Coming Soon' : 'Available'}</span>
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
    updateReaderCoverImage();
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
    
    // Define story metadata for searching
    const storyMetadata = {
        'bissash.txt': {
            title: 'বিশ্বাস',
            description: 'A story about trust and faith',
            keywords: ['বিশ্বাস', 'trust', 'faith', 'bengali', 'story', 'touching']
        },
        'upcoming.txt': {
            title: 'Upcoming Stories',
            description: 'More stories coming soon...',
            keywords: ['upcoming', 'coming', 'soon', 'stories', 'future']
        }
    };
    
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

function updateReaderCoverImage() {
    const readerCoverImage = document.getElementById('readerCoverImage');
    if (readerCoverImage) {
        readerCoverImage.src = 'https://i.postimg.cc/FKDXWnhy/Bissash-small.png';
    }
}

function updateStoryNavigation(currentStoryFile) {
    const stories = ['bissash.txt', 'upcoming.txt'];
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
        console.log('Bookmark button event listener added');
    } else {
        console.error('Bookmark button not found!');
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
        console.log('Clear search button event listener added');
    } else {
        console.error('Clear search button not found!');
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
    // Update title and logo text
    var storyName = getStoryDisplayName(filename);
    var writerName = '✿ㅤ"MʙɪㅤDᴀʀᴋ"';
    
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
        readerAuthor.textContent = 'by ' + writerName;
    }
    
    // Update browser title and nav logo
    logoText.textContent = storyName + ' by ' + writerName;
    document.title = storyName + ' by ' + writerName;
    
    // Update story details (reading time, word count)
    updateStoryDetails(filename, content);
    
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
    var storyMap = {
        'bissash.txt': '_বিশ্বাস_',
        'upcoming.txt': 'upcoming'
    };
    return storyMap[filename] || filename.replace('.txt', '').replace(/^\w/, function(c) { return c.toUpperCase(); }).replace(/([0-9])/g, ' $1');
}

// Reset to welcome screen
function resetToWelcome() {
    // Return to library view
    returnToLibrary();
    
    // Update page title and logo
    if (logoText) {
        logoText.textContent = 'Golpo';
    }
    document.title = 'Golpo - Bangla Stories with Music';
    currentStory = '';
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
            console.log('YouTube music stopped');
        } else {
            youtubeFrame.src = currentYouTubeUrl;
            isYouTubePlaying = true;
            updatePlayPauseButton(false);
            console.log('YouTube music started:', currentYouTubeUrl);
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
    console.log('Audio loaded successfully');
}

function onAudioError() {
    console.error('Audio failed to load');
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
    
    // Also save in old key for backward compatibility
    localStorage.setItem('storyReaderSettings', JSON.stringify(settings));
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
        console.error('Error loading saved settings:', error);
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
                    console.error('Debounced function error:', error);
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
            var titleElement = this.querySelector('.card-title');
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

function loadStory(filename) {
    if (!filename) return;
    
    currentStory = filename;
    showLoadingState();
    
    fetch('stories/' + filename)
        .then(response => {
            if (!response.ok) {
                throw new Error('Story not found');
            }
            return response.text();
        })
        .then(content => {
            displayStory(filename, content);
        })
        .catch(error => {
            console.error('Error loading story:', error);
            showError('Story could not be loaded. Please try again.');
        });
}

function setMusicSource(url) {
    if (!url) return;
    
    // Stop current playback
    if (audioPlayer.src) {
        audioPlayer.pause();
        audioPlayer.src = '';
    }
    
    if (currentYouTubeUrl) {
        youtubeFrame.src = '';
        isYouTubePlaying = false;
        currentYouTubeUrl = '';
    }
    
    // Set new music source
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        currentYouTubeUrl = url;
        console.log('Setting YouTube URL:', url);
    } else {
        audioPlayer.src = url;
        console.log('Setting audio URL:', url);
    }
    
    updatePlayPauseButton(true);
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
    console.log('toggleBookmark function called');
    console.log('Current story:', currentStory);
    
    if (!currentStory) {
        console.log('No current story, bookmark not available');
        showNotification('⚠️ Please load a story first', 'warning');
        return;
    }
    
    try {
        // Initialize storyBookmarks if it doesn't exist
        if (typeof storyBookmarks === 'undefined') {
            window.storyBookmarks = {};
            console.log('Initialized storyBookmarks');
        }
        
        // Use window scroll position instead of container scroll
        var currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var existingBookmark = storyBookmarks[currentStory];
        
        console.log('Current scroll position:', currentScrollTop);
        console.log('Existing bookmark:', existingBookmark);
        console.log('Bookmark button has active class:', bookmarkBtn ? bookmarkBtn.classList.contains('active') : 'bookmarkBtn not found');
        
        if (existingBookmark !== null && existingBookmark !== undefined && bookmarkBtn && bookmarkBtn.classList.contains('active')) {
            // Check if we're close to the bookmarked position (within 50 pixels)
            var distanceFromBookmark = Math.abs(currentScrollTop - existingBookmark);
            
            if (distanceFromBookmark <= 50) {
                // We're at the bookmark position, offer to delete it
                console.log('At bookmark position, deleting bookmark');
                delete storyBookmarks[currentStory];
                bookmarkBtn.classList.remove('active');
                bookmarkBtn.title = 'Bookmark Position';
                showNotification('🗑️ Bookmark deleted', 'success');
                saveSettings();
            } else {
                // Go to bookmark if we have one
                console.log('Going to existing bookmark');
                goToBookmark();
                showNotification('📖 Jumped to bookmark', 'success');
            }
        } else {
            // Save current position as bookmark for this story
            console.log('Saving new bookmark at position:', currentScrollTop);
            storyBookmarks[currentStory] = currentScrollTop;
            if (bookmarkBtn) {
                bookmarkBtn.classList.add('active');
                bookmarkBtn.title = 'Go to Bookmark';
            }
            showNotification('🔖 Position bookmarked', 'success');
            saveSettings();
        }
    } catch (error) {
        console.error('Error in toggleBookmark:', error);
        showNotification('❌ Bookmark error', 'error');
    }
}

function goToBookmark() {
    if (!currentStory) return;
    
    var bookmark = storyBookmarks[currentStory];
    console.log('Going to bookmark position:', bookmark);
    
    if (bookmark !== null && bookmark !== undefined) {
        // Use window scroll instead of container scroll
        window.scrollTo({
            top: bookmark,
            behavior: 'smooth'
        });
        console.log('Scrolled to bookmark position');
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
            console.warn('Invalid search pattern:', searchTerm);
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
    console.log('clearSearch function called');
    
    if (searchInput) {
        searchInput.value = '';
        console.log('Search input cleared');
    }
    
    if (searchResults) {
        searchResults.innerHTML = '';
        console.log('Search results cleared');
    }
    
    clearPreviousHighlights();
    showNotification('🗑️ Search cleared', 'success');
    console.log('clearSearch function completed');
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
    console.log('scrollToSearchResult called with index:', paragraphIndex);
    
    var storyContent = document.getElementById('storyContent');
    if (!storyContent) {
        console.log('Story content not found');
        return;
    }
    
    var paragraphs = storyContent.querySelectorAll('p');
    console.log('Found paragraphs:', paragraphs.length);
    
    if (paragraphs[paragraphIndex]) {
        console.log('Scrolling to paragraph', paragraphIndex);
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
        console.log('Paragraph not found at index:', paragraphIndex);
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
