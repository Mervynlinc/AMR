import { useEffect, useState } from "react";
import { getHistory, getPredictions } from "../services/api";
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
        const dataArray = Array.isArray(raw) ? raw : [raw];

        const historyResults = await Promise.all(
          dataArray.map((d: any) => getHistory(d.antibiotic).catch(() => null)),
        );

        const formatted = dataArray.map((d: any, idx: number) => {
          const forecastYearsArr = d.years || [];
          const preds = d.predictions || [];
          const upper = d.upper_bound || [];
          const lower = d.lower_bound || [];

          const hist = historyResults[idx];
          const histYears: string[] = hist ? hist.years.map(String) : [];
          const histRates: number[] = hist ? hist.resistance : [];

          const historicalPoints = histYears.map((year: string, i: number) => ({
            year,
            rate: histRates[i] ?? 0,
            upper: histRates[i] ?? 0,
            lower: histRates[i] ?? 0,
            isHistorical: true,
          }));

          const forecastPoints = forecastYearsArr.map(
            (year: number, i: number) => ({
              year: year.toString(),
              rate: preds[i] ?? 0,
              upper: upper[i] ?? 0,
              lower: lower[i] ?? 0,
              isHistorical: false,
            }),
          );

          const forecastYearSet = new Set(forecastPoints.map((p) => p.year));
          const mergedData = [
            ...historicalPoints.filter((p) => !forecastYearSet.has(p.year)),
            ...forecastPoints,
          ].sort((a, b) => Number(a.year) - Number(b.year));

          const currentYearStr = new Date().getFullYear().toString();
          const currentDataPoint = mergedData.find(
            (h) => h.year === currentYearStr,
          );
          const currentRate = currentDataPoint
            ? currentDataPoint.rate
            : (preds[0] ?? 0);
          const predictedRate = preds[preds.length - 1] ?? currentRate;

          return {
            antibiotic: d.antibiotic,
            historicalData: mergedData,
            forecastData: forecastPoints,
            historicalOnlyData: historicalPoints,
            currentRate,
            predictedRate,
            delta: +(predictedRate - currentRate).toFixed(2),
            mae: d.mae ?? 0,
            r2: d.r2 ?? 0,
          };
        });

        if (alive) setPredictions(formatted);
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
