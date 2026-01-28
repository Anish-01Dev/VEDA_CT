
import { motion } from "framer-motion";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { CardShimmer } from "@/components/ui/loading-shimmer";
import { Activity, Brain, Pill, Camera, FileText, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const quickActions = [
  {
    id: "symptom-check",
    title: "Symptom Check",
    subtitle: "AI-powered diagnosis",
    icon: <Activity className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "primary" as const,
    path: "/health/symptom-checker"
  },
  {
    id: "mental-health",
    title: "Mental Health",
    subtitle: "Talk to AI therapist",
    icon: <Brain className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "health-mental" as const,
    path: "/health/mental-health"
  },
  {
    id: "prescription",
    title: "Scan Medicine",
    subtitle: "Read prescriptions",
    icon: <Pill className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "coral" as const,
    path: "/tools/prescription-scanner"
  },
  {
    id: "first-aid",
    title: "First Aid",
    subtitle: "Visual wound checker", 
    icon: <Camera className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "accent" as const,
    path: "/tools/first-aid"
  },
  {
    id: "health-records",
    title: "Health Records",
    subtitle: "Digital patient files",
    icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "primary" as const,
    path: "/health-records"
  },
  {
    id: "pharmacy",
    title: "Find Medicine",
    subtitle: "Check availability",
    icon: <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />,
    color: "health-mental" as const,
    path: "/pharmacy"
  }
];

export function QuickActionsSection() {
  const navigate = useNavigate();

  const quickActionsWithNav = quickActions.map(action => ({
    ...action,
    onClick: () => navigate(action.path)
  }));

  return (
    <motion.section
      className="actions-section motion-card fade-in-up"
      id="quick-actions"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <ErrorBoundary 
        fallback={
          <div className="p-8 bg-muted/10 rounded-2xl border border-border/30">
            <CardShimmer />
            <p className="text-center text-sm text-muted-foreground mt-4">
              ⚠️ Quick actions temporarily unavailable
            </p>
          </div>
        }
      >
        {/* Section Header */}
        <motion.div 
          className="mb-8 sm:mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4 flex items-center justify-center gap-3">
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🩺
            </motion.span>
            Your Health Toolkit
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto word-wrap leading-relaxed">
            Quick access to AI-powered health services designed for your wellbeing
          </p>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <QuickActions 
            actions={quickActionsWithNav} 
            className="mb-8 sm:mb-12 lg:mb-16" 
          />
        </motion.div>
      </ErrorBoundary>
    </motion.section>
  );
}
