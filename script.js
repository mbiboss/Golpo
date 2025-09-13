// Global Variables
var currentTheme = 'dark';
var currentStory = '';
var currentFontSize = 100;
var isFocusMode = false;
var storyBookmarks = {}; // Per-story bookmarks

// DOM Elements
var storySelector = document.getElementById('storySelector');
var musicSelector = document.getElementById('musicSelector');
var storyTitle = document.getElementById('storyTitle');
var storyContent = document.getElementById('storyContent');
var playPauseBtn = document.getElementById('playPauseBtn');
var themeToggle = document.getElementById('themeToggle');
var logoText = document.getElementById('logoText');
var audioPlayer = document.getElementById('audioPlayer');
var youtubeFrame = document.getElementById('youtubeFrame');
var progressBar = document.getElementById('progressBar');
var progressPercentage = document.getElementById('progressPercentage');

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

// Initialize application
function initializeApp() {
    // Set default theme
    document.body.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
    
    // Initialize audio player
    audioPlayer.volume = 0.7;
    
    // Initialize play/pause button icon
    updatePlayPauseButton(true);
}

// Setup all event listeners
function setupEventListeners() {
    // New modal-based selection
    storySelector.addEventListener('click', openStoryModal);
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
    bookmarkBtn.addEventListener('click', toggleBookmark);
    
    // Focus mode exit button
    var focusExitBtn = document.getElementById('focusExitBtn');
    if (focusExitBtn) {
        focusExitBtn.addEventListener('click', toggleFocusMode);
    }
    
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
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
}


// Display story content
function displayStory(filename, content) {
    // Update title and logo text
    var storyName = getStoryDisplayName(filename);
    var writerName = '✿ㅤ"MʙɪㅤDᴀʀᴋ"';
    
    storyTitle.textContent = storyName;
    storyTitle.className = 'bangla-text';
    
    // Update writer name in story header
    var writerNameElement = document.getElementById('writerName');
    if (writerNameElement) {
        writerNameElement.textContent = 'by ' + writerName;
        writerNameElement.className = 'writer-name english-text';
    }
    
    logoText.textContent = storyName + ' by ' + writerName;
    document.title = storyName + ' by ' + writerName;
    
    // Clear loading state
    storyContent.innerHTML = '';
    
    // Process and display content
    var paragraphs = content.split('\n').filter(function(p) { return p.trim() !== ''; });
    
    paragraphs.forEach(paragraph => {
        var p = document.createElement('p');
        p.className = 'bangla-text';
        p.textContent = paragraph.trim();
        storyContent.appendChild(p);
    });
    
    // Scroll to top
    var storyContainer = document.querySelector('.story-container');
    if (storyContainer) {
        storyContainer.scrollTop = 0;
    }
    
    // Setup reading progress tracking
    setupReadingProgress();
    
    // Update bookmark button state for this story
    updateBookmarkButton();
    
    // Restore bookmark position for this story
    restoreBookmarkForCurrentStory();
}

// Show loading state
function showLoadingState() {
    storyContent.innerHTML = '<div class="welcome-text"><p>Loading story... 📖</p></div>';
}

// Show error message
function showError(message) {
    storyContent.innerHTML = '<div class="welcome-text"><p>❌ ' + message + '</p></div>';
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
    storyTitle.textContent = 'Welcome to Golpo';
    storyTitle.className = 'english-text';
    
    // Clear writer name
    var writerNameElement = document.getElementById('writerName');
    if (writerNameElement) {
        writerNameElement.textContent = '';
    }
    
    logoText.textContent = 'Golpo';
    document.title = 'Golpo - Bangla Stories with Music';
    storyContent.innerHTML = '<div class="welcome-text english-text"><p>Welcome to my website</p><p>Here you will find my written stories.</p><p>Although I am very lazy, I will still write stories here.</p><p>You can read the story and listen to the song with the button above</p><p>Thank you.!</p></div>';
    currentStory = '';
}

// Music Player Functions
function togglePlayPause() {
    if (!audioPlayer.src && !currentYouTubeUrl) {
        alert('Please select a music track first.');
        return;
    }
    
    if (currentYouTubeUrl) {
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
    } else {
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
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
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
            func(...args);
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
        return;
    }
    
    var scrollPercent = (scrollTop / maxScroll) * 100;
    scrollPercent = Math.max(0, Math.min(100, scrollPercent));
    
    progressPercentage.textContent = Math.round(scrollPercent) + '%';
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
            var storyName = this.querySelector('.card-title').textContent;
            
            loadStory(storyFile);
            updateSelectorText(storySelector, storyName, 'book');
            closeStoryModalFunc();
        });
    });
    
    // Music card listeners
    document.querySelectorAll('.music-card').forEach(card => {
        card.addEventListener('click', function() {
            var musicUrl = this.dataset.music;
            var musicName = this.querySelector('.card-title').textContent;
            
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
    var storyContainer = document.querySelector('.story-container');
    if (storyContainer) {
        storyContainer.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}

function toggleBookmark() {
    if (!currentStory) return;
    
    var storyContainer = document.querySelector('.story-container');
    if (!storyContainer) return;
    
    var currentScrollTop = storyContainer.scrollTop;
    var existingBookmark = storyBookmarks[currentStory];
    
    if (existingBookmark !== null && existingBookmark !== undefined && bookmarkBtn.classList.contains('active')) {
        // Go to bookmark if we have one
        goToBookmark();
        showNotification('Jumped to bookmark');
    } else {
        // Save current position as bookmark for this story
        storyBookmarks[currentStory] = currentScrollTop;
        bookmarkBtn.classList.add('active');
        bookmarkBtn.title = 'Go to Bookmark';
        showNotification('Position bookmarked');
        saveSettings();
    }
}

function goToBookmark() {
    if (!currentStory) return;
    
    var bookmark = storyBookmarks[currentStory];
    if (bookmark !== null && bookmark !== undefined) {
        var storyContainer = document.querySelector('.story-container');
        if (storyContainer) {
            storyContainer.scrollTo({
                top: bookmark,
                behavior: 'smooth'
            });
        }
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
    if (!searchTerm || !currentStory) {
        return;
    }
    
    // Escape search term for safe regex
    var escapedTerm = escapeRegExp(searchTerm);
    
    clearPreviousHighlights();
    var storyContent = document.getElementById('storyContent');
    var paragraphs = storyContent.querySelectorAll('p');
    var results = [];
    
    paragraphs.forEach((paragraph, index) => {
        var text = paragraph.textContent;
        try {
            var regex = new RegExp(escapedTerm, 'gi');
            var matches = text.match(regex);
        
            if (matches) {
                // Highlight the text
                var highlightedText = text.replace(regex, '<span class="search-highlight">$&</span>');
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
    
    displaySearchResults(results, searchTerm);
}

function clearSearch() {
    searchInput.value = '';
    searchResults.innerHTML = '';
    clearPreviousHighlights();
}

function clearPreviousHighlights() {
    var storyContent = document.getElementById('storyContent');
    var highlights = storyContent.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
        var parent = highlight.parentNode;
        parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
        parent.normalize();
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
    var paragraphs = storyContent.querySelectorAll('p');
    if (paragraphs[paragraphIndex]) {
        var storyContainer = document.querySelector('.story-container');
        if (storyContainer) {
            var elementTop = paragraphs[paragraphIndex].offsetTop;
            storyContainer.scrollTo({
                top: elementTop - 100, // Offset for better visibility
                behavior: 'smooth'
            });
        }
    }
}

// Handle visibility change (pause music when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audioPlayer.paused) {
        // Optionally pause music when tab is not visible
        // audioPlayer.pause();
    }
});
