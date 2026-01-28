import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface FloatingActionButtonProps {
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
  variant?: "emergency" | "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const variants = {
  emergency: "bg-health-critical hover:bg-health-critical/90 text-white shadow-2xl shadow-health-critical/40 border-2 border-health-critical/30",
  primary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-2xl shadow-primary/40 border-2 border-primary/30", 
  secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-2xl shadow-secondary/40 border-2 border-secondary/30"
};

const sizes = {
  sm: "h-12 w-12 text-sm",
  md: "h-16 w-16 text-base", 
  lg: "h-20 w-20 text-lg"
};

export function FloatingActionButton({ 
  onClick, 
  children, 
  className,
  variant = "primary",
  size = "md"
}: FloatingActionButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (variant === "emergency" && buttonRef.current) {
      // Enhanced emergency animations
      try {
        const tl = gsap.timeline({ repeat: -1 });
        
        tl.to(buttonRef.current, {
          scale: 1.1,
          duration: 0.6,
          ease: "power2.inOut"
        })
        .to(buttonRef.current, {
          scale: 1,
          duration: 0.6,
          ease: "power2.inOut"
        })
        .to(buttonRef.current, {
          boxShadow: "0 0 40px hsl(var(--health-critical) / 0.8), 0 0 80px hsl(var(--health-critical) / 0.4)",
          duration: 1,
          ease: "sine.inOut"
        }, 0);
      } catch (error) {
        console.warn('GSAP animation failed:', error);
      }
    }
  }, [variant]);

  return (
    <motion.button
      ref={buttonRef}
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-4 sm:bottom-24 sm:right-6 rounded-full flex items-center justify-center z-50 transition-all duration-300",
        "hover:scale-110 active:scale-95",
        // Remove glass-effect and backdrop-blur-lg for primary variant
        variant === "primary" ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/40 border-2 border-primary/30" : "backdrop-blur-lg glass-effect",
        "transform-gpu perspective-1000",
        sizes[size],
        className
      )}
      whileHover={{ 
        scale: 1.2,
        rotate: -5,
        y: -5,
        transition: { 
          duration: 0.3,
          type: "spring",
          stiffness: 300
        }
      }}
      whileTap={{ 
        scale: 0.85,
        rotate: 0,
        y: 0,
        transition: { duration: 0.1 }
      }}
      initial={{ 
        scale: 0, 
        rotate: 180,
        opacity: 0,
        y: 100
      }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        opacity: 1,
        y: 0
      }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.8
      }}
    >
      <motion.div
        animate={variant === "emergency" ? {
          rotate: [0, 10],
          scale: [1, 1.1, 1]
        } : {}}
        transition={{
          duration: 2,
          repeat: variant === "emergency" ? Infinity : 0,
          repeatDelay: 1
        }}
      >
        {children}
      </motion.div>
      
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-white/20"
        initial={{ scale: 0, opacity: 0 }}
        whileTap={{
          scale: [0, 1.5],
          opacity: [0.3, 0],
        }}
        transition={{ duration: 0.4 }}
      />

      {/* Emergency pulse rings */}
      {variant === "emergency" && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border border-health-critical/50"
            animate={{
              scale: [1, 2, 1],
              opacity: [0.5, 0, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/30"
            animate={{
              scale: [1, 1.8, 1],
              opacity: [0.3, 0, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
        </>
      )}
    </motion.button>
  );
}