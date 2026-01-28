import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Baby, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Brain,
  Stethoscope,
  Plus,
  BarChart3,
  Target,
  Clock,
  Weight,
  Thermometer,
  Activity as ActivityIcon,
  TrendingUp,
  Shield,
  BookOpen,
  Users
} from "lucide-react";
import { navItems } from "@/lib/navigation-config";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { aiClient } from "@/lib/ai-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  addCheck as dbAddCheck, 
  getChecks as dbGetChecks, 
  addPregnancyInfo as dbAddPregnancyInfo, 
  getPregnancyInfo as dbGetPregnancyInfo,
  addMilestone as dbAddMilestone,
  getMilestones as dbGetMilestones,
  updateMilestone as dbUpdateMilestone
} from "@/lib/maternal-health-sqlite";

interface HealthCheck {
  id: number;
  date: string;
  symptoms: string;
  risk: string;
  advice: string;
  severity: string;
  confidence: number;
  language: string;
  pregnancy_week?: number;
  weight?: number;
  blood_pressure?: string;
  notes?: string;
}

interface PregnancyInfo {
  id: number;
  due_date: string;
  last_period_date: string;
  pregnancy_week: number;
  trimester: number;
  created_at: string;
}

interface Milestone {
  id: number;
  date: string;
  milestone_type: string;
  description: string;
  notes?: string;
  completed: boolean;
}

const PREGNANCY_MILESTONES = [
  { week: 4, type: "development", description: "Heart begins to form", category: "Early Development" },
  { week: 8, type: "development", description: "All major organs begin forming", category: "Organ Development" },
  { week: 12, type: "milestone", description: "First trimester ends", category: "Trimester Milestone" },
  { week: 16, type: "development", description: "Baby can hear your voice", category: "Sensory Development" },
  { week: 20, type: "milestone", description: "Halfway point - anatomy scan", category: "Medical Milestone" },
  { week: 24, type: "development", description: "Baby's lungs begin to develop", category: "Organ Development" },
  { week: 28, type: "milestone", description: "Third trimester begins", category: "Trimester Milestone" },
  { week: 32, type: "development", description: "Baby practices breathing", category: "Development" },
  { week: 36, type: "milestone", description: "Baby is considered full-term", category: "Medical Milestone" },
  { week: 40, type: "milestone", description: "Due date arrives", category: "Birth Milestone" },
];

const COMMON_SYMPTOMS = [
  'Nausea', 'Morning sickness', 'Fatigue', 'Swelling', 'Headache', 'Back pain',
  'Mood swings', 'Food cravings', 'Heartburn', 'Constipation', 'Bleeding', 'Cramping',
  'Blurred vision', 'Dizziness', 'Shortness of breath', 'Frequent urination'
];

const SEVERITY_LEVELS = ['low', 'moderate', 'high', 'critical'];

function calculatePregnancyWeek(lastPeriodDate: string): number {
  const lastPeriod = new Date(lastPeriodDate);
  const today = new Date();
  const diffTime = today.getTime() - lastPeriod.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return Math.max(0, Math.min(42, diffWeeks));
}

function getTrimester(week: number): number {
  if (week <= 12) return 1;
  if (week <= 28) return 2;
  return 3;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low': return 'text-green-600 bg-green-50 border-green-200';
    case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case 'low': return <CheckCircle className="w-4 h-4" />;
    case 'moderate': return <AlertTriangle className="w-4 h-4" />;
    case 'high': return <AlertTriangle className="w-4 h-4" />;
    case 'critical': return <AlertTriangle className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
}

const MaternalHealthAdvisorPage = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [pregnancyInfo, setPregnancyInfo] = useState<PregnancyInfo | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [symptomForm, setSymptomForm] = useState({
    symptoms: '',
    pregnancy_week: '',
    weight: '',
    blood_pressure: '',
    notes: ''
  });
  
  const [pregnancyForm, setPregnancyForm] = useState({
    due_date: '',
    last_period_date: ''
  });
  
  const [milestoneForm, setMilestoneForm] = useState({
    date: '',
    milestone_type: 'development',
    description: '',
    notes: ''
  });
  
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  // Auto-dismiss messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [checks, info, milestoneData] = await Promise.all([
          dbGetChecks(),
          dbGetPregnancyInfo(),
          dbGetMilestones()
        ]);
        setHealthChecks(checks);
        setPregnancyInfo(info);
        setMilestones(milestoneData);
        
        // Update pregnancy week in form if we have pregnancy info
        if (info) {
          const currentWeek = calculatePregnancyWeek(info.last_period_date);
          setSymptomForm(prev => ({ ...prev, pregnancy_week: currentWeek.toString() }));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please refresh the page.');
      }
    };
    loadData();
  }, []);

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomForm.symptoms.trim()) return;
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      // Generate AI analysis
      const analysis = await generateAIAnalysis(symptomForm.symptoms, pregnancyInfo);
      
      const weight = symptomForm.weight ? parseFloat(symptomForm.weight) : undefined;
      const pregnancyWeek = symptomForm.pregnancy_week ? parseInt(symptomForm.pregnancy_week) : undefined;
      
      await dbAddCheck(
        today,
        symptomForm.symptoms,
        analysis.risk,
        analysis.advice,
        analysis.severity,
        analysis.confidence,
        'en',
        pregnancyWeek,
        weight,
        symptomForm.blood_pressure,
        symptomForm.notes
      );
      
      const checks = await dbGetChecks();
      setHealthChecks(checks);
      setSymptomForm({
        symptoms: '',
        pregnancy_week: pregnancyInfo ? calculatePregnancyWeek(pregnancyInfo.last_period_date).toString() : '',
        weight: '',
        blood_pressure: '',
        notes: ''
      });
      setSuccess('Health check recorded successfully!');
      
      // Generate AI insights
      await generateAIInsights(checks, pregnancyInfo);
    } catch (error) {
      console.error('Error adding health check:', error);
      setError('Failed to record health check. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePregnancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pregnancyForm.due_date || !pregnancyForm.last_period_date) return;
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      const pregnancyWeek = calculatePregnancyWeek(pregnancyForm.last_period_date);
      const trimester = getTrimester(pregnancyWeek);
      
      await dbAddPregnancyInfo(
        pregnancyForm.due_date,
        pregnancyForm.last_period_date,
        pregnancyWeek,
        trimester
      );
      
      const info = await dbGetPregnancyInfo();
      setPregnancyInfo(info);
      setPregnancyForm({ due_date: '', last_period_date: '' });
      setSuccess('Pregnancy information saved successfully!');
      
      // Add default milestones
      await addDefaultMilestones(pregnancyForm.last_period_date);
      const milestoneData = await dbGetMilestones();
      setMilestones(milestoneData);
    } catch (error) {
      console.error('Error adding pregnancy info:', error);
      setError('Failed to save pregnancy information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMilestoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneForm.date || !milestoneForm.description) return;
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      await dbAddMilestone(
        milestoneForm.date,
        milestoneForm.milestone_type,
        milestoneForm.description,
        milestoneForm.notes
      );
      
      const milestoneData = await dbGetMilestones();
      setMilestones(milestoneData);
      setMilestoneForm({
        date: today,
        milestone_type: 'development',
        description: '',
        notes: ''
      });
      setSuccess('Milestone added successfully!');
    } catch (error) {
      console.error('Error adding milestone:', error);
      setError('Failed to add milestone. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMilestone = async (id: number, completed: boolean) => {
    try {
      await dbUpdateMilestone(id, completed);
      const milestoneData = await dbGetMilestones();
      setMilestones(milestoneData);
    } catch (error) {
      console.error('Error updating milestone:', error);
      setError('Failed to update milestone.');
    }
  };

  const addDefaultMilestones = async (lastPeriodDate: string) => {
    const lastPeriod = new Date(lastPeriodDate);
    
    for (const milestone of PREGNANCY_MILESTONES) {
      const milestoneDate = new Date(lastPeriod);
      milestoneDate.setDate(milestoneDate.getDate() + (milestone.week * 7));
      
      await dbAddMilestone(
        milestoneDate.toISOString().slice(0, 10),
        milestone.type,
        milestone.description,
        `Week ${milestone.week} - ${milestone.category}`,
        false
      );
    }
  };

  const generateAIAnalysis = async (symptoms: string, pregnancyInfo: PregnancyInfo | null) => {
    try {
      const pregnancyWeek = pregnancyInfo ? calculatePregnancyWeek(pregnancyInfo.last_period_date) : 0;
      const trimester = pregnancyInfo ? getTrimester(pregnancyWeek) : 0;
      
      const prompt = `Analyze these pregnancy symptoms and provide a comprehensive health assessment:

Symptoms: ${symptoms}
Pregnancy Week: ${pregnancyWeek}
Trimester: ${trimester}

Provide:
1. Risk level (low/moderate/high/critical)
2. Specific risk assessment
3. Detailed advice
4. Confidence level (0-100)
5. When to seek immediate medical care

Consider:
- Normal pregnancy symptoms vs concerning symptoms
- Trimester-specific risks
- Emergency warning signs
- When to contact healthcare provider

Respond in JSON format with fields: risk, advice, severity, confidence`;

      const response = await aiClient.getHealthAdvice(prompt, 'en');
      
      // Parse the AI response to extract structured data
      const risk = response.advice.includes('emergency') || response.advice.includes('immediate') ? 'Seek Immediate Care' : 'Monitor Symptoms';
      const severity = response.advice.includes('emergency') ? 'critical' : 
                      response.advice.includes('urgent') ? 'high' :
                      response.advice.includes('monitor') ? 'moderate' : 'low';
      
      return {
        risk,
        advice: response.advice,
        severity,
        confidence: response.confidence || 85
      };
    } catch (error) {
      console.error('AI analysis failed:', error);
      return {
        risk: 'Monitor Symptoms',
        advice: 'Please consult your healthcare provider for proper evaluation of these symptoms.',
        severity: 'moderate',
        confidence: 50
      };
    }
  };

  const generateAIInsights = async (checks: HealthCheck[], pregnancyInfo: PregnancyInfo | null) => {
    if (checks.length === 0) return;
    
    setLoading(true);
    try {
      const recentChecks = checks.slice(0, 5);
      const symptoms = recentChecks.map(c => c.symptoms).join(', ');
      const pregnancyWeek = pregnancyInfo ? calculatePregnancyWeek(pregnancyInfo.last_period_date) : 0;
      
      const prompt = `Analyze this maternal health data and provide personalized insights:

Recent Health Checks: ${recentChecks.length}
Pregnancy Week: ${pregnancyWeek}
Recent Symptoms: ${symptoms}
Risk Levels: ${recentChecks.map(c => c.severity).join(', ')}

Provide:
1. Overall health assessment
2. Pregnancy-specific recommendations
3. Warning signs to watch for
4. When to contact healthcare provider

Keep response supportive and informative.`;

      const response = await aiClient.getHealthAdvice(prompt, 'en');
      setAiInsights(response.advice);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setAiInsights('Unable to generate insights at the moment. Please ensure you have an active internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate current pregnancy week
  const currentWeek = pregnancyInfo ? calculatePregnancyWeek(pregnancyInfo.last_period_date) : 0;
  const currentTrimester = pregnancyInfo ? getTrimester(currentWeek) : 0;
  
  // Prepare chart data
  const chartData = healthChecks.slice(0, 30).reverse().map(check => ({
    date: check.date.slice(5), // MM-DD format
    severity: SEVERITY_LEVELS.indexOf(check.severity) + 1,
    confidence: check.confidence
  }));

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-24">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <h1 className="text-3xl font-bold text-[#2D3748] font-nunito flex items-center justify-center gap-2">
            <Baby className="w-8 h-8 text-[#F472B6]" />
            Maternal Health Advisor
          </h1>
          <p className="text-[#4A5568] max-w-2xl mx-auto">
            Comprehensive pregnancy health tracking with AI-powered insights, milestone monitoring, and personalized care recommendations.
          </p>
        </motion.div>

        {/* Error and Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="symptoms">Symptoms</TabsTrigger>
            <TabsTrigger value="pregnancy">Pregnancy</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Pregnancy Week */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pregnancy Week</p>
                      <p className="font-semibold text-2xl">{currentWeek}</p>
                      <p className="text-xs text-muted-foreground">Trimester {currentTrimester}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-[#4A9B8E]" />
                  </div>
                </CardContent>
              </Card>

              {/* Due Date */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-semibold text-lg">
                        {pregnancyInfo ? new Date(pregnancyInfo.due_date).toLocaleDateString() : 'Not set'}
                      </p>
                      {pregnancyInfo && (
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(pregnancyInfo.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                    <Heart className="w-8 h-8 text-[#F472B6]" />
                  </div>
                </CardContent>
              </Card>

              {/* Health Checks */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Health Checks</p>
                      <p className="font-semibold text-2xl">{healthChecks.length}</p>
                      <p className="text-xs text-muted-foreground">Total recorded</p>
                    </div>
                    <Stethoscope className="w-8 h-8 text-[#60A5FA]" />
                  </div>
                </CardContent>
              </Card>

              {/* Milestones */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Milestones</p>
                      <p className="font-semibold text-2xl">{milestones.filter(m => m.completed).length}/{milestones.length}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <Target className="w-8 h-8 text-[#A3E635]" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Trends Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Health Check Trends (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="severity" stroke="#F472B6" name="Severity Level" />
                      <Line type="monotone" dataKey="confidence" stroke="#60A5FA" name="Confidence %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Health Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Health Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {healthChecks.slice(0, 5).map((check) => (
                    <div key={check.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{new Date(check.date).toLocaleDateString()}</span>
                        <Badge className={getSeverityColor(check.severity)}>
                          {getSeverityIcon(check.severity)}
                          <span className="ml-1 capitalize">{check.severity}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">Symptoms: {check.symptoms}</p>
                      <p className="text-sm font-medium">Risk: {check.risk}</p>
                      <p className="text-sm text-muted-foreground">{check.advice}</p>
                    </div>
                  ))}
                  {healthChecks.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No health checks recorded yet. Start tracking your symptoms!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="symptoms" className="space-y-6">
            {/* Symptom Check Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Health Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSymptomSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Symptoms Description</label>
                    <Textarea 
                      value={symptomForm.symptoms} 
                      onChange={e => setSymptomForm(f => ({ ...f, symptoms: e.target.value }))} 
                      placeholder="Describe your symptoms in detail..."
                      rows={3}
                      required 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Pregnancy Week</label>
                      <Input 
                        type="number" 
                        min="1" 
                        max="42" 
                        value={symptomForm.pregnancy_week} 
                        onChange={e => setSymptomForm(f => ({ ...f, pregnancy_week: e.target.value }))} 
                        placeholder="e.g. 20"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Weight (kg) - Optional</label>
                      <Input 
                        type="number" 
                        step="0.1" 
                        value={symptomForm.weight} 
                        onChange={e => setSymptomForm(f => ({ ...f, weight: e.target.value }))} 
                        placeholder="e.g. 65.5"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Blood Pressure - Optional</label>
                      <Input 
                        type="text" 
                        value={symptomForm.blood_pressure} 
                        onChange={e => setSymptomForm(f => ({ ...f, blood_pressure: e.target.value }))} 
                        placeholder="e.g. 120/80"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Additional Notes - Optional</label>
                    <Textarea 
                      value={symptomForm.notes} 
                      onChange={e => setSymptomForm(f => ({ ...f, notes: e.target.value }))} 
                      placeholder="Any additional information..."
                      rows={2}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Analyzing...' : 'Check Symptoms'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Common Symptoms */}
            <Card>
              <CardHeader>
                <CardTitle>Common Pregnancy Symptoms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {COMMON_SYMPTOMS.map(symptom => (
                    <Button
                      key={symptom}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSymptomForm(prev => ({
                        ...prev,
                        symptoms: prev.symptoms ? `${prev.symptoms}, ${symptom}` : symptom
                      }))}
                      className="justify-start text-xs"
                    >
                      {symptom}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pregnancy" className="space-y-6">
            {!pregnancyInfo ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Set Up Pregnancy Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePregnancySubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Due Date</label>
                        <Input 
                          type="date" 
                          value={pregnancyForm.due_date} 
                          onChange={e => setPregnancyForm(f => ({ ...f, due_date: e.target.value }))} 
                          required 
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Last Period Date</label>
                        <Input 
                          type="date" 
                          value={pregnancyForm.last_period_date} 
                          onChange={e => setPregnancyForm(f => ({ ...f, last_period_date: e.target.value }))} 
                          required 
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={submitting}>
                      {submitting ? 'Saving...' : 'Save Pregnancy Information'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Pregnancy Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-semibold">{new Date(pregnancyInfo.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Period</p>
                      <p className="font-semibold">{new Date(pregnancyInfo.last_period_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Current Week</p>
                      <p className="font-semibold text-2xl">{currentWeek}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Trimester</p>
                      <p className="font-semibold text-2xl">{currentTrimester}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            {/* Add Milestone */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Milestone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMilestoneSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Date</label>
                      <Input 
                        type="date" 
                        value={milestoneForm.date} 
                        onChange={e => setMilestoneForm(f => ({ ...f, date: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <select 
                        className="w-full p-2 border rounded-md" 
                        value={milestoneForm.milestone_type} 
                        onChange={e => setMilestoneForm(f => ({ ...f, milestone_type: e.target.value }))}
                      >
                        <option value="development">Development</option>
                        <option value="milestone">Milestone</option>
                        <option value="medical">Medical</option>
                        <option value="personal">Personal</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Input 
                      value={milestoneForm.description} 
                      onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))} 
                      placeholder="Describe the milestone..."
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes - Optional</label>
                    <Textarea 
                      value={milestoneForm.notes} 
                      onChange={e => setMilestoneForm(f => ({ ...f, notes: e.target.value }))} 
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Adding...' : 'Add Milestone'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Milestones List */}
            <Card>
              <CardHeader>
                <CardTitle>Pregnancy Milestones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={milestone.completed}
                          onChange={(e) => toggleMilestone(milestone.id, e.target.checked)}
                          className="w-4 h-4"
                        />
                        <div>
                          <p className="font-medium">{milestone.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(milestone.date).toLocaleDateString()} • {milestone.milestone_type}
                          </p>
                          {milestone.notes && <p className="text-sm text-muted-foreground">{milestone.notes}</p>}
                        </div>
                      </div>
                      <Badge variant={milestone.completed ? "default" : "secondary"}>
                        {milestone.completed ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  ))}
                  {milestones.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No milestones yet. Add your first milestone!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Health Insights
                  {healthChecks.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        await generateAIInsights(healthChecks, pregnancyInfo);
                      }}
                      disabled={loading}
                    >
                      {loading ? 'Analyzing...' : 'Refresh Insights'}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4A9B8E]"></div>
                  </div>
                ) : aiInsights ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-line">{aiInsights}</p>
                  </div>
                ) : healthChecks.length > 0 ? (
                  <div className="text-center py-8">
                    <Button onClick={async () => {
                      await generateAIInsights(healthChecks, pregnancyInfo);
                    }}>
                      Generate AI Insights
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Add some health checks to get personalized AI insights.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Health Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Pregnancy Health Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Nutrition</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Take prenatal vitamins daily</li>
                      <li>• Eat a balanced diet with fruits and vegetables</li>
                      <li>• Stay hydrated with plenty of water</li>
                      <li>• Avoid raw fish and unpasteurized dairy</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Exercise</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Engage in moderate exercise regularly</li>
                      <li>• Practice prenatal yoga or swimming</li>
                      <li>• Avoid high-impact activities</li>
                      <li>• Listen to your body and rest when needed</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Monitoring</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Track your symptoms daily</li>
                      <li>• Monitor weight gain and blood pressure</li>
                      <li>• Attend all prenatal appointments</li>
                      <li>• Report any concerning symptoms immediately</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Emergency Signs</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Severe abdominal pain</li>
                      <li>• Heavy vaginal bleeding</li>
                      <li>• Severe headaches with vision changes</li>
                      <li>• Sudden swelling or shortness of breath</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav items={navItems} />
    </div>
  );
};

export default MaternalHealthAdvisorPage;
