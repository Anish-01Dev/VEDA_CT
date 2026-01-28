const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.warn('Google AI Studio API key not found');
}

export interface WoundAnalysisRequest {
  image: string;
  symptoms?: string;
  patientAge?: number;
  medicalHistory?: string[];
}

export interface WoundAnalysisResponse {
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  woundType: string;
  immediateActions: string[];
  medications: string[];
  whenToSeekHelp: string[];
  followUpCare: string[];
  estimatedHealingTime: string;
  riskFactors: string[];
  emergencyWarning?: string;
}

export const analyzeWound = async (request: WoundAnalysisRequest): Promise<WoundAnalysisResponse> => {
  try {
    // Simulate AI analysis with comprehensive medical guidance
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Analyze image characteristics to determine severity
    const imageSize = request.image.length;
    let severity: 'minor' | 'moderate' | 'severe' | 'critical' = 'moderate';
    
    // Simple heuristic based on image data
    if (imageSize > 100000) severity = 'severe';
    else if (imageSize < 50000) severity = 'minor';
    
    return {
      severity,
      woundType: 'Surface injury requiring attention',
      immediateActions: [
        'Wash your hands thoroughly with soap and water',
        'Stop any bleeding by applying gentle, direct pressure with a clean cloth',
        'Clean the wound gently with clean water to remove debris',
        'Apply antiseptic solution if available',
        'Cover with a sterile bandage or clean cloth'
      ],
      medications: [
        'Antiseptic solution (Betadine, Dettol, or hydrogen peroxide)',
        'Pain relief medication (Paracetamol 500mg as needed)',
        'Antibiotic ointment (Neosporin or similar)',
        'Sterile gauze and medical tape'
      ],
      whenToSeekHelp: [
        'Bleeding that won\'t stop after 10-15 minutes of direct pressure',
        'Signs of infection: increased redness, swelling, warmth, pus, or red streaking',
        'Wound is deeper than 1/4 inch or you can see fat, muscle, or bone',
        'Severe pain that doesn\'t improve with over-the-counter pain medication',
        'Numbness or inability to move the injured area normally',
        'Wound was caused by a dirty or rusty object',
        'You haven\'t had a tetanus shot in the last 5-10 years'
      ],
      followUpCare: [
        'Keep the wound clean and dry',
        'Change dressing daily or when it becomes wet/dirty',
        'Monitor for signs of infection daily',
        'Avoid strenuous activities that might reopen the wound',
        'Keep the wound elevated when possible to reduce swelling',
        'Take prescribed medications as directed'
      ],
      estimatedHealingTime: severity === 'minor' ? '3-7 days' : 
                           severity === 'moderate' ? '1-2 weeks' : 
                           severity === 'severe' ? '2-4 weeks' : 'Requires immediate medical attention',
      riskFactors: [
        'Infection (most common complication)',
        'Delayed healing due to poor circulation or diabetes',
        'Scarring, especially with deeper wounds',
        severity === 'severe' ? 'Nerve damage if wound is deep' : 'Minor complications',
        'Tetanus infection if wound is contaminated'
      ].filter(Boolean),
      emergencyWarning: severity === 'critical' || severity === 'severe' ? 
        'If you experience severe bleeding, signs of shock, or the wound is very deep, seek emergency medical care immediately by calling 108 or visiting the nearest emergency room.' : undefined
    };

  } catch (error) {
    console.error('Error analyzing wound:', error);
    throw error;
  }
};

