import React, { createContext, useContext, useState, useEffect } from 'react';

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'pa';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'healthcare.without.barriers': 'Healthcare Without Barriers',
    'ai.powered.triage': 'AI-powered medical triage, 24/7 access, zero wait times. For everyone who can\'t reach a doctor easily.',
    'try.virtual.doctor': 'Try Virtual Doctor',
    'watch.how.works': 'Watch How It Works',
    'quick.health.check': 'Quick Health Check',
    'health.modules': 'Health Modules',
    'api.connection.test': 'API Connection Test',
    'nearby.healthcare': 'Nearby Healthcare',
    'find.hospitals.clinics': 'Find hospitals, clinics & pharmacies',
    'search.filter': 'Search & Filter',
    'search.placeholder': 'Search hospitals, clinics, pharmacies...',
    'all': 'All',
    'hospital': 'Hospital',
    'clinic': 'Clinic',
    'doctor': 'Doctor',
    'pharmacy': 'Pharmacy',
    'location.required': 'Location Required',
    'location.found': 'Location Found',
    'click.enable.location': 'Click to enable location access',
    'enable': 'Enable',
    'getting': 'Getting...',
    'healthcare.providers': 'Healthcare Providers',
    'open': 'Open',
    'closed': 'Closed',
    'call': 'Call',
    'directions': 'Directions'
  },
  hi: {
    'healthcare.without.barriers': 'बिना बाधाओं के स्वास्थ्य सेवा',
    'ai.powered.triage': 'एआई-संचालित चिकित्सा ट्राइएज, 24/7 पहुंच, शून्य प्रतीक्षा समय। उन सभी के लिए जो आसानी से डॉक्टर तक नहीं पहुंच सकते।',
    'try.virtual.doctor': 'वर्चुअल डॉक्टर आज़माएं',
    'watch.how.works': 'देखें यह कैसे काम करता है',
    'quick.health.check': 'त्वरित स्वास्थ्य जांच',
    'health.modules': 'स्वास्थ्य मॉड्यूल',
    'api.connection.test': 'एपीआई कनेक्शन टेस्ट',
    'nearby.healthcare': 'नजदीकी स्वास्थ्य सेवा',
    'find.hospitals.clinics': 'अस्पताल, क्लिनिक और फार्मेसी खोजें',
    'search.filter': 'खोजें और फ़िल्टर करें',
    'search.placeholder': 'अस्पताल, क्लिनिक, फार्मेसी खोजें...',
    'all': 'सभी',
    'hospital': 'अस्पताल',
    'clinic': 'क्लिनिक',
    'doctor': 'डॉक्टर',
    'pharmacy': 'फार्मेसी',
    'location.required': 'स्थान आवश्यक',
    'location.found': 'स्थान मिल गया',
    'click.enable.location': 'स्थान पहुंच सक्षम करने के लिए क्लिक करें',
    'enable': 'सक्षम करें',
    'getting': 'प्राप्त कर रहे हैं...',
    'healthcare.providers': 'स्वास्थ्य सेवा प्रदाता',
    'open': 'खुला',
    'closed': 'बंद',
    'call': 'कॉल करें',
    'directions': 'दिशा-निर्देश'
  },
  ta: {
    'healthcare.without.barriers': 'தடைகள் இல்லாத சுகாதாரம்',
    'ai.powered.triage': 'AI-இயங்கும் மருத்துவ ட்ரையேஜ், 24/7 அணுகல், பூஜ்ய காத்திருப்பு நேரம். எளிதில் மருத்துவரை அணுக முடியாத அனைவருக்கும்.',
    'try.virtual.doctor': 'மெய்நிகர் மருத்துவரை முயற்சிக்கவும்',
    'watch.how.works': 'இது எப்படி வேலை செய்கிறது என்பதைப் பாருங்கள்',
    'quick.health.check': 'விரைவு சுகாதார சோதனை',
    'health.modules': 'சுகாதார தொகுதிகள்',
    'api.connection.test': 'API இணைப்பு சோதனை',
    'nearby.healthcare': 'அருகிலுள்ள சுகாதாரம்',
    'find.hospitals.clinics': 'மருத்துவமனைகள், கிளினிக்குகள் மற்றும் மருந்தகங்களைக் கண்டறியவும்',
    'search.filter': 'தேடல் மற்றும் வடிகட்டி',
    'search.placeholder': 'மருத்துவமனைகள், கிளினிக்குகள், மருந்தகங்களைத் தேடுங்கள்...',
    'all': 'அனைத்தும்',
    'hospital': 'மருத்துவமனை',
    'clinic': 'கிளினிக்',
    'doctor': 'மருத்துவர்',
    'pharmacy': 'மருந்தகம்',
    'location.required': 'இடம் தேவை',
    'location.found': 'இடம் கண்டுபிடிக்கப்பட்டது',
    'click.enable.location': 'இட அணுகலை இயக்க கிளிக் செய்யவும்',
    'enable': 'இயக்கு',
    'getting': 'பெறுகிறது...',
    'healthcare.providers': 'சுகாதார சேவை வழங்குநர்கள்',
    'open': 'திறந்தது',
    'closed': 'மூடப்பட்டது',
    'call': 'அழைக்கவும்',
    'directions': 'திசைகள்'
  },
  te: {
    'healthcare.without.barriers': 'అడ్డంకులు లేని ఆరోగ్య సంరక్షణ',
    'ai.powered.triage': 'AI-శక్తితో కూడిన వైద్య ట్రయాజ్, 24/7 యాక్సెస్, జీరో వేట్ టైమ్స్. వైద్యుడిని సులభంగా చేరుకోలేని ప్రతి ఒక్కరికీ.',
    'try.virtual.doctor': 'వర్చువల్ డాక్టర్ని ప్రయత్నించండి',
    'watch.how.works': 'ఇది ఎలా పనిచేస్తుందో చూడండి',
    'quick.health.check': 'త్వరిత ఆరోగ్య తనిఖీ',
    'health.modules': 'ఆరోగ్య మాడ్యూల్స్',
    'api.connection.test': 'API కనెక్షన్ టెస్ట్',
    'nearby.healthcare': 'సమీపంలోని ఆరోగ్య సంరక్షణ',
    'find.hospitals.clinics': 'ఆసుపత్రులు, క్లినిక్లు మరియు ఫార్మసీలను కనుగొనండి',
    'search.filter': 'శోధన మరియు ఫిల్టర్',
    'search.placeholder': 'ఆసుపత్రులు, క్లినిక్లు, ఫార్మసీలను శోధించండి...',
    'all': 'అన్నీ',
    'hospital': 'ఆసుపత్రి',
    'clinic': 'క్లినిక్',
    'doctor': 'వైద్యుడు',
    'pharmacy': 'ఫార్మసీ',
    'location.required': 'స్థానం అవసరం',
    'location.found': 'స్థానం దొరికింది',
    'click.enable.location': 'స్థాన యాక్సెస్ను ప్రారంభించడానికి క్లిక్ చేయండి',
    'enable': 'ప్రారంభించు',
    'getting': 'పొందుతోంది...',
    'healthcare.providers': 'ఆరోగ్య సేవా ప్రదాతలు',
    'open': 'తెరిచింది',
    'closed': 'మూసివేయబడింది',
    'call': 'కాల్ చేయండి',
    'directions': 'దిశలు'
  },
  pa: {
    'healthcare.without.barriers': 'ਬਿਨਾਂ ਰੁਕਾਵਟਾਂ ਦੇ ਸਿਹਤ ਸੇਵਾ',
    'ai.powered.triage': 'AI-ਸੰਚਾਲਿਤ ਮੈਡੀਕਲ ਟ੍ਰਾਈਏਜ, 24/7 ਪਹੁੰਚ, ਜ਼ੀਰੋ ਇੰਤਜ਼ਾਰ ਸਮਾਂ। ਉਹਨਾਂ ਸਾਰਿਆਂ ਲਈ ਜੋ ਆਸਾਨੀ ਨਾਲ ਡਾਕਟਰ ਤੱਕ ਨਹੀਂ ਪਹੁੰਚ ਸਕਦੇ।',
    'try.virtual.doctor': 'ਵਰਚੁਅਲ ਡਾਕਟਰ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ',
    'watch.how.works': 'ਦੇਖੋ ਇਹ ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ',
    'quick.health.check': 'ਤੁਰੰਤ ਸਿਹਤ ਜਾਂਚ',
    'health.modules': 'ਸਿਹਤ ਮਾਡਿਊਲ',
    'api.connection.test': 'API ਕਨੈਕਸ਼ਨ ਟੈਸਟ',
    'nearby.healthcare': 'ਨੇੜਲੀ ਸਿਹਤ ਸੇਵਾ',
    'find.hospitals.clinics': 'ਹਸਪਤਾਲ, ਕਲੀਨਿਕ ਅਤੇ ਫਾਰਮੇਸੀ ਲੱਭੋ',
    'search.filter': 'ਖੋਜ ਅਤੇ ਫਿਲਟਰ',
    'search.placeholder': 'ਹਸਪਤਾਲ, ਕਲੀਨਿਕ, ਫਾਰਮੇਸੀ ਖੋਜੋ...',
    'all': 'ਸਾਰੇ',
    'hospital': 'ਹਸਪਤਾਲ',
    'clinic': 'ਕਲੀਨਿਕ',
    'doctor': 'ਡਾਕਟਰ',
    'pharmacy': 'ਫਾਰਮੇਸੀ',
    'location.required': 'ਸਥਾਨ ਲੋੜੀਂਦਾ',
    'location.found': 'ਸਥਾਨ ਮਿਲ ਗਿਆ',
    'click.enable.location': 'ਸਥਾਨ ਪਹੁੰਚ ਚਾਲੂ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ',
    'enable': 'ਚਾਲੂ ਕਰੋ',
    'getting': 'ਪ੍ਰਾਪਤ ਕਰ ਰਿਹਾ ਹੈ...',
    'healthcare.providers': 'ਸਿਹਤ ਸੇਵਾ ਪ੍ਰਦਾਤਾ',
    'open': 'ਖੁੱਲ੍ਹਾ',
    'closed': 'ਬੰਦ',
    'call': 'ਕਾਲ ਕਰੋ',
    'directions': 'ਦਿਸ਼ਾਵਾਂ'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('vaidyana-language') as SupportedLanguage;
    if (saved && translations[saved]) {
      setCurrentLanguage(saved);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    localStorage.setItem('vaidyana-language', lang);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}