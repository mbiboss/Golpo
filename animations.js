document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initCardHoverEffects();
    initCursorEffects();
    console.log('✨ Advanced animations initialized successfully!');
});

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

let cursorTrails = [];
const maxTrails = 5;
const particlePool = [];
const maxPoolSize = 10;

document.addEventListener('mousemove', (e) => {
    let particle;
    if (particlePool.length > 0) {
        particle = particlePool.shift();
    } else {
        particle = document.createElement('div');
        particle.className = 'cursor-particle';
    }

    particle.style.left = e.pageX + 'px';
    particle.style.top = e.pageY + 'px';

    const tx = (Math.random() - 0.5) * 30;
    const ty = (Math.random() - 0.5) * 30;
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.setProperty('--ty', ty + 'px');

    document.body.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            if (particlePool.length < maxPoolSize) {
                particlePool.push(particle);
            }
        }
    }, 600);
});

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});

function initCursorEffects() {
    const interactiveElements = document.querySelectorAll('a, button, .story-card, .control-btn');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transition = 'transform 0.2s ease';
        });
    });
}