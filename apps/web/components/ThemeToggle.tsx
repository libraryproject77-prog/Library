'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('fxec_theme') as 'light' | 'dark' | null;
    if (savedTheme === 'dark') {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      // Default to Light theme as requested!
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('fxec_theme', nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-surface-low border border-stroke-glass ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all border ${
        theme === 'light'
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20'
          : 'bg-aura-purple/20 border-aura-purple/40 text-aura-neon hover:bg-aura-purple/30'
      } ${className}`}
      title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
    >
      {theme === 'light' ? (
        <>
          <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
          <span className="hidden sm:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-aura-neon" />
          <span className="hidden sm:inline">Dark</span>
        </>
      )}
    </button>
  );
}
