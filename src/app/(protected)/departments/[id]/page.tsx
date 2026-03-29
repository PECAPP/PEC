'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
;
import {
  ArrowLeft,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Mail,
  Phone,
  Building2,
  Calendar,
  Search,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs } from '@/lib/dataClient';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function DepartmentDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState<any>(null);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const [timetable, setTimetable] = useState<any[]>([]);

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const TIME_SLOTS_DATA = [
    { id: '08:00-09:00', label: '08:00 AM' },
    { id: '09:00-10:00', label: '09:00 AM' },
    { id: '10:00-11:00', label: '10:00 AM' },
    { id: '11:00-12:00', label: '11:00 AM' },
    { id: '12:00-13:00', label: '12:00 PM' },
    { id: '13:00-14:00', label: '01:00 PM' }, // LUNCH
    { id: '14:00-15:00', label: '02:00 PM' },
    { id: '15:00-16:00', label: '03:00 PM' },
    { id: '16:00-17:00', label: '04:00 PM' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        // Fetch department details
        const deptDoc = await getDoc(doc(({} as any), 'departments', id));
        if (!deptDoc.exists()) {
          toast.error('Department not found');
          router.push('/departments');
          return;
        }
        const deptData = { id: deptDoc.id, ...(deptDoc.data() as any) };
        setDepartment(deptData);

        const departmentName = deptData.name;

        // Fetch faculty members
        const facultyQuery = query(
          collection(({} as any), 'users'),
          where('role', '==', 'faculty'),
          where('department', '==', departmentName)
        );
        const facultySnap = await getDocs(facultyQuery);
        setFaculty(facultySnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));

        // Fetch students
        const studentsQuery = query(
          collection(({} as any), 'users'),
          where('role', '==', 'student'),
          where('department', '==', departmentName)
        );
        const studentsSnap = await getDocs(studentsQuery);
        setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));

        // Fetch courses
        const coursesQuery = query(
          collection(({} as any), 'courses'),
          where('department', '==', departmentName)
        );
        const coursesSnap = await getDocs(coursesQuery);
        setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) })));

        // Fetch timetable
        const timetableQuery = query(
          collection(({} as any), 'timetable'),
          where('department', '==', departmentName)
        );
        const timetableSnap = await getDocs(timetableQuery);
        const slots = timetableSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        setTimetable(slots);

      } catch (error) {
        console.error('Error fetching department details:', error);
        toast.error('Failed to load department statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const getSlotsContent = (day: string, timeId: string) => {
    return timetable.filter(s => s.day === day && s.timeSlot === timeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!department) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/departments">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {department.code}
              </Badge>
              <h1 className="text-3xl font-bold text-foreground">{department.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1 max-w-2xl">{department.description}</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elevated p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
          <div className="p-3 rounded-xl bg-primary/10">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{students.length}</p>
            <p className="text-sm text-muted-foreground font-medium">Active Students</p>
          </div>
        </div>
        <div className="card-elevated p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
          <div className="p-3 rounded-xl bg-accent/10">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{faculty.length}</p>
            <p className="text-sm text-muted-foreground font-medium">Faculty Members</p>
          </div>
        </div>
        <div className="card-elevated p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
          <div className="p-3 rounded-xl bg-success/10">
            <BookOpen className="w-8 h-8 text-success" />
          </div>
          <div>
            <p className="text-3xl font-bold text-foreground">{courses.length}</p>
            <p className="text-sm text-muted-foreground font-medium">Total Courses</p>
          </div>
        </div>
      </div>

      {/* Dynamic Timetable Section */}
      <div className="card-elevated p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Departmental Schedule
          </h2>
          <Link href="/timetable">
            <Button variant="outline" size="sm">Manage Full Timetable</Button>
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 bg-muted/30 border border-border text-sm font-semibold text-muted-foreground w-32">Time / Day</th>
                {DAYS.map(day => (
                  <th key={day} className="p-3 bg-muted/30 border border-border text-sm font-semibold text-muted-foreground px-4 text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS_DATA.map(timeObj => (
                <tr key={timeObj.id}>
                  <td className="p-3 bg-muted/10 border border-border text-xs font-bold text-center text-primary">
                    {timeObj.label}
                  </td>
                  {DAYS.map(day => {
                    const isLunch = timeObj.id === '13:00-14:00';
                    const slots = getSlotsContent(day, timeObj.id);

                    if (isLunch) {
                      return (
                        <td key={`${day}-${timeObj.id}`} className="p-2 border border-border bg-muted/20 text-center align-middle">
                          {day === 'Wednesday' && (
                            <span className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground/40 font-mono">Lunch Break</span>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={`${day}-${timeObj.id}`} className="p-2 border border-border min-h-[100px] align-top">
                        <div className="space-y-1.5">
                          {slots.length > 0 ? (
                            slots.map((slot, idx) => (
                              <div 
                                key={idx}
                                className="p-2 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer group shadow-sm"
                                onClick={() => router.push(`/courses/${slot.courseId}`)}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-[10px] font-bold text-primary truncate group-hover:underline">
                                    {slot.courseCode}
                                  </p>
                                  <Badge variant="outline" className="px-1 py-0 text-[8px] h-3.5 font-mono border-primary/20 text-primary/60">
                                    S{slot.semester}
                                  </Badge>
                                </div>
                                <p className="text-[10px] font-medium text-foreground line-clamp-1 mt-0.5">
                                  {slot.courseName}
                                </p>
                                <div className="flex items-center justify-between mt-1 text-[9px] text-muted-foreground font-medium">
                                  <span className="truncate max-w-[60px]">{slot.facultyName}</span>
                                  <span className="font-mono text-primary/70">{slot.room}</span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="h-full min-h-[60px] flex items-center justify-center opacity-20">
                              <span className="text-[10px] text-muted-foreground font-medium tracking-tighter">---</span>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leadership Section */}
        <div className="card-elevated p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-accent" />
            Leadership
          </h2>
          <div className="p-5 border border-border rounded-2xl bg-gradient-to-br from-primary/5 to-transparent">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {department.hod?.split(' ').map((n: string) => n[0]).join('') || 'H'}
                </span>
              </div>
              <div>
                <p className="font-extrabold text-xl text-foreground tracking-tight">{department.hod || 'Acting HOD'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="px-2 py-0">Head of Department</Badge>
                  <p className="text-xs text-muted-foreground font-medium">Joined 2021</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
               <Button variant="secondary" size="sm" className="w-full gap-2">
                 <Mail className="w-3.5 h-3.5" /> Contact
               </Button>
               <Button variant="outline" size="sm" className="w-full gap-2">
                 <Phone className="w-3.5 h-3.5" /> Schedule Call
               </Button>
            </div>
          </div>
        </div>

        {/* Courses List Section */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-success" />
              Academic Courses
            </h2>
            <Link href="/courses">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-primary">Browse All</Button>
            </Link>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div 
                  key={course.id} 
                  className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all duration-300 group shadow-sm bg-card"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center font-bold text-success text-xs border border-success/20">
                      {course.code.slice(-3)}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{course.code}</p>
                      <p className="text-xs text-muted-foreground font-medium mt-0.5">{course.name}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-[10px] font-mono px-2">{course.credits} Cr</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/10 rounded-xl">
                 <Search className="w-8 h-8 opacity-20 mb-2" />
                 <p className="text-sm font-medium">No courses found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Roster */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-accent" />
              Faculty Members
            </h2>
            <Link href="/faculty">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-accent">Full Directory</Button>
            </Link>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {faculty.length > 0 ? (
              faculty.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 hover:bg-accent/5 hover:border-accent/30 cursor-pointer transition-all shadow-sm"
                  onClick={() => router.push(`/users/${member.id}`)}
                >
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/20">
                    <span className="text-sm font-black text-accent">
                      {member.fullName?.split(' ').map((n: string) => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base text-foreground transition-colors group-hover:text-accent">{member.fullName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground font-medium">{member.designation || member.role}</p>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/30"></span>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{member.employeeId || 'ID Pending'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-10 bg-muted/10 rounded-xl font-medium">No faculty specialized in this area</p>
            )}
          </div>
        </div>

        {/* Student Enrollment */}
        <div className="card-elevated p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Student Base
            </h2>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {students.length > 0 ? (
              students.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-card border border-border/50 hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all shadow-sm"
                  onClick={() => router.push(`/users/${student.id}`)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                      <span className="text-sm font-black text-primary">
                        {student.fullName?.split(' ').map((n: string) => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-base text-foreground">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{student.enrollmentNumber || student.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="px-2 py-0 text-[10px] uppercase font-black bg-primary/20 text-primary border-none">Sem {student.semester || 'N/A'}</Badge>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">BATCH 2025</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-2xl">
                 <Search className="w-10 h-10 opacity-10 mb-3" />
                 <p className="text-sm font-bold">No active enrollments for this session</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
