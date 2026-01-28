import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, HelpCircle, Target, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  action: string;
  targetSelector: string;
  highlightType: 'spotlight' | 'outline' | 'pulse';
}

interface GuideContextType {
  startGuide: (pageGuide?: string) => void;
  isGuideOpen: boolean;
}

const GuideContext = createContext<GuideContextType | undefined>(undefined);

// Guide steps for each page
const pageGuides = {
  '/': {
    en: [
      {
        id: 1,
        title: 'Welcome to Vaidyana',
        description: 'Your AI-powered healthcare companion providing 24/7 medical assistance in your preferred language.',
        action: 'Start exploring',
        targetSelector: '.hero-section',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'Virtual Doctor',
        description: 'Talk with our AI doctor using voice or text. Get instant medical guidance with multilingual support.',
        action: 'Try Virtual Doctor',
        targetSelector: 'a[href="/virtual-doctor"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'Quick Health Tools',
        description: 'Access rapid health assessments, symptom checkers, and health monitoring tools instantly.',
        action: 'Explore tools',
        targetSelector: '.quick-actions-section',
        highlightType: 'outline' as const
      },
      {
        id: 4,
        title: 'Health Modules',
        description: 'Comprehensive health features including mental health, diet advice, and specialized tracking.',
        action: 'Browse modules',
        targetSelector: '.health-metrics-section',
        highlightType: 'outline' as const
      },
      {
        id: 5,
        title: 'AI Chat Assistant',
        description: 'Your floating AI assistant for instant medical queries and emergency guidance.',
        action: 'Chat with AI',
        targetSelector: '.fixed.bottom-20.right-4',
        highlightType: 'pulse' as const
      },
      {
        id: 6,
        title: 'Navigation Menu',
        description: 'Access Home, Health tools, Find clinics, Medical tools, and Emergency SOS.',
        action: 'Navigate sections',
        targetSelector: '.bottom-nav',
        highlightType: 'outline' as const
      }
    ],
    hi: [
      {
        id: 1,
        title: 'वैद्यान में आपका स्वागत है',
        description: 'आपका AI-संचालित स्वास्थ्य साथी जो आपकी पसंदीदा भाषा में 24/7 चिकित्सा सहायता प्रदान करता है।',
        action: 'खोजना शुरू करें',
        targetSelector: '.hero-section',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'वर्चुअल डॉक्टर',
        description: 'हमारे AI डॉक्टर से आवाज़ या टेक्स्ट के माध्यम से बात करें। बहुभाषी सहायता के साथ तुरंत चिकित्सा मार्गदर्शन पाएं।',
        action: 'वर्चुअल डॉक्टर आज़माएं',
        targetSelector: 'a[href="/virtual-doctor"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'त्वरित स्वास्थ्य उपकरण',
        description: 'तुरंत स्वास्थ्य मूल्यांकन, लक्षण जांचकर्ता और स्वास्थ्य निगरानी उपकरणों का उपयोग करें।',
        action: 'उपकरण देखें',
        targetSelector: '.quick-actions-section',
        highlightType: 'outline' as const
      },
      {
        id: 4,
        title: 'स्वास्थ्य मॉड्यूल',
        description: 'मानसिक स्वास्थ्य, आहार सलाह और विशेष ट्रैकिंग सहित व्यापक स्वास्थ्य सुविधाएं।',
        action: 'मॉड्यूल देखें',
        targetSelector: '.health-metrics-section',
        highlightType: 'outline' as const
      },
      {
        id: 5,
        title: 'AI चैट सहायक',
        description: 'तुरंत चिकित्सा प्रश्न और आपातकालीन मार्गदर्शन के लिए आपका फ्लोटिंग AI सहायक।',
        action: 'AI से चैट करें',
        targetSelector: '.fixed.bottom-20.right-4',
        highlightType: 'pulse' as const
      },
      {
        id: 6,
        title: 'नेवीगेशन मेनू',
        description: 'होम, स्वास्थ्य उपकरण, क्लिनिक खोजें, चिकित्सा उपकरण और आपातकालीन SOS तक पहुंचें।',
        action: 'अनुभागों में जाएं',
        targetSelector: '.bottom-nav',
        highlightType: 'outline' as const
      }
    ]
  },
  '/health': {
    en: [
      {
        id: 1,
        title: 'Health Dashboard',
        description: 'Your comprehensive health overview with vital signs, metrics, and health tracking.',
        action: 'Explore dashboard',
        targetSelector: '.health-dashboard',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'Symptom Checker',
        description: 'AI-powered symptom analysis with emergency detection and treatment recommendations.',
        action: 'Check symptoms',
        targetSelector: 'a[href="/health/symptom-checker"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'Mental Health Support',
        description: 'Talk to our AI therapist for mental health support and stress management.',
        action: 'Get support',
        targetSelector: 'a[href="/health/mental-health"]',
        highlightType: 'outline' as const
      }
    ],
    hi: [
      {
        id: 1,
        title: 'स्वास्थ्य डैशबोर्ड',
        description: 'महत्वपूर्ण संकेतक, मेट्रिक्स और स्वास्थ्य ट्रैकिंग के साथ आपका व्यापक स्वास्थ्य अवलोकन।',
        action: 'डैशबोर्ड देखें',
        targetSelector: '.health-dashboard',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'लक्षण जांचकर्ता',
        description: 'आपातकालीन पहचान और उपचार सिफारिशों के साथ AI-संचालित लक्षण विश्लेषण।',
        action: 'लक्षण जांचें',
        targetSelector: 'a[href="/health/symptom-checker"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'मानसिक स्वास्थ्य सहायता',
        description: 'मानसिक स्वास्थ्य सहायता और तनाव प्रबंधन के लिए हमारे AI चिकित्सक से बात करें।',
        action: 'सहायता पाएं',
        targetSelector: 'a[href="/health/mental-health"]',
        highlightType: 'outline' as const
      }
    ]
  },
  '/tools': {
    en: [
      {
        id: 1,
        title: 'Medical Tools Hub',
        description: 'Access all medical tools including prescription scanner, first aid, and health trackers.',
        action: 'Explore tools',
        targetSelector: '.tools-grid',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'Prescription Scanner',
        description: 'Scan and analyze prescriptions with AI-powered medicine information and safety warnings.',
        action: 'Scan prescription',
        targetSelector: 'a[href="/tools/prescription-scanner"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'First Aid Advisor',
        description: 'Get visual first aid guidance with step-by-step emergency response instructions.',
        action: 'Learn first aid',
        targetSelector: 'a[href="/tools/first-aid"]',
        highlightType: 'outline' as const
      }
    ],
    hi: [
      {
        id: 1,
        title: 'चिकित्सा उपकरण केंद्र',
        description: 'प्रिस्क्रिप्शन स्कैनर, प्राथमिक चिकित्सा और स्वास्थ्य ट्रैकर सहित सभी चिकित्सा उपकरणों तक पहुंचें।',
        action: 'उपकरण देखें',
        targetSelector: '.tools-grid',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'प्रिस्क्रिप्शन स्कैनर',
        description: 'AI-संचालित दवा जानकारी और सुरक्षा चेतावनियों के साथ प्रिस्क्रिप्शन स्कैन और विश्लेषण करें।',
        action: 'प्रिस्क्रिप्शन स्कैन करें',
        targetSelector: 'a[href="/tools/prescription-scanner"]',
        highlightType: 'pulse' as const
      },
      {
        id: 3,
        title: 'प्राथमिक चिकित्सा सलाहकार',
        description: 'चरणबद्ध आपातकालीन प्रतिक्रिया निर्देशों के साथ दृश्य प्राथमिक चिकित्सा मार्गदर्शन प्राप्त करें।',
        action: 'प्राथमिक चिकित्सा सीखें',
        targetSelector: 'a[href="/tools/first-aid"]',
        highlightType: 'outline' as const
      }
    ]
  },
  '/map': {
    en: [
      {
        id: 1,
        title: 'Healthcare Locator',
        description: 'Find nearby hospitals, clinics, and pharmacies with real-time availability.',
        action: 'Find healthcare',
        targetSelector: '.map-container',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'Search & Filter',
        description: 'Search for specific healthcare providers and filter by type, distance, and availability.',
        action: 'Search providers',
        targetSelector: '.search-filters',
        highlightType: 'outline' as const
      }
    ],
    hi: [
      {
        id: 1,
        title: 'स्वास्थ्य सेवा खोजकर्ता',
        description: 'वास्तविक समय उपलब्धता के साथ नजदीकी अस्पताल, क्लिनिक और फार्मेसी खोजें।',
        action: 'स्वास्थ्य सेवा खोजें',
        targetSelector: '.map-container',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'खोज और फ़िल्टर',
        description: 'विशिष्ट स्वास्थ्य सेवा प्रदाताओं की खोज करें और प्रकार, दूरी और उपलब्धता के आधार पर फ़िल्टर करें।',
        action: 'प्रदाता खोजें',
        targetSelector: '.search-filters',
        highlightType: 'outline' as const
      }
    ]
  },
  '/virtual-doctor': {
    en: [
      {
        id: 1,
        title: 'Virtual Doctor Interface',
        description: 'Your AI doctor avatar that responds with voice and provides medical guidance.',
        action: 'Start consultation',
        targetSelector: '.virtual-doctor-avatar',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'Voice Controls',
        description: 'Use voice commands to interact with the AI doctor in your preferred language.',
        action: 'Try voice chat',
        targetSelector: '.voice-controls',
        highlightType: 'pulse' as const
      }
    ],
    hi: [
      {
        id: 1,
        title: 'वर्चुअल डॉक्टर इंटरफेस',
        description: 'आपका AI डॉक्टर अवतार जो आवाज़ के साथ प्रतिक्रिया देता है और चिकित्सा मार्गदर्शन प्रदान करता है।',
        action: 'परामर्श शुरू करें',
        targetSelector: '.virtual-doctor-avatar',
        highlightType: 'spotlight' as const
      },
      {
        id: 2,
        title: 'आवाज़ नियंत्रण',
        description: 'अपनी पसंदीदा भाषा में AI डॉक्टर के साथ बातचीत करने के लिए आवाज़ कमांड का उपयोग करें।',
        action: 'आवाज़ चैट आज़माएं',
        targetSelector: '.voice-controls',
        highlightType: 'pulse' as const
      }
    ]
  }
};

export function GlobalGuideProvider({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useLanguage();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if user has seen guide before
  useEffect(() => {
    const hasSeenBefore = localStorage.getItem('vaidyana-guide-seen');
    if (!hasSeenBefore) {
      // First time visitor - auto start guide after 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsOpen(true);
      }, 2000);
    } else {
      setHasSeenGuide(true);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]);

  const currentPageGuides = pageGuides[location.pathname] || pageGuides['/'];
  const steps = currentPageGuides[currentLanguage] || currentPageGuides.en;

  const speakText = useCallback((text: string) => {
    if (!isVoiceEnabled || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const langMap = {
      'hi': 'hi-IN',
      'en': 'en-US',
      'ta': 'ta-IN'
    };
    utterance.lang = langMap[currentLanguage] || 'en-US';
    
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(voice => 
        voice.lang === utterance.lang || 
        voice.lang.startsWith(currentLanguage)
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled, currentLanguage]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const toggleVoice = useCallback(() => {
    if (isVoiceEnabled) {
      stopSpeaking();
    }
    setIsVoiceEnabled(!isVoiceEnabled);
  }, [isVoiceEnabled, stopSpeaking]);

  const updateHighlightedElement = useCallback(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].targetSelector);
      if (element) {
        setHighlightedElement(element);
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        
        setTimeout(() => {
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center'
          });
        }, 100);
      }
    }
  }, [isOpen, currentStep, steps]);

  useEffect(() => {
    updateHighlightedElement();
    
    if (isVoiceEnabled && isOpen && steps[currentStep]) {
      const step = steps[currentStep];
      const textToSpeak = `${step.title}. ${step.description}. ${step.action}`;
      setTimeout(() => speakText(textToSpeak), 500);
    }
  }, [updateHighlightedElement, isVoiceEnabled, isOpen, currentStep, steps, speakText]);

  useEffect(() => {
    if (!isOpen || !highlightedElement) return;

    const updatePosition = () => {
      const rect = highlightedElement.getBoundingClientRect();
      setElementRect(rect);
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, highlightedElement]);

  const startGuide = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const closeGuide = () => {
    stopSpeaking();
    setIsOpen(false);
    setHighlightedElement(null);
    setElementRect(null);
    // Mark as seen when user closes guide
    localStorage.setItem('vaidyana-guide-seen', 'true');
    setHasSeenGuide(true);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark as seen when user completes guide
      localStorage.setItem('vaidyana-guide-seen', 'true');
      setHasSeenGuide(true);
      closeGuide();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getTooltipPosition = () => {
    if (!elementRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(384, viewportWidth - 40);
    const tooltipHeight = 350;
    const padding = 20;

    const spaceTop = elementRect.top;
    const spaceBottom = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    let top, left, transform;

    if (spaceBottom >= tooltipHeight + padding) {
      top = elementRect.bottom + padding;
      left = Math.max(padding, Math.min(elementRect.left + elementRect.width / 2, viewportWidth - tooltipWidth - padding));
      transform = 'translate(-50%, 0%)';
    } else if (spaceTop >= tooltipHeight + padding) {
      top = elementRect.top - tooltipHeight - padding;
      left = Math.max(padding, Math.min(elementRect.left + elementRect.width / 2, viewportWidth - tooltipWidth - padding));
      transform = 'translate(-50%, 0%)';
    } else if (spaceRight >= tooltipWidth + padding) {
      top = Math.max(padding, Math.min(elementRect.top + elementRect.height / 2, viewportHeight - tooltipHeight - padding));
      left = elementRect.right + padding;
      transform = 'translate(0%, -50%)';
    } else if (spaceLeft >= tooltipWidth + padding) {
      top = Math.max(padding, Math.min(elementRect.top + elementRect.height / 2, viewportHeight - tooltipHeight - padding));
      left = elementRect.left - tooltipWidth - padding;
      transform = 'translate(0%, -50%)';
    } else {
      top = Math.max(padding, (viewportHeight - tooltipHeight) / 2);
      left = Math.max(padding, (viewportWidth - tooltipWidth) / 2);
      transform = 'translate(0%, 0%)';
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      transform,
      maxWidth: `${tooltipWidth}px`
    };
  };

  const getHighlightStyle = () => {
    if (!elementRect) return {};

    const highlightType = steps[currentStep].highlightType;

    const baseStyle = {
      position: 'fixed' as const,
      top: `${elementRect.top - 8}px`,
      left: `${elementRect.left - 8}px`,
      width: `${elementRect.width + 16}px`,
      height: `${elementRect.height + 16}px`,
      pointerEvents: 'none' as const,
      zIndex: 1001
    };

    switch (highlightType) {
      case 'spotlight':
        return {
          ...baseStyle,
          background: 'rgba(74, 155, 142, 0.2)',
          border: '3px solid #4A9B8E',
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), 0 0 30px rgba(74, 155, 142, 0.6)',
        };
      case 'outline':
        return {
          ...baseStyle,
          border: '3px solid #4A9B8E',
          borderRadius: '8px',
          background: 'rgba(74, 155, 142, 0.1)',
        };
      case 'pulse':
        return {
          ...baseStyle,
          border: '3px solid #4A9B8E',
          borderRadius: '8px',
          background: 'rgba(74, 155, 142, 0.15)',
          animation: 'guideElementPulse 2s infinite',
        };
      default:
        return baseStyle;
    }
  };

  return (
    <GuideContext.Provider value={{ startGuide, isGuideOpen: isOpen }}>
      {children}
      
      {/* Guide Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={startGuide}
            className="fixed bottom-32 left-4 z-[9999] bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white p-4 rounded-full shadow-2xl border-3 border-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 1 }}
            style={{ zIndex: 9999 }}
          >
            <HelpCircle className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Guide Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-[1000] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-black/60" />
              
              {elementRect && (
                <motion.div
                  style={getHighlightStyle()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            <motion.div
              className="fixed z-[1002] pointer-events-auto"
              style={getTooltipPosition()}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="w-full max-w-sm sm:max-w-md bg-white shadow-2xl border-2 border-[#4A9B8E]/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#4A9B8E] text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {currentStep + 1}
                      </div>
                      <div>
                        <span className="text-sm text-gray-500 font-medium">
                          {currentStep + 1} / {steps.length}
                        </span>
                        <div className="flex gap-1 mt-1">
                          {steps.map((_, index) => (
                            <div
                              key={index}
                              className={cn(
                                "w-2 h-2 rounded-full transition-colors",
                                index === currentStep ? 'bg-[#4A9B8E]' : 'bg-gray-300'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeGuide}
                      className="p-2 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-3 text-[#2D3748] font-nunito">
                      {steps[currentStep].title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4 font-inter">
                      {steps[currentStep].description}
                    </p>
                    <div className="bg-[#4A9B8E]/10 border border-[#4A9B8E]/20 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#4A9B8E]" />
                        <span className="text-sm font-medium text-[#4A9B8E]">
                          {steps[currentStep].action}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="flex items-center gap-2 border-[#4A9B8E]/30 text-[#4A9B8E] hover:bg-[#4A9B8E]/5"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {currentLanguage === 'hi' ? 'पिछला' : 'Previous'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={toggleVoice}
                        className={cn(
                          "flex items-center gap-2 border-[#4A9B8E]/30 hover:bg-[#4A9B8E]/5",
                          isVoiceEnabled ? "text-[#4A9B8E] bg-[#4A9B8E]/10" : "text-gray-500"
                        )}
                        title={isVoiceEnabled ? "Disable voice" : "Enable voice"}
                      >
                        {isSpeaking ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white"
                    >
                      {currentStep === steps.length - 1 ? (
                        currentLanguage === 'hi' ? 'समाप्त' : 'Finish'
                      ) : (
                        <>
                          {currentLanguage === 'hi' ? 'अगला' : 'Next'}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes guideElementPulse {
          0%, 100% { 
            opacity: 1;
            transform: scale(1);
          }
          50% { 
            opacity: 0.7;
            transform: scale(1.02);
          }
        }
      `}</style>
    </GuideContext.Provider>
  );
}

export function useGuide() {
  const context = useContext(GuideContext);
  if (context === undefined) {
    throw new Error('useGuide must be used within a GlobalGuideProvider');
  }
  return context;
}