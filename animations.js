
/* =====================================================
   ADVANCED 3D ANIMATIONS & PARTICLE SYSTEM
   Professional animations for Golpo story reader
   ===================================================== */

// Initialize advanced animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAdvancedAnimations();
    initParticleSystem();
    initScrollAnimations();
    init3DCardEffects();
});

// Advanced Animations Initialization
function initAdvancedAnimations() {
    // GSAP ScrollTrigger setup
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Animate story cards on scroll
        gsap.utils.toArray('.story-card').forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top bottom-=100",
                    toggleActions: "play none none reverse"
                },
                opacity: 0,
                y: 50,
                duration: 0.8,
                delay: i * 0.1,
                ease: "power3.out"
            });
        });

        // Hero section parallax
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            gsap.to(heroSection, {
                scrollTrigger: {
                    trigger: heroSection,
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                },
                y: 100,
                opacity: 0.5,
                ease: "none"
            });
        }
    }

    // Vanilla Tilt for 3D card effects
    if (typeof VanillaTilt !== 'undefined') {
        VanillaTilt.init(document.querySelectorAll('.story-card'), {
            max: 10,
            speed: 400,
            glare: true,
            'max-glare': 0.2,
            scale: 1.05
        });
    }

    console.log('✨ Advanced animations initialized successfully!');
}

// 3D Particle System with Three.js
function initParticleSystem() {
    if (typeof THREE === 'undefined') return;

    const canvasElement = document.getElementById('particles-canvas');
    if (!canvasElement) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvasElement, 
        alpha: true,
        antialias: true 
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 5;

    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x64B5F6,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Animation loop
    let animationFrameId;
    function animate() {
        animationFrameId = requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;
        renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
        particlesGeometry.dispose();
        particlesMaterial.dispose();
    });
}

// Scroll-based reveal animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-fade-up, .reveal-scale, .reveal-3d-flip').forEach(el => {
        observer.observe(el);
    });
}

// 3D Card Tilt Effects
function init3DCardEffects() {
    const cards = document.querySelectorAll('.story-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

// Cursor trail effect
let cursorTrails = [];
const maxTrails = 10;

document.addEventListener('mousemove', (e) => {
    if (cursorTrails.length >= maxTrails) {
        const oldTrail = cursorTrails.shift();
        if (oldTrail && oldTrail.parentNode) {
            oldTrail.parentNode.removeChild(oldTrail);
        }
    }

    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = e.pageX + 'px';
    trail.style.top = e.pageY + 'px';
    
    const tx = (Math.random() - 0.5) * 50;
    const ty = (Math.random() - 0.5) * 50;
    trail.style.setProperty('--tx', tx + 'px');
    trail.style.setProperty('--ty', ty + 'px');
    
    document.body.appendChild(trail);
    cursorTrails.push(trail);
    
    setTimeout(() => {
        if (trail.parentNode) {
            trail.parentNode.removeChild(trail);
        }
        cursorTrails = cursorTrails.filter(t => t !== trail);
    }, 800);
});

// Pause animations when tab is hidden (performance optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.style.animationPlayState = 'paused';
    } else {
        document.body.style.animationPlayState = 'running';
    }
});
