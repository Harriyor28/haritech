import React, { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Interactive3DTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotation?: number;     // max degrees to tilt (e.g. 15)
  perspective?: number;     // CSS perspective (e.g. 1000)
  scaleOnHover?: number;    // zoom factor (e.g. 1.04)
  onClick?: () => void;
}

export const Interactive3DTiltCard: React.FC<Interactive3DTiltCardProps> = ({
  children,
  className = '',
  maxRotation = 14,
  perspective = 1000,
  scaleOnHover = 1.03,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const width = rect.width;
    const height = rect.height;

    // Calculate rotation (-max to +max)
    const normX = (x / width - 0.5) * 2;   // -1 to +1
    const normY = (y / height - 0.5) * 2;  // -1 to +1

    setRotateX(-normY * maxRotation);
    setRotateY(normX * maxRotation);

    setGlarePos({
      x: (x / width) * 100,
      y: (y / height) * 100,
      opacity: 0.85,
    });
  }, [maxRotation]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{ perspective: `${perspective}px` }}
      className={`relative ${className}`}
      onClick={onClick}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        animate={{
          rotateX,
          rotateY,
          scale: isHovered ? scaleOnHover : 1,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.5,
        }}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
        className="w-full h-full relative rounded-2xl overflow-hidden cursor-pointer"
      >
        {/* Child Content */}
        <div style={{ transformStyle: 'preserve-3d' }} className="w-full h-full">
          {children}
        </div>

        {/* High-Reflectivity Specular Glare Hotspot */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl"
          style={{
            opacity: isHovered ? 0.95 : 0,
            background: `radial-gradient(circle 260px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.35) 30%, transparent 70%)`,
            mixBlendMode: 'color-dodge',
          }}
        />

        {/* Dynamic Diagonal Glass Mirror Reflection Beam */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl"
          style={{
            opacity: isHovered ? 0.65 : 0,
            background: `linear-gradient(${rotateY * 6 + 115}deg, transparent 25%, rgba(255, 255, 255, 0.1) 42%, rgba(255, 255, 255, 0.7) 50%, rgba(255, 255, 255, 0.1) 58%, transparent 75%)`,
            mixBlendMode: 'overlay',
          }}
        />

        {/* Razor-Sharp 3D Metallic Bevel Rim Highlight */}
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.9 : 0.4,
            background: `linear-gradient(${rotateY * 10 + 135}deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.05) 45%, rgba(255, 255, 255, 0.4) 100%)`,
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />
      </motion.div>
    </div>
  );
};

export default Interactive3DTiltCard;
