import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AIAssistantButtonProps {
  className?: string;
  showNotification?: boolean;
  customOnClick?: () => void;
}

export function AIAssistantButton({ 
  className = "", 
  showNotification = true,
  customOnClick 
}: AIAssistantButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (customOnClick) {
      customOnClick();
    } else {
      navigate("/chat");
    }
  };

  return (
    <motion.div
      className={`fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 ${className}`}
      initial={{ scale: 0, opacity: 0, y: 50 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 1.0
      }}
    >
      <motion.button
        onClick={handleClick}
        className="group relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#4A9B8E] to-[#2A9D8F] hover:from-[#2A9D8F] hover:to-[#4A9B8E] text-white rounded-full shadow-2xl shadow-[#4A9B8E]/30 border-2 border-white/20 backdrop-blur-sm transition-all duration-300 flex items-center justify-center overflow-hidden"
        whileHover={{ 
          scale: 1.1,
          y: -3,
          transition: { duration: 0.2 }
        }}
        whileTap={{ 
          scale: 0.9,
          y: 0,
          transition: { duration: 0.1 }
        }}
      >
        {/* AI Icon with glow effect */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-white/20 rounded-full blur-sm animate-pulse"></div>
          <Bot className="relative w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-sm" />
        </div>
        
        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
        
        {/* Pulse ring for attention */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white/30"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
        />
      </motion.button>
      
      {/* Floating notification dot */}
      {showNotification && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-[#F6E05E] rounded-full border-2 border-white shadow-lg"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.7, 1]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
} 