import React from 'react';
import { useFrame } from '@react-three/fiber';

interface CameraControllerProps {
  mouseX: number;
  mouseY: number;
  scrollProgress: number;
}

const CameraController: React.FC<CameraControllerProps> = ({
  mouseX,
  mouseY,
  scrollProgress,
}) => {
  useFrame(({ camera }) => {
    // Base target position
    const targetX = mouseX * 0.3;
    const targetY = 0.5 + mouseY * 0.2;
    const targetZ = 8 - scrollProgress * 1.5;

    // Lerp towards target position
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.position.z += (targetZ - camera.position.z) * 0.05;

    // Look at origin
    camera.lookAt(0, 0, 0);
  });

  return null;
};

export default CameraController;
