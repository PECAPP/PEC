'use client';

import { useEffect, useState } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
;
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, Building2, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

type StudentFormData = {
  enrollmentNumber: string;
  department: string;
  semester: string;
  phone: string;
  dob: string;
  address: string;
  bio: string;
};

type FacultyFormData = {
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  qualifications: string;
  bio: string;
};

type AdminFormData = {
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  responsibilities: string;
  bio: string;
};

const roleIcons: Record<UserRole, ElementType> = {
  student: GraduationCap,
  faculty: Users,
  college_admin: Building2,
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  college_admin: 'College Admin',
};

export default function Onboarding() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [studentForm, setStudentForm] = useState<StudentFormData>({
    enrollmentNumber: '',
    department: '',
    semester: '1',
    phone: '',
    dob: '',
    address: '',
    bio: '',
  });

  const [facultyForm, setFacultyForm] = useState<FacultyFormData>({
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    specialization: '',
    qualifications: '',
    bio: '',
  });

  const [adminForm, setAdminForm] = useState<AdminFormData>({
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    responsibilities: '',
    bio: '',
  });

  useEffect(() => {
    if (authLoading) return;

    if (!user || !token) {
      router.replace('/auth');
      return;
    }

    if (!user.role) {
      router.replace('/role-selection');
      return;
    }

    if (user.profileComplete) {
      router.replace('/dashboard');
      return;
    }

    setChecking(false);
  }, [authLoading, user, token, router]);

  const completeProfile = async (profileData: Record<string, any>) => {
    if (!token || !user) return;

    await axios.post(
      `${API_BASE_URL}/auth/complete-profile`,
      {
        role: user.role,
        userId: user.id,
        email: user.email,
        fullName: user.fullName || user.name,
        ...profileData,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    window.dispatchEvent(new Event('auth-change'));
    toast.success('Profile completed successfully');
    router.replace('/dashboard');
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.role) return;

    setSubmitting(true);
    try {
      if (user.role === 'student') {
        await completeProfile(studentForm);
      } else if (user.role === 'faculty') {
        await completeProfile(facultyForm);
      } else {
        await completeProfile(adminForm);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to complete profile');
      setSubmitting(false);
    }
  };

  if (checking || !user?.role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const RoleIcon = roleIcons[user.role];

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <RoleIcon className="w-8 h-8 text-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">Tell us more about yourself as a {roleLabels[user.role]}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Fill in required details to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              {user.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Enrollment Number</Label>
                      <Input value={studentForm.enrollmentNumber} onChange={(e) => setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={studentForm.department} onChange={(e) => setStudentForm({ ...studentForm, department: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Semester</Label>
                      <Select value={studentForm.semester} onValueChange={(value) => setStudentForm({ ...studentForm, semester: value })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={String(sem)}>Semester {sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={studentForm.phone} onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date of Birth</Label>
                      <Input type="date" value={studentForm.dob} onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={studentForm.address} onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={studentForm.bio} onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })} rows={3} />
                  </div>
                </>
              )}

              {user.role === 'faculty' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee ID</Label>
                      <Input value={facultyForm.employeeId} onChange={(e) => setFacultyForm({ ...facultyForm, employeeId: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={facultyForm.department} onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Designation</Label>
                      <Input value={facultyForm.designation} onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={facultyForm.phone} onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Specialization</Label>
                    <Input value={facultyForm.specialization} onChange={(e) => setFacultyForm({ ...facultyForm, specialization: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Qualifications</Label>
                    <Input value={facultyForm.qualifications} onChange={(e) => setFacultyForm({ ...facultyForm, qualifications: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={facultyForm.bio} onChange={(e) => setFacultyForm({ ...facultyForm, bio: e.target.value })} rows={3} />
                  </div>
                </>
              )}

              {user.role === 'college_admin' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Employee ID</Label>
                      <Input value={adminForm.employeeId} onChange={(e) => setAdminForm({ ...adminForm, employeeId: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Input value={adminForm.department} onChange={(e) => setAdminForm({ ...adminForm, department: e.target.value })} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Designation</Label>
                      <Input value={adminForm.designation} onChange={(e) => setAdminForm({ ...adminForm, designation: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={adminForm.phone} onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })} required />
                    </div>
                  </div>
                  <div>
                    <Label>Responsibilities</Label>
                    <Textarea value={adminForm.responsibilities} onChange={(e) => setAdminForm({ ...adminForm, responsibilities: e.target.value })} rows={3} required />
                  </div>
                  <div>
                    <Label>Bio</Label>
                    <Textarea value={adminForm.bio} onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })} rows={3} />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Profile
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
