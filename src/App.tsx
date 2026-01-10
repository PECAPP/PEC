import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import LandingPage from "./pages/LandingPage";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import GDPR from "./pages/GDPR";
import Cookies from "./pages/Cookies";
import Auth from "./pages/AuthEnhanced";
import RoleSelection from "./pages/RoleSelection";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import StudentProfile from "./pages/StudentProfile";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Timetable from "./pages/Timetable";
import Attendance from "./pages/Attendance";
import Examinations from "./pages/Examinations";
import Assignments from "./pages/Assignments";
import CourseMaterials from "./pages/CourseMaterials";
import Finance from "./pages/Finance";
import PaymentDetail from "./pages/PaymentDetail";
import Jobs from "./pages/placement/Jobs";
import PlacementDrives from "./pages/placement/PlacementDrives";
import PlacementApplications from "./pages/placement/PlacementApplications";
import PlacementRecruiters from "./pages/placement/Recruiters";
import MyApplications from "./pages/MyApplications";
import ResumeBuilderIvyLeague from "./pages/ResumeBuilderIvyLeague";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotificationDetail from "./pages/NotificationDetail";
import Help from "./pages/Help";
import GettingStarted from "./pages/help/GettingStarted";
import AccountProfile from "./pages/help/AccountProfile";
import AcademicsHelp from "./pages/help/Academics";
import SettingsPrivacy from "./pages/help/SettingsPrivacy";
import HostelIssues from "./pages/HostelIssues";
import Organizations from "./pages/admin/Organizations";
import OrganizationDetail from "./pages/admin/OrganizationDetail";
import AddOrganization from "./pages/admin/AddOrganization";
import SystemConfig from "./pages/admin/SystemConfig";
import SystemLogs from "./pages/admin/SystemLogs";
import Approvals from "./pages/admin/Approvals";
import Departments from "./pages/college/Departments";
import DepartmentDetail from "./pages/college/DepartmentDetail";
import FinancialReport from "./pages/college/FinancialReport";
import Admissions from "./pages/college/Admissions";
import Faculty from "./pages/college/Faculty";
import FacultyDetail from "./pages/college/FacultyDetail";
import AddFaculty from "./pages/college/AddFaculty";
import AddUser from "./pages/college/AddUser";
import UserDetail from "./pages/UserDetail";
import UsersPage from "./pages/Users";
import Reports from "./pages/college/Reports";
import AddCourse from "./pages/college/AddCourse";
import Schedule from "./pages/college/Schedule";
import FeeSetup from "./pages/college/FeeSetup";
import { ThemeProvider } from "next-themes";
import NotFound from "./pages/NotFound";
import DemoDashboard from "./pages/DemoDashboard";
import { NightCanteen } from './pages/NightCanteen';
import { CanteenManager } from './pages/admin/CanteenManager';
import HostelAdmin from './pages/admin/HostelAdmin';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/gdpr" element={<GDPR />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/demo-dashboard" element={<DemoDashboard />} />
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<StudentProfile />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/:userId" element={<UserDetail />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/timetable" element={<Timetable />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/examinations" element={<Examinations />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/course-materials" element={<CourseMaterials />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/finance/:id" element={<PaymentDetail />} />
              <Route path="/placements/jobs" element={<Jobs />} />
              <Route path="/placements/drives" element={<PlacementDrives />} />
              <Route path="/placements/applications" element={<PlacementApplications />} />
              <Route path="/placements/recruiters" element={<PlacementRecruiters />} />
              <Route path="/my-applications" element={<MyApplications />} />
              <Route path="/resume-builder" element={<ResumeBuilderIvyLeague />} />
              <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notifications/:id" element={<NotificationDetail />} />
              <Route path="/help" element={<Help />} />
              <Route path="/help/getting-started" element={<GettingStarted />} />
              <Route path="/help/account-profile" element={<AccountProfile />} />
              <Route path="/help/academics" element={<AcademicsHelp />} />
              <Route path="/help/settings-privacy" element={<SettingsPrivacy />} />
              <Route path="/hostel-issues" element={<HostelIssues />} />
              
              {/* Night Canteen */}
              <Route path="/canteen" element={<NightCanteen />} />
              <Route path="/admin/canteen" element={<CanteenManager />} />

              {/* Admin Routes */}
              <Route path="/admin/organizations" element={<Organizations />} />
              <Route path="/admin/organizations/new" element={<AddOrganization />} />
              <Route path="/admin/organizations/:id" element={<OrganizationDetail />} />
              <Route path="/admin/recruiters" element={<PlacementRecruiters />} />
              <Route path="/admin/system-config" element={<SystemConfig />} />
              <Route path="/admin/logs" element={<SystemLogs />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/hostel" element={<HostelAdmin />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/departments/:id" element={<DepartmentDetail />} />
              <Route path="/college/financial-report" element={<FinancialReport />} />
              <Route path="/college/admissions" element={<Admissions />} />
              <Route path="/dept" element={<Navigate to="/departments" replace />} />
              <Route path="/faculty" element={<Faculty />} />
              <Route path="/faculty/add" element={<AddFaculty />} />
              <Route path="/faculty/:id" element={<FacultyDetail />} />
              <Route path="/college/add-user" element={<AddUser />} />
              <Route path="/college/reports" element={<Reports />} />
              <Route path="/college/add-course" element={<AddCourse />} />
              <Route path="/college/schedule" element={<Schedule />} />
              <Route path="/college/fee-setup" element={<FeeSetup />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
