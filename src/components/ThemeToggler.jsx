import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="h-9 w-9 rounded-none"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4  scale-100 " />
      ) : (
        <Moon className="absolute h-4 w-4 " />
      )}

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
