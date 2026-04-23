import { useEffect, useState } from "react";
import { getSamples } from "../services/api";
import useAMRStore from "../store/amr";

export function useSamples() {
  const [isLoading, setIsLoading] = useState(false);
  const samples = useAMRStore((state) => state.samples);
  const setSamples = useAMRStore((state) => state.setSamples);

  useEffect(() => {
    let isMounted = true;
    const fetchSamples = async () => {
      setIsLoading(true);
      try {
        const data = await getSamples();
        if (isMounted) {
          setSamples(data);
        }
      } catch (error) {
        console.error("Failed to fetch samples:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSamples();

    return () => {
      isMounted = false;
    };
  }, [setSamples]);

  return { samples, isLoading };
}
