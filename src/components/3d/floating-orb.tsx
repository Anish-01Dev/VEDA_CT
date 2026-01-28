import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingOrbProps {
  position?: [number, number, number];
  color?: string;
  isAnimating?: boolean;
}

export function FloatingOrb({ 
  position = [0, 0, 0], 
  color = "#10B981", 
  isAnimating = false 
}: FloatingOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.7;
      
      if (isAnimating) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.1);
      }
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={position} scale={0.5}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        metalness={0.8}
        emissive={color}
        emissiveIntensity={0.3}
      />
    </Sphere>
  );
}