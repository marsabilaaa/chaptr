"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  PRESET_THEMES,
  DEFAULT_THEME_ID,
  type ThemePreset,
  type ThemeTokens,
} from "@/lib/themes/presets";

type Mode = "light" | "dark" | "system";

type ThemeContextValue = {
  themeId: string;
  customTheme: ThemeTokens | null;
  mode: Mode;
  setThemeId: (id: string) => void;
  setCustomTheme: (t: ThemeTokens | null) => void;
  setMode: (m: Mode) => void;
  applyTheme: (tokens: ThemeTokens) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

function setCSSVars(tokens: ThemeTokens) {
  const root = document.documentElement;
  root.style.setProperty("--background", tokens.background);
  root.style.setProperty("--foreground", tokens.foreground);
  root.style.setProperty("--primary", tokens.primary);
  root.style.setProperty("--muted", tokens.muted);
  root.style.setProperty("--border", tokens.border);
  root.style.setProperty("--accent", tokens.accent);
}

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [themeId, setThemeIdState] = useState<string>(DEFAULT_THEME_ID);
  const [customTheme, setCustomThemeState] = useState<ThemeTokens | null>(null);
  const [mode, setModeState] = useState<Mode>("system");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/preferences");
        if (!res.ok) throw new Error("pref fetch failed");
        const data = await res.json();
        setThemeIdState(data.themeId ?? DEFAULT_THEME_ID);
        setCustomThemeState(data.customTheme ?? null);
        setModeState(data.mode ?? "system");
      } catch (e) {
        const cached = localStorage.getItem("chaptr:theme");
        if (cached) {
          const parsed = JSON.parse(cached);
          setThemeIdState(parsed.themeId ?? DEFAULT_THEME_ID);
          setCustomThemeState(parsed.customTheme ?? null);
          setModeState(parsed.mode ?? "system");
        }
      }
    }
    init();
  }, []);

  useEffect(() => {
    const preset: ThemePreset | undefined = PRESET_THEMES[themeId];

    // determine effective mode (respect system when selected)
    let effectiveMode: "light" | "dark" = "light";
    if (mode === "system") {
      try {
        effectiveMode =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
      } catch (e) {
        effectiveMode = "light";
      }
    } else {
      effectiveMode = mode === "dark" ? "dark" : "light";
    }

    const tokens =
      customTheme ??
      (preset
        ? (preset as any)[effectiveMode]
        : PRESET_THEMES[DEFAULT_THEME_ID].light);
    setCSSVars(tokens);
    localStorage.setItem(
      "chaptr:theme",
      JSON.stringify({ themeId, customTheme, mode }),
    );
  }, [themeId, customTheme, mode]);

  useEffect(() => {
    function applyMode(m: Mode) {
      const root = document.documentElement;
      if (m === "system") {
        const dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.toggle("dark", dark);
      } else {
        root.classList.toggle("dark", m === "dark");
      }
    }
    applyMode(mode);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode(mode);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const value: ThemeContextValue = {
    themeId,
    customTheme,
    mode,
    setThemeId: (id: string) => setThemeIdState(id),
    setCustomTheme: (t: ThemeTokens | null) => setCustomThemeState(t),
    setMode: (m: Mode) => setModeState(m),
    applyTheme: setCSSVars,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
