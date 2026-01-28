import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SOSButtonProps {
  className?: string;
  onClick?: () => void;
}

export function SOSButton({ className, onClick }: SOSButtonProps) {
  return (
    <motion.div
      className={cn("fixed bottom-24 right-4 z-50", className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 200 }}
    >
      <motion.div
        animate={{
          boxShadow: [
            "0 0 0 0 hsl(var(--health-critical) / 0.4)",
            "0 0 0 10px hsl(var(--health-critical) / 0)",
            "0 0 0 0 hsl(var(--health-critical) / 0)"
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative"
      >
        <Button
          onClick={onClick}
          className={cn(
            "w-14 h-14 rounded-full bg-gradient-to-br from-health-critical to-red-600",
            "text-white shadow-2xl hover:shadow-3xl hover:scale-110 active:scale-95",
            "transition-all duration-300 tap-feedback button-press",
            "flex items-center justify-center group relative overflow-hidden"
          )}
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="relative z-10"
          >
            <AlertTriangle className="w-6 h-6" />
          </motion.div>
          
          {/* Pulse ring */}
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.8, 0, 0.8]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut"
            }}
            className="absolute inset-0 bg-health-critical rounded-full"
          />
        </Button>
        
        {/* SOS label */}
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-health-critical/90 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap backdrop-blur-sm"
        >
          Emergency SOS
        </motion.div>
      </motion.div>
    </motion.div>
  );
}