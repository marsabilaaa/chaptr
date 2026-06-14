"use client";

import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";

type Mode = "light" | "dark" | "system";

const OPTIONS: { value: Mode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="h-3.5 w-3.5" /> },
  { value: "dark", label: "Dark", icon: <Moon className="h-3.5 w-3.5" /> },
  { value: "system", label: "System", icon: <Monitor className="h-3.5 w-3.5" /> },
];

export default function ThemeModeToggle() {
  const { mode, setMode } = useTheme() as any;

  return (
    <div className="inline-flex rounded-lg border border-border/50 p-0.5 gap-0.5 bg-muted/30">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setMode(opt.value)}
          className={`
            flex items-center gap-1.5 px-3 h-8 rounded-md text-[13px] transition-colors
            ${mode === opt.value
              ? "bg-background text-foreground font-medium shadow-sm border border-border/50"
              : "text-muted-foreground hover:text-foreground"
            }
          `}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}