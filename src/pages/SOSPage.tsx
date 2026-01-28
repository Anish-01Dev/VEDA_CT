import React, { useState } from "react";
import {
  Phone,
  MapPin,
  AlertTriangle,
  Heart,
  Thermometer,
  Zap,
  Clock,
  User,
  Shield,
} from "lucide-react";
import { BottomNav } from "@/components/navigation/bottom-nav";
import { navItems } from "@/lib/navigation-config";

const emergencyContacts = [
  {
    name: "Ambulance",
    number: "108",
    icon: Heart,
    color: "bg-red-500",
  },
  {
    name: "Police",
    number: "100",
    icon: Shield,
    color: "bg-blue-500",
  },
  {
    name: "Fire Department",
    number: "101",
    icon: Zap,
    color: "bg-orange-400",
  },
  {
    name: "Women Helpline",
    number: "1091",
    icon: User,
    color: "bg-pink-400",
  },
];

const emergencyScenarios = [
  {
    id: "heart-attack",
    title: "Heart Attack",
    description: "Chest pain, shortness of breath, sweating",
    steps: [
      "Call 108 immediately",
      "Help the person sit down and rest",
      "Give aspirin if available and not allergic",
      "Loosen tight clothing",
      "Monitor breathing and pulse",
      "Be prepared to perform CPR if needed",
    ],
    icon: Heart,
    color: "text-red-500 bg-red-100",
  },
  {
    id: "stroke",
    title: "Stroke",
    description: "Face drooping, arm weakness, speech difficulty",
    steps: [
      "Call 108 immediately",
      "Note the time symptoms started",
      "Help the person lie down",
      "Keep them calm and comfortable",
      "Do not give food or water",
      "Monitor vital signs",
    ],
    icon: Zap,
    color: "text-orange-400 bg-orange-100",
  },
  {
    id: "choking",
    title: "Choking",
    description: "Cannot speak, cough, or breathe",
    steps: [
      'Ask "Are you choking?"',
      "If they can't speak, perform Heimlich maneuver",
      "Stand behind them, hands under ribcage",
      "Give 5 quick upward thrusts",
      "Continue until object is expelled",
      "Call 108 if unsuccessful",
    ],
    icon: AlertTriangle,
    color: "text-yellow-600 bg-yellow-100",
  },
  {
    id: "severe-bleeding",
    title: "Severe Bleeding",
    description: "Heavy bleeding from wound",
    steps: [
      "Call 108 if bleeding is severe",
      "Apply direct pressure with clean cloth",
      "Elevate the injured area above heart",
      "Do not remove embedded objects",
      "Keep applying pressure until help arrives",
      "Monitor for signs of shock",
    ],
    icon: Thermometer,
    color: "text-pink-600 bg-pink-100",
  },
];

export default function SOSPage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const scenario = emergencyScenarios.find((s) => s.id === selectedScenario);

  // Location sharing handler
  const handleLocationShare = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        navigator.clipboard.writeText(mapsUrl);
        alert(
          `Location copied to clipboard! You can share this link: ${mapsUrl}`
        );
      },
      () => {
        alert("Unable to retrieve your location.");
      }
    );
  };

  return (
    <div className="min-h-screen bg-red-50 pb-24">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-2">Emergency Help</h1>
          <p className="text-lg text-red-800">
            Quick access to emergency services and first aid
          </p>
        </div>

        {!selectedScenario ? (
          <>
            {/* Emergency Contacts */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Emergency Contacts</h2>
              <div className="grid grid-cols-2 gap-4">
                {emergencyContacts.map((contact) => {
                  const Icon = contact.icon;
                  return (
                    <a
                      key={contact.number}
                      href={`tel:${contact.number}`}
                      className="flex flex-col items-center p-4 rounded-xl shadow bg-white hover:bg-gray-50 transition group"
                      title={`Call ${contact.name}`}
                    >
                      <div className={`w-14 h-14 flex items-center justify-center rounded-full mb-2 ${contact.color} group-hover:scale-105 transition`}>
                        <Icon color="#fff" size={32} />
                      </div>
                      <span className="font-semibold text-gray-800">{contact.name}</span>
                      <span className="text-lg font-bold text-red-600">{contact.number}</span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Location Sharing */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-red-700">Location Services</h2>
              <button
                className="flex items-center gap-4 p-4 rounded-xl shadow bg-white hover:bg-gray-50 transition w-full"
                onClick={handleLocationShare}
              >
                <MapPin className="text-primary" size={28} />
                <div className="flex-1 text-left">
                  <div className="font-semibold text-gray-800">Share Current Location</div>
                  <div className="text-sm text-gray-500">
                    Copy your location link to share with emergency services
                  </div>
                </div>
              </button>
            </div>

            {/* First Aid Scenarios */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-red-700">First Aid Guide</h2>
              <div className="grid gap-4">
                {emergencyScenarios.map((scenario) => {
                  const Icon = scenario.icon;
                  return (
                    <button
                      key={scenario.id}
                      className="flex items-center gap-4 p-4 rounded-xl shadow bg-white hover:bg-gray-50 transition w-full text-left"
                      onClick={() => setSelectedScenario(scenario.id)}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full ${scenario.color} mr-2`}>
                        <Icon size={28} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{scenario.title}</div>
                        <div className="text-sm text-gray-500">{scenario.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Important Notice */}
            <div className="flex items-start gap-4 bg-yellow-100 rounded-xl p-4 border border-yellow-300">
              <AlertTriangle className="text-yellow-600 mt-1" size={28} />
              <div>
                <div className="font-semibold text-yellow-800 mb-1">Important Notice</div>
                <div className="text-sm text-yellow-700">
                  This app provides basic first aid information. In serious emergencies, always call professional emergency services immediately.
                </div>
              </div>
            </div>
          </>
        ) : (
          <div>
            <button
              className="mb-6 text-primary font-semibold hover:underline"
              onClick={() => setSelectedScenario(null)}
            >
              ← Back to Emergency
            </button>
            {scenario && (
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex flex-col items-center mb-6">
                  <div className={`w-20 h-20 flex items-center justify-center rounded-full mb-4 ${scenario.color}`}>
                    <scenario.icon size={40} />
                  </div>
                  <div className="text-2xl font-bold mb-2 text-gray-800">{scenario.title}</div>
                  <div className="text-lg text-gray-600 mb-2 text-center">{scenario.description}</div>
                </div>
                <div className="mb-6">
                  <div className="font-semibold text-gray-800 mb-2">Emergency Steps:</div>
                  <ol className="list-decimal list-inside space-y-2">
                    {scenario.steps.map((step, idx) => (
                      <li key={idx} className="text-gray-700 text-base">{step}</li>
                    ))}
                  </ol>
                </div>
                <a
                  href="tel:108"
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg transition"
                  title="Call 108 Now"
                >
                  <Phone size={22} /> Call 108 Now
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      
      <BottomNav items={navItems} />
    </div>
  );
} 