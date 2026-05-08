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
  try {
    const userId = getUserId();
    const { data } = await sb.get<Sample[]>("/samples", {
      params: {
        created_by: `eq.${userId}`,
        order: "created_at.desc",
        select: "*,isolates(*)",
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
  );
}

export async function deleteSample(sampleId: string): Promise<void> {
  try {
    // Get isolate ID for this sample first
    const { data: isolates } = await sb.get<{ id: string }[]>("/isolates", {
      params: { sample_id: `eq.${sampleId}`, select: "id" },
    });

    const isolate = isolates?.[0];

    // Delete susceptibility tests if isolate exists
    if (isolate) {
      await sb.delete("/susceptibility_tests", {
        params: { isolate_id: `eq.${isolate.id}` },
      });
    }

    // Delete lab reports
    await sb.delete("/lab_reports", {
      params: { sample_id: `eq.${sampleId}` },
    });

    // Delete isolate if exists
    if (isolate) {
      await sb.delete("/isolates", {
        params: { sample_id: `eq.${sampleId}` },
      });
    }

    // Finally delete the sample
    await sb.delete("/samples", {
      params: { id: `eq.${sampleId}` },
    });
  } catch (error) {
    console.error("Delete sample error:", error);
    throw error;
  }
}

/* ─────────────────────────────────────────────
   ISOLATES
   ───────────────────────────────────────────── */

export async function createIsolate(
  sampleId: string,
  growthDetected: boolean,
  growthTimeHours?: number,
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
      growth_time_hours: growthTimeHours,
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
  isMDR: boolean,
  isMRSA: boolean,
  remarks?: string,
): Promise<void> {
  const userId = getUserId();

  // 1. Find isolate for this sample
  const { data: isolates } = await sb.get<{ id: string }[]>("/isolates", {
    params: { sample_id: `eq.${sampleId}`, select: "id" },
  });

  const isolate = isolates?.[0];
  if (!isolate) throw new Error("Isolate not found for sample");

  // 2. Delete old results for this isolate to avoid duplicates
  await sb.delete("/susceptibility_tests", {
    params: { isolate_id: `eq.${isolate.id}` },
  });

  // 3. Build and insert rows (antibiotics data provided from frontend)
  const rows = results
    .filter((r) => r.result !== null)
    .map((r) => ({
      isolate_id: isolate.id,
      antibiotic_id: null,
      antibiotic_name: r.antibiotic,
      abbreviation: r.abbreviation,
      drug_class: r.drug_class ?? null,
      recorded_by: userId,
      result: r.result,
    }));

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

  // 6. Create or update lab report with remarks
  const { data: existingReports } = await sb.get<any[]>("/lab_reports", {
    params: { sample_id: `eq.${sampleId}`, select: "id" },
  });

  if (existingReports && existingReports.length > 0) {
    // Update existing report
    await sb.patch(
      "/lab_reports",
      { remarks: remarks || null },
      { params: { id: `eq.${existingReports[0].id}` } },
    );
  } else {
    // Create new report
    const reportCode = `RPT-${Date.now()}`;
    await sb.post(
      "/lab_reports",
      {
        sample_id: sampleId,
        isolate_id: isolate.id,
        authorised_by: userId,
        report_code: reportCode,
        remarks: remarks || null,
      },
      { headers: { Prefer: "return=minimal" } },
    );
  }
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
    growth_time_hours?: number;
    is_mrsa: boolean;
    is_mdr: boolean;
  } | null;
  astResults: ASTEntry[];
  remarks: string | null;
  reportPublished: boolean;
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
        growth_time_hours?: number;
        is_mrsa: boolean;
        is_mdr: boolean;
      }[]
    >("/isolates", {
      params: {
        sample_id: `eq.${sampleId}`,
        select: "id,organism,growth_detected,growth_time_hours,is_mrsa,is_mdr",
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

    let remarks: string | null = null;
    let reportPublished = false;
    if (isolate) {
      const { data: reports } = await sb.get<
        { remarks: string | null; authorised_at: string }[]
      >("/lab_reports", {
        params: {
          sample_id: `eq.${sampleId}`,
          select: "remarks,authorised_at",
        },
      });
      remarks = reports?.[0]?.remarks ?? null;
      reportPublished = !!reports?.[0];
    }

    return { sample, isolate, astResults, remarks, reportPublished };
  } catch (err) {
    console.error("getFullSampleReport error:", err);
    return null;
  }
}

export async function publishReport(sampleId: string): Promise<void> {
  const userId = getUserId();
  await sb.patch(
    "/lab_reports",
    { authorised_by: userId, authorised_at: new Date().toISOString() },
    { params: { sample_id: `eq.${sampleId}` } },
  );
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

/* ─────────────────────────────────────────────
    REPORTS (clinician — from database)
    ───────────────────────────────────────────── */

export async function getReports(): Promise<Report[]> {
  try {
    const { data: labReports } = await sb.get<any[]>("/lab_reports", {
      params: {
        select: "*,samples(*),isolates(*)",
        order: "generated_at.desc",
      },
    });

    const reports = (labReports ?? []).map((lr) => {
      const sample = lr.samples;
      const isolate = lr.isolates;

      return {
        id: lr.report_code,
        sampleId: sample?.id || "",
        specimenType: sample?.specimen_type || "Unknown",
        patientDemographics: `${sample?.age_group || ""} ${sample?.sex || ""} ${sample?.patient_type || ""}`,
        patientSex: sample?.sex || "",
        organism: isolate?.organism || "Unknown",
        isMRSA: isolate?.is_mrsa || false,
        astResults: [],
        localContext: lr.local_context || "",
        authorisedBy: lr.authorised_by || "",
        date: lr.generated_at || "",
        remarks: lr.remarks || undefined,
        growthTimeHours: isolate?.growth_time_hours || undefined,
      };
    });

    return reports;
  } catch (error) {
    console.error("getReports error:", error);
    return [];
  }
}

export async function getReport(reportId: string): Promise<Report> {
  const { data: labReports } = await sb.get<any[]>("/lab_reports", {
    params: {
      select: "*,samples(*),isolates(*)",
      report_code: `eq.${reportId}`,
    },
  });

  const lr = labReports?.[0];
  if (!lr) throw new Error("Report not found");

  const sample = lr.samples;
  const isolate = lr.isolates;

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

  return {
    id: lr.report_code,
    sampleId: sample?.id || "",
    specimenType: sample?.specimen_type || "Unknown",
    patientDemographics: `${sample?.age_group || ""} ${sample?.sex || ""} ${sample?.patient_type || ""}`,
    patientSex: sample?.sex || "",
    organism: isolate?.organism || "Unknown",
    isMRSA: isolate?.is_mrsa || false,
    astResults,
    localContext: lr.local_context || "",
    authorisedBy: lr.authorised_by || "",
    authorisedByName: undefined,
    date: lr.generated_at || "",
    remarks: lr.remarks || undefined,
    growthTimeHours: isolate?.growth_time_hours || undefined,
  };
}

/* ─────────────────────────────────────────────
    RESISTANCE YEARS (available years)
    ───────────────────────────────────────────── */

export async function getResistanceYears(): Promise<number[]> {
  try {
    const { data } = await sb.get<any[]>("/resistance_trends", {
      params: {
        select: "year",
        order: "year.asc",
      },
    });

    const years = [...new Set((data ?? []).map((d) => d.year))];
    return years;
  } catch (error) {
    console.error("getResistanceYears error:", error);
    return [];
  }
}

/* ─────────────────────────────────────────────
    RESISTANCE AGGREGATES (AMR data from database)
    ───────────────────────────────────────────── */

export async function getResistanceAggregates(
  year?: string,
  intensity?: "all" | "high" | "medium" | "low",
): Promise<{ name: string; rate: number }[]> {
  try {
    const params: any = {
      select: "antibiotics(name),resistance_rate",
      order: "resistance_rate.desc",
    };

    if (year) {
      params.year = `eq.${year}`;
    }

    const { data: trends } = await sb.get<any[]>("/resistance_trends", {
      params,
    });

    let filtered = trends ?? [];

    if (intensity && intensity !== "all") {
      filtered = filtered.filter((item) => {
        const rate = parseFloat(item.resistance_rate) || 0;
        if (intensity === "high") return rate > 50;
        if (intensity === "medium") return rate >= 20 && rate <= 50;
        if (intensity === "low") return rate < 20;
        return true;
      });
    }

    return filtered.map((item) => ({
      name: item.antibiotics?.name || item["antibiotics.name"] || "Unknown",
      rate: parseFloat(item.resistance_rate) || 0,
    }));
  } catch (error) {
    console.error("getResistanceAggregates error:", error);
    return [];
  }
}

/* ─────────────────────────────────────────────
    RESISTANCE TRENDS (historical data for home page)
    ───────────────────────────────────────────── */

export async function getResistanceTrends(): Promise<
  { name: string; currentRate: number; trend: number[]; color: string }[]
> {
  try {
    const { data: trends } = await sb.get<any[]>("/resistance_trends", {
      params: {
        select: "antibiotics(name),year,resistance_rate",
        order: "year.asc",
      },
    });

    console.log("Resistance trends data:", trends?.length, "records");

    const trendMap = new Map<
      string,
      { rates: { year: number; rate: number }[]; name: string }
    >();

    (trends ?? []).forEach((item) => {
      const name =
        item.antibiotics?.name || item["antibiotics.name"] || "Unknown";
      const year = item.year;
      const rate = parseFloat(item.resistance_rate) || 0;

      if (!trendMap.has(name)) {
        trendMap.set(name, { rates: [], name });
      }

      const trend = trendMap.get(name)!;
      trend.rates.push({ year, rate });
    });

    console.log("Processed trends:", trendMap.size, "antibiotics");

    const processedTrends = Array.from(trendMap.values())
      .filter((t) => t.rates.length >= 3)
      .map((t) => {
        const sortedRates = t.rates.sort((a, b) => a.year - b.year);
        const currentRate = sortedRates[sortedRates.length - 1].rate;
        const recentRates = sortedRates.slice(-6).map((r) => r.rate);

        return {
          name: t.name,
          currentRate,
          trend: recentRates,
          color:
            currentRate > 50
              ? "#dc2626"
              : currentRate >= 20
                ? "#f59e0b"
                : "#059669",
        };
      })
      .sort((a, b) => b.currentRate - a.currentRate)
      .slice(0, 3);

    console.log("Final trends:", processedTrends);

    return processedTrends;
  } catch (error) {
    console.error("getResistanceTrends error:", error);
    return [];
  }
}
export async function getPredictions(years: number = 5): Promise<any[]> {
  try {
    const BASE_URL = "https://amr-backend-hjgp.onrender.com";

    const res = await fetch(`${BASE_URL}/antibiotics`);
    const data = await res.json();
    const antibiotics: string[] = data.antibiotics;

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
