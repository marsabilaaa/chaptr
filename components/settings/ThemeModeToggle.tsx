"use client";

import React from "react";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function ThemeModeToggle() {
  const { mode, setMode } = useTheme() as any;

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Mode</h3>
      <div className="flex gap-2">
        <button
          onClick={() => setMode("light")}
          className={`px-3 py-1 rounded ${mode === "light" ? "bg-muted" : "bg-transparent"}`}
        >
          Light
        </button>
        <button
          onClick={() => setMode("dark")}
          className={`px-3 py-1 rounded ${mode === "dark" ? "bg-muted" : "bg-transparent"}`}
        >
          Dark
        </button>
        <button
          onClick={() => setMode("system")}
          className={`px-3 py-1 rounded ${mode === "system" ? "bg-muted" : "bg-transparent"}`}
        >
          System
        </button>
      </div>
    </div>
  );
}
