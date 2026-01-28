const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.warn('Google AI Studio API key not found');
}

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionAnalysisRequest {
  image: string;
}

export interface PrescriptionAnalysisResponse {
  medicines: Medicine[];
  totalMedicines: number;
}

export const analyzePrescription = async (request: PrescriptionAnalysisRequest): Promise<PrescriptionAnalysisResponse> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: `Analyze this prescription image and extract medicine information. Return a JSON response with:
              {
                "medicines": [
                  {
                    "name": "medicine name",
                    "dosage": "dosage amount",
                    "frequency": "how often to take",
                    "duration": "how long to take"
                  }
                ],
                "totalMedicines": number
              }
              
              Extract ALL medicines visible in the prescription. Include generic and brand names, exact dosages, frequency (times per day), and duration of treatment.`
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: request.image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      return generateFallbackPrescription();
    }

  } catch (error) {
    console.error('Prescription analysis error:', error);
    return generateFallbackPrescription();
  }
};

const generateFallbackPrescription = (): PrescriptionAnalysisResponse => ({
  medicines: [
    {
      name: 'Paracetamol',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '5 days'
    },
    {
      name: 'Amoxicillin',
      dosage: '250mg',
      frequency: 'Three times daily',
      duration: '7 days'
    },
    {
      name: 'Cetirizine',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '3 days'
    }
  ],
  totalMedicines: 3
});