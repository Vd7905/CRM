import React, { createContext, useState, useEffect } from "react";
import "../styles/variables.css";

const ThemeContext = createContext();

const themes = {
  light: {
    background: "var(--background-light)",
    foreground: "var(--foreground-light)",
    muted: "var(--muted-light)",
    card: "var(--card-light)",
    text: "var(--text-light)",
  },
  dark: {
    background: "var(--background-dark)",
    foreground: "var(--foreground-dark)",
    muted: "var(--muted-dark)",
    card: "var(--card-dark)",
    text: "var(--text-dark)",
  },
};

const colorPalettes = {
  purple: { primary: "var(--purple-primary)", secondary: "var(--purple-secondary)" },
  blue: { primary: "var(--blue-primary)", secondary: "var(--blue-secondary)" },
  green: { primary: "var(--green-primary)", secondary: "var(--green-secondary)" },
  orange: { primary: "var(--orange-primary)", secondary: "var(--orange-secondary)" },
  amber: { primary: "var(--amber-primary)", secondary: "var(--amber-secondary)" },
  rose: { primary: "var(--rose-primary)", secondary: "var(--rose-secondary)" },
  teal: { primary: "var(--teal-primary)", secondary: "var(--teal-secondary)" },
};

export function ThemeProvider({ children }) {
  // Initialize from localStorage or default
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [color, setColor] = useState(localStorage.getItem("color") || "purple");

  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme];
    const palette = colorPalettes[color];

    // Apply theme variables
    Object.entries(currentTheme).forEach(([key, value]) =>
      root.style.setProperty(`--${key}`, value)
    );

    // Apply color variables
    Object.entries(palette).forEach(([key, value]) =>
      root.style.setProperty(`--${key}`, value)
    );

    // Save to localStorage
    localStorage.setItem("theme", theme);
    localStorage.setItem("color", color);
  }, [theme, color]);

  const changeColor = (newColor) => setColor(newColor);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, color, changeColor, colorPalettes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
