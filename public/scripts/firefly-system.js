"use strict";
// Optimized firefly system for better performance
class FireflySystem {
    constructor() {
        this.fireflies = [];
        this.mouse = { x: 0, y: 0, radius: 150 };
        this.frameCount = 0;
        this.animate = () => {
            this.frameCount++;
            // Update only every other frame for performance
            if (this.frameCount % 2 === 0) {
                this.update();
            }
            this.draw();
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
        // Create optimized number of fireflies
        for (let i = 0; i < 20; i++) {
            this.fireflies.push(this.createFirefly());
        }
    }
    createFirefly() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.8 + 0.2,
            targetAlpha: Math.random(),
            speed: Math.random() * 0.02 + 0.01
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
    update() {
        this.fireflies.forEach(firefly => {
            // Smooth alpha transition
            firefly.alpha += (firefly.targetAlpha - firefly.alpha) * firefly.speed;
            if (Math.abs(firefly.alpha - firefly.targetAlpha) < 0.05) {
                firefly.targetAlpha = Math.random();
            }
            // Mouse interaction
            const dx = firefly.x - this.mouse.x;
            const dy = firefly.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                firefly.vx += (dx / distance) * force * 0.1;
                firefly.vy += (dy / distance) * force * 0.1;
            }
            // Update position
            firefly.vx *= 0.98;
            firefly.vy *= 0.98;
            firefly.x += firefly.vx;
            firefly.y += firefly.vy;
            // Boundary handling
            if (firefly.x < -10)
                firefly.x = this.canvas.width + 10;
            if (firefly.x > this.canvas.width + 10)
                firefly.x = -10;
            if (firefly.y < -10)
                firefly.y = this.canvas.height + 10;
            if (firefly.y > this.canvas.height + 10)
                firefly.y = -10;
        });
    }
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.fireflies.forEach(firefly => {
            this.ctx.save();
            // Glow effect
            const gradient = this.ctx.createRadialGradient(firefly.x, firefly.y, 0, firefly.x, firefly.y, firefly.size * 3);
            gradient.addColorStop(0, `rgba(255, 213, 128, ${firefly.alpha})`);
            gradient.addColorStop(1, 'rgba(255, 213, 128, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(firefly.x, firefly.y, firefly.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            // Core light
            this.ctx.fillStyle = `rgba(255, 213, 128, ${firefly.alpha * 0.8})`;
            this.ctx.beginPath();
            this.ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
}
