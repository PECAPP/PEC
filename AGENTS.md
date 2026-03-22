# Vercel React Best Practices (Project Policy)

This repository follows the Vercel React/Next.js performance guide for all new and refactored code.

## Scope
Apply these rules when:
- Writing new React components or pages
- Implementing data fetching (client or server-side)
- Reviewing or refactoring for performance
- Optimizing bundle size, rendering, and load times

## Priority Order (Enforcement)
1. **Eliminating Waterfalls** (`async-*`) — CRITICAL
2. **Bundle Size Optimization** (`bundle-*`) — CRITICAL
3. **Server-Side Performance** (`server-*`) — HIGH
4. **Client-Side Data Fetching** (`client-*`) — MEDIUM-HIGH
5. **Re-render Optimization** (`rerender-*`) — MEDIUM
6. **Rendering Performance** (`rendering-*`) — MEDIUM
7. **JavaScript Performance** (`js-*`) — LOW-MEDIUM
8. **Advanced Patterns** (`advanced-*`) — LOW

## Critical Rules (Always Check First)
### 1) Eliminating Waterfalls (`async-*`)
- `async-defer-await`: move `await` as late as possible; await only when needed
- `async-parallel`: use `Promise.all()` for independent operations
- `async-dependencies`: use staged parallelism for partially dependent operations
- `async-api-routes`: start promises early, await late
- `async-suspense-boundaries`: stream with Suspense where applicable

### 2) Bundle Size Optimization (`bundle-*`)
- `bundle-barrel-imports`: prefer direct imports over broad barrel imports
- `bundle-dynamic-imports`: dynamically import heavy components/modules
- `bundle-defer-third-party`: defer analytics/logging/heavy SDKs until needed
- `bundle-conditional`: load modules only when feature is activated
- `bundle-preload`: preload on hover/focus when it improves perceived speed

## Implementation Workflow
1. Scan for waterfall fetches and sequential independent awaits.
2. Scan for heavy top-level imports and non-critical third-party SDK initialization.
3. Apply smallest safe refactor with behavior preserved.
4. Validate with build/tests.
5. Note rule IDs addressed in PR notes or commit summary.

## Review Checklist
- [ ] Independent async work is parallelized.
- [ ] No avoidable top-level heavy imports on initial route load.
- [ ] Expensive computation/rendering is memoized only when useful.
- [ ] Effects use stable primitive dependencies.
- [ ] Client-side storage/event listeners are deduplicated and minimized.

## Rule Reference
Read detailed per-rule explanations/examples in:
- `rules/async-parallel.md`
- `rules/bundle-barrel-imports.md`
- and other `rules/*.md` entries from the source guide.

If rule files are not present in this repo, use this document as the operating baseline and follow the Vercel guide semantics during implementation.
