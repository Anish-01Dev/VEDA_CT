
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SymptomResult } from "./types";

interface SymptomResultCardProps {
  result: SymptomResult;
  index: number;
}

export function SymptomResultCard({ result, index }: SymptomResultCardProps) {
  return (
    <motion.div
      key={result.condition}
      initial={{ opacity: 0, x: -30, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ delay: index * 0.15, type: "spring", stiffness: 200 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 12px 40px -10px hsl(var(--primary) / 0.25)",
        y: -3
      }}
      className={cn(
        "relative border-2 border-border/40 rounded-2xl p-5 sm:p-6 space-y-4",
        "bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-sm",
        "hover:border-primary/40 transition-all duration-300 cursor-pointer",
        "shadow-lg hover:shadow-xl group",
        result.severity === 'emergency' && "border-health-critical/50 bg-gradient-to-br from-health-critical/5 to-health-critical/10",
        result.severity === 'moderate' && "border-health-warning/50 bg-gradient-to-br from-health-warning/5 to-health-warning/10"
      )}
    >
      {/* Severity Indicator */}
      <div className="absolute top-4 right-4">
        <div className={cn(
          "px-3 py-1.5 rounded-full text-xs font-bold shadow-md",
          result.severity === 'emergency' && "bg-health-critical text-white animate-pulse",
          result.severity === 'moderate' && "bg-health-warning text-white",
          result.severity === 'mild' && "bg-health-good text-white"
        )}>
          {result.severity === 'emergency' && '🚨 URGENT'}
          {result.severity === 'moderate' && '⚠️ MODERATE'}
          {result.severity === 'mild' && '✅ MILD'}
        </div>
      </div>

      {/* Condition Name & Confidence */}
      <div className="pr-20">
        <h4 className="font-bold text-foreground text-lg sm:text-xl mb-2 flex items-center gap-2">
          {result.severity === 'emergency' && '🆘'}
          {result.severity === 'moderate' && '⚡'}
          {result.severity === 'mild' && '💚'}
          {result.condition}
        </h4>
        
        {/* Confidence Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-medium">AI Confidence Level</span>
            <span className="font-bold text-primary">{result.confidence}%</span>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.2 + 0.4, duration: 1, ease: "easeOut" }}
            className="origin-left bg-muted/30 rounded-full h-3 overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ delay: index * 0.2 + 0.6, duration: 1.2, ease: "easeOut" }}
              className={cn(
                "h-full rounded-full shadow-sm",
                result.confidence >= 80 && "bg-gradient-to-r from-health-good to-health-good/80",
                result.confidence >= 60 && result.confidence < 80 && "bg-gradient-to-r from-health-warning to-health-warning/80",
                result.confidence < 60 && "bg-gradient-to-r from-muted-foreground to-muted-foreground/80"
              )}
            />
          </motion.div>
        </div>
      </div>
      
      {/* Description */}
      <div className="bg-muted/20 rounded-xl p-4 border border-border/30">
        <p className="text-sm sm:text-base text-foreground leading-relaxed font-medium">
          {result.description}
        </p>
      </div>
      
      {/* Recommendations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <h5 className="font-semibold text-foreground text-sm sm:text-base">
            Recommended Actions:
          </h5>
        </div>
        
        <div className="grid gap-2">
          {result.suggestions.map((suggestion, idx) => (
            <motion.div 
              key={idx} 
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                "hover:bg-primary/5 border border-transparent hover:border-primary/20",
                suggestion.includes('EMERGENCY') && "bg-health-critical/10 border-health-critical/30"
              )}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (index * 0.1) + (idx * 0.1) + 0.8 }}
              whileHover={{ x: 5 }}
            >
              <span className={cn(
                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                suggestion.includes('EMERGENCY') ? "bg-health-critical text-white" : "bg-primary/20 text-primary"
              )}>
                {suggestion.includes('EMERGENCY') ? '🚨' : idx + 1}
              </span>
              <span className={cn(
                "text-sm sm:text-base leading-relaxed",
                suggestion.includes('EMERGENCY') ? "font-bold text-health-critical" : "text-foreground"
              )}>
                {suggestion}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Emergency Call to Action */}
      {result.severity === 'emergency' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.2 + 1 }}
          className="bg-gradient-to-r from-health-critical to-health-critical/80 rounded-xl p-4 text-center"
        >
          <p className="text-white font-bold text-sm sm:text-base">
            ⚠️ Seek immediate medical attention or call emergency services
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
