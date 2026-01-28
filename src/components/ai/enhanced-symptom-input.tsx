
import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mic, MicOff, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";

interface EnhancedSymptomInputProps {
  symptoms: string;
  setSymptoms: (value: string) => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
  onSubmit: () => void;
  isAnalyzing: boolean;
  language: string;
  setLanguage: (lang: string) => void;
}

export function EnhancedSymptomInput({
  symptoms,
  setSymptoms,
  isListening,
  setIsListening,
  onSubmit,
  isAnalyzing,
  language,
  setLanguage
}: EnhancedSymptomInputProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Language Toggle */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          🩺 Describe Your Symptoms
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors"
        >
          <Globe className="w-4 h-4" />
          {language === 'en' ? 'हिं' : 'EN'}
        </motion.button>
      </div>

      {/* Enhanced Large Input */}
      <div className="relative">
        <Textarea
          ref={inputRef}
          placeholder={language === 'en' 
            ? "🤒 Tell me about your symptoms in detail... (fever, headache, cough, stomach pain, etc.)" 
            : "🤒 अपने लक्षणों के बारे में विस्तार से बताएं... (बुखार, सिरदर्द, खांसी, पेट दर्द, आदि)"
          }
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          className={cn(
            "min-h-[120px] p-6 text-base sm:text-lg resize-none",
            "focus:ring-2 focus:ring-primary/40 focus:border-primary/60 focus:shadow-xl focus:shadow-primary/20",
            "border-2 border-border/30 hover:border-primary/40",
            isListening && "ring-2 ring-health-critical/50 border-health-critical/60 shadow-xl shadow-health-critical/30 animate-pulse",
            "bg-card/80 backdrop-blur-sm rounded-2xl font-medium transition-all duration-300"
          )}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              e.preventDefault();
              onSubmit();
            }
          }}
        />
        
        {/* Voice Input Button */}
        <motion.div
          className="absolute bottom-4 right-4"
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
      <div className="flex flex-wrap gap-3">
        {(language === 'en' 
          ? ['🤒 Fever', '🤕 Headache', '🤢 Nausea', '😴 Fatigue', '🫁 Cough', '💊 Pain']
          : ['🤒 बुखार', '🤕 सिरदर्द', '🤢 जी मिचलाना', '😴 थकान', '🫁 खांसी', '💊 दर्द']
        ).map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const symptomWord = chip.split(' ')[1].toLowerCase();
              setSymptoms(symptoms ? `${symptoms}, ${symptomWord}` : symptomWord);
            }}
            className="px-4 py-3 bg-muted/60 hover:bg-primary/10 rounded-xl text-sm font-medium transition-all duration-200 border border-border/30 hover:border-primary/40 min-h-[44px]"
          >
            {chip}
          </motion.button>
        ))}
      </div>
      
      {/* Enhanced Submit Button */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button 
          onClick={onSubmit}
          disabled={!symptoms.trim() || isAnalyzing}
          className={cn(
            "w-full py-6 text-lg font-semibold rounded-2xl transition-all duration-300 min-h-[60px]",
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
                {language === 'en' ? '🔍 AI is analyzing your symptoms...' : '🔍 AI आपके लक्षणों का विश्लेषण कर रहा है...'}
              </motion.span>
            </div>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🩺 {language === 'en' ? 'Analyze Symptoms with AI' : 'AI के साथ लक्षण विश्लेषण'}
            </span>
          )}
        </Button>
      </motion.div>

      {/* Input Tip */}
      <motion.p 
        className="text-sm text-muted-foreground text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        💡 {language === 'en' 
          ? 'Press Ctrl+Enter to analyze quickly' 
          : 'त्वरित विश्लेषण के लिए Ctrl+Enter दबाएं'
        }
      </motion.p>
    </motion.div>
  );
}
