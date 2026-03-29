'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useAdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalCourses: 0,
  });

  // Course Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
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
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    role: 'student',
    department: '',
    enrollmentNumber: '',
    semester: 1,
  });

  const isAdmin = ['college_admin', 'super_admin', 'admin', 'moderator'].includes(user?.role || '');

  const fetchAdminData = useCallback(async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: { total?: number } };

      const [coursesRes, usersRes] = await Promise.all([
        api.get<ApiResponse<any[]>>('/courses', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any[]>>('/users', { params: { limit: 200, offset: 0 } }),
      ]);

      const coursesData = coursesRes.data.data || [];
      setCourses(coursesData);

      const usersData = usersRes.data.data || [];
      setUsers(usersData);

      // Calculate stats
      const students = (usersData as any[]).filter(u => u.role === 'student').length;
      const faculty = (usersData as any[]).filter(u => u.role === 'faculty').length;
      
      setStats({
        totalStudents: students,
        totalFaculty: faculty,
        totalCourses: coursesData.length,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      router.replace('/dashboard');
      return;
    }

    void (async () => {
      try {
        await fetchAdminData();
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, isAdmin, router, fetchAdminData]);

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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      await fetchAdminData();
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if(!confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully!');
      await fetchAdminData();
    } catch (error) {
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
    courses,
    users,
    stats,
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
