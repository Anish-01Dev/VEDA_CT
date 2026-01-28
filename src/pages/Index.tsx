
import { motion, AnimatePresence } from "framer-motion";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { SOSButton } from "@/components/ui/sos-button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bot, Activity, Heart } from "lucide-react";

// Import new components
import { AppTitleBar } from "@/components/layout/app-title-bar";
import { BackgroundElements } from "@/components/layout/background-elements";
import { HeroSection } from "@/components/sections/hero-section";
import { HealthMetricsSection } from "@/components/sections/health-metrics-section";
import { QuickActionsSection } from "@/components/sections/quick-actions-section";
import { SymptomCheckerSection } from "@/components/sections/symptom-checker-section";

import { useNavigate } from "react-router-dom";
import { navItems } from "@/lib/navigation-config";
import ApiTestComponent from "@/components/debug/ApiTestComponent";
import EnhancedSymptomCheckerV2 from "@/components/ai/enhanced-symptom-checker-v2";
import HealthDashboard from "@/components/dashboard/health-dashboard";

gsap.registerPlugin(ScrollTrigger);



const Index = () => {
  useSmoothScroll();
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  // Enhanced animation setup
  useEffect(() => {
    if (mainRef.current) {
      const tl = gsap.timeline();
      
      // Animate the main content sections
      const sections = mainRef.current.querySelectorAll("section");
      const headings = mainRef.current.querySelectorAll("h2");
      
      if (sections.length > 0) {
        tl.fromTo(
          sections,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.2 }
        );
      }
      
      if (headings.length > 0) {
        tl.fromTo(
          headings,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.1 },
          "-=0.3"
        );
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <div className="min-h-screen bg-[#FEFCF3] pb-24 relative overflow-hidden flex flex-col font-inter">
          {/* Dashboard Header at the top */}
          <DashboardHeader currentLanguage="English" />

          <main ref={mainRef} className="flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-10 gap-10">
            {/* Hero Section with Logo */}
            <HeroSection />

            {/* Quick Health Check Section */}
            <section className="w-full bg-[#F8F5F0] rounded-2xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-[#2D3748] font-nunito mb-6">Quick Health Check</h2>
              <QuickActionsSection />
            </section>

            {/* Health Modules Section */}
            <section className="w-full bg-[#F8F5F0] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[#2D3748] font-nunito mb-6">Health Modules</h2>
              <HealthMetricsSection />
            </section>

            {/* Enhanced Features Showcase */}
            <section className="w-full bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 mb-6">
              <h2 className="text-3xl font-bold text-center mb-4 text-[#2D3748] font-nunito">🚀 Enhanced Features</h2>
              <p className="text-xl text-center text-gray-600 mb-8">Experience the next generation of healthcare technology</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-[#2D3748]">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Enhanced Symptom Checker
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Advanced AI-powered symptom analysis with comprehensive medical database, 
                    emergency detection, and personalized treatment recommendations.
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Real-time emergency symptom detection</li>
                    <li>• Comprehensive medical condition database</li>
                    <li>• Severity tracking and duration analysis</li>
                    <li>• Evidence-based treatment recommendations</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold mb-3 flex items-center gap-2 text-[#2D3748]">
                    <Heart className="w-5 h-5 text-red-600" />
                    Health Dashboard
                  </h3>
                  <p className="text-gray-600 mb-3 text-sm">
                    Comprehensive health monitoring with vital signs tracking, 
                    medication management, and predictive analytics.
                  </p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    <li>• Real-time vital signs monitoring</li>
                    <li>• Medication compliance tracking</li>
                    <li>• Health trend analytics</li>
                    <li>• Predictive health insights</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Explore All Features
                </Button>
              </div>
            </section>

            {/* API Test Section - Temporary for debugging */}
            <section className="w-full bg-[#F8F5F0] rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-[#2D3748] font-nunito mb-6">API Connection Test</h2>
              <ApiTestComponent />
            </section>
          </main>

          {/* Perfectly Aligned Circular AI Assistant Button */}
          <motion.div
            className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50"
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
              onClick={() => navigate("/chat")}
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
          </motion.div>

          {/* Bottom Navigation */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <BottomNav items={navItems} />
          </motion.div>
        </div>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

export default Index;
