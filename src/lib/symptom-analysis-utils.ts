
import { SymptomResult } from "@/components/ai/types";

export function generateMockResults(symptoms: string): SymptomResult[] {
  const symptomLower = symptoms.toLowerCase();
  let mockResults: SymptomResult[] = [];

  // Fever-related conditions
  if (symptomLower.includes("fever") || symptomLower.includes("temperature")) {
    mockResults.push({
      condition: "Viral Infection",
      confidence: 85,
      severity: symptomLower.includes("high") ? "moderate" : "mild",
      description: "High fever suggests a viral infection. Monitor temperature closely.",
      suggestions: [
        "Rest and stay hydrated",
        "Take paracetamol for fever",
        "Consult doctor if fever persists >3 days",
        "Isolate to prevent spread"
      ]
    });
  }

  // Respiratory symptoms
  if (symptomLower.includes("cough") || symptomLower.includes("breathing") || symptomLower.includes("chest")) {
    mockResults.push({
      condition: "Respiratory Infection",
      confidence: 75,
      severity: symptomLower.includes("difficulty") ? "moderate" : "mild",
      description: "Respiratory symptoms require attention, especially if breathing is affected.",
      suggestions: [
        "Steam inhalation 2-3 times daily",
        "Warm saltwater gargling",
        "Avoid cold drinks and foods",
        "Seek immediate care if breathing difficulty"
      ]
    });
  }

  // Headache-related
  if (symptomLower.includes("headache") || symptomLower.includes("head")) {
    mockResults.push({
      condition: "Tension Headache",
      confidence: 70,
      severity: symptomLower.includes("severe") ? "moderate" : "mild",
      description: "Common tension headache, often stress or dehydration related.",
      suggestions: [
        "Rest in a dark, quiet room",
        "Apply cold compress to forehead",
        "Stay hydrated",
        "Practice relaxation techniques"
      ]
    });
  }

  // Stomach issues
  if (symptomLower.includes("stomach") || symptomLower.includes("nausea") || symptomLower.includes("vomit")) {
    mockResults.push({
      condition: "Gastroenteritis",
      confidence: 80,
      severity: "moderate",
      description: "Stomach upset likely due to food or viral gastroenteritis.",
      suggestions: [
        "BRAT diet (Banana, Rice, Apple, Toast)",
        "Small frequent meals",
        "ORS for hydration",
        "Avoid dairy and spicy foods"
      ]
    });
  }

  // Emergency symptoms
  if (symptomLower.includes("chest pain") || symptomLower.includes("difficulty breathing") || symptomLower.includes("unconscious")) {
    mockResults.push({
      condition: "Medical Emergency",
      confidence: 95,
      severity: "emergency",
      description: "These symptoms require immediate medical attention.",
      suggestions: [
        "🚨 CALL EMERGENCY SERVICES IMMEDIATELY",
        "Do not delay seeking medical care",
        "Have someone stay with you",
        "Keep emergency contacts ready"
      ]
    });
  }

  // Default general condition if no specific symptoms detected
  if (mockResults.length === 0) {
    mockResults = [
      {
        condition: "General Health Assessment",
        confidence: 60,
        severity: "mild",
        description: "Based on your symptoms, here's a general health assessment.",
        suggestions: [
          "Monitor symptoms for 24-48 hours",
          "Maintain good hygiene",
          "Stay hydrated and rest well",
          "Consult healthcare provider if symptoms worsen"
        ]
      }
    ];
  }

  // Add general wellness advice
  mockResults.push({
    condition: "General Wellness Tips",
    confidence: 100,
    severity: "mild",
    description: "Always maintain good health practices.",
    suggestions: [
      "Regular hand washing",
      "Balanced diet with fruits & vegetables",
      "Regular exercise and adequate sleep",
      "Stay updated with vaccinations"
    ]
  });
  
  return mockResults;
}
