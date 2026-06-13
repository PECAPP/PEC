# Pull Request Template - PEC App

## 1. Summary of Contribution

Provide a clear and detailed description of the changes you are introducing, the problem they solve, and the context around them (e.g. academic management updates or campus logistics fixes).

---

## 2. Type of Contribution

Please select the type of contribution by marking with an [x]:
- [ ] Bug Fix (non-breaking change which fixes an issue)
- [ ] New Feature (non-breaking change which adds functional capability)
- [ ] Refactoring (optimizing existing code without change in behavior)
- [ ] Documentation (updates to README.md, setup.md, architecture.md, etc.)
- [ ] Security (fixing a vulnerability or patching a dependency)

---

## 3. Verification Checklist

Please verify that your contribution meets the repository guidelines:
- [ ] Verified that the code complies with repository guidelines and does not introduce prohibited modules or unused code.
- [ ] The code passes all linting (`pnpm run lint` or `turbo run lint`) and builds successfully.
- [ ] New Zod validation schemas have been added to the `shared/` directory for any new data inputs.
- [ ] New API endpoints are correctly guarded using NestJS Role-Based Access Control (RBAC) or CASL guards.
- [ ] Every component is type-safe and avoids the use of `any`.
- [ ] Added or updated relevant documentation in the `docs/` or `apps/docs/` directories.

---

## 4. Performance & Impact

Describe the impact of this change on performance:
- **Client Bundles**: Does this change increase the initial JavaScript delivery?
- **Query Resolution**: Have new Prisma queries been optimized with proper indexing or select statements?
- **Data Integrity**: Does this change maintain relational consistency in the database?

---

## 5. Additional Context and Documentation

Provide any screenshots, WebGL map captures, or additional notes that will help the maintainers in the review process.
