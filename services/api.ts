import axios from "axios";
import useAuthStore from "../store/auth";
import { ASTEntry, Report, Sample } from "../types/index";

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

/* ─────────────────────────────────────────────
   SAMPLES (unchanged)
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   REPORTS (unchanged)
───────────────────────────────────────────── */

export async function getReports(): Promise<Report[]> {
  await delay();

  const mockAstResults1: ASTEntry[] = [
    {
      antibiotic: "Penicillin",
      abbreviation: "PEN",
      result: "R",
    },
    {
      antibiotic: "Cefoxitin",
      abbreviation: "FOX",
      result: "R",
    },
    {
      antibiotic: "Erythromycin",
      abbreviation: "ERY",
      result: "I",
    },
    {
      antibiotic: "Clindamycin",
      abbreviation: "CLI",
      result: "S",
    },
    {
      antibiotic: "Vancomycin",
      abbreviation: "VAN",
      result: "S",
    },
    {
      antibiotic: "Linezolid",
      abbreviation: "LNZ",
      result: "S",
    },
  ];

  const mockAstResults2: ASTEntry[] = [
    {
      antibiotic: "Ampicillin",
      abbreviation: "AMP",
      result: "S",
    },
    {
      antibiotic: "Amoxicillin-Clavulanate",
      abbreviation: "AMC",
      result: "S",
    },
    {
      antibiotic: "Ceftriaxone",
      abbreviation: "CRO",
      result: "S",
    },
    {
      antibiotic: "Ciprofloxacin",
      abbreviation: "CIP",
      result: "I",
    },
    {
      antibiotic: "Gentamicin",
      abbreviation: "GEN",
      result: "S",
    },
    {
      antibiotic: "Trimethoprim-Sulfamethoxazole",
      abbreviation: "SXT",
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
      organism: "Staphylococcus aureus",
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
  const report = reports.find((r) => r.id === reportId);
  if (!report) {
    throw new Error(`Report with ID ${reportId} not found`);
  }
  return report;
}
export async function getPredictions(years: number = 5): Promise<any[]> {
  try {
    const BASE_URL = "https://amr-backend-hjgp.onrender.com";

    const res = await fetch(`${BASE_URL}/antibiotics`);
    const data = await res.json();
    const antibiotics: string[] = data.antibiotics;

    const results = await Promise.all(
      antibiotics.map(async (ab) => {
        const r = await fetch(`${BASE_URL}/forecast/${ab}?steps=${years}`);
        return await r.json();
      }),
    );

    return results;
  } catch (error) {
    console.error("Prediction API error:", error);
    throw error;
  }
}

export async function getHistory(antibiotic: string): Promise<any> {
  const BASE_URL = "https://amr-backend-hjgp.onrender.com";
  const res = await fetch(`${BASE_URL}/history/${antibiotic}`);
  return await res.json();
}
