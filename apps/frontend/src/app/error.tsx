'use client';
import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-red-500">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-black text-white rounded">Try again</button>
    </div>
  );
}