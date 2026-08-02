import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
const ParticleBackground = () => {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        let animationFrameId;
        let particles = [];
        const mouse = { x: 0, y: 0, radius: 150, active: false };
        class Particle {
            constructor(w, h) {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 1;
                // Cycle between cyan, purple and blue tones
                const colors = [
                    'rgba(6, 182, 212, 0.3)', // Cyan
                    'rgba(59, 130, 246, 0.3)', // Blue
                    'rgba(139, 92, 246, 0.3)', // Purple
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update(w, h) {
                this.x += this.vx;
                this.y += this.vy;
                // Bounce back from edges
                if (this.x < 0 || this.x > w)
                    this.vx *= -1;
                if (this.y < 0 || this.y > h)
                    this.vy *= -1;
                // Mouse interaction (repelling effect)
                if (mouse.active) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x += Math.cos(angle) * force * 1.5;
                        this.y += Math.sin(angle) * force * 1.5;
                    }
                }
            }
            draw(c) {
                c.beginPath();
                c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                c.fillStyle = this.color;
                c.fill();
            }
        }
        const init = () => {
            const w = (canvas.width = window.innerWidth);
            const h = (canvas.height = window.innerHeight);
            particles = [];
            // Dynamic count based on screen size
            const count = Math.min(Math.floor((w * h) / 12000), 120);
            for (let i = 0; i < count; i++) {
                particles.push(new Particle(w, h));
            }
        };
        const drawLines = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 110) {
                        const alpha = (110 - dist) / 110 * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }
            }
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const w = canvas.width;
            const h = canvas.height;
            particles.forEach((p) => {
                p.update(w, h);
                p.draw(ctx);
            });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };
        const handleResize = () => {
            init();
        };
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            mouse.active = true;
        };
        const handleMouseLeave = () => {
            mouse.active = false;
        };
        init();
        animate();
        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);
    return (_jsx("canvas", { ref: canvasRef, className: "absolute inset-0 pointer-events-none z-0", style: { mixBlendMode: 'screen' } }));
};
export default ParticleBackground;
