'use client';

import { useEffect, useState } from 'react';
import { MoonIcon, SunIcon } from './icons';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    setMounted(true);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light');
      } catch {
        // armazenamento indisponível
      }
      return next;
    });
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        mounted
          ? isDark
            ? 'Ativar tema claro'
            : 'Ativar tema escuro'
          : 'Alternar tema'
      }
      className="btn-secondary inline-flex h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-full px-3.5 text-sm font-medium"
    >
      {mounted && !isDark ? (
        <>
          <MoonIcon className="h-4 w-4 text-[var(--ink-secondary)]" />
          <span className="hidden sm:inline">Escuro</span>
        </>
      ) : (
        <>
          <SunIcon className="h-4 w-4 text-[var(--accent-text)]" />
          <span className="hidden sm:inline">Claro</span>
        </>
      )}
    </button>
  );
}
