import React, { useState, useEffect } from "react";
import { navItems } from "@/lib/navigation-config";
import { BottomNav } from "@/components/navigation/bottom-nav";

const SUGGESTIONS = [
  ["No caffeine after 6 PM", "Try gratitude journaling", "10-minute evening walk"],
  ["Drink 8 glasses of water", "Do 5 minutes of deep breathing", "Eat a fruit with breakfast"],
  ["Go to bed by 10 PM", "Take a 15-minute walk", "Write down 3 things you're grateful for"],
  ["Limit screen time after 9 PM", "Stretch for 5 minutes", "Call a friend or family member"],
];

const getRandomChallenges = () => {
  return SUGGESTIONS[Math.floor(Math.random() * SUGGESTIONS.length)];
};

// LocalStorage helpers
const getChallenges = () => {
  const stored = localStorage.getItem('health-habit-challenges');
  return stored ? JSON.parse(stored) : [];
};

const addChallenge = (date: string, mood: string, symptoms: string, challenges: string[]) => {
  const challengeList = getChallenges();
  const newChallenge = {
    id: Date.now(),
    date,
    mood,
    symptoms,
    challenges,
    progress: 0
  };
  challengeList.unshift(newChallenge);
  localStorage.setItem('health-habit-challenges', JSON.stringify(challengeList));
};

const updateChallengeProgress = (id: number, progress: number) => {
  const challengeList = getChallenges();
  const updated = challengeList.map((challenge: any) => 
    challenge.id === id ? { ...challenge, progress } : challenge
  );
  localStorage.setItem('health-habit-challenges', JSON.stringify(updated));
};

const HealthHabitCoachPage = () => {
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [currentChallenge, setCurrentChallenge] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const challenges = getChallenges();
    setHistory(challenges);
    setCurrentChallenge(challenges[0] || null);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood && !symptoms) return;
    const challenges = getRandomChallenges();
    const date = new Date().toISOString().slice(0, 10);
    addChallenge(date, mood, symptoms, challenges);
    const updated = getChallenges();
    setHistory(updated);
    setCurrentChallenge(updated[0]);
    setMood("");
    setSymptoms("");
  };

  const handleProgress = (id: number, progress: number) => {
    updateChallengeProgress(id, progress);
    const updated = getChallenges();
    setHistory(updated);
    if (currentChallenge && currentChallenge.id === id) {
      setCurrentChallenge({ ...currentChallenge, progress });
    }
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] flex flex-col items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 space-y-6">
        <h1 className="text-2xl font-bold text-[#2D3748] font-nunito mb-2 text-center">Health Habit Coach</h1>
        <p className="text-center text-[#4A5568] mb-4">Get 3-day personalized health challenges based on your mood and symptoms.</p>
        {/* Mood/Symptom Input Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold mb-1">How are you feeling today?</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Tired, Stressed, Energetic..." value={mood} onChange={e => setMood(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Any symptoms?</label>
            <input type="text" className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Headache, Cramps..." value={symptoms} onChange={e => setSymptoms(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-[#A3E635] text-white font-bold py-2 rounded-lg hover:bg-[#84cc16] transition">Get Challenges</button>
        </form>
        {/* Challenge Suggestions */}
        {currentChallenge && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Your 3-Day Challenge</h2>
            <ul className="list-disc pl-5 space-y-1 text-[#2D3748]">
              {currentChallenge.challenges.map((c: string, i: number) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
            <div className="mt-3 flex gap-2 items-center">
              <span className="text-sm">Progress:</span>
              {[0, 1, 2, 3].map(p => (
                <button
                  key={p}
                  className={`px-2 py-1 rounded ${currentChallenge.progress === p ? 'bg-[#A3E635] text-white' : 'bg-gray-200'}`}
                  onClick={() => handleProgress(currentChallenge.id, p)}
                  disabled={currentChallenge.progress === p}
                >
                  {p}/3
                </button>
              ))}
            </div>
          </div>
        )}
        {/* Challenge History */}
        <div className="mt-8">
          <h3 className="font-semibold mb-2">Previous Challenges</h3>
          <ul className="space-y-2">
            {history.slice(1).map((c, idx) => (
              <li key={c.id} className="border rounded p-2 text-sm flex flex-col">
                <span className="font-bold">{c.date}</span>
                <span>Mood: {c.mood} | Symptoms: {c.symptoms}</span>
                <ul className="list-disc pl-5">
                  {c.challenges.map((ch: string, i: number) => <li key={i}>{ch}</li>)}
                </ul>
                <div className="flex gap-2 items-center mt-1">
                  <span>Progress:</span>
                  {[0, 1, 2, 3].map(p => (
                    <button
                      key={p}
                      className={`px-2 py-1 rounded ${c.progress === p ? 'bg-[#A3E635] text-white' : 'bg-gray-200'}`}
                      onClick={() => handleProgress(c.id, p)}
                      disabled={c.progress === p}
                    >
                      {p}/3
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <BottomNav items={navItems} />
    </div>
  );
};

export default HealthHabitCoachPage; 