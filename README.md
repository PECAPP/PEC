# OmniFlow - College ERP Platform

A modern, comprehensive Enterprise Resource Planning system built for higher education institutions. OmniFlow streamlines student information, academics, placements, finance, and more in a single, unified platform.

## Overview

OmniFlow is a web-based ERP designed to replace fragmented legacy systems with an intuitive interface serving students, faculty, administrators, placement officers, and recruiters. The platform provides role-based dashboards, comprehensive academic management, and advanced placement features.

## Features

### Core Functionality
- **Student Information System** - Complete profiles, academic history, attendance tracking
- **Academic Management** - Course catalog, scheduling, curriculum, examination management
- **Attendance Tracking** - Threshold alerts and comprehensive reporting
- **Grades & Examinations** - Gradebook management, GPA calculations, transcript generation
- **Placement Portal** - Job postings, resume analyzer, recruiter management
- **Resume Builder** - Verified resume generation with QR code verification
- **Financial Management** - Fee collection, payment tracking, and reporting
- **Admissions System** - Application tracking, document management, interview scheduling

### Platform Features
- **Multi-Role Support** - Dedicated dashboards for 6+ user roles
- **Dark/Light Theme** - Full theme customization with system preference detection
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Comprehensive Help System** - 40+ articles across multiple categories

## Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or bun package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd omniflow

# Install dependencies
npm install
# or
bun install

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
```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── layout/          # Layout components (Header, Sidebar, MainLayout)
│   ├── ui/              # shadcn/ui component library (50+)
│   └── [feature]/       # Feature-specific components
├── pages/               # Page components organized by functionality
│   ├── admin/           # Administration pages
│   ├── college/         # College management pages
│   ├── dashboards/      # Role-based dashboards
│   ├── help/            # Help documentation
│   └── [page].tsx       # Individual page components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and helpers
├── types/               # TypeScript type definitions
├── App.tsx              # Root application component
└── main.tsx             # Application entry point
```

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite with SWC |
| **Styling** | Tailwind CSS |
| **UI Components** | shadcn/ui (50+) |
| **Routing** | React Router v6 |
| **Icons** | Lucide React |
| **Animations** | Framer Motion |
| **Fonts** | Monument Extended, Fraunces, DM Sans |

## Development

### Available Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## User Roles & Dashboards

The platform supports multiple user roles with specialized dashboards:

- **Students** - Access courses, grades, attendance, placements, and finance information
- **Faculty** - Manage courses, track attendance, assign grades, and track performance
- **College Admin** - Monitor institution statistics, manage departments, and track admissions
- **Placement Officer** - Manage recruitment drives and placement statistics
- **Recruiters** - Post jobs, review candidates, and manage applications
- **Super Admin** - System-wide configuration and organization management

## Responsive Design

Fully optimized for all devices:
- **Desktop** - 1920px and above
- **Tablet** - 768px to 1024px
- **Mobile** - 320px to 767px

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

All rights reserved © 2025. Proprietary software.

## Support

For help and support:
- Documentation: Check the Help section in the application
- Report Issues: Create an issue on the project repository
- Email: Contact your institution's support team

## Roadmap

Planned features and improvements:
- [ ] Mobile native applications (iOS/Android)
- [ ] Advanced analytics and data visualization
- [ ] Third-party integrations
- [ ] Multi-language support
- [ ] Real-time collaboration features
- [ ] Enhanced reporting capabilities

---

**Built with ❤️ for educational institutions**
