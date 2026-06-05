# Contributing to PEC App

Thank you for your interest in contributing to the PEC App platform. We are committed to a high-fidelity, high-concurrency architecture that serves the institutional needs of thousands of users. This document outlines the standards, technical procedures, and governance for contributing to this project.

---

## 1. Governance and Approval

As an institutional project, every contribution is subject to review by the PEC Technical Operations Group / Architecture Council. We prioritize:
- **Consistency**: Adherence to the existing Next.js 16/NestJS 11 architecture.
- **Safety**: 100% type safety using TypeScript and Zod validation.
- **Scalability**: Minimal client-side JavaScript execution and sub-second response times.
- **Integrity**: Zero tolerance for broken academic or identity data relations.

Before starting on a significant feature, we recommend opening a Feature Request or discussing the enhancement via institutional communication channels.

---

## 2. Technical Standards and Environment

### Minimum Requirements
- **Runtime**: Node.js v20+ (LTS).
- **Tooling**: npm 10+.
- **Database**: PostgreSQL v16 on Port 5432.
- **Validation**: Strict use of Zod schemas for all API and form-level data.
- **Styling**: Vanilla CSS or Tailwind CSS following the institutional dark-mode variables.

### Local Development Loop
```bash
# Clone and synchronize the monorepo
git clone <repository-url>
cd pec-campus-erp

# Install dependencies for both frontend and backend
npm install
cd server && npm install
cd ..

# Initialize environment (.env.local and server/.env)
# Create your local database on port 5432
cd server
npx prisma generate
npx prisma db push
npm run seed
```

---

## 3. Workflow and Branching Strategy

We utilize a structured Git workflow to ensure zero-downtime deployment stability:

- **main**: Represents the 100% stable, production-ready institutional release.
- **develop**: The primary integration branch for new features and patches.
- **feature/[name]**: Temporary branches for discrete enhancements.
- **hotfix/[name]**: Critical, immediate patches for production-impacting bugs.

### Submitting a Pull Request
1. Fork the repository (if external) or create a feature branch.
2. Ensure your code passes all linting (`npm run lint`) and builds without warnings (`npm run build`).
3. Follow a consistent commit message style (e.g., `feat: module name - detailed change`).
4. Ensure no prohibited modules (Recruiters, Assignments, Finance) are introduced.
5. Provide a detailed summary in your Pull Request, linking to relevant issues.

---

## 4. Coding Conventions

- **Next.js & React**: Use the App Router and Server Components by default to minimize hydration costs. Use `'use client'` only where necessary for interactivity.
- **Prop Typing**: 100% coverage for all React components.
- **Backend API**: All controllers in NestJS must use `@UseGuards()` for RBAC verification.
- **Validation**: Every request body, parameter, and query must be validated using Zod schemas located in the `shared/` directory.
- **Error Handling**: Use the standardized `ApiError` class for consistent institutional error responses.

---

## 5. Security and Privacy

- **No Secrets**: Never commit `.env` files or hardcoded API keys.
- **Data Minimization**: Respect the privacy of student data; avoid logging sensitive PII (Personally Identifiable Information).
- **Vulnerability Checks**: Ensure all new dependencies are scanned for known vulnerabilities before inclusion.

---

## 6. Community and Feedback

We appreciate your commitment to excellence in the PEC Campus digital ecosystem. Your contributions help building a more efficient academic environment for everyone.

**PEC Technical Operations Group**
Copyright (c) 2026 PEC University. All rights reserved.
Standard: PEC-CONTRIB-v4.0
Status: ACTIVE
EOF
