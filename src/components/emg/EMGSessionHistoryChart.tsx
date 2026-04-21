import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import { Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProcessedEMG } from '../../lib/emg/emg-processing';

interface SessionChartPoint {
  label: string;
  avgSignal: number;
  avgFatigue: number;
  strainEvents: number;
}

interface Props {
  patientId: string;
  refreshTrigger?: number;
  // local sessions passed from page when not logged in
  localSessions?: { history: ProcessedEMG[]; activityType: string; durationSeconds: number }[];
}

async function fetchFromSupabase(patientId: string): Promise<SessionChartPoint[]> {
  const { data: sessions, error } = await supabase
    .from('emg_sessions')
    .select('id, activity_type, started_at, ended_at')
    .eq('patient_id', patientId)
    .not('ended_at', 'is', null)
    .order('started_at', { ascending: true })
    .limit(10);

  if (error || !sessions?.length) return [];

  const points: SessionChartPoint[] = [];

  for (const session of sessions) {
    const { data: readings } = await supabase
      .from('emg_readings')
      .select('normalized_value, fatigue_index')
      .eq('session_id', session.id);

    if (!readings?.length) continue;

    points.push({
      label: new Date(session.started_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      avgSignal: Math.round((readings.reduce((a, r) => a + r.normalized_value, 0) / readings.length) * 100),
      avgFatigue: Math.round((readings.reduce((a, r) => a + r.fatigue_index, 0) / readings.length) * 100),
      strainEvents: readings.filter(r => r.fatigue_index > 0.3).length,
    });
  }

  return points;
}

function buildLocalPoints(
  localSessions: { history: ProcessedEMG[]; activityType: string }[]
): SessionChartPoint[] {
  return localSessions
    .filter(s => s.history.length > 0)
    .map((s, i) => ({
      label: `Session ${i + 1}`,
      avgSignal: Math.round((s.history.reduce((a, h) => a + h.normalized, 0) / s.history.length) * 100),
      avgFatigue: Math.round((s.history.reduce((a, h) => a + h.fatigueIndex, 0) / s.history.length) * 100),
      strainEvents: s.history.filter(h => h.strainDetected).length,
    }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1f2e] border border-[#4A9B8E40] rounded-xl p-3 text-xs space-y-1 shadow-xl">
      <p className="text-[#4A9B8E] font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-gray-300">{p.name}:</span>
          <span className="text-white font-bold">{p.value}{p.name !== 'Strain' ? '%' : ''}</span>
        </div>
      ))}
    </div>
  );
};

export function EMGSessionHistoryChart({ patientId, refreshTrigger = 0, localSessions = [] }: Props) {
  const [data, setData] = useState<SessionChartPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (patientId) {
        const points = await fetchFromSupabase(patientId);
        setData(points);
      } else {
        // Not logged in — use local session data passed from page
        setData(buildLocalPoints(localSessions));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId, refreshTrigger, localSessions.length]);

  return (
    <div className="bg-[#0D1117] rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-nunito">EMG Session History</p>
            <p className="text-xs text-gray-500">
              {patientId ? 'Per-session muscle vitals' : 'Local sessions (sign in to save)'}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-gray-500">
          <Activity className="w-8 h-8 mb-2 opacity-30" />
          <p className="text-xs">No completed sessions yet</p>
          <p className="text-xs opacity-60 mt-0.5">Complete a session to see your history</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
              <XAxis dataKey="label" tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#718096', fontSize: 10 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 10, color: '#718096', paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar dataKey="avgSignal" name="Avg Signal" fill="#4A9B8E" opacity={0.8} radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="avgFatigue" name="Avg Fatigue" stroke="#D69E2E" strokeWidth={2} dot={{ fill: '#D69E2E', r: 3 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="strainEvents" name="Strain" stroke="#E53E3E" strokeWidth={1.5} strokeDasharray="4 2" dot={{ fill: '#E53E3E', r: 2 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
            <MiniStat label="Avg Signal" value={`${Math.round(data.reduce((a, d) => a + d.avgSignal, 0) / data.length)}%`} color="#4A9B8E" />
            <MiniStat label="Avg Fatigue" value={`${Math.round(data.reduce((a, d) => a + d.avgFatigue, 0) / data.length)}%`} color="#D69E2E" />
            <MiniStat label="Sessions" value={data.length.toString()} color="#718096" />
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}
