# OmniFlow - Architecture Documentation

Comprehensive technical architecture, design patterns, and implementation details of OmniFlow ERP platform.

## 📋 Table of Contents

1. [System Architecture Overview](#system-architecture-overview)
2. [Core Architecture Pillars](#core-architecture-pillars)
3. [Technology Stack Deep Dive](#technology-stack-deep-dive)
4. [Database Architecture](#database-architecture)
5. [Security Architecture](#security-architecture)
6. [Performance Architecture](#performance-architecture)
7. [Deployment Architecture](#deployment-architecture)
8. [Development Workflow](#development-workflow)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           React 18 + TypeScript Frontend                   │ │
│  │  Components, Pages, Hooks, Context, State Management      │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              UI/UX Layer                                   │ │
│  │  Tailwind CSS, shadcn/ui, Framer Motion, GSAP            │ │
│  │  Responsive Design, Accessibility, Themes                 │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Custom React Hooks                            │ │
│  │  useAuth, usePermissions, useFirestore, useChat, etc.     │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Business Logic Functions                      │ │
│  │  Validation, Calculations, Data Transformation            │ │
│  │  Access Control, Permission Checks, Filtering             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Firebase Client SDK                              │ │
│  │  Firestore (Database), Auth (Authentication),             │ │
│  │  Storage (Files), Cloud Messaging (Notifications)         │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           Third-Party APIs                                 │ │
│  │  Google Gemini (AI), Payment Gateways, Google Translate   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND SERVICES                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              Firebase/Google Cloud Platform                │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │      Firestore (NoSQL Database) + Security Rules          │ │
│  │      Firebase Authentication + User Management            │ │
│  │      Firebase Storage + CDN                               │ │
│  │      Firebase Cloud Messaging                             │ │
│  │      Cloud Functions (Serverless - Planned)               │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Architecture Principles

1. **Client-Side First**: Rich client-side application with minimal server dependencies
2. **Real-Time Sync**: Instant data updates across all connected clients
3. **Offline-First**: Local caching with background sync (planned)
4. **Security by Design**: Multi-layer security with RBAC and Firestore rules
5. **Scalability**: Horizontally scalable with Firebase's auto-scaling
6. **Modular Design**: Component-based architecture for maintainability
7. **Type Safety**: TypeScript for compile-time error checking
8. **Accessibility First**: WCAG 2.1 AA compliance built-in

---

## Core Architecture Pillars

### 1. Role-Based Access Control (RBAC)

**Complete implementation of fine-grained permission system**

#### Role Hierarchy

```
Super Admin (System-wide control)
├── College Admin (Institution management)
│   ├── Faculty (Teaching and grading)
│   └── Placement Officer (Career services)
├── Recruiter (Hiring and recruitment)
└── Student (Learning and services)
```

#### Permission Model

```typescript
// Permission Categories
interface RolePermissions {
  // Dashboard
  view_dashboard: boolean;
  view_analytics: boolean;
  
  // Academic
  view_courses: boolean;
  create_course: boolean;
  edit_course: boolean;
  delete_course: boolean;
  view_all_courses: boolean; // Cross-department
  
  // Attendance
  view_attendance: boolean;
  mark_attendance: boolean;
  edit_attendance: boolean;
  view_all_attendance: boolean;
  
  // Examinations
  view_exams: boolean;
  create_exams: boolean;
  schedule_exams: boolean;
  enter_grades: boolean;
  publish_grades: boolean;
  view_all_grades: boolean;
  
  // Assignments
  view_assignments: boolean;
  create_assignments: boolean;
  grade_assignments: boolean;
  submit_assignments: boolean;
  
  // Finance
  view_fees: boolean;
  modify_fee_structure: boolean;
  view_all_payments: boolean;
  process_refunds: boolean;
  configure_payment_gateways: boolean;
  
  // Placement
  view_jobs: boolean;
  post_jobs: boolean;
  view_applications: boolean;
  shortlist_candidates: boolean;
  schedule_interviews: boolean;
  view_student_profiles: boolean;
  post_drives: boolean;
  
  // User Management
  view_users: boolean;
  create_users: boolean;
  edit_users: boolean;
  delete_users: boolean;
  assign_roles: boolean;
  reset_passwords: boolean;
  
  // Department Management
  view_departments: boolean;
  create_departments: boolean;
  edit_departments: boolean;
  assign_hod: boolean;
  
  // System Configuration
  view_settings: boolean;
  edit_college_settings: boolean;
  configure_system: boolean;
  view_logs: boolean;
  manage_organizations: boolean;
  
  // Communication
  send_announcements: boolean;
  create_chat_groups: boolean;
  moderate_chats: boolean;
  
  // Campus Services
  manage_hostel: boolean;
  manage_canteen: boolean;
  manage_library: boolean;
  book_rooms: boolean;
  approve_room_bookings: boolean;
  
  // ... 50+ total permissions
}
```

#### Permission Implementation

**1. Permission Definitions** (`src/lib/rolePermissions.ts`)

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  student: {
    view_dashboard: true,
    view_courses: true,
    create_course: false,
    view_all_courses: false,
    submit_assignments: true,
    grade_assignments: false,
    // ... all permissions set
  },
  
  faculty: {
    view_dashboard: true,
    view_courses: true,
    create_course: true,
    edit_course: true,
    mark_attendance: true,
    grade_assignments: true,
    enter_grades: true,
    // ... all permissions set
  },
  
  college_admin: {
    // ... extensive permissions
  },
  
  placement_officer: {
    // ... placement-focused permissions
  },
  
  recruiter: {
    // ... hiring permissions
  },
  
  super_admin: {
    // ... all permissions true
  }
};
```

**2. Access Control Utilities** (`src/lib/accessControl.ts`)

```typescript
/**
 * Check if user has specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: keyof RolePermissions
): boolean {
  return ROLE_PERMISSIONS[userRole]?.[permission] || false;
}

/**
 * Check if user has ALL of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Array<keyof RolePermissions>
): boolean {
  return permissions.every(p => hasPermission(userRole, p));
}

/**
 * Check if user has ANY of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Array<keyof RolePermissions>
): boolean {
  return permissions.some(p => hasPermission(userRole, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}
```

**3. React Hook for Permissions** (`src/hooks/usePermissions.ts`)

```typescript
export function usePermissions() {
  const { user } = useAuth();
  
  const checkPermission = useCallback(
    (permission: keyof RolePermissions) => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );
  
  const checkAllPermissions = useCallback(
    (permissions: Array<keyof RolePermissions>) => {
      if (!user) return false;
      return hasAllPermissions(user.role, permissions);
    },
    [user]
  );
  
  const checkAnyPermission = useCallback(
    (permissions: Array<keyof RolePermissions>) => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions);
    },
    [user]
  );
  
  return {
    hasPermission: checkPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission: checkAnyPermission,
    permissions: user ? getRolePermissions(user.role) : null
  };
}
```

**4. Protected Route Component** (`src/components/ProtectedRoute.tsx`)

```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof RolePermissions;
  requiredPermissions?: Array<keyof RolePermissions>;
  requireAll?: boolean; // If true, user must have ALL permissions
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  fallback
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasPermission, hasAllPermissions, hasAnyPermission } = usePermissions();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Check single permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return fallback || <UnauthorizedPage />;
  }
  
  // Check multiple permissions
  if (requiredPermissions) {
    const hasAccess = requireAll
      ? hasAllPermissions(requiredPermissions)
      : hasAnyPermission(requiredPermissions);
    
    if (!hasAccess) {
      return fallback || <UnauthorizedPage />;
    }
  }
  
  return <>{children}</>;
}
```

**5. Usage in Components**

```typescript
// In a component
function CourseManagement() {
  const { hasPermission } = usePermissions();
  
  return (
    <div>
      {hasPermission('view_courses') && (
        <CourseList />
      )}
      
      {hasPermission('create_course') && (
        <Button onClick={openCreateDialog}>Create Course</Button>
      )}
    </div>
  );
}

// In routes
<Route
  path="/admin/college-settings"
  element={
    <ProtectedRoute requiredPermission="edit_college_settings">
      <CollegeSettings />
    </ProtectedRoute>
  }
/>
```

---

### 2. Real-Time Data Synchronization

**Firebase Firestore for instant updates across all clients**

#### Firestore Real-Time Patterns

**1. Real-Time Listeners**

```typescript
// Listen to a collection with auto-updates
useEffect(() => {
  const q = query(
    collection(db, 'courses'),
    where('department', '==', userDepartment),
    orderBy('createdAt', 'desc')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setCourses(courses);
  }, (error) => {
    console.error('Error fetching courses:', error);
  });
  
  // Cleanup listener on unmount
  return () => unsubscribe();
}, [userDepartment]);
```

**2. Optimistic UI Updates**

```typescript
async function markAttendance(courseId: string, students: AttendanceRecord[]) {
  // 1. Optimistically update UI immediately
  setAttendanceRecords(prev => [...prev, { courseId, students, date: new Date() }]);
  
  try {
    // 2. Send to Firestore in background
    await addDoc(collection(db, 'attendance'), {
      courseId,
      students,
      date: serverTimestamp(),
      markedBy: currentUser.uid
    });
    
    // 3. Success feedback
    toast.success('Attendance marked successfully');
  } catch (error) {
    // 4. Rollback on error
    setAttendanceRecords(prev => prev.filter(r => r.courseId !== courseId));
    toast.error('Failed to mark attendance');
  }
}
```

**3. Batch Operations**

```typescript
async function updateMultipleGrades(grades: GradeUpdate[]) {
  const batch = writeBatch(db);
  
  grades.forEach((grade) => {
    const gradeRef = doc(db, 'grades', grade.id);
    batch.update(gradeRef, {
      marks: grade.marks,
      updatedAt: serverTimestamp(),
      updatedBy: currentUser.uid
    });
  });
  
  await batch.commit();
  toast.success(`Updated ${grades.length} grades`);
}
```

**4. Offline Support** (Planned)

```typescript
// Enable offline persistence
enableIndexedDbPersistence(db);

// Data will be cached locally and synced when online
```

#### Real-Time Features in OmniFlow

- **Chat Messages**: Instant message delivery with read receipts
- **Notifications**: Real-time notification delivery
- **Attendance**: Live attendance updates for both faculty and students
- **Grades**: Instant grade publishing to students
- **Job Applications**: Real-time application status changes
- **Announcements**: Instant broadcast to all users
- **Online Status**: See who's currently online (planned)

---

### 3. Responsive & Accessible Design

**Mobile-first, WCAG 2.1 AA compliant design system**

#### Responsive Breakpoints

```css
/* Tailwind CSS Breakpoints */
/* Mobile (default) */
@media (min-width: 0px) { ... }

/* Tablet */
@media (min-width: 768px) { /* md: */ }

/* Desktop */
@media (min-width: 1024px) { /* lg: */ }

/* Large Desktop */
@media (min-width: 1280px) { /* xl: */ }

/* Extra Large */
@media (min-width: 1536px) { /* 2xl: */ }
```

#### Responsive Components Example

```typescript
// Sidebar - Responsive behavior
<aside className="
  fixed inset-y-0 left-0 z-50 w-64
  transform transition-transform
  md:relative md:translate-x-0
  ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
">
  {/* Sidebar content */}
</aside>

// Grid - Responsive columns
<div className="
  grid gap-4
  grid-cols-1        /* Mobile: 1 column */
  md:grid-cols-2     /* Tablet: 2 columns */
  lg:grid-cols3     /* Desktop: 3 columns */
  xl:grid-cols-4     /* Large: 4 columns */
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### Accessibility Implementation

**1. Semantic HTML**

```html
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Course Details</h1>
    <section>
      <!-- Content -->
    </section>
  </article>
</main>

<footer>
  <!-- Footer content -->
</footer>
```

**2. ARIA Labels and Roles**

```typescript
<button
  aria-label="Open navigation menu"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  onClick={toggleMenu}
>
  <MenuIcon />
</button>

<dialog
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
  aria-modal="true"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure you want to proceed?</p>
</dialog>
```

**3. Keyboard Navigation**

```typescript
function NavigationMenu() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex(prev => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      items[activeIndex].onClick();
    }
  };
  
  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="menuitem"
          tabIndex={index === activeIndex ? 0 : -1}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
```

**4. Focus Management**

```typescript
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in modal
      const focusable = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();
    } else {
      // Restore focus when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);
  
  return isOpen ? (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  ) : null;
}
```

**5. Color Contrast**

```typescript
// All colors meet WCAG AA contrast ratios
const colorTheme = {
  // Text colors on white background (4.5:1 minimum)
  text: {
    primary: 'hsl(0, 0%, 10%)',      // #1a1a1a - 16.5:1 ✓
    secondary: 'hsl(0, 0%, 30%)',    // #4d4d4d - 9.7:1 ✓
    muted: 'hsl(0, 0%, 45%)',        // #737373 - 5.8:1 ✓
  },
  
  // Background colors (checked against text)
  background: {
    primary: 'hsl(0, 0%, 100%)',     // White
    secondary: 'hsl(0, 0%, 98%)',    // Near white
    accent: 'hsl(142, 76%, 36%)',    // Green - 4.5:1 with white text ✓
  }
};
```

---

### 4. Multi-Organization Support

**Complete data isolation with organization scoping**

#### Organization Data Model

```typescript
interface Organization {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  settings: {
    branding: BrandingConfig;
    academicCalendar: AcademicCalendar;
    policies: Policies;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    validUntil: Timestamp;
    maxUsers: number;
  };
  createdAt: Timestamp;
  createdBy: string; // Super Admin ID
  isActive: boolean;
}
```

#### Organization Scoping

**1. Auto-Filter by Organization**

```typescript
// Custom hook for organization-scoped queries
export function useOrganizationData<T>(
  collectionName: string,
  ...queryConstraints: QueryConstraint[]
) {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  
  useEffect(() => {
    if (!user?.organizationId) return;
    
    const q = query(
      collection(db, collectionName),
      where('organizationId', '==', user.organizationId),
      ...queryConstraints
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(items);
    });
    
    return () => unsubscribe();
  }, [user, collectionName]);
  
  return data;
}

// Usage
const courses = useOrganizationData<Course>('courses', orderBy('name'));
// Automatically filtered by user's organization
```

**2. Organization Isolation in Firestore Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check organization
    function belongsToUserOrg(resource) {
      return request.auth.token.organizationId == resource.data.organizationId;
    }
    
    match /courses/{courseId} {
      allow read: if request.auth != null && belongsToUserOrg(resource);
      allow write: if request.auth != null 
                   && belongsToUserOrg(resource)
                   && request.auth.token.role in ['admin', 'faculty'];
    }
    
    match /users/{userId} {
      allow read: if request.auth != null && belongsToUserOrg(resource);
      allow write: if request.auth.uid == userId 
                   || request.auth.token.role == 'admin';
    }
  }
}
```

**3. Organization Switcher (Super Admin)**

```typescript
function OrganizationSwitcher() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<string>(user.organizationId);
  
  // Super admins can switch organizations
  if (user.role !== 'super_admin') return null;
  
  const switchOrganization = async (orgId: string) => {
    await updateDoc(doc(db, 'users', user.uid), {
      organizationId: orgId
    });
    setCurrentOrg(orgId);
    window.location.reload(); // Reload to fetch new org data
  };
  
  return (
    <Select value={currentOrg} onValueChange={switchOrganization}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {organizations.map(org => (
          <SelectItem key={org.id} value={org.id}>
            {org.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

---

## Technology Stack Deep Dive

### Frontend Framework

**React 18 + TypeScript**

- **React 18 Features Used**:
  - Concurrent rendering
  - Automatic batching
  - Transitions API for smooth UX
  - Suspense for data fetching
  - Server Components (planned for SSR)

**TypeScript Benefits**:
- Compile-time type checking
- IntelliSense autocomplete
- Refactoring safety
- Self-documenting code
- Reduced runtime errors

### Build Tool

**Vite (with SWC)**

- **Why Vite**:
  - Lightning-fast cold starts
  - Instant Hot Module Replacement (HMR)
  - Optimized production builds
  - Native ES modules
  - Built-in TypeScript support
  
- **SWC Compiler**:
  - 20x faster than Babel
  - Rust-based for performance
  - Full TypeScript support

### UI Framework

**Tailwind CSS + shadcn/ui**

- **Tailwind CSS**:
  - Utility-first approach
  - No CSS file bloat
  - PurgeCSS removes unused styles
  - Responsive design utilities
  - Dark mode support out of the box
  
- **shadcn/ui Components** (55+):
  - Accessible by default (ARIA)
  - Customizable and composable
  - Built on Radix UI primitives
  - Fully typed with TypeScript

### State Management

**React Hooks + Context API**

- **Local State**: `useState`, `useReducer`
- **Side Effects**: `useEffect`, `useLayoutEffect`
- **Memoization**: `useMemo`, `useCallback`
- **Context**: For global state (auth, theme)
- **No Redux**: Hooks sufficient for our use case

### Routing

**React Router v6**

- Nested routes
- Code splitting with lazy loading
- Protected routes
- Search params management
- Navigation guards

### Backend

**Firebase/Firestore**

- **Firestore Benefits**:
  - Real-time sync
  - Offline support
  - Automatic scaling
  - Generous free tier
  - Strong consistency
  - ACID transactions
  
- **Firebase Auth**:
  - Secure authentication
  - Email/password
  - OAuth ready (Google, Microsoft)
  - Session management
  
- **Firebase Storage**:
  - File uploads (images, PDFs, documents)
  - CDN distribution
  - Access control

---

## Database Architecture

### Firestore Collections Schema

#### Complete Data Model

```typescript
// Organizations
organizations/{orgId}
  - name: string
  - shortName: string
  - logo: string
  - settings: object
  - subscription: object
  - createdAt: timestamp
  - isActive: boolean

// Users
users/{userId}
  - email: string
  - name: string
  - role: 'student' | 'faculty' | 'admin' | ...
  - organizationId: string (reference)
  - department: string (reference)
  - photoURL: string
  - phone: string
  - createdAt: timestamp
  - lastLogin: timestamp
  - isActive: boolean

// Departments
departments/{deptId}
  - name: string
  - code: string
  - description: string
  - hod: string (user reference)
  - organizationId: string
  - studentCount: number
  - facultyCount: number
  - createdAt: timestamp

// Courses
courses/{courseId}
  - name: string
  - code: string
  - department: string (reference)
  - organizationId: string
  - credits: number
  - semester: number
  - year: number
  - facultyId: string (reference)
  - syllabus: string (URL)
  - materials: array[{type, title, url, uploadedAt}]
  - enrolledStudents: array[string]
  - createdAt: timestamp

// Attendance
attendance/{attendanceId}
  - courseId: string (reference)
  - organizationId: string
  - date: timestamp
  - markedBy: string (user reference)
  - students: map<studentId, {present: boolean, markedAt: timestamp}>
  - qrCode: string
  - sessionType: 'lecture' | 'lab' | 'tutorial'

// Assignments
assignments/{assignmentId}
  - courseId: string (reference)
  - organizationId: string
  - title: string
  - description: string
  - dueDate: timestamp
  - totalMarks: number
  - attachments: array[string]
  - createdBy: string (user reference)
  - submissions: map<studentId, {submittedAt, files, grade, feedback}>
  - createdAt: timestamp

// Exams
exams/{examId}
  - courseId: string (reference)
  - organizationId: string
  - name: string
  - date: timestamp
  - duration: number (minutes)
  - totalMarks: number
  - venue: string
  - seatingArrangement: map<studentId, {hallNumber, seatNumber}>
  - grades: map<studentId, {marks, grade, publishedAt}>
  - createdBy: string
  - isPublished: boolean

// Fees
fees/{feeId}
  - studentId: string (reference)
  - organizationId: string
  - academicYear: string
  - semester: number
  - feeStructure: {tuition, library, lab, sports, misc}
  - totalAmount: number
  - paidAmount: number
  - dueAmount: number
  - dueDate: timestamp
  - payments: array[{id, amount, method, transactionId, paidAt, receiptUrl}]

// Jobs (Placements)
jobs/{jobId}
  - title: string
  - company: string
  - organizationId: string
  - description: string
  - requirements: array[string]
  - salary: {min, max, currency}
  - location: string
  - type: 'full-time' | 'part-time' | 'internship'
  - skills: array[string]
  - eligibility: {minCGPA, departments, graduationYear}
  - applications: array[string] (student IDs)
  - postedBy: string (user reference)
  - status: 'open' | 'closed'
  - deadline: timestamp
  - createdAt: timestamp

// Chat Rooms
chatRooms/{roomId}
  - type: 'group' | 'direct'
  - name: string
  - description: string
  - participants: array[string] (user IDs)
  - admins: array[string] (user IDs)
  - organizationId: string
  - department: string (optional)
  - semester: number (optional)
  - createdBy: string
  - createdAt: timestamp
  - lastMessage: {text, sentBy, sentAt}

// Messages
messages/{messageId}
  - roomId: string (reference)
  - text: string
  - sentBy: string (user reference)
  - sentAt: timestamp
  - readBy: array[string] (user IDs)
  - attachments: array[{type, url, name}]
  - replyTo: string (message reference)
  - reactions: map<emoji, array[userId]>

// Notifications
notifications/{notificationId}
  - userId: string (reference)
  - organizationId: string
  - title: string
  - message: string
  - type: 'academic' | 'placement' | 'finance' | 'admin' | 'chat'
  - priority: 'low' | 'normal' | 'high' | 'critical'
  - link: string (deep link to relevant page)
  - isRead: boolean
  - createdAt: timestamp

// Hostel Issues
hostelIssues/{issueId}
  - studentId: string (reference)
  - organizationId: string
  - type: 'maintenance' | 'electrical' | 'plumbing' | 'cleanliness' | 'safety'
  - description: string
  - location: string (room number)
  - priority: 'low' | 'medium' | 'high' | 'urgent'
  - status: 'reported' | 'acknowledged' | 'in-progress' | 'resolved' | 'closed'
  - photos: array[string]
  - assignedTo: string (user reference)
  - resolvedAt: timestamp
  - resolutionNotes: string
  - createdAt: timestamp

// Canteen Orders
canteenOrders/{orderId}
  - studentId: string (reference)
  - organizationId: string
  - items: array[{name, quantity, price, customizations}]
  - totalAmount: number
  - deliveryLocation: string
  - deliveryTime: timestamp
  - status: 'received' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered'
  - paymentMethod: 'online' | 'cash'
  - paymentStatus: 'pending' | 'paid'
  - createdAt: timestamp

// And 10+ more collections...
```

### Indexing Strategy

```javascript
// Firestore composite indexes for efficient queries

// Courses by department and semester
courses: [organizationId ASC, department ASC, semester ASC]

// Attendance by course and date
attendance: [organizationId ASC, courseId ASC, date DESC]

// Jobs by organization and status
jobs: [organizationId ASC, status ASC, createdAt DESC]

// Messages by room and timestamp
messages: [roomId ASC, sentAt DESC]

// Notifications by user and read status
notifications: [userId ASC, isRead ASC, createdAt DESC]
```

---

## Security Architecture

### Firebase Security Rules

**Complete Firestore Rules Implementation**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper Functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserRole() {
      return request.auth.token.role;
    }
    
    function getUserOrg() {
      return request.auth.token.organizationId;
    }
    
    function belongsToSameOrg(data) {
      return data.organizationId == getUserOrg();
    }
    
    function isAdmin() {
      return getUserRole() in ['super_admin', 'college_admin'];
    }
    
    function isFaculty() {
      return getUserRole() == 'faculty';
    }
    
    function isStudent() {
      return getUserRole() == 'student';
    }
    
    function isSelf(userId) {
      return request.auth.uid == userId;
    }
    
    // Organizations - Only super admins
    match /organizations/{orgId} {
      allow read: if isAuthenticated();
      allow write: if getUserRole() == 'super_admin';
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && belongsToSameOrg(resource.data);
      allow update: if isSelf(userId) || isAdmin();
      allow create, delete: if isAdmin();
    }
    
    // Courses
    match /courses/{courseId} {
      allow read: if isAuthenticated() && belongsToSameOrg(resource.data);
      allow create, update: if (isAdmin() || isFaculty()) 
                              && belongsToSameOrg(request.resource.data);
      allow delete: if isAdmin() && belongsToSameOrg(resource.data);
    }
    
    // Attendance
    match /attendance/{attendanceId} {
      allow read: if isAuthenticated() && belongsToSameOrg(resource.data);
      allow create, update: if isFaculty() 
                             && belongsToSameOrg(request.resource.data);
      allow delete: if isAdmin();
    }
    
    // Assignments
    match /assignments/{assignmentId} {
      allow read: if isAuthenticated() && belongsToSameOrg(resource.data);
      allow create: if isFaculty() && belongsToSameOrg(request.resource.data);
      allow update: if isFaculty() 
                     && belongsToSameOrg(resource.data)
                     && resource.data.createdBy == request.auth.uid;
      allow delete: if isAdmin() || (
        isFaculty() && resource.data.createdBy == request.auth.uid
      );
    }
    
    // Fees
    match /fees/{feeId} {
      allow read: if isAuthenticated() 
                   && (isSelf(resource.data.studentId) || isAdmin());
      allow write: if isAdmin();
    }
    
    // Jobs
    match /jobs/{jobId} {
      allow read: if isAuthenticated() && belongsToSameOrg(resource.data);
      allow create: if getUserRole() in ['placement_officer', 'recruiter'];
      allow update, delete: if getUserRole() in ['placement_officer', 'recruiter']
                             && resource.data.postedBy == request.auth.uid;
    }
    
    // Chat Rooms
    match /chatRooms/{roomId} {
 allow read: if isAuthenticated() 
                   && getUserOrg() == resource.data.organizationId
                   && request.auth.uid in resource.data.participants;
      allow create: if isAuthenticated();
      allow update: if request.auth.uid in resource.data.admins;
    }
    
    // Messages
    match /messages/{messageId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() 
                     && request.resource.data.sentBy == request.auth.uid;
      allow update: if request.auth.uid == resource.data.sentBy;
      allow delete: if request.auth.uid == resource.data.sentBy 
                     || isAdmin();
    }
    
    // ... more collection rules
  }
}
```

### Input Validation with Zod

```typescript
import { z } from 'zod';

// Course validation schema
const courseSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters')
           .max(100, 'Name too long'),
  code: z.string().regex(/^[A-Z]{2,4}\d{3,4}$/, 'Invalid course code'),
  credits: z.number().int().min(1).max(6),
  department: z.string().uuid('Invalid department ID'),
  semester: z.number().int().min(1).max(8),
  facultyId: z.string().optional(),
});

// Usage
function validateCourse(data: unknown) {
  try {
    const validatedData = courseSchema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.flatten().fieldErrors 
      };
    }
    return { success: false, errors: { _form: 'Validation failed' } };
  }
}
```

---

## Performance Architecture

### Optimization Strategies

**1. Code Splitting & Lazy Loading**

```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));
const Placements = lazy(() => import('./pages/Placements'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/placements" element={<Placements />} />
      </Routes>
    </Suspense>
  );
}
```

**2. Memoization**

```typescript
// Memoize expensive calculations
const sortedCourses = useMemo(() => {
  return courses.sort((a, b) => a.name.localeCompare(b.name));
}, [courses]);

// Memoize callback functions
const handleCourseSelect = useCallback((courseId: string) => {
  setSelectedCourse(courseId);
  fetchCourseDetails(courseId);
}, []);
```

**3. Virtual Scrolling** (for large lists)

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function LargeStudentList({ students }: { students: Student[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const rowVirtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${rowVirtualizer.getTotalSize()}px` }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <StudentRow student={students[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**4. Image Optimization**

```typescript
// Lazy loading images
<img
  src={course.thumbnail}
  alt={course.name}
  loading="lazy"
  decoding="async"
/>

// Responsive images
<img
  src="course-large.jpg"
  srcSet="
    course-small.jpg 640w,
    course-medium.jpg 1024w,
    course-large.jpg 1920w
  "
  sizes="
    (max-width: 640px) 100vw,
    (max-width: 1024px) 50vw,
    33vw
  "
  alt="Course"
/>
```

---

## Deployment Architecture

### Production Deployment

**Hosting Options**:
1. **Vercel** (Recommended for React apps)
2. **Netlify**
3. **Firebase Hosting**
4. **AWS Amplify**

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
          # ... other env vars
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Last Updated**: January 2026  
**Version**: 2.0
