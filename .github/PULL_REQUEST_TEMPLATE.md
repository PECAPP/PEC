# Pull Request Template - PEC App

## 1. Summary of Contribution

Provide a high-fidelity summary of the changes you are making to the PEC App platform. Describe the problem you are solving, the new features you are introducing, or the bug you are fixing in the academic management or campus logistics modules.

---

## 2. Type of Contribution

Please select the type of contribution by marking with an [x]:
- [ ] Bug Fix (non-breaking change which fixes an issue)
- [ ] New Feature (non-breaking change which adds functional capability)
- [ ] Refactoring (optimizing existing code without change in behavior)
- [ ] Documentation (updates to README.md, FEATURES.md, ARCHITECTURE.md, etc.)
- [ ] Security (fixing a vulnerability or patching a dependency)

---

## 3. High-Fidelity Verification Checklist

Please verify that your contribution meets the institutional standards:
- [ ] Verified that no prohibited modules (Recruiters, Assignments, Finance) are introduced.
- [ ] The code passes all linting (`npm run lint`) and builds successfully (`npm run build`).
- [ ] New Zod validation schemas have been added to the `shared/` directory for any new data inputs.
- [ ] New API endpoints are correctly guarded using NestJS Role-Based Access Control (RBAC).
- [ ] Every component is 100% type-safe and avoids the use of `any`.
- [ ] Added or updated relevant documentation in the `docs/` directory.

---

## 4. Operational Impact and Performance

Describe the impact of this change on the sub-second responsiveness mandate:
- **TTI (Time to Interactive)**: Does this change increase the initial JavaScript delivery?
- **Query Resolution**: Have new Prisma queries been optimized with proper indexing?
- **Data Integrity**: Does this change maintain 100% relational consistency in the PostgreSQL database?

---

## 5. Additional Context and Documentation

Provide any screenshots, 3D topology previews, or additional notes that will help the Architecture Council in the review process.

---

**PEC Technical Operations Group**
Standard: PEC-PR-TEMPLATE-2026
Status: ACTIVE
EOF
