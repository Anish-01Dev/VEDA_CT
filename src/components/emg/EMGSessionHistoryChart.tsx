import { useEffect, useState, useRef } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, RefreshCw, Zap, Brain, BarChart2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProcessedEMG } from '../../lib/emg/emg-processing';

interface SessionChartPoint {
  label: string;
  avgSignal: number;
  avgFatigue: number;
  strainEvents: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

interface Props {
  patientId: string;
  refreshTrigger?: number;
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

    const avgSignal = Math.round((readings.reduce((a, r) => a + r.normalized_value, 0) / readings.length) * 100);
    const avgFatigue = Math.round((readings.reduce((a, r) => a + r.fatigue_index, 0) / readings.length) * 100);
    const strainEvents = readings.filter(r => r.fatigue_index > 0.3).length;
    const riskLevel = avgFatigue > 30 ? 'high' : avgFatigue > 10 ? 'moderate' : 'low';

    points.push({
      label: new Date(session.started_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      avgSignal, avgFatigue, strainEvents, riskLevel,
    });
  }
  return points;
}

function buildLocalPoints(localSessions: { history: ProcessedEMG[]; activityType: string }[]): SessionChartPoint[] {
  return localSessions.filter(s => s.history.length > 0).map((s, i) => {
    const avgSignal = Math.round((s.history.reduce((a, h) => a + h.normalized, 0) / s.history.length) * 100);
    const avgFatigue = Math.round((s.history.reduce((a, h) => a + h.fatigueIndex, 0) / s.history.length) * 100);
    const strainEvents = s.history.filter(h => h.strainDetected).length;
    return {
      label: `S${i + 1}`,
      avgSignal, avgFatigue, strainEvents,
      riskLevel: avgFatigue > 30 ? 'high' : avgFatigue > 10 ? 'moderate' : 'low',
    };
  });
}

const BAR_COLORS = {
  low: '#4A9B8E',
  moderate: '#D69E2E',
  high: '#E53E3E',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-[#0D1117]/95 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl min-w-[140px]"
    >
      <p className="text-[#4A9B8E] font-bold text-xs mb-2 border-b border-white/10 pb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-3 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: p.color }} />
            <span className="text-gray-400 text-xs">{p.name}</span>
          </div>
          <span className="text-white font-bold text-xs">
            {p.value}{p.name !== 'Strain' ? '%' : ''}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

// Animated counter hook
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>();
  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [target, duration]);
  return value;
}

function AnimatedStat({ label, value, suffix = '', color, icon }: {
  label: string; value: number; suffix?: string; color: string; icon: React.ReactNode;
}) {
  const count = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 border border-white/5"
    >
      <div style={{ color }} className="opacity-70">{icon}</div>
      <p className="text-lg font-bold" style={{ color }}>{count}{suffix}</p>
      <p className="text-xs text-gray-500 text-center leading-tight">{label}</p>
    </motion.div>
  );
}

export function EMGSessionHistoryChart({ patientId, refreshTrigger = 0, localSessions = [] }: Props) {
  const [data, setData] = useState<SessionChartPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  const load = async () => {
    setLoading(true);
    setVisible(false);
    try {
      const points = patientId
        ? await fetchFromSupabase(patientId)
        : buildLocalPoints(localSessions);
      setData(points);
      setTimeout(() => setVisible(true), 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [patientId, refreshTrigger, localSessions.length]);

  const avgSignal = data.length ? Math.round(data.reduce((a, d) => a + d.avgSignal, 0) / data.length) : 0;
  const avgFatigue = data.length ? Math.round(data.reduce((a, d) => a + d.avgFatigue, 0) / data.length) : 0;
  const totalStrain = data.reduce((a, d) => a + d.strainEvents, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #0D1117 0%, #0f1923 50%, #0D1117 100%)',
        border: '1px solid rgba(74,155,142,0.15)',
        boxShadow: '0 0 40px rgba(74,155,142,0.05), 0 20px 40px rgba(0,0,0,0.4)',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4A9B8E, transparent)' }} />

      <div className="relative p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#4A9B8E15] border border-[#4A9B8E30]">
              <BarChart2 className="w-4 h-4 text-[#4A9B8E]" />
            </div>
            <div>
              <p className="text-sm font-bold text-white font-nunito tracking-tight">EMG Session History</p>
              <p className="text-xs text-gray-500">
                {patientId ? `${data.length} sessions recorded` : 'Local sessions'}
              </p>
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={load}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-3"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[#4A9B8E]/20 border-t-[#4A9B8E] animate-spin" />
              <p className="text-xs text-gray-500">Loading session data…</p>
            </motion.div>
          ) : data.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 gap-2"
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-1">
                <Activity className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-sm text-gray-400 font-medium">No sessions yet</p>
              <p className="text-xs text-gray-600 text-center">Complete a session to see your muscle health history</p>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Stat cards */}
              <div className="grid grid-cols-3 gap-2">
                <AnimatedStat label="Avg Signal" value={avgSignal} suffix="%" color="#4A9B8E"
                  icon={<TrendingUp className="w-3.5 h-3.5" />} />
                <AnimatedStat label="Avg Fatigue" value={avgFatigue} suffix="%" color="#D69E2E"
                  icon={<Brain className="w-3.5 h-3.5" />} />
                <AnimatedStat label="Total Strain" value={totalStrain} color="#E53E3E"
                  icon={<Zap className="w-3.5 h-3.5" />} />
              </div>

              {/* Chart */}
              <motion.div
                initial={{ opacity: 0, scaleY: 0.8 }}
                animate={{ opacity: 1, scaleY: 1 }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                style={{ transformOrigin: 'bottom' }}
              >
                <ResponsiveContainer width="100%" height={180}>
                  <ComposedChart data={data} margin={{ top: 8, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="signalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4A9B8E" stopOpacity={1} />
                        <stop offset="100%" stopColor="#4A9B8E" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff06" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#4A5568', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#4A5568', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="avgSignal" name="Signal" radius={[6, 6, 0, 0]} maxBarSize={32}>
                      {data.map((entry, i) => (
                        <Cell key={i} fill={BAR_COLORS[entry.riskLevel]} fillOpacity={0.85} />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="avgFatigue"
                      name="Fatigue"
                      stroke="#D69E2E"
                      strokeWidth={2}
                      dot={{ fill: '#D69E2E', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#D69E2E', strokeWidth: 2, stroke: '#0D1117' }}
                      isAnimationActive={visible}
                      animationDuration={1000}
                      animationEasing="ease-out"
                    />
                    <Line
                      type="monotone"
                      dataKey="strainEvents"
                      name="Strain"
                      stroke="#E53E3E"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={{ fill: '#E53E3E', r: 2.5, strokeWidth: 0 }}
                      activeDot={{ r: 4, fill: '#E53E3E', strokeWidth: 2, stroke: '#0D1117' }}
                      isAnimationActive={visible}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 pt-1 border-t border-white/5">
                {[
                  { color: '#4A9B8E', label: 'Signal' },
                  { color: '#D69E2E', label: 'Fatigue' },
                  { color: '#E53E3E', label: 'Strain' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-gray-500">{item.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
