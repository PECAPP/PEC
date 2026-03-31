import type { Metadata } from 'next';
import { Inter, Sora, Fraunces, Syne } from 'next/font/google';
import { Providers } from './providers';
import { RouteTransitionLoader } from '@/components/layout/RouteTransitionLoader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

const syne = Syne({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: 'PEC App - Smart College Management System',
  description: 'Modern, intuitive campus management system for educational institutions',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
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
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${sora.variable} ${fraunces.variable} ${syne.variable}`}
    >
      <head>
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
