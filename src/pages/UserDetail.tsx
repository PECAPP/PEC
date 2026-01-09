import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Building2, Calendar, User, BookOpen, ClipboardCheck, FileText, Award } from 'lucide-react';
import { toast } from 'sonner';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch user
        const userDoc = await getDoc(doc(db, 'users', userId!));
        if (!userDoc.exists()) {
          toast.error('User not found');
          navigate('/users');
          return;
        }
        const userData = { id: userDoc.id, ...userDoc.data() };
        setUser(userData);

        // Fetch enrollments if student
        if (userData.role === 'student') {
          const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('studentId', '==', userId)
          );
          const enrollmentsSnap = await getDocs(enrollmentsQuery);
          const enrollmentsData = await Promise.all(
            enrollmentsSnap.docs.map(async (enrollDoc) => {
              const enrollment = { id: enrollDoc.id, ...enrollDoc.data() } as any;
              // Fetch course details
              const courseDoc = await getDoc(doc(db, 'courses', enrollment.courseId));
              return {
                ...enrollment,
                courseName: courseDoc.data()?.name,
                courseCode: courseDoc.data()?.code,
              };
            })
          );
          setEnrollments(enrollmentsData);

          // Fetch grades
          const gradesQuery = query(
            collection(db, 'grades'),
            where('studentId', '==', userId)
          );
          const gradesSnap = await getDocs(gradesQuery);
          const gradesData = await Promise.all(
            gradesSnap.docs.map(async (gradeDoc) => {
              const grade = { id: gradeDoc.id, ...gradeDoc.data() } as any;
              const courseDoc = await getDoc(doc(db, 'courses', grade.courseId));
              return {
                ...grade,
                courseName: courseDoc.data()?.name,
                courseCode: courseDoc.data()?.code,
              };
            })
          );
          setGrades(gradesData);

          // Fetch attendance
          const attendanceQuery = query(
            collection(db, 'attendance'),
            where('studentId', '==', userId)
          );
          const attendanceSnap = await getDocs(attendanceQuery);
          setAttendance(attendanceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

          // Fetch assignments (submitted)
          const assignmentsQuery = query(
            collection(db, 'submissions'),
            where('studentId', '==', userId)
          );
          const assignmentsSnap = await getDocs(assignmentsQuery);
          setAssignments(assignmentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'destructive';
      case 'college_admin': return 'default';
      case 'faculty': return 'secondary';
      case 'student': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Handle Firestore Timestamp
    if (date?.seconds) {
      return new Date(date.seconds * 1000).toLocaleDateString();
    }
    // Handle Date object or string
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/users')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{user.fullName}</h1>
            <p className="text-muted-foreground mt-1">Complete user profile</p>
          </div>
        </div>
        <Badge variant={getRoleBadgeColor(user.role)} className="text-sm px-3 py-1">
          {user.role?.replace('_', ' ').toUpperCase()}
        </Badge>
      </div>

      {/* Main Info Card */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Full Name</label>
              <p className="text-foreground font-medium">{user.fullName}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-foreground">{user.email}</p>
            </div>
            {user.phone && (
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="text-foreground">{user.phone}</p>
              </div>
            )}
            {user.dateOfBirth && (
              <div>
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date of Birth
                </label>
                <p className="text-foreground">{formatDate(user.dateOfBirth)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-elevated p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Academic Information
          </h2>
          <div className="space-y-3">
            {user.department && (
              <div>
                <label className="text-sm text-muted-foreground">Department</label>
                <p 
                  className="text-foreground font-medium cursor-pointer hover:text-primary transition-colors hover:underline"
                  onClick={() => navigate('/departments')}
                  title="View Departments"
                >
                  {user.department}
                </p>
              </div>
            )}
            {user.enrollmentNumber && (
              <div>
                <label className="text-sm text-muted-foreground">Enrollment Number</label>
                <p className="text-foreground font-mono">{user.enrollmentNumber}</p>
              </div>
            )}
            {user.semester && (
              <div>
                <label className="text-sm text-muted-foreground">Current Semester</label>
                <p className="text-foreground">{user.semester}</p>
              </div>
            )}
            {user.batch && (
              <div>
                <label className="text-sm text-muted-foreground">Batch</label>
                <p className="text-foreground">{user.batch}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-muted-foreground">Account Status</label>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                {user.status || 'active'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      {user.role === 'faculty' && (
        <div className="card-elevated p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Faculty Details</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {user.designation && (
              <div>
                <label className="text-sm text-muted-foreground">Designation</label>
                <p className="text-foreground">{user.designation}</p>
              </div>
            )}
            {user.specialization && (
              <div>
                <label className="text-sm text-muted-foreground">Specialization</label>
                <p className="text-foreground">{user.specialization}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Student Academic Data */}
      {user.role === 'student' && (
        <>
          {/* Enrolled Courses */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Enrolled Courses ({enrollments.length})
            </h2>
            {enrollments.length > 0 ? (
              <div className="grid gap-3">
                {enrollments.map((enrollment) => (
                  <div 
                    key={enrollment.id} 
                    className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/20 transition-colors"
                    onClick={() => navigate(`/courses/${enrollment.courseId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground hover:text-primary transition-colors group-hover:underline">
                          {enrollment.courseCode}
                        </p>
                        <p className="text-sm text-muted-foreground">{enrollment.courseName}</p>
                      </div>
                      <Badge variant={enrollment.status === 'active' ? 'default' : 'secondary'}>
                        {enrollment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No enrollments found</p>
            )}
          </div>

          {/* Grades */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Grades & Results ({grades.length})
            </h2>
            {grades.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Course</th>
                      <th className="text-left p-3 text-sm font-medium text-muted-foreground">Semester</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Grade</th>
                      <th className="text-center p-3 text-sm font-medium text-muted-foreground">Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {grades.map((grade) => (
                      <tr key={grade.id}>
                        <td className="p-3">
                          <p className="font-medium text-foreground">{grade.courseCode}</p>
                          <p className="text-sm text-muted-foreground">{grade.courseName}</p>
                        </td>
                        <td className="p-3 text-muted-foreground">{grade.semester}</td>
                        <td className="p-3 text-center">
                          <Badge variant="default">{grade.grade}</Badge>
                        </td>
                        <td className="p-3 text-center text-foreground font-medium">
                          {grade.marks || grade.totalMarks}/100
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No grades recorded yet</p>
            )}
          </div>

          {/* Attendance Summary */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5" />
              Attendance Records ({attendance.length})
            </h2>
            {attendance.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Present</p>
                    <p className="text-2xl font-bold text-green-500">
                      {attendance.filter(a => a.status === 'present').length}
                    </p>
                  </div>
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Absent</p>
                    <p className="text-2xl font-bold text-red-500">
                      {attendance.filter(a => a.status === 'absent').length}
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Attendance %</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {((attendance.filter(a => a.status === 'present').length / attendance.length) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No attendance records</p>
            )}
          </div>

          {/* Assignments */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Assignment Submissions ({assignments.length})
            </h2>
            {assignments.length > 0 ? (
              <div className="grid gap-3">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{assignment.assignmentTitle || 'Assignment'}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {formatDate(assignment.submittedAt)}
                        </p>
                      </div>
                      <Badge variant={assignment.status === 'graded' ? 'default' : 'secondary'}>
                        {assignment.status || 'submitted'}
                      </Badge>
                    </div>
                    {assignment.marks && (
                      <p className="mt-2 text-sm text-foreground">
                        Score: {assignment.marks}/{assignment.totalMarks || 100}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No assignments submitted</p>
            )}
          </div>
        </>
      )}

      {/* Metadata */}
      <div className="card-elevated p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">System Information</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID:</span>
            <span className="text-foreground font-mono">{user.id}</span>
          </div>
          {user.createdAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="text-foreground">
                {formatDate(user.createdAt)}
              </span>
            </div>
          )}
          {user.updatedAt && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="text-foreground">
                {formatDate(user.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
