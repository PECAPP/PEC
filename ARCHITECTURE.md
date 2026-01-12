# OmniFlow - Architecture Documentation

Comprehensive technical architecture and design patterns used in OmniFlow ERP.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React + TypeScript)              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           UI Layer (Tailwind CSS + shadcn/ui)        │  │
│  │  Components: Header, Sidebar, Forms, Tables, Dialogs │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Business Logic Layer (React Hooks)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  useAuth, usePermissions, useDepartmentFilter, etc   │  │
│  │  Custom hooks for state management & side effects    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           API Layer (Firebase Client SDK)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firestore queries, mutations, real-time listeners   │  │
│  │  Authentication (Firebase Auth)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Firebase/Firestore)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Real-time Database, Authentication, Storage         │  │
│  │  Cloud Functions (future), Firestore Rules           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## 3 Core Architecture Features

### 1. Role-Based Access Control (RBAC)

#### Permission Model
```typescript
// Role Hierarchy
Super Admin
├── College Admin
│   ├── Faculty
│   └── Placement Officer
├── Recruiter
└── Student

// Permission Levels
- view_only: Read access
- create: Create new records
- edit: Modify existing records
- delete: Remove records
- approve: Approve requests
- manage_users: User management
- manage_organizations: System-wide config
```

#### Implementation
- **Permission Definitions** (`src/lib/rolePermissions.ts`):
  - Centralized permission mapping for all roles
  - Granular permission checking at feature level
  
- **Access Control** (`src/lib/accessControl.ts`):
  - Validates user permissions before rendering
  - Protects API routes with role checks
  - Automatic fallback for unauthorized access

- **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`):
  - Wraps routes requiring specific permissions
  - Provides fallback UI for insufficient permissions
  - Real-time permission validation

#### Permission Structure
```typescript
interface RolePermissions {
  view_dashboard: boolean;
  view_courses: boolean;
  create_course: boolean;
  manage_attendance: boolean;
  manage_grades: boolean;
  manage_users: boolean;
  manage_organizations: boolean;
  // ... 50+ permissions
}

// Each role has specific permissions
const studentPermissions: RolePermissions = {
  view_dashboard: true,
  view_courses: true,
  create_course: false,
  manage_users: false,
  // ...
};
```

### 2. Real-Time Data Synchronization

#### Firestore Integration
```typescript
// Real-time listeners
onSnapshot(collection(db, 'attendance'), (snapshot) => {
  // Automatic updates when data changes
  const records = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  setAttendance(records);
});

// Query with filtering
const q = query(
  collection(db, 'courses'),
  where('department', '==', currentDept),
  orderBy('semester', 'asc')
);

const unsubscribe = onSnapshot(q, (snapshot) => {
  // Data automatically syncs across all connected clients
});
```

#### Sync Features
- **Live Updates**: Any data change instantly reflects on all clients
- **Optimistic UI**: Updates reflected immediately, synced in background
- **Offline Support**: Data cached locally, synced on reconnection
- **Batch Operations**: Multiple updates in single transaction
- **Real-time Notifications**: Firestore triggers notify users of important events

#### Data Collections
```
users/
├── {userId}
│   ├── name: string
│   ├── email: string
│   ├── role: UserRole
│   ├── permissions: RolePermissions
│   └── profile: UserProfile

courses/
├── {courseId}
│   ├── name: string
│   ├── department: string
│   ├── credits: number
│   ├── materials: string[]
│   └── faculty: string (reference)

attendance/
├── {attendanceId}
│   ├── course: string (reference)
│   ├── date: timestamp
│   ├── students: Map<studentId, boolean>
│   └── marked_by: string (reference)

assignments/
├── {assignmentId}
│   ├── course: string (reference)
│   ├── title: string
│   ├── dueDate: timestamp
│   ├── submissions: Map<studentId, submission>
│   └── created_by: string (reference)

jobs/
├── {jobId}
│   ├── title: string
│   ├── company: string
│   ├── salary: number
│   ├── applications: string[] (references)
│   └── created_by: string (reference)
```

### 3. Responsive & Accessible Design

#### Responsive Breakpoints
```css
/* Mobile First Approach */
320px - 767px:   Mobile devices (default styles)
768px - 1024px:  Tablets (md: prefix)
1025px - 1440px: Desktops (lg: prefix)
1441px+:         Large desktops (xl: prefix)
```

#### Layout Responsive Features
- **Sidebar**: Collapsible on small screens, fixed on desktop
- **Navigation**: Mobile hamburger menu, desktop top nav
- **Grid Layouts**: 1-column mobile, 2-3 columns tablet, 4+ columns desktop
- **Tables**: Horizontal scroll on mobile, full view on desktop
- **Forms**: Stack vertically on mobile, side-by-side on desktop

#### Accessibility Features
- **WCAG 2.1 Level AA Compliance**
  - Semantic HTML (header, nav, main, article)
  - ARIA labels for interactive elements
  - Keyboard navigation support
  - Focus indicators for keyboard users
  - Color contrast ratios ≥ 4.5:1

- **Theme System**
  - Dark/Light mode with system preference detection
  - Accent color customization (6 preset themes)
  - Stored in localStorage for persistence
  - Automatic theme switching on schedule

- **Component Accessibility**
  - Dialog/Modal: Trap focus, close on ESC
  - Forms: Label associations, error messages
  - Buttons: Proper ARIA roles, loading states
  - Navigation: Active state indicators

#### Theme Implementation
```typescript
// Landing Color Theme
const colorThemes = [
  { name: "Green", value: "green", colors: { accent: "142 76% 45%" } },
  { name: "Red", value: "red", colors: { accent: "0 84% 60%" } },
  { name: "Purple", value: "purple", colors: { accent: "270 70% 60%" } },
  // ... more themes
];

// Applied to CSS variables
document.documentElement.style.setProperty('--color-accent', theme.colors.accent);
document.documentElement.style.setProperty('--color-primary', theme.colors.primary);
```

## Routing Architecture

```typescript
// Route Organization by Feature
/dashboard           → Role-based dashboards
/courses            → Course management
/timetable          → Schedule viewing
/attendance         → Attendance tracking
/examinations       → Exam management
/assignments        → Assignment submission
/finance            → Fee management & payments
/placements/*       → Job board, drives, applications
/resume-*           → Resume builder & analyzer
/hostel-issues      → Hostel management
/canteen            → Food ordering
/notifications      → Announcement center
/settings           → User preferences
/help/*             → Help documentation

/admin/*            → Administrative pages (Super Admin, College Admin)
├── /college-settings     → Branding and configuration
├── /payment-settings     → Payment gateway setup
├── /canteen             → Food menu management
├── /hostel              → Hostel operations

/departments        → Department management
/faculty            → Faculty management
/users              → User management

/auth               → Authentication
/profile            → User profile
```

## State Management Strategy

### React Hooks Pattern
```typescript
// Local Component State
const [formData, setFormData] = useState(initialState);
const [errors, setErrors] = useState({});

// Custom Hooks for Shared Logic
const { user, loading, error } = useAuth();
const { hasPermission } = usePermissions();
const { departmentFilter, setFilter } = useDepartmentFilter();

// Side Effects with Cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'courses'), (snapshot) => {
    setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  });
  return () => unsubscribe();
}, []);
```

### Context API (Where Needed)
```typescript
// Authentication Context
<AuthProvider>
  <PermissionsProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </PermissionsProvider>
</AuthProvider>
```

## Error Handling & Validation

### Form Validation
```typescript
// Zod/Schema validation (extensible)
const courseSchema = z.object({
  name: z.string().min(3).max(100),
  code: z.string().regex(/^[A-Z]{2}\d{3}$/),
  credits: z.number().min(1).max(4),
  department: z.string().uuid()
});

// Validation on submit
const handleSubmit = async (data) => {
  try {
    const validated = courseSchema.parse(data);
    await createCourse(validated);
    toast.success('Course created');
  } catch (error) {
    if (error instanceof z.ZodError) {
      setErrors(error.flatten().fieldErrors);
    }
  }
};
```

### API Error Handling
```typescript
// Firebase error handling
try {
  await updateDoc(docRef, updates);
} catch (error: any) {
  if (error.code === 'permission-denied') {
    toast.error('You do not have permission to perform this action');
  } else if (error.code === 'not-found') {
    toast.error('Resource not found');
  } else {
    toast.error('An error occurred. Please try again.');
  }
}
```

## Performance Optimization

### Code Splitting
```typescript
// Route-based code splitting with React.lazy
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Courses = lazy(() => import('./pages/Courses'));

<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/courses" element={<Courses />} />
  </Routes>
</Suspense>
```

### Query Optimization
```typescript
// Indexed Firestore queries
const q = query(
  collection(db, 'attendance'),
  where('course', '==', courseId),
  where('date', '>=', startDate),
  orderBy('date', 'desc'),
  limit(100)
);
```

### Image Optimization
```typescript
// Responsive images with srcset
<img 
  src="course.jpg"
  srcSet="course-small.jpg 640w, course-medium.jpg 1024w, course-large.jpg 1920w"
  alt="Course"
/>
```

## Security Measures

### Firestore Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.token.role in ['admin'];
    }
    
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.role in ['admin', 'faculty'];
    }
    
    match /assignments/{assignmentId} {
      allow read: if request.auth != null;
      allow create: if request.auth.token.role in ['faculty'];
      allow write: if resource.data.faculty == request.auth.uid;
    }
  }
}
```

### Authentication Flow
```typescript
// Secure token management
const handleLogin = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Fetch user permissions from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const { role, permissions } = userDoc.data();
    
    // Store in secure context
    setAuthUser({ uid: user.uid, email, role, permissions });
  } catch (error) {
    toast.error('Authentication failed');
  }
};
```

## Monitoring & Logging

### Error Tracking
```typescript
// Structured error logging
const logError = (error: Error, context: string) => {
  console.error(`[${context}]`, error);
  // Could send to error tracking service (Sentry, LogRocket)
};
```

### Performance Monitoring
```typescript
// Web Vitals tracking
if ('performance' in window) {
  const perfData = window.performance.timing;
  const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
  console.log(`Page load time: ${pageLoadTime}ms`);
}
```

## Development Workflow

### Git Branching Strategy
```
main (production)
├── develop (staging)
│   ├── feature/rbac-improvements
│   ├── feature/new-reporting
│   └── bugfix/attendance-sync
```

### Code Quality
- ESLint configuration for code standards
- TypeScript strict mode for type safety
- Prettier for consistent formatting
- Pre-commit hooks for validation

## Deployment Architecture

### Environments
- **Development**: Local Vite dev server with hot reload
- **Staging**: Preview deployment for testing
- **Production**: Optimized build on Vercel/Netlify

### Build Pipeline
```bash
npm run lint    # Code quality
npm run build   # Production build with optimizations
npm run preview # Test production build locally
```

---

**Last Updated**: January 2026
