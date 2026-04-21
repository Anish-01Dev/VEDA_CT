import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { ProcessedEMG } from '../../lib/emg/emg-processing';
import type { HeartbeatPoint } from '../../hooks/emg/useHeartbeat';
import { ZONE_CONFIG } from '../../hooks/emg/useHeartbeat';

interface Props {
  emgHistory: ProcessedEMG[];
  heartHistory: HeartbeatPoint[];
  currentBpm: number;
  isActive: boolean;
  zone: 'rest' | 'fat-burn' | 'cardio' | 'peak';
}

export function EMGHeartDualChart({ emgHistory, heartHistory, currentBpm, isActive, zone }: Props) {
  const zc = ZONE_CONFIG[zone];

  const emgData = emgHistory.slice(-80).map((h, i) => ({ t: i, v: Math.round(h.normalized * 100) }));
  const ecgData = heartHistory.slice(-80).map((h, i) => ({ t: i, v: h.ecg }));

  return (
    <div className="rounded-2xl overflow-hidden" style={{
      background: 'linear-gradient(135deg, #0D1117 0%, #0f1923 100%)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Header row */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[#4A9B8E] uppercase tracking-widest">EMG + ECG Live</span>
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4A9B8E] animate-pulse" />
          )}
        </div>
        {/* BPM display */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={isActive ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 60 / Math.max(currentBpm, 1), ease: 'easeInOut' }}
          >
            <Heart className="w-4 h-4 fill-current" style={{ color: zc.color }} />
          </motion.div>
          <AnimatePresence mode="wait">
            <motion.span
              key={currentBpm}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="text-lg font-bold font-mono"
              style={{ color: zc.color }}
            >
              {currentBpm}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs text-gray-500">BPM</span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full`}
            style={{ background: `${zc.color}20`, color: zc.color }}>
            {zc.label}
          </span>
        </div>
      </div>

      {/* EMG chart */}
      <div className="px-2">
        <p className="text-xs text-gray-600 font-mono px-2 mb-0.5">MUSCLE (EMG)</p>
        <ResponsiveContainer width="100%" height={70}>
          <LineChart data={emgData}>
            <YAxis domain={[0, 100]} hide />
            <Line
              type="monotone" dataKey="v"
              stroke="#4A9B8E" strokeWidth={1.5}
              dot={false} isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5" />

      {/* ECG chart */}
      <div className="px-2 pb-3">
        <p className="text-xs text-gray-600 font-mono px-2 mb-0.5 mt-1">HEART (ECG)</p>
        <ResponsiveContainer width="100%" height={70}>
          <LineChart data={ecgData}>
            <YAxis domain={[0, 100]} hide />
            <Line
              type="monotone" dataKey="v"
              stroke={zc.color} strokeWidth={1.5}
              dot={false} isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
