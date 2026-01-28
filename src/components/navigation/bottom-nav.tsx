import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  path: string;
}

interface BottomNavProps {
  items: NavItem[];
  className?: string;
}

export function BottomNav({ items, className }: BottomNavProps) {
  const location = useLocation();

  // Null check to prevent runtime errors
  if (!items || !Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <motion.div 
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-card border-t border-[#E2E8F0] z-40",
        "pb-safe-area-inset-bottom shadow-2xl shadow-black/10",
        className
      )}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-around px-1 py-3 max-w-md mx-auto">
        {items.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "relative flex flex-col items-center justify-center px-3 py-3 rounded-2xl transition-all duration-300",
                  "min-w-[56px] sm:min-w-[64px] min-h-[56px] sm:min-h-[64px] flex-1 tap-feedback button-press",
                  "hover:bg-[#4A9B8E10] active:scale-95",
                  isActive 
                    ? "text-[#4A9B8E] bg-[#4A9B8E10] shadow-lg scale-105" 
                    : "text-[#4A5568] hover:text-[#2D3748]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    className="text-xl sm:text-2xl mb-1.5 relative"
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      y: isActive ? -2 : 0 
                    }}
                    whileHover={{ scale: isActive ? 1.2 : 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    style={{ color: isActive ? '#4A9B8E' : '#4A5568' }}
                  >
                    {isActive ? item.activeIcon : item.icon}
                    {/* Animated background ring for active state */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full bg-[#4A9B8E20] -z-10"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3]
                        }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity,
                          delay: index * 0.2
                        }}
                      />
                    )}
                  </motion.div>
                  <motion.span 
                    className={cn(
                      "text-[10px] sm:text-[11px] font-semibold leading-none transition-all font-nunito",
                      "text-center max-w-full truncate",
                      isActive ? "opacity-100" : "opacity-70"
                    )}
                    style={{ color: isActive ? '#4A9B8E' : '#4A5568' }}
                    animate={{
                      fontSize: isActive ? ["10px", "11px", "10px"] : "10px"
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {item.label}
                  </motion.span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-[#4A9B8E] rounded-full"
                      layoutId="activeIndicator"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: [1, 1.3, 1]
                      }}
                      transition={{ 
                        scale: { 
                          duration: 1.5, 
                          repeat: Infinity 
                        },
                        layout: { 
                          type: "spring", 
                          stiffness: 500, 
                          damping: 30 
                        }
                      }}
                      style={{ x: "-50%" }}
                    />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>
      {/* Bottom safe area padding for mobile devices */}
      <div className="h-2 sm:h-1" />
    </motion.div>
  );
}