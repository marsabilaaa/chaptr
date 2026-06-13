"use client";

import ThemePicker from "@/components/settings/ThemePicker";
import CustomThemeEditor from "@/components/settings/CustomThemeEditor";
import ThemeModeToggle from "@/components/settings/ThemeModeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";

export default function SettingsPage() {
  const { themeId, customTheme, mode } = useTheme() as any;

  async function saveAll() {
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId, customTheme, mode }),
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: "var(--foreground)" }}
      >
        Appearance
      </h1>
      <section
        className="p-4 rounded-md"
        style={{
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
        }}
      >
        <ThemePicker />
        <CustomThemeEditor />
        <ThemeModeToggle />

        <div className="mt-6">
          <button className="btn-primary" onClick={saveAll}>
            Save preferences
          </button>
        </div>
      </section>
    </div>
  );
}
