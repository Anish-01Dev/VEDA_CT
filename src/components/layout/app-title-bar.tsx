
import { motion } from "framer-motion";
import { LanguageToggle } from "@/components/ui/language-toggle";

export function AppTitleBar() {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-lg border-b border-border/30 px-4 py-3"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <img
            src="/synora-logo.jpeg"
            alt="Synora AI"
            className="h-8 sm:h-10 w-auto object-contain"
          />
        </div>
        <LanguageToggle />
      </div>
    </motion.div>
  );
}
