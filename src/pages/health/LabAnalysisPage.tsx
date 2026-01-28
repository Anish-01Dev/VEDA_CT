import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { motion } from "framer-motion";
import { LabAI } from "@/components/ai/lab-ai";
import { navItems } from "@/lib/navigation-config";

const LabAnalysisPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter relative overflow-hidden">
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 sm:px-6 py-4 sm:py-5 shadow-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/health")}
            className="hover:bg-[#4A9B8E10] min-w-[44px] min-h-[44px] rounded-xl"
          >
            <Heart className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2D3748] font-nunito">
              🧪 Lab Report Analyzer
            </h1>
            <p className="text-sm sm:text-base text-[#4A5568] font-inter">
              AI-Powered Medical Report Analysis
            </p>
          </div>
        </div>
      </motion.header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LabAI />
        </motion.div>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default LabAnalysisPage;