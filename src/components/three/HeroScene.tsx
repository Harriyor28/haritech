import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import WebGLFallback from './WebGLFallback';
import TechnologyCore from './TechnologyCore';
import Lighting from './Lighting';
import CameraController from './CameraController';
import ParticleField from './ParticleField';

interface HeroSceneProps {
  mouseX?: number;
  mouseY?: number;
  scrollProgress?: number;
  particleCount?: number;
  corePosition?: [number, number, number];
}

const HeroScene: React.FC<HeroSceneProps> = ({
  mouseX = 0,
  mouseY = 0,
  scrollProgress = 0,
  particleCount = 2000,
  corePosition = [0, 0, 0],
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <WebGLFallback />;
  }

  return (
    <Canvas
      dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 1.5)]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.5, 8], fov: 45 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Suspense fallback={null}>
        <TechnologyCore position={corePosition} scrollProgress={scrollProgress} />
        <Lighting />
        <CameraController
          mouseX={mouseX}
          mouseY={mouseY}
          scrollProgress={scrollProgress}
        />
        <ParticleField count={particleCount} />
      </Suspense>
    </Canvas>
  );
};

export { HeroScene };
export default HeroScene;
