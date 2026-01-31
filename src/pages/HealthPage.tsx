import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Activity, Brain, Heart, Stethoscope, Users, Calendar, AlertCircle, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { HealthMetricsCard } from "@/components/dashboard/health-metrics-card";
import { navItems } from "@/lib/navigation-config";
import { useLanguage } from "@/contexts/language-context";



const HealthPage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const healthFeatures = [
    {
      id: "symptom-checker",
      title: t('ai.symptom.checker'),
      description: t('get.ai.powered.analysis'),
      icon: <Stethoscope className="w-6 h-6" />,
      color: "primary",
      path: "/health/symptom-checker",
      status: t('available')
    },
    {
      id: "mental-health",
      title: t('mental.health.assistant'),
      description: t('talk.to.ai.therapist'),
      icon: <Brain className="w-6 h-6" />,
      color: "health-mental",
      path: "/health/mental-health",
      status: t('available')
    },
    {
      id: "sleep-health",
      title: t('sleep.health.analyzer'),
      description: t('track.analyze.sleep'),
      icon: <Activity className="w-6 h-6" />,
      color: "accent",
      path: "/health/sleep-analyzer",
      status: t('available')
    },
    {
      id: "diet-advisor",
      title: t('diet.advisor'),
      description: t('personalized.nutrition.advice'),
      icon: <Heart className="w-6 h-6" />,
      color: "health-good",
      path: "/health/diet-advisor",
      status: t('available')
    },
    {
      id: "vaccine-tracker",
      title: t('child.vaccine.tracker'),
      description: t('track.vaccination.schedules'),
      icon: <Heart className="w-6 h-6" />,
      color: "health-mental",
      path: "/health/vaccine-tracker",
      status: t('available')
    },
    {
      id: "cognitive-health",
      title: t('cognitive.health.screener'),
      description: t('monitor.cognitive.function'),
      icon: <Brain className="w-6 h-6" />,
      color: "accent",
      path: "/health/cognitive-health",
      status: t('available')
    },
    {
      id: "lab-analysis",
      title: t('report.analysis'),
      description: t('ai.powered.lab.analysis'),
      icon: <Activity className="w-6 h-6" />,
      color: "health-good",
      path: "/health/lab-analysis",
      status: t('available')
    }
  ];

  const mockHealthMetrics = [
    {
      label: t('heart.rate'),
      value: 72,
      maxValue: 100,
      status: "good" as const,
      icon: <Heart className="w-4 h-4" />,
      unit: " bpm"
    },
    {
      label: t('sleep.quality'),
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

  const FEATURE_COLOR_MAP = {
    'symptom-checker': { color: '#68D391', bg: '#68D39120' },
    'mental-health': { color: '#2A9D8F', bg: '#2A9D8F20' },
    'sleep-health': { color: '#2A9D8F', bg: '#2A9D8F20' },
    'diet-advisor': { color: '#F6E05E', bg: '#F6E05E20' },
    'vaccine-tracker': { color: '#3182CE', bg: '#3182CE20' },
    'cognitive-health': { color: '#4A9B8E', bg: '#4A9B8E20' },
    'lab-analysis': { color: '#68D391', bg: '#68D39120' },
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-3 sm:px-4 py-3 sm:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="hover:bg-[#4A9B8E10]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#2D3748] font-nunito">{t('health.dashboard')}</h1>
            <p className="text-sm text-[#4A5568] font-inter">{t('your.complete.health.overview')}</p>
          </div>
        </div>
      </motion.header>

      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-8 max-w-7xl mx-auto">
        {/* Health Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <HealthMetricsCard metrics={mockHealthMetrics} />
        </motion.section>

        {/* Health Features */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito">{t('health.features')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:gap-4">
                {healthFeatures.map((feature, index) => {
                  const colorInfo = FEATURE_COLOR_MAP[feature.id] || { color: '#4A9B8E', bg: '#4A9B8E20' };
                  return (
                    <motion.div
                      key={feature.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-xl card-hover transition-all duration-300 bg-white border border-[#E2E8F0]"
                        onClick={() => navigate(feature.path)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div style={{ backgroundColor: colorInfo.bg, color: colorInfo.color }} className="p-2 rounded-lg">
                              {feature.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-base text-[#2D3748] font-nunito truncate">
                                  {feature.title}
                                </h3>
                                <Badge 
                                  variant="default"
                                  className="text-xs ml-2 flex-shrink-0 bg-[#38A169] text-white"
                                >
                                  {t('available')}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                                {feature.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default HealthPage;