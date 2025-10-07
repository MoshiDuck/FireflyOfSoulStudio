// Todo : src/scripts/main.ts
declare const gsap: any;
declare const ScrollTrigger: any;

// Firefly Particle System
interface Firefly {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    alpha: number;
    targetAlpha: number;
    twinkleSpeed: number;
}

class FireflyCanvas {
    private canvas!: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D | null = null;
    private fireflies: Firefly[] = [];
    private mouse = { x: 0, y: 0, radius: 100 };
    private isInitialized: boolean = false;

    constructor() {
        const canvasElement = document.getElementById('fireflyCanvas') as HTMLCanvasElement;
        if (!canvasElement) {
            console.error('❌ Canvas element not found');
            return;
        }

        this.canvas = canvasElement;
        const context = this.canvas.getContext('2d');

        if (!context) {
            console.error('❌ Canvas context not available');
            return;
        }

        this.ctx = context;
        this.isInitialized = true;
        this.init();
        this.animate();
        console.log('✅ FireflyCanvas initialized');
    }

    private init(): void {
        if (!this.isInitialized) return;

        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Create fireflies
        for (let i = 0; i < 25; i++) {
            this.fireflies.push(this.createFirefly());
        }
    }

    private createFirefly(): Firefly {
        if (!this.isInitialized) {
            return {
                x: 0, y: 0, vx: 0, vy: 0, radius: 0, alpha: 0, targetAlpha: 0, twinkleSpeed: 0
            };
        }

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

    private onMouseMove(e: MouseEvent): void {
        if (!this.isInitialized) return;

        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
    }

    private resize(): void {
        if (!this.isInitialized) return;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private updateFireflies(): void {
        if (!this.isInitialized) return;

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
            if (firefly.x < 0 || firefly.x > this.canvas.width) firefly.vx *= -1;
            if (firefly.y < 0 || firefly.y > this.canvas.height) firefly.vy *= -1;
        });
    }

    private drawFireflies(): void {
        // Check if context exists before proceeding
        if (!this.ctx || !this.isInitialized) {
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.fireflies.forEach(firefly => {
            this.ctx!.beginPath();
            this.ctx!.arc(firefly.x, firefly.y, firefly.radius, 0, Math.PI * 2);

            // Create gradient for glow effect
            const gradient = this.ctx!.createRadialGradient(
                firefly.x, firefly.y, 0,
                firefly.x, firefly.y, firefly.radius * 3
            );
            gradient.addColorStop(0, `rgba(255, 213, 128, ${firefly.alpha})`);
            gradient.addColorStop(1, 'rgba(255, 213, 128, 0)');

            this.ctx!.fillStyle = gradient;
            this.ctx!.fill();
        });
    }

    private animate = (): void => {
        if (!this.isInitialized) return;

        this.updateFireflies();
        this.drawFireflies();
        requestAnimationFrame(this.animate);
    };
}

// Test simple des lucioles
function testFireflies() {
    const canvas = document.getElementById('fireflyCanvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('❌ Canvas not found for test');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Dessiner un cercle de test
        ctx.fillStyle = 'rgba(255, 213, 128, 0.8)';
        ctx.beginPath();
        ctx.arc(100, 100, 5, 0, Math.PI * 2);
        ctx.fill();
        console.log('✅ Test lucioles réussi');
    }
}

// GSAP Animations and Scroll Triggers
class ScrollAnimations {
    constructor() {
        console.log('🚀 Initializing ScrollAnimations');
        this.initAnimations();
    }

    private initAnimations(): void {
        // 🔥 Vérifier que GSAP est disponible
        if (typeof gsap === 'undefined') {
            console.error('❌ GSAP not loaded');
            return;
        }

        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
            console.log('✅ ScrollTrigger registered');
        }

        // 🔥 CORRECTION: Préparer les éléments avant animation
        // Cacher les éléments initialement pour l'animation
        gsap.set('.hero-title', { opacity: 0, y: 50 });
        gsap.set('.cta-button', { opacity: 0, y: 30 });
        gsap.set('.philosophy-line', { opacity: 0, y: 30 });

        console.log('✅ Elements prepared for animation');

        // Hero section entrance animation
        gsap.to('.hero-title', {
            opacity: 1,
            y: 0,
            duration: 1.5,
            delay: 0.5,
            ease: 'power2.out',
            onComplete: () => console.log('✅ Hero title animation complete')
        });

        gsap.to('.cta-button', {
            opacity: 1,
            y: 0,
            duration: 1,
            delay: 1,
            ease: 'power2.out',
            onComplete: () => console.log('✅ CTA button animation complete')
        });

        // About section scroll animation
        gsap.from('.about-text', {
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

        gsap.from('.portrait', {
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
        gsap.from('.gallery-item', {
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
        const philosophyLines = gsap.utils.toArray('.philosophy-line');
        philosophyLines.forEach((line: any, index: number) => {
            gsap.from(line, {
                scrollTrigger: {
                    trigger: line,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 1,
                delay: index * 0.2,
                ease: 'power2.out'
            });
        });

        // Contact form animation
        gsap.from('.contact-form', {
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

        console.log('✅ All animations configured');
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded - initializing Firefly of Soul Studio');

    try {
        // 🔥 Test initial des lucioles
        testFireflies();

        // 🔥 Initialiser GSAP d'abord
        if (typeof gsap !== 'undefined') {
            console.log('✅ GSAP loaded successfully');

            if (typeof ScrollTrigger !== 'undefined') {
                gsap.registerPlugin(ScrollTrigger);
                console.log('✅ ScrollTrigger registered');
            } else {
                console.warn('⚠️ ScrollTrigger not available');
            }
        } else {
            console.error('❌ GSAP not loaded - check CDN');
            // Fallback: make elements visible even without GSAP
            document.querySelectorAll('.hero-title, .cta-button').forEach(el => {
                (el as HTMLElement).style.opacity = '1';
                (el as HTMLElement).style.transform = 'translateY(0)';
            });
        }

        // 🔥 Initialiser le système de lucioles
        const fireflyCanvas = new FireflyCanvas();
        if (fireflyCanvas) {
            console.log('✅ Firefly system initialized');
        }

        // 🔥 Initialiser les animations de scroll
        const scrollAnimations = new ScrollAnimations();
        if (scrollAnimations) {
            console.log('✅ Scroll animations initialized');
        }

        console.log('🎉 Firefly of Soul Studio fully initialized');

    } catch (error) {
        console.error('💥 Error during initialization:', error);

        // Fallback en cas d'erreur
        document.querySelectorAll('.hero-title, .cta-button').forEach(el => {
            (el as HTMLElement).style.opacity = '1';
            (el as HTMLElement).style.transform = 'translateY(0)';
        });
    }
});

// Fallback pour les vieux navigateurs ou si GSAP échoue
window.addEventListener('load', () => {
    // S'assurer que le contenu est visible même si les animations échouent
    setTimeout(() => {
        const heroTitle = document.querySelector('.hero-title') as HTMLElement;
        const ctaButton = document.querySelector('.cta-button') as HTMLElement;

        if (heroTitle && heroTitle.style.opacity === '0') {
            heroTitle.style.opacity = '1';
            heroTitle.style.transform = 'translateY(0)';
        }

        if (ctaButton && ctaButton.style.opacity === '0') {
            ctaButton.style.opacity = '1';
            ctaButton.style.transform = 'translateY(0)';
        }
    }, 3000); // Après 3 secondes, forcer la visibilité
});