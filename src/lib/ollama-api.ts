import LanguageDetector, { type SupportedLanguage } from './language-detection';

/**
 * Ollama Local API Client
 * Text model:   deepseek-r1:14b  (best reasoning/text quality)
 * Vision model: qwen3-vl:8b      (only vision-capable model available)
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';
const TEXT_MODEL = 'dolphin3:8b'; // local fallback only
const VISION_MODEL = 'llava:latest'; // fallback if no vision model

async function ollamaChat(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  imageBase64?: string
): Promise<string> {
  console.log(`🦙 Ollama: calling ${model}...`);

  const messages: any[] = [
    { role: 'system', content: systemPrompt }
  ];

  if (imageBase64) {
    messages.push({ role: 'user', content: userPrompt, images: [imageBase64] });
  } else {
    messages.push({ role: 'user', content: userPrompt });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { temperature: 0.3, num_predict: 1024 }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Ollama error ${response.status}: ${err}`);
    }

    const data = await response.json();
    console.log(`✅ Ollama: ${model} responded`);
    return data.message?.content || '';
  } finally {
    clearTimeout(timeout);
  }
}

function extractJSON(text: string): any {
  // Strip <think>...</think> blocks that deepseek-r1 emits
  const stripped = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

  // Try fenced code block first
  const fenced = stripped.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) return JSON.parse(fenced[1]);

  // Then bare JSON object
  const bare = stripped.match(/\{[\s\S]*\}/);
  if (bare) return JSON.parse(bare[0]);

  throw new Error('No JSON found in Ollama response');
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function ollamaAnalyzeSymptoms(symptoms: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are an expert doctor. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Analyze these symptoms: "${symptoms}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "condition": "most likely condition name",
  "confidence": 82,
  "severity": "mild|moderate|severe|emergency",
  "description": "2-3 sentence clinical assessment",
  "suggestions": ["action 1", "action 2", "action 3"],
  "reasoning": "brief medical reasoning",
  "emergency_contact": "advice on when to seek help",
  "follow_up": "follow-up recommendation"
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaGetHealthAdvice(query: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are an expert doctor. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Health question: "${query}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "advice": "clear, direct medical advice in 2-3 sentences",
  "confidence": 85,
  "reasoning": "brief medical reasoning",
  "sources": ["Medical Guidelines"],
  "contraindications": ["any relevant warnings"]
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzePrescription(text: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are a clinical pharmacist. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Analyze this prescription: "${text}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "medicines": [
    {
      "name": "medicine name",
      "dosage": "dose",
      "frequency": "how often",
      "duration": "how long",
      "instructions": "how to take",
      "side_effects": ["effect 1"],
      "warnings": ["warning 1"]
    }
  ],
  "doctor_name": "if mentioned",
  "date": "if mentioned",
  "confidence": 88,
  "language": "${language}"
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzeMisinformation(claim: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are a medical fact-checker. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Fact-check this health claim: "${claim}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "verdict": "true|false|misleading|unverified",
  "confidence": 90,
  "reasoning": "detailed explanation",
  "sources": ["WHO", "CDC"],
  "fact_check": "summary of findings",
  "recommendations": ["recommendation 1"]
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzeFirstAid(description: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are an emergency medicine doctor. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `First aid situation: "${description}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "injury_type": "type of injury",
  "severity": "mild|moderate|severe|critical",
  "confidence": 80,
  "immediate_actions": ["step 1", "step 2"],
  "treatment_steps": ["step 1", "step 2"],
  "warnings": ["warning 1"],
  "when_to_seek_help": "when to see a doctor"
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzeMood(message: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are a mental health counselor. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Analyze this emotional expression: "${message}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "tone": "stress|anxiety|burnout|positive|neutral|crisis",
  "analysis": "empathetic 2-3 sentence psychological assessment",
  "suggestions": ["CBT technique", "mindfulness exercise", "therapeutic activity"]
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzeLabReport(reportText: string, language = 'en'): Promise<any> {
  const langInstruction = LanguageDetector.getLanguageInstructions(language as SupportedLanguage);
  const system = `You are a clinical pathologist. ${langInstruction} Respond ONLY with valid JSON, no extra text.`;
  const user = `Analyze this lab report: "${reportText}"

IMPORTANT: All text values in the JSON must be written in ${LanguageDetector.getLanguageName(language as SupportedLanguage)}.

Return JSON:
{
  "analysis": "overall assessment in plain language",
  "keyFindings": ["finding 1", "finding 2"],
  "riskZones": ["risk 1", "risk 2"],
  "recommendations": ["recommendation 1", "recommendation 2"]
}`;

  const raw = await ollamaChat(TEXT_MODEL, system, user);
  return extractJSON(raw);
}

export async function ollamaAnalyzeImage(imageBase64: string, prompt: string): Promise<any> {
  const system = `You are a medical imaging expert. Respond ONLY with valid JSON, no extra text.`;
  const raw = await ollamaChat(VISION_MODEL, system, prompt, imageBase64);
  return extractJSON(raw);
}

export async function ollamaTestConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}
