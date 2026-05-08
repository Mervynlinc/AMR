import { create } from "zustand";
import { Prediction, Report, Sample } from "../types/index";

const READ_REPORTS_FILE_NAME = "readReports.json";

async function loadReadReports(): Promise<string[]> {
  try {
    const fs = await import("expo-file-system");
    const File = fs.File;
    const Paths = fs.Paths;
    const FileSystem = fs.FileSystem;
    const cacheDir = Paths.cache;
    const fileUri = new File(cacheDir, READ_REPORTS_FILE_NAME).uri;
    const info = await FileSystem.info(fileUri);
    if (info.exists) {
      const file = new File(fileUri);
      const content = await file.text();
      return JSON.parse(content);
    }
  } catch (e) {
    console.error("Failed to load read reports:", e);
  }
  return [];
}

async function saveReadReports(readReports: string[]): Promise<void> {
  try {
    const fs = await import("expo-file-system");
    const File = fs.File;
    const Paths = fs.Paths;
    const cacheDir = Paths.cache;
    const file = new File(cacheDir, READ_REPORTS_FILE_NAME);
    await file.write(JSON.stringify(readReports));
  } catch (e) {
    console.error("Failed to save read reports:", e);
  }
}

interface AMRStore {
  samples: Sample[];
  reports: Report[];
  predictions: Prediction[];
  savedReports: string[];
  readReports: string[];
  setSamples: (samples: Sample[]) => void;
  setReports: (reports: Report[]) => void;
  setPredictions: (predictions: Prediction[]) => void;
  addSample: (sample: Sample) => void;
  updateSample: (id: string, updates: Partial<Sample>) => void;
  toggleSavedReport: (reportId: string) => void;
  isReportSaved: (reportId: string) => boolean;
  markReportRead: (reportId: string) => void;
  isReportRead: (reportId: string) => boolean;
  loadReadReports: () => Promise<void>;
}

const useAMRStore = create<AMRStore>((set, get) => ({
  samples: [],
  reports: [],
  predictions: [],
  savedReports: [],
  readReports: [],
  setSamples: (samples) => set({ samples }),
  setReports: (reports) => set({ reports }),
  setPredictions: (predictions) => set({ predictions }),
  addSample: (sample) =>
    set((state) => ({ samples: [...state.samples, sample] })),
  removeSample: (id: string) =>
    set((state) => ({
      samples: state.samples.filter((sample) => sample.id !== id),
    })),
  updateSample: (id, updates) =>
    set((state) => ({
      samples: state.samples.map((sample) =>
        sample.id === id ? { ...sample, ...updates } : sample,
      ),
    })),
  toggleSavedReport: (reportId) =>
    set((state) => ({
      savedReports: state.savedReports.includes(reportId)
        ? state.savedReports.filter((id) => id !== reportId)
        : [...state.savedReports, reportId],
    })),
  isReportSaved: (reportId) => {
    const state = get();
    return state.savedReports.includes(reportId);
  },
  markReportRead: (reportId) => {
    const state = get();
    if (!state.readReports.includes(reportId)) {
      const newReadReports = [...state.readReports, reportId];
      set({ readReports: newReadReports });
      saveReadReports(newReadReports);
    }
  },
  isReportRead: (reportId) => {
    const state = get();
    return state.readReports.includes(reportId);
  },
  loadReadReports: async () => {
    const readReports = await loadReadReports();
    set({ readReports });
  },
}));

export default useAMRStore;
