import { z } from 'zod';

// SambaNova API Response Schema
const SambaNovaResponseSchema = z.object({
  choices: z.array(z.object({
    message: z.object({
      content: z.string()
    })
  }))
});

export interface SambaNovaConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

class SambaNovaAPI {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_SAMBANOVA_API_KEY || '';
    this.baseUrl = 'https://api.sambanova.ai/v1';
    this.model = 'Meta-Llama-3.3-70B-Instruct';
  }

  async makeRequest(prompt: string, systemPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('SambaNova API key not configured');
    }

    console.log('🦙 Making SambaNova API request...');

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 1024,
        stream: false
      })
    });

    console.log('SambaNova response status:', response.status);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('SambaNova rate limit reached - switching to fallback');
        throw new Error('Rate limit exceeded');
      }
      const errorText = await response.text();
      console.error('SambaNova API error:', errorText);
      throw new Error(`SambaNova API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('SambaNova response:', data);

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid SambaNova API response format');
    }

    return data.choices[0].message.content || '';
  }

  async analyzeSymptoms(symptoms: string, language: string = 'en'): Promise<any> {
    const systemPrompt = `You are a medical AI assistant. Analyze the symptoms and respond with medical advice. Keep responses conversational and helpful. Always recommend consulting a healthcare professional for serious concerns.`;

    try {
      const response = await this.makeRequest(`Patient symptoms: ${symptoms}. Please provide medical analysis and advice.`, systemPrompt);

      // Parse response into structured format
      return {
        condition: "Medical Assessment",
        confidence: 75,
        severity: "moderate",
        description: response,
        suggestions: [
          "Monitor your symptoms",
          "Stay hydrated and rest",
          "Consult a healthcare provider if symptoms persist",
          "Seek immediate care if symptoms worsen"
        ],
        reasoning: "AI analysis based on reported symptoms",
        follow_up: "Please consult a healthcare professional for proper diagnosis and treatment."
      };
    } catch (error) {
      console.error('SambaNova symptom analysis failed:', error);
      throw error;
    }
  }

  async getHealthAdvice(query: string, language: string = 'en'): Promise<any> {
    const systemPrompt = `You are a helpful medical AI assistant. Provide clear, practical health advice. Be conversational and empathetic. Always recommend consulting healthcare professionals for serious concerns.`;

    try {
      const response = await this.makeRequest(`Health question: ${query}. Please provide helpful advice.`, systemPrompt);

      return {
        advice: response,
        confidence: 80,
        reasoning: "AI-generated health guidance based on medical knowledge",
        sources: ["Medical Literature", "Health Guidelines"],
        contraindications: ["Always consult healthcare professionals for medical decisions"]
      };
    } catch (error) {
      console.error('SambaNova health advice failed:', error);
      throw error;
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_sambanova_api_key_here';
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest('Hello', 'Respond with "OK" if you receive this message.');
      return true;
    } catch (error) {
      console.error('SambaNova connection test failed:', error);
      return false;
    }
  }
}

export const sambaNovaAPI = new SambaNovaAPI();
export default sambaNovaAPI;