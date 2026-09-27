import React from 'react';
import { ContactShadows } from '@react-three/drei';

const Lighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.15} color="#ffffff" />
      
      {/* Key Light */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Rim Light Left (Cyan) */}
      <pointLight position={[-5, 3, -5]} intensity={0.6} color="#00d4ff" />
      
      {/* Rim Light Right (Purple) */}
      <pointLight position={[5, -2, -8]} intensity={0.4} color="#7c3aed" />

      {/* Optional ContactShadows */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.3}
        blur={2}
        far={4}
      />
    </>
  );
};

export default Lighting;
