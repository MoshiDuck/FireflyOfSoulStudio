"use strict";
class HomepageManager {
    constructor() {
        this.isTransitioning = false;
        this.enterBtn = document.getElementById('enterBtn');
        this.introSection = document.getElementById('introSection');
        this.titleLines = document.querySelectorAll('.title-line');
        this.taglines = document.querySelectorAll('.tagline p');
        this.init();
    }
    init() {
        console.log('🚀 Initializing Firefly of Soul Homepage');
        this.animateEntrance();
        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => this.handleEnterClick());
        }
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        console.log('✅ HomepageManager initialized');
    }
    animateEntrance() {
        this.titleLines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('animate-in');
            }, 200 + (index * 300));
        });
        this.taglines.forEach((tagline, index) => {
            setTimeout(() => {
                tagline.classList.add('animate-in');
            }, 1400 + (index * 300));
        });
        setTimeout(() => {
            if (this.enterBtn) {
                this.enterBtn.style.opacity = '1';
                this.enterBtn.style.transform = 'translateY(0)';
            }
        }, 2200);
    }
    handleEnterClick() {
        if (this.isTransitioning)
            return;
        this.isTransitioning = true;
        console.log('🎭 Beginning journey transition...');
        const tl = gsap.timeline();
        tl.to('.title-wrapper, .cta-section', {
            opacity: 0,
            y: -50,
            duration: 1,
            ease: 'power2.inOut'
        })
            .to('.minimal-nav', {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out'
        }, '-=0.5')
            .to('.hero-main', {
            opacity: 0,
            duration: 1,
            ease: 'power2.inOut',
            onComplete: () => {
                this.showIntroSection();
            }
        });
    }
    showIntroSection() {
        if (!this.introSection)
            return;
        this.introSection.classList.add('active');
        const tl = gsap.timeline();
        tl.fromTo(this.introSection, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power2.out' })
            .fromTo('.intro-title', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, '-=0.5')
            .fromTo('.intro-text p', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' }, '-=0.3')
            .fromTo('.nav-link', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, '-=0.2')
            .eventCallback('onComplete', () => {
            this.isTransitioning = false;
            console.log('✅ Intro section fully revealed');
        });
    }
    handleKeyboard(e) {
        if ((e.key === 'Enter' || e.key === ' ') && !this.isTransitioning) {
            e.preventDefault();
            this.handleEnterClick();
        }
        if (e.key === 'Escape') {
            this.resetToInitialState();
        }
    }
    resetToInitialState() {
        console.log('🔄 Resetting to initial state');
        this.isTransitioning = false;
        if (this.introSection) {
            this.introSection.classList.remove('active');
        }
        gsap.set(['.title-wrapper', '.cta-section', '.minimal-nav', '.hero-main'], {
            opacity: 1,
            y: 0
        });
        this.animateEntrance();
    }
}
class FireflySystem {
    constructor() {
        this.fireflies = [];
        this.mouse = { x: 0, y: 0, radius: 150 };
        this.animationFrame = 0;
        this.animate = () => {
            this.updateFireflies();
            this.drawFireflies();
            this.animationFrame = requestAnimationFrame(this.animate);
        };
        const canvas = document.getElementById('fireflyCanvas');
        if (!canvas) {
            console.error('❌ Canvas element not found');
            return;
        }
        this.canvas = canvas;
        const context = this.canvas.getContext('2d');
        if (!context) {
            console.error('❌ Canvas context not available');
            return;
        }
        this.ctx = context;
        this.init();
    }
    init() {
        this.resizeCanvas();
        this.createFireflies();
        this.setupEventListeners();
        this.animate();
        console.log('✅ Firefly system initialized with', this.fireflies.length, 'fireflies');
    }
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    createFireflies() {
        const count = Math.min(30, Math.floor(window.innerWidth * window.innerHeight / 20000));
        for (let i = 0; i < count; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 0.5 + 0.2,
                opacity: Math.random() * 0.5 + 0.3,
                targetOpacity: Math.random() * 0.5 + 0.3,
                twinkleSpeed: Math.random() * 0.02 + 0.01,
                angle: Math.random() * Math.PI * 2,
                vx: 0,
                vy: 0
            });
        }
    }
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = -100;
            this.mouse.y = -100;
        });
    }
    updateFireflies() {
        this.fireflies.forEach(firefly => {
            firefly.opacity += (firefly.targetOpacity - firefly.opacity) * firefly.twinkleSpeed;
            if (Math.abs(firefly.opacity - firefly.targetOpacity) < 0.01) {
                firefly.targetOpacity = Math.random() * 0.5 + 0.3;
            }
            const dx = firefly.x - this.mouse.x;
            const dy = firefly.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                firefly.vx += Math.cos(angle) * force * 0.5;
                firefly.vy += Math.sin(angle) * force * 0.5;
            }
            firefly.vx *= 0.95;
            firefly.vy *= 0.95;
            firefly.x += firefly.vx + Math.cos(firefly.angle) * firefly.speed;
            firefly.y += firefly.vy + Math.sin(firefly.angle) * firefly.speed;
            if (firefly.x < 0 || firefly.x > this.canvas.width) {
                firefly.vx *= -0.5;
                firefly.angle = Math.PI - firefly.angle;
            }
            if (firefly.y < 0 || firefly.y > this.canvas.height) {
                firefly.vy *= -0.5;
                firefly.angle = -firefly.angle;
            }
            firefly.x = Math.max(0, Math.min(this.canvas.width, firefly.x));
            firefly.y = Math.max(0, Math.min(this.canvas.height, firefly.y));
        });
    }
    drawFireflies() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireflies.forEach(firefly => {
            const gradient = this.ctx.createRadialGradient(firefly.x, firefly.y, 0, firefly.x, firefly.y, firefly.size * 4);
            gradient.addColorStop(0, `rgba(255, 213, 128, ${firefly.opacity})`);
            gradient.addColorStop(1, 'rgba(255, 213, 128, 0)');
            this.ctx.beginPath();
            this.ctx.arc(firefly.x, firefly.y, firefly.size * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.beginPath();
            this.ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 202, 40, ${firefly.opacity + 0.3})`;
            this.ctx.fill();
        });
    }
    destroy() {
        cancelAnimationFrame(this.animationFrame);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Firefly of Soul Studio - Homepage Loading');
    try {
        if (typeof gsap === 'undefined') {
            console.warn('⚠️ GSAP not loaded, using fallback animations');
            document.querySelectorAll('.title-line, .tagline p, .immersive-btn').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }
        else {
            console.log('✅ GSAP loaded successfully');
        }
        const fireflySystem = new FireflySystem();
        const homepageManager = new HomepageManager();
        console.log('🎉 Homepage fully initialized');
    }
    catch (error) {
        console.error('💥 Error during initialization:', error);
        document.querySelectorAll('.title-line, .tagline p, .immersive-btn').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
});
window.addEventListener('error', (e) => {
    console.error('🚨 Global error:', e.error);
});
//# sourceMappingURL=main.js.map