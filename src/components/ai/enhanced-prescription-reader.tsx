import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Camera, 
  Upload, 
  FileText, 
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle,
  Globe,
  Wifi,
  WifiOff,
  Info,
  X,
  RotateCcw,
  Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import ocrService from "@/lib/ocr-service";
import { ErrorBoundary } from "@/components/ui/error-boundary";

interface EnhancedPrescriptionReaderProps {
  className?: string;
}

interface PrescriptionResult {
  ocr: {
    text: string;
    confidence: number;
    language: string;
  };
  analysis: {
    medicines: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
      side_effects: string[];
      warnings: string[];
    }>;
    doctor_name?: string;
    date?: string;
    confidence: number;
    language: string;
  };
}

export function EnhancedPrescriptionReader({ className }: EnhancedPrescriptionReaderProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "ta">("en");
  const [isOnline, setIsOnline] = useState(true);
  const [showOCRText, setShowOCRText] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" }
  ] as const;

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image
      ocrService.validateImage(file).then((validation) => {
        if (validation.isValid) {
          setSelectedImage(file);
          setError(null);
          const reader = new FileReader();
          reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
          };
          reader.readAsDataURL(file);
          setResult(null);
        } else {
          setError(validation.error);
        }
      });
    }
  }, []);

  const processPrescription = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Preprocess image for better OCR
      const processedImage = await ocrService.preprocessImage(selectedImage);
      
      // Analyze prescription
      const analysisResult = await ocrService.analyzePrescription(processedImage, selectedLanguage);
      setResult(analysisResult);
      
    } catch (error) {
      console.error('Prescription processing failed:', error);
      setError('Failed to process prescription. Please try again with a clearer image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLanguageChange = (language: "en" | "hi" | "ta") => {
    setSelectedLanguage(language);
  };

  const resetForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setShowOCRText(false);
  };

  return (
    <ErrorBoundary
      fallback={
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 bg-muted/20 rounded-3xl border border-border/30 text-center"
        >
          <p className="text-muted-foreground mb-4">
            ⚠️ Prescription reader temporarily unavailable. Please try refreshing the page.
          </p>
        </motion.div>
      }
    >
      <Card className={cn(
        "motion-card overflow-hidden relative bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-2xl card-hover rounded-3xl",
        className
      )}>
        {/* Connectivity Status */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 right-4 z-30"
        >
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs flex items-center gap-1",
              isOnline ? "border-green-500 text-green-600" : "border-orange-500 text-orange-600"
            )}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </motion.div>

        <CardHeader className="relative z-20 px-6 sm:px-8 pb-4">
          <CardTitle className="flex items-center gap-3 sm:gap-4 text-lg sm:text-xl">
            <motion.div 
              className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#3182CE] to-[#3182CE]/80 rounded-xl flex items-center justify-center shadow-lg"
              animate={isProcessing ? { 
                rotate: 360,
                scale: [1, 1.1, 1]
              } : {}}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity }
              }}
            >
              <Pill className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <span className="text-foreground font-bold">
              {selectedLanguage === 'hi' ? 'AI प्रिस्क्रिप्शन रीडर' : 
               selectedLanguage === 'ta' ? 'AI மருந்துப்பதிவு வாசகர்' :
               'AI Prescription Reader'}
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8 relative z-20 px-6 sm:px-8 pb-6 sm:pb-8">
          {/* Language Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2"
          >
            {languages.map((lang) => (
              <Button
                key={lang.code}
                variant={selectedLanguage === lang.code ? "default" : "outline"}
                size="sm"
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-xs sm:text-sm font-semibold ${
                  selectedLanguage === lang.code 
                    ? 'bg-[#3182CE] hover:bg-[#3182CE]/90 text-white' 
                    : 'border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]'
                }`}
              >
                <span className="mr-1">{lang.flag}</span>
                {lang.name}
              </Button>
            ))}
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div 
              className={cn(
                "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                imagePreview 
                  ? "border-[#3182CE] bg-[#3182CE10]" 
                  : "border-[#E2E8F0] hover:border-[#3182CE] hover:bg-[#3182CE10]"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Uploaded prescription" 
                      className="max-w-full max-h-48 sm:max-h-64 mx-auto rounded-lg shadow-md"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[#3182CE]">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-semibold">
                      {selectedLanguage === 'hi' ? 'प्रिस्क्रिप्शन अपलोड हो गया है' :
                       selectedLanguage === 'ta' ? 'மருந்துப்பதிவு பதிவேற்றப்பட்டது' :
                       'Prescription uploaded successfully'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-[#3182CE20] rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-8 h-8 text-[#3182CE]" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-[#2D3748] mb-2">
                      {selectedLanguage === 'hi' ? 'प्रिस्क्रिप्शन अपलोड करें' :
                       selectedLanguage === 'ta' ? 'மருந்துப்பதிவை பதிவேற்றவும்' :
                       'Upload Prescription'}
                    </p>
                    <p className="text-sm text-[#4A5568]">
                      {selectedLanguage === 'hi' ? 'AI विश्लेषण के लिए प्रिस्क्रिप्शन की स्पष्ट तस्वीर अपलोड करें' :
                       selectedLanguage === 'ta' ? 'AI பகுப்பாய்வுக்கு மருந்துப்பதிவின் தெளிவான படத்தை பதிவேற்றவும்' :
                       'Click to upload a clear photo of the prescription for AI analysis'}
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
              className="w-full bg-[#3182CE] hover:bg-[#3182CE]/90 text-white font-semibold"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {selectedLanguage === 'hi' ? 'प्रोसेसिंग...' :
                   selectedLanguage === 'ta' ? 'செயலாக்குகிறது...' :
                   'Processing...'}
                </div>
              ) : (
                selectedLanguage === 'hi' ? 'प्रिस्क्रिप्शन पढ़ें' :
                selectedLanguage === 'ta' ? 'மருந்துப்பதிவை படிக்கவும்' :
                'Read Prescription'
              )}
            </Button>
          </motion.div>

          {/* Results Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* OCR Confidence */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-[#2D3748] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#3182CE]" />
                      {selectedLanguage === 'hi' ? 'OCR विश्वास स्तर' :
                       selectedLanguage === 'ta' ? 'OCR நம்பிக்கை நிலை' :
                       'OCR Confidence'}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOCRText(!showOCRText)}
                      className="text-[#3182CE] hover:bg-[#3182CE20] p-0 h-auto"
                    >
                      <Info className="w-4 h-4 mr-2" />
                      {selectedLanguage === 'hi' ? 'पाठ देखें' :
                       selectedLanguage === 'ta' ? 'உரையைக் காட்டு' :
                       'View Text'}
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#2D3748]">{result.ocr.confidence}%</span>
                    </div>
                    <Progress value={result.ocr.confidence} className="h-2" />
                  </div>

                  <AnimatePresence>
                    {showOCRText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-[#F8F5F0] rounded-xl"
                      >
                        <p className="text-sm text-[#4A5568] leading-relaxed whitespace-pre-wrap">
                          {result.ocr.text}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* AI Analysis Confidence */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#2D3748] flex items-center gap-2">
                    <Brain className="w-4 h-4 text-[#3182CE]" />
                    {selectedLanguage === 'hi' ? 'AI विश्लेषण विश्वास' :
                     selectedLanguage === 'ta' ? 'AI பகுப்பாய்வு நம்பிக்கை' :
                     'AI Analysis Confidence'}
                  </h4>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#2D3748]">{result.analysis.confidence}%</span>
                    </div>
                    <Progress value={result.analysis.confidence} className="h-2" />
                  </div>
                </div>

                {/* Medicines */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#2D3748] flex items-center gap-2">
                    <Pill className="w-4 h-4 text-[#3182CE]" />
                    {selectedLanguage === 'hi' ? `दवाएं (${result.analysis.medicines.length})` :
                     selectedLanguage === 'ta' ? `மருந்துகள் (${result.analysis.medicines.length})` :
                     `Medicines (${result.analysis.medicines.length})`}
                  </h4>
                  
                  <div className="space-y-4">
                    {result.analysis.medicines.map((medicine, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-[#F8F5F0] rounded-xl space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <h5 className="font-semibold text-[#2D3748]">{medicine.name}</h5>
                          <Badge className="bg-[#38A169] text-white text-xs">
                            {medicine.dosage}
                          </Badge>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#3182CE]" />
                            <span className="text-sm text-[#4A5568]">{medicine.frequency}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#3182CE]" />
                            <span className="text-sm text-[#4A5568]">{medicine.duration}</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white rounded-lg">
                          <p className="text-sm text-[#4A5568] leading-relaxed">
                            <strong>
                              {selectedLanguage === 'hi' ? 'निर्देश: ' :
                               selectedLanguage === 'ta' ? 'வழிமுறைகள்: ' :
                               'Instructions: '}
                            </strong>
                            {medicine.instructions}
                          </p>
                        </div>
                        
                        {medicine.side_effects && medicine.side_effects.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-[#F6E05E]" />
                              {selectedLanguage === 'hi' ? 'साइड इफेक्ट्स' :
                               selectedLanguage === 'ta' ? 'பக்க விளைவுகள்' :
                               'Side Effects'}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {medicine.side_effects.map((effect, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white border-[#F6E05E] text-[#F6E05E]">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {medicine.warnings && medicine.warnings.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              {selectedLanguage === 'hi' ? 'चेतावनियां' :
                               selectedLanguage === 'ta' ? 'எச்சரிக்கைகள்' :
                               'Warnings'}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {medicine.warnings.map((warning, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs bg-white border-red-500 text-red-500">
                                  {warning}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="p-4 bg-[#F8F5F0] border border-[#F6E05E]/30 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F6E05E20] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-[#F6E05E] text-lg">⚠️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#2D3748] mb-2">
                        {selectedLanguage === 'hi' ? 'महत्वपूर्ण नोटिस' :
                         selectedLanguage === 'ta' ? 'முக்கிய அறிவிப்பு' :
                         'Important Notice'}
                      </h4>
                      <p className="text-sm text-[#4A5568] leading-relaxed">
                        {selectedLanguage === 'hi' ? 
                          'यह AI व्याख्या केवल संदर्भ के लिए है। हमेशा अपने डॉक्टर के निर्देशों का पालन करें और अपनी दवा के बारे में किसी भी चिंता के लिए स्वास्थ्य पेशेवरों से सलाह लें।' :
                         selectedLanguage === 'ta' ? 
                          'இந்த AI விளக்கம் குறிப்புக்கு மட்டுமே. எப்போதும் உங்கள் மருத்துவரின் வழிமுறைகளைப் பின்பற்றுங்கள் மற்றும் உங்கள் மருந்துகள் பற்றிய எந்த கவலைகளுக்கும் சுகாதார நிபுணர்களிடம் ஆலோசனை கேள்வி.' :
                         'This AI interpretation is for reference only. Always follow your doctor\'s instructions and consult healthcare professionals for any concerns about your medication.'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  onClick={resetForm}
                  className="w-full border-[#E2E8F0] hover:bg-[#F8F5F0] text-[#2D3748]"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  {selectedLanguage === 'hi' ? 'नया प्रिस्क्रिप्शन' :
                   selectedLanguage === 'ta' ? 'புதிய மருந்துப்பதிவு' :
                   'New Prescription'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
} 