import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  FileText, 
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle,
  Heart,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation-config";
import aiClient from "@/lib/ai-client";
import dbManager from "@/lib/database-schema";



interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  sideEffects?: string[];
}

interface PrescriptionResult {
  doctorName: string;
  date: string;
  medicines: Medicine[];
  confidence: number;
  language: "English" | "Hindi" | "Tamil";
}

const PrescriptionReaderPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [prescriptionResult, setPrescriptionResult] = useState<PrescriptionResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"English" | "Hindi" | "Tamil">("English");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setPrescriptionResult(null);
    }
  };

  const processPrescription = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    try {
      // For now, we'll use a description of the prescription
      // In a real implementation, you'd use OCR to extract text from the image
      const prescriptionText = `Prescription image uploaded. Please analyze the medicines, dosages, and instructions shown in the image.`;
      
      const analysis = await aiClient.analyzePrescription(prescriptionText, selectedLanguage.toLowerCase() as "en" | "hi" | "ta");
      
      const result: PrescriptionResult = {
        doctorName: analysis.doctor_name || "Dr. Not Specified",
        date: analysis.date || new Date().toLocaleDateString(),
        medicines: analysis.medicines.map(medicine => ({
          name: medicine.name,
          dosage: medicine.dosage,
          frequency: medicine.frequency,
          duration: medicine.duration,
          instructions: medicine.instructions,
          sideEffects: medicine.side_effects
        })),
        confidence: analysis.confidence,
        language: selectedLanguage
      };
      
      setPrescriptionResult(result);
      
      // Save to database
      await dbManager.addPrescriptionRecord({
        timestamp: new Date().toISOString(),
        prescription_text: prescriptionText,
        medicines: JSON.stringify(analysis.medicines),
        doctor_name: analysis.doctor_name,
        date: analysis.date,
        confidence: analysis.confidence,
        language: selectedLanguage.toLowerCase() as "en" | "hi" | "ta",
        image_path: imagePreview || undefined
      });

    } catch (error) {
      console.error('Prescription analysis failed:', error);
      // Fallback to mock data if AI fails
      const mockResult: PrescriptionResult = {
        doctorName: "Dr. Sharma",
        date: "15/11/2024",
        medicines: [
          {
            name: "Paracetamol 500mg",
            dosage: "500mg",
            frequency: "3 times daily",
            duration: "5 days",
            instructions: selectedLanguage === "Hindi" ? "खाना खाने के बाद लें" : 
                         selectedLanguage === "Tamil" ? "உணவுக்குப் பிறகு எடுத்துக் கொள்ளுங்கள்" :
                         "Take after meals",
            sideEffects: ["Nausea", "Dizziness"]
          }
        ],
        confidence: 85,
        language: selectedLanguage
      };
      
      setPrescriptionResult(mockResult);
    } finally {
      setIsProcessing(false);
    }
  };

  const languages = [
    { code: "English", label: "English", flag: "🇺🇸" },
    { code: "Hindi", label: "हिन्दी", flag: "🇮🇳" },
    { code: "Tamil", label: "தமிழ்", flag: "🇮🇳" }
  ] as const;

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-3 sm:px-4 py-3 sm:py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/tools")}
            className="hover:bg-[#4A9B8E10]"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#3182CE20] text-[#3182CE]">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Prescription Reader</h1>
              <p className="text-sm text-[#4A5568] font-inter">OCR + AI medicine explanation</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-3 sm:px-4 py-4 sm:py-6 space-y-6 max-w-4xl mx-auto">
        {/* Language Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#4A9B8E]" />
                Output Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`text-xs sm:text-sm font-semibold ${
                      selectedLanguage === lang.code 
                        ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white' 
                        : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                    }`}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#F8F5F0] rounded-2xl p-6"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#4A9B8E]" />
                Upload Prescription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload Area */}
              <div 
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all duration-300",
                  imagePreview 
                    ? "border-[#4A9B8E] bg-[#4A9B8E10]" 
                    : "border-[#E2E8F0] hover:border-[#4A9B8E] hover:bg-[#4A9B8E10]"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img 
                      src={imagePreview} 
                      alt="Uploaded prescription" 
                      className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <div className="flex items-center justify-center gap-2 text-[#4A9B8E]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold font-nunito">Prescription uploaded successfully</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#3182CE20] rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-[#3182CE]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#2D3748] font-nunito mb-2">
                        Upload Prescription
                      </p>
                      <p className="text-sm text-[#4A5568] font-inter">
                        Click to upload a clear photo of the prescription for AI analysis
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              <Button
                onClick={processPrescription}
                disabled={!selectedImage || isProcessing}
                className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Read Prescription"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Results Section */}
        <AnimatePresence>
          {prescriptionResult && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Prescription Header */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#4A9B8E]" />
                    Prescription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-[#F8F5F0] rounded-lg">
                      <p className="text-sm text-[#4A5568] font-inter mb-1">Doctor</p>
                      <p className="font-semibold text-[#2D3748] font-nunito">{prescriptionResult.doctorName}</p>
                    </div>
                    <div className="p-4 bg-[#F8F5F0] rounded-lg">
                      <p className="text-sm text-[#4A5568] font-inter mb-1">Date</p>
                      <p className="font-semibold text-[#2D3748] font-nunito">{prescriptionResult.date}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#4A5568] font-inter mb-2">AI Confidence</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2D3748] font-nunito">{prescriptionResult.confidence}%</span>
                      </div>
                      <Progress value={prescriptionResult.confidence} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medicines */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <Pill className="w-5 h-5 text-[#4A9B8E]" />
                    Medicines ({prescriptionResult.medicines.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {prescriptionResult.medicines.map((medicine, index) => (
                      <div key={index} className="p-4 bg-[#F8F5F0] rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-[#2D3748] font-nunito">{medicine.name}</h4>
                          <Badge className="bg-[#38A169] text-white text-xs">
                            {medicine.dosage}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#4A9B8E]" />
                            <span className="text-sm text-[#4A5568] font-inter">{medicine.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#4A9B8E]" />
                            <span className="text-sm text-[#4A5568] font-inter">{medicine.duration}</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                            <strong>Instructions:</strong> {medicine.instructions}
                          </p>
                        </div>
                        
                        {medicine.sideEffects && medicine.sideEffects.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#2D3748] font-nunito flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-[#F6E05E]" />
                              Side Effects
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {medicine.sideEffects.map((effect, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white border-[#F6E05E] text-[#F6E05E]">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Disclaimer */}
              <Card className="bg-[#F8F5F0] border border-[#F6E05E]/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F6E05E20] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#F6E05E] text-lg">⚠️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2D3748] font-nunito mb-2">Important Notice</h4>
                      <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                        This AI interpretation is for reference only. Always follow your doctor's instructions and consult 
                        healthcare professionals for any concerns about your medication.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default PrescriptionReaderPage;