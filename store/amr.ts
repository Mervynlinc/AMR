import { create } from "zustand";
import { Prediction, Report, Sample } from "../types/index";

interface AMRStore {
  samples: Sample[];
  reports: Report[];
  predictions: Prediction[];
  savedReports: string[];
  setSamples: (samples: Sample[]) => void;
  setReports: (reports: Report[]) => void;
  setPredictions: (predictions: Prediction[]) => void;
  addSample: (sample: Sample) => void;
  updateSample: (id: string, updates: Partial<Sample>) => void;
  toggleSavedReport: (reportId: string) => void;
  isReportSaved: (reportId: string) => boolean;
}

const useAMRStore = create<AMRStore>((set) => ({
  samples: [],
  reports: [],
  predictions: [],
  savedReports: [],
  setSamples: (samples) => set({ samples }),
  setReports: (reports) => set({ reports }),
  setPredictions: (predictions) => set({ predictions }),
  addSample: (sample) =>
    set((state) => ({ samples: [...state.samples, sample] })),
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
    const state = useAMRStore.getState();
    return state.savedReports.includes(reportId);
  },
}));

export default useAMRStore;
