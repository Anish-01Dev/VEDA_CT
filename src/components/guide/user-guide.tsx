import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Play, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

const guideSteps = {
  en: [
    {
      id: 1,
      title: 'Choose Your Language',
      description: 'First, select your preferred language from the top-right corner. We support Hindi, Tamil, Telugu, Punjabi and English.',
      action: 'Click on the language button'
    },
    {
      id: 2,
      title: 'Welcome to Vaidyana',
      description: 'This is your health companion. Here you can get medical help 24/7 without going to a doctor.',
      action: 'Read the main message'
    },
    {
      id: 3,
      title: 'Talk to Virtual Doctor',
      description: 'Click this button to talk to our AI doctor. You can speak in your language and get health advice.',
      action: 'Try the Virtual Doctor'
    },
    {
      id: 4,
      title: 'Quick Health Tools',
      description: 'Use these tools for quick health checks, symptom analysis, and health tracking.',
      action: 'Explore health tools'
    },
    {
      id: 5,
      title: 'Navigation Menu',
      description: 'Use these buttons at the bottom to find hospitals, chat with AI, access health tools, and emergency help.',
      action: 'Try different sections'
    }
  ],
  hi: [
    {
      id: 1,
      title: 'अपनी भाषा चुनें',
      description: 'पहले, ऊपरी-दाएं कोने से अपनी पसंदीदा भाषा चुनें। हम हिंदी, तमिल, तेलुगु, पंजाबी और अंग्रेजी का समर्थन करते हैं।',
      action: 'भाषा बटन पर क्लिक करें'
    },
    {
      id: 2,
      title: 'वैद्यान में आपका स्वागत है',
      description: 'यह आपका स्वास्थ्य साथी है। यहाँ आप डॉक्टर के पास गए बिना 24/7 चिकित्सा सहायता प्राप्त कर सकते हैं।',
      action: 'मुख्य संदेश पढ़ें'
    },
    {
      id: 3,
      title: 'वर्चुअल डॉक्टर से बात करें',
      description: 'हमारे AI डॉक्टर से बात करने के लिए इस बटन पर क्लिक करें। आप अपनी भाषा में बोल सकते हैं और स्वास्थ्य सलाह पा सकते हैं।',
      action: 'वर्चुअल डॉक्टर आज़माएं'
    },
    {
      id: 4,
      title: 'त्वरित स्वास्थ्य उपकरण',
      description: 'त्वरित स्वास्थ्य जांच, लक्षण विश्लेषण और स्वास्थ्य ट्रैकिंग के लिए इन उपकरणों का उपयोग करें।',
      action: 'स्वास्थ्य उपकरण देखें'
    },
    {
      id: 5,
      title: 'नेवीगेशन मेनू',
      description: 'अस्पताल खोजने, AI से चैट करने, स्वास्थ्य उपकरण एक्सेस करने और आपातकालीन सहायता के लिए नीचे के इन बटनों का उपयोग करें।',
      action: 'विभिन्न अनुभाग आज़माएं'
    }
  ],
  ta: [
    {
      id: 1,
      title: 'உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்',
      description: 'முதலில், மேல்-வலது மூலையில் இருந்து உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும். நாங்கள் தமிழ், ஹிந்தி, தெலுங்கு, பஞ்சாபி மற்றும் ஆங்கிலத்தை ஆதரிக்கிறோம்.',
      action: 'மொழி பொத்தானைக் கிளிக் செய்யவும்'
    },
    {
      id: 2,
      title: 'வைத்யானாவுக்கு வரவேற்கிறோம்',
      description: 'இது உங்கள் சுகாதார துணை. இங்கே நீங்கள் மருத்துவரிடம் செல்லாமல் 24/7 மருத்துவ உதவி பெறலாம்.',
      action: 'முக்கிய செய்தியைப் படிக்கவும்'
    },
    {
      id: 3,
      title: 'மெய்நிகர் மருத்துவருடன் பேசுங்கள்',
      description: 'எங்கள் AI மருத்துவருடன் பேச இந்த பொத்தானைக் கிளிக் செய்யவும். நீங்கள் உங்கள் மொழியில் பேசலாம் மற்றும் சுகாதார ஆலோசனை பெறலாம்.',
      action: 'மெய்நிகர் மருத்துவரை முயற்சிக்கவும்'
    },
    {
      id: 4,
      title: 'விரைவு சுகாதார கருவிகள்',
      description: 'விரைவு சுகாதார சோதனை, அறிகுறி பகுப்பாய்வு மற்றும் சுகாதார கண்காணிப்புக்கு இந்த கருவிகளைப் பயன்படுத்தவும்.',
      action: 'சுகாதார கருவிகளை ஆராயுங்கள்'
    },
    {
      id: 5,
      title: 'வழிசெலுத்தல் மெனு',
      description: 'மருத்துவமனைகளைக் கண்டறிய, AI உடன் அரட்டை அடிக்க, சுகாதார கருவிகளை அணுக மற்றும் அவசர உதவிக்கு கீழே உள்ள இந்த பொத்தான்களைப் பயன்படுத்தவும்.',
      action: 'வெவ்வேறு பிரிவுகளை முயற்சிக்கவும்'
    }
  ],
  te: [
    {
      id: 1,
      title: 'మీ భాషను ఎంచుకోండి',
      description: 'మొదట, పైన-కుడి మూలలో నుండి మీ ఇష్టమైన భాషను ఎంచుకోండి. మేము తెలుగు, హిందీ, తమిళ్, పంజాబీ మరియు ఇంగ్లీష్ను సపోర్ట్ చేస్తాము.',
      action: 'భాష బటన్పై క్లిక్ చేయండి'
    },
    {
      id: 2,
      title: 'వైద్యానాకు స్వాగతం',
      description: 'ఇది మీ ఆరోగ్య సహాయకుడు. ఇక్కడ మీరు వైద్యుడి వద్దకు వెళ్లకుండా 24/7 వైద్య సహాయం పొందవచ్చు.',
      action: 'ముఖ్య సందేశాన్ని చదవండి'
    },
    {
      id: 3,
      title: 'వర్చువల్ డాక్టర్తో మాట్లాడండి',
      description: 'మా AI డాక్టర్తో మాట్లాడటానికి ఈ బటన్పై క్లిక్ చేయండి. మీరు మీ భాషలో మాట్లాడవచ్చు మరియు ఆరోగ్య సలహా పొందవచ్చు.',
      action: 'వర్చువల్ డాక్టర్ని ప్రయత్నించండి'
    },
    {
      id: 4,
      title: 'త్వరిత ఆరోగ్య సాధనలు',
      description: 'త్వరిత ఆరోగ్య తనిఖీ, లక్షణ విశ్లేషణ మరియు ఆరోగ్య ట్రాకింగ్ కోసం ఈ సాధనలను ఉపయోగించండి.',
      action: 'ఆరోగ్య సాధనలను అన్వేషించండి'
    },
    {
      id: 5,
      title: 'నావిగేషన్ మెనూ',
      description: 'ఆసుపత్రులను కనుగొనడానికి, AI తో చాట్ చేయడానికి, ఆరోగ్య సాధనలను యాక్సెస్ చేయడానికి మరియు అత్యవసర సహాయం కోసం దిగువన ఉన్న ఈ బటన్లను ఉపయోగించండి.',
      action: 'వివిధ విభాగాలను ప్రయత్నించండి'
    }
  ],
  pa: [
    {
      id: 1,
      title: 'ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ',
      description: 'ਪਹਿਲਾਂ, ਉੱਪਰ-ਸੱਜੇ ਕੋਨੇ ਤੋਂ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ। ਅਸੀਂ ਪੰਜਾਬੀ, ਹਿੰਦੀ, ਤਮਿਲ, ਤੇਲਗੂ ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਦਾ ਸਮਰਥਨ ਕਰਦੇ ਹਾਂ।',
      action: 'ਭਾਸ਼ਾ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ'
    },
    {
      id: 2,
      title: 'ਵੈਦਯਾਨਾ ਵਿੱਚ ਜੀ ਆਇਆਂ ਨੂੰ',
      description: 'ਇਹ ਤੁਹਾਡਾ ਸਿਹਤ ਸਾਥੀ ਹੈ। ਇੱਥੇ ਤੁਸੀਂ ਡਾਕਟਰ ਕੋਲ ਗਏ ਬਿਨਾਂ 24/7 ਮੈਡੀਕਲ ਮਦਦ ਲੈ ਸਕਦੇ ਹੋ।',
      action: 'ਮੁੱਖ ਸੰਦੇਸ਼ ਪੜ੍ਹੋ'
    },
    {
      id: 3,
      title: 'ਵਰਚੁਅਲ ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰੋ',
      description: 'ਸਾਡੇ AI ਡਾਕਟਰ ਨਾਲ ਗੱਲ ਕਰਨ ਲਈ ਇਸ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰੋ। ਤੁਸੀਂ ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲ ਸਕਦੇ ਹੋ ਅਤੇ ਸਿਹਤ ਸਲਾਹ ਲੈ ਸਕਦੇ ਹੋ।',
      action: 'ਵਰਚੁਅਲ ਡਾਕਟਰ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ'
    },
    {
      id: 4,
      title: 'ਤੁਰੰਤ ਸਿਹਤ ਸਾਧਨ',
      description: 'ਤੁਰੰਤ ਸਿਹਤ ਜਾਂਚ, ਲੱਛਣ ਵਿਸ਼ਲੇਸ਼ਣ ਅਤੇ ਸਿਹਤ ਟਰੈਕਿੰਗ ਲਈ ਇਹਨਾਂ ਸਾਧਨਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
      action: 'ਸਿਹਤ ਸਾਧਨਾਂ ਦੀ ਪੜਚੋਲ ਕਰੋ'
    },
    {
      id: 5,
      title: 'ਨੈਵੀਗੇਸ਼ਨ ਮੀਨੂ',
      description: 'ਹਸਪਤਾਲ ਲੱਭਣ, AI ਨਾਲ ਚੈਟ ਕਰਨ, ਸਿਹਤ ਸਾਧਨਾਂ ਤੱਕ ਪਹੁੰਚ ਅਤੇ ਐਮਰਜੈਂਸੀ ਮਦਦ ਲਈ ਹੇਠਾਂ ਇਹਨਾਂ ਬਟਨਾਂ ਦੀ ਵਰਤੋਂ ਕਰੋ।',
      action: 'ਵੱਖ-ਵੱਖ ਸੈਕਸ਼ਨਾਂ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੋ'
    }
  ]
};

export function UserGuide() {
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  const steps = guideSteps[currentLanguage] || guideSteps.en;

  useEffect(() => {
    const seen = localStorage.getItem('vaidyana-guide-seen');
    if (!seen) {
      setTimeout(() => setIsOpen(true), 2000);
    } else {
      setHasSeenGuide(true);
    }
  }, []);

  const closeGuide = () => {
    setIsOpen(false);
    localStorage.setItem('vaidyana-guide-seen', 'true');
    setHasSeenGuide(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const startGuide = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  return (
    <>
      {/* Guide Button - Always visible */}
      {hasSeenGuide && (
        <motion.button
          onClick={startGuide}
          className="fixed bottom-32 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <HelpCircle className="w-6 h-6" />
        </motion.button>
      )}

      {/* Guide Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <span className="text-sm text-gray-500">
                        {currentStep + 1} / {steps.length}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeGuide}
                      className="p-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-900">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {steps[currentStep].description}
                    </p>
                    {steps[currentStep].action && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            {steps[currentStep].action}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {currentLanguage === 'hi' ? 'पिछला' : 
                       currentLanguage === 'ta' ? 'முந்தைய' :
                       currentLanguage === 'te' ? 'మునుపటి' :
                       currentLanguage === 'pa' ? 'ਪਿਛਲਾ' : 'Previous'}
                    </Button>

                    <div className="flex gap-1">
                      {steps.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentStep ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                    >
                      {currentStep === steps.length - 1 ? (
                        currentLanguage === 'hi' ? 'समाप्त' :
                        currentLanguage === 'ta' ? 'முடிவு' :
                        currentLanguage === 'te' ? 'ముగింపు' :
                        currentLanguage === 'pa' ? 'ਸਮਾਪਤ' : 'Finish'
                      ) : (
                        <>
                          {currentLanguage === 'hi' ? 'अगला' :
                           currentLanguage === 'ta' ? 'அடுத்து' :
                           currentLanguage === 'te' ? 'తదుపరి' :
                           currentLanguage === 'pa' ? 'ਅਗਲਾ' : 'Next'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}