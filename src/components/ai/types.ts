export interface SymptomResult {
  condition: string;
  confidence: number;
  severity: "mild" | "moderate" | "severe" | "emergency";
  description: string;
  suggestions: string[];
  reasoning?: string;
  emergency_contact?: string;
  follow_up?: string;
}