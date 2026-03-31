# PEC APP - Development Policy and Agent Guidelines

Institutional standards and technical policies for contributing to the PEC APP ERP platform. This document serves as the primary reference for performance, architecture, and coding conventions.

## Engineering Scope

These mandates apply to all developmental phases:
- Engineering new React Server Components (RSC) or client-side interfaces.
- Implementing high-concurrency data fetching strategies.
- Reviewing architectural integrity and performance benchmarks.
- Optimizing for sub-second LCP (Largest Contentful Paint) and minimized TBT (Total Blocking Time).

## Performance Prioritization Matrix

1. **Waterfall Elimination (async-*)**: Absolute priority to ensure non-blocking data resolution.
2. **Bundle Optimization (bundle-*)**: Critical focus on minimizing client-side JavaScript execution.
3. **Server-Side Execution (server-*)**: High priority for moving logic to the institutional backend.
4. **Hydration Efficiency (client-*)**: Medium-High priority for optimizing interactive components.
5. **Layout Stability (rendering-*)**: Medium priority for preventing Cumulative Layout Shift (CLS).

## Critical Performance Mandates

### 1. Data Fetching and Waterfall Mitigation
- **Deferred Await**: Position `await` statements as late as possible in the execution flow to maximize parallel processing.
- **Parallel Resolution**: Utilize `Promise.all()` or `Promise.allSettled()` for all independent asynchronous operations.
- **Response Streaming**: Implement Next.js 16 Suspense boundaries to stream content chunks as they resolve.
- **Prefetching Strategy**: Start data fetches early in the lifecycle, even before the component tree fully initializes.

### 2. Strategic Bundle Optimization
- **Direct Import Resolution**: Avoid broad barrel imports; point directly to the module to prevent unnecessary code inclusion.
- **Dynamic Module Loading**: Utilize `next/dynamic` for heavy visual components (Charts, Maps, 3D Models) with appropriate loading skeletons.
- **Third-Party Sanitization**: Defer non-critical SDKs (Analytics, Logging) until the primary thread is idle.
- **Conditional Loading**: Ensure modules are only fetched when the specific feature logic is triggered by the user.

## Implementation Workflow

1. Audit the proposed change for sequential awaits that could be parallelized.
2. Identify top-level imports that could be deferred or moved to server components.
3. Apply the refactor while maintaining strict type-safety and visual consistency.
4. Validate execution using the `npm run build` process to ensure no regression in bundle metrics.
5. Reference specific policy IDs in the version control history (e.g., `perf: eliminate waterfall in Dashboard [async-parallel]`).

## Technical Review Checklist

- [ ] All independent asynchronous work is executed in parallel.
- [ ] Initial route load contains zero non-essential heavy JavaScript modules.
- [ ] Expensive computations are memoized only when performance gains exceed overhead.
- [ ] React effects utilize stable, primitive dependency arrays to prevent cycle loops.
- [ ] Client-side state and event listeners are sanitized and properly unmounted.

## Specialized Development Skills

The PEC APP utilizes specific skill sets for development. AI Agents must leverage these when contributing:

- **Next.js 16 Performance**: Advanced strategies for React 19 and Turbopack optimization.
- **Enterprise App Router Patterns**: Implementation of complex routing, middleware, and layouts.
- **Institutional Styling**: Adherence to the premium sepia/dark mode design system.
- **Data Integrity**: Strict Zod-based validation across the full stack.

## Architecture and Styling Conventions

### Professional Component Structure
```typescript
// 1. External dependencies followed by institutional utilities
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

// 2. Strict type definitions for interfaces
interface AcademicProfileProps {
  studentId: string;
  className?: string;
}

// 3. Documented component logic
export function AcademicProfile({ studentId, className }: AcademicProfileProps) {
  // Logic and hook initialization
  // Render output following the institutional design system
  return (
    <div className={cn('p-4 bg-card border border-border rounded-xl', className)}>
      {/* Component Content */}
    </div>
  );
}
```

### Standardized File Naming
- **Components**: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- **Hooks**: `camelCase.ts` (e.g., `useAcademicQuery.ts`)
- **Utilities**: `camelCase.ts` (e.g., `formatInstitutionalDate.ts`)
- **Types**: `kebab-case.ts` (e.g., `academic-types.ts`)

## Security and Compliance Standards

- **Zero Information Leakage**: Sensitive data must stay within the server component boundary.
- **Environment Isolation**: Secrets are strictly maintained via institutional environment variables.
- **Runtime Validation**: All user-provided data is sanitized via Zod schemas before persistence.
- **Least Privilege Access**: RBAC (Role-Based Access Control) is enforced at the layout, API, and database layers.

---

Last Updated: March 2026
PEC Development Group
Architectural Version: 3.1.0
