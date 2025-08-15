import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "freedevtool-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first for user's explicit choice
    try {
      const stored = localStorage.getItem(storageKey) as Theme;
      if (stored && ["dark", "light", "system"].includes(stored)) {
        return stored;
      }
    } catch (error) {
      console.warn("Failed to read theme from localStorage:", error);
    }
    
    // No stored preference - check if browser/OS provides system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme)").matches) {
      // System supports color scheme preference, use it
      return "system";
    }
    
    // No system preference support - default to light mode
    return "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Add smooth transition for theme changes
    root.style.transition = "background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    root.classList.remove("light", "dark");

    if (theme === "system") {
      // Check if system preference is available
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme)").matches) {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";

        root.classList.add(systemTheme);
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e: MediaQueryListEvent) => {
          root.classList.remove("light", "dark");
          root.classList.add(e.matches ? "dark" : "light");
        };
        
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback to light mode if system preference not available
        root.classList.add("light");
      }
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, theme);
    } catch (error) {
      console.warn("Failed to save theme to localStorage:", error);
    }
  }, [theme, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
