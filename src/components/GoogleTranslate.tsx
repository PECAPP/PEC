import { useEffect } from 'react';

interface GoogleTranslateElement {
  TranslateElement: new (
    options: { pageLanguage: string },
    elementId: string
  ) => void;
}

interface GoogleTranslate {
  translate: GoogleTranslateElement;
}

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: GoogleTranslateElement;
    };
  }
}

interface GoogleTranslateProps {
  containerId?: string;
}

export function GoogleTranslate({ 
  containerId = "google_translate_element" 
}: GoogleTranslateProps) {
  useEffect(() => {
    // 1. Define the Init Function (Supporting both IDs if they exist)
    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        // Init the standard one
        const el1 = document.getElementById('google_translate_element');
        if (el1 && !el1.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
        }
        // Init the sidebar one
        const el2 = document.getElementById('google_translate_sidebar');
        if (el2 && !el2.querySelector('.goog-te-gadget')) {
          new window.google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_sidebar');
        }
      }
    };

    // 2. Load Script
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      // If already loaded, trigger init manually
      window.googleTranslateElementInit();
    }
  }, []);

  return (
    <div className="flex items-center">
      <div id={containerId} className="google-translate-container" />
      <style>{`
        /* Minimalist style to clean up the Google default look */
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0px !important; position: static !important; }
        .goog-logo-link { display: none !important; }
        .goog-te-gadget { color: transparent !important; font-size: 0 !important; }
        .goog-te-gadget > span { display: none !important; }
        .goog-te-gadget > div { display: inline-block !important; }
        #goog-gt-tt { display: none !important; }
        
        /* Hide only the translate bar iframe at the top */
        iframe.skiptranslate { display: none !important; }
        .goog-te-banner-frame { display: none !important; }
        
        .goog-te-gadget .goog-te-combo {
          background-color: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          padding: 2px 4px;
          color: hsl(var(--foreground));
          font-size: 12px;
          cursor: pointer;
        }
        .goog-te-gadget .goog-te-combo option {
          background-color: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        .goog-te-gadget .goog-te-combo:hover {
          border-color: hsl(var(--primary));
        }
        .goog-te-gadget .goog-te-combo:focus {
          outline: 2px solid hsl(var(--ring));
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
