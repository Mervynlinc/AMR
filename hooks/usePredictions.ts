import { useEffect, useState } from "react";
import { getPredictions } from "../services/api";
import useAMRStore from "../store/amr";

export function usePredictions(forecastYears: number = 5) {
  const [isLoading, setIsLoading] = useState(false);

  const predictions = useAMRStore((state) => state.predictions);
  const setPredictions = useAMRStore((state) => state.setPredictions);

  useEffect(() => {
    let alive = true;

    const fetchPredictions = async () => {
      setIsLoading(true);

      try {
        const raw = await getPredictions(forecastYears);

        const currentYear = new Date().getFullYear();

        const formatted = raw.map((d: any) => {
          const years = d.years || [];
          const preds = d.predictions || [];
          const upper = d.upper_bound || [];
          const lower = d.lower_bound || [];

          const historicalData = years.map((year: number, i: number) => ({
            year: year.toString(),
            rate: preds[i] ?? 0,
            upper: upper[i] ?? 0,
            lower: lower[i] ?? 0,
          }));

          // 🔥 Find current year index
          const currentIndex = years.findIndex(
            (y: number) => y === currentYear,
          );

          const safeIndex =
            currentIndex !== -1 ? currentIndex : Math.max(0, preds.length - 2);

          const currentRate = preds[safeIndex] ?? 0;
          const predictedRate = preds[preds.length - 1] ?? currentRate;

          return {
            antibiotic: d.antibiotic,
            historicalData,

            currentYear,
            currentRate,

            predictedYear: years[years.length - 1],
            predictedRate,

            delta: +(predictedRate - currentRate).toFixed(2),

            accuracy: d.accuracy ?? 0,
          };
        });

        if (alive) setPredictions(formatted);
      } catch (error) {
        console.error(error);
      } finally {
        if (alive) setIsLoading(false);
      }
    };

    fetchPredictions();

    return () => {
      alive = false;
    };
  }, [forecastYears, setPredictions]);

  return { predictions, isLoading };
}
