import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import aiClient from '@/lib/ai-client';

const ApiTestComponent = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{
    apiKeyValid: boolean;
    apiKeyError?: string;
    connectionTest: boolean;
    connectionError?: string;
    fullTest: boolean;
    fullTestError?: string;
  } | null>(null);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults(null);

    const results = {
      apiKeyValid: false,
      connectionTest: false,
      fullTest: false,
    };

    try {
      // Test 1: API Key Validation
      const apiKeyValidation = aiClient.validateAPIKey();
      results.apiKeyValid = apiKeyValidation.isValid;
      
      if (!results.apiKeyValid) {
        setTestResults({
          ...results,
          apiKeyError: apiKeyValidation.error
        });
        return;
      }

      // Test 2: Connection Test
      try {
        const connectionTest = await aiClient.testConnection();
        results.connectionTest = connectionTest;
      } catch (error) {
        results.connectionTest = false;
        results.connectionError = error instanceof Error ? error.message : 'Unknown error';
      }

      // Test 3: Full Functionality Test
      try {
        const testResponse = await aiClient.getHealthAdvice('test message', 'en');
        results.fullTest = true;
        console.log('✅ Full functionality test passed:', testResponse);
      } catch (error) {
        results.fullTest = false;
        results.fullTestError = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Full functionality test failed:', error);
      }

      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="w-4 h-4 text-green-500" />
    ) : (
      <XCircle className="w-4 h-4 text-red-500" />
    );
  };

  const getStatusBadge = (status: boolean) => {
    return status ? (
      <Badge className="bg-green-500 text-white">PASS</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">FAIL</Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          API Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={runTests} 
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Run API Tests
              </>
            )}
          </Button>
        </div>

        {testResults && (
          <div className="space-y-3">
            {/* API Key Test */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {getStatusIcon(testResults.apiKeyValid)}
                <span className="font-medium">API Key Validation</span>
              </div>
              {getStatusBadge(testResults.apiKeyValid)}
            </div>
            {testResults.apiKeyError && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                Error: {testResults.apiKeyError}
              </div>
            )}

            {/* Connection Test */}
            {testResults.apiKeyValid && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.connectionTest)}
                    <span className="font-medium">API Connection</span>
                  </div>
                  {getStatusBadge(testResults.connectionTest)}
                </div>
                {testResults.connectionError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Error: {testResults.connectionError}
                  </div>
                )}
              </>
            )}

            {/* Full Test */}
            {testResults.apiKeyValid && testResults.connectionTest && (
              <>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(testResults.fullTest)}
                    <span className="font-medium">Full Functionality</span>
                  </div>
                  {getStatusBadge(testResults.fullTest)}
                </div>
                {testResults.fullTestError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    Error: {testResults.fullTestError}
                  </div>
                )}
              </>
            )}

            {/* Summary */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Summary</h4>
              {testResults.apiKeyValid && testResults.connectionTest && testResults.fullTest ? (
                <p className="text-green-700 text-sm">
                  ✅ All tests passed! Your API is working correctly.
                </p>
              ) : (
                <p className="text-red-700 text-sm">
                  ❌ Some tests failed. Check the errors above and ensure your API key is correct.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Troubleshooting</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Ensure your API key starts with "AIzaSy"</li>
            <li>• Check that your API key is properly set in the .env file</li>
            <li>• Verify you have an active Google AI Studio account</li>
            <li>• Check your API quota in Google AI Studio dashboard</li>
            <li>• Ensure you have internet connectivity</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiTestComponent;
