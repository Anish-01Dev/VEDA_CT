import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Volume2, VolumeX, Stethoscope, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LanguageDetector, type SupportedLanguage } from '@/lib/language-detection';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
}

export default function VirtualDoctorAvatar() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis] = useState(window.speechSynthesis);
  const videoRef = useRef<HTMLVideoElement>(null);

  const getInitialMessage = (lang: SupportedLanguage): Message => ({
    id: '1',
    content: lang === 'hi' 
      ? "नमस्ते! मैं आपका वर्चुअल मेडिकल असिस्टेंट हूं। मैं आज आपकी स्वास्थ्य संबंधी चिंताओं में मदद करने के लिए यहां हूं। मैं डॉक्टर नहीं हूं, लेकिन सामान्य स्वास्थ्य जानकारी प्रदान कर सकता हूं। यह पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है। कृपया किसी योग्य डॉक्टर से सलाह लें। आज आप कैसा महसूस कर रहे हैं? आप यहां क्यों आए हैं?"
      : "Hello! I'm your Virtual Medical Assistant. I'm here to help with your health concerns today. I am not a doctor, but I can help provide general health information. This is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional. How are you feeling today? What brings you here?",
    sender: 'doctor',
    timestamp: new Date()
  });

  // Initialize messages when language changes
  useEffect(() => {
    setMessages([getInitialMessage(currentLanguage)]);
  }, [currentLanguage]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
      };
      
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
    
    // Load voices for speech synthesis
    const loadVoices = () => {
      if (synthesis.getVoices().length === 0) {
        synthesis.addEventListener('voiceschanged', loadVoices);
      }
    };
    loadVoices();
  }, [currentLanguage]);

  const handleUserInput = async (input: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    const response = await getVirtualDoctorResponse(input);
    const doctorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: response,
      sender: 'doctor',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, doctorMessage]);
    speakResponse(response);
  };

  const getVirtualDoctorResponse = async (input: string): Promise<string> => {
    const lowerInput = input.toLowerCase();
    
    // Emergency detection
    const emergencyKeywords = ['chest pain', 'can\'t breathe', 'difficulty breathing', 'stroke', 'bleeding', 'unconscious', 'seizure', 'suicide', 'सीने में दर्द', 'सांस नहीं आ रही', 'दम घुट रहा', 'बेहोश', 'खून बह रहा'];
    if (emergencyKeywords.some(keyword => lowerInput.includes(keyword))) {
      return currentLanguage === 'hi' 
        ? "ये लक्षण गंभीर हो सकते हैं। कृपया तुरंत आपातकालीन चिकित्सा सहायता लें।"
        : "These symptoms may be serious. Please seek emergency medical care immediately.";
    }

    // Basic symptom responses
    if (lowerInput.includes('headache') || lowerInput.includes('सिरदर्द')) {
      return currentLanguage === 'hi'
        ? "मैं समझ सकता हूं कि आपको सिरदर्द है। यह कितने समय से है? क्या यह हल्का या तेज़ है? पानी पिएं और आराम करें। यदि तेज़ है तो डॉक्टर से मिलें।"
        : "I understand you have a headache. How long have you had it? Is it mild or severe? Drink water and rest. If severe, see a doctor.";
    }

    if (lowerInput.includes('fever') || lowerInput.includes('बुखार')) {
      return currentLanguage === 'hi'
        ? "मैं समझ सकता हूं कि आपको बुखार है। क्या आपने तापमान नापा है? आराम करें और पानी पिएं। यदि 103°F से ज्यादा है तो डॉक्टर से मिलें।"
        : "I understand you have fever. Have you checked your temperature? Rest and drink water. If over 103°F, see a doctor.";
    }

    // Default response
    return currentLanguage === 'hi'
      ? "मैं आपकी मदद कर सकता हूं। क्या आप अपने लक्षणों के बारे में बता सकते हैं? मैं डॉक्टर नहीं हूं, लेकिन सामान्य जानकारी दे सकता हूं।"
      : "I can help you. Can you describe your symptoms? I'm not a doctor, but I can provide general health information.";
  };

  const speakResponse = (text: string) => {
    if (!synthesis) return;
    
    try {
      // Cancel any ongoing speech
      synthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set properties safely
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      // Set language
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : 'en-US';
      
      // Try to find appropriate voice
      const voices = synthesis.getVoices();
      if (voices.length > 0) {
        if (currentLanguage === 'hi') {
          const hindiVoice = voices.find(voice => 
            voice.lang === 'hi-IN' || 
            voice.lang === 'hi' || 
            voice.name.toLowerCase().includes('hindi')
          );
          if (hindiVoice) {
            utterance.voice = hindiVoice;
          }
        } else {
          const englishVoice = voices.find(voice => 
            voice.lang === 'en-US' || voice.lang.startsWith('en')
          );
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
        }
      }
      
      // Set event handlers
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      // Start speaking
      synthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    }
  };

  const toggleListening = () => {
    if (!recognition) return;
    
    try {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsListening(false);
    }
  };

  const toggleSpeaking = () => {
    try {
      if (isSpeaking && synthesis) {
        synthesis.cancel();
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error('Speech cancel error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardContent className="p-6">
        {/* Doctor Video - Only visible when speaking */}
        <div className="flex flex-col items-center mb-6">
          {isSpeaking && (
            <video
              ref={videoRef}
              src="/pixcal.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="h-64 sm:h-80 w-auto object-contain rounded-2xl shadow-2xl ring-4 ring-green-500 shadow-green-500/30 transition-opacity duration-200"
              style={{
                filter: 'blur(0.5px) brightness(1.1)',
                transform: 'scale(1.02)'
              }}
            />
          )}
          <div className={cn("text-center", isSpeaking ? "mt-4" : "")}>
            <h3 className="text-xl font-bold mb-2">
              {currentLanguage === 'hi' ? 'वर्चुअल मेडिकल असिस्टेंट' : 'Virtual Medical Assistant'}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
              <span className="text-base text-gray-600">
                {currentLanguage === 'hi' 
                  ? (isSpeaking ? "बोल रहा है..." : isListening ? "सुन रहा है..." : "मदद के लिए तैयार")
                  : (isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready to Help")
                }
              </span>
            </div>
          </div>
        </div>

        {/* Latest Message Display */}
        <div className="mb-6">
          {messages.slice(-1).map((message) => (
            <div key={message.id} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-base text-gray-800 leading-relaxed">{message.content}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={toggleListening}
            disabled={!recognition}
            className={cn(
              "flex items-center gap-2 px-6 py-3",
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
            )}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {currentLanguage === 'hi' 
              ? (isListening ? "सुनना बंद करें" : "बोलना शुरू करें")
              : (isListening ? "Stop Listening" : "Start Speaking")
            }
          </Button>
          
          <Button
            onClick={toggleSpeaking}
            variant="outline"
            disabled={!isSpeaking}
            className="flex items-center gap-2 px-6 py-3"
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {currentLanguage === 'hi'
              ? (isSpeaking ? "डॉक्टर को म्यूट करें" : "आवाज़ चालू")
              : (isSpeaking ? "Mute Doctor" : "Audio On")
            }
          </Button>

          <Button
            onClick={() => setCurrentLanguage(currentLanguage === 'hi' ? 'en' : 'hi')}
            variant="outline"
            className="flex items-center gap-2 px-4 py-3"
          >
            <Globe className="w-5 h-5" />
            {currentLanguage === 'hi' ? 'हिं' : 'EN'}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            🩺 {currentLanguage === 'hi' ? 'एआई डॉक्टर • आवाज़-सक्षम • रियल-टाइम परामर्श' : 'AI Doctor • Voice-Enabled • Real-time Consultation'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}