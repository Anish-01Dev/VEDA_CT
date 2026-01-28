import React, { useState } from "react";
import { Activity, Globe, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिंदी" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
];

function getSubtitle(lang: string) {
  if (lang === "hi") return "आपका स्वास्थ्य साथी";
  if (lang === "ta") return "உங்கள் சுகாதார துணை";
  if (lang === "te") return "మీ ఆరోగ్య సహాయకుడు";
  return "Your Health Companion";
}

export function DashboardHeader() {
  const { currentLanguage, setLanguage } = useLanguage();
  const [dropdown, setDropdown] = useState(false);

  const handleLangChange = (code: string) => {
    setLanguage(code as any);
    setDropdown(false);
  };

  const currentLangName = languages.find(l => l.code === currentLanguage)?.name || "English";

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
            {currentLangName}
          </span>
        </button>
        {dropdown && (
          <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
            {languages.map((l) => (
              <button
                key={l.code}
                className="flex items-center justify-between w-full px-4 py-2 hover:bg-gray-100 text-left"
                onClick={() => handleLangChange(l.code)}
              >
                <span>
                  {l.name} <span className="text-xs text-gray-400 ml-1">{l.native}</span>
                </span>
                {currentLanguage === l.code && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>
      {/* Logo & Subtitle */}
      <div className="flex flex-col gap-1 pt-2">
        <img
          src="/logo.png"
          alt="Pixal Health"
          className="h-20 w-auto object-contain self-start mb-1"
        />
      </div>
      {/* Health Status Card */}

    </div>
  );
}