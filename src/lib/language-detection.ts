/**
 * Language Detection and Preservation Utility
 * Automatically detects input language and ensures AI responses match
 */

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'gu' | 'mr' | 'kn' | 'ml' | 'pa' | 'or' | 'as';

export interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: number;
  detectedText: string;
}

export class LanguageDetector {
  private static readonly LANGUAGE_PATTERNS = {
    // Hindi (Devanagari script)
    hi: /[\u0900-\u097F]/,
    // Tamil
    ta: /[\u0B80-\u0BFF]/,
    // Telugu
    te: /[\u0C00-\u0C7F]/,
    // Bengali
    bn: /[\u0980-\u09FF]/,
    // Gujarati
    gu: /[\u0A80-\u0AFF]/,
    // Marathi (uses Devanagari like Hindi)
    mr: /[\u0900-\u097F]/,
    // Kannada
    kn: /[\u0C80-\u0CFF]/,
    // Malayalam
    ml: /[\u0D00-\u0D7F]/,
    // Punjabi (Gurmukhi)
    pa: /[\u0A00-\u0A7F]/,
    // Odia
    or: /[\u0B00-\u0B7F]/,
    // Assamese
    as: /[\u0980-\u09FF]/
  };

  private static readonly COMMON_WORDS = {
    hi: ['है', 'हैं', 'का', 'की', 'के', 'में', 'से', 'को', 'पर', 'तक', 'अब', 'यह', 'वह', 'मैं', 'तुम', 'हम', 'आप'],
    ta: ['உள்ளது', 'இருக்கிறது', 'ஆகும்', 'ஆகிய', 'மற்றும்', 'அல்லது', 'ஆனால்', 'எனவே', 'இப்போது', 'இங்கே', 'அங்கே'],
    te: ['ఉంది', 'ఉన్నాయి', 'అవుతుంది', 'మరియు', 'లేదా', 'కానీ', 'కాబట్టి', 'ఇప్పుడు', 'ఇక్కడ', 'అక్కడ'],
    bn: ['আছে', 'হয়', 'এবং', 'অথবা', 'কিন্তু', 'তাই', 'এখন', 'এখানে', 'সেখানে'],
    gu: ['છે', 'છો', 'છી', 'અને', 'અથવા', 'પણ', 'તેથી', 'હવે', 'અહીં', 'ત્યાં'],
    mr: ['आहे', 'आहेत', 'आणि', 'किंवा', 'पण', 'म्हणून', 'आता', 'इथे', 'तिथे'],
    kn: ['ಇದೆ', 'ಇವೆ', 'ಮತ್ತು', 'ಅಥವಾ', 'ಆದರೆ', 'ಆದ್ದರಿಂದ', 'ಈಗ', 'ಇಲ್ಲಿ', 'ಅಲ್ಲಿ'],
    ml: ['ഉണ്ട്', 'ആണ്', 'ആയിരിക്കുന്നു', 'ഒപ്പം', 'അല്ലെങ്കിൽ', 'പക്ഷേ', 'അതിനാൽ', 'ഇപ്പോൾ', 'ഇവിടെ', 'അവിടെ'],
    pa: ['ਹੈ', 'ਹਨ', 'ਅਤੇ', 'ਜਾਂ', 'ਪਰ', 'ਇਸਲਈ', 'ਹੁਣ', 'ਇੱਥੇ', 'ਉੱਥੇ'],
    or: ['ଅଛି', 'ହୋଇଛି', 'ଏବଂ', 'କିମ୍ବା', 'କିନ୍ତୁ', 'ତେଣୁ', 'ଏବେ', 'ଏଠାରେ', 'ସେଠାରେ'],
    as: ['আছে', 'হয়', 'আৰু', 'নাইবা', 'কিন্তু', 'গতিকে', 'এতিয়া', 'ইয়াত', 'তাত']
  };

  /**
   * Detect language from input text
   */
  static detectLanguage(text: string): LanguageDetectionResult {
    if (!text || text.trim().length === 0) {
      return { language: 'en', confidence: 0, detectedText: text };
    }

    const cleanText = text.trim();
    let maxConfidence = 0;
    let detectedLanguage: SupportedLanguage = 'en';

    // Check for script patterns first (most reliable)
    for (const [lang, pattern] of Object.entries(this.LANGUAGE_PATTERNS)) {
      const matches = cleanText.match(pattern);
      if (matches) {
        const confidence = (matches.length / cleanText.length) * 100;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedLanguage = lang as SupportedLanguage;
        }
      }
    }

    // If no script detected, check for common words
    if (maxConfidence < 30) {
      for (const [lang, words] of Object.entries(this.COMMON_WORDS)) {
        let wordMatches = 0;
        const textWords = cleanText.toLowerCase().split(/\s+/);
        
        for (const word of words) {
          if (textWords.includes(word)) {
            wordMatches++;
          }
        }
        
        const confidence = (wordMatches / words.length) * 100;
        if (confidence > maxConfidence) {
          maxConfidence = confidence;
          detectedLanguage = lang as SupportedLanguage;
        }
      }
    }

    // Default to English if confidence is too low
    if (maxConfidence < 20) {
      detectedLanguage = 'en';
      maxConfidence = 100; // Assume English if no other language detected
    }

    return {
      language: detectedLanguage,
      confidence: Math.min(maxConfidence, 100),
      detectedText: cleanText
    };
  }

  /**
   * Get language name in native script
   */
  static getLanguageName(language: SupportedLanguage): string {
    const names = {
      en: 'English',
      hi: 'हिन्दी',
      ta: 'தமிழ்',
      te: 'తెలుగు',
      bn: 'বাংলা',
      gu: 'ગુજરાતી',
      mr: 'मराठी',
      kn: 'ಕನ್ನಡ',
      ml: 'മലയാളം',
      pa: 'ਪੰਜਾਬੀ',
      or: 'ଓଡ଼ିଆ',
      as: 'অসমীয়া'
    };
    return names[language] || 'English';
  }

  /**
   * Get language-specific system prompt instructions
   */
  static getLanguageInstructions(language: SupportedLanguage): string {
    const instructions = {
      en: 'Respond in English. Use clear, professional medical terminology.',
      hi: 'हिन्दी में उत्तर दें। स्पष्ट, पेशेवर चिकित्सा शब्दावली का उपयोग करें।',
      ta: 'தமிழில் பதிலளிக்கவும்। தெளிவான, தொழில்முறை மருத்துவ சொற்களஞ்சியத்தைப் பயன்படுத்தவும்।',
      te: 'తెలుగులో సమాధానం ఇవ్వండి. స్పష్టమైన, వృత్తిపరమైన వైద్య పదజాలాన్ని ఉపయోగించండి।',
      bn: 'বাংলায় উত্তর দিন। স্পষ্ট, পেশাদার চিকিৎসা পরিভাষা ব্যবহার করুন।',
      gu: 'ગુજરાતીમાં જવાબ આપો। સ્પષ્ટ, વ્યાવસાયિક તબીબી શબ્દાવલીનો ઉપયોગ કરો।',
      mr: 'मराठीत उत्तर द्या। स्पष्ट, व्यावसायिक वैद्यकीय शब्दावली वापरा।',
      kn: 'ಕನ್ನಡದಲ್ಲಿ ಉತ್ತರಿಸಿ। ಸ್ಪಷ್ಟ, ವೃತ್ತಿಪರ ವೈದ್ಯಕೀಯ ಪದಕೋಶವನ್ನು ಬಳಸಿ।',
      ml: 'മലയാളത്തിൽ ഉത്തരിക്കുക। വ്യക്തവും പ്രൊഫഷണലുമായ മെഡിക്കൽ പദാവലി ഉപയോഗിക്കുക।',
      pa: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਪਸ਼ਟ, ਪੇਸ਼ੇਵਰ ਡਾਕਟਰੀ ਸ਼ਬਦਾਵਲੀ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
      or: 'ଓଡ଼ିଆରେ ଉତ୍ତର ଦିଅନ୍ତୁ। ସ୍ପଷ୍ଟ, ବୃତ୍ତିଗତ ଚିକିତ୍ସା ଶବ୍ଦାବଳୀ ବ୍ୟବହାର କରନ୍ତୁ।',
      as: 'অসমীয়াত উত্তৰ দিয়ক। স্পষ্ট, পেছাদাৰী চিকিৎসা শব্দাৱলী ব্যৱহাৰ কৰক।'
    };
    return instructions[language] || instructions.en;
  }

  /**
   * Validate if text contains mixed languages
   */
  static hasMixedLanguages(text: string): boolean {
    const detection = this.detectLanguage(text);
    if (detection.language === 'en') return false;
    
    // Check if English words are mixed with other languages
    const englishWords = text.match(/[a-zA-Z]+/g) || [];
    const nonEnglishChars = text.replace(/[a-zA-Z\s]/g, '');
    
    return englishWords.length > 0 && nonEnglishChars.length > 0;
  }

  /**
   * Get primary language for mixed language input
   */
  static getPrimaryLanguage(text: string): SupportedLanguage {
    const detection = this.detectLanguage(text);
    
    if (this.hasMixedLanguages(text)) {
      // If mixed, prioritize non-English script
      const nonEnglishChars = text.replace(/[a-zA-Z\s]/g, '');
      if (nonEnglishChars.length > text.length * 0.3) {
        return detection.language;
      }
    }
    
    return detection.language;
  }
}

export default LanguageDetector;
