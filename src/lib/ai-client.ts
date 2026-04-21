import { z } from 'zod';
import {
  MEDICAL_CONDITIONS,
  SYMPTOM_CLUSTERS,
  MEDICATIONS,
  findConditionsBySymptoms,
  getEmergencyAdvice,
  getTreatmentPlan
} from './medical-database';
import LanguageDetector, { type SupportedLanguage } from './language-detection';
import { sambaNovaAPI } from './sambanova-api';
import { aiLogger } from './ai-logger';
import {
  ollamaAnalyzeSymptoms,
  ollamaGetHealthAdvice,
  ollamaAnalyzePrescription,
  ollamaAnalyzeMisinformation,
  ollamaAnalyzeFirstAid,
  ollamaTestConnection
} from './ollama-api';

// AI Response Schemas
const SymptomAnalysisSchema = z.object({
  condition: z.string(),
  confidence: z.number().min(0).max(100),
  severity: z.enum(['mild', 'moderate', 'severe', 'emergency']),
  description: z.string(),
  suggestions: z.array(z.string()),
  reasoning: z.string(),
  emergency_contact: z.string().optional(),
  follow_up: z.string().optional()
});

const HealthAdviceSchema = z.object({
  advice: z.string(),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  sources: z.array(z.string()),
  contraindications: z.array(z.string()).optional()
});

const PrescriptionAnalysisSchema = z.object({
  medicines: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string(),
    side_effects: z.array(z.string()),
    warnings: z.array(z.string())
  })),
  doctor_name: z.string().optional(),
  date: z.string().optional(),
  confidence: z.number().min(0).max(100),
  language: z.enum(['en', 'hi', 'ta'])
});

const MisinformationAnalysisSchema = z.object({
  verdict: z.enum(['true', 'false', 'misleading', 'unverified']),
  confidence: z.number().min(0).max(100),
  reasoning: z.string(),
  sources: z.array(z.string()),
  fact_check: z.string(),
  recommendations: z.array(z.string())
});

const FirstAidAnalysisSchema = z.object({
  injury_type: z.string(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']),
  confidence: z.number().min(0).max(100),
  immediate_actions: z.array(z.string()),
  treatment_steps: z.array(z.string()),
  warnings: z.array(z.string()),
  when_to_seek_help: z.string()
});

export type SymptomAnalysis = z.infer<typeof SymptomAnalysisSchema>;
export type HealthAdvice = z.infer<typeof HealthAdviceSchema>;
export type PrescriptionAnalysis = z.infer<typeof PrescriptionAnalysisSchema>;
export type MisinformationAnalysis = z.infer<typeof MisinformationAnalysisSchema>;
export type FirstAidAnalysis = z.infer<typeof FirstAidAnalysisSchema>;

class AIClient {
  private apiKey: string;
  private baseUrl: string;
  private isOnline: boolean = true;
  private model: string = 'gemini-2.5-flash';
  private lastErrorStatus: number = 0;
  private useSambaNova: boolean = true;
  private useOllama: boolean = true;

  constructor() {
    this.apiKey = 'REDACTED_GOOGLE_API_KEY';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.useSambaNova = false;
    this.checkConnectivity();
  }

  private async checkConnectivity(): Promise<void> {
    try {
      await fetch('https://www.google.com', { mode: 'no-cors' });
      this.isOnline = true;
    } catch {
      this.isOnline = false;
      console.log('📴 Offline mode activated');
    }
  }

  private async makeAPIRequest(prompt: string, systemPrompt: string, language: string = 'en'): Promise<any> {
    if (!this.isOnline) {
      throw new Error('Offline mode - no internet connection');
    }

    const apiKeyValidation = this.validateAPIKey();
    if (!apiKeyValidation.isValid) {
      throw new Error(apiKeyValidation.error || 'Invalid API key');
    }

    // Use available models with correct API version
    const models = ['gemini-3-flash-preview', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-001'];

    for (const model of models) {
      try {
        // Use v1beta API for all models
        const apiVersion = 'v1beta';
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${this.apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `${systemPrompt}\n\nUser: ${prompt}\n\nAssistant: Please respond with valid JSON only.`
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error Response for ${model}:`, errorText);

          // Track the error status
          this.lastErrorStatus = response.status;

          // Check if it's a quota error (429)
          if (response.status === 429) {
            console.warn(`Quota exceeded for ${model}. Trying next model...`);
            // Add exponential backoff for quota errors
            await new Promise(resolve => setTimeout(resolve, 1000 * (models.indexOf(model) + 1)));
            continue;
          }

          // Check if it's a 404 (model not found)
          if (response.status === 404) {
            console.warn(`Model ${model} not found. Trying next model...`);
            continue;
          }

          // For other errors, continue to next model
          continue;
        }

        const data = await response.json();

        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
          console.error(`Invalid API response format for ${model}`);
          continue;
        }

        const text = data.candidates[0].content.parts[0].text;

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error(`No JSON found in response for ${model}`);
          continue;
        }

        console.log(`Successfully used model: ${model}`);
        return JSON.parse(jsonMatch[0]);
      } catch (error) {
        console.error(`API request failed for ${model}:`, error);
        // Continue to next model
        continue;
      }
    }

    // If we get here, all models failed
    const errorMessage = 'All available models failed. ';

    // Check if it was due to quota issues
    if (this.lastErrorStatus === 429) {
      throw new Error(errorMessage + 'You have exceeded your API quota. Please check your Google AI Studio dashboard or wait for quota reset.');
    }

    throw new Error(errorMessage + 'Please check your API key and try again.');
  }

  // Public API Methods
  async analyzeSymptoms(symptoms: string, language?: string): Promise<SymptomAnalysis> {
    const startTime = Date.now();
    aiLogger.aiStart('AI Client', 'Symptom Analysis', symptoms);
    const detectedLanguage = (language || LanguageDetector.detectLanguage(symptoms).language) as SupportedLanguage;
    const langInstruction = LanguageDetector.getLanguageInstructions(detectedLanguage);

    // 1. Try Gemini first
    try {
      const symptomList = symptoms.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
      const matchedConditions = findConditionsBySymptoms(symptomList);
      const emergencyCluster = SYMPTOM_CLUSTERS.find(cluster =>
        cluster.urgency === 'immediate' &&
        cluster.symptoms.some(s => symptomList.includes(s))
      );
      let primaryCondition = matchedConditions[0];
      let isEmergency = false;
      if (emergencyCluster) {
        isEmergency = true;
        const emergencyCondition = MEDICAL_CONDITIONS.find(c =>
          emergencyCluster.conditions.includes(c.id) ||
          emergencyCluster.conditions.includes(c.name.toLowerCase().replace(/\s+/g, '_'))
        );
        if (emergencyCondition) primaryCondition = emergencyCondition;
      }
      const systemPrompt = `You are an expert doctor. ${langInstruction} Respond ONLY with valid JSON.

IMPORTANT: All text values must be in ${LanguageDetector.getLanguageName(detectedLanguage)}.
Detected conditions: ${matchedConditions.map(c => c.name).join(', ')}
Emergency: ${isEmergency ? 'YES' : 'NO'}

Return JSON:
{
  "condition": "condition name",
  "confidence": 85,
  "severity": "mild|moderate|severe|emergency",
  "description": "2-3 sentence assessment",
  "suggestions": ["action 1", "action 2", "action 3"],
  "reasoning": "brief reasoning",
  "emergency_contact": "when to seek help",
  "follow_up": "follow-up advice"
}`;
      const response = await this.makeAPIRequest(symptoms, systemPrompt, detectedLanguage);
      if (response.description && Array.isArray(response.description)) response.description = response.description.join('. ');
      if (primaryCondition) {
        response.condition = primaryCondition.name;
        response.severity = primaryCondition.severity;
        response.emergency_contact = getEmergencyAdvice(primaryCondition);
      }
      const result = SymptomAnalysisSchema.parse(response);
      aiLogger.aiSuccess('Gemini', 'Symptom Analysis', result);
      aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
      return result;
    } catch (error) {
      aiLogger.aiError('Gemini', 'Symptom Analysis', error);
      aiLogger.aiFallback('AI Client', 'Gemini', 'Ollama');
    }

    // 2. Fallback to Ollama
    if (this.useOllama) {
      try {
        const ollamaResponse = await ollamaAnalyzeSymptoms(symptoms, detectedLanguage);
        const result = SymptomAnalysisSchema.parse(ollamaResponse);
        aiLogger.aiSuccess('Ollama', 'Symptom Analysis', result);
        aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
        return result;
      } catch (error) {
        aiLogger.aiError('Ollama', 'Symptom Analysis', error);
      }
    }

    // 3. Offline fallback
    aiLogger.aiOffline('AI Client', 'Symptom Analysis');
    const fallbackResult = SymptomAnalysisSchema.parse(this.getOfflineResponse('symptom_analysis', symptoms, detectedLanguage));
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return fallbackResult;
  }

  async analyzePrescription(prescriptionText: string, language: string = 'en'): Promise<PrescriptionAnalysis> {
    const startTime = Date.now();
    aiLogger.aiStart('AI Client', 'Prescription Analysis', prescriptionText);

    // 1. Try Ollama first
    if (this.useOllama) {
      try {
        aiLogger.aiStart('Ollama', 'Prescription Analysis', prescriptionText);
        const ollamaResponse = await ollamaAnalyzePrescription(prescriptionText, language);
        const result = PrescriptionAnalysisSchema.parse(ollamaResponse);
        aiLogger.aiSuccess('Ollama', 'Prescription Analysis', result);
        aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
        return result;
      } catch (error) {
        aiLogger.aiError('Ollama', 'Prescription Analysis', error);
        aiLogger.aiFallback('AI Client', 'Ollama', 'Gemini');
      }
    }

    const systemPrompt = `You are an AI prescription reader and medical interpreter. Analyze this prescription and provide detailed information in JSON format.

Requirements:
1. List of medicines with name, dosage, frequency, duration
2. Clear instructions for each medicine in ${language === 'hi' ? 'Hindi' : language === 'ta' ? 'Tamil' : 'English'}
3. Common side effects and warnings
4. Doctor name and date if mentioned
5. Confidence level (0-100)

IMPORTANT:
- Provide accurate medical information
- Include safety warnings
- Explain in simple terms
- Consider Indian pharmaceutical context
- Respond in valid JSON format only

Example response format:
{
  "medicines": [
    {
      "name": "Paracetamol 500mg",
      "dosage": "500mg",
      "frequency": "3 times daily",
      "duration": "5 days",
      "instructions": "Take after meals with water",
      "side_effects": ["Nausea", "Stomach upset", "Allergic reactions"],
      "warnings": ["Do not exceed recommended dose", "Avoid alcohol", "Consult doctor if allergic"]
    }
  ],
  "confidence": 92,
  "language": "${language}",
  "doctor_name": "Dr. Sharma",
  "date": "2024-11-15"
}`;

    const response = await this.makeAPIRequest(prescriptionText, systemPrompt, language);
    const result = PrescriptionAnalysisSchema.parse(response);
    aiLogger.aiSuccess('AI Client', 'Prescription Analysis', result);
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return result;
  }

  async getHealthAdvice(query: string, language: string = 'en'): Promise<HealthAdvice> {
    const startTime = Date.now();
    aiLogger.aiStart('AI Client', 'Health Advice', query);
    const detectedLanguage = LanguageDetector.detectLanguage(query).language as SupportedLanguage;
    const langInstruction = LanguageDetector.getLanguageInstructions(detectedLanguage);

    // 1. Try Gemini first
    try {
      const systemPrompt = `You are an expert doctor. ${langInstruction} Respond ONLY with valid JSON.
IMPORTANT: All text values must be in ${LanguageDetector.getLanguageName(detectedLanguage)}.

Return JSON:
{
  "advice": "clear direct medical advice in 2-3 sentences",
  "confidence": 85,
  "reasoning": "brief medical reasoning",
  "sources": ["Medical Guidelines"],
  "contraindications": ["relevant warnings"]
}`;
      const response = await this.makeAPIRequest(query, systemPrompt, detectedLanguage);
      if (response.advice && Array.isArray(response.advice)) response.advice = response.advice.join('. ');
      const result = HealthAdviceSchema.parse(response);
      aiLogger.aiSuccess('Gemini', 'Health Advice', result);
      aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
      return result;
    } catch (error) {
      aiLogger.aiError('Gemini', 'Health Advice', error);
      aiLogger.aiFallback('AI Client', 'Gemini', 'Ollama');
    }

    // 2. Fallback to Ollama
    if (this.useOllama) {
      try {
        const ollamaResponse = await ollamaGetHealthAdvice(query, detectedLanguage);
        const result = HealthAdviceSchema.parse(ollamaResponse);
        aiLogger.aiSuccess('Ollama', 'Health Advice', result);
        aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
        return result;
      } catch (error) {
        aiLogger.aiError('Ollama', 'Health Advice', error);
      }
    }

    // 3. Offline fallback
    aiLogger.aiOffline('AI Client', 'Health Advice');
    const fallbackResult = HealthAdviceSchema.parse(this.getOfflineResponse('health_advice', query, detectedLanguage));
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return fallbackResult;
  }

  async analyzeMisinformation(claim: string, language: string = 'en'): Promise<MisinformationAnalysis> {
    const startTime = Date.now();
    aiLogger.aiStart('AI Client', 'Misinformation Analysis', claim);

    // 1. Try Ollama first
    if (this.useOllama) {
      try {
        aiLogger.aiStart('Ollama', 'Misinformation Analysis', claim);
        const ollamaResponse = await ollamaAnalyzeMisinformation(claim, language);
        const result = MisinformationAnalysisSchema.parse(ollamaResponse);
        aiLogger.aiSuccess('Ollama', 'Misinformation Analysis', result);
        aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
        return result;
      } catch (error) {
        aiLogger.aiError('Ollama', 'Misinformation Analysis', error);
        aiLogger.aiFallback('AI Client', 'Ollama', 'Gemini');
      }
    }

    const systemPrompt = `You are an AI fact-checker specializing in medical misinformation. Analyze this claim and provide verification in JSON format.

Requirements:
1. Verdict (true/false/misleading/unverified)
2. Confidence level (0-100)
3. Detailed reasoning
4. Reliable sources for verification
5. Fact-check summary
6. Recommendations for users

IMPORTANT:
- Cross-reference with WHO, CDC, ICMR, and other authoritative sources
- Consider Indian healthcare context
- Be thorough in fact-checking
- Provide actionable recommendations
- Respond in valid JSON format only

Example response format:
{
  "verdict": "false",
  "confidence": 95,
  "reasoning": "This claim contradicts established medical guidelines and lacks scientific evidence.",
  "sources": ["WHO Guidelines", "CDC Recommendations", "Indian Medical Association"],
  "fact_check": "Multiple studies have shown this claim to be false.",
  "recommendations": [
    "Consult healthcare professionals for medical advice",
    "Verify information with official health websites",
    "Be skeptical of miracle cure claims"
  ]
}`;

    const response = await this.makeAPIRequest(claim, systemPrompt, language);
    const result = MisinformationAnalysisSchema.parse(response);
    aiLogger.aiSuccess('AI Client', 'Misinformation Analysis', result);
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return result;
  }

  async analyzeFirstAid(imageDescription: string, language: string = 'en'): Promise<FirstAidAnalysis> {
    const startTime = Date.now();
    aiLogger.aiStart('AI Client', 'First Aid Analysis', imageDescription);

    // 1. Try Ollama first
    if (this.useOllama) {
      try {
        aiLogger.aiStart('Ollama', 'First Aid Analysis', imageDescription);
        const ollamaResponse = await ollamaAnalyzeFirstAid(imageDescription, language);
        const result = FirstAidAnalysisSchema.parse(ollamaResponse);
        aiLogger.aiSuccess('Ollama', 'First Aid Analysis', result);
        aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
        return result;
      } catch (error) {
        aiLogger.aiError('Ollama', 'First Aid Analysis', error);
        aiLogger.aiFallback('AI Client', 'Ollama', 'Gemini');
      }
    }

    const systemPrompt = `You are an AI first aid advisor. Analyze this injury description and provide first aid guidance in JSON format.

Requirements:
1. Injury type identification
2. Severity assessment (mild/moderate/severe/critical)
3. Confidence level (0-100)
4. Immediate actions to take
5. Step-by-step treatment
6. Important warnings
7. When to seek professional help

IMPORTANT:
- Prioritize safety and immediate care
- Provide clear, actionable steps
- Include emergency warnings
- Consider Indian healthcare context
- Respond in valid JSON format only

Example response format:
{
  "injury_type": "Minor Cut/Abrasion",
  "severity": "mild",
  "confidence": 85,
  "immediate_actions": [
    "Stop any bleeding by applying direct pressure",
    "Clean the wound with clean water",
    "Assess the depth and size of the injury"
  ],
  "treatment_steps": [
    "Clean the wound gently with soap and water",
    "Apply antiseptic if available",
    "Cover with a clean bandage",
    "Keep the wound dry and clean"
  ],
  "warnings": [
    "Seek medical attention if bleeding doesn't stop",
    "Watch for signs of infection",
    "Do not apply home remedies without medical advice"
  ],
  "when_to_seek_help": "If the wound is deep, bleeding heavily, or shows signs of infection (redness, swelling, pus)"
}`;

    const response = await this.makeAPIRequest(imageDescription, systemPrompt, language);
    const result = FirstAidAnalysisSchema.parse(response);
    aiLogger.aiSuccess('AI Client', 'First Aid Analysis', result);
    aiLogger.aiUsage('AI Client', undefined, Date.now() - startTime);
    return result;
  }

  async translateText(text: string, fromLang: string, toLang: string): Promise<string> {
    if (fromLang === toLang) return text;

    const systemPrompt = `You are a medical translator. Translate the following text from ${fromLang} to ${toLang}. 
    Maintain medical accuracy and cultural sensitivity. Return only the translated text.`;

    const response = await this.makeAPIRequest(text, systemPrompt);
    return response || text;
  }

  getConnectivityStatus(): boolean {
    return this.isOnline;
  }

  getAPIKeyStatus(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_gemini_api_key_here';
  }

  validateAPIKey(): { isValid: boolean; error?: string } {
    if (!this.apiKey) {
      return { isValid: false, error: 'API key is missing' };
    }

    if (this.apiKey === 'your_gemini_api_key_here') {
      return { isValid: false, error: 'API key is not configured. Please add your API key to .env file' };
    }

    if (!this.apiKey.startsWith('AIzaSy')) {
      return { isValid: false, error: 'Invalid API key format. Should start with AIzaSy' };
    }

    if (this.apiKey.length < 35) {
      return { isValid: false, error: 'API key seems too short' };
    }

    return { isValid: true };
  }

  async testConnection(): Promise<boolean> {
    aiLogger.aiStart('AI Client', 'Connection Test');

    // Test Ollama first
    try {
      const ollamaOk = await ollamaTestConnection();
      if (ollamaOk) {
        aiLogger.aiConnection('Ollama', 'connected');
        return true;
      }
    } catch {
      aiLogger.aiConnection('Ollama', 'failed');
    }

    // Test SambaNova
    if (this.useSambaNova) {
      try {
        const sambaTest = await sambaNovaAPI.testConnection();
        if (sambaTest) {
          aiLogger.aiConnection('SambaNova', 'connected');
          return true;
        }
      } catch (error) {
        aiLogger.aiConnection('SambaNova', 'failed');
      }
    }

    // Fallback to Gemini
    try {
      const testResponse = await this.makeAPIRequest(
        'Hello',
        'You are a helpful assistant. Respond with "OK" if you receive this message.',
        'en'
      );
      aiLogger.aiConnection('Gemini', 'connected');
      return true;
    } catch (error) {
      aiLogger.aiConnection('Gemini', 'failed');
      aiLogger.aiError('AI Client', 'Connection Test', error);
      return false;
    }
  }

  getSambaNovaStatus(): boolean {
    return this.useSambaNova && sambaNovaAPI.isConfigured();
  }

  getOllamaStatus(): boolean {
    return this.useOllama;
  }

  // Offline fallback responses for when quota is exceeded
  private getOfflineResponse(type: string, query: string, language: string = 'en'): unknown {
    const detectedLanguage = LanguageDetector.detectLanguage(query).language;
    const isHindi = detectedLanguage === 'hi';
    const isTamil = detectedLanguage === 'ta';
    const isTelugu = detectedLanguage === 'te';
    const isBengali = detectedLanguage === 'bn';
    const isGujarati = detectedLanguage === 'gu';
    const isMarathi = detectedLanguage === 'mr';
    const isKannada = detectedLanguage === 'kn';
    const isMalayalam = detectedLanguage === 'ml';
    const isPunjabi = detectedLanguage === 'pa';
    const isOdia = detectedLanguage === 'or';
    const isAssamese = detectedLanguage === 'as';

    switch (type) {
      case 'health_advice':
        return {
          advice: isHindi ? "आपकी चिंता के लिए धन्यवाद। कृपया अपने स्वास्थ्य के बारे में चिकित्सक से सलाह लें।" :
            isTamil ? "உங்கள் கவலைக்கு நன்றி. தயவுசெய்து உங்கள் சுகாதாரத்தைப் பற்றி மருத்துவரிடம் ஆலோசனை கேள்வி." :
              "Thank you for your concern. Please consult a healthcare provider for personalized medical advice.",
          confidence: 0,
          reasoning: "Offline mode - limited information available",
          sources: ["Offline Database"],
          contraindications: ["Always consult healthcare professionals for medical decisions"]
        };

      case 'symptom_analysis':
        return {
          condition: "General Health Concern",
          confidence: 0,
          severity: "moderate",
          description: isHindi ? "आपके लक्षणों के आधार पर, कृपया चिकित्सक से परामर्श करें।" :
            isTamil ? "உங்கள் அறிகுறிகளின் அடிப்படையில், தயவுசெய்து மருத்துவரிடம் ஆலோசனை கேள்வி." :
              isTelugu ? "మీ లక్షణాల ఆధారంగా, దయచేసి వైద్యుడిని సంప్రదించండి." :
                isBengali ? "আপনার লক্ষণগুলির ভিত্তিতে, দয়া করে একজন চিকিৎসকের সাথে পরামর্শ করুন।" :
                  isGujarati ? "તમારા લક્ષણોના આધારે, કૃપા કરીને ડૉક્ટરની સલાહ લો." :
                    isMarathi ? "तुमच्या लक्षणांच्या आधारे, कृपया डॉक्टरांचा सल्ला घ्या." :
                      isKannada ? "ನಿಮ್ಮ ಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ, ದಯವಿಟ್ಟು ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ." :
                        isMalayalam ? "നിങ്ങളുടെ ലക്ഷണങ്ങളുടെ അടിസ്ഥാനത്തിൽ, ദയവായി ഒരു വൈദ്യനെ സമീപിക്കുക." :
                          isPunjabi ? "ਤੁਹਾਡੇ ਲੱਛਣਾਂ ਦੇ ਆਧਾਰ 'ਤੇ, ਕਿਰਪਾ ਕਰਕੇ ਡਾਕਟਰ ਨਾਲ ਸਲਾਹ ਲਓ." :
                            isOdia ? "ତୁମର ଲକ୍ଷଣଗୁଡ଼ିକର ଆଧାରରେ, ଦୟାକରି ଜଣେ ଡାକ୍ତରଙ୍କ ସହିତ ପରାମର୍ଶ କରନ୍ତୁ।" :
                              isAssamese ? "আপোনাৰ লক্ষণসমূহৰ ভিত্তিত, অনুগ্ৰহ কৰি এজন চিকিৎসকৰ লগত পৰামৰ্শ লওক।" :
                                "Based on your symptoms, please consult a healthcare provider.",
          suggestions: isHindi ? [
            "अपने डॉक्टर से अपॉइंटमेंट लें",
            "लक्षणों की डायरी रखें",
            "स्व-निदान से बचें",
            "पेशेवर चिकित्सा सलाह लें"
          ] : isTamil ? [
            "உங்கள் மருத்துவருடன் நேரம் பேசுங்கள்",
            "அறிகுறிகளின் நாட்குறிப்பை வைத்திருங்கள்",
            "சுய நோயறிதலைத் தவிர்க்கவும்",
            "தொழில்முறை மருத்துவ ஆலோசனையைப் பெறுங்கள்"
          ] : [
            "Schedule an appointment with your doctor",
            "Keep a symptom diary",
            "Avoid self-diagnosis",
            "Seek professional medical advice"
          ],
          reasoning: "Offline mode - limited analysis available",
          emergency_contact: isHindi ? "आपातकाल के लिए, तुरंत अपने स्थानीय आपातकालीन नंबर पर कॉल करें।" :
            isTamil ? "அவசரநிலைக்கு, உடனடியாக உங்கள் உள்ளூர் அவசரகால எண்ணை அழைக்கவும்." :
              "For emergencies, call your local emergency number immediately.",
          follow_up: isHindi ? "उचित निदान और उपचार के लिए कृपया एक स्वास्थ्य सेवा प्रदाता से परामर्श करें।" :
            isTamil ? "சரியான நோயறிதல் மற்றும் சிகிச்சைக்கு தயவுசெய்து ஒரு சுகாதார சேவை வழங்குநரை அணுகவும்." :
              "Please consult a healthcare provider for proper diagnosis and treatment."
        };

      default:
        return {
          message: "Service temporarily unavailable due to API quota limits. Please try again later or consult a healthcare provider.",
          offline: true
        };
    }
  }
}

export const aiClient = new AIClient();
export default aiClient; 