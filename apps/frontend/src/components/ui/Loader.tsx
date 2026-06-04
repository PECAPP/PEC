'use client';

import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  inline?: boolean;
}

/**
 * Universal Indefinite Progress Loader
 * A sleek, minimal, theme-aware progress bar.
 * Replaces all previous heavy or redundant loaders.
 */
export function Loader({ fullScreen = true, inline = false }: LoaderProps) {
  // Indefinite Progress Bar container
  const containerClass = inline 
    ? "relative w-full h-1 bg-muted/30 overflow-hidden" 
    : fullScreen 
      ? "fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background/95 backdrop-blur-md pointer-events-none"
      : "flex items-center justify-center p-12 w-full min-h-[100px]";

  // The bar itself
  return (
    <div className={containerClass} role="status" aria-label="Loading">
      <div className={`${inline ? "w-full" : "w-64"} h-[4px] bg-secondary/20 relative overflow-hidden`}>
        <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-primary animate-indefinite-bar" />
      </div>

      {!inline && (
        <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.6em] text-primary/40 animate-pulse-loader">
          Loading
        </span>
      )}

      <style jsx global>{`
        @keyframes indefinite-bar {
          0% { transform: translateX(-150%) scaleX(0.5); }
          50% { transform: translateX(20%) scaleX(1.2); }
          100% { transform: translateX(250%) scaleX(0.5); }
        }
        .animate-indefinite-bar {
          animation: indefinite-bar 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
        }
        @keyframes pulse-loader {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .animate-pulse-loader {
          animation: pulse-loader 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Loader;
