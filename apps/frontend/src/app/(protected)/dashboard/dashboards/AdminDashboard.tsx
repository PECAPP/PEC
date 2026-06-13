'use client'; 
import { Button, Tabs, TabsContent, TabsList, TabsTrigger, PageBanner } from "@pec/ui";

import { useState, useEffect } from 'react';

import dynamic from 'next/dynamic';
import { Settings, Loader2, BookOpen, Users, BarChart3, LayoutDashboard } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAdminDashboard } from '@/hooks/useAdminDashboard';

// Types
import { AdminDashboardData } from '@pec/shared';

// Components
import { AdminStatsCards } from './components/AdminStatsCards';
import { CoursesTable } from './components/CoursesTable';
import { UsersTable } from './components/UsersTable';
import { CourseDialog } from './components/CourseDialog';
import { UserDialog } from './components/UserDialog';
import { RecentAdmissionsCard } from './components/RecentAdmissionsCard';
import { AttendanceSummaryCard } from './components/AttendanceSummaryCard';
import { BatchProgressCard } from './components/BatchProgressCard';
import { CollegeQuickActions } from './components/CollegeQuickActions';
import { DepartmentOverviewCard } from './components/DepartmentOverviewCard';

const AdminAnalyticsCharts = dynamic(
  () => import('./components/AdminAnalyticsCharts').then((mod) => mod.AdminAnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card/40 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 h-[320px] animate-pulse" />
        <div className="bg-card/40 border border-border/40 rounded-sm shadow-sm p-4 md:p-6 h-[320px] animate-pulse" />
      </div>
    ),
  }
);

export interface AdminDashboardProps {
  initialData?: AdminDashboardData;
}

export function AdminDashboard({ initialData }: AdminDashboardProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [timePeriod, setTimePeriod] = useState<string>('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimePeriod('Good Morning');
    else if (hour < 17) setTimePeriod('Good Afternoon');
    else setTimePeriod('Good Evening');
  }, []);

  const {
    loading,
    courses,
    users,
    stats,
    courseSearchQuery,
    setCourseSearchQuery,
    userSearchQuery,
    setUserSearchQuery,
    showCourseDialog,
    setShowCourseDialog,
    editingCourse,
    courseForm,
    setCourseForm,
    showUserDialog,
    setShowUserDialog,
    editingUser,
    userForm,
    setUserForm,
    handleCreateCourse,
    handleUpdateCourse,
    handleDeleteCourse,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    openEditCourseDialog,
    openEditUserDialog,
    resetCourseForm,
    resetUserForm,
    setEditingCourse,
    setEditingUser,
    recentAdmissions,
    departmentOverview,
    financeCharts,
  } = useAdminDashboard(initialData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin  mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageBanner
        title={timePeriod ? `${timePeriod}, Admin` : 'Welcome, Admin'}
        subtitle="Complete control over your institutional ERP system"
        badgeText="Administration"
        actions={
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/college-settings' as any)}
            className="gap-2 bg-background/50 hover:bg-background/80 backdrop-blur-md border-white/10"
          >
            <Settings className="w-4 h-4" />
            College Settings
          </Button>
        }
      />

      <AdminStatsCards stats={stats} onTabChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-start">
          <TabsList>
            <TabsTrigger value="overview"><LayoutDashboard className="w-4 h-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-2" />Courses</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <RecentAdmissionsCard recentAdmissions={recentAdmissions?.length ? recentAdmissions : users.slice(0, 5)} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <BatchProgressCard placed={1200} />
                <AttendanceSummaryCard />
              </div>
            </div>
            <div className="flex flex-col gap-6 h-full">
              <CollegeQuickActions type="users" />
              <div className="flex-1 min-h-0">
                <DepartmentOverviewCard departments={departmentOverview?.length ? departmentOverview : []} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <CoursesTable 
            courses={courses}
            searchQuery={courseSearchQuery}
            onSearchChange={setCourseSearchQuery}
            onAddCourse={() => { resetCourseForm(); setEditingCourse(null); setShowCourseDialog(true); }}
            onEditCourse={openEditCourseDialog}
            onDeleteCourse={handleDeleteCourse}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UsersTable 
            users={users}
            searchQuery={userSearchQuery}
            onSearchChange={setUserSearchQuery}
            onAddUser={() => { resetUserForm(); setEditingUser(null); setShowUserDialog(true); }}
            onEditUser={openEditUserDialog}
            onDeleteUser={handleDeleteUser}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <AdminAnalyticsCharts
            totalStudents={stats.totalStudents}
            totalFaculty={stats.totalFaculty}
            adminCount={users.filter((u: any) => u.role === 'college_admin' || u.role === 'super_admin').length}
            financeCharts={financeCharts}
          />
        </TabsContent>
      </Tabs>

      <CourseDialog 
        open={showCourseDialog}
        onOpenChange={setShowCourseDialog}
        editingCourse={editingCourse}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
        onCancel={() => { setShowCourseDialog(false); setEditingCourse(null); resetCourseForm(); }}
      />

      <UserDialog 
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        editingUser={editingUser}
        userForm={userForm}
        setUserForm={setUserForm}
        onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
        onCancel={() => { setShowUserDialog(false); setEditingUser(null); resetUserForm(); }}
      />
    </div>
  );
}
