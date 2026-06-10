'use client';
import { TooltipProvider, Toaster, Toaster as Sonner } from "@pec/ui";


import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Initialize accent color from localStorage on page load
const initAccentColor = () => {
  if (typeof window === 'undefined') return;
  const savedAccent = localStorage.getItem('accent-color');
  const accent = savedAccent === 'golden' || !savedAccent ? 'pec-gold' : savedAccent;
  const root = document.documentElement;
  root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-golden', 'accent-pec-gold');
  root.classList.add(`accent-${accent}`);
  localStorage.setItem('accent-color', accent);
  document.cookie = `accent-color=${accent}; path=/; max-age=31536000`; // Ensure cookie is always synced
  root.removeAttribute('style');
};

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAccentColor();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accent-color') {
        initAccentColor();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <TooltipProvider delayDuration={0}>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
