export type FatigueLevel = 'low' | 'moderate' | 'high';

export interface ProcessedEMG {
  raw: number;
  normalized: number;
  fatigueIndex: number;
  fatigueLevel: FatigueLevel;
  strainDetected: boolean;
}

// ADC range: 0-1023 (Arduino Uno 10-bit ADC)
const ADC_MAX = 1023;
const SPIKE_THRESHOLD = 0.75;  // normalized value above which = spike
const STRAIN_CONSECUTIVE = 5;  // consecutive spikes = strain

export function normalizeSignal(raw: number, max: number = ADC_MAX): number {
  return Math.min(1, Math.max(0, raw / max));
}

export function computeFatigueIndex(history: number[]): number {
  if (history.length < 10) return 0;
  const overall = mean(history);
  const recent = mean(history.slice(-10));
  const ratio = overall > 0 ? recent / overall : 1;
  return Math.min(1, Math.max(0, ratio - 1));
}

export function detectMuscleStrain(history: number[]): boolean {
  if (history.length < STRAIN_CONSECUTIVE) return false;
  return history.slice(-STRAIN_CONSECUTIVE).every(v => v > SPIKE_THRESHOLD);
}

export function detectFatigueTrend(history: number[]): FatigueLevel {
  const fi = computeFatigueIndex(history);
  if (fi > 0.3) return 'high';
  if (fi > 0.1) return 'moderate';
  return 'low';
}

export function processEMGReading(raw: number, normalizedHistory: number[]): ProcessedEMG {
  const normalized = normalizeSignal(raw);
  const fatigueIndex = computeFatigueIndex(normalizedHistory);
  const fatigueLevel = detectFatigueTrend(normalizedHistory);
  const strainDetected = detectMuscleStrain(normalizedHistory);
  return { raw, normalized, fatigueIndex, fatigueLevel, strainDetected };
}

function mean(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
