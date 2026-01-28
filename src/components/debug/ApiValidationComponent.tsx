import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, Globe, Brain } from 'lucide-react';
import APIValidator from '@/lib/api-validator';

interface ValidationResult {
  basicAPI: any;
  languagePreservation: any;
  symptomAnalysis: any;
  summary: {
    allWorking: boolean;
    realAI: boolean;
    languagePreserved: boolean;
    averageResponseTime: number;
  };
}

export function ApiValidationComponent() {
  const [isValidating, setIsValidating] = useState(false);
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runValidation = async () => {
    setIsValidating(true);
    setError(null);
    setResults(null);

    try {
      const validationResults = await APIValidator.runFullValidation();
      setResults(validationResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (isWorking: boolean, isRealAI?: boolean) => {
    if (!isWorking) return <XCircle className="w-5 h-5 text-red-500" />;
    if (isRealAI === false) return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusBadge = (isWorking: boolean, isRealAI?: boolean) => {
    if (!isWorking) return <Badge variant="destructive">Failed</Badge>;
    if (isRealAI === false) return <Badge variant="secondary">Mock Data</Badge>;
    return <Badge variant="default">Working</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI API Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              This tool validates that your AI APIs are working correctly and returning real AI responses (not mock data) with proper language preservation.
            </p>
            
            <Button 
              onClick={runValidation} 
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Validating APIs...
                </>
              ) : (
                'Run API Validation'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {results && (
              <div className="space-y-4">
                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Validation Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.summary.allWorking)}
                        <span className="text-sm">All APIs Working</span>
                        {getStatusBadge(results.summary.allWorking)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.summary.realAI, results.summary.realAI)}
                        <span className="text-sm">Real AI Responses</span>
                        {getStatusBadge(results.summary.realAI, results.summary.realAI)}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.summary.languagePreserved, results.summary.languagePreserved)}
                        <span className="text-sm">Language Preserved</span>
                        {getStatusBadge(results.summary.languagePreserved, results.summary.languagePreserved)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        <span className="text-sm">Avg Response Time</span>
                        <Badge variant="outline">{Math.round(results.summary.averageResponseTime)}ms</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Basic API Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Basic API Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.basicAPI.isWorking, results.basicAPI.isRealAI)}
                        <span>Gemini API Connection</span>
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(results.basicAPI.isWorking, results.basicAPI.isRealAI)}
                        <Badge variant="outline">{results.basicAPI.responseTime}ms</Badge>
                      </div>
                    </div>
                    {results.basicAPI.error && (
                      <p className="text-red-600 text-sm mt-2">{results.basicAPI.error}</p>
                    )}
                    {results.basicAPI.sampleResponse && (
                      <p className="text-gray-600 text-sm mt-2">
                        Sample: {results.basicAPI.sampleResponse}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Language Preservation Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Language Preservation Test
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(results.languagePreservation).map(([language, result]: [string, any]) => (
                        <div key={language} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.isWorking, result.isRealAI)}
                            <span className="capitalize">{language}</span>
                            {result.languagePreserved && (
                              <Badge variant="outline" className="text-green-600">Language Preserved</Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {getStatusBadge(result.isWorking, result.isRealAI)}
                            <Badge variant="outline">{result.responseTime}ms</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Symptom Analysis Test */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Symptom Analysis Test</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(results.symptomAnalysis.isWorking, results.symptomAnalysis.isRealAI)}
                        <span>Hindi Symptom Analysis</span>
                        {results.symptomAnalysis.languagePreserved && (
                          <Badge variant="outline" className="text-green-600">Language Preserved</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {getStatusBadge(results.symptomAnalysis.isWorking, results.symptomAnalysis.isRealAI)}
                        <Badge variant="outline">{results.symptomAnalysis.responseTime}ms</Badge>
                      </div>
                    </div>
                    {results.symptomAnalysis.error && (
                      <p className="text-red-600 text-sm mt-2">{results.symptomAnalysis.error}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ApiValidationComponent;
