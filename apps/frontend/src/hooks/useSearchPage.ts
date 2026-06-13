'use client';
import { extractData } from "@/lib/utils";
import api from "@pec/api";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { searchableRoutes } from '@/utils/searchableRoutes';

export function useSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [] as any[],
    pages: [] as any[],
    subjects: [] as any[],
  });

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);

    try {
      const [usersRes, subjectsRes] = await Promise.allSettled([
        api.get('/users', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
        api.get('/courses', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
      ]);

      const lowerTerm = term.trim().toLowerCase();
      const users = usersRes.status === 'fulfilled' ? usersRes.value || [] : [];
      const subjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value || [] : [];

      const filteredUsers = users
        .map((u: any) => ({ ...u, fullName: u.fullName || u.name || '' }))
        .filter((u: any) =>
          String(u.fullName || '').toLowerCase().includes(lowerTerm) ||
          String(u.email || '').toLowerCase().includes(lowerTerm),
        );

      const filteredSubjects = subjects.filter(
        (c: any) =>
          String(c.name || '').toLowerCase().includes(lowerTerm) ||
          String(c.code || '').toLowerCase().includes(lowerTerm),
      );

      const filteredPages = searchableRoutes.filter(route =>
         route.title.toLowerCase().includes(lowerTerm) ||
         route.keywords.some((k: string) => k.toLowerCase().includes(lowerTerm))
      );

      setResults({
        users: filteredUsers,
        pages: filteredPages,
        subjects: filteredSubjects,
      });

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const hasResults = useMemo(
    () =>
      results.users.length > 0 ||
      results.pages.length > 0 ||
      results.subjects.length > 0,
    [results],
  );

  return {
    searchTerm,
    setSearchTerm,
    loading,
    results,
    handleSearchSubmit,
    hasResults,
    initialQuery,
  };
}
