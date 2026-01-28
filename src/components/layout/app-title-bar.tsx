
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
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-md">
            <span className="text-sm">✨</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Vaidyāna</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">The Healing Intelligence</p>
          </div>
        </div>
        <LanguageToggle />
      </div>
    </motion.div>
  );
}
