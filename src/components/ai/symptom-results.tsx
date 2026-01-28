
import { motion, AnimatePresence } from "framer-motion";
import { SymptomResult } from "./types";
import { SymptomResultHeader } from "./symptom-result-header";
import { SymptomResultCard } from "./symptom-result-card";
import { SymptomDisclaimer } from "./symptom-disclaimer";

interface SymptomResultsProps {
  results: SymptomResult[];
}

export function SymptomResults({ results }: SymptomResultsProps) {
  if (results.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4 sm:space-y-6"
      >
        {/* AI Response Header */}
        <SymptomResultHeader />
        
        {/* Results in Chat-like Format */}
        <div className="space-y-4 sm:space-y-5">
          {results.map((result, index) => (
            <SymptomResultCard
              key={result.condition}
              result={result}
              index={index}
            />
          ))}
        </div>

        {/* Medical Disclaimer */}
        <SymptomDisclaimer delay={results.length * 0.15 + 0.5} />
      </motion.div>
    </AnimatePresence>
  );
}
