-- EMG Sessions Table
CREATE TABLE IF NOT EXISTS emg_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL DEFAULT 'general',
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- EMG Readings Table (batched inserts only)
CREATE TABLE IF NOT EXISTS emg_readings (
  id BIGSERIAL PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES emg_sessions(id) ON DELETE CASCADE,
  signal_value FLOAT NOT NULL,
  normalized_value FLOAT NOT NULL,
  fatigue_index FLOAT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emg_readings_session_id ON emg_readings(session_id);
CREATE INDEX IF NOT EXISTS idx_emg_readings_created_at ON emg_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emg_sessions_patient_id ON emg_sessions(patient_id);

-- RLS Policies
ALTER TABLE emg_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE emg_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own emg_sessions"
  ON emg_sessions FOR ALL
  USING (patient_id = auth.uid());

CREATE POLICY "Users can manage own emg_readings"
  ON emg_readings FOR ALL
  USING (session_id IN (
    SELECT id FROM emg_sessions WHERE patient_id = auth.uid()
  ));
