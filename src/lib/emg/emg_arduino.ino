// ============================================================
// Pixal Health - EMG Signal Reader
// Board: Arduino Uno
// EMG Sensor: Connected to A0
// Baud Rate: 115200
// Output: JSON per line  {"signal": 512, "timestamp": 123456}
// ============================================================

#define EMG_PIN A0
#define SAMPLE_INTERVAL_MS 50
#define SMOOTH_WINDOW 8

int smoothBuffer[SMOOTH_WINDOW];
int smoothIndex = 0;

void setup() {
  Serial.begin(115200);
  pinMode(EMG_PIN, INPUT);
  // Pre-fill buffer with initial readings
  for (int i = 0; i < SMOOTH_WINDOW; i++) {
    smoothBuffer[i] = analogRead(EMG_PIN);
    delay(5);
  }
}

int movingAverage(int newVal) {
  smoothBuffer[smoothIndex] = newVal;
  smoothIndex = (smoothIndex + 1) % SMOOTH_WINDOW;
  long sum = 0;
  for (int i = 0; i < SMOOTH_WINDOW; i++) sum += smoothBuffer[i];
  return (int)(sum / SMOOTH_WINDOW);
}

void loop() {
  unsigned long start = millis();

  int raw = analogRead(EMG_PIN);       // 0–1023 (10-bit ADC)
  int smoothed = movingAverage(raw);

  // Output JSON line to Serial
  Serial.print("{\"signal\":");
  Serial.print(smoothed);
  Serial.print(",\"timestamp\":");
  Serial.print(millis());
  Serial.println("}");

  // Stable 50ms loop timing
  unsigned long elapsed = millis() - start;
  if (elapsed < SAMPLE_INTERVAL_MS) {
    delay(SAMPLE_INTERVAL_MS - elapsed);
  }
}
