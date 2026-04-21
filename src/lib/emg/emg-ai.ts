import type { FatigueLevel } from './emg-processing';

export interface EMGAnalysisInput {
  fatigueLevel: FatigueLevel;
  strainDetected: boolean;
  peakSignals: number[];
  sessionDurationSeconds: number;
  averageFatigueIndex: number;
}

export interface EMGHealthInsight {
  muscleHealthStatus: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendations: string[];
  recoveryTime?: string;
  source: 'ai' | 'rule-based';
}

const GEMINI_KEY = import.meta.env.VITE_GEMINI_TEXT_KEY ?? '';
const GEMINI_MODELS = [
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

async function callGemini(prompt: string): Promise<any> {
  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
        }),
      });
      if (!res.ok) { console.warn(`EMG AI: ${model} returned ${res.status}, trying next...`); continue; }
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) { console.warn(`EMG AI: no JSON from ${model}, trying next...`); continue; }
      console.log(`EMG AI: used ${model}`);
      return JSON.parse(match[0]);
    } catch (e) {
      console.warn(`EMG AI: ${model} failed:`, e);
    }
  }
  throw new Error('All Gemini models failed');
}

export async function analyzeEMGHealth(data: EMGAnalysisInput): Promise<EMGHealthInsight> {
  const prompt = `You are a sports medicine and physiotherapy AI.
Analyze this EMG (electromyography) muscle activity session data and return a JSON health report.

Session Data:
- Fatigue Level: ${data.fatigueLevel}
- Strain Detected: ${data.strainDetected}
- Peak Signals (normalized 0-1): ${data.peakSignals.slice(-5).map(v => (v * 100).toFixed(1) + '%').join(', ') || 'none'}
- Session Duration: ${Math.round(data.sessionDurationSeconds / 60)} minutes ${data.sessionDurationSeconds % 60} seconds
- Average Fatigue Index: ${(data.averageFatigueIndex * 100).toFixed(1)}%

Return ONLY this JSON (no markdown, no extra text):
{
  "muscleHealthStatus": "one clear sentence describing muscle health status",
  "riskLevel": "low" | "moderate" | "high",
  "recommendations": ["rec1", "rec2", "rec3"],
  "recoveryTime": "e.g. 30 minutes or 24 hours"
}`;

  // 1. Try Gemini directly
  try {
    const parsed = await callGemini(prompt);
    return {
      muscleHealthStatus: parsed.muscleHealthStatus,
      riskLevel: parsed.riskLevel,
      recommendations: parsed.recommendations,
      recoveryTime: parsed.recoveryTime,
      source: 'ai',
    };
  } catch (e) {
    console.warn('Gemini EMG analysis failed, using rule-based fallback:', e);
  }

  // 2. Rule-based fallback
  return getRuleBasedInsight(data);
}

function getRuleBasedInsight(data: EMGAnalysisInput): EMGHealthInsight {
  const { fatigueLevel, strainDetected, sessionDurationSeconds } = data;

  if (strainDetected || fatigueLevel === 'high') {
    return {
      muscleHealthStatus: 'High muscle strain detected. Immediate rest recommended.',
      riskLevel: 'high',
      recommendations: [
        'Stop activity immediately and rest',
        'Apply cold compress to affected muscle',
        'Hydrate and replenish electrolytes',
        'Consult a physiotherapist if pain persists',
      ],
      recoveryTime: '24–48 hours',
      source: 'rule-based',
    };
  }

  if (fatigueLevel === 'moderate') {
    return {
      muscleHealthStatus: 'Moderate muscle fatigue. Consider reducing intensity.',
      riskLevel: 'moderate',
      recommendations: [
        'Reduce exercise intensity by 30%',
        'Take a 5–10 minute break',
        'Stretch the active muscle group',
        'Ensure adequate hydration',
      ],
      recoveryTime: '4–8 hours',
      source: 'rule-based',
    };
  }

  return {
    muscleHealthStatus: 'Muscle activity is within healthy range.',
    riskLevel: 'low',
    recommendations: [
      'Continue current activity level',
      'Maintain proper form and posture',
      'Stay hydrated throughout the session',
    ],
    recoveryTime: '1–2 hours',
    source: 'rule-based',
  };
}
