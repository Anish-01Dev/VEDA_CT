import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HealthMetric {
  label: string;
  value: number;
  maxValue: number;
  status: "good" | "warning" | "critical";
  icon: React.ReactNode;
  unit?: string;
}

interface HealthMetricsCardProps {
  metrics: HealthMetric[];
  className?: string;
}

const statusColorMap = {
  good: { color: '#68D391', text: '#38A169', bg: '#68D39120' },
  warning: { color: '#F6E05E', text: '#D69E2E', bg: '#F6E05E20' },
  critical: { color: '#E53E3E', text: '#E53E3E', bg: '#E53E3E20' },
};

export function HealthMetricsCard({ metrics, className }: HealthMetricsCardProps) {
  // Null check to prevent runtime errors
  if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
    return (
      <Card className={cn("overflow-hidden shadow-card border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm", className)}>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground text-sm">No health metrics available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden shadow-card border-[#E2E8F0] bg-white", className)}>
      <CardHeader className="pb-3 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardTitle className="text-base sm:text-lg font-bold text-[#2D3748] flex items-center gap-2 font-nunito">
            <motion.div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#4A9B8E' }}
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity 
              }}
            />
            Health Overview
          </CardTitle>
        </motion.div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid gap-3 sm:gap-4">
          {metrics.map((metric, index) => {
            const status = statusColorMap[metric.status] || statusColorMap.good;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 4px 20px -4px rgba(74,155,142,0.10)"
                }}
                className="space-y-2 p-3 rounded-lg border border-[#E2E8F0] bg-white transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-2 rounded-full" style={{ backgroundColor: status.bg, color: status.color }}>
                      {metric.icon}
                    </div>
                    <span className="text-base font-semibold text-[#2D3748] font-nunito">
                      {metric.label}
                    </span>
                  </div>
                  <span 
                    className="text-base font-bold font-nunito"
                    style={{ color: status.text }}
                  >
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#718096] font-inter">Progress</span>
                    <span className="text-[#718096] font-inter">
                      {Math.round((metric.value / metric.maxValue) * 100)}%
                    </span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.8 }}
                    className="origin-left"
                  >
                    <Progress 
                      value={(metric.value / metric.maxValue) * 100} 
                      className="h-2 sm:h-2.5 bg-[#E2E8F0]"
                      style={{ backgroundColor: status.bg }}
                    />
                  </motion.div>
                </div>
                {/* Status indicator */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="capitalize font-medium font-inter" style={{ color: status.text }}>
                      {metric.status}
                    </span>
                  </div>
                  <span className="text-[#718096] font-inter">
                    Target: {metric.maxValue}{metric.unit}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* Overall health score */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 rounded-lg border border-[#E2E8F0] bg-[#F8F5F0]"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#2D3748] font-inter">Overall Health Score</span>
            <span className="text-lg font-bold text-[#4A9B8E] font-nunito">
              {Math.round((metrics || []).reduce((acc, m) => acc + (m.value / m.maxValue), 0) / (metrics?.length || 1) * 100)}%
            </span>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}