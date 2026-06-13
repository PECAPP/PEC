'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@pec/ui';
import { searchableRoutes } from '@/utils/searchableRoutes';

function generateBreadcrumbs(pathname: string) {
  if (!pathname || pathname === '/dashboard') return [];

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];
  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Check if segment is a known route
    const route = searchableRoutes.find((r) => r.path === currentPath);
    
    let title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    if (route) {
      title = route.title;
    }

    breadcrumbs.push({
      title,
      path: currentPath,
      isLast: i === segments.length - 1,
    });
  }

  return breadcrumbs;
}

export function GlobalBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname ?? '');

  if (breadcrumbs.length === 0) return null;

  return (
    <div className="mb-4 hidden sm:block animate-fade-in z-20 relative px-1">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard" className="flex items-center gap-1">
                <Home className="w-3.5 h-3.5" />
                <span className="sr-only">Home</span>
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator />

          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              <BreadcrumbItem>
                {crumb.isLast ? (
                  <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.path}>{crumb.title}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
