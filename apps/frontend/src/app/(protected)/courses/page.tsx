import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { CourseDirectory } from './components/CourseDirectory';
import { CourseManagement } from './components/CourseManagement';
import { serverFetch } from '@/lib/server-data';
import { BookOpen, Settings } from 'lucide-react';
import { PageBanner } from '@pec/ui';

export const metadata = {
  title: 'Academic Catalog | PEC APP',
  description: 'Institutional course directory and enrollment management services.',
};

export default async function CoursesPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  // Fetch role-specific initial data on server.
  const profile = await serverFetch('/auth/profile');

  let courses: any[] = [];
  if (session.role === 'faculty') {
    const scoped = await serverFetch(`/courses?facultyId=${session.uid}&limit=200`);
    courses = Array.isArray(scoped) ? scoped : [];

    if (!courses.length) {
      const allCourses = await serverFetch('/courses?limit=200');
      const facultyName = String(
        profile?.fullName || profile?.name || session.fullName || ''
      ).toLowerCase();
      const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];
      courses = safeAllCourses.filter((course: any) => {
        if (course.facultyId === session.uid || course.instructorId === session.uid) {
          return true;
        }
        if (!facultyName) return false;
        const instructor = String(
          course.instructor || course.facultyName || course.instructorName || ''
        ).toLowerCase();
        return instructor.includes(facultyName);
      });
    }
  } else {
    const fetched = await serverFetch('/courses?limit=100');
    courses = Array.isArray(fetched) ? fetched : [];
  }

  const enrollments =
    session.role === 'student'
      ? await serverFetch(`/enrollments?studentId=${session.uid}&status=active`)
      : [];

  const sanitizedCourses = (courses || []).map((c: any) => ({
    ...c,
    facultyName: c.instructor || c.facultyName || 'TBA',
    maxStudents: Number(c.maxStudents || 60),
    enrolledStudents: Number(c._count?.enrollments ?? c.enrolledStudents ?? 0),
    description: c.description || '',
  }));

  const sanitizedEnrollments = Array.isArray(enrollments) ? enrollments : [];
  const sanitizedEnrolledIds = sanitizedEnrollments.map((e: any) => e.courseId);
  const initialEnrolledCourses = sanitizedEnrollments
    .map((e: any) => {
      const c = e?.course;
      if (!c) return null;
      return {
        id: c.id,
        code: c.code || 'COURSE',
        name: c.name || 'Course',
        department: c.department || 'General',
        semester: Number(c.semester || 0),
        credits: Number(c.credits || 0),
        facultyName: c.instructor || 'TBA',
        instructor: c.instructor || 'TBA',
        maxStudents: 0,
        enrolledStudents: 0,
        description: '',
        type: 'Core',
      };
    })
    .filter(Boolean);

  return (
    <div className="animate-in fade-in duration-500 min-h-screen relative">
      {/* Decorative Atmosphere Layer */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute inset-0  opacity-[0.03]" />
        <div className="absolute top-[-5%] right-[-5%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] blur-[80px]" />
      </div>

      {session.role === 'student' ? (
        <div className="space-y-10 pb-20">
          <div className="mb-6">
            <PageBanner
              title="Course Directory"
              subtitle="Explore and enroll in the institutional academic catalog"
              badgeText="Academics"
              icon={<BookOpen className="w-7 h-7 text-primary" />}
            />
          </div>
          
          <CourseDirectory 
            initialCourses={sanitizedCourses} 
            initialEnrolledIds={sanitizedEnrolledIds} 
            initialEnrolledCourses={initialEnrolledCourses as any}
            user={session}
            studentProfile={profile}
          />
        </div>
      ) : (
        <div className="space-y-10">
          <div className="mb-6">
            <PageBanner
              title="Course Management"
              subtitle="Manage institutional academic offerings and infrastructure"
              badgeText="Academics"
              icon={<Settings className="w-7 h-7 text-primary" />}
            />
          </div>
          
          <CourseManagement 
            initialCourses={sanitizedCourses} 
            _user={session}
          />
        </div>
      )}
    </div>
  );
}
