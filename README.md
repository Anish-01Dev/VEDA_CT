# Synora

AI-assisted personal health guidance app — symptom triage, prescription/lab-report reading via OCR, and real-time muscle-fatigue tracking from an EMG sensor, with an offline-first local data store.

**Not a medical device and not a substitute for professional medical advice.** Symptom and emergency-detection output is AI-generated guidance, not a diagnosis.

## What it does

- **Symptom checker** — text/voice input, categorization, and urgency flagging via Gemini, with an explicit escalation path to "seek care now" rather than a confidence score alone.
- **Prescription/lab-report reader** — OCR (Tesseract.js) + Gemini vision to extract and explain medication and lab-report contents.
- **EMG session tracking** — real-time muscle-fatigue and strain-event logging from a connected EMG sensor, with session history and charts.
- **Offline-first storage** — SQLite in the browser (sql.js) + IndexedDB, so core features work without a live connection; Supabase is used for the parts that need a backend (auth, sync).
- **Voice interface** — Web Speech API for input/output in Hindi, English, and Tamil.

## Stack

React 18 · TypeScript · Vite · Tailwind CSS · Google Gemini API (text + vision) · Tesseract.js · sql.js / IndexedDB · Supabase (auth + sync) · Recharts (EMG session charts) · Three.js (3D visualizations)

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in your own Gemini / Supabase / SambaNova keys
npm run dev
```

```bash
npm run build     # production build
npm run lint
```

## Notes

This was built and iterated on quickly as a personal/hackathon project; it has not had a professional security or medical-content review. Earlier commit history contained hardcoded API keys, which have since been purged from git history — always generate your own keys rather than relying on anything in this repo.
