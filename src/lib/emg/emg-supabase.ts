import { supabase } from '../supabase';

export interface EMGReadingInsert {
  signal_value: number;
  normalized_value: number;
  fatigue_index: number;
}

// ── Session Management ──────────────────────────────────────

export async function createEmgSession(
  patientId: string,
  activityType = 'general',
  notes?: string
): Promise<string> {
  // No user logged in → local-only session (no DB)
  if (!patientId) return `local-${Date.now()}`;

  const { data, error } = await supabase
    .from('emg_sessions')
    .insert({ patient_id: patientId, activity_type: activityType, notes })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create EMG session: ${error.message}`);
  return data.id;
}

export async function endEmgSession(sessionId: string): Promise<void> {
  if (sessionId.startsWith('local-')) return;
  const { error } = await supabase
    .from('emg_sessions')
    .update({ ended_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) console.error('Failed to end EMG session:', error.message);
}

// ── Real-time Batch Insert ──────────────────────────────────

export async function insertEmgBatch(
  sessionId: string,
  readings: EMGReadingInsert[]
): Promise<void> {
  if (!readings.length) return;
  if (sessionId.startsWith('local-')) return; // offline — skip DB

  const rows = readings.map(r => ({
    session_id: sessionId,
    signal_value: r.signal_value,
    normalized_value: r.normalized_value,
    fatigue_index: r.fatigue_index,
  }));

  const { error } = await supabase.from('emg_readings').insert(rows);
  if (error) throw new Error(`Batch insert failed: ${error.message}`);
}

// ── Queries ─────────────────────────────────────────────────

export async function getEmgSessions(patientId: string) {
  if (!patientId) return [];
  const { data, error } = await supabase
    .from('emg_sessions')
    .select('*')
    .eq('patient_id', patientId)
    .order('started_at', { ascending: false })
    .limit(20);
  if (error) return [];
  return data ?? [];
}

export async function getLatestEmgSummary(patientId: string) {
  if (!patientId) return null;
  const { data, error } = await supabase
    .from('emg_sessions')
    .select('id, activity_type, started_at, ended_at')
    .eq('patient_id', patientId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}
