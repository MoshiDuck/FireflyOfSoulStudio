// ==================== 3. Todo : app/components/FireflyCanvas.tsx (NOUVEAU) ====================
import { useEffect, useRef } from "react";

interface Firefly {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    fadeDirection: number;
    glowSize: number;
}

export function FireflyCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        const fireflies: Firefly[] = [];
        const fireflyCount = window.innerWidth < 768 ? 15 : 30;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        for (let i = 0; i < fireflyCount; i++) {
            fireflies.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                fadeDirection: Math.random() > 0.5 ? 1 : -1,
                glowSize: Math.random() * 20 + 10,
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            fireflies.forEach((firefly) => {
                firefly.x += firefly.vx;
                firefly.y += firefly.vy;

                firefly.opacity += firefly.fadeDirection * 0.01;
                if (firefly.opacity >= 0.8 || firefly.opacity <= 0.3) {
                    firefly.fadeDirection *= -1;
                }

                if (firefly.x < 0 || firefly.x > canvas.width) firefly.vx *= -1;
                if (firefly.y < 0 || firefly.y > canvas.height) firefly.vy *= -1;

                const gradient = ctx.createRadialGradient(
                    firefly.x,
                    firefly.y,
                    0,
                    firefly.x,
                    firefly.y,
                    firefly.glowSize
                );
                gradient.addColorStop(0, `rgba(245, 158, 11, ${firefly.opacity})`);
                gradient.addColorStop(
                    0.5,
                    `rgba(245, 158, 11, ${firefly.opacity * 0.3})`
                );
                gradient.addColorStop(1, "rgba(245, 158, 11, 0)");

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(firefly.x, firefly.y, firefly.glowSize, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = `rgba(255, 215, 0, ${firefly.opacity})`;
                ctx.beginPath();
                ctx.arc(firefly.x, firefly.y, firefly.size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ mixBlendMode: "screen" }}
        />
    );
}
