import { useEffect, useState } from "react";
import { getPredictions } from "../services/api";
import useAMRStore from "../store/amr";

export function usePredictions() {
  const [isLoading, setIsLoading] = useState(false);
  const predictions = useAMRStore((state) => state.predictions);
  const setPredictions = useAMRStore((state) => state.setPredictions);

  useEffect(() => {
    let isMounted = true;
    const fetchPredictions = async () => {
      setIsLoading(true);
      try {
        const data = await getPredictions();
        if (isMounted) {
          setPredictions(data);
        }
      } catch (error) {
        console.error("Failed to fetch predictions:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPredictions();

    return () => {
      isMounted = false;
    };
  }, [setPredictions]);

  return { predictions, isLoading };
}
