import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { aiClient } from '@/lib/ai-client';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  result?: any;
  error?: string;
  duration?: number;
}

export default function ComprehensiveAITest() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Symptom Analysis', status: 'pending' },
    { name: 'Health Advice', status: 'pending' },
    { name: 'Prescription Analysis', status: 'pending' },
    { name: 'First Aid Analysis', status: 'pending' },
    { name: 'Misinformation Check', status: 'pending' },
    { name: 'AI Client Connection', status: 'pending' },
  ]);

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ));
  };

  const runSymptomAnalysisTest = async () => {
    updateTest('Symptom Analysis', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.analyzeSymptoms('headache and fever', 'en');
      updateTest('Symptom Analysis', { 
        status: 'success', 
        result: result.condition,
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('Symptom Analysis', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runHealthAdviceTest = async () => {
    updateTest('Health Advice', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.getHealthAdvice('How to stay healthy?', 'en');
      updateTest('Health Advice', { 
        status: 'success', 
        result: result.advice.substring(0, 100) + '...',
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('Health Advice', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runPrescriptionAnalysisTest = async () => {
    updateTest('Prescription Analysis', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.analyzePrescription('Paracetamol 500mg twice daily', 'en');
      updateTest('Prescription Analysis', { 
        status: 'success', 
        result: `${result.medicines.length} medicines analyzed`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('Prescription Analysis', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runFirstAidTest = async () => {
    updateTest('First Aid Analysis', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.analyzeFirstAid('Minor cut on finger', 'en');
      updateTest('First Aid Analysis', { 
        status: 'success', 
        result: `${result.injury_type} - ${result.severity}`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('First Aid Analysis', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runMisinformationTest = async () => {
    updateTest('Misinformation Check', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.analyzeMisinformation('Drinking water cures all diseases', 'en');
      updateTest('Misinformation Check', { 
        status: 'success', 
        result: `Verdict: ${result.verdict}`,
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('Misinformation Check', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runConnectionTest = async () => {
    updateTest('AI Client Connection', { status: 'running' });
    const startTime = Date.now();
    
    try {
      const result = await aiClient.testConnection();
      updateTest('AI Client Connection', { 
        status: result ? 'success' : 'error', 
        result: result ? 'Connected' : 'Failed',
        error: result ? undefined : 'Connection failed',
        duration: Date.now() - startTime
      });
    } catch (error) {
      updateTest('AI Client Connection', { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime
      });
    }
  };

  const runAllTests = async () => {
    await runConnectionTest();
    await runSymptomAnalysisTest();
    await runHealthAdviceTest();
    await runPrescriptionAnalysisTest();
    await runFirstAidTest();
    await runMisinformationTest();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge variant="secondary">Running...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const allTestsCompleted = tests.every(test => test.status === 'success' || test.status === 'error');
  const successCount = tests.filter(test => test.status === 'success').length;
  const totalTests = tests.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🧪 Comprehensive AI Integration Test
            <Button onClick={runAllTests} disabled={tests.some(test => test.status === 'running')}>
              Run All Tests
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allTestsCompleted && (
            <Alert className={successCount === totalTests ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Tests completed: {successCount}/{totalTests} passed
                {successCount === totalTests ? ' ✅ All AI integrations working!' : ' ⚠️ Some tests failed'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <h4 className="font-medium">{test.name}</h4>
                    {test.result && (
                      <p className="text-sm text-gray-600">{test.result}</p>
                    )}
                    {test.error && (
                      <p className="text-sm text-red-600">{test.error}</p>
                    )}
                    {test.duration && (
                      <p className="text-xs text-gray-500">{test.duration}ms</p>
                    )}
                  </div>
                </div>
                {getStatusBadge(test.status)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}