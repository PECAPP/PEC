'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, Database, ShieldCheck, Loader2, Users, Calendar as CalendarIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';
import PDFExportButton from '@/components/common/PDFExportButton';
import BulkUpload from '@/components/BulkUpload';
import { markBulkAttendanceAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllPages } from '@/lib/fetchAllPages';

export default function AttendanceManager({ userId, userRole, initialData }: any) {
  const [courses, setCourses] = useState<any[]>(initialData?.courses || []);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = ['college_admin', 'super_admin'].includes(userRole);

  const { execute: executeBulk, isPending: isSaving } = useAction(markBulkAttendanceAction, {
    onSuccess: () => {
      toast.success('Attendance records updated successfully.');
      fetchStudentAttendance();
    },
    onError: ({ error }) => toast.error(error.serverError || 'Failed to update records.'),
  });

  useEffect(() => {
    if (!initialData?.courses || initialData.courses.length === 0) fetchCourses();
  }, [userId, userRole]);

  useEffect(() => {
    if (selectedCourse && selectedDate) fetchStudentAttendance();
    else setStudents([]);
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    let data: any[] = [];
    if (isAdmin) {
      const response = await api.get<any>('/courses', { params: { limit: 200 } });
      data = extractData<any[]>(response) || [];
    } else {
      const response = await api.get<any>('/courses', { params: { facultyId: userId, limit: 200 } });
      data = extractData<any[]>(response) || [];
      if (!data.length) {
        let facultyName = '';
        try {
          const profileRes = await api.get<any>('/auth/profile');
          facultyName = profileRes?.data?.data?.fullName || profileRes?.data?.data?.name || profileRes?.data?.fullName || profileRes?.data?.name || '';
        } catch {
          facultyName = '';
        }
        const fallback = await api.get<any>('/courses', { params: { limit: 200 } });
        const allCourses = extractData<any[]>(fallback) || [];
        const name = facultyName.toLowerCase();
        data = allCourses.filter((c: any) => {
          if (c.facultyId === userId || c.instructorId === userId) return true;
          if (!name) return false;
          const instructor = String(c.instructor || c.facultyName || c.instructorName || '').toLowerCase();
          return instructor.includes(name);
        });
      }
    }
    setCourses(data);
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const course = courses.find((c) => c.id === selectedCourse);
      const subjectId = course?.id || selectedCourse;

      const [enrollRes, usersRes, attRes] = await Promise.all([
        api.get<any>('/enrollments', { params: { courseId: selectedCourse, status: 'active', limit: 200 } }),
        fetchAllPages<any>('/users', { role: 'student' }, 200),
        api.get<any>('/attendance', { params: { subject: subjectId, date: selectedDate } })
      ]);

      const enrolled = extractData<any[]>(enrollRes) || [];
      const allUsers = Array.isArray(usersRes) ? usersRes : [];
      const records = extractData<any[]>(attRes) || [];
      
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
      const recordMap = new Map(records.map((r: any) => [r.studentId, r]));

      setStudents(enrolled.map(en => {
        const u = userMap.get(en.studentId);
        const r = recordMap.get(en.studentId);
        return {
          id: en.studentId,
          name: u?.fullName || 'Unknown Student',
          email: u?.email || '',
          recordId: r?.id,
          status: r?.status || null
        };
      }));
    } catch (e) {
      toast.error('Failed to load student list.');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (id: string, status: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSave = () => {
    const records = students
      .filter(s => s.status)
      .map(s => ({
        id: s.recordId,
        studentId: s.id,
        subject: selectedCourse,
        date: selectedDate,
        status: s.status as 'present' | 'absent' | 'late'
      }));
    
    if (records.length === 0) return toast.info('No changes to save.');
    executeBulk({ records });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Management</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Verify and update student presence for specific courses</p>
        </div>
        <div className="flex gap-2">
          <PDFExportButton 
            onExport={async () => {
              if (!selectedCourse) {
                toast.error('Please select a course.');
                return;
              }
              const { exportAttendanceReport } = await import('@/lib/pdfExport');
              const course = courses.find(c => c.id === selectedCourse);
              exportAttendanceReport(course?.name || 'Attendance_Report', students, { start: selectedDate, end: selectedDate });
            }} 
            label="Export Report"
          />
          <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-9 px-4 font-bold text-xs">
            <Upload className="w-4 h-4 mr-2" /> Import Data
          </Button>
        </div>
      </div>

      <div className="card-elevated p-6 space-y-6 bg-card/50">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <Database className="w-3 h-3 text-primary" /> Select Course
            </label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-11 font-medium text-sm bg-muted/20 border-border/60">
                <SelectValue placeholder="Chose course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-medium py-2">
                    <span className="font-bold text-primary mr-2">[{c.code}]</span> {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
              <CalendarIcon className="w-3 h-3 text-primary" /> Select Date
            </label>
            <Input 
              type="date" 
              className="h-11 bg-muted/20 border-border/60 font-mono font-bold text-center"
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedCourse ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-6 border-t border-border/60">
              {loading ? <LoadingGrid count={5} /> : (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">Enrolled Students ({students.length})</span>
                  </div>
                  
                  <div className="border border-border/60 rounded-lg overflow-hidden bg-card/50 shadow-sm">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border/60">
                          <th className="py-3 px-6 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Student Name</th>
                          <th className="py-3 px-6 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {students.map(s => (
                          <tr key={s.id} className="hover:bg-muted/10 transition-colors">
                            <td className="py-3 px-6 text-sm">
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground uppercase">{s.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono opacity-70">{s.email}</span>
                              </div>
                            </td>
                            <td className="py-3 px-6">
                               <div className="flex justify-center gap-2">
                                  {['present', 'absent', 'late'].map((status: any) => (
                                    <Button
                                      key={status}
                                      size="sm"
                                      variant={s.status === status ? 'default' : 'outline'}
                                      className={`text-[10px] font-bold uppercase tracking-wider px-4 h-8 transition-all
                                        ${s.status === status 
                                          ? (status === 'present' ? 'bg-success hover:bg-success/90' : status === 'absent' ? 'bg-destructive hover:bg-destructive/90' : 'bg-warning hover:bg-warning/90')
                                          : 'hover:border-primary/50'
                                        }`}
                                      onClick={() => handleMark(s.id, status)}
                                    >
                                      {status}
                                    </Button>
                                  ))}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground font-bold tracking-wider uppercase text-xs h-11 px-10"
                    >
                       {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                       Save Attendance
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="py-16 text-center border border-dashed border-border/40 rounded-lg bg-muted/5">
              <p className="text-muted-foreground font-medium italic text-sm">Select a course to view and update student attendance.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl bg-card border-border/60">
           <div className="flex flex-col space-y-4">
             <div className="space-y-1">
                <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" /> Bulk Attendance Import
                </h2>
                <p className="text-xs text-muted-foreground">Upload a CSV or Excel file to update multiple records at once</p>
             </div>
             <BulkUpload 
               entityType="attendance" 
               onImport={null as any} 
               templateColumns={['studentEmail', 'courseCode', 'date', 'status']} 
               sampleData={[{ studentEmail: 'student@college.edu', courseCode: 'CS101', date: '2024-03-31', status: 'present' }]} 
             />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
