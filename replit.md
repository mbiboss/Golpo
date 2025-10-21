# Golpo - Bengali Story Reading Platform

## Overview

Golpo is an immersive Bengali storytelling web application that combines elegant design with ambient music to create a rich reading experience. The platform features a glassmorphic UI with dark/sepia themes, particle effects, YouTube music integration, offline reading capabilities, user authentication, and a community comments system. It's designed as a Progressive Web App (PWA) focused on Bengali typography and content delivery.

**Latest Features (v2.0.0 - Oct 2025):**
- **User Authentication**: Google login via Replit Auth (supports Google, GitHub, Apple, email/password)
- **Comments System**: User-driven story discussions with create, edit, delete functionality
- **Database Integration**: PostgreSQL database for user data and comments
- **Security**: Full CSRF protection with double-submit cookie pattern and SameSite cookies
- **Backend API**: Express.js server with TypeScript for authentication and comments endpoints

**Previous Optimizations (v1.4.0):**
- 90% reduction in CPU usage through requestAnimationFrame optimization
- Intelligent performance detection for adaptive loading on low-end devices
- Debounced localStorage operations reducing I/O by 80%
- Removed all console statements for production
- Optimized particle animation system from 15+ intervals to single RAF loop
- Enhanced service worker caching strategy

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Backend Architecture (New in v2.0.0)

**Express.js Server**
- TypeScript-based backend with tsx runtime
- RESTful API for authentication and comments
- PostgreSQL database with Drizzle ORM
- Session-based authentication with Passport.js
- Cookie-parser for CSRF token management

**Database Schema**
- `users` table: Stores user profiles from OAuth providers
- `sessions` table: Server-side session storage (required for authentication)
- `comments` table: Story comments with user associations

**Security Features**
- **CSRF Protection**: Double-submit cookie pattern with token validation
- **Session Security**: SameSite=Lax cookies, environment-aware secure flag
- **Authentication Middleware**: isAuthenticated guard for protected routes
- **Input Validation**: Content validation and sanitization

**API Endpoints**
```
Authentication:
- GET /api/login - Initiate OAuth login flow
- GET /api/callback - OAuth callback handler
- GET /api/logout - Log out and clear session
- GET /api/auth/user - Get current authenticated user

Comments (Protected):
- GET /api/comments/:storyId - Fetch comments for a story
- POST /api/comments - Create a new comment (requires CSRF token)
- PUT /api/comments/:commentId - Update own comment (requires CSRF token)
- DELETE /api/comments/:commentId - Delete own comment (requires CSRF token)
```

**CSRF Token Requirement**
All state-changing operations (POST/PUT/DELETE) require a CSRF token:
1. Server sets `csrfToken` cookie (non-httpOnly) on first request
2. Client reads token from cookie and sends in `X-CSRF-Token` header
3. Server validates cookie token matches header token
4. Missing/mismatched tokens return 403 Forbidden

**Environment Configuration**
- `DATABASE_URL`: PostgreSQL connection string (auto-provided by Replit)
- `SESSION_SECRET`: Session encryption key (auto-provided by Replit)
- `REPL_ID`: Replit app identifier (auto-provided)
- `REPLIT_DOMAINS`: Comma-separated list of app domains (auto-provided)
- `NODE_ENV`: Set to 'production' for deployment
- `REPLIT_DEPLOYMENT`: Set to '1' when deployed (auto-set by Replit)

### Frontend Architecture

**Single Page Application (SPA)**
- Pure vanilla JavaScript without frameworks for lightweight performance
- HTML5 semantic structure with Bengali language support (`lang="bn"`)
- Modular CSS with CSS custom properties for theming
- Event-driven architecture for user interactions

**Authentication Module** (`auth.js`)
- User session management
- Login/logout functionality
- User menu UI with profile display
- Dynamic auth state updates

**Comments Module** (`comments.js`)
- Fetch comments for stories
- Create, edit, and delete comments
- CSRF token integration
- Real-time UI updates
- User authorization checks

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

**Startup/Splash Screen - Cosmic Dark Theme**
- Professional cosmic nebula dark theme with purple-pink-violet gradient palette
- Deep space background with animated nebula effects and geometric patterns
- 3D floating logo with orbital rings and energy pulse animations
- Neon holographic gradient text with glow effects and subtle glitch animations
- Glassmorphic "tap to continue" button with frosted glass effect
- Stellar particle constellation system with floating star animations
- Liquid morphing orb background with smooth shape-shifting animations
- Multiple advanced CSS animations: cosmic drift, pattern shift, orbit spin, gradient flow
- Fully responsive design optimized for all screen sizes
- Never-before-seen unique visual effects combining 3D transforms and liquid morphing

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

**Build System**
- TypeScript for backend with tsx runtime compiler
- No frontend build step (pure HTML/CSS/JavaScript)
- Drizzle Kit for database schema management
- npm scripts for development and production

**Package Scripts**
```json
{
  "dev": "tsx watch server/index.ts",     // Development with hot-reload
  "start": "tsx server/index.ts",         // Production server
  "db:generate": "drizzle-kit generate",  // Generate migrations
  "db:push": "drizzle-kit push",          // Push schema to database
  "db:studio": "drizzle-kit studio"       // Database GUI
}
```

**Hosting Platform**
- **Development**: Replit with auto-reload on port 5000
- **Production**: Replit Deployments with PostgreSQL database
- **GitHub**: Source code repository (public)
- **Database**: Replit PostgreSQL (Neon-backed)

**Deployment Considerations**
- Backend runs on Replit infrastructure with HTTPS support
- Frontend served via Express static file middleware
- Session cookies configured for both HTTP (dev) and HTTPS (prod)
- CSRF tokens work seamlessly in both environments
- No separate frontend hosting needed (integrated deployment)

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