
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { LoadingShimmer } from "@/components/ui/loading-shimmer";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { motion, AnimatePresence } from "framer-motion";
import { EmergencyTriage } from "@/components/ai/emergency-triage";
import { navItems } from "@/lib/navigation-config";

const SymptomCheckerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter relative overflow-hidden">
      {/* Enhanced Header with App Title */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 sm:px-6 py-4 sm:py-5 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/health")}
              className="hover:bg-[#4A9B8E10] min-w-[44px] min-h-[44px] rounded-xl"
            >
              <Heart className="w-5 h-5" />
            </Button>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] font-nunito truncate">
                ✨ Vaidyāna
              </h1>
              <div className="hidden sm:block w-1 h-6 bg-[#E2E8F0] rounded-full" />
              <span className="hidden sm:inline text-sm text-[#4A5568] font-inter font-medium">
                The Healing Intelligence
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#4A5568] font-inter">
              🔍 AI-Powered Symptom Analysis
            </p>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 opacity-5 sm:opacity-10 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-8 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-[#4A9B8E] to-[#68D391] rounded-full blur-2xl" 
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-32 right-8 w-24 h-24 sm:w-36 sm:h-36 bg-gradient-to-br from-[#2A9D8F] to-[#F6E05E] rounded-full blur-2xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 15, 0],
            y: [0, -10, 0],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-[#2A9D8F] to-[#4A9B8E] rounded-full blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            rotate: [0, -90, 0],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4
          }}
        />
      </div>

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto relative z-10">
        <ErrorBoundary 
          fallback={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <LoadingShimmer lines={4} showIcon />
              <p className="text-[#4A5568] mt-4 text-base font-inter">
                ⚠️ Unable to load symptom checker. Please refresh the page.
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4 min-h-[44px] border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748] font-semibold"
              >
                Refresh Page
              </Button>
            </motion.div>
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-8 sm:space-y-10"
          >
            {/* Enhanced Instructions */}
            <motion.div 
              className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-lg"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748] font-nunito mb-4 flex items-center gap-3">
                💡 How Vaidyāna Works
              </h2>
              <div className="grid gap-4 text-base sm:text-lg text-[#4A5568] font-inter">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#68D39120] rounded-full flex items-center justify-center text-sm font-bold text-[#68D391]">1</span>
                  <span>Describe your symptoms in detail using voice or text</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#68D39120] rounded-full flex items-center justify-center text-sm font-bold text-[#68D391]">2</span>
                  <span>AI analyzes your input for possible conditions</span>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-[#68D39120] rounded-full flex items-center justify-center text-sm font-bold text-[#68D391]">3</span>
                  <span>Get personalized recommendations and triage guidance</span>
                </div>
              </div>
            </motion.div>

            {/* Emergency Triage Component */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-[#E2E8F0] rounded-3xl shadow-lg overflow-hidden p-6"
            >
              <EmergencyTriage />
            </motion.div>


            {/* Enhanced Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#F8F5F0] border border-[#F6E05E]/30 rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[#F6E05E20] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-[#F6E05E] text-lg">⚠️</span>
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#2D3748] font-nunito">
                    Important Disclaimer
                  </h3>
                  <div className="space-y-2 text-sm text-[#4A5568] font-inter leading-relaxed">
                    <p>
                      This AI symptom checker is designed to provide general health information and guidance only. 
                      It is not a substitute for professional medical advice, diagnosis, or treatment.
                    </p>
                    <p>
                      <strong>Always consult with a qualified healthcare provider</strong> for any medical concerns, 
                      especially if you experience severe symptoms, persistent issues, or have underlying health conditions.
                    </p>
                    <p>
                      In case of emergency, call your local emergency services immediately.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </ErrorBoundary>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default SymptomCheckerPage;
