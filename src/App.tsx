import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppShellSkeleton } from "@/components/ui/skeletons";

const OrgScopeRedirect = ({ children }: { children: React.ReactNode }) => <>{children}</>;

// Initialize accent color from localStorage on page load
const initAccentColor = () => {
  const accent = localStorage.getItem('accent-color') || 'sapphire';
  const root = document.documentElement;
  root.classList.remove('accent-obsidian', 'accent-emerald', 'accent-sapphire', 'accent-amethyst', 'accent-coral');
  root.classList.add(`accent-${accent}`);
  root.removeAttribute('style');
};

const LandingPage = lazy(() => import("./pages/LandingPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Auth Pages
const AuthPage = lazy(() => import("./features/auth/pages/AuthPage"));
const RoleSelection = lazy(() => import("./features/auth/pages/RoleSelection"));
const Onboarding = lazy(() => import("./features/auth/pages/Onboarding"));
const ApplyInstitution = lazy(() => import("./pages/ApplyInstitution"));
const DemoDashboard = lazy(() => import("./pages/DemoDashboard"));

// Core Protected Pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ChatPage = lazy(() => import("./pages/Chat"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));

const UsersPage = lazy(() => import("./pages/Users"));
const UserDetail = lazy(() => import("./pages/UserDetail"));
const AddUser = lazy(() => import("./pages/college/AddUser"));
const Courses = lazy(() => import("./features/courses/pages/CoursesPage"));
const AddCourse = lazy(() => import("./features/courses/pages/AddCoursePage"));
const CourseDetail = lazy(() => import("./features/courses/pages/CourseDetailPage"));
const Timetable = lazy(() => import("./pages/Timetable"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Examinations = lazy(() => import("./pages/Examinations"));
const CourseMaterials = lazy(() => import("./features/courses/pages/CourseMaterialsPage"));
const PlacementDrives = lazy(() => import("./pages/placement/PlacementDrives"));
const ResumeBuilderIvyLeague = lazy(() => import("./pages/ResumeBuilderIvyLeague"));
const PublicStudentProfile = lazy(() => import("./pages/PublicStudentProfile"));
const Reports = lazy(() => import("./pages/college/Reports"));
const Schedule = lazy(() => import("./pages/college/Schedule"));
const FeeSetup = lazy(() => import("./pages/college/FeeSetup"));
const Help = lazy(() => import("./pages/Help"));
const GettingStarted = lazy(() => import("./pages/help/GettingStarted"));
const AccountProfile = lazy(() => import("./pages/help/AccountProfile"));
const AcademicsHelp = lazy(() => import("./pages/help/Academics"));
const SettingsPrivacy = lazy(() => import("./pages/help/SettingsPrivacy"));
const HostelIssues = lazy(() => import("./pages/HostelIssues"));
const NightCanteen = lazy(() => import("./pages/NightCanteen"));
const CampusMap = lazy(() => import("./pages/CampusMap"));
const CanteenManager = lazy(() => import("./pages/admin/CanteenManager"));
const HostelAdmin = lazy(() => import("./pages/admin/HostelAdmin"));
const Departments = lazy(() => import("./pages/college/Departments"));
const DepartmentDetail = lazy(() => import("./pages/college/DepartmentDetail"));
const FinancialReport = lazy(() => import("./pages/college/FinancialReport"));
const Admissions = lazy(() => import("./pages/college/Admissions"));
const Faculty = lazy(() => import("./pages/college/Faculty"));
const AddFaculty = lazy(() => import("./pages/college/AddFaculty"));
const FacultyDetail = lazy(() => import("./pages/college/FacultyDetail"));
const PaymentSettings = lazy(() => import("./pages/admin/PaymentSettings"));
const CollegeSettings = lazy(() => import("./pages/admin/CollegeSettings"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotificationDetail = lazy(() => import("./pages/NotificationDetail"));
const Search = lazy(() => import("./pages/Search"));


const PageLoader = () => (
  <AppShellSkeleton />
);

const AppRoutes = () => (
    <>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="chat" element={<ChatPage />} />
      <Route path="profile" element={<StudentProfile />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="users/add" element={<AddUser />} />
      <Route path="users/:userId" element={<UserDetail />} />
      <Route path="courses" element={<Courses />} />
      <Route path="courses/add" element={<AddCourse />} />
      <Route path="courses/:id" element={<CourseDetail />} />
      <Route path="timetable" element={<Timetable />} />
      <Route path="attendance" element={<Attendance />} />
      <Route path="examinations" element={<Examinations />} />
      <Route path="course-materials" element={<CourseMaterials />} />
      <Route path="placements/drives" element={<Navigate to="/dashboard" replace />} />
      <Route path="resume-builder" element={<ResumeBuilderIvyLeague />} />
      <Route path="assignments" element={<Navigate to="/dashboard" replace />} />
      <Route path="finance" element={<Navigate to="/dashboard" replace />} />
      <Route path="finance/:id" element={<Navigate to="/dashboard" replace />} />
      <Route path="career-portal" element={<Navigate to="/dashboard" replace />} />
      <Route path="jobs" element={<Navigate to="/dashboard" replace />} />
      <Route path="placements/jobs" element={<Navigate to="/dashboard" replace />} />
      <Route path="placements/applications" element={<Navigate to="/dashboard" replace />} />
      <Route path="my-applications" element={<Navigate to="/dashboard" replace />} />
      <Route path="library" element={<Navigate to="/dashboard" replace />} />
      <Route path="admin/placement-insights" element={<Navigate to="/dashboard" replace />} />
      <Route path="settings" element={<Settings />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="notifications/:id" element={<NotificationDetail />} />
      <Route path="search" element={<Search />} />
      <Route path="help" element={<Help />} />
      <Route path="help/getting-started" element={<GettingStarted />} />
      <Route path="help/account-profile" element={<AccountProfile />} />
      <Route path="help/academics" element={<AcademicsHelp />} />
      <Route path="help/settings-privacy" element={<SettingsPrivacy />} />
      <Route path="hostel-issues" element={<HostelIssues />} />
      <Route path="canteen" element={<NightCanteen />} />
      <Route path="campus-map" element={<CampusMap />} />
      <Route path="admin/canteen" element={<CanteenManager />} />
      <Route path="admin/hostel" element={<HostelAdmin />} />
      <Route path="departments" element={<Departments />} />
      <Route path="departments/:id" element={<DepartmentDetail />} />
      <Route path="college/financial-report" element={<FinancialReport />} />
      <Route path="college/admissions" element={<Admissions />} />
      <Route path="faculty" element={<Faculty />} />
      <Route path="faculty/add" element={<AddFaculty />} />
      <Route path="faculty/:id" element={<FacultyDetail />} />
      <Route path="college/add-user" element={<AddUser />} />
      <Route path="college/reports" element={<Reports />} />
      <Route path="college/add-course" element={<AddCourse />} />
      <Route path="college/schedule" element={<Schedule />} />
      <Route path="college/fee-setup" element={<FeeSetup />} />
      <Route path="admin/payment-settings" element={<PaymentSettings />} />
      <Route path="admin/college-settings" element={<CollegeSettings />} />
    </>
  );
  
const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    initAccentColor();
  }, []);

  return (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/role-selection" element={<RoleSelection />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/apply-institution" element={<ApplyInstitution />} />
              <Route path="/demo-dashboard" element={<DemoDashboard />} />
              <Route path="/student/:id" element={<PublicStudentProfile />} />
              
              <Route path="/:orgSlug" element={<MainLayout />}>
                {AppRoutes()}
              </Route>

              <Route element={<OrgScopeRedirect><MainLayout /></OrgScopeRedirect>}>
                {AppRoutes()}
              </Route>

              <Route path="*" element={<Navigate to="/404" replace />} />
              <Route path="/404" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  </ThemeProvider>
  );
};

export default App;
