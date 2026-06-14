"use client";

import { PRESET_THEMES } from "@/lib/themes/presets";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Check } from "lucide-react";

const DISPLAY_NAMES: Record<string, string> = {
  default: "Default",
  midnight: "Midnight",
  sepia: "Sepia",
  forest: "Forest",
  rose: "Rose",
};

function resolveEffectiveMode(mode: string): "light" | "dark" {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export default function ThemePicker() {
  const { themeId, setThemeId, setCustomTheme, mode } = useTheme() as any;
  const effectiveMode = resolveEffectiveMode(mode);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {Object.entries(PRESET_THEMES).map(([id, preset]) => {
        const tokens = (preset as any)[effectiveMode] ?? (preset as any).light;
        const active = id === themeId;

        return (
          <button
            key={id}
            onClick={() => { setThemeId(id); setCustomTheme(null); }}
            className={`
              relative rounded-xl p-3 border text-left transition-colors
              ${active
                ? "border-foreground/30 bg-accent/20"
                : "border-border/50 hover:border-border hover:bg-accent/10"
              }
            `}
          >
            {/* Swatch */}
            <div
              className="h-12 w-full rounded-lg mb-2.5 overflow-hidden flex gap-0.5"
              style={{ background: tokens.background }}
            >
              <div className="flex-1 h-full" style={{ background: tokens.background }} />
              <div className="w-3 h-full" style={{ background: tokens.primary }} />
              <div className="w-3 h-full" style={{ background: tokens.accent }} />
              <div className="w-3 h-full" style={{ background: tokens.muted }} />
            </div>

            {/* Label */}
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-foreground">
                {DISPLAY_NAMES[id] ?? id}
              </p>
              {active && (
                <div className="h-4 w-4 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-background" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}