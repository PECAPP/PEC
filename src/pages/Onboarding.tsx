import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  GraduationCap,
  Users,
  Building2,
  Briefcase,
  UserCheck,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { UserRole } from '@/types';

interface StudentFormData {
  enrollmentNumber: string;
  department: string;
  semester: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  bio: string;
}

interface FacultyFormData {
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  specialization: string;
  qualifications: string;
  bio: string;
}

interface CollegeAdminFormData {
  employeeId: string;
  department: string;
  designation: string;
  phone: string;
  responsibilities: string;
  bio: string;
}

interface PlacementOfficerFormData {
  employeeId: string;
  phone: string;
  yearsOfExperience: string;
  specializations: string;
  bio: string;
}

interface RecruiterFormData {
  companyName: string;
  designation: string;
  phone: string;
  companyWebsite: string;
  focusAreas: string;
  bio: string;
}

const roleIcons: Record<UserRole, any> = {
  student: GraduationCap,
  faculty: Users,
  college_admin: Building2,
  placement_officer: Briefcase,
  recruiter: UserCheck,
  super_admin: Building2,
};

const roleLabels: Record<UserRole, string> = {
  student: 'Student',
  faculty: 'Faculty',
  college_admin: 'College Admin',
  placement_officer: 'Placement Officer',
  recruiter: 'Recruiter',
  super_admin: 'Super Admin',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  // Form data for each role
  const [studentForm, setStudentForm] = useState<StudentFormData>({
    enrollmentNumber: '',
    department: '',
    semester: '1',
    phone: '',
    dob: '',
    address: '',
    city: '',
    state: '',
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

  const [adminForm, setAdminForm] = useState<CollegeAdminFormData>({
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    responsibilities: '',
    bio: '',
  });

  const [placementForm, setPlacementForm] = useState<PlacementOfficerFormData>({
    employeeId: '',
    phone: '',
    yearsOfExperience: '',
    specializations: '',
    bio: '',
  });

  const [recruiterForm, setRecruiterForm] = useState<RecruiterFormData>({
    companyName: '',
    designation: '',
    phone: '',
    companyWebsite: '',
    focusAreas: '',
    bio: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      setUserId(user.uid);
      setUserEmail(user.email || '');

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();

        if (!userData) {
          navigate('/auth');
          return;
        }

        setUserName(userData.fullName || '');

        if (!userData.role || userData.role === null) {
          // No role selected, redirect to role selection
          navigate('/role-selection');
          return;
        }

        if (userData.profileComplete) {
          // Profile already complete, redirect to dashboard
          navigate('/dashboard');
          return;
        }

        // Set the user's role
        setUserRole(userData.role);
        setChecking(false);
      } catch (error) {
        console.error('Error checking user profile:', error);
        toast.error('Error loading profile. Please try again.');
        setChecking(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userRole) return;

    setLoading(true);

    try {
      // Save to users collection
      await updateDoc(doc(db, 'users', userId), {
        ...studentForm,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      // Save to studentProfiles collection
      await setDoc(doc(db, 'studentProfiles', userId), {
        uid: userId,
        email: userEmail,
        fullName: userName,
        ...studentForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error saving student profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userRole) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        ...facultyForm,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'facultyProfiles', userId), {
        uid: userId,
        email: userEmail,
        fullName: userName,
        ...facultyForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error saving faculty profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userRole) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        ...adminForm,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'collegeAdminProfiles', userId), {
        uid: userId,
        email: userEmail,
        fullName: userName,
        ...adminForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error saving admin profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handlePlacementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userRole) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        ...placementForm,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'placementOfficerProfiles', userId), {
        uid: userId,
        email: userEmail,
        fullName: userName,
        ...placementForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error saving placement officer profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userRole) return;

    setLoading(true);

    try {
      await updateDoc(doc(db, 'users', userId), {
        ...recruiterForm,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'recruiterProfiles', userId), {
        uid: userId,
        email: userEmail,
        fullName: userName,
        ...recruiterForm,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success('Profile completed successfully!');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error: any) {
      console.error('Error saving recruiter profile:', error);
      toast.error('Failed to save profile. Please try again.');
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  const RoleIcon = roleIcons[userRole];

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
          >
            <RoleIcon className="w-8 h-8 text-foreground" />
          </motion.div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Tell us more about yourself as a {roleLabels[userRole]}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Fill in the details below to complete your profile setup
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {userRole === 'student' && (
                <motion.form
                  key="student"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleStudentSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enrollmentNumber">
                        Enrollment Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="enrollmentNumber"
                        value={studentForm.enrollmentNumber}
                        onChange={(e) =>
                          setStudentForm({ ...studentForm, enrollmentNumber: e.target.value })
                        }
                        required
                        placeholder="e.g., 2024CS001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={studentForm.department}
                        onValueChange={(v) => setStudentForm({ ...studentForm, department: v })}
                        required
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="semester">
                        Semester <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={studentForm.semester}
                        onValueChange={(v) => setStudentForm({ ...studentForm, semester: v })}
                        required
                      >
                        <SelectTrigger id="semester">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dob">
                      Date of Birth <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="dob"
                      type="date"
                      value={studentForm.dob}
                      onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={studentForm.address}
                      onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      required
                      placeholder="Street address"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        value={studentForm.city}
                        onChange={(e) => setStudentForm({ ...studentForm, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        value={studentForm.state}
                        onChange={(e) => setStudentForm({ ...studentForm, state: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={studentForm.bio}
                      onChange={(e) => setStudentForm({ ...studentForm, bio: e.target.value })}
                      placeholder="Tell us about yourself, your interests, goals..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
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
                </motion.form>
              )}

              {userRole === 'faculty' && (
                <motion.form
                  key="faculty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleFacultySubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">
                        Employee ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="employeeId"
                        value={facultyForm.employeeId}
                        onChange={(e) =>
                          setFacultyForm({ ...facultyForm, employeeId: e.target.value })
                        }
                        required
                        placeholder="e.g., FAC2024001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={facultyForm.department}
                        onValueChange={(v) => setFacultyForm({ ...facultyForm, department: v })}
                        required
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electronics">Electronics</SelectItem>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Civil">Civil</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="designation">
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={facultyForm.designation}
                        onValueChange={(v) => setFacultyForm({ ...facultyForm, designation: v })}
                        required
                      >
                        <SelectTrigger id="designation">
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                          <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                          <SelectItem value="Lecturer">Lecturer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={facultyForm.phone}
                        onChange={(e) => setFacultyForm({ ...facultyForm, phone: e.target.value })}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="specialization">
                      Specialization <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="specialization"
                      value={facultyForm.specialization}
                      onChange={(e) =>
                        setFacultyForm({ ...facultyForm, specialization: e.target.value })
                      }
                      required
                      placeholder="e.g., Machine Learning, Data Structures"
                    />
                  </div>

                  <div>
                    <Label htmlFor="qualifications">
                      Qualifications <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="qualifications"
                      value={facultyForm.qualifications}
                      onChange={(e) =>
                        setFacultyForm({ ...facultyForm, qualifications: e.target.value })
                      }
                      required
                      placeholder="e.g., Ph.D. in Computer Science, M.Tech in AI"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={facultyForm.bio}
                      onChange={(e) => setFacultyForm({ ...facultyForm, bio: e.target.value })}
                      placeholder="Professional background, research interests..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
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
                </motion.form>
              )}

              {userRole === 'college_admin' && (
                <motion.form
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleAdminSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">
                        Employee ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="employeeId"
                        value={adminForm.employeeId}
                        onChange={(e) => setAdminForm({ ...adminForm, employeeId: e.target.value })}
                        required
                        placeholder="e.g., ADM2024001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">
                        Department <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={adminForm.department}
                        onValueChange={(v) => setAdminForm({ ...adminForm, department: v })}
                        required
                      >
                        <SelectTrigger id="department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Administration">Administration</SelectItem>
                          <SelectItem value="Academic Affairs">Academic Affairs</SelectItem>
                          <SelectItem value="Student Affairs">Student Affairs</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Human Resources">Human Resources</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="designation">
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={adminForm.designation}
                        onValueChange={(v) => setAdminForm({ ...adminForm, designation: v })}
                        required
                      >
                        <SelectTrigger id="designation">
                          <SelectValue placeholder="Select designation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Dean">Dean</SelectItem>
                          <SelectItem value="HOD">Head of Department</SelectItem>
                          <SelectItem value="Administrator">Administrator</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={adminForm.phone}
                        onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="responsibilities">
                      Responsibilities <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="responsibilities"
                      value={adminForm.responsibilities}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, responsibilities: e.target.value })
                      }
                      required
                      placeholder="Key responsibilities and areas of oversight..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={adminForm.bio}
                      onChange={(e) => setAdminForm({ ...adminForm, bio: e.target.value })}
                      placeholder="Professional background, experience..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
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
                </motion.form>
              )}

              {userRole === 'placement_officer' && (
                <motion.form
                  key="placement"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handlePlacementSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="employeeId">
                        Employee ID <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="employeeId"
                        value={placementForm.employeeId}
                        onChange={(e) =>
                          setPlacementForm({ ...placementForm, employeeId: e.target.value })
                        }
                        required
                        placeholder="e.g., PO2024001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={placementForm.phone}
                        onChange={(e) => setPlacementForm({ ...placementForm, phone: e.target.value })}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="yearsOfExperience">
                      Years of Experience <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={placementForm.yearsOfExperience}
                      onValueChange={(v) =>
                        setPlacementForm({ ...placementForm, yearsOfExperience: v })
                      }
                      required
                    >
                      <SelectTrigger id="yearsOfExperience">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-2">0-2 years</SelectItem>
                        <SelectItem value="3-5">3-5 years</SelectItem>
                        <SelectItem value="6-10">6-10 years</SelectItem>
                        <SelectItem value="10+">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="specializations">
                      Specializations <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="specializations"
                      value={placementForm.specializations}
                      onChange={(e) =>
                        setPlacementForm({ ...placementForm, specializations: e.target.value })
                      }
                      required
                      placeholder="e.g., Campus Recruitment, Industry Relations, Career Counseling"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={placementForm.bio}
                      onChange={(e) => setPlacementForm({ ...placementForm, bio: e.target.value })}
                      placeholder="Professional background, expertise..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
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
                </motion.form>
              )}

              {userRole === 'recruiter' && (
                <motion.form
                  key="recruiter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleRecruiterSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">
                        Company Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyName"
                        value={recruiterForm.companyName}
                        onChange={(e) =>
                          setRecruiterForm({ ...recruiterForm, companyName: e.target.value })
                        }
                        required
                        placeholder="e.g., Tech Corp Inc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="designation">
                        Designation <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="designation"
                        value={recruiterForm.designation}
                        onChange={(e) =>
                          setRecruiterForm({ ...recruiterForm, designation: e.target.value })
                        }
                        required
                        placeholder="e.g., Senior Recruiter"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">
                        Phone <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={recruiterForm.phone}
                        onChange={(e) => setRecruiterForm({ ...recruiterForm, phone: e.target.value })}
                        required
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyWebsite">
                        Company Website <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="companyWebsite"
                        type="url"
                        value={recruiterForm.companyWebsite}
                        onChange={(e) =>
                          setRecruiterForm({ ...recruiterForm, companyWebsite: e.target.value })
                        }
                        required
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="focusAreas">
                      Focus Areas <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="focusAreas"
                      value={recruiterForm.focusAreas}
                      onChange={(e) =>
                        setRecruiterForm({ ...recruiterForm, focusAreas: e.target.value })
                      }
                      required
                      placeholder="e.g., Software Engineering, Data Science, Cloud Computing"
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      value={recruiterForm.bio}
                      onChange={(e) => setRecruiterForm({ ...recruiterForm, bio: e.target.value })}
                      placeholder="About your company and recruitment process..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
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
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Your information is secure and will only be used for academic purposes
        </p>
      </motion.div>
    </div>
  );
}
