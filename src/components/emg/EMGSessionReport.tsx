import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle, AlertTriangle, Brain, Activity, Clock,
  TrendingUp, Download, RotateCcw, Zap, Heart, Dumbbell
} from 'lucide-react';
import { Button } from '../ui/button';
import { analyzeEMGHealth, type EMGHealthInsight } from '../../lib/emg/emg-ai';
import type { ProcessedEMG, FatigueLevel } from '../../lib/emg/emg-processing';
import type { HeartbeatStats } from '../../hooks/emg/useHeartbeat';
import { ZONE_CONFIG } from '../../hooks/emg/useHeartbeat';

interface SessionStats {
  durationSeconds: number;
  totalReadings: number;
  avgSignal: number;
  peakSignal: number;
  avgFatigueIndex: number;
  strainEvents: number;
  finalFatigueLevel: FatigueLevel;
  activityType: string;
}

interface Props {
  history: ProcessedEMG[];
  durationSeconds: number;
  activityType: string;
  heartbeatStats?: HeartbeatStats;
  onNewSession: () => void;
}

function computeStats(history: ProcessedEMG[], durationSeconds: number, activityType: string): SessionStats {
  if (!history.length) return {
    durationSeconds, totalReadings: 0, avgSignal: 0, peakSignal: 0,
    avgFatigueIndex: 0, strainEvents: 0, finalFatigueLevel: 'low', activityType,
  };
  const signals = history.map(h => h.normalized);
  const avgSignal = signals.reduce((a, b) => a + b, 0) / signals.length;
  const peakSignal = Math.max(...signals);
  const avgFatigueIndex = history.reduce((a, h) => a + h.fatigueIndex, 0) / history.length;
  const strainEvents = history.filter(h => h.strainDetected).length;
  const finalFatigueLevel = history[history.length - 1]?.fatigueLevel ?? 'low';
  return { durationSeconds, totalReadings: history.length, avgSignal, peakSignal, avgFatigueIndex, strainEvents, finalFatigueLevel, activityType };
}

// Exercise recommendations based on fatigue + heart zone
function getExerciseRecommendations(
  fatigueLevel: FatigueLevel,
  zone: HeartbeatStats['zone'],
  strainEvents: number
): { name: string; duration: string; intensity: string; icon: string }[] {
  if (fatigueLevel === 'high' || strainEvents > 5) {
    return [
      { name: 'Static Stretching', duration: '10–15 min', intensity: 'Very Low', icon: '🧘' },
      { name: 'Foam Rolling', duration: '5–10 min', intensity: 'Low', icon: '🔄' },
      { name: 'Deep Breathing', duration: '5 min', intensity: 'Rest', icon: '💨' },
      { name: 'Cold/Warm Compress', duration: '10 min', intensity: 'Recovery', icon: '🧊' },
    ];
  }
  if (fatigueLevel === 'moderate' || zone === 'cardio') {
    return [
      { name: 'Light Walking', duration: '20–30 min', intensity: 'Low', icon: '🚶' },
      { name: 'Dynamic Stretching', duration: '10 min', intensity: 'Low', icon: '🤸' },
      { name: 'Yoga Flow', duration: '20 min', intensity: 'Moderate', icon: '🧘' },
      { name: 'Swimming (easy)', duration: '20 min', intensity: 'Low–Moderate', icon: '🏊' },
    ];
  }
  if (zone === 'fat-burn') {
    return [
      { name: 'Brisk Walking', duration: '30–45 min', intensity: 'Moderate', icon: '🚶' },
      { name: 'Cycling', duration: '20–30 min', intensity: 'Moderate', icon: '🚴' },
      { name: 'Bodyweight Circuit', duration: '20 min', intensity: 'Moderate', icon: '💪' },
      { name: 'Jump Rope', duration: '10 min', intensity: 'Moderate', icon: '⚡' },
    ];
  }
  // Low fatigue, rest zone — can push harder
  return [
    { name: 'Strength Training', duration: '45–60 min', intensity: 'High', icon: '🏋️' },
    { name: 'HIIT', duration: '20–30 min', intensity: 'High', icon: '🔥' },
    { name: 'Running', duration: '30–40 min', intensity: 'Moderate–High', icon: '🏃' },
    { name: 'Sports Activity', duration: '45–60 min', intensity: 'High', icon: '⚽' },
  ];
}

const fatigueColor = {
  low:      { text: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'Low'      },
  moderate: { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Moderate' },
  high:     { text: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'High'     },
};

const riskColor = {
  low:      { text: 'text-green-700',  bg: 'bg-green-100'  },
  moderate: { text: 'text-yellow-700', bg: 'bg-yellow-100' },
  high:     { text: 'text-red-700',    bg: 'bg-red-100'    },
};

export function EMGSessionReport({ history, durationSeconds, activityType, heartbeatStats, onNewSession }: Props) {
  const [insight, setInsight] = useState<EMGHealthInsight | null>(null);
  const [loading, setLoading] = useState(true);
  const stats = computeStats(history, durationSeconds, activityType);
  const fc = fatigueColor[stats.finalFatigueLevel];
  const hb = heartbeatStats ?? { avgBpm: 72, minBpm: 65, maxBpm: 85, hrv: 35, zone: 'rest' as const };
  const zc = ZONE_CONFIG[hb.zone];
  const exercises = getExerciseRecommendations(stats.finalFatigueLevel, hb.zone, stats.strainEvents);

  useEffect(() => {
    analyzeEMGHealth({
      fatigueLevel: stats.finalFatigueLevel,
      fatigueIndex: stats.avgFatigueIndex,
      strainDetected: stats.strainEvents > 3,
      peakSignals: history.filter(h => h.normalized > 0.7).map(h => h.normalized),
      sessionDurationSeconds: durationSeconds,
      averageFatigueIndex: stats.avgFatigueIndex,
    }).then(setInsight).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const lines = [
      '=== PIXAL HEALTH — EMG SESSION REPORT ===',
      `Date: ${new Date().toLocaleString()}`,
      `Activity: ${activityType}`,
      `Duration: ${formatDuration(durationSeconds)}`,
      `Total Readings: ${stats.totalReadings}`,
      '',
      '--- MUSCLE METRICS ---',
      `Avg Signal: ${(stats.avgSignal * 100).toFixed(1)}%`,
      `Peak Signal: ${(stats.peakSignal * 100).toFixed(1)}%`,
      `Avg Fatigue: ${(stats.avgFatigueIndex * 100).toFixed(1)}%`,
      `Fatigue Level: ${stats.finalFatigueLevel.toUpperCase()}`,
      `Strain Events: ${stats.strainEvents}`,
      '',
      '--- HEART RATE ---',
      `Avg BPM: ${hb.avgBpm}`,
      `Min BPM: ${hb.minBpm}`,
      `Max BPM: ${hb.maxBpm}`,
      `HRV: ${hb.hrv}ms`,
      `Zone: ${hb.zone.toUpperCase()}`,
      '',
      '--- AI ANALYSIS ---',
      insight ? `Status: ${insight.muscleHealthStatus}` : 'N/A',
      insight ? `Risk: ${insight.riskLevel.toUpperCase()}` : '',
      insight ? `Recovery: ${insight.recoveryTime}` : '',
      '',
      '--- RECOMMENDATIONS ---',
      ...(insight?.recommendations.map((r, i) => `${i + 1}. ${r}`) ?? []),
      '',
      '--- EXERCISE PLAN ---',
      ...exercises.map(e => `• ${e.icon} ${e.name} — ${e.duration} (${e.intensity})`),
      '',
      'Generated by Pixal Health EMG Monitor',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `emg-report-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#4A9B8E20] text-[#4A9B8E]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2D3748] font-nunito">Session Report</h2>
            <p className="text-xs text-[#718096]">{new Date().toLocaleString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleExport} className="h-8 text-xs border-[#E2E8F0]">
            <Download className="w-3.5 h-3.5 mr-1" /> Export
          </Button>
          <Button size="sm" onClick={onNewSession} className="h-8 text-xs bg-[#4A9B8E] hover:bg-[#3d8578] text-white">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> New
          </Button>
        </div>
      </div>

      {stats.totalReadings === 0 && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
          ⚠️ No readings captured. Connect and run session for at least a few seconds.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Clock className="w-4 h-4" />} label="Duration" value={formatDuration(durationSeconds)} />
        <StatCard icon={<Activity className="w-4 h-4" />} label="Readings" value={stats.totalReadings.toString()} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Peak Signal" value={`${(stats.peakSignal * 100).toFixed(0)}%`} />
        <StatCard icon={<Zap className="w-4 h-4" />} label="Strain Events" value={stats.strainEvents.toString()} alert={stats.strainEvents > 3} />
      </div>

      {/* ── HEART RATE ANALYSIS ── */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: `${zc.color}40`, background: `${zc.color}08` }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: `${zc.color}20` }}>
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 60 / hb.avgBpm, ease: 'easeInOut' }}
          >
            <Heart className="w-4 h-4 fill-current" style={{ color: zc.color }} />
          </motion.div>
          <span className="text-sm font-bold text-[#2D3748]">Heart Rate Analysis</span>
          <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ background: `${zc.color}20`, color: zc.color }}>
            {zc.label} Zone
          </span>
        </div>
        <div className="grid grid-cols-4 gap-0 divide-x" style={{ borderColor: `${zc.color}15` }}>
          {[
            { label: 'Avg BPM', value: hb.avgBpm },
            { label: 'Min BPM', value: hb.minBpm },
            { label: 'Max BPM', value: hb.maxBpm },
            { label: 'HRV (ms)', value: hb.hrv },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center py-3 px-2">
              <span className="text-lg font-bold" style={{ color: zc.color }}>{item.value}</span>
              <span className="text-xs text-[#718096] mt-0.5 text-center">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="px-4 py-2 text-xs text-[#4A5568]">
          {hb.zone === 'rest' && '💚 Heart rate in rest zone — excellent recovery state'}
          {hb.zone === 'fat-burn' && '💛 Fat-burn zone — optimal for weight management'}
          {hb.zone === 'cardio' && '🟠 Cardio zone — improving cardiovascular fitness'}
          {hb.zone === 'peak' && '🔴 Peak zone — high intensity, monitor closely'}
        </div>
      </motion.div>

      {/* Fatigue summary */}
      <div className={`p-4 rounded-xl border ${fc.bg} ${fc.border}`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-[#2D3748]">Muscle Fatigue Summary</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${fc.bg} ${fc.text} border ${fc.border}`}>
            {fc.label}
          </span>
        </div>
        <div className="space-y-2">
          <MiniBar label="Avg Intensity" value={stats.avgSignal} color="#4A9B8E" />
          <MiniBar label="Avg Fatigue" value={Math.min(1, stats.avgFatigueIndex * 3.33)} color={
            stats.finalFatigueLevel === 'high' ? '#E53E3E' :
            stats.finalFatigueLevel === 'moderate' ? '#D69E2E' : '#38A169'
          } />
          <MiniBar label="Peak Load" value={stats.peakSignal} color="#805AD5" />
        </div>
      </div>

      {/* AI Analysis */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-[#4A9B8E]" />
          <span className="text-sm font-bold text-[#2D3748]">
            {loading ? 'Generating AI Analysis…' : `${insight?.source === 'ai' ? 'AI' : 'Health'} Analysis`}
          </span>
          {loading && <div className="w-3.5 h-3.5 border-2 border-[#4A9B8E]/30 border-t-[#4A9B8E] rounded-full animate-spin ml-auto" />}
        </div>
        {insight && !loading && (
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${riskColor[insight.riskLevel].bg} ${riskColor[insight.riskLevel].text}`}>
              {insight.riskLevel === 'low' ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              {insight.riskLevel.toUpperCase()} RISK
            </div>
            <p className="text-sm text-[#2D3748] font-medium">{insight.muscleHealthStatus}</p>
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-[#4A5568] uppercase tracking-wide">Recommendations</p>
              {insight.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#4A5568]">
                  <CheckCircle className="w-3.5 h-3.5 text-[#4A9B8E] mt-0.5 shrink-0" />
                  {r}
                </div>
              ))}
            </div>
            {insight.recoveryTime && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#E2E8F0]">
                <Clock className="w-3.5 h-3.5 text-[#718096]" />
                <span className="text-xs text-[#718096]">Estimated recovery: <strong>{insight.recoveryTime}</strong></span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EXERCISE RECOMMENDATIONS ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-4 bg-white rounded-xl border border-[#E2E8F0]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell className="w-4 h-4 text-[#4A9B8E]" />
          <span className="text-sm font-bold text-[#2D3748]">Recommended Exercises</span>
          <span className="ml-auto text-xs text-[#718096]">Based on your session</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {exercises.map((ex, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-3 rounded-xl bg-[#F8F5F0] border border-[#E2E8F0]"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-base">{ex.icon}</span>
                <span className="text-xs font-semibold text-[#2D3748] leading-tight">{ex.name}</span>
              </div>
              <p className="text-xs text-[#718096]">{ex.duration}</p>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full mt-1 inline-block ${
                ex.intensity === 'High' ? 'bg-red-100 text-red-600' :
                ex.intensity === 'Moderate' || ex.intensity === 'Moderate–High' ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {ex.intensity}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Overall score */}
      <OverallHealthScore stats={stats} heartbeatStats={hb} />
    </motion.div>
  );
}

function OverallHealthScore({ stats, heartbeatStats }: { stats: SessionStats; heartbeatStats: HeartbeatStats }) {
  const muscleScore = Math.round(
    100 - (stats.avgFatigueIndex * 100 * 0.4) -
    (Math.min(stats.strainEvents, 10) * 3) -
    (stats.finalFatigueLevel === 'high' ? 20 : stats.finalFatigueLevel === 'moderate' ? 10 : 0)
  );
  const heartScore = Math.round(
    100 -
    Math.abs(heartbeatStats.avgBpm - 70) * 0.3 -
    (heartbeatStats.zone === 'peak' ? 15 : heartbeatStats.zone === 'cardio' ? 5 : 0) +
    Math.min(heartbeatStats.hrv, 50) * 0.3
  );
  const overall = Math.round((Math.max(0, Math.min(100, muscleScore)) + Math.max(0, Math.min(100, heartScore))) / 2);
  const color = overall >= 70 ? '#38A169' : overall >= 40 ? '#D69E2E' : '#E53E3E';
  const label = overall >= 70 ? 'Good' : overall >= 40 ? 'Fair' : 'Poor';

  return (
    <div className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
      <p className="text-sm font-bold text-[#2D3748] mb-3">Overall Health Score</p>
      <div className="flex items-center gap-4">
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke="#E2E8F0" strokeWidth="7" />
          <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${(overall / 100) * 188} 188`} strokeLinecap="round"
            transform="rotate(-90 36 36)" style={{ transition: 'stroke-dasharray 1.2s ease' }} />
          <text x="36" y="40" textAnchor="middle" fontSize="16" fontWeight="800" fill={color}>{overall}</text>
        </svg>
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#718096]">Muscle Health</span>
              <span className="font-bold text-[#2D3748]">{Math.max(0, Math.min(100, muscleScore))}</span>
            </div>
            <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-[#4A9B8E]"
                initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, muscleScore))}%` }}
                transition={{ duration: 1, delay: 0.3 }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#718096]">Heart Health</span>
              <span className="font-bold text-[#2D3748]">{Math.max(0, Math.min(100, heartScore))}</span>
            </div>
            <div className="h-1.5 bg-[#F0EDE8] rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full"
                style={{ background: ZONE_CONFIG[heartbeatStats.zone].color }}
                initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, heartScore))}%` }}
                transition={{ duration: 1, delay: 0.5 }} />
            </div>
          </div>
          <p className="text-xs text-[#718096]">Overall: <strong style={{ color }}>{label}</strong></p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: string; alert?: boolean }) {
  return (
    <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] flex items-center gap-2.5">
      <div className="p-1.5 rounded-lg bg-[#4A9B8E15] text-[#4A9B8E]">{icon}</div>
      <div>
        <p className="text-xs text-[#718096]">{label}</p>
        <p className={`text-sm font-bold ${alert ? 'text-red-500' : 'text-[#2D3748]'}`}>{value}</p>
      </div>
    </div>
  );
}

function MiniBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#718096] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.round(value * 100)}%` }}
          transition={{ duration: 0.8 }} />
      </div>
      <span className="text-xs font-mono text-[#4A5568] w-8 text-right">{Math.round(value * 100)}%</span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
