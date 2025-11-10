
/* =====================================================
   OPTIMIZED ANIMATIONS - Lightweight CSS-based
   No heavy libraries required (no Three.js, GSAP, etc.)
   ===================================================== */

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initStartupScreen();
    initScrollAnimations();
    initCardHoverEffects();
    initCursorEffects();
    console.log('✨ Advanced animations initialized successfully!');
});

// Startup screen animation
function initStartupScreen() {
    const startupScreen = document.getElementById('startupScreen');
    if (!startupScreen) return;

    // Wait for page to fully load
    window.addEventListener('load', () => {
        // Delay slightly to show the startup screen
        setTimeout(() => {
            startupScreen.classList.add('fade-out');
            
            // Remove from DOM after fade animation completes
            setTimeout(() => {
                startupScreen.style.display = 'none';
            }, 800); // Match the CSS transition duration
        }, 1500); // Show startup screen for 1.5 seconds
    });
}

// Lightweight scroll-based reveal animations using IntersectionObserver
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                // Optional: unobserve after revealing to improve performance
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe story cards
    document.querySelectorAll('.story-card').forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.1}s`;
        card.classList.add('reveal');
        observer.observe(card);
    });

    // Observe other reveal elements
    document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-scale').forEach(el => {
        observer.observe(el);
    });
}

// Simple 3D card tilt effects using CSS transforms
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.story-card');
    
    cards.forEach(card => {
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

// Lightweight cursor trail effect
let cursorTrails = [];
const maxTrails = 5; // Reduced for better performance

document.addEventListener('mousemove', (e) => {
    if (cursorTrails.length >= maxTrails) {
        const oldTrail = cursorTrails.shift();
        if (oldTrail && oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail);
        }
    }

    const trail = document.createElement('div');
    trail.className = 'cursor-particle';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    
    const tx = (Math.random() - 0.5) * 30;
    const ty = (Math.random() - 0.5) * 30;
    trail.style.setProperty('--tx', tx + 'px');
    trail.style.setProperty('--ty', ty + 'px');
    
    document.body.appendChild(trail);
    cursorTrails.push(trail);
    
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
        cursorTrails = cursorTrails.filter(t => t !== trail);
    }, 600);
});

// Pause animations when tab is hidden (performance optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});

// Lightweight cursor effects
function initCursorEffects() {
    // Add subtle glow effect on interactive elements
    const interactiveElements = document.querySelectorAll('a, button, .story-card, .control-btn');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.2s ease';
        });
    });
}
