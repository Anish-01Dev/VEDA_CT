import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, MessageCircle, TrendingUp, Calendar, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { geminiAPI } from '@/lib/gemini-api';

interface MoodEntry {
  date: string;
  mood: string;
  tone: 'stress' | 'anxiety' | 'burnout' | 'positive' | 'neutral' | 'crisis';
  analysis: string;
  suggestions: string[];
}

interface NeuroMateProps {
  className?: string;
}

export function NeuroMate({ className }: NeuroMateProps) {
  const [message, setMessage] = useState('');
  const [moodAnalysis, setMoodAnalysis] = useState<MoodEntry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [weeklyEntries, setWeeklyEntries] = useState<MoodEntry[]>([]);

  useEffect(() => {
    loadWeeklyData();
  }, []);

  const loadWeeklyData = () => {
    const saved = localStorage.getItem('neuromate_weekly');
    if (saved) {
      setWeeklyEntries(JSON.parse(saved));
    }
  };

  const analyzeMood = async () => {
    if (!message.trim()) {
      toast({ title: 'Please share how you\'re feeling', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Crisis detection first
      const crisisKeywords = ['kill', 'suicide', 'die', 'hurt myself', 'end it all', 'no point', 'worthless'];
      const messageLower = message.toLowerCase();
      const isCrisis = crisisKeywords.some(keyword => messageLower.includes(keyword));
      
      if (isCrisis) {
        const crisisAnalysis = {
          tone: 'crisis',
          analysis: 'I notice you may be going through a very difficult time. Your feelings are valid, but please know that help is available. You are not alone, and there are people who want to support you.',
          suggestions: [
            'Contact National Suicide Prevention Lifeline: 988',
            'Reach out to a trusted friend, family member, or counselor',
            'Go to your nearest emergency room if you are in immediate danger',
            'Text HOME to 741741 for Crisis Text Line support'
          ]
        };
        
        const entry: MoodEntry = {
          date: new Date().toISOString().split('T')[0],
          mood: message,
          tone: 'crisis',
          analysis: crisisAnalysis.analysis,
          suggestions: crisisAnalysis.suggestions
        };
        
        setMoodAnalysis(entry);
        const updated = [entry, ...weeklyEntries.slice(0, 6)];
        setWeeklyEntries(updated);
        localStorage.setItem('neuromate_weekly', JSON.stringify(updated));
        
        toast({ title: '🆘 Crisis Support Available', description: 'Please reach out for help' });
        return;
      }
      
      const prompt = `As a mental health AI assistant, analyze this emotional expression:

"${message}"

Provide detailed analysis including:
1. Primary emotional tone (stress/anxiety/burnout/positive/neutral)
2. Detailed psychological assessment
3. Specific CBT techniques
4. Mindfulness exercises
5. Therapeutic suggestions

IMPORTANT: Be empathetic and provide actionable mental health support.

Return JSON format:
{
  "tone": "stress|anxiety|burnout|positive|neutral",
  "analysis": "detailed emotional and psychological analysis",
  "suggestions": ["specific CBT technique", "mindfulness exercise", "therapeutic activity"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 500,
            topK: 40,
            topP: 0.95
          }
        })
      });

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      
      let analysis;
      try {
        const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || text.match(/({[\s\S]*?})/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        // Enhanced fallback based on keywords
        let tone = 'neutral';
        if (messageLower.includes('stress') || messageLower.includes('overwhelm')) tone = 'stress';
        else if (messageLower.includes('anxious') || messageLower.includes('worry')) tone = 'anxiety';
        else if (messageLower.includes('tired') || messageLower.includes('exhausted')) tone = 'burnout';
        else if (messageLower.includes('happy') || messageLower.includes('good')) tone = 'positive';
        
        analysis = {
          tone,
          analysis: text || 'I understand you\'re sharing your feelings with me. Based on what you\'ve expressed, here are some personalized recommendations to support your mental wellness.',
          suggestions: [
            'Practice the 4-7-8 breathing technique: inhale for 4, hold for 7, exhale for 8',
            'Try a 5-minute mindfulness meditation focusing on present moment awareness',
            'Write down three things you\'re grateful for today in a journal'
          ]
        };
      }

      const entry: MoodEntry = {
        date: new Date().toISOString().split('T')[0],
        mood: message,
        tone: analysis.tone,
        analysis: analysis.analysis,
        suggestions: analysis.suggestions
      };

      setMoodAnalysis(entry);
      
      const updated = [entry, ...weeklyEntries.slice(0, 6)];
      setWeeklyEntries(updated);
      localStorage.setItem('neuromate_weekly', JSON.stringify(updated));

      toast({ title: '🧠 Mood analyzed successfully!' });
    } catch (error) {
      console.error('Mood analysis error:', error);
      toast({ title: 'Analysis failed', description: 'Please try again', variant: 'destructive' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getToneColor = (tone: string) => {
    const colors = {
      stress: 'red-500',
      anxiety: 'orange-500',
      burnout: 'purple-500',
      positive: 'green-500',
      neutral: 'blue-500',
      crisis: 'red-600'
    };
    return colors[tone as keyof typeof colors] || 'blue-500';
  };

  const getToneIcon = (tone: string) => {
    const icons = {
      stress: '😰',
      anxiety: '😟',
      burnout: '😴',
      positive: '😊',
      neutral: '😐',
      crisis: '🆘'
    };
    return icons[tone as keyof typeof icons] || '😐';
  };

  const reset = () => {
    setMessage('');
    setMoodAnalysis(null);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-health-purple-500" />
            🧠 NeuroMate – Mental Health Companion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Daily AI mood check-in with personalized mental health support
          </p>
        </CardContent>
      </Card>

      {/* Mood Check-in */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-health-blue-500" />
            Daily Mood Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="How are you feeling today? Share your thoughts, emotions, or any challenges you're facing..."
            className="w-full p-4 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-health-blue-500/50 min-h-[120px]"
          />
          
          <div className="flex gap-3">
            <Button
              onClick={analyzeMood}
              disabled={!message.trim() || isAnalyzing}
              className="flex-1 health-gradient text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Analyze Mood
                </>
              )}
            </Button>
            
            {moodAnalysis && (
              <Button onClick={reset} variant="outline" className="border-white/20">
                New Check-in
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mood Analysis Result */}
      <AnimatePresence>
        {moodAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`glass-card border-${getToneColor(moodAnalysis.tone)}/30`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full bg-${getToneColor(moodAnalysis.tone)}/20 flex items-center justify-center text-2xl`}>
                    {getToneIcon(moodAnalysis.tone)}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className={`text-xl font-bold text-${getToneColor(moodAnalysis.tone)} mb-1`}>
                        {moodAnalysis.tone.toUpperCase()} Detected
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(moodAnalysis.date).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">AI Analysis:</h4>
                      <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg mb-4">
                        {moodAnalysis.analysis || 'Your emotional state has been analyzed and personalized recommendations are provided below.'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Personalized Suggestions:</h4>
                      <ul className="space-y-2">
                        {moodAnalysis.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-health-blue-500 mt-1">•</span>
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Summary */}
      {weeklyEntries.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-health-teal-500" />
              Weekly Mood Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {weeklyEntries.slice(0, 7).map((entry, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className={`bg-${getToneColor(entry.tone)}/10 border border-${getToneColor(entry.tone)}/20 rounded-lg p-3`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getToneIcon(entry.tone)}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {entry.tone.charAt(0).toUpperCase() + entry.tone.slice(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mental Health Resources */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-health-green-500" />
            Mental Health Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button variant="outline" className="justify-start border-white/20 hover:bg-white/5">
              <Heart className="w-4 h-4 mr-2" />
              CBT Exercises
            </Button>
            <Button variant="outline" className="justify-start border-white/20 hover:bg-white/5">
              <Calendar className="w-4 h-4 mr-2" />
              Meditation Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}