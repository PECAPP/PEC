import { useState, useEffect } from "react";
import type { CollegeSettings } from "@/types";

// Data client stubs
const doc = (...args: any[]) => ({});
const getDoc = async (...args: any[]) => ({
  exists: () => false,
  data: () => null,
});

export function useCollegeSettings() {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc({} as any, "collegeSettings", "main");
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setSettings(settingsSnap.data() as CollegeSettings);
        } else {
          setSettings(null);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching college settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load settings",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
