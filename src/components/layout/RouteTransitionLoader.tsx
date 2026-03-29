'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState, Suspense } from 'react';

const isModifiedEvent = (event: MouseEvent | ReactMouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

function RouteTransitionLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  const currentRouteKey = useMemo(() => {
    const params = searchParams.toString();
    return `${pathname}${params ? `?${params}` : ''}`;
  }, [pathname, searchParams]);

  const previousRouteKeyRef = useRef(currentRouteKey);
  const startTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  const startNavigation = () => {
    if (!mountedRef.current) return;
    if (startTimerRef.current !== null) {
      window.clearTimeout(startTimerRef.current);
    }
    // Defer state update so we never schedule from internal insertion/history phases.
    startTimerRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setIsNavigating(true);
      }
      startTimerRef.current = null;
    }, 0);
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
        startTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (previousRouteKeyRef.current !== currentRouteKey) {
      setIsNavigating(false);
      previousRouteKeyRef.current = currentRouteKey;
    }
  }, [currentRouteKey]);

  useEffect(() => {
    if (!isNavigating) return;
    const timeout = window.setTimeout(() => setIsNavigating(false), 15000);
    return () => window.clearTimeout(timeout);
  }, [isNavigating]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== '_self') {
        return;
      }

      if (anchor.hasAttribute('download') || anchor.getAttribute('rel')?.includes('external')) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      const isInternal = nextUrl.origin === window.location.origin;
      const isSameRoute =
        nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search;

      if (!isInternal || isSameRoute) {
        return;
      }

      startNavigation();
    };

    const handlePopState = () => {
      startNavigation();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    const shouldStartForUrl = (url: string | URL | null | undefined) => {
      if (!url) return false;
      const nextUrl = new URL(url.toString(), window.location.href);
      const isInternal = nextUrl.origin === window.location.origin;
      const isDifferentRoute =
        nextUrl.pathname !== window.location.pathname || nextUrl.search !== window.location.search;
      return isInternal && isDifferentRoute;
    };

    window.history.pushState = function (...args) {
      if (shouldStartForUrl(args[2])) {
        startNavigation();
      }
      return originalPushState.apply(this, args);
    };

    window.history.replaceState = function (...args) {
      if (shouldStartForUrl(args[2])) {
        startNavigation();
      }
      return originalReplaceState.apply(this, args);
    };

    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  if (!isNavigating) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4" role="status" aria-live="polite" aria-label="Loading page">
        <div className="h-11 w-11 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <p className="text-sm font-medium text-foreground/80">Loading page...</p>
      </div>
    </div>
  );
}

export function RouteTransitionLoader() {
  return (
    <Suspense fallback={null}>
      <RouteTransitionLoaderInner />
    </Suspense>
  );
}
