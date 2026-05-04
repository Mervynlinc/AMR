export type Role = "lab_tech" | "clinician";

export type UserRole = "lab_tech" | "clinician";
export type SampleStatus = "pending_isolate" | "pending_ast" | "complete";
export type ASTResult = "S" | "I" | "R";
export type SpecimenType =
  | "Blood Culture"
  | "Urine"
  | "Wound Swab"
  | "Sputum"
  | "CSF"
  | "Other";
export type AgeGroup =
  | "Neonate (0-28d)"
  | "Infant (1-12m)"
  | "Child (1-14y)"
  | "Adult (15-64y)"
  | "Elderly (65+y)";
export type PatientType = "Inpatient" | "Outpatient";
export type SexType = "M" | "F";
export type IDMethod =
  | "Culture Characteristics"
  | "Biochemical Tests"
  | "MALDI-TOF"
  | "VITEK 2";
export type TestMethod =
  | "Disc Diffusion (Kirby-Bauer)"
  | "Broth Microdilution (MIC)"
  | "VITEK 2";
export type FacilityType =
  | "Regional Referral Hospital"
  | "Teaching Hospital"
  | "Health Centre IV"
  | "Health Centre III"
  | "Private Clinic";
export type SyncOperation = "INSERT" | "UPDATE" | "DELETE";
export type SyncEntity =
  | "samples"
  | "isolates"
  | "susceptibility_tests"
  | "lab_reports";

export interface DatabaseUser {
  id: string;
  facility_id: string;
  staff_id: string;
  name: string;
  role: UserRole;
  password_hash: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface Facility {
  id: string;
  name: string;
  district: string;
  region: string;
  type: FacilityType;
  is_active: boolean;
  created_at: string;
}

export interface Antibiotic {
  id: string;
  name: string;
  abbreviation: string;
  drug_class: string;
  is_active: boolean;
  created_at: string;
}

export interface Sample {
  id: string;
  facility_id: string;
  created_by: string;
  sample_code: string;
  specimen_type: SpecimenType;
  collection_date: string;
  received_date: string;
  age_group: AgeGroup;
  sex: SexType;
  patient_type: PatientType;
  ward: string | null;
  status: SampleStatus;
  synced_at: string | null;
  created_at: string;
  facility?: Facility;
  created_by_user?: DatabaseUser;
}

export interface Isolate {
  id: string;
  sample_id: string;
  confirmed_by: string;
  organism: string;
  identification_method: IDMethod;
  growth_detected: boolean;
  is_mrsa: boolean;
  is_mdr: boolean;
  mdr_class_count: number;
  confirmed_at: string;
  sample?: Sample;
}

export interface SusceptibilityTest {
  id: string;
  isolate_id: string;
  antibiotic_id: string;
  recorded_by: string;
  test_method: TestMethod;
  zone_diameter_mm: number | null;
  mic_value: string | null;
  result: ASTResult;
  tested_at: string;
  antibiotic?: Antibiotic;
  isolate?: Isolate;
}

export interface LabReport {
  id: string;
  isolate_id: string;
  authorised_by: string;
  report_code: string;
  local_context: string | null;
  authorised_at: string;
  generated_at: string;
  isolate?: Isolate;
  authorised_by_user?: DatabaseUser;
}

export interface ResistanceAggregate {
  id: string;
  facility_id: string;
  antibiotic_id: string;
  year: number;
  month: number | null;
  total_tested: number;
  resistant_count: number;
  intermediate_count: number;
  susceptible_count: number;
  resistance_rate: number;
  computed_at: string;
  facility?: Facility;
  antibiotic?: Antibiotic;
}

export interface MLPrediction {
  id: string;
  antibiotic_id: string;
  facility_id: string | null;
  forecast_year: number;
  predicted_resistance_rate: number;
  upper_bound: number;
  lower_bound: number;
  mae: number | null;
  r2_score: number | null;
  model_version: string | null;
  generated_at: string;
  antibiotic?: Antibiotic;
  facility?: Facility;
}

export interface SyncLog {
  id: string;
  user_id: string;
  facility_id: string;
  entity_type: SyncEntity;
  entity_id: string;
  operation: SyncOperation;
  device_id: string | null;
  success: boolean;
  error_message: string | null;
  synced_at: string;
}

export interface CompleteReport {
  report_id: string;
  report_code: string;
  local_context: string | null;
  generated_at: string;
  sample_code: string;
  specimen_type: SpecimenType;
  collection_date: string;
  age_group: AgeGroup;
  sex: SexType;
  patient_type: PatientType;
  ward: string | null;
  facility_name: string;
  district: string;
  organism: string;
  identification_method: IDMethod;
  is_mrsa: boolean;
  is_mdr: boolean;
  mdr_class_count: number;
  authorised_by: string;
}

export interface ASTWithContext {
  test_id: string;
  isolate_id: string;
  result: ASTResult;
  zone_diameter_mm: number | null;
  mic_value: string | null;
  test_method: TestMethod;
  tested_at: string;
  antibiotic_name: string;
  abbreviation: string;
  drug_class: string;
  is_mrsa: boolean;
  is_mdr: boolean;
  sample_code: string;
  facility_id: string;
}

// Legacy types for backward compatibility
export interface ASTEntry {
  antibiotic: string;
  abbreviation: string;
  result: ASTResult | null;
}

export interface User {
  id: string;
  name: string;
  facility: string;
  staff_id?: string;
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
