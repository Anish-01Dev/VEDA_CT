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
import { useLanguage } from "@/contexts/language-context";



interface SleepData {
  bedtime: string;
  wakeTime: string;
  sleepQuality: number;
  dreamActivity: boolean;
  interruptions: number;
}

const formatTime12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

const SleepHealthPage = () => {
  const navigate = useNavigate();
  const { currentLanguage, t } = useLanguage();
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
      const API_KEY = 'REDACTED_GOOGLE_API_KEY';
      const bedTime = new Date(`2024-01-01 ${sleepData.bedtime}`);
      const wakeTime = new Date(`2024-01-01 ${sleepData.wakeTime}`);
      let sleepDuration = (wakeTime.getTime() - bedTime.getTime()) / (1000 * 60 * 60);
      
      if (sleepDuration < 0) sleepDuration += 24;
      
      const languageMap = {
        'en': 'English',
        'hi': 'Hindi (हिंदी)',
        'ta': 'Tamil (தமிழ்)',
        'te': 'Telugu (తెలుగు)',
        'pa': 'Punjabi (ਪੰਜਾਬੀ)'
      };
      
      const targetLanguage = languageMap[currentLanguage] || 'English';
      const languageInstruction = currentLanguage !== 'en' 
        ? `CRITICAL: All recommendations, insights, and analysis MUST be written ONLY in ${targetLanguage}. Do not use any English words or phrases.`
        : '';
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze this sleep data and provide personalized recommendations. ${languageInstruction}
              
              Return ONLY a valid JSON response with:
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
              - Bedtime: ${formatTime12Hour(sleepData.bedtime)}
              - Wake time: ${formatTime12Hour(sleepData.wakeTime)}
              - Sleep duration: ${sleepDuration.toFixed(1)} hours
              - Sleep quality (1-10): ${sleepData.sleepQuality}
              - Interruptions: ${sleepData.interruptions}
              
              IMPORTANT: Return ONLY the JSON object, no additional text. All text content in the JSON must be in ${targetLanguage}.`
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
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">{t('sleep.health.analyzer')}</h1>
              <p className="text-sm text-[#4A5568] font-inter">{t('track.improve.sleep')}</p>
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
                {t('sleep.tracker')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedtime" className="text-sm font-semibold text-[#2D3748] font-nunito">
                    {t('bedtime')}
                  </Label>
                  <Input
                    id="bedtime"
                    type="time"
                    value={sleepData.bedtime}
                    onChange={(e) => setSleepData({...sleepData, bedtime: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                  {sleepData.bedtime && (
                    <p className="text-xs text-[#4A5568] mt-1">{formatTime12Hour(sleepData.bedtime)}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="waketime" className="text-sm font-semibold text-[#2D3748] font-nunito">
                    {t('wake.time')}
                  </Label>
                  <Input
                    id="waketime"
                    type="time"
                    value={sleepData.wakeTime}
                    onChange={(e) => setSleepData({...sleepData, wakeTime: e.target.value})}
                    className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                  />
                  {sleepData.wakeTime && (
                    <p className="text-xs text-[#4A5568] mt-1">{formatTime12Hour(sleepData.wakeTime)}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold text-[#2D3748] font-nunito">
                  {t('sleep.quality')}
                </Label>
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
                <Label htmlFor="interruptions" className="text-sm font-semibold text-[#2D3748] font-nunito">
                  {t('sleep.interruptions')}
                </Label>
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
                {isAnalyzing 
                  ? t('analyzing') 
                  : t('analyze.sleep')
                }
              </Button>
            </CardContent>
          </Card>

          {analysis && (
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bold text-[#2D3748] font-nunito">
                  <Activity className="w-5 h-5 text-[#4A9B8E]" />
                  {t('sleep.analysis')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#4A9B8E] mb-2 font-nunito">{analysis.sleepScore}/100</div>
                  <Badge variant={analysis.sleepScore >= 80 ? "default" : analysis.sleepScore >= 60 ? "secondary" : "destructive"} className="bg-[#38A169] text-white">
                    {analysis.sleepScore >= 80 
                      ? t('excellent')
                      : analysis.sleepScore >= 60 
                      ? t('good')
                      : t('needs.improvement')
                    }
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#2D3748] font-nunito">{analysis.sleepDuration}h</div>
                    <div className="text-sm text-[#4A5568] font-inter">
                      {t('total.sleep')}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#4A9B8E] font-nunito">{analysis.sleepPhases.deep}h</div>
                    <div className="text-sm text-[#4A5568] font-inter">
                      {t('deep.sleep')}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-[#2D3748] font-nunito">
                    {t('ai.recommendations')}
                  </h4>
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
                      <h5 className="font-semibold text-blue-800 mb-2">
                        {t('sleep.insights')}
                      </h5>
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