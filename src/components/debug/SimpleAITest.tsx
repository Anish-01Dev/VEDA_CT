import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { aiClient } from '@/lib/ai-client';
import { sambaNovaAPI } from '@/lib/sambanova-api';

export default function SimpleAITest() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const testSambaNova = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      console.log('🦙 Testing SambaNova directly...');
      const result = await sambaNovaAPI.getHealthAdvice(input);
      setResponse(`SambaNova: ${result.advice}`);
    } catch (error) {
      console.error('SambaNova test failed:', error);
      setResponse(`SambaNova Error: ${error.message}`);
    }
    setLoading(false);
  };

  const testAIClient = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      console.log('🤖 Testing AI Client...');
      const result = await aiClient.getHealthAdvice(input);
      setResponse(`AI Client: ${result.advice}`);
    } catch (error) {
      console.error('AI Client test failed:', error);
      setResponse(`AI Client Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 AI Test Console</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Ask a health question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        
        <div className="flex gap-2">
          <Button 
            onClick={testSambaNova} 
            disabled={loading || !input.trim()}
            className="flex-1"
          >
            Test SambaNova
          </Button>
          <Button 
            onClick={testAIClient} 
            disabled={loading || !input.trim()}
            variant="outline"
            className="flex-1"
          >
            Test AI Client
          </Button>
        </div>

        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Testing AI...</p>
          </div>
        )}

        {response && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Response:</h4>
            <p className="text-sm">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}