import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PCOSTrackerPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#FEFCF3] p-4">
      <Button variant="ghost" onClick={() => navigate("/tools")}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold mt-4">PCOS Tracker</h1>
      <p className="text-gray-600 mt-2">Coming soon...</p>
    </div>
  );
};

export default PCOSTrackerPage;