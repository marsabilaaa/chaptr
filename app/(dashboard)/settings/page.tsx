"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ThemePicker from "@/components/settings/ThemePicker";
import CustomThemeEditor from "@/components/settings/CustomThemeEditor";
import ThemeModeToggle from "@/components/settings/ThemeModeToggle";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { themeId, customTheme, mode } = useTheme() as any;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function saveAll() {
    setSaving(true);
    await fetch("/api/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ themeId, customTheme, mode }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => router.push("/documents")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-[17px] font-medium tracking-tight">Settings</h1>
          <p className="text-[12px] text-muted-foreground">Appearance & preferences</p>
        </div>
      </div>

      <div className="h-px bg-border/50" />

      {/* Mode */}
      <section className="space-y-4">
        <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground">
          Mode
        </p>
        <ThemeModeToggle />
      </section>

      <div className="h-px bg-border/50" />

      {/* Presets */}
      <section className="space-y-4">
        <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground">
          Theme
        </p>
        <ThemePicker />
      </section>

      <div className="h-px bg-border/50" />

      {/* Custom */}
      <section className="space-y-4">
        <div>
          <p className="text-[11px] font-medium tracking-[0.5px] uppercase text-muted-foreground">
            Customize
          </p>
          <p className="text-[12px] text-muted-foreground mt-1">
            Override individual color tokens. Changes preview instantly.
          </p>
        </div>
        <CustomThemeEditor />
      </section>

      <div className="h-px bg-border/50" />

      {/* Save */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-muted-foreground">
          Changes preview instantly. Save to persist across devices.
        </p>
        <Button
          size="sm"
          onClick={saveAll}
          disabled={saving}
          className="gap-1.5"
        >
          {saved ? <><Check className="h-3.5 w-3.5" /> Saved</> : saving ? "Saving..." : "Save preferences"}
        </Button>
      </div>
    </div>
  );
}