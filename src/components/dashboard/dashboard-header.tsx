import React, { useState, useEffect } from "react";
import { Activity, Globe, Check, Waves } from "lucide-react";
import { motion } from "framer-motion";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "bn", name: "Bengali", native: "বাংলা" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
];

function getGreeting(hour: number, lang: string) {
  if (lang === "Hindi") {
    if (hour < 12) return "सुप्रभात";
    if (hour < 17) return "नमस्कार";
    return "शुभ संध्या";
  }
  if (lang === "Bengali") {
    if (hour < 12) return "সুপ্রভাত";
    if (hour < 17) return "নমস্কার";
    return "শুভ সন্ধ্যা";
  }
  if (lang === "Tamil") {
    if (hour < 12) return "காலை வணக்கம்";
    if (hour < 17) return "மதியம் வணக்கம்";
    return "மாலை வணக்கம்";
  }
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function getSubtitle(lang: string) {
  if (lang === "Hindi") return "आपका स्वास्थ्य साथी";
  if (lang === "Bengali") return "আপনার স্বাস্থ্য সহায়ক";
  if (lang === "Tamil") return "உங்கள் சுகாதார துணை";
  return "Your Health Companion";
}

export function DashboardHeader({
  currentLanguage = "English",
  onLanguageChange,
}: {
  currentLanguage?: string;
  onLanguageChange?: (lang: string) => void;
}) {
  const [lang, setLang] = useState(currentLanguage);
  const [dropdown, setDropdown] = useState(false);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());

  // Update the hour every minute to ensure greetings change at the right time
  useEffect(() => {
    const updateTime = () => {
      setCurrentHour(new Date().getHours());
    };

    // Update immediately
    updateTime();

    // Set up interval to update every minute
    const interval = setInterval(updateTime, 60000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleLangChange = (name: string) => {
    setLang(name);
    setDropdown(false);
    if (onLanguageChange) onLanguageChange(name);
  };

  return (
    <div className="w-full flex flex-col gap-4 pt-8 pb-4 px-4 bg-white/80 rounded-b-3xl shadow-sm relative">
      {/* Language Selector */}
      <div className="absolute top-4 right-4 z-10">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white shadow hover:bg-gray-50 border border-gray-200"
          onClick={() => setDropdown((d) => !d)}
        >
          <Globe className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-700 text-sm">
            {lang}
          </span>
        </button>
        {dropdown && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
            {languages.map((l) => (
              <button
                key={l.code}
                className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 text-left"
                onClick={() => handleLangChange(l.name)}
              >
                <span>
                  {l.name} <span className="text-xs text-gray-400 ml-1">{l.native}</span>
                </span>
                {lang === l.name && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Greeting & Subtitle */}
      <div className="flex flex-col gap-1 pt-2">
        <span className="text-3xl font-bold text-primary mb-1">
          {getGreeting(currentHour, lang)}
        </span>
        <span className="text-lg text-gray-600">
          {getSubtitle(lang)}
        </span>
      </div>
      {/* Health Status Card */}
      <motion.div
        className="mt-4 flex items-center bg-white border border-[#E2E8F0] rounded-2xl px-6 py-4 w-full"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        role="status"
        aria-label="Health Status: All systems healthy"
        style={{ boxShadow: 'none', maxWidth: 'none' }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: '#E6F4F1' }}>
          <Waves className="w-7 h-7" style={{ color: '#4A9B8E' }} />
        </div>
        <div className="flex flex-col justify-center">
          <div className="font-bold text-base" style={{ color: '#2D3748', fontFamily: 'Nunito, Inter, sans-serif' }}>Health Status</div>
          <div className="text-sm" style={{ color: '#4A5568', fontFamily: 'Inter, Nunito, sans-serif' }}>All systems healthy</div>
        </div>
        <div className="flex-1" />
        <motion.span
          className="inline-block w-4 h-4 rounded-full bg-[#68D391] ml-4"
          aria-label="Status: Healthy"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.7, 1],
            boxShadow: [
              "0 0 0 0 #68D39155",
              "0 0 0 8px #68D39122",
              "0 0 0 0 #68D39100"
            ]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
}