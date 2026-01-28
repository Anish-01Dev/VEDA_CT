import { motion } from "framer-motion";
import { Shield, Wifi, Sparkles, ArrowRight, Zap } from "lucide-react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/language-context";

export function HeroSection() {
  const { t } = useLanguage();
  
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
            <div className="z-10">
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t('healthcare.without.barriers')}
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
                {t('healthcare.without.barriers')}
              </h1>

              <p className="text-lg text-muted-foreground mb-8 text-balance">
                {t('ai.powered.triage')}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/virtual-doctor">
                  <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
                    {t('try.virtual.doctor')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5 bg-transparent"
                >
                  {t('watch.how.works')}
                </Button>
              </div>
            </div>
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
              className="h-48 sm:h-72 md:h-80 lg:h-[24rem] xl:h-[30rem] w-auto object-contain drop-shadow-2xl rounded-3xl"
            />
          </motion.div>
        </div>
      </ErrorBoundary>
    </motion.section>
  );
}