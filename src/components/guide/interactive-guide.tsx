import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft, Play, HelpCircle, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';
import { cn } from '@/lib/utils';

interface GuideStep {
  id: number;
  title: string;
  description: string;
  action: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  highlightType: 'spotlight' | 'outline' | 'pulse';
}

const guideSteps = {
  en: [
    {
      id: 1,
      title: 'Welcome to Vaidyana',
      description: 'Your AI-powered healthcare companion. This platform provides 24/7 medical assistance, symptom checking, and health guidance in your preferred language.',
      action: 'Let\'s start the tour',
      targetSelector: '.hero-section',
      position: 'center' as const,
      highlightType: 'spotlight' as const
    },
    {
      id: 2,
      title: 'Virtual Doctor',
      description: 'Click here to talk with our AI doctor. You can speak in your language, describe symptoms, and get instant medical guidance with voice responses.',
      action: 'Try talking to the Virtual Doctor',
      targetSelector: 'a[href="/virtual-doctor"]',
      position: 'bottom' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 3,
      title: 'Quick Health Tools',
      description: 'Access rapid health assessments, symptom checkers, and health monitoring tools. These provide instant health insights without waiting.',
      action: 'Explore health tools',
      targetSelector: '.quick-actions-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 4,
      title: 'Health Modules',
      description: 'Comprehensive health features including mental health support, diet advice, lab analysis, and specialized health tracking tools.',
      action: 'Browse health modules',
      targetSelector: '.health-metrics-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 5,
      title: 'AI Chat Assistant',
      description: 'Your floating AI assistant is always available. Click here for instant medical queries, health advice, and emergency guidance.',
      action: 'Chat with AI assistant',
      targetSelector: '.fixed.bottom-20.right-4',
      position: 'left' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 6,
      title: 'Navigation Menu',
      description: 'Use the bottom navigation to access: Home, Health tools, Find nearby clinics, Medical tools, and Emergency SOS.',
      action: 'Navigate through sections',
      targetSelector: '.bottom-nav',
      position: 'top' as const,
      highlightType: 'outline' as const
    }
  ],
  hi: [
    {
      id: 1,
      title: 'वैद्यान में आपका स्वागत है',
      description: 'आपका AI-संचालित स्वास्थ्य साथी। यह प्लेटफॉर्म आपकी पसंदीदा भाषा में 24/7 चिकित्सा सहायता, लक्षण जांच और स्वास्थ्य मार्गदर्शन प्रदान करता है।',
      action: 'आइए टूर शुरू करते हैं',
      targetSelector: '.hero-section',
      position: 'center' as const,
      highlightType: 'spotlight' as const
    },
    {
      id: 2,
      title: 'वर्चुअल डॉक्टर',
      description: 'हमारे AI डॉक्टर से बात करने के लिए यहाँ क्लिक करें। आप अपनी भाषा में बोल सकते हैं, लक्षण बता सकते हैं और आवाज़ के साथ तुरंत चिकित्सा मार्गदर्शन पा सकते हैं।',
      action: 'वर्चुअल डॉक्टर से बात करें',
      targetSelector: 'a[href="/virtual-doctor"]',
      position: 'bottom' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 3,
      title: 'त्वरित स्वास्थ्य उपकरण',
      description: 'तुरंत स्वास्थ्य मूल्यांकन, लक्षण जांचकर्ता और स्वास्थ्य निगरानी उपकरण का उपयोग करें। ये बिना प्रतीक्षा के तुरंत स्वास्थ्य जानकारी प्रदान करते हैं।',
      action: 'स्वास्थ्य उपकरण देखें',
      targetSelector: '.quick-actions-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 4,
      title: 'स्वास्थ्य मॉड्यूल',
      description: 'व्यापक स्वास्थ्य सुविधाएं जिनमें मानसिक स्वास्थ्य सहायता, आहार सलाह, लैब विश्लेषण और विशेष स्वास्थ्य ट्रैकिंग उपकरण शामिल हैं।',
      action: 'स्वास्थ्य मॉड्यूल देखें',
      targetSelector: '.health-metrics-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 5,
      title: 'AI चैट सहायक',
      description: 'आपका फ्लोटिंग AI सहायक हमेशा उपलब्ध है। तुरंत चिकित्सा प्रश्न, स्वास्थ्य सलाह और आपातकालीन मार्गदर्शन के लिए यहाँ क्लिक करें।',
      action: 'AI सहायक से चैट करें',
      targetSelector: '.fixed.bottom-20.right-4',
      position: 'left' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 6,
      title: 'नेवीगेशन मेनू',
      description: 'निचले नेवीगेशन का उपयोग करके पहुंचें: होम, स्वास्थ्य उपकरण, नजदीकी क्लिनिक खोजें, चिकित्सा उपकरण और आपातकालीन SOS।',
      action: 'अनुभागों में नेवीगेट करें',
      targetSelector: '.bottom-nav',
      position: 'top' as const,
      highlightType: 'outline' as const
    }
  ],
  ta: [
    {
      id: 1,
      title: 'வைத்யானாவுக்கு வரவேற்கிறோம்',
      description: 'உங்கள் AI-இயங்கும் சுகாதார துணை. இந்த தளம் உங்கள் விருப்பமான மொழியில் 24/7 மருத்துவ உதவி, அறிகுறி சோதனை மற்றும் சுகாதார வழிகாட்டுதலை வழங்குகிறது.',
      action: 'சுற்றுப்பயணத்தைத் தொடங்குவோம்',
      targetSelector: '.hero-section',
      position: 'center' as const,
      highlightType: 'spotlight' as const
    },
    {
      id: 2,
      title: 'மெய்நிகர் மருத்துவர்',
      description: 'எங்கள் AI மருத்துவருடன் பேச இங்கே கிளிக் செய்யுங்கள். நீங்கள் உங்கள் மொழியில் பேசலாம், அறிகுறிகளை விவரிக்கலாம் மற்றும் குரல் பதில்களுடன் உடனடி மருத்துவ வழிகாட்டுதலைப் பெறலாம்.',
      action: 'மெய்நிகர் மருத்துவருடன் பேசுங்கள்',
      targetSelector: 'a[href="/virtual-doctor"]',
      position: 'bottom' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 3,
      title: 'விரைவு சுகாதார கருவிகள்',
      description: 'விரைவான சுகாதார மதிப்பீடுகள், அறிகுறி சோதனைகள் மற்றும் சுகாதார கண்காணிப்பு கருவிகளை அணுகவும். இவை காத்திருக்காமல் உடனடி சுகாதார நுண்ணறிவுகளை வழங்குகின்றன.',
      action: 'சுகாதார கருவிகளை ஆராயுங்கள்',
      targetSelector: '.quick-actions-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 4,
      title: 'சுகாதார தொகுதிகள்',
      description: 'மனநல ஆதரவு, உணவு ஆலோசனை, ஆய்வக பகுப்பாய்வு மற்றும் சிறப்பு சுகாதார கண்காணிப்பு கருவிகள் உள்ளிட்ட விரிவான சுகாதார அம்சங்கள்.',
      action: 'சுகாதார தொகுதிகளை உலாவுங்கள்',
      targetSelector: '.health-metrics-section',
      position: 'top' as const,
      highlightType: 'outline' as const
    },
    {
      id: 5,
      title: 'AI அரட்டை உதவியாளர்',
      description: 'உங்கள் மிதக்கும் AI உதவியாளர் எப்போதும் கிடைக்கிறது. உடனடி மருத்துவ கேள்விகள், சுகாதார ஆலோசனை மற்றும் அவசர வழிகாட்டுதலுக்கு இங்கே கிளிக் செய்யுங்கள்.',
      action: 'AI உதவியாளருடன் அரட்டையடியுங்கள்',
      targetSelector: '.fixed.bottom-20.right-4',
      position: 'left' as const,
      highlightType: 'pulse' as const
    },
    {
      id: 6,
      title: 'வழிசெலுத்தல் மெனு',
      description: 'கீழ் வழிசெலுத்தலைப் பயன்படுத்தி அணுகவும்: முகப்பு, சுகாதார கருவிகள், அருகிலுள்ள கிளினிக்குகளைக் கண்டறியவும், மருத்துவ கருவிகள் மற்றும் அவசர SOS.',
      action: 'பிரிவுகள் வழியாக செல்லவும்',
      targetSelector: '.bottom-nav',
      position: 'top' as const,
      highlightType: 'outline' as const
    }
  ]
};

export function InteractiveGuide() {
  const { currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const steps = guideSteps[currentLanguage] || guideSteps.en;

  useEffect(() => {
    const seen = localStorage.getItem('vaidyana-interactive-guide-seen');
    setHasSeenGuide(!!seen);
    if (!seen) {
      timeoutRef.current = setTimeout(() => setIsOpen(true), 3000);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const updateHighlightedElement = useCallback(() => {
    if (isOpen && steps[currentStep]) {
      const element = document.querySelector(steps[currentStep].targetSelector);
      if (element) {
        setHighlightedElement(element);
        const rect = element.getBoundingClientRect();
        setElementRect(rect);
        
        // Smooth scroll with better positioning
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
  }, [updateHighlightedElement]);

  // Update element position on scroll and resize
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

  const closeGuide = () => {
    setIsOpen(false);
    setHighlightedElement(null);
    setElementRect(null);
    localStorage.setItem('vaidyana-interactive-guide-seen', 'true');
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
    // Don't reset hasSeenGuide here so button stays visible
  };

  const getTooltipPosition = () => {
    if (!elementRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = Math.min(384, viewportWidth - 40); // w-96 but max viewport - padding
    const tooltipHeight = 350; // approximate height
    const padding = 20;

    // Calculate available space in each direction
    const spaceTop = elementRect.top;
    const spaceBottom = viewportHeight - elementRect.bottom;
    const spaceLeft = elementRect.left;
    const spaceRight = viewportWidth - elementRect.right;

    let top, left, transform;

    // Smart positioning: choose the side with most space
    if (spaceBottom >= tooltipHeight + padding) {
      // Bottom has enough space
      top = elementRect.bottom + padding;
      left = Math.max(padding, Math.min(elementRect.left + elementRect.width / 2, viewportWidth - tooltipWidth - padding));
      transform = 'translate(-50%, 0%)';
    } else if (spaceTop >= tooltipHeight + padding) {
      // Top has enough space
      top = elementRect.top - tooltipHeight - padding;
      left = Math.max(padding, Math.min(elementRect.left + elementRect.width / 2, viewportWidth - tooltipWidth - padding));
      transform = 'translate(-50%, 0%)';
    } else if (spaceRight >= tooltipWidth + padding) {
      // Right has enough space
      top = Math.max(padding, Math.min(elementRect.top + elementRect.height / 2, viewportHeight - tooltipHeight - padding));
      left = elementRect.right + padding;
      transform = 'translate(0%, -50%)';
    } else if (spaceLeft >= tooltipWidth + padding) {
      // Left has enough space
      top = Math.max(padding, Math.min(elementRect.top + elementRect.height / 2, viewportHeight - tooltipHeight - padding));
      left = elementRect.left - tooltipWidth - padding;
      transform = 'translate(0%, -50%)';
    } else {
      // No space anywhere, center it
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
    <>
      {/* Guide Button - Always show after initial load */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={startGuide}
            className="fixed bottom-32 left-4 z-40 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white p-3 rounded-full shadow-lg border-2 border-white/20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <HelpCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Interactive Guide Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              ref={overlayRef}
              className="fixed inset-0 z-[1000] pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Dark overlay with cutout */}
              <div className="absolute inset-0 bg-black/60" />
              
              {/* Highlight element */}
              {elementRect && (
                <motion.div
                  style={getHighlightStyle()}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.div>

            {/* Tooltip */}
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
                  {/* Header */}
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

                  {/* Content */}
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

                  {/* Navigation */}
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className="flex items-center gap-2 border-[#4A9B8E]/30 text-[#4A9B8E] hover:bg-[#4A9B8E]/5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      {currentLanguage === 'hi' ? 'पिछला' : 
                       currentLanguage === 'ta' ? 'முந்தைய' : 'Previous'}
                    </Button>

                    <Button
                      onClick={nextStep}
                      className="flex items-center gap-2 bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white"
                    >
                      {currentStep === steps.length - 1 ? (
                        currentLanguage === 'hi' ? 'समाप्त' :
                        currentLanguage === 'ta' ? 'முடிவு' : 'Finish'
                      ) : (
                        <>
                          {currentLanguage === 'hi' ? 'अगला' :
                           currentLanguage === 'ta' ? 'அடுத்து' : 'Next'}
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
    </>
  );
}