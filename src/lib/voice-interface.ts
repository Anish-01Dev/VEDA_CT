import aiClient from './ai-client';
import dbManager from './database-schema';

export interface VoiceRecognitionResult {
  text: string;
  confidence: number;
  language: string;
  isFinal: boolean;
}

export interface VoiceSynthesisOptions {
  text: string;
  language: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

class VoiceInterface {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private currentLanguage: string = 'en';
  private supportedLanguages = ['en', 'hi', 'ta'];
  private languageNames = {
    en: 'English',
    hi: 'हिन्दी',
    ta: 'தமிழ்'
  };

  constructor() {
    this.initializeSpeechRecognition();
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 3;
      
      // Set language based on current selection
      this.updateRecognitionLanguage();
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    } else {
      console.warn('Speech synthesis not supported in this browser');
    }
  }

  private updateRecognitionLanguage(): void {
    if (!this.recognition) return;

    const languageMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN'
    };

    this.recognition.lang = languageMap[this.currentLanguage as keyof typeof languageMap] || 'en-IN';
  }

  setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      this.currentLanguage = language;
      this.updateRecognitionLanguage();
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  getLanguageName(code: string): string {
    return this.languageNames[code as keyof typeof this.languageNames] || code;
  }

  async startListening(
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): Promise<void> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available');
    }

    if (this.isListening) {
      this.stopListening();
    }

    this.isListening = true;

    this.recognition.onstart = () => {
      console.log('🎤 Voice recognition started');
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        text: transcript,
        confidence: confidence,
        language: this.currentLanguage,
        isFinal: isFinal
      });
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.isListening = false;
      const errorMessage = this.getErrorMessage(event.error);
      console.error('Voice recognition error:', errorMessage);
      onError?.(errorMessage);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      console.log('🎤 Voice recognition ended');
      onEnd?.();
    };

    try {
      this.recognition.start();
    } catch (error) {
      this.isListening = false;
      throw new Error('Failed to start voice recognition');
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  private getErrorMessage(error: string): string {
    const errorMessages = {
      'no-speech': 'No speech detected. Please try speaking again.',
      'audio-capture': 'Audio capture failed. Please check your microphone.',
      'not-allowed': 'Microphone access denied. Please allow microphone access.',
      'network': 'Network error. Please check your internet connection.',
      'service-not-allowed': 'Speech recognition service not allowed.',
      'bad-grammar': 'Speech recognition grammar error.',
      'language-not-supported': 'Language not supported for speech recognition.'
    };

    return errorMessages[error as keyof typeof errorMessages] || `Speech recognition error: ${error}`;
  }

  async speak(options: VoiceSynthesisOptions): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available');
    }

    // Stop any current speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(options.text);
    
    // Set language
    const languageMap = {
      en: 'en-IN',
      hi: 'hi-IN',
      ta: 'ta-IN'
    };
    utterance.lang = languageMap[options.language as keyof typeof languageMap] || 'en-IN';

    // Set voice properties
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    // Try to find a voice for the specified language
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(options.language) || 
      voice.lang.startsWith('hi') || 
      voice.lang.startsWith('ta')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    return new Promise((resolve, reject) => {
      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
      
      this.synthesis!.speak(utterance);
    });
  }

  async speakHealthAdvice(text: string, language: string = 'en'): Promise<void> {
    const greeting = language === 'hi' ? 'आपकी स्वास्थ्य सलाह: ' : 
                    language === 'ta' ? 'உங்கள் சுகாதார ஆலோசனை: ' :
                    'Your health advice: ';
    
    await this.speak({
      text: greeting + text,
      language: language,
      rate: 0.8,
      pitch: 1.0
    });
  }

  async speakEmergencyAlert(text: string, language: string = 'en'): Promise<void> {
    const alertPrefix = language === 'hi' ? '🚨 आपातकालीन चेतावनी: ' :
                       language === 'ta' ? '🚨 அவசர எச்சரிக்கை: ' :
                       '🚨 EMERGENCY ALERT: ';
    
    await this.speak({
      text: alertPrefix + text,
      language: language,
      rate: 0.7,
      pitch: 1.2,
      volume: 1.0
    });
  }

  async speakSymptomAnalysis(analysis: any, language: string = 'en'): Promise<void> {
    const severityEmoji = {
      mild: '🟢',
      moderate: '🟡',
      severe: '🟠',
      emergency: '🔴'
    };

    const severityText = language === 'hi' ? {
      mild: 'हल्का',
      moderate: 'मध्यम',
      severe: 'गंभीर',
      emergency: 'आपातकाल'
    } : {
      mild: 'Mild',
      moderate: 'Moderate',
      severe: 'Severe',
      emergency: 'Emergency'
    };

    const text = `${severityEmoji[analysis.severity]} ${severityText[analysis.severity]}: ${analysis.description}`;
    
    await this.speak({
      text: text,
      language: language,
      rate: 0.8
    });
  }

  // Voice commands for quick actions
  async processVoiceCommand(command: string, language: string = 'en'): Promise<string> {
    const commandLower = command.toLowerCase();
    
    // Emergency commands
    if (commandLower.includes('emergency') || commandLower.includes('आपातकाल') || commandLower.includes('அவசரம்')) {
      return 'EMERGENCY_MODE';
    }

    // Symptom checker commands
    if (commandLower.includes('symptom') || commandLower.includes('लक्षण') || commandLower.includes('அறிகுறி')) {
      return 'SYMPTOM_CHECKER';
    }

    // Mental health commands
    if (commandLower.includes('therapy') || commandLower.includes('थेरेपी') || commandLower.includes('சிகிச்சை')) {
      return 'MENTAL_HEALTH';
    }

    // Prescription commands
    if (commandLower.includes('prescription') || commandLower.includes('प्रिस्क्रिप्शन') || commandLower.includes('மருந்துப்பதிவு')) {
      return 'PRESCRIPTION_READER';
    }

    // Clinic finder commands
    if (commandLower.includes('clinic') || commandLower.includes('क्लिनिक') || commandLower.includes('மருத்துவமனை')) {
      return 'CLINIC_FINDER';
    }

    // Default to general health advice
    return 'GENERAL_HEALTH';
  }

  // Auto-detect language from speech
  async detectLanguageFromSpeech(audioBlob: Blob): Promise<string> {
    // This is a simplified language detection
    // In a real implementation, you would use a language detection API
    return this.currentLanguage;
  }

  // Voice-based symptom input with real-time analysis
  async startSymptomVoiceInput(
    onSymptomDetected: (symptoms: string, analysis: any) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    let currentTranscript = '';

    await this.startListening(
      async (result) => {
        if (result.isFinal) {
          currentTranscript = result.text;
          
          // Analyze symptoms in real-time
          try {
            const analysis = await aiClient.analyzeSymptoms(currentTranscript, this.currentLanguage);
            
            // Save to database
            await dbManager.addSymptomRecord({
              timestamp: new Date().toISOString(),
              symptoms: currentTranscript,
              analysis: JSON.stringify(analysis),
              confidence: analysis.confidence,
              severity: analysis.severity,
              language: this.currentLanguage
            });

            // Save AI session
            await dbManager.addAISession({
              timestamp: new Date().toISOString(),
              session_type: 'symptom',
              user_input: currentTranscript,
              ai_response: JSON.stringify(analysis),
              confidence: analysis.confidence,
              language: this.currentLanguage,
              offline_mode: !aiClient.getConnectivityStatus()
            });

            onSymptomDetected(currentTranscript, analysis);
            
            // Speak the analysis
            await this.speakSymptomAnalysis(analysis, this.currentLanguage);
            
          } catch (error) {
            console.error('Error analyzing symptoms:', error);
            onError?.('Failed to analyze symptoms');
          }
        }
      },
      onError
    );
  }

  // Voice-based therapy session
  async startVoiceTherapy(
    onResponse: (response: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    let sessionTranscript = '';

    await this.startListening(
      async (result) => {
        if (result.isFinal) {
          sessionTranscript += ' ' + result.text;
          
          try {
            const therapyResponse = await aiClient.getHealthAdvice(sessionTranscript, this.currentLanguage);
            
            // Save mental health session
            await dbManager.addMentalHealthRecord({
              timestamp: new Date().toISOString(),
              mood_score: 5, // Default, should be calculated from session
              anxiety_level: 3, // Default, should be calculated from session
              depression_score: 2, // Default, should be calculated from session
              session_notes: sessionTranscript,
              ai_response: therapyResponse.advice,
              language: this.currentLanguage
            });

            onResponse(therapyResponse.advice);
            
            // Speak the response
            await this.speakHealthAdvice(therapyResponse.advice, this.currentLanguage);
            
          } catch (error) {
            console.error('Error in voice therapy:', error);
            onError?.('Failed to process therapy session');
          }
        }
      },
      onError
    );
  }

  // Get available voices for each language
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    
    const voices = this.synthesis.getVoices();
    return voices.filter(voice => 
      voice.lang.startsWith('en') || 
      voice.lang.startsWith('hi') || 
      voice.lang.startsWith('ta')
    );
  }

  // Test voice functionality
  async testVoice(language: string = 'en'): Promise<void> {
    const testText = language === 'hi' ? 
      'नमस्ते, मैं वैद्याना आपकी स्वास्थ्य सहायक हूं।' :
      language === 'ta' ? 
      'வணக்கம், நான் வைத்யானா உங்கள் சுகாதார உதவியாளர்.' :
      'Hello, I am Vaidyāna, your health assistant.';
    
    await this.speak({
      text: testText,
      language: language,
      rate: 0.8
    });
  }
}

export const voiceInterface = new VoiceInterface();
export default voiceInterface; 