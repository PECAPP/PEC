import { useEffect, useMemo, useRef, useState } from 'react';

interface GoogleTranslateElement {
  TranslateElement: {
    new (
      options: { pageLanguage: string; layout?: any; autoDisplay?: boolean; includedLanguages?: string },
      elementId: string
    ): void;
    InlineLayout: {
      SIMPLE: any;
      HORIZONTAL: any;
      VERTICAL: any;
    };
  };
}

interface GoogleTranslate {
  translate: GoogleTranslateElement;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    __googleTranslateCustomInit?: () => void;
    __googleTranslateLoadingPromise?: Promise<void>;
    google?: {
      translate?: GoogleTranslateElement;
    };
  }
}

interface GoogleTranslateProps {
  containerId?: string;
}

const languageOptions = [
  { value: 'en', nativeLabel: 'English', flag: '🇬🇧' },
  { value: 'hi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { value: 'pa', nativeLabel: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
];

const LANGUAGE_STORAGE_KEY = 'ui.language';

const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script';

function ensureGoogleTranslateScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.google?.translate?.TranslateElement) {
    return Promise.resolve();
  }

  if (window.__googleTranslateLoadingPromise) {
    return window.__googleTranslateLoadingPromise;
  }

  window.__googleTranslateLoadingPromise = new Promise<void>((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      window.dispatchEvent(new Event('google-translate-ready'));
      resolve();
    };

    const existingScript = document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_TRANSLATE_SCRIPT_ID;
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    script.onerror = () => {
      reject(new Error('Failed to load Google Translate script'));
    };

    document.head.appendChild(script);
  });

  return window.__googleTranslateLoadingPromise;
}

export function GoogleTranslate({ 
  containerId = "google_translate_element" 
}: GoogleTranslateProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [widgetStatus, setWidgetStatus] = useState<'loading' | 'ready' | 'blocked'>('loading');
  const selectedLanguageRef = useRef('en');
  const applyRequestIdRef = useRef(0);
  const widgetInitializedRef = useRef(false);

  const includedLanguages = useMemo(
    () => languageOptions.map((language) => language.value).join(','),
    [],
  );

  const applyLanguage = (language: string) => {
    const combo = document.querySelector<HTMLSelectElement>(`#${containerId} .goog-te-combo`);
    if (!combo) return false;
    combo.value = language;
    combo.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  };

  const applyLanguageWithRetry = (language: string) => {
    const maxAttempts = 20;
    let attempts = 0;
    const requestId = ++applyRequestIdRef.current;

    const tryApply = () => {
      if (requestId !== applyRequestIdRef.current) return;
      attempts += 1;
      const applied = applyLanguage(language);
      if (applied || attempts >= maxAttempts) return;
      window.setTimeout(tryApply, 150);
    };

    tryApply();
  };

  const setGoogtransCookie = (language: string) => {
    const host = window.location.hostname;
    const isLocalhost = host === 'localhost' || /^\d+\.\d+\.\d+\.\d+$/.test(host);
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();

    if (language === 'en') {
      document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
      if (!isLocalhost) {
        document.cookie = `googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.${host}`;
      }
      return;
    }

    const value = `/en/${language}`;
    document.cookie = `googtrans=${value};expires=${expires};path=/`;
    if (!isLocalhost) {
      document.cookie = `googtrans=${value};expires=${expires};path=/;domain=.${host}`;
    }
  };

  const readPreferredLanguage = () => {
    const fromStorage = typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY) : null;
    if (fromStorage && languageOptions.some((option) => option.value === fromStorage)) {
      return fromStorage;
    }
    return 'en';
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    selectedLanguageRef.current = language;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      if (language === 'en') {
        document.documentElement.setAttribute('translate', 'no');
      } else {
        document.documentElement.removeAttribute('translate');
      }
    }
    setGoogtransCookie(language);
  };

  // Initialize on mount: read persisted language preference ONCE
  useEffect(() => {
    if (widgetInitializedRef.current) return; // Skip if already initialized
    widgetInitializedRef.current = true;

    const initialLanguage = readPreferredLanguage();
    setSelectedLanguage(initialLanguage);
    selectedLanguageRef.current = initialLanguage;
    setGoogtransCookie(initialLanguage);
  }, []); // Empty dependency array - runs once on mount

  // Setup Google Translate widget and re-apply language
  useEffect(() => {
    const initWidget = () => {
      if (window.google?.translate?.TranslateElement) {
        const element = document.getElementById(containerId);
        if (element) {
          element.innerHTML = '';
          new window.google.translate.TranslateElement(
            { 
              pageLanguage: 'en', 
              autoDisplay: false,
              includedLanguages,
            }, 
            containerId
          );
        }
        setWidgetStatus('ready');
        // Apply saved language after widget initializes
        applyLanguageWithRetry(selectedLanguageRef.current);
      }
    };

    void ensureGoogleTranslateScript()
      .then(() => {
        initWidget();
      })
      .catch(() => {
        setWidgetStatus('blocked');
      });

    const handleReady = () => {
      initWidget();
    };
    window.addEventListener('google-translate-ready', handleReady);

    const statusTimeout = window.setTimeout(() => {
      if (window.google?.translate?.TranslateElement) {
        setWidgetStatus('ready');
      } else {
        setWidgetStatus('blocked');
      }
    }, 1500);
    
    return () => {
      window.removeEventListener('google-translate-ready', handleReady);
      window.clearTimeout(statusTimeout);
    };
  }, [containerId, includedLanguages]);

  useEffect(() => {
    applyLanguageWithRetry(selectedLanguage);
  }, [selectedLanguage]);

  return (
    <div className="relative z-50">
      <div className="relative" translate="no">
        <select
          aria-label="Select language"
          value={selectedLanguage}
          onChange={(event) => handleLanguageChange(event.target.value)}
          className="h-8 min-w-[130px] rounded-lg border border-border bg-background/50 backdrop-blur-sm px-2.5 pr-8 text-[10px] font-bold uppercase tracking-widest text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:bg-background/80"
        >
          {languageOptions.map((language) => (
            <option key={language.value} value={language.value} className="bg-background text-foreground">
              {language.flag} {language.nativeLabel}
            </option>
          ))}
        </select>
      </div>

      <div 
        id={containerId} 
        className="google-translate-container pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" 
      />
    </div>
  );
}
