import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: "primary" | "coral" | "accent" | "health-mental";
  onClick: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

const ACTION_COLOR_MAP = {
  'symptom-check': { color: '#68D391', bg: '#68D39120' },
  'mental-health': { color: '#2A9D8F', bg: '#2A9D8F20' },
  'prescription': { color: '#3182CE', bg: '#3182CE20' },
  'first-aid': { color: '#F4A261', bg: '#F4A26120' },
};

export function QuickActions({ actions, className }: QuickActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Null check to prevent runtime errors
  if (!actions || !Array.isArray(actions) || actions.length === 0) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <p className="text-muted-foreground text-sm">No quick actions available</p>
      </Card>
    );
  }

  useEffect(() => {
    if (containerRef.current && containerRef.current.children.length > 0) {
      // GSAP scroll-triggered animations
      const children = Array.from(containerRef.current.children);
      if (children.length > 0) {
        try {
          gsap.fromTo(
            children,
            {
              y: 60,
              opacity: 0,
              scale: 0.8,
              rotateX: 30
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotateX: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "back.out(1.7)",
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 80%",
                end: "bottom 20%",
                toggleActions: "play none none reverse"
              }
            }
          );
        } catch (error) {
          console.warn('GSAP animation failed:', error);
        }
      }
    }
  }, []);

  return (
    <div ref={containerRef} className={cn("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4", className)}>
      {actions.map((action, index) => {
        const colorInfo = ACTION_COLOR_MAP[action.id] || { color: '#4A9B8E', bg: '#4A9B8E20' };
        return (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
            whileHover={{ 
              scale: 1.05,
              rotateY: 5,
              transition: { duration: 0.2 }
            }}
            whileTap={{ 
              scale: 0.95,
              rotateY: 0,
              transition: { duration: 0.1 }
            }}
            className="w-full"
          >
            <Card 
              className={cn(
                "cursor-pointer overflow-hidden border border-border shadow-card hover:shadow-float transition-all duration-300 h-full bg-white",
                "transform-gpu perspective-1000 group"
              )}
              onClick={action.onClick}
            >
              <CardContent className="p-4 space-y-2 relative h-full flex flex-col justify-between min-h-[100px] sm:min-h-[120px]">
                {/* Header with icon and indicator */}
                <div className="flex items-center justify-between relative z-10">
                  <div style={{ backgroundColor: colorInfo.bg, color: colorInfo.color }} className="text-xl sm:text-2xl opacity-90 flex-shrink-0 p-2 rounded-full">
                    {action.icon}
                  </div>
                  <div 
                    className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                    style={{ backgroundColor: colorInfo.color, opacity: 0.3 }}
                  />
                </div>
                {/* Content */}
                <div className="relative z-10 flex-1 flex flex-col justify-end">
                  <h3 className="font-semibold text-base text-[#2D3748] leading-tight font-nunito mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[#4A5568] opacity-80 leading-tight font-inter">
                    {action.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}