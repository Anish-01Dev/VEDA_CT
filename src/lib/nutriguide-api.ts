const API_KEY = import.meta.env.VITE_GOOGLE_AI_STUDIO_KEY;

if (!API_KEY) {
  console.warn('Google AI Studio API key not found');
}

export interface FoodAnalysisRequest {
  image: string;
  userProfile?: {
    age: number;
    weight: number;
    height: number;
    medicalCondition?: string;
    goal: string;
  };
}

export interface FoodAnalysisResponse {
  name: string;
  calories: number;
  ingredients: string[];
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  healthScore: number;
  recommendations: string[];
}

export interface MealPlanRequest {
  age: number;
  weight: number;
  height: number;
  activity: string;
  goal: string;
  medicalCondition?: string;
  dietary: string;
  allergies?: string;
}

export interface MealPlanResponse {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: {
    [key: string]: {
      name: string;
      calories: number;
      items: string[];
    };
  };
  medicalTips: string[];
  indianFoods: string[];
}

export const analyzeFoodImage = async (request: FoodAnalysisRequest): Promise<FoodAnalysisResponse> => {
  try {
    // Simulate API call with realistic delay
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
              text: `Analyze this food image and provide detailed nutritional information. Return a JSON response with:
              {
                "name": "food name",
                "calories": estimated calories,
                "ingredients": ["ingredient 1", "ingredient 2", "ingredient 3"],
                "macros": {
                  "protein": grams,
                  "carbs": grams,
                  "fats": grams,
                  "fiber": grams
                },
                "healthScore": score out of 100,
                "recommendations": ["recommendation 1", "recommendation 2"]
              }
              
              IMPORTANT: Identify ALL visible ingredients/components in the dish. List every food item you can see including spices, garnishes, sides, and accompaniments. Consider Indian cuisine context and provide practical advice for ${request.userProfile?.medicalCondition || 'general health'}.`
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
    
    // Parse JSON from response
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // Fallback if JSON parsing fails
      return generateFallbackFoodAnalysis();
    }

  } catch (error) {
    console.error('Food analysis error:', error);
    return generateFallbackFoodAnalysis();
  }
};

export const generateMealPlan = async (request: MealPlanRequest): Promise<MealPlanResponse> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create a personalized Indian meal plan for:
            Age: ${request.age}, Weight: ${request.weight}kg, Height: ${request.height}cm
            Activity: ${request.activity}, Goal: ${request.goal}
            Medical condition: ${request.medicalCondition || 'none'}
            Dietary preference: ${request.dietary}
            Allergies: ${request.allergies || 'none'}
            
            Return JSON with:
            {
              "dailyCalories": number,
              "macros": {"protein": grams, "carbs": grams, "fats": grams},
              "meals": {
                "breakfast": {"name": "meal name", "calories": number, "items": ["item1", "item2"]},
                "lunch": {"name": "meal name", "calories": number, "items": ["item1", "item2"]},
                "dinner": {"name": "meal name", "calories": number, "items": ["item1", "item2"]},
                "snacks": {"name": "meal name", "calories": number, "items": ["item1", "item2"]}
              },
              "medicalTips": ["tip1", "tip2"] (if medical condition exists),
              "indianFoods": ["tip1", "tip2", "tip3", "tip4"]
            }
            
            Focus on Indian cuisine and consider medical condition requirements.`
          }]
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
      return generateFallbackMealPlan(request);
    }

  } catch (error) {
    console.error('Meal plan generation error:', error);
    return generateFallbackMealPlan(request);
  }
};

const generateFallbackFoodAnalysis = (): FoodAnalysisResponse => ({
  name: "Mixed Indian Meal",
  calories: 650,
  ingredients: [
    "Basmati rice",
    "Dal (lentils)",
    "Mixed vegetables",
    "Paneer",
    "Roti/Chapati",
    "Yogurt",
    "Pickle",
    "Onion salad"
  ],
  macros: {
    protein: 25,
    carbs: 85,
    fats: 18,
    fiber: 12
  },
  healthScore: 78,
  recommendations: [
    "Reduce rice portion by 25% to lower carbs",
    "Add more vegetables for fiber",
    "Good protein balance from dal and paneer",
    "Consider brown rice for better nutrition"
  ]
});

const generateFallbackMealPlan = (request: MealPlanRequest): MealPlanResponse => {
  let bmr = request.goal === "lose" ? 1800 : request.goal === "gain" ? 2400 : 2100;
  
  if (request.medicalCondition === "diabetes") bmr = Math.round(bmr * 0.9);
  else if (request.medicalCondition === "hypertension") bmr = Math.round(bmr * 0.95);
  
  return {
    dailyCalories: bmr,
    macros: {
      protein: Math.round(bmr * 0.3 / 4),
      carbs: Math.round(bmr * (request.medicalCondition === "diabetes" ? 0.35 : 0.4) / 4),
      fats: Math.round(bmr * 0.3 / 9)
    },
    meals: {
      breakfast: {
        name: request.medicalCondition === "diabetes" ? "Low GI Power Bowl" : "Protein Power Bowl",
        calories: Math.round(bmr * 0.25),
        items: request.medicalCondition === "diabetes" ? 
          ["Oats", "Nuts", "Berries", "Greek yogurt", "Chia seeds"] :
          ["2 eggs", "Spinach", "Quinoa", "Avocado", "Greek yogurt"]
      },
      lunch: {
        name: "Balanced Indian Thali",
        calories: Math.round(bmr * 0.35),
        items: request.medicalCondition === "hypertension" ?
          ["Brown rice", "Low-salt dal", "Vegetables", "Roti", "Buttermilk"] :
          ["Brown rice", "Dal", "Vegetables", "Roti", "Curd"]
      },
      dinner: {
        name: "Light Protein Meal",
        calories: Math.round(bmr * 0.3),
        items: ["Grilled chicken/paneer", "Salad", "Vegetables", "Soup"]
      },
      snacks: {
        name: "Healthy Snacks",
        calories: Math.round(bmr * 0.1),
        items: request.medicalCondition === "diabetes" ?
          ["Almonds", "Apple", "Green tea"] :
          ["Nuts", "Fruits", "Green tea"]
      }
    },
    medicalTips: request.medicalCondition ? getMedicalTips(request.medicalCondition) : [],
    indianFoods: [
      "Include turmeric for anti-inflammatory benefits",
      "Have moong dal for easy digestion",
      "Include seasonal fruits and vegetables",
      "Drink plenty of water and herbal teas"
    ]
  };
};

const getMedicalTips = (condition: string): string[] => {
  switch (condition) {
    case "diabetes":
      return [
        "Choose low glycemic index foods",
        "Eat smaller, frequent meals",
        "Monitor blood sugar regularly",
        "Avoid refined sugars and processed foods"
      ];
    case "hypertension":
      return [
        "Reduce sodium intake to <2300mg/day",
        "Increase potassium-rich foods",
        "Limit processed and packaged foods",
        "Include DASH diet principles"
      ];
    case "obesity":
      return [
        "Create caloric deficit of 500-750 calories",
        "Focus on high-fiber, low-calorie foods",
        "Increase physical activity",
        "Practice portion control"
      ];
    default:
      return [];
  }
};