import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

/* ── Ambient3DLayer ──────────────────────────────────────────────────────
   A site-wide ambient 3D depth layer that renders:
   1. Floating geometric orbs with parallax scroll depth
   2. Rotating polygonal prism wireframes
   3. Particle field with depth-blur illusion
   4. Dynamic light beam sweeps

   Usage: Mount once inside HaritechLayout (above all content).
   It is pointer-events-none so it never blocks interactions.          */

interface OrbConfig {
  size: number;
  top: string;
  left: string;
  color: string;
  duration: number;
  delay: number;
  depth: number;   // 0 = foreground, 1 = background (for parallax)
  blur: string;
}

const ORBS: OrbConfig[] = [
  { size: 360, top: '5%',  left: '75%',  color: 'rgba(255,255,255,0.04)',  duration: 10, delay: 0,   depth: 0.8, blur: '70px' },
  { size: 280, top: '22%', left: '5%',   color: 'rgba(148,163,184,0.04)', duration: 12, delay: 1.5, depth: 0.5, blur: '60px' },
  { size: 220, top: '55%', left: '85%',  color: 'rgba(203,213,225,0.03)', duration: 9,  delay: 0.8, depth: 0.3, blur: '50px' },
  { size: 420, top: '70%', left: '20%',  color: 'rgba(255,255,255,0.03)', duration: 15, delay: 2.5, depth: 0.9, blur: '90px' },
  { size: 160, top: '35%', left: '50%',  color: 'rgba(148,163,184,0.03)', duration: 8,  delay: 0.3, depth: 0.2, blur: '40px' },
  { size: 240, top: '90%', left: '60%',  color: 'rgba(226,232,240,0.03)', duration: 11, delay: 3,   depth: 0.7, blur: '65px' },
  { size: 180, top: '15%', left: '40%',  color: 'rgba(255,255,255,0.04)', duration: 10, delay: 1,   depth: 0.4, blur: '45px' },
];

interface ParticleConfig {
  x: string;
  y: string;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

const PARTICLES: ParticleConfig[] = Array.from({ length: 30 }, (_, i) => ({
  x:        `${(i * 37 + 11) % 100}%`,
  y:        `${(i * 53 + 7) % 100}%`,
  size:     1 + (i % 2),
  color:    ['rgba(255,255,255,0.5)', 'rgba(203,213,225,0.4)', 'rgba(148,163,184,0.3)', 'rgba(255,255,255,0.6)'][i % 4],
  duration: 4 + (i % 4),
  delay:    (i * 0.3) % 4,
}));

/* Small rotating hexagon wireframe */
const HexWireframe: React.FC<{ x: string; y: string; size: number; color: string; duration: number; delay: number }> = (
  { x, y, size, color, duration, delay }
) => {
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${(size / 2 + (size / 2) * Math.cos(angle)).toFixed(1)},${(size / 2 + (size / 2) * Math.sin(angle)).toFixed(1)}`;
  }).join(' ');

  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width: size, height: size }}
      animate={{ rotate: [0, 360], scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <polygon points={pts} stroke={color} strokeWidth="1" fill="none" opacity="0.6" />
        {/* Inner hex */}
        <polygon
          points={Array.from({ length: 6 }, (_, i) => {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            const r = size * 0.28;
            return `${(size / 2 + r * Math.cos(a)).toFixed(1)},${(size / 2 + r * Math.sin(a)).toFixed(1)}`;
          }).join(' ')}
          stroke={color}
          strokeWidth="0.5"
          fill="none"
          opacity="0.35"
        />
        {/* Diagonals */}
        {Array.from({ length: 3 }, (_, i) => {
          const a1 = (Math.PI / 3) * i - Math.PI / 6;
          const a2 = a1 + Math.PI;
          const r  = size / 2;
          return (
            <line
              key={i}
              x1={(size / 2 + r * Math.cos(a1)).toFixed(1)}
              y1={(size / 2 + r * Math.sin(a1)).toFixed(1)}
              x2={(size / 2 + r * Math.cos(a2)).toFixed(1)}
              y2={(size / 2 + r * Math.sin(a2)).toFixed(1)}
              stroke={color} strokeWidth="0.4" opacity="0.2"
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

/* Rotating triangle wireframe */
const TriWireframe: React.FC<{ x: string; y: string; size: number; color: string; duration: number; delay: number }> = (
  { x, y, size, color, duration, delay }
) => {
  const h = size * 0.866;
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, width: size, height: h }}
      animate={{ rotate: [0, -360], opacity: [0.2, 0.5, 0.2] }}
      transition={{ duration, repeat: Infinity, ease: 'linear', delay }}
    >
      <svg width={size} height={h} fill="none">
        <polygon
          points={`${size / 2},0 ${size},${h} 0,${h}`}
          stroke={color} strokeWidth="1" fill="none" opacity="0.5"
        />
        <polygon
          points={`${size / 2},${h * 0.2} ${size * 0.8},${h * 0.85} ${size * 0.2},${h * 0.85}`}
          stroke={color} strokeWidth="0.5" fill="none" opacity="0.25"
        />
      </svg>
    </motion.div>
  );
};

/* Light beam sweep */
const LightBeam: React.FC<{ x: string; color: string; duration: number; delay: number }> = (
  { x, color, duration, delay }
) => (
  <motion.div
    className="absolute top-0 w-px pointer-events-none"
    style={{
      left: x,
      height: '100%',
      background: `linear-gradient(to bottom, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)`,
      opacity: 0,
    }}
    animate={{ opacity: [0, 0.15, 0], scaleX: [1, 3, 1] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay, repeatDelay: duration * 2 }}
  />
);

/* Floating 3D diamond */
const Diamond3D: React.FC<{ x: string; y: string; size: number; color: string; duration: number; delay: number }> = (
  { x, y, size, color, duration, delay }
) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      rotate: [0, 45, 0, -45, 0],
      scale:  [1, 1.15, 1, 0.9, 1],
      opacity: [0.15, 0.4, 0.15],
    }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
  >
    <div
      className="w-full h-full"
      style={{
        background: `linear-gradient(135deg, ${color} 0%, transparent 50%, ${color} 100%)`,
        clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
        boxShadow: `0 0 20px ${color}`,
      }}
    />
  </motion.div>
);

/* Main component */
const Ambient3DLayer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Parallax spring for smooth movement
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });

  const y1 = useTransform(smoothScroll, [0, 1], ['0%', '-8%']);
  const y2 = useTransform(smoothScroll, [0, 1], ['0%', '-15%']);
  const y3 = useTransform(smoothScroll, [0, 1], ['0%', '-25%']);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* === LAYER 1: Background deep orbs (slow parallax) === */}
      <motion.div className="absolute inset-0" style={{ y: y3 }}>
        {ORBS.filter(o => o.depth > 0.6).map((orb, i) => (
          <motion.div
            key={`deep-${i}`}
            className="absolute rounded-full"
            style={{
              width:  orb.size,
              height: orb.size,
              top:    orb.top,
              left:   orb.left,
              background: `radial-gradient(circle at 30% 30%, ${orb.color}, transparent 70%)`,
              filter: `blur(${orb.blur})`,
            }}
            animate={{
              scale:   [1, 1.12, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration:  orb.duration,
              repeat:    Infinity,
              ease:      'easeInOut',
              delay:     orb.delay,
            }}
          />
        ))}
      </motion.div>

      {/* === LAYER 2: Mid orbs === */}
      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        {ORBS.filter(o => o.depth >= 0.3 && o.depth <= 0.6).map((orb, i) => (
          <motion.div
            key={`mid-${i}`}
            className="absolute rounded-full"
            style={{
              width:  orb.size,
              height: orb.size,
              top:    orb.top,
              left:   orb.left,
              background: `radial-gradient(circle at 40% 40%, ${orb.color}, transparent 70%)`,
              filter: `blur(${orb.blur})`,
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}

        {/* Light beams */}
        <LightBeam x="15%"  color="rgba(6,182,212,0.4)"   duration={6}  delay={0} />
        <LightBeam x="55%"  color="rgba(99,102,241,0.35)" duration={8}  delay={3} />
        <LightBeam x="82%"  color="rgba(168,85,247,0.3)"  duration={7}  delay={1.5} />
      </motion.div>

      {/* === LAYER 3: Foreground wireframes (faster parallax) === */}
      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        {/* Hex wireframes */}
        <HexWireframe x="8%"  y="12%" size={60}  color="rgba(6,182,212,0.5)"    duration={15} delay={0}   />
        <HexWireframe x="88%" y="25%" size={45}  color="rgba(168,85,247,0.45)"  duration={20} delay={2}   />
        <HexWireframe x="45%" y="68%" size={80}  color="rgba(99,102,241,0.40)"  duration={18} delay={1.2} />
        <HexWireframe x="72%" y="82%" size={35}  color="rgba(20,184,166,0.50)"  duration={12} delay={3}   />
        <HexWireframe x="25%" y="45%" size={50}  color="rgba(234,179,8,0.35)"   duration={22} delay={0.5} />

        {/* Triangle wireframes */}
        <TriWireframe x="3%"  y="55%" size={70}  color="rgba(239,68,68,0.35)"   duration={25} delay={1}   />
        <TriWireframe x="65%" y="10%" size={55}  color="rgba(6,182,212,0.40)"   duration={19} delay={2.5} />
        <TriWireframe x="90%" y="60%" size={40}  color="rgba(99,102,241,0.35)"  duration={16} delay={0.8} />

        {/* 3D Diamonds */}
        <Diamond3D x="18%" y="30%" size={20} color="rgba(6,182,212,0.5)"   duration={5}  delay={0}   />
        <Diamond3D x="78%" y="50%" size={16} color="rgba(168,85,247,0.5)"  duration={7}  delay={1.5} />
        <Diamond3D x="50%" y="85%" size={14} color="rgba(20,184,166,0.5)"  duration={6}  delay={0.8} />
        <Diamond3D x="35%" y="5%"  size={18} color="rgba(234,179,8,0.45)"  duration={8}  delay={2.2} />

        {/* Particles */}
        {PARTICLES.map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              left:       p.x,
              top:        p.y,
              width:      p.size,
              height:     p.size,
              background: p.color,
              boxShadow:  `0 0 ${p.size * 3}px ${p.color}`,
            }}
            animate={{
              y:       [0, -20, 0, 10, 0],
              x:       [0, 10, -5, 8, 0],
              opacity: [0, 1, 0.5, 1, 0],
              scale:   [0.5, 1, 0.8, 1.2, 0.5],
            }}
            transition={{
              duration:   p.duration,
              repeat:     Infinity,
              ease:       'easeInOut',
              delay:      p.delay,
            }}
          />
        ))}

        {/* Foreground close orbs (no blur, sharp) */}
        {ORBS.filter(o => o.depth < 0.3).map((orb, i) => (
          <motion.div
            key={`fg-${i}`}
            className="absolute rounded-full"
            style={{
              width:  orb.size * 0.4,
              height: orb.size * 0.4,
              top:    orb.top,
              left:   orb.left,
              background: orb.color,
              filter: `blur(${parseInt(orb.blur) * 0.4}px)`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: orb.duration * 0.7, repeat: Infinity, ease: 'easeInOut', delay: orb.delay }}
          />
        ))}
      </motion.div>

      {/* === Global vignette === */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(3,7,18,0.6)_100%)]" />
    </div>
  );
};

export default Ambient3DLayer;
