import { useEffect, useState } from "react";
import { type Theme, ThemeProviderContext } from "@/contexts/theme-context";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        return stored;
      }
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Save to localStorage before updating state
      localStorage.setItem("theme", theme);
      setThemeState(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Hook moved to separate file to fix fast refresh
