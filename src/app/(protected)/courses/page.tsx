import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { CourseDirectory } from './components/CourseDirectory';
import { CourseManagement } from './components/CourseManagement';
import { serverFetch } from '@/lib/server-data';

export const metadata = {
  title: 'Courses | OmniFlow',
  description: 'Academic course directory and enrollment management.',
};

export default async function CoursesPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  // Fetch initial data on server
  const [courses, enrolledIds, profile] = await Promise.all([
    serverFetch('/courses?limit=100'),
    session.role === 'student' ? serverFetch(`/enrollments?studentId=${session.uid}&status=active`) : Promise.resolve([]),
    session.role === 'student' ? serverFetch('/auth/profile') : Promise.resolve(null),
  ]);

  const sanitizedCourses = (courses || []).map((c: any) => ({
    ...c,
    facultyName: c.instructor || c.facultyName || 'TBA',
    maxStudents: Number(c.maxStudents || 60),
    enrolledStudents: Number(c._count?.enrollments ?? c.enrolledStudents ?? 0),
    description: c.description || '',
  }));

  const sanitizedEnrolledIds = (enrolledIds || []).map((e: any) => e.courseId);

  if (session.role === 'student') {
    return (
      <div className="space-y-6 md:space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Directory</h1>
          <p className="text-muted-foreground mt-2 font-medium">Browse and enroll in available courses</p>
        </div>
        <CourseDirectory 
          initialCourses={sanitizedCourses} 
          initialEnrolledIds={sanitizedEnrolledIds} 
          user={session}
          studentProfile={profile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
       <div>
         <h1 className="text-3xl font-bold tracking-tight text-foreground">Course Management</h1>
         <p className="text-muted-foreground mt-2 font-medium">Administrate campus academic catalogue</p>
       </div>
       <CourseManagement 
         initialCourses={sanitizedCourses} 
         user={session}
       />
    </div>
  );
}
