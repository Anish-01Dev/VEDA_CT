import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HealthPage from "./pages/HealthPage";
import ChatPage from "./pages/ChatPage";
import MapPage from "./pages/MapPage";
import ToolsPage from "./pages/ToolsPage";
import FirstAidPage from "./pages/tools/FirstAidPage";
import FirstAidAdvisorPage from "./pages/FirstAidAdvisorPage";
import HealthRecordsPage from "./pages/HealthRecordsPage";
import PharmacyPage from "./pages/PharmacyPage";

import SymptomCheckerPage from "./pages/health/SymptomCheckerPage";
import MentalHealthPage from "./pages/health/MentalHealthPage";
import SleepHealthPage from "./pages/health/SleepHealthPage";
import DietAdvisorPage from "./pages/health/DietAdvisorPage";
import VaccineTrackerPage from "./pages/health/VaccineTrackerPage";
import CognitiveHealthPage from "./pages/health/CognitiveHealthPage";
import LabAnalysisPage from "./pages/health/LabAnalysisPage";
import SOSPage from "./pages/SOSPage";
import HealthHabitCoachPage from "./pages/tools/HealthHabitCoachPage";
import PCOSTrackerPage from "./pages/tools/PCOSTrackerPage";
import MaternalHealthAdvisorPage from "./pages/tools/MaternalHealthAdvisorPage";
import MisinformationBusterPage from "./pages/tools/MisinformationBusterPage";
import PrescriptionScannerPage from "./pages/tools/PrescriptionScannerPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/health/symptom-checker" element={<SymptomCheckerPage />} />
          <Route path="/health/mental-health" element={<MentalHealthPage />} />
          <Route path="/health/sleep-analyzer" element={<SleepHealthPage />} />
          <Route path="/health/diet-advisor" element={<DietAdvisorPage />} />
          <Route path="/health/vaccine-tracker" element={<VaccineTrackerPage />} />
          <Route path="/health/cognitive-health" element={<CognitiveHealthPage />} />
          <Route path="/health/lab-analysis" element={<LabAnalysisPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/first-aid" element={<FirstAidAdvisorPage />} />
          <Route path="/tools/lab-analysis" element={<LabAnalysisPage />} />
          <Route path="/tools/health-habit-coach" element={<HealthHabitCoachPage />} />
          <Route path="/tools/pcos-tracker" element={<PCOSTrackerPage />} />
          <Route path="/tools/maternal-health-advisor" element={<MaternalHealthAdvisorPage />} />
          <Route path="/tools/misinformation-buster" element={<MisinformationBusterPage />} />
          <Route path="/tools/prescription-scanner" element={<PrescriptionScannerPage />} />
          <Route path="/health-records" element={<HealthRecordsPage />} />
          <Route path="/pharmacy" element={<PharmacyPage />} />
          <Route path="/sos" element={<SOSPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
