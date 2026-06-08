import React, { createContext, useContext, useEffect } from "react";

interface IThemeContext {
  theme: "dark";
  setTheme: (theme: "dark") => void;
}

const ThemeContext = createContext<IThemeContext>({
  theme: "dark",
  setTheme: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: "dark", setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
