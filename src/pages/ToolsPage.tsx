import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Camera, 
  Pill, 
  Baby, 
  Moon, 
  Apple, 
  Brain,
  Heart,
  Activity,
  Users,
  Calendar,
  Stethoscope,
  AlertCircle,
  MessageCircle,
  Book,
  Smile,
  Mic,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";

const healthTools = [
  {
    id: "first-aid",
    title: "Visual First-Aid Advisor",
    description: "Upload injury photos for AI-powered first-aid guidance",
    icon: <Camera className="w-6 h-6" />,
    color: "accent",
    path: "/tools/first-aid",
    status: "Available",
    category: "Emergency"
  },
  {
    id: "report-analysis",
    title: "Report Analysis",
    description: "AI-powered analysis of lab reports and medical documents",
    icon: <Activity className="w-6 h-6" />,
    color: "coral",
    path: "/tools/lab-analysis",
    status: "Available",
    category: "Medical"
  },
  {
    id: "prescription-scanner",
    title: "Prescription Scanner",
    description: "Scan prescription images and extract medicine names",
    icon: <Pill className="w-6 h-6" />,
    color: "coral",
    path: "/tools/prescription-scanner",
    status: "Available",
    category: "Medical"
  },
  {
    id: "sleep-analyzer",
    title: "Sleep Health Analyzer",
    description: "Track and improve your sleep patterns",
    icon: <Moon className="w-6 h-6" />,
    color: "primary",
    path: "/health/sleep-analyzer",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "diet-advisor",
    title: "NutriGuide - AI Diet Coach",
    description: "Upload food photos for calorie analysis & personalized meal plans",
    icon: <Apple className="w-6 h-6" />,
    color: "health-good",
    path: "/health/diet-advisor",
    status: "Available",
    category: "Nutrition"
  },
  {
    id: "child-tracker",
    title: "Child Vaccine Tracker",
    description: "Track vaccination schedules and growth milestones",
    icon: <Baby className="w-6 h-6" />,
    color: "health-mental",
    path: "/health/vaccine-tracker",
    status: "Available",
    category: "Pediatric"
  },
  {
    id: "cognitive-screener",
    title: "Cognitive Health Screener",
    description: "Monitor cognitive function with brain games",
    icon: <Brain className="w-6 h-6" />,
    color: "accent",
    path: "/health/cognitive-health",
    status: "Available",
    category: "Mental Health"
  },
  {
    id: "health-habit-coach",
    title: "Health Habit Coach",
    description: "3-day personalized health challenges based on mood/symptoms",
    icon: <Smile className="w-6 h-6" />,
    color: "#A3E635",
    path: "/tools/health-habit-coach",
    status: "Available",
    category: "Wellness"
  },
  {
    id: "pcos-tracker",
    title: "Period & PCOS Symptom Tracker",
    description: "Log period, acne, fatigue, cramps. AI checks for PCOS risk & suggests fixes.",
    icon: <Calendar className="w-6 h-6" />,
    color: "#FBBF24",
    path: "/tools/pcos-tracker",
    status: "Available",
    category: "Tracking"
  },
  {
    id: "maternal-health-advisor",
    title: "Maternal Health Advisor",
    description: "Pregnancy risk checker with voice/text input & local language support.",
    icon: <Mic className="w-6 h-6" />,
    color: "#F472B6",
    path: "/tools/maternal-health-advisor",
    status: "Available",
    category: "Health"
  },
  {
    id: "misinformation-buster",
    title: "Medical Misinformation Buster",
    description: "Verify health claims from links or text. AI checks truth & sources.",
    icon: <Book className="w-6 h-6" />,
    color: "#60A5FA",
    path: "/tools/misinformation-buster",
    status: "Available",
    category: "Education"
  },
];

const categories = ["All", "Emergency", "Medical", "Wellness", "Nutrition", "Pediatric", "Mental Health"];

const TOOL_COLOR_MAP = {
  'first-aid': { color: '#F4A261', bg: '#F4A26120' }, // Visual First Aid
  'report-analysis': { color: '#3182CE', bg: '#3182CE20' }, // Report Analysis
  'prescription-scanner': { color: '#8B5CF6', bg: '#8B5CF620' }, // Prescription Scanner
  'sleep-analyzer': { color: '#2A9D8F', bg: '#2A9D8F20' }, // Sleep Analyzer
  'diet-advisor': { color: '#F6E05E', bg: '#F6E05E20' }, // NutriGuide
  'child-tracker': { color: '#3182CE', bg: '#3182CE20' }, // Child Vaccine Tracker
  'cognitive-screener': { color: '#4A9B8E', bg: '#4A9B8E20' }, // Cognitive Health Screener
  'health-habit-coach': { color: '#A3E635', bg: '#A3E63520' },
  'pcos-tracker': { color: '#FBBF24', bg: '#FBBF2420' },
  'maternal-health-advisor': { color: '#F472B6', bg: '#F472B620' },
  'misinformation-buster': { color: '#60A5FA', bg: '#60A5FA20' },
};

const ToolsPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTools = healthTools.filter(tool => 
    selectedCategory === "All" || tool.category === selectedCategory
  );

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
            <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Health Tools</h1>
            <p className="text-sm text-[#4A5568] font-inter">AI-powered healthcare utilities</p>
          </div>
        </div>
      </motion.header>

      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-8 max-w-7xl mx-auto">
        {/* Category Filters */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`text-xs sm:text-sm font-semibold ${
                  selectedCategory === category 
                    ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white' 
                    : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.section>

        {/* Tools Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito">
                Available Tools ({filteredTools.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTools.map((tool, index) => {
                  const colorInfo = TOOL_COLOR_MAP[tool.id] || { color: '#4A9B8E', bg: '#4A9B8E20' };
                  return (
                    <motion.div
                      key={tool.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className="cursor-pointer hover:shadow-xl transition-all duration-300 h-full bg-white border border-[#E2E8F0]"
                        onClick={() => navigate(tool.path)}
                      >
                        <CardContent className="p-4 space-y-3 h-full flex flex-col">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div style={{ backgroundColor: colorInfo.bg, color: colorInfo.color }} className="p-2 rounded-lg">
                              {tool.icon}
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge 
                                variant="default"
                                className="text-xs bg-[#38A169] text-white"
                              >
                                Available
                              </Badge>
                              <Badge variant="outline" className="text-xs border-[#E2E8F0] text-[#4A5568] bg-white">
                                {tool.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-base text-[#2D3748] leading-tight font-nunito">
                              {tool.title}
                            </h3>
                            <p className="text-sm text-[#4A5568] leading-relaxed font-inter">
                              {tool.description}
                            </p>
                          </div>

                          {/* Footer */}
                          <div className="pt-2 border-t border-[#E2E8F0]">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs bg-[#F8F5F0] hover:bg-[#4A9B8E20] text-[#2D3748] font-semibold"
                            >
                              Launch Tool
                            </Button>
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

        {/* Quick Access */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#4A9B8E]" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button 
                  variant="outline" 
                  className="justify-start text-left h-auto p-4 border-[#E2E8F0] hover:bg-[#F8F5F0]"
                  onClick={() => navigate("/health/symptom-checker")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#68D39120] text-[#68D391]">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#2D3748] font-nunito">Symptom Checker</p>
                      <p className="text-xs text-[#4A5568] font-inter">Quick health assessment</p>
                    </div>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="justify-start text-left h-auto p-4 border-[#E2E8F0] hover:bg-[#F8F5F0]"
                  onClick={() => navigate("/health/mental-health")}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#2A9D8F20] text-[#2A9D8F]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-[#2D3748] font-nunito">Mental Health</p>
                      <p className="text-xs text-[#4A5568] font-inter">AI therapy support</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default ToolsPage;