
import { useState } from "react";
import { SymptomResult } from "@/components/ai/types";
import { generateMockResults } from "@/lib/symptom-analysis-utils";

export function useSymptomAnalysis() {
  const [symptoms, setSymptoms] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<SymptomResult[]>([]);

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) return;
    
    setIsAnalyzing(true);
    
    // Enhanced AI analysis with more comprehensive results
    setTimeout(() => {
      const mockResults = generateMockResults(symptoms);
      setResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  return {
    symptoms,
    setSymptoms,
    isListening,
    setIsListening,
    isAnalyzing,
    results,
    analyzeSymptoms
  };
}
