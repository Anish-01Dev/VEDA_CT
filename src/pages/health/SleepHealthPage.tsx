import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Moon, Sun, Clock, Heart, Zap, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";



interface SleepData {
  bedtime: string;
  wakeTime: string;
  sleepQuality: number;
  dreamActivity: boolean;
  interruptions: number;
}

const SleepHealthPage = () => {
  const navigate = useNavigate();
  const [sleepData, setSleepData] = useState<SleepData>({
    bedtime: "",
    wakeTime: "",
    sleepQuality: 7,
    dreamActivity: false,
    interruptions: 0
  });
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSleep = async () => {
    if (!sleepData.bedtime || !sleepData.wakeTime) return;
    
    setIsAnalyzing(true);
    
    try {
      const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
      const bedTime = new Date(`2024-01-01 ${sleepData.bedtime}`);
      const wakeTime = new Date(`2024-01-01 ${sleepData.wakeTime}`);
      let sleepDuration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
      
      if (sleepDuration < 0) sleepDuration += 24;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this sleep data and provide personalized recommendations. Return ONLY a valid JSON response with:
              {
                "sleepDuration": "${sleepDuration.toFixed(1)}",
                "sleepScore": score_out_of_100,
                "recommendations": ["rec1", "rec2", "rec3", "rec4"],
                "sleepPhases": {
                  "deep": deep_sleep_hours,
                  "rem": rem_sleep_hours,
                  "light": light_sleep_hours
                },
                "insights": "detailed sleep analysis"
              }
              
              Sleep Data:
              - Bedtime: ${sleepData.bedtime}
              - Wake time: ${sleepData.wakeTime}
              - Sleep duration: ${sleepDuration.toFixed(1)} hours
              - Sleep quality (1-10): ${sleepData.sleepQuality}
              - Interruptions: ${sleepData.interruptions}
              
              IMPORTANT: Return ONLY the JSON object, no additional text. Provide personalized sleep health advice based on this data.`
            }]
          }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : text;
        const parsed = JSON.parse(jsonText);
        setAnalysis(parsed);
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Sleep analysis failed:', error);
      setAnalysis(null);
    } finally {
      setIsAnalyzing(false);
    }
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
            <div className="p-2 rounded-lg bg-[#2A9D8F20] text-[#2A9D8F]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Sleep Health Analyzer</h1>
              <p className="text-sm text-[#4A5568] font-inter">Track and improve your sleep patterns</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="px-4 py-6 max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 md:grid-cols-2"
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                <Clock className="w-5 h-5 text-[#4A9B8E]" />
                Sleep Tracker
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedtime" className="text-sm font-semibold text-[#2D3748] font-nunito">Bedtime</Label>
                  <Input
                    id="bedtime"
                    type="time"
                    value={sleepData.bedtime}
                    onChange={(e) => setSleepData({...sleepData, bedtime: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                </div>
                <div>
                  <Label htmlFor="waketime" className="text-sm font-semibold text-[#2D3748] font-nunito">Wake Time</Label>
                  <Input
                    id="waketime"
                    type="time"
                    value={sleepData.wakeTime}
                    onChange={(e) => setSleepData({...sleepData, wakeTime: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">Sleep Quality (1-10)</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-sm text-[#4A5568] font-inter">1</span>
                  <Progress value={sleepData.sleepQuality * 10} className="flex-1 h-2" />
                  <span className="text-sm text-[#4A5568] font-inter">10</span>
                </div>
                <Input
                  type="range"
                  min="1"
                  max="10"
                  value={sleepData.sleepQuality}
                  onChange={(e) => setSleepData({...sleepData, sleepQuality: parseInt(e.target.value)})}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="interruptions" className="text-sm font-semibold text-[#2D3748] font-nunito">Sleep Interruptions</Label>
                <Input
                  id="interruptions"
                  type="number"
                  min="0"
                  value={sleepData.interruptions}
                  onChange={(e) => setSleepData({...sleepData, interruptions: parseInt(e.target.value) || 0})}
                  className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                />
              </div>

              <Button 
                onClick={analyzeSleep}
                disabled={!sleepData.bedtime || !sleepData.wakeTime || isAnalyzing}
                className="w-full bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Sleep"}
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                  <Activity className="w-5 h-5 text-[#4A9B8E]" />
                  Sleep Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4A9B8E] mb-2 font-nunito">{analysis.sleepScore}/100</div>
                  <Badge variant={analysis.sleepScore >= 80 ? "default" : analysis.sleepScore >= 60 ? "secondary" : "destructive"} className="bg-[#38A169] text-white">
                    {analysis.sleepScore >= 80 ? "Excellent" : analysis.sleepScore >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#2D3748] font-nunito">{analysis.sleepDuration}h</div>
                    <div className="text-sm text-[#4A5568] font-inter">Total Sleep</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#4A9B8E] font-nunito">{analysis.sleepPhases.deep}h</div>
                    <div className="text-sm text-[#4A5568] font-inter">Deep Sleep</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-[#2D3748] font-nunito">AI Recommendations:</h4>
                  <div className="space-y-2">
                    {analysis.recommendations?.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F8F5F0] rounded-lg">
                        <div className="w-6 h-6 bg-[#4A9B8E20] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-[#4A9B8E]">{index + 1}</span>
                        </div>
                        <p className="text-sm text-[#4A5568] font-inter leading-relaxed">
                          {rec}
                        </p>
                      </div>
                    ))}
                  </div>
                  {analysis.insights && (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-2">Sleep Insights:</h5>
                      <p className="text-sm text-blue-700">{analysis.insights}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default SleepHealthPage;