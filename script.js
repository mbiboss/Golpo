// Global Variables
var currentTheme = 'dark';
var audioPlayer = null;
var currentStory = '';

// DOM Elements
var storySelect = document.getElementById('storySelect');
var storyTitle = document.getElementById('storyTitle');
var storyContent = document.getElementById('storyContent');
var playPauseBtn = document.getElementById('playPauseBtn');
var volumeSlider = document.getElementById('volumeSlider');
var themeToggle = document.getElementById('themeToggle');
var musicSelect = document.getElementById('musicSelect');
var logoText = document.getElementById('logoText');
var audioPlayerElement = document.getElementById('audioPlayer');

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
    audioPlayer = audioPlayerElement;
    audioPlayer.volume = volumeSlider.value;
    
    // Initialize play/pause button icon
    updatePlayPauseButton(true);
}

// Setup all event listeners
function setupEventListeners() {
    // Story selection
    storySelect.addEventListener('change', handleStorySelection);
    
    // Music controls
    playPauseBtn.addEventListener('click', togglePlayPause);
    volumeSlider.addEventListener('input', handleVolumeChange);
    musicSelect.addEventListener('change', handleMusicSelection);
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Audio player events
    audioPlayer.addEventListener('loadeddata', onAudioLoaded);
    audioPlayer.addEventListener('error', onAudioError);
    audioPlayer.addEventListener('play', onAudioPlay);
    audioPlayer.addEventListener('pause', onAudioPause);
    audioPlayer.addEventListener('ended', onAudioEnded);
}

// Story Selection Handler
function handleStorySelection() {
    var selectedStory = storySelect.value;
    
    if (!selectedStory) {
        resetToWelcome();
        return;
    }
    
    showLoadingState();
    loadStoryFromFile(selectedStory)
        .then(function(storyText) {
            displayStory(selectedStory, storyText);
            currentStory = selectedStory;
            saveSettings();
        })
        .catch(function(error) {
            console.error('Error loading story:', error);
            showError('Failed to load story. Please try again.');
        });
}

// Load story from file
function loadStoryFromFile(filename) {
    return fetch('stories/' + filename)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Failed to load story: ' + response.status);
            }
            return response.text();
        });
}

// Display story content
function displayStory(filename, content) {
    // Update title and logo text
    var storyName = getStoryDisplayName(filename);
    storyTitle.textContent = storyName;
    logoText.textContent = storyName + ' by MB';
    document.title = storyName + ' by MB';
    
    // Clear loading state
    storyContent.innerHTML = '';
    
    // Process and display content
    var paragraphs = content.split('\n').filter(function(p) { return p.trim() !== ''; });
    
    paragraphs.forEach(paragraph => {
        var p = document.createElement('p');
        p.textContent = paragraph.trim();
        storyContent.appendChild(p);
    });
    
    // Scroll to top
    storyContent.scrollTop = 0;
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
        'story1.txt': 'একটি ছোট গ্রামের গল্প',
        'story2.txt': 'বুদ্ধিমান শিয়ালের গল্প'
    };
    return storyMap[filename] || filename.replace('.txt', '').replace(/^\w/, function(c) { return c.toUpperCase(); }).replace(/([0-9])/g, ' $1');
}

// Reset to welcome screen
function resetToWelcome() {
    storyTitle.textContent = 'Welcome to Story Reader';
    logoText.textContent = 'StoryReader';
    document.title = 'Story Reader - Bangla Stories with Music';
    storyContent.innerHTML = '<div class="welcome-text"><p>Welcome to our Bangla story reading platform! 📚</p><p>Choose a story from the dropdown menu above to start reading.</p><p>You can also play background music while reading for a better experience.</p><p>Toggle between dark and light themes using the theme button.</p></div>';
    currentStory = '';
}

// Music Player Functions
function togglePlayPause() {
    if (!audioPlayer.src) {
        alert('Please select a music track first.');
        return;
    }
    
    if (audioPlayer.paused) {
        audioPlayer.play();
    } else {
        audioPlayer.pause();
    }
}

function handleVolumeChange() {
    audioPlayer.volume = volumeSlider.value;
    updateVolumeIcon();
    saveSettings();
}

function handleMusicSelection() {
    var selectedMusic = musicSelect.value;
    
    if (!selectedMusic) {
        audioPlayer.src = '';
        updatePlayPauseButton(true);
        return;
    }
    
    audioPlayer.src = selectedMusic;
    saveSettings();
}


function updatePlayPauseButton(paused) {
    var icon = playPauseBtn.querySelector('.icon');
    if (paused) {
        icon.className = 'fas fa-play icon';
    } else {
        icon.className = 'fas fa-pause icon';
    }
}

function updateVolumeIcon() {
    var volumeIcon = document.querySelector('.volume-icon');
    var volume = audioPlayer.volume;
    
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute volume-icon';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down volume-icon';
    } else {
        volumeIcon.className = 'fas fa-volume-up volume-icon';
    }
}

// Audio Player Event Handlers
function onAudioLoaded() {
    console.log('Audio loaded successfully');
}

function onAudioError() {
    console.error('Audio failed to load');
    alert('Failed to load selected music. Please try a different track.');
    musicSelect.value = '';
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
        volume: volumeSlider.value,
        currentStory: currentStory,
        selectedMusic: musicSelect.value
    };
    
    localStorage.setItem('storyReaderSettings', JSON.stringify(settings));
}

function loadSavedSettings() {
    var savedSettings = localStorage.getItem('storyReaderSettings');
    
    if (!savedSettings) return;
    
    try {
        var settings = JSON.parse(savedSettings);
        
        // Restore theme
        if (settings.theme) {
            currentTheme = settings.theme;
            document.body.setAttribute('data-theme', currentTheme);
            updateThemeIcon();
        }
        
        // Restore volume
        if (settings.volume) {
            volumeSlider.value = settings.volume;
            audioPlayer.volume = settings.volume;
            updateVolumeIcon();
        }
        
        // Restore music selection
        if (settings.selectedMusic) {
            musicSelect.value = settings.selectedMusic;
            handleMusicSelection();
        }
        
        // Restore story selection (optional - maybe user wants fresh start)
        // if (settings.currentStory) {
        //     storySelect.value = settings.currentStory;
        //     handleStorySelection();
        // }
        
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

// Handle visibility change (pause music when tab is not active)
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !audioPlayer.paused) {
        // Optionally pause music when tab is not visible
        // audioPlayer.pause();
    }
});
