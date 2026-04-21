import { useState, useEffect, useRef, useCallback } from 'react';

export interface HeartbeatPoint {
  t: number;
  bpm: number;
  ecg: number; // ECG-like waveform value 0-100
}

export interface HeartbeatStats {
  avgBpm: number;
  minBpm: number;
  maxBpm: number;
  hrv: number; // heart rate variability
  zone: 'rest' | 'fat-burn' | 'cardio' | 'peak';
}

// Generate ECG-like PQRST waveform value at phase 0-1
function ecgWaveform(phase: number): number {
  // P wave
  if (phase < 0.1) return 10 + Math.sin(phase / 0.1 * Math.PI) * 15;
  // PR segment
  if (phase < 0.18) return 10;
  // Q dip
  if (phase < 0.22) return 10 - Math.sin((phase - 0.18) / 0.04 * Math.PI) * 8;
  // R spike (tallest)
  if (phase < 0.28) return 10 + Math.sin((phase - 0.22) / 0.06 * Math.PI) * 80;
  // S dip
  if (phase < 0.34) return 10 - Math.sin((phase - 0.28) / 0.06 * Math.PI) * 20;
  // ST segment
  if (phase < 0.42) return 10;
  // T wave
  if (phase < 0.6) return 10 + Math.sin((phase - 0.42) / 0.18 * Math.PI) * 25;
  // baseline
  return 10;
}

function getBpmZone(bpm: number): HeartbeatStats['zone'] {
  if (bpm < 90) return 'rest';
  if (bpm < 120) return 'fat-burn';
  if (bpm < 150) return 'cardio';
  return 'peak';
}

const ZONE_CONFIG = {
  rest:     { color: '#38A169', label: 'Rest',     bg: 'bg-green-50',  border: 'border-green-200'  },
  'fat-burn': { color: '#D69E2E', label: 'Fat Burn', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  cardio:   { color: '#E07B39', label: 'Cardio',   bg: 'bg-orange-50', border: 'border-orange-200' },
  peak:     { color: '#E53E3E', label: 'Peak',     bg: 'bg-red-50',    border: 'border-red-200'    },
};

export { ZONE_CONFIG, getBpmZone };

const HISTORY_MAX = 120;

export function useHeartbeat(emgNormalized: number, isActive: boolean) {
  const [history, setHistory] = useState<HeartbeatPoint[]>([]);
  const [currentBpm, setCurrentBpm] = useState(72);
  const [stats, setStats] = useState<HeartbeatStats>({
    avgBpm: 72, minBpm: 72, maxBpm: 72, hrv: 40, zone: 'rest',
  });

  const phaseRef = useRef(0);
  const bpmRef = useRef(72);
  const allBpmsRef = useRef<number[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tRef = useRef(0);

  const tick = useCallback(() => {
    // BPM varies with EMG signal — higher muscle activity = higher HR
    // Base: 65-75 at rest, up to 160-180 at peak EMG
    const targetBpm = Math.round(65 + emgNormalized * 110 + (Math.random() - 0.5) * 8);
    // Smooth transition
    bpmRef.current = Math.round(bpmRef.current * 0.92 + targetBpm * 0.08);
    const bpm = Math.max(55, Math.min(185, bpmRef.current));

    // Advance ECG phase based on BPM
    const beatDuration = 60 / bpm; // seconds per beat
    phaseRef.current = (phaseRef.current + (0.05 / beatDuration)) % 1;
    const ecg = Math.round(ecgWaveform(phaseRef.current) + (Math.random() - 0.5) * 3);

    tRef.current += 1;
    const point: HeartbeatPoint = { t: tRef.current, bpm, ecg: Math.max(0, Math.min(100, ecg)) };

    setCurrentBpm(bpm);
    setHistory(prev => {
      const next = [...prev, point].slice(-HISTORY_MAX);
      return next;
    });

    allBpmsRef.current.push(bpm);
  }, [emgNormalized]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }
    intervalRef.current = setInterval(tick, 50);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, tick]);

  // Compute stats every 2s
  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(() => {
      const bpms = allBpmsRef.current;
      if (!bpms.length) return;
      const avg = Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
      const min = Math.min(...bpms);
      const max = Math.max(...bpms);
      // HRV = std deviation of last 20 BPMs
      const recent = bpms.slice(-20);
      const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
      const hrv = Math.round(Math.sqrt(recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length));
      setStats({ avgBpm: avg, minBpm: min, maxBpm: max, hrv, zone: getBpmZone(avg) });
    }, 2000);
    return () => clearInterval(id);
  }, [isActive]);

  // Snapshot for report
  const getSnapshot = useCallback((): HeartbeatStats & { history: HeartbeatPoint[] } => {
    const bpms = allBpmsRef.current;
    const avg = bpms.length ? Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length) : 72;
    const min = bpms.length ? Math.min(...bpms) : 72;
    const max = bpms.length ? Math.max(...bpms) : 72;
    const recent = bpms.slice(-20);
    const mean = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 72;
    const hrv = recent.length ? Math.round(Math.sqrt(recent.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / recent.length)) : 30;
    return { avgBpm: avg, minBpm: min, maxBpm: max, hrv, zone: getBpmZone(avg), history: [...history] };
  }, [history]);

  const reset = useCallback(() => {
    allBpmsRef.current = [];
    tRef.current = 0;
    phaseRef.current = 0;
    bpmRef.current = 72;
    setHistory([]);
    setCurrentBpm(72);
  }, []);

  return { history, currentBpm, stats, getSnapshot, reset };
}
