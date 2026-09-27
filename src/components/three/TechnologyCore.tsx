import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TechnologyCoreProps {
  scrollProgress?: number;
  position?: [number, number, number];
}

const TechnologyCore: React.FC<TechnologyCoreProps> = ({
  scrollProgress = 0,
  position = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const ring3Ref = useRef<THREE.Mesh>(null);

  // Generate emissive nodes positions for rings
  const nodes = useMemo(() => {
    const nodesData: Array<{ ringIndex: number; x: number; y: number; z: number; color: string }> = [];
    const ringConfigs = [
      { radius: 1.8, count: 4, color: '#00d4ff' },
      { radius: 2.2, count: 5, color: '#7c3aed' },
      { radius: 2.6, count: 3, color: '#00d4ff' },
    ];

    ringConfigs.forEach((config, ringIndex) => {
      for (let i = 0; i < config.count; i++) {
        const angle = (i / config.count) * Math.PI * 2;
        nodesData.push({
          ringIndex,
          x: Math.cos(angle) * config.radius,
          y: Math.sin(angle) * config.radius,
          z: 0, // Rings are flat tori, so z=0 on their local plane
          color: config.color,
        });
      }
    });
    return nodesData;
  }, []);

  useFrame(({ clock }, delta) => {
    if (groupRef.current) {
      // Main group slow Y rotation & scroll-based rotation
      // Using delta for continuous, then override with absolute clock + scroll for deterministic if preferred,
      // but let's mix smoothly:
      groupRef.current.rotation.y = (clock.elapsedTime * 0.15) + (scrollProgress * Math.PI * 0.5);
      
      // Floating effect
      groupRef.current.position.y = position[1] + Math.sin(clock.elapsedTime * 0.5) * 0.15;
    }

    // Rings counter-rotation
    if (ring1Ref.current) ring1Ref.current.rotation.z += delta * -0.3;
    if (ring2Ref.current) ring2Ref.current.rotation.z += delta * 0.2;
    if (ring3Ref.current) ring3Ref.current.rotation.z += delta * -0.1;
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Inner Wireframe */}
      <mesh>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshBasicMaterial
          wireframe
          color="#00d4ff"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Central Sphere */}
      <mesh>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#1a1a2e"
          metalness={0.9}
          roughness={0.15}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Ring 1 */}
      <mesh ref={ring1Ref} rotation-x={Math.PI / 3}>
        <torusGeometry args={[1.8, 0.02, 16, 100]} />
        <meshPhysicalMaterial
          color="#00d4ff"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.6}
        />
        {nodes.filter(n => n.ringIndex === 0).map((node, i) => (
          <mesh key={`n1-${i}`} position={[node.x, node.y, node.z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={3} />
          </mesh>
        ))}
      </mesh>

      {/* Ring 2 */}
      <mesh ref={ring2Ref} rotation-z={Math.PI / 4}>
        <torusGeometry args={[2.2, 0.015, 16, 100]} />
        <meshPhysicalMaterial
          color="#7c3aed"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.4}
        />
        {nodes.filter(n => n.ringIndex === 1).map((node, i) => (
          <mesh key={`n2-${i}`} position={[node.x, node.y, node.z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={3} />
          </mesh>
        ))}
      </mesh>

      {/* Ring 3 */}
      <mesh ref={ring3Ref} rotation={[-Math.PI / 5, Math.PI / 6, 0]}>
        <torusGeometry args={[2.6, 0.01, 16, 100]} />
        <meshPhysicalMaterial
          color="#00d4ff"
          metalness={0.8}
          roughness={0.1}
          transparent
          opacity={0.3}
        />
        {nodes.filter(n => n.ringIndex === 2).map((node, i) => (
          <mesh key={`n3-${i}`} position={[node.x, node.y, node.z]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={node.color} emissive={node.color} emissiveIntensity={3} />
          </mesh>
        ))}
      </mesh>
    </group>
  );
};

export default TechnologyCore;
