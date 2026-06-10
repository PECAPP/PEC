# PEC App - Security Policy

## 1. Security Commitment

We are committed to maintaining the security and privacy of the PEC App platform, protecting student data, academic records, and institutional systems.

## 2. Reporting a Vulnerability

If you identify a potential security issue within the PEC App platform, please do not disclose it publicly or via social media. Instead, follow these procedures for reporting:
- **Direct Reporting**: Contact the PEC Technical Operations Group immediately.
- **Provide Detail**: Include a clear description of the vulnerability, the affected module (e.g., Attendance, Auth, Canteen), and a step-by-step Proof of Concept (POC) for reproduction.
- **Confidentiality**: All reports will be handled with strict confidentiality.

We will acknowledge receipt of your report within 24–48 hours and provide updates on resolution progress.

## 3. High-Priority Vulnerabilities

The following issues are considered of critical importance:
- **Horizontal Privilege Escalation**: A user gaining unauthorized access to another student's or user's identity data.
- **Vertical Privilege Escalation**: A student or faculty member gaining administrative access to global settings or other users' configurations.
- **Data Integrity Issues**: Bypassing request validation or database constraints to insert malformed or corrupted records.
- **Session Hijacking**: Discovering methods to forge, spoof, or intercept JWT/session tokens.

## 4. Coordinated Disclosure

We encourage the responsible disclosure of security findings. PEC University will not pursue legal action against contributors who:
- Report the vulnerability to the Technical Operations Group first.
- Provide a reasonable amount of time for a fix to be applied before public disclosure.
- Do not exploit the vulnerability for personal gain or destruction of institutional data.

## 5. Security Architecture

The platform utilizes industry-standard security foundations:
- **Bcrypt (cost 12)**: For secure hashing of all user credentials.
- **Stateless JWT**: For RBAC-based session management.
- **Zod Validation**: For data integrity enforcement at the API edge.
- **TLS 1.3**: For encryption of all data in transit.
