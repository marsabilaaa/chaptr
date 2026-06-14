export type ThemeTokens = {
  background: string;
  foreground: string;
  primary: string;
  muted: string;
  border: string;
  accent: string;
};

export type ThemePreset = {
  light: ThemeTokens;
  dark: ThemeTokens;
  description?: string;
};

export const PRESET_THEMES: Record<string, ThemePreset> = {
  default: {
    description: "Neutral slate/white",
    light: {
      background: "#fdfcfb",
      foreground: "#27272a",
      primary: "#18181b",
      muted: "#71717a",
      border: "#e4e4e7",
      accent: "#f4f4f5",
    },
    dark: {
      background: "#09090b",
      foreground: "#f4f4f5",
      primary: "#fafafa",
      muted: "#a1a1aa",
      border: "#27272a",
      accent: "#27272a",
    },
  },

  midnight: {
    description: "Dark navy focused",
    light: {
      background: "#f8fafc",
      foreground: "#071133",
      primary: "#2563eb",
      muted: "#6b7280",
      border: "#e6eef8",
      accent: "#7dd3fc",
    },
    dark: {
      background: "#001220",
      foreground: "#dbeafe",
      primary: "#60a5fa",
      muted: "#94a3b8",
      border: "#052033",
      accent: "#38bdf8",
    },
  },

  sepia: {
    description: "Warm cream, writing-friendly",
    light: {
      background: "#fff7ed",
      foreground: "#3b2f2f",
      primary: "#b0722e",
      muted: "#8b6b5d",
      border: "#ecd9c6",
      accent: "#d68a5b",
    },
    dark: {
      background: "#1c1410",
      foreground: "#f5efe6",
      primary: "#d9965b",
      muted: "#bfa390",
      border: "#3a2c23",
      accent: "#f2cfa1",
    },
  },

  forest: {
    description: "Deep greens for concentration",
    light: {
      background: "#f6fbf7",
      foreground: "#053116",
      primary: "#14532d",
      muted: "#4b7761",
      border: "#dfeee0",
      accent: "#16a34a",
    },
    dark: {
      background: "#03140a",
      foreground: "#dff7e8",
      primary: "#34d399",
      muted: "#7da08a",
      border: "#0b2a18",
      accent: "#34d399",
    },
  },

  rose: {
    description: "Soft pink / warm",
    light: {
      background: "#fff7fa",
      foreground: "#3a1224",
      primary: "#ec4899",
      muted: "#d6a3bf",
      border: "#f6d9e6",
      accent: "#f472b6",
    },
    dark: {
      background: "#2a0f16",
      foreground: "#ffd9ea",
      primary: "#f472b6",
      muted: "#c77a95",
      border: "#3b1220",
      accent: "#ff7ab6",
    },
  },
};

export const DEFAULT_THEME_ID = "default";
