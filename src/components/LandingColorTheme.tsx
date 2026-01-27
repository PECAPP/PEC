import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

// Unified accent color themes - must match index.css definitions
const accentThemes = [
  { id: "obsidian", name: "Obsidian", color: "#18181B" },
  { id: "emerald", name: "Emerald", color: "#10B981" },
  { id: "sapphire", name: "Sapphire", color: "#3B82F6" },
  { id: "amethyst", name: "Amethyst", color: "#8B5CF6" },
  { id: "coral", name: "Coral", color: "#F97316" },
];

export function LandingColorTheme() {
  const [currentAccent, setCurrentAccent] = useState("obsidian");

  useEffect(() => {
    const savedAccent = localStorage.getItem("accent-color") || "obsidian";
    setCurrentAccent(savedAccent);
    applyAccentTheme(savedAccent);
  }, []);

  const applyAccentTheme = (accentId: string) => {
    const root = document.documentElement;
    // Remove all existing accent classes
    accentThemes.forEach(({ id }) => root.classList.remove(`accent-${id}`));
    // Add the new accent class
    root.classList.add(`accent-${accentId}`);
  };

  const handleAccentChange = (accentId: string) => {
    setCurrentAccent(accentId);
    localStorage.setItem("accent-color", accentId);
    applyAccentTheme(accentId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Change accent color</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-none strict-sharp-corners neo-brutal-card">
        {accentThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => handleAccentChange(theme.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className="w-5 h-5 rounded-none border border-foreground shadow-sm"
                style={{ background: theme.color }}
              />
              <span className="flex-1">{theme.name}</span>
              {currentAccent === theme.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
