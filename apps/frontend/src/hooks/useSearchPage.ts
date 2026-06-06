'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { searchableRoutes } from '@/utils/searchableRoutes';

export function useSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    users: [] as any[],
    jobs: [] as any[],
    drives: [] as any[],
    pages: [] as any[],
    subjects: [] as any[],
  });

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setLoading(true);

    try {
      const [usersRes, jobsRes, subjectsRes] = await Promise.allSettled([
        fetchAllPages<any>('/users'),
        fetchAllPages<any>('/jobs'),
        fetchAllPages<any>('/courses'),
      ]);

      const lowerTerm = term.trim().toLowerCase();
      const users =
        usersRes.status === 'fulfilled'
          ? usersRes.value || []
          : [];
      const jobs =
        jobsRes.status === 'fulfilled'
          ? jobsRes.value || []
          : [];
      const subjects =
        subjectsRes.status === 'fulfilled'
          ? subjectsRes.value || []
          : [];

      const filteredUsers = users
        .map((u: any) => ({
          ...u,
          fullName: u.fullName || u.name || '',
        }))
        .filter((u: any) =>
          String(u.fullName || '').toLowerCase().includes(lowerTerm) ||
          String(u.email || '').toLowerCase().includes(lowerTerm),
        );

      const filteredJobs = jobs.filter(
        (j: any) =>
          String(j.title || '').toLowerCase().includes(lowerTerm) ||
          String(j.company || j.companyName || '').toLowerCase().includes(lowerTerm),
      );

      const filteredDrives = filteredJobs
        .map((job: any) => ({
          id: `drive-${job.id}`,
          companyName: job.company || job.companyName,
          role: job.title,
          date: job.deadline,
          location: job.location,
          status: 'upcoming' // Default status
        }))
        .sort((a: any, b: any) => {
          const left = new Date(a.date || 0).getTime();
          const right = new Date(b.date || 0).getTime();
          return left - right;
        });

      const filteredSubjects = subjects.filter(
        (c: any) =>
          String(c.name || '').toLowerCase().includes(lowerTerm) ||
          String(c.code || '').toLowerCase().includes(lowerTerm),
      );

      const filteredPages = searchableRoutes.filter(route => 
         route.title.toLowerCase().includes(lowerTerm) || 
         route.keywords.some(k => k.toLowerCase().includes(lowerTerm))
      );

      setResults({
        users: filteredUsers,
        jobs: filteredJobs,
        drives: filteredDrives,
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
      results.jobs.length > 0 ||
      results.drives.length > 0 ||
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
