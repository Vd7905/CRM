import React, { useState } from "react";
import {useTheme} from "../../hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Palette, Check } from "lucide-react";

export default function ThemeToggle() {
  const { theme, setTheme, color, changeColor } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colorPalettes = {
    purple: { primary: "#8b5cf6", secondary: "#9d4edd" },
    blue: { primary: "#3b82f6", secondary: "#60a5fa" },
    green: { primary: "#10b981", secondary: "#22c55e" },
    orange: { primary: "#f97316", secondary: "#fb923c" },
    amber: { primary: "#f59e0b", secondary: "#fbbf24" },
    rose: { primary: "#f43f5e", secondary: "#f472b6" },
    teal: { primary: "#14b8a6", secondary: "#2dd4bf" },
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/40 hover:bg-accent/80"
      >
        {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </Button>

      <div className="relative">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="h-9 w-9 bg-card/80 backdrop-blur-sm border-border/40 hover:bg-accent/80"
        >
          <Palette className="h-4 w-4" />
        </Button>

        {showColorPicker && (
          <div className="absolute top-12 right-0 bg-card/95 backdrop-blur-sm border border-border/40 rounded-lg p-3 shadow-lg min-w-[200px]">
            <p className="text-sm font-medium mb-2 text-text">Colors</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(colorPalettes).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    changeColor(c);
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center justify-between w-full p-2 rounded text-sm transition-colors 
                    ${color === c ? "bg-[var(--primary)]/20" : "hover:bg-accent/50"}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border flex-shrink-0"
                      style={{ background: colorPalettes[c].primary }}
                    />
                    <span
                      className={`capitalize text-[var(--text)] ${color === c ? "font-bold" : ""}`}
                    >
                      {c}
                    </span>
                  </div>

                  {color === c && <Check className="h-3 w-3 text-[var(--primary)] flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
