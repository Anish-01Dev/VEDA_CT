import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Mic, MicOff, Volume2, VolumeX, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'doctor';
  timestamp: Date;
}

export default function VirtualDoctorAvatar() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Virtual Medical Assistant. I'm here to help with your health concerns today. I am not a doctor, but I can help provide general health information. This is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional. How are you feeling today? What brings you here?",
      sender: 'doctor',
      timestamp: new Date()
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [synthesis] = useState(window.speechSynthesis);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserInput(transcript);
      };
      
      recognitionInstance.onend = () => setIsListening(false);
      setRecognition(recognitionInstance);
    }
  }, []);

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
    const emergencyKeywords = ['chest pain', 'can\'t breathe', 'difficulty breathing', 'stroke', 'bleeding', 'unconscious', 'seizure', 'suicide'];
    if (emergencyKeywords.some(keyword => lowerInput.includes(keyword))) {
      return "These symptoms may be serious. Please seek emergency medical care or contact local emergency services immediately.";
    }

    // Basic symptom responses
    if (lowerInput.includes('headache')) {
      return "I understand you're experiencing a headache. Let me ask you a few questions. How long have you had this headache? Is it mild, moderate, or severe? Based on what you described, headaches can have various causes like stress, dehydration, or tension. I suggest drinking water, resting in a quiet room, and you might consider an over-the-counter pain reliever like acetaminophen if safe for you. However, if the headache is severe or persistent, please consult a healthcare professional.";
    }

    if (lowerInput.includes('fever')) {
      return "I understand you're feeling feverish. Can you tell me your temperature if you've measured it? How long have you had the fever? Fever is often your body's way of fighting infection. Rest, stay hydrated, and monitor your temperature. You may consider acetaminophen or ibuprofen if appropriate for you. Please see a doctor if fever exceeds 103°F or persists more than 3 days.";
    }

    // Default response
    return "I understand how you're feeling. Let me ask you a few questions to better help you. Can you describe your symptoms in more detail? How long have you been experiencing this? I am not a doctor, but I can help provide general health information. This is not a substitute for professional medical advice, diagnosis, or treatment. Please consult a qualified healthcare professional.";
  };

  const speakResponse = (text: string) => {
    if (synthesis) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      synthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
        setIsListening(true);
      }
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        {/* Doctor Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-[#4A9B8E] text-white">
              <Stethoscope className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">Virtual Medical Assistant</h3>
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", isSpeaking ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
              <span className="text-sm text-gray-600">
                {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] rounded-lg p-3 text-sm",
                message.sender === 'user' 
                  ? "bg-[#4A9B8E] text-white" 
                  : "bg-gray-100 text-gray-800"
              )}>
                {message.content}
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
              "flex items-center gap-2",
              isListening ? "bg-red-500 hover:bg-red-600" : "bg-[#4A9B8E] hover:bg-[#4A9B8E]/90"
            )}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? "Stop" : "Speak"}
          </Button>
          
          <Button
            onClick={toggleSpeaking}
            variant="outline"
            disabled={!isSpeaking}
            className="flex items-center gap-2"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isSpeaking ? "Mute" : "Audio"}
          </Button>
        </div>

        {/* Status */}
        <div className="mt-4 text-center">
          <Badge variant="secondary" className="text-xs">
            Voice-Enabled Medical Assistant
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}