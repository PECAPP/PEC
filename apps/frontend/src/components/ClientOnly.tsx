'use client';
import { useEffect, useState, type ReactNode } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  /** Shown during SSR and before hydration completes. Defaults to null. */
  fallback?: ReactNode;
}

/**
 * Renders `children` only on the client after hydration.
 *
 * Use this to wrap third-party components that access browser globals
 * (window, document, navigator) during their module initialization or render:
 * - recharts, Chart.js, Leaflet, vaul, canvas-based libraries
 * - Any component that conditionally renders based on window.innerWidth
 * - Anything that uses localStorage/sessionStorage at render time
 *
 * @example
 * <ClientOnly fallback={<Skeleton />}>
 *   <RechartsChart data={data} />
 * </ClientOnly>
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{children}</> : <>{fallback}</>;
}
