'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Initialize accent color from localStorage on page load
const initAccentColor = () => {
  if (typeof window === 'undefined') return;
  const savedAccent = localStorage.getItem('accent-color');
  const accent = savedAccent === 'golden' || !savedAccent ? 'pec-gold' : savedAccent;
  const root = document.documentElement;
  root.classList.remove('accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-golden', 'accent-pec-gold');
  root.classList.add(`accent-${accent}`);
  localStorage.setItem('accent-color', accent);
  root.removeAttribute('style');
};

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAccentColor();
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
