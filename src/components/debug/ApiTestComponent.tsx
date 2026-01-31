import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Wifi, WifiOff, Zap } from 'lucide-react';
import { aiClient } from '@/lib/ai-client';
import { sambaNovaAPI } from '@/lib/sambanova-api';

export default function ApiTestComponent() {
  const [geminiStatus, setGeminiStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [sambaNovaStatus, setSambaNovaStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [geminiError, setGeminiError] = useState<string>('');
  const [sambaNovaError, setSambaNovaError] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const testSambaNovaConnection = async () => {
    setSambaNovaStatus('testing');
    setSambaNovaError('');
    
    try {
      const isConnected = await sambaNovaAPI.testConnection();
      setSambaNovaStatus(isConnected ? 'success' : 'error');
      if (!isConnected) {
        setSambaNovaError('Connection test failed');
      }
    } catch (error) {
      setSambaNovaStatus('error');
      setSambaNovaError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testGeminiConnection = async () => {
    setGeminiStatus('testing');
    setGeminiError('');
    
    try {
      const isConnected = await aiClient.testConnection();
      setGeminiStatus(isConnected ? 'success' : 'error');
      if (!isConnected) {
        setGeminiError('Connection test failed');
      }
    } catch (error) {
      setGeminiStatus('error');
      setGeminiError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const testAllConnections = async () => {
    await Promise.all([
      testSambaNovaConnection(),
      testGeminiConnection()
    ]);
  };

  useEffect(() => {
    testAllConnections();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Network Status */}
      <Alert className={isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
        {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-red-600" />}
        <AlertDescription className={isOnline ? 'text-green-700' : 'text-red-700'}>
          Network Status: {isOnline ? 'Online' : 'Offline'}
        </AlertDescription>
      </Alert>

      {/* SambaNova AI Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              SambaNova AI (Primary)
            </div>
            {getStatusBadge(sambaNovaStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p><strong>Model:</strong> Meta-Llama-3.1-8B-Instruct</p>
            <p><strong>API Key:</strong> {sambaNovaAPI.isConfigured() ? '✅ Configured' : '❌ Missing'}</p>
          </div>
          {sambaNovaError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{sambaNovaError}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={testSambaNovaConnection} 
            disabled={sambaNovaStatus === 'testing' || !isOnline}
            size="sm"
            className="w-full"
          >
            {sambaNovaStatus === 'testing' ? 'Testing...' : 'Test SambaNova'}
          </Button>
        </CardContent>
      </Card>

      {/* Gemini AI Status (Fallback) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded" />
              Google Gemini (Fallback)
            </div>
            {getStatusBadge(geminiStatus)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-1">
            <p><strong>Models:</strong> gemini-2.5-flash, gemini-2.0-flash-exp</p>
            <p><strong>API Key:</strong> {aiClient.getAPIKeyStatus() ? '✅ Configured' : '❌ Missing'}</p>
          </div>
          {geminiError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{geminiError}</AlertDescription>
            </Alert>
          )}
          <Button 
            onClick={testGeminiConnection} 
            disabled={geminiStatus === 'testing' || !isOnline}
            size="sm"
            className="w-full"
          >
            {geminiStatus === 'testing' ? 'Testing...' : 'Test Gemini'}
          </Button>
        </CardContent>
      </Card>

      {/* Test All Button */}
      <Button 
        onClick={testAllConnections} 
        disabled={geminiStatus === 'testing' || sambaNovaStatus === 'testing' || !isOnline}
        className="w-full"
      >
        Test All AI Connections
      </Button>

      {/* Configuration Help */}
      {(!sambaNovaAPI.isConfigured() || !aiClient.getAPIKeyStatus()) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Configuration Required:</strong>
            <br />• Add VITE_SAMBANOVA_API_KEY to your .env file for SambaNova AI
            <br />• Add VITE_GOOGLE_AI_STUDIO_KEY to your .env file for Gemini fallback
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}