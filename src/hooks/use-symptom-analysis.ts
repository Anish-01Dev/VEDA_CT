
import { useState } from "react";
import { SymptomResult } from "@/components/ai/types";
import { aiClient } from "@/lib/ai-client";
import { aiLogger } from "@/lib/ai-logger";

export function useSymptomAnalysis() {
  const [symptoms, setSymptoms] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SymptomResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      aiLogger.aiStart('Symptom Analysis Hook', 'Analysis', symptoms);
      const analysis = await aiClient.analyzeSymptoms(symptoms, 'en');
      
      // Convert AI response to SymptomResult format
      const result: SymptomResult = {
        condition: analysis.condition,
        confidence: analysis.confidence,
        severity: analysis.severity,
        description: analysis.description,
        suggestions: analysis.suggestions,
        reasoning: analysis.reasoning,
        emergency_contact: analysis.emergency_contact,
        follow_up: analysis.follow_up
      };
      
      setResults([result]);
      aiLogger.aiSuccess('Symptom Analysis Hook', 'Analysis', result);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Analysis failed';
      setError(errorMsg);
      aiLogger.aiError('Symptom Analysis Hook', 'Analysis', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    symptoms,
    setSymptoms,
    isListening,
    setIsListening,
    isAnalyzing,
    results,
    error,
    analyzeSymptoms
  };
}
