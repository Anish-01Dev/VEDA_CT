import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertTriangle, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface LabResult {
  analysis: string;
  keyFindings: string[];
  riskZones: string[];
  recommendations: string[];
}

interface LabAIProps {
  className?: string;
}

export function LabAI({ className }: LabAIProps) {
  const [reportText, setReportText] = useState('');
  const [labResult, setLabResult] = useState<LabResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      toast({ title: 'Image uploaded successfully!' });
    } else {
      toast({ title: 'Please upload a valid image file', variant: 'destructive' });
    }
  };

  const analyzeReport = async () => {
    if (!reportText.trim() && !uploadedImage) {
      toast({ title: 'Please enter text or upload an image', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);

    try {
      const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
      console.log('🔑 API Key Status:', API_KEY ? 'Present' : 'Missing');
      
      let requestBody;

      if (uploadedImage) {
        console.log('📁 Analyzing Image:', uploadedImage.name, uploadedImage.type, uploadedImage.size);
        const base64Image = await convertToBase64(uploadedImage);
        console.log('🖼️ Base64 Image Length:', base64Image.length);
        
        requestBody = {
          contents: [{
            parts: [
              {
                text: `Look at this medical lab report image carefully and analyze what you see. Read ALL text, numbers, and values visible in the image.
                
                Return ONLY valid JSON:
                {
                  "analysis": "detailed analysis based on ACTUAL values you see in the image",
                  "keyFindings": ["specific findings from the actual report values"],
                  "riskZones": ["health risks based on the actual lab values shown"],
                  "recommendations": ["specific advice based on the actual test results"]
                }
                
                CRITICAL: Base your analysis ONLY on the actual lab values, test names, and results visible in this specific image. Don't give generic responses.`
              },
              {
                inline_data: {
                  mime_type: uploadedImage.type.includes('png') ? "image/png" : "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024
          }
        };
      } else {
        console.log('📝 Analyzing Text:', reportText.substring(0, 100));
        requestBody = {
          contents: [{
            parts: [{
              text: `Analyze this lab report data: "${reportText}". Return ONLY valid JSON:
              {
                "analysis": "detailed analysis based on these specific values",
                "keyFindings": ["findings from the actual data provided"],
                "riskZones": ["health risks based on these specific values"],
                "recommendations": ["advice based on these actual results"]
              }
              
              CRITICAL: Base analysis on the actual values provided, not generic information.`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024
          }
        };
      }

      console.log('📤 Making API Request to Gemini...');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 API Response Status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Full API Response:', data);
      
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('🤖 AI Response Text:', text);
      
      if (!text) {
        throw new Error('No response from AI');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('❌ No JSON found in response:', text);
        throw new Error('No JSON found in response');
      }

      console.log('🔍 Extracted JSON:', jsonMatch[0]);
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('✅ Parsed Analysis:', parsed);
      
      setLabResult(parsed);
      toast({ title: '🧪 Analysis complete with Gemini AI!' });
      
    } catch (error) {
      console.error('❌ Lab analysis failed:', error);
      setLabResult(null);
      toast({ title: `Analysis failed: ${error.message}. Check console for details.`, variant: 'destructive' });
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

  const showTestResults = () => {
    const testAnalysis = {
      analysis: 'Test analysis showing immediately. Lab values reviewed successfully.',
      keyFindings: ['Test finding 1', 'Test finding 2'],
      riskZones: ['Test risk 1', 'Test risk 2'], 
      recommendations: ['Test recommendation 1', 'Test recommendation 2']
    };
    setLabResult(testAnalysis);
    toast({ title: 'Test results shown!' });
  };

  const reset = () => {
    setReportText('');
    setLabResult(null);
    setUploadedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-health-blue-500" />
            🧪 LabAI – Smart Medical Report Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter lab report data for AI-powered analysis in simple terms
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-health-teal-500" />
            Upload Report Image or Enter Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Upload */}
          <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-white/20 hover:bg-white/5 mb-2"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Lab Report Image
            </Button>
            {uploadedImage && (
              <p className="text-sm text-muted-foreground">
                Selected: {uploadedImage.name}
              </p>
            )}
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Uploaded Report:</h4>
              <img 
                src={imagePreview} 
                alt="Lab report" 
                className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
              />
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">OR</div>

          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Enter lab values: Hemoglobin: 12.5 g/dL, Cholesterol: 180 mg/dL, Blood Sugar: 95 mg/dL..."
            className="w-full p-4 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-health-blue-500/50 min-h-[120px]"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={analyzeReport}
              disabled={(!reportText.trim() && !uploadedImage) || isAnalyzing}
              className="flex-1 health-gradient text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing with Gemini AI...
                </div>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Analyze Report with AI
                </>
              )}
            </Button>
            
            {labResult && (
              <Button onClick={reset} variant="outline" className="border-white/20">
                New Report
              </Button>
            )}
            
            <Button onClick={showTestResults} variant="outline" className="border-white/20">
              Test Results
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {labResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="glass-card border-blue-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-500 mb-2">Overall Analysis</h3>
                    <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
                      {labResult.analysis}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {labResult.keyFindings && labResult.keyFindings.length > 0 && (
              <Card className="glass-card border-green-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-green-500 mb-3">Key Findings</h3>
                      <ul className="space-y-2">
                        {labResult.keyFindings.map((finding, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {labResult.riskZones && labResult.riskZones.length > 0 && (
              <Card className="glass-card border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-orange-500 mb-3">Risk Predictions</h3>
                      <ul className="space-y-2">
                        {labResult.riskZones.map((risk, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-orange-500 mt-1">⚠️</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {labResult.recommendations && labResult.recommendations.length > 0 && (
              <Card className="glass-card border-purple-500/30">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-purple-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-purple-500 mb-3">Recommendations</h3>
                      <ul className="space-y-2">
                        {labResult.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-purple-500 mt-1">💡</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}