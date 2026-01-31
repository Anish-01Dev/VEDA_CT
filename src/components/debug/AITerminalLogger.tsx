import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal, Trash2, Download } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: string;
  component: string;
  action: string;
  data?: any;
  emoji: string;
}

export default function AITerminalLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Override console.log to capture AI logs
    const originalLog = console.log;
    
    console.log = (...args) => {
      const message = args.join(' ');
      
      // Check if it's an AI log (contains timestamp and emoji)
      const aiLogMatch = message.match(/^\[([^\]]+)\] (.) (\w+) \| ([^|]+) \| (.+)$/);
      
      if (aiLogMatch) {
        const [, timestamp, emoji, level, component, action] = aiLogMatch;
        
        const newLog: LogEntry = {
          timestamp,
          level: level.toLowerCase(),
          component,
          action,
          emoji,
        };
        
        // Check for data in next console.log
        if (args.length > 1 && typeof args[1] === 'object') {
          newLog.data = args[1];
        }
        
        setLogs(prev => [...prev.slice(-49), newLog]); // Keep last 50 logs
        
        // Auto-scroll to bottom
        setTimeout(() => {
          if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
          }
        }, 100);
      }
      
      // Call original console.log
      originalLog.apply(console, args);
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] ${log.emoji} ${log.level.toUpperCase()} | ${log.component} | ${log.action}${log.data ? '\n└─ Data: ' + JSON.stringify(log.data, null, 2) : ''}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
          size="sm"
        >
          <Terminal className="w-4 h-4 mr-2" />
          AI Logs ({logs.length})
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 z-50">
      <Card className="h-full bg-gray-900 text-green-400 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              AI Terminal Logger
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs border-green-400 text-green-400">
                {logs.length} logs
              </Badge>
              <Button
                onClick={downloadLogs}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-400 hover:bg-gray-800"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                onClick={clearLogs}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-400 hover:bg-gray-800"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-green-400 hover:bg-gray-800"
              >
                ×
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 h-full overflow-hidden">
          <div 
            ref={logContainerRef}
            className="h-full overflow-y-auto font-mono text-xs space-y-1 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
          >
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No AI logs yet. Use any AI feature to see logs here.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="border-l-2 border-gray-700 pl-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-400">{log.timestamp.split(' ')[1]}</span>
                    <span>{log.emoji}</span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-1 py-0 ${getLevelColor(log.level)} border-0`}
                    >
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-cyan-400">{log.component}</span>
                  </div>
                  <div className="text-green-300 ml-4 text-xs">
                    {log.action}
                  </div>
                  {log.data && (
                    <div className="text-gray-400 ml-4 text-xs">
                      └─ {JSON.stringify(log.data)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}