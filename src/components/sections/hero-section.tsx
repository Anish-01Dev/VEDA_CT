
import { motion } from "framer-motion";
import { Shield, Wifi, Sparkles } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export function HeroSection() {
  return (
    <motion.section
      className="hero-section motion-card fade-on-scroll"
      id="hero-section"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <ErrorBoundary
        fallback={
          <div className="text-center p-8 bg-muted/10 rounded-2xl">
            <p className="text-muted-foreground">⚠️ Content loading...</p>
          </div>
        }
      >
        {/* Trust Badge removed */}

        {/* Logo and Main Heading */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-16 lg:mb-20 relative px-4 sm:px-6">

          {/* Text Content (Left Side) - Now First in DOM */}
          <div className="text-left order-2 lg:order-1">
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground mb-10  sm:mb-10 lg:mb-10 text-gradient leading-tight word-wrap"
              initial={{ opacity: 0, scale: 0.7, x: -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              Pixal Health
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4 sm:space-y-6"
            >
              <p className="text-muted-foreground text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-relaxed word-wrap break-words">
                आपका AI-संचालित स्वास्थ्य साथी बेहतर कल्याण के लिए
              </p>
              <p className="text-muted-foreground/80 text-lg sm:text-xl md:text-2xl leading-relaxed word-wrap break-words">
                Your AI-powered healthcare companion for better wellness
              </p>
            </motion.div>
          </div>

          {/* Video (Right Side) - Now Second in DOM */}
          <motion.div
            className="flex justify-center lg:justify-end order-1 lg:order-2 mb-8 lg:mb-0"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            <video
              src="/pixcal.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-56 sm:h-64 md:h-72 lg:h-80 xl:h-96 w-auto object-contain drop-shadow-2xl rounded-3xl"
            />
          </motion.div>
        </div>
      </ErrorBoundary>
    </motion.section>
  );
}
