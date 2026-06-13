"use client";

import React, { useState } from "react";
import { PRESET_THEMES } from "@/lib/themes/presets";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemePicker() {
  const { themeId, setThemeId, setCustomTheme, mode } = useTheme() as any;

  const handleSelect = (id: string) => {
    setThemeId(id);
    setCustomTheme(null);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Presets</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(PRESET_THEMES).map(([id, preset]) => {
          const effective =
            (preset as any)[mode === "dark" ? "dark" : "light"] ?? preset.light;
          const swatch = effective.background;
          const active = id === themeId;
          return (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className={`rounded-md p-3 border ${active ? "ring-2 ring-offset-2" : "hover:brightness-95"}`}
            >
              <div
                className="h-16 w-full rounded-md overflow-hidden border"
                style={{ background: swatch }}
              />
              <div
                className="mt-2 text-sm"
                style={{ color: "var(--foreground)" }}
              >
                {id}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
