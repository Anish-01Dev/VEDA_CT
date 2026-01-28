
import { motion } from "framer-motion";

interface SymptomDisclaimerProps {
  delay: number;
}

export function SymptomDisclaimer({ delay }: SymptomDisclaimerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="bg-muted/30 rounded-xl p-4 border border-border/40 text-center"
    >
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
        <strong>⚕️ Medical Disclaimer:</strong> This AI analysis is for informational purposes only. 
        Always consult qualified healthcare professionals for medical diagnosis and treatment.
      </p>
    </motion.div>
  );
}
