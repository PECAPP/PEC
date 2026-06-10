import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────
// Type declarations
// ─────────────────────────────────────────────────────────────
interface GoogleTranslateElement {
  TranslateElement: {
    new (
      options: {
        pageLanguage: string;
        layout?: unknown;
        autoDisplay?: boolean;
        includedLanguages?: string;
      },
      elementId: string
    ): void;
    InlineLayout: { SIMPLE: unknown; HORIZONTAL: unknown; VERTICAL: unknown };
  };
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    __googleTranslateLoadingPromise?: Promise<void>;
    google?: { translate?: GoogleTranslateElement };
  }
}

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────
const LANGUAGE_STORAGE_KEY = 'ui.language';
const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';
const WIDGET_CONTAINER_ID = '__gt_singleton_container__';

const languageOptions = [
  { value: 'en', nativeLabel: 'English', flag: '' },
  { value: 'hi', nativeLabel: 'हिन्दी', flag: '' },
  { value: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', flag: '' },
];

const includedLanguages = languageOptions.map((l) => l.value).join(',');

// ─────────────────────────────────────────────────────────────
// Module-level singleton state
// ─────────────────────────────────────────────────────────────
type Status = 'idle' | 'translating' | 'blocked';

let _language: string = 'en';
let _status: Status = 'idle';
const _subscribers: Set<() => void> = new Set();
let _widgetCreated = false;

function notifySubscribers() {
  _subscribers.forEach((fn) => fn());
}

function readStoredLanguage(): string {
  try {
    const v = localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'en';
    return languageOptions.some((l) => l.value === v) ? v : 'en';
  } catch {
    return 'en';
  }
}

// ─────────────────────────────────────────────────────────────
// Cookie helpers
// ─────────────────────────────────────────────────────────────
function setGoogtransCookie(language: string) {
  const host = window.location.hostname;
  const isLocalhost = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

  if (language === 'en') {
    document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
    if (!isLocalhost) {
      document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${host}`;
    }
  } else {
    const value = `/en/${language}`;
    document.cookie = `googtrans=${value};expires=${expires};path=/`;
    if (!isLocalhost) {
      document.cookie = `googtrans=${value};expires=${expires};path=/;domain=.${host}`;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// The fast approach: cookie → reload
//
// Google Translate processes the `googtrans` cookie *before* the
// page renders (via its proxy), so translation is applied instantly
// on load. The inline combo-based approach requires a network call
// + full DOM walk after load, causing 2-5 s delay.
// ─────────────────────────────────────────────────────────────
function applyLanguageViaCookieReload(language: string) {
  // Persist preference
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    /* noop */
  }

  // Set / clear the googtrans cookie
  setGoogtransCookie(language);

  // Also try the inline widget immediately as a best-effort
  // (it will work for cached pages or fast networks)
  const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
  if (combo) {
    combo.value = language;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Show translating state, then reload so GT applies via cookie
  _status = 'translating';
  notifySubscribers();

  window.setTimeout(() => {
    window.location.reload();
  }, 300); // tiny delay lets the UI show the "Translating…" state
}

// ─────────────────────────────────────────────────────────────
// Hidden GT widget (required so GT injects its iframe machinery)
// ─────────────────────────────────────────────────────────────
function ensureSingletonContainer(): HTMLElement {
  let el = document.getElementById(WIDGET_CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = WIDGET_CONTAINER_ID;
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;';
    document.body.appendChild(el);
  }
  return el;
}

function createWidget() {
  if (_widgetCreated) return;
  if (!window.google?.translate?.TranslateElement) return;
  _widgetCreated = true;

  const container = ensureSingletonContainer();
  container.innerHTML = '';
  new window.google.translate.TranslateElement(
    { pageLanguage: 'en', autoDisplay: false, includedLanguages },
    WIDGET_CONTAINER_ID
  );
}

function ensureGoogleTranslateScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.google?.translate?.TranslateElement) return Promise.resolve();
  if (window.__googleTranslateLoadingPromise) return window.__googleTranslateLoadingPromise;

  window.__googleTranslateLoadingPromise = new Promise<void>((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      window.dispatchEvent(new Event('google-translate-ready'));
      resolve();
    };

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
      script.src =
        'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.onerror = () => reject(new Error('Failed to load Google Translate script'));
      document.head.appendChild(script);
    }
  });

  return window.__googleTranslateLoadingPromise;
}

// ─────────────────────────────────────────────────────────────
// Bootstrap (runs once when the module is first imported)
// ─────────────────────────────────────────────────────────────
if (typeof window !== 'undefined') {
  _language = readStoredLanguage();
  setGoogtransCookie(_language); // ensure cookie matches stored pref on load

  window.addEventListener('google-translate-ready', () => createWidget());

  void ensureGoogleTranslateScript()
    .then(() => createWidget())
    .catch(() => {
      _status = 'blocked';
      notifySubscribers();
    });
}

// ─────────────────────────────────────────────────────────────
// React component
// ─────────────────────────────────────────────────────────────
export interface GoogleTranslateProps {
  /** @deprecated — kept for API compatibility; no longer used */
  containerId?: string;
}

export function GoogleTranslate(_props: GoogleTranslateProps) {
  const [language, setLanguage] = useState<string>(_language);
  const [status, setStatus] = useState<Status>(_status);

  useEffect(() => {
    const refresh = () => {
      setLanguage(_language);
      setStatus(_status);
    };
    _subscribers.add(refresh);
    refresh();
    return () => {
      _subscribers.delete(refresh);
    };
  }, []);

  const handleLanguageChange = (newLang: string) => {
    if (newLang === _language) return; // no-op
    _language = newLang;
    notifySubscribers();
    applyLanguageViaCookieReload(newLang);
  };

  const isTranslating = status === 'translating';
  const isBlocked = status === 'blocked';

  return (
    <div className="relative z-50" translate="no">
      <div className="relative flex items-center gap-1.5">
        <select
          aria-label="Select language"
          value={language}
          disabled={isTranslating || isBlocked}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="h-8 min-w-[130px] rounded-sm border border-border bg-background/50 backdrop-blur-sm px-2.5 pr-8 text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:bg-background/80 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {languageOptions.map((lang) => (
            <option key={lang.value} value={lang.value} className="bg-background text-foreground">
              {lang.flag} {lang.nativeLabel}
            </option>
          ))}
        </select>

        {/* Spinner shown while page is about to reload */}
        {isTranslating && (
          <span
            className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin pointer-events-none"
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}
