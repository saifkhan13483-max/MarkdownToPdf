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
    <header className="h-16 border-b flex items-center px-6 gap-4">
      <div className="flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary" data-testid="icon-logo" />
        <h1 className="text-xl font-semibold" data-testid="text-app-title">
          Markdown to PDF
        </h1>
      </div>
      <div className="ml-auto">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-5 h-5" data-testid="icon-sun" />
          ) : (
            <Moon className="w-5 h-5" data-testid="icon-moon" />
          )}
        </Button>
      </div>
    </header>
  );
}
