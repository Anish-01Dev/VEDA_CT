import { motion } from "framer-motion";
import { SceneWrapper } from '@/components/3d/scene-wrapper';

interface AnalysisLoaderProps {
  isVisible: boolean;
}

export function AnalysisLoader({ isVisible }: AnalysisLoaderProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-br from-primary/5 to-primary-glow/5">
      <SceneWrapper 
        className="w-full h-full opacity-80" 
        isAnimating={true}
      />
      {/* Enhanced loading overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent"
        animate={{
          x: [-100, 400]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 shimmer-loading opacity-20" />
      
      {/* Pulsing dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-primary rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  );
}