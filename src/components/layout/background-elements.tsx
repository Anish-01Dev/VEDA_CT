
import { motion } from "framer-motion";

export function BackgroundElements() {
  return (
    <div className="parallax-bg absolute inset-0 opacity-5 sm:opacity-10 pointer-events-none">
      <motion.div 
        className="absolute top-10 left-4 sm:left-10 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-primary to-primary-glow rounded-full blur-2xl sm:blur-3xl" 
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.7, 0.3],
          rotate: [0, 90, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="absolute top-40 right-8 sm:right-20 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-accent to-coral rounded-full blur-xl sm:blur-2xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 15, 0],
          y: [0, -10, 0],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      <motion.div 
        className="absolute bottom-40 left-12 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-health-mental to-accent rounded-full blur-lg sm:blur-xl"
        animate={{
          scale: [1, 1.4, 1],
          rotate: [0, -90, 0],
          opacity: [0.2, 0.6, 0.2]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />
    </div>
  );
}
