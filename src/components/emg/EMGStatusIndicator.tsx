import { Wifi, WifiOff, Activity } from 'lucide-react';
import type { EMGMode } from '../../hooks/emg/useEmgStream';

interface Props {
  isConnected: boolean;
  mode: EMGMode;
  signal: number;
}

export function EMGStatusIndicator({ isConnected, mode, signal }: Props) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#F8F5F0] border border-[#E2E8F0]">
      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
      <span className="text-xs font-semibold text-[#2D3748]">
        {isConnected ? 'Connected' : 'Disconnected'}
      </span>
      <span className="text-xs text-[#718096] ml-auto flex items-center gap-1">
        {mode === 'serial' ? <Wifi className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
        {mode === 'serial' ? 'USB Serial' : 'Simulation'}
      </span>
      {isConnected && (
        <span className="text-xs font-mono text-[#4A9B8E]">{signal}</span>
      )}
    </div>
  );
}
