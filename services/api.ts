import axios from "axios";
import { sb } from "../lib/supabase";
import useAuthStore from "../store/auth";
import { ASTEntry, Report, Sample } from "../types/index";

/* ─────────────────────────────────────────────
   Legacy REST client — only used for reports
   and predictions (external API)
   ───────────────────────────────────────────── */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_AMR_API_BASE_URL ?? "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;

/* ─────────────────────────────────────────────
   Helper — current logged-in lab user UUID
   ───────────────────────────────────────────── */
function getUserId(): string {
  const id = useAuthStore.getState().user?.id;
  if (!id) throw new Error("Not authenticated");
  return id;
}

/* ─────────────────────────────────────────────
   SAMPLES
   ───────────────────────────────────────────── */

export async function getSamples(): Promise<Sample[]> {
  try {
    const userId = getUserId();
    const { data } = await sb.get<Sample[]>("/samples", {
      params: {
        created_by: `eq.${userId}`,
        order: "created_at.desc",
      },
    });
    return data ?? [];
  } catch (error) {
    console.error("getSamples error:", error);
    return [];
  }
}

export async function createSample(payload: Partial<Sample>): Promise<Sample> {
  const userId = getUserId();

  const { data } = await sb.post<Sample>(
    "/samples",
    {
      created_by: userId,
      sample_code: payload.sample_code ?? payload.id,
      specimen_type: payload.specimen_type,
      collection_date: payload.collection_date ?? new Date().toISOString(),
      received_date: payload.received_date ?? new Date().toISOString(),
      age_group: payload.age_group,
      sex: payload.sex,
      patient_type: payload.patient_type,
      ward: payload.ward ?? null,
      status: "pending_isolate",
    },
    { headers: { Prefer: "return=representation" } },
  );

  // PostgREST returns an array on insert — pick the first row
  return (Array.isArray(data) ? data[0] : data) as Sample;
}

export async function updateSampleStatus(
  sampleId: string,
  status: Sample["status"],
): Promise<void> {
  await sb.patch(
    "/samples",
    { status },
    {
      params: { id: `eq.${sampleId}` },
    },
  );
}

/* ─────────────────────────────────────────────
   ISOLATES
   ───────────────────────────────────────────── */

export async function createIsolate(
  sampleId: string,
  growthDetected: boolean,
): Promise<{ id: string }> {
  const userId = getUserId();

  const { data } = await sb.post<{ id: string }[]>(
    "/isolates",
    {
      sample_id: sampleId,
      confirmed_by: userId,
      organism: "Staphylococcus aureus",
      identification_method: "Culture Characteristics",
      growth_detected: growthDetected,
    },
    { headers: { Prefer: "return=representation" } },
  );

  return Array.isArray(data) ? data[0] : (data as any);
}

/* ─────────────────────────────────────────────
   SUSCEPTIBILITY TESTS (AST)
   ───────────────────────────────────────────── */

export async function saveAST(
  sampleId: string,
  results: ASTEntry[],
  isMDR: boolean,
  isMRSA: boolean,
): Promise<void> {
  const userId = getUserId();

  // 1. Find isolate for this sample
  const { data: isolates } = await sb.get<{ id: string }[]>("/isolates", {
    params: { sample_id: `eq.${sampleId}`, select: "id" },
  });

  const isolate = isolates?.[0];
  if (!isolate) throw new Error("Isolate not found for sample");

  // 2. Look up antibiotic metadata
  const { data: antibiotics } = await sb.get<
    { id: string; name: string; drug_class: string }[]
  >("/antibiotics", { params: { select: "id,name,drug_class" } });

  const abMap = new Map((antibiotics ?? []).map((a) => [a.name, a]));

  // 3. Build and insert rows
  const rows = results
    .filter((r) => r.result !== null)
    .map((r) => {
      const ab = abMap.get(r.antibiotic);
      return {
        isolate_id: isolate.id,
        antibiotic_id: ab?.id ?? null,
        antibiotic_name: r.antibiotic,
        abbreviation: r.abbreviation,
        drug_class: ab?.drug_class ?? null,
        recorded_by: userId,
        result: r.result,
      };
    });

  await sb.post("/susceptibility_tests", rows, {
    headers: { Prefer: "return=minimal" },
  });

  // 4. Update isolate MDR / MRSA flags
  await sb.patch(
    "/isolates",
    { is_mdr: isMDR, is_mrsa: isMRSA, mdr_class_count: isMDR ? 3 : 0 },
    { params: { id: `eq.${isolate.id}` } },
  );

  // 5. Mark sample complete
  await updateSampleStatus(sampleId, "complete");
}

/* ─────────────────────────────────────────────
   REPORT VIEW
   ───────────────────────────────────────────── */

export interface FullSampleReport {
  sample: Sample;
  isolate: {
    id: string;
    organism: string;
    growth_detected: boolean;
    is_mrsa: boolean;
    is_mdr: boolean;
  } | null;
  astResults: ASTEntry[];
}

export async function getFullSampleReport(
  sampleId: string,
): Promise<FullSampleReport | null> {
  try {
    const { data: samples } = await sb.get<Sample[]>("/samples", {
      params: { id: `eq.${sampleId}` },
    });
    const sample = samples?.[0];
    if (!sample) return null;

    const { data: isolates } = await sb.get<
      {
        id: string;
        organism: string;
        growth_detected: boolean;
        is_mrsa: boolean;
        is_mdr: boolean;
      }[]
    >("/isolates", {
      params: {
        sample_id: `eq.${sampleId}`,
        select: "id,organism,growth_detected,is_mrsa,is_mdr",
      },
    });
    const isolate = isolates?.[0] ?? null;

    let astResults: ASTEntry[] = [];
    if (isolate) {
      const { data: tests } = await sb.get<
        { antibiotic_name: string; abbreviation: string; result: string }[]
      >("/susceptibility_tests", {
        params: {
          isolate_id: `eq.${isolate.id}`,
          select: "antibiotic_name,abbreviation,result",
          order: "antibiotic_name.asc",
        },
      });

      astResults = (tests ?? []).map((t) => ({
        antibiotic: t.antibiotic_name,
        abbreviation: t.abbreviation,
        result: t.result as ASTEntry["result"],
      }));
    }

    return { sample, isolate, astResults };
  } catch (err) {
    console.error("getFullSampleReport error:", err);
    return null;
  }
}

/* ─────────────────────────────────────────────
   USER STATS
   ───────────────────────────────────────────── */

export interface LabUserStats {
  total_samples: number;
  completed: number;
  pending: number;
  last_sample_at: string | null;
  total_isolates: number;
  mrsa_count: number;
  mdr_count: number;
  ast_count: number;
}

export async function getLabUserStats(userId: string): Promise<LabUserStats> {
  const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
  const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const { data } = await axios.post<LabUserStats>(
    `${SUPABASE_URL}/rest/v1/rpc/get_lab_user_stats`,
    { p_user_id: userId },
    {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return data;
}

/* ─────────────────────────────────────────────
   REPORTS (clinician — external API)
   ───────────────────────────────────────────── */

export async function getReports(): Promise<Report[]> {
  try {
    const { data } = await api.get("/reports");
    return data;
  } catch {
    return [];
  }
}

export async function getReport(reportId: string): Promise<Report> {
  const { data } = await api.get(`/reports/${reportId}`);
  return data;
}

/* ─────────────────────────────────────────────
   PREDICTIONS (external ML API)
   ───────────────────────────────────────────── */

export async function getPredictions(years: number = 5): Promise<any[]> {
  const BASE_URL = "https://amr-backend-hjgp.onrender.com";
  const res = await fetch(`${BASE_URL}/antibiotics`);
  const { antibiotics }: { antibiotics: string[] } = await res.json();

  return Promise.all(
    antibiotics.map(async (ab) => {
      const r = await fetch(`${BASE_URL}/forecast/${ab}?steps=${years}`);
      return r.json();
    }),
  );
}
