import type { Metadata } from 'next';
import { Providers } from './providers';
import { RouteTransitionLoader } from '@/components/layout/RouteTransitionLoader';
import './globals.css';

export const metadata: Metadata = {
  title: 'PEC Campus ERP - Smart College Management System',
  description: 'Modern, intuitive campus management system for educational institutions',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&family=Syne:wght@400..800&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem('ui.language');
                  const host = window.location.hostname;
                  const isLocalhost = host === 'localhost' || /^\\d+\\.\\d+\\.\\d+\\.\\d+$/.test(host);
                  
                  if (!saved || saved === 'en') {
                    document.documentElement.setAttribute('translate', 'no');
                    // Aggressively clear googtrans across all paths and potential domains
                    const domains = [null, host, '.' + host];
                    const paths = ['/', '/dashboard', window.location.pathname];
                    
                    domains.forEach(domain => {
                      paths.forEach(path => {
                        let base = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=' + path + ';';
                        if (domain) base += ' domain=' + domain + ';';
                        document.cookie = base;
                      });
                    });

                    // Force English value
                    document.cookie = 'googtrans=/en/en; path=/;';
                  } else if (saved) {
                    document.documentElement.removeAttribute('translate');
                    const normalized = '/en/' + saved;
                    document.cookie = 'googtrans=' + encodeURIComponent(normalized) + '; path=/;';
                  }
                } catch (e) {}

                window.googleTranslateElementInit = function() {
                  window.dispatchEvent(new Event('google-translate-ready'));
                };
              })();
            `,
          }}
        />
        <script
          type="text/javascript"
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          async
        />
      </head>
      <body suppressHydrationWarning>
        <RouteTransitionLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
