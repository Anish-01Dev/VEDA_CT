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
import type { WoundAnalysisResponse } from '@/lib/first-aid-api';



const FirstAidAdvisor = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<WoundAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

    try {
      const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
      console.log('🔑 API Key Status:', API_KEY ? 'Present' : 'Missing');
      
      const base64Image = await convertToBase64(selectedImage);
      console.log('🖼️ Base64 Image Length:', base64Image.length);
      
      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this wound/injury image and provide first aid guidance. Return ONLY valid JSON:
              {
                "severity": "minor|moderate|severe|critical",
                "woundType": "specific wound type you see",
                "immediateActions": ["step1", "step2", "step3"],
                "medications": ["med1", "med2"],
                "whenToSeekHelp": ["condition1", "condition2"],
                "followUpCare": ["care1", "care2"],
                "estimatedHealingTime": "time range",
                "riskFactors": ["risk1", "risk2"],
                "language": "en"
              }
              
              LANGUAGE REQUIREMENT:
              - If the user's query or context suggests Hindi, Tamil, Telugu, Bengali, Gujarati, Marathi, Kannada, Malayalam, Punjabi, Odia, or Assamese, respond in that language
              - Otherwise, respond in English
              - Include the detected language in the response
              
              Base analysis on what you actually see in the image. Provide practical first aid advice in the appropriate language.`
            },
            {
              inline_data: {
                mime_type: selectedImage.type.includes('png') ? "image/png" : "image/jpeg",
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048
        }
      };
      
      console.log('📤 Making API Request...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response Status:', response.status);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Daily quota exceeded (50 requests). Wait 24 hours or get a new API key from https://aistudio.google.com/');
        }
        throw new Error(`API failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 API Response:', data);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('🤖 AI Text:', text);
      
      if (!text) {
        throw new Error('No response from AI');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found:', text);
        throw new Error('Invalid response format');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed Analysis:', parsed);
      setAnalysis(parsed);
      
    } catch (err) {
      const errorMessage = err.message.includes('quota exceeded') 
        ? err.message 
        : `Analysis failed: ${err.message}. Please try again with a clearer image.`;
      setError(errorMessage);
      setAnalysis(null);
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
    switch (severity) {
      case 'minor': return 'bg-green-100 text-green-800';
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
                        Analyzing Wound...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Analyze Wound
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