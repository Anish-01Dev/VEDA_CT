import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Phone,
  MapPin,
  Pill,
  Heart,
  Shield,
  Info
} from "lucide-react";
import { aiClient } from '@/lib/ai-client';
import { aiLogger } from '@/lib/ai-logger';
import { geminiVision } from '@/lib/gemini-vision';

interface WoundAnalysisResponse {
  severity: string;
  woundType: string;
  immediateActions: string[];
  medications: string[];
  whenToSeekHelp: string[];
  followUpCare: string[];
  estimatedHealingTime: string;
  riskFactors: string[];
  language: string;
}



const FirstAidAdvisor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WoundAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<'quick' | 'detailed'>('quick');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setAnalysis(null);
      setError(null);
    }
  };

  const analyzeWound = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);
    
    aiLogger.aiStart('First Aid Advisor', 'Image Analysis', selectedImage.name);

    try {
      // Convert image to base64
      const base64 = await convertToBase64(selectedImage);
      
      // Create prompt for wound analysis
      const prompt = detailLevel === 'quick' 
        ? `You are a family doctor. Analyze this wound image and give a brief, practical response like a real doctor would.

Be concise and direct. No asterisks, bullet points, or formatting. Speak naturally.

Provide in JSON format:
{
  "injury_type": "Brief description (e.g., 'Minor cut', 'Bruise')",
  "severity": "mild/moderate/severe/critical",
  "confidence": 85,
  "immediate_actions": [
    "Clean the wound",
    "Apply pressure if bleeding"
  ],
  "treatment_steps": [
    "Keep it clean and dry",
    "Use antiseptic"
  ],
  "warnings": [
    "See a doctor if it gets worse"
  ],
  "when_to_seek_help": "If bleeding won't stop or signs of infection appear"
}`
        : `You are an experienced family doctor. Analyze this wound image and provide comprehensive medical guidance.

Speak professionally but warmly, like explaining to a patient. No asterisks or special formatting.

Provide detailed analysis in JSON format:
{
  "injury_type": "Detailed medical description",
  "severity": "mild/moderate/severe/critical",
  "confidence": 85,
  "immediate_actions": [
    "Step 1 with explanation",
    "Step 2 with reasoning",
    "Step 3 with precautions"
  ],
  "treatment_steps": [
    "Detailed treatment approach",
    "Follow-up care instructions",
    "Healing timeline expectations"
  ],
  "warnings": [
    "Specific warning signs to watch for",
    "Complications to avoid"
  ],
  "when_to_seek_help": "Detailed explanation of when professional medical care is needed"
}`;

      let result;
      try {
        // Try Gemini Vision API first
        result = await geminiVision.analyzeImage(base64, prompt);
      } catch (visionError) {
        console.warn('Vision API failed, using fallback analysis:', visionError);
        
        // Fallback: Provide generic first aid advice based on image analysis failure
        result = {
          injury_type: 'Wound requiring assessment',
          severity: 'moderate',
          confidence: 60,
          immediate_actions: [
            'Clean your hands thoroughly before treating the wound',
            'Stop any bleeding by applying gentle pressure with a clean cloth',
            'Clean the wound gently with clean water'
          ],
          treatment_steps: [
            'Apply antiseptic if available',
            'Cover with a sterile bandage',
            'Keep the wound clean and dry',
            'Change dressing daily'
          ],
          warnings: [
            'Watch for signs of infection (increased redness, swelling, pus)',
            'Seek medical attention if bleeding doesn\'t stop',
            'Get professional help if the wound is deep or gaping'
          ],
          when_to_seek_help: 'Seek immediate medical attention if bleeding is severe, the wound is deep, or if you notice signs of infection'
        };
      }
      
      const analysisResult = {
        severity: result.severity || 'moderate',
        woundType: result.injury_type || 'Injury requiring assessment',
        immediateActions: result.immediate_actions || ['Clean hands before treating', 'Assess the injury', 'Apply appropriate first aid'],
        medications: ['Antiseptic solution', 'Pain reliever (if needed)', 'Clean bandages', 'Sterile gauze'],
        whenToSeekHelp: result.warnings || ['If bleeding doesn\'t stop', 'Signs of infection', 'Severe pain'],
        followUpCare: result.treatment_steps || ['Keep wound clean', 'Change dressing regularly', 'Monitor for healing'],
        estimatedHealingTime: result.severity === 'critical' ? 'Seek immediate care' : '3-7 days (varies by injury)',
        riskFactors: ['Infection', 'Delayed healing', 'Scarring'],
        language: 'en'
      };
      
      setAnalysis(analysisResult);
      aiLogger.aiSuccess('First Aid Advisor', 'Image Analysis', { 
        injury: result.injury_type, 
        severity: result.severity 
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed';
      setError(`Image analysis failed: ${errorMessage}. Please try again or consult a healthcare provider.`);
      setAnalysis(null);
      aiLogger.aiError('First Aid Advisor', 'Image Analysis', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        resolve(base64.split(',')[1]);
      };
      reader.onerror = reject;
    });
  };



  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <Camera className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">First Aid Advisor</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload a photo of your wound or injury for AI-powered first aid guidance and treatment recommendations
          </p>
        </motion.div>

        {/* Emergency Warning */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Emergency Situations</h3>
              <p className="text-red-700 text-sm">
                For severe bleeding, unconsciousness, or life-threatening injuries, call emergency services immediately (108/102)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload Wound Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="wound-upload"
                />
                <label htmlFor="wound-upload" className="cursor-pointer">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload wound image</p>
                  <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP</p>
                </label>
              </div>

              {imagePreview && (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={detailLevel === 'quick' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetailLevel('quick')}
                  >
                    Quick Answer
                  </Button>
                  <Button
                    variant={detailLevel === 'detailed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetailLevel('detailed')}
                  >
                    Detailed Analysis
                  </Button>
                </div>
                <img
                  src={imagePreview}
                  alt="Wound preview"
                  className="max-w-full h-64 object-cover rounded-lg mx-auto"
                />
                <Button
                  onClick={analyzeWound}
                  disabled={isAnalyzing}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 mr-2" />
                      Get {detailLevel === 'quick' ? 'Quick' : 'Detailed'} Analysis
                    </>
                  )}
                </Button>
              </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Severity Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Wound Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className={getSeverityColor(analysis.severity)}>
                    {analysis.severity.toUpperCase()}
                  </Badge>
                  <span className="text-gray-700">{analysis.woundType}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  Estimated healing time: {analysis.estimatedHealingTime}
                </div>
              </CardContent>
            </Card>

            {/* Immediate Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Immediate First Aid Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {analysis.immediateActions.map((action, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{action}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            {/* Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Pill className="w-5 h-5" />
                  Recommended Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.medications.map((med, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{med}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* When to Seek Help */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <Phone className="w-5 h-5" />
                  Seek Medical Help If
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.whenToSeekHelp.map((condition, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5" />
                      <span className="text-gray-700">{condition}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Follow-up Care */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Heart className="w-5 h-5" />
                  Follow-up Care
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.followUpCare.map((care, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-700">{care}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Info className="w-5 h-5" />
                  Watch for Complications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {analysis.riskFactors.map((risk, index) => (
                    <Badge key={index} variant="outline" className="text-purple-700 border-purple-300">
                      {risk}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Phone className="w-5 h-5" />
                  Emergency Contacts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-semibold">Emergency Services</p>
                      <p className="text-sm text-gray-600">108 / 102</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="font-semibold">Find Nearest Hospital</p>
                      <p className="text-sm text-gray-600">Use maps or call 108</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FirstAidAdvisor;