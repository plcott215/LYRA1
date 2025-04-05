import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSubscription } from "./subscription-context";

interface ThemeContextProps {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  isDarkMode: boolean;
  canToggleTheme: boolean;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
  isDarkMode: false,
  canToggleTheme: false,
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { isPro } = useSubscription();
  const [theme, setThemeState] = useState<"light" | "dark" | "system">("light");
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Function to set the theme
  const setTheme = (newTheme: "light" | "dark" | "system") => {
    // Everyone can use all themes - Pro restriction removed
    
    // Set theme in localStorage
    localStorage.setItem("lyra-theme", newTheme);
    setThemeState(newTheme);
    
    // Apply theme
    applyTheme(newTheme);
  };
  
  // Function to apply the theme to the document
  const applyTheme = (currentTheme: string) => {
    const doc = document.documentElement;
    
    // Remove existing theme classes
    doc.classList.remove("light", "dark");
    
    // Determine if we should use dark mode
    let useDarkMode = false;
    
    if (currentTheme === "dark") {
      useDarkMode = true;
    } else if (currentTheme === "system") {
      useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    
    // Add appropriate class
    doc.classList.add(useDarkMode ? "dark" : "light");
    setIsDarkMode(useDarkMode);
  };
  
  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);
  
  // On initial load, check localStorage or use default
  useEffect(() => {
    const savedTheme = localStorage.getItem("lyra-theme") as "light" | "dark" | "system" | null;
    
    // Allow any theme for all users - Pro restriction removed
    
    // If there's a saved theme, use it
    if (savedTheme) {
      setThemeState(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default is light mode
      setTheme("light");
    }
  }, []);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDarkMode,
        canToggleTheme: true, // All users can toggle theme now
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};