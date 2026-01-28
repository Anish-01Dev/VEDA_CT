/**
 * API Validation Utility
 * Tests if AI APIs are working correctly and not using mock data
 */

export interface APIValidationResult {
  isWorking: boolean;
  isRealAI: boolean;
  responseTime: number;
  error?: string;
  sampleResponse?: any;
}

export class APIValidator {
  private static readonly API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;
  private static readonly BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  /**
   * Test if the Gemini API is working and returning real AI responses
   */
  static async validateGeminiAPI(): Promise<APIValidationResult> {
    const startTime = Date.now();
    
    if (!this.API_KEY) {
      return {
        isWorking: false,
        isRealAI: false,
        responseTime: 0,
        error: 'API key not configured'
      };
    }

    try {
      const testPrompt = `Test prompt: What is 2+2? Respond with only the number.`;
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        return {
          isWorking: false,
          isRealAI: false,
          responseTime,
          error: `API Error: ${response.status} - ${errorText}`
        };
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        return {
          isWorking: false,
          isRealAI: false,
          responseTime,
          error: 'No response from AI'
        };
      }

      // Check if response is real AI (not mock data)
      const isRealAI = this.validateRealAIResponse(aiResponse, testPrompt);

      return {
        isWorking: true,
        isRealAI,
        responseTime,
        sampleResponse: aiResponse
      };

    } catch (error) {
      return {
        isWorking: false,
        isRealAI: false,
        responseTime: Date.now() - startTime,
        error: `Network error: ${error}`
      };
    }
  }

  /**
   * Test language preservation in AI responses
   */
  static async testLanguagePreservation(): Promise<{
    hindi: APIValidationResult;
    tamil: APIValidationResult;
    english: APIValidationResult;
  }> {
    const testCases = [
      { language: 'hindi', prompt: 'मुझे सिरदर्द है। मुझे क्या करना चाहिए?', expectedKeywords: ['सिरदर्द', 'डॉक्टर', 'दवा'] },
      { language: 'tamil', prompt: 'எனக்கு தலைவலி இருக்கிறது. நான் என்ன செய்ய வேண்டும்?', expectedKeywords: ['தலைவலி', 'மருத்துவர்', 'மருந்து'] },
      { language: 'english', prompt: 'I have a headache. What should I do?', expectedKeywords: ['headache', 'doctor', 'medicine'] }
    ];

    const results: any = {};

    for (const testCase of testCases) {
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a medical AI assistant. Respond to this query in the SAME language as the input. Do not translate.

Query: ${testCase.prompt}

CRITICAL: Respond in the same language as the input. Never translate or change the language.`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 200
            }
          })
        });

        const responseTime = Date.now() - startTime;

        if (!response.ok) {
          results[testCase.language] = {
            isWorking: false,
            isRealAI: false,
            responseTime,
            error: `API Error: ${response.status}`
          };
          continue;
        }

        const data = await response.json();
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiResponse) {
          results[testCase.language] = {
            isWorking: false,
            isRealAI: false,
            responseTime,
            error: 'No response from AI'
          };
          continue;
        }

        // Check if response contains expected language keywords
        const containsExpectedKeywords = testCase.expectedKeywords.some(keyword => 
          aiResponse.toLowerCase().includes(keyword.toLowerCase())
        );

        results[testCase.language] = {
          isWorking: true,
          isRealAI: true,
          responseTime,
          languagePreserved: containsExpectedKeywords,
          sampleResponse: aiResponse
        };

      } catch (error) {
        results[testCase.language] = {
          isWorking: false,
          isRealAI: false,
          responseTime: Date.now() - startTime,
          error: `Network error: ${error}`
        };
      }
    }

    return results;
  }

  /**
   * Validate if response is from real AI (not mock data)
   */
  private static validateRealAIResponse(response: string, prompt: string): boolean {
    // Check for signs of mock data
    const mockIndicators = [
      'mock',
      'sample',
      'test data',
      'placeholder',
      'dummy',
      'fake'
    ];

    const isMock = mockIndicators.some(indicator => 
      response.toLowerCase().includes(indicator)
    );

    if (isMock) {
      return false;
    }

    // Check if response is contextually appropriate
    if (prompt.includes('2+2') && response.includes('4')) {
      return true;
    }

    // Check if response is too generic
    const genericResponses = [
      'I cannot help with that',
      'Please consult a doctor',
      'This is not medical advice',
      'Contact your healthcare provider'
    ];

    const isGeneric = genericResponses.some(generic => 
      response.toLowerCase().includes(generic.toLowerCase())
    );

    return !isGeneric;
  }

  /**
   * Test symptom analysis with language preservation
   */
  static async testSymptomAnalysis(): Promise<APIValidationResult> {
    const startTime = Date.now();
    
    try {
      const testSymptoms = 'मुझे बुखार और सिरदर्द है'; // Hindi: "I have fever and headache"
      
      const response = await fetch(`${this.BASE_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a medical AI assistant. Analyze these symptoms and respond in the SAME language as the input.

Symptoms: ${testSymptoms}

CRITICAL REQUIREMENTS:
- Respond in Hindi (हिन्दी) since the input is in Hindi
- Provide medical analysis in Hindi
- Never translate to English
- Return valid JSON format

Return JSON:
{
  "condition": "condition name",
  "confidence": 85,
  "severity": "moderate",
  "description": "description in Hindi",
  "suggestions": ["suggestion 1 in Hindi", "suggestion 2 in Hindi"],
  "reasoning": "reasoning in Hindi"
}`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500
          }
        })
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          isWorking: false,
          isRealAI: false,
          responseTime,
          error: `API Error: ${response.status}`
        };
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        return {
          isWorking: false,
          isRealAI: false,
          responseTime,
          error: 'No response from AI'
        };
      }

      // Check if response contains Hindi text
      const hindiPattern = /[\u0900-\u097F]/;
      const containsHindi = hindiPattern.test(aiResponse);

      return {
        isWorking: true,
        isRealAI: true,
        responseTime,
        languagePreserved: containsHindi,
        sampleResponse: aiResponse
      };

    } catch (error) {
      return {
        isWorking: false,
        isRealAI: false,
        responseTime: Date.now() - startTime,
        error: `Network error: ${error}`
      };
    }
  }

  /**
   * Run comprehensive API validation
   */
  static async runFullValidation(): Promise<{
    basicAPI: APIValidationResult;
    languagePreservation: any;
    symptomAnalysis: APIValidationResult;
    summary: {
      allWorking: boolean;
      realAI: boolean;
      languagePreserved: boolean;
      averageResponseTime: number;
    };
  }> {
    console.log('🔍 Starting API validation...');
    
    const basicAPI = await this.validateGeminiAPI();
    console.log('✅ Basic API test completed');
    
    const languagePreservation = await this.testLanguagePreservation();
    console.log('✅ Language preservation test completed');
    
    const symptomAnalysis = await this.testSymptomAnalysis();
    console.log('✅ Symptom analysis test completed');

    const allWorking = basicAPI.isWorking && 
                      Object.values(languagePreservation).every((result: any) => result.isWorking) &&
                      symptomAnalysis.isWorking;

    const realAI = basicAPI.isRealAI && 
                   Object.values(languagePreservation).every((result: any) => result.isRealAI) &&
                   symptomAnalysis.isRealAI;

    const languagePreserved = Object.values(languagePreservation).every((result: any) => result.languagePreserved) &&
                             symptomAnalysis.languagePreserved;

    const responseTimes = [
      basicAPI.responseTime,
      ...Object.values(languagePreservation).map((result: any) => result.responseTime),
      symptomAnalysis.responseTime
    ].filter(time => time > 0);

    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    return {
      basicAPI,
      languagePreservation,
      symptomAnalysis,
      summary: {
        allWorking,
        realAI,
        languagePreserved,
        averageResponseTime
      }
    };
  }
}

export default APIValidator;
