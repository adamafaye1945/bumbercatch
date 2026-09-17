import { Sun, Moon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggleButton() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button variant="outline" size="sm" onClick={toggleTheme} className="-ml-1">
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
