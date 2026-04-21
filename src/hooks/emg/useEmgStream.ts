import { useState, useEffect, useRef, useCallback } from 'react';
import { emgSerialService } from '../../lib/emg/emg-serial';
import {
  processEMGReading,
  type ProcessedEMG,
  type FatigueLevel,
} from '../../lib/emg/emg-processing';
import {
  createEmgSession,
  insertEmgBatch,
  endEmgSession,
  type EMGReadingInsert,
} from '../../lib/emg/emg-supabase';

export type EMGMode = 'serial' | 'simulation';

export interface EMGSessionSnapshot {
  history: ProcessedEMG[];
  durationSeconds: number;
  activityType: string;
}

export interface EMGStreamState {
  mode: EMGMode;
  isConnected: boolean;
  isSessionActive: boolean;
  signal: number;
  normalized: number;
  fatigueLevel: FatigueLevel;
  fatigueIndex: number;
  strainDetected: boolean;
  history: ProcessedEMG[];
  sessionId: string | null;
  error: string | null;
  totalReadingsWritten: number;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  startSession: (patientId: string, activityType?: string) => Promise<void>;
  stopSession: () => Promise<EMGSessionSnapshot>;
  setMode: (mode: EMGMode) => void;
}

const HISTORY_MAX = 300;
const BATCH_INTERVAL_MS = 500;  // flush every 500ms for real-time feel
const SIM_INTERVAL_MS = 50;
const MAX_BATCH_SIZE = 50;      // max readings per insert

export function useEmgStream(): EMGStreamState {
  const [mode, setMode] = useState<EMGMode>('simulation');
  const [isConnected, setIsConnected] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [signal, setSignal] = useState(0);
  const [normalized, setNormalized] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState<FatigueLevel>('low');
  const [fatigueIndex, setFatigueIndex] = useState(0);
  const [strainDetected, setStrainDetected] = useState(false);
  const [history, setHistory] = useState<ProcessedEMG[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalReadingsWritten, setTotalReadingsWritten] = useState(0);

  // Refs — never stale inside intervals/callbacks
  const normalizedHistoryRef = useRef<number[]>([]);
  const historyRef = useRef<ProcessedEMG[]>([]);
  const batchBufferRef = useRef<EMGReadingInsert[]>([]);
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const activityTypeRef = useRef('general');
  const sessionStartRef = useRef<number | null>(null);
  const simPhaseRef = useRef(0);
  const writtenCountRef = useRef(0);

  // ── Process one reading ──────────────────────────────────
  const handleReading = useCallback((raw: number) => {
    const normHist = normalizedHistoryRef.current;
    const processed = processEMGReading(raw, normHist);

    normalizedHistoryRef.current = [...normHist, processed.normalized].slice(-HISTORY_MAX);

    setSignal(processed.raw);
    setNormalized(processed.normalized);
    setFatigueLevel(processed.fatigueLevel);
    setFatigueIndex(processed.fatigueIndex);
    setStrainDetected(processed.strainDetected);
    setHistory(prev => {
      const next = [...prev, processed].slice(-HISTORY_MAX);
      historyRef.current = next;
      return next;
    });

    // Buffer for DB write only when session is active
    if (sessionIdRef.current) {
      batchBufferRef.current.push({
        signal_value: processed.raw,
        normalized_value: Math.round(processed.normalized * 10000) / 10000,
        fatigue_index: Math.round(processed.fatigueIndex * 10000) / 10000,
      });
    }
  }, []);

  // ── Simulation ───────────────────────────────────────────
  const startSimulation = useCallback(() => {
    if (simIntervalRef.current) return;
    setIsConnected(true);
    simIntervalRef.current = setInterval(() => {
      simPhaseRef.current += 0.15;
      const base = 400 + Math.sin(simPhaseRef.current * 0.3) * 80;
      const noise = (Math.random() - 0.5) * 120;
      const spike = Math.random() > 0.92 ? Math.random() * 300 : 0;
      const raw = Math.round(Math.max(0, Math.min(1023, base + noise + spike)));
      handleReading(raw);
    }, SIM_INTERVAL_MS);
  }, [handleReading]);

  const stopSimulation = useCallback(() => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // ── Real-time batch flush to Supabase ────────────────────
  const startBatchFlush = useCallback(() => {
    if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);

    batchIntervalRef.current = setInterval(async () => {
      const sid = sessionIdRef.current;
      if (!sid || !batchBufferRef.current.length) return;

      // Take up to MAX_BATCH_SIZE readings
      const batch = batchBufferRef.current.splice(0, MAX_BATCH_SIZE);

      try {
        await insertEmgBatch(sid, batch);
        writtenCountRef.current += batch.length;
        setTotalReadingsWritten(writtenCountRef.current);
        console.log(`[EMG] ✅ Wrote ${batch.length} readings to DB (total: ${writtenCountRef.current})`);
      } catch (err: any) {
        console.error('[EMG] ❌ Batch write failed:', err.message);
        // Re-queue failed batch at front
        batchBufferRef.current.unshift(...batch);
      }
    }, BATCH_INTERVAL_MS);
  }, []);

  const stopBatchFlush = useCallback(() => {
    if (batchIntervalRef.current) {
      clearInterval(batchIntervalRef.current);
      batchIntervalRef.current = null;
    }
  }, []);

  // ── Connect ──────────────────────────────────────────────
  const connect = useCallback(async () => {
    setError(null);
    if (mode === 'simulation') {
      startSimulation();
      return;
    }
    if (!emgSerialService.isSupported()) {
      setError('Web Serial not supported. Switched to simulation.');
      setMode('simulation');
      startSimulation();
      return;
    }
    try {
      await emgSerialService.connect();
      await emgSerialService.startReading(
        r => handleReading(r.signal),
        e => { setError(e.message); console.error('[EMG Serial]', e.message); }
      );
      setIsConnected(true);
      console.log('[EMG] ✅ Serial connected');
    } catch (err: any) {
      setError(err.message);
      setMode('simulation');
      startSimulation();
    }
  }, [mode, startSimulation, handleReading]);

  const disconnect = useCallback(async () => {
    if (mode === 'simulation') {
      stopSimulation();
    } else {
      await emgSerialService.disconnect();
      setIsConnected(false);
    }
  }, [mode, stopSimulation]);

  // ── Start Session ────────────────────────────────────────
  const startSession = useCallback(async (patientId: string, activityType = 'general') => {
    try {
      console.log('[EMG] Starting session for patient:', patientId || 'local');
      const sid = await createEmgSession(patientId, activityType);
      console.log('[EMG] ✅ Session created:', sid);

      sessionIdRef.current = sid;
      activityTypeRef.current = activityType;
      sessionStartRef.current = Date.now();
      writtenCountRef.current = 0;

      // Reset buffers
      historyRef.current = [];
      normalizedHistoryRef.current = [];
      batchBufferRef.current = [];

      setHistory([]);
      setTotalReadingsWritten(0);
      setSessionId(sid);
      setIsSessionActive(true);

      startBatchFlush();
      console.log('[EMG] ✅ Batch flush started (every 500ms)');
    } catch (err: any) {
      console.error('[EMG] ❌ Session start failed:', err.message);
      setError(`Session error: ${err.message}`);
    }
  }, [startBatchFlush]);

  // ── Stop Session — returns snapshot BEFORE clearing state ─
  const stopSession = useCallback(async (): Promise<EMGSessionSnapshot> => {
    console.log('[EMG] Stopping session...');

    // 1. Capture snapshot first
    const snapshot: EMGSessionSnapshot = {
      history: [...historyRef.current],
      durationSeconds: sessionStartRef.current
        ? Math.round((Date.now() - sessionStartRef.current) / 1000)
        : 0,
      activityType: activityTypeRef.current,
    };

    console.log(`[EMG] Snapshot: ${snapshot.history.length} readings, ${snapshot.durationSeconds}s`);

    // 2. Stop flush interval
    stopBatchFlush();

    // 3. Final flush — write ALL remaining buffered readings
    const sid = sessionIdRef.current;
    if (sid && batchBufferRef.current.length) {
      console.log(`[EMG] Final flush: ${batchBufferRef.current.length} remaining readings`);
      try {
        await insertEmgBatch(sid, [...batchBufferRef.current]);
        writtenCountRef.current += batchBufferRef.current.length;
        console.log(`[EMG] ✅ Final flush done. Total written: ${writtenCountRef.current}`);
      } catch (err: any) {
        console.error('[EMG] ❌ Final flush failed:', err.message);
      }
      batchBufferRef.current = [];
    }

    // 4. Mark session ended in DB
    if (sid) {
      await endEmgSession(sid);
      console.log('[EMG] ✅ Session ended in DB');
    }

    // 5. Clear state
    sessionIdRef.current = null;
    sessionStartRef.current = null;
    setSessionId(null);
    setIsSessionActive(false);

    return snapshot;
  }, [stopBatchFlush]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSimulation();
      stopBatchFlush();
      emgSerialService.disconnect().catch(() => {});
    };
  }, [stopSimulation, stopBatchFlush]);

  return {
    mode, isConnected, isSessionActive,
    signal, normalized, fatigueLevel, fatigueIndex, strainDetected,
    history, sessionId, error, totalReadingsWritten,
    connect, disconnect, startSession, stopSession, setMode,
  };
}
