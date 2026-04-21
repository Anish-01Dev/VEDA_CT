import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Moon, Sun, Clock, Activity, BedDouble, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
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
      const API_KEY = import.meta.env.VITE_GEMINI_TEXT_KEY ?? '';
      const MODEL = 'gemini-3-flash-preview';
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
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`, {
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
            <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              {/* Score Card */}
              <Card className="bg-gradient-to-br from-[#2A9D8F] to-[#4A9B8E] text-white border-0">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl font-bold mb-1">{analysis.sleepScore}</div>
                  <div className="text-white/80 text-sm mb-3">Sleep Score / 100</div>
                  <Badge className={`${
                    analysis.sleepScore >= 80 ? 'bg-green-400' :
                    analysis.sleepScore >= 60 ? 'bg-yellow-400 text-gray-800' : 'bg-red-400'
                  } border-0 text-sm px-3 py-1`}>
                    {analysis.sleepScore >= 80 ? '😴 Excellent' : analysis.sleepScore >= 60 ? '😐 Good' : '😟 Needs Improvement'}
                  </Badge>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">{analysis.sleepDuration}h</div>
                      <div className="text-xs text-white/80">{t('total.sleep')}</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-3">
                      <div className="text-2xl font-bold">{analysis.sleepPhases?.deep || 0}h</div>
                      <div className="text-xs text-white/80">{t('deep.sleep')}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sleep Phases Bar */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#2D3748]">Sleep Phases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Deep Sleep', value: analysis.sleepPhases?.deep || 0, color: 'bg-[#2A9D8F]', icon: '🌊' },
                    { label: 'REM Sleep', value: analysis.sleepPhases?.rem || 0, color: 'bg-purple-500', icon: '💭' },
                    { label: 'Light Sleep', value: analysis.sleepPhases?.light || 0, color: 'bg-blue-300', icon: '☁️' },
                  ].map((phase) => (
                    <div key={phase.label}>
                      <div className="flex justify-between text-xs text-[#4A5568] mb-1">
                        <span>{phase.icon} {phase.label}</span>
                        <span className="font-semibold">{phase.value}h</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(phase.value / parseFloat(analysis.sleepDuration)) * 100}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full ${phase.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Insights */}
              {analysis.insights && (
                <Card className="bg-blue-50 border border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-800 leading-relaxed">{analysis.insights}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-[#2D3748] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4A9B8E]" />
                    {t('ai.recommendations')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analysis.recommendations?.map((rec: string, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-[#F8F5F0] rounded-lg"
                    >
                      <div className="w-5 h-5 bg-[#4A9B8E] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-sm text-[#4A5568] leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default SleepHealthPage;