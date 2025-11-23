"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { appConfig } from '@/config/app.config';

type ThemeMode = 'dark' | 'light' | 'white';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>(() => {
        // Check if we're in the browser
        if (typeof window !== 'undefined') {
            // Try to get from local storage
            const savedTheme = localStorage.getItem('theme') as ThemeMode;
            if (savedTheme && ['dark', 'light', 'white'].includes(savedTheme)) {
                return savedTheme;
            }

            // Fallback to config default (handling 'system' if needed in future, but mapping to concrete mode for now)
            const defaultMode = appConfig.theme.defaultMode;
            if (defaultMode === 'system') {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return defaultMode as ThemeMode;
        }
        return 'dark'; // Server-side default
    });

    useEffect(() => {
        const root = document.documentElement;

        // Remove all theme classes
        root.classList.remove('dark', 'light', 'white');

        // Add current theme class
        root.classList.add(theme);

        // Save to local storage
        localStorage.setItem('theme', theme);
    }, [theme]);

    const setTheme = (newTheme: ThemeMode) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
