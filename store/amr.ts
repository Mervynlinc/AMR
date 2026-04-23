import { create } from "zustand";
import { Prediction, Report, Sample } from "../types/index";

interface AMRStore {
  samples: Sample[];
  reports: Report[];
  predictions: Prediction[];
  setSamples: (samples: Sample[]) => void;
  setReports: (reports: Report[]) => void;
  setPredictions: (predictions: Prediction[]) => void;
  addSample: (sample: Sample) => void;
  updateSample: (id: string, updates: Partial<Sample>) => void;
}

const useAMRStore = create<AMRStore>((set) => ({
  samples: [],
  reports: [],
  predictions: [],
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
}));

export default useAMRStore;
