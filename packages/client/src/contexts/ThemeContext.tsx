import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "midnight" | "forest";

interface IThemeContext {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<IThemeContext>({
  theme: "light",
  setTheme: () => {}
});

const themeStorageKey = "monopoly-money-theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(themeStorageKey) as Theme | null;
    return stored ?? "light";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(themeStorageKey, newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
