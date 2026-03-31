import { useState, useEffect } from "react";
import { doc, getDoc } from "@/lib/dataClient";
import type { CollegeSettings } from "@/types";

export function useCollegeSettings() {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsRef = doc(null as any, "collegeSettings", "main");
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
