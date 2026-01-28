
import { motion } from "framer-motion";
import { HealthMetricsCard } from "@/components/dashboard/health-metrics-card";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingShimmer } from "@/components/ui/loading-shimmer";
import { Heart, Activity, Brain } from "lucide-react";

const mockHealthMetrics = [
  {
    label: "Heart Rate",
    value: 72,
    maxValue: 100,
    status: "good" as const,
    icon: <Heart className="w-4 h-4" />,
    unit: " bpm"
  },
  {
    label: "Sleep Quality", 
    value: 65,
    maxValue: 100,
    status: "warning" as const,
    icon: <Activity className="w-4 h-4" />,
    unit: "%"
  },
  {
    label: "Stress Level",
    value: 30,
    maxValue: 100, 
    status: "good" as const,
    icon: <Brain className="w-4 h-4" />,
    unit: "%"
  }
];

export function HealthMetricsSection() {
  return (
    <motion.section
      className="metrics-section motion-card slide-in"
      id="health-metrics"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <ErrorBoundary 
        fallback={
          <div className="p-8 bg-muted/10 rounded-2xl border border-border/30">
            <LoadingShimmer lines={3} showIcon />
            <p className="text-center text-sm text-muted-foreground mt-4">
              ⚠️ Health data temporarily unavailable
            </p>
          </div>
        }
      >
        <motion.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <HealthMetricsCard 
            metrics={mockHealthMetrics} 
            className="shadow-lg rounded-2xl p-4 border border-border/50 bg-gradient-to-br from-card via-card/95 to-card/90 backdrop-blur-lg" 
          />
        </motion.div>
      </ErrorBoundary>
    </motion.section>
  );
}
