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
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Activity,
  Brain,
  Droplets,
  Moon,
  Sun,
  Zap,
  Plus,
  BarChart3,
  Stethoscope
} from "lucide-react";
import { navItems } from "@/lib/navigation-config";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { aiClient } from "@/lib/ai-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { addCycle as dbAddCycle, getCycles as dbGetCycles, addLog as dbAddLog, getLogs as dbGetLogs, clearAllData as dbClearAllData } from "@/lib/period-tracker-sqlite";

interface Cycle {
  id: number;
  start_date: string;
  end_date: string;
  flow: 'Light' | 'Medium' | 'Heavy' | 'Irregular';
  notes: string;
  cycle_length: number;
}

interface DailyLog {
  id: number;
  date: string;
  symptoms: string[];
  mood: string;
  pain_level: number;
  flow_intensity: number;
  weight?: number;
  temperature?: number;
  cycle_id: number;
}

interface PCOSRiskFactors {
  irregular_cycles: boolean;
  acne: boolean;
  hair_loss: boolean;
  weight_gain: boolean;
  mood_swings: boolean;
  fatigue: boolean;
}

const PHASES = [
  { name: "Menstrual", color: "#F472B6", icon: <Droplets className="w-4 h-4" />, description: "Period phase" },
  { name: "Follicular", color: "#60A5FA", icon: <Sun className="w-4 h-4" />, description: "Energy building" },
  { name: "Ovulation", color: "#A3E635", icon: <Zap className="w-4 h-4" />, description: "Peak fertility" },
  { name: "Luteal", color: "#FBBF24", icon: <Moon className="w-4 h-4" />, description: "Pre-menstrual" },
];

const COMMON_SYMPTOMS = [
  'Cramps', 'Bloating', 'Headache', 'Acne', 'Mood swings', 'Fatigue', 
  'Breast tenderness', 'Back pain', 'Nausea', 'Hair loss', 'Weight gain', 'Irregular bleeding'
];

const MOOD_OPTIONS = ['Happy', 'Sad', 'Anxious', 'Irritable', 'Calm', 'Energetic', 'Tired', 'Stressed'];

function calculateCycleLength(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function getPhase(cycleStart: string, today: string, cycleLength = 28) {
  const start = new Date(cycleStart);
  const now = new Date(today);
  const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diff < 0) return null;
  if (diff <= 5) return PHASES[0]; // Menstrual
  if (diff <= 13) return PHASES[1]; // Follicular
  if (diff >= 14 && diff <= 16) return PHASES[2]; // Ovulation
  if (diff < cycleLength) return PHASES[3]; // Luteal
  return null;
}

function predictNextPeriod(cycles: Cycle[]): string | null {
  if (cycles.length === 0) return null;
  
  const avgCycleLength = cycles.slice(0, 3).reduce((sum, cycle) => sum + cycle.cycle_length, 0) / Math.min(cycles.length, 3);
  const lastCycle = cycles[0];
  const nextDate = new Date(lastCycle.start_date);
  nextDate.setDate(nextDate.getDate() + Math.round(avgCycleLength));
  
  return nextDate.toISOString().slice(0, 10);
}

function calculatePCOSRisk(cycles: Cycle[], logs: DailyLog[]): { score: number; factors: PCOSRiskFactors; recommendations: string[] } {
  const factors: PCOSRiskFactors = {
    irregular_cycles: false,
    acne: false,
    hair_loss: false,
    weight_gain: false,
    mood_swings: false,
    fatigue: false
  };
  
  // Check for irregular cycles
  if (cycles.length >= 3) {
    const cycleLengths = cycles.slice(0, 3).map(c => c.cycle_length);
    const avgLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.some(length => Math.abs(length - avgLength) > 7);
    factors.irregular_cycles = variance || cycles.some(c => c.flow === 'Irregular');
  }
  
  // Check symptoms in logs
  logs.forEach(log => {
    if (log.symptoms.some(s => s.toLowerCase().includes('acne'))) factors.acne = true;
    if (log.symptoms.some(s => s.toLowerCase().includes('hair'))) factors.hair_loss = true;
    if (log.symptoms.some(s => s.toLowerCase().includes('weight'))) factors.weight_gain = true;
    if (log.mood === 'Irritable' || log.mood === 'Anxious') factors.mood_swings = true;
    if (log.symptoms.some(s => s.toLowerCase().includes('fatigue')) || log.mood === 'Tired') factors.fatigue = true;
  });
  
  const riskScore = Object.values(factors).filter(Boolean).length * 16.67; // Max 100%
  
  const recommendations = [
    'Maintain a balanced diet rich in fiber and protein',
    'Exercise regularly - even 30 minutes of walking helps',
    'Manage stress through meditation or yoga',
    'Get adequate sleep (7-9 hours)',
    'Stay hydrated throughout the day'
  ];
  
  if (riskScore > 50) {
    recommendations.unshift('Consider consulting a gynecologist for proper evaluation');
  }
  
  return { score: riskScore, factors, recommendations };
}

// Database helpers
const getCycles = async (): Promise<Cycle[]> => {
  try {
    return await dbGetCycles();
  } catch (error) {
    console.error('Error fetching cycles:', error);
    return [];
  }
};

const getLogs = async (cycleId?: number): Promise<DailyLog[]> => {
  try {
    return await dbGetLogs(cycleId);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

const addCycle = async (start_date: string, end_date: string, flow: Cycle['flow'], notes: string) => {
  try {
    const cycle_length = calculateCycleLength(start_date, end_date);
    await dbAddCycle(start_date, end_date, flow, notes, cycle_length);
  } catch (error) {
    console.error('Error adding cycle:', error);
    throw error;
  }
};

const addLog = async (date: string, symptoms: string[], mood: string, pain_level: number, flow_intensity: number, cycle_id: number, weight?: number, temperature?: number) => {
  try {
    await dbAddLog(date, symptoms, mood, cycle_id, pain_level, flow_intensity, weight, temperature);
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

const PCOSTrackerPage = () => {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedCycle, setSelectedCycle] = useState<Cycle | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Auto-dismiss messages after 5 seconds
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
  
  // Form states
  const [cycleForm, setCycleForm] = useState({ start: "", end: "", flow: "Medium" as Cycle['flow'], notes: "" });
  const [logForm, setLogForm] = useState({ 
    date: "", 
    symptoms: [] as string[], 
    mood: "Calm", 
    pain_level: 0, 
    flow_intensity: 0,
    weight: '',
    temperature: ''
  });
  
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading PCOS tracker data...');
        const c = await getCycles();
        console.log('Loaded cycles:', c);
        setCycles(c);
        
        if (c.length > 0) {
          setSelectedCycle(c[0]);
          const l = await getLogs(c[0].id);
          console.log('Loaded logs for cycle:', c[0].id, l);
          setLogs(l);
        } else {
          console.log('No cycles found, setting empty state');
          setSelectedCycle(null);
          setLogs([]);
        }
        
        setLogForm(prev => ({ ...prev, date: today }));
        console.log('PCOS tracker data loaded successfully');
      } catch (error) {
        console.error('Error loading PCOS tracker data:', error);
        setError('Failed to load data. Please refresh the page.');
      }
    };
    loadData();
  }, [today]);

  const handleCycleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleForm.start || !cycleForm.end) {
      setError('Please fill in both start and end dates.');
      return;
    }
    
    // Validate date range
    const startDate = new Date(cycleForm.start);
    const endDate = new Date(cycleForm.end);
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }
    
    // Validate dates are not in the future
    const today = new Date();
    if (startDate > today || endDate > today) {
      setError('Dates cannot be in the future.');
      return;
    }
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      console.log('Adding cycle:', cycleForm);
      await addCycle(cycleForm.start, cycleForm.end, cycleForm.flow, cycleForm.notes);
      
      const c = await getCycles();
      console.log('Cycles after adding:', c);
      setCycles(c);
      
      if (c.length > 0) {
        setSelectedCycle(c[0]);
        const l = await getLogs(c[0].id);
        setLogs(l);
      }
      
      setCycleForm({ start: "", end: "", flow: "Medium", notes: "" });
      setSuccess('Cycle added successfully!');
      
      // Generate AI insights for new cycle
      const allLogs = await getLogs();
      await generateAIInsights(c, allLogs);
    } catch (error) {
      console.error('Error adding cycle:', error);
      setError('Failed to add cycle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCycle) {
      setError('Please select a cycle first.');
      return;
    }
    
    if (!logForm.date) {
      setError('Please select a date for the log.');
      return;
    }
    
    // Validate log date is within cycle range
    const logDate = new Date(logForm.date);
    const cycleStart = new Date(selectedCycle.start_date);
    const cycleEnd = new Date(selectedCycle.end_date);
    
    if (logDate < cycleStart || logDate > cycleEnd) {
      setError(`Log date must be within the selected cycle date range (${selectedCycle.start_date} to ${selectedCycle.end_date}).`);
      return;
    }
    
    // Validate weight and temperature if provided
    if (logForm.weight && (isNaN(parseFloat(logForm.weight)) || parseFloat(logForm.weight) <= 0)) {
      setError('Please enter a valid weight.');
      return;
    }
    
    if (logForm.temperature && (isNaN(parseFloat(logForm.temperature)) || parseFloat(logForm.temperature) < 30 || parseFloat(logForm.temperature) > 45)) {
      setError('Please enter a valid temperature (30-45°C).');
      return;
    }
    
    setError('');
    setSuccess('');
    setSubmitting(true);
    
    try {
      const weight = logForm.weight ? parseFloat(logForm.weight) : undefined;
      const temperature = logForm.temperature ? parseFloat(logForm.temperature) : undefined;
      
      console.log('Adding log:', { ...logForm, weight, temperature, cycle_id: selectedCycle.id });
      
      await addLog(
        logForm.date, 
        logForm.symptoms, 
        logForm.mood, 
        logForm.pain_level, 
        logForm.flow_intensity, 
        selectedCycle.id,
        weight,
        temperature
      );
      
      const l = await getLogs(selectedCycle.id);
      console.log('Logs after adding:', l);
      setLogs(l);
      
      setLogForm({ 
        date: today, 
        symptoms: [], 
        mood: "Calm", 
        pain_level: 0, 
        flow_intensity: 0,
        weight: '',
        temperature: ''
      });
      setSuccess('Daily log added successfully!');
      
      // Update AI insights
      const allLogs = await getLogs();
      await generateAIInsights(cycles, allLogs);
    } catch (error) {
      console.error('Error adding log:', error);
      setError('Failed to add daily log. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCycleSelect = async (cycle: Cycle) => {
    console.log('Selecting cycle:', cycle);
    setSelectedCycle(cycle);
    try {
      const l = await getLogs(cycle.id);
      console.log('Loaded logs for selected cycle:', l);
      setLogs(l);
    } catch (error) {
      console.error('Error loading logs for cycle:', error);
      setError('Failed to load logs for selected cycle.');
    }
  };

  const toggleSymptom = (symptom: string) => {
    setLogForm(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }));
  };

  // Debug function to clear all data (for testing)
  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        console.log('Clearing all data...');
        await dbClearAllData();
        
        // Reset all state
        setCycles([]);
        setLogs([]);
        setSelectedCycle(null);
        setAiInsights('');
        setError('');
        setSuccess('All data cleared successfully!');
        
        console.log('All data cleared and state reset');
      } catch (error) {
        console.error('Error clearing data:', error);
        setError('Failed to clear data.');
      }
    }
  };

  const generateAIInsights = async (cycleData: Cycle[], logData: DailyLog[]) => {
    if (cycleData.length === 0) return;
    
    setLoading(true);
    try {
      const pcosRisk = calculatePCOSRisk(cycleData, logData);
      const recentSymptoms = logData.slice(0, 10).flatMap(log => log.symptoms).join(', ');
      const avgCycleLength = cycleData.slice(0, 3).reduce((sum, cycle) => sum + cycle.cycle_length, 0) / Math.min(cycleData.length, 3);
      
      const prompt = `Analyze this menstrual health data and provide personalized insights:
      
      Cycle Data:
      - Average cycle length: ${avgCycleLength.toFixed(1)} days
      - Recent cycles: ${cycleData.slice(0, 3).map(c => `${c.cycle_length} days (${c.flow})`).join(', ')}
      - PCOS risk score: ${pcosRisk.score.toFixed(1)}%
      - Risk factors: ${Object.entries(pcosRisk.factors).filter(([_, value]) => value).map(([key]) => key).join(', ')}
      
      Recent symptoms: ${recentSymptoms || 'None reported'}
      
      Provide:
      1. Health assessment (2-3 sentences)
      2. Specific recommendations (3-4 points)
      3. When to consult a doctor
      
      Keep response concise and supportive.`;
      
      const response = await aiClient.getHealthAdvice(prompt, 'en');
      setAiInsights(response.advice);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setAiInsights('Unable to generate insights at the moment. Please ensure you have an active internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate current phase and predictions
  const phase = selectedCycle ? getPhase(selectedCycle.start_date, today) : null;
  const nextPeriod = predictNextPeriod(cycles);
  const pcosRisk = calculatePCOSRisk(cycles, logs);
  
  // Prepare chart data
  const chartData = logs.slice(0, 30).reverse().map(log => ({
    date: log.date.slice(5), // MM-DD format
    pain: log.pain_level,
    mood: MOOD_OPTIONS.indexOf(log.mood) + 1,
    flow: log.flow_intensity
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
            <Heart className="w-8 h-8 text-[#F472B6]" />
            Period & PCOS Tracker
          </h1>
          <p className="text-[#4A5568] max-w-2xl mx-auto">
            Track your menstrual health with AI-powered insights, symptom analysis, and personalized recommendations.
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="cycles">Cycles</TabsTrigger>
            <TabsTrigger value="daily">Daily Log</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Current Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Phase */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Phase</p>
                      {phase ? (
                        <div className="flex items-center gap-2 mt-1">
                          <div style={{ color: phase.color }}>{phase.icon}</div>
                          <span className="font-semibold" style={{ color: phase.color }}>
                            {phase.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                      {phase && <p className="text-xs text-muted-foreground mt-1">{phase.description}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Period */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Next Period</p>
                      <p className="font-semibold text-lg">
                        {nextPeriod ? new Date(nextPeriod).toLocaleDateString() : 'Not predicted'}
                      </p>
                      {nextPeriod && (
                        <p className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(nextPeriod).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      )}
                    </div>
                    <CalendarIcon className="w-8 h-8 text-[#4A9B8E]" />
                  </div>
                </CardContent>
              </Card>

              {/* PCOS Risk */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">PCOS Risk</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={pcosRisk.score} className="w-20" />
                        <span className="font-semibold">{pcosRisk.score.toFixed(0)}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pcosRisk.score < 30 ? 'Low risk' : pcosRisk.score < 60 ? 'Moderate risk' : 'High risk'}
                      </p>
                    </div>
                    {pcosRisk.score > 50 ? (
                      <AlertTriangle className="w-8 h-8 text-orange-500" />
                    ) : (
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Symptoms Chart */}
            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Symptom Trends (Last 30 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line type="monotone" dataKey="pain" stroke="#F472B6" name="Pain Level" />
                      <Line type="monotone" dataKey="mood" stroke="#60A5FA" name="Mood Score" />
                      <Line type="monotone" dataKey="flow" stroke="#A3E635" name="Flow Intensity" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Cycles */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Cycles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cycles.slice(0, 3).map((cycle) => (
                    <div key={cycle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}</p>
                        <p className="text-sm text-muted-foreground">{cycle.cycle_length} days • {cycle.flow} flow</p>
                      </div>
                      <Badge variant={cycle.flow === 'Irregular' ? 'destructive' : 'secondary'}>
                        {cycle.flow}
                      </Badge>
                    </div>
                  ))}
                  {cycles.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No cycles recorded yet. Add your first cycle to get started!</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Debug Section - Only show in development */}
            {process.env.NODE_ENV === 'development' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Debug Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={clearAllData}
                      className="text-xs"
                    >
                      Clear All Data
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      <p>Cycles: {cycles.length}</p>
                      <p>Logs: {logs.length}</p>
                      <p>Selected Cycle: {selectedCycle?.id || 'None'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cycles" className="space-y-6">
            {/* Add New Cycle */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add New Cycle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCycleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">Start Date</label>
                      <Input 
                        type="date" 
                        value={cycleForm.start} 
                        onChange={e => setCycleForm(f => ({ ...f, start: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">End Date</label>
                      <Input 
                        type="date" 
                        value={cycleForm.end} 
                        onChange={e => setCycleForm(f => ({ ...f, end: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Flow Intensity</label>
                      <select 
                        className="w-full p-2 border rounded-md" 
                        value={cycleForm.flow} 
                        onChange={e => setCycleForm(f => ({ ...f, flow: e.target.value as Cycle['flow'] }))}
                      >
                        <option value="Light">Light</option>
                        <option value="Medium">Medium</option>
                        <option value="Heavy">Heavy</option>
                        <option value="Irregular">Irregular</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Notes (Optional)</label>
                    <Textarea 
                      value={cycleForm.notes} 
                      onChange={e => setCycleForm(f => ({ ...f, notes: e.target.value }))} 
                      placeholder="Any additional notes about this cycle..."
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? 'Adding Cycle...' : 'Add Cycle'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Cycles List */}
            <Card>
              <CardHeader>
                <CardTitle>Cycle History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cycles.map((cycle) => (
                    <motion.div 
                      key={cycle.id} 
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCycle?.id === cycle.id ? 'bg-[#4A9B8E]/10 border-[#4A9B8E]' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCycleSelect(cycle)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {cycle.cycle_length} days • {cycle.flow} flow
                          </p>
                          {cycle.notes && <p className="text-sm text-muted-foreground mt-1">{cycle.notes}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={cycle.flow === 'Irregular' ? 'destructive' : 'secondary'}>
                            {cycle.flow}
                          </Badge>
                          {selectedCycle?.id === cycle.id && <CheckCircle className="w-5 h-5 text-[#4A9B8E]" />}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="space-y-6">
            {selectedCycle ? (
              <>
                {/* Daily Log Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Daily Health Log
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Date</label>
                          <Input 
                            type="date" 
                            value={logForm.date} 
                            onChange={e => setLogForm(f => ({ ...f, date: e.target.value }))} 
                            required 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Mood</label>
                          <select 
                            className="w-full p-2 border rounded-md" 
                            value={logForm.mood} 
                            onChange={e => setLogForm(f => ({ ...f, mood: e.target.value }))}
                          >
                            {MOOD_OPTIONS.map(mood => (
                              <option key={mood} value={mood}>{mood}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Symptoms</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {COMMON_SYMPTOMS.map(symptom => (
                            <Button
                              key={symptom}
                              type="button"
                              variant={logForm.symptoms.includes(symptom) ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleSymptom(symptom)}
                              className="justify-start"
                            >
                              {symptom}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Pain Level (0-10)</label>
                          <Input 
                            type="range" 
                            min="0" 
                            max="10" 
                            value={logForm.pain_level} 
                            onChange={e => setLogForm(f => ({ ...f, pain_level: parseInt(e.target.value) }))} 
                          />
                          <div className="text-center text-sm text-muted-foreground">{logForm.pain_level}/10</div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Flow Intensity (0-10)</label>
                          <Input 
                            type="range" 
                            min="0" 
                            max="10" 
                            value={logForm.flow_intensity} 
                            onChange={e => setLogForm(f => ({ ...f, flow_intensity: parseInt(e.target.value) }))} 
                          />
                          <div className="text-center text-sm text-muted-foreground">{logForm.flow_intensity}/10</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Weight (kg) - Optional</label>
                          <Input 
                            type="number" 
                            step="0.1" 
                            value={logForm.weight} 
                            onChange={e => setLogForm(f => ({ ...f, weight: e.target.value }))} 
                            placeholder="e.g. 65.5"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Temperature (°C) - Optional</label>
                          <Input 
                            type="number" 
                            step="0.1" 
                            value={logForm.temperature} 
                            onChange={e => setLogForm(f => ({ ...f, temperature: e.target.value }))} 
                            placeholder="e.g. 36.5"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? 'Adding Log...' : 'Add Daily Log'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Recent Logs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {logs.slice(0, 10).map((log) => (
                        <div key={log.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{new Date(log.date).toLocaleDateString()}</span>
                            <Badge variant="outline">{log.mood}</Badge>
                          </div>
                          {log.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {log.symptoms.map((symptom, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">{symptom}</Badge>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Pain: {log.pain_level}/10</span>
                            <span>Flow: {log.flow_intensity}/10</span>
                            {log.weight && <span>Weight: {log.weight}kg</span>}
                            {log.temperature && <span>Temp: {log.temperature}°C</span>}
                          </div>
                        </div>
                      ))}
                      {logs.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No daily logs yet. Start tracking your symptoms!</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Please select a cycle first to start logging daily symptoms.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* PCOS Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" />
                  PCOS Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Risk Score</span>
                    <div className="flex items-center gap-2">
                      <Progress value={pcosRisk.score} className="w-32" />
                      <span className="font-bold">{pcosRisk.score.toFixed(0)}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(pcosRisk.factors).map(([factor, present]) => (
                      <div key={factor} className={`p-3 rounded-lg border ${
                        present ? 'bg-orange-50 border-orange-200' : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          {present ? (
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium capitalize">
                            {factor.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {pcosRisk.score > 50 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your risk assessment suggests potential PCOS symptoms. Consider consulting a gynecologist for proper evaluation and diagnosis.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Health Insights
                  {cycles.length > 0 && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={async () => {
                        const allLogs = await getLogs();
                        await generateAIInsights(cycles, allLogs);
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
                ) : cycles.length > 0 ? (
                  <div className="text-center py-8">
                    <Button onClick={async () => {
                      const allLogs = await getLogs();
                      await generateAIInsights(cycles, allLogs);
                    }}>
                      Generate AI Insights
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Add some cycles and daily logs to get personalized AI insights.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Health Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pcosRisk.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
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

export default PCOSTrackerPage; 