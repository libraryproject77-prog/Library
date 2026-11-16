'use client';

import { useEffect } from 'react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  useEffect(() => {
    try {
      localStorage.removeItem('fxec_theme');
      document.documentElement.classList.remove('dark');
    } catch (e) {}
  }, []);

  return null;
}
