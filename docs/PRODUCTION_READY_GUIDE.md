================================================================================
  PEC COLLEGE ERP — PRODUCTION DEPLOYMENT GUIDE
  How to make this system fully working with real college data
================================================================================

CURRENT STATE
─────────────
The ERP is ~80-85% production-ready. Core systems (auth, courses, attendance,
timetable, exams, finance tracking, chat, clubs, marketplace, canteen, hostel,
campus map, noticeboard, mobile apps) are implemented. The critical gaps are:
payment gateway, email service, bulk data import, and production monitoring.

================================================================================
PHASE 1: INFRASTRUCTURE SETUP (Week 1)
================================================================================

1.1  PRODUCTION DATABASE
────────────────────────
- Use managed PostgreSQL: AWS RDS, Supabase, Render, or DigitalOcean.
- Create a dedicated database user (NOT postgres/root/admin).
  The backend blocks superuser connections in production for security.
- Enable automated daily backups with 30-day point-in-time recovery.
- Configure connection pooling (PgBouncer recommended for 500+ users).
- Use Prisma migrations (not db push) in production:
    npx prisma migrate deploy
- Ensure all indexes exist (schema already defines them on foreign keys,
  status fields, and date ranges across 51 models).

1.2  ENVIRONMENT VARIABLES
──────────────────────────
Frontend (.env or .env.local):
    NEXT_PUBLIC_API_URL=https://api.yourcollege.edu
    NEXT_PUBLIC_SITE_URL=https://erp.yourcollege.edu
    INTERNAL_API_URL=http://backend-internal:4000  (SSR calls)
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
    GEMINI_API_KEY=your_gemini_key

Backend (server/.env):
    NODE_ENV=production
    PORT=4000
    DATABASE_URL=postgresql://app_user:STRONG_PASSWORD@db-host:5432/pec
    JWT_SECRET=<generate 64-char random string>
    FIELD_ENCRYPTION_KEY=<generate 32-char random string>
    ACCESS_TOKEN_TTL=15m
    REFRESH_TOKEN_TTL_DAYS=7
    AUTH_LOCK_THRESHOLD=5
    AUTH_LOCK_MINUTES=15
    CORS_ORIGINS=https://erp.yourcollege.edu
    CORS_ALLOW_CREDENTIALS=true
    REQUEST_BODY_LIMIT=1mb
    BACKGROUND_JOB_WORKER_ENABLED=true

1.3  HOSTING & DEPLOYMENT
─────────────────────────
Frontend (Next.js):
- Vercel (recommended, zero-config for Next.js)
- OR: AWS Amplify, Netlify, self-hosted with PM2/Docker
- Build: npm run build && npm start

Backend (NestJS):
- Docker on Render, AWS ECS, DigitalOcean App Platform, or Railway
- OR: PM2 on a VPS (npm run build in server/, then node dist/main.js)
- DO NOT use start:dev in production

Mobile Apps:
- Flutter apps in mobile/pec_app/ (student) and mobile/Faculty_App/ (faculty)
- Build APKs: flutter build apk --release
- Publish to Google Play Store and Apple App Store
- Update API base URL in mobile app config to production backend

1.4  SSL/HTTPS
──────────────
- Required. Use Let's Encrypt (free) or CloudFlare.
- Backend already configures HSTS headers (1 year, preload) in production.
- Helmet middleware handles CSP, X-Frame-Options, noSniff, etc.

================================================================================
PHASE 2: CRITICAL MISSING FEATURES (Week 1-2)
================================================================================

2.1  PAYMENT GATEWAY (Razorpay — recommended for India)
────────────────────────────────────────────────────────
Current state: Finance module tracks fees and transactions but payment is
simulated. Schema already supports gateway transaction IDs.

What to implement:
  a) Install Razorpay SDK:
       cd server && npm install razorpay
  b) Create Razorpay order when student initiates payment
       POST /api/finance/pay → create Razorpay order → return order_id
  c) Frontend: integrate Razorpay checkout.js popup
  d) Webhook handler: POST /api/webhooks/razorpay
       - Verify signature using Razorpay webhook secret
       - Update FinanceTransaction with gatewayTxnId, status
       - Mark FeeRecord as paid
  e) Refund endpoint for admins
  f) Test with Razorpay test mode before going live

Files to modify:
  - server/src/finance/finance.service.ts (payment logic)
  - server/src/finance/finance.controller.ts (new webhook endpoint)
  - src/app/(protected)/finance/ (checkout UI)

2.2  EMAIL SERVICE (SendGrid or AWS SES)
────────────────────────────────────────
Current state: Auth generates email verification and password reset tokens
but never sends emails.

What to implement:
  a) Install provider: npm install @sendgrid/mail  (or nodemailer for SES)
  b) Create email service: server/src/common/email.service.ts
  c) Email templates needed:
     - Email verification (link with token)
     - Password reset (link with token)
     - Fee payment receipt
     - Attendance deficiency alert
     - Admin notifications
  d) Hook into auth.service.ts:
     - After register → send verification email
     - After requestPasswordReset → send reset email
  e) Configure DNS: SPF, DKIM, DMARC records for your domain

2.3  PUSH NOTIFICATIONS (Firebase Cloud Messaging)
───────────────────────────────────────────────────
Current state: In-app notifications work. No push to mobile.

What to implement:
  a) Set up Firebase project, get server key
  b) Store device tokens in DB (add to User model)
  c) Send push on: new notice, attendance alert, fee due reminder, chat msg
  d) Flutter already has flutter_local_notifications — connect to FCM

================================================================================
PHASE 3: IMPORTING REAL COLLEGE DATA (Week 2-3)
================================================================================

3.1  DATA YOU NEED FROM THE COLLEGE
────────────────────────────────────
  a) DEPARTMENTS: name, code, HOD
  b) FACULTY: name, email, department, designation, specialization, phone
  c) STUDENTS: name, email, enrollment number, department, semester, batch,
     phone, DOB, address, guardian details
  d) COURSES: code, name, credits, department, type (core/elective/minor),
     instructor, semester, capacity
  e) TIMETABLE: course, day, time slot, room, faculty
  f) FEE STRUCTURE: category (tuition/hostel/mess/library/exam), amount,
     due dates per semester
  g) HOSTEL ALLOCATION: student → hostel → room
  h) EXISTING ATTENDANCE RECORDS (if migrating from legacy system)

3.2  BUILD BULK IMPORT ENDPOINTS
─────────────────────────────────
Currently missing. You need admin-only endpoints:

  POST /api/admin/import/students     (CSV upload → bulk create)
  POST /api/admin/import/faculty      (CSV upload → bulk create)
  POST /api/admin/import/courses      (CSV upload → bulk create)
  POST /api/admin/import/timetable    (CSV upload → bulk create)
  POST /api/admin/import/fees         (CSV upload → bulk create)

Implementation approach:
  a) Use multer for CSV file upload
  b) Parse with csv-parser or papaparse
  c) Validate each row against Zod schemas (shared/ already has schemas)
  d) Use Prisma createMany for batch inserts (much faster than individual)
  e) Return error report: which rows failed and why
  f) Build admin UI page for drag-and-drop CSV upload

3.3  CSV FORMAT TEMPLATES
─────────────────────────
Provide downloadable CSV templates for each entity so college staff
can fill data in the correct format:

students.csv:
  email, fullName, enrollmentNumber, department, semester, batch, phone, dob

faculty.csv:
  email, fullName, department, designation, specialization, phone

courses.csv:
  code, name, credits, department, courseType, semester, maxCapacity

fees.csv:
  studentEmail, category, amount, dueDate, semester

3.4  PASSWORD HANDLING FOR IMPORTED USERS
──────────────────────────────────────────
  - Generate temporary passwords (or use enrollment number as default)
  - Hash with bcrypt (cost 12) before inserting
  - Force password change on first login (add flag: mustChangePassword)
  - Send welcome email with temporary credentials

3.5  DATA VALIDATION CHECKLIST
──────────────────────────────
  [ ] Every student has a valid department that exists
  [ ] Every course has a valid instructor (faculty) that exists
  [ ] No duplicate enrollment numbers or emails
  [ ] Fee records reference existing students
  [ ] Timetable has no room/faculty conflicts
  [ ] All phone numbers and emails are in valid format

================================================================================
PHASE 4: SECURITY HARDENING (Week 3)
================================================================================

4.1  ALREADY IN PLACE (no action needed)
─────────────────────────────────────────
  ✓ JWT with refresh token rotation and reuse detection
  ✓ Bcrypt password hashing (cost 12)
  ✓ Account lockout (5 attempts → 15 min lock)
  ✓ Role-based access control (7 roles with route guards)
  ✓ Input sanitization middleware (HTML, injection prevention)
  ✓ Field-level encryption (AES-256-GCM) for PII (phone, address, bio)
  ✓ Helmet security headers (CSP, HSTS, X-Frame-Options, noSniff)
  ✓ CORS whitelist with credential enforcement
  ✓ Rate limiting (100 req/min short, 1000 req/10min long)
  ✓ Extra rate limiting on finance/payment routes
  ✓ HTTPS enforcement in production
  ✓ Superuser database connection blocking
  ✓ Audit logging of all API calls
  ✓ Session version tracking (invalidate on password change)

4.2  ADDITIONAL STEPS FOR PRODUCTION
─────────────────────────────────────
  [ ] Generate strong, unique JWT_SECRET (64+ chars)
  [ ] Generate strong FIELD_ENCRYPTION_KEY (32+ chars)
  [ ] Enable database encryption at rest (managed DB providers do this)
  [ ] Set up WAF (CloudFlare or AWS WAF) for DDoS protection
  [ ] Run OWASP ZAP or similar security scanner
  [ ] Conduct penetration testing before launch
  [ ] Establish 90-day secret rotation schedule
  [ ] Remove all console.log from production builds
  [ ] Verify CSP policy doesn't break functionality
  [ ] Test all auth flows: login, register, verify, reset, refresh, logout

================================================================================
PHASE 5: MONITORING & OBSERVABILITY (Week 3)
================================================================================

5.1  ERROR TRACKING
───────────────────
  - Set up Sentry (free tier available)
      npm install @sentry/nestjs @sentry/nextjs
  - Captures unhandled exceptions, slow transactions, user context
  - Configure alerts for error rate spikes

5.2  LOGGING
────────────
  - Backend already logs all requests (RequestLoggingMiddleware)
  - For production: pipe JSON logs to centralized service
    Options: Datadog, AWS CloudWatch, ELK Stack, Logtail
  - Retain logs for 90 days minimum

5.3  UPTIME MONITORING
──────────────────────
  - UptimeRobot (free) or BetterUptime
  - Monitor: frontend URL, backend /health endpoint, database connectivity
  - Alert via: email, Slack, SMS

5.4  PERFORMANCE MONITORING
───────────────────────────
  - Track: API response times, database query duration, memory usage
  - Set alerts: >500ms avg response, >80% memory, >90% CPU
  - Database: monitor slow queries, connection pool usage

5.5  BACKGROUND JOB MONITORING
──────────────────────────────
  - Backend has built-in background job system with retry logic
  - Monitor: audit log pruning, attendance checks, stale lock cleanup
  - Set BACKGROUND_JOB_WORKER_ENABLED=true in production

================================================================================
PHASE 6: TESTING BEFORE LAUNCH (Week 3-4)
================================================================================

6.1  FUNCTIONAL TESTING
───────────────────────
  Test each role end-to-end:

  STUDENT flow:
    [ ] Register → verify email → login
    [ ] Complete profile (department, semester, enrollment number)
    [ ] Browse and enroll in courses
    [ ] View timetable
    [ ] Scan QR for attendance
    [ ] View attendance percentage
    [ ] View exam schedule and results
    [ ] Pay fees via payment gateway
    [ ] View fee receipts and transaction history
    [ ] Order from canteen
    [ ] Browse and join clubs
    [ ] Post on marketplace
    [ ] Chat with other students
    [ ] View noticeboard
    [ ] Build portfolio/resume
    [ ] Report hostel issues
    [ ] Use campus map

  FACULTY flow:
    [ ] Login → complete profile
    [ ] Create attendance session (generate QR)
    [ ] View attendance reports
    [ ] Upload course materials
    [ ] Enter grades/CGPA
    [ ] Post notices
    [ ] Manage club (if advisor)

  ADMIN flow:
    [ ] Manage users (create, assign roles, lock/unlock)
    [ ] Bulk import students/faculty
    [ ] Manage fee structure
    [ ] Create/edit academic calendar
    [ ] Manage departments and courses
    [ ] View audit logs
    [ ] Toggle feature flags
    [ ] View finance dashboard

6.2  LOAD TESTING
─────────────────
  - Tool: k6, Artillery, or Apache JMeter
  - Simulate 500+ concurrent users
  - Test login surge (start of semester, all students login at once)
  - Test attendance surge (QR scan during class — 60 students in 2 minutes)
  - Test fee payment surge (deadline day)
  - Target: <500ms response time at peak load

6.3  MOBILE APP TESTING
───────────────────────
  - Test on real Android and iOS devices
  - Test offline mode (Hive caching)
  - Test QR scanning in various lighting conditions
  - Test biometric login
  - Test push notifications
  - Test on slow 3G network

================================================================================
PHASE 7: GO-LIVE (Week 4)
================================================================================

7.1  PRE-LAUNCH CHECKLIST
─────────────────────────
  [ ] All test accounts removed, seed data cleared
  [ ] Real college data imported and validated
  [ ] Payment gateway in live mode (not test)
  [ ] Email service verified (SPF/DKIM/DMARC passing)
  [ ] SSL certificate active and auto-renewing
  [ ] Database backups verified (test a restore)
  [ ] Monitoring and alerts configured
  [ ] Error tracking active
  [ ] Mobile apps published to stores
  [ ] Admin accounts created for college staff
  [ ] Support/helpdesk channel set up

7.2  LAUNCH DAY
───────────────
  a) Deploy during low-traffic hours (night/weekend)
  b) Import production data (students, faculty, courses, fees)
  c) Send welcome emails with temporary credentials
  d) Monitor error rates and response times closely
  e) Have on-call team ready for first 48 hours

7.3  POST-LAUNCH (First 2 Weeks)
─────────────────────────────────
  [ ] Monitor daily: error rates, slow queries, user complaints
  [ ] Fix critical bugs within 4 hours
  [ ] Collect user feedback (students, faculty, admin)
  [ ] Iterate on UX based on real usage patterns
  [ ] Verify backup/restore works with production data
  [ ] Scale resources if needed (database, server)

================================================================================
TECHNOLOGY STACK REFERENCE
================================================================================

Frontend:     Next.js 16 + React 19 + Tailwind CSS + Radix UI
Backend:      NestJS 11 + Express + Prisma 7 + PostgreSQL 16
Mobile:       Flutter 3.5+ (student app + faculty app)
Auth:         JWT + Refresh Token Rotation + Bcrypt + RBAC
AI:           Google Gemini 2.0 Flash + OpenAI (optional)
Validation:   Zod (shared schemas between frontend and backend)
Real-time:    WebSocket (Socket.io) for chat
Security:     Helmet, rate limiting, field encryption, audit logging
Build:        Turbo monorepo, SWC compiler
CI/CD:        GitHub Actions

================================================================================
DATABASE MODELS (51 total)
================================================================================

Core:           User, StudentProfile, FacultyProfile, Department, Role, UserRole
Auth:           RefreshToken, EmailVerificationToken, PasswordResetToken
Academic:       Course, Enrollment, Timetable, ExamSchedule, CgpaEntry
Attendance:     Attendance, AttendanceSession
Finance:        FeeRecord, FinanceTransaction
Campus:         CanteenItem, CanteenOrder, CampusMapRegion, CampusMapRoad
Community:      ChatRoom, Message, UserChatRoom, Notice, Club, ClubJoinRequest
Marketplace:    MarketplaceListing, MarketplaceChat, MarketplaceMessage,
                MarketplaceBookmark
Portfolio:      StudentProject, StudentSkill, FacultyPublication,
                FacultyAward, FacultyConference, FacultyConsultation
Notifications:  Notification
System:         AuditLog, FeatureFlag, BackgroundJob, AcademicCalendarEvent

================================================================================
QUICK COMMANDS REFERENCE
================================================================================

Development:
  npm run dev                  # Start frontend + backend concurrently
  npm run db:reset             # Wipe DB, push schema, seed data
  npm run prisma:studio        # Visual database browser

Database:
  cd server && npx prisma db push          # Sync schema (dev only)
  cd server && npx prisma migrate deploy   # Apply migrations (production)
  cd server && npx prisma generate         # Regenerate Prisma client
  cd server && npm run db:seed             # Seed test data

Build:
  npm run build                # Build all (frontend + backend)
  cd server && npm run build   # Build backend only

Mobile:
  cd mobile/pec_app && flutter run         # Run student app
  cd mobile/Faculty_App && flutter run     # Run faculty app
  flutter build apk --release              # Production APK

================================================================================
END OF GUIDE
================================================================================
