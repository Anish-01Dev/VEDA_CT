import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  Heart, 
  Brain, 
  Stomach, 
  Eye, 
  Thermometer,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { aiClient } from '@/lib/ai-client';
import { SymptomAnalysis } from '@/lib/ai-client';
import { MEDICAL_CONDITIONS, SYMPTOM_CLUSTERS } from '@/lib/medical-database';

interface SymptomCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  symptoms: string[];
  color: string;
}

const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'respiratory',
    name: 'Respiratory',
    icon: <Activity className="w-4 h-4" />,
    symptoms: ['cough', 'shortness of breath', 'chest pain', 'fever', 'sore throat', 'runny nose'],
    color: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'cardiovascular',
    name: 'Cardiovascular',
    icon: <Heart className="w-4 h-4" />,
    symptoms: ['chest pain', 'palpitations', 'shortness of breath', 'dizziness', 'swelling'],
    color: 'bg-red-100 text-red-800'
  },
  {
    id: 'neurological',
    name: 'Neurological',
    icon: <Brain className="w-4 h-4" />,
    symptoms: ['headache', 'dizziness', 'numbness', 'confusion', 'seizures', 'vision problems'],
    color: 'bg-purple-100 text-purple-800'
  },
  {
    id: 'gastrointestinal',
    name: 'Gastrointestinal',
    icon: <Stomach className="w-4 h-4" />,
    symptoms: ['nausea', 'vomiting', 'abdominal pain', 'diarrhea', 'constipation', 'bloating'],
    color: 'bg-green-100 text-green-800'
  },
  {
    id: 'general',
    name: 'General',
    icon: <Thermometer className="w-4 h-4" />,
    symptoms: ['fever', 'fatigue', 'weakness', 'weight loss', 'night sweats', 'chills'],
    color: 'bg-orange-100 text-orange-800'
  }
];

interface SelectedSymptom {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  category: string;
}

export default function EnhancedSymptomCheckerV2() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<SelectedSymptom[]>([]);
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('symptoms');
  const [emergencyMode, setEmergencyMode] = useState(false);

  // Check for emergency symptoms
  useEffect(() => {
    const emergencySymptoms = selectedSymptoms.some(s => 
      ['chest pain', 'shortness of breath', 'severe headache', 'numbness', 'confusion'].includes(s.symptom) &&
      s.severity === 'severe'
    );
    setEmergencyMode(emergencySymptoms);
  }, [selectedSymptoms]);

  const addSymptom = (symptom: string, category: string) => {
    if (!selectedSymptoms.find(s => s.symptom === symptom)) {
      setSelectedSymptoms(prev => [...prev, {
        symptom,
        severity: 'moderate',
        duration: '1-2 days',
        category
      }]);
    }
  };

  const removeSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => prev.filter(s => s.symptom !== symptom));
  };

  const updateSymptom = (symptom: string, updates: Partial<SelectedSymptom>) => {
    setSelectedSymptoms(prev => prev.map(s => 
      s.symptom === symptom ? { ...s, ...updates } : s
    ));
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const symptomText = selectedSymptoms
        .map(s => `${s.symptom} (${s.severity}, ${s.duration})`)
        .join(', ');

      const result = await aiClient.analyzeSymptoms(symptomText, 'en');
      setAnalysis(result);
      setActiveTab('analysis');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'severe': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'mild': return <CheckCircle className="w-4 h-4" />;
      case 'moderate': return <Info className="w-4 h-4" />;
      case 'severe': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Emergency Alert */}
      {emergencyMode && (
        <Alert className="border-red-500 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 font-semibold">
            🚨 EMERGENCY SYMPTOMS DETECTED: You have selected severe symptoms that may require immediate medical attention. 
            Please call emergency services (108) immediately or go to the nearest emergency room.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Enhanced Symptom Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="symptoms">Select Symptoms</TabsTrigger>
              <TabsTrigger value="analysis">Analysis Results</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="symptoms" className="space-y-6">
              {/* Selected Symptoms */}
              {selectedSymptoms.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Selected Symptoms</h3>
                  <div className="grid gap-3">
                    {selectedSymptoms.map((symptom, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className={getSeverityColor(symptom.severity)}>
                            {getSeverityIcon(symptom.severity)}
                            {symptom.severity}
                          </Badge>
                          <span className="font-medium">{symptom.symptom}</span>
                          <span className="text-sm text-gray-500">({symptom.duration})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={symptom.severity}
                            onChange={(e) => updateSymptom(symptom.symptom, { severity: e.target.value as any })}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="mild">Mild</option>
                            <option value="moderate">Moderate</option>
                            <option value="severe">Severe</option>
                          </select>
                          <select
                            value={symptom.duration}
                            onChange={(e) => updateSymptom(symptom.symptom, { duration: e.target.value })}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="< 1 day">Less than 1 day</option>
                            <option value="1-2 days">1-2 days</option>
                            <option value="3-7 days">3-7 days</option>
                            <option value="> 1 week">More than 1 week</option>
                          </select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSymptom(symptom.symptom)}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={analyzeSymptoms} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Symptoms'}
                  </Button>
                </div>
              )}

              {/* Symptom Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Select Your Symptoms</h3>
                <div className="grid gap-4">
                  {SYMPTOM_CATEGORIES.map((category) => (
                    <Card key={category.id}>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {category.icon}
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {category.symptoms.map((symptom) => (
                            <Button
                              key={symptom}
                              variant="outline"
                              size="sm"
                              onClick={() => addSymptom(symptom, category.id)}
                              disabled={selectedSymptoms.some(s => s.symptom === symptom)}
                              className={selectedSymptoms.some(s => s.symptom === symptom) ? 'bg-blue-100' : ''}
                            >
                              {symptom}
                            </Button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {analysis ? (
                <div className="space-y-6">
                  {/* Condition Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{analysis.condition}</h3>
                        <Badge className={getSeverityColor(analysis.severity)}>
                          {analysis.severity.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <Progress value={analysis.confidence} className="w-32" />
                        <span className="text-sm font-medium">{analysis.confidence}%</span>
                      </div>

                      <p className="text-gray-700">{analysis.description}</p>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Emergency Contact */}
                  {analysis.emergency_contact && (
                    <Alert className="border-orange-500 bg-orange-50">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <AlertDescription className="text-orange-700">
                        {analysis.emergency_contact}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Medical Reasoning */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Medical Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{analysis.reasoning}</p>
                    </CardContent>
                  </Card>

                  {/* Follow-up */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Follow-up Instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-line">{analysis.follow_up}</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No analysis results yet. Please select symptoms and run analysis.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Symptom history will be available here.</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
