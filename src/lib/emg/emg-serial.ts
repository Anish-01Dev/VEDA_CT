export interface EMGSerialReading {
  signal: number;
  timestamp: number;
}

type ReadingCallback = (reading: EMGSerialReading) => void;
type ErrorCallback = (error: Error) => void;

class EMGSerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private isReading = false;
  private onReading: ReadingCallback | null = null;
  private onError: ErrorCallback | null = null;
  private textDecoder = new TextDecoderStream();
  private lineBuffer = '';

  isSupported(): boolean {
    return 'serial' in navigator;
  }

  async connect(): Promise<void> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API not supported in this browser. Use Chrome or Edge.');
    }
    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
    } catch (err: any) {
      if (err.name === 'NotFoundError') throw new Error('No serial port selected.');
      if (err.name === 'SecurityError') throw new Error('Serial port access denied.');
      throw new Error(`Failed to connect: ${err.message}`);
    }
  }

  async startReading(onReading: ReadingCallback, onError?: ErrorCallback): Promise<void> {
    if (!this.port?.readable) throw new Error('Port not connected.');
    this.onReading = onReading;
    this.onError = onError ?? null;
    this.isReading = true;

    const textDecoder = new TextDecoderStream();
    this.port.readable.pipeTo(textDecoder.writable).catch(() => {});
    this.reader = textDecoder.readable.getReader();

    this.readLoop();
  }

  private async readLoop(): Promise<void> {
    while (this.isReading && this.reader) {
      try {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (!value) continue;

        this.lineBuffer += value;
        const lines = this.lineBuffer.split('\n');
        this.lineBuffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          try {
            const parsed = JSON.parse(trimmed);
            if (typeof parsed.signal === 'number' && typeof parsed.timestamp === 'number') {
              this.onReading?.(parsed as EMGSerialReading);
            }
          } catch {
            // Skip malformed JSON lines silently
          }
        }
      } catch (err: any) {
        if (this.isReading) {
          this.onError?.(new Error(`Read error: ${err.message}`));
        }
        break;
      }
    }
  }

  async disconnect(): Promise<void> {
    this.isReading = false;
    try {
      await this.reader?.cancel();
      this.reader = null;
      await this.port?.close();
      this.port = null;
    } catch {
      // Ignore close errors
    }
  }

  getConnectionStatus(): boolean {
    return this.port !== null && this.isReading;
  }
}

export const emgSerialService = new EMGSerialService();
