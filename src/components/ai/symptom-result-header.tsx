
import { motion } from "framer-motion";

export function SymptomResultHeader() {
  return (
    <motion.div 
      className="flex items-center gap-3 pb-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-md">
        <span className="text-sm">🤖</span>
      </div>
      <div>
        <h3 className="font-semibold text-foreground text-base sm:text-lg">
          AI Health Analysis Results
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Based on your symptoms, here's what I found:
        </p>
      </div>
    </motion.div>
  );
}
