import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useRef } from 'react';
import { FloatingOrb } from './floating-orb';

interface SceneWrapperProps {
  className?: string;
  isAnimating?: boolean;
  children?: React.ReactNode;
}

export function SceneWrapper({ className, isAnimating = false, children }: SceneWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Wait for the canvas to be mounted
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    const handleContextLost = (event: Event) => {
      event.preventDefault();
      // You can show a user-friendly message here if you want
      // For now, just log
      // eslint-disable-next-line no-console
      console.log('THREE.WebGLRenderer: Context Lost.');
    };
    canvas.addEventListener('webglcontextlost', handleContextLost);
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
    };
  }, []);

  return (
    <div className={className} ref={containerRef}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ 
          background: 'transparent',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Suspense fallback={null}>
          <FloatingOrb 
            position={[0, 0, 0]} 
            color="hsl(135, 35%, 45%)" 
            isAnimating={isAnimating} 
          />
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}