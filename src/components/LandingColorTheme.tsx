import { ChevronLeft, ChevronRight, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Unified accent color themes - must match index.css definitions
const accentThemes = [
  { id: "obsidian", name: "Obsidian", color: "#18181B" },
  { id: "emerald", name: "Emerald", color: "#10B981" },
  { id: "sapphire", name: "Sapphire", color: "#3B82F6" },
  { id: "amethyst", name: "Amethyst", color: "#8B5CF6" },
  { id: "coral", name: "Gold", color: "#EAB308" },
];

export function LandingColorTheme() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const savedAccent = localStorage.getItem("accent-color") || "obsidian";
    const index = accentThemes.findIndex(t => t.id === savedAccent);
    if (index !== -1) {
      setCurrentIndex(index);
      applyAccentTheme(savedAccent);
    }
  }, []);

  const applyAccentTheme = (accentId: string) => {
    const root = document.documentElement;
    // Remove all existing accent classes
    accentThemes.forEach(({ id }) => root.classList.remove(`accent-${id}`));
    // Add the new accent class
    root.classList.add(`accent-${accentId}`);
  };

  const cycleTheme = (direction: 'next' | 'prev') => {
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % accentThemes.length;
    } else {
        newIndex = (currentIndex - 1 + accentThemes.length) % accentThemes.length;
    }
    
    const newTheme = accentThemes[newIndex];
    setCurrentIndex(newIndex);
    localStorage.setItem("accent-color", newTheme.id);
    applyAccentTheme(newTheme.id);
  };

  const currentTheme = accentThemes[currentIndex];

  return (
    <div className="flex items-center gap-1 bg-accent/10 rounded-lg p-0.5 border border-accent/20">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 hover:bg-accent/20 text-muted-foreground hover:text-accent"
        onClick={() => cycleTheme('prev')}
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
        onClick={() => cycleTheme('next')}
        title="Next Color"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
