import React, { useState } from "react";
import { Activity, Globe, Check, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "@/components/auth/UserMenu";
import { AuthModal } from "@/components/auth/AuthModal";

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
  const { user } = useAuth();
  const [dropdown, setDropdown] = useState(false);
  const [authModal, setAuthModal] = useState(false);

  const handleLangChange = (code: string) => {
    setLanguage(code as any);
    setDropdown(false);
  };

  const currentLangName = languages.find(l => l.code === currentLanguage)?.name || "English";

  return (
    <div className="w-full flex flex-col gap-4 pt-4 sm:pt-8 pb-4 px-4 bg-white/80 rounded-b-3xl shadow-sm relative">
      {/* Top Bar with Language and Auth */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10 flex items-center gap-2">
        {/* Auth Section */}
        {user ? (
          <UserMenu />
        ) : (
          <Button
            onClick={() => setAuthModal(true)}
            size="sm"
            className="bg-[#4A9B8E] hover:bg-[#4A9B8E]/90 text-white text-xs sm:text-sm px-2 sm:px-3"
          >
            <LogIn className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">{currentLanguage === 'hi' ? 'लॉग इन' : 'Sign In'}</span>
            <span className="sm:hidden">{currentLanguage === 'hi' ? 'लॉग इन' : 'Login'}</span>
          </Button>
        )}
        
        {/* Language Selector */}
        <button
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white shadow hover:bg-gray-50 border border-gray-200"
          onClick={() => setDropdown((d) => !d)}
        >
          <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <span className="font-medium text-gray-700 text-xs sm:text-sm">
            {currentLangName}
          </span>
        </button>
        {dropdown && (
          <div className="absolute right-0 top-full mt-2 w-40 sm:w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
            {languages.map((l) => (
              <button
                key={l.code}
                className="flex items-center justify-between w-full px-3 sm:px-4 py-2 hover:bg-gray-100 text-left text-sm"
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
      <div className="flex flex-col gap-1 pt-8 sm:pt-2">
        <img
          src="/logo.png"
          alt="Pixal Health"
          className="h-16 sm:h-20 w-auto object-contain self-start mb-1"
        />
      </div>
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
      />
    </div>
  );
}