'use client';

import * as Sentry from '@sentry/nextjs';
import Error from 'next/error';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', fontFamily: 'sans-serif', backgroundColor: '#09090b', color: '#f8fafc' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Something went critically wrong.</h2>
          <p style={{ color: '#94a3b8', marginBottom: '20px' }}>Our engineering team has been notified via Sentry.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ padding: '10px 20px', backgroundColor: '#4f46e5', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Refresh Application
          </button>
        </div>
      </body>
    </html>
  );
}
