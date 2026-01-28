import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageToggleProps {
  className?: string;
}

const languages = [
  { code: "hi", label: "हिं", flag: "🇮🇳" },
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "ta", label: "த", flag: "🇮🇳" },
  { code: "te", label: "తె", flag: "🇮🇳" }
];

export function LanguageToggle({ className }: LanguageToggleProps) {
  const [currentLang, setCurrentLang] = useState("hi");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-background/80 backdrop-blur-lg border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 min-w-[44px] min-h-[44px] rounded-xl tap-feedback"
        >
          <Globe className="w-4 h-4 mr-1" />
          <span className="font-medium">
            {languages.find(l => l.code === currentLang)?.label}
          </span>
        </Button>
      </motion.div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="absolute top-full right-0 mt-2 bg-card/95 backdrop-blur-lg border border-border/50 rounded-xl shadow-2xl z-50 min-w-[120px]"
        >
          {languages.map((lang) => (
            <motion.button
              key={lang.code}
              whileHover={{ backgroundColor: "hsl(var(--primary) / 0.1)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentLang(lang.code);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-4 py-3 text-left flex items-center gap-2 transition-colors first:rounded-t-xl last:rounded-b-xl",
                currentLang === lang.code && "bg-primary/10 text-primary font-medium"
              )}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}