import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Heart, 
  Thermometer, 
  Droplets, 
  Scale, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Pill,
  Brain,
  Eye,
  Stomach,
  Activity as ActivityIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface VitalSigns {
  bloodPressure: { systolic: number; diastolic: number };
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  weight: number;
  timestamp: string;
}

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  taken: boolean;
  category: string;
}

interface HealthMetric {
  name: string;
  value: number;
  unit: string;
  normalRange: { min: number; max: number };
  trend: 'up' | 'down' | 'stable';
  status: 'normal' | 'warning' | 'critical';
}

export default function HealthDashboard() {
  const [vitals, setVitals] = useState<VitalSigns[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - in real app, this would come from API/database
  useEffect(() => {
    // Sample vital signs data
    const sampleVitals: VitalSigns[] = [
      { bloodPressure: { systolic: 120, diastolic: 80 }, heartRate: 72, temperature: 98.6, oxygenSaturation: 98, weight: 70, timestamp: '2024-01-15' },
      { bloodPressure: { systolic: 118, diastolic: 78 }, heartRate: 70, temperature: 98.4, oxygenSaturation: 99, weight: 69.8, timestamp: '2024-01-16' },
      { bloodPressure: { systolic: 122, diastolic: 82 }, heartRate: 75, temperature: 98.8, oxygenSaturation: 97, weight: 70.2, timestamp: '2024-01-17' },
    ];
    setVitals(sampleVitals);

    // Sample medications
    const sampleMedications: Medication[] = [
      { id: '1', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '08:00', taken: true, category: 'diabetes' },
      { id: '2', name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '09:00', taken: false, category: 'hypertension' },
      { id: '3', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', time: '20:00', taken: false, category: 'cholesterol' },
    ];
    setMedications(sampleMedications);

    // Sample health metrics
    const sampleMetrics: HealthMetric[] = [
      { name: 'Blood Pressure', value: 120, unit: 'mmHg', normalRange: { min: 90, max: 140 }, trend: 'stable', status: 'normal' },
      { name: 'Heart Rate', value: 72, unit: 'bpm', normalRange: { min: 60, max: 100 }, trend: 'down', status: 'normal' },
      { name: 'Temperature', value: 98.6, unit: '°F', normalRange: { min: 97, max: 99 }, trend: 'stable', status: 'normal' },
      { name: 'Oxygen Saturation', value: 98, unit: '%', normalRange: { min: 95, max: 100 }, trend: 'up', status: 'normal' },
    ];
    setHealthMetrics(sampleMetrics);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-blue-600" />;
      case 'stable': return <Activity className="w-4 h-4 text-gray-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const markMedicationTaken = (id: string) => {
    setMedications(prev => prev.map(med => 
      med.id === id ? { ...med, taken: true } : med
    ));
  };

  const getMedicationStatus = () => {
    const total = medications.length;
    const taken = medications.filter(m => m.taken).length;
    return { total, taken, percentage: (taken / total) * 100 };
  };

  const chartData = vitals.map((vital, index) => ({
    day: `Day ${index + 1}`,
    heartRate: vital.heartRate,
    temperature: vital.temperature,
    oxygen: vital.oxygenSaturation,
  }));

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Health Dashboard</h1>
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          All Systems Normal
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {healthMetrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                  {getTrendIcon(metric.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value} {metric.unit}</div>
                  <p className="text-xs text-muted-foreground">
                    Normal: {metric.normalRange.min}-{metric.normalRange.max} {metric.unit}
                  </p>
                  <Badge className={`mt-2 ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Health Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Vital Signs Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#8884d8" name="Heart Rate" />
                    <Line type="monotone" dataKey="temperature" stroke="#82ca9d" name="Temperature" />
                    <Line type="monotone" dataKey="oxygen" stroke="#ffc658" name="Oxygen" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Medication Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Today's Progress</span>
                  <span className="text-2xl font-bold">{getMedicationStatus().taken}/{getMedicationStatus().total}</span>
                </div>
                <Progress value={getMedicationStatus().percentage} className="w-full" />
                <div className="space-y-2">
                  {medications.map((med) => (
                    <div key={med.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{med.time}</span>
                        {med.taken ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Button size="sm" onClick={() => markMedicationTaken(med.id)}>
                            Mark Taken
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure History</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vitals}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bloodPressure.systolic" fill="#8884d8" name="Systolic" />
                    <Bar dataKey="bloodPressure.diastolic" fill="#82ca9d" name="Diastolic" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Vital Signs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {vitals.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span>Blood Pressure</span>
                      </div>
                      <span className="font-bold">
                        {vitals[vitals.length - 1].bloodPressure.systolic}/{vitals[vitals.length - 1].bloodPressure.diastolic} mmHg
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span>Heart Rate</span>
                      </div>
                      <span className="font-bold">{vitals[vitals.length - 1].heartRate} bpm</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span>Temperature</span>
                      </div>
                      <span className="font-bold">{vitals[vitals.length - 1].temperature}°F</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-cyan-500" />
                        <span>Oxygen Saturation</span>
                      </div>
                      <span className="font-bold">{vitals[vitals.length - 1].oxygenSaturation}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="w-5 h-5" />
                Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {medications.map((med) => (
                  <div key={med.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        med.category === 'diabetes' ? 'bg-blue-100' :
                        med.category === 'hypertension' ? 'bg-red-100' :
                        'bg-green-100'
                      }`}>
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{med.name}</h3>
                        <p className="text-sm text-gray-600">{med.dosage} - {med.frequency}</p>
                        <p className="text-sm text-gray-500">Take at {med.time}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {med.taken ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Taken
                        </Badge>
                      ) : (
                        <Button onClick={() => markMedicationTaken(med.id)}>
                          Mark as Taken
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Health Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="heartRate" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Health Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <TrendingDown className="h-4 w-4" />
                  <AlertDescription>
                    Your heart rate has decreased by 5% this week, indicating improved cardiovascular health.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Blood pressure is within normal range. Continue with current lifestyle habits.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Next medication reminder: Lisinopril at 09:00 AM tomorrow.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
