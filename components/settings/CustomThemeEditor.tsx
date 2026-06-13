"use client";

import React from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { PRESET_THEMES } from "@/lib/themes/presets";

export default function CustomThemeEditor() {
  const { themeId, customTheme, setCustomTheme, mode } = useTheme() as any;

  const preset = PRESET_THEMES[themeId];
  const baseTokens =
    customTheme ??
    (preset
      ? mode === "dark"
        ? preset.dark
        : preset.light
      : PRESET_THEMES["default"].light);

  function updateToken(key: string, value: string) {
    setCustomTheme({ ...(customTheme ?? baseTokens), [key]: value });
  }

  function resetToPreset() {
    setCustomTheme(null);
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Customize</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          "background",
          "foreground",
          "primary",
          "muted",
          "border",
          "accent",
        ].map((token) => (
          <label key={token} className="flex items-center gap-3">
            <div className="w-32 text-sm">{token}</div>
            <input
              type="color"
              value={(baseTokens as any)[token] ?? "#000000"}
              onChange={(e) => updateToken(token, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn-ghost" onClick={resetToPreset}>
          Reset to preset
        </button>
      </div>
    </div>
  );
}
