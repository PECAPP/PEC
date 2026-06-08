'use client';
import { Button } from "@pec/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { safeLocalStorage } from "@/lib/ssr-safe";

// Unified accent color themes - must match index.css definitions
const accentThemes = [
  { id: "pec-gold", name: "PEC Gold", color: "#F59E0B" },
  { id: "emerald", name: "Emerald", color: "#10B981" },
  { id: "sapphire", name: "Sapphire", color: "#3B82F6" },
  { id: "amethyst", name: "Amethyst", color: "#8B5CF6" },
];

/**
 * Apply an accent theme class to the document root.
 * Guarded with typeof document check — safe to call in useEffect.
 */
function applyAccentTheme(accentId: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  accentThemes.forEach(({ id }) => root.classList.remove(`accent-${id}`));
  root.classList.add(`accent-${accentId}`);
}

export function LandingColorTheme() {
  // SSR-SAFE: Default to 0, hydrate from localStorage in useEffect.
  // If we read localStorage in useState initializer, server renders index 0
  // but client may have a saved value → hydration mismatch.
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const rawSavedAccent = safeLocalStorage.get("accent-color");
    const savedAccent = !rawSavedAccent || rawSavedAccent === "golden" ? "pec-gold" : rawSavedAccent;
    const index = accentThemes.findIndex((t) => t.id === savedAccent);
    if (index !== -1) {
      setCurrentIndex(index);
      applyAccentTheme(savedAccent);
      safeLocalStorage.set("accent-color", savedAccent);
    }
  }, []);

  const cycleTheme = (direction: "next" | "prev") => {
    const newIndex =
      direction === "next"
        ? (currentIndex + 1) % accentThemes.length
        : (currentIndex - 1 + accentThemes.length) % accentThemes.length;

    const newTheme = accentThemes[newIndex];
    setCurrentIndex(newIndex);
    safeLocalStorage.set("accent-color", newTheme.id);
    applyAccentTheme(newTheme.id);
  };

  const currentTheme = accentThemes[currentIndex];

  return (
    <div className="flex items-center gap-1 bg-accent/10 rounded-lg p-0.5 border border-accent/20">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-accent/20 text-muted-foreground hover:text-accent"
        onClick={() => cycleTheme("prev")}
        title="Previous Color"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>

      <div className="flex items-center justify-center w-6 h-6">
        <div
          className="w-3 h-3 rounded-full shadow-sm ring-2 ring-background transition-all"
          style={{ backgroundColor: currentTheme?.color }}
          title={currentTheme?.name}
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-accent/20 text-muted-foreground hover:text-accent"
        onClick={() => cycleTheme("next")}
        title="Next Color"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
