import type { FatigueLevel } from '../../lib/emg/emg-processing';

interface Props {
  fatigueLevel: FatigueLevel;
  fatigueIndex: number;
}

const levelConfig = {
  low:      { color: '#38A169', label: 'Low',      bg: 'bg-green-50'  },
  moderate: { color: '#D69E2E', label: 'Moderate', bg: 'bg-yellow-50' },
  high:     { color: '#E53E3E', label: 'High',     bg: 'bg-red-50'    },
};

export function EMGFatigueGauge({ fatigueLevel, fatigueIndex }: Props) {
  const { color, label, bg } = levelConfig[fatigueLevel];
  const pct = Math.min(1, fatigueIndex * 3.33); // scale 0–0.3 → 0–1
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = circumference * pct;

  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl ${bg} border border-[#E2E8F0]`}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        {/* Progress ring */}
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="13" fontWeight="700" fill={color}>
          {Math.round(pct * 100)}%
        </text>
        <text x="50" y="60" textAnchor="middle" fontSize="9" fill="#718096">
          fatigue
        </text>
      </svg>
      <span className="text-sm font-bold mt-1" style={{ color }}>{label} Fatigue</span>
    </div>
  );
}
