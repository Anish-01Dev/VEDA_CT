import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FirstAidAdvisor from "@/components/ai/first-aid-advisor";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";

const FirstAidAdvisorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FEFCF3]">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 max-w-7xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tools")}
            className="hover:bg-[#4A9B8E10]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#2D3748] font-nunito">First Aid Advisor</h1>
            <p className="text-sm text-[#4A5568] font-inter">AI-powered wound analysis and treatment guidance</p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="pb-20">
        <FirstAidAdvisor />
      </main>

      {/* Bottom Navigation */}
      <BottomNav items={navItems} />
    </div>
  );
};

export default FirstAidAdvisorPage;