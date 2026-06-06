# PEC App - Security Policy

## 1. Institutional Security Commitment

PEC App is built on a high-fidelity, sub-second security architecture that protects student identity, academic records, and institutional communication. We are committed to maintaining a zero-vulnerability environment for all institutional stakeholders.

## 2. Reporting a Vulnerability

If you identify a potential security issue within the PEC App platform, please do not disclose it publicly or via social media. Instead, follow these institutional procedures for reporting:
- **Direct Reporting**: Contact the PEC Technical Operations Group immediately.
- **Provide Detail**: Include a clear description of the vulnerability, the affected module (e.g., Attendance, Auth, Canteen), and a step-by-step POC (Proof of Concept) for reproduction.
- **Confidentiality**: All reports will be handled with strict confidentiality.

We will acknowledge your report within 24–48 hours and work on a resolution with maximum priority based on the vulnerability categorization.

## 3. High-Priority Vulnerabilities

The following issues are considered of critical importance to the institutional integrity:
- **Horizontal Privilege Escalation**: A student gaining access to another student's dossier or identity data.
- **Vertical Privilege Escalation**: A non-administrative user gaining access to global campus policies or user settings.
- **Data Corruption**: Bypassing Zod or Prisma validation to insert malformed or malicious academic records.
- **Session Hijacking**: Discovering methods to forge or intercept JWT tokens for unauthorized API access.

## 4. Coordinated Disclosure

We encourage the responsible disclosure of security findings. PEC University will not pursue legal action against contributors who:
- Report the vulnerability to the Technical Operations Group first.
- Provide a reasonable amount of time for a fix to be applied before public disclosure.
- Do not exploit the vulnerability for personal gain or destruction of institutional data.

---

## 5. Built-in Security Architecture

The platform utilizes industry-standard security foundations:
- **Argon2 / Bcrypt**: For sub-second, hardware-resistant hashing of all credentials.
- **Stateless JWT**: For RBAC-based session management without server-side state.
- **Zod Validation**: For 100% data integrity enforcement at the API edge.
- **TLS 1.3**: For encryption of all data in transit between the browser and the backend.

**PEC Technical Operations Group**
Copyright (c) 2026 PEC University. All rights reserved.
Standard: PEC-SECURITY-POLICY-2026
Status: ACTIVE
EOF
