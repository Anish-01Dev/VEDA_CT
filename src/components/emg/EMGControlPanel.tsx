import { Usb, Play, Square, FlaskConical, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import type { EMGMode } from '../../hooks/emg/useEmgStream';

interface Props {
  mode: EMGMode;
  isConnected: boolean;
  isSessionActive: boolean;
  patientId: string;
  onSetMode: (m: EMGMode) => void;
  onConnect: () => Promise<void>;
  onDisconnect: () => Promise<void>;
  onStartSession: (patientId: string, activityType: string) => Promise<void>;
  onStopSession: () => Promise<any>;
}

export function EMGControlPanel({
  mode, isConnected, isSessionActive, patientId,
  onSetMode, onConnect, onDisconnect, onStartSession, onStopSession,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [activityType, setActivityType] = useState('general');

  const handle = async (fn: () => Promise<void>) => {
    setLoading(true);
    try { await fn(); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-3 p-4 bg-white rounded-xl border border-[#E2E8F0]">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => onSetMode('serial')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            mode === 'serial' ? 'bg-[#4A9B8E] text-white border-[#4A9B8E]' : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-[#F8F5F0]'
          }`}
        >
          <Usb className="w-3.5 h-3.5" /> USB Serial
        </button>
        <button
          onClick={() => onSetMode('simulation')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            mode === 'simulation' ? 'bg-[#4A9B8E] text-white border-[#4A9B8E]' : 'bg-white text-[#4A5568] border-[#E2E8F0] hover:bg-[#F8F5F0]'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5" /> Simulation
        </button>
      </div>

      {/* Activity type */}
      <select
        value={activityType}
        onChange={e => setActivityType(e.target.value)}
        className="w-full text-sm border border-[#E2E8F0] rounded-lg px-3 py-2 text-[#2D3748] focus:outline-none focus:border-[#4A9B8E]"
      >
        <option value="general">General Activity</option>
        <option value="exercise">Exercise</option>
        <option value="rehabilitation">Rehabilitation</option>
        <option value="rest">Resting Baseline</option>
      </select>

      {/* Connect / Disconnect */}
      <div className="flex gap-2">
        {!isConnected ? (
          <Button
            className="flex-1 bg-[#4A9B8E] hover:bg-[#3d8578] text-white h-9 text-sm"
            onClick={() => handle(onConnect)}
            disabled={loading}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Usb className="w-4 h-4 mr-1" />}
            Connect
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 border-[#E2E8F0] h-9 text-sm"
            onClick={() => handle(onDisconnect)}
            disabled={loading}
          >
            Disconnect
          </Button>
        )}
      </div>

      {/* Start / Stop session */}
      {isConnected && (
        <div className="flex gap-2">
          {!isSessionActive ? (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 text-sm"
              onClick={() => handle(() => onStartSession(patientId, activityType))}
              disabled={loading || !patientId}
            >
              <Play className="w-4 h-4 mr-1" /> Start Session
            </Button>
          ) : (
            <Button
              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-9 text-sm"
              onClick={() => handle(onStopSession)}
              disabled={loading}
            >
              <Square className="w-4 h-4 mr-1" /> Stop Session
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
