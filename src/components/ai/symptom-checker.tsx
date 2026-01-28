
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Search, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const commonSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Chest pain",
  "Abdominal pain",
  "Nausea",
  "Dizziness",
  "Fatigue",
  "Shortness of breath",
  "Joint pain",
];

const severityColors: Record<string, string> = {
  mild: "bg-green-500",
  moderate: "bg-yellow-400",
  severe: "bg-red-500",
  emergency: "bg-red-700",
};

export function SymptomChecker({ className }: { className?: string }) {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [diagnosis, setDiagnosis] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const addCustomSymptom = () => {
    if (customSymptom.trim() && !selectedSymptoms.includes(customSymptom.trim())) {
      setSelectedSymptoms([...selectedSymptoms, customSymptom.trim()]);
      setCustomSymptom("");
    }
  };

  const analyzeSymptoms = async () => {
    if (selectedSymptoms.length === 0) {
      alert("Please select at least one symptom");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const mockDiagnosis = {
        severity: selectedSymptoms.length > 3 ? "moderate" : "mild",
        conditions: [
          {
            name: "Common Cold",
            probability: 75,
            description: "Viral infection of upper respiratory tract",
          },
          {
            name: "Flu",
            probability: 60,
            description: "Influenza viral infection",
          },
        ],
        recommendations: [
          "Rest and stay hydrated",
          "Take paracetamol for fever",
          "Consult doctor if symptoms persist",
        ],
      };
      setDiagnosis(mockDiagnosis);
      setLoading(false);
    }, 2000);
  };

  const getSeverityColor = (severity: string) => severityColors[severity] || severityColors.mild;

  return (
    <Card className={cn("overflow-hidden relative bg-gradient-to-br from-card via-card/95 to-card/80 backdrop-blur-sm border-border/50 shadow-2xl card-hover", className)}>
      <CardHeader className="relative z-20 px-4 sm:px-6 pb-3">
        <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center shadow-md">
            <Search className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="text-foreground">AI Symptom Checker</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8 relative z-20 px-4 sm:px-6 pb-4 sm:pb-6">
        {!diagnosis ? (
          <>
            <div>
              <div className="mb-2 font-semibold text-muted-foreground">Select your symptoms</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {commonSymptoms.map((symptom) => (
                  <Button
                    key={symptom}
                    type="button"
                    variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-medium transition-all",
                      selectedSymptoms.includes(symptom) && "ring-2 ring-primary"
                    )}
                    onClick={() => toggleSymptom(symptom)}
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Add custom symptom..."
                  value={customSymptom}
                  onChange={(e) => setCustomSymptom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addCustomSymptom();
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addCustomSymptom} disabled={!customSymptom.trim()}>
                  Add
                </Button>
              </div>
              {selectedSymptoms.length > 0 && (
                <div className="mb-4">
                  <div className="font-semibold text-muted-foreground mb-1">
                    Selected symptoms ({selectedSymptoms.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSymptoms.map((symptom) => (
                      <div key={symptom} className="flex items-center gap-1 px-3 py-1 bg-primary/10 rounded-full text-primary text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        {symptom}
                        <button
                          className="ml-1 text-xs text-red-500 hover:text-red-700"
                          onClick={() => toggleSymptom(symptom)}
                          aria-label="Remove symptom"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <Button
                className="w-full py-3 mt-2 text-base font-semibold rounded-xl"
                onClick={analyzeSymptoms}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze Symptoms"}
              </Button>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <span className={cn("w-3 h-3 rounded-full", getSeverityColor(diagnosis.severity))} />
              <span className="font-semibold text-foreground">Severity: {diagnosis.severity.toUpperCase()}</span>
            </div>
            <div>
              <div className="font-semibold mb-2 text-primary">Possible Conditions</div>
              <div className="grid gap-3">
                {diagnosis.conditions.map((condition: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-muted/60 border border-border/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{condition.name}</span>
                      <span className="text-xs text-muted-foreground">{condition.probability}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{condition.description}</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2 text-primary">Recommendations</div>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {diagnosis.recommendations.map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={() => {
                setDiagnosis(null);
                setSelectedSymptoms([]);
              }}
            >
              New Check
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
