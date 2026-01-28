import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { navItems } from "@/lib/navigation-config";
import { aiClient } from "@/lib/ai-client";
import LanguageDetector from "@/lib/language-detection";



interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
  type?: "text" | "voice";
}

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "नमस्ते! I'm your AI health assistant. How can I help you today? You can ask me about symptoms, health advice, or any health-related concerns.",
      sender: "ai",
      timestamp: new Date(),
      type: "text"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue("");
    setIsTyping(true);

    try {
      const language = LanguageDetector.detectLanguage(query).language;
      const response = await aiClient.getHealthAdvice(query, language);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.advice,
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "ai",
        timestamp: new Date(),
        type: "text"
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // TODO: Implement speech recognition
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#FEFCF3] pb-20 flex flex-col font-inter">
        {/* Header */}
        <motion.header 
          className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-3 sm:px-4 py-3 sm:py-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 max-w-4xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-[#4A9B8E10]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
              <AvatarFallback className="bg-[#4A9B8E] text-white">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-[#2D3748] font-nunito">AI Health Assistant</h1>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#38A169] rounded-full animate-pulse" />
                <p className="text-xs text-[#4A5568] font-inter">Online • Responds in Hindi & English</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs hidden sm:flex bg-[#F8F5F0] text-[#4A5568] border-[#E2E8F0]">
              Multilingual
            </Badge>
          </div>
        </motion.header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto px-3 sm:px-4 py-4 max-w-4xl mx-auto">
            <div className="space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={cn(
                      "flex gap-3",
                      message.sender === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender === "ai" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#4A9B8E] text-white">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={cn(
                      "max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3",
                      message.sender === "user" 
                        ? "bg-[#4A9B8E] text-white" 
                        : "bg-white border border-[#E2E8F0] text-[#2D3748]"
                    )}>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        message.sender === "user" ? "font-inter" : "font-inter"
                      )}>
                        {message.content}
                      </p>
                      <p className={cn(
                        "text-xs mt-2 opacity-70",
                        message.sender === "user" ? "text-white/70" : "text-[#4A5568]"
                      )}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>

                    {message.sender === "user" && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#F8F5F0] text-[#4A9B8E]">
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 justify-start"
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-[#4A9B8E] text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#4A9B8E] rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-[#4A9B8E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-[#4A9B8E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#E2E8F0] bg-white p-3 sm:p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your health question..."
                  className="border-[#E2E8F0] focus:border-[#4A9B8E] focus:ring-[#4A9B8E] pr-12"
                  disabled={isListening}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleListening}
                  className={cn(
                    "absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-8 w-8",
                    isListening && "text-[#F6E05E] bg-[#F6E05E20]"
                  )}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </Button>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isListening}
                className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white font-semibold"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <BottomNav items={navItems} />
      </div>
    </ErrorBoundary>
  );
};

export default ChatPage;