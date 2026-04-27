import { useEffect, useState } from "react";
import { getPredictions } from "../services/api";
import useAMRStore from "../store/amr";

/**
 * Custom hook to fetch and format antibiotic resistance predictions.
 * @param forecastYears The number of years to forecast (sent as 'steps' to backend).
 */
export function usePredictions(forecastYears: number = 5) {
  const [isLoading, setIsLoading] = useState(false);
  const predictions = useAMRStore((state) => state.predictions);
  const setPredictions = useAMRStore((state) => state.setPredictions);

  useEffect(() => {
    let alive = true;

    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch raw data. Note: Ensure your api.ts passes this to the 'steps' query param.
        const raw = await getPredictions(forecastYears);

        // 2. Normalize response (handles both single object and array responses)
        const dataArray = Array.isArray(raw) ? raw : [raw];

        const formatted = dataArray.map((d: any) => {
          const years = d.years || [];
          const preds = d.predictions || [];
          const upper = d.upper_bound || [];
          const lower = d.lower_bound || [];

          // 3. Map into a clean historical object for the graph
          const historicalData = years.map((year: number, i: number) => ({
            year: year.toString(),
            rate: preds[i] ?? 0,
            upper: upper[i] ?? 0,
            lower: lower[i] ?? 0,
          }));

          // 4. DYNAMIC CURRENT YEAR LOGIC
          // We look for the data point that matches 2026.
          const currentYearStr = new Date().getFullYear().toString();
          const currentDataPoint = historicalData.find(
            (h) => h.year === currentYearStr,
          );

          // Current rate is the 2026 value; Predicted is the very last value in the set.
          const currentRate = currentDataPoint
            ? currentDataPoint.rate
            : (preds[0] ?? 0);
          const predictedRate = preds[preds.length - 1] ?? currentRate;

          return {
            antibiotic: d.antibiotic,
            historicalData,
            currentRate,
            predictedRate,
            // Calculate growth/decline from CURRENT year (2026) to the end of forecast
            delta: +(predictedRate - currentRate).toFixed(2),
            mae: d.mae ?? 0,
            r2: d.r2 ?? 0,
          };
        });

        if (alive) {
          setPredictions(formatted);
        }
      } catch (error) {
        console.error("usePredictions Error:", error);
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
