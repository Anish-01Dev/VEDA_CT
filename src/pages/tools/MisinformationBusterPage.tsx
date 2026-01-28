import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Globe,
  Clock,
  Shield,
  ExternalLink
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";
import aiClient, { MisinformationAnalysis } from "@/lib/ai-client";
import dbManager from "@/lib/database-schema";

const TRUSTED_SOURCES = [
  { name: "WHO", url: "https://www.who.int/", description: "World Health Organization" },
  { name: "CDC", url: "https://www.cdc.gov/", description: "Centers for Disease Control" },
  { name: "ICMR", url: "https://icmr.gov.in/", description: "Indian Council of Medical Research" },
  { name: "PIB", url: "https://pib.gov.in/", description: "Press Information Bureau" },
  { name: "IMA", url: "https://ima-india.org/", description: "Indian Medical Association" },
];

const MisinformationBusterPage = () => {
  const navigate = useNavigate();
  const [claim, setClaim] = useState("");
  const [result, setResult] = useState<MisinformationAnalysis | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "hi" | "ta">("en");
  const [error, setError] = useState<string | null>(null);

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
    { code: "ta", name: "தமிழ்", flag: "🇮🇳" }
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const aiSessions = await dbManager.getAISessionHistory(10);
      const misinformationSessions = aiSessions.filter(session => session.session_type === 'misinformation');
      setHistory(misinformationSessions);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await aiClient.analyzeMisinformation(claim, selectedLanguage);
      setResult(analysis);

      // Save to database
      await dbManager.addAISession({
        timestamp: new Date().toISOString(),
        session_type: 'misinformation',
        user_input: claim,
        ai_response: JSON.stringify(analysis),
        confidence: analysis.confidence,
        language: selectedLanguage,
        offline_mode: !aiClient.getConnectivityStatus()
      });

      // Reload history
      await loadHistory();
      setClaim("");
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'true': return 'bg-green-500 text-white';
      case 'false': return 'bg-red-500 text-white';
      case 'misleading': return 'bg-yellow-500 text-white';
      case 'unverified': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'true': return <CheckCircle className="w-4 h-4" />;
      case 'false': return <XCircle className="w-4 h-4" />;
      case 'misleading': return <AlertTriangle className="w-4 h-4" />;
      case 'unverified': return <HelpCircle className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getVerdictText = (verdict: string, language: string) => {
    const texts = {
      true: { en: "TRUE", hi: "सत्य", ta: "உண்மை" },
      false: { en: "FALSE", hi: "गलत", ta: "தவறு" },
      misleading: { en: "MISLEADING", hi: "भ्रामक", ta: "தவறான" },
      unverified: { en: "UNVERIFIED", hi: "असत्यापित", ta: "சரிபார்க்கப்படவில்லை" }
    };
    return texts[verdict as keyof typeof texts]?.[language as keyof typeof texts.en] || verdict.toUpperCase();
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
            <div className="p-2 rounded-lg bg-[#F6E05E20] text-[#F6E05E]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#2D3748] font-nunito">Misinformation Buster</h1>
              <p className="text-sm text-[#4A5568] font-inter">AI-powered fact-checking for health claims</p>
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

        {/* Input Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white border border-[#E2E8F0]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                <Search className="w-5 h-5 text-[#4A9B8E]" />
                Verify Health Claim
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#2D3748]">
                    Paste health claim, article link, or WhatsApp message
                  </label>
                  <Textarea
                    value={claim}
                    onChange={(e) => setClaim(e.target.value)}
                    placeholder={
                      selectedLanguage === 'hi' ? "स्वास्थ्य दावा, लेख लिंक, या WhatsApp संदेश पेस्ट करें..." :
                      selectedLanguage === 'ta' ? "சுகாதார கோரிக்கை, கட்டுரை இணைப்பு, அல்லது WhatsApp செய்தியை ஒட்டவும்..." :
                      "Paste health claim, article link, or WhatsApp message..."
                    }
                    className="min-h-[120px] resize-none border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E]"
                    disabled={isAnalyzing}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={!claim.trim() || isAnalyzing}
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
                      <Search className="w-4 h-4" />
                      {selectedLanguage === 'hi' ? "दावा सत्यापित करें" :
                       selectedLanguage === 'ta' ? "கோரிக்கையை சரிபார்க்கவும்" :
                       "Verify Claim"}
                    </div>
                  )}
                </Button>
              </form>
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
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Verdict */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#4A9B8E]" />
                    Fact-Check Result
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-[#F8F5F0] rounded-xl">
                    <Badge className={`${getVerdictColor(result.verdict)} flex items-center gap-2`}>
                      {getVerdictIcon(result.verdict)}
                      {getVerdictText(result.verdict, selectedLanguage)}
                    </Badge>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold text-[#2D3748]">
                          {selectedLanguage === 'hi' ? "आत्मविश्वास:" :
                           selectedLanguage === 'ta' ? "நம்பிக்கை:" :
                           "Confidence:"}
                        </span>
                        <span className="text-sm font-bold text-[#4A9B8E]">{result.confidence}%</span>
                      </div>
                      <Progress value={result.confidence} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-[#2D3748] mb-2">
                        {selectedLanguage === 'hi' ? "तर्कसंगत विश्लेषण" :
                         selectedLanguage === 'ta' ? "பகுத்தறிவு பகுப்பாய்வு" :
                         "Reasoning"}
                      </h4>
                      <p className="text-sm text-[#4A5568] leading-relaxed">{result.reasoning}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-[#2D3748] mb-2">
                        {selectedLanguage === 'hi' ? "तथ्य जांच" :
                         selectedLanguage === 'ta' ? "உண்மை சரிபார்ப்பு" :
                         "Fact Check"}
                      </h4>
                      <p className="text-sm text-[#4A5568] leading-relaxed">{result.fact_check}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-[#4A9B8E]" />
                    {selectedLanguage === 'hi' ? "सिफारिशें" :
                     selectedLanguage === 'ta' ? "பரிந்துரைகள்" :
                     "Recommendations"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-[#F8F5F0] rounded-lg">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#4A9B8E20] rounded-full flex items-center justify-center text-sm font-bold text-[#4A9B8E]">
                          {index + 1}
                        </span>
                        <p className="text-sm text-[#2D3748] leading-relaxed">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trusted Sources */}
              <Card className="bg-white border border-[#E2E8F0]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-[#4A9B8E]" />
                    {selectedLanguage === 'hi' ? "विश्वसनीय स्रोत" :
                     selectedLanguage === 'ta' ? "நம்பகமான ஆதாரங்கள்" :
                     "Trusted Sources"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TRUSTED_SOURCES.map((source) => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-[#F8F5F0] rounded-lg hover:bg-[#4A9B8E10] transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-[#4A9B8E]" />
                        <div>
                          <p className="font-semibold text-[#2D3748] text-sm">{source.name}</p>
                          <p className="text-xs text-[#4A5568]">{source.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white border border-[#E2E8F0]">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-[#2D3748] font-nunito flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#4A9B8E]" />
                  {selectedLanguage === 'hi' ? "पिछले सत्यापन" :
                   selectedLanguage === 'ta' ? "முந்தைய சரிபார்ப்புகள்" :
                   "Recent Verifications"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {history.slice(0, 5).map((session) => {
                    try {
                      const analysis = JSON.parse(session.ai_response);
                      return (
                        <div key={session.id} className="p-3 bg-[#F8F5F0] rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`${getVerdictColor(analysis.verdict)} text-xs`}>
                              {getVerdictText(analysis.verdict, selectedLanguage)}
                            </Badge>
                            <span className="text-xs text-[#4A5568]">
                              {new Date(session.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-[#2D3748] line-clamp-2">
                            {session.user_input.length > 100 
                              ? session.user_input.substring(0, 100) + "..." 
                              : session.user_input}
                          </p>
                        </div>
                      );
                    } catch {
                      return null;
                    }
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        )}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
};

export default MisinformationBusterPage; 