import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

const colorThemes = [
  { name: "White", value: "white", colors: { accent: "0 0% 100%", primary: "0 0% 0%" } },
  { name: "Green", value: "green", colors: { accent: "142 76% 45%", primary: "160 60% 35%" } },
  { name: "Red", value: "red", colors: { accent: "0 84% 60%", primary: "0 62% 50%" } },
  { name: "Purple", value: "purple", colors: { accent: "270 70% 60%", primary: "260 60% 50%" } },
  { name: "Gold", value: "gold", colors: { accent: "45 90% 55%", primary: "38 92% 50%" } },
  { name: "Cyan", value: "cyan", colors: { accent: "190 95% 50%", primary: "200 100% 45%" } },
];

export function LandingColorTheme() {
  const [currentTheme, setCurrentTheme] = useState("green");

  useEffect(() => {
    let savedTheme = localStorage.getItem("landing-color-theme") || "green";
    if (savedTheme === "blue") savedTheme = "green";
    setCurrentTheme(savedTheme);
    applyColorTheme(savedTheme);

    // Watch for theme changes (light/dark)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const currentT = localStorage.getItem("landing-color-theme") || "green";
          applyColorTheme(currentT);
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const applyColorTheme = (themeName: string) => {
    const theme = colorThemes.find((t) => t.value === themeName);
    if (theme) {
      const root = document.documentElement;
      const isDark = root.classList.contains("dark");
      
      let accent = theme.colors.accent;
      let primary = theme.colors.primary;
      
      // Handle dynamic "White" theme
      if (themeName === "white") {
        accent = isDark ? "0 0% 100%" : "0 0% 0%";
        primary = isDark ? "0 0% 100%" : "0 0% 0%";
      }

      root.style.setProperty("--accent", accent);
      root.style.setProperty("--primary", primary);
      
      let accentForeground = "0 0% 100%";
      let primaryForeground = "0 0% 100%";

      if (themeName === "white") {
        accentForeground = isDark ? "0 0% 0%" : "0 0% 100%";
        primaryForeground = isDark ? "0 0% 0%" : "0 0% 100%";
      } else if (themeName === "gold") {
        accentForeground = "0 0% 0%";
      }

      root.style.setProperty("--accent-foreground", accentForeground);
      root.style.setProperty("--primary-foreground", primaryForeground);
      root.style.setProperty("--gradient-primary", `linear-gradient(135deg, hsl(${accent}) 0%, hsl(${primary}) 100%)`);
      root.style.setProperty("--gradient-accent", `linear-gradient(135deg, hsl(${primary}) 0%, hsl(${accent}) 100%)`);
      root.style.setProperty("--ring", accent);
      root.style.setProperty("--sidebar-ring", accent);
      root.style.setProperty("--sidebar-primary", isDark ? accent : primary);
      root.style.setProperty("--sidebar-primary-foreground", primaryForeground);
      root.style.setProperty("--sidebar-accent", isDark ? 
        (themeName === 'white' ? '0 0% 15%' : `hsl(${accent} / 0.1)`) : 
        (themeName === 'white' ? '0 0% 95%' : `hsl(${accent} / 0.1)`)
      );
      root.style.setProperty("--sidebar-accent-foreground", isDark ? 
        (themeName === 'white' ? '0 0% 100%' : accent) : 
        (themeName === 'white' ? '0 0% 0%' : accent)
      );
    }
  };

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem("landing-color-theme", themeName);
    applyColorTheme(themeName);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Change color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {colorThemes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => handleThemeChange(theme.value)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="w-4 h-4 rounded-full border-2 border-border"
                style={{
                  background: `hsl(${theme.colors.accent})`,
                }}
              />
              <span>{theme.name}</span>
              {currentTheme === theme.value && (
                <span className="ml-auto text-accent text-lg">✓</span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
