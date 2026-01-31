import { aiLogger } from './ai-logger';

class GeminiVisionAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = 'REDACTED_GOOGLE_API_KEY';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<any> {
    aiLogger.aiStart('Gemini Vision', 'Image Analysis', prompt);

    // Try multiple models that support vision
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const model of models) {
      try {
        const apiVersion = model.includes('pro-vision') ? 'v1' : 'v1beta';
        const baseUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models`;
        
        const response = await fetch(`${baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64
                  }
                }
              ]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            }
          })
        });

        if (!response.ok) {
          console.warn(`Model ${model} failed with ${response.status}, trying next...`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const result = JSON.parse(jsonMatch[0]);
        aiLogger.aiSuccess('Gemini Vision', 'Image Analysis', result);
        console.log(`Successfully used model: ${model}`);
        return result;
      } catch (error) {
        console.warn(`Model ${model} failed:`, error);
        continue;
      }
    }
    
    // If all models fail, throw error
    const error = new Error('All vision models failed');
    aiLogger.aiError('Gemini Vision', 'Image Analysis', error);
    throw error;
  }
}

export const geminiVision = new GeminiVisionAPI();