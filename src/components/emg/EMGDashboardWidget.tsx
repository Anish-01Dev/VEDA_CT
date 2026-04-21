import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getLatestEmgSummary } from '../../lib/emg/emg-supabase';
import { useAuth } from '@/contexts/auth-context';

export function EMGDashboardWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    if (!user?.id) return;
    getLatestEmgSummary(user.id).then(setSummary).catch(() => {});
  }, [user?.id]);

  return (
    <div
      onClick={() => navigate('/health/emg')}
      className="flex items-center gap-3 p-4 bg-white border border-[#E2E8F0] rounded-xl cursor-pointer hover:bg-[#F8F5F0] transition-colors"
    >
      <div className="p-2.5 rounded-xl bg-[#4A9B8E20] text-[#4A9B8E] shrink-0">
        <Activity className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#2D3748]">EMG Muscle Monitor</p>
        {summary ? (
          <p className="text-xs text-[#718096] truncate">
            Last session: {new Date(summary.started_at).toLocaleDateString()} · {summary.activity_type}
          </p>
        ) : (
          <p className="text-xs text-[#718096]">No sessions yet — tap to start monitoring</p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-[#718096] shrink-0" />
    </div>
  );
}
