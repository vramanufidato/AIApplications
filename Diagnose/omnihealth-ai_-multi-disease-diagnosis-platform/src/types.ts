export interface DiagnosticResult {
  condition: string;
  probability: number;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  findings: string[];
  recommendations: string[];
}

export interface DiabetesData {
  pregnancies: number;
  glucose: number;
  bloodPressure: number;
  skinThickness: number;
  insulin: number;
  bmi: number;
  diabetesPedigree: number;
  age: number;
}

export interface MentalHealthData {
  age: number;
  gender: string;
  familyHistory: boolean;
  workInterfere: string;
  benefits: string;
  careOptions: string;
  wellnessProgram: string;
  seekHelp: string;
}

export interface OncologyData {
  radiusMean: number;
  textureMean: number;
  perimeterMean: number;
  areaMean: number;
  smoothnessMean: number;
  compactnessMean: number;
  concavityMean: number;
  concavePointsMean: number;
}
