import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { CollegeSettings } from "@/types";

export function useCollegeSettings() {
  const [settings, setSettings] = useState<CollegeSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/college-settings");
        // Handle result-wrapper from ok() utility in backend
        const data = response.data?.success ? response.data.data : response.data;
        if (data) {
          setSettings(data as CollegeSettings);
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
