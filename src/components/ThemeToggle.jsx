"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" /> // Placeholder to prevent layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#2d2d2f] ring-1 ring-black/5 dark:ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 transition-transform duration-200 overflow-hidden"
            aria-label="Toggle Dark Mode"
        >
            <Sun className={`absolute w-[18px] h-[18px] text-[#1d1d1f] transform ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`} />
            <Moon className={`absolute w-[18px] h-[18px] text-white transform ${theme === 'light' ? 'opacity-0' : 'opacity-100'}`} />
        </button>
    );
}
