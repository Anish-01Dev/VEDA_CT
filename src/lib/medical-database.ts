// Comprehensive Medical Database for Enhanced Symptom Analysis
export interface MedicalCondition {
  id: string;
  name: string;
  icd10: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe' | 'emergency';
  riskFactors: string[];
  complications: string[];
  treatments: string[];
  medications: string[];
  lifestyle: string[];
  emergency: boolean;
  category: string;
  prevalence: 'common' | 'uncommon' | 'rare';
  ageGroups: string[];
  gender: 'all' | 'male' | 'female';
  pregnancySafe: boolean;
}

export interface SymptomCluster {
  symptoms: string[];
  conditions: string[];
  urgency: 'immediate' | 'urgent' | 'routine';
  redFlags: string[];
}

export interface Medication {
  name: string;
  genericName: string;
  category: string;
  dosage: string;
  sideEffects: string[];
  contraindications: string[];
  interactions: string[];
  pregnancyCategory: string;
  breastfeeding: boolean;
  otc: boolean;
  cost: 'low' | 'medium' | 'high';
}

// Comprehensive Medical Conditions Database
export const MEDICAL_CONDITIONS: MedicalCondition[] = [
  // Respiratory Conditions
  {
    id: 'resp_001',
    name: 'Upper Respiratory Tract Infection',
    icd10: 'J06.9',
    symptoms: ['fever', 'cough', 'sore throat', 'runny nose', 'congestion', 'fatigue', 'body aches'],
    severity: 'moderate',
    riskFactors: ['smoking', 'weakened immune system', 'exposure to sick people'],
    complications: ['sinusitis', 'ear infection', 'bronchitis', 'pneumonia'],
    treatments: ['rest', 'hydration', 'symptomatic relief'],
    medications: ['paracetamol', 'ibuprofen', 'decongestants'],
    lifestyle: ['adequate sleep', 'healthy diet', 'avoid smoking'],
    emergency: false,
    category: 'respiratory',
    prevalence: 'common',
    ageGroups: ['all'],
    gender: 'all',
    pregnancySafe: true
  },
  {
    id: 'resp_002',
    name: 'Bronchitis',
    icd10: 'J20.9',
    symptoms: ['persistent cough', 'mucus production', 'chest discomfort', 'fatigue', 'mild fever'],
    severity: 'moderate',
    riskFactors: ['smoking', 'air pollution', 'weakened immune system'],
    complications: ['pneumonia', 'chronic bronchitis'],
    treatments: ['rest', 'hydration', 'cough management'],
    medications: ['bronchodilators', 'cough suppressants', 'antibiotics if bacterial'],
    lifestyle: ['quit smoking', 'avoid irritants', 'humidifier use'],
    emergency: false,
    category: 'respiratory',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: true
  },
  {
    id: 'resp_003',
    name: 'Pneumonia',
    icd10: 'J18.9',
    symptoms: ['high fever', 'severe cough', 'difficulty breathing', 'chest pain', 'fatigue', 'confusion'],
    severity: 'severe',
    riskFactors: ['age >65', 'smoking', 'chronic diseases', 'weakened immune system'],
    complications: ['septic shock', 'respiratory failure', 'pleural effusion'],
    treatments: ['antibiotics', 'oxygen therapy', 'hospitalization if severe'],
    medications: ['antibiotics', 'pain relievers', 'oxygen'],
    lifestyle: ['vaccination', 'good hygiene', 'healthy lifestyle'],
    emergency: true,
    category: 'respiratory',
    prevalence: 'common',
    ageGroups: ['elderly', 'adult'],
    gender: 'all',
    pregnancySafe: false
  },

  // Cardiovascular Conditions
  {
    id: 'card_001',
    name: 'Hypertension',
    icd10: 'I10',
    symptoms: ['headache', 'dizziness', 'shortness of breath', 'chest pain', 'vision problems'],
    severity: 'moderate',
    riskFactors: ['age', 'family history', 'obesity', 'salt intake', 'stress'],
    complications: ['heart attack', 'stroke', 'kidney disease', 'eye damage'],
    treatments: ['lifestyle changes', 'medication'],
    medications: ['ACE inhibitors', 'beta blockers', 'diuretics', 'calcium channel blockers'],
    lifestyle: ['low salt diet', 'exercise', 'weight management', 'stress reduction'],
    emergency: false,
    category: 'cardiovascular',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: false
  },
  {
    id: 'card_002',
    name: 'Myocardial Infarction',
    icd10: 'I21.9',
    symptoms: ['severe chest pain', 'shortness of breath', 'nausea', 'sweating', 'anxiety', 'pain radiating to arm'],
    severity: 'emergency',
    riskFactors: ['age', 'smoking', 'diabetes', 'hypertension', 'high cholesterol'],
    complications: ['heart failure', 'arrhythmias', 'cardiac arrest'],
    treatments: ['immediate medical attention', 'thrombolytics', 'angioplasty'],
    medications: ['aspirin', 'nitroglycerin', 'morphine', 'thrombolytics'],
    lifestyle: ['cardiac rehabilitation', 'lifestyle changes'],
    emergency: true,
    category: 'cardiovascular',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: false
  },

  // Gastrointestinal Conditions
  {
    id: 'gi_001',
    name: 'Gastroenteritis',
    icd10: 'A09',
    symptoms: ['diarrhea', 'vomiting', 'abdominal cramps', 'fever', 'dehydration'],
    severity: 'moderate',
    riskFactors: ['contaminated food/water', 'poor hygiene', 'weakened immune system'],
    complications: ['severe dehydration', 'electrolyte imbalance'],
    treatments: ['rehydration', 'rest', 'bland diet'],
    medications: ['oral rehydration solution', 'anti-emetics', 'probiotics'],
    lifestyle: ['good hygiene', 'safe food handling'],
    emergency: false,
    category: 'gastrointestinal',
    prevalence: 'common',
    ageGroups: ['all'],
    gender: 'all',
    pregnancySafe: true
  },
  {
    id: 'gi_002',
    name: 'Peptic Ulcer Disease',
    icd10: 'K27.9',
    symptoms: ['burning stomach pain', 'bloating', 'nausea', 'loss of appetite', 'weight loss'],
    severity: 'moderate',
    riskFactors: ['H. pylori infection', 'NSAID use', 'smoking', 'alcohol'],
    complications: ['bleeding', 'perforation', 'obstruction'],
    treatments: ['acid suppression', 'antibiotics if H. pylori'],
    medications: ['proton pump inhibitors', 'H2 blockers', 'antibiotics'],
    lifestyle: ['avoid NSAIDs', 'quit smoking', 'limit alcohol'],
    emergency: false,
    category: 'gastrointestinal',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: false
  },

  // Neurological Conditions
  {
    id: 'neuro_001',
    name: 'Migraine',
    icd10: 'G43.909',
    symptoms: ['severe headache', 'nausea', 'vomiting', 'light sensitivity', 'sound sensitivity'],
    severity: 'moderate',
    riskFactors: ['family history', 'stress', 'hormonal changes', 'certain foods'],
    complications: ['chronic migraine', 'medication overuse'],
    treatments: ['pain management', 'lifestyle changes', 'preventive medications'],
    medications: ['triptans', 'NSAIDs', 'anti-emetics', 'preventive medications'],
    lifestyle: ['stress management', 'regular sleep', 'avoid triggers'],
    emergency: false,
    category: 'neurological',
    prevalence: 'common',
    ageGroups: ['adult'],
    gender: 'female',
    pregnancySafe: false
  },
  {
    id: 'neuro_002',
    name: 'Stroke',
    icd10: 'I63.9',
    symptoms: ['sudden numbness', 'confusion', 'difficulty speaking', 'vision problems', 'severe headache'],
    severity: 'emergency',
    riskFactors: ['age', 'hypertension', 'diabetes', 'smoking', 'atrial fibrillation'],
    complications: ['paralysis', 'speech problems', 'cognitive impairment'],
    treatments: ['immediate medical attention', 'thrombolytics', 'rehabilitation'],
    medications: ['thrombolytics', 'antiplatelets', 'anticoagulants'],
    lifestyle: ['risk factor management', 'rehabilitation'],
    emergency: true,
    category: 'neurological',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: false
  },

  // Endocrine Conditions
  {
    id: 'endo_001',
    name: 'Diabetes Mellitus Type 2',
    icd10: 'E11.9',
    symptoms: ['increased thirst', 'frequent urination', 'fatigue', 'blurred vision', 'slow healing'],
    severity: 'moderate',
    riskFactors: ['obesity', 'family history', 'sedentary lifestyle', 'age'],
    complications: ['heart disease', 'kidney disease', 'eye damage', 'neuropathy'],
    treatments: ['lifestyle changes', 'medication', 'blood sugar monitoring'],
    medications: ['metformin', 'sulfonylureas', 'insulin'],
    lifestyle: ['diet control', 'exercise', 'weight management'],
    emergency: false,
    category: 'endocrine',
    prevalence: 'common',
    ageGroups: ['adult', 'elderly'],
    gender: 'all',
    pregnancySafe: false
  },

  // Mental Health Conditions
  {
    id: 'mental_001',
    name: 'Major Depressive Disorder',
    icd10: 'F32.9',
    symptoms: ['persistent sadness', 'loss of interest', 'fatigue', 'sleep changes', 'appetite changes'],
    severity: 'moderate',
    riskFactors: ['family history', 'stress', 'trauma', 'medical conditions'],
    complications: ['suicide', 'substance abuse', 'relationship problems'],
    treatments: ['psychotherapy', 'medication', 'lifestyle changes'],
    medications: ['SSRIs', 'SNRIs', 'atypical antidepressants'],
    lifestyle: ['exercise', 'social support', 'stress management'],
    emergency: false,
    category: 'mental_health',
    prevalence: 'common',
    ageGroups: ['adult'],
    gender: 'all',
    pregnancySafe: false
  },
  {
    id: 'mental_002',
    name: 'Generalized Anxiety Disorder',
    icd10: 'F41.1',
    symptoms: ['excessive worry', 'restlessness', 'fatigue', 'concentration problems', 'sleep issues'],
    severity: 'moderate',
    riskFactors: ['family history', 'stress', 'trauma', 'personality'],
    complications: ['depression', 'substance abuse', 'physical health problems'],
    treatments: ['psychotherapy', 'medication', 'lifestyle changes'],
    medications: ['SSRIs', 'benzodiazepines', 'buspirone'],
    lifestyle: ['relaxation techniques', 'exercise', 'stress management'],
    emergency: false,
    category: 'mental_health',
    prevalence: 'common',
    ageGroups: ['adult'],
    gender: 'all',
    pregnancySafe: false
  }
];

// Symptom Clusters for Pattern Recognition
export const SYMPTOM_CLUSTERS: SymptomCluster[] = [
  {
    symptoms: ['chest pain', 'shortness of breath', 'sweating', 'nausea'],
    conditions: ['myocardial_infarction', 'angina', 'pneumonia'],
    urgency: 'immediate',
    redFlags: ['severe chest pain', 'pain radiating to arm', 'cold sweat']
  },
  {
    symptoms: ['sudden numbness', 'confusion', 'difficulty speaking', 'severe headache'],
    conditions: ['stroke', 'transient_ischemic_attack'],
    urgency: 'immediate',
    redFlags: ['one-sided weakness', 'facial drooping', 'speech problems']
  },
  {
    symptoms: ['high fever', 'severe cough', 'difficulty breathing', 'chest pain'],
    conditions: ['pneumonia', 'bronchitis', 'covid19'],
    urgency: 'urgent',
    redFlags: ['respiratory distress', 'blue lips', 'confusion']
  },
  {
    symptoms: ['severe abdominal pain', 'nausea', 'vomiting', 'fever'],
    conditions: ['appendicitis', 'cholecystitis', 'pancreatitis'],
    urgency: 'urgent',
    redFlags: ['rigid abdomen', 'rebound tenderness', 'high fever']
  }
];

// Comprehensive Medication Database
export const MEDICATIONS: Medication[] = [
  {
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'Analgesic',
    dosage: '500-1000mg every 4-6 hours',
    sideEffects: ['nausea', 'liver damage in high doses', 'allergic reactions'],
    contraindications: ['liver disease', 'alcohol abuse'],
    interactions: ['warfarin', 'alcohol'],
    pregnancyCategory: 'B',
    breastfeeding: true,
    otc: true,
    cost: 'low'
  },
  {
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    category: 'NSAID',
    dosage: '200-400mg every 4-6 hours',
    sideEffects: ['stomach upset', 'ulcers', 'kidney problems'],
    contraindications: ['stomach ulcers', 'kidney disease', 'pregnancy 3rd trimester'],
    interactions: ['aspirin', 'blood thinners'],
    pregnancyCategory: 'C',
    breastfeeding: true,
    otc: true,
    cost: 'low'
  },
  {
    name: 'Metformin',
    genericName: 'Metformin',
    category: 'Antidiabetic',
    dosage: '500-2000mg daily',
    sideEffects: ['nausea', 'diarrhea', 'lactic acidosis'],
    contraindications: ['kidney disease', 'heart failure'],
    interactions: ['alcohol', 'contrast dye'],
    pregnancyCategory: 'B',
    breastfeeding: true,
    otc: false,
    cost: 'low'
  }
];

// Emergency Conditions Requiring Immediate Attention
export const EMERGENCY_CONDITIONS = [
  'myocardial_infarction',
  'stroke',
  'pneumonia',
  'appendicitis',
  'severe_trauma',
  'anaphylaxis',
  'severe_bleeding',
  'cardiac_arrest'
];

// Utility Functions
export function findConditionsBySymptoms(symptoms: string[]): MedicalCondition[] {
  const matchedConditions: MedicalCondition[] = [];
  
  for (const condition of MEDICAL_CONDITIONS) {
    const symptomMatch = symptoms.filter(symptom => 
      condition.symptoms.some(conditionSymptom => 
        conditionSymptom.toLowerCase().includes(symptom.toLowerCase()) ||
        symptom.toLowerCase().includes(conditionSymptom.toLowerCase())
      )
    );
    
    if (symptomMatch.length >= Math.ceil(condition.symptoms.length * 0.3)) {
      matchedConditions.push(condition);
    }
  }
  
  return matchedConditions.sort((a, b) => {
    // Prioritize emergency conditions
    if (a.emergency && !b.emergency) return -1;
    if (!a.emergency && b.emergency) return 1;
    
    // Then by severity
    const severityOrder = { emergency: 0, severe: 1, moderate: 2, mild: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function getEmergencyAdvice(condition: MedicalCondition): string {
  if (condition.emergency) {
    return `🚨 EMERGENCY: ${condition.name.toUpperCase()} requires immediate medical attention. Call emergency services (108) immediately. Do not delay seeking medical care.`;
  }
  
  if (condition.severity === 'severe') {
    return `⚠️ URGENT: ${condition.name} requires prompt medical evaluation. Contact your healthcare provider within 24 hours.`;
  }
  
  return `📋 ROUTINE: ${condition.name} can be managed with appropriate care. Schedule an appointment with your healthcare provider.`;
}

export function getTreatmentPlan(condition: MedicalCondition): string {
  return `
Treatment Plan for ${condition.name}:

1. Immediate Actions:
   ${condition.treatments.map(t => `• ${t}`).join('\n   ')}

2. Medications (if prescribed):
   ${condition.medications.map(m => `• ${m}`).join('\n   ')}

3. Lifestyle Changes:
   ${condition.lifestyle.map(l => `• ${l}`).join('\n   ')}

4. Follow-up:
   • Monitor symptoms
   • Complete prescribed treatment
   • Contact healthcare provider if symptoms worsen
  `.trim();
}
