"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { PRESET_THEMES } from "@/lib/themes/presets";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const TOKEN_LABELS: Record<string, string> = {
  background: "Background",
  foreground: "Text",
  primary: "Primary",
  muted: "Muted",
  border: "Border",
  accent: "Accent",
};

function resolveEffectiveMode(mode: string): "light" | "dark" {
  if (mode === "dark") return "dark";
  if (mode === "light") return "light";
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export default function CustomThemeEditor() {
  const { themeId, customTheme, setCustomTheme, mode } = useTheme() as any;
  const effectiveMode = resolveEffectiveMode(mode);

  const preset = PRESET_THEMES[themeId];
  const baseTokens =
    customTheme ??
    (preset ? (preset as any)[effectiveMode] : PRESET_THEMES["default"].light);

  function updateToken(key: string, value: string) {
    setCustomTheme({ ...(customTheme ?? baseTokens), [key]: value });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {Object.keys(TOKEN_LABELS).map((token) => (
          <div
            key={token}
            className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/50 bg-muted/20"
          >
            <div className="flex items-center gap-2.5">
              <div
                className="h-6 w-6 rounded-md border border-border/50 shrink-0"
                style={{ background: (baseTokens as any)[token] ?? "#000" }}
              />
              <span className="text-[13px] text-foreground">
                {TOKEN_LABELS[token]}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground font-mono">
                {(baseTokens as any)[token] ?? "—"}
              </span>
              <input
                type="color"
                value={(baseTokens as any)[token] ?? "#000000"}
                onChange={(e) => updateToken(token, e.target.value)}
                className="h-6 w-6 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </div>
          </div>
        ))}
      </div>

      {customTheme && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCustomTheme(null)}
          className="gap-1.5 text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to preset
        </Button>
      )}
    </div>
  );
}