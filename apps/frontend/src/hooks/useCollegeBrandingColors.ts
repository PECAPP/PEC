import { useState, useEffect } from "react";
import { useCollegeSettings } from "./useCollegeSettings";

export function useCollegeBrandingColors() {
  const { settings } = useCollegeSettings();
  const [selectedColor, setSelectedColorState] = useState<string>("");

  // Default colors if college hasn't set any
  const defaultColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];
  const availableColors = settings?.brandingColors || defaultColors;

  // Convert hex to HSL for CSS variables
  const hexToHSL = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
      l * 100
    )}%`;
  };

  // Apply color to CSS variables
  const applyColorToCss = (color: string) => {
    const hsl = hexToHSL(color);
    document.documentElement.style.setProperty("--primary", hsl);
  };

  useEffect(() => {
    // Load saved color preference from localStorage on mount
    const saved = localStorage.getItem("accentColor");
    if (saved && availableColors.includes(saved)) {
      setSelectedColorState(saved);
      applyColorToCss(saved);
    } else {
      setSelectedColorState(availableColors[0]);
      applyColorToCss(availableColors[0]);
    }
  }, [availableColors]);

  const setColor = (color: string) => {
    if (availableColors.includes(color)) {
      setSelectedColorState(color);
      localStorage.setItem("accentColor", color);
      applyColorToCss(color);
    }
  };

  return {
    colors: availableColors,
    selectedColor: selectedColor,
    setColor,
  };
}
