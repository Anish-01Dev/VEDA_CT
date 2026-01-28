
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SymptomResult } from "./types";

interface EnhancedSymptomResultsProps {
  results: SymptomResult[];
  language: string;
}

const severityConfig = {
  mild: {
    icon: '💚',
    label: { en: 'Mild', hi: 'हल्का' },
    bgClass: 'bg-gradient-to-br from-health-good/10 to-health-good/5',
    borderClass: 'border-health-good/30',
    badgeClass: 'bg-health-good text-white'
  },
  moderate: {
    icon: '⚡',
    label: { en: 'Moderate', hi: 'मध्यम' },
    bgClass: 'bg-gradient-to-br from-health-warning/10 to-health-warning/5',
    borderClass: 'border-health-warning/30',
    badgeClass: 'bg-health-warning text-white'
  },
  emergency: {
    icon: '🆘',
    label: { en: 'URGENT', hi: 'तत्काल' },
    bgClass: 'bg-gradient-to-br from-health-critical/15 to-health-critical/5',
    borderClass: 'border-health-critical/50',
    badgeClass: 'bg-health-critical text-white animate-pulse'
  }
};

export function EnhancedSymptomResults({ results, language }: EnhancedSymptomResultsProps) {
  if (results.length === 0) return null;

  return (
    <ErrorBoundary 
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-6 bg-muted/20 rounded-2xl border border-border/30 text-center"
        >
          <p className="text-muted-foreground">
            ⚠️ {language === 'en' 
              ? 'Analysis temporarily unavailable. Please try again.' 
              : 'विश्लेषण अस्थायी रूप से अनुपलब्ध। कृपया पुनः प्रयास करें।'
            }
          </p>
        </motion.div>
      }
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-6"
        >
          {/* AI Response Header */}
          <motion.div 
            className="flex items-center gap-3 pb-2 border-b border-border/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg sm:text-xl">
                {language === 'en' ? 'AI Health Analysis' : 'AI स्वास्थ्य विश्लेषण'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en' 
                  ? 'Based on your symptoms, here\'s what I found:' 
                  : 'आपके लक्षणों के आधार पर, यह मिला:'
                }
              </p>
            </div>
          </motion.div>
          
          {/* Results Cards */}
          <div className="space-y-5">
            {results.map((result, index) => {
              const severity = severityConfig[result.severity];
              
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
                    "relative border-2 rounded-3xl p-6 sm:p-8 space-y-5",
                    "backdrop-blur-sm transition-all duration-300 cursor-pointer",
                    "shadow-lg hover:shadow-xl group",
                    severity.bgClass,
                    severity.borderClass
                  )}
                >
                  {/* Urgency Badge */}
                  <div className="absolute top-6 right-6">
                    <div className={cn(
                      "px-4 py-2 rounded-full text-sm font-bold shadow-lg",
                      severity.badgeClass
                    )}>
                      {severity.icon} {severity.label[language as keyof typeof severity.label]}
                    </div>
                  </div>

                  {/* Condition Header */}
                  <div className="pr-24">
                    <h4 className="font-bold text-foreground text-xl sm:text-2xl mb-3 flex items-center gap-3">
                      {severity.icon}
                      {result.condition}
                    </h4>
                    
                    {/* Confidence Meter */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground font-medium">
                          {language === 'en' ? 'AI Confidence Level' : 'AI विश्वसनीयता स्तर'}
                        </span>
                        <span className="font-bold text-primary text-lg">{result.confidence}%</span>
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
                  
                  {/* Description Card */}
                  <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-5 border border-border/30 shadow-sm">
                    <p className="text-base sm:text-lg text-foreground leading-relaxed font-medium">
                      {result.description}
                    </p>
                  </div>
                  
                  {/* Recommendations */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-3 h-3 bg-primary rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <h5 className="font-bold text-foreground text-base sm:text-lg">
                        {language === 'en' ? 'Recommended Actions:' : 'सुझाए गए कार्य:'}
                      </h5>
                    </div>
                    
                    <div className="grid gap-3">
                      {result.suggestions.map((suggestion, idx) => (
                        <motion.div 
                          key={idx} 
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl transition-all duration-200 min-h-[44px]",
                            "hover:bg-primary/5 border border-transparent hover:border-primary/20",
                            suggestion.includes('EMERGENCY') && "bg-health-critical/10 border-health-critical/30"
                          )}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: (index * 0.1) + (idx * 0.1) + 0.8 }}
                          whileHover={{ x: 5 }}
                        >
                          <span className={cn(
                            "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold",
                            suggestion.includes('EMERGENCY') ? "bg-health-critical text-white" : "bg-primary/20 text-primary"
                          )}>
                            {suggestion.includes('EMERGENCY') ? '🚨' : idx + 1}
                          </span>
                          <span className={cn(
                            "text-base leading-relaxed",
                            suggestion.includes('EMERGENCY') ? "font-bold text-health-critical" : "text-foreground"
                          )}>
                            {suggestion}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency CTA */}
                  {result.severity === 'emergency' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.2 + 1 }}
                      className="bg-gradient-to-r from-health-critical to-health-critical/80 rounded-2xl p-5 text-center"
                    >
                      <p className="text-white font-bold text-base sm:text-lg">
                        ⚠️ {language === 'en' 
                          ? 'Seek immediate medical attention or call emergency services' 
                          : 'तत्काल चिकित्सा सहायता लें या आपातकालीन सेवाओं को कॉल करें'
                        }
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Medical Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: results.length * 0.15 + 0.5 }}
            className="bg-muted/30 rounded-2xl p-5 border border-border/40 text-center"
          >
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              <strong>⚕️ {language === 'en' ? 'Medical Disclaimer' : 'चिकित्सा अस्वीकरण'}:</strong>{' '}
              {language === 'en' 
                ? 'This AI analysis is for informational purposes only. Always consult qualified healthcare professionals for medical diagnosis and treatment.'
                : 'यह AI विश्लेषण केवल सूचनात्मक उद्देश्यों के लिए है। चिकित्सा निदान और उपचार के लिए हमेशा योग्य स्वास्थ्य पेशेवरों से सलाह लें।'
              }
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
}
