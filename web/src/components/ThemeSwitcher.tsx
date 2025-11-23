"use client";

import { useTheme } from "@/context/ThemeContext";
import { appConfig } from "@/config/app.config";

export function ThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const modes = appConfig.theme.modes;

    return (
        <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-muted">
            <span className="text-sm font-medium text-muted-foreground mr-2">Theme:</span>
            <button
                onClick={() => setTheme(modes.dark)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === modes.dark
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
            >
                Dark
            </button>
            <button
                onClick={() => setTheme(modes.light)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === modes.light
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
            >
                Light
            </button>
            <button
                onClick={() => setTheme(modes.white)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${theme === modes.white
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    }`}
            >
                White
            </button>
        </div>
    );
}
