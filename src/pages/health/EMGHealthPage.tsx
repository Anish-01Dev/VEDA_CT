import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Activity, History, Brain, Settings, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { navItems } from '@/lib/navigation-config';
import { useEmgStream } from '@/hooks/emg/useEmgStream';
import { getEmgSessions } from '@/lib/emg/emg-supabase';
import { EMGLiveChart } from '@/components/emg/EMGLiveChart';
import { EMGFatigueGauge } from '@/components/emg/EMGFatigueGauge';
import { EMGControlPanel } from '@/components/emg/EMGControlPanel';
import { EMGStatusIndicator } from '@/components/emg/EMGStatusIndicator';
import { EMGInsightsPanel } from '@/components/emg/EMGInsightsPanel';
import { EMGSessionReport } from '@/components/emg/EMGSessionReport';
import { EMGSessionHistoryChart } from '@/components/emg/EMGSessionHistoryChart';
import { useAuth } from '@/contexts/auth-context';
import type { ProcessedEMG } from '@/lib/emg/emg-processing';

interface CompletedSession {
  history: ProcessedEMG[];
  durationSeconds: number;
  activityType: string;
}

export default function EMGHealthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = user?.id ?? '';

  const emg = useEmgStream();
  const [dbSessions, setDbSessions] = useState<any[]>([]);
  const [localSessions, setLocalSessions] = useState<CompletedSession[]>([]);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('monitor');
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);

  // Tick every second to update duration display
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!emg.isSessionActive) return;
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [emg.isSessionActive]);

  useEffect(() => {
    if (emg.isSessionActive) setSessionStart(Date.now());
    else setSessionStart(null);
  }, [emg.isSessionActive]);

  const sessionDuration = sessionStart
    ? Math.round((Date.now() - sessionStart) / 1000)
    : 0;

  const peakSignals = useMemo(
    () => emg.history.filter(h => h.normalized > 0.7).map(h => h.normalized),
    [emg.history]
  );

  // Load DB sessions when logged in
  useEffect(() => {
    if (!patientId) return;
    getEmgSessions(patientId).then(setDbSessions).catch(() => {});
  }, [patientId, historyRefresh]);

  const handleStopSession = async () => {
    const snapshot = await emg.stopSession();
    setCompletedSession(snapshot);
    // Accumulate local sessions for chart (used when not logged in)
    setLocalSessions(prev => [...prev, snapshot]);
    setHistoryRefresh(r => r + 1);
    setActiveTab('report');
  };

  const handleStartSession = async (pid: string, actType: string) => {
    setCompletedSession(null);
    await emg.startSession(pid, actType);
    setActiveTab('monitor');
  };

  const handleNewSession = () => {
    setCompletedSession(null);
    setActiveTab('control');
  };

  return (
    <div className="min-h-screen bg-[#FEFCF3] pb-20 font-inter">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 bg-white/95 border-b border-[#E2E8F0] px-4 py-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <button onClick={() => navigate('/health')} className="p-1.5 rounded-lg hover:bg-[#F8F5F0]">
            <ArrowLeft className="w-5 h-5 text-[#4A5568]" />
          </button>
          <div className="p-2 rounded-lg bg-[#4A9B8E20] text-[#4A9B8E]">
            <Activity className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-[#2D3748] font-nunito">EMG Monitor</h1>
            <p className="text-xs text-[#4A5568]">Muscle activity analysis</p>
          </div>
          <EMGStatusIndicator isConnected={emg.isConnected} mode={emg.mode} signal={emg.signal} />
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Error */}
        {emg.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            ⚠️ {emg.error}
          </div>
        )}

        {/* Always-visible history chart */}
        <EMGSessionHistoryChart
          patientId={patientId}
          refreshTrigger={historyRefresh}
          localSessions={localSessions}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full bg-[#F8F5F0] rounded-xl p-1">
            <TabsTrigger value="monitor" className="flex-1 text-xs gap-1">
              <Activity className="w-3.5 h-3.5" /> Live
            </TabsTrigger>
            <TabsTrigger value="control" className="flex-1 text-xs gap-1">
              <Settings className="w-3.5 h-3.5" /> Control
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex-1 text-xs gap-1">
              <Brain className="w-3.5 h-3.5" /> Insights
            </TabsTrigger>
            <TabsTrigger value="report" className="flex-1 text-xs gap-1 relative">
              <FileText className="w-3.5 h-3.5" /> Report
              {completedSession && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#4A9B8E] rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex-1 text-xs gap-1">
              <History className="w-3.5 h-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* LIVE */}
          <TabsContent value="monitor" className="space-y-4 mt-4">
            <EMGLiveChart history={emg.history} />
            <div className="grid grid-cols-2 gap-3">
              <EMGFatigueGauge fatigueLevel={emg.fatigueLevel} fatigueIndex={emg.fatigueIndex} />
              <div className="flex flex-col gap-2 p-4 bg-white rounded-xl border border-[#E2E8F0]">
                <Stat label="Signal" value={emg.signal.toString()} unit="raw" />
                <Stat label="Normalized" value={`${(emg.normalized * 100).toFixed(1)}`} unit="%" />
                <Stat label="Strain" value={emg.strainDetected ? 'YES' : 'NO'} alert={emg.strainDetected} />
                {emg.isSessionActive && (
                  <Stat label="Duration" value={formatDuration(sessionDuration)} />
                )}
                {emg.isSessionActive && emg.sessionId && !emg.sessionId.startsWith('local-') && (
                  <Stat label="DB Writes" value={emg.totalReadingsWritten.toString()} unit="rows" />
                )}
              </div>
            </div>
            {emg.isSessionActive ? (
              <button
                onClick={handleStopSession}
                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <span className="w-3 h-3 rounded-sm bg-white inline-block" />
                Stop Session & Generate Report
              </button>
            ) : (
              <div className="p-3 bg-[#F8F5F0] rounded-xl text-center text-xs text-[#718096]">
                Go to <strong>Control</strong> tab → Connect → Start Session
              </div>
            )}
          </TabsContent>

          {/* CONTROL */}
          <TabsContent value="control" className="mt-4">
            <EMGControlPanel
              mode={emg.mode}
              isConnected={emg.isConnected}
              isSessionActive={emg.isSessionActive}
              patientId={patientId}
              onSetMode={emg.setMode}
              onConnect={emg.connect}
              onDisconnect={emg.disconnect}
              onStartSession={handleStartSession}
              onStopSession={handleStopSession}
            />
            {!patientId && (
              <p className="text-xs text-[#718096] text-center mt-3">
                Sign in to save sessions to your health record
              </p>
            )}
          </TabsContent>

          {/* INSIGHTS */}
          <TabsContent value="insights" className="mt-4">
            <EMGInsightsPanel
              fatigueLevel={emg.fatigueLevel}
              fatigueIndex={emg.fatigueIndex}
              strainDetected={emg.strainDetected}
              peakSignals={peakSignals}
              sessionDurationSeconds={sessionDuration}
              isSessionActive={emg.isSessionActive}
            />
          </TabsContent>

          {/* REPORT */}
          <TabsContent value="report" className="mt-4">
            <AnimatePresence mode="wait">
              {completedSession ? (
                <EMGSessionReport
                  key="report"
                  history={completedSession.history}
                  durationSeconds={completedSession.durationSeconds}
                  activityType={completedSession.activityType}
                  onNewSession={handleNewSession}
                />
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-14 text-[#718096]"
                >
                  <FileText className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No report yet</p>
                  <p className="text-xs mt-1 text-center">
                    Control → Connect → Start Session → Stop Session
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-4 space-y-3">
            {patientId && dbSessions.length > 0 ? (
              dbSessions.map(s => (
                <div key={s.id} className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2D3748] capitalize">{s.activity_type}</span>
                    <span className="text-xs text-[#718096]">
                      {new Date(s.started_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5568] mt-1">
                    {s.ended_at
                      ? `Duration: ${formatDuration(Math.round(
                          (new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000
                        ))}`
                      : 'In progress'}
                  </p>
                </div>
              ))
            ) : localSessions.length > 0 ? (
              [...localSessions].reverse().map((s, i) => (
                <div key={i} className="p-4 bg-white rounded-xl border border-[#E2E8F0]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#2D3748] capitalize">{s.activityType}</span>
                    <span className="text-xs text-[#718096]">This session</span>
                  </div>
                  <p className="text-xs text-[#4A5568] mt-1">
                    Duration: {formatDuration(s.durationSeconds)} · {s.history.length} readings
                  </p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-[#718096]">
                <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No sessions recorded yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}

function Stat({ label, value, unit, alert }: {
  label: string; value: string; unit?: string; alert?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#718096]">{label}</span>
      <span className={`text-xs font-bold ${alert ? 'text-red-500' : 'text-[#2D3748]'}`}>
        {value}{unit && <span className="font-normal text-[#718096] ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
