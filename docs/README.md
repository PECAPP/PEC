# PEC APP - Institutional Documentation Index

Comprehensive technical documentation and operational guides for the PEC APP ERP platform.

## Core Developmental Documentation

### [System Architecture](./ARCHITECTURE.md)
Detailed technical blueprint of the PEC platform including:
- Frontend Architecture (Next.js 16.2.1 with Turbopack)
- Backend Orchestration (NestJS 11.x + Prisma 6.x)
- High-Concurrency Data Flow and State Management
- Institutional Security and Role-Based Access Control
- Sub-second Performance Optimization Strategies

### [Institutional Setup](./SETUP.md)
Complete installation and operational reference for PEC APP:
- System Requirements and Institutional Prerequisites
- Integrated Installation Lifecycle (npm / Bun)
- Secure Environment Configuration (.env.local / server/.env)
- Database Engineering and High-Fidelity Seeding
- Operational Execution (Ports 3000/4000)

### [Development and Operations](./DEVELOPMENT.md)
Complete lifecycle management and environment setup:
- Institutional Prerequisites and Dependencies
- Secure Environment Configuration
- High-Fidelity Database Engineering (PostgreSQL)
- Accelerated Development Workflow (Ports 3000/4000)
- Deployment and CI/CD Protocols

### [Platform Features](./FEATURES.md)
Detailed functional specification of the institutional ecosystem:
- Academic Governance (Courses, Timetables, Attendance, Grading)
- Campus Services (Infrastructure Maintenance, Spatial Navigation, Canteen)
- Communication Hub (Enterprise Messaging, Global Announcements)
- Identity Services (Profile Management, AI Resume Analysis)
- Administrative Oversight (User Governance, Financial Reporting)

### [Quick Reference Guide](./QUICK_REFERENCE.md)
Accelerated reference for developers and system operators:
- Standardized Development Commands
- Institutional Coding Patterns and DTOs
- Critical Path and Module Locations
- Environment Specification
- Stability and Troubleshooting Logs

### [Scaling and Infrastructure](./SCALING_AND_PLATFORM.md)
Advanced infrastructure considerations for large-scale institutional deployments:
- Database Indexing and Optimization
- Edge-Runtime Caching Strategies
- Institutional Security and WAF Configuration
- Observability and Performance Monitoring

## Developer Resources and Ecosystem

### Institutional Agent Skills
The project leverages specialized AI capabilities for accelerated development:
- **Next.js 16 Performance**: Advanced React 19 optimization patterns.
- **Enterprise App Router**: Complex routing and layout orchestration.
- **Institutional Styling**: Sepia/Dark mode design system compliance.
- **Data Integrity**: Zod-based validation across the full stack.

Location: `.agents/skills/`

### API Specification and Schema
For detailed endpoint protocols and data models, refer to:
- Backend Controllers in `server/src/`
- Institutional Schema in `server/prisma/schema.prisma`
- Frontend Data Bridge in `src/lib/postgres-bridge.ts`

## Documentation Governance

When contributing to the institutional knowledge base:
1. Ensure documentation reflects the latest architectural version (3.2.0+).
2. Maintain a professional, emoji-free aesthetic.
3. Synchronize performance benchmarks with the Next.js 16 standard.
4. Update the technical version history for all major architectural shifts.

## Technical Version History

| Institutional Version | Release Date | Architectural Highlights |
|-----------------------|--------------|-------------------------|
| 3.2.0 | March 2026 | Next.js 16.2.1, Turbopack, REST Synchronization |
| 2.5.0 | February 2026 | NestJS 10 Migration, Role Consolidation |
| 2.0.0 | January 2026 | Initial App Router Implementation |

---

Last Updated: March 2026
PEC Documentation Governance Group
Registry: PEC-DOC-001
