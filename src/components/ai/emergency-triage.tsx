import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Phone, Clock, Home, Stethoscope, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { geminiAPI, type SymptomAnalysis } from '@/lib/gemini-api';

interface TriageResult {
  severity: 'mild' | 'moderate' | 'severe';
  icon: string;
  color: string;
  action: string;
  timeframe: string;
  analysis: string;
  recommendations: string[];
  possibleConditions: string[];
}

interface EmergencyTriageProps {
  className?: string;
}

export function EmergencyTriage({ className }: EmergencyTriageProps) {
  const [symptoms, setSymptoms] = useState('');
  const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const severityLevels = {
    mild: {
      severity: 'mild' as const,
      icon: '🟢',
      color: 'green-500',
      action: 'Home remedies',
      timeframe: 'Monitor symptoms',
      recommendations: [
        'Rest and stay hydrated',
        'Use over-the-counter medications as needed',
        'Monitor symptoms for changes',
        'Contact doctor if symptoms worsen'
      ]
    },
    moderate: {
      severity: 'moderate' as const,
      icon: '🟡',
      color: 'yellow-500',
      action: 'See doctor in 24h',
      timeframe: 'Within 24 hours',
      recommendations: [
        'Schedule appointment with your doctor',
        'Contact primary care physician',
        'Monitor symptoms closely',
        'Seek immediate care if symptoms worsen'
      ]
    },
    severe: {
      severity: 'severe' as const,
      icon: '🔴',
      color: 'red-500',
      action: 'Call emergency',
      timeframe: 'Immediate attention',
      recommendations: [
        'Call emergency services immediately',
        'Go to nearest emergency room',
        'Do not drive yourself',
        'Have someone stay with you'
      ]
    }
  };

  const classifySymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please describe your symptoms.',
        variant: 'destructive'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysis = await geminiAPI.analyzeSymptoms(symptoms);
      const baseResult = severityLevels[analysis.severity];
      
      setTriageResult({
        ...baseResult,
        analysis: analysis.analysis,
        recommendations: analysis.recommendations,
        possibleConditions: analysis.possibleConditions
      });
      
      setAiResponse(analysis.analysis);
      
      toast({
        title: 'AI Analysis Complete',
        description: `Severity: ${analysis.severity.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Triage error:', error);
      toast({
        title: 'Analysis Error',
        description: 'Using fallback classification',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const callEmergency = () => {
    if (confirm('This will attempt to call emergency services. In a real emergency, call your local emergency number immediately!')) {
      // In a real app, this would integrate with device calling capabilities
      window.open('tel:911', '_self');
    }
  };

  const reset = () => {
    setSymptoms('');
    setTriageResult(null);
    setAiResponse('');
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Input Section */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-health-blue-500" />
            Symptom & Emergency Triage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., chest tightness + dizziness"
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg resize-none focus:outline-none focus:border-health-blue-500/50 min-h-[100px]"
            />
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={classifySymptoms}
              disabled={!symptoms.trim() || isAnalyzing}
              className="flex-1 health-gradient text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                <>
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </Button>
            
            {triageResult && (
              <Button onClick={reset} variant="outline" className="border-white/20">
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Triage Result */}
      <AnimatePresence>
        {triageResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className={`glass-card border-${triageResult.color}/30`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full bg-${triageResult.color}/20 flex items-center justify-center text-2xl`}>
                    {triageResult.icon}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className={`text-xl font-bold text-${triageResult.color} mb-1`}>
                        {triageResult.severity.toUpperCase()} Priority
                      </h3>
                      <p className={`text-${triageResult.color} font-medium`}>
                        {triageResult.action}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {triageResult.timeframe}
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">AI Analysis:</h4>
                        <p className="text-sm text-muted-foreground bg-white/5 p-3 rounded-lg">
                          {triageResult.analysis}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Possible Conditions:</h4>
                        <ul className="space-y-1">
                          {triageResult.possibleConditions.map((condition, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-health-purple-500 mt-1">•</span>
                              <span>{condition}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Recommended Actions:</h4>
                        <ul className="space-y-1">
                          {triageResult.recommendations.map((rec, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="text-health-blue-500 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {triageResult.severity === 'severe' && (
                      <Button
                        onClick={callEmergency}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Phone className="w-4 h-4 mr-2" />
                        Call Emergency Services
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Severity Guide */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-health-purple-500" />
            Triage Classification Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.values(severityLevels).map((level, index) => (
            <motion.div
              key={level.severity}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className={`bg-${level.color}/10 border border-${level.color}/20 rounded-lg p-4`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xl">{level.icon}</span>
                <div>
                  <h4 className={`font-semibold text-${level.color}`}>
                    {level.severity.toUpperCase()}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {level.action} • {level.timeframe}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Warning */}
      <Card className="glass-card border-red-500/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-red-500 mb-2">Emergency Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                This triage system is for guidance only. In a real emergency, 
                call your local emergency services immediately. Do not rely solely on AI for emergency decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}