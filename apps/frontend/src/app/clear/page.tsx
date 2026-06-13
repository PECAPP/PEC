'use client';
import { useEffect } from 'react';

export default function ClearPage() {
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    // clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.href = '/login';
  }, []);

  return <div>Clearing session and logging out...</div>;
}
