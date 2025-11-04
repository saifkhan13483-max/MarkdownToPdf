import { FileText, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
    console.log("Theme toggled:", newIsDark ? "dark" : "light");
  };

  return (
    <header className="h-14 sm:h-16 border-b flex items-center px-4 sm:px-6 gap-2 sm:gap-4" role="banner">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" data-testid="icon-logo" />
        <span className="text-lg sm:text-xl font-semibold" data-testid="text-app-title">
          Markdown to PDF
        </span>
      </div>
      <div className="ml-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <Sun className="w-5 h-5" aria-hidden="true" data-testid="icon-sun" />
          ) : (
            <Moon className="w-5 h-5" aria-hidden="true" data-testid="icon-moon" />
          )}
        </Button>
      </div>
    </header>
  );
}
