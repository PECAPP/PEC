import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * SSR-safe mobile breakpoint hook.
 *
 * Returns `false` on the server (safe default — avoids hydration mismatch).
 * On the client, updates immediately after mount via useEffect.
 *
 * Consumers that need to distinguish "unknown/server" vs "mobile" should
 * check the raw state — this hook intentionally collapses undefined to false
 * to keep the common case simple.
 */
export function useIsMobile() {
  // SSR-SAFE: Start as false (not undefined) so server and client initial
  // render agree. The real value is set in useEffect (client-only).
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    // Set the real value now that we're on the client
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
