import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Apple, Utensils, Target, TrendingUp, Camera, Upload, BarChart3, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";
import { aiClient } from "@/lib/ai-client";
import { aiLogger } from "@/lib/ai-logger";



interface UserProfile {
  age: string;
  weight: string;
  height: string;
  activity: string;
  goal: string;
  dietary: string;
  allergies: string;
  medicalCondition: string;
}

interface FoodAnalysis {
  name: string;
  calories: number;
  ingredients: string[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  healthScore: number;
  recommendations: string[];
}

interface WeeklyProgress {
  avgCalories: number;
  sugarReduction: number;
  proteinIncrease: number;
  improvements: string[];
}

const DietAdvisorPage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    age: "", weight: "", height: "", activity: "", goal: "", dietary: "", allergies: "", medicalCondition: ""
  });
  const [mealPlan, setMealPlan] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [foodAnalysis, setFoodAnalysis] = useState<FoodAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'scan' | 'progress'>('profile');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setFoodAnalysis(null);
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

  const analyzeFood = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    aiLogger.aiStart('Diet Advisor', 'Food Analysis', selectedImage.name);
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_VISION_KEY ?? '';
      const base64Image = await convertToBase64(selectedImage);
      const requestBody = {
        contents: [{
          parts: [
            {
              text: `Analyze this food image. Return ONLY valid JSON:
{
  "name": "exact dish name",
  "calories": estimated_calories,
  "ingredients": ["ingredient1", "ingredient2"],
  "macros": { "protein": grams, "carbs": grams, "fats": grams, "fiber": grams },
  "healthScore": 0_to_100,
  "recommendations": ["tip1", "tip2"]
}
Medical context: ${profile.medicalCondition || 'general health'}. Base analysis ONLY on what you see.`
            },
            {
              inline_data: {
                mime_type: selectedImage.type.includes('png') ? 'image/png' : 'image/jpeg',
                data: base64Image
              }
            }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
      };
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      if (!response.ok) throw new Error(`API failed: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from AI');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const parsed = JSON.parse(jsonMatch[0]);
      setFoodAnalysis(parsed);
      aiLogger.aiSuccess('Diet Advisor', 'Food Analysis', { food: parsed.name, calories: parsed.calories });
    } catch (error) {
      aiLogger.aiError('Diet Advisor', 'Food Analysis', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMealPlan = async () => {
    if (!profile.age || !profile.weight || !profile.height || !profile.activity || !profile.goal) return;
    setIsGenerating(true);
    aiLogger.aiStart('Diet Advisor', 'Meal Plan Generation', profile);
    try {
      const API_KEY = import.meta.env.VITE_GEMINI_TEXT_KEY ?? '';
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Create a personalized Indian meal plan. Return ONLY valid JSON:
{
  "dailyCalories": number,
  "bmi": number,
  "bmiCategory": "Underweight|Normal|Overweight|Obese",
  "macros": { "protein": grams, "carbs": grams, "fats": grams },
  "meals": {
    "breakfast": { "name": "dish", "calories": number, "items": ["item1"] },
    "lunch": { "name": "dish", "calories": number, "items": ["item1"] },
    "dinner": { "name": "dish", "calories": number, "items": ["item1"] },
    "snacks": { "name": "snack", "calories": number, "items": ["item1"] }
  },
  "medicalTips": ["tip1"],
  "indianFoods": ["recommendation1"],
  "waterIntake": "X liters per day",
  "avoidFoods": ["food1"]
}
Profile: Age ${profile.age}, Weight ${profile.weight}kg, Height ${profile.height}cm, Activity: ${profile.activity}, Goal: ${profile.goal}, Diet: ${profile.dietary || 'any'}, Medical: ${profile.medicalCondition || 'none'}, Allergies: ${profile.allergies || 'none'}.`
            }]
          }]
        })
      });
      if (!response.ok) throw new Error(`API failed: ${response.status}`);
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No response from AI');
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON in response');
      const parsed = JSON.parse(jsonMatch[0]);
      setMealPlan(parsed);
      aiLogger.aiSuccess('Diet Advisor', 'Meal Plan Generation', { calories: parsed.dailyCalories });
    } catch (error) {
      aiLogger.aiError('Diet Advisor', 'Meal Plan Generation', error);
      alert(`Meal plan generation failed: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadWeeklyProgress = () => {
    setWeeklyProgress({
      avgCalories: 1950,
      sugarReduction: 20,
      proteinIncrease: 15,
      improvements: [
        "Sugar intake reduced by 20% 🎉",
        "Protein intake increased by 15%",
        "Added 3 more servings of vegetables daily",
        "Reduced processed food consumption by 30%"
      ]
    });
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      <motion.header 
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 py-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/health")} className="hover:bg-[#4A9B8E10]">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#F6E05E20] text-[#F6E05E]">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">NutriGuide - AI Diet Coach</h1>
              <p className="text-sm text-[#4A5568] font-inter">Upload food photos for calorie analysis & personalized meal plans</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-6xl mx-auto space-y-6">
        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-2 p-1 bg-[#F8F5F0] rounded-lg"
        >
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('profile')}
            className={activeTab === 'profile' ? 'bg-[#4A9B8E] text-white' : 'text-[#4A5568]'}
          >
            <Target className="w-4 h-4 mr-2" />
            Profile & Plan
          </Button>
          <Button
            variant={activeTab === 'scan' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('scan')}
            className={activeTab === 'scan' ? 'bg-[#4A9B8E] text-white' : 'text-[#4A5568]'}
          >
            <Camera className="w-4 h-4 mr-2" />
            Food Scanner
          </Button>
          <Button
            variant={activeTab === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => {
              setActiveTab('progress');
              loadWeeklyProgress();
            }}
            className={activeTab === 'progress' ? 'bg-[#4A9B8E] text-white' : 'text-[#4A5568]'}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Progress
          </Button>
        </motion.div>

        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-2"
          >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                <Target className="w-5 h-5 text-[#4A9B8E]" />
                Your Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-sm font-semibold text-[#2D3748] font-nunito">Age</Label>
                  <Input
                    id="age"
                    placeholder="25"
                    value={profile.age}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-sm font-semibold text-[#2D3748] font-nunito">Weight (kg)</Label>
                  <Input
                    id="weight"
                    placeholder="70"
                    value={profile.weight}
                    onChange={(e) => setProfile({...profile, weight: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="height" className="text-sm font-semibold text-[#2D3748] font-nunito">Height (cm)</Label>
                <Input
                  id="height"
                  placeholder="170"
                  value={profile.height}
                  onChange={(e) => setProfile({...profile, height: e.target.value})}
                  className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                />
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Level</Label>
                <Select value={profile.activity} onValueChange={(value) => setProfile({...profile, activity: value})}>
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentary">Sedentary (desk job)</SelectItem>
                    <SelectItem value="light">Light (1-3 days/week)</SelectItem>
                    <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                    <SelectItem value="active">Very Active (6-7 days/week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Goal</Label>
                <Select value={profile.goal} onValueChange={(value) => setProfile({...profile, goal: value})}>
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]">
                    <SelectValue placeholder="Select your goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose">Lose Weight</SelectItem>
                    <SelectItem value="maintain">Maintain Weight</SelectItem>
                    <SelectItem value="gain">Gain Weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Dietary Preferences</Label>
                <Select value={profile.dietary} onValueChange={(value) => setProfile({...profile, dietary: value})}>
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]">
                    <SelectValue placeholder="Select dietary preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                    <SelectItem value="jain">Jain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Medical Condition</Label>
                <Select value={profile.medicalCondition} onValueChange={(value) => setProfile({...profile, medicalCondition: value})}>
                  <SelectTrigger className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]">
                    <SelectValue placeholder="Select condition (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="diabetes">Diabetes</SelectItem>
                    <SelectItem value="hypertension">Hypertension</SelectItem>
                    <SelectItem value="obesity">Obesity</SelectItem>
                    <SelectItem value="heart-disease">Heart Disease</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="allergies" className="text-sm font-semibold text-[#2D3748] font-nunito">Allergies/Restrictions</Label>
                <Input
                  id="allergies"
                  placeholder="e.g., nuts, dairy, gluten"
                  value={profile.allergies}
                  onChange={(e) => setProfile({...profile, allergies: e.target.value})}
                  className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                />
              </div>

              <Button 
                onClick={generateMealPlan}
                disabled={!profile.age || !profile.weight || !profile.height || !profile.activity || !profile.goal || isGenerating}
                className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
              >
                {isGenerating ? "Generating..." : "Generate Meal Plan"}
              </Button>
            </CardContent>
          </Card>

          {mealPlan && (
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                  <Utensils className="w-5 h-5 text-[#4A9B8E]" />
                  Your Meal Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* BMI + Calories */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-4 bg-gradient-to-br from-[#4A9B8E] to-[#2A9D8F] rounded-lg text-white">
                    <div className="text-2xl font-bold">{mealPlan.dailyCalories}</div>
                    <div className="text-xs text-white/80">Daily Calories</div>
                  </div>
                  {mealPlan.bmi && (
                    <div className="text-center p-4 bg-[#F8F5F0] rounded-lg">
                      <div className="text-2xl font-bold text-[#2D3748]">{mealPlan.bmi}</div>
                      <div className="text-xs text-[#4A5568]">BMI — {mealPlan.bmiCategory}</div>
                    </div>
                  )}
                </div>

                {/* Macros */}
                {mealPlan.macros && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[['Protein', mealPlan.macros.protein, 'bg-blue-50 text-blue-700'], ['Carbs', mealPlan.macros.carbs, 'bg-yellow-50 text-yellow-700'], ['Fats', mealPlan.macros.fats, 'bg-red-50 text-red-700']].map(([label, val, cls]) => (
                      <div key={label as string} className={`p-3 rounded-lg ${cls}`}>
                        <div className="text-lg font-bold">{val}g</div>
                        <div className="text-xs">{label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Water Intake */}
                {mealPlan.waterIntake && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-2xl">💧</span>
                    <div>
                      <div className="text-sm font-semibold text-blue-800">Water Intake</div>
                      <div className="text-sm text-blue-700">{mealPlan.waterIntake}</div>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {mealPlan.meals && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#2D3748] font-nunito">Daily Meals</h4>
                    {Object.entries(mealPlan.meals).map(([meal, data]: [string, any]) => (
                      <div key={meal} className="p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <h5 className="font-semibold text-sm text-[#2D3748] capitalize">{meal}</h5>
                          <Badge className="bg-[#4A9B8E] text-white text-xs">{data?.calories || 0} cal</Badge>
                        </div>
                        <p className="text-sm font-medium text-[#4A5568] mb-2">{data?.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {data?.items?.map((item: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs bg-white border-[#E2E8F0] text-[#4A5568]">{item}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Avoid Foods */}
                {mealPlan.avoidFoods && mealPlan.avoidFoods.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-red-700 flex items-center gap-2">🚫 Foods to Avoid</h4>
                    <div className="flex flex-wrap gap-2">
                      {mealPlan.avoidFoods.map((food: string, i: number) => (
                        <Badge key={i} variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">{food}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Tips */}
                {mealPlan.medicalTips && mealPlan.medicalTips.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#2D3748]">⚕️ Medical Tips</h4>
                    {mealPlan.medicalTips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-600 font-bold text-sm mt-0.5">!</span>
                        <p className="text-sm text-red-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Indian Food Tips */}
                {mealPlan.indianFoods && mealPlan.indianFoods.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#2D3748]">🍛 Indian Food Tips</h4>
                    {mealPlan.indianFoods.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-3 bg-[#F8F5F0] rounded-lg">
                        <span className="text-[#4A9B8E] font-bold text-sm mt-0.5">{i + 1}</span>
                        <p className="text-sm text-[#4A5568]">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          </motion.div>
        )}

        {activeTab === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                  <Camera className="w-5 h-5 text-[#4A9B8E]" />
                  Food Scanner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="food-upload"
                  />
                  <label htmlFor="food-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Upload food photo for analysis</p>
                    <p className="text-sm text-gray-500 mt-2">Get instant calorie & macro estimates</p>
                  </label>
                </div>

                {imagePreview && (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Food preview"
                      className="max-w-full h-48 object-cover rounded-lg mx-auto"
                    />
                    <Button
                      onClick={() => {
                        console.log('🚀 Analyze Food button clicked');
                        analyzeFood();
                      }}
                      disabled={isAnalyzing}
                      className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Analyzing with Gemini AI...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Analyze Food with AI
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {foodAnalysis && (
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                    <BarChart3 className="w-5 h-5 text-[#4A9B8E]" />
                    Food Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-[#F8F5F0] rounded-lg">
                    <h3 className="text-lg font-bold text-[#2D3748] mb-2">{foodAnalysis.name}</h3>
                    <div className="text-2xl font-bold text-[#4A9B8E] mb-1">{foodAnalysis.calories}</div>
                    <div className="text-sm text-[#4A5568]">Calories</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#F8F5F0] rounded-lg text-center">
                      <div className="text-lg font-bold text-[#2D3748]">{foodAnalysis.macros.protein}g</div>
                      <div className="text-xs text-[#4A5568]">Protein</div>
                    </div>
                    <div className="p-3 bg-[#F8F5F0] rounded-lg text-center">
                      <div className="text-lg font-bold text-[#2D3748]">{foodAnalysis.macros.carbs}g</div>
                      <div className="text-xs text-[#4A5568]">Carbs</div>
                    </div>
                    <div className="p-3 bg-[#F8F5F0] rounded-lg text-center">
                      <div className="text-lg font-bold text-[#2D3748]">{foodAnalysis.macros.fats}g</div>
                      <div className="text-xs text-[#4A5568]">Fats</div>
                    </div>
                    <div className="p-3 bg-[#F8F5F0] rounded-lg text-center">
                      <div className="text-lg font-bold text-[#2D3748]">{foodAnalysis.macros.fiber}g</div>
                      <div className="text-xs text-[#4A5568]">Fiber</div>
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg font-bold text-green-700">Health Score: {foodAnalysis.healthScore}/100</div>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${foodAnalysis.healthScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#2D3748]">Detected Ingredients:</h4>
                    <div className="flex flex-wrap gap-2">
                      {foodAnalysis.ingredients.map((ingredient, index) => (
                        <Badge key={index} variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
                          {ingredient}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#2D3748]">Recommendations:</h4>
                    {foodAnalysis.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg">
                        <span className="text-blue-600 mt-1">•</span>
                        <span className="text-sm text-blue-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {activeTab === 'progress' && weeklyProgress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                  <Calendar className="w-5 h-5 text-[#4A9B8E]" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#F8F5F0] rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#4A9B8E] mb-1">{weeklyProgress.avgCalories}</div>
                    <div className="text-sm text-[#4A5568]">Avg Daily Calories</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">-{weeklyProgress.sugarReduction}%</div>
                    <div className="text-sm text-green-700">Sugar Reduction</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">+{weeklyProgress.proteinIncrease}%</div>
                    <div className="text-sm text-blue-700">Protein Increase</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-[#2D3748] font-nunito">This Week's Achievements:</h4>
                  <div className="space-y-2">
                    {weeklyProgress.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-600">✓</span>
                        </div>
                        <span className="text-sm text-green-700">{improvement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default DietAdvisorPage;