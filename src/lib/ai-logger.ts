/**
 * AI Logger - Centralized logging for all AI component usage
 */

export class AILogger {
  private static instance: AILogger;
  
  private constructor() {}
  
  static getInstance(): AILogger {
    if (!AILogger.instance) {
      AILogger.instance = new AILogger();
    }
    return AILogger.instance;
  }

  private formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').substring(0, 19);
  }

  private log(level: string, component: string, action: string, data?: any): void {
    const timestamp = this.formatTimestamp();
    const emoji = this.getEmoji(component);
    
    console.log(`[${timestamp}] ${emoji} ${level.toUpperCase()} | ${component} | ${action}`);
    
    if (data) {
      console.log(`└─ Data:`, data);
    }
  }

  private getEmoji(component: string): string {
    const emojis: Record<string, string> = {
      'Virtual Doctor': '🩺',
      'Symptom Checker': '🔍',
      'Prescription Reader': '💊',
      'First Aid Advisor': '🚑',
      'NeuroMate': '🧠',
      'Emergency Triage': '⚡',
      'Lab AI': '🧪',
      'Misinformation Buster': '🛡️',
      'Health Habit Coach': '🎯',
      'Diet Advisor': '🍎',
      'AI Client': '🤖',
      'SambaNova': '🦙',
      'Gemini': '💎'
    };
    return emojis[component] || '🔧';
  }

  // Public logging methods
  aiStart(component: string, action: string, input?: any): void {
    this.log('info', component, `Started: ${action}`, input ? { input: typeof input === 'string' ? input.substring(0, 100) + '...' : input } : undefined);
  }

  aiSuccess(component: string, action: string, result?: any): void {
    this.log('success', component, `✅ Success: ${action}`, result ? { 
      confidence: result.confidence,
      type: result.condition || result.verdict || result.injury_type || 'analysis'
    } : undefined);
  }

  aiError(component: string, action: string, error: any): void {
    this.log('error', component, `❌ Error: ${action}`, { 
      error: error instanceof Error ? error.message : String(error)
    });
  }

  aiFallback(component: string, from: string, to: string): void {
    this.log('warn', component, `🔄 Fallback: ${from} → ${to}`);
  }

  aiOffline(component: string, action: string): void {
    this.log('warn', component, `📴 Offline: ${action}`);
  }

  aiConnection(service: string, status: 'connected' | 'failed'): void {
    const emoji = status === 'connected' ? '✅' : '❌';
    this.log('info', service, `${emoji} Connection ${status}`);
  }

  aiUsage(component: string, tokens?: number, duration?: number): void {
    const data: any = {};
    if (tokens) data.tokens = tokens;
    if (duration) data.duration = `${duration}ms`;
    
    this.log('info', component, '📊 Usage Stats', Object.keys(data).length > 0 ? data : undefined);
  }
}

export const aiLogger = AILogger.getInstance();
export default aiLogger;