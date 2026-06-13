/**
 * SSR-safe wrappers for browser-only APIs.
 *
 * These are safe to call during SSR/RSC — they return `null`/`false`/`''`
 * on the server and delegate to the real browser API on the client.
 * This prevents Next.js hydration mismatches.
 */

export const isBrowser = (): boolean => typeof window !== 'undefined';

export const safeLocalStorage = {
  get: (key: string): string | null => {
    if (!isBrowser()) return null;
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set: (key: string, value: string): void => {
    if (!isBrowser()) return;
    try { window.localStorage.setItem(key, value); } catch {}
  },
  remove: (key: string): void => {
    if (!isBrowser()) return;
    try { window.localStorage.removeItem(key); } catch {}
  },
};

export const safeDocument = {
  /**
   * Read a specific cookie by name. Returns `null` on server.
   */
  getCookie: (name: string): string | null => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
  },
  /**
   * Check if a cookie with a given prefix exists. Returns `false` on server.
   */
  hasCookiePrefix: (prefix: string): boolean => {
    if (typeof document === 'undefined') return false;
    return document.cookie.split(';').some((c) => c.trim().startsWith(prefix));
  },
  /**
   * Set a CSS custom property on documentElement. No-op on server.
   */
  setCssVar: (property: string, value: string): void => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(property, value);
  },
  /**
   * Toggle CSS classes on documentElement. No-op on server.
   */
  toggleRootClass: (remove: string[], add: string): void => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.remove(...remove);
    document.documentElement.classList.add(add);
  },
};

export const safeWindow = {
  /**
   * Get current pathname. Returns `''` on server.
   */
  getPathname: (): string => {
    if (!isBrowser()) return '';
    return window.location.pathname;
  },
  /**
   * Navigate to a URL. No-op on server.
   */
  navigate: (url: string): void => {
    if (!isBrowser()) return;
    window.location.href = url;
  },
  /**
   * Get inner width. Returns `0` on server (treat as unknown until mounted).
   */
  getInnerWidth: (): number => {
    if (!isBrowser()) return 0;
    return window.innerWidth;
  },
  /**
   * Dispatch a custom event. No-op on server.
   */
  dispatch: (event: string): void => {
    if (!isBrowser()) return;
    window.dispatchEvent(new Event(event));
  },
};
