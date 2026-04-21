import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Loader2, Brain } from 'lucide-react';
import { analyzeEMGHealth, type EMGHealthInsight } from '../../lib/emg/emg-ai';
import type { FatigueLevel } from '../../lib/emg/emg-processing';

interface Props {
  fatigueLevel: FatigueLevel;
  fatigueIndex: number;
  strainDetected: boolean;
  peakSignals: number[];
  sessionDurationSeconds: number;
  isSessionActive: boolean;
}

export function EMGInsightsPanel({
  fatigueLevel, fatigueIndex, strainDetected,
  peakSignals, sessionDurationSeconds, isSessionActive,
}: Props) {
  const [insight, setInsight] = useState<EMGHealthInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSessionActive) return;
    // Refresh insights every 15s during active session
    const refresh = async () => {
      setLoading(true);
      try {
        const result = await analyzeEMGHealth({
          fatigueLevel, fatigueIndex, strainDetected,
          peakSignals, sessionDurationSeconds,
          averageFatigueIndex: fatigueIndex,
        });
        setInsight(result);
      } finally {
        setLoading(false);
      }
    };
    refresh();
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, [fatigueLevel, strainDetected, isSessionActive]);

  const riskColor = {
    low: 'text-green-600 bg-green-50 border-green-200',
    moderate: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-red-600 bg-red-50 border-red-200',
  };

  return (
    <div className="space-y-3">
      {strainDetected && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
          <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">Muscle Strain Detected</p>
            <p className="text-xs text-red-600 mt-0.5">Consecutive high-intensity signals. Consider resting.</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-[#4A9B8E] py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-xs">Analyzing muscle health…</span>
        </div>
      )}

      {insight && !loading && (
        <div className={`p-3 rounded-xl border ${riskColor[insight.riskLevel]}`}>
          <div className="flex items-center gap-1.5 mb-2">
            <Brain className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              {insight.source === 'ai' ? 'AI Insight' : 'Health Insight'}
            </span>
          </div>
          <p className="text-sm font-medium mb-2">{insight.muscleHealthStatus}</p>
          <ul className="space-y-1">
            {insight.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs">
                <CheckCircle className="w-3 h-3 mt-0.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
          {insight.recoveryTime && (
            <p className="text-xs mt-2 opacity-70">Est. recovery: {insight.recoveryTime}</p>
          )}
        </div>
      )}

      {!isSessionActive && !insight && (
        <p className="text-xs text-[#718096] text-center py-4">Start a session to see health insights</p>
      )}
    </div>
  );
}
