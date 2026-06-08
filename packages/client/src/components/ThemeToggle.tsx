import React from "react";
import { Dropdown } from "react-bootstrap";
import { useTheme } from "../contexts/ThemeContext";

interface IThemeToggleProps {
  block?: boolean;
}

const themeLabels: Record<string, string> = {
  light: "☀️ Light",
  dark: "🌙 Dark",
  midnight: "🌌 Midnight",
  forest: "🌲 Forest"
};

const ThemeToggle: React.FC<IThemeToggleProps> = ({ block = false }) => {
  const { theme, setTheme } = useTheme();

  return (
    <Dropdown className={block ? "d-grid" : ""}>
      <Dropdown.Toggle
        variant="outline-secondary"
        id="theme-dropdown"
        className={block ? "w-100" : ""}
      >
        Theme: {themeLabels[theme] ?? theme}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {(["light", "dark", "midnight", "forest"] as const).map((t) => (
          <Dropdown.Item key={t} active={theme === t} onClick={() => setTheme(t)}>
            {themeLabels[t]}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeToggle;
