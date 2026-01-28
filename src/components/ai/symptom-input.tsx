import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

interface SymptomInputProps {
  symptoms: string;
  setSymptoms: (value: string) => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
}

export function SymptomInput({
  symptoms,
  setSymptoms,
  isListening,
  setIsListening,
  onSubmit,
  isAnalyzing
}: SymptomInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      try {
        if (isListening) {
          gsap.to(inputRef.current, {
            scale: 1.02,
            duration: 0.3,
            yoyo: true,
            repeat: -1,
            ease: "power2.inOut"
          });
        } else {
          gsap.to(inputRef.current, {
            scale: 1,
            duration: 0.3
          });
        }
      } catch (error) {
        console.warn('GSAP animation failed:', error);
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    setIsListening(!isListening);
    // TODO: Implement speech recognition
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Symptom Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder="🩺 Tell me about your symptoms... (fever, headache, cough, etc.)"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className={cn(
            "pr-16 sm:pr-20 py-4 sm:py-5 text-base sm:text-lg transition-all duration-300",
            "focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:shadow-xl focus:shadow-primary/20",
            "border-2 border-border/30 hover:border-primary/40",
            isListening && "ring-2 ring-health-critical/50 border-health-critical/60 shadow-xl shadow-health-critical/30 animate-pulse",
            "bg-card/80 backdrop-blur-sm rounded-2xl min-h-[60px] font-medium"
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        
        {/* Voice Input Button */}
        <motion.div
          className="absolute right-4 top-1/2 -translate-y-1/2"
          animate={isListening ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ 
            duration: 0.6, 
            repeat: isListening ? Infinity : 0 
          }}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={cn(
              "p-3 transition-all duration-300 hover:bg-primary/15 rounded-xl min-w-[48px] min-h-[48px]",
              "shadow-sm hover:shadow-md",
              isListening && "text-health-critical bg-health-critical/15 hover:bg-health-critical/25"
            )}
            onClick={toggleListening}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Mic className="w-6 h-6" />
              </motion.div>
            ) : (
              <MicOff className="w-6 h-6" />
            )}
          </Button>
        </motion.div>
      </div>

      {/* Quick Symptom Chips */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {['🤒 Fever', '🤕 Headache', '🤢 Nausea', '😴 Fatigue', '🫁 Cough'].map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const symptomWord = chip.split(' ')[1].toLowerCase();
              setSymptoms(symptoms ? `${symptoms}, ${symptomWord}` : symptomWord);
            }}
            className="px-3 py-2 bg-muted/60 hover:bg-primary/10 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border border-border/30 hover:border-primary/40"
          >
            {chip}
          </motion.button>
        ))}
      </div>
      
      {/* Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={onSubmit}
          disabled={!symptoms.trim() || isAnalyzing}
          className={cn(
            "w-full py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-2xl transition-all duration-300",
            "bg-gradient-to-r from-primary via-primary-glow to-primary",
            "hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.01]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
            "shadow-lg"
          )}
        >
          {isAnalyzing ? (
            <div className="flex items-center justify-center gap-3">
              <motion.div 
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.span
                animate={{ opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🔍 AI is analyzing your symptoms...
              </motion.span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🩺 Analyze Symptoms with AI
            </span>
          )}
        </Button>
      </motion.div>
    </div>
  );
}