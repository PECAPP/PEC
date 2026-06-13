# Contributing to PEC App

Thank you for your interest in contributing to the PEC App platform. This document outlines the standards, technical procedures, and workflow guidelines for contributing to this project.

---

## 1. Governance and Review

As a university platform, every contribution is subject to review by the project maintainers. We prioritize:
- **Consistency**: Adherence to the existing Next.js 16 / NestJS 11 monorepo architecture.
- **Safety**: Strict type safety using TypeScript and Zod validation.
- **Performance**: Minimal client-side JavaScript execution and optimized database queries.
- **Integrity**: Maintaining relational consistency across all database schemas.

Before starting on a significant feature, we recommend opening a Feature Request or discussing the enhancement with the maintainers.

---

## 2. Technical Environment & Setup

### Minimum Requirements
- **Runtime**: Node.js v22 LTS or higher.
- **Package Manager**: pnpm v9+ (`npm install -g pnpm@9.12.3`).
- **Database**: PostgreSQL v16 on port 5432.
- **Cache**: Redis on port 6379.

### Local Development Loop
```bash
# Clone and enter the repository
git clone https://github.com/PECAPP/PEC
cd PEC

# Install all workspace dependencies
pnpm install

# Push the schema and generate the Prisma client
pnpm --filter @pec/database push
pnpm --filter @pec/database generate

# Seed with development data
pnpm --filter pec-server db:seed

# Run the dev server concurrently
pnpm run dev
```

---

## 3. Workflow and Branching Strategy

We utilize a structured Git workflow to ensure deployment stability:
- **main**: Represents the stable, production-ready release.
- **develop**: The primary integration branch for new features and patches.
- **feature/[name]**: Temporary branches for discrete enhancements.
- **hotfix/[name]**: Immediate patches for production-impacting bugs.

### Submitting a Pull Request
1. Fork the repository (if external) or create a feature branch.
2. Ensure your code passes all linting (`pnpm run lint`) and builds successfully.
3. Follow a consistent commit message style (e.g., `feat: chat - add message status indicator`).
4. Ensure the code complies with repository guidelines and does not introduce prohibited modules or unused code.
5. Provide a detailed summary in your Pull Request, linking to relevant issues.

---

## 4. Coding Conventions

- **Next.js & React**: Use the App Router and Server Components by default. Use `'use client'` only where necessary for client-side interactivity.
- **Prop Typing**: Complete type coverage for all React components.
- **Backend API**: All controllers in NestJS must use appropriate decorators for auth/RBAC validation (e.g., `@UseGuards()`).
- **Validation**: Every request body, parameter, and query must be validated using Zod schemas located in the `shared/` directory.
- **Error Handling**: Use the standardized global exception filter for consistent error responses.

---

## 5. Security and Privacy

- **No Secrets**: Never commit `.env` files or hardcoded API keys.
- **Data Minimization**: Respect the privacy of student data; avoid logging sensitive PII (Personally Identifiable Information).
- **Vulnerability Checks**: Ensure all new dependencies are scanned for known vulnerabilities before inclusion.
