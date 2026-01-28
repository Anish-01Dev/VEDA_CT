import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Camera, 
  Upload, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Heart,
  Brain,
  Clock,
  Shield,
  Globe
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { cn } from "@/lib/utils";
import { navItems } from "@/lib/navigation-config";
import aiClient, { FirstAidAnalysis } from "@/lib/ai-client";
import dbManager from "@/lib/database-schema";

const FirstAidPage = () => {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<FirstAidAnalysis | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "ta">("en");
  const [error, setError] = useState<string | null>(null);
  const [imageDescription, setImageDescription] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysisResult(null);
      setError(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage && !imageDescription.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Use image description or generate one from the image
      const description = imageDescription.trim() || 
        `Analyze this injury image for first aid guidance. Describe what you see in detail.`;
      
      const analysis = await aiClient.analyzeFirstAid(description, selectedLanguage);
      setAnalysisResult(analysis);

      // Save to database
      await dbManager.addAISession({
        timestamp: new Date().toISOString(),
        session_type: 'first_aid',
        user_input: description,
        ai_response: JSON.stringify(analysis),
        confidence: analysis.confidence,
        language: selectedLanguage,
        offline_mode: !aiClient.getConnectivityStatus()
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const severityColors = {
    mild: "bg-green-500 text-white",
    moderate: "bg-yellow-500 text-white",
    severe: "bg-orange-500 text-white",
    critical: "bg-red-600 text-white"
  };

  const severityLabels = {
    mild: { en: "Mild", hi: "हल्का", ta: "லேசான" },
    moderate: { en: "Moderate", hi: "मध्यम", ta: "மிதமான" },
    severe: { en: "Severe", hi: "गंभीर", ta: "கடுமையான" },
    critical: { en: "Critical", hi: "आपातकालीन", ta: "முக்கியமான" }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 py-4"
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
            <div className="p-2 rounded-lg bg-[#E53E3E20] text-[#E53E3E]">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">First Aid Advisor</h1>
              <p className="text-sm text-[#4A5568] font-inter">AI-powered injury analysis & treatment guidance</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 space-y-6 max-w-4xl mx-auto">
        {/* Language Selection */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#4A9B8E]" />
                Analysis Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={selectedLanguage === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.code as "en" | "hi" | "ta")}
                    className={`text-xs sm:text-sm font-semibold ${
                      selectedLanguage === lang.code 
                        ? 'bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white' 
                        : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                    }`}
                  >
                    <span className="mr-1">{lang.flag}</span>
                    {lang.name}
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
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#4A9B8E]" />
                {selectedLanguage === 'hi' ? "चोट की तस्वीर अपलोड करें" :
                 selectedLanguage === 'ta' ? "காயத்தின் புகைப்படத்தை பதிவேற்றவும்" :
                 "Upload Injury Photo"}
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
                      alt="Uploaded injury" 
                      className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <div className="flex items-center justify-center gap-2 text-[#4A9B8E]">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-semibold font-nunito">
                        {selectedLanguage === 'hi' ? "तस्वीर सफलतापूर्वक अपलोड की गई" :
                         selectedLanguage === 'ta' ? "புகைப்படம் வெற்றிகரமாக பதிவேற்றப்பட்டது" :
                         "Image uploaded successfully"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-[#E53E3E20] rounded-full flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-[#E53E3E]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#2D3748] font-nunito mb-2">
                        {selectedLanguage === 'hi' ? "चोट की तस्वीर अपलोड करें" :
                         selectedLanguage === 'ta' ? "காயத்தின் புகைப்படத்தை பதிவேற்றவும்" :
                         "Upload Injury Photo"}
                      </p>
                      <p className="text-sm text-[#4A5568] font-inter">
                        {selectedLanguage === 'hi' ? "AI विश्लेषण के लिए चोट की स्पष्ट तस्वीर अपलोड करें" :
                         selectedLanguage === 'ta' ? "AI பகுப்பாய்வுக்கான காயத்தின் தெளிவான புகைப்படத்தை பதிவேற்றவும்" :
                         "Upload a clear photo of the injury for AI analysis"}
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

              {/* Manual Description Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-[#2D3748]">
                  {selectedLanguage === 'hi' ? "या चोट का विवरण लिखें:" :
                   selectedLanguage === 'ta' ? "அல்லது காயத்தின் விளக்கத்தை எழுதுங்கள்:" :
                   "Or describe the injury:"}
                </label>
                <Textarea
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                  placeholder={
                    selectedLanguage === 'hi' ? "चोट का विस्तृत विवरण दें (स्थान, प्रकार, गंभीरता, आदि)..." :
                    selectedLanguage === 'ta' ? "காயத்தின் விரிவான விளக்கத்தை கொடுங்கள் (இடம், வகை, தீவிரம், முதலியன)..." :
                    "Describe the injury in detail (location, type, severity, etc.)..."
                  }
                  className="min-h-[100px] resize-none border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  disabled={isAnalyzing}
                />
              </div>

              <Button
                onClick={analyzeImage}
                disabled={(!selectedImage && !imageDescription.trim()) || isAnalyzing}
                className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
              >
                {isAnalyzing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {selectedLanguage === 'hi' ? "विश्लेषण कर रहा है..." :
                     selectedLanguage === 'ta' ? "பகுப்பாய்வு செய்கிறேன்..." :
                     "Analyzing..."}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    {selectedLanguage === 'hi' ? "चोट का विश्लेषण करें" :
                     selectedLanguage === 'ta' ? "காயத்தை பகுப்பாய்வு செய்யுங்கள்" :
                     "Analyze Injury"}
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.section>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <h4 className="font-semibold text-red-800">Analysis Failed</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {analysisResult && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Injury Analysis */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <Eye className="w-5 h-5 text-[#4A9B8E]" />
                    {selectedLanguage === 'hi' ? "चोट विश्लेषण" :
                     selectedLanguage === 'ta' ? "காய பகுப்பாய்வு" :
                     "Injury Analysis"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-4 bg-[#F8F5F0] rounded-lg">
                      <p className="text-sm text-[#4A5568] font-inter mb-1">
                        {selectedLanguage === 'hi' ? "चोट का प्रकार" :
                         selectedLanguage === 'ta' ? "காயத்தின் வகை" :
                         "Injury Type"}
                      </p>
                      <p className="font-semibold text-[#2D3748] font-nunito">{analysisResult.injury_type}</p>
                    </div>
                    <div className="p-4 bg-[#F8F5F0] rounded-lg">
                      <p className="text-sm text-[#4A5568] font-inter mb-1">
                        {selectedLanguage === 'hi' ? "गंभीरता" :
                         selectedLanguage === 'ta' ? "தீவிரம்" :
                         "Severity"}
                      </p>
                      <Badge className={`${severityColors[analysisResult.severity]} text-xs`}>
                        {severityLabels[analysisResult.severity][selectedLanguage]}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-[#4A5568] font-inter mb-2">
                      {selectedLanguage === 'hi' ? "AI आत्मविश्वास" :
                       selectedLanguage === 'ta' ? "AI நம்பிக்கை" :
                       "AI Confidence"}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2D3748] font-nunito">{analysisResult.confidence}%</span>
                      </div>
                      <Progress value={analysisResult.confidence} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Immediate Actions */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-[#F6E05E]" />
                    {selectedLanguage === 'hi' ? "तत्काल कार्रवाई" :
                     selectedLanguage === 'ta' ? "உடனடி நடவடிக்கைகள்" :
                     "Immediate Actions"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.immediate_actions.map((action, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F6E05E10] rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#F6E05E20] rounded-full flex items-center justify-center text-sm font-bold text-[#F6E05E]">
                          {index + 1}
                        </span>
                        <p className="text-sm text-[#2D3748] leading-relaxed">{action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Treatment Steps */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#38A169]" />
                    {selectedLanguage === 'hi' ? "उपचार के चरण" :
                     selectedLanguage === 'ta' ? "சிகிச்சை படிகள்" :
                     "Treatment Steps"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.treatment_steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#38A16910] rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#38A16920] rounded-full flex items-center justify-center text-sm font-bold text-[#38A169]">
                          {index + 1}
                        </span>
                        <p className="text-sm text-[#2D3748] leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Warnings */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#E53E3E]" />
                    {selectedLanguage === 'hi' ? "चेतावनियां" :
                     selectedLanguage === 'ta' ? "எச்சரிக்கைகள்" :
                     "Warnings"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analysisResult.warnings.map((warning, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#E53E3E10] rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#E53E3E20] rounded-full flex items-center justify-center text-sm font-bold text-[#E53E3E]">
                          ⚠️
                        </span>
                        <p className="text-sm text-[#2D3748] leading-relaxed">{warning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* When to Seek Help */}
              <Card className="bg-[#F8F5F0] border border-[#F6E05E]/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F6E05E20] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#F6E05E] text-lg">🏥</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2D3748] font-nunito mb-2">
                        {selectedLanguage === 'hi' ? "डॉक्टर से कब मिलें" :
                         selectedLanguage === 'ta' ? "எப்போது மருத்துவரை சந்திக்க வேண்டும்" :
                         "When to Seek Medical Help"}
                      </h4>
                      <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                        {analysisResult.when_to_seek_help}
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

export default FirstAidPage;