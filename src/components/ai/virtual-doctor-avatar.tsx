import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Globe, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiClient } from '@/lib/ai-client';
import { aiLogger } from '@/lib/ai-logger';
import { jsPDF } from 'jspdf';
import { useLanguage } from '@/contexts/language-context';

type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'pa';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
}

interface DiagnosisSession {
  step: number;
  answers: string[];
  isComplete: boolean;
  diagnosis?: string;
  medicines?: string[];
}

export default function VirtualDoctorAvatar() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis] = useState(window.speechSynthesis);
  const [diagnosisSession, setDiagnosisSession] = useState<DiagnosisSession>({
    step: 0,
    answers: [],
    isComplete: false
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  const getInitialMessage = (lang: string): Message => {
    const messages = {
      'en': "Hello! I'm Dr. Vaidyana. I'll ask you a few questions to better understand your condition. What seems to be the problem today?",
      'hi': "नमस्ते! मैं डॉ. वैद्यान हूं। मैं आपकी समस्या को समझने के लिए कुछ सवाल पूछूंगा। बताएं, आपको क्या तकलीफ है?",
      'ta': "வணக்கம்! நான் டாக்டர் வைத்யானா. உங்கள் நிலையை நன்கு புரிந்துகொள்ள சில கேள்விகள் கேட்கிறேன். இன்று என்ன பிரச்சனை?",
      'te': "నమస్కారం! నేను డాక్టర్ వైద్యానా. మీ పరిస్థితిని బాగా అర్థం చేసుకోవడానికి కొన్ని ప్రశ్నలు అడుగుతాను. ఈరోజు ఏమి సమస్య?",
      'pa': "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਡਾ. ਵੈਦਿਆਨਾ ਹਾਂ। ਤੁਹਾਡੀ ਸਥਿਤੀ ਨੂੰ ਬਿਹਤਰ ਸਮਝਣ ਲਈ ਮੈਂ ਕੁਝ ਸਵਾਲ ਪੁੱਛਾਂਗਾ। ਅੱਜ ਕੀ ਸਮੱਸਿਆ ਹੈ?"
    };
    
    return {
      id: '1',
      content: messages[lang] || messages['en'],
      sender: 'doctor',
      timestamp: new Date()
    };
  };

  // Initialize messages when language changes
  useEffect(() => {
    setMessages([getInitialMessage(currentLanguage)]);
    setDiagnosisSession({
      step: 0,
      answers: [],
      isComplete: false
    });
  }, [currentLanguage]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'te' ? 'te-IN' : currentLanguage === 'pa' ? 'pa-IN' : 'en-US';

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
    aiLogger.aiStart('Virtual Doctor', 'Conversation', input);

    try {
      // If diagnosis is complete, provide general advice
      if (diagnosisSession.isComplete) {
        const response = await aiClient.getHealthAdvice(
          `Patient follow-up: "${input}". Brief advice only.`,
          currentLanguage
        );
        return response.advice;
      }

      // If diagnosis is complete, provide general advice
      if (diagnosisSession.isComplete) {
        const response = await aiClient.getHealthAdvice(
          `Patient follow-up: "${input}". Brief advice only.`,
          currentLanguage
        );
        return response.advice;
      }

      // Start diagnosis session with first complaint
      if (diagnosisSession.step === 0) {
        const newSession = {
          step: 1,
          answers: [input],
          isComplete: false
        };

        setDiagnosisSession(newSession);

        // AI generates first follow-up question
        const response = await aiClient.getHealthAdvice(
          `Patient complaint: "${input}". Acknowledge briefly and ask the FIRST diagnostic question. Keep it under 10 words.`,
          currentLanguage
        );
        return response.advice;
      }

      // Continue with AI-generated follow-up questions (steps 1-4)
      if (diagnosisSession.step >= 1 && diagnosisSession.step <= 4) {
        const newAnswers = [...diagnosisSession.answers, input];
        const nextStep = diagnosisSession.step + 1;

        setDiagnosisSession({
          step: nextStep,
          answers: newAnswers,
          isComplete: false
        });

        if (nextStep <= 5) {
          // AI generates next follow-up question based on all previous answers
          const conversationHistory = newAnswers.join('. ');
          const response = await aiClient.getHealthAdvice(
            `Patient history: "${conversationHistory}". You are a smart doctor. Ask the NEXT most critical diagnostic question to rule out or confirm conditions. Be concise and professional. Do not repeat previous questions.`,
            currentLanguage
          );
          return response.advice;
        } else {
          // Generate final diagnosis after 5 questions
          return await generateFinalReport(newAnswers);
        }
      }

      return {
        'en': "Please tell me about your problem.",
        'hi': "कृपया अपनी समस्या बताएं।",
        'ta': "தயவுசெய்து உங்கள் பிரச்சனையைப் பற்றி சொல்லுங்கள்.",
        'te': "దయచేసి మీ సమస్య గురించి చెప్పండి.",
        'pa': "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੀ ਸਮੱਸਿਆ ਬਾਰੇ ਦੱਸੋ।"
      }[currentLanguage] || "Please tell me about your problem.";

    } catch (error) {
      aiLogger.aiError('Virtual Doctor', 'Conversation', error);
      return {
        'en': "I apologize, I'm having trouble processing that. Could you please repeat?",
        'hi': "मुझे खेद है, कुछ तकनीकी समस्या है। कृपया फिर से प्रयास करें।",
        'ta': "மன்னிக்கவும், அதை செயலாக்குவதில் சிக்கல் உள்ளது. தயவுசெய்து மீண்டும் சொல்லுங்கள்?",
        'te': "క్షమించండి, దాన్ని ప్రాసెస్ చేయడంలో ఇబ్బంది ఉంది. దయచేసి మళ్లీ చెప్పగలరా?",
        'pa': "ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਇਸ ਨੂੰ ਪ੍ਰੋਸੈਸ ਕਰਨ ਵਿੱਚ ਮੁਸ਼ਕਲ ਹੋ ਰਹੀ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਹਰਾ ਸਕਦੇ ਹੋ?"
      }[currentLanguage] || "I apologize, I'm having trouble processing that. Could you please repeat?";
    }
  };

  const generateFinalReport = async (answers: string[]): Promise<string> => {
    try {
      const prompt = `
        Create a detailed medical report based on this consultation history: ${answers.join('. ')}.
        
        Structure the response EXACTLY like this (using markdown for the chat bubble):
        
        DIAGNOSIS: [Probable condition or Differential Diagnosis]
        
        MEDICATION: [List 2-3 general OTC medications or lifestyle changes. STRICTLY ADD DISCLAIMER: "Consult a real doctor before taking prescription drugs."]
        
        ADVICE: [3-4 actionable steps for recovery]
        
        WARNING: [Specific red flags to watch for]
      `;

      const response = await aiClient.getHealthAdvice(prompt, currentLanguage);

      setDiagnosisSession({
        ...diagnosisSession,
        isComplete: true,
        diagnosis: response.advice
      });

      const finalReport = {
        'en': `✅ **Diagnosis Complete**\n\n${response.advice}\n\nPlease download your detailed medical report using the button below.`,
        'hi': `✅ **निदान पूरा हुआ**\n\n${response.advice}\n\nनीचे दिए गए बटन से अपनी विस्तृत मेडिकल रिपोर्ट अभी डाउनलोड करें।`,
        'ta': `✅ **நோயறிதல் முடிந்தது**\n\n${response.advice}\n\nகீழே உள்ள பொத்தானைப் பயன்படுத்தி உங்கள் விரிவான மருத்துவ அறிக்கையைப் பதிவிறக்கவும்.`,
        'te': `✅ **రోగ నిర్ధారణ పూర్తయింది**\n\n${response.advice}\n\nదిగువ బటన్‌ని ఉపయోగించి మీ వివరణాత్మక వైద్య నివేదికను డౌన్‌లోడ్ చేయండి.`,
        'pa': `✅ **ਨਿਦਾਨ ਪੂਰਾ ਹੋਇਆ**\n\n${response.advice}\n\nਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਦੀ ਵਰਤੋਂ ਕਰਕੇ ਆਪਣੀ ਵਿਸਤ੍ਰਿਤ ਮੈਡੀਕਲ ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ।`
      }[currentLanguage] || `✅ **Diagnosis Complete**\n\n${response.advice}\n\nPlease download your detailed medical report using the button below.`;

      aiLogger.aiSuccess('Virtual Doctor', 'Final Report', { diagnosis: response.advice.substring(0, 50) });
      return finalReport;

    } catch (error) {
      aiLogger.aiError('Virtual Doctor', 'Final Report', error);
      return {
        'en': "Error generating report. Please try again.",
        'hi': "रिपोर्ट तैयार करने में त्रुटि। कृपया पुनः प्रयास करें।",
        'ta': "அறிக்கையை உருவாக்குவதில் பிழை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.",
        'te': "రిపోర్ట్ రూపొందించడంలో లోపం. దయచేసి మళ్లీ ప్రయత్నించండి.",
        'pa': "ਰਿਪੋਰਟ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਗਲਤੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
      }[currentLanguage] || "Error generating report. Please try again.";
    }
  };

  const downloadReport = () => {
    if (!diagnosisSession.diagnosis) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // 1. Header Background
    doc.setFillColor(74, 155, 142); // Brand Teal
    doc.rect(0, 0, pageWidth, 50, 'F');

    // 2. Logo / Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Pixal Health", margin, 32);

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text("Virtual Medical Consultation Report", margin, 42);

    yPos = 70;

    // 3. Patient Details Card
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(margin, yPos, pageWidth - (margin * 2), 35, 3, 3, 'FD');

    doc.setTextColor(70, 70, 70);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("PATIENT DETAILS", margin + 5, yPos + 10);

    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin + 5, yPos + 20);
    doc.text("Consultation Status: Completed", margin + 5, yPos + 28);
    doc.text(`Reference ID: REF-${Math.floor(Math.random() * 100000)}`, pageWidth - margin - 50, yPos + 20);

    yPos += 50;

    // 4. Content Parsing (Robust Regex extraction)
    const content = diagnosisSession.diagnosis || "";

    // Extract sections using regex
    const diagnosisMatch = content.match(/DIAGNOSIS:\s*([\s\S]*?)(?=MEDICATION:|ADVICE:|WARNING:|$)/i);
    const medicationMatch = content.match(/MEDICATION:\s*([\s\S]*?)(?=ADVICE:|WARNING:|$)/i);
    const adviceMatch = content.match(/ADVICE:\s*([\s\S]*?)(?=WARNING:|$)/i);
    const warningMatch = content.match(/WARNING:\s*([\s\S]*?)(?=$)/i);

    const diagnosis = diagnosisMatch ? diagnosisMatch[1].trim() : "See details below";
    const medication = medicationMatch ? medicationMatch[1].trim() : "As recommended";
    const advice = adviceMatch ? adviceMatch[1].trim() : "Follow standard care";
    const warning = warningMatch ? warningMatch[1].trim() : "Monitor symptoms";

    // Helper to draw sections
    const drawSection = (title: string, body: string, color: [number, number, number]) => {
      // Section Title
      doc.setFontSize(12);
      doc.setTextColor(...color);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), margin, yPos);
      yPos += 8;

      // Section Line
      doc.setDrawColor(...color);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos - 5, margin + 50, yPos - 5);

      // Body Text
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.setFont("helvetica", "normal");

      const splitText = doc.splitTextToSize(body.replace(/\*\*/g, '').replace(/-/g, '•'), pageWidth - (margin * 2));
      doc.text(splitText, margin, yPos);

      yPos += (splitText.length * 6) + 15;
    };

    drawSection("Diagnosis", diagnosis, [74, 155, 142]); // Teal
    drawSection("Medication Plan", medication, [59, 130, 246]); // Blue
    drawSection("Doctor's Advice", advice, [74, 155, 142]); // Teal

    // Warning Section (Red Box)
    if (warning) {
      doc.setFillColor(254, 242, 242); // Light Red
      doc.setDrawColor(252, 165, 165); // Red Border
      const warningHeight = doc.splitTextToSize(warning, pageWidth - (margin * 2) - 10).length * 6 + 20;
      doc.roundedRect(margin, yPos, pageWidth - (margin * 2), warningHeight, 3, 3, 'FD');

      doc.setTextColor(220, 38, 38); // Red Text
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("⚠️ CLINICAL WARNING", margin + 5, yPos + 10);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(185, 28, 28);
      const splitWarning = doc.splitTextToSize(warning, pageWidth - (margin * 2) - 10);
      doc.text(splitWarning, margin + 5, yPos + 20);

      yPos += warningHeight + 10;
    }

    // Footer
    const footerY = 280;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY, pageWidth - margin, footerY);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Generated by Pixal Health AI System. Not a substitute for professional medical advice.", margin, footerY + 5);

    doc.save(`Pixal_Medical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
      utterance.lang = currentLanguage === 'hi' ? 'hi-IN' : currentLanguage === 'ta' ? 'ta-IN' : currentLanguage === 'te' ? 'te-IN' : currentLanguage === 'pa' ? 'pa-IN' : 'en-US';

      // Try to find appropriate voice
      const voices = synthesis.getVoices();
      if (voices.length > 0) {
        if (currentLanguage !== 'en') {
          const localVoice = voices.find(voice =>
            voice.lang.startsWith(currentLanguage) ||
            voice.name.toLowerCase().includes(currentLanguage)
          );
          if (localVoice) {
            utterance.voice = localVoice;
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
              {{
                'en': 'Virtual Medical Assistant',
                'hi': 'वर्चुअल मेडिकल असिस्टेंट',
                'ta': 'மெய்நிகர் மருத்துவ உதவியாளர்',
                'te': 'వర్చువల్ మెడికల్ అసిస్టెంట్',
                'pa': 'ਵਰਚੁਅਲ ਮੈਡੀਕਲ ਅਸਿਸਟੈਂਟ'
              }[currentLanguage] || 'Virtual Medical Assistant'}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
              <span className="text-base text-gray-600">
                {{
                  'en': (isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready to Help"),
                  'hi': (isSpeaking ? "बोल रहा है..." : isListening ? "सुन रहा है..." : "मदद के लिए तैयार"),
                  'ta': (isSpeaking ? "பேசுகிறது..." : isListening ? "கேட்கிறது..." : "உதவ தயார்"),
                  'te': (isSpeaking ? "మాట్లాడుతోంది..." : isListening ? "వింటోంది..." : "సహాయానికి సిద్ధం"),
                  'pa': (isSpeaking ? "ਬੋਲ ਰਿਹਾ ਹੈ..." : isListening ? "ਸੁਣ ਰਿਹਾ ਹੈ..." : "ਮਦਦ ਲਈ ਤਿਆਰ")
                }[currentLanguage] || (isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready to Help")}
              </span>
            </div>
          </div>
        </div>

        {/* Latest Message Display */}
        <div className="mb-6">
          {messages.slice(-1).map((message) => (
            <div key={message.id} className={cn(
              "rounded-xl p-4 max-w-4xl",
              message.sender === 'doctor'
                ? "bg-blue-50 border border-blue-200"
                : "bg-gray-50 border border-gray-200 ml-auto"
            )}>
              <div className="flex items-start gap-3">
                {message.sender === 'doctor' && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    Dr
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">{message.content}</p>
                  {diagnosisSession.step > 0 && !diagnosisSession.isComplete && (
                    <div className="mt-2 text-sm text-blue-600">
                      {{
                        'en': `Question ${diagnosisSession.step}/4`,
                        'hi': `प्रश्न ${diagnosisSession.step}/4`,
                        'ta': `கேள்வி ${diagnosisSession.step}/4`,
                        'te': `ప్రశ్న ${diagnosisSession.step}/4`,
                        'pa': `ਸਵਾਲ ${diagnosisSession.step}/4`
                      }[currentLanguage] || `Question ${diagnosisSession.step}/4`}
                    </div>
                  )}
                  {diagnosisSession.isComplete && diagnosisSession.diagnosis && (
                    <div className="mt-3">
                      <Button
                        onClick={downloadReport}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white transition-all transform hover:scale-105"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {{
                          'en': 'Download PDF Report',
                          'hi': 'PDF रिपोर्ट डाउनलोड करें',
                          'ta': 'PDF அறிக்கையைப் பதிவிறக்கவும்',
                          'te': 'PDF రిపోర్ట్ డౌన్‌లోడ్ చేయండి',
                          'pa': 'PDF ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ'
                        }[currentLanguage] || 'Download PDF Report'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
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
            {{
              'en': (isListening ? "Stop Listening" : "Start Speaking"),
              'hi': (isListening ? "सुनना बंद करें" : "बोलना शुरू करें"),
              'ta': (isListening ? "கேட்பதை நிறுத்து" : "பேசத் தொடங்கு"),
              'te': (isListening ? "వినడం ఆపండి" : "మాట్లాడటం ప్రారంభించండి"),
              'pa': (isListening ? "ਸੁਣਨਾ ਬੰਦ ਕਰੋ" : "ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ")
            }[currentLanguage] || (isListening ? "Stop Listening" : "Start Speaking")}
          </Button>

          <Button
            onClick={toggleSpeaking}
            variant="outline"
            disabled={!isSpeaking}
            className="flex items-center gap-2 px-6 py-3"
          >
            {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {{
              'en': (isSpeaking ? "Mute Doctor" : "Audio On"),
              'hi': (isSpeaking ? "डॉक्टर को म्यूट करें" : "आवाज़ चालू"),
              'ta': (isSpeaking ? "மருத்துவரை மௌனமாக்கு" : "ஆடியோ ஆன்"),
              'te': (isSpeaking ? "డాక్టర్‌ను మ్యూట్ చేయండి" : "ఆడియో ఆన్"),
              'pa': (isSpeaking ? "ਡਾਕਟਰ ਨੂੰ ਮਿਊਟ ਕਰੋ" : "ਆਡੀਓ ਚਾਲੂ")
            }[currentLanguage] || (isSpeaking ? "Mute Doctor" : "Audio On")}
          </Button>

          <Button
            onClick={() => {
              const languages = ['en', 'hi', 'ta', 'te', 'pa'];
              const currentIndex = languages.indexOf(currentLanguage);
              const nextIndex = (currentIndex + 1) % languages.length;
              setLanguage(languages[nextIndex]);
            }}
            variant="outline"
            className="flex items-center gap-2 px-4 py-3"
          >
            <Globe className="w-5 h-5" />
            {{
              'en': 'EN',
              'hi': 'हिं',
              'ta': 'த',
              'te': 'తె',
              'pa': 'ਪੰ'
            }[currentLanguage] || 'EN'}
          </Button>
        </div>

        <div className="mt-4 text-center">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            🩺 {{
              'en': 'AI Doctor • Voice-Enabled • Real-time Consultation',
              'hi': 'एआई डॉक्टर • आवाज़-सक्षम • रियल-टाइम परामर्श',
              'ta': 'AI மருத்துவர் • குரல்-இயக்கப்பட்ட • நிகழ்நேர ஆலோசனை',
              'te': 'AI డాక్టర్ • వాయిస్-ఎనేబుల్డ్ • రియల్-టైమ్ కన్సల్టేషన్',
              'pa': 'AI ਡਾਕਟਰ • ਆਵਾਜ਼-ਸਮਰੱਥ • ਰੀਅਲ-ਟਾਈਮ ਸਲਾਹ'
            }[currentLanguage] || 'AI Doctor • Voice-Enabled • Real-time Consultation'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}