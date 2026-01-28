interface SymptomAnalysis {
  severity: 'mild' | 'moderate' | 'severe';
  analysis: string;
  recommendations: string[];
  possibleConditions: string[];
}

class GeminiAPI {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models';

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
  }

  async analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
    const prompt = `As a medical AI assistant, analyze these symptoms and provide:

1. Severity classification (mild/moderate/severe)
2. Detailed analysis of symptoms
3. Recommended actions (3-4 items)
4. Possible conditions to consider (2-3 items)

Symptoms: ${symptoms}

Format response as JSON:
{
  "severity": "mild|moderate|severe",
  "analysis": "detailed explanation of symptoms",
  "recommendations": ["action 1", "action 2", "action 3"],
  "possibleConditions": ["condition 1", "condition 2"]
}`;

    try {
      const response = await fetch(`${this.baseUrl}/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
        })
      });

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      
      try {
        const jsonMatch = text.match(/```json\s*({[\s\S]*?})\s*```/) || text.match(/({[\s\S]*?})/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
      } catch {}
      
      // Fallback parsing
      const symptomsLower = symptoms.toLowerCase();
      let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
      
      if (symptomsLower.includes('chest') || symptomsLower.includes('breathing')) severity = 'severe';
      else if (symptomsLower.includes('mild')) severity = 'mild';
      
      return {
        severity,
        analysis: text || 'Based on your symptoms, medical evaluation is recommended.',
        recommendations: ['Consult healthcare provider', 'Monitor symptoms', 'Rest and hydration'],
        possibleConditions: ['Various conditions possible', 'Requires medical assessment']
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }
}

export const geminiAPI = new GeminiAPI();
export type { SymptomAnalysis };