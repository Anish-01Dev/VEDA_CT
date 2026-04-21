import { aiLogger } from './ai-logger';
import { ollamaAnalyzeImage } from './ollama-api';

class GeminiVisionAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = 'REDACTED_GOOGLE_API_KEY';
  }

  async analyzeText(prompt: string): Promise<any> {
    const models = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
            })
          }
        );
        if (!response.ok) continue;
        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;
        return JSON.parse(jsonMatch[0]);
      } catch { continue; }
    }
    throw new Error('All Gemini text models failed');
  }

  async analyzeImage(imageBase64: string, prompt: string): Promise<any> {
    aiLogger.aiStart('Vision', 'Image Analysis', prompt);

    // 1. Try Ollama qwen3-vl:8b first (local, private)
    try {
      aiLogger.aiStart('Ollama Vision', 'Image Analysis', 'qwen3-vl:8b');
      const result = await ollamaAnalyzeImage(imageBase64, prompt);
      aiLogger.aiSuccess('Ollama Vision', 'Image Analysis', result);
      return result;
    } catch (error) {
      aiLogger.aiError('Ollama Vision', 'Image Analysis', error);
      aiLogger.aiFallback('Vision', 'Ollama', 'Gemini');
    }

    // 2. Fallback to Gemini vision models
    const models = ['gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: prompt },
                  { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
                ]
              }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 2048 }
            })
          }
        );

        if (!response.ok) {
          console.warn(`Gemini model ${model} failed with ${response.status}`);
          continue;
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('No JSON in Gemini response');

        const result = JSON.parse(jsonMatch[0]);
        aiLogger.aiSuccess('Gemini Vision', 'Image Analysis', result);
        return result;
      } catch (error) {
        console.warn(`Gemini model ${model} failed:`, error);
        continue;
      }
    }

    const err = new Error('All vision models failed');
    aiLogger.aiError('Vision', 'Image Analysis', err);
    throw err;
  }
}

export const geminiVision = new GeminiVisionAPI();
