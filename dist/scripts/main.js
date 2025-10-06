"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gsap_1 = require("gsap");
const ScrollTrigger_1 = require("gsap/ScrollTrigger");
class FireflyCanvas {
    constructor() {
        this.fireflies = [];
        this.mouse = { x: 0, y: 0, radius: 100 };
        this.animate = () => {
            this.updateFireflies();
            this.drawFireflies();
            requestAnimationFrame(this.animate);
        };
        this.canvas = document.getElementById('fireflyCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
        this.animate();
    }
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        // Create fireflies
        for (let i = 0; i < 25; i++) {
            this.fireflies.push(this.createFirefly());
        }
    }
    createFirefly() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 1,
            alpha: Math.random(),
            targetAlpha: Math.random(),
            twinkleSpeed: Math.random() * 0.05 + 0.02
        };
    }
    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    updateFireflies() {
        this.fireflies.forEach(firefly => {
            // Twinkle effect
            firefly.alpha += (firefly.targetAlpha - firefly.alpha) * firefly.twinkleSpeed;
            if (Math.abs(firefly.alpha - firefly.targetAlpha) < 0.01) {
                firefly.targetAlpha = Math.random();
            }
            // Mouse interaction
            const dx = firefly.x - this.mouse.x;
            const dy = firefly.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.mouse.radius) {
                const angle = Math.atan2(dy, dx);
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                firefly.vx += Math.cos(angle) * force * 0.1;
                firefly.vy += Math.sin(angle) * force * 0.1;
            }
            // Update position with damping
            firefly.vx *= 0.98;
            firefly.vy *= 0.98;
            firefly.x += firefly.vx;
            firefly.y += firefly.vy;
            // Boundary check
            if (firefly.x < 0 || firefly.x > this.canvas.width)
                firefly.vx *= -1;
            if (firefly.y < 0 || firefly.y > this.canvas.height)
                firefly.vy *= -1;
        });
    }
    drawFireflies() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireflies.forEach(firefly => {
            this.ctx.beginPath();
            this.ctx.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);
            // Create gradient for glow effect
            const gradient = this.ctx.createRadialGradient(firefly.x, firefly.y, 0, firefly.x, firefly.y, firefly.radius * 3);
            gradient.addColorStop(0, `rgba(255, 213, 128, ${firefly.alpha})`);
            gradient.addColorStop(1, 'rgba(255, 213, 128, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }
}
// GSAP Animations and Scroll Triggers
class ScrollAnimations {
    constructor() {
        this.initAnimations();
    }
    initAnimations() {
        // Register ScrollTrigger plugin
        gsap_1.gsap.registerPlugin(ScrollTrigger_1.ScrollTrigger);
        // Hero section entrance animation
        gsap_1.gsap.to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: 'power2.out'
        });
        gsap_1.gsap.to('.cta-button', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 0.5,
            ease: 'power2.out'
        });
        // About section scroll animation
        gsap_1.gsap.from('.about-text', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            x: -100,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out'
        });
        gsap_1.gsap.from('.portrait', {
            scrollTrigger: {
                trigger: '.about',
                start: 'top 80%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse'
            },
            x: 100,
            opacity: 0,
            duration: 1.2,
            ease: 'power2.out'
        });
        // Gallery items stagger animation
        gsap_1.gsap.from('.gallery-item', {
            scrollTrigger: {
                trigger: '.gallery',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 100,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: 'power2.out'
        });
        // Philosophy text lines animation
        gsap_1.gsap.utils.toArray('.philosophy-line').forEach((line) => {
            gsap_1.gsap.from(line, {
                scrollTrigger: {
                    trigger: line,
                    start: 'top 90%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power2.out'
            });
        });
        // Contact form animation
        gsap_1.gsap.from('.contact-form', {
            scrollTrigger: {
                trigger: '.contact',
                start: 'top 80%',
                toggleActions: 'play none none reverse'
            },
            y: 50,
            opacity: 0,
            duration: 1,
            ease: 'power2.out'
        });
    }
}
// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FireflyCanvas();
    new ScrollAnimations();
});
