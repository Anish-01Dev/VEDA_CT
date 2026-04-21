import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ProcessedEMG } from '../../lib/emg/emg-processing';

interface Props {
  history: ProcessedEMG[];
}

export function EMGLiveChart({ history }: Props) {
  const data = useMemo(() =>
    history.slice(-100).map((h, i) => ({
      t: i,
      signal: Math.round(h.normalized * 100),
    })),
    [history]
  );

  return (
    <div className="w-full h-48 bg-[#0D1117] rounded-xl p-3">
      <p className="text-xs text-[#4A9B8E] font-mono mb-1">EMG SIGNAL — LIVE</p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <XAxis dataKey="t" hide />
          <YAxis domain={[0, 100]} hide />
          <Tooltip
            contentStyle={{ background: '#1a1f2e', border: '1px solid #4A9B8E', borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => [`${v}%`, 'Signal']}
            labelFormatter={() => ''}
          />
          <ReferenceLine y={75} stroke="#E53E3E" strokeDasharray="3 3" strokeOpacity={0.6} />
          <Line
            type="monotone"
            dataKey="signal"
            stroke="#4A9B8E"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
