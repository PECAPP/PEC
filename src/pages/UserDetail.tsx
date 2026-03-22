import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Mail, Phone, Building2, Calendar, User, BookOpen, ClipboardCheck, Award, CreditCard, Receipt, Wrench, ShieldAlert, UtensilsCrossed, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [hostelIssues, setHostelIssues] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [canteenOrders, setCanteenOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (!userId) {
          navigate('/users');
          return;
        }

        type ApiResponse<T> = { success: boolean; data: T; meta?: any };

        const userResponse = await api.get(`/users/${userId}`);
        const userData = userResponse.data?.success ? userResponse.data.data : userResponse.data;

        if (!userData) {
          toast.error('User not found');
          navigate('/users');
          return;
        }

        setUser(userData);
        setProfileData(userData);

        if (userData.role === 'student') {
          const [
            enrollmentsResult,
            gradesResult,
            attendanceResult,
            coursesResult,
          ] = await Promise.all([
            api.get<ApiResponse<any[]>>('/enrollments', {
              params: { limit: 200, offset: 0, studentId: userId },
            }),
            api.get<ApiResponse<any[]>>('/examinations/grades', {
              params: { limit: 200, offset: 0, studentId: userId },
            }),
            api.get<ApiResponse<any[]>>('/attendance', {
              params: { limit: 200, offset: 0, studentId: userId },
            }),
            api.get<ApiResponse<any[]>>('/courses', {
              params: { limit: 200, offset: 0 },
            }),
          ]);

          const enrollmentsData = enrollmentsResult.data.data || [];
          const gradesRaw = gradesResult.data.data || [];
          const attendanceData = attendanceResult.data.data || [];
          const courses = coursesResult.data.data || [];

          const courseMap = new Map(courses.map((course: any) => [course.id, course]));
          const gradesData = gradesRaw.map((grade: any) => {
            const course = courseMap.get(grade.courseId);
            return {
              ...grade,
              courseName: grade.courseName || course?.name || 'Unknown Course',
              courseCode: grade.courseCode || course?.code || 'N/A',
            };
          });

          setEnrollments(enrollmentsData);
          setGrades(gradesData);
          setAttendance(attendanceData);
          setPayments([]);
          setHostelIssues([]);
          setCanteenOrders([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId, navigate]);

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
      case 'college_admin': return 'default';
      case 'faculty': return 'secondary';
      case 'student': return 'outline';
      default: return 'default';
    }
  };

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    // Handle backend timestamp shape
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
            {(user.department || profileData?.department) && (
              <div>
                <label className="text-sm text-muted-foreground">Department</label>
                <p 
                  className="text-foreground font-medium cursor-pointer hover:text-primary transition-colors hover:underline"
                  onClick={() => navigate('/departments')}
                  title="View Departments"
                >
                  {user.department || profileData?.department}
                </p>
              </div>
            )}
            {(user.enrollmentNumber || profileData?.enrollmentNumber || profileData?.employeeId) && (
              <div>
                <label className="text-sm text-muted-foreground">
                  {user.role === 'student' ? 'Enrollment Number' : 'Employee ID'}
                </label>
                <p className="text-foreground font-mono">
                  {user.enrollmentNumber || profileData?.enrollmentNumber || profileData?.employeeId}
                </p>
              </div>
            )}
            {(user.semester || profileData?.semester) && (
              <div>
                <label className="text-sm text-muted-foreground">Current Semester</label>
                <p className="text-foreground">{user.semester || profileData?.semester}</p>
              </div>
            )}
            {(user.batch || profileData?.batch) && (
              <div>
                <label className="text-sm text-muted-foreground">Batch</label>
                <p className="text-foreground">{user.batch || profileData?.batch}</p>
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

        </>
      )}

      {/* Financial Records */}
      {user.role === 'student' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            Financial Records & Fees
          </h2>
          {payments.length > 0 ? (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Receipt className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{payment.title || 'Fee Payment'}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(payment.paidAt || payment.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">₹{payment.amount}</p>
                    <Badge variant={payment.status === 'success' || payment.status === 'paid' ? 'default' : 'secondary'}>
                      {payment.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg flex flex-col items-center">
              <Receipt className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">No financial records found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Hostel Issues */}
      {user.role === 'student' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Hostel Maintenance Issues
          </h2>
          {hostelIssues.length > 0 ? (
            <div className="space-y-3">
              {hostelIssues.map((issue) => (
                <div 
                  key={issue.id} 
                  className="group p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/10 transition-all"
                  onClick={() => navigate('/admin/hostel')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{issue.title}</p>
                        <p className="text-sm text-muted-foreground">Category: {issue.category}</p>
                      </div>
                    </div>
                    <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                      {issue.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 pl-9">Reported: {formatDate(issue.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg flex flex-col items-center">
              <ShieldAlert className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">No hostel issues reported</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Canteen Orders */}
      {user.role === 'student' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-elevated p-6"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            Canteen Orders ({canteenOrders.length})
          </h2>
          {canteenOrders.length > 0 ? (
            <div className="space-y-3">
              {canteenOrders.map((order) => (
                <div key={order.id} className="p-4 border border-border rounded-lg flex items-center justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 rounded-full bg-orange-500/10">
                      <UtensilsCrossed className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Order #{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{order.items?.length || 0} items • ₹{order.total}</p>
                    </div>
                  </div>
                  <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                    {order.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-muted/20 rounded-lg flex flex-col items-center">
              <UtensilsCrossed className="w-10 h-10 text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground">No canteen orders found</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Metadata */}
      <div className="card-elevated p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">System Information</h2>
        <div className="grid gap-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
            <span className="text-muted-foreground">User ID:</span>
            <span className="text-foreground font-mono break-all">{user.id}</span>
          </div>
          {user.createdAt && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
              <span className="text-muted-foreground">Account Created:</span>
              <span className="text-foreground">
                {formatDate(user.createdAt)}
              </span>
            </div>
          )}
          {user.updatedAt && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4">
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
