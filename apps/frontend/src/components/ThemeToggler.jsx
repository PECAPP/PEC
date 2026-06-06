import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-none" disabled>
        <div className="h-4 w-4 animate-pulse bg-muted rounded-full" />
      </Button>
    );
  }

  const toggleTheme = (event) => {
    if (
      typeof document === "undefined" ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(theme === "dark" ? "light" : "dark");
      return;
    }

    // Set swipe center variables to center of the viewport
    document.documentElement.style.setProperty("--swipe-x", "50%");
    document.documentElement.style.setProperty("--swipe-y", "50%");

    document.startViewTransition(() => {
      setTheme(theme === "dark" ? "light" : "dark");
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-none"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 scale-100" />
      ) : (
        <Moon className="h-4 w-4" />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
