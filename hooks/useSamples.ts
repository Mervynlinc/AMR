import { useEffect, useState, useCallback } from "react";
import { getSamples } from "../services/api";
import useAMRStore from "../store/amr";

export function useSamples() {
  const [isLoading, setIsLoading] = useState(false);
  const samples = useAMRStore((state) => state.samples);
  const setSamples = useAMRStore((state) => state.setSamples);

  const fetchSamples = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSamples();
      setSamples(data);
    } catch (error) {
      console.error("Failed to fetch samples:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setSamples]);

  useEffect(() => {
    let isMounted = true;
    
    const loadSamples = async () => {
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

    loadSamples();

    return () => {
      isMounted = false;
    };
  }, [setSamples]);

  return { samples, isLoading, refetch: fetchSamples };
}
