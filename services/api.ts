import axios from "axios";
import useAuthStore from "../store/auth";
import { ASTEntry, Prediction, Report, Sample } from "../types/index";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_AMR_API_BASE_URL ?? "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);

const delay = () => new Promise((resolve) => setTimeout(resolve, 300));

export default api;

export async function getSamples(): Promise<Sample[]> {
  await delay();
  return [
    {
      id: "SMP-1001",
      facility: "General Hospital",
      specimenType: "Blood Culture",
      collectionDate: "2026-04-20",
      receivedDate: "2026-04-21",
      ageGroup: "Adult",
      sex: "M",
      patientType: "Inpatient",
      ward: "ICU",
      status: "pending_isolate",
      astResults: [],
      isMDR: false,
    },
    {
      id: "SMP-1002",
      facility: "City Clinic",
      specimenType: "Urine",
      collectionDate: "2026-04-21",
      receivedDate: "2026-04-22",
      ageGroup: "Pediatric",
      sex: "F",
      patientType: "Outpatient",
      ward: "OPD",
      status: "pending_ast",
      astResults: [],
      isMDR: false,
    },
    {
      id: "SMP-1003",
      facility: "General Hospital",
      specimenType: "Wound Swab",
      collectionDate: "2026-04-19",
      receivedDate: "2026-04-20",
      ageGroup: "Senior",
      sex: "M",
      patientType: "Inpatient",
      ward: "Surgical",
      status: "complete",
      astResults: [],
      isMDR: true,
    },
  ];
}

export async function createSample(data: Partial<Sample>): Promise<Sample> {
  await delay();
  const newSample: Sample = {
    id: "SMP-" + Date.now(),
    facility: data.facility || "Unknown Facility",
    specimenType: data.specimenType || "Unknown Specimen",
    collectionDate: data.collectionDate || new Date().toISOString(),
    receivedDate: data.receivedDate || new Date().toISOString(),
    ageGroup: data.ageGroup || "Unknown",
    sex: data.sex || "Unknown",
    patientType: data.patientType || "Unknown",
    ward: data.ward || "Unknown",
    status: data.status || "pending_isolate",
    astResults: data.astResults || [],
    isMDR: data.isMDR || false,
    ...data,
  } as Sample;
  return newSample;
}

export async function saveAST(
  sampleId: string,
  results: ASTEntry[],
): Promise<void> {
  await delay();
}

export async function getReports(): Promise<Report[]> {
  await delay();

  const mockAstResults1: ASTEntry[] = [
    {
      antibiotic: "Penicillin",
      abbreviation: "PEN",
      zoneDiameter: 12,
      result: "R",
    },
    {
      antibiotic: "Cefoxitin",
      abbreviation: "FOX",
      zoneDiameter: 18,
      result: "R",
    },
    {
      antibiotic: "Erythromycin",
      abbreviation: "ERY",
      zoneDiameter: 14,
      result: "I",
    },
    {
      antibiotic: "Clindamycin",
      abbreviation: "CLI",
      zoneDiameter: 22,
      result: "S",
    },
    {
      antibiotic: "Vancomycin",
      abbreviation: "VAN",
      zoneDiameter: 17,
      result: "S",
    },
    {
      antibiotic: "Linezolid",
      abbreviation: "LNZ",
      zoneDiameter: 25,
      result: "S",
    },
  ];

  const mockAstResults2: ASTEntry[] = [
    {
      antibiotic: "Ampicillin",
      abbreviation: "AMP",
      zoneDiameter: 20,
      result: "S",
    },
    {
      antibiotic: "Amoxicillin-Clavulanate",
      abbreviation: "AMC",
      zoneDiameter: 22,
      result: "S",
    },
    {
      antibiotic: "Ceftriaxone",
      abbreviation: "CRO",
      zoneDiameter: 25,
      result: "S",
    },
    {
      antibiotic: "Ciprofloxacin",
      abbreviation: "CIP",
      zoneDiameter: 15,
      result: "I",
    },
    {
      antibiotic: "Gentamicin",
      abbreviation: "GEN",
      zoneDiameter: 18,
      result: "S",
    },
    {
      antibiotic: "Trimethoprim-Sulfamethoxazole",
      abbreviation: "SXT",
      zoneDiameter: 26,
      result: "S",
    },
  ];

  return [
    {
      id: "REP-001",
      sampleId: "SMP-1003",
      specimenType: "Blood Culture",
      patientDemographics: "Adult Male",
      organism: "Staphylococcus aureus",
      isMRSA: true,
      astResults: mockAstResults1,
      localContext: "High MRSA prevalence in ICU",
      authorisedBy: "Dr. Smith",
      date: "2026-04-20",
    },
    {
      id: "REP-002",
      sampleId: "SMP-1004",
      specimenType: "Wound Swab",
      patientDemographics: "Senior Female",
      organism: "Escherichia coli",
      isMRSA: false,
      astResults: mockAstResults2,
      localContext: "Community acquired",
      authorisedBy: "Dr. Jones",
      date: "2026-04-21",
    },
  ];
}

export async function getReport(reportId: string): Promise<Report> {
  const reports = await getReports();
  return reports[0];
}

export async function getPredictions(): Promise<Prediction[]> {
  await delay();
  return [
    {
      antibiotic: "Ceftriaxone",
      abbreviation: "CRO",
      currentRate: 58.8,
      predictedRate: 72,
      delta: 13.2,
      historicalData: [
        { year: "2021", rate: 45 },
        { year: "2022", rate: 48 },
        { year: "2023", rate: 52 },
        { year: "2024", rate: 55 },
        { year: "2025", rate: 57 },
        { year: "2026", rate: 58.8 },
      ],
    },
    {
      antibiotic: "Erythromycin",
      abbreviation: "ERY",
      currentRate: 64.0,
      predictedRate: 68,
      delta: 4.0,
      historicalData: [
        { year: "2021", rate: 50 },
        { year: "2022", rate: 55 },
        { year: "2023", rate: 59 },
        { year: "2024", rate: 61 },
        { year: "2025", rate: 63 },
        { year: "2026", rate: 64.0 },
      ],
    },
    {
      antibiotic: "Linezolid",
      abbreviation: "LNZ",
      currentRate: 0,
      predictedRate: 1.2,
      delta: 1.2,
      historicalData: [
        { year: "2021", rate: 0 },
        { year: "2022", rate: 0 },
        { year: "2023", rate: 0 },
        { year: "2024", rate: 0 },
        { year: "2025", rate: 0 },
        { year: "2026", rate: 0 },
      ],
    },
  ];
}
