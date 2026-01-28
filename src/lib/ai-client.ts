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
  private model: string = 'gemini-1.5-pro';
  private lastErrorStatus: number = 0;

  constructor() {
    this.apiKey = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1/models';
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

      // Try different models in order of preference (correct names for v1 API)
  const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const model of models) {
      try {
        const response = await fetch(`${this.baseUrl}/${model}:generateContent?key=${this.apiKey}`, {
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
    // Auto-detect language if not provided
    const detectedLanguage = language || LanguageDetector.detectLanguage(symptoms).language;
    try {
      // First, use our medical database for initial analysis
      const symptomList = symptoms.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
      const matchedConditions = findConditionsBySymptoms(symptomList);
      
      // Check for emergency symptom clusters
      const emergencyCluster = SYMPTOM_CLUSTERS.find(cluster => 
        cluster.urgency === 'immediate' && 
        cluster.symptoms.some(s => symptomList.includes(s))
      );
      
      let primaryCondition = matchedConditions[0];
      let isEmergency = false;
      
      if (emergencyCluster) {
        isEmergency = true;
        // Find the emergency condition from our database
        const emergencyCondition = MEDICAL_CONDITIONS.find(c => 
          emergencyCluster.conditions.includes(c.id) || 
          emergencyCluster.conditions.includes(c.name.toLowerCase().replace(/\s+/g, '_'))
        );
        if (emergencyCondition) {
          primaryCondition = emergencyCondition;
        }
      }
      
      // Enhanced system prompt with medical database context and language preservation
      const languageInstructions = LanguageDetector.getLanguageInstructions(detectedLanguage);
      const systemPrompt = `You are an AI healthcare assistant with access to a comprehensive medical database. Analyze the following symptoms and provide a detailed response in JSON format.

MEDICAL DATABASE CONTEXT:
- Detected possible conditions: ${matchedConditions.map(c => c.name).join(', ')}
- Emergency assessment: ${isEmergency ? 'POTENTIAL EMERGENCY DETECTED' : 'No immediate emergency'}
- Primary condition: ${primaryCondition?.name || 'Unknown'}
- Input language detected: ${LanguageDetector.getLanguageName(detectedLanguage)}

CRITICAL LANGUAGE REQUIREMENT:
${languageInstructions}

Requirements:
1. Most likely condition (medical term) - use the detected condition if appropriate
2. Confidence level (0-100) - consider symptom match quality
3. Severity (mild/moderate/severe/emergency) - prioritize safety
4. Description MUST be in the same language as the input: ${LanguageDetector.getLanguageName(detectedLanguage)}
5. 4 specific actionable suggestions based on medical best practices in the same language
6. Medical reasoning for the diagnosis in the same language
7. Emergency contact instructions if needed in the same language
8. Follow-up instructions in the same language

EMERGENCY RED FLAGS TO CHECK:
- Chest pain with shortness of breath
- Sudden severe headache
- One-sided weakness or numbness
- Difficulty speaking or confusion
- Severe abdominal pain
- High fever with confusion

IMPORTANT: 
- ALWAYS respond in the same language as the input text
- Never translate or change the language of your response
- Always err on the side of caution
- For severe symptoms, recommend immediate medical attention
- Provide evidence-based medical advice
- Consider Indian healthcare context
- Respond in valid JSON format only
- If emergency symptoms detected, prioritize immediate medical care

Example response format in ${LanguageDetector.getLanguageName(detectedLanguage)}:
{
  "condition": "${primaryCondition?.name || 'Medical Evaluation Required'}",
  "confidence": 85,
  "severity": "${primaryCondition?.severity || 'moderate'}",
  "description": "Based on your symptoms, you likely have ${primaryCondition?.name || 'a medical condition requiring evaluation'}.",
  "suggestions": [
    "Rest and stay hydrated with plenty of fluids",
    "Take paracetamol for fever as directed",
    "Use saline nasal drops for congestion",
    "Monitor symptoms and seek medical care if they worsen"
  ],
  "reasoning": "Your symptoms are consistent with ${primaryCondition?.name || 'common medical conditions'}. ${primaryCondition?.symptoms.join(', ')} are typical presentations.",
  "emergency_contact": "${isEmergency ? '🚨 EMERGENCY: Seek immediate medical attention. Call 108 immediately.' : 'Seek medical attention if symptoms worsen or persist.'}",
  "follow_up": "If symptoms persist beyond 7 days or worsen, consult a healthcare provider."
}`;

      const response = await this.makeAPIRequest(symptoms, systemPrompt, detectedLanguage);
      
      // Handle case where AI returns array instead of string for description
      if (response.description && Array.isArray(response.description)) {
        response.description = response.description.join('. ');
      }
      
      // Enhance response with medical database information
      if (primaryCondition) {
        response.condition = primaryCondition.name;
        response.severity = primaryCondition.severity;
        response.emergency_contact = getEmergencyAdvice(primaryCondition);
        
        // Add treatment plan if available
        if (response.follow_up) {
          response.follow_up += '\n\n' + getTreatmentPlan(primaryCondition);
        }
      }
      
      return SymptomAnalysisSchema.parse(response);
    } catch (error) {
      console.warn('API failed, using offline fallback:', error);
      return SymptomAnalysisSchema.parse(this.getOfflineResponse('symptom_analysis', symptoms, language));
    }
  }

  async analyzePrescription(prescriptionText: string, language: string = 'en'): Promise<PrescriptionAnalysis> {
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
    return PrescriptionAnalysisSchema.parse(response);
  }

  async getHealthAdvice(query: string, language: string = 'en'): Promise<HealthAdvice> {
    try {
      let systemPrompt = '';
      if (language === 'hi') {
        systemPrompt = `आप एक AI स्वास्थ्य सलाहकार हैं। संक्षिप्त और सटीक स्वास्थ्य सलाह दें। केवल हिंदी में JSON प्रारूप में उत्तर दें।

{
  "advice": "यहाँ हिंदी में सलाह लिखें",
  "confidence": 85,
  "reasoning": "हिंदी में कारण",
  "sources": ["WHO", "ICMR"],
  "contraindications": ["हिंदी में चेतावनी"]
}`;
      } else if (language === 'ta') {
        systemPrompt = `நீங்கள் ஒரு AI சுகாதார ஆலோசகர். சுருக்கமான மற்றும் துல்லியமான சுகாதார ஆலோசனை வழங்கவும். தமிழில் மட்டும் JSON வடிவத்தில் பதிலளிக்கவும்।

{
  "advice": "தமிழில் ஆலோசனை எழுதுங்கள்",
  "confidence": 85,
  "reasoning": "தமிழில் காரணம்",
  "sources": ["WHO", "ICMR"],
  "contraindications": ["தமிழில் எச்சரிக்கை"]
}`;
      } else {
        systemPrompt = `You are an AI health advisor. Provide brief and accurate health advice. Respond in JSON format in English only.

{
  "advice": "Write advice here in English",
  "confidence": 85,
  "reasoning": "Reasoning in English",
  "sources": ["WHO", "ICMR"],
  "contraindications": ["Warning in English"]
}`;
      }

      const response = await this.makeAPIRequest(query, systemPrompt, language);
      
      if (response.advice && Array.isArray(response.advice)) {
        response.advice = response.advice.join('. ');
      }
      
      return HealthAdviceSchema.parse(response);
    } catch (error) {
      console.warn('API failed, using offline fallback:', error);
      return HealthAdviceSchema.parse(this.getOfflineResponse('health_advice', query, language));
    }
  }

  async analyzeMisinformation(claim: string, language: string = 'en'): Promise<MisinformationAnalysis> {
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
    return MisinformationAnalysisSchema.parse(response);
  }

  async analyzeFirstAid(imageDescription: string, language: string = 'en'): Promise<FirstAidAnalysis> {
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
    return FirstAidAnalysisSchema.parse(response);
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
    try {
      const testResponse = await this.makeAPIRequest(
        'Hello',
        'You are a helpful assistant. Respond with "OK" if you receive this message.',
        'en'
      );
      return true;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  // Offline fallback responses for when quota is exceeded
  private getOfflineResponse(type: string, query: string, language: string = 'en'): any {
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