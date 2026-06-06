'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';
import { Settings, Loader2, BookOpen, Users, BarChart3 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

// Types
import { AdminDashboardData, Course, User } from '@pec/shared';

// Components
import { AdminStatsCards } from './components/AdminStatsCards';
import { CoursesTable } from './components/CoursesTable';
import { UsersTable } from './components/UsersTable';
import { CourseDialog } from './components/CourseDialog';
import { UserDialog } from './components/UserDialog';

const AdminAnalyticsCharts = dynamic(
  () => import('./components/AdminAnalyticsCharts').then((mod) => mod.AdminAnalyticsCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-elevated p-6 h-[320px] bg-muted/40 animate-pulse" />
        <div className="card-elevated p-6 h-[320px] bg-muted/40 animate-pulse" />
      </div>
    ),
  }
);

export interface AdminDashboardProps {
  initialData?: AdminDashboardData;
}

export function AdminDashboard({ initialData }: AdminDashboardProps = {}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('courses');
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
  } = useAdminDashboard(initialData);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative overflow-hidden p-8 rounded-2xl bg-card/60 backdrop-blur-md border border-border flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-xl glass-premium">
        <div className="z-10">
          <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider mb-2">
            System Administration
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {getTimePeriod()}, Admin
          </h1>
          <p className="text-muted-foreground mt-1">Complete control over your institutional ERP system</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push('/admin/college-settings' as any)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            College Settings
          </Button>
        </div>
      </div>

      <AdminStatsCards stats={stats} onTabChange={setActiveTab} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap tabs-list-scroll">
          <TabsTrigger value="courses"><BookOpen className="w-4 h-4 mr-2" />Courses</TabsTrigger>
          <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
          <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
        </TabsList>

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
