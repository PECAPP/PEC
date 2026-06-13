'use client';
import { extractData } from "@/lib/utils";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { User, Course, DashboardStats, AdminDashboardData } from '@pec/shared';
import api from "@pec/api";
import { toast } from 'sonner';

export function useAdminDashboard(initialData?: AdminDashboardData) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(!initialData);
  const [courses, setCourses] = useState<Course[]>((initialData?.courses as Course[]) || []);
  const [users, setUsers] = useState<User[]>((initialData?.users as User[]) || []);
  const [stats, setStats] = useState<DashboardStats>(
    initialData?.stats || {
      totalStudents: 0,
      totalFaculty: 0,
      totalCourses: 0,
    }
  );
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);
  const [departmentOverview, setDepartmentOverview] = useState<any[]>([]);
  const [financeCharts, setFinanceCharts] = useState<any>(null);

  // Course Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: '',
    semester: 1,
    credits: 3,
    facultyName: '',
    maxStudents: 60,
    description: '',
  });

  // User Dialog states
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    role: 'student',
    department: '',
    enrollmentNumber: '',
    semester: 1,
  });

  // Search states
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const isAdmin = ['college_admin'].includes(user?.role || '');

  const filteredCourses = (courses || []).filter((course) => {
    const query = courseSearchQuery.toLowerCase();
    return (
      course.name?.toLowerCase().includes(query) ||
      course.code?.toLowerCase().includes(query) ||
      course.department?.toLowerCase().includes(query)
    );
  });

  const filteredUsers = (users || []).filter((user) => {
    const query = userSearchQuery.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.role?.toLowerCase().includes(query)
    );
  });

  const fetchAdminData = useCallback(async () => {
    try {
      const [coursesData, usersData, analyticsRes] = await Promise.all([
        api.get('/courses', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
        api.get('/users', { params: { limit: 2000 } }).then(res => extractData<any>(res.data)),
        api.get('/analytics/dashboard'),
      ]);

      setCourses(coursesData);
      setUsers(usersData);

      const analyticsData = analyticsRes.data?.success ? analyticsRes.data.data : analyticsRes.data;
      if (analyticsData) {
        if (analyticsData.stats) setStats(analyticsData.stats);
        if (analyticsData.recentAdmissions) setRecentAdmissions(analyticsData.recentAdmissions);
        if (analyticsData.departmentOverview) setDepartmentOverview(analyticsData.departmentOverview);
        if (analyticsData.financeCharts) setFinanceCharts(analyticsData.financeCharts);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Let middleware handle the redirect — don't force it from client
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      router.replace('/dashboard');
      return;
    }

    // Skip initial fetch if we already have server data
    if (initialData && courses.length > 0) {
      setLoading(false);
      return;
    }

    void (async () => {
      try {
        await fetchAdminData();
      } catch (_error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, isAdmin, router, fetchAdminData, initialData]);

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      name: '',
      department: '',
      semester: 1,
      credits: 3,
      facultyName: '',
      maxStudents: 60,
      description: '',
    });
  };

  const resetUserForm = () => {
    setUserForm({
      fullName: '',
      email: '',
      role: 'student',
      department: '',
      enrollmentNumber: '',
      semester: 1,
    });
  };

  const handleCreateCourse = async () => {
    try {
      await api.post('/courses', {
        ...courseForm,
        credits: Number(courseForm.credits),
        semester: Number(courseForm.semester),
        instructor: courseForm.facultyName,
        status: 'active',
      });
      toast.success('Course created successfully!');
      setShowCourseDialog(false);
      resetCourseForm();
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      await api.patch(`/courses/${editingCourse.id}`, {
        ...courseForm,
        credits: Number(courseForm.credits),
        semester: Number(courseForm.semester),
        instructor: courseForm.facultyName,
      });
      toast.success('Course updated successfully!');
      setShowCourseDialog(false);
      setEditingCourse(null);
      resetCourseForm();
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to delete course');
    }
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/users', {
        ...userForm,
        semester: Number(userForm.semester),
      });
      toast.success('User created successfully!');
      setShowUserDialog(false);
      resetUserForm();
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await api.patch(`/users/${editingUser.id}`, {
        ...userForm,
        semester: Number(userForm.semester),
      });
      toast.success('User updated successfully!');
      setShowUserDialog(false);
      setEditingUser(null);
      resetUserForm();
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully!');
      await fetchAdminData();
    } catch (_error) {
      toast.error('Failed to delete user');
    }
  };

  const openEditCourseDialog = (course: any) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      facultyName: course.instructor || course.facultyName || '',
      maxStudents: course.maxStudents || 60,
      description: course.description || '',
    });
    setShowCourseDialog(true);
  };

  const openEditUserDialog = (user: any) => {
    setEditingUser(user);
    setUserForm({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || '',
      enrollmentNumber: user.enrollmentNumber || '',
      semester: user.semester || 1,
    });
    setShowUserDialog(true);
  };

  return {
    loading,
    courses: filteredCourses,
    users: filteredUsers,
    stats,
    recentAdmissions,
    departmentOverview,
    financeCharts,
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
    user,
    setEditingCourse,
    setEditingUser,
  };
}
