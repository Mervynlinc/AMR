export type Role = "lab_tech" | "clinician";

export interface User {
  id: string;
  name: string;
  facility: string;
}

export type SampleStatus = "pending_isolate" | "pending_ast" | "complete";

export type ASTResult = "S" | "I" | "R";

export interface ASTEntry {
  antibiotic: string;
  abbreviation: string;
  result: ASTResult | null;
}

export interface Sample {
  id: string;
  facility: string;
  specimenType: string;
  collectionDate: string;
  receivedDate: string;
  ageGroup: string;
  sex: string;
  patientType: string;
  ward: string;
  status: SampleStatus;
  astResults: ASTEntry[];
  isMDR: boolean;
}

export interface Report {
  id: string;
  sampleId: string;
  specimenType: string;
  patientDemographics: string;
  organism: string;
  isMRSA: boolean;
  astResults: ASTEntry[];
  localContext: string;
  authorisedBy: string;
  date: string;
}

export interface Prediction {
  antibiotic: string;
  abbreviation: string;
  currentRate: number;
  predictedRate: number;
  delta: number;
  historicalData: { year: string; rate: number }[];
}
