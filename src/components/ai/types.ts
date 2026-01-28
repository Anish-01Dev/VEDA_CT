export interface SymptomResult {
  condition: string;
  confidence: number;
  severity: "mild" | "moderate" | "emergency";
  description: string;
  suggestions: string[];
}