
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingShimmer } from "@/components/ui/loading-shimmer";

export function SymptomCheckerSection() {
  return (
    <motion.section
      className="symptom-checker-section motion-card scroll-trigger"
      id="symptom-checker"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <ErrorBoundary 
        fallback={
          <div className="p-8 bg-muted/10 rounded-2xl border border-border/30">
            <LoadingShimmer lines={5} showIcon />
            <p className="text-center text-sm text-muted-foreground mt-4">
              ⚠️ AI symptom checker temporarily unavailable. Please try refreshing.
            </p>
          </div>
        }
      >
        {/* Section Header */}
        <motion.div 
          className="mb-8 sm:mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔍
            </motion.span>
            AI Symptom Analysis
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto word-wrap leading-relaxed">
            Describe your symptoms for instant AI-powered health insights and personalized recommendations
          </p>
        </motion.div>
        
        {/* Symptom Checker Removed */}
        <motion.div 
          className="p-8 bg-muted/10 rounded-2xl border border-border/30 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <p className="text-muted-foreground text-lg">
            🔍 Symptom Checker temporarily unavailable
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This feature is currently being updated. Please check back later.
          </p>
        </motion.div>
      </ErrorBoundary>
    </motion.section>
  );
}
