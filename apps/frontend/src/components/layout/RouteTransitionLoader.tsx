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
  const mountedRef = useRef(false);

  const startNavigation = () => {
    if (mountedRef.current) {
      // Defer the state update to the next event loop tick to avoid scheduling updates during React's insertion effect phase
      setTimeout(() => {
        if (mountedRef.current) {
          setIsNavigating(true);
        }
      }, 0);
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
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
    const timeout = window.setTimeout(() => {
      setIsNavigating(false);
    }, 15000);
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
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        height: '3px',
        background: 'transparent',
      }}
    >
      <div
        style={{
          height: '100%',
          width: '100%',
          background: 'hsl(var(--primary))',
          animation: 'route-progress 1.4s cubic-bezier(0.65,0.815,0.735,0.395) infinite',
          boxShadow: '0 0 10px hsl(var(--primary) / 0.6)',
        }}
      />
      <style>{`
        @keyframes route-progress {
          0%   { transform: translateX(-100%) scaleX(0.4); }
          50%  { transform: translateX(10%) scaleX(1.1); }
          100% { transform: translateX(110%) scaleX(0.4); }
        }
      `}</style>
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
