# Golpo - Bengali Story Reading Platform

## Overview

Golpo is an immersive Bengali storytelling web application that combines elegant design with ambient music to create a rich reading experience. The platform features a glassmorphic UI with dark/sepia themes, particle effects, YouTube music integration, and offline reading capabilities through service workers. It's designed as a Progressive Web App (PWA) focused on Bengali typography and content delivery.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single Page Application (SPA)**
- Pure vanilla JavaScript without frameworks for lightweight performance
- HTML5 semantic structure with Bengali language support (`lang="bn"`)
- Modular CSS with CSS custom properties for theming
- Event-driven architecture for user interactions

**Design System**
- **Theming**: CSS custom properties system with dark and sepia themes
- **Glassmorphism UI**: Semi-transparent overlays with backdrop filters
- **Particle Effects**: Canvas-based or CSS animations for ambient background
- **Typography**: Google Fonts integration (Noto Sans Bengali) with Font Awesome icons
- **Responsive Design**: Mobile-first approach with viewport-based scaling

**State Management**
- Global JavaScript variables for application state
- LocalStorage for persistent data (bookmarks, preferences, reading progress)
- No external state management library used

### Content Management

**Story Storage**
- Text-based stories stored in `/stories/` directory as `.txt` files
- Stories written in Bengali (UTF-8 encoding)
- Simple file-based content delivery system

**Pagination System**
- Client-side story pagination with configurable lines per page
- Reading progress tracking per story
- Bookmark functionality for individual stories

**Focus Mode**
- Distraction-free reading experience
- Adjustable font sizing (currentFontSize variable)
- Per-story state management

### Offline Capabilities

**Service Worker Implementation** (`sw.js`)
- Multi-cache strategy with versioning:
  - `STATIC_CACHE`: Core application files (HTML, CSS, JS, fonts, assets)
  - `STORIES_CACHE`: Story content files
  - `CACHE_NAME`: Main cache identifier with semantic versioning (v1.2.0)
- Cache-first strategy for static assets
- Network-first with cache fallback for dynamic content
- Automatic cache cleanup on activation

**Progressive Web App (PWA)**
- Service worker registration for offline access
- Cache management for stories and static assets
- Online/offline status detection and indication
- Install prompts for native-like experience

### Media Integration

**YouTube Music Player**
- Embedded YouTube iframe API integration
- Playlist management system with track metadata:
  - Title, artist, duration, custom icons
  - Playlist array structure for multiple songs
- Autoplay functionality with URL parameters
- Background ambient music support

**Playlist Structure**
```javascript
{
  title: string,
  artist: string, 
  url: string (YouTube embed URL),
  duration: string,
  icon: string (Font Awesome class)
}
```

### User Experience Features

**Startup/Splash Screen**
- Branded entry experience with logo and animations
- Tap-to-continue interaction pattern
- Particle effects for visual appeal

**Reading Features**
- Page-based navigation (previous/next)
- Reading progress tracking
- Bookmark system per story
- Font size customization
- Theme switching (dark/sepia)
- Focus mode toggle

**Visual Effects**
- Particle animations container system
- Gradient color schemes using CSS custom properties
- Glow effects and shadows for depth
- Smooth transitions between states
- Custom animated cursor with user-provided image
- Enhanced particle trail following cursor movement
- Smooth hover animations with cubic-bezier easing

### Asset Management

**Static Assets**
- Logo: `/assets/logo.png` with fallback handling
- Custom fonts: Bengali (`Bangla_font.ttf`) and English (`English_font.otf`)
- External CDN usage: Font Awesome icons, Google Fonts
- Image fallback mechanisms (onerror handlers)

**Font Loading Strategy**
- Preconnect to Google Fonts for faster loading
- Local custom font files as backup
- Font display swap for better performance

## External Dependencies

### Third-Party Services

**Google Fonts**
- Noto Sans Bengali (weights: 300, 400, 500, 600, 700)
- Preconnect optimization for performance
- Display swap strategy

**Font Awesome**
- Version 6.4.0 via CDN (cdnjs.cloudflare.com)
- Icon library for UI elements

**YouTube**
- Embedded iframe player for music playback
- Autoplay parameter integration
- Playlist URLs with video IDs

**Image Hosting**
- PostImg (i.postimg.cc) for logo hosting
- Placeholder services for screenshots
- Local fallback images

### Browser APIs

**Web APIs Used**
- Service Worker API for offline functionality
- LocalStorage API for data persistence
- Navigator API for online/offline detection
- Cache API for resource caching
- Custom Events for application state management

**Media APIs**
- YouTube IFrame API (embedded player)
- HTML5 audio/video capabilities through iframe

### Development & Deployment

**No Build System**
- Pure HTML/CSS/JavaScript without bundlers
- Direct file serving
- Manual cache versioning in service worker

**Hosting Platform**
- GitHub Pages deployment (mbiboss.github.io/Golpo/)
- Static file hosting approach
- CDN for external resources

### Performance Considerations

**Caching Strategy**
- Aggressive caching of static assets
- Versioned cache names for updates
- Selective story caching (user-initiated)
- Cache cleanup on service worker activation

**Loading Optimizations**
- Font preconnection
- Lazy loading patterns (implied by structure)
- Asset fallback mechanisms
- Minimal external dependencies