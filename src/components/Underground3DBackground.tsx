import React, { useEffect, useRef } from 'react';

interface Vec3 { x: number; y: number; z: number; }

const Underground3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = { x: 0, y: 0, ix: 0, iy: 0 };

    const project = (p: Vec3, w: number, h: number): { x: number; y: number; s: number } => {
      const fov = 400;
      const sx = p.x / p.z * fov + w / 2;
      const sy = -p.y / p.z * fov + h / 2;
      const s = fov / p.z;
      return { x: sx, y: sy, s };
    };

    class FloatingWord {
      text: string;
      pos: Vec3;
      targetPos: Vec3;
      vx: number; vy: number; vz: number;
      scale: number;
      hue: number;
      phase: number;
      font: string;

      constructor(text: string, baseX: number, baseY: number, baseZ: number, scale: number, hue: number) {
        this.text = text;
        this.pos = { x: baseX, y: baseY, z: baseZ };
        this.targetPos = { x: baseX + (Math.random() - 0.5) * 100, y: baseY + (Math.random() - 0.5) * 50, z: baseZ };
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.1;
        this.vz = (Math.random() - 0.5) * 0.1;
        this.scale = scale;
        this.hue = hue;
        this.phase = Math.random() * Math.PI * 2;
        this.font = `800 ${Math.round(48 * scale)}px Inter, Manrope, sans-serif`;
      }

      update() {
        this.phase += 0.008;
        const driftX = Math.sin(this.phase * 0.7) * 30;
        const driftY = Math.sin(this.phase * 0.5 + 1) * 15;
        this.pos.x += (this.targetPos.x + driftX - this.pos.x) * 0.005 + (mouse.ix - this.pos.x) * 0.00005;
        this.pos.y += (this.targetPos.y + driftY - this.pos.y) * 0.005 + (mouse.iy - this.pos.y) * 0.00005;
        this.pos.z += (this.targetPos.z - this.pos.z) * 0.003;
      }

      draw(c: CanvasRenderingContext2D, w: number, h: number) {
        const { x, y, s } = project(this.pos, w, h);
        if (s <= 0 || s > 5) return;
        const alpha = Math.min(0.25, Math.max(0.04, s * 0.12));
        const glow = 0.5 + 0.5 * Math.sin(this.phase);

        c.save();
        c.translate(x, y);
        c.scale(s, s);

        const fontSize = Math.round(48 * this.scale);
        c.font = `800 ${fontSize}px Inter, Manrope, sans-serif`;
        c.textAlign = 'center';
        c.textBaseline = 'middle';

        // Text glow layers
        c.shadowColor = `hsla(${this.hue}, 100%, 60%, ${0.25 * glow * alpha})`;
        c.shadowBlur = fontSize * 0.5;
        c.fillStyle = `hsla(${this.hue}, 100%, 90%, ${0.22 * alpha})`;
        c.fillText(this.text, 0, 0);

        // Bright core
        c.shadowBlur = 0;
        const grad = c.createLinearGradient(-fontSize * 2.5, 0, fontSize * 2.5, 0);
        grad.addColorStop(0, `hsla(${this.hue - 20}, 100%, 95%, ${0.28 * alpha})`);
        grad.addColorStop(0.5, `hsla(${this.hue + 10}, 100%, 100%, ${0.32 * alpha})`);
        grad.addColorStop(1, `hsla(${this.hue + 30}, 100%, 90%, ${0.28 * alpha})`);
        c.fillStyle = grad;
        c.fillText(this.text, 0, 0);

        c.restore();
      }
    }

    class GridLine {
      z: number;
      constructor(z: number) { this.z = z; }
    }

    let words3d: FloatingWord[] = [];
    let gridLines: GridLine[] = [];
    let particles: { pos: Vec3; vx: number; vy: number; vz: number; size: number }[] = [];

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      words3d = [
        new FloatingWord('HARITECH', 0, -40, 650, 1.0, 190),
        new FloatingWord('EXCLUSIVE', -220, -90, 800, 0.55, 220),
        new FloatingWord('BUSINESS', 220, -90, 800, 0.55, 160),
      ];

      gridLines = [];
      for (let z = 50; z < 1200; z += 60) gridLines.push(new GridLine(z));

      particles = Array.from({ length: 80 }, () => ({
        pos: { x: (Math.random() - 0.5) * 1200, y: (Math.random() - 0.5) * 600, z: 50 + Math.random() * 1000 },
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.15,
        vz: Math.random() * 0.5 + 0.1,
        size: 1 + Math.random() * 2,
      }));
    };

    const drawGrid = (c: CanvasRenderingContext2D, w: number, h: number) => {
      const lineCount = 12;
      const lineSpread = 600;
      const time = Date.now() * 0.0005;

      for (const gl of gridLines) {
        const pz = gl.z - ((Date.now() * 0.02) % 1200);
        if (pz < 30) continue;
        const alpha = Math.max(0, Math.min(1, (pz - 30) / 400));
        c.strokeStyle = `rgba(6, 182, 212, ${0.05 * alpha})`;
        c.lineWidth = 0.5;
        for (let i = -lineCount; i <= lineCount; i++) {
          const p1 = project({ x: -lineSpread, y: i * 50, z: pz }, w, h);
          const p2 = project({ x: lineSpread, y: i * 50, z: pz }, w, h);
          if (p1.s > 0 && p2.s > 0) { c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke(); }
        }
        for (let i = -lineCount; i <= lineCount; i++) {
          const p1 = project({ x: i * 50, y: -lineSpread * 0.3, z: pz }, w, h);
          const p2 = project({ x: i * 50, y: lineSpread * 0.3, z: pz }, w, h);
          if (p1.s > 0 && p2.s > 0) { c.beginPath(); c.moveTo(p1.x, p1.y); c.lineTo(p2.x, p2.y); c.stroke(); }
        }
      }

      for (let i = 0; i < 120; i++) {
        const t = i / 120;
        const p = project({ x: (t - 0.5) * 1000, y: 0, z: 60 }, w, h);
        const a = 0.06 * (1 - Math.abs(t - 0.5) * 2) * (0.5 + 0.5 * Math.sin(time + t * 10));
        c.fillStyle = `rgba(6, 182, 212, ${a})`;
        c.fillRect(p.x, p.y - 0.5, 2, 1);
      }
    };

    const drawParticles = (c: CanvasRenderingContext2D, w: number, h: number) => {
      particles.forEach(p => {
        p.pos.x += p.vx + (mouse.ix - p.pos.x) * 0.00005;
        p.pos.y += p.vy + (mouse.iy - p.pos.y) * 0.00005;
        p.pos.z -= p.vz;
        if (p.pos.z < 15) {
          p.pos.z = 800 + Math.random() * 400;
          p.pos.x = (Math.random() - 0.5) * 1200;
          p.pos.y = (Math.random() - 0.5) * 600;
        }
        const { x, y, s } = project(p.pos, w, h);
        if (s <= 0) return;
        const alpha = Math.min(1, Math.max(0, (p.pos.z - 15) / 500));
        c.fillStyle = `rgba(139, 92, 246, ${0.25 * alpha * s})`;
        c.beginPath();
        c.arc(x, y, p.size * s, 0, Math.PI * 2);
        c.fill();
      });
    };

    const animId = { current: 0 };
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      drawGrid(ctx, w, h);
      drawParticles(ctx, w, h);

      words3d.sort((a, b) => b.pos.z - a.pos.z);
      words3d.forEach(fw => { fw.update(); fw.draw(ctx, w, h); });

      animId.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouse = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      mouse.x = (e.clientX - w / 2) * 0.3;
      mouse.y = (e.clientY - h / 2) * 0.3;
      mouse.ix = (e.clientX - w / 2);
      mouse.iy = (e.clientY - h / 2);
    };

    init();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouse);

    return () => {
      cancelAnimationFrame(animId.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.35 }}
    />
  );
};

export default Underground3DBackground;