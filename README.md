# OmniFlow - College ERP Platform

A modern, comprehensive Enterprise Resource Planning system built for higher education institutions. OmniFlow streamlines student information, academics, placements, finance, and more in a single, unified platform.

## Overview

OmniFlow is a web-based ERP designed to replace fragmented legacy systems with an intuitive interface serving students, faculty, administrators, placement officers, and recruiters. The platform provides role-based dashboards, comprehensive academic management, and advanced placement features. Every feature is carefully crafted with proper authentication, real-time data synchronization, and an exceptional user experience.

## ✨ Core Features

### 📚 Academic Management
- **Courses & Syllabus** - Browse and manage courses with detailed course materials, syllabus documents, and learning resources
- **Timetable Management** - View personalized schedules with conflict detection; Faculty can manage and publish schedules
- **Attendance Tracking** - Real-time attendance marking for faculty with student absence tracking; Students can view attendance records
- **Examinations** - Complete exam management including scheduling, seating arrangements, grade publication, and transcript generation
- **Assignments** - Create, submit, and grade assignments with deadline tracking and submission status monitoring
- **Course Materials** - Centralized repository for course notes, assignments, past papers, and study materials

### 💼 Placement & Career Development
- **Job Board** - Browse and apply to job postings with application status tracking
- **Recruitment Drives** - View upcoming placement drives, register for interviews, and track application progress
- **Resume Builder** - Interactive resume builder with multiple professional templates and instant preview
- **Resume Analyzer** - AI-powered resume analysis providing feedback on formatting, content, and keyword optimization
- **Recruiter Management** - View recruiter profiles, company details, and interview schedules
- **Application Tracking** - Manage all job applications in one place with status updates and interview schedules

### 💰 Finance Management
- **Fee Management** - View fee structure, payment history, and outstanding balance information
- **Online Payments** - Multiple payment methods including UPI and Bank Transfer with instant confirmation
- **Payment Settings** - Configure payment methods and gateways for student payments
- **Financial Reports** - Generate and view financial reports, receipts, and transaction history
- **Payment Tracking** - Real-time payment status and transaction verification

### 🛏️ Student Services
- **Hostel Management** - Report and track hostel-related issues with priority categorization and resolution timeline
- **Night Canteen** - Order food for late-night study sessions with delivery tracking
- **Student Profile** - Comprehensive profile management including personal details, academic history, and preferences
- **Notifications** - Real-time notifications for assignments, exams, placement drives, and important announcements

### ⚙️ Administration & Management
- **User Management** - Complete user lifecycle management with role assignment and permission control
- **Department Management** - Create and manage departments, assign faculty, and track enrollment
- **Faculty Management** - Faculty profiles, specialization tracking, course assignments, and performance metrics
- **College Settings** - Configure college branding with logo upload, display options, and institutional information
- **Canteen Management** - Manage food menu, pricing, and order fulfillment for canteen services
- **Hostel Management (Admin)** - Monitor hostel operations, resolve issues, and manage resident records

### 📖 Help & Support
- **Comprehensive Help System** - 40+ help articles covering:
  - Getting Started guide
  - Account & Profile management
  - Academics & Course guidance
  - Settings & Privacy information
- **In-App Documentation** - Context-aware help available throughout the platform
- **Support Resources** - Direct access to support contact information and FAQs

## 🏗️ Architecture Features

### 1. **Role-Based Access Control (RBAC)**
   - 6 distinct user roles: Super Admin, College Admin, Faculty, Student, Placement Officer, Recruiter
   - Each role has specialized dashboards, features, and permissions
   - Granular permission system ensuring users only see relevant data
   - Protected routes with automatic redirects for unauthorized access
   - Real-time permission validation at component level

### 2. **Real-Time Data Synchronization**
   - Firebase Firestore integration for instant data updates across all clients
   - Live notification system for announcements and important updates
   - Automatic sync of attendance, grades, and payment status
   - Optimistic UI updates for better user experience
   - Offline-first capability with sync on reconnection

### 3. **Responsive & Accessible Design**
   - Mobile-first approach with full responsiveness across all devices
   - Dark/Light theme support with system preference detection
   - Accent color customization with 6 pre-built themes
   - Accessibility compliance with WCAG standards
   - Touch-optimized interface for mobile devices
   - Smooth animations with Framer Motion for modern UX

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or bun package manager
- Firebase account (for backend services)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd omniflow

# Install dependencies
npm install
# or
bun install

# Set up environment variables
# Create .env.local file with Firebase configuration
# VITE_FIREBASE_API_KEY=your_api_key
# VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
# etc.

# Start development server
npm run dev
# or
bun run dev
```

Access the application at `http://localhost:5173`

### Production Build

```bash
npm run build
# or
bun run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Top navigation bar with search and user menu
│   │   ├── Sidebar.tsx         # Left navigation with role-based items
│   │   └── MainLayout.tsx      # Main app layout wrapper
│   ├── ui/                     # shadcn/ui components (50+)
│   ├── animations/             # Animation components (ScrollReveal, Counter)
│   ├── attendance/             # QR code attendance components
│   ├── common/                 # Reusable utilities (dialogs, export, import)
│   └── [feature]/              # Feature-specific components
├── pages/
│   ├── admin/                  # Admin-only pages
│   │   ├── CollegeSettings.tsx
│   │   ├── CanteenManager.tsx
│   │   └── HostelAdmin.tsx
│   ├── college/                # College management pages
│   │   ├── Departments.tsx
│   │   ├── Faculty.tsx
│   │   └── Reports.tsx
│   ├── dashboards/             # Dashboard pages
│   ├── placement/              # Placement-related pages
│   ├── help/                   # Help documentation pages
│   ├── Courses.tsx             # Course management
│   ├── Timetable.tsx           # Schedule view/management
│   ├── Attendance.tsx          # Attendance marking
│   ├── Examinations.tsx        # Exam management
│   ├── Assignments.tsx         # Assignment tracking
│   ├── Finance.tsx             # Fee management
│   ├── StudentProfile.tsx      # User profile
│   └── [page].tsx              # Individual pages
├── hooks/
│   ├── useAuth.ts              # Authentication hook
│   ├── usePermissions.ts       # Permission checking
│   ├── useDepartmentFilter.ts  # Department filtering
│   └── [hook].ts               # Custom hooks
├── lib/
│   ├── firebase.ts             # Firebase config
│   ├── accessControl.ts        # Access control logic
│   ├── permissions.ts          # Permission definitions
│   ├── rolePermissions.ts      # Role-based permissions
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
├── config/
│   └── firebase.ts             # Firebase initialization
├── App.tsx                     # Root component with routes
└── main.tsx                    # Application entry point
```

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 18 + TypeScript | Modern UI with type safety |
| **Build Tool** | Vite with SWC | Fast development and production builds |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Library** | shadcn/ui (50+) | Pre-built accessible components |
| **Routing** | React Router v6 | Client-side routing |
| **Backend** | Firebase/Firestore | Real-time database and authentication |
| **Icons** | Lucide React | 300+ SVG icons |
| **Animations** | Framer Motion | Smooth UI animations |
| **State Management** | React Hooks | Built-in React state management |
| **PDF Export** | pdfkit, html2pdf | Document generation |
| **Fonts** | Monument Extended, Fraunces, DM Sans | Custom typography |

## Development

### Available Commands

```bash
npm run dev        # Start development server (hot reload)
npm run build      # Build for production
npm run lint       # Run ESLint code linting
npm run preview    # Preview production build locally
```

### Key Development Files

- **Environment Variables**: `.env.local` (Firebase configuration)
- **Styling**: `src/index.css` (Tailwind CSS and custom styles)
- **Configuration**: `vite.config.ts`, `tailwind.config.ts`, `tsconfig.json`

## Authentication & Security

- **Firebase Authentication** - Secure sign-up and login with email/password
- **Session Management** - Automatic logout on token expiration
- **Role-Based Access Control** - Secure access to protected routes
- **Data Encryption** - Sensitive data encrypted in transit and at rest
- **Environment Variables** - API keys stored securely

## User Roles & Capabilities

### Student
- View courses and materials
- Track attendance and grades
- Submit assignments
- Apply for placements
- Manage hostel and canteen services
- View fees and make payments

### Faculty
- Manage courses and materials
- Mark attendance
- Grade assignments and exams
- View student performance
- Manage timetables

### College Admin
- Manage departments and faculty
- View reports and analytics
- Configure payment settings
- Manage hostel and canteen

### Placement Officer
- Post jobs and recruitment drives
- Review candidate applications
- Manage recruiter interactions
- Track placement statistics

### Recruiter
- Post job openings
- View and shortlist candidates
- Schedule interviews
- Track hiring pipeline

### Super Admin
- System-wide configuration
- User management and permissions
- College branding and settings
- Access all administrative features

## Responsive Design

Fully optimized for all devices:
- **Desktop** (1920px+) - Full feature set with expanded layouts
- **Tablet** (768px-1024px) - Optimized touch interface
- **Mobile** (320px-767px) - Compact layouts with mobile-first navigation

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Database Schema

### Core Collections
- **users** - User accounts with roles and permissions
- **courses** - Course information and materials
- **attendance** - Attendance records by course and date
- **assignments** - Assignment details and submissions
- **exams** - Examination schedules and grades
- **fees** - Fee structure and payment records
- **jobs** - Job postings and applications
- **profiles** - Extended user profile information

### Real-time Features
- Firestore triggers for automatic notifications
- Real-time updates on attendance and grades
- Live notification delivery to users

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Performance Optimization

- Lazy loading of route components
- Image optimization with responsive sizing
- CSS-in-JS with Tailwind for minimal bundle size
- Code splitting with React Router
- Optimized Firebase queries with proper indexing

## Deployment

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy
```

### Environment Variables Required
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## License

All rights reserved © 2025. Proprietary software.

## Support

For help and support:
- **In-App Help**: Access the Help & Support section in the application
- **Documentation**: Comprehensive help articles covering all features
- **Report Issues**: Contact your institution's support team
- **Feature Requests**: Submit feedback through the application

## Roadmap

### Planned Features (Future Releases)
- [ ] Room booking system for seminar halls and labs
- [ ] Leave management system with approval workflows
- [ ] Library management with book lending system
- [ ] Clubs and activities with event management
- [ ] Advanced analytics and data visualization
- [ ] Mobile native applications (iOS/Android)
- [ ] Third-party integrations (Google Classroom, LMS)
- [ ] Multi-language support (i18n)
- [ ] Real-time collaboration features
- [ ] Enhanced reporting with custom dashboards

## Changelog

### v1.0.0 (Current)
- ✅ Complete academic management system
- ✅ Placement portal with application tracking
- ✅ Finance module with payment integration
- ✅ Student services (Hostel, Canteen)
- ✅ Role-based access control
- ✅ Real-time notifications
- ✅ Dark/Light theme support
- ✅ Responsive mobile-friendly design

---

**Built with ❤️ for educational institutions**

*Last Updated: January 2026*

- [ ] Mobile native applications (iOS/Android)
- [ ] Advanced analytics and data visualization
- [ ] Third-party integrations
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Enhanced reporting capabilities

---

**Built with ❤️ for educational institutions**
