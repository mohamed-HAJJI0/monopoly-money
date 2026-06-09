import React from "react";
import { Dropdown } from "react-bootstrap";
import { useTheme, type Theme } from "../contexts/ThemeContext";

const themeConfig: { id: Theme; label: string; emoji: string; dotColor: string }[] = [
  { id: "obsidian", label: "Obsidian", emoji: "🔴", dotColor: "#c10007" },
  { id: "midnight", label: "Midnight", emoji: "🔵", dotColor: "#6366f1" },
  { id: "emerald", label: "Emerald", emoji: "🟢", dotColor: "#059669" },
  { id: "amber", label: "Amber", emoji: "🟡", dotColor: "#d97706" }
];

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const current = themeConfig.find((t) => t.id === theme) ?? themeConfig[0];

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="outline-secondary"
        id="theme-dropdown"
        className="theme-toggle-btn"
        size="sm"
      >
        <span
          className="theme-dot"
          style={{ backgroundColor: current.dotColor }}
        />
        <span className="theme-label">{current.label}</span>
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {themeConfig.map((t) => (
          <Dropdown.Item
            key={t.id}
            active={theme === t.id}
            onClick={() => setTheme(t.id)}
            className="theme-menu-item"
          >
            <span className="theme-dot" style={{ backgroundColor: t.dotColor }} />
            <span>{t.label}</span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ThemeToggle;
