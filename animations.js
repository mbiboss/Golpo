/* =====================================================
   OPTIMIZED ANIMATIONS - Lightweight CSS-based
   No heavy libraries required (no Three.js, GSAP, etc.)
   ===================================================== */

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCardHoverEffects();
    initCursorEffects();
    console.log('✨ Advanced animations initialized successfully!');
});

// Global IntersectionObserver for scroll animations
let scrollAnimationObserver = null;

// Lightweight scroll-based reveal animations using IntersectionObserver
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

    // Observe story cards (only observe elements that don't already have 'revealed' class)
    document.querySelectorAll('.story-card').forEach((card, i) => {
        if (!card.classList.contains('revealed') && !card.classList.contains('reveal')) {
            card.style.transitionDelay = `${i * 0.1}s`;
            card.classList.add('reveal');
            scrollAnimationObserver.observe(card);
        }
    });

    // Observe other reveal elements
    document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-scale').forEach(el => {
        if (!el.classList.contains('revealed')) {
            scrollAnimationObserver.observe(el);
        }
    });
}

// Make initScrollAnimations available globally for re-initialization
window.initScrollAnimations = initScrollAnimations;

// Simple 3D card tilt effects using CSS transforms
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

// Make initCardHoverEffects available globally for re-initialization
window.initCardHoverEffects = initCardHoverEffects;

// Lightweight cursor trail effect
let cursorTrails = [];
const maxTrails = 5; // Reduced for better performance
const particlePool = [];
const maxPoolSize = 10; // Max particles to keep in the pool

document.addEventListener('mousemove', (e) => {
    let particle;
    if (particlePool.length > 0) {
        particle = particlePool.shift(); // Reuse existing particle
    } else {
        particle = document.createElement('div');
        particle.className = 'cursor-particle';
    }

    particle.style.left = e.pageX + 'px';
    particle.style.top = e.pageY + 'px';

    // Randomize transform for variation
    const tx = (Math.random() - 0.5) * 30;
    const ty = (Math.random() - 0.5) * 30;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');

    document.body.appendChild(particle);

    // Remove after animation and return to pool
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            if (particlePool.length < maxPoolSize) {
                particlePool.push(particle);
            }
        }
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