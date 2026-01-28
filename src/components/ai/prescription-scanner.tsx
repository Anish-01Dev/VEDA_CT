import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Pill, Eye, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  medicines: Medicine[];
  doctorName?: string;
  patientName?: string;
  prescriptionDate?: string;
}

interface PrescriptionScannerProps {
  className?: string;
}

export function PrescriptionScanner({ className }: PrescriptionScannerProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isScanning, setIsScanning] = useState(false);
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
      toast({ title: 'Prescription image uploaded!' });
    } else {
      toast({ title: 'Please upload a valid image file', variant: 'destructive' });
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

  const scanPrescription = async () => {
    if (!uploadedImage) {
      toast({ title: 'Please upload a prescription image', variant: 'destructive' });
      return;
    }

    setIsScanning(true);

    try {
      const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
      console.log('🔑 API Key Status:', API_KEY ? 'Present' : 'Missing');
      console.log('📁 Prescription Image:', uploadedImage.name, uploadedImage.type, uploadedImage.size);
      
      const base64Image = await convertToBase64(uploadedImage);
      console.log('🖼️ Base64 Image Length:', base64Image.length);
      
      const requestBody = {
        contents: [{
          parts: [
            {
              text: `You are a medical prescription analyzer. Carefully examine this prescription image and extract ALL medicine information visible.
              
              Look for:
              - Medicine names (both generic and brand names)
              - Exact dosage amounts (mg, ml, tablets, etc.)
              - Frequency instructions (how many times per day, when to take)
              - Duration of treatment (how many days/weeks)
              - Special instructions (before/after meals, etc.)
              - Doctor's name and signature if visible
              - Patient information if visible
              
              LANGUAGE REQUIREMENT: 
              - If the prescription is in Hindi, Tamil, Telugu, Bengali, Gujarati, Marathi, Kannada, Malayalam, Punjabi, Odia, or Assamese, respond in the SAME language
              - If the prescription is in English, respond in English
              - NEVER translate the language - preserve the original language of the prescription
              
              Return ONLY valid JSON in this exact format:
              {
                "medicines": [
                  {
                    "name": "exact medicine name as written",
                    "dosage": "exact dosage with units",
                    "frequency": "exact frequency instructions",
                    "duration": "treatment duration",
                    "instructions": "special instructions if any"
                  }
                ],
                "doctorName": "doctor name if visible",
                "patientName": "patient name if visible",
                "prescriptionDate": "date if visible",
                "language": "detected language of prescription"
              }
              
              CRITICAL: 
              - Base your analysis ONLY on what you can actually read in the prescription image
              - If text is unclear, mention it. Don't make assumptions
              - ALWAYS respond in the same language as the prescription text
              - Include the detected language in the response`
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
          maxOutputTokens: 2048
        }
      };
      
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
      
      if (!parsed.medicines || !Array.isArray(parsed.medicines)) {
        console.error('❌ Invalid medicines data:', parsed);
        throw new Error('Invalid prescription data received');
      }
      
      setMedicines(parsed.medicines);
      toast({ title: `💊 Found ${parsed.medicines.length} medicine(s) in prescription!` });
      
    } catch (error) {
      console.error('❌ Prescription scanning failed:', error);
      setMedicines([]);
      toast({ title: `Analysis failed: ${error.message}. Check console for details.`, variant: 'destructive' });
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setMedicines([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-health-purple-500" />
            💊 Prescription Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload prescription images to extract medicine names and dosages
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-health-teal-500" />
            Upload Prescription Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              Upload Prescription Image
            </Button>
            {uploadedImage && (
              <p className="text-sm text-muted-foreground">
                Selected: {uploadedImage.name}
              </p>
            )}
          </div>

          {imagePreview && (
            <div className="bg-white/5 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-2">Prescription Image:</h4>
              <img 
                src={imagePreview} 
                alt="Prescription" 
                className="max-w-full h-auto max-h-64 rounded-lg mx-auto"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={scanPrescription}
              disabled={!uploadedImage || isScanning}
              className="flex-1 health-gradient text-white"
            >
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Scanning...
                </div>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Scan Prescription
                </>
              )}
            </Button>
            
            {medicines.length > 0 && (
              <Button onClick={reset} variant="outline" className="border-white/20">
                New Scan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {medicines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <Card className="glass-card border-purple-500/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Pill className="h-6 w-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-purple-500 mb-2">Extracted Medicines</h3>
                    <p className="text-sm text-muted-foreground">
                      {medicines.length} medicine(s) found in prescription
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {medicines.map((medicine, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * idx }}
                      className="bg-white/5 rounded-lg p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-foreground text-lg">
                          {medicine.name}
                        </h4>
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded">
                          Medicine {idx + 1}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Dosage:</span>
                          <p className="font-medium text-foreground">{medicine.dosage}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>
                          <p className="font-medium text-foreground">{medicine.frequency}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>
                          <p className="font-medium text-foreground">{medicine.duration}</p>
                        </div>
                        {medicine.instructions && (
                          <div>
                            <span className="text-muted-foreground">Instructions:</span>
                            <p className="font-medium text-foreground">{medicine.instructions}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}