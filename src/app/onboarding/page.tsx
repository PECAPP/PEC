 'use client';

import { useEffect, useActionState, useOptimistic } from 'react';
import type { ElementType } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
import { GraduationCap, Users, Building2, Loader2, CheckCircle2, Shield, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';
import { completeProfileStatefulAction } from './actions';

const roleIcons: Record<UserRole, ElementType> = {
  student: GraduationCap,
  faculty: Users,
  college_admin: Building2,
  admin: Shield,
  user: Users,
  moderator: ShieldAlert,
  placement_officer: Building2,
  recruiter: Users,
  super_admin: Shield,
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  college_admin: 'College Admin',
  admin: 'System Admin',
  user: 'Regular User',
  moderator: 'Moderator',
  placement_officer: 'Placement Officer',
  recruiter: 'Recruiter',
  super_admin: 'Super Admin',
};

const initialState = {
  success: false,
  error: null as string | null,
};

export default function Onboarding() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  
  // React 19 State handling
  const [state, formAction, isPending] = useActionState(completeProfileStatefulAction, initialState);

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

    if (user.profileComplete || state.success) {
      router.replace('/dashboard');
      return;
    }
  }, [authLoading, user, token, router, state.success]);

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success) {
      toast.success('Onboarding complete!');
      window.dispatchEvent(new Event('auth-change'));
    }
  }, [state]);

  if (authLoading || !user?.role) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">Preparing your application...</p>
        </div>
      </div>
    );
  }

  const RoleIcon = roleIcons[user.role];

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 animate-in fade-in duration-500">
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
            {/* Native Form with Server Action (Progressive Enhancement) */}
            <form action={formAction} className="space-y-4">
              <input type="hidden" name="role" value={user.role} />
              
              {user.role === 'student' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enrollmentNumber">Enrollment Number</Label>
                      <Input id="enrollmentNumber" name="enrollmentNumber" placeholder="PEC/2024/0001" required />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" placeholder="Computer Science" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="semester">Semester</Label>
                      <Select name="semester" defaultValue="1">
                        <SelectTrigger id="semester"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={String(sem)}>Semester {sem}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" placeholder="+91 XXXX XXXX" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dob">Date of Birth</Label>
                      <Input id="dob" name="dob" type="date" required />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" name="address" placeholder="123 Academic Way" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" rows={3} placeholder="Tell us about yourself..." />
                  </div>
                </>
              )}

              {user.role === 'faculty' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input id="employeeId" name="employeeId" required />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input id="designation" name="designation" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" name="specialization" required />
                  </div>
                  <div>
                    <Label htmlFor="qualifications">Qualifications</Label>
                    <Input id="qualifications" name="qualifications" required />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" rows={3} />
                  </div>
                </>
              )}

              {user.role === 'college_admin' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input id="employeeId" name="employeeId" required />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input id="department" name="department" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="designation">Designation</Label>
                      <Input id="designation" name="designation" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="responsibilities">Responsibilities</Label>
                    <Textarea id="responsibilities" name="responsibilities" rows={3} required />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea id="bio" name="bio" rows={3} />
                  </div>
                </>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Finalizing Profile...
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
