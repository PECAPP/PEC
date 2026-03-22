## In-Repo

- DB indexing:
  Added Prisma indexes for hot query paths in jobs, rooms, audit logs, feature flags, and background jobs.
- Lazy loading:
  Frontend routes in [`src/App.tsx`](../src/App.tsx) already use `React.lazy` + `Suspense`.
- Audit trails:
  Request audit persistence now covers authenticated actions, not just write routes.
- Feature flags:
  Added a DB-backed feature flag service with cached reads and admin endpoints.
- Background jobs:
  Added a DB-backed queue/worker with retry, locking, dedupe support, and an audit-log prune job.
- Connection pooling:
  Documented pooled `DATABASE_URL` usage in [`.env.example`](./.env.example).

## Platform Required

- Redis caching:
  Recommended for cross-instance cache consistency and high-throughput job queues.
  Current implementation uses in-process caching for feature flags and a DB-backed queue for portability.
- CDN for static assets:
  Put the Vite build output behind Vercel/CloudFront/Cloudflare CDN.
- WAF / DDoS protection:
  Terminate traffic at Cloudflare, AWS WAF, or your hosting provider edge.
- Zero Trust:
  Enforce via IdP, network policy, VPN/access proxy, and service-to-service identity.

## Suggested Next Infra Steps

1. Put the frontend behind Cloudflare or Vercel Edge.
2. Put the API behind a reverse proxy with rate limiting and WAF rules.
3. Use PgBouncer or a managed Postgres pooler.
4. Move feature-flag cache and background jobs to Redis if you need multi-instance horizontal scale.
5. Add queue dashboards and alerting for failed jobs.
